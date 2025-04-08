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
          <ExperienceOdd 
            :image_link="htc" 
            title="HTC VIVE VR" 
            :image="icon" 
            player="1 Player/Time" 
            time="10 Minutes/Round"
            price="KES 500" 
            description="Rich and diversified games, suitable for people of all ages." 
            d1="Boxing games"
            d2="Shooting games" 
            d3="Horror games" 
            d4="Children games" 
          />

          <ExperienceEven 
            :image_link="eggvr" 
            title="Egg Rollercoaster VR" 
            :image="icon" 
            player="2 Players/Time"
            time="5 Minutes/Round" 
            price="KES 500"
            description="Best VR rollercoaster experience, suitable for people of all ages." 
            d1="Adventure games" 
            d2="Games for leisure"
            d3="Horror games" 
            d4="HEEIIIIGGGHHHTTSS" 
          />

          <ExperienceOdd 
            :image_link="gtr" 
            title="GT Racing Simulator" 
            :image="icon" 
            player="1 Player/Time" 
            time="7 Minutes/Round"
            price="KES 500" 
            description="Race with pros using superfast cars" 
            d1="Reach high speeds of 300km/h"
            d2="Feel the thrill of speed with ZERO risk" 
            d3="Fit for all levels (beginner to pro)"
            d4="Kids LOVE this one" 
          />
        </div>

        <!-- Coming Soon Experiences -->
        <div>
          <h3 class="text-3xl font-bold text-pink text-center mb-16 font-header">COMING SOON</h3>
          
          <div class="space-y-24">
            <ExperienceEven 
              :image_link="racing_kart" 
              title="Racing Kart VR" 
              :image="icon" 
              player="1 Players/Time"
              time="10 Minutes/Round" 
              price="KES 500" 
              description="Race as if you're on the track"
              d1="Super extra FUN with virtual reality" 
              d2="Experience HIGH speeds" 
              d3="Immersive racing experience" 
              d4="Get in action"
            />

            <ExperienceOdd 
              :image_link="magic_ufo" 
              title="Magic UFO" 
              :image="icon" 
              player="5 Players/Time"
              time="10 Minutes/Round" 
              price="KES 500" 
              description="Rich and diversified games, suitable for all ages"
              d1="360° rotation for total immersion" 
              d2="Horror Games" 
              d3="Adventure Games" 
              d4="Educational Games" 
            />

            <ExperienceEven 
              :image_link="aircraft" 
              title="VR Aircraft" 
              :image="icon" 
              player="1 Players/Time"
              time="10 Minutes/Round" 
              price="KES 500" 
              description="Fly your own Jet Fighter!"
              d1="Very interactive shooting games" 
              d2="Immersion at its PEAK" 
              d3="Great flying experience" 
              d4="Fight for GLORY"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="bg-blue py-16 mb-20">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl text-white font-bold mb-6 font-header">READY TO EXPERIENCE VR?</h2>
          <p class="text-lg text-white mb-8">
            Book your session now and dive into the exciting world of virtual reality at VR SPACE!
          </p>
          <RouterLink to="/contact" class="inline-block bg-pink text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 hover:shadow-lg hover:opacity-90">
            BOOK NOW
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import ExperienceOdd from '@/Shared/ExperienceOdd.vue';
import ExperienceEven from '@/Shared/ExperienceEven.vue';
import { RouterLink } from 'vue-router';

// Component name definition
defineOptions({
  name: 'ExperiencesPage'
});

// Images
import htc from '@/assets/images/experiences/htc.png';
import eggvr from '@/assets/images/experiences/eggvr.png';
import gtr from '@/assets/images/experiences/gtr.webp';
import racing_kart from '@/assets/images/experiences/racing_kart.png';
import magic_ufo from '@/assets/images/experiences/magic_ufo.png';
import aircraft from '@/assets/images/experiences/aircraft.png';
import icon from '@/assets/images/experiences/user.png';
</script>

<style scoped>
.hero {
  background-image: url('@/assets/images/experiences/experiences.png');
  background-position: center;
  background-size: cover;
}
</style>