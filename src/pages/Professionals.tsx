import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, CalendarCheck, FileText, ArrowRight, Shield, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import InstitutionalFooter from "@/components/InstitutionalFooter";
import { useBrandingContext } from "@/contexts/BrandingContext";

const features = [
  {
    icon: Users,
    title: "Gestão de Pacientes",
    description: "Painel completo para cadastrar, acompanhar e gerenciar seus pacientes com prontuário digital inteligente.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de Evolução",
    description: "Acompanhe a evolução da pele dos seus pacientes com comparações fotográficas e métricas da IA.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda Integrada",
    description: "Sistema de agendamento com confirmação automática e lembretes para seus pacientes.",
  },
  {
    icon: FileText,
    title: "Códigos de Convite",
    description: "Gere códigos exclusivos para seus pacientes se vincularem à sua clínica na plataforma.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Conformidade com LGPD e criptografia de dados clínicos para proteção total dos pacientes.",
  },
  {
    icon: Clock,
    title: "Acompanhamento Mensal",
    description: "Receba solicitações de acompanhamento e ofereça suporte contínuo aos seus pacientes.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Professionals = () => {
  const { branding } = useBrandingContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
              Para Clínicas e Dermatologistas
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Eleve sua prática clínica com{" "}
              <span className="text-primary">inteligência artificial</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              O {branding.site_name} oferece ferramentas profissionais para dermatologistas e esteticistas
              acompanharem seus pacientes com precisão, eficiência e tecnologia de ponta.
            </p>
            <Button size="lg" className="px-8 py-6 text-base shadow-lg shadow-primary/20" asChild>
              <Link to="/signup">
                Criar conta profissional
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Ferramentas para Profissionais
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tudo que você precisa para gerenciar seus pacientes e acompanhar resultados.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Comece a usar gratuitamente
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Crie sua conta profissional e tenha acesso ao painel administrativo com todas as ferramentas para gerenciar seus pacientes.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" className="px-8 py-6 text-base" asChild>
                <Link to="/signup">
                  Começar agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-base" asChild>
                <Link to="/contact">Falar com equipe</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <InstitutionalFooter />
    </div>
  );
};

export default Professionals;
