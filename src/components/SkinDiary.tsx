import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Smile,
  Meh,
  Frown,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  CalendarIcon,
  X,
} from "lucide-react";
import { z } from "zod";

type Mood = "good" | "neutral" | "bad";

interface DiaryEntry {
  id: string;
  user_id: string;
  entry_date: string; // yyyy-MM-dd
  mood: Mood;
  note: string;
  tags: string[];
  created_at: string;
}

const MOODS: { value: Mood; label: string; Icon: typeof Smile; className: string }[] = [
  { value: "good", label: "Boa", Icon: Smile, className: "text-emerald-600" },
  { value: "neutral", label: "Neutra", Icon: Meh, className: "text-amber-600" },
  { value: "bad", label: "Ruim", Icon: Frown, className: "text-rose-600" },
];

const SUGGESTED_TAGS = [
  "oleosidade",
  "ressecamento",
  "acne",
  "vermelhidão",
  "coceira",
  "brilho saudável",
  "manchas",
  "sensibilidade",
];

const entrySchema = z.object({
  entry_date: z.string().min(1),
  mood: z.enum(["good", "neutral", "bad"]),
  note: z.string().trim().max(2000, "Máx. 2000 caracteres"),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
});

const moodMeta = (m: Mood) => MOODS.find((x) => x.value === m)!;

export default function SkinDiary() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // form state
  const [date, setDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("skin_diary_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar diário", description: error.message, variant: "destructive" });
    } else {
      setEntries((data as DiaryEntry[]) || []);
    }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setDate(new Date());
    setMood(null);
    setNote("");
    setTags([]);
    setTagInput("");
    setDialogOpen(true);
  };

  const openEdit = (e: DiaryEntry) => {
    setEditing(e);
    setDate(parseISO(e.entry_date));
    setMood(e.mood);
    setNote(e.note || "");
    setTags(e.tags || []);
    setTagInput("");
    setDialogOpen(true);
  };

  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) return;
    if (tags.length >= 10) return;
    if (t.length > 30) return;
    setTags([...tags, t]);
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const save = async () => {
    if (!user) return;
    if (!mood) {
      toast({ title: "Escolha como sua pele está", variant: "destructive" });
      return;
    }
    const payload = {
      entry_date: format(date, "yyyy-MM-dd"),
      mood,
      note: note.trim(),
      tags,
    };
    const parsed = entrySchema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: "Verifique os campos", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from("skin_diary_entries")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Anotação atualizada" });
        setDialogOpen(false);
        await load();
      }
    } else {
      const { error } = await supabase
        .from("skin_diary_entries")
        .insert({ ...payload, user_id: user.id });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Anotação salva ✨" });
        setDialogOpen(false);
        await load();
      }
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("skin_diary_entries").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anotação removida" });
      await load();
    }
    setDeleteId(null);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    for (const e of entries) {
      const key = format(parseISO(e.entry_date), "MMMM yyyy", { locale: ptBR });
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display italic text-3xl text-foreground">Diário da pele</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Anote como sua pele está sempre que notar algo diferente — bom ou ruim.
          </p>
        </div>
        <Button onClick={openNew} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Nova
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 space-y-3 border border-dashed border-border rounded-3xl">
          <Sparkles className="w-10 h-10 text-primary/60 mx-auto" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Ainda sem anotações. Registre o primeiro dia em que sua pele chamou sua atenção.
          </p>
          <Button onClick={openNew} variant="outline">
            <Plus className="w-4 h-4 mr-1.5" />
            Criar anotação
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([monthLabel, items]) => (
            <div key={monthLabel} className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {monthLabel}
              </p>
              <div className="space-y-2">
                {items.map((e) => {
                  const m = moodMeta(e.mood);
                  const Icon = m.Icon;
                  return (
                    <article
                      key={e.id}
                      className="bg-card border border-border/60 rounded-2xl p-4 flex gap-3"
                    >
                      <div className={cn("w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0", m.className)}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            {format(parseISO(e.entry_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <span className={cn("text-[11px] font-medium", m.className)}>· {m.label}</span>
                        </div>
                        {e.note && (
                          <p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-wrap">{e.note}</p>
                        )}
                        {e.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {e.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(e)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(e.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar anotação" : "Nova anotação"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(date, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Como sua pele está?</label>
              <div className="grid grid-cols-3 gap-2">
                {MOODS.map(({ value, label, Icon, className }) => {
                  const active = mood === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMood(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", className)} strokeWidth={2} />
                      <span className="text-xs font-medium text-foreground">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Tags rápidas</label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((t) => {
                  const active = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => (active ? removeTag(t) : addTag(t))}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full border transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                      setTagInput("");
                    }
                  }}
                  placeholder="Adicionar tag personalizada"
                  maxLength={30}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addTag(tagInput);
                    setTagInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {tags.filter((t) => !SUGGESTED_TAGS.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags
                    .filter((t) => !SUGGESTED_TAGS.includes(t))
                    .map((t) => (
                      <Badge key={t} variant="secondary" className="text-[11px] gap-1">
                        {t}
                        <button type="button" onClick={() => removeTag(t)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">O que você observou?</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 2000))}
                placeholder="Descreva o que notou hoje — textura, brilho, sensibilidade, gatilhos possíveis…"
                rows={5}
                maxLength={2000}
              />
              <p className="text-[10px] text-muted-foreground text-right">{note.length}/2000</p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>Cancelar</Button>
            </DialogClose>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Salvar alterações" : "Salvar anotação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
