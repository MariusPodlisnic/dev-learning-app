import type { StudioPaletteId } from "../constants/theme";

export const HOLOGRAM_PARTICLE_COUNT = 26000;

export type HologramShapeId =
  | "cyber_desk"
  | "code_orrery"
  | "gamepad"
  | "neural_crown";

export interface HologramShapeData {
  positions: Float32Array;
  luminance: Float32Array;
  accentMix: Float32Array;
}

export interface HologramShapeMeta {
  id: HologramShapeId;
  shortLabel: string;
  title: string;
  subtitle: string;
}

export const HOLOGRAM_SHAPES_META: readonly HologramShapeMeta[] = [
  {
    id: "cyber_desk",
    shortLabel: "DESK",
    title: "HOLOGRAPHIC RETRO CRT DESK",
    subtitle: "Bubble CRT · syntax editor · 65% mech keyboard · pixel cat · coffee",
  },
  {
    id: "code_orrery",
    shortLabel: "ORRERY",
    title: "KINETIC CODE ORRERY",
    subtitle: "Vernier astrolabe · 4 gimbal rings · 4D tesseract core · 8 satellites",
  },
  {
    id: "gamepad",
    shortLabel: "ARCADE",
    title: "PRO ARCADE CONTROLLER",
    subtitle: "Twin analog sticks · D-pad · ABXY domes · ROM cartridge slot",
  },
  {
    id: "neural_crown",
    shortLabel: "NEURAL",
    title: "NEURAL ALGORITHM NEXUS",
    subtitle: "Dual-hemisphere cortex · geodesic graph halo · live DAG traces",
  },
] as const;

export interface HologramPaletteColors {
  bgGradientCss: string;
  bgFallbackHex: string;
  deep: [number, number, number];
  mid: [number, number, number];
  bright: [number, number, number];
  accent: [number, number, number];
  dotHex: string;
  glyphRgbaPrefix: string;
}

export const HOLOGRAM_PALETTES: Record<StudioPaletteId, HologramPaletteColors> = {
  arcade: {
    bgGradientCss:
      "radial-gradient(circle at 50% 48%, #0d1d18 0%, #050809 64%, #020305 100%)",
    bgFallbackHex: "#060B0A",
    deep: [0.04, 0.26, 0.2],
    mid: [0.16, 0.8, 0.58],
    bright: [0.84, 1.0, 0.94],
    accent: [1.0, 0.86, 0.32],
    dotHex: "#6EE7B7",
    glyphRgbaPrefix: "rgba(110, 231, 183, ",
  },
  matcha: {
    bgGradientCss:
      "radial-gradient(circle at 50% 48%, #131f13 0%, #060907 64%, #030403 100%)",
    bgFallbackHex: "#080D08",
    deep: [0.1, 0.28, 0.12],
    mid: [0.46, 0.84, 0.34],
    bright: [0.92, 1.0, 0.72],
    accent: [0.44, 0.94, 0.76],
    dotHex: "#B8FF3B",
    glyphRgbaPrefix: "rgba(184, 255, 59, ",
  },
  amber: {
    bgGradientCss:
      "radial-gradient(circle at 50% 48%, #211609 0%, #090603 64%, #040302 100%)",
    bgFallbackHex: "#0E0904",
    deep: [0.34, 0.16, 0.04],
    mid: [0.96, 0.62, 0.14],
    bright: [1.0, 0.95, 0.7],
    accent: [0.45, 0.92, 0.82],
    dotHex: "#FFDE59",
    glyphRgbaPrefix: "rgba(255, 222, 89, ",
  },
  sakura: {
    bgGradientCss:
      "radial-gradient(circle at 50% 48%, #1f1022 0%, #09050b 64%, #040205 100%)",
    bgFallbackHex: "#0D060F",
    deep: [0.28, 0.1, 0.3],
    mid: [0.94, 0.44, 0.8],
    bright: [1.0, 0.88, 0.98],
    accent: [0.38, 0.84, 1.0],
    dotHex: "#FF90E8",
    glyphRgbaPrefix: "rgba(255, 144, 232, ",
  },
};

export function getHologramShapeMeta(id: HologramShapeId): HologramShapeMeta {
  return (
    HOLOGRAM_SHAPES_META.find((item) => item.id === id) ||
    HOLOGRAM_SHAPES_META[0]
  );
}

function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Samples a 3D box surface with strong edge-bevel concentration so silhouettes
 * resolve as crisp architectural ridges made of micro-particles rather than diffuse clouds.
 */
function sampleBoxSurfaceCrisp(
  rand: () => number,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
  edgeBias = 0.46,
): [number, number, number, number, number] {
  if (rand() < edgeBias) {
    const axis = Math.floor(rand() * 3);
    const t = rand() * 2 - 1;
    const s1 = rand() < 0.5 ? -1 : 1;
    const s2 = rand() < 0.5 ? -1 : 1;
    const jit = 0.008;
    let x = 0;
    let y = 0;
    let z = 0;
    if (axis === 0) {
      x = t;
      y = s1;
      z = s2;
    } else if (axis === 1) {
      x = s1;
      y = t;
      z = s2;
    } else {
      x = s1;
      y = s2;
      z = t;
    }
    return [
      cx + x * sx + (rand() - 0.5) * jit,
      cy + y * sy + (rand() - 0.5) * jit,
      cz + z * sz + (rand() - 0.5) * jit,
      1,
      4,
    ];
  }

  const face = Math.floor(rand() * 6);
  const u = rand() * 2 - 1;
  const v = rand() * 2 - 1;
  let x = 0;
  let y = 0;
  let z = 0;
  if (face === 0) {
    x = 1;
    y = u;
    z = v;
  } else if (face === 1) {
    x = -1;
    y = u;
    z = v;
  } else if (face === 2) {
    x = u;
    y = 1;
    z = v;
  } else if (face === 3) {
    x = u;
    y = -1;
    z = v;
  } else if (face === 4) {
    x = u;
    y = v;
    z = 1;
  } else {
    x = u;
    y = v;
    z = -1;
  }
  const nearEdge = Math.max(Math.abs(u), Math.abs(v)) > 0.89 ? 1 : 0;
  return [cx + x * sx, cy + y * sy, cz + z * sz, nearEdge, face];
}

