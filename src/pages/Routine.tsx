import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon } from "lucide-react";

const morningRoutine = [
  { step: 1, product: "Sabonete Facial Suave", category: "Limpeza", priority: "Essencial", description: "Limpar suavemente sem ressecar" },
  { step: 2, product: "Sérum de Vitamina C", category: "Tratamento", priority: "Recomendado", description: "Antioxidante e iluminador" },
  { step: 3, product: "Hidratante com Ácido Hialurônico", category: "Hidratação", priority: "Essencial", description: "Hidratação profunda sem oleosidade" },
  { step: 4, product: "Protetor Solar FPS 50", category: "Proteção", priority: "Essencial", description: "Proteção UVA/UVB diária" },
];

const nightRoutine = [
  { step: 1, product: "Óleo de Limpeza", category: "Limpeza", priority: "Recomendado", description: "Remove maquiagem e protetor solar" },
  { step: 2, product: "Sabonete Facial", category: "Limpeza", priority: "Essencial", description: "Segunda limpeza para pele limpa" },
  { step: 3, product: "Sérum de Retinol", category: "Tratamento", priority: "Recomendado", description: "Renovação celular e anti-idade" },
  { step: 4, product: "Creme Noturno Nutritivo", category: "Hidratação", priority: "Essencial", description: "Nutrição e reparação noturna" },
];

const Routine = () => {
  return (
    <DashboardLayout title="Minha Rotina de Skincare">
      <div className="max-w-4xl mx-auto space-y-8">
        <p className="text-muted-foreground">
          Rotina personalizada com base no seu perfil dermatológico. Ajustes automáticos serão feitos conforme sua evolução.
        </p>

        {/* Morning */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Rotina Matinal</h2>
          </div>
          <div className="space-y-3">
            {morningRoutine.map((item) => (
              <Card key={item.step}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-full bg-peach flex items-center justify-center flex-shrink-0">
                    <span className="font-serif font-bold text-foreground/70">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{item.product}</p>
                      <Badge variant={item.priority === "Essencial" ? "default" : "secondary"} className="text-xs">{item.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.category} — {item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Night */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-lavender" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Rotina Noturna</h2>
          </div>
          <div className="space-y-3">
            {nightRoutine.map((item) => (
              <Card key={item.step}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-full bg-lavender flex items-center justify-center flex-shrink-0">
                    <span className="font-serif font-bold text-foreground/70">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{item.product}</p>
                      <Badge variant={item.priority === "Essencial" ? "default" : "secondary"} className="text-xs">{item.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.category} — {item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Esta rotina é gerada por IA e não substitui orientação dermatológica profissional.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Routine;
