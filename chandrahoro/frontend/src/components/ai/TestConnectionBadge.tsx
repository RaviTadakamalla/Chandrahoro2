import React from 'react';
import { TestConnectionResult } from '@/types/llm';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface TestConnectionBadgeProps {
  result: TestConnectionResult | null;
  testing: boolean;
  className?: string;
}

export function TestConnectionBadge({
  result,
  testing,
  className
}: TestConnectionBadgeProps) {
  if (testing) {
    return (
      <Badge variant="secondary" className={`gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Testing...
      </Badge>
    );
  }

  if (!result) {
    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        <Clock className="h-3 w-3" />
        Not tested
      </Badge>
    );
  }

  if (result.ok) {
    return (
      <Badge variant="default" className={`gap-1 bg-green-500 hover:bg-green-600 ${className}`}>
        <CheckCircle className="h-3 w-3" />
        Connected
        {result.latencyMs && (
          <span className="text-xs opacity-80">
            ({result.latencyMs}ms)
          </span>
        )}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={`gap-1 ${className}`}>
      <XCircle className="h-3 w-3" />
      Failed
    </Badge>
  );
}

interface TestConnectionDetailsProps {
  result: TestConnectionResult | null;
  testing: boolean;
}

export function TestConnectionDetails({
  result,
  testing
}: TestConnectionDetailsProps) {
  if (testing) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Testing connection to provider...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Click "Test Connection" to verify your configuration</span>
      </div>
    );
  }

  if (result.ok) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>
          Connection successful
          {result.latencyMs && ` (${result.latencyMs}ms response time)`}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-red-600">
        <XCircle className="h-4 w-4" />
        <span>Connection failed</span>
      </div>
      {result.error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border">
          <strong>Error:</strong> {result.error}
        </div>
      )}
    </div>
  );
}
