import { useState, useEffect, useCallback } from 'react';
import { 
  bundleSizeMonitor, 
  bundleAnalysis, 
  treeShaking,
  type BundleAnalysis 
} from '@/lib/bundle-optimization';

/**
 * Hook for monitoring and optimizing bundle size
 */
export function useBundleOptimization() {
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [analysis, setAnalysis] = useState<Partial<BundleAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = bundleSizeMonitor.subscribe(setBundleSize);
    return unsubscribe;
  }, []);

  const analyzeBundle = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await bundleAnalysis.analyzeCurrent();
      setAnalysis(result);
      
      const recs = treeShaking.getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getOptimizationScore = useCallback(() => {
    return bundleAnalysis.getOptimizationScore(analysis);
  }, [analysis]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const isOptimal = useCallback(() => {
    return bundleSize < 200 * 1024; // 200KB threshold
  }, [bundleSize]);

  const getStatus = useCallback(() => {
    if (bundleSize < 150 * 1024) return 'excellent';
    if (bundleSize < 200 * 1024) return 'good';
    if (bundleSize < 300 * 1024) return 'warning';
    return 'critical';
  }, [bundleSize]);

  const getStatusColor = useCallback(() => {
    const status = getStatus();
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [getStatus]);

  return {
    bundleSize,
    analysis,
    isAnalyzing,
    recommendations,
    analyzeBundle,
    getOptimizationScore,
    formatBytes,
    isOptimal,
    getStatus,
    getStatusColor
  };
}

/**
 * Hook for dynamic import optimization
 */
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  deps: any[] = []
) {
  const [module, setModule] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadModule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedModule = await importFn();
      setModule(loadedModule);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  return { module, isLoading, error, reload: loadModule };
}

/**
 * Hook for code splitting optimization
 */
export function useCodeSplitting() {
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set());
  const [failedChunks, setFailedChunks] = useState<Set<string>>(new Set());

  const loadChunk = useCallback(async (chunkName: string) => {
    if (loadedChunks.has(chunkName)) {
      return true;
    }

    try {
      // Simulate chunk loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLoadedChunks(prev => new Set([...prev, chunkName]));
      setFailedChunks(prev => {
        const newSet = new Set(prev);
        newSet.delete(chunkName);
        return newSet;
      });
      
      return true;
    } catch (error) {
      setFailedChunks(prev => new Set([...prev, chunkName]));
      return false;
    }
  }, [loadedChunks]);

  const preloadChunk = useCallback(async (chunkName: string) => {
    // Preload chunk without blocking
    setTimeout(() => loadChunk(chunkName), 0);
  }, [loadChunk]);

  const isChunkLoaded = useCallback((chunkName: string) => {
    return loadedChunks.has(chunkName);
  }, [loadedChunks]);

  const isChunkFailed = useCallback((chunkName: string) => {
    return failedChunks.has(chunkName);
  }, [failedChunks]);

  return {
    loadedChunks: Array.from(loadedChunks),
    failedChunks: Array.from(failedChunks),
    loadChunk,
    preloadChunk,
    isChunkLoaded,
    isChunkFailed
  };
}

/**
 * Hook for tree shaking optimization
 */
export function useTreeShaking() {
  const [unusedExports, setUnusedExports] = useState<string[]>([]);
  const [optimizationTips, setOptimizationTips] = useState<string[]>([]);

  useEffect(() => {
    // Analyze unused exports
    const unused = treeShaking.analyzeUnusedExports();
    setUnusedExports(unused);
    
    // Get optimization tips
    const tips = treeShaking.getRecommendations();
    setOptimizationTips(tips);
  }, []);

  const markSideEffectFree = useCallback((modules: string[]) => {
    treeShaking.markSideEffectFree(modules);
  }, []);

  return {
    unusedExports,
    optimizationTips,
    markSideEffectFree
  };
}

/**
 * Hook for performance budget monitoring
 */
export function usePerformanceBudget(budget: {
  maxBundleSize: number;
  maxChunkSize: number;
  maxAssetSize: number;
}) {
  const [violations, setViolations] = useState<string[]>([]);
  const [isWithinBudget, setIsWithinBudget] = useState(true);

  const { bundleSize, analysis } = useBundleOptimization();

  useEffect(() => {
    const newViolations: string[] = [];

    // Check bundle size
    if (bundleSize > budget.maxBundleSize) {
      newViolations.push(`Bundle size (${Math.round(bundleSize / 1024)}KB) exceeds budget (${Math.round(budget.maxBundleSize / 1024)}KB)`);
    }

    // Check chunk sizes
    if (analysis.chunks) {
      analysis.chunks.forEach(chunk => {
        if (chunk.size && chunk.size > budget.maxChunkSize) {
          newViolations.push(`Chunk ${chunk.name} (${Math.round(chunk.size / 1024)}KB) exceeds budget (${Math.round(budget.maxChunkSize / 1024)}KB)`);
        }
      });
    }

    setViolations(newViolations);
    setIsWithinBudget(newViolations.length === 0);
  }, [bundleSize, analysis, budget]);

  return {
    violations,
    isWithinBudget,
    budgetUtilization: {
      bundle: bundleSize / budget.maxBundleSize,
      chunk: analysis.chunks ? Math.max(...analysis.chunks.map(c => (c.size || 0) / budget.maxChunkSize)) : 0,
    }
  };
}

/**
 * Hook for lazy loading optimization
 */
export function useLazyLoading(threshold: number = 0.1) {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  const observeElement = useCallback((elementId: string, element: Element) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set([...prev, elementId]));
            observer.unobserve(element);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [threshold]);

  const isVisible = useCallback((elementId: string) => {
    return visibleElements.has(elementId);
  }, [visibleElements]);

  return {
    observeElement,
    isVisible,
    visibleElements: Array.from(visibleElements)
  };
}
