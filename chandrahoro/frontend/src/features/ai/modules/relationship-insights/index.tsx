import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

export const meta: AiModuleMeta = {
  id: 'relationship-insights',
  title: 'Relationship Insights',
  description: 'Understanding your relationship patterns and tendencies.',
  category: 'Interpretation',
  requiresChart: true,
  requiresAuth: false,
  icon: Users,
  priority: 9,
};

export default function RelationshipInsightsModule({ chartData }: AiModuleProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Relationship Insights</h2>
      <Card>
        <CardHeader><CardTitle>Relationship Patterns</CardTitle></CardHeader>
        <CardContent><p>Relationship insights coming soon.</p></CardContent>
      </Card>
    </div>
  );
}
