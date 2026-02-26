
-- Platform branding settings (single row)
CREATE TABLE public.platform_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'DermAI',
  logo_url text,
  primary_color text NOT NULL DEFAULT '#8B5CF6',
  secondary_color text NOT NULL DEFAULT '#F3E8FF',
  accent_color text NOT NULL DEFAULT '#D946EF',
  font_heading text NOT NULL DEFAULT 'Playfair Display',
  font_body text NOT NULL DEFAULT 'Inter',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read branding" ON public.platform_branding FOR SELECT USING (true);
CREATE POLICY "Super admins can manage branding" ON public.platform_branding FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default row
INSERT INTO public.platform_branding (site_name) VALUES ('DermAI');

-- Site pages CMS
CREATE TABLE public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_description text,
  html_content text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pages" ON public.site_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Super admins can manage all pages" ON public.site_pages FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default pages
INSERT INTO public.site_pages (slug, title, meta_description, html_content) VALUES
('home', 'Home', 'Plataforma inteligente de cuidados com a pele', '<section class="hero"><h1>DermAI</h1><p>Sua plataforma inteligente de cuidados com a pele</p></section>'),
('about', 'Sobre', 'Conheça a DermAI', '<section><h1>Sobre a DermAI</h1><p>Plataforma de análise dermatológica com inteligência artificial.</p></section>'),
('pricing', 'Preços', 'Planos e preços DermAI', '<section><h1>Planos</h1><p>Escolha o plano ideal para sua clínica.</p></section>'),
('contact', 'Contato', 'Entre em contato conosco', '<section><h1>Contato</h1><p>Fale conosco pelo email contato@dermai.com.br</p></section>');

-- Trigger for updated_at
CREATE TRIGGER update_platform_branding_updated_at BEFORE UPDATE ON public.platform_branding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_pages_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
