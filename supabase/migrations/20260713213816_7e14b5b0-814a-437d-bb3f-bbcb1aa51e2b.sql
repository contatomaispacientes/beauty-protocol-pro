
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_patient_linked_to_tenant(uuid, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_patient_linked_to_tenant(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can view tenant patient photos" ON storage.objects;

CREATE POLICY "Admins can view tenant patient photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-photos'
  AND EXISTS (
    SELECT 1
    FROM public.tenants t
    JOIN public.tenant_patients tp ON tp.tenant_id = t.id
    WHERE t.owner_id = auth.uid()
      AND (tp.patient_id)::text = (storage.foldername(storage.objects.name))[1]
  )
);
