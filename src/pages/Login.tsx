import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BrandingLogo from "@/components/BrandingLogo";
import { useBrandingContext } from "@/contexts/BrandingContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { branding } = useBrandingContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      toast({ variant: "destructive", title: "Erro ao entrar", description: error.message });
      return;
    }

    // Check if user is approved
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2">
                <BrandingLogo size="lg" />
              </div>
              <CardTitle className="font-serif text-2xl">Bem-vindo de volta</CardTitle>
              <CardDescription className="font-sans">Entre na sua conta {branding.site_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Entrar
              </Button>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline font-sans">
                Esqueci minha senha
              </Link>
              <p className="text-sm text-muted-foreground font-sans">
                Não tem conta?{" "}
                <Link to="/signup" className="text-primary hover:underline">Criar conta</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
