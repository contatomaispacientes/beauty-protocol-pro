
DO $$ BEGIN
  CREATE TYPE public.skin_mood AS ENUM ('good','neutral','bad');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.skin_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood public.skin_mood NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX skin_diary_entries_user_date_idx
  ON public.skin_diary_entries (user_id, entry_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skin_diary_entries TO authenticated;
GRANT ALL ON public.skin_diary_entries TO service_role;

ALTER TABLE public.skin_diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own diary" ON public.skin_diary_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own diary" ON public.skin_diary_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own diary" ON public.skin_diary_entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own diary" ON public.skin_diary_entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER skin_diary_entries_updated_at
  BEFORE UPDATE ON public.skin_diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
