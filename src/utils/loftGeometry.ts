import type { StudioPaletteId, ThemeMode } from "../constants/theme";

export type LoftHighlightZone =
  | "roadmap"
  | "studio"
  | "arcade"
  | "algolab"
  | "cat"
  | null;

export interface IsoMetrics {
  cx: number;
  cy: number;
  halfW: number;
  halfH: number;
  wallH: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface IsoBoxSpec {
  id: string;
  u0: number;
  v0: number;
  z0: number;
  du: number;
  dv: number;
  dz: number;
}

export interface LoftThemeColors {
  backdropStart: string;
  backdropEnd: string;
  wallLeft: string;
  wallRight: string;
  wallEdge: string;
  baseboard: string;
  floorBase: string;
  floorPlank: string;
  floorRim: string;
  skyTop: string;
  skyMid: string;
  skyGlow: string;
  accent: string;
  accentSecondary: string;
  accentPink: string;
  accentCyan: string;
  bonsaiLeaf: string;
  bonsaiLeafHi: string;
  bonsaiBlossom: string;
  rugBase: string;
  rugStripe: string;
  lampGlowRgba: string;
}

export function computeIsoMetrics(
  width: number,
  height: number,
  parallaxX = 0,
  parallaxY = 0,
): IsoMetrics {
  const safeW = Math.max(260, width);
  const safeH = Math.max(220, height);
  // Fit the full 3D cutaway loft cleanly inside the stage with breathing margin
  const halfW = Math.min(safeW * 0.415, safeH * 0.62);
  const halfH = halfW * 0.485;
  const wallH = halfW * 0.64;
  const cx = safeW * 0.5 - parallaxX;
  const cy = safeH * 0.445 - parallaxY;
  return { cx, cy, halfW, halfH, wallH };
}

/**
 * Projects normalized room coordinates (u, v in [0..1], z >= 0 height above floor)
 * into 2D isometric canvas coordinates.
 * - u = 0..1 goes down-right along the Right-Back Wall
 * - v = 0..1 goes down-left along the Left-Back Wall
 * - z = 0 is the exact loft floor plane
 */
export function projectIso(
  m: IsoMetrics,
  u: number,
  v: number,
  z = 0,
): Point2D {
  return {
    x: m.cx + (u - v) * m.halfW,
    y: m.cy + (u + v) * m.halfH - z * m.wallH,
  };
}

export function pointInPolygon(pt: Point2D, poly: readonly Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Grounded floor furniture specs — every primary piece rests directly on z0 = 0
 * so nothing in the room ever floats above the floorboards.
 */
export const LOFT_GROUNDED_FURNITURE: Record<string, IsoBoxSpec> = {
  desk: { id: "desk", u0: 0.08, v0: 0.06, z0: 0, du: 0.50, dv: 0.28, dz: 0.28 },
  pcTower: { id: "pcTower", u0: 0.46, v0: 0.08, z0: 0, du: 0.095, dv: 0.17, dz: 0.22 },
  chair: { id: "chair", u0: 0.25, v0: 0.37, z0: 0, du: 0.14, dv: 0.14, dz: 0.34 },
  bonsaiStand: { id: "bonsaiStand", u0: 0.05, v0: 0.74, z0: 0, du: 0.15, dv: 0.15, dz: 0.17 },
  arcadeCabinet: { id: "arcadeCabinet", u0: 0.67, v0: 0.06, z0: 0, du: 0.22, dv: 0.20, dz: 0.64 },
  recordTable: { id: "recordTable", u0: 0.72, v0: 0.54, z0: 0, du: 0.18, dv: 0.18, dz: 0.18 },
};

/** Exact left-wall recessed window glass bounds (u = 0 plane) */
export const LOFT_WINDOW_GLASS = {
  u: 0,
  vMin: 0.18,
  vMax: 0.68,
  zMin: 0.36,
  zMax: 0.84,
} as const;

export function getWindowGlassPolygon(m: IsoMetrics): Point2D[] {
  const { u, vMin, vMax, zMin, zMax } = LOFT_WINDOW_GLASS;
  return [
    projectIso(m, u, vMin, zMax),
    projectIso(m, u, vMax, zMax),
    projectIso(m, u, vMax, zMin),
    projectIso(m, u, vMin, zMin),
  ];
}

export function getLoftThemeColors(
  paletteId: StudioPaletteId,
  themeMode: ThemeMode,
): LoftThemeColors {
  const isLight = themeMode === "light";

  switch (paletteId) {
    case "matcha":
      return {
        backdropStart: isLight ? "#D7E8D8" : "#0D1510",
        backdropEnd: isLight ? "#BBD6BD" : "#060B08",
        wallLeft: isLight ? "#2E4735" : "#1C2E22",
        wallRight: isLight ? "#24392A" : "#142219",
        wallEdge: "#111A14",
        baseboard: "#2D3B2F",
        floorBase: isLight ? "#4A3A2C" : "#252B1F",
        floorPlank: "rgba(255, 248, 220, 0.07)",
        floorRim: "#131710",
        skyTop: "#0B1B15",
        skyMid: "#1B3F2E",
        skyGlow: "#86EFAC",
        accent: "#B8FF3B",
        accentSecondary: "#FDE68A",
        accentPink: "#FF90E8",
        accentCyan: "#6EE7B7",
        bonsaiLeaf: "#4ADE80",
        bonsaiLeafHi: "#B8FF3B",
        bonsaiBlossom: "#FEF08A",
        rugBase: "#24392B",
        rugStripe: "#B8FF3B",
        lampGlowRgba: "rgba(253, 230, 138, ",
      };
    case "amber":
      return {
        backdropStart: isLight ? "#EBDAC5" : "#140E09",
        backdropEnd: isLight ? "#D9BE9E" : "#090604",
        wallLeft: isLight ? "#4B3525" : "#2E2016",
        wallRight: isLight ? "#3B281B" : "#221710",
        wallEdge: "#160F0A",
        baseboard: "#473120",
        floorBase: isLight ? "#5B3E2A" : "#302116",
        floorPlank: "rgba(255, 230, 185, 0.08)",
        floorRim: "#1A110B",
        skyTop: "#140B08",
        skyMid: "#3E2014",
        skyGlow: "#FB923C",
        accent: "#FFDE59",
        accentSecondary: "#FB923C",
        accentPink: "#FDA4AF",
        accentCyan: "#38BDF8",
        bonsaiLeaf: "#F59E0B",
        bonsaiLeafHi: "#FDE047",
        bonsaiBlossom: "#FB7185",
        rugBase: "#422719",
        rugStripe: "#FFDE59",
        lampGlowRgba: "rgba(255, 200, 95, ",
      };
    case "sakura":
      return {
        backdropStart: isLight ? "#E7D5F0" : "#120C1A",
        backdropEnd: isLight ? "#D2B7E3" : "#08050D",
        wallLeft: isLight ? "#3D2954" : "#281A3B",
        wallRight: isLight ? "#2E1E42" : "#1E132D",
        wallEdge: "#130C1E",
        baseboard: "#3C2952",
        floorBase: isLight ? "#4A3647" : "#261B33",
        floorPlank: "rgba(255, 224, 248, 0.07)",
        floorRim: "#140E1C",
        skyTop: "#110922",
        skyMid: "#36194E",
        skyGlow: "#FF90E8",
        accent: "#FF90E8",
        accentSecondary: "#FFDE59",
        accentPink: "#F472B6",
        accentCyan: "#38BDF8",
        bonsaiLeaf: "#F472B6",
        bonsaiLeafHi: "#FBCFE8",
        bonsaiBlossom: "#FFF1F8",
        rugBase: "#3A224D",
        rugStripe: "#FF90E8",
        lampGlowRgba: "rgba(255, 210, 140, ",
      };
    case "arcade":
    default:
      return {
        backdropStart: isLight ? "#D5E0EE" : "#0D121D",
        backdropEnd: isLight ? "#BCCCE0" : "#06090F",
        wallLeft: isLight ? "#2B3854" : "#1C243B",
        wallRight: isLight ? "#222D45" : "#151B2E",
        wallEdge: "#0E1321",
        baseboard: "#2C3754",
        floorBase: isLight ? "#463830" : "#222536",
        floorPlank: "rgba(255, 255, 255, 0.06)",
        floorRim: "#111420",
        skyTop: "#091026",
        skyMid: "#1C2452",
        skyGlow: "#34D399",
        accent: "#6EE7B7",
        accentSecondary: "#FFDE59",
        accentPink: "#FF90E8",
        accentCyan: "#38BDF8",
        bonsaiLeaf: "#34D399",
        bonsaiLeafHi: "#A7F3D0",
        bonsaiBlossom: "#FFDE59",
        rugBase: "#242D47",
        rugStripe: "#FFDE59",
        lampGlowRgba: "rgba(255, 222, 110, ",
      };
  }
}
