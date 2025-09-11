import { useState, useEffect } from "react";
import TeamLogin from "@/components/TeamLogin";
import Team from "@/pages/Team";
import { isAuthenticated, redirectToTeamLogin } from "@/lib/auth";

const TeamPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  // Check authentication status on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Set up token expiration checker
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isLoggedIn && !isAuthenticated()) {
        // Token expired, redirect to login
        redirectToTeamLogin();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiration, 30000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = (location: string) => {
    setSelectedLocation(location);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedLocation("");
  };

  return (
    <>
      {!isLoggedIn ? (
        <TeamLogin onLogin={handleLogin} />
      ) : (
        <Team onLogout={handleLogout} />
      )}
    </>
  );
};

export default TeamPage;