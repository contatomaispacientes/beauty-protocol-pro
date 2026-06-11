import { Navigate } from "react-router-dom";
import { useIsPWA } from "@/hooks/useIsPWA";
import { useAuth } from "@/hooks/useAuth";

interface PWAGateProps {
  children: React.ReactNode;
  /** If true, redirect authenticated users to /dashboard (used on /login). */
  redirectAuthedToDashboard?: boolean;
}

/**
 * When app runs in standalone PWA mode, skips institutional pages
 * and routes users straight to /login (or /dashboard if authenticated).
 * In regular browser, renders children normally.
 */
const PWAGate = ({ children, redirectAuthedToDashboard }: PWAGateProps) => {
  const isPWA = useIsPWA();
  const { user, loading } = useAuth();

  if (!isPWA) return <>{children}</>;
  if (loading) return null;

  if (redirectAuthedToDashboard && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!redirectAuthedToDashboard) {
    // Institutional route in PWA — send to dashboard if logged in, else login
    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
  }

  return <>{children}</>;
};

export default PWAGate;
