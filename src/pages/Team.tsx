import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle, Search, Send, History, QrCode, Package } from "lucide-react";
import AuditLog from "@/components/AuditLog";
import ProductScanner from "@/components/ProductScanner";
import TeamDashboard from "@/components/TeamDashboard";
import { 
  mockProducts, 
  mockOptIns, 
  mockRequests, 
  sendSMS, 
  createOptIn,
  Product,
  Request,
} from "@/lib/mockData";
import { apiService, DashboardLabel, ScanResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TeamProps {
  onLogout: () => void;
}

const Team = ({ onLogout }: TeamProps) => {
  const [notifySearch, setNotifySearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardLabel[]>([]);
  const [locationName, setLocationName] = useState<string>("N/A");
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [selectedDashboardLabel, setSelectedDashboardLabel] =
    useState<DashboardLabel | null>(null);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [pendingAlerts, setPendingAlerts] = useState(0);
  const { toast } = useToast();

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingDashboard(true);
        const response = await apiService.fetchTeamDashboard();
        setDashboardData(response.metrics.topLabels);
        setActiveVisitors(response.metrics.activeVisitors);
        setPendingAlerts(response.metrics.pendingAlerts);
        setLocationName(response.locationName);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Using mock data.",
          variant: "destructive",
        });
        // Fallback to mock data
        setDashboardData([]);
        setActiveVisitors(0);
        setPendingAlerts(0);
        setLocationName("N/A");
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleNotify = () => {
    if (!selectedProduct) {
      toast({
        title: "No product selected",
        description: "Please select a product first.",
        variant: "destructive",
      });
      return;
    }

    // Get all opt-ins for this product
    const optInsForProduct = mockOptIns.filter(
      (optIn) => optIn.productId === selectedProduct.id && !optIn.notified
    );

    if (optInsForProduct.length === 0) {
      toast({
        title: "No subscribers",
        description: `No one is waiting for ${selectedProduct.name}.`,
      });
      return;
    }

    // Send notifications
    optInsForProduct.forEach((optIn) => {
      const message = `Heads up: ${selectedProduct.name} is now available. Limited stock. Reply STOP to opt out.`;
      sendSMS(optIn.phone, message, "notification");
      optIn.notified = true;
    });

    toast({
      title: "Notifications sent!",
      description: `Notified ${optInsForProduct.length} customer${optInsForProduct.length === 1 ? "" : "s"}.`,
      variant: "default",
    });

    setSelectedProduct(null);
    setNotifySearch("");
  };

  const handleAssignRequest = (requestId: string, productId: string) => {
    setIsAssigning(requestId);

    setTimeout(() => {
      const request = mockRequests.find((r) => r.id === requestId);
      const product = mockProducts.find((p) => p.id === productId);

      if (request && product) {
        // Update request status
        request.status = 'assigned';
        request.assignedProductId = productId;

        // Create opt-in for the customer (we'd need to unmask phone in real app)
        // For demo, we'll simulate this worked

        toast({
          title: "Request assigned",
          description: `"${request.productName}" assigned to ${product.name}. Customer will be notified when available.`,
          variant: "default",
        });
      }

      setIsAssigning(null);
    }, 1000);
  };

  const handleProductSelected = (scanResult: ScanResponse) => {
    // Convert scan result to dashboard label format
    const dashboardLabel = {
      id: scanResult.label.id,
      code: scanResult.label.code,
      name: scanResult.label.name,
      waitingCount: scanResult.subscribers_count,
      lastSendTimestamp: scanResult.last_sent,
    };

    setSelectedDashboardLabel(dashboardLabel);
    setShowScanner(false);
    toast({
      title: "Product selected",
      description: `Selected: ${scanResult.label.name}`,
    });
  };

  const handleAlertsSent = async () => {
    // Close the scanner modal
    setShowScanner(false);

    // Refresh dashboard data
    const fetchDashboardData = async () => {
      try {
        setIsLoadingDashboard(true);
        const dashboardResponse = await apiService.fetchTeamDashboard();
        setDashboardData(dashboardResponse.metrics.topLabels);
        setActiveVisitors(dashboardResponse.metrics.activeVisitors);
        setPendingAlerts(dashboardResponse.metrics.pendingAlerts);
        setLocationName(dashboardResponse.locationName);

        // Update the selected label with fresh data from dashboard
        const updatedLabel = dashboardResponse.metrics.topLabels.find(
          (label) => label.id === selectedDashboardLabel?.id
        );
        if (updatedLabel) {
          setSelectedDashboardLabel(updatedLabel);
        }
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
        toast({
          title: "Warning",
          description: "Alerts sent but failed to refresh dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    await fetchDashboardData();
  };

  const handleSendAlerts = async (message?: string) => {
    if (!selectedDashboardLabel) {
      toast({
        title: "No product selected",
        description: "Please select a product from the list below first.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDashboardLabel.waitingCount === 0) {
      toast({
        title: "No subscribers",
        description: `No one is waiting for ${selectedDashboardLabel.name}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the actual API to send alerts
      const response = await apiService.sendAlerts({
        labelId: selectedDashboardLabel.id,
        message: message || "🚨 Alert: Product is now available! Check our store for the latest stock.",
      });

      if (response.success) {
        toast({
          title: "Alerts sent successfully!",
          description: `Sent to ${response.sent_count} subscribers for ${response.label_name}`,
        });

        // Update the selected label with new data
        setSelectedDashboardLabel((prev) =>
          prev
            ? {
                ...prev,
                lastSendTimestamp: response.last_send_timestamp,
              }
            : null
        );

        // Refresh dashboard data after successful send
        const fetchDashboardData = async () => {
          try {
            setIsLoadingDashboard(true);
            const dashboardResponse = await apiService.fetchTeamDashboard();
            setDashboardData(dashboardResponse.metrics.topLabels);
            setActiveVisitors(dashboardResponse.metrics.activeVisitors);
            setPendingAlerts(dashboardResponse.metrics.pendingAlerts);
            setLocationName(dashboardResponse.locationName);

            // Update the selected label with fresh data from dashboard
            const updatedLabel = dashboardResponse.metrics.topLabels.find(
              (label) => label.id === selectedDashboardLabel?.id
            );
            if (updatedLabel) {
              setSelectedDashboardLabel(updatedLabel);
            }
          } catch (error) {
            console.error('Failed to refresh dashboard data:', error);
            toast({
              title: "Warning",
              description: "Alerts sent but failed to refresh dashboard data. Please refresh the page.",
              variant: "destructive",
            });
          } finally {
            setIsLoadingDashboard(false);
          }
        };
        fetchDashboardData();
      } else {
        toast({
          title: "Rate limit exceeded",
          description:
            response.message ||
            "This label was already sent an alert recently.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Send alerts error:', error);

      // Handle rate limiting (429 status)
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        toast({
          title: "Rate limit exceeded",
          description: errorData.message || "This label was already sent an alert recently.",
          variant: "destructive",
        });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to send alerts";
        toast({
          title: "Error sending alerts",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleLabelSelect = (label: DashboardLabel) => {
    setSelectedDashboardLabel(label);
  };

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(notifySearch.toLowerCase()) ||
      product.code.toLowerCase().includes(notifySearch.toLowerCase())
  );

  const pendingRequests = mockRequests.filter((r) => r.status === "pending");

  // Get current product info from dashboard data
  const getCurrentProductInfo = () => {
    if (selectedDashboardLabel) {
      return {
        name: selectedDashboardLabel.name,
        subscriberCount: selectedDashboardLabel.waitingCount,
        lastSendTime: selectedDashboardLabel.lastSendTimestamp ? new Date(selectedDashboardLabel.lastSendTimestamp) : undefined,
      };
    }
    return {
      name: "No product selected",
      subscriberCount: 0,
      lastSendTime: undefined,
    };
  };

  const currentProductInfo = getCurrentProductInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Use the new TeamDashboard component */}
      <TeamDashboard
        onLogout={onLogout}
        onScan={() => setShowScanner(true)}
        onAuditLog={() => setShowAuditLog(true)}
        onSendAlerts={handleSendAlerts}
        currentLabel={currentProductInfo.name}
        subscriberCount={currentProductInfo.subscriberCount}
        lastSendTime={currentProductInfo.lastSendTime}
        dashboardLabels={dashboardData}
        onLabelSelect={handleLabelSelect}
        selectedLabelId={selectedDashboardLabel?.id}
        activeVisitors={activeVisitors}
        pendingAlerts={pendingAlerts}
        isLoading={isLoadingDashboard}
        locationName={locationName}
      />

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-container">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col modal-content">
            <ProductScanner
              onProductSelected={handleProductSelected}
              onBack={() => setShowScanner(false)}
              onAlertsSent={handleAlertsSent}
            />
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-container">
          <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col modal-content">
            <AuditLog onBack={() => setShowAuditLog(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;