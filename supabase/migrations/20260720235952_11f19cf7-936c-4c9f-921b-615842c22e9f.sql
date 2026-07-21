
REVOKE EXECUTE ON FUNCTION public.refresh_product_rating() FROM PUBLIC, authenticated, anon;

DROP POLICY IF EXISTS "Authenticated can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated can update product metadata" ON public.products;

CREATE POLICY "Authenticated can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (char_length(name) > 0 AND char_length(normalized_key) > 0);

CREATE POLICY "Authenticated can update product metadata"
  ON public.products FOR UPDATE
  TO authenticated
  USING (char_length(normalized_key) > 0)
  WITH CHECK (char_length(name) > 0 AND char_length(normalized_key) > 0);
