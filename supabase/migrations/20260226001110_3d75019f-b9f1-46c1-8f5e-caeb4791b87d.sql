DROP POLICY IF EXISTS "Admins linked can manage codes" ON public.tenant_invite_codes;

CREATE POLICY "Admins linked can manage codes"
ON public.tenant_invite_codes
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND tenant_id IN (
    SELECT tp.tenant_id
    FROM public.tenant_patients tp
    WHERE tp.patient_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND tenant_id IN (
    SELECT tp.tenant_id
    FROM public.tenant_patients tp
    WHERE tp.patient_id = auth.uid()
  )
);