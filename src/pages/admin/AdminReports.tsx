import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, CalendarCheck, FileText, Camera, TrendingUp, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyData {
  month: string;
  patients: number;
  appointments: number;
  entries: number;
}

interface ConditionData {
  name: string;
  value: number;
}

const CONDITIONS_MAP: Record<string, string> = {
  melasma: "Melasma",
  acne: "Acne",
  rosacea: "Rosácea",
  dermatite: "Dermatite",
  envelhecimento: "Envelhecimento",
  manchas: "Manchas",
  sensibilidade: "Sensibilidade",
  desidratacao: "Desidratação",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(346 60% 72%)",
  "hsl(160 30% 60%)",
  "hsl(35 60% 70%)",
  "hsl(260 40% 65%)",
  "hsl(200 50% 60%)",
];

const chartConfig: ChartConfig = {
  patients: { label: "Pacientes", color: "hsl(var(--primary))" },
  appointments: { label: "Agendamentos", color: "hsl(var(--accent))" },
  entries: { label: "Registros", color: "hsl(var(--secondary))" },
};

const AdminReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenantIds, setTenantIds] = useState<string[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [conditionData, setConditionData] = useState<ConditionData[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);

      // Get tenants
      const { data: tenants } = await supabase.from("tenants").select("id").eq("owner_id", user.id);
      const ids = tenants?.map((t) => t.id) || [];
      setTenantIds(ids);

      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [patientsRes, appointmentsRes, entriesRes] = await Promise.all([
        supabase.from("tenant_patients").select("id, created_at").in("tenant_id", ids),
        supabase.from("appointments").select("id, created_at, status").in("tenant_id", ids),
        supabase.from("patient_timeline").select("id, created_at, entry_type, condition_tag").in("tenant_id", ids),
      ]);

      const patients = patientsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const entries = entriesRes.data || [];

      setTotalPatients(patients.length);
      setTotalAppointments(appointments.length);
      setTotalEntries(entries.length);
      setTotalAnalyses(entries.filter((e) => e.entry_type === "analysis").length);

      // Build monthly data for last 6 months
      const months: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const label = format(date, "MMM", { locale: ptBR });

        months.push({
          month: label.charAt(0).toUpperCase() + label.slice(1),
          patients: patients.filter((p) => {
            const d = new Date(p.created_at);
            return d >= start && d <= end;
          }).length,
          appointments: appointments.filter((a) => {
            const d = new Date(a.created_at);
            return d >= start && d <= end;
          }).length,
          entries: entries.filter((e) => {
            const d = new Date(e.created_at);
            return d >= start && d <= end;
          }).length,
        });
      }
      setMonthlyData(months);

      // Build condition distribution
      const condMap: Record<string, number> = {};
      entries.forEach((e) => {
        if (e.condition_tag) {
          const label = CONDITIONS_MAP[e.condition_tag] || e.condition_tag;
          condMap[label] = (condMap[label] || 0) + 1;
        }
      });
      setConditionData(
        Object.entries(condMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      );

      setLoading(false);
    };

    loadData();
  }, [user]);

  const statCards = [
    { title: "Total de Pacientes", value: totalPatients, icon: Users, description: "Pacientes vinculados à clínica" },
    { title: "Agendamentos", value: totalAppointments, icon: CalendarCheck, description: "Consultas realizadas" },
    { title: "Registros no Prontuário", value: totalEntries, icon: FileText, description: "Entradas na linha do tempo" },
    { title: "Análises de IA", value: totalAnalyses, icon: Camera, description: "Análises de pele com IA" },
  ];

  return (
    <AdminLayout title="Relatórios">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Relatórios e Métricas</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do desempenho da sua clínica.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((c) => (
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

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Activity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Atividade Mensal</CardTitle>
                  </div>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyData.some((m) => m.patients > 0 || m.appointments > 0 || m.entries > 0) ? (
                    <ChartContainer config={chartConfig} className="h-[260px] w-full">
                      <BarChart data={monthlyData} accessibilityLayer>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="patients" fill="var(--color-patients)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="appointments" fill="var(--color-appointments)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="entries" fill="var(--color-entries)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                      Nenhum dado registrado ainda.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Condition Distribution */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Condições Registradas</CardTitle>
                  </div>
                  <CardDescription>Distribuição por tipo de condição</CardDescription>
                </CardHeader>
                <CardContent>
                  {conditionData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <div className="h-[260px] w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={conditionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {conditionData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2 w-1/2">
                        {conditionData.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-2 text-sm">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span className="truncate text-foreground">{item.name}</span>
                            <span className="ml-auto font-medium text-muted-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                      Nenhuma condição registrada ainda.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Growth Line Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">Crescimento de Pacientes</CardTitle>
                </div>
                <CardDescription>Novos pacientes por mês</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.some((m) => m.patients > 0) ? (
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart data={monthlyData} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="patients"
                        stroke="var(--color-patients)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--color-patients)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    Nenhum dado registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
