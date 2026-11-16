<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSessionsByDate } from '@/services/sessionService'
import { toast } from 'vue-sonner'
import { formatPrice, formatTime } from '@/utils/format'
import { todayEAT } from '@/utils/date'

defineOptions({ name: 'SessionHistory' })

const sessions = ref([])
const loading = ref(true)
const filterDate = ref(todayEAT())
const filterEmployeeId = ref('')

async function loadSessions() {
  loading.value = true
  filterEmployeeId.value = ''
  try {
    sessions.value = await getSessionsByDate(filterDate.value)
  } catch (e) {
    toast.error('Failed to load sessions')
  } finally {
    loading.value = false
  }
}

const employeeOptions = computed(() => {
  const map = new Map()
  for (const s of sessions.value) {
    if (s.employee_id && s.profiles?.full_name) {
      map.set(s.employee_id, s.profiles.full_name)
    }
  }
  return [...map.entries()]
    .map(([id, full_name]) => ({ id, full_name }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
})

const filteredSessions = computed(() => {
  if (!filterEmployeeId.value) return sessions.value
  return sessions.value.filter((s) => s.employee_id === filterEmployeeId.value)
})

const totalSessions = () => filteredSessions.value.reduce((a, s) => a + s.session_count, 0)
const totalRevenue = () => filteredSessions.value.reduce((a, s) => a + Number(s.total_amount), 0)

onMounted(loadSessions)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl font-header font-bold text-gray-900">Session History</h1>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="filterDate"
          type="date"
          @change="loadSessions"
          class="rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
        />
        <select
          v-if="employeeOptions.length > 0"
          v-model="filterEmployeeId"
          class="rounded-xl border-gray-300 pl-4 pr-10 py-2 text-sm focus:border-purple-500 focus:ring-purple-500 min-w-[180px] max-w-[240px]"
        >
          <option value="">All employees</option>
          <option v-for="e in employeeOptions" :key="e.id" :value="e.id">{{ e.full_name }}</option>
        </select>
      </div>
    </div>

    <!-- Totals -->
    <div class="bg-purple rounded-xl p-4 mb-4 text-white flex items-center justify-between">
      <div>
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
    <div v-else-if="filteredSessions.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No sessions for this date</p>
    </div>

    <template v-else>
    <!-- Mobile: cards -->
    <div class="md:hidden space-y-2">
      <div
        v-for="s in filteredSessions"
        :key="s.id"
        class="bg-white rounded-xl shadow-soft p-3 flex items-center justify-between"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ s.machines?.name }}</p>
          <p class="text-xs text-gray-500">by {{ s.profiles?.full_name }}</p>
          <p v-if="s.partner_staff?.full_name" class="text-xs text-blue-400">via {{ s.partner_staff.full_name }}</p>
          <p class="text-xs text-gray-400">{{ s.session_count }} x {{ formatPrice(s.price_per_session) }} = {{ formatPrice(s.total_amount) }} KES</p>
        </div>
        <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTime(s.created_at) }}</span>
      </div>

      <!-- Totals -->
      <div class="bg-gray-100 rounded-xl p-3 flex items-center justify-between">
        <p class="text-sm font-semibold text-gray-700">Total ({{ totalSessions() }} sessions)</p>
        <p class="text-sm font-bold text-gray-900">{{ formatPrice(totalRevenue()) }} KES</p>
      </div>
    </div>

    <!-- Desktop: table -->
    <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Machine</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Logged By</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Sessions</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Served By</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in filteredSessions" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ s.machines?.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ s.profiles?.full_name }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ s.session_count }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatPrice(s.total_amount) }} KES</td>
            <td class="px-6 py-4 text-sm text-blue-500">{{ s.partner_staff?.full_name || '—' }}</td>
            <td class="px-6 py-4 text-sm text-gray-400">{{ formatTime(s.created_at) }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 border-t-2 border-gray-200">
          <tr>
            <td class="px-6 py-3 text-sm font-semibold text-gray-700" colspan="2">Total</td>
            <td class="px-6 py-3 text-sm font-bold text-gray-900">{{ totalSessions() }}</td>
            <td class="px-6 py-3 text-sm font-bold text-purple">{{ formatPrice(totalRevenue()) }} KES</td>
            <td class="px-6 py-3" colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    </template>
  </div>
</template>
