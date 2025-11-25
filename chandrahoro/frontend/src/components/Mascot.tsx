import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  showConfetti?: boolean;
  className?: string;
}

export function Mascot({
  size = 'md',
  animate = true,
  showConfetti = false,
  className = '',
}: MascotProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-56 h-56',
    xl: 'w-72 h-72',
  };

  const animationClass = animate && !prefersReducedMotion ? 'animate-bob' : '';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Mandala background watermark */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* Mascot image */}
      <div className={`relative ${sizeClasses[size]} ${animationClass}`}>
        <Image
          src="/mascot.svg"
          alt="Chandrahoro Monk-Bird Mascot"
          fill
          className="object-contain drop-shadow-lg"
          priority={false}
        />
      </div>

      {/* Confetti particles */}
      {showConfetti && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: i % 2 === 0 ? '#F46A1F' : '#DAF56B',
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

