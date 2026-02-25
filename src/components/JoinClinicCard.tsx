import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link2, Loader2, Building2, CheckCircle2 } from "lucide-react";

interface LinkedClinic {
  id: string;
  tenant_id: string;
  status: string;
  created_at: string;
  tenant_name?: string;
}

const JoinClinicCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedClinics, setLinkedClinics] = useState<LinkedClinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const fetchLinkedClinics = async () => {
    if (!user) return;
    setLoadingClinics(true);
    const { data } = await supabase
      .from("tenant_patients")
      .select("id, tenant_id, status, created_at")
      .eq("patient_id", user.id);

    if (data && data.length > 0) {
      const tenantIds = data.map((d) => d.tenant_id);
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id, name")
        .in("id", tenantIds);

      const mapped = data.map((d) => ({
        ...d,
        tenant_name: tenants?.find((t) => t.id === d.tenant_id)?.name || "Clínica",
      }));
      setLinkedClinics(mapped);
    } else {
      setLinkedClinics([]);
    }
    setLoadingClinics(false);
  };

  useEffect(() => {
    fetchLinkedClinics();
  }, [user]);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("join-clinic", {
      body: { code: code.trim() },
    });

    setLoading(false);

    if (error || data?.error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: data?.error || error?.message || "Erro ao vincular",
      });
    } else {
      toast({
        title: "Vinculado com sucesso! 🎉",
        description: `Você foi vinculado à ${data.clinic_name}.`,
      });
      setCode("");
      fetchLinkedClinics();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-serif">Vincular a uma Clínica</CardTitle>
          </div>
          <CardDescription>
            Insira o código de convite fornecido pelo seu médico ou clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono text-center uppercase"
              maxLength={10}
            />
            <Button onClick={handleJoin} disabled={loading || !code.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vincular"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingClinics ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : linkedClinics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-serif">Minhas Clínicas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {linkedClinics.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{c.tenant_name}</span>
                  </div>
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status === "active" ? "Ativo" : c.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JoinClinicCard;
