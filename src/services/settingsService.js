import { supabase } from '@/lib/supabase'

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error) throw error
  return data.value
}

export async function updateSetting(key, value) {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  return data.value
}

export async function getShopLocation() {
  return getSetting('shop_location')
}

export async function updateShopLocation(location) {
  return updateSetting('shop_location', location)
}
