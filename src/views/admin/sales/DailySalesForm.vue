<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { getDailySales, updatePartnerRevenue } from '@/services/salesService'
import { getSessionsByDate } from '@/services/sessionService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'DailySalesForm' })

const { user, isAdmin } = useAuth()

// Default to today
const selectedDate = ref(new Date().toISOString().split('T')[0])

const dailySales = ref(null)
const sessions = ref([])
const loading = ref(true)
const saving = ref(false)
const partnerRevenue = ref('')
const notes = ref('')

const sessionTotal = computed(() =>
  sessions.value.reduce((a, s) => a + Number(s.total_amount), 0)
)
const sessionCount = computed(() =>
  sessions.value.reduce((a, s) => a + s.session_count, 0)
)
const ourShare = computed(() => sessionTotal.value * 0.5)
const partnerShare = computed(() => sessionTotal.value * 0.5)
const discrepancy = computed(() => {
  if (!partnerRevenue.value && partnerRevenue.value !== 0) return null
  return sessionTotal.value - Number(partnerRevenue.value)
})

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

async function loadData() {
  loading.value = true
  try {
    const [salesData, sessionData] = await Promise.all([
      getDailySales(selectedDate.value),
      getSessionsByDate(selectedDate.value),
    ])
    dailySales.value = salesData
    sessions.value = sessionData

    if (salesData?.partner_reported_revenue != null) {
      partnerRevenue.value = salesData.partner_reported_revenue
    } else {
      partnerRevenue.value = ''
    }
    notes.value = salesData?.notes || ''
  } catch (e) {
    toast.error('Failed to load sales data')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (partnerRevenue.value === '' || partnerRevenue.value === null) {
    toast.error('Enter the partner reported revenue')
    return
  }

  saving.value = true
  try {
    await updatePartnerRevenue(
      selectedDate.value,
      Number(partnerRevenue.value),
      user.value.id,
      notes.value
    )
    await loadData()
    toast.success('Partner revenue saved')
  } catch (e) {
    toast.error(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

watch(selectedDate, loadData)
onMounted(loadData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl font-header font-bold text-gray-900">Daily Sales</h1>
      <input
        v-model="selectedDate"
        type="date"
        class="rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- Desktop: two columns -->
      <div class="md:grid md:grid-cols-2 md:gap-6">

        <!-- Session summary (read-only) -->
        <div class="bg-white rounded-xl shadow-soft p-6 mb-4 md:mb-0">
          <h2 class="text-lg font-header font-bold text-gray-900 mb-4">Session Summary</h2>

          <div v-if="sessions.length === 0" class="text-center py-6">
            <p class="text-gray-400">No sessions recorded for this date</p>
          </div>

          <div v-else class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Total Sessions</span>
              <span class="text-sm font-bold text-gray-900">{{ sessionCount }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Total Revenue</span>
              <span class="text-sm font-bold text-purple">{{ formatPrice(sessionTotal) }} KES</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Our Share (50%)</span>
              <span class="text-sm font-medium text-gray-900">{{ formatPrice(ourShare) }} KES</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500">Partner Share (50%)</span>
              <span class="text-sm font-medium text-gray-900">{{ formatPrice(partnerShare) }} KES</span>
            </div>
          </div>
        </div>

        <!-- Partner revenue input (admin only) -->
        <form v-if="isAdmin" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-soft p-6">
          <h2 class="text-lg font-header font-bold text-gray-900 mb-4">Partner Report</h2>

          <div class="mb-4">
            <label for="partnerRevenue" class="block text-sm font-medium text-gray-700 mb-1">
              Partner Reported Revenue (KES)
            </label>
            <input
              id="partnerRevenue"
              v-model.number="partnerRevenue"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter partner's total"
              class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <!-- Discrepancy display -->
          <div v-if="discrepancy !== null" class="mb-4 rounded-xl p-4"
            :class="[
              discrepancy === 0 ? 'bg-green-50' :
              'bg-red-50'
            ]"
          >
            <p class="text-sm font-medium"
              :class="[
                discrepancy === 0 ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ discrepancy === 0 ? 'Match! No discrepancy.' :
                 discrepancy > 0 ? `Our records are ${formatPrice(discrepancy)} KES higher` :
                 `Partner reports ${formatPrice(Math.abs(discrepancy))} KES more` }}
            </p>
          </div>

          <div class="mb-4">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              id="notes"
              v-model="notes"
              rows="2"
              placeholder="Any notes about this day's sales..."
              class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            :disabled="saving"
            class="w-full bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Saving...' : 'Save Partner Revenue' }}
          </button>
        </form>
      </div>
    </template>
  </div>
</template>
