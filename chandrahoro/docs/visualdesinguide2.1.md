# ChandraHoro V2.1— UI/UX Design System
**Complete Visual Design Guide | v2.0**

---

## 📐 Design Philosophy

**Core Principles:**
1. **Mystical yet Modern**: Balance ancient wisdom with contemporary design
2. **Data-Rich but Clear**: Show complex astrological data without overwhelming
3. **Accessible**: WCAG AA compliant, works for all users
4. **Bilingual-Ready**: Seamless English ↔ Telugu switching
5. **Mobile-First**: 80% of users on mobile devices

**Design Keywords**: Celestial, Trustworthy, Intuitive, Premium, Calm

---

## 🎨 Color System

### Primary Palette

```css
/* Saffron & Mandala Theme */
--primary-saffron: #FF6B35;      /* Primary CTA, active states */
--primary-gold: #F7931E;          /* Accent, highlights */
--primary-marigold: #FDB827;      /* Warnings, notifications */

/* Celestial Blues */
--celestial-deep: #1E3A5F;        /* Headers, dark mode base */
--celestial-medium: #2E5C8A;      /* Secondary elements */
--celestial-light: #4A7BA7;       /* Hover states */

/* Neutrals */
--neutral-white: #FFFFFF;
--neutral-cream: #FFF8F0;         /* Light mode background */
--neutral-sand: #F5E6D3;          /* Card backgrounds */
--neutral-stone: #9E9E9E;         /* Text secondary */
--neutral-charcoal: #333333;      /* Text primary */
--neutral-black: #000000;

/* Semantic Colors */
--success-green: #4CAF50;         /* Positive yogas, strong planets */
--warning-amber: #FF9800;         /* Cautions, moderate strengths */
--danger-red: #F44336;            /* Negative aspects, weak planets */
--info-blue: #2196F3;             /* Tips, informational */
```

### Gradient System

```css
/* Celestial Gradients */
--gradient-sunset: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
--gradient-night-sky: linear-gradient(135deg, #1E3A5F 0%, #2E5C8A 100%);
--gradient-twilight: linear-gradient(135deg, #4A7BA7 0%, #9C88FF 100%);
--gradient-cosmic: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);

/* Chart Backgrounds */
--gradient-chart-bg: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);
```

### Dark Mode Palette

```css
/* Dark Mode Overrides */
--dm-background: #0A0E1A;         /* Main background */
--dm-surface: #1A1F35;            /* Cards, panels */
--dm-surface-elevated: #252B42;   /* Elevated cards */
--dm-text-primary: #E8E8E8;
--dm-text-secondary: #A0A0A0;
--dm-border: #2A3045;
```

---

## 🔤 Typography

### Font Stack

```css
/* Primary (Headings, UI) */
--font-display: 'Poppins', 'Noto Sans Telugu', sans-serif;

/* Secondary (Body, Reading Text) */
--font-body: 'Inter', 'Noto Sans Telugu', sans-serif;

/* Monospace (Chart Data, Degrees) */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Telugu Fallback */
--font-telugu: 'Noto Sans Telugu', 'Tiro Telugu', sans-serif;
```

### Type Scale

```css
/* Display Titles */
--text-5xl: 3.815rem;    /* 61px - Hero headings */
--text-4xl: 3.052rem;    /* 49px - Page titles */
--text-3xl: 2.441rem;    /* 39px - Section titles */

/* Headings */
--text-2xl: 1.953rem;    /* 31px - Card titles */
--text-xl: 1.563rem;     /* 25px - Subsections */
--text-lg: 1.25rem;      /* 20px - Large body */

/* Body */
--text-base: 1rem;       /* 16px - Default body */
--text-sm: 0.875rem;     /* 14px - Small text */
--text-xs: 0.75rem;      /* 12px - Captions, labels */

/* Chart Labels */
--text-chart-lg: 0.875rem;
--text-chart-sm: 0.625rem;
```

### Font Weights

```css
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-black: 900;
```

---

## 📏 Spacing & Layout

### Spacing Scale (8px base)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Container Widths

