import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  QrCode, 
  Send, 
  History, 
  LogOut,
  Package,
  Clock,
  RefreshCw
} from "lucide-react";
import PinLogin from "@/components/PinLogin";
import TeamDashboard from "@/components/TeamDashboard";
import ProductScanner from "@/components/ProductScanner";
import AuditLog from "@/components/AuditLog";
import { useToast } from "@/hooks/use-toast";

type Page = 'home' | 'pin-login' | 'dashboard' | 'scanner' | 'audit-log';

interface TeamManagementProps {
  onLogout: () => void;
}

interface Product {
  id: string;
  name: string;
  code: string;
  subscribers: number;
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

const TeamManagement = ({ onLogout }: TeamManagementProps) => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [lastSendTime, setLastSendTime] = useState<Date | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const { toast } = useToast();

  // Mock product data
  const mockProducts: Product[] = [
    { id: "PROD001", name: "iPhone 15 Pro", code: "IPH15P", subscribers: 25 },
    { id: "PROD002", name: "Samsung Galaxy S24", code: "SGS24", subscribers: 18 },
    { id: "PROD003", name: "MacBook Pro M3", code: "MBPM3", subscribers: 12 },
    { id: "PROD004", name: "AirPods Pro 2", code: "APP2", subscribers: 8 },
    { id: "PROD005", name: "iPad Air 5", code: "IPAD5", subscribers: 15 },
  ];

  // Mock audit entries
  const mockAuditEntries: AuditEntry[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: "John Doe",
      action: "send_alerts",
      details: "Sent alerts to waiting subscribers",
      subscriberCount: 25,
      productName: "iPhone 15 Pro",
      productId: "PROD001"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: "Jane Smith",
      action: "product_scan",
      details: "Scanned product barcode",
      productName: "Samsung Galaxy S24",
      productId: "PROD002"
    }
  ];

  useEffect(() => {
    setAuditEntries(mockAuditEntries);
  }, []);

  const handlePinLogin = (pin: string, location: string) => {
    // Mock user mapping based on PIN
    const userMap: { [key: string]: string } = {
      "1234": "John Doe",
      "5678": "Jane Smith", 
      "9999": "Mike Johnson"
    };
    
    const user = userMap[pin] || "Unknown User";
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    
    // Add login audit entry with location
    addAuditEntry({
      user,
      action: 'login',
      details: `Logged in to team dashboard from ${location}`
    });
  };

  const handleLogout = () => {
    // Add logout audit entry
    addAuditEntry({
      user: currentUser,
      action: 'logout',
      details: 'Logged out of team dashboard'
    });
    
    setIsAuthenticated(false);
    setCurrentUser("");
    setCurrentProduct(null);
    setCurrentPage('home');
    onLogout();
  };

  const handleProductSelected = (productId: string, productName: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setCurrentPage('dashboard');
      
      // Add product scan audit entry
      addAuditEntry({
        user: currentUser,
        action: 'product_scan',
        details: 'Scanned product barcode',
        productName: product.name,
        productId: product.id
      });
    }
  };

  const handleSendAlerts = () => {
    if (!currentProduct) return;
    
    // Add send alerts audit entry
    addAuditEntry({
      user: currentUser,
      action: 'send_alerts',
      details: 'Sent alerts to waiting subscribers',
      subscriberCount: currentProduct.subscribers,
      productName: currentProduct.name,
      productId: currentProduct.id
    });
    
    setLastSendTime(new Date());
  };

  const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...entry
    };
    setAuditEntries(prev => [newEntry, ...prev]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'pin-login':
        return (
          <PinLogin
            onLogin={handlePinLogin}
            onBack={() => setCurrentPage('home')}
          />
        );
      
      case 'dashboard':
        return (
          <TeamDashboard
            onLogout={handleLogout}
            onScan={() => setCurrentPage('scanner')}
            onAuditLog={() => setCurrentPage('audit-log')}
            onSendAlerts={handleSendAlerts}
            currentLabel={currentProduct?.name || "No product selected"}
            subscriberCount={currentProduct?.subscribers || 0}
            lastSendTime={lastSendTime || undefined}
          />
        );
      
      case 'scanner':
        return (
          <ProductScanner
            onProductSelected={handleProductSelected}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'audit-log':
        return (
          <AuditLog
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      
      default:
        return renderHomePage();
    }
  };

  const renderHomePage = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground text-lg">
            Manage back-in-stock notifications and team activities
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('pin-login')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Team Login
              </CardTitle>
              <CardDescription>
                Secure PIN-based authentication for team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Features:</p>
                <ul className="text-sm space-y-1">
                  <li>• 4-digit PIN authentication</li>
                  <li>• 10-15 minute sessions</li>
                  <li>• Secure team access</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('scanner')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Product Scanner
              </CardTitle>
              <CardDescription>
                Scan barcodes or manually select products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Features:</p>
                <ul className="text-sm space-y-1">
                  <li>• Barcode scanning with camera</li>
                  <li>• Manual ID entry fallback</li>
                  <li>• Quick product selection</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('audit-log')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>
                Track all team actions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Features:</p>
                <ul className="text-sm space-y-1">
                  <li>• Complete action history</li>
                  <li>• User activity tracking</li>
                  <li>• Export capabilities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Current system status and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{mockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold">
                  {mockProducts.reduce((sum, p) => sum + p.subscribers, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{auditEntries.length}</p>
                <p className="text-sm text-muted-foreground">Total Actions</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">
                  {auditEntries.filter(e => e.action === 'send_alerts').length}
                </p>
                <p className="text-sm text-muted-foreground">Alerts Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Information */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Demo Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Demo PINs:</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">1234 - John Doe</Badge>
                  <Badge variant="outline">5678 - Jane Smith</Badge>
                  <Badge variant="outline">9999 - Mike Johnson</Badge>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Available Locations:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>• Downtown Store</div>
                  <div>• Mall Location</div>
                  <div>• Airport Store</div>
                  <div>• University Store</div>
                  <div>• Suburban Store</div>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Location-based PIN authentication with 10-15 minute sessions</li>
                  <li>• Barcode scanning with camera (BarcodeDetector API)</li>
                  <li>• Manual product selection and search</li>
                  <li>• One-tap alert sending to all subscribers</li>
                  <li>• Complete audit logging with filtering and export</li>
                  <li>• Fully responsive design for mobile and tablet</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return renderPage();
};

export default TeamManagement;
