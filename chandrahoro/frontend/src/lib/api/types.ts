/**
 * ChandraHoro V2.1 - API Types
 * 
 * TypeScript type definitions for API requests and responses.
 * Provides type safety for all API interactions.
 * 
 * Features:
 * - Request/response type definitions
 * - Pagination types
 * - Error types
 * - API endpoint parameter types
 * 
 * @example
 * ```typescript
 * import { CreateReadingRequest, ReadingResponse } from '@/lib/api/types';
 * 
 * const request: CreateReadingRequest = {
 *   date: '2024-10-26',
 *   type: 'daily'
 * };
 * ```
 */

import { z } from 'zod';
import { schemas } from '@/lib/middleware/validate';

// =============================================================================
// BASE TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp?: string;
    requestId?: string;
  };
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    timestamp: string;
    pagination: PaginationMeta;
  };
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

/**
 * User signup request
 */
export type SignupRequest = z.infer<typeof schemas.signup>;

/**
 * User signin request
 */
export type SigninRequest = z.infer<typeof schemas.signin>;

/**
 * User response
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: UserResponse;
  token?: string;
  expiresAt?: string;
}

// =============================================================================
// READING TYPES
// =============================================================================

/**
 * Create reading request
 */
export type CreateReadingRequest = z.infer<typeof schemas.createReading>;

/**
 * Update reading request
 */
export type UpdateReadingRequest = z.infer<typeof schemas.updateReading>;

/**
 * Reading response
 */
export interface ReadingResponse {
  id: string;
  userId: string;
  readingDate: string;
  readingType: 'daily' | 'weekly' | 'monthly';
  content: {
    summary: string;
    details: {
      career?: string;
      relationships?: string;
      health?: string;
      finances?: string;
      spiritual?: string;
    };
    recommendations?: string[];
    warnings?: string[];
  };
  aiModel: string;
  tokensUsed: number;
  cost: number;
  isSaved: boolean;
  isRead: boolean;
  userFeedback?: string;
  rating?: number;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Readings list query parameters
 */
export interface ReadingsQueryParams extends PaginationParams {
  type?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  isSaved?: boolean;
}

// =============================================================================
// BIRTH CHART TYPES
// =============================================================================

/**
 * Create birth chart request
 */
export type CreateChartRequest = z.infer<typeof schemas.createChart>;

/**
 * Update birth chart request
 */
export type UpdateChartRequest = z.infer<typeof schemas.updateChart>;

/**
 * Birth chart response
 */
export interface ChartResponse {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isDefault: boolean;
  chartData: {
    planets: Array<{
      name: string;
      longitude: number;
      sign: string;
      house: number;
      retrograde: boolean;
    }>;
    houses: Array<{
      number: number;
      sign: string;
      longitude: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
      applying: boolean;
    }>;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Charts list query parameters
 */
export interface ChartsQueryParams extends PaginationParams {
  includeDefault?: boolean;
}

// =============================================================================
// CHAT TYPES
// =============================================================================

/**
 * Send message request
 */
export type SendMessageRequest = z.infer<typeof schemas.sendMessage>;

/**
 * Create conversation request
 */
export type CreateConversationRequest = z.infer<typeof schemas.createConversation>;

/**
 * Update conversation request
 */
export type UpdateConversationRequest = z.infer<typeof schemas.updateConversation>;

/**
 * Chat message response
 */
export interface MessageResponse {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
    context?: any;
  };
  createdAt: string;
}

/**
 * Chat conversation response
 */
export interface ConversationResponse {
  id: string;
  userId: string;
  title: string;
  type: 'general' | 'reading' | 'chart' | 'compatibility';
  isArchived: boolean;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Conversation with messages response
 */
export interface ConversationWithMessagesResponse extends ConversationResponse {
  messages: MessageResponse[];
}

/**
 * Conversations list query parameters
 */
export interface ConversationsQueryParams extends PaginationParams {
  type?: 'general' | 'reading' | 'chart' | 'compatibility';
  isArchived?: boolean;
}

/**
 * Chat streaming response
 */
export interface ChatStreamResponse {
  id: string;
  content: string;
  done: boolean;
  metadata?: {
    tokens?: number;
    cost?: number;
  };
}

// =============================================================================
// PROFILE TYPES
// =============================================================================

/**
 * Update profile request
 */
export type UpdateProfileRequest = z.infer<typeof schemas.updateProfile>;

/**
 * User profile response
 */
export interface ProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  phoneNumber?: string;
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      dailyReading: boolean;
      weeklyReading: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// COMPATIBILITY TYPES
// =============================================================================

/**
 * Check compatibility request
 */
export type CheckCompatibilityRequest = z.infer<typeof schemas.checkCompatibility>;

/**
 * Compatibility analysis response
 */
export interface CompatibilityResponse {
  id: string;
  userId: string;
  userChartId: string;
  partnerChartId: string;
  analysisType: 'romantic' | 'friendship' | 'business' | 'family';
  analysis: {
    overallScore: number;
    summary: string;
    strengths: string[];
    challenges: string[];
    recommendations: string[];
    details: {
      emotional: { score: number; description: string };
      intellectual: { score: number; description: string };
      physical: { score: number; description: string };
      spiritual: { score: number; description: string };
    };
  };
  aiModel: string;
  tokensUsed: number;
  cost: number;
  generatedAt: string;
  createdAt: string;
}

// =============================================================================
// ENTITLEMENT TYPES
// =============================================================================

/**
 * User entitlement response
 */
export interface EntitlementResponse {
  id: string;
  userId: string;
  planType: 'free' | 'basic' | 'pro' | 'enterprise';
  aiEnabled: boolean;
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  dailyRequestsUsed: number;
  dailyTokensUsed: number;
  quotaResetAt: string;
  allowedModels: string[];
  allowedFeatures: string[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * API error codes
 */
export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'QUOTA_EXCEEDED'
  | 'USER_EXISTS'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * API error response
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: ValidationError[] | any;
  timestamp: string;
  requestId?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Extract data type from API response
 */
export type ApiData<T extends ApiResponse> = T extends ApiResponse<infer U> ? U : never;

/**
 * Make all properties optional for partial updates
 */
export type PartialUpdate<T> = Partial<Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

/**
 * API endpoint paths
 */
export type ApiEndpoint =
  | '/api/auth/signup'
  | '/api/auth/signin'
  | '/api/readings'
  | '/api/readings/[id]'
  | '/api/readings/daily'
  | '/api/charts'
  | '/api/charts/[id]'
  | '/api/chat'
  | '/api/chat/conversations'
  | '/api/chat/conversations/[id]'
  | '/api/profile'
  | '/api/compatibility';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  endpoint: string;
  data?: any;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}
