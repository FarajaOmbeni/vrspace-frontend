<script setup>
import { RouterLink } from 'vue-router';
defineProps({
    to: String,

})
</script>

<template>
    <RouterLink :to="to" class="bg-purple text-black px-3 py-1 font-semibold rounded-2xl hover:bg-pink_opaque hover:text-black">
        <slot />
    </RouterLink>
</template>
