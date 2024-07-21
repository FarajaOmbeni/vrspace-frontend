<template>
    <RouterLink class="hover:text-pink">
        <slot></slot>
    </RouterLink>
</template>
 
<script setup>
import { RouterLink } from 'vue-router'
</script>