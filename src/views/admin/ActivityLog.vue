<script setup>
import { ref, onMounted, watch } from 'vue'
import { listAuditLog } from '@/services/auditService'
import { formatInstantDate, formatTime, formatPrice } from '@/utils/format'
import { toast } from 'vue-sonner'

defineOptions({ name: 'ActivityLog' })

const TABLES = {
  daily_sales: 'Daily sales',
  sessions: 'Session',
  attendance: 'Attendance',
  monthly_expenses: 'Expense',
  additional_income: 'Income',
  monthly_close: 'Month close',
  profiles: 'Employee',
  machines: 'Machine',
  settings: 'Settings',
}

const FIELDS = {
  partner_reported_revenue: 'Partner figure',
  discrepancy_resolved: 'Resolved',
  resolved_with: 'Resolved using',
  notes: 'Notes',
  amount: 'Amount',
  description: 'Description',
  clock_in: 'Clock in',
  clock_out: 'Clock out',
  total_hours: 'Hours',
  overtime_hours: 'Overtime',
  session_count: 'Sessions',
  price_per_session: 'Price',
  is_closed: 'Closed',
  total_income: 'Income',
  total_expenses: 'Expenses',
  profit_loss: 'Profit/loss',
  salary: 'Salary',
  role: 'Role',
  is_active: 'Active',
  full_name: 'Name',
  name: 'Name',
  image_url: 'Photo',
  receipt_url: 'Receipt',
  value: 'Value',
  date: 'Date',
}

// Bookkeeping columns that change alongside the real edit; not worth showing.
const HIDDEN = new Set(['logged_by', 'resolved_by', 'resolved_at', 'closed_by', 'closed_at', 'updated_at', 'created_at', 'employee_id', 'machine_id', 'partner_staff_id', 'profile_id', 'template_id', 'id'])

const MONEY = new Set(['partner_reported_revenue', 'amount', 'price_per_session', 'total_income', 'total_expenses', 'profit_loss', 'salary', 'total_revenue'])

const entries = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const tableFilter = ref('')

function formatValue(field, value) {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return 'changed'
  if (MONEY.has(field)) return `${formatPrice(value)} KES`
  if (field === 'total_hours' || field === 'overtime_hours') return `${Number(value).toFixed(2)} h`
  if (field.endsWith('_url')) return 'file'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return `${formatInstantDate(value, { day: 'numeric', month: 'short' })} ${formatTime(value)}`
  }
  if (field === 'resolved_with') return value === 'ours' ? 'our records' : 'partner figure'
  return String(value)
}

function changeLines(entry) {
  if (entry.action !== 'update' || !entry.changes) return []
  return Object.entries(entry.changes)
    .filter(([field]) => !HIDDEN.has(field))
    .map(([field, { from, to }]) => ({
      field: FIELDS[field] || field.replace(/_/g, ' '),
      from: formatValue(field, from),
      to: formatValue(field, to),
    }))
}

function headline(entry) {
  const what = TABLES[entry.table_name] || entry.table_name
  const verb = { insert: 'added', update: 'changed', delete: 'deleted' }[entry.action]
  if (entry.table_name === 'monthly_close' && entry.changes?.is_closed) {
    return entry.changes.is_closed.to ? 'closed the month' : 'reopened the month'
  }
  return `${verb} ${what.toLowerCase()}`
}

// Short summary of a deleted or added row.
function snapshotSummary(entry) {
  const r = entry.snapshot
  if (!r) return ''
  const bits = []
  if (r.session_count) bits.push(`${r.session_count} session${r.session_count > 1 ? 's' : ''}`)
  if (r.amount != null) bits.push(`${formatPrice(r.amount)} KES`)
  if (r.total_amount != null && r.amount == null) bits.push(`${formatPrice(r.total_amount)} KES`)
  if (r.clock_in) bits.push(`in ${formatTime(r.clock_in)}`)
  if (r.clock_out) bits.push(`out ${formatTime(r.clock_out)}`)
  return bits.join(' · ')
}

async function load(reset = true) {
  if (reset) loading.value = true
  else loadingMore.value = true
  try {
    const before = reset ? undefined : entries.value.at(-1)?.id
    const page = await listAuditLog({ table: tableFilter.value || undefined, before })
    entries.value = reset ? page.entries : [...entries.value, ...page.entries]
    hasMore.value = page.hasMore
  } catch (e) {
    toast.error(e.message || 'Failed to load activity')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

watch(tableFilter, () => load(true))
onMounted(() => load(true))
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-header font-bold text-gray-900">Activity Log</h1>
        <p class="text-sm text-gray-500">Who changed or deleted money and attendance records</p>
      </div>
      <select
        v-model="tableFilter"
        class="min-h-[44px] rounded-xl border-gray-300 pl-4 pr-10 text-sm focus:border-purple-500 focus:ring-purple-500"
      >
        <option value="">Everything</option>
        <option v-for="(label, key) in TABLES" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple/30 border-t-purple rounded-full animate-spin" />
    </div>

    <div v-else-if="entries.length === 0" class="text-center py-12 text-gray-400">
      Nothing recorded yet
    </div>

    <div v-else class="space-y-2">
      <div v-for="e in entries" :key="e.id" class="bg-white rounded-xl shadow-soft p-4">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm text-gray-900">
            <span class="font-semibold">{{ e.actor_name || 'System' }}</span>
            {{ headline(e) }}
            <span v-if="e.row_label" class="font-medium">· {{ e.row_label }}</span>
          </p>
          <p class="text-xs text-gray-400 whitespace-nowrap">
            {{ formatInstantDate(e.at, { day: 'numeric', month: 'short' }) }} {{ formatTime(e.at) }}
          </p>
        </div>
        <ul v-if="changeLines(e).length" class="mt-2 space-y-1">
          <li v-for="c in changeLines(e)" :key="c.field" class="text-sm text-gray-600">
            <span class="text-gray-400">{{ c.field }}: </span>
            <span class="line-through decoration-gray-300">{{ c.from }}</span>
            <span> → </span>
            <span class="font-medium text-gray-900">{{ c.to }}</span>
          </li>
        </ul>
        <p v-else-if="snapshotSummary(e)" class="mt-1 text-sm text-gray-500">{{ snapshotSummary(e) }}</p>
      </div>

      <button
        v-if="hasMore"
        @click="load(false)"
        :disabled="loadingMore"
        class="w-full min-h-[48px] rounded-xl bg-white shadow-soft text-sm font-semibold text-purple disabled:opacity-50"
      >
        {{ loadingMore ? 'Loading...' : 'Load more' }}
      </button>
    </div>
  </div>
</template>
