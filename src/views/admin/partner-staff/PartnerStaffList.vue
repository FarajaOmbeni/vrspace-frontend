<script setup>
import { ref, computed, onMounted } from 'vue'
import { listPartnerStaff, createPartnerStaff, updatePartnerStaff, togglePartnerStaffActive } from '@/services/partnerStaffService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'PartnerStaffList' })

const staff = ref([])
const loading = ref(true)
const filter = ref('all')

const showAddModal = ref(false)
const newName = ref('')
const adding = ref(false)

const showEditModal = ref(false)
const editId = ref(null)
const editName = ref('')
const editing = ref(false)

const filteredStaff = computed(() => {
  if (filter.value === 'active') return staff.value.filter((s) => s.is_active)
  if (filter.value === 'inactive') return staff.value.filter((s) => !s.is_active)
  return staff.value
})

async function loadStaff() {
  loading.value = true
  try {
    staff.value = await listPartnerStaff()
  } catch (e) {
    toast.error('Failed to load partner staff')
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  if (!newName.value.trim()) return
  adding.value = true
  try {
    await createPartnerStaff({ fullName: newName.value.trim() })
    toast.success('Partner staff added')
    newName.value = ''
    showAddModal.value = false
    await loadStaff()
  } catch (e) {
    toast.error(e.message || 'Failed to add')
  } finally {
    adding.value = false
  }
}

function openEdit(person) {
  editId.value = person.id
  editName.value = person.full_name
  showEditModal.value = true
}

async function handleEdit() {
  if (!editName.value.trim()) return
  editing.value = true
  try {
    await updatePartnerStaff(editId.value, { full_name: editName.value.trim() })
    toast.success('Name updated')
    showEditModal.value = false
    await loadStaff()
  } catch (e) {
    toast.error(e.message || 'Failed to update')
  } finally {
    editing.value = false
  }
}

async function handleToggle(person) {
  const newState = !person.is_active
  try {
    await togglePartnerStaffActive(person.id, newState)
    person.is_active = newState
    toast.success(`${person.full_name} ${newState ? 'activated' : 'deactivated'}`)
  } catch (e) {
    toast.error('Failed to update')
  }
}

onMounted(loadStaff)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-header font-bold text-gray-900">Partner Staff</h1>
        <p class="text-sm text-gray-500 mt-1">Company B's front-desk staff</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-purple text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto"
      >
        + Add Staff
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
    <div v-else-if="filteredStaff.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No partner staff found</p>
      <button
        @click="showAddModal = true"
        class="mt-4 text-purple font-medium text-sm hover:underline"
      >
        Add your first partner staff member
      </button>
    </div>

    <template v-else>
      <!-- Mobile: Card list -->
      <div class="md:hidden space-y-3">
        <div
          v-for="person in filteredStaff"
          :key="person.id"
          class="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between"
        >
          <div class="min-w-0 flex-1">
            <p class="font-medium text-gray-900 truncate">{{ person.full_name }}</p>
            <span
              :class="[
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                person.is_active
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500',
              ]"
            >
              {{ person.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="ml-3 flex items-center gap-2">
            <button
              @click="openEdit(person)"
              class="text-gray-400 hover:text-purple transition-colors p-1"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button
              @click="handleToggle(person)"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                person.is_active ? 'bg-green-500' : 'bg-gray-300',
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
                  person.is_active ? 'translate-x-5' : 'translate-x-0',
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop: Table -->
      <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="person in filteredStaff" :key="person.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ person.full_name }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                    person.is_active
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500',
                  ]"
                >
                  {{ person.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <button
                  @click="openEdit(person)"
                  class="text-sm font-medium text-purple hover:text-purple-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="handleToggle(person)"
                  :class="[
                    'text-sm font-medium transition-colors',
                    person.is_active
                      ? 'text-red-500 hover:text-red-700'
                      : 'text-green-600 hover:text-green-800',
                  ]"
                >
                  {{ person.is_active ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Add Modal -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showAddModal = false" />
          <div class="relative bg-white rounded-2xl shadow-strong w-full max-w-xs p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Add Partner Staff</h3>
            <input
              v-model="newName"
              type="text"
              placeholder="Full name"
              class="w-full rounded-xl border-gray-300 text-sm py-2.5 px-3 mb-4 focus:border-purple focus:ring-purple"
              @keyup.enter="handleAdd"
            />
            <div class="flex gap-3">
              <button
                @click="showAddModal = false"
                class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="handleAdd"
                :disabled="adding || !newName.trim()"
                class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {{ adding ? 'Adding...' : 'Add' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Edit Modal -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showEditModal = false" />
          <div class="relative bg-white rounded-2xl shadow-strong w-full max-w-xs p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Edit Name</h3>
            <input
              v-model="editName"
              type="text"
              placeholder="Full name"
              class="w-full rounded-xl border-gray-300 text-sm py-2.5 px-3 mb-4 focus:border-purple focus:ring-purple"
              @keyup.enter="handleEdit"
            />
            <div class="flex gap-3">
              <button
                @click="showEditModal = false"
                class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="handleEdit"
                :disabled="editing || !editName.trim()"
                class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {{ editing ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
