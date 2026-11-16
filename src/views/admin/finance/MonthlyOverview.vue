<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  listMonthlyExpenses, populateMonth, deleteExpense, updateExpense,
  listAdditionalIncome, deleteAdditionalIncome,
  getMonthStatus, getMonthlyVRRevenue, getCumulativeFinanceThroughMonth, closeMonth, reopenMonth,
  recalculateSalaries,
} from '@/services/financeService'
import { formatPrice, formatInstantDate } from '@/utils/format'
import { monthStartOf } from '@/utils/date'
import { financeTotals } from '@/utils/finance'
import { toast } from 'vue-sonner'
import { useConfirm } from '@/composables/useConfirm'

defineOptions({ name: 'MonthlyOverview' })

const route = useRoute()
const router = useRouter()
const { user, isAdmin } = useAuth()

// Month state
const currentMonth = ref(route.query.month || monthStartOf(new Date()))

const expenses = ref([])
const income = ref([])
const vrRevenue = ref(0)
const monthStatus = ref(null)
const loading = ref(true)
const populating = ref(false)
const closing = ref(false)
const showCloseConfirm = ref(false)
const preparingClose = ref(false)
const salariesChanged = ref(0)
// Tap-to-edit amount sheet
const editingExpense = ref(null)
const editAmount = ref('')
const editError = ref('')
const savingAmount = ref(false)
const { confirm } = useConfirm()

/** Calendar-year cumulative through selected month (from getCumulativeFinanceThroughMonth). */
const cumulative = ref(null)

const isClosed = computed(() => monthStatus.value?.is_closed)

const salaryExpenses = computed(() => expenses.value.filter((e) => e.type === 'salary'))
const recurringExpenses = computed(() => expenses.value.filter((e) => e.type === 'recurring'))
const oneOffExpenses = computed(() => expenses.value.filter((e) => e.type === 'one_off'))
const writeOffExpenses = computed(() => expenses.value.filter((e) => e.type === 'write_off'))

const operationalExpenses = computed(() => expenses.value.filter((e) => e.type !== 'write_off'))

const totals = computed(() =>
  financeTotals({ vrRevenue: vrRevenue.value, expenses: expenses.value, additionalIncome: income.value })
)
const totalExpenses = computed(() => totals.value.totalExpenses)
const totalWriteOffs = computed(() => totals.value.totalWriteOffs)
const totalIncome = computed(() => totals.value.totalIncome)
const profitLoss = computed(() => totals.value.profitLoss)

const monthLabel = computed(() => {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
})

const cumulativeRangeLabel = computed(() => {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const startD = new Date(y, 0, 1)
  const endD = new Date(y, m - 1, 1)
  const opts = { month: 'short', year: 'numeric' }
  return `${startD.toLocaleDateString('en-KE', opts)} – ${endD.toLocaleDateString('en-KE', opts)}`
})

