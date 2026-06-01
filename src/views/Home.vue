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
        <p class="text-3xl md:text-4xl font-bold text-blue mb-2">6+</p>
        <p class="text-lg font-medium">Gaming Platforms</p>
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

    <HomeOdd
      title="HTC Vive VR"
      :image_link="htc"
      description="Experience premium interactive VR games with our high-quality HTC Vive headsets. Choose from a wide variety of games including boxing, shooting, horror, and children's games suitable for all ages."
      link="/contact"
      button="Book This Experience"
    />

    <HomeEven
      title="Egg Rollercoaster VR"
      :image_link="eggvr"
      description="Feel the adrenaline rush of our Egg Rollercoaster VR experiences. These dynamic motion platforms offer thrilling adventures across multiple genres, from heart-racing horror to breathtaking height experiences."
      link="/contact"
      button="Book This Experience"
    />

    <HomeOdd
      title="GT Racing Simulator"
      :image_link="gtr"
      description="Take the wheel in our high-performance GT Racing simulators. Experience the thrill of racing at speeds up to 300km/h with zero risk, suitable for all skill levels."
      link="/contact"
      button="Book This Experience"
    />
  </section>

  <!-- Console & Gaming Section -->
  <section class="container mx-auto px-4 sm:px-6 mb-16 md:mb-20">
    <div class="text-center mb-12">
      <p class="text-pink inline-block font-medium mb-2 py-1 px-4 rounded-full bg-pink/10">Available Now</p>
      <h2 class="text-3xl sm:text-4xl font-bold font-header text-blue mb-4">Console & Gaming</h2>
      <p class="text-lg max-w-3xl mx-auto">Not just VR — level up with our console gaming experiences featuring the latest platforms and hottest titles</p>
    </div>

    <HomeOdd
      title="PlayStation 5"
      :image_link="ps5"
      description="The ultimate gaming showdown — grab a controller and settle the score. Play FIFA, Fortnite, GTA V, Brawlhalla, Spider-Man, The Last of Us, and Minecraft. 2 players, 30 minutes per round."
      link="/contact"
      button="Book This Experience"
    />

    <HomeEven
      title="Nintendo Switch"
      :image_link="nintendo"
      description="Pick up, play, and prepare for pure joy — Nintendo magic at its finest. Mario Kart mayhem, quick rounds perfect for all ages, and the party starter everyone loves. 2 players, 10 min duo or 5 min solo."
      link="/contact"
      button="Book This Experience"
    />

    <HomeOdd
      title="Meta Quest VR"
      :image_link="meta"
      description="Step inside the game — no wires, no limits, just pure immersion. Standalone VR with total freedom of movement, mind-blowing beat-slashing action, and worlds that feel impossibly real."
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
      <div v-for="(service, index) in services" :key="index" class="bg-blue/5 rounded-xl p-6 shadow-md">
        <h3 class="text-xl font-bold text-blue mb-3">{{ service.title }}</h3>
        <p class="mb-4">{{ service.summary }}</p>
        <ul class="mb-4 space-y-2">
          <li v-for="(point, i) in service.highlights" :key="i" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ point }}</span>
          </li>
        </ul>
        <button @click="activeModal = index" class="inline-block text-blue font-bold hover:text-purple transition-colors">
          Learn More →
        </button>
      </div>
    </div>

    <!-- Service Modal -->
    <Teleport to="body">
      <div v-if="activeModal !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="activeModal = null">
        <div class="fixed inset-0 bg-black/50" @click="activeModal = null"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
          <button @click="activeModal = null" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">&times;</button>
          <div class="p-6 sm:p-8">
            <h3 class="text-2xl font-bold text-blue mb-4 font-header">{{ services[activeModal].title }}</h3>
            <p class="text-gray-700 mb-6 leading-relaxed">{{ services[activeModal].description }}</p>

            <h4 class="font-bold text-lg text-blue mb-3">What we provide</h4>
            <ul class="mb-6 space-y-2">
              <li v-for="(item, i) in services[activeModal].details" :key="i" class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>{{ item }}</span>
              </li>
            </ul>

            <h4 class="font-bold text-lg text-blue mb-3">Available equipment</h4>
            <div class="flex flex-wrap gap-2 mb-6">
              <span v-for="(eq, i) in services[activeModal].equipment" :key="i" class="bg-blue/10 text-blue text-sm font-medium py-1 px-3 rounded-full">{{ eq }}</span>
            </div>

            <div class="bg-pink/10 rounded-xl p-4 mb-6">
              <p class="text-pink font-bold text-center">Contact us for pricing — we'll tailor a package to your needs!</p>
            </div>

            <RouterLink to="/contact" @click="activeModal = null" class="block w-full py-3 bg-purple text-white text-center rounded-lg font-bold hover:opacity-90 transition-opacity">
              Contact Us
            </RouterLink>
          </div>
        </div>
      </div>
    </Teleport>
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
import { ref } from 'vue';
import HomeOdd from '@/Shared/HomeOdd.vue';
import HomeEven from '@/Shared/HomeEven.vue';
import { RouterLink } from 'vue-router';

