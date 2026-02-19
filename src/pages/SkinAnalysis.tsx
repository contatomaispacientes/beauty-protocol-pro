import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Upload, Loader2, AlertTriangle } from "lucide-react";

const SkinAnalysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { skinType: string; tone: string; subtone: string; conditions: string[]; recommendations: string[] }>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setAnalyzing(true);
    // Placeholder — will connect to Lovable AI edge function
    await new Promise((r) => setTimeout(r, 2000));
    setResult({
      skinType: "Mista",
      tone: "Fitzpatrick III",
      subtone: "Quente",
      conditions: ["Poros dilatados na zona T", "Leve desidratação nas bochechas", "Pequenas manchas solares"],
      recommendations: ["Usar protetor solar FPS 50 diariamente", "Hidratante com ácido hialurônico", "Sérum de vitamina C pela manhã"],
    });
    setAnalyzing(false);
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

        {!result ? (
          <>
            {!image ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => fileRef.current?.click()}>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-peach flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-foreground/70" />
                    </div>
                    <p className="font-serif font-semibold text-foreground">Upload de Selfie</p>
                    <p className="text-sm text-muted-foreground mt-1">Envie uma foto do seu rosto</p>
                  </CardContent>
                </Card>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={startCamera}>
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
                  <img src={image} alt="Selfie" className="max-w-sm mx-auto rounded-lg" />
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setImage(null)}>Trocar foto</Button>
                    <Button onClick={analyze} disabled={analyzing}>
                      {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</> : "Analisar com IA"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showCamera && (
              <Card>
                <CardContent className="py-6 space-y-4">
                  <video ref={videoRef} autoPlay playsInline className="max-w-sm mx-auto rounded-lg" />
                  <div className="flex justify-center">
                    <Button onClick={capturePhoto}>Capturar foto</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tipo de Pele</CardDescription>
                  <CardTitle className="font-serif text-xl">{result.skinType}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tom de Pele</CardDescription>
                  <CardTitle className="font-serif text-xl">{result.tone}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Subtom</CardDescription>
                  <CardTitle className="font-serif text-xl">{result.subtone}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Condições Identificadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Recomendações Iniciais</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-sage mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setResult(null); setImage(null); }}>Nova análise</Button>
              <Button variant="outline" asChild><a href="/routine">Ver minha rotina</a></Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SkinAnalysis;
