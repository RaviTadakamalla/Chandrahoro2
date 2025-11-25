import React from 'react';

interface ShadbalaScore {
  sthana_bala: number;
  dig_bala: number;
  kala_bala: number;
  chesta_bala: number;
  naisargika_bala: number;
  drik_bala: number;
  total_shadbala: number;
  strength_percentage: number;
  strength_grade: string;
}

interface ShadbalaData {
  shadbala_scores: Record<string, ShadbalaScore>;
  strongest_planet: string;
  weakest_planet: string;
  average_strength: number;
}

interface ShadbalaChartProps {
  data: ShadbalaData;
}

const ShadbalaChart: React.FC<ShadbalaChartProps> = ({ data }) => {
  const planets = Object.keys(data.shadbala_scores);
  const maxScore = Math.max(...Object.values(data.shadbala_scores).map(s => s.total_shadbala));

  // Color mapping for planets
  const planetColors: Record<string, string> = {
    'Sun': '#FFA500',
    'Moon': '#C0C0C0',
    'Mercury': '#32CD32',
    'Venus': '#FF69B4',
    'Mars': '#FF4500',
    'Jupiter': '#FFD700',
    'Saturn': '#4169E1'
  };

  const getStrengthColor = (grade: string) => {
    switch (grade) {
      case 'Excellent': return 'bg-green-500';
      case 'Very Good': return 'bg-green-400';
      case 'Good': return 'bg-blue-400';
      case 'Average': return 'bg-yellow-400';
      case 'Weak': return 'bg-orange-400';
      case 'Very Weak': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Shadbala (Planetary Strengths)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Six-fold strength analysis showing each planet's power and influence
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm font-medium text-green-800 dark:text-green-200">Strongest Planet</div>
          <div className="text-lg font-bold text-green-900 dark:text-green-100">
            {data.strongest_planet}
          </div>
          <div className="text-xs text-green-600 dark:text-green-300">
            {(data.shadbala_scores[data.strongest_planet]?.total_shadbala || 0).toFixed(1)} points
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-800 dark:text-red-200">Weakest Planet</div>
          <div className="text-lg font-bold text-red-900 dark:text-red-100">
            {data.weakest_planet}
          </div>
          <div className="text-xs text-red-600 dark:text-red-300">
            {(data.shadbala_scores[data.weakest_planet]?.total_shadbala || 0).toFixed(1)} points
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Average Strength</div>
          <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {(data.average_strength || 0).toFixed(1)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-300">
            points
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {planets.map((planet) => {
          const score = data.shadbala_scores[planet];
          const percentage = (score.total_shadbala / maxScore) * 100;
          
          return (
            <div key={planet} className="space-y-2">
              {/* Planet Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: planetColors[planet] || '#6B7280' }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {planet}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${getStrengthColor(score.strength_grade)}`}>
                    {score.strength_grade}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(score.total_shadbala || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {score.strength_percentage}%
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: planetColors[planet] || '#6B7280'
                  }}
                />
              </div>
              
              {/* Detailed Breakdown (Collapsible) */}
              <details className="group">
                <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  View detailed breakdown
                </summary>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Sthana Bala:</span>
                      <span className="ml-1 font-medium">{(score.sthana_bala || 0).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Dig Bala:</span>
                      <span className="ml-1 font-medium">{(score.dig_bala || 0).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Kala Bala:</span>
                      <span className="ml-1 font-medium">{(score.kala_bala || 0).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Chesta Bala:</span>
                      <span className="ml-1 font-medium">{(score.chesta_bala || 0).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Naisargika:</span>
                      <span className="ml-1 font-medium">{(score.naisargika_bala || 0).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Drik Bala:</span>
                      <span className="ml-1 font-medium">{(score.drik_bala || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Shadbala Components
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>Sthana Bala:</strong> Positional strength (sign, house, exaltation)</div>
          <div><strong>Dig Bala:</strong> Directional strength (angular houses)</div>
          <div><strong>Kala Bala:</strong> Temporal strength (time-based factors)</div>
          <div><strong>Chesta Bala:</strong> Motional strength (speed, retrograde)</div>
          <div><strong>Naisargika Bala:</strong> Natural strength (inherent power)</div>
          <div><strong>Drik Bala:</strong> Aspectual strength (beneficial aspects)</div>
        </div>
      </div>
    </div>
  );
};

export default ShadbalaChart;
