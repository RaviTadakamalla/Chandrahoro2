/**
 * ChandraHoro V2.1 - Alerts List Component
 * 
 * React component for displaying and managing transit alerts.
 * Provides interactive UI for viewing, dismissing, and filtering alerts.
 * 
 * Features:
 * - Real-time alert display
 * - Severity-based styling
 * - Interactive dismiss functionality
 * - Filtering and pagination
 * - Responsive design
 */

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  X, 
  Clock, 
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { format, isAfter } from 'date-fns';

interface AlertData {
  id: string;
  alertType: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isDismissed: boolean;
  isRead: boolean;
  metadata: any;
  createdAt: string;
  expiresAt: string;
}

interface AlertsListProps {
  className?: string;
  showFilters?: boolean;
  maxHeight?: string;
  compact?: boolean;
}

export function AlertsList({ 
  className = '',
  showFilters = true,
  maxHeight = '600px',
  compact = false,
}: AlertsListProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const queryClient = useQueryClient();
  
  // Fetch alerts
  const { data: alertsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', activeTab, selectedSeverity],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '20',
        include_dismissed: activeTab === 'dismissed' ? 'true' : 'false',
        include_expired: activeTab === 'expired' ? 'true' : 'false',
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
      });
      
      const response = await fetch(`/api/alerts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Dismiss alert mutation
  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'dismiss' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
  
  // Delete alert mutation
  const deleteMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts?ids=${alertId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
  
  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'mark_read' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
  
  const alerts = alertsResponse?.data || [];
  const stats = alertsResponse?.meta?.stats || {};
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'medium': return '🔵';
      case 'low': return '⚪';
      default: return '📢';
    }
  };
  
  const isExpired = (expiresAt: string) => {
    return isAfter(new Date(), new Date(expiresAt));
  };
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load alerts</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Transit Alerts
            {stats.unread > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.unread} new
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-2 mt-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({stats.active || 0})
            </TabsTrigger>
            <TabsTrigger value="dismissed">
              Dismissed
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div 
              className="space-y-3 p-4"
              style={{ maxHeight, overflowY: 'auto' }}
            >
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts to display</p>
                  {activeTab === 'active' && (
                    <p className="text-sm mt-1">
                      You'll see transit alerts here when significant planetary events occur.
                    </p>
                  )}
                </div>
              ) : (
                alerts.map((alert: AlertData) => (
                  <Alert
                    key={alert.id}
                    variant={getSeverityColor(alert.severity) as any}
                    className={`relative ${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''} ${
                      isExpired(alert.expiresAt) ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <AlertTitle className="flex items-center gap-2 text-sm font-medium">
                          <span>{getSeverityIcon(alert.severity)}</span>
                          {alert.title}
                          {!alert.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          {isExpired(alert.expiresAt) && (
                            <Badge variant="outline" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </AlertTitle>
                        
                        <AlertDescription className="mt-2 text-sm">
                          {alert.message}
                        </AlertDescription>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
                          </div>
                          {alert.expiresAt && !isExpired(alert.expiresAt) && (
                            <div>
                              Expires {format(new Date(alert.expiresAt), 'MMM d')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markReadMutation.mutate(alert.id)}
                            disabled={markReadMutation.isPending}
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {activeTab === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissMutation.mutate(alert.id)}
                            disabled={dismissMutation.isPending}
                            title="Dismiss alert"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(alert.id)}
                          disabled={deleteMutation.isPending}
                          title="Delete alert"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Alert>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard
export function AlertsListCompact({ className = '' }: { className?: string }) {
  return (
    <AlertsList
      className={className}
      showFilters={false}
      maxHeight="300px"
      compact={true}
    />
  );
}

// Alert badge for navigation
export function AlertsBadge() {
  const { data: alertsResponse } = useQuery({
    queryKey: ['alerts', 'badge'],
    queryFn: async () => {
      const response = await fetch('/api/alerts?limit=1');
      if (!response.ok) return null;
      return response.json();
    },
    refetchInterval: 60000, // Check every minute
  });
  
  const unreadCount = alertsResponse?.meta?.stats?.unread || 0;
  
  if (unreadCount === 0) return null;
  
  return (
    <Badge variant="destructive" className="text-xs">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}
