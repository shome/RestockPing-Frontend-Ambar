import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle, Search, Send } from "lucide-react";
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

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(notifySearch.toLowerCase()) ||
    product.code.toLowerCase().includes(notifySearch.toLowerCase())
  );

  const pendingRequests = mockRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Dashboard</h1>
            <p className="text-muted-foreground">Manage back-in-stock notifications</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="notify" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
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
              <CardContent>
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
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-medium">"{request.productName}"</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Customer: {request.phone}</span>
                                <span>•</span>
                                <span>{request.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {mockProducts.map((product) => (
                                <Button
                                  key={product.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssignRequest(request.id, product.id)}
                                  disabled={isAssigning === request.id}
                                >
                                  {isAssigning === request.id ? "Assigning..." : `Assign to ${product.name}`}
                                </Button>
                              ))}
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
    </div>
  );
};

export default Team;