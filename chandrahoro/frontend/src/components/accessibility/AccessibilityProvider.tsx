'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  toggleHighContrast: () => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Accessibility Provider Component
 * 
 * Provides accessibility features and preferences management
 * for the entire application.
 * 
 * Features:
 * - High contrast mode toggle
 * - Font size adjustment
 * - Reduced motion detection
 * - Screen reader announcements
 * - Focus management utilities
 * - ARIA live region management
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Detect user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Load saved preferences
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'normal' | 'large' | 'extra-large' || 'normal';
    
    setIsHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
  }, []);
  
  // Apply accessibility classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Font size
    root.classList.remove('font-large', 'font-extra-large');
    if (fontSize === 'large') {
      root.classList.add('font-large');
    } else if (fontSize === 'extra-large') {
      root.classList.add('font-extra-large');
    }
    
    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [isHighContrast, fontSize, isReducedMotion]);
  
  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
  };
  
  const handleSetFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
  };
  
  // Screen reader announcement function
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };
  
  const value: AccessibilityContextType = {
    isHighContrast,
    isReducedMotion,
    fontSize,
    toggleHighContrast,
    setFontSize: handleSetFontSize,
    announceToScreenReader,
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* ARIA live region for announcements */}
      <div
        id="aria-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Focus Management Hook
 * 
 * Provides utilities for managing focus in the application.
 */
export function useFocusManagement() {
  const focusFirstElement = (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container || document.body);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };
  
  const focusLastElement = (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container || document.body);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  };
  
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  return {
    focusFirstElement,
    focusLastElement,
    trapFocus,
  };
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

/**
 * Keyboard Navigation Hook
 * 
 * Provides keyboard navigation utilities for components.
 */
export function useKeyboardNavigation() {
  const handleArrowNavigation = (
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  };
  
  const handleEscapeKey = (e: React.KeyboardEvent, onEscape: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape();
    }
  };
  
  const handleEnterOrSpace = (e: React.KeyboardEvent, onActivate: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };
  
  return {
    handleArrowNavigation,
    handleEscapeKey,
    handleEnterOrSpace,
  };
}
