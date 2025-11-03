import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  RefreshCw,
  Bell,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Custom skeleton variants with consistent blue theme
const CardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 ${className}`}
  >
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-300 rounded"></div>
        <div className="h-4 bg-blue-300 rounded w-24"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-blue-300 rounded w-16"></div>
        <div className="h-4 bg-blue-300 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const ButtonSkeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 border border-blue-200 ${className}`}
  >
    <div className="flex items-center justify-center gap-2 p-3">
      <div className="w-4 h-4 bg-blue-300 rounded"></div>
      <div className="h-4 bg-blue-300 rounded w-16"></div>
    </div>
  </div>
);

interface DashboardLabel {
  id: string;
  code: string;
  name: string;
  waitingCount: number;
  lastSendTimestamp: string;
}

interface TeamDashboardProps {
  onLogout: () => void;
  onScan: () => void;
  onAuditLog: () => void;
  onLabelsManagement: () => void;
  onSendAlerts: (message?: string) => void | Promise<void>;
  currentLabel?: string;
  subscriberCount?: number;
  lastSendTime?: Date;
  dashboardLabels?: DashboardLabel[];
  onLabelSelect?: (label: DashboardLabel) => void;
  selectedLabelId?: string;
  activeVisitors?: number;
  pendingAlerts?: number;
  locationName?: string;
  isLoading?: boolean;
}

