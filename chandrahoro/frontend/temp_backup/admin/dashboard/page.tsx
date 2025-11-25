/**
 * ChandraHoro V2.1 - Admin Dashboard Page
 * 
 * Comprehensive admin dashboard for monitoring system health,
 * user activity, AI usage, and business metrics.
 * 
 * Features:
 * - Real-time overview statistics
 * - Usage trends and charts
 * - User activity monitoring
 * - AI cost and quota tracking
 * - System health indicators
 */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsageChart } from '@/components/admin/UsageChart';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Activity,
  AlertTriangle,
  RefreshCw,
  Download,
  Heart,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch overview data
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['admin-overview', refreshKey],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?metric=overview');
      if (!res.ok) throw new Error('Failed to fetch overview');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Fetch usage trend data
  const { data: usage } = useQuery({
    queryKey: ['admin-usage', refreshKey],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?metric=usage&days=7');
      if (!res.ok) throw new Error('Failed to fetch usage');
      return res.json();
    },
  });
  
  // Fetch top users
  const { data: topUsers } = useQuery({
    queryKey: ['admin-top-users', refreshKey],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?metric=top-users&limit=10');
      if (!res.ok) throw new Error('Failed to fetch top users');
      return res.json();
    },
  });
  
  // Fetch system health
  const { data: health } = useQuery({
    queryKey: ['admin-health', refreshKey],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?metric=health');
      if (!res.ok) throw new Error('Failed to fetch health');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_data' }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
  if (overviewLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  if (overviewError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load dashboard data</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  const stats = overview?.data;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            ChandraHoro V2.1 System Monitoring & Analytics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* System Health */}
      {health?.data && (
        <Card className={`border-2 ${health.data.databaseConnected ? 'border-green-200' : 'border-red-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${health.data.databaseConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-medium">System Status</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>DB: {health.data.databaseConnected ? '✅ Connected' : '❌ Disconnected'}</span>
                <span>Response: {health.data.averageResponseTime}ms</span>
                <span>Uptime: {Math.floor(health.data.uptime / 3600)}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-green-600">
                  {stats?.activeToday || 0} active today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Readings Today</p>
                <p className="text-2xl font-bold">{stats?.readingsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Chat Messages</p>
                <p className="text-2xl font-bold">{stats?.chatMessagesToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Compatibility Reports</p>
                <p className="text-2xl font-bold">{stats?.compatibilityReportsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analytics */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
          <TabsTrigger value="quota">Quota & Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Usage Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {usage?.data && <UsageChart data={usage.data} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers?.data?.map((user: any, index: number) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 mb-1">
                        <Badge variant="secondary">{user.planType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {user.readingsCount} readings • {user.messagesCount} messages
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  AI Usage Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Requests</span>
                    <span className="font-semibold">{stats?.aiUsageStats?.totalRequests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tokens</span>
                    <span className="font-semibold">{stats?.aiUsageStats?.totalTokens?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost</span>
                    <span className="font-semibold">${stats?.aiUsageStats?.totalCost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Cost/Request</span>
                    <span className="font-semibold">${stats?.aiUsageStats?.avgCostPerRequest?.toFixed(3) || '0.000'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Request Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.aiUsageStats?.requestTypeDistribution && 
                    Object.entries(stats.aiUsageStats.requestTypeDistribution).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="capitalize">{type}</span>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="quota" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.quotaStats?.planDistribution && 
                    Object.entries(stats.quotaStats.planDistribution).map(([plan, count]) => (
                      <div key={plan} className="flex justify-between items-center">
                        <span className="capitalize">{plan}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quota Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Quota Exceeded</span>
                    <span className="font-semibold text-red-600">
                      {stats?.quotaStats?.quotaExceeded || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Requests Used</span>
                    <span className="font-semibold">
                      {stats?.quotaStats?.avgRequestsUsed?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Tokens Used</span>
                    <span className="font-semibold">
                      {stats?.quotaStats?.avgTokensUsed?.toFixed(0) || '0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
