import React from 'react';

interface BrandMarkProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function BrandMark({
  href = '/',
  size = 'md',
  showText = true,
  className = '',
}: BrandMarkProps) {

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const mandalaColor = '#F46A1F';

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mandala SVG */}
      <svg
        className={`${sizeClasses[size]} flex-shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="50" cy="50" r="48" stroke={mandalaColor} strokeWidth="2" />
        
        {/* Inner mandala pattern - simplified */}
        <circle cx="50" cy="50" r="40" stroke={mandalaColor} strokeWidth="1.5" opacity="0.7" />
        <circle cx="50" cy="50" r="32" stroke={mandalaColor} strokeWidth="1.5" opacity="0.5" />
        <circle cx="50" cy="50" r="24" stroke={mandalaColor} strokeWidth="1.5" opacity="0.3" />
        
        {/* Center dot */}
        <circle cx="50" cy="50" r="4" fill={mandalaColor} />
        
        {/* Decorative petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 35 * Math.cos(rad);
          const y1 = 50 + 35 * Math.sin(rad);
          const x2 = 50 + 42 * Math.cos(rad);
          const y2 = 50 + 42 * Math.sin(rad);
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={mandalaColor}
              strokeWidth="2"
              opacity="0.6"
            />
          );
        })}
      </svg>

      {/* Text */}
      {showText && (
        <span
          className={`${textSizeClasses[size]} font-poppins font-bold text-saffron-500 dark:text-saffron-400`}
        >
          Chandrahoro
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <div
        className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        onClick={() => {
          window.location.href = href;
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.location.href = href;
          }
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

