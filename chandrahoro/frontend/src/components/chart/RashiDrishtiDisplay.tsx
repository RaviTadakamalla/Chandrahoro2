import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, ArrowRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RashiDrishtiData {
  [signName: string]: string[];
}

interface RashiDrishtiDisplayProps {
  rashiDrishti: RashiDrishtiData;
  planets?: any; // Optional: to show which planets are in which signs
}

export default function RashiDrishtiDisplay({ rashiDrishti, planets }: RashiDrishtiDisplayProps) {
  const signOrder = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // Get planets in a sign (if planets data is provided)
  const getPlanetsInSign = (signName: string): string[] => {
    if (!planets) return [];
    
    const planetsInSign: string[] = [];
    Object.entries(planets).forEach(([planetName, planetData]: [string, any]) => {
      if (planetData.sign_name === signName) {
        planetsInSign.push(planetName);
      }
    });
    return planetsInSign;
  };

  // Get sign color based on element
  const getSignColor = (signName: string): string => {
    const fireSign = ['Aries', 'Leo', 'Sagittarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

    if (fireSign.includes(signName)) return 'bg-red-100 border-red-300 text-red-800';
    if (earthSigns.includes(signName)) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (airSigns.includes(signName)) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (waterSigns.includes(signName)) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Rashi Drishti (Sign-Based Aspects)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  In Jaimini astrology, signs aspect other signs (not planets).
                  Each sign aspects specific signs based on fixed rules.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Sign-based aspects used in Jaimini methodology
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signOrder.map((signName) => {
            const aspects = rashiDrishti[signName] || [];
            const planetsInSign = getPlanetsInSign(signName);
            const signColor = getSignColor(signName);

            return (
              <div
                key={signName}
                className="border rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${signColor} border`}>
                        {signName}
                      </Badge>
                      {planetsInSign.length > 0 && (
                        <div className="text-xs text-gray-600">
                          ({planetsInSign.join(', ')})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {aspects.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Aspects:</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    {aspects.map((aspectSign, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs ${getSignColor(aspectSign)}`}
                      >
                        {aspectSign}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Element Colors
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Fire Signs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Earth Signs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Air Signs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Water Signs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

