<template>
  <!-- Hero Section -->
  <section class="hero min-h-screen bg-cover bg-center flex items-center justify-center py-20 mb-16 md:mb-20">
    <div class="container mx-auto px-4 sm:px-6">
      <div class="max-w-5xl mx-auto text-center lg:text-right">
        <h1 class="font-header text-4xl sm:text-5xl md:text-6xl font-bold text-violet-400 mb-3 px-4 sm:px-0">Discover Our</h1>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue mb-6 md:mb-8 px-4 sm:px-0">VR Experiences</h2>
        <div class="px-4 sm:px-0">
          <p class="leading-7 md:leading-8 text-base sm:text-lg md:text-xl font-bold text-gray-900 rounded-xl bg-home_text shadow-xl py-4 sm:py-6 px-4 sm:px-6 max-w-3xl mx-auto lg:ml-auto lg:mr-0 mb-6 md:mb-8">
            Step into immersive worlds with our cutting-edge virtual reality technology. Adventure awaits at Nairobi's premier VR venue.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row justify-center lg:justify-end gap-4 px-4 sm:px-0">
          <RouterLink to="/experiences"
            class="text-white flex justify-center items-center rounded-full bg-purple w-full sm:w-auto h-14 md:h-16 py-3 px-6 md:px-8 text-lg md:text-xl font-bold transition-all duration-300 hover:opacity-90 hover:shadow-lg">
            Explore Experiences
          </RouterLink>
          <RouterLink to="/contact"
            class="text-white flex justify-center items-center rounded-full bg-blue w-full sm:w-auto h-14 md:h-16 py-3 px-6 md:px-8 text-lg md:text-xl font-bold transition-all duration-300 hover:opacity-90 hover:shadow-lg">
            Book Now
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="container mx-auto px-4 sm:px-6 mb-16 md:mb-20">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
      <div class="bg-blue/10 p-6 rounded-lg text-center">
        <p class="text-3xl md:text-4xl font-bold text-blue mb-2">3+</p>
        <p class="text-lg font-medium">VR Platforms</p>
      </div>
      <div class="bg-blue/10 p-6 rounded-lg text-center">
        <p class="text-3xl md:text-4xl font-bold text-blue mb-2">50+</p>
        <p class="text-lg font-medium">Games & Experiences</p>
      </div>
      <div class="bg-blue/10 p-6 rounded-lg text-center">
        <p class="text-3xl md:text-4xl font-bold text-blue mb-2">10k+</p>
        <p class="text-lg font-medium">Happy Customers</p>
      </div>
      <div class="bg-blue/10 p-6 rounded-lg text-center">
        <p class="text-3xl md:text-4xl font-bold text-blue mb-2">4.8</p>
        <p class="text-lg font-medium">Star Rating</p>
      </div>
    </div>
  </section>

  <!-- Current VR Experiences Section -->
  <section class="container mx-auto px-4 sm:px-6 mb-16 md:mb-20">
    <div class="text-center mb-12">
      <p class="text-pink inline-block font-medium mb-2 py-1 px-4 rounded-full bg-pink/10">Available Now</p>
      <h2 class="text-3xl sm:text-4xl font-bold font-header text-blue mb-4">Current VR Experiences</h2>
      <p class="text-lg max-w-3xl mx-auto">Choose from our premium selection of virtual reality experiences available at VR Space since February 2023</p>
    </div>

    <!-- Experience Cards - we'll keep using the HomeOdd and HomeEven components but with updated content -->
    <HomeOdd 
      title="HTC Vive VR" 
      :image_link="on_demand"
      description="Experience premium interactive VR games with our high-quality HTC Vive headsets. Choose from a wide variety of games including boxing, shooting, horror, and children's games suitable for all ages."
      link="/contact" 
      button="Book This Experience" 
    />

    <HomeEven 
      title="Egg Rollercoaster VR" 
      :image_link="vr_education"
      description="Feel the adrenaline rush of our Egg Rollercoaster VR experiences. These dynamic motion platforms offer thrilling adventures across multiple genres, from heart-racing horror to breathtaking height experiences."
      link="/contact" 
      button="Book This Experience" 
    />

    <HomeOdd 
      title="GT Racing Simulator" 
      :image_link="events"
      description="Take the wheel in our high-performance GT Racing simulators. Experience the thrill of racing at speeds up to 300km/h with zero risk, suitable for all skill levels."
      link="/contact" 
      button="Book This Experience" 
    />
  </section>

  <!-- Coming Soon Section -->
  <section class="container mx-auto px-4 sm:px-6 mb-16 md:mb-20">
    <div class="text-center mb-12">
      <p class="text-pink inline-block font-medium mb-2 py-1 px-4 rounded-full bg-pink/10">Coming Soon</p>
      <h2 class="text-3xl sm:text-4xl font-bold font-header text-blue mb-4">Future Experiences</h2>
      <p class="text-lg max-w-3xl mx-auto">Get a sneak peek at our upcoming virtual reality attractions and be the first to experience them</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Coming Soon Cards -->
      <div class="bg-blue/5 rounded-xl overflow-hidden shadow-md">
        <div class="p-4 bg-blue text-white text-center font-bold">COMING SOON</div>
        <div class="p-6">
          <h3 class="text-2xl font-bold text-blue mb-2">Racing Kart VR</h3>
          <p class="mb-4">Our upcoming Racing Kart VR provides an immersive racing experience with high speeds that will get your adrenaline pumping.</p>
          
          <div class="mb-4 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Duration</span>
              <span class="text-sm font-bold">10 Minutes per round</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Players</span>
              <span class="text-sm font-bold">1 Player per session</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Price</span>
              <span class="text-sm font-bold">KES 500</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Age Rating</span>
              <span class="text-sm font-bold">8+</span>
            </div>
          </div>

          <a href="/contact" class="block w-full py-3 bg-purple text-white text-center rounded-lg font-bold mt-4 hover:opacity-90 transition-opacity">
            Get Notified
          </a>
        </div>
      </div>

      <div class="bg-blue/5 rounded-xl overflow-hidden shadow-md">
        <div class="p-4 bg-blue text-white text-center font-bold">COMING SOON</div>
        <div class="p-6">
          <h3 class="text-2xl font-bold text-blue mb-2">Magic UFO</h3>
          <p class="mb-4">Get ready for our upcoming Magic UFO experience featuring 360° rotation and a variety of game options from horror to educational games.</p>
          
          <div class="mb-4 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Duration</span>
              <span class="text-sm font-bold">10 Minutes per round</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Players</span>
              <span class="text-sm font-bold">5 Players per session</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Price</span>
              <span class="text-sm font-bold">KES 500</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Age Rating</span>
              <span class="text-sm font-bold">8+</span>
            </div>
          </div>

          <a href="/contact" class="block w-full py-3 bg-purple text-white text-center rounded-lg font-bold mt-4 hover:opacity-90 transition-opacity">
            Get Notified
          </a>
        </div>
      </div>

      <div class="bg-blue/5 rounded-xl overflow-hidden shadow-md">
        <div class="p-4 bg-blue text-white text-center font-bold">COMING SOON</div>
        <div class="p-6">
          <h3 class="text-2xl font-bold text-blue mb-2">VR Aircraft</h3>
          <p class="mb-4">Coming soon! Experience our VR Aircraft with interactive shooting games and an immersive flying experience that will take your breath away.</p>
          
          <div class="mb-4 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Duration</span>
              <span class="text-sm font-bold">10 Minutes per round</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Players</span>
              <span class="text-sm font-bold">1 Player per session</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Price</span>
              <span class="text-sm font-bold">KES 500</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">Age Rating</span>
              <span class="text-sm font-bold">8+</span>
            </div>
          </div>

          <a href="/contact" class="block w-full py-3 bg-purple text-white text-center rounded-lg font-bold mt-4 hover:opacity-90 transition-opacity">
            Get Notified
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section class="container mx-auto px-4 sm:px-6 mb-16 md:mb-20">
    <div class="text-center mb-12">
      <p class="text-pink inline-block font-medium mb-2 py-1 px-4 rounded-full bg-pink/10">Group Experiences</p>
      <h2 class="text-3xl sm:text-4xl font-bold font-header text-blue mb-4">VR Services</h2>
      <p class="text-lg max-w-3xl mx-auto">Discover specialized VR experiences perfect for groups, events, and organizations</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Service Cards -->
      <div class="bg-blue/5 rounded-xl p-6 shadow-md">
        <h3 class="text-xl font-bold text-blue mb-3">On-Demand VR Gaming</h3>
        <p class="mb-4">Drop in for individual or group VR gaming sessions with our full range of equipment.</p>
        <ul class="mb-4 space-y-2">
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>No booking required</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Individual or group options</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Flexible session durations</span>
          </li>
        </ul>
        <RouterLink to="/contact" class="inline-block text-blue font-bold hover:text-purple transition-colors">
          Learn More →
        </RouterLink>
      </div>

      <div class="bg-blue/5 rounded-xl p-6 shadow-md">
        <h3 class="text-xl font-bold text-blue mb-3">Educational VR</h3>
        <p class="mb-4">Interactive learning programs for schools and educational groups using immersive VR.</p>
        <ul class="mb-4 space-y-2">
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>School trips & field days</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Interactive learning</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Group discounts available</span>
          </li>
        </ul>
        <RouterLink to="/contact" class="inline-block text-blue font-bold hover:text-purple transition-colors">
          Learn More →
        </RouterLink>
      </div>

      <div class="bg-blue/5 rounded-xl p-6 shadow-md">
        <h3 class="text-xl font-bold text-blue mb-3">Birthday Parties</h3>
        <p class="mb-4">Create unforgettable birthday celebrations with customized VR packages for all ages.</p>
        <ul class="mb-4 space-y-2">
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Customized VR packages</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Kids & adults packages</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Memorable experiences</span>
          </li>
        </ul>
        <RouterLink to="/contact" class="inline-block text-blue font-bold hover:text-purple transition-colors">
          Learn More →
        </RouterLink>
      </div>

      <div class="bg-blue/5 rounded-xl p-6 shadow-md">
        <h3 class="text-xl font-bold text-blue mb-3">Corporate Events</h3>
        <p class="mb-4">Team-building experiences and corporate entertainment for your next company event.</p>
        <ul class="mb-4 space-y-2">
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Team-building activities</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Corporate packages</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Large group options</span>
          </li>
        </ul>
        <RouterLink to="/contact" class="inline-block text-blue font-bold hover:text-purple transition-colors">
          Learn More →
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="container mx-auto px-4 sm:px-6 mb-16 md:mb-20">
    <h2 class="text-3xl sm:text-4xl font-bold font-header text-blue mb-8 text-center">Frequently Asked Questions</h2>
    <p class="text-lg text-center mb-10">Get answers to common questions about our VR experiences</p>

    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-blue/5 rounded-lg p-6">
        <h3 class="text-xl font-bold text-blue mb-2">Do I need prior VR experience?</h3>
        <p>No prior experience is necessary. Our staff will guide you through the process and help you get comfortable with the VR equipment before your experience begins.</p>
      </div>

      <div class="bg-blue/5 rounded-lg p-6">
        <h3 class="text-xl font-bold text-blue mb-2">Is there an age requirement?</h3>
        <p>Most of our experiences are suitable for ages 8 and up. Some experiences have specific age ratings due to content. Children under 14 must be accompanied by an adult.</p>
      </div>

      <div class="bg-blue/5 rounded-lg p-6">
        <h3 class="text-xl font-bold text-blue mb-2">How long are the sessions?</h3>
        <p>Session lengths vary by experience, typically ranging from 5 minutes for EggVR to 10 minutes for HTC Vive and GT Racing per round. We also offer extended packages for groups and events.</p>
      </div>

      <div class="bg-blue/5 rounded-lg p-6">
        <h3 class="text-xl font-bold text-blue mb-2">Do you offer gift cards?</h3>
        <p>Yes, we offer gift cards in various denominations. They make perfect presents for birthdays, holidays, or any special occasion. Inquire at our location or contact us for details.</p>
      </div>
    </div>

    <div class="text-center mt-10">
      <p class="mb-4 text-lg">Have more questions about our VR experiences?</p>
      <RouterLink to="/contact" class="inline-block bg-purple text-white py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:opacity-90">
        Contact Us
      </RouterLink>
    </div>
  </section>

  <!-- Ready for a new reality Section -->
  <section class="bg-blue py-16 mb-20">
    <div class="container mx-auto px-6">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-white text-lg mb-2">Ready for a new reality?</p>
        <h2 class="text-3xl md:text-4xl text-white font-bold mb-6 font-header">Step Into The World of<br>Virtual Reality</h2>
        <p class="text-lg text-white mb-8">
          Visit us at The Waterfront Karen (Basement) in Nairobi and experience the future of entertainment. Adventure awaits!
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <RouterLink to="/contact" class="bg-pink text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:opacity-90">
            Book Your Session
          </RouterLink>
          <a href="tel:+254729054606" class="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-white/10">
            Call Us
          </a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
          <div class="flex flex-col items-center">
            <span class="text-pink text-2xl mb-1">📍</span>
            <span class="text-sm">The Waterfront Karen</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-pink text-2xl mb-1">🕒</span>
            <span class="text-sm">Open 7 Days a Week</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-pink text-2xl mb-1">💰</span>
            <span class="text-sm">From KES 500</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-pink text-2xl mb-1">👪</span>
            <span class="text-sm">All Ages Welcome</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import HomeOdd from '@/Shared/HomeOdd.vue';
import HomeEven from '@/Shared/HomeEven.vue';
import { RouterLink } from 'vue-router';

// Component name definition
defineOptions({
  name: 'HomePage'
});

// Images
import on_demand from '@/assets/images/home/on_demand.jpeg';
import vr_education from '@/assets/images/home/vr_education.jpeg';
import events from '@/assets/images/home/events.jpeg';
</script>

<style scoped>
.hero {
  background-image: url('@/assets/images/home/hero_bg.png');
  background-position: center;
  background-size: cover;
  position: relative;
}

/* Add a subtle overlay for better text readability if needed */
.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.hero > div {
  position: relative;
  z-index: 2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero {
    text-align: center;
  }
}

@media (max-width: 640px) {
  .hero {
    min-height: 90vh;
  }
}
</style>