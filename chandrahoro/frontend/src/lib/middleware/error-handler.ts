/**
 * ChandraHoro V2.1 - Error Handling Middleware
 * 
 * Centralized error handling middleware for API routes.
 * Provides consistent error responses and logging.
 * 
 * Features:
 * - Standardized error response format
 * - Error logging and monitoring
 * - Known error type handling
 * - Security-conscious error messages
 * - Development vs production error details
 * 
 * @example
 * ```typescript
 * import { withErrorHandler } from '@/lib/middleware/error-handler';
 * 
 * export const GET = withErrorHandler(async (request: NextRequest) => {
 *   // Route logic that might throw errors
 *   throw new Error('QUOTA_EXCEEDED');
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Known error types and their HTTP status codes
 */
export const ERROR_CODES = {
  // Authentication errors (401)
  AUTH_REQUIRED: { status: 401, message: 'Authentication required' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  TOKEN_EXPIRED: { status: 401, message: 'Authentication token expired' },
  
  // Authorization errors (403)
  UNAUTHORIZED: { status: 403, message: 'Access denied' },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: 'Insufficient permissions' },
  USER_INACTIVE: { status: 403, message: 'User account is inactive' },
  ADMIN_REQUIRED: { status: 403, message: 'Administrator privileges required' },
  
  // Resource errors (404)
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  READING_NOT_FOUND: { status: 404, message: 'Reading not found' },
  CHART_NOT_FOUND: { status: 404, message: 'Birth chart not found' },
  CONVERSATION_NOT_FOUND: { status: 404, message: 'Conversation not found' },
  
  // Validation errors (400)
  VALIDATION_ERROR: { status: 400, message: 'Invalid input data' },
  INVALID_JSON: { status: 400, message: 'Invalid JSON format' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Required field missing' },
  INVALID_DATE_FORMAT: { status: 400, message: 'Invalid date format' },
  INVALID_TIME_FORMAT: { status: 400, message: 'Invalid time format' },
  
  // Conflict errors (409)
  USER_EXISTS: { status: 409, message: 'Email already registered' },
  DUPLICATE_RESOURCE: { status: 409, message: 'Resource already exists' },
  READING_EXISTS: { status: 409, message: 'Reading already exists for this date' },
  
  // Rate limiting errors (429)
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests' },
  QUOTA_EXCEEDED: { status: 429, message: 'Daily quota exceeded' },
  AI_QUOTA_EXCEEDED: { status: 429, message: 'AI usage quota exceeded' },
  
  // External service errors (502/503)
  AI_SERVICE_ERROR: { status: 502, message: 'AI service temporarily unavailable' },
  EXTERNAL_API_ERROR: { status: 502, message: 'External service error' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable' },
  
  // Server errors (500)
  INTERNAL_ERROR: { status: 500, message: 'An unexpected error occurred' },
  DATABASE_ERROR: { status: 500, message: 'Database operation failed' },
  CONFIGURATION_ERROR: { status: 500, message: 'Server configuration error' },
} as const;

/**
 * Error response interface
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
 * Generate a unique request ID for error tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log error with context information
 */
function logError(error: any, request: NextRequest, requestId: string) {
  const logData = {
    requestId,
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    userId: (request as any).user?.id,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  };
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 API Error:', JSON.stringify(logData, null, 2));
  } else {
    console.error('🚨 API Error:', {
      requestId,
      method: request.method,
      url: request.url,
      userId: (request as any).user?.id,
      error: error.message,
    });
  }
}

/**
 * Create standardized error response
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number,
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
 * Error handling middleware wrapper
 * 
 * Catches and handles errors from API route handlers.
 * Provides consistent error responses and logging.
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const requestId = generateRequestId();
    
    try {
      return await handler(request, context);
    } catch (error: any) {
      // Log the error
      logError(error, request, requestId);
      
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return createErrorResponse(
          'VALIDATION_ERROR',
          'Invalid input data',
          400,
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
          requestId
        );
      }
      
      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            return createErrorResponse(
              'DUPLICATE_RESOURCE',
              'Resource already exists',
              409,
              { field: error.meta?.target },
              requestId
            );
          case 'P2025':
            return createErrorResponse(
              'NOT_FOUND',
              'Resource not found',
              404,
              undefined,
              requestId
            );
          case 'P2003':
            return createErrorResponse(
              'VALIDATION_ERROR',
              'Invalid reference to related resource',
              400,
              { field: error.meta?.field_name },
              requestId
            );
          default:
            return createErrorResponse(
              'DATABASE_ERROR',
              'Database operation failed',
              500,
              process.env.NODE_ENV === 'development' ? { prismaError: error.code } : undefined,
              requestId
            );
        }
      }
      
      // Handle known error codes
      const errorMessage = error.message || 'INTERNAL_ERROR';
      const knownError = ERROR_CODES[errorMessage as keyof typeof ERROR_CODES];
      
      if (knownError) {
        return createErrorResponse(
          errorMessage,
          knownError.message,
          knownError.status,
          undefined,
          requestId
        );
      }
      
      // Handle specific error patterns
      if (errorMessage.includes('QUOTA')) {
        return createErrorResponse(
          'QUOTA_EXCEEDED',
          errorMessage,
          429,
          undefined,
          requestId
        );
      }
      
      if (errorMessage.includes('RATE_LIMIT')) {
        return createErrorResponse(
          'RATE_LIMIT_EXCEEDED',
          errorMessage,
          429,
          undefined,
          requestId
        );
      }
      
      if (errorMessage.includes('AI_SERVICE')) {
        return createErrorResponse(
          'AI_SERVICE_ERROR',
          'AI service temporarily unavailable',
          502,
          undefined,
          requestId
        );
      }
      
      // Handle JSON parsing errors
      if (error instanceof SyntaxError && errorMessage.includes('JSON')) {
        return createErrorResponse(
          'INVALID_JSON',
          'Invalid JSON format in request body',
          400,
          undefined,
          requestId
        );
      }
      
      // Generic error handling
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return createErrorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        500,
        isDevelopment ? { 
          originalError: error.message,
          stack: error.stack?.split('\n').slice(0, 5) // Limit stack trace
        } : undefined,
        requestId
      );
    }
  };
}

/**
 * Async error boundary for handling promise rejections
 */
export function withAsyncErrorHandler(handler: Function) {
  return withErrorHandler(async (request: NextRequest, context?: any) => {
    try {
      const result = await handler(request, context);
      return result;
    } catch (error) {
      // Re-throw to be caught by withErrorHandler
      throw error;
    }
  });
}

/**
 * Utility function to throw known errors
 */
export function throwError(code: keyof typeof ERROR_CODES, details?: any): never {
  const error = new Error(code);
  if (details) {
    (error as any).details = details;
  }
  throw error;
}

/**
 * Utility function to check condition and throw error if false
 */
export function assert(condition: any, errorCode: keyof typeof ERROR_CODES, details?: any): asserts condition {
  if (!condition) {
    throwError(errorCode, details);
  }
}

/**
 * Utility function to handle async operations with error wrapping
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorCode: keyof typeof ERROR_CODES = 'INTERNAL_ERROR'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`❌ Safe async operation failed:`, error);
    throwError(errorCode);
  }
}

/**
 * Development-only error details
 */
export function getErrorDetails(error: any) {
  if (process.env.NODE_ENV !== 'development') {
    return undefined;
  }
  
  return {
    name: error.name,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 10),
    cause: error.cause,
  };
}
