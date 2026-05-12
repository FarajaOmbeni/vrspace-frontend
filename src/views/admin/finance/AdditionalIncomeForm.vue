<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createAdditionalIncome, updateAdditionalIncome } from '@/services/financeService'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

defineOptions({ name: 'AdditionalIncomeForm' })

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const form = ref({ description: '', amount: 0 })
const loading = ref(false)
const loadingData = ref(false)

const month = computed(() => route.query.month || new Date().toISOString().slice(0, 7) + '-01')

async function loadIncome() {
  loadingData.value = true
  try {
    const { data, error } = await supabase
      .from('additional_income')
      .select('*')
      .eq('id', route.params.id)
      .single()
    if (error) throw error
    form.value = { description: data.description, amount: Number(data.amount) }
  } catch (e) {
    toast.error('Failed to load income')
    router.back()
  } finally {
    loadingData.value = false
  }
}

async function handleSubmit() {
  if (!form.value.description || !form.value.amount) {
    toast.error('Fill in all fields')
    return
  }
  loading.value = true
  try {
    if (isEdit.value) {
      await updateAdditionalIncome(route.params.id, form.value)
      toast.success('Income updated')
    } else {
      await createAdditionalIncome({ month: month.value, ...form.value })
      toast.success('Income added')
    }
    router.push({ path: '/admin/finance', query: { month: month.value } })
  } catch (e) {
    toast.error(e.message || 'Failed to save')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) loadIncome()
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h1 class="text-2xl font-header font-bold text-gray-900">{{ isEdit ? 'Edit Income' : 'Add Income' }}</h1>
    </div>

    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-soft p-6 space-y-5">
      <div>
        <label for="desc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          id="desc"
          v-model="form.description"
          type="text"
          required
          placeholder="e.g. Event hosting - Birthday party"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
        <input
          id="amount"
          v-model.number="form.amount"
          type="number"
          required
          min="0"
          step="1"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" :disabled="loading" class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50">
          {{ loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Income') }}
        </button>
        <button type="button" @click="router.back()" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-base hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
