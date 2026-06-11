import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BrandingLogo from "@/components/BrandingLogo";
import { useBrandingContext } from "@/contexts/BrandingContext";
import { useIsPWA } from "@/hooks/useIsPWA";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { branding } = useBrandingContext();
  const isPWA = useIsPWA();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      toast({ variant: "destructive", title: "Erro ao entrar", description: error.message });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved, account_type")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (profile && !profile.is_approved) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Conta pendente de aprovação",
        description: "Sua conta profissional ainda não foi aprovada pelo administrador. Aguarde a liberação.",
      });
      return;
    }

    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background px-6 relative overflow-hidden"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 1.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] w-72 h-72 rounded-full bg-lavender/30 blur-3xl" />
        <div className="absolute top-1/3 left-[-15%] w-64 h-64 rounded-full bg-sage/30 blur-3xl" />
      </div>

      {/* Back link (hidden in PWA) */}
      {!isPWA && (
        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>
      )}

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo + greeting */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
              className="relative inline-flex items-center justify-center mb-6"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
              <div className="relative">
                <BrandingLogo size="lg" />
              </div>
            </motion.div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground mt-2 font-sans">
              Entre na sua conta {branding.site_name}
            </p>
          </div>

          {/* Glass card */}
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-2xl p-6 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">E-mail</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <Button className="w-full h-12 text-base font-medium mt-2" type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Entrar
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline font-sans">
                Esqueci minha senha
              </Link>
            </div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground font-sans mt-6"
          >
            Não tem conta?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Criar conta
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
