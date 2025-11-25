/**
 * ChandraHoro V2.1 - Chat Message Component
 * 
 * Individual message bubble component for chat interface.
 * Displays user and AI messages with proper styling and animations.
 * 
 * Features:
 * - User/AI message differentiation
 * - Avatar display
 * - Streaming text support
 * - Smooth animations
 * - Responsive design
 */

'use client';

import { motion } from 'framer-motion';
import { StreamingText } from './StreamingText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  };
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        {isUser ? (
          <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
            U
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
            C
          </AvatarFallback>
        )}
      </Avatar>
      
      {/* Message bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 max-w-[80%] break-words',
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        )}
      >
        {isStreaming ? (
          <StreamingText text={message.content} />
        ) : (
          <div className={cn(
            'prose prose-sm max-w-none',
            isUser 
              ? 'prose-invert' 
              : 'prose-gray dark:prose-invert'
          )}>
            <p className="whitespace-pre-wrap m-0">
              {message.content}
            </p>
          </div>
        )}
        
        {/* Timestamp */}
        {message.timestamp && (
          <div className={cn(
            'text-xs mt-2 opacity-70',
            isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
