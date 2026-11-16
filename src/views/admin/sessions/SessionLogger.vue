<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { listMachines } from '@/services/machineService'
import { getTodaySessions, deleteSession, getTodayTotals } from '@/services/sessionService'
import { pendingSessions, logSessionOrQueue, flushPending, discardPending } from '@/services/sessionQueue'
import { listPartnerStaff } from '@/services/partnerStaffService'
import { toast } from 'vue-sonner'
import { formatPrice, formatTime } from '@/utils/format'

defineOptions({ name: 'SessionLogger' })

const { user, isAdmin } = useAuth()

const machines = ref([])
const sessions = ref([])
const totals = ref({ sessions: 0, revenue: 0 })
const partnerStaffList = ref([])
const loading = ref(true)

// Session modal
const showModal = ref(false)
const modalMachine = ref(null)
const modalCount = ref(1)
const modalPartnerStaffId = ref('')
const modalActing = ref(false)

// Sessions removed on screen but not yet deleted (waiting for "Undo" to expire).
const UNDO_MS = 5000
const hiddenIds = ref(new Set())

const visibleSessions = computed(() => sessions.value.filter((s) => !hiddenIds.value.has(s.id)))

// Today's totals minus anything waiting for Undo, plus anything waiting to sync.
const displayTotals = computed(() => {
  const hidden = sessions.value.filter((s) => hiddenIds.value.has(s.id))
  const pending = pendingSessions.value
  return {
    sessions: totals.value.sessions
      - hidden.reduce((a, s) => a + s.session_count, 0)
      + pending.reduce((a, s) => a + s.sessionCount, 0),
    revenue: totals.value.revenue
      - hidden.reduce((a, s) => a + Number(s.total_amount), 0)
      + pending.reduce((a, s) => a + s.sessionCount * Number(s.pricePerSession), 0),
  }
})

async function loadData() {
  loading.value = true
  try {
    const [machineData, sessionData, totalData, staffData] = await Promise.all([
      listMachines({ activeOnly: true }),
      getTodaySessions(user.value.id),
      getTodayTotals(),
      listPartnerStaff({ activeOnly: true }),
    ])
    machines.value = machineData
    sessions.value = sessionData
    totals.value = totalData
    partnerStaffList.value = staffData
  } catch (e) {
    toast.error('Failed to load data')
  } finally {
    loading.value = false
  }
}

async function refreshTotals() {
  try {
    const [sessionData, totalData] = await Promise.all([
      getTodaySessions(user.value.id),
      getTodayTotals(),
    ])
    sessions.value = sessionData
    totals.value = totalData
  } catch (e) {
    // silent
  }
}

function openModal(machine) {
  modalMachine.value = machine
  modalCount.value = 1
  modalPartnerStaffId.value = ''
  showModal.value = true
}

function incrementCount() {
  modalCount.value++
}

function decrementCount() {
  if (modalCount.value > 1) modalCount.value--
}

async function submitModal() {
  if (!modalMachine.value || modalCount.value < 1) return
  if (partnerStaffList.value.length > 0 && !modalPartnerStaffId.value) {
    toast.error('Select who brought the client')
    return
  }

  modalActing.value = true
  try {
    const label = `+${modalCount.value} ${modalMachine.value.name} session${modalCount.value > 1 ? 's' : ''}`
    const { queued } = await logSessionOrQueue({
      employeeId: user.value.id,
      machineId: modalMachine.value.id,
      machineName: modalMachine.value.name,
      sessionCount: modalCount.value,
      pricePerSession: modalMachine.value.price_per_session,
      partnerStaffId: modalPartnerStaffId.value || null,
    })
    if (queued) {
      toast.warning(`${label} saved on this phone — will sync when the connection is back`, { duration: 4000 })
    } else {
      await refreshTotals()
      toast.success(label, { duration: 2000 })
    }
    showModal.value = false
  } catch (e) {
    toast.error(e.message || 'Failed to log session')
  } finally {
    modalActing.value = false
  }
}

function setHidden(id, hidden) {
  const next = new Set(hiddenIds.value)
  hidden ? next.add(id) : next.delete(id)
  hiddenIds.value = next
}

