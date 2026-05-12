<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useGeolocation } from '@/composables/useGeolocation'
import { getTodayRecord, clockIn, clockOut, getEmployeeHours } from '@/services/attendanceService'
import { getShopLocation, getSetting } from '@/services/settingsService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'ClockInOut' })

const { user, profile, isAdmin } = useAuth()
const { position, error: geoError, loading: geoLoading, getPosition, isWithinRadius } = useGeolocation()

const record = ref(null)
const shopLocation = ref(null)
const loading = ref(true)
const acting = ref(false)
const elapsed = ref('')
const locationBlocked = ref(false)
const locationDistance = ref(null)
const monthlyHours = ref(0)
const monthlyOvertime = ref(0)
const hourlyRate = ref(400)
const previousMonths = ref([])
let timer = null

const isClockedIn = computed(() => record.value && !record.value.clock_out)
const isClockedOut = computed(() => record.value && record.value.clock_out)
const salary = computed(() => Number(profile.value?.salary || 0))
const overtimePay = computed(() => Math.round(monthlyOvertime.value * hourlyRate.value))
const totalPay = computed(() => salary.value + overtimePay.value)

function formatTime(dateStr) {
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

function updateElapsed() {
  if (!record.value?.clock_in || record.value.clock_out) {
    elapsed.value = ''
    return
  }

  const start = new Date(record.value.clock_in).getTime()
  const now = Date.now()
  const diff = Math.floor((now - start) / 1000)

  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60

  elapsed.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function startTimer() {
  stopTimer()
  updateElapsed()
  timer = setInterval(updateElapsed, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

async function checkLocation() {
  if (!shopLocation.value) return true

  try {
    await getPosition()
    const result = isWithinRadius(
      shopLocation.value.lat,
      shopLocation.value.lng,
      shopLocation.value.radius_meters
    )
    locationDistance.value = result.distance
    if (!result.within) {
      locationBlocked.value = true
      return false
    }
    locationBlocked.value = false
    return true
  } catch (e) {
    // Geolocation failed — show the error
    locationBlocked.value = true
    return false
  }
}

async function loadRecord() {
  loading.value = true
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    const [rec, loc, monthlyData, workingHours] = await Promise.all([
      getTodayRecord(user.value.id),
      getShopLocation().catch(() => null),
      getEmployeeHours({
        employeeId: user.value.id,
        startDate: monthStart,
        endDate: today,
      }).catch(() => []),
      getSetting('working_hours').catch(() => null),
    ])
    record.value = rec
    shopLocation.value = loc

    if (workingHours?.hourly_rate) {
      hourlyRate.value = workingHours.hourly_rate
    }

    monthlyHours.value = monthlyData.reduce((a, r) => a + Number(r.total_hours || 0), 0)
    monthlyOvertime.value = monthlyData.reduce((a, r) => a + Number(r.overtime_hours || 0), 0)

    // Load previous 3 months
    const prevMonthsData = []
    for (let m = 1; m <= 3; m++) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const pStart = d.toISOString().split('T')[0]
      const pEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })

      try {
        const data = await getEmployeeHours({
          employeeId: user.value.id,
          startDate: pStart,
          endDate: pEnd,
        })
        const hours = data.reduce((a, r) => a + Number(r.total_hours || 0), 0)
        const overtime = data.reduce((a, r) => a + Number(r.overtime_hours || 0), 0)
        const otPay = Math.round(overtime * hourlyRate.value)
        prevMonthsData.push({ label, hours, overtime, otPay, totalPay: Number(profile.value?.salary || 0) + otPay })
      } catch (e) {
        prevMonthsData.push({ label, hours: 0, overtime: 0, otPay: 0, totalPay: Number(profile.value?.salary || 0) })
      }
    }
    previousMonths.value = prevMonthsData

    if (isClockedIn.value) {
      startTimer()
    }
  } catch (e) {
    toast.error('Failed to load attendance')
  } finally {
    loading.value = false
  }
}

async function handleClockIn() {
  locationBlocked.value = false
  acting.value = true

  try {
    const allowed = await checkLocation()
    if (!allowed) {
      acting.value = false
      return
    }

    record.value = await clockIn(user.value.id)
    startTimer()
    toast.success('Clocked in!')
  } catch (e) {
    toast.error(e.message || 'Failed to clock in')
  } finally {
    acting.value = false
  }
}

async function handleClockOut() {
  locationBlocked.value = false
  acting.value = true

  try {
    const allowed = await checkLocation()
    if (!allowed) {
      acting.value = false
      return
    }

    record.value = await clockOut(record.value.id)
    stopTimer()
    toast.success('Clocked out!')
  } catch (e) {
    toast.error(e.message || 'Failed to clock out')
  } finally {
    acting.value = false
  }
}

async function retryLocation() {
  locationBlocked.value = false
  geoError.value = null

  if (!record.value) {
    await handleClockIn()
  } else if (isClockedIn.value) {
    await handleClockOut()
  }
}

