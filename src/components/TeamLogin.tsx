import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamLoginProps {
  onLogin: () => void;
}

const VALID_PINS = ["1234", "5678"]; // Max 2 active PINs as per requirements

const TeamLogin = ({ onLogin }: TeamLoginProps) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      toast({
        title: "PIN required",
        description: "Please enter your PIN.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate PIN validation
    setTimeout(() => {
      if (VALID_PINS.includes(pin)) {
        toast({
          title: "Welcome back",
          description: "Successfully logged in to team dashboard.",
        });
        onLogin();
      } else {
        toast({
          title: "Invalid PIN",
          description: "Please check your PIN and try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-accent rounded-full p-3 w-fit">
            <Shield className="h-8 w-8 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl">Team Access</CardTitle>
          <CardDescription>
            Enter your PIN to access the team dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-2xl tracking-widest"
              maxLength={4}
            />
            <Button 
              type="submit" 
              variant="team" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo PINs:</strong> 1234 or 5678
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLogin;