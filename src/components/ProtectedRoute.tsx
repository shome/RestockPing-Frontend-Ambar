import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, isAdminAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAdminRoute = location.pathname.startsWith('/admin');
      const isTeamRoute = location.pathname.startsWith('/team');
      
      if (isAdminRoute) {
        // For admin routes, check admin authentication
        if (!isAdminAuthenticated()) {
          navigate('/admin/login', { replace: true });
          return;
        }
      } else if (isTeamRoute) {
        // For team routes, check team authentication
        if (!isAuthenticated()) {
          navigate('/team/login', { replace: true });
          return;
        }
      } else {
        // For other routes, check if any authentication exists
        if (!isAuthenticated() && !isAdminAuthenticated()) {
          navigate('/team/login', { replace: true });
          return;
        }
      }
      
      setIsAuthChecked(true);
    };

    checkAuth();
  }, [navigate, location.pathname]);

  // Show loading while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
