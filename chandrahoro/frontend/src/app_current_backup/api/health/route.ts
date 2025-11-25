/**
 * Health Check API Route for ChandraHoro V2.1
 * 
 * Provides a simple health check endpoint to verify the application is running.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 * 
 * @author ChandraHoro Development Team
 * @version 2.1.0
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/health
 * 
 * Returns the health status of the application
 */
export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '2.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      services: {
        api: await checkApiHealth(),
        database: await checkDatabaseHealth(),
      },
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}

/**
 * Check API backend health
 */
async function checkApiHealth(): Promise<{ status: string; responseTime?: number }> {
  try {
    const startTime = Date.now()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    })
    
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return {
        status: 'healthy',
        responseTime,
      }
    } else {
      return {
        status: 'unhealthy',
        responseTime,
      }
    }
  } catch (error) {
    console.error('API health check failed:', error)
    return {
      status: 'unhealthy',
    }
  }
}

/**
 * Check database health (placeholder)
 */
async function checkDatabaseHealth(): Promise<{ status: string }> {
  try {
    // TODO: Implement actual database health check
    // This could check database connection, Redis, etc.
    
    return {
      status: 'healthy',
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      status: 'unhealthy',
    }
  }
}