```css
--container-xs: 320px;   /* Mobile */
--container-sm: 640px;   /* Tablet portrait */
--container-md: 768px;   /* Tablet landscape */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large desktop */
--container-2xl: 1536px; /* Ultra-wide */
```

### Border Radius

```css
--radius-sm: 4px;     /* Buttons, inputs */
--radius-md: 8px;     /* Cards */
--radius-lg: 16px;    /* Modals, panels */
--radius-xl: 24px;    /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 🎭 Components

### 1. Navigation Bar

#### Desktop Navigation
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]                  [Daily] [Chat] [Profile]   [⚙️] [🌙] │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 64px
- Background: Blur effect + semi-transparent white/dark
- Shadow: `0 2px 8px rgba(0,0,0,0.1)`
- Sticky positioning on scroll
- Active tab indicator: 2px bottom border (saffron)

#### Mobile Navigation (Bottom Tab Bar)
```
┌─────────────────────────────────────────────────────────────┐
│                       Screen Content                          │
│                                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│   [🏠]        [💬]        [📊]        [👤]        [⚙️]       │
│   Home       Chat       Charts      Profile    Settings      │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 72px (includes labels)
- Safe area padding for notched devices
- Active icon: Scale 1.1x + saffron color
- Haptic feedback on tap (iOS)

---

### 2. Daily Reading Card

```
┌──────────────────────────────────────────────────────────┐
│ ☀️  Today's Reading                        [Share] [💾]  │
│ October 26, 2025                                          │
│                                                           │
│ ⭐ Key Highlights                                         │
│ • Communication flows smoothly today                     │
│ • Focus on financial planning                            │
│ • Rest early for better energy tomorrow                  │
│                                                           │
│ [Expand Full Reading →]                                  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💼 Work      ❤️ Love      🏥 Health      💰 Finance │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 🕐 Best Timings                                           │
│ 10:30 AM - 12:15 PM  →  Important meetings               │
│                                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Powered by Claude Sonnet • 1,523 tokens                  │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- Card padding: 24px
- Border radius: 16px
- Background: White (light) / --dm-surface (dark)
- Shadow: `0 4px 20px rgba(0,0,0,0.08)`
- Highlight bullets: Custom saffron bullet points
- Tab pills: Rounded, glassmorphism effect
- Expand animation: Smooth height transition (300ms)

**Interaction States:**
- Hover: Slight shadow increase
- Tap: Scale 0.98x (mobile)
- Share button: Opens native share sheet (mobile) or modal (desktop)

---

### 3. Chart Visualization Components

#### A. Natal Chart (Circular - Modern Style)

```
         ┌─────────────────────────┐
         │     🔘 North Indian      │
         │      🔘 South Indian     │
         └─────────────────────────┘
         
                   12
              ♈    Aries
                   
       11   ♓           ♉   1
          Pisces       Taurus
                         
    10  ♒               ♊  2
      Aquarius         Gemini
      
          ♑    ☀️ ☾ ♃    ♋
     9   Capricorn   Cancer  3
     
          ♐             ♌
      8  Sagittarius   Leo  4
      
          ♏             ♍
       7 Scorpio    Virgo   5
       
              ♎
            6  Libra

    [Planet Legend Below]
    ☀️ Sun 08°    ♃ Jupiter 05°(R)
    ☾ Moon 12°    ♄ Saturn 20°
