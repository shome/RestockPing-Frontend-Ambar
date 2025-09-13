import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

const TeamPage = () => {
  const navigate = useNavigate();

  // Check authentication status on component mount and redirect accordingly
  useEffect(() => {
    if (isAuthenticated()) {
      // User is authenticated, redirect to dashboard
      navigate('/team/dashboard');
    } else {
      // User is not authenticated, redirect to login
      navigate('/team/login');
    }
  }, [navigate]);

  // This component just handles routing, so return null
  return null;
};

export default TeamPage;