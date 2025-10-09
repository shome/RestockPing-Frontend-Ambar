import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Upload, 
  Table, 
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Label, CSVUploadResponse } from '@/lib/api';
import { mockLabels, createMockCSVUploadResponse, generateMockCSVData, mockDelay } from '@/lib/mockLabelsData';
import CSVUpload from '@/components/CSVUpload';
import LabelsTable from '@/components/LabelsTable';
import RequestForm from '@/components/RequestForm';

interface LabelsManagementProps {
  onBack: () => void;
}

const LabelsManagement: React.FC<LabelsManagementProps> = ({ onBack }) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('table');
  const [lastUploadResult, setLastUploadResult] = useState<CSVUploadResponse | null>(null);
  const { toast } = useToast();

  // Fetch labels on component mount
  useEffect(() => {
    fetchLabels();
  }, []);

  // Auto-refresh every 30 seconds to keep counters updated
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing labels for counter updates...');
      fetchLabels(false); // Silent refresh without loading indicator
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for global counter update events from customer requests
  useEffect(() => {
    const handleCounterUpdate = (event: CustomEvent) => {
      console.log('🔔 Received counter update event:', event.detail);
      console.log('🔄 Refreshing labels due to customer request...');
      fetchLabels(false); // Silent refresh when customer submits request
    };

    window.addEventListener('labelCounterUpdated', handleCounterUpdate as EventListener);
    
    return () => {
      window.removeEventListener('labelCounterUpdated', handleCounterUpdate as EventListener);
    };
  }, []);

  const fetchLabels = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      // ACTUAL API CODE - Now enabled with higher limit
      const response = await apiService.fetchLabels(500, 0); // Get first 500 labels
      if (response.success) {
        console.log('🔍 API Response:', response.labels);
        setLabels(response.labels);
        
        // 🔄 Log counter info for debugging
        const labelsWithCounters = response.labels.filter(l => l.subscribers_count > 0 || l.total_sends > 0);
        if (labelsWithCounters.length > 0) {
          console.log('📊 Labels with counters:', labelsWithCounters.map(l => ({
            name: l.name,
            subscribers: l.subscribers_count,
            sends: l.total_sends
          })));
        }
      } else {
        throw new Error('Failed to fetch labels');
      }
      
      // MOCK DATA - Fallback if API fails
      // await mockDelay(800); // Simulate API delay
      // setLabels([...mockLabels]);
    } catch (error: any) {
      console.error('Error fetching labels:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load labels. Please try again.";
      toast({
        title: "Error loading labels",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data');
      await mockDelay(800);
      setLabels([...mockLabels]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Wrapper function for refresh button
  const handleRefresh = () => {
    fetchLabels(true);
  };

  const handleUploadComplete = (response: CSVUploadResponse) => {
    setLastUploadResult(response);
    // Switch to table view to show updated labels
    setActiveTab('table');
    // Refresh labels list
    fetchLabels();
  };

  const handleDownloadCSV = async () => {
    try {
      setIsLoading(true);
      const blob = await apiService.downloadLabelsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `labels_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Labels have been exported to CSV file.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to export labels.";
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeLabelsCount = labels.filter(label => label.active).length;
  const inactiveLabelsCount = labels.filter(label => !label.active).length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Labels Management</h1>
              <p className="text-muted-foreground">
                Upload CSV files and manage product labels for customer opt-ins
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={isLoading || labels.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Labels</CardTitle>
              <Table className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labels.length}</div>
              <p className="text-xs text-muted-foreground">
                All labels in system
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Labels</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeLabelsCount}</div>
              <p className="text-xs text-muted-foreground">
                Available in search
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Labels</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{inactiveLabelsCount}</div>
              <p className="text-xs text-muted-foreground">
                Hidden from search
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Upload</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastUploadResult ? lastUploadResult.processed : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastUploadResult ? 'rows processed' : 'No recent uploads'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Labels Table
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Test Request
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <LabelsTable
              labels={labels}
              onRefresh={fetchLabels}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <CSVUpload
              onUploadComplete={handleUploadComplete}
              onRefresh={fetchLabels}
            />
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RequestForm onRequestCreated={() => {
                console.log('🔄 Request created, refreshing labels...');
                fetchLabels(false); // Silent refresh after request creation
              }} />
              <Card>
                <CardHeader>
                  <CardTitle>Counter Test Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p>Use this form to test automatic counter updates:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Fill in the form with valid data</li>
                      <li>Submit the request</li>
                      <li>Check the Labels Table - counters should update automatically</li>
                      <li>The subscribers_count and total_sends will increment</li>
                    </ol>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">Note:</p>
                      <p className="text-blue-800">
                        Each request automatically creates an optin record and updates the label counters in real-time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for managing your labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Upload Labels</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with label data to bulk import or update labels.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab('upload')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Export Labels</h4>
                <p className="text-sm text-muted-foreground">
                  Download all labels as a CSV file for backup or editing.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadCSV}
                  disabled={labels.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Add Single Label</h4>
                <p className="text-sm text-muted-foreground">
                  Create a new label manually using the form in the table view.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab('table')}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Manage Labels
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Help & Information</CardTitle>
            <CardDescription>
              Learn how to effectively manage your labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">CSV Upload Format</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Your CSV file must include these columns:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><Badge variant="outline" className="text-xs">code</Badge> - Unique identifier (required)</li>
                    <li><Badge variant="outline" className="text-xs">name</Badge> - Display name (required)</li>
                    <li><Badge variant="outline" className="text-xs">synonyms</Badge> - Search terms (optional)</li>
                    <li><Badge variant="outline" className="text-xs">active</Badge> - true/false (required)</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Label Management</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Key features for managing labels:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Active labels appear in customer search</li>
                    <li>Inactive labels are hidden from customers</li>
                    <li>Synonyms help customers find labels</li>
                    <li>Codes must be unique across all labels</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabelsManagement;