```

**Specifications:**
- SVG-based, scalable and sharp
- Outer circle: 300px diameter (mobile) / 500px (desktop)
- Planet symbols: 24px size, positioned by degree
- House numbers: 16px, bold, celestial-deep color
- Sign names: 12px, medium weight
- Retrograde indicator: (R) in red with animation
- Interactive: Tap planet → shows details modal
- Animation: Planets fade in sequentially (100ms delay between)

**Color Coding:**
- Benefic planets: Green tint
- Malefic planets: Red tint
- Neutral: Blue tint
- Exalted: Gold ring around planet
- Debilitated: Gray ring

#### B. Strength Meter (Shadbala)

```
Saturn    ████████░░░░░░░░░░░  42% ─┐
Jupiter   ████████████████░░░░  78% ─┤ Strong
Moon      ███████████░░░░░░░░░  58% ─┤
Sun       ██████████████████░░  88% ─┘
Mercury   ███████░░░░░░░░░░░░░  38% ─┐ Moderate
Venus     ████████████░░░░░░░░  63% ─┘
Mars      ████░░░░░░░░░░░░░░░░  22% ─── Weak
```

**Specifications:**
- Bar height: 24px
- Border radius: 12px (pill shape)
- Gradient fill based on strength:
  - 0-33%: Red to orange gradient
  - 34-66%: Orange to yellow gradient
  - 67-100%: Yellow to green gradient
- Percentage text: Right-aligned, bold
- Hover: Show detailed breakdown tooltip
- Animation: Bars fill from left on load (500ms)

#### C. Dasha Timeline (Horizontal)

```
┌─────────────────────────────────────────────────────────┐
│                    Dasha Periods                         │
│                                                          │
│ Past          Current             Future                │
│ ──────────●═══════════════●────────────────────────────│
│           2020          2025                    2030    │
│                                                          │
│           ♃ Jupiter    ♄ Saturn    ☿ Mercury           │
│           2016-2025    2025-2033   2033-2038           │
│                                                          │
│ [Current Sub-Period]                                    │
│ Saturn-Saturn-Rahu                                      │
│ Oct 2024 - Jan 2025                                     │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- Timeline width: 100% (responsive)
- Current period: Thicker line (8px) + gradient
- Past/future: Thin line (2px) + muted color
- Current marker: Pulsing circle animation
- Planet icons: 32px, positioned above timeline
- Dates: 12px, below timeline
- Tap period: Expands to show sub-periods
- Swipe (mobile): Navigate through timeline

#### D. Compatibility Score Gauge

```
         ┌─────────────────┐
         │   Compatibility  │
         │                  │
         │      ╭──────╮   │
         │     ╱        ╲  │
         │    │          │ │
         │    │   7.5    │ │
         │    │   ★★★★☆  │ │
         │     ╲        ╱  │
         │      ╰──────╯   │
         │                  │
         │   Good Match     │
         └─────────────────┘
```

**Specifications:**
- Circular gauge with gradient arc
- Score range: 0-10
- Arc colors:
  - 0-3: Red gradient
  - 4-6: Orange gradient
  - 7-8: Yellow gradient
  - 9-10: Green gradient
- Center number: 48px, bold
- Star rating: 5 stars, filled based on score
- Label: "Poor", "Fair", "Good", "Excellent"
- Animation: Arc draws from 0 to score (1s ease-out)

---

### 4. AI Chat Interface

