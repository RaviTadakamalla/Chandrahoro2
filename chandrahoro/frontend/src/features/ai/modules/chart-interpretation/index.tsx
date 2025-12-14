/**
 * Chart Interpretation AI Module
 * 
 * Provides comprehensive AI-powered chart interpretation using the existing backend API
 */

import React, { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle, RefreshCw, Download, Eye, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { API_URL } from '@/lib/constants';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';
import { HoroscopeReport, type HoroscopeReportData } from '@/components/horoscope/HoroscopeReport';
import { HtmlReportViewer } from '@/components/horoscope/HtmlReportViewer';
import { useAiReportCache } from '@/hooks/useAiReportCache';
import { useRouter } from 'next/router';

// Module metadata
export const meta: AiModuleMeta = {
  id: 'chart-interpretation',
  title: 'AI Chart Interpretation',
  description: 'Get comprehensive AI-powered analysis of your birth chart with detailed insights into personality, life patterns, and cosmic influences.',
  category: 'Interpretation',
  requiresChart: true,
  requiresAuth: true,
  featureFlag: 'chart-interpretation',
  icon: FileText,
  priority: 1,
};

interface InterpretationResponse {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  tokens?: {
    input: number;
    output: number;
  };
  report_id?: string; // ID of the auto-saved report
}

interface CachedReportData {
  outputFormat: 'markdown' | 'json';
  reportData: HoroscopeReportData | null;
  interpretation: string;
}

// Main component
export default function ChartInterpretationModule({ chartData, user, onClose }: AiModuleProps) {
  const router = useRouter();
  const [interpretation, setInterpretation] = useState<string>('');
  const [reportData, setReportData] = useState<HoroscopeReportData | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'json' | 'html'>('markdown');
  const [reportId, setReportId] = useState<string | null>(null);

  // Use the AI report cache hook
  const { cachedData, isCached, saveToCache } = useAiReportCache<CachedReportData>({
    moduleId: 'chart-interpretation',
    chartData,
    user,
  });

  // Load cached report on mount
  useEffect(() => {
    if (cachedData) {
      console.log('[chart-interpretation] Restoring cached report...');
      setOutputFormat(cachedData.outputFormat);
      setReportData(cachedData.reportData);
      setInterpretation(cachedData.interpretation);
    }
  }, [cachedData]);

  const generateInterpretation = async () => {
    if (!chartData || !user) return;

    setLoading(true);
    setError('');

    // Debug: Log the chart data being sent
    console.log('=== Chart Data Being Sent to API ===');
    console.log('Full chartData:', chartData);
    console.log('Birth Info:', chartData.birth_info);
    if (chartData.birth_info) {
      console.log('  Name:', chartData.birth_info.name);
      console.log('  Date:', chartData.birth_info.date);
      console.log('  Time:', chartData.birth_info.time);
      console.log('  Location:', chartData.birth_info.location_name);
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/ai/interpret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          chart_data: chartData,
          include_sections: ['personality', 'life_path', 'strengths', 'challenges', 'relationships', 'career']
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail) {
          // Handle FastAPI error format
          if (typeof errorData.detail === 'string') {
            setError(errorData.detail);
          } else if (Array.isArray(errorData.detail)) {
            setError(errorData.detail.map((e: any) => e.msg).join(', '));
          } else {
            setError('Failed to generate interpretation');
          }
        } else {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const result: InterpretationResponse = await response.json();

      // Save report ID if provided
      if (result.report_id) {
        setReportId(result.report_id);
        console.log('Report auto-saved with ID:', result.report_id);
      }

      if (result.success && result.content) {
        console.log('=== AI Chart Interpretation Debug ===');
        console.log('Raw content type:', typeof result.content);
        console.log('Raw content length:', result.content.length);
        console.log('First 500 chars:', result.content.substring(0, 500));

        // Try to parse as JSON first
        try {
          let contentToParse = result.content.trim();

          // Check if content is wrapped in markdown code blocks
          const jsonCodeBlockMatch = contentToParse.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          if (jsonCodeBlockMatch) {
            console.log('Found JSON in markdown code block, extracting...');
            contentToParse = jsonCodeBlockMatch[1].trim();
            console.log('Extracted content (first 200 chars):', contentToParse.substring(0, 200));
          }

          // Check if it starts with { or [ (valid JSON)
          if (!contentToParse.startsWith('{') && !contentToParse.startsWith('[')) {
            console.log('Content does not start with { or [, treating as markdown');
            throw new Error('Not JSON format');
          }

          console.log('Attempting to parse JSON...');
          const jsonData = JSON.parse(contentToParse);
          console.log('✅ JSON parsed successfully!');
          console.log('Parsed data keys:', Object.keys(jsonData));

          // Validate that it has the expected structure
          if (!jsonData.birth_details || !jsonData.planetary_positions) {
            console.warn('⚠️ JSON missing expected fields, treating as markdown');
            throw new Error('Invalid JSON structure');
          }

          console.log('✅ JSON structure validated');
          console.log('Setting reportData and outputFormat to json');

          setReportData(jsonData);
          setOutputFormat('json');
          setInterpretation(''); // Clear any previous markdown

          // Cache the report using the hook
          saveToCache({
            outputFormat: 'json' as const,
            reportData: jsonData,
            interpretation: '',
          });

          console.log('✅ State updated successfully');
        } catch (parseError) {
          console.log('❌ JSON parsing failed:', parseError);
          console.log('Treating as markdown instead');
          // If not JSON, treat as markdown
          setInterpretation(result.content);
          setOutputFormat('markdown');
          setReportData(null); // Clear any previous JSON data

          // Cache the markdown report using the hook
          saveToCache({
            outputFormat: 'markdown' as const,
            reportData: null,
            interpretation: result.content,
          });
        }
      } else {
        console.log('❌ No content in response or success=false');
        setError(result.error || 'Failed to generate interpretation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle download report
  const handleDownload = async () => {
    if (!reportId) {
      alert('No report available to download');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/ai-reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vedic-astrology-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  // Handle HTML report generation
  const generateHtmlReport = async () => {
    if (!chartData || !user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/v1/ai/generate-html-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          chart_data: chartData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            setError(errorData.detail);
          } else if (Array.isArray(errorData.detail)) {
            setError(errorData.detail.map((e: any) => e.msg).join(', '));
          } else {
            setError('Failed to generate HTML report');
          }
        } else {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const result = await response.json();

      if (result.success && result.html_content) {
        setHtmlContent(result.html_content);
        setOutputFormat('html');
        setReportId(result.report_id || null);
        console.log('HTML report generated successfully');
      } else {
        setError('Failed to generate HTML report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle view all reports
  const handleViewReports = () => {
    router.push('/my-reports');
  };

  // Check if we have any existing report
  const hasExistingReport = !!(reportData || interpretation || htmlContent);

  // Debug logging for render
  console.log('=== Render Debug ===');
  console.log('loading:', loading);
  console.log('outputFormat:', outputFormat);
  console.log('reportData:', reportData ? 'exists' : 'null');
  console.log('interpretation:', interpretation ? 'exists' : 'empty');
  console.log('reportData keys:', reportData ? Object.keys(reportData) : 'N/A');
  console.log('hasExistingReport:', hasExistingReport);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal dark:text-white">AI Chart Interpretation</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive analysis powered by advanced AI
          </p>
        </div>
        <div className="flex gap-2">
          {reportId && (
            <>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleViewReports}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                My Reports
              </Button>
            </>
          )}
          <Button
            onClick={generateInterpretation}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {hasExistingReport ? 'Regenerate' : 'Generate Report'}
          </Button>
          <Button
            onClick={generateHtmlReport}
            disabled={loading}
            variant="default"
            size="sm"
            className="bg-saffron-500 hover:bg-saffron-600"
          >
            <Globe className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate HTML Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-saffron-500" />
            Your Cosmic Blueprint
          </CardTitle>
          <CardDescription>
            AI-generated insights based on your birth chart configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
              <span className="ml-3 text-gray-600">Analyzing your chart...</span>
            </div>
          ) : htmlContent && outputFormat === 'html' ? (
            <div className="min-h-[600px]">
              <HtmlReportViewer
                htmlContent={htmlContent}
                personName={chartData?.birth_info?.name || 'User'}
              />
            </div>
          ) : reportData && outputFormat === 'json' ? (
            <>
              {(() => {
                try {
                  return <HoroscopeReport data={reportData} />;
                } catch (renderError) {
                  console.error('Error rendering HoroscopeReport:', renderError);
                  return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <strong className="text-red-700">Error rendering report:</strong>
                      <pre className="mt-2 text-xs overflow-auto">{String(renderError)}</pre>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">View raw data</summary>
                        <pre className="mt-2 text-xs overflow-auto max-h-96">
                          {JSON.stringify(reportData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  );
                }
              })()}
            </>
          ) : interpretation && outputFormat === 'markdown' ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {interpretation}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No AI interpretation generated yet</p>
              <p className="text-sm mb-6">Click "Generate Report" above to create your personalized cosmic blueprint</p>
              <Button
                onClick={generateInterpretation}
                disabled={loading}
                variant="default"
                size="lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Generate AI Interpretation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> AI interpretations are for guidance and entertainment purposes only. 
          Consult with a qualified astrologer for important life decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
