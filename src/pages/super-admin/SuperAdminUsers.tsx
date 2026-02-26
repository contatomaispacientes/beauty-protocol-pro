import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Plus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Tenant {
  id: string;
  name: string;
}

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  account_type: string;
  phone: string | null;
  is_approved: boolean;
  roles: string[];
  clinics: Tenant[];
}

const SuperAdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: "", userName: "" });
  const [selectedTenant, setSelectedTenant] = useState("");
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: allRoles }, { data: allTenants }, { data: allPatients }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
      supabase.from("tenants").select("id, name"),
      supabase.from("tenant_patients").select("patient_id, tenant_id"),
    ]);

    if (allTenants) setTenants(allTenants);

    if (profiles) {
      const mapped = profiles.map((p: any) => {
        const userClinics: Tenant[] = [];
        const patientLinks = allPatients?.filter((tp) => tp.patient_id === p.user_id) || [];
        patientLinks.forEach((link) => {
          const t = allTenants?.find((t) => t.id === link.tenant_id);
          if (t && !userClinics.find((c) => c.id === t.id)) userClinics.push(t);
        });
        return {
          id: p.id,
          user_id: p.user_id,
          email: p.email,
          display_name: p.display_name,
          account_type: p.account_type,
          phone: p.phone,
          is_approved: p.is_approved,
          roles: allRoles?.filter((r) => r.user_id === p.user_id).map((r) => r.role) || [],
          clinics: userClinics,
        };
      });
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const existing = users.find((u) => u.user_id === userId);
    if (!existing) return;

    if (newRole === "admin" && !existing.roles.includes("admin")) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
      if (error) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      } else {
        toast({ title: "Role adicionado", description: "Usuário agora é admin." });
        fetchData();
      }
    }
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: approve })
      .eq("user_id", userId);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: approve ? "Conta aprovada ✅" : "Conta rejeitada", description: approve ? "O profissional já pode acessar a plataforma." : "O acesso foi bloqueado." });
      fetchData();
    }
  };

  const handleAssignClinic = async () => {
    if (!selectedTenant || !assignDialog.userId) return;
    setAssigning(true);

    const existing = users.find((u) => u.user_id === assignDialog.userId);
    if (existing?.clinics.find((c) => c.id === selectedTenant)) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário já está vinculado a esta clínica." });
      setAssigning(false);
      return;
    }

    const { error } = await supabase.from("tenant_patients").insert({
      patient_id: assignDialog.userId,
      tenant_id: selectedTenant,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Sucesso", description: "Usuário vinculado à clínica." });
      setAssignDialog({ open: false, userId: "", userName: "" });
      setSelectedTenant("");
      fetchData();
    }
    setAssigning(false);
  };

  const roleBadgeColor = (role: string) => {
    if (role === "super_admin") return "destructive";
    if (role === "admin") return "default";
    return "secondary";
  };

  // Separate pending professionals
  const pendingUsers = users.filter((u) => u.account_type === "professional" && !u.is_approved);
  const activeUsers = users.filter((u) => u.is_approved || u.account_type !== "professional");

  return (
    <SuperAdminLayout title="Gerenciar Usuários">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Usuários</h2>
          <p className="text-muted-foreground text-sm">Gerencie todos os usuários da plataforma.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="font-serif font-semibold text-amber-900">Aguardando Aprovação ({pendingUsers.length})</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                          <TableCell>{u.email || "—"}</TableCell>
                          <TableCell>{u.phone || "—"}</TableCell>
                          <TableCell><Badge variant="outline">Profissional</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" onClick={() => handleApproval(u.user_id, true)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleApproval(u.user_id, false)}>
                                <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* All Users */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Clínica(s)</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                        <TableCell>{u.email || "—"}</TableCell>
                        <TableCell>{u.phone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.account_type === "professional" ? "Profissional" : "Paciente"}</Badge>
                        </TableCell>
                        <TableCell>
                          {u.is_approved ? (
                            <Badge variant="secondary" className="gap-1 text-green-700 bg-green-100">
                              <CheckCircle2 className="w-3 h-3" /> Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-100">
                              <Clock className="w-3 h-3" /> Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.roles.map((r) => (
                              <Badge key={r} variant={roleBadgeColor(r) as any}>{r}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.clinics.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {u.clinics.map((c) => (
                                <Badge key={c.id} variant="outline" className="gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {c.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Nenhuma</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {u.account_type === "professional" && u.is_approved && (
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleApproval(u.user_id, false)}>
                                Bloquear
                              </Button>
                            )}
                            {u.account_type === "professional" && !u.is_approved && (
                              <Button size="sm" variant="default" onClick={() => handleApproval(u.user_id, true)}>
                                Aprovar
                              </Button>
                            )}
                            {!u.roles.includes("admin") && !u.roles.includes("super_admin") && (
                              <Button size="sm" variant="outline" onClick={() => handleRoleChange(u.user_id, "admin")}>
                                Tornar Admin
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAssignDialog({ open: true, userId: u.user_id, userName: u.display_name || u.email || "Usuário" })}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Clínica
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular a uma Clínica</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Vincular <strong>{assignDialog.userName}</strong> a uma clínica:
          </p>
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma clínica" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog({ open: false, userId: "", userName: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleAssignClinic} disabled={!selectedTenant || assigning}>
              {assigning && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SuperAdminUsers;
