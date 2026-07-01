
-- ===== user_products =====
CREATE TABLE public.user_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  key_ingredients TEXT,
  moment TEXT NOT NULL DEFAULT 'both' CHECK (moment IN ('am','pm','both')),
  notes TEXT,
  image_url TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_products TO authenticated;
GRANT ALL ON public.user_products TO service_role;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own products" ON public.user_products FOR ALL TO authenticated
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE INDEX idx_user_products_patient ON public.user_products(patient_id);
CREATE TRIGGER trg_user_products_updated BEFORE UPDATE ON public.user_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== skincare_routines =====
CREATE TABLE public.skincare_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Minha rotina',
  active_weekdays INT[] NOT NULL DEFAULT ARRAY[0,1,2,3,4,5,6],
  created_by_ai BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skincare_routines TO authenticated;
GRANT ALL ON public.skincare_routines TO service_role;
ALTER TABLE public.skincare_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own routine" ON public.skincare_routines FOR ALL TO authenticated
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE TRIGGER trg_skincare_routines_updated BEFORE UPDATE ON public.skincare_routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== skincare_routine_steps =====
CREATE TABLE public.skincare_routine_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.skincare_routines(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moment TEXT NOT NULL CHECK (moment IN ('am','pm')),
  order_index INT NOT NULL DEFAULT 0,
  product_id UUID REFERENCES public.user_products(id) ON DELETE SET NULL,
  custom_label TEXT,
  suggested_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skincare_routine_steps TO authenticated;
GRANT ALL ON public.skincare_routine_steps TO service_role;
ALTER TABLE public.skincare_routine_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own steps" ON public.skincare_routine_steps FOR ALL TO authenticated
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE INDEX idx_steps_routine ON public.skincare_routine_steps(routine_id);
CREATE TRIGGER trg_skincare_steps_updated BEFORE UPDATE ON public.skincare_routine_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== skincare_calendar_events =====
CREATE TABLE public.skincare_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  moment TEXT NOT NULL CHECK (moment IN ('am','pm')),
  step_id UUID REFERENCES public.skincare_routine_steps(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.user_products(id) ON DELETE SET NULL,
  custom_label TEXT,
  is_skipped BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skincare_calendar_events TO authenticated;
GRANT ALL ON public.skincare_calendar_events TO service_role;
ALTER TABLE public.skincare_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events" ON public.skincare_calendar_events FOR ALL TO authenticated
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE INDEX idx_events_patient_date ON public.skincare_calendar_events(patient_id, event_date);
CREATE TRIGGER trg_skincare_events_updated BEFORE UPDATE ON public.skincare_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
