# ChandraHoro Design System & Landing Page

## Overview

This document describes the Saffron/Mandala design system and landing page implementation for ChandraHoro, a Vedic Astrology chart calculator application.

## Design System Components

### Color Palette

**Light Mode:**
- Primary (Saffron): `#F46A1F`
- Primary Hover: `#E25612`
- Primary Active: `#C74A10`
- Marigold: `#FFD6AE`
- Sand: `#FFEAD6`
- Lime Accent: `#DAF56B`
- Charcoal: `#1A1B1E`
- Ink-80: `#2A2B31`
- Offwhite: `#FFF7EF`

**Dark Mode:**
- Background: `#0E0F12`
- Primary: `#FF8C42`
- Adjusted colors for WCAG AA contrast compliance

### Typography

- **Headings**: Poppins (weights: 600, 700)
- **Body/UI**: Inter (weights: 400, 500, 600)

### Components Created

1. **ThemeProvider** (`components/ui/theme-provider.tsx`)
   - Light/Dark/System theme support
   - localStorage persistence
   - System preference detection

2. **BrandMark** (`components/BrandMark.tsx`)
   - Mandala SVG logo
   - Responsive sizing (sm, md, lg)
   - Optional text label

3. **Mascot** (`components/Mascot.tsx`)
   - Monk-bird mascot display
   - Bob animation (respects prefers-reduced-motion)
   - Optional confetti particles
   - Mandala watermark background

4. **SaffronButton** (`components/SaffronButton.tsx`)
   - Multiple variants: primary, secondary, ghost, outline, subtle, destructive
   - Multiple sizes: xs, sm, md, lg, xl, icon variants
   - Loading state with spinner
   - Icon support (left/right positioning)
   - asChild prop for Link integration

5. **Field** (`components/Field.tsx`)
   - Labeled input wrapper
   - Error and help text display
   - Password variant with show/hide toggle
   - WCAG AA compliant styling

6. **FeatureCard** (`components/FeatureCard.tsx`)
   - Icon slot with background
   - Title and description
   - Hover effects with glow
   - Responsive grid layout

7. **MainNav** (`components/MainNav.tsx`)
   - Sticky navigation bar
   - Desktop and mobile menus
   - Theme toggle button
   - Sign in CTA
   - Active link underline animation

### Section Components

1. **Hero** (`components/sections/Hero.tsx`)
   - Two-column layout (stacks on mobile)
   - Headline, subheading, CTAs
   - Mascot display (right side on desktop)
   - Trust indicators

2. **Features** (`components/sections/Features.tsx`)
   - 3-column grid (responsive)
   - 6 feature cards with icons
   - Section heading and description

3. **CTA** (`components/sections/CTA.tsx`)
   - Saffron gradient background
   - Decorative mandala pattern
   - Headline, description, CTA button
   - Trust indicators

4. **Footer** (`components/Footer.tsx`)
   - 4-column link grid
   - Social media links
   - Copyright information
   - Responsive layout

### Pages

1. **Landing Page** (`pages/landing.tsx`)
   - Hero → Features → CTA → Footer
   - Full SEO metadata
   - OpenGraph tags
   - Theme provider wrapper

2. **Login Page** (`pages/login.tsx`)
   - Glass-morphism card design
   - Email/password form
   - SSO buttons (Google, GitHub, Facebook)
   - Forgot password link
   - Sign up link
   - Mascot display (desktop only)

## Setup Instructions

### 1. Install Dependencies

All required dependencies are already in `package.json`. If needed, install:

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Font Configuration

Fonts are imported via Google Fonts in `globals.css`:
- Poppins (weights: 600, 700)
- Inter (weights: 400, 500, 600)

No additional setup needed.

### 3. Asset Placement

Create the following files in `public/`:

**`public/mascot.png`**
- Transparent PNG of monk-bird mascot
- Recommended size: 512x512px or larger
- Used in Hero and Login pages

**`public/mandala.svg`** (optional)
- Single-color line art mandala pattern
- Used as background watermark

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit:
- Landing page: `http://localhost:3000/landing`
- Login page: `http://localhost:3000/login`

### 5. Build for Production

```bash
npm run build
npm start
```

## Customization Guide

### Changing Colors

Edit CSS variables in `src/styles/globals.css`:

```css
:root {
  --color-primary: #F46A1F;
  --color-primary-600: #E25612;
  --color-primary-700: #C74A10;
  /* ... other colors ... */
}
```

Or use Tailwind color utilities directly in components.

### Adjusting Spacing

Modify `tailwind.config.js` to adjust:
- Container padding
- Section padding (py-16, py-24)
- Gap sizes

### Modifying Animations

Edit keyframes in `tailwind.config.js`:
- `bob`: Mascot bobbing animation
- `float`: Floating animation
- `confetti-fall`: Confetti particle animation

Disable animations by removing `animate-*` classes or checking `prefers-reduced-motion`.

### Changing Fonts

Update font imports in `globals.css` and Tailwind config:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;600&display=swap');
```

## Accessibility Features

✅ WCAG AA compliant color contrast ratios
✅ Focus indicators with lime accent
✅ Keyboard navigation support
✅ Screen reader support with ARIA labels
✅ Respects `prefers-reduced-motion`
✅ Touch-friendly interactive elements (44×44px minimum)
✅ Semantic HTML structure

## Performance Optimizations

✅ Image optimization with Next.js Image component
✅ CSS-in-JS with Tailwind (no runtime overhead)
✅ Code splitting with dynamic imports
✅ Lazy loading for components
✅ Optimized bundle size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Next Steps

1. **Add mascot image**: Place `mascot.png` in `public/`
2. **Integrate with backend**: Connect login form to authentication API
3. **Add more pages**: Create additional pages using the same design system
4. **Customize content**: Update copy, links, and CTAs
5. **Deploy**: Build and deploy to production

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── theme-provider.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── CTA.tsx
│   │   ├── BrandMark.tsx
│   │   ├── Mascot.tsx
│   │   ├── SaffronButton.tsx
│   │   ├── Field.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── MainNav.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── landing.tsx
│   │   └── login.tsx
│   └── styles/
│       └── globals.css
├── tailwind.config.js
└── DESIGN_SYSTEM_README.md
```

## Support

For questions or issues, refer to:
- Tailwind CSS docs: https://tailwindcss.com
- Next.js docs: https://nextjs.org
- Radix UI docs: https://radix-ui.com

