import { useNavigate } from "react-router-dom";
import TeamLogin from "@/components/TeamLogin";

const TeamLoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (location: string) => {
    // Navigate to dashboard after successful login
    navigate('/team/dashboard');
  };

  return <TeamLogin onLogin={handleLogin} />;
};

export default TeamLoginPage;
