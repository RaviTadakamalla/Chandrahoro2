/**
 * ChandraHoro V2.1 - NextAuth.js API Route
 * 
 * Handles all authentication requests:
 * - GET: Sign in pages, session data, CSRF tokens
 * - POST: Sign in, sign out, callback handling
 * 
 * This route handles all NextAuth.js endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/[provider]
 * - /api/auth/session
 * - /api/auth/csrf
 * 
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth.js handler for App Router
 * 
 * Exports both GET and POST handlers to handle all authentication flows
 * Uses the configuration from @/lib/auth
 */
const handler = NextAuth(authOptions);

// Export handlers for both GET and POST requests
export { handler as GET, handler as POST };
