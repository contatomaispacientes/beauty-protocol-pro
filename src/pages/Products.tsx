import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FlaskConical, Baby, ShieldCheck, AlertTriangle, Droplets, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductSafety {
  safe_for_pregnant: string;
  contains_parabens: string;
  suitable_for_atopic_dermatitis: string;
  suitable_for_sensitive_skin: string;
  suitable_for_children: string;
}

interface ProductIngredient {
  name: string;
  purpose: string;
  suitability: string;
}

interface ProductResult {
  product_name: string;
  brand: string;
  product_not_found: boolean;
  ingredients: ProductIngredient[];
  safety: ProductSafety;
  verdict: string;
}

const safetyTagConfig: { key: keyof ProductSafety; label: string; icon: React.ReactNode }[] = [
  { key: "safe_for_pregnant", label: "Gestantes", icon: <Baby className="w-3 h-3" /> },
  { key: "contains_parabens", label: "Parabenos", icon: <AlertTriangle className="w-3 h-3" /> },
  { key: "suitable_for_atopic_dermatitis", label: "Dermatite Atópica", icon: <Droplets className="w-3 h-3" /> },
  { key: "suitable_for_sensitive_skin", label: "Pele Sensível", icon: <ShieldCheck className="w-3 h-3" /> },
  { key: "suitable_for_children", label: "Uso Infantil", icon: <Leaf className="w-3 h-3" /> },
];

const getSafetyVariant = (key: keyof ProductSafety, value: string): "default" | "secondary" | "destructive" | "outline" => {
  if (key === "contains_parabens") {
    return value === "Sim" ? "destructive" : value === "Não" ? "default" : "secondary";
  }
  return value === "Sim" ? "default" : value === "Não" ? "destructive" : "secondary";
};

const Products = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { productName: query.trim() },
      });

      if (error) {
        toast({ title: "Erro na análise", description: error.message, variant: "destructive" });
      } else if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        setResult(data as ProductResult);
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Análise de Produtos">
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-muted-foreground">
          Insira o nome de um produto cosmético e a IA analisará seus ingredientes, segurança e compatibilidade.
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

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Analisando ingredientes com IA...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-in">
            {result.product_not_found && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="py-4">
                  <p className="text-sm text-destructive font-medium">⚠️ Produto não identificado com precisão. Os dados abaixo são aproximados.</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-peach flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-lg">{result.product_name}</CardTitle>
                    <CardDescription>{result.brand}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Safety Tags */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Informações de Segurança</p>
                  <div className="flex flex-wrap gap-2">
                    {safetyTagConfig.map((tag) => {
                      const value = result.safety[tag.key];
                      return (
                        <Badge key={tag.key} variant={getSafetyVariant(tag.key, value)} className="gap-1 text-xs py-1">
                          {tag.icon}
                          {tag.label}: {value}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Princípios Ativos</p>
                  <div className="space-y-2">
                    {result.ingredients.map((ing, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{ing.name}</p>
                          <Badge variant="secondary" className="text-xs">{ing.suitability}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ing.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm font-medium text-foreground">✅ Veredicto</p>
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
