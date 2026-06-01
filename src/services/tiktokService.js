import { supabase } from '@/lib/supabase'

export async function listTiktokVideos() {
  const { data, error } = await supabase
    .from('tiktok_videos')
    .select('url')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((row) => row.url)
}
