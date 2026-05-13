<script setup>
import { ref, onMounted } from 'vue'
import { getDiscrepancies } from '@/services/salesService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'DiscrepancyView' })

const records = ref([])
const loading = ref(true)
const filterStartDate = ref('')
const filterEndDate = ref('')

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatPrice(amount) {
  if (amount == null) return '—'
  return Number(amount).toLocaleString('en-KE')
}

async function loadData() {
  loading.value = true
  try {
    records.value = await getDiscrepancies({
      startDate: filterStartDate.value || undefined,
      endDate: filterEndDate.value || undefined,
    })
  } catch (e) {
    toast.error('Failed to load discrepancies')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadData()
}

function clearFilters() {
  filterStartDate.value = ''
  filterEndDate.value = ''
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div>
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-6">Discrepancies</h1>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-4 space-y-3 md:space-y-0 md:flex md:items-end md:gap-4">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
        <input v-model="filterStartDate" type="date" class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500" />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
        <input v-model="filterEndDate" type="date" class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500" />
      </div>
      <div class="flex gap-2">
        <button @click="applyFilters" class="bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Filter</button>
        <button @click="clearFilters" class="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Clear</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="records.length === 0" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
        <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
      </div>
      <p class="text-gray-400 text-lg">No discrepancies found</p>
      <p class="text-gray-400 text-sm mt-1">All reported sales match your records</p>
    </div>

    <template v-else>
    <!-- Mobile: cards -->
    <div class="md:hidden space-y-3">
      <div
        v-for="r in records"
        :key="r.id"
        class="bg-white rounded-xl shadow-soft p-4 border-l-4"
        :class="r.discrepancy > 0 ? 'border-l-orange-500' : 'border-l-red-500'"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-gray-900 text-sm">{{ formatDate(r.date) }}</p>
          <span class="text-sm font-bold text-red-600">
            {{ r.discrepancy > 0 ? '+' : '' }}{{ formatPrice(r.discrepancy) }} KES
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-xs text-gray-400">Our Records</p>
            <p class="font-medium">{{ formatPrice(r.total_revenue) }} KES</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Partner Reported</p>
            <p class="font-medium">{{ formatPrice(r.partner_reported_revenue) }} KES</p>
          </div>
        </div>
        <p v-if="r.notes" class="text-xs text-gray-400 mt-2 italic">{{ r.notes }}</p>
      </div>
    </div>

    <!-- Desktop: table -->
    <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Our Revenue</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Partner Reported</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Discrepancy</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Logged By</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Notes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatDate(r.date) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.total_revenue) }} KES</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.partner_reported_revenue) }} KES</td>
            <td class="px-6 py-4">
              <span class="text-sm font-bold text-red-600">
                {{ r.discrepancy > 0 ? '+' : '' }}{{ formatPrice(r.discrepancy) }} KES
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ r.profiles?.full_name || '—' }}</td>
            <td class="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{{ r.notes || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>
  </div>
</template>
