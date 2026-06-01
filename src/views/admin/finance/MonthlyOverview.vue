<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  listMonthlyExpenses, populateMonth, deleteExpense, updateExpense,
  listAdditionalIncome, deleteAdditionalIncome,
  getMonthStatus, getMonthlyVRRevenue, getCumulativeFinanceThroughMonth, closeMonth, reopenMonth,
} from '@/services/financeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'MonthlyOverview' })

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

// Month state
const now = new Date()
const currentMonth = ref(
  route.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
)

const expenses = ref([])
const income = ref([])
const vrRevenue = ref(0)
const monthStatus = ref(null)
const loading = ref(true)
const populating = ref(false)
const closing = ref(false)
const showCloseConfirm = ref(false)

/** Calendar-year cumulative through selected month (from getCumulativeFinanceThroughMonth). */
const cumulative = ref(null)

const isClosed = computed(() => monthStatus.value?.is_closed)

const salaryExpenses = computed(() => expenses.value.filter((e) => e.type === 'salary'))
const recurringExpenses = computed(() => expenses.value.filter((e) => e.type === 'recurring'))
const oneOffExpenses = computed(() => expenses.value.filter((e) => e.type === 'one_off'))
const writeOffExpenses = computed(() => expenses.value.filter((e) => e.type === 'write_off'))

const operationalExpenses = computed(() => expenses.value.filter((e) => e.type !== 'write_off'))
const totalExpenses = computed(() => operationalExpenses.value.reduce((a, e) => a + Number(e.amount), 0))
const totalWriteOffs = computed(() => writeOffExpenses.value.reduce((a, e) => a + Number(e.amount), 0))
const totalAdditionalIncome = computed(() => income.value.reduce((a, i) => a + Number(i.amount), 0))
const totalIncome = computed(() => vrRevenue.value + totalAdditionalIncome.value)
const profitLoss = computed(() => totalIncome.value - totalExpenses.value)

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

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

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

async function handleUpdateAmount(expense, newAmount) {
  try {
    await updateExpense(expense.id, { amount: newAmount })
    expense.amount = newAmount
    await refreshCumulative()
  } catch (e) {
    toast.error(e.message || 'Failed to update')
  }
}

async function handleDeleteExpense(id) {
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
  try {
    await deleteAdditionalIncome(id)
    income.value = income.value.filter((i) => i.id !== id)
    await refreshCumulative()
    toast.success('Income deleted')
  } catch (e) {
    toast.error(e.message || 'Failed to delete')
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
          Closed {{ new Date(monthStatus.closed_at).toLocaleDateString('en-KE') }}
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
                  class="text-xs text-purple hover:underline"
                >Edit</button>
                <button @click="handleDeleteIncome(inc.id)" class="text-xs text-red-500 hover:underline">Del</button>
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
              <p class="text-sm font-semibold text-gray-900">{{ formatPrice(exp.amount) }} KES</p>
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
              <div class="flex items-center gap-2">
                <input
                  v-if="!isClosed"
                  type="number"
                  :value="exp.amount"
                  min="0"
                  step="100"
                  @change="handleUpdateAmount(exp, Number($event.target.value))"
                  class="w-28 text-right rounded-lg border-gray-300 text-sm py-1 px-2 focus:border-purple-500 focus:ring-purple-500"
                />
                <p v-else class="text-sm font-semibold text-gray-900">{{ formatPrice(exp.amount) }} KES</p>
              </div>
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
                    class="text-xs text-purple hover:underline"
                  >Edit</button>
                  <button @click="handleDeleteExpense(exp.id)" class="text-xs text-red-500 hover:underline">Del</button>
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
                    class="text-xs text-purple hover:underline"
                  >Edit</button>
                  <button @click="handleDeleteExpense(exp.id)" class="text-xs text-red-500 hover:underline">Del</button>
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
          @click="showCloseConfirm = true"
          class="w-full bg-blue-950 text-white font-semibold py-3 rounded-xl text-base hover:bg-blue-900 transition-colors"
        >
          Close Month
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
  </div>
</template>
