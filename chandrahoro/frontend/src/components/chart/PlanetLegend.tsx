/**
 * ChandraHoro V2.1 - Planet Legend Component
 * 
 * Displays planetary positions with symbols, signs, degrees, and houses.
 * Shows retrograde status and uses color coding for visual clarity.
 * 
 * Features:
 * - Planet symbols with color coding
 * - Degree and sign information
 * - House positions
 * - Retrograde indicators
 * - Responsive design
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLANET_COLORS = {
  Sun: '#FFA500',
  Moon: '#C0C0C0',
  Mars: '#FF0000',
  Mercury: '#90EE90',
  Jupiter: '#FFD700',
  Venus: '#FF69B4',
  Saturn: '#000080',
  Rahu: '#8B4513',
  Ketu: '#A52A2A',
};

const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde?: boolean;
}

interface PlanetLegendProps {
  planets: Record<string, Planet>;
}

export function PlanetLegend({ planets }: PlanetLegendProps) {
  return (
    <Card className="p-4">
      <h3 className="font-bold mb-4 text-lg text-gray-900 dark:text-gray-100">
        Planetary Positions
      </h3>
      
      <div className="space-y-3">
        {Object.entries(planets).map(([name, planet]: [string, Planet]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {/* Planet color indicator */}
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ 
                  backgroundColor: PLANET_COLORS[name as keyof typeof PLANET_COLORS] || '#666666' 
                }}
              />
              
              {/* Planet symbol and name */}
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {PLANET_SYMBOLS[name as keyof typeof PLANET_SYMBOLS] || name.charAt(0)}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {name}
                </span>
              </div>
              
              {/* Retrograde indicator */}
              {planet.isRetrograde && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  R
                </Badge>
              )}
            </div>
            
            {/* Position information */}
            <div className="text-gray-600 dark:text-gray-400 text-right">
              <div className="font-medium">
                {planet.sign} {planet.degree.toFixed(1)}°
              </div>
              <div className="text-xs">
                House {planet.house}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💫 Positions calculated for birth time and location
        </p>
      </div>
    </Card>
  );
}
