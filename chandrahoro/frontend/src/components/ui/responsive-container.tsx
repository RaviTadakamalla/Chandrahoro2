import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'px-2 py-2',
  md: 'px-4 py-4',
  lg: 'px-6 py-6',
  xl: 'px-8 py-8'
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md',
  center = true
}) => {
  return (
    <div className={cn(
      'w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      center && 'mx-auto',
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}) => {
  const gridCols = cn(
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`
  );

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first flex component
interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: 'row' | 'col';
    tablet?: 'row' | 'col';
    desktop?: 'row' | 'col';
  };
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  className = '',
  direction = { mobile: 'col', tablet: 'row' },
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false
}) => {
  const flexDirection = cn(
    direction.mobile === 'row' ? 'flex-row' : 'flex-col',
    direction.tablet && (direction.tablet === 'row' ? 'md:flex-row' : 'md:flex-col'),
    direction.desktop && (direction.desktop === 'row' ? 'lg:flex-row' : 'lg:flex-col')
  );

  const alignItems = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyContent = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div className={cn(
      'flex',
      flexDirection,
      alignItems[align],
      justifyContent[justify],
      gapClasses[gap],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: {
    mobile?: 'left' | 'center' | 'right';
    tablet?: 'left' | 'center' | 'right';
    desktop?: 'left' | 'center' | 'right';
  };
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  size = { mobile: 'base' },
  weight = 'normal',
  align = { mobile: 'left' }
}) => {
  const textSize = cn(
    `text-${size.mobile}`,
    size.tablet && `md:text-${size.tablet}`,
    size.desktop && `lg:text-${size.desktop}`
  );

  const textAlign = cn(
    `text-${align.mobile}`,
    align.tablet && `md:text-${align.tablet}`,
    align.desktop && `lg:text-${align.desktop}`
  );

  const fontWeight = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <div className={cn(
      textSize,
      textAlign,
      fontWeight[weight],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first spacing component
interface ResponsiveSpacingProps {
  size?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  type?: 'margin' | 'padding';
  direction?: 'all' | 'x' | 'y' | 't' | 'b' | 'l' | 'r';
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  size = { mobile: 4 },
  type = 'margin',
  direction = 'all'
}) => {
  const prefix = type === 'margin' ? 'm' : 'p';
  const dir = direction === 'all' ? '' : direction;
  
  const spacingClass = cn(
    `${prefix}${dir}-${size.mobile}`,
    size.tablet && `md:${prefix}${dir}-${size.tablet}`,
    size.desktop && `lg:${prefix}${dir}-${size.desktop}`
  );

  return <div className={spacingClass} />;
};

// Hook for responsive breakpoints
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  React.useEffect(() => {
    const checkBreakpoint = () => {
      if (window.innerWidth >= 1024) {
        setBreakpoint('desktop');
      } else if (window.innerWidth >= 768) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
};

export default ResponsiveContainer;