```
┌──────────────────────────────────────────────────────────┐
│ ← AI Astro-Guide                             ⚙️ Settings │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ What does Saturn in 10th house mean?   │ You        │
│  └─────────────────────────────────────────┘            │
│                                                           │
│            ┌──────────────────────────────────────────┐ │
│    Claude  │ Saturn in your 10th house suggests a    │ │
│            │ career path marked by discipline and... │ │
│            │                                          │ │
│            │ 📊 Based on your chart:                 │ │
│            │ • Saturn in Capricorn (10th house)      │ │
│            │ • Strength: Strong (78%)                │ │
│            │                                          │ │
│            │ [Learn More] [Related Questions]        │ │
│            └──────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ When should I start a business?         │ You        │
│  └─────────────────────────────────────────┘            │
│                                                           │
│            ┌──────────────────────────────────────────┐ │
│    Claude  │ Based on your transits, waiting 6-8    │ │
│            │ months would be more favorable when... │ │
│            │                                          │ │
│            │ [Typing indicator ...]                  │ │
│            └──────────────────────────────────────────┘ │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ [📎]  Type your question...                      [Send] │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- User bubbles: Right-aligned, saffron gradient background
- AI bubbles: Left-aligned, celestial gradient background
- Bubble padding: 16px
- Bubble radius: 18px (with tail)
- Bubble shadow: Subtle elevation
- Text: 16px, line-height 1.5
- Spacing between messages: 16px
- Chart data cards: Inline, bordered, tap to expand
- Typing indicator: 3 animated dots
- Scroll behavior: Auto-scroll to latest message
- Input: Fixed at bottom, 52px height
- Send button: Disabled until text entered

**Interaction:**
- Long press bubble: Copy, share, regenerate options
- Tap chart reference: Opens detailed view
- Pull to refresh: Loads older messages

---

### 5. Notification Cards

#### Daily Reading Ready

```
┌────────────────────────────────────────────┐
│ ✨ Your Daily Reading is Ready              │
│                                             │
│ October 26, 2025                            │
│ • Communication flows smoothly              │
│ • Focus on financial planning               │
│                                             │
│ [Read Now]                          [Later] │
└────────────────────────────────────────────┘
```

#### Quota Warning

```
┌────────────────────────────────────────────┐
│ ⚠️ AI Quota Alert                           │
│                                             │
│ You've used 8 of 10 daily requests.        │
│ Resets at midnight IST.                    │
│                                             │
│ [Upgrade to Pro]                   [Close] │
└────────────────────────────────────────────┘
```

**Specifications:**
- Toast notifications: Bottom-center (mobile), top-right (desktop)
- Duration: 5 seconds (dismissible)
- Animation: Slide in from bottom/side
- Icon: 24px, colored based on type
- Buttons: Inline, secondary style
- Swipe to dismiss (mobile)

---

### 6. Data Visualization Charts

#### A. Aspect Strength Radar Chart

```
            Work (85%)
               ╱│╲
              ╱ │ ╲
             ╱  │  ╲
  Health(72%)───●───Love(90%)
            ╲  │  ╱
             ╲ │ ╱
              ╲│╱
         Finance(65%)
```

**Specifications:**
- Library: Recharts or Chart.js
- 5-8 axes (customizable aspects)
- Filled area: Semi-transparent gradient
- Border: Solid line (2px)
- Axis labels: 14px, positioned outside
- Grid lines: Dotted, muted color
- Interactive: Hover axis to see exact value
- Responsive: Scales down for mobile

#### B. Transit Timeline

```
Oct 25  Oct 26  Oct 27  Oct 28  Oct 29  Oct 30
  │       ▼       │       │       │       │
  ├───────●───────┼───────┼───────┼───────┤
  │     TODAY     │       │       │       │
  │               │       │       │       │
  ☽ Moon → Taurus         ☿ Mercury enters Leo
  ♄ Saturn direct                ♃ Jupiter aspect
```

**Specifications:**
- Horizontal timeline with key events
- Current day: Highlighted marker
- Event icons: Planet symbols (24px)
- Event cards: Expand on tap
- Scroll horizontally: ±30 days
- Colors: Planet-specific colors

#### C. Planetary Strength Heatmap

```
       Mon  Tue  Wed  Thu  Fri  Sat  Sun
Sun    ██   ███  ███  ██   █    ██   ███
Moon   ███  ██   █    ███  ███  ██   ██
Mars   █    ██   ███  ██   ██   ███  █
```

**Specifications:**
- Grid: 7 columns (days) × 9 rows (planets)
- Cell size: 32px × 32px
- Color intensity: Based on strength
- Hover: Shows exact strength percentage
- Legend: Color scale at bottom
- Weekly or monthly view toggle

---

### 7. Profile & Settings

#### Profile Card

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                      [Profile Photo]                      │
│                                                           │
│                    John Doe                               │
│                 ♈ Aries Rising                           │
│                                                           │
│  ☀️ Sun: Aries 08°        ☾ Moon: Taurus 12°           │
│  🎂 July 17, 1972         📍 Palakollu, India           │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  💬 AI Quota:  5 / 10 requests remaining          │ │
│  │  📊 Plan: Free     [Upgrade to Pro →]             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  [Edit Profile]  [View Full Chart]  [Share Profile]     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

#### Settings Panel

```
┌──────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ 🌐 Language                                              │
│ [English ▼]                                              │
│                                                           │
│ 🎨 Appearance                                            │
│ ○ Light  ● Dark  ○ Auto                                │
│                                                           │
│ 🎭 Tone Preference                                       │
│ ○ Mystic  ● Practical  ○ Playful                       │
│                                                           │
│ 🔔 Notifications                                         │
│ ◉ Daily Reading Reminders                               │
│ ◉ Transit Alerts                                         │
│ ○ Chat Message Replies                                  │
│                                                           │
│ 🤖 AI Settings                                           │
│ [Configure LLM Provider →]                               │
│                                                           │
│ 🔒 Privacy                                               │
│ [Export My Data]  [Delete Account]                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- Section spacing: 24px between groups
- Section headers: 18px, semibold, with icon
- Toggles: iOS-style switches (40px width)
- Radio buttons: Custom styled, 20px
- Dropdowns: Native select with custom styling
- Buttons: Full width on mobile, inline on desktop
- Danger actions: Red color with confirmation modal

