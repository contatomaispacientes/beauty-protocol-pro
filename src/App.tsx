import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import SkinAnalysis from "./pages/SkinAnalysis";
import Routine from "./pages/Routine";
import Colorimetry from "./pages/Colorimetry";
import Products from "./pages/Products";
import Chat from "./pages/Chat";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminReports from "./pages/admin/AdminReports";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminInvites from "./pages/admin/AdminInvites";

// Super Admin pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";
import SuperAdminTenants from "./pages/super-admin/SuperAdminTenants";
import SuperAdminFeatures from "./pages/super-admin/SuperAdminFeatures";
import SuperAdminStats from "./pages/super-admin/SuperAdminStats";
import SuperAdminPlatform from "./pages/super-admin/SuperAdminPlatform";
import SitePage from "./pages/SitePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Patient (user) routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
          <Route path="/skin-analysis" element={<ProtectedRoute><SkinAnalysis /></ProtectedRoute>} />
          <Route path="/routine" element={<ProtectedRoute><Routine /></ProtectedRoute>} />
          <Route path="/colorimetry" element={<ProtectedRoute><Colorimetry /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute requiredRole="admin"><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="admin"><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/invites" element={<ProtectedRoute requiredRole="admin"><AdminInvites /></ProtectedRoute>} />

          {/* Super Admin routes */}
          <Route path="/super-admin" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/users" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminUsers /></ProtectedRoute>} />
          <Route path="/super-admin/tenants" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminTenants /></ProtectedRoute>} />
          <Route path="/super-admin/features" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminFeatures /></ProtectedRoute>} />
          <Route path="/super-admin/stats" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminStats /></ProtectedRoute>} />
          <Route path="/super-admin/platform" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminPlatform /></ProtectedRoute>} />

          {/* Dynamic site pages */}
          <Route path="/page/:slug" element={<SitePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
