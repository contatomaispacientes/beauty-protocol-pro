import { motion } from "framer-motion";
import { Heart, Brain, Shield, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import InstitutionalFooter from "@/components/InstitutionalFooter";
import { useBrandingContext } from "@/contexts/BrandingContext";

const values = [
  {
    icon: Brain,
    title: "Ciência em primeiro lugar",
    description: "Cada recomendação é baseada em evidências dermatológicas e alimentada por IA treinada com milhões de dados clínicos.",
  },
  {
    icon: Heart,
    title: "Cuidado personalizado",
    description: "Acreditamos que não existe pele igual. Sua rotina deve ser tão única quanto você.",
  },
  {
    icon: Shield,
    title: "Privacidade e segurança",
    description: "Seus dados e fotos são protegidos com criptografia de ponta e nunca compartilhados com terceiros.",
  },
  {
    icon: Users,
    title: "Acessibilidade",
    description: "Dermatologia de qualidade não deve ser um luxo. Democratizamos o acesso ao cuidado inteligente.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const About = () => {
  const { branding } = useBrandingContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Sobre o {branding.site_name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Nascemos da intersecção entre inteligência artificial e dermatologia para criar
              a plataforma de skincare mais precisa e acessível do Brasil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Nossa Missão</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Transformar o cuidado com a pele através de tecnologia acessível. Combinamos
                visão computacional, aprendizado de máquina e conhecimento dermatológico para
                oferecer recomendações precisas e personalizadas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nosso objetivo é que cada pessoa tenha acesso a uma análise dermatológica
                de qualidade, independente de onde esteja.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: "50K+", label: "Análises realizadas" },
                { value: "98%", label: "Precisão da IA" },
                { value: "200+", label: "Profissionais parceiros" },
                { value: "4.9", label: "Nota dos usuários" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl p-5 border border-border/50 text-center">
                  <p className="text-2xl font-serif font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-serif font-bold text-foreground text-center mb-12"
          >
            Nossos Valores
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={itemVariants}
                className="bg-card rounded-xl p-6 border border-border/50 flex gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-soft flex-shrink-0 flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <InstitutionalFooter />
    </div>
  );
};

export default About;
