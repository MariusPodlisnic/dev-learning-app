import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  HardShadow,
  MonoFont,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  getAmbientMixerState,
  subscribeAmbientMixer,
} from "../utils/ambientSoundscapes";
import {
  getLofiRadioState,
  subscribeLofiRadio,
} from "../utils/lofiRadio";
import {
  computeIsoMetrics,
  getLoftThemeColors,
  getWindowGlassPolygon,
  LOFT_GROUNDED_FURNITURE,
  LOFT_WINDOW_GLASS,
  pointInPolygon,
  projectIso,
  type IsoMetrics,
  type LoftHighlightZone,
  type Point2D,
} from "../utils/loftGeometry";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface HomeLoftStageProps {
  activeZone: LoftHighlightZone;
  streakCount?: number;
  compact?: boolean;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  kind: "heart" | "note" | "spark";
  char: string;
  color: string;
}

interface WindowRainDrop {
  uFrac: number;
  zFrac: number;
  speed: number;
  len: number;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tracePoly(ctx: CanvasRenderingContext2D, pts: readonly Point2D[]) {
  if (pts.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function drawIsoQuad(
  ctx: CanvasRenderingContext2D,
  m: IsoMetrics,
  coords: readonly [number, number, number][],
  fill: string,
  stroke?: string,
  lineWidth = 1.6,
) {
  const pts = coords.map(([u, v, z]) => projectIso(m, u, v, z));
  tracePoly(ctx, pts);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  return pts;
}

function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  m: IsoMetrics,
  u0: number,
  v0: number,
  z0: number,
  du: number,
  dv: number,
  dz: number,
  topCol: string,
  leftCol: string,
  rightCol: string,
  strokeCol = "#090B10",
  lineWidth = 1.6,
) {
  const u1 = u0 + du;
  const v1 = v0 + dv;
  const z1 = z0 + dz;

  // Front-left face (v = v1)
  drawIsoQuad(
    ctx,
    m,
    [
      [u0, v1, z1],
      [u1, v1, z1],
      [u1, v1, z0],
      [u0, v1, z0],
    ],
    leftCol,
    strokeCol,
    lineWidth,
  );
  // Front-right face (u = u1)
  drawIsoQuad(
    ctx,
    m,
    [
      [u1, v0, z1],
      [u1, v1, z1],
      [u1, v1, z0],
      [u1, v0, z0],
    ],
    rightCol,
    strokeCol,
    lineWidth,
  );
  // Top face (z = z1)
  drawIsoQuad(
    ctx,
    m,
    [
      [u0, v0, z1],
      [u1, v0, z1],
      [u1, v1, z1],
      [u0, v1, z1],
    ],
    topCol,
    strokeCol,
    lineWidth,
  );
}

function drawFloorShadow(
  ctx: CanvasRenderingContext2D,
  m: IsoMetrics,
  u0: number,
  v0: number,
  du: number,
  dv: number,
  alpha = 0.42,
) {
  const pad = 0.018;
  drawIsoQuad(
    ctx,
    m,
    [
      [u0 - pad, v0 - pad, 0.002],
      [u0 + du + pad, v0 - pad, 0.002],
      [u0 + du + pad, v0 + dv + pad, 0.002],
      [u0 - pad, v0 + dv + pad, 0.002],
    ],
    `rgba(5, 7, 14, ${alpha})`,
  );
}

export default function HomeLoftStage({
  activeZone,
  streakCount = 0,
  compact = false,
}: HomeLoftStageProps) {
  const { paletteId, themeMode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const hostRef = useRef<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 1900);
  }, []);

  const stateRef = useRef<{
    paletteId: typeof paletteId;
    themeMode: typeof themeMode;
    activeZone: LoftHighlightZone;
    streakCount: number;
    lampOn: boolean;
    rainOn: boolean;
    lofiPlaying: boolean;
    steamBoost: number;
    catHappy: number;
    mouseX: number;
    mouseY: number;
    smoothMx: number;
    smoothMy: number;
    particles: FloatingParticle[];
    noteCooldown: number;
    hitZones: {
      window: Point2D[];
      lamp: Point2D[];
      mug: Point2D[];
      cat: Point2D[];
      arcade: Point2D[];
      bonsai: Point2D[];
    };
    showToast: (msg: string) => void;
  }>({
    paletteId,
    themeMode,
    activeZone,
    streakCount,
    lampOn: true,
    rainOn: true,
    lofiPlaying: getLofiRadioState().isPlaying,
    steamBoost: 0,
    catHappy: 0,
    mouseX: 0,
    mouseY: 0,
    smoothMx: 0,
    smoothMy: 0,
    particles: [],
    noteCooldown: 0,
    hitZones: {
      window: [],
      lamp: [],
      mug: [],
      cat: [],
      arcade: [],
      bonsai: [],
    },
    showToast,
  });

  useEffect(() => {
    stateRef.current.paletteId = paletteId;
    stateRef.current.themeMode = themeMode;
    stateRef.current.activeZone = activeZone;
    stateRef.current.streakCount = streakCount;
    stateRef.current.showToast = showToast;
  }, [activeZone, paletteId, showToast, streakCount, themeMode]);

