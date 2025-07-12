<template>
    <RouterLink :to="to" class="hover:text-pink text-white">
        <slot></slot>
    </RouterLink>
</template>
 
<script setup>
import { RouterLink } from 'vue-router'

// Component name definition
defineOptions({
  name: 'QuickLinkComponent'
});

defineProps({
  to: String
});
</script>