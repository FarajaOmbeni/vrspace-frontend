import { supabase } from '@/lib/supabase'

export async function listMachines({ activeOnly = false } = {}) {
  let query = supabase
    .from('machines')
    .select('*')
    .order('created_at', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMachine(id) {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Pass a client-generated `id` to make retries safe: saving the same id twice
 * updates the machine instead of failing or creating a duplicate.
 */
export async function createMachine({ id, name, price_per_session, image_url }) {
  const row = {
    name,
    price_per_session: price_per_session || 500,
    image_url: image_url || null,
  }
  const query = id
    ? supabase.from('machines').upsert({ id, ...row })
    : supabase.from('machines').insert(row)

  const { data, error } = await query
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMachine(id, updates) {
  const { data, error } = await supabase
    .from('machines')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleMachineActive(id, isActive) {
  return updateMachine(id, { is_active: isActive })
}

export async function deleteMachine(id) {
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadMachineImage(file, machineId) {
  const ext = file.name.split('.').pop()
  const path = `${machineId}.${ext}`

  const { error } = await supabase.storage
    .from('machine-images')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('machine-images')
    .getPublicUrl(path)

  return data.publicUrl
}