// Component name definition
defineOptions({
  name: 'HomePage'
});

const activeModal = ref(null);

const services = [
  {
    title: 'On-Demand VR Gaming',
    summary: 'Drop in for individual or group VR gaming sessions with our full range of equipment.',
    highlights: ['No booking required', 'Individual or group options', 'Flexible session durations'],
    description: 'Walk in anytime and jump straight into the action. Whether you\'re solo or rolling in with friends, we have the perfect setup waiting for you. Our staff will get you geared up and gaming in minutes — no reservations needed.',
    details: [
      'Choose from HTC Vive VR, Egg Rollercoaster VR, GT Racing Simulator, Meta Quest VR, PlayStation 5, and Nintendo Switch',
      'Staff-guided setup so you can focus on the fun',
      'Multiple sessions available back-to-back',
      'Suitable for all ages and experience levels',
    ],
    equipment: ['Meta Quest VR', 'GT Racing Simulator', 'Nintendo Switch', 'HTC Vive VR', 'PlayStation 5', 'Egg Rollercoaster VR'],
  },
  {
    title: 'Educational VR',
    summary: 'Interactive learning programs for schools and educational groups using immersive VR.',
    highlights: ['School trips & field days', 'Interactive learning', 'Group discounts available'],
    description: 'Bring the classroom to life with immersive virtual reality. We host school groups for educational trips that combine fun with learning — from exploring the solar system to walking through historical landmarks. Students stay engaged while absorbing knowledge in ways textbooks can\'t match.',
    details: [
      'Curated educational VR content across science, history, geography, and more',
      'Hands-on Meta Quest VR experiences for interactive learning',
      'GT Racing Simulator for physics and engineering concepts',
      'Nintendo Switch for collaborative problem-solving games',
      'Dedicated staff to guide students through each experience',
      'Customizable programs to match your curriculum',
    ],
    equipment: ['Meta Quest VR', 'GT Racing Simulator', 'Nintendo Switch', 'HTC Vive VR'],
  },
  {
    title: 'Birthday Parties',
    summary: 'Create unforgettable birthday celebrations with customized VR packages for all ages.',
    highlights: ['Customized VR packages', 'Kids & adults packages', 'Memorable experiences'],
    description: 'Make their birthday one they\'ll never forget. We set up an action-packed party with a mix of VR and console gaming that keeps every guest entertained. From high-speed racing to multiplayer showdowns, there\'s something for everyone in the crew.',
    details: [
      'Dedicated party area with all equipment set up and ready',
      'Mix of VR experiences and console gaming for variety',
      'Meta Quest VR for immersive solo adventures',
      'Nintendo Switch and PlayStation 5 for multiplayer fun',
      'GT Racing Simulator for adrenaline-pumping competition',
      'Party coordination by our team so you can relax and enjoy',
    ],
    equipment: ['Meta Quest VR', 'GT Racing Simulator', 'Nintendo Switch', 'PlayStation 5', 'HTC Vive VR'],
  },
  {
    title: 'Corporate Events',
    summary: 'Team-building experiences and corporate entertainment for your next company event.',
    highlights: ['Team-building activities', 'Corporate packages', 'Large group options'],
    description: 'Take your team offsite for an experience that actually brings people together. Our corporate packages combine competitive gaming, VR challenges, and collaborative play to break the ice and build stronger teams. We handle the setup — you bring the energy.',
    details: [
      'Team vs. team competitions on GT Racing Simulator',
      'Collaborative VR challenges on Meta Quest VR',
      'Multiplayer tournaments on Nintendo Switch and PlayStation 5',
      'Flexible setups for groups of any size',
      'On-site or off-site event options — we can bring the gear to you',
      'Full event coordination and technical support',
    ],
    equipment: ['Meta Quest VR', 'GT Racing Simulator', 'Nintendo Switch', 'PlayStation 5', 'HTC Vive VR'],
  },
];

// Images
import htc from '@/assets/images/experiences/htc.jpg';
import eggvr from '@/assets/images/experiences/eggvr.jpg';
import gtr from '@/assets/images/experiences/gt.jpg';
import ps5 from '@/assets/images/experiences/ps5.jpg';
import nintendo from '@/assets/images/experiences/nintendo.png';
import meta from '@/assets/images/experiences/meta.jpg';
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