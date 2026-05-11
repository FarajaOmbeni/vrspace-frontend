<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Layout from '@/Layouts/Layout.vue'
import emailjs from '@emailjs/browser'
import { Toaster } from 'vue-sonner'

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

const route = useRoute()
const isAdminRoute = computed(() => route.meta.isAdmin || route.path.startsWith('/admin'))
</script>

<template>
  <Toaster position="top-center" :expand="true" rich-colors />
  <Layout v-if="!isAdminRoute">
    <RouterView />
  </Layout>
  <RouterView v-else />
</template>
