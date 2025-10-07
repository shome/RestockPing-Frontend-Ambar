import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, CheckCircle, Package, Loader2, AlertCircle, Clock } from "lucide-react";
import { Product } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useSearchProducts } from "@/hooks/useSearchProducts";
import { apiService, CreateRequestPayload, VerifyCaptchaPayload } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MathCaptcha } from "@/components/ui/math-captcha";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountrySelect } from "@/components/ui/country-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCaptchaThrottle } from "@/hooks/useCaptchaThrottle";

type Step = 'search' | 'phone' | 'success';

interface CustomerFlowProps {
  locationId?: string | null;
}

const CustomerFlow = ({ locationId }: CustomerFlowProps) => {
  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customProductName, setCustomProductName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{code: string; name: string; dialCode: string} | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isImageValid, setIsImageValid] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [captchaSessionId, setCaptchaSessionId] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { toast } = useToast();

  // Generate a simple identifier for throttling (in a real app, this would be the user's IP)
  // Use a fixed identifier for the session to properly track requests
  const userIdentifier = 'session_user';
  const { 
    isThrottled, 
    remainingRequests, 
    timeUntilReset, 
    checkThrottle, 
    resetCaptcha 
  } = useCaptchaThrottle(userIdentifier);

  // Enhanced captcha verification
  const handleCaptchaVerify = async (isValid: boolean, sessionId?: string, answer?: number): Promise<void> => {
    console.log('Captcha verification:', { isValid, sessionId, answer });
    
    // Always capture session ID and answer for API submission
    if (sessionId && answer !== undefined) {
      setCaptchaSessionId(sessionId);
      setCaptchaAnswer(answer);
      console.log('Captcha data set:', { sessionId, answer });
      
      // Immediately verify with backend
      const captchaPayload: VerifyCaptchaPayload = {
        captchaSessionId: sessionId,
        captchaAnswer: answer,
      };

      const captchaResponse = await apiService.verifyCaptcha(captchaPayload);
      
      // Only consider successful if success: true
      if (!captchaResponse.success) {
        // Trigger throttling for failed captcha attempts
        checkThrottle(userIdentifier);
        throw new Error(captchaResponse.message || 'Captcha verification failed');
      }

      console.log('Captcha verified successfully');
    }
  };

  // Handle every captcha attempt for throttling
  const handleCaptchaAttempt = () => {
    checkThrottle(userIdentifier);
  };

  // Check throttle status when component mounts
  React.useEffect(() => {
    checkThrottle(userIdentifier);
  }, [checkThrottle, userIdentifier]);


  // Use the custom hook for API-based product search with debouncing
  const { products: filteredProducts, isLoading, error, hasSearched } = useSearchProducts(searchQuery);

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

  const handleSubmit = async () => {
    // Check throttling first - this will update the state and show alert if needed
    const isAllowed = checkThrottle(userIdentifier);
    if (!isAllowed) {
      const minutes = Math.ceil(timeUntilReset / 60000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${minutes} minute(s) before trying again. You have ${remainingRequests} attempts remaining.`,
        variant: "destructive",
      });
      return;
    }

    // Check core requirements: consent + captcha + valid phone
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please agree to receive notifications to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!captchaSessionId || captchaAnswer === null || captchaAnswer === undefined) {
      toast({
        title: "Security check required",
        description: "Please complete the math captcha to continue.",
        variant: "destructive",
      });
      return;
    }

    // Image is now optional for custom products
    // if (isCustomProduct && (!isImageValid || !uploadedImage)) {
    //   toast({
    //     title: "Image required",
    //     description: "Please upload an image before proceeding.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (!isPhoneValid || !phone.trim() || !selectedCountry) {
      toast({
        title: "Invalid phone number",
        description: "Please select a country and enter a valid 10-digit phone number.",
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

    // Process the request via API
    const fullPhoneNumber = selectedCountry.dialCode + phone;
    
    // Validate required captcha data
    if (!captchaSessionId || captchaAnswer === null || captchaAnswer === undefined) {
      console.log('Captcha validation failed:', { captchaSessionId, captchaAnswer });
      toast({
        title: "Captcha error",
        description: "Please complete the captcha again.",
        variant: "destructive",
      });
      return;
    }

    // Validate location ID
    if (!locationId) {
      toast({
        title: "Location error",
        description: "Location ID is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Proceed with the main request (captcha is already verified)
      const payload: CreateRequestPayload = {
        locationId: locationId,
        phone: fullPhoneNumber,
      };

      console.log('API Payload:', payload);

      if (isCustomProduct) {
        // Custom product request
        payload.labelName = customProductName;
        if (uploadedImage) {
          payload.image = uploadedImage;
        }
      } else if (selectedProduct) {
        // Existing product request
        payload.labelId = selectedProduct.id;
      }

      const response = await apiService.createRequest(payload);
      
      if (response.success) {
        // Store the success message from API response
        setSuccessMessage(response.message || 'Request submitted successfully!');
        setStep('success');
      } else {
        throw new Error(response.message || 'Request failed');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      
      // Get error message from API response
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('search');
    setSearchQuery("");
    setSelectedProduct(null);
    setCustomProductName("");
    setPhone("");
    setIsPhoneValid(false);
    setSelectedCountry(null);
    setUploadedImage(null);
    setIsImageValid(false);
    setConsent(false);
    setIsCustomProduct(false);
    setCaptchaSessionId(null);
    setCaptchaAnswer(null);
    setIsSubmitting(false);
    setSuccessMessage('');
    resetCaptcha();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Package className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Product Notifications</h1>
          <p className="text-muted-foreground">Get notified about product updates</p>
        </div>

        {step === 'search' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Product
              </CardTitle>
              <CardDescription>
                Search for the product you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products... (min 2 characters)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchQuery && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Searching products...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {error && ( 
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* No Results State */}
                  {!isLoading && !error && hasSearched && filteredProducts.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No products found for "{searchQuery}"</p>
                    </div>
                  )}

                  {/* Search Results */}
                  {!isLoading && !error && filteredProducts.length > 0 && (
                    <>
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
                              <p className="text-xs text-muted-foreground">Code: {product.code}</p>
                            </div>
                            <Badge variant={product.inStock ? "default" : "secondary"}>
                              {product.inStock ? "Active" : "Inactive"}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCantFind}
                >
                  Can't find this product
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
                  ? "Tell us what product you're looking for and we'll find it"
                  : `Get notified about ${selectedProduct?.name} updates`
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

              {/* Image Upload - Only for custom products */}
              {isCustomProduct && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Image (Optional)</label>
                  <ImageUpload
                    value={uploadedImage}
                    onChange={setUploadedImage}
                    onValidationChange={setIsImageValid}
                  />
                </div>
              )}

              {/* Country Selector and Phone Input in single line */}
              <div className="flex gap-2">
                <CountrySelect
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                />
                <div className="flex-1">
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    onValidationChange={setIsPhoneValid}
                    selectedCountry={selectedCountry}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>


              {/* Throttling Status - Only show when limit is reached */}
              {isThrottled && remainingRequests === 0 && (
                <Alert key={`throttle-${isThrottled}-${remainingRequests}`} variant="destructive">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    You've reached the request limit (5 attempts per minute). Please wait before trying again.
                    {timeUntilReset > 0 && (
                      <span className="block text-xs mt-1">
                        Reset in {Math.ceil(timeUntilReset / 1000)} seconds
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}


              {/* Math Captcha */}
              <div className={`border rounded-lg p-4 ${isThrottled ? 'bg-muted/50 opacity-50' : 'bg-muted/30'}`}>
                {isThrottled ? (
                  <div className="text-center text-muted-foreground">
                    <div className="text-sm font-medium mb-2">Captcha Disabled</div>
                    <div className="text-xs">Please wait for the throttling period to reset</div>
                  </div>
                ) : (
                  <MathCaptcha onVerify={handleCaptchaVerify} onAttempt={handleCaptchaAttempt} />
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground leading-5">
                  I agree to receive SMS notifications about product updates. 
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
                  disabled={
                    // Core requirements: consent + captcha + valid phone
                    !consent || 
                    !captchaSessionId || 
                    captchaAnswer === null ||
                    !isPhoneValid ||
                    // Additional requirements
                    !phone.trim() || 
                    !selectedCountry ||
                    isThrottled ||
                    (isCustomProduct && !customProductName.trim()) ||
                    // Loading state
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : isThrottled ? (
                    'Too Many Requests'
                  ) : (
                    'Get Notifications'
                  )}
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
                  {successMessage || (
                    isCustomProduct 
                      ? "We've received your request and will match it to a product. You'll get a text when it's available."
                      : `We'll text you about ${selectedProduct?.name} updates.`
                  )}
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