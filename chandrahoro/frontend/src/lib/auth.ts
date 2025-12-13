/**
 * ChandraHoro V2.1 - NextAuth.js Configuration
 * 
 * Comprehensive authentication setup with multiple providers:
 * - Email/Password with bcrypt hashing
 * - Google OAuth
 * - Apple OAuth
 * 
 * Features:
 * - Prisma adapter for database sessions
 * - JWT strategy for scalability
 * - Custom pages for branded experience
 * - Session callbacks for user data
 * - Secure password handling
 * 
 * @see https://next-auth.js.org/configuration/options
 */

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schemas
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * NextAuth.js configuration
 * 
 * Providers:
 * - Credentials: Email/password with bcrypt
 * - Google: OAuth with profile data
 * - Apple: OAuth with privacy focus
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database sessions
  adapter: PrismaAdapter(prisma),
  
  providers: [
    /**
     * Email/Password Provider
     * Uses bcrypt for secure password hashing
     */
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'your@email.com'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Your password'
        },
      },
      async authorize(credentials) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const validatedCredentials = credentialsSchema.parse(credentials);
          
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: validatedCredentials.email },
            include: {
              profile: true,
              entitlement: true,
            },
          });
          
          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }
          
          // Verify password
          const isValidPassword = await bcrypt.compare(
            validatedCredentials.password, 
            user.password
          );
          
          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }
          
          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),

    /**
     * Google OAuth Provider
     * Handles Google Sign-In with profile data
     */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    /**
     * Apple OAuth Provider
     * Handles Sign in with Apple
     */
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  // Use JWT strategy for better scalability
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages for branded experience
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  // Callbacks for session and JWT customization
  callbacks: {
    /**
     * JWT Callback
     * Runs whenever a JWT is created, updated, or accessed
     */
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // Fetch additional user data
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            profile: true,
            entitlement: true,
          },
        });
        
        if (userData) {
          token.profile = userData.profile;
          token.entitlement = userData.entitlement;
        }
      }
      
      return token;
    },

    /**
     * Session Callback
     * Runs whenever a session is checked
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.profile = token.profile as any;
        session.user.entitlement = token.entitlement as any;
      }
      
      return session;
    },

    /**
     * Sign In Callback
     * Controls whether user is allowed to sign in
     */
    async signIn({ user, account, profile }) {
      // Allow all sign-ins for now
      // Add custom logic here for user restrictions
      return true;
    },
  },

  // Events for logging and analytics
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
      
      // Create default entitlement for new users
      if (isNewUser && user.id) {
        await prisma.entitlement.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            planType: 'free',
            quotaResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      }
    },
    
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email || token?.email}`);
    },
  },

  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Helper function to hash passwords
 * Used during user registration
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Helper function to verify passwords
 * Used during authentication
 */
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
