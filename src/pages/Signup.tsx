import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BrandingLogo from "@/components/BrandingLogo";
import { useBrandingContext } from "@/contexts/BrandingContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [accountType, setAccountType] = useState("consumer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { branding } = useBrandingContext();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Senha muito curta", description: "A senha deve ter no mínimo 6 caracteres." });
      return;
    }
    if (!phone.trim()) {
      toast({ variant: "destructive", title: "Telefone obrigatório", description: "Informe seu telefone." });
      return;
    }
    if (accountType === "professional" && !clinicName.trim()) {
      toast({ variant: "destructive", title: "Nome da clínica obrigatório", description: "Informe o nome da clínica ou consultório." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          account_type: accountType,
          phone,
          ...(accountType === "professional" ? { clinic_name: clinicName } : {}),
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao criar conta", description: error.message });
    } else if (accountType === "professional") {
      toast({
        title: "Cadastro recebido!",
        description: "Sua conta profissional será ativada após aprovação do administrador. Você receberá um e-mail de confirmação.",
      });
      navigate("/login");
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-[10%] w-72 h-72 rounded-full bg-sage/40 blur-3xl" />
        <div className="absolute bottom-10 left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <Card className="shadow-lg border-border/50">
          <form onSubmit={handleSignup}>
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mx-auto mb-2"
              >
                <BrandingLogo size="lg" />
              </motion.div>
              <CardTitle className="font-serif text-2xl">Criar sua conta</CardTitle>
              <CardDescription className="font-sans">Comece sua jornada de cuidado com a pele</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-3">
                <Label>Tipo de conta</Label>
                <RadioGroup value={accountType} onValueChange={setAccountType} className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${accountType === "consumer" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                    <RadioGroupItem value="consumer" />
                    <div>
                      <p className="text-sm font-medium">Paciente</p>
                      <p className="text-xs text-muted-foreground">Uso pessoal</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${accountType === "professional" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                    <RadioGroupItem value="professional" />
                    <div>
                      <p className="text-sm font-medium">Clínica / Médico</p>
                      <p className="text-xs text-muted-foreground">Requer aprovação</p>
                    </div>
                  </label>
                </RadioGroup>
                <AnimatePresence>
                  {accountType === "professional" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="clinicName">Nome da Clínica / Consultório</Label>
                        <Input
                          id="clinicName"
                          placeholder="Ex: Clínica Derma Care"
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 border border-amber-200">
                        ⚠️ Contas profissionais precisam ser aprovadas pelo administrador antes de acessar a plataforma.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {accountType === "professional" ? "Solicitar cadastro" : "Criar conta"}
              </Button>
              <p className="text-sm text-muted-foreground font-sans">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:underline">Entrar</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
