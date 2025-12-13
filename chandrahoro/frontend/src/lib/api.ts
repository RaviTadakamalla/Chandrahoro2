import { API_URL } from './constants';
import { apiCache, chartCache, userCache } from './cache';

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user?: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username?: string;
  password: string;
  full_name?: string;
}

// ============================================================================
// Chart Types
// ============================================================================

export interface BirthDetails {
  name?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  time_unknown: boolean; // Required field
  latitude: number;
  longitude: number;
  timezone: string; // IANA timezone format
  location_name: string;
}

export interface ChartPreferences {
  ayanamsha: string;
  house_system: string;
  chart_style: string;
  divisional_charts: string[];
  enable_ai: boolean;
  methodology?: string; // NEW: Support for multi-methodology
}

export interface ChartRequest {
  birth_details: BirthDetails;
  preferences?: ChartPreferences;
}

export interface PlanetPosition {
  name: string;
  tropical_longitude: number;
  sidereal_longitude: number;
  sign: string;
  degree_in_sign: number;
  nakshatra: string;
  pada: number;
  house: number;
  retrograde: boolean;
  speed: number;
}

export interface DivisionalChartPlanet {
  longitude: number;
  sign_number: number;
  degree_in_sign: number;
  nakshatra_number: number;
  pada: number;
}

export interface DivisionalChart {
  name: string;
  description: string;
  planets: Record<string, DivisionalChartPlanet>;
}

export interface DashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  mahadasha_planet?: string;
  antardasha_planet?: string;
}

export interface MahadashaData {
  mahadasha: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  status: 'past' | 'current' | 'future';
  is_birth_dasha?: boolean;
  current_antardasha?: string;
  antardashas: DashaPeriod[];
}

export interface DashaNavigatorData {
  birth_nakshatra_lord: string;
  balance_at_birth_years: number;
  current_date: string;
  navigator_data: MahadashaData[];
  calculation_timestamp: string;
}

export interface ChartData {
  birth_info: BirthDetails;
  preferences: ChartPreferences;
  ascendant: number;
  ascendant_sign: string;
  planets: PlanetPosition[];
  houses: any[];
  calculation_timestamp: string;
  ayanamsha_value: number;
  divisional_charts?: Record<string, DivisionalChart>;
  dasha_navigator?: DashaNavigatorData;
  current_dasha?: any;
  dasha_timeline?: any;
}

export interface ChartResponse {
  success: boolean;
  data?: ChartData;
  error?: string;
  message: string;
}

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  admin1: string;
  population: number;
}

export interface LocationSearchResponse {
  success: boolean;
  query: string;
  results: LocationResult[];
  count: number;
}

