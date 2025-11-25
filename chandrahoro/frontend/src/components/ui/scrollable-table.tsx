import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
  showScrollIndicators?: boolean;
}

export const ScrollableTable: React.FC<ScrollableTableProps> = ({ 
  children, 
  className = '',
  showScrollIndicators = true 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      
      // Show indicators only on mobile/tablet
      const isMobile = window.innerWidth < 768;
      setShowLeftIndicator(isMobile && scrollLeft > 0);
      setShowRightIndicator(isMobile && scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Left scroll indicator */}
      {showScrollIndicators && showLeftIndicator && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-r from-white dark:from-gray-800 to-transparent w-8 h-full flex items-center">
            <button
              onClick={scrollLeft}
              className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Right scroll indicator */}
      {showScrollIndicators && showRightIndicator && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full flex items-center justify-end">
            <button
              onClick={scrollRight}
              className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-thin ${className}`}
        onScroll={checkScrollability}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
        }}
      >
        {children}
      </div>

      {/* Mobile swipe hint */}
      {showScrollIndicators && (canScrollLeft || canScrollRight) && (
        <div className="md:hidden text-center mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ← Swipe to scroll →
          </span>
        </div>
      )}
    </div>
  );
};

// Enhanced table wrapper with better mobile experience
export const ResponsiveTable: React.FC<{
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}> = ({ children, className = '', minWidth = '600px' }) => {
  return (
    <ScrollableTable className={className}>
      <div style={{ minWidth }} className="w-full">
        {children}
      </div>
    </ScrollableTable>
  );
};

// Table with sticky header
export const StickyHeaderTable: React.FC<{
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}> = ({ children, className = '', minWidth = '600px' }) => {
  return (
    <ScrollableTable className={`${className} max-h-96`}>
      <div style={{ minWidth }} className="w-full">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
          {children}
        </div>
      </div>
    </ScrollableTable>
  );
};

// Compact mobile table
export const CompactTable: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`md:hidden ${className}`}>
      <ScrollableTable>
        <table className="w-full text-sm border-collapse">
          {children}
        </table>
      </ScrollableTable>
    </div>
  );
};

// Full-width desktop table
export const DesktopTable: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`hidden md:block ${className}`}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
};

export default ScrollableTable;
