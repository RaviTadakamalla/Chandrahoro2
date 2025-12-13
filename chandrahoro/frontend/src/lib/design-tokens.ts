/**
 * ChandraHoro V2.1 Design Tokens
 * 
 * Complete design system tokens for consistent styling across the application.
 * These tokens are defined in Tailwind config and CSS custom properties.
 * 
 * @author ChandraHoro Development Team
 * @version 2.1.0
 */

// ========================================
// Color Tokens
// ========================================

export const COLORS = {
  // Primary Palette - Saffron & Mandala Theme
  saffron: {
    50: "#FFF7F0",
    100: "#FFEDE0",
    200: "#FFD4B8",
    300: "#FFB890",
    400: "#FF9268",
    500: "#FF6B35", // Primary saffron
    600: "#E55A2B",
    700: "#CC4921",
    800: "#B23817",
    900: "#99270D",
  },
  gold: {
    DEFAULT: "#F7931E",
    50: "#FFF9F0",
    100: "#FFF1E0",
    200: "#FFE0B8",
    300: "#FFCE90",
    400: "#FFBC68",
    500: "#F7931E",
    600: "#E08418",
    700: "#C97512",
    800: "#B2660C",
    900: "#9B5706",
  },
  marigold: {
    DEFAULT: "#FDB827",
    50: "#FFFBF0",
    100: "#FFF7E0",
    200: "#FFECB8",
    300: "#FFE190",
    400: "#FFD668",
    500: "#FDB827",
    600: "#E5A820",
    700: "#CD9819",
    800: "#B58812",
    900: "#9D780B",
  },

  // Celestial Blues
  celestial: {
    deep: "#1E3A5F",
    medium: "#2E5C8A",
    light: "#4A7BA7",
    50: "#F0F4F8",
    100: "#E8F1F8",
    200: "#D1E3F1",
    300: "#A3C7E3",
    400: "#75ABD5",
    500: "#2E5C8A",
    600: "#1E3A5F",
    700: "#162B47",
    800: "#0E1C2F",
    900: "#060D17",
  },

  // Neutral Colors
  neutral: {
    white: "#FFFFFF",
    cream: "#FFF8F0",
    sand: "#F5E6D3",
    stone: "#9E9E9E",
    charcoal: "#333333",
    black: "#000000",
  },

  // Semantic Colors
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#F44336",
  info: "#2196F3",

  // Dark Mode Colors
  dark: {
    bg: "#0A0E1A",
    surface: "#1A1F35",
    surfaceElevated: "#252B42",
    textPrimary: "#E8E8E8",
    textSecondary: "#A0A0A0",
    border: "#2A3045",
  },
} as const;

// ========================================
// Gradients
// ========================================

export const GRADIENTS = {
  sunset: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
  nightSky: "linear-gradient(135deg, #1E3A5F 0%, #2E5C8A 100%)",
  twilight: "linear-gradient(135deg, #4A7BA7 0%, #9C88FF 100%)",
  cosmic: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
  chartBg: "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)",
} as const;

// ========================================
// Typography
// ========================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "var(--font-inter)",
    heading: "var(--font-poppins)",
    mono: "JetBrains Mono",
    telugu: "var(--font-noto-sans-telugu)",
  },
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.25rem",    // 20px
    xl: "1.563rem",   // 25px
    "2xl": "1.953rem", // 31px
    "3xl": "2.441rem", // 39px
    "4xl": "3.052rem", // 49px
    "5xl": "3.815rem", // 61px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;

// ========================================
// Spacing (8px grid)
// ========================================

export const SPACING = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
  "4xl": "5rem",   // 80px
} as const;

// ========================================
// Border Radius
// ========================================

export const BORDER_RADIUS = {
  sm: "4px",      // Buttons, inputs
  md: "8px",      // Cards (default)
  lg: "16px",     // Modals, panels
  xl: "24px",     // Hero sections
  full: "9999px", // Pills, avatars
} as const;

// ========================================
// Animations
// ========================================

export const ANIMATIONS = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  easing: {
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// ========================================
// Shadows
// ========================================

export const SHADOWS = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  glow: "0 0 20px rgba(255, 107, 53, 0.3)",
  glowSaffron: "0 0 20px rgba(255, 107, 53, 0.4)",
  glowCelestial: "0 0 20px rgba(30, 58, 95, 0.3)",
  card: "0 4px 20px rgba(0, 0, 0, 0.08)",
  cardHover: "0 8px 30px rgba(0, 0, 0, 0.12)",
} as const;

// ========================================
// Breakpoints
// ========================================

export const BREAKPOINTS = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ========================================
// Z-Index Scale
// ========================================

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
} as const;

