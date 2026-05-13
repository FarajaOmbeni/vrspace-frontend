<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listEmployees, toggleEmployeeActive } from '@/services/employeeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'EmployeeList' })

const router = useRouter()
const employees = ref([])
const loading = ref(true)
const filter = ref('all') // 'all', 'active', 'inactive'

const filteredEmployees = computed(() => {
  if (filter.value === 'active') return employees.value.filter((e) => e.is_active)
  if (filter.value === 'inactive') return employees.value.filter((e) => !e.is_active)
  return employees.value
})

async function loadEmployees() {
  loading.value = true
  try {
    employees.value = await listEmployees()
  } catch (e) {
    toast.error('Failed to load employees')
  } finally {
    loading.value = false
  }
}

async function handleToggle(employee) {
  const newState = !employee.is_active
  try {
    await toggleEmployeeActive(employee.id, newState)
    employee.is_active = newState
    toast.success(`${employee.full_name} ${newState ? 'activated' : 'deactivated'}`)
  } catch (e) {
    toast.error('Failed to update employee')
  }
}

onMounted(loadEmployees)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-header font-bold text-gray-900">Employees</h1>
        <p class="text-sm text-gray-500 mt-1">{{ filteredEmployees.length }} employees</p>
      </div>
      <button
        @click="router.push('/admin/employees/new')"
        class="bg-purple text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto"
      >
        + Add Employee
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
    <div v-else-if="filteredEmployees.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No employees found</p>
      <button
        @click="router.push('/admin/employees/new')"
        class="mt-4 text-purple font-medium text-sm hover:underline"
      >
        Add your first employee
      </button>
    </div>

    <template v-else>
    <!-- Mobile: Card list -->
    <div class="md:hidden space-y-3">
      <div
        v-for="emp in filteredEmployees"
        :key="emp.id"
        class="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between"
      >
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900 truncate">{{ emp.full_name }}</p>
          <p class="text-sm text-gray-500 truncate">{{ emp.email }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span
              :class="[
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                emp.role === 'admin'
                  ? 'bg-purple-50 text-purple'
                  : 'bg-blue-50 text-blue-600',
              ]"
            >
              {{ emp.role }}
            </span>
            <span
              :class="[
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                emp.is_active
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500',
              ]"
            >
              {{ emp.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
        <div class="ml-3 flex items-center gap-2">
          <button
            @click="router.push(`/admin/employees/${emp.id}/edit`)"
            class="text-gray-400 hover:text-purple transition-colors p-1"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button
            @click="handleToggle(emp)"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
              emp.is_active ? 'bg-green-500' : 'bg-gray-300',
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
                emp.is_active ? 'translate-x-5' : 'translate-x-0',
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
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Email</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Role</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
            <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ emp.full_name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ emp.email }}</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  emp.role === 'admin'
                    ? 'bg-purple-50 text-purple'
                    : 'bg-blue-50 text-blue-600',
                ]"
              >
                {{ emp.role }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                  emp.is_active
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500',
                ]"
              >
                {{ emp.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3">
              <button
                @click="router.push(`/admin/employees/${emp.id}/edit`)"
                class="text-sm font-medium text-purple hover:text-purple-700 transition-colors"
              >
                Edit
              </button>
              <button
                @click="handleToggle(emp)"
                :class="[
                  'text-sm font-medium transition-colors',
                  emp.is_active
                    ? 'text-red-500 hover:text-red-700'
                    : 'text-green-600 hover:text-green-800',
                ]"
              >
                {{ emp.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>
  </div>
</template>
