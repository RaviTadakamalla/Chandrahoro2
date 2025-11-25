import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

export const meta: AiModuleMeta = {
  id: 'personality-insights',
  title: 'Personality Insights',
  description: 'Deep personality analysis based on planetary positions.',
  category: 'Interpretation',
  requiresChart: true,
  requiresAuth: false,
  icon: User,
  priority: 7,
};

export default function PersonalityInsightsModule({ chartData }: AiModuleProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Personality Insights</h2>
      <Card>
        <CardHeader><CardTitle>Your Cosmic Personality</CardTitle></CardHeader>
        <CardContent><p>AI-powered personality analysis coming soon.</p></CardContent>
      </Card>
    </div>
  );
}
