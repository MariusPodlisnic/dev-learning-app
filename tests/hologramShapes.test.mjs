import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  getHologramShapeData,
  getHologramShapeMeta,
  HOLOGRAM_PALETTES,
  HOLOGRAM_SHAPES_META,
} = loadTsModule("src/utils/hologramShapes.ts");

test("hologramShapes generates valid bounded 3D point clouds for all 5 sculptures and 4 palettes", () => {
  assert.equal(HOLOGRAM_SHAPES_META.length, 5);
  assert.equal(HOLOGRAM_SHAPES_META[0].id, "cyber_desk");

  const testCount = 800;
  for (const meta of HOLOGRAM_SHAPES_META) {
    const resolved = getHologramShapeMeta(meta.id);
    assert.equal(resolved.id, meta.id);

    const data = getHologramShapeData(meta.id, testCount);
    assert.equal(data.positions.length, testCount * 3);
    assert.equal(data.luminance.length, testCount);
    assert.equal(data.accentMix.length, testCount);

    let hasAccent = false;
    for (let i = 0; i < testCount; i += 1) {
      const x = data.positions[i * 3];
      const y = data.positions[i * 3 + 1];
      const z = data.positions[i * 3 + 2];
      assert.ok(Number.isFinite(x) && Math.abs(x) < 2.2, `Out-of-bounds x for ${meta.id}`);
      assert.ok(Number.isFinite(y) && Math.abs(y) < 2.2, `Out-of-bounds y for ${meta.id}`);
      assert.ok(Number.isFinite(z) && Math.abs(z) < 2.2, `Out-of-bounds z for ${meta.id}`);
      assert.ok(data.luminance[i] >= 0 && data.luminance[i] <= 1.01);
      if (data.accentMix[i] > 0.5) hasAccent = true;
    }
    assert.ok(hasAccent, `${meta.id} should include dual-tone accent highlights`);
  }

  for (const paletteId of ["arcade", "matcha", "amber", "sakura"]) {
    const pal = HOLOGRAM_PALETTES[paletteId];
    assert.ok(pal);
    assert.equal(pal.deep.length, 3);
    assert.equal(pal.mid.length, 3);
    assert.equal(pal.bright.length, 3);
    assert.equal(pal.accent.length, 3);
  }
});
