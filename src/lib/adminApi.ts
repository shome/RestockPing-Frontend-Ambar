import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Admin API Response types
export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  expires_in?: number;
  message?: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  labels: Array<{
    id: string;
    code: string;
    name: string;
    subscribers_count: number;
    total_sends: number;
    last_sent: string;
  }>;
  total_labels: number;
  total_subscribers: number;
  total_sends: number;
  message?: string;
}

export interface AdminAnalyticsResponse {
  success: boolean;
  period: 'daily' | 'weekly';
  date_range: {
    start: string;
    end: string;
  };
  analytics: {
    labels: {
      total_active: number;
      new_this_period: number;
      activity_count: number;
    };
    opt_ins: {
      total: number;
      new_this_period: number;
      growth_rate: number;
    };
    sends: {
      total: number;
      this_period: number;
      success_rate: number;
    };
    requests: {
      total: number;
      this_period: number;
      mapped_rate: number;
    };
  };
  daily_breakdown: Array<{
    date: string;
    labels_activity: number;
    opt_ins: number;
    sends: number;
    requests: number;
  }>;
  message?: string;
}

export interface AdminMetricsResponse {
  success: boolean;
  timestamp: string;
  performance: {
    api_response_times: {
      search_avg_ms: number;
      send_avg_ms: number;
      admin_avg_ms: number;
    };
    database_performance: {
      query_count: number;
      avg_query_time_ms: number;
      slow_queries: number;
    };
    memory_usage: {
      used_mb: number;
      total_mb: number;
      percentage: number;
    };
    uptime: {
      seconds: number;
      formatted: string;
    };
  };
  load_metrics: {
    requests_per_minute: number;
    concurrent_connections: number;
    error_rate_percentage: number;
  };
  sla_status: {
    search_api: string;
    send_api: string;
    admin_dashboard: string;
    uptime: string;
  };
  services: {
    database: {
      status: string;
      response_time_ms: number;
      error: string | null;
    };
    sms_provider: {
      status: string;
      configured: boolean;
      error: string | null;
    };
    api: {
      status: string;
      uptime_seconds: number;
    };
  };
  overall_health: number;
  message?: string;
}

export interface AdminLabel {
  id: string;
  code: string;
  name: string;
  synonyms: string;
  active: boolean;
  location_id: string;
  location_name: string;
  subscribers_count: number;
  total_sends: number;
  last_sent: string;
}

export interface AdminLabelsResponse {
  success: boolean;
  labels: AdminLabel[];
  total: number;
  query?: string;
  limit: number;
  offset: number;
  response_time_ms: number;
}

export interface AdminLabelUpdatePayload {
  name?: string;
  synonyms?: string;
  category?: string;
  active?: boolean;
}

export interface AdminLabelUpdateResponse {
  success: boolean;
  label: AdminLabel;
  statistics: {
    subscribers_count: number;
    total_sends: number;
    last_sent: string;
  };
  message?: string;
}

export interface AdminCSVImportResponse {
  success: boolean;
  imported: number;
  updated: number;
  errors: number;
  total_processed: number;
  message?: string;
}

export interface AdminLogEntry {
  id: string;
  label_name: string;
  sent_at: string;
  count_sent: number;
  sender: string;
  location_name: string;
  phone?: string;  // Masked phone number
  sms_status?: 'success' | 'failed' | 'pending';
  sms_error?: string;
}

export interface AdminRequestEntry {
  id: string;
  text: string;
  image_url: string;
  created_at: string;
  status: string;
  location_name: string;
  matched_label_name: string | null;
  is_cant_find?: boolean;
  phone?: string;  // Masked phone number
  webhook_source?: string;  // e.g., 'Twilio'
  webhook_valid?: boolean;
  webhook_error?: string;
}

export interface AdminLabelEntry {
  id: string;
  code: string;
  name: string;
  synonyms: string;
  active: boolean;
  location_id: string;
  location_name: string;
  subscribers_count: number;
  total_sends: number;
  last_sent: string;
}

export interface AdminLogsResponse {
  success: boolean;
  logs: {
    sends: AdminLogEntry[];
    requests: AdminRequestEntry[];
  };
  total_sends: number;
  total_requests: number;
  message?: string;
}

export interface AdminAlertsResponse {
  success: boolean;
  alerts: AdminLogEntry[];
  total_alerts: number;
  message?: string;
}

export interface AdminRequestsResponse {
  success: boolean;
  requests: AdminRequestEntry[];
  total_requests: number;
  cant_find_count: number;
  message?: string;
}

export interface AdminRequestMapPayload {
  labelId: string;
}

export interface AdminRequestMapResponse {
  success: boolean;
  request: AdminRequestEntry;
  message?: string;
}

export interface AdminTeamPinCreatePayload {
  pin: string;  // Required 4-digit string
  locationId: string;  // UUID
  expireAt: string;  // ISO date string
}

export interface AdminTeamPinUpdatePayload {
  id: string;  // PIN ID
  pin?: string;  // Optional 4-digit string
  expireAt?: string;  // Optional ISO date string
  status?: 'active' | 'disabled';  // Optional status
}

export interface AdminTeamPinResponse {
  success: boolean;
  pin_id: string;
  pin: string;
  expire_at: string;
  message?: string;
}

export interface AdminStaffPinPayload {
  action: 'create' | 'disable' | 'rotate';
  pin: string;
  locationId?: string;
  expireAt?: string;
}

export interface AdminStaffPinResponse {
  success: boolean;
  pin_id: string;
  pin: string;
  active_pins: number;
  message?: string;
}

export interface AdminPinEntry {
  id: string;
  pin: string;
  location_name: string;
  location_id?: string;  // Add location_id for API calls
  expire_at: string;
  active: boolean;
  created_at: string;
  type: 'team' | 'staff';
  status?: 'active' | 'disabled';
}

export interface AdminPinsResponse {
  success: boolean;
  pins: AdminPinEntry[];
  total: number;
  message?: string;
}

