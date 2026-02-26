
CREATE POLICY "Patients can view their linked tenants"
ON public.tenants
FOR SELECT
USING (
  id IN (
    SELECT tenant_id FROM public.tenant_patients WHERE patient_id = auth.uid()
  )
);
