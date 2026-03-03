-- Add evolution score column to patient_timeline
ALTER TABLE public.patient_timeline 
ADD COLUMN evolution_score integer DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.patient_timeline.evolution_score IS 'AI-generated evolution score 1-10 (1=worsened significantly, 5=stable, 10=greatly improved)';
