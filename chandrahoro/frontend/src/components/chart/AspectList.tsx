/**
 * ChandraHoro V2.1 - Aspect List Component
 * 
 * Displays planetary aspects with type, angle, and orb information.
 * Uses color coding for different aspect types and shows strength.
 * 
 * Features:
 * - Aspect type badges with colors
 * - Planet pair information
 * - Angle and orb details
 * - Strength indicators
 * - Empty state handling
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ASPECT_COLORS = {
  Conjunction: '#4CAF50',
  Opposition: '#F44336',
  Trine: '#2196F3',
  Square: '#FF9800',
  Sextile: '#9C27B0',
  Quincunx: '#795548',
  Semisextile: '#607D8B',
};

const ASPECT_SYMBOLS = {
  Conjunction: '☌',
  Opposition: '☍',
  Trine: '△',
  Square: '□',
  Sextile: '⚹',
  Quincunx: '⚻',
  Semisextile: '⚺',
};

interface Aspect {
  type: string;
  planet1: string;
  planet2: string;
  angle: number;
  orb: number;
  strength?: 'strong' | 'moderate' | 'weak';
}

interface AspectListProps {
  aspects: Aspect[];
}

export function AspectList({ aspects }: AspectListProps) {
  // Sort aspects by strength and type
  const sortedAspects = [...aspects].sort((a, b) => {
    const strengthOrder = { strong: 0, moderate: 1, weak: 2 };
    const aStrength = strengthOrder[a.strength as keyof typeof strengthOrder] ?? 1;
    const bStrength = strengthOrder[b.strength as keyof typeof strengthOrder] ?? 1;
    
    if (aStrength !== bStrength) {
      return aStrength - bStrength;
    }
    
    return a.orb - b.orb; // Tighter orbs first
  });

  return (
    <Card className="p-4">
      <h3 className="font-bold mb-4 text-lg text-gray-900 dark:text-gray-100">
        Planetary Aspects
      </h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {sortedAspects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⚹</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No major aspects found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Aspects with orbs within 8° are shown
            </p>
          </div>
        ) : (
          sortedAspects.map((aspect, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-b-0">
              <div className="flex items-center gap-3">
                {/* Aspect type badge */}
                <Badge
                  style={{
                    backgroundColor: ASPECT_COLORS[aspect.type as keyof typeof ASPECT_COLORS] || '#666666',
                    color: 'white',
                  }}
                  className="text-xs px-2 py-1 font-medium"
                >
                  <span className="mr-1">
                    {ASPECT_SYMBOLS[aspect.type as keyof typeof ASPECT_SYMBOLS] || '⚹'}
                  </span>
                  {aspect.type}
                </Badge>
                
                {/* Planet pair */}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {aspect.planet1} - {aspect.planet2}
                </span>
                
                {/* Strength indicator */}
                {aspect.strength && (
                  <div className={`w-2 h-2 rounded-full ${
                    aspect.strength === 'strong' ? 'bg-green-500' :
                    aspect.strength === 'moderate' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} title={`${aspect.strength} aspect`} />
                )}
              </div>
              
              {/* Angle and orb information */}
              <div className="text-gray-600 dark:text-gray-400 text-right">
                <div className="font-medium">
                  {aspect.angle.toFixed(1)}°
                </div>
                <div className="text-xs">
                  orb: {aspect.orb.toFixed(1)}°
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer with legend */}
      {sortedAspects.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Strong</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Weak</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
