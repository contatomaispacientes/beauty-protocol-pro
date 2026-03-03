import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Camera, Upload, Plus, Loader2, Brain, ImageIcon, FileText, Calendar, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

interface TimelineEntry {
  id: string;
  entry_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  condition_tag: string | null;
  ai_observations: string | null;
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

const Timeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);

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
    if (data) setEntries(data as TimelineEntry[]);
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

  const stopCamera = () => {
    if (streamRef) {
      streamRef.getTracks().forEach(t => t.stop());
      setStreamRef(null);
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStreamRef(stream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast({ title: "Não foi possível acessar a câmera.", variant: "destructive" });
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImagePreview(dataUrl);
    // Convert to File
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      setImageFile(new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" }));
    });
    stopCamera();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setConditionTag("");
    setEntryType("photo");
    setImageFile(null);
    setImagePreview(null);
    stopCamera();
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Informe um título.", variant: "destructive" });
      return;
    }
    setSaving(true);
    let imageUrl: string | null = null;

    // Upload image if present
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
      const { data: urlData } = supabase.storage.from("patient-photos").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    // Get AI observations
    let aiObs: string | null = null;
    if (conditionTag || description) {
      setAiLoading(true);
      try {
        const { data: aiData } = await supabase.functions.invoke("timeline-ai", {
          body: { imageDescription: description, conditionTag },
        });
        if (aiData?.observations) aiObs = aiData.observations;
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
      created_by: user!.id,
    });

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
              <DialogContent className="sm:max-w-lg">
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
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />Galeria
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={cameraActive ? capturePhoto : startCamera}>
                      <Camera className="w-4 h-4 mr-2" />{cameraActive ? "Capturar" : "Câmera"}
                    </Button>
                  </div>
                  {cameraActive && (
                    <div className="relative mt-2">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border border-border" />
                      <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2" onClick={stopCamera}>✕</Button>
                    </div>
                  )}
                  {!cameraActive && imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg mt-2 border border-border" />
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

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum registro ainda. Adicione fotos e notas para criar sua linha do tempo.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="relative pl-14">
                  {/* Dot */}
                  <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                  <Card>
                    <CardContent className="py-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{entry.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                            {entry.condition_tag && (
                              <Badge variant="secondary" className="text-xs">{conditionLabel(entry.condition_tag)}</Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Timeline;
