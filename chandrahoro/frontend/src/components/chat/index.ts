/**
 * Chat Components Export Index
 * 
 * Centralized exports for all chat-related components.
 */

// Main chat components
export { ChatInterface } from './ChatInterface';
export { MessageBubble } from './MessageBubble';
export { ChatInput } from './ChatInput';
export { ChatHeader } from './ChatHeader';

// Supporting components
export { TypingIndicator } from './TypingIndicator';
export { ChartReferenceCard } from './ChartReferenceCard';
export { ConversationList } from './ConversationList';

// Re-export types for convenience
export type {
  // Core interfaces
  Conversation,
  Message,
  ChartReference,
  MessageMetadata,
  
  // Streaming interfaces
  StreamingMessage,
  StreamChunk,
  ChatStreamResponse,
  
  // Component props
  ChatInterfaceProps,
  MessageBubbleProps,
  ChatInputProps,
  ChatHeaderProps,
  TypingIndicatorProps,
  ChartReferenceCardProps,
  ConversationListProps,
  
  // API interfaces
  SendMessageRequest,
  SendMessageResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  GetConversationsResponse,
  
  // State management
  ChatState,
  ConversationState,
  MessageState,
  
  // Error types
  ChatError,
  StreamingError,
  QuotaExceededError,
} from '@/types/chat';