function generateCyberDesk(count: number): HologramShapeData {
  const rand = createRng(1995);
  const positions = new Float32Array(count * 3);
  const luminance = new Float32Array(count);
  const accentMix = new Float32Array(count);
  let i = 0;

  const pushPt = (x: number, y: number, z: number, lum: number, acc: number) => {
    if (i >= count) return;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    luminance[i] = clamp01(lum);
    accentMix[i] = clamp01(acc);
    i += 1;
  };

  // A. Bevel-Edged Bubble CRT + Curved Phosphor Glass + Side Louvers + Cathode Neck (~32%)
  const crtTarget = Math.floor(count * 0.32);
  while (i < crtTarget) {
    const p = rand();
    if (p < 0.72) {
      const [x, y, z, edge, face] = sampleBoxSurfaceCrisp(
        rand,
        -0.06,
        0.25,
        -0.08,
        0.56,
        0.42,
        0.28,
        0.5,
      );
      if (face === 4 && Math.abs(x + 0.06) < 0.46 && Math.abs(y - 0.28) < 0.31) {
        const gx = (x + 0.06) / 0.46;
        const gy = (y - 0.28) / 0.31;
        const bulge = Math.max(0, 1 - (gx * gx + gy * gy) * 0.38) * 0.052;
        const onBezel = Math.max(Math.abs(gx), Math.abs(gy)) > 0.93;
        const scanline = Math.sin(y * 135) > 0.45 ? 0.48 : 0.16;
        pushPt(
          x,
          y,
          0.195 + bulge,
          onBezel ? 0.98 : scanline,
          onBezel ? 0.78 : 0.1,
        );
      } else if ((face === 0 || face === 1) && y > 0.08 && y < 0.54 && z < 0.09) {
        const vent = Math.abs(Math.sin(y * 84)) > 0.68;
        pushPt(x, y, z, vent ? 0.82 : 0.26, vent ? 0.28 : 0.0);
      } else {
        pushPt(x, y, z, edge ? 0.96 : 0.34 + rand() * 0.16, edge ? 0.3 : 0.0);
      }
    } else {
      // Tapered rear CRT electron-gun neck with cooling ribs
      const t = rand();
      const ang = rand() * Math.PI * 2;
      const r = (1 - t * 0.52) * 0.34;
      const rib = Math.abs(Math.sin(t * 28)) > 0.82 ? 0.78 : 0.32;
      pushPt(
        -0.06 + Math.cos(ang) * r * 1.15,
        0.25 + Math.sin(ang) * r * 0.85,
        -0.36 - t * 0.34,
        rib,
        t > 0.86 ? 0.7 : 0.05,
      );
    }
  }

  // B. Twin Cat-Ear Antennas + Swivel Pedestal + VHS Deck Slot + Rotary Knobs + Power LED (~11%)
  const antTarget = i + Math.floor(count * 0.11);
  while (i < antTarget) {
    const p = rand();
    if (p < 0.44) {
      const side = rand() < 0.5 ? -1 : 1;
      const h = Math.pow(rand(), 0.76);
      const ang = rand() * Math.PI * 2;
      const r = (1 - h) * 0.125;
      pushPt(
        -0.06 + side * (0.31 + h * 0.08) + Math.cos(ang) * r,
        0.67 + h * 0.24,
        -0.04 + Math.sin(ang) * r * 0.66,
        0.9 + h * 0.1,
        0.95,
      );
    } else if (p < 0.72) {
      const [x, y, z, edge] = sampleBoxSurfaceCrisp(
        rand,
        -0.06,
        -0.22,
        -0.08,
        0.36,
        0.045,
        0.22,
        0.54,
      );
      pushPt(x, y, z, edge ? 0.88 : 0.38, edge ? 0.24 : 0.0);
    } else if (p < 0.9) {
      // Recessed VHS deck slot + rotary brightness/contrast dials
      if (rand() < 0.72) {
        const t = rand() * 2 - 1;
        pushPt(-0.16 + t * 0.23, -0.09 + (rand() - 0.5) * 0.02, 0.212, 0.98, 0.9);
      } else {
        const knobIdx = rand() < 0.5 ? 0 : 1;
        const a = rand() * Math.PI * 2;
        const r = 0.022;
        pushPt(
          0.18 + knobIdx * 0.075 + Math.cos(a) * r,
          -0.09 + Math.sin(a) * r,
          0.214,
          0.95,
          0.55,
        );
      }
    } else {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.022;
      pushPt(0.35 + Math.cos(a) * r, -0.09 + Math.sin(a) * r, 0.218, 1.0, 1.0);
    }
  }

  // C. Crisp CRT IDE Titlebar + Line Gutter + Syntax Token Blocks + Floating < /> (~17%)
  const holoTarget = i + Math.floor(count * 0.17);
  while (i < holoTarget) {
    const p = rand();
    if (p < 0.16) {
      // IDE header bar + 3 window traffic-light dots inside top of CRT screen
      if (rand() < 0.45) {
        const dot = Math.floor(rand() * 3);
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 0.015;
        pushPt(
          -0.44 + dot * 0.048 + Math.cos(a) * r,
          0.545 + Math.sin(a) * r,
          0.242,
          1.0,
          dot === 1 ? 1.0 : 0.55,
        );
      } else {
        pushPt(-0.48 + rand() * 0.84, 0.515, 0.238, 0.86, 0.45);
      }
    } else if (p < 0.74) {
      const row = Math.floor(rand() * 8);
      const y = 0.47 - row * 0.062 + (rand() - 0.5) * 0.009;
      if (rand() < 0.12) {
        // Line-number gutter dot
        pushPt(-0.46 + rand() * 0.028, y, 0.238, 0.66, 0.12);
      } else {
        const indent = row === 1 || row === 2 || row === 4 || row === 5 || row === 6 ? 0.1 : 0.0;
        const tokenIdx = Math.floor(rand() * 3);
        const tokenStart = tokenIdx * 0.155;
        const tokenLen = 0.105 + ((row + tokenIdx) % 2) * 0.038;
        const x = Math.min(
          0.32,
          -0.4 + indent + tokenStart + rand() * tokenLen,
        );
        const z = 0.244 + (row % 2) * 0.018;
        pushPt(
          x,
          y,
          z,
          1.0,
          tokenIdx === 0 || row === 0 || row === 3 ? 0.97 : 0.18,
        );
      }
    } else {
      // Crisp floating < /> chevron & slash hovering slightly in front of CRT glass
      const glyphPick = rand();
      if (glyphPick < 0.72) {
        const side = rand() < 0.5 ? -1 : 1;
        const t = rand() * 2 - 1;
        const chevronX = side * (0.26 - Math.abs(t) * 0.115);
        pushPt(
          -0.06 + chevronX,
          0.27 + t * 0.15,
          0.33 + (rand() - 0.5) * 0.012,
          1.0,
          0.92,
        );
      } else {
        const t = rand() * 2 - 1;
        pushPt(
          -0.06 + t * 0.055,
          0.27 + t * 0.16,
          0.33 + (rand() - 0.5) * 0.012,
          1.0,
          0.98,
        );
      }
    }
  }

  // D. Sculpted 65% Mechanical Keyboard + 5×13 Keycap Matrix + Coiled Aviator Cable (~24%)
  const kbTarget = i + Math.floor(count * 0.24);
  const tilt = 0.16;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  while (i < kbTarget) {
    const p = rand();
    if (p < 0.3) {
      const [x, y0, z0, edge] = sampleBoxSurfaceCrisp(
        rand,
        -0.06,
        0,
        0,
        0.63,
        0.042,
        0.235,
        0.58,
      );
      pushPt(
        x,
        -0.34 + y0 * cosTilt - z0 * sinTilt,
        0.44 + y0 * sinTilt + z0 * cosTilt,
        edge ? 0.94 : 0.36,
        edge ? 0.28 : 0.0,
      );
    } else if (p < 0.92) {
      const row = Math.floor(rand() * 5);
      const col = Math.floor(rand() * 13);
      const isSpacebar = row === 4 && col >= 4 && col <= 8;
      const kxCenter = isSpacebar ? -0.06 : -0.57 + col * 0.085;
      const kxSpan = isSpacebar ? 0.36 : 0.062;
      const kzCenter = -0.165 + row * 0.082;
      const onCapRim = rand() < 0.7;
      const u = rand() * 2 - 1;
      const v = rand() * 2 - 1;
      const kx =
        kxCenter +
        (onCapRim && rand() < 0.5 ? (u < 0 ? -0.5 : 0.5) : u * 0.5) * kxSpan;
      const kz0 =
        kzCenter +
        (onCapRim && rand() >= 0.5 ? (v < 0 ? -0.5 : 0.5) : v * 0.5) * 0.06;
      const ky0 = 0.056 + (onCapRim ? 0.022 : rand() * 0.024);
      const isAccentKey =
        (row === 0 && col === 0) ||
        (row === 2 && col === 12) ||
        isSpacebar;
      pushPt(
        kx,
        -0.34 + ky0 * cosTilt - kz0 * sinTilt,
        0.44 + ky0 * sinTilt + kz0 * cosTilt,
        isAccentKey ? 1.0 : 0.8,
        isAccentKey ? 0.96 : 0.16,
      );
    } else {
      const t = rand();
      const coil = t < 0.58 ? Math.sin(t * 82) * 0.028 : 0;
      const cx = -0.42 + t * 0.18 + coil;
      const cy = -0.35 + Math.cos(t * 82) * (t < 0.58 ? 0.022 : 0.004);
      const cz = 0.19 - t * 0.26;
      pushPt(cx, cy, cz, 0.9, 0.85);
    }
  }

  // E. Steaming Coffee Mug + Curled Pixel Cat Companion + Polar Desk Ring (~16%)
  while (i < count) {
    const p = rand();
    if (p < 0.35) {
      const q = rand();
      if (q < 0.72) {
        const ang = rand() * Math.PI * 2;
        const h = rand();
        const rim = h > 0.92 || h < 0.06;
        pushPt(
          0.74 + Math.cos(ang) * 0.125,
          -0.36 + h * 0.24,
          0.16 + Math.sin(ang) * 0.125,
          rim ? 0.99 : 0.68,
          rim ? 0.95 : 0.3,
        );
      } else if (q < 0.88) {
        const ang = (rand() - 0.5) * Math.PI;
        pushPt(
          0.865 + Math.cos(ang) * 0.065,
          -0.24 + Math.sin(ang) * 0.075,
          0.16,
          0.9,
          0.65,
        );
      } else {
        const ang = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 0.114;
        pushPt(0.74 + Math.cos(ang) * r, -0.135, 0.16 + Math.sin(ang) * r, 0.94, 0.96);
      }
    } else if (p < 0.52) {
      const strand = Math.floor(rand() * 3);
      const h = rand();
      const ang = h * 8.4 + strand * 2.09;
      const spread = 0.024 + h * 0.036;
      pushPt(
        0.74 + Math.cos(ang) * spread,
        -0.09 + h * 0.38,
        0.16 + Math.sin(ang) * spread,
        (1 - h * 0.42) * 0.96,
        0.96,
      );
    } else if (p < 0.72) {
      const q = rand();
      if (q < 0.65) {
        const u = rand() * Math.PI * 2;
        const v = Math.acos(2 * rand() - 1);
        pushPt(
          -0.8 + Math.sin(v) * Math.cos(u) * 0.13,
          -0.36 + Math.abs(Math.cos(v)) * 0.095,
          0.3 + Math.sin(v) * Math.sin(u) * 0.105,
          0.88,
          0.78,
        );
      } else if (q < 0.88) {
        const earSide = rand() < 0.5 ? -1 : 1;
        const eh = rand();
        pushPt(
          -0.72 + earSide * 0.036 * (1 - eh * 0.6),
          -0.27 + eh * 0.058,
          0.35,
          0.99,
          0.96,
        );
      } else {
        const t = rand() * Math.PI;
        pushPt(
          -0.85 - Math.sin(t) * 0.08,
          -0.37,
          0.3 + Math.cos(t) * 0.11,
          0.92,
          0.92,
        );
      }
    } else {
      const ang = rand() * Math.PI * 2;
      const rPick = rand();
      if (rPick < 0.55) {
        const ringR = rPick < 0.3 ? 1.08 : 0.78;
        const tick = Math.abs(Math.sin(ang * 16)) > 0.94;
        pushPt(
          Math.cos(ang) * ringR,
          -0.44,
          Math.sin(ang) * (ringR * 0.74) + 0.06,
          tick ? 0.92 : 0.62,
          tick ? 0.9 : 0.32,
        );
      } else {
        const gx = (rand() * 2 - 1) * 1.04;
        const gz = (rand() * 2 - 1) * 0.76;
        const onGrid =
          Math.abs(Math.sin(gx * 18)) < 0.08 || Math.abs(Math.sin(gz * 18)) < 0.08;
        const dist = Math.hypot(gx / 1.04, gz / 0.76);
        if (dist < 1.0 && onGrid) {
          pushPt(gx, -0.44, gz + 0.06, (1 - dist * 0.58) * 0.46, 0.1);
        } else {
          pushPt(
            Math.cos(ang) * 1.08,
            -0.44,
            Math.sin(ang) * 0.8 + 0.06,
            0.58,
            0.26,
          );
        }
      }
    }
  }

  return { positions, luminance, accentMix };
}

