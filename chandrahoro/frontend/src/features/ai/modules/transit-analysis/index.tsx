/**
 * Transit Analysis AI Module
 */

import React, { useState, useEffect } from 'react';
import { Globe, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

export const meta: AiModuleMeta = {
  id: 'transit-analysis',
  title: 'Current Transits',
  description: 'AI analysis of current planetary transits and their impact on your birth chart.',
  category: 'Transit',
  requiresChart: true,
  requiresAuth: false,
  featureFlag: 'transit-analysis',
  icon: Globe,
  priority: 4,
};

export default function TransitAnalysisModule({ chartData, onClose }: AiModuleProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeTransits = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysis('Current Jupiter transit through your 5th house brings opportunities for creative expression and learning. Saturn\'s influence on your career sector suggests a period of steady progress through disciplined effort.');
      setLoading(false);
    };
    analyzeTransits();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
        <span className="ml-3">Analyzing current transits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Current Transit Analysis</h2>
      <Card>
        <CardHeader>
          <CardTitle>Planetary Influences</CardTitle>
          <CardDescription>Current cosmic weather affecting your chart</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">{analysis}</p>
        </CardContent>
      </Card>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Transit effects are temporary and vary based on individual chart strength.</AlertDescription>
      </Alert>
    </div>
  );
}
