import { supabase } from '@/lib/supabase'

export async function listTiktokVideos() {
  const { data, error } = await supabase
    .from('tiktok_videos')
    .select('url')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((row) => row.url)
}

export async function listTiktokVideosAdmin() {
  const { data, error } = await supabase
    .from('tiktok_videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addTiktokVideo(url) {
  const { data, error } = await supabase
    .from('tiktok_videos')
    .insert({ url })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTiktokVideo(id) {
  const { error } = await supabase
    .from('tiktok_videos')
    .delete()
    .eq('id', id)

  if (error) throw error
}
