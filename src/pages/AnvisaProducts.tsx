import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShieldCheck, Upload, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

const AnvisaProducts = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const checkCount = async () => {
    const { count } = await supabase.from("anvisa_products").select("*", { count: "exact", head: true });
    setTotalCount(count ?? 0);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/data/anvisa-cosmeticos.csv");
      const csv = await res.text();

      const { data, error } = await supabase.functions.invoke("import-anvisa", {
        body: { csv },
      });

      if (error) throw error;
      toast.success(`Importação concluída! ${data.inserted} produtos importados.`);
      await checkCount();
    } catch (e: any) {
      toast.error("Erro na importação: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let q = supabase
        .from("anvisa_products")
        .select("*")
        .or(`product_name.ilike.%${query}%,company_name.ilike.%${query}%`)
        .order("product_name")
        .limit(50);

      if (statusFilter !== "todos") {
        q = q.eq("status", statusFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      setResults(data || []);
    } catch (e: any) {
      toast.error("Erro na busca: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useState(() => { checkCount(); });

  return (
    <DashboardLayout title="Produtos ANVISA">
      <div className="max-w-4xl mx-auto space-y-6">
        <p className="text-muted-foreground text-sm">
          Consulte produtos cosméticos registrados na ANVISA. Verifique se seus produtos possuem registro ativo.
        </p>

        {/* Import section */}
        {totalCount !== null && totalCount === 0 && (
          <Card>
            <CardContent className="py-4 flex items-center gap-4">
              <Upload className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Base de dados vazia</p>
                <p className="text-xs text-muted-foreground">Importe os 51 mil produtos da ANVISA para habilitar buscas</p>
              </div>
              <Button onClick={handleImport} disabled={importing} size="sm">
                {importing ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Importando...</> : "Importar Dados"}
              </Button>
            </CardContent>
          </Card>
        )}

        {totalCount !== null && totalCount > 0 && (
          <div className="text-xs text-muted-foreground">
            <ShieldCheck className="w-3 h-3 inline mr-1" />
            {totalCount.toLocaleString("pt-BR")} produtos registrados na base
          </div>
        )}

        {/* Search */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por produto ou empresa..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-2">
          {results.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-3 px-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-foreground">{p.product_name}</p>
                  <Badge variant={p.status === "ATIVO" ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                    {p.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  {p.company_name}
                </div>
                {p.registration_number && (
                  <p className="text-[10px] text-muted-foreground">
                    Registro: {p.registration_number}
                    {p.registration_expiry && ` · Validade: ${new Date(p.registration_expiry).toLocaleDateString("pt-BR")}`}
                  </p>
                )}
                {p.product_category && (
                  <Badge variant="outline" className="text-[10px] mt-1">{p.product_category}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && query && !loading && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto encontrado.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnvisaProducts;
