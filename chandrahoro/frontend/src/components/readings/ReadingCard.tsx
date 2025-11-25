/**
 * ChandraHoro V2.1 - Reading Card Component
 * 
 * Animated card container for daily readings with tabbed sections.
 * Features smooth animations, responsive design, and interactive elements.
 * 
 * Features:
 * - Slide-up animation on load
 * - Tabbed navigation between sections
 * - Gradient header with actions
 * - Feedback collection
 * - Mobile-responsive tabs
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingSection } from './ReadingSection';
import { TimingWindows } from './TimingWindows';
import { ReadingActions } from './ReadingActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'highlights', label: '✨ Highlights', icon: '✨' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'love', label: 'Love', icon: '❤️' },
  { id: 'health', label: 'Health', icon: '🧘' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'timings', label: 'Timings', icon: '⏰' },
];

interface ReadingCardProps {
  reading: {
    id: string;
    readingDate: string;
    highlights?: string[];
    workReading?: string;
    loveReading?: string;
    healthReading?: string;
    financeReading?: string;
    auspiciousTimings?: any[];
    isSaved?: boolean;
  };
}

export function ReadingCard({ reading }: ReadingCardProps) {
  const [activeSection, setActiveSection] = useState('highlights');
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  
  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (feedbackType: 'helpful' | 'not_helpful') => {
      const res = await fetch(`/api/readings/${reading.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackType }),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      return res.json();
    },
    onSuccess: (_, feedbackType) => {
      setFeedback(feedbackType);
      toast.success('Thank you for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });
  
  const handleFeedback = (feedbackType: 'helpful' | 'not_helpful') => {
    feedbackMutation.mutate(feedbackType);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {new Date(reading.readingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <p className="text-orange-100 text-sm">
                Your personalized daily guidance
              </p>
            </div>
            
            <ReadingActions reading={reading} />
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto overflow-x-auto">
            {SECTIONS.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white whitespace-nowrap px-4 py-3"
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Highlights */}
          <TabsContent value="highlights" className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                Key Highlights
              </h3>
              
              {reading.highlights && reading.highlights.length > 0 ? (
                <div className="space-y-3">
                  {reading.highlights.map((highlight: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Badge variant="secondary" className="mt-1 shrink-0">
                        {i + 1}
                      </Badge>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {highlight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No highlights available for this reading.
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Work */}
          <TabsContent value="work" className="p-6">
            <ReadingSection
              title="Work & Career"
              content={reading.workReading || 'No work guidance available for this reading.'}
              icon="💼"
            />
          </TabsContent>
          
          {/* Love */}
          <TabsContent value="love" className="p-6">
            <ReadingSection
              title="Love & Relationships"
              content={reading.loveReading || 'No relationship guidance available for this reading.'}
              icon="❤️"
            />
          </TabsContent>
          
          {/* Health */}
          <TabsContent value="health" className="p-6">
            <ReadingSection
              title="Health & Wellness"
              content={reading.healthReading || 'No health guidance available for this reading.'}
              icon="🧘"
            />
          </TabsContent>
          
          {/* Finance */}
          <TabsContent value="finance" className="p-6">
            <ReadingSection
              title="Finance & Resources"
              content={reading.financeReading || 'No financial guidance available for this reading.'}
              icon="💰"
            />
          </TabsContent>
          
          {/* Timings */}
          <TabsContent value="timings" className="p-6">
            <TimingWindows timings={reading.auspiciousTimings || []} />
          </TabsContent>
        </Tabs>
        
        {/* Feedback */}
        <div className="border-t p-6 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
            Was this reading helpful?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={feedback === 'helpful' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => handleFeedback('helpful')}
              disabled={feedbackMutation.isPending || feedback !== null}
            >
              👍 Helpful
            </Button>
            <Button
              variant={feedback === 'not_helpful' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => handleFeedback('not_helpful')}
              disabled={feedbackMutation.isPending || feedback !== null}
            >
              👎 Not Helpful
            </Button>
          </div>
          
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-green-600 dark:text-green-400 mt-2"
            >
              Thank you for your feedback!
            </motion.p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
