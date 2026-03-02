import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, Clock, User, Filter, Plus, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  patient_id: string;
  tenant_id: string;
  professional_name: string | null;
  specialty: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  patient_name?: string;
  patient_email?: string;
}

const STATUS_OPTIONS = ["Pendente", "Confirmado", "Concluído", "Cancelado"];

const statusVariant = (s: string) => {
  switch (s) {
    case "Confirmado": return "default";
    case "Concluído": return "secondary";
    case "Cancelado": return "destructive";
    default: return "outline";
  }
};

const AdminAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);

    const { data: tenants } = await supabase.from("tenants").select("id").eq("owner_id", user.id);
    const ids = tenants?.map((t) => t.id) || [];
    if (ids.length === 0) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .in("tenant_id", ids)
      .order("appointment_date", { ascending: false });

    if (error || !data) { setLoading(false); return; }

    // Fetch patient profiles
    const patientIds = [...new Set(data.map((a) => a.patient_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, email")
      .in("user_id", patientIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    setAppointments(
      data.map((a) => ({
        ...a,
        patient_name: profileMap.get(a.patient_id)?.display_name || "Paciente",
        patient_email: profileMap.get(a.patient_id)?.email || "",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [user]);

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: editStatus, notes: editNotes })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agendamento atualizado" });
      setEditingId(null);
      fetchAppointments();
    }
  };

  const filtered = statusFilter === "all"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pendente").length,
    confirmed: appointments.filter((a) => a.status === "Confirmado").length,
    completed: appointments.filter((a) => a.status === "Concluído").length,
  };

  return (
    <AdminLayout title="Agendamentos">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Gestão de Agendamentos</h2>
          <p className="text-muted-foreground text-sm mt-1">Visualize e gerencie as consultas da sua clínica.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: counts.total, icon: CalendarCheck },
            { label: "Pendentes", value: counts.pending, icon: Clock },
            { label: "Confirmados", value: counts.confirmed, icon: User },
            { label: "Concluídos", value: counts.completed, icon: CalendarCheck },
          ].map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                <c.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum agendamento encontrado.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{a.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{a.patient_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(a.appointment_date + "T00:00:00"), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">{a.appointment_time?.slice(0, 5)}</TableCell>
                      <TableCell className="text-sm">{a.professional_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {a.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={editingId === a.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setEditingId(a.id);
                              setEditStatus(a.status);
                              setEditNotes(a.notes || "");
                            } else {
                              setEditingId(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Agendamento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-2">
                              <div>
                                <p className="text-sm font-medium mb-1">Paciente</p>
                                <p className="text-sm text-muted-foreground">{a.patient_name} — {format(new Date(a.appointment_date + "T00:00:00"), "dd/MM/yyyy")} às {a.appointment_time?.slice(0, 5)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Status</p>
                                <Select value={editStatus} onValueChange={setEditStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map((s) => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Notas</p>
                                <Textarea
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Observações sobre a consulta..."
                                  rows={3}
                                />
                              </div>
                              <Button className="w-full" onClick={() => handleUpdate(a.id)}>
                                Salvar Alterações
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
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

export default AdminAppointments;
