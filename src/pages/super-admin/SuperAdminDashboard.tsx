import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, BarChart3, Shield } from "lucide-react";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalTenants: 0, totalPatientLinks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, tenantsRes, linksRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tenants").select("id", { count: "exact", head: true }),
        supabase.from("tenant_patients").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        totalUsers: usersRes.count || 0,
        totalTenants: tenantsRes.count || 0,
        totalPatientLinks: linksRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Usuários", value: stats.totalUsers, icon: Users, description: "Total de usuários cadastrados" },
    { title: "Clínicas/Tenants", value: stats.totalTenants, icon: Building2, description: "Clínicas e profissionais" },
    { title: "Vínculos", value: stats.totalPatientLinks, icon: BarChart3, description: "Pacientes vinculados a clínicas" },
  ];

  return (
    <SuperAdminLayout title="Super Admin - Visão Geral">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Painel de Controle</h2>
          <p className="text-muted-foreground mt-1">Visão geral da plataforma DermAI.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <c.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">Acesso Super Admin</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Você tem acesso total à plataforma. Use os menus laterais para gerenciar usuários, tenants, funcionalidades e configurações.
          </p>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
