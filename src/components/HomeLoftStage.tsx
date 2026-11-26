import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
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
  commandLoftCatTo,
  createInitialLoftCatState,
  LOFT_CAT_STATIONS,
  stepLoftCat,
  type LoftCatState,
} from "../utils/loftCatState";
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
import {
  getCompanionMeta,
  getKeycapSetMeta,
  getLoftCustomizationState,
  getMugStyleMeta,
  subscribeLoftCustomization,
  updateLoftCustomization,
  type LoftCustomizationState,
} from "../utils/loftCustomization";
import {
  getLoftSkyVisuals,
  getNextLoftSkyMode,
  resolveLoftSkyPhase,
  type LoftMilestoneTrophies,
  type LoftResolvedSkyPhase,
  type LoftSkyMode,
} from "../utils/loftMilestones";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import LoftWorkshopPanel from "./LoftWorkshopPanel";
import { StudioIcon, Text } from "./StudioIcon";

const DEFAULT_MILESTONES: LoftMilestoneTrophies = {
  serpensPoster: false,
  fairyLights: false,
  arcadeTrophy: false,
  holoPrism: false,
  unlockedCount: 0,
  totalCount: 4,
  nextHint: "NEXT KEEPSAKE: Clear Chapter I for Serpens Wall Chart",
};

