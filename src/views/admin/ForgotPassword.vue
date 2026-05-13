<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { resetPasswordForEmail } = useAuth()

const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    await resetPasswordForEmail(email.value)
    sent.value = true
  } catch (e) {
    error.value = e.message || 'Failed to send reset link'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-blue-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-header font-bold text-white">VRSpace</h1>
        <p class="text-purple-300 mt-1 text-sm">Reset Password</p>
      </div>

      <!-- Success state -->
      <div v-if="sent" class="bg-white rounded-2xl shadow-strong p-6 space-y-5 text-center">
        <div class="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3">
          Check your email for a password reset link.
        </div>
        <p class="text-gray-500 text-sm">
          We sent a reset link to <strong>{{ email }}</strong>. Click the link in the email to set a new password.
        </p>
        <RouterLink
          to="/admin/login"
          class="block w-full bg-purple text-white font-semibold py-3 rounded-xl text-base text-center transition-colors hover:bg-purple-700"
        >
          Back to Sign In
        </RouterLink>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-strong p-6 space-y-5">
        <p class="text-gray-500 text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <div
          v-if="error"
          class="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3"
        >
          {{ error }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@vrspace.co.ke"
            class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-purple text-white font-semibold py-3 rounded-xl text-base transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Sending...</span>
          <span v-else>Send Reset Link</span>
        </button>

        <div class="text-center">
          <RouterLink
            to="/admin/login"
            class="text-sm text-purple hover:text-purple-700 font-medium"
          >
            Back to Sign In
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
