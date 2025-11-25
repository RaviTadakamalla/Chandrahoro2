/**
 * ChandraHoro V2.1 - Chat Hook
 * 
 * React hook for managing chat conversations with SSE streaming.
 * Provides real-time chat functionality with optimistic updates.
 * 
 * Features:
 * - SSE streaming with real-time updates
 * - Optimistic message updates
 * - Error handling and recovery
 * - Conversation management
 * - Message persistence
 * - Loading states
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  isError?: boolean;
  isOptimistic?: boolean;
  tokensUsed?: number;
  responseTime?: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  streamingMessageId: string | null;
}

export interface UseChatOptions {
  conversationId?: string;
  contextType?: 'general' | 'chart_analysis' | 'transit_reading' | 'compatibility';
  onError?: (error: string) => void;
  onMessageComplete?: (message: ChatMessage) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    conversationId: initialConversationId,
    contextType = 'general',
    onError,
    onMessageComplete,
    onConversationCreated,
  } = options;
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    isStreaming: false,
    isLoading: false,
    error: null,
    conversationId: initialConversationId || null,
    streamingMessageId: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingMessageRef = useRef<ChatMessage | null>(null);
  
  /**
   * Load conversation messages
   */
  const loadConversation = useCallback(async (conversationId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}?include_messages=true`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      
      const messages: ChatMessage[] = data.messages?.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        isError: msg.isError,
        tokensUsed: msg.tokensUsed,
        responseTime: msg.responseTime,
      })) || [];
      
      setState(prev => ({
        ...prev,
        messages,
        conversationId,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load conversation';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      onError?.(errorMessage);
    }
  }, [onError]);
  
  /**
   * Send message with SSE streaming
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isStreaming) {
      return;
    }
    
    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Add user message optimistically
    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
      isOptimistic: true,
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isStreaming: true,
      error: null,
    }));
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: state.conversationId,
          message: content.trim(),
          contextType,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error('No response body');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Create assistant message
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isOptimistic: true,
      };
      
      streamingMessageRef.current = assistantMessage;
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        streamingMessageId: assistantMessageId,
      }));
      
      // Process stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'start') {
                // Stream started
                if (data.conversationId && !state.conversationId) {
                  setState(prev => ({
                    ...prev,
                    conversationId: data.conversationId,
                  }));
                  onConversationCreated?.(data.conversationId);
                }
              } else if (data.type === 'content') {
                // Content chunk
                if (streamingMessageRef.current) {
                  streamingMessageRef.current.content += data.content;
                  
                  setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: streamingMessageRef.current!.content }
                        : msg
                    ),
                  }));
                }
              } else if (data.type === 'done') {
                // Stream completed
                if (streamingMessageRef.current) {
                  const finalMessage = {
                    ...streamingMessageRef.current,
                    isOptimistic: false,
                    tokensUsed: data.tokensUsed,
                    responseTime: data.responseTime,
                  };
                  
                  setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg =>
                      msg.id === assistantMessageId ? finalMessage : msg
                    ),
                    isStreaming: false,
                    streamingMessageId: null,
                    conversationId: data.conversationId || prev.conversationId,
                  }));
                  
                  onMessageComplete?.(finalMessage);
                }
              } else if (data.type === 'error') {
                // Stream error
                throw new Error(data.error || 'Stream error occurred');
              }
            } catch (parseError) {
              // Skip invalid JSON
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Handle abort
      if (error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          isStreaming: false,
          streamingMessageId: null,
        }));
        return;
      }
      
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      
      // Add error message
      const errorMessageObj: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, ${errorMessage}`,
        createdAt: new Date(),
        isError: true,
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessageObj],
        isStreaming: false,
        streamingMessageId: null,
        error: errorMessage,
      }));
      
      onError?.(errorMessage);
    } finally {
      streamingMessageRef.current = null;
    }
  }, [state.conversationId, state.isStreaming, contextType, onError, onMessageComplete, onConversationCreated]);
  
  /**
   * Stop current streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);
  
  /**
   * Retry last message
   */
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (lastUserMessage && !state.isStreaming) {
      // Remove error messages after the last user message
      const lastUserIndex = state.messages.findLastIndex(msg => msg.id === lastUserMessage.id);
      const messagesToKeep = state.messages.slice(0, lastUserIndex + 1);
      
      setState(prev => ({
        ...prev,
        messages: messagesToKeep,
        error: null,
      }));
      
      // Resend the message
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, state.isStreaming, sendMessage]);
  
  /**
   * Load conversation on mount if conversationId provided
   */
  useEffect(() => {
    if (initialConversationId && state.messages.length === 0 && !state.isLoading) {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId, loadConversation, state.messages.length, state.isLoading]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    // State
    messages: state.messages,
    isStreaming: state.isStreaming,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    
    // Actions
    sendMessage,
    stopStreaming,
    clearMessages,
    retryLastMessage,
    loadConversation,
    
    // Computed
    hasMessages: state.messages.length > 0,
    canSend: !state.isStreaming && !state.isLoading,
    lastMessage: state.messages[state.messages.length - 1] || null,
  };
}
