import React, { useState, useEffect } from 'react';
import { performanceMonitor, runPerformanceAudit, exportPerformanceData } from '@/lib/performance-monitor';
import type { PerformanceMetrics } from '@/lib/performance-monitor';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  autoRun?: boolean;
  onAuditComplete?: (results: any) => void;
}

export function PerformanceMonitor({ 
  showDetails = false, 
  autoRun = false,
  onAuditComplete 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [auditResults, setAuditResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setMetrics);
    
    if (autoRun) {
      runAudit();
    }

    return unsubscribe;
  }, [autoRun]);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const results = await runPerformanceAudit();
      setAuditResults(results);
      onAuditComplete?.(results);
    } catch (error) {
      console.error('Performance audit failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const data = exportPerformanceData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${Math.round(ms)}ms`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricStatus = (value: number, good: number, needsImprovement: number) => {
    if (value <= good) return 'good';
    if (value <= needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!showDetails && !auditResults) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={runAudit}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Running Audit...' : 'Performance Audit'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
        <div className="flex gap-2">
          <button
            onClick={runAudit}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Audit'}
          </button>
          <button
            onClick={downloadReport}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Download Report
          </button>
        </div>
      </div>

      {auditResults && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Score</h3>
            <div className={`text-3xl font-bold ${getScoreColor(auditResults.score)}`}>
              {auditResults.score}/100 ({auditResults.grade})
            </div>
          </div>
          
          {auditResults.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {auditResults.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Core Web Vitals */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Core Web Vitals</h3>
          
          {metrics.firstContentfulPaint && (
            <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus(metrics.firstContentfulPaint, 1800, 3000))}`}>
              <div className="font-medium">First Contentful Paint</div>
              <div className="text-lg">{formatTime(metrics.firstContentfulPaint)}</div>
            </div>
          )}
          
          {metrics.largestContentfulPaint && (
            <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus(metrics.largestContentfulPaint, 2500, 4000))}`}>
              <div className="font-medium">Largest Contentful Paint</div>
              <div className="text-lg">{formatTime(metrics.largestContentfulPaint)}</div>
            </div>
          )}
          
          {metrics.cumulativeLayoutShift !== undefined && (
            <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus(metrics.cumulativeLayoutShift, 0.1, 0.25))}`}>
              <div className="font-medium">Cumulative Layout Shift</div>
              <div className="text-lg">{metrics.cumulativeLayoutShift.toFixed(3)}</div>
            </div>
          )}
          
          {metrics.firstInputDelay && (
            <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus(metrics.firstInputDelay, 100, 300))}`}>
              <div className="font-medium">First Input Delay</div>
              <div className="text-lg">{formatTime(metrics.firstInputDelay)}</div>
            </div>
          )}
        </div>

        {/* Resource Metrics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Resource Metrics</h3>
          
          {metrics.resourceCount && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Total Resources</div>
              <div className="text-lg">{metrics.resourceCount}</div>
            </div>
          )}
          
          {metrics.totalResourceSize && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Total Size</div>
              <div className="text-lg">{formatBytes(metrics.totalResourceSize)}</div>
            </div>
          )}
          
          {metrics.jsSize && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">JavaScript Size</div>
              <div className="text-lg">{formatBytes(metrics.jsSize)}</div>
            </div>
          )}
          
          {metrics.cssSize && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">CSS Size</div>
              <div className="text-lg">{formatBytes(metrics.cssSize)}</div>
            </div>
          )}
        </div>

        {/* Memory Metrics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Memory Usage</h3>
          
          {metrics.usedJSHeapSize && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Used JS Heap</div>
              <div className="text-lg">{formatBytes(metrics.usedJSHeapSize)}</div>
            </div>
          )}
          
          {metrics.totalJSHeapSize && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Total JS Heap</div>
              <div className="text-lg">{formatBytes(metrics.totalJSHeapSize)}</div>
            </div>
          )}
          
          {metrics.jsHeapSizeLimit && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">JS Heap Limit</div>
              <div className="text-lg">{formatBytes(metrics.jsHeapSizeLimit)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        Performance metrics are collected in real-time. Run an audit for comprehensive analysis.
      </div>
    </div>
  );
}
