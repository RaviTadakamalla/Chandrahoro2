/**
 * ChandraHoro V2.1 - Reading Section Component
 * 
 * Individual section component for displaying reading content with animations.
 * Used for work, love, health, and finance sections.
 * 
 * Features:
 * - Smooth fade-in animation
 * - Formatted text with paragraphs
 * - Icon and title display
 * - Responsive typography
 */

'use client';

import { motion } from 'framer-motion';

interface ReadingSectionProps {
  title: string;
  content: string;
  icon: string;
}

export function ReadingSection({ title, content, icon }: ReadingSectionProps) {
  // Split content into paragraphs and filter out empty ones
  const paragraphs = content
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="text-gray-700 dark:text-gray-300 leading-relaxed text-base"
            >
              {paragraph}
            </motion.p>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 italic">
            No specific guidance available for this section today.
          </p>
        )}
      </div>
      
      {/* Optional: Add a subtle divider for visual separation */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Guidance based on your birth chart and current planetary transits
        </p>
      </div>
    </motion.div>
  );
}
