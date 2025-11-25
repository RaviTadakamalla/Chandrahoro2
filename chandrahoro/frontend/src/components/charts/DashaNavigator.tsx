import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface DashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  mahadasha_planet?: string;
  antardasha_planet?: string;
}

interface MahadashaData {
  mahadasha: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  status: 'past' | 'current' | 'future';
  is_birth_dasha?: boolean;
  current_antardasha?: string;
  antardashas: DashaPeriod[];
}

interface DashaNavigatorData {
  birth_nakshatra_lord: string;
  balance_at_birth_years: number;
  current_date: string;
  navigator_data: MahadashaData[];
  calculation_timestamp: string;
}

interface DashaNavigatorProps {
  dashaData: DashaNavigatorData;
  currentDasha?: {
    mahadasha?: DashaPeriod;
    antardasha?: DashaPeriod;
    pratyantardasha?: DashaPeriod;
  };
}

const DashaNavigator: React.FC<DashaNavigatorProps> = ({ dashaData, currentDasha }) => {
  const [expandedMahadashas, setExpandedMahadashas] = useState<Set<string>>(new Set());

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  }, []);

  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatDuration = useCallback((years: number) => {
    const totalDays = Math.round(years * 365.25);
    const yearsPart = Math.floor(years);
    const remainingDays = totalDays - (yearsPart * 365);
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;

    if (yearsPart > 0 && months > 0) {
      return `${yearsPart}y ${months}m`;
    } else if (yearsPart > 0) {
      return `${yearsPart}y ${days}d`;
    } else if (months > 0) {
      return `${months}m ${days}d`;
    } else {
      return `${days}d`;
    }
  }, []);

  const getPlanetColor = useCallback((planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'bg-orange-100 text-orange-800 border-orange-200',
      'Moon': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mars': 'bg-red-100 text-red-800 border-red-200',
      'Mercury': 'bg-green-100 text-green-800 border-green-200',
      'Jupiter': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Venus': 'bg-pink-100 text-pink-800 border-pink-200',
      'Saturn': 'bg-gray-100 text-gray-800 border-gray-200',
      'Rahu': 'bg-purple-100 text-purple-800 border-purple-200',
      'Ketu': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[planet] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  const getMahadashaBackgroundColor = useCallback((planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'bg-orange-50',
      'Moon': 'bg-blue-50',
      'Mars': 'bg-red-50',
      'Mercury': 'bg-green-50',
      'Jupiter': 'bg-yellow-50',
      'Venus': 'bg-pink-50',
      'Saturn': 'bg-gray-50',
      'Rahu': 'bg-purple-50',
      'Ketu': 'bg-indigo-50',
    };
    return colors[planet] || 'bg-gray-50';
  }, []);

  const toggleMahadasha = useCallback((planet: string) => {
    const newExpanded = new Set(expandedMahadashas);
    if (newExpanded.has(planet)) {
      newExpanded.delete(planet);
    } else {
      newExpanded.add(planet);
    }
    setExpandedMahadashas(newExpanded);
  }, [expandedMahadashas]);

  const getCurrentPeriodText = useMemo(() => {
    if (!currentDasha) return '';

    const parts = [];
    if (currentDasha.mahadasha) parts.push(currentDasha.mahadasha.planet);
    if (currentDasha.antardasha) parts.push(currentDasha.antardasha.planet);
    if (currentDasha.pratyantardasha) parts.push(currentDasha.pratyantardasha.planet);

    return parts.join(' > ');
  }, [currentDasha]);

  const currentDate = useMemo(() => new Date(dashaData.current_date), [dashaData.current_date]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Vimshottari Dasha Navigator
          </CardTitle>
          <CardDescription className="text-lg">
            [Maha Dasha & Antar Dasha]
          </CardDescription>
          <div className="mt-4 text-sm text-gray-600">
            At {formatTime(dashaData.current_date)}, {formatDate(dashaData.current_date)} (GMT +05:30:00), you are currently under the influence of
          </div>
          <div className="text-lg font-semibold text-blue-700 mt-2">
            {getCurrentPeriodText}
          </div>
        </CardHeader>
      </Card>

      {/* Dasha Periods Table Format - Matching Reference Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashaData.navigator_data.slice(0, 6).map((mahadasha, index) => {
          const isCurrent = mahadasha.status === 'current';

          return (
            <Card
              key={`${mahadasha.mahadasha}-${index}`}
              className={`${getMahadashaBackgroundColor(mahadasha.mahadasha)} ${
                isCurrent ? 'ring-2 ring-blue-400 shadow-lg' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-center">
                  {mahadasha.mahadasha}
                </CardTitle>
                <div className="text-center text-sm text-gray-600">
                  Starting at {formatDate(mahadasha.start_date)} ~ {formatTime(mahadasha.start_date)}
                </div>
                <div className="text-center text-sm text-gray-600">
                  Ending at {formatDate(mahadasha.end_date)} ~ {formatTime(mahadasha.end_date)}
                </div>
                {isCurrent && (
                  <Badge className="mx-auto bg-blue-600 text-white">
                    Current Period
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Antardasha Table */}
                <div className="space-y-1 text-xs">
                  {mahadasha.antardashas.slice(0, 9).map((antardasha, antarIndex) => {
                    const isCurrentAntar = isCurrent && mahadasha.current_antardasha === antardasha.planet;

                    return (
                      <div
                        key={`${antardasha.planet}-${antarIndex}`}
                        className={`flex justify-between items-center py-1 px-2 rounded ${
                          isCurrentAntar ? 'bg-blue-100 font-semibold border border-blue-300' : 'hover:bg-white/50'
                        }`}
                      >
                        <span className="font-medium w-16">{antardasha.planet}</span>
                        <span className="text-xs text-gray-600 flex-1 text-right">
                          {formatDate(antardasha.start_date)} ~ {formatTime(antardasha.start_date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comprehensive Table View - Matching Reference Image */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            Complete Dasha Timeline
          </CardTitle>
          <CardDescription className="text-center">
            Comprehensive view of all Mahadasha and Antardasha periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashaData.navigator_data.slice(0, 9).map((mahadasha, index) => {
                const isCurrent = mahadasha.status === 'current';

                return (
                  <div
                    key={`table-${mahadasha.mahadasha}-${index}`}
                    className={`border rounded-lg p-3 ${getMahadashaBackgroundColor(mahadasha.mahadasha)} ${
                      isCurrent ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    <div className="text-center font-bold text-lg mb-2 text-blue-700">
                      {mahadasha.mahadasha}
                    </div>
                    <div className="text-center text-xs text-gray-600 mb-3">
                      Starting at {formatDate(mahadasha.start_date)} ~ {formatTime(mahadasha.start_date)}
                    </div>
                    <div className="text-center text-xs text-gray-600 mb-3">
                      Ending at {formatDate(mahadasha.end_date)} ~ {formatTime(mahadasha.end_date)}
                    </div>

                    {/* Antardasha List */}
                    <div className="space-y-1">
                      {mahadasha.antardashas.map((antardasha, antarIndex) => {
                        const isCurrentAntar = isCurrent && mahadasha.current_antardasha === antardasha.planet;

                        return (
                          <div
                            key={`table-antar-${antardasha.planet}-${antarIndex}`}
                            className={`flex justify-between items-center text-xs py-1 px-2 rounded ${
                              isCurrentAntar ? 'bg-blue-200 font-bold border border-blue-400' : 'bg-white/30'
                            }`}
                          >
                            <span className="font-medium">{antardasha.planet}</span>
                            <span className="text-gray-700">
                              {formatDate(antardasha.start_date)} ~ {formatTime(antardasha.start_date)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show more periods if available */}
      {dashaData.navigator_data.length > 9 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-600">
              Showing first 9 Mahadasha periods. Total periods available: {dashaData.navigator_data.length}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashaNavigator;
