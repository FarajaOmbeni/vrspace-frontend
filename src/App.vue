<script setup>
import Layout from '@/Layouts/Layout.vue';
import { RouterView } from 'vue-router';
import emailjs from 'emailjs/browser';

emailjs.init("3QGzAfI8_ZPib_fRn");
</script>

<template>
    <Layout>
        <RouterView />
    </Layout>
</template>