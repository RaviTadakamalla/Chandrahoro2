'use client';

import { useState } from 'react';
import { Download, FileText, Image, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api';
import { API_URL } from '@/lib/constants';
import type { ChartRequest } from '@/lib/api';

interface ChartExportMenuProps {
  chartRequest: ChartRequest;
  className?: string;
  onExportStart?: () => void;
}

export default function ChartExportMenu({ chartRequest, className = "", onExportStart }: ChartExportMenuProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const downloadFile = (blob: Blob, filename: string, mimeType: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'pdf' | 'svg' | 'png' | 'json') => {
    setIsExporting(format);
    onExportStart?.(); // Call the callback when export starts

    try {
      let response: Response;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'pdf':
          response = await fetch(`${API_URL}/api/v1/chart/export/pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chartRequest),
          });
          filename = 'vedic_chart.pdf';
          mimeType = 'application/pdf';
          break;

        case 'svg':
          response = await fetch(`${API_URL}/api/v1/chart/export/svg`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chartRequest),
          });
          filename = 'vedic_chart.svg';
          mimeType = 'image/svg+xml';
          break;

        case 'png':
          response = await fetch(`${API_URL}/api/v1/chart/export/png`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chartRequest),
          });
          filename = 'vedic_chart.png';
          mimeType = 'image/png';
          break;

        case 'json':
          response = await fetch(`${API_URL}/api/v1/chart/export/json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chartRequest),
          });
          filename = 'vedic_chart.json';
          mimeType = 'application/json';
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${errorText}`);
      }

      const blob = await response.blob();
      downloadFile(blob, filename, mimeType);
      
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={isExporting !== null}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? `Exporting ${isExporting.toUpperCase()}...` : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Chart</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF Report
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('png')}
          disabled={isExporting !== null}
        >
          <Image className="h-4 w-4 mr-2" />
          PNG Image
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('svg')}
          disabled={isExporting !== null}
        >
          <Image className="h-4 w-4 mr-2" />
          SVG Vector
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          disabled={isExporting !== null}
        >
          <FileJson className="h-4 w-4 mr-2" />
          JSON Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
