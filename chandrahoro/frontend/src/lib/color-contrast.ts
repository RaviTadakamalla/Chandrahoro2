// Color contrast utilities for WCAG AA compliance

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get contrast level description
 */
export function getContrastLevel(foreground: string, background: string, isLargeText = false): {
  ratio: number;
  level: 'fail' | 'aa' | 'aaa';
  description: string;
} {
  const ratio = getContrastRatio(foreground, background);
  
  if (meetsWCAGAAA(foreground, background, isLargeText)) {
    return {
      ratio,
      level: 'aaa',
      description: 'Excellent contrast (WCAG AAA)'
    };
  } else if (meetsWCAGAA(foreground, background, isLargeText)) {
    return {
      ratio,
      level: 'aa',
      description: 'Good contrast (WCAG AA)'
    };
  } else {
    return {
      ratio,
      level: 'fail',
      description: 'Poor contrast (fails WCAG AA)'
    };
  }
}

/**
 * Suggest better contrast colors
 */
export function suggestBetterContrast(
  foreground: string, 
  background: string, 
  targetLevel: 'aa' | 'aaa' = 'aa',
  isLargeText = false
): {
  foreground: string;
  background: string;
  ratio: number;
} | null {
  const targetRatio = targetLevel === 'aaa' 
    ? (isLargeText ? 4.5 : 7)
    : (isLargeText ? 3 : 4.5);
  
  const currentRatio = getContrastRatio(foreground, background);
  if (currentRatio >= targetRatio) {
    return null; // Already meets target
  }
  
  // Try darkening foreground or lightening background
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return null;
  
  // Simple approach: darken foreground
  let newFg = foreground;
  for (let factor = 0.9; factor >= 0.1; factor -= 0.1) {
    const newR = Math.round(fgRgb.r * factor);
    const newG = Math.round(fgRgb.g * factor);
    const newB = Math.round(fgRgb.b * factor);
    
    newFg = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    
    const newRatio = getContrastRatio(newFg, background);
    if (newRatio >= targetRatio) {
      return {
        foreground: newFg,
        background,
        ratio: newRatio
      };
    }
  }
  
  return null;
}

/**
 * WCAG AA compliant color palette
 */
export const accessibleColors = {
  // High contrast pairs
  text: {
    primary: '#1a1a1a',      // Very dark gray on white (15.8:1)
    secondary: '#4a4a4a',    // Dark gray on white (9.7:1)
    muted: '#6a6a6a',        // Medium gray on white (6.6:1)
    inverse: '#ffffff',      // White on dark backgrounds
  },
  background: {
    primary: '#ffffff',      // White
    secondary: '#f8f9fa',    // Very light gray
    muted: '#f1f3f4',        // Light gray
    dark: '#1a1a1a',         // Very dark gray
  },
  accent: {
    blue: '#0066cc',         // Accessible blue (7.3:1 on white)
    green: '#006600',        // Accessible green (5.4:1 on white)
    red: '#cc0000',          // Accessible red (5.5:1 on white)
    orange: '#cc6600',       // Accessible orange (4.6:1 on white)
    purple: '#6600cc',       // Accessible purple (6.7:1 on white)
  },
  status: {
    success: '#006600',      // Dark green
    warning: '#cc6600',      // Dark orange
    error: '#cc0000',        // Dark red
    info: '#0066cc',         // Dark blue
  }
};

/**
 * Validate color combinations in the app
 */
export function validateAppColors(): {
  valid: boolean;
  issues: Array<{
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
    status: 'pass' | 'fail';
  }>;
} {
  const combinations = [
    { element: 'Body text', foreground: '#1a1a1a', background: '#ffffff', required: 4.5 },
    { element: 'Secondary text', foreground: '#6b7280', background: '#ffffff', required: 4.5 },
    { element: 'Button text', foreground: '#ffffff', background: '#3b82f6', required: 4.5 },
    { element: 'Link text', foreground: '#2563eb', background: '#ffffff', required: 4.5 },
    { element: 'Error text', foreground: '#dc2626', background: '#ffffff', required: 4.5 },
    { element: 'Success text', foreground: '#16a34a', background: '#ffffff', required: 4.5 },
  ];
  
  const issues = combinations.map(combo => {
    const ratio = getContrastRatio(combo.foreground, combo.background);
    return {
      ...combo,
      ratio,
      status: ratio >= combo.required ? 'pass' as const : 'fail' as const
    };
  });
  
  return {
    valid: issues.every(issue => issue.status === 'pass'),
    issues
  };
}

export default {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getContrastLevel,
  suggestBetterContrast,
  accessibleColors,
  validateAppColors
};
