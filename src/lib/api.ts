import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Response types
export interface ApiProduct {
  id: string;
  name: string;
  code: string;
  category: string;
  inStock: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface SearchProductsResponse {
  products: ApiProduct[];
  total: number;
  hasMore: boolean;
}

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Log the API base URL being used (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and adding auth headers if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or other headers here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  /**
   * Search for products using the API
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Promise with search results
   */
  searchProducts: async (query: string, limit: number = 10): Promise<SearchProductsResponse> => {
    try {
      const response = await apiClient.get<SearchProductsResponse>('/api/labels', {
        params: {
          query: query.trim(),
          limit,
        },
      });
      
      // Handle different response structures
      const data = response.data;
      
      // If the API returns products directly in an array
      if (Array.isArray(data)) {
        return {
          products: data,
          total: data.length,
          hasMore: data.length >= limit,
        };
      }
      
      // If the API returns the expected structure
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};

export default apiClient;
