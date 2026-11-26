import React, { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { StudioPaletteId, ThemeMode } from "../constants/theme";
import { useTheme } from "../constants/themeContext";
import type { ViewMode } from "../types/lesson";

interface AstralDriftBackgroundProps {
  themeMode?: ThemeMode;
  section?: ViewMode;
}

interface DriftPalette {
  bg0: string;
  bg1: string;
  bg2: string;
  starHighlight: string;
  glowA: [number, number, number];
  glowB: [number, number, number];
  glowC: [number, number, number];
  line: [number, number, number];
}

interface DriftStar {
  x: number;
  y: number;
  r: number;
  phase: number;
  vx: number;
  vy: number;
  depth: number;
  tint: number;
}

interface DriftMeteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}

export function getAstralDriftPalette(
  paletteId: StudioPaletteId,
  themeMode: ThemeMode,
): DriftPalette {
  const isLight = themeMode === "light";

  if (paletteId === "matcha") {
    return isLight
      ? {
          bg0: "#F3F8F1",
          bg1: "#E9F2E6",
          bg2: "#E1ECE0",
          starHighlight: "#059669",
          glowA: [110, 231, 183],
          glowB: [253, 230, 138],
          glowC: [52, 211, 153],
          line: [45, 92, 76],
        }
      : {
          bg0: "#07110F",
          bg1: "#0E211D",
          bg2: "#07100E",
          starHighlight: "#6EE7B7",
          glowA: [16, 185, 129],
          glowB: [251, 191, 36],
          glowC: [110, 231, 183],
          line: [134, 200, 178],
        };
  }

  if (paletteId === "amber") {
    return isLight
      ? {
          bg0: "#FCF6EA",
          bg1: "#F7EBDA",
          bg2: "#F1E2CA",
          starHighlight: "#D97706",
          glowA: [251, 191, 36],
          glowB: [253, 186, 116],
          glowC: [245, 158, 11],
          line: [120, 84, 52],
        }
      : {
          bg0: "#120B07",
          bg1: "#21150E",
          bg2: "#0D0906",
          starHighlight: "#FBBF24",
          glowA: [217, 119, 6],
          glowB: [244, 114, 182],
          glowC: [251, 191, 36],
          line: [214, 176, 140],
        };
  }

  if (paletteId === "sakura") {
    return isLight
      ? {
          bg0: "#FCF4FA",
          bg1: "#F7E7F4",
          bg2: "#F2DCF0",
          starHighlight: "#DB2777",
          glowA: [255, 144, 232],
          glowB: [196, 181, 253],
          glowC: [236, 72, 153],
          line: [112, 68, 120],
        }
      : {
          bg0: "#110918",
          bg1: "#1E102A",
          bg2: "#0C0712",
          starHighlight: "#FF90E8",
          glowA: [219, 39, 119],
          glowB: [139, 92, 246],
          glowC: [255, 144, 232],
          line: [208, 176, 238],
        };
  }

  // Default: Arcade Midnight Observatory / Warm Cream Parchment
  return isLight
    ? {
        bg0: "#FAF6EE",
        bg1: "#F3ECDC",
        bg2: "#EFE6D4",
        starHighlight: "#16A34A",
        glowA: [184, 255, 59],
        glowB: [196, 181, 253],
        glowC: [251, 191, 36],
        line: [71, 85, 105],
      }
    : {
        bg0: "#080B14",
        bg1: "#101628",
        bg2: "#090C16",
        starHighlight: "#B8FF3B",
        glowA: [124, 58, 237],
        glowB: [56, 189, 248],
        glowC: [184, 255, 59],
        line: [148, 163, 184],
      };
}

function getSectionPhaseShift(section?: ViewMode): number {
  switch (section) {
    case "roadmap":
      return 1.3;
    case "arcade":
    case "bughunt":
    case "blitz":
    case "flashcards":
    case "detective":
    case "minibuilds":
    case "playground":
    case "refactor":
      return 2.5;
    case "algolab":
      return 3.7;
    case "achievements":
    case "league":
      return 4.9;
    default:
      return 0;
  }
}

function createDriftStars(count: number): DriftStar[] {
  const out: DriftStar[] = [];
  let seed = 77123;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967295;
  };
  for (let i = 0; i < count; i += 1) {
    out.push({
      x: rand(),
      y: rand(),
      r: 0.7 + rand() * 1.85,
      phase: rand() * Math.PI * 2,
      vx: (rand() - 0.5) * 0.0038,
      vy: -0.0032 - rand() * 0.007,
      depth: 0.28 + rand() * 0.78,
      tint: rand(),
    });
  }
  return out;
}

const DRIFT_STARS = createDriftStars(135);

