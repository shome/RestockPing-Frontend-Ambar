import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Upload, 
  Download,
  RefreshCw,
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApiService, AdminLabel, AdminLabelsResponse, AdminLabelUpdatePayload, AdminCSVImportResponse } from '@/lib/adminApi';
import { maskPhoneNumber } from '@/lib/phoneUtils';
import AdminNavigation from '@/components/AdminNavigation';

const AdminLabelsPage: React.FC = () => {
  const [labels, setLabels] = useState<AdminLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLabel, setEditingLabel] = useState<AdminLabel | null>(null);
  const [editForm, setEditForm] = useState<AdminLabelUpdatePayload>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<AdminCSVImportResponse | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [locations, setLocations] = useState<Array<{id: string, name: string}>>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debounce search query to avoid API calls on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchLabels();
    fetchLocations();
  }, [debouncedSearchQuery, offset]);

  const fetchLabels = async () => {
    try {
      // If this is the first load or search changed, show full loading
      if (offset === 0) {
        setIsLoading(true);
      } else {
        // If loading more data, show loading more state
        setIsLoadingMore(true);
      }
      
      const response = await adminApiService.getLabels(debouncedSearchQuery, limit, offset);
      
      // 🔍 Debug: Log labels data to check subscribers_count
      console.log('📥 Labels received from API:', response.labels);
      response.labels.forEach((label, index) => {
        console.log(`Label ${index + 1} (${label.name}):`, {
          subscribers_count: label.subscribers_count,
          total_sends: label.total_sends,
          hasSubscribersCount: label.subscribers_count !== undefined,
          subscribersCountType: typeof label.subscribers_count
        });
      });
      
      if (offset === 0) {
        // First load or search - replace data
        setLabels(response.labels);
      } else {
        // Loading more - append data
        setLabels(prev => [...prev, ...response.labels]);
      }
      
      setTotal(response.total);
    } catch (error: any) {
      console.error('Error fetching labels:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load labels";
      toast({
        title: "Error loading labels",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await adminApiService.getLocations();
      setLocations(response.locations);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
      setLocations([]);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load locations";
      toast({
        title: "Error loading locations",
        description: errorMessage,
        variant: "destructive",
      });
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

  const handleEdit = (label: AdminLabel) => {
    setEditingLabel(label);
    setEditForm({
      name: label.name,
      synonyms: label.synonyms,
      active: label.active,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLabel) return;

    try {
      setIsSaving(true);
      const response = await adminApiService.updateLabel(editingLabel.id, editForm);
      if (response.success) {
        toast({
          title: "Label updated",
          description: "Label has been updated successfully",
        });
        setShowEditDialog(false);
        setEditingLabel(null);
        setEditForm({});
        fetchLabels();
      }
    } catch (error: any) {
      console.error('Error updating label:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update label";
      toast({
        title: "Error updating label",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingLabel(null);
    setEditForm({});
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedLocationId) {
      toast({
        title: "Location Required",
        description: "Please select a location before importing CSV",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const response = await adminApiService.importLabelsCSV(file, selectedLocationId);
      setUploadResult(response);
      toast({
        title: "CSV Non-Destructive Merge Complete",
        description: `Successfully processed: ${response.imported} new, ${response.updated} updated, ${response.total_merged} total labels (no data loss)`,
      });
      setShowUploadDialog(false);
      setSelectedLocationId('');
      fetchLabels();
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload CSV file";
      toast({
        title: "Error uploading CSV",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deduplicateLabels = (labelsArray: AdminLabel[]): AdminLabel[] => {
    const uniqueLabels = Array.from(
      new Map(labelsArray.map(label => [label.code, label])).values()
    );
    
    console.log(`🔄 Client-side deduplication: ${labelsArray.length} → ${uniqueLabels.length} unique labels`);
    return uniqueLabels;
  };

  const handleDownloadCSV = async () => {
    try {
      setIsLoading(true);
      const blob = await adminApiService.exportLabelsCSV();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `labels_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "CSV Export Complete",
        description: "Labels have been exported successfully (duplicates automatically removed)",
      });
    } catch (error: any) {
      console.error('Error downloading CSV:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to download CSV";
      toast({
        title: "Error downloading CSV",
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
                <h1 className="text-2xl font-bold">Labels Management</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadCSV}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Labels CSV</DialogTitle>
                      <DialogDescription>
                        Upload a CSV file to import or update labels
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location-select">Location *</Label>
                        <Select
                          value={selectedLocationId}
                          onValueChange={setSelectedLocationId}
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
                        <Label htmlFor="csv-file">CSV File *</Label>
                        <Input
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                          disabled={isUploading}
                        />
                      </div>
                      {uploadResult && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-800">Non-Destructive Merge Results</h4>
                          <div className="text-sm text-green-700 space-y-1">
                            <p><strong>New Labels:</strong> {uploadResult.imported}</p>
                            <p><strong>Updated Labels:</strong> {uploadResult.updated}</p>
                            <p><strong>Total Merged:</strong> {uploadResult.total_merged || 'N/A'}</p>
                            <p><strong>Existing Before:</strong> {uploadResult.total_existing || 'N/A'}</p>
                            {uploadResult.errors > 0 && (
                              <p className="text-red-600"><strong>Errors:</strong> {uploadResult.errors}</p>
                            )}
                            {uploadResult.success_rate && (
                              <p><strong>Success Rate:</strong> {uploadResult.success_rate.toFixed(1)}%</p>
                            )}
                          </div>
                          {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-xs font-medium text-red-800">Error Details:</p>
                              <ul className="text-xs text-red-700 mt-1 space-y-1">
                                {uploadResult.errorDetails.slice(0, 3).map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                                {uploadResult.errorDetails.length > 3 && (
                                  <li className="italic">... and {uploadResult.errorDetails.length - 3} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={fetchLabels}
                  disabled={isLoading}
                  className="hover:bg-accent hover:text-accent-foreground min-w-[100px]"
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
          {isLoading && labels.length === 0 ? (
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
                      <Skeleton className="h-8 w-20" />
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
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 border-b last:border-b-0">
                          <div className="grid grid-cols-6 gap-4 items-center">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-12" />
                              <Skeleton className="h-8 w-8" />
                            </div>
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
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find labels by name, code, or synonyms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Labels</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, code, or synonyms..."
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

        {/* Labels Table */}
        <Card>
          <CardHeader>
            <CardTitle>Labels ({total})</CardTitle>
            <CardDescription>
              {searchQuery ? `Search results for "${searchQuery}"` : 'All labels in the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {/* Table Header Skeleton */}
                <div className="border rounded-lg">
                  <div className="border-b p-4">
                    <div className="grid grid-cols-6 gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  
                  {/* Table Rows Skeleton */}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="p-4 border-b last:border-b-0">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-12" />
                          <Skeleton className="h-8 w-8" />
                        </div>
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
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Synonyms</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Total Sends</TableHead>
                      <TableHead>Last Sent</TableHead>
                      <TableHead>Sample Subscriber</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labels.map((label) => (
                      <TableRow key={label.id}>
                        <TableCell className="font-mono text-sm text-foreground">
                          {label.code}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {label.name}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-foreground" title={label.synonyms}>
                            {label.synonyms}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {label.location_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={label.active ? 'default' : 'secondary'}>
                            {label.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {label.subscribers_count !== undefined && label.subscribers_count !== null
                            ? label.subscribers_count
                            : 0}
                        </TableCell>
                        <TableCell className="text-center text-foreground">
                          {label.total_sends}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {label.last_sent ? formatDate(label.last_sent) : 'Never'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {((label.subscribers_count !== undefined && label.subscribers_count !== null ? label.subscribers_count : 0) > 0) 
                            ? maskPhoneNumber('+14158889999') 
                            : 'No subscribers'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(label)}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {labels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No labels found matching your search' : 'No labels found'}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Load More Section */}
        {labels.length > 0 && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {labels.length} of {total} labels
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
                      All labels loaded
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
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Label Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Label</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update the label information below. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 px-1 overflow-y-auto flex-1 min-h-0 pr-2">
              {/* Label Code (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-foreground">Code</Label>
                <Input
                  id="edit-code"
                  value={editingLabel?.code || ''}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Label code cannot be changed</p>
              </div>

              {/* Label Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-foreground">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter label name"
                  className="text-foreground"
                />
              </div>

              {/* Synonyms */}
              <div className="space-y-2">
                <Label htmlFor="edit-synonyms" className="text-foreground">Synonyms</Label>
                <Textarea
                  id="edit-synonyms"
                  value={editForm.synonyms || ''}
                  onChange={(e) => setEditForm({ ...editForm, synonyms: e.target.value })}
                  placeholder="Enter synonyms separated by commas"
                  className="text-foreground min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple synonyms with commas (e.g., DSLR, Mirrorless, Action Camera)
                </p>
              </div>

              {/* Location (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-foreground">Location</Label>
                <Input
                  id="edit-location"
                  value={editingLabel?.location_name || ''}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Location cannot be changed</p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-foreground">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-status"
                    checked={editForm.active || false}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, active: checked })}
                  />
                  <Label htmlFor="edit-status" className="text-foreground">
                    {editForm.active ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>

              {/* Statistics (Read-only) */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Subscribers</Label>
                  <p className="text-2xl font-bold text-foreground">
                    {editingLabel?.subscribers_count !== undefined && editingLabel?.subscribers_count !== null
                      ? editingLabel.subscribers_count
                      : 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Total Sends</Label>
                  <p className="text-2xl font-bold text-foreground">{editingLabel?.total_sends || 0}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 border-t pt-4">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving || !editForm.name?.trim()}
                className="hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLabelsPage;
