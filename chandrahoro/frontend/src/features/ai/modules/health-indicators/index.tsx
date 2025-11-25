import React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

export const meta: AiModuleMeta = {
  id: 'health-indicators',
  title: 'Health Indicators',
  description: 'Astrological insights into health and wellness patterns.',
  category: 'Interpretation',
  requiresChart: true,
  requiresAuth: false,
  icon: Activity,
  priority: 10,
};

export default function HealthIndicatorsModule({ chartData }: AiModuleProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Health Indicators</h2>
      <Card>
        <CardHeader><CardTitle>Wellness Insights</CardTitle></CardHeader>
        <CardContent><p>Health indicators analysis coming soon.</p></CardContent>
      </Card>
    </div>
  );
}
