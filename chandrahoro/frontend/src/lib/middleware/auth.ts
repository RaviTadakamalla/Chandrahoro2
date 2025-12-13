/**
 * ChandraHoro V2.1 - Authentication Middleware
 * 
 * NextAuth.js-based authentication middleware for API routes.
 * Provides user authentication, session validation, and resource ownership checks.
 * 
 * Features:
 * - Session-based authentication using NextAuth.js
 * - User context injection into requests
 * - Resource ownership validation
 * - Standardized error responses
 * 
 * @example
 * ```typescript
 * import { withAuth } from '@/lib/middleware/auth';
 * 
 * export const GET = withAuth(async (request: NextRequest) => {
 *   const userId = (request as any).user.id;
 *   // Protected route logic
 * });
 * ```
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Extended NextRequest with user context
 */
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

/**
 * Authentication middleware wrapper
 * 
 * Validates user session and injects user context into request.
 * Returns 401 if user is not authenticated.
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler with authentication
 */
export function withAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user || !session.user.email) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTH_REQUIRED',
              message: 'Authentication required. Please sign in to access this resource.',
            },
          },
          { status: 401 }
        );
      }
      
      // Get full user data from database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          isActive: true,
        },
      });
      
      if (!user || !user.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_INACTIVE',
              message: 'User account is inactive. Please contact support.',
            },
          },
          { status: 403 }
        );
      }
      
      // Attach user to request
      (request as AuthenticatedRequest).user = user;
      
      return handler(request, context);
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Authentication failed. Please try again.',
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional authentication middleware
 * 
 * Injects user context if authenticated, but doesn't require authentication.
 * Useful for endpoints that work for both authenticated and anonymous users.
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler with optional authentication
 */
export function withOptionalAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (session && session.user && session.user.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            isActive: true,
          },
        });
        
        if (user && user.isActive) {
          (request as AuthenticatedRequest).user = user;
        }
      }
      
      return handler(request, context);
    } catch (error) {
      console.error('❌ Optional auth middleware error:', error);
      // Continue without authentication on error
      return handler(request, context);
    }
  };
}

/**
 * Check if user owns a specific resource
 * 
 * @param userId - User ID to check ownership for
 * @param resourceId - Resource ID to check
 * @param resourceType - Type of resource (reading, chart, conversation)
 * @throws Error if user doesn't own the resource
 */
export async function checkOwnership(
  userId: string,
  resourceId: string,
  resourceType: 'reading' | 'chart' | 'conversation'
): Promise<void> {
  try {
    let resource;
    
    switch (resourceType) {
      case 'reading':
        resource = await prisma.reading.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        break;
        
      case 'chart':
        resource = await prisma.birthChart.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        break;
        
      case 'conversation':
        resource = await prisma.chatConversation.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        break;
        
      default:
        throw new Error('INVALID_RESOURCE_TYPE');
    }
    
    if (!resource) {
      throw new Error('NOT_FOUND');
    }
    
    if (resource.userId !== userId) {
      throw new Error('UNAUTHORIZED');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OWNERSHIP_CHECK_FAILED');
  }
}

/**
 * Check if user has admin privileges
 * 
 * @param userId - User ID to check
 * @returns True if user is admin
 */
export async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    return user?.role === 'admin';
  } catch (error) {
    console.error('❌ Admin check error:', error);
    return false;
  }
}

/**
 * Admin-only middleware wrapper
 * 
 * Requires authentication and admin privileges.
 * Returns 403 if user is not an admin.
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler with admin authentication
 */
export function withAdminAuth(handler: Function) {
  return withAuth(async (request: AuthenticatedRequest, context?: any) => {
    const isAdmin = await checkAdminAccess(request.user.id);
    
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ADMIN_REQUIRED',
            message: 'Administrator privileges required.',
          },
        },
        { status: 403 }
      );
    }
    
    return handler(request, context);
  });
}

/**
 * Resource ownership middleware wrapper
 * 
 * Combines authentication with ownership validation.
 * Automatically checks if the authenticated user owns the specified resource.
 * 
 * @param resourceType - Type of resource to check ownership for
 * @param getResourceId - Function to extract resource ID from request context
 * @returns Middleware function
 */
export function withOwnership(
  resourceType: 'reading' | 'chart' | 'conversation',
  getResourceId: (context: any) => string
) {
  return (handler: Function) => {
    return withAuth(async (request: AuthenticatedRequest, context?: any) => {
      try {
        const resourceId = getResourceId(context);
        await checkOwnership(request.user.id, resourceId, resourceType);
        
        return handler(request, context);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'NOT_FOUND') {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: `${resourceType} not found.`,
                },
              },
              { status: 404 }
            );
          }
          
          if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: `You don't have permission to access this ${resourceType}.`,
                },
              },
              { status: 403 }
            );
          }
        }
        
        console.error('❌ Ownership check error:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'OWNERSHIP_CHECK_FAILED',
              message: 'Failed to verify resource ownership.',
            },
          },
          { status: 500 }
        );
      }
    });
  };
}

/**
 * Get user's plan type for quota checking
 * 
 * @param userId - User ID
 * @returns User's plan type
 */
export async function getUserPlan(userId: string): Promise<string> {
  try {
    const entitlement = await prisma.entitlement.findUnique({
      where: { userId },
      select: { planType: true },
    });
    
    return entitlement?.planType || 'free';
  } catch (error) {
    console.error('❌ Get user plan error:', error);
    return 'free';
  }
}
