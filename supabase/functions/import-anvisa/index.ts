import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  try {
    const cleaned = dateStr.replace(' 00:00:00', '');
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return null;
  } catch {
    return null;
  }
}

function parseCsvLine(line: string): string[] {
  return line.split(';').map(f => f.trim());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const csvContent = body.csv as string;

    if (!csvContent) {
      return new Response(JSON.stringify({ error: 'No CSV content provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const lines = csvContent.split('\n').filter(l => l.trim());
    // Skip header
    const dataLines = lines.slice(1);

    let inserted = 0;
    let errors = 0;
    const BATCH_SIZE = 500;

    for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
      const batch = dataLines.slice(i, i + BATCH_SIZE);
      const rows = batch.map(line => {
        const fields = parseCsvLine(line);
        return {
          cnpj: fields[0] || null,
          company_name: fields[1] || null,
          product_name: fields[2] || 'Sem nome',
          process_number: fields[3] || null,
          product_type: fields[4] || null,
          product_category: fields[5] || null,
          finalization_date: parseDate(fields[6]),
          registration_number: fields[7] || null,
          registration_expiry: parseDate(fields[8]),
          status: fields[9] || 'ATIVO',
        };
      }).filter(r => r.product_name && r.product_name !== 'Sem nome');

      const { error } = await supabase.from('anvisa_products').insert(rows);
      if (error) {
        console.error(`Batch error at ${i}:`, error.message);
        errors += batch.length;
      } else {
        inserted += rows.length;
      }
    }

    return new Response(JSON.stringify({ success: true, inserted, errors, total: dataLines.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
