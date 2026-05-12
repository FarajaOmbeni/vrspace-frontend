<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createEmployee } from '@/services/employeeService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'EmployeeForm' })

const router = useRouter()

const form = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'employee',
})
const showPassword = ref(false)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await createEmployee(form.value)
    toast.success(`${form.value.full_name} added successfully`)
    router.push('/admin/employees')
  } catch (e) {
    toast.error(e.message || 'Failed to create employee')
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
      <h1 class="text-2xl font-header font-bold text-gray-900">Add Employee</h1>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-soft p-6 space-y-5">
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

      <!-- Email -->
      <div>
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

      <!-- Password -->
      <div>
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
          <option value="admin">Admin</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Creating...</span>
          <span v-else>Create Employee</span>
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
