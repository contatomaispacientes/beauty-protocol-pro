-- Make patient-photos bucket public so images can be viewed
UPDATE storage.buckets SET public = true WHERE id = 'patient-photos';

-- Ensure SELECT policy exists for public access
CREATE POLICY "Patient photos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'patient-photos');