---

### 8. Admin Dashboard

#### Admin Control Panel

```
┌──────────────────────────────────────────────────────────┐
│ ChandraHoro Admin                            👤 Admin    │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📊 Today's Metrics                                   │ │
│ │                                                      │ │
│ │ Active Users: 1,234        AI Requests: 9,876      │ │
│ │ Daily Readings: 987        Tokens Used: 2.3M       │ │
│ │ Cost Today: $123           Quota Warnings: 45      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📈 AI Usage Chart (Last 7 Days)                     │ │
│ │                                                      │ │
│ │     12K ┤                              ╭─●          │ │
│ │     10K ┤                        ╭────╯            │ │
│ │      8K ┤                  ╭────╯                  │ │
│ │      6K ┤            ╭────╯                        │ │
│ │      4K ┤      ╭────╯                              │ │
│ │      2K ┤ ●───╯                                    │ │
│ │       0 └───┬───┬───┬───┬───┬───┬                 │ │
│ │           Mon Tue Wed Thu Fri Sat Sun              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [👥 Users] [🎯 Entitlements] [📋 Audit Logs] [📊 Metrics]│
└──────────────────────────────────────────────────────────┘
```

#### User Management Table

```
┌──────────────────────────────────────────────────────────┐
│ 🔍 [Search users...]                        [+ Add User] │
├──────────────────────────────────────────────────────────┤
│ Name          Email               Plan    AI Quota       │
├──────────────────────────────────────────────────────────┤
│ John Doe      john@email.com     Pro     █████░░░░░ 78%│
│ Jane Smith    jane@email.com     Basic   ████████░░ 95%│
│ Bob Johnson   bob@email.com      Free    ██░░░░░░░░ 20%│
│ ...                                                       │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- Metric cards: 3-column grid (desktop), stacked (mobile)
- Card height: 120px
- Charts: Recharts library, responsive
- Table: Sortable columns, 50 rows per page
- Row hover: Highlight background
- Actions: Kebab menu (⋮) on right
- Filters: Sticky at top when scrolling

---

## 🎨 Animation & Motion

### Animation Principles

1. **Purposeful**: Every animation has a reason
2. **Fast**: Max 300ms for UI transitions
3. **Natural**: Ease-out curves feel more natural
4. **Reduced Motion**: Respect user preferences

### Animation Library

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}

/* Pulse (for notifications) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Shimmer (for loading states) */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Planet Orbit (for chart animations) */
@keyframes orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Component-Specific Animations

| Component | Entry Animation | Exit Animation | Duration |
|-----------|----------------|----------------|----------|
| Modal | Scale In | Scale Out | 200ms |
| Toast | Slide Up | Slide Down | 300ms |
| Card | Fade In | Fade Out | 150ms |
| Chart | Draw (sequential) | - | 500ms |
| Button (hover) | Scale 1.05x | Scale 1x | 100ms |
| Page transition | Fade | Fade | 200ms |

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small phones */
@media (min-width: 320px) {
  /* Base styles */
}

/* Large phones */
@media (min-width: 375px) {
  /* Slightly larger text, more padding */
}

/* Tablets portrait */
@media (min-width: 768px) {
  /* 2-column layouts, side-by-side charts */
}

/* Tablets landscape / Small desktop */
@media (min-width: 1024px) {
  /* 3-column layouts, sidebar navigation */
}

/* Desktop */
@media (min-width: 1280px) {
  /* Full features, multi-panel layouts */
}

/* Large desktop */
@media (min-width: 1536px) {
  /* Max width container, extra whitespace */
}
```

