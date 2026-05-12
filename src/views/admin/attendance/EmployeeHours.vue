<script setup>
import { ref, computed, onMounted } from 'vue'
import { getEmployeeHours } from '@/services/attendanceService'
import { listEmployees } from '@/services/employeeService'
import { getSetting } from '@/services/settingsService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'EmployeeHours' })

const records = ref([])
const employees = ref([])
const hourlyRate = ref(400)
const loading = ref(true)

const filterEmployee = ref('')
const filterPeriod = ref('week') // 'week', 'month', 'custom'
const filterStartDate = ref('')
const filterEndDate = ref('')

// Compute date range from period
function getDateRange() {
  const now = new Date()
  let start, end

  if (filterPeriod.value === 'week') {
    const day = now.getDay()
    start = new Date(now)
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1)) // Monday
    end = now
  } else if (filterPeriod.value === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = now
  } else {
    start = filterStartDate.value ? new Date(filterStartDate.value) : null
    end = filterEndDate.value ? new Date(filterEndDate.value) : null
  }

  return {
    startDate: start ? start.toISOString().split('T')[0] : undefined,
    endDate: end ? end.toISOString().split('T')[0] : undefined,
  }
}

// Group records by employee and sum hours
const summary = computed(() => {
  const map = {}

  for (const rec of records.value) {
    const id = rec.employee_id
    if (!map[id]) {
      map[id] = {
        name: rec.profiles?.full_name || 'Unknown',
        days: 0,
        totalHours: 0,
        overtimeHours: 0,
      }
    }
    map[id].days++
    map[id].totalHours += Number(rec.total_hours || 0)
    map[id].overtimeHours += Number(rec.overtime_hours || 0)
  }

  return Object.values(map)
    .map((e) => ({ ...e, pay: Math.round(e.totalHours * hourlyRate.value) }))
    .sort((a, b) => b.totalHours - a.totalHours)
})

function formatHours(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

async function loadData() {
  loading.value = true
  try {
    const { startDate, endDate } = getDateRange()
    const [empData, hoursData, workingHours] = await Promise.all([
      listEmployees(),
      getEmployeeHours({
        employeeId: filterEmployee.value || undefined,
        startDate,
        endDate,
      }),
      getSetting('working_hours').catch(() => null),
    ])
    employees.value = empData
    records.value = hoursData
    if (workingHours?.hourly_rate) {
      hourlyRate.value = workingHours.hourly_rate
    }
  } catch (e) {
    toast.error('Failed to load hours')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div>
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-6">Employee Hours</h1>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-4 space-y-3 md:space-y-0 md:flex md:items-end md:gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Period</label>
        <div class="flex gap-1">
          <button
            v-for="p in ['week', 'month', 'custom']"
            :key="p"
            @click="filterPeriod = p; if (p !== 'custom') applyFilters()"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filterPeriod === p
                ? 'bg-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Custom' }}
          </button>
        </div>
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Employee</label>
        <select
          v-model="filterEmployee"
          @change="applyFilters"
          class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.full_name }}
          </option>
        </select>
      </div>
      <template v-if="filterPeriod === 'custom'">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            v-model="filterStartDate"
            type="date"
            class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            v-model="filterEndDate"
            type="date"
            class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        <button
          @click="applyFilters"
          class="bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Apply
        </button>
      </template>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="summary.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No hours recorded for this period</p>
    </div>

    <!-- Mobile: Cards -->
    <div v-else class="md:hidden space-y-3">
      <div
        v-for="emp in summary"
        :key="emp.name"
        class="bg-white rounded-xl shadow-soft p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-gray-900">{{ emp.name }}</p>
          <p class="text-lg font-bold text-green-600">{{ emp.pay.toLocaleString('en-KE') }} KES</p>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-xs text-gray-400">Days</p>
            <p class="text-lg font-bold text-gray-900">{{ emp.days }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Hours</p>
            <p class="text-lg font-bold text-purple">{{ formatHours(emp.totalHours) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Overtime</p>
            <p :class="['text-lg font-bold', emp.overtimeHours > 0 ? 'text-orange-600' : 'text-gray-400']">
              {{ formatHours(emp.overtimeHours) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: Table -->
    <div v-else class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Employee</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Days Worked</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total Hours</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Overtime</th>
            <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Pay (KES)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="emp in summary" :key="emp.name" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ emp.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ emp.days }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatHours(emp.totalHours) }}</td>
            <td class="px-6 py-4">
              <span :class="['text-sm font-medium', emp.overtimeHours > 0 ? 'text-orange-600' : 'text-gray-500']">
                {{ formatHours(emp.overtimeHours) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-green-600">{{ emp.pay.toLocaleString('en-KE') }}</td>
          </tr>
        </tbody>
        <!-- Totals row -->
        <tfoot class="bg-gray-50 border-t border-gray-200">
          <tr>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">{{ summary.reduce((a, e) => a + e.days, 0) }}</td>
            <td class="px-6 py-3 text-sm font-bold text-purple">{{ formatHours(summary.reduce((a, e) => a + e.totalHours, 0)) }}</td>
            <td class="px-6 py-3 text-sm font-bold text-orange-600">{{ formatHours(summary.reduce((a, e) => a + e.overtimeHours, 0)) }}</td>
            <td class="px-6 py-3 text-right text-sm font-bold text-green-600">{{ summary.reduce((a, e) => a + e.pay, 0).toLocaleString('en-KE') }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
