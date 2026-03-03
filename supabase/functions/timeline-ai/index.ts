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
    const { imageDescription, conditionTag, previousNotes } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um assistente dermatológico de suporte. Analise a descrição da imagem/condição do paciente e forneça observações preliminares sobre possíveis alterações observadas.

Ao final da sua resposta, SEMPRE inclua uma seção curta chamada "📚 Embasamento Científico" com 1 a 2 referências científicas reais e relevantes (artigos, guidelines ou livros de dermatologia reconhecidos). Use o formato:
- Autor(es), "Título do artigo/livro", Revista/Editora, Ano.

IMPORTANTE: Sempre inclua um aviso de que isso NÃO substitui uma consulta médica. Responda em português brasileiro.`;

    const userPrompt = `Condição acompanhada: ${conditionTag || "não especificada"}.
Descrição da entrada atual: ${imageDescription || "Foto de acompanhamento sem descrição adicional"}.
${previousNotes ? `Observações anteriores: ${previousNotes}` : "Sem registros anteriores."}

Forneça observações preliminares sobre esta entrada de acompanhamento, incluindo ao final uma breve seção de embasamento científico com fontes reais.`;

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
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar observações." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ observations: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("timeline-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
