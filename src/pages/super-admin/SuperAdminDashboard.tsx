import SuperAdminLayout from "@/components/SuperAdminLayout";
import PlatformAnalytics from "@/components/super-admin/PlatformAnalytics";
import { Shield } from "lucide-react";

const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout title="Super Admin - Visão Geral">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">Acesso Super Admin</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Visão completa dos dados da plataforma LUZ. Use os menus laterais para gerenciar usuários,
            tenants e configurações.
          </p>
        </div>

        <PlatformAnalytics />
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
