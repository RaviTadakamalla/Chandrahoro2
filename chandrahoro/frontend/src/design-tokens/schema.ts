/**
 * Design Token Schema Validation
 * Zod schema for validating token structure
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

const TokenBaseSchema = z.object({
  value: z.union([z.string(), z.number()]),
  type: z.string(),
  description: z.string().optional(),
});

const ColorTokenSchema = TokenBaseSchema.extend({
  type: z.literal('color'),
  value: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
});

const FontFamilyTokenSchema = TokenBaseSchema.extend({
  type: z.literal('fontFamily'),
  value: z.string(),
});

const FontSizeTokenSchema = TokenBaseSchema.extend({
  type: z.literal('fontSize'),
  value: z.string().regex(/^[\d.]+rem$/, 'Font size must be in rem units'),
});

const FontWeightTokenSchema = TokenBaseSchema.extend({
  type: z.literal('fontWeight'),
  value: z.number().min(100).max(900),
});

const LineHeightTokenSchema = TokenBaseSchema.extend({
  type: z.literal('lineHeight'),
  value: z.string(),
});

const SpacingTokenSchema = TokenBaseSchema.extend({
  type: z.literal('spacing'),
  value: z.string().regex(/^[\d.]+rem$/, 'Spacing must be in rem units'),
});

const BorderRadiusTokenSchema = TokenBaseSchema.extend({
  type: z.literal('borderRadius'),
  value: z.string().regex(/^[\d.]+px$/, 'Border radius must be in px units'),
});

const BoxShadowTokenSchema = TokenBaseSchema.extend({
  type: z.literal('boxShadow'),
  value: z.string(),
});

const DurationTokenSchema = TokenBaseSchema.extend({
  type: z.literal('duration'),
  value: z.string().regex(/^[\d.]+ms$/, 'Duration must be in ms units'),
});

const CubicBezierTokenSchema = TokenBaseSchema.extend({
  type: z.literal('cubicBezier'),
  value: z.string().regex(/^cubic-bezier/, 'Invalid cubic-bezier value'),
});

// ============================================================================
// COMPLETE TOKEN SCHEMA
// ============================================================================

export const TokensSchema = z.object({
  colors: z.object({
    primary: z.record(ColorTokenSchema),
    celestial: z.record(ColorTokenSchema),
    neutral: z.record(ColorTokenSchema),
    semantic: z.record(ColorTokenSchema),
    dark: z.record(ColorTokenSchema),
  }),
  typography: z.object({
    fontFamily: z.record(FontFamilyTokenSchema),
    fontSize: z.record(FontSizeTokenSchema),
    fontWeight: z.record(FontWeightTokenSchema),
    lineHeight: z.record(LineHeightTokenSchema),
  }),
  spacing: z.record(SpacingTokenSchema),
  borderRadius: z.record(BorderRadiusTokenSchema),
  shadows: z.record(BoxShadowTokenSchema),
  animation: z.object({
    duration: z.record(DurationTokenSchema),
    easing: z.record(CubicBezierTokenSchema),
  }),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Tokens = z.infer<typeof TokensSchema>;
export type ColorToken = z.infer<typeof ColorTokenSchema>;
export type FontFamilyToken = z.infer<typeof FontFamilyTokenSchema>;
export type FontSizeToken = z.infer<typeof FontSizeTokenSchema>;
export type FontWeightToken = z.infer<typeof FontWeightTokenSchema>;
export type SpacingToken = z.infer<typeof SpacingTokenSchema>;
export type BorderRadiusToken = z.infer<typeof BorderRadiusTokenSchema>;
export type BoxShadowToken = z.infer<typeof BoxShadowTokenSchema>;
export type DurationToken = z.infer<typeof DurationTokenSchema>;
export type CubicBezierToken = z.infer<typeof CubicBezierTokenSchema>;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate tokens against schema
 */
export function validateTokens(data: unknown): Tokens {
  try {
    return TokensSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Token validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Safely validate tokens with error handling
 */
export function safeValidateTokens(data: unknown): { success: boolean; data?: Tokens; error?: string } {
  try {
    const validated = validateTokens(data);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

