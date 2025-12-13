/**
 * ChandraHoro V2.1 - Validation Middleware
 * 
 * Zod-based request validation middleware for API routes.
 * Provides type-safe request validation with detailed error messages.
 * 
 * Features:
 * - Request body validation using Zod schemas
 * - Query parameter validation
 * - Standardized validation error responses
 * - Type inference for validated data
 * 
 * @example
 * ```typescript
 * import { validate, schemas } from '@/lib/middleware/validate';
 * 
 * export const POST = validate(schemas.createReading)(
 *   async (request: NextRequest) => {
 *     const { date, type } = (request as any).validatedData;
 *     // Validated data is available
 *   }
 * );
 * ```
 */

import { z, ZodSchema, ZodError } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Extended NextRequest with validated data
 */
export interface ValidatedRequest extends NextRequest {
  validatedData: any;
  validatedQuery: any;
}

/**
 * Request body validation middleware
 * 
 * Validates request body against provided Zod schema.
 * Injects validated data into request object.
 * 
 * @param schema - Zod schema for validation
 * @returns Middleware function
 */
export function validate<T extends ZodSchema>(schema: T) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);
        
        // Attach validated data to request
        (request as ValidatedRequest).validatedData = validatedData;
        
        return handler(request, context);
      } catch (error: any) {
        if (error instanceof ZodError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: error.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  code: err.code,
                })),
              },
            },
            { status: 400 }
          );
        }
        
        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_JSON',
                message: 'Invalid JSON format in request body',
              },
            },
            { status: 400 }
          );
        }
        
        throw error;
      }
    };
  };
}

/**
 * Query parameter validation middleware
 * 
 * Validates URL search parameters against provided Zod schema.
 * 
 * @param schema - Zod schema for query validation
 * @returns Middleware function
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      try {
        const { searchParams } = new URL(request.url);
        const queryObject = Object.fromEntries(searchParams.entries());
        
        const validatedQuery = schema.parse(queryObject);
        
        // Attach validated query to request
        (request as ValidatedRequest).validatedQuery = validatedQuery;
        
        return handler(request, context);
      } catch (error: any) {
        if (error instanceof ZodError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'QUERY_VALIDATION_ERROR',
                message: 'Invalid query parameters',
                details: error.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  code: err.code,
                })),
              },
            },
            { status: 400 }
          );
        }
        
        throw error;
      }
    };
  };
}

/**
 * Common validation schemas for ChandraHoro API
 */
export const schemas = {
  // Authentication schemas
  signup: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
  }),
  
  signin: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  
  // Reading schemas
  createReading: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    type: z.enum(['daily', 'weekly', 'monthly'], {
      errorMap: () => ({ message: 'Type must be daily, weekly, or monthly' }),
    }),
    chartId: z.string().optional(),
  }),
  
  updateReading: z.object({
    isSaved: z.boolean().optional(),
    isRead: z.boolean().optional(),
    userFeedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
    rating: z.number().min(1).max(5).optional(),
  }),
  
  // Birth chart schemas
  createChart: z.object({
    name: z.string().min(1, 'Chart name is required').max(100, 'Name must be less than 100 characters'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format'),
    birthTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Birth time must be in HH:MM:SS format'),
    birthPlace: z.string().min(1, 'Birth place is required').max(200, 'Birth place must be less than 200 characters'),
    latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
    timezone: z.string().min(1, 'Timezone is required'),
    isDefault: z.boolean().optional(),
  }),
  
  updateChart: z.object({
    name: z.string().min(1).max(100).optional(),
    isDefault: z.boolean().optional(),
    notes: z.string().max(1000).optional(),
  }),
  
  // Chat schemas
  sendMessage: z.object({
    conversationId: z.string().optional(),
    message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message must be less than 2000 characters'),
    context: z.object({
      chartId: z.string().optional(),
      readingId: z.string().optional(),
      type: z.enum(['general', 'reading', 'chart', 'compatibility']).optional(),
    }).optional(),
  }),
  
  createConversation: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    type: z.enum(['general', 'reading', 'chart', 'compatibility']).default('general'),
  }),
  
  updateConversation: z.object({
    title: z.string().min(1).max(100).optional(),
    isArchived: z.boolean().optional(),
  }),
  
  // Profile schemas
  updateProfile: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    timeOfBirth: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
    placeOfBirth: z.string().max(200).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    timezone: z.string().optional(),
    phoneNumber: z.string().max(20).optional(),
    preferences: z.object({
      language: z.enum(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'bn']).optional(),
      timezone: z.string().optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        dailyReading: z.boolean().optional(),
        weeklyReading: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }),
  
  // Compatibility schemas
  checkCompatibility: z.object({
    partnerChartId: z.string().min(1, 'Partner chart ID is required'),
    analysisType: z.enum(['romantic', 'friendship', 'business', 'family']).default('romantic'),
  }),
  
  // Query parameter schemas
  paginationQuery: z.object({
    limit: z.string().transform(val => parseInt(val) || 10).pipe(z.number().min(1).max(100)),
    offset: z.string().transform(val => parseInt(val) || 0).pipe(z.number().min(0)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  readingsQuery: z.object({
    limit: z.string().transform(val => parseInt(val) || 10).pipe(z.number().min(1).max(100)),
    offset: z.string().transform(val => parseInt(val) || 0).pipe(z.number().min(0)),
    type: z.enum(['daily', 'weekly', 'monthly']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    isSaved: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  }),
  
  chartsQuery: z.object({
    limit: z.string().transform(val => parseInt(val) || 10).pipe(z.number().min(1).max(50)),
    offset: z.string().transform(val => parseInt(val) || 0).pipe(z.number().min(0)),
    includeDefault: z.string().transform(val => val === 'true').pipe(z.boolean()).default(true),
  }),
  
  conversationsQuery: z.object({
    limit: z.string().transform(val => parseInt(val) || 20).pipe(z.number().min(1).max(50)),
    offset: z.string().transform(val => parseInt(val) || 0).pipe(z.number().min(0)),
    type: z.enum(['general', 'reading', 'chart', 'compatibility']).optional(),
    isArchived: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  }),
};

/**
 * Utility function to validate and transform date strings
 */
export const dateSchema = z.string().transform((val, ctx) => {
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid date format',
    });
    return z.NEVER;
  }
  return date;
});

/**
 * Utility function to validate and transform time strings
 */
export const timeSchema = z.string().regex(/^\d{2}:\d{2}:\d{2}$/).transform((val, ctx) => {
  const [hours, minutes, seconds] = val.split(':').map(Number);
  if (hours > 23 || minutes > 59 || seconds > 59) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid time format',
    });
    return z.NEVER;
  }
  return val;
});

/**
 * Utility function to validate coordinates
 */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Utility function to validate timezone
 */
export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid timezone' }
);
