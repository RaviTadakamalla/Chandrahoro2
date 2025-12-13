/**
 * MethodologySelector Component
 * 
 * Displays the current astrology methodology and allows users to switch between
 * different methodologies (Parashara, KP, Jaimini, Western, etc.)
 */

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Info, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface MethodologyInfo {
  name: string;
  display_name: string;
  description: string;
  is_available: boolean;
  supported_features: string[];
}

interface MethodologySelectorProps {
  currentMethodology: string;
  onMethodologyChange: (methodology: string) => void;
  className?: string;
  showDetails?: boolean;
  calculatedMethodologies?: string[]; // List of successfully calculated methodologies
}

export default function MethodologySelector({
  currentMethodology,
  onMethodologyChange,
  className = '',
  showDetails = false,
  calculatedMethodologies = [],
}: MethodologySelectorProps) {
  const [methodologies, setMethodologies] = useState<MethodologyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<MethodologyInfo | null>(null);

  useEffect(() => {
    fetchMethodologies();
  }, []);

  useEffect(() => {
    if (methodologies.length > 0) {
      const current = methodologies.find(m => m.name === currentMethodology);
      setSelectedMethod(current || null);
    }
  }, [currentMethodology, methodologies]);

  const fetchMethodologies = async () => {
    try {
      // In production, use relative URL (empty string) for same-origin requests
      const isDev = process.env.NODE_ENV === 'development';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (isDev ? 'http://localhost:8000' : '');
      const response = await fetch(`${apiUrl}/api/v1/methodologies/`);
      const data = await response.json();
      setMethodologies(data.methodologies || []);
    } catch (error) {
      console.error('Failed to fetch methodologies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodologyChange = (value: string) => {
    const methodology = methodologies.find(m => m.name === value);
    // Allow switching if methodology is available OR if it was calculated (even with errors)
    const isCalculated = calculatedMethodologies.length === 0 || calculatedMethodologies.includes(value);
    if (methodology && (methodology.is_available || isCalculated)) {
      onMethodologyChange(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading methodologies...
      </div>
    );
  }

  if (showDetails && selectedMethod) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Calculation Methodology
              </CardTitle>
              <CardDescription>
                Choose the astrology system for chart calculations
              </CardDescription>
            </div>
            <Badge variant={selectedMethod.is_available ? "default" : "secondary"}>
              {selectedMethod.is_available ? "Active" : "Coming Soon"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={currentMethodology} onValueChange={handleMethodologyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select methodology" />
            </SelectTrigger>
            <SelectContent>
              {methodologies.map((method) => (
                <SelectItem
                  key={method.name}
                  value={method.name}
                  disabled={!method.is_available}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{method.display_name}</span>
                    {!method.is_available && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMethod && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedMethod.description}
              </p>
              <div>
                <h4 className="text-sm font-medium mb-2">Supported Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-muted-foreground">
                  {selectedMethod.supported_features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact version
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">
              {selectedMethod?.description || 'Select a calculation methodology'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Select value={currentMethodology} onValueChange={handleMethodologyChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select methodology" />
        </SelectTrigger>
        <SelectContent>
          {methodologies.map((method) => (
            <SelectItem
              key={method.name}
              value={method.name}
              disabled={!method.is_available}
            >
              <div className="flex items-center gap-2">
                <span>{method.display_name}</span>
                {!method.is_available && (
                  <Badge variant="outline" className="text-xs">Soon</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