export interface AdminLocationsResponse {
  success: boolean;
  locations: Array<{
    id: string;
    name: string;
  }>;
  message?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  status: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      response_time_ms: number;
      error: string | null;
    };
    sms_provider: {
      status: string;
      configured: boolean;
      error: string | null;
    };
    api: {
      status: string;
      uptime_seconds: number;
    };
  };
  overall_health: number;
}

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance for admin API
const adminApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding admin auth headers
adminApiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to requests if available
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Admin request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Admin API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('Admin API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('Admin unauthorized access - redirecting to login');
      // Redirect to admin login
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

// Admin API service functions
export const adminApiService = {
  /**
   * Admin login
   */
  login: async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
    try {
      const response = await adminApiClient.post<AdminLoginResponse>('/api/admin/login', payload);
      return response.data;
    } catch (error) {
      console.error('Error during admin login:', error);
      throw error;
    }
  },

  /**
   * Get admin dashboard data
   */
  getDashboard: async (): Promise<AdminDashboardResponse> => {
    try {
      const response = await adminApiClient.get<AdminDashboardResponse>('/api/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  },

  /**
   * Get admin analytics
   */
  getAnalytics: async (period: 'daily' | 'weekly' = 'daily'): Promise<AdminAnalyticsResponse> => {
    try {
      const response = await adminApiClient.get<AdminAnalyticsResponse>(`/api/admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      throw error;
    }
  },

  /**
   * Get admin metrics
   */
  getMetrics: async (): Promise<AdminMetricsResponse> => {
    try {
      const response = await adminApiClient.get<AdminMetricsResponse>('/api/admin/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      throw error;
    }
  },

  /**
   * Get admin labels with search
   */
  getLabels: async (query?: string, limit: number = 10, offset: number = 0): Promise<AdminLabelsResponse> => {
    try {
      const params: any = { limit, offset };
      if (query) params.query = query;
      
      const response = await adminApiClient.get<AdminLabelsResponse>('/api/admin/labels', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin labels:', error);
      throw error;
    }
  },

  /**
   * Update admin label
   */
  updateLabel: async (id: string, payload: AdminLabelUpdatePayload): Promise<AdminLabelUpdateResponse> => {
    try {
      const response = await adminApiClient.patch<AdminLabelUpdateResponse>(`/api/admin/labels/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating admin label:', error);
      throw error;
    }
  },

  /**
   * Import labels CSV
   */
  importLabelsCSV: async (file: File, locationId: string): Promise<AdminCSVImportResponse> => {
    try {
      const formData = new FormData();
      formData.append('csv', file);
      formData.append('location_id', locationId);
      
      const response = await adminApiClient.post<AdminCSVImportResponse>('/api/admin/labels/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing labels CSV:', error);
      throw error;
    }
  },

  /**
   * Export labels CSV
   */
  exportLabelsCSV: async (): Promise<Blob> => {
    try {
      const response = await adminApiClient.get('/api/admin/labels/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting labels CSV:', error);
      throw error;
    }
  },

  /**
   * Get admin logs
   */
  getLogs: async (type: 'all' | 'sends' | 'requests' = 'all', limit: number = 50, offset: number = 0): Promise<AdminLogsResponse> => {
    try {
      const response = await adminApiClient.get<AdminLogsResponse>(`/api/admin/logs?type=${type}&limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw error;
    }
  },

  /**
   * Get admin alerts
   */
  getAlerts: async (limit: number = 50, offset: number = 0): Promise<AdminAlertsResponse> => {
    try {
      const response = await adminApiClient.get<AdminAlertsResponse>(`/api/admin/alerts?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin alerts:', error);
      throw error;
    }
  },

  /**
   * Get admin requests
   */
  getRequests: async (limit: number = 50, offset: number = 0): Promise<AdminRequestsResponse> => {
    try {
      const response = await adminApiClient.get<AdminRequestsResponse>(`/api/admin/requests?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      throw error;
    }
  },

  /**
   * Map request to label
   */
  mapRequest: async (requestId: string, payload: AdminRequestMapPayload): Promise<AdminRequestMapResponse> => {
    try {
      const response = await adminApiClient.patch<AdminRequestMapResponse>(`/api/admin/requests/${requestId}/map`, payload);
      return response.data;
    } catch (error) {
      console.error('Error mapping request:', error);
      throw error;
    }
  },

  /**
   * Create team PIN
   * @param locationId - UUID of the location
   * @param pin - PIN code to create
   * @param expireAt - Optional expiration date in ISO format
   */
  createTeamPin: async (locationId: string, pin: string, expireAt?: string): Promise<AdminTeamPinResponse> => {
    try {
      const response = await adminApiClient.post<AdminTeamPinResponse>(
        '/api/admin/team-pins',
        {
          action: "create",
          locationId,
          pin,
          expireAt
        }
      );

      console.log('✅ Team PIN created:', response.data);
      return response.data;
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('❌ Error creating team PIN:', errorMessage);
      throw new Error('Failed to create PIN: ' + errorMessage);
    }
  },

  /**
   * Disable team PIN
   * @param pinId - ID of the PIN to disable
   */
  disableTeamPin: async (pinId: string): Promise<AdminTeamPinResponse> => {
    try {
      const response = await adminApiClient.post<AdminTeamPinResponse>(
        '/api/admin/pins',
        {
          action: 'disable',
          pinId,
        }
      );

      console.log('✅ Team PIN disabled:', response.data);
      return response.data;
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('❌ Error disabling team PIN:', errorMessage);
      throw new Error('Failed to disable PIN: ' + errorMessage);
    }
  },

  /**
   * Delete team PIN
   * @param pinId - ID of the PIN to delete
   */
  deleteTeamPin: async (pinId: string): Promise<AdminTeamPinResponse> => {
    try {
      const response = await adminApiClient.post<AdminTeamPinResponse>(
        '/api/admin/pins',
        {
          action: 'delete',
          pinId,
        }
      );

      console.log('✅ Team PIN deleted:', response.data);
      return response.data;
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('❌ Error deleting team PIN:', errorMessage);
      throw new Error('Failed to delete PIN: ' + errorMessage);
    }
  },

  /**
   * Manage staff PINs
   */
  manageStaffPin: async (payload: AdminStaffPinPayload): Promise<AdminStaffPinResponse> => {
    try {
      const response = await adminApiClient.post<AdminStaffPinResponse>('/api/admin/pins', payload);
      return response.data;
    } catch (error) {
      console.error('Error managing staff PIN:', error);
      throw error;
    }
  },

  /**
   * Get admin pins
   */
  getPins: async (type?: 'team' | 'staff', limit: number = 50, offset: number = 0): Promise<AdminPinsResponse> => {
    try {
      const params: any = { limit, offset };
      if (type) params.type = type;
      
      const response = await adminApiClient.get<AdminPinsResponse>('/api/admin/pins', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin pins:', error);
      throw error;
    }
  },

  /**
   * Get admin locations
   */
  getLocations: async (): Promise<AdminLocationsResponse> => {
    try {
      const response = await adminApiClient.get<AdminLocationsResponse>('/api/admin/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin locations:', error);
      throw error;
    }
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<HealthCheckResponse> => {
    try {
      const response = await adminApiClient.get<HealthCheckResponse>('/api/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },
};

export default adminApiClient;
