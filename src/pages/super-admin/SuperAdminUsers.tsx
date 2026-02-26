import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Building2, Plus, CheckCircle2, XCircle, Clock,
  Pencil, Trash2, X as XIcon,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Tenant { id: string; name: string; }

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  account_type: string;
  phone: string | null;
  is_approved: boolean;
  roles: string[];
  roleIds: { id: string; role: string }[];
  clinics: Tenant[];
}

const ALL_ROLES = ["user", "admin", "moderator", "super_admin"] as const;

const SuperAdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Edit dialog
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [editForm, setEditForm] = useState({ display_name: "", email: "", phone: "", account_type: "", is_approved: true });
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editClinics, setEditClinics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Assign clinic dialog
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: "", userName: "" });
  const [selectedTenant, setSelectedTenant] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Delete confirmation
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        const userRoles = allRoles?.filter((r) => r.user_id === p.user_id) || [];
        return {
          id: p.id,
          user_id: p.user_id,
          email: p.email,
          display_name: p.display_name,
          account_type: p.account_type,
          phone: p.phone,
          is_approved: p.is_approved,
          roles: userRoles.map((r) => r.role),
          roleIds: userRoles.map((r) => ({ id: r.id, role: r.role })),
          clinics: userClinics,
        };
      });
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // === EDIT ===
  const openEdit = (u: UserWithRole) => {
    setEditUser(u);
    setEditForm({
      display_name: u.display_name || "",
      email: u.email || "",
      phone: u.phone || "",
      account_type: u.account_type,
      is_approved: u.is_approved,
    });
    setEditRoles([...u.roles]);
    setEditClinics(u.clinics.map((c) => c.id));
  };

  const toggleRole = (role: string) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleClinic = (tenantId: string) => {
    setEditClinics((prev) =>
      prev.includes(tenantId) ? prev.filter((id) => id !== tenantId) : [...prev, tenantId]
    );
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: editForm.display_name,
        phone: editForm.phone,
        account_type: editForm.account_type,
        is_approved: editForm.is_approved,
      })
      .eq("user_id", editUser.user_id);

    if (profileError) {
      toast({ variant: "destructive", title: "Erro ao salvar perfil", description: profileError.message });
      setSaving(false);
      return;
    }

    // Sync roles: remove old, add new
    const currentRoles = editUser.roles;
    const rolesToRemove = currentRoles.filter((r) => !editRoles.includes(r));
    const rolesToAdd = editRoles.filter((r) => !currentRoles.includes(r));

    for (const role of rolesToRemove) {
      const roleRecord = editUser.roleIds.find((ri) => ri.role === role);
      if (roleRecord) {
        await supabase.from("user_roles").delete().eq("id", roleRecord.id);
      }
    }
    for (const role of rolesToAdd) {
      await supabase.from("user_roles").insert({ user_id: editUser.user_id, role: role as any });
    }

    // Sync clinics: remove old, add new
    const currentClinicIds = editUser.clinics.map((c) => c.id);
    const clinicsToRemove = currentClinicIds.filter((id) => !editClinics.includes(id));
    const clinicsToAdd = editClinics.filter((id) => !currentClinicIds.includes(id));

    for (const tenantId of clinicsToRemove) {
      await supabase.from("tenant_patients").delete()
        .eq("patient_id", editUser.user_id)
        .eq("tenant_id", tenantId);
    }
    for (const tenantId of clinicsToAdd) {
      await supabase.from("tenant_patients").insert({
        patient_id: editUser.user_id,
        tenant_id: tenantId,
      });
    }

    setSaving(false);
    setEditUser(null);
    toast({ title: "Usuário atualizado ✅" });
    fetchData();
  };

  // === DELETE ===
  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);

    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: deleteUser.user_id },
    });

    setDeleting(false);
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: data?.error || error?.message });
    } else {
      toast({ title: "Usuário excluído" });
      setDeleteUser(null);
      fetchData();
    }
  };

  // === APPROVAL ===
  const handleApproval = async (userId: string, approve: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_approved: approve }).eq("user_id", userId);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: approve ? "Conta aprovada ✅" : "Acesso bloqueado" });
      fetchData();
    }
  };

  // === QUICK ASSIGN CLINIC ===
  const handleAssignClinic = async () => {
    if (!selectedTenant || !assignDialog.userId) return;
    setAssigning(true);
    const { error } = await supabase.from("tenant_patients").insert({
      patient_id: assignDialog.userId,
      tenant_id: selectedTenant,
    });
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Vinculado à clínica ✅" });
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

  const pendingUsers = users.filter((u) => u.account_type === "professional" && !u.is_approved);
  const activeUsers = users.filter((u) => u.is_approved || u.account_type !== "professional");

  return (
    <SuperAdminLayout title="Gerenciar Usuários">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Usuários</h2>
          <p className="text-muted-foreground text-sm">Gerencie todos os usuários — edite, exclua, defina roles e vincule clínicas.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            {/* Pending */}
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
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                          <TableCell>{u.email || "—"}</TableCell>
                          <TableCell>{u.phone || "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproval(u.user_id, true)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                                <Pencil className="w-4 h-4 mr-1" /> Editar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => setDeleteUser(u)}>
                                <Trash2 className="w-4 h-4" />
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

            {/* Active Users */}
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                        <TableCell className="text-sm">{u.email || "—"}</TableCell>
                        <TableCell className="text-sm">{u.phone || "—"}</TableCell>
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
                                  <Building2 className="w-3 h-3" /> {c.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(u)} title="Editar">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteUser(u)} title="Excluir" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
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

      {/* === EDIT DIALOG === */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Editar Usuário</DialogTitle>
            <DialogDescription>Altere informações, roles e clínicas vinculadas.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={editForm.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por aqui.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de conta</Label>
                <Select value={editForm.account_type} onValueChange={(v) => setEditForm({ ...editForm, account_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumer">Paciente</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.is_approved ? "approved" : "pending"} onValueChange={(v) => setEditForm({ ...editForm, is_approved: v === "approved" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Ativo</SelectItem>
                    <SelectItem value="pending">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-3">
                {ALL_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={editRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Badge variant={roleBadgeColor(role) as any}>{role}</Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Clinics */}
            <div className="space-y-2">
              <Label>Clínicas vinculadas</Label>
              {tenants.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma clínica cadastrada.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {tenants.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={editClinics.includes(t.id)}
                        onCheckedChange={() => toggleClinic(t.id)}
                      />
                      <Building2 className="w-3 h-3 text-muted-foreground" />
                      {t.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === DELETE CONFIRMATION === */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteUser?.display_name || deleteUser?.email}</strong>?
              Esta ação é irreversível e removerá todos os dados do usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* === QUICK ASSIGN CLINIC === */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular a uma Clínica</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Vincular <strong>{assignDialog.userName}</strong> a uma clínica:
          </p>
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger><SelectValue placeholder="Selecione uma clínica" /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog({ open: false, userId: "", userName: "" })}>Cancelar</Button>
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