### Layout Patterns

**Mobile (< 768px):**
- Single column
- Bottom tab navigation
- Stacked cards
- Full-width charts
- Collapsible sections

**Tablet (768px - 1024px):**
- 2-column grid for cards
- Side navigation (drawer)
- Charts with better aspect ratios
- Split view for chat (list + conversation)

**Desktop (> 1024px):**
- 3-column grid for dashboard
- Persistent sidebar navigation
- Multi-panel layouts (chart + details side-by-side)
- Hover states and tooltips
- Keyboard shortcuts

---

## ♿ Accessibility

### WCAG AA Compliance

**Color Contrast:**
- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio

**Focus States:**
- Visible focus indicators (2px outline)
- High contrast focus rings
- Skip to main content link

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Logical tab order
- Escape closes modals
- Arrow keys navigate charts

**Screen Readers:**
- Semantic HTML (header, nav, main, footer)
- ARIA labels for icons
- ARIA live regions for dynamic content
- Alt text for images

**Motion:**
- Respect `prefers-reduced-motion`
- Disable animations if requested
- Provide static alternatives

---

## 🌐 Internationalization (i18n)

### English ↔ Telugu Support

**Text Direction:**
- Both languages: LTR (left-to-right)
- No RTL considerations needed for MVP

**Font Switching:**
```css
:root {
  --font-primary: 'Poppins', sans-serif;
}

:root[lang="te"] {
  --font-primary: 'Noto Sans Telugu', 'Tiro Telugu', sans-serif;
}
```

**Number Formatting:**
- English: 1,234.56
- Telugu: 1,234.56 (same format, but labels in Telugu)

**Date Formatting:**
- English: October 26, 2025
- Telugu: అక్టోబర్ 26, 2025

**String Length Considerations:**
- Telugu text can be 20-30% longer
- Design for flexible containers
- Test all UI with longest translations

---

## 🎬 Loading States

### Skeleton Screens

```
┌──────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                        │
│                                                           │
│ ▓▓▓▓▓▓▓▓▓▓▓▓                                             │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                    │
│ ▓▓▓▓▓▓▓▓▓▓▓▓                                             │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ▓▓▓▓▓▓▓▓▓▓                                               │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- Shimmer animation: Gradient moves left to right
- Colors: Light gray (light mode), dark gray (dark mode)
- Duration: Shows until content loads
- Match layout: Skeleton mirrors actual component structure

### Loading Spinners

**Primary Spinner** (for full-page loads):
```css
/* Celestial spinner with orbiting planets */
.spinner {
  width: 60px;
  height: 60px;
  position: relative;
}