function formatMonth(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`
}

function prevMonth() {
  const [y, m] = currentMonth.value.split('-').map(Number)
  // m is 1-indexed from the string, convert to 0-indexed
  const d = new Date(y, m - 1 - 1, 1) // go back one month
  currentMonth.value = formatMonth(d.getFullYear(), d.getMonth())
}

function nextMonth() {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1 + 1, 1) // go forward one month
  currentMonth.value = formatMonth(d.getFullYear(), d.getMonth())
}

async function loadData() {
  loading.value = true
  try {
    const [expData, incData, vr, status, cum] = await Promise.all([
      listMonthlyExpenses(currentMonth.value),
      listAdditionalIncome(currentMonth.value),
      getMonthlyVRRevenue(currentMonth.value),
      getMonthStatus(currentMonth.value),
      getCumulativeFinanceThroughMonth(currentMonth.value),
    ])
    expenses.value = expData
    income.value = incData
    vrRevenue.value = vr
    monthStatus.value = status
    cumulative.value = cum
  } catch (e) {
    toast.error('Failed to load data')
  } finally {
    loading.value = false
  }
}

async function refreshCumulative() {
  try {
    cumulative.value = await getCumulativeFinanceThroughMonth(currentMonth.value)
  } catch {
    /* keep previous cumulative */
  }
}

async function handlePopulate() {
  populating.value = true
  try {
    await populateMonth(currentMonth.value)
    await loadData()
    toast.success('Month populated with salaries and recurring expenses')
  } catch (e) {
    toast.error(e.message || 'Failed to populate month')
  } finally {
    populating.value = false
  }
}

function openAmountEditor(expense) {
  if (!isAdmin.value || isClosed.value) return
  editingExpense.value = expense
  editAmount.value = String(Number(expense.amount))
  editError.value = ''
}

async function saveAmount() {
  const expense = editingExpense.value
  const raw = String(editAmount.value).trim()
  const newAmount = Number(raw)
  if (raw === '' || Number.isNaN(newAmount) || newAmount < 0) {
    editError.value = 'Enter an amount of 0 or more'
    return
  }
  savingAmount.value = true
  try {
    await updateExpense(expense.id, { amount: newAmount })
    expense.amount = newAmount
    editingExpense.value = null
    await refreshCumulative()
    toast.success('Amount updated')
  } catch (e) {
    editError.value = e.message || 'Failed to update'
  } finally {
    savingAmount.value = false
  }
}

async function handleDeleteExpense(id) {
  const exp = expenses.value.find((e) => e.id === id)
  const ok = await confirm({
    title: 'Delete this expense?',
    message: exp ? `${exp.description} — ${formatPrice(exp.amount)} KES` : '',
    confirmLabel: 'Delete',
  })
  if (!ok) return
  try {
    await deleteExpense(id)
    expenses.value = expenses.value.filter((e) => e.id !== id)
    await refreshCumulative()
    toast.success('Expense deleted')
  } catch (e) {
    toast.error(e.message || 'Failed to delete')
  }
}

async function handleDeleteIncome(id) {
  const inc = income.value.find((i) => i.id === id)
  const ok = await confirm({
    title: 'Delete this income?',
    message: inc ? `${inc.description} — ${formatPrice(inc.amount)} KES` : '',
    confirmLabel: 'Delete',
  })
  if (!ok) return
  try {
    await deleteAdditionalIncome(id)
    income.value = income.value.filter((i) => i.id !== id)
    await refreshCumulative()
    toast.success('Income deleted')
  } catch (e) {
    toast.error(e.message || 'Failed to delete')
  }
}

/**
 * Before showing the close confirmation, bring salary rows up to date with
 * the month's final overtime, so the totals shown are the ones that get closed.
 */
async function openCloseConfirm() {
  preparingClose.value = true
  try {
    const { updated, added } = await recalculateSalaries(currentMonth.value)
    salariesChanged.value = updated + added
    await loadData()
    showCloseConfirm.value = true
  } catch (e) {
    toast.error(e.message || 'Failed to update salaries')
  } finally {
    preparingClose.value = false
  }
}

async function handleCloseMonth() {
  closing.value = true
  try {
    await closeMonth(currentMonth.value, user.value.id, totalIncome.value, totalExpenses.value)
    await loadData()
    showCloseConfirm.value = false
    toast.success('Month closed')
  } catch (e) {
    toast.error(e.message || 'Failed to close month')
  } finally {
    closing.value = false
  }
}

async function handleReopenMonth() {
  const ok = await confirm({
    title: `Reopen ${monthLabel.value}?`,
    message: 'Expenses and income for this month become editable again, and the month will need closing again.',
    confirmLabel: 'Reopen',
  })
  if (!ok) return
  try {
    await reopenMonth(currentMonth.value)
    await loadData()
    toast.success('Month reopened')
  } catch (e) {
    toast.error(e.message || 'Failed to reopen')
  }
}

watch(currentMonth, loadData)
onMounted(loadData)
</script>

<template>
  <div>
    <!-- Month picker -->
    <div class="flex items-center justify-between mb-6">
      <button @click="prevMonth" class="p-2 text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <div class="text-center">
        <h1 class="text-2xl font-header font-bold text-gray-900">{{ monthLabel }}</h1>
        <span v-if="isClosed" class="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
          Closed {{ formatInstantDate(monthStatus.closed_at) }}
        </span>
      </div>
      <button @click="nextMonth" class="p-2 text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-10 h-10 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Income</p>
          <p class="text-lg font-bold text-green-600">{{ formatPrice(totalIncome) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Expenses</p>
          <p class="text-lg font-bold text-red-500">{{ formatPrice(totalExpenses) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Profit/Loss</p>
          <p :class="['text-lg font-bold', profitLoss >= 0 ? 'text-green-600' : 'text-red-500']">
            {{ profitLoss >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(profitLoss)) }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cumulative profit / loss</p>
          <p class="text-sm text-gray-500 mt-0.5">Calendar year: {{ cumulativeRangeLabel }}</p>
        </div>
        <div class="text-left sm:text-right flex-shrink-0">
          <p :class="['text-xl font-bold tabular-nums', (cumulative?.profitLoss ?? 0) >= 0 ? 'text-green-600' : 'text-red-500']">
            {{ (cumulative?.profitLoss ?? 0) >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(cumulative?.profitLoss ?? 0)) }} KES
          </p>
          <p v-if="cumulative" class="text-xs text-gray-400 mt-1">
            Income {{ formatPrice(cumulative.totalIncome) }} · Expenses {{ formatPrice(cumulative.totalExpenses) }}
          </p>
        </div>
      </div>

      <!-- Populate button (if no recurring/salary expenses yet) -->
      <div v-if="recurringExpenses.length === 0 && salaryExpenses.length === 0 && !isClosed" class="bg-yellow-50 rounded-xl p-4 mb-6 text-center">
        <p class="text-sm text-yellow-700 mb-3">No salaries or recurring expenses for this month yet. Populate them?</p>
        <button
          @click="handlePopulate"
          :disabled="populating"
          class="bg-purple text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {{ populating ? 'Populating...' : 'Populate Month' }}
        </button>
      </div>

      <!-- INCOME SECTION -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-header font-bold text-gray-900">Income</h2>
          <button
            v-if="!isClosed"
            @click="router.push({ path: '/admin/finance/income/new', query: { month: currentMonth } })"
            class="text-sm text-purple font-medium hover:underline"
          >
            + Add Income
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-soft overflow-hidden">
          <!-- VR Revenue (always first, read-only) -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p class="text-sm font-medium text-gray-900">VR Session Revenue (Our Share)</p>
              <p class="text-xs text-gray-400">50% of partner-reported gross per day; session totals if partner not entered</p>
            </div>
            <p class="text-sm font-bold text-green-600">{{ formatPrice(vrRevenue) }} KES</p>
          </div>

          <!-- Additional income -->
          <div
            v-for="inc in income"
            :key="inc.id"
            class="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
          >
            <p class="text-sm text-gray-900">{{ inc.description }}</p>
            <div class="flex items-center gap-3">
              <p class="text-sm font-semibold text-green-600">{{ formatPrice(inc.amount) }} KES</p>
              <template v-if="!isClosed">
                <button
                  @click="router.push({ path: `/admin/finance/income/${inc.id}/edit`, query: { month: currentMonth } })"
                  class="min-h-[40px] px-3 rounded-lg text-sm font-medium text-purple bg-purple-50 hover:bg-purple-100"
                >Edit</button>
                <button @click="handleDeleteIncome(inc.id)" class="min-h-[40px] px-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100">Delete</button>
              </template>
            </div>
          </div>

          <div v-if="income.length === 0" class="px-4 py-3 text-sm text-gray-400 text-center">No additional income</div>
        </div>
      </div>

      <!-- EXPENSES SECTION -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-header font-bold text-gray-900">Expenses</h2>
          <button
            v-if="!isClosed"
            @click="router.push({ path: '/admin/finance/expense/new', query: { month: currentMonth } })"
            class="text-sm text-purple font-medium hover:underline"
          >
            + Add Expense
          </button>
        </div>

        <!-- Salaries -->
        <div v-if="salaryExpenses.length > 0" class="mb-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Salaries</p>
          <div class="bg-white rounded-xl shadow-soft overflow-hidden">
            <div
              v-for="exp in salaryExpenses"
              :key="exp.id"
              class="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
            >
              <p class="text-sm text-gray-900">{{ exp.description }}</p>
              <button
                v-if="isAdmin && !isClosed"
                type="button"
                @click="openAmountEditor(exp)"
                class="min-h-[44px] -my-2 -mr-2 px-2 flex items-center gap-1.5 rounded-lg text-sm font-semibold text-gray-900 hover:bg-purple-50 hover:text-purple"
                :aria-label="`Edit amount for ${exp.description}`"
              >
                {{ formatPrice(exp.amount) }} KES
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <p v-else class="text-sm font-semibold text-gray-900">{{ formatPrice(exp.amount) }} KES</p>
            </div>
          </div>
        </div>

        <!-- Recurring -->
        <div v-if="recurringExpenses.length > 0" class="mb-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Recurring</p>
          <div class="bg-white rounded-xl shadow-soft overflow-hidden">
            <div
              v-for="exp in recurringExpenses"
              :key="exp.id"
              class="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
            >
              <p class="text-sm text-gray-900">{{ exp.description }}</p>
              <button
                v-if="isAdmin && !isClosed"
                type="button"
                @click="openAmountEditor(exp)"
                class="min-h-[44px] -my-2 -mr-2 px-2 flex items-center gap-1.5 rounded-lg text-sm font-semibold text-gray-900 hover:bg-purple-50 hover:text-purple"
                :aria-label="`Edit amount for ${exp.description}`"
              >
                {{ formatPrice(exp.amount) }} KES
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <p v-else class="text-sm font-semibold text-gray-900">{{ formatPrice(exp.amount) }} KES</p>
            </div>
          </div>
        </div>

        <!-- One-off -->
        <div v-if="oneOffExpenses.length > 0" class="mb-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">One-off</p>
          <div class="bg-white rounded-xl shadow-soft overflow-hidden">
            <div
              v-for="exp in oneOffExpenses"
              :key="exp.id"
              class="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div v-if="exp.receipt_url" class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <a :href="exp.receipt_url" target="_blank"><img :src="exp.receipt_url" class="w-full h-full object-cover" /></a>
                </div>
                <p class="text-sm text-gray-900 truncate">{{ exp.description }}</p>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <p class="text-sm font-semibold text-gray-900">{{ formatPrice(exp.amount) }} KES</p>
                <template v-if="!isClosed">
                  <button
                    @click="router.push({ path: `/admin/finance/expense/${exp.id}/edit`, query: { month: currentMonth } })"
                    class="min-h-[40px] px-3 rounded-lg text-sm font-medium text-purple bg-purple-50 hover:bg-purple-100"
                  >Edit</button>
                  <button @click="handleDeleteExpense(exp.id)" class="min-h-[40px] px-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100">Delete</button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-if="operationalExpenses.length === 0" class="bg-white rounded-xl shadow-soft p-4 text-center text-sm text-gray-400">
          No expenses recorded
        </div>
      </div>

      <!-- WRITE-OFFS SECTION -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-header font-bold text-gray-900">Write-offs</h2>
            <p class="text-xs text-gray-400">Tax-deductible expenses (not included in P&L above)</p>
          </div>
          <button
            v-if="!isClosed"
            @click="router.push({ path: '/admin/finance/expense/new', query: { month: currentMonth, type: 'write_off' } })"
            class="text-sm text-purple font-medium hover:underline"
          >
            + Add Write-off
          </button>
        </div>

        <div v-if="writeOffExpenses.length > 0">
          <!-- Write-off total -->
          <div class="bg-amber-50 rounded-xl p-3 mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-amber-700">Total Write-offs</p>
            <p class="text-sm font-bold text-amber-700">{{ formatPrice(totalWriteOffs) }} KES</p>
          </div>

          <div class="bg-white rounded-xl shadow-soft overflow-hidden">
            <div
              v-for="exp in writeOffExpenses"
              :key="exp.id"
              class="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div v-if="exp.receipt_url" class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <a :href="exp.receipt_url" target="_blank"><img :src="exp.receipt_url" class="w-full h-full object-cover" /></a>
                </div>
                <p class="text-sm text-gray-900 truncate">{{ exp.description }}</p>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <p class="text-sm font-semibold text-amber-700">{{ formatPrice(exp.amount) }} KES</p>
                <template v-if="!isClosed">
                  <button
                    @click="router.push({ path: `/admin/finance/expense/${exp.id}/edit`, query: { month: currentMonth, type: 'write_off' } })"
                    class="min-h-[40px] px-3 rounded-lg text-sm font-medium text-purple bg-purple-50 hover:bg-purple-100"
                  >Edit</button>
                  <button @click="handleDeleteExpense(exp.id)" class="min-h-[40px] px-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100">Delete</button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-white rounded-xl shadow-soft p-4 text-center text-sm text-gray-400">
          No write-offs recorded
        </div>
      </div>

      <!-- Close / Reopen month -->
      <div v-if="!isClosed && expenses.length > 0" class="mt-8">
        <button
          @click="openCloseConfirm"
          :disabled="preparingClose"
          class="w-full bg-blue-950 text-white font-semibold py-3 rounded-xl text-base hover:bg-blue-900 transition-colors disabled:opacity-50"
        >
          {{ preparingClose ? 'Updating salaries...' : 'Close Month' }}
        </button>
      </div>
      <div v-if="isClosed" class="mt-8">
        <button
          @click="handleReopenMonth"
          class="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl text-base hover:bg-gray-200 transition-colors"
        >
          Reopen Month
        </button>
      </div>
    </template>

    <!-- Close confirmation modal -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showCloseConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showCloseConfirm = false" />
          <div class="relative bg-white rounded-2xl shadow-strong w-full max-w-sm p-6 text-center">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Close {{ monthLabel }}?</h3>
            <p class="text-sm text-gray-500 mb-4">No further edits will be allowed after closing.</p>
            <p v-if="salariesChanged > 0" class="text-xs text-blue-900 bg-blue-50 rounded-lg p-2 mb-4">
              {{ salariesChanged }} salary row{{ salariesChanged > 1 ? 's were' : ' was' }} updated with this month's overtime.
              Manual changes to salary amounts were replaced.
            </p>

            <div class="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
              <div class="flex justify-between"><span class="text-gray-500">Income</span><span class="font-bold text-green-600">{{ formatPrice(totalIncome) }} KES</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Expenses</span><span class="font-bold text-red-500">{{ formatPrice(totalExpenses) }} KES</span></div>
              <div class="flex justify-between border-t pt-1"><span class="text-gray-500">Profit/Loss</span><span :class="['font-bold', profitLoss >= 0 ? 'text-green-600' : 'text-red-500']">{{ profitLoss >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(profitLoss)) }} KES</span></div>
            </div>

            <div class="flex gap-3">
              <button @click="showCloseConfirm = false" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200">Cancel</button>
              <button @click="handleCloseMonth" :disabled="closing" class="flex-1 bg-blue-950 text-white font-semibold py-3 rounded-xl text-sm hover:bg-blue-900 disabled:opacity-50">
                {{ closing ? 'Closing...' : 'Confirm Close' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Edit amount sheet -->
    <Teleport to="body">
      <div
        v-if="editingExpense"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-amount-title"
        @keydown.esc="editingExpense = null"
      >
        <div class="absolute inset-0 bg-black/50" @click="editingExpense = null" />
        <form class="relative bg-white rounded-2xl shadow-strong w-full max-w-sm p-6" @submit.prevent="saveAmount">
          <h3 id="edit-amount-title" class="text-lg font-bold text-gray-900">Edit amount</h3>
          <p class="text-sm text-gray-500 mt-1 mb-4">{{ editingExpense.description }}</p>
          <label for="edit-amount" class="block text-xs font-medium text-gray-500 mb-1">Amount (KES)</label>
          <input
            id="edit-amount"
            v-model="editAmount"
            type="number"
            inputmode="decimal"
            min="0"
            step="any"
            autofocus
            @input="editError = ''"
            class="w-full rounded-xl border-gray-300 text-2xl font-bold py-3 px-4 focus:border-purple-500 focus:ring-purple-500"
          />
          <p v-if="editError" class="text-sm text-red-600 mt-2">{{ editError }}</p>
          <div class="flex gap-3 mt-6">
            <button type="button" @click="editingExpense = null" class="flex-1 min-h-[48px] bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" :disabled="savingAmount" class="flex-1 min-h-[48px] bg-purple text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50">
              {{ savingAmount ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>
