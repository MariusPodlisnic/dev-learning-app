import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildAstralPassportData,
  buildBonsaiEmblemSvgInner,
  buildMiniConstellationSvgInner,
  buildPassportSerial,
  computePassportBonsaiStage,
  computePassportRarity,
  computePassportTilt,
} = loadTsModule("src/utils/astralPassport.ts");

test("astralPassport computes deterministic serials, rarity tiers, and 5 bonsai growth stages", () => {
  assert.equal(buildPassportSerial("", 1), "DVY-01-STAR");
  const s1 = buildPassportSerial("Marius", 6);
  const s2 = buildPassportSerial("marius", 6);
  assert.equal(s1, s2);
  assert.match(s1, /^DVY-06-[0-9A-F]{4}$/);

  assert.equal(computePassportRarity(1).tier, "INITIATE");
  assert.equal(computePassportRarity(3).tier, "VOYAGER");
  assert.equal(computePassportRarity(5).tier, "NAVIGATOR");
  assert.equal(computePassportRarity(8).tier, "ARCHITECT");
  assert.equal(computePassportRarity(10).tier, "CELESTIAL");

  assert.equal(computePassportBonsaiStage(0, 0).id, "seedling");
  assert.equal(computePassportBonsaiStage(2, 1).id, "sprout");
  assert.equal(computePassportBonsaiStage(5, 4).id, "sapling");
  assert.equal(computePassportBonsaiStage(12, 10).id, "blossom");
  assert.equal(computePassportBonsaiStage(25, 10).id, "celestial");
  assert.equal(computePassportBonsaiStage(0, 35).stageNumber, 5);
});

test("computePassportTilt clamps 3D hover angles cleanly and resets on leave", () => {
  const resting = computePassportTilt(0.8, -0.7, false);
  assert.equal(resting.rotateX, 0);
  assert.equal(resting.rotateY, 0);
  assert.equal(resting.isHovering, false);

  const corner = computePassportTilt(5, -5, true);
  assert.ok(Math.abs(corner.rotateX) <= 8);
  assert.ok(Math.abs(corner.rotateY) <= 8);
  assert.equal(corner.glareX, 100);
  assert.equal(corner.glareY, 0);
  assert.equal(corner.isHovering, true);
});

test("buildAstralPassportData illuminates constellations, unlocks stamps, and builds crisp SVGs", () => {
  const lessons = [
    { id: "py-1", track: "python_basics", lesson_order: 1, title: "L1" },
    { id: "py-2", track: "python_basics", lesson_order: 2, title: "L2" },
    { id: "py-3", track: "python_basics", lesson_order: 3, title: "L3" },
    { id: "py-4", track: "python_basics", lesson_order: 4, title: "L4" },
    { id: "py-5", track: "python_basics", lesson_order: 5, title: "L5" },
    { id: "alg-1", track: "algorithms", lesson_order: 1, title: "A1" },
    { id: "alg-2", track: "algorithms", lesson_order: 2, title: "A2" },
    { id: "sys-1", track: "system_design", lesson_order: 1, title: "S1" },
  ];
  const completedLessons = {
    "py-1": true,
    "py-2": true,
    "py-3": true,
    "py-4": true,
    "py-5": true,
    "alg-1": true,
  };

  const passport = buildAstralPassportData({
    displayName: "Nova",
    rankLevel: 6,
    rankTitle: "O(1) Sorcerer",
    rankAccent: "#A3E635",
    isPremium: true,
    xpPoints: 9500,
    streakCount: 11,
    lessons,
    completedLessons,
    blitzBestHits: 14,
    solvedBugCount: 2,
  });

  assert.equal(passport.handle, "Nova");
  assert.equal(passport.totalSolved, 6);
  assert.equal(passport.totalLessons, 8);
  assert.equal(passport.rarity.tier, "NAVIGATOR");
  assert.equal(passport.bonsai.id, "blossom");

  const serpens = passport.constellations.find((c) => c.shortCode === "PY");
  const draco = passport.constellations.find((c) => c.shortCode === "ALG");
  const nexus = passport.constellations.find((c) => c.shortCode === "SYS");
  assert.equal(serpens.pct, 100);
  assert.equal(serpens.illuminatedStars, serpens.stars.length);
  assert.equal(draco.pct, 50);
  assert.ok(draco.illuminatedStars >= 1);
  assert.equal(nexus.pct, 0);
  assert.equal(nexus.illuminatedStars, 0);

  // Star Chart (5+ solved), Bonfire (5d+ streak), and Arcade Ace (12+ blitz) should unlock
  assert.ok(passport.stamps.find((s) => s.id === "star_chart").unlocked);
  assert.ok(passport.stamps.find((s) => s.id === "bonfire").unlocked);
  assert.ok(passport.stamps.find((s) => s.id === "arcade_ace").unlocked);
  assert.ok(passport.stampsEarnedCount >= 3);

  const starSvg = buildMiniConstellationSvgInner(passport.constellations, 360, 108);
  assert.ok(starSvg.includes("SERPENS · 100%"));
  assert.ok(starSvg.includes("DRACO · 50%"));
  assert.ok(starSvg.includes("NEXUS · 0%"));

  for (const stage of [1, 2, 3, 4, 5]) {
    const info =
      stage === 1
        ? computePassportBonsaiStage(0, 0)
        : stage === 2
          ? computePassportBonsaiStage(2, 0)
          : stage === 3
            ? computePassportBonsaiStage(5, 0)
            : stage === 4
              ? computePassportBonsaiStage(12, 0)
              : computePassportBonsaiStage(25, 0);
    const bonsaiSvg = buildBonsaiEmblemSvgInner(info, "matcha");
    assert.ok(bonsaiSvg.includes("<path"));
  }
});
