import React from 'react';
import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

export const meta: AiModuleMeta = {
  id: 'career-guidance',
  title: 'Career Guidance',
  description: 'AI insights for career path and professional development.',
  category: 'Prediction',
  requiresChart: true,
  requiresAuth: false,
  icon: Briefcase,
  priority: 8,
};

export default function CareerGuidanceModule({ chartData }: AiModuleProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Career Guidance</h2>
      <Card>
        <CardHeader><CardTitle>Professional Path</CardTitle></CardHeader>
        <CardContent><p>Career guidance based on your chart coming soon.</p></CardContent>
      </Card>
    </div>
  );
}
