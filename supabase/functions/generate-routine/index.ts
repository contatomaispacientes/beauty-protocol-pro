import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Product {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  key_ingredients?: string | null;
  moment?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, products, profileSummary } = await req.json() as {
      mode: "from_cabinet" | "generic";
      products?: Product[];
      profileSummary?: string;
    };
    if (mode !== "from_cabinet" && mode !== "generic") {
      return new Response(JSON.stringify({ error: "mode inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const productsList =
      mode === "from_cabinet" && products?.length
        ? products
            .map(
              (p, i) =>
                `${i + 1}. [${p.id}] ${p.name}${p.brand ? " — " + p.brand : ""} | categoria: ${p.category || "?"} | momento: ${p.moment || "both"} | ativos: ${p.key_ingredients || "n/d"}`,
            )
            .join("\n")
        : "(sem produtos)";

    const systemPrompt = `Você é uma dermatologista assistente. Monte uma rotina de skincare AM e PM segura, seguindo a ordem correta (limpeza → tônico → tratamentos → hidratante → protetor solar de manhã). Sempre inclua o disclaimer de que a rotina não substitui consulta médica. Responda em português brasileiro.`;

    const userPrompt =
      mode === "from_cabinet"
        ? `Monte uma rotina AM/PM usando SOMENTE estes produtos do armário do usuário (referencie pelo id). Se algum passo essencial faltar, adicione com product_id null e descreva no custom_label como sugestão.\n\nPerfil: ${profileSummary || "não informado"}\n\nProdutos:\n${productsList}`
        : `Monte uma rotina AM/PM genérica com passos ideais (limpeza, tônico opcional, sérum, hidratante, protetor solar de manhã; à noite: demaquilante/limpeza, tratamento, hidratante). Deixe product_id null em todos os passos — o usuário vinculará depois. Perfil: ${profileSummary || "não informado"}`;

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
              name: "routine_plan",
              description: "Rotina AM/PM sugerida.",
              parameters: {
                type: "object",
                properties: {
                  disclaimer: { type: "string" },
                  am_steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order_index: { type: "number" },
                        product_id: { type: "string", description: "id do produto do armário ou string vazia" },
                        custom_label: { type: "string" },
                        suggested_time: { type: "string", description: "HH:MM" },
                      },
                      required: ["order_index", "custom_label"],
                      additionalProperties: false,
                    },
                  },
                  pm_steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order_index: { type: "number" },
                        product_id: { type: "string" },
                        custom_label: { type: "string" },
                        suggested_time: { type: "string" },
                      },
                      required: ["order_index", "custom_label"],
                      additionalProperties: false,
                    },
                  },
                  notes: { type: "string" },
                },
                required: ["disclaimer", "am_steps", "pm_steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "routine_plan" } },
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
          : "Erro ao gerar rotina.";
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Falha ao gerar rotina." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-routine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
