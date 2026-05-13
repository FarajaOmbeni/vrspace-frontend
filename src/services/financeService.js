import { supabase } from '@/lib/supabase'

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
  return data
}

function localDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function populateMonth(month) {
  // Calculate month date range
  const [y, m] = month.split('-').map(Number)
  const endDate = localDateString(new Date(y, m, 0)) // last day of month

  // Get hourly rate from settings
  let hourlyRate = 400
  const { data: workingHours } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'working_hours')
    .maybeSingle()
  if (workingHours?.value?.hourly_rate) {
    hourlyRate = workingHours.value.hourly_rate
  }

  const [{ data: templates }, { data: employees }, { data: existing }, { data: attendance }] = await Promise.all([
    supabase.from('expense_templates').select('*').eq('is_active', true),
    supabase.from('profiles').select('id, full_name, salary').eq('is_active', true).gt('salary', 0),
    supabase.from('monthly_expenses').select('template_id, profile_id, type').eq('month', month),
    supabase.from('attendance').select('employee_id, overtime_hours').gte('date', month).lte('date', endDate).not('clock_out', 'is', null),
  ])

  // Sum overtime hours per employee
  const overtimeMap = {}
  for (const a of attendance || []) {
    const ot = Number(a.overtime_hours || 0)
    if (ot > 0) {
      overtimeMap[a.employee_id] = (overtimeMap[a.employee_id] || 0) + ot
    }
  }

  const existingTemplateIds = new Set((existing || []).filter(e => e.type === 'recurring').map(e => e.template_id))
  const existingProfileIds = new Set((existing || []).filter(e => e.type === 'salary').map(e => e.profile_id))

  const rows = []

  for (const t of templates || []) {
    if (!existingTemplateIds.has(t.id)) {
      rows.push({
        month,
        type: 'recurring',
        template_id: t.id,
        description: t.name,
        amount: t.default_amount,
      })
    }
  }

  for (const e of employees || []) {
    if (!existingProfileIds.has(e.id)) {
      const otHours = overtimeMap[e.id] || 0
      const otPay = Math.round(otHours * hourlyRate)
      const totalPay = Number(e.salary) + otPay

      let description = `${e.full_name} - Salary`
      if (otHours > 0) {
        const h = Math.floor(otHours)
        const m = Math.round((otHours - h) * 60)
        description = `${e.full_name} - Salary (${h}h ${m}m OT = +${otPay.toLocaleString('en-KE')} KES)`
      }

      rows.push({
        month,
        type: 'salary',
        profile_id: e.id,
        description,
        amount: totalPay,
      })
    }
  }

  if (rows.length === 0) return existing || []

  const { data, error } = await supabase
    .from('monthly_expenses')
    .insert(rows)
    .select()

  if (error) throw error
  return data
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

  const { data } = supabase.storage
    .from('expense-receipts')
    .getPublicUrl(path)

  return data.publicUrl
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

/** Finance VR line: 50% of partner-reported gross when set; else session-derived our_share. */
function vrOurShareForFinance(row) {
  if (row.partner_reported_revenue != null) {
    const p = Number(row.partner_reported_revenue)
    if (!Number.isNaN(p)) return p * 0.5
  }
  return Number(row.our_share || 0)
}

export async function getMonthlyVRRevenue(month) {
  const startDate = month
  const [y, m] = month.split('-').map(Number)
  const endDate = localDateString(new Date(y, m, 0))

  const { data, error } = await supabase
    .from('daily_sales')
    .select('our_share, partner_reported_revenue')
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw error
  return (data || []).reduce((sum, r) => sum + vrOurShareForFinance(r), 0)
}

/** Calendar year through `throughMonth` (inclusive): same rules as the monthly overview (VR + additional income − expenses). */
export async function getCumulativeFinanceThroughMonth(throughMonth) {
  const [y, m] = throughMonth.split('-').map(Number)
  const yearStart = `${y}-01-01`
  const lastDay = localDateString(new Date(y, m, 0))

  const [{ data: salesRows, error: salesErr }, { data: expRows, error: expErr }, { data: incRows, error: incErr }] =
    await Promise.all([
      supabase
        .from('daily_sales')
        .select('our_share, partner_reported_revenue')
        .gte('date', yearStart)
        .lte('date', lastDay),
      supabase
        .from('monthly_expenses')
        .select('amount')
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

  const vrTotal = (salesRows || []).reduce((sum, r) => sum + vrOurShareForFinance(r), 0)
  const additionalTotal = (incRows || []).reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const expenseTotal = (expRows || []).reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const totalIncome = vrTotal + additionalTotal
  const profitLoss = totalIncome - expenseTotal

  return { totalIncome, totalExpenses: expenseTotal, profitLoss, vrTotal, additionalTotal }
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
