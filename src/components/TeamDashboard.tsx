import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LogOut, 
  QrCode, 
  Send, 
  Users, 
  Clock, 
  Package,
  History,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamDashboardProps {
  onLogout: () => void;
  onScan: () => void;
  onAuditLog: () => void;
  onSendAlerts: () => void;
  currentLabel?: string;
  subscriberCount?: number;
  lastSendTime?: Date;
}

const TeamDashboard = ({ 
  onLogout, 
  onScan, 
  onAuditLog,
  onSendAlerts,
  currentLabel = "No product selected",
  subscriberCount = 0,
  lastSendTime
}: TeamDashboardProps) => {
  const [isSending, setIsSending] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  const handleSendAlerts = async () => {
    if (subscriberCount === 0) {
      toast({
        title: "No subscribers",
        description: "There are no subscribers waiting for this product.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Call the parent's send alerts handler
    onSendAlerts();

    // Simulate sending alerts
    setTimeout(() => {
      toast({
        title: "Alerts sent successfully!",
        description: `Notified ${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`,
      });
      setIsSending(false);
      setLastRefresh(new Date());
    }, 2000);
  };

  const formatLastSendTime = (date?: Date) => {
    if (!date) return "Never";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Team Dashboard</h1>
            <p className="text-muted-foreground">Manage back-in-stock notifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onAuditLog} className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Current Product/Label */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Current Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Label/Product:</p>
                <p className="font-semibold text-lg break-words">{currentLabel}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onScan}
                  className="w-full flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Scan/Select Product
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscriber Count */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Waiting Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{subscriberCount}</span>
                  <span className="text-sm text-muted-foreground">subscribers</span>
                </div>
                <Badge 
                  variant={subscriberCount > 0 ? "default" : "secondary"}
                  className="w-fit"
                >
                  {subscriberCount > 0 ? "Ready to notify" : "No subscribers"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Last Send Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Last Send
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last notification sent:</p>
                <p className="font-semibold text-lg">{formatLastSendTime(lastSendTime)}</p>
                {lastSendTime && (
                  <p className="text-xs text-muted-foreground">
                    {lastSendTime.toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Alerts Section */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-6 w-6" />
              Send Alerts
            </CardTitle>
            <CardDescription>
              Send notifications to all waiting subscribers for the current product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Product: <span className="font-medium">{currentLabel}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Will notify: <span className="font-medium text-primary">{subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}</span>
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleSendAlerts}
                  disabled={isSending || subscriberCount === 0}
                  className="w-full sm:w-auto min-w-[200px] flex items-center gap-2 touch-manipulation"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Alerts
                    </>
                  )}
                </Button>
              </div>

              {subscriberCount === 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No subscribers are waiting for this product. Scan or select a different product to send alerts.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={onScan}
                className="flex flex-col items-center gap-2 h-auto py-4 touch-manipulation"
              >
                <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Scan Product</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSendAlerts}
                disabled={isSending || subscriberCount === 0}
                className="flex flex-col items-center gap-2 h-auto py-4 touch-manipulation"
              >
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Send Alerts</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onAuditLog}
                className="flex flex-col items-center gap-2 h-auto py-4 touch-manipulation"
              >
                <History className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">View Logs</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="flex flex-col items-center gap-2 h-auto py-4 touch-manipulation"
              >
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Logout</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
