import { supabase } from '@/lib/supabase'

export async function logSession({ employeeId, machineId, sessionCount, pricePerSession }) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      employee_id: employeeId,
      machine_id: machineId,
      session_count: sessionCount,
      price_per_session: pricePerSession,
    })
    .select('*, machines:machine_id(name)')
    .single()

  if (error) throw error
  return data
}

export async function getTodaySessions(employeeId) {
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('sessions')
    .select('*, machines:machine_id(name, image_url)')
    .eq('date', today)
    .order('created_at', { ascending: false })

  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getSessionsByDate(date) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, machines:machine_id(name), profiles:employee_id(full_name)')
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
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getTodayTotals() {
  const today = new Date().toISOString().split('T')[0]

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
