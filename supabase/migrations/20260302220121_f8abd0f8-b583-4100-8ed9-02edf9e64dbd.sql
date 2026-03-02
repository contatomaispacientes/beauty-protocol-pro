-- Create storage bucket for patient photos
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-photos', 'patient-photos', false);

-- Storage policies for patient photos
CREATE POLICY "Patients can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients can view own photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view tenant patient photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-photos' AND
  EXISTS (
    SELECT 1 FROM public.tenant_patients tp
    JOIN public.tenants t ON t.id = tp.tenant_id
    WHERE t.owner_id = auth.uid()
    AND tp.patient_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Super admins can manage all photos"
ON storage.objects FOR ALL
USING (bucket_id = 'patient-photos' AND public.has_role(auth.uid(), 'super_admin'));

-- Patient timeline entries table
CREATE TABLE public.patient_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  entry_type TEXT NOT NULL DEFAULT 'photo', -- photo, note, analysis
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  condition_tag TEXT, -- melasma, rosacea, acne, volume_loss, etc.
  ai_observations TEXT,
  created_by UUID NOT NULL, -- who created: patient or doctor
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_timeline ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own entries
CREATE POLICY "Patients can view own timeline"
ON public.patient_timeline FOR SELECT
USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert own entries"
ON public.patient_timeline FOR INSERT
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own entries"
ON public.patient_timeline FOR UPDATE
USING (patient_id = auth.uid());

CREATE POLICY "Patients can delete own entries"
ON public.patient_timeline FOR DELETE
USING (patient_id = auth.uid());

-- Admins can manage entries for their tenant patients
CREATE POLICY "Admins can manage tenant patient timeline"
ON public.patient_timeline FOR ALL
USING (
  tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

-- Super admins full access
CREATE POLICY "Super admins manage all timeline"
ON public.patient_timeline FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Trigger for updated_at
CREATE TRIGGER update_patient_timeline_updated_at
BEFORE UPDATE ON public.patient_timeline
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();