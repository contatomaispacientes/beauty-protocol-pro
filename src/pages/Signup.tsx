import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("consumer");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-serif text-sm font-bold">D</span>
            </div>
            <CardTitle className="font-serif text-2xl">Criar sua conta</CardTitle>
            <CardDescription className="font-sans">Comece sua jornada de cuidado com a pele</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label>Tipo de conta</Label>
              <RadioGroup value={accountType} onValueChange={setAccountType} className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${accountType === "consumer" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="consumer" />
                  <div>
                    <p className="text-sm font-medium">Consumidor</p>
                    <p className="text-xs text-muted-foreground">Uso pessoal</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${accountType === "professional" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="professional" />
                  <div>
                    <p className="text-sm font-medium">Profissional</p>
                    <p className="text-xs text-muted-foreground">Estética/Derma</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full">Criar conta</Button>
            <p className="text-sm text-muted-foreground font-sans">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
