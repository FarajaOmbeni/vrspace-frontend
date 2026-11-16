<template>
  <div
    class="flex flex-col items-center justify-center xl:gap-32 mb-32 md:gap-14"
    :class="reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'"
  >
    <div class="w-full max-w-[25rem] xl:max-w-[30rem] my-auto"><img :src="image_link" :alt="title" loading="lazy">
    </div>
    <div
      class="lg:w-1/2 mx-4 sm:mx-8 text-justify lg:text-start flex flex-col items-center w-[27rem] max-w-[calc(100%-2rem)] lg:max-w-none lg:w-[20rem] lg:justify-center lg:items-start bg-purple rounded-2xl">
      <p class="mb-6 font-header lg:mb-3 text-2xl p-2">{{ title }}</p>
      <div class="flex p-3">

        <div>
          <img class="w-[5rem] md:w-[5rem]" :src="image" alt="">
        </div>
        <div class="border-r-blue border-r border-r-4 mx-4"></div>
        <div>
          <p class=" text-lg">{{ player }}</p>
          <p class=" text-lg">{{ time }}</p>
          <p class=" text-lg">{{ price }}</p>
        </div>
      </div>

      <ul class="py-5 pr-3 list-disc pl-12">
        <li v-for="point in points" :key="point" class="text-lg">{{ point }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ExperienceCard'
});

defineProps({
  image_link: String,
  title: String,
  image: String,
  player: String,
  time: String,
  price: String,
  // Bullet points, first one is the short description.
  points: { type: Array, default: () => [] },
  // Image on the right on desktop (always on top on mobile).
  reverse: Boolean,
});
</script>