  useEffect(() => {
    const syncLofi = (radio: { isPlaying: boolean }) => {
      stateRef.current.lofiPlaying = radio.isPlaying;
    };
    const syncAmbient = (mix: { isPlaying: boolean; volumes: { rain: number } }) => {
      if (mix.isPlaying && mix.volumes.rain > 0) {
        stateRef.current.rainOn = true;
      } else if (!mix.isPlaying && mix.volumes.rain === 0) {
        // Keep user's visual rain toggle unless explicitly muted after enabling
      }
    };
    syncLofi(getLofiRadioState());
    syncAmbient(getAmbientMixerState());
    const unsubLofi = subscribeLofiRadio(syncLofi);
    const unsubAmbient = subscribeAmbientMixer(syncAmbient);
    return () => {
      unsubLofi();
      unsubAmbient();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const hostEl = hostRef.current as HTMLElement | null;
    if (!hostEl) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute(
      "style",
      "position:absolute;inset:0;width:100%;height:100%;display:block;cursor:default;",
    );
    hostEl.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rng = makeRng(4242);
    const rainDrops: WindowRainDrop[] = Array.from({ length: 34 }, () => ({
      uFrac: rng(),
      zFrac: rng(),
      speed: 0.42 + rng() * 0.46,
      len: 0.075 + rng() * 0.085,
    }));
    const windowStars = Array.from({ length: 18 }, () => ({
      vFrac: 0.05 + rng() * 0.9,
      zFrac: 0.45 + rng() * 0.5,
      phase: rng() * Math.PI * 2,
    }));

    let stageW = 680;
    let stageH = 440;
    let dpr = 1;

    const syncSize = () => {
      const rect = hostEl.getBoundingClientRect();
      stageW = Math.max(260, rect.width || 680);
      stageH = Math.max(240, rect.height || 440);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(stageW * dpr);
      canvas.height = Math.round(stageH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(hostEl);
    } else {
      window.addEventListener("resize", syncSize);
    }

    const spawnParticles = (
      x: number,
      y: number,
      kind: FloatingParticle["kind"],
      count: number,
      color: string,
    ) => {
      const chars =
        kind === "heart"
          ? ["♥"]
          : kind === "note"
            ? ["♪", "♫"]
            : ["✦", "·"];
      for (let i = 0; i < count; i += 1) {
        stateRef.current.particles.push({
          x: x + (Math.random() - 0.5) * 22,
          y: y - Math.random() * 10,
          vx: (Math.random() - 0.5) * 18,
          vy: -22 - Math.random() * 24,
          life: 1,
          kind,
          char: chars[i % chars.length],
          color,
        });
      }
    };

    const hitTestPoint = (pt: Point2D): keyof typeof stateRef.current.hitZones | null => {
      const hz = stateRef.current.hitZones;
      // Front-most interactive props checked first
      const order: (keyof typeof hz)[] = [
        "cat",
        "mug",
        "lamp",
        "bonsai",
        "arcade",
        "window",
      ];
      for (const key of order) {
        if (hz[key].length >= 3 && pointInPolygon(pt, hz[key])) {
          return key;
        }
      }
      return null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      stateRef.current.mouseX = (x / Math.max(1, rect.width)) * 2 - 1;
      stateRef.current.mouseY = (y / Math.max(1, rect.height)) * 2 - 1;
      canvas.style.cursor = hitTestPoint({ x, y }) ? "pointer" : "default";
    };

    const onPointerLeave = () => {
      stateRef.current.mouseX = 0;
      stateRef.current.mouseY = 0;
      canvas.style.cursor = "default";
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const hit = hitTestPoint(pt);
      const st = stateRef.current;
      const pal = getLoftThemeColors(st.paletteId, st.themeMode);

      if (hit === "lamp") {
        st.lampOn = !st.lampOn;
        playKeyClick();
        st.showToast(st.lampOn ? "DESK LAMP: WARM GLOW ON" : "DESK LAMP: DIMMED");
      } else if (hit === "window") {
        st.rainOn = !st.rainOn;
        playKeyClick();
        st.showToast(st.rainOn ? "COZY WINDOW RAIN: ON" : "CLEAR STARRY SKY");
      } else if (hit === "mug") {
        st.steamBoost = 1.5;
        playKeyClick();
        spawnParticles(pt.x, pt.y - 8, "spark", 4, pal.accentSecondary);
        st.showToast("FRESH HOT BREW AT YOUR DESK");
      } else if (hit === "cat") {
        st.catHappy = 2.0;
        playSuccessChime();
        spawnParticles(pt.x, pt.y - 12, "heart", 6, pal.accentPink);
        st.showToast("LOFT CAT PURRS HAPPILY (^ ω ^)");
      } else if (hit === "bonsai") {
        playKeyClick();
        spawnParticles(pt.x, pt.y - 12, "spark", 6, pal.bonsaiBlossom);
        st.showToast(
          st.streakCount > 0
            ? `STREAK BONSAI · ${st.streakCount}D BLOOM`
            : "COZY DESK BONSAI",
        );
      } else if (hit === "arcade") {
        playKeyClick();
        spawnParticles(pt.x, pt.y - 16, "spark", 5, pal.accentPink);
        st.showToast("ARCADE CABINET READY · 6 CARTRIDGES");
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onClick);

    const drawLoftScene = (t: number, dt: number) => {
      const st = stateRef.current;
      const pal = getLoftThemeColors(st.paletteId, st.themeMode);

      st.smoothMx += (st.mouseX - st.smoothMx) * Math.min(1, dt * 5);
      st.smoothMy += (st.mouseY - st.smoothMy) * Math.min(1, dt * 5);
      st.steamBoost = Math.max(0, st.steamBoost - dt * 0.75);
      st.catHappy = Math.max(0, st.catHappy - dt * 0.85);

      const m = computeIsoMetrics(
        stageW,
        stageH,
        st.smoothMx * 5.5,
        st.smoothMy * 3.5,
      );

      // 0. Soft atmospheric studio vignette backdrop
      const bg = ctx.createRadialGradient(
        stageW * 0.5,
        stageH * 0.44,
        24,
        stageW * 0.5,
        stageH * 0.5,
        stageW * 0.72,
      );
      bg.addColorStop(0, pal.backdropStart);
      bg.addColorStop(1, pal.backdropEnd);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, stageW, stageH);

      // Soft floating ambient glow directly under the cutaway loft island
      const floorCenter = projectIso(m, 0.5, 0.5, -0.05);
      const underGlow = ctx.createRadialGradient(
        floorCenter.x,
        floorCenter.y + 12,
        14,
        floorCenter.x,
        floorCenter.y + 12,
        m.halfW * 1.12,
      );
      underGlow.addColorStop(0, `${pal.accent}24`);
      underGlow.addColorStop(1, "transparent");
      ctx.fillStyle = underGlow;
      ctx.fillRect(0, 0, stageW, stageH);

      // 1. ARCHITECTURAL LOFT CUTAWAY SHELL (Exact 3D Slab + Walls + Baseboards)
      // Cutaway floor base thickness (z = -0.085..0)
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 1, 0],
          [1, 1, 0],
          [1, 1, -0.085],
          [0, 1, -0.085],
        ],
        pal.floorRim,
        "#090B10",
        2,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [1, 0, 0],
          [1, 1, 0],
          [1, 1, -0.085],
          [1, 0, -0.085],
        ],
        "#0C0F18",
        "#090B10",
        2,
      );

      // Left-Back Wall (u = 0, v = 0..1, z = 0..0.96) + outer wall rim
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 0, 0.96],
          [0, 1, 0.96],
          [0, 1, 0],
          [0, 0, 0],
        ],
        pal.wallLeft,
        "#090B10",
        2.2,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [-0.04, 0, 0.96],
          [0, 0, 0.96],
          [0, 1, 0.96],
          [-0.04, 1, 0.96],
        ],
        pal.wallEdge,
        "#090B10",
        1.5,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [-0.04, 1, 0.96],
          [0, 1, 0.96],
          [0, 1, -0.085],
          [-0.04, 1, -0.085],
        ],
        pal.wallEdge,
        "#090B10",
        1.6,
      );

      // Right-Back Wall (v = 0, u = 0..1, z = 0..0.96) + outer wall rim
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 0, 0.96],
          [1, 0, 0.96],
          [1, 0, 0],
          [0, 0, 0],
        ],
        pal.wallRight,
        "#090B10",
        2.2,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [0, -0.04, 0.96],
          [1, -0.04, 0.96],
          [1, 0, 0.96],
          [0, 0, 0.96],
        ],
        pal.wallEdge,
        "#090B10",
        1.5,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [1, -0.04, 0.96],
          [1, 0, 0.96],
          [1, 0, -0.085],
          [1, -0.04, -0.085],
        ],
        "#0C0F18",
        "#090B10",
        1.6,
      );

      // Loft Floor Diamond (z = 0)
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 0, 0],
          [1, 0, 0],
          [1, 1, 0],
          [0, 1, 0],
        ],
        pal.floorBase,
        "#090B10",
        2.2,
      );

      // Subtle warm floorboard plank seams
      ctx.strokeStyle = pal.floorPlank;
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i += 1) {
        const u = i / 8;
        const pA = projectIso(m, u, 0.01, 0);
        const pB = projectIso(m, u, 0.99, 0);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }

      // Baseboard trim along both interior walls
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 0, 0.055],
          [0, 1, 0.055],
          [0, 1, 0],
          [0, 0, 0],
        ],
        pal.baseboard,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 0, 0.055],
          [1, 0, 0.055],
          [1, 0, 0],
          [0, 0, 0],
        ],
        pal.baseboard,
      );

      // 2. LEFT WALL: RECESSED PANORAMIC LOFT WINDOW (RAIN STRICTLY CLIPPED!)
      const glassPoly = getWindowGlassPolygon(m);
      st.hitZones.window = glassPoly;
      const { vMin, vMax, zMin, zMax } = LOFT_WINDOW_GLASS;

      // Outer wooden frame surround
      drawIsoQuad(
        ctx,
        m,
        [
          [0, vMin - 0.025, zMax + 0.03],
          [0, vMax + 0.025, zMax + 0.03],
          [0, vMax + 0.025, zMin - 0.03],
          [0, vMin - 0.025, zMin - 0.03],
        ],
        "#121521",
        "#090B10",
        2,
      );

      // STRICTLY CLIPPED SKY + CITY + TRAIN + RAIN INSIDE EXACT GLASS POLYGON
      ctx.save();
      tracePoly(ctx, glassPoly);
      ctx.clip();

      const wTop = projectIso(m, 0, vMin, zMax);
      const wBot = projectIso(m, 0, vMax, zMin);
      const skyGrad = ctx.createLinearGradient(wTop.x, wTop.y, wBot.x, wBot.y);
      skyGrad.addColorStop(0, pal.skyTop);
      skyGrad.addColorStop(0.58, pal.skyMid);
      skyGrad.addColorStop(1, pal.skyGlow);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(
        Math.min(wTop.x, wBot.x) - 10,
        Math.min(wTop.y, wBot.y) - 10,
        Math.abs(wBot.x - wTop.x) + 20,
        Math.abs(wBot.y - wTop.y) + 20,
      );

      // Twinkling stars inside clipped sky
      for (let i = 0; i < windowStars.length; i += 1) {
        const ws = windowStars[i];
        const sp = projectIso(
          m,
          0,
          vMin + ws.vFrac * (vMax - vMin),
          zMin + ws.zFrac * (zMax - zMin),
        );
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.1 + ws.phase));
        ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(2)})`;
        ctx.fillRect(sp.x, sp.y, 1.8, 1.8);
      }

      // Crescent moon
      const moonPt = projectIso(m, 0, vMin + 0.12, zMax - 0.11);
      ctx.fillStyle = "#FFF8DC";
      ctx.beginPath();
      ctx.arc(moonPt.x, moonPt.y, Math.max(5.5, m.halfW * 0.032), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pal.skyTop;
      ctx.beginPath();
      ctx.arc(
        moonPt.x + 2.8,
        moonPt.y - 1.6,
        Math.max(4.6, m.halfW * 0.027),
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Layered isometric distant skyline silhouettes + glowing windows
      for (let b = 0; b < 7; b += 1) {
        const bv0 = vMin + (b / 7) * (vMax - vMin);
        const bv1 = bv0 + (vMax - vMin) / 7 + 0.01;
        const bh = 0.14 + ((b * 19) % 13) * 0.015;
        drawIsoQuad(
          ctx,
          m,
          [
            [0, bv0, zMin + bh],
            [0, bv1, zMin + bh],
            [0, bv1, zMin - 0.04],
            [0, bv0, zMin - 0.04],
          ],
          "rgba(9, 11, 22, 0.78)",
        );
        // Glowing tiny city apartment lights
        for (let row = 0; row < 2; row += 1) {
          if ((b + row) % 2 === 0) {
            const lp = projectIso(m, 0, bv0 + 0.024, zMin + bh - 0.045 - row * 0.04);
            ctx.fillStyle = b % 3 === 0 ? pal.accent : "#FFE89E";
            ctx.fillRect(lp.x, lp.y, 2.8, 3.2);
          }
        }
      }

      // Tiny illuminated distant commuter train gliding across the window!
      const trainFrac = ((t * 0.16) % 1.4) - 0.2;
      const tv0 = vMin + trainFrac * (vMax - vMin);
      drawIsoQuad(
        ctx,
        m,
        [
          [0, tv0, zMin + 0.115],
          [0, tv0 + 0.13, zMin + 0.115],
          [0, tv0 + 0.13, zMin + 0.088],
          [0, tv0, zMin + 0.088],
        ],
        pal.accentSecondary,
      );

      // STRICTLY CLIPPED RAIN STREAKS (Generated in window UV coordinates!)
      if (st.rainOn) {
        ctx.strokeStyle = "rgba(214, 240, 255, 0.62)";
        ctx.lineWidth = 1.25;
        for (let i = 0; i < rainDrops.length; i += 1) {
          const drop = rainDrops[i];
          const progress = (drop.zFrac + t * drop.speed) % 1;
          const vPos = vMin + drop.uFrac * (vMax - vMin);
          const zHead = zMax - progress * (zMax - zMin);
          const zTail = zHead + drop.len * (zMax - zMin);
          const pHead = projectIso(m, 0, vPos, zHead);
          const pTail = projectIso(m, 0, vPos - 0.018, zTail);
          ctx.beginPath();
          ctx.moveTo(pTail.x, pTail.y);
          ctx.lineTo(pHead.x, pHead.y);
          ctx.stroke();
        }
      }

      // Soft glass sheen reflection diagonal
      drawIsoQuad(
        ctx,
        m,
        [
          [0, vMin + 0.05, zMax],
          [0, vMin + 0.14, zMax],
          [0, vMin + 0.04, zMin],
          [0, vMin - 0.02, zMin],
        ],
        "rgba(255, 255, 255, 0.06)",
      );
      ctx.restore(); // END STRICT WINDOW CLIP

      // Window frame outline + wooden center mullions
      tracePoly(ctx, glassPoly);
      ctx.strokeStyle = "#090B10";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const midV = (vMin + vMax) * 0.5;
      const mTop = projectIso(m, 0, midV, zMax);
      const mBot = projectIso(m, 0, midV, zMin);
      const mLeft = projectIso(m, 0, vMin, zMin + 0.16);
      const mRight = projectIso(m, 0, vMax, zMin + 0.16);
      ctx.strokeStyle = "#181C2B";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(mTop.x, mTop.y);
      ctx.lineTo(mBot.x, mBot.y);
      ctx.moveTo(mLeft.x, mLeft.y);
      ctx.lineTo(mRight.x, mRight.y);
      ctx.stroke();

      // Protruding 3D wooden windowsill ledge
      drawIsoBox(
        ctx,
        m,
        0,
        vMin - 0.035,
        zMin - 0.04,
        0.045,
        vMax - vMin + 0.07,
        0.036,
        "#6B4937",
        "#4E3426",
        "#3A251A",
        "#090B10",
        1.5,
      );

      // 3. LEFT WALL: FLOATING BOOKSHELF & TRAILING IVY + SKILL MAP BOARD
      // Floating mini-bookshelf near back corner (u=0, v=0.03..0.14, z=0.68..0.71)
      drawIsoBox(
        ctx,
        m,
        0,
        0.03,
        0.68,
        0.055,
        0.115,
        0.026,
        "#78523D",
        "#543728",
        "#3D271C",
        "#090B10",
        1.3,
      );
      // Tiny colorful pixel books resting ON top of shelf (z=0.706)
      const bookCols = [pal.accentPink, pal.accentCyan, pal.accentSecondary];
      for (let b = 0; b < 3; b += 1) {
        drawIsoBox(
          ctx,
          m,
          0.008,
          0.04 + b * 0.026,
          0.706,
          0.036,
          0.02,
          0.075 + (b % 2) * 0.015,
          bookCols[b],
          bookCols[b],
          "#1B1F30",
          "#090B10",
          1.1,
        );
      }

      // Skill Map Constellation Corkboard (u=0, v=0.74..0.95, z=0.44..0.82)
      const mapHot = st.activeZone === "roadmap";
      drawIsoQuad(
        ctx,
        m,
        [
          [0, 0.74, 0.82],
          [0, 0.95, 0.82],
          [0, 0.95, 0.44],
          [0, 0.74, 0.44],
        ],
        mapHot ? "#4B3520" : "#35261B",
        mapHot ? pal.accentSecondary : "#090B10",
        mapHot ? 2.4 : 1.8,
      );
      const mapNodes: [number, number][] = [
        [0.78, 0.74],
        [0.85, 0.68],
        [0.80, 0.59],
        [0.90, 0.56],
        [0.86, 0.49],
      ];
      const mapPts = mapNodes.map(([nv, nz]) => projectIso(m, 0.004, nv, nz));
      ctx.strokeStyle = mapHot ? pal.accentSecondary : pal.accent;
      ctx.lineWidth = mapHot ? 2.2 : 1.4;
      ctx.beginPath();
      mapPts.forEach((pt, idx) =>
        idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y),
      );
      ctx.stroke();
      mapPts.forEach((pt, idx) => {
        const pulse = mapHot ? 1 + 0.25 * Math.sin(t * 5 + idx) : 1;
        ctx.fillStyle = idx === 1 || mapHot ? pal.accentSecondary : pal.accent;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.2 * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. RIGHT WALL: MINI POSTER + GLASS ALGORITHM WHITEBOARD
      // Small framed retro Devy art poster near corner
      drawIsoQuad(
        ctx,
        m,
        [
          [0.04, 0, 0.78],
          [0.13, 0, 0.78],
          [0.13, 0, 0.56],
          [0.04, 0, 0.56],
        ],
        "#1E2438",
        "#090B10",
        1.6,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [0.055, 0, 0.74],
          [0.115, 0, 0.74],
          [0.115, 0, 0.60],
          [0.055, 0, 0.60],
        ],
        pal.accentPink,
      );

      // Glass Algorithm Whiteboard (v=0, u=0.17..0.58, z=0.49..0.85)
      const labHot = st.activeZone === "algolab";
      drawIsoQuad(
        ctx,
        m,
        [
          [0.17, 0, 0.85],
          [0.58, 0, 0.85],
          [0.58, 0, 0.49],
          [0.17, 0, 0.49],
        ],
        labHot ? "rgba(192, 132, 252, 0.26)" : "rgba(11, 15, 26, 0.84)",
        labHot ? "#C084FC" : "#090B10",
        labHot ? 2.5 : 1.9,
      );
      // Marker tray ledge
      drawIsoBox(
        ctx,
        m,
        0.18,
        0,
        0.47,
        0.39,
        0.028,
        0.02,
        "#3A4258",
        "#252B3B",
        "#1A1E2B",
        "#090B10",
        1.2,
      );
      // Live animated sorting bars on the whiteboard
      const activeIdx = Math.floor(t * (labHot ? 3.2 : 1.4)) % 7;
      for (let b = 0; b < 7; b += 1) {
        const bu = 0.205 + b * 0.05;
        const barH =
          0.07 + Math.abs(Math.sin(t * (labHot ? 2.8 : 0.95) + b * 0.85)) * 0.21;
        drawIsoQuad(
          ctx,
          m,
          [
            [bu, 0.004, 0.52 + barH],
            [bu + 0.032, 0.004, 0.52 + barH],
            [bu + 0.032, 0.004, 0.52],
            [bu, 0.004, 0.52],
          ],
          b === activeIdx ? pal.accentSecondary : labHot ? "#C084FC" : pal.accentCyan,
        );
      }

      // 5. GROUNDED L-SHAPED CODING DESK + PC TOWER + DUAL MONITORS + MUG + LAMP
      const deskSpec = LOFT_GROUNDED_FURNITURE.desk;
      const pcSpec = LOFT_GROUNDED_FURNITURE.pcTower;
      const stuHot = st.activeZone === "studio";

      drawFloorShadow(ctx, m, deskSpec.u0, deskSpec.v0, deskSpec.du, deskSpec.dv, 0.44);

      // Under-desk Mini PC Tower resting squarely on floor z = 0
      drawIsoBox(
        ctx,
        m,
        pcSpec.u0,
        pcSpec.v0,
        pcSpec.z0,
        pcSpec.du,
        pcSpec.dv,
        pcSpec.dz,
        "#2B3144",
        "#1E2333",
        "#141824",
        "#090B10",
        1.4,
      );
      // Glowing PC fan LEDs on front-left glass panel
      for (let f = 0; f < 2; f += 1) {
        const fp = projectIso(m, pcSpec.u0 + 0.048, pcSpec.v0 + pcSpec.dv + 0.002, 0.065 + f * 0.085);
        ctx.strokeStyle = f === 0 ? pal.accent : pal.accentPink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 4.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4 Solid Steel Desk Legs resting directly on z = 0
      const legCoords: [number, number][] = [
        [deskSpec.u0 + 0.015, deskSpec.v0 + 0.015],
        [deskSpec.u0 + deskSpec.du - 0.045, deskSpec.v0 + 0.015],
        [deskSpec.u0 + 0.015, deskSpec.v0 + deskSpec.dv - 0.045],
        [deskSpec.u0 + deskSpec.du - 0.045, deskSpec.v0 + deskSpec.dv - 0.045],
      ];
      for (const [lu, lv] of legCoords) {
        drawIsoBox(ctx, m, lu, lv, 0, 0.028, 0.028, 0.252, "#2A3040", "#1E2230", "#141722", "#090B10", 1.1);
      }

      // Thick Walnut Desk Tabletop (z = 0.252..0.286)
      drawIsoBox(
        ctx,
        m,
        deskSpec.u0,
        deskSpec.v0,
        0.252,
        deskSpec.du,
        deskSpec.dv,
        0.034,
        "#7D533C",
        "#5D3C2A",
        "#462C1F",
        "#090B10",
        1.9,
      );

      // Dark Stitched Desk Mat on Tabletop (z = 0.287)
      drawIsoQuad(
        ctx,
        m,
        [
          [0.17, 0.12, 0.287],
          [0.47, 0.12, 0.287],
          [0.47, 0.31, 0.287],
          [0.17, 0.31, 0.287],
        ],
        "#181D2B",
        "#090B10",
        1.1,
      );

      // Ambient monitor glow on desk
      const monCenter = projectIso(m, 0.31, 0.17, 0.36);
      const monGlow = ctx.createRadialGradient(
        monCenter.x,
        monCenter.y,
        6,
        monCenter.x,
        monCenter.y + 12,
        stuHot ? m.halfW * 0.44 : m.halfW * 0.28,
      );
      monGlow.addColorStop(
        0,
        stuHot ? "rgba(56, 189, 248, 0.42)" : `${pal.accent}36`,
      );
      monGlow.addColorStop(1, "transparent");
      ctx.fillStyle = monGlow;
      ctx.fillRect(
        monCenter.x - m.halfW * 0.5,
        monCenter.y - m.halfW * 0.4,
        m.halfW,
        m.halfW * 0.9,
      );

      // Main Retro Studio Monitor (grounded on desk z = 0.286)
      drawIsoBox(ctx, m, 0.27, 0.10, 0.286, 0.08, 0.055, 0.042, "#343B50", "#222738", "#171B28", "#090B10", 1.3);
      drawIsoBox(ctx, m, 0.19, 0.08, 0.328, 0.23, 0.075, 0.195, "#3A4259", "#282E42", "#1B2030", "#090B10", 1.7);
      // Glowing screen glass on front-left face (v = 0.155)
      drawIsoQuad(
        ctx,
        m,
        [
          [0.205, 0.156, 0.502],
          [0.405, 0.156, 0.502],
          [0.405, 0.156, 0.348],
          [0.205, 0.156, 0.348],
        ],
        "#071214",
        "#090B10",
        1.2,
      );
      // Animated scrolling Python code lines on main screen
      for (let line = 0; line < 5; line += 1) {
        const lineZ = 0.478 - line * 0.026;
        const lenU = 0.06 + ((line * 17 + Math.floor(t * 2.2)) % 10) * 0.011;
        const p1 = projectIso(m, 0.22, 0.158, lineZ);
        const p2 = projectIso(m, 0.22 + lenU, 0.158, lineZ);
        ctx.strokeStyle =
          line % 2 === 0 ? pal.accent : line === 1 ? pal.accentSecondary : pal.accentCyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Secondary Vertical Mini Terminal Display (grounded on desk z = 0.286)
      drawIsoBox(ctx, m, 0.445, 0.09, 0.286, 0.085, 0.055, 0.18, "#333A4F", "#23283A", "#171B28", "#090B10", 1.5);
      drawIsoQuad(
        ctx,
        m,
        [
          [0.454, 0.146, 0.448],
          [0.521, 0.146, 0.448],
          [0.521, 0.146, 0.312],
          [0.454, 0.146, 0.312],
        ],
        "#081316",
      );
      for (let r = 0; r < 4; r += 1) {
        const p1 = projectIso(m, 0.462, 0.148, 0.425 - r * 0.028);
        const p2 = projectIso(m, 0.506, 0.148, 0.425 - r * 0.028);
        ctx.strokeStyle = r === 3 ? pal.accentSecondary : pal.accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Mechanical Keyboard + Wireless Mouse sitting flat on desk mat
      drawIsoBox(ctx, m, 0.21, 0.205, 0.287, 0.175, 0.075, 0.018, "#2C3347", "#1F2434", "#151926", "#090B10", 1.3);
      // Glowing Esc & Enter accent keycaps
      drawIsoQuad(
        ctx,
        m,
        [
          [0.218, 0.213, 0.306],
          [0.242, 0.213, 0.306],
          [0.242, 0.232, 0.306],
          [0.218, 0.232, 0.306],
        ],
        pal.accentPink,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [0.348, 0.246, 0.306],
          [0.378, 0.246, 0.306],
          [0.378, 0.268, 0.306],
          [0.348, 0.268, 0.306],
        ],
        pal.accentSecondary,
      );
      // Wireless Mouse
      drawIsoBox(ctx, m, 0.415, 0.225, 0.287, 0.036, 0.052, 0.015, "#D9DDE8", "#A7B0C4", "#7C859C", "#090B10", 1.1);

      // Steaming Ceramic Coffee / Matcha Mug (clickable!)
      drawIsoBox(ctx, m, 0.11, 0.20, 0.287, 0.044, 0.044, 0.062, "#F6F1E7", "#DDD6C8", "#C2B9A8", "#090B10", 1.4);
      drawIsoQuad(
        ctx,
        m,
        [
          [0.117, 0.207, 0.35],
          [0.147, 0.207, 0.35],
          [0.147, 0.237, 0.35],
          [0.117, 0.237, 0.35],
        ],
        pal.accent,
      );
      const mugCenter = projectIso(m, 0.132, 0.222, 0.34);
      st.hitZones.mug = [
        { x: mugCenter.x - 16, y: mugCenter.y - 22 },
        { x: mugCenter.x + 16, y: mugCenter.y - 22 },
        { x: mugCenter.x + 16, y: mugCenter.y + 14 },
        { x: mugCenter.x - 16, y: mugCenter.y + 14 },
      ];
      // Steam wisps
      const steamMul = 1 + st.steamBoost;
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.85, 0.38 * steamMul).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 3; s += 1) {
        const ph = (t * 0.85 + s * 0.33) % 1;
        const sx = mugCenter.x - 4 + s * 4;
        const sy = mugCenter.y - 8 - ph * 20 * steamMul;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + Math.sin(t * 4 + s) * 5, sy - 9, sx + 1, sy - 18);
        ctx.stroke();
      }

      // Clickable Arched Brass Desk Lamp (grounded on desk z = 0.287)
      drawIsoBox(ctx, m, 0.515, 0.21, 0.287, 0.052, 0.052, 0.018, "#FFDE59", "#D9B229", "#A68416", "#090B10", 1.3);
      const lampBase = projectIso(m, 0.541, 0.236, 0.305);
      const lampElbow = projectIso(m, 0.558, 0.24, 0.455);
      const lampHead = projectIso(m, 0.49, 0.23, 0.48);
      ctx.strokeStyle = "#FFDE59";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lampBase.x, lampBase.y);
      ctx.lineTo(lampElbow.x, lampElbow.y);
      ctx.lineTo(lampHead.x, lampHead.y);
      ctx.stroke();
      ctx.fillStyle = st.lampOn ? "#FFF0A6" : "#6B6550";
      ctx.strokeStyle = "#090B10";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(lampHead.x, lampHead.y + 2, 9.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      st.hitZones.lamp = [
        { x: lampHead.x - 22, y: lampHead.y - 18 },
        { x: lampElbow.x + 14, y: lampHead.y - 18 },
        { x: lampElbow.x + 14, y: lampBase.y + 10 },
        { x: lampHead.x - 22, y: lampBase.y + 10 },
      ];

      // 6. GROUNDED FULL-HEIGHT RETRO ARCADE CABINET (u=0.67..0.89, v=0.06..0.26, z=0!)
      const arcSpec = LOFT_GROUNDED_FURNITURE.arcadeCabinet;
      const arcHot = st.activeZone === "arcade";
      drawFloorShadow(ctx, m, arcSpec.u0, arcSpec.v0, arcSpec.du, arcSpec.dv + 0.04, 0.52);

      // Ambient pink/lime cabinet glow when hovered
      const arcGlowPt = projectIso(m, 0.78, 0.16, 0.38);
      if (arcHot) {
        const ag = ctx.createRadialGradient(
          arcGlowPt.x,
          arcGlowPt.y,
          10,
          arcGlowPt.x,
          arcGlowPt.y + 12,
          m.halfW * 0.42,
        );
        ag.addColorStop(0, "rgba(255, 144, 232, 0.46)");
        ag.addColorStop(1, "transparent");
        ctx.fillStyle = ag;
        ctx.fillRect(
          arcGlowPt.x - m.halfW * 0.45,
          arcGlowPt.y - m.halfW * 0.45,
          m.halfW * 0.9,
          m.halfW * 0.9,
        );
      }

      // Lower Base Plinth grounded flush on z = 0..0.30
      drawIsoBox(
        ctx,
        m,
        arcSpec.u0,
        arcSpec.v0,
        0,
        arcSpec.du,
        arcSpec.dv,
        0.30,
        "#322354",
        "#251842",
        "#191030",
        "#090B10",
        1.8,
      );
      // Coin-slot service door on front-left plinth face
      drawIsoQuad(
        ctx,
        m,
        [
          [arcSpec.u0 + 0.055, arcSpec.v0 + arcSpec.dv + 0.002, 0.22],
          [arcSpec.u0 + 0.165, arcSpec.v0 + arcSpec.dv + 0.002, 0.22],
          [arcSpec.u0 + 0.165, arcSpec.v0 + arcSpec.dv + 0.002, 0.06],
          [arcSpec.u0 + 0.055, arcSpec.v0 + arcSpec.dv + 0.002, 0.06],
        ],
        "#120D22",
        "#090B10",
        1.2,
      );
      // Glowing red coin return slot
      const coinPt = projectIso(m, arcSpec.u0 + 0.11, arcSpec.v0 + arcSpec.dv + 0.004, 0.16);
      ctx.fillStyle = "#FB7185";
      ctx.fillRect(coinPt.x - 4, coinPt.y - 2, 8, 4);

      // Retro racing stripe along right cabinet side
      drawIsoQuad(
        ctx,
        m,
        [
          [arcSpec.u0 + arcSpec.du + 0.002, arcSpec.v0 + 0.04, 0.26],
          [arcSpec.u0 + arcSpec.du + 0.002, arcSpec.v0 + 0.10, 0.26],
          [arcSpec.u0 + arcSpec.du + 0.002, arcSpec.v0 + 0.10, 0.04],
          [arcSpec.u0 + arcSpec.du + 0.002, arcSpec.v0 + 0.04, 0.04],
        ],
        pal.accentPink,
      );

      // Control Deck Shelf protruding cleanly forward (z = 0.30..0.345)
      drawIsoBox(
        ctx,
        m,
        arcSpec.u0 - 0.005,
        arcSpec.v0,
        0.30,
        arcSpec.du + 0.01,
        arcSpec.dv + 0.055,
        0.045,
        "#3E2B66",
        "#291C4A",
        "#1B1233",
        "#090B10",
        1.6,
      );
      // Ball-top red joystick + 2 colorful arcade buttons on control deck
      const joyBase = projectIso(m, arcSpec.u0 + 0.06, arcSpec.v0 + arcSpec.dv + 0.025, 0.345);
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(joyBase.x, joyBase.y);
      ctx.lineTo(joyBase.x, joyBase.y - 9);
      ctx.stroke();
      ctx.fillStyle = "#FB7185";
      ctx.beginPath();
      ctx.arc(joyBase.x, joyBase.y - 10, 3.6, 0, Math.PI * 2);
      ctx.fill();
      for (let b = 0; b < 2; b += 1) {
        const bp = projectIso(m, arcSpec.u0 + 0.135 + b * 0.036, arcSpec.v0 + arcSpec.dv + 0.024, 0.346);
        ctx.fillStyle = b === 0 ? pal.accent : pal.accentSecondary;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Upper CRT Display Housing (z = 0.345..0.56)
      drawIsoBox(
        ctx,
        m,
        arcSpec.u0,
        arcSpec.v0,
        0.345,
        arcSpec.du,
        arcSpec.dv - 0.02,
        0.215,
        "#322354",
        "#251842",
        "#191030",
        "#090B10",
        1.8,
      );
      // Recessed glowing retro CRT screen on front-left face
      drawIsoQuad(
        ctx,
        m,
        [
          [arcSpec.u0 + 0.025, arcSpec.v0 + arcSpec.dv - 0.018, 0.535],
          [arcSpec.u0 + arcSpec.du - 0.025, arcSpec.v0 + arcSpec.dv - 0.018, 0.535],
          [arcSpec.u0 + arcSpec.du - 0.025, arcSpec.v0 + arcSpec.dv - 0.018, 0.375],
          [arcSpec.u0 + 0.025, arcSpec.v0 + arcSpec.dv - 0.018, 0.375],
        ],
        "#070D14",
        "#090B10",
        1.2,
      );
      // Live animated pixel game inside arcade screen!
      const ballU =
        arcSpec.u0 + 0.055 + (0.5 + 0.5 * Math.sin(t * (arcHot ? 4.4 : 2.6))) * 0.11;
      const ballZ = 0.42 + (0.5 + 0.5 * Math.cos(t * (arcHot ? 5.2 : 3.1))) * 0.085;
      const ballPt = projectIso(m, ballU, arcSpec.v0 + arcSpec.dv - 0.015, ballZ);
      ctx.fillStyle = "#B8FF3B";
      ctx.fillRect(ballPt.x - 2.5, ballPt.y - 2.5, 5, 5);
      const padPt = projectIso(m, ballU, arcSpec.v0 + arcSpec.dv - 0.015, 0.395);
      ctx.fillStyle = pal.accentSecondary;
      ctx.fillRect(padPt.x - 6, padPt.y - 1.5, 12, 3);

      // Glowing Neon Top Marquee (z = 0.56..0.64)
      drawIsoBox(
        ctx,
        m,
        arcSpec.u0 - 0.005,
        arcSpec.v0,
        0.56,
        arcSpec.du + 0.01,
        arcSpec.dv + 0.01,
        0.08,
        "#483276",
        arcHot ? "#FF90E8" : pal.accentPink,
        "#251842",
        "#090B10",
        1.7,
      );
      const arcHitTop = projectIso(m, arcSpec.u0, arcSpec.v0 + arcSpec.dv, 0.64);
      const arcHitRight = projectIso(m, arcSpec.u0 + arcSpec.du, arcSpec.v0, 0.64);
      const arcHitBot = projectIso(m, arcSpec.u0 + arcSpec.du, arcSpec.v0 + arcSpec.dv, 0);
      const arcHitLeft = projectIso(m, arcSpec.u0, arcSpec.v0 + arcSpec.dv, 0);
      st.hitZones.arcade = [arcHitTop, arcHitRight, arcHitBot, arcHitLeft];

      // 7. GROUNDED DESK CHAIR (z = 0..0.34)
      const chSpec = LOFT_GROUNDED_FURNITURE.chair;
      drawFloorShadow(ctx, m, chSpec.u0, chSpec.v0, chSpec.du, chSpec.dv, 0.36);
      // Caster base + pneumatic stem grounded at z = 0
      drawIsoBox(ctx, m, chSpec.u0 + 0.03, chSpec.v0 + 0.03, 0, 0.08, 0.08, 0.02, "#242A3B", "#181D2B", "#111520", "#090B10", 1.1);
      drawIsoBox(ctx, m, chSpec.u0 + 0.058, chSpec.v0 + 0.058, 0.02, 0.024, 0.024, 0.13, "#363F56", "#23293A", "#171C28", "#090B10", 1);
      // Cushioned chair seat
      drawIsoBox(ctx, m, chSpec.u0, chSpec.v0, 0.15, chSpec.du, chSpec.dv, 0.036, "#4A5575", "#353E59", "#262D42", "#090B10", 1.4);
      // Curved backrest facing desk
      drawIsoBox(ctx, m, chSpec.u0, chSpec.v0 + chSpec.dv - 0.032, 0.186, chSpec.du, 0.032, 0.155, "#5A678C", "#3D4766", "#2B334B", "#090B10", 1.4);

      // 8. BACK-LEFT GROUNDED CORNER PLANT STAND & POTTED BONSAI TREE (z = 0!)
      const bSpec = LOFT_GROUNDED_FURNITURE.bonsaiStand;
      drawFloorShadow(ctx, m, bSpec.u0, bSpec.v0, bSpec.du, bSpec.dv, 0.45);
      // 4 wooden legs grounded squarely on floorboards z = 0
      const standLegs: [number, number][] = [
        [bSpec.u0 + 0.01, bSpec.v0 + 0.01],
        [bSpec.u0 + bSpec.du - 0.032, bSpec.v0 + 0.01],
        [bSpec.u0 + 0.01, bSpec.v0 + bSpec.dv - 0.032],
        [bSpec.u0 + bSpec.du - 0.032, bSpec.v0 + bSpec.dv - 0.032],
      ];
      for (const [su, sv] of standLegs) {
        drawIsoBox(ctx, m, su, sv, 0, 0.022, 0.022, 0.145, "#6E4A35", "#4D3324", "#382419", "#090B10", 1.1);
      }
      // Plant stand tabletop (z = 0.145..0.172)
      drawIsoBox(ctx, m, bSpec.u0, bSpec.v0, 0.145, bSpec.du, bSpec.dv, 0.027, "#855A40", "#61402D", "#4A2F20", "#090B10", 1.5);
      // Thick Terracotta Planter Pot resting solidly on top of stand (z = 0.172..0.295)
      drawIsoBox(
        ctx,
        m,
        bSpec.u0 + 0.025,
        bSpec.v0 + 0.025,
        0.172,
        bSpec.du - 0.05,
        bSpec.dv - 0.05,
        0.123,
        "#3B2A1E",
        "#B86340",
        "#924B2E",
        "#090B10",
        1.5,
      );
      // Sculpted Bonsai Trunk rooted firmly in soil (z = 0.285..0.50)
      const trunkBase = projectIso(m, bSpec.u0 + bSpec.du * 0.5, bSpec.v0 + bSpec.dv * 0.5, 0.285);
      const sway = Math.sin(t * 1.4) * 3.5;
      const trunkMid = { x: trunkBase.x - 7, y: trunkBase.y - 22 };
      const trunkTop = { x: trunkBase.x + 4 + sway, y: trunkBase.y - 44 };
      ctx.strokeStyle = "#5A3A28";
      ctx.lineWidth = 6.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(trunkBase.x, trunkBase.y);
      ctx.quadraticCurveTo(trunkMid.x, trunkMid.y, trunkTop.x, trunkTop.y);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(trunkMid.x + 2, trunkMid.y + 1);
      ctx.quadraticCurveTo(trunkMid.x - 16, trunkMid.y - 8, trunkMid.x - 20 + sway, trunkMid.y - 16);
      ctx.stroke();

      // Multi-tiered swaying bonsai canopy clusters
      const clusters: [number, number, number, boolean][] = [
        [trunkTop.x, trunkTop.y - 6, 17, false],
        [trunkTop.x + 15, trunkTop.y + 1, 13, true],
        [trunkTop.x - 12, trunkTop.y + 2, 13, false],
        [trunkMid.x - 21 + sway, trunkMid.y - 16, 12, true],
      ];
      for (const [cx0, cy0, cr, hi] of clusters) {
        ctx.fillStyle = hi ? pal.bonsaiLeafHi : pal.bonsaiLeaf;
        ctx.strokeStyle = "#090B10";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx0, cy0, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Blooming streak blossoms scaled by real streakCount!
      const blossomCount = Math.min(7, Math.max(2, st.streakCount + 2));
      for (let bl = 0; bl < blossomCount; bl += 1) {
        const ang = (bl / blossomCount) * Math.PI * 2 + 0.5;
        const bx = trunkTop.x + Math.cos(ang) * (10 + (bl % 2) * 8);
        const by = trunkTop.y - 4 + Math.sin(ang) * 9;
        ctx.fillStyle = pal.bonsaiBlossom;
        ctx.beginPath();
        ctx.arc(bx, by, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      st.hitZones.bonsai = [
        { x: trunkTop.x - 36, y: trunkTop.y - 26 },
        { x: trunkTop.x + 32, y: trunkTop.y - 26 },
        { x: trunkTop.x + 32, y: trunkBase.y + 24 },
        { x: trunkTop.x - 36, y: trunkBase.y + 24 },
      ];

      // 9. COZY WOVEN FLOOR RUG + PLUSH CUSHION + LOFT CAT (z = 0!)
      drawIsoQuad(
        ctx,
        m,
        [
          [0.24, 0.58, 0.004],
          [0.62, 0.58, 0.004],
          [0.62, 0.90, 0.004],
          [0.24, 0.90, 0.004],
        ],
        pal.rugBase,
        "#090B10",
        1.8,
      );
      // Inner decorative woven rug stripe border
      drawIsoQuad(
        ctx,
        m,
        [
          [0.275, 0.615, 0.005],
          [0.585, 0.615, 0.005],
          [0.585, 0.865, 0.005],
          [0.275, 0.865, 0.005],
        ],
        "rgba(255, 255, 255, 0.05)",
        pal.rugStripe,
        1.5,
      );

      // Plush Cushion resting squarely on the rug + Cozy Loft Cat!
      const catPt = projectIso(m, 0.43, 0.74, 0.025);
      const catScale = Math.max(0.75, Math.min(1.08, m.halfW / 245));
      ctx.save();
      ctx.translate(catPt.x, catPt.y);
      ctx.scale(catScale, catScale);
      // Soft floor cushion
      ctx.fillStyle = "#3E2E5C";
      ctx.strokeStyle = "#090B10";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 12, 28, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Swaying curved tail
      ctx.strokeStyle = "#2A2F46";
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(14, 6);
      ctx.quadraticCurveTo(31, 4 + Math.sin(t * 2.8) * 6, 28, -10 + Math.cos(t * 2.8) * 4);
      ctx.stroke();

      // Loft cat body
      ctx.fillStyle = "#2A2F46";
      ctx.strokeStyle = "#090B10";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(0, 4, 19, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head + gentle breathing bob
      const catBob = Math.sin(t * 2.2) * 1.4;
      ctx.translate(0, -15 + catBob);
      for (const side of [-1, 1]) {
        ctx.fillStyle = "#2A2F46";
        ctx.beginPath();
        ctx.moveTo(side * 6, -10);
        ctx.lineTo(side * 17, -23);
        ctx.lineTo(side * 18, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = pal.accentPink;
        ctx.beginPath();
        ctx.moveTo(side * 9, -10);
        ctx.lineTo(side * 15, -18);
        ctx.lineTo(side * 15, -8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "#2A2F46";
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden studio headphones
      ctx.strokeStyle = pal.accentSecondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -2, 19, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = pal.accentSecondary;
      ctx.strokeStyle = "#090B10";
      ctx.lineWidth = 1.6;
      drawRoundedRect(ctx, -22, -6, 6.5, 12, 3);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 15.5, -6, 6.5, 12, 3);
      ctx.fill();
      ctx.stroke();

      // Glowing visor face (^ ω ^ when happy/hovered or blinking!)
      ctx.fillStyle = "#090D16";
      drawRoundedRect(ctx, -12, -5.5, 24, 11, 5);
      ctx.fill();
      const catDelighted = st.catHappy > 0 || st.activeZone === "cat";
      const blinking = Math.sin(t * 0.85) > 0.965;
      ctx.fillStyle = pal.accent;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1.8;
      if (catDelighted || blinking) {
        for (const ex of [-5.5, 5.5]) {
          ctx.beginPath();
          ctx.moveTo(ex - 2.8, 1);
          ctx.lineTo(ex, -2.2);
          ctx.lineTo(ex + 2.8, 1);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(-5.5, 0, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5.5, 0, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      st.hitZones.cat = [
        { x: catPt.x - 30 * catScale, y: catPt.y - 38 * catScale },
        { x: catPt.x + 30 * catScale, y: catPt.y - 38 * catScale },
        { x: catPt.x + 30 * catScale, y: catPt.y + 22 * catScale },
        { x: catPt.x - 30 * catScale, y: catPt.y + 22 * catScale },
      ];

      // 10. FRONT-RIGHT GROUNDED RECORD CONSOLE & REAL LO-FI TURNTABLE (z = 0!)
      const recSpec = LOFT_GROUNDED_FURNITURE.recordTable;
      drawFloorShadow(ctx, m, recSpec.u0, recSpec.v0, recSpec.du, recSpec.dv, 0.45);
      // 4 wooden console legs grounded squarely on floor z = 0
      const recLegs: [number, number][] = [
        [recSpec.u0 + 0.01, recSpec.v0 + 0.01],
        [recSpec.u0 + recSpec.du - 0.03, recSpec.v0 + 0.01],
        [recSpec.u0 + 0.01, recSpec.v0 + recSpec.dv - 0.03],
        [recSpec.u0 + recSpec.du - 0.03, recSpec.v0 + recSpec.dv - 0.03],
      ];
      for (const [ru, rv] of recLegs) {
        drawIsoBox(ctx, m, ru, rv, 0, 0.02, 0.02, 0.16, "#694734", "#4D3324", "#362217", "#090B10", 1.1);
      }
      // Lower vinyl shelf + colorful record sleeves
      drawIsoBox(ctx, m, recSpec.u0, recSpec.v0, 0.05, recSpec.du, recSpec.dv, 0.02, "#6E4A36", "#4F3425", "#3A251A", "#090B10", 1.2);
      // Console tabletop (z = 0.155..0.182)
      drawIsoBox(ctx, m, recSpec.u0, recSpec.v0, 0.155, recSpec.du, recSpec.dv, 0.027, "#855A40", "#61402D", "#4A2F20", "#090B10", 1.5);
      // Vintage Lo-Fi Turntable plinth sitting squarely on tabletop (z = 0.182..0.224)
      drawIsoBox(
        ctx,
        m,
        recSpec.u0 + 0.018,
        recSpec.v0 + 0.018,
        0.182,
        recSpec.du - 0.036,
        recSpec.dv - 0.036,
        0.042,
        "#252B3E",
        "#1A1F2E",
        "#121622",
        "#090B10",
        1.5,
      );
      // Spinning Vinyl Disc on top of turntable!
      const discPt = projectIso(
        m,
        recSpec.u0 + recSpec.du * 0.5,
        recSpec.v0 + recSpec.dv * 0.5,
        0.226,
      );
      ctx.save();
      ctx.translate(discPt.x, discPt.y);
      ctx.scale(1, 0.52);
      ctx.fillStyle = "#0B0D14";
      ctx.strokeStyle = "#3A435C";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(9, m.halfW * 0.052), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.rotate(st.lofiPlaying ? t * 3.0 : 0);
      ctx.fillStyle = st.lofiPlaying ? pal.accent : pal.accentSecondary;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(3.6, m.halfW * 0.022), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(4, -0.8, 3.5, 1.6);
      ctx.restore();

      // Power LED dot on turntable front
      const ledPt = projectIso(m, recSpec.u0 + 0.045, recSpec.v0 + recSpec.dv - 0.014, 0.202);
      ctx.fillStyle = st.lofiPlaying ? "#B8FF3B" : "#566078";
      ctx.beginPath();
      ctx.arc(ledPt.x, ledPt.y, 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Spawn cozy floating music notes while Lo-Fi Radio is enabled in Settings
      if (st.lofiPlaying) {
        st.noteCooldown -= dt;
        if (st.noteCooldown <= 0) {
          st.noteCooldown = 0.85;
          spawnParticles(discPt.x, discPt.y - 6, "note", 1, pal.accent);
        }
      }

      // 11. WARM DESK LAMP LIGHT CONE OVERLAY (When Lamp ON)
      if (st.lampOn) {
        const coneCenter = projectIso(m, 0.42, 0.26, 0.28);
        const lg = ctx.createRadialGradient(
          lampHead.x,
          lampHead.y + 6,
          4,
          coneCenter.x,
          coneCenter.y + 12,
          m.halfW * 0.56,
        );
        lg.addColorStop(0, `${pal.lampGlowRgba}0.36)`);
        lg.addColorStop(0.5, `${pal.lampGlowRgba}0.12)`);
        lg.addColorStop(1, "transparent");
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, stageW, stageH);
      }

      // 12. FLOATING HEARTS, MUSIC NOTES & SPARKLES
      for (let i = st.particles.length - 1; i >= 0; i -= 1) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt * 0.72;
        if (pt.life <= 0) {
          st.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, pt.life);
        ctx.fillStyle = pt.color;
        ctx.font = pt.kind === "note" ? "900 14px sans-serif" : "900 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pt.char, pt.x, pt.y);
        ctx.restore();
      }
    };

    let rafId = 0;
    let lastTs = performance.now();
    const renderLoop = (now: number) => {
      rafId = window.requestAnimationFrame(renderLoop);
      if (document.hidden) {
        lastTs = now;
        return;
      }
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      drawLoftScene(now * 0.001, dt);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", syncSize);
      }
      if (canvas.parentNode === hostEl) hostEl.removeChild(canvas);
    };
  }, []);

  const zoneLabel =
    activeZone === "roadmap"
      ? "SKILL MAP BOARD"
      : activeZone === "studio"
        ? "CODE STUDIO DESK"
        : activeZone === "arcade"
          ? "RETRO ARCADE CABINET"
          : activeZone === "algolab"
            ? "ALGORITHM WHITEBOARD"
            : activeZone === "cat"
              ? "COZY LOUNGE CUSHION"
              : "LIVING LO-FI DEV LOFT";

  return (
    <View
      testID="home-loft-stage"
      accessibilityLabel={`Interactive studio loft: ${zoneLabel}`}
      style={styles.frame}
    >
      <View style={[styles.viewport, compact && styles.viewportCompact]}>
        {Platform.OS === "web" ? (
          <View ref={hostRef} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.nativeFallback}>
            <View style={styles.nativeBadge}>
              <StudioIcon name="devlearn_logo" size={56} />
            </View>
            <Text style={styles.nativeTitle}>{zoneLabel}</Text>
            <Text style={styles.nativeSub}>
              Cozy desk · Lo-Fi coding studio
            </Text>
          </View>
        )}

        {/* Brief Click Interaction Toast (auto-hides after 1.9s) */}
        {toastMsg ? (
          <View pointerEvents="none" style={styles.toastWrap}>
            <View style={styles.toastPill}>
              <Text style={styles.toastText}>{toastMsg}</Text>
            </View>
          </View>
        ) : null}

        {/* Subtle Bottom Interaction Tip */}
        {Platform.OS === "web" && !toastMsg ? (
          <View pointerEvents="none" style={styles.bottomHintHud}>
            <Text style={styles.bottomHintText}>
              CLICK LAMP · WINDOW RAIN · MUG · PET CAT
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    frame: {
      width: "100%",
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: "hidden",
      ...HardShadow,
    },
    viewport: {
      position: "relative",
      width: "100%",
      height: 440,
      overflow: "hidden",
      backgroundColor: "#0D121D",
    },
    viewportCompact: {
      height: 315,
    },
    nativeFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      gap: 10,
    },
    nativeBadge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2.5,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    nativeTitle: {
      color: "#F4F0E6",
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
      textAlign: "center",
    },
    nativeSub: {
      color: "#B9B5AC",
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
    },
    toastWrap: {
      position: "absolute",
      bottom: 12,
      left: 12,
      right: 12,
      alignItems: "center",
    },
    toastPill: {
      backgroundColor: "rgba(9, 11, 18, 0.88)",
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.22)",
      borderRadius: 999,
      paddingHorizontal: 13,
      paddingVertical: 6,
    },
    toastText: {
      color: "#FAF7F0",
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.55,
    },
    bottomHintHud: {
      position: "absolute",
      bottom: 9,
      left: 10,
      right: 10,
      alignItems: "center",
    },
    bottomHintText: {
      color: "rgba(244, 240, 230, 0.56)",
      fontSize: 9,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.55,
      textAlign: "center",
    },
  });
