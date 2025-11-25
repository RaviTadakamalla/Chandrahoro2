import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Briefcase, 
  Baby, 
  GraduationCap, 
  Home, 
  Plane, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

interface EventPrediction {
  event_type: string;
  event_name: string;
  houses_involved: number[];
  common_significators: string[];
  promise_status: string; // "Promised", "Denied", "Delayed", "Uncertain"
  strength: string; // "Strong", "Medium", "Weak"
  description: string;
  sub_lord_analysis: string;
  recommendations: string[];
}

interface KPPredictionsProps {
  predictions: EventPrediction[];
}

// Event type configurations
const EVENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  marriage: {
    icon: <Heart className="h-4 w-4" />,
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  career: {
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  children: {
    icon: <Baby className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  education: {
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  property: {
    icon: <Home className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  foreign_travel: {
    icon: <Plane className="h-4 w-4" />,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  business: {
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  health: {
    icon: <Activity className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  financial_gains: {
    icon: <DollarSign className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  spiritual_growth: {
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-violet-100 text-violet-800 border-violet-300',
  },
};

// Promise status configurations
const PROMISE_STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  Promised: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
  },
  Denied: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
  },
  Delayed: {
    icon: <Clock className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
  },
  Uncertain: {
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700',
  },
};

// Strength configurations
const STRENGTH_CONFIG: Record<string, { color: string; label: string }> = {
  Strong: {
    color: 'bg-green-500 text-white',
    label: 'Strong',
  },
  Medium: {
    color: 'bg-yellow-500 text-white',
    label: 'Medium',
  },
  Weak: {
    color: 'bg-orange-500 text-white',
    label: 'Weak',
  },
};

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

export default function KPPredictions({ predictions }: KPPredictionsProps) {
  const [expandedPredictions, setExpandedPredictions] = useState<Set<number>>(new Set());

  const togglePrediction = (index: number) => {
    const newExpanded = new Set(expandedPredictions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPredictions(newExpanded);
  };

  const getPlanetColor = (planet: string): string => {
    return PLANET_COLORS[planet] || 'bg-slate-100 text-slate-800';
  };

  const getEventConfig = (eventType: string) => {
    return EVENT_TYPE_CONFIG[eventType] || {
      icon: <Sparkles className="h-4 w-4" />,
      color: 'bg-gray-100 text-gray-800 border-gray-300',
    };
  };

  const getPromiseConfig = (status: string) => {
    return PROMISE_STATUS_CONFIG[status] || PROMISE_STATUS_CONFIG.Uncertain;
  };

  const getStrengthConfig = (strength: string) => {
    return STRENGTH_CONFIG[strength] || STRENGTH_CONFIG.Weak;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          KP Event Predictions
        </CardTitle>
        <CardDescription>
          Life event predictions based on KP significators and sub-lords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction, index) => {
            const isExpanded = expandedPredictions.has(index);
            const eventConfig = getEventConfig(prediction.event_type);
            const promiseConfig = getPromiseConfig(prediction.promise_status);
            const strengthConfig = getStrengthConfig(prediction.strength);

            return (
              <div
                key={index}
                className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${promiseConfig.bgColor}`}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => togglePrediction(index)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Event Icon & Name */}
                    <div className={`p-2 rounded-lg border ${eventConfig.color}`}>
                      {eventConfig.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{prediction.event_name}</h3>
                      <p className="text-xs text-muted-foreground">{prediction.description}</p>
                    </div>

                    {/* Status & Strength Badges */}
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${promiseConfig.color}`}>
                        {promiseConfig.icon}
                        <span className="text-sm font-semibold">{prediction.promise_status}</span>
                      </div>
                      <Badge className={strengthConfig.color}>
                        {strengthConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="ml-2">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4 bg-background/50">
                    {/* Houses Involved */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Houses Involved</h4>
                      <div className="flex flex-wrap gap-2">
                        {prediction.houses_involved.map((house, idx) => (
                          <Badge key={idx} variant="outline">
                            House {house}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Common Significators */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Common Significators</h4>
                      {prediction.common_significators.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {prediction.common_significators.map((planet, idx) => (
                            <Badge key={idx} className={getPlanetColor(planet)}>
                              {planet}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No common significators found
                        </p>
                      )}
                    </div>

                    {/* Sub-Lord Analysis */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Sub-Lord Analysis</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {prediction.sub_lord_analysis}
                      </p>
                    </div>

                    {/* Recommendations */}
                    {prediction.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {prediction.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-0.5">•</span>
                              <span className="text-muted-foreground">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary Statistics */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="font-semibold mb-3">Prediction Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.filter(p => p.promise_status === 'Promised').length}
                </div>
                <div className="text-xs text-muted-foreground">Promised</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {predictions.filter(p => p.promise_status === 'Delayed').length}
                </div>
                <div className="text-xs text-muted-foreground">Delayed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {predictions.filter(p => p.promise_status === 'Denied').length}
                </div>
                <div className="text-xs text-muted-foreground">Denied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {predictions.filter(p => p.promise_status === 'Uncertain').length}
                </div>
                <div className="text-xs text-muted-foreground">Uncertain</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

