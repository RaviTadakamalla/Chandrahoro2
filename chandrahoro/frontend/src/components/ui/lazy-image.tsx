import React, { useState } from 'react';
import Image from 'next/image';
import { useLazyImage } from '@/hooks/useLazyLoading';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  options?: IntersectionObserverInit;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Lazy loading image component with loading states and error handling
 */
export function LazyImage({ 
  src, 
  alt, 
  className = "", 
  width,
  height,
  fallback,
  errorFallback,
  options,
  onLoad,
  onError
}: LazyImageProps) {
  const { elementRef, imageSrc, isLoading, hasError } = useLazyImage(src, options);

  const defaultFallback = (
    <div 
      className={`animate-pulse bg-muted rounded flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-muted-foreground text-sm">Loading...</div>
    </div>
  );

  const defaultErrorFallback = (
    <div 
      className={`bg-muted rounded flex items-center justify-center text-muted-foreground ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="text-sm">Failed to load image</div>
        <div className="text-xs opacity-70">{alt}</div>
      </div>
    </div>
  );

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {hasError ? (
        errorFallback || defaultErrorFallback
      ) : imageSrc ? (
        <img 
          src={imageSrc} 
          alt={alt} 
          width={width}
          height={height}
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

/**
 * Lazy loading avatar component
 */
interface LazyAvatarProps {
  src?: string;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LazyAvatar({ 
  src, 
  alt, 
  fallbackText, 
  size = 'md', 
  className = "" 
}: LazyAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const avatarFallback = (
    <div className={`rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium ${sizeClasses[size]} ${className}`}>
      {fallbackText || alt.charAt(0).toUpperCase()}
    </div>
  );

  if (!src) {
    return avatarFallback;
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`rounded-full ${sizeClasses[size]} ${className}`}
      fallback={avatarFallback}
      errorFallback={avatarFallback}
    />
  );
}

/**
 * Lazy loading background image component
 */
interface LazyBackgroundImageProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  fallbackColor?: string;
  options?: IntersectionObserverInit;
}

export function LazyBackgroundImage({ 
  src, 
  children, 
  className = "", 
  fallbackColor = "bg-muted",
  options 
}: LazyBackgroundImageProps) {
  const { elementRef, imageSrc, isLoading } = useLazyImage(src, options);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative ${fallbackColor} ${className}`}
      style={imageSrc && imageLoaded ? { 
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {imageSrc && !imageLoaded && (
        <img 
          src={imageSrc} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          onLoad={handleImageLoad}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Optimized Next.js Image component with lazy loading
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`bg-muted rounded flex items-center justify-center text-muted-foreground ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-sm">Failed to load image</div>
          <div className="text-xs opacity-70">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={fill ? undefined : { width, height }}>
      {isLoading && (
        <div
          className="absolute inset-0 animate-pulse bg-muted rounded"
          style={fill ? undefined : { width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${fill ? 'object-cover' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Lazy loading gallery component with Next.js Image optimization
 */
interface LazyGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  itemClassName?: string;
  columns?: number;
  imageSize?: { width: number; height: number };
}

export function LazyGallery({
  images,
  className = "",
  itemClassName = "",
  columns = 3,
  imageSize = { width: 400, height: 400 }
}: LazyGalleryProps) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {images.map((image, index) => (
        <div key={index} className={`space-y-2 ${itemClassName}`}>
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={image.width || imageSize.width}
            height={image.height || imageSize.height}
            className="aspect-square rounded-lg overflow-hidden"
            sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${100/columns}vw`}
          />
          {image.caption && (
            <p className="text-sm text-muted-foreground text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Responsive image component that adapts to container size
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = 'square',
  className = "",
  priority = false,
  quality = 75,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={`relative ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes={sizes}
        className="object-cover rounded-lg"
      />
    </div>
  );
}
