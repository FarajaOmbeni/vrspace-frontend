<template>
    <div class="hero bg-cover bg-center h-screen mb-16">
        <div class="h-screen text-6xl font-extrabold text-blue flex items-center justify-center">
            <div class="flex justify-center items-center w-[28rem] h-[28rem] rounded-full bg-pink_opaque">
                <div class="flex flex-col items-center">
                    <p class="text-blue">VR SPACE</p>
                    <p class="">-</p>
                    <p class="text-black">EXPERIENCE</p>
                </div>
            </div>
        </div>
    </div>

    <ExperienceOdd :image_link=htc title="HTC VIVE VR" :image=icon player="1 Player/Time" time="10 Minutes/Round"
        price="KES 400" description="Rich and diversified games, suitable for people of all ages." d1="Boxing games"
        d2="Shooting games" d3="Horror games" d4="Children games" />

    <ExperienceEven :image_link=eggvr title="Egg Rollercoaster VR" :image=icon player="2 Players/Time"
        time="5 Minutes/Round" price="KES 300"
        description="Best VR rollercoaster experience, suitable for people of all ages." d1="Adventure games" d2="Games for leisure"
        d3="Horror games" d4="HEEIIIIGGGHHHTTSS" />

    <ExperienceOdd :image_link=gtr title="GT Racing SImulator" :image=icon player="1 Player/Time" time="7 Minutes/Round"
        price="KES 250" description="Race with pros using superfast cars" d1="Reach high speeds of 300km/h"
        d2="Feel the thrill of speed with ZERO risk" d3="Fit for all levels (beginner to pro)"
        d4="Kids LOVE this one" />

    <ExperienceEven :image_link=racing_kart title="Racing Kart VR - Coming Soon!" :image=icon player="1 Players/Time"
        time="10 Minutes/Round" price="KES 500" description="Race as if you're on the track"
        d1="Super extra FUN with virtual reality" d2="Experience HIGH speeds" d3="Immersive racing experience" d4="Get in action"/>

    <ExperienceOdd :image_link=magic_ufo title="Magic UFO - Coming Soon!" :image=icon player="5 Players/Time"
        time="10 Minutes/Round" price="KES 400" description="Rich and diversified games, suitable for all ages"
        d1="360° rotation for total immersion" d2="Horror Games" d3="Adventure Games" d4="Educational Games" />

    <ExperienceEven :image_link=aircraft title="VR Aircraft - Coming Soon!" :image=icon player="1 Players/Time"
        time="10 Minutes/Round" price="KES 500" description="Fly your own Jet Fighter!"
        d1="Very interactive shooting games" d2="Immersion at its PEAK" d3="Great flying experiecne" d4="Fight for GLORY"/>
</template>

<script setup>
import ExperienceOdd from '@/Shared/ExperienceOdd.vue';
import ExperienceEven from '@/Shared/ExperienceEven.vue';

//images
import htc from '@/assets/images/experiences/htc.png';
import eggvr from '@/assets/images/experiences/eggvr.png';
import gtr from '@/assets/images/experiences/gtr.webp';
import racing_kart from '@/assets/images/experiences/racing_kart.png';
import magic_ufo from '@/assets/images/experiences/magic_ufo.png';
import aircraft from '@/assets/images/experiences/aircraft.png';
import icon from '@/assets/images/experiences/user.png'

</script>

<style scoped>
.hero {
    background-image: url('@/assets/images/experiences/experiences.png');
}
</style>