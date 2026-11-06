/**
 * DevLearn Design System — Direction #3:
 * Neo-Brutalist Tactile Arcade (Gumroad / Poolsuite / Figma Config / Playdate)
 * Supports both:
 *  - LIGHT MODE ("Warm Cream Arcade"): #F4F0E6 canvas, #FFFFFF paper cards, #111111 ink
 *  - DARK MODE ("Midnight Obsidian Arcade"): #111217 canvas, #1B1D24 cards, #F4F0E6 text
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111111',
    background: '#F4F0E6',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAE3D2',
    textSecondary: '#38352F',
  },
  dark: {
    text: '#F4F0E6',
    background: '#111217',
    backgroundElement: '#1B1D24',
    backgroundSelected: '#262936',
    textSecondary: '#B8B5AC',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export type ThemeMode = 'light' | 'dark';

export const ThemePalettes: Record<
  ThemeMode,
  {
    bg: string;
    surface: string;
    surfaceElevated: string;
    surfaceHover: string;
    border: string;
    borderSubtle: string;
    inkShadow: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textDim: string;
    cardDoneBg: string;
    cardLockedBg: string;
  }
> = {
  light: {
    bg: '#F4F0E6',
    surface: '#FFFFFF',
    surfaceElevated: '#EDE7D9',
    surfaceHover: '#E4DEC9',
    border: '#111111',
    borderSubtle: '#D5CFC0',
    inkShadow: '#111111',
    textPrimary: '#111111',
    textSecondary: '#38352F',
    textMuted: '#686359',
    textDim: '#8C8579',
    cardDoneBg: '#F4FFF8',
    cardLockedBg: '#E6E0D0',
  },
  dark: {
    bg: '#111217',
    surface: '#1B1D24',
    surfaceElevated: '#252833',
    surfaceHover: '#2E3240',
    border: '#484D62',
    borderSubtle: '#2C2F3E',
    inkShadow: '#000000',
    textPrimary: '#F4F0E6',
    textSecondary: '#B9B5AC',
    textMuted: '#8B877E',
    textDim: '#68655E',
    cardDoneBg: '#162621',
    cardLockedBg: '#16171D',
  },
};

export function applyColorTheme(mode: ThemeMode) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const pal = ThemePalettes[mode];
    const root = document.documentElement;
    root.style.setProperty('--dl-bg', pal.bg);
    root.style.setProperty('--dl-surface', pal.surface);
    root.style.setProperty('--dl-surface-elevated', pal.surfaceElevated);
    root.style.setProperty('--dl-surface-hover', pal.surfaceHover);
    root.style.setProperty('--dl-border', pal.border);
    root.style.setProperty('--dl-border-subtle', pal.borderSubtle);
    root.style.setProperty('--dl-ink-shadow', pal.inkShadow);
    root.style.setProperty('--dl-text-primary', pal.textPrimary);
    root.style.setProperty('--dl-text-secondary', pal.textSecondary);
    root.style.setProperty('--dl-text-muted', pal.textMuted);
    root.style.setProperty('--dl-text-dim', pal.textDim);
    root.style.setProperty('--dl-card-done-bg', pal.cardDoneBg);
    root.style.setProperty('--dl-card-locked-bg', pal.cardLockedBg);
  }
}

const isWeb = Platform.OS === 'web';

export const StudioColors = {
  // Dynamic Theme Surfaces (automatically switch between Warm Cream & Midnight Obsidian)
  bg: isWeb ? 'var(--dl-bg, #F4F0E6)' : '#F4F0E6',
  surface: isWeb ? 'var(--dl-surface, #FFFFFF)' : '#FFFFFF',
  surfaceElevated: isWeb ? 'var(--dl-surface-elevated, #EDE7D9)' : '#EDE7D9',
  surfaceHover: isWeb ? 'var(--dl-surface-hover, #E4DEC9)' : '#E4DEC9',
  surfaceGlass: 'rgba(255, 255, 255, 0.95)',
  cardDoneBg: isWeb ? 'var(--dl-card-done-bg, #F4FFF8)' : '#F4FFF8',
  cardLockedBg: isWeb ? 'var(--dl-card-locked-bg, #E6E0D0)' : '#E6E0D0',

  // Constant Jet Black Ink (for text/borders on bright neon stickers & buttons)
  ink: '#111111',

  // Deep Ink Code Editor Island (stays dark in both themes for high-contrast coding)
  codeBg: '#121214',
  codeSurface: '#1A1A1E',
  codeBorder: '#2E2E36',
  codeText: '#F4F0E6',
  codeMuted: '#8E8B82',

  // Crisp Neo-Brutalist Borders
  border: isWeb ? 'var(--dl-border, #111111)' : '#111111',
  borderSubtle: isWeb ? 'var(--dl-border-subtle, #D5CFC0)' : '#D5CFC0',
  borderStrong: isWeb ? 'var(--dl-border, #111111)' : '#111111',
  inkShadow: isWeb ? 'var(--dl-ink-shadow, #111111)' : '#111111',

  // High-Contrast Typography on Surfaces
  textPrimary: isWeb ? 'var(--dl-text-primary, #111111)' : '#111111',
  textSecondary: isWeb ? 'var(--dl-text-secondary, #38352F)' : '#38352F',
  textMuted: isWeb ? 'var(--dl-text-muted, #686359)' : '#686359',
  textDim: isWeb ? 'var(--dl-text-dim, #8C8579)' : '#8C8579',

  // Tactile Sticker & Button Accents
  lime: '#B8FF3B',
  limeDark: '#84CC16',
  yellow: '#FFDE59',
  pink: '#FF90E8',
  mint: '#6EE7B7',
  violet: '#C4B5FD',
  coral: '#FF6B6B',
  orange: '#FF7A45',

  // Mapped Semantic Tokens
  amber: '#D97706',
  amberLight: '#F59E0B',
  amberSoft: '#FEF3C7',
  amberBorder: '#111111',
  ochre: '#FFDE59',
  gold: '#FFDE59',

  indigo: '#6D28D9',
  indigoLight: '#7C3AED',
  indigoSoft: '#EDE9FE',
  indigoBorder: '#111111',

  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldSoft: '#D1FAE5',
  emeraldBorder: '#111111',

  sky: '#0284C7',
  skySoft: '#E0F2FE',
  skyBorder: '#111111',

  rose: '#E11D48',
  roseLight: '#F43F5E',
  roseSoft: '#FFE4E6',
  roseBorder: '#111111',
} as const;

export const TrackThemes: Record<
  string,
  {
    key: string;
    label: string;
    shortLabel: string;
    subtitle: string;
    tag: string;
    icon: string;
    isPro: boolean;
    accent: string;
    accentSoft: string;
    accentBorder: string;
    stickerBg: string;
  }
> = {
  python_basics: {
    key: 'python_basics',
    label: 'Python Foundations',
    shortLabel: 'Python Core',
    subtitle: 'Variables, control flow, data structures & clean syntax',
    tag: '01',
    icon: 'PY',
    isPro: false,
    accent: '#FFDE59',
    accentSoft: '#FFDE59',
    accentBorder: '#111111',
    stickerBg: '#FFDE59',
  },
  algorithms: {
    key: 'algorithms',
    label: 'Algorithmic Mastery',
    shortLabel: 'Algorithms',
    subtitle: 'Two pointers, hash maps, sliding windows & optimal runtime',
    tag: '02',
    icon: 'ALG',
    isPro: true,
    accent: '#C4B5FD',
    accentSoft: '#C4B5FD',
    accentBorder: '#111111',
    stickerBg: '#C4B5FD',
  },
  system_design: {
    key: 'system_design',
    label: 'System Architecture',
    shortLabel: 'System Design',
    subtitle: 'Caching, load balancing, sharding & distributed consensus',
    tag: '03',
    icon: 'SYS',
    isPro: true,
    accent: '#6EE7B7',
    accentSoft: '#6EE7B7',
    accentBorder: '#111111',
    stickerBg: '#6EE7B7',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const MonoFont =
  Platform.select({
    ios: 'Menlo',
    web: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
    default: 'monospace',
  }) || 'monospace';

export const SerifFont =
  Platform.select({
    ios: 'System',
    web: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    default: 'sans-serif',
  }) || 'sans-serif';

export const HardShadowHero =
  Platform.select({
    web: { boxShadow: '5px 5px 0px var(--dl-ink-shadow, #111111)' } as any,
    default: {},
  }) || {};

export const HardShadow =
  Platform.select({
    web: { boxShadow: '4px 4px 0px var(--dl-ink-shadow, #111111)' } as any,
    default: {},
  }) || {};

export const HardShadowSm =
  Platform.select({
    web: { boxShadow: '2px 2px 0px var(--dl-ink-shadow, #111111)' } as any,
    default: {},
  }) || {};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
