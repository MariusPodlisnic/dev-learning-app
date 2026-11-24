import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildDailyGauntletRun,
  computeGauntletStagePoints,
  evaluateDailyGauntletRank,
  getDailyGauntletRecord,
  recordDailyGauntletFinish,
  resetDailyGauntletForTesting,
} = loadTsModule("src/utils/dailyGauntlet.ts");

test("buildDailyGauntletRun generates deterministic 5-stage gauntlet (3 Blitz, 1 Bug Spotter, 1 Detective)", () => {
  const runA = buildDailyGauntletRun("2026-11-24", false);
  const runB = buildDailyGauntletRun("2026-11-24", false);
  assert.equal(runA.length, 5);
  assert.deepEqual(
    runA.map((s) => s.kind),
    ["blitz", "blitz", "blitz", "bug_spotter", "detective"],
  );
  assert.deepEqual(runA, runB, "Same dateKey must produce identical daily gauntlet");

  for (const stage of runA) {
    assert.equal(stage.options.length, 4);
    assert.ok(stage.correctIndex >= 0 && stage.correctIndex < 4);
    assert.ok(stage.explanation.length > 5);
  }
});

test("Daily Gauntlet ranks scale from C to S+ and only award positive XP deltas on same-day replays", () => {
  resetDailyGauntletForTesting();
  const dateKey = "2026-11-24";

  assert.equal(computeGauntletStagePoints(true, 1), 200);
  assert.equal(computeGauntletStagePoints(true, 3), 300);
  assert.equal(computeGauntletStagePoints(false, 3), 0);

  // First run: 3/5 B-Rank (+55 XP)
  const bSummary = evaluateDailyGauntletRank(650, 3, 5, 70);
  assert.equal(bSummary.rank, "B");
  assert.equal(bSummary.xpReward, 55);
  const first = recordDailyGauntletFinish(dateKey, bSummary, 3);
  assert.equal(first.newlyAwardedXp, 55);
  assert.equal(first.record.bestRank, "B");

  // Replay with worse score: 0 extra XP, keeps B-Rank
  const cSummary = evaluateDailyGauntletRank(200, 1, 5, 40);
  assert.equal(cSummary.rank, "C");
  const second = recordDailyGauntletFinish(dateKey, cSummary, 1);
  assert.equal(second.newlyAwardedXp, 0);
  assert.equal(second.record.bestRank, "B");

  // Replay with flawless 5/5 speedrun: upgrades to S+ and awards exact +55 XP delta (110 - 55)
  const sPlus = evaluateDailyGauntletRank(1500, 5, 5, 112);
  assert.equal(sPlus.rank, "S+");
  assert.equal(sPlus.xpReward, 110);
  const third = recordDailyGauntletFinish(dateKey, sPlus, 5);
  assert.equal(third.newlyAwardedXp, 55);
  assert.equal(third.record.bestRank, "S+");
  assert.equal(getDailyGauntletRecord(dateKey).runsToday, 3);

  resetDailyGauntletForTesting();
});
