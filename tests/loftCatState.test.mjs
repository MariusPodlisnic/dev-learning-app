import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildLoftCatWaypoints,
  commandLoftCatTo,
  createInitialLoftCatState,
  LOFT_CAT_ROUTINE,
  LOFT_CAT_STATIONS,
  stepLoftCat,
} = loadTsModule("src/utils/loftCatState.ts");

test("loftCatState defines all 5 cozy loft stations strictly within room bounds", () => {
  const keys = Object.keys(LOFT_CAT_STATIONS);
  assert.deepEqual(keys.sort(), ["arcade", "coding", "lounge", "music", "window"]);
  for (const key of keys) {
    const s = LOFT_CAT_STATIONS[key];
    assert.ok(s.u > 0.02 && s.u < 0.92, `${key} u out of room bounds`);
    assert.ok(s.v > 0.25 && s.v < 0.92, `${key} v out of room bounds`);
    assert.ok(s.z >= 0 && s.z <= 0.52, `${key} z out of expected floor/chair/sill range`);
    assert.ok(s.petToast.length > 5);
  }
  assert.ok(LOFT_CAT_ROUTINE.includes("arcade"));
  assert.ok(LOFT_CAT_ROUTINE.includes("coding"));
  assert.ok(LOFT_CAT_ROUTINE.includes("window"));
  assert.ok(LOFT_CAT_ROUTINE.includes("music"));
});

test("loftCatState autonomously cycles across arcade, coding, window, music, and lounge with chair hops", () => {
  const cat = createInitialLoftCatState();
  assert.equal(cat.activity, "lounge");
  assert.equal(cat.phase, "staying");

  const visited = new Set([cat.activity]);
  let sawWalking = false;
  let sawChairHop = false;

  // Simulate ~65 seconds at 20Hz
  for (let i = 0; i < 1300; i += 1) {
    const res = stepLoftCat(cat, 0.05);
    if (cat.phase === "walking") sawWalking = true;
    if (cat.hopZ > 0.05) sawChairHop = true;
    if (res.arrivedActivity) {
      visited.add(res.arrivedActivity);
    }
    assert.ok(cat.u >= 0 && cat.u <= 1);
    assert.ok(cat.v >= 0 && cat.v <= 1);
    assert.ok(cat.z >= 0 && cat.z <= 0.6);
  }

  assert.equal(sawWalking, true, "Cat should walk smoothly between stations");
  assert.equal(sawChairHop, true, "Cat should perform a parabolic hop onto/off the desk chair");
  assert.ok(visited.has("arcade"), "Cat should visit the arcade cabinet");
  assert.ok(visited.has("coding"), "Cat should visit the coding desk");
  assert.ok(visited.has("window"), "Cat should visit the window");
  assert.ok(visited.has("music"), "Cat should visit the record player");
});

test("commandLoftCatTo routes around furniture and lands accurately at destination", () => {
  const cat = createInitialLoftCatState();
  const wps = buildLoftCatWaypoints({ u: cat.u, v: cat.v, z: cat.z }, "lounge", "coding");
  assert.ok(wps.length >= 2, "Coding route should stage beside the chair before hopping onto seat");
  const windowWps = buildLoftCatWaypoints({ u: cat.u, v: cat.v, z: cat.z }, "lounge", "window");
  assert.ok(windowWps.length >= 2, "Window route should stage at floor before leaping to windowsill perch");
  const arcadeWps = buildLoftCatWaypoints({ u: cat.u, v: cat.v, z: cat.z }, "lounge", "arcade");
  assert.ok(arcadeWps.length >= 2, "Arcade route should stage beside step-stool before hopping up");

  commandLoftCatTo(cat, "arcade");
  assert.equal(cat.phase, "walking");
  assert.equal(cat.targetActivity, "arcade");

  let arrived = null;
  for (let i = 0; i < 200 && !arrived; i += 1) {
    const res = stepLoftCat(cat, 0.05);
    if (res.arrivedActivity) arrived = res.arrivedActivity;
  }
  assert.equal(arrived, "arcade");
  assert.equal(cat.activity, "arcade");
  assert.equal(cat.phase, "staying");
  assert.equal(cat.u, LOFT_CAT_STATIONS.arcade.u);
  assert.equal(cat.v, LOFT_CAT_STATIONS.arcade.v);
});
