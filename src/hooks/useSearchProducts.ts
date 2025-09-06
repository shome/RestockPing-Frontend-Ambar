import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { apiService, ApiLabel, SearchLabelsResponse, ApiErrorHandler } from '@/lib/api';

interface UseSearchLabelsReturn {
  labels: ApiLabel[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

/**
 * Custom hook for searching labels with debouncing
 * @param searchQuery - The search query string
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 500ms)
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Object containing labels, loading state, error, and search status
 */
export function useSearchLabels(
  searchQuery: string,
  debounceDelay: number = 500,
  limit: number = 10
): UseSearchLabelsReturn {
  const [labels, setLabels] = useState<ApiLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  useEffect(() => {
    // Don't search if query is empty or too short
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setLabels([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const searchLabels = async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response: SearchLabelsResponse = await apiService.searchLabels(
          debouncedSearchQuery,
          limit
        );
        
        setLabels(response.labels || []);
      } catch (err) {
        console.error('Search error:', err);
        const errorMessage = ApiErrorHandler.getErrorMessage(err);
        setError(errorMessage);
        setLabels([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchLabels();
  }, [debouncedSearchQuery, limit]);

  return {
    labels,
    isLoading,
    error,
    hasSearched,
  };
}

// Backward compatibility - map labels to products structure for existing components
export function useSearchProducts(
  searchQuery: string,
  debounceDelay: number = 500,
  limit: number = 10
) {
  const { labels, isLoading, error, hasSearched } = useSearchLabels(searchQuery, debounceDelay, limit);
  
  // Map labels to the old product structure for backward compatibility
  const products = labels.map(label => ({
    id: label.id,
    name: label.name,
    code: label.code,
    category: label.synonyms || 'Department',
    inStock: label.active
  }));

  return {
    products,
    isLoading,
    error,
    hasSearched,
  };
}
