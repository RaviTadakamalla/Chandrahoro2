/**
 * ChandraHoro V2.1 - Timing Windows Component
 * 
 * Displays auspicious timing windows for the day with beautiful cards.
 * Shows time ranges, activities, and astrological reasons.
 * 
 * Features:
 * - Time-based icons (morning, afternoon, evening)
 * - Colored border indicators
 * - Responsive card layout
 * - Empty state handling
 */

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimingWindow {
  window: string;
  activity: string;
  reason: string;
  type?: 'morning' | 'afternoon' | 'evening';
}

interface TimingWindowsProps {
  timings: TimingWindow[];
}

export function TimingWindows({ timings }: TimingWindowsProps) {
  // If no timings provided, show empty state
  if (!timings || timings.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Best Timing Windows
        </h3>
        
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No Specific Timing Windows</p>
          <p className="text-sm">
            All times are generally favorable for your activities today.
          </p>
        </div>
      </div>
    );
  }
  
  // Function to get icon based on time or index
  const getTimeIcon = (timing: TimingWindow, index: number) => {
    if (timing.type) {
      switch (timing.type) {
        case 'morning': return '🌅';
        case 'afternoon': return '☀️';
        case 'evening': return '🌆';
        default: return '⏰';
      }
    }
    
    // Fallback based on index
    if (index === 0) return '🌅';
    if (index === 1) return '☀️';
    if (index === 2) return '🌆';
    return '⏰';
  };
  
  // Function to get border color based on time or index
  const getBorderColor = (timing: TimingWindow, index: number) => {
    if (timing.type) {
      switch (timing.type) {
        case 'morning': return 'border-l-blue-500';
        case 'afternoon': return 'border-l-yellow-500';
        case 'evening': return 'border-l-purple-500';
        default: return 'border-l-orange-500';
      }
    }
    
    // Fallback based on index
    const colors = ['border-l-blue-500', 'border-l-yellow-500', 'border-l-purple-500', 'border-l-orange-500'];
    return colors[index % colors.length];
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Clock className="w-5 h-5 text-orange-500" />
        Best Timing Windows
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Optimal times for important activities based on planetary positions
      </p>
      
      {/* Timing Cards */}
      <div className="space-y-4">
        {timings.map((timing, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <Card className={`p-4 border-l-4 ${getBorderColor(timing, i)} hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-4">
                {/* Time Icon */}
                <div className="shrink-0 mt-1">
                  <div className="text-2xl">
                    {getTimeIcon(timing, i)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Time Window */}
                  <p className="font-semibold text-lg text-orange-600 dark:text-orange-400 mb-1">
                    {timing.window}
                  </p>
                  
                  {/* Activity */}
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                    {timing.activity}
                  </p>
                  
                  {/* Reason */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">├─</span>
                    <span>{timing.reason}</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Footer Note */}
      <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
        <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
          💡 These timings are calculated based on your birth chart and current planetary transits.
          Use them as guidance while trusting your intuition.
        </p>
      </div>
    </div>
  );
}
