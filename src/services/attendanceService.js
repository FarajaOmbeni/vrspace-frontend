import { supabase } from '@/lib/supabase'

export async function getTodayRecord(employeeId) {
  const today = new Date().toISOString().split('T')[0]

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
  const today = new Date().toISOString().split('T')[0]

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

export async function clockOut(recordId) {
  const { data, error } = await supabase
    .from('attendance')
    .update({ clock_out: new Date().toISOString() })
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
    .select('*, profiles:employee_id(full_name)')
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
