/**
 * ChandraHoro V2.1 - Transit Detector Service
 * 
 * Detects significant planetary transits by analyzing current planetary positions
 * against natal chart data and predefined significance criteria.
 * 
 * Features:
 * - Integration with Python backend for current transits
 * - Natal chart comparison from MySQL
 * - Configurable significance thresholds
 * - Multiple transit types (conjunctions, returns, aspects)
 * - Orb-based detection with varying sensitivity
 */

import { pythonAPI } from '@/lib/api/python-client';
import { prisma } from '@/lib/prisma';

export interface TransitAlert {
  type: 'conjunction' | 'transit_to_natal' | 'return' | 'aspect';
  planets?: string[];
  transitPlanet?: string;
  natalPlanet?: string;
  angle: number;
  significance: 'low' | 'medium' | 'high' | 'critical';
  orb: number;
  aspectType?: 'opposition' | 'square' | 'trine' | 'sextile';
  description: string;
  duration?: string;
}

export interface TransitDetectionOptions {
  includeMinorAspects?: boolean;
  customOrbs?: Record<string, number>;
  significanceFilter?: 'low' | 'medium' | 'high';
  planetFilter?: string[];
}

// Significance criteria for different transit types
const SIGNIFICANT_TRANSITS = [
  // Major planetary conjunctions
  { planets: ['Jupiter', 'Saturn'], type: 'conjunction', orb: 3, significance: 'critical' },
  { planets: ['Jupiter', 'Rahu'], type: 'conjunction', orb: 2, significance: 'high' },
  { planets: ['Saturn', 'Rahu'], type: 'conjunction', orb: 2, significance: 'high' },
  { planets: ['Mars', 'Saturn'], type: 'conjunction', orb: 2, significance: 'medium' },
  
  // Returns (transiting planet to natal position)
  { planets: ['Saturn', 'natal_Saturn'], type: 'return', orb: 2, significance: 'critical' },
  { planets: ['Jupiter', 'natal_Jupiter'], type: 'return', orb: 2, significance: 'high' },
  { planets: ['Sun', 'natal_Sun'], type: 'return', orb: 1, significance: 'medium' },
  
  // Major aspects to natal planets
  { planets: ['Saturn', 'natal_Sun'], type: 'aspect', orb: 2, significance: 'high' },
  { planets: ['Jupiter', 'natal_Sun'], type: 'aspect', orb: 2, significance: 'medium' },
  { planets: ['Rahu', 'natal_Moon'], type: 'aspect', orb: 2, significance: 'high' },
];

// Standard orbs for different aspects
const ASPECT_ORBS = {
  conjunction: 3,
  opposition: 3,
  square: 2,
  trine: 2,
  sextile: 2,
};

// Major aspects in degrees
const MAJOR_ASPECTS = {
  conjunction: 0,
  opposition: 180,
  square: 90,
  trine: 120,
  sextile: 60,
};

/**
 * Detect significant transits for a user on a specific date
 */
