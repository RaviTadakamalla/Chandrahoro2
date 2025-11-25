import { useEffect, useState, useCallback } from 'react';
import { 
  cssBundler, 
  measureCSSPerformance, 
  getCSSOptimizationRecommendations,
  loadCSS,
  preloadCSS 
} from '@/lib/css-optimization';

/**
 * Hook for CSS optimization and performance monitoring
 */
export function useCSSOptimization() {
  const [performance, setPerformance] = useState({
    totalStylesheets: 0,
    totalRules: 0,
    unusedRules: 0,
    loadTime: 0
  });
  
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const measurePerformance = useCallback(() => {
    const perf = measureCSSPerformance();
    setPerformance(perf);
    
    const recs = getCSSOptimizationRecommendations();
    setRecommendations(recs);
  }, []);

  const optimizeCSS = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Bundle and inject optimized CSS
      cssBundler.inject();
      
      // Re-measure performance after optimization
      setTimeout(measurePerformance, 100);
    } catch (error) {
      console.error('CSS optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [measurePerformance]);

  const addCSSToBundle = useCallback((id: string, css: string) => {
    cssBundler.add(id, css);
  }, []);

  const removeCSSFromBundle = useCallback((id: string) => {
    cssBundler.remove(id);
  }, []);

  const clearCSSBundle = useCallback(() => {
    cssBundler.clear();
  }, []);

  const loadCSSAsync = useCallback(async (href: string) => {
    try {
      await loadCSS(href);
      measurePerformance();
    } catch (error) {
      console.error('Failed to load CSS:', error);
    }
  }, [measurePerformance]);

  const preloadCSSAsync = useCallback((href: string) => {
    preloadCSS(href);
  }, []);

  useEffect(() => {
    // Initial performance measurement
    const timer = setTimeout(measurePerformance, 1000);
    
    return () => clearTimeout(timer);
  }, [measurePerformance]);

  return {
    performance,
    recommendations,
    isOptimizing,
    measurePerformance,
    optimizeCSS,
    addCSSToBundle,
    removeCSSFromBundle,
    clearCSSBundle,
    loadCSS: loadCSSAsync,
    preloadCSS: preloadCSSAsync
  };
}

/**
 * Hook for dynamic CSS loading with optimization
 */
export function useDynamicCSS(href: string, condition: boolean = true) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!condition || !href) return;

    setIsLoading(true);
    setError(null);

    loadCSS(href)
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [href, condition]);

  return { isLoaded, isLoading, error };
}

/**
 * Hook for critical CSS management
 */
export function useCriticalCSS() {
  const [criticalCSS, setCriticalCSS] = useState<string>('');
  const [isInlined, setIsInlined] = useState(false);

  const inlineCriticalCSS = useCallback((css: string) => {
    setCriticalCSS(css);
    
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
    
    setIsInlined(true);
  }, []);

  const removeCriticalCSS = useCallback(() => {
    const criticalStyles = document.querySelectorAll('style[data-critical]');
    criticalStyles.forEach(style => style.remove());
    
    setCriticalCSS('');
    setIsInlined(false);
  }, []);

  return {
    criticalCSS,
    isInlined,
    inlineCriticalCSS,
    removeCriticalCSS
  };
}

/**
 * Hook for CSS media query optimization
 */
export function useMediaQueryOptimization() {
  const [activeBreakpoints, setActiveBreakpoints] = useState<string[]>([]);

  useEffect(() => {
    const breakpoints = {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
      '2xl': '(min-width: 1536px)',
    };

    const updateActiveBreakpoints = () => {
      const active = Object.entries(breakpoints)
        .filter(([, query]) => window.matchMedia(query).matches)
        .map(([name]) => name);
      
      setActiveBreakpoints(active);
    };

    // Initial check
    updateActiveBreakpoints();

    // Listen for changes
    const mediaQueries = Object.entries(breakpoints).map(([name, query]) => {
      const mq = window.matchMedia(query);
      mq.addListener(updateActiveBreakpoints);
      return mq;
    });

    return () => {
      mediaQueries.forEach(mq => mq.removeListener(updateActiveBreakpoints));
    };
  }, []);

  return { activeBreakpoints };
}

/**
 * Hook for CSS animation optimization
 */
export function useAnimationOptimization() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      setAnimationsEnabled(!mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addListener(updatePreference);

    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  const disableAnimations = useCallback(() => {
    setAnimationsEnabled(false);
    
    // Add CSS to disable animations
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    style.setAttribute('data-disable-animations', 'true');
    document.head.appendChild(style);
  }, []);

  const enableAnimations = useCallback(() => {
    setAnimationsEnabled(true);
    
    // Remove animation-disabling CSS
    const style = document.querySelector('style[data-disable-animations]');
    if (style) {
      style.remove();
    }
  }, []);

  return {
    prefersReducedMotion,
    animationsEnabled,
    disableAnimations,
    enableAnimations
  };
}

/**
 * Hook for CSS performance monitoring
 */
export function useCSSPerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0
  });

  useEffect(() => {
    // Monitor Core Web Vitals related to CSS
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, largestContentfulPaint: entry.startTime }));
        }
        
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          setMetrics(prev => ({ 
            ...prev, 
            cumulativeLayoutShift: prev.cumulativeLayoutShift + (entry as any).value 
          }));
        }
        
        if (entry.entryType === 'first-input') {
          setMetrics(prev => ({ 
            ...prev, 
            firstInputDelay: (entry as any).processingStart - entry.startTime 
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
}
