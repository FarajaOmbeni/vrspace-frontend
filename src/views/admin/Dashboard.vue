<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listAttendance, getEmployeeHours } from '@/services/attendanceService'
import { getTodayTotals } from '@/services/sessionService'
import { getDiscrepancies, listDailySales } from '@/services/salesService'
import { listMonthlyExpenses, getMonthlyVRRevenue, listAdditionalIncome } from '@/services/financeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'AdminDashboard' })

const router = useRouter()
const loading = ref(true)

const clockedIn = ref([])
const todaySessions = ref(0)
const todayRevenue = ref(0)
const recentDiscrepancies = ref([])
const overtimeAlerts = ref([])
const monthProfitLoss = ref(0)
const monthTotalIncome = ref(0)
const monthTotalExpenses = ref(0)
const pendingPartnerReports = ref(0)

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHours(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

async function loadData() {
  loading.value = true
  try {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const weekStart = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const [attendance, totals, discrepancies, monthlyHours, expenses, vrRevenue, additionalIncome, dailySales] = await Promise.all([
      listAttendance({ startDate: today, endDate: today }),
      getTodayTotals(),
      getDiscrepancies({ startDate: weekStart, endDate: today }).catch(() => []),
      getEmployeeHours({ startDate: monthStart, endDate: today }).catch(() => []),
      listMonthlyExpenses(monthStart).catch(() => []),
      getMonthlyVRRevenue(monthStart).catch(() => 0),
      listAdditionalIncome(monthStart).catch(() => []),
      listDailySales({ startDate: monthStart, endDate: today }).catch(() => []),
    ])

    // Currently clocked in
    clockedIn.value = attendance.filter((a) => !a.clock_out)

    // Today's sessions
    todaySessions.value = totals.sessions
    todayRevenue.value = totals.revenue

    // Recent discrepancies
    recentDiscrepancies.value = discrepancies.slice(0, 5)

    // Overtime alerts — employees with overtime this month
    const overtimeMap = {}
    for (const rec of monthlyHours) {
      if (Number(rec.overtime_hours || 0) > 0) {
        const id = rec.employee_id
        if (!overtimeMap[id]) {
          overtimeMap[id] = {
            name: rec.profiles?.full_name || 'Unknown',
            overtimeHours: 0,
          }
        }
        overtimeMap[id].overtimeHours += Number(rec.overtime_hours)
      }
    }
    overtimeAlerts.value = Object.values(overtimeMap).sort((a, b) => b.overtimeHours - a.overtimeHours)

    // Finance: profit/loss
    const totalExp = expenses.reduce((a, e) => a + Number(e.amount || 0), 0)
    const totalAddIncome = additionalIncome.reduce((a, i) => a + Number(i.amount || 0), 0)
    const totalInc = vrRevenue + totalAddIncome
    monthTotalIncome.value = totalInc
    monthTotalExpenses.value = totalExp
    monthProfitLoss.value = totalInc - totalExp

    // Pending partner reports: days with sessions but no partner_reported_revenue
    const daysWithSales = new Set(dailySales.map((s) => s.date))
    const daysWithPartner = new Set(dailySales.filter((s) => s.partner_reported_revenue != null).map((s) => s.date))
    pendingPartnerReports.value = daysWithSales.size - daysWithPartner.size
  } catch (e) {
    toast.error('Failed to load dashboard')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-6">Dashboard</h1>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-10 h-10 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Clocked In -->
        <button
          @click="router.push('/admin/attendance')"
          class="bg-white rounded-xl shadow-soft p-4 text-left hover:shadow-medium transition-shadow"
        >
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span class="text-xs text-gray-400">Clocked In</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ clockedIn.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">employees on shift</p>
        </button>

        <!-- Today's Sessions -->
        <button
          @click="router.push('/admin/sessions')"
          class="bg-white rounded-xl shadow-soft p-4 text-left hover:shadow-medium transition-shadow"
        >
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <span class="text-xs text-gray-400">Sessions</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ todaySessions }}</p>
          <p class="text-xs text-gray-400 mt-0.5">today</p>
        </button>

        <!-- Today's Revenue -->
        <button
          @click="router.push('/admin/sales')"
          class="bg-white rounded-xl shadow-soft p-4 text-left hover:shadow-medium transition-shadow"
        >
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span class="text-xs text-gray-400">Revenue</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatPrice(todayRevenue) }}</p>
          <p class="text-xs text-gray-400 mt-0.5">KES today</p>
        </button>

        <!-- Discrepancies -->
        <button
          @click="router.push('/admin/sales/discrepancies')"
          class="bg-white rounded-xl shadow-soft p-4 text-left hover:shadow-medium transition-shadow"
        >
          <div class="flex items-center gap-2 mb-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', recentDiscrepancies.length > 0 ? 'bg-red-50' : 'bg-green-50']">
              <svg v-if="recentDiscrepancies.length > 0" class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-else class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <span class="text-xs text-gray-400">Discrepancies</span>
          </div>
          <p class="text-2xl font-bold" :class="recentDiscrepancies.length > 0 ? 'text-red-500' : 'text-green-600'">
            {{ recentDiscrepancies.length }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">last 7 days</p>
        </button>
      </div>

      <!-- Finance cards -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Profit/Loss -->
        <button
          @click="router.push('/admin/finance')"
          class="bg-white rounded-xl shadow-soft p-4 text-left hover:shadow-medium transition-shadow"
        >
          <div class="flex items-center gap-2 mb-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', monthProfitLoss >= 0 ? 'bg-green-50' : 'bg-red-50']">
              <svg v-if="monthProfitLoss >= 0" class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <svg v-else class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
            </div>
            <span class="text-xs text-gray-400">This Month</span>
          </div>
          <p :class="['text-2xl font-bold', monthProfitLoss >= 0 ? 'text-green-600' : 'text-red-500']">
            {{ monthProfitLoss >= 0 ? '' : '-' }}{{ formatPrice(Math.abs(monthProfitLoss)) }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">{{ monthProfitLoss >= 0 ? 'profit' : 'loss' }}</p>
        </button>

        <!-- Pending Partner Reports -->
        <button
          @click="router.push('/admin/sales')"
          class="bg-white rounded-xl shadow-soft p-4 text-left hover:shadow-medium transition-shadow"
        >
          <div class="flex items-center gap-2 mb-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', pendingPartnerReports > 0 ? 'bg-yellow-50' : 'bg-green-50']">
              <svg v-if="pendingPartnerReports > 0" class="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <svg v-else class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <span class="text-xs text-gray-400">Partner Reports</span>
          </div>
          <p :class="['text-2xl font-bold', pendingPartnerReports > 0 ? 'text-yellow-600' : 'text-green-600']">
            {{ pendingPartnerReports }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">{{ pendingPartnerReports > 0 ? 'pending' : 'all submitted' }}</p>
        </button>
      </div>

      <!-- Bottom sections -->
      <div class="md:grid md:grid-cols-2 md:gap-6">

        <!-- Currently clocked in -->
        <div class="bg-white rounded-xl shadow-soft p-4 mb-4 md:mb-0">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-gray-900">On Shift Now</h2>
            <button @click="router.push('/admin/attendance')" class="text-xs text-purple font-medium hover:underline">View all</button>
          </div>

          <div v-if="clockedIn.length === 0" class="text-center py-4">
            <p class="text-sm text-gray-400">No employees clocked in</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="emp in clockedIn"
              :key="emp.id"
              class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ emp.profiles?.full_name }}</p>
                <p class="text-xs text-gray-400">Since {{ formatTime(emp.clock_in) }}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">Active</span>
            </div>
          </div>
        </div>

        <!-- Recent discrepancies + overtime -->
        <div class="space-y-4">
          <!-- Discrepancies -->
          <div class="bg-white rounded-xl shadow-soft p-4">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-gray-900">Recent Discrepancies</h2>
              <button @click="router.push('/admin/sales/discrepancies')" class="text-xs text-purple font-medium hover:underline">View all</button>
            </div>

            <div v-if="recentDiscrepancies.length === 0" class="text-center py-4">
              <p class="text-sm text-green-500">All clear — no discrepancies</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="d in recentDiscrepancies"
                :key="d.id"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span class="text-sm text-gray-900">{{ formatDate(d.date) }}</span>
                <span class="text-sm font-bold text-red-600">
                  {{ d.discrepancy > 0 ? '+' : '' }}{{ formatPrice(d.discrepancy) }} KES
                </span>
              </div>
            </div>
          </div>

          <!-- Overtime alerts -->
          <div class="bg-white rounded-xl shadow-soft p-4">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-gray-900">Overtime This Month</h2>
              <button @click="router.push('/admin/attendance/hours')" class="text-xs text-purple font-medium hover:underline">View all</button>
            </div>

            <div v-if="overtimeAlerts.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-400">No overtime recorded</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="emp in overtimeAlerts"
                :key="emp.name"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span class="text-sm text-gray-900">{{ emp.name }}</span>
                <span class="text-sm font-bold text-orange-600">{{ formatHours(emp.overtimeHours) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
