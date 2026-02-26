-- Create storage bucket for platform logos
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-assets', 'platform-assets', true);

-- Allow public read access
CREATE POLICY "Platform assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-assets');

-- Only super admins can upload
CREATE POLICY "Super admins can upload platform assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'platform-assets'
  AND has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admins can update
CREATE POLICY "Super admins can update platform assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'platform-assets'
  AND has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admins can delete
CREATE POLICY "Super admins can delete platform assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'platform-assets'
  AND has_role(auth.uid(), 'super_admin'::app_role)
);