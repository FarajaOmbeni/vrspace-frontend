import { supabase } from '@/lib/supabase'

const PAGE = 50

/** Newest entries first. Pass `before` (an entry's id) to load the next page. */
export async function listAuditLog({ table, before } = {}) {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('id', { ascending: false })
    .limit(PAGE)

  if (table) query = query.eq('table_name', table)
  if (before) query = query.lt('id', before)

  const { data, error } = await query
  if (error) throw error
  return { entries: data, hasMore: data.length === PAGE }
}
