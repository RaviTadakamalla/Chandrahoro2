/**
 * ChandraHoro V2.1 - Chart Wheel Component
 * 
 * Main chart container that combines North/South Indian chart styles
 * with planet legend and aspect information. Provides tabbed interface
 * for switching between chart styles.
 * 
 * Features:
 * - Tabbed interface for chart styles
 * - Responsive layout
 * - Planet legend integration
 * - Aspect list display
 * - Chart data validation
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';
import { PlanetLegend } from './PlanetLegend';
import { AspectList } from './AspectList';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde?: boolean;
}

interface Aspect {
  type: string;
  planet1: string;
  planet2: string;
  angle: number;
  orb: number;
  strength?: 'strong' | 'moderate' | 'weak';
}

interface ChartData {
  planets: Record<string, Planet>;
  aspects: Aspect[];
  ascendant: string;
  houses: Record<number, string>;
  // Legacy format support
  planets_array?: any[];
  houses_array?: any[];
}

interface ChartWheelProps {
  chart: ChartData;
}

export function ChartWheel({ chart }: ChartWheelProps) {
  const [style, setStyle] = useState<'north' | 'south'>('north');
  
  // Transform data if needed for legacy compatibility
  const transformedChart = transformChartData(chart);
  
  return (
    <div className="space-y-6">
      {/* Chart Style Tabs */}
      <Tabs value={style} onValueChange={(v) => setStyle(v as 'north' | 'south')}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Birth Chart
          </h2>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="north" className="px-6">
              North Indian
            </TabsTrigger>
            <TabsTrigger value="south" className="px-6">
              South Indian
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* North Indian Chart */}
        <TabsContent value="north" className="mt-0">
          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                North Indian Style (Diamond)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Traditional diamond-shaped chart layout
              </p>
            </div>
            <div className="flex justify-center">
              <NorthIndianChart chartData={transformedChart} size={500} />
            </div>
          </Card>
        </TabsContent>
        
        {/* South Indian Chart */}
        <TabsContent value="south" className="mt-0">
          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                South Indian Style (Grid)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Traditional 4x4 grid chart layout
              </p>
            </div>
            <div className="flex justify-center">
              <SouthIndianChart chartData={transformedChart} size={500} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Planet Legend and Aspects */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PlanetLegend planets={transformedChart.planets || {}} />
        <AspectList aspects={transformedChart.aspects || []} />
      </div>
      
      {/* Chart Information */}
      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              Ascendant
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {transformedChart.ascendant || 'Not available'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              Planets
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {Object.keys(transformedChart.planets || {}).length} positioned
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              Major Aspects
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {(transformedChart.aspects || []).length} found
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Transform chart data to ensure compatibility with existing components
function transformChartData(chart: ChartData): any {
  // If chart already has the expected format, return as-is
  if (chart.planets && typeof chart.planets === 'object' && !Array.isArray(chart.planets)) {
    return {
      ...chart,
      // Convert planets object to array format for existing components
      planets: Object.values(chart.planets).map((planet: any) => ({
        name: planet.name,
        sign: planet.sign,
        degree: planet.degree,
        house: planet.house,
        isRetrograde: planet.isRetrograde || false,
      })),
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        sign: chart.houses?.[i + 1] || '',
      })),
    };
  }
  
  // Handle legacy array format
  if (chart.planets_array) {
    return {
      ...chart,
      planets: chart.planets_array,
      houses: chart.houses_array || [],
    };
  }
  
  // Return chart as-is if no transformation needed
  return chart;
}
