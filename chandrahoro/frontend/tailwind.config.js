/**
 * Tailwind CSS Configuration for ChandraHoro V2.1
 *
 * Complete design system configuration including:
 * - ChandraHoro brand colors (saffron, celestial, semantic)
 * - Typography scale with custom fonts
 * - 8px spacing grid system
 * - Custom animations and keyframes
 * - Dark mode support (class-based)
 * - Responsive breakpoints
 *
 * @author ChandraHoro Development Team
 * @version 2.1.0
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Semantic colors (from shadcn/ui)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ========================================
        // ChandraHoro V2.1 Brand Colors
        // ========================================

        // Primary Palette - Saffron & Mandala Theme
        saffron: {
          DEFAULT: "#FF6B35",
          foreground: "#FFFFFF",
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
          500: "#F7931E", // Primary gold
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
          500: "#FDB827", // Primary marigold
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
          500: "#2E5C8A", // Medium celestial
          600: "#1E3A5F", // Deep celestial
          700: "#162B47",
          800: "#0E1C2F",
          900: "#060D17",
        },
        "celestial-deep": "#1E3A5F",
        "celestial-medium": "#2E5C8A",
        "celestial-light": "#4A7BA7",

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
        "dark-bg": "#0A0E1A",
        "dark-surface": "#1A1F35",
        "dark-surface-elevated": "#252B42",
        "dark-text-primary": "#E8E8E8",
        "dark-text-secondary": "#A0A0A0",
        "dark-border": "#2A3045",

        // Legacy colors (keeping for compatibility)
        "lime-accent": "#DAF56B",
        "ink-80": "#2A2B31",
        offwhite: "#FFF7EF",
      },
      // ========================================
      // Border Radius Scale
      // ========================================
      borderRadius: {
        sm: "4px",      // Buttons, inputs
        md: "8px",      // Cards (default)
        lg: "16px",     // Modals, panels
        xl: "24px",     // Hero sections
        full: "9999px", // Pills, avatars
      },

      // ========================================
      // Typography Configuration
      // ========================================
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
        telugu: ["var(--font-noto-sans-telugu)", "sans-serif"],
      },

      // Type Scale (rem-based)
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
        lg: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
        xl: ["1.563rem", { lineHeight: "2rem" }],     // 25px
        "2xl": ["1.953rem", { lineHeight: "2.25rem" }], // 31px
        "3xl": ["2.441rem", { lineHeight: "2.75rem" }], // 39px
        "4xl": ["3.052rem", { lineHeight: "3.5rem" }],  // 49px
        "5xl": ["3.815rem", { lineHeight: "4.5rem" }],  // 61px
      },

      // Font Weights
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        black: "900",
      },

      // ========================================
      // Spacing System (8px grid)
      // ========================================
      spacing: {
        0: "0",
        1: "0.25rem",   // 4px
        2: "0.5rem",    // 8px
        3: "0.75rem",   // 12px
        4: "1rem",      // 16px
        5: "1.25rem",   // 20px
        6: "1.5rem",    // 24px
        8: "2rem",      // 32px
        10: "2.5rem",   // 40px
        12: "3rem",     // 48px
        16: "4rem",     // 64px
        20: "5rem",     // 80px
        24: "6rem",     // 96px
        28: "7rem",     // 112px
        32: "8rem",     // 128px
        36: "9rem",     // 144px
        40: "10rem",    // 160px
        44: "11rem",    // 176px
        48: "12rem",    // 192px
        52: "13rem",    // 208px
        56: "14rem",    // 224px
        60: "15rem",    // 240px
        64: "16rem",    // 256px
        72: "18rem",    // 288px
        80: "20rem",    // 320px
        96: "24rem",    // 384px

        // Safe area insets for mobile devices
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // ========================================
      // Custom Animations & Keyframes
      // ========================================
      keyframes: {
        // Accordion animations (Radix UI)
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },

        // Fade animations
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },

        // Slide animations
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },

        // Scale animations
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.9)" },
        },

        // Pulse animation (for notifications)
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },

        // Shimmer animation (for loading states)
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },

        // Orbit animation (for planet animations)
        "orbit": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },

        // Bounce animations
        "bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },

        // Confetti animation
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(360deg)", opacity: "0" },
        },

        // Bounce (standard)
        "bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-25%)" },
        },
      },

      animation: {
        // Accordion
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Fade
        "fade-in": "fade-in 300ms ease-in-out",
        "fade-out": "fade-out 300ms ease-in-out",

        // Slide
        "slide-up": "slide-up 300ms ease-out",
        "slide-down": "slide-down 300ms ease-out",
        "slide-left": "slide-left 300ms ease-out",
        "slide-right": "slide-right 300ms ease-out",

        // Scale
        "scale-in": "scale-in 150ms ease-out",
        "scale-out": "scale-out 150ms ease-out",

        // Pulse
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        // Shimmer
        "shimmer": "shimmer 2s infinite",

        // Orbit
        "orbit": "orbit 20s linear infinite",

        // Bounce
        "bob": "bob 2.5s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "confetti-fall": "confetti-fall 3s ease-in forwards",
        "bounce": "bounce 1s infinite",
      },
      // ========================================
      // Box Shadows
      // ========================================
      boxShadow: {
        // Elevation shadows
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",

        // Custom shadows
        "soft": "0 6px 24px rgba(0, 0, 0, 0.12)",
        "glow": "0 0 20px rgba(255, 107, 53, 0.3)",
        "glow-saffron": "0 0 20px rgba(255, 107, 53, 0.4)",
        "glow-celestial": "0 0 20px rgba(30, 58, 95, 0.3)",
        "glass": "0 8px 32px rgba(31, 38, 135, 0.37)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
      },

      // ========================================
      // Backdrop Blur
      // ========================================
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },

      // ========================================
      // Gradients
      // ========================================
      backgroundImage: {
        "gradient-sunset": "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
        "gradient-night-sky": "linear-gradient(135deg, #1E3A5F 0%, #2E5C8A 100%)",
        "gradient-twilight": "linear-gradient(135deg, #4A7BA7 0%, #9C88FF 100%)",
        "gradient-cosmic": "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
        "gradient-chart-bg": "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)",
      },

      // ========================================
      // Transitions
      // ========================================
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },

      transitionTimingFunction: {
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      addUtilities({
        // Safe area utilities for mobile devices
        '.safe-area-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-area-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-area-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-area-x': {
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-area-y': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-area-all': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },

        // Touch-friendly utilities
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.touch-none': {
          'touch-action': 'none',
        },
        '.touch-pinch-zoom': {
          'touch-action': 'pinch-zoom',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },

        // Mobile-specific utilities
        '.mobile-scroll': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain',
        },
        '.no-tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.no-text-size-adjust': {
          '-webkit-text-size-adjust': '100%',
          'text-size-adjust': '100%',
        },
      });
    },
  ],
}