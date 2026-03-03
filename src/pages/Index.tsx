import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Camera, FlaskConical, Sparkles, ArrowRight, Star, Users, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import InstitutionalFooter from "@/components/InstitutionalFooter";
import { useBrandingContext } from "@/contexts/BrandingContext";
import heroCream from "@/assets/hero-cream.jpg";

const steps = [
  {
    icon: Camera,
    number: "1",
    title: "Análise Instantânea",
    description: "Envie uma foto em alta resolução. Nossa IA identifica mais de 40 condições de pele, desde textura até pigmentação.",
  },
  {
    icon: FlaskConical,
    number: "2",
    title: "Diagnóstico Profundo",
    description: "Redes neurais comparam seu perfil com milhões de registros dermatológicos para precisão clínica.",
  },
  {
    icon: Sparkles,
    number: "3",
    title: "Rotina Personalizada",
    description: "Receba uma rotina AM/PM com produtos escolhidos especificamente para as necessidades da sua pele.",
  },
];

const stats = [
  { value: "50.000+", label: "Perfis analisados" },
  { value: "98%", label: "Precisão da IA" },
  { value: "4.9", label: "Avaliação média", icon: Star },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
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

      {/* Hero — split layout */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Precisão com IA
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.1] mb-6">
                Sua pele,{" "}
                <span className="text-primary italic">cientificamente</span>{" "}
                compreendida.
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                Análise avançada por IA aliada à expertise dermatológica.
                Receba uma rotina de skincare personalizada baseada no seu perfil
                único em segundos.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button size="lg" className="px-8 py-6 text-base shadow-lg shadow-primary/20" asChild>
                  <Link to="/signup">
                    Analisar minha pele
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 text-base" asChild>
                  <Link to="/about">Saiba mais</Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {["🌸", "💜", "🌿", "✨"].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm border-2 border-background">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    "Minha pele clareou em 3 semanas com a rotina recomendada."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right — hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img src={heroCream} alt="Skincare cream texture" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-10 border-y border-border/50">
        <div className="container mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6">
            Tecnologia reconhecida por especialistas
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 text-muted-foreground/40">
            {["La Roche-Posay", "L'Oréal Paris", "CeraVe", "Vichy", "Neutrogena"].map((brand) => (
              <span key={brand} className="font-serif text-xl md:text-2xl font-semibold tracking-tight">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Como a IA {branding.site_name} funciona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Três passos simples para desbloquear o segredo da sua pele perfeita através de ciência e tecnologia.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-soft mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {step.number}. {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with analysis preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-primary/5 border border-primary/10 p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Left */}
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight mb-4">
                  Pronta para sua melhor pele?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Junte-se a mais de 50.000 usuários que confiam na IA do {branding.site_name} para suas decisões diárias de skincare. Faça sua análise gratuita agora.
                </p>
                <Button size="lg" className="px-8 py-6 text-base shadow-lg shadow-primary/20" asChild>
                  <Link to="/signup">
                    Começar análise grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Right — analysis mockup */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Análise em andamento</span>
                </div>
                <p className="font-serif font-semibold text-foreground mb-5">Escaneando...</p>
                <div className="space-y-4">
                  {[
                    { label: "Nível de Hidratação", value: "82%", width: "82%" },
                    { label: "Elasticidade", value: "Alta", width: "90%" },
                    { label: "Risco de Pigmentação", value: "Baixo", width: "25%" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: item.width }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <InstitutionalFooter />
    </div>
  );
};

export default Index;
