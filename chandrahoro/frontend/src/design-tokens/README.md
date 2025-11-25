# Design Token System

Complete design token system for ChandraHoro V2.1. All design values are centralized here and used throughout the application.

## Table of Contents

1. [Overview](#overview)
2. [Token Structure](#token-structure)
3. [Usage Examples](#usage-examples)
4. [Adding New Tokens](#adding-new-tokens)
5. [Modifying Tokens](#modifying-tokens)
6. [Dark Mode](#dark-mode)
7. [Validation](#validation)

---

## Overview

The design token system provides a single source of truth for all design values:

- **tokens.json** - Master token definitions
- **tokens.ts** - TypeScript constants (auto-generated)
- **utils.ts** - Type-safe utility functions
- **schema.ts** - Zod validation schema
- **tailwind-tokens.ts** - Tailwind CSS integration
- **css-variables.css** - CSS custom properties

### Benefits

✅ **Single Source of Truth** - All design values in one place  
✅ **Type Safety** - TypeScript constants with full type inference  
✅ **Validation** - Zod schema ensures token integrity  
✅ **Dark Mode** - Automatic dark mode token variants  
✅ **Hot Reload** - Changes reflect immediately  
✅ **No Hardcoding** - Consistent design across the app  

---

## Token Structure

### Colors

```typescript
import { COLORS } from '@/design-tokens/tokens';

// Primary colors
COLORS.primary.saffron    // '#FF6B35'
COLORS.primary.gold       // '#F7931E'
COLORS.primary.marigold   // '#FDB827'

// Celestial colors
COLORS.celestial.deep     // '#1E3A5F'
COLORS.celestial.medium   // '#2E5C8A'
COLORS.celestial.light    // '#4A7BA7'

// Semantic colors
COLORS.semantic.success   // '#4CAF50'
COLORS.semantic.warning   // '#FF9800'
COLORS.semantic.danger    // '#F44336'
COLORS.semantic.info      // '#2196F3'
```

### Typography

```typescript
import { TYPOGRAPHY } from '@/design-tokens/tokens';

// Font families
TYPOGRAPHY.fontFamily.display  // 'Poppins, ...'
TYPOGRAPHY.fontFamily.body     // 'Inter, ...'
TYPOGRAPHY.fontFamily.mono     // 'JetBrains Mono, ...'

// Font sizes
TYPOGRAPHY.fontSize.xs         // '0.75rem'
TYPOGRAPHY.fontSize.base       // '1rem'
TYPOGRAPHY.fontSize.5xl        // '3.815rem'

// Font weights
TYPOGRAPHY.fontWeight.light    // 300
TYPOGRAPHY.fontWeight.bold     // 700
```

### Spacing

```typescript
import { SPACING } from '@/design-tokens/tokens';

SPACING[1]   // '0.25rem' (4px)
SPACING[4]   // '1rem' (16px)
SPACING[8]   // '2rem' (32px)
SPACING[20]  // '5rem' (80px)
```

### Other Tokens

```typescript
import { BORDER_RADIUS, SHADOWS, ANIMATION } from '@/design-tokens/tokens';

// Border radius
BORDER_RADIUS.sm    // '4px'
BORDER_RADIUS.lg    // '16px'

// Shadows
SHADOWS.card        // '0 4px 20px rgba(0,0,0,0.08)'
SHADOWS.lg          // '0 10px 15px rgba(0,0,0,0.1)'

// Animation
ANIMATION.duration.normal      // '300ms'
ANIMATION.easing.easeInOut     // 'cubic-bezier(0.4, 0, 0.2, 1)'
```

---

## Usage Examples

### In React Components

```typescript
import { COLORS, TYPOGRAPHY, SPACING } from '@/design-tokens/tokens';

export function Card() {
  return (
    <div
      style={{
        backgroundColor: COLORS.neutral.white,
        padding: SPACING[6],
        borderRadius: '8px',
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

### With Tailwind CSS

```typescript
// Tailwind automatically includes all tokens
<div className="bg-saffron text-celestial-deep p-6 rounded-lg shadow-card">
  <h2 className="text-2xl font-bold font-display">Title</h2>
</div>
```

### With CSS Variables

```css
.card {
  background-color: var(--color-neutral-white);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.card h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-saffron);
}
```

### Using Utility Functions

```typescript
import {
  getColor,
  getColorWithOpacity,
  getSpacing,
  getShadow,
  getAnimation,
} from '@/design-tokens/utils';

// Get color
const saffron = getColor('primary.saffron');  // '#FF6B35'

// Get color with opacity
const saffronTransparent = getColorWithOpacity('primary.saffron', 0.5);
// 'rgba(255, 107, 53, 0.5)'

// Get spacing
const padding = getSpacing(6);  // '1.5rem'

// Get shadow
const shadow = getShadow('card');  // '0 4px 20px rgba(0,0,0,0.08)'

// Get animation
const animation = getAnimation('normal', 'easeInOut');
// '300ms cubic-bezier(0.4, 0, 0.2, 1)'
```

---

## Adding New Tokens

### 1. Update tokens.json

```json
{
  "colors": {
    "custom": {
      "myColor": {
        "value": "#ABC123",
        "type": "color",
        "description": "My custom color"
      }
    }
  }
}
```

### 2. Update tokens.ts

```typescript
export const COLORS = {
  custom: {
    myColor: '#ABC123',
  },
} as const;
```

### 3. Update css-variables.css

```css
:root {
  --color-custom-my-color: #ABC123;
}
```

### 4. Update tailwind-tokens.ts

```typescript
export const tailwindTheme = {
  extend: {
    colors: {
      'custom-my-color': COLORS.custom.myColor,
    },
  },
};
```

---

## Modifying Tokens

### Changing a Color

1. Update `tokens.json`
2. Update `tokens.ts`
3. Update `css-variables.css`
4. Update `tailwind-tokens.ts`
5. All components automatically use the new value

### Example: Change Saffron

```json
// tokens.json
"saffron": {
  "value": "#FF7A4D",  // Changed from #FF6B35
  "type": "color"
}
```

---

## Dark Mode

Dark mode tokens are automatically applied when `.dark` class is present:

```typescript
// Light mode
COLORS.primary.saffron  // '#FF6B35'

// Dark mode (CSS automatically switches)
// --color-primary-saffron: #FF7A4D;
```

### Using Dark Mode in Components

```typescript
<div className="bg-white dark:bg-dark-surface">
  <p className="text-charcoal dark:text-dark-text-primary">
    Text that adapts to dark mode
  </p>
</div>
```

---

## Validation

Tokens are validated against the Zod schema:

```typescript
import { validateTokens, safeValidateTokens } from '@/design-tokens/schema';

// Strict validation (throws on error)
try {
  const tokens = validateTokens(data);
} catch (error) {
  console.error('Invalid tokens:', error.message);
}

// Safe validation (returns result object)
const result = safeValidateTokens(data);
if (result.success) {
  console.log('Tokens valid:', result.data);
} else {
  console.error('Validation error:', result.error);
}
```

---

## File Structure

```
src/design-tokens/
├── tokens.json              # Master token definitions
├── tokens.ts                # TypeScript constants
├── utils.ts                 # Utility functions
├── schema.ts                # Zod validation schema
├── tailwind-tokens.ts       # Tailwind integration
├── css-variables.css        # CSS custom properties
└── README.md                # This file
```

---

## Best Practices

1. **Always use tokens** - Never hardcode design values
2. **Use TypeScript** - Leverage type safety with tokens.ts
3. **Use Tailwind** - Prefer Tailwind classes over inline styles
4. **Validate changes** - Run validation before committing
5. **Document additions** - Add descriptions to new tokens
6. **Test dark mode** - Ensure tokens work in both modes

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Zod Validation](https://zod.dev/)
- [Design System Guide](../../../docs/visualdesinguide2.1.md)

---

**Last Updated**: October 26, 2025

