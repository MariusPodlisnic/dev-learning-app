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

export type StudioPaletteId = 'arcade' | 'matcha' | 'amber' | 'sakura';

export const STORAGE_STUDIO_PALETTE_KEY = 'devlearn_studio_palette_v1';

export interface ModeSurfacePalette {
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
  cardDoneBorder: string;
  cardLockedBg: string;
  codeBg: string;
  codeSurface: string;
  codeBorder: string;
}

export interface StudioPaletteDefinition {
  id: StudioPaletteId;
  name: string;
  subtitle: string;
  minLevel: number;
  accent: string;
  swatches: readonly [string, string, string];
  modes: Record<ThemeMode, ModeSurfacePalette>;
}

export const STUDIO_PALETTES: readonly StudioPaletteDefinition[] = [
  {
    id: 'arcade',
    name: 'Midnight Arcade',
    subtitle: 'Classic obsidian & warm cream paper',
    minLevel: 1,
    accent: '#B8FF3B',
    swatches: ['#111217', '#1B1D24', '#B8FF3B'],
    modes: {
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
        cardDoneBg: '#C9F2D9',
        cardDoneBorder: '#059669',
        cardLockedBg: '#E6E0D0',
        codeBg: '#121214',
        codeSurface: '#1A1A1E',
        codeBorder: '#2E2E36',
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
        cardDoneBorder: '#34D399',
        cardLockedBg: '#16171D',
        codeBg: '#121214',
        codeSurface: '#1A1A1E',
        codeBorder: '#2E2E36',
      },
    },
  },
  {
    id: 'matcha',
    name: 'Matcha Cozy',
    subtitle: 'Calm Kyoto forest tea & mint glow',
    minLevel: 1,
    accent: '#6EE7B7',
    swatches: ['#101A16', '#182620', '#6EE7B7'],
    modes: {
      light: {
        bg: '#EFF6F0',
        surface: '#FAFDF9',
        surfaceElevated: '#E1EFE4',
        surfaceHover: '#D3E7D8',
        border: '#183629',
        borderSubtle: '#C2DBC8',
        inkShadow: '#10261C',
        textPrimary: '#10261C',
        textSecondary: '#2C4A3B',
        textMuted: '#547364',
        textDim: '#789687',
        cardDoneBg: '#C6F6D5',
        cardDoneBorder: '#059669',
        cardLockedBg: '#E2ECE4',
        codeBg: '#0E1713',
        codeSurface: '#15231D',
        codeBorder: '#2A4338',
      },
      dark: {
        bg: '#101A16',
        surface: '#182620',
        surfaceElevated: '#21342C',
        surfaceHover: '#2A4238',
        border: '#3F6555',
        borderSubtle: '#263D33',
        inkShadow: '#050A08',
        textPrimary: '#ECFDF5',
        textSecondary: '#B4D3C5',
        textMuted: '#81A696',
        textDim: '#5B7C6E',
        cardDoneBg: '#143126',
        cardDoneBorder: '#6EE7B7',
        cardLockedBg: '#131E1A',
        codeBg: '#0D1512',
        codeSurface: '#14211B',
        codeBorder: '#2A4439',
      },
    },
  },
  {
    id: 'amber',
    name: 'Amber CRT',
    subtitle: 'Warm espresso desk & retro gold phosphor',
    minLevel: 2,
    accent: '#FFDE59',
    swatches: ['#16120D', '#221C14', '#FFDE59'],
    modes: {
      light: {
        bg: '#FAF3E3',
        surface: '#FFFDF7',
        surfaceElevated: '#F2E5C9',
        surfaceHover: '#E9D9B6',
        border: '#2B2114',
        borderSubtle: '#DFCFAF',
        inkShadow: '#1C150C',
        textPrimary: '#1F180F',
        textSecondary: '#4A3C2A',
        textMuted: '#78664E',
        textDim: '#9A876E',
        cardDoneBg: '#D8F3DC',
        cardDoneBorder: '#059669',
        cardLockedBg: '#ECE0C6',
        codeBg: '#14100B',
        codeSurface: '#1E1810',
        codeBorder: '#433522',
      },
      dark: {
        bg: '#16120D',
        surface: '#221C14',
        surfaceElevated: '#2E261B',
        surfaceHover: '#3B3123',
        border: '#6E5A3C',
        borderSubtle: '#3C3122',
        inkShadow: '#080604',
        textPrimary: '#FEF3C7',
        textSecondary: '#D8C7A8',
        textMuted: '#A69578',
        textDim: '#786A53',
        cardDoneBg: '#1B2D21',
        cardDoneBorder: '#34D399',
        cardLockedBg: '#1A1510',
        codeBg: '#120E09',
        codeSurface: '#1C1710',
        codeBorder: '#453724',
      },
    },
  },
  {
    id: 'sakura',
    name: 'Sakura Terminal',
    subtitle: 'Lo-fi twilight plum & blossom neon',
    minLevel: 3,
    accent: '#FF90E8',
    swatches: ['#17111C', '#231A2B', '#FF90E8'],
    modes: {
      light: {
        bg: '#FAF0F6',
        surface: '#FFFBFD',
        surfaceElevated: '#F3E2ED',
        surfaceHover: '#E9D2E1',
        border: '#2D162A',
        borderSubtle: '#DFC4D7',
        inkShadow: '#1C0D1A',
        textPrimary: '#241122',
        textSecondary: '#4E304A',
        textMuted: '#7D5B78',
        textDim: '#9E7F99',
        cardDoneBg: '#D1FAE5',
        cardDoneBorder: '#059669',
        cardLockedBg: '#EFE0EA',
        codeBg: '#150F1A',
        codeSurface: '#201728',
        codeBorder: '#443255',
      },
      dark: {
        bg: '#17111C',
        surface: '#231A2B',
        surfaceElevated: '#30243B',
        surfaceHover: '#3D2E4B',
        border: '#6A4E82',
        borderSubtle: '#3A2B48',
        inkShadow: '#09060B',
        textPrimary: '#FDF2F8',
        textSecondary: '#D5C2DB',
        textMuted: '#A18BA8',
        textDim: '#76627D',
        cardDoneBg: '#172C26',
        cardDoneBorder: '#6EE7B7',
        cardLockedBg: '#1B1421',
        codeBg: '#130D17',
        codeSurface: '#1D1524',
        codeBorder: '#433154',
      },
    },
  },
] as const;

