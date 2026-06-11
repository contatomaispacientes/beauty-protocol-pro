import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Camera, FileText, Brain, Calendar, ImageIcon, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { signEntryPhotos } from "@/lib/patient-photo";

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

interface PatientProfile {
  display_name: string | null;
  email: string | null;
}

const CONDITIONS: Record<string, string> = {
  melasma: "Melasma", rosacea: "Rosácea", acne: "Acne", dermatite: "Dermatite",
  volume_loss: "Perda de Volume", emagrecimento_facial: "Emagrecimento Facial",
  rugas: "Rugas", manchas: "Manchas", outro: "Outro",
};

const AdminPatientTimeline = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: timelineData }, { data: profileData }] = await Promise.all([
      supabase.from("patient_timeline").select("*").eq("patient_id", patientId!).order("created_at", { ascending: false }),
      supabase.from("profiles").select("display_name, email").eq("user_id", patientId!).maybeSingle(),
    ]);
    if (timelineData) {
      const signed = await signEntryPhotos(timelineData as TimelineEntry[]);
      setEntries(signed);
    }
    if (profileData) setProfile(profileData);
    setLoading(false);
  };

  const handlePrint = () => window.print();

  return (
    <AdminLayout title="Prontuário do Paciente">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/patients"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <div>
              <h2 className="text-xl font-serif font-bold">{profile?.display_name || "Paciente"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />Imprimir
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Este paciente ainda não possui registros no prontuário digital.</p>
          </div>
        ) : (
          <div className="relative print:static">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border print:hidden" />
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="relative pl-14 print:pl-0">
                  <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-primary border-2 border-background print:hidden" />
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
                              <Badge variant="secondary" className="text-xs">{CONDITIONS[entry.condition_tag] || entry.condition_tag}</Badge>
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
                      {entry.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}
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
    </AdminLayout>
  );
};

export default AdminPatientTimeline;
