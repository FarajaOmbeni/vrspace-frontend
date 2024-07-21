<template>
  <div class="flex flex-col items-center lg:flex-row justify-center xl:gap-32 mb-32 md:gap-14">
    <div class="w-[25rem] xl:w-[30rem] lg:block my-auto"><img :src="image_link" alt="">
    </div>
    <div
      class="lg:w-1/2 mx-8 text-justify lg:text-start flex flex-col items-center lg:w-[20rem] lg:justify-center lg:items-start bg-purple rounded-2xl">
      <p class="mb-6 font-header lg:mb-3 text-2xl p-2">{{ title }}</p>
      <div class="flex p-3">

        <div>
          <img class="w-[2rem] md:w-[5rem]" :src="image" alt="">
        </div>
        <div class="border-r-blue border-r border-r-4 mx-4"></div>
        <div>
          <p class=" text-lg">{{ player }}</p>
          <p class=" text-lg">{{ time }}</p>
          <p class=" text-lg">{{ price }}</p>
        </div>
      </div>

      <ul class="py-5 pr-3 list-disc pl-12">
        <li class="text-lg">{{ description }}</li>
        <li class="text-lg">{{ d1 }}</li>
        <li class="text-lg">{{ d2 }}</li>
        <li class="text-lg">{{ d3 }}</li>
        <li class="text-lg">{{ d4 }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  image_link: String,
  title: String,
  image: String,
  player: String,
  time: String,
  price: String,
  description: String,
  d1: String,
  d2: String,
  d3: String,
  d4: String,
});
</script>