export interface RadarBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export type ConstellationSegment = readonly [number, number, number, number];
export type ConstellationPoint = readonly [number, number];

export interface ConstellationFigure {
  chapterId: number;
  latinName: string;
  englishName: string;
  /** Normalized line segments in [-1..1] around chapter center */
  segments: readonly ConstellationSegment[];
  /** Optional soft translucent facet polygons rendered when chapter is awakened */
  fillPolys: readonly (readonly ConstellationPoint[])[];
  /** Key vertex glint stars along the constellation silhouette */
  glints: readonly ConstellationPoint[];
}

export interface SupernovaFx {
  originId: string;
  originX: number;
  originY: number;
  targetId: string | null;
  targetX: number;
  targetY: number;
  ctrlX: number;
  ctrlY: number;
  elapsed: number;
  duration: number;
  arrivalTriggered: boolean;
  color: string;
}

export interface ChapterAwakeningFx {
  chapterId: number;
  cx: number;
  cy: number;
  radius: number;
  elapsed: number;
  duration: number;
}

/**
 * 7 bespoke geometric planetarium constellation figures — one per chapter.
 * Coordinates live in normalized [-1..1] space and scale smoothly to cluster.radius.
 */
export const CONSTELLATION_FIGURES: readonly ConstellationFigure[] = [
  {
    chapterId: 1,
    latinName: "SERPENS",
    englishName: "The Coiled Serpent",
    segments: [
      // Faceted serpent head (upper right)
      [0.42, -0.52, 0.66, -0.42],
      [0.66, -0.42, 0.48, -0.26],
      [0.48, -0.26, 0.34, -0.38],
      [0.34, -0.38, 0.42, -0.52],
      // Delicate forked starlight tongue
      [0.66, -0.42, 0.80, -0.48],
      [0.66, -0.42, 0.78, -0.34],
      // Sweeping S-coiled spine
      [0.34, -0.38, 0.04, -0.48],
      [0.04, -0.48, -0.34, -0.32],
      [-0.34, -0.32, -0.54, -0.06],
      [-0.54, -0.06, -0.30, 0.14],
      [-0.30, 0.14, 0.18, 0.10],
      [0.18, 0.10, 0.46, 0.28],
      [0.46, 0.28, 0.26, 0.54],
      [0.26, 0.54, -0.22, 0.56],
      [-0.22, 0.56, -0.62, 0.42],
      // Secondary geometric scale ribs
      [-0.34, -0.32, -0.08, -0.16],
      [-0.08, -0.16, 0.18, 0.10],
      [0.18, 0.10, 0.02, 0.34],
      [0.02, 0.34, -0.22, 0.56],
    ],
    fillPolys: [
      [
        [0.42, -0.52],
        [0.66, -0.42],
        [0.48, -0.26],
        [0.34, -0.38],
      ],
      [
        [-0.34, -0.32],
        [0.04, -0.48],
        [-0.08, -0.16],
      ],
      [
        [-0.30, 0.14],
        [0.18, 0.10],
        [0.02, 0.34],
      ],
    ],
    glints: [
      [0.66, -0.42],
      [0.04, -0.48],
      [-0.54, -0.06],
      [0.46, 0.28],
      [-0.62, 0.42],
    ],
  },
  {
    chapterId: 2,
    latinName: "CLAVIS",
    englishName: "The Celestial Key",
    segments: [
      // Ornate diamond bow (left)
      [-0.70, 0.0, -0.46, -0.28],
      [-0.46, -0.28, -0.22, 0.0],
      [-0.22, 0.0, -0.46, 0.28],
      [-0.46, 0.28, -0.70, 0.0],
      // Inner jewel facet
      [-0.56, 0.0, -0.46, -0.12],
      [-0.46, -0.12, -0.36, 0.0],
      [-0.36, 0.0, -0.46, 0.12],
      [-0.46, 0.12, -0.56, 0.0],
      // Long starlight key shaft
      [-0.22, 0.0, 0.66, 0.0],
      // Twin geometric key wards (right)
      [0.36, 0.0, 0.36, 0.26],
      [0.36, 0.26, 0.48, 0.26],
      [0.58, 0.0, 0.58, 0.34],
      [0.58, 0.34, 0.70, 0.22],
      [0.66, 0.0, 0.74, -0.12],
      // Decorative celestial balance wings above shaft
      [-0.04, 0.0, 0.16, -0.26],
      [0.16, -0.26, 0.36, 0.0],
    ],
    fillPolys: [
      [
        [-0.70, 0.0],
        [-0.46, -0.28],
        [-0.22, 0.0],
        [-0.46, 0.28],
      ],
      [
        [-0.04, 0.0],
        [0.16, -0.26],
        [0.36, 0.0],
      ],
    ],
    glints: [
      [-0.70, 0.0],
      [-0.46, -0.28],
      [0.16, -0.26],
      [0.66, 0.0],
      [0.58, 0.34],
    ],
  },
  {
    chapterId: 3,
    latinName: "SCUTUM",
    englishName: "The Aegis Prism",
    segments: [
      // Outer hexagonal aegis shield
      [0.0, -0.62, 0.50, -0.34],
      [0.50, -0.34, 0.44, 0.22],
      [0.44, 0.22, 0.0, 0.64],
      [0.0, 0.64, -0.44, 0.22],
      [-0.44, 0.22, -0.50, -0.34],
      [-0.50, -0.34, 0.0, -0.62],
      // Inner crystalline octahedron prism
      [0.0, -0.34, 0.26, 0.0],
      [0.26, 0.0, 0.0, 0.34],
      [0.0, 0.34, -0.26, 0.0],
      [-0.26, 0.0, 0.0, -0.34],
      // Structural prism facets
      [0.0, -0.62, 0.0, -0.34],
      [0.0, 0.34, 0.0, 0.64],
      [-0.50, -0.34, -0.26, 0.0],
      [0.50, -0.34, 0.26, 0.0],
      [-0.26, 0.0, 0.26, 0.0],
    ],
    fillPolys: [
      [
        [0.0, -0.62],
        [0.50, -0.34],
        [0.44, 0.22],
        [0.0, 0.64],
        [-0.44, 0.22],
        [-0.50, -0.34],
      ],
      [
        [0.0, -0.34],
        [0.26, 0.0],
        [0.0, 0.34],
        [-0.26, 0.0],
      ],
    ],
    glints: [
      [0.0, -0.62],
      [0.50, -0.34],
      [-0.50, -0.34],
      [0.0, 0.64],
      [0.0, 0.0],
    ],
  },
  {
    chapterId: 4,
    latinName: "SAGITTA",
    englishName: "The Comet Arrow",
    segments: [
      // Main diagonal swift arrow shaft
      [-0.64, 0.44, 0.64, -0.44],
      // Sharp swept arrowhead (upper right)
      [0.64, -0.44, 0.28, -0.46],
      [0.64, -0.44, 0.48, -0.10],
      [0.28, -0.46, 0.38, -0.26],
      [0.48, -0.10, 0.38, -0.26],
      // Swept comet wings mid-shaft
      [-0.08, 0.06, -0.36, -0.32],
      [-0.36, -0.32, 0.14, -0.10],
      [0.06, -0.04, 0.38, 0.30],
      [0.38, 0.30, -0.14, 0.10],
      // Tail fletching feathers (lower left)
      [-0.64, 0.44, -0.74, 0.22],
      [-0.64, 0.44, -0.42, 0.56],
      [-0.46, 0.32, -0.56, 0.10],
      [-0.46, 0.32, -0.24, 0.44],
    ],
    fillPolys: [
      [
        [0.64, -0.44],
        [0.28, -0.46],
        [0.38, -0.26],
        [0.48, -0.10],
      ],
      [
        [-0.08, 0.06],
        [-0.36, -0.32],
        [0.14, -0.10],
      ],
      [
        [0.06, -0.04],
        [0.38, 0.30],
        [-0.14, 0.10],
      ],
    ],
    glints: [
      [0.64, -0.44],
      [-0.36, -0.32],
      [0.38, 0.30],
      [-0.64, 0.44],
    ],
  },
  {
    chapterId: 5,
    latinName: "PYXIS",
    englishName: "The Star Compass",
    segments: [
      // 4-point primary compass rose star
      [0.0, -0.68, 0.16, -0.16],
      [0.16, -0.16, 0.68, 0.0],
      [0.68, 0.0, 0.16, 0.16],
      [0.16, 0.16, 0.0, 0.68],
      [0.0, 0.68, -0.16, 0.16],
      [-0.16, 0.16, -0.68, 0.0],
      [-0.68, 0.0, -0.16, -0.16],
      [-0.16, -0.16, 0.0, -0.68],
      // Secondary diagonal compass needles
      [0.16, -0.16, 0.42, -0.42],
      [0.16, 0.16, 0.42, 0.42],
      [-0.16, 0.16, -0.42, 0.42],
      [-0.16, -0.16, -0.42, -0.42],
      // Inner cross axes
      [0.0, -0.68, 0.0, 0.68],
      [-0.68, 0.0, 0.68, 0.0],
    ],
    fillPolys: [
      [
        [0.0, -0.68],
        [0.16, -0.16],
        [0.68, 0.0],
        [0.16, 0.16],
        [0.0, 0.68],
        [-0.16, 0.16],
        [-0.68, 0.0],
        [-0.16, -0.16],
      ],
    ],
    glints: [
      [0.0, -0.68],
      [0.68, 0.0],
      [0.0, 0.68],
      [-0.68, 0.0],
      [0.42, -0.42],
      [-0.42, 0.42],
    ],
  },
  {
    chapterId: 6,
    latinName: "PHAROS",
    englishName: "The Star Lantern",
    segments: [
      // Lantern spire roof
      [0.0, -0.66, 0.24, -0.38],
      [0.0, -0.66, -0.24, -0.38],
      [-0.24, -0.38, 0.24, -0.38],
      // Glowing glass beacon chamber
      [-0.22, -0.38, -0.30, 0.06],
      [0.22, -0.38, 0.30, 0.06],
      [-0.30, 0.06, 0.30, 0.06],
      // Lantern pedestal base
      [-0.26, 0.06, -0.16, 0.56],
      [0.26, 0.06, 0.16, 0.56],
      [-0.16, 0.56, 0.16, 0.56],
      [-0.34, 0.56, 0.34, 0.56],
      // Radiant lighthouse beams
      [-0.32, -0.16, -0.70, -0.30],
      [-0.32, -0.16, -0.68, -0.02],
      [0.32, -0.16, 0.70, -0.30],
      [0.32, -0.16, 0.68, -0.02],
      // Inner flame diamond
      [0.0, -0.30, 0.10, -0.14],
      [0.10, -0.14, 0.0, -0.02],
      [0.0, -0.02, -0.10, -0.14],
      [-0.10, -0.14, 0.0, -0.30],
    ],
    fillPolys: [
      [
        [0.0, -0.66],
        [0.24, -0.38],
        [-0.24, -0.38],
      ],
      [
        [-0.22, -0.38],
        [0.22, -0.38],
        [0.30, 0.06],
        [-0.30, 0.06],
      ],
    ],
    glints: [
      [0.0, -0.66],
      [0.0, -0.16],
      [-0.70, -0.30],
      [0.70, -0.30],
      [0.0, 0.56],
    ],
  },
  {
    chapterId: 7,
    latinName: "CORONA",
    englishName: "The Celestial Crown",
    segments: [
      // Regal 5-peak star crown
      [-0.62, 0.32, -0.56, -0.26],
      [-0.56, -0.26, -0.26, 0.02],
      [-0.26, 0.02, 0.0, -0.52],
      [0.0, -0.52, 0.26, 0.02],
      [0.26, 0.02, 0.56, -0.26],
      [0.56, -0.26, 0.62, 0.32],
      // Crown band
      [-0.62, 0.32, 0.62, 0.32],
      [-0.54, 0.46, 0.54, 0.46],
      [-0.62, 0.32, -0.54, 0.46],
      [0.62, 0.32, 0.54, 0.46],
      // Crown peak jewel orbits
      [-0.26, 0.02, 0.0, 0.32],
      [0.26, 0.02, 0.0, 0.32],
      [0.0, -0.52, 0.0, -0.68],
      [-0.14, -0.58, 0.14, -0.58],
    ],
    fillPolys: [
      [
        [-0.62, 0.32],
        [-0.56, -0.26],
        [-0.26, 0.02],
        [0.0, -0.52],
        [0.26, 0.02],
        [0.56, -0.26],
        [0.62, 0.32],
      ],
    ],
    glints: [
      [0.0, -0.52],
      [-0.56, -0.26],
      [0.56, -0.26],
      [-0.62, 0.32],
      [0.62, 0.32],
    ],
  },
] as const;

