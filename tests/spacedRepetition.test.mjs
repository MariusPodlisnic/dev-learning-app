import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  REVIEW_BONUS_XP,
  REVIEW_INTERVAL_LADDER,
  buildDueReviewQueue,
  getIsoDateKey,
  getReviewRetentionSummary,
  updateReviewScheduleOnSolve,
} = loadTsModule("src/utils/spacedRepetition.ts");

test("updateReviewScheduleOnSolve advances ladder on clean due solves and resets to 1d on weak signals", () => {
  const day0 = new Date("2026-11-01T10:00:00.000Z");
  const { nextSchedule: s1, entry: e1, wasDueReview: d1 } =
    updateReviewScheduleOnSolve({
      currentSchedule: {},
      lessonId: "exp-py-01",
      signal: "clean",
      now: day0,
    });

  assert.equal(d1, false);
  assert.equal(e1.intervalDays, 3);
  assert.equal(e1.nextReviewAt, "2026-11-04");
  assert.equal(e1.reps, 1);

  // When due on day 3, solving cleanly advances to 7d
  const day3 = new Date("2026-11-04T12:00:00.000Z");
  const { nextSchedule: s2, entry: e2, wasDueReview: d2 } =
    updateReviewScheduleOnSolve({
      currentSchedule: s1,
      lessonId: "exp-py-01",
      signal: "clean",
      now: day3,
    });
  assert.equal(d2, true);
  assert.equal(e2.intervalDays, 7);
  assert.equal(e2.nextReviewAt, "2026-11-11");
  assert.equal(e2.reps, 2);

  // Peeking or using scaffold pulls review back to 1 day and tracks weakSignalCount
  const day10 = new Date("2026-11-11T12:00:00.000Z");
  const { entry: e3 } = updateReviewScheduleOnSolve({
    currentSchedule: s2,
    lessonId: "exp-py-01",
    signal: "peeked",
    now: day10,
  });
  assert.equal(e3.intervalDays, 1);
  assert.equal(e3.nextReviewAt, "2026-11-12");
  assert.equal(e3.weakSignalCount, 1);
  assert.equal(e3.reason, "peeked");
  assert.equal(REVIEW_BONUS_XP, 15);
  assert.deepEqual([...REVIEW_INTERVAL_LADDER], [1, 3, 7, 14, 30]);
});

test("buildDueReviewQueue prioritizes peeked & overdue lessons and backfills legacy peeked clears", () => {
  const lessons = [
    { id: "l1", track: "python_basics", lesson_order: 1, is_free: true },
    { id: "l2", track: "python_basics", lesson_order: 2, is_free: true },
    { id: "l3", track: "algorithms", lesson_order: 1, is_free: false },
  ];

  const today = new Date("2026-11-15T09:00:00.000Z");
  assert.equal(getIsoDateKey(today), "2026-11-15");

  const queue = buildDueReviewQueue({
    lessons,
    completedLessons: { l1: true, l2: true, l3: true },
    peekedSolutions: { l2: true },
    reviewSchedule: {
      l1: {
        lessonId: "l1",
        intervalDays: 3,
        reps: 1,
        lastReviewedAt: "2026-11-10T00:00:00.000Z",
        nextReviewAt: "2026-11-13",
        weakSignalCount: 0,
        reason: "scheduled",
      },
      l3: {
        lessonId: "l3",
        intervalDays: 14,
        reps: 3,
        lastReviewedAt: "2026-11-14T00:00:00.000Z",
        nextReviewAt: "2026-11-28",
        weakSignalCount: 0,
        reason: "scheduled",
      },
    },
    isPremium: true,
    today,
  });

  // Both l2 (implicit legacy peek) and l1 (2 days overdue) are due; l2 ranks first
  assert.equal(queue.length, 2);
  assert.equal(queue[0].lesson.id, "l2");
  assert.equal(queue[0].isImplicitPeek, true);
  assert.equal(queue[1].lesson.id, "l1");
  assert.equal(queue[1].overdueDays, 2);

  const summary = getReviewRetentionSummary({
    lessons,
    completedLessons: { l1: true, l2: true, l3: true },
    peekedSolutions: { l2: true },
    reviewSchedule: {
      l1: {
        lessonId: "l1",
        intervalDays: 3,
        reps: 1,
        lastReviewedAt: "2026-11-10T00:00:00.000Z",
        nextReviewAt: "2026-11-13",
        weakSignalCount: 0,
        reason: "scheduled",
      },
      l3: {
        lessonId: "l3",
        intervalDays: 14,
        reps: 3,
        lastReviewedAt: "2026-11-14T00:00:00.000Z",
        nextReviewAt: "2026-11-28",
        weakSignalCount: 0,
        reason: "scheduled",
      },
    },
    isPremium: true,
    today,
  });

  assert.equal(summary.dueNowCount, 2);
  assert.equal(summary.scheduledCount, 3);
  assert.equal(summary.masteredCount, 1);
  assert.equal(summary.weakCount, 1);
  assert.equal(summary.nextUpcomingDays, 13);
});
