import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Star, Moon, Sun } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RulingPlanets {
  day_lord: string;
  ascendant_star_lord: string;
  ascendant_sub_lord: string;
  moon_star_lord: string;
  moon_sub_lord: string;
}

interface KPRulingPlanetsProps {
  rulingPlanets: RulingPlanets;
}

// Planet color configurations
const PLANET_COLORS: Record<string, string> = {
  Sun: 'bg-orange-100 text-orange-800 border-orange-300',
  Moon: 'bg-blue-100 text-blue-800 border-blue-300',
  Mars: 'bg-red-100 text-red-800 border-red-300',
  Mercury: 'bg-green-100 text-green-800 border-green-300',
  Jupiter: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Venus: 'bg-pink-100 text-pink-800 border-pink-300',
  Saturn: 'bg-purple-100 text-purple-800 border-purple-300',
  Rahu: 'bg-gray-100 text-gray-800 border-gray-300',
  Ketu: 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

export default function KPRulingPlanets({ rulingPlanets }: KPRulingPlanetsProps) {
  const getPlanetColor = (planet: string): string => {
    return PLANET_COLORS[planet] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          KP Ruling Planets
        </CardTitle>
        <CardDescription>
          Ruling planets at the time of birth - most significant for predictions and timing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Day Lord */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <Sun className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm">Day Lord</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The lord of the weekday at birth. Highly significant for timing events.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge className={`${getPlanetColor(rulingPlanets.day_lord)} border`}>
                {rulingPlanets.day_lord}
              </Badge>
            </div>
          </div>

          {/* Ascendant Lords */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <Star className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-sm">Ascendant Lords</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Star lord and sub-lord of the Ascendant degree. Represents the self and life path.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Star Lord:</span>
                  <Badge className={`${getPlanetColor(rulingPlanets.ascendant_star_lord)} border`}>
                    {rulingPlanets.ascendant_star_lord}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Sub Lord:</span>
                  <Badge className={`${getPlanetColor(rulingPlanets.ascendant_sub_lord)} border`}>
                    {rulingPlanets.ascendant_sub_lord}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Moon Lords */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <Moon className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-sm">Moon Lords</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Star lord and sub-lord of the Moon's degree. Represents the mind and emotions.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Star Lord:</span>
                  <Badge className={`${getPlanetColor(rulingPlanets.moon_star_lord)} border`}>
                    {rulingPlanets.moon_star_lord}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Sub Lord:</span>
                  <Badge className={`${getPlanetColor(rulingPlanets.moon_sub_lord)} border`}>
                    {rulingPlanets.moon_sub_lord}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Significance Note */}
          <div className="p-4 bg-muted/50 rounded-lg border border-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> These ruling planets are the most important for KP predictions. 
              Events are most likely to occur during the dasha/antardasha periods of these planets.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

