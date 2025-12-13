/**
 * Python FastAPI Backend Client
 * 
 * Handles communication with the Python backend for:
 * - Birth chart calculations using Swiss Ephemeris
 * - Transit data
 * - Compatibility calculations
 * - Real astronomical data
 */

const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
const API_KEY = process.env.PYTHON_API_KEY;

interface CalculateChartRequest {
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM:SS
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface PythonPlanetData {
  longitude: number;
  latitude: number;
  sign: string;
  degree: number;
  house: number;
  nakshatra: string;
  nakshatra_pada: number;
  is_retrograde: boolean;
  speed: number;
}

interface PythonAspectData {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
}

interface PythonDashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  level: string;
}

export interface PythonChartResponse {
  planets: Record<string, PythonPlanetData>;
  houses: number[]; // 12 house cusps
  aspects: PythonAspectData[];
  ascendant: string;
  sun_sign: string;
  moon_sign: string;
  current_dasha: PythonDashaPeriod;
  dasha_timeline: PythonDashaPeriod[];
}

interface PythonTransitResponse {
  date: string;
  planets: Record<string, PythonPlanetData>;
  significant_transits: Array<{
    planet: string;
    event: string;
    description: string;
    date: string;
  }>;
}

interface PythonCompatibilityResponse {
  score: number; // 0-10
  kuta_points: number; // 0-36
  strengths: string[];
  challenges: string[];
  detailed_analysis: {
    varna: { points: number; description: string };
    vashya: { points: number; description: string };
    tara: { points: number; description: string };
    yoni: { points: number; description: string };
    graha_maitri: { points: number; description: string };
    gana: { points: number; description: string };
    bhakoot: { points: number; description: string };
    nadi: { points: number; description: string };
  };
}

export class PythonAPIClient {
  private baseURL: string;
  private apiKey?: string;
  
  constructor() {
    this.baseURL = BACKEND_URL;
    this.apiKey = API_KEY;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      ...options.headers,
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: 30000, // 30 second timeout
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail || `Backend request failed: ${response.status} ${response.statusText}`
        );
      }
      
      return response.json();
    } catch (error: any) {
      console.error('Python API Error:', error);
      
      // Retry logic for network errors (but not for 4xx/5xx errors)
      if (error.name === 'TypeError' && error.message.includes('fetch') && !options.signal) {
        console.log('Network error detected, retrying request in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.request<T>(endpoint, { ...options, signal: undefined });
      }
      
      throw error;
    }
  }
  
  /**
   * Calculate birth chart using Swiss Ephemeris
   */
  async calculateChart(
    data: CalculateChartRequest
  ): Promise<PythonChartResponse> {
    console.log('Calling Python backend for chart calculation:', data);
    
    return this.request<PythonChartResponse>('/api/v1/chart/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  /**
   * Get current planetary transits
   */
  async getTransits(date?: string): Promise<PythonTransitResponse> {
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    return this.request<PythonTransitResponse>(`/api/v1/transits?date=${queryDate}`);
  }
  
  /**
   * Calculate compatibility between two charts
   */
  async calculateCompatibility(
    chart1: CalculateChartRequest,
    chart2: CalculateChartRequest
  ): Promise<PythonCompatibilityResponse> {
    return this.request<PythonCompatibilityResponse>('/api/v1/compatibility', {
      method: 'POST',
      body: JSON.stringify({ chart1, chart2 }),
    });
  }
  
  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; version?: string }> {
    return this.request<{ status: string; version?: string }>('/health');
  }
  
  /**
   * Get available ayanamsha systems
   */
  async getAyanamshas(): Promise<string[]> {
    return this.request<string[]>('/api/v1/ayanamshas');
  }
  
  /**
   * Get available house systems
   */
  async getHouseSystems(): Promise<string[]> {
    return this.request<string[]>('/api/v1/house-systems');
  }
}

// Singleton instance
export const pythonAPI = new PythonAPIClient();

// Helper function to validate backend connection
export async function validateBackendConnection(): Promise<boolean> {
  try {
    await pythonAPI.healthCheck();
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
}
