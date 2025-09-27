import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  AlertCircle, 
  Search, 
  MapPin,
  RefreshCw,
  Loader2,
  Clock,
  User,
  Image,
  CheckCircle,
  X
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApiService, AdminRequestsResponse, AdminRequestEntry, AdminRequestMapPayload, AdminLabelEntry } from '@/lib/adminApi';
import { maskPhoneNumber } from '@/lib/phoneUtils';
import AdminNavigation from '@/components/AdminNavigation';

const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<AdminRequestEntry[]>([]);
  const [labels, setLabels] = useState<AdminLabelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AdminRequestEntry | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [total, setTotal] = useState(0);
  const [cantFindCount, setCantFindCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debounce search query to avoid API calls on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchRequests();
    fetchLabels();
  }, [debouncedSearchQuery, offset]);

  const fetchRequests = async () => {
    try {
      // If this is the first load or search changed, show full loading
      if (offset === 0) {
        setIsLoading(true);
      } else {
        // If loading more data, show loading more state
        setIsLoadingMore(true);
      }
      
      const response = await adminApiService.getRequests(limit, offset);
      
      if (offset === 0) {
        // First load or search - replace data
        setRequests(response.requests);
      } else {
        // Loading more - append data
        setRequests(prev => [...prev, ...response.requests]);
      }
      
      setTotal(response.total_requests);
      setCantFindCount(response.cant_find_count);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load requests";
      toast({
        title: "Error loading requests",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchLabels = async () => {
    try {
      setIsLoadingLabels(true);
      const response = await adminApiService.getLabels('', 100, 0); // Get all labels
      setLabels(response.labels);
    } catch (error: any) {
      console.error('Error fetching labels:', error);
      // Fallback to mock labels if API fails
      const mockLabels = [
        { id: '740305ac-77b6-420b-b77e-63ac65c23b8f', name: 'Smartphones', code: 'PHONE' },
        { id: 'a4119f69-843c-41cc-90af-3cc624d2f6be', name: 'Laptops', code: 'LAPTOP' },
        { id: 'a0edf7f7-2e34-49f5-ac5c-b50fcc11156e', name: 'Tablets', code: 'TABLET' },
        { id: 'f7912b4a-6f73-4096-a0a3-5552cc6b77db', name: 'Headphones', code: 'HEADPHONES' },
        { id: 'fa4373b5-d93b-4df3-9dd1-a7f69a4da18d', name: 'Cameras (Updated1)', code: 'CAMERA' },
        { id: '892efaa5-a321-42a9-ad56-f78a49ea5b77', name: 'Drones', code: 'DRONE' },
        { id: '0329ccb2-a762-46d8-88d1-c9150102d1e5', name: 'Gaming', code: 'GAMING' },
        { id: 'e49b1f24-03f5-42f5-8c9b-0e8e15773a48', name: 'Monitors', code: 'MONITOR' },
        { id: '8bbf3383-7313-4d18-a3e3-b9bb9d231ecc', name: 'Smartwatches', code: 'SMARTWATCH' },
        { id: 'd83bf7f4-a10a-45b8-8b79-6540cc7ee70c', name: 'Televisions', code: 'TV' }
      ];
      setLabels(mockLabels);
      toast({
        title: "Using fallback labels",
        description: "Could not load labels from API, using cached data",
        variant: "default",
      });
    } finally {
      setIsLoadingLabels(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOffset(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setOffset(0);
  };

  const handleMapRequest = async () => {
    if (!selectedRequest || !selectedLabelId) {
      toast({
        title: "Missing information",
        description: "Please select a request and a label to map",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMapping(true);
      const payload: AdminRequestMapPayload = {
        labelId: selectedLabelId
      };

      const response = await adminApiService.mapRequest(selectedRequest.id, payload);
      
      if (response.success) {
        toast({
          title: "Request mapped",
          description: `Request successfully mapped to label "${response.request.matched_label_name}"`,
        });
        setShowMapDialog(false);
        setSelectedRequest(null);
        setSelectedLabelId('');
        fetchRequests();
      }
    } catch (error: any) {
      console.error('Error mapping request:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to map request to label";
      toast({
        title: "Error mapping request",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMapping(false);
    }
  };

  const openMapDialog = (request: AdminRequestEntry) => {
    setSelectedRequest(request);
    setSelectedLabelId('');
    setShowMapDialog(true);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'mapped':
      case 'closed':
        return 'text-green-600';
      case 'open':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'mapped':
      case 'closed':
        return 'default';
      case 'open':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredRequests = requests.filter(request => 
    searchQuery === '' || 
    request.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.location_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

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
                <h1 className="text-2xl font-bold">Customer Requests</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={fetchRequests}
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
          {isLoading && requests.length === 0 ? (
            <div className="space-y-6">
              {/* Search Card Skeleton */}
              <Card className="mb-6">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Table Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Table Skeleton */}
                  <div className="space-y-4">
                    <div className="border rounded-lg">
                      {/* Table Header */}
                      <div className="border-b p-4">
                        <div className="grid grid-cols-6 gap-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 border-b last:border-b-0">
                          <div className="grid grid-cols-6 gap-4 items-center">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination Skeleton */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                All customer requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Can't Find</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{cantFindCount}</div>
              <p className="text-xs text-muted-foreground">
                "Can't find it?" requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mapped</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'mapped').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully mapped
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find requests by text, location, or status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Requests</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by text, location, or status..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Requests ({total})</CardTitle>
            <CardDescription>
              {searchQuery ? `Search results for "${searchQuery}"` : 'All customer requests in the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {/* Table Header Skeleton */}
                <div className="border rounded-lg">
                  <div className="border-b p-4">
                    <div className="grid grid-cols-6 gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  
                  {/* Table Rows Skeleton */}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="p-4 border-b last:border-b-0">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Text</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Matched Label</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="truncate">{request.text}</p>
                            {request.image_url && (
                              <div className="flex items-center gap-1 mt-1">
                                <Image className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Has image</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.phone_number ? (
                            <div className="font-mono text-sm">
                              {maskPhoneNumber(request.phone_number)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No phone</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDate(request.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.matched_label_name ? (
                            <Badge variant="outline">
                              {request.matched_label_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Not mapped</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {request.location_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={request.is_cant_find ? "destructive" : "outline"}
                            className={`px-3 py-1 text-xs font-semibold text-center ${
                              request.is_cant_find 
                                ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 shadow-sm" 
                                : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                            }`}
                          >
                            {request.is_cant_find ? "Can't Find" : "Regular"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {request.webhook_valid !== undefined && (
                              <Badge 
                                variant={request.webhook_valid ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {request.webhook_valid ? "Valid" : "Invalid"}
                              </Badge>
                            )}
                            {request.webhook_source && (
                              <div className="text-xs text-muted-foreground">
                                {request.webhook_source}
                              </div>
                            )}
                            {request.webhook_error && (
                              <div className="text-xs text-red-600 max-w-32 truncate" title={request.webhook_error}>
                                {request.webhook_error}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.status !== 'mapped' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openMapDialog(request)}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Map
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No requests found matching your search' : 'No requests found'}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Load More Section */}
        {requests.length > 0 && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {requests.length} of {total} requests
                </div>
                <div className="flex gap-2">
                  {offset + limit < total ? (
                    <Button
                      variant="outline"
                      onClick={() => setOffset(offset + limit)}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading More...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      All requests loaded
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading More Skeleton */}
        {isLoadingMore && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Request Dialog */}
        <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Map Request to Label</DialogTitle>
              <DialogDescription>
                Select a label to map this request to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRequest && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Request Details</h4>
                  <p className="text-sm text-muted-foreground mb-2">{selectedRequest.text}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Location: {selectedRequest.location_name}</span>
                    <span>Created: {formatDate(selectedRequest.created_at)}</span>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="label-select">Select Label</Label>
                <Select
                  value={selectedLabelId}
                  onValueChange={setSelectedLabelId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a label to map this request to" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLabels ? (
                      <SelectItem value="" disabled>
                        Loading labels...
                      </SelectItem>
                    ) : (
                      labels.map((label) => (
                        <SelectItem key={label.id} value={label.id}>
                          {label.name} ({label.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMapDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMapRequest}
                  disabled={!selectedLabelId || isMapping}
                >
                  {isMapping ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  Map Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
