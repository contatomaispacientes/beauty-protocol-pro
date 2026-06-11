import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ClipboardList, Camera, Sparkles, FlaskConical, MessageCircle, ArrowRight, History } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";

const quickActions = [
  { title: "Questionário de Pele", description: "Responda para traçar seu perfil", icon: ClipboardList, url: "/questionnaire", color: "bg-rose-soft" },
  { title: "Análise por IA", description: "Tire uma selfie e descubra sua pele", icon: Camera, url: "/skin-analysis", color: "bg-peach" },
  { title: "Minha Rotina", description: "Skincare personalizada para você", icon: Sparkles, url: "/routine", color: "bg-sage" },
  { title: "Analisar Produto", description: "Verifique princípios ativos com IA", icon: FlaskConical, url: "/products", color: "bg-peach" },
  { title: "Prontuário Digital", description: "Linha do tempo de evolução", icon: History, url: "/timeline", color: "bg-sage" },
  { title: "Chat com IA", description: "Tire dúvidas sobre skincare", icon: MessageCircle, url: "/chat", color: "bg-rose-soft" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Dashboard = () => {
  const { user } = useAuth();
  const name = user?.user_metadata?.name || "Usuário";

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Olá, {name} 👋
            </h2>
            <p className="text-muted-foreground mt-1">Bem-vindo à sua central de cuidados com a pele.</p>
          </div>
          <InstallAppButton />
        </motion.div>

        {/* Quick Actions */}
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-lg font-semibold text-foreground mb-4"
          >
            Começar
          </motion.h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {quickActions.map((action) => (
              <motion.div key={action.title} variants={itemVariants}>
                <Card className="hover:shadow-md hover:border-primary/20 transition-all group h-full">
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-foreground/70" />
                    </div>
                    <CardTitle className="text-base font-serif">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="ghost" size="sm" className="p-0 text-primary group-hover:translate-x-1 transition-transform" asChild>
                      <Link to={action.url}>
                        Acessar <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>


        {/* Medical disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-muted/50 rounded-lg p-4 border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Esta plataforma não substitui consulta dermatológica profissional.
            Sempre consulte um dermatologista para diagnósticos e tratamentos.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
