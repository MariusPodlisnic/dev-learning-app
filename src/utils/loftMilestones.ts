import { TRACK_CHAPTERS, isLessonInChapter } from "../constants/certificates";
import type { LoftThemeColors } from "./loftGeometry";

export type LoftSkyMode = "auto" | "dawn" | "daylight" | "sunset" | "midnight";
export type LoftResolvedSkyPhase = Exclude<LoftSkyMode, "auto">;

export const LOFT_SKY_CYCLE_ORDER: readonly LoftSkyMode[] = [
  "auto",
  "dawn",
  "daylight",
  "sunset",
  "midnight",
] as const;

export interface LoftSkyVisuals {
  phase: LoftResolvedSkyPhase;
  badgeLabel: string;
  skyTop: string;
  skyMid: string;
  skyGlow: string;
  starOpacity: number;
  showMoon: boolean;
  sunMode: "none" | "dawn" | "day" | "sunset";
  sunColor: string;
  windowWashColor: string;
  cityLightAlpha: number;
}

export interface LoftMilestoneTrophies {
  /** Unlocked on clearing Chapter I of any track (or >= 5 solved lessons) */
  serpensPoster: boolean;
  /** Unlocked at a 5-day coding streak */
  fairyLights: boolean;
  /** Unlocked on Blitz S-Rank (>= 12 hits), >= 5 Bug Hunts, or >= 3 Mini-Builds */
  arcadeTrophy: boolean;
  /** Unlocked on clearing 100% of any full track (or >= 25 solved lessons) */
  holoPrism: boolean;
  unlockedCount: number;
  totalCount: 4;
  nextHint: string;
}

export interface ComputeLoftMilestonesInput {
  lessons: readonly {
    id: string;
    track: string;
    lesson_order: number;
    is_recap?: boolean;
    recap_chapter?: number;
  }[];
  completedLessons: Record<string, boolean>;
  streakCount: number;
  blitzBestHits: number;
  solvedBugCount: number;
  completedMiniBuildsCount?: number;
}

export function resolveLoftSkyPhase(
  mode: LoftSkyMode,
  localHour: number,
): LoftResolvedSkyPhase {
  if (mode !== "auto") return mode;
  const h = ((Math.floor(localHour) % 24) + 24) % 24;
  if (h >= 5 && h < 11) return "dawn";
  if (h >= 11 && h < 17) return "daylight";
  if (h >= 17 && h < 21) return "sunset";
  return "midnight";
}

export function getNextLoftSkyMode(current: LoftSkyMode): LoftSkyMode {
  const idx = LOFT_SKY_CYCLE_ORDER.indexOf(current);
  return LOFT_SKY_CYCLE_ORDER[(idx + 1) % LOFT_SKY_CYCLE_ORDER.length];
}

export function getLoftSkyVisuals(
  phase: LoftResolvedSkyPhase,
  pal: LoftThemeColors,
): LoftSkyVisuals {
  switch (phase) {
    case "dawn":
      return {
        phase: "dawn",
        badgeLabel: "COZY DAWN",
        skyTop: "#1C1635",
        skyMid: "#5B3456",
        skyGlow: "#FDBA74",
        starOpacity: 0.35,
        showMoon: false,
        sunMode: "dawn",
        sunColor: "#FED7AA",
        windowWashColor: "#FDBA74",
        cityLightAlpha: 0.45,
      };
    case "daylight":
      return {
        phase: "daylight",
        badgeLabel: "CLEAR DAY",
        skyTop: "#1B3B6F",
        skyMid: "#3670A8",
        skyGlow: "#BAE6FD",
        starOpacity: 0,
        showMoon: false,
        sunMode: "day",
        sunColor: "#FEF08A",
        windowWashColor: "#BAE6FD",
        cityLightAlpha: 0.14,
      };
    case "sunset":
      return {
        phase: "sunset",
        badgeLabel: "GOLDEN HOUR",
        skyTop: "#24123B",
        skyMid: "#7E2B52",
        skyGlow: "#FB923C",
        starOpacity: 0.25,
        showMoon: false,
        sunMode: "sunset",
        sunColor: "#FDE047",
        windowWashColor: "#FB923C",
        cityLightAlpha: 0.68,
      };
    case "midnight":
    default:
      return {
        phase: "midnight",
        badgeLabel: "MIDNIGHT",
        skyTop: pal.skyTop,
        skyMid: pal.skyMid,
        skyGlow: pal.skyGlow,
        starOpacity: 1,
        showMoon: true,
        sunMode: "none",
        sunColor: "#FFF8DC",
        windowWashColor: pal.skyGlow,
        cityLightAlpha: 1,
      };
  }
}

