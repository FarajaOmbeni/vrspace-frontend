<script setup>
import { ref, computed, onMounted } from 'vue'
import { listDailySales } from '@/services/salesService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'SalesReport' })

const records = ref([])
const loading = ref(true)

const filterPeriod = ref('week')
const filterStartDate = ref('')
const filterEndDate = ref('')

function getDateRange() {
  const now = new Date()
  let start, end

  if (filterPeriod.value === 'week') {
    const day = now.getDay()
    start = new Date(now)
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
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

const totalRevenue = computed(() => records.value.reduce((a, r) => a + Number(r.total_revenue || 0), 0))
const totalOurShare = computed(() => records.value.reduce((a, r) => a + Number(r.our_share || 0), 0))
const totalPartnerShare = computed(() => records.value.reduce((a, r) => a + Number(r.partner_share || 0), 0))

async function loadData() {
  loading.value = true
  try {
    const { startDate, endDate } = getDateRange()
    records.value = await listDailySales({ startDate, endDate })
  } catch (e) {
    toast.error('Failed to load sales')
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
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-6">Sales Reports</h1>

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
      <template v-if="filterPeriod === 'custom'">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input v-model="filterStartDate" type="date" class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input v-model="filterEndDate" type="date" class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <button @click="applyFilters" class="bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Apply</button>
      </template>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="records.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No sales data for this period</p>
    </div>

    <template v-else>
    <!-- Mobile: cards -->
    <div class="md:hidden space-y-3">
      <div
        v-for="r in records"
        :key="r.id"
        class="bg-white rounded-xl shadow-soft p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-gray-900 text-sm">{{ formatDate(r.date) }}</p>
          <span
            v-if="r.discrepancy != null && r.discrepancy !== 0"
            class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600"
          >
            {{ r.discrepancy > 0 ? '+' : '' }}{{ formatPrice(r.discrepancy) }}
          </span>
          <span v-else-if="r.partner_reported_revenue != null" class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">Match</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-xs text-gray-400">Sessions</p>
            <p class="font-medium">{{ r.total_sessions }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Revenue</p>
            <p class="font-medium text-purple">{{ formatPrice(r.total_revenue) }} KES</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Our Share</p>
            <p class="font-medium">{{ formatPrice(r.our_share) }} KES</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Partner Reported</p>
            <p class="font-medium">{{ formatPrice(r.partner_reported_revenue) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: table -->
    <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Sessions</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Revenue</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Our Share</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Partner Share</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Partner Reported</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Discrepancy</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatDate(r.date) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ r.total_sessions }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatPrice(r.total_revenue) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.our_share) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.partner_share) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.partner_reported_revenue) }}</td>
            <td class="px-6 py-4">
              <span v-if="r.discrepancy == null" class="text-sm text-gray-400">—</span>
              <span v-else-if="r.discrepancy === 0" class="text-sm font-medium text-green-600">Match</span>
              <span v-else class="text-sm font-medium text-red-600">{{ r.discrepancy > 0 ? '+' : '' }}{{ formatPrice(r.discrepancy) }}</span>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 border-t border-gray-200">
          <tr>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">{{ records.reduce((a, r) => a + r.total_sessions, 0) }}</td>
            <td class="px-6 py-3 text-sm font-bold text-purple">{{ formatPrice(totalRevenue) }}</td>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">{{ formatPrice(totalOurShare) }}</td>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">{{ formatPrice(totalPartnerShare) }}</td>
            <td class="px-6 py-3"></td>
            <td class="px-6 py-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    </template>
  </div>
</template>
