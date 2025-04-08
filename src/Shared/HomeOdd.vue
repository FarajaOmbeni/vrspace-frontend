<template>
  <div class="py-12 sm:py-16 md:py-24">
    <div class="container mx-auto px-4 sm:px-6">
      <div class="flex flex-col lg:flex-row items-center gap-8 md:gap-12 xl:gap-20">
        <!-- Image (Hidden on mobile, shown on desktop) -->
        <div class="hidden lg:block w-full lg:w-1/2">
          <div class="transform transition-transform duration-300 hover:scale-105 p-2">
            <img 
              :src="image_link" 
              alt="VR Experience" 
              class="w-full h-auto max-w-xl mx-auto rounded-lg shadow-xl"
              loading="lazy"
            >
          </div>
        </div>
        
        <!-- Content -->
        <div class="w-full lg:w-1/2 flex flex-col">
          <!-- Title -->
          <h2 class="mb-6 sm:mb-8 text-center lg:text-left">
            <span class="block mb-2 sm:mb-4 text-2xl sm:text-3xl md:text-4xl text-blue font-header font-bold">
              {{ title }}
            </span>
            <span class="text-2xl sm:text-3xl md:text-4xl text-blue font-header font-bold">{{ imagine }}</span>
            <span class="text-2xl sm:text-3xl md:text-4xl text-pink font-header font-bold">{{ explore }}</span>
            <span class="text-2xl sm:text-3xl md:text-4xl text-purple font-header font-bold">{{ experience }}</span>
          </h2>
          
          <!-- Image (Shown on mobile, hidden on desktop) -->
          <div class="lg:hidden mb-6 sm:mb-8">
            <img 
              :src="image_link" 
              alt="VR Experience" 
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
              :href="link" 
              class="inline-block bg-purple text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-opacity-50"
            >
              {{ button }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component name definition
defineOptions({
  name: 'HomeOddSection'
});

defineProps({
  title: String,
  description: String,
  link: String,
  image_link: String,
  button: String,
  imagine: String,
  explore: String,
  experience: String,
});
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
</style>