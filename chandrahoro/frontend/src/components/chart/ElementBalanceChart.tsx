/**
 * Element Balance Chart Component
 * 
 * Displays the distribution of planets across:
 * - Elements: Fire, Earth, Air, Water
 * - Modalities: Cardinal, Fixed, Mutable
 * 
 * Uses bar charts and visual indicators to show balance/imbalance
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Mountain, Wind, Droplet } from 'lucide-react';

interface ElementBalance {
  elements: {
    Fire: number;
    Earth: number;
    Air: number;
    Water: number;
  };
  modalities: {
    Cardinal: number;
    Fixed: number;
    Mutable: number;
  };
  dominant_element?: string;
  dominant_modality?: string;
}

interface ElementBalanceChartProps {
  balance: ElementBalance;
}

const ELEMENT_INFO = {
  Fire: {
    icon: Flame,
    color: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-400',
    description: 'Energy, passion, enthusiasm, action'
  },
  Earth: {
    icon: Mountain,
    color: 'bg-green-600',
    textColor: 'text-green-600 dark:text-green-400',
    description: 'Practicality, stability, material focus'
  },
  Air: {
    icon: Wind,
    color: 'bg-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
    description: 'Intellect, communication, ideas'
  },
  Water: {
    icon: Droplet,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    description: 'Emotion, intuition, sensitivity'
  },
};

const MODALITY_INFO = {
  Cardinal: {
    color: 'bg-purple-500',
    description: 'Initiative, leadership, new beginnings'
  },
  Fixed: {
    color: 'bg-orange-500',
    description: 'Stability, persistence, determination'
  },
  Mutable: {
    color: 'bg-teal-500',
    description: 'Adaptability, flexibility, change'
  },
};

export function ElementBalanceChart({ balance }: ElementBalanceChartProps) {
  const totalPlanets = Object.values(balance.elements).reduce((sum, count) => sum + count, 0);
  
  const getPercentage = (count: number) => {
    return totalPlanets > 0 ? (count / totalPlanets) * 100 : 0;
  };
  
  const getBalanceLabel = (percentage: number) => {
    if (percentage >= 40) return 'Dominant';
    if (percentage >= 25) return 'Strong';
    if (percentage >= 15) return 'Moderate';
    if (percentage > 0) return 'Weak';
    return 'Absent';
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Element & Modality Balance
      </h3>
      
      {/* Elements Section */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Elements
        </h4>
        
        <div className="space-y-4">
          {Object.entries(balance.elements).map(([element, count]) => {
            const info = ELEMENT_INFO[element as keyof typeof ELEMENT_INFO];
            const Icon = info.icon;
            const percentage = getPercentage(count);
            const balanceLabel = getBalanceLabel(percentage);
            
            return (
              <div key={element} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`${info.textColor}`} size={20} />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {element}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {count} planets
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {percentage.toFixed(0)}%
                    </span>
                    <Badge
                      variant={balanceLabel === 'Dominant' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {balanceLabel}
                    </Badge>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${info.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 ml-7">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modalities Section */}
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Modalities
        </h4>
        
        <div className="space-y-4">
          {Object.entries(balance.modalities).map(([modality, count]) => {
            const info = MODALITY_INFO[modality as keyof typeof MODALITY_INFO];
            const percentage = getPercentage(count);
            const balanceLabel = getPercentage(percentage);
            
            return (
              <div key={modality} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {modality}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {count} planets
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${info.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default ElementBalanceChart;
