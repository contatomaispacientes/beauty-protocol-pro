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
    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um dermatologista especialista em análise de pele por imagem. O paciente enviou uma selfie. Analise a imagem e forneça uma avaliação detalhada usando a ferramenta fornecida.

IMPORTANTE:
- Seja preciso e profissional
- Identifique o tipo de pele, tom (escala Fitzpatrick), subtom (quente/frio/neutro)
- Liste condições visíveis (acne, manchas, rugas, poros, olheiras, desidratação, rosácea, etc.)
- Forneça recomendações personalizadas
- Avalie o nível de hidratação aparente
- SEMPRE inclua um score geral de saúde da pele de 0 a 100
- SEMPRE sugira produtos cosméticos reais (nome do produto + marca) para cada condição identificada, considerando produtos disponíveis no Brasil (nacionais e importados)
- Inclua de 3 a 6 produtos recomendados, com categoria de uso (limpeza, hidratação, tratamento, proteção solar, etc.)
- Responda SEMPRE em português brasileiro
- NUNCA faça diagnósticos definitivos — use termos como "aparente", "sugestivo de", "possível"
- Ao final do campo "summary", SEMPRE inclua uma breve seção "📚 Embasamento Científico" com 1-2 referências científicas reais e relevantes (artigos, guidelines dermatológicos ou livros reconhecidos). Formato: Autor(es), "Título", Revista/Editora, Ano.`;

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
          {
            role: "user",
            content: [
              { type: "text", text: "Analise esta selfie e forneça uma avaliação dermatológica completa da pele." },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "skin_analysis",
              description: "Retorna a análise dermatológica completa a partir de uma selfie.",
              parameters: {
                type: "object",
                properties: {
                  skin_type: { type: "string", description: "Tipo de pele: Oleosa, Seca, Mista, Normal ou Sensível" },
                  tone: { type: "string", description: "Tom de pele na escala Fitzpatrick (I a VI)" },
                  subtone: { type: "string", description: "Subtom: Quente, Frio ou Neutro" },
                  hydration_level: { type: "string", enum: ["Bem hidratada", "Levemente desidratada", "Desidratada", "Muito desidratada"], description: "Nível aparente de hidratação" },
                  health_score: { type: "number", description: "Score de saúde da pele de 0 a 100" },
                  conditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome da condição identificada" },
                        severity: { type: "string", enum: ["Leve", "Moderada", "Acentuada"], description: "Grau da condição" },
                        location: { type: "string", description: "Região do rosto afetada" },
                      },
                      required: ["name", "severity", "location"],
                      additionalProperties: false,
                    },
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", description: "Categoria: Limpeza, Hidratação, Proteção Solar, Tratamento, Hábitos" },
                        recommendation: { type: "string", description: "Recomendação específica" },
                        priority: { type: "string", enum: ["Alta", "Média", "Baixa"], description: "Prioridade" },
                      },
                      required: ["category", "recommendation", "priority"],
                      additionalProperties: false,
                    },
                  },
                  suggested_products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_name: { type: "string", description: "Nome completo do produto" },
                        brand: { type: "string", description: "Marca do produto" },
                        category: { type: "string", description: "Categoria: Limpeza, Hidratante, Sérum, Protetor Solar, Tratamento, Esfoliante, Tônico, Máscara" },
                        reason: { type: "string", description: "Por que este produto é indicado para esta pele" },
                        price_range: { type: "string", description: "Faixa de preço estimada em R$" },
                      },
                      required: ["product_name", "brand", "category", "reason", "price_range"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string", description: "Resumo geral da análise em 2-3 frases" },
                },
                required: ["skin_type", "tone", "subtone", "hydration_level", "health_score", "conditions", "recommendations", "suggested_products", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "skin_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao analisar imagem." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível analisar a imagem." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-skin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
