import { useEffect, useState } from "react";

export function useDefaultLocation() {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://restock-ping-backend-ambar-pzn5.vercel.app";

        console.log("🌍 Fetching default location from:", `${baseUrl}/api/admin/locations`);

        const res = await fetch(`${baseUrl}/api/admin/locations?limit=1`);
        
        // Check if response is ok first
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("📦 Locations response:", data);

        // Handle the expected response format from backend
        if (data.success && data.locations && data.locations.length > 0) {
          setLocationId(data.locations[0].id);
          console.log("✅ Default location fetched:", {
            id: data.locations[0].id,
            name: data.locations[0].name
          });
        } else if (Array.isArray(data) && data.length > 0) {
          // Fallback for different response format
          setLocationId(data[0].id);
          console.log("✅ Default location fetched (array format):", data[0].id);
        } else {
          console.warn("⚠️ No locations found, cannot proceed without valid location ID.");
          // Don't set a fake ID - let the validation handle it
          setLocationId(null);
        }
      } catch (err) {
        console.error("❌ Error fetching default location:", err);
        // Don't set a fake ID on error - let the validation handle it
        setLocationId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { 
    defaultLocationId: locationId, 
    isLoading: loading 
  };
}
