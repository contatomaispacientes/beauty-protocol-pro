CREATE OR REPLACE FUNCTION public.is_patient_linked_to_tenant(_tenant_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_patients tp
    WHERE tp.tenant_id = _tenant_id
      AND tp.patient_id = _user_id
  );
$$;

DROP POLICY IF EXISTS "Patients can view their linked tenants" ON public.tenants;

CREATE POLICY "Patients can view their linked tenants"
ON public.tenants
FOR SELECT
TO authenticated
USING (public.is_patient_linked_to_tenant(id, auth.uid()));