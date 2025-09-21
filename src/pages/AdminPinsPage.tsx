import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Key, 
  Users, 
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApiService, AdminTeamPinCreatePayload, AdminPinEntry, AdminLocationsResponse } from '@/lib/adminApi';
import AdminNavigation from '@/components/AdminNavigation';

const AdminPinsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTeamPinDialog, setShowTeamPinDialog] = useState(false);
  const [teamPins, setTeamPins] = useState<AdminPinEntry[]>([]);
  const [locations, setLocations] = useState<Array<{id: string, name: string}>>([]);
  const [teamPinForm, setTeamPinForm] = useState({
    pin: '',
    locationId: '',
    expireAt: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch data on component mount
  React.useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchPins('team'),
        fetchLocations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPins = async () => {
    try {
      const response = await adminApiService.getPins('team');
      setTeamPins(response.pins);
    } catch (error: any) {
      console.error('Error fetching team pins:', error);
      setTeamPins([]);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load team pins';
      toast({
        title: 'Error loading team pins',
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await adminApiService.getLocations();
      setLocations(response.locations);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
      // Fallback to mock locations if API fails
      setLocations([
        { id: 'loc-1', name: 'Paris Office' },
        { id: 'loc-2', name: 'London Office' },
        { id: 'loc-3', name: 'New York Office' }
      ]);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load locations, using fallback data";
      toast({
        title: "Error loading locations",
        description: errorMessage,
        variant: "default",
      });
    }
  };

  const handleCreateTeamPin = async () => {
    if (!teamPinForm.pin || !teamPinForm.locationId || !teamPinForm.expireAt) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (teamPinForm.pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload: AdminTeamPinCreatePayload = {
        pin: teamPinForm.pin,
        locationId: teamPinForm.locationId,
        expireAt: teamPinForm.expireAt
      };

      const response = await adminApiService.createTeamPin(payload);
      
      if (response.success) {
        toast({
          title: "Team PIN created",
          description: `PIN ${response.pin} created successfully`,
        });
        setShowTeamPinDialog(false);
        setTeamPinForm({ pin: '', locationId: '', expireAt: '' });
        // Refresh team pins data
        fetchPins();
      }
    } catch (error: any) {
      console.error('Error creating team PIN:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create team PIN";
      toast({
        title: "Error creating team PIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expireAt: string) => {
    return new Date(expireAt) < new Date();
  };

  const getExpiryStatus = (expireAt: string) => {
    const now = new Date();
    const expiry = new Date(expireAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', badge: 'destructive' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'text-yellow-600', badge: 'secondary' };
    } else {
      return { status: 'active', color: 'text-green-600', badge: 'default' };
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <AdminNavigation />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">PINs Management</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={fetchAllData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team PINs</CardTitle>
                    <CardDescription>
                      Manage team PINs for location-based access
                    </CardDescription>
                  </div>
                  <Dialog open={showTeamPinDialog} onOpenChange={setShowTeamPinDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team PIN
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Team PIN</DialogTitle>
                        <DialogDescription>
                          Create a new team PIN for a specific location
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="pin">PIN</Label>
                          <Input
                            id="pin"
                            placeholder="Enter 4-digit PIN (e.g., 1234)"
                            value={teamPinForm.pin}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setTeamPinForm({ ...teamPinForm, pin: value });
                            }}
                            maxLength={4}
                            className="text-left text-lg tracking-widest"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Select
                            value={teamPinForm.locationId}
                            onValueChange={(value) => setTeamPinForm({ ...teamPinForm, locationId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="expireAt">Expiry Date</Label>
                          <Input
                            id="expireAt"
                            type="datetime-local"
                            value={teamPinForm.expireAt}
                            onChange={(e) => setTeamPinForm({ ...teamPinForm, expireAt: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowTeamPinDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateTeamPin}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Create PIN
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : teamPins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No team PINs found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamPins.map((pin) => {
                      const expiryStatus = getExpiryStatus(pin.expire_at);
                      return (
                        <div key={pin.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Key className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium font-mono text-lg">{pin.pin}</p>
                              <p className="text-sm text-muted-foreground">{pin.location_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Expires</p>
                              <p className={`text-sm ${expiryStatus.color}`}>
                                {formatDate(pin.expire_at)}
                              </p>
                            </div>
                            <Badge variant={expiryStatus.badge}>
                              {expiryStatus.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Team PIN Management</CardTitle>
            <CardDescription>
              Understanding team PIN management and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team PINs
                </h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Team PINs are location-specific and allow access to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Team dashboard for the specific location</li>
                    <li>Product scanning and alert sending</li>
                    <li>Location-specific label management</li>
                    <li>Team-based authentication and access control</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPinsPage;
