<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFinanceReport } from '@/services/financeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'FinanceReport' })

const now = new Date()
const startMonth = ref(`${now.getFullYear()}-01-01`)
const endMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)

const report = ref(null)
const loading = ref(false)
const filter = ref('all') // 'all', 'income', 'expenses', 'write_offs'

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

function formatMonthLabel(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthInputValue(month) {
  return month.slice(0, 7)
}

function fromMonthInput(val) {
  return val + '-01'
}

// Filtered line items for the detail table
const filteredItems = computed(() => {
  if (!report.value) return []

  if (filter.value === 'income') {
    const vrItems = report.value.vrDailyItems.map((r) => ({
      id: 'vr-' + r.date,
      date: r.date,
      type: 'vr_revenue',
      description: 'VR Session Revenue (Our Share)',
      amount: r.amount,
      receipt_url: null,
    }))
    const addItems = report.value.incomeItems.map((i) => ({
      id: i.id,
      date: i.created_at,
      type: 'additional_income',
      description: i.description,
      amount: Number(i.amount),
      receipt_url: null,
    }))
    return [...vrItems, ...addItems].sort((a, b) => a.date.localeCompare(b.date))
  }

  if (filter.value === 'expenses') {
    return report.value.expenses
      .filter((e) => e.type !== 'write_off')
      .map((e) => ({
        id: e.id,
        date: e.created_at,
        type: e.type,
        description: e.description,
        amount: Number(e.amount),
        receipt_url: e.receipt_url,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  if (filter.value === 'write_offs') {
    return report.value.expenses
      .filter((e) => e.type === 'write_off')
      .map((e) => ({
        id: e.id,
        date: e.created_at,
        type: 'write_off',
        description: e.description,
        amount: Number(e.amount),
        receipt_url: e.receipt_url,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // all
  const vrItems = report.value.vrDailyItems.map((r) => ({
    id: 'vr-' + r.date,
    date: r.date,
    type: 'vr_revenue',
    description: 'VR Session Revenue (Our Share)',
    amount: r.amount,
    receipt_url: null,
  }))
  const addItems = report.value.incomeItems.map((i) => ({
    id: i.id,
    date: i.created_at,
    type: 'additional_income',
    description: i.description,
    amount: Number(i.amount),
    receipt_url: null,
  }))
  const expItems = report.value.expenses.map((e) => ({
    id: e.id,
    date: e.created_at,
    type: e.type,
    description: e.description,
    amount: Number(e.amount),
    receipt_url: e.receipt_url,
  }))
  return [...vrItems, ...addItems, ...expItems].sort((a, b) => a.date.localeCompare(b.date))
})

const filteredTotal = computed(() => filteredItems.value.reduce((a, i) => a + i.amount, 0))

function typeLabel(type) {
  const labels = {
    vr_revenue: 'VR Revenue',
    additional_income: 'Income',
    salary: 'Salary',
    recurring: 'Recurring',
    one_off: 'One-off',
    write_off: 'Write-off',
  }
  return labels[type] || type
}

function typeColor(type) {
  if (type === 'vr_revenue' || type === 'additional_income') return 'bg-green-50 text-green-600'
  if (type === 'write_off') return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-500'
}

function amountColor(type) {
  if (type === 'vr_revenue' || type === 'additional_income') return 'text-green-600'
  if (type === 'write_off') return 'text-amber-700'
  return 'text-red-500'
}

async function loadReport() {
  loading.value = true
  try {
    report.value = await getFinanceReport({
      startMonth: startMonth.value,
      endMonth: endMonth.value,
    })
  } catch (e) {
    toast.error('Failed to load report')
  } finally {
    loading.value = false
  }
}

async function downloadReceipt(url, description) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = description.replace(/[^a-zA-Z0-9]/g, '_') + '.' + (url.split('.').pop() || 'jpg')
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    window.open(url, '_blank')
  }
}

onMounted(loadReport)
</script>

<template>
  <div>
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-1">Finance Report</h1>
    <p class="text-sm text-gray-500 mb-6">Overview across months</p>

    <!-- Date range -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
        <input
          :value="monthInputValue(startMonth)"
          @input="startMonth = fromMonthInput($event.target.value)"
          type="month"
          class="w-full rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple focus:ring-purple"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
        <input
          :value="monthInputValue(endMonth)"
          @input="endMonth = fromMonthInput($event.target.value)"
          type="month"
          class="w-full rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple focus:ring-purple"
        />
      </div>
      <div class="flex items-end">
        <button
          @click="loadReport"
          :disabled="loading"
          class="bg-purple text-white font-semibold px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {{ loading ? 'Loading...' : 'Filter' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <template v-else-if="report">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Income</p>
          <p class="text-lg font-bold text-green-600">{{ formatPrice(report.totals.income) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Expenses</p>
          <p class="text-lg font-bold text-red-500">{{ formatPrice(report.totals.expenses) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Profit/Loss</p>
          <p :class="['text-lg font-bold', report.totals.profit >= 0 ? 'text-green-600' : 'text-red-500']">
            {{ report.totals.profit >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(report.totals.profit)) }}
          </p>
        </div>
        <div class="bg-white rounded-xl shadow-soft p-4 text-center">
          <p class="text-xs text-gray-400">Write-offs</p>
          <p class="text-lg font-bold text-amber-700">{{ formatPrice(report.totals.writeOffs) }}</p>
        </div>
      </div>

      <!-- Month-by-month table -->
      <div class="mb-6">
        <h2 class="text-lg font-header font-bold text-gray-900 mb-3">Monthly Breakdown</h2>

        <!-- Mobile: cards -->
        <div class="md:hidden space-y-2">
          <div
            v-for="m in report.monthlyBreakdown"
            :key="m.month"
            class="bg-white rounded-xl shadow-soft p-3"
          >
            <p class="text-sm font-semibold text-gray-900 mb-2">{{ formatMonthLabel(m.month) }}</p>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div>
                <p class="text-[10px] text-gray-400">Income</p>
                <p class="text-xs font-bold text-green-600">{{ formatPrice(m.income) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">Expenses</p>
                <p class="text-xs font-bold text-red-500">{{ formatPrice(m.expenses) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">Profit</p>
                <p :class="['text-xs font-bold', m.profit >= 0 ? 'text-green-600' : 'text-red-500']">
                  {{ m.profit >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(m.profit)) }}
                </p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">Write-off</p>
                <p class="text-xs font-bold text-amber-700">{{ formatPrice(m.writeOffs) }}</p>
              </div>
            </div>
          </div>

          <!-- Totals card -->
          <div class="bg-purple rounded-xl p-3 text-white">
            <p class="text-sm font-semibold mb-2">Total</p>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div>
                <p class="text-[10px] text-purple-200">Income</p>
                <p class="text-xs font-bold">{{ formatPrice(report.totals.income) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-purple-200">Expenses</p>
                <p class="text-xs font-bold">{{ formatPrice(report.totals.expenses) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-purple-200">Profit</p>
                <p class="text-xs font-bold">{{ report.totals.profit >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(report.totals.profit)) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-purple-200">Write-off</p>
                <p class="text-xs font-bold">{{ formatPrice(report.totals.writeOffs) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: table -->
        <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Month</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Income</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Expenses</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Profit/Loss</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Write-offs</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="m in report.monthlyBreakdown" :key="m.month" class="hover:bg-gray-50">
                <td class="px-6 py-3 text-sm font-medium text-gray-900">{{ formatMonthLabel(m.month) }}</td>
                <td class="px-6 py-3 text-sm text-right font-semibold text-green-600">{{ formatPrice(m.income) }}</td>
                <td class="px-6 py-3 text-sm text-right font-semibold text-red-500">{{ formatPrice(m.expenses) }}</td>
                <td :class="['px-6 py-3 text-sm text-right font-bold', m.profit >= 0 ? 'text-green-600' : 'text-red-500']">
                  {{ m.profit >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(m.profit)) }}
                </td>
                <td class="px-6 py-3 text-sm text-right font-semibold text-amber-700">{{ formatPrice(m.writeOffs) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-purple text-white">
              <tr>
                <td class="px-6 py-3 text-sm font-bold">Total</td>
                <td class="px-6 py-3 text-sm text-right font-bold">{{ formatPrice(report.totals.income) }}</td>
                <td class="px-6 py-3 text-sm text-right font-bold">{{ formatPrice(report.totals.expenses) }}</td>
                <td class="px-6 py-3 text-sm text-right font-bold">{{ report.totals.profit >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(report.totals.profit)) }}</td>
                <td class="px-6 py-3 text-sm text-right font-bold">{{ formatPrice(report.totals.writeOffs) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Filter pills + detail table -->
      <div>
        <h2 class="text-lg font-header font-bold text-gray-900 mb-3">Line Items</h2>

        <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          <button
            v-for="opt in [
              { key: 'all', label: 'All' },
              { key: 'income', label: 'Income' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'write_offs', label: 'Write-offs' },
            ]"
            :key="opt.key"
            @click="filter = opt.key"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0',
              filter === opt.key
                ? 'bg-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>

        <div v-if="filteredItems.length === 0" class="bg-white rounded-xl shadow-soft p-4 text-center text-sm text-gray-400">
          No items for this filter
        </div>

        <template v-else>
          <!-- Mobile: cards -->
          <div class="md:hidden space-y-2">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="bg-white rounded-xl shadow-soft p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <div v-if="item.receipt_url" class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <a :href="item.receipt_url" target="_blank"><img :src="item.receipt_url" class="w-full h-full object-cover" /></a>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.description }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span :class="['inline-block px-2 py-0.5 rounded-full text-[10px] font-medium', typeColor(item.type)]">
                        {{ typeLabel(item.type) }}
                      </span>
                      <span class="text-[10px] text-gray-400">{{ formatDate(item.date) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <p :class="['text-sm font-bold', amountColor(item.type)]">{{ formatPrice(item.amount) }}</p>
                  <button
                    v-if="item.receipt_url"
                    @click="downloadReceipt(item.receipt_url, item.description)"
                    class="text-purple hover:text-purple-700 p-1"
                    title="Download receipt"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Filter total -->
            <div class="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <p class="text-sm font-medium text-gray-500">Total</p>
              <p class="text-sm font-bold text-gray-900">{{ formatPrice(filteredTotal) }} KES</p>
            </div>
          </div>

          <!-- Desktop: table -->
          <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Type</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Description</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Receipt</th>
                  <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm text-gray-500">{{ formatDate(item.date) }}</td>
                  <td class="px-6 py-3">
                    <span :class="['inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', typeColor(item.type)]">
                      {{ typeLabel(item.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-gray-900">{{ item.description }}</td>
                  <td class="px-6 py-3">
                    <div v-if="item.receipt_url" class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                      <a :href="item.receipt_url" target="_blank"><img :src="item.receipt_url" class="w-full h-full object-cover" /></a>
                    </div>
                    <span v-else class="text-xs text-gray-300">—</span>
                  </td>
                  <td :class="['px-6 py-3 text-sm text-right font-semibold', amountColor(item.type)]">
                    {{ formatPrice(item.amount) }} KES
                  </td>
                  <td class="px-6 py-3 text-right">
                    <button
                      v-if="item.receipt_url"
                      @click="downloadReceipt(item.receipt_url, item.description)"
                      class="text-purple hover:text-purple-700 p-1"
                      title="Download receipt"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colspan="4" class="px-6 py-3 text-sm font-bold text-gray-700">Total</td>
                  <td class="px-6 py-3 text-sm text-right font-bold text-gray-900">{{ formatPrice(filteredTotal) }} KES</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
