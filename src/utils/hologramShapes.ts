import type { StudioPaletteId } from "../constants/theme";

export const HOLOGRAM_PARTICLE_COUNT = 16000;

export type HologramShapeId =
  | "cyber_desk"
  | "bytecat_hero"
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
    subtitle: "Bubble CRT · holographic code · mechanical keyboard · coffee",
  },
  {
    id: "bytecat_hero",
    shortLabel: "BYTE-CAT",
    title: "BYTE-CAT AT THE KEYBOARD",
    subtitle: "Cozy studio headphones · glowing CRT visor · mechanical keys",
  },
  {
    id: "code_orrery",
    shortLabel: "ORRERY",
    title: "KINETIC CODE ORRERY",
    subtitle: "Interlocking gyroscope rings · tesseract core · 6 track orbits",
  },
  {
    id: "gamepad",
    shortLabel: "ARCADE",
    title: "RETRO ARCADE PAD",
    subtitle: "6 playable coding cartridges · sprints · detective · mini-builds",
  },
  {
    id: "neural_crown",
    shortLabel: "NEURAL",
    title: "NEURAL ALGORITHM NEXUS",
    subtitle: "Folded cortical brain · hexagonal logic lattice · live traces",
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

function sampleBoxSurface(
  rand: () => number,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
): [number, number, number, number, number] {
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
  const nearEdge = Math.max(Math.abs(u), Math.abs(v)) > 0.86 ? 1 : 0;
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
    luminance[i] = lum;
    accentMix[i] = acc;
    i += 1;
  };

  // A. Retro Bubble CRT Chassis + Tapered Rear Tube (~35%)
  const crtTarget = Math.floor(count * 0.35);
  while (i < crtTarget) {
    if (rand() < 0.72) {
      const [x, y, z, edge, face] = sampleBoxSurface(
        rand,
        -0.08,
        0.24,
        -0.1,
        0.56,
        0.42,
        0.3,
      );
      if (face === 4 && Math.abs(x + 0.08) < 0.44 && Math.abs(y - 0.27) < 0.3) {
        const gx = (x + 0.08) / 0.44;
        const gy = (y - 0.27) / 0.3;
        const bulge = Math.max(0, 1 - (gx * gx + gy * gy) * 0.35) * 0.04;
        const scanline = Math.sin(y * 95) > 0.25 ? 0.45 : 0.16;
        pushPt(x, y, 0.17 + bulge, scanline, 0.12);
      } else {
        pushPt(x, y, z, edge ? 0.92 : 0.42 + rand() * 0.2, edge ? 0.2 : 0.0);
      }
    } else {
      const t = rand();
      const ang = rand() * Math.PI * 2;
      const r = (1 - t * 0.48) * 0.34;
      pushPt(
        -0.08 + Math.cos(ang) * r * 1.15,
        0.24 + Math.sin(ang) * r * 0.85,
        -0.4 - t * 0.32,
        0.32 + (1 - t) * 0.35,
        0.0,
      );
    }
  }

  // B. Twin Cat-Ear Antennas + Monitor Stand + VHS Slot (~10%)
  const antTarget = i + Math.floor(count * 0.1);
  while (i < antTarget) {
    const p = rand();
    if (p < 0.45) {
      const side = rand() < 0.5 ? -1 : 1;
      const h = Math.pow(rand(), 0.8);
      const ang = rand() * Math.PI * 2;
      const r = (1 - h) * 0.13;
      pushPt(
        -0.08 + side * (0.3 + h * 0.08) + Math.cos(ang) * r,
        0.66 + h * 0.24,
        -0.04 + Math.sin(ang) * r * 0.7,
        0.85 + h * 0.15,
        0.92,
      );
    } else if (p < 0.75) {
      const [x, y, z, edge] = sampleBoxSurface(
        rand,
        -0.08,
        -0.22,
        -0.1,
        0.36,
        0.05,
        0.24,
      );
      pushPt(x, y, z, edge ? 0.8 : 0.4, 0.0);
    } else {
      const t = rand() * 2 - 1;
      pushPt(-0.14 + t * 0.26, -0.1 + (rand() - 0.5) * 0.03, 0.21, 0.98, 0.95);
    }
  }

  // C. Holographic Code Lines & < /> Brackets Floating Out of Screen (~16%)
  const holoTarget = i + Math.floor(count * 0.16);
  const rowLens = [0.52, 0.38, 0.46, 0.28, 0.42, 0.34];
  while (i < holoTarget) {
    if (rand() < 0.55) {
      const row = Math.floor(rand() * 6);
      const indent = row === 1 || row === 2 || row === 4 ? 0.11 : 0.0;
      const x = -0.42 + indent + rand() * rowLens[row];
      const y = 0.46 - row * 0.075 + (rand() - 0.5) * 0.015;
      const z = 0.23 + (row % 2) * 0.025;
      pushPt(x, y, z, 0.98, row === 0 || row === 3 ? 0.95 : 0.15);
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      const t = rand() * 2 - 1;
      const chevronX = side * (0.26 - Math.abs(t) * 0.12);
      pushPt(-0.08 + chevronX, 0.26 + t * 0.16, 0.34 + (rand() - 0.5) * 0.02, 1.0, 0.85);
    }
  }

  // D. Angled Mechanical Keyboard + 4×11 Individual Keycaps (~24%)
  const kbTarget = i + Math.floor(count * 0.24);
  const tilt = 0.16;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  while (i < kbTarget) {
    if (rand() < 0.38) {
      const [x, y0, z0, edge] = sampleBoxSurface(rand, -0.06, 0, 0, 0.62, 0.04, 0.23);
      pushPt(
        x,
        -0.34 + y0 * cosTilt - z0 * sinTilt,
        0.44 + y0 * sinTilt + z0 * cosTilt,
        edge ? 0.85 : 0.38,
        0.0,
      );
    } else {
      const row = Math.floor(rand() * 4);
      const col = Math.floor(rand() * 11);
      const kx = -0.54 + col * 0.096 + (rand() - 0.5) * 0.062;
      const kz0 = -0.15 + row * 0.095 + (rand() - 0.5) * 0.062;
      const ky0 = 0.06 + rand() * 0.028;
      const isAccentKey = col === 0 || col === 10 || (row === 3 && col >= 3 && col <= 7);
      pushPt(
        kx,
        -0.34 + ky0 * cosTilt - kz0 * sinTilt,
        0.44 + ky0 * sinTilt + kz0 * cosTilt,
        isAccentKey ? 0.98 : 0.72,
        isAccentKey ? 0.95 : 0.18,
      );
    }
  }

  // E. Steaming Coffee Mug + Holographic Desk Grid (~15%)
  while (i < count) {
    const p = rand();
    if (p < 0.38) {
      if (rand() < 0.82) {
        const ang = rand() * Math.PI * 2;
        const h = rand();
        pushPt(
          0.74 + Math.cos(ang) * 0.125,
          -0.36 + h * 0.24,
          0.16 + Math.sin(ang) * 0.125,
          h > 0.92 ? 0.98 : 0.65,
          h > 0.92 ? 0.95 : 0.35,
        );
      } else {
        const ang = (rand() - 0.5) * Math.PI;
        pushPt(0.865 + Math.cos(ang) * 0.065, -0.24 + Math.sin(ang) * 0.075, 0.16, 0.8, 0.5);
      }
    } else if (p < 0.56) {
      const strand = Math.floor(rand() * 3);
      const h = rand();
      const ang = h * 7.5 + strand * 2.1;
      const spread = 0.028 + h * 0.035;
      pushPt(
        0.74 + Math.cos(ang) * spread,
        -0.09 + h * 0.36,
        0.16 + Math.sin(ang) * spread,
        (1 - h * 0.5) * 0.9,
        0.95,
      );
    } else {
      const gx = (rand() * 2 - 1) * 1.05;
      const gz = (rand() * 2 - 1) * 0.78;
      const onLine = Math.abs(Math.sin(gx * 16)) < 0.12 || Math.abs(Math.sin(gz * 16)) < 0.12;
      const dist = Math.hypot(gx / 1.05, gz / 0.78);
      if (dist < 1.05 && (onLine || rand() < 0.25)) {
        pushPt(gx, -0.44, gz + 0.08, (1 - dist * 0.65) * 0.42, 0.05);
      } else {
        const ang = rand() * Math.PI * 2;
        pushPt(Math.cos(ang) * 1.05, -0.44, Math.sin(ang) * 0.78 + 0.08, 0.6, 0.3);
      }
    }
  }

  return { positions, luminance, accentMix };
}

