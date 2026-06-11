import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrandingProvider } from "@/contexts/BrandingContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import SkinAnalysis from "./pages/SkinAnalysis";
import Routine from "./pages/Routine";
import Products from "./pages/Products";
import Chat from "./pages/Chat";
import Timeline from "./pages/Timeline";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import IOSInstallPrompt from "./components/IOSInstallPrompt";
import PWAGate from "./components/PWAGate";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminReports from "./pages/admin/AdminReports";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminInvites from "./pages/admin/AdminInvites";
import AdminPatientTimeline from "./pages/admin/AdminPatientTimeline";

// Super Admin pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";
import SuperAdminTenants from "./pages/super-admin/SuperAdminTenants";
import SuperAdminFeatures from "./pages/super-admin/SuperAdminFeatures";
import SuperAdminStats from "./pages/super-admin/SuperAdminStats";
import SuperAdminPlatform from "./pages/super-admin/SuperAdminPlatform";
import SitePage from "./pages/SitePage";
import About from "./pages/About";
import Professionals from "./pages/Professionals";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrandingProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <IOSInstallPrompt />
        <Routes>
          {/* Public */}
          <Route path="/" element={<PWAGate><Index /></PWAGate>} />
          <Route path="/login" element={<PWAGate redirectAuthedToDashboard><Login /></PWAGate>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<PWAGate><About /></PWAGate>} />
          <Route path="/professionals" element={<PWAGate><Professionals /></PWAGate>} />
          <Route path="/contact" element={<PWAGate><Contact /></PWAGate>} />

          {/* Patient (user) routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
          <Route path="/skin-analysis" element={<ProtectedRoute><SkinAnalysis /></ProtectedRoute>} />
          <Route path="/routine" element={<ProtectedRoute><Routine /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute requiredRole="admin"><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="admin"><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/invites" element={<ProtectedRoute requiredRole="admin"><AdminInvites /></ProtectedRoute>} />
          <Route path="/admin/patients/:patientId/timeline" element={<ProtectedRoute requiredRole="admin"><AdminPatientTimeline /></ProtectedRoute>} />

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
    </BrandingProvider>
  </QueryClientProvider>
);

export default App;
