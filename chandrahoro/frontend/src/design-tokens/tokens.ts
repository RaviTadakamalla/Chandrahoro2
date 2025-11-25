/**
 * Design Tokens - TypeScript Constants
 * Auto-generated from tokens.json
 * Single source of truth for all design values
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const COLORS = {
  primary: {
    saffron: '#FF6B35',
    gold: '#F7931E',
    marigold: '#FDB827',
  },
  celestial: {
    deep: '#1E3A5F',
    medium: '#2E5C8A',
    light: '#4A7BA7',
  },
  neutral: {
    white: '#FFFFFF',
    cream: '#FFF8F0',
    sand: '#F5E6D3',
    stone: '#9E9E9E',
    charcoal: '#333333',
    black: '#000000',
  },
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#2196F3',
  },
  dark: {
    background: '#0A0E1A',
    surface: '#1A1F35',
    surfaceElevated: '#252B42',
    textPrimary: '#E8E8E8',
    textSecondary: '#A0A0A0',
    border: '#2A3045',
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    display: "Poppins, 'Noto Sans Telugu', sans-serif",
    body: "Inter, 'Noto Sans Telugu', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
    telugu: "'Noto Sans Telugu', 'Tiro Telugu', sans-serif",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.563rem',
    '2xl': '1.953rem',
    '3xl': '2.441rem',
    '4xl': '3.052rem',
    '5xl': '3.815rem',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SPACING = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const SHADOWS = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
  card: '0 4px 20px rgba(0,0,0,0.08)',
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const ANIMATION = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ColorToken = typeof COLORS;
export type TypographyToken = typeof TYPOGRAPHY;
export type SpacingToken = typeof SPACING;
export type BorderRadiusToken = typeof BORDER_RADIUS;
export type ShadowToken = typeof SHADOWS;
export type AnimationToken = typeof ANIMATION;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ColorPath = keyof typeof COLORS;
export type FontFamilyKey = keyof typeof TYPOGRAPHY.fontFamily;
export type FontSizeKey = keyof typeof TYPOGRAPHY.fontSize;
export type FontWeightKey = keyof typeof TYPOGRAPHY.fontWeight;
export type SpacingKey = keyof typeof SPACING;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type ShadowKey = keyof typeof SHADOWS;
export type AnimationDurationKey = keyof typeof ANIMATION.duration;
export type AnimationEasingKey = keyof typeof ANIMATION.easing;

