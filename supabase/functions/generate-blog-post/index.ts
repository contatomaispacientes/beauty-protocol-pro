import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic } = await req.json();
    if (!topic) return new Response(JSON.stringify({ error: "topic obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const systemPrompt = `Você é uma dermatologista redatora do blog "Dicas Luz Skin". Escreva artigos científicos, acessíveis, com base em evidências. Sempre em português brasileiro. Use markdown (##, listas, negrito). Inclua ao final uma seção "Referências" com 2-3 fontes acadêmicas ou institucionais reais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Escreva um artigo do blog sobre: "${topic}".` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "blog_post",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                slug: { type: "string", description: "kebab-case, sem acentos" },
                excerpt: { type: "string", description: "Resumo de 1-2 frases" },
                content: { type: "string", description: "Artigo completo em markdown (500-900 palavras) com seção Referências ao final" },
              },
              required: ["title", "slug", "excerpt", "content"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "blog_post" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Erro ao gerar." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await response.json();
    const post = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
    return new Response(JSON.stringify(post), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