export async function detectSignificantTransits(
  userId: string,
  date: string,
  options: TransitDetectionOptions = {}
): Promise<TransitAlert[]> {
  try {
    const {
      includeMinorAspects = false,
      customOrbs = {},
      significanceFilter = 'low',
      planetFilter,
    } = options;
    
    // Get current transits from Python backend
    const transits = await pythonAPI.getTransits(date);
    if (!transits || !transits.planets) {
      console.warn('[TransitDetector] No transit data received from Python backend');
      return [];
    }
    
    // Get user's natal chart
    const chart = await prisma.birthChart.findFirst({
      where: { userId, isPrimary: true },
      select: {
        planets: true,
        houses: true,
        ascendant: true,
      },
    });
    
    if (!chart || !chart.planets) {
      console.warn('[TransitDetector] No natal chart found for user:', userId);
      return [];
    }
    
    const alerts: TransitAlert[] = [];
    const natalPlanets = chart.planets as any;
    
    // Filter planets if specified
    const planetsToCheck = planetFilter || Object.keys(transits.planets);
    
    // 1. Check conjunctions between transiting planets
    const transitingPlanets = ['Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Mars', 'Sun', 'Moon'];
    
    for (let i = 0; i < transitingPlanets.length; i++) {
      for (let j = i + 1; j < transitingPlanets.length; j++) {
        const planet1 = transitingPlanets[i];
        const planet2 = transitingPlanets[j];
        
        if (!planetsToCheck.includes(planet1) || !planetsToCheck.includes(planet2)) continue;
        
        const pos1 = transits.planets[planet1];
        const pos2 = transits.planets[planet2];
        
        if (!pos1 || !pos2) continue;
        
        const angle = calculateAngle(pos1.degree, pos2.degree);
        const orb = customOrbs[`${planet1}_${planet2}`] || getDefaultOrb(planet1, planet2);
        
        if (angle <= orb) {
          const significance = getConjunctionSignificance(planet1, planet2, angle);
          
          if (meetsSignificanceFilter(significance, significanceFilter)) {
            alerts.push({
              type: 'conjunction',
              planets: [planet1, planet2],
              angle,
              significance,
              orb,
              description: `${planet1} conjunct ${planet2}`,
              duration: estimateConjunctionDuration(planet1, planet2),
            });
          }
        }
      }
    }
    
    // 2. Check transits to natal planets
    for (const transitPlanet of ['Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Mars']) {
      if (!planetsToCheck.includes(transitPlanet)) continue;
      
      const transitPos = transits.planets[transitPlanet];
      if (!transitPos) continue;
      
      for (const natalPlanet of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
        const natalPos = natalPlanets[natalPlanet];
        if (!natalPos || typeof natalPos.degree !== 'number') continue;
        
        const angle = calculateAngle(transitPos.degree, natalPos.degree);
        
        // Check for major aspects
        for (const [aspectName, aspectDegree] of Object.entries(MAJOR_ASPECTS)) {
          const aspectAngle = Math.abs(angle - aspectDegree);
          const orb = customOrbs[`${transitPlanet}_${natalPlanet}_${aspectName}`] || 
                     ASPECT_ORBS[aspectName as keyof typeof ASPECT_ORBS];
          
          if (aspectAngle <= orb) {
            const significance = getTransitSignificance(transitPlanet, natalPlanet, aspectName);
            
            if (meetsSignificanceFilter(significance, significanceFilter)) {
              const isReturn = transitPlanet === natalPlanet && aspectName === 'conjunction';
              
              alerts.push({
                type: isReturn ? 'return' : (aspectName === 'conjunction' ? 'transit_to_natal' : 'aspect'),
                transitPlanet,
                natalPlanet,
                angle: aspectAngle,
                significance,
                orb,
                aspectType: aspectName !== 'conjunction' ? aspectName as any : undefined,
                description: isReturn 
                  ? `${transitPlanet} Return`
                  : `${transitPlanet} ${aspectName} natal ${natalPlanet}`,
                duration: estimateTransitDuration(transitPlanet),
              });
            }
          }
        }
      }
    }
    
    // 3. Check transits to natal Ascendant
    if (chart.ascendant) {
      const ascendantDegree = parseFloat(chart.ascendant.split(' ')[0]) || 0;
      
      for (const transitPlanet of ['Jupiter', 'Saturn', 'Rahu', 'Ketu']) {
        if (!planetsToCheck.includes(transitPlanet)) continue;
        
        const transitPos = transits.planets[transitPlanet];
        if (!transitPos) continue;
        
        const angle = calculateAngle(transitPos.degree, ascendantDegree);
        
        for (const [aspectName, aspectDegree] of Object.entries(MAJOR_ASPECTS)) {
          const aspectAngle = Math.abs(angle - aspectDegree);
          const orb = ASPECT_ORBS[aspectName as keyof typeof ASPECT_ORBS];
          
          if (aspectAngle <= orb) {
            const significance = getAscendantTransitSignificance(transitPlanet, aspectName);
            
            if (meetsSignificanceFilter(significance, significanceFilter)) {
              alerts.push({
                type: aspectName === 'conjunction' ? 'transit_to_natal' : 'aspect',
                transitPlanet,
                natalPlanet: 'Ascendant',
                angle: aspectAngle,
                significance,
                orb,
                aspectType: aspectName !== 'conjunction' ? aspectName as any : undefined,
                description: `${transitPlanet} ${aspectName} Ascendant`,
                duration: estimateTransitDuration(transitPlanet),
              });
            }
          }
        }
      }
    }
    
    // Sort by significance and angle (tighter orbs first)
    alerts.sort((a, b) => {
      const sigOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const sigDiff = sigOrder[b.significance] - sigOrder[a.significance];
      if (sigDiff !== 0) return sigDiff;
      return a.angle - b.angle;
    });
    
    return alerts;
  } catch (error) {
    console.error('[TransitDetector] Error detecting transits:', error);
    return [];
  }
}

/**
 * Calculate the shortest angle between two degrees
 */
function calculateAngle(deg1: number, deg2: number): number {
  let angle = Math.abs(deg1 - deg2);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Get default orb for planetary conjunction
 */
function getDefaultOrb(planet1: string, planet2: string): number {
  const slowPlanets = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];
  const fastPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Venus'];
  
  if (slowPlanets.includes(planet1) && slowPlanets.includes(planet2)) {
    return 3; // Wider orb for slow planets
  } else if (fastPlanets.includes(planet1) && fastPlanets.includes(planet2)) {
    return 2; // Tighter orb for fast planets
  } else {
    return 2.5; // Mixed orb
  }
}

