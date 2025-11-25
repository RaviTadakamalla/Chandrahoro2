import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Users, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SignificatorData {
  house_number: number;
  cusp_longitude: number;
  cusp_sign: string;
  cusp_star_lord: string;
  cusp_sub_lord: string;
  cusp_sub_sub_lord: string;
  significators: {
    strong: {
      planets: string[];
      description: string;
    };
    medium: {
      planets: string[];
      description: string;
    };
    weak: {
      planets: string[];
      description: string;
    };
  };
  detailed_breakdown: {
    step_1_occupants: string[];
    step_2_owners: string[];
    step_3_star_of_occupants: string[];
    step_4_star_of_owners: string[];
    step_5_aspecting: string[];
    step_6_star_of_aspecting: string[];
  };
  all_significators: string[];
}

interface PlanetSignificatorData {
  by_occupation: number[];
  by_ownership: number[];
  by_star_lordship: number[];
  by_aspect: number[];
  by_sub_lordship: number[];
  all_houses: number[];
}

interface KPSignificatorsProps {
  houseSignificators: Record<string, SignificatorData>;
  planetSignificators: Record<string, PlanetSignificatorData>;
}

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

// Strength color configurations
const STRENGTH_COLORS: Record<string, string> = {
  Strong: 'bg-green-500 text-white',
  Medium: 'bg-yellow-500 text-white',
  Weak: 'bg-orange-500 text-white',
};

