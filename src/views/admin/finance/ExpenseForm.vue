<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createOneOffExpense, createWriteOffExpense, updateExpense, uploadReceipt } from '@/services/financeService'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

defineOptions({ name: 'ExpenseForm' })

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const form = ref({
  description: '',
  amount: 0,
  receipt_url: null,
})
const receiptFile = ref(null)
const receiptPreview = ref(null)
const loading = ref(false)
const loadingData = ref(false)

// Month from query param or current month
const month = computed(() => route.query.month || new Date().toISOString().slice(0, 7) + '-01')
const expenseType = computed(() => route.query.type === 'write_off' ? 'write_off' : 'one_off')
const isWriteOff = computed(() => expenseType.value === 'write_off')

function handleReceiptSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File must be under 5MB')
    return
  }
  receiptFile.value = file
  receiptPreview.value = URL.createObjectURL(file)
}

function removeReceipt() {
  receiptFile.value = null
  receiptPreview.value = null
  form.value.receipt_url = null
}

async function loadExpense() {
  loadingData.value = true
  try {
    const { data, error } = await supabase
      .from('monthly_expenses')
      .select('*')
      .eq('id', route.params.id)
      .single()
    if (error) throw error
    form.value = {
      description: data.description,
      amount: Number(data.amount),
      receipt_url: data.receipt_url,
    }
    if (data.receipt_url) receiptPreview.value = data.receipt_url
  } catch (e) {
    toast.error('Failed to load expense')
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
      if (receiptFile.value) {
        form.value.receipt_url = await uploadReceipt(receiptFile.value, route.params.id)
      }
      await updateExpense(route.params.id, form.value)
      toast.success('Expense updated')
    } else {
      const createFn = isWriteOff.value ? createWriteOffExpense : createOneOffExpense
      const expense = await createFn({
        month: month.value,
        description: form.value.description,
        amount: form.value.amount,
      })
      if (receiptFile.value) {
        const url = await uploadReceipt(receiptFile.value, expense.id)
        await updateExpense(expense.id, { receipt_url: url })
      }
      toast.success('Expense added')
    }
    router.push({ path: '/admin/finance', query: { month: month.value } })
  } catch (e) {
    toast.error(e.message || 'Failed to save expense')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) loadExpense()
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h1 class="text-2xl font-header font-bold text-gray-900">{{ isEdit ? 'Edit' : 'Add' }} {{ isWriteOff ? 'Write-off' : 'Expense' }}</h1>
    </div>

    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-soft p-6 space-y-5">
      <!-- Receipt -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Receipt (optional)</label>
        <div v-if="receiptPreview" class="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
          <img :src="receiptPreview" alt="Receipt" class="w-full h-full object-cover" />
          <button type="button" @click="removeReceipt" class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple transition-colors bg-gray-50">
          <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          <p class="text-sm text-gray-500">Tap to upload receipt</p>
          <input type="file" accept="image/*" class="hidden" @change="handleReceiptSelect" />
        </label>
      </div>

      <!-- Description -->
      <div>
        <label for="desc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          id="desc"
          v-model="form.description"
          type="text"
          required
          placeholder="e.g. Cleaning supplies"
          class="w-full rounded-xl border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <!-- Amount -->
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

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" :disabled="loading" class="flex-1 bg-purple text-white font-semibold py-3 rounded-xl text-base hover:bg-purple-700 transition-colors disabled:opacity-50">
          {{ loading ? 'Saving...' : (isEdit ? 'Save Changes' : isWriteOff ? 'Add Write-off' : 'Add Expense') }}
        </button>
        <button type="button" @click="router.back()" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-base hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
