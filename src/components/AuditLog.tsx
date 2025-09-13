import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  History, 
  Download,
  Calendar,
  User,
  Send,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, AuditLogEntry, AuditLogResponse } from "@/lib/api";

interface AuditLogProps {
  onBack: () => void;
}

const AuditLog = ({ onBack }: AuditLogProps) => {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [limit] = useState(20); // Items per page
  const { toast } = useToast();

  // Fetch audit logs from API
  const fetchAuditLogs = async (page: number = 0, isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsPageLoading(true);
      }
      
      const offset = page * limit;
      const response = await apiService.fetchAuditLogs(limit, offset);
      
      setAuditEntries(response.logs);
      setTotalEntries(response.total);
      setTotalPages(Math.ceil(response.total / limit));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPageLoading(false);
    }
  };

  // Load audit logs on component mount
  useEffect(() => {
    fetchAuditLogs(0, true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAuditLogs(currentPage, true);
    setIsRefreshing(false);
    toast({
      title: "Audit log refreshed",
      description: "Latest entries loaded",
    });
  };

  const handlePageChange = (page: number) => {
    fetchAuditLogs(page, false);
  };

  const handleExport = () => {
    const csvContent = [
      "Date,Time,User,Action,Details,Sent Count,Label Name",
      ...auditEntries.map(entry => [
        entry.date,
        entry.time,
        entry.user,
        entry.action,
        entry.details,
        entry.sent_count || "",
        entry.label_name || ""
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
    switch (action.toLowerCase()) {
      case 'sent alert':
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
    switch (action.toLowerCase()) {
      case 'sent alert':
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

  const formatSimpleLog = (entry: AuditLogEntry) => {
    return `${entry.date}, ${entry.user}, Sent ${entry.sent_count} subscribers.`;
  };

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-8 modal-scrollbar min-h-0">
        <div className="max-w-6xl mx-auto space-y-6">

        {/* Audit Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Simple list format: Date, User, Sent X subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : auditEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full border ${getActionColor(entry.action)}`}>
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {formatSimpleLog(entry)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.time} • {entry.label_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {isPageLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading page...
                    </div>
                  ) : totalPages > 1 ? (
                    <>Page {currentPage + 1} of {totalPages} ({totalEntries} total entries)</>
                  ) : (
                    <>Showing {auditEntries.length} of {totalEntries} entries</>
                  )}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0 || isPageLoading}
                      className="hidden sm:flex"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0 || isPageLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (currentPage < 3) {
                          pageNum = i;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isPageLoading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || isPageLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1 || isPageLoading}
                      className="hidden sm:flex"
                    >
                      Last
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
