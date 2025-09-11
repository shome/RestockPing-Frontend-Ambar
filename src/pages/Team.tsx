import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle, Search, Send, History, QrCode, Package } from "lucide-react";
import AuditLog from "@/components/AuditLog";
import ProductScanner from "@/components/ProductScanner";
import { 
  mockProducts, 
  mockOptIns, 
  mockRequests, 
  sendSMS, 
  createOptIn,
  Product,
  Request
} from "@/lib/mockData";
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
  const { toast } = useToast();

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
      optIn => optIn.productId === selectedProduct.id && !optIn.notified
    );

    if (optInsForProduct.length === 0) {
      toast({
        title: "No subscribers",
        description: `No one is waiting for ${selectedProduct.name}.`,
      });
      return;
    }

    // Send notifications
    optInsForProduct.forEach(optIn => {
      const message = `Heads up: ${selectedProduct.name} is now available. Limited stock. Reply STOP to opt out.`;
      sendSMS(optIn.phone, message, 'notification');
      optIn.notified = true;
    });

    toast({
      title: "Notifications sent!",
      description: `Notified ${optInsForProduct.length} customer${optInsForProduct.length === 1 ? '' : 's'}.`,
      variant: "default",
    });

    setSelectedProduct(null);
    setNotifySearch("");
  };

  const handleAssignRequest = (requestId: string, productId: string) => {
    setIsAssigning(requestId);
    
    setTimeout(() => {
      const request = mockRequests.find(r => r.id === requestId);
      const product = mockProducts.find(p => p.id === productId);
      
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

  const handleProductSelected = (productId: string, productName: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setShowScanner(false);
      toast({
        title: "Product selected",
        description: `Selected: ${product.name}`,
      });
    }
  };

  const handleSendAlerts = () => {
    if (!currentProduct) {
      toast({
        title: "No product selected",
        description: "Please scan or select a product first.",
        variant: "destructive",
      });
      return;
    }

    const waitingCount = mockOptIns.filter(
      optIn => optIn.productId === currentProduct.id && !optIn.notified
    ).length;

    if (waitingCount === 0) {
      toast({
        title: "No subscribers",
        description: `No one is waiting for ${currentProduct.name}.`,
        variant: "destructive",
      });
      return;
    }

    // Send notifications
    mockOptIns.forEach(optIn => {
      if (optIn.productId === currentProduct.id && !optIn.notified) {
        const message = `Heads up: ${currentProduct.name} is now available. Limited stock. Reply STOP to opt out.`;
        sendSMS(optIn.phone, message, 'notification');
        optIn.notified = true;
      }
    });

    toast({
      title: "Alerts sent successfully!",
      description: `Notified ${waitingCount} subscriber${waitingCount === 1 ? '' : 's'}`,
    });
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(notifySearch.toLowerCase()) ||
    product.code.toLowerCase().includes(notifySearch.toLowerCase())
  );

  const pendingRequests = mockRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Team Dashboard</h1>
            <p className="text-muted-foreground">Manage back-in-stock notifications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowScanner(true)} 
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSendAlerts}
              disabled={!currentProduct}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send Alerts</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAuditLog(true)} 
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </Button>
            <Button variant="outline" onClick={onLogout} className="w-full sm:w-auto">
              Logout
            </Button>
          </div>
        </div>

        {/* Current Product Status */}
        {currentProduct && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Current Product</h3>
                    <p className="text-sm text-muted-foreground">{currentProduct.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Waiting subscribers:</p>
                  <p className="text-2xl font-bold text-primary">
                    {mockOptIns.filter(optIn => optIn.productId === currentProduct.id && !optIn.notified).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="notify" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-full">
            <TabsTrigger value="notify" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Send Notifications
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Requests
              {pendingRequests.length > 0 && (
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Send Stock Notifications
                </CardTitle>
                <CardDescription>
                  Search for a product and notify customers when it's back in stock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by product name or code..."
                      value={notifySearch}
                      onChange={(e) => setNotifySearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleNotify}
                    disabled={!selectedProduct}
                    variant="customer"
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Notifications
                  </Button>
                </div>

                {notifySearch && (
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => {
                      const waitingCount = mockOptIns.filter(
                        optIn => optIn.productId === product.id && !optIn.notified
                      ).length;
                      
                      return (
                        <Card 
                          key={product.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">Code: {product.code}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {waitingCount > 0 && (
                                <Badge variant="outline">{waitingCount} waiting</Badge>
                              )}
                              <Badge variant={product.inStock ? "success" : "secondary"}>
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Product Requests
                </CardTitle>
                <CardDescription>
                  Assign customer requests to existing products
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-warning">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">"{request.productName}"</h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                <span>Customer: {request.phone}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{request.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Assign to product:</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                {mockProducts.map((product) => (
                                  <Button
                                    key={product.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssignRequest(request.id, product.id)}
                                    disabled={isAssigning === request.id}
                                    className="justify-start text-left h-auto py-2 px-3"
                                  >
                                    <span className="truncate">
                                      {isAssigning === request.id ? "Assigning..." : product.name}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <ProductScanner 
              onProductSelected={handleProductSelected}
              onBack={() => setShowScanner(false)}
            />
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <AuditLog onBack={() => setShowAuditLog(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;