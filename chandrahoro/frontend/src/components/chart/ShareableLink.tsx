import React, { useState } from 'react';
import { Share2, Copy, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareableLinkProps {
  chartData: any;
  className?: string;
}

const ShareableLink: React.FC<ShareableLinkProps> = ({ chartData, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const generateShareableLink = () => {
    // Create a shareable URL with chart parameters
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    // Use birth_info instead of birth_details based on the chart data structure
    if (chartData.birth_info) {
      params.set('name', chartData.birth_info.name || 'Chart');
      params.set('date', chartData.birth_info.date);
      params.set('time', chartData.birth_info.time || '12:00');
      params.set('location', chartData.birth_info.location_name);
      params.set('latitude', chartData.birth_info.latitude.toString());
      params.set('longitude', chartData.birth_info.longitude.toString());
      params.set('timezone', chartData.birth_info.timezone || 'UTC');
    }

    return `${baseUrl}/chart/shared?${params.toString()}`;
  };

  const copyToClipboard = async () => {
    try {
      const shareableUrl = generateShareableLink();
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setShowToast(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    const shareableUrl = generateShareableLink();
    const textArea = document.createElement('textarea');
    textArea.value = shareableUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setShowToast(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        const shareableUrl = generateShareableLink();
        await navigator.share({
          title: `Vedic Chart - ${chartData.birth_info?.name || 'Horoscope'}`,
          text: 'Check out this Vedic astrology chart',
          url: shareableUrl,
        });
      } catch (err) {
        console.error('Native sharing failed:', err);
        // Fallback to copy
        copyToClipboard();
      }
    } else {
      // Fallback to copy for browsers without native sharing
      copyToClipboard();
    }
  };

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Copy Link Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center space-x-2"
        >
          {copied ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <Copy size={16} />
          )}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </Button>

        {/* Native Share Button (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            size="sm"
            onClick={shareNatively}
            className="flex items-center space-x-2"
          >
            <Share2 size={16} />
            <span>Share</span>
          </Button>
        )}

        {/* Link Icon for visual indication */}
        <div className="text-gray-400">
          <Link size={16} />
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Check size={16} />
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareableLink;
