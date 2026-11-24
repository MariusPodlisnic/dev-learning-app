import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const { getLoftThemeColors } = loadTsModule("src/utils/loftGeometry.ts");
const {
  computeLoftMilestoneTrophies,
  getLoftSkyVisuals,
  getNextLoftSkyMode,
  resolveLoftSkyPhase,
} = loadTsModule("src/utils/loftMilestones.ts");

test("resolveLoftSkyPhase maps local clock hours to dawn, daylight, sunset, and midnight", () => {
  assert.equal(resolveLoftSkyPhase("auto", 7), "dawn");
  assert.equal(resolveLoftSkyPhase("auto", 14), "daylight");
  assert.equal(resolveLoftSkyPhase("auto", 19), "sunset");
  assert.equal(resolveLoftSkyPhase("auto", 23), "midnight");
  assert.equal(resolveLoftSkyPhase("auto", 2), "midnight");

  // Manual override locks to chosen phase regardless of clock
  assert.equal(resolveLoftSkyPhase("sunset", 9), "sunset");
  assert.equal(resolveLoftSkyPhase("midnight", 13), "midnight");

  // Cycle order wraps cleanly back to auto
  let mode = "auto";
  const seen = [];
  for (let i = 0; i < 5; i += 1) {
    mode = getNextLoftSkyMode(mode);
    seen.push(mode);
  }
  assert.deepEqual(seen, ["dawn", "daylight", "sunset", "midnight", "auto"]);

  const pal = getLoftThemeColors("arcade", "dark");
  assert.equal(getLoftSkyVisuals("sunset", pal).badgeLabel, "GOLDEN HOUR");
  assert.equal(getLoftSkyVisuals("midnight", pal).showMoon, true);
});

test("computeLoftMilestoneTrophies unlocks Serpens poster, fairy lights, arcade cup, and holo-prism progressively", () => {
  const sampleLessons = Array.from({ length: 12 }, (_, idx) => ({
    id: `py_${idx + 1}`,
    track: "python_basics",
    lesson_order: idx + 1,
    is_recap: idx === 4,
    recap_chapter: idx === 4 ? 1 : undefined,
  }));

  // Brand new user: 0/4 keepsakes
  const fresh = computeLoftMilestoneTrophies({
    lessons: sampleLessons,
    completedLessons: {},
    streakCount: 1,
    blitzBestHits: 0,
    solvedBugCount: 0,
  });
  assert.equal(fresh.unlockedCount, 0);
  assert.equal(fresh.serpensPoster, false);

  // Clear Chapter I (5 lessons) + 5d streak + Blitz S-Rank (12 hits)
  const mid = computeLoftMilestoneTrophies({
    lessons: sampleLessons,
    completedLessons: {
      py_1: true,
      py_2: true,
      py_3: true,
      py_4: true,
      py_5: true,
    },
    streakCount: 5,
    blitzBestHits: 12,
    solvedBugCount: 0,
  });
  assert.equal(mid.serpensPoster, true);
  assert.equal(mid.fairyLights, true);
  assert.equal(mid.arcadeTrophy, true);
  assert.equal(mid.holoPrism, false);
  assert.equal(mid.unlockedCount, 3);

  // Clear entire track -> 4/4 keepsakes unlocked
  const allDone = Object.fromEntries(sampleLessons.map((l) => [l.id, true]));
  const full = computeLoftMilestoneTrophies({
    lessons: sampleLessons,
    completedLessons: allDone,
    streakCount: 7,
    blitzBestHits: 14,
    solvedBugCount: 6,
  });
  assert.equal(full.holoPrism, true);
  assert.equal(full.unlockedCount, 4);
});
