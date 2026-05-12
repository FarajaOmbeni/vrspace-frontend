import { supabase } from '@/lib/supabase'

export async function listEmployees() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getEmployee(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createEmployee({ email, password, full_name, role }) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-employee`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, password, full_name, role }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create employee')
  }

  return result
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleEmployeeActive(id, isActive) {
  return updateEmployee(id, { is_active: isActive })
}
