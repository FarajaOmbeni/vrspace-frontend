<script setup>
import { ref, onMounted } from 'vue'
import { getShopLocation, updateShopLocation, getSetting, updateSetting } from '@/services/settingsService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'AdminSettings' })

const form = ref({
  name: '',
  lat: 0,
  lng: 0,
  radius_meters: 100,
})
const hoursForm = ref({
  opening_hour: 11,
  closing_hour: 22,
  hourly_rate: 400,
  timezone: 'Africa/Nairobi',
})
const loading = ref(true)
const saving = ref(false)
const savingHours = ref(false)

function formatHour(h) {
  const period = h >= 12 ? 'PM' : 'AM'
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:00 ${period}`
}

async function loadSettings() {
  loading.value = true
  try {
    const [loc, hours] = await Promise.all([
      getShopLocation().catch(() => null),
      getSetting('working_hours').catch(() => null),
    ])
    if (loc) form.value = { ...loc }
    if (hours) hoursForm.value = { ...hours }
  } catch (e) {
    toast.error('Failed to load settings')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await updateShopLocation(form.value)
    toast.success('Shop location updated')
  } catch (e) {
    toast.error(e.message || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

async function handleSaveHours() {
  savingHours.value = true
  try {
    await updateSetting('working_hours', hoursForm.value)
    toast.success('Working hours updated')
  } catch (e) {
    toast.error(e.message || 'Failed to save working hours')
  } finally {
    savingHours.value = false
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    toast.error('Geolocation not supported')
    return
  }

  toast.info('Getting your location...')

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.lat = parseFloat(pos.coords.latitude.toFixed(6))
      form.value.lng = parseFloat(pos.coords.longitude.toFixed(6))
      toast.success('Location set to your current position')
    },
    () => {
      toast.error('Failed to get location. Enable location access and try again.')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

onMounted(loadSettings)
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-6">Settings</h1>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <form v-else @submit.prevent="handleSave" class="space-y-6">
      <!-- Shop Location -->
      <div class="bg-white rounded-xl shadow-soft p-6">
        <h2 class="text-lg font-header font-bold text-gray-900 mb-1">Shop Location</h2>
        <p class="text-sm text-gray-500 mb-4">Employees must be within the allowed radius to clock in.</p>

        <!-- Location name -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="e.g. VRSpace - The Waterfront Karen"
            class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label for="lat" class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              id="lat"
              v-model.number="form.lat"
              type="number"
              step="0.0000001"
              required
              class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label for="lng" class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              id="lng"
              v-model.number="form.lng"
              type="number"
              step="0.0000001"
              required
              class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2 mb-4">
          <button
            type="button"
            @click="useMyLocation"
            class="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Use My Location
          </button>
          <a
            v-if="form.lat && form.lng"
            :href="`https://www.google.com/maps?q=${form.lat},${form.lng}`"
            target="_blank"
            rel="noopener"
            class="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-medium py-2.5 rounded-xl text-sm hover:bg-blue-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            View on Map
          </a>
        </div>

        <!-- Radius -->
        <div>
          <label for="radius" class="block text-sm font-medium text-gray-700 mb-1">
            Allowed Radius (meters)
          </label>
          <input
            id="radius"
            v-model.number="form.radius_meters"
            type="number"
            min="10"
            max="5000"
            step="10"
            required
            class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
          />
          <p class="text-xs text-gray-400 mt-1">Employees must be within this distance to clock in/out</p>
        </div>
      </div>

      <!-- Save -->
      <button
        type="submit"
        :disabled="saving"
        class="w-full bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="saving">Saving...</span>
        <span v-else>Save Settings</span>
      </button>
    </form>

    <!-- Working Hours -->
    <form v-if="!loading" @submit.prevent="handleSaveHours" class="space-y-6 mt-6">
      <div class="bg-white rounded-xl shadow-soft p-6">
        <h2 class="text-lg font-header font-bold text-gray-900 mb-1">Working Hours</h2>
        <p class="text-sm text-gray-500 mb-4">Hours worked after the closing time count as overtime.</p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label for="opening" class="block text-sm font-medium text-gray-700 mb-1">Opening Hour</label>
            <select
              id="opening"
              v-model.number="hoursForm.opening_hour"
              class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
            >
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ formatHour(h-1) }}</option>
            </select>
          </div>
          <div>
            <label for="closing" class="block text-sm font-medium text-gray-700 mb-1">Closing Hour</label>
            <select
              id="closing"
              v-model.number="hoursForm.closing_hour"
              class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
            >
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ formatHour(h-1) }}</option>
            </select>
          </div>
        </div>

        <!-- Hourly Rate -->
        <div class="mb-4">
          <label for="hourlyRate" class="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (KES)</label>
          <input
            id="hourlyRate"
            v-model.number="hoursForm.hourly_rate"
            type="number"
            min="0"
            step="50"
            required
            class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
          />
          <p class="text-xs text-gray-400 mt-1">Used to calculate employee pay</p>
        </div>

        <!-- Timezone -->
        <div class="mb-4">
          <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            id="timezone"
            v-model="hoursForm.timezone"
            class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
            <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam (EAT, UTC+3)</option>
            <option value="Africa/Kampala">Africa/Kampala (EAT, UTC+3)</option>
            <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
            <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
            <option value="UTC">UTC</option>
          </select>
          <p class="text-xs text-gray-400 mt-1">Used for overtime calculation (closing hour is in this timezone)</p>
        </div>

        <p class="text-xs text-gray-400">
          Current: {{ formatHour(hoursForm.opening_hour) }} — {{ formatHour(hoursForm.closing_hour) }}.
          Overtime starts after {{ formatHour(hoursForm.closing_hour) }}.
          Pay: {{ hoursForm.hourly_rate }} KES/hr. Timezone: {{ hoursForm.timezone }}.
        </p>
      </div>

      <button
        type="submit"
        :disabled="savingHours"
        class="w-full bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="savingHours">Saving...</span>
        <span v-else>Save Working Hours</span>
      </button>
    </form>
  </div>
</template>
