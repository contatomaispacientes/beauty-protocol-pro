import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Share, Plus, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const InstallAppButton = () => {
  const { ios, installed, canPrompt, promptInstall } = usePWAInstall();
  const [open, setOpen] = useState(false);

  if (installed) return null;
  if (!ios && !canPrompt) return null;

  const handleClick = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    if (ios) setOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
      >
        <Download className="w-4 h-4" />
        Instalar app
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-2">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center font-serif">
              Instalar LUZ no iPhone
            </DialogTitle>
            <DialogDescription className="text-center">
              Adicione o app à sua tela de início para acesso rápido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </span>
              <div className="flex items-center gap-2 text-sm">
                Toque em
                <Share className="w-4 h-4 text-primary" />
                <span className="font-medium">Compartilhar</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </span>
              <div className="flex items-center gap-2 text-sm">
                Selecione
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-medium">Adicionar à Tela de Início</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </span>
              <p className="text-sm">Confirme em "Adicionar".</p>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Use o Safari para instalar. Não funciona em outros navegadores no iOS.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallAppButton;
