import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerFlow from "@/components/CustomerFlow";

const OptIn = () => {
  const [searchParams] = useSearchParams();
  let location = searchParams.get('location');

  // 🔧 Fallback: try to get location from different sources
  if (!location) {
    // Try to get from URL hash (in case it's after #)
    const hash = window.location.hash;
    if (hash.includes('location=')) {
      const hashParams = new URLSearchParams(hash.split('?')[1]);
      location = hashParams.get('location');
    }
    
    // Try to get from URL manually (in case React Router has issues)
    if (!location) {
      const urlParams = new URLSearchParams(window.location.search);
      location = urlParams.get('location');
    }
  }

  // 🔍 Debug logging to see what's happening
  useEffect(() => {
    console.log('🔍 OptIn Debug Info:', {
      fullURL: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      searchParams: Object.fromEntries(searchParams.entries()),
      locationParam: location,
      locationParamType: typeof location,
      locationParamLength: location?.length,
      manualURLParams: Object.fromEntries(new URLSearchParams(window.location.search).entries())
    });
  }, [searchParams, location]);

  // Show debug info if no location is found
  if (!location) {
    console.warn('⚠️ No location parameter found in URL');
    
    const handleLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const locationId = formData.get('locationId') as string;
      
      if (locationId && locationId.trim()) {
        // Redirect to the same page with location parameter
        window.location.href = `/optin?location=${encodeURIComponent(locationId.trim())}`;
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Location Required</h2>
            <p className="text-muted-foreground">
              This page requires a location parameter in the URL.
            </p>
            <p className="text-sm text-muted-foreground">
              Expected format: /optin?location=your-location-id
            </p>
          </div>
          
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div>
              <label htmlFor="locationId" className="block text-sm font-medium mb-2">
                Enter Location ID:
              </label>
              <input
                type="text"
                id="locationId"
                name="locationId"
                placeholder="e.g., 2b030802-42a1-4c89-9ea7-4968715257e3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Continue
            </button>
          </form>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Current URL: {window.location.href}</p>
            <p>Debug info logged to console</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CustomerFlow locationId={location} />
    </div>
  );
};

export default OptIn;
