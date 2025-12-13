/**
 * Utility functions for image optimization and placeholder generation
 */

/**
 * Generate a blur data URL for image placeholders
 */
export function generateBlurDataURL(width: number = 10, height: number = 10, color: string = '#f3f4f6'): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Generate a gradient blur data URL
 */
export function generateGradientBlurDataURL(
  width: number = 10, 
  height: number = 10, 
  colors: string[] = ['#f3f4f6', '#e5e7eb']
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Generate SVG placeholder
 */
export function generateSVGPlaceholder(
  width: number, 
  height: number, 
  backgroundColor: string = '#f3f4f6',
  textColor: string = '#9ca3af',
  text?: string
): string {
  const displayText = text || `${width}×${height}`;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, sans-serif" font-size="14" fill="${textColor}">
        ${displayText}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get optimized image sizes for responsive images
 */
export function getResponsiveSizes(breakpoints?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const defaultBreakpoints = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    ...breakpoints
  };
  
  return `(max-width: 768px) ${defaultBreakpoints.mobile}, (max-width: 1200px) ${defaultBreakpoints.tablet}, ${defaultBreakpoints.desktop}`;
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Get image dimensions from aspect ratio and container width
 */
export function getDimensionsFromAspectRatio(
  aspectRatio: string, 
  containerWidth: number
): { width: number; height: number } {
  const [widthRatio, heightRatio] = aspectRatio.split('/').map(Number);
  const height = (containerWidth * heightRatio) / widthRatio;
  
  return {
    width: containerWidth,
    height: Math.round(height)
  };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = priority ? 'preload' : 'prefetch';
    link.as = 'image';
    link.href = src;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Check if image format is supported
 */
export function isImageFormatSupported(format: 'webp' | 'avif'): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    const mimeType = format === 'webp' ? 'image/webp' : 'image/avif';
    return canvas.toDataURL(mimeType).indexOf(`data:${mimeType}`) === 0;
  } catch {
    return false;
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (isImageFormatSupported('avif')) return 'avif';
  if (isImageFormatSupported('webp')) return 'webp';
  return 'jpeg';
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseSrc: string, 
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  return sizes
    .map(size => `${baseSrc}?w=${size}&q=75 ${size}w`)
    .join(', ');
}

/**
 * Image optimization configuration
 */
export const imageConfig = {
  quality: {
    low: 50,
    medium: 75,
    high: 90,
    lossless: 100
  },
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  placeholders: {
    blur: true,
    color: '#f3f4f6',
    gradientColors: ['#f3f4f6', '#e5e7eb']
  }
};

/**
 * Common image sizes for different use cases
 */
export const commonImageSizes = {
  avatar: { width: 64, height: 64 },
  thumbnail: { width: 150, height: 150 },
  card: { width: 300, height: 200 },
  hero: { width: 1200, height: 600 },
  fullscreen: { width: 1920, height: 1080 },
  chart: { width: 400, height: 400 },
  icon: { width: 24, height: 24 },
  logo: { width: 200, height: 60 }
};

/**
 * Get image size configuration for specific use case
 */
export function getImageSizeConfig(useCase: keyof typeof commonImageSizes) {
  return commonImageSizes[useCase];
}

/**
 * Optimize image for export
 */
export async function optimizeImageForExport(
  imageData: Blob | File,
  options: {
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    maintainAspectRatio?: boolean;
  } = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 0.85,
    maxWidth = 1920,
    maxHeight = 1920,
    maintainAspectRatio = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (maintainAspectRatio) {
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw optimized image
      ctx!.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageData);
  });
}

/**
 * Convert SVG to optimized PNG
 */
export async function convertSvgToPng(
  svgContent: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    backgroundColor?: string;
  } = {}
): Promise<Blob> {
  const {
    width = 800,
    height = 800,
    quality = 0.9,
    backgroundColor = '#ffffff'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      // Fill background
      ctx!.fillStyle = backgroundColor;
      ctx!.fillRect(0, 0, width, height);

      // Draw SVG
      ctx!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert SVG to PNG'));
          }
        },
        'image/png',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load SVG'));

    // Create blob URL from SVG content
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    img.src = URL.createObjectURL(svgBlob);
  });
}

/**
 * Optimize SVG content
 */
export function optimizeSvgContent(
  svgContent: string,
  options: {
    precision?: number;
    removeComments?: boolean;
    removeMetadata?: boolean;
    minifyStyles?: boolean;
  } = {}
): string {
  const {
    precision = 2,
    removeComments = true,
    removeMetadata = true,
    minifyStyles = true
  } = options;

  let optimized = svgContent;

  // Remove comments
  if (removeComments) {
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Remove metadata
  if (removeMetadata) {
    optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/g, '');
    optimized = optimized.replace(/<title[\s\S]*?<\/title>/g, '');
    optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/g, '');
  }

  // Round numbers to specified precision
  optimized = optimized.replace(/-?\d+\.?\d*/g, (match) => {
    const num = parseFloat(match);
    return isNaN(num) ? match : num.toFixed(precision).replace(/\.?0+$/, '');
  });

  // Minify styles
  if (minifyStyles) {
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/>\s+</g, '><');
  }

  // Remove empty attributes
  optimized = optimized.replace(/\s+[\w-]+=""/g, '');

  return optimized.trim();
}

/**
 * Create image download link
 */
export function downloadImage(
  imageData: Blob,
  filename: string,
  format: 'png' | 'svg' | 'jpeg' = 'png'
): void {
  const url = URL.createObjectURL(imageData);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${filename}.${format}`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Get image compression ratio
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Batch optimize images
 */
export async function batchOptimizeImages(
  images: (Blob | File)[],
  options: Parameters<typeof optimizeImageForExport>[1] = {}
): Promise<Blob[]> {
  const optimizedImages: Blob[] = [];

  for (const image of images) {
    try {
      const optimized = await optimizeImageForExport(image, options);
      optimizedImages.push(optimized);
    } catch (error) {
      console.error('Failed to optimize image:', error);
      optimizedImages.push(image);
    }
  }

  return optimizedImages;
}
