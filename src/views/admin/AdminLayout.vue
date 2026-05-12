<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { profile, isAdmin, signOut } = useAuth()

const showMoreMenu = ref(false)
const signingOut = ref(false)

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard', exact: true, show: isAdmin.value },
    { label: 'Clock', icon: 'clock', to: '/admin/clock', exact: true, show: true },
    { label: 'Sessions', icon: 'play', to: '/admin/sessions', exact: false, show: true },
    { label: 'Sales', icon: 'dollar', to: '/admin/sales', exact: true, show: true },
  ]
  return items.filter((i) => i.show)
})

const adminMenuItems = computed(() => [
  { label: 'Attendance Log', to: '/admin/attendance' },
  { label: 'Employee Hours', to: '/admin/attendance/hours' },
  { label: 'Sales Reports', to: '/admin/sales/reports' },
  { label: 'Discrepancies', to: '/admin/sales/discrepancies' },
  { label: 'Finance', to: '/admin/finance' },
  { label: 'Expense Templates', to: '/admin/finance/templates' },
  { label: 'Machines', to: '/admin/machines' },
  { label: 'Employees', to: '/admin/employees' },
  { label: 'Settings', to: '/admin/settings' },
])

function isActive(path, exact = false) {
  if (exact) return route.path === path
  return route.path === path || route.path.startsWith(path + '/')
}

async function handleSignOut() {
  signingOut.value = true
  try {
    await signOut()
  } catch (e) {
    console.error('Sign out error:', e)
  }
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-body">
    <!-- Signing out overlay -->
    <div
      v-if="signingOut"
      class="fixed inset-0 z-[100] bg-blue-950/90 flex flex-col items-center justify-center"
    >
      <div class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
      <p class="text-white text-lg font-medium">Signing out...</p>
    </div>

    <!-- Desktop: Sidebar -->
    <aside
      class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-blue-950 text-white"
    >
      <!-- Brand -->
      <div class="px-6 py-5 border-b border-white/10">
        <h1 class="text-xl font-header font-bold">VRSpace</h1>
        <p class="text-purple-300 text-xs mt-0.5">Staff Portal</p>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isActive(item.to, item.exact)
              ? 'bg-purple text-white'
              : 'text-gray-300 hover:bg-white/10 hover:text-white',
          ]"
        >
          <!-- Icons -->
          <svg v-if="item.icon === 'clock'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <svg v-if="item.icon === 'play'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg v-if="item.icon === 'dollar'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <svg v-if="item.icon === 'dashboard'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          {{ item.label }}
        </router-link>

        <!-- Admin section -->
        <template v-if="isAdmin">
          <div class="pt-4 pb-2 px-3">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
          </div>
          <router-link
            v-for="item in adminMenuItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center px-3 py-2 rounded-xl text-sm transition-colors',
              isActive(item.to, true)
                ? 'bg-purple text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white',
            ]"
          >
            {{ item.label }}
          </router-link>
        </template>
      </nav>

      <!-- User / Sign Out -->
      <div class="px-4 py-4 border-t border-white/10">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-sm font-medium truncate capitalize">{{ profile?.role }} - {{ profile?.full_name }}</p>
          </div>
          <button
            @click="handleSignOut"
            class="text-gray-400 hover:text-white transition-colors p-2"
            title="Sign Out"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile: Top bar -->
    <header class="md:hidden fixed top-0 inset-x-0 z-30 bg-blue-950 text-white px-4 py-3 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-header font-bold">VRSpace</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-purple-300 capitalize">{{ profile?.role }} - {{ profile?.full_name }}</span>
        <button
          @click="handleSignOut"
          class="text-gray-400 hover:text-white transition-colors"
          title="Sign Out"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main
      class="pt-14 pb-20 md:pt-0 md:pb-0 md:ml-64 min-h-screen"
    >
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <router-view />
      </div>
    </main>

    <!-- Mobile: More menu overlay -->
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showMoreMenu"
        class="md:hidden fixed inset-0 bg-black/50 z-40"
        @click="showMoreMenu = false"
      />
    </transition>

    <!-- Mobile: More menu sheet -->
    <transition
      enter-active-class="transition-transform duration-200 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-y-full"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="showMoreMenu"
        class="md:hidden fixed bottom-16 inset-x-0 z-50 bg-white rounded-t-2xl shadow-strong px-4 pt-4 pb-6"
      >
        <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Admin</p>
        <div class="space-y-1">
          <router-link
            v-for="item in adminMenuItems"
            :key="item.to"
            :to="item.to"
            @click="showMoreMenu = false"
            :class="[
              'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors',
              isActive(item.to, true)
                ? 'bg-purple-50 text-purple'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </transition>

    <!-- Mobile: Bottom tab bar -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200">
      <div class="flex justify-around">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="showMoreMenu = false"
          :class="[
            'flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors min-w-0 flex-1',
            isActive(item.to, item.exact) ? 'text-purple' : 'text-gray-400',
          ]"
        >
          <svg v-if="item.icon === 'clock'" class="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <svg v-if="item.icon === 'play'" class="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg v-if="item.icon === 'dollar'" class="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <svg v-if="item.icon === 'dashboard'" class="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>{{ item.label }}</span>
        </router-link>

        <!-- More tab (admin only) -->
        <button
          v-if="isAdmin"
          @click="showMoreMenu = !showMoreMenu"
          :class="[
            'flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors min-w-0 flex-1',
            showMoreMenu ? 'text-purple' : 'text-gray-400',
          ]"
        >
          <svg class="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          <span>More</span>
        </button>
      </div>
    </nav>
  </div>
</template>
