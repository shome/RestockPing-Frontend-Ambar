import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  AlertCircle, 
  Search, 
  MapPin,
  RefreshCw,
  Loader2,
  Clock,
  User,
  Send,
  CheckCircle,
  X,
  AlertTriangle,
  Phone,
  Tag,
  Activity
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { adminApiService, AdminLogsResponse, AdminAlertsResponse, AdminRequestsResponse } from '@/lib/adminApi';
import { maskPhoneNumber } from '@/lib/phoneUtils';
import AdminNavigation from '@/components/AdminNavigation';

// Team Logs types for colored logs display
interface TeamLogEntry {
  id: string;
  type: 'SMS' | 'WEBHOOK' | 'ALERT' | 'REQUEST';
  status: 'success' | 'failed' | 'invalid' | 'pending';
  message: string;
  timestamp: string;
  phone?: string;
  label_name?: string;
  error_details?: string;
}

const AdminLogsPage: React.FC = () => {
  const [logsData, setLogsData] = useState<AdminLogsResponse | null>(null);
  const [alertsData, setAlertsData] = useState<AdminAlertsResponse | null>(null);
  const [requestsData, setRequestsData] = useState<AdminRequestsResponse | null>(null);
  const [teamLogs, setTeamLogs] = useState<TeamLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, [activeTab, offset]);

  const fetchAllData = async () => {
    try {
      if (logsData === null) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      await Promise.all([
        fetchLogs(),
        fetchAlerts(),
        fetchRequests(),
        fetchTeamLogs()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await adminApiService.getLogs(activeTab as any, limit, offset);
      setLogsData(response);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      
      // Provide mock data fallback for development
      const mockLogsData = {
        success: true,
        sends: [
          {
            id: "mock-send-1",
            label_name: "Laptops",
            sent_at: new Date().toISOString(),
            count_sent: 2,
            sender: "mock-sender-1",
            location_name: "London Office"
          }
        ],
        requests: [
          {
            id: "mock-request-1",
            text: "Sample product request",
            created_at: new Date().toISOString(),
            status: "open",
            location_name: "London Office"
          }
        ],
        total_sends: 1,
        total_requests: 1,
        message: "Mock data - API unavailable"
      };
      
      setLogsData(mockLogsData);
      
      toast({
        title: "Using mock data",
        description: "API unavailable, showing sample data",
        variant: "default",
      });
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await adminApiService.getAlerts(limit, offset);
      setAlertsData(response);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await adminApiService.getRequests(limit, offset);
      setRequestsData(response);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchTeamLogs = async () => {
    try {
      // Mock data for team logs since API endpoint might not exist yet
      const mockTeamLogs: TeamLogEntry[] = [
        {
          id: "log-1",
          type: "SMS",
          status: "success",
          message: "Alert sent successfully for Laptops",
          timestamp: new Date().toISOString(),
          phone: "+141*****23",
          label_name: "Laptops"
        },
        {
          id: "log-2",
          type: "SMS",
          status: "failed",
          message: "Failed to send SMS - Invalid phone number",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          phone: "+141*****45",
          label_name: "Phones",
          error_details: "Invalid phone number format"
        },
        {
          id: "log-3",
          type: "WEBHOOK",
          status: "invalid",
          message: "Invalid webhook signature from Twilio",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          error_details: "Webhook signature validation failed"
        },
        {
          id: "log-4",
          type: "ALERT",
          status: "success",
          message: "Product alert processed successfully",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          label_name: "Tablets"
        }
      ];
      
      setTeamLogs(mockTeamLogs);
    } catch (error: any) {
      console.error('Error fetching team logs:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'mapped':
      case 'closed':
        return 'text-green-600';
      case 'open':
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'mapped':
      case 'closed':
        return 'default';
      case 'open':
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Helper functions for colored logs
  const getLogStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogBackgroundColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100';
      case 'failed':
        return 'bg-red-100';
      case 'invalid':
        return 'bg-yellow-100';
      case 'pending':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      case 'invalid':
        return '⚠️';
      case 'pending':
        return '⏳';
      default:
        return '📝';
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
                <h1 className="text-2xl font-bold">Logs & Monitoring</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={fetchAllData}
                  disabled={isLoading || isRefreshing}
                >
                  {(isLoading || isRefreshing) ? (
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
          {isLoading ? (
            <div className="space-y-6">
              {/* Tabs Skeleton */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg w-full max-w-md">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
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

              {/* Main Content Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
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
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 border-b last:border-b-0">
                          <div className="grid grid-cols-6 gap-4 items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="sends">Sends</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="colored-logs">System Logs</TabsTrigger>
          </TabsList>

          {/* All Logs Tab */}
          <TabsContent value="all" className="space-y-6">
            {logsData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sends</CardTitle>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{logsData?.total_sends || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Alert notifications sent
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{logsData?.total_requests || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Customer requests received
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(logsData?.sends?.length || 0) + (logsData?.requests?.length || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Items in current view
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sends Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sends</CardTitle>
                    <CardDescription>
                      Alert notifications sent to customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Count Sent</TableHead>
                          <TableHead>Sender</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isRefreshing ? (
                          // Skeleton rows for refreshing
                          [1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={`skeleton-send-${i}`}>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          (logsData?.sends || []).map((send) => (
                          <TableRow key={send.id}>
                            <TableCell className="font-medium">
                              {send.label_name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatDate(send.sent_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {send.count_sent} subscribers
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {send.sender}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {send.location_name}
                              </div>
                            </TableCell>
                          </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Requests Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Requests</CardTitle>
                    <CardDescription>
                      Customer requests and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request Text</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Matched Label</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isRefreshing ? (
                          // Skeleton rows for refreshing
                          [1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={`skeleton-request-${i}`}>
                              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          (logsData?.requests || []).map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div className="max-w-xs">
                                  <p className="truncate">{request.text}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  {formatDate(request.created_at)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(request.status) === 'text-green-600' ? 'default' : 'secondary'}>
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
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Sends Tab */}
          <TabsContent value="sends" className="space-y-6">
            {alertsData && (
              <Card>
                <CardHeader>
                  <CardTitle>Alert Sends ({alertsData.total_alerts})</CardTitle>
                  <CardDescription>
                    All alert notifications sent to customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Count Sent</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>SMS Status</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertsData.alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="font-medium">
                            {alert.label_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDate(alert.sent_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {alert.count_sent} subscribers
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {alert.phone ? maskPhoneNumber(alert.phone) : maskPhoneNumber('+14159876543')}
                          </TableCell>
                          <TableCell>
                            {alert.sms_status ? (
                              <div className="flex items-center gap-2">
                                {alert.sms_status === 'success' && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                {alert.sms_status === 'failed' && (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                                {alert.sms_status === 'pending' && (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                )}
                                <Badge variant={
                                  alert.sms_status === 'success' ? 'default' :
                                  alert.sms_status === 'failed' ? 'destructive' : 'secondary'
                                }>
                                  {alert.sms_status}
                                </Badge>
                                {alert.sms_error && (
                                  <span className="text-xs text-red-600 ml-2" title={alert.sms_error}>
                                    Error
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline">Unknown</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {alert.sender}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {alert.location_name}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {requestsData && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Requests ({requestsData.total_requests})</CardTitle>
                  <CardDescription>
                    All customer requests including "can't find it?" requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-4">
                    <Badge variant="outline">
                      Total: {requestsData.total_requests}
                    </Badge>
                    <Badge variant="secondary">
                      Can't Find: {requestsData.cant_find_count}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request Text</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Matched Label</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsData.requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="truncate">{request.text}</p>
                              {request.image_url && (
                                <p className="text-xs text-muted-foreground">Has image</p>
                              )}
                            </div>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {alertsData && (
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts ({alertsData.total_alerts})</CardTitle>
                  <CardDescription>
                    All alert notifications sent through the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Count Sent</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertsData.alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="font-medium">
                            {alert.label_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDate(alert.sent_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {alert.count_sent} subscribers
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {alert.sender}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {alert.location_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {alert.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Colored System Logs Tab */}
          <TabsContent value="colored-logs" className="space-y-6">
            <div className="space-y-4">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>
                    Real-time logs showing SMS delivery status, webhook validation, and system events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total logs: {teamLogs.length}</span>
                    <span>•</span>
                    <span>Showing latest {teamLogs.length} entries</span>
                  </div>
                </CardContent>
              </Card>

              {/* Logs List */}
              <div className="space-y-4">
                {teamLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-lg border ${getLogBackgroundColor(log.status)}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex items-center gap-2 mt-1">
                        {getLogStatusIcon(log.status)}
                        <span className="text-lg">{getStatusEmoji(log.status)}</span>
                      </div>

                      {/* Log Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <strong className="text-sm font-semibold">
                            {log.type.toUpperCase()}
                          </strong>
                          <span className="text-sm text-muted-foreground">-</span>
                          <Badge 
                            variant={
                              log.status === 'success' ? 'default' :
                              log.status === 'failed' ? 'destructive' :
                              log.status === 'invalid' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {log.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{log.message}</p>
                        
                        {/* Additional Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.timestamp)}
                          </div>
                          
                          {log.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {log.phone}
                            </div>
                          )}
                          
                          {log.label_name && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {log.label_name}
                            </div>
                          )}
                        </div>
                        
                        {/* Error Details */}
                        {log.error_details && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <strong>Error:</strong> {log.error_details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {teamLogs.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No system logs found</h3>
                      <p>There are no system logs to display at the moment.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogsPage;
