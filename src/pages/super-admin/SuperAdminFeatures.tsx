import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALL_FEATURES = [
  { key: "questionnaire", label: "Questionário de Pele" },
  { key: "routine", label: "Rotina Personalizada" },
  { key: "colorimetry", label: "Colorimetria" },
  { key: "products", label: "Análise de Produtos" },
  { key: "chat", label: "Chat Luz" },
  { key: "appointments", label: "Agendamentos" },
];

interface Tenant { id: string; name: string; }
interface FeatureState { [tenantId: string]: { [featureKey: string]: boolean } }

const SuperAdminFeatures = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [features, setFeatures] = useState<FeatureState>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const [tRes, fRes] = await Promise.all([
        supabase.from("tenants").select("id, name"),
        supabase.from("tenant_features").select("*"),
      ]);
      const ts = (tRes.data || []) as Tenant[];
      setTenants(ts);

      const state: FeatureState = {};
      ts.forEach((t) => {
        state[t.id] = {};
        ALL_FEATURES.forEach((f) => { state[t.id][f.key] = true; }); // default on
      });
      (fRes.data || []).forEach((f: any) => {
        if (state[f.tenant_id]) state[f.tenant_id][f.feature_key] = f.enabled;
      });
      setFeatures(state);
      setLoading(false);
    };
    load();
  }, []);

  const toggleFeature = async (tenantId: string, featureKey: string, enabled: boolean) => {
    setFeatures((prev) => ({ ...prev, [tenantId]: { ...prev[tenantId], [featureKey]: enabled } }));
    const { error } = await supabase.from("tenant_features").upsert(
      { tenant_id: tenantId, feature_key: featureKey, enabled },
      { onConflict: "tenant_id,feature_key" }
    );
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      setFeatures((prev) => ({ ...prev, [tenantId]: { ...prev[tenantId], [featureKey]: !enabled } }));
    }
  };

  if (loading) return (
    <SuperAdminLayout title="Funcionalidades por Tenant">
      <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout title="Funcionalidades por Tenant">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Feature Toggles</h2>
          <p className="text-muted-foreground text-sm">Ative ou desative funcionalidades para cada clínica/tenant.</p>
        </div>

        {tenants.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum tenant cadastrado ainda.</CardContent></Card>
        ) : tenants.map((t) => (
          <Card key={t.id}>
            <CardHeader><CardTitle className="font-serif">{t.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ALL_FEATURES.map((f) => (
                  <div key={f.key} className="flex items-center justify-between">
                    <span className="text-sm">{f.label}</span>
                    <Switch
                      checked={features[t.id]?.[f.key] ?? true}
                      onCheckedChange={(v) => toggleFeature(t.id, f.key, v)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminFeatures;
