'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Heart, Activity, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHorizontalSwipe } from '@/hooks/useSwipe';
import type { ReadingTabsProps, ReadingTab, TabConfig, LifeAspectReading } from '@/types/reading';

/**
 * Tab Configuration
 */
const TAB_CONFIGS: Record<ReadingTab, TabConfig> = {
  work: {
    id: 'work',
    label: 'Work',
    icon: Briefcase,
    color: 'blue',
    description: 'Career and professional life',
  },
  love: {
    id: 'love',
    label: 'Love',
    icon: Heart,
    color: 'pink',
    description: 'Relationships and romance',
  },
  health: {
    id: 'health',
    label: 'Health',
    icon: Activity,
    color: 'green',
    description: 'Physical and mental wellbeing',
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: 'yellow',
    description: 'Money and financial matters',
  },
};

/**
 * ReadingTabs Component
 * 
 * Tab switcher for different life aspects (Work/Love/Health/Finance)
 * with smooth transitions and responsive design.
 * 
 * Features:
 * - Pill-style tabs with gradient backgrounds
 * - Smooth slide animation between tabs
 * - Score-based color coding
 * - Responsive horizontal scroll on mobile
 * - Keyboard navigation support
 */
export function ReadingTabs({
  content,
  activeTab = 'work',
  onTabChange,
  className = '',
}: ReadingTabsProps) {
  const [currentTab, setCurrentTab] = useState<ReadingTab>(activeTab);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  // Get tab order for swipe navigation
  const tabOrder: ReadingTab[] = ['work', 'love', 'health', 'finance'];
  const currentIndex = tabOrder.indexOf(currentTab);

  const goToNextTab = () => {
    const nextIndex = (currentIndex + 1) % tabOrder.length;
    handleTabChange(tabOrder[nextIndex]);
  };

  const goToPrevTab = () => {
    const prevIndex = currentIndex === 0 ? tabOrder.length - 1 : currentIndex - 1;
    handleTabChange(tabOrder[prevIndex]);
  };

  // Swipe handlers for mobile
  const swipeHandlers = useHorizontalSwipe(goToNextTab, goToPrevTab, {
    threshold: 50,
    velocity: 0.3,
  });

  const handleTabChange = async (tab: ReadingTab) => {
    if (tab === currentTab || isTransitioning) return;

    setIsTransitioning(true);
    
    // Smooth transition delay
    setTimeout(() => {
      setCurrentTab(tab);
      onTabChange?.(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const currentContent = content[currentTab];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tab Navigation */}
      <div className="relative">
        {/* Horizontal scroll container for mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {Object.values(TAB_CONFIGS).map((tab) => (
            <TabButton
              key={tab.id}
              config={tab}
              isActive={currentTab === tab.id}
              score={content[tab.id]?.score}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
      </div>

      {/* Tab Content with Swipe Support */}
      <div
        className="relative min-h-[200px] touch-pan-y"
        {...swipeHandlers}
      >
        <div
          className={cn(
            'transition-all duration-300 ease-out',
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          )}
        >
          {currentContent ? (
            <TabContent content={currentContent} config={TAB_CONFIGS[currentTab]} />
          ) : (
            <TabContentEmpty config={TAB_CONFIGS[currentTab]} />
          )}
        </div>

        {/* Swipe indicator for mobile */}
        <div className="md:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>Swipe to navigate</span>
          <div className="flex gap-1">
            {tabOrder.map((tab, index) => (
              <div
                key={tab}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  index === currentIndex ? 'bg-saffron-500' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Tab Button Component
 */
interface TabButtonProps {
  config: TabConfig;
  isActive: boolean;
  score?: number;
  onClick: () => void;
}

function TabButton({ config, isActive, score, onClick }: TabButtonProps) {
  const { icon: Icon, label, color } = config;
  
  // Score-based styling
  const getScoreColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 7) return 'green';
    if (score >= 4) return 'yellow';
    return 'red';
  };

  const scoreColor = getScoreColor(score);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap',
        'hover:scale-105 active:scale-95',
        isActive
          ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-lg hover:from-saffron-600 hover:to-gold-600'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
      aria-label={`${label} reading (${score ? `Score: ${score}/10` : 'No score'})`}
    >
      <Icon className={cn('h-4 w-4', isActive && 'text-white')} />
      <span className="font-medium">{label}</span>
      
      {/* Score indicator */}
      {score && (
        <div
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
            isActive
              ? 'bg-white/20 text-white'
              : scoreColor === 'green'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : scoreColor === 'yellow'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          {score}
        </div>
      )}
    </Button>
  );
}

/**
 * Tab Content Component
 */
interface TabContentProps {
  content: LifeAspectReading;
  config: TabConfig;
}

function TabContent({ content, config }: TabContentProps) {
  const { icon: Icon } = config;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-saffron-50 to-gold-50 dark:from-saffron-900/20 dark:to-gold-900/20">
          <Icon className="h-5 w-5 text-saffron-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {content.title}
            </h3>
            <ScoreBadge score={content.score} />
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>
      </div>

      {/* Key Points */}
      {content.keyPoints && content.keyPoints.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Key Insights</h4>
          <div className="space-y-2">
            {content.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-saffron-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advice */}
      {content.advice && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-saffron-50/50 to-gold-50/50 dark:from-saffron-900/10 dark:to-gold-900/10 border border-saffron-200/30 dark:border-saffron-800/30">
          <h4 className="text-sm font-medium text-saffron-700 dark:text-saffron-300 mb-2">
            Guidance
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {content.advice}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Score Badge Component
 */
function ScoreBadge({ score }: { score: number }) {
  const getScoreConfig = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-white' };
    if (score >= 6) return { label: 'Good', color: 'bg-green-400', textColor: 'text-white' };
    if (score >= 4) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-white' };
    if (score >= 2) return { label: 'Challenging', color: 'bg-orange-500', textColor: 'text-white' };
    return { label: 'Difficult', color: 'bg-red-500', textColor: 'text-white' };
  };

  const config = getScoreConfig(score);

  return (
    <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color, config.textColor)}>
      <span>{score}/10</span>
      <span>•</span>
      <span>{config.label}</span>
    </div>
  );
}

/**
 * Empty Tab Content Component
 */
function TabContentEmpty({ config }: { config: TabConfig }) {
  const { icon: Icon, label, description } = config;
  
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        No {label} Reading Available
      </h3>
      <p className="text-xs text-muted-foreground">
        {description} insights are not available for this reading.
      </p>
    </div>
  );
}

/**
 * Skeleton loader for ReadingTabs
 */
export function ReadingTabsSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Tab buttons skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-9 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
