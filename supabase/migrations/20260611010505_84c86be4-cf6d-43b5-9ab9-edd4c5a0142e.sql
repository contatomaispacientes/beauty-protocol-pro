
-- 1) Drop blanket public SELECT policy on patient-photos
DROP POLICY IF EXISTS "Patient photos are publicly accessible" ON storage.objects;

-- 2) Fix admin patient photo policy
DROP POLICY IF EXISTS "Admins can view tenant patient photos" ON storage.objects;
CREATE POLICY "Admins can view tenant patient photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-photos'
  AND EXISTS (
    SELECT 1
    FROM public.tenant_patients tp
    JOIN public.tenants t ON t.id = tp.tenant_id
    WHERE t.owner_id = auth.uid()
      AND (tp.patient_id)::text = (storage.foldername(name))[1]
  )
);

-- 3) Drop dangerous read-all invite codes policy
DROP POLICY IF EXISTS "Anyone authenticated can read valid codes" ON public.tenant_invite_codes;

-- 4) Drop privilege escalation policy
DROP POLICY IF EXISTS "Admins linked can manage codes" ON public.tenant_invite_codes;

-- 5) Lock down SECURITY DEFINER helpers from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_patient_linked_to_tenant(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_patient_linked_to_tenant(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_patient_linked_to_tenant(uuid, uuid) TO authenticated, service_role;
