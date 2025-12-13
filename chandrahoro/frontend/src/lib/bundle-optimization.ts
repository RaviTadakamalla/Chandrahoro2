/**
 * Bundle optimization utilities and analysis
 */

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  recommendations: string[];
  score: number;
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: ModuleInfo[];
}

export interface ModuleInfo {
  name: string;
  size: number;
  reasons: string[];
}

/**
 * Dynamic import utility with error handling
 */
export function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T,
  retries: number = 3
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const module = await importFn();
        resolve(module);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Dynamic import failed (attempt ${i + 1}/${retries}):`, error);

        // Wait before retry
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    if (fallback !== undefined) {
      console.warn('Using fallback for failed dynamic import');
      resolve(fallback);
    } else if (lastError) {
      reject(lastError);
    } else {
      reject(new Error('Dynamic import failed'));
    }
  });
}

/**
 * Preload critical chunks
 */
export function preloadChunk(chunkName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/_next/static/chunks/${chunkName}.js`;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload chunk: ${chunkName}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Lazy load non-critical chunks
 */
export function lazyLoadChunk(chunkName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `/_next/static/chunks/${chunkName}.js`;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load chunk: ${chunkName}`));
    
    document.head.appendChild(script);
  });
}

/**
 * Bundle size monitoring
 */
export class BundleSizeMonitor {
  private sizeThreshold: number;
  private callbacks: ((size: number) => void)[] = [];

  constructor(sizeThreshold: number = 200 * 1024) { // 200KB default
    this.sizeThreshold = sizeThreshold;
    this.monitorBundleSize();
  }

  private async monitorBundleSize(): Promise<void> {
    try {
      // Get performance entries for scripts
      const scriptEntries = performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/_next/static/'))
        .filter(entry => entry.name.endsWith('.js'));

      let totalSize = 0;
      scriptEntries.forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        totalSize += resourceEntry.transferSize || 0;
      });

      this.callbacks.forEach(callback => callback(totalSize));

      if (totalSize > this.sizeThreshold) {
        console.warn(`Bundle size (${this.formatBytes(totalSize)}) exceeds threshold (${this.formatBytes(this.sizeThreshold)})`);
      }
    } catch (error) {
      console.error('Failed to monitor bundle size:', error);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public subscribe(callback: (size: number) => void): () => void {
    this.callbacks.push(callback);
    
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public setThreshold(threshold: number): void {
    this.sizeThreshold = threshold;
  }
}

/**
 * Tree shaking utilities
 */
export const treeShaking = {
  /**
   * Mark modules as side-effect free
   */
  markSideEffectFree(modules: string[]): void {
    // This would be used in webpack configuration
    console.log('Marking modules as side-effect free:', modules);
  },

  /**
   * Analyze unused exports
   */
  analyzeUnusedExports(): string[] {
    // This would require build-time analysis
    // For now, return common patterns to look for
    return [
      'Unused utility functions',
      'Unused component props',
      'Unused CSS classes',
      'Unused imports'
    ];
  },

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string[] {
    return [
      'Use dynamic imports for large components',
      'Implement code splitting at route level',
      'Remove unused dependencies',
      'Use tree-shakable libraries',
      'Optimize third-party imports',
      'Use ES modules instead of CommonJS',
      'Implement lazy loading for images',
      'Use Next.js built-in optimizations'
    ];
  }
};

/**
 * Code splitting utilities
 */
export const codeSplitting = {
  /**
   * Route-based code splitting
   */
  splitByRoute(routes: string[]): Record<string, () => Promise<any>> {
    const splits: Record<string, () => Promise<any>> = {};
    
    routes.forEach(route => {
      splits[route] = () => dynamicImport(
        () => import(`../pages${route}`),
        undefined,
        3
      );
    });
    
    return splits;
  },

  /**
   * Component-based code splitting
   */
  splitByComponent(components: string[]): Record<string, () => Promise<any>> {
    const splits: Record<string, () => Promise<any>> = {};
    
    components.forEach(component => {
      splits[component] = () => dynamicImport(
        () => import(`../components/${component}`),
        undefined,
        3
      );
    });
    
    return splits;
  },

  /**
   * Feature-based code splitting
   */
  splitByFeature(features: string[]): Record<string, () => Promise<any>> {
    const splits: Record<string, () => Promise<any>> = {};
    
    features.forEach(feature => {
      splits[feature] = () => dynamicImport(
        () => import(`../features/${feature}`),
        undefined,
        3
      );
    });
    
    return splits;
  }
};

/**
 * Bundle analysis utilities
 */
export const bundleAnalysis = {
  /**
   * Analyze current bundle
   */
  async analyzeCurrent(): Promise<Partial<BundleAnalysis>> {
    try {
      const scriptEntries = performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/_next/static/'))
        .filter(entry => entry.name.endsWith('.js'));

      let totalSize = 0;
      const chunks: ChunkInfo[] = [];

      scriptEntries.forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        const size = resourceEntry.transferSize || 0;
        totalSize += size;

        chunks.push({
          name: entry.name.split('/').pop() || 'unknown',
          size,
          gzippedSize: size * 0.7, // Estimate
          modules: []
        });
      });

      const score = totalSize < 200 * 1024 ? 100 : Math.max(0, 100 - ((totalSize - 200 * 1024) / 1024));

      return {
        totalSize,
        gzippedSize: totalSize * 0.7, // Estimate
        chunks: chunks as ChunkInfo[],
        score: Math.round(score),
        recommendations: treeShaking.getRecommendations()
      };
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      return {};
    }
  },

  /**
   * Get optimization score
   */
  getOptimizationScore(analysis: Partial<BundleAnalysis>): number {
    if (!analysis.totalSize) return 0;
    
    const targetSize = 200 * 1024; // 200KB
    const actualSize = analysis.totalSize;
    
    if (actualSize <= targetSize) {
      return 100;
    }
    
    // Deduct points for every 10KB over target
    const overageKB = (actualSize - targetSize) / 1024;
    const penalty = Math.floor(overageKB / 10) * 5;
    
    return Math.max(0, 100 - penalty);
  }
};

/**
 * Global bundle size monitor
 */
export const bundleSizeMonitor = new BundleSizeMonitor();

/**
 * Optimization presets
 */
export const optimizationPresets = {
  aggressive: {
    splitChunks: true,
    treeShaking: true,
    compression: true,
    minification: true,
    deadCodeElimination: true,
  },
  
  balanced: {
    splitChunks: true,
    treeShaking: true,
    compression: true,
    minification: true,
    deadCodeElimination: false,
  },
  
  conservative: {
    splitChunks: false,
    treeShaking: true,
    compression: true,
    minification: true,
    deadCodeElimination: false,
  }
};

/**
 * Apply optimization preset
 */
export function applyOptimizationPreset(preset: keyof typeof optimizationPresets): void {
  const config = optimizationPresets[preset];
  console.log(`Applying ${preset} optimization preset:`, config);
  
  // This would be used to configure webpack/Next.js build settings
  // For now, just log the configuration
}
