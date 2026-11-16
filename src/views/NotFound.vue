<template>
  <section class="min-h-[70vh] flex items-center justify-center px-4 pt-32 pb-16">
    <div class="text-center max-w-md">
      <p class="text-pink font-bold text-lg mb-2">404</p>
      <h1 class="text-3xl sm:text-4xl font-bold font-header text-blue mb-4">This page doesn't exist</h1>
      <p class="text-gray-600 mb-8">The link may be old or mistyped. Here's where you can go instead:</p>
      <div class="flex flex-col sm:flex-row justify-center gap-3">
        <RouterLink to="/" class="bg-purple text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
          Go to Home
        </RouterLink>
        <RouterLink to="/experiences" class="bg-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
          See VR Experiences
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineOptions({ name: 'NotFoundPage' })
</script>
