import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildPixelGardenGrid,
  clearActivityHeatmapForTests,
  getActivityHeatmapMap,
  getGardenTilePalette,
  getHeatmapLevel,
  mergeStreakBaselineIntoHeatmap,
  recordCodingActivity,
  subscribeActivityHeatmap,
  toLocalDateKey,
} = loadTsModule("src/utils/activityHeatmap.ts");

test("activityHeatmap computes intensity levels, 12-week grid, bloom stages, and palettes", () => {
  assert.equal(getHeatmapLevel(0), 0);
  assert.equal(getHeatmapLevel(1), 1);
  assert.equal(getHeatmapLevel(2), 2);
  assert.equal(getHeatmapLevel(3), 2);
  assert.equal(getHeatmapLevel(5), 3);
  assert.equal(getHeatmapLevel(8), 4);

  const now = new Date(2026, 10, 21, 12, 0, 0); // Sat, Nov 21 2026
  const todayKey = toLocalDateKey(now);
  const yesterdayKey = toLocalDateKey(new Date(2026, 10, 20, 12, 0, 0));
  const lastWeekKey = toLocalDateKey(new Date(2026, 10, 10, 12, 0, 0));

  const grid = buildPixelGardenGrid(
    {
      [todayKey]: 7,
      [yesterdayKey]: 2,
      [lastWeekKey]: 4,
    },
    12,
    now,
  );

  assert.equal(grid.weeks.length, 12);
  for (const week of grid.weeks) {
    assert.equal(week.cells.length, 7);
  }
  assert.equal(grid.totalActions, 13);
  assert.equal(grid.activeDays, 3);
  assert.equal(grid.bestDayCount, 7);
  assert.equal(grid.currentGardenStreak, 2);
  assert.equal(grid.todayCount, 7);
  assert.equal(grid.bloomStageLabel, "FIRST SEEDS");

  const todayCell = grid.weeks.flatMap((w) => w.cells).find((c) => c.isToday);
  assert.ok(todayCell);
  assert.equal(todayCell.level, 4);
  assert.equal(todayCell.count, 7);

  for (const palette of ["arcade", "matcha", "amber", "sakura"]) {
    const darkPalette = getGardenTilePalette(true, palette);
    const lightPalette = getGardenTilePalette(false, palette);
    assert.equal(darkPalette.length, 5);
    assert.equal(lightPalette.length, 5);
  }
});

test("activityHeatmap persists coding wins, notifies listeners, and merges streak baselines", () => {
  clearActivityHeatmapForTests();
  const seen = [];
  const unsub = subscribeActivityHeatmap((next) => seen.push(next));

  const fixedDate = new Date(2026, 10, 21, 15, 0, 0);
  const fixedKey = toLocalDateKey(fixedDate);

  recordCodingActivity(1, fixedDate);
  recordCodingActivity(2, fixedDate);

  const stored = getActivityHeatmapMap();
  assert.equal(stored[fixedKey], 3);
  assert.equal(seen.length, 2);

  // Streak baseline backfills missing streak days without overwriting recorded count
  const merged = mergeStreakBaselineIntoHeatmap(stored, 4, fixedKey, fixedDate);
  assert.equal(merged[fixedKey], 3);
  assert.equal(merged[toLocalDateKey(new Date(2026, 10, 20, 12, 0, 0))], 1);
  assert.equal(merged[toLocalDateKey(new Date(2026, 10, 19, 12, 0, 0))], 1);
  assert.equal(merged[toLocalDateKey(new Date(2026, 10, 18, 12, 0, 0))], 1);

  unsub();
  clearActivityHeatmapForTests();
});
