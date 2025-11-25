/**
 * Dasha Predictions AI Module
 * 
 * AI-powered predictions for current and upcoming Dasha periods
 */

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

// Module metadata
export const meta: AiModuleMeta = {
  id: 'dasha-predictions',
  title: 'Dasha Period Predictions',
  description: 'AI-powered insights into your current and upcoming Dasha periods, including opportunities, challenges, and timing guidance.',
  category: 'Prediction',
  requiresChart: true,
  requiresAuth: false,
  featureFlag: 'dasha-predictions',
  icon: Clock,
  priority: 2,
};

// Main component
export default function DashaPredictionsModule({ chartData, onClose }: AiModuleProps) {
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Simulate AI analysis of dasha data
    const analyzeDashas = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock predictions based on chart data
        // Safely extract planet name from various possible data structures
        let planetName = 'Venus'; // Default fallback
        if (chartData?.current_dasha) {
          if (typeof chartData.current_dasha.planet === 'string') {
            planetName = chartData.current_dasha.planet;
          } else if (chartData.current_dasha.mahadasha?.planet) {
            planetName = chartData.current_dasha.mahadasha.planet;
          }
        }

        const mockPredictions = {
          currentDasha: {
            planet: planetName,
            period: '2023-2030',
            phase: 'Middle Phase',
            influence: 'Positive',
            keyThemes: ['Relationships', 'Creativity', 'Material Growth', 'Harmony'],
            opportunities: [
              'Favorable time for partnerships and collaborations',
              'Creative projects will flourish',
              'Financial stability and growth likely',
              'Good period for artistic pursuits'
            ],
            challenges: [
              'Tendency towards overindulgence',
              'Need to balance material and spiritual pursuits',
              'Possible relationship complications if Venus is afflicted'
            ]
          },
          upcomingDasha: {
            planet: 'Sun',
            startDate: '2030-03-15',
            duration: '6 years',
            preparation: [
              'Focus on building leadership skills',
              'Strengthen relationship with father figures',
              'Prepare for increased responsibilities',
              'Work on self-confidence and authority'
            ]
          }
        };
        
        setPredictions(mockPredictions);
      } catch (err) {
        setError('Failed to analyze Dasha periods');
      } finally {
        setLoading(false);
      }
    };

    if (chartData) {
      analyzeDashas();
    }
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
        <span className="ml-3 text-gray-600">Analyzing your Dasha periods...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal dark:text-white">Dasha Period Predictions</h2>
        <p className="text-gray-600 dark:text-gray-300">
          AI insights into your planetary periods and their influences
        </p>
      </div>

      {/* Current Dasha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-saffron-500" />
            Current Mahadasha: {predictions?.currentDasha?.planet}
          </CardTitle>
          <CardDescription>
            {predictions?.currentDasha?.period} • {predictions?.currentDasha?.phase}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={predictions?.currentDasha?.influence === 'Positive' ? 'default' : 'secondary'}>
              {predictions?.currentDasha?.influence} Influence
            </Badge>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Themes</h4>
            <div className="flex flex-wrap gap-2">
              {predictions?.currentDasha?.keyThemes?.map((theme: string, index: number) => (
                <Badge key={index} variant="outline">{theme}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Opportunities</h4>
            <ul className="space-y-1">
              {predictions?.currentDasha?.opportunities?.map((opp: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">Challenges to Watch</h4>
            <ul className="space-y-1">
              {predictions?.currentDasha?.challenges?.map((challenge: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Dasha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Upcoming: {predictions?.upcomingDasha?.planet} Dasha
          </CardTitle>
          <CardDescription>
            Starts {predictions?.upcomingDasha?.startDate} • Duration: {predictions?.upcomingDasha?.duration}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h4 className="font-semibold mb-2">Preparation Recommendations</h4>
            <ul className="space-y-1">
              {predictions?.upcomingDasha?.preparation?.map((prep: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {prep}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Dasha predictions are based on traditional Vedic principles and AI analysis. 
          Individual experiences may vary based on personal karma and free will.
        </AlertDescription>
      </Alert>
    </div>
  );
}
