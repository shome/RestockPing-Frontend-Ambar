import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface Location {
  id: string;
  name: string;
  slug: string;
}

export function useDefaultLocation() {
  const [defaultLocationId, setDefaultLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get locations from the API
        const response = await fetch('/api/admin/locations?limit=1');
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();
        
        if (data.success && data.locations && data.locations.length > 0) {
          const firstLocation = data.locations[0];
          setDefaultLocationId(firstLocation.id);
          console.log('🏢 Using default location:', {
            id: firstLocation.id,
            name: firstLocation.name
          });
        } else {
          // Fallback to a hardcoded default
          const fallbackId = 'default-location-id';
          setDefaultLocationId(fallbackId);
          console.warn('⚠️ No locations found, using fallback:', fallbackId);
        }
      } catch (err) {
        console.error('❌ Error fetching default location:', err);
        // Use fallback location on error
        const fallbackId = 'default-location-id';
        setDefaultLocationId(fallbackId);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultLocation();
  }, []);

  return {
    defaultLocationId,
    isLoading,
    error
  };
}
