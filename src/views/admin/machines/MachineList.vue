<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listMachines, toggleMachineActive } from '@/services/machineService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'MachineList' })

const router = useRouter()
const machines = ref([])
const loading = ref(true)
const filter = ref('all')

const filteredMachines = computed(() => {
  if (filter.value === 'active') return machines.value.filter((m) => m.is_active)
  if (filter.value === 'inactive') return machines.value.filter((m) => !m.is_active)
  return machines.value
})

async function loadMachines() {
  loading.value = true
  try {
    machines.value = await listMachines()
  } catch (e) {
    toast.error('Failed to load machines')
  } finally {
    loading.value = false
  }
}

async function handleToggle(machine) {
  const newState = !machine.is_active
  try {
    await toggleMachineActive(machine.id, newState)
    machine.is_active = newState
    toast.success(`${machine.name} ${newState ? 'activated' : 'deactivated'}`)
  } catch (e) {
    toast.error('Failed to update machine')
  }
}

function formatPrice(price) {
  return Number(price).toLocaleString('en-KE')
}

onMounted(loadMachines)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-header font-bold text-gray-900">Machines</h1>
        <p class="text-sm text-gray-500 mt-1">{{ filteredMachines.length }} machines</p>
      </div>
      <button
        @click="router.push('/admin/machines/new')"
        class="bg-purple text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto"
      >
        + Add Machine
      </button>
    </div>

    <!-- Filter -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="opt in ['all', 'active', 'inactive']"
        :key="opt"
        @click="filter = opt"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize',
          filter === opt
            ? 'bg-purple text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
      >
        {{ opt }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="filteredMachines.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No machines found</p>
      <button
        @click="router.push('/admin/machines/new')"
        class="mt-4 text-purple font-medium text-sm hover:underline"
      >
        Add your first machine
      </button>
    </div>

    <!-- Mobile: Card grid -->
    <div v-else class="md:hidden grid grid-cols-2 gap-3">
      <div
        v-for="machine in filteredMachines"
        :key="machine.id"
        class="bg-white rounded-xl shadow-soft overflow-hidden flex flex-col"
      >
        <!-- Image -->
        <div class="aspect-square bg-gray-100 relative">
          <img
            v-if="machine.image_url"
            :src="machine.image_url"
            :alt="machine.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          </div>
          <span
            :class="[
              'absolute top-2 left-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium',
              machine.is_active
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white',
            ]"
          >
            {{ machine.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Info -->
        <div class="p-3 flex-1 flex flex-col">
          <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ machine.name }}</h3>
          <p class="text-purple font-bold">{{ formatPrice(machine.price_per_session) }} KES</p>

          <div class="flex items-center justify-between mt-auto pt-2">
            <button
              @click="router.push(`/admin/machines/${machine.id}/edit`)"
              class="text-xs text-purple font-medium hover:underline"
            >
              Edit
            </button>
            <button
              @click="handleToggle(machine)"
              :class="[
                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                machine.is_active ? 'bg-green-500' : 'bg-gray-300',
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform',
                  machine.is_active ? 'translate-x-4' : 'translate-x-0',
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: Table -->
    <div v-else class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Image</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Price / Session</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
            <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="machine in filteredMachines" :key="machine.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                <img v-if="machine.image_url" :src="machine.image_url" :alt="machine.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ machine.name }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatPrice(machine.price_per_session) }} KES</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                  machine.is_active
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500',
                ]"
              >
                {{ machine.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3">
              <button
                @click="router.push(`/admin/machines/${machine.id}/edit`)"
                class="text-sm font-medium text-purple hover:text-purple-700 transition-colors"
              >
                Edit
              </button>
              <button
                @click="handleToggle(machine)"
                :class="[
                  'text-sm font-medium transition-colors',
                  machine.is_active
                    ? 'text-red-500 hover:text-red-700'
                    : 'text-green-600 hover:text-green-800',
                ]"
              >
                {{ machine.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile: FAB -->
    <button
      @click="router.push('/admin/machines/new')"
      class="md:hidden fixed right-4 bottom-20 z-20 w-14 h-14 bg-purple text-white rounded-full shadow-strong flex items-center justify-center hover:bg-purple-700 transition-colors"
    >
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</template>
