import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, SwitchCamera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (dataUrl: string, file: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const { toast } = useToast();

  const startStream = async (facing: "user" | "environment") => {
    // Stop previous stream
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    } catch {
      toast({ title: "Não foi possível acessar a câmera.", variant: "destructive" });
      onClose();
    }
  };

  useEffect(() => {
    startStream(facingMode);
    return () => {
      // cleanup on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const toggleCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startStream(next);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    fetch(dataUrl)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(dataUrl, file);
      });

    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const handleClose = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    onClose();
  };

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera container with face guide overlay */}
      <div className="relative w-full aspect-[3/4] max-h-[60vh] rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* Face guide overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Darkened edges */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Transparent oval cutout */}
          <div
            className="relative w-[65%] aspect-[3/4] rounded-[50%] border-2 border-white/70 border-dashed"
            style={{
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
              marginTop: "-5%",
            }}
          />
        </div>

        {/* Guide text */}
        <div className="absolute top-3 left-0 right-0 text-center pointer-events-none">
          <span className="text-white/90 text-xs bg-black/50 px-3 py-1 rounded-full">
            Posicione seu rosto dentro da marcação
          </span>
        </div>

        {/* Close button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Bottom controls - overlaid on video */}
        <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10"
            onClick={toggleCamera}
          >
            <SwitchCamera className="w-5 h-5" />
          </Button>

          <button
            type="button"
            onClick={capture}
            className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors flex items-center justify-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>

          {/* Spacer for centering */}
          <div className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