export function getConstellationFigure(chapterId: number): ConstellationFigure {
  const safeIdx =
    ((Math.max(1, Math.round(chapterId)) - 1) % CONSTELLATION_FIGURES.length +
      CONSTELLATION_FIGURES.length) %
    CONSTELLATION_FIGURES.length;
  return CONSTELLATION_FIGURES[safeIdx];
}

export function createSupernovaFx(
  originId: string,
  originX: number,
  originY: number,
  target: { id: string; x: number; y: number; crossChapter?: boolean } | null,
  color: string,
): SupernovaFx {
  const targetX = target ? target.x : originX;
  const targetY = target ? target.y : originY;
  const ctrlX = (originX + targetX) * 0.5;
  const ctrlY =
    (originY + targetY) * 0.5 - (target?.crossChapter ? 30 : 18);
  return {
    originId,
    originX,
    originY,
    targetId: target ? target.id : null,
    targetX,
    targetY,
    ctrlX,
    ctrlY,
    elapsed: 0,
    duration: target ? 1.65 : 1.1,
    arrivalTriggered: !target,
    color,
  };
}

/**
 * Evaluates a Supernova's starlight comet position along the curved filament (0..1).
 * Returns null before comet launch or after arrival.
 */
export function evaluateSupernovaComet(
  fx: SupernovaFx,
): { x: number; y: number; progress: number } | null {
  if (!fx.targetId) return null;
  const launchAt = 0.22;
  const arriveAt = 1.22;
  if (fx.elapsed < launchAt || fx.elapsed > arriveAt) return null;
  const raw = (fx.elapsed - launchAt) / (arriveAt - launchAt);
  // Smooth cubic ease-in-out
  const u = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
  const omt = 1 - u;
  return {
    x: omt * omt * fx.originX + 2 * omt * u * fx.ctrlX + u * u * fx.targetX,
    y: omt * omt * fx.originY + 2 * omt * u * fx.ctrlY + u * u * fx.targetY,
    progress: u,
  };
}

