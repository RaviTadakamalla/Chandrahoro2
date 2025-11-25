/**
 * ChandraHoro V2.1 - Reading Actions Component
 * 
 * Action buttons for reading interactions including save and share functionality.
 * Provides native sharing with clipboard fallback and save state management.
 * 
 * Features:
 * - Save/unsave toggle with visual feedback
 * - Native share API with clipboard fallback
 * - Loading states and error handling
 * - Responsive button design
 */

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReadingActionsProps {
  reading: {
    id: string;
    readingDate: string;
    highlights?: string[];
    isSaved?: boolean;
  };
}

export function ReadingActions({ reading }: ReadingActionsProps) {
  const [isSaved, setIsSaved] = useState(reading.isSaved || false);
  const [isSharing, setIsSharing] = useState(false);
  const queryClient = useQueryClient();
  
  // Save/unsave mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/readings/${reading.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSaved: !isSaved }),
      });
      if (!res.ok) throw new Error('Failed to save reading');
      return res.json();
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Reading unsaved' : 'Reading saved!');
      queryClient.invalidateQueries({ queryKey: ['daily-reading'] });
    },
    onError: () => {
      toast.error('Failed to save reading');
    },
  });
  
  // Share functionality
  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Prepare share content
      const shareTitle = `My Daily Reading - ${new Date(reading.readingDate).toLocaleDateString()}`;
      const shareText = reading.highlights?.length 
        ? `✨ Key Highlights:\n${reading.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
        : 'Check out my personalized daily astrological reading!';
      const shareUrl = window.location.href;
      
      // Try native share API first
      if (navigator.share && navigator.canShare) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
          toast.success('Reading shared successfully!');
          return;
        } catch (error: any) {
          // User cancelled or share failed, fall back to clipboard
          if (error.name !== 'AbortError') {
            console.warn('Native share failed:', error);
          }
        }
      }
      
      // Fallback: copy to clipboard
      const fullText = `${shareTitle}\n\n${shareText}\n\n${shareUrl}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
        toast.success('Reading copied to clipboard!');
      } else {
        // Final fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast.success('Reading copied to clipboard!');
        } catch (error) {
          toast.error('Unable to copy reading');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share reading');
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="text-white hover:bg-white/20 transition-colors"
        title={isSaved ? 'Unsave reading' : 'Save reading'}
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        )}
      </Button>
      
      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        disabled={isSharing}
        className="text-white hover:bg-white/20 transition-colors"
        title="Share reading"
      >
        {isSharing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
