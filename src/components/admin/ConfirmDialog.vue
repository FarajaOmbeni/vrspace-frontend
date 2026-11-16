<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.open"
        class="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        @keydown.esc="answer(false)"
      >
        <div class="absolute inset-0 bg-black/50" @click="answer(false)" />
        <div class="relative bg-white rounded-2xl shadow-strong w-full max-w-sm p-6">
          <h3 id="confirm-title" class="text-lg font-bold text-gray-900">{{ state.title }}</h3>
          <p v-if="state.message" class="text-sm text-gray-500 mt-2 whitespace-pre-line">{{ state.message }}</p>
          <div class="flex gap-3 mt-6">
            <button
              ref="cancelButton"
              type="button"
              class="flex-1 min-h-[48px] bg-gray-100 text-gray-700 font-semibold rounded-xl text-base hover:bg-gray-200"
              @click="answer(false)"
            >
              Cancel
            </button>
            <button
              type="button"
              :class="[
                'flex-1 min-h-[48px] font-semibold rounded-xl text-base text-white',
                state.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-purple hover:bg-purple-700',
              ]"
              @click="answer(true)"
            >
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useConfirm } from '@/composables/useConfirm'

defineOptions({ name: 'ConfirmDialog' })

const { state, answer } = useConfirm()
const cancelButton = ref(null)

// Focus "Cancel" so Enter/Escape never confirm by accident.
watch(
  () => state.open,
  async (open) => {
    if (open) {
      await nextTick()
      cancelButton.value?.focus()
    }
  }
)
</script>
