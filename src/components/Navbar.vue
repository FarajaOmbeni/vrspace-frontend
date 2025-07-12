<template>
  <nav class="bg-blue fixed w-full z-50 shadow-md transition-all duration-300">
    <div class="container mx-auto px-4 py-3">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <RouterLink to="/" class="transition-transform duration-300 hover:scale-105">
          <div class="flex items-center">
            <img class="w-16 sm:w-20 md:w-24" src="@/assets/images/navbar/vrspace_logo.png" alt="VRSpace Logo">
            <span class="text-white text-xl sm:text-2xl md:text-3xl font-bold ml-2">VRSpace</span>
          </div>
        </RouterLink>

        <!-- Mobile Menu Button -->
        <button @click="toggleMenu" class="md:hidden flex items-center text-white focus:outline-none"
          aria-label="Toggle navigation menu">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Desktop Navigation Menu -->
        <div class="hidden md:flex items-center space-x-4 lg:space-x-6">
          <NavLink to="/" :class="{ 'active': route.path === '/' }">Home</NavLink>
          <NavLink to="/about" :class="{ 'active': route.path === '/about' }">About Us</NavLink>
          <NavLink to="/experiences" :class="{ 'active': route.path === '/experiences' }">VR Experiences</NavLink>
          <NavLink to="/marketplace" :class="{ 'active': route.path === '/marketplace' }">Marketplace</NavLink>
          <NavLink to="/contact" :class="{ 'active': route.path === '/contact' }">Contact</NavLink>
          <RouterLink to="/contact"
            class="ml-2 bg-pink text-white py-2 px-4 rounded-full font-bold transition-all duration-300 hover:opacity-90 hover:shadow-md">
            Book Now
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-show="isMenuOpen"
      class="md:hidden bg-blue text-white py-4 px-4 shadow-lg transform transition-all duration-300">
      <div class="flex flex-col space-y-4">
        <NavLink to="/" :class="{ 'active': route.path === '/' }" @click="closeMenu">Home</NavLink>
        <NavLink to="/about" :class="{ 'active': route.path === '/about' }" @click="closeMenu">About Us</NavLink>
        <NavLink to="/experiences" :class="{ 'active': route.path === '/experiences' }" @click="closeMenu">VR
          Experiences</NavLink>
        <NavLink to="/marketplace" :class="{ 'active': route.path === '/marketplace' }" @click="closeMenu">Marketplace
        </NavLink>
        <NavLink to="/contact" :class="{ 'active': route.path === '/contact' }" @click="closeMenu">Contact</NavLink>
        <RouterLink to="/contact" @click="closeMenu"
          class="text-center bg-pink text-white py-2 px-4 rounded-full font-bold transition-all duration-300 hover:opacity-90 hover:shadow-md">
          Book Now
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import NavLink from '@/components/NavLink.vue';
import { useRoute } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';

// Component name definition
defineOptions({
  name: 'NavbarComponent'
});

const route = useRoute();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// Close menu when screen size changes to desktop view
const handleResize = () => {
  if (window.innerWidth >= 768 && isMenuOpen.value) {
    isMenuOpen.value = false;
  }
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  const nav = document.querySelector('nav');
  if (isMenuOpen.value && nav && !nav.contains(event.target)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.active {
  background-color: #F180C5 !important;
  color: #000133;
  font-weight: bold;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .active {
    display: block;
    width: 100%;
    text-align: center;
  }
}

/* Add some spacing on larger screens */
@media (min-width: 1024px) {
  .active {
    padding: 0.5rem 1.25rem;
  }
}
</style>