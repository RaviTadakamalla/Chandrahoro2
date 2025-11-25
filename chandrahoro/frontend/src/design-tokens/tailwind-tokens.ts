/**
 * Tailwind CSS Theme Configuration from Design Tokens
 * Converts design tokens to Tailwind theme format
 */

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from './tokens';

// ============================================================================
// TAILWIND THEME CONFIGURATION
// ============================================================================

export const tailwindTheme = {
  extend: {
    colors: {
      // Primary colors
      saffron: COLORS.primary.saffron,
      gold: COLORS.primary.gold,
      marigold: COLORS.primary.marigold,

      // Celestial colors
      'celestial-deep': COLORS.celestial.deep,
      'celestial-medium': COLORS.celestial.medium,
      'celestial-light': COLORS.celestial.light,

      // Neutral colors
      cream: COLORS.neutral.cream,
      sand: COLORS.neutral.sand,
      stone: COLORS.neutral.stone,
      charcoal: COLORS.neutral.charcoal,

      // Semantic colors
      success: COLORS.semantic.success,
      warning: COLORS.semantic.warning,
      danger: COLORS.semantic.danger,
      info: COLORS.semantic.info,

      // Dark mode colors
      'dark-bg': COLORS.dark.background,
      'dark-surface': COLORS.dark.surface,
      'dark-surface-elevated': COLORS.dark.surfaceElevated,
      'dark-text-primary': COLORS.dark.textPrimary,
      'dark-text-secondary': COLORS.dark.textSecondary,
      'dark-border': COLORS.dark.border,
    },

    fontFamily: {
      display: TYPOGRAPHY.fontFamily.display,
      body: TYPOGRAPHY.fontFamily.body,
      mono: TYPOGRAPHY.fontFamily.mono,
      telugu: TYPOGRAPHY.fontFamily.telugu,
    },

    fontSize: {
      xs: TYPOGRAPHY.fontSize.xs,
      sm: TYPOGRAPHY.fontSize.sm,
      base: TYPOGRAPHY.fontSize.base,
      lg: TYPOGRAPHY.fontSize.lg,
      xl: TYPOGRAPHY.fontSize.xl,
      '2xl': TYPOGRAPHY.fontSize['2xl'],
      '3xl': TYPOGRAPHY.fontSize['3xl'],
      '4xl': TYPOGRAPHY.fontSize['4xl'],
      '5xl': TYPOGRAPHY.fontSize['5xl'],
    },

    fontWeight: {
      light: TYPOGRAPHY.fontWeight.light,
      normal: TYPOGRAPHY.fontWeight.regular,
      medium: TYPOGRAPHY.fontWeight.medium,
      semibold: TYPOGRAPHY.fontWeight.semibold,
      bold: TYPOGRAPHY.fontWeight.bold,
      black: TYPOGRAPHY.fontWeight.black,
    },

    spacing: {
      1: SPACING[1],
      2: SPACING[2],
      3: SPACING[3],
      4: SPACING[4],
      5: SPACING[5],
      6: SPACING[6],
      8: SPACING[8],
      10: SPACING[10],
      12: SPACING[12],
      16: SPACING[16],
      20: SPACING[20],
    },

    borderRadius: {
      sm: BORDER_RADIUS.sm,
      md: BORDER_RADIUS.md,
      lg: BORDER_RADIUS.lg,
      xl: BORDER_RADIUS.xl,
      full: BORDER_RADIUS.full,
    },

    boxShadow: {
      sm: SHADOWS.sm,
      md: SHADOWS.md,
      lg: SHADOWS.lg,
      xl: SHADOWS.xl,
      card: SHADOWS.card,
    },

    animation: {
      'fade-in': `fadeIn ${ANIMATION.duration.normal} ${ANIMATION.easing.easeOut}`,
      'slide-up': `slideUp ${ANIMATION.duration.normal} ${ANIMATION.easing.easeOut}`,
      'slide-down': `slideDown ${ANIMATION.duration.normal} ${ANIMATION.easing.easeOut}`,
      'scale-in': `scaleIn ${ANIMATION.duration.normal} ${ANIMATION.easing.easeOut}`,
      pulse: `pulse ${ANIMATION.duration.slow} ${ANIMATION.easing.easeInOut} infinite`,
      shimmer: `shimmer ${ANIMATION.duration.slow} ${ANIMATION.easing.easeInOut} infinite`,
    },

    keyframes: {
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      slideUp: {
        from: { opacity: '0', transform: 'translateY(20px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      slideDown: {
        from: { opacity: '0', transform: 'translateY(-20px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      scaleIn: {
        from: { opacity: '0', transform: 'scale(0.9)' },
        to: { opacity: '1', transform: 'scale(1)' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
    },

    transitionDuration: {
      fast: ANIMATION.duration.fast,
      normal: ANIMATION.duration.normal,
      slow: ANIMATION.duration.slow,
    },

    transitionTimingFunction: {
      'ease-in': ANIMATION.easing.easeIn,
      'ease-out': ANIMATION.easing.easeOut,
      'ease-in-out': ANIMATION.easing.easeInOut,
    },
  },
};

// ============================================================================
// EXPORT FOR TAILWIND CONFIG
// ============================================================================

export default tailwindTheme;

