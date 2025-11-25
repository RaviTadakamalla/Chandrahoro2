/**
 * Daily Predictions AI Module
 * 
 * AI-powered daily astrological predictions and guidance
 */

import React, { useState } from 'react';
import { Calendar, Sun, Moon, Star, Clock, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

// Module metadata
export const meta: AiModuleMeta = {
  id: 'daily-predictions',
  title: 'Daily Predictions',
  description: 'Get personalized daily astrological predictions, planetary transits, and timing guidance for optimal decision-making.',
  category: 'Prediction',
  requiresChart: true,
  requiresAuth: true,
  featureFlag: 'daily-predictions',
  icon: Calendar,
  priority: 8,
};

// Main component
export default function DailyPredictionsModule({ chartData, birthDetails, onClose }: AiModuleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock preview data to show what the feature will include
  const previewData = {
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    overallRating: 7.5,
    luckyHours: ['6:00 AM - 8:00 AM', '2:00 PM - 4:00 PM', '8:00 PM - 10:00 PM'],
    planetaryTransits: [
      { planet: 'Moon', sign: 'Taurus', aspect: 'Favorable', influence: 'Emotional stability and material gains' },
      { planet: 'Mercury', sign: 'Gemini', aspect: 'Neutral', influence: 'Communication and learning opportunities' },
      { planet: 'Venus', sign: 'Cancer', aspect: 'Positive', influence: 'Relationships and creative pursuits' }
    ],
    recommendations: {
      favorable: [
        'Start new financial investments',
        'Schedule important meetings',
        'Focus on family relationships',
        'Engage in creative activities'
      ],
      avoid: [
        'Making impulsive decisions',
        'Traveling long distances',
        'Signing legal documents',
        'Confrontational conversations'
      ]
    },
    lifeAreas: {
      career: { score: 8, trend: 'up', note: 'Excellent day for professional growth' },
      health: { score: 6, trend: 'stable', note: 'Maintain regular routine' },
      relationships: { score: 9, trend: 'up', note: 'Harmonious interactions expected' },
      finances: { score: 7, trend: 'up', note: 'Good time for investments' }
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500 rotate-90" />;
    }
  };

  const getAspectColor = (aspect: string) => {
    switch (aspect.toLowerCase()) {
      case 'favorable': case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'challenging': case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-8 w-8 text-saffron-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Predictions</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Personalized daily astrological guidance based on your birth chart and current planetary transits
        </p>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="border-saffron-200 bg-saffron-50 dark:bg-saffron-950 dark:border-saffron-800">
        <Sparkles className="h-4 w-4 text-saffron-600" />
        <AlertDescription className="text-saffron-800 dark:text-saffron-200">
          <strong>Coming Soon!</strong> This feature is currently in development. Below is a preview of what you can expect.
        </AlertDescription>
      </Alert>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Select Date for Predictions
          </CardTitle>
          <CardDescription>
            Choose a date to get personalized astrological predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </CardContent>
      </Card>

      {/* Overall Day Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Daily Overview - {previewData.date}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold text-saffron-600">{previewData.overallRating}/10</div>
            <div className="flex-1">
              <Progress value={previewData.overallRating * 10} className="h-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Day Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lucky Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Favorable Time Periods
          </CardTitle>
          <CardDescription>
            Optimal times for important activities and decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {previewData.luckyHours.map((hour, index) => (
              <Badge key={index} variant="secondary" className="p-3 text-center">
                {hour}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planetary Transits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Today's Planetary Transits
          </CardTitle>
          <CardDescription>
            Current planetary movements affecting your chart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previewData.planetaryTransits.map((transit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="font-semibold text-saffron-600 min-w-[80px]">{transit.planet}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">in {transit.sign}</span>
                    <Badge className={getAspectColor(transit.aspect)}>{transit.aspect}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{transit.influence}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Life Areas Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Life Areas Forecast</CardTitle>
          <CardDescription>
            How different aspects of your life are influenced today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(previewData.lifeAreas).map(([area, data]) => (
              <div key={area} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold capitalize">{area}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{data.score}/10</span>
                    {getTrendIcon(data.trend)}
                  </div>
                </div>
                <Progress value={data.score * 10} className="h-2 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{data.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">✓ Favorable Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {previewData.recommendations.favorable.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">⚠ Things to Avoid</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {previewData.recommendations.avoid.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="text-center pt-4">
        <Button disabled className="bg-gray-400 cursor-not-allowed">
          Generate Daily Predictions (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
