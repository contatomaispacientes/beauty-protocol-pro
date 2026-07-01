import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Camera, Upload, Sparkles, Package, Archive, Trash2, Pencil, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CameraCapture from "@/components/CameraCapture";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "cleanser", label: "Limpeza" },
  { value: "toner", label: "Tônico" },
  { value: "serum", label: "Sérum" },
  { value: "moisturizer", label: "Hidratante" },
  { value: "sunscreen", label: "Protetor Solar" },
  { value: "treatment", label: "Tratamento" },
  { value: "exfoliant", label: "Esfoliante" },
  { value: "mask", label: "Máscara" },
  { value: "other", label: "Outro" },
];

const catLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label || "Outro";

interface UserProduct {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  key_ingredients: string | null;
  moment: "am" | "pm" | "both";
  notes: string | null;
  image_url: string | null;
  is_archived: boolean;
}

const emptyForm = {
  id: "" as string | undefined,
  name: "",
  brand: "",
  category: "other",
  key_ingredients: "",
  moment: "both" as "am" | "pm" | "both",
  notes: "",
};

const Cabinet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [form, setForm] = useState<typeof emptyForm & { id?: string }>(emptyForm);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_products")
      .select("*")
      .eq("patient_id", user!.id)
      .order("created_at", { ascending: false });
    setProducts((data as UserProduct[]) || []);
    setLoading(false);
  };

  const openNew = () => {
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (p: UserProduct) => {
    setForm({
      id: p.id,
      name: p.name,
      brand: p.brand || "",
      category: p.category,
      key_ingredients: p.key_ingredients || "",
      moment: p.moment,
      notes: p.notes || "",
    });
    setDialogOpen(true);
  };

  const scanLabel = async (base64: string) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("identify-product", {
        body: { imageBase64: base64 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.not_identified) {
        toast({ title: "Não identificamos o produto", description: "Preencha manualmente." });
      } else {
        setForm((f) => ({
          ...f,
          name: data.name || f.name,
          brand: data.brand || f.brand,
          category: data.category || f.category,
          key_ingredients: data.key_ingredients || f.key_ingredients,
          moment: data.moment || f.moment,
          notes: data.notes || f.notes,
        }));
        toast({ title: "Dados preenchidos pela IA. Confira antes de salvar." });
      }
    } catch (e: any) {
      toast({ title: "Erro ao identificar", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCameraCapture = async (dataUrl: string) => {
    setCameraOn(false);
    await scanLabel(dataUrl);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      await scanLabel(url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Informe o nome do produto.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      patient_id: user!.id,
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      category: form.category,
      key_ingredients: form.key_ingredients.trim() || null,
      moment: form.moment,
      notes: form.notes.trim() || null,
    };
    const { error } = form.id
      ? await supabase.from("user_products").update(payload).eq("id", form.id)
      : await supabase.from("user_products").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Produto atualizado" : "Produto adicionado ao armário" });
    setDialogOpen(false);
    fetchAll();
  };

  const toggleArchive = async (p: UserProduct) => {
    await supabase.from("user_products").update({ is_archived: !p.is_archived }).eq("id", p.id);
    fetchAll();
  };

  const remove = async (p: UserProduct) => {
    if (!confirm(`Remover "${p.name}" do armário?`)) return;
    await supabase.from("user_products").delete().eq("id", p.id);
    fetchAll();
  };

  const visible = useMemo(
    () => products.filter((p) => (filter === "active" ? !p.is_archived : p.is_archived)),
    [products, filter],
  );

  return (
    <DashboardLayout title="Meu Armário">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="font-display italic text-4xl text-foreground">Meu armário</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre os produtos que você usa. Use na sua rotina do calendário.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar produto" : "Novo produto"}</DialogTitle>
              </DialogHeader>

              {cameraOn ? (
                <CameraCapture onCapture={handleCameraCapture} onClose={() => setCameraOn(false)} />
              ) : (
                <div className="space-y-4 py-2">
                  {!form.id && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                        disabled={aiLoading}
                      >
                        {aiLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Foto do rótulo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCameraOn(true)}
                        disabled={aiLoading}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Câmera
                      </Button>
                      <p className="col-span-2 text-[11px] text-muted-foreground -mt-1">
                        <Sparkles className="inline w-3 h-3 mr-1" />
                        A IA preenche os campos abaixo a partir do rótulo. Confira antes de salvar.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Hidratante Facial Effaclar"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        placeholder="La Roche-Posay"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={form.category}
                        onValueChange={(v) => setForm({ ...form, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ativos principais</Label>
                    <Input
                      value={form.key_ingredients}
                      onChange={(e) => setForm({ ...form, key_ingredients: e.target.value })}
                      placeholder="Ex: Ácido Hialurônico, Niacinamida"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Momento de uso</Label>
                    <Select
                      value={form.moment}
                      onValueChange={(v: any) => setForm({ ...form, moment: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="am">Manhã (AM)</SelectItem>
                        <SelectItem value="pm">Noite (PM)</SelectItem>
                        <SelectItem value="both">AM e PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Observações pessoais"
                    />
                  </div>
                </div>
              )}

              {!cameraOn && (
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={save} disabled={saving || aiLoading}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
          <TabsList>
            <TabsTrigger value="active">Em uso</TabsTrigger>
            <TabsTrigger value="archived">Arquivados</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-sm">
              {filter === "active"
                ? "Seu armário está vazio. Adicione seus produtos para montar sua rotina."
                : "Nenhum produto arquivado."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {visible.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-card border border-border/60 rounded-2xl flex items-start gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {catLabel(p.category)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {p.moment === "am" ? (
                        <>
                          <Sun className="w-3 h-3 mr-1" />
                          AM
                        </>
                      ) : p.moment === "pm" ? (
                        <>
                          <Moon className="w-3 h-3 mr-1" />
                          PM
                        </>
                      ) : (
                        "AM + PM"
                      )}
                    </Badge>
                  </div>
                  {p.key_ingredients && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                      <span className="font-medium">Ativos:</span> {p.key_ingredients}
                    </p>
                  )}
                  {p.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{p.notes}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleArchive(p)}>
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cabinet;
