import { supabase } from '@/lib/supabase'
import { dbToday } from '@/utils/date'

export async function getTodayRecord(employeeId) {
  const today = dbToday()

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function clockIn(employeeId) {
  const today = dbToday()

  const { data, error } = await supabase
    .from('attendance')
    .insert({
      employee_id: employeeId,
      date: today,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Shifts from before today that were never clocked out.
 * Pass employeeId to check one person; omit it to list everyone's (admin).
 */
export async function listMissedClockOuts(employeeId) {
  let query = supabase
    .from('attendance')
    .select('*, profiles:employee_id(full_name)')
    .is('clock_out', null)
    .lt('date', dbToday())
    .order('date', { ascending: false })

  if (employeeId) query = query.eq('employee_id', employeeId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function clockOut(recordId, clockOutTime = null) {
  const { data, error } = await supabase
    .from('attendance')
    .update({ clock_out: clockOutTime || new Date().toISOString() })
    .eq('id', recordId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listAttendance({ employeeId, startDate, endDate } = {}) {
  let query = supabase
    .from('attendance')
    .select('*, profiles:employee_id(full_name, email)')
    .order('date', { ascending: false })

  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getEmployeeHours({ employeeId, startDate, endDate } = {}) {
  let query = supabase
    .from('attendance')
    .select('*, profiles:employee_id(full_name, salary)')
    .not('clock_out', 'is', null)
    .order('date', { ascending: false })

  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}
