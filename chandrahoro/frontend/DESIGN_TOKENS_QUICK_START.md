# Design Tokens - Quick Start Guide

Fast reference for using ChandraHoro V2.1 design tokens in your components.

## 🚀 Quick Import

```typescript
// Import tokens
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '@/design-tokens';

// Import utilities
import { getColor, getSpacing, getShadow, getAnimation } from '@/design-tokens/utils';
```

## 🎨 Colors

### Primary Colors
```typescript
COLORS.primary.saffron    // '#FF6B35' - Main CTA
COLORS.primary.gold       // '#F7931E' - Accent
COLORS.primary.marigold   // '#FDB827' - Warnings
```

### Celestial Colors
```typescript
COLORS.celestial.deep     // '#1E3A5F' - Headers
COLORS.celestial.medium   // '#2E5C8A' - Secondary
COLORS.celestial.light    // '#4A7BA7' - Hover states
```

### Semantic Colors
```typescript
COLORS.semantic.success   // '#4CAF50' - Positive
COLORS.semantic.warning   // '#FF9800' - Caution
COLORS.semantic.danger    // '#F44336' - Error
COLORS.semantic.info      // '#2196F3' - Information
```

### Dark Mode Colors
```typescript
COLORS.dark.background    // '#0A0E1A'
COLORS.dark.surface       // '#1A1F35'
COLORS.dark.textPrimary   // '#E8E8E8'
```

## 📝 Typography

### Font Families
```typescript
TYPOGRAPHY.fontFamily.display  // Poppins - Headings
TYPOGRAPHY.fontFamily.body     // Inter - Body text
TYPOGRAPHY.fontFamily.mono     // JetBrains Mono - Code
TYPOGRAPHY.fontFamily.telugu   // Noto Sans Telugu - Telugu
```

### Font Sizes
```typescript
TYPOGRAPHY.fontSize.xs     // 0.75rem (12px)
TYPOGRAPHY.fontSize.sm     // 0.875rem (14px)
TYPOGRAPHY.fontSize.base   // 1rem (16px)
TYPOGRAPHY.fontSize.lg     // 1.25rem (20px)
TYPOGRAPHY.fontSize.xl     // 1.563rem (25px)
TYPOGRAPHY.fontSize['2xl'] // 1.953rem (31px)
TYPOGRAPHY.fontSize['3xl'] // 2.441rem (39px)
TYPOGRAPHY.fontSize['4xl'] // 3.052rem (49px)
TYPOGRAPHY.fontSize['5xl'] // 3.815rem (61px)
```

### Font Weights
```typescript
TYPOGRAPHY.fontWeight.light      // 300
TYPOGRAPHY.fontWeight.regular    // 400
TYPOGRAPHY.fontWeight.medium     // 500
TYPOGRAPHY.fontWeight.semibold   // 600
TYPOGRAPHY.fontWeight.bold       // 700
TYPOGRAPHY.fontWeight.black      // 900
```

## 📏 Spacing (8px Grid)

```typescript
SPACING[1]   // 0.25rem (4px)
SPACING[2]   // 0.5rem (8px)
SPACING[3]   // 0.75rem (12px)
SPACING[4]   // 1rem (16px)
SPACING[6]   // 1.5rem (24px)
SPACING[8]   // 2rem (32px)
SPACING[12]  // 3rem (48px)
SPACING[16]  // 4rem (64px)
SPACING[20]  // 5rem (80px)
```

## 🔲 Border Radius

```typescript
BORDER_RADIUS.sm    // 4px - Buttons, inputs
BORDER_RADIUS.md    // 8px - Cards
BORDER_RADIUS.lg    // 16px - Modals
BORDER_RADIUS.xl    // 24px - Hero sections
BORDER_RADIUS.full  // 9999px - Pills, avatars
```

## 🌑 Shadows

```typescript
SHADOWS.sm      // Subtle shadow
SHADOWS.md      // Medium shadow
SHADOWS.lg      // Large shadow
SHADOWS.xl      // Extra large shadow
SHADOWS.card    // Card-specific shadow
```

## ⚡ Animations

```typescript
ANIMATION.duration.fast     // 150ms
ANIMATION.duration.normal   // 300ms
ANIMATION.duration.slow     // 500ms

ANIMATION.easing.easeIn     // cubic-bezier(0.4, 0, 1, 1)
ANIMATION.easing.easeOut    // cubic-bezier(0, 0, 0.2, 1)
ANIMATION.easing.easeInOut  // cubic-bezier(0.4, 0, 0.2, 1)
```

## 💻 Usage Examples

### React Component with Inline Styles
```typescript
export function Card() {
  return (
    <div
      style={{
        backgroundColor: COLORS.neutral.white,
        padding: SPACING[6],
        borderRadius: BORDER_RADIUS.md,
        boxShadow: SHADOWS.card,
      }}
    >
      <h2
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.display,
          fontSize: TYPOGRAPHY.fontSize['2xl'],
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.primary.saffron,
        }}
      >
        Title
      </h2>
    </div>
  );
}
```

### React Component with Tailwind
```typescript
export function Card() {
  return (
    <div className="bg-white p-6 rounded-md shadow-card dark:bg-dark-surface">
      <h2 className="text-2xl font-bold font-display text-saffron">
        Title
      </h2>
    </div>
  );
}
```

### Using Utility Functions
```typescript
export function Button() {
  const bgColor = getColor('primary.saffron');
  const padding = getSpacing(4);
  const shadow = getShadow('md');
  const animation = getAnimation('normal', 'easeInOut');

  return (
    <button
      style={{
        backgroundColor: bgColor,
        padding,
        boxShadow: shadow,
        animation: `fadeIn ${animation}`,
      }}
    >
      Click me
    </button>
  );
}
```

### CSS Variables
```css
.card {
  background-color: var(--color-neutral-white);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-saffron);
}

.dark .card {
  background-color: var(--color-dark-surface);
  color: var(--color-dark-text-primary);
}
```

## 🌙 Dark Mode

All components automatically support dark mode:

```typescript
<div className="bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text-primary">
  Content adapts to dark mode
</div>
```

## ✅ Best Practices

1. **Always use tokens** - Never hardcode colors, spacing, or other design values
2. **Prefer Tailwind** - Use Tailwind classes when possible
3. **Use TypeScript** - Leverage type safety with token constants
4. **Validate** - Use utility functions for dynamic token access
5. **Document** - Add comments explaining design choices

## 📚 Full Documentation

See `frontend/src/design-tokens/README.md` for complete documentation.

## 🔗 Related Files

- **Tokens**: `frontend/src/design-tokens/tokens.json`
- **TypeScript**: `frontend/src/design-tokens/tokens.ts`
- **Utilities**: `frontend/src/design-tokens/utils.ts`
- **CSS Variables**: `frontend/src/design-tokens/css-variables.css`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Design Guide**: `docs/visualdesignguide2.1.md`

---

**Last Updated**: October 26, 2025

