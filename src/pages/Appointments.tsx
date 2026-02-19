import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, User } from "lucide-react";

const mockAppointments = [
  { id: 1, professional: "Dra. Ana Costa", specialty: "Dermatologista", date: "25/02/2026", time: "14:00", status: "Confirmado" },
  { id: 2, professional: "Dr. Carlos Silva", specialty: "Esteticista", date: "15/03/2026", time: "10:30", status: "Pendente" },
];

const Appointments = () => {
  return (
    <DashboardLayout title="Agendamentos">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Acompanhamento mensal com profissionais.</p>
          <Button>
            <CalendarCheck className="w-4 h-4 mr-2" />
            Novo agendamento
          </Button>
        </div>

        <div className="space-y-4">
          {mockAppointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-lavender flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{apt.professional}</p>
                  <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" />{apt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
                  </div>
                </div>
                <Badge variant={apt.status === "Confirmado" ? "default" : "secondary"}>{apt.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockAppointments.length === 0 && (
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