export default function KPSignificators({ houseSignificators, planetSignificators }: KPSignificatorsProps) {
  const [expandedHouses, setExpandedHouses] = useState<Set<number>>(new Set());

  const toggleHouse = (houseNum: number) => {
    const newExpanded = new Set(expandedHouses);
    if (newExpanded.has(houseNum)) {
      newExpanded.delete(houseNum);
    } else {
      newExpanded.add(houseNum);
    }
    setExpandedHouses(newExpanded);
  };

  const getPlanetColor = (planet: string): string => {
    return PLANET_COLORS[planet] || 'bg-slate-100 text-slate-800';
  };

  const getStrengthColor = (strength: string): string => {
    return STRENGTH_COLORS[strength] || 'bg-gray-500 text-white';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-500" />
          KP Significators
        </CardTitle>
        <CardDescription>
          6-step significator calculation for houses and planets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="houses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="houses">House-wise</TabsTrigger>
            <TabsTrigger value="planets">Planet-wise</TabsTrigger>
          </TabsList>

          {/* House-wise Significators */}
          <TabsContent value="houses" className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Significators are planets that can give results of a house. The <strong>cusp sub-lord</strong> is 
                  the most powerful, followed by occupants, owners, and their star lords.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(houseSignificators)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([houseNum, data]) => {
                  const isExpanded = expandedHouses.has(parseInt(houseNum));
                  
                  return (
                    <div 
                      key={houseNum}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer"
                        onClick={() => toggleHouse(parseInt(houseNum))}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-semibold">
                            House {houseNum}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {data.significators?.strong?.planets?.slice(0, 3).map((planet, idx) => (
                              <Badge key={idx} className={`${getPlanetColor(planet)} text-xs`}>
                                {planet}
                              </Badge>
                            )) || null}
                            {(data.all_significators?.length || 0) > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(data.all_significators?.length || 0) - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-background">
                          {/* Cusp Sub-Lord */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              Cusp Sub-Lord (Most Powerful)
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>The sub-lord determines the final result of the house</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </h4>
                            <Badge className={`${getPlanetColor(data.cusp_sub_lord)} font-semibold border-2`}>
                              {data.cusp_sub_lord}
                            </Badge>
                          </div>

                          {/* Strong Significators */}
                          {(data.significators?.strong?.planets?.length || 0) > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-green-700 dark:text-green-400">
                                Strong Significators
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {data.significators.strong.planets.map((planet, idx) => (
                                  <Badge key={idx} className={getPlanetColor(planet)}>
                                    {planet}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {data.significators.strong.description}
                              </p>
                            </div>
                          )}

                          {/* Medium Significators */}
                          {(data.significators?.medium?.planets?.length || 0) > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-yellow-700 dark:text-yellow-400">
                                Medium Significators
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {data.significators.medium.planets.map((planet, idx) => (
                                  <Badge key={idx} className={getPlanetColor(planet)}>
                                    {planet}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {data.significators.medium.description}
                              </p>
                            </div>
                          )}

                          {/* Weak Significators */}
                          {(data.significators?.weak?.planets?.length || 0) > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-orange-700 dark:text-orange-400">
                                Weak Significators
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {data.significators.weak.planets.map((planet, idx) => (
                                  <Badge key={idx} className={getPlanetColor(planet)}>
                                    {planet}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {data.significators.weak.description}
                              </p>
                            </div>
                          )}

                          {/* Detailed Breakdown */}
                          <div className="pt-3 border-t border-border">
                            <h4 className="text-sm font-semibold mb-3">6-Step Calculation Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Step 1 - Occupants:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(data.detailed_breakdown?.step_1_occupants?.length || 0) > 0 ? (
                                    data.detailed_breakdown.step_1_occupants.map((p, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Step 2 - Owners:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(data.detailed_breakdown?.step_2_owners?.length || 0) > 0 ? (
                                    data.detailed_breakdown.step_2_owners.map((p, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Step 3 - Star of Occupants:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(data.detailed_breakdown?.step_3_star_of_occupants?.length || 0) > 0 ? (
                                    data.detailed_breakdown.step_3_star_of_occupants.map((p, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Step 4 - Star of Owners:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(data.detailed_breakdown?.step_4_star_of_owners?.length || 0) > 0 ? (
                                    data.detailed_breakdown.step_4_star_of_owners.map((p, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Step 5 - Aspecting:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(data.detailed_breakdown?.step_5_aspecting?.length || 0) > 0 ? (
                                    data.detailed_breakdown.step_5_aspecting.map((p, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Step 6 - Star of Aspecting:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(data.detailed_breakdown?.step_6_star_of_aspecting?.length || 0) > 0 ? (
                                    data.detailed_breakdown.step_6_star_of_aspecting.map((p, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          {/* Planet-wise Significators */}
          <TabsContent value="planets" className="space-y-4 mt-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Shows which houses each planet signifies. A planet gives results of the houses it signifies
                  during its dasha/antardasha period.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(planetSignificators)
                .sort(([a], [b]) => {
                  const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([planetName, data]) => {
                  // Calculate strength based on number of houses signified
                  const totalHouses = data.all_houses?.length || 0;
                  const strength = totalHouses >= 4 ? 'Strong' : totalHouses >= 2 ? 'Medium' : 'Weak';

                  return (
                    <Card key={planetName} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`${getPlanetColor(planetName)} font-semibold`}>
                            {planetName}
                          </Badge>
                          <Badge className={getStrengthColor(strength)} variant="secondary">
                            {strength}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">All Houses Signified</h4>
                          <div className="flex flex-wrap gap-1">
                            {(data.all_houses?.length || 0) > 0 ? (
                              data.all_houses.map((house, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {house}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs space-y-1 pt-2 border-t border-border">
                          {(data.by_occupation?.length || 0) > 0 && (
                            <div>
                              <span className="text-muted-foreground">By Occupation: </span>
                              <span>{data.by_occupation.join(', ')}</span>
                            </div>
                          )}
                          {(data.by_ownership?.length || 0) > 0 && (
                            <div>
                              <span className="text-muted-foreground">By Ownership: </span>
                              <span>{data.by_ownership.join(', ')}</span>
                            </div>
                          )}
                          {(data.by_aspect?.length || 0) > 0 && (
                            <div>
                              <span className="text-muted-foreground">By Aspect: </span>
                              <span>{data.by_aspect.join(', ')}</span>
                            </div>
                          )}
                          {(data.by_star_lordship?.length || 0) > 0 && (
                            <div>
                              <span className="text-muted-foreground">By Star Lordship: </span>
                              <span>{data.by_star_lordship.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

