import { pythonAPI } from '@/lib/api/python-client';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export interface ReadingContext {
  chart: {
    sunSign: string;
    moonSign: string;
    ascendant: string;
    planets: Record<string, any>;
    currentDasha: {
      planet: string;
      yearsRemaining: number;
    };
  };
  transits: {
    date: string;
    planets: Record<string, any>;
    significantAspects: string[];
  };
  preferences: {
    tone: string;
    language: string;
  };
}

export async function buildReadingContext(
  userId: string,
  date: Date
): Promise<ReadingContext> {
  console.log(`[Context Builder] Building context for user ${userId} on ${format(date, 'yyyy-MM-dd')}`);
  
  // 1. Get user's birth chart from MySQL (saved from Python backend)
  const chart = await prisma.birthChart.findFirst({
    where: {
      userId,
      isPrimary: true,
    },
  });
  
  if (!chart) {
    throw new Error('No birth chart found. Please complete onboarding.');
  }
  
  console.log(`[Context Builder] ✅ Found birth chart: ${chart.chartName}`);
  
  // 2. Get current transits from Python backend
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`[Context Builder] Fetching transits for ${dateStr}...`);
  
  const transits = await pythonAPI.getTransits(dateStr);
  console.log(`[Context Builder] ✅ Transits fetched`);
  
  // 3. Get user preferences from MySQL
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      tonePreference: true,
      language: true,
    },
  });
  
  console.log(`[Context Builder] ✅ User preferences: tone=${profile?.tonePreference}, lang=${profile?.language}`);
  
  // 4. Calculate significant transiting aspects
  const significantAspects = detectSignificantTransits(
    chart.planets as any,
    transits.planets
  );
  
  console.log(`[Context Builder] ✅ Found ${significantAspects.length} significant aspects`);
  
  // 5. Calculate Dasha years remaining
  const currentDasha = chart.currentDasha as any;
  let yearsRemaining = 0;
  
  if (currentDasha?.endDate) {
    const dashaEndDate = new Date(currentDasha.endDate);
    yearsRemaining = (dashaEndDate.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
  }
  
  const context: ReadingContext = {
    chart: {
      sunSign: chart.sunSign,
      moonSign: chart.moonSign,
      ascendant: chart.ascendant,
      planets: chart.planets as any,
      currentDasha: {
        planet: currentDasha?.planet || 'Unknown',
        yearsRemaining: Math.max(0, Math.round(yearsRemaining * 10) / 10),
      },
    },
    transits: {
      date: dateStr,
      planets: transits.planets,
      significantAspects,
    },
    preferences: {
      tone: profile?.tonePreference || 'practical',
      language: profile?.language || 'en',
    },
  };
  
  console.log(`[Context Builder] ✅ Context built successfully`);
  return context;
}

function detectSignificantTransits(
  natalPlanets: Record<string, any>,
  transitPlanets: Record<string, any>
): string[] {
  const aspects: string[] = [];
  
  // Check for major transits (conjunction, opposition, square, trine)
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn'];
  
  for (const transitPlanet of majorPlanets) {
    if (!transitPlanets[transitPlanet]) continue;
    
    for (const natalPlanet of majorPlanets) {
      if (transitPlanet === natalPlanet || !natalPlanets[natalPlanet]) continue;
      
      const transitLong = transitPlanets[transitPlanet].degree || 0;
      const natalLong = natalPlanets[natalPlanet].degree || 0;
      
      let angle = Math.abs(transitLong - natalLong);
      if (angle > 180) angle = 360 - angle;
      
      // Conjunction (0°, orb 8°)
      if (angle <= 8) {
        aspects.push(`${transitPlanet} conjunct natal ${natalPlanet}`);
      }
      // Opposition (180°, orb 8°)
      else if (Math.abs(angle - 180) <= 8) {
        aspects.push(`${transitPlanet} opposite natal ${natalPlanet}`);
      }
      // Square (90°, orb 8°)
      else if (Math.abs(angle - 90) <= 8) {
        aspects.push(`${transitPlanet} square natal ${natalPlanet}`);
      }
      // Trine (120°, orb 8°)
      else if (Math.abs(angle - 120) <= 8) {
        aspects.push(`${transitPlanet} trine natal ${natalPlanet}`);
      }
    }
  }
  
  return aspects.slice(0, 3); // Top 3 most significant
}