// Remove from the screen straight away; only delete for real if "Undo"
// isn't tapped within a few seconds.
function handleDelete(session) {
  setHidden(session.id, true)
  const timer = setTimeout(async () => {
    try {
      await deleteSession(session.id)
      await refreshTotals()
    } catch (e) {
      toast.error(e.message || 'Failed to delete session')
    } finally {
      setHidden(session.id, false)
    }
  }, UNDO_MS)

  toast(`${session.machines?.name || 'Session'} removed`, {
    duration: UNDO_MS,
    action: {
      label: 'Undo',
      onClick: () => {
        clearTimeout(timer)
        setHidden(session.id, false)
      },
    },
  })
}

function handleDiscardPending(entry) {
  discardPending(entry.id)
  toast(`${entry.machineName} removed`)
}

async function syncPending() {
  if (!pendingSessions.value.length) return
  const { sent, stale, rejected } = await flushPending()
  if (sent) {
    toast.success(`${sent} saved session${sent > 1 ? 's' : ''} synced`)
    await refreshTotals()
  }
  if (stale.length) {
    toast.error(
      `${stale.length} session${stale.length > 1 ? 's' : ''} from a previous day couldn't be synced: ` +
        stale.map((e) => `${e.sessionCount} × ${e.machineName} (${e.queuedOn})`).join(', ') +
        '. Tell an admin so they can add them.',
      { duration: Infinity }
    )
  }
  for (const { entry, message } of rejected) {
    toast.error(`${entry.sessionCount} × ${entry.machineName} wasn't saved: ${message}`, { duration: Infinity })
  }
}

