export interface AstralCursorTrailDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  tint: "gold" | "accent" | "white";
}

export interface AstralCursorPulse {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export interface AstralCursorLockTarget {
  x: number;
  y: number;
  radius: number;
}

export interface AstralCursorState {
  /** Whether the mouse/pen pointer is actively inside the star chart canvas */
  active: boolean;
  /** Smooth 0..1 fade so entering/leaving the chart feels comfy */
  opacity: number;
  /** Exact instantaneous pointer coordinates (zero input lag) */
  rawX: number;
  rawY: number;
  /** Smoothly spring-damped astrolabe reticle coordinates */
  ringX: number;
  ringY: number;
  /** Smooth outer reticle radius in CSS pixels */
  ringRadius: number;
  /** 0..1 blend toward locked star target */
  lockBlend: number;
  /** 0..1 blend toward panning/dragging state */
  dragBlend: number;
  /** Whether the user is currently drag-panning */
  isDragging: boolean;
  /** Active hovered star lock target (screen coordinates) */
  lockTarget: AstralCursorLockTarget | null;
  /** Continuous slow astrolabe rotation angle */
  angle: number;
  /** Distance accumulator for spawning gentle stardust motes */
  trailCarry: number;
  trail: AstralCursorTrailDot[];
  pulses: AstralCursorPulse[];
  lastTrailSeed: number;
}

const MAX_TRAIL_DOTS = 22;
const MAX_PULSES = 6;
const IDLE_RING_RADIUS = 16;
const DRAG_RING_RADIUS = 11;

export function createAstralCursorState(): AstralCursorState {
  return {
    active: false,
    opacity: 0,
    rawX: 0,
    rawY: 0,
    ringX: 0,
    ringY: 0,
    ringRadius: IDLE_RING_RADIUS,
    lockBlend: 0,
    dragBlend: 0,
    isDragging: false,
    lockTarget: null,
    angle: 0,
    trailCarry: 0,
    trail: [],
    pulses: [],
    lastTrailSeed: 1337,
  };
}

function nextPseudoRand(state: AstralCursorState): number {
  state.lastTrailSeed =
    (Math.imul(state.lastTrailSeed, 1664525) + 1013904223) >>> 0;
  return state.lastTrailSeed / 4294967295;
}

/**
 * Updates pointer coordinates on mouse/pen movement.
 * Touch pointers are ignored so mobile/tablet taps stay clean and uncluttered.
 */
export function updateAstralCursorPointer(
  state: AstralCursorState,
  x: number,
  y: number,
  pointerType = "mouse",
): boolean {
  if (pointerType === "touch") {
    state.active = false;
    state.lockTarget = null;
    return false;
  }

  const wasActive = state.active;
  const dx = x - state.rawX;
  const dy = y - state.rawY;
  const dist = Math.hypot(dx, dy);

  state.rawX = x;
  state.rawY = y;
  state.active = true;

  if (!wasActive) {
    state.ringX = x;
    state.ringY = y;
    state.trailCarry = 0;
    return true;
  }

  // Spawn soft, cozy stardust motes along smooth pointer motion
  state.trailCarry += Math.min(dist, 64);
  const spacing = state.isDragging ? 14 : 18;
  while (state.trailCarry >= spacing) {
    state.trailCarry -= spacing;
    const r1 = nextPseudoRand(state);
    const r2 = nextPseudoRand(state);
    const r3 = nextPseudoRand(state);
    const tint = r3 > 0.62 ? "gold" : r3 > 0.25 ? "accent" : "white";
    state.trail.push({
      x: x + (r1 - 0.5) * 6,
      y: y + (r2 - 0.5) * 6,
      vx: -dx * 0.08 + (r1 - 0.5) * 14,
      vy: -dy * 0.08 - 6 + (r2 - 0.5) * 10,
      life: 0.44 + r3 * 0.2,
      maxLife: 0.44 + r3 * 0.2,
      r: 1.3 + r1 * 1.6,
      tint,
    });
    if (state.trail.length > MAX_TRAIL_DOTS) {
      state.trail.shift();
    }
  }

  return true;
}

export function setAstralCursorHover(
  state: AstralCursorState,
  target: AstralCursorLockTarget | null,
): void {
  state.lockTarget = target;
}

export function setAstralCursorDragging(
  state: AstralCursorState,
  dragging: boolean,
): void {
  state.isDragging = dragging;
  if (dragging) {
    state.lockTarget = null;
  }
}

export function triggerAstralCursorClick(state: AstralCursorState): void {
  if (!state.active) return;
  state.pulses.push({
    x: state.rawX,
    y: state.rawY,
    life: 0.42,
    maxLife: 0.42,
  });
  if (state.pulses.length > MAX_PULSES) {
    state.pulses.shift();
  }
}

export function clearAstralCursor(state: AstralCursorState): void {
  state.active = false;
  state.isDragging = false;
  state.lockTarget = null;
}

/**
 * Advances spring smoothing, magnetic star lock-on, orbital spin,
 * stardust trail decay, and click ripple pulses by `dt` seconds.
 */
export function stepAstralCursor(state: AstralCursorState, dt: number): void {
  const safeDt = Math.max(0, Math.min(0.05, dt));

  // Smooth fade in/out when entering or leaving the star chart
  const targetOpacity = state.active ? 1 : 0;
  state.opacity += (targetOpacity - state.opacity) * Math.min(1, safeDt * 14);
  if (!state.active && state.opacity < 0.01) {
    state.opacity = 0;
  }

  const targetLock = state.active && !state.isDragging && state.lockTarget ? 1 : 0;
  const targetDrag = state.active && state.isDragging ? 1 : 0;
  state.lockBlend += (targetLock - state.lockBlend) * Math.min(1, safeDt * 13);
  state.dragBlend += (targetDrag - state.dragBlend) * Math.min(1, safeDt * 16);

  // Outer astrolabe reticle smoothly glides behind cursor, or magnetizes to hovered star!
  const desiredX =
    state.lockTarget && !state.isDragging
      ? state.rawX + (state.lockTarget.x - state.rawX) * 0.72
      : state.rawX;
  const desiredY =
    state.lockTarget && !state.isDragging
      ? state.rawY + (state.lockTarget.y - state.rawY) * 0.72
      : state.rawY;

  const followRate = state.isDragging ? 24 : state.lockTarget ? 16 : 15;
  const followAlpha = Math.min(1, safeDt * followRate);
  state.ringX += (desiredX - state.ringX) * followAlpha;
  state.ringY += (desiredY - state.ringY) * followAlpha;

  const desiredRadius = state.isDragging
    ? DRAG_RING_RADIUS
    : state.lockTarget
      ? Math.max(24, state.lockTarget.radius + 14)
      : IDLE_RING_RADIUS;
  state.ringRadius += (desiredRadius - state.ringRadius) * Math.min(1, safeDt * 14);

  // Comfy slow astrolabe drift, speeding up gently when locked onto a star
  const spinSpeed = 0.55 + state.lockBlend * 0.95 - state.dragBlend * 0.25;
  state.angle = (state.angle + safeDt * spinSpeed) % (Math.PI * 2);

  // Decay stardust trail motes
  for (let i = state.trail.length - 1; i >= 0; i -= 1) {
    const dot = state.trail[i];
    dot.x += dot.vx * safeDt;
    dot.y += dot.vy * safeDt;
    dot.vx *= 0.94;
    dot.vy *= 0.94;
    dot.life -= safeDt;
    if (dot.life <= 0) {
      state.trail.splice(i, 1);
    }
  }

  // Decay click ripple pulses
  for (let i = state.pulses.length - 1; i >= 0; i -= 1) {
    const pulse = state.pulses[i];
    pulse.life -= safeDt;
    if (pulse.life <= 0) {
      state.pulses.splice(i, 1);
    }
  }
}
