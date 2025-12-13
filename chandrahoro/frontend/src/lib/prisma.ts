/**
 * ChandraHoro V2.1 - Prisma Client Singleton
 * 
 * Provides a singleton Prisma client instance with proper connection pooling
 * and logging configuration for development and production environments.
 * 
 * Features:
 * - Connection pooling for optimal performance
 * - Environment-specific logging
 * - Global singleton pattern to prevent multiple instances
 * - Type-safe database operations
 * 
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

// Extend global type to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * 
 * Configuration:
 * - Development: Logs queries, errors, and warnings for debugging
 * - Production: Only logs errors to reduce noise
 * - Connection pooling: Automatically managed by Prisma
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Connection pool configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Database health check
 * Verifies database connectivity
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Database connection info
 * Returns connection status and basic metrics
 */
export async function getDatabaseInfo() {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT VERSION() as version
    `;
    
    return {
      connected: true,
      version: result[0]?.version || 'Unknown',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Export types for use throughout the application
export type { 
  User, 
  Profile, 
  BirthChart, 
  Reading, 
  Conversation, 
  Message,
  Entitlement,
  AIUsageLog,
  PartnerProfile,
  Account,
  Session 
} from '@prisma/client';

// Export Prisma types for advanced usage
export { Prisma } from '@prisma/client';
