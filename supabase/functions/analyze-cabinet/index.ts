import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const [{ data: products }, { data: profile }] = await Promise.all([
      supa.from("user_products").select("id,name,brand,category,key_ingredients,moment").eq("patient_id", user.id).eq("is_archived", false),
      supa.from("profiles").select("questionnaire_answers").eq("user_id", user.id).maybeSingle(),
    ]);

    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ error: "Adicione produtos ao armário primeiro." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `Você é uma dermatologista consultora. Analise o armário de produtos do usuário e retorne insights práticos usando a ferramenta.

Identifique:
- Produtos REDUNDANTES (dois ou mais com mesma função — ex: 2 hidratantes)
- Se a rotina está COMPLETA (deve ter no mínimo: limpeza, hidratação, proteção solar)
- Compatibilidade GERAL com o perfil do usuário
- SUGESTÕES de ajuste

Sempre em português brasileiro.`;

    const userContent = `PRODUTOS DO USUÁRIO:\n${JSON.stringify(products, null, 2)}\n\nPERFIL:\n${JSON.stringify(profile?.questionnaire_answers || {}, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
        tools: [{
          type: "function",
          function: {
            name: "cabinet_analysis",
            parameters: {
              type: "object",
              properties: {
                routine_completeness: {
                  type: "object",
                  properties: {
                    is_complete: { type: "boolean" },
                    missing_steps: { type: "array", items: { type: "string" } },
                    summary: { type: "string" },
                  },
                  required: ["is_complete", "missing_steps", "summary"],
                  additionalProperties: false,
                },
                redundancies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      function: { type: "string" },
                      product_ids: { type: "array", items: { type: "string" } },
                      recommendation: { type: "string" },
                    },
                    required: ["function", "product_ids", "recommendation"],
                    additionalProperties: false,
                  },
                },
                compatibility_summary: { type: "string" },
                suggestions: { type: "array", items: { type: "string" } },
              },
              required: ["routine_completeness", "redundancies", "compatibility_summary", "suggestions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "cabinet_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error(await response.text());
      return new Response(JSON.stringify({ error: "Erro na análise." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await response.json();
    const analysis = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
    return new Response(JSON.stringify(analysis), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-cabinet", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
