<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-blue text-white py-20">
            <div class="container mx-auto px-4 text-center mt-24">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">VR Marketplace</h1>
                <p class="text-xl">Premium VR Headsets at Competitive Prices</p>
            </div>
        </div>

        <!-- Products Section -->
        <div class="container mx-auto px-4 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                <div v-for="product in products" :key="product.id"
                    class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 hover:border-gray-300 ring-4 ring-purple-400 ring-opacity-50 border-purple-300">
                    <div class="h-40 relative overflow-hidden cursor-pointer group" @click="openImageModal(product)">
                        <img :src="product.image" :alt="product.name"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20"></div>
                        <!-- Click to view indicator -->
                        <div
                            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div
                        class="border-t-2 border-gray-200 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-t-purple-200">
                        <h3 class="text-lg font-bold mb-2 line-clamp-2">{{ product.name }}</h3>
                        <p class="text-gray-600 mb-3 text-sm">{{ product.storage }} Storage</p>
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-bold text-blue-600">{{ product.price }}</span>
                            <button @click="openCheckout(product)"
                                class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-full font-bold text-sm transition-all duration-300 hover:opacity-90 hover:shadow-md">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Checkout Modal -->
        <div v-if="showCheckoutModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="closeCheckout">
            <div class="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
                <h2 class="text-2xl font-bold mb-6 text-center">Checkout</h2>

                <!-- Selected Product -->
                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 class="font-bold text-lg">{{ selectedProduct.name }}</h3>
                    <p class="text-gray-600">{{ selectedProduct.storage }} Storage</p>
                    <p class="text-xl font-bold text-blue-600 mt-2">{{ selectedProduct.price }}</p>
                </div>

                <!-- Customer Details Form -->
                <form @submit.prevent="submitOrder" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">First Name *</label>
                        <input v-model="customerDetails.firstName" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Last Name *</label>
                        <input v-model="customerDetails.lastName" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Country *</label>
                        <select v-model="customerDetails.country" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Country</option>
                            <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Address *</label>
                        <textarea v-model="customerDetails.address" required rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Phone Number *</label>
                        <input v-model="customerDetails.phoneNumber" type="tel" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Email Address *</label>
                        <input v-model="customerDetails.emailAddress" type="email" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div class="flex space-x-4 mt-6">
                        <button type="button" @click="closeCheckout"
                            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
                            :disabled="isLoading">
                            <span v-if="!isLoading">Place Order</span>
                            <div v-else class="loader"></div>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showImageModal"
            class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            @click="closeImageModal">
            <div class="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                <button @click="closeImageModal"
                    class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
                <img :src="selectedImage.image" :alt="selectedImage.name"
                    class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" @click.stop>
                <div class="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    <h3 class="font-bold text-lg">{{ selectedImage.name }}</h3>
                    <p class="text-sm">{{ selectedImage.storage }} Storage - {{ selectedImage.price }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Notifications -->
    <transition name="fade">
        <div v-if="showConfirmation"
            class="fixed top-24 right-6 bg-green-600 text-white p-4 shadow-xl rounded-lg z-50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Order submitted successfully!
        </div>
    </transition>

    <transition name="fade">
        <div v-if="showError"
            class="fixed top-24 right-6 bg-red-600 text-white p-4 shadow-xl rounded-lg z-50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed to submit order. Please try again.
        </div>
    </transition>
</template>

<script setup>
import { ref, reactive } from 'vue';
import emailjs from '@emailjs/browser';
import quest2 from '@/assets/images/marketplace/quest2.webp';
import quest3s from '@/assets/images/marketplace/quest3s.webp';
import quest3 from '@/assets/images/marketplace/quest3.jpg';

// Products data
const products = [
    {
        id: 1,
        name: 'Meta Quest 3S VR Headset',
        storage: '256GB',
        price: 'KES 51,499',
        image: quest3s
    },
    {
        id: 2,
        name: 'Meta Quest 3S VR Headset',
        storage: '128GB',
        price: 'KES 44,999',
        image: quest3s
    },
    {
        id: 3,
        name: 'Meta Quest 3 VR Headset',
        storage: '128GB',
        price: 'KES 69,499',
        image: quest3
    },
    {
        id: 4,
        name: 'Meta Quest 3 VR Headset',
        storage: '512GB',
        price: 'KES 71,499',
        image: quest3
    },
    {
        id: 5,
        name: 'Meta Quest 2 VR Headset',
        storage: '256GB',
        price: 'KES 82,999',
        image: quest2
    },
    {
        id: 6,
        name: 'Meta Quest 2 VR Headset',
        storage: '128GB',
        price: 'KES 54,499',
        image: quest2
    }
];

// Countries dropdown
const countries = [
    'Kenya',
    'Uganda',
    'Tanzania',
    'Rwanda',
    'Burundi',
    'South Sudan',
    'Ethiopia',
    'Somalia',
    'Djibouti',
    'Eritrea',
    'Other'
];

// Checkout modal state
const showCheckoutModal = ref(false);
const selectedProduct = ref({});

// Image modal state
const showImageModal = ref(false);
const selectedImage = ref({});

// Email notifications
const showConfirmation = ref(false);
const showError = ref(false);
const isLoading = ref(false);

// Customer details form
const customerDetails = reactive({
    firstName: '',
    lastName: '',
    country: '',
    address: '',
    phoneNumber: '',
    emailAddress: ''
});

// Open checkout modal
const openCheckout = (product) => {
    selectedProduct.value = product;
    showCheckoutModal.value = true;
};

// Open image modal
const openImageModal = (product) => {
    selectedImage.value = product;
    showImageModal.value = true;
};

// Close checkout modal
const closeCheckout = () => {
    showCheckoutModal.value = false;
    selectedProduct.value = {};
    // Reset form
    Object.keys(customerDetails).forEach(key => {
        customerDetails[key] = '';
    });
};

// Close image modal
const closeImageModal = () => {
    showImageModal.value = false;
    selectedImage.value = {};
};

// Submit order
const submitOrder = async () => {
    isLoading.value = true;
    try {
        const templateParams = {
            name: `${customerDetails.firstName} ${customerDetails.lastName}`,
            product: selectedProduct.value.name,
            message: `
                Email: ${customerDetails.emailAddress}
                Phone: ${customerDetails.phoneNumber}
                Country: ${customerDetails.country}
                Address: ${customerDetails.address}
                Product Name: ${selectedProduct.value.name}
                Product Storage: ${selectedProduct.value.storage}
                Product Price: ${selectedProduct.value.price}
                Order Total: ${selectedProduct.value.price}
            `
        };

        await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        );

        console.log('Order email sent successfully');
        showConfirmation.value = true;
        setTimeout(() => {
            showConfirmation.value = false;
        }, 3000);

        closeCheckout();
    } catch (error) {
        console.error('Failed to send order email:', error);
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
.loader {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffffff;
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>