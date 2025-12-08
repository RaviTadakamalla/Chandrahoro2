/**
 * AI Prompt Configuration Types
 * 
 * TypeScript types for AI prompt management system.
 */

// ============================================================================
// Enums
// ============================================================================

export enum AiModuleType {
  CHART_INTERPRETATION = 'chart_interpretation',
  DASHA_PREDICTIONS = 'dasha_predictions',
  TRANSIT_ANALYSIS = 'transit_analysis',
  YOGA_ANALYSIS = 'yoga_analysis',
  REMEDIAL_MEASURES = 'remedial_measures',
  COMPATIBILITY_ANALYSIS = 'compatibility_analysis',
  MATCH_HOROSCOPE = 'match_horoscope',
  PERSONALITY_INSIGHTS = 'personality_insights',
  CAREER_GUIDANCE = 'career_guidance',
  RELATIONSHIP_INSIGHTS = 'relationship_insights',
  HEALTH_ANALYSIS = 'health_analysis',
  FINANCIAL_PREDICTIONS = 'financial_predictions',
  PRASHNA_HORARY = 'prashna_horary',
  DAILY_PREDICTIONS = 'daily_predictions',
  CHAT = 'chat'
}

export enum PromptScope {
  SYSTEM = 'system',
  USER = 'user'
}

// ============================================================================
// Module Information
// ============================================================================

export interface AiModuleInfo {
  module_type: AiModuleType;
  display_name: string;
  description: string;
  default_prompt: string;
  available_variables: string[];
  has_custom_prompt: boolean;
  custom_prompt_id: string | null;
}

export interface AiModuleListResponse {
  modules: AiModuleInfo[];
  total: number;
}

// ============================================================================
// Prompt Configuration
// ============================================================================

export interface AiPromptConfig {
  id: string;
  module_type: AiModuleType;
  module_name: string;
  module_description: string | null;
  scope: PromptScope;
  user_id: string | null;
  custom_prompt: string;
  system_variables: string[] | null;
  output_format: string | null;
  is_enabled: boolean;
  is_default: boolean;
  temperature: number | null;
  max_tokens: number | null;
  model_override: string | null;
  tags: string[] | null;
  version: string;
  usage_count: string;
  last_used_at: string | null;
  is_validated: boolean;
  validation_notes: string | null;
  sample_format_filename: string | null;
  sample_format_type: string | null;
  sample_format_uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiPromptConfigCreate {
  module_type: AiModuleType;
  module_name?: string;
  module_description?: string;
  custom_prompt: string;
  system_variables?: string[];
  output_format?: string;
  is_enabled?: boolean;
  temperature?: number;
  max_tokens?: number;
  model_override?: string;
  tags?: string[];
}

export interface AiPromptConfigUpdate {
  module_name?: string;
  module_description?: string;
  custom_prompt?: string;
  system_variables?: string[];
  output_format?: string;
  is_enabled?: boolean;
  temperature?: number;
  max_tokens?: number;
  model_override?: string;
  tags?: string[];
  change_notes?: string;
}

export interface AiPromptConfigList {
  prompts: AiPromptConfig[];
  total: number;
  has_custom: boolean;
}

// ============================================================================
// Prompt Testing
// ============================================================================

export interface AiPromptTestRequest {
  module_type: AiModuleType;
  custom_prompt: string;
  chart_data?: Record<string, any>;
  temperature?: number;
  max_tokens?: number;
}

export interface AiPromptTestResponse {
  success: boolean;
  filled_prompt: string;
  template_variables: string[];
  missing_variables: string[];
  warnings: string[];
}

// ============================================================================
// Other Requests/Responses
// ============================================================================

export interface ResetToDefaultRequest {
  module_type: AiModuleType;
}

export interface BulkEnableDisableRequest {
  prompt_ids: string[];
  is_enabled: boolean;
}

export interface InitializeDefaultsResponse {
  success: boolean;
  message: string;
  created_count: number;
  skipped_count: number;
  total_modules: number;
}

