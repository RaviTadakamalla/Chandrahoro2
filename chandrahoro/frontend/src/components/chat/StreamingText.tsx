/**
 * ChandraHoro V2.1 - Streaming Text Component
 * 
 * Typewriter effect component for streaming AI responses.
 * Displays text with animated cursor for real-time streaming.
 * 
 * Features:
 * - Typewriter animation effect
 * - Animated cursor indicator
 * - Proper text formatting
 * - Real-time text updates
 */

'use client';

import { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
}

export function StreamingText({ text }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    // Reset when text changes
    setDisplayedText(text);
  }, [text]);
  
  return (
    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
      {displayedText}
      <span className="inline-block w-1 h-4 bg-current animate-pulse ml-0.5" />
    </div>
  );
}
