/**
 * User Registration API Route
 * 
 * Handles user signup with email/password authentication.
 * Creates user, profile, and entitlement records in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { signUpSchema } from '@/lib/validations/auth';
import { sendEmailVerification, sendWelcomeEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import { z } from 'zod';

/**
 * POST /api/auth/signup
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Validation failed',
            details: validationResult.error.errors 
          } 
        },
        { status: 400 }
      );
    }

    const { fullName, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { message: 'User with this email already exists' } },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with profile and entitlement
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        password: hashedPassword,
        profile: {
          create: {
            fullName,
            onboardingCompleted: false,
          },
        },
        entitlement: {
          create: {
            planType: 'free',
            requestsUsed: 0,
            requestsLimit: 10, // Free tier limit
            quotaResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            isActive: true,
          },
        },
      },
      include: {
        profile: true,
        entitlement: true,
      },
    });

    // Create email verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: verificationExpires,
      },
    });

    // Send verification email (don't block registration if email fails)
    try {
      await sendEmailVerification(email, fullName, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Send welcome email (optional, don't block if fails)
    try {
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Return success response (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: { message: 'User with this email already exists' } },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/signup
 * Check if email is available for registration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: { message: 'Email parameter is required' } },
        { status: 400 }
      );
    }

    // Validate email format
    const emailSchema = z.string().email();
    const validationResult = emailSchema.safeParse(email);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validationResult.data },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      email: validationResult.data,
    });

  } catch (error) {
    console.error('Email availability check error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/signup
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