function generateCodeOrrery(count: number): HologramShapeData {
  const rand = createRng(2048);
  const positions = new Float32Array(count * 3);
  const luminance = new Float32Array(count);
  const accentMix = new Float32Array(count);
  let i = 0;

  const pushPt = (x: number, y: number, z: number, lum: number, acc: number) => {
    if (i >= count) return;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    luminance[i] = clamp01(lum);
    accentMix[i] = clamp01(acc);
    i += 1;
  };

  const cubeVerts: [number, number, number][] = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) cubeVerts.push([sx, sy, sz]);
    }
  }
  const cubeEdges: [number, number][] = [];
  for (let a = 0; a < 8; a += 1) {
    for (let b = a + 1; b < 8; b += 1) {
      const diff =
        (cubeVerts[a][0] !== cubeVerts[b][0] ? 1 : 0) +
        (cubeVerts[a][1] !== cubeVerts[b][1] ? 1 : 0) +
        (cubeVerts[a][2] !== cubeVerts[b][2] ? 1 : 0);
      if (diff === 1) cubeEdges.push([a, b]);
    }
  }

  const satellites: [number, number, number][] = [
    [1.04, 0.22, 0.0],
    [-1.02, -0.2, 0.16],
    [0.22, 0.78, 0.64],
    [-0.25, -0.74, -0.66],
    [0.62, -0.48, 0.64],
    [-0.64, 0.48, -0.6],
    [0.0, 0.94, -0.36],
    [0.44, 0.16, -0.9],
  ];

  const sampleBeveledGimbalRing = (
    R: number,
    tubeR: number,
    tiltX: number,
    tiltZ: number,
    tickFreq: number,
    accentBias: number,
  ): [number, number, number, number, number] => {
    const a = rand() * Math.PI * 2;
    const railAngles = [0.42, -0.42, Math.PI - 0.42, Math.PI + 0.42];
    const b =
      rand() < 0.78
        ? railAngles[Math.floor(rand() * 4)] + (rand() - 0.5) * 0.16
        : rand() * Math.PI * 2;
    const isMajorTick = Math.abs(Math.sin(a * (tickFreq * 0.5))) > 0.978;
    const isMinorTick = Math.abs(Math.sin(a * tickFreq)) > 0.96;
    const rr = tubeR * (isMajorTick ? 2.15 : isMinorTick ? 1.52 : 1.0);
    const x = (R + Math.cos(b) * rr) * Math.cos(a);
    const y = Math.sin(b) * rr * 1.2;
    const z = (R + Math.cos(b) * rr) * Math.sin(a);
    const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
    const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    const x2 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
    const y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
    const lum = isMajorTick ? 1.0 : isMinorTick ? 0.95 : 0.62 + 0.34 * Math.cos(b);
    const acc = isMajorTick || isMinorTick ? 0.99 : accentBias;
    return [x2, y2, z1, lum, acc];
  };

  // A. 4 Interlocking Precision Vernier Gimbal Rings (~50%)
  const ringsTarget = Math.floor(count * 0.5);
  while (i < ringsTarget) {
    const p = rand();
    const pt =
      p < 0.32
        ? sampleBeveledGimbalRing(1.06, 0.028, 0.36, 0.22, 24, 0.08)
        : p < 0.6
          ? sampleBeveledGimbalRing(0.86, 0.025, -0.78, 0.52, 18, 0.34)
          : p < 0.84
            ? sampleBeveledGimbalRing(0.67, 0.022, 1.14, -0.42, 12, 0.78)
            : sampleBeveledGimbalRing(0.48, 0.019, -0.32, 1.08, 8, 0.94);
    pushPt(pt[0], pt[1], pt[2], pt[3], pt[4]);
  }

  // B. 4D Tesseract Core + Inner Octahedron Plasma Singularity (~27%)
  const coreTarget = i + Math.floor(count * 0.27);
  while (i < coreTarget) {
    const pick = rand();
    if (pick < 0.44) {
      const e = cubeEdges[Math.floor(rand() * cubeEdges.length)];
      const t = rand();
      const v0 = cubeVerts[e[0]];
      const v1 = cubeVerts[e[1]];
      pushPt(
        (v0[0] + (v1[0] - v0[0]) * t) * 0.275,
        (v0[1] + (v1[1] - v0[1]) * t) * 0.275,
        (v0[2] + (v1[2] - v0[2]) * t) * 0.275,
        0.98,
        0.2,
      );
    } else if (pick < 0.78) {
      if (rand() < 0.44) {
        const v = cubeVerts[Math.floor(rand() * 8)];
        const s = 0.138 + rand() * 0.137;
        pushPt(v[0] * s, v[1] * s, v[2] * s, 0.96, 0.96);
      } else {
        const e = cubeEdges[Math.floor(rand() * cubeEdges.length)];
        const t = rand();
        const v0 = cubeVerts[e[0]];
        const v1 = cubeVerts[e[1]];
        pushPt(
          (v0[0] + (v1[0] - v0[0]) * t) * 0.138,
          (v0[1] + (v1[1] - v0[1]) * t) * 0.138,
          (v0[2] + (v1[2] - v0[2]) * t) * 0.138,
          1.0,
          0.99,
        );
      }
    } else {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const r = 0.086 * (rand() < 0.65 ? 1.0 : Math.sqrt(rand()));
      pushPt(
        Math.sin(v) * Math.cos(u) * r,
        Math.cos(v) * r,
        Math.sin(v) * Math.sin(u) * r,
        1.0,
        0.97,
      );
    }
  }

  // C. 8 Saturn-Ringed Satellites + Telemetry Tethers + Base Emitter Disc (~23%)
  while (i < count) {
    const p = rand();
    if (p < 0.8) {
      const sat = satellites[Math.floor(rand() * satellites.length)];
      const q = rand();
      if (q < 0.54) {
        const u = rand() * Math.PI * 2;
        const v = Math.acos(2 * rand() - 1);
        const r = 0.066 * (0.85 + rand() * 0.15);
        pushPt(
          sat[0] + Math.sin(v) * Math.cos(u) * r,
          sat[1] + Math.cos(v) * r,
          sat[2] + Math.sin(v) * Math.sin(u) * r,
          0.98,
          0.95,
        );
      } else if (q < 0.82) {
        const a = rand() * Math.PI * 2;
        const rr = 0.108 + (rand() - 0.5) * 0.01;
        pushPt(
          sat[0] + Math.cos(a) * rr,
          sat[1] + Math.sin(a) * rr * 0.34,
          sat[2] + Math.sin(a) * rr,
          0.94,
          0.9,
        );
      } else {
        const t = 0.28 + rand() * 0.68;
        pushPt(sat[0] * t, sat[1] * t, sat[2] * t, 0.55 + (1 - t) * 0.42, 0.58);
      }
    } else {
      const a = rand() * Math.PI * 2;
      const r = rand() < 0.55 ? 0.58 : 0.32;
      const tick = Math.abs(Math.sin(a * 16)) > 0.94;
      pushPt(
        Math.cos(a) * r,
        -0.95,
        Math.sin(a) * r,
        tick ? 0.94 : 0.52,
        tick ? 0.94 : 0.3,
      );
    }
  }

  return { positions, luminance, accentMix };
}

