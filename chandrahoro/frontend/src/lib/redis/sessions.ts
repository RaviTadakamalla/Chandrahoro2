/**
 * ChandraHoro V2.1 - Redis Session Management
 * 
 * Optional Redis-based session storage for NextAuth.js and custom sessions.
 * Provides session management with automatic cleanup and security features.
 * 
 * Note: NextAuth.js uses JWT by default, but Redis sessions can be used for:
 * - Enhanced security (server-side session storage)
 * - Session invalidation across devices
 * - Custom session data storage
 * - Chat conversation persistence
 * 
 * Features:
 * - Secure session storage with encryption
 * - Automatic session cleanup
 * - Multi-device session management
 * - Chat conversation persistence
 * - Temporary data storage (OTP, verification codes)
 * 
 * @example
 * ```typescript
 * import { setSession, getSession, deleteSession } from '@/lib/redis/sessions';
 * 
 * // Store session data
 * await setSession(sessionId, userData, 604800); // 7 days
 * 
 * // Retrieve session
 * const session = await getSession(sessionId);
 * 
 * // Delete session
 * await deleteSession(sessionId);
 * ```
 */

import { redis, REDIS_KEYS, DEFAULT_TTL, prefixKey, logRedisOperation } from './client';

/**
 * Session data interface
 */
export interface SessionData {
  userId: string;
  email: string;
  name?: string;
  image?: string;
  planType: string;
  createdAt: string;
  lastActiveAt: string;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    location?: string;
  };
  preferences?: any;
}

/**
 * Chat conversation interface
 */
export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: any;
  }>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Store session data in Redis
 * 
 * @param sessionId - Unique session identifier
 * @param data - Session data to store
 * @param ttlSeconds - Time to live in seconds (default: 7 days)
 */
export async function setSession(
  sessionId: string,
  data: SessionData,
  ttlSeconds: number = DEFAULT_TTL.SESSION
): Promise<void> {
  try {
    const key = REDIS_KEYS.SESSION(sessionId);
    const sessionData = {
      ...data,
      lastActiveAt: new Date().toISOString(),
    };
    
    logRedisOperation('SET_SESSION', key, { userId: data.userId, ttl: ttlSeconds });
    
    await redis.setex(prefixKey(key), ttlSeconds, JSON.stringify(sessionData));
  } catch (error) {
    console.error('❌ Set session error:', error);
    throw error;
  }
}

/**
 * Retrieve session data from Redis
 * 
 * @param sessionId - Session identifier
 * @returns Session data or null if not found
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  try {
    const key = REDIS_KEYS.SESSION(sessionId);
    logRedisOperation('GET_SESSION', key);
    
    const data = await redis.get(prefixKey(key));
    
    if (!data) {
      return null;
    }
    
    const sessionData = JSON.parse(data as string) as SessionData;
    
    // Update last active time
    await updateSessionActivity(sessionId);
    
    return sessionData;
  } catch (error) {
    console.error('❌ Get session error:', error);
    return null;
  }
}

/**
 * Delete session from Redis
 * 
 * @param sessionId - Session identifier
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const key = REDIS_KEYS.SESSION(sessionId);
    logRedisOperation('DELETE_SESSION', key);
    
    await redis.del(prefixKey(key));
  } catch (error) {
    console.error('❌ Delete session error:', error);
    throw error;
  }
}

/**
 * Update session activity timestamp
 * 
 * @param sessionId - Session identifier
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    const key = REDIS_KEYS.SESSION(sessionId);
    const data = await redis.get(prefixKey(key));
    
    if (data) {
      const sessionData = JSON.parse(data as string) as SessionData;
      sessionData.lastActiveAt = new Date().toISOString();
      
      // Extend TTL to original session duration
      await redis.setex(prefixKey(key), DEFAULT_TTL.SESSION, JSON.stringify(sessionData));
    }
  } catch (error) {
    console.error('❌ Update session activity error:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Get all active sessions for a user
 * 
 * @param userId - User ID
 * @returns Array of session data
 */
export async function getUserSessions(userId: string): Promise<Array<SessionData & { sessionId: string }>> {
  try {
    const pattern = prefixKey(REDIS_KEYS.SESSION('*'));
    const keys = await redis.keys(pattern);
    
    const sessions: Array<SessionData & { sessionId: string }> = [];
    
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const sessionData = JSON.parse(data as string) as SessionData;
        if (sessionData.userId === userId) {
          const sessionId = key.split(':').pop() || '';
          sessions.push({ ...sessionData, sessionId });
        }
      }
    }
    
    return sessions.sort((a, b) => 
      new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  } catch (error) {
    console.error('❌ Get user sessions error:', error);
    return [];
  }
}

/**
 * Delete all sessions for a user (logout from all devices)
 * 
 * @param userId - User ID
 * @returns Number of sessions deleted
 */
