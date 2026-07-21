import { supabase } from "@/integrations/supabase/client";

export interface CatalogInput {
  name: string;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
}

export const normalizedProductKey = (name: string, brand?: string | null) =>
  `${(brand || "").trim().toLowerCase()}|${name.trim().toLowerCase()}`;

export async function getOrCreateProductId(p: CatalogInput): Promise<string | null> {
  if (!p.name?.trim()) return null;
  const key = normalizedProductKey(p.name, p.brand);
  if (!key || key === "|") return null;
  const { data, error } = await supabase
    .from("products")
    .upsert(
      {
        normalized_key: key,
        name: p.name.trim(),
        brand: p.brand?.trim() || null,
        category: p.category || null,
        image_url: p.image_url || null,
      },
      { onConflict: "normalized_key" },
    )
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}
