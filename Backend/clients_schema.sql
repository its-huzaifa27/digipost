-- 1. Create the bucket called 'uploads' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. DANGEROUSLY OPEN PERMISSIONS FOR 'uploads' BUCKET
-- Allow ANYONE (auth or anon) to INSERT files
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'uploads' );

-- Allow ANYONE to SELECT (view) files
CREATE POLICY "Public View"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'uploads' );

-- Allow ANYONE to UPDATE files
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'uploads' );

-- Allow ANYONE to DELETE files
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'uploads' );
