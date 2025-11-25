import React from 'react';
import { Button } from '@/components/ui/button';

interface ChartStyleToggleProps {
  currentStyle: 'north' | 'south';
  onStyleChange: (style: 'north' | 'south') => void;
}

export default function ChartStyleToggle({ currentStyle, onStyleChange }: ChartStyleToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={currentStyle === 'north' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onStyleChange('north')}
        className="text-xs"
      >
        North Indian
      </Button>
      <Button
        variant={currentStyle === 'south' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onStyleChange('south')}
        className="text-xs"
      >
        South Indian
      </Button>
    </div>
  );
}
