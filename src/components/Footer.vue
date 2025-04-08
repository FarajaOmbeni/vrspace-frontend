<template>
  <footer class="bg-white border-t-2 border-t-blue pt-12 sm:pt-16 pb-8">
    <!-- Call to Action Section -->
    <div class="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-2xl sm:text-3xl md:text-4xl text-blue font-header font-bold mb-4 sm:mb-6">Ready for a new reality?</h2>
        <p class="text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-6 sm:mb-8 text-gray-700 px-2 sm:px-0">
          Step into immersive worlds with our cutting-edge virtual reality technology. 
          Adventure awaits at Nairobi's premier VR venue.
        </p>
        <RouterLink to="/contact"
          class="inline-block text-white bg-purple py-3 sm:py-4 px-6 sm:px-10 rounded-full text-lg sm:text-xl font-bold transition-all duration-300 hover:shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-opacity-50">
          Book Your Session
        </RouterLink>
      </div>
    </div>

    <!-- Footer Links Section -->
    <div class="bg-blue py-10 sm:py-12">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="md:flex md:justify-between md:items-start mb-10">
          <!-- Company Info -->
          <div class="text-center md:text-left mb-8 md:mb-0">
            <h3 class="text-white text-2xl font-bold mb-2">VRSpace</h3>
            <p class="text-white/80 max-w-md">
              "More Than Just Games" - Experience the future of entertainment with our cutting-edge virtual reality experiences.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Quick Links -->
            <div class="text-center md:text-left">
              <h3 class="text-pink text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Links</h3>
              <ul class="space-y-2 sm:space-y-3">
                <li><QuickLink to="/" class="transition-colors duration-200 text-base sm:text-lg">Home</QuickLink></li>
                <li><QuickLink to="/about" class="transition-colors duration-200 text-base sm:text-lg">About Us</QuickLink></li>
                <li><QuickLink to="/experiences" class="transition-colors duration-200 text-base sm:text-lg">VR Experiences</QuickLink></li>
                <li><QuickLink to="/contact" class="transition-colors duration-200 text-base sm:text-lg">Contact Us</QuickLink></li>
              </ul>
            </div>

            <!-- Opening Hours -->
            <div class="text-center md:text-left">
              <h3 class="text-pink text-lg sm:text-xl font-bold mb-3 sm:mb-4">Opening Hours</h3>
              <ul class="space-y-2 sm:space-y-3 text-white">
                <li>Monday - Friday: 10am - 10pm</li>
                <li>Saturday: 10am - 11pm</li>
                <li>Sunday: 11am - 8pm</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div class="text-center md:text-left">
              <h3 class="text-pink text-lg sm:text-xl font-bold mb-3 sm:mb-4">Contact Us</h3>
              <ul class="space-y-2 sm:space-y-3 text-white">
                <li class="flex items-center justify-center md:justify-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>The Waterfront Karen (Basement), Nairobi</span>
                </li>
                <li class="flex items-center justify-center md:justify-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+254 729 054 606</span>
                </li>
                <li class="flex items-center justify-center md:justify-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@vrspace.co.ke</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="flex justify-center space-x-6 mb-8">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="text-white hover:text-pink transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="text-white hover:text-pink transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="text-white hover:text-pink transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="text-white hover:text-pink transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
            </svg>
          </a>
        </div>

        <!-- Copyright Section -->
        <div class="text-center text-white text-xs sm:text-sm border-t border-blue-800 pt-6">
          <p>&copy; 2023-{{ new Date().getFullYear() }} VR Space. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import QuickLink from '@/Shared/QuickLink.vue';
import { RouterLink } from 'vue-router';

// Component name definition
defineOptions({
  name: 'FooterComponent'
});
</script>

<style scoped>
/* Ensure footer sticks to bottom on short pages */
footer {
  display: flex;
  flex-direction: column;
}

/* Improve vertical spacing in footer columns */
.grid {
  row-gap: 2rem;
}
</style>