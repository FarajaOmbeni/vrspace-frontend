<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { getMachineRevenue } from '@/services/sessionService'
import { toast } from 'vue-sonner'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

defineOptions({ name: 'MachinesReport' })

const machines = ref([])
const loading = ref(true)

const filterPeriod = ref('week')
const filterStartDate = ref('')
const filterEndDate = ref('')

function getDateRange() {
  const now = new Date()
  let start, end

  if (filterPeriod.value === 'week') {
    const day = now.getDay()
    start = new Date(now)
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    end = now
  } else if (filterPeriod.value === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = now
  } else if (filterPeriod.value === 'last-month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    end = new Date(now.getFullYear(), now.getMonth(), 0)
  } else {
    start = filterStartDate.value ? new Date(filterStartDate.value) : null
    end = filterEndDate.value ? new Date(filterEndDate.value) : null
  }

  function toDateStr(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return {
    startDate: start ? toDateStr(start) : undefined,
    endDate: end ? toDateStr(end) : undefined,
  }
}

function formatPrice(amount) {
  return Number(amount).toLocaleString('en-KE')
}

const chartData = computed(() => ({
  labels: machines.value.map((m) => m.name),
  datasets: [
    {
      label: 'Revenue (KES)',
      data: machines.value.map((m) => m.revenue),
      backgroundColor: '#7c3aed',
      borderRadius: 8,
      maxBarThickness: 60,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => `${Number(ctx.raw).toLocaleString('en-KE')} KES`,
      },
    },
    datalabels: {
      anchor: 'end',
      align: 'top',
      color: '#374151',
      font: { weight: 'bold', size: 12 },
      formatter: (value) => `${Number(value).toLocaleString('en-KE')}`,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grace: '15%',
      ticks: {
        callback: (value) => Number(value).toLocaleString('en-KE'),
      },
      grid: { color: '#f3f4f6' },
    },
    x: {
      grid: { display: false },
    },
  },
}

async function loadData() {
  loading.value = true
  try {
    const { startDate, endDate } = getDateRange()
    machines.value = await getMachineRevenue({ startDate, endDate })
  } catch (e) {
    toast.error('Failed to load machine data')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div>
    <h1 class="text-2xl font-header font-bold text-gray-900 mb-6">Machines Report</h1>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-4 space-y-3 md:space-y-0 md:flex md:items-end md:gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Period</label>
        <div class="flex gap-1">
          <button
            v-for="p in ['week', 'month', 'last-month', 'custom']"
            :key="p"
            @click="filterPeriod = p; if (p !== 'custom') applyFilters()"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filterPeriod === p
                ? 'bg-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'last-month' ? 'Last Month' : 'Custom' }}
          </button>
        </div>
      </div>
      <template v-if="filterPeriod === 'custom'">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input v-model="filterStartDate" type="date" class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input v-model="filterEndDate" type="date" class="w-full rounded-lg border-gray-300 text-sm py-2 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <button @click="applyFilters" class="bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Apply</button>
      </template>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="machines.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No session data for this period</p>
    </div>

    <template v-else>
      <!-- Chart -->
      <div class="bg-white rounded-xl shadow-soft p-4 md:p-6 mb-4">
        <div class="overflow-x-auto">
          <div :style="{ minWidth: machines.length > 4 ? machines.length * 100 + 'px' : '100%', height: '350px' }">
            <Bar :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels]" />
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="m in machines"
          :key="m.name"
          class="bg-white rounded-xl shadow-soft p-4"
        >
          <p class="text-sm font-medium text-gray-900 truncate">{{ m.name }}</p>
          <p class="text-lg font-bold text-purple mt-1">{{ formatPrice(m.revenue) }} KES</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ m.sessions }} sessions</p>
        </div>
      </div>
    </template>
  </div>
</template>
