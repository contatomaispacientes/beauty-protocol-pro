
-- Table for ANVISA registered cosmetic products (public reference data)
CREATE TABLE public.anvisa_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT,
  company_name TEXT,
  product_name TEXT NOT NULL,
  process_number TEXT,
  product_type TEXT,
  product_category TEXT,
  finalization_date TIMESTAMP WITH TIME ZONE,
  registration_number TEXT,
  registration_expiry TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ATIVO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (reference data)
ALTER TABLE public.anvisa_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ANVISA products are publicly readable"
ON public.anvisa_products
FOR SELECT
USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage ANVISA products"
ON public.anvisa_products
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes for search performance
CREATE INDEX idx_anvisa_product_name ON public.anvisa_products USING gin(to_tsvector('portuguese', product_name));
CREATE INDEX idx_anvisa_company ON public.anvisa_products USING gin(to_tsvector('portuguese', company_name));
CREATE INDEX idx_anvisa_status ON public.anvisa_products (status);
CREATE INDEX idx_anvisa_registration ON public.anvisa_products (registration_number);
