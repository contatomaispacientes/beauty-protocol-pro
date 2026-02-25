import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Código inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upperCode = code.trim().toUpperCase();

    // Find invite code
    const { data: invite, error: inviteError } = await supabase
      .from("tenant_invite_codes")
      .select("*")
      .eq("code", upperCode)
      .single();

    if (inviteError || !invite) {
      return new Response(JSON.stringify({ error: "Código não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Código expirado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max uses
    if (invite.uses >= invite.max_uses) {
      return new Response(JSON.stringify({ error: "Código já atingiu o limite de usos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from("tenant_patients")
      .select("id")
      .eq("tenant_id", invite.tenant_id)
      .eq("patient_id", user.id)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ error: "Você já está vinculado a esta clínica" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Link patient
    const { error: linkError } = await supabase
      .from("tenant_patients")
      .insert({ tenant_id: invite.tenant_id, patient_id: user.id, invite_code: upperCode });

    if (linkError) {
      return new Response(JSON.stringify({ error: "Erro ao vincular: " + linkError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment uses
    await supabase
      .from("tenant_invite_codes")
      .update({ uses: invite.uses + 1 })
      .eq("id", invite.id);

    // Get tenant name
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", invite.tenant_id)
      .single();

    return new Response(
      JSON.stringify({ success: true, clinic_name: tenant?.name || "Clínica" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
