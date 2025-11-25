/**
 * Chart Patterns Display Component
 * 
 * Displays Western astrology chart patterns:
 * - Grand Trine (3 planets in trine, same element)
 * - T-Square (2 oppositions + 2 squares)
 * - Stellium (3+ planets in same sign/house)
 * - Yod (Finger of God)
 * - Grand Cross
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Star, Triangle, Square } from 'lucide-react';

interface ChartPattern {
  type: string;
  planets: string[];
  description?: string;
  significance?: string;
}

interface ChartPatternsDisplayProps {
  patterns: ChartPattern[];
}

const PATTERN_INFO: Record<string, { icon: any; color: string; description: string }> = {
  'Grand Trine': {
    icon: Triangle,
    color: 'text-blue-600 dark:text-blue-400',
    description: 'Three planets forming an equilateral triangle (120° apart). Indicates natural talents and ease in the element involved.'
  },
  'T-Square': {
    icon: Square,
    color: 'text-red-600 dark:text-red-400',
    description: 'Two planets in opposition with a third planet square to both. Creates dynamic tension and drive for achievement.'
  },
  'Stellium': {
    icon: Star,
    color: 'text-yellow-600 dark:text-yellow-400',
    description: 'Three or more planets in the same sign or house. Concentrates energy and focus in that area of life.'
  },
  'Grand Cross': {
    icon: AlertCircle,
    color: 'text-purple-600 dark:text-purple-400',
    description: 'Four planets forming two oppositions and four squares. Indicates major life challenges and potential for great achievement.'
  },
  'Yod': {
    icon: AlertCircle,
    color: 'text-green-600 dark:text-green-400',
    description: 'Two planets in sextile with both quincunx to a third. Called "Finger of God" - indicates a special destiny or mission.'
  },
};

export function ChartPatternsDisplay({ patterns }: ChartPatternsDisplayProps) {
  if (!patterns || patterns.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Chart Patterns
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No major chart patterns detected.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Chart Patterns ({patterns.length})
      </h3>
      
      <div className="space-y-4">
        {patterns.map((pattern, index) => {
          const info = PATTERN_INFO[pattern.type] || {
            icon: AlertCircle,
            color: 'text-gray-600',
            description: 'Chart pattern detected.'
          };
          
          const Icon = info.icon;
          
          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${info.color}`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {pattern.type}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {pattern.planets.length} planets
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Planets Involved:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pattern.planets.map((planet, pIndex) => (
                        <Badge
                          key={pIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {planet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {pattern.description || info.description}
                  </p>
                  
                  {pattern.significance && (
                    <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded border-l-4 border-indigo-500">
                      <p className="text-sm text-indigo-900 dark:text-indigo-200">
                        <span className="font-semibold">Significance:</span> {pattern.significance}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Note:</span> Chart patterns are powerful configurations
          that shape personality and life experiences. They represent concentrated energies that
          can manifest as talents, challenges, or life themes.
        </p>
      </div>
    </Card>
  );
}

export default ChartPatternsDisplay;
