<template>
  <div class="hero mb-16 bg-cover bg-center">
    <div class="h-screen flex flex-col items-center justify-center">
      <p class="font-header text-6xl font-bold text-violet-400 lg:text-end text-center">VIRTUAL REALITY SPACE</p>
      <p class="text-2xl font-bold text-blue lg:text-end text-center mb-8">More Than Just Games</p>
      <p
        class="leading-8 text-xl font-bold text-gray-900 rounded-xl bg-home_text shadow-xl mx-4 py-5 px-3 text-center max-w-[45rem]">
        Discover an unparalleled
        virtual reality gaming experience at VR SPACE. Whether you're a seasoned gamer or a first-time
        explorer, our immersive VR experiences promise adventure, excitement, and endless fun. Ready to dive
        in? Click below to start exploring.</p>
      <div class="flex justify-center lg:justify-end">
        <RouterLink to="/experiences"
          class="text-white flex justify-center items-center  rounded-full bg-purple w-[20rem] h-[4rem] mt-5 py-3 px-10 text-xl font-bold hover:transition-all delay-30 hover:opacity-85 hover:text-slate-300">
          EXPERIENCE VR NOW</RouterLink>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center mb-16">
    <p class="mb-6 text-3xl text-center md:text-4xl text-blue font-header font-bold text-center">
      ANNOUNCEMENTS, <span class="text-3xl md:text-4xl font-header text-pink">TOURNAMENT ALERT!</span></p>
    <img class="w-[20rem] mb-4" src="@/assets/images/announcements/fc25_nov.jpg" alt="Tournament Flyer">
    <a href="https://forms.gle/Gu7mZaRhdbs2tgHbA" class="hover:underline text-blue text-2xl font-bold" target="_blank">REGISTER NOW!</a>
  </div>

  <HomeOdd imagine="IMAGINE, " explore="EXPLORE, " experience="EXPERIENCE." :image_link=imagine
    description="Choose the plan that suits you best and dive into the world of VR gaming. We offer flexible pricing options to ensure everyone can enjoy our immersive experiences."
    link="/experiences" button="VIEW EXPERIENCES" />


  <div class="flex flex-col items-center gap-6 pb-12 border-b-2 border-b-blue">
    <p class="bg-blue text-white font-bold text-xl py-4 px-6 rounded">LOCATED IN</p>
    <p class="text-2xl text-blue font-bold">The Waterfront Karen, Basement</p>
    <div class="bg-blue font-bold text-xl py-4 px-6 rounded text-white hover:opacity-90 transition-all delay-50">
      <a href="https://www.google.com/maps/place/The+Waterfront+Karen/@-1.3309044,36.7139817,18z/data=!3m1!4b1!4m6!3m5!1s0x182f1b40e8700ce9:0xf4eb6d3689e5364b!8m2!3d-1.3309058!4d36.714672!16s%2Fg%2F11g68xjl7h?entry=ttu"
        target="_blank">OPEN
        MAPS <img src="@/assets/images/home/pin_location.png" class="w-6 inline" alt=""></a>
    </div>
  </div>

  <div>
    <p class="text-center my-12 text-4xl font-bold font-header text-blue">OUR SERVICES</p>

    <HomeOdd title="ON DEMAND VIRTUAL REALITY GAMING" :image_link=on_demand
      description="Drop by anytime for instant VR fun! Whether solo or with friends, dive into epic quests and adventures on the spot. No plans needed; just pure, spontaneous excitement!"
      link="https://www.google.com/maps/place/The+Waterfront+Karen/@-1.3309044,36.7139817,18z/data=!3m1!4b1!4m6!3m5!1s0x182f1b40e8700ce9:0xf4eb6d3689e5364b!8m2!3d-1.3309058!4d36.714672!16s%2Fg%2F11g68xjl7h?entry=ttu"
      button="VISIT SHOP" />

    <HomeEven title="VR EDUCATION" :image_link=vr_education
      description="Transforming learning with VR SPACE! We make school trips and lessons epic by bringing history, science, and more to life with Virtual Reality Technology. Say goodbye to boring classes and hello to awesome VR adventures!"
      link="/contact" button="ENQUIRE" />

    <HomeOdd title="BIRTHDAY PARTIES" :image_link=on_demand
      description="Make your birthday unforgettable with VR SPACE! Hire us for your party and enjoy epic VR games that'll keep everyone entertained and talking about your party for months!"
      link="/contact" button="ENQUIRE" />

    <HomeEven title="VR FOR EVENTS" :image_link=events
      description="Level up your events with VR SPACE! Our VR Technology is perfect for team-building becasue it makes everyone bond and have a blast like never before. Work hard, play harder; Let's make it epic!"
      link="/contact" button="ENQUIRE" />
  </div>
</template>

<script setup>
import HomeOdd from '@/Shared/HomeOdd.vue';
import HomeEven from '@/Shared/HomeEven.vue';
import { RouterLink } from 'vue-router';

//images
import imagine from '@/assets/images/home/imagine.jpeg';
import on_demand from '@/assets/images/home/on_demand.jpeg';
import vr_education from '@/assets/images/home/vr_education.jpeg';
import events from '@/assets/images/home/events.jpeg';

</script>

<style scoped>
.hero{
  background-image: url('@/assets/images/home/hero_bg.png');
}
</style>