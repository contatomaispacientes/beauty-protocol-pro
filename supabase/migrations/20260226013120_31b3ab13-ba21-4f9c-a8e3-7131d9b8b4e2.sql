
-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  professional_name TEXT,
  specialty TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view own appointments
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid());

-- Patients can create own appointments
CREATE POLICY "Patients can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Patients can update own appointments
CREATE POLICY "Patients can update own appointments"
  ON public.appointments FOR UPDATE
  USING (patient_id = auth.uid());

-- Patients can delete own appointments
CREATE POLICY "Patients can delete own appointments"
  ON public.appointments FOR DELETE
  USING (patient_id = auth.uid());

-- Admins can manage appointments for their tenant
CREATE POLICY "Admins can manage tenant appointments"
  ON public.appointments FOR ALL
  USING (tenant_id IN (SELECT tenants.id FROM tenants WHERE tenants.owner_id = auth.uid()));

-- Super admins can manage all
CREATE POLICY "Super admins manage all appointments"
  ON public.appointments FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
