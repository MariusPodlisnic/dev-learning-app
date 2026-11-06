/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Plus the unified DevLearn Studio design system tokens.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#FAFAFA',
    background: '#09090B',
    backgroundElement: '#121215',
    backgroundSelected: '#18181B',
    textSecondary: '#A1A1AA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const StudioColors = {
  bg: '#09090B',
  surface: '#111114',
  surfaceElevated: '#18181C',
  surfaceHover: '#1F1F25',
  surfaceGlass: 'rgba(24, 24, 28, 0.85)',
  border: '#242429',
  borderSubtle: '#1A1A1F',
  borderStrong: '#34343C',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textDim: '#52525B',

  amber: '#F59E0B',
  amberSoft: 'rgba(245, 158, 11, 0.14)',
  amberBorder: 'rgba(245, 158, 11, 0.38)',

  indigo: '#6366F1',
  indigoLight: '#818CF8',
  indigoSoft: 'rgba(99, 102, 241, 0.14)',
  indigoBorder: 'rgba(99, 102, 241, 0.38)',

  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldSoft: 'rgba(16, 185, 129, 0.12)',
  emeraldBorder: 'rgba(16, 185, 129, 0.38)',

  sky: '#38BDF8',
  skySoft: 'rgba(56, 189, 248, 0.12)',
  skyBorder: 'rgba(56, 189, 248, 0.35)',

  rose: '#EF4444',
  roseSoft: 'rgba(239, 68, 68, 0.12)',
  roseBorder: 'rgba(239, 68, 68, 0.38)',
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
  }
> = {
  python_basics: {
    key: 'python_basics',
    label: 'Foundation Core',
    shortLabel: 'Python Core',
    subtitle: 'Variables, control flow, data structures & clean syntax',
    tag: '01',
    icon: '🐍',
    accent: StudioColors.amber,
    accentSoft: StudioColors.amberSoft,
    accentBorder: StudioColors.amberBorder,
  },
  algorithms: {
    key: 'algorithms',
    label: 'Algorithmic Mastery',
    shortLabel: 'Algorithms',
    subtitle: 'Two pointers, hash maps, recursion & optimal complexity',
    tag: '02',
    icon: '⚡',
    accent: StudioColors.indigo,
    accentSoft: StudioColors.indigoSoft,
    accentBorder: StudioColors.indigoBorder,
  },
  system_design: {
    key: 'system_design',
    label: 'System Architecture',
    shortLabel: 'System Design',
    subtitle: 'Caching, load balancing, sharding & distributed scale',
    tag: '03',
    icon: '🛰️',
    accent: StudioColors.emerald,
    accentSoft: StudioColors.emeraldSoft,
    accentBorder: StudioColors.emeraldBorder,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

export const MonoFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

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
