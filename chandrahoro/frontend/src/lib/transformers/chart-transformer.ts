/**
 * Chart Data Transformer
 * 
 * Converts Python backend responses to Prisma-compatible format
 * Handles snake_case → camelCase conversion and data type transformations
 */

import { PythonChartResponse } from '../api/python-client';
import { PlanetPosition, Aspect, DashaPeriod } from '@/types/chart';

/**
 * Transform Python planet data to frontend format
 */
function transformPlanetData(name: string, pythonData: any): PlanetPosition {
  return {
    name,
    longitude: pythonData.longitude,
    latitude: pythonData.latitude,
    sign: pythonData.sign,
    degree: pythonData.degree,
    house: pythonData.house,
    nakshatra: pythonData.nakshatra,
    nakshatraPada: pythonData.nakshatra_pada,
    isRetrograde: pythonData.is_retrograde,
    speed: pythonData.speed,
  };
}

/**
 * Transform Python aspect data to frontend format
 */
function transformAspectData(pythonAspect: any): Aspect {
  return {
    planet1: pythonAspect.planet1,
    planet2: pythonAspect.planet2,
    type: pythonAspect.type,
    angle: pythonAspect.angle,
    orb: pythonAspect.orb,
  };
}

/**
 * Transform Python dasha data to frontend format
 */
function transformDashaData(pythonDasha: any): DashaPeriod {
  return {
    planet: pythonDasha.planet,
    startDate: new Date(pythonDasha.start_date),
    endDate: new Date(pythonDasha.end_date),
    level: pythonDasha.level,
  };
}

/**
 * Main transformer: Python chart response → Prisma format
 */
export function transformPythonChartToPrisma(
  pythonChart: PythonChartResponse
) {
  // Transform planets (snake_case → camelCase)
  const planets = Object.entries(pythonChart.planets).reduce(
    (acc, [name, data]) => ({
      ...acc,
      [name]: transformPlanetData(name, data),
    }),
    {} as Record<string, PlanetPosition>
  );

  // Transform aspects
  const aspects = pythonChart.aspects.map(transformAspectData);

  // Transform current dasha
  const currentDasha = transformDashaData(pythonChart.current_dasha);

  // Transform dasha timeline
  const dashaTimeline = pythonChart.dasha_timeline.map(transformDashaData);

  return {
    planets,
    houses: pythonChart.houses,
    aspects,
    ascendant: pythonChart.ascendant,
    sunSign: pythonChart.sun_sign,
    moonSign: pythonChart.moon_sign,
    currentDasha,
    dashaTimeline,
  };
}

/**
 * Transform frontend birth data to Python API format
 */
export function transformBirthDataToPython(data: {
  birthDate: string | Date;
  birthTime: string;
  birthPlace?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}) {
  // Ensure birthDate is in YYYY-MM-DD format
  const birthDate = typeof data.birthDate === 'string' 
    ? data.birthDate 
    : data.birthDate.toISOString().split('T')[0];

  return {
    birth_date: birthDate,
    birth_time: data.birthTime,
    birth_place: data.birthPlace || '',
    latitude: parseFloat(data.latitude.toString()),
    longitude: parseFloat(data.longitude.toString()),
    timezone: data.timezone || 'UTC',
  };
}

/**
 * Validate Python chart response structure
 */
export function validatePythonChartResponse(response: any): response is PythonChartResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Check required fields
  const requiredFields = [
    'planets',
    'houses',
    'aspects',
    'ascendant',
    'sun_sign',
    'moon_sign',
    'current_dasha',
    'dasha_timeline'
  ];

  for (const field of requiredFields) {
    if (!(field in response)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate planets structure
  if (!response.planets || typeof response.planets !== 'object') {
    console.error('Invalid planets data structure');
    return false;
  }

  // Validate houses array
  if (!Array.isArray(response.houses) || response.houses.length !== 12) {
    console.error('Invalid houses data - should be array of 12 numbers');
    return false;
  }

  // Validate aspects array
  if (!Array.isArray(response.aspects)) {
    console.error('Invalid aspects data - should be array');
    return false;
  }

  // Validate current dasha
  if (!response.current_dasha || typeof response.current_dasha !== 'object') {
    console.error('Invalid current_dasha data structure');
    return false;
  }

  // Validate dasha timeline
  if (!Array.isArray(response.dasha_timeline)) {
    console.error('Invalid dasha_timeline data - should be array');
    return false;
  }

  return true;
}

/**
 * Create error response for failed chart calculations
 */
export function createChartErrorResponse(error: Error) {
  return {
    error: true,
    message: error.message,
    code: 'CHART_CALCULATION_FAILED',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Transform Python error response to frontend format
 */
export function transformPythonError(error: any) {
  if (error.detail) {
    return {
      message: error.detail,
      code: error.code || 'PYTHON_BACKEND_ERROR',
    };
  }

  return {
    message: error.message || 'Unknown backend error',
    code: 'BACKEND_ERROR',
  };
}
