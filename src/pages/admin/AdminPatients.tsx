import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  patient_id: string;
  status: string;
  created_at: string;
  profile?: { display_name: string | null; email: string | null };
}

/** Resolve tenant IDs for the current user — as owner OR as linked admin via tenant_patients */
const resolveUserTenantIds = async (userId: string): Promise<string[]> => {
  const [{ data: owned }, { data: linked }] = await Promise.all([
    supabase.from("tenants").select("id").eq("owner_id", userId),
    supabase.from("tenant_patients").select("tenant_id").eq("patient_id", userId),
  ]);
  const ids = new Set<string>();
  owned?.forEach((t) => ids.add(t.id));
  linked?.forEach((t) => ids.add(t.tenant_id));
  return Array.from(ids);
};

const AdminPatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPatients = async () => {
    if (!user) return;
    setLoading(true);
    const tenantIds = await resolveUserTenantIds(user.id);
    if (tenantIds.length > 0) {
      const { data } = await supabase.from("tenant_patients").select("*").in("tenant_id", tenantIds);
      if (data) {
        const patientIds = data.map((p) => p.patient_id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, email").in("user_id", patientIds);
        const mapped = data.map((p) => ({
          ...p,
          profile: profiles?.find((pr) => pr.user_id === p.patient_id) || undefined,
        }));
        setPatients(mapped);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, [user]);

  const generateInviteCode = async () => {
    if (!user) return;
    const tenantIds = await resolveUserTenantIds(user.id);
    if (tenantIds.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Você não tem uma clínica cadastrada." });
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("tenant_invite_codes").insert({
      tenant_id: tenantIds[0],
      code,
      max_uses: 10,
    });
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setInviteCode(code);
      toast({ title: "Código gerado!", description: `Código: ${code}` });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: "Copiado!" });
  };

  return (
    <AdminLayout title="Pacientes">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold">Meus Pacientes</h2>
            <p className="text-muted-foreground text-sm">Pacientes vinculados à sua clínica.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Gerar Código de Convite</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Código de Convite</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gere um código para seus pacientes se vincularem à sua clínica.</p>
                {inviteCode ? (
                  <div className="flex items-center gap-2">
                    <Input value={inviteCode} readOnly className="font-mono text-lg text-center" />
                    <Button variant="outline" size="icon" onClick={copyCode}><Copy className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={generateInviteCode}>Gerar Código</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vinculado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum paciente vinculado ainda.</TableCell></TableRow>
                  ) : patients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.profile?.display_name || "—"}</TableCell>
                      <TableCell>{p.profile?.email || "—"}</TableCell>
                      <TableCell><Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPatients;
