import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HouseCuspSubLord {
  star_lord: string;
  sub_lord: string;
  sub_sub_lord: string;
}

interface KPBasicChartProps {
  houseCusps: number[];
  houseCuspSubLords: Record<string, HouseCuspSubLord>;
}

// Sign names
const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Planet color configurations
const PLANET_COLORS: Record<string, string> = {
  Sun: 'bg-orange-100 text-orange-800',
  Moon: 'bg-blue-100 text-blue-800',
  Mars: 'bg-red-100 text-red-800',
  Mercury: 'bg-green-100 text-green-800',
  Jupiter: 'bg-yellow-100 text-yellow-800',
  Venus: 'bg-pink-100 text-pink-800',
  Saturn: 'bg-purple-100 text-purple-800',
  Rahu: 'bg-gray-100 text-gray-800',
  Ketu: 'bg-indigo-100 text-indigo-800',
};

export default function KPBasicChart({ houseCusps, houseCuspSubLords }: KPBasicChartProps) {
  const formatDegree = (degree: number): string => {
    const normalizedDegree = degree % 360;
    const signIndex = Math.floor(normalizedDegree / 30);
    const degreeInSign = normalizedDegree % 30;
    const deg = Math.floor(degreeInSign);
    const min = Math.floor((degreeInSign - deg) * 60);
    const sec = Math.floor(((degreeInSign - deg) * 60 - min) * 60);
    return `${deg}°${min}'${sec}"`;
  };

  const getSignName = (degree: number): string => {
    const normalizedDegree = degree % 360;
    const signIndex = Math.floor(normalizedDegree / 30);
    return SIGN_NAMES[signIndex];
  };

  const getPlanetColor = (planet: string): string => {
    return PLANET_COLORS[planet] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5 text-blue-500" />
          KP House Cusps & Sub-Lords
        </CardTitle>
        <CardDescription>
          Placidus house cusps with KP sub-lords (most powerful significators)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                In KP astrology, the <strong>sub-lord of the cusp</strong> is the most powerful significator 
                for that house. It determines whether the house will give positive or negative results.
              </p>
            </div>
          </div>

          {/* House Cusps Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-3 font-semibold text-sm">House</th>
                  <th className="text-left p-3 font-semibold text-sm">Cusp Position</th>
                  <th className="text-left p-3 font-semibold text-sm">Sign</th>
                  <th className="text-left p-3 font-semibold text-sm">Star Lord</th>
                  <th className="text-left p-3 font-semibold text-sm">Sub Lord</th>
                </tr>
              </thead>
              <tbody>
                {houseCusps.map((cusp, index) => {
                  const houseNum = (index + 1).toString();
                  const subLordData = houseCuspSubLords[houseNum];
                  
                  return (
                    <tr 
                      key={index} 
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold">
                            {index + 1}
                          </Badge>
                          {index === 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                    ASC
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ascendant (Lagna)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {formatDegree(cusp)}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">
                          {getSignName(cusp)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {subLordData && (
                          <Badge className={getPlanetColor(subLordData.star_lord)}>
                            {subLordData.star_lord}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {subLordData && (
                          <Badge className={`${getPlanetColor(subLordData.sub_lord)} font-semibold border-2`}>
                            {subLordData.sub_lord}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