function generateGamepad(count: number): HologramShapeData {
  const rand = createRng(1989);
  const positions = new Float32Array(count * 3);
  const luminance = new Float32Array(count);
  const accentMix = new Float32Array(count);
  let i = 0;

  const pushPt = (x: number, y: number, z: number, lum: number, acc: number) => {
    if (i >= count) return;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    luminance[i] = clamp01(lum);
    accentMix[i] = clamp01(acc);
    i += 1;
  };

  const btns: [number, number][] = [
    [0.5, 0.26],
    [0.5, 0.0],
    [0.37, 0.13],
    [0.63, 0.13],
  ];

  // A. Sculpted Controller Chassis with Crisp Perimeter Seam (~33%)
  const bodyTarget = Math.floor(count * 0.33);
  while (i < bodyTarget) {
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const nx = Math.sin(v) * Math.cos(u);
    const ny = Math.cos(v);
    const nz = Math.sin(v) * Math.sin(u);
    const archCarve = ny < -0.25 ? Math.max(0, 0.42 - Math.abs(nx)) * 0.36 : 0;
    const onSeam = Math.abs(nz) < 0.12 || Math.abs(Math.hypot(nx, ny) - 0.96) < 0.05;
    pushPt(
      nx * 0.94,
      ny * 0.41 + 0.09 + archCarve,
      nz * 0.22,
      onSeam ? 0.94 : 0.36 + rand() * 0.15,
      onSeam ? 0.4 : 0.04,
    );
  }

  // B. Contoured Left & Right Ergonomic Grips with Textured Micro-Ridges (~23%)
  const gripTarget = i + Math.floor(count * 0.23);
  while (i < gripTarget) {
    const side = rand() < 0.5 ? -1 : 1;
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const gx = Math.sin(v) * Math.cos(u) * 0.3;
    const gy = Math.cos(v) * 0.54;
    const gz = Math.sin(v) * Math.sin(u) * 0.23;
    const angle = side * -0.28;
    const rx = gx * Math.cos(angle) - gy * Math.sin(angle);
    const ry = gx * Math.sin(angle) + gy * Math.cos(angle);
    const gripTex = Math.abs(Math.sin(ry * 58)) > 0.82 ? 0.78 : 0.4;
    pushPt(
      side * 0.75 + rx,
      -0.17 + ry,
      gz - 0.04,
      gripTex + Math.max(0, gz) * 0.58,
      0.08,
    );
  }

  // C. Twin 3D Analog Thumbsticks (Concave Knurled Caps + Stems + Wells) (~15%)
  const sticksTarget = i + Math.floor(count * 0.15);
  const stickCenters: [number, number][] = [
    [-0.28, -0.14],
    [0.24, -0.14],
  ];
  while (i < sticksTarget) {
    const [sx, sy] = stickCenters[rand() < 0.5 ? 0 : 1];
    const p = rand();
    if (p < 0.66) {
      const a = rand() * Math.PI * 2;
      const r = rand() < 0.52 ? 0.095 : Math.sqrt(rand()) * 0.095;
      const dish = (r / 0.095) * (r / 0.095) * 0.024;
      pushPt(
        sx + Math.cos(a) * r,
        sy + Math.sin(a) * r,
        0.33 + dish,
        r > 0.082 ? 1.0 : 0.78,
        r > 0.082 ? 0.96 : 0.45,
      );
    } else {
      const a = rand() * Math.PI * 2;
      const h = rand();
      const r = h < 0.34 ? 0.138 : 0.034;
      pushPt(
        sx + Math.cos(a) * r,
        sy + Math.sin(a) * r,
        0.23 + h * 0.1,
        h < 0.34 ? 0.9 : 0.7,
        h < 0.34 ? 0.8 : 0.5,
      );
    }
  }

  // D. Crisp 3D Cross D-Pad + 4 Domed ABXY Face Buttons (~17%)
  const controlsTarget = i + Math.floor(count * 0.17);
  while (i < controlsTarget) {
    if (rand() < 0.46) {
      const horiz = rand() < 0.5;
      const dx = horiz ? (rand() * 2 - 1) * 0.2 : (rand() * 2 - 1) * 0.062;
      const dy = horiz ? (rand() * 2 - 1) * 0.062 : (rand() * 2 - 1) * 0.2;
      const rim = Math.max(Math.abs(dx), Math.abs(dy)) > 0.165;
      pushPt(-0.5 + dx, 0.13 + dy, 0.25 + (rim ? 0.042 : 0.025), 0.98, 0.92);
    } else {
      const b = btns[Math.floor(rand() * btns.length)];
      const u = rand() * Math.PI * 2;
      const r = rand() < 0.45 ? 0.066 : 0.066 * Math.sqrt(rand());
      const dome = Math.sqrt(Math.max(0, 1 - (r / 0.07) * (r / 0.07))) * 0.056;
      pushPt(b[0] + Math.cos(u) * r, b[1] + Math.sin(u) * r, 0.24 + dome, 1.0, 0.98);
    }
  }

  // E. Slotted ROM Cartridge + L1/R1 Shoulder Triggers + OLED Touchpad (~12%)
  while (i < count) {
    const p = rand();
    if (p < 0.44) {
      const [x, y, z, edge] = sampleBoxSurfaceCrisp(
        rand,
        0,
        0.55,
        -0.04,
        0.28,
        0.14,
        0.058,
        0.6,
      );
      const grip = y > 0.58 && Math.abs(Math.sin(y * 95)) > 0.65;
      pushPt(x, y, z, edge || grip ? 0.99 : 0.62, edge || grip ? 0.95 : 0.35);
    } else if (p < 0.74) {
      const side = rand() < 0.5 ? -1 : 1;
      const t = rand() * 2 - 1;
      pushPt(
        side * 0.58 + t * 0.21,
        0.49 + (rand() - 0.5) * 0.045,
        (rand() - 0.5) * 0.17,
        0.94,
        0.88,
      );
    } else {
      const [x, y, z, edge] = sampleBoxSurfaceCrisp(
        rand,
        -0.02,
        0.22,
        0.245,
        0.2,
        0.11,
        0.008,
        0.65,
      );
      pushPt(x, y, z, edge ? 0.99 : 0.62, edge ? 0.96 : 0.45);
    }
  }

  return { positions, luminance, accentMix };
}

