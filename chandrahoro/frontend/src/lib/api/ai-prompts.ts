/**
 * AI Prompt Configuration API Client
 * 
 * API client functions for managing AI prompt configurations.
 */

import { API_URL } from '../constants';
import {
  AiModuleListResponse,
  AiPromptConfigList,
  AiPromptConfig,
  AiPromptConfigCreate,
  AiPromptConfigUpdate,
  AiPromptTestRequest,
  AiPromptTestResponse,
  ResetToDefaultRequest,
  BulkEnableDisableRequest,
  InitializeDefaultsResponse,
  AiModuleType
} from '@/types/ai-prompts';

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of all available AI modules with their prompt configuration status
 */
export async function getAvailableModules(): Promise<AiModuleListResponse> {
  return apiRequest<AiModuleListResponse>('/api/v1/ai-prompts/modules');
}

/**
 * Get all user's custom prompts
 */
export async function getUserPrompts(includeSystem: boolean = true): Promise<AiPromptConfigList> {
  const params = new URLSearchParams();
  if (includeSystem) {
    params.append('include_system', 'true');
  }
  
  return apiRequest<AiPromptConfigList>(`/api/v1/ai-prompts/?${params.toString()}`);
}

/**
 * Get a specific prompt configuration by ID
 */
export async function getPromptById(promptId: string): Promise<AiPromptConfig> {
  return apiRequest<AiPromptConfig>(`/api/v1/ai-prompts/${promptId}`);
}

/**
 * Create a new custom prompt configuration
 */
export async function createPrompt(data: AiPromptConfigCreate): Promise<AiPromptConfig> {
  return apiRequest<AiPromptConfig>('/api/v1/ai-prompts/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing prompt configuration
 */
export async function updatePrompt(
  promptId: string,
  data: AiPromptConfigUpdate
): Promise<AiPromptConfig> {
  return apiRequest<AiPromptConfig>(`/api/v1/ai-prompts/${promptId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a custom prompt configuration
 */
export async function deletePrompt(promptId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`/api/v1/ai-prompts/${promptId}`, {
    method: 'DELETE',
  });
}

/**
 * Reset a module to use the system default prompt
 */
export async function resetToDefault(
  data: ResetToDefaultRequest
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/api/v1/ai-prompts/reset-to-default', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Bulk enable or disable multiple prompts
 */
export async function bulkEnableDisable(
  data: BulkEnableDisableRequest
): Promise<{ success: boolean; message: string; count: number }> {
  return apiRequest<{ success: boolean; message: string; count: number }>(
    '/api/v1/ai-prompts/bulk-enable-disable',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Initialize system default prompts (admin only)
 */
export async function initializeDefaults(): Promise<InitializeDefaultsResponse> {
  return apiRequest<InitializeDefaultsResponse>('/api/v1/ai-prompts/initialize-defaults', {
    method: 'POST',
  });
}

/**
 * Test a prompt with sample or real chart data
 */
export async function testPrompt(data: AiPromptTestRequest): Promise<AiPromptTestResponse> {
  return apiRequest<AiPromptTestResponse>('/api/v1/ai-prompts/test', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

