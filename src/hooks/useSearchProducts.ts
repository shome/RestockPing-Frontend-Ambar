import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { apiService, ApiProduct, SearchProductsResponse } from '@/lib/api';

interface UseSearchProductsReturn {
  products: ApiProduct[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

/**
 * Custom hook for searching products with debouncing
 * @param searchQuery - The search query string
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 500ms)
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Object containing products, loading state, error, and search status
 */
export function useSearchProducts(
  searchQuery: string,
  debounceDelay: number = 500,
  limit: number = 10
): UseSearchProductsReturn {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  useEffect(() => {
    // Don't search if query is empty or too short
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setProducts([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const searchProducts = async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response: SearchProductsResponse = await apiService.searchProducts(
          debouncedSearchQuery,
          limit
        );
        
        setProducts(response.products || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search products. Please try again.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearchQuery, limit]);

  return {
    products,
    isLoading,
    error,
    hasSearched,
  };
}
