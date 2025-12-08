/**
 * Prompt Module Card Component
 * 
 * Displays an AI module with its configuration status and actions.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, RotateCcw, Sparkles, CheckCircle } from 'lucide-react';
import { AiModuleInfo } from '@/types/ai-prompts';

interface PromptModuleCardProps {
  module: AiModuleInfo;
  isSelected?: boolean;
  onSelect: (module: AiModuleInfo) => void;
  onReset: (module: AiModuleInfo) => void;
}

export function PromptModuleCard({ module, isSelected = false, onSelect, onReset }: PromptModuleCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on the Reset button
    if ((e.target as HTMLElement).closest('button[data-reset-button]')) {
      return;
    }
    onSelect(module);
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset(module);
  };

  return (
    <Card
      shadow="md"
      hover
      className={`
        transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'border-2 border-saffron-500 shadow-lg ring-2 ring-saffron-200 dark:ring-saffron-800'
          : 'border hover:border-saffron-300'
        }
      `}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-saffron-100 dark:bg-saffron-900/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-saffron-600 dark:text-saffron-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.display_name}</CardTitle>
              <CardDescription className="mt-1">{module.description}</CardDescription>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant={module.has_custom_prompt ? "default" : "outline"}
            className={module.has_custom_prompt 
              ? "bg-saffron-500 text-white" 
              : "border-gray-300 text-gray-600"
            }
          >
            {module.has_custom_prompt ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Custom
              </>
            ) : (
              "System Default"
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Available Variables */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Available Variables:
          </p>
          <div className="flex flex-wrap gap-1">
            {module.available_variables.map((variable) => (
              <Badge 
                key={variable} 
                variant="outline" 
                className="text-xs bg-gray-50 dark:bg-gray-800"
              >
                {`{${variable}}`}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {module.has_custom_prompt && (
            <Button
              data-reset-button
              onClick={handleResetClick}
              variant="outline"
              className="flex-1 border-gray-300 hover:border-saffron-500 hover:text-saffron-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          )}
          {!module.has_custom_prompt && (
            <div className="flex-1 text-center text-sm text-gray-500 py-2">
              Click card to configure
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