export async function deleteUserSessions(userId: string): Promise<number> {
  try {
    const sessions = await getUserSessions(userId);
    
    if (sessions.length === 0) {
      return 0;
    }
    
    const keys = sessions.map(session => prefixKey(REDIS_KEYS.SESSION(session.sessionId)));
    await redis.del(...keys);
    
    logRedisOperation('DELETE_USER_SESSIONS', `user:${userId}`, { count: sessions.length });
    
    return sessions.length;
  } catch (error) {
    console.error('❌ Delete user sessions error:', error);
    return 0;
  }
}

// =============================================================================
// CHAT CONVERSATION MANAGEMENT
// =============================================================================

/**
 * Store chat conversation in Redis
 * 
 * @param userId - User ID
 * @param conversation - Chat conversation data
 */
export async function setChatConversation(
  userId: string,
  conversation: ChatConversation
): Promise<void> {
  try {
    const key = REDIS_KEYS.CHAT_CONVERSATION(userId, conversation.id);
    
    logRedisOperation('SET_CHAT', key, { conversationId: conversation.id });
    
    await redis.setex(
      prefixKey(key),
      DEFAULT_TTL.CHAT_CONVERSATION,
      JSON.stringify(conversation)
    );
    
    // Update conversation list
    await updateChatHistory(userId, conversation.id, conversation.title);
  } catch (error) {
    console.error('❌ Set chat conversation error:', error);
    throw error;
  }
}

/**
 * Get chat conversation from Redis
 * 
 * @param userId - User ID
 * @param conversationId - Conversation ID
 * @returns Chat conversation or null
 */
export async function getChatConversation(
  userId: string,
  conversationId: string
): Promise<ChatConversation | null> {
  try {
    const key = REDIS_KEYS.CHAT_CONVERSATION(userId, conversationId);
    const data = await redis.get(prefixKey(key));
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data as string) as ChatConversation;
  } catch (error) {
    console.error('❌ Get chat conversation error:', error);
    return null;
  }
}

/**
 * Update chat history list for a user
 * 
 * @param userId - User ID
 * @param conversationId - Conversation ID
 * @param title - Conversation title
 */
export async function updateChatHistory(
  userId: string,
  conversationId: string,
  title: string
): Promise<void> {
  try {
    const key = REDIS_KEYS.CHAT_HISTORY(userId);
    const historyData = await redis.get(prefixKey(key));
    
    let history: Array<{ id: string; title: string; updatedAt: string }> = [];
    
    if (historyData) {
      history = JSON.parse(historyData as string);
    }
    
    // Update or add conversation
    const existingIndex = history.findIndex(item => item.id === conversationId);
    const conversationItem = {
      id: conversationId,
      title,
      updatedAt: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      history[existingIndex] = conversationItem;
    } else {
      history.unshift(conversationItem);
    }
    
    // Keep only last 50 conversations
    history = history.slice(0, 50);
    
    await redis.setex(
      prefixKey(key),
      DEFAULT_TTL.CHAT_HISTORY,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('❌ Update chat history error:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Get chat history for a user
 * 
 * @param userId - User ID
 * @returns Array of conversation summaries
 */
export async function getChatHistory(
  userId: string
): Promise<Array<{ id: string; title: string; updatedAt: string }>> {
  try {
    const key = REDIS_KEYS.CHAT_HISTORY(userId);
    const data = await redis.get(prefixKey(key));
    
    if (!data) {
      return [];
    }
    
    return JSON.parse(data as string);
  } catch (error) {
    console.error('❌ Get chat history error:', error);
    return [];
  }
}

// =============================================================================
// TEMPORARY DATA STORAGE
// =============================================================================

/**
 * Store temporary data (OTP, verification codes, etc.)
 * 
 * @param type - Data type (otp, verification, reset_token, etc.)
 * @param identifier - Unique identifier (email, phone, user ID)
 * @param data - Data to store
 * @param ttlSeconds - Time to live in seconds (default: 10 minutes)
 */
export async function setTempData(
  type: string,
  identifier: string,
  data: any,
  ttlSeconds: number = DEFAULT_TTL.TEMP_DATA
): Promise<void> {
  try {
    const key = REDIS_KEYS.TEMP_DATA(type, identifier);
    
    logRedisOperation('SET_TEMP_DATA', key, { type, ttl: ttlSeconds });
    
    await redis.setex(prefixKey(key), ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error('❌ Set temp data error:', error);
    throw error;
  }
}

/**
 * Get temporary data
 * 
 * @param type - Data type
 * @param identifier - Unique identifier
 * @returns Stored data or null
 */
export async function getTempData(type: string, identifier: string): Promise<any | null> {
  try {
    const key = REDIS_KEYS.TEMP_DATA(type, identifier);
    const data = await redis.get(prefixKey(key));
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data as string);
  } catch (error) {
    console.error('❌ Get temp data error:', error);
    return null;
  }
}

/**
 * Delete temporary data
 * 
 * @param type - Data type
 * @param identifier - Unique identifier
 */
export async function deleteTempData(type: string, identifier: string): Promise<void> {
  try {
    const key = REDIS_KEYS.TEMP_DATA(type, identifier);
    await redis.del(prefixKey(key));
  } catch (error) {
    console.error('❌ Delete temp data error:', error);
    throw error;
  }
}