function brainRidgeField(x: number, y: number, z: number): number {
  const wx = x + 0.13 * Math.sin(y * 5.4 + z * 4.2);
  const wy = y + 0.13 * Math.cos(z * 5.7 + x * 3.9);
  const wz = z + 0.13 * Math.sin(x * 5.1 - y * 4.5);
  const f1 =
    Math.sin(wx * 12.5 + Math.cos(wy * 9.5)) *
    Math.cos(wz * 11.2 + Math.sin(wx * 8.4));
  const f2 = Math.sin(wy * 19.5 + wz * 15.0) * 0.46;
  const f3 = Math.cos(wx * 26.0 - wz * 22.0 + wy * 17.0) * 0.24;
  return Math.pow(
    Math.max(0, 1.0 - Math.min(1.0, Math.abs(f1 + f2 + f3) * 0.95)),
    0.68,
  );
}

function generateNeuralCrown(count: number): HologramShapeData {
  const rand = createRng(9988);
  const positions = new Float32Array(count * 3);
  const luminance = new Float32Array(count);
  const accentMix = new Float32Array(count);
  let i = 0;

  const pushPt = (x: number, y: number, z: number, lum: number, acc: number) => {
    if (i >= count) return;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    luminance[i] = clamp01(lum);
    accentMix[i] = clamp01(acc);
    i += 1;
  };

  const outerNodes: [number, number, number][] = [];
  const innerNodes: [number, number, number][] = [];
  for (let k = 0; k < 8; k += 1) {
    const a = (k / 8) * Math.PI * 2;
    outerNodes.push([
      Math.cos(a) * 1.06,
      0.06 + Math.sin(a * 2) * 0.24,
      Math.sin(a) * 1.06,
    ]);
  }
  for (let k = 0; k < 4; k += 1) {
    const a = (k / 4) * Math.PI * 2 + 0.39;
    innerNodes.push([Math.cos(a) * 0.72, 0.56, Math.sin(a) * 0.72]);
  }
  const allNodes = [...outerNodes, ...innerNodes];

  // A. Sculpted Two-Hemisphere Gyri/Sulci Cortex + Striated Cerebellum (~62%)
  const brainTarget = Math.floor(count * 0.62);
  while (i < brainTarget) {
    if (rand() < 0.88) {
      const side = rand() < 0.5 ? -1 : 1;
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const nx = Math.sin(v) * Math.cos(u);
      const ny = Math.cos(v);
      const nz = Math.sin(v) * Math.sin(u);
      let hx = Math.abs(nx);
      if (nx * side < 0) hx *= 0.2;
      const x = side * (0.048 + hx * 0.56);
      let y = ny * 0.52 + 0.09;
      const z = nz * 0.79;
      if (y < -0.02) y *= 0.66;
      const ridge = brainRidgeField(x * 1.38, y * 1.38, z * 1.38);
      const disp = 0.91 + ridge * 0.13;
      pushPt(
        x * disp,
        y * disp,
        z * disp,
        0.18 + ridge * 0.82,
        ridge > 0.82 ? 0.45 : 0.02,
      );
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const cx = side * (0.18 + Math.abs(Math.sin(v) * Math.cos(u)) * 0.22);
      const cy = -0.24 + Math.cos(v) * 0.16;
      const cz = -0.34 + Math.sin(v) * Math.sin(u) * 0.22;
      const folia = Math.abs(Math.sin(cy * 95)) > 0.45 ? 0.82 : 0.34;
      pushPt(cx, cy, cz, folia, 0.16);
    }
  }

  // B. 12-Node Geodesic Graph Lattice + DAG Call-Tree Edges (~22%)
  const haloTarget = i + Math.floor(count * 0.22);
  while (i < haloTarget) {
    const p = rand();
    if (p < 0.54) {
      const k = Math.floor(rand() * 8);
      const n0 = outerNodes[k];
      const n1 =
        rand() < 0.55
          ? outerNodes[(k + 1) % 8]
          : rand() < 0.75
            ? innerNodes[k % 4]
            : innerNodes[(k + 1) % 4];
      const t = rand();
      pushPt(
        n0[0] + (n1[0] - n0[0]) * t + (rand() - 0.5) * 0.008,
        n0[1] + (n1[1] - n0[1]) * t + (rand() - 0.5) * 0.008,
        n0[2] + (n1[2] - n0[2]) * t + (rand() - 0.5) * 0.008,
        0.92,
        0.94,
      );
    } else {
      const node = allNodes[Math.floor(rand() * allNodes.length)];
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const r = rand() < 0.55 ? 0.072 : 0.072 * Math.sqrt(rand());
      pushPt(
        node[0] + Math.sin(v) * Math.cos(u) * r,
        node[1] + Math.cos(v) * r,
        node[2] + Math.sin(v) * Math.sin(u) * r,
        1.0,
        0.98,
      );
    }
  }

  // C. Synaptic Data Arcs + 6-Strand Spinal Axon Bundle (~16%)
  while (i < count) {
    const p = rand();
    if (p < 0.66) {
      const n = allNodes[Math.floor(rand() * allNodes.length)];
      const t = rand();
      const arch = Math.sin(t * Math.PI) * 0.22;
      pushPt(
        n[0] * (0.4 + t * 0.6),
        n[1] * t + arch,
        n[2] * (0.4 + t * 0.6),
        0.6 + Math.sin(t * Math.PI) * 0.4,
        0.96,
      );
    } else {
      const strand = Math.floor(rand() * 6);
      const t = rand();
      const a = (strand / 6) * Math.PI * 2 + t * 2.4;
      const r = 0.12 - t * 0.05;
      pushPt(
        Math.cos(a) * r,
        -0.22 - t * 0.5,
        -0.14 - t * 0.08 + Math.sin(a) * r,
        0.45 + (1 - t) * 0.46,
        t > 0.75 ? 0.75 : 0.12,
      );
    }
  }

  return { positions, luminance, accentMix };
}

