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

// Team Dashboard types
export interface DashboardLabel {
  id: string;
  code: string;
  name: string;
  waitingCount: number;
  lastSendTimestamp: string;
}

export interface DashboardMetrics {
  activeVisitors: number;
  pendingAlerts: number;
  topLabels: DashboardLabel[];
}

export interface TeamDashboardResponse {
  success: boolean;
  metrics: DashboardMetrics;
}

// Scan API types
export interface ScanPayload {
  code: string;
  method: "scan" | "manual";
}

export interface ScanLabel {
  id: string;
  code: string;
  name: string;
  synonyms: string;
  location_id: string;
  location_name: string;
  active: boolean;
}

export interface ScanResponse {
  success: boolean;
  label: ScanLabel;
  subscribers_count: number;
  sent_count: number;
  last_sent: string;
  next_allowed: string;
}

// Send Alerts API types
export interface SendAlertsPayload {
  labelId: string;
  message: string;
}

export interface SendAlertsResponse {
  success: boolean;
  sent_count: number;
  total_subscribers: number;
  label_name: string;
  last_send_timestamp: string;
  next_allowed_send: string;
  message?: string; // For error messages
}

// Audit Log types
export interface AuditLogEntry {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  details: string;
  sent_count: number;
  label_name: string;
  full_timestamp: string;
}

export interface AuditLogResponse {
  success: boolean;
  logs: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

// Label Management types
export interface Label {
  id: string;
  code: string;
  name: string;
  synonyms: string;
  active: boolean;
  location_id: string;
  created_at?: string;
  updated_at?: string;
  sent_count?: number;
  total_sends?: number;
  subscribers_count?: number;
  hasSubscribersCount?: boolean;
  subscribersCountType?: string;
}

export interface LabelCreatePayload {
  code: string;
  name: string;
  synonyms: string;
  active: boolean;
}

export interface LabelUpdatePayload {
  id: string;
  code?: string;
  name?: string;
  synonyms?: string;
  active?: boolean;
}

export interface LabelDeletePayload {
  id: string;
}

export interface LabelResponse {
  success: boolean;
  label?: Label;
  message?: string;
}

export interface LabelsListResponse {
  success: boolean;
  labels: Label[];
  total: number;
  limit: number;
  offset: number;
}

export interface CSVUploadResponse {
  success: boolean;
  message: string;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

// Team Logs types
export interface TeamLogEntry {
  id: string;
  type: 'SMS' | 'WEBHOOK' | 'ALERT' | 'REQUEST';
  status: 'success' | 'failed' | 'invalid' | 'pending';
  message: string;
  timestamp: string;
  phone?: string;
  label_name?: string;
  error_details?: string;
}

export interface TeamLogsResponse {
  success: boolean;
  logs: TeamLogEntry[];
  total: number;
  limit: number;
  offset: number;
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
      // Only redirect to login for authenticated requests, not for login attempts
      if (error.config?.url !== '/api/team/login') {
        // Import dynamically to avoid circular dependency
        import('./auth').then(({ redirectToTeamLogin }) => {
          redirectToTeamLogin();
        });
      }
    } else if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status === 429) {
      console.warn('Rate limit exceeded - too many requests');
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
   * Fetch team dashboard metrics
   * @returns Promise with dashboard metrics data
   */
  fetchTeamDashboard: async (): Promise<TeamDashboardResponse> => {
    try {
      const response = await apiClient.get<TeamDashboardResponse>('/api/team/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching team dashboard:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Scan product by barcode or manual entry
   * @param payload - Scan payload with code and method
   * @returns Promise with scan result including product details
   */
  scanProduct: async (payload: ScanPayload): Promise<ScanResponse> => {
    try {
      const response = await apiClient.post<ScanResponse>('/api/team/scan', payload);
      return response.data;
    } catch (error) {
      console.error('Error scanning product:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
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

  /**
   * Send alerts to all subscribers for a specific label
   * @param payload - Send alerts payload with labelId and message
   * @returns Promise with send result including counts and timestamps
   */
  sendAlerts: async (payload: SendAlertsPayload): Promise<SendAlertsResponse> => {
    try {
      const response = await apiClient.post<SendAlertsResponse>('/api/team/send', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending alerts:', error);
      // For send alerts, we want to preserve the API error response structure
      // Don't transform the error, let the component handle the response
      throw error;
    }
  },

  /**
   * Fetch audit logs with pagination
   * @param limit - Number of logs to fetch (default: 50)
   * @param offset - Number of logs to skip (default: 0)
   * @returns Promise with audit log response
   */
  fetchAuditLogs: async (limit: number = 50, offset: number = 0): Promise<AuditLogResponse> => {
    try {
      const response = await apiClient.get<AuditLogResponse>(`/api/team/logs?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Fetch team logs with pagination
   * @param limit - Number of logs to fetch (default: 20)
   * @param offset - Number of logs to skip (default: 0)
   * @returns Promise with team logs response
   */
  fetchTeamLogs: async (limit: number = 20, offset: number = 0): Promise<TeamLogsResponse> => {
    try {
      const response = await apiClient.get<TeamLogsResponse>(`/api/team/logs?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team logs:', error);
      // Transform the error to include user-friendly message
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Send SMS to label subscribers
   * @param labelId - Label ID to send SMS to
   * @param message - Message content
   * @param locationId - Location ID
   * @param senderUserId - Optional sender user ID
   * @returns Promise with SMS send response
   */
  sendSmsToLabel: async (labelId: string, message: string, locationId: string, senderUserId?: string) => {
    try {
      const response = await apiClient.post('/api/sms/send-to-label', {
        labelId,
        message,
        locationId,
        senderUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SMS to label:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },


  // Label Management API functions
  /**
   * Fetch all labels with pagination
   * @param limit - Number of labels to fetch (default: 50)
   * @param offset - Number of labels to skip (default: 0)
   * @param search - Optional search query
   * @returns Promise with labels list response
   */
  fetchLabels: async (limit: number = 50, offset: number = 0, search?: string): Promise<LabelsListResponse> => {
    try {
      const params: any = { limit, offset };
      if (search) params.search = search;
      
      const response = await apiClient.get<LabelsListResponse>('/api/labels', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching labels:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Create a new label
   * @param payload - Label creation payload
   * @returns Promise with label response
   */
  createLabel: async (payload: LabelCreatePayload): Promise<LabelResponse> => {
    try {
      const response = await apiClient.post<LabelResponse>('/api/labels', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating label:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Update an existing label
   * @param payload - Label update payload
   * @returns Promise with label response
   */
  updateLabel: async (payload: LabelUpdatePayload): Promise<LabelResponse> => {
    try {
      const response = await apiClient.put<LabelResponse>(`/api/labels/${payload.id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating label:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Delete a label
   * @param payload - Label delete payload
   * @returns Promise with label response
   */
  deleteLabel: async (payload: LabelDeletePayload): Promise<LabelResponse> => {
    try {
      const response = await apiClient.delete<LabelResponse>(`/api/labels/${payload.id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting label:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Upload CSV file with labels
   * @param file - CSV file to upload
   * @returns Promise with CSV upload response
   */
  uploadLabelsCSV: async (file: File): Promise<CSVUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<CSVUploadResponse>('/api/labels/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Download labels as CSV
   * @returns Promise with CSV file blob
   */
  downloadLabelsCSV: async (): Promise<Blob> => {
    try {
      const response = await apiClient.get('/api/labels/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading CSV:', error);
      const apiError = ApiErrorHandler.getErrorDetails(error);
      throw new Error(apiError.message);
    }
  },
};

export default apiClient;
