import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, Globe, Tag, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const seasons = {
  Primavera: { colors: ["#F4A460", "#FFB6C1", "#FFDAB9", "#FF6347", "#FFD700", "#FAFAD2", "#98FB98", "#87CEEB"], description: "Tons quentes e vibrantes que refletem a energia e frescor da estação." },
  "Verão": { colors: ["#B0C4DE", "#DDA0DD", "#C0C0C0", "#778899", "#ADD8E6", "#E6E6FA", "#F0E68C", "#FFDEAD"], description: "Tons frios e suaves, com nuances delicadas e elegantes." },
  Outono: { colors: ["#8B4513", "#D2691E", "#CD853F", "#B8860B", "#556B2F", "#8B0000", "#DAA520", "#A0522D"], description: "Tons terrosos e profundos, ricos e acolhedores." },
  Inverno: { colors: ["#000080", "#800020", "#2F4F4F", "#4B0082", "#C0C0C0", "#FFFFFF", "#DC143C", "#191970"], description: "Tons intensos e contrastantes, dramáticos e sofisticados." },
};

type SeasonKey = keyof typeof seasons;

interface MakeupProduct {
  brand: string;
  product_name: string;
  shade: string;
  origin: string;
  price_range: string;
}

interface MakeupCategory {
  category: string;
  products: MakeupProduct[];
}

const originBadgeVariant = (origin: string): "default" | "secondary" | "outline" => {
  if (origin === "K-Beauty") return "default";
  if (origin === "Importado") return "secondary";
  return "outline";
};

const skinConcerns = [
  "Pele oleosa", "Pele seca", "Acne / espinhas", "Manchas", "Rosácea",
  "Poros dilatados", "Sensibilidade", "Olheiras",
];

const priceOptions = [
  { value: "all", label: "Todos os preços" },
  { value: "$", label: "$ — Econômico" },
  { value: "$$", label: "$$ — Intermediário" },
  { value: "$$$", label: "$$$ — Premium" },
];

const Colorimetry = () => {
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey>("Outono");
  const [skinTone, setSkinTone] = useState("médio");
  const [skinSubtone, setSkinSubtone] = useState("quente");
  const [priceRange, setPriceRange] = useState("all");
  const [observations, setObservations] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<MakeupCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  const season = seasons[selectedSeason];

  const fetchRecommendations = async () => {
    setLoading(true);
    setRecommendations([]);
    try {
      const { data, error } = await supabase.functions.invoke("makeup-recommendations", {
        body: {
          season: selectedSeason,
          skinTone,
          skinSubtone,
          priceRange: priceRange !== "all" ? priceRange : undefined,
          concerns: selectedConcerns,
          observations: observations.trim() || undefined,
        },
      });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        setRecommendations(data.recommendations || []);
      }
    } catch {
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Colorimetria e Indicações de Maquiagem">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Season Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Sua Estação: {selectedSeason}</CardTitle>
            <CardDescription>{season.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {season.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-lg shadow-sm border border-border" style={{ backgroundColor: color }} />
                  <span className="text-xs text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full palette */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Paleta Completa por Estação</CardTitle>
            <CardDescription>Selecione sua estação para personalizar recomendações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(Object.entries(seasons) as [SeasonKey, typeof seasons[SeasonKey]][]).map(([name, s]) => (
              <button
                key={name}
                onClick={() => setSelectedSeason(name)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${name === selectedSeason ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
              >
                <p className={`font-medium text-sm mb-2 ${name === selectedSeason ? "text-primary" : "text-foreground"}`}>
                  {name} {name === selectedSeason && "⭐"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.colors.map((color, i) => (
                    <div key={i} className="w-10 h-10 rounded-md shadow-sm border border-border" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recomendações de Maquiagem com IA
            </CardTitle>
            <CardDescription>
              Produtos reais (nacionais, importados e K-Beauty) personalizados para seu perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Tom de pele</Label>
                <Select value={skinTone} onValueChange={setSkinTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["muito claro", "claro", "médio", "moreno", "escuro"].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subtom</Label>
                <Select value={skinSubtone} onValueChange={setSkinSubtone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["quente", "frio", "neutro", "oliva"].map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faixa de preço</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priceOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Concerns & Observations */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Preocupações com a pele
                </Label>
                <div className="flex flex-wrap gap-2">
                  {skinConcerns.map((concern) => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedConcerns.includes(concern)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações pessoais (opcional)</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Tenho preferência pela marca Vult, minha pele está muito oleosa na zona T, prefiro produtos veganos, estou com muita espinha no queixo..."
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{observations.length}/500 caracteres</p>
              </div>
            </div>

            <div>
              <Button onClick={fetchRecommendations} disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Buscar Produtos Personalizados
              </Button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Buscando produtos reais com IA...</p>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-6 mt-4 animate-fade-in">
                {recommendations.map((cat, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-sm mb-3 text-foreground">{cat.category}</p>
                    <div className="grid gap-2">
                      {cat.products.map((p, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{p.brand} — {p.product_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Tom: {p.shade}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge variant={originBadgeVariant(p.origin)} className="text-xs gap-1">
                              <Globe className="w-3 h-3" />
                              {p.origin}
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                              <Tag className="w-3 h-3" />
                              {p.price_range}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Colorimetry;
