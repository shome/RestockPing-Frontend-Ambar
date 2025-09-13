import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Eye, EyeOff, ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PinLoginProps {
  onLogin: (pin: string, location: string) => void;
  onBack: () => void;
}

const PinLogin = ({ onLogin, onBack }: PinLoginProps) => {
  const [pin, setPin] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Valid PINs for demo (in production, this would be server-side)
  const validPins = ["1234", "5678", "9999"];

  // Available locations
  const locations = [
    { id: "store-001", name: "Downtown Store", address: "123 Main St, Downtown" },
    { id: "store-002", name: "Mall Location", address: "456 Mall Ave, Shopping Center" },
    { id: "store-003", name: "Airport Store", address: "789 Airport Blvd, Terminal 2" },
    { id: "store-004", name: "University Store", address: "321 Campus Dr, University District" },
    { id: "store-005", name: "Suburban Store", address: "654 Oak St, Suburbia" }
  ];

  const handleNumberClick = (number: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + number);
      setError("");
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      setError("Please select a location first");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      if (validPins.includes(pin)) {
        const locationName = locations.find(loc => loc.id === selectedLocation)?.name || selectedLocation;
        toast({
          title: "Login successful",
          description: `Welcome to ${locationName}`,
        });
        onLogin(pin, selectedLocation);
      } else {
        setError("Invalid PIN");
        toast({
          title: "Login failed",
          description: "Please check your PIN and try again",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  // Auto-submit when PIN is complete and location is selected
  useEffect(() => {
    if (pin.length === 4 && selectedLocation) {
      handleSubmit();
    }
  }, [pin, selectedLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Team Login</CardTitle>
            <CardDescription>
              Enter your 4-digit PIN to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your store location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-xs text-muted-foreground">{location.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center text-lg font-mono ${
                      index < pin.length
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {showPin && index < pin.length ? pin[index] : 
                     index < pin.length ? "•" : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Show/Hide PIN */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="text-muted-foreground"
              >
                {showPin ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide PIN
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show PIN
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  size="lg"
                  className="h-16 sm:h-14 text-lg font-semibold touch-manipulation"
                  onClick={() => handleNumberClick(number.toString())}
                  disabled={isLoading}
                >
                  {number}
                </Button>
              ))}
              <Button
                variant="outline"
                size="lg"
                className="h-16 sm:h-14 touch-manipulation"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 sm:h-14 text-lg font-semibold touch-manipulation"
                onClick={() => handleNumberClick("0")}
                disabled={isLoading}
              >
                0
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 sm:h-14 touch-manipulation"
                onClick={handleBackspace}
                disabled={isLoading}
              >
                ⌫
              </Button>
            </div>

            {/* Manual PIN Input (for accessibility) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Or enter PIN manually:
              </label>
              <Input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(value);
                  setError("");
                }}
                placeholder="Enter 4-digit PIN"
                className="text-center text-lg font-mono"
                disabled={isLoading}
              />
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={onBack}
                disabled={isLoading}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Verifying PIN...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo PINs */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Demo PINs: 1234, 5678, 9999
          </p>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;
