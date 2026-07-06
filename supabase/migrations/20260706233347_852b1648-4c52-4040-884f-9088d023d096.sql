
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS questionnaire_completed boolean NOT NULL DEFAULT false;

-- Product search history
CREATE TABLE public.product_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  brand text,
  image_url text,
  analysis jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.product_search_history TO authenticated;
GRANT ALL ON public.product_search_history TO service_role;
ALTER TABLE public.product_search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history select" ON public.product_search_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own history insert" ON public.product_search_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own history delete" ON public.product_search_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_product_search_history_user_created ON public.product_search_history(user_id, created_at DESC);

-- Blog posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  author text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published or admin" ON public.blog_posts FOR SELECT
  USING (published OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin manage" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
