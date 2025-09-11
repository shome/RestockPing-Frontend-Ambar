import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  History, 
  Search, 
  Filter,
  Download,
  Calendar,
  User,
  Send,
  Eye,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditLogProps {
  onBack: () => void;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: 'send_alerts' | 'product_scan' | 'login' | 'logout';
  details: string;
  subscriberCount?: number;
  productName?: string;
  productId?: string;
}

// Mock audit data
const mockAuditEntries: AuditEntry[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    user: "John Doe",
    action: "send_alerts",
    details: "Sent alerts to waiting subscribers",
    subscriberCount: 25,
    productName: "iPhone 15 Pro",
    productId: "PROD001"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    user: "Jane Smith",
    action: "product_scan",
    details: "Scanned product barcode",
    productName: "Samsung Galaxy S24",
    productId: "PROD002"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    user: "Mike Johnson",
    action: "send_alerts",
    details: "Sent alerts to waiting subscribers",
    subscriberCount: 18,
    productName: "MacBook Pro M3",
    productId: "PROD003"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    user: "Sarah Wilson",
    action: "login",
    details: "Logged in to team dashboard"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    user: "John Doe",
    action: "send_alerts",
    details: "Sent alerts to waiting subscribers",
    subscriberCount: 12,
    productName: "AirPods Pro 2",
    productId: "PROD004"
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: "Jane Smith",
    action: "product_scan",
    details: "Scanned product barcode",
    productName: "iPad Air 5",
    productId: "PROD005"
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    user: "Mike Johnson",
    action: "logout",
    details: "Logged out of team dashboard"
  }
];

const AuditLog = ({ onBack }: AuditLogProps) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(mockAuditEntries);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>(mockAuditEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(auditEntries.map(entry => entry.user)));

  // Filter entries based on search and filters
  useEffect(() => {
    let filtered = auditEntries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(entry => entry.action === actionFilter);
    }

    // User filter
    if (userFilter !== "all") {
      filtered = filtered.filter(entry => entry.user === userFilter);
    }

    setFilteredEntries(filtered);
  }, [auditEntries, searchTerm, actionFilter, userFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      // In real app, this would fetch from API
      toast({
        title: "Audit log refreshed",
        description: "Latest entries loaded",
      });
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    const csvContent = [
      "Timestamp,User,Action,Details,Subscriber Count,Product Name,Product ID",
      ...filteredEntries.map(entry => [
        entry.timestamp.toISOString(),
        entry.user,
        entry.action,
        entry.details,
        entry.subscriberCount || "",
        entry.productName || "",
        entry.productId || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Audit log exported as CSV",
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'send_alerts':
        return <Send className="h-4 w-4" />;
      case 'product_scan':
        return <Eye className="h-4 w-4" />;
      case 'login':
        return <User className="h-4 w-4" />;
      case 'logout':
        return <User className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'send_alerts':
        return "bg-green-100 text-green-800 border-green-200";
      case 'product_scan':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'login':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'logout':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6" />
                Audit Log
              </h1>
              <p className="text-muted-foreground">Track all team actions and activities</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="send_alerts">Send Alerts</SelectItem>
                    <SelectItem value="product_scan">Product Scan</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">User</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Results</label>
                <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    {filteredEntries.length} entries
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Showing {filteredEntries.length} of {auditEntries.length} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full border ${getActionColor(entry.action)}`}>
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <Badge variant="outline" className="w-fit">
                            {entry.action.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {entry.user}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{entry.details}</p>
                        {entry.productName && (
                          <p className="text-sm text-muted-foreground">
                            Product: {entry.productName} ({entry.productId})
                          </p>
                        )}
                        {entry.subscriberCount && (
                          <p className="text-sm text-muted-foreground">
                            Notified {entry.subscriberCount} subscriber{entry.subscriberCount === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {entry.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLog;
