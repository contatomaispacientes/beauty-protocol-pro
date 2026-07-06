import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, brand } = await req.json();
    if (!productName) {
      return new Response(JSON.stringify({ error: "productName obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ image_url: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = `${productName}${brand ? " " + brand : ""} cosmético produto foto oficial embalagem`;

    const r = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 5, sources: ["images"] }),
    });

    if (!r.ok) {
      console.error("Firecrawl error", r.status, await r.text());
      return new Response(JSON.stringify({ image_url: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    // Firecrawl v2 image search returns data.images[] or data.data.images[]
    const images =
      data?.data?.images ||
      data?.images ||
      [];
    const first = images.find((im: any) => im?.imageUrl || im?.url) || null;
    const image_url = first?.imageUrl || first?.url || null;

    return new Response(JSON.stringify({ image_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-product-image", e);
    return new Response(JSON.stringify({ image_url: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
