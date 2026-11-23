import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  clearAstralCursor,
  createAstralCursorState,
  setAstralCursorDragging,
  setAstralCursorHover,
  stepAstralCursor,
  triggerAstralCursorClick,
  updateAstralCursorPointer,
} = loadTsModule("src/utils/astralCursorState.ts");

test("astralCursorState activates for mouse/pen, ignores touch, and spawns cozy stardust trail", () => {
  const cur = createAstralCursorState();
  assert.equal(cur.active, false);
  assert.equal(cur.opacity, 0);

  // Touch events must leave custom cursor hidden
  const touchHandled = updateAstralCursorPointer(cur, 120, 140, "touch");
  assert.equal(touchHandled, false);
  assert.equal(cur.active, false);

  // Mouse enter snaps reticle immediately to entry point (no jump from 0,0)
  const mouseHandled = updateAstralCursorPointer(cur, 200, 180, "mouse");
  assert.equal(mouseHandled, true);
  assert.equal(cur.active, true);
  assert.equal(cur.ringX, 200);
  assert.equal(cur.ringY, 180);

  // Smooth gliding spawns stardust motes
  updateAstralCursorPointer(cur, 260, 210, "mouse");
  assert.ok(cur.trail.length >= 2, "Moving pointer should emit soft stardust motes");

  // Stepping fades opacity in and eventually decays trail
  for (let i = 0; i < 40; i += 1) {
    stepAstralCursor(cur, 0.03);
  }
  assert.ok(cur.opacity > 0.95);
  assert.equal(cur.trail.length, 0, "Stardust motes should cleanly decay");
});

test("astralCursorState magnetizes onto hovered stars, compresses on drag, and emits click pulses", () => {
  const cur = createAstralCursorState();
  updateAstralCursorPointer(cur, 300, 300, "mouse");
  setAstralCursorHover(cur, { x: 320, y: 310, radius: 18 });

  for (let i = 0; i < 20; i += 1) {
    stepAstralCursor(cur, 0.03);
  }
  assert.ok(cur.lockBlend > 0.85, "Hovering a star should engage magnetic lock-on");
  assert.ok(cur.ringRadius > 26, "Astrolabe ring should expand to embrace the star");
  assert.ok(cur.ringX > 310, "Reticle should pull smoothly toward hovered star center");

  // Dragging clears star lock and compresses reticle into pan grip
  setAstralCursorDragging(cur, true);
  triggerAstralCursorClick(cur);
  assert.equal(cur.pulses.length, 1);

  for (let i = 0; i < 20; i += 1) {
    stepAstralCursor(cur, 0.03);
  }
  assert.ok(cur.dragBlend > 0.85);
  assert.ok(cur.ringRadius < 13, "Dragging should compress reticle into cozy pan ring");
  assert.equal(cur.pulses.length, 0, "Click pulse should finish cleanly");

  // Leaving fades opacity back to 0
  clearAstralCursor(cur);
  for (let i = 0; i < 30; i += 1) {
    stepAstralCursor(cur, 0.03);
  }
  assert.equal(cur.opacity, 0);
});

test("astralCursorState clamps lag and relaxes magnetic snag during fast sweeps", () => {
  const cur = createAstralCursorState();
  updateAstralCursorPointer(cur, 100, 100, "mouse");
  setAstralCursorHover(cur, { x: 120, y: 100, radius: 18 });

  // Simulate a rapid high-speed flick across the star chart
  updateAstralCursorPointer(cur, 500, 260, "mouse");
  stepAstralCursor(cur, 0.016);

  const lag = Math.hypot(cur.ringX - cur.rawX, cur.ringY - cur.rawY);
  assert.ok(
    lag <= 22.5,
    `Reticle lag (${lag.toFixed(1)}px) must stay tightly clamped during fast sweeps`,
  );
  assert.ok(cur.trail.length <= 2, "Fast single sweep should cap trail spawns to prevent stalls");
});
