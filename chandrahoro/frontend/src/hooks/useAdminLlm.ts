import { useState, useCallback } from 'react';
import { AdminDefaults, UserLlmRow, AuditRow, ApiResponse } from '@/types/llm';
import { API_URL } from '@/lib/constants';

interface UseAdminLlmState {
  defaults: AdminDefaults | null;
  users: UserLlmRow[];
  audit: AuditRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: {
    usersPage: number;
    usersTotal: number;
    auditPage: number;
    auditTotal: number;
  };
}

export function useAdminLlm() {
  const [state, setState] = useState<UseAdminLlmState>({
    defaults: null,
    users: [],
    audit: [],
    loading: false,
    saving: false,
    error: null,
    pagination: {
      usersPage: 1,
      usersTotal: 0,
      auditPage: 1,
      auditTotal: 0
    }
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadDefaults = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/v1/llm/admin/defaults`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load defaults: ${response.status}`);
      }
      
      const data: AdminDefaults = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        defaults: data
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load admin defaults'
      }));
    }
  }, []);

  const saveDefaults = useCallback(async (defaults: AdminDefaults): Promise<boolean> => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const response = await fetch(`/api/v1/llm/admin/defaults`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(defaults)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save defaults: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to save defaults');
      }
      
      setState(prev => ({
        ...prev,
        saving: false,
        defaults: defaults
      }));
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save defaults'
      }));
      return false;
    }
  }, []);

  const loadUsers = useCallback(async (query = '', page = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString()
      });
      
      const response = await fetch(`/api/v1/llm/admin/users?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.status}`);
      }
      
      const data: ApiResponse<{ rows: UserLlmRow[]; total: number }> = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        users: data.data?.rows || [],
        pagination: {
          ...prev.pagination,
          usersPage: page,
          usersTotal: data.data?.total || 0
        }
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load users'
      }));
    }
  }, []);

  const toggleUserByok = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/llm/admin/users/${userId}/toggle-byok`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle BYOK: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to toggle BYOK');
      }
      
      // Reload users to reflect changes
      await loadUsers();
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to toggle BYOK'
      }));
      return false;
    }
  }, [loadUsers]);

  const setUserCap = useCallback(async (userId: string, quota: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/llm/admin/users/${userId}/set-cap`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quota })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set user cap: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to set user cap');
      }
      
      // Reload users to reflect changes
      await loadUsers();
      
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to set user cap'
      }));
      return false;
    }
  }, [loadUsers]);

  const loadAudit = useCallback(async (query = '', from = '', to = '', page = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        q: query,
        from,
        to,
        page: page.toString()
      });
      
      const response = await fetch(`/api/v1/llm/admin/audit?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load audit: ${response.status}`);
      }
      
      const data: ApiResponse<{ rows: AuditRow[]; total: number }> = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        audit: data.data?.rows || [],
        pagination: {
          ...prev.pagination,
          auditPage: page,
          auditTotal: data.data?.total || 0
        }
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load audit logs'
      }));
    }
  }, []);

  const exportUsersCSV = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`/api/v1/llm/admin/users/export`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export CSV: ${response.status}`);
      }
      
      const csvData = await response.text();
      return csvData;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to export CSV'
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadDefaults,
    saveDefaults,
    loadUsers,
    toggleUserByok,
    setUserCap,
    loadAudit,
    exportUsersCSV,
    clearError
  };
}