export function projectRadarPoint(
  wx: number,
  wy: number,
  bounds: RadarBounds,
  radarW: number,
  radarH: number,
  pad = 10,
): { x: number; y: number } {
  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanY = Math.max(1, bounds.maxY - bounds.minY);
  const usableW = Math.max(1, radarW - pad * 2);
  const usableH = Math.max(1, radarH - pad * 2);
  const nx = (wx - bounds.minX) / spanX;
  const ny = (wy - bounds.minY) / spanY;
  return {
    x: pad + Math.max(0, Math.min(1, nx)) * usableW,
    y: pad + Math.max(0, Math.min(1, ny)) * usableH,
  };
}

export function radarPointToWorld(
  rx: number,
  ry: number,
  bounds: RadarBounds,
  radarW: number,
  radarH: number,
  pad = 10,
): { x: number; y: number } {
  const usableW = Math.max(1, radarW - pad * 2);
  const usableH = Math.max(1, radarH - pad * 2);
  const nx = Math.max(0, Math.min(1, (rx - pad) / usableW));
  const ny = Math.max(0, Math.min(1, (ry - pad) / usableH));
  return {
    x: bounds.minX + nx * (bounds.maxX - bounds.minX),
    y: bounds.minY + ny * (bounds.maxY - bounds.minY),
  };
}
