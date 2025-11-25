/**
 * Forgot Password API Route
 * 
 * Handles password reset requests by generating secure tokens
 * and sending reset emails to users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = forgotPasswordSchema.safeParse(body);
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

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Always return success to prevent email enumeration attacks
    // Don't reveal whether the email exists or not
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    };

    if (!user) {
      // Return success even if user doesn't exist
      return NextResponse.json(successResponse);
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    // Create new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: resetExpires,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.name || 'User', resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clean up the token if email fails
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email,
          token: resetToken,
        },
      });

      return NextResponse.json(
        { error: { message: 'Failed to send reset email. Please try again.' } },
        { status: 500 }
      );
    }

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/forgot-password
 * Verify reset token validity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: { message: 'Reset token is required' } },
        { status: 400 }
      );
    }

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { 
          valid: false,
          error: { message: 'Invalid or expired reset token' } 
        },
        { status: 400 }
      );
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { 
          valid: false,
          error: { message: 'User account not found' } 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      expiresAt: verificationToken.expires,
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/forgot-password
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
