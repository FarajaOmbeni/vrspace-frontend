import { ref, computed, readonly } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref(null)
const profile = ref(null)
const loading = ref(true)

const isAuthenticated = computed(() => !!user.value)
const isAdmin = computed(() => profile.value?.role === 'admin')

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch profile:', error.message)
    profile.value = null
    return
  }

  profile.value = data
}

async function init() {
  loading.value = true

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    user.value = session.user
    await fetchProfile(session.user.id)
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    } else {
      user.value = null
      profile.value = null
    }
  })

  loading.value = false
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  user.value = null
  profile.value = null
}

// Initialize on first import
init()

export function useAuth() {
  return {
    user: readonly(user),
    profile: readonly(profile),
    loading: readonly(loading),
    isAuthenticated,
    isAdmin,
    signIn,
    signOut
  }
}
