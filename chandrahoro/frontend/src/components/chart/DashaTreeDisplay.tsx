import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';

interface DashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current?: boolean;
  is_birth_dasha?: boolean;
}

interface AntardashaData extends DashaPeriod {
  mahadasha_planet: string;
  pratyantardashas?: PratyantardashaData[];
}

interface PratyantardashaData extends DashaPeriod {
  antardasha_planet: string;
  mahadasha_planet: string;
}

interface MahadashaData extends DashaPeriod {
  antardashas?: AntardashaData[];
}

interface DashaTreeDisplayProps {
  dashaTimeline: MahadashaData[];
  currentDasha?: {
    mahadasha?: DashaPeriod;
    antardasha?: AntardashaData;
    pratyantardasha?: PratyantardashaData;
  };
}

const DashaTreeDisplay: React.FC<DashaTreeDisplayProps> = ({ dashaTimeline, currentDasha }) => {
  const [expandedMahadashas, setExpandedMahadashas] = useState<Set<string>>(new Set());
  const [expandedAntardashas, setExpandedAntardashas] = useState<Set<string>>(new Set());

  // Auto-expand current periods
  React.useEffect(() => {
    if (currentDasha?.mahadasha) {
      setExpandedMahadashas(prev => new Set([...prev, currentDasha.mahadasha!.planet]));
    }
    if (currentDasha?.antardasha) {
      const key = `${currentDasha.mahadasha?.planet}-${currentDasha.antardasha.planet}`;
      setExpandedAntardashas(prev => new Set([...prev, key]));
    }
  }, [currentDasha]);

  const toggleMahadasha = (planet: string) => {
    setExpandedMahadashas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planet)) {
        newSet.delete(planet);
      } else {
        newSet.add(planet);
      }
      return newSet;
    });
  };

  const toggleAntardasha = (mahadashaPlanet: string, antardashaPlanet: string) => {
    const key = `${mahadashaPlanet}-${antardashaPlanet}`;
    setExpandedAntardashas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (years: number) => {
    if (years >= 1) {
      return `${years.toFixed(1)} years`;
    } else {
      const months = Math.round(years * 12);
      return `${months} months`;
    }
  };

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

  const isCurrentPeriod = (period: DashaPeriod, level: 'maha' | 'antar' | 'pratyantar') => {
    if (!currentDasha) return false;
    
    switch (level) {
      case 'maha':
        return currentDasha.mahadasha?.planet === period.planet;
      case 'antar':
        return currentDasha.antardasha?.planet === period.planet;
      case 'pratyantar':
        return currentDasha.pratyantardasha?.planet === period.planet;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Vimshottari Dasha Timeline
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          120-year planetary period system with hierarchical breakdown
        </p>
      </div>

      {/* Current Dasha Summary */}
      {currentDasha && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Running Periods</h4>
          <div className="space-y-2 text-sm">
            {currentDasha.mahadasha && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Mahādasha:</span>
                <span className={`px-2 py-1 rounded-full text-xs border ${getPlanetColor(currentDasha.mahadasha.planet)}`}>
                  {currentDasha.mahadasha.planet}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(currentDasha.mahadasha.start_date)} - {formatDate(currentDasha.mahadasha.end_date)}
                </span>
              </div>
            )}
            {currentDasha.antardasha && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Antaradasha:</span>
                <span className={`px-2 py-1 rounded-full text-xs border ${getPlanetColor(currentDasha.antardasha.planet)}`}>
                  {currentDasha.antardasha.planet}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(currentDasha.antardasha.start_date)} - {formatDate(currentDasha.antardasha.end_date)}
                </span>
              </div>
            )}
            {currentDasha.pratyantardasha && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Pratyantardasha:</span>
                <span className={`px-2 py-1 rounded-full text-xs border ${getPlanetColor(currentDasha.pratyantardasha.planet)}`}>
                  {currentDasha.pratyantardasha.planet}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(currentDasha.pratyantardasha.start_date)} - {formatDate(currentDasha.pratyantardasha.end_date)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dasha Tree */}
      <div className="space-y-2">
        {dashaTimeline.map((mahadasha, mahaIndex) => {
          const isExpanded = expandedMahadashas.has(mahadasha.planet);
          const isCurrent = isCurrentPeriod(mahadasha, 'maha');
          
          return (
            <div key={mahaIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Mahadasha Header */}
              <div 
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isCurrent ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => toggleMahadasha(mahadasha.planet)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPlanetColor(mahadasha.planet)}`}>
                      {mahadasha.planet} Mahādasha
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(mahadasha.start_date)} - {formatDate(mahadasha.end_date)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDuration(mahadasha.duration_years)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Antardashas */}
              {isExpanded && mahadasha.antardashas && (
                <div className="bg-gray-50 dark:bg-gray-800/50">
                  {mahadasha.antardashas.map((antardasha, antarIndex) => {
                    const antarKey = `${mahadasha.planet}-${antardasha.planet}`;
                    const isAntarExpanded = expandedAntardashas.has(antarKey);
                    const isAntarCurrent = isCurrentPeriod(antardasha, 'antar');
                    
                    return (
                      <div key={antarIndex} className="border-t border-gray-200 dark:border-gray-700">
                        {/* Antardasha Header */}
                        <div 
                          className={`p-3 pl-8 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isAntarCurrent ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''
                          }`}
                          onClick={() => toggleAntardasha(mahadasha.planet, antardasha.planet)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isAntarExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <span className={`px-2 py-1 rounded-full text-xs border ${getPlanetColor(antardasha.planet)}`}>
                                {antardasha.planet} Antaradasha
                              </span>
                              {isAntarCurrent && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-3">
                              <span>{formatDate(antardasha.start_date)} - {formatDate(antardasha.end_date)}</span>
                              <span>{formatDuration(antardasha.duration_years)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pratyantardashas */}
                        {isAntarExpanded && antardasha.pratyantardashas && (
                          <div className="bg-gray-100 dark:bg-gray-700/50">
                            {antardasha.pratyantardashas.map((pratyantar, pratyIndex) => {
                              const isPratyantarCurrent = isCurrentPeriod(pratyantar, 'pratyantar');
                              
                              return (
                                <div 
                                  key={pratyIndex} 
                                  className={`p-2 pl-12 border-t border-gray-200 dark:border-gray-600 text-xs ${
                                    isPratyantarCurrent ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded-full text-xs border ${getPlanetColor(pratyantar.planet)}`}>
                                        {pratyantar.planet} Pratyantardasha
                                      </span>
                                      {isPratyantarCurrent && (
                                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                                      <span>{formatDate(pratyantar.start_date)} - {formatDate(pratyantar.end_date)}</span>
                                      <span>{formatDuration(pratyantar.duration_years)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Dasha Hierarchy
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>Mahādasha:</strong> Major period (6-20 years)</div>
          <div><strong>Antaradasha:</strong> Sub-period within Mahādasha</div>
          <div><strong>Pratyantardasha:</strong> Sub-sub-period within Antaradasha</div>
        </div>
      </div>
    </div>
  );
};

export default DashaTreeDisplay;
