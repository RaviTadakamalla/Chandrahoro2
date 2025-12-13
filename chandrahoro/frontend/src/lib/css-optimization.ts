/**
 * CSS optimization utilities for better performance
 */

/**
 * Critical CSS extraction and inlining
 */
export interface CriticalCSSConfig {
  width: number;
  height: number;
  timeout: number;
  extract: boolean;
  inline: boolean;
}

/**
 * CSS class name optimization for production
 */
export function optimizeClassName(className: string): string {
  if (process.env.NODE_ENV === 'production') {
    // In production, use shorter class names
    return className
      .split(' ')
      .map(cls => cls.trim())
      .filter(Boolean)
      .join(' ');
  }
  return className;
}

/**
 * Conditional class name utility with optimization
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  const filtered = classes.filter(Boolean) as string[];
  const combined = filtered.join(' ');
  return optimizeClassName(combined);
}

/**
 * CSS variable optimization
 */
export const cssVariables = {
  // Color variables
  colors: {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    accent: 'var(--accent)',
    destructive: 'var(--destructive)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
  },
  
  // Spacing variables
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  },
  
  // Typography variables
  typography: {
    fontFamily: 'var(--font-family)',
    fontSize: {
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
    },
    lineHeight: {
      tight: 'var(--line-height-tight)',
      normal: 'var(--line-height-normal)',
      relaxed: 'var(--line-height-relaxed)',
    },
  },
  
  // Animation variables
  animation: {
    duration: {
      fast: 'var(--animation-duration-fast)',
      normal: 'var(--animation-duration-normal)',
      slow: 'var(--animation-duration-slow)',
    },
    easing: {
      ease: 'var(--animation-easing-ease)',
      easeIn: 'var(--animation-easing-ease-in)',
      easeOut: 'var(--animation-easing-ease-out)',
      easeInOut: 'var(--animation-easing-ease-in-out)',
    },
  },
};

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Media query helper
 */
export function mediaQuery(breakpoint: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

/**
 * CSS-in-JS style object optimization
 */
export function optimizeStyles(styles: Record<string, any>): Record<string, any> {
  if (process.env.NODE_ENV === 'production') {
    // Remove debug styles in production
    const optimized = { ...styles };
    delete optimized.debug;
    delete optimized.debugBorder;
    delete optimized.debugBackground;
    return optimized;
  }
  return styles;
}

/**
 * Dynamic CSS loading utility
 */
export function loadCSS(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    document.head.appendChild(link);
  });
}

/**
 * CSS preloading utility
 */
export function preloadCSS(href: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);
}

/**
 * Critical CSS inlining
 */
export function inlineCriticalCSS(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
}

/**
 * CSS purging utility (for unused styles)
 */
export function purgeUnusedCSS(css: string, usedClasses: string[]): string {
  // Simple CSS purging - in production, use a proper tool like PurgeCSS
  const lines = css.split('\n');
  const purged = lines.filter(line => {
    if (line.includes('{') || line.includes('}') || line.trim() === '') {
      return true;
    }
    
    // Check if any used class is referenced in this line
    return usedClasses.some(className => line.includes(className));
  });
  
  return purged.join('\n');
}

/**
 * CSS minification utility
 */
export function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .replace(/\s*{\s*/g, '{') // Remove spaces around braces
    .replace(/;\s*/g, ';') // Remove spaces after semicolons
    .replace(/:\s*/g, ':') // Remove spaces after colons
    .trim();
}

/**
 * CSS bundling utility
 */
export class CSSBundler {
  private styles: Map<string, string> = new Map();
  
  add(id: string, css: string): void {
    this.styles.set(id, css);
  }
  
  remove(id: string): void {
    this.styles.delete(id);
  }
  
  bundle(): string {
    const combined = Array.from(this.styles.values()).join('\n');
    return minifyCSS(combined);
  }
  
  inject(): void {
    const bundled = this.bundle();
    const existingStyle = document.querySelector('style[data-css-bundle]');
    
    if (existingStyle) {
      existingStyle.textContent = bundled;
    } else {
      const style = document.createElement('style');
      style.setAttribute('data-css-bundle', 'true');
      style.textContent = bundled;
      document.head.appendChild(style);
    }
  }
  
  clear(): void {
    this.styles.clear();
    const existingStyle = document.querySelector('style[data-css-bundle]');
    if (existingStyle) {
      existingStyle.remove();
    }
  }
}

/**
 * Global CSS bundler instance
 */
export const cssBundler = new CSSBundler();

/**
 * CSS performance monitoring
 */
export function measureCSSPerformance(): {
  totalStylesheets: number;
  totalRules: number;
  unusedRules: number;
  loadTime: number;
} {
  const stylesheets = Array.from(document.styleSheets);
  let totalRules = 0;
  let unusedRules = 0;
  
  stylesheets.forEach(stylesheet => {
    try {
      const rules = Array.from(stylesheet.cssRules || []);
      totalRules += rules.length;
      
      // Simple unused rule detection (basic implementation)
      rules.forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          const selector = rule.selectorText;
          if (!document.querySelector(selector)) {
            unusedRules++;
          }
        }
      });
    } catch (error) {
      // Cross-origin stylesheets may throw errors
      console.warn('Cannot access stylesheet rules:', error);
    }
  });
  
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const loadTime = navEntry?.loadEventEnd || 0;
  
  return {
    totalStylesheets: stylesheets.length,
    totalRules,
    unusedRules,
    loadTime
  };
}

/**
 * CSS optimization recommendations
 */
export function getCSSOptimizationRecommendations(): string[] {
  const perf = measureCSSPerformance();
  const recommendations: string[] = [];
  
  if (perf.totalStylesheets > 5) {
    recommendations.push('Consider bundling CSS files to reduce HTTP requests');
  }
  
  if (perf.unusedRules > perf.totalRules * 0.3) {
    recommendations.push('Consider removing unused CSS rules to reduce bundle size');
  }
  
  if (perf.loadTime > 3000) {
    recommendations.push('Consider implementing critical CSS inlining for faster initial render');
  }
  
  const hasInlineStyles = document.querySelectorAll('[style]').length > 10;
  if (hasInlineStyles) {
    recommendations.push('Consider moving inline styles to CSS classes for better caching');
  }
  
  return recommendations;
}
