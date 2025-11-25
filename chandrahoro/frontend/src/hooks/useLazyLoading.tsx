import React, { useEffect, useRef, useState } from 'react';

/**
 * Hook for implementing intersection observer-based lazy loading
 */
export function useLazyLoading(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasLoaded, options]);

  return { elementRef, isVisible, hasLoaded };
}

/**
 * Hook for lazy loading images with loading states
 */
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { elementRef, isVisible } = useLazyLoading(options);

  useEffect(() => {
    if (isVisible && src && !imageSrc) {
      setIsLoading(true);
      setHasError(false);

      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      img.src = src;
    }
  }, [isVisible, src, imageSrc]);

  return {
    elementRef,
    imageSrc,
    isLoading,
    hasError,
    isVisible,
  };
}

/**
 * Hook for lazy loading with retry functionality
 */
export function useLazyLoadingWithRetry(
  loadFunction: () => Promise<any>,
  options?: IntersectionObserverInit & { maxRetries?: number }
) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { elementRef, isVisible } = useLazyLoading(options);
  const maxRetries = options?.maxRetries || 3;

  const load = async () => {
    if (isLoading || data) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      load();
    }
  };

  useEffect(() => {
    if (isVisible) {
      load();
    }
  }, [isVisible]);

  return {
    elementRef,
    data,
    isLoading,
    error,
    retry,
    canRetry: retryCount < maxRetries,
    retryCount,
  };
}

/**
 * Component wrapper for lazy loading
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  options?: IntersectionObserverInit;
}

export function LazyWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-muted h-32 rounded" />, 
  className = "",
  options 
}: LazyWrapperProps) {
  const { elementRef, isVisible } = useLazyLoading(options);

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}

/**
 * Lazy image component with loading states
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  options?: IntersectionObserverInit;
}

export function LazyImage({ 
  src, 
  alt, 
  className = "", 
  fallback = <div className="animate-pulse bg-muted aspect-video rounded" />,
  errorFallback = <div className="bg-muted aspect-video rounded flex items-center justify-center text-muted-foreground">Failed to load image</div>,
  options 
}: LazyImageProps) {
  const { elementRef, imageSrc, isLoading, hasError } = useLazyImage(src, options);

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {hasError ? (
        errorFallback
      ) : imageSrc ? (
        <img src={imageSrc} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}
