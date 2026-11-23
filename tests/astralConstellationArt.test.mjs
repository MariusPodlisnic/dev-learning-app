import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  CONSTELLATION_FIGURES,
  createSupernovaFx,
  evaluateSupernovaComet,
  getConstellationFigure,
  projectRadarPoint,
  radarPointToWorld,
} = loadTsModule("src/utils/astralConstellationArt.ts");

test("CONSTELLATION_FIGURES defines 7 valid normalized geometric figures", () => {
  assert.equal(CONSTELLATION_FIGURES.length, 7);
  for (let ch = 1; ch <= 7; ch += 1) {
    const fig = getConstellationFigure(ch);
    assert.equal(fig.chapterId, ch);
    assert.ok(fig.latinName.length >= 4);
    assert.ok(fig.segments.length >= 10);
    for (const [x1, y1, x2, y2] of fig.segments) {
      assert.ok(x1 >= -1 && x1 <= 1 && y1 >= -1 && y1 <= 1);
      assert.ok(x2 >= -1 && x2 <= 1 && y2 >= -1 && y2 <= 1);
    }
    assert.ok(fig.glints.length >= 4);
  }
  // Wraps gracefully beyond chapter 7
  assert.equal(getConstellationFigure(8).chapterId, 1);
});

test("Supernova comet travels cleanly along quadratic curve from origin star to next star", () => {
  const fx = createSupernovaFx(
    "star_1",
    100,
    200,
    { id: "star_2", x: 300, y: 200, crossChapter: false },
    "#FFDE59",
  );
  assert.equal(evaluateSupernovaComet(fx), null);

  fx.elapsed = 0.22;
  const start = evaluateSupernovaComet(fx);
  assert.ok(start);
  assert.ok(Math.abs(start.x - 100) < 1e-6);
  assert.ok(Math.abs(start.y - 200) < 1e-6);

  fx.elapsed = 0.72;
  const mid = evaluateSupernovaComet(fx);
  assert.ok(mid);
  assert.ok(Math.abs(mid.x - 200) < 1);
  assert.ok(mid.y < 200, "Comet should arc gently above the chord");

  fx.elapsed = 1.22;
  const end = evaluateSupernovaComet(fx);
  assert.ok(end);
  assert.ok(Math.abs(end.x - 300) < 1e-6);
  assert.ok(Math.abs(end.y - 200) < 1e-6);
});

test("Mini Galaxy Radar projection round-trips accurately within bounds", () => {
  const bounds = { minX: -200, maxX: 2800, minY: -300, maxY: 300 };
  const projected = projectRadarPoint(1300, 0, bounds, 260, 56, 10);
  assert.ok(Math.abs(projected.x - 130) < 0.5);
  assert.ok(Math.abs(projected.y - 28) < 0.5);

  const world = radarPointToWorld(projected.x, projected.y, bounds, 260, 56, 10);
  assert.ok(Math.abs(world.x - 1300) < 1);
  assert.ok(Math.abs(world.y - 0) < 1);
});
