<template>
    <div>
        <div class="hero bg-cover bg-center h-screen">
            <div class="h-screen text-6xl font-extrabold text-blue flex items-center justify-center">
                <div class="flex justify-center items-center w-[24rem] h-[24rem] rounded-full bg-blue_opaque">
                    <div class="flex flex-col items-center">
                        <p class="text-pink_opaque">CONTACT</p>
                        <p class="">-</p>
                        <p class="text-blue">VR SPACE</p>
                    </div>
                </div>
            </div>
        </div>

        <div
            class="pb-20 flex flex-col md:flex-row justify-center gap-10 text-center mt-10 mx-12 md:gap-2 lg:gap-10 md:mx-2">
            <div class="bg-purple p-10 rounded-lg">
                <h2 class="text-3xl font-extrabold text-blue font-bold mb-5">GET IN TOUCH</h2>

                <div class="mb-6">
                    <h3 class="bg-white text-blue text-xl font-bold py-2 px-4 rounded mx-auto">LOCATIONS</h3>
                    <p class="text-left text-gray-900 text-lg font-bold mt-3">The Imaara Mall, Mombasa Road, 2nd Floor
                    </p>
                </div>

                <div class="mb-6">
                    <h3 class="bg-white text-blue text-xl font-bold py-2 px-4 rounded mx-auto">CONTACTS</h3>
                    <p class="text-left text-lg font-bold mt-3 text-gray-900">Phone: +254729054606</p>
                    <p class="text-left text-lg font-bold text-gray-900">Email: vrspace@jofargroAp.com</p>
                </div>

                <div>
                    <h3 class="bg-white text-blue text-xl font-bold py-2 px-4 rounded mx-auto ">SOCIALS</h3>
                    <p class="text-left text-lg font-bold mt-3 text-gray-900">Instagram: vrspace</p>
                    <p class="text-left text-lg font-bold text-gray-900">TikTok: vrspace</p>
                    <p class="text-left text-lg font-bold text-gray-900">LinkedIn: vrspace</p>
                </div>
            </div>

            <div class="bg-purple p-10 rounded-lg">
                <h2 class="text-3xl font-extrabold text-blue font-bold mb-8">CONTACT US</h2>
                <form @submit.prevent="submit" class="flex flex-col gap-4">
                    <div class="flex gap-4">
                        <input type="text" placeholder="First Name" class="p-2 border rounded w-1/2"
                            v-model="form.firstname">
                        <input type="text" placeholder="Last Name" class="p-2 border rounded w-1/2"
                            v-model="form.lastname">
                    </div>
                    <input type="email" placeholder="Email" class="p-2 border rounded w-full" v-model="form.email">
                    <input type="text" placeholder="Phone Number" class="p-2 border rounded w-full"
                        v-model="form.phonenumber">
                    <textarea placeholder="Message" class="p-2 border rounded w-full resize-none overflow-y-auto h-24"
                        v-model="form.message"></textarea>
                    <input type="submit" value="SEND MESSAGE"
                        class="p-2 bg-white text-blue font-bold rounded hover:bg-slate-200 transition-all delay-50 cursor-pointer">
                </form>
            </div>
        </div>


    </div>

</template>
<script setup>
import { useForm } from '@inertiajs/vue3';
let form = useForm({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    message: ''
});

function submit() {
    form.post("/createcontact", {
        preserveScroll: true,
        onSuccess: () => {
            form.firstname = '';
            form.lastname = '';
            form.email = '';
            form.phonenumber = '';
            form.message = '';
        }
    });
}
</script>

<style scoped>
.hero {
    background-image: url('@/assets/images/contact_us/contact_us.png');
}
</style>