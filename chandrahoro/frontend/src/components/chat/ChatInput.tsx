'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square,
  Loader2,
} from 'lucide-react';

import type { ChatInputProps } from '@/types/chat';
import { MAX_MESSAGE_LENGTH } from '@/types/chat';

/**
 * Chat Input Component
 * 
 * Auto-resizing textarea with send button, keyboard shortcuts,
 * and character limit handling.
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask about your chart...",
  maxLength = MAX_MESSAGE_LENGTH,
  className,
  autoFocus = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (min 52px, max 120px for ~5 lines)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 52), 120);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || disabled || isComposing) return;
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > maxLength) return;

    onSend(trimmedMessage);
    setMessage('');
    
    // Reset textarea height
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  }, [message, disabled, isComposing, maxLength, onSend, adjustTextareaHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Enter key (send message)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Handle Escape key (clear message)
    if (e.key === 'Escape') {
      setMessage('');
      textareaRef.current?.blur();
      return;
    }

    // Handle Ctrl/Cmd + Enter (force send even with Shift)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newText = message + pastedText;
    
    if (newText.length > maxLength) {
      e.preventDefault();
      // Truncate to max length
      const truncatedText = newText.slice(0, maxLength);
      setMessage(truncatedText);
    }
  };

  const isOverLimit = message.length > maxLength;
  const canSend = message.trim().length > 0 && !disabled && !isOverLimit && !isComposing;
  const remainingChars = maxLength - message.length;

  return (
    <div className={cn('p-4', className)}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
        {/* Main Input Area */}
        <div className="flex gap-2 items-end">
          {/* Textarea Container */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onPaste={handlePaste}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'resize-none min-h-[52px] max-h-[120px] pr-12',
                'transition-all duration-200 ease-in-out',
                'focus:ring-2 focus:ring-primary/20',
                isOverLimit && 'border-destructive focus:ring-destructive/20',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                height: '52px', // Initial height
              }}
            />

            {/* Character Count */}
            {message.length > maxLength * 0.8 && (
              <div className={cn(
                'absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md',
                'bg-background/80 backdrop-blur-sm border',
                isOverLimit ? 'text-destructive border-destructive/20' : 'text-muted-foreground'
              )}>
                {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : remainingChars}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Attachment Button (Future Feature) */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              disabled={true} // Disabled for now
              title="Attach file (Coming soon)"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Voice Input Button (Future Feature) */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              disabled={true} // Disabled for now
              title="Voice input (Coming soon)"
            >
              <Mic className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              className={cn(
                'h-10 w-10 p-0 transition-all duration-200',
                canSend 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              title={
                disabled 
                  ? 'Chat is disabled' 
                  : !message.trim() 
                    ? 'Type a message to send' 
                    : isOverLimit 
                      ? 'Message too long' 
                      : 'Send message (Enter)'
              }
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {disabled && (
              <span className="text-destructive">Chat is currently disabled</span>
            )}
          </div>
          
          {/* Character count for mobile */}
          <div className="sm:hidden">
            {message.length > 0 && (
              <span className={isOverLimit ? 'text-destructive' : ''}>
                {message.length}/{maxLength}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
