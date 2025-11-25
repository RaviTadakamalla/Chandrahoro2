/**
 * Chart Visualization Types
 *
 * TypeScript interfaces for all chart components including
 * NatalChart, StrengthMeter, DashaTimeline, CompatibilityGauge, and AspectRadarChart
 */

// ============================================================================
// Core Chart Data Types
// ============================================================================

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  strength?: number; // Shadbala strength (0-100)
}

export interface HousePosition {
  number: number;
  cusp: number; // House cusp in degrees
  sign: string;
  planets: string[];
}

export interface DashaPeriod {
  planet: string;
  startDate: Date | string;
  endDate: Date | string;
  duration: number; // in years
  isCurrent?: boolean;
  subPeriods?: DashaPeriod[];
}

export interface BirthChartData {
  id: string;
  userId: string;
  birthDate: Date | string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;

  // Chart calculations
  planets: PlanetPosition[];
  houses: HousePosition[];
  ascendant: string;
  sunSign: string;
  moonSign: string;

  // Dasha system
  currentDasha: {
    planet: string;
    startDate: Date | string;
    endDate: Date | string;
    subPeriod?: string;
  };
  dashaTimeline: DashaPeriod[];

  // Strength analysis
  planetaryStrengths?: Record<string, number>;

  // Compatibility (for CompatibilityGauge)
  compatibilityScore?: number;

  // Aspect analysis (for AspectRadarChart)
  lifeAspects?: {
    work: number;
    love: number;
    health: number;
    finance: number;
    family: number;
    spiritual: number;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface NatalChartProps {
  chartData: BirthChartData;
  style?: 'north_indian' | 'south_indian';
  size?: number;
  interactive?: boolean;
  onPlanetClick?: (planet: PlanetPosition) => void;
  className?: string;
}

export interface StrengthMeterProps {
  planetName: string;
  strength: number; // 0-100
  breakdown?: {
    sthana: number;
    dig: number;
    kala: number;
    chesta: number;
    naisargika: number;
    drik: number;
  };
  showTooltip?: boolean;
  className?: string;
}

export interface DashaTimelineProps {
  dashaData: DashaPeriod[];
  currentDate?: Date | string;
  onPeriodClick?: (period: DashaPeriod) => void;
  showSubPeriods?: boolean;
  className?: string;
}

export interface CompatibilityGaugeProps {
  score: number; // 0-10
  title?: string;
  subtitle?: string;
  animated?: boolean;
  size?: number;
  className?: string;
}

export interface AspectRadarChartProps {
  data: {
    work: number;
    love: number;
    health: number;
    finance: number;
    family: number;
    spiritual: number;
  };
  maxValue?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PlanetSymbols {
  [key: string]: string;
}

export interface PlanetColors {
  [key: string]: string;
}

export interface ChartStyle {
  type: 'north_indian' | 'south_indian';
  houseLayout: HouseLayout[];
}

export interface HouseLayout {
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TooltipData {
  planet?: PlanetPosition;
  house?: HousePosition;
  strength?: {
    total: number;
    breakdown: Record<string, number>;
  };
}

// ============================================================================
// Constants
// ============================================================================

export const PLANET_SYMBOLS: PlanetSymbols = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋'
};

export const PLANET_COLORS: PlanetColors = {
  Sun: '#f59e0b',      // Amber - neutral
  Moon: '#3b82f6',     // Blue - benefic
  Mercury: '#10b981',  // Green - neutral
  Venus: '#3b82f6',    // Blue - benefic
  Mars: '#ef4444',     // Red - malefic
  Jupiter: '#3b82f6',  // Blue - benefic
  Saturn: '#ef4444',   // Red - malefic
  Rahu: '#8b5cf6',     // Purple - malefic
  Ketu: '#8b5cf6'      // Purple - malefic
};

export const BENEFIC_PLANETS = ['Moon', 'Mercury', 'Venus', 'Jupiter'];
export const MALEFIC_PLANETS = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
export const NEUTRAL_PLANETS = ['Sun'];

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const DASHA_ORDER = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

// ============================================================================
// Utility Functions Types
// ============================================================================

export type PlanetClassifier = (planetName: string) => 'benefic' | 'malefic' | 'neutral';
export type StrengthCalculator = (strength: number) => {
  percentage: number;
  grade: 'excellent' | 'very_good' | 'good' | 'average' | 'weak' | 'very_weak';
  color: string;
};
export type DegreeFormatter = (degree: number) => string;
export type DateFormatter = (date: Date | string) => string;