/**
 * Compression utilities for optimizing data transfer
 */

/**
 * Compress string data using built-in compression
 */
export async function compressString(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  writer.write(encoder.encode(data));
  writer.close();
  
  const chunks: Uint8Array[] = [];
  let done = false;
  
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }
  
  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * Decompress data using built-in decompression
 */
export async function decompressString(compressedData: Uint8Array): Promise<string> {
  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();

  writer.write(compressedData as BufferSource);
  writer.close();
  
  const chunks: Uint8Array[] = [];
  let done = false;
  
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }
  
  // Combine chunks and decode
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  const decoder = new TextDecoder();
  return decoder.decode(result);
}

/**
 * Check if compression is supported
 */
export function isCompressionSupported(): boolean {
  return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

/**
 * Compress JSON data for storage or transmission
 */
export async function compressJSON(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  
  if (!isCompressionSupported()) {
    // Fallback to base64 encoding if compression not supported
    return btoa(jsonString);
  }
  
  try {
    const compressed = await compressString(jsonString);
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...compressed));
  } catch (error) {
    console.warn('Compression failed, using fallback:', error);
    return btoa(jsonString);
  }
}

/**
 * Decompress JSON data
 */
export async function decompressJSON(compressedData: string): Promise<any> {
  if (!isCompressionSupported()) {
    // Fallback to base64 decoding
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  }
  
  try {
    // Convert from base64
    const binaryString = atob(compressedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = await decompressString(bytes);
    return JSON.parse(decompressed);
  } catch (error) {
    console.warn('Decompression failed, trying fallback:', error);
    // Try fallback decoding
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  }
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(original: string, compressed: Uint8Array): number {
  const originalSize = new TextEncoder().encode(original).length;
  const compressedSize = compressed.length;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Optimize payload size for API requests
 */
export async function optimizePayload(data: any): Promise<{
  data: string;
  compressed: boolean;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}> {
  const jsonString = JSON.stringify(data);
  const originalSize = new TextEncoder().encode(jsonString).length;
  
  // Only compress if data is larger than 1KB
  if (originalSize < 1024) {
    return {
      data: jsonString,
      compressed: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0
    };
  }
  
  if (!isCompressionSupported()) {
    return {
      data: jsonString,
      compressed: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0
    };
  }
  
  try {
    const compressed = await compressString(jsonString);
    const compressionRatio = calculateCompressionRatio(jsonString, compressed);
    
    // Only use compression if it provides significant savings (>20%)
    if (compressionRatio > 20) {
      return {
        data: btoa(String.fromCharCode(...compressed)),
        compressed: true,
        originalSize,
        optimizedSize: compressed.length,
        compressionRatio
      };
    } else {
      return {
        data: jsonString,
        compressed: false,
        originalSize,
        optimizedSize: originalSize,
        compressionRatio: 0
      };
    }
  } catch (error) {
    console.warn('Payload optimization failed:', error);
    return {
      data: jsonString,
      compressed: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0
    };
  }
}

/**
 * Compression configuration
 */
export const compressionConfig = {
  minSize: 1024, // Minimum size to compress (1KB)
  minRatio: 20,  // Minimum compression ratio to use (20%)
  algorithms: ['gzip', 'deflate'] as const,
  levels: {
    fast: 1,
    balanced: 6,
    best: 9
  }
};

/**
 * Check browser compression support
 */
export function getBrowserCompressionSupport(): {
  gzip: boolean;
  brotli: boolean;
  deflate: boolean;
} {
  if (typeof window === 'undefined') {
    return { gzip: false, brotli: false, deflate: false };
  }
  
  // Check Accept-Encoding header support (approximation)
  const userAgent = navigator.userAgent.toLowerCase();
  
  return {
    gzip: true, // Universally supported
    brotli: userAgent.includes('chrome') || userAgent.includes('firefox') || userAgent.includes('safari'),
    deflate: true // Universally supported
  };
}
