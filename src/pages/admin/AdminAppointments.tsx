import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAppointments = () => (
  <AdminLayout title="Agendamentos">
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-serif font-bold">Agendamentos</h2>
      <Card>
        <CardHeader><CardTitle>Em breve</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Gerencie suas consultas e horários disponíveis aqui.</p>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminAppointments;
