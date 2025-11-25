import React from 'react';

/**
 * Loading fallback for chart components
 */
export function ChartFallback() {
  return (
    <div className="flex items-center justify-center aspect-square border rounded-lg bg-muted/50">
      <div className="w-48 h-48 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/**
 * Loading fallback for table components
 */
export function TableFallback({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-muted rounded animate-pulse" 
                  style={{ 
                    width: colIndex === 0 ? '80%' : colIndex === columns - 1 ? '60%' : '100%' 
                  }} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading fallback for card components
 */
export function CardFallback() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

/**
 * Loading fallback for section components
 */
export function SectionFallback() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
      </div>
    </div>
  );
}

/**
 * Loading fallback for button components
 */
export function ButtonFallback() {
  return (
    <div className="h-10 bg-muted rounded animate-pulse w-24" />
  );
}

/**
 * Loading fallback for menu components
 */
export function MenuFallback() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-8 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Loading fallback for display components
 */
export function DisplayFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Generic loading fallback with customizable content
 */
interface GenericFallbackProps {
  type?: 'chart' | 'table' | 'card' | 'section' | 'button' | 'menu' | 'display';
  className?: string;
  rows?: number;
  columns?: number;
}

export function GenericFallback({ 
  type = 'section', 
  className = "", 
  rows = 5, 
  columns = 4 
}: GenericFallbackProps) {
  const fallbackComponents = {
    chart: ChartFallback,
    table: () => <TableFallback rows={rows} columns={columns} />,
    card: CardFallback,
    section: SectionFallback,
    button: ButtonFallback,
    menu: MenuFallback,
    display: DisplayFallback,
  };

  const FallbackComponent = fallbackComponents[type];

  return (
    <div className={className}>
      <FallbackComponent />
    </div>
  );
}
