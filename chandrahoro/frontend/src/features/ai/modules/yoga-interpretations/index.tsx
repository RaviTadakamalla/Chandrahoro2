/**
 * Yoga Interpretations AI Module
 * 
 * AI-powered analysis and interpretation of yogas detected in the birth chart
 */

import React, { useState, useEffect } from 'react';
import { Star, Zap, Crown, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

// Module metadata
export const meta: AiModuleMeta = {
  id: 'yoga-interpretations',
  title: 'Yoga Interpretations',
  description: 'Discover the meaning and significance of planetary yogas in your chart with AI-powered interpretations and practical guidance.',
  category: 'Interpretation',
  requiresChart: true,
  requiresAuth: false,
  featureFlag: 'yoga-interpretations',
  icon: Star,
  priority: 3,
};

interface YogaInterpretation {
  name: string;
  type: 'Raj' | 'Dhana' | 'Spiritual' | 'Challenging' | 'Other';
  strength: 'Strong' | 'Moderate' | 'Weak';
  description: string;
  effects: string[];
  remedies?: string[];
  icon: React.ComponentType<{ className?: string }>;
}

// Main component
export default function YogaInterpretationsModule({ chartData, onClose }: AiModuleProps) {
  const [interpretations, setInterpretations] = useState<YogaInterpretation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const analyzeYogas = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock yoga interpretations based on chart data
        const mockInterpretations: YogaInterpretation[] = [
          {
            name: 'Gaja Kesari Yoga',
            type: 'Raj',
            strength: 'Strong',
            description: 'A powerful royal yoga formed by Jupiter and Moon in favorable positions. This yoga bestows wisdom, prosperity, and leadership qualities.',
            effects: [
              'Natural leadership abilities and charisma',
              'Strong intuition and wisdom',
              'Financial prosperity and stability',
              'Respect and recognition in society',
              'Good relationship with mother and maternal figures'
            ],
            icon: Crown
          },
          {
            name: 'Dhana Yoga',
            type: 'Dhana',
            strength: 'Moderate',
            description: 'A wealth-generating yoga indicating financial success through multiple sources. The combination suggests steady accumulation of resources.',
            effects: [
              'Multiple income sources',
              'Good business acumen',
              'Ability to save and invest wisely',
              'Material comfort and luxury',
              'Success in financial ventures'
            ],
            icon: Zap
          },
          {
            name: 'Hamsa Yoga',
            type: 'Spiritual',
            strength: 'Strong',
            description: 'A spiritual yoga formed by Jupiter in a kendra house. This indicates a pure soul with strong moral values and spiritual inclinations.',
            effects: [
              'Strong moral and ethical values',
              'Natural inclination towards spirituality',
              'Wisdom and philosophical thinking',
              'Good health and longevity',
              'Respect for traditions and culture'
            ],
            icon: Heart
          }
        ];
        
        setInterpretations(mockInterpretations);
      } catch (err) {
        setError('Failed to analyze yogas');
      } finally {
        setLoading(false);
      }
    };

    if (chartData) {
      analyzeYogas();
    }
  }, [chartData]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Raj': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Dhana': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Spiritual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Challenging': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Weak': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
        <span className="ml-3 text-gray-600">Analyzing yogas in your chart...</span>
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
        <h2 className="text-2xl font-bold text-charcoal dark:text-white">Yoga Interpretations</h2>
        <p className="text-gray-600 dark:text-gray-300">
          AI analysis of planetary combinations and their significance in your chart
        </p>
      </div>

      <div className="grid gap-4">
        {interpretations.map((yoga, index) => {
          const IconComponent = yoga.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-saffron-500" />
                  {yoga.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge className={getTypeColor(yoga.type)}>{yoga.type} Yoga</Badge>
                  <Badge className={getStrengthColor(yoga.strength)}>{yoga.strength}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">{yoga.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Effects & Influences</h4>
                  <ul className="space-y-1">
                    {yoga.effects.map((effect, effectIndex) => (
                      <li key={effectIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-saffron-500 mt-1">•</span>
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>

                {yoga.remedies && (
                  <div>
                    <h4 className="font-semibold mb-2">Remedial Suggestions</h4>
                    <ul className="space-y-1">
                      {yoga.remedies.map((remedy, remedyIndex) => (
                        <li key={remedyIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {remedy}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Understanding Yogas:</strong> Yogas are specific planetary combinations that create 
          unique influences in your life. Their effects depend on overall chart strength and planetary periods.
        </AlertDescription>
      </Alert>
    </div>
  );
}
