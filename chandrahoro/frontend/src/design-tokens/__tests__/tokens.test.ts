/**
 * Design Tokens - Unit Tests
 * Verify token structure and utilities
 */

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from '../tokens';
import {
  getColor,
  getColorWithOpacity,
  getSpacing,
  getShadow,
  getAnimation,
  isValidColorToken,
  isValidSpacingToken,
} from '../utils';
import { validateTokens, safeValidateTokens } from '../schema';

describe('Design Tokens', () => {
  describe('Color Tokens', () => {
    it('should have primary colors', () => {
      expect(COLORS.primary.saffron).toBe('#FF6B35');
      expect(COLORS.primary.gold).toBe('#F7931E');
      expect(COLORS.primary.marigold).toBe('#FDB827');
    });

    it('should have celestial colors', () => {
      expect(COLORS.celestial.deep).toBe('#1E3A5F');
      expect(COLORS.celestial.medium).toBe('#2E5C8A');
      expect(COLORS.celestial.light).toBe('#4A7BA7');
    });

    it('should have semantic colors', () => {
      expect(COLORS.semantic.success).toBe('#4CAF50');
      expect(COLORS.semantic.warning).toBe('#FF9800');
      expect(COLORS.semantic.danger).toBe('#F44336');
      expect(COLORS.semantic.info).toBe('#2196F3');
    });

    it('should have dark mode colors', () => {
      expect(COLORS.dark.background).toBe('#0A0E1A');
      expect(COLORS.dark.surface).toBe('#1A1F35');
      expect(COLORS.dark.textPrimary).toBe('#E8E8E8');
    });
  });

  describe('Typography Tokens', () => {
    it('should have font families', () => {
      expect(TYPOGRAPHY.fontFamily.display).toContain('Poppins');
      expect(TYPOGRAPHY.fontFamily.body).toContain('Inter');
      expect(TYPOGRAPHY.fontFamily.mono).toContain('JetBrains Mono');
    });

    it('should have font sizes', () => {
      expect(TYPOGRAPHY.fontSize.xs).toBe('0.75rem');
      expect(TYPOGRAPHY.fontSize.base).toBe('1rem');
      expect(TYPOGRAPHY.fontSize['5xl']).toBe('3.815rem');
    });

    it('should have font weights', () => {
      expect(TYPOGRAPHY.fontWeight.light).toBe(300);
      expect(TYPOGRAPHY.fontWeight.bold).toBe(700);
      expect(TYPOGRAPHY.fontWeight.black).toBe(900);
    });
  });

  describe('Spacing Tokens', () => {
    it('should have spacing values', () => {
      expect(SPACING[1]).toBe('0.25rem');
      expect(SPACING[4]).toBe('1rem');
      expect(SPACING[20]).toBe('5rem');
    });
  });

  describe('Border Radius Tokens', () => {
    it('should have border radius values', () => {
      expect(BORDER_RADIUS.sm).toBe('4px');
      expect(BORDER_RADIUS.lg).toBe('16px');
      expect(BORDER_RADIUS.full).toBe('9999px');
    });
  });

  describe('Shadow Tokens', () => {
    it('should have shadow values', () => {
      expect(SHADOWS.sm).toContain('rgba');
      expect(SHADOWS.card).toContain('0 4px 20px');
    });
  });

  describe('Animation Tokens', () => {
    it('should have animation durations', () => {
      expect(ANIMATION.duration.fast).toBe('150ms');
      expect(ANIMATION.duration.normal).toBe('300ms');
      expect(ANIMATION.duration.slow).toBe('500ms');
    });

    it('should have animation easing', () => {
      expect(ANIMATION.easing.easeIn).toContain('cubic-bezier');
      expect(ANIMATION.easing.easeOut).toContain('cubic-bezier');
    });
  });

  describe('Utility Functions', () => {
    describe('getColor', () => {
      it('should get color by path', () => {
        expect(getColor('primary.saffron')).toBe('#FF6B35');
        expect(getColor('celestial.deep')).toBe('#1E3A5F');
      });

      it('should throw on invalid path', () => {
        expect(() => getColor('invalid.path')).toThrow();
      });
    });

    describe('getColorWithOpacity', () => {
      it('should convert color to rgba', () => {
        const result = getColorWithOpacity('primary.saffron', 0.5);
        expect(result).toContain('rgba');
        expect(result).toContain('0.5');
      });
    });

    describe('getSpacing', () => {
      it('should get spacing value', () => {
        expect(getSpacing(4)).toBe('1rem');
        expect(getSpacing(8)).toBe('2rem');
      });
    });

    describe('getShadow', () => {
      it('should get shadow value', () => {
        expect(getShadow('card')).toContain('0 4px 20px');
      });
    });

    describe('getAnimation', () => {
      it('should combine duration and easing', () => {
        const result = getAnimation('normal', 'easeInOut');
        expect(result).toContain('300ms');
        expect(result).toContain('cubic-bezier');
      });
    });

    describe('Validation Functions', () => {
      it('should validate color tokens', () => {
        expect(isValidColorToken('primary.saffron')).toBe(true);
        expect(isValidColorToken('invalid.path')).toBe(false);
      });

      it('should validate spacing tokens', () => {
        expect(isValidSpacingToken('4')).toBe(true);
        expect(isValidSpacingToken('999')).toBe(false);
      });
    });
  });

  describe('Schema Validation', () => {
    it('should validate token structure', () => {
      const tokenData = {
        colors: {
          primary: {
            saffron: { value: '#FF6B35', type: 'color' },
          },
          celestial: {
            deep: { value: '#1E3A5F', type: 'color' },
          },
          neutral: {
            white: { value: '#FFFFFF', type: 'color' },
          },
          semantic: {
            success: { value: '#4CAF50', type: 'color' },
          },
          dark: {
            background: { value: '#0A0E1A', type: 'color' },
          },
        },
        typography: {
          fontFamily: {
            display: { value: 'Poppins', type: 'fontFamily' },
          },
          fontSize: {
            base: { value: '1rem', type: 'fontSize' },
          },
          fontWeight: {
            regular: { value: 400, type: 'fontWeight' },
          },
          lineHeight: {
            normal: { value: '1.5', type: 'lineHeight' },
          },
        },
        spacing: {
          4: { value: '1rem', type: 'spacing' },
        },
        borderRadius: {
          md: { value: '8px', type: 'borderRadius' },
        },
        shadows: {
          card: { value: '0 4px 20px rgba(0,0,0,0.08)', type: 'boxShadow' },
        },
        animation: {
          duration: {
            normal: { value: '300ms', type: 'duration' },
          },
          easing: {
            easeInOut: { value: 'cubic-bezier(0.4, 0, 0.2, 1)', type: 'cubicBezier' },
          },
        },
      };

      const result = safeValidateTokens(tokenData);
      expect(result.success).toBe(true);
    });
  });
});

