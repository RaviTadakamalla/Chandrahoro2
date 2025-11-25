/**
 * ChandraHoro V2.1 - User Signup API
 * 
 * Handles user registration with email/password authentication.
 * Creates user account with associated profile and entitlement records.
 * 
 * POST /api/auth/signup
 * 
 * Features:
 * - Email/password registration
 * - Automatic profile and entitlement creation
 * - Password hashing with bcrypt
 * - Duplicate email validation
 * - Rate limiting protection
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/auth/signup', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     email: 'user@example.com',
 *     password: 'securepassword',
 *     name: 'John Doe',
 *     acceptTerms: true
 *   })
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { withAuthRateLimit } from '@/lib/middleware/rate-limit';
import { validate, schemas } from '@/lib/middleware/validate';
import * as bcrypt from 'bcryptjs';

/**
 * POST /api/auth/signup
 * 
 * Create a new user account with email and password.
 * Automatically creates associated profile and entitlement records.
 * 
 * @param request - HTTP request with signup data
 * @returns User data (excluding password) or error response
 */
export const POST = withErrorHandler(
  withAuthRateLimit(
    validate(schemas.signup)(
      async (request: NextRequest) => {
        const { email, password, name, acceptTerms } = (request as any).validatedData;
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        
        if (existingUser) {
          return errorResponse(
            'USER_EXISTS',
            'An account with this email already exists',
            409
          );
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user with associated records in a transaction
        const user = await prisma.$transaction(async (tx) => {
          // Create user
          const newUser = await tx.user.create({
            data: {
              email: email.toLowerCase(),
              password: hashedPassword,
              name,
              role: 'user',
              isActive: true,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          });
          
          // Create user profile
          await tx.userProfile.create({
            data: {
              userId: newUser.id,
              fullName: name,
              preferences: {
                language: 'en',
                timezone: 'UTC',
                theme: 'system',
                notifications: {
                  email: true,
                  push: true,
                  dailyReading: true,
                  weeklyReading: false,
                },
              },
            },
          });
          
          // Create user entitlement (free plan)
          const quotaResetAt = new Date();
          quotaResetAt.setDate(quotaResetAt.getDate() + 1); // Reset tomorrow
          
          await tx.entitlement.create({
            data: {
              userId: newUser.id,
              planType: 'free',
              aiEnabled: true,
              dailyRequestLimit: 10,
              dailyTokenLimit: 50000,
              dailyRequestsUsed: 0,
              dailyTokensUsed: 0,
              quotaResetAt,
              allowedModels: ['claude-3-5-haiku-20241022'],
              allowedFeatures: ['daily_reading', 'basic_chat'],
            },
          });
          
          return newUser;
        });
        
        // Log successful signup
        console.log(`✅ New user registered: ${user.email} (${user.id})`);
        
        return successResponse(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
            message: 'Account created successfully. You can now sign in.',
          },
          201,
          {
            action: 'signup',
            planType: 'free',
          }
        );
      }
    ),
    'signup'
  )
);

/**
 * OPTIONS /api/auth/signup
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
