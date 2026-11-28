import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  computeIdleDisperseEnvelope,
  createIdleDisperseState,
  getHologramShapeData,
  getHologramShapeMeta,
  HOLOGRAM_PALETTES,
  HOLOGRAM_PARTICLE_COUNT,
  HOLOGRAM_SHAPES_META,
  IDLE_DISPERSE_DURATION_SEC,
  IDLE_DISPERSE_MAX_SEC,
  IDLE_DISPERSE_MIN_SEC,
  pickNextIdleDisperseDelay,
  stepIdleDisperseState,
} = loadTsModule("src/utils/hologramShapes.ts");

test("hologramShapes generates valid bounded 3D point clouds for all 4 sculptures and 4 palettes", () => {
  assert.equal(HOLOGRAM_SHAPES_META.length, 4);
  assert.equal(HOLOGRAM_SHAPES_META[0].id, "cyber_desk");
  assert.equal(HOLOGRAM_PARTICLE_COUNT, 26000);

  const testCount = 1200;
  for (const meta of HOLOGRAM_SHAPES_META) {
    const resolved = getHologramShapeMeta(meta.id);
    assert.equal(resolved.id, meta.id);

    const data = getHologramShapeData(meta.id, testCount);
    assert.equal(data.positions.length, testCount * 3);
    assert.equal(data.luminance.length, testCount);
    assert.equal(data.accentMix.length, testCount);

    let hasAccent = false;
    let brightCount = 0;
    for (let i = 0; i < testCount; i += 1) {
      const x = data.positions[i * 3];
      const y = data.positions[i * 3 + 1];
      const z = data.positions[i * 3 + 2];
      assert.ok(Number.isFinite(x) && Math.abs(x) < 2.2, `Out-of-bounds x for ${meta.id}`);
      assert.ok(Number.isFinite(y) && Math.abs(y) < 2.2, `Out-of-bounds y for ${meta.id}`);
      assert.ok(Number.isFinite(z) && Math.abs(z) < 2.2, `Out-of-bounds z for ${meta.id}`);
      assert.ok(data.luminance[i] >= 0 && data.luminance[i] <= 1.01);
      if (data.luminance[i] > 0.85) brightCount += 1;
      if (data.accentMix[i] > 0.5) hasAccent = true;
    }
    assert.ok(hasAccent, `${meta.id} should include dual-tone accent highlights`);
    assert.ok(brightCount > 100, `${meta.id} should include crisp bevel & highlight particles`);
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

test("idle particle dispersion triggers every 10-15s untouched, blooms smoothly, and recalls on touch", () => {
  for (let i = 0; i < 12; i += 1) {
    const delay = pickNextIdleDisperseDelay(i);
    assert.ok(
      delay >= IDLE_DISPERSE_MIN_SEC && delay <= IDLE_DISPERSE_MAX_SEC,
      `Expected idle delay in [10, 15], got ${delay}`,
    );
  }

  assert.equal(computeIdleDisperseEnvelope(0), 0);
  assert.equal(computeIdleDisperseEnvelope(1), 0);
  assert.ok(computeIdleDisperseEnvelope(0.48) > 0.98);
  assert.ok(computeIdleDisperseEnvelope(0.2) > 0.3 && computeIdleDisperseEnvelope(0.2) < 0.95);
  assert.ok(computeIdleDisperseEnvelope(0.8) > 0.05 && computeIdleDisperseEnvelope(0.8) < 0.6);

  // Verify C-infinity continuity & strict monotonicity (no piecewise dips/jumps/pauses)
  let prev = 0;
  for (let step = 1; step <= 200; step += 1) {
    const u = step / 200;
    const val = computeIdleDisperseEnvelope(u);
    assert.ok(
      Math.abs(val - prev) < 0.03,
      `Discontinuity detected at u=${u}: prev=${prev}, val=${val}`,
    );
    if (u <= 0.5) {
      assert.ok(val >= prev, `Expected strictly rising spread at u=${u}: prev=${prev}, val=${val}`);
    } else {
      assert.ok(val <= prev, `Expected strictly falling return at u=${u}: prev=${prev}, val=${val}`);
    }
    prev = val;
  }

  const st = createIdleDisperseState();
  const initialDelay = st.nextDelaySec;
  // Still quiet just before the idle delay threshold
  assert.equal(stepIdleDisperseState(st, initialDelay - 0.5, false), 0);
  assert.equal(st.active, false);

  // Cross threshold -> enters active dispersion cycle
  stepIdleDisperseState(st, 0.6, false);
  assert.equal(st.active, true);

  // Mid-cycle reaches full stardust bloom
  const peak = stepIdleDisperseState(st, IDLE_DISPERSE_DURATION_SEC * 0.48, false);
  assert.ok(peak > 0.95, `Expected full bloom near midpoint, got ${peak}`);

  // Completes smoothly back to 0 and schedules next 10-15s cycle
  const ended = stepIdleDisperseState(st, IDLE_DISPERSE_DURATION_SEC * 0.6, false);
  assert.equal(ended, 0);
  assert.equal(st.active, false);
  assert.equal(st.cycleIndex, 1);
  assert.ok(st.nextDelaySec >= 10 && st.nextDelaySec <= 15);

  // Interaction mid-bloom swiftly recalls particles back to 0 and resets idle timer
  stepIdleDisperseState(st, st.nextDelaySec + 0.1, false);
  stepIdleDisperseState(st, IDLE_DISPERSE_DURATION_SEC * 0.3, false);
  assert.equal(st.active, true);
  let val = 1;
  for (let frame = 0; frame < 40; frame += 1) {
    val = stepIdleDisperseState(st, 0.05, true);
  }
  assert.equal(val, 0);
  assert.equal(st.active, false);
  assert.equal(st.idleElapsedSec, 0);
});
