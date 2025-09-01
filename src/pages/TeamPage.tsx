import { useState } from "react";
import TeamLogin from "@/components/TeamLogin";
import Team from "@/pages/Team";

const TeamPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {!isLoggedIn ? (
        <TeamLogin onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Team onLogout={() => setIsLoggedIn(false)} />
      )}
    </>
  );
};

export default TeamPage;