onMounted(loadRecord)
onUnmounted(stopTimer)
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] md:min-h-0">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-10 h-10 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- Desktop: card layout -->
      <div class="w-full max-w-2xl mx-auto md:grid md:grid-cols-2 md:gap-6">

        <!-- Clock button area -->
        <div class="flex flex-col items-center justify-center md:bg-white md:rounded-2xl md:shadow-soft md:p-8">
          <!-- Date -->
          <p class="text-sm text-gray-500 mb-2">
            {{ new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>

          <!-- Elapsed timer -->
          <div v-if="isClockedIn" class="mb-6">
            <p class="text-5xl font-mono font-bold text-gray-900 tabular-nums">{{ elapsed }}</p>
            <p class="text-sm text-gray-400 text-center mt-1">Time elapsed</p>
          </div>

          <!-- Not clocked in yet -->
          <div v-else-if="!record" class="mb-6 text-center">
            <p class="text-4xl font-bold text-gray-300">00:00:00</p>
            <p class="text-sm text-gray-400 mt-1">Ready to start your shift</p>
          </div>

          <!-- Already clocked out -->
          <div v-else-if="isClockedOut" class="mb-6 text-center">
            <p class="text-4xl font-bold text-green-600">Done</p>
            <p class="text-sm text-gray-400 mt-1">Shift completed for today</p>
          </div>

          <!-- Location blocked message -->
          <div v-if="locationBlocked" class="mb-4 w-full max-w-xs">
            <div class="bg-red-50 rounded-xl p-4 text-center">
              <svg class="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>

              <p v-if="geoError" class="text-sm text-red-600 font-medium mb-1">Location access required</p>
              <p v-else class="text-sm text-red-600 font-medium mb-1">You're too far from the shop</p>

              <p v-if="geoError" class="text-xs text-red-500 mb-3">{{ geoError }}</p>
              <p v-else class="text-xs text-red-500 mb-3">
                You are {{ locationDistance }}m away. You need to be within {{ shopLocation?.radius_meters }}m.
              </p>

              <button
                @click="retryLocation"
                class="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>

          <!-- Checking location indicator -->
          <div v-if="acting && geoLoading" class="mb-4">
            <p class="text-sm text-gray-400">Checking your location...</p>
          </div>

          <!-- Clock In button -->
          <button
            v-if="!record"
            @click="handleClockIn"
            :disabled="acting"
            class="w-40 h-40 md:w-36 md:h-36 rounded-full bg-green-500 text-white text-xl font-bold shadow-strong hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="acting">...</span>
            <span v-else>Clock In</span>
          </button>

          <!-- Clock Out button -->
          <button
            v-else-if="isClockedIn"
            @click="handleClockOut"
            :disabled="acting"
            class="w-40 h-40 md:w-36 md:h-36 rounded-full bg-red-500 text-white text-xl font-bold shadow-strong hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="acting">...</span>
            <span v-else>Clock Out</span>
          </button>
        </div>

        <!-- Today's summary (desktop shows alongside, mobile shows below) -->
        <div class="mt-8 md:mt-0 w-full md:bg-white md:rounded-2xl md:shadow-soft md:p-8">
          <h2 class="text-lg font-header font-bold text-gray-900 mb-4">Today's Summary</h2>

          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Status</span>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-xs font-medium',
                  isClockedIn ? 'bg-green-50 text-green-600' :
                  isClockedOut ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-50 text-yellow-600'
                ]"
              >
                {{ isClockedIn ? 'Clocked In' : isClockedOut ? 'Clocked Out' : 'Not Started' }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Clock In</span>
              <span class="text-sm font-medium text-gray-900">
                {{ record?.clock_in ? formatTime(record.clock_in) : '—' }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Clock Out</span>
              <span class="text-sm font-medium text-gray-900">
                {{ record?.clock_out ? formatTime(record.clock_out) : '—' }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Total Hours</span>
              <span class="text-sm font-medium text-gray-900">
                {{ formatHours(record?.total_hours) }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500">Overtime</span>
              <span
                :class="[
                  'text-sm font-medium',
                  record?.overtime_hours > 0 ? 'text-orange-600' : 'text-gray-900'
                ]"
              >
                {{ formatHours(record?.overtime_hours) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly summary -->
      <div class="w-full max-w-2xl mx-auto mt-6 bg-white rounded-2xl shadow-soft p-6">
        <h2 class="text-lg font-header font-bold text-gray-900 mb-4">This Month</h2>
        <div class="grid grid-cols-2 gap-4 text-center mb-3">
          <div>
            <p class="text-xs text-gray-400">Hours</p>
            <p class="text-xl font-bold text-purple">{{ formatHours(monthlyHours) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Overtime</p>
            <p :class="['text-xl font-bold', monthlyOvertime > 0 ? 'text-orange-600' : 'text-gray-400']">
              {{ formatHours(monthlyOvertime) }}
            </p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-gray-400">Salary</p>
            <p class="text-sm font-bold text-gray-900">{{ salary.toLocaleString('en-KE') }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">OT Pay</p>
            <p class="text-sm font-bold text-orange-600">{{ overtimePay.toLocaleString('en-KE') }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Total Pay</p>
            <p class="text-sm font-bold text-green-600">{{ totalPay.toLocaleString('en-KE') }}</p>
          </div>
        </div>
      </div>

      <!-- Previous months -->
      <div v-if="previousMonths.length > 0" class="w-full max-w-2xl mx-auto mt-4 space-y-3">
        <h2 class="text-sm font-semibold text-gray-500">Previous Months</h2>
        <div
          v-for="month in previousMonths"
          :key="month.label"
          class="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">{{ month.label }}</p>
            <p class="text-xs text-gray-400">{{ formatHours(month.hours) }} total &middot; {{ formatHours(month.overtime) }} OT</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-green-600">{{ month.totalPay.toLocaleString('en-KE') }} KES</p>
            <p v-if="month.otPay > 0" class="text-xs text-orange-600">+{{ month.otPay.toLocaleString('en-KE') }} OT</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
