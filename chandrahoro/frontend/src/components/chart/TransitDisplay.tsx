import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, AlertCircle, Star, Loader2 } from 'lucide-react';
import { ResponsiveTable } from '@/components/ui/scrollable-table';

interface TransitPlanet {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
  speed: number;
  retrograde: boolean;
}

interface TransitAspect {
  transiting_planet: string;
  natal_planet: string;
  aspect_type: string;
  orb: number;
  is_applying: boolean;
  exact_date: string;
  influence: string;
  benefic: boolean;
}

interface TransitData {
  calculation_date: string;
  current_positions: TransitPlanet[];
  message: string;
}

interface TransitDisplayProps {
  birthDetails: {
    birth_date: string;
    birth_time: string;
    latitude: number;
    longitude: number;
  };
}

const TransitDisplay: React.FC<TransitDisplayProps> = ({ birthDetails }) => {
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransitData = async () => {
      try {
        setLoading(true);

        // For now, just fetch current transits without natal chart comparison
        // The backend endpoint doesn't require birth details for basic current positions
        const response = await fetch(`/api/v1/transits/current`);
        if (!response.ok) {
          throw new Error('Failed to fetch transit data');
        }

        const result = await response.json();
        if (result.success) {
          setTransitData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch transit data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transit data');
      } finally {
        setLoading(false);
      }
    };

    fetchTransitData();
  }, [birthDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading current transits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Transits</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!transitData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No transit data available</p>
      </div>
    );
  }

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'text-orange-600 bg-orange-50 border-orange-200',
      'Moon': 'text-gray-600 bg-gray-50 border-gray-200',
      'Mercury': 'text-green-600 bg-green-50 border-green-200',
      'Venus': 'text-pink-600 bg-pink-50 border-pink-200',
      'Mars': 'text-red-600 bg-red-50 border-red-200',
      'Jupiter': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Saturn': 'text-blue-600 bg-blue-50 border-blue-200',
      'Rahu': 'text-purple-600 bg-purple-50 border-purple-200',
      'Ketu': 'text-indigo-600 bg-indigo-50 border-indigo-200'
    };
    return colors[planet] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSpeedIndicator = (speed: number, isRetrograde: boolean) => {
    if (isRetrograde) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return speed > 1 ?
      <TrendingUp className="w-4 h-4 text-green-500" /> :
      <TrendingUp className="w-4 h-4 text-blue-500" />;
  };

  const getHouseFromLongitude = (longitude: number) => {
    // Simple house calculation - this would need to be more sophisticated in a real implementation
    return Math.floor(longitude / 30) + 1;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLongitude = (longitude: number, degree: number, sign: string) => {
    return `${degree.toFixed(1)}° ${sign}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Current Transits
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Planetary movements and their effects on your natal chart
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Calculated for {formatDate(transitData.calculation_date)}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Planets</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {transitData.current_positions.length}
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-800 dark:text-red-200">Retrograde</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {transitData.current_positions.filter(p => p.retrograde).length}
          </div>
          <div className="text-xs text-red-600 dark:text-red-300">
            Moving backward
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm font-medium text-green-800 dark:text-green-200">Fast Moving</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {transitData.current_positions.filter(p => p.speed > 1).length}
          </div>
          <div className="text-xs text-green-600 dark:text-green-300">
            Above average speed
          </div>
        </div>
      </div>

      {/* Current Planetary Positions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Planetary Positions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transitData.current_positions.map((planet, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getPlanetColor(planet.planet)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{planet.planet}</span>
                {getSpeedIndicator(planet.speed, planet.retrograde)}
              </div>
              <div className="text-sm space-y-1">
                <div>House {getHouseFromLongitude(planet.longitude)}</div>
                <div>{formatLongitude(planet.longitude, planet.degree, planet.sign)}</div>
                <div className="text-xs opacity-75">
                  {planet.nakshatra} ({planet.pada})
                </div>
                <div className="text-xs opacity-75">
                  Speed: {planet.speed.toFixed(2)}°/day
                  {planet.retrograde && ' (R)'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Transit Information
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">{transitData.message}</p>
          <p>Current planetary positions are calculated for the present moment and show where each planet is located in the zodiac.</p>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Understanding Transits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>Retrograde (R):</strong> Planet appears to move backward</div>
          <div><strong>Speed:</strong> How fast the planet moves per day</div>
          <div><strong>Nakshatra:</strong> Lunar mansion (27 divisions)</div>
          <div><strong>Pada:</strong> Quarter of a nakshatra (1-4)</div>
        </div>
      </div>
    </div>
  );
};

export default TransitDisplay;
