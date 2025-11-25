/**
 * ChandraHoro V2.1 - Chat Area Component
 * 
 * Main chat area component displaying messages and input.
 * Handles message display, streaming, and user interactions.
 * 
 * Features:
 * - Message list with auto-scroll
 * - Loading states for conversations
 * - Empty state for new chats
 * - Streaming message support
 * - Responsive design
 */

'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SkeletonLoader } from '@/components/states/SkeletonLoader';
import { EmptyState } from '@/components/states/EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatAreaProps {
  conversationId?: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isStreaming } = useChat(conversationId);
  
  // Fetch existing conversation messages
  const { data, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch conversation');
      }
      return res.json();
    },
    enabled: !!conversationId,
  });
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Show loading for existing conversation
  if (isLoading && conversationId) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          <SkeletonLoader variant="list" count={3} />
        </div>
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  
  const existingMessages = data?.data?.messages || [];
  const allMessages = conversationId ? existingMessages : messages;
  
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon="💬"
              title="Start a Conversation"
              description="Ask me anything about your birth chart, transits, or astrological guidance. I'm here to help you understand your cosmic blueprint!"
              action={{
                label: 'Ask about my chart',
                onClick: () => {
                  // Focus the input
                  const input = document.querySelector('textarea');
                  if (input) {
                    input.focus();
                    input.value = "What can you tell me about my birth chart?";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {allMessages.map((msg: any, i: number) => (
              <ChatMessage 
                key={msg.id || `msg-${i}`} 
                message={msg} 
              />
            ))}
            
            {/* Streaming message indicator */}
            {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <ChatMessage
                message={messages[messages.length - 1]}
                isStreaming={true}
              />
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder={
          isStreaming 
            ? 'Claude is thinking...' 
            : allMessages.length === 0
              ? 'Ask about your chart, transits, or any astrological question...'
              : 'Continue the conversation...'
        }
      />
    </div>
  );
}
