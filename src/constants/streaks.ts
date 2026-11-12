import { buildChallengeUrl } from "../utils/shareUtils";
import { StudioColors } from "./theme";

export interface StreakMilestone {
  days: number;
  title: string;
  badge: string;
  bonusXp: number;
  tagline: string;
  accent: string;
  icon: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    title: "Spark Ignite",
    badge: "3-DAY STREAK",
    bonusXp: 30,
    tagline:
      "3 consecutive days of clean code. Your developer habit is forming!",
    accent: StudioColors.yellow,
    icon: "🔥",
  },
  {
    days: 7,
    title: "Arcade Legend",
    badge: "7-DAY STREAK",
    bonusXp: 75,
    tagline: "1 full week of unbroken momentum. Top 10% consistency!",
    accent: StudioColors.lime,
    icon: "⚡",
  },
  {
    days: 14,
    title: "Ironclad Dev",
    badge: "14-DAY STREAK",
    bonusXp: 150,
    tagline: "2 weeks straight! Writing and debugging code every single day.",
    accent: StudioColors.mint,
    icon: "⚔️",
  },
  {
    days: 30,
    title: "Obsidian Master",
    badge: "30-DAY STREAK",
    bonusXp: 300,
    tagline: "1 full month of unbroken arcade mastery. True software discipline.",
    accent: StudioColors.violet,
    icon: "👑",
  },
];

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateKey(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateKey(yesterday);
}

export function parseDateKey(key: string): Date | null {
  const parts = key.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function getDateDiffInDays(fromKey: string, toKey: string): number {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (!from || !to) return 999;
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((utcTo - utcFrom) / (1000 * 60 * 60 * 24));
}

export function getHoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffHours = (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
  return Math.max(1, Math.round(diffHours));
}

export interface StreakStatus {
  isActiveToday: boolean;
  isAtRisk: boolean;
  isBroken: boolean;
  hoursRemainingToday: number;
  currentStreak: number;
  nextMilestone: StreakMilestone | null;
}

export function getStreakStatus(params: {
  streakCount: number;
  lastActiveDate: string | null;
  todayKey?: string;
}): StreakStatus {
  const todayKey = params.todayKey || getTodayDateKey();
  const lastDate = params.lastActiveDate;
  const currentStreak = params.streakCount;
  const hoursRemainingToday = getHoursUntilMidnight();

  if (!lastDate || currentStreak === 0) {
    return {
      isActiveToday: false,
      isAtRisk: false,
      isBroken: false,
      hoursRemainingToday,
      currentStreak: 0,
      nextMilestone: STREAK_MILESTONES[0],
    };
  }

  const diffDays = getDateDiffInDays(lastDate, todayKey);
  const isActiveToday = diffDays === 0;
  const isAtRisk = diffDays === 1;
  const isBroken = diffDays > 1;

  const nextMilestone =
    STREAK_MILESTONES.find((m) => m.days > currentStreak) || null;

  return {
    isActiveToday,
    isAtRisk,
    isBroken,
    hoursRemainingToday,
    currentStreak,
    nextMilestone,
  };
}

export interface StreakUpdateResult {
  newStreak: number;
  newLastActiveDate: string;
  streakMaintained: boolean;
  streakExtended: boolean;
  streakBroken: boolean;
  shieldUsed: boolean;
  remainingShields: number;
  unlockedMilestone: StreakMilestone | null;
}

export function computeStreakUpdate(params: {
  currentStreak: number;
  lastActiveDate: string | null;
  claimedMilestones: Record<number, boolean>;
  todayKey?: string;
  streakShields?: number;
}): StreakUpdateResult {
  const todayKey = params.todayKey || getTodayDateKey();
  const currentStreak = Math.max(0, params.currentStreak);
  const shields = params.streakShields ?? 1;

  if (!params.lastActiveDate) {
    const newStreak = 1;
    const milestone =
      STREAK_MILESTONES.find(
        (m) => m.days === newStreak && !params.claimedMilestones[m.days],
      ) || null;
    return {
      newStreak,
      newLastActiveDate: todayKey,
      streakMaintained: false,
      streakExtended: true,
      streakBroken: false,
      shieldUsed: false,
      remainingShields: shields,
      unlockedMilestone: milestone,
    };
  }

  const diffDays = getDateDiffInDays(params.lastActiveDate, todayKey);

  if (diffDays === 0) {
    // Already active today! Streak is maintained.
    return {
      newStreak: currentStreak,
      newLastActiveDate: todayKey,
      streakMaintained: true,
      streakExtended: false,
      streakBroken: false,
      shieldUsed: false,
      remainingShields: shields,
      unlockedMilestone: null,
    };
  }

  if (diffDays === 1) {
    // Consecutive day! Streak extends by +1.
    const newStreak = currentStreak + 1;
    const milestone =
      STREAK_MILESTONES.find(
        (m) => m.days === newStreak && !params.claimedMilestones[m.days],
      ) || null;
    return {
      newStreak,
      newLastActiveDate: todayKey,
      streakMaintained: false,
      streakExtended: true,
      streakBroken: false,
      shieldUsed: false,
      remainingShields: shields,
      unlockedMilestone: milestone,
    };
  }

  // diffDays > 1 (missed at least 1 day)
  if (diffDays === 2 && shields > 0) {
    // Streak shield absorbs the single missed day!
    const newStreak = currentStreak + 1;
    const milestone =
      STREAK_MILESTONES.find(
        (m) => m.days === newStreak && !params.claimedMilestones[m.days],
      ) || null;
    return {
      newStreak,
      newLastActiveDate: todayKey,
      streakMaintained: false,
      streakExtended: true,
      streakBroken: false,
      shieldUsed: true,
      remainingShields: shields - 1,
      unlockedMilestone: milestone,
    };
  }

  // Broken streak -> resets to 1 today
  const newStreak = 1;
  const milestone =
    STREAK_MILESTONES.find(
      (m) => m.days === newStreak && !params.claimedMilestones[m.days],
    ) || null;
  return {
    newStreak,
    newLastActiveDate: todayKey,
    streakMaintained: false,
    streakExtended: false,
    streakBroken: true,
    shieldUsed: false,
    remainingShields: shields,
    unlockedMilestone: milestone,
  };
}

export function buildStreakShareText(options: {
  streakCount: number;
  milestone?: StreakMilestone;
  xpPoints: number;
  rankTitle: string;
}): string {
  const url = buildChallengeUrl({ ref: `streak_${options.streakCount}` });
  const milestoneBadge = options.milestone
    ? `🏆 ${options.milestone.badge}: ${options.milestone.title}`
    : `🔥 ${options.streakCount}-Day Coding Streak!`;

  return [
    `🔥 DevLearn Arcade — ${options.streakCount}-Day Streak!`,
    milestoneBadge,
    `⚡ ${options.xpPoints} XP · 🏅 ${options.rankTitle}`,
    `Writing real code every single day without stopping.`,
    `Beat my streak 👉 ${url}`,
  ].join("\n");
}
