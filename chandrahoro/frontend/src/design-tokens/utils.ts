/**
 * Design Token Utility Functions
 * Type-safe access to design tokens with validation
 */

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  type ColorPath,
  type FontFamilyKey,
  type FontSizeKey,
  type FontWeightKey,
  type SpacingKey,
  type BorderRadiusKey,
  type ShadowKey,
  type AnimationDurationKey,
  type AnimationEasingKey,
} from './tokens';

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get a color token by path
 * @example getColor('primary.saffron') // '#FF6B35'
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = COLORS;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      throw new Error(`Invalid color token path: ${path}`);
    }
  }

  if (typeof value !== 'string') {
    throw new Error(`Color token at path ${path} is not a string`);
  }

  return value;
}

/**
 * Get a color with opacity support
 * @example getColorWithOpacity('primary.saffron', 0.5) // 'rgba(255, 107, 53, 0.5)'
 */
export function getColorWithOpacity(colorPath: string, opacity: number): string {
  const hex = getColor(colorPath);
  const rgb = hexToRgb(hex);

  if (!rgb) {
    throw new Error(`Could not convert color ${hex} to RGB`);
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

/**
 * Get font family token
 */
export function getFontFamily(key: FontFamilyKey): string {
  return TYPOGRAPHY.fontFamily[key];
}

/**
 * Get font size token
 */
export function getFontSize(key: FontSizeKey): string {
  return TYPOGRAPHY.fontSize[key];
}

/**
 * Get font weight token
 */
export function getFontWeight(key: FontWeightKey): number {
  return TYPOGRAPHY.fontWeight[key];
}

/**
 * Get line height token
 */
export function getLineHeight(key: keyof typeof TYPOGRAPHY.lineHeight): string {
  return TYPOGRAPHY.lineHeight[key];
}

// ============================================================================
// SPACING UTILITIES
// ============================================================================

/**
 * Get spacing token
 */
export function getSpacing(key: SpacingKey): string {
  return SPACING[key];
}

/**
 * Get multiple spacing values as CSS shorthand
 * @example getSpacingShorthand('4', '8') // '1rem 2rem'
 */
export function getSpacingShorthand(...keys: SpacingKey[]): string {
  return keys.map((key) => getSpacing(key)).join(' ');
}

// ============================================================================
// BORDER RADIUS UTILITIES
// ============================================================================

/**
 * Get border radius token
 */
export function getBorderRadius(key: BorderRadiusKey): string {
  return BORDER_RADIUS[key];
}

// ============================================================================
// SHADOW UTILITIES
// ============================================================================

/**
 * Get shadow token
 */
export function getShadow(key: ShadowKey): string {
  return SHADOWS[key];
}

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Get animation duration token
 */
export function getAnimationDuration(key: AnimationDurationKey): string {
  return ANIMATION.duration[key];
}

/**
 * Get animation easing token
 */
export function getAnimationEasing(key: AnimationEasingKey): string {
  return ANIMATION.easing[key];
}

/**
 * Get animation shorthand
 * @example getAnimation('normal', 'easeInOut') // '300ms cubic-bezier(0.4, 0, 0.2, 1)'
 */
export function getAnimation(
  durationKey: AnimationDurationKey,
  easingKey: AnimationEasingKey,
): string {
  return `${getAnimationDuration(durationKey)} ${getAnimationEasing(easingKey)}`;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate if a color token exists
 */
export function isValidColorToken(path: string): boolean {
  try {
    getColor(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate if a spacing token exists
 */
export function isValidSpacingToken(key: string): boolean {
  return key in SPACING;
}

/**
 * Validate if a border radius token exists
 */
export function isValidBorderRadiusToken(key: string): boolean {
  return key in BORDER_RADIUS;
}

/**
 * Validate if a shadow token exists
 */
export function isValidShadowToken(key: string): boolean {
  return key in SHADOWS;
}

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION };

