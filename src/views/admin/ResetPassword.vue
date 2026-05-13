<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const ready = ref(false)
const invalidLink = ref(false)

onMounted(async () => {
  // PKCE flow: Supabase sends a ?code= param that must be exchanged for a session
  const code = route.query.code

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      invalidLink.value = true
      return
    }
    ready.value = true
    return
  }

  // Legacy/implicit flow: token comes via URL hash, handled automatically by Supabase
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      ready.value = true
    }
  })

  // Check if session already exists
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    ready.value = true
  } else {
    // No code, no session — invalid link
    setTimeout(() => {
      if (!ready.value) invalidLink.value = true
    }, 3000)
  }
})

async function handleSubmit() {
  error.value = ''

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (updateError) throw updateError

    await supabase.auth.signOut()
    toast.success('Password updated successfully. Please sign in.')
    router.push('/admin/login')
  } catch (e) {
    error.value = e.message || 'Failed to update password'
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
        <p class="text-purple-300 mt-1 text-sm">Set New Password</p>
      </div>

      <!-- Invalid link -->
      <div v-if="invalidLink" class="bg-white rounded-2xl shadow-strong p-6 space-y-5 text-center">
        <div class="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
          This reset link is invalid or has expired.
        </div>
        <RouterLink
          to="/forgot-password"
          class="block w-full bg-purple text-white font-semibold py-3 rounded-xl text-base text-center transition-colors hover:bg-purple-700"
        >
          Request a New Link
        </RouterLink>
      </div>

      <!-- Loading session -->
      <div v-else-if="!ready" class="text-center">
        <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin mx-auto mb-4" />
        <p class="text-purple-300 text-sm">Verifying reset link...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-strong p-6 space-y-5">
        <p class="text-gray-500 text-sm">
          Enter your new password below.
        </p>

        <div
          v-if="error"
          class="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3"
        >
          {{ error }}
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Enter new password"
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

        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="new-password"
            placeholder="Confirm new password"
            class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-purple text-white font-semibold py-3 rounded-xl text-base transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Updating...</span>
          <span v-else>Update Password</span>
        </button>
      </form>
    </div>
  </div>
</template>
