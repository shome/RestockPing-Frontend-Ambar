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
  Keyboard,
  Users,
  Send,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, ScanResponse, SendAlertsResponse } from "@/lib/api";

interface ProductScannerProps {
  onProductSelected: (scanResult: ScanResponse) => void;
  onBack: () => void;
  onAlertsSent?: () => void;
}

const ProductScanner = ({ onProductSelected, onBack, onAlertsSent }: ProductScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [isScanningAPI, setIsScanningAPI] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [barcodeDetectorSupported, setBarcodeDetectorSupported] = useState(false);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [sendAlertsResult, setSendAlertsResult] = useState<SendAlertsResponse | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showValidationError, setShowValidationError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Check if BarcodeDetector is supported
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      setBarcodeDetectorSupported(true);
    }
  }, []);

  const handleScanAPI = async (code: string, method: "scan" | "manual") => {
    try {
      setIsScanningAPI(true);
      setScanError("");
      setScanResult(null);

      const response = await apiService.scanProduct({ code, method });
      
      if (response.success) {
        setScanResult(response);
        toast({
          title: "Product found!",
          description: `Found: ${response.label.name}`,
        });
      }
    } catch (error) {
      console.error('Scan API error:', error);
      setScanError(error instanceof Error ? error.message : "Failed to scan product");
    } finally {
      setIsScanningAPI(false);
    }
  };

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
          const scannedCode = barcode.rawValue;
          
          stopScanning();
          await handleScanAPI(scannedCode, "scan");
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

  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      setScanError("Please enter a product code");
      return;
    }
    
    await handleScanAPI(manualCode.trim(), "manual");
  };

  const handleProductSelect = () => {
    if (scanResult) {
      onProductSelected(scanResult);
    }
  };

  const handleSendAlerts = async () => {
    if (!scanResult) {
      setScanError("No product selected. Please scan a product first.");
      return;
    }

    if (!alertMessage.trim()) {
      setShowValidationError(true);
      setScanError("Please enter a message for the alert. You can use the suggested message or write your own.");
      return;
    }

    // Clear validation error if message is provided
    setShowValidationError(false);

    try {
      setIsSendingAlerts(true);
      setScanError("");
      setSendAlertsResult(null);

      const response = await apiService.sendAlerts({
        labelId: scanResult.label.id,
        message: alertMessage.trim()
      });

      setSendAlertsResult(response);
      
      if (response.success) {
        // Update the scan result with new timestamp
        setScanResult(prev => prev ? {
          ...prev,
          last_sent: response.last_send_timestamp,
          next_allowed: response.next_allowed_send,
          sent_count: response.sent_count
        } : null);

        // Reset the message input after successful send
        setAlertMessage("");

        toast({
          title: "Alerts sent successfully!",
          description: `Sent to ${response.sent_count} subscribers for ${response.label_name}`,
        });

        // Call the parent callback to close scanner and refresh dashboard
        if (onAlertsSent) {
          // Small delay to let user see the success message
          setTimeout(() => {
            onAlertsSent();
          }, 1500);
        }
      } else {
        toast({
          title: "Rate limit exceeded",
          description: response.message || "This label was already sent an alert recently.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Send alerts error:', error);
      
      // Handle rate limiting (429 status)
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        setSendAlertsResult(errorData);
        toast({
          title: "Rate limit exceeded",
          description: errorData.message || "This label was already sent an alert recently.",
          variant: "destructive",
        });
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to send alerts";
        setScanError(errorMessage);
        toast({
          title: "Error sending alerts",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSendingAlerts(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const formatLastSent = (timestamp: string) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
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
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Scan Product</h1>
            <p className="text-sm text-muted-foreground">Scan barcode or enter code manually</p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-8 modal-scrollbar min-h-0">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Camera Scanner */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5" />
                Barcode Scanner
              </CardTitle>
              <CardDescription>
                {barcodeDetectorSupported 
                  ? "Point camera at product barcode"
                  : "Barcode scanning not supported"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
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
                <div className="space-y-3">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg border"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 right-2 h-6 bg-primary/20 rounded flex items-center justify-center">
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

            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5" />
                Manual Entry
              </CardTitle>
              <CardDescription>
                Enter product code manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter product code..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleManualScan}
                  disabled={!manualCode.trim() || isScanningAPI}
                  className="flex items-center gap-2"
                >
                  {isScanningAPI ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  Scan
                </Button>
              </div>

              {scanError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{scanError}</AlertDescription>
                </Alert>
              )}

              {/* Test Codes */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Test Product Codes:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualCode("DRONE")}
                    className="text-xs"
                  >
                    DRONE
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualCode("LAPTOP")}
                    className="text-xs"
                  >
                    LAPTOP
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualCode("PHONE")}
                    className="text-xs"
                  >
                    PHONE
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualCode("TABLET")}
                    className="text-xs"
                  >
                    TABLET
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Click any code above to test, or enter your own product code
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Send Alerts Result */}
          {sendAlertsResult && !sendAlertsResult.success && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Rate Limited
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-orange-600">{sendAlertsResult.message}</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">
                      Next allowed: {new Date(sendAlertsResult.next_allowed_send).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last sent: {formatLastSent(sendAlertsResult.last_send_timestamp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan Result */}
          {scanResult && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Product Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{scanResult.label.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Code: {scanResult.label.code} • Location: {scanResult.label.location_name}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{scanResult.subscribers_count}</p>
                        <p className="text-xs text-muted-foreground">Waiting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{scanResult.sent_count}</p>
                        <p className="text-xs text-muted-foreground">Sent</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Last sent: {formatLastSent(scanResult.last_sent)}</p>
                      <p className="text-xs text-muted-foreground">
                        Next allowed: {new Date(scanResult.next_allowed).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Alert Message Input */}
                  <div className="space-y-2">
                    <label htmlFor="alert-message" className="text-sm font-medium text-gray-700">
                      Alert Message
                    </label>
                    <textarea
                      id="alert-message"
                      value={alertMessage}
                      onChange={(e) => {
                        setAlertMessage(e.target.value);
                        // Clear validation error when user starts typing
                        if (showValidationError && e.target.value.trim()) {
                          setShowValidationError(false);
                        }
                      }}
                      placeholder="🚨 Alert: Product is now available! Check our store for the latest stock."
                      className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        showValidationError 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      rows={3}
                      disabled={isSendingAlerts}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        This message will be sent to all {scanResult.subscribers_count} waiting subscribers
                      </p>
                      <p className="text-xs text-gray-400">
                        {alertMessage.length}/160 characters
                      </p>
                    </div>
                    
                    {showValidationError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Please enter a message or click one of the preset options below
                      </p>
                    )}
                    
                    {/* Quick Message Options */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAlertMessage("🚨 Alert: Product is now available! Check our store for the latest stock.");
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
                          setAlertMessage("📦 Good news! Your requested item is back in stock. Visit us today!");
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
                          setAlertMessage("⚡ Limited time! Your product is available now. Don't miss out!");
                          setShowValidationError(false);
                        }}
                        className="text-xs"
                      >
                        Limited Time
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleSendAlerts}
                      disabled={isSendingAlerts}
                      className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      title={!alertMessage.trim() ? "Please enter a message first" : ""}
                    >
                      {isSendingAlerts ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isSendingAlerts ? "Sending Alerts..." : "Send Alerts"}
                    </Button>
                    
                    <Button 
                      onClick={handleProductSelect}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Select This Product
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScanner;
