import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ChapterTierMeta,
  getChapterForTrackLesson,
  isLessonInChapter,
} from "../constants/certificates";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  getLessonStageProgress,
  getLessonStarRating,
  isLessonLockedForUser,
  isProTrackPreviewLesson,
} from "../types/lesson";
import {
  type AstralStarGraph,
  type AstralStarNode,
  buildAstralStarGraph,
  clampAstralCamera,
  getAstralAncestors,
  getAstralPalette,
} from "../utils/astralChartGeometry";
import { playKeyClick } from "../utils/soundEffects";
import {
  getDifficultyColor,
  getShortLessonSummary,
} from "./RoadmapSubcomponents";
import type { Lesson } from "./RoadmapTree";
import { Text } from "./StudioIcon";

interface RoadmapAstralChartProps {
  activeTrack: string;
  trackLabel: string;
  trackAccent: string;
  trackLessons: Lesson[];
  chapters: ChapterTierMeta[];
  completedLessons: Record<string, boolean>;
  completedChallenges: Record<string, boolean>;
  peekedSolutions: Record<string, boolean>;
  dueReviewIdSet: Set<string>;
  claimedChapters: Record<string, boolean>;
  isPremium: boolean;
  nextUpLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  onClaimChapterBonus?: (chapterKey: string, bonusXp: number) => void;
  onOpenChapterCertificate?: (
    trackKey: string,
    chapter: ChapterTierMeta,
  ) => void;
}

interface AmbientStar {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
  tint: number;
}

interface RippleBurst {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  r: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}

function createAmbientStars(count: number): AmbientStar[] {
  const stars: AmbientStar[] = [];
  let seed = 42197;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967295;
  };
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: rand(),
      y: rand(),
      r: 0.65 + rand() * 2.0,
      depth: 0.2 + rand() * 0.85,
      phase: rand() * Math.PI * 2,
      tint: rand(),
    });
  }
  return stars;
}

const AMBIENT_STARS = createAmbientStars(210);

