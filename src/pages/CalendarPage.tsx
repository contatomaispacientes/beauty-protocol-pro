import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Sun,
  Moon,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SkinDiary from "@/components/SkinDiary";

interface UserProduct {
  id: string;
  name: string;
  brand: string | null;
  moment: "am" | "pm" | "both";
  category: string;
}

interface Step {
  id: string;
  routine_id: string;
  moment: "am" | "pm";
  order_index: number;
  product_id: string | null;
  custom_label: string | null;
  suggested_time: string | null;
}

interface Routine {
  id: string;
  patient_id: string;
  name: string;
  active_weekdays: number[];
  created_by_ai: boolean;
}

interface CalendarEvent {
  id: string;
  event_date: string;
  moment: "am" | "pm";
  step_id: string | null;
  product_id: string | null;
  custom_label: string | null;
  is_skipped: boolean;
  completed_at: string | null;
}

const toDateStr = (d: Date) => format(d, "yyyy-MM-dd");

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<UserProduct[]>([]);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"from_cabinet" | "generic">("from_cabinet");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  useEffect(() => {
    if (user) loadDay(selectedDate);
  }, [user, selectedDate]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: prods }, { data: rout }] = await Promise.all([
      supabase.from("user_products").select("id,name,brand,moment,category").eq("patient_id", user!.id).eq("is_archived", false),
      supabase.from("skincare_routines").select("*").eq("patient_id", user!.id).maybeSingle(),
    ]);
    setProducts((prods as UserProduct[]) || []);
    setRoutine((rout as Routine) || null);
    if (rout) {
      const { data: st } = await supabase
        .from("skincare_routine_steps")
        .select("*")
        .eq("routine_id", (rout as Routine).id)
        .order("moment")
        .order("order_index");
      setSteps((st as Step[]) || []);
    } else {
      setSteps([]);
    }
    await loadWeek(selectedDate);
    setLoading(false);
  };

  const loadDay = async (d: Date) => {
    const { data } = await supabase
      .from("skincare_calendar_events")
      .select("*")
      .eq("patient_id", user!.id)
      .eq("event_date", toDateStr(d));
    setEvents((data as CalendarEvent[]) || []);
  };

  const loadWeek = async (d: Date) => {
    const from = startOfWeek(d, { weekStartsOn: 0 });
    const to = addDays(from, 6);
    const { data } = await supabase
      .from("skincare_calendar_events")
      .select("id,event_date,moment,completed_at,is_skipped")
      .eq("patient_id", user!.id)
      .gte("event_date", toDateStr(from))
      .lte("event_date", toDateStr(to));
    setWeekEvents((data as CalendarEvent[]) || []);
  };

  const weekDays = useMemo(() => {
    const from = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(from, i));
  }, [selectedDate]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const activeToday = useMemo(() => {
    const dow = selectedDate.getDay();
    if (!routine || !routine.active_weekdays.includes(dow)) return { am: [] as Step[], pm: [] as Step[] };
    return {
      am: steps.filter((s) => s.moment === "am"),
      pm: steps.filter((s) => s.moment === "pm"),
    };
  }, [routine, steps, selectedDate]);

  const eventForStep = (stepId: string) => events.find((e) => e.step_id === stepId);

  const toggleCheck = async (moment: "am" | "pm", step: Step) => {
    const existing = eventForStep(step.id);
    if (existing) {
      if (existing.completed_at) {
        await supabase.from("skincare_calendar_events").delete().eq("id", existing.id);
      } else {
        await supabase
          .from("skincare_calendar_events")
          .update({ completed_at: new Date().toISOString(), is_skipped: false })
          .eq("id", existing.id);
      }
    } else {
      await supabase.from("skincare_calendar_events").insert({
        patient_id: user!.id,
        event_date: toDateStr(selectedDate),
        moment,
        step_id: step.id,
        product_id: step.product_id,
        custom_label: step.custom_label,
        completed_at: new Date().toISOString(),
      });
    }
    await loadDay(selectedDate);
    await loadWeek(selectedDate);
  };

  const dayCompletion = (d: Date) => {
    const list = weekEvents.filter((e) => e.event_date === toDateStr(d) && e.completed_at);
    return list.length;
  };

  const total = activeToday.am.length + activeToday.pm.length;
  const done = events.filter((e) => e.completed_at).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-routine", {
        body: {
          mode: aiMode,
          products: aiMode === "from_cabinet" ? products : [],
          profileSummary: "",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Upsert routine
      let routineId = routine?.id;
      if (!routineId) {
        const { data: newR, error: rErr } = await supabase
          .from("skincare_routines")
          .insert({ patient_id: user!.id, created_by_ai: true, name: "Rotina IA" })
          .select()
          .single();
        if (rErr) throw rErr;
        routineId = (newR as Routine).id;
      } else {
        await supabase.from("skincare_routines").update({ created_by_ai: true }).eq("id", routineId);
        await supabase.from("skincare_routine_steps").delete().eq("routine_id", routineId);
      }
      const rows: any[] = [];
      const asStep = (m: "am" | "pm", s: any) => ({
        routine_id: routineId,
        patient_id: user!.id,
        moment: m,
        order_index: s.order_index ?? 0,
        product_id: s.product_id && s.product_id.length > 20 ? s.product_id : null,
        custom_label: s.custom_label || null,
        suggested_time: s.suggested_time || null,
      });
      (data.am_steps || []).forEach((s: any) => rows.push(asStep("am", s)));
      (data.pm_steps || []).forEach((s: any) => rows.push(asStep("pm", s)));
      if (rows.length) await supabase.from("skincare_routine_steps").insert(rows);
      toast({ title: "Rotina gerada pela IA ✨" });
      setAiOpen(false);
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erro ao gerar rotina", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout title="Meu Calendário">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display italic text-4xl text-foreground">Meu calendário</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monte sua rotina e faça o check-in diário.
          </p>
        </div>

        {/* Week strip */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const d = addDays(selectedDate, -7);
              setSelectedDate(d);
              loadWeek(d);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((d) => {
              const active = isSameDay(d, selectedDate);
              const count = dayCompletion(d);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center py-2 rounded-xl text-xs transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : isToday(d)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span className="uppercase tracking-wider text-[9px] opacity-70">
                    {format(d, "EEE", { locale: ptBR })}
                  </span>
                  <span className="font-semibold text-base leading-tight mt-0.5">
                    {format(d, "d")}
                  </span>
                  <span className={`w-1 h-1 rounded-full mt-1 ${count > 0 ? (active ? "bg-primary-foreground" : "bg-primary") : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const d = addDays(selectedDate, 7);
              setSelectedDate(d);
              loadWeek(d);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress + actions */}
        <div className="bg-primary text-primary-foreground rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/60 truncate">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="font-display text-3xl mt-1">
              {done}/{total || 0} passos
            </p>
            <p className="text-[11px] text-primary-foreground/80 mt-1">{progress}% concluído</p>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Button size="sm" variant="secondary" className="flex-1 sm:flex-initial" onClick={() => setAiOpen(true)}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Gerar IA
            </Button>
            <Button size="sm" variant="outline" className="flex-1 sm:flex-initial bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => setEditorOpen(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Editar rotina
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !routine || total === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Você ainda não tem uma rotina para este dia. Gere uma com IA ou monte manualmente.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setAiOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar com IA
              </Button>
              <Button variant="outline" onClick={() => setEditorOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Montar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <MomentBlock
              moment="am"
              steps={activeToday.am}
              events={events}
              productMap={productMap}
              onToggle={toggleCheck}
            />
            <MomentBlock
              moment="pm"
              steps={activeToday.pm}
              events={events}
              productMap={productMap}
              onToggle={toggleCheck}
            />
          </>
        )}

        {/* AI Dialog */}
        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar rotina com IA</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <button
                onClick={() => setAiMode("from_cabinet")}
                className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                  aiMode === "from_cabinet" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <p className="font-semibold text-sm">Usar meu armário</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A IA monta a rotina com os {products.length} produto(s) cadastrado(s) e seu perfil.
                </p>
              </button>
              <button
                onClick={() => setAiMode("generic")}
                className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                  aiMode === "generic" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <p className="font-semibold text-sm">Sugestão genérica de passos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Passos ideais (limpeza → sérum → hidratante → FPS). Você vincula produtos depois.
                </p>
              </button>
              <p className="text-[11px] text-muted-foreground">
                ⚠️ A rotina sugerida não substitui consulta dermatológica.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={generateAI} disabled={aiLoading}>
                {aiLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Gerar rotina
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Editor Dialog */}
        <RoutineEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          userId={user?.id || ""}
          routine={routine}
          steps={steps}
          products={products}
          onSaved={loadAll}
        />
      </div>
    </DashboardLayout>
  );
};

function MomentBlock({
  moment,
  steps,
  events,
  productMap,
  onToggle,
}: {
  moment: "am" | "pm";
  steps: Step[];
  events: CalendarEvent[];
  productMap: Map<string, UserProduct>;
  onToggle: (m: "am" | "pm", s: Step) => void;
}) {
  const Icon = moment === "am" ? Sun : Moon;
  const label = moment === "am" ? "Manhã" : "Noite";
  if (steps.length === 0) return null;
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-display italic text-2xl text-foreground">{label}</h2>
      </div>
      <div className="space-y-2">
        {steps.map((s) => {
          const ev = events.find((e) => e.step_id === s.id);
          const done = !!ev?.completed_at;
          const product = s.product_id ? productMap.get(s.product_id) : null;
          const title = product?.name || s.custom_label || "Passo";
          const sub = product?.brand || (s.suggested_time ? `Sugerido: ${s.suggested_time.slice(0, 5)}` : "");
          return (
            <button
              key={s.id}
              onClick={() => onToggle(moment, s)}
              className={`w-full flex items-center p-4 rounded-2xl border text-left transition-colors ${
                done ? "bg-primary/5 border-primary/30" : "bg-card border-border/60 hover:border-primary/30"
              }`}
            >
              <div className="w-10 h-10 bg-secondary rounded-lg mr-4 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary/60" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {title}
                </p>
                {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  done ? "bg-primary border-primary text-primary-foreground" : "border-border"
                }`}
              >
                {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoutineEditorDialog({
  open,
  onOpenChange,
  userId,
  routine,
  steps,
  products,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  routine: Routine | null;
  steps: Step[];
  products: UserProduct[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [local, setLocal] = useState<Step[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setLocal(steps.map((s) => ({ ...s })));
  }, [open, steps]);

  const addStep = (moment: "am" | "pm") => {
    setLocal([
      ...local,
      {
        id: `tmp-${Date.now()}-${Math.random()}`,
        routine_id: routine?.id || "",
        moment,
        order_index: local.filter((s) => s.moment === moment).length,
        product_id: null,
        custom_label: "",
        suggested_time: null,
      },
    ]);
  };

  const updateStep = (id: string, patch: Partial<Step>) => {
    setLocal(local.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeStep = (id: string) => setLocal(local.filter((s) => s.id !== id));

  const save = async () => {
    setSaving(true);
    try {
      let routineId = routine?.id;
      if (!routineId) {
        const { data, error } = await supabase
          .from("skincare_routines")
          .insert({ patient_id: userId, name: "Minha rotina" })
          .select()
          .single();
        if (error) throw error;
        routineId = (data as Routine).id;
      }
      await supabase.from("skincare_routine_steps").delete().eq("routine_id", routineId);
      const rows = local
        .filter((s) => s.product_id || (s.custom_label && s.custom_label.trim()))
        .map((s, i) => ({
          routine_id: routineId,
          patient_id: userId,
          moment: s.moment,
          order_index: i,
          product_id: s.product_id,
          custom_label: s.custom_label || null,
          suggested_time: s.suggested_time || null,
        }));
      if (rows.length) {
        const { error } = await supabase.from("skincare_routine_steps").insert(rows);
        if (error) throw error;
      }
      toast({ title: "Rotina salva" });
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const renderList = (moment: "am" | "pm") => (
    <div className="space-y-2">
      {local
        .filter((s) => s.moment === moment)
        .map((s) => (
          <div key={s.id} className="p-3 border border-border/60 rounded-xl space-y-2">
            <div className="flex gap-2">
              <Select
                value={s.product_id || "__none__"}
                onValueChange={(v) => updateStep(s.id, { product_id: v === "__none__" ? null : v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Sem produto vinculado —</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.brand && `· ${p.brand}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => removeStep(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Rótulo (ex: Limpeza)"
                value={s.custom_label || ""}
                onChange={(e) => updateStep(s.id, { custom_label: e.target.value })}
              />
              <Input
                type="time"
                className="w-28"
                value={s.suggested_time?.slice(0, 5) || ""}
                onChange={(e) => updateStep(s.id, { suggested_time: e.target.value || null })}
              />
            </div>
          </div>
        ))}
      <Button variant="outline" size="sm" className="w-full" onClick={() => addStep(moment)}>
        <Plus className="w-3.5 h-3.5 mr-1" />
        Adicionar passo
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar rotina base</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-primary" />
              <p className="font-display italic text-lg">Manhã</p>
            </div>
            {renderList("am")}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-primary" />
              <p className="font-display italic text-lg">Noite</p>
            </div>
            {renderList("pm")}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar rotina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CalendarPage;