export function isValidStudioPaletteId(value: unknown): value is StudioPaletteId {
  return (
    value === 'arcade' ||
    value === 'matcha' ||
    value === 'amber' ||
    value === 'sakura'
  );
}

export function getStudioPaletteMeta(
  paletteId: StudioPaletteId = 'arcade',
): StudioPaletteDefinition {
  return (
    STUDIO_PALETTES.find((p) => p.id === paletteId) || STUDIO_PALETTES[0]
  );
}

export function isStudioPaletteUnlocked(
  paletteId: StudioPaletteId,
  userLevel: number,
  isPremium: boolean = false,
): boolean {
  if (isPremium) return true;
  const meta = getStudioPaletteMeta(paletteId);
  return userLevel >= meta.minLevel;
}

export const ThemePalettes: Record<ThemeMode, ModeSurfacePalette> =
  STUDIO_PALETTES[0].modes;

export function applyColorTheme(
  mode: ThemeMode,
  paletteId: StudioPaletteId = 'arcade',
) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const pal = getStudioPaletteMeta(paletteId).modes[mode];
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
    root.style.setProperty('--dl-card-done-border', pal.cardDoneBorder);
    root.style.setProperty('--dl-card-locked-bg', pal.cardLockedBg);
    root.style.setProperty('--dl-code-bg', pal.codeBg);
    root.style.setProperty('--dl-code-surface', pal.codeSurface);
    root.style.setProperty('--dl-code-border', pal.codeBorder);
  }
}

const isWeb = Platform.OS === 'web';

