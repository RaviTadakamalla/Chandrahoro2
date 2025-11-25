/**
 * ChandraHoro V2.1 - Alerts Widget Component
 * 
 * Displays transit alerts and important notifications on the dashboard.
 * Shows preview of active alerts with navigation to full alerts page.
 * 
 * Features:
 * - Transit alert previews
 * - Color-coded alert types
 * - Navigation to full alerts
 * - Empty state handling
 * - Loading states
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Alert {
  id: string;
  type: 'transit' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'transit':
      return TrendingUp;
    case 'warning':
      return AlertTriangle;
    default:
      return Info;
  }
};

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'border-red-500';
    case 'medium':
      return 'border-orange-500';
    default:
      return 'border-blue-500';
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'high':
      return { variant: 'destructive' as const, label: 'High' };
    case 'medium':
      return { variant: 'secondary' as const, label: 'Medium' };
    default:
      return { variant: 'outline' as const, label: 'Low' };
  }
};

export function AlertsWidget() {
  const router = useRouter();
  
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts-preview'],
    queryFn: async () => {
      const res = await fetch('/api/alerts?limit=3');
      if (!res.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return res.json();
    },
    retry: 1,
  });
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">Unable to load alerts</span>
        </div>
      </Card>
    );
  }
  
  const activeAlerts: Alert[] = alerts?.data?.slice(0, 2) || [];
  
  if (activeAlerts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Transit Alerts</h3>
        </div>
        
        <div className="text-center py-4">
          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No active alerts at the moment
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            We'll notify you of important planetary transits
          </p>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/alerts')}
        >
          View Alert History
        </Button>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Transit Alerts</h3>
        </div>
        {alerts?.data?.length > 2 && (
          <Badge variant="secondary">
            +{alerts.data.length - 2} more
          </Badge>
        )}
      </div>
      
      {/* Alerts List */}
      <div className="space-y-4 mb-4">
        {activeAlerts.map((alert: Alert) => {
          const AlertIcon = getAlertIcon(alert.type);
          const alertColor = getAlertColor(alert.severity);
          const severityBadge = getSeverityBadge(alert.severity);
          
          return (
            <div 
              key={alert.id} 
              className={`border-l-4 ${alertColor} pl-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-r-lg`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {alert.title}
                  </p>
                </div>
                <Badge {...severityBadge} className="text-xs">
                  {severityBadge.label}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {alert.message}
              </p>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {new Date(alert.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Action Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push('/alerts')}
      >
        View All Alerts ({alerts?.data?.length || 0})
      </Button>
    </Card>
  );
}