.spinner-core {
  width: 20px;
  height: 20px;
  background: var(--primary-saffron);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner-orbit {
  width: 100%;
  height: 100%;
  border: 2px solid var(--celestial-light);
  border-top-color: var(--primary-saffron);
  border-radius: 50%;
  animation: orbit 1s linear infinite;
}
```

**Inline Spinner** (for buttons):
- Size: 16px × 16px
- Simple circular spinner
- Same color as button text

---

## 🖼️ Iconography

### Icon System

**Library:** Lucide Icons (outline style)

**Sizes:**
- xs: 16px
- sm: 20px
- md: 24px (default)
- lg: 32px
- xl: 48px

**Custom Astrology Icons:**
- Planet symbols (☀️☾♂♃♄♅♆♇)
- Zodiac signs (♈♉♊♋♌♍♎♏♐♑♒♓)
- House numbers (I, II, III, ... XII)
- Aspects (△ □ ⚹ ☍)

**Color Usage:**
- Default: Inherit from parent
- Active: Saffron
- Disabled: 40% opacity
- Hover: Slight scale (1.1x)

---

## 📦 Design Tokens (JSON)

```json
{
  "colors": {
    "primary": {
      "saffron": "#FF6B35",
      "gold": "#F7931E",
      "marigold": "#FDB827"
    },
    "celestial": {
      "deep": "#1E3A5F",
      "medium": "#2E5C8A",
      "light": "#4A7BA7"
    },
    "semantic": {
      "success": "#4CAF50",
      "warning": "#FF9800",
      "danger": "#F44336",
      "info": "#2196F3"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px",
    "12": "48px"
  },
  "typography": {
    "fontFamily": {
      "display": "Poppins, sans-serif",
      "body": "Inter, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.25rem",
      "xl": "1.563rem",
      "2xl": "1.953rem",
      "3xl": "2.441rem"
    },
    "fontWeight": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "xl": "24px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)",
    "xl": "0 20px 25px rgba(0,0,0,0.15)"
  }
}
```

---

## 🛠️ Design Tools & Resources

### Figma Files Structure

```
ChandraHoro Design System/
├── 00_Foundations/
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Icons
├── 01_Components/
│   ├── Buttons
│   ├── Cards
│   ├── Forms
│   ├── Charts
│   └── Navigation
├── 02_Patterns/
│   ├── Daily Reading
│   ├── Chat Interface
│   ├── Profile
│   └── Admin Dashboard
└── 03_Templates/
    ├── Mobile Screens
    ├── Tablet Screens
    └── Desktop Screens
```

### Component Library (React + Tailwind)

```bash
# Install dependencies
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install recharts lucide-react
npm install tailwindcss-animate
```

### Recommended Tools

- **Design**: Figma (primary), Adobe XD (alternative)
- **Prototyping**: ProtoPie, Figma prototyping
- **Icons**: Lucide Icons, Custom SVG
- **Charts**: Recharts, Chart.js, D3.js
- **Colors**: Coolors.co, Adobe Color
- **Fonts**: Google Fonts, Adobe Fonts

---

## 🎯 Design Checklist

### Before Development

- [ ] All screens designed for mobile, tablet, desktop
- [ ] Dark mode variants created
- [ ] Telugu translations provided
- [ ] Accessibility annotations added
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined
- [ ] Success states defined
- [ ] Interactive states (hover, active, disabled)
- [ ] Design tokens exported
- [ ] Component documentation written
- [ ] Handoff to developers completed

### Quality Assurance

- [ ] Color contrast tested (WCAG AA)
- [ ] Touch targets minimum 44px
- [ ] Text legible at all sizes
- [ ] Charts responsive and readable
- [ ] Animations smooth (60fps)
- [ ] Loading states feel fast
- [ ] Error messages helpful
- [ ] Consistent spacing throughout
- [ ] Consistent typography throughout
- [ ] Icons sized appropriately

---

## 📐 Design Specifications Export

### For Developers

**Zeplin / Figma Inspect:**
- Export specs with measurements
- Provide CSS snippets
- Include asset exports (SVG, PNG @2x, @3x)

**Asset Naming Convention:**
```
icon-{name}-{size}.svg
chart-{type}-placeholder.png
illustration-{context}-{variant}.svg
```

**Example:**
```
icon-sun-24.svg
icon-moon-32.svg
chart-natal-example@2x.png
illustration-empty-readings-light.svg
illustration-empty-readings-dark.svg
```

---

## 🌟 Design Philosophy Summary

**The ChandraHoro design system balances:**

1. **Ancient Wisdom**: Traditional astrological symbolism and colors
2. **Modern Interface**: Clean, contemporary UI patterns
3. **Data Richness**: Complex information presented clearly
4. **Accessibility**: Usable by everyone, regardless of ability
5. **Performance**: Fast, smooth, delightful interactions
6. **Cultural Sensitivity**: Respectful Telugu translations and localization

**Design Goal:**  
*"Make astrology accessible, trustworthy, and beautiful for the modern user while honoring its ancient roots."*

---

**End of Design System**

**Next Steps:**
1. Review design system with team
2. Create Figma components library
3. Build React component library
4. Test with real users
5. Iterate based on feedback

---

**Document Version:** 1.0  
**Last Updated:** October 25, 2025  
**Maintained By:** Design Team