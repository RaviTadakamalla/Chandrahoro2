/**
 * ChandraHoro V2.1 - API Response Helpers
 * 
 * Standardized response formatting utilities for API routes.
 * Provides consistent response structure across all endpoints.
 * 
 * Features:
 * - Standardized success/error response formats
 * - Pagination metadata support
 * - Type-safe response builders
 * - Consistent timestamp and metadata handling
 * 
 * @example
 * ```typescript
 * import { successResponse, errorResponse } from '@/lib/api/response';
 * 
 * // Success response
 * return successResponse(data, 200, { total: 100 });
 * 
 * // Error response
 * return errorResponse('NOT_FOUND', 'Resource not found', 404);
 * ```
 */

import { NextResponse } from 'next/server';

/**
 * Standard success response interface
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp?: string;
    requestId?: string;
  };
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  page?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Create a standardized success response
 * 
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param meta - Additional metadata
 * @returns NextResponse with success format
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, any>
): NextResponse {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Create a standardized error response
 * 
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param details - Additional error details
 * @param requestId - Request ID for tracking
 * @returns NextResponse with error format
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any,
  requestId?: string
): NextResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
      ...(requestId && { requestId }),
    },
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Create a paginated success response
 * 
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param status - HTTP status code (default: 200)
 * @param meta - Additional metadata
 * @returns NextResponse with paginated format
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = 200,
  meta?: Record<string, any>
): NextResponse {
  const { total, limit, offset } = pagination;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  const paginationMeta: PaginationMeta = {
    ...pagination,
    page,
    totalPages,
    hasNext: offset + limit < total,
    hasPrev: offset > 0,
  };
  
  return successResponse(
    data,
    status,
    {
      pagination: paginationMeta,
      ...meta,
    }
  );
}

/**
 * Create a response for created resources
 * 
 * @param data - Created resource data
 * @param meta - Additional metadata
 * @returns NextResponse with 201 status
 */
export function createdResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  return successResponse(data, 201, meta);
}

/**
 * Create a response for updated resources
 * 
 * @param data - Updated resource data
 * @param meta - Additional metadata
 * @returns NextResponse with 200 status
 */
export function updatedResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  return successResponse(data, 200, meta);
}

/**
 * Create a response for deleted resources
 * 
 * @param resourceId - ID of deleted resource
 * @param meta - Additional metadata
 * @returns NextResponse with 200 status
 */
export function deletedResponse(
  resourceId?: string,
  meta?: Record<string, any>
): NextResponse {
  return successResponse(
    { 
      deleted: true,
      ...(resourceId && { id: resourceId }),
    },
    200,
    meta
  );
}

/**
 * Create a no content response (204)
 * 
 * @returns NextResponse with 204 status and no body
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a not modified response (304)
 * 
 * @returns NextResponse with 304 status
 */
export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, { status: 304 });
}

/**
 * Common error response builders
 */
export const commonErrors = {
  notFound: (resource: string = 'Resource') =>
    errorResponse('NOT_FOUND', `${resource} not found`, 404),
  
  unauthorized: (message: string = 'Access denied') =>
    errorResponse('UNAUTHORIZED', message, 403),
  
  badRequest: (message: string = 'Invalid request') =>
    errorResponse('BAD_REQUEST', message, 400),
  
  conflict: (message: string = 'Resource already exists') =>
    errorResponse('CONFLICT', message, 409),
  
  tooManyRequests: (message: string = 'Too many requests') =>
    errorResponse('RATE_LIMIT_EXCEEDED', message, 429),
  
  internalError: (message: string = 'Internal server error') =>
    errorResponse('INTERNAL_ERROR', message, 500),
  
  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    errorResponse('SERVICE_UNAVAILABLE', message, 503),
};

/**
 * Validation error response builder
 * 
 * @param errors - Array of validation errors
 * @returns NextResponse with validation error format
 */
export function validationErrorResponse(
  errors: Array<{ field: string; message: string; code?: string }>
): NextResponse {
  return errorResponse(
    'VALIDATION_ERROR',
    'Invalid input data',
    400,
    { errors }
  );
}

/**
 * Rate limit exceeded response builder
 * 
 * @param resetAt - When the rate limit resets
 * @param retryAfter - Seconds until retry is allowed
 * @returns NextResponse with rate limit error
 */
export function rateLimitResponse(
  resetAt: Date,
  retryAfter: number
): NextResponse {
  const response = errorResponse(
    'RATE_LIMIT_EXCEEDED',
    `Too many requests. Try again after ${resetAt.toISOString()}`,
    429,
    {
      resetAt: resetAt.toISOString(),
      retryAfter,
    }
  );
  
  // Add rate limit headers
  response.headers.set('Retry-After', retryAfter.toString());
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString());
  
  return response;
}

/**
 * Streaming response helper for Server-Sent Events
 * 
 * @param generator - Async generator function for streaming data
 * @returns Response with streaming headers
 */
export function streamingResponse(
  generator: () => AsyncGenerator<string, void, unknown>
): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator()) {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('❌ Streaming error:', error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

/**
 * File download response helper
 * 
 * @param data - File data (Buffer or Uint8Array)
 * @param filename - Download filename
 * @param contentType - MIME type
 * @returns Response with download headers
 */
export function downloadResponse(
  data: Buffer | Uint8Array,
  filename: string,
  contentType: string = 'application/octet-stream'
): Response {
  return new Response(data, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': data.length.toString(),
    },
  });
}

/**
 * Redirect response helper
 * 
 * @param url - Redirect URL
 * @param permanent - Whether redirect is permanent (301 vs 302)
 * @returns NextResponse with redirect
 */
export function redirectResponse(
  url: string,
  permanent: boolean = false
): NextResponse {
  return NextResponse.redirect(url, permanent ? 301 : 302);
}

/**
 * CORS-enabled response helper
 * 
 * @param response - Base response
 * @param origins - Allowed origins (default: *)
 * @returns Response with CORS headers
 */
export function corsResponse(
  response: NextResponse,
  origins: string = '*'
): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origins);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * Health check response helper
 * 
 * @param status - Service status
 * @param checks - Individual service checks
 * @returns NextResponse with health status
 */
export function healthResponse(
  status: 'healthy' | 'unhealthy' | 'degraded',
  checks: Record<string, { status: string; details?: any }>
): NextResponse {
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  
  return successResponse(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
    },
    httpStatus
  );
}
