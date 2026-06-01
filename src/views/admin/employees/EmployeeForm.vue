<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createEmployee, getEmployee, updateEmployee } from '@/services/employeeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'EmployeeForm' })

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'employee',
  salary: 0,
})
const showPassword = ref(false)
const loading = ref(false)
const loadingData = ref(false)

onMounted(async () => {
  if (isEdit.value) {
    loadingData.value = true
    try {
      const emp = await getEmployee(route.params.id)
      form.value = {
        full_name: emp.full_name,
        email: emp.email,
        password: '',
        role: emp.role,
        salary: emp.salary || 0,
      }
    } catch (e) {
      toast.error('Failed to load employee')
      router.push('/admin/employees')
    } finally {
      loadingData.value = false
    }
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    if (isEdit.value) {
      await updateEmployee(route.params.id, {
        full_name: form.value.full_name,
        role: form.value.role,
        salary: form.value.salary,
      })
      toast.success(`${form.value.full_name} updated successfully`)
    } else {
      await createEmployee(form.value)
      toast.success(`${form.value.full_name} added successfully`)
    }
    router.push('/admin/employees')
  } catch (e) {
    toast.error(e.message || `Failed to ${isEdit.value ? 'update' : 'create'} employee`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.back()"
        class="text-gray-400 hover:text-gray-600 transition-colors p-1"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h1 class="text-2xl font-header font-bold text-gray-900">
        {{ isEdit ? 'Edit Employee' : 'Add Employee' }}
      </h1>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-soft p-6 space-y-5">
      <!-- Full Name -->
      <div>
        <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="full_name"
          v-model="form.full_name"
          type="text"
          required
          placeholder="John Doe"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <!-- Email (only on create) -->
      <div v-if="!isEdit">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="employee@vrspace.co.ke"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <!-- Email (read-only on edit) -->
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p class="px-4 py-3 text-base text-gray-500 bg-gray-50 rounded-xl">{{ form.email }}</p>
      </div>

      <!-- Password (only on create) -->
      <div v-if="!isEdit">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            placeholder="Min 6 characters"
            class="w-full rounded-xl border-gray-300 px-4 py-3 pr-12 text-base focus:border-purple-500 focus:ring-purple-500"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <!-- Role -->
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          v-model="form.role"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <!-- Salary -->
      <div>
        <label for="salary" class="block text-sm font-medium text-gray-700 mb-1">
          Monthly Salary (KES)
        </label>
        <input
          id="salary"
          v-model.number="form.salary"
          type="number"
          min="0"
          step="500"
          placeholder="e.g. 25000"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">{{ isEdit ? 'Saving...' : 'Creating...' }}</span>
          <span v-else>{{ isEdit ? 'Save Changes' : 'Create Employee' }}</span>
        </button>
        <button
          type="button"
          @click="router.back()"
          class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-base hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
