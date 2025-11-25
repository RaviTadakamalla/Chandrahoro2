import { useState, useCallback } from 'react';
import { LlmConfigInput, LlmConfigSummary, TestConnectionResult, ApiResponse } from '@/types/llm';
import { API_URL } from '@/lib/constants';

interface UseLlmConfigState {
  config: LlmConfigSummary | null;
  loading: boolean;
  error: string | null;
  testResult: TestConnectionResult | null;
  testing: boolean;
  saving: boolean;
  rotating: boolean;
  deleting: boolean;
}

export function useLlmConfig() {
  const [state, setState] = useState<UseLlmConfigState>({
    config: null,
    loading: false,
    error: null,
    testResult: null,
    testing: false,
    saving: false,
    rotating: false,
    deleting: false
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadConfig = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/v1/llm/me`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      
      const config: LlmConfigSummary | null = await response.json();

      setState(prev => ({
        ...prev,
        loading: false,
        config: config
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load configuration'
      }));
    }
  }, []);

  const testConnection = useCallback(async (input: LlmConfigInput): Promise<TestConnectionResult> => {
    setState(prev => ({ ...prev, testing: true, testResult: null }));

    try {
      // Transform frontend input to backend TestConnectionRequest format
      const testRequest = {
        provider: input.provider,
        model: input.model,
        api_key: input.apiKey,
        base_url: input.baseUrl || null,
        extra_headers: input.extraHeaders || null
      };

      const response = await fetch(`/api/v1/llm/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(testRequest)
      });
      
      const result: TestConnectionResult = await response.json();
      
      setState(prev => ({
        ...prev,
        testing: false,
        testResult: result
      }));
      
      return result;
    } catch (err) {
      const errorResult: TestConnectionResult = {
        ok: false,
        error: err instanceof Error ? err.message : 'Connection test failed'
      };
      
      setState(prev => ({
        ...prev,
        testing: false,
        testResult: errorResult
      }));
      
      return errorResult;
    }
  }, []);

  const saveConfig = useCallback(async (input: LlmConfigInput): Promise<boolean> => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      // Transform frontend input to backend LlmConfigInput format
      const saveRequest = {
        provider: input.provider,
        model: input.model,
        api_key: input.apiKey,
        base_url: input.baseUrl || null,
        region: input.region || null,
        deployment: input.deployment || null,
        extra_headers: input.extraHeaders || null,
        response_format: input.responseFormat || 'auto',
        daily_limit: input.dailyLimit || null
      };

      const response = await fetch(`/api/v1/llm/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(saveRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save config: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to save configuration');
      }
      
      setState(prev => ({ ...prev, saving: false }));
      
      // Reload config after successful save
      await loadConfig();
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save configuration'
      }));
      return false;
    }
  }, [loadConfig]);

  const rotateKey = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, rotating: true, error: null }));
    
    try {
      const response = await fetch(`/api/v1/llm/rotate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rotate key: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to rotate key');
      }
      
      setState(prev => ({ ...prev, rotating: false }));
      
      // Reload config after successful rotation
      await loadConfig();
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        rotating: false,
        error: err instanceof Error ? err.message : 'Failed to rotate key'
      }));
      return false;
    }
  }, [loadConfig]);

  const deleteConfig = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, deleting: true, error: null }));
    
    try {
      const response = await fetch(`/api/v1/llm/me`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete config: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to delete configuration');
      }
      
      setState(prev => ({
        ...prev,
        deleting: false,
        config: null,
        testResult: null
      }));
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        deleting: false,
        error: err instanceof Error ? err.message : 'Failed to delete configuration'
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearTestResult = useCallback(() => {
    setState(prev => ({ ...prev, testResult: null }));
  }, []);

  return {
    ...state,
    loadConfig,
    testConnection,
    saveConfig,
    rotateKey,
    deleteConfig,
    clearError,
    clearTestResult
  };
}
