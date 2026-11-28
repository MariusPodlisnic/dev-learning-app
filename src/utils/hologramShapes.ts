export const HOLOGRAM_PARTICLE_COUNT = 38000;

/**
 *Kinetic part IDs encoded in `meta[i * 2 + 1]`:
 * - 0: Main floating island, tree, and desk chassis (subtle levitation breath)
 * - 1: Planetary equatorial astrolabe ring & orbital moonlets (continuous spin)
 * - 2: Detached crystal islets, falling sakura petals, coffee steam & waterfall (gentle bob)
 * - 3: Emissive CRT code pixels, golden lantern & crystal veins (luminous pulse)
 */
export interface HologramIslandData {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  /** Interleaved `[sizeMult, partId]` pairs (`count * 2` floats) */
  meta: Float32Array;
}

type Rgb = readonly [number, number, number];

const C = {
  cream: [0.97, 0.95, 0.91] as Rgb,
  creamSh: [0.68, 0.62, 0.84] as Rgb,
  gold: [1.0, 0.87, 0.35] as Rgb,
  goldDp: [0.84, 0.58, 0.16] as Rgb,
  sakura: [1.0, 0.56, 0.91] as Rgb,
  sakuraLt: [1.0, 0.84, 0.97] as Rgb,
  mint: [0.43, 0.92, 0.72] as Rgb,
  lime: [0.72, 1.0, 0.23] as Rgb,
  cyan: [0.22, 0.86, 1.0] as Rgb,
  indigo: [0.36, 0.3, 0.82] as Rgb,
  indigoDp: [0.18, 0.12, 0.46] as Rgb,
  violet: [0.75, 0.52, 0.99] as Rgb,
  obsidian: [0.11, 0.13, 0.23] as Rgb,
  bark: [0.64, 0.42, 0.3] as Rgb,
  barkHi: [0.88, 0.66, 0.46] as Rgb,
  white: [1.0, 0.99, 1.0] as Rgb,
};

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function mixCol(a: Rgb, b: Rgb, t: number): Rgb {
  const u = clamp01(t);
  return [
    a[0] + (b[0] - a[0]) * u,
    a[1] + (b[1] - a[1]) * u,
    a[2] + (b[2] - a[2]) * u,
  ];
}

