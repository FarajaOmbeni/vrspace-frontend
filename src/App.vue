<script setup>
import Layout from '@/Layouts/Layout.vue';
import { RouterView } from 'vue-router';
import emailjs from '@emailjs/browser';

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
</script>

<template>
    <Layout>
        <RouterView />
    </Layout>
</template>