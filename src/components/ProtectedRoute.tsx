import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading, isAdmin, isSuperAdmin } = useUserRole();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);

  useEffect(() => {
    let cancel = false;
    if (!user) {
      setCheckingProfile(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("questionnaire_completed, account_type")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancel) return;
      const isPatient = !data?.account_type || data.account_type === "consumer";
      setNeedsQuestionnaire(isPatient && !data?.questionnaire_completed);
      setCheckingProfile(false);
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  if (authLoading || roleLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const hasRole = roles.includes(requiredRole) || roles.includes("super_admin");
    if (!hasRole) return <Navigate to="/dashboard" replace />;
  }

  // Force questionnaire on first access (patients only, not admin/super_admin)
  if (
    needsQuestionnaire &&
    !isAdmin &&
    !isSuperAdmin &&
    location.pathname !== "/questionnaire"
  ) {
    return <Navigate to="/questionnaire" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
