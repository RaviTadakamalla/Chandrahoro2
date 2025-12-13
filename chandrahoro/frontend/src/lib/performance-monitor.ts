/**
 * Performance monitoring utilities for Core Web Vitals and Lighthouse metrics
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
  
  // Additional metrics
  timeToInteractive: number;
  speedIndex: number;
  domContentLoaded: number;
  loadComplete: number;
  
  // Resource metrics
  resourceCount: number;
  totalResourceSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  
  // Memory metrics
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceThresholds {
  firstContentfulPaint: { good: number; needsImprovement: number };
  largestContentfulPaint: { good: number; needsImprovement: number };
  cumulativeLayoutShift: { good: number; needsImprovement: number };
  firstInputDelay: { good: number; needsImprovement: number };
  totalBlockingTime: { good: number; needsImprovement: number };
}

// Core Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  firstContentfulPaint: { good: 1800, needsImprovement: 3000 },
  largestContentfulPaint: { good: 2500, needsImprovement: 4000 },
  cumulativeLayoutShift: { good: 0.1, needsImprovement: 0.25 },
  firstInputDelay: { good: 100, needsImprovement: 300 },
  totalBlockingTime: { good: 200, needsImprovement: 600 }
};

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private callbacks: ((metrics: Partial<PerformanceMetrics>) => void)[] = [];

  constructor() {
    this.initializeObservers();
    this.measureInitialMetrics();
  }

  private initializeObservers(): void {
    // Paint metrics observer
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('firstContentfulPaint', entry.startTime);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // LCP observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.updateMetric('largestContentfulPaint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // CLS observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.updateMetric('cumulativeLayoutShift', clsValue);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // FID observer
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          this.updateMetric('firstInputDelay', fid);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Navigation observer
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          const navigationStart = (navEntry as any).navigationStart || 0;
          this.updateMetric('domContentLoaded', navEntry.domContentLoadedEventEnd - navigationStart);
          this.updateMetric('loadComplete', navEntry.loadEventEnd - navigationStart);
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }
  }

  private measureInitialMetrics(): void {
    // Measure resource metrics
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.includes('.js')) {
        jsSize += size;
      } else if (resource.name.includes('.css')) {
        cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/i)) {
        imageSize += size;
      }
    });

    this.updateMetric('resourceCount', resources.length);
    this.updateMetric('totalResourceSize', totalSize);
    this.updateMetric('jsSize', jsSize);
    this.updateMetric('cssSize', cssSize);
    this.updateMetric('imageSize', imageSize);

    // Measure memory metrics
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetric('usedJSHeapSize', memory.usedJSHeapSize);
      this.updateMetric('totalJSHeapSize', memory.totalJSHeapSize);
      this.updateMetric('jsHeapSizeLimit', memory.jsHeapSizeLimit);
    }
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    this.metrics[key] = value;
    this.notifyCallbacks();
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.metrics));
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public subscribe(callback: (metrics: Partial<PerformanceMetrics>) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;
    let totalWeight = 0;

    // Weight factors for different metrics
    const weights = {
      firstContentfulPaint: 0.15,
      largestContentfulPaint: 0.25,
      cumulativeLayoutShift: 0.15,
      firstInputDelay: 0.15,
      totalBlockingTime: 0.30
    };

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = metrics[metric as keyof PerformanceMetrics];
      if (value !== undefined) {
        const threshold = PERFORMANCE_THRESHOLDS[metric as keyof PerformanceThresholds];
        let metricScore = 100;

        if (value > threshold.needsImprovement) {
          metricScore = 0;
        } else if (value > threshold.good) {
          metricScore = 50;
        }

        score -= (100 - metricScore) * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.max(0, Math.round(score)) : 0;
  }

  public getRecommendations(): string[] {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    // FCP recommendations
    if (metrics.firstContentfulPaint && metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.firstContentfulPaint.good) {
      recommendations.push('Optimize First Contentful Paint by reducing server response time and eliminating render-blocking resources');
    }

    // LCP recommendations
    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.largestContentfulPaint.good) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and preloading key resources');
    }

    // CLS recommendations
    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.cumulativeLayoutShift.good) {
      recommendations.push('Reduce Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion');
    }

    // FID recommendations
    if (metrics.firstInputDelay && metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.firstInputDelay.good) {
      recommendations.push('Improve First Input Delay by reducing JavaScript execution time and using code splitting');
    }

    // Resource size recommendations
    if (metrics.jsSize && metrics.jsSize > 500000) { // 500KB
      recommendations.push('Reduce JavaScript bundle size through code splitting and tree shaking');
    }

    if (metrics.cssSize && metrics.cssSize > 100000) { // 100KB
      recommendations.push('Optimize CSS by removing unused styles and using critical CSS inlining');
    }

    if (metrics.imageSize && metrics.imageSize > 1000000) { // 1MB
      recommendations.push('Optimize images by using modern formats (WebP, AVIF) and appropriate compression');
    }

    return recommendations;
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.callbacks = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Lighthouse-style performance audit
 */
export function runPerformanceAudit(): Promise<{
  score: number;
  metrics: Partial<PerformanceMetrics>;
  recommendations: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}> {
  return new Promise((resolve) => {
    // Wait a bit for metrics to be collected
    setTimeout(() => {
      const score = performanceMonitor.getPerformanceScore();
      const metrics = performanceMonitor.getMetrics();
      const recommendations = performanceMonitor.getRecommendations();
      
      let grade: 'A' | 'B' | 'C' | 'D' | 'F';
      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';
      else grade = 'F';

      resolve({
        score,
        metrics,
        recommendations,
        grade
      });
    }, 2000);
  });
}

/**
 * Export performance data for Lighthouse CI
 */
export function exportPerformanceData(): string {
  const metrics = performanceMonitor.getMetrics();
  const score = performanceMonitor.getPerformanceScore();
  const recommendations = performanceMonitor.getRecommendations();

  return JSON.stringify({
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    score,
    metrics,
    recommendations
  }, null, 2);
}
