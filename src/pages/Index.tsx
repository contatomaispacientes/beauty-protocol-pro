import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Camera, Palette, FlaskConical, MessageCircle, CalendarCheck, ArrowRight, Shield, Star, Leaf, Quote, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import BrandingLogo from "@/components/BrandingLogo";
import { useBrandingContext } from "@/contexts/BrandingContext";

const features = [
  {
    icon: Sparkles,
    title: "Questionário Inteligente",
    description: "Perguntas adaptativas que traçam seu perfil dermatológico único com precisão.",
    color: "bg-rose-soft",
  },
  {
    icon: Camera,
    title: "Análise por IA",
    description: "Upload de selfie ou câmera ao vivo para análise completa de tipo, tom e condições da pele.",
    color: "bg-peach",
  },
  {
    icon: Leaf,
    title: "Rotina Personalizada",
    description: "Rotina de skincare matinal e noturna com produtos recomendados e ajuste automático.",
    color: "bg-sage",
  },
  {
    icon: Palette,
    title: "Colorimetria e Maquiagem",
    description: "Descubra sua estação pessoal e a paleta de cores e maquiagem ideal para você.",
    color: "bg-lavender",
  },
  {
    icon: FlaskConical,
    title: "Análise de Produtos",
    description: "Identifique princípios ativos e saiba se o produto é adequado para sua pele.",
    color: "bg-peach",
  },
  {
    icon: History,
    title: "Prontuário Digital",
    description: "Acompanhe a evolução da sua pele com fotos, IA e linha do tempo completa.",
    color: "bg-sage",
  },
  {
    icon: MessageCircle,
    title: "Chat com IA",
    description: "Tire dúvidas sobre skincare a qualquer momento com respostas personalizadas.",
    color: "bg-rose-soft",
  },
  {
    icon: CalendarCheck,
    title: "Agendamento",
    description: "Marque consultas e receba acompanhamento mensal com profissionais.",
    color: "bg-lavender",
  },
];

const steps = [
  { number: "01", title: "Responda o questionário", description: "Perguntas rápidas sobre sua pele, rotina e hábitos." },
  { number: "02", title: "Envie uma selfie", description: "Nossa IA analisa tipo de pele, tom, manchas e mais." },
  { number: "03", title: "Receba seu plano", description: "Rotina personalizada, paleta de cores e recomendações." },
  { number: "04", title: "Acompanhe sua evolução", description: "Prontuário digital, ajuste automático e suporte profissional." },
];

const testimonials = [
  {
    name: "Camila R.",
    role: "Paciente",
    text: "Em 3 meses, minha pele melhorou incrivelmente. A rotina personalizada fez toda a diferença!",
    avatar: "🌸",
  },
  {
    name: "Dra. Fernanda S.",
    role: "Dermatologista",
    text: "Uso o prontuário digital para acompanhar meus pacientes. A IA ajuda na triagem e evolução.",
    avatar: "👩‍⚕️",
  },
  {
    name: "Juliana M.",
    role: "Paciente",
    text: "A colorimetria acertou em cheio! Finalmente sei quais cores de maquiagem combinam comigo.",
    avatar: "💜",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Index = () => {
  const { branding } = useBrandingContext();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
          <div className="absolute bottom-10 right-[10%] w-96 h-96 rounded-full bg-lavender/40 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-peach/20 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-soft text-primary text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              Inteligência artificial para sua pele
            </motion.span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
              Sua pele merece{" "}
              <span className="text-primary relative">
                cuidado inteligente
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-sans">
              Análise de pele por IA, rotina personalizada de skincare e colorimetria —
              tudo em uma plataforma feita para valorizar a sua beleza natural.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
                <Link to="/signup">
                  Começar minha análise
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 backdrop-blur-sm" asChild>
                <a href="#features">Conhecer recursos</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground"
          >
            {[
              { icon: Shield, text: "Dados protegidos" },
              { icon: Star, text: "IA de última geração" },
              { icon: CalendarCheck, text: "Acompanhamento profissional" },
            ].map((badge, i) => (
              <motion.div
                key={badge.text}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-sm bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50"
              >
                <badge.icon className="w-4 h-4 text-primary" />
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Tudo o que sua pele precisa
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              Uma plataforma completa que combina ciência, IA e personalização para o melhor cuidado com a sua pele.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-foreground/70" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              Em poucos passos, você recebe uma análise completa e personalizada.
            </p>
          </motion.div>

          <div className="space-y-1">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-6 p-5 rounded-xl hover:bg-card/80 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-primary font-bold text-lg">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground font-sans">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              O que dizem sobre nós
            </h2>
            <p className="text-muted-foreground font-sans">
              Pacientes e profissionais que já transformaram sua rotina.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-card rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all relative"
              >
                <Quote className="w-8 h-8 text-primary/15 absolute top-4 right-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed italic">"{t.text}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Professionals CTA */}
      <section id="professionals" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-lavender/30 blur-3xl" />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Para profissionais de estética
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-sans mb-8">
              Painel técnico completo para acompanhar seus pacientes, gerar relatórios de evolução,
              gerenciar agenda e receber solicitações de acompanhamento mensal.
            </p>
            <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20" asChild>
              <Link to="/signup">
                Criar conta profissional
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BrandingLogo size="sm" />
              <span className="font-serif text-lg font-semibold text-foreground">{branding.site_name}</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              © 2026 {branding.site_name}. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