const SHARED_ACCENT_COLORS = {
  // Constant Jet Black Ink (for text/borders on bright neon stickers & buttons)
  ink: '#111111',

  // Deep Ink Code Editor Island (stays dark in both themes for high-contrast coding)
  codeBg: '#121214',
  codeSurface: '#1A1A1E',
  codeBorder: '#2E2E36',
  codeText: '#F4F0E6',
  codeMuted: '#8E8B82',

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

export type StudioThemeColors = {
  bg: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;
  surfaceGlass: string;
  cardDoneBg: string;
  cardDoneBorder: string;
  cardLockedBg: string;
  border: string;
  borderSubtle: string;
  borderStrong: string;
  inkShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  codeBg: string;
  codeSurface: string;
  codeBorder: string;
} & Omit<typeof SHARED_ACCENT_COLORS, 'codeBg' | 'codeSurface' | 'codeBorder'>;

export function getStudioColors(
  mode: ThemeMode,
  paletteId: StudioPaletteId = 'arcade',
): StudioThemeColors {
  const pal = getStudioPaletteMeta(paletteId).modes[mode];
  return {
    ...SHARED_ACCENT_COLORS,
    bg: pal.bg,
    surface: pal.surface,
    surfaceElevated: pal.surfaceElevated,
    surfaceHover: pal.surfaceHover,
    surfaceGlass:
      mode === 'dark' ? 'rgba(27, 29, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    cardDoneBg: pal.cardDoneBg,
    cardDoneBorder: pal.cardDoneBorder,
    cardLockedBg: pal.cardLockedBg,
    border: pal.border,
    borderSubtle: pal.borderSubtle,
    borderStrong: pal.border,
    inkShadow: pal.inkShadow,
    textPrimary: pal.textPrimary,
    textSecondary: pal.textSecondary,
    textMuted: pal.textMuted,
    textDim: pal.textDim,
    codeBg: pal.codeBg,
    codeSurface: pal.codeSurface,
    codeBorder: pal.codeBorder,
  };
}

export const StudioColors: StudioThemeColors = {
  ...SHARED_ACCENT_COLORS,

  // Dynamic Theme Surfaces (CSS-var driven on web, Midnight Dark baseline statically)
  bg: isWeb ? 'var(--dl-bg, #111217)' : '#111217',
  surface: isWeb ? 'var(--dl-surface, #1B1D24)' : '#1B1D24',
  surfaceElevated: isWeb ? 'var(--dl-surface-elevated, #252833)' : '#252833',
  surfaceHover: isWeb ? 'var(--dl-surface-hover, #2E3240)' : '#2E3240',
  surfaceGlass: 'rgba(27, 29, 36, 0.95)',
  cardDoneBg: isWeb ? 'var(--dl-card-done-bg, #162621)' : '#162621',
  cardDoneBorder: isWeb ? 'var(--dl-card-done-border, #34D399)' : '#34D399',
  cardLockedBg: isWeb ? 'var(--dl-card-locked-bg, #16171D)' : '#16171D',

  // Crisp Neo-Brutalist Borders
  border: isWeb ? 'var(--dl-border, #484D62)' : '#484D62',
  borderSubtle: isWeb ? 'var(--dl-border-subtle, #2C2F3E)' : '#2C2F3E',
  borderStrong: isWeb ? 'var(--dl-border, #484D62)' : '#484D62',
  inkShadow: isWeb ? 'var(--dl-ink-shadow, #000000)' : '#000000',

  // High-Contrast Typography on Surfaces
  textPrimary: isWeb ? 'var(--dl-text-primary, #F4F0E6)' : '#F4F0E6',
  textSecondary: isWeb ? 'var(--dl-text-secondary, #B9B5AC)' : '#B9B5AC',
  textMuted: isWeb ? 'var(--dl-text-muted, #8B877E)' : '#8B877E',
  textDim: isWeb ? 'var(--dl-text-dim, #68655E)' : '#68655E',

  // Deep Ink Code Editor Island (adapts cleanly to curated Studio Palettes)
  codeBg: isWeb ? 'var(--dl-code-bg, #121214)' : '#121214',
  codeSurface: isWeb ? 'var(--dl-code-surface, #1A1A1E)' : '#1A1A1E',
  codeBorder: isWeb ? 'var(--dl-code-border, #2E2E36)' : '#2E2E36',
};

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
    web: { boxShadow: '5px 5px 0px var(--dl-ink-shadow, #000000)' } as any,
    default: {},
  }) || {};

export const HardShadow =
  Platform.select({
    web: { boxShadow: '4px 4px 0px var(--dl-ink-shadow, #000000)' } as any,
    default: {},
  }) || {};

export const HardShadowSm =
  Platform.select({
    web: { boxShadow: '2px 2px 0px var(--dl-ink-shadow, #000000)' } as any,
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
