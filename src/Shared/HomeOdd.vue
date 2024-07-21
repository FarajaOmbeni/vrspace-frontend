<template>
    <div class="flex justify-center xl:gap-32 mb-32 md:gap-14">
        <div class="hidden w-[25rem] xl:w-[30rem] ml-12 lg:block flex justify-center lg:none"><img :src="image_link"
                alt=""></div>
        <div
            class="lg:w-1/2 mx-8 text-justify lg:text-start flex flex-col items-center lg:w-[30rem] lg:justify-center lg:items-start">
            <p class="mb-6 text-3xl md:text-4xl lg:text-4xl text-blue font-header font-bold text-center lg:text-start">
                {{ title }} <span
                    class="mb-6 text-3xl md:text-4xl lg:text-4xl text-blue font-header font-bold text-center lg:text-start">{{
            imagine }}</span>
                <span
                    class="mb-6 text-3xl md:text-4xl lg:text-4xl text-pink font-header font-bold text-center lg:text-start">{{
            explore }}</span>
                <span
                    class="mb-6 text-3xl md:text-4xl lg:text-4xl text-purple font-header font-bold text-center lg:text-start">{{
                    experience }}</span>
            </p>
            <div class="flex justify-center lg:none lg:hidden"><img class="w-[20rem] md:w-[30rem]" :src="image_link"
                    alt=""></div>
            <div class="border-b-4 border-b-blue my-6 xl:my-12 w-1/2"></div>
            <p class="mb-6 lg:mb-14 text-2xl">{{ description }}</p>

            <a class="bg-purple p-4 text-white font-bold hover:opacity-80" :href="link">{{ button }}
            </a>
        </div>
    </div>
</template>

<script setup>
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