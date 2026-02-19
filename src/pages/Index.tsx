import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Camera, Palette, FlaskConical, MessageCircle, CalendarCheck, ArrowRight, Shield, Star, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";

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
    title: "Colorimetria",
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
    icon: MessageCircle,
    title: "Chat com IA",
    description: "Tire dúvidas sobre skincare a qualquer momento com respostas personalizadas.",
    color: "bg-rose-soft",
  },
];

const steps = [
  { number: "01", title: "Responda o questionário", description: "Perguntas rápidas sobre sua pele, rotina e hábitos." },
  { number: "02", title: "Envie uma selfie", description: "Nossa IA analisa tipo de pele, tom, manchas e mais." },
  { number: "03", title: "Receba seu plano", description: "Rotina personalizada, paleta de cores e recomendações." },
  { number: "04", title: "Acompanhe sua evolução", description: "Ajuste automático e suporte contínuo com profissionais." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-soft text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Inteligência artificial para sua pele
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
              Sua pele merece{" "}
              <span className="text-primary">cuidado inteligente</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-sans">
              Análise de pele por IA, rotina personalizada de skincare e colorimetria —
              tudo em uma plataforma feita para valorizar a sua beleza natural.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <Link to="/signup">
                  Começar minha análise
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
                <a href="#features">Conhecer recursos</a>
              </Button>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground"
          >
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>Dados protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4" />
              <span>IA de última geração</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarCheck className="w-4 h-4" />
              <span>Acompanhamento profissional</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Tudo o que sua pele precisa
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              Uma plataforma completa que combina ciência, IA e personalização para o melhor cuidado com a sua pele.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-shadow group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-foreground/70" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              Em poucos passos, você recebe uma análise completa e personalizada.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
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

      {/* Professionals CTA */}
      <section id="professionals" className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
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
            <Button size="lg" className="text-base px-8 py-6" asChild>
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
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif text-xs font-bold">D</span>
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">DermAI</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              © 2026 DermAI. Todos os direitos reservados.
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
