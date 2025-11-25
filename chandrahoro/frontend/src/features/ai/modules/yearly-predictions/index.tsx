/**
 * Yearly Predictions AI Module
 * 
 * AI-powered yearly astrological predictions and major life forecasts
 */

import React, { useState } from 'react';
import { Calendar, TrendingUp, Star, Clock, Target, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

// Module metadata
export const meta: AiModuleMeta = {
  id: 'yearly-predictions',
  title: 'Yearly Predictions',
  description: 'Comprehensive yearly astrological forecast with major planetary periods, important dates, and life area predictions.',
  category: 'Prediction',
  requiresChart: true,
  requiresAuth: true,
  featureFlag: 'yearly-predictions',
  icon: BarChart3,
  priority: 9,
};

// Main component
export default function YearlyPredictionsModule({ chartData, birthDetails, onClose }: AiModuleProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  // Mock preview data to show what the feature will include
  const previewData = {
    year: selectedYear,
    overallTheme: "Transformation and Growth",
    overallRating: 8.2,
    majorPeriods: [
      {
        period: "January - March",
        planet: "Saturn",
        theme: "Foundation Building",
        intensity: "High",
        description: "Focus on establishing solid foundations in career and relationships"
      },
      {
        period: "April - June", 
        planet: "Jupiter",
        theme: "Expansion & Opportunities",
        intensity: "Very High",
        description: "Major opportunities for growth, education, and spiritual development"
      },
      {
        period: "July - September",
        planet: "Mars",
        theme: "Action & Achievement",
        intensity: "Medium",
        description: "Time for decisive action and achieving long-term goals"
      },
      {
        period: "October - December",
        planet: "Venus",
        theme: "Harmony & Relationships",
        intensity: "High",
        description: "Focus on relationships, creativity, and material prosperity"
      }
    ],
    importantDates: [
      { date: "March 15", event: "Career Breakthrough", type: "opportunity" },
      { date: "June 22", event: "Relationship Milestone", type: "positive" },
      { date: "August 8", event: "Financial Decision Point", type: "caution" },
      { date: "November 11", event: "Spiritual Awakening", type: "transformation" }
    ],
    lifeAreaForecasts: {
      career: {
        score: 9,
        trend: "up",
        summary: "Exceptional year for professional growth and recognition",
        keyMonths: ["March", "June", "September"],
        opportunities: ["Leadership roles", "New ventures", "International connections"]
      },
      health: {
        score: 7,
        trend: "stable",
        summary: "Generally stable with focus needed on stress management",
        keyMonths: ["February", "August"],
        opportunities: ["Fitness routines", "Mental health practices", "Preventive care"]
      },
      relationships: {
        score: 8,
        trend: "up",
        summary: "Harmonious period with potential for deep connections",
        keyMonths: ["May", "October", "December"],
        opportunities: ["Marriage/partnership", "Family expansion", "Social networking"]
      },
      finances: {
        score: 7.5,
        trend: "up",
        summary: "Steady growth with some investment opportunities",
        keyMonths: ["April", "July", "November"],
        opportunities: ["Real estate", "Stock investments", "Business partnerships"]
      },
      spirituality: {
        score: 8.5,
        trend: "up",
        summary: "Profound spiritual growth and self-discovery",
        keyMonths: ["January", "June", "November"],
        opportunities: ["Meditation practices", "Pilgrimage", "Spiritual mentorship"]
      }
    },
    challenges: [
      {
        period: "Mid-February",
        challenge: "Communication misunderstandings",
        remedy: "Practice patience and clear communication"
      },
      {
        period: "Late August",
        challenge: "Financial stress or overspending",
        remedy: "Create strict budget and avoid impulsive purchases"
      }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500 rotate-90" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'positive': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'caution': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'transformation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'very high': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BarChart3 className="h-8 w-8 text-saffron-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Yearly Predictions</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Comprehensive yearly astrological forecast based on your birth chart and major planetary transits
        </p>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="border-saffron-200 bg-saffron-50 dark:bg-saffron-950 dark:border-saffron-800">
        <Sparkles className="h-4 w-4 text-saffron-600" />
        <AlertDescription className="text-saffron-800 dark:text-saffron-200">
          <strong>Coming Soon!</strong> This feature is currently in development. Below is a preview of what you can expect.
        </AlertDescription>
      </Alert>

      {/* Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Year for Predictions
          </CardTitle>
          <CardDescription>
            Choose a year to get comprehensive astrological forecast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Year Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {previewData.year} Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Overall Theme</h4>
              <p className="text-2xl font-bold text-saffron-600 mb-4">{previewData.overallTheme}</p>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-saffron-600">{previewData.overallRating}/10</div>
                <div className="flex-1">
                  <Progress value={previewData.overallRating * 10} className="h-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Year Rating</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Major Planetary Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Major Planetary Periods
          </CardTitle>
          <CardDescription>
            Key planetary influences throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previewData.majorPeriods.map((period, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{period.period}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ruled by {period.planet}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{period.theme}</Badge>
                    <div className={`w-3 h-3 rounded-full ${getIntensityColor(period.intensity)}`} title={`${period.intensity} Intensity`}></div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{period.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Important Dates to Watch
          </CardTitle>
          <CardDescription>
            Key dates for opportunities, challenges, and transformations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewData.importantDates.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="font-semibold text-saffron-600 min-w-[80px]">{item.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.event}</span>
                    <Badge className={getEventTypeColor(item.type)}>{item.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Life Area Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Life Area Forecasts</CardTitle>
          <CardDescription>
            Detailed predictions for different aspects of your life
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(previewData.lifeAreaForecasts).map(([area, data]) => (
              <div key={area} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize text-lg">{area}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{data.score}/10</span>
                    {getTrendIcon(data.trend)}
                  </div>
                </div>
                <Progress value={data.score * 10} className="h-2 mb-3" />
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{data.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-1">Key Months:</h5>
                    <div className="flex flex-wrap gap-1">
                      {data.keyMonths.map((month, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{month}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Opportunities:</h5>
                    <ul className="text-xs text-gray-600 dark:text-gray-400">
                      {data.opportunities.slice(0, 2).map((opp, idx) => (
                        <li key={idx}>• {opp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenges & Remedies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Challenges & Remedies
          </CardTitle>
          <CardDescription>
            Potential challenges and suggested remedies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previewData.challenges.map((item, index) => (
              <div key={index} className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">{item.period}</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">{item.challenge}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400"><strong>Remedy:</strong> {item.remedy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="text-center pt-4">
        <Button disabled className="bg-gray-400 cursor-not-allowed">
          Generate Yearly Predictions (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
