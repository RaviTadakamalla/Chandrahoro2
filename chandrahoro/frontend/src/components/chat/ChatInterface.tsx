'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Menu, X } from 'lucide-react';

import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';

import type {
  ChatInterfaceProps,
  Message,
  Conversation,
  StreamingMessage,
  StreamChunk,
  ChatQuotaResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/types/chat';

/**
 * Main Chat Interface Component
 * 
 * Comprehensive AI chat interface with Server-Sent Events streaming,
 * conversation management, and chart reference integration.
 */
export function ChatInterface({
  conversationId: initialConversationId,
  initialMessages = [],
  className,
  onConversationChange,
  onMessageSent,
  onError,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quota, setQuota] = useState<ChatQuotaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  // Load conversations on mount
  useEffect(() => {
    if (session?.user) {
      loadConversations();
      loadQuota();
    }
  }, [session]);

  // Load conversation messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuota = async () => {
    try {
      const response = await fetch('/api/chat/quota');
      if (!response.ok) throw new Error('Failed to load quota');
      
      const data = await response.json();
      setQuota(data);
    } catch (error) {
      console.error('Error loading quota:', error);
    }
  };

  const createNewConversation = async (firstMessage: string): Promise<string> => {
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
        firstMessage 
      }),
    });

    if (!response.ok) throw new Error('Failed to create conversation');
    
    const data = await response.json();
    return data.conversationId;
  };

  const sendMessage = async (content: string) => {
    if (!session?.user || !content.trim()) return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setError(null);
      
      // Create new conversation if needed
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createNewConversation(content);
        setActiveConversationId(conversationId);
      }

      // Add user message optimistically
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversationId,
        role: 'user',
        content,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      onMessageSent?.(userMessage);

      // Start streaming
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();

      const requestBody: SendMessageRequest = {
        conversationId,
        content,
        options: {
          includeChartReferences: true,
        },
      };

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      let aiMessage: StreamingMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '',
        isComplete: false,
        chartReferences: [],
      };

      setStreamingMessage(aiMessage);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamChunk = JSON.parse(line.slice(6));

              if (data.type === 'content' && data.content) {
                aiMessage.content += data.content;
                setStreamingMessage({ ...aiMessage });
              } else if (data.type === 'chart_reference' && data.chartReference) {
                aiMessage.chartReferences = [...(aiMessage.chartReferences || []), data.chartReference];
                setStreamingMessage({ ...aiMessage });
              } else if (data.type === 'done') {
                aiMessage.isComplete = true;
                
                // Convert streaming message to regular message
                const finalMessage: Message = {
                  id: aiMessage.id,
                  conversationId,
                  role: 'assistant',
                  content: aiMessage.content,
                  chartReferences: aiMessage.chartReferences,
                  createdAt: new Date(),
                };

                setMessages(prev => [...prev, finalMessage]);
                setStreamingMessage(null);
                setIsStreaming(false);
                
                // Update quota
                loadQuota();
                
                // Reload conversations to update last message
                loadConversations();
                
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing stream chunk:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      if (error.name === 'AbortError') {
        // Request was aborted, clean up
        setStreamingMessage(null);
        setIsStreaming(false);
        return;
      }

      setError(error.message || 'Failed to send message');
      setStreamingMessage(null);
      setIsStreaming(false);
      
      onError?.(error);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsSidebarOpen(false);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setStreamingMessage(null);
    setIsSidebarOpen(false);
  };

  const handleConversationDelete = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        handleNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={handleConversationSelect}
            onConversationDelete={handleConversationDelete}
            onNewConversation={handleNewConversation}
            className="flex-1"
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          conversation={activeConversation}
          isStreaming={isStreaming}
          remainingQuota={quota?.remaining}
          onNewChat={handleNewConversation}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <Separator />

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showTimestamp={true}
                  />
                ))}

                {streamingMessage && (
                  <MessageBubble
                    message={streamingMessage as Message}
                    isStreaming={true}
                  />
                )}

                {isStreaming && !streamingMessage && (
                  <TypingIndicator isVisible={true} />
                )}

                {error && (
                  <div className="flex justify-center">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md">
                      <p className="text-sm text-destructive">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                        className="mt-2"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="border-t bg-background">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={sendMessage}
              disabled={isStreaming || !session?.user}
              placeholder={
                !session?.user 
                  ? "Please sign in to chat..." 
                  : quota?.remaining === 0 
                    ? "Chat quota exceeded..." 
                    : "Ask about your chart..."
              }
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
