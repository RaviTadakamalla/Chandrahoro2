import React, { useState } from 'react';

interface AshtakavargaData {
  individual_charts?: {
    [planet: string]: {
      house_points?: number[];
      total_points?: number;
      average_points?: number;
    };
  };
  sarvashtakavarga?: {
    house_points?: number[];
    total_points?: number;
    average_points?: number;
  };
  summary?: {
    strongest_planet?: string;
    weakest_planet?: string;
    strongest_house?: number;
    weakest_house?: number;
    balance_score?: number;
    planet_strengths?: {
      [planet: string]: number;
    };
  };
}

interface AshtakavargaDisplayProps {
  data: AshtakavargaData;
}

const AshtakavargaDisplay: React.FC<AshtakavargaDisplayProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<string>('sarvashtakavarga');
  const [viewMode, setViewMode] = useState<'grid' | 'heatmap'>('grid');

  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const houses = Array.from({ length: 12 }, (_, i) => i + 1);

  const getHousePoints = (chart: string) => {
    if (chart === 'sarvashtakavarga') {
      return data.sarvashtakavarga?.house_points || [];
    }
    return data.individual_charts?.[chart]?.house_points || [];
  };

  const getTotalPoints = (chart: string) => {
    if (chart === 'sarvashtakavarga') {
      return data.sarvashtakavarga?.total_points || 0;
    }
    return data.individual_charts?.[chart]?.total_points || 0;
  };

  const getPointColor = (points: number, maxPoints: number) => {
    const intensity = points / maxPoints;
    if (intensity >= 0.8) return 'bg-green-600 text-white';
    if (intensity >= 0.6) return 'bg-green-400 text-white';
    if (intensity >= 0.4) return 'bg-yellow-400 text-black';
    if (intensity >= 0.2) return 'bg-orange-400 text-white';
    return 'bg-red-400 text-white';
  };

  const getHeatmapColor = (points: number, maxPoints: number) => {
    const intensity = points / maxPoints;
    const opacity = Math.max(0.1, intensity);
    if (intensity >= 0.8) return `rgba(34, 197, 94, ${opacity})`;
    if (intensity >= 0.6) return `rgba(101, 163, 13, ${opacity})`;
    if (intensity >= 0.4) return `rgba(234, 179, 8, ${opacity})`;
    if (intensity >= 0.2) return `rgba(249, 115, 22, ${opacity})`;
    return `rgba(239, 68, 68, ${opacity})`;
  };

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'text-orange-600 bg-orange-50 border-orange-200',
      'Moon': 'text-gray-600 bg-gray-50 border-gray-200',
      'Mercury': 'text-green-600 bg-green-50 border-green-200',
      'Venus': 'text-pink-600 bg-pink-50 border-pink-200',
      'Mars': 'text-red-600 bg-red-50 border-red-200',
      'Jupiter': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Saturn': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[planet] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const currentPoints = getHousePoints(selectedChart) || [];
  const maxPoints = currentPoints.length > 0 ? Math.max(...currentPoints) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ashtakavarga System
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Eight-fold division system showing planetary strength in each house
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Points</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {data.sarvashtakavarga?.total_points || 0}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-300">
            Avg: {(data.sarvashtakavarga?.average_points || 0).toFixed(1)}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm font-medium text-green-800 dark:text-green-200">Strongest Planet</div>
          <div className="text-lg font-bold text-green-900 dark:text-green-100">
            {data.summary?.strongest_planet || 'N/A'}
          </div>
          <div className="text-xs text-green-600 dark:text-green-300">
            {data.summary?.strongest_planet && data.summary?.planet_strengths?.[data.summary.strongest_planet]
              ? (data.summary.planet_strengths[data.summary.strongest_planet] as number).toFixed(1)
              : '0'} points
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Strongest House</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {data.summary?.strongest_house || 'N/A'}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-300">
            {data.summary?.strongest_house && data.sarvashtakavarga?.house_points
              ? (data.sarvashtakavarga.house_points[data.summary.strongest_house - 1] || 0)
              : 0} points
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Balance Score</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {(data.summary?.balance_score || 0).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            Distribution balance
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select 
            value={selectedChart} 
            onChange={(e) => setSelectedChart(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="sarvashtakavarga">Sarvashtakavarga (Combined)</option>
            {planets.map(planet => (
              <option key={planet} value={planet}>{planet} Ashtakavarga</option>
            ))}
          </select>
          
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-2 text-sm border-l border-gray-300 dark:border-gray-600 ${
                viewMode === 'heatmap' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Heatmap
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {getTotalPoints(selectedChart)} points
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            {selectedChart === 'sarvashtakavarga' ? 'Sarvashtakavarga Chart' : `${selectedChart} Ashtakavarga`}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedChart === 'sarvashtakavarga' 
              ? 'Combined points from all planets' 
              : `Points contributed by ${selectedChart} from 8 sources`}
          </p>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            {/* House 12 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[11] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">12</div>
                <div className="text-lg font-bold">{currentPoints[11] || 0}</div>
              </div>
            </div>

            {/* House 1 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[0] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">1</div>
                <div className="text-lg font-bold">{currentPoints[0] || 0}</div>
              </div>
            </div>

            {/* House 2 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[1] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">2</div>
                <div className="text-lg font-bold">{currentPoints[1] || 0}</div>
              </div>
            </div>

            {/* House 3 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[2] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">3</div>
                <div className="text-lg font-bold">{currentPoints[2] || 0}</div>
              </div>
            </div>

            {/* House 11 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[10] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">11</div>
                <div className="text-lg font-bold">{currentPoints[10] || 0}</div>
              </div>
            </div>
            
            {/* Center - Chart Info */}
            <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{getTotalPoints(selectedChart)}</div>
              </div>
            </div>
            
            {/* Center - Empty */}
            <div className="aspect-square"></div>
            
            {/* House 4 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[3] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">4</div>
                <div className="text-lg font-bold">{currentPoints[3] || 0}</div>
              </div>
            </div>

            {/* House 10 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[9] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">10</div>
                <div className="text-lg font-bold">{currentPoints[9] || 0}</div>
              </div>
            </div>

            {/* House 9 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[8] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">9</div>
                <div className="text-lg font-bold">{currentPoints[8] || 0}</div>
              </div>
            </div>

            {/* House 8 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[7] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">8</div>
                <div className="text-lg font-bold">{currentPoints[7] || 0}</div>
              </div>
            </div>

            {/* House 7 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[6] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">7</div>
                <div className="text-lg font-bold">{currentPoints[6] || 0}</div>
              </div>
            </div>

            {/* House 6 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[5] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">6</div>
                <div className="text-lg font-bold">{currentPoints[5] || 0}</div>
              </div>
            </div>

            {/* House 5 */}
            <div className={`aspect-square flex items-center justify-center rounded-lg border-2 ${getPointColor(currentPoints[4] || 0, maxPoints)}`}>
              <div className="text-center">
                <div className="text-xs font-medium">5</div>
                <div className="text-lg font-bold">{currentPoints[4] || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap View */}
        {viewMode === 'heatmap' && (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-1">
              {houses.map((house, index) => (
                <div 
                  key={house}
                  className="aspect-square flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-sm font-medium"
                  style={{ backgroundColor: getHeatmapColor(currentPoints[index] || 0, maxPoints) }}
                >
                  <div className="text-center">
                    <div className="text-xs">H{house}</div>
                    <div className="font-bold">{currentPoints[index] || 0}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Heatmap Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span>Weak</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.8)' }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.8)' }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(101, 163, 13, 0.8)' }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.8)' }}></div>
              </div>
              <span>Strong</span>
            </div>
          </div>
        )}
      </div>

      {/* Planet Strengths Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Individual Planet Strengths
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planets.map(planet => (
            <div key={planet} className={`p-3 rounded-lg border ${getPlanetColor(planet)}`}>
              <div className="text-sm font-medium">{planet}</div>
              <div className="text-lg font-bold">
                {(data.summary?.planet_strengths?.[planet] || 0).toFixed(1)}
              </div>
              <div className="text-xs opacity-75">
                {data.individual_charts?.[planet]?.total_points || 0} total points
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Ashtakavarga System
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>Ashtakavarga:</strong> Eight-fold division system for planetary strength</div>
          <div><strong>Sarvashtakavarga:</strong> Combined chart of all planets</div>
          <div><strong>Points:</strong> Benefic contributions from 8 sources (7 planets + Ascendant)</div>
          <div><strong>Higher points:</strong> Stronger and more favorable house</div>
        </div>
      </div>
    </div>
  );
};

export default AshtakavargaDisplay;
