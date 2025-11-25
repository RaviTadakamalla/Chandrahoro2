import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Crown, Briefcase, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JaiminiYoga {
  name: string;
  type: string; // 'raja', 'spiritual', 'career', 'marriage', 'wealth'
  strength: string; // 'weak', 'moderate', 'strong', 'very_strong'
  description: string;
  karakas_involved: string[];
  planets_involved: string[];
  conditions_met: string[];
  effects: string;
}

interface JaiminiYogaDisplayProps {
  jaiminiYogas: JaiminiYoga[];
}

// Yoga type configurations
const YOGA_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  raja: {
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    label: 'Raja Yoga',
  },
  career: {
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    label: 'Career Yoga',
  },
  marriage: {
    icon: <Heart className="h-4 w-4" />,
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    label: 'Marriage Yoga',
  },
  spiritual: {
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    label: 'Spiritual Yoga',
  },
  wealth: {
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-300',
    label: 'Wealth Yoga',
  },
};

// Strength configurations
const STRENGTH_CONFIG: Record<string, { color: string; label: string }> = {
  very_strong: {
    color: 'bg-emerald-500 text-white',
    label: 'Very Strong',
  },
  strong: {
    color: 'bg-green-500 text-white',
    label: 'Strong',
  },
  moderate: {
    color: 'bg-yellow-500 text-white',
    label: 'Moderate',
  },
  weak: {
    color: 'bg-orange-500 text-white',
    label: 'Weak',
  },
};

export default function JaiminiYogaDisplay({ jaiminiYogas }: JaiminiYogaDisplayProps) {
  const [expandedYogas, setExpandedYogas] = useState<Set<number>>(new Set());

  const toggleYoga = (index: number) => {
    const newExpanded = new Set(expandedYogas);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedYogas(newExpanded);
  };

  // Group yogas by type
  const yogasByType = jaiminiYogas.reduce((acc, yoga) => {
    const type = yoga.type || 'raja';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(yoga);
    return acc;
  }, {} as Record<string, JaiminiYoga[]>);

  // Count yogas by strength
  const strengthCounts = jaiminiYogas.reduce((acc, yoga) => {
    const strength = yoga.strength || 'moderate';
    acc[strength] = (acc[strength] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold mb-2">Jaimini Yogas</h3>
        <p className="text-muted-foreground">
          K.N. Rao&apos;s Jaimini yoga detection based on Chara Karakas and Rashi Drishti
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{jaiminiYogas.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Yogas</div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(strengthCounts).map(([strength, count]) => {
          const config = STRENGTH_CONFIG[strength];
          return (
            <Card key={strength}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{count}</div>
                  <Badge className={`mt-2 ${config.color}`} variant="secondary">
                    {config.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Yogas by Type */}
      {Object.entries(yogasByType).map(([type, yogas]) => {
        const typeConfig = YOGA_TYPE_CONFIG[type] || YOGA_TYPE_CONFIG.raja;
        
        return (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {typeConfig.icon}
                <CardTitle>{typeConfig.label}s</CardTitle>
                <Badge variant="outline">{yogas.length}</Badge>
              </div>
              <CardDescription>
                {type === 'raja' && 'Power, position, and success yogas'}
                {type === 'career' && 'Professional achievement and career success'}
                {type === 'marriage' && 'Partnership and marital harmony'}
                {type === 'spiritual' && 'Spiritual growth and enlightenment'}
                {type === 'wealth' && 'Financial prosperity and abundance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yogas.map((yoga, index) => {
                  const globalIndex = jaiminiYogas.indexOf(yoga);
                  const isExpanded = expandedYogas.has(globalIndex);
                  const strengthConfig = STRENGTH_CONFIG[yoga.strength] || STRENGTH_CONFIG.moderate;

                  return (
                    <div
                      key={globalIndex}
                      className={`border-2 rounded-lg p-4 ${typeConfig.color}`}
                    >
                      {/* Yoga Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{yoga.name}</h4>
                            <Badge className={strengthConfig.color} variant="secondary">
                              {strengthConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm">{yoga.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleYoga(globalIndex)}
                          className="flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {/* Karakas Involved */}
                          {yoga.karakas_involved && yoga.karakas_involved.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-1">
                                Karakas Involved:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {yoga.karakas_involved.map((karaka) => (
                                  <Badge key={karaka} variant="outline" className="text-xs">
                                    {karaka}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Planets Involved */}
                          {yoga.planets_involved && yoga.planets_involved.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-1">
                                Planets Involved:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {yoga.planets_involved.map((planet) => (
                                  <Badge key={planet} variant="outline" className="text-xs">
                                    {planet}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Conditions Met */}
                          {yoga.conditions_met && yoga.conditions_met.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-1">
                                Conditions:
                              </div>
                              <ul className="text-xs space-y-1">
                                {yoga.conditions_met.map((condition, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>{condition}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Effects */}
                          {yoga.effects && (
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-1">
                                Effects:
                              </div>
                              <p className="text-sm bg-white/50 p-2 rounded">
                                {yoga.effects}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* No Yogas Message */}
      {jaiminiYogas.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No Jaimini yogas detected in this chart.</p>
              <p className="text-sm mt-1">
                This doesn&apos;t mean the chart is weak - yogas are just one aspect of analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

