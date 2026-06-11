import { useEffect, useState } from "react";

function check(): boolean {
  if (typeof window === "undefined") return false;
  if ((window.navigator as any).standalone === true) return true;
  return window.matchMedia?.("(display-mode: standalone)").matches ?? false;
}

export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState<boolean>(check);

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setIsPWA(check());
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return isPWA;
}
