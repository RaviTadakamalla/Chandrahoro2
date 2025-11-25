import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChartExportMenu from '@/components/chart/ChartExportMenu';
import type { ChartRequest } from '@/lib/api';

interface FloatingActionButtonProps {
  chartRequest: ChartRequest | null;
}

export default function FloatingActionButton({ chartRequest }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!chartRequest) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Export Menu (Mobile Modal / Desktop Dropdown) */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2">
            <div className="bg-white rounded-lg shadow-lg border p-4 min-w-[200px] md:min-w-[250px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Export Chart</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChartExportMenu 
                chartRequest={chartRequest} 
                className="w-full"
                onExportStart={() => setIsOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main FAB Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Download className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
}
