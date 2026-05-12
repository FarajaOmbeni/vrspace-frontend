-- Add image_url column to machines
ALTER TABLE machines ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for machine images
INSERT INTO storage.buckets (id, name, public)
VALUES ('machine-images', 'machine-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read machine images
CREATE POLICY "Anyone can view machine images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'machine-images');

-- Allow admins to upload machine images
CREATE POLICY "Admins can upload machine images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'machine-images'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to update machine images
CREATE POLICY "Admins can update machine images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'machine-images'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to delete machine images
CREATE POLICY "Admins can delete machine images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'machine-images'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
