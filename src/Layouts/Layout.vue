<template>
    <div class="font-header">
        <div>
            <Navbar/>
        </div>

        <div>
            <slot></slot>
        </div>


        <div>
            <Footer/>
        </div>
    </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
</script>