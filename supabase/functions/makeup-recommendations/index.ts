import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { season, skinTone, skinSubtone, priceRange, concerns, observations } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um especialista em colorimetria pessoal e maquiagem. Forneça recomendações de produtos REAIS disponíveis no mercado brasileiro (nacionais e importados, incluindo K-Beauty/coreanos). Use nomes de produtos e tons reais. Considere as preocupações e observações pessoais da usuária ao recomendar. Responda em português brasileiro. Ao recomendar, inclua no campo "scientific_note" uma breve nota com embasamento científico (1-2 referências reais sobre colorimetria ou dermocosmética). Formato: Autor(es), "Título", Revista/Editora, Ano.`;

    let userPrompt = `A usuária tem estação de colorimetria "${season || "Outono"}", tom de pele "${skinTone || "médio"}" e subtom "${skinSubtone || "quente"}".`;
    if (priceRange) userPrompt += ` Faixa de preço preferida: ${priceRange}.`;
    if (concerns?.length) userPrompt += ` Preocupações com a pele: ${concerns.join(", ")}.`;
    if (observations) userPrompt += ` Observações pessoais: ${observations}`;
    userPrompt += ` Recomende produtos de maquiagem reais com nomes, marcas e tons específicos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "makeup_recommendations",
              description: "Retorna recomendações de maquiagem com produtos reais.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", description: "Categoria: Base, Corretivo, Blush, Batom, Sombra, Contorno, Iluminador, Primer" },
                        products: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              brand: { type: "string" },
                              product_name: { type: "string" },
                              shade: { type: "string", description: "Tom/cor específico" },
                              origin: { type: "string", enum: ["Nacional", "Importado", "K-Beauty"] },
                              price_range: { type: "string", enum: ["$", "$$", "$$$"] },
                            },
                            required: ["brand", "product_name", "shade", "origin", "price_range"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["category", "products"],
                      additionalProperties: false,
                    },
                  },
                  scientific_note: {
                    type: "string",
                    description: "Breve nota com embasamento científico e 1-2 referências reais sobre colorimetria ou dermocosmética."
                  },
                },
                required: ["recommendations", "scientific_note"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "makeup_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao buscar recomendações." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Sem recomendações." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("makeup-recommendations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
