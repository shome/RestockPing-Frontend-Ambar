import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OptIn from "./pages/OptIn";
import TeamPage from "./pages/TeamPage";
import TeamLoginPage from "./pages/TeamLoginPage";
import TeamDashboardPage from "./pages/TeamDashboardPage";
import TeamManagement from "./pages/TeamManagement";
import LabelsManagement from "./pages/LabelsManagement";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLabelsPage from "./pages/AdminLabelsPage";
import AdminLogsPage from "./pages/AdminLogsPage";
import AdminPinsPage from "./pages/AdminPinsPage";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/optin" element={<OptIn />} />
          <Route path="/index" element={<Index />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/login" element={<TeamLoginPage />} />
          <Route 
            path="/team/dashboard" 
            element={
              <ProtectedRoute>
                <TeamDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team/labels" 
            element={
              <LabelsManagement onBack={() => window.history.back()} />
            } 
          />
          <Route path="/team-management" element={<TeamManagement onLogout={() => window.location.href = '/'} />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/labels" 
            element={
              <ProtectedRoute>
                <AdminLabelsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/logs" 
            element={
              <ProtectedRoute>
                <AdminLogsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/pins" 
            element={
              <ProtectedRoute>
                <AdminPinsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/requests" 
            element={
              <ProtectedRoute>
                <AdminRequestsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
