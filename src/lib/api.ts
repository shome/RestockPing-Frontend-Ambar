import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Response types
export interface ApiLabel {
  id: string;
  location_id: string;
  code: string;
  name: string;
  synonyms: string;
  active: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface SearchLabelsResponse {
  success: boolean;
  labels: ApiLabel[];
  total: number;
}

// Request types
export interface CreateRequestPayload {
  locationId: string;
  phone: string;
  labelName?: string; // For custom products
  labelId?: string; // For existing products
  image?: File; // For custom products
}

export interface CreateRequestResponse {
  success: boolean;
  message?: string;
  requestId?: string;
}

export interface VerifyCaptchaPayload {
  captchaSessionId: string;
  captchaAnswer: number;
}

export interface VerifyCaptchaResponse {
  success: boolean;
  message?: string;
  valid?: boolean;
}

export interface FetchCaptchaResponse {
  success: boolean;
  message?: string;
  sessionId: string;
  question: string;
  num1: number;
  num2: number;
  expiresIn?: number;
}

export interface ApiLocation {
  id: string;
  name: string;
  slug: string;
  timezone: string;
}

export interface FetchLocationsResponse {
  success: boolean;
  locations: ApiLocation[];
  total: number;
}

export interface TeamLoginPayload {
  pin: string;
  location_id: string;
}

export interface TeamLoginResponse {
  success: boolean;
  session_token?: string;
  expires_in?: number;
  message?: string;
}

// Error types for better error handling
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiErrorHandler {
  static getErrorMessage(error: any): string {
    // Handle Axios errors
    if (error.response) {
      const data = error.response.data;
      
      // Use the error message from API response if available
      if (data?.message) {
        return data.message;
      }
      
      // If no message in response, use the error message from the error object
      if (error.message) {
        return error.message;
      }
      
      // Fallback for cases where neither message is available
      return 'An error occurred. Please try again.';
    }
    
    // Handle network errors
    if (error.request) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Handle other errors
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
  
  static getErrorDetails(error: any): ApiError {
    return {
      message: this.getErrorMessage(error),
      status: error.response?.status,
      code: error.code,
      details: error.response?.data
    };
  }
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
    // Add JWT token to requests if available
    const token = localStorage.getItem('team_session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.warn('Unauthorized access - redirecting to login');
      // Import dynamically to avoid circular dependency
      import('./auth').then(({ redirectToTeamLogin }) => {
        redirectToTeamLogin();
      });
    } else if (error.response?.status === 404) {
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
   * Fetch captcha from the backend
   * @returns Promise with captcha data including session ID
   */
  fetchCaptcha: async (): Promise<FetchCaptchaResponse> => {
    try {
      const response = await apiClient.get<FetchCaptchaResponse>('/api/captcha');
      return response.data;
    } catch (error) {
      console.error('Error fetching captcha:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Verify captcha with the backend
   * @param payload - Captcha verification payload
   * @returns Promise with verification result
   */
  verifyCaptcha: async (payload: VerifyCaptchaPayload): Promise<VerifyCaptchaResponse> => {
    try {
      const response = await apiClient.post<VerifyCaptchaResponse>('/api/captcha/verify', payload);
      return response.data;
    } catch (error) {
      console.error('Error verifying captcha:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Search for labels using the API
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Promise with search results
   */
  searchLabels: async (query: string, limit: number = 10): Promise<SearchLabelsResponse> => {
    try {
      const response = await apiClient.get<SearchLabelsResponse>('/api/labels', {
        params: {
          query: query.trim(),
          limit,
        },
      });
      
      // Handle different response structures
      const data = response.data;
      
      // If the API returns labels directly in an array
      if (Array.isArray(data)) {
        return {
          success: true,
          labels: data,
          total: data.length,
        };
      }
      
      // If the API returns the expected structure
      return data;
    } catch (error) {
      console.error('Error searching labels:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Fetch locations from the backend
   * @returns Promise with locations data
   */
  fetchLocations: async (): Promise<FetchLocationsResponse> => {
    try {
      const response = await apiClient.get<FetchLocationsResponse>('/api/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Team login with PIN and location
   * @param payload - Login payload with PIN and location ID
   * @returns Promise with login result including JWT token
   */
  teamLogin: async (payload: TeamLoginPayload): Promise<TeamLoginResponse> => {
    try {
      const response = await apiClient.post<TeamLoginResponse>('/api/team/login', payload);
      return response.data;
    } catch (error) {
      console.error('Error during team login:', error);
      // For team login, we want to preserve the API error response structure
      // Don't transform the error, let the component handle the response
      throw error;
    }
  },

  /**
   * Create a new request (existing or custom product)
   * @param payload - Request payload with all required data
   * @returns Promise with request creation result
   */
  createRequest: async (payload: CreateRequestPayload): Promise<CreateRequestResponse> => {
    try {
      let requestData: any;
      let headers: any = {};

      if (payload.image) {
        // Use FormData for requests with image uploads
        const formData = new FormData();
        
        // Add all required fields
        formData.append('locationId', payload.locationId);
        formData.append('phone', payload.phone);
        
        // Add optional fields based on request type
        if (payload.labelId) {
          formData.append('labelId', payload.labelId);
        }
        
        if (payload.labelName) {
          formData.append('labelName', payload.labelName);
        }
        
        formData.append('image', payload.image);

        requestData = formData;
        headers['Content-Type'] = 'multipart/form-data';

        // Debug: Log FormData contents
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
      } else {
        // Use JSON for requests without image uploads
        requestData = {
          locationId: payload.locationId,
          phone: payload.phone,
        };

        // Add optional fields based on request type
        if (payload.labelId) {
          requestData.labelId = payload.labelId;
        }
        
        if (payload.labelName) {
          requestData.labelName = payload.labelName;
        }

        headers['Content-Type'] = 'application/json';

        // Debug: Log JSON payload
        console.log('JSON payload:', requestData);
      }

      const response = await apiClient.post<CreateRequestResponse>('/api/requests', requestData, {
        headers,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating request:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },
};

export default apiClient;
