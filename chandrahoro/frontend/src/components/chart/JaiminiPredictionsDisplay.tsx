import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingUp, Target, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ThreeDimensionalAnalysis {
  triangle_1_life_stages?: {
    current_age: number;
    current_stage: string;
    stage_focus: string;
    recommendations: string[];
  };
  triangle_2_purusharthas?: {
    dominant_purushartha: string;
    meaning: string;
    life_focus: string;
    balance_recommendations: string[];
  };
  triangle_3_spiritual?: {
    current_stage: string;
    description: string;
    karakamsha_sign: string;
    arudha_lagna_sign: string;
    material_spiritual_balance: string;
    spiritual_practices: string[];
  };
  synthesis?: {
    overall_life_path: string;
    current_priorities: string[];
    long_term_guidance: string;
  };
}

interface JaiminiPredictionsDisplayProps {
  threeDimensionalAnalysis?: ThreeDimensionalAnalysis;
}

export default function JaiminiPredictionsDisplay({ threeDimensionalAnalysis }: JaiminiPredictionsDisplayProps) {
  if (!threeDimensionalAnalysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Three-dimensional analysis not available.</p>
            <p className="text-sm mt-1">
              This advanced feature requires additional calculation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { triangle_1_life_stages, triangle_2_purusharthas, triangle_3_spiritual, synthesis } = threeDimensionalAnalysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold mb-2">K.N. Rao&apos;s Three-Dimensional Analysis</h3>
        <p className="text-muted-foreground">
          Comprehensive life analysis through three interconnected frameworks
        </p>
      </div>

      {/* Synthesis - Overall Life Path */}
      {synthesis && (
        <Alert className="bg-purple-50 border-purple-200">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <AlertTitle className="text-purple-900">Overall Life Path</AlertTitle>
          <AlertDescription className="text-purple-800">
            <p className="mb-3">{synthesis.overall_life_path}</p>
            {synthesis.long_term_guidance && (
              <p className="text-sm italic">{synthesis.long_term_guidance}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Triangle 1: Life Stages */}
      {triangle_1_life_stages && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>Triangle 1: Life Stages (Ashramas)</CardTitle>
            </div>
            <CardDescription>
              Current stage: <strong>{triangle_1_life_stages.current_stage.toUpperCase()}</strong> (Age: {triangle_1_life_stages.current_age})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">Stage Focus:</div>
              <p className="text-sm">{triangle_1_life_stages.stage_focus}</p>
            </div>
            {triangle_1_life_stages.recommendations && triangle_1_life_stages.recommendations.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">Recommendations:</div>
                <ul className="text-sm space-y-1">
                  {triangle_1_life_stages.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Triangle 2: Purusharthas */}
      {triangle_2_purusharthas && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <CardTitle>Triangle 2: Life Goals (Purusharthas)</CardTitle>
            </div>
            <CardDescription>
              Dominant goal: <strong>{triangle_2_purusharthas.dominant_purushartha.toUpperCase()}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</div>
              <p className="text-sm">{triangle_2_purusharthas.meaning}</p>
            </div>
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">Life Focus:</div>
              <p className="text-sm">{triangle_2_purusharthas.life_focus}</p>
            </div>
            {triangle_2_purusharthas.balance_recommendations && triangle_2_purusharthas.balance_recommendations.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">Balance Recommendations:</div>
                <ul className="text-sm space-y-1">
                  {triangle_2_purusharthas.balance_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Triangle 3: Spiritual Progression */}
      {triangle_3_spiritual && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle>Triangle 3: Spiritual Progression</CardTitle>
            </div>
            <CardDescription>
              Current stage: <strong>{triangle_3_spiritual.current_stage.replace('_', ' ').toUpperCase()}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">Description:</div>
              <p className="text-sm">{triangle_3_spiritual.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Karakamsha (Spiritual):</div>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {triangle_3_spiritual.karakamsha_sign}
                </Badge>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Arudha Lagna (Material):</div>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {triangle_3_spiritual.arudha_lagna_sign}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">Material-Spiritual Balance:</div>
              <p className="text-sm">{triangle_3_spiritual.material_spiritual_balance}</p>
            </div>
            {triangle_3_spiritual.spiritual_practices && triangle_3_spiritual.spiritual_practices.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">Recommended Practices:</div>
                <ul className="text-sm space-y-1">
                  {triangle_3_spiritual.spiritual_practices.map((practice, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Priorities */}
      {synthesis?.current_priorities && synthesis.current_priorities.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Current Life Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {synthesis.current_priorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="font-bold">{idx + 1}.</span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="font-semibold mb-1">Understanding Three-Dimensional Analysis</p>
              <p className="mb-2">
                K.N. Rao&apos;s three-dimensional analysis integrates three fundamental frameworks:
              </p>
              <ul className="space-y-1 ml-4">
                <li><strong>Triangle 1 (Life Stages):</strong> Brahmacharya, Grihastha, Vanaprastha, Sannyasa</li>
                <li><strong>Triangle 2 (Purusharthas):</strong> Dharma, Artha, Kama, Moksha</li>
                <li><strong>Triangle 3 (Spiritual):</strong> Extroversion Control, Introversion, Spiritual Blossoming</li>
              </ul>
              <p className="mt-2 text-xs italic">
                This holistic approach provides guidance for balanced development across all dimensions of life.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

