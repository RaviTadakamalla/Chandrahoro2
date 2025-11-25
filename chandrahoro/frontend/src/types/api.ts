// API request and response types

export interface BirthDetails {
  name?: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  time_unknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  location_name: string;
}

export interface ChartPreferences {
  ayanamsha: string;
  house_system: string;
  chart_style: string;
  divisional_charts: string[];
  enable_ai: boolean;
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

export interface HousePosition {
  number: number;
  cusp_longitude: number;
  sign: string;
  degree_in_sign: number;
}

// Dasha-related interfaces
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

export interface CurrentDasha {
  mahadasha?: DashaPeriod;
  antardasha?: DashaPeriod;
  pratyantardasha?: DashaPeriod;
}

export interface ChartData {
  birth_info: BirthDetails;
  preferences: ChartPreferences;
  ascendant: number;
  ascendant_sign: string;
  planets: PlanetPosition[];
  houses: HousePosition[];
  calculation_timestamp: string;
  ayanamsha_value: number;
  dasha_navigator?: DashaNavigatorData;
  current_dasha?: CurrentDasha;
  dasha_timeline?: any; // For backward compatibility
}

export interface ChartResponse {
  success: boolean;
  data: ChartData;
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