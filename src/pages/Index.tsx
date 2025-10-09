import { useSearchParams } from 'react-router-dom';
import CustomerFlow from "@/components/CustomerFlow";
import { useDefaultLocation } from "@/hooks/useDefaultLocation";

const Index = () => {
  const [searchParams] = useSearchParams();
  const urlLocation = searchParams.get('location');
  const { defaultLocationId, isLoading } = useDefaultLocation();
  
  // 🔧 Use URL location if provided, otherwise use default location from API
  const locationId = urlLocation || defaultLocationId;
  
  console.log('🔍 Location debug:', { 
    urlParam: urlLocation, 
    defaultFromAPI: defaultLocationId,
    finalLocationId: locationId,
    isLoading
  });

  // Show loading while fetching default location (only if no URL param)
  if (!urlLocation && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location...</p>
        </div>
      </div>
    );
  }

  // Show error if no location ID available
  if (!urlLocation && !isLoading && !defaultLocationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl">⚠️</div>
          <h2 className="text-xl font-semibold">Location Required</h2>
          <p className="text-muted-foreground max-w-md">
            Unable to load location information. Please contact support or try accessing this page with a location parameter.
          </p>
          <p className="text-sm text-muted-foreground">
            Example: <code>?location=your-location-id</code>
          </p>
        </div>
      </div>
    );
  }

  return <CustomerFlow locationId={locationId} />;
};

export default Index;
