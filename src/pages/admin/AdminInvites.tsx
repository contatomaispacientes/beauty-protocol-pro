import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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

const AdminInvites = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: tenants } = await supabase.from("tenants").select("id").eq("owner_id", user.id);
      if (tenants && tenants.length > 0) {
        const { data } = await supabase.from("tenant_invite_codes").select("*").in("tenant_id", tenants.map((t) => t.id)).order("created_at", { ascending: false });
        setCodes((data as InviteCode[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

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
