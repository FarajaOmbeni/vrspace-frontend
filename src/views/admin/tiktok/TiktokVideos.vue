<script setup>
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import { listTiktokVideosAdmin, addTiktokVideo, deleteTiktokVideo } from '@/services/tiktokService'

defineOptions({ name: 'TiktokVideos' })

const videos = ref([])
const loading = ref(true)
const newUrl = ref('')
const adding = ref(false)
const deletingId = ref(null)

const totalVideos = computed(() => videos.value.length)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function loadVideos() {
  loading.value = true
  try {
    videos.value = await listTiktokVideosAdmin()
  } catch (e) {
    toast.error('Failed to load videos')
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  const url = newUrl.value.trim()
  if (!url) return

  const cleanUrl = url.split('?')[0]

  if (!cleanUrl.includes('tiktok.com') || !cleanUrl.includes('/video/')) {
    toast.error('Please enter a valid TikTok video URL')
    return
  }

  if (videos.value.some((v) => v.url === cleanUrl)) {
    toast.error('This video is already added')
    return
  }

  adding.value = true
  try {
    const video = await addTiktokVideo(cleanUrl)
    videos.value.unshift(video)
    newUrl.value = ''
    toast.success('Video added')
  } catch (e) {
    toast.error('Failed to add video')
  } finally {
    adding.value = false
  }
}

async function handleDelete(id) {
  deletingId.value = id
  try {
    await deleteTiktokVideo(id)
    videos.value = videos.value.filter((v) => v.id !== id)
    toast.success('Video removed')
  } catch (e) {
    toast.error('Failed to remove video')
  } finally {
    deletingId.value = null
  }
}

onMounted(loadVideos)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-header font-bold text-gray-900">TikTok Videos</h1>
        <p class="text-sm text-gray-500 mt-1">{{ totalVideos }} videos — 3 random ones shown daily on the homepage</p>
      </div>
    </div>

    <!-- Add Video Form -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-6">
      <form @submit.prevent="handleAdd" class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="newUrl"
          type="text"
          placeholder="Paste TikTok video URL..."
          class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple transition-colors"
        />
        <button
          type="submit"
          :disabled="adding || !newUrl.trim()"
          class="bg-purple text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          <span v-if="adding">Adding...</span>
          <span v-else>+ Add Video</span>
        </button>
      </form>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="videos.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No videos yet</p>
      <p class="text-gray-400 text-sm mt-1">Add TikTok video URLs above to feature them on the homepage</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">#</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Video Link</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Date Added</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(video, index) in videos"
            :key="video.id"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-400">{{ index + 1 }}</td>
            <td class="px-4 py-3">
              <a
                :href="video.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue hover:text-purple transition-colors break-all"
              >
                {{ video.url }}
              </a>
            </td>
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatDate(video.created_at) }}</td>
            <td class="px-4 py-3 text-right">
              <button
                @click="handleDelete(video.id)"
                :disabled="deletingId === video.id"
                class="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
