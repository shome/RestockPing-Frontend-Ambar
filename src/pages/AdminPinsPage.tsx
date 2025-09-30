import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Key, 
  Users, 
  Plus,
  RefreshCw,
  Loader2,
  Edit,
  RotateCcw,
  Ban,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApiService, AdminPinEntry, AdminLocationsResponse } from '@/lib/adminApi';
import AdminNavigation from '@/components/AdminNavigation';

const AdminPinsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTeamPinDialog, setShowTeamPinDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [teamPins, setTeamPins] = useState<AdminPinEntry[]>([]);
  const [locations, setLocations] = useState<Array<{id: string, name: string}>>([]);
  const [selectedPin, setSelectedPin] = useState<AdminPinEntry | null>(null);
  const [teamPinForm, setTeamPinForm] = useState({
    pin: '',
    locationId: '',
    expireAt: ''
  });
  const [editPinForm, setEditPinForm] = useState({
    pin: '',
    expireAt: '',
    status: 'active' as 'active' | 'disabled'
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
        fetchPins(),
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
    if (!teamPinForm.locationId) {
      toast({
        title: "Missing information",
        description: "Please select a location",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the new API function signature
      const response = await adminApiService.createTeamPin(
        teamPinForm.locationId,
        teamPinForm.expireAt || undefined
      );
      
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
      const errorMessage = error.message || "Failed to create team PIN";
      toast({
        title: "Error creating team PIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPin = (pin: AdminPinEntry) => {
    setSelectedPin(pin);
    setEditPinForm({
      pin: pin.pin,
      expireAt: new Date(pin.expire_at).toISOString().slice(0, 16),
      status: pin.status || 'active'
    });
    setShowEditDialog(true);
  };

  const handleRotatePin = async (pin: AdminPinEntry) => {
    try {
      setIsLoading(true);
      
      // First delete the old PIN, then create a new one
      await adminApiService.deleteTeamPin(pin.id);
      
      // Create a new PIN for the same location
      const response = await adminApiService.createTeamPin(
        pin.location_id || 'default-location', // You might need to store location_id in AdminPinEntry
        pin.expire_at
      );
      
      if (response.success) {
        toast({
          title: "PIN rotated",
          description: `New PIN created: ${response.pin}`,
        });
        fetchPins();
      }
    } catch (error: any) {
      console.error('Error rotating PIN:', error);
      const errorMessage = error.message || "Failed to rotate PIN";
      toast({
        title: "Error rotating PIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (pin: AdminPinEntry) => {
    const isCurrentlyActive = pin.status === 'active' || pin.active;
    
    try {
      setIsLoading(true);
      
      if (isCurrentlyActive) {
        // Disable the PIN
        const response = await adminApiService.disableTeamPin(pin.id);
        
        if (response.success) {
          toast({
            title: "PIN disabled",
            description: `PIN ${pin.pin} has been disabled`,
          });
          fetchPins();
        }
      } else {
        toast({
          title: "Cannot enable PIN",
          description: "Disabled PINs cannot be re-enabled. Please create a new PIN.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error updating PIN status:', error);
      const errorMessage = error.message || "Failed to update PIN status";
      toast({
        title: "Error updating PIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!selectedPin) {
      toast({
        title: "No PIN selected",
        description: "Please select a PIN to update",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // For now, we'll just disable the PIN since backend doesn't support direct updates
      // In the future, you might want to delete and recreate with new settings
      if (editPinForm.status === 'disabled') {
        const response = await adminApiService.disableTeamPin(selectedPin.id);
        
        if (response.success) {
          toast({
            title: "PIN updated",
            description: "PIN has been disabled",
          });
          setShowEditDialog(false);
          setSelectedPin(null);
          fetchPins();
        }
      } else {
        toast({
          title: "Update not supported",
          description: "PIN editing is limited. You can disable PINs or create new ones.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error updating PIN:', error);
      const errorMessage = error.message || "Failed to update PIN";
      toast({
        title: "Error updating PIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePin = async () => {
    if (!selectedPin) return;

    try {
      setIsLoading(true);
      const response = await adminApiService.deleteTeamPin(selectedPin.id);
      
      if (response.success) {
        toast({
          title: "PIN deleted",
          description: "PIN deleted successfully",
        });
        setShowDeleteDialog(false);
        setSelectedPin(null);
        fetchPins();
      }
    } catch (error: any) {
      console.error('Error deleting PIN:', error);
      const errorMessage = error.message || "Failed to delete PIN";
      toast({
        title: "Error deleting PIN",
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

  const getExpiryStatus = (expireAt: string, status?: string) => {
    if (status === 'disabled') {
      return { status: 'disabled', color: 'text-gray-600', badge: 'secondary' as const };
    }
    
    const now = new Date();
    const expiry = new Date(expireAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', badge: 'destructive' as const };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'text-yellow-600', badge: 'secondary' as const };
    } else {
      return { status: 'active', color: 'text-green-600', badge: 'default' as const };
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
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          <p>📌 The PIN will be automatically generated by the system</p>
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
                      const expiryStatus = getExpiryStatus(pin.expire_at, pin.status);
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditPin(pin)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit PIN
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRotatePin(pin)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Rotate PIN
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(pin)}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  {pin.status === 'active' ? 'Disable' : 'Enable'} PIN
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPin(pin);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete PIN
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Edit PIN Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team PIN</DialogTitle>
              <DialogDescription>
                Update the PIN details for {selectedPin?.location_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-pin">PIN</Label>
                <Input
                  id="edit-pin"
                  placeholder="Enter 4-digit PIN"
                  value={editPinForm.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setEditPinForm({ ...editPinForm, pin: value });
                  }}
                  maxLength={4}
                  className="text-left text-lg tracking-widest"
                />
              </div>
              <div>
                <Label htmlFor="edit-expireAt">Expiry Date</Label>
                <Input
                  id="edit-expireAt"
                  type="datetime-local"
                  value={editPinForm.expireAt}
                  onChange={(e) => setEditPinForm({ ...editPinForm, expireAt: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editPinForm.status}
                  onValueChange={(value: 'active' | 'disabled') => setEditPinForm({ ...editPinForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Update PIN
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete PIN Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team PIN</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete PIN {selectedPin?.pin} for {selectedPin?.location_name}?
                This action cannot be undone and will immediately prevent team members from using this PIN to log in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePin}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete PIN
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AdminPinsPage;
