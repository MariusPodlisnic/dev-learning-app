import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  computeIsoMetrics,
  getLoftThemeColors,
  getWindowGlassPolygon,
  LOFT_GROUNDED_FURNITURE,
  LOFT_WINDOW_GLASS,
  pointInPolygon,
  projectIso,
} = loadTsModule("src/utils/loftGeometry.ts");

test("loftGeometry grounds all floor furniture strictly at z = 0 within room bounds", () => {
  const keys = Object.keys(LOFT_GROUNDED_FURNITURE);
  assert.ok(keys.includes("bonsaiStand"));
  assert.ok(keys.includes("arcadeCabinet"));
  assert.ok(keys.includes("desk"));
  assert.ok(keys.includes("chair"));
  assert.ok(keys.includes("pcTower"));
  assert.ok(keys.includes("recordTable"));

  for (const key of keys) {
    const spec = LOFT_GROUNDED_FURNITURE[key];
    assert.equal(spec.z0, 0, `${key} must rest directly on floor z = 0`);
    assert.ok(spec.u0 >= 0 && spec.u0 + spec.du <= 1, `${key} u-bounds must stay inside room`);
    assert.ok(spec.v0 >= 0 && spec.v0 + spec.dv <= 1, `${key} v-bounds must stay inside room`);
    assert.ok(spec.dz > 0 && spec.dz <= 0.9, `${key} height must stay inside loft wall height`);
  }
});

test("loftGeometry window polygon strictly encloses interior rain coordinates and resolves all palettes", () => {
  const m = computeIsoMetrics(680, 440);
  const poly = getWindowGlassPolygon(m);
  assert.equal(poly.length, 4);

  const centerGlass = projectIso(
    m,
    LOFT_WINDOW_GLASS.u,
    (LOFT_WINDOW_GLASS.vMin + LOFT_WINDOW_GLASS.vMax) * 0.5,
    (LOFT_WINDOW_GLASS.zMin + LOFT_WINDOW_GLASS.zMax) * 0.5,
  );
  assert.equal(pointInPolygon(centerGlass, poly), true);

  const outsideFloor = projectIso(m, 0.7, 0.7, 0);
  assert.equal(pointInPolygon(outsideFloor, poly), false);

  for (const paletteId of ["arcade", "matcha", "amber", "sakura"]) {
    for (const mode of ["dark", "light"]) {
      const cols = getLoftThemeColors(paletteId, mode);
      assert.ok(cols.wallLeft.startsWith("#"));
      assert.ok(cols.floorBase.startsWith("#"));
      assert.ok(cols.bonsaiLeaf.startsWith("#"));
      assert.ok(cols.accent.startsWith("#"));
    }
  }
});
