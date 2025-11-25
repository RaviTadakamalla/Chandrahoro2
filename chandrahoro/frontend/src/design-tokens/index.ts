/**
 * Design Tokens - Main Export
 * Central export point for all design tokens and utilities
 */

// ============================================================================
// TOKEN EXPORTS
// ============================================================================

export {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  type ColorToken,
  type TypographyToken,
  type SpacingToken,
  type BorderRadiusToken,
  type ShadowToken,
  type AnimationToken,
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
// UTILITY EXPORTS
// ============================================================================

export {
  getColor,
  getColorWithOpacity,
  getFontFamily,
  getFontSize,
  getFontWeight,
  getLineHeight,
  getSpacing,
  getSpacingShorthand,
  getBorderRadius,
  getShadow,
  getAnimationDuration,
  getAnimationEasing,
  getAnimation,
  isValidColorToken,
  isValidSpacingToken,
  isValidBorderRadiusToken,
  isValidShadowToken,
} from './utils';

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

export {
  TokensSchema,
  validateTokens,
  safeValidateTokens,
  type Tokens,
  type ColorToken as ColorTokenType,
  type FontFamilyToken,
  type FontSizeToken,
  type FontWeightToken,
  type SpacingToken as SpacingTokenType,
  type BorderRadiusToken as BorderRadiusTokenType,
  type BoxShadowToken,
  type DurationToken,
  type CubicBezierToken,
} from './schema';

// ============================================================================
// TAILWIND EXPORTS
// ============================================================================

export { tailwindTheme, default as tailwindThemeDefault } from './tailwind-tokens';

