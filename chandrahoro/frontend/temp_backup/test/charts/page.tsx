'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  NatalChart,
  StrengthMeter,
  StrengthMeterSkeleton,
  StrengthMeterCompact,
  DashaTimeline,
  DashaTimelineSkeleton,
  DashaTimelineCompact,
  CompatibilityGauge,
  CompatibilityGaugeSkeleton,
  CompatibilityGaugeCompact,
  AspectRadarChart,
  AspectRadarChartSkeleton
} from '@/components/charts/visualization';
import type { BirthChartData, DashaPeriod } from '@/types/chart';

/**
 * Chart Visualization Test Page
 * 
 * Comprehensive test page for all chart visualization components
 * with mock data and interactive examples.
 */
export default function ChartsTestPage() {
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north_indian' | 'south_indian'>('north_indian');

  // Mock birth chart data
  const mockChartData: BirthChartData = {
    id: 'test-chart-1',
    userId: 'test-user',
    birthDate: '1990-06-15',
    birthTime: '14:30:00',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    
    planets: [
      { name: 'Sun', longitude: 84.5, sign: 'Gemini', degree: 24.5, house: 1, isRetrograde: false, strength: 85 },
      { name: 'Moon', longitude: 156.2, sign: 'Leo', degree: 6.2, house: 3, isRetrograde: false, strength: 72 },
      { name: 'Mercury', longitude: 78.8, sign: 'Gemini', degree: 18.8, house: 1, isRetrograde: true, strength: 68 },
      { name: 'Venus', longitude: 102.3, sign: 'Cancer', degree: 12.3, house: 2, isRetrograde: false, strength: 91 },
      { name: 'Mars', longitude: 245.7, sign: 'Sagittarius', degree: 5.7, house: 7, isRetrograde: false, strength: 45 },
      { name: 'Jupiter', longitude: 198.4, sign: 'Libra', degree: 18.4, house: 5, isRetrograde: false, strength: 78 },
      { name: 'Saturn', longitude: 312.1, sign: 'Aquarius', degree: 12.1, house: 9, isRetrograde: true, strength: 34 },
      { name: 'Rahu', longitude: 45.6, sign: 'Taurus', degree: 15.6, house: 12, isRetrograde: true, strength: 56 },
      { name: 'Ketu', longitude: 225.6, sign: 'Scorpio', degree: 15.6, house: 6, isRetrograde: true, strength: 42 }
    ],
    
    houses: [
      { number: 1, cusp: 60, sign: 'Gemini', planets: ['Sun', 'Mercury'] },
      { number: 2, cusp: 90, sign: 'Cancer', planets: ['Venus'] },
      { number: 3, cusp: 120, sign: 'Leo', planets: ['Moon'] },
      { number: 4, cusp: 150, sign: 'Virgo', planets: [] },
      { number: 5, cusp: 180, sign: 'Libra', planets: ['Jupiter'] },
      { number: 6, cusp: 210, sign: 'Scorpio', planets: ['Ketu'] },
      { number: 7, cusp: 240, sign: 'Sagittarius', planets: ['Mars'] },
      { number: 8, cusp: 270, sign: 'Capricorn', planets: [] },
      { number: 9, cusp: 300, sign: 'Aquarius', planets: ['Saturn'] },
      { number: 10, cusp: 330, sign: 'Pisces', planets: [] },
      { number: 11, cusp: 0, sign: 'Aries', planets: [] },
      { number: 12, cusp: 30, sign: 'Taurus', planets: ['Rahu'] }
    ],
    
    ascendant: 'Gemini',
    sunSign: 'Gemini',
    moonSign: 'Leo',
    
    currentDasha: {
      planet: 'Venus',
      startDate: '2020-06-15',
      endDate: '2040-06-15',
      subPeriod: 'Mercury'
    },
    
    dashaTimeline: [
      { planet: 'Venus', startDate: '2020-06-15', endDate: '2040-06-15', duration: 20, isCurrent: true },
      { planet: 'Sun', startDate: '2040-06-15', endDate: '2046-06-15', duration: 6, isCurrent: false },
      { planet: 'Moon', startDate: '2046-06-15', endDate: '2056-06-15', duration: 10, isCurrent: false },
      { planet: 'Mars', startDate: '2056-06-15', endDate: '2063-06-15', duration: 7, isCurrent: false },
      { planet: 'Rahu', startDate: '2063-06-15', endDate: '2081-06-15', duration: 18, isCurrent: false }
    ],
    
    planetaryStrengths: {
      Sun: 85, Moon: 72, Mercury: 68, Venus: 91, Mars: 45, Jupiter: 78, Saturn: 34, Rahu: 56, Ketu: 42
    },
    
    compatibilityScore: 7.8,
    
    lifeAspects: {
      work: 8.2,
      love: 6.8,
      health: 7.5,
      finance: 5.9,
      family: 8.7,
      spiritual: 7.1
    }
  };

  // Mock Dasha data with sub-periods
  const mockDashaData: DashaPeriod[] = [
    {
      planet: 'Venus',
      startDate: '2020-06-15',
      endDate: '2040-06-15',
      duration: 20,
      isCurrent: true,
      subPeriods: [
        { planet: 'Venus', startDate: '2020-06-15', endDate: '2023-10-15', duration: 3.33, isCurrent: false },
        { planet: 'Sun', startDate: '2023-10-15', endDate: '2024-10-15', duration: 1, isCurrent: true },
        { planet: 'Moon', startDate: '2024-10-15', endDate: '2026-06-15', duration: 1.67, isCurrent: false },
        { planet: 'Mars', startDate: '2026-06-15', endDate: '2027-08-15', duration: 1.17, isCurrent: false }
      ]
    },
    {
      planet: 'Sun',
      startDate: '2040-06-15',
      endDate: '2046-06-15',
      duration: 6,
      isCurrent: false
    },
    {
      planet: 'Moon',
      startDate: '2046-06-15',
      endDate: '2056-06-15',
      duration: 10,
      isCurrent: false
    }
  ];

  const handlePlanetClick = (planet: any) => {
    console.log('Planet clicked:', planet);
  };

  const handlePeriodClick = (period: DashaPeriod) => {
    console.log('Dasha period clicked:', period);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Chart Visualization Components</h1>
        <p className="text-muted-foreground mb-4">
          Comprehensive test page for all chart visualization components with interactive examples.
        </p>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setShowSkeletons(!showSkeletons)} 
            variant="outline" 
            size="sm"
          >
            {showSkeletons ? 'Show Components' : 'Show Skeletons'}
          </Button>
          
          <Button 
            onClick={() => setChartStyle(chartStyle === 'north_indian' ? 'south_indian' : 'north_indian')} 
            variant="outline" 
            size="sm"
          >
            Toggle Chart Style ({chartStyle})
          </Button>
        </div>
      </div>

      <Tabs defaultValue="natal-chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="natal-chart">Natal Chart</TabsTrigger>
          <TabsTrigger value="strength">Strength Meters</TabsTrigger>
          <TabsTrigger value="dasha">Dasha Timeline</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="aspects">Life Aspects</TabsTrigger>
        </TabsList>

        {/* Natal Chart Tab */}
        <TabsContent value="natal-chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Natal Chart Visualization</span>
                <Badge variant="outline">{chartStyle}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <NatalChart
                  chartData={mockChartData}
                  style={chartStyle}
                  size={500}
                  interactive={true}
                  onPlanetClick={handlePlanetClick}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strength Meters Tab */}
        <TabsContent value="strength" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Planetary Strength Meters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showSkeletons ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <StrengthMeterSkeleton key={index} />
                  ))
                ) : (
                  mockChartData.planets.slice(0, 4).map((planet) => (
                    <StrengthMeter
                      key={planet.name}
                      planetName={planet.name}
                      strength={planet.strength || 50}
                      breakdown={{
                        sthana: (planet.strength || 50) * 0.2,
                        dig: (planet.strength || 50) * 0.15,
                        kala: (planet.strength || 50) * 0.18,
                        chesta: (planet.strength || 50) * 0.12,
                        naisargika: (planet.strength || 50) * 0.2,
                        drik: (planet.strength || 50) * 0.15
                      }}
                      showTooltip={true}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Strength Meters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockChartData.planets.map((planet) => (
                  <StrengthMeterCompact
                    key={planet.name}
                    planetName={planet.name}
                    strength={planet.strength || 50}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dasha Timeline Tab */}
        <TabsContent value="dasha" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dasha Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {showSkeletons ? (
                    <DashaTimelineSkeleton />
                  ) : (
                    <DashaTimeline
                      dashaData={mockDashaData}
                      currentDate={new Date()}
                      onPeriodClick={handlePeriodClick}
                      showSubPeriods={true}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Compact Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <DashaTimelineCompact
                    dashaData={mockDashaData}
                    currentDate={new Date()}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Compatibility Tab */}
        <TabsContent value="compatibility" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Gauge</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                {showSkeletons ? (
                  <CompatibilityGaugeSkeleton />
                ) : (
                  <CompatibilityGauge
                    score={mockChartData.compatibilityScore || 7.8}
                    title="Overall Compatibility"
                    subtitle="Based on planetary positions"
                    animated={true}
                    size={250}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Gauges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CompatibilityGaugeCompact
                  score={8.5}
                  title="Romantic Compatibility"
                />
                <CompatibilityGaugeCompact
                  score={6.2}
                  title="Business Partnership"
                />
                <CompatibilityGaugeCompact
                  score={7.8}
                  title="Friendship Compatibility"
                />
                <CompatibilityGaugeCompact
                  score={5.4}
                  title="Family Harmony"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Life Aspects Tab */}
        <TabsContent value="aspects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Life Aspects Radar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <AspectRadarChartSkeleton />
              ) : (
                <AspectRadarChart
                  data={mockChartData.lifeAspects || {
                    work: 8.2,
                    love: 6.8,
                    health: 7.5,
                    finance: 5.9,
                    family: 8.7,
                    spiritual: 7.1
                  }}
                  maxValue={10}
                  showGrid={true}
                  animated={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
