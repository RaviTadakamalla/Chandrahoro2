/**
 * Chart Interpretation AI Module
 * 
 * Provides comprehensive AI-powered chart interpretation using the existing backend API
 */

import React, { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { API_URL } from '@/lib/constants';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

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
}

// Main component
export default function ChartInterpretationModule({ chartData, user, onClose }: AiModuleProps) {
  const [interpretation, setInterpretation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateInterpretation = async () => {
    if (!chartData || !user) return;

    setLoading(true);
    setError('');

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

      if (result.success && result.content) {
        setInterpretation(result.content);
      } else {
        setError(result.error || 'Failed to generate interpretation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInterpretation();
  }, [chartData, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal dark:text-white">AI Chart Interpretation</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive analysis powered by advanced AI
          </p>
        </div>
        <Button
          onClick={generateInterpretation}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
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
          ) : interpretation ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {interpretation}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Generate" to create your AI interpretation</p>
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
