import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  getLessonStageProgress,
  getLessonStarRating,
  isLessonLockedForUser,
  isLessonStageCompleted,
  isProTrackPreviewLesson,
} = loadTsModule("src/types/lesson.ts");

const { computeStreakUpdate, getStreakStatus } = loadTsModule(
  "src/constants/streaks.ts",
);

const {
  getChapterForTrackLesson,
  getCurriculumLessonSortKey,
} = loadTsModule("src/constants/certificates.ts");

test("lesson access gating unlocks free basics and pro module 1 previews", () => {
  assert.equal(
    isProTrackPreviewLesson({ track: "algorithms", lesson_order: 1 }),
    true,
  );
  assert.equal(
    isLessonLockedForUser(
      { track: "algorithms", lesson_order: 1, is_free: false },
      false,
    ),
    false,
  );
  assert.equal(
    isLessonLockedForUser(
      { track: "algorithms", lesson_order: 2, is_free: false },
      false,
    ),
    true,
  );
  assert.equal(
    isLessonLockedForUser(
      { track: "algorithms", lesson_order: 2, is_free: false },
      true,
    ),
    false,
  );
  assert.equal(
    isLessonLockedForUser(
      { track: "python_basics", lesson_order: 5, is_free: true },
      false,
    ),
    false,
  );
});

test("lesson stage progress and 3-star ratings behave accurately", () => {
  const lesson = {
    id: "exp-py-01",
    practiceChallenges: [{ id: "py-01-d2" }],
  };

  assert.equal(isLessonStageCompleted(lesson, 0, {}, {}), false);
  assert.equal(getLessonStarRating(lesson, {}, {}, {}), 0);

  const stage0Only = { "exp-py-01::core": true };
  assert.deepEqual(getLessonStageProgress(lesson, {}, stage0Only), {
    solvedStages: 1,
    totalStages: 2,
    allStagesSolved: false,
  });
  assert.equal(getLessonStarRating(lesson, {}, stage0Only, {}), 1);

  const bothSolved = { "exp-py-01::core": true, "py-01-d2": true };
  assert.equal(getLessonStarRating(lesson, {}, bothSolved, {}), 3);
  assert.equal(
    getLessonStarRating(lesson, {}, bothSolved, { "exp-py-01": true }),
    2,
  );
});

test("streak computation handles extend, shield protection, milestone unlock, and reset", () => {
  const extended = computeStreakUpdate({
    currentStreak: 2,
    lastActiveDate: "2026-11-14",
    claimedMilestones: {},
    todayKey: "2026-11-15",
    streakShields: 1,
  });
  assert.equal(extended.newStreak, 3);
  assert.equal(extended.streakExtended, true);
  assert.equal(extended.unlockedMilestone?.days, 3);

  const shielded = computeStreakUpdate({
    currentStreak: 5,
    lastActiveDate: "2026-11-13",
    claimedMilestones: {},
    todayKey: "2026-11-15",
    streakShields: 1,
  });
  assert.equal(shielded.newStreak, 6);
  assert.equal(shielded.shieldUsed, true);
  assert.equal(shielded.remainingShields, 0);

  const broken = computeStreakUpdate({
    currentStreak: 5,
    lastActiveDate: "2026-11-13",
    claimedMilestones: {},
    todayKey: "2026-11-15",
    streakShields: 0,
  });
  assert.equal(broken.newStreak, 1);
  assert.equal(broken.streakBroken, true);

  const status = getStreakStatus({
    streakCount: 5,
    lastActiveDate: "2026-11-14",
    todayKey: "2026-11-15",
  });
  assert.equal(status.isAtRisk, true);
  assert.equal(status.nextMilestone?.days, 7);
});

test("chapter recaps sort directly after their chapter's 4th module", () => {
  const ch2Recap = {
    lesson_order: 102,
    is_recap: true,
    recap_chapter: 2,
  };
  assert.equal(getChapterForTrackLesson("python_basics", ch2Recap).id, 2);
  assert.equal(getCurriculumLessonSortKey("python_basics", ch2Recap), 8.5);
});
