'use client';

import React, { useState, useCallback } from 'react';
import { 
  Share2, 
  Link, 
  MessageCircle, 
  Send, 
  Twitter, 
  Facebook, 
  Mail, 
  Download,
  Copy,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import type { ShareDialogProps, ShareMethod, ShareData } from '@/types/reading';

/**
 * Share Method Configuration
 */
const SHARE_METHODS = [
  {
    id: 'link' as ShareMethod,
    label: 'Copy Link',
    icon: Link,
    color: 'bg-blue-500',
    description: 'Share a link to this reading',
  },
  {
    id: 'whatsapp' as ShareMethod,
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500',
    description: 'Share via WhatsApp',
  },
  {
    id: 'telegram' as ShareMethod,
    label: 'Telegram',
    icon: Send,
    color: 'bg-blue-400',
    description: 'Share via Telegram',
  },
  {
    id: 'twitter' as ShareMethod,
    label: 'Twitter',
    icon: Twitter,
    color: 'bg-black dark:bg-white',
    description: 'Share on Twitter',
  },
  {
    id: 'facebook' as ShareMethod,
    label: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    description: 'Share on Facebook',
  },
  {
    id: 'email' as ShareMethod,
    label: 'Email',
    icon: Mail,
    color: 'bg-gray-600',
    description: 'Share via email',
  },
  {
    id: 'download' as ShareMethod,
    label: 'Download',
    icon: Download,
    color: 'bg-saffron-500',
    description: 'Download as PDF',
  },
];

/**
 * ShareDialog Component
 * 
 * Modal dialog for sharing daily readings with multiple options.
 * Supports native Web Share API on mobile and custom sharing methods.
 * 
 * Features:
 * - Native Web Share API support
 * - Multiple sharing platforms
 * - Copy to clipboard functionality
 * - Download as PDF option
 * - Responsive grid layout
 * - Success/error feedback
 */
export function ShareDialog({
  reading,
  isOpen,
  onClose,
  onShare,
}: ShareDialogProps) {
  const [isSharing, setIsSharing] = useState<ShareMethod | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if native Web Share API is available
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleShare = useCallback(async (method: ShareMethod) => {
    if (isSharing) return;

    setIsSharing(method);

    try {
      const shareData = await generateShareData(reading, method);
      
      // Handle native share for mobile
      if (method === 'link' && hasNativeShare) {
        await navigator.share({
          title: reading.title,
          text: reading.summary,
          url: shareData.url,
        });
        
        toast.success('Shared successfully!');
        onClose();
        return;
      }

      // Handle specific share methods
      switch (method) {
        case 'link':
          await copyToClipboard(shareData.url || '');
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          toast.success('Link copied to clipboard!');
          break;

        case 'whatsapp':
          openWhatsApp(shareData);
          break;

        case 'telegram':
          openTelegram(shareData);
          break;

        case 'twitter':
          openTwitter(shareData);
          break;

        case 'facebook':
          openFacebook(shareData);
          break;

        case 'email':
          openEmail(shareData);
          break;

        case 'download':
          await downloadReading(reading);
          toast.success('Download started!');
          break;

        default:
          throw new Error(`Unsupported share method: ${method}`);
      }

      onShare?.(method, shareData);
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsSharing(null);
    }
  }, [reading, hasNativeShare, onShare, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-saffron-600" />
            Share Your Reading
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reading Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-saffron-50 to-gold-50 dark:from-saffron-900/20 dark:to-gold-900/20 border border-saffron-200/30 dark:border-saffron-800/30">
            <h3 className="font-medium text-sm text-foreground mb-1">
              {reading.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {reading.summary}
            </p>
          </div>

          {/* Share Methods Grid */}
          <div className="grid grid-cols-2 gap-3">
            {SHARE_METHODS.map((method) => (
              <ShareMethodButton
                key={method.id}
                method={method}
                isLoading={isSharing === method.id}
                isCopied={method.id === 'link' && copiedLink}
                onClick={() => handleShare(method.id)}
              />
            ))}
          </div>

          {/* Native Share Button (Mobile) */}
          {hasNativeShare && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleShare('link')}
              disabled={isSharing !== null}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via System
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Share Method Button Component
 */
interface ShareMethodButtonProps {
  method: typeof SHARE_METHODS[0];
  isLoading: boolean;
  isCopied: boolean;
  onClick: () => void;
}

function ShareMethodButton({ method, isLoading, isCopied, onClick }: ShareMethodButtonProps) {
  const { icon: Icon, label, color, description } = method;

  return (
    <Button
      variant="outline"
      className={cn(
        'h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={isLoading}
      aria-label={description}
    >
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', color)}>
        {isCopied ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <Icon className="h-4 w-4 text-white" />
        )}
      </div>
      <span className="text-xs font-medium">
        {isCopied ? 'Copied!' : label}
      </span>
    </Button>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

async function generateShareData(reading: any, method: ShareMethod): Promise<ShareData> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/reading/${reading.id}`;
  
  const shareText = `Check out my daily astrology reading: "${reading.title}"`;
  
  return {
    url: shareUrl,
    text: shareText,
    title: reading.title,
    filename: `daily-reading-${reading.readingDate}.pdf`,
    format: method === 'download' ? 'pdf' : undefined,
  };
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

function openWhatsApp(data: ShareData): void {
  const text = encodeURIComponent(`${data.text}\n\n${data.url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function openTelegram(data: ShareData): void {
  const text = encodeURIComponent(`${data.text}\n\n${data.url}`);
  window.open(`https://t.me/share/url?url=${encodeURIComponent(data.url || '')}&text=${text}`, '_blank');
}

function openTwitter(data: ShareData): void {
  const text = encodeURIComponent(`${data.text}\n\n${data.url}`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function openFacebook(data: ShareData): void {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url || '')}`, '_blank');
}

function openEmail(data: ShareData): void {
  const subject = encodeURIComponent(data.title || 'Daily Astrology Reading');
  const body = encodeURIComponent(`${data.text}\n\n${data.url}`);
  window.open(`mailto:?subject=${subject}&body=${body}`);
}

async function downloadReading(reading: any): Promise<void> {
  try {
    // This would typically call an API endpoint to generate PDF
    const response = await fetch(`/api/readings/${reading.id}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format: 'pdf' }),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-reading-${reading.readingDate}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}
