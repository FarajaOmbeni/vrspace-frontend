<script setup>
import { ref, onMounted } from 'vue'
import { getPartnerStaffReport } from '@/services/partnerStaffService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'PartnerStaffReport' })

const report = ref([])
const loading = ref(false)

const today = new Date().toISOString().split('T')[0]
const startDate = ref(today)
const endDate = ref(today)

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

const totalClients = () => report.value.reduce((a, r) => a + r.total_clients, 0)
const totalSessions = () => report.value.reduce((a, r) => a + r.total_sessions, 0)
const totalRevenue = () => report.value.reduce((a, r) => a + r.total_revenue, 0)

async function loadReport() {
  loading.value = true
  try {
    report.value = await getPartnerStaffReport({
      startDate: startDate.value,
      endDate: endDate.value,
    })
  } catch (e) {
    toast.error('Failed to load report')
  } finally {
    loading.value = false
  }
}

onMounted(loadReport)
</script>

<template>
  <div>
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-1">Partner Staff Report</h1>
    <p class="text-sm text-gray-500 mb-6">See how many clients each partner staff member brought</p>

    <!-- Date range -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
        <input
          v-model="startDate"
          type="date"
          class="w-full rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple focus:ring-purple"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
        <input
          v-model="endDate"
          type="date"
          class="w-full rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple focus:ring-purple"
        />
      </div>
      <div class="flex items-end">
        <button
          @click="loadReport"
          :disabled="loading"
          class="bg-purple text-white font-semibold px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {{ loading ? 'Loading...' : 'Filter' }}
        </button>
      </div>
    </div>

    <!-- Totals -->
    <div class="bg-purple rounded-xl p-4 mb-4 text-white grid grid-cols-3 gap-4">
      <div>
        <p class="text-sm text-purple-200">Entries</p>
        <p class="text-xl font-bold">{{ totalClients() }}</p>
      </div>
      <div class="text-center">
        <p class="text-sm text-purple-200">Sessions</p>
        <p class="text-xl font-bold">{{ totalSessions() }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-purple-200">Revenue</p>
        <p class="text-xl font-bold">{{ formatPrice(totalRevenue()) }} KES</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="report.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No data for this period</p>
      <p class="text-gray-300 text-sm mt-1">Partner staff will appear here once sessions are logged with "Served by"</p>
    </div>

    <template v-else>
      <!-- Mobile: cards -->
      <div class="md:hidden space-y-3">
        <div
          v-for="(r, i) in report"
          :key="r.id"
          class="bg-white rounded-xl shadow-soft p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full bg-purple-50 text-purple text-xs font-bold flex items-center justify-center">{{ i + 1 }}</span>
              <p class="font-semibold text-gray-900">{{ r.full_name }}</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div>
              <p class="text-xs text-gray-400">Entries</p>
              <p class="text-sm font-bold text-gray-900">{{ r.total_clients }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Sessions</p>
              <p class="text-sm font-bold text-gray-900">{{ r.total_sessions }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Revenue</p>
              <p class="text-sm font-bold text-purple">{{ formatPrice(r.total_revenue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: table -->
      <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">#</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Staff Name</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Entries</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Sessions</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(r, i) in report" :key="r.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-400">{{ i + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ r.full_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ r.total_clients }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ r.total_sessions }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatPrice(r.total_revenue) }} KES</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
