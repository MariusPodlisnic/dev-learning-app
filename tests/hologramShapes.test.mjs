import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  computeIdleDisperseEnvelope,
  createIdleDisperseState,
  getFloatingDevIslandData,
  HOLOGRAM_PARTICLE_COUNT,
  IDLE_DISPERSE_DURATION_SEC,
  IDLE_DISPERSE_MAX_SEC,
  IDLE_DISPERSE_MIN_SEC,
  pickNextIdleDisperseDelay,
  stepIdleDisperseState,
} = loadTsModule("src/utils/hologramShapes.ts");

test("getFloatingDevIslandData generates 38k-ready stratified 3D sculpture with normals, RGB palette, and all 4 kinetic part groups", () => {
  assert.equal(HOLOGRAM_PARTICLE_COUNT, 38000);

  const data = getFloatingDevIslandData(HOLOGRAM_PARTICLE_COUNT);
  assert.equal(data.positions.length, HOLOGRAM_PARTICLE_COUNT * 3);
  assert.equal(data.normals.length, HOLOGRAM_PARTICLE_COUNT * 3);
  assert.equal(data.colors.length, HOLOGRAM_PARTICLE_COUNT * 3);
  assert.equal(data.meta.length, HOLOGRAM_PARTICLE_COUNT * 2);

  const partCounts = new Map([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);

  for (let i = 0; i < HOLOGRAM_PARTICLE_COUNT; i += 1) {
    const x = data.positions[i * 3];
    const y = data.positions[i * 3 + 1];
    const z = data.positions[i * 3 + 2];
    assert.ok(Number.isFinite(x) && Math.abs(x) < 2.2, `Out-of-bounds x at ${i}: ${x}`);
    assert.ok(Number.isFinite(y) && Math.abs(y) < 2.2, `Out-of-bounds y at ${i}: ${y}`);
    assert.ok(Number.isFinite(z) && Math.abs(z) < 2.2, `Out-of-bounds z at ${i}: ${z}`);

    const nx = data.normals[i * 3];
    const ny = data.normals[i * 3 + 1];
    const nz = data.normals[i * 3 + 2];
    const nLen = Math.hypot(nx, ny, nz);
    assert.ok(Math.abs(nLen - 1) < 0.02, `Expected unit normal at ${i}, got ${nLen}`);

    const r = data.colors[i * 3];
    const g = data.colors[i * 3 + 1];
    const b = data.colors[i * 3 + 2];
    assert.ok(r >= 0 && r <= 1.01 && g >= 0 && g <= 1.01 && b >= 0 && b <= 1.01);

    const sizeMult = data.meta[i * 2];
    const partId = Math.round(data.meta[i * 2 + 1]);
    assert.ok(sizeMult > 0.4 && sizeMult < 2.0);
    assert.ok(partCounts.has(partId), `Unexpected partId ${partId}`);
    partCounts.set(partId, (partCounts.get(partId) || 0) + 1);
  }

  // Main island/tree/desk, spinning ring/moons, bobbing islets/petals/waterfall, and glowing CRT/lantern/veins must all be populated
  assert.ok((partCounts.get(0) || 0) > 20000);
  assert.ok((partCounts.get(1) || 0) > 1500);
  assert.ok((partCounts.get(2) || 0) > 2500);
  assert.ok((partCounts.get(3) || 0) > 600);

  // Cached lookup returns identical instance
  assert.equal(getFloatingDevIslandData(HOLOGRAM_PARTICLE_COUNT), data);
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

  let prev = 0;
  for (let step = 1; step <= 200; step += 1) {
    const u = step / 200;
    const val = computeIdleDisperseEnvelope(u);
    assert.ok(
      Math.abs(val - prev) < 0.03,
      `Discontinuity detected at u=${u}: prev=${prev}, val=${val}`,
    );
    if (u <= 0.5) {
      assert.ok(val >= prev, `Expected strictly rising spread at u=${u}`);
    } else {
      assert.ok(val <= prev, `Expected strictly falling return at u=${u}`);
    }
    prev = val;
  }

  const st = createIdleDisperseState();
  const initialDelay = st.nextDelaySec;
  assert.equal(stepIdleDisperseState(st, initialDelay - 0.5, false), 0);
  assert.equal(st.active, false);

  stepIdleDisperseState(st, 0.6, false);
  assert.equal(st.active, true);

  const peak = stepIdleDisperseState(st, IDLE_DISPERSE_DURATION_SEC * 0.48, false);
  assert.ok(peak > 0.95, `Expected full bloom near midpoint, got ${peak}`);

  const ended = stepIdleDisperseState(st, IDLE_DISPERSE_DURATION_SEC * 0.6, false);
  assert.equal(ended, 0);
  assert.equal(st.active, false);
  assert.equal(st.cycleIndex, 1);
  assert.ok(st.nextDelaySec >= 10 && st.nextDelaySec <= 15);

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
