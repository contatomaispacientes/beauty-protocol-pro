import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Building2, Link2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

interface Stats {
  totalUsers: number;
  totalTenants: number;
  totalLinks: number;
  accountTypes: { name: string; value: number }[];
  usersByMonth: { month: string; count: number }[];
  tenantsByMonth: { month: string; count: number }[];
  topTenants: { name: string; patients: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--muted))",
];

const SuperAdminStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, tenantsRes, linksRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("tenants").select("*"),
        supabase.from("tenant_patients").select("*, tenants(name)"),
      ]);

      const profiles = profilesRes.data || [];
      const tenants = tenantsRes.data || [];
      const links = linksRes.data || [];

      // Account types
      const typeCount: Record<string, number> = {};
      profiles.forEach((p) => {
        const t = p.account_type || "consumer";
        typeCount[t] = (typeCount[t] || 0) + 1;
      });
      const accountTypes = Object.entries(typeCount).map(([name, value]) => ({
        name: name === "consumer" ? "Consumidor" : "Profissional",
        value,
      }));

      // Users by month (last 6 months)
      const usersByMonth = getByMonth(profiles, "created_at", 6);

      // Tenants by month
      const tenantsByMonth = getByMonth(tenants, "created_at", 6);

      // Top tenants by patient count
      const tenantPatientCount: Record<string, { name: string; patients: number }> = {};
      links.forEach((l: any) => {
        const tid = l.tenant_id;
        if (!tenantPatientCount[tid]) {
          tenantPatientCount[tid] = { name: (l.tenants as any)?.name || "Clínica", patients: 0 };
        }
        tenantPatientCount[tid].patients++;
      });
      const topTenants = Object.values(tenantPatientCount)
        .sort((a, b) => b.patients - a.patients)
        .slice(0, 5);

      setStats({
        totalUsers: profiles.length,
        totalTenants: tenants.length,
        totalLinks: links.length,
        accountTypes,
        usersByMonth,
        tenantsByMonth,
        topTenants,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout title="Estatísticas">
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      </SuperAdminLayout>
    );
  }

  if (!stats) return null;

  return (
    <SuperAdminLayout title="Estatísticas">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Estatísticas da Plataforma</h2>
          <p className="text-muted-foreground mt-1">Métricas de uso e crescimento.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "Usuários", value: stats.totalUsers, icon: Users },
            { title: "Clínicas", value: stats.totalTenants, icon: Building2 },
            { title: "Vínculos", value: stats.totalLinks, icon: Link2 },
          ].map((c) => (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <c.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Users by month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Novos Usuários por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.usersByMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados suficientes.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.usersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" name="Usuários" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Account types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Tipos de Conta</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.accountTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.accountTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stats.accountTypes.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tenants by month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Novas Clínicas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.tenantsByMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados suficientes.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.tenantsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="Clínicas" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Top Clínicas por Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topTenants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum vínculo ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.topTenants} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" allowDecimals={false} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="patients" name="Pacientes" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

function getByMonth(items: any[], dateField: string, months: number) {
  const now = new Date();
  const result: { month: string; count: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const count = items.filter((item) => {
      const created = new Date(item[dateField]);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    }).length;
    result.push({ month: label, count });
  }

  return result;
}

export default SuperAdminStats;
