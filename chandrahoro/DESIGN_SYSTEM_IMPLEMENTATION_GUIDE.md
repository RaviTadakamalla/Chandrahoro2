# Design System Implementation Guide

## Quick Reference

### What Was Changed
All existing pages in the Chandrahoro application have been updated to use the new saffron/mandala design system for a cohesive, professional user experience.

### Key Components Used
```typescript
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';
import { FeatureCard } from '@/components/FeatureCard';
```

---

## Page-by-Page Implementation

### Home Page (`/`)
**File**: `frontend/src/pages/index.tsx`

**Key Changes**:
1. Replaced custom header with `<MainNav />`
2. Updated background: `from-sand to-offwhite` (light) / `from-ink-80 to-charcoal` (dark)
3. Replaced feature cards with `<FeatureCard />` components
4. Added `<Footer />` at the bottom
5. Updated typography to use Poppins for headings

**Structure**:
```
<MainNav />
<main className="container mx-auto px-4 py-12">
  <h1 className="font-poppins text-4xl md:text-5xl font-bold">
    Generate Your <span className="text-saffron-500">Birth Chart</span>
  </h1>
  <FeatureCard ... />
  <BirthDetailsForm ... />
</main>
<Footer />
```

---

### Settings Page (`/settings`)
**File**: `frontend/src/pages/settings.tsx`

**Key Changes**:
1. Added `<MainNav />` at the top
2. Updated background gradient
3. Replaced all `<Button>` with `<SaffronButton>`
4. Changed icon colors to saffron
5. Added `<Footer />` at the bottom

**Button Variants Used**:
- `variant="primary"` - For active/selected state
- `variant="ghost"` - For inactive/unselected state

---

### Chart Result Page (`/chart/result`)
**File**: `frontend/src/pages/chart/result.tsx`

**Key Changes**:
1. Added `<MainNav />` after opening tag
2. Updated background gradient
3. Replaced header buttons with `<SaffronButton>`
4. Updated header border color to saffron
5. Added `<Footer />` before closing tag

**Header Structure**:
```
<header className="border-b border-saffron-200 dark:border-saffron-900/30">
  <SaffronButton variant="ghost" size="sm">Back to Home</SaffronButton>
  <SaffronButton variant="outline" size="sm">Share</SaffronButton>
</header>
```

---

### Chart ID Page (`/chart/[id]`)
**File**: `frontend/src/pages/chart/[id].tsx`

**Key Changes**:
1. Added `<MainNav />` after opening tag
2. Updated background gradient
3. Replaced header buttons with `<SaffronButton>`
4. Updated header styling
5. Added `<Footer />` before closing tag

---

### Shared Chart Page (`/chart/shared`)
**File**: `frontend/src/pages/chart/shared.tsx`

**Key Changes**:
1. Added `<MainNav />` after opening tag
2. Updated background gradient in loading/error states
3. Replaced all `<Button>` with `<SaffronButton>`
4. Updated loading spinner color to saffron
5. Added `<Footer />` before closing tag
6. Added `<Head>` component for meta tags

---

## Color System

### Background Gradients
```css
/* Light Mode */
from-sand to-offwhite

/* Dark Mode */
from-ink-80 to-charcoal
```

### Text Colors
```css
/* Headings */
text-charcoal dark:text-white

/* Body Text */
text-gray-600 dark:text-gray-300

/* Accents */
text-saffron-500 dark:text-saffron-400
```

### Border Colors
```css
border-saffron-200 dark:border-saffron-900/30
```

---

## Typography

### Headings
```html
<h1 className="font-poppins text-4xl md:text-5xl font-bold">
  Title
</h1>
```

### Body Text
```html
<p className="text-lg text-gray-600 dark:text-gray-300">
  Description
</p>
```

---

## Button Variants

### Primary (CTA)
```tsx
<SaffronButton variant="primary" size="lg">
  Generate Chart
</SaffronButton>
```

### Outline
```tsx
<SaffronButton variant="outline" size="sm">
  Share
</SaffronButton>
```

### Ghost (Subtle)
```tsx
<SaffronButton variant="ghost" size="sm">
  Back to Home
</SaffronButton>
```

---

## Navigation Structure

### MainNav Features
- Logo/BrandMark link to home
- Navigation links (Home, Settings, etc.)
- Dark mode toggle
- Responsive mobile menu

### Footer Features
- Copyright information
- Links to landing page
- Responsive design

---

## Dark Mode Support

All pages support dark mode through:
1. Tailwind's `dark:` prefix
2. CSS variables in `globals.css`
3. Theme toggle in MainNav

**Example**:
```tsx
className="bg-white dark:bg-charcoal text-charcoal dark:text-white"
```

---

## Responsive Design

All pages use Tailwind's responsive breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Example**:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## Testing Checklist

- [ ] All pages load without errors
- [ ] Navigation links work correctly
- [ ] Dark mode toggle functions
- [ ] Forms submit correctly
- [ ] Charts generate and display
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings
- [ ] No hydration errors

---

## Common Patterns

### Page Layout
```tsx
<>
  <Head>
    <title>Page Title</title>
  </Head>
  <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
    <MainNav />
    <main className="container mx-auto px-4 py-12">
      {/* Content */}
    </main>
    <Footer />
  </div>
</>
```

### Feature Card
```tsx
<FeatureCard
  icon={<IconComponent />}
  title="Feature Title"
  description="Feature description"
/>
```

---

## Troubleshooting

**Issue**: Dark mode not working
- **Solution**: Ensure `dark:` classes are used in Tailwind config

**Issue**: Colors not matching
- **Solution**: Check color values in `tailwind.config.js`

**Issue**: Layout breaking on mobile
- **Solution**: Verify responsive classes (sm:, md:, lg:)

---

## Resources

- Design System README: `frontend/DESIGN_SYSTEM_README.md`
- Tailwind Config: `frontend/tailwind.config.js`
- Global Styles: `frontend/src/styles/globals.css`
- Component Library: `frontend/src/components/`


