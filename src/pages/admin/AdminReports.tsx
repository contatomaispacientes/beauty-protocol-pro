import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminReports = () => (
  <AdminLayout title="Relatórios">
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-serif font-bold">Relatórios</h2>
      <Card>
        <CardHeader><CardTitle>Em breve</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Relatórios de evolução dos pacientes, comparações de fotos e histórico de análises estarão disponíveis aqui.</p>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminReports;
