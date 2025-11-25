/**
 * TypeScript Type Definitions for ChandraHoro V2.1
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the application, including API responses, component props, and data models.
 * 
 * @author ChandraHoro Development Team
 * @version 2.1.0
 */

// ============================================================================
// Base Application Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'support' | 'analyst' | 'user';
  aiTier: 'free' | 'basic' | 'premium' | 'enterprise';
  aiQuota: {
    requestsPerDay: number;
    tokensPerDay: number;
    usedRequests: number;
    usedTokens: number;
    resetDate: string;
  };
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: 'en' | 'te';
  timezone: string;
  ayanamsa: string;
  houseSystem: string;
  chartStyle: string;
  defaultCharts: string[];
  notifications: {
    dailyReadings: boolean;
    weeklyReadings: boolean;
    transits: boolean;
    email: boolean;
    push: boolean;
  };
}

export interface BirthDetails {
  name: string;
  dateOfBirth: string; // ISO date string
  timeOfBirth: string; // HH:MM format
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa?: string;
  houseSystem?: string;
}

// ============================================================================
// Chart and Astrological Data Types
// ============================================================================

export interface ChartData {
  id: string;
  userId: string;
  birthDetails: BirthDetails;
  chartType: string; // D1, D9, D10, etc.
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  yogas: Yoga[];
  metadata: ChartMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ChartMetadata {
  ayanamsa: string;
  houseSystem: string;
  chartStyle: string;
  calculationEngine: string;
  version: string;
}

export interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  house: number;
  sign: string;
  signLord: string;
  nakshatra: string;
  nakshatraPada: number;
  isRetrograde: boolean;
  strength: PlanetStrength;
  dignity: 'exalted' | 'own' | 'friend' | 'neutral' | 'enemy' | 'debilitated';
}

export interface PlanetStrength {
  shadbala: number;
  ashtakavarga: number;
  vimsopaka: number;
  overall: number; // 0-100 scale
}

export interface House {
  number: number;
  sign: string;
  lord: string;
  cusp: number;
  planets: string[];
  strength: number;
  aspects: string[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
  strength: number;
  isApplying: boolean;
}

export interface Yoga {
  name: string;
  type: 'raj' | 'dhana' | 'spiritual' | 'malefic' | 'other';
  description: string;
  planets: string[];
  houses: number[];
  strength: number;
  isActive: boolean;
}

// ============================================================================
// Dasha System Types
// ============================================================================

export interface DashaData {
  planet: string;
  startDate: string;
  endDate: string;
  duration: number; // in years
  level: 'mahadasha' | 'antardasha' | 'pratyantardasha' | 'sookshma' | 'prana';
  subPeriods?: DashaData[];
  isActive: boolean;
  intensity: DashaIntensity;
}

export interface DashaIntensity {
  overall: number; // 0-100 scale
  benefic: number;
  malefic: number;
  factors: {
    planetStrength: number;
    housePosition: number;
    aspects: number;
    yogas: number;
    transits: number;
  };
}

// ============================================================================
// Transit and Prediction Types
// ============================================================================

export interface TransitData {
  planet: string;
  currentSign: string;
  currentHouse: number;
  currentNakshatra: string;
  nextTransit: {
    sign: string;
    date: string;
    significance: string;
  };
  aspects: TransitAspect[];
  intensity: number;
}

export interface TransitAspect {
  natalPlanet: string;
  aspectType: string;
  orb: number;
  isExact: boolean;
  significance: string;
}

// ============================================================================
// AI and Reading Types
// ============================================================================

export interface AIReading {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'chart_analysis' | 'question' | 'transit';
  content: string;
  metadata: AIReadingMetadata;
  createdAt: string;
  expiresAt?: string;
}

export interface AIReadingMetadata {
  model: string;
  tokensUsed: number;
  confidence: number;
  sources: string[];
  chartId?: string;
  transitDate?: string;
  question?: string;
}

export interface AIEntitlement {
  userId: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  quotas: {
    requestsPerDay: number;
    tokensPerDay: number;
    modelsAllowed: string[];
  };
  usage: {
    requestsUsed: number;
    tokensUsed: number;
    lastReset: string;
  };
  customConfig?: {
    apiKeys: {
      anthropic?: string;
      openai?: string;
      google?: string;
    };
    preferences: {
      defaultModel: string;
      temperature: number;
      maxTokens: number;
    };
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ChartComponentProps {
  chartData: ChartData;
  style?: 'north' | 'south';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  showPlanets?: boolean;
  showHouses?: boolean;
  showAspects?: boolean;
  onPlanetClick?: (planet: Planet) => void;
  onHouseClick?: (house: House) => void;
}

export interface DashaTimelineProps {
  dashaData: DashaData[];
  currentDate?: Date;
  showSubPeriods?: boolean;
  interactive?: boolean;
  onPeriodClick?: (period: DashaData) => void;
}

// ============================================================================
// Form and Validation Types
// ============================================================================

export interface BirthDetailsForm {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface LocationSearchResult {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type ChartType = 'D1' | 'D9' | 'D10' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';
export type PlanetName = 'SUN' | 'MOON' | 'MARS' | 'MERCURY' | 'JUPITER' | 'VENUS' | 'SATURN' | 'RAHU' | 'KETU';
export type ZodiacSign = 'ARIES' | 'TAURUS' | 'GEMINI' | 'CANCER' | 'LEO' | 'VIRGO' | 'LIBRA' | 'SCORPIO' | 'SAGITTARIUS' | 'CAPRICORN' | 'AQUARIUS' | 'PISCES';
export type UserRole = 'owner' | 'admin' | 'support' | 'analyst' | 'user';
export type AITier = 'free' | 'basic' | 'premium' | 'enterprise';

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
