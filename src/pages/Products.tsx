import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FlaskConical, Baby, ShieldCheck, AlertTriangle, Droplets, Leaf, Camera, Upload, X, History, Plus, Check, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProductSafety {
  safe_for_pregnant: string;
  contains_parabens: string;
  suitable_for_atopic_dermatitis: string;
  suitable_for_sensitive_skin: string;
  suitable_for_children: string;
}
interface ProductIngredient { name: string; purpose: string; suitability: string; }
interface Compatibility { level: string; reason: string; }
interface ProductResult {
  product_name: string;
  brand: string;
  product_not_found: boolean;
  category?: string;
  ingredients: ProductIngredient[];
  safety: ProductSafety;
  compatibility_with_user?: Compatibility;
  verdict: string;
  image_url?: string;
}

interface HistoryItem {
  id: string;
  product_name: string;
  brand: string | null;
  image_url: string | null;
  analysis: ProductResult;
  created_at: string;
}

const safetyTagConfig: { key: keyof ProductSafety; label: string; icon: JSX.Element }[] = [
  { key: "safe_for_pregnant", label: "Gestantes", icon: <Baby className="w-3 h-3" /> },
  { key: "contains_parabens", label: "Parabenos", icon: <AlertTriangle className="w-3 h-3" /> },
  { key: "suitable_for_atopic_dermatitis", label: "Derm. atópica", icon: <Droplets className="w-3 h-3" /> },
  { key: "suitable_for_sensitive_skin", label: "Pele sensível", icon: <ShieldCheck className="w-3 h-3" /> },
  { key: "suitable_for_children", label: "Uso infantil", icon: <Leaf className="w-3 h-3" /> },
];

const getSafetyVariant = (key: keyof ProductSafety, value: string): "default" | "secondary" | "destructive" | "outline" => {
  if (key === "contains_parabens") return value === "Sim" ? "destructive" : value === "Não" ? "default" : "secondary";
  return value === "Sim" ? "default" : value === "Não" ? "destructive" : "secondary";
};

