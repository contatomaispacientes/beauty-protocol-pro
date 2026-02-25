import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, CalendarCheck, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const name = user?.user_metadata?.name || "Doutor(a)";

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      // Get tenants owned by this user
      const { data: tenants } = await supabase.from("tenants").select("id").eq("owner_id", user.id);
      if (tenants && tenants.length > 0) {
        const ids = tenants.map((t) => t.id);
        const { count } = await supabase.from("tenant_patients").select("id", { count: "exact", head: true }).in("tenant_id", ids);
        setPatientCount(count || 0);
      }
    };
    load();
  }, [user]);

  const cards = [
    { title: "Pacientes", value: patientCount, icon: Users, description: "Pacientes vinculados" },
    { title: "Agendamentos", value: 0, icon: CalendarCheck, description: "Consultas do mês" },
    { title: "Relatórios", value: 0, icon: FileText, description: "Relatórios gerados" },
  ];

  return (
    <AdminLayout title="Painel Admin">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Olá, {name} 👋</h2>
          <p className="text-muted-foreground mt-1">Bem-vindo ao painel da sua clínica.</p>
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