export interface BirthChart {
  id: string;
  user_id: string;
  name?: string;
  birth_date: string;
  birth_time?: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  birth_location: string;
  ayanamsha: string;
  house_system: string;
  chart_style: string;
  is_public: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseUrl: string;
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_info';

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  /**
   * Get stored access token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Store tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Clear tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    userCache.clear();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored user info
   */
  getUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Store user info
   */
  setUserInfo(user: UserInfo): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // ============================================================================
  // HTTP Request Handling
  // ============================================================================

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Use Next.js proxy routes for all API calls to avoid CSP violations
    const url = endpoint.startsWith('/api/') ? endpoint : `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - clear tokens and redirect to login
    if (response.status === 401) {
      this.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - please login again');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || error.detail || 'API request failed');
    }

    return response.json();
  }

  async calculateChart(request: ChartRequest): Promise<ChartResponse> {
    // Generate cache key based on request parameters
    const cacheKey = chartCache.generateChartKey('calculate', {
      birth_details: request.birth_details,
      preferences: request.preferences || {}
    });

    // Try to get from cache first
    const cached = chartCache.get<ChartResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API request
    const response = await this.request<ChartResponse>('/api/v1/chart/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Cache successful responses
    if (response.success && response.data) {
      chartCache.set(cacheKey, response, 30 * 60 * 1000); // Cache for 30 minutes
    }

    return response;
  }

  async downloadChartPDF(request: ChartRequest): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/chart/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`PDF download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async downloadChartImage(request: ChartRequest, format: 'png' | 'svg' = 'png'): Promise<Blob> {
    const endpoint = format === 'png' ? '/api/v1/chart/export/png' : '/api/v1/chart/export/svg';
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`${format.toUpperCase()} download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async searchLocations(query: string): Promise<LocationSearchResponse> {
    // Generate cache key for location search
    const cacheKey = apiCache.generateApiKey('locations/search', { query });

    // Try to get from cache first
    const cached = apiCache.get<LocationSearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API request
    const response = await this.request<LocationSearchResponse>(`/api/v1/locations/search?q=${encodeURIComponent(query)}`);

    // Cache successful responses for 1 hour
    if (response.success) {
      apiCache.set(cacheKey, response, 60 * 60 * 1000);
    }

    return response;
  }

  async getSampleChart(): Promise<ChartResponse> {
    // Cache key for sample chart
    const cacheKey = 'sample-chart';

    // Try to get from cache first
    const cached = chartCache.get<ChartResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API request
    const response = await this.request<ChartResponse>('/api/v1/chart/sample');

    // Cache successful responses for 24 hours (sample data doesn't change often)
    if (response.success && response.data) {
      chartCache.set(cacheKey, response, 24 * 60 * 60 * 1000);
    }

    return response;
  }

  async calculateIntensityAnalysis(request: ChartRequest): Promise<any> {
    // Generate cache key based on request parameters
    const cacheKey = chartCache.generateChartKey('intensity-analysis', {
      birth_details: request.birth_details,
      preferences: request.preferences || {}
    });

    // Try to get from cache first
    const cached = chartCache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API request
    const response = await this.request<any>('/api/v1/chart/intensity-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Cache successful responses
    if (response.success && response.data) {
      chartCache.set(cacheKey, response, 30 * 60 * 1000); // Cache for 30 minutes
    }

    return response;
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Store tokens
    this.setTokens(response.access_token, response.refresh_token);

    // Fetch and store user info after successful registration
    try {
      const userInfo = await this.getCurrentUser();
      this.setUserInfo(userInfo);
    } catch (error) {
      console.error('Failed to fetch user info after registration:', error);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Store tokens
    this.setTokens(response.access_token, response.refresh_token);

    // Fetch and store user info after successful login
    try {
      const userInfo = await this.getCurrentUser();
      this.setUserInfo(userInfo);
    } catch (error) {
      console.error('Failed to fetch user info after login:', error);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.request('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo> {
    // Check cache first
    const cached = userCache.get<UserInfo>('current-user');
    if (cached) {
      return cached;
    }

    const user = await this.request<UserInfo>('/api/v1/auth/me');
    userCache.set('current-user', user, 60 * 60 * 1000); // Cache for 1 hour
    this.setUserInfo(user);
    return user;
  }



  // ============================================================================
  // Chart Methods
  // ============================================================================

  async testConnection(): Promise<{ status: string; message: string }> {
    return this.request('/api/v1/chart/test');
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // ============================================================================
  // Chart Management Methods
  // ============================================================================

  /**
   * Create/save a new birth chart
   */
  async createChart(chartData: {
    name?: string;
    birth_date: string;
    birth_time?: string;
    birth_latitude: number;
    birth_longitude: number;
    birth_timezone: string;
    birth_location: string;
    ayanamsha?: string;
    house_system?: string;
    chart_style?: string;
    methodology?: string; // NEW: Support for multi-methodology
    is_public?: string;
    notes?: string;
  }): Promise<BirthChart> {
    return this.request<BirthChart>('/api/v1/charts', {
      method: 'POST',
      body: JSON.stringify(chartData),
    });
  }

  /**
   * List user's saved charts
   */
  async listCharts(skip: number = 0, limit: number = 10): Promise<BirthChart[]> {
    return this.request<BirthChart[]>(
      `/api/v1/charts?skip=${skip}&limit=${limit}`
    );
  }

  /**
   * Get chart details
   */
  async getChart(chartId: string): Promise<BirthChart> {
    return this.request<BirthChart>(`/api/v1/charts/${chartId}`);
  }

  /**
   * Delete chart
   */
  async deleteChart(chartId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/charts/${chartId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update chart
   */
  async updateChart(chartId: string, updates: Partial<BirthChart>): Promise<BirthChart> {
    return this.request<BirthChart>(`/api/v1/charts/${chartId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiClient = new ApiClient();

// React Query hooks
export const chartKeys = {
  all: ['charts'] as const,
  calculate: (request: ChartRequest) => [...chartKeys.all, 'calculate', request] as const,
};