'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  MoreVertical,
  RefreshCw,
  Share,
  Trash2,
  Clock,
  User,
  Bot,
} from 'lucide-react';

import { ChartReferenceCard } from './ChartReferenceCard';
import type { MessageBubbleProps, MessageAction } from '@/types/chat';

/**
 * Message Bubble Component
 * 
 * Displays individual chat messages with markdown rendering,
 * chart references, and interactive actions.
 */
export function MessageBubble({
  message,
  isStreaming = false,
  showTimestamp = false,
  onChartReferenceClick,
  onMessageAction,
  className,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleMessageAction = (actionType: MessageAction['type']) => {
    const action: MessageAction = {
      type: actionType,
      label: actionType.charAt(0).toUpperCase() + actionType.slice(1),
    };
    onMessageAction?.(action, message);
  };

  const formatTimestamp = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return messageDate.toLocaleDateString();
  };

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        'group relative max-w-[80%] flex flex-col',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Message Header */}
        <div className={cn(
          'flex items-center gap-2 mb-1 px-1',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <div className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}>
            {isUser ? (
              <User className="w-3 h-3" />
            ) : (
              <Bot className="w-3 h-3" />
            )}
            <span className="font-medium">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            {isStreaming && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                Typing...
              </Badge>
            )}
          </div>

          {showTimestamp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(message.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className="relative flex items-start gap-2 w-full">
          <div
            className={cn(
              'relative p-4 rounded-2xl shadow-sm',
              'before:absolute before:w-3 before:h-3 before:rotate-45',
              isUser
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white before:bg-orange-500 before:-left-1 before:top-4'
                : 'bg-gradient-to-r from-celestial-deep to-celestial-medium text-white before:bg-celestial-deep before:-left-1 before:top-4',
              'prose prose-sm max-w-none',
              isUser ? 'prose-invert' : 'prose-invert'
            )}
          >
            {/* Message Content */}
            <div className="relative z-10">
              <ReactMarkdown
                components={{
                  // Code blocks
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !mt-2 !mb-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={cn(
                          'px-1.5 py-0.5 rounded text-sm',
                          isUser 
                            ? 'bg-orange-400/30 text-orange-100' 
                            : 'bg-celestial-light/30 text-celestial-light'
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Paragraphs
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  // Lists
                  ul({ children }) {
                    return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                  },
                  // Links
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'underline underline-offset-2',
                          isUser ? 'text-orange-100 hover:text-white' : 'text-celestial-light hover:text-white'
                        )}
                      >
                        {children}
                      </a>
                    );
                  },
                  // Headings
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                  // Blockquotes
                  blockquote({ children }) {
                    return (
                      <blockquote className={cn(
                        'border-l-4 pl-4 py-2 my-2 italic',
                        isUser ? 'border-orange-300' : 'border-celestial-light'
                      )}>
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              )}
            </div>

            {/* Chart References */}
            {message.chartReferences && message.chartReferences.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-white/20 pt-3">
                <div className="text-xs font-medium opacity-80">Chart References:</div>
                {message.chartReferences.map((reference, index) => (
                  <ChartReferenceCard
                    key={`${reference.id}-${index}`}
                    reference={reference}
                    onClick={onChartReferenceClick}
                    variant="inline"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Message Actions */}
          {!isStreaming && (showActions || false) && (
            <div className={cn(
              'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser ? 'order-first' : 'order-last'
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <Copy className="w-3 h-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isUser ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => handleMessageAction('copy')}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isAssistant && (
                    <DropdownMenuItem onClick={() => handleMessageAction('regenerate')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleMessageAction('share')}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleMessageAction('delete')}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
