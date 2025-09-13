import { useEffect } from "react";
import Team from "@/pages/Team";
import { isAuthenticated, redirectToTeamLogin } from "@/lib/auth";

const TeamDashboardPage = () => {
  // Set up token expiration checker
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (!isAuthenticated()) {
        // Token expired, redirect to login
        redirectToTeamLogin();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiration, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Clear token and redirect to login
    redirectToTeamLogin();
  };

  // ProtectedRoute ensures we're authenticated, so we can render Team directly
  return <Team onLogout={handleLogout} />;
};

export default TeamDashboardPage;
