import React, { useState } from 'react';
import { ResponsiveTable } from '@/components/ui/scrollable-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';
import ChartStyleToggle from './ChartStyleToggle';

interface DivisionalChartData {
  name: string;
  description: string;
  planets: {
    [planetName: string]: {
      longitude: number;
      sign_number: number;
      degree_in_sign: number;
      nakshatra_number: number;
      pada: number;
    };
  };
}

interface DivisionalChartsData {
  [chartType: string]: DivisionalChartData;
}

interface DivisionalChartDisplayProps {
  divisionalCharts: DivisionalChartsData;
  chartStyle: 'north' | 'south';
}

export default function DivisionalChartDisplay({ 
  divisionalCharts, 
  chartStyle 
}: DivisionalChartDisplayProps) {
  const [selectedChart, setSelectedChart] = useState<string>('D9');

  // Convert divisional chart data to format expected by chart components
  const convertToChartData = (divisionalData: DivisionalChartData) => {
    const planets = Object.entries(divisionalData.planets).map(([name, data]) => ({
      name,
      tropical_longitude: data.longitude + 24, // Mock tropical (add ayanamsha)
      sidereal_longitude: data.longitude,
      sign: getSignName(data.sign_number),
      degree_in_sign: data.degree_in_sign,
      nakshatra: getNakshatraName(data.nakshatra_number),
      pada: data.pada,
      house: data.sign_number + 1, // Simplified house calculation
      retrograde: false, // Divisional charts don't show retrograde
      speed: 0
    }));

    // Create houses array (simplified)
    const houses = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      sign: getSignName(i),
      cusp_longitude: i * 30,
      degree_in_sign: 0
    }));

    return {
      planets,
      houses,
      birth_info: { name: '', date: '', time: '', location_name: '', latitude: 0, longitude: 0, timezone: 'UTC', time_unknown: false },
      preferences: { ayanamsha: 'Lahiri', house_system: 'Placidus', chart_style: 'north', divisional_charts: [], enable_ai: false },
      ascendant: 0,
      ascendant_sign: getSignName(0),
      ayanamsha_value: 24,
      calculation_timestamp: new Date().toISOString()
    };
  };

  const getSignName = (signNumber: number): string => {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[signNumber % 12];
  };

  const getNakshatraName = (nakshatraNumber: number): string => {
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    return nakshatras[nakshatraNumber % 27];
  };

  const availableCharts = Object.keys(divisionalCharts);
  const currentChartData = divisionalCharts[selectedChart];

  if (!currentChartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Divisional Charts</CardTitle>
          <CardDescription>No divisional chart data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = convertToChartData(currentChartData);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Divisional Charts</CardTitle>
            <CardDescription>
              {currentChartData.name} ({selectedChart}) - {currentChartData.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2">
          {availableCharts.map((chartType) => (
            <Button
              key={chartType}
              variant={selectedChart === chartType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChart(chartType)}
              className="text-xs"
            >
              {chartType} - {divisionalCharts[chartType].name}
            </Button>
          ))}
        </div>

        {/* Chart Visualization */}
        <div className="flex justify-center">
          {chartStyle === 'north' ? (
            <NorthIndianChart chartData={chartData} size={350} />
          ) : (
            <SouthIndianChart chartData={chartData} size={350} />
          )}
        </div>

        {/* Planetary Positions in Divisional Chart */}
        <ResponsiveTable minWidth="500px">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Planet</th>
                <th className="text-left py-2">Sign</th>
                <th className="text-left py-2">Degree</th>
                <th className="text-left py-2">Nakshatra</th>
                <th className="text-left py-2">Pada</th>
              </tr>
            </thead>
            <tbody>
              {chartData.planets.map((planet) => (
                <tr key={planet.name} className="border-b">
                  <td className="py-2 font-medium">{planet.name}</td>
                  <td className="py-2">{planet.sign}</td>
                  <td className="py-2">{(planet.degree_in_sign || 0).toFixed(2)}°</td>
                  <td className="py-2">{planet.nakshatra}</td>
                  <td className="py-2">{planet.pada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Chart Information */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">{currentChartData.name} Chart Significance</h4>
          <p className="text-sm text-blue-800">{currentChartData.description}</p>
          
          {selectedChart === 'D9' && (
            <div className="mt-3 text-sm text-blue-700">
              <p><strong>Key Areas:</strong> Marriage, spouse, dharma, spiritual path, inner strength</p>
              <p><strong>Analysis:</strong> The Navamsa chart reveals the deeper nature of planets and their true strength. It's especially important for marriage compatibility and spiritual evolution.</p>
            </div>
          )}
          
          {selectedChart === 'D10' && (
            <div className="mt-3 text-sm text-blue-700">
              <p><strong>Key Areas:</strong> Career, profession, reputation, authority, public image</p>
              <p><strong>Analysis:</strong> The Dasamsa chart shows career potential, professional success, and how one is perceived in their field of work.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
