import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Camera, Upload, Plus, Loader2, Brain, ImageIcon, FileText, Calendar, Printer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import CameraCapture from "@/components/CameraCapture";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { signEntryPhotos } from "@/lib/patient-photo";

interface TimelineEntry {
  id: string;
  entry_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  condition_tag: string | null;
  ai_observations: string | null;
  evolution_score: number | null;
  created_at: string;
}

const CONDITIONS = [
  { value: "melasma", label: "Melasma" },
  { value: "rosacea", label: "Rosácea" },
  { value: "acne", label: "Acne" },
  { value: "dermatite", label: "Dermatite" },
  { value: "volume_loss", label: "Perda de Volume" },
  { value: "emagrecimento_facial", label: "Emagrecimento Facial" },
  { value: "rugas", label: "Rugas" },
  { value: "manchas", label: "Manchas" },
  { value: "outro", label: "Outro" },
];

const scoreLabel = (s: number) => {
  if (s <= 3) return { text: "Piora", icon: TrendingDown, color: "text-destructive" };
  if (s <= 4) return { text: "Leve piora", icon: TrendingDown, color: "text-orange-500" };
  if (s === 5) return { text: "Estável", icon: Minus, color: "text-muted-foreground" };
  if (s <= 7) return { text: "Melhora", icon: TrendingUp, color: "text-emerald-500" };
  return { text: "Ótima melhora", icon: TrendingUp, color: "text-emerald-600" };
};

const Timeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [conditionTag, setConditionTag] = useState("");
  const [entryType, setEntryType] = useState("photo");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("patient_timeline")
      .select("*")
      .eq("patient_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) {
      const signed = await signEntryPhotos(data as TimelineEntry[]);
      setEntries(signed);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl: string, file: File) => {
    setImagePreview(dataUrl);
    setImageFile(file);
    setCameraActive(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setConditionTag("");
    setEntryType("photo");
    setImageFile(null);
    setImagePreview(null);
    setCameraActive(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Informe um título.", variant: "destructive" });
      return;
    }
    setSaving(true);
    let imageUrl: string | null = null;

    if (imageFile && user) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("patient-photos")
        .upload(path, imageFile);
      if (uploadError) {
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      // Store the storage path; bucket is private and read via signed URLs.
      imageUrl = path;
    }

    // Get AI observations + evolution score
    let aiObs: string | null = null;
    let evolutionScore: number | null = null;
    if (conditionTag || description) {
      setAiLoading(true);
      try {
        // Get previous notes for context
        const lastEntry = entries.find(e => e.condition_tag === conditionTag && e.ai_observations);
        const { data: aiData } = await supabase.functions.invoke("timeline-ai", {
          body: {
            imageDescription: description,
            conditionTag,
            previousNotes: lastEntry?.ai_observations?.substring(0, 500) || null,
          },
        });
        if (aiData?.observations) aiObs = aiData.observations;
        if (aiData?.evolution_score) evolutionScore = aiData.evolution_score;
      } catch { /* non-blocking */ }
      setAiLoading(false);
    }

    const { error } = await supabase.from("patient_timeline").insert({
      patient_id: user!.id,
      entry_type: entryType,
      title,
      description: description || null,
      image_url: imageUrl,
      condition_tag: conditionTag || null,
      ai_observations: aiObs,
      evolution_score: evolutionScore,
      created_by: user!.id,
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registro adicionado à linha do tempo!" });
      resetForm();
      setDialogOpen(false);
      fetchEntries();
    }
  };

  const conditionLabel = (tag: string | null) => CONDITIONS.find(c => c.value === tag)?.label || tag || "";

  // Chart data - entries with scores, chronological order
  const chartData = entries
    .filter(e => e.evolution_score != null)
    .reverse()
    .map(e => ({
      date: format(new Date(e.created_at), "dd/MM", { locale: ptBR }),
      score: e.evolution_score!,
      title: e.title,
    }));

  return (
    <DashboardLayout title="Prontuário Digital">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center gap-3">
          <div>
            <p className="text-muted-foreground">Linha do tempo de evolução e acompanhamento.</p>
            <p className="text-xs text-muted-foreground mt-1">⚠️ As observações da IA não substituem consulta médica.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />Exportar
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Novo Registro</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Registro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={entryType} onValueChange={setEntryType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo"><span className="flex items-center gap-2"><Camera className="w-3 h-3" />Foto</span></SelectItem>
                      <SelectItem value="note"><span className="flex items-center gap-2"><FileText className="w-3 h-3" />Nota</span></SelectItem>
                      <SelectItem value="analysis"><span className="flex items-center gap-2"><Brain className="w-3 h-3" />Análise</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input placeholder="Ex: Acompanhamento melasma - semana 4" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Condição</Label>
                  <Select value={conditionTag} onValueChange={setConditionTag}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descreva a evolução ou observações..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Foto</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {cameraActive ? (
                    <CameraCapture
                      onCapture={handleCameraCapture}
                      onClose={() => setCameraActive(false)}
                    />
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />Galeria
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setCameraActive(true)}>
                          <Camera className="w-4 h-4 mr-2" />Câmera
                        </Button>
                      </div>
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg mt-2 border border-border" />
                      )}
                    </>
                  )}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleCreate} disabled={saving || aiLoading}>
                  {saving || aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {aiLoading ? "Analisando..." : saving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Evolution Chart */}
        {chartData.length >= 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Gráfico de Evolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 10]} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      const info = scoreLabel(d.score);
                      return (
                        <div className="bg-background border border-border rounded-lg p-2 shadow-md text-xs">
                          <p className="font-medium">{d.title}</p>
                          <p className="text-muted-foreground">{d.date}</p>
                          <p className={info.color}>Score: {d.score}/10 — {info.text}</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={5} strokeDasharray="3 3" className="stroke-muted-foreground/40" label={{ value: "Estável", position: "right", fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    className="stroke-primary"
                    strokeWidth={2}
                    dot={{ r: 4, className: "fill-primary" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-2">
                <span>🔴 Piora (1-3)</span>
                <span>🟡 Estável (4-6)</span>
                <span>🟢 Melhora (7-10)</span>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum registro ainda. Adicione fotos e notas para criar sua linha do tempo.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {entries.map((entry) => {
                const info = entry.evolution_score ? scoreLabel(entry.evolution_score) : null;
                const ScoreIcon = info?.icon;
                return (
                  <div key={entry.id} className="relative pl-14">
                    <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <Card>
                      <CardContent className="py-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{entry.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </span>
                              {entry.condition_tag && (
                                <Badge variant="secondary" className="text-xs">{conditionLabel(entry.condition_tag)}</Badge>
                              )}
                              {info && ScoreIcon && (
                                <Badge variant="outline" className={`text-xs ${info.color}`}>
                                  <ScoreIcon className="w-3 h-3 mr-1" />
                                  {entry.evolution_score}/10 — {info.text}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {entry.entry_type === "photo" && <ImageIcon className="w-3 h-3 mr-1" />}
                            {entry.entry_type === "note" && <FileText className="w-3 h-3 mr-1" />}
                            {entry.entry_type === "analysis" && <Brain className="w-3 h-3 mr-1" />}
                            {entry.entry_type === "photo" ? "Foto" : entry.entry_type === "note" ? "Nota" : "Análise"}
                          </Badge>
                        </div>

                        {entry.description && (
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        )}

                        {entry.image_url && (
                          <img src={entry.image_url} alt={entry.title} className="w-full max-h-64 object-cover rounded-lg border border-border" />
                        )}

                        {entry.ai_observations && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs font-medium text-primary flex items-center gap-1 mb-1">
                              <Brain className="w-3 h-3" /> Observações da IA
                            </p>
                            <div className="text-xs text-muted-foreground prose prose-xs max-w-none"><ReactMarkdown>{entry.ai_observations}</ReactMarkdown></div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Timeline;
