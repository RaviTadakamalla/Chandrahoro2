/**
 * ChandraHoro V2.1 - Reading Types
 * 
 * TypeScript interfaces for Daily Reading Card components and API responses.
 * Aligned with Prisma schema and API endpoint structure.
 */

// ============================================================================
// Core Reading Types (from Prisma schema)
// ============================================================================

export interface Reading {
  id: string;
  userId: string;
  chartId?: string;
  
  readingType: 'daily' | 'weekly' | 'monthly' | 'transit' | 'compatibility';
  readingDate: Date | string;
  
  title: string;
  summary: string;
  content: ReadingContent;
  highlights: string[];
  
  // Category-specific readings
  workReading?: string;
  loveReading?: string;
  healthReading?: string;
  financeReading?: string;
  
  // Timing guidance
  auspiciousTimings?: AuspiciousTiming[];
  inauspiciousTimings?: InauspiciousTiming[];
  
  // AI metadata
  aiModel: string;
  tokensUsed: number;
  cost: number;
  
  // User interaction
  isSaved: boolean;
  isRead: boolean;
  userFeedback?: string;
  rating?: number;
  
  // Timestamps
  generatedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// Reading Content Structure
// ============================================================================

export interface ReadingContent {
  summary: string;
  overview: string;
  keyThemes: string[];
  
  // Life aspects
  work: LifeAspectReading;
  love: LifeAspectReading;
  health: LifeAspectReading;
  finance: LifeAspectReading;
  
  // Additional insights
  spiritualGuidance?: string;
  recommendations: string[];
  warnings?: string[];
  
  // Astrological context
  planetaryInfluences: PlanetaryInfluence[];
  currentTransits?: Transit[];
  dashaInfo?: DashaInfo;
}

export interface LifeAspectReading {
  score: number; // 1-10 scale
  title: string;
  description: string;
  advice: string;
  keyPoints: string[];
  color: 'green' | 'yellow' | 'red'; // Based on score
}

export interface PlanetaryInfluence {
  planet: string;
  influence: 'positive' | 'neutral' | 'challenging';
  description: string;
  strength: number; // 1-10
}

export interface Transit {
  planet: string;
  fromSign: string;
  toSign: string;
  date: string;
  impact: string;
}

export interface DashaInfo {
  currentMahadasha: string;
  currentAntardasha: string;
  remainingPeriod: string;
  influence: string;
}

// ============================================================================
// Timing Types
// ============================================================================

export interface AuspiciousTiming {
  window: string; // e.g., "6:00 AM - 8:00 AM"
  activity: string; // e.g., "Business meetings"
  description?: string;
  intensity: 'high' | 'medium' | 'low';
}

export interface InauspiciousTiming {
  window: string;
  activity: string;
  description?: string;
  severity: 'high' | 'medium' | 'low';
}

// ============================================================================
// Component Props
// ============================================================================

export interface DailyReadingCardProps {
  reading: Reading;
  onSave?: (reading: Reading) => void;
  onShare?: (reading: Reading) => void;
  onMarkAsRead?: (reading: Reading) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export interface ReadingHighlightsProps {
  highlights: string[];
  className?: string;
  maxItems?: number;
}

export interface ReadingTabsProps {
  content: ReadingContent;
  activeTab?: ReadingTab;
  onTabChange?: (tab: ReadingTab) => void;
  className?: string;
}

export interface ShareDialogProps {
  reading: Reading;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (method: ShareMethod, data: ShareData) => void;
}

// ============================================================================
// Tab and Share Types
// ============================================================================

export type ReadingTab = 'work' | 'love' | 'health' | 'finance';

export interface TabConfig {
  id: ReadingTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export type ShareMethod = 'link' | 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'email' | 'download';

export interface ShareData {
  url?: string;
  text?: string;
  title?: string;
  filename?: string;
  format?: 'pdf' | 'image' | 'text';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DailyReadingResponse {
  reading: Reading;
  cached: boolean;
  source: 'redis' | 'database' | 'ai';
  date: string;
  timezone: string;
  metadata?: {
    generationTime?: number;
    cacheExpiry?: string;
    quotaRemaining?: number;
  };
}

export interface ReadingListResponse {
  readings: Reading[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface ReadingState {
  current: Reading | null;
  list: Reading[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  hasMore: boolean;
}

export interface ReadingActions {
  fetchDailyReading: (date?: string, force?: boolean) => Promise<Reading>;
  fetchReadingList: (params?: ReadingListParams) => Promise<ReadingListResponse>;
  saveReading: (readingId: string) => Promise<void>;
  markAsRead: (readingId: string) => Promise<void>;
  rateReading: (readingId: string, rating: number, feedback?: string) => Promise<void>;
  shareReading: (readingId: string, method: ShareMethod) => Promise<ShareData>;
  clearError: () => void;
}

export interface ReadingListParams {
  type?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  isSaved?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================================
// Animation and UI Types
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface CardState {
  isExpanded: boolean;
  isLoading: boolean;
  activeTab: ReadingTab;
  showShareDialog: boolean;
  isSaving: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ReadingError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type ReadingErrorType = 
  | 'FETCH_ERROR'
  | 'SAVE_ERROR'
  | 'SHARE_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR';
