/**
 * Chat System TypeScript Interfaces
 * 
 * Comprehensive type definitions for the AI chat interface system
 * including conversations, messages, streaming, and chart references.
 */

// ============================================================================
// CORE CHAT INTERFACES
// ============================================================================

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessageAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  messages: Message[];
  messageCount?: number;
  isArchived?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  chartReferences?: ChartReference[];
  metadata?: MessageMetadata;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ChartReference {
  id: string;
  type: 'planet' | 'house' | 'aspect' | 'dasha' | 'strength' | 'compatibility';
  title: string;
  description?: string;
  data: any; // Flexible data structure for different chart types
  chartId?: string; // Reference to birth chart
  thumbnail?: string; // Base64 or URL for chart preview
}

export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  model?: string;
  temperature?: number;
  error?: string;
  retryCount?: number;
}

// ============================================================================
// STREAMING INTERFACES
// ============================================================================

export interface StreamingMessage {
  id: string;
  role: 'assistant';
  content: string;
  isComplete: boolean;
  chartReferences?: ChartReference[];
  metadata?: Partial<MessageMetadata>;
}

export interface StreamChunk {
  type: 'content' | 'chart_reference' | 'metadata' | 'done' | 'error';
  content?: string;
  chartReference?: ChartReference;
  metadata?: Partial<MessageMetadata>;
  error?: string;
  done?: boolean;
}

export interface ChatStreamResponse {
  conversationId: string;
  messageId: string;
  chunks: AsyncIterable<StreamChunk>;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Message[];
  className?: string;
  onConversationChange?: (conversation: Conversation) => void;
  onMessageSent?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  showTimestamp?: boolean;
  onChartReferenceClick?: (reference: ChartReference) => void;
  onMessageAction?: (action: MessageAction, message: Message) => void;
  className?: string;
}

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
}

export interface TypingIndicatorProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export interface ChartReferenceCardProps {
  reference: ChartReference;
  onClick?: (reference: ChartReference) => void;
  variant?: 'inline' | 'modal' | 'compact';
  className?: string;
}

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onConversationDelete?: (conversationId: string) => void;
  onNewConversation?: () => void;
  className?: string;
}

export interface ChatHeaderProps {
  conversation?: Conversation;
  isStreaming?: boolean;
  remainingQuota?: number;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  className?: string;
}

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export interface MessageAction {
  type: 'copy' | 'regenerate' | 'share' | 'delete' | 'edit';
  label: string;
  icon?: string;
  shortcut?: string;
}

export interface ChatAction {
  type: 'send_message' | 'start_conversation' | 'delete_conversation' | 'archive_conversation';
  payload: any;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface SendMessageRequest {
  conversationId?: string;
  content: string;
  chartContext?: {
    chartId: string;
    focusAreas?: string[];
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
    includeChartReferences?: boolean;
  };
}

export interface SendMessageResponse {
  conversationId: string;
  messageId: string;
  streamUrl?: string;
  error?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChatQuotaResponse {
  remaining: number;
  total: number;
  resetDate: Date | string;
  plan: 'free' | 'premium' | 'unlimited';
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

export interface ChatState {
  conversations: Record<string, Conversation>;
  activeConversationId?: string;
  isLoading: boolean;
  isStreaming: boolean;
  error?: string;
  quota?: ChatQuotaResponse;
}

export interface MessageListState {
  messages: Message[];
  streamingMessage?: StreamingMessage;
  isLoading: boolean;
  hasMore: boolean;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type MessageRole = Message['role'];
export type ChartReferenceType = ChartReference['type'];
export type MessageActionType = MessageAction['type'];
export type StreamChunkType = StreamChunk['type'];

// ============================================================================
// CONSTANTS
// ============================================================================

export const MESSAGE_ACTIONS: MessageAction[] = [
  { type: 'copy', label: 'Copy', icon: 'Copy', shortcut: 'Cmd+C' },
  { type: 'regenerate', label: 'Regenerate', icon: 'RefreshCw' },
  { type: 'share', label: 'Share', icon: 'Share' },
  { type: 'delete', label: 'Delete', icon: 'Trash2' },
];

export const CHART_REFERENCE_TYPES: Record<ChartReferenceType, string> = {
  planet: 'Planet Position',
  house: 'House Analysis',
  aspect: 'Planetary Aspect',
  dasha: 'Dasha Period',
  strength: 'Planetary Strength',
  compatibility: 'Compatibility Score',
};

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_CONVERSATION_TITLE_LENGTH = 100;
export const TYPING_INDICATOR_DELAY = 500; // ms
export const AUTO_SCROLL_THRESHOLD = 100; // px from bottom
export const MESSAGE_RETRY_ATTEMPTS = 3;

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export class StreamingError extends ChatError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'STREAMING_ERROR', undefined, true);
    this.name = 'StreamingError';
  }
}

export class QuotaExceededError extends ChatError {
  constructor(public resetDate: Date) {
    super('Chat quota exceeded', 'QUOTA_EXCEEDED', 429, false);
    this.name = 'QuotaExceededError';
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const isValidMessage = (message: Partial<Message>): message is Message => {
  return !!(
    message.id &&
    message.conversationId &&
    message.role &&
    message.content &&
    message.createdAt
  );
};

export const isValidConversation = (conversation: Partial<Conversation>): conversation is Conversation => {
  return !!(
    conversation.id &&
    conversation.userId &&
    conversation.title &&
    conversation.lastMessageAt &&
    conversation.createdAt &&
    Array.isArray(conversation.messages)
  );
};

export const isStreamingMessage = (message: any): message is StreamingMessage => {
  return !!(
    message &&
    typeof message === 'object' &&
    message.id &&
    message.role === 'assistant' &&
    typeof message.content === 'string' &&
    typeof message.isComplete === 'boolean'
  );
};
