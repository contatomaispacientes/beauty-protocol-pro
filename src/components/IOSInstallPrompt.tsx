import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, X } from "lucide-react";
import { isIOS, isStandalone } from "@/hooks/usePWAInstall";

const STORAGE_KEY = "luz-ios-install-dismissed";
const DISMISS_DAYS = 7;

const IOSInstallPrompt = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS() || isStandalone()) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const dismissedAt = parseInt(raw, 10);
      const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (days < DISMISS_DAYS) return;
    }
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 220 }}
          className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="relative rounded-2xl border border-border/60 bg-background/85 backdrop-blur-xl shadow-2xl p-4">
            <button
              onClick={dismiss}
              aria-label="Fechar"
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <img
                src="/icon-192x192.png"
                alt="LUZ"
                className="w-12 h-12 rounded-xl shadow-sm flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-serif font-semibold text-foreground text-sm">
                  Instale o LUZ no seu iPhone
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Acesse mais rápido, direto da tela de início.
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                  1
                </span>
                Toque em
                <Share className="w-4 h-4 text-primary" />
                <span className="font-medium">Compartilhar</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                  2
                </span>
                Selecione
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-medium">Adicionar à Tela de Início</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IOSInstallPrompt;
