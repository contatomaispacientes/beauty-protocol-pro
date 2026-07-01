import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você identifica produtos de skincare pelo rótulo. Responda em português brasileiro. Nunca invente ingredientes — se não conseguir ler, deixe em branco.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identifique este produto de skincare pela foto do rótulo. Retorne nome, marca, categoria, ativos principais e sugestão de uso (AM/PM/ambos).",
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "product_identification",
              description: "Dados extraídos do rótulo do produto.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  brand: { type: "string" },
                  category: {
                    type: "string",
                    enum: [
                      "cleanser",
                      "toner",
                      "serum",
                      "moisturizer",
                      "sunscreen",
                      "treatment",
                      "exfoliant",
                      "mask",
                      "other",
                    ],
                  },
                  key_ingredients: { type: "string", description: "Ativos principais separados por vírgula" },
                  moment: { type: "string", enum: ["am", "pm", "both"] },
                  notes: { type: "string", description: "Observações relevantes (ex.: 'contém retinol - uso noturno')" },
                  not_identified: { type: "boolean" },
                },
                required: ["name", "category", "moment", "not_identified"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "product_identification" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      const status = response.status === 429 || response.status === 402 ? response.status : 500;
      const msg =
        response.status === 429
          ? "Muitas requisições. Tente novamente em instantes."
          : response.status === 402
          ? "Créditos de IA esgotados."
          : "Erro ao identificar produto.";
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível identificar." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