const shapeCache = new Map<string, HologramShapeData>();

export function getHologramShapeData(
  id: HologramShapeId,
  count: number = HOLOGRAM_PARTICLE_COUNT,
): HologramShapeData {
  const cacheKey = `${id}:${count}`;
  const cached = shapeCache.get(cacheKey);
  if (cached) return cached;

  let data: HologramShapeData;
  switch (id) {
    case "code_orrery":
      data = generateCodeOrrery(count);
      break;
    case "gamepad":
      data = generateGamepad(count);
      break;
    case "neural_crown":
      data = generateNeuralCrown(count);
      break;
    case "cyber_desk":
    default:
      data = generateCyberDesk(count);
      break;
  }

  shapeCache.set(cacheKey, data);
  return data;
}

export const IDLE_DISPERSE_MIN_SEC = 10;
export const IDLE_DISPERSE_MAX_SEC = 15;
export const IDLE_DISPERSE_DURATION_SEC = 4.2;

const IDLE_DISPERSE_INTERVALS_SEC = [
  11.5, 13.8, 10.6, 14.4, 12.2, 11.0, 14.1, 12.9,
] as const;

export interface IdleDisperseState {
  idleElapsedSec: number;
  nextDelaySec: number;
  cycleIndex: number;
  active: boolean;
  progress: number;
}

