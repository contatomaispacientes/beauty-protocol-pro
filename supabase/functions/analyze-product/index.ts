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
    const { productName, productImage } = await req.json();
    if (!productName && !productImage) {
      return new Response(JSON.stringify({ error: "productName ou productImage é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Load user profile / questionnaire for personalized compatibility
    let userProfile: any = null;
    try {
      const auth = req.headers.get("Authorization");
      if (auth) {
        const supa = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: auth } } },
        );
        const { data: { user } } = await supa.auth.getUser();
        if (user) {
          const { data } = await supa
            .from("profiles")
            .select("questionnaire_answers")
            .eq("user_id", user.id)
            .maybeSingle();
          userProfile = data?.questionnaire_answers || null;
        }
      }
    } catch (_) { /* profile is optional */ }

    const profileBlock = userProfile
      ? `\n\nPERFIL DO USUÁRIO (do questionário):\n${JSON.stringify(userProfile, null, 2)}\n\nAvalie compatibilidade com base neste perfil.`
      : "\n\nNenhum perfil disponível — marque compatibility_with_user como 'Não avaliado'.";

    const systemPrompt = `Você é um especialista em cosmética e dermatologia. Analise o produto cosmético fornecido (por nome e/ou imagem) usando a ferramenta.

REGRAS IMPORTANTES:
- Para gestantes: DECIDA com base nos ingredientes conhecidos. Retorne "Sim" se todos os ingredientes forem seguros para gestantes, ou "Não" se houver algum ingrediente contraindicado (retinóides, ácido salicílico >2%, hidroquinona, etc). Não use "Consultar médico".
- Para outros campos de segurança, use as opções permitidas do enum.
- Se receber uma imagem, identifique o produto pelo rótulo, marca e embalagem.
- Compatibility: avalie se o produto combina com o perfil do usuário (tipo de pele, preocupações, alergias, gestação, etc).
- Responda SEMPRE em português brasileiro.${profileBlock}`;

    const userContent: any[] = [];
    if (productName) {
      userContent.push({ type: "text", text: `Analise o produto: "${productName}".` });
    }
    if (productImage) {
      userContent.push({
        type: "text",
        text: productName ? "Imagem em anexo para referência." : "Identifique o produto na imagem e analise.",
      });
      userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${productImage}` } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "product_analysis",
            description: "Análise completa de produto cosmético.",
            parameters: {
              type: "object",
              properties: {
                product_name: { type: "string" },
                brand: { type: "string" },
                product_not_found: { type: "boolean" },
                category: { type: "string", description: "Ex: cleanser, moisturizer, sunscreen, serum, treatment" },
                ingredients: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      purpose: { type: "string" },
                      suitability: { type: "string" },
                    },
                    required: ["name", "purpose", "suitability"],
                    additionalProperties: false,
                  },
                },
                safety: {
                  type: "object",
                  properties: {
                    safe_for_pregnant: { type: "string", enum: ["Sim", "Não"], description: "Decida com base nos ingredientes" },
                    contains_parabens: { type: "string", enum: ["Sim", "Não", "Não informado"] },
                    suitable_for_atopic_dermatitis: { type: "string", enum: ["Sim", "Não", "Consultar médico"] },
                    suitable_for_sensitive_skin: { type: "string", enum: ["Sim", "Não", "Consultar médico"] },
                    suitable_for_children: { type: "string", enum: ["Sim", "Não", "Consultar médico"] },
                  },
                  required: ["safe_for_pregnant", "contains_parabens", "suitable_for_atopic_dermatitis", "suitable_for_sensitive_skin", "suitable_for_children"],
                  additionalProperties: false,
                },
                compatibility_with_user: {
                  type: "object",
                  properties: {
                    level: { type: "string", enum: ["Compatível", "Parcialmente compatível", "Não recomendado", "Não avaliado"] },
                    reason: { type: "string", description: "Justificativa curta (1-2 frases) baseada no perfil" },
                  },
                  required: ["level", "reason"],
                  additionalProperties: false,
                },
                verdict: { type: "string" },
              },
              required: ["product_name", "brand", "product_not_found", "category", "ingredients", "safety", "compatibility_with_user", "verdict"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "product_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({ error: "Erro ao analisar produto." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível analisar o produto." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
