<script setup>
import { ref, onMounted } from 'vue'
import { getShopLocation, updateShopLocation } from '@/services/settingsService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'AdminSettings' })

const form = ref({
  name: '',
  lat: 0,
  lng: 0,
  radius_meters: 100,
})
const loading = ref(true)
const saving = ref(false)

async function loadSettings() {
  loading.value = true
  try {
    const loc = await getShopLocation()
    if (loc) {
      form.value = { ...loc }
    }
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
  </div>
</template>
