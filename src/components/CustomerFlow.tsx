import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, CheckCircle, Package } from "lucide-react";
import { mockProducts, createOptIn, createRequest, sendSMS, Product } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

type Step = 'search' | 'phone' | 'success';

const CustomerFlow = () => {
  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customProductName, setCustomProductName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const { toast } = useToast();

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomProduct(false);
    setStep('phone');
  };

  const handleCantFind = () => {
    setIsCustomProduct(true);
    setSelectedProduct(null);
    setStep('phone');
  };

  const handleSubmit = () => {
    if (!phone.trim() || !consent) {
      toast({
        title: "Missing information",
        description: "Please enter your phone number and agree to receive notifications.",
        variant: "destructive",
      });
      return;
    }

    if (isCustomProduct && !customProductName.trim()) {
      toast({
        title: "Missing product name",
        description: "Please enter the product name.",
        variant: "destructive",
      });
      return;
    }

    if (isCustomProduct) {
      // Create a request for unknown product
      createRequest(phone, customProductName);
      const message = `Got it! You asked for '${customProductName}'. We'll match it and text you when it's in. Reply STOP to unsubscribe.`;
      sendSMS(phone, message, 'request_confirmation');
    } else if (selectedProduct) {
      // Create opt-in for known product
      createOptIn(phone, selectedProduct.id, selectedProduct.name);
      const message = `Thanks! We'll text when ${selectedProduct.name} is back. Reply STOP to unsubscribe.`;
      sendSMS(phone, message, 'confirmation');
    }

    setStep('success');
  };

  const handleReset = () => {
    setStep('search');
    setSearchQuery("");
    setSelectedProduct(null);
    setCustomProductName("");
    setPhone("");
    setConsent(false);
    setIsCustomProduct(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Package className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Back in Stock Alerts</h1>
          <p className="text-muted-foreground">Get notified when items return</p>
        </div>

        {step === 'search' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Product
              </CardTitle>
              <CardDescription>
                Search for the item you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchQuery && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => handleProductSelect(product)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <Badge variant={product.inStock ? "success" : "secondary"}>
                          {product.inStock ? "In Stock" : "Notify Me"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCantFind}
                >
                  Can't find this item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'phone' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Almost Done!
              </CardTitle>
              <CardDescription>
                {isCustomProduct 
                  ? "Tell us what you're looking for and we'll find it"
                  : `Get notified when ${selectedProduct?.name} is back`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCustomProduct && (
                <Input
                  placeholder="What product are you looking for?"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                />
              )}

              <Input
                placeholder="Your phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground leading-5">
                  I agree to receive SMS notifications about product availability. 
                  Message and data rates may apply. Reply STOP to unsubscribe.
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('search')}>
                  Back
                </Button>
                <Button 
                  variant="customer" 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={!phone.trim() || !consent || (isCustomProduct && !customProductName.trim())}
                >
                  Get Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="shadow-lg border-success/20">
            <CardContent className="text-center space-y-4 p-6">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">All Set!</h3>
                <p className="text-muted-foreground">
                  {isCustomProduct 
                    ? "We've received your request and will match it to a product. You'll get a text when it's available."
                    : `We'll text you when ${selectedProduct?.name} is back in stock.`
                  }
                </p>
              </div>
              <Button variant="customer" onClick={handleReset}>
                Search Another Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerFlow;