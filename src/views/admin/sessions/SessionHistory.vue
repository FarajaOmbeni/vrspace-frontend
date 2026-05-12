<script setup>
import { ref, onMounted } from 'vue'
import { getSessionsByDate } from '@/services/sessionService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'SessionHistory' })

const sessions = ref([])
const loading = ref(true)
const filterDate = ref(new Date().toISOString().split('T')[0])

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadSessions() {
  loading.value = true
  try {
    sessions.value = await getSessionsByDate(filterDate.value)
  } catch (e) {
    toast.error('Failed to load sessions')
  } finally {
    loading.value = false
  }
}

const totalSessions = () => sessions.value.reduce((a, s) => a + s.session_count, 0)
const totalRevenue = () => sessions.value.reduce((a, s) => a + Number(s.total_amount), 0)

onMounted(loadSessions)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl font-header font-bold text-gray-900">Session History</h1>
      <input
        v-model="filterDate"
        type="date"
        @change="loadSessions"
        class="rounded-xl border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
      />
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
    <div v-else-if="sessions.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No sessions for this date</p>
    </div>

    <!-- Mobile: cards -->
    <div v-else class="md:hidden space-y-2">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="bg-white rounded-xl shadow-soft p-3 flex items-center justify-between"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ s.machines?.name }}</p>
          <p class="text-xs text-gray-500">by {{ s.profiles?.full_name }}</p>
          <p class="text-xs text-gray-400">{{ s.session_count }} x {{ formatPrice(s.price_per_session) }} = {{ formatPrice(s.total_amount) }} KES</p>
        </div>
        <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTime(s.created_at) }}</span>
      </div>
    </div>

    <!-- Desktop: table -->
    <div v-else class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Machine</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Logged By</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Sessions</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in sessions" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ s.machines?.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ s.profiles?.full_name }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ s.session_count }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatPrice(s.total_amount) }} KES</td>
            <td class="px-6 py-4 text-sm text-gray-400">{{ formatTime(s.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