interface HomeLoftStageProps {
  activeZone: LoftHighlightZone;
  streakCount?: number;
  totalXp?: number;
  compact?: boolean;
  milestones?: LoftMilestoneTrophies;
  recentVictoryLessonId?: string | null;
  onConsumeVictory?: () => void;
  enableDevTools?: boolean;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  kind: "heart" | "note" | "spark" | "code" | "zzz" | "arcade";
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
  totalXp = 0,
  compact = false,
  milestones = DEFAULT_MILESTONES,
  recentVictoryLessonId = null,
  onConsumeVictory,
  enableDevTools = false,
}: HomeLoftStageProps) {
  const { paletteId, themeMode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const hostRef = useRef<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [skyMode, setSkyMode] = useState<LoftSkyMode>("auto");
  const [workshopOpen, setWorkshopOpen] = useState<boolean>(false);
  const [devOpen, setDevOpen] = useState<boolean>(false);
  const [devUnlockWorkshop, setDevUnlockWorkshop] = useState<boolean>(false);
  const [customization, setCustomization] = useState<LoftCustomizationState>(
    () => getLoftCustomizationState(),
  );
  const [devOverrides, setDevOverrides] = useState<{
    serpensPoster?: boolean;
    fairyLights?: boolean;
    arcadeTrophy?: boolean;
    holoPrism?: boolean;
  }>({});

  useEffect(() => {
    return subscribeLoftCustomization(setCustomization);
  }, []);

  const effectiveMilestones: LoftMilestoneTrophies = useMemo(() => {
    const serpensPoster = devOverrides.serpensPoster ?? milestones.serpensPoster;
    const fairyLights = devOverrides.fairyLights ?? milestones.fairyLights;
    const arcadeTrophy = devOverrides.arcadeTrophy ?? milestones.arcadeTrophy;
    const holoPrism = devOverrides.holoPrism ?? milestones.holoPrism;
    const unlockedCount = [
      serpensPoster,
      fairyLights,
      arcadeTrophy,
      holoPrism,
    ].filter(Boolean).length;
    return {
      ...milestones,
      serpensPoster,
      fairyLights,
      arcadeTrophy,
      holoPrism,
      unlockedCount,
    };
  }, [devOverrides, milestones]);

  const resolvedSkyPhase: LoftResolvedSkyPhase = useMemo(
    () => resolveLoftSkyPhase(skyMode, new Date().getHours()),
    [skyMode],
  );

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const stateRef = useRef<{
    paletteId: typeof paletteId;
    themeMode: typeof themeMode;
    activeZone: LoftHighlightZone;
    streakCount: number;
    skyPhase: LoftResolvedSkyPhase;
    milestones: LoftMilestoneTrophies;
    customization: LoftCustomizationState;
    lampOn: boolean;
    rainOn: boolean;
    lofiPlaying: boolean;
    steamBoost: number;
    catHappy: number;
    victoryBounce: number;
    pendingVictoryBurst: boolean;
    cat: LoftCatState;
    catFxCooldown: number;
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
      poster: Point2D[];
      trophy: Point2D[];
      prism: Point2D[];
    };
    showToast: (msg: string) => void;
  }>({
    paletteId,
    themeMode,
    activeZone,
    streakCount,
    skyPhase: resolvedSkyPhase,
    milestones: effectiveMilestones,
    customization,
    lampOn: true,
    rainOn: true,
    lofiPlaying: getLofiRadioState().isPlaying,
    steamBoost: 0,
    catHappy: 0,
    victoryBounce: 0,
    pendingVictoryBurst: false,
    cat: createInitialLoftCatState(),
    catFxCooldown: 0.9,
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
      poster: [],
      trophy: [],
      prism: [],
    },
    showToast,
  });

  useEffect(() => {
    stateRef.current.paletteId = paletteId;
    stateRef.current.themeMode = themeMode;
    stateRef.current.activeZone = activeZone;
    stateRef.current.streakCount = streakCount;
    stateRef.current.skyPhase = resolvedSkyPhase;
    stateRef.current.milestones = effectiveMilestones;
    stateRef.current.customization = customization;
    stateRef.current.showToast = showToast;
  }, [
    activeZone,
    customization,
    effectiveMilestones,
    paletteId,
    resolvedSkyPhase,
    showToast,
    streakCount,
    themeMode,
  ]);

  const triggerCatVictoryCelebration = useCallback(() => {
    stateRef.current.catHappy = 3.8;
    stateRef.current.victoryBounce = 1.7;
    stateRef.current.pendingVictoryBurst = true;
    playSuccessChime();
  }, []);

  useEffect(() => {
    if (!recentVictoryLessonId) return;
    triggerCatVictoryCelebration();
    onConsumeVictory?.();
  }, [onConsumeVictory, recentVictoryLessonId, triggerCatVictoryCelebration]);

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
            : kind === "code"
              ? ["{}", "✓", "01", "λ"]
              : kind === "zzz"
                ? ["z", "Z"]
                : kind === "arcade"
                  ? ["★", "+10", "✦"]
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
        "prism",
        "lamp",
        "bonsai",
        "arcade",
        "trophy",
        "poster",
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
        if (st.cat.activity !== "window") {
          commandLoftCatTo(st.cat, "window");
          st.showToast(
            st.rainOn
              ? "COZY WINDOW RAIN: ON · CAT LEAPED TO THE SILL!"
              : "CLEAR STARRY SKY · CAT LEAPED TO THE SILL!",
          );
        } else {
          st.showToast(st.rainOn ? "COZY WINDOW RAIN: ON" : "CLEAR STARRY SKY");
        }
      } else if (hit === "mug") {
        const mugMeta = getMugStyleMeta(st.customization.mugStyle);
        st.steamBoost = 1.5;
        playKeyClick();
        spawnParticles(pt.x, pt.y - 8, "spark", 4, mugMeta.drinkColor);
        if (st.cat.activity !== "coding") {
          commandLoftCatTo(st.cat, "coding");
          st.showToast(`${mugMeta.sipToast} · BUDDY HOPPED OVER!`);
        } else {
          st.showToast(mugMeta.sipToast);
        }
      } else if (hit === "cat") {
        const compMeta = getCompanionMeta(st.customization.companion);
        st.catHappy = 2.2;
        playSuccessChime();
        spawnParticles(pt.x, pt.y - 12, "heart", 6, pal.accentPink);
        st.showToast(
          st.customization.companion !== "midnight_cat"
            ? compMeta.petToast
            : st.cat.phase === "walking"
              ? "CAT IS EXPLORING THE LOFT (^ ω ^)"
              : LOFT_CAT_STATIONS[st.cat.activity].petToast,
        );
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
        spawnParticles(pt.x, pt.y - 16, "arcade", 5, pal.accentPink);
        if (st.cat.activity !== "arcade") {
          commandLoftCatTo(st.cat, "arcade");
          st.showToast("ARCADE CABINET · CAT IS HEADING OVER TO PLAY!");
        } else {
          st.showToast("CAT IS ALREADY CRUSHING THE ARCADE HIGH SCORE!");
        }
      } else if (hit === "poster") {
        playKeyClick();
        spawnParticles(pt.x, pt.y - 10, "spark", 5, "#FFDE59");
        st.showToast("KEEPSAKE · SERPENS CONSTELLATION WALL CHART ★");
      } else if (hit === "trophy") {
        playSuccessChime();
        spawnParticles(pt.x, pt.y - 10, "arcade", 5, "#FFDE59");
        st.showToast("KEEPSAKE · GOLDEN ARCADE S-RANK TROPHY ★");
      } else if (hit === "prism") {
        playKeyClick();
        spawnParticles(pt.x, pt.y - 12, "code", 5, pal.accentCyan);
        st.showToast("KEEPSAKE · MASTER HOLOGRAPHIC TRACK PRISM ★");
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onClick);

    const drawLoftScene = (t: number, dt: number) => {
      const st = stateRef.current;
      const pal = getLoftThemeColors(st.paletteId, st.themeMode);
      const sky = getLoftSkyVisuals(st.skyPhase, pal);

      // Clear optional keepsake hitZones each frame so locked keepsakes aren't clickable
      st.hitZones.poster = [];
      st.hitZones.trophy = [];
      st.hitZones.prism = [];

      st.smoothMx += (st.mouseX - st.smoothMx) * Math.min(1, dt * 5);
      st.smoothMy += (st.mouseY - st.smoothMy) * Math.min(1, dt * 5);
      st.steamBoost = Math.max(0, st.steamBoost - dt * 0.75);
      st.catHappy = Math.max(0, st.catHappy - dt * 0.85);
      st.victoryBounce = Math.max(0, st.victoryBounce - dt);
      stepLoftCat(st.cat, dt);
      const catIsPlayingArcade =
        st.cat.phase === "staying" && st.cat.activity === "arcade";
      const catIsCoding =
        st.cat.phase === "staying" && st.cat.activity === "coding";
      const catIsListening =
        st.cat.phase === "staying" && st.cat.activity === "music";
      const catIsWindowGazing =
        st.cat.phase === "staying" && st.cat.activity === "window";
      const catIsLounging =
        st.cat.phase === "staying" && st.cat.activity === "lounge";

      const m = computeIsoMetrics(
        stageW,
        stageH,
        st.smoothMx * 5.5,
        st.smoothMy * 3.5,
      );

      // Helper: renders the expressive autonomous Loft Companion at its live 3D isometric position
      const drawDynamicLoftCat = () => {
        const cat = st.cat;
        const compMeta = getCompanionMeta(st.customization.companion);
        const compId = compMeta.id;
        const coatCol = compMeta.coatColor;
        const pawCol = compMeta.pawColor;
        const catScale = Math.max(0.75, Math.min(1.06, m.halfW / 245));
        const isWalking = cat.phase === "walking";
        const walkBounce = isWalking ? Math.abs(Math.sin(cat.walkPhase)) * 4.2 : 0;
        const arcadeBounce = catIsPlayingArcade ? Math.abs(Math.sin(t * 9.6)) * 2.6 : 0;
        const musicBeat = catIsListening ? Math.abs(Math.sin(t * 5.1)) : 0;
        const codingCadence = catIsCoding
          ? 0.45 + 0.55 * Math.max(0, Math.sin(t * 2.3))
          : 0;
        const catDelighted = st.catHappy > 0 || st.activeZone === "cat";

        // Grounded shadow stays glued to floor, chair seat, arcade stool, or windowsill cushion
        const shadowZ = catIsCoding
          ? 0.188
          : catIsPlayingArcade
            ? 0.152
            : catIsWindowGazing
              ? 0.373
              : 0.008;
        const shadowPt = projectIso(m, cat.u, cat.v, shadowZ);
        const shadowScale = Math.max(0.5, 1 - cat.hopZ * 2.1) * catScale;
        ctx.save();
        ctx.fillStyle = "rgba(5, 8, 15, 0.36)";
        ctx.beginPath();
        ctx.ellipse(
          shadowPt.x,
          shadowPt.y + (catIsWindowGazing || catIsCoding || catIsPlayingArcade ? 2 : 8) * catScale,
          (catIsWindowGazing ? 15 : 19) * shadowScale,
          (catIsWindowGazing ? 6 : 8.5) * shadowScale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();

        const catPt = projectIso(m, cat.u, cat.v, cat.z + cat.hopZ);
        const winHopOffset =
          st.victoryBounce > 0
            ? Math.abs(Math.sin(st.victoryBounce * Math.PI * 3.5)) * 13 * catScale
            : 0;
        const bodyYOffset = -walkBounce - arcadeBounce - winHopOffset;

        if (st.pendingVictoryBurst) {
          st.pendingVictoryBurst = false;
          spawnParticles(catPt.x, catPt.y - 26 * catScale, "arcade", 6, "#FFDE59");
          spawnParticles(catPt.x, catPt.y - 22 * catScale, "heart", 5, pal.accentPink);
          st.showToast("WELCOME BACK · CAT IS CELEBRATING YOUR WIN ★");
        }

        // 0. World-space reaching paws for Coding (on keyboard!), Arcade (on joystick/buttons!), and Window (pawing glass!)
        if (catIsCoding && !catDelighted) {
          const shoulderL = { x: catPt.x - 1 * catScale, y: catPt.y - 5 * catScale };
          const shoulderR = { x: catPt.x + 8 * catScale, y: catPt.y - 1 * catScale };
          const tapL = Math.sin(t * 22) * 3.0 * codingCadence;
          const tapR = Math.sin(t * 22 + Math.PI) * 3.0 * codingCadence;
          const keyL = projectIso(m, 0.278, 0.258, 0.306);
          const keyR = projectIso(m, 0.352, 0.256, 0.306);

          ctx.save();
          ctx.lineCap = "round";
          // Subtle keycap glow right beneath whichever paw is tapping down!
          if (tapL > 1.0) {
            ctx.fillStyle = `${pal.accentCyan}99`;
            ctx.beginPath();
            ctx.arc(keyL.x, keyL.y, 4.8 * catScale, 0, Math.PI * 2);
            ctx.fill();
          }
          if (tapR > 1.0) {
            ctx.fillStyle = `${pal.accent}99`;
            ctx.beginPath();
            ctx.arc(keyR.x, keyR.y, 4.8 * catScale, 0, Math.PI * 2);
            ctx.fill();
          }
          // Outstretched arms + tapping paws reaching cleanly onto the mechanical keyboard
          for (const [sh, kp, tap] of [
            [shoulderL, keyL, tapL],
            [shoulderR, keyR, tapR],
          ] as const) {
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 7.2 * catScale;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(kp.x, kp.y - Math.max(0, -tap) * 0.9);
            ctx.stroke();

            ctx.strokeStyle = coatCol;
            ctx.lineWidth = 4.4 * catScale;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(kp.x, kp.y - Math.max(0, -tap) * 0.9);
            ctx.stroke();

            ctx.fillStyle = pawCol;
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 1.4 * catScale;
            ctx.beginPath();
            ctx.ellipse(
              kp.x,
              kp.y - Math.max(0, -tap) * 0.9,
              4.3 * catScale,
              2.9 * catScale,
              -0.3,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        } else if (catIsPlayingArcade && !catDelighted) {
          const arcSpec = LOFT_GROUNDED_FURNITURE.arcadeCabinet;
          const shoulderL = {
            x: catPt.x - 3 * catScale,
            y: catPt.y - 6 * catScale + bodyYOffset,
          };
          const shoulderR = {
            x: catPt.x + 8 * catScale,
            y: catPt.y - 2 * catScale + bodyYOffset,
          };
          const joyTarget = projectIso(
            m,
            arcSpec.u0 + 0.06,
            arcSpec.v0 + arcSpec.dv + 0.025,
            0.345,
          );
          const btnTarget = projectIso(
            m,
            arcSpec.u0 + 0.148,
            arcSpec.v0 + arcSpec.dv + 0.024,
            0.346,
          );
          const wiggleX = Math.sin(t * 15) * 3.0 * catScale;
          const mashY = Math.abs(Math.sin(t * 21)) * 4.0 * catScale;

          ctx.save();
          ctx.lineCap = "round";
          if (mashY < 1.2 * catScale) {
            ctx.fillStyle = `${pal.accentSecondary}99`;
            ctx.beginPath();
            ctx.arc(btnTarget.x, btnTarget.y, 4.6 * catScale, 0, Math.PI * 2);
            ctx.fill();
          }
          const pairs: [Point2D, Point2D][] = [
            [shoulderL, { x: joyTarget.x + wiggleX, y: joyTarget.y - 9 * catScale }],
            [shoulderR, { x: btnTarget.x, y: btnTarget.y - mashY }],
          ];
          for (const [sh, tgt] of pairs) {
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 7.2 * catScale;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(tgt.x, tgt.y);
            ctx.stroke();
            ctx.strokeStyle = "#2E344E";
            ctx.lineWidth = 4.4 * catScale;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(tgt.x, tgt.y);
            ctx.stroke();
            ctx.fillStyle = "#3A4262";
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 1.4 * catScale;
            ctx.beginPath();
            ctx.ellipse(tgt.x, tgt.y, 4.2 * catScale, 2.9 * catScale, -0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        } else if (catIsWindowGazing && !catDelighted) {
          // Far paw periodically reaches up onto the starry windowpane glass to playfully tap raindrops!
          const batWave = Math.max(0, Math.sin(t * 1.9) - 0.28) / 0.72;
          const glassPaw = projectIso(
            m,
            0.008,
            0.46 - batWave * 0.038,
            0.49 + batWave * 0.115,
          );
          const sh = { x: catPt.x - 5 * catScale, y: catPt.y - 6 * catScale };
          ctx.save();
          ctx.lineCap = "round";
          if (st.rainOn && batWave > 0.62) {
            ctx.strokeStyle = "rgba(214, 240, 255, 0.72)";
            ctx.lineWidth = 1.4 * catScale;
            ctx.beginPath();
            ctx.arc(
              glassPaw.x - 2 * catScale,
              glassPaw.y - 2 * catScale,
              (3.5 + (batWave - 0.62) * 14) * catScale,
              0,
              Math.PI * 2,
            );
            ctx.stroke();
          }
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 6.6 * catScale;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(glassPaw.x, glassPaw.y);
          ctx.stroke();
          ctx.strokeStyle = "#2E344E";
          ctx.lineWidth = 4.0 * catScale;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(glassPaw.x, glassPaw.y);
          ctx.stroke();
          ctx.fillStyle = "#3A4262";
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 1.3 * catScale;
          ctx.beginPath();
          ctx.ellipse(
            glassPaw.x,
            glassPaw.y,
            3.8 * catScale,
            2.8 * catScale,
            0.4,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.translate(catPt.x, catPt.y + bodyYOffset);
        ctx.scale(catScale, catScale);

        const isFacingAwayRight =
          (catIsCoding || catIsPlayingArcade) && !catDelighted;
        const isFacingAwayLeft = catIsWindowGazing && !catDelighted;
        const isRearView = isFacingAwayRight || isFacingAwayLeft;

        // Horizontal orientation for walking/front poses
        const flipX = isWalking
          ? cat.facingX
          : catIsWindowGazing
            ? -1
            : 1;

        // 1. Expressive Tail (omitted for owl/duck, fluffy curled tail for Shiba, swinging tail for Cats!)
        if (compId !== "pixel_owl" && compId !== "robo_duck") {
          if (catIsWindowGazing) {
            const swing = Math.sin(t * 2.1) * 8;
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 7.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(10, 7);
            ctx.quadraticCurveTo(18 + swing * 0.4, 21, 12 + swing, 34);
            ctx.stroke();
            ctx.strokeStyle = coatCol;
            ctx.lineWidth = 4.8;
            ctx.beginPath();
            ctx.moveTo(10, 7);
            ctx.quadraticCurveTo(18 + swing * 0.4, 21, 12 + swing, 34);
            ctx.stroke();
          } else if (!isRearView) {
            const tailSpeed = isWalking ? 8.5 : catIsListening ? 5.1 : 2.6;
            const tailAmp = isWalking ? 7 : 5.5;
            ctx.strokeStyle = coatCol;
            ctx.lineWidth = compId === "shiba_pup" ? 6.6 : 5.4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(flipX * -12, 6);
            ctx.quadraticCurveTo(
              flipX * (compId === "shiba_pup" ? -26 : -29),
              (compId === "shiba_pup" ? -4 : 3) + Math.sin(t * tailSpeed) * tailAmp,
              flipX * (compId === "shiba_pup" ? -19 : -26),
              (isWalking ? -15 : -11) + Math.cos(t * tailSpeed) * 4,
            );
            ctx.stroke();
          }
        }

        // 2. Trotting Legs when Walking
        if (isWalking) {
          const stride = Math.sin(cat.walkPhase) * 6;
          ctx.fillStyle = pawCol;
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 1.6;
          const paws: [number, number][] = [
            [-9 + stride, 13],
            [9 - stride, 13],
            [-3 - stride * 0.8, 15],
            [4 + stride * 0.8, 15],
          ];
          for (const [px, py] of paws) {
            ctx.beginPath();
            ctx.ellipse(px, py, 4.4, 3.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }

        // 3. Companion Body (tilts naturally into keyboard / arcade / window / music beat!)
        ctx.save();
        if (catIsListening) {
          ctx.rotate(Math.sin(t * 2.55) * 0.08);
        } else if (isWalking) {
          ctx.rotate(flipX * 0.07);
        } else if (isFacingAwayRight) {
          ctx.rotate(catIsCoding ? 0.1 : 0.12);
        } else if (isFacingAwayLeft) {
          ctx.rotate(-0.1);
        }

        ctx.fillStyle = coatCol;
        ctx.strokeStyle = "#090B10";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.ellipse(
          0,
          catIsPlayingArcade ? 2 : catIsWindowGazing ? 2 : 4,
          catIsPlayingArcade ? 16 : catIsWindowGazing ? 15.5 : 18,
          catIsPlayingArcade ? 15.5 : catIsWindowGazing ? 14 : 13.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();

        // Species markings on body (Calico spots / Owl wings / Shiba cream belly / Cat stripes)
        if (compId === "calico_cat") {
          ctx.fillStyle = "#EA8C3A";
          ctx.beginPath();
          ctx.ellipse(-8, 3, 6.5, 5, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#2E2925";
          ctx.beginPath();
          ctx.ellipse(9, 6, 5.2, 4.2, 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (compId === "pixel_owl" || compId === "robo_duck") {
          const wingCol = compId === "pixel_owl" ? "#372A54" : "#EAB308";
          ctx.fillStyle = wingCol;
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 1.5;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(side * 15, 4, 5.2, 8.8, side * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          if (!isRearView) {
            ctx.fillStyle = compMeta.bellyColor;
            ctx.beginPath();
            ctx.ellipse(0, 7, 9.5, 6.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isRearView) {
          ctx.strokeStyle = "rgba(15, 19, 34, 0.38)";
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          for (const sy of [-2, 3, 8]) {
            ctx.beginPath();
            ctx.moveTo(-6, sy);
            ctx.quadraticCurveTo(0, sy - 2, 6, sy);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = compMeta.bellyColor;
          ctx.beginPath();
          ctx.ellipse(flipX * 2, 7, 9.5, 6.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Music station beat-tapping front paw
        if (catIsListening) {
          ctx.fillStyle = pawCol;
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 1.6;
          const pawTap = musicBeat * 3.2;
          ctx.beginPath();
          ctx.ellipse(10, 11 - pawTap, 4.8, 3.2, 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Foreground curled tail when facing away at PC or Arcade!
        if (isFacingAwayRight && compId !== "pixel_owl" && compId !== "robo_duck") {
          const tailSpd = catIsPlayingArcade ? 9.5 : 2.8;
          const tailAmp = catIsPlayingArcade ? 8.5 : 4.5;
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 7.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-6, 10);
          ctx.quadraticCurveTo(
            -21,
            12 + Math.sin(t * tailSpd) * tailAmp,
            -25,
            (catIsPlayingArcade ? -4 : 2) + Math.cos(t * tailSpd) * 4,
          );
          ctx.stroke();
          ctx.strokeStyle = coatCol;
          ctx.lineWidth = 4.8;
          ctx.beginPath();
          ctx.moveTo(-6, 10);
          ctx.quadraticCurveTo(
            -21,
            12 + Math.sin(t * tailSpd) * tailAmp,
            -25,
            (catIsPlayingArcade ? -4 : 2) + Math.cos(t * tailSpd) * 4,
          );
          ctx.stroke();
        }

        // 4. Expressive Head + Activity Tilt/Bob
        const headBob = catIsListening
          ? -musicBeat * 3.2
          : catIsCoding
            ? Math.sin(t * 7.2) * 1.1 * codingCadence
            : catIsPlayingArcade
              ? Math.sin(t * 9.6) * 1.3
              : Math.sin(t * 2.2) * 1.3;
        const headTilt = catIsListening
          ? Math.sin(t * 2.55) * 0.14
          : isFacingAwayLeft
            ? -0.14 + Math.sin(t * 1.3) * 0.05
            : isFacingAwayRight
              ? 0.06 + Math.sin(t * 2.1) * 0.03
              : 0;

        ctx.translate(
          isFacingAwayRight ? 3 : isFacingAwayLeft ? -3 : 0,
          -15 + headBob,
        );
        ctx.rotate(headTilt);

        // Ears / Owl Ear Tufts / Robo-Duck Chrome Antenna
        const earTwitch =
          catIsWindowGazing && Math.sin(t * 3.4) > 0.82 ? 2.6 : 0;
        if (compId === "robo_duck") {
          // Chrome telemetry antenna on duck head
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(0, -13);
          ctx.lineTo(0, -24);
          ctx.stroke();
          ctx.fillStyle = "#38BDF8";
          ctx.strokeStyle = "#090B10";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(0, -25, 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          for (const side of [-1, 1]) {
            const twitch = side === -1 ? earTwitch : 0;
            ctx.fillStyle =
              compId === "calico_cat" && side === 1 ? "#EA8C3A" : coatCol;
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(side * 6, -10);
            ctx.lineTo(
              side * (compId === "pixel_owl" ? 19 + twitch : 17 + twitch),
              (compId === "shiba_pup" ? -20 : -23) - twitch * 0.6,
            );
            ctx.lineTo(side * 18, -5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (!isRearView) {
              ctx.fillStyle = compMeta.earInnerColor;
              ctx.beginPath();
              ctx.moveTo(side * 9, -10);
              ctx.lineTo(side * (15 + twitch * 0.7), -18 - twitch * 0.5);
              ctx.lineTo(side * 15, -8);
              ctx.closePath();
              ctx.fill();
            } else {
              const rimFacing =
                (isFacingAwayRight && side === 1) ||
                (isFacingAwayLeft && side === -1);
              if (rimFacing) {
                ctx.strokeStyle = catIsCoding
                  ? pal.accentCyan
                  : catIsPlayingArcade
                    ? pal.accentPink
                    : pal.skyGlow;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(side * 9, -12);
                ctx.lineTo(side * (16 + twitch), -21.5 - twitch * 0.6);
                ctx.stroke();
              }
            }
          }
        }

        // Rounded Head
        ctx.fillStyle = coatCol;
        ctx.strokeStyle = "#090B10";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Species head details (Calico cheek patch, Shiba cream cheeks, Owl/Duck beak!)
        if (!isRearView && compId === "calico_cat") {
          ctx.fillStyle = "#EA8C3A";
          ctx.beginPath();
          ctx.ellipse(10, -5, 6.5, 5, 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (!isRearView && compId === "shiba_pup") {
          ctx.fillStyle = "#FFF3DC";
          ctx.beginPath();
          ctx.ellipse(0, 6.2, 13.5, 7.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ambient Rim-Light Glow + Peeking Whiskers on Head Edge Facing PC Monitor / Arcade Screen / Moonlit Window!
        if (isRearView) {
          const rimColor = catIsCoding
            ? pal.accentCyan
            : catIsPlayingArcade
              ? pal.accentPink
              : "#FFF8DC";
          const dir = isFacingAwayRight ? 1 : -1;
          ctx.save();
          ctx.strokeStyle = rimColor;
          ctx.lineWidth = 2.6;
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          if (isFacingAwayRight) {
            ctx.arc(0, 0, 16.2, -Math.PI * 0.45, Math.PI * 0.16);
          } else {
            ctx.arc(0, 0, 16.2, Math.PI * 0.84, Math.PI * 1.45);
          }
          ctx.stroke();

          // Tiny peeking cheek whiskers facing the screen/window so the 3/4 gaze reads cleanly past the headphones!
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 1.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(dir * 19.5, 4.5);
          ctx.lineTo(dir * 25.5, 3.2);
          ctx.moveTo(dir * 18.8, 7.6);
          ctx.lineTo(dir * 24.5, 8.2);
          ctx.stroke();
          ctx.restore();
        }

        // Golden Studio Headphones (+ pulsing neon beat rings when listening to music!)
        if (catIsListening) {
          const ringR = 5 + musicBeat * 7;
          ctx.strokeStyle = pal.accent;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.25 + (1 - musicBeat) * 0.55;
          ctx.beginPath();
          ctx.arc(-22, 0, ringR, Math.PI * 0.7, Math.PI * 1.3);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(22, 0, ringR, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = pal.accentSecondary;
        ctx.lineWidth = 3.2;
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

        // Front Visor Face ONLY when facing toward the viewer (lounge, music, walking, or petted!)
        if (!isRearView) {
          ctx.fillStyle = "#090D16";
          drawRoundedRect(ctx, -12, -5.5, 24, 11, 5);
          ctx.fill();
          const blinking = Math.sin(t * 0.85) > 0.965;
          ctx.lineWidth = 1.8;

          if (catDelighted || catIsListening || blinking) {
            ctx.strokeStyle = catIsListening ? pal.accentPink : pal.accent;
            for (const ex of [-5.5, 5.5]) {
              ctx.beginPath();
              ctx.moveTo(ex - 2.8, 1);
              ctx.lineTo(ex, -2.2);
              ctx.lineTo(ex + 2.8, 1);
              ctx.stroke();
            }
          } else {
            const lookX = isWalking ? flipX * 1.5 : 0;
            ctx.fillStyle =
              compId === "pixel_owl"
                ? "#FDE047"
                : compId === "robo_duck"
                  ? "#38BDF8"
                  : pal.accent;
            const eyeR = compId === "pixel_owl" ? 2.8 : 2.1;
            ctx.beginPath();
            ctx.arc(-5.5 + lookX, 0, eyeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(5.5 + lookX, 0, eyeR, 0, Math.PI * 2);
            ctx.fill();
          }

          // Species snout / beak accent right beneath the visor
          if (compId === "shiba_pup") {
            ctx.fillStyle = "#1E1B18";
            ctx.beginPath();
            ctx.ellipse(0, 7.2, 2.8, 1.9, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (compId === "pixel_owl") {
            ctx.fillStyle = "#F59E0B";
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-3.2, 5.2);
            ctx.lineTo(3.2, 5.2);
            ctx.lineTo(0, 9.8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (compId === "robo_duck") {
            ctx.fillStyle = "#F97316";
            ctx.strokeStyle = "#090B10";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.ellipse(0, 7.6, 7.4, 3.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        } else {
          // Cute subtle back-of-head tabby tufts when looking at PC / Arcade / Window
          ctx.strokeStyle = "rgba(15, 19, 34, 0.55)";
          ctx.lineWidth = 1.8;
          ctx.lineCap = "round";
          for (const tx of [-4, 0, 4]) {
            ctx.beginPath();
            ctx.moveTo(tx, -8);
            ctx.lineTo(tx, -3);
            ctx.stroke();
          }
        }

        ctx.restore();
        ctx.restore();

        // Update live cat hitbox so petting works anywhere in the room!
        st.hitZones.cat = [
          { x: catPt.x - 28 * catScale, y: catPt.y - 38 * catScale + bodyYOffset },
          { x: catPt.x + 28 * catScale, y: catPt.y - 38 * catScale + bodyYOffset },
          { x: catPt.x + 28 * catScale, y: catPt.y + 20 * catScale + bodyYOffset },
          { x: catPt.x - 28 * catScale, y: catPt.y + 20 * catScale + bodyYOffset },
        ];

        // Periodic charming activity particles!
        st.catFxCooldown -= dt;
        if (st.catFxCooldown <= 0 && !isWalking) {
          if (catIsPlayingArcade) {
            st.catFxCooldown = 0.72;
            const arcTop = projectIso(m, 0.78, 0.16, 0.62);
            spawnParticles(arcTop.x, arcTop.y, "arcade", 1, pal.accentSecondary);
          } else if (catIsCoding) {
            st.catFxCooldown = 0.9;
            const monTop = projectIso(m, 0.31, 0.16, 0.54);
            spawnParticles(monTop.x, monTop.y, "code", 1, pal.accentCyan);
          } else if (catIsListening) {
            st.catFxCooldown = 0.85;
            spawnParticles(catPt.x, catPt.y - 34 * catScale, "note", 1, pal.accentPink);
          } else if (catIsWindowGazing) {
            st.catFxCooldown = 1.5;
            spawnParticles(catPt.x - 14, catPt.y - 28 * catScale, "spark", 1, "#FFF8DC");
          } else if (catIsLounging) {
            st.catFxCooldown = 2.1;
            spawnParticles(catPt.x + 12, catPt.y - 26 * catScale, "zzz", 1, pal.accentCyan);
          }
        }
      };

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
      skyGrad.addColorStop(0, sky.skyTop);
      skyGrad.addColorStop(0.58, sky.skyMid);
      skyGrad.addColorStop(1, sky.skyGlow);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(
        Math.min(wTop.x, wBot.x) - 10,
        Math.min(wTop.y, wBot.y) - 10,
        Math.abs(wBot.x - wTop.x) + 20,
        Math.abs(wBot.y - wTop.y) + 20,
      );

      // Twinkling stars inside clipped sky (scaled smoothly by sky.starOpacity)
      if (sky.starOpacity > 0.02) {
        for (let i = 0; i < windowStars.length; i += 1) {
          const ws = windowStars[i];
          const sp = projectIso(
            m,
            0,
            vMin + ws.vFrac * (vMax - vMin),
            zMin + ws.zFrac * (zMax - zMin),
          );
          const a =
            (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.1 + ws.phase))) *
            sky.starOpacity;
          ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(2)})`;
          ctx.fillRect(sp.x, sp.y, 1.8, 1.8);
        }
      }

      if (sky.showMoon) {
        // Crescent moon + soft ambient moonlight halo
        const moonPt = projectIso(m, 0, vMin + 0.12, zMax - 0.11);
        const moonHalo = ctx.createRadialGradient(
          moonPt.x,
          moonPt.y,
          2,
          moonPt.x,
          moonPt.y,
          Math.max(18, m.halfW * 0.11),
        );
        moonHalo.addColorStop(0, "rgba(255, 248, 220, 0.36)");
        moonHalo.addColorStop(1, "transparent");
        ctx.fillStyle = moonHalo;
        ctx.beginPath();
        ctx.arc(moonPt.x, moonPt.y, Math.max(18, m.halfW * 0.11), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFF8DC";
        ctx.beginPath();
        ctx.arc(moonPt.x, moonPt.y, Math.max(5.5, m.halfW * 0.032), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = sky.skyTop;
        ctx.beginPath();
        ctx.arc(
          moonPt.x + 2.8,
          moonPt.y - 1.6,
          Math.max(4.6, m.halfW * 0.027),
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Occasional gentle shooting star gliding across the starry window sky
        const shootCycle = t % 7.4;
        if (shootCycle < 0.85) {
          const sp = shootCycle / 0.85;
          const sv = vMin + 0.08 + sp * 0.34;
          const sz = zMax - 0.06 - sp * 0.16;
          const head = projectIso(m, 0, sv, sz);
          const tail = projectIso(m, 0, sv - 0.075, sz + 0.036);
          ctx.save();
          ctx.strokeStyle = `rgba(255, 248, 220, ${(Math.sin(sp * Math.PI) * 0.85).toFixed(2)})`;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(head.x, head.y);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // Warm rising/setting or clear-day Sun + soft atmospheric halo
        const sunZ =
          sky.sunMode === "day"
            ? zMax - 0.12
            : sky.sunMode === "dawn"
              ? zMin + 0.21
              : zMin + 0.18;
        const sunV =
          sky.sunMode === "day" ? vMin + 0.15 : vMin + 0.24;
        const sunPt = projectIso(m, 0, sunV, sunZ);
        const sunR = Math.max(7, m.halfW * (sky.sunMode === "day" ? 0.036 : 0.046));
        const sunHalo = ctx.createRadialGradient(
          sunPt.x,
          sunPt.y,
          2,
          sunPt.x,
          sunPt.y,
          sunR * 3.2,
        );
        sunHalo.addColorStop(0, `${sky.sunColor}99`);
        sunHalo.addColorStop(1, "transparent");
        ctx.fillStyle = sunHalo;
        ctx.beginPath();
        ctx.arc(sunPt.x, sunPt.y, sunR * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = sky.sunColor;
        ctx.beginPath();
        ctx.arc(sunPt.x, sunPt.y, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Cozy drifting lo-fi clouds during Clear Day / Dawn / Sunset
        for (let c = 0; c < 2; c += 1) {
          const cf = ((t * 0.035 + c * 0.52) % 1.2) - 0.1;
          const cv = vMin + cf * (vMax - vMin);
          const cz = zMax - 0.14 - c * 0.09;
          const cp = projectIso(m, 0, cv, cz);
          ctx.fillStyle =
            sky.sunMode === "day"
              ? "rgba(255, 255, 255, 0.42)"
              : "rgba(253, 186, 116, 0.28)";
          ctx.beginPath();
          ctx.ellipse(cp.x, cp.y, 15, 5.2, -0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Window World Scenic Backdrop (Neo-Tokyo / Starry Observatory / Alpine Peaks / Sakura Courtyard)
      const windowWorld = st.customization.windowWorld;
      if (windowWorld === "starry_observatory") {
        // Cosmic nebula ribbon + twin domed observatory silhouettes + shooting star streak
        ctx.save();
        const nebStart = projectIso(m, 0, vMin, zMin + 0.34);
        const nebEnd = projectIso(m, 0, vMax, zMin + 0.18);
        const nebGrad = ctx.createLinearGradient(nebStart.x, nebStart.y, nebEnd.x, nebEnd.y);
        nebGrad.addColorStop(0, "rgba(56, 189, 248, 0.24)");
        nebGrad.addColorStop(0.5, "rgba(196, 181, 253, 0.28)");
        nebGrad.addColorStop(1, "rgba(244, 114, 182, 0.20)");
        ctx.strokeStyle = nebGrad;
        ctx.lineWidth = 18;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(nebStart.x, nebStart.y);
        ctx.quadraticCurveTo(
          (nebStart.x + nebEnd.x) * 0.5,
          (nebStart.y + nebEnd.y) * 0.5 - 14 + Math.sin(t * 0.8) * 3,
          nebEnd.x,
          nebEnd.y,
        );
        ctx.stroke();

        // Twin Observatory Domes on ridge
        for (const [dv, dz, dr] of [
          [vMin + 0.14, zMin + 0.14, 16],
          [vMax - 0.16, zMin + 0.12, 12],
        ] as const) {
          const dp = projectIso(m, 0, dv, dz);
          ctx.fillStyle = "rgba(12, 16, 32, 0.88)";
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, dr, Math.PI, 0);
          ctx.lineTo(dp.x + dr, dp.y + 18);
          ctx.lineTo(dp.x - dr, dp.y + 18);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(dp.x + 2, dp.y - dr + 2);
          ctx.lineTo(dp.x + dr * 0.65, dp.y - dr - 7);
          ctx.stroke();
        }

        // Periodic shooting star streak
        const meteorPhase = (t * 0.32) % 1;
        if (meteorPhase < 0.35) {
          const mf = meteorPhase / 0.35;
          const mp1 = projectIso(m, 0, vMin + 0.08 + mf * 0.38, zMax - 0.06 - mf * 0.16);
          const mp2 = projectIso(m, 0, vMin + 0.02 + mf * 0.38, zMax - 0.03 - mf * 0.16);
          ctx.strokeStyle = "#FFDE59";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(mp2.x, mp2.y);
          ctx.lineTo(mp1.x, mp1.y);
          ctx.stroke();
        }
        ctx.restore();
      } else if (windowWorld === "alpine_cabin") {
        // Layered snow-capped mountain silhouettes + shimmering emerald aurora
        ctx.save();
        const aurL = projectIso(m, 0, vMin + 0.04, zMax - 0.11);
        const aurR = projectIso(m, 0, vMax - 0.04, zMax - 0.17);
        ctx.strokeStyle = "rgba(110, 231, 183, 0.32)";
        ctx.lineWidth = 11;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(aurL.x, aurL.y);
        ctx.quadraticCurveTo(
          (aurL.x + aurR.x) * 0.5,
          (aurL.y + aurR.y) * 0.5 - 10 + Math.sin(t * 1.1) * 4,
          aurR.x,
          aurR.y,
        );
        ctx.stroke();

        const peaks: [number, number, number][] = [
          [vMin + 0.08, zMin + 0.25, 0.14],
          [vMin + 0.28, zMin + 0.31, 0.16],
          [vMax - 0.11, zMin + 0.23, 0.15],
        ];
        for (const [pv, pz, halfSpan] of peaks) {
          const pTop = projectIso(m, 0, pv, pz);
          const pL = projectIso(m, 0, pv - halfSpan, zMin - 0.04);
          const pR = projectIso(m, 0, pv + halfSpan, zMin - 0.04);
          ctx.fillStyle = "rgba(15, 32, 46, 0.88)";
          ctx.beginPath();
          ctx.moveTo(pTop.x, pTop.y);
          ctx.lineTo(pR.x, pR.y);
          ctx.lineTo(pL.x, pL.y);
          ctx.closePath();
          ctx.fill();

          // Snow cap
          const sL = projectIso(m, 0, pv - halfSpan * 0.36, pz - 0.08);
          const sR = projectIso(m, 0, pv + halfSpan * 0.36, pz - 0.08);
          ctx.fillStyle = "rgba(226, 242, 255, 0.85)";
          ctx.beginPath();
          ctx.moveTo(pTop.x, pTop.y);
          ctx.lineTo(sR.x, sR.y);
          ctx.lineTo(sL.x, sL.y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else if (windowWorld === "sakura_kyoto") {
        // Tiered Kyoto Pagoda silhouette + warm glowing paper lanterns + drifting pink petals
        ctx.save();
        for (let tier = 0; tier < 3; tier += 1) {
          const tz = zMin + 0.09 + tier * 0.075;
          const span = 0.11 - tier * 0.022;
          const centerV = vMax - 0.16;
          drawIsoQuad(
            ctx,
            m,
            [
              [0, centerV - span, tz],
              [0, centerV + span, tz],
              [0, centerV + span * 0.72, tz + 0.036],
              [0, centerV - span * 0.72, tz + 0.036],
            ],
            "rgba(24, 14, 34, 0.86)",
          );
        }
        // Warm glowing courtyard lanterns
        for (let k = 0; k < 3; k += 1) {
          const lp = projectIso(m, 0, vMin + 0.1 + k * 0.12, zMin + 0.11 + (k % 2) * 0.03);
          ctx.fillStyle = "#FB923C";
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(253, 186, 116, 0.25)";
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        // Drifting pink cherry blossom petals
        ctx.fillStyle = "#F9A8D4";
        for (let p = 0; p < 12; p += 1) {
          const pf = (t * 0.14 + p * 0.19) % 1;
          const pv = vMin + ((p * 0.17 + pf * 0.35) % 1) * (vMax - vMin);
          const pz = zMax - pf * (zMax - zMin);
          const pp = projectIso(m, 0, pv, pz);
          ctx.beginPath();
          ctx.ellipse(pp.x, pp.y, 2.8, 1.5, t + p, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        // Default: Neo-Tokyo Skyline silhouettes + glowing windows + commuter train
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
            sky.sunMode === "day" ? "rgba(18, 34, 62, 0.68)" : "rgba(9, 11, 22, 0.78)",
          );
          if (sky.cityLightAlpha > 0.18) {
            ctx.save();
            ctx.globalAlpha = sky.cityLightAlpha;
            for (let row = 0; row < 2; row += 1) {
              if ((b + row) % 2 === 0) {
                const lp = projectIso(m, 0, bv0 + 0.024, zMin + bh - 0.045 - row * 0.04);
                ctx.fillStyle = b % 3 === 0 ? pal.accent : "#FFE89E";
                ctx.fillRect(lp.x, lp.y, 2.8, 3.2);
              }
            }
            ctx.restore();
          }
        }

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
      }

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

      // Deep protruding 3D wooden windowsill ledge + support corbels
      for (const cv of [vMin + 0.03, vMax - 0.055]) {
        drawIsoBox(
          ctx,
          m,
          0,
          cv,
          zMin - 0.078,
          0.052,
          0.026,
          0.038,
          "#4E3426",
          "#3B261B",
          "#2B1B13",
          "#090B10",
          1.2,
        );
      }
      drawIsoBox(
        ctx,
        m,
        0,
        vMin - 0.035,
        zMin - 0.042,
        0.084,
        vMax - vMin + 0.07,
        0.04,
        "#734F3C",
        "#543829",
        "#3D271C",
        "#090B10",
        1.5,
      );

      // Tiny warm glowing fairy-light jar on the upper-left corner of the sill
      drawIsoBox(
        ctx,
        m,
        0.018,
        vMin + 0.02,
        zMin - 0.002,
        0.042,
        0.042,
        0.056,
        "rgba(255, 240, 185, 0.55)",
        "rgba(255, 224, 130, 0.38)",
        "rgba(200, 175, 110, 0.34)",
        "#090B10",
        1.1,
      );
      const jarPt = projectIso(m, 0.039, vMin + 0.041, zMin + 0.028 + Math.sin(t * 3.1) * 0.006);
      const jarGlow = ctx.createRadialGradient(jarPt.x, jarPt.y, 1, jarPt.x, jarPt.y, 13);
      jarGlow.addColorStop(0, "rgba(255, 232, 138, 0.72)");
      jarGlow.addColorStop(1, "transparent");
      ctx.fillStyle = jarGlow;
      ctx.beginPath();
      ctx.arc(jarPt.x, jarPt.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFF8DC";
      ctx.beginPath();
      ctx.arc(jarPt.x, jarPt.y, 2.1, 0, Math.PI * 2);
      ctx.fill();

      // Cozy plush miniature window-perch cushion resting on the wooden sill
      drawIsoBox(
        ctx,
        m,
        0.012,
        0.43,
        zMin - 0.002,
        0.064,
        0.21,
        0.016,
        "#48356B",
        "#362752",
        "#271B3D",
        "#090B10",
        1.3,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [0.02, 0.445, zMin + 0.015],
          [0.068, 0.445, zMin + 0.015],
          [0.068, 0.625, zMin + 0.015],
          [0.02, 0.625, zMin + 0.015],
        ],
        "rgba(255, 255, 255, 0.06)",
        pal.rugStripe,
        1.1,
      );

      // Soft moonlight wash across the sill & perched cat while window-gazing
      if (catIsWindowGazing) {
        const sillLightPt = projectIso(m, 0.04, 0.54, 0.46);
        const sillGlow = ctx.createRadialGradient(
          sillLightPt.x - 10,
          sillLightPt.y - 8,
          4,
          sillLightPt.x,
          sillLightPt.y,
          m.halfW * 0.24,
        );
        sillGlow.addColorStop(0, `${sky.windowWashColor}38`);
        sillGlow.addColorStop(1, "transparent");
        ctx.fillStyle = sillGlow;
        ctx.beginPath();
        ctx.arc(sillLightPt.x, sillLightPt.y, m.halfW * 0.24, 0, Math.PI * 2);
        ctx.fill();

        // Draw the perched Loft Cat right on top of the windowsill cushion in exact 3D depth order!
        drawDynamicLoftCat();
      }

      // 2b. MILESTONE KEEPSAKE: 5-DAY STREAK WARM FAIRY STRING-LIGHTS ALONG UPPER WALLS!
      if (st.milestones.fairyLights) {
        const drawWallFairyStrand = (isLeftWall: boolean) => {
          const steps = 21;
          ctx.save();
          ctx.strokeStyle = "#181C28";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          for (let s = 0; s <= steps; s += 1) {
            const frac = 0.04 + (s / steps) * 0.91;
            const sag = Math.abs(Math.sin((s / steps) * Math.PI * 3)) * 0.036;
            const zPos = 0.925 - sag;
            const pt = isLeftWall
              ? projectIso(m, 0.004, frac, zPos)
              : projectIso(m, frac, 0.004, zPos);
            if (s === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();

          for (let b = 0; b < 8; b += 1) {
            const frac = 0.08 + (b / 7) * 0.83;
            const sag =
              Math.abs(Math.sin(((frac - 0.04) / 0.91) * Math.PI * 3)) * 0.036;
            const zPos = 0.922 - sag;
            const bp = isLeftWall
              ? projectIso(m, 0.006, frac, zPos)
              : projectIso(m, frac, 0.006, zPos);
            const twinkle =
              0.68 +
              0.32 * Math.sin(t * 2.8 + b * 1.35 + (isLeftWall ? 0 : 1.9));
            const glow = ctx.createRadialGradient(
              bp.x,
              bp.y + 1.5,
              0.5,
              bp.x,
              bp.y + 1.5,
              9.5,
            );
            glow.addColorStop(
              0,
              `rgba(255, 224, 130, ${(0.58 * twinkle).toFixed(2)})`,
            );
            glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(bp.x, bp.y + 1.5, 9.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = b % 2 === 0 ? "#FFFBEB" : "#FDE047";
            ctx.beginPath();
            ctx.arc(bp.x, bp.y + 1.5, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        };
        drawWallFairyStrand(true);
        drawWallFairyStrand(false);
      }

      // 3. LEFT WALL: FLOATING BOOKSHELF (+ GOLDEN ARCADE TROPHY KEEPSAKE!) + SKILL MAP BOARD
      // Floating mini-bookshelf near back corner (u=0, v=0.025..0.155, z=0.68..0.71)
      drawIsoBox(
        ctx,
        m,
        0,
        0.025,
        0.68,
        0.058,
        0.132,
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
          0.036 + b * 0.025,
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

      // MILESTONE KEEPSAKE: Gleaming Golden Arcade S-Rank Cup beside the books!
      if (st.milestones.arcadeTrophy) {
        drawIsoBox(
          ctx,
          m,
          0.014,
          0.118,
          0.706,
          0.028,
          0.028,
          0.018,
          "#2B3044",
          "#1E2233",
          "#141724",
          "#090B10",
          1,
        );
        const cupBase = projectIso(m, 0.028, 0.132, 0.725);
        ctx.save();
        // Trophy stem + gleaming golden chalice bowl + twin handles
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cupBase.x, cupBase.y);
        ctx.lineTo(cupBase.x, cupBase.y - 6);
        ctx.stroke();

        ctx.strokeStyle = "#FDE047";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cupBase.x - 4.5, cupBase.y - 9.5, 2.6, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cupBase.x + 4.5, cupBase.y - 9.5, 2.6, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();

        ctx.fillStyle = "#FFDE59";
        ctx.strokeStyle = "#090B10";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cupBase.x - 5.2, cupBase.y - 13);
        ctx.lineTo(cupBase.x + 5.2, cupBase.y - 13);
        ctx.lineTo(cupBase.x + 3.4, cupBase.y - 5.5);
        ctx.lineTo(cupBase.x - 3.4, cupBase.y - 5.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Periodic golden starlight glint on trophy rim
        const glint = Math.max(0, Math.sin(t * 3.2));
        if (glint > 0.55) {
          ctx.fillStyle = "#FFFFFF";
          ctx.globalAlpha = (glint - 0.55) / 0.45;
          ctx.beginPath();
          ctx.arc(cupBase.x + 3.5, cupBase.y - 13, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        st.hitZones.trophy = [
          { x: cupBase.x - 12, y: cupBase.y - 20 },
          { x: cupBase.x + 12, y: cupBase.y - 20 },
          { x: cupBase.x + 12, y: cupBase.y + 6 },
          { x: cupBase.x - 12, y: cupBase.y + 6 },
        ];
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

      // 4. RIGHT WALL: POSTER (UPGRADES TO FRAMED SERPENS STAR CHART!) + GLASS WHITEBOARD
      if (st.milestones.serpensPoster) {
        const posterPoly = drawIsoQuad(
          ctx,
          m,
          [
            [0.032, 0, 0.805],
            [0.148, 0, 0.805],
            [0.148, 0, 0.54],
            [0.032, 0, 0.54],
          ],
          "#12162A",
          "#FFDE59",
          2.0,
        );
        st.hitZones.poster = posterPoly;
        drawIsoQuad(
          ctx,
          m,
          [
            [0.042, 0.002, 0.785],
            [0.138, 0.002, 0.785],
            [0.138, 0.002, 0.56],
            [0.042, 0.002, 0.56],
          ],
          "#0B0F22",
        );
        const serpNodes: [number, number][] = [
          [0.122, 0.755],
          [0.095, 0.735],
          [0.062, 0.695],
          [0.105, 0.645],
          [0.072, 0.592],
        ];
        const serpPts = serpNodes.map(([su, sz]) => projectIso(m, su, 0.004, sz));
        ctx.save();
        ctx.strokeStyle = "#FFDE59";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        serpPts.forEach((pt, idx) =>
          idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y),
        );
        ctx.stroke();
        serpPts.forEach((pt, idx) => {
          ctx.fillStyle = idx === 0 ? "#FFFBEB" : "#FFDE59";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, idx === 0 ? 2.4 : 1.9, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Starter small framed retro Devy art poster near corner
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
      }

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

      // Ambient monitor glow on desk (brightens subtly when hovering Studio or while the cat is coding!)
      const monHot = stuHot || catIsCoding;
      const monCenter = projectIso(m, 0.31, 0.17, 0.36);
      const monGlow = ctx.createRadialGradient(
        monCenter.x,
        monCenter.y,
        6,
        monCenter.x,
        monCenter.y + 12,
        monHot ? m.halfW * 0.44 : m.halfW * 0.28,
      );
      monGlow.addColorStop(
        0,
        monHot ? "rgba(56, 189, 248, 0.44)" : `${pal.accent}36`,
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
      // Animated scrolling Python code lines on main screen (faster live typing + cursor when cat is coding!)
      const codeTick = Math.floor(t * (catIsCoding ? 5.6 : 2.2));
      for (let line = 0; line < 5; line += 1) {
        const lineZ = 0.478 - line * 0.026;
        const isTypingLine = catIsCoding && line === 4;
        const lenU = isTypingLine
          ? 0.03 + ((t * 1.45) % 1) * 0.135
          : 0.06 + ((line * 17 + codeTick) % 10) * 0.011;
        const p1 = projectIso(m, 0.22, 0.158, lineZ);
        const p2 = projectIso(m, 0.22 + lenU, 0.158, lineZ);
        ctx.strokeStyle =
          line % 2 === 0 ? pal.accent : line === 1 ? pal.accentSecondary : pal.accentCyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Blinking live terminal cursor right at the tip of the active typing line
        if (isTypingLine && Math.sin(t * 11) > -0.2) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(p2.x + 1, p2.y - 3, 2.8, 5);
        }
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

      // Mechanical Keyboard + Wireless Mouse sitting flat on desk mat (Workshop Keycap Set!)
      const keycapMeta = getKeycapSetMeta(st.customization.keycaps);
      drawIsoBox(
        ctx,
        m,
        0.21,
        0.205,
        0.287,
        0.175,
        0.075,
        0.018,
        keycapMeta.caseTop,
        keycapMeta.caseLeft,
        keycapMeta.caseRight,
        "#090B10",
        1.3,
      );
      // Alpha keycap rows strip
      drawIsoQuad(
        ctx,
        m,
        [
          [0.248, 0.216, 0.306],
          [0.342, 0.216, 0.306],
          [0.342, 0.264, 0.306],
          [0.248, 0.264, 0.306],
        ],
        keycapMeta.alphaHighlight,
      );
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
        keycapMeta.escColor,
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
        keycapMeta.enterColor,
      );
      // Wireless Mouse
      drawIsoBox(ctx, m, 0.415, 0.225, 0.287, 0.036, 0.052, 0.015, "#D9DDE8", "#A7B0C4", "#7C859C", "#090B10", 1.1);

      // MILESTONE KEEPSAKE: Spinning 3D Desk Holographic Prism (on back-left corner of desk!)
      if (st.milestones.holoPrism) {
        drawIsoBox(
          ctx,
          m,
          0.104,
          0.088,
          0.287,
          0.052,
          0.052,
          0.016,
          "#252C42",
          "#191E2F",
          "#111522",
          "#FFDE59",
          1.2,
        );
        const emitPt = projectIso(m, 0.13, 0.114, 0.305);
        const holoCenter = projectIso(
          m,
          0.13,
          0.114,
          0.395 + Math.sin(t * 2.4) * 0.012,
        );

        // Soft volumetric cyan/gold projector cone
        ctx.save();
        const beamGrad = ctx.createLinearGradient(
          emitPt.x,
          emitPt.y,
          holoCenter.x,
          holoCenter.y - 16,
        );
        beamGrad.addColorStop(0, `${pal.accentCyan}66`);
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(emitPt.x - 4, emitPt.y);
        ctx.lineTo(holoCenter.x - 14, holoCenter.y - 12);
        ctx.lineTo(holoCenter.x + 14, holoCenter.y - 12);
        ctx.lineTo(emitPt.x + 4, emitPt.y);
        ctx.closePath();
        ctx.fill();

        // Live 3D rotating wireframe octahedron crystal
        const topV = { x: holoCenter.x, y: holoCenter.y - 13 };
        const botV = { x: holoCenter.x, y: holoCenter.y + 13 };
        const ringPts = [0, 1, 2, 3].map((k) => {
          const ang = t * 1.85 + (k * Math.PI) / 2;
          return {
            x: holoCenter.x + Math.cos(ang) * 10.5,
            y: holoCenter.y + Math.sin(ang) * 4.2,
          };
        });

        ctx.fillStyle = `${pal.accentCyan}26`;
        ctx.beginPath();
        ctx.moveTo(topV.x, topV.y);
        ctx.lineTo(ringPts[0].x, ringPts[0].y);
        ctx.lineTo(botV.x, botV.y);
        ctx.lineTo(ringPts[2].x, ringPts[2].y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = pal.accentCyan;
        ctx.lineWidth = 1.45;
        ctx.beginPath();
        for (let k = 0; k < 4; k += 1) {
          const nxt = ringPts[(k + 1) % 4];
          ctx.moveTo(ringPts[k].x, ringPts[k].y);
          ctx.lineTo(nxt.x, nxt.y);
          ctx.moveTo(topV.x, topV.y);
          ctx.lineTo(ringPts[k].x, ringPts[k].y);
          ctx.moveTo(botV.x, botV.y);
          ctx.lineTo(ringPts[k].x, ringPts[k].y);
        }
        ctx.stroke();

        ctx.fillStyle = "#FFDE59";
        ctx.beginPath();
        ctx.arc(holoCenter.x, holoCenter.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        st.hitZones.prism = [
          { x: holoCenter.x - 16, y: holoCenter.y - 18 },
          { x: holoCenter.x + 16, y: holoCenter.y - 18 },
          { x: emitPt.x + 14, y: emitPt.y + 6 },
          { x: emitPt.x - 14, y: emitPt.y + 6 },
        ];
      }

      // Steaming Ceramic Coffee / Matcha Mug (clickable + Workshop Mug Style!)
      const mugMeta = getMugStyleMeta(st.customization.mugStyle);
      drawIsoBox(
        ctx,
        m,
        0.11,
        0.20,
        0.287,
        0.044,
        0.044,
        0.062,
        mugMeta.bodyTop,
        mugMeta.bodyLeft,
        mugMeta.bodyRight,
        "#090B10",
        1.4,
      );
      drawIsoQuad(
        ctx,
        m,
        [
          [0.117, 0.207, 0.35],
          [0.147, 0.207, 0.35],
          [0.147, 0.237, 0.35],
          [0.117, 0.237, 0.35],
        ],
        mugMeta.drinkColor,
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
      const arcHot = st.activeZone === "arcade" || catIsPlayingArcade;
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
      st.hitZones.arcade = [
        projectIso(m, arcSpec.u0, arcSpec.v0, 0.64),
        projectIso(m, arcSpec.u0 + arcSpec.du, arcSpec.v0, 0.64),
        projectIso(m, arcSpec.u0 + arcSpec.du, arcSpec.v0, 0),
        projectIso(m, arcSpec.u0 + arcSpec.du, arcSpec.v0 + arcSpec.dv, 0),
        projectIso(m, arcSpec.u0, arcSpec.v0 + arcSpec.dv, 0),
        projectIso(m, arcSpec.u0, arcSpec.v0 + arcSpec.dv, 0.64),
      ];

      // Grounded Mini Wooden Arcade Step-Stool (so the cat stands cleanly at joystick height!)
      drawFloorShadow(ctx, m, 0.715, 0.315, 0.12, 0.10, 0.36);
      const stoolLegs: [number, number][] = [
        [0.722, 0.322],
        [0.812, 0.322],
        [0.722, 0.392],
        [0.812, 0.392],
      ];
      for (const [slu, slv] of stoolLegs) {
        drawIsoBox(ctx, m, slu, slv, 0, 0.018, 0.018, 0.126, "#5C3D2C", "#422B1F", "#301E15", "#090B10", 1);
      }
      drawIsoBox(
        ctx,
        m,
        0.715,
        0.315,
        0.126,
        0.12,
        0.10,
        0.024,
        "#7D533C",
        "#5D3C2A",
        "#462C1F",
        "#090B10",
        1.3,
      );
      if (catIsPlayingArcade) {
        drawDynamicLoftCat();
      }

      // 7. GROUNDED DESK CHAIR (z = 0..0.34)
      const chSpec = LOFT_GROUNDED_FURNITURE.chair;
      drawFloorShadow(ctx, m, chSpec.u0, chSpec.v0, chSpec.du, chSpec.dv, 0.36);
      // Caster base + pneumatic stem grounded at z = 0
      drawIsoBox(ctx, m, chSpec.u0 + 0.03, chSpec.v0 + 0.03, 0, 0.08, 0.08, 0.02, "#242A3B", "#181D2B", "#111520", "#090B10", 1.1);
      drawIsoBox(ctx, m, chSpec.u0 + 0.058, chSpec.v0 + 0.058, 0.02, 0.024, 0.024, 0.13, "#363F56", "#23293A", "#171C28", "#090B10", 1);
      // Cushioned chair seat
      drawIsoBox(ctx, m, chSpec.u0, chSpec.v0, 0.15, chSpec.du, chSpec.dv, 0.036, "#4A5575", "#353E59", "#262D42", "#090B10", 1.4);
      // When the cat is coding at the desk, draw it seated snugly inside the chair BEFORE the backrest!
      if (catIsCoding) {
        drawDynamicLoftCat();
      }
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

      // Plush Cushion resting squarely on the rug
      const cushionPt = projectIso(m, 0.43, 0.74, 0.025);
      const cushionScale = Math.max(0.75, Math.min(1.08, m.halfW / 245));
      ctx.save();
      ctx.translate(cushionPt.x, cushionPt.y);
      ctx.scale(cushionScale, cushionScale);
      ctx.fillStyle = "#3E2E5C";
      ctx.strokeStyle = "#090B10";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 12, 28, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Render the autonomous Loft Cat when lounging, walking, or listening to lo-fi on the floorboards
      if (!catIsCoding && !catIsWindowGazing && !catIsPlayingArcade) {
        drawDynamicLoftCat();
      }

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
        ctx.font =
          pt.kind === "code" || pt.kind === "arcade" || pt.kind === "zzz"
            ? "900 11px 'JetBrains Mono', ui-monospace, monospace"
            : pt.kind === "note"
              ? "900 14px sans-serif"
              : "900 13px sans-serif";
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

        {/* Top-Left Real-Time Sky Cycle Pill & Top-Right Keepsake / Dev HUD */}
        {Platform.OS === "web" ? (
          <>
            <View style={styles.topLeftHud}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cycle loft window sky time of day"
                style={styles.hudPill}
                onPress={() => {
                  playKeyClick();
                  setSkyMode((prev) => {
                    const next = getNextLoftSkyMode(prev);
                    const nextResolved = resolveLoftSkyPhase(
                      next,
                      new Date().getHours(),
                    );
                    const label =
                      next === "auto"
                        ? `AUTO · ${nextResolved.toUpperCase()}`
                        : nextResolved.toUpperCase();
                    showToast(`WINDOW SKY · ${label}`);
                    return next;
                  });
                }}
              >
                <Text style={styles.hudPillText}>
                  {resolvedSkyPhase === "midnight" ? "☾" : "☀"}{" "}
                  {skyMode === "auto"
                    ? `AUTO · ${resolvedSkyPhase.toUpperCase()}`
                    : resolvedSkyPhase.toUpperCase()}
                </Text>
              </Pressable>
            </View>

            <View style={styles.topRightHud}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Cozy Loft Workshop"
                style={[
                  styles.hudPill,
                  workshopOpen && {
                    backgroundColor: StudioColors.lime,
                    borderColor: StudioColors.ink,
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  setWorkshopOpen((prev) => !prev);
                }}
              >
                <Text
                  style={[
                    styles.hudPillText,
                    { color: workshopOpen ? StudioColors.ink : StudioColors.lime },
                  ]}
                >
                  ✦ WORKSHOP
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Inspect loft milestone keepsakes"
                style={[
                  styles.hudPill,
                  effectiveMilestones.unlockedCount === 4 && {
                    borderColor: StudioColors.yellow,
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  showToast(effectiveMilestones.nextHint.toUpperCase());
                }}
              >
                <Text
                  style={[
                    styles.hudPillText,
                    effectiveMilestones.unlockedCount > 0 && {
                      color: StudioColors.yellow,
                    },
                  ]}
                >
                  ★ {effectiveMilestones.unlockedCount}/4 KEEPSAKES
                </Text>
              </Pressable>

              {enableDevTools ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Loft dev testing tools"
                  style={[
                    styles.hudPill,
                    devOpen && {
                      backgroundColor: StudioColors.yellow,
                      borderColor: StudioColors.ink,
                    },
                  ]}
                  onPress={() => {
                    playKeyClick();
                    setDevOpen((prev) => !prev);
                  }}
                >
                  <Text
                    style={[
                      styles.hudPillText,
                      { color: devOpen ? StudioColors.ink : StudioColors.yellow },
                    ]}
                  >
                    ⚙ DEV
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {devOpen && enableDevTools ? (
              <View testID="loft-dev-tools" style={styles.devDrawer}>
                <View style={styles.devDrawerHeader}>
                  <Text style={styles.devDrawerKicker}>
                    ⚙ LOFT SANDBOX · MILESTONES
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close Loft dev tools"
                    onPress={() => {
                      playKeyClick();
                      setDevOpen(false);
                    }}
                  >
                    <Text style={styles.devCloseText}>✕</Text>
                  </Pressable>
                </View>

                <View style={styles.devGrid}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev toggle Serpens wall poster"
                    style={[
                      styles.devBtn,
                      effectiveMilestones.serpensPoster && styles.devBtnOn,
                    ]}
                    onPress={() => {
                      playKeyClick();
                      setDevOverrides((prev) => ({
                        ...prev,
                        serpensPoster: !effectiveMilestones.serpensPoster,
                      }));
                    }}
                  >
                    <Text style={styles.devBtnText}>★ SERPENS CHART</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev toggle 5-day fairy string lights"
                    style={[
                      styles.devBtn,
                      effectiveMilestones.fairyLights && styles.devBtnOn,
                    ]}
                    onPress={() => {
                      playKeyClick();
                      setDevOverrides((prev) => ({
                        ...prev,
                        fairyLights: !effectiveMilestones.fairyLights,
                      }));
                    }}
                  >
                    <Text style={styles.devBtnText}>✦ FAIRY LIGHTS</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev toggle golden arcade trophy"
                    style={[
                      styles.devBtn,
                      effectiveMilestones.arcadeTrophy && styles.devBtnOn,
                    ]}
                    onPress={() => {
                      playKeyClick();
                      setDevOverrides((prev) => ({
                        ...prev,
                        arcadeTrophy: !effectiveMilestones.arcadeTrophy,
                      }));
                    }}
                  >
                    <Text style={styles.devBtnText}>🏆 ARCADE CUP</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev toggle desk holographic prism"
                    style={[
                      styles.devBtn,
                      effectiveMilestones.holoPrism && styles.devBtnOn,
                    ]}
                    onPress={() => {
                      playKeyClick();
                      setDevOverrides((prev) => ({
                        ...prev,
                        holoPrism: !effectiveMilestones.holoPrism,
                      }));
                    }}
                  >
                    <Text style={styles.devBtnText}>◈ HOLO PRISM</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev unlock all 4 loft keepsakes"
                    style={[styles.devBtn, { borderColor: StudioColors.yellow }]}
                    onPress={() => {
                      playSuccessChime();
                      setDevOverrides({
                        serpensPoster: true,
                        fairyLights: true,
                        arcadeTrophy: true,
                        holoPrism: true,
                      });
                      showToast("ALL 4 LOFT KEEPSAKES UNLOCKED ★");
                    }}
                  >
                    <Text style={[styles.devBtnText, { color: StudioColors.yellow }]}>
                      ✦ UNLOCK ALL 4
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev trigger cat victory celebration"
                    style={[styles.devBtn, { borderColor: StudioColors.pink }]}
                    onPress={triggerCatVictoryCelebration}
                  >
                    <Text style={[styles.devBtnText, { color: StudioColors.pink }]}>
                      🎉 CAT WIN HOP
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dev unlock all Loft Workshop items"
                    style={[
                      styles.devBtn,
                      devUnlockWorkshop && styles.devBtnOn,
                      { borderColor: StudioColors.lime },
                    ]}
                    onPress={() => {
                      playSuccessChime();
                      setDevUnlockWorkshop((prev) => !prev);
                      setWorkshopOpen(true);
                      showToast("DEV: ALL WORKSHOP ITEMS UNLOCKED ✦");
                    }}
                  >
                    <Text style={[styles.devBtnText, { color: StudioColors.lime }]}>
                      ✦ UNLOCK WORKSHOP
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {/* Brief Click Interaction Toast (auto-hides after 2.2s) */}
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
              CLICK LAMP · WINDOW · MUG · {getCompanionMeta(customization.companion).hintVerb}
            </Text>
          </View>
        ) : null}
      </View>

      {workshopOpen ? (
        <LoftWorkshopPanel
          customization={customization}
          totalXp={totalXp}
          devUnlockAll={devUnlockWorkshop}
          onSelectPatch={(patch, label) => {
            updateLoftCustomization(patch);
            showToast(`LOFT EQUIPPED: ${label} ✦`);
          }}
          onClose={() => setWorkshopOpen(false)}
        />
      ) : null}
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
    topLeftHud: {
      position: "absolute",
      top: 10,
      left: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    topRightHud: {
      position: "absolute",
      top: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    hudPill: {
      backgroundColor: "rgba(9, 13, 24, 0.82)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.16)",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    hudPillText: {
      color: "rgba(241, 245, 249, 0.88)",
      fontFamily: MonoFont,
      fontSize: 9,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      letterSpacing: 0.45,
    },
    devDrawer: {
      position: "absolute",
      top: 40,
      right: 10,
      width: 248,
      backgroundColor: "rgba(9, 13, 24, 0.94)",
      borderWidth: 1.8,
      borderColor: StudioColors.yellow,
      borderRadius: 12,
      padding: 10,
      gap: 7,
      ...HardShadowSm,
    },
    devDrawerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    devDrawerKicker: {
      color: StudioColors.yellow,
      fontFamily: MonoFont,
      fontSize: 8.5,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    devCloseText: {
      color: "#E2E8F0",
      fontSize: 11,
      fontWeight: "900",
      paddingHorizontal: 4,
    },
    devGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    devBtn: {
      width: "48.5%",
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    devBtnOn: {
      borderColor: StudioColors.mint,
      backgroundColor: "rgba(110, 231, 183, 0.18)",
    },
    devBtnText: {
      color: "#F8FAFC",
      fontFamily: MonoFont,
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.3,
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
