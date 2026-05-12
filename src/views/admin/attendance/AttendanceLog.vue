<script setup>
import { ref, onMounted } from 'vue'
import { listAttendance, clockIn, clockOut } from '@/services/attendanceService'
import { listEmployees } from '@/services/employeeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'AttendanceLog' })

const records = ref([])
const employees = ref([])
const loading = ref(true)

const filterEmployee = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

// Admin manual clock in/out
const showManualClock = ref(false)
const manualEmployeeId = ref('')
const manualActing = ref(false)

async function handleManualClockIn() {
  if (!manualEmployeeId.value) {
    toast.error('Select an employee')
    return
  }
  manualActing.value = true
  try {
    await clockIn(manualEmployeeId.value)
    const emp = employees.value.find((e) => e.id === manualEmployeeId.value)
    toast.success(`${emp?.full_name || 'Employee'} clocked in`)
    showManualClock.value = false
    manualEmployeeId.value = ''
    loadData()
  } catch (e) {
    toast.error(e.message || 'Failed to clock in employee')
  } finally {
    manualActing.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHours(hours) {
  if (!hours) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

async function loadData() {
  loading.value = true
  try {
    const [empData, attData] = await Promise.all([
      listEmployees(),
      listAttendance({
        employeeId: filterEmployee.value || undefined,
        startDate: filterStartDate.value || undefined,
        endDate: filterEndDate.value || undefined,
      }),
    ])
    employees.value = empData
    records.value = attData
  } catch (e) {
    toast.error('Failed to load attendance')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadData()
}

function clearFilters() {
  filterEmployee.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl font-header font-bold text-gray-900">Attendance Log</h1>
      <button
        @click="showManualClock = !showManualClock"
        class="bg-purple text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto"
      >
        + Manual Clock In
      </button>
    </div>

    <!-- Manual clock in panel -->
    <div v-if="showManualClock" class="bg-white rounded-xl shadow-soft p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Employee</label>
        <select
          v-model="manualEmployeeId"
          class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="">Select employee...</option>
          <option v-for="emp in employees.filter(e => e.is_active)" :key="emp.id" :value="emp.id">
            {{ emp.full_name }}
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <button
          @click="handleManualClockIn"
          :disabled="manualActing"
          class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {{ manualActing ? 'Clocking...' : 'Clock In' }}
        </button>
        <button
          @click="showManualClock = false"
          class="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-4 space-y-3 md:space-y-0 md:flex md:items-end md:gap-4">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Employee</label>
        <select
          v-model="filterEmployee"
          class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.full_name }}
          </option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
        <input
          v-model="filterStartDate"
          type="date"
          class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
        <input
          v-model="filterEndDate"
          type="date"
          class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      <div class="flex gap-2">
        <button
          @click="applyFilters"
          class="bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Filter
        </button>
        <button
          @click="clearFilters"
          class="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="records.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No attendance records found</p>
    </div>

    <!-- Mobile: Cards -->
    <div v-else class="md:hidden space-y-3">
      <div
        v-for="rec in records"
        :key="rec.id"
        class="bg-white rounded-xl shadow-soft p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-gray-900 text-sm">{{ rec.profiles?.full_name }}</p>
          <span class="text-xs text-gray-400">{{ formatDate(rec.date) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-xs text-gray-400">Clock In</p>
            <p class="font-medium text-gray-900">{{ formatTime(rec.clock_in) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Clock Out</p>
            <p class="font-medium text-gray-900">{{ formatTime(rec.clock_out) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Hours</p>
            <p class="font-medium text-gray-900">{{ formatHours(rec.total_hours) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Overtime</p>
            <p :class="['font-medium', rec.overtime_hours > 0 ? 'text-orange-600' : 'text-gray-900']">
              {{ formatHours(rec.overtime_hours) }}
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
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Clock In</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Clock Out</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Hours</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Overtime</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="rec in records" :key="rec.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ rec.profiles?.full_name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(rec.date) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatTime(rec.clock_in) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatTime(rec.clock_out) }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatHours(rec.total_hours) }}</td>
            <td class="px-6 py-4">
              <span :class="['text-sm font-medium', rec.overtime_hours > 0 ? 'text-orange-600' : 'text-gray-500']">
                {{ formatHours(rec.overtime_hours) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
