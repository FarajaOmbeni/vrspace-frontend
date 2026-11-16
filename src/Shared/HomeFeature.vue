<template>
  <div class="py-12 sm:py-16 md:py-24" :class="{ 'bg-gray-50 shaded': reverse }">
    <div class="container mx-auto px-4 sm:px-6">
      <div class="flex flex-col items-center gap-8 md:gap-12 xl:gap-20" :class="reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'">
        <!-- Image (Hidden on mobile, shown on desktop) -->
        <div class="hidden lg:block w-full lg:w-1/2">
          <div class="transform transition-transform duration-300 hover:scale-105 p-2">
            <img
              :src="image_link"
              :alt="title"
              class="w-full h-auto max-w-xl mx-auto rounded-lg shadow-xl"
              loading="lazy"
            >
          </div>
        </div>

        <!-- Content -->
        <div class="w-full lg:w-1/2 flex flex-col">
          <!-- Title (the shaded variant has always sat slightly closer to its image) -->
          <h2
            class="text-center lg:text-left text-2xl sm:text-3xl md:text-4xl text-blue font-header font-bold"
            :class="reverse ? 'mb-6 sm:mb-8' : 'mb-8 sm:mb-12'"
          >
            {{ title }}
          </h2>

          <!-- Image (Shown on mobile, hidden on desktop) -->
          <div class="lg:hidden mb-6 sm:mb-8">
            <img
              :src="image_link"
              :alt="title"
              class="w-full h-auto max-w-md mx-auto rounded-lg shadow-xl"
              loading="lazy"
            >
          </div>

          <!-- Divider -->
          <div class="border-b-4 border-b-blue my-4 sm:my-6 w-24 sm:w-32 mx-auto lg:mx-0"></div>

          <!-- Description -->
          <p class="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl leading-relaxed text-center lg:text-left">
            {{ description }}
          </p>

          <!-- Button -->
          <div class="flex justify-center lg:justify-start">
            <a
              v-if="isExternal"
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              :class="buttonClass"
            >
              {{ button }}
            </a>
            <RouterLink v-else :to="link" :class="buttonClass">
              {{ button }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

defineOptions({
  name: 'HomeFeature'
});

const props = defineProps({
  title: String,
  description: String,
  link: String,
  image_link: String,
  button: String,
  // Image on the right (desktop) and a shaded card background.
  reverse: Boolean,
});

const isExternal = computed(() => /^https?:/.test(props.link || ''));

const buttonClass = 'inline-block bg-purple text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-opacity-50';
</script>

<style scoped>
/* For smoother transitions on image hover */
.transform {
  will-change: transform;
}

/* Improve image display on high-DPI screens */
img {
  backface-visibility: hidden;
}

/* Subtle card-like effect for the shaded variant on smaller screens */
@media (max-width: 1023px) {
  .shaded {
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin: 0 0.5rem;
  }
}
</style>