export function pickNextIdleDisperseDelay(cycleIndex: number): number {
  const safeIdx =
    ((Math.floor(cycleIndex) % IDLE_DISPERSE_INTERVALS_SEC.length) +
      IDLE_DISPERSE_INTERVALS_SEC.length) %
    IDLE_DISPERSE_INTERVALS_SEC.length;
  return IDLE_DISPERSE_INTERVALS_SEC[safeIdx];
}

export function createIdleDisperseState(): IdleDisperseState {
  return {
    idleElapsedSec: 0,
    nextDelaySec: pickNextIdleDisperseDelay(0),
    cycleIndex: 0,
    active: false,
    progress: 0,
  };
}

/**
 * Smooth C-infinity 0 -> 1 -> 0 envelope for the idle particle bloom & reassembly cycle.
 */
export function computeIdleDisperseEnvelope(progress: number): number {
  const u = Math.max(0, Math.min(1, progress));
  if (u <= 0 || u >= 1) return 0;
  return Math.pow(Math.sin(Math.PI * u), 1.65);
}

export function stepIdleDisperseState(
  state: IdleDisperseState,
  dtSec: number,
  isInteracting: boolean,
): number {
  const dt = Math.max(0, dtSec);
  if (isInteracting) {
    state.idleElapsedSec = 0;
    if (state.active) {
      if (state.progress <= 0.5) {
        state.progress = Math.max(0, state.progress - dt * 1.45);
        if (state.progress <= 0) state.active = false;
      } else {
        state.progress = Math.min(1, state.progress + dt * 1.45);
        if (state.progress >= 1) {
          state.active = false;
          state.progress = 0;
        }
      }
      return state.active ? computeIdleDisperseEnvelope(state.progress) : 0;
    }
    return 0;
  }

  if (!state.active) {
    state.idleElapsedSec += dt;
    if (state.idleElapsedSec >= state.nextDelaySec) {
      state.active = true;
      state.progress = 0;
      state.idleElapsedSec = 0;
    }
    return 0;
  }

  state.progress += dt / IDLE_DISPERSE_DURATION_SEC;
  if (state.progress >= 1) {
    state.active = false;
    state.progress = 0;
    state.idleElapsedSec = 0;
    state.cycleIndex += 1;
    state.nextDelaySec = pickNextIdleDisperseDelay(state.cycleIndex);
    return 0;
  }

  return computeIdleDisperseEnvelope(state.progress);
}
