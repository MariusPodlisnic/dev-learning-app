import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildFullRelationalItems,
  mergeCloudAndLocalState,
  remapProgressKeysForLessons,
} = loadTsModule("src/utils/supabaseSync.ts");

function makeBaseState(overrides = {}) {
  return {
    completedLessons: {},
    completedChallenges: {},
    peekedSolutions: {},
    solvedIncidents: {},
    claimedChapters: {},
    claimedStreakMilestones: {},
    streakShields: 1,
    dailyCompletedDate: null,
    lastActiveDate: null,
    xpPoints: 0,
    streakCount: 0,
    activeTrack: "python_basics",
    themeMode: "dark",
    codeDrafts: {},
    draftsVersion: 2,
    updatedAt: "2026-11-14T10:00:00.000Z",
    ...overrides,
  };
}

test("remapProgressKeysForLessons maps legacy exp slugs and track:order aliases to UUIDs", () => {
  const lessons = [
    {
      id: "uuid-py-1",
      slug: "exp-py-01",
      track: "python_basics",
      lesson_order: 1,
      title: "Variables",
    },
  ];
  const state = makeBaseState({
    completedLessons: { "exp-py-01": true },
    completedChallenges: { "exp-py-01::core": true, "python_basics:1::stage_1": true },
    peekedSolutions: { "exp-py-01": true },
    reviewSchedule: {
      "exp-py-01": {
        lessonId: "exp-py-01",
        intervalDays: 7,
        reps: 2,
        lastReviewedAt: "2026-11-10T00:00:00.000Z",
        nextReviewAt: "2026-11-17",
        weakSignalCount: 1,
        reason: "peeked",
      },
    },
    codeDrafts: { "exp-py-01": "def f(): return 1" },
    lastLessonId: "exp-py-01",
  });

  const remapped = remapProgressKeysForLessons(lessons, state);
  assert.equal(remapped.completedLessons["uuid-py-1"], true);
  assert.equal(remapped.completedChallenges["uuid-py-1::core"], true);
  assert.equal(remapped.completedChallenges["uuid-py-1::stage_1"], true);
  assert.equal(remapped.peekedSolutions["uuid-py-1"], true);
  assert.equal(remapped.reviewSchedule["uuid-py-1"]?.intervalDays, 7);
  assert.equal(remapped.reviewSchedule["uuid-py-1"]?.lessonId, "uuid-py-1");
  assert.equal(remapped.codeDrafts["uuid-py-1"], "def f(): return 1");
  assert.equal(remapped.lastLessonId, "uuid-py-1");
});

test("mergeCloudAndLocalState merges progress monotonically and migrates pre-v2 cloud drafts", () => {
  const cloud = {
    xpPoints: 250,
    streakCount: 4,
    completedLessons: { "exp-py-01": true, "exp-py-02": true },
    peekedSolutions: { "exp-py-01": true, "exp-py-02": true },
    reviewSchedule: {
      "exp-py-01": {
        lessonId: "exp-py-01",
        intervalDays: 3,
        reps: 1,
        lastReviewedAt: "2026-11-10T00:00:00.000Z",
        nextReviewAt: "2026-11-13",
        weakSignalCount: 0,
        reason: "scheduled",
      },
    },
    codeDrafts: { "exp-py-11": "old boilerplate" },
    updatedAt: "2026-11-14T09:00:00.000Z",
  };
  const local = makeBaseState({
    xpPoints: 180,
    streakCount: 5,
    completedLessons: { "exp-py-02": true, "exp-py-03": true },
    peekedSolutions: {}, // cleared peek on exp-py-02 after clean re-solve
    reviewSchedule: {
      "exp-py-01": {
        lessonId: "exp-py-01",
        intervalDays: 7,
        reps: 2,
        lastReviewedAt: "2026-11-14T11:00:00.000Z",
        nextReviewAt: "2026-11-21",
        weakSignalCount: 0,
        reason: "scheduled",
      },
    },
    codeDrafts: { "exp-py-03": "def get_rank_tier(score):\n    return 'GOLD'" },
    draftsVersion: 2,
    updatedAt: "2026-11-14T12:00:00.000Z",
  });

  const { merged, needsCloudBackfill } = mergeCloudAndLocalState(
    cloud,
    local,
    {},
    [],
  );

  assert.equal(merged.xpPoints, 250);
  assert.equal(merged.streakCount, 5);
  assert.equal(merged.completedLessons["exp-py-01"], true);
  assert.equal(merged.completedLessons["exp-py-02"], true);
  assert.equal(merged.completedLessons["exp-py-03"], true);
  // Incomplete or completed-only-on-one-side respects peek; clean re-solve clears peek
  assert.equal(merged.peekedSolutions["exp-py-01"], true);
  assert.equal(merged.peekedSolutions["exp-py-02"], undefined);
  assert.equal(merged.reviewSchedule["exp-py-01"]?.intervalDays, 7);
  assert.equal(merged.reviewSchedule["exp-py-01"]?.reps, 2);
  // Pre-v2 cloud draft should be dropped while v2 local draft is kept
  assert.equal(merged.codeDrafts["exp-py-11"], undefined);
  assert.equal(
    merged.codeDrafts["exp-py-03"],
    "def get_rank_tier(score):\n    return 'GOLD'",
  );
  assert.equal(merged.draftsVersion, 2);
  assert.equal(needsCloudBackfill, true);
});

