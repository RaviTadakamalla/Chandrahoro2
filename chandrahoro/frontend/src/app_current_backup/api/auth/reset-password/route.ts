/**
 * Reset Password API Route
 * 
 * Handles password reset using secure tokens.
 * Validates tokens and updates user passwords.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations/auth';

/**
 * POST /api/auth/reset-password
 * Reset user password with valid token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = resetPasswordSchema.safeParse(body);
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

    const { token, password } = validationResult.data;

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
        { error: { message: 'Invalid or expired reset token' } },
        { status: 400 }
      );
    }

    // Find user by email from token
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User account not found' } },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and delete all verification tokens for this user
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          emailVerified: new Date(), // Mark email as verified if not already
        },
      }),
      
      // Delete all verification tokens for this user
      prisma.verificationToken.deleteMany({
        where: {
          identifier: verificationToken.identifier,
        },
      }),
      
      // Optionally, invalidate all existing sessions for security
      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/reset-password
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
