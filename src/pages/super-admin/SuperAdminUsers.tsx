import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  account_type: string;
  roles: string[];
}

const SuperAdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: allRoles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const mapped = profiles.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        display_name: p.display_name,
        account_type: p.account_type,
        roles: allRoles?.filter((r) => r.user_id === p.user_id).map((r) => r.role) || [],
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Check if role exists
    const existing = users.find((u) => u.user_id === userId);
    if (!existing) return;

    if (newRole === "admin" && !existing.roles.includes("admin")) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
      if (error) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      } else {
        toast({ title: "Role adicionado", description: `Usuário agora é admin.` });
        fetchUsers();
      }
    }
  };

  const roleBadgeColor = (role: string) => {
    if (role === "super_admin") return "destructive";
    if (role === "admin") return "default";
    return "secondary";
  };

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
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                      <TableCell>{u.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.account_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map((r) => (
                            <Badge key={r} variant={roleBadgeColor(r) as any}>{r}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!u.roles.includes("admin") && !u.roles.includes("super_admin") && (
                          <Button size="sm" variant="outline" onClick={() => handleRoleChange(u.user_id, "admin")}>
                            Tornar Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUsers;
