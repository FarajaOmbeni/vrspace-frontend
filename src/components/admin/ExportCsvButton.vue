<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Export CSV
  </button>
</template>

<script setup>
defineOptions({ name: 'ExportCsvButton' })
defineProps({ disabled: Boolean })
</script>
