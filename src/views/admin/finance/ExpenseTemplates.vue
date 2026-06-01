<script setup>
import { ref, onMounted } from 'vue'
import { listExpenseTemplates, createExpenseTemplate, updateExpenseTemplate, toggleExpenseTemplateActive } from '@/services/financeService'
import { useAuth } from '@/composables/useAuth'
import { toast } from 'vue-sonner'

defineOptions({ name: 'ExpenseTemplates' })

const { isAdmin } = useAuth()

const templates = ref([])
const loading = ref(true)

const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', default_amount: 0 })
const saving = ref(false)

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

async function loadTemplates() {
  loading.value = true
  try {
    templates.value = await listExpenseTemplates()
  } catch (e) {
    toast.error('Failed to load templates')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', default_amount: 0 }
  showForm.value = true
}

function openEdit(t) {
  editingId.value = t.id
  form.value = { name: t.name, default_amount: Number(t.default_amount) }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.name || !form.value.default_amount) {
    toast.error('Fill in all fields')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateExpenseTemplate(editingId.value, form.value)
      toast.success('Template updated')
    } else {
      await createExpenseTemplate(form.value)
      toast.success('Template added')
    }
    showForm.value = false
    loadTemplates()
  } catch (e) {
    toast.error(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

async function handleToggle(t) {
  try {
    await toggleExpenseTemplateActive(t.id, !t.is_active)
    t.is_active = !t.is_active
    toast.success(`${t.name} ${t.is_active ? 'activated' : 'deactivated'}`)
  } catch (e) {
    toast.error('Failed to update')
  }
}

onMounted(loadTemplates)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-header font-bold text-gray-900">Expense Templates</h1>
        <p class="text-sm text-gray-500 mt-1">Recurring expenses that auto-populate each month</p>
      </div>
      <button
        v-if="isAdmin"
        @click="openAdd"
        class="bg-purple text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto"
      >
        + Add Template
      </button>
    </div>

    <!-- Inline form -->
    <div v-if="showForm" class="bg-white rounded-xl shadow-soft p-4 mb-4 space-y-3 md:flex md:items-end md:gap-4 md:space-y-0">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Rent"
          class="w-full rounded-lg border-gray-300 text-sm py-2 px-3 focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Default Amount (KES)</label>
        <input
          v-model.number="form.default_amount"
          type="number"
          min="0"
          step="100"
          class="w-full rounded-lg border-gray-300 text-sm py-2 px-3 focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      <div class="flex gap-2">
        <button
          @click="handleSave"
          :disabled="saving"
          class="bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : (editingId ? 'Update' : 'Add') }}
        </button>
        <button
          @click="showForm = false"
          class="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="templates.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No expense templates yet</p>
      <button @click="openAdd" class="mt-4 text-purple font-medium text-sm hover:underline">Add your first template</button>
    </div>

    <template v-else>
    <!-- Mobile: cards -->
    <div class="md:hidden space-y-3">
      <div
        v-for="t in templates"
        :key="t.id"
        class="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between"
      >
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900">{{ t.name }}</p>
          <p class="text-sm text-purple font-semibold">{{ formatPrice(t.default_amount) }} KES</p>
          <span
            :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1', t.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500']"
          >
            {{ t.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div v-if="isAdmin" class="flex items-center gap-2 ml-3">
          <button @click="openEdit(t)" class="text-sm text-purple font-medium hover:underline">Edit</button>
          <button
            @click="handleToggle(t)"
            :class="['relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', t.is_active ? 'bg-green-500' : 'bg-gray-300']"
          >
            <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform', t.is_active ? 'translate-x-4' : 'translate-x-0']" />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop: table -->
    <div class="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Default Amount</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
            <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="t in templates" :key="t.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ t.name }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-purple">{{ formatPrice(t.default_amount) }} KES</td>
            <td class="px-6 py-4">
              <span :class="['inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', t.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500']">
                {{ t.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td v-if="isAdmin" class="px-6 py-4 text-right space-x-3">
              <button @click="openEdit(t)" class="text-sm font-medium text-purple hover:text-purple-700">Edit</button>
              <button
                @click="handleToggle(t)"
                :class="['text-sm font-medium', t.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800']"
              >
                {{ t.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>
  </div>
</template>
