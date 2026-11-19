import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  STUDIO_PALETTES,
  getStudioColors,
  getStudioPaletteMeta,
  isStudioPaletteUnlocked,
  isValidStudioPaletteId,
} = loadTsModule("src/constants/theme.ts");

test("STUDIO_PALETTES defines 4 distinct cozy palettes with dark and light tokens", () => {
  assert.equal(STUDIO_PALETTES.length, 4);
  const darkBgs = new Set();
  const codeBgs = new Set();

  for (const pal of STUDIO_PALETTES) {
    assert.ok(isValidStudioPaletteId(pal.id));
    assert.equal(getStudioPaletteMeta(pal.id).id, pal.id);
    assert.equal(pal.swatches.length, 3);

    const dark = getStudioColors("dark", pal.id);
    const light = getStudioColors("light", pal.id);
    assert.match(dark.bg, /^#[0-9A-Fa-f]{6}$/);
    assert.match(light.bg, /^#[0-9A-Fa-f]{6}$/);
    assert.match(dark.codeBg, /^#[0-9A-Fa-f]{6}$/);
    assert.notEqual(dark.bg, light.bg);

    darkBgs.add(dark.bg);
    codeBgs.add(dark.codeBg);
  }

  assert.equal(darkBgs.size, 4, "Each palette should have a distinct dark background");
  assert.equal(codeBgs.size, 4, "Each palette should have a distinct code editor background");
});

test("isStudioPaletteUnlocked enforces level unlocks and Pro early access", () => {
  assert.equal(isStudioPaletteUnlocked("arcade", 1, false), true);
  assert.equal(isStudioPaletteUnlocked("matcha", 1, false), true);
  assert.equal(isStudioPaletteUnlocked("amber", 1, false), false);
  assert.equal(isStudioPaletteUnlocked("sakura", 1, false), false);

  assert.equal(isStudioPaletteUnlocked("amber", 2, false), true);
  assert.equal(isStudioPaletteUnlocked("sakura", 2, false), false);
  assert.equal(isStudioPaletteUnlocked("sakura", 3, false), true);

  // Pro members unlock all palettes from Level 1
  assert.equal(isStudioPaletteUnlocked("amber", 1, true), true);
  assert.equal(isStudioPaletteUnlocked("sakura", 1, true), true);
});
