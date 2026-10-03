/**
 * Sādhana App — Design Tokens
 *
 * Palette inspired by traditional saffron/earth tones that feel
 * devotional without being loud.
 */

export const Colors = {
  // Primary — warm saffron
  primary: '#D4631A',
  primaryLight: '#F0A060',
  primaryDark: '#A04010',

  // Background — warm off-white (like aged paper / dhoti cloth)
  background: '#F9F4EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F0E8DC',

  // Text
  textPrimary: '#2C1A0E',
  textSecondary: '#7A5C40',
  textMuted: '#B09070',
  textInverse: '#FFFFFF',

  // Accent — deep sandalwood red
  accent: '#8B2E10',

  // Semantic
  success: '#4A8C3F',
  warning: '#C8860A',
  error: '#C0392B',
  info: '#2980B9',

  // Streak / Badges — gold
  gold: '#D4A017',
  goldLight: '#F5D060',

  // Borders / Dividers
  border: '#DDD0C0',
  divider: '#EAE0D0',

  // Tab bar
  tabActive: '#D4631A',
  tabInactive: '#B09070',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 30,
} as const;

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;
