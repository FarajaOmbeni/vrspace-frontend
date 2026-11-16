<script setup>
import { RouterLink } from 'vue-router';

// Component name definition
defineOptions({
  name: 'NavLinkComponent'
});

defineProps({
    to: String,
});
</script>

<template>
    <RouterLink :to="to" class="bg-purple text-white px-3 py-1 font-semibold rounded-2xl hover:bg-pink_opaque">
        <slot />
    </RouterLink>
</template>
