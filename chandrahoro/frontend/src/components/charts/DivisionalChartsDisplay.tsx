import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Grid3X3, Info } from 'lucide-react';
import { DivisionalChart } from '@/lib/api';
import DivisionalChartVisualization from './DivisionalChartVisualization';

interface DivisionalChartsDisplayProps {
  divisionalCharts?: Record<string, DivisionalChart>;
  chartStyle: string;
  selectedCharts: string[];
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const PLANET_SYMBOLS = {
  'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿',
  'Jupiter': '♃', 'Venus': '♀', 'Saturn': '♄',
  'Rahu': '☊', 'Ketu': '☋'
};

const DIVISIONAL_CHART_INFO = {
  'D1': { name: 'Rashi', description: 'Main birth chart - Overall personality and life path', significance: 'Foundation chart for all analysis' },
  'D2': { name: 'Hora', description: 'Wealth and prosperity', significance: 'Financial matters and material resources' },
  'D3': { name: 'Drekkana', description: 'Siblings and courage', significance: 'Brothers, sisters, and personal bravery' },
  'D4': { name: 'Chaturthamsa', description: 'Fortune and property', significance: 'Real estate, vehicles, and fixed assets' },
  'D7': { name: 'Saptamsa', description: 'Children and creativity', significance: 'Offspring, creative expression, and progeny' },
  'D9': { name: 'Navamsa', description: 'Marriage and dharma', significance: 'Spouse, spiritual path, and life purpose' },
  'D10': { name: 'Dasamsa', description: 'Career and profession', significance: 'Work, reputation, and professional achievements' },
  'D12': { name: 'Dwadasamsa', description: 'Parents and ancestry', significance: 'Mother, father, and family lineage' },
  'D16': { name: 'Shodasamsa', description: 'Vehicles and happiness', significance: 'Transportation, comforts, and general well-being' },
  'D20': { name: 'Vimsamsa', description: 'Spiritual pursuits', significance: 'Religious activities and spiritual development' },
  'D24': { name: 'Chaturvimsamsa', description: 'Learning and education', significance: 'Knowledge acquisition and academic achievements' },
  'D27': { name: 'Nakshatramsa', description: 'Strengths and weaknesses', significance: 'Personal strengths, talents, and areas for improvement' },
  'D30': { name: 'Trimsamsa', description: 'Misfortunes and evils', significance: 'Challenges, obstacles, and negative influences' },
  'D40': { name: 'Khavedamsa', description: 'Maternal heritage', significance: 'Mother\'s side influences and maternal lineage' },
  'D45': { name: 'Akshavedamsa', description: 'Character and conduct', significance: 'Moral character and ethical behavior' },
  'D60': { name: 'Shashtyamsa', description: 'Past life karma', significance: 'Karmic influences from previous incarnations' }
};

function DivisionalChartsDisplay({
  divisionalCharts,
  chartStyle,
  selectedCharts
}: DivisionalChartsDisplayProps) {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  if (!divisionalCharts || Object.keys(divisionalCharts).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5" />
            <span>Divisional Charts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No divisional charts data available</p>
            <p className="text-sm text-gray-500 mt-2">
              Divisional charts will appear here when calculated.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableCharts = Object.keys(divisionalCharts).filter(chart => 
    selectedCharts.includes(chart)
  );

  const currentChart = availableCharts[currentChartIndex];
  const currentChartData = divisionalCharts[currentChart];

  const formatDegree = (degree: number) => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    return `${deg}°${min}'`;
  };

  const getSignFromNumber = (signNumber: number) => {
    return SIGNS[signNumber] || 'Unknown';
  };

  const renderSingleChart = (chartKey: string, chartData: DivisionalChart) => {
    const chartInfo = DIVISIONAL_CHART_INFO[chartKey as keyof typeof DIVISIONAL_CHART_INFO];
    
    return (
      <Card key={chartKey} className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{chartKey} - {chartInfo?.name || chartData.name}</span>
                <Badge variant="outline">{chartStyle}</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{chartInfo?.description || chartData.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentChartIndex(Math.max(0, currentChartIndex - 1))}
                disabled={currentChartIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">
                {currentChartIndex + 1} of {availableCharts.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentChartIndex(Math.min(availableCharts.length - 1, currentChartIndex + 1))}
                disabled={currentChartIndex === availableCharts.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart significance */}
            {chartInfo?.significance && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Significance</p>
                    <p className="text-sm text-blue-700">{chartInfo.significance}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Chart */}
            <div className="flex justify-center">
              <DivisionalChartVisualization
                chartData={chartData}
                chartKey={chartKey}
                chartStyle={chartStyle}
                size="medium"
              />
            </div>

            {/* Planetary positions table */}
            <div className="overflow-x-auto">
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
                  {Object.entries(chartData.planets).map(([planetName, planetData]) => (
                    <tr key={planetName} className="border-b">
                      <td className="py-2 font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {PLANET_SYMBOLS[planetName as keyof typeof PLANET_SYMBOLS] || planetName.charAt(0)}
                          </span>
                          <span>{planetName}</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-blue-600">
                            {SIGN_SYMBOLS[getSignFromNumber(planetData.sign_number) as keyof typeof SIGN_SYMBOLS]}
                          </span>
                          <span>{getSignFromNumber(planetData.sign_number)}</span>
                        </div>
                      </td>
                      <td className="py-2">{formatDegree(planetData.degree_in_sign)}</td>
                      <td className="py-2">Nakshatra {planetData.nakshatra_number}</td>
                      <td className="py-2">{planetData.pada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableCharts.slice(0, 6).map((chartKey) => {
          const chartData = divisionalCharts[chartKey];
          const chartInfo = DIVISIONAL_CHART_INFO[chartKey as keyof typeof DIVISIONAL_CHART_INFO];
          
          return (
            <Card key={chartKey} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setCurrentChartIndex(availableCharts.indexOf(chartKey));
                    setViewMode('single');
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {chartKey} - {chartInfo?.name || chartData.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{chartInfo?.description || chartData.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Small visual chart */}
                  <div className="flex justify-center">
                    <DivisionalChartVisualization
                      chartData={chartData}
                      chartKey={chartKey}
                      chartStyle={chartStyle}
                      size="small"
                    />
                  </div>

                  {/* Quick planet overview */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Object.entries(chartData.planets).slice(0, 9).map(([planetName, planetData]) => (
                      <div key={planetName} className="text-center p-1 border rounded">
                        <div className="font-medium">{planetName}</div>
                        <div className="text-gray-600">{getSignFromNumber(planetData.sign_number)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Divisional Charts</h2>
          <p className="text-sm text-gray-600">
            {availableCharts.length} of {selectedCharts.length} charts calculated
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'single' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('single')}
          >
            Single View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
        </div>
      </div>

      {/* Chart display */}
      {viewMode === 'single' ? (
        currentChart && currentChartData ? 
          renderSingleChart(currentChart, currentChartData) :
          <div className="text-center py-8 text-gray-500">No chart selected</div>
      ) : (
        renderGridView()
      )}

      {/* Chart list for quick navigation */}
      {viewMode === 'single' && availableCharts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableCharts.map((chartKey, index) => {
                const chartInfo = DIVISIONAL_CHART_INFO[chartKey as keyof typeof DIVISIONAL_CHART_INFO];
                return (
                  <Button
                    key={chartKey}
                    variant={index === currentChartIndex ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentChartIndex(index)}
                    className="text-xs"
                  >
                    {chartKey} - {chartInfo?.name || divisionalCharts[chartKey].name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DivisionalChartsDisplay;
