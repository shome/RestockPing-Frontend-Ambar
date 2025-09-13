import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiService, TeamLoginPayload } from "@/lib/api";
import { storeToken } from "@/lib/auth";

interface TeamLoginProps {
  onLogin: (location: string) => void;
}

// Removed mock PIN validation - now using API

const TeamLogin = ({ onLogin }: TeamLoginProps) => {
  const [pin, setPin] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ location?: string; pin?: string }>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Location data state
  const [locations, setLocations] = useState<Array<{ id: string; name: string; slug: string; timezone: string }>>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
    location.slug.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Get selected location object
  const selectedLocationObj = locations.find(loc => loc.id === selectedLocation);

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      setLocationsError(null);
      
      const data = await apiService.fetchLocations();
      
      if (data.success && Array.isArray(data.locations)) {
        setLocations(data.locations);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load locations. Please try again.';
      setLocationsError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLocationsLoading(false);
    }
  };

  // Load locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredLocations[highlightedIndex]) {
          handleLocationSelect(filteredLocations[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: typeof locations[0]) => {
    setSelectedLocation(location.id);
    setLocationSearch(location.name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (errors.location) {
      setErrors({ ...errors, location: undefined });
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationSearch(value);
    setShowSuggestions(value.length > 0);
    setHighlightedIndex(-1);
    
    // Clear selection if user is typing
    if (selectedLocation && value !== selectedLocationObj?.name) {
      setSelectedLocation("");
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors: { location?: string; pin?: string } = {};

    if (!selectedLocation || !selectedLocationObj) {
      newErrors.location = "Please select a location";
    }

    if (!pin.trim()) {
      newErrors.pin = "Please enter your PIN";
    } else if (pin.length !== 4) {
      newErrors.pin = "PIN must be exactly 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload: TeamLoginPayload = {
        pin: pin,
        location_id: selectedLocation
      };

      const response = await apiService.teamLogin(payload);

      if (response.success && response.session_token && response.expires_in) {
        // Store JWT token
        storeToken(response.session_token, response.expires_in);
        
        const locationName = selectedLocationObj?.name || selectedLocation;
        toast({
          title: "Welcome back",
          description: `Successfully logged in to ${locationName}`,
        });
        
        onLogin(selectedLocation);
      } else {
        // Handle API error response
        const errorMessage = response.message || "Login failed. Please try again.";
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setErrors({ ...errors, pin: errorMessage });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle network or other errors
      let errorMessage = "Network error. Please check your connection and try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setErrors({ ...errors, pin: errorMessage });
    } finally {
      setIsLoading(false);
    }
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
            {/* Location Selection */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Location *
              </label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    locationsLoading 
                      ? "Loading locations..." 
                      : locationsError 
                        ? "Error loading locations" 
                        : "Type to search locations..."
                  }
                  value={locationSearch}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(locationSearch.length > 0 && !locationsLoading && !locationsError)}
                  disabled={locationsLoading || !!locationsError}
                  className={`pr-8 ${errors.location ? 'border-destructive' : ''} ${locationsError ? 'border-destructive' : ''}`}
                />
                {selectedLocationObj && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
                {locationsLoading && (
                  <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>
              
              {/* Inline Suggestions */}
              {showSuggestions && !locationsLoading && !locationsError && filteredLocations.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredLocations.map((location, index) => (
                    <div
                      key={location.id}
                      className={cn(
                        "px-3 py-2 cursor-pointer border-b border-border last:border-b-0",
                        "hover:bg-muted transition-colors",
                        index === highlightedIndex && "bg-muted",
                        selectedLocation === location.id && "bg-primary/10"
                      )}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{location.name}</span>
                          <span className="text-xs text-muted-foreground">{location.timezone}</span>
                        </div>
                        {selectedLocation === location.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showSuggestions && !locationsLoading && !locationsError && filteredLocations.length === 0 && locationSearch.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3">
                  <p className="text-sm text-muted-foreground text-center">No locations found</p>
                </div>
              )}

              {showSuggestions && locationsLoading && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading locations...</p>
                  </div>
                </div>
              )}
              
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
              
              {locationsError && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive mb-2">{locationsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLocations}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Enter PIN *
              </label>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(value);
                  if (errors.pin) {
                    setErrors({ ...errors, pin: undefined });
                  }
                }}
                className={`text-center text-2xl tracking-widest ${errors.pin ? 'border-destructive' : ''}`}
                maxLength={4}
              />
              {errors.pin && (
                <p className="text-sm text-destructive">{errors.pin}</p>
              )}
            </div>

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
          
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLogin;