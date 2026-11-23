export type LoftCatActivity =
  | "lounge"
  | "coding"
  | "arcade"
  | "window"
  | "music";

export type LoftCatPhase = "staying" | "walking";

export interface LoftPoint3D {
  u: number;
  v: number;
  z: number;
}

export interface LoftCatStation extends LoftPoint3D {
  id: LoftCatActivity;
  stayDurationSec: number;
  petToast: string;
  hudTag: string;
}

/**
 * Obstacle-free grounded stations in the 2.5D isometric Dev Loft.
 * Coordinates align cleanly with LOFT_GROUNDED_FURNITURE in loftGeometry.ts.
 */
export const LOFT_CAT_STATIONS: Record<LoftCatActivity, LoftCatStation> = {
  lounge: {
    id: "lounge",
    u: 0.43,
    v: 0.74,
    z: 0.025,
    stayDurationSec: 8.5,
    petToast: "LOFT CAT PURRS ON ITS CUSHION (^ ω ^)",
    hudTag: "COZY CUSHION NAP",
  },
  coding: {
    id: "coding",
    u: 0.305,
    v: 0.365,
    z: 0.268,
    stayDurationSec: 10.0,
    petToast: "CAT IS SHIPPING CLEAN PYTHON AT YOUR DESK!",
    hudTag: "CODING AT DESK",
  },
  arcade: {
    id: "arcade",
    u: 0.765,
    v: 0.345,
    z: 0.255,
    stayDurationSec: 9.5,
    petToast: "CAT IS GOING FOR A HIGH SCORE AT THE ARCADE!",
    hudTag: "PLAYING ARCADE",
  },
  window: {
    id: "window",
    u: 0.048,
    v: 0.54,
    z: 0.455,
    stayDurationSec: 9.5,
    petToast: "CAT IS PERCHED ON THE WINDOWSILL WATCHING THE SKY...",
    hudTag: "WINDOWSILL PERCH",
  },
  music: {
    id: "music",
    u: 0.61,
    v: 0.68,
    z: 0.01,
    stayDurationSec: 9.5,
    petToast: "CAT IS VIBING TO LO-FI BEATS ♪♫",
    hudTag: "LISTENING TO LO-FI",
  },
};

/** Varied cozy daily routine so the cat visits every station naturally */
export const LOFT_CAT_ROUTINE: readonly LoftCatActivity[] = [
  "coding",
  "window",
  "arcade",
  "music",
  "lounge",
  "window",
  "coding",
  "music",
  "arcade",
] as const;

const ROOM_HUB: LoftPoint3D = { u: 0.48, v: 0.58, z: 0.01 };
const CHAIR_STEP_OFF: LoftPoint3D = { u: 0.42, v: 0.50, z: 0.01 };
const ARCADE_STEP_OFF: LoftPoint3D = { u: 0.68, v: 0.44, z: 0.01 };
const WINDOW_STEP_OFF: LoftPoint3D = { u: 0.16, v: 0.54, z: 0.01 };

export interface LoftCatState {
  activity: LoftCatActivity;
  targetActivity: LoftCatActivity;
  phase: LoftCatPhase;
  u: number;
  v: number;
  z: number;
  /** Extra vertical hop height during chair mount/dismount */
  hopZ: number;
  /** Facing direction in screen X (-1 = left, 1 = right) */
  facingX: -1 | 1;
  walkPhase: number;
  stayTimer: number;
  routineIndex: number;
  waypoints: LoftPoint3D[];
  segmentStart: LoftPoint3D;
  segmentProgress: number;
  segmentDuration: number;
  segmentIsHop: boolean;
}

export function createInitialLoftCatState(): LoftCatState {
  const start = LOFT_CAT_STATIONS.lounge;
  return {
    activity: "lounge",
    targetActivity: "lounge",
    phase: "staying",
    u: start.u,
    v: start.v,
    z: start.z,
    hopZ: 0,
    facingX: 1,
    walkPhase: 0,
    // Start moving to its first adventure quickly (4.2s) so the loft feels alive right away!
    stayTimer: 4.2,
    routineIndex: 0,
    waypoints: [],
    segmentStart: { u: start.u, v: start.v, z: start.z },
    segmentProgress: 1,
    segmentDuration: 1,
    segmentIsHop: false,
  };
}

/**
 * Builds an obstacle-free waypoint sequence across the isometric loft floorboards,
 * using a staging step beside the desk chair so the cat hops cleanly onto/off the seat.
 */
export function buildLoftCatWaypoints(
  fromPos: LoftPoint3D,
  fromActivity: LoftCatActivity,
  toActivity: LoftCatActivity,
): LoftPoint3D[] {
  const dest = LOFT_CAT_STATIONS[toActivity];
  const points: LoftPoint3D[] = [];

  // Hop cleanly off desk chair, arcade step-stool, or windowsill perch onto the floor first
  if (fromActivity === "coding" && fromPos.z > 0.08) {
    points.push({ ...CHAIR_STEP_OFF });
  } else if (fromActivity === "arcade" && fromPos.z > 0.08) {
    points.push({ ...ARCADE_STEP_OFF });
  } else if (fromActivity === "window" && fromPos.z > 0.08) {
    points.push({ ...WINDOW_STEP_OFF });
  }

  const lastStart = points.length > 0 ? points[points.length - 1] : fromPos;
  const distDirect = Math.hypot(dest.u - lastStart.u, dest.v - lastStart.v);

  // Route through the open central rug corridor for cross-room walks so furniture is never clipped
  if (
    distDirect > 0.42 &&
    toActivity !== "coding" &&
    toActivity !== "arcade" &&
    toActivity !== "window"
  ) {
    const distToHub = Math.hypot(
      ROOM_HUB.u - lastStart.u,
      ROOM_HUB.v - lastStart.v,
    );
    const hubToDest = Math.hypot(dest.u - ROOM_HUB.u, dest.v - ROOM_HUB.v);
    if (distToHub > 0.08 && hubToDest > 0.08) {
      points.push({ ...ROOM_HUB });
    }
  }

  // Stage beside elevated stations (desk chair, arcade stool, windowsill) before leaping up
  if (toActivity === "coding") {
    const distStep = Math.hypot(
      CHAIR_STEP_OFF.u - lastStart.u,
      CHAIR_STEP_OFF.v - lastStart.v,
    );
    if (distStep > 0.06) {
      points.push({ ...CHAIR_STEP_OFF });
    }
  } else if (toActivity === "arcade") {
    const distStep = Math.hypot(
      ARCADE_STEP_OFF.u - lastStart.u,
      ARCADE_STEP_OFF.v - lastStart.v,
    );
    if (distStep > 0.06) {
      points.push({ ...ARCADE_STEP_OFF });
    }
  } else if (toActivity === "window") {
    const distStep = Math.hypot(
      WINDOW_STEP_OFF.u - lastStart.u,
      WINDOW_STEP_OFF.v - lastStart.v,
    );
    if (distStep > 0.06) {
      points.push({ ...WINDOW_STEP_OFF });
    }
  }

  points.push({ u: dest.u, v: dest.v, z: dest.z });
  return points;
}

function beginNextSegment(cat: LoftCatState): void {
  const next = cat.waypoints[0];
  if (!next) {
    const arrived = LOFT_CAT_STATIONS[cat.targetActivity];
    cat.activity = cat.targetActivity;
    cat.phase = "staying";
    cat.u = arrived.u;
    cat.v = arrived.v;
    cat.z = arrived.z;
    cat.hopZ = 0;
    cat.stayTimer = arrived.stayDurationSec;
    cat.segmentIsHop = false;
    return;
  }

  cat.segmentStart = { u: cat.u, v: cat.v, z: cat.z };
  cat.segmentProgress = 0;
  const dist2D = Math.hypot(next.u - cat.u, next.v - cat.v);
  const deltaZ = Math.abs(next.z - cat.z);
  cat.segmentIsHop = deltaZ > 0.06;
  // Crisp cozy trot speed (~0.24 iso units/sec) or snappy 0.55s chair hop
  cat.segmentDuration = cat.segmentIsHop
    ? 0.58
    : Math.max(0.45, dist2D / 0.23);

  // Compute screen-space horizontal delta in isometric projection: dx ~ (du - dv)
  const isoScreenDx = (next.u - cat.u) - (next.v - cat.v);
  if (Math.abs(isoScreenDx) > 0.015) {
    cat.facingX = isoScreenDx >= 0 ? 1 : -1;
  }
}

export function commandLoftCatTo(
  cat: LoftCatState,
  nextActivity: LoftCatActivity,
): void {
  if (cat.phase === "staying" && cat.activity === nextActivity) {
    cat.stayTimer = Math.max(cat.stayTimer, 5.5);
    return;
  }
  const currentPos: LoftPoint3D = { u: cat.u, v: cat.v, z: cat.z };
  cat.targetActivity = nextActivity;
  cat.phase = "walking";
  cat.waypoints = buildLoftCatWaypoints(currentPos, cat.activity, nextActivity);
  beginNextSegment(cat);
}

/**
 * Advances the autonomous loft cat state machine by `dt` seconds.
 * Returns `{ arrivedActivity }` on the exact tick the cat settles into a new station.
 */
export function stepLoftCat(
  cat: LoftCatState,
  dt: number,
): { arrivedActivity: LoftCatActivity | null } {
  const safeDt = Math.max(0, Math.min(0.1, dt));

  if (cat.phase === "staying") {
    cat.hopZ = 0;
    cat.stayTimer -= safeDt;
    if (cat.stayTimer <= 0) {
      let nextAct = LOFT_CAT_ROUTINE[cat.routineIndex % LOFT_CAT_ROUTINE.length];
      cat.routineIndex = (cat.routineIndex + 1) % LOFT_CAT_ROUTINE.length;
      if (nextAct === cat.activity) {
        nextAct = LOFT_CAT_ROUTINE[cat.routineIndex % LOFT_CAT_ROUTINE.length];
        cat.routineIndex = (cat.routineIndex + 1) % LOFT_CAT_ROUTINE.length;
      }
      commandLoftCatTo(cat, nextAct);
    }
    return { arrivedActivity: null };
  }

  // Walking / hopping phase
  const targetPt = cat.waypoints[0];
  if (!targetPt) {
    const arrived = cat.targetActivity;
    beginNextSegment(cat);
    return { arrivedActivity: arrived };
  }

  cat.segmentProgress = Math.min(
    1,
    cat.segmentProgress + safeDt / Math.max(0.05, cat.segmentDuration),
  );
  const p = cat.segmentProgress;
  // Smooth ease-in-out on hops, gentle linear-eased trot across floor
  const e = cat.segmentIsHop ? p * p * (3 - 2 * p) : p;

  cat.u = cat.segmentStart.u + (targetPt.u - cat.segmentStart.u) * e;
  cat.v = cat.segmentStart.v + (targetPt.v - cat.segmentStart.v) * e;
  cat.z = cat.segmentStart.z + (targetPt.z - cat.segmentStart.z) * e;
  cat.hopZ = cat.segmentIsHop
    ? Math.sin(p * Math.PI) * (Math.abs(targetPt.z - cat.segmentStart.z) > 0.25 ? 0.18 : 0.14)
    : 0;
  cat.walkPhase += safeDt * (cat.segmentIsHop ? 6.0 : 12.5);

  if (cat.segmentProgress >= 1) {
    cat.u = targetPt.u;
    cat.v = targetPt.v;
    cat.z = targetPt.z;
    cat.hopZ = 0;
    cat.waypoints.shift();
    if (cat.waypoints.length === 0) {
      const arrived = cat.targetActivity;
      beginNextSegment(cat);
      return { arrivedActivity: arrived };
    }
    beginNextSegment(cat);
  }

  return { arrivedActivity: null };
}
