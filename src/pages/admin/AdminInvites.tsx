import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  max_uses: number;
  uses: number;
  expires_at: string | null;
  created_at: string;
}

const resolveUserTenantIds = async (userId: string, isSuperAdmin: boolean): Promise<string[]> => {
  const [{ data: owned }, { data: linked }, { data: allTenants }] = await Promise.all([
    supabase.from("tenants").select("id").eq("owner_id", userId),
    supabase.from("tenant_patients").select("tenant_id").eq("patient_id", userId),
    isSuperAdmin ? supabase.from("tenants").select("id") : Promise.resolve({ data: [] as { id: string }[] }),
  ]);
  const ids = new Set<string>();
  owned?.forEach((t) => ids.add(t.id));
  linked?.forEach((t) => ids.add(t.tenant_id));
  allTenants?.forEach((t) => ids.add(t.id));
  return Array.from(ids);
};

const AdminInvites = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRole();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const tenantIds = await resolveUserTenantIds(user.id, isSuperAdmin);
      if (tenantIds.length > 0) {
        const { data } = await supabase
          .from("tenant_invite_codes")
          .select("*")
          .in("tenant_id", tenantIds)
          .order("created_at", { ascending: false });
        setCodes((data as InviteCode[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user, isSuperAdmin]);

  return (
    <AdminLayout title="Códigos de Convite">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-serif font-bold">Códigos de Convite</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum código gerado.</TableCell></TableRow>
                  ) : codes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-bold">{c.code}</TableCell>
                      <TableCell>{c.uses}/{c.max_uses}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
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

export default AdminInvites;