const compatVariant = (level?: string) =>
  level === "Compatível" ? "default" : level === "Não recomendado" ? "destructive" : "secondary";

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [addedToCabinet, setAddedToCabinet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) loadHistory(); }, [user]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("product_search_history")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(((data as unknown) as HistoryItem[]) || []);
  };

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

  const upsertProduct = async (r: ProductResult): Promise<string | null> => {
    if (r.product_not_found || !r.product_name) return null;
    const key = `${(r.brand || "").trim().toLowerCase()}|${r.product_name.trim().toLowerCase()}`;
    if (!key || key === "|") return null;
    const { data, error } = await supabase
      .from("products")
      .upsert(
        {
          normalized_key: key,
          name: r.product_name,
          brand: r.brand || null,
          category: r.category || null,
          image_url: r.image_url || null,
        },
        { onConflict: "normalized_key" },
      )
      .select("id")
      .single();
    if (error) return null;
    return data?.id ?? null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !imageBase64) return;
    setLoading(true);
    setResult(null);
    setProductId(null);
    setAddedToCabinet(false);

    try {
      const body: Record<string, string> = {};
      if (query.trim()) body.productName = query.trim();
      if (imageBase64) body.productImage = imageBase64;

      const { data, error } = await supabase.functions.invoke("analyze-product", { body });

      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      if (data?.error) { toast({ title: "Erro", description: data.error, variant: "destructive" }); return; }

      const resultData = data as ProductResult;

      // Fetch official product photo if user didn't upload one and product was identified
      if (!imagePreview && !resultData.product_not_found && resultData.product_name) {
        try {
          const { data: imgData } = await supabase.functions.invoke("fetch-product-image", {
            body: { productName: resultData.product_name, brand: resultData.brand },
          });
          if (imgData?.image_url) resultData.image_url = imgData.image_url;
        } catch { /* optional */ }
      } else if (imagePreview) {
        resultData.image_url = imagePreview;
      }

      setResult(resultData);
      const pid = await upsertProduct(resultData);
      setProductId(pid);

      // Save to history
      if (user) {
        await supabase.from("product_search_history").insert({
          user_id: user.id,
          product_name: resultData.product_name,
          brand: resultData.brand,
          image_url: resultData.image_url || null,
          analysis: resultData as any,
        });
        loadHistory();
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addToCabinet = async () => {
    if (!result || !user) return;
    const { error } = await supabase.from("user_products").insert({
      patient_id: user.id,
      name: result.product_name,
      brand: result.brand || null,
      category: result.category || "other",
      key_ingredients: result.ingredients?.map((i) => i.name).join(", ") || null,
      moment: "both",
      notes: result.verdict || null,
      image_url: result.image_url || null,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return;
    }
    setAddedToCabinet(true);
    toast({ title: "Adicionado ao armário ✨" });
  };

  const openFromHistory = async (h: HistoryItem) => {
    const merged = { ...h.analysis, image_url: h.image_url || h.analysis.image_url };
    setResult(merged);
    setQuery(h.product_name);
    setAddedToCabinet(false);
    setProductId(null);
    const pid = await upsertProduct(merged);
    setProductId(pid);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFromHistory = async (id: string) => {
    await supabase.from("product_search_history").delete().eq("id", id);
    loadHistory();
  };

  return (
    <DashboardLayout title="Análise de Produtos">
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">
          Insira o nome ou envie uma foto do produto. A IA analisa ingredientes, segurança e compatibilidade com seu perfil.
        </p>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Sérum La Roche-Posay Hyalu B5"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || (!query.trim() && !imageBase64)}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {!imagePreview ? (
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
              <Button type="button" variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Enviar foto
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" /> Tirar foto
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                <img src={imagePreview} alt="Produto" className="w-full max-h-64 object-contain" />
              </div>
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 w-8 h-8 rounded-full" onClick={clearImage}>
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
                <CardContent className="py-3">
                  <p className="text-sm text-destructive font-medium">⚠️ Produto não identificado com precisão. Dados aproximados.</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {result.image_url ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                      <img src={result.image_url} alt={result.product_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-8 h-8 text-primary/50" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-serif text-lg">{result.product_name}</CardTitle>
                    <CardDescription>{result.brand}</CardDescription>
                    {result.compatibility_with_user && (
                      <Badge variant={compatVariant(result.compatibility_with_user.level)} className="mt-2">
                        {result.compatibility_with_user.level}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.compatibility_with_user?.reason && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Para o seu perfil</p>
                    <p className="text-sm text-foreground">{result.compatibility_with_user.reason}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Segurança</p>
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

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Princípios ativos</p>
                  <div className="space-y-2">
                    {result.ingredients.map((ing, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm">{ing.name}</p>
                          <Badge variant="secondary" className="text-xs">{ing.suitability}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ing.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={addToCabinet}
                  disabled={addedToCabinet}
                  className="w-full"
                  variant={addedToCabinet ? "secondary" : "default"}
                >
                  {addedToCabinet ? <><Check className="w-4 h-4 mr-2" /> Adicionado ao armário</> : <><Plus className="w-4 h-4 mr-2" /> Adicionar ao meu armário</>}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm font-medium text-foreground">✅ Veredicto</p>
                <p className="text-sm text-muted-foreground mt-1">{result.verdict}</p>
              </CardContent>
            </Card>

            {productId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/produtos/${productId}`)}
              >
                <Star className="w-4 h-4 mr-2" />
                Ver avaliações da comunidade
              </Button>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pesquisas recentes</h2>
            </div>
            <div className="grid gap-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-card border border-border/60 rounded-xl">
                  <button onClick={() => openFromHistory(h)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {h.image_url ? (
                      <img src={h.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="w-4 h-4 text-primary/60" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{h.product_name}</p>
                      {h.brand && <p className="text-xs text-muted-foreground truncate">{h.brand}</p>}
                    </div>
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => removeFromHistory(h.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
