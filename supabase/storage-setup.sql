-- Create storage bucket for media (images, videos)
-- Run this in Supabase SQL Editor or set up via Dashboard

-- Note: Storage buckets are typically created via Supabase Dashboard
-- Navigate to Storage > Create a new bucket
-- Bucket name: media
-- Public bucket: true (for easier access)
-- File size limit: 5MB
-- Allowed MIME types: image/*, video/*

-- Storage policies (if creating via SQL)
-- You can also set these in the Dashboard under Storage > Policies

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view media
CREATE POLICY "Media is publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
