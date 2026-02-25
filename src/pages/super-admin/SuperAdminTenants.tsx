import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  owner_id: string;
  primary_color: string;
  created_at: string;
}

const SuperAdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    setTenants((data as Tenant[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleCreate = async () => {
    if (!newName || !newOwnerId) return;
    // Look up user_id from email
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", newOwnerId).single();
    if (!profile) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não encontrado com esse e-mail." });
      return;
    }
    const { error } = await supabase.from("tenants").insert({ name: newName, owner_id: profile.user_id });
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Tenant criado!" });
      setNewName("");
      setNewOwnerId("");
      setDialogOpen(false);
      fetchTenants();
    }
  };

  return (
    <SuperAdminLayout title="Tenants (Clínicas)">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold">Clínicas & Profissionais</h2>
            <p className="text-muted-foreground text-sm">Gerencie os tenants da plataforma.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Novo Tenant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Tenant</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Clínica</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Clínica Exemplo" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail do Responsável (Admin)</Label>
                  <Input value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)} placeholder="admin@email.com" />
                </div>
                <Button className="w-full" onClick={handleCreate}>Criar Tenant</Button>
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
                    <TableHead>Cor</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum tenant cadastrado.</TableCell></TableRow>
                  ) : tenants.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell><div className="w-6 h-6 rounded" style={{ backgroundColor: t.primary_color }} /></TableCell>
                      <TableCell>{new Date(t.created_at).toLocaleDateString("pt-BR")}</TableCell>
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

export default SuperAdminTenants;
