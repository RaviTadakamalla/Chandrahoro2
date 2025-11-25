/**
 * AI Module Card Component
 * 
 * Individual card for displaying AI module information
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AiModuleCardProps } from '@/lib/ai/types';

export function AiModuleCard({ module, onExplore }: AiModuleCardProps) {
  const IconComponent = module.meta.icon;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prediction':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Interpretation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Compatibility':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Remedies':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Transit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-saffron-200 dark:hover:border-saffron-700 group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className="p-2 rounded-lg bg-saffron-50 dark:bg-saffron-900/20 group-hover:bg-saffron-100 dark:group-hover:bg-saffron-900/30 transition-colors">
                <IconComponent className="h-5 w-5 text-saffron-600 dark:text-saffron-400" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg leading-tight">{module.meta.title}</CardTitle>
            </div>
          </div>
          <Badge className={getCategoryColor(module.meta.category)} variant="secondary">
            {module.meta.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {module.meta.description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {module.meta.requiresChart && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Chart Required
              </span>
            )}
            {module.meta.requiresAuth && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Login Required
              </span>
            )}
          </div>
        </div>
        
        <Button 
          onClick={() => onExplore(module)}
          className="w-full mt-4 bg-saffron-500 hover:bg-saffron-600 text-white"
          size="sm"
        >
          Explore
        </Button>
      </CardContent>
    </Card>
  );
}
