import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import InstitutionalFooter from "@/components/InstitutionalFooter";

const contactInfo = [
  { icon: Mail, label: "Email", value: "contato@dermai.com.br" },
  { icon: MapPin, label: "Localização", value: "São Paulo, SP — Brasil" },
  { icon: Clock, label: "Atendimento", value: "Seg-Sex, 9h às 18h" },
];

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Mensagem enviada com sucesso! Retornaremos em breve.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Fale Conosco
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Dúvidas, parcerias ou suporte? Estamos aqui para ajudar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 space-y-6"
            >
              {contactInfo.map((c) => (
                <div key={c.label} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-rose-soft flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-3"
            >
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required maxLength={255} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input id="subject" placeholder="Como podemos ajudar?" required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea id="message" placeholder="Descreva sua dúvida ou solicitação..." rows={5} required maxLength={1000} />
                </div>
                <Button type="submit" className="w-full py-5" disabled={loading}>
                  {loading ? "Enviando..." : (
                    <>
                      Enviar mensagem
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <InstitutionalFooter />
    </div>
  );
};

export default Contact;
