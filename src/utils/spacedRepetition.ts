import { isLessonLockedForUser } from "../types/lesson";

export type ReviewSignal = "clean" | "peeked" | "scaffolded" | "retries";

export interface ReviewScheduleEntry {
  lessonId: string;
  intervalDays: number;
  reps: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  weakSignalCount: number;
  reason: "scheduled" | "peeked" | "scaffolded" | "retries";
}

export interface DueReviewItem<T extends { id: string } = { id: string }> {
  lesson: T;
  entry: ReviewScheduleEntry;
  overdueDays: number;
  priorityScore: number;
  isImplicitPeek: boolean;
}

export interface ReviewRetentionSummary {
  dueNowCount: number;
  scheduledCount: number;
  masteredCount: number;
  weakCount: number;
  nextUpcomingDays: number | null;
}

export const REVIEW_INTERVAL_LADDER = [1, 3, 7, 14, 30] as const;
export const REVIEW_BONUS_XP = 15;

export function getIsoDateKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const parsed = Date.parse(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(parsed)) {
    return getIsoDateKey(new Date(Date.now() + days * 86_400_000));
  }
  const shifted = new Date(parsed + days * 86_400_000);
  return getIsoDateKey(shifted);
}

export function diffDaysIso(fromIsoDate: string, toIsoDate: string): number {
  const fromMs = Date.parse(`${fromIsoDate.slice(0, 10)}T00:00:00Z`);
  const toMs = Date.parse(`${toIsoDate.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  return Math.round((toMs - fromMs) / 86_400_000);
}

function getNextLadderInterval(currentDays: number): number {
  for (const step of REVIEW_INTERVAL_LADDER) {
    if (step > currentDays) return step;
  }
  return REVIEW_INTERVAL_LADDER[REVIEW_INTERVAL_LADDER.length - 1];
}

export function updateReviewScheduleOnSolve(params: {
  currentSchedule: Record<string, ReviewScheduleEntry>;
  lessonId: string;
  signal: ReviewSignal;
  now?: Date;
}): {
  nextSchedule: Record<string, ReviewScheduleEntry>;
  entry: ReviewScheduleEntry;
  wasDueReview: boolean;
} {
  const { currentSchedule, lessonId, signal, now = new Date() } = params;
  const todayKey = getIsoDateKey(now);
  const nowIso = now.toISOString();
  const prev = currentSchedule[lessonId];
  const wasDueReview = Boolean(prev && prev.nextReviewAt.slice(0, 10) <= todayKey);

  let intervalDays: number;
  let reps: number;
  let weakSignalCount = prev?.weakSignalCount || 0;
  let reason: ReviewScheduleEntry["reason"];

  if (signal !== "clean") {
    // Any reliance on solution peek, scaffold fill-ins, or multiple failed runs pulls review to 1 day
    intervalDays = 1;
    reps = prev ? Math.max(1, prev.reps) : 1;
    weakSignalCount += 1;
    reason = signal;
  } else if (prev) {
    intervalDays = wasDueReview
      ? getNextLadderInterval(prev.intervalDays)
      : Math.max(3, prev.intervalDays);
    reps = prev.reps + 1;
    reason = "scheduled";
  } else {
    intervalDays = 3;
    reps = 1;
    reason = "scheduled";
  }

  const entry: ReviewScheduleEntry = {
    lessonId,
    intervalDays,
    reps,
    lastReviewedAt: nowIso,
    nextReviewAt: addDaysToIsoDate(todayKey, intervalDays),
    weakSignalCount,
    reason,
  };

  return {
    nextSchedule: {
      ...currentSchedule,
      [lessonId]: entry,
    },
    entry,
    wasDueReview,
  };
}

export function buildDueReviewQueue<
  T extends {
    id: string;
    track: string;
    lesson_order: number;
    is_free: boolean;
  },
>(params: {
  lessons: T[];
  completedLessons: Record<string, boolean>;
  peekedSolutions?: Record<string, boolean>;
  reviewSchedule?: Record<string, ReviewScheduleEntry>;
  isPremium: boolean;
  trackFilter?: string;
  today?: Date;
}): DueReviewItem<T>[] {
  const {
    lessons,
    completedLessons,
    peekedSolutions = {},
    reviewSchedule = {},
    isPremium,
    trackFilter,
    today = new Date(),
  } = params;

  const todayKey = getIsoDateKey(today);
  const items: DueReviewItem<T>[] = [];

  for (const lesson of lessons) {
    if (!completedLessons[lesson.id]) continue;
    if (trackFilter && lesson.track !== trackFilter) continue;
    if (isLessonLockedForUser(lesson, isPremium)) continue;

    const existing = reviewSchedule[lesson.id];
    const hasPeeked = Boolean(peekedSolutions[lesson.id]);

    if (existing) {
      const dueKey = existing.nextReviewAt.slice(0, 10);
      if (dueKey <= todayKey) {
        const overdueDays = Math.max(0, diffDaysIso(dueKey, todayKey));
        const reasonWeight =
          existing.reason === "peeked" || hasPeeked
            ? 30
            : existing.reason === "retries"
              ? 20
              : existing.reason === "scaffolded"
                ? 15
                : 5;
        items.push({
          lesson,
          entry: existing,
          overdueDays,
          priorityScore:
            reasonWeight + existing.weakSignalCount * 10 + overdueDays * 4,
          isImplicitPeek: false,
        });
      }
    } else if (hasPeeked) {
      // Backfill legacy peeked clears so learners immediately revisit modules where they peeked the solution
      const syntheticEntry: ReviewScheduleEntry = {
        lessonId: lesson.id,
        intervalDays: 1,
        reps: 1,
        lastReviewedAt: `${todayKey}T00:00:00.000Z`,
        nextReviewAt: todayKey,
        weakSignalCount: 1,
        reason: "peeked",
      };
      items.push({
        lesson,
        entry: syntheticEntry,
        overdueDays: 0,
        priorityScore: 40,
        isImplicitPeek: true,
      });
    }
  }

  return items.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return a.lesson.lesson_order - b.lesson.lesson_order;
  });
}

export function getReviewRetentionSummary<
  T extends {
    id: string;
    track: string;
    lesson_order: number;
    is_free: boolean;
  },
>(params: {
  lessons: T[];
  completedLessons: Record<string, boolean>;
  peekedSolutions?: Record<string, boolean>;
  reviewSchedule?: Record<string, ReviewScheduleEntry>;
  isPremium: boolean;
  trackFilter?: string;
  today?: Date;
}): ReviewRetentionSummary {
  const {
    lessons,
    completedLessons,
    peekedSolutions = {},
    reviewSchedule = {},
    isPremium,
    trackFilter,
    today = new Date(),
  } = params;

  const todayKey = getIsoDateKey(today);
  const dueQueue = buildDueReviewQueue({
    lessons,
    completedLessons,
    peekedSolutions,
    reviewSchedule,
    isPremium,
    trackFilter,
    today,
  });

  let scheduledCount = 0;
  let masteredCount = 0;
  let weakCount = 0;
  let nextUpcomingDays: number | null = null;

  for (const lesson of lessons) {
    if (!completedLessons[lesson.id]) continue;
    if (trackFilter && lesson.track !== trackFilter) continue;
    const entry = reviewSchedule[lesson.id];
    if (entry) {
      scheduledCount += 1;
      if (entry.intervalDays >= 14) masteredCount += 1;
      if (entry.weakSignalCount > 0 || peekedSolutions[lesson.id]) {
        weakCount += 1;
      }
      const dueIn = diffDaysIso(todayKey, entry.nextReviewAt.slice(0, 10));
      if (dueIn > 0 && (nextUpcomingDays === null || dueIn < nextUpcomingDays)) {
        nextUpcomingDays = dueIn;
      }
    } else if (peekedSolutions[lesson.id]) {
      scheduledCount += 1;
      weakCount += 1;
    }
  }

  return {
    dueNowCount: dueQueue.length,
    scheduledCount,
    masteredCount,
    weakCount,
    nextUpcomingDays,
  };
}
