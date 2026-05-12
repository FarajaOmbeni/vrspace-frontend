<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createMachine, getMachine, updateMachine, uploadMachineImage } from '@/services/machineService'
import { toast } from 'vue-sonner'

defineOptions({ name: 'MachineForm' })

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const form = ref({
  name: '',
  price_per_session: 500,
  is_active: true,
  image_url: null,
})
const imageFile = ref(null)
const imagePreview = ref(null)
const loading = ref(false)
const loadingData = ref(false)

function handleImageSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be under 5MB')
    return
  }

  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
  form.value.image_url = null
}

async function loadMachine() {
  loadingData.value = true
  try {
    const machine = await getMachine(route.params.id)
    form.value = {
      name: machine.name,
      price_per_session: Number(machine.price_per_session),
      is_active: machine.is_active,
      image_url: machine.image_url,
    }
    if (machine.image_url) {
      imagePreview.value = machine.image_url
    }
  } catch (e) {
    toast.error('Failed to load machine')
    router.push('/admin/machines')
  } finally {
    loadingData.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  try {
    if (isEdit.value) {
      // Upload image if a new file was selected
      if (imageFile.value) {
        form.value.image_url = await uploadMachineImage(imageFile.value, route.params.id)
      }
      await updateMachine(route.params.id, form.value)
      toast.success(`${form.value.name} updated`)
    } else {
      // Create first, then upload image with the new ID
      const machine = await createMachine(form.value)
      if (imageFile.value) {
        const imageUrl = await uploadMachineImage(imageFile.value, machine.id)
        await updateMachine(machine.id, { image_url: imageUrl })
      }
      toast.success(`${form.value.name} added`)
    }
    router.push('/admin/machines')
  } catch (e) {
    toast.error(e.message || `Failed to ${isEdit.value ? 'update' : 'create'} machine`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) loadMachine()
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.back()"
        class="text-gray-400 hover:text-gray-600 transition-colors p-1"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h1 class="text-2xl font-header font-bold text-gray-900">
        {{ isEdit ? 'Edit Machine' : 'Add Machine' }}
      </h1>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-soft p-6 space-y-5">
      <!-- Image Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Machine Photo</label>
        <div v-if="imagePreview" class="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
          <img :src="imagePreview" alt="Machine preview" class="w-full h-full object-cover" />
          <button
            type="button"
            @click="removeImage"
            class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <label
          v-else
          class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple transition-colors bg-gray-50"
        >
          <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          <p class="text-sm text-gray-500">Tap to upload photo</p>
          <p class="text-xs text-gray-400 mt-1">JPG, PNG under 5MB</p>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageSelect"
          />
        </label>
      </div>

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Machine Name
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g. Playstation 5"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <!-- Price -->
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
          Price per Session (KES)
        </label>
        <input
          id="price"
          v-model.number="form.price_per_session"
          type="number"
          required
          min="0"
          step="50"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Active</label>
        <button
          type="button"
          @click="form.is_active = !form.is_active"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            form.is_active ? 'bg-green-500' : 'bg-gray-300',
          ]"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
              form.is_active ? 'translate-x-5' : 'translate-x-0',
            ]"
          />
        </button>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">{{ isEdit ? 'Saving...' : 'Creating...' }}</span>
          <span v-else>{{ isEdit ? 'Save Changes' : 'Create Machine' }}</span>
        </button>
        <button
          type="button"
          @click="router.back()"
          class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-base hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
