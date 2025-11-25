/**
 * ChandraHoro V2.1 - Media Query Hook
 * 
 * Custom hook for responsive design breakpoint detection.
 * Provides real-time media query matching for responsive components.
 * 
 * Features:
 * - Real-time breakpoint detection
 * - Event listener cleanup
 * - SSR-safe implementation
 */

'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
