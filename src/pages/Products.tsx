import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FlaskConical } from "lucide-react";

interface ProductResult {
  name: string;
  ingredients: { name: string; purpose: string; suitability: string }[];
  verdict: string;
}

const Products = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    // Placeholder — will connect to Lovable AI
    await new Promise((r) => setTimeout(r, 1500));
    setResult({
      name: query,
      ingredients: [
        { name: "Ácido Hialurônico", purpose: "Hidratação profunda e retenção de água na pele", suitability: "Todos os tipos de pele" },
        { name: "Niacinamida (Vitamina B3)", purpose: "Controle de oleosidade e redução de poros", suitability: "Pele oleosa e mista" },
        { name: "Pantenol", purpose: "Regeneração e calmante da pele", suitability: "Pele sensível e seca" },
      ],
      verdict: "Adequado para o seu perfil de pele mista. Os ingredientes são compatíveis e não apresentam contraindicações com sua rotina atual.",
    });
    setLoading(false);
  };

  return (
    <DashboardLayout title="Análise de Produtos">
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-muted-foreground">
          Insira o nome de um produto cosmético e a IA identificará os principais princípios ativos.
        </p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Ex: Sérum Hidratante La Roche-Posay Hyalu B5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-peach flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-lg">{result.name}</CardTitle>
                    <CardDescription>Princípios ativos identificados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.ingredients.map((ing, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{ing.name}</p>
                      <Badge variant="secondary" className="text-xs">{ing.suitability}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ing.purpose}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm font-medium text-foreground">✅ Veredicto para sua pele</p>
                <p className="text-sm text-muted-foreground mt-1">{result.verdict}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
