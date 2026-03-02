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
    const { productName } = await req.json();
    if (!productName || typeof productName !== "string") {
      return new Response(JSON.stringify({ error: "productName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um especialista em cosmética e dermatologia. O usuário vai fornecer o nome de um produto cosmético. Você deve retornar uma análise detalhada usando a ferramenta fornecida. Seja preciso e baseado em informações reais do produto. Se não conhecer o produto exato, informe que não foi possível identificar o produto e sugira verificar o nome. Responda SEMPRE em português brasileiro.`;

    const userPrompt = `Analise o produto cosmético: "${productName}". Forneça os ingredientes principais, suas funções, e as informações de segurança.`;

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
              name: "product_analysis",
              description: "Retorna a análise completa de um produto cosmético.",
              parameters: {
                type: "object",
                properties: {
                  product_name: { type: "string", description: "Nome completo do produto identificado" },
                  brand: { type: "string", description: "Marca do produto" },
                  product_not_found: { type: "boolean", description: "True se o produto não foi identificado com precisão" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome do ingrediente ativo" },
                        purpose: { type: "string", description: "Função/objetivo do ingrediente" },
                        suitability: { type: "string", description: "Para quais tipos de pele é indicado" },
                      },
                      required: ["name", "purpose", "suitability"],
                      additionalProperties: false,
                    },
                  },
                  safety: {
                    type: "object",
                    properties: {
                      safe_for_pregnant: { type: "string", enum: ["Sim", "Não", "Consultar médico"], description: "Indicado para gestantes" },
                      contains_parabens: { type: "string", enum: ["Sim", "Não", "Não informado"], description: "Contém parabenos" },
                      suitable_for_atopic_dermatitis: { type: "string", enum: ["Sim", "Não", "Consultar médico"], description: "Adequado para dermatite atópica" },
                      suitable_for_sensitive_skin: { type: "string", enum: ["Sim", "Não", "Consultar médico"], description: "Adequado para peles irritativas/sensíveis" },
                      suitable_for_children: { type: "string", enum: ["Sim", "Não", "Consultar médico"], description: "Adequado para uso infantil" },
                    },
                    required: ["safe_for_pregnant", "contains_parabens", "suitable_for_atopic_dermatitis", "suitable_for_sensitive_skin", "suitable_for_children"],
                    additionalProperties: false,
                  },
                  verdict: { type: "string", description: "Veredicto geral sobre o produto, qualidade e recomendações" },
                },
                required: ["product_name", "brand", "product_not_found", "ingredients", "safety", "verdict"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "product_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao analisar produto." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível analisar o produto." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
