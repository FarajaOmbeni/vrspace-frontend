-- TikTok videos table for homepage embed rotation
create table if not exists tiktok_videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  created_at timestamptz default now()
);

-- Allow public read access (anon key)
alter table tiktok_videos enable row level security;

create policy "Allow public read access on tiktok_videos"
  on tiktok_videos for select
  using (true);