function generateByteCatHero(count: number): HologramShapeData {
  const rand = createRng(7070);
  const positions = new Float32Array(count * 3);
  const luminance = new Float32Array(count);
  const accentMix = new Float32Array(count);
  let i = 0;

  const pushPt = (x: number, y: number, z: number, lum: number, acc: number) => {
    if (i >= count) return;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    luminance[i] = lum;
    accentMix[i] = acc;
    i += 1;
  };

  // A. Byte-Cat Rounded Head + Cozy Hoodie Shoulders (~44%)
  const bodyTarget = Math.floor(count * 0.44);
  while (i < bodyTarget) {
    if (rand() < 0.72) {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const nx = Math.sin(v) * Math.cos(u);
      const ny = Math.cos(v);
      const nz = Math.sin(v) * Math.sin(u);
      const cheek = 1.0 + 0.12 * Math.exp(-((ny + 0.2) * (ny + 0.2)) / 0.16);
      const x = nx * 0.56 * cheek;
      const y = 0.28 + ny * 0.46;
      let z = -0.14 + nz * 0.48;
      if (z > 0.22 && Math.abs(x) < 0.38 && y > 0.08 && y < 0.5) {
        z = 0.22 + (z - 0.22) * 0.25;
      }
      pushPt(x, y, z, 0.38 + Math.max(0, nz) * 0.38, 0.0);
    } else {
      const u = rand() * Math.PI * 2;
      const h = rand();
      const r = 0.34 + h * 0.22;
      pushPt(
        Math.cos(u) * r * 1.15,
        -0.16 - h * 0.34,
        -0.14 + Math.sin(u) * r * 0.72,
        0.32 + (1 - h) * 0.35,
        0.08,
      );
    }
  }

  // B. Pointed Cat Ears + Golden Over-Ear Studio Headphones (~20%)
  const gearTarget = i + Math.floor(count * 0.2);
  while (i < gearTarget) {
    const p = rand();
    if (p < 0.38) {
      const side = rand() < 0.5 ? -1 : 1;
      const h = Math.pow(rand(), 0.74);
      const a = rand() * Math.PI * 2;
      const r = (1 - h) * 0.17;
      pushPt(
        side * (0.34 + h * 0.1) + Math.cos(a) * r,
        0.64 + h * 0.32,
        -0.1 + Math.sin(a) * r * 0.7,
        0.75 + h * 0.22,
        Math.sin(a) > 0.3 ? 0.95 : 0.1,
      );
    } else if (p < 0.68) {
      const theta = (rand() - 0.5) * Math.PI * 1.06;
      const ta = rand() * Math.PI * 2;
      const R = 0.67;
      const tr = 0.055;
      pushPt(
        Math.sin(theta) * (R + Math.cos(ta) * tr),
        0.28 + Math.cos(theta) * (R + Math.cos(ta) * tr),
        -0.14 + Math.sin(ta) * tr * 1.4,
        0.95,
        0.95,
      );
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      const a = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand());
      pushPt(
        side * (0.62 + (rand() - 0.5) * 0.15),
        0.26 + Math.cos(a) * 0.2 * rad,
        -0.14 + Math.sin(a) * 0.2 * rad,
        rad > 0.75 ? 1.0 : 0.65,
        0.95,
      );
    }
  }

  // C. Glowing CRT Visor Eyes (^ ^), Smile (ω), and Typing Paws (~14%)
  const faceTarget = i + Math.floor(count * 0.14);
  while (i < faceTarget) {
    const p = rand();
    if (p < 0.45) {
      const side = rand() < 0.5 ? -1 : 1;
      const t = rand() * Math.PI;
      pushPt(
        side * 0.16 + Math.cos(t) * 0.085,
        0.3 + Math.sin(t) * 0.08,
        0.32,
        1.0,
        0.96,
      );
    } else if (p < 0.65) {
      const side = rand() < 0.5 ? -1 : 1;
      const t = rand() * Math.PI;
      pushPt(
        side * 0.048 + Math.cos(t) * 0.048,
        0.19 - Math.sin(t) * 0.045,
        0.32,
        1.0,
        0.96,
      );
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      pushPt(
        side * 0.28 + Math.sin(v) * Math.cos(u) * 0.12,
        -0.34 + Math.cos(v) * 0.07,
        0.38 + Math.sin(v) * Math.sin(u) * 0.13,
        0.85,
        0.15,
      );
    }
  }

  // D. Floating Glowing Mechanical Keyboard + Lo-Fi Aura Ring (~22%)
  while (i < count) {
    if (rand() < 0.78) {
      const row = Math.floor(rand() * 4);
      const col = Math.floor(rand() * 12);
      const kx = -0.66 + col * 0.12 + (rand() - 0.5) * 0.08;
      const kz = 0.24 + row * 0.11 + (rand() - 0.5) * 0.07;
      const ky = -0.48 - row * 0.025 + rand() * 0.03;
      const glow = (col + row) % 4 === 0;
      pushPt(kx, ky, kz, glow ? 1.0 : 0.62, glow ? 0.95 : 0.12);
    } else {
      const ang = rand() * Math.PI * 2;
      const r = 0.86 + (rand() - 0.5) * 0.08;
      pushPt(
        Math.cos(ang) * r,
        0.16 + Math.sin(ang * 2) * 0.18,
        Math.sin(ang) * r * 0.75 - 0.08,
        0.75,
        0.85,
      );
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
    luminance[i] = lum;
    accentMix[i] = acc;
    i += 1;
  };

  const sampleRing = (
    R: number,
    tubeR: number,
    tiltX: number,
    tiltZ: number,
    tickFreq: number,
    accentBias: number,
  ): [number, number, number, number, number] => {
    const a = rand() * Math.PI * 2;
    const b = rand() * Math.PI * 2;
    const isTick = Math.abs(Math.sin(a * tickFreq)) > 0.94;
    const rr = tubeR * (isTick ? 1.55 : 1.0);
    const x = (R + Math.cos(b) * rr) * Math.cos(a);
    const y = Math.sin(b) * rr * 1.4;
    const z = (R + Math.cos(b) * rr) * Math.sin(a);
    const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
    const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    const x2 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
    const y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
    return [x2, y2, z1, isTick ? 1.0 : 0.55 + 0.35 * Math.cos(b), isTick ? 0.98 : accentBias];
  };

  // A. 3 Interlocking Kinetic Gyroscope Rings (~52%)
  const ringsTarget = Math.floor(count * 0.52);
  while (i < ringsTarget) {
    const p = rand();
    const pt =
      p < 0.38
        ? sampleRing(0.98, 0.036, 0.38, 0.25, 16, 0.08)
        : p < 0.72
          ? sampleRing(0.76, 0.032, -0.82, 0.55, 12, 0.35)
          : sampleRing(0.55, 0.028, 1.18, -0.45, 8, 0.85);
    pushPt(pt[0], pt[1], pt[2], pt[3], pt[4]);
  }

  // B. Central Tesseract / Hypercube Logic Core (~26%)
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
  const coreTarget = i + Math.floor(count * 0.26);
  while (i < coreTarget) {
    const pick = rand();
    if (pick < 0.45) {
      const e = cubeEdges[Math.floor(rand() * cubeEdges.length)];
      const t = rand();
      const v0 = cubeVerts[e[0]];
      const v1 = cubeVerts[e[1]];
      pushPt(
        (v0[0] + (v1[0] - v0[0]) * t) * 0.26,
        (v0[1] + (v1[1] - v0[1]) * t) * 0.26,
        (v0[2] + (v1[2] - v0[2]) * t) * 0.26,
        0.96,
        0.15,
      );
    } else if (pick < 0.78) {
      if (rand() < 0.45) {
        const v = cubeVerts[Math.floor(rand() * 8)];
        const s = 0.13 + rand() * 0.13;
        pushPt(v[0] * s, v[1] * s, v[2] * s, 0.92, 0.95);
      } else {
        const e = cubeEdges[Math.floor(rand() * cubeEdges.length)];
        const t = rand();
        const v0 = cubeVerts[e[0]];
        const v1 = cubeVerts[e[1]];
        pushPt(
          (v0[0] + (v1[0] - v0[0]) * t) * 0.13,
          (v0[1] + (v1[1] - v0[1]) * t) * 0.13,
          (v0[2] + (v1[2] - v0[2]) * t) * 0.13,
          1.0,
          0.98,
        );
      }
    } else {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const r = 0.085 * Math.pow(rand(), 0.5);
      pushPt(Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r, 1.0, 0.95);
    }
  }

  // C. 6 Orbiting Track Satellites + Tether Beams (~22%)
  const satellites: [number, number, number][] = [
    [0.98, 0.22, 0.0],
    [-0.96, -0.2, 0.15],
    [0.22, 0.72, 0.62],
    [-0.25, -0.7, -0.64],
    [0.58, -0.45, 0.62],
    [-0.62, 0.44, -0.58],
  ];
  while (i < count) {
    const sat = satellites[Math.floor(rand() * satellites.length)];
    if (rand() < 0.72) {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const r = 0.095 * (0.75 + rand() * 0.25);
      pushPt(
        sat[0] + Math.sin(v) * Math.cos(u) * r,
        sat[1] + Math.cos(v) * r,
        sat[2] + Math.sin(v) * Math.sin(u) * r,
        0.95,
        0.95,
      );
    } else {
      const t = 0.22 + rand() * 0.72;
      pushPt(sat[0] * t, sat[1] * t, sat[2] * t, 0.45 + (1 - t) * 0.45, 0.45);
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
    luminance[i] = lum;
    accentMix[i] = acc;
    i += 1;
  };

  // A. Center Controller Shell (~42%)
  const bodyTarget = Math.floor(count * 0.42);
  while (i < bodyTarget) {
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const nx = Math.sin(v) * Math.cos(u);
    const ny = Math.cos(v);
    const nz = Math.sin(v) * Math.sin(u);
    const edgeGlow = Math.abs(nz) < 0.35 ? 0.78 : 0.42;
    pushPt(nx * 0.92, ny * 0.42 + 0.08, nz * 0.24, edgeGlow + rand() * 0.15, 0.05);
  }

  // B. Left & Right Ergonomic Grips (~28%)
  const gripTarget = i + Math.floor(count * 0.28);
  while (i < gripTarget) {
    const side = rand() < 0.5 ? -1 : 1;
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const gx = Math.sin(v) * Math.cos(u) * 0.32;
    const gy = Math.cos(v) * 0.54;
    const gz = Math.sin(v) * Math.sin(u) * 0.25;
    const angle = side * -0.26;
    const rx = gx * Math.cos(angle) - gy * Math.sin(angle);
    const ry = gx * Math.sin(angle) + gy * Math.cos(angle);
    pushPt(
      side * 0.74 + rx,
      -0.16 + ry,
      gz - 0.04,
      0.36 + Math.max(0, gz + 0.25) * 0.9,
      0.08,
    );
  }

  // C. Crisp 3D D-Pad Cross (~12%)
  const dpadTarget = i + Math.floor(count * 0.12);
  while (i < dpadTarget) {
    const horiz = rand() < 0.5;
    const dx = horiz ? (rand() * 2 - 1) * 0.22 : (rand() * 2 - 1) * 0.07;
    const dy = horiz ? (rand() * 2 - 1) * 0.07 : (rand() * 2 - 1) * 0.22;
    pushPt(-0.48 + dx, 0.1 + dy, 0.24 + rand() * 0.08, 0.96, 0.92);
  }

  // D. 4 Glowing ABXY Buttons (~12%)
  const btns: [number, number][] = [
    [0.48, 0.24],
    [0.48, -0.04],
    [0.34, 0.1],
    [0.62, 0.1],
  ];
  const btnTarget = i + Math.floor(count * 0.12);
  while (i < btnTarget) {
    const b = btns[Math.floor(rand() * btns.length)];
    const u = rand() * Math.PI * 2;
    const r = 0.068 * Math.sqrt(rand());
    pushPt(b[0] + Math.cos(u) * r, b[1] + Math.sin(u) * r, 0.24 + (1 - r / 0.075) * 0.08, 1.0, 0.98);
  }

  // E. Shoulder Triggers + Start/Select Pills (~6%)
  while (i < count) {
    if (rand() < 0.72) {
      const side = rand() < 0.5 ? -1 : 1;
      const t = rand() * 2 - 1;
      pushPt(side * 0.58 + t * 0.22, 0.5 + (rand() - 0.5) * 0.06, (rand() - 0.5) * 0.18, 0.88, 0.85);
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      pushPt(side * 0.09 + (rand() - 0.5) * 0.07, 0.08 + (rand() - 0.5) * 0.03, 0.27, 0.92, 0.95);
    }
  }

  return { positions, luminance, accentMix };
}

function brainRidgeField(x: number, y: number, z: number): number {
  const wx = x + 0.12 * Math.sin(y * 5.2 + z * 4.1);
  const wy = y + 0.12 * Math.cos(z * 5.5 + x * 3.8);
  const wz = z + 0.12 * Math.sin(x * 4.9 - y * 4.4);
  const f1 =
    Math.sin(wx * 11.5 + Math.cos(wy * 9.0)) *
    Math.cos(wz * 10.5 + Math.sin(wx * 8.0));
  const f2 = Math.sin(wy * 18.0 + wz * 14.0) * 0.45;
  const f3 = Math.cos(wx * 24.0 - wz * 21.0 + wy * 16.0) * 0.22;
  return Math.pow(Math.max(0, 1.0 - Math.min(1.0, Math.abs(f1 + f2 + f3) * 0.95)), 0.72);
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
    luminance[i] = lum;
    accentMix[i] = acc;
    i += 1;
  };

  // A. Folded Cortical Brain Core (~68%)
  const brainTarget = Math.floor(count * 0.68);
  while (i < brainTarget) {
    const side = rand() < 0.5 ? -1 : 1;
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const nx = Math.sin(v) * Math.cos(u);
    const ny = Math.cos(v);
    const nz = Math.sin(v) * Math.sin(u);
    let hx = Math.abs(nx);
    if (nx * side < 0) hx *= 0.22;
    const x = side * (0.045 + hx * 0.56);
    let y = ny * 0.52 + 0.08;
    const z = nz * 0.78;
    if (y < -0.02) y *= 0.66;
    const ridge = brainRidgeField(x * 1.35, y * 1.35, z * 1.35);
    const disp = 0.93 + ridge * 0.11;
    pushPt(x * disp, y * disp, z * disp, 0.22 + ridge * 0.78, ridge > 0.86 ? 0.28 : 0.0);
  }

  // B. Orbiting Hexagonal Logic Lattice Halo + Nodes (~18%)
  const hexNodes: [number, number, number][] = [];
  for (let k = 0; k < 6; k += 1) {
    const a = (k / 6) * Math.PI * 2;
    hexNodes.push([Math.cos(a) * 1.02, 0.06 + Math.sin(a * 2) * 0.24, Math.sin(a) * 1.02]);
  }
  const haloTarget = i + Math.floor(count * 0.18);
  while (i < haloTarget) {
    const k = Math.floor(rand() * 6);
    const n0 = hexNodes[k];
    const n1 = hexNodes[(k + 1) % 6];
    if (rand() < 0.55) {
      const t = rand();
      pushPt(
        n0[0] + (n1[0] - n0[0]) * t + (rand() - 0.5) * 0.018,
        n0[1] + (n1[1] - n0[1]) * t + (rand() - 0.5) * 0.018,
        n0[2] + (n1[2] - n0[2]) * t + (rand() - 0.5) * 0.018,
        0.85,
        0.92,
      );
    } else {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const r = 0.075 * Math.sqrt(rand());
      pushPt(
        n0[0] + Math.sin(v) * Math.cos(u) * r,
        n0[1] + Math.cos(v) * r,
        n0[2] + Math.sin(v) * Math.sin(u) * r,
        1.0,
        0.98,
      );
    }
  }

  // C. Synaptic Data Arcs + Brainstem (~14%)
  while (i < count) {
    if (rand() < 0.72) {
      const n = hexNodes[Math.floor(rand() * 6)];
      const t = rand();
      const arch = Math.sin(t * Math.PI) * 0.22;
      pushPt(
        n[0] * (0.45 + t * 0.55),
        n[1] * t + arch,
        n[2] * (0.45 + t * 0.55),
        0.55 + Math.sin(t * Math.PI) * 0.45,
        0.95,
      );
    } else {
      const t = rand();
      const a = rand() * Math.PI * 2;
      const r = 0.13 - t * 0.065;
      pushPt(Math.cos(a) * r, -0.22 - t * 0.48, -0.14 - t * 0.1 + Math.sin(a) * r, 0.35 + (1 - t) * 0.45, 0.05);
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
    case "bytecat_hero":
      data = generateByteCatHero(count);
      break;
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
