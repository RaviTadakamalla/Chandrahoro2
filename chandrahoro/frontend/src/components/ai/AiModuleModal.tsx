/**
 * AI Module Modal Component
 * 
 * Modal/drawer overlay for displaying AI module content
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AiModuleModalProps } from '@/lib/ai/types';

export function AiModuleModal({ 
  module, 
  isOpen, 
  onClose, 
  chartData, 
  birthDetails, 
  preferences, 
  user 
}: AiModuleModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !module) {
    return null;
  }

  const ModuleComponent = module.Component;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {module.meta.icon && (
              <div className="p-2 rounded-lg bg-saffron-50 dark:bg-saffron-900/20">
                <module.meta.icon className="h-5 w-5 text-saffron-600 dark:text-saffron-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-charcoal dark:text-white">
                {module.meta.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {module.meta.description}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <ModuleComponent
            chartData={chartData}
            birthDetails={birthDetails}
            preferences={preferences}
            user={user}
            onClose={onClose}
          />
        </CardContent>
      </Card>
    </div>
  );
}
