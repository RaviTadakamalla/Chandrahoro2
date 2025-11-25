# ChandraHoro V2.1 Design System

Complete design system documentation for the ChandraHoro V2.1 application.

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Animations](#animations)
5. [Components](#components)
6. [Dark Mode](#dark-mode)
7. [Usage Examples](#usage-examples)

---

## Color System

### Primary Palette

**Saffron** - Primary CTA, active states
```css
bg-saffron        /* #FF6B35 */
bg-saffron-500    /* Primary */
bg-saffron-600    /* Hover */
bg-saffron-700    /* Active */
```

**Gold** - Accent, highlights
```css
bg-gold           /* #F7931E */
```

**Marigold** - Warnings, notifications
```css
bg-marigold       /* #FDB827 */
```

### Celestial Blues

**Deep** - Headers, dark mode base
```css
bg-celestial-deep    /* #1E3A5F */
```

**Medium** - Secondary elements
```css
bg-celestial-medium  /* #2E5C8A */
```

**Light** - Hover states
```css
bg-celestial-light   /* #4A7BA7 */
```

### Semantic Colors

```css
bg-success    /* #4CAF50 - Positive yogas, strong planets */
bg-warning    /* #FF9800 - Cautions, moderate strengths */
bg-danger     /* #F44336 - Negative aspects, weak planets */
bg-info       /* #2196F3 - Tips, informational */
```

### Gradients

```css
gradient-sunset      /* Saffron to Gold */
gradient-night-sky   /* Deep to Medium Celestial */
gradient-twilight    /* Light Celestial to Purple */
gradient-cosmic      /* Purple gradient */
```

---

## Typography

### Font Families

```css
font-sans      /* Inter (body text) */
font-heading   /* Poppins (headings) */
font-mono      /* JetBrains Mono (code) */
font-telugu    /* Noto Sans Telugu (Telugu text) */
```

### Type Scale

```css
text-xs       /* 12px - Captions, labels */
text-sm       /* 14px - Small text */
text-base     /* 16px - Default body */
text-lg       /* 20px - Large body */
text-xl       /* 25px - Subsections */
text-2xl      /* 31px - Card titles */
text-3xl      /* 39px - Section titles */
text-4xl      /* 49px - Page titles */
text-5xl      /* 61px - Hero headings */
```

### Font Weights

```css
font-light      /* 300 */
font-normal     /* 400 */
font-medium     /* 500 */
font-semibold   /* 600 */
font-bold       /* 700 */
font-black      /* 900 */
```

---

## Spacing

8px grid-based spacing system:

```css
p-1   /* 4px */
p-2   /* 8px */
p-3   /* 12px */
p-4   /* 16px */
p-6   /* 24px */
p-8   /* 32px */
p-12  /* 48px */
p-16  /* 64px */
p-20  /* 80px */
```

---

## Animations

### Keyframes

```css
animate-fade-in      /* Opacity 0 to 1 */
animate-slide-up     /* Translate Y + fade */
animate-slide-down   /* Translate Y down + fade */
animate-scale-in     /* Scale 0.9 to 1 */
animate-pulse        /* Opacity pulse */
animate-shimmer      /* Loading shimmer */
animate-orbit        /* 360° rotation */
```

### Durations

```css
duration-fast       /* 150ms */
duration-normal     /* 300ms */
duration-slow       /* 500ms */
```

---

## Components

### Cards

```tsx
<div className="bg-card rounded-lg shadow-card p-6">
  <h3 className="text-2xl font-heading font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Buttons

```tsx
<button className="bg-saffron text-white px-4 py-2 rounded-md hover:bg-saffron-600">
  Primary Button
</button>

<button className="bg-celestial-deep text-white px-4 py-2 rounded-md hover:bg-celestial-medium">
  Secondary Button
</button>
```

### Badges

```tsx
<span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
  Success Badge
</span>
```

---

## Dark Mode

Dark mode is automatically applied when the `dark` class is added to a parent element.

```tsx
<div className="dark">
  {/* All children automatically use dark mode colors */}
</div>
```

### Dark Mode Colors

```css
dark:bg-dark-surface           /* #1A1F35 */
dark:text-dark-text-primary    /* #E8E8E8 */
dark:text-dark-text-secondary  /* #A0A0A0 */
dark:border-dark-border        /* #2A3045 */
```

---

## Usage Examples

### Example 1: Hero Section

```tsx
<section className="bg-gradient-sunset text-white py-20 px-4 rounded-xl">
  <h1 className="text-5xl font-heading font-bold mb-4">
    Welcome to ChandraHoro
  </h1>
  <p className="text-lg mb-8">
    Discover your cosmic destiny
  </p>
  <button className="bg-white text-saffron px-6 py-3 rounded-lg font-semibold hover:shadow-lg">
    Get Started
  </button>
</section>
```

### Example 2: Card with Animation

```tsx
<div className="bg-card rounded-lg shadow-card p-6 animate-fade-in hover:shadow-card-hover transition-shadow">
  <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
    Daily Reading
  </h3>
  <p className="text-muted-foreground mb-4">
    Your personalized astrological insights
  </p>
  <button className="bg-saffron text-white px-4 py-2 rounded-md hover:bg-saffron-600">
    Read Now
  </button>
</div>
```

### Example 3: Status Indicator

```tsx
<div className="flex items-center gap-2">
  <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
  <span className="text-success font-medium">Active</span>
</div>
```

### Example 4: Dark Mode Card

```tsx
<div className="bg-card dark:bg-dark-surface rounded-lg p-6">
  <h3 className="text-foreground dark:text-dark-text-primary font-heading font-semibold">
    Title
  </h3>
  <p className="text-muted-foreground dark:text-dark-text-secondary">
    Content
  </p>
</div>
```

---

## Responsive Design

Mobile-first approach with breakpoints:

```css
/* Mobile (default) */
.text-lg

/* Tablet (768px+) */
md:text-2xl

/* Desktop (1024px+) */
lg:text-3xl

/* Large Desktop (1280px+) */
xl:text-4xl
```

---

## Accessibility

- All colors meet WCAG AA contrast requirements
- Focus states use 2px saffron outline
- Animations respect `prefers-reduced-motion`
- Semantic HTML with ARIA labels
- Keyboard navigation support

---

## Resources

- **Design Tokens**: `src/lib/design-tokens.ts`
- **Tailwind Config**: `tailwind.config.js`
- **Global Styles**: `src/app/globals.css`
- **Showcase Component**: `src/components/examples/DesignTokensShowcase.tsx`

---

## Version

ChandraHoro V2.1 Design System
Last Updated: October 26, 2025

