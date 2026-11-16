<script setup>
import { ref, onMounted } from 'vue'
import { listAttendance, clockIn, clockOut } from '@/services/attendanceService'
import { listEmployees } from '@/services/employeeService'
import { getSetting } from '@/services/settingsService'
import { formatHoursOrDash as formatHours, formatTime } from '@/utils/format'
import { todayEAT, zonedParts, zonedTimeToDate } from '@/utils/date'
import { isLateClockIn, closingTimeOn } from '@/utils/payroll'
import { toast } from 'vue-sonner'

defineOptions({ name: 'AttendanceLog' })

const records = ref([])
const employees = ref([])
const workingHours = ref(null)

function isLate(clockInStr) {
  return isLateClockIn(clockInStr, workingHours.value)
}
const loading = ref(true)

const filterEmployee = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

// Admin manual clock in/out
const showManualClock = ref(false)
const manualEmployeeId = ref('')
const manualActing = ref(false)

// Clock-out time picker
const showClockOutModal = ref(false)
const clockOutRecord = ref(null)
const clockOutTime = ref('')
const clockOutError = ref('')
const clockingOut = ref(false)

/** 'YYYY-MM-DDTHH:mm' in EAT, for <input type="datetime-local">. */
function toEatInputValue(instant) {
  const { date, minutes } = zonedParts(instant)
  return `${date}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/** Parses a datetime-local value as EAT (not the device's time zone). */
function fromEatInputValue(value) {
  const [date, time] = value.split('T')
  if (!date || !time) return new Date(NaN)
  const [h, m] = time.split(':').map(Number)
  return zonedTimeToDate(date, h * 60 + m)
}

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

function openClockOutModal(record) {
  clockOutRecord.value = record
  clockOutError.value = ''
  // Today's shift: now. A forgotten shift from an earlier day: that day's
  // closing time (never later than now).
  const now = new Date()
  const suggested = record.date === todayEAT()
    ? now
    : new Date(Math.min(closingTimeOn(record.date, workingHours.value).getTime(), now.getTime()))
  clockOutTime.value = toEatInputValue(suggested)
  showClockOutModal.value = true
}

function closeClockOutModal() {
  showClockOutModal.value = false
  clockOutRecord.value = null
  clockOutError.value = ''
}

async function handleManualClockOut() {
  if (!clockOutRecord.value || !clockOutTime.value || clockingOut.value) return

  const chosen = fromEatInputValue(clockOutTime.value)
  if (Number.isNaN(chosen.getTime())) {
    clockOutError.value = 'Pick a valid date and time'
    return
  }
  if (chosen <= new Date(clockOutRecord.value.clock_in)) {
    clockOutError.value = `Must be after they clocked in (${formatTime(clockOutRecord.value.clock_in)})`
    return
  }
  if (chosen.getTime() > Date.now() + 5 * 60 * 1000) {
    clockOutError.value = "Can't be in the future"
    return
  }

  clockingOut.value = true
  try {
    await clockOut(clockOutRecord.value.id, chosen.toISOString())
    toast.success(`${clockOutRecord.value.profiles?.full_name || 'Employee'} clocked out`)
    closeClockOutModal()
    loadData()
  } catch (e) {
    toast.error(e.message || 'Failed to clock out employee')
  } finally {
    clockingOut.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

async function loadData() {
  loading.value = true
  try {
    const [empData, attData, settings] = await Promise.all([
      listEmployees(),
      listAttendance({
        employeeId: filterEmployee.value || undefined,
        startDate: filterStartDate.value || undefined,
        endDate: filterEndDate.value || undefined,
      }),
      getSetting('working_hours').catch(() => null),
    ])
    employees.value = empData
    records.value = attData
    workingHours.value = settings
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

    <template v-else>
    <!-- Mobile: Cards -->
    <div class="md:hidden space-y-3">
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
            <div class="flex items-center gap-1">
              <p :class="['font-medium', isLate(rec.clock_in) ? 'text-red-500' : 'text-gray-900']">{{ formatTime(rec.clock_in) }}</p>
              <span v-if="isLate(rec.clock_in)" class="px-1 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-500">Late</span>
            </div>
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
        <button
          v-if="!rec.clock_out"
          @click="openClockOutModal(rec)"
          class="mt-3 w-full bg-red-50 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          Clock Out
        </button>
      </div>
    </div>

    <!-- Desktop: Table -->
    <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Employee</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Clock In</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Clock Out</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Hours</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Overtime</th>
            <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="rec in records" :key="rec.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ rec.profiles?.full_name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(rec.date) }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="isLate(rec.clock_in) ? 'text-red-500' : 'text-gray-900'">{{ formatTime(rec.clock_in) }}</span>
              <span v-if="isLate(rec.clock_in)" class="ml-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-500">Late</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatTime(rec.clock_out) }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatHours(rec.total_hours) }}</td>
            <td class="px-6 py-4">
              <span :class="['text-sm font-medium', rec.overtime_hours > 0 ? 'text-orange-600' : 'text-gray-500']">
                {{ formatHours(rec.overtime_hours) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                v-if="!rec.clock_out"
                @click="openClockOutModal(rec)"
                class="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                Clock Out
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>

    <!-- Clock Out Time Picker Modal -->
    <div v-if="showClockOutModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Clock Out</h3>
        <p class="text-sm text-gray-500 mb-4">{{ clockOutRecord?.profiles?.full_name }}</p>
        <label class="block text-xs font-medium text-gray-500 mb-1">Clock-out time</label>
        <input
          v-model="clockOutTime"
          type="datetime-local"
          @input="clockOutError = ''"
          class="w-full rounded-lg border-gray-300 text-sm py-2.5 focus:border-purple-500 focus:ring-purple-500"
        />
        <p class="text-xs text-gray-400 mt-1">Clocked in {{ formatDate(clockOutRecord?.date) }} at {{ formatTime(clockOutRecord?.clock_in) }}</p>
        <p v-if="clockOutError" class="text-sm text-red-600 mt-2">{{ clockOutError }}</p>
        <div class="flex gap-2 mt-4">
          <button
            @click="handleManualClockOut"
            :disabled="clockingOut"
            class="flex-1 bg-red-500 text-white font-medium py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {{ clockingOut ? 'Saving...' : 'Confirm Clock Out' }}
          </button>
          <button
            @click="closeClockOutModal"
            class="flex-1 bg-gray-100 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
