/**
 * DevLearn Design System — Direction #3:
 * Neo-Brutalist Tactile Arcade (Gumroad / Poolsuite / Figma Config / Playdate)
 * - Warm Sand/Cream Canvas (#F4F0E6) + Crisp Paper White Cards (#FFFFFF)
 * - 2px Solid Ink Borders (#111111) + Hard 4px Offset Shadows (4px 4px 0px #111111)
 * - Vibrant Sticker Accents: Acid Lime (#B8FF3B), Sunny Yellow (#FFDE59),
 *   Electric Violet (#A855F7 / #DDD6FE), Bubblegum Pink (#FF90E8), Mint (#6EE7B7)
 * - High-Contrast Dark Charcoal Code Editor Island (#141413)
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111111',
    background: '#F4F0E6',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAE3D2',
    textSecondary: '#3F3D37',
  },
  dark: {
    text: '#111111',
    background: '#F4F0E6',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAE3D2',
    textSecondary: '#3F3D37',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const StudioColors = {
  // Warm Cream / Paper Surfaces
  bg: '#F4F0E6',
  surface: '#FFFFFF',
  surfaceElevated: '#EDE7D9',
  surfaceHover: '#E4DEC9',
  surfaceGlass: 'rgba(255, 255, 255, 0.95)',

  // Deep Ink Code Editor Island (stays dark for high-contrast coding)
  codeBg: '#141413',
  codeSurface: '#1E1E1C',
  codeBorder: '#2E2E2A',
  codeText: '#F4F0E6',
  codeMuted: '#8E8B82',

  // Crisp Neo-Brutalist Ink Borders
  border: '#111111',
  borderSubtle: '#D5CFC0',
  borderStrong: '#111111',
  inkShadow: '#111111',

  // High-Contrast Ink Typography on Paper
  textPrimary: '#111111',
  textSecondary: '#38352F',
  textMuted: '#686359',
  textDim: '#8C8579',

  // Tactile Sticker & Button Accents
  lime: '#B8FF3B',
  limeDark: '#84CC16',
  yellow: '#FFDE59',
  pink: '#FF90E8',
  mint: '#6EE7B7',
  violet: '#C4B5FD',
  coral: '#FF6B6B',

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

  emerald: '#059669',
  emeraldLight: '#10B981',
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
    accent: '#111111',
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
    accent: '#111111',
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
    accent: '#111111',
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

export const HardShadow =
  Platform.select({
    web: { boxShadow: '4px 4px 0px #111111' } as any,
    default: {},
  }) || {};

export const HardShadowSm =
  Platform.select({
    web: { boxShadow: '2px 2px 0px #111111' } as any,
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
