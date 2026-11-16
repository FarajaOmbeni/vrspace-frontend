import { supabase } from '@/lib/supabase'
import { todayEAT } from '@/utils/date'
import { fetchAll } from '@/lib/fetchAll'

export async function logSession({ employeeId, machineId, sessionCount, pricePerSession, partnerStaffId }) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      employee_id: employeeId,
      machine_id: machineId,
      session_count: sessionCount,
      price_per_session: pricePerSession,
      partner_staff_id: partnerStaffId || null,
    })
    .select('*, machines:machine_id(name)')
    .single()

  if (error) throw error
  return data
}

export async function getTodaySessions(employeeId) {
  const today = todayEAT()

  let query = supabase
    .from('sessions')
    .select('*, machines:machine_id(name, image_url), profiles:employee_id(full_name), partner_staff:partner_staff_id(full_name)')
    .eq('date', today)
    .order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getSessionsByDate(date) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, machines:machine_id(name), profiles:employee_id(full_name), partner_staff:partner_staff_id(full_name)')
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateSessionCount(id, sessionCount) {
  const { error } = await supabase
    .from('sessions')
    .update({ session_count: sessionCount })
    .eq('id', id)

  if (error) throw error
}

export async function deleteSession(id) {
  const { data, error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw error
  // RLS blocks deletes silently (0 rows, no error) — e.g. an employee
  // deleting a session from a previous day.
  if (!data?.length) {
    throw new Error('You can only remove sessions you logged today. Ask an admin to fix older ones.')
  }
}

export async function getMachineRevenue({ startDate, endDate } = {}) {
  const data = await fetchAll(() => {
    let query = supabase
      .from('sessions')
      .select('machine_id, session_count, total_amount, machines:machine_id(name)', { count: 'exact' })
      .order('id')

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    return query
  })

  const map = {}
  for (const s of data) {
    const id = s.machine_id
    if (!map[id]) {
      map[id] = { name: s.machines?.name || 'Unknown', sessions: 0, revenue: 0 }
    }
    map[id].sessions += s.session_count
    map[id].revenue += Number(s.total_amount)
  }

  return Object.values(map).sort((a, b) => b.revenue - a.revenue)
}

export async function getTodayTotals() {
  const today = todayEAT()

  const { data, error } = await supabase
    .from('sessions')
    .select('session_count, total_amount')
    .eq('date', today)

  if (error) throw error

  return data.reduce(
    (acc, s) => ({
      sessions: acc.sessions + s.session_count,
      revenue: acc.revenue + Number(s.total_amount),
    }),
    { sessions: 0, revenue: 0 }
  )
}