function rgba(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`;
}

export default function AstralDriftBackground({
  themeMode: themeModeProp,
  section = "home",
}: AstralDriftBackgroundProps) {
  const { paletteId, themeMode: ctxThemeMode } = useTheme();
  const effectiveMode = themeModeProp ?? ctxThemeMode;
  const palette = useMemo(
    () => getAstralDriftPalette(paletteId, effectiveMode),
    [paletteId, effectiveMode],
  );
  const phaseShift = getSectionPhaseShift(section);

  const hostRef = useRef<any>(null);
  const latestRef = useRef({
    palette,
    isLight: effectiveMode === "light",
    phaseShift,
  });

  useEffect(() => {
    latestRef.current = {
      palette,
      isLight: effectiveMode === "light",
      phaseShift,
    };
  });

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const host = hostRef.current as HTMLElement | null;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      host.removeChild(canvas);
      return;
    }

    let W = host.clientWidth || window.innerWidth || 1280;
    let H = host.clientHeight || window.innerHeight || 800;
    let dpr = 1;

    const syncSize = () => {
      W = Math.max(320, host.clientWidth || window.innerWidth || 1280);
      H = Math.max(320, host.clientHeight || window.innerHeight || 800);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(syncSize);
      ro.observe(host);
    } else {
      window.addEventListener("resize", syncSize);
    }

    const pointer = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45 };
    const onPointerMove = (e: PointerEvent) => {
      if (W <= 0 || H <= 0) return;
      pointer.tx = Math.max(0, Math.min(1, e.clientX / W));
      pointer.ty = Math.max(0, Math.min(1, e.clientY / H));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let meteor: DriftMeteor | null = null;
    let nextMeteorTimer = 7.0;
    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;

    const drawFrame = (dt: number) => {
      elapsed += dt;
      const damp = Math.min(1, dt * 4.2);
      pointer.x += (pointer.tx - pointer.x) * damp;
      pointer.y += (pointer.ty - pointer.y) * damp;

      const { palette: p, isLight, phaseShift: shift } = latestRef.current;

      // 1. Cozy Sky / Parchment Base Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, p.bg0);
      skyGrad.addColorStop(0.55, p.bg1);
      skyGrad.addColorStop(1, p.bg2);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      const px = (pointer.x - 0.5) * 38;
      const py = (pointer.y - 0.5) * 26;
      const opScale = isLight ? 0.22 : 0.21;

      // 2. Twin Soft Breathing Parallax Nebulae
      const n1x = W * 0.22 + Math.sin(elapsed * 0.22 + shift) * 44 - px * 0.55;
      const n1y = H * 0.28 + Math.cos(elapsed * 0.18) * 28 - py * 0.55;
      const g1 = ctx.createRadialGradient(
        n1x,
        n1y,
        12,
        n1x,
        n1y,
        Math.max(W, H) * 0.52,
      );
      g1.addColorStop(0, rgba(p.glowA, opScale));
      g1.addColorStop(1, rgba(p.glowA, 0));
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const n2x = W * 0.8 + Math.cos(elapsed * 0.2 + shift) * 40 + px * 0.4;
      const n2y = H * 0.74 + Math.sin(elapsed * 0.16) * 26 + py * 0.4;
      const g2 = ctx.createRadialGradient(
        n2x,
        n2y,
        12,
        n2x,
        n2y,
        Math.max(W, H) * 0.48,
      );
      g2.addColorStop(0, rgba(p.glowB, opScale * 0.9));
      g2.addColorStop(1, rgba(p.glowB, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // 3. Soft Warm Telescope Glow Following Cursor
      const mx = pointer.x * W;
      const my = pointer.y * H;
      const mg = ctx.createRadialGradient(mx, my, 4, mx, my, 230);
      mg.addColorStop(0, rgba(p.glowC, isLight ? 0.15 : 0.11));
      mg.addColorStop(1, rgba(p.glowC, 0));
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);

      // 4. Faint Rotating Corner Astrolabe Rings
      ctx.save();
      ctx.strokeStyle = rgba(p.line, isLight ? 0.12 : 0.08);
      ctx.lineWidth = 1.15;
      const corners: [number, number, number, number][] = [
        [W * 0.93 - px * 0.28, H * 0.12 - py * 0.28, 175, 1],
        [W * 0.07 + px * 0.28, H * 0.88 + py * 0.28, 205, -1],
      ];
      for (const [cx, cy, r, dir] of corners) {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          r,
          elapsed * 0.07 * dir,
          elapsed * 0.07 * dir + Math.PI * 1.45,
        );
        ctx.stroke();
        ctx.setLineDash([4, 10]);
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          r * 0.72,
          -elapsed * 0.11 * dir,
          -elapsed * 0.11 * dir + Math.PI * 1.2,
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // 5. Twinkling Parallax Starfield + Cursor-Lit Pocket Constellations
      const nearStars: { x: number; y: number; near: number }[] = [];
      for (let i = 0; i < DRIFT_STARS.length; i += 1) {
        const s = DRIFT_STARS[i];
        const sx =
          ((((s.x + s.vx * elapsed) % 1) + 1) % 1) * W - px * s.depth * 0.42;
        const sy =
          ((((s.y + s.vy * elapsed) % 1) + 1) % 1) * H - py * s.depth * 0.42;
        const dist = Math.hypot(sx - mx, sy - my);
        const near = Math.max(0, 1 - dist / 205);
        const twinkle =
          0.34 + 0.66 * (0.5 + 0.5 * Math.sin(elapsed * 2.0 + s.phase));
        const rad = s.r * (1 + near * 0.72);

        if (near > 0.28) {
          ctx.fillStyle = p.starHighlight;
        } else if (isLight) {
          ctx.fillStyle = rgba(p.line, twinkle * 0.44);
        } else if (s.tint > 0.86) {
          ctx.fillStyle = `rgba(255, 222, 89, ${(twinkle * 0.62).toFixed(3)})`;
        } else if (s.tint < 0.14) {
          ctx.fillStyle = `rgba(196, 181, 253, ${(twinkle * 0.58).toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(248, 250, 252, ${(twinkle * 0.58).toFixed(3)})`;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();

        if (near > 0.16) {
          nearStars.push({ x: sx, y: sy, near });
        }
      }

      if (nearStars.length > 1) {
        ctx.save();
        ctx.lineWidth = 1.05;
        for (let i = 0; i < nearStars.length; i += 1) {
          for (let j = i + 1; j < nearStars.length; j += 1) {
            const a = nearStars[i];
            const b = nearStars[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 122) {
              const alpha =
                (1 - d / 122) *
                Math.min(a.near, b.near) *
                (isLight ? 0.42 : 0.52);
              ctx.strokeStyle = rgba(p.glowC, alpha);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // 6. Occasional Cozy Shooting Star (dark mode only for maximum elegance)
      if (!isLight && !reducedMotion) {
        nextMeteorTimer -= dt;
        if (nextMeteorTimer <= 0 && !meteor) {
          meteor = {
            x: W * (0.15 + Math.random() * 0.6),
            y: H * (0.06 + Math.random() * 0.24),
            vx: 340 + Math.random() * 140,
            vy: 135 + Math.random() * 60,
            life: 0.7,
            maxLife: 0.7,
            len: 54 + Math.random() * 34,
          };
          nextMeteorTimer = 8.5 + Math.random() * 6.5;
        }
        if (meteor) {
          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;
          meteor.life -= dt;
          if (meteor.life <= 0) {
            meteor = null;
          } else {
            const prog = meteor.life / meteor.maxLife;
            const alpha = Math.sin(prog * Math.PI);
            const mag = Math.hypot(meteor.vx, meteor.vy) || 1;
            const tx = meteor.x - (meteor.vx / mag) * meteor.len;
            const ty = meteor.y - (meteor.vy / mag) * meteor.len;
            const mGrad = ctx.createLinearGradient(meteor.x, meteor.y, tx, ty);
            mGrad.addColorStop(
              0,
              `rgba(255, 255, 255, ${(alpha * 0.78).toFixed(3)})`,
            );
            mGrad.addColorStop(
              0.45,
              `rgba(255, 222, 89, ${(alpha * 0.36).toFixed(3)})`,
            );
            mGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.save();
            ctx.strokeStyle = mGrad;
            ctx.lineWidth = 1.8;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(meteor.x, meteor.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    const tick = (now: number) => {
      if (document.hidden) {
        lastTs = now;
        rafId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      drawFrame(dt);
      rafId = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      if (ro) {
        ro.disconnect();
      } else {
        window.removeEventListener("resize", syncSize);
      }
      if (canvas.parentNode === host) {
        host.removeChild(canvas);
      }
    };
  }, []);

  // Native mobile fallback: crisp themed cosmic backdrop with subtle corner astrolabe rings
  if (Platform.OS !== "web") {
    return (
      <View
        pointerEvents="none"
        testID="astral-drift-background"
        accessibilityLabel="Astral Observatory Drift background"
        style={[styles.layer, { backgroundColor: palette.bg1 }]}
      >
        <View
          style={[
            styles.nativeOrbTop,
            { backgroundColor: rgba(palette.glowA, 0.16) },
          ]}
        />
        <View
          style={[
            styles.nativeOrbBottom,
            { backgroundColor: rgba(palette.glowB, 0.14) },
          ]}
        />
        <View
          style={[
            styles.nativeRingTopRight,
            { borderColor: rgba(palette.line, 0.12) },
          ]}
        />
        <View
          style={[
            styles.nativeRingBottomLeft,
            { borderColor: rgba(palette.line, 0.12) },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      testID="astral-drift-background"
      accessibilityLabel="Astral Observatory Drift background"
      ref={hostRef}
      style={[styles.layer, { backgroundColor: palette.bg0 }]}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  nativeOrbTop: {
    position: "absolute",
    top: -110,
    left: -90,
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  nativeOrbBottom: {
    position: "absolute",
    bottom: -120,
    right: -90,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  nativeRingTopRight: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.2,
  },
  nativeRingBottomLeft: {
    position: "absolute",
    bottom: -85,
    left: -85,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.2,
  },
});
