import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Loader2, AlertTriangle, Heart, Droplets, Sun, ArrowRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Condition {
  name: string;
  severity: string;
  location: string;
}

interface Recommendation {
  category: string;
  recommendation: string;
  priority: string;
}

interface AnalysisResult {
  skin_type: string;
  tone: string;
  subtone: string;
  hydration_level: string;
  health_score: number;
  conditions: Condition[];
  recommendations: Recommendation[];
  summary: string;
}

const severityColor: Record<string, string> = {
  Leve: "bg-sage text-accent-foreground",
  Moderada: "bg-peach text-accent-foreground",
  Acentuada: "bg-destructive/15 text-destructive",
};

const priorityColor: Record<string, string> = {
  Alta: "bg-primary text-primary-foreground",
  Média: "bg-accent text-accent-foreground",
  Baixa: "bg-secondary text-secondary-foreground",
};

const SkinAnalysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Imagem muito grande", description: "Máximo 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setShowCamera(false);
      toast({ variant: "destructive", title: "Câmera indisponível", description: "Permita o acesso à câmera." });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setImage(canvas.toDataURL("image/jpeg"));
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-skin", {
        body: { imageBase64: image },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data as AnalysisResult);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: err.message || "Não foi possível analisar a imagem.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-gold";
    return "text-destructive";
  };

  return (
    <DashboardLayout title="Análise de Pele por IA">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4 border border-border">
          <AlertTriangle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Esta análise utiliza inteligência artificial e <strong>não substitui consulta dermatológica profissional</strong>.
            Para diagnósticos e tratamentos, consulte um dermatologista.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!image ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all" onClick={() => fileRef.current?.click()}>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 rounded-full bg-peach flex items-center justify-center mb-4">
                        <Upload className="w-7 h-7 text-foreground/70" />
                      </div>
                      <p className="font-serif font-semibold text-foreground">Upload de Selfie</p>
                      <p className="text-sm text-muted-foreground mt-1">Envie uma foto do seu rosto</p>
                    </CardContent>
                  </Card>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                  <Card className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all" onClick={startCamera}>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 rounded-full bg-rose-soft flex items-center justify-center mb-4">
                        <Camera className="w-7 h-7 text-foreground/70" />
                      </div>
                      <p className="font-serif font-semibold text-foreground">Câmera ao Vivo</p>
                      <p className="text-sm text-muted-foreground mt-1">Tire uma foto agora</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6 space-y-4">
                    <img src={image} alt="Selfie" className="max-w-sm mx-auto rounded-lg shadow-md" />
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => setImage(null)}>Trocar foto</Button>
                      <Button onClick={analyze} disabled={analyzing}>
                        {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando com IA...</> : "Analisar com IA"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showCamera && (
                <Card className="mt-4">
                  <CardContent className="py-6 space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="max-w-sm mx-auto rounded-lg" />
                    <div className="flex justify-center">
                      <Button onClick={capturePhoto}>Capturar foto</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Summary */}
              <Card className="border-primary/20">
                <CardContent className="py-5">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">{result.summary}</p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="py-4 text-center">
                    <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Tipo de Pele</p>
                    <p className="font-serif font-semibold">{result.skin_type}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <Sun className="w-5 h-5 text-gold mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Tom</p>
                    <p className="font-serif font-semibold">{result.tone}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Subtom</p>
                    <p className="font-serif font-semibold">{result.subtone}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Saúde da Pele</p>
                    <p className={`text-2xl font-serif font-bold ${scoreColor(result.health_score)}`}>{result.health_score}</p>
                    <Progress value={result.health_score} className="h-1.5 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Hydration */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary" /> Hidratação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{result.hydration_level}</Badge>
                </CardContent>
              </Card>

              {/* Conditions */}
              {result.conditions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-base">Condições Identificadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.conditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.location}</p>
                        </div>
                        <Badge className={severityColor[c.severity] || "bg-secondary"}>{c.severity}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-base">Recomendações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                          <Badge className={`text-[10px] ${priorityColor[r.priority] || ""}`}>{r.priority}</Badge>
                        </div>
                        <p className="text-sm">{r.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setResult(null); setImage(null); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Nova análise
                </Button>
                <Button variant="outline" asChild>
                  <a href="/routine">Ver minha rotina <ArrowRight className="w-4 h-4 ml-2" /></a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default SkinAnalysis;