export function computeLoftMilestoneTrophies(
  input: ComputeLoftMilestonesInput,
): LoftMilestoneTrophies {
  const {
    lessons,
    completedLessons,
    streakCount,
    blitzBestHits,
    solvedBugCount,
    completedMiniBuildsCount = 0,
  } = input;

  const totalSolved = lessons.filter((l) => completedLessons[l.id]).length;

  // 1. Serpens Star Chart Poster: Chapter I cleared on any track (or >= 5 lessons solved)
  let anyChapterOneCleared = totalSolved >= 5;
  if (!anyChapterOneCleared && lessons.length > 0) {
    for (const [trackKey, chapters] of Object.entries(TRACK_CHAPTERS)) {
      const ch1 = chapters[0];
      if (!ch1) continue;
      const ch1Lessons = lessons.filter(
        (l) => l.track === trackKey && isLessonInChapter(l, ch1),
      );
      if (
        ch1Lessons.length > 0 &&
        ch1Lessons.every((l) => Boolean(completedLessons[l.id]))
      ) {
        anyChapterOneCleared = true;
        break;
      }
    }
  }

  // 2. Warm Fairy String-Lights: 5-day streak
  const fairyLights = streakCount >= 5;

  // 3. Golden Arcade Trophy Cup: Blitz S-Rank (12+ hits), 5+ Bug Hunts, or 3+ Mini-Builds
  const arcadeTrophy =
    blitzBestHits >= 12 || solvedBugCount >= 5 || completedMiniBuildsCount >= 3;

  // 4. Desk Holographic Prism: 100% of any track cleared (or >= 25 lessons solved)
  let anyTrackCleared = totalSolved >= 25;
  if (!anyTrackCleared && lessons.length > 0) {
    for (const trackKey of Object.keys(TRACK_CHAPTERS)) {
      const tLessons = lessons.filter((l) => l.track === trackKey);
      if (
        tLessons.length >= 5 &&
        tLessons.every((l) => Boolean(completedLessons[l.id]))
      ) {
        anyTrackCleared = true;
        break;
      }
    }
  }

  const flags = [
    anyChapterOneCleared,
    fairyLights,
    arcadeTrophy,
    anyTrackCleared,
  ];
  const unlockedCount = flags.filter(Boolean).length;

  const nextHint = !anyChapterOneCleared
    ? "NEXT KEEPSAKE: Clear Chapter I for Serpens Wall Chart"
    : !fairyLights
      ? `NEXT KEEPSAKE: Reach 5d Streak (${streakCount}/5) for Fairy Lights`
      : !arcadeTrophy
        ? "NEXT KEEPSAKE: Hit Arcade S-Rank or 5 Bug Hunts for Gold Cup"
        : !anyTrackCleared
          ? "NEXT KEEPSAKE: Master a Track for Desk Holo-Prism"
          : "ALL 4 LOFT KEEPSAKES UNLOCKED ★";

  return {
    serpensPoster: anyChapterOneCleared,
    fairyLights,
    arcadeTrophy,
    holoPrism: anyTrackCleared,
    unlockedCount,
    totalCount: 4,
    nextHint,
  };
}
