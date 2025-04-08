<template>
    <RouterLink class="hover:text-pink">
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