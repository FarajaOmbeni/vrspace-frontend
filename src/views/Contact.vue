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
                    <p class="text-left text-gray-900 text-lg font-bold mt-3">The Waterfront Karen, Basement
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
                <form @submit.prevent="sendEmail" class="flex flex-col gap-4">
                    <div class="flex gap-4">
                        <input required type="text" placeholder="First Name" class="p-2 border rounded w-1/2"
                            v-model="form.firstname">
                        <input required type="text" placeholder="Last Name" class="p-2 border rounded w-1/2"
                            v-model="form.lastname">
                    </div>
                    <input required type="email" placeholder="Email" class="p-2 border rounded w-full" v-model="form.email">
                    <input required type="text" placeholder="Phone Number" class="p-2 border rounded w-full"
                        v-model="form.phonenumber">
                    <textarea placeholder="Message" class="p-2 border rounded w-full resize-none overflow-y-auto h-24"
                        v-model="form.message"></textarea>
                    <button type="submit"
                        class="p-2 bg-white text-blue font-bold rounded hover:bg-slate-200 transition-all delay-50 cursor-pointer flex justify-center items-center"
                        :disabled="isLoading">
                        <span v-if="!isLoading">SEND MESSAGE</span>
                        <div v-else class="loader"></div>
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Confirmation Popup -->
    <div v-if="showConfirmation" class="fixed top-24 right-20 bg-green-600 text-white p-4 shadow-lg rounded-lg">
        Email Sent Successfully!
    </div>

    <!-- Error Popup -->
    <div v-if="showError" class="fixed top-24 right-20 bg-red-600 text-white p-4 shadow-lg rounded-lg">
        Failed to send email. Please try again.
    </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';
import emailjs from '@emailjs/browser';
import { ref } from 'vue';

const showConfirmation = ref(false);
const showError = ref(false);
const isLoading = ref(false);

let form = useForm({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    message: ''
});

const sendEmail = async () => {
    isLoading.value = true;
    try {
        const templateParams = {
            name: `${form.firstname} ${form.lastname}`,
            email: form.email,
            phonenumber: form.phonenumber,
            message: form.message
        };

        await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        );

        console.log('Email sent successfully');
        form.reset('firstname', 'lastname', 'email', 'phonenumber', 'message');
        showConfirmation.value = true;
        setTimeout(() => {
            showConfirmation.value = false;
        }, 3000);
    } catch (error) {
        console.error('Failed to send email:', error);
        showError.value = true;
        setTimeout(() => {
            showError.value = false;
        }, 3000);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.hero {
    background-image: url('@/assets/images/contact_us/contact_us.png');
}

.loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>