function halton(index: number, base: number): number {
  let result = 0;
  let f = 1 / base;
  let i = index;
  while (i > 0) {
    result += f * (i % base);
    i = Math.floor(i / base);
    f /= base;
  }
  return result;
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

function rotXYZ(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
): [number, number, number] {
  let y1 = y;
  let z1 = z;
  if (rx !== 0) {
    const c = Math.cos(rx);
    const s = Math.sin(rx);
    y1 = y * c - z * s;
    z1 = y * s + z * c;
  }
  let x2 = x;
  let z2 = z1;
  if (ry !== 0) {
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    x2 = x * c + z1 * s;
    z2 = -x * s + z1 * c;
  }
  let x3 = x2;
  let y3 = y1;
  if (rz !== 0) {
    const c = Math.cos(rz);
    const s = Math.sin(rz);
    x3 = x2 * c - y1 * s;
    y3 = x2 * s + y1 * c;
  }
  return [x3, y3, z2];
}

function generateFloatingDevIsland(maxPts: number): HologramIslandData {
  const positions = new Float32Array(maxPts * 3);
  const normals = new Float32Array(maxPts * 3);
  const colors = new Float32Array(maxPts * 3);
  const meta = new Float32Array(maxPts * 2);
  const rand = createRng(2026);
  let idx = 0;

  const push = (
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    col: Rgb,
    sizeMult = 1.0,
    partId = 0,
  ) => {
    if (idx >= maxPts) return;
    const len = Math.hypot(nx, ny, nz) || 1;
    positions[idx * 3] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = z;
    normals[idx * 3] = nx / len;
    normals[idx * 3 + 1] = ny / len;
    normals[idx * 3 + 2] = nz / len;
    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];
    meta[idx * 2] = sizeMult;
    meta[idx * 2 + 1] = partId;
    idx += 1;
  };

  const addEllipsoid = (
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    ry: number,
    rz: number,
    count: number,
    opts: {
      power?: number;
      colorFn?: (nx: number, ny: number, nz: number) => Rgb;
      size?: number;
      part?: number;
    } = {},
  ) => {
    const { power = 1.0, colorFn, size = 1.0, part = 0 } = opts;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let k = 0; k < count; k += 1) {
      const ny0 = -1 + (2 * (k + 0.5)) / count;
      const rad = Math.sqrt(Math.max(0, 1 - ny0 * ny0));
      const th = k * golden;
      const nx0 = Math.cos(th) * rad;
      const nz0 = Math.sin(th) * rad;
      const sp = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), power);
      const col = colorFn ? colorFn(nx0, ny0, nz0) : C.cream;
      push(
        cx + sp(nx0) * rx,
        cy + sp(ny0) * ry,
        cz + sp(nz0) * rz,
        nx0,
        ny0,
        nz0,
        col,
        size,
        part,
      );
    }
  };

  const addCrispBox = (
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    count: number,
    opts: {
      rxRot?: number;
      ryRot?: number;
      rzRot?: number;
      edgeRatio?: number;
      colorFn?: (
        ux: number,
        uy: number,
        uz: number,
        isEdge: boolean,
        face: number,
      ) => Rgb;
      size?: number;
      part?: number;
    } = {},
  ) => {
    const {
      rxRot = 0,
      ryRot = 0,
      rzRot = 0,
      edgeRatio = 0.46,
      colorFn,
      size = 1.0,
      part = 0,
    } = opts;
    const edgePts = Math.floor(count * edgeRatio);
    const facePts = count - edgePts;

    for (let k = 0; k < edgePts; k += 1) {
      const edgeIdx = k % 12;
      const t =
        ((Math.floor(k / 12) + 0.5) / Math.max(1, Math.ceil(edgePts / 12))) * 2 -
        1;
      const axis = Math.floor(edgeIdx / 4);
      const b1 = edgeIdx & 1 ? 1 : -1;
      const b2 = edgeIdx & 2 ? 1 : -1;
      let lx = 0;
      let ly = 0;
      let lz = 0;
      if (axis === 0) {
        lx = t * sx;
        ly = b1 * sy;
        lz = b2 * sz;
      } else if (axis === 1) {
        lx = b1 * sx;
        ly = t * sy;
        lz = b2 * sz;
      } else {
        lx = b1 * sx;
        ly = b2 * sy;
        lz = t * sz;
      }
      const [wx, wy, wz] = rotXYZ(lx, ly, lz, rxRot, ryRot, rzRot);
      const [wnx, wny, wnz] = rotXYZ(
        lx / (sx || 1),
        ly / (sy || 1),
        lz / (sz || 1),
        rxRot,
        ryRot,
        rzRot,
      );
      const col = colorFn
        ? colorFn(lx / (sx || 1), ly / (sy || 1), lz / (sz || 1), true, 4)
        : C.cream;
      push(cx + wx, cy + wy, cz + wz, wnx, wny, wnz, col, size * 1.12, part);
    }

    for (let k = 0; k < facePts; k += 1) {
      const face = k % 6;
      const hIdx = Math.floor(k / 6) + 1;
      const u = halton(hIdx, 2) * 2 - 1;
      const v = halton(hIdx, 3) * 2 - 1;
      let ux = 0;
      let uy = 0;
      let uz = 0;
      let nx = 0;
      let ny = 0;
      let nz = 0;
      if (face === 0) {
        ux = 1;
        uy = u;
        uz = v;
        nx = 1;
      } else if (face === 1) {
        ux = -1;
        uy = u;
        uz = v;
        nx = -1;
      } else if (face === 2) {
        ux = u;
        uy = 1;
        uz = v;
        ny = 1;
      } else if (face === 3) {
        ux = u;
        uy = -1;
        uz = v;
        ny = -1;
      } else if (face === 4) {
        ux = u;
        uy = v;
        uz = 1;
        nz = 1;
      } else {
        ux = u;
        uy = v;
        uz = -1;
        nz = -1;
      }
      const [wx, wy, wz] = rotXYZ(ux * sx, uy * sy, uz * sz, rxRot, ryRot, rzRot);
      const [wnx, wny, wnz] = rotXYZ(nx, ny, nz, rxRot, ryRot, rzRot);
      const col = colorFn ? colorFn(ux, uy, uz, false, face) : C.cream;
      push(cx + wx, cy + wy, cz + wz, wnx, wny, wnz, col, size * 0.92, part);
    }
  };

  const addTube = (
    curveFn: (t: number) => [number, number, number],
    steps: number,
    ringPts: number,
    radiusFn: number | ((t: number) => number),
    colorFn: (t: number, ang: number, ridge: number) => Rgb,
    size = 1.0,
    part = 0,
    barkTwist = 0,
  ) => {
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      const p = curveFn(t);
      const pNext = curveFn(Math.min(1, t + 0.01));
      const pPrev = curveFn(Math.max(0, t - 0.01));
      let tx = pNext[0] - pPrev[0];
      let ty = pNext[1] - pPrev[1];
      let tz = pNext[2] - pPrev[2];
      const tLen = Math.hypot(tx, ty, tz) || 1;
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;

      let ux = 0;
      let uy = 1;
      const uz = 0;
      if (Math.abs(ty) > 0.92) {
        ux = 1;
        uy = 0;
      }
      let bx = ty * uz - tz * uy;
      let by = tz * ux - tx * uz;
      let bz = tx * uy - ty * ux;
      const bLen = Math.hypot(bx, by, bz) || 1;
      bx /= bLen;
      by /= bLen;
      bz /= bLen;
      const nx = by * tz - bz * ty;
      const ny = bz * tx - bx * tz;
      const nz = bx * ty - by * tx;

      const baseR = typeof radiusFn === "function" ? radiusFn(t) : radiusFn;
      for (let r = 0; r < ringPts; r += 1) {
        const ang = (r / ringPts) * Math.PI * 2 + (s % 2) * (Math.PI / ringPts);
        const ridge = barkTwist ? 1 + 0.15 * Math.sin(ang * 5 + t * barkTwist) : 1;
        const rad = baseR * ridge;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const snx = bx * ca + nx * sa;
        const sny = by * ca + ny * sa;
        const snz = bz * ca + nz * sa;
        push(
          p[0] + snx * rad,
          p[1] + sny * rad,
          p[2] + snz * rad,
          snx,
          sny,
          snz,
          colorFn(t, ang, ridge),
          size,
          part,
        );
      }
    }
  };

  const addRing = (
    cx: number,
    cy: number,
    cz: number,
    R: number,
    r: number,
    uSteps: number,
    vSteps: number,
    tiltX: number,
    tiltZ: number,
    tickEvery: number,
    colorFn: (isTick: boolean) => Rgb,
    size = 1.0,
    part = 1,
  ) => {
    for (let u = 0; u < uSteps; u += 1) {
      const a = (u / uSteps) * Math.PI * 2;
      const isTick = tickEvery > 0 && u % tickEvery === 0;
      const rr = isTick ? r * 2.3 : r;
      for (let v = 0; v < vSteps; v += 1) {
        const b = (v / vSteps) * Math.PI * 2;
        const lx = (R + Math.cos(b) * rr) * Math.cos(a);
        const ly = Math.sin(b) * rr;
        const lz = (R + Math.cos(b) * rr) * Math.sin(a);
        const nx0 = Math.cos(b) * Math.cos(a);
        const ny0 = Math.sin(b);
        const nz0 = Math.cos(b) * Math.sin(a);
        const [wx, wy, wz] = rotXYZ(lx, ly, lz, tiltX, 0, tiltZ);
        const [wnx, wny, wnz] = rotXYZ(nx0, ny0, nz0, tiltX, 0, tiltZ);
        push(
          cx + wx,
          cy + wy,
          cz + wz,
          wnx,
          wny,
          wnz,
          colorFn(isTick),
          isTick ? size * 1.25 : size,
          part,
        );
      }
    }
  };

  const addBotanicalCluster = (
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    ry: number,
    rz: number,
    count: number,
  ) => {
    const puffs: readonly [number, number, number, number, number, number, number][] = [
      [0, 0.18, 0, 0.68, 0.78, 0.68, 0.24],
      [-0.42, -0.06, 0.18, 0.58, 0.68, 0.56, 0.2],
      [0.44, -0.04, 0.14, 0.56, 0.66, 0.54, 0.2],
      [-0.22, -0.08, -0.36, 0.54, 0.64, 0.54, 0.18],
      [0.26, -0.06, -0.34, 0.54, 0.64, 0.54, 0.18],
    ];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (const [ox, oy, oz, sx, sy, sz, weight] of puffs) {
      const subCount = Math.floor(count * weight);
      for (let k = 0; k < subCount; k += 1) {
        const frac = (k + 0.5) / subCount;
        const ny = Math.max(-1, Math.min(1, -0.65 + 1.65 * frac));
        const rad = Math.sqrt(Math.max(0, 1 - ny * ny));
        const th = k * golden;
        const shell = 0.8 + 0.22 * halton(k + 1, 5);
        const lx = (ox + Math.cos(th) * rad * sx * shell) * rx;
        const ly = (oy + ny * sy * shell) * ry;
        const lz = (oz + Math.sin(th) * rad * sz * shell) * rz;
        const col = ny > 0.35 ? C.sakuraLt : ny < -0.25 ? C.violet : C.sakura;
        push(
          cx + lx,
          cy + ly,
          cz + lz,
          Math.cos(th) * rad,
          ny,
          Math.sin(th) * rad,
          col,
          1.14,
          0,
        );
      }
    }
  };

  // ── 1. Lush Circular Sky-Island Terrace Plateau + Stepping-Stone Path (~5,100 pts) ──
  const topPts = 5100;
  for (let k = 0; k < topPts; k += 1) {
    const r = Math.sqrt(halton(k + 1, 2)) * 0.85;
    const a = halton(k + 1, 3) * Math.PI * 2;
    const rimBump = 1 + 0.06 * Math.sin(a * 7) + 0.04 * Math.cos(a * 11);
    const rx = Math.cos(a) * r * rimBump;
    const rz = Math.sin(a) * r * rimBump;
    const isRim = r > 0.78;
    const onPath = Math.abs(rx - 0.16 * Math.sin(rz * 4.2)) < 0.11 && rz > -0.12;
    const col = onPath
      ? C.creamSh
      : isRim
        ? C.lime
        : mixCol(C.mint, C.lime, r / 0.85);
    push(rx, -0.12 + (isRim ? 0.015 : 0), rz, 0, 1, 0, col, isRim ? 1.15 : 0.96, 0);
  }

  // ── 2. Faceted Low-Poly Crystal Cliff Underside + Glowing Cyan Veins (~7,000 pts) ──
  const cliffRings = 50;
  const cliffSegs = 140;
  for (let u = 0; u < cliffRings; u += 1) {
    const h = u / (cliffRings - 1);
    const y = -0.13 - h * 0.85;
    const baseR = 0.85 * Math.pow(1 - h, 0.72);
    for (let v = 0; v < cliffSegs; v += 1) {
      const a = (v / cliffSegs) * Math.PI * 2;
      const facet =
        1 + 0.13 * Math.cos(a * 7 + h * 1.6) + 0.07 * Math.sin(a * 13 - h * 3.0);
      const rr = baseR * facet;
      const x = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      const crystalVein =
        Math.abs(Math.sin(a * 3.5 + h * 4.2)) > 0.95 && h > 0.16 && h < 0.86;
      const ridgeCrest = Math.cos(a * 7 + h * 1.6) > 0.78;
      const col = crystalVein
        ? C.cyan
        : ridgeCrest
          ? C.violet
          : mixCol(C.indigo, C.indigoDp, h);
      push(
        x,
        y,
        z,
        Math.cos(a),
        -0.45,
        Math.sin(a),
        col,
        crystalVein ? 1.3 : 0.96,
        crystalVein ? 3 : 0,
      );
    }
  }

  // ── 3. Overarching Gnarled Sakura Tree + Roots + 5 Botanical Canopy Pads (~11,500 pts) ──
  for (let rt = 0; rt < 4; rt += 1) {
    const ra = (rt / 4) * Math.PI * 2 + 0.4;
    addTube(
      (t) => [
        -0.46 + Math.cos(ra) * (0.05 + t * 0.18),
        -0.1 + -t * 0.03,
        -0.18 + Math.sin(ra) * (0.05 + t * 0.18),
      ],
      12,
      8,
      (t) => 0.036 * (1 - t * 0.6),
      (_, __, ridge) => (ridge > 1.04 ? C.barkHi : C.bark),
      0.98,
      0,
      10,
    );
  }
  addTube(
    (t) => [
      -0.46 + Math.pow(t, 1.4) * 0.34,
      -0.12 + t * 0.76 - Math.pow(t, 3) * 0.08,
      -0.18 + Math.sin(t * 3.1) * 0.1,
    ],
    68,
    18,
    (t) => 0.076 * (1 - t * 0.62),
    (_, __, ridge) => mixCol(C.bark, C.barkHi, ridge > 1.05 ? 0.85 : 0.25),
    1.04,
    0,
    15,
  );
  addTube(
    (t) => [-0.38 - t * 0.25, 0.16 + t * 0.3, -0.12 + t * 0.18],
    38,
    12,
    (t) => 0.044 * (1 - t * 0.55),
    () => C.bark,
    0.98,
    0,
    10,
  );
  addTube(
    (t) => [-0.26 + t * 0.32, 0.38 + t * 0.18, -0.14 - t * 0.08],
    30,
    10,
    (t) => 0.036 * (1 - t * 0.5),
    () => C.barkHi,
    0.96,
    0,
    8,
  );

  const sakuraPads: readonly [number, number, number, number, number, number, number][] = [
    [-0.12, 0.65, -0.1, 0.37, 0.16, 0.31, 3200],
    [-0.44, 0.54, -0.06, 0.3, 0.14, 0.25, 2400],
    [-0.64, 0.45, 0.07, 0.24, 0.12, 0.21, 1800],
    [0.18, 0.56, -0.14, 0.27, 0.13, 0.22, 1950],
    [-0.28, 0.46, -0.28, 0.22, 0.11, 0.19, 1300],
  ];
  for (const [px, py, pz, rx, ry, rz, cnt] of sakuraPads) {
    addBotanicalCluster(px, py, pz, rx, ry, rz, cnt);
  }

  // ── 4. Cozy Coding Desk + Cat-Ear Bubble CRT + Keyboard + Mug + Chair + Lantern (~6,400 pts) ──
  addCrispBox(0.22, 0.04, 0.08, 0.29, 0.022, 0.165, 1050, {
    edgeRatio: 0.56,
    colorFn: (_, __, ___, edge) => (edge ? C.gold : C.barkHi),
    size: 1.06,
  });
  for (const lx of [-0.25, 0.25]) {
    for (const lz of [-0.13, 0.13]) {
      addCrispBox(0.22 + lx, -0.04, 0.08 + lz, 0.018, 0.08, 0.018, 120, {
        colorFn: () => C.creamSh,
      });
    }
  }

  // Cat-Eared Bubble CRT Monitor + Glowing Multi-Line Syntax Pixels
  addCrispBox(0.22, 0.195, 0.035, 0.155, 0.122, 0.1, 1550, {
    edgeRatio: 0.52,
    colorFn: (ux, uy, _, edge, face) => {
      if (face === 4 && Math.abs(ux) < 0.82 && Math.abs(uy) < 0.78) return C.obsidian;
      return edge ? C.cream : C.creamSh;
    },
    size: 1.08,
  });
  // Cute mini Devy golden cat-ears on top of CRT!
  for (const side of [-1, 1]) {
    for (let e = 0; e < 120; e += 1) {
      const h = halton(e + 1, 2);
      const a = halton(e + 1, 3) * Math.PI * 2;
      const r = (1 - h) * 0.032;
      push(
        0.22 + side * (0.09 + h * 0.018) + Math.cos(a) * r,
        0.318 + h * 0.068,
        0.04 + Math.sin(a) * r * 0.6,
        0,
        1,
        0,
        C.gold,
        1.18,
        0,
      );
    }
  }
  // Syntax-highlighted code lines on CRT glass
  const miniCode = [
    "$$.#####...",
    "..####.###.",
    "..###..###.",
    "$$..#####..",
    "..######...",
  ];
  for (let r = 0; r < miniCode.length; r += 1) {
    const row = miniCode[r];
    for (let c = 0; c < row.length; c += 1) {
      const ch = row[c];
      if (ch === ".") continue;
      const px = 0.22 + (c - (row.length - 1) * 0.5) * 0.02;
      const py = 0.24 - r * 0.023;
      const col = ch === "$" ? C.gold : C.cyan;
      for (let d = 0; d < 5; d += 1) {
        push(
          px + ((d % 2) - 0.5) * 0.005,
          py + (Math.floor(d / 2) - 1) * 0.004,
          0.142,
          0,
          0,
          1,
          col,
          1.34,
          3,
        );
      }
    }
  }

  // 65% Mechanical Keyboard + Steaming Coffee Mug on Desk
  addCrispBox(0.2, 0.072, 0.175, 0.105, 0.012, 0.042, 480, {
    edgeRatio: 0.6,
    colorFn: (_, __, ___, edge) => (edge ? C.sakura : C.cream),
    size: 1.06,
  });
  addEllipsoid(0.41, 0.088, 0.15, 0.028, 0.032, 0.028, 220, {
    power: 0.82,
    colorFn: (_, ny) => (ny > 0.65 ? C.gold : C.cream),
    size: 1.1,
  });
  for (let st = 0; st < 95; st += 1) {
    const h = st / 95;
    const a = h * 9.0;
    push(
      0.41 + Math.cos(a) * 0.012,
      0.13 + h * 0.11,
      0.15 + Math.sin(a) * 0.012,
      0,
      1,
      0,
      C.gold,
      1.08,
      2,
    );
  }

  // Cozy Studio Chair tucked in front of desk + Curled Sleeping Pixel Cat beside desk
  addCrispBox(0.21, -0.02, 0.34, 0.075, 0.018, 0.072, 280, {
    ryRot: -0.22,
    edgeRatio: 0.55,
    colorFn: (_, __, ___, edge) => (edge ? C.cyan : C.indigo),
    size: 1.0,
  });
  addCrispBox(0.225, 0.055, 0.4, 0.072, 0.068, 0.016, 280, {
    ryRot: -0.22,
    edgeRatio: 0.55,
    colorFn: (_, __, ___, edge) => (edge ? C.sakura : C.indigo),
    size: 1.0,
  });
  // Sleeping Pixel Cat on warm mat (-0.12, -0.095, 0.24)
  addEllipsoid(-0.12, -0.092, 0.24, 0.068, 0.042, 0.055, 340, {
    colorFn: (_, ny) => (ny > 0.2 ? C.sakuraLt : C.sakura),
    size: 1.12,
  });

  // Warm Golden Japanese Street/Garden Lantern Post
  addTube(
    (t) => [0.58, -0.12 + t * 0.46, -0.12],
    28,
    10,
    0.018,
    () => C.creamSh,
    1.0,
    0,
  );
  addEllipsoid(0.58, 0.37, -0.12, 0.068, 0.078, 0.068, 680, {
    power: 0.8,
    colorFn: (_, ny) => (Math.abs(ny) > 0.8 ? C.obsidian : C.gold),
    size: 1.36,
    part: 3,
  });

  // ── 5. Detached Bobbing Crystal Islets + Falling Petals + Stardust Waterfall (~3,900 pts) ──
  const islets: readonly [number, number, number, number][] = [
    [-0.86, -0.28, 0.28, 0.135],
    [0.85, -0.36, -0.22, 0.15],
    [0.54, -0.68, 0.46, 0.115],
    [-0.52, -0.74, -0.44, 0.12],
  ];
  for (const [ix, iy, iz, ir] of islets) {
    addEllipsoid(ix, iy, iz, ir, ir * 0.75, ir * 0.9, 560, {
      power: 1.25,
      colorFn: (_, ny) => (ny > 0.25 ? C.mint : C.indigo),
      size: 1.06,
      part: 2,
    });
  }

  for (let p = 0; p < 1650; p += 1) {
    const u = halton(p + 1, 2);
    const v = halton(p + 1, 3);
    if (p < 920) {
      const a = v * Math.PI * 2;
      const r = 0.14 + u * 0.56;
      push(
        -0.25 + Math.cos(a) * r,
        0.0 + halton(p + 1, 5) * 0.58,
        Math.sin(a) * r,
        0,
        1,
        0,
        p % 3 === 0 ? C.gold : C.sakuraLt,
        1.16,
        2,
      );
    } else {
      const h = u;
      const spread = 0.04 + h * 0.062;
      const a = v * Math.PI * 2;
      push(
        -0.18 + Math.cos(a) * spread,
        -0.14 - h * 0.88,
        0.79 * (1 - h * 0.45) + Math.sin(a) * spread,
        0,
        0,
        1,
        mixCol(C.cyan, C.white, 1 - h * 0.5),
        1.14,
        2,
      );
    }
  }

  // ── 6. Spinning Planetary Equatorial Vernier Ring + 3 Mini Moons + Base Aura (~4,100 pts) ──
  addRing(
    0,
    -0.1,
    0,
    1.09,
    0.013,
    180,
    9,
    0.18,
    -0.12,
    15,
    (tick) => (tick ? C.gold : C.cyan),
    1.0,
    1,
  );
  const moonColors = [C.gold, C.sakura, C.mint];
  for (let m = 0; m < 3; m += 1) {
    const ma = (m / 3) * Math.PI * 2 + 0.6;
    const lx = Math.cos(ma) * 1.09;
    const lz = Math.sin(ma) * 1.09;
    const [wx, wy, wz] = rotXYZ(lx, 0, lz, 0.18, 0, -0.12);
    addEllipsoid(wx, -0.1 + wy, wz, 0.048, 0.048, 0.048, 280, {
      colorFn: () => moonColors[m],
      size: 1.24,
      part: 1,
    });
  }

  // Subtle levitation aura rings beneath island crystal tip + gentle ambient fireflies
  let motes = 0;
  while (idx < maxPts) {
    if (motes < 240) {
      const a = rand() * Math.PI * 2;
      const r = 0.72 + rand() * 0.46;
      const y = (rand() - 0.5) * 1.1;
      push(
        Math.cos(a) * r,
        y,
        Math.sin(a) * r,
        0,
        1,
        0,
        rand() < 0.5 ? C.gold : C.cyan,
        0.78,
        2,
      );
      motes += 1;
    } else {
      const a = ((idx % 720) / 720) * Math.PI * 2;
      const ringR = idx % 2 === 0 ? 0.56 : 0.36;
      push(
        Math.cos(a) * ringR,
        -0.96,
        Math.sin(a) * ringR,
        0,
        1,
        0,
        idx % 24 === 0 ? C.gold : C.indigo,
        0.84,
        1,
      );
    }
  }

  return { positions, normals, colors, meta };
}

const islandCache = new Map<number, HologramIslandData>();

export function getFloatingDevIslandData(
  count: number = HOLOGRAM_PARTICLE_COUNT,
): HologramIslandData {
  const cached = islandCache.get(count);
  if (cached) return cached;
  const data = generateFloatingDevIsland(count);
  islandCache.set(count, data);
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