export default function RoadmapAstralChart({
  activeTrack,
  trackLabel,
  trackAccent,
  trackLessons,
  chapters,
  completedLessons,
  completedChallenges,
  peekedSolutions,
  dueReviewIdSet,
  claimedChapters,
  isPremium,
  nextUpLesson,
  onSelectLesson,
  onClaimChapterBonus,
  onOpenChapterCertificate,
}: RoadmapAstralChartProps) {
  const { paletteId, themeMode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPhone = windowWidth > 0 && windowWidth < 640;

  const viewportHeight = windowHeight > 0 ? windowHeight : 860;
  const observatoryHeight = isPhone
    ? Math.max(540, Math.min(680, Math.round(viewportHeight * 0.72)))
    : Math.max(680, Math.min(860, Math.round(viewportHeight * 0.8)));

  const astralPalette = useMemo(
    () => getAstralPalette(paletteId, themeMode),
    [paletteId, themeMode],
  );

  const graph: AstralStarGraph<Lesson> = useMemo(
    () => buildAstralStarGraph(trackLessons, chapters, activeTrack),
    [trackLessons, chapters, activeTrack],
  );

  const defaultSelectedId = useMemo(() => {
    if (nextUpLesson && graph.nodes.some((n) => n.id === nextUpLesson.id)) {
      return nextUpLesson.id;
    }
    return graph.nodes[0]?.id || null;
  }, [graph.nodes, nextUpLesson]);

  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(!isPhone);
  const [activeJumpChapter, setActiveJumpChapter] = useState<number | null>(
    null,
  );
  const [zoomDisplay, setZoomDisplay] = useState<number>(100);

  const resolvedSelectedId = useMemo(() => {
    if (selectedId && graph.nodes.some((n) => n.id === selectedId)) {
      return selectedId;
    }
    return defaultSelectedId;
  }, [selectedId, graph.nodes, defaultSelectedId]);

  const selectedNode: AstralStarNode<Lesson> | null = useMemo(() => {
    if (!resolvedSelectedId) return null;
    return graph.nodes.find((n) => n.id === resolvedSelectedId) || null;
  }, [graph.nodes, resolvedSelectedId]);

  const hostRef = useRef<any>(null);
  const cameraRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    zoom: 1,
    tzoom: 1,
    initializedTrack: "",
  });
  const hoveredIdRef = useRef<string | null>(null);
  const burstsRef = useRef<RippleBurst[]>([]);
  const shootingStarRef = useRef<ShootingStar | null>(null);
  const nextMeteorTimerRef = useRef<number>(3.2);

  const latestPropsRef = useRef({
    graph,
    astralPalette,
    trackAccent,
    completedLessons,
    completedChallenges,
    peekedSolutions,
    dueReviewIdSet,
    isPremium,
    nextUpLessonId: nextUpLesson?.id || null,
    selectedId: resolvedSelectedId,
    isPhone,
    onSelectLesson,
  });

  useEffect(() => {
    latestPropsRef.current = {
      graph,
      astralPalette,
      trackAccent,
      completedLessons,
      completedChallenges,
      peekedSolutions,
      dueReviewIdSet,
      isPremium,
      nextUpLessonId: nextUpLesson?.id || null,
      selectedId: resolvedSelectedId,
      isPhone,
      onSelectLesson,
    };
  });

  const spawnStardustBurst = useCallback(
    (wx: number, wy: number, color: string, count = 24) => {
      for (let i = 0; i < count; i += 1) {
        const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = 52 + Math.random() * 135;
        burstsRef.current.push({
          x: wx,
          y: wy,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          decay: 1.0 + Math.random() * 0.85,
          r: 2.0 + Math.random() * 3.2,
          color,
        });
      }
    },
    [],
  );

  const glideToPoint = useCallback(
    (wx: number, wy: number, instant = false) => {
      const clamped = clampAstralCamera(wx, wy, graph.bounds);
      cameraRef.current.tx = clamped.x;
      cameraRef.current.ty = clamped.y;
      if (instant) {
        cameraRef.current.x = clamped.x;
        cameraRef.current.y = clamped.y;
      }
    },
    [graph.bounds],
  );

  // Center camera cleanly on track switch or initial mount
  useEffect(() => {
    const targetNode =
      graph.nodes.find((n) => n.id === defaultSelectedId) || graph.nodes[0];
    if (!targetNode) return;
    const isNewTrack = cameraRef.current.initializedTrack !== activeTrack;
    cameraRef.current.initializedTrack = activeTrack;
    glideToPoint(targetNode.x, targetNode.y, isNewTrack);
  }, [activeTrack, defaultSelectedId, graph.nodes, glideToPoint]);

  const handleAdjustZoom = useCallback((delta: number) => {
    playKeyClick();
    const next = Math.max(
      0.65,
      Math.min(1.45, +(cameraRef.current.tzoom + delta).toFixed(2)),
    );
    cameraRef.current.tzoom = next;
    setZoomDisplay(Math.round(next * 100));
  }, []);

  const handleRecenter = useCallback(() => {
    playKeyClick();
    const target =
      graph.nodes.find((n) => n.id === nextUpLesson?.id) || graph.nodes[0];
    cameraRef.current.tzoom = 1;
    setZoomDisplay(100);
    setActiveJumpChapter(null);
    if (target) {
      setSelectedId(target.id);
      glideToPoint(target.x, target.y, false);
      spawnStardustBurst(target.x, target.y, astralPalette.accent, 20);
    }
  }, [
    graph.nodes,
    nextUpLesson?.id,
    glideToPoint,
    spawnStardustBurst,
    astralPalette.accent,
  ]);

  const handlePanStep = useCallback(
    (dx: number) => {
      playKeyClick();
      const clamped = clampAstralCamera(
        cameraRef.current.tx + dx,
        cameraRef.current.ty,
        graph.bounds,
      );
      cameraRef.current.tx = clamped.x;
      cameraRef.current.ty = clamped.y;
    },
    [graph.bounds],
  );

  // Main 60fps HTML5 Canvas Observatory Engine (Web)
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const host = hostRef.current as HTMLElement | null;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      host.removeChild(canvas);
      return;
    }

    let W = host.clientWidth || 1200;
    let H = host.clientHeight || 720;
    let dpr = 1;

    const syncSize = () => {
      const nextW = Math.max(280, host.clientWidth || 1200);
      const nextH = Math.max(360, host.clientHeight || 720);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = nextW;
      H = nextH;
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

    const worldToScreen = (wx: number, wy: number) => {
      const cam = cameraRef.current;
      const centerShiftX = latestPropsRef.current.isPhone ? 0 : -72;
      return {
        x: W * 0.5 + centerShiftX + (wx - cam.x) * cam.zoom,
        y: H * 0.5 + (wy - cam.y) * cam.zoom,
      };
    };

    const hitTest = (sx: number, sy: number): AstralStarNode<Lesson> | null => {
      const { graph: g } = latestPropsRef.current;
      const zoom = cameraRef.current.zoom;
      for (let i = g.nodes.length - 1; i >= 0; i -= 1) {
        const node = g.nodes[i];
        const sc = worldToScreen(node.x, node.y);
        const hitR = Math.max(26, (node.radius + 12) * zoom);
        if (Math.hypot(sx - sc.x, sy - sc.y) <= hitR) {
          return node;
        }
      }
      return null;
    };

    let isDragging = false;
    let dragMoved = false;
    let dragStart = { x: 0, y: 0, cx: 0, cy: 0 };
    let lastClickInfo = { id: "", time: 0 };

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      isDragging = true;
      dragMoved = false;
      dragStart = {
        x: sx,
        y: sy,
        cx: cameraRef.current.tx,
        cy: cameraRef.current.ty,
      };
      canvas.style.cursor = "grabbing";
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failures on synthetic events
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (isDragging) {
        const dx = sx - dragStart.x;
        const dy = sy - dragStart.y;
        if (Math.hypot(dx, dy) > 4) dragMoved = true;
        const z = Math.max(0.5, cameraRef.current.zoom);
        const clamped = clampAstralCamera(
          dragStart.cx - dx / z,
          dragStart.cy - dy / z,
          latestPropsRef.current.graph.bounds,
        );
        cameraRef.current.tx = clamped.x;
        cameraRef.current.ty = clamped.y;
      } else {
        const hit = hitTest(sx, sy);
        hoveredIdRef.current = hit ? hit.id : null;
        canvas.style.cursor = hit ? "pointer" : "grab";
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      isDragging = false;
      const hit = hitTest(sx, sy);
      canvas.style.cursor = hit ? "pointer" : "grab";

      if (!dragMoved && hit) {
        playKeyClick();
        const now = performance.now();
        const isDouble =
          lastClickInfo.id === hit.id && now - lastClickInfo.time < 340;
        lastClickInfo = { id: hit.id, time: now };

        setSelectedId(hit.id);
        setInspectorOpen(true);
        const clamped = clampAstralCamera(
          hit.x,
          hit.y,
          latestPropsRef.current.graph.bounds,
        );
        cameraRef.current.tx = clamped.x;
        cameraRef.current.ty = clamped.y;
        spawnStardustBurst(
          hit.x,
          hit.y,
          latestPropsRef.current.astralPalette.accent,
          22,
        );

        if (isDouble) {
          latestPropsRef.current.onSelectLesson(hit.lesson);
        }
      }
    };

    const onPointerLeave = () => {
      if (!isDragging) {
        hoveredIdRef.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const horizontalIntent =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontalIntent) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const z = Math.max(0.5, cameraRef.current.zoom);
      const clamped = clampAstralCamera(
        cameraRef.current.tx + (delta * 0.9) / z,
        cameraRef.current.ty,
        latestPropsRef.current.graph.bounds,
      );
      cameraRef.current.tx = clamped.x;
      cameraRef.current.ty = clamped.y;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      elapsed += dt;

      const cam = cameraRef.current;
      const ease = Math.min(1, dt * 8.2);
      cam.x += (cam.tx - cam.x) * ease;
      cam.y += (cam.ty - cam.y) * ease;
      cam.zoom += (cam.tzoom - cam.zoom) * ease;

      const props = latestPropsRef.current;
      const pal = props.astralPalette;
      const g = props.graph;
      const nodeById = new Map<string, AstralStarNode<Lesson>>();
      for (const n of g.nodes) nodeById.set(n.id, n);

      const activeHoverId = hoveredIdRef.current;
      const focusAncestors = activeHoverId
        ? getAstralAncestors(activeHoverId, g.edges)
        : null;

      // 1. Deep Twilight Observatory Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, pal.skyTop);
      skyGrad.addColorStop(0.52, pal.skyMid);
      skyGrad.addColorStop(1, pal.skyBot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Twin Soft Drifting Parallax Nebulae
      const neb1X = W * 0.28 - cam.x * 0.08 + Math.sin(elapsed * 0.22) * 30;
      const neb1Y = H * 0.34 - cam.y * 0.08;
      const neb1 = ctx.createRadialGradient(
        neb1X,
        neb1Y,
        14,
        neb1X,
        neb1Y,
        Math.max(W, H) * 0.5,
      );
      neb1.addColorStop(0, pal.nebulaA);
      neb1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, W, H);

      const neb2X = W * 0.72 - cam.x * 0.06 + Math.cos(elapsed * 0.18) * 28;
      const neb2Y = H * 0.68 - cam.y * 0.06;
      const neb2 = ctx.createRadialGradient(
        neb2X,
        neb2Y,
        14,
        neb2X,
        neb2Y,
        Math.max(W, H) * 0.46,
      );
      neb2.addColorStop(0, pal.nebulaB);
      neb2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, W, H);

      // 3. Multi-Depth Twinkling Parallax Starfield
      for (let i = 0; i < AMBIENT_STARS.length; i += 1) {
        const s = AMBIENT_STARS[i];
        const sx = (((s.x * W - cam.x * 0.14 * s.depth) % W) + W) % W;
        const sy = (((s.y * H - cam.y * 0.14 * s.depth) % H) + H) % H;
        const twinkle =
          0.32 + 0.68 * (0.5 + 0.5 * Math.sin(elapsed * 2.1 + s.phase));
        const alpha = (twinkle * (0.28 + s.depth * 0.48)).toFixed(3);
        ctx.fillStyle =
          s.tint > 0.86
            ? `rgba(255, 222, 89, ${alpha})`
            : s.tint < 0.14
              ? `rgba(196, 181, 253, ${alpha})`
              : `rgba(248, 250, 252, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * (0.55 + s.depth * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Occasional Cozy Shooting Star
      nextMeteorTimerRef.current -= dt;
      if (nextMeteorTimerRef.current <= 0 && !shootingStarRef.current) {
        shootingStarRef.current = {
          x: W * (0.16 + Math.random() * 0.64),
          y: H * (0.06 + Math.random() * 0.28),
          vx: 380 + Math.random() * 140,
          vy: 150 + Math.random() * 65,
          life: 0.72,
          maxLife: 0.72,
          len: 58 + Math.random() * 36,
        };
        nextMeteorTimerRef.current = 5.0 + Math.random() * 6.0;
      }
      const meteor = shootingStarRef.current;
      if (meteor) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life -= dt;
        if (meteor.life <= 0) {
          shootingStarRef.current = null;
        } else {
          const p = meteor.life / meteor.maxLife;
          const alpha = Math.sin(p * Math.PI);
          const mag = Math.hypot(meteor.vx, meteor.vy) || 1;
          const tx = meteor.x - (meteor.vx / mag) * meteor.len;
          const ty = meteor.y - (meteor.vy / mag) * meteor.len;
          const mg = ctx.createLinearGradient(meteor.x, meteor.y, tx, ty);
          mg.addColorStop(0, `rgba(255, 255, 255, ${(alpha * 0.92).toFixed(3)})`);
          mg.addColorStop(
            0.4,
            `rgba(255, 222, 89, ${(alpha * 0.48).toFixed(3)})`,
          );
          mg.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.save();
          ctx.strokeStyle = mg;
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 5. Subtle Celestial Astrolabe Meridian Rings
      ctx.save();
      const astrolabeCenter = worldToScreen(0, 0);
      ctx.strokeStyle = pal.ringStroke;
      ctx.lineWidth = 1;
      [230, 440, 680, 940].forEach((rad, idx) => {
        const sr = rad * cam.zoom;
        ctx.setLineDash(idx % 2 === 1 ? [5, 11] : []);
        ctx.beginPath();
        ctx.arc(astrolabeCenter.x, astrolabeCenter.y, sr, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // 6. Chapter Constellation Halos & Celestial Headers
      for (const cluster of g.clusters) {
        const sc = worldToScreen(cluster.cx, cluster.cy);
        const rad = cluster.radius * cam.zoom;
        if (sc.x + rad < -90 || sc.x - rad > W + 90) continue;

        const doneCount = cluster.lessonIds.filter(
          (id) => props.completedLessons[id],
        ).length;
        const totalCount = cluster.lessonIds.length;
        const isCleared = totalCount > 0 && doneCount === totalCount;

        const halo = ctx.createRadialGradient(
          sc.x,
          sc.y,
          rad * 0.1,
          sc.x,
          sc.y,
          rad,
        );
        halo.addColorStop(
          0,
          isCleared
            ? "rgba(255, 222, 89, 0.12)"
            : "rgba(255, 255, 255, 0.048)",
        );
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, rad, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.strokeStyle = isCleared
          ? "rgba(255, 222, 89, 0.28)"
          : pal.ringStroke;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, rad * 0.86, Math.PI * 1.18, Math.PI * 1.82);
        ctx.stroke();
        ctx.setLineDash([]);

        const labelY = sc.y - Math.min(rad * 0.84, 188 * cam.zoom) - 12;
        ctx.font = `900 ${Math.max(10, Math.round(11 * cam.zoom))}px 'JetBrains Mono', ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = isCleared ? pal.accentGold : pal.starTextDim;
        const chTag = `CHAPTER ${cluster.chapter.roman} · ${cluster.chapter.title.toUpperCase()}`;
        const statTag = isCleared ? " ★ CLEARED" : ` (${doneCount}/${totalCount})`;
        ctx.fillText(`${chTag}${statTag}`, sc.x, labelY);
        ctx.restore();
      }

      // 7. Curved Starlight Filaments + Animated Energy Pulses
      for (const edge of g.edges) {
        const fromNode = nodeById.get(edge.fromId);
        const toNode = nodeById.get(edge.toId);
        if (!fromNode || !toNode) continue;

        const s1 = worldToScreen(fromNode.x, fromNode.y);
        const s2 = worldToScreen(toNode.x, toNode.y);
        if (Math.max(s1.x, s2.x) < -70 || Math.min(s1.x, s2.x) > W + 70) {
          continue;
        }

        const fromDone = Boolean(props.completedLessons[fromNode.id]);
        const toDone = Boolean(props.completedLessons[toNode.id]);
        const toNext = props.nextUpLessonId === toNode.id;
        const lit = (fromDone && toDone) || (fromDone && toNext);
        const isAncestorHi =
          focusAncestors !== null &&
          focusAncestors.has(fromNode.id) &&
          focusAncestors.has(toNode.id);

        const mx = (s1.x + s2.x) * 0.5;
        const my =
          (s1.y + s2.y) * 0.5 - (edge.crossChapter ? 30 : 18) * cam.zoom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.quadraticCurveTo(mx, my, s2.x, s2.y);

        if (isAncestorHi) {
          ctx.strokeStyle = pal.accentGold;
          ctx.lineWidth = 3.2 * cam.zoom;
          ctx.shadowColor = pal.accentGold;
          ctx.shadowBlur = 14;
        } else if (lit) {
          ctx.strokeStyle = toDone ? pal.accent : pal.accentCyan;
          ctx.lineWidth = 2.4 * cam.zoom;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 11;
        } else {
          ctx.strokeStyle = pal.filamentDim;
          ctx.lineWidth = 1.3 * cam.zoom;
          ctx.setLineDash([4, 6]);
        }
        ctx.stroke();

        if (lit || isAncestorHi) {
          const u = (elapsed * 0.44 + Math.abs(fromNode.x) * 0.0023) % 1;
          const omt = 1 - u;
          const px = omt * omt * s1.x + 2 * omt * u * mx + u * u * s2.x;
          const py = omt * omt * s1.y + 2 * omt * u * my + u * u * s2.y;
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = isAncestorHi ? pal.accentGold : pal.accent;
          ctx.shadowBlur = 11;
          ctx.beginPath();
          ctx.arc(px, py, 3 * cam.zoom, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 8. Draw Interactive Lesson Stars
      for (let idx = 0; idx < g.nodes.length; idx += 1) {
        const node = g.nodes[idx];
        const s = worldToScreen(node.x, node.y);
        if (s.x < -100 || s.x > W + 100 || s.y < -100 || s.y > H + 100) continue;

        const isDone = Boolean(props.completedLessons[node.id]);
        const isLocked = isLessonLockedForUser(node.lesson, props.isPremium);
        const isFreePreview =
          isProTrackPreviewLesson(node.lesson) && !props.isPremium;
        const isNextUp =
          !isDone && !isLocked && props.nextUpLessonId === node.id;
        const isReviewDue = props.dueReviewIdSet.has(node.id);
        const stars = getLessonStarRating(
          node.lesson,
          props.completedLessons,
          props.completedChallenges,
          props.peekedSolutions,
        );
        const isHover = activeHoverId === node.id;
        const isSelected = props.selectedId === node.id;
        const inAncestorTrail = focusAncestors?.has(node.id) ?? false;

        const breathe = 1 + Math.sin(elapsed * 2.6 + idx * 0.7) * 0.06;
        const r =
          node.radius *
          cam.zoom *
          (isHover || isSelected ? 1.22 : isNextUp ? 1.12 : 1);

        const starColor = isDone
          ? stars === 3
            ? pal.accentGold
            : pal.accent
          : isNextUp
            ? pal.accentGold
            : node.isBoss
              ? pal.accentSecondary
              : isFreePreview
                ? pal.accentCyan
                : isLocked
                  ? "#64748B"
                  : pal.accentCyan;

        ctx.save();

        // Orbiting dual brass astrolabe rings for Next-Up Active Mission
        if (isNextUp) {
          const wave = (elapsed * 0.75) % 1;
          ctx.strokeStyle = pal.accentGold;
          ctx.globalAlpha = (1 - wave) * 0.45;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r + (11 + wave * 28) * cam.zoom, 0, Math.PI * 2);
          ctx.stroke();

          ctx.globalAlpha = 0.94;
          ctx.strokeStyle = pal.accent;
          ctx.lineWidth = 1.9;
          ctx.beginPath();
          ctx.arc(
            s.x,
            s.y,
            r + 12 * cam.zoom,
            elapsed * 0.95,
            elapsed * 0.95 + Math.PI * 1.32,
          );
          ctx.stroke();

          ctx.strokeStyle = pal.accentSecondary;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(
            s.x,
            s.y,
            r + 18 * cam.zoom,
            -elapsed * 0.7,
            -elapsed * 0.7 + Math.PI * 0.92,
          );
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (isSelected || isHover) {
          ctx.strokeStyle = isSelected ? pal.accentGold : pal.accent;
          ctx.lineWidth = 1.9;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(s.x, s.y, r + 10 * cam.zoom, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (isReviewDue) {
          ctx.strokeStyle = "#C4B5FD";
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.arc(
            s.x,
            s.y,
            r + 9 * cam.zoom,
            elapsed * 1.1,
            elapsed * 1.1 + Math.PI * 1.4,
          );
          ctx.stroke();
        }

        // Luminous Star Glow Halo
        const haloR = (isLocked ? r * 1.85 : r * 3.15) * breathe;
        const hg = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, haloR);
        hg.addColorStop(
          0,
          isLocked
            ? "rgba(148, 163, 184, 0.22)"
            : inAncestorTrail
              ? `${pal.accentGold}AA`
              : `${starColor}8A`,
        );
        hg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Starlight Rays
        if (!isLocked) {
          const spike = r * (node.isBoss ? 1.98 : 1.65) * breathe;
          ctx.fillStyle = "#FFFFFF";
          const drawCross = (angleOffset: number, scale: number) => {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(angleOffset);
            const sp = spike * scale;
            const w = Math.max(2, r * 0.16);
            ctx.beginPath();
            ctx.moveTo(0, -sp);
            ctx.quadraticCurveTo(w, -w, sp, 0);
            ctx.quadraticCurveTo(w, w, 0, sp);
            ctx.quadraticCurveTo(-w, w, -sp, 0);
            ctx.quadraticCurveTo(-w, -w, 0, -sp);
            ctx.fill();
            ctx.restore();
          };
          drawCross(0, 1);
          if (node.isBoss) {
            drawCross(Math.PI / 4, 0.72);
          }
        }

        // Inner Star Orb
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.74, 0, Math.PI * 2);
        ctx.fillStyle = isLocked ? "#1E293B" : isDone ? starColor : "#0F172A";
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 2.1;
        ctx.strokeStyle = isSelected ? "#FFFFFF" : starColor;
        ctx.stroke();

        // Core Symbol
        ctx.fillStyle = isDone
          ? "#111111"
          : isLocked
            ? "#94A3B8"
            : "#FFFFFF";
        ctx.font = `900 ${Math.max(8.5, Math.round(10 * cam.zoom))}px 'JetBrains Mono', ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const coreSymbol = isDone
          ? "✓"
          : node.isBoss
            ? "★"
            : isLocked
              ? "·"
              : String(node.lesson.lesson_order).padStart(2, "0");
        ctx.fillText(coreSymbol, s.x, s.y + 0.5);

        // Star Title Label Below
        const showStrongLabel =
          isHover || isSelected || isNextUp || node.isBoss || isDone;
        const fontSize = Math.max(10, Math.round(11 * cam.zoom));
        ctx.font = `${showStrongLabel ? "800" : "600"} ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        const label =
          node.lesson.title.length > 24
            ? `${node.lesson.title.slice(0, 23)}…`
            : node.lesson.title;
        const labelY = s.y + r + 19 * cam.zoom;

        if (isHover || isSelected || isNextUp) {
          const textW = ctx.measureText(label).width;
          const padX = 9;
          const pillH = fontSize + 9;
          ctx.fillStyle = "rgba(8, 12, 24, 0.90)";
          ctx.strokeStyle = isNextUp
            ? pal.accentGold
            : isSelected
              ? "#FFFFFF"
              : starColor;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          const rx = s.x - textW * 0.5 - padX;
          const ry = labelY - fontSize - 2.5;
          const rw = textW + padX * 2;
          const radPill = 6;
          ctx.moveTo(rx + radPill, ry);
          ctx.lineTo(rx + rw - radPill, ry);
          ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radPill);
          ctx.lineTo(rx + rw, ry + pillH - radPill);
          ctx.quadraticCurveTo(rx + rw, ry + pillH, rx + rw - radPill, ry + pillH);
          ctx.lineTo(rx + radPill, ry + pillH);
          ctx.quadraticCurveTo(rx, ry + pillH, rx, ry + pillH - radPill);
          ctx.lineTo(rx, ry + radPill);
          ctx.quadraticCurveTo(rx, ry, rx + radPill, ry);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#FFFFFF";
        } else {
          ctx.fillStyle = isLocked ? pal.starTextDim : pal.starText;
        }
        ctx.fillText(label, s.x, labelY);

        if (isNextUp || (isFreePreview && !isDone)) {
          ctx.font = `900 ${Math.max(8.5, Math.round(9 * cam.zoom))}px 'JetBrains Mono', ui-monospace, monospace`;
          ctx.fillStyle = isNextUp ? pal.accentGold : pal.accentCyan;
          ctx.fillText(
            isNextUp ? "★ UP NEXT" : "★ FREE PREVIEW",
            s.x,
            s.y - r - 14 * cam.zoom,
          );
        }

        ctx.restore();
      }

      // 9. Update & Render Click Stardust Bursts
      for (let i = burstsRef.current.length - 1; i >= 0; i -= 1) {
        const b = burstsRef.current[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vx *= 0.93;
        b.vy *= 0.93;
        b.life -= b.decay * dt;
        if (b.life <= 0) {
          burstsRef.current.splice(i, 1);
          continue;
        }
        const sc = worldToScreen(b.x, b.y);
        ctx.save();
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, b.r * b.life * cam.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      if (ro) {
        ro.disconnect();
      } else {
        window.removeEventListener("resize", syncSize);
      }
      if (canvas.parentNode === host) {
        host.removeChild(canvas);
      }
    };
  }, [spawnStardustBurst]);

  // Selected star metadata + its chapter milestone status for the Telescope Inspector
  const selectedMeta = useMemo(() => {
    if (!selectedNode) return null;
    const lesson = selectedNode.lesson;
    const isDone = Boolean(completedLessons[lesson.id]);
    const isLocked = isLessonLockedForUser(lesson, isPremium);
    const isFreePreview = isProTrackPreviewLesson(lesson) && !isPremium;
    const isNextUp = !isDone && !isLocked && nextUpLesson?.id === lesson.id;
    const isReviewDue = dueReviewIdSet.has(lesson.id);
    const chapter = getChapterForTrackLesson(activeTrack, lesson);
    const chLessons = trackLessons.filter((l) => isLessonInChapter(l, chapter));
    const chDoneCount = chLessons.filter((l) => completedLessons[l.id]).length;
    const isChapterCleared =
      chLessons.length > 0 && chDoneCount === chLessons.length;
    const chapterBonusKey = `${activeTrack}_ch_${chapter.id}`;
    const isChapterClaimed = Boolean(claimedChapters[chapterBonusKey]);

    const stars = getLessonStarRating(
      lesson,
      completedLessons,
      completedChallenges,
      peekedSolutions,
    );
    const stageProg = getLessonStageProgress(
      lesson,
      completedLessons,
      completedChallenges,
    );
    const diffStyle = getDifficultyColor(lesson.difficulty);
    const shortSummary = getShortLessonSummary(lesson);
    return {
      lesson,
      isDone,
      isLocked,
      isFreePreview,
      isNextUp,
      isReviewDue,
      chapter,
      chDoneCount,
      chTotalCount: chLessons.length,
      isChapterCleared,
      chapterBonusKey,
      isChapterClaimed,
      stars,
      stageProg,
      diffStyle,
      shortSummary,
    };
  }, [
    selectedNode,
    completedLessons,
    isPremium,
    nextUpLesson?.id,
    dueReviewIdSet,
    activeTrack,
    trackLessons,
    claimedChapters,
    completedChallenges,
    peekedSolutions,
  ]);

  const solvedCount = trackLessons.filter((l) => completedLessons[l.id]).length;
  const pct = trackLessons.length
    ? Math.round((solvedCount / trackLessons.length) * 100)
    : 0;

  return (
    <View
      testID="roadmap-astral-chart"
      accessibilityLabel={`Interactive Astral Star Chart for ${trackLabel}`}
      style={[
        styles.observatoryFrame,
        {
          height: observatoryHeight,
          borderColor: astralPalette.cardBorder,
        },
        isPhone && styles.observatoryFramePhone,
      ]}
    >
      {Platform.OS === "web" ? (
        <View ref={hostRef} style={StyleSheet.absoluteFill} />
      ) : (
        /* Native iOS/Android Cozy Constellation Fallback */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nativeConstellationRow}
          style={{ backgroundColor: astralPalette.skyMid }}
        >
          {graph.nodes.map((node) => {
            const isDone = Boolean(completedLessons[node.id]);
            const isSelected = resolvedSelectedId === node.id;
            return (
              <Pressable
                key={node.id}
                style={[
                  styles.nativeStarPill,
                  isDone && { borderColor: astralPalette.accent },
                  isSelected && {
                    backgroundColor: astralPalette.cardBg,
                    borderColor: astralPalette.accentGold,
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  setSelectedId(node.id);
                  setInspectorOpen(true);
                }}
              >
                <Text style={styles.nativeStarNum}>
                  {isDone
                    ? "★"
                    : String(node.lesson.lesson_order).padStart(2, "0")}
                </Text>
                <Text style={styles.nativeStarTitle} numberOfLines={2}>
                  {node.lesson.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Top-Left Observatory Telemetry & Compact Legend Pill */}
      <View pointerEvents="none" style={styles.topLeftHud}>
        <View style={styles.hudBadgeRow}>
          <View
            style={[
              styles.hudLiveDot,
              { backgroundColor: astralPalette.accent },
            ]}
          />
          <Text style={[styles.hudKicker, { color: astralPalette.accent }]}>
            ASTRAL STAR CHART · {solvedCount}/{trackLessons.length} ({pct}%)
          </Text>
        </View>
        {!isPhone ? (
          <View style={styles.hudLegendRow}>
            <View style={styles.hudLegendItem}>
              <View
                style={[
                  styles.hudLegendDot,
                  { backgroundColor: StudioColors.yellow },
                ]}
              />
              <Text style={styles.hudLegendText}>UP NEXT</Text>
            </View>
            <View style={styles.hudLegendItem}>
              <View
                style={[
                  styles.hudLegendDot,
                  { backgroundColor: astralPalette.accent },
                ]}
              />
              <Text style={styles.hudLegendText}>SOLVED</Text>
            </View>
            <View style={styles.hudLegendItem}>
              <View
                style={[
                  styles.hudLegendDot,
                  { backgroundColor: StudioColors.pink },
                ]}
              />
              <Text style={styles.hudLegendText}>PRO</Text>
            </View>
            <Text style={styles.hudSubSep}>· Drag sky or hover to trace</Text>
          </View>
        ) : null}
      </View>

      {/* Top-Right Observatory Zoom & Glide Controls */}
      <View style={styles.topRightControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pan star chart left"
          style={styles.ctrlBtn}
          onPress={() => handlePanStep(-260)}
        >
          <Text style={styles.ctrlBtnText}>←</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pan star chart right"
          style={styles.ctrlBtn}
          onPress={() => handlePanStep(260)}
        >
          <Text style={styles.ctrlBtnText}>→</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out star chart"
          style={styles.ctrlBtn}
          onPress={() => handleAdjustZoom(-0.15)}
        >
          <Text style={styles.ctrlBtnText}>−</Text>
        </Pressable>
        <View style={styles.zoomReadout}>
          <Text style={styles.zoomReadoutText}>{zoomDisplay}%</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in star chart"
          style={styles.ctrlBtn}
          onPress={() => handleAdjustZoom(0.15)}
        >
          <Text style={styles.ctrlBtnText}>+</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Center star chart on active mission"
          style={[styles.ctrlBtn, styles.ctrlCenterBtn]}
          onPress={handleRecenter}
        >
          <Text style={[styles.ctrlBtnText, { color: astralPalette.accent }]}>
            ⌖ NEXT
          </Text>
        </Pressable>
      </View>

      {/* Floating Telescope Lesson Inspector Card */}
      {selectedMeta && inspectorOpen ? (
        <View
          testID="astral-star-inspector"
          style={[
            styles.inspectorCard,
            isPhone && styles.inspectorCardPhone,
            {
              backgroundColor: astralPalette.cardBg,
              borderColor: selectedMeta.isNextUp
                ? astralPalette.accentGold
                : astralPalette.cardBorder,
            },
          ]}
        >
          <View style={styles.inspTopRow}>
            <View
              style={[
                styles.inspStatusPill,
                {
                  backgroundColor: selectedMeta.isDone
                    ? StudioColors.mint
                    : selectedMeta.isNextUp
                      ? StudioColors.lime
                      : selectedMeta.lesson.is_recap
                        ? StudioColors.yellow
                        : selectedMeta.isLocked
                          ? StudioColors.pink
                          : astralPalette.accentCyan,
                },
              ]}
            >
              <Text style={styles.inspStatusText}>
                {selectedMeta.isDone
                  ? `✓ SOLVED · ${[1, 2, 3].map((s) => (s <= selectedMeta.stars ? "★" : "☆")).join("")}`
                  : selectedMeta.lesson.is_recap
                    ? `🏆 CH. ${selectedMeta.chapter.roman} RECAP BOSS`
                    : selectedMeta.isReviewDue
                      ? "🔁 REVIEW DUE"
                      : selectedMeta.isFreePreview
                        ? "★ FREE PREVIEW"
                        : selectedMeta.isNextUp
                          ? "⚡ NEXT MISSION"
                          : selectedMeta.isLocked
                            ? "PRO MODULE"
                            : `MODULE ${String(selectedMeta.lesson.lesson_order).padStart(2, "0")}`}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close star inspector"
              style={styles.inspCloseBtn}
              onPress={() => {
                playKeyClick();
                setInspectorOpen(false);
              }}
            >
              <Text style={styles.inspCloseText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.inspChapterLabel}>
            CHAPTER {selectedMeta.chapter.roman} ·{" "}
            {selectedMeta.chapter.title.toUpperCase()} ({selectedMeta.chDoneCount}
            /{selectedMeta.chTotalCount})
          </Text>
          <Text style={styles.inspTitle} numberOfLines={2}>
            {selectedMeta.lesson.title}
          </Text>
          {selectedMeta.shortSummary ? (
            <Text style={styles.inspSummary} numberOfLines={isPhone ? 2 : 3}>
              {selectedMeta.shortSummary}
            </Text>
          ) : null}

          <View style={styles.inspMetaRow}>
            {selectedMeta.lesson.difficulty ? (
              <View
                style={[
                  styles.inspMetaChip,
                  {
                    backgroundColor: selectedMeta.diffStyle.bg,
                    borderColor: selectedMeta.diffStyle.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.inspMetaChipText,
                    { color: selectedMeta.diffStyle.text },
                  ]}
                >
                  {selectedMeta.lesson.difficulty}
                </Text>
              </View>
            ) : null}

            {selectedMeta.lesson.complexities?.time ? (
              <View style={styles.inspDarkChip}>
                <Text style={styles.inspDarkChipText}>
                  {selectedMeta.lesson.complexities.time}
                </Text>
              </View>
            ) : null}

            {selectedMeta.stageProg.totalStages > 1 ? (
              <View style={styles.inspDarkChip}>
                <Text style={styles.inspDarkChipText}>
                  🎯 {selectedMeta.stageProg.solvedStages}/
                  {selectedMeta.stageProg.totalStages}
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.inspDarkChip,
                { borderColor: astralPalette.accent },
              ]}
            >
              <Text
                style={[
                  styles.inspDarkChipText,
                  { color: astralPalette.accent },
                ]}
              >
                {selectedMeta.isDone ? "✓ 50 XP" : "+50 XP"}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Launch ${selectedMeta.lesson.title} in Code Studio`}
            style={({ pressed }) => [
              styles.inspLaunchBtn,
              {
                backgroundColor: selectedMeta.isLocked
                  ? StudioColors.pink
                  : astralPalette.accent,
              },
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onSelectLesson(selectedMeta.lesson);
            }}
          >
            <Text style={styles.inspLaunchBtnText}>
              {selectedMeta.isLocked
                ? "🔒 PREVIEW & UNLOCK PRO →"
                : selectedMeta.isDone
                  ? "↺ REPLAY IN CODE STUDIO →"
                  : "⚡ LAUNCH IN CODE STUDIO →"}
            </Text>
          </Pressable>

          {/* In-Inspector Chapter Milestone Claim / Certificate Action when Chapter Cleared */}
          {selectedMeta.isChapterCleared &&
          !selectedMeta.isChapterClaimed &&
          onClaimChapterBonus ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Claim Chapter ${selectedMeta.chapter.roman} +100 XP bonus`}
              style={styles.inspBonusBtn}
              onPress={() => {
                onClaimChapterBonus(selectedMeta.chapterBonusKey, 100);
              }}
            >
              <Text style={styles.inspBonusBtnText}>
                🎁 CLAIM CH. {selectedMeta.chapter.roman} BONUS (+100 XP) →
              </Text>
            </Pressable>
          ) : selectedMeta.isChapterCleared && onOpenChapterCertificate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View Chapter ${selectedMeta.chapter.roman} certificate`}
              style={styles.inspCertBtn}
              onPress={() => {
                playKeyClick();
                onOpenChapterCertificate(activeTrack, selectedMeta.chapter);
              }}
            >
              <Text style={styles.inspCertBtnText}>
                🎓 VIEW CH. {selectedMeta.chapter.roman} CERTIFICATE ↗
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Bottom Constellation Chapter Quick-Jump Dock */}
      <View style={styles.chapterDockWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chapterDockRow}
        >
          {graph.clusters.map((cluster) => {
            const done = cluster.lessonIds.filter(
              (id) => completedLessons[id],
            ).length;
            const total = cluster.lessonIds.length;
            const cleared = total > 0 && done === total;
            const bonusKey = `${activeTrack}_ch_${cluster.chapter.id}`;
            const hasUnclaimedBonus = cleared && !claimedChapters[bonusKey];
            const isActive = activeJumpChapter === cluster.chapter.id;
            return (
              <Pressable
                key={cluster.chapter.id}
                accessibilityRole="button"
                accessibilityLabel={`Jump star chart to Chapter ${cluster.chapter.roman}: ${cluster.chapter.title}`}
                style={[
                  styles.dockPill,
                  isActive && {
                    backgroundColor: astralPalette.accent,
                    borderColor: StudioColors.ink,
                  },
                  cleared &&
                    !isActive && {
                      borderColor: astralPalette.accentGold,
                    },
                ]}
                onPress={() => {
                  playKeyClick();
                  setActiveJumpChapter(cluster.chapter.id);
                  glideToPoint(cluster.cx, cluster.cy, false);
                  const firstInCh =
                    graph.nodes.find(
                      (n) =>
                        n.chapterId === cluster.chapter.id &&
                        !completedLessons[n.id],
                    ) ||
                    graph.nodes.find((n) => n.chapterId === cluster.chapter.id);
                  if (firstInCh) {
                    setSelectedId(firstInCh.id);
                    setInspectorOpen(true);
                    spawnStardustBurst(
                      firstInCh.x,
                      firstInCh.y,
                      astralPalette.accentGold,
                      16,
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.dockPillText,
                    isActive && { color: StudioColors.ink },
                    cleared && !isActive && { color: astralPalette.accentGold },
                  ]}
                >
                  CH. {cluster.chapter.roman} ({done}/{total}
                  {hasUnclaimedBonus ? " 🎁" : cleared ? " ★" : ""})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (_colors: StudioThemeColors) =>
  StyleSheet.create({
    observatoryFrame: {
      width: "100%",
      borderRadius: 20,
      borderWidth: 2,
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#070A14",
      ...HardShadow,
    },
    observatoryFramePhone: {
      borderRadius: 14,
    },
    topLeftHud: {
      position: "absolute",
      top: 14,
      left: 14,
      backgroundColor: "rgba(9, 13, 24, 0.82)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.14)",
      borderRadius: 11,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 4,
      maxWidth: "60%",
    },
    hudBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    hudLiveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    hudKicker: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    hudLegendRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 9,
    },
    hudLegendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    hudLegendDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    hudLegendText: {
      color: "rgba(226, 232, 240, 0.8)",
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "800",
    },
    hudSubSep: {
      color: "rgba(148, 163, 184, 0.78)",
      fontSize: 10,
      fontWeight: "600",
    },
    topRightControls: {
      position: "absolute",
      top: 14,
      right: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(9, 13, 24, 0.85)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.14)",
      borderRadius: 10,
      padding: 4,
    },
    ctrlBtn: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    ctrlCenterBtn: {
      paddingHorizontal: 10,
    },
    ctrlBtnText: {
      color: "#F8FAFC",
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
    zoomReadout: {
      paddingHorizontal: 5,
    },
    zoomReadoutText: {
      color: "rgba(203, 213, 225, 0.8)",
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "800",
    },
    inspectorCard: {
      position: "absolute",
      right: 16,
      top: 66,
      width: 308,
      borderRadius: 14,
      borderWidth: 2,
      padding: 15,
      gap: 7,
      ...HardShadow,
    },
    inspectorCardPhone: {
      top: undefined,
      bottom: 60,
      left: 10,
      right: 10,
      width: undefined,
      padding: 12,
    },
    inspTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    inspStatusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    inspStatusText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    inspCloseBtn: {
      width: 24,
      height: 24,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.09)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.16)",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    inspCloseText: {
      color: "#E2E8F0",
      fontSize: 11,
      fontWeight: "900",
    },
    inspChapterLabel: {
      color: "rgba(203, 213, 225, 0.68)",
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.7,
    },
    inspTitle: {
      color: "#FFFFFF",
      fontSize: 16.5,
      fontWeight: "900",
      lineHeight: 21,
    },
    inspSummary: {
      color: "rgba(226, 232, 240, 0.82)",
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500",
    },
    inspMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
      marginTop: 2,
    },
    inspMetaChip: {
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 6,
      borderWidth: 1,
    },
    inspMetaChipText: {
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "900",
    },
    inspDarkChip: {
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.18)",
      backgroundColor: "rgba(255, 255, 255, 0.06)",
    },
    inspDarkChipText: {
      color: "#E2E8F0",
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "800",
    },
    inspLaunchBtn: {
      marginTop: 4,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    inspLaunchBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    inspBonusBtn: {
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.yellow,
      paddingVertical: 7,
      paddingHorizontal: 10,
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    inspBonusBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    inspCertBtn: {
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.violet,
      paddingVertical: 7,
      paddingHorizontal: 10,
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    inspCertBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    chapterDockWrap: {
      position: "absolute",
      bottom: 14,
      left: 14,
      right: 14,
      alignItems: "center",
    },
    chapterDockRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 6,
      backgroundColor: "rgba(9, 13, 24, 0.86)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.14)",
      borderRadius: 11,
    },
    dockPill: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.16)",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    dockPillText: {
      color: "#E2E8F0",
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "800",
    },
    nativeConstellationRow: {
      padding: 20,
      paddingTop: 68,
      paddingBottom: 70,
      gap: 12,
      alignItems: "center",
    },
    nativeStarPill: {
      width: 132,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.2)",
      backgroundColor: "rgba(15, 23, 42, 0.78)",
      alignItems: "center",
      gap: 6,
    },
    nativeStarNum: {
      color: StudioColors.yellow,
      fontFamily: MonoFont,
      fontSize: 14,
      fontWeight: "900",
    },
    nativeStarTitle: {
      color: "#F8FAFC",
      fontSize: 11.5,
      fontWeight: "800",
      textAlign: "center",
    },
  });
