-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read their own videos
CREATE POLICY "Users can read own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow project managers to read all project videos
CREATE POLICY "Project managers can read project videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos' 
  AND EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.user_id = auth.uid()
    AND pm.role IN ('project_manager', 'foreman', 'safety_manager')
    AND (storage.foldername(name))[2] = pm.project_id::text
  )
);
