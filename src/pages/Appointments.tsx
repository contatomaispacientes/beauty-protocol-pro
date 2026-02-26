import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CalendarCheck, Clock, User, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LinkedClinic {
  tenant_id: string;
  tenant_name: string;
}

interface Appointment {
  id: string;
  tenant_id: string;
  professional_name: string | null;
  specialty: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<LinkedClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      fetchClinics();
      fetchAppointments();
    }
  }, [user]);

  const fetchClinics = async () => {
    const { data: links } = await supabase
      .from("tenant_patients")
      .select("tenant_id")
      .eq("patient_id", user!.id);

    if (links && links.length > 0) {
      const tenantIds = links.map((l) => l.tenant_id);
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id, name")
        .in("id", tenantIds);

      if (tenants) {
        setClinics(tenants.map((t) => ({ tenant_id: t.id, tenant_name: t.name })));
      }
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", user!.id)
      .order("appointment_date", { ascending: true });

    if (!error && data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedClinic("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setProfessionalName("");
    setSpecialty("");
    setNotes("");
  };

  const handleCreate = async () => {
    if (!selectedClinic || !selectedDate || !selectedTime) {
      toast({ title: "Preencha clínica, data e horário.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { error } = await supabase.from("appointments").insert({
      patient_id: user!.id,
      tenant_id: selectedClinic,
      appointment_date: dateStr,
      appointment_time: selectedTime,
      professional_name: professionalName || null,
      specialty: specialty || null,
      notes: notes || null,
    });

    setSaving(false);

    if (error) {
      toast({ title: "Erro ao criar agendamento.", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agendamento criado com sucesso!" });
      resetForm();
      setDialogOpen(false);
      fetchAppointments();
    }
  };

  const getClinicName = (tenantId: string) => {
    return clinics.find((c) => c.tenant_id === tenantId)?.tenant_name ?? "";
  };

  return (
    <DashboardLayout title="Agendamentos">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Acompanhamento mensal com profissionais.</p>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <CalendarCheck className="w-4 h-4 mr-2" />
                Novo agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Clinic selection */}
                <div className="space-y-2">
                  <Label>Clínica *</Label>
                  {clinics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Você não está vinculado a nenhuma clínica. Use um código de convite primeiro.</p>
                  ) : (
                    <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a clínica" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((c) => (
                          <SelectItem key={c.tenant_id} value={c.tenant_id}>
                            <span className="flex items-center gap-2">
                              <Building2 className="w-3 h-3" />
                              {c.tenant_name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t}>
                          <span className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {t}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Professional */}
                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Input placeholder="Ex: Dra. Ana Costa" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input placeholder="Ex: Dermatologista" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input placeholder="Alguma observação?" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={saving || clinics.length === 0}>
                  {saving ? "Salvando..." : "Agendar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{apt.professional_name || "Profissional não informado"}</p>
                    <p className="text-xs text-muted-foreground">{apt.specialty || getClinicName(apt.tenant_id)}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3" />
                        {format(new Date(apt.appointment_date + "T00:00:00"), "dd/MM/yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apt.appointment_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={apt.status === "Confirmado" ? "default" : "secondary"}>{apt.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum agendamento ainda.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
