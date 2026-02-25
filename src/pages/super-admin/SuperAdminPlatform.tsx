import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SuperAdminPlatform = () => {
  return (
    <SuperAdminLayout title="Configurações da Plataforma">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-serif font-bold">Plataforma</h2>
        <Card>
          <CardHeader><CardTitle>Layout & Branding</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Configurações globais de cores, logo e nome da plataforma estarão disponíveis aqui.</p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminPlatform;
