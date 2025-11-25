/**
 * Western Chart Wheel Component
 * 
 * Displays a circular Western astrology chart with:
 * - 360° wheel divided into 12 houses
 * - Planets positioned by degree
 * - Aspect lines (colored by nature)
 * - House cusps and signs
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface Planet {
  name: string;
  longitude: number;
  sign_number: number;
  degree_in_sign: number;
  house: number;
  retrograde?: boolean;
}

interface Aspect {
  planet1: string;
  planet2: string;
  aspect_type: string;
  orb: number;
  nature: string; // 'hard', 'soft', 'neutral', 'minor'
}

interface WesternChartWheelProps {
  planets: Planet[];
  ascendant: {
    longitude: number;
    sign_number: number;
  };
  aspects?: Aspect[];
  size?: number;
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Chiron': '⚷',
};

const PLANET_COLORS: Record<string, string> = {
  'Sun': '#FFD700',
  'Moon': '#C0C0C0',
  'Mercury': '#87CEEB',
  'Venus': '#FF69B4',
  'Mars': '#FF4500',
  'Jupiter': '#FFA500',
  'Saturn': '#8B4513',
  'Uranus': '#00CED1',
  'Neptune': '#4169E1',
  'Pluto': '#8B008B',
};

export function WesternChartWheel({ 
  planets, 
  ascendant, 
  aspects = [],
  size = 500 
}: WesternChartWheelProps) {
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.25;
  const planetRadius = size * 0.35;
  
  // Calculate position for a given angle (0° = East, counterclockwise)
  const polarToCartesian = (angle: number, radius: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians)
    };
  };
  
  // Draw house cusps (12 lines from center)
  const renderHouseCusps = () => {
    const cusps = [];
    const ascLong = ascendant.longitude;
    
    for (let i = 0; i < 12; i++) {
      const angle = (ascLong + (i * 30)) % 360;
      const outer = polarToCartesian(angle, outerRadius);
      const inner = polarToCartesian(angle, innerRadius);
      
      cusps.push(
        <line
          key={`cusp-${i}`}
          x1={center}
          y1={center}
          x2={outer.x}
          y2={outer.y}
          stroke="#666"
          strokeWidth="1"
        />
      );
      
      // Add house number
      const labelPos = polarToCartesian(angle + 15, outerRadius * 0.9);
      cusps.push(
        <text
          key={`house-${i}`}
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-600 dark:fill-gray-400"
        >
          {i + 1}
        </text>
      );
    }
    
    return cusps;
  };
  
  // Draw zodiac signs
  const renderZodiacSigns = () => {
    const signs = [];
    const ascLong = ascendant.longitude || 0;

    for (let i = 0; i < 12; i++) {
      const angle = (ascLong + (i * 30)) % 360;
      const signIndex = Math.floor(angle / 30) % 12; // Ensure 0-11 range
      const signName = SIGN_NAMES[signIndex];

      if (!signName) {
        console.error(`Invalid signIndex: ${signIndex} for angle: ${angle}`);
        continue;
      }

      const labelPos = polarToCartesian(angle + 15, outerRadius * 1.1);

      signs.push(
        <text
          key={`sign-${i}`}
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-semibold fill-indigo-600 dark:fill-indigo-400"
        >
          {signName.substring(0, 3)}
        </text>
      );
    }

    return signs;
  };

  // Draw planets
  const renderPlanets = () => {
    const planetElements = [];
    const ascLong = ascendant.longitude || 0;

    planets.forEach((planet, index) => {
      const planetLong = planet.longitude || 0;
      // Adjust angle relative to ascendant
      const angle = (planetLong - ascLong + 360) % 360;
      const pos = polarToCartesian(angle, planetRadius);

      const symbol = PLANET_SYMBOLS[planet.name] || planet.name?.charAt(0) || '?';
      const color = PLANET_COLORS[planet.name] || '#888';

      planetElements.push(
        <g key={`planet-${planet.name}`}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="12"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-bold fill-white"
          >
            {symbol}
          </text>
          {planet.retrograde && (
            <text
              x={pos.x + 15}
              y={pos.y - 10}
              className="text-xs fill-red-500"
            >
              R
            </text>
          )}
        </g>
      );
    });

    return planetElements;
  };

  // Draw aspect lines
  const renderAspects = () => {
    if (!aspects || aspects.length === 0) return null;

    const aspectLines = [];
    const ascLong = ascendant.longitude || 0;

    aspects.forEach((aspect, index) => {
      const planet1 = planets.find(p => p.name === aspect.planet1);
      const planet2 = planets.find(p => p.name === aspect.planet2);

      if (!planet1 || !planet2) return;

      const angle1 = ((planet1.longitude || 0) - ascLong + 360) % 360;
      const angle2 = ((planet2.longitude || 0) - ascLong + 360) % 360;

      const pos1 = polarToCartesian(angle1, planetRadius);
      const pos2 = polarToCartesian(angle2, planetRadius);

      // Color based on aspect nature
      let color = '#888';
      let strokeWidth = 1;

      if (aspect.nature === 'hard') {
        color = '#EF4444'; // red
        strokeWidth = 2;
      } else if (aspect.nature === 'soft') {
        color = '#3B82F6'; // blue
        strokeWidth = 2;
      } else if (aspect.nature === 'neutral') {
        color = '#10B981'; // green
        strokeWidth = 1.5;
      }

      aspectLines.push(
        <line
          key={`aspect-${index}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={aspect.nature === 'minor' ? '4,4' : 'none'}
          opacity="0.5"
        />
      );
    });

    return aspectLines;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Western Chart Wheel
        </h3>

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900"
        >
          {/* Outer circle */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#999"
            strokeWidth="2"
          />

          {/* Inner circle */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="#999"
            strokeWidth="1"
          />

          {/* House cusps */}
          {renderHouseCusps()}

          {/* Zodiac signs */}
          {renderZodiacSigns()}

          {/* Aspect lines (drawn first, behind planets) */}
          {renderAspects()}

          {/* Planets */}
          {renderPlanets()}

          {/* Ascendant marker */}
          <g>
            <line
              x1={center}
              y1={center}
              x2={center + outerRadius}
              y2={center}
              stroke="#FF0000"
              strokeWidth="3"
            />
            <text
              x={center + outerRadius + 15}
              y={center}
              className="text-sm font-bold fill-red-600"
              dominantBaseline="middle"
            >
              ASC
            </text>
          </g>
        </svg>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Ascendant: {SIGN_NAMES[ascendant.sign_number] || 'Unknown'} {(ascendant.longitude || 0).toFixed(2)}°</p>
        </div>
      </div>
    </Card>
  );
}

export default WesternChartWheel;
