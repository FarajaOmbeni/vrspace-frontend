<script setup>
import { ref, onMounted } from 'vue'
import { getDiscrepancies, resolveDiscrepancy } from '@/services/salesService'
import { useAuth } from '@/composables/useAuth'
import { toast } from 'vue-sonner'

defineOptions({ name: 'DiscrepancyView' })

const { user, isAdmin } = useAuth()
const records = ref([])
const loading = ref(true)
const filterStartDate = ref('')
const filterEndDate = ref('')
const showResolved = ref(false)
const resolvingId = ref(null)
const showResolveModal = ref(false)
const resolveTarget = ref(null)
const resolveWith = ref('partner')
const resolveNote = ref('')

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
      showResolved: showResolved.value,
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

function openResolveModal(record) {
  resolveTarget.value = record
  resolveWith.value = 'partner'
  resolveNote.value = ''
  showResolveModal.value = true
}

async function confirmResolve() {
  const record = resolveTarget.value
  if (!record) return
  resolvingId.value = record.id
  showResolveModal.value = false
  try {
    await resolveDiscrepancy(record.id, {
      resolvedBy: user.value.id,
      resolvedWith: resolveWith.value,
      notes: resolveNote.value,
    })
    toast.success('Discrepancy resolved')
    await loadData()
  } catch (e) {
    toast.error('Failed to resolve discrepancy')
  } finally {
    resolvingId.value = null
    resolveTarget.value = null
  }
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

    <!-- Show resolved toggle -->
    <div class="mb-4">
      <label class="inline-flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showResolved" @change="loadData" class="rounded border-gray-300 text-purple focus:ring-purple-500" />
        <span class="text-sm text-gray-600">Show resolved discrepancies</span>
      </label>
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
        :class="r.discrepancy_resolved ? 'border-l-gray-300' : (-r.discrepancy) > 0 ? 'border-l-green-500' : 'border-l-red-500'"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-gray-900 text-sm">{{ formatDate(r.date) }}</p>
          <span v-if="r.discrepancy_resolved" class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Resolved</span>
          <span v-else class="text-sm font-bold" :class="(-r.discrepancy) > 0 ? 'text-green-600' : 'text-red-600'">
            {{ (-r.discrepancy) > 0 ? '+' : '' }}{{ formatPrice(-r.discrepancy) }} KES
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
        <button
          v-if="isAdmin && !r.discrepancy_resolved"
          @click="openResolveModal(r)"
          :disabled="resolvingId === r.id"
          class="mt-3 w-full bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {{ resolvingId === r.id ? 'Resolving...' : 'Resolve' }}
        </button>
        <p v-else class="text-xs text-gray-400 mt-2">Resolved by {{ r.resolver?.full_name || '—' }}</p>
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
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatDate(r.date) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.total_revenue) }} KES</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(r.partner_reported_revenue) }} KES</td>
            <td class="px-6 py-4">
              <span v-if="r.discrepancy_resolved" class="text-sm font-medium text-gray-400">Resolved</span>
              <span v-else class="text-sm font-bold" :class="(-r.discrepancy) > 0 ? 'text-green-600' : 'text-red-600'">
                {{ (-r.discrepancy) > 0 ? '+' : '' }}{{ formatPrice(-r.discrepancy) }} KES
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ r.profiles?.full_name || '—' }}</td>
            <td class="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{{ r.notes || '—' }}</td>
            <td class="px-6 py-4">
              <button
                v-if="!r.discrepancy_resolved"
                @click="openResolveModal(r)"
                :disabled="resolvingId === r.id"
                class="bg-purple text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {{ resolvingId === r.id ? 'Resolving...' : 'Resolve' }}
              </button>
              <span v-else class="text-xs text-gray-400">{{ r.resolver?.full_name || '—' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>

    <!-- Resolve confirmation modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showResolveModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showResolveModal = false" />
        <div class="relative bg-white rounded-2xl shadow-strong w-full max-w-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Resolve Discrepancy</h3>
          <p class="text-sm text-gray-500 mb-4">
            Resolve the discrepancy for
            <span class="font-semibold text-gray-900">{{ resolveTarget ? formatDate(resolveTarget.date) : '' }}</span>
          </p>

          <div v-if="resolveTarget" class="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Our Records</span>
              <span class="font-medium text-gray-900">{{ formatPrice(resolveTarget.total_revenue) }} KES</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Partner Reported</span>
              <span class="font-medium text-gray-900">{{ formatPrice(resolveTarget.partner_reported_revenue) }} KES</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-2">
              <span class="text-gray-400">Difference</span>
              <span class="font-bold" :class="(-resolveTarget.discrepancy) > 0 ? 'text-green-600' : 'text-red-600'">
                {{ (-resolveTarget.discrepancy) > 0 ? '+' : '' }}{{ formatPrice(-resolveTarget.discrepancy) }} KES
              </span>
            </div>
          </div>

          <!-- Choose which records to go with -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 mb-2">Go with</label>
            <div class="space-y-2">
              <label
                class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors"
                :class="resolveWith === 'partner' ? 'border-purple bg-purple-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" v-model="resolveWith" value="partner" class="text-purple focus:ring-purple-500" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Partner's records</p>
                  <p class="text-xs text-gray-400">{{ formatPrice(resolveTarget?.partner_reported_revenue) }} KES</p>
                </div>
              </label>
              <label
                class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors"
                :class="resolveWith === 'ours' ? 'border-purple bg-purple-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" v-model="resolveWith" value="ours" class="text-purple focus:ring-purple-500" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Our records</p>
                  <p class="text-xs text-gray-400">{{ formatPrice(resolveTarget?.total_revenue) }} KES</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Resolution note -->
          <div class="mb-5">
            <label class="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
            <textarea
              v-model="resolveNote"
              rows="2"
              placeholder="Why was this resolved this way?"
              class="w-full rounded-xl border-gray-300 text-sm py-2 px-3 focus:border-purple-500 focus:ring-purple-500 resize-none"
            />
          </div>

          <div class="flex gap-3">
            <button
              @click="showResolveModal = false"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >Cancel</button>
            <button
              @click="confirmResolve"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-purple text-white hover:bg-purple-700 transition-colors"
            >Resolve</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
