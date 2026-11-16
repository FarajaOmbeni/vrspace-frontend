import { supabase } from '@/lib/supabase'

export async function getDailySales(date) {
  const { data, error } = await supabase
    .from('daily_sales')
    .select('*')
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updatePartnerRevenue(date, partnerRevenue, loggedBy, notes) {
  // First ensure daily_sales row exists by calling compute function
  const { error: rpcError } = await supabase.rpc('compute_daily_sales', { p_date: date })
  if (rpcError) throw rpcError

  const existing = await getDailySales(date)

  const changes = {
    partner_reported_revenue: partnerRevenue,
    logged_by: loggedBy,
    notes: notes || null,
  }

  // A new partner figure means a new discrepancy: any earlier resolution no
  // longer applies, so it needs reviewing again.
  const previous = existing?.partner_reported_revenue
  const figureChanged = previous == null || Number(previous) !== Number(partnerRevenue)
  if (existing?.discrepancy_resolved && figureChanged) {
    Object.assign(changes, {
      discrepancy_resolved: false,
      resolved_at: null,
      resolved_by: null,
      resolved_with: null,
    })
  }

  const { data, error } = await supabase
    .from('daily_sales')
    .update(changes)
    .eq('date', date)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listDailySales({ startDate, endDate } = {}) {
  let query = supabase
    .from('daily_sales')
    .select('*, profiles:logged_by(full_name)')
    .order('date', { ascending: false })

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

export async function getDiscrepancies({ startDate, endDate, showResolved = false } = {}) {
  let query = supabase
    .from('daily_sales')
    .select('*, profiles:logged_by(full_name), resolver:resolved_by(full_name)')
    .order('date', { ascending: false })

  query = query.not('discrepancy', 'is', null).neq('discrepancy', 0)

  if (!showResolved) {
    query = query.eq('discrepancy_resolved', false)
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

/**
 * Days with sessions but no partner figure yet. Counts from the first day the
 * partner ever reported (when reconciliation started), so older days from
 * before then aren't flagged.
 */
export async function getMissingPartnerReports() {
  const { data: first, error: firstError } = await supabase
    .from('daily_sales')
    .select('date')
    .not('partner_reported_revenue', 'is', null)
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (firstError) throw firstError
  if (!first) return [] // partner has never reported: nothing to chase yet

  const { data, error } = await supabase
    .from('daily_sales')
    .select('date')
    .gte('date', first.date)
    .is('partner_reported_revenue', null)
    .gt('total_revenue', 0)
    .order('date', { ascending: false })

  if (error) throw error
  return data.map((r) => r.date)
}

export async function resolveDiscrepancy(id, { resolvedBy, resolvedWith, notes }) {
  const { data, error } = await supabase
    .from('daily_sales')
    .update({
      discrepancy_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
      resolved_with: resolvedWith,
      notes: notes || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
