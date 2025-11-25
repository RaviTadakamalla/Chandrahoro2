/**
 * ChandraHoro V2.1 - Today's Reading Card Component
 * 
 * Displays today's daily reading highlights with a call-to-action
 * to view the full reading. Features gradient background and
 * interactive elements.
 * 
 * Features:
 * - Reading highlights preview
 * - Gradient background design
 * - Navigation to full reading
 * - Badge indicators
 * - Responsive layout
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles } from 'lucide-react';

interface Reading {
  id: string;
  date: string;
  highlights?: string[];
  summary?: string;
  sections?: {
    work?: string;
    love?: string;
    health?: string;
    finance?: string;
  };
}

interface TodayReadingCardProps {
  reading: Reading;
}

export function TodayReadingCard({ reading }: TodayReadingCardProps) {
  const router = useRouter();
  
  // Extract highlights from reading data
  const highlights = reading.highlights || [
    reading.sections?.work && `Work: ${reading.sections.work.slice(0, 80)}...`,
    reading.sections?.love && `Love: ${reading.sections.love.slice(0, 80)}...`,
    reading.sections?.health && `Health: ${reading.sections.health.slice(0, 80)}...`,
  ].filter(Boolean).slice(0, 3);
  
  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-purple-50 dark:from-orange-950/20 dark:to-purple-950/20 border-orange-200 dark:border-orange-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Today's Reading
          </h2>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
          Daily
        </Badge>
      </div>
      
      {/* Highlights */}
      <div className="space-y-3 mb-6">
        {highlights.length > 0 ? (
          highlights.map((highlight: string, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {highlight}
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Your personalized daily guidance is ready to explore
            </p>
          </div>
        )}
      </div>
      
      {/* Call to Action */}
      <Button
        onClick={() => router.push('/readings/daily')}
        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white border-0"
        size="lg"
      >
        Read Full Guidance →
      </Button>
      
      {/* Footer note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Updated daily based on current planetary positions
      </p>
    </Card>
  );
}