/**
 * Determine significance of planetary conjunction
 */
function getConjunctionSignificance(planet1: string, planet2: string, angle: number): TransitAlert['significance'] {
  const criticalPairs = [
    ['Jupiter', 'Saturn'],
    ['Saturn', 'Rahu'],
    ['Jupiter', 'Rahu'],
  ];
  
  const highPairs = [
    ['Mars', 'Saturn'],
    ['Sun', 'Saturn'],
    ['Moon', 'Rahu'],
  ];
  
  const pairKey = [planet1, planet2].sort().join('_');
  const isCritical = criticalPairs.some(pair => pair.sort().join('_') === pairKey);
  const isHigh = highPairs.some(pair => pair.sort().join('_') === pairKey);
  
  if (isCritical) return angle <= 1 ? 'critical' : 'high';
  if (isHigh) return angle <= 1 ? 'high' : 'medium';
  return angle <= 1 ? 'medium' : 'low';
}

/**
 * Determine significance of transit to natal planet
 */
function getTransitSignificance(
  transitPlanet: string,
  natalPlanet: string,
  aspectName: string
): TransitAlert['significance'] {
  const isReturn = transitPlanet === natalPlanet && aspectName === 'conjunction';
  
  if (isReturn) {
    if (transitPlanet === 'Saturn') return 'critical';
    if (transitPlanet === 'Jupiter') return 'high';
    return 'medium';
  }
  
  const criticalTransits = [
    ['Saturn', 'Sun'],
    ['Saturn', 'Moon'],
    ['Rahu', 'Sun'],
    ['Rahu', 'Moon'],
  ];
  
  const highTransits = [
    ['Jupiter', 'Sun'],
    ['Jupiter', 'Moon'],
    ['Saturn', 'Mars'],
    ['Mars', 'Mars'],
  ];
  
  const transitKey = `${transitPlanet}_${natalPlanet}`;
  const isCritical = criticalTransits.some(pair => pair.join('_') === transitKey);
  const isHigh = highTransits.some(pair => pair.join('_') === transitKey);
  
  if (isCritical) return aspectName === 'conjunction' ? 'critical' : 'high';
  if (isHigh) return aspectName === 'conjunction' ? 'high' : 'medium';
  return aspectName === 'conjunction' ? 'medium' : 'low';
}

/**
 * Determine significance of transit to Ascendant
 */
function getAscendantTransitSignificance(
  transitPlanet: string,
  aspectName: string
): TransitAlert['significance'] {
  const majorPlanets = ['Jupiter', 'Saturn', 'Rahu'];
  
  if (majorPlanets.includes(transitPlanet)) {
    return aspectName === 'conjunction' ? 'high' : 'medium';
  }
  
  return aspectName === 'conjunction' ? 'medium' : 'low';
}

/**
 * Check if alert meets significance filter
 */
function meetsSignificanceFilter(
  significance: TransitAlert['significance'],
  filter: string
): boolean {
  const levels = { low: 1, medium: 2, high: 3, critical: 4 };
  return levels[significance] >= levels[filter as keyof typeof levels];
}

/**
 * Estimate duration of conjunction
 */
function estimateConjunctionDuration(planet1: string, planet2: string): string {
  const speeds = {
    Sun: 1, Moon: 13, Mars: 0.5, Mercury: 1.5, Jupiter: 0.08, Venus: 1.2,
    Saturn: 0.03, Rahu: -0.05, Ketu: -0.05
  };
  
  const speed1 = speeds[planet1 as keyof typeof speeds] || 0.5;
  const speed2 = speeds[planet2 as keyof typeof speeds] || 0.5;
  const relativeSpeed = Math.abs(speed1 - speed2);
  
  if (relativeSpeed < 0.1) return '2-3 weeks';
  if (relativeSpeed < 0.5) return '1-2 weeks';
  return '3-7 days';
}

/**
 * Estimate duration of transit
 */
function estimateTransitDuration(planet: string): string {
  const durations = {
    Sun: '1-2 days',
    Moon: '2-3 hours',
    Mars: '3-5 days',
    Mercury: '1-2 days',
    Jupiter: '2-3 weeks',
    Venus: '1-2 days',
    Saturn: '2-3 months',
    Rahu: '3-6 months',
    Ketu: '3-6 months',
  };
  
  return durations[planet as keyof typeof durations] || '1-2 weeks';
}
