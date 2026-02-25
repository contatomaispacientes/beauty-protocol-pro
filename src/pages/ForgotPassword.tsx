import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        <Card>
          {sent ? (
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-2">
                <Mail className="w-5 h-5 text-primary-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">E-mail enviado!</CardTitle>
              <CardDescription className="font-sans">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
          ) : (
            <form onSubmit={handleReset}>
              <CardHeader className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-2">
                  <span className="text-primary-foreground font-serif text-sm font-bold">D</span>
                </div>
                <CardTitle className="font-serif text-2xl">Esqueceu sua senha?</CardTitle>
                <CardDescription className="font-sans">
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enviar link de redefinição
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