const TeamDashboard = ({
  onLogout,
  onScan,
  onAuditLog,
  onLabelsManagement,
  onSendAlerts,
  currentLabel = "No product selected",
  subscriberCount = 0,
  lastSendTime,
  dashboardLabels = [],
  onLabelSelect,
  selectedLabelId,
  activeVisitors = 0,
  pendingAlerts = 0,
  locationName = "N/A",
  isLoading = false,
}: TeamDashboardProps) => {
  const [isSending, setIsSending] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState("");
  const [showValidationError, setShowValidationError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("LocationName:", locationName, "CurrentLabel:", currentLabel);
    if (currentLabel && currentLabel !== "No product selected") {
      const defaultMessage = `Good news! ${currentLabel} is back at ${locationName}.\nDrop by soon – limited stock.\n– RestockPing`;
      setAlertMessage(defaultMessage);
    }
  }, [currentLabel, locationName]);

  const handleSendAlerts = async () => {
    if (subscriberCount === 0) {
      toast({
        title: "No subscribers",
        description: "There are no subscribers waiting for this product.",
        variant: "destructive",
      });
      return;
    }

    if (!alertMessage.trim()) {
      setShowValidationError(true);
      toast({
        title: "Alert message required",
        description:
          "Please enter a message for the alert. You can use the suggested message or write your own.",
        variant: "destructive",
      });
      return;
    }

    // Clear validation error if message is provided
    setShowValidationError(false);

    setIsSending(true);

    try {
      // Call the parent's send alerts handler with the message
      await onSendAlerts(alertMessage.trim());

      // Reset the message input after successful send
      setAlertMessage("");
    } catch (error) {
      console.error("Error in parent send alerts handler:", error);
    } finally {
      setIsSending(false);
      setLastRefresh(new Date());
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Team Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage back-in-stock notifications
            </p>
          </div>
          <div className="flex gap-2">
            {isLoading ? (
              <>
                <div className="h-10 w-24 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-20 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg animate-pulse"></div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onLabelsManagement}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Labels</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onAuditLog}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Audit Log</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            <>
              {/* Active Visitors Skeleton */}
              <CardSkeleton />

              {/* Pending Alerts Skeleton */}
              <CardSkeleton />

              {/* Last Send Skeleton */}
              <CardSkeleton />

              {/* Refresh Status Skeleton */}
              <CardSkeleton />
            </>
          ) : (
            <>
              {/* Active Visitors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Active Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {activeVisitors}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        visitors
                      </span>
                    </div>
                    <Badge
                      variant={activeVisitors > 0 ? "default" : "secondary"}
                      className="w-fit"
                    >
                      {activeVisitors > 0
                        ? "Currently active"
                        : "No active visitors"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5" />
                    Pending Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-orange-600">
                        {pendingAlerts}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        alerts
                      </span>
                    </div>
                    <Badge
                      variant={pendingAlerts > 0 ? "destructive" : "secondary"}
                      className="w-fit"
                    >
                      {pendingAlerts > 0 ? "Needs attention" : "All caught up"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

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
                    <p className="text-sm text-muted-foreground">
                      Label/Product:
                    </p>
                    <p className="font-semibold text-lg break-words">
                      {currentLabel}
                    </p>
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
                      <span className="text-3xl font-bold text-primary">
                        {subscriberCount}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        subscribers
                      </span>
                    </div>
                    <Badge
                      variant={subscriberCount > 0 ? "default" : "secondary"}
                      className="w-fit"
                    >
                      {subscriberCount > 0
                        ? "Ready to notify"
                        : "No subscribers"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Last Send Time - Separate row */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Last Send Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Last notification sent:
                    </p>
                    <p className="font-semibold text-lg">
                      {formatLastSendTime(lastSendTime)}
                    </p>
                    {lastSendTime && (
                      <p className="text-xs text-muted-foreground">
                        {lastSendTime.toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Top Labels Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Products with Waiting Subscribers
            </CardTitle>
            <CardDescription>
              Select a product to view details and send notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-blue-300 rounded w-24"></div>
                        <div className="h-5 bg-blue-300 rounded-full w-12"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-blue-300 rounded w-16"></div>
                        <div className="h-3 bg-blue-300 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardLabels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboardLabels.map((label) => (
                  <Card
                    key={label.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLabelId === label.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => onLabelSelect?.(label)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{label.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {label.code}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {label.waitingCount} waiting
                          </span>
                          {label.lastSendTimestamp && (
                            <span className="text-xs text-muted-foreground">
                              Last:{" "}
                              {formatLastSendTime(
                                new Date(label.lastSendTimestamp)
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products with waiting subscribers found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Alerts Section */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-6 w-6" />
              Send Alerts
            </CardTitle>
            <CardDescription>
              Send notifications to all waiting subscribers for the current
              product
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded w-48"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded w-32"></div>
                  </div>
                  <div className="h-12 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-48"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded w-24"></div>
                  <div className="h-20 w-full bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded"></div>
                    <div className="h-8 w-24 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded"></div>
                    <div className="h-8 w-24 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Product:{" "}
                      <span className="font-medium">{currentLabel}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Will notify:{" "}
                      <span className="font-medium text-primary">
                        {subscriberCount} subscriber
                        {subscriberCount === 1 ? "" : "s"}
                      </span>
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSendAlerts}
                    disabled={isSending || subscriberCount === 0 || isLoading}
                    className="w-full sm:w-auto min-w-[200px] flex items-center gap-2 touch-manipulation disabled:opacity-50"
                    title={
                      !alertMessage.trim() ? "Please enter a message first" : ""
                    }
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : isLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Alerts
                      </>
                    )}
                  </Button>
                </div>

                {/* Alert Message Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="dashboard-alert-message"
                    className="text-sm font-medium text-gray-700"
                  >
                    Alert Message
                  </label>
                  <textarea
                    id="dashboard-alert-message"
                    value={alertMessage}
                    onChange={(e) => {
                      setAlertMessage(e.target.value);
                      // Clear validation error when user starts typing
                      if (showValidationError && e.target.value.trim()) {
                        setShowValidationError(false);
                      }
                    }}
                    placeholder="🚨 Alert: Product is now available! Check our store for the latest stock."
                    className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      showValidationError
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    rows={4}
                    disabled={isSending || subscriberCount === 0 || isLoading}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      This message will be sent to all {subscriberCount} waiting
                      subscribers
                    </p>
                    <p className="text-xs text-gray-400">
                      {alertMessage.length}/160 characters
                    </p>
                  </div>

                  {showValidationError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Please enter a message or click one of the preset options
                      below
                    </p>
                  )}

                  {/* Quick Message Options */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertMessage(
                          "🚨 Alert: Product is now available! Check our store for the latest stock."
                        );
                        setShowValidationError(false);
                      }}
                      className="text-xs"
                    >
                      Stock Available
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertMessage(
                          "📦 Good news! Your requested item is back in stock. Visit us today!"
                        );
                        setShowValidationError(false);
                      }}
                      className="text-xs"
                    >
                      Back in Stock
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertMessage(
                          "⚡ Limited time! Your product is available now. Don't miss out!"
                        );
                        setShowValidationError(false);
                      }}
                      className="text-xs"
                    >
                      Limited Time
                    </Button>
                  </div>
                </div>

                {subscriberCount === 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      No subscribers are waiting for this product. Scan or
                      select a different product to send alerts.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ButtonSkeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : (
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
                  onClick={onLabelsManagement}
                  className="flex flex-col items-center gap-2 h-auto py-4 touch-manipulation"
                >
                  <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm">Manage Labels</span>
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
            )}
          </CardContent>
        </Card>

        {/* Status Footer */}
        <div className="text-center text-sm text-muted-foreground">
          {isLoading ? (
            <div className="h-4 w-32 mx-auto bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded animate-pulse"></div>
          ) : (
            <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
