<template>
    <div class="z-1000 bg-blue flex justify-between p-2 md:pr-16 items-center fixed w-full">
        <div>
            <RouterLink to="/"><img class="w-24" src="@/assets/images/navbar/vrspace_logo.png" alt=""></RouterLink>
        </div>

        <!-- <div>
            <p class="text-slate-300 bg-pink_opaque p-1 text-xs md:text-lg lg:p-2 rounded-lg">UPDATE: We have moved to the Waterfront Karen &#128513;</p>
        </div> -->

        <div class="relative md:hidden">
            <img @click="openMenu" class="cursor-pointer mr-4" src="@/assets/images/navbar/menu.svg" alt="">

            <div class="hidden bg-blue text-white absolute p-6 top-18 menu_dropdown">
                <ul class="flex flex-col gap-5">
                    <li>
                        <NavLink to="/" v-bind:class="{ 'active': route.path === '/' }">
                            HOME</NavLink>
                    </li>
                    <li>
                        <NavLink to="/experiences" v-bind:class="{ 'active': route.path === '/experiences' }">
                            EXPERIENCES</NavLink>
                    </li>
                    <li>
                        <NavLink to="/about" v-bind:class="{ 'active': route.path === '/about' }">
                            ABOUT US
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/contact" v-bind:class="{ 'active': route.path === '/contact' }">CONTACT
                            US</NavLink>
                    </li>
                </ul>
            </div>
        </div>

        <div class="text-white hidden md:block sm:text-lg md:text-xl">
            <ul class="flex gap-5">
                <li>
                    <NavLink to="/" v-bind:class="{ 'active': route.path === '/' }">
                        HOME</NavLink>
                </li>
                <li>
                    <NavLink to="/experiences" v-bind:class="{ 'active': route.path === '/experiences' }">
                        EXPERIENCES</NavLink>
                </li>
                <li>
                    <NavLink to="/about" v-bind:class="{ 'active': route.path === '/about' }">
                        ABOUT US
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/contact" v-bind:class="{ 'active': route.path === '/contact' }">CONTACT
                        US</NavLink>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import NavLink from '@/components/NavLink.vue';
import { useRoute } from 'vue-router'

const route = useRoute()
// create a function called openMenu that toggles the visibility of the menu
const openMenu = () => {
    document.querySelector('.absolute').classList.toggle('hidden');
}
</script>

<style scoped>
.active {
    background-color: #F180C5 !important;
    color: #000133;
}

.menu_dropdown {
    right: -10px;
}
</style>