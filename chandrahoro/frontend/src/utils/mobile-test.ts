/**
 * ChandraHoro V2.1 - Mobile Testing Utilities
 * 
 * Utilities for testing mobile responsiveness and functionality.
 * Provides checklist items and testing helpers for mobile optimization.
 * 
 * Features:
 * - Mobile responsiveness checklist
 * - Touch target validation
 * - Viewport testing helpers
 * - Performance testing utilities
 */

/**
 * Mobile Testing Checklist
 */
export const MOBILE_CHECKLIST = [
  '[ ] Bottom nav visible on mobile',
  '[ ] Active tab highlighted in bottom nav',
  '[ ] All buttons min 44x44px touch targets',
  '[ ] No horizontal scroll on any page',
  '[ ] Text readable without zoom (16px+)',
  '[ ] Input fields don\'t trigger zoom (iOS)',
  '[ ] Safe area insets respected (iPhone notch)',
  '[ ] Swipe gestures work on reading tabs',
  '[ ] Touch feedback (active states) present',
  '[ ] Landscape mode functional',
  '[ ] Chat input above bottom nav',
  '[ ] Chart viewport optimized for mobile',
  '[ ] Dashboard cards stack properly',
  '[ ] Forms are touch-friendly',
  '[ ] Loading states work on mobile',
  '[ ] Error states display properly',
  '[ ] Navigation flows work smoothly',
  '[ ] PWA features work (if applicable)',
];

/**
 * Touch Target Validation
 */
export interface TouchTargetResult {
  element: Element;
  width: number;
  height: number;
  isValid: boolean;
  recommendation?: string;
}

export function validateTouchTargets(): TouchTargetResult[] {
  const interactiveSelectors = [
    'button',
    'a',
    '[role="button"]',
    'input[type="submit"]',
    'input[type="button"]',
    '[tabindex]:not([tabindex="-1"])',
  ];
  
  const elements = document.querySelectorAll(interactiveSelectors.join(', '));
  const results: TouchTargetResult[] = [];
  
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const isValid = width >= 44 && height >= 44;
    
    results.push({
      element,
      width,
      height,
      isValid,
      recommendation: !isValid 
        ? `Increase size to at least 44x44px (current: ${Math.round(width)}x${Math.round(height)}px)`
        : undefined,
    });
  });
  
  return results;
}

/**
 * Viewport Testing Helpers
 */
export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasNotch: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const orientation = width > height ? 'landscape' : 'portrait';
  
  // Device type detection
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  // Notch detection (approximate)
  const hasNotch = CSS.supports('padding-top: env(safe-area-inset-top)') && 
                   window.screen.height > 800 && 
                   devicePixelRatio >= 2;
  
  // Safe area insets
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaInsets = {
    top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
  };
  
  return {
    width,
    height,
    devicePixelRatio,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    hasNotch,
    safeAreaInsets,
  };
}

/**
 * Horizontal Scroll Detection
 */
export function detectHorizontalScroll(): Element[] {
  const elements = document.querySelectorAll('*');
  const scrollingElements: Element[] = [];
  
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    
    // Check if element extends beyond viewport
    if (rect.right > window.innerWidth && style.overflowX !== 'hidden') {
      scrollingElements.push(element);
    }
  });
  
  return scrollingElements;
}

/**
 * Font Size Validation
 */
export interface FontSizeResult {
  element: Element;
  fontSize: number;
  isValid: boolean;
  recommendation?: string;
}

export function validateFontSizes(): FontSizeResult[] {
  const textElements = document.querySelectorAll('p, span, div, a, button, input, textarea, label');
  const results: FontSizeResult[] = [];
  
  textElements.forEach((element) => {
    const style = getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const isValid = fontSize >= 16; // Minimum 16px for mobile
    
    // Skip if element has no text content
    if (!element.textContent?.trim()) return;
    
    results.push({
      element,
      fontSize,
      isValid,
      recommendation: !isValid 
        ? `Increase font size to at least 16px (current: ${fontSize}px)`
        : undefined,
    });
  });
  
  return results;
}

/**
 * Performance Testing
 */
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const metrics: PerformanceMetrics = {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
  };
  
  // Paint metrics
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
  if (fcp) metrics.firstContentfulPaint = fcp.startTime;
  
  // Web Vitals (if available)
  if ('PerformanceObserver' in window) {
    try {
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // CLS
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.cumulativeLayoutShift = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
      
      // FID
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }
  }
  
  return metrics;
}

/**
 * Mobile Testing Report
 */
export interface MobileTestReport {
  viewport: ViewportInfo;
  touchTargets: TouchTargetResult[];
  fontSizes: FontSizeResult[];
  horizontalScroll: Element[];
  performance: PerformanceMetrics;
  checklist: string[];
  score: number;
}

export function generateMobileTestReport(): MobileTestReport {
  const viewport = getViewportInfo();
  const touchTargets = validateTouchTargets();
  const fontSizes = validateFontSizes();
  const horizontalScroll = detectHorizontalScroll();
  const performance = getPerformanceMetrics();
  
  // Calculate score
  const touchTargetScore = touchTargets.filter(t => t.isValid).length / touchTargets.length;
  const fontSizeScore = fontSizes.filter(f => f.isValid).length / fontSizes.length;
  const scrollScore = horizontalScroll.length === 0 ? 1 : 0;
  const score = Math.round(((touchTargetScore + fontSizeScore + scrollScore) / 3) * 100);
  
  return {
    viewport,
    touchTargets,
    fontSizes,
    horizontalScroll,
    performance,
    checklist: MOBILE_CHECKLIST,
    score,
  };
}

/**
 * Console Testing Helper
 */
export function runMobileTest(): void {
  console.group('🧪 ChandraHoro Mobile Test Report');
  
  const report = generateMobileTestReport();
  
  console.log('📱 Viewport Info:', report.viewport);
  console.log('👆 Touch Targets:', report.touchTargets.filter(t => !t.isValid));
  console.log('📝 Font Sizes:', report.fontSizes.filter(f => !f.isValid));
  console.log('↔️ Horizontal Scroll:', report.horizontalScroll);
  console.log('⚡ Performance:', report.performance);
  console.log('📋 Checklist:', report.checklist);
  console.log(`🎯 Mobile Score: ${report.score}%`);
  
  console.groupEnd();
  
  // Add to window for easy access
  (window as any).mobileTestReport = report;
  console.log('💡 Full report available at: window.mobileTestReport');
}
