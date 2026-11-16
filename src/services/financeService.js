import { supabase } from '@/lib/supabase'
import { monthRange } from '@/utils/date'
import { ourShare, financeTotals, REVENUE_COLUMNS } from '@/utils/finance'
import { buildSalaryRows, hourlyRateFrom } from '@/utils/payroll'

// ── Expense Templates ──

export async function listExpenseTemplates({ activeOnly = false } = {}) {
  let query = supabase
    .from('expense_templates')
    .select('*')
    .order('name')

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createExpenseTemplate({ name, default_amount }) {
  const { data, error } = await supabase
    .from('expense_templates')
    .insert({ name, default_amount })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpenseTemplate(id, updates) {
  const { data, error } = await supabase
    .from('expense_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleExpenseTemplateActive(id, isActive) {
  return updateExpenseTemplate(id, { is_active: isActive })
}

// ── Monthly Expenses ──

export async function listMonthlyExpenses(month) {
  const { data, error } = await supabase
    .from('monthly_expenses')
    .select('*, profiles:profile_id(full_name)')
    .eq('month', month)
    .order('type')
    .order('description')

  if (error) throw error
  return withSignedReceipts(data)
}

export async function getExpense(id) {
  const { data, error } = await supabase
    .from('monthly_expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  const [signed] = await withSignedReceipts([data])
  // Keep the stored value in receipt_url (so saving the form doesn't write a
  // temporary signed link back to the DB); expose the viewable link separately.
  return { ...data, receipt_view_url: signed.receipt_url }
}

/** Everything needed to work out a month's recurring + salary rows. */
async function loadMonthInputs(month) {
  const { start, end } = monthRange(month)

  const [settingsRes, templatesRes, employeesRes, existingRes, attendanceRes] = await Promise.all([
    supabase.from('settings').select('value').eq('key', 'working_hours').maybeSingle(),
    supabase.from('expense_templates').select('*').eq('is_active', true),
    supabase.from('profiles').select('id, full_name, salary').eq('is_active', true).gt('salary', 0),
    supabase.from('monthly_expenses').select('id, template_id, profile_id, type, amount, description').eq('month', month),
    supabase.from('attendance').select('employee_id, overtime_hours').gte('date', start).lte('date', end).not('clock_out', 'is', null),
  ])
  for (const res of [settingsRes, templatesRes, employeesRes, existingRes, attendanceRes]) {
    if (res.error) throw res.error
  }

  const existing = existingRes.data || []
  return {
    templates: templatesRes.data || [],
    existing,
    existingSalaries: existing.filter((e) => e.type === 'salary'),
    salaryRows: buildSalaryRows({
      month,
      employees: employeesRes.data || [],
      attendance: attendanceRes.data || [],
      hourlyRate: hourlyRateFrom(settingsRes.data?.value),
    }),
  }
}

export async function populateMonth(month) {
  const { templates, existing, existingSalaries, salaryRows } = await loadMonthInputs(month)

  const existingTemplateIds = new Set(existing.filter((e) => e.type === 'recurring').map((e) => e.template_id))
  const existingProfileIds = new Set(existingSalaries.map((e) => e.profile_id))

  const rows = [
    ...templates
      .filter((t) => !existingTemplateIds.has(t.id))
      .map((t) => ({
        month,
        type: 'recurring',
        template_id: t.id,
        description: t.name,
        amount: t.default_amount,
      })),
    ...salaryRows.filter((r) => !existingProfileIds.has(r.profile_id)),
  ]

  if (rows.length === 0) return existing

  const { data, error } = await supabase
    .from('monthly_expenses')
    .insert(rows)
    .select()

  if (error) throw error
  return data
}

/**
 * Brings a month's salary rows up to date with the overtime actually worked:
 * updates every active employee's salary row (overwriting manual edits) and
 * adds rows for employees who don't have one yet. Run before closing a month.
 */
export async function recalculateSalaries(month) {
  const { existingSalaries, salaryRows } = await loadMonthInputs(month)
  const existingByProfile = Object.fromEntries(existingSalaries.map((e) => [e.profile_id, e]))

  const toInsert = []
  const toUpdate = []
  for (const row of salaryRows) {
    const current = existingByProfile[row.profile_id]
    if (!current) {
      toInsert.push(row)
    } else if (Number(current.amount) !== row.amount || current.description !== row.description) {
      toUpdate.push({ id: current.id, amount: row.amount, description: row.description })
    }
  }

  const results = await Promise.all([
    ...toUpdate.map(({ id, ...changes }) =>
      supabase.from('monthly_expenses').update(changes).eq('id', id)
    ),
    toInsert.length ? supabase.from('monthly_expenses').insert(toInsert) : { error: null },
  ])
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error

  return { updated: toUpdate.length, added: toInsert.length }
}

export async function createOneOffExpense({ month, description, amount }) {
  const { data, error } = await supabase
    .from('monthly_expenses')
    .insert({ month, type: 'one_off', description, amount })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createWriteOffExpense({ month, description, amount }) {
  const { data, error } = await supabase
    .from('monthly_expenses')
    .insert({ month, type: 'write_off', description, amount })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(id, updates) {
  const { data, error } = await supabase
    .from('monthly_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase
    .from('monthly_expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadReceipt(file, expenseId) {
  const ext = file.name.split('.').pop()
  const path = `${expenseId}.${ext}`

  const { error } = await supabase.storage
    .from('expense-receipts')
    .upload(path, file, { upsert: true })

  if (error) throw error

  // The bucket is private: store the object path, sign it when displaying.
  return path
}

const RECEIPT_BUCKET = 'expense-receipts'
const RECEIPT_URL_TTL_SECONDS = 60 * 60

/** Accepts a stored path or a legacy public/signed URL and returns the object path. */
function receiptPath(value) {
  if (!value) return null
  const marker = `/${RECEIPT_BUCKET}/`
  const i = value.indexOf(marker)
  const path = i === -1 ? value : value.slice(i + marker.length)
  return decodeURIComponent(path.split('?')[0])
}

/** Returns copies of rows with receipt_url replaced by a short-lived signed URL. */
async function withSignedReceipts(rows) {
  if (!rows?.length) return rows
  const paths = [...new Set(rows.map((r) => receiptPath(r.receipt_url)).filter(Boolean))]
  if (!paths.length) return rows

  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrls(paths, RECEIPT_URL_TTL_SECONDS)

  if (error) {
    console.error('Failed to sign receipt URLs:', error.message)
    return rows.map((r) => ({ ...r, receipt_url: null }))
  }

  const byPath = Object.fromEntries(data.map((d) => [d.path, d.signedUrl]))
  return rows.map((r) => {
    const path = receiptPath(r.receipt_url)
    return path ? { ...r, receipt_url: byPath[path] || null } : r
  })
}

// ── Additional Income ──

export async function listAdditionalIncome(month) {
  const { data, error } = await supabase
    .from('additional_income')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createAdditionalIncome({ month, description, amount }) {
  const { data, error } = await supabase
    .from('additional_income')
    .insert({ month, description, amount })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAdditionalIncome(id, updates) {
  const { data, error } = await supabase
    .from('additional_income')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAdditionalIncome(id) {
  const { error } = await supabase
    .from('additional_income')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Finance Report ──

export async function getFinanceReport({ startMonth, endMonth }) {
  const [sy, sm] = startMonth.split('-').map(Number)
  const [ey, em] = endMonth.split('-').map(Number)
  const firstDay = startMonth
  const lastDay = monthRange(endMonth).end

  const [
    { data: salesRows, error: salesErr },
    { data: expRows, error: expErr },
    { data: incRows, error: incErr },
  ] = await Promise.all([
    supabase
      .from('daily_sales')
      .select(`date, ${REVENUE_COLUMNS}`)
      .gte('date', firstDay)
      .lte('date', lastDay),
    supabase
      .from('monthly_expenses')
      .select('*, profiles:profile_id(full_name)')
      .gte('month', startMonth)
      .lte('month', endMonth)
      .order('month')
      .order('type')
      .order('description'),
    supabase
      .from('additional_income')
      .select('*')
      .gte('month', startMonth)
      .lte('month', endMonth)
      .order('month'),
  ])

  if (salesErr) throw salesErr
  if (expErr) throw expErr
  if (incErr) throw incErr

  // Build month-by-month map
  const months = []
  let d = new Date(sy, sm - 1, 1)
  const end = new Date(ey, em - 1, 1)
  while (d <= end) {
    months.push(formatMonthKey(d.getFullYear(), d.getMonth()))
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }

  // VR revenue per month
  const vrByMonth = {}
  for (const row of salesRows || []) {
    const m = row.date.slice(0, 7) + '-01'
    vrByMonth[m] = (vrByMonth[m] || 0) + ourShare(row)
  }

  // Additional income per month
  const incByMonth = {}
  for (const row of incRows || []) {
    incByMonth[row.month] = (incByMonth[row.month] || 0) + Number(row.amount)
  }

  // Expenses per month (excluding write-offs for P&L)
  const expByMonth = {}
  const woByMonth = {}
  for (const row of expRows || []) {
    if (row.type === 'write_off') {
      woByMonth[row.month] = (woByMonth[row.month] || 0) + Number(row.amount)
    } else {
      expByMonth[row.month] = (expByMonth[row.month] || 0) + Number(row.amount)
    }
  }

  const monthlyBreakdown = months.map((m) => {
    const vr = vrByMonth[m] || 0
    const addInc = incByMonth[m] || 0
    const income = vr + addInc
    const expenses = expByMonth[m] || 0
    const writeOffs = woByMonth[m] || 0
    return { month: m, income, expenses, writeOffs, profit: income - expenses }
  })

  const totals = monthlyBreakdown.reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      expenses: acc.expenses + m.expenses,
      writeOffs: acc.writeOffs + m.writeOffs,
      profit: acc.profit + m.profit,
    }),
    { income: 0, expenses: 0, writeOffs: 0, profit: 0 }
  )

  // Build daily VR revenue items
  const vrDailyItems = (salesRows || []).map((row) => ({
    date: row.date,
    month: row.date.slice(0, 7) + '-01',
    amount: ourShare(row),
  }))

  return {
    monthlyBreakdown,
    totals,
    expenses: await withSignedReceipts(expRows || []),
    incomeItems: incRows || [],
    vrByMonth,
    vrDailyItems,
  }
}

function formatMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`
}

// ── Monthly Close ──

export async function getMonthStatus(month) {
  const { data, error } = await supabase
    .from('monthly_close')
    .select('*')
    .eq('month', month)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getMonthlyVRRevenue(month) {
  const { start, end } = monthRange(month)

  const { data, error } = await supabase
    .from('daily_sales')
    .select(REVENUE_COLUMNS)
    .gte('date', start)
    .lte('date', end)

  if (error) throw error
  return (data || []).reduce((sum, r) => sum + ourShare(r), 0)
}

/** Calendar year through `throughMonth` (inclusive): same rules as the monthly overview (VR + additional income − expenses). */
export async function getCumulativeFinanceThroughMonth(throughMonth) {
  const yearStart = `${throughMonth.slice(0, 4)}-01-01`
  const lastDay = monthRange(throughMonth).end

  const [{ data: salesRows, error: salesErr }, { data: expRows, error: expErr }, { data: incRows, error: incErr }] =
    await Promise.all([
      supabase
        .from('daily_sales')
        .select(REVENUE_COLUMNS)
        .gte('date', yearStart)
        .lte('date', lastDay),
      supabase
        .from('monthly_expenses')
        .select('amount, type')
        .gte('month', yearStart)
        .lte('month', throughMonth),
      supabase
        .from('additional_income')
        .select('amount')
        .gte('month', yearStart)
        .lte('month', throughMonth),
    ])

  if (salesErr) throw salesErr
  if (expErr) throw expErr
  if (incErr) throw incErr

  const vrTotal = (salesRows || []).reduce((sum, r) => sum + ourShare(r), 0)
  const t = financeTotals({ vrRevenue: vrTotal, expenses: expRows || [], additionalIncome: incRows || [] })

  return {
    totalIncome: t.totalIncome,
    totalExpenses: t.totalExpenses,
    profitLoss: t.profitLoss,
    vrTotal,
    additionalTotal: t.totalAdditionalIncome,
    writeOffTotal: t.totalWriteOffs,
  }
}

export async function closeMonth(month, closedBy, totalIncome, totalExpenses) {
  const { data, error } = await supabase
    .from('monthly_close')
    .upsert({
      month,
      is_closed: true,
      closed_at: new Date().toISOString(),
      closed_by: closedBy,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      profit_loss: totalIncome - totalExpenses,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function reopenMonth(month) {
  const { data, error } = await supabase
    .from('monthly_close')
    .update({ is_closed: false, closed_at: null, closed_by: null })
    .eq('month', month)
    .select()
    .single()

  if (error) throw error
  return data
}
