/**
 * ChandraHoro V2.1 - NextAuth.js Type Extensions
 * 
 * Extends NextAuth.js types to include custom user properties
 * from our Prisma schema. This ensures type safety when accessing
 * user data in sessions.
 */

import NextAuth from 'next-auth';
import { Profile, Entitlement } from '@prisma/client';

declare module 'next-auth' {
  /**
   * Extended User interface
   * Includes additional properties from our database schema
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    profile?: Profile | null;
    entitlement?: Entitlement | null;
  }

  /**
   * Extended Session interface
   * Includes the extended User type
   */
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   * Includes additional properties for token storage
   */
  interface JWT {
    id: string;
    email: string;
    profile?: Profile | null;
    entitlement?: Entitlement | null;
  }
}
