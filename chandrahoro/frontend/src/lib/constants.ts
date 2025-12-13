/**
 * Constants for ChandraHoro V2.1
 *
 * This file contains all application constants including API endpoints,
 * astrological data, configuration values, and design system tokens.
 *
 * @author ChandraHoro Development Team
 * @version 2.1.0
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_URL = API_BASE_URL; // Legacy alias for compatibility
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;

// Application Configuration
export const APP_NAME = 'ChandraHoro';
export const APP_VERSION = '2.1.0';
export const APP_DESCRIPTION = 'AI-Powered Vedic Astrology Platform';

// Design System Constants
export const DESIGN_TOKENS = {
  colors: {
    saffron: '#FF6B35',
    celestialDeep: '#1E3A5F',
    celestialMedium: '#2E5C8A',
    celestialLight: '#E8F1F8',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

// Chart Types (Divisional Charts)
export const CHART_TYPES = {
  D1: 'Rashi (D1)',
  D9: 'Navamsa (D9)',
  D10: 'Dasamsa (D10)',
  D12: 'Dwadasamsa (D12)',
  D16: 'Shodasamsa (D16)',
  D20: 'Vimsamsa (D20)',
  D24: 'Chaturvimsamsa (D24)',
  D27: 'Nakshatramsa (D27)',
  D30: 'Trimsamsa (D30)',
  D40: 'Khavedamsa (D40)',
  D45: 'Akshavedamsa (D45)',
  D60: 'Shashtyamsa (D60)',
} as const;

// Default charts to calculate for all users
export const DEFAULT_CHARTS = ['D1', 'D9', 'D10'] as const;

// Ayanamsa Systems
export const AYANAMSA_OPTIONS = [
  { value: 'Lahiri', label: 'Lahiri (Chitrapaksha)' },
  { value: 'Raman', label: 'Raman' },
  { value: 'Krishnamurti', label: 'Krishnamurti Paddhati (KP)' },
  { value: 'Fagan', label: 'Fagan/Bradley' },
  { value: 'Yukteshwar', label: 'Yukteshwar' },
];

// House Systems
export const HOUSE_SYSTEMS = [
  { value: 'Whole Sign', label: 'Whole Sign (Vedic)' },
  { value: 'Equal', label: 'Equal House' },
  { value: 'Placidus', label: 'Placidus' },
];

// Chart Styles
export const CHART_STYLES = [
  { value: 'North Indian', label: 'North Indian (Diamond)' },
  { value: 'South Indian', label: 'South Indian (Square)' },
];

// Divisional Charts with descriptions
export const DIVISIONAL_CHARTS = [
  { value: 'D1', label: 'D1 (Rāśi)', description: 'Birth Chart' },
  { value: 'D9', label: 'D9 (Navāṃśa)', description: 'Ninth Harmonic' },
  { value: 'D10', label: 'D10 (Daśāṃśa)', description: 'Career' },
  { value: 'D2', label: 'D2 (Horā)', description: 'Wealth' },
  { value: 'D3', label: 'D3 (Drekkāṇa)', description: 'Siblings' },
  { value: 'D4', label: 'D4 (Chaturthāṃśa)', description: 'Property' },
  { value: 'D7', label: 'D7 (Saptāṃśa)', description: 'Children' },
  { value: 'D12', label: 'D12 (Dvādaśāṃśa)', description: 'Parents' },
];

// Planets
export const PLANETS = {
  SUN: 'Sun',
  MOON: 'Moon',
  MARS: 'Mars',
  MERCURY: 'Mercury',
  JUPITER: 'Jupiter',
  VENUS: 'Venus',
  SATURN: 'Saturn',
  RAHU: 'Rahu',
  KETU: 'Ketu',
} as const;

// Planet symbols for display
export const PLANET_SYMBOLS = {
  SUN: '☉',
  MOON: '☽',
  MARS: '♂',
  MERCURY: '☿',
  JUPITER: '♃',
  VENUS: '♀',
  SATURN: '♄',
  RAHU: '☊',
  KETU: '☋',
} as const;

// Houses
export const HOUSES = {
  FIRST: '1st House',
  SECOND: '2nd House',
  THIRD: '3rd House',
  FOURTH: '4th House',
  FIFTH: '5th House',
  SIXTH: '6th House',
  SEVENTH: '7th House',
  EIGHTH: '8th House',
  NINTH: '9th House',
  TENTH: '10th House',
  ELEVENTH: '11th House',
  TWELFTH: '12th House',
} as const;

// House meanings
export const HOUSE_MEANINGS = {
  1: 'Self, Personality, Appearance',
  2: 'Wealth, Family, Speech',
  3: 'Siblings, Courage, Communication',
  4: 'Home, Mother, Happiness',
  5: 'Children, Education, Creativity',
  6: 'Health, Enemies, Service',
  7: 'Marriage, Partnership, Business',
  8: 'Longevity, Transformation, Occult',
  9: 'Fortune, Religion, Higher Learning',
  10: 'Career, Status, Father',
  11: 'Gains, Friends, Aspirations',
  12: 'Loss, Spirituality, Foreign Lands',
} as const;

// Zodiac Signs
export const ZODIAC_SIGNS = {
  ARIES: 'Aries',
  TAURUS: 'Taurus',
  GEMINI: 'Gemini',
  CANCER: 'Cancer',
  LEO: 'Leo',
  VIRGO: 'Virgo',
  LIBRA: 'Libra',
  SCORPIO: 'Scorpio',
  SAGITTARIUS: 'Sagittarius',
  CAPRICORN: 'Capricorn',
  AQUARIUS: 'Aquarius',
  PISCES: 'Pisces',
} as const;

// Zodiac sign symbols
export const ZODIAC_SYMBOLS = {
  ARIES: '♈',
  TAURUS: '♉',
  GEMINI: '♊',
  CANCER: '♋',
  LEO: '♌',
  VIRGO: '♍',
  LIBRA: '♎',
  SCORPIO: '♏',
  SAGITTARIUS: '♐',
  CAPRICORN: '♑',
  AQUARIUS: '♒',
  PISCES: '♓',
} as const;

// Nakshatras (27 lunar mansions)
export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
] as const;

// Vimshottari Dasha periods (in years)
export const DASHA_PERIODS = {
  KETU: 7,
  VENUS: 20,
  SUN: 6,
  MOON: 10,
  MARS: 7,
  RAHU: 18,
  JUPITER: 16,
  SATURN: 19,
  MERCURY: 17,
} as const;

// Total Vimshottari cycle
export const TOTAL_DASHA_CYCLE = 120; // years

// AI Configuration
export const AI_CONFIG = {
  maxTokensPerRequest: 4000,
  maxRequestsPerDay: 50,
  supportedModels: ['claude-3-sonnet', 'gpt-4', 'gemini-pro'],
  defaultModel: 'claude-3-sonnet',
  temperature: 0.7,
  maxRetries: 3,
} as const;

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPPORT: 'support',
  ANALYST: 'analyst',
  USER: 'user',
} as const;

// AI Entitlement Tiers
export const AI_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  AI_REQUESTS_PER_HOUR: 10,
  CHART_CALCULATIONS_PER_DAY: 100,
} as const;

// Supported Languages
export const LANGUAGES = {
  EN: 'en',
  TE: 'te', // Telugu
} as const;

// Time Zones
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

// Default system
export const DEFAULT_AYANAMSA = 'LAHIRI';

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AI_QUOTA_EXCEEDED: 'AI quota exceeded. Please upgrade your plan.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CHART_CREATED: 'Chart created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  AI_READING_GENERATED: 'AI reading generated successfully!',
} as const;