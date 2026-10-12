/**
 * Sādhana App — Design Tokens (light + dark).
 *
 * USAGE (relied on by all screens): call `const t = useTheme()` and use
 * `t.*` for every color. Never import scheme-conditional logic elsewhere —
 * `useColorScheme` is used only inside `useTheme()`.
 *
 * Conventions:
 * - `primary` is for LARGE / BOLD accents only. Small text, icons on light,
 *   and ALL filled-button backgrounds use `primaryStrong`.
 * - `goldDeep` replaces `gold` for glyphs/icons on light (contrast).
 * - Filled buttons: `backgroundColor: t.primaryStrong` with
 *   `color: t.textInverse` text (white on light, `#241408` on dark).
 * - `Card` picks its shadow by theme (`t.mode`): `Shadow.card` on light,
 *   `Shadow.darkShadow` (elevation only, `shadowOpacity: 0`) on dark.
 * - Difficulty badge chips: `badge<Easy|Medium|Hard|Extreme><Bg|Text>`.
 */

import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    mode: 'light',

    // Primary — warm saffron (LARGE/BOLD accents only)
    primary: '#D4631A',
    primaryLight: '#F0A060',
    primaryDark: '#A04010',
    // Small text, icons on light, ALL filled-button backgrounds
    primaryStrong: '#A34C13',

    // Background — warm off-white (like aged paper / dhoti cloth)
    background: '#F9F4EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F0E8DC',

    // Text
    textPrimary: '#2C1A0E',
    textSecondary: '#7A5C40',
    textMuted: '#77603F',
    textInverse: '#FFFFFF',

    // Accent — deep sandalwood red
    accent: '#8B2E10',

    // Semantic
    success: '#3E7A35',
    warning: '#7A5A00',
    error: '#C0392B',
    info: '#1B6CA8',

    // Streak / Badges — gold (`goldDeep` for glyphs on light)
    gold: '#D4A017',
    goldLight: '#F5D060',
    goldDeep: '#8A6500',

    // Borders / Dividers
    border: '#DDD0C0',
    divider: '#EAE0D0',

    // Tab bar
    tabActive: '#D4631A',
    tabInactive: '#B09070',

    // Difficulty badge chips
    badgeEasyBg: '#D4EDDA',
    badgeEasyText: '#356B2D',
    badgeMediumBg: '#FFF3CD',
    badgeMediumText: '#7A5A00',
    badgeHardBg: '#F8D7DA',
    badgeHardText: '#A93226',
    badgeExtremeBg: '#3D0C02',
    badgeExtremeText: '#FFD700',
  },
  dark: {
    mode: 'dark',

    // Primary — warm saffron, lifted for dark backgrounds
    primary: '#EFA25E',
    primaryLight: '#F5C48E',
    primaryDark: '#C77F3A',
    // Dark filled-button bg (pair with `#241408` text via `textInverse`)
    primaryStrong: '#F2AC68',

    // Background — deep roasted-earth browns
    background: '#1B130C',
    surface: '#261B11',
    surfaceAlt: '#342818',

    // Text
    textPrimary: '#F7EFE3',
    textSecondary: '#CDB691',
    textMuted: '#A68B6B',
    textInverse: '#241408',

    // Accent — mirrors primary on dark
    accent: '#EFA25E',

    // Semantic
    success: '#86C079',
    warning: '#E0A83E',
    error: '#E88A7A',
    info: '#7FB8DE',

    // Streak / Badges — gold
    gold: '#E9C44C',
    goldLight: '#F2D67C',
    goldDeep: '#E9C44C',

    // Borders / Dividers
    border: '#7A6547',
    divider: '#7A6547',

    // Tab bar
    tabActive: '#EFA25E',
    tabInactive: '#A68B6B',

    // Difficulty badge chips
    badgeEasyBg: '#1E3A24',
    badgeEasyText: '#86C079',
    badgeMediumBg: '#3A2E12',
    badgeMediumText: '#E0A83E',
    badgeHardBg: '#3D1B14',
    badgeHardText: '#E88A7A',
    badgeExtremeBg: '#3D0C02',
    badgeExtremeText: '#FFD700',
  },
} as const;

export type Theme = typeof Colors.light | typeof Colors.dark;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}

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
  // Dark-mode variant: shadows are invisible on dark surfaces, so this is
  // elevation-only. `Card` selects it when `useTheme().mode === 'dark'`.
  darkShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;
