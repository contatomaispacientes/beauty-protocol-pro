import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  FlaskConical,
  Loader2,
  Plus,
  Check,
  Share2,
  Star,
  Baby,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Leaf,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProductReviews from "@/components/ProductReviews";

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  avg_rating: number | string | null;
  reviews_count: number | null;
}

interface Analysis {
  ingredients?: { name: string; purpose: string; suitability: string }[];
  safety?: Record<string, string>;
  compatibility_with_user?: { level: string; reason: string };
  verdict?: string;
}

const safetyTagConfig: { key: string; label: string; icon: JSX.Element }[] = [
  { key: "safe_for_pregnant", label: "Gestantes", icon: <Baby className="w-3 h-3" /> },
  { key: "contains_parabens", label: "Parabenos", icon: <AlertTriangle className="w-3 h-3" /> },
  { key: "suitable_for_atopic_dermatitis", label: "Derm. atópica", icon: <Droplets className="w-3 h-3" /> },
  { key: "suitable_for_sensitive_skin", label: "Pele sensível", icon: <ShieldCheck className="w-3 h-3" /> },
  { key: "suitable_for_children", label: "Uso infantil", icon: <Leaf className="w-3 h-3" /> },
];

const getSafetyVariant = (key: string, value: string): "default" | "secondary" | "destructive" | "outline" => {
  if (key === "contains_parabens") return value === "Sim" ? "destructive" : value === "Não" ? "default" : "secondary";
  return value === "Sim" ? "default" : value === "Não" ? "destructive" : "secondary";
};

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [inCabinet, setInCabinet] = useState(false);
  const [savingCabinet, setSavingCabinet] = useState(false);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      const { data: prod } = await supabase
        .from("products")
        .select("id,name,brand,category,image_url,avg_rating,reviews_count")
        .eq("id", productId)
        .maybeSingle();
      setProduct(prod as ProductRow | null);

      if (user) {
        // Latest analysis for enriched data
        const { data: hist } = await supabase
          .from("product_search_history")
          .select("analysis,image_url")
          .eq("user_id", user.id)
          .eq("product_name", prod?.name || "")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (hist?.analysis) setAnalysis(hist.analysis as unknown as Analysis);
        if (prod && !prod.image_url && (hist as any)?.image_url) {
          setProduct({ ...(prod as ProductRow), image_url: (hist as any).image_url });
        }

        // Cabinet state
        const { data: cab } = await supabase
          .from("user_products")
          .select("id")
          .eq("patient_id", user.id)
          .eq("product_id", productId)
          .maybeSingle();
        setInCabinet(!!cab);
      }
      setLoading(false);
    })();
  }, [productId, user]);

  const toggleCabinet = async () => {
    if (!product || !user) return;
    setSavingCabinet(true);
    if (inCabinet) {
      await supabase
        .from("user_products")
        .delete()
        .eq("patient_id", user.id)
        .eq("product_id", product.id);
      setInCabinet(false);
      toast({ title: "Removido do armário" });
    } else {
      const { error } = await supabase.from("user_products").insert({
        patient_id: user.id,
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category || "other",
        key_ingredients: analysis?.ingredients?.map((i) => i.name).join(", ") || null,
        moment: "both",
        notes: analysis?.verdict || null,
        image_url: product.image_url,
      });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        setInCabinet(true);
        toast({ title: "Adicionado ao armário ✨" });
      }
    }
    setSavingCabinet(false);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name || "Produto", url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copiado" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Produto">
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout title="Produto">
        <div className="max-w-lg mx-auto text-center py-16 space-y-3">
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </DashboardLayout>
    );
  }

  const avg = Number(product.avg_rating) || 0;
  const count = product.reviews_count || 0;

  return (
    <DashboardLayout title={product.name}>
      <div className="max-w-3xl mx-auto space-y-6 pb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        {/* Hero */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-b from-accent/20 to-background p-5 sm:p-6">
            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white/70 border border-border/60 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FlaskConical className="w-12 h-12 text-primary/50" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="bg-card rounded-2xl px-4 py-3 shadow-sm border border-border/40 inline-flex flex-col items-center min-w-[110px]">
                  <span className="text-2xl font-bold leading-none">
                    {avg > 0 ? avg.toFixed(1).replace(".", ",") : "—"}
                  </span>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${
                          n <= Math.round(avg)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {count} {count === 1 ? "avaliação" : "avaliações"}
                  </span>
                </div>
                {analysis?.compatibility_with_user && (
                  <Badge
                    variant={
                      analysis.compatibility_with_user.level === "Compatível"
                        ? "default"
                        : analysis.compatibility_with_user.level === "Não recomendado"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {analysis.compatibility_with_user.level} com seu perfil
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-5">
              {product.brand && (
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              )}
              <h1 className="font-serif text-2xl text-foreground leading-tight">{product.name}</h1>
              {product.category && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-5">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  document
                    .getElementById("reviews")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                <Star className="w-4 h-4 mr-2" /> Avaliar
              </Button>
              <Button
                variant={inCabinet ? "secondary" : "default"}
                className="rounded-full"
                onClick={toggleCabinet}
                disabled={savingCabinet}
              >
                {savingCabinet ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : inCabinet ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> No armário
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar ao armário
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={share}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* About the product */}
        {analysis && (
          <Card>
            <CardContent className="py-5 space-y-4">
              {analysis.compatibility_with_user?.reason && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                    Para o seu perfil
                  </p>
                  <p className="text-sm text-foreground">{analysis.compatibility_with_user.reason}</p>
                </div>
              )}
              {analysis.safety && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Segurança
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {safetyTagConfig.map((tag) => {
                      const value = analysis.safety?.[tag.key];
                      if (!value) return null;
                      return (
                        <Badge
                          key={tag.key}
                          variant={getSafetyVariant(tag.key, value)}
                          className="gap-1 text-xs py-1"
                        >
                          {tag.icon}
                          {tag.label}: {value}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              {analysis.ingredients && analysis.ingredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Princípios ativos
                  </p>
                  <div className="space-y-2">
                    {analysis.ingredients.map((ing, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm">{ing.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {ing.suitability}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ing.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.verdict && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-foreground">✅ Veredicto</p>
                  <p className="text-sm text-muted-foreground mt-1">{analysis.verdict}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div id="reviews">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;
