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
          <Route path="/" element={<OptIn />} />
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
          <Route path="/team-management" element={<TeamManagement onLogout={() => window.location.href = '/'} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
