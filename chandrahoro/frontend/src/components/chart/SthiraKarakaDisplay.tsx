import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Sun, Moon, Flame, MessageSquare, Sparkles, Heart, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SthiraKaraka {
  planet: string;
  houses: number[];
  significations: string[];
  life_areas: string[];
  position?: {
    sign_name?: string;
    sign_number?: number;
    degree_in_sign?: number;
    house?: number;
  };
}

interface SthiraKarakaData {
  Sun: SthiraKaraka;
  Moon: SthiraKaraka;
  Mars: SthiraKaraka;
  Mercury: SthiraKaraka;
  Jupiter: SthiraKaraka;
  Venus: SthiraKaraka;
  Saturn: SthiraKaraka;
  Rahu: SthiraKaraka;
  Ketu: SthiraKaraka;
  father_significator?: string;
  mother_significator?: string;
}

interface SthiraKarakaDisplayProps {
  sthiraKarakas: SthiraKarakaData;
}

// Planet icons and colors
const PLANET_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  Sun: { icon: <Sun className="h-5 w-5" />, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  Moon: { icon: <Moon className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  Mars: { icon: <Flame className="h-5 w-5" />, color: 'bg-red-100 text-red-800 border-red-300' },
  Mercury: { icon: <MessageSquare className="h-5 w-5" />, color: 'bg-green-100 text-green-800 border-green-300' },
  Jupiter: { icon: <Sparkles className="h-5 w-5" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  Venus: { icon: <Heart className="h-5 w-5" />, color: 'bg-pink-100 text-pink-800 border-pink-300' },
  Saturn: { icon: <Clock className="h-5 w-5" />, color: 'bg-gray-100 text-gray-800 border-gray-300' },
  Rahu: { icon: <TrendingUp className="h-5 w-5" />, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  Ketu: { icon: <TrendingDown className="h-5 w-5" />, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
};

export default function SthiraKarakaDisplay({ sthiraKarakas }: SthiraKarakaDisplayProps) {
  const formatDegree = (degree: number): string => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    return `${deg}°${min}'`;
  };

  // Get the 9 main planets (exclude father_significator and mother_significator)
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold mb-2">Sthira Karakas (Fixed Significators)</h3>
        <p className="text-muted-foreground">
          K.N. Rao&apos;s system of fixed planetary significators for life areas
        </p>
      </div>

      {/* Special Significators */}
      {(sthiraKarakas.father_significator || sthiraKarakas.mother_significator) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Primary Significators</p>
                <div className="space-y-1">
                  {sthiraKarakas.father_significator && (
                    <p>
                      <strong>Father:</strong> {sthiraKarakas.father_significator} 
                      {' '}(stronger of Sun/Venus)
                    </p>
                  )}
                  {sthiraKarakas.mother_significator && (
                    <p>
                      <strong>Mother:</strong> {sthiraKarakas.mother_significator}
                      {' '}(stronger of Moon/Venus)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Sthira Karakas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planets.map((planetName) => {
          const karaka = sthiraKarakas[planetName as keyof SthiraKarakaData] as SthiraKaraka;
          if (!karaka || typeof karaka !== 'object' || !karaka.planet) return null;

          const config = PLANET_CONFIG[planetName];
          const position = karaka.position || {};

          return (
            <Card key={planetName} className={`border-2 ${config.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <CardTitle className="text-lg">{planetName}</CardTitle>
                </div>
                {position.sign_name && (
                  <CardDescription>
                    {position.sign_name}
                    {position.degree_in_sign !== undefined && 
                      ` ${formatDegree(position.degree_in_sign)}`
                    }
                    {position.house && ` • House ${position.house}`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Houses */}
                {karaka.houses && karaka.houses.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      Houses:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {karaka.houses.map((house) => (
                        <Badge key={house} variant="outline" className="text-xs">
                          {house}th
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Significations */}
                {karaka.significations && karaka.significations.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      Significations:
                    </div>
                    <div className="text-xs space-y-0.5">
                      {karaka.significations.slice(0, 2).map((sig, idx) => (
                        <div key={idx}>• {sig}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Life Areas - Tooltip */}
                {karaka.life_areas && karaka.life_areas.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          <span>View life areas</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Life Areas:</p>
                        <ul className="text-xs space-y-0.5">
                          {karaka.life_areas.map((area, idx) => (
                            <li key={idx}>• {area}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Explanation */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Understanding Sthira Karakas</p>
              <p>
                Sthira Karakas are <strong>fixed significators</strong> - each planet always represents
                specific life areas regardless of the chart. K.N. Rao uses both Chara Karakas (variable)
                and Sthira Karakas (fixed) together for comprehensive analysis. For example, Venus is
                always the significator of the 7th house (marriage), while the Darakaraka (Chara Karaka)
                varies by chart.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Chara Karakas */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-1">Chara vs Sthira Karakas</p>
              <div className="space-y-2">
                <p>
                  <strong>Chara Karakas (Variable):</strong> Change based on planetary degrees in each chart.
                  The planet with highest degree becomes Atmakaraka, second highest becomes Amatyakaraka, etc.
                </p>
                <p>
                  <strong>Sthira Karakas (Fixed):</strong> Always the same. Sun always represents father/self,
                  Moon always represents mother/emotions, Venus always represents spouse/marriage, etc.
                </p>
                <p className="text-xs mt-2 italic">
                  K.N. Rao recommends analyzing both systems together for accurate predictions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

