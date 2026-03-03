import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FlaskConical, Baby, ShieldCheck, AlertTriangle, Droplets, Leaf, Camera, Upload, X, Image as ImageIcon } from "lucide-react";
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
  image_url?: string;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo de 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !imageBase64) return;
    setLoading(true);
    setResult(null);

    try {
      const body: Record<string, string> = {};
      if (query.trim()) body.productName = query.trim();
      if (imageBase64) body.productImage = imageBase64;

      const { data, error } = await supabase.functions.invoke("analyze-product", { body });

      if (error) {
        toast({ title: "Erro na análise", description: error.message, variant: "destructive" });
      } else if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        const resultData = data as ProductResult;
        if (imagePreview) resultData.image_url = imagePreview;
        setResult(resultData);
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
          Insira o nome ou envie uma foto do produto. A IA analisará ingredientes, segurança e compatibilidade.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ex: Sérum Hidratante La Roche-Posay Hyalu B5"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || (!query.trim() && !imageBase64)}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Image upload area */}
          {!imagePreview ? (
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar foto
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Tirar foto
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                <img src={imagePreview} alt="Produto" className="w-full max-h-64 object-contain" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 rounded-full"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </form>

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Analisando produto com IA...</p>
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
                <div className="flex items-start gap-4">
                  {/* Product image */}
                  {result.image_url ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                      <img src={result.image_url} alt={result.product_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-peach flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-8 h-8 text-foreground/50" />
                    </div>
                  )}
                  <div className="min-w-0">
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