// Retry when the connection returns, and every 30 seconds while anything is waiting.
let retryTimer = null
onMounted(() => {
  loadData()
  syncPending()
  window.addEventListener('online', syncPending)
  retryTimer = setInterval(syncPending, 30000)
})
onUnmounted(() => {
  window.removeEventListener('online', syncPending)
  clearInterval(retryTimer)
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-10 h-10 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- View history link (admin only) -->
      <div v-if="isAdmin" class="flex justify-end mb-2">
        <router-link
          to="/admin/sessions/history"
          class="text-sm font-medium text-purple hover:text-purple-700 flex items-center gap-1"
        >
          View History
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>

      <!-- Today's totals -->
      <div class="bg-purple rounded-xl p-4 mb-4 text-white flex items-center justify-between">
        <div>
          <p class="text-sm text-purple-200">Today's Total</p>
          <p class="text-2xl font-bold">{{ displayTotals.sessions }} sessions</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-purple-200">Revenue</p>
          <p class="text-2xl font-bold">{{ formatPrice(displayTotals.revenue) }} KES</p>
        </div>
      </div>

      <!-- Desktop: split layout -->
      <div class="md:grid md:grid-cols-2 md:gap-6">

        <!-- Machine grid -->
        <div>
          <h2 class="text-lg font-header font-bold text-gray-900 mb-3">Log Session</h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="machine in machines"
              :key="machine.id"
              @click="openModal(machine)"
              class="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium active:scale-95 transition-all text-left"
            >
              <div class="aspect-square bg-gray-100">
                <img
                  v-if="machine.image_url"
                  :src="machine.image_url"
                  :alt="machine.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
              <div class="p-2">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ machine.name }}</p>
                <p class="text-xs text-purple font-medium">{{ formatPrice(machine.price_per_session) }} KES</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Session history -->
        <div class="mt-6 md:mt-0">
          <h2 class="text-lg font-header font-bold text-gray-900 mb-3">Today's Sessions</h2>

          <!-- Saved on this phone, waiting for a connection -->
          <div v-if="pendingSessions.length" class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
            <div class="flex items-center justify-between gap-3 mb-2">
              <p class="text-sm font-medium text-yellow-800">
                {{ pendingSessions.length }} waiting to sync — no connection
              </p>
              <button @click="syncPending" class="min-h-[40px] px-3 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-semibold">
                Retry now
              </button>
            </div>
            <div v-for="p in pendingSessions" :key="p.id" class="flex items-center justify-between py-1">
              <p class="text-sm text-yellow-900">{{ p.sessionCount }} × {{ p.machineName }}</p>
              <button
                @click="handleDiscardPending(p)"
                class="w-10 h-10 -my-1 flex items-center justify-center rounded-full text-yellow-700 hover:bg-yellow-100"
                :aria-label="`Remove ${p.machineName}`"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div v-if="visibleSessions.length === 0 && !pendingSessions.length" class="text-center py-8">
            <p class="text-gray-400">No sessions logged today</p>
          </div>

          <!-- Mobile: card list -->
          <div class="md:hidden space-y-2">
            <div
              v-for="s in visibleSessions"
              :key="s.id"
              class="bg-white rounded-xl shadow-soft p-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img v-if="s.machines?.image_url" :src="s.machines.image_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ s.machines?.name }}</p>
                  <p class="text-xs text-gray-400">{{ s.session_count }} x {{ formatPrice(s.price_per_session) }} = {{ formatPrice(s.total_amount) }} KES</p>
                  <p class="text-xs text-gray-300">by {{ s.profiles?.full_name }}</p>
                  <p v-if="s.partner_staff?.full_name" class="text-xs text-blue-400">via {{ s.partner_staff.full_name }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-gray-400">{{ formatTime(s.created_at) }}</span>
                <button
                  @click="handleDelete(s)"
                  class="w-11 h-11 -mr-1 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50"
                  :aria-label="`Remove ${s.machines?.name || 'session'}`"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop: table -->
          <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">Machine</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">Count</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">Amount</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">Logged By</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">Served By</th>
                  <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">Time</th>
                  <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in visibleSessions" :key="s.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ s.machines?.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ s.session_count }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-purple">{{ formatPrice(s.total_amount) }} KES</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ s.profiles?.full_name }}</td>
                  <td class="px-4 py-3 text-sm text-blue-500">{{ s.partner_staff?.full_name || '—' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-400">{{ formatTime(s.created_at) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button @click="handleDelete(s)" class="p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50" :aria-label="`Remove ${s.machines?.name || 'session'}`">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Session count modal -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50" @click="showModal = false" />

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-strong w-full max-w-xs p-6 text-center">
            <!-- Machine image -->
            <div class="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden mx-auto mb-3">
              <img
                v-if="modalMachine?.image_url"
                :src="modalMachine.image_url"
                :alt="modalMachine?.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>

            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ modalMachine?.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ formatPrice(modalMachine?.price_per_session) }} KES per session</p>

            <!-- Partner staff (who brought the client) -->
            <div v-if="partnerStaffList.length > 0" class="mb-4">
              <p class="text-xs text-gray-400 mb-2">Served by</p>

              <!-- 6 or fewer: wrapped pills -->
              <div v-if="partnerStaffList.length <= 6" class="flex flex-wrap justify-center gap-2">
                <button
                  v-for="staff in partnerStaffList"
                  :key="staff.id"
                  @click="modalPartnerStaffId = modalPartnerStaffId === staff.id ? '' : staff.id"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    modalPartnerStaffId === staff.id
                      ? 'bg-purple text-white shadow-soft'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ]"
                >
                  {{ staff.full_name }}
                </button>
              </div>

              <!-- More than 6: horizontal scroll -->
              <div v-else class="-mx-6 px-6">
                <div class="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  <button
                    v-for="staff in partnerStaffList"
                    :key="staff.id"
                    @click="modalPartnerStaffId = modalPartnerStaffId === staff.id ? '' : staff.id"
                    :class="[
                      'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                      modalPartnerStaffId === staff.id
                        ? 'bg-purple text-white shadow-soft'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    ]"
                  >
                    {{ staff.full_name }}
                  </button>
                </div>
                <p class="text-[10px] text-gray-300 mt-1">Swipe for more</p>
              </div>
            </div>

            <!-- Counter -->
            <div class="flex items-center justify-center gap-4 mb-4">
              <button
                @click="decrementCount"
                :disabled="modalCount <= 1"
                class="w-12 h-12 rounded-full bg-gray-100 text-gray-700 text-2xl font-bold flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                v-model.number="modalCount"
                type="number"
                inputmode="numeric"
                min="1"
                class="w-20 text-center text-3xl font-bold text-gray-900 border-0 border-b-2 border-gray-200 focus:border-purple focus:ring-0 p-0"
              />
              <button
                @click="incrementCount"
                class="w-12 h-12 rounded-full bg-purple text-white text-2xl font-bold flex items-center justify-center hover:bg-purple-700 transition-colors"
              >
                +
              </button>
            </div>

            <!-- Total -->
            <p class="text-sm text-gray-500 mb-4">
              Total: <span class="font-bold text-purple">{{ formatPrice(modalCount * (modalMachine?.price_per_session || 0)) }} KES</span>
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="showModal = false"
                class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitModal"
                :disabled="modalActing || modalCount < 1 || (partnerStaffList.length > 0 && !modalPartnerStaffId)"
                class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {{ modalActing ? 'Logging...' : 'Log' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
