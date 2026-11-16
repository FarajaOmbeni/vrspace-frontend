<template>
  <div>
    <!-- Hero Section -->
    <section class="hero min-h-screen bg-cover bg-center flex items-center justify-center mb-20">
      <div class="container mx-auto px-4">
        <div class="flex justify-center items-center">
          <div class="w-72 h-72 md:w-96 md:h-96 rounded-full bg-pink_opaque flex items-center justify-center backdrop-blur-sm shadow-xl">
            <div class="text-center">
              <h1 class="text-5xl md:text-6xl font-extrabold">
                <span class="text-blue block mb-2">VR SPACE</span>
                <span class="text-white">-</span>
                <span class="text-black block mt-2">EXPERIENCE</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Gallery -->
    <section class="container mx-auto px-6 mb-32">
      <h2 class="text-4xl font-bold text-blue text-center mb-16 font-header">VIRTUAL EXPERIENCES</h2>
      
      <div class="space-y-32">
        <!-- Available Experiences -->
        <div class="space-y-24">
          <ExperienceCard v-for="(exp, i) in available" :key="exp.title" v-bind="exp" :image="icon" :reverse="i % 2 === 1" />
        </div>

        <!-- Console & Gaming Experiences -->
        <div>
          <h3 class="text-3xl font-bold text-pink text-center mb-16 font-header">CONSOLE & GAMING</h3>

          <div class="space-y-24">
            <ExperienceCard v-for="(exp, i) in consoles" :key="exp.title" v-bind="exp" :image="icon" :reverse="i % 2 === 1" />
          </div>
        </div>

        <!-- Coming Soon Experiences -->
        <div>
          <h3 class="text-3xl font-bold text-pink text-center mb-16 font-header">COMING SOON</h3>
          
          <div class="space-y-24">
            <ExperienceCard v-for="(exp, i) in comingSoon" :key="exp.title" v-bind="exp" :image="icon" :reverse="i % 2 === 0" />
          </div>
        </div>
      </div>
    </section>

    <!-- Partner: Kayak -->
    <section class="container mx-auto px-6 mb-20">
      <div class="max-w-3xl mx-auto text-center bg-gray-50 rounded-2xl py-10 px-6">
        <p class="text-lg md:text-xl text-gray-700 font-medium">
          Want more experiences in Nairobi?
        </p>
        <a href="https://www.kayak.com/Nairobi.26243.guide" target="_blank" rel="noopener noreferrer"
          class="inline-block mt-4 bg-pink text-blue font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:shadow-lg hover:opacity-90">
          Explore on Kayak
        </a>
      </div>
    </section>

  </div>
</template>

<script setup>
import ExperienceCard from '@/Shared/ExperienceCard.vue';

// Component name definition
defineOptions({
  name: 'ExperiencesPage'
});

// Images
import htc from '@/assets/images/experiences/htc.webp';
import eggvr from '@/assets/images/experiences/eggvr.webp';
import gtr from '@/assets/images/experiences/gt.webp';
import racing_kart from '@/assets/images/experiences/cartvr.webp';
import magic_ufo from '@/assets/images/experiences/ufo.webp';
import aircraft from '@/assets/images/experiences/aircraft.webp';
import ps5 from '@/assets/images/experiences/ps5.webp';
import nintendo from '@/assets/images/experiences/nintendo.webp';
import meta from '@/assets/images/experiences/meta.webp';
import icon from '@/assets/images/experiences/user.png';

// Each list alternates image left / right on desktop.
const available = [
  {
    image_link: htc,
    title: 'HTC VIVE VR',
    player: '1 Player/Time',
    time: '10 Minutes/Round',
    price: 'KES 500',
    points: ['Rich and diversified games, suitable for people of all ages.', 'Boxing games', 'Shooting games', 'Horror games', 'Children games'],
  },
  {
    image_link: eggvr,
    title: 'Egg Rollercoaster VR',
    player: '2 Players/Time',
    time: '5 Minutes/Round',
    price: 'KES 500',
    points: ['Best VR rollercoaster experience, suitable for people of all ages.', 'Adventure games', 'Games for leisure', 'Horror games', 'HEEIIIIGGGHHHTTSS'],
  },
  {
    image_link: gtr,
    title: 'GT Racing Simulator',
    player: '1 Player/Time',
    time: '7 Minutes/Round',
    price: 'KES 500',
    points: ['Race with pros using superfast cars', 'Reach high speeds of 300km/h', 'Feel the thrill of speed with ZERO risk', 'Fit for all levels (beginner to pro)', 'Kids LOVE this one'],
  },
];

const consoles = [
  {
    image_link: ps5,
    title: 'PlayStation 5',
    player: '2 Players/Time',
    time: '30 Minutes/Round',
    price: 'KES 500',
    points: ['The ultimate gaming showdown — grab a controller and settle the score.', 'FIFA, Fortnite, GTA V & Brawlhalla for epic showdowns', 'Swing through NYC in Spider-Man or survive The Last of Us', 'Build worlds together in Minecraft', '7 titles to choose from — something for everyone'],
  },
  {
    image_link: nintendo,
    title: 'Nintendo Switch',
    player: '2 Players/Time',
    time: '10 Min (Duo) · 5 Min (Solo)',
    price: 'KES 500/Person',
    points: ['Pick up, play, and prepare for pure joy — Nintendo magic at its finest.', 'Mario Kart mayhem with friends', 'Quick rounds perfect for all ages', 'Easy to learn, impossible to put down', 'The party starter everyone loves'],
  },
  {
    image_link: meta,
    title: 'Meta Quest VR',
    player: '1 Player/Time',
    time: '5 Minutes/Round',
    price: 'KES 500',
    points: ['Step inside the game — no wires, no limits, just pure immersion.', 'Standalone VR with total freedom of movement', 'Mind-blowing beat-slashing and action games', 'Experience worlds that feel impossibly real', 'The future of gaming, RIGHT here'],
  },
];

const comingSoon = [
  {
    image_link: racing_kart,
    title: 'Racing Kart VR',
    player: '1 Players/Time',
    time: '10 Minutes/Round',
    price: 'KES 500',
    points: ["Race as if you're on the track", 'Super extra FUN with virtual reality', 'Experience HIGH speeds', 'Immersive racing experience', 'Get in action'],
  },
  {
    image_link: magic_ufo,
    title: 'Magic UFO',
    player: '5 Players/Time',
    time: '10 Minutes/Round',
    price: 'KES 500',
    points: ['Rich and diversified games, suitable for all ages', '360° rotation for total immersion', 'Horror Games', 'Adventure Games', 'Educational Games'],
  },
  {
    image_link: aircraft,
    title: 'VR Aircraft',
    player: '1 Players/Time',
    time: '10 Minutes/Round',
    price: 'KES 500',
    points: ['Fly your own Jet Fighter!', 'Very interactive shooting games', 'Immersion at its PEAK', 'Great flying experience', 'Fight for GLORY'],
  },
];
</script>

<style scoped>
.hero {
  background-image: url('@/assets/images/experiences/experiences.webp');
  background-position: center;
  background-size: cover;
}
</style>