test("buildFullRelationalItems emits lesson, stage, bug_incident, and chapter records", () => {
  const items = buildFullRelationalItems(
    makeBaseState({
      completedLessons: { "exp-py-01": true },
      completedChallenges: { "exp-py-01::core": true, "py-01-d2": true },
      peekedSolutions: { "exp-py-02": true },
      solvedIncidents: { "bug-01": true },
      claimedChapters: { "python_basics:1": true },
    }),
  );

  const byKey = new Map(items.map((i) => [`${i.itemType}:${i.itemKey}`, i]));
  assert.equal(byKey.get("lesson:exp-py-01")?.completed, true);
  assert.equal(byKey.get("lesson:exp-py-02")?.completed, false);
  assert.equal(byKey.get("lesson:exp-py-02")?.peekedSolution, true);
  assert.equal(byKey.get("stage:exp-py-01::core")?.completed, true);
  assert.equal(byKey.get("stage:py-01-d2")?.completed, true);
  assert.equal(byKey.get("bug_incident:bug-01")?.completed, true);
  assert.equal(byKey.get("chapter:python_basics:1")?.completed, true);
});

test("mergeCloudAndLocalState monotonically syncs Byte-Cat wardrobe, Pixel Garden, Playground snippets, and Arcade records", () => {
  const cloud = {
    xpPoints: 300,
    streakCount: 4,
    draftsVersion: 2,
    byteCatWardrobe: {
      equipped: { head: "headphones", eyewear: null, neck: null },
      mood: "chill",
    },
    activityHeatmap: { "2026-11-20": 2, "2026-11-21": 1 },
    scratchpadSnippets: [
      {
        id: "snip-1",
        title: "Cloud Fib",
        code: "print(1)",
        updatedAt: "2026-11-20T10:00:00.000Z",
      },
    ],
    arcadeRecords: {
      blitzBestHits: 10,
      blitzBestXp: 160,
      flashcardsMasteredTotal: 8,
      flashcardsRoundsCleared: 1,
      detectiveBestScore: 5,
      detectiveCasesSolvedTotal: 5,
    },
    completedMiniBuilds: { password_meter: true },
    updatedAt: "2026-11-21T08:00:00.000Z",
  };

  const local = makeBaseState({
    xpPoints: 300,
    streakCount: 4,
    byteCatWardrobe: {
      equipped: { head: "wizard_hat", eyewear: "crt_glasses", neck: null },
      mood: "focused",
    },
    activityHeatmap: { "2026-11-21": 5, "2026-11-22": 3 },
    scratchpadSnippets: [
      {
        id: "snip-2",
        title: "Local Dice",
        code: "print(6)",
        updatedAt: "2026-11-22T09:00:00.000Z",
      },
    ],
    arcadeRecords: {
      blitzBestHits: 14,
      blitzBestXp: 140,
      flashcardsMasteredTotal: 6,
      flashcardsRoundsCleared: 2,
      detectiveBestScore: 6,
      detectiveCasesSolvedTotal: 9,
    },
    completedMiniBuilds: { url_shortener: true },
    updatedAt: "2026-11-22T10:00:00.000Z",
  });

  const { merged, needsCloudBackfill } = mergeCloudAndLocalState(
    cloud,
    local,
    {},
    [],
  );

  assert.equal(needsCloudBackfill, true);
  assert.equal(merged.byteCatWardrobe?.equipped.head, "wizard_hat");
  assert.equal(merged.byteCatWardrobe?.mood, "focused");
  assert.equal(merged.activityHeatmap?.["2026-11-20"], 2);
  assert.equal(merged.activityHeatmap?.["2026-11-21"], 5);
  assert.equal(merged.activityHeatmap?.["2026-11-22"], 3);
  assert.equal(merged.scratchpadSnippets?.length, 2);
  assert.equal(merged.scratchpadSnippets?.[0].id, "snip-2");
  assert.equal(merged.arcadeRecords?.blitzBestHits, 14);
  assert.equal(merged.arcadeRecords?.blitzBestXp, 160);
  assert.equal(merged.arcadeRecords?.flashcardsMasteredTotal, 8);
  assert.equal(merged.arcadeRecords?.flashcardsRoundsCleared, 2);
  assert.equal(merged.arcadeRecords?.detectiveBestScore, 6);
  assert.equal(merged.arcadeRecords?.detectiveCasesSolvedTotal, 9);
  assert.equal(merged.completedMiniBuilds?.password_meter, true);
  assert.equal(merged.completedMiniBuilds?.url_shortener, true);
});
