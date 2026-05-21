import { supabase } from '@/lib/supabase'

export async function listPartnerStaff({ activeOnly = false } = {}) {
  let query = supabase
    .from('partner_staff')
    .select('*')
    .order('full_name', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPartnerStaff(id) {
  const { data, error } = await supabase
    .from('partner_staff')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPartnerStaff({ fullName }) {
  const { data, error } = await supabase
    .from('partner_staff')
    .insert({ full_name: fullName })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePartnerStaff(id, updates) {
  const { data, error } = await supabase
    .from('partner_staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function togglePartnerStaffActive(id, isActive) {
  return updatePartnerStaff(id, { is_active: isActive })
}

export async function getPartnerStaffReport({ startDate, endDate }) {
  const { data, error } = await supabase
    .from('sessions')
    .select('partner_staff_id, session_count, total_amount, partner_staff:partner_staff_id(full_name)')
    .not('partner_staff_id', 'is', null)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw error

  // Aggregate by partner staff
  const map = {}
  for (const row of data) {
    const id = row.partner_staff_id
    if (!map[id]) {
      map[id] = {
        id,
        full_name: row.partner_staff?.full_name || 'Unknown',
        total_clients: 0,
        total_sessions: 0,
        total_revenue: 0,
      }
    }
    map[id].total_clients++
    map[id].total_sessions += row.session_count
    map[id].total_revenue += Number(row.total_amount)
  }

  return Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue)
}
