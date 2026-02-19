import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, ChevronDown, ChevronUp, ExternalLink, Filter, Leaf, Heart, ShieldCheck, Pill } from "lucide-react";

type Tag = "vegano" | "cruelty-free" | "farmácia" | "orgânico" | "dermatológico";
type Origin = "nacional" | "internacional";
type PriceRange = "econômico" | "intermediário" | "premium";

interface Product {
  name: string;
  brand: string;
  origin: Origin;
  price: string;
  priceRange: PriceRange;
  tags: Tag[];
  priority: "alta" | "média" | "baixa";
  link?: string;
}

interface RoutineStep {
  step: number;
  category: string;
  description: string;
  icon: string;
  products: Product[];
}

const morningSteps: RoutineStep[] = [
  {
    step: 1, category: "Limpeza", description: "Limpar suavemente sem ressecar a pele", icon: "🧴",
    products: [
      { name: "Gel de Limpeza Facial", brand: "Cerave", origin: "internacional", price: "R$ 55", priceRange: "intermediário", tags: ["cruelty-free", "dermatológico"], priority: "alta" },
      { name: "Sabonete Facial Suave", brand: "La Roche-Posay", origin: "internacional", price: "R$ 70", priceRange: "intermediário", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Gel de Limpeza Vitamina C", brand: "Principia", origin: "nacional", price: "R$ 45", priceRange: "econômico", tags: ["vegano", "cruelty-free"], priority: "média" },
      { name: "Sabonete Líquido Facial", brand: "Vult", origin: "nacional", price: "R$ 25", priceRange: "econômico", tags: ["vegano", "cruelty-free"], priority: "baixa" },
    ],
  },
  {
    step: 2, category: "Tratamento", description: "Sérum antioxidante e iluminador", icon: "✨",
    products: [
      { name: "Sérum Vitamina C 10%", brand: "La Roche-Posay", origin: "internacional", price: "R$ 130", priceRange: "premium", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Sérum Vitamina C Pura 20%", brand: "Principia", origin: "nacional", price: "R$ 65", priceRange: "intermediário", tags: ["vegano", "cruelty-free"], priority: "alta" },
      { name: "C E Ferulic Sérum", brand: "SkinCeuticals", origin: "internacional", price: "R$ 380", priceRange: "premium", tags: ["dermatológico"], priority: "média" },
      { name: "Sérum Vitamina C", brand: "Tracta", origin: "nacional", price: "R$ 30", priceRange: "econômico", tags: ["vegano", "cruelty-free"], priority: "baixa" },
    ],
  },
  {
    step: 3, category: "Hidratação", description: "Hidratação profunda sem oleosidade", icon: "💧",
    products: [
      { name: "Moisturizing Cream", brand: "Cerave", origin: "internacional", price: "R$ 65", priceRange: "intermediário", tags: ["cruelty-free", "dermatológico"], priority: "alta" },
      { name: "Hydraphase Intense", brand: "La Roche-Posay", origin: "internacional", price: "R$ 95", priceRange: "premium", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Hidratante Facial HA", brand: "Principia", origin: "nacional", price: "R$ 55", priceRange: "intermediário", tags: ["vegano", "cruelty-free"], priority: "média" },
      { name: "Gel Hidratante Facial", brand: "Natura", origin: "nacional", price: "R$ 40", priceRange: "econômico", tags: ["vegano", "cruelty-free", "orgânico"], priority: "baixa" },
    ],
  },
  {
    step: 4, category: "Proteção Solar", description: "Proteção UVA/UVB diária obrigatória", icon: "☀️",
    products: [
      { name: "Anthelios Airlicium FPS 70", brand: "La Roche-Posay", origin: "internacional", price: "R$ 90", priceRange: "premium", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "UV Pigment Control FPS 80", brand: "Eucerin", origin: "internacional", price: "R$ 85", priceRange: "intermediário", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Protetor Solar FPS 50 Toque Seco", brand: "Mantecorp", origin: "nacional", price: "R$ 55", priceRange: "intermediário", tags: ["dermatológico", "farmácia"], priority: "média" },
      { name: "Protetor Solar Facial FPS 50", brand: "Australian Gold", origin: "internacional", price: "R$ 70", priceRange: "intermediário", tags: ["cruelty-free", "vegano"], priority: "média" },
    ],
  },
];

const nightSteps: RoutineStep[] = [
  {
    step: 1, category: "Limpeza Dupla", description: "Remove maquiagem e impurezas do dia", icon: "🫧",
    products: [
      { name: "Óleo de Limpeza Facial", brand: "Bioderma", origin: "internacional", price: "R$ 110", priceRange: "premium", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Água Micelar", brand: "La Roche-Posay", origin: "internacional", price: "R$ 75", priceRange: "intermediário", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Demaquilante Bifásico", brand: "Tracta", origin: "nacional", price: "R$ 30", priceRange: "econômico", tags: ["vegano", "cruelty-free"], priority: "média" },
      { name: "Óleo de Limpeza Natural", brand: "Simple Organic", origin: "nacional", price: "R$ 85", priceRange: "intermediário", tags: ["vegano", "cruelty-free", "orgânico"], priority: "média" },
    ],
  },
  {
    step: 2, category: "Limpeza", description: "Segunda limpeza para pele realmente limpa", icon: "🧴",
    products: [
      { name: "Gel de Limpeza Facial", brand: "Cerave", origin: "internacional", price: "R$ 55", priceRange: "intermediário", tags: ["cruelty-free", "dermatológico"], priority: "alta" },
      { name: "Effaclar Gel Concentrado", brand: "La Roche-Posay", origin: "internacional", price: "R$ 80", priceRange: "intermediário", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Gel de Limpeza Facial", brand: "Principia", origin: "nacional", price: "R$ 45", priceRange: "econômico", tags: ["vegano", "cruelty-free"], priority: "média" },
    ],
  },
  {
    step: 3, category: "Tratamento Noturno", description: "Renovação celular e anti-idade", icon: "🌙",
    products: [
      { name: "Retinol Sérum 0.3%", brand: "La Roche-Posay", origin: "internacional", price: "R$ 160", priceRange: "premium", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Sérum Retinol 0.5%", brand: "Principia", origin: "nacional", price: "R$ 70", priceRange: "intermediário", tags: ["vegano", "cruelty-free"], priority: "alta" },
      { name: "Retinol 1.0 Treatment", brand: "SkinCeuticals", origin: "internacional", price: "R$ 350", priceRange: "premium", tags: ["dermatológico"], priority: "média" },
      { name: "Ácido Glicólico 10%", brand: "Principia", origin: "nacional", price: "R$ 55", priceRange: "econômico", tags: ["vegano", "cruelty-free"], priority: "baixa" },
    ],
  },
  {
    step: 4, category: "Hidratação Noturna", description: "Nutrição e reparação enquanto dorme", icon: "😴",
    products: [
      { name: "Cicaplast Baume B5+", brand: "La Roche-Posay", origin: "internacional", price: "R$ 85", priceRange: "intermediário", tags: ["dermatológico", "farmácia"], priority: "alta" },
      { name: "Skin Renewing Night Cream", brand: "Cerave", origin: "internacional", price: "R$ 80", priceRange: "intermediário", tags: ["cruelty-free", "dermatológico"], priority: "alta" },
      { name: "Creme Noturno Nutritivo", brand: "Natura Chronos", origin: "nacional", price: "R$ 95", priceRange: "intermediário", tags: ["vegano", "cruelty-free"], priority: "média" },
      { name: "Creme Facial Noturno", brand: "Simple Organic", origin: "nacional", price: "R$ 110", priceRange: "premium", tags: ["vegano", "cruelty-free", "orgânico"], priority: "média" },
    ],
  },
];

const tagIcons: Record<Tag, React.ReactNode> = {
  "vegano": <Leaf className="w-3 h-3" />,
  "cruelty-free": <Heart className="w-3 h-3" />,
  "farmácia": <Pill className="w-3 h-3" />,
  "orgânico": <Leaf className="w-3 h-3" />,
  "dermatológico": <ShieldCheck className="w-3 h-3" />,
};

const priorityColor: Record<string, string> = {
  alta: "bg-primary text-primary-foreground",
  média: "bg-accent text-accent-foreground",
  baixa: "bg-secondary text-secondary-foreground",
};

const allTags: Tag[] = ["vegano", "cruelty-free", "farmácia", "orgânico", "dermatológico"];

const RoutineStepCard = ({ routineStep, filters }: { routineStep: RoutineStep; filters: { price: string; origin: string; tags: Tag[] } }) => {
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    return routineStep.products.filter((p) => {
      if (filters.price && filters.price !== "todos" && p.priceRange !== filters.price) return false;
      if (filters.origin && filters.origin !== "todos" && p.origin !== filters.origin) return false;
      if (filters.tags.length > 0 && !filters.tags.some((t) => p.tags.includes(t))) return false;
      return true;
    });
  }, [routineStep.products, filters]);

  const shown = expanded ? filtered : filtered.slice(0, 2);

  return (
    <Card>
      <CardContent className="py-4 px-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-lg">
            {routineStep.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-semibold text-foreground">Etapa {routineStep.step}: {routineStep.category}</p>
            <p className="text-xs text-muted-foreground">{routineStep.description}</p>
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground italic pl-13">Nenhum produto encontrado com os filtros selecionados.</p>
        )}

        <div className="space-y-2 pl-1">
          {shown.map((product, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-foreground">{product.name}</p>
                  <Badge className={`text-[10px] ${priorityColor[product.priority]}`}>
                    {product.priority === "alta" ? "⭐ Alta" : product.priority === "média" ? "Média" : "Baixa"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{product.brand} · {product.origin === "nacional" ? "🇧🇷 Nacional" : "🌍 Internacional"}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-primary">{product.price}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">({product.priceRange})</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] gap-1 py-0 px-1.5 text-muted-foreground">
                      {tagIcons[tag]} {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 2 && (
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setExpanded(!expanded)}>
            {expanded ? <><ChevronUp className="w-3 h-3 mr-1" /> Ver menos</> : <><ChevronDown className="w-3 h-3 mr-1" /> Ver mais {filtered.length - 2} opção(ões)</>}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Routine = () => {
  const [priceFilter, setPriceFilter] = useState("todos");
  const [originFilter, setOriginFilter] = useState("todos");
  const [tagFilters, setTagFilters] = useState<Tag[]>([]);

  const toggleTag = (tag: Tag) => {
    setTagFilters((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const filters = { price: priceFilter, origin: originFilter, tags: tagFilters };

  return (
    <DashboardLayout title="Minha Rotina de Skincare">
      <div className="max-w-4xl mx-auto space-y-6">
        <p className="text-muted-foreground text-sm">
          Rotina personalizada com produtos reais do mercado. Use os filtros para encontrar o ideal para você.
        </p>

        {/* Filters */}
        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="w-4 h-4 text-primary" /> Filtros
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as faixas</SelectItem>
                  <SelectItem value="econômico">💰 Econômico</SelectItem>
                  <SelectItem value="intermediário">💵 Intermediário</SelectItem>
                  <SelectItem value="premium">💎 Premium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nacional">🇧🇷 Nacional</SelectItem>
                  <SelectItem value="internacional">🌍 Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <label key={tag} className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Checkbox
                    checked={tagFilters.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                    className="w-3.5 h-3.5"
                  />
                  <span className="flex items-center gap-1">{tagIcons[tag]} {tag}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Morning */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Rotina Matinal</h2>
          </div>
          <div className="space-y-3">
            {morningSteps.map((s) => (
              <RoutineStepCard key={s.step} routineStep={s} filters={filters} />
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
            {nightSteps.map((s) => (
              <RoutineStepCard key={`night-${s.step}`} routineStep={s} filters={filters} />
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Esta rotina é gerada por IA e não substitui orientação dermatológica profissional. Preços são aproximados e podem variar.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Routine;
