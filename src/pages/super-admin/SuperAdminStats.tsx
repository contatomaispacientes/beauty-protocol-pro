import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SuperAdminStats = () => {
  return (
    <SuperAdminLayout title="Estatísticas">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-serif font-bold">Estatísticas da Plataforma</h2>
        <Card>
          <CardHeader><CardTitle>Em breve</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Gráficos de uso, análises realizadas e crescimento de usuários estarão disponíveis aqui.</p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminStats;
