import type { ViewMode } from "../types/lesson";

export const COMPACT_HEADER_BREAKPOINT = 720;
export const COMPACT_STUDIO_BREAKPOINT = 920;

export type MobileNavTarget =
  | {
      key: Exclude<ViewMode, "achievements">;
      kind: "mode";
      icon: string;
      shortLabel: string;
      accessibilityLabel: string;
    }
  | {
      key: "explore";
      kind: "route";
      href: "/explore";
      icon: string;
      shortLabel: string;
      accessibilityLabel: string;
    };

export const MOBILE_NAV_ITEMS: readonly MobileNavTarget[] = [
  {
    key: "roadmap",
    kind: "mode",
    icon: "🎯",
    shortLabel: "Map",
    accessibilityLabel: "Skill Map",
  },
  {
    key: "studio",
    kind: "mode",
    icon: "⌨️",
    shortLabel: "Studio",
    accessibilityLabel: "Code Studio",
  },
  {
    key: "bughunt",
    kind: "mode",
    icon: "🪲",
    shortLabel: "Bugs",
    accessibilityLabel: "Bug Hunt Arena",
  },
  {
    key: "blitz",
    kind: "mode",
    icon: "⚡",
    shortLabel: "Blitz",
    accessibilityLabel: "Speed Blitz",
  },
  {
    key: "algolab",
    kind: "mode",
    icon: "🔬",
    shortLabel: "Lab",
    accessibilityLabel: "Algorithm Visual Lab",
  },
  {
    key: "explore",
    kind: "route",
    href: "/explore",
    icon: "📖",
    shortLabel: "Docs",
    accessibilityLabel: "Curriculum Showcase",
  },
];

export function isCompactHeaderWidth(viewportWidth: number): boolean {
  return viewportWidth > 0 && viewportWidth < COMPACT_HEADER_BREAKPOINT;
}

export function isCompactStudioWidth(viewportWidth: number): boolean {
  return viewportWidth > 0 && viewportWidth < COMPACT_STUDIO_BREAKPOINT;
}

export function shouldShowBottomThumbNav(params: {
  isCompactHeader: boolean;
  isKeyboardVisible: boolean;
}): boolean {
  return params.isCompactHeader && !params.isKeyboardVisible;
}

export function getKeyboardAvoidingBehavior(
  platformOs: string,
): "padding" | "height" | undefined {
  if (platformOs === "ios") return "padding";
  if (platformOs === "android") return "height";
  return undefined;
}
