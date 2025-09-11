import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  ArrowLeft, 
  Package,
  CheckCircle,
  AlertCircle,
  Keyboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductScannerProps {
  onProductSelected: (productId: string, productName: string) => void;
  onBack: () => void;
}

// Mock product data - in real app this would come from API
const mockProducts = [
  { id: "PROD001", name: "iPhone 15 Pro", code: "IPH15P", subscribers: 25 },
  { id: "PROD002", name: "Samsung Galaxy S24", code: "SGS24", subscribers: 18 },
  { id: "PROD003", name: "MacBook Pro M3", code: "MBPM3", subscribers: 12 },
  { id: "PROD004", name: "AirPods Pro 2", code: "APP2", subscribers: 8 },
  { id: "PROD005", name: "iPad Air 5", code: "IPAD5", subscribers: 15 },
];

const ProductScanner = ({ onProductSelected, onBack }: ProductScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [manualId, setManualId] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockProducts>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [barcodeDetectorSupported, setBarcodeDetectorSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Check if BarcodeDetector is supported
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      setBarcodeDetectorSupported(true);
    }
  }, []);

  const startScanning = async () => {
    try {
      setScanError("");
      setIsScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start barcode detection if supported
      if (barcodeDetectorSupported) {
        startBarcodeDetection();
      } else {
        setScanError("Barcode scanning not supported in this browser. Please use manual entry.");
      }

    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanError("Unable to access camera. Please check permissions and try again.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startBarcodeDetection = () => {
    if (!barcodeDetectorSupported) return;

    const barcodeDetector = new (window as any).BarcodeDetector({
      formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
    });

    const detectBarcodes = async () => {
      if (!videoRef.current || !isScanning) return;

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          const productId = barcode.rawValue;
          
          // Find product by ID or code
          const product = mockProducts.find(p => 
            p.id === productId || p.code === productId
          );

          if (product) {
            stopScanning();
            onProductSelected(product.id, product.name);
            toast({
              title: "Product found!",
              description: `Scanned: ${product.name}`,
            });
          } else {
            setScanError(`Product not found for code: ${productId}`);
          }
        }
      } catch (error) {
        console.error('Barcode detection error:', error);
      }

      if (isScanning) {
        requestAnimationFrame(detectBarcodes);
      }
    };

    detectBarcodes();
  };

  const handleManualSearch = async () => {
    if (!manualId.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API search delay
    setTimeout(() => {
      const results = mockProducts.filter(product =>
        product.id.toLowerCase().includes(manualId.toLowerCase()) ||
        product.code.toLowerCase().includes(manualId.toLowerCase()) ||
        product.name.toLowerCase().includes(manualId.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleProductSelect = (product: typeof mockProducts[0]) => {
    onProductSelected(product.id, product.name);
    toast({
      title: "Product selected!",
      description: `Selected: ${product.name}`,
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scan Product</h1>
            <p className="text-muted-foreground">Scan barcode or enter product ID manually</p>
          </div>
        </div>

        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Barcode Scanner
            </CardTitle>
            <CardDescription>
              {barcodeDetectorSupported 
                ? "Point your camera at a product barcode to scan"
                : "Barcode scanning not supported in this browser"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {barcodeDetectorSupported 
                    ? "Click to start scanning"
                    : "Use manual entry below"
                  }
                </p>
                <Button 
                  onClick={startScanning}
                  disabled={!barcodeDetectorSupported}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 sm:h-80 object-cover rounded-lg border"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                    <div className="absolute top-2 left-2 right-2 h-8 bg-primary/20 rounded flex items-center justify-center">
                      <p className="text-xs text-primary font-medium">Scanning...</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <CameraOff className="h-4 w-4" />
                  Stop Scanning
                </Button>
              </div>
            )}

            {scanError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Manual Entry
            </CardTitle>
            <CardDescription>
              Enter product ID, code, or name to search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter product ID, code, or name..."
                value={manualId}
                onChange={(e) => {
                  setManualId(e.target.value);
                  handleManualSearch();
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleManualSearch}
                disabled={!manualId.trim() || isSearching}
                variant="outline"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Search Results:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Card 
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleProductSelect(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {product.id} • Code: {product.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {product.subscribers} waiting
                            </Badge>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {manualId && searchResults.length === 0 && !isSearching && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No products found matching "{manualId}"
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Select
            </CardTitle>
            <CardDescription>
              Select from common products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockProducts.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  onClick={() => handleProductSelect(product)}
                  className="flex items-center justify-between p-4 h-auto touch-manipulation"
                >
                  <div className="text-left">
                    <p className="font-medium text-sm sm:text-base">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.code}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{product.subscribers}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductScanner;
