/**
 * ChandraHoro V2.1 - Swipe Gesture Hook
 * 
 * React hook for handling touch swipe gestures on mobile devices.
 * Provides configurable swipe detection with threshold and direction support.
 * 
 * Features:
 * - Left and right swipe detection
 * - Configurable swipe threshold
 * - Touch event handling
 * - TypeScript support
 * - Performance optimized
 */

'use client';

import { useRef, TouchEvent, useCallback } from 'react';

interface SwipeOptions {
  /**
   * Minimum distance in pixels to trigger a swipe
   * @default 50
   */
  threshold?: number;
  /**
   * Minimum velocity required for swipe detection
   * @default 0.3
   */
  velocity?: number;
  /**
   * Maximum time in milliseconds for a valid swipe
   * @default 300
   */
  maxTime?: number;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options: SwipeOptions = {}
): SwipeHandlers {
  const {
    threshold = 50,
    velocity = 0.3,
    maxTime = 300,
  } = options;
  
  const touchData = useRef<TouchData | null>(null);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
    };
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchData.current) return;
    
    const touch = e.touches[0];
    touchData.current.currentX = touch.clientX;
    touchData.current.currentY = touch.clientY;
  }, []);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchData.current) return;
    
    const {
      startX,
      startY,
      startTime,
      currentX,
      currentY,
    } = touchData.current;
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const deltaTime = Date.now() - startTime;
    
    // Check if swipe is within time limit
    if (deltaTime > maxTime) {
      touchData.current = null;
      return;
    }
    
    // Calculate distances and velocity
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const velocityX = absX / deltaTime;
    const velocityY = absY / deltaTime;
    
    // Determine if this is a valid swipe
    const isHorizontalSwipe = absX > absY && absX > threshold && velocityX > velocity;
    const isVerticalSwipe = absY > absX && absY > threshold && velocityY > velocity;
    
    if (isHorizontalSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (isVerticalSwipe) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    touchData.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocity, maxTime]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Simplified hook for horizontal swipes only
 */
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options: SwipeOptions = {}
): SwipeHandlers {
  return useSwipe(onSwipeLeft, onSwipeRight, undefined, undefined, options);
}

/**
 * Simplified hook for vertical swipes only
 */
export function useVerticalSwipe(
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options: SwipeOptions = {}
): SwipeHandlers {
  return useSwipe(undefined, undefined, onSwipeUp, onSwipeDown, options);
}

/**
 * Hook for detecting tap gestures
 */
export function useTap(
  onTap?: () => void,
  options: { maxTime?: number; maxDistance?: number } = {}
): SwipeHandlers {
  const { maxTime = 200, maxDistance = 10 } = options;
  
  const touchData = useRef<TouchData | null>(null);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
    };
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchData.current) return;
    
    const touch = e.touches[0];
    touchData.current.currentX = touch.clientX;
    touchData.current.currentY = touch.clientY;
  }, []);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchData.current) return;
    
    const {
      startX,
      startY,
      startTime,
      currentX,
      currentY,
    } = touchData.current;
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const deltaTime = Date.now() - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Check if this is a valid tap
    if (deltaTime <= maxTime && distance <= maxDistance && onTap) {
      onTap();
    }
    
    touchData.current = null;
  }, [onTap, maxTime, maxDistance]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
