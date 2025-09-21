import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Send, 
  Database, 
  Activity, 
  Settings,
  LogOut,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApiService, AdminDashboardResponse, AdminAnalyticsResponse, AdminMetricsResponse } from '@/lib/adminApi';
import AdminNavigation from '@/components/AdminNavigation';

const AdminDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsResponse | null>(null);
  const [metricsData, setMetricsData] = useState<AdminMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchDashboard(),
        fetchAnalytics(),
        fetchMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await adminApiService.getDashboard();
      setDashboardData(response);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load dashboard data";
      toast({
        title: "Error loading dashboard",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await adminApiService.getAnalytics('daily');
      setAnalyticsData(response);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await adminApiService.getMetrics();
      setMetricsData(response);
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Navigation */}
        <AdminNavigation />
        
        {/* Main Content with Loading */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>
              </div>
            </div>
          </header>

          {/* Loading Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {/* Loading Skeleton for Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                      <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading Skeleton for Content */}
              <div className="bg-card rounded-lg border p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                            <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center space-y-1">
                            <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
                            <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
                            <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                            <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading Spinner */}
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading admin dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAllData}
                  disabled={isLoading}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-foreground" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2 text-foreground" />
                  )}
                  <span className="text-foreground font-medium">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="metrics"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="health"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Health Check
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Labels</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.total_labels || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active product labels
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.total_subscribers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customer opt-ins
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Sends</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.total_sends || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alerts sent
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {metricsData?.overall_health || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall health score
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Labels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Top Labels by Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Labels with the most subscribers and sends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.labels?.slice(0, 5).map((label, index) => (
                    <div key={label.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{label.name}</p>
                          <p className="text-sm text-muted-foreground">{label.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-foreground">{label.subscribers_count}</p>
                          <p className="text-muted-foreground">Subscribers</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">{label.total_sends}</p>
                          <p className="text-muted-foreground">Sends</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">
                            {label.last_sent ? new Date(label.last_sent).toLocaleDateString() : 'Never'}
                          </p>
                          <p className="text-muted-foreground">Last Sent</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => navigate('/admin/labels')}
                  >
                    <Database className="h-6 w-6 text-foreground" />
                    <span className="text-foreground font-medium">Manage Labels</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => navigate('/admin/logs')}
                  >
                    <Activity className="h-6 w-6 text-foreground" />
                    <span className="text-foreground font-medium">View Logs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => navigate('/admin/pins')}
                  >
                    <Settings className="h-6 w-6 text-foreground" />
                    <span className="text-foreground font-medium">Manage PINs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => navigate('/admin/requests')}
                  >
                    <AlertCircle className="h-6 w-6 text-foreground" />
                    <span className="text-foreground font-medium">View Requests</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Labels</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData.analytics.labels.total_active}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +{analyticsData.analytics.labels.new_this_period} this period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Opt-ins</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData.analytics.opt_ins.total}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +{analyticsData.analytics.opt_ins.new_this_period} this period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sends</CardTitle>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData.analytics.sends.total}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData.analytics.sends.this_period} this period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData.analytics.sends.success_rate}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Send success rate
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Breakdown</CardTitle>
                    <CardDescription>
                      Activity breakdown for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.daily_breakdown?.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{day.date}</p>
                              <p className="text-sm text-muted-foreground">
                                {analyticsData.period === 'daily' ? 'Today' : 'This week'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-medium">{day.opt_ins}</p>
                              <p className="text-muted-foreground">Opt-ins</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{day.sends}</p>
                              <p className="text-muted-foreground">Sends</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{day.requests}</p>
                              <p className="text-muted-foreground">Requests</p>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No analytics data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {metricsData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsData?.performance?.api_response_times?.admin_avg_ms || 'N/A'}ms
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average admin API response
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Database Queries</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsData?.performance?.database_performance?.query_count || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total queries executed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsData?.performance?.memory_usage?.percentage || 'N/A'}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metricsData?.performance?.memory_usage?.used_mb || 'N/A'}MB / {metricsData?.performance?.memory_usage?.total_mb || 'N/A'}MB
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatUptime(metricsData?.performance?.uptime?.seconds || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        System uptime
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>SLA Status</CardTitle>
                    <CardDescription>
                      Service level agreement status for all components
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Search API</span>
                          <Badge className={getSLAStatusColor(metricsData?.sla_status?.search_api || 'unknown')}>
                            {metricsData?.sla_status?.search_api || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Send API</span>
                          <Badge className={getSLAStatusColor(metricsData?.sla_status?.send_api || 'unknown')}>
                            {metricsData?.sla_status?.send_api || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Admin Dashboard</span>
                          <Badge className={getSLAStatusColor(metricsData?.sla_status?.admin_dashboard || 'unknown')}>
                            {metricsData?.sla_status?.admin_dashboard || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uptime</span>
                          <Badge className={getSLAStatusColor(metricsData?.sla_status?.uptime || 'unknown')}>
                            {metricsData?.sla_status?.uptime || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Health Check Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Check</CardTitle>
                <CardDescription>
                  Real-time status of all system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Database</p>
                        <p className="text-sm text-muted-foreground">
                          Response time: {metricsData?.performance?.database_performance?.avg_query_time_ms || 'N/A'}ms
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {metricsData?.services?.database?.status || 'Unknown'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">SMS Provider</p>
                        <p className="text-sm text-muted-foreground">
                          Configured: {metricsData?.services?.sms_provider?.configured ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {metricsData?.services?.sms_provider?.status || 'Unknown'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">API Service</p>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {formatUptime(metricsData?.performance?.uptime?.seconds || 0)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {metricsData?.services?.api?.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
