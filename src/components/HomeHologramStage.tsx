import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  HardShadow,
  MonoFont,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  createIdleDisperseState,
  getHologramShapeData,
  getHologramShapeMeta,
  HOLOGRAM_PALETTES,
  HOLOGRAM_PARTICLE_COUNT,
  stepIdleDisperseState,
  type HologramShapeData,
  type HologramShapeId,
  type IdleDisperseState,
} from "../utils/hologramShapes";
import { StudioIcon, Text } from "./StudioIcon";

interface HomeHologramStageProps {
  activeShape: HologramShapeId;
  compact?: boolean;
}

const VS_SOURCE = `
  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute float aLumA;
  attribute float aLumB;
  attribute float aAccA;
  attribute float aAccB;
  attribute float aSeed;

  uniform float uMorph;
  uniform float uDisperse;
  uniform float uTime;
  uniform float uRotX;
  uniform float uRotY;
  uniform float uAspect;
  uniform float uPointScale;

  varying float vLum;
  varying float vAcc;
  varying float vDepth;
  varying float vPulse;

  void main() {
    float t = uMorph * uMorph * (3.0 - 2.0 * uMorph);
    vec3 pos = mix(aPosA, aPosB, t);
    float swirl = sin(t * 3.1415926) * 0.42;
    float ca = cos(swirl * (aSeed * 2.0 - 1.0));
    float sa = sin(swirl * (aSeed * 2.0 - 1.0));
    pos.xz = mat2(ca, -sa, sa, ca) * pos.xz;
    pos.y += 0.011 * sin(uTime * 1.5 + aSeed * 6.283);

    float disperseBoost = 0.0;
    if (uDisperse > 0.0005) {
      float radialDist = length(pos);
      float stagger = clamp(aSeed * 0.28 + (1.0 - clamp(radialDist, 0.0, 1.0)) * 0.14, 0.0, 0.42);
      float localSpread = clamp((uDisperse - stagger * 0.35) / (1.0 - stagger * 0.35), 0.0, 1.0);
      localSpread = localSpread * localSpread * (3.0 - 2.0 * localSpread);

      float theta = aSeed * 62.831853 + pos.y * 2.1;
      float zCos = fract(aSeed * 19.371) * 1.98 - 0.99;
      float sinPhi = sqrt(max(0.0, 1.0 - zCos * zCos));
      vec3 randDir = vec3(
        sinPhi * cos(theta),
        zCos * 0.78,
        sinPhi * sin(theta)
      );

      vec3 outwardDir = radialDist > 0.002 ? (pos / radialDist) : randDir;
      vec3 driftDir = normalize(mix(outwardDir, randDir, 0.58));
      float spreadRadius = (0.42 + 0.88 * fract(aSeed * 7.13)) * localSpread;

      float vortexAngle = localSpread * (1.15 + 1.35 * aSeed) * (aSeed > 0.5 ? 1.0 : -1.0);
      float vc = cos(vortexAngle);
      float vs = sin(vortexAngle);

      vec3 curlDrift = vec3(
        sin(uTime * 1.9 + aSeed * 18.0 + pos.y * 3.0),
        cos(uTime * 1.6 + aSeed * 23.0 + pos.x * 3.0) * 0.75,
        sin(uTime * 1.7 + aSeed * 15.0 + pos.z * 3.0)
      ) * (0.11 * localSpread);

      pos += driftDir * spreadRadius + curlDrift;
      pos.xz = mat2(vc, -vs, vs, vc) * pos.xz;
      disperseBoost = localSpread;
    }

    float cy = cos(uRotY), sy = sin(uRotY);
    float cx = cos(uRotX), sx = sin(uRotX);
    vec3 p1 = vec3(pos.x * cy - pos.z * sy, pos.y, pos.x * sy + pos.z * cy);
    vec3 p2 = vec3(p1.x, p1.y * cx - p1.z * sx, p1.y * sx + p1.z * cx);

    float camZ = 2.52;
    float zDist = max(0.95, camZ - p2.z);
    float fov = 2.02 * min(1.0, uAspect);
    vec2 proj = vec2((p2.x * fov) / (zDist * uAspect), (p2.y * fov) / zDist);
    gl_Position = vec4(proj, (p2.z / 3.0) * -0.5, 1.0);

    float depthNorm = clamp((p2.z + 1.15) / 2.3, 0.0, 1.0);
    float wave = 0.5 + 0.5 * sin(pos.x * 3.8 + pos.y * 3.2 + pos.z * 3.0 - uTime * 2.4 + aSeed * 1.4);
    float twinkle = 0.5 + 0.5 * sin(uTime * 7.5 + aSeed * 41.0);
    vPulse = clamp(pow(wave, 5.5) + disperseBoost * (0.32 + 0.42 * twinkle), 0.0, 1.15);
    vLum = mix(aLumA, aLumB, t);
    vAcc = mix(aAccA, aAccB, t);
    vDepth = depthNorm;

    float baseSize = mix(1.35, 3.05, depthNorm) * (0.74 + vLum * 0.48 + vPulse * 0.34 + vAcc * 0.16) * mix(1.0, 1.16, disperseBoost);
    gl_PointSize = baseSize * uPointScale;
  }
`;

const FS_SOURCE = `
  precision mediump float;
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorBright;
  uniform vec3 uColorAccent;

  varying float vLum;
  varying float vAcc;
  varying float vDepth;
  varying float vPulse;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d);
    if (r > 0.5) discard;

    float core = smoothstep(0.5, 0.07, r);
    float lit = clamp(vLum * (0.38 + 0.74 * vDepth) + vPulse * 0.32, 0.0, 1.0);

    vec3 primaryCol = mix(uColorDeep, uColorMid, smoothstep(0.08, 0.66, lit));
    primaryCol = mix(primaryCol, uColorBright, smoothstep(0.65, 1.0, lit));

    vec3 accentCol = mix(uColorAccent * 0.55, uColorAccent, smoothstep(0.15, 0.85, lit));
    accentCol = mix(accentCol, vec3(1.0, 0.99, 0.94), smoothstep(0.82, 1.0, lit));

    vec3 finalCol = mix(primaryCol, accentCol, clamp(vAcc, 0.0, 1.0));
    float alpha = core * (0.24 + 0.76 * vDepth) * (0.45 + 0.55 * lit);
    gl_FragColor = vec4(finalCol * alpha, alpha);
  }
`;

interface FloatingGlyph {
  x: number;
  y: number;
  z: number;
  speedY: number;
  phase: number;
  char: string;
  size: number;
}

function createFloatingGlyphs(): FloatingGlyph[] {
  const tokens = ["0", "1", "0", "1", "def", "λ", "{}", "=>"];
  let s = 8080;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 52 }, () => ({
    x: (rand() * 2 - 1) * 1.15,
    y: (rand() * 2 - 1) * 0.92,
    z: rand(),
    speedY: 0.012 + rand() * 0.024,
    phase: rand() * Math.PI * 2,
    char: tokens[Math.floor(rand() * tokens.length)],
    size: 9 + Math.floor(rand() * 3),
  }));
}

export default function HomeHologramStage({
  activeShape,
  compact = false,
}: HomeHologramStageProps) {
  const { paletteId } = useTheme();
  const styles = useThemedStyles(createStyles);
  const hostRef = useRef<any>(null);

  const shapeMeta = getHologramShapeMeta(activeShape);
  const pal = HOLOGRAM_PALETTES[paletteId] || HOLOGRAM_PALETTES.arcade;

  const engineRef = useRef<{
    currentShape: HologramShapeId;
    targetShape: HologramShapeId;
    morphProgress: number;
    paletteId: typeof paletteId;
    rotY: number;
    rotX: number;
    velY: number;
    velX: number;
    idleDisperse: IdleDisperseState;
    uploadPair?: (from: HologramShapeData, to: HologramShapeData) => void;
  }>({
    currentShape: activeShape,
    targetShape: activeShape,
    morphProgress: 1,
    paletteId,
    rotY: -0.46,
    rotX: 0.24,
    velY: 0,
    velX: 0,
    idleDisperse: createIdleDisperseState(),
  });

  useEffect(() => {
    engineRef.current.paletteId = paletteId;
  }, [paletteId]);

  useEffect(() => {
    const state = engineRef.current;
    if (activeShape === state.targetShape) return;
    state.currentShape = state.targetShape;
    state.targetShape = activeShape;
    state.morphProgress = 0;
    state.idleDisperse.idleElapsedSec = 0;
    if (state.uploadPair) {
      state.uploadPair(
        getHologramShapeData(state.currentShape),
        getHologramShapeData(state.targetShape),
      );
    }
  }, [activeShape]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const hostEl = hostRef.current as HTMLElement | null;
    if (!hostEl) return;

    const glCanvas = document.createElement("canvas");
    const glyphCanvas = document.createElement("canvas");
    const baseStyle =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    glCanvas.setAttribute("style", `${baseStyle}cursor:grab;touch-action:none;`);
    glyphCanvas.setAttribute("style", `${baseStyle}pointer-events:none;`);
    hostEl.appendChild(glCanvas);
    hostEl.appendChild(glyphCanvas);

    const glyphCtx = glyphCanvas.getContext("2d");
    const gl = glCanvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    const fallback2D = gl ? null : glCanvas.getContext("2d");
    const floatingGlyphs = createFloatingGlyphs();

    let glProgram: WebGLProgram | null = null;
    let bufPosA: WebGLBuffer | null = null;
    let bufPosB: WebGLBuffer | null = null;
    let bufLumA: WebGLBuffer | null = null;
    let bufLumB: WebGLBuffer | null = null;
    let bufAccA: WebGLBuffer | null = null;
    let bufAccB: WebGLBuffer | null = null;
    let bufSeed: WebGLBuffer | null = null;
    let uLocs: Record<string, WebGLUniformLocation | null> = {};

    const bindAttr = (
      buf: WebGLBuffer | null,
      name: string,
      data: Float32Array,
      size: number,
    ) => {
      if (!gl || !glProgram || !buf) return;
      const loc = gl.getAttribLocation(glProgram, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    const uploadPair = (fromData: HologramShapeData, toData: HologramShapeData) => {
      bindAttr(bufPosA, "aPosA", fromData.positions, 3);
      bindAttr(bufPosB, "aPosB", toData.positions, 3);
      bindAttr(bufLumA, "aLumA", fromData.luminance, 1);
      bindAttr(bufLumB, "aLumB", toData.luminance, 1);
      bindAttr(bufAccA, "aAccA", fromData.accentMix, 1);
      bindAttr(bufAccB, "aAccB", toData.accentMix, 1);
    };

    if (gl) {
      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type);
        if (!sh) return null;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        return sh;
      };
      const vs = compile(gl.VERTEX_SHADER, VS_SOURCE);
      const fs = compile(gl.FRAGMENT_SHADER, FS_SOURCE);
      glProgram = gl.createProgram();
      if (glProgram && vs && fs) {
        gl.attachShader(glProgram, vs);
        gl.attachShader(glProgram, fs);
        gl.linkProgram(glProgram);
        gl.useProgram(glProgram);

        bufPosA = gl.createBuffer();
        bufPosB = gl.createBuffer();
        bufLumA = gl.createBuffer();
        bufLumB = gl.createBuffer();
        bufAccA = gl.createBuffer();
        bufAccB = gl.createBuffer();
        bufSeed = gl.createBuffer();

        const seedArr = new Float32Array(HOLOGRAM_PARTICLE_COUNT);
        let seedState = 42;
        for (let k = 0; k < HOLOGRAM_PARTICLE_COUNT; k += 1) {
          seedState = (seedState + 0x6d2b79f5) >>> 0;
          let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          seedArr[k] = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, bufSeed);
        gl.bufferData(gl.ARRAY_BUFFER, seedArr, gl.STATIC_DRAW);
        const seedLoc = gl.getAttribLocation(glProgram, "aSeed");
        if (seedLoc >= 0) {
          gl.enableVertexAttribArray(seedLoc);
          gl.vertexAttribPointer(seedLoc, 1, gl.FLOAT, false, 0, 0);
        }

        uLocs = {
          uMorph: gl.getUniformLocation(glProgram, "uMorph"),
          uDisperse: gl.getUniformLocation(glProgram, "uDisperse"),
          uTime: gl.getUniformLocation(glProgram, "uTime"),
          uRotX: gl.getUniformLocation(glProgram, "uRotX"),
          uRotY: gl.getUniformLocation(glProgram, "uRotY"),
          uAspect: gl.getUniformLocation(glProgram, "uAspect"),
          uPointScale: gl.getUniformLocation(glProgram, "uPointScale"),
          uColorDeep: gl.getUniformLocation(glProgram, "uColorDeep"),
          uColorMid: gl.getUniformLocation(glProgram, "uColorMid"),
          uColorBright: gl.getUniformLocation(glProgram, "uColorBright"),
          uColorAccent: gl.getUniformLocation(glProgram, "uColorAccent"),
        };

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);

        const initData = getHologramShapeData(engineRef.current.targetShape);
        uploadPair(initData, initData);
      }
    }

    engineRef.current.uploadPair = uploadPair;

    // Pointer drag-to-spin physics
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      glCanvas.style.cursor = "grabbing";
      try {
        glCanvas.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      engineRef.current.velY = dx * 0.0095;
      engineRef.current.velX = dy * 0.0075;
      engineRef.current.rotY += engineRef.current.velY;
      engineRef.current.rotX = Math.max(
        -1.05,
        Math.min(1.05, engineRef.current.rotX + engineRef.current.velX),
      );
    };
    const onPointerUp = () => {
      isDragging = false;
      glCanvas.style.cursor = "grab";
    };

    glCanvas.addEventListener("pointerdown", onPointerDown);
    glCanvas.addEventListener("pointermove", onPointerMove);
    glCanvas.addEventListener("pointerup", onPointerUp);
    glCanvas.addEventListener("pointercancel", onPointerUp);

    let stageW = 680;
    let stageH = 440;
    let dpr = 1;
    const syncSize = () => {
      const rect = hostEl.getBoundingClientRect();
      stageW = Math.max(220, rect.width || 680);
      stageH = Math.max(240, rect.height || 440);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      glCanvas.width = Math.round(stageW * dpr);
      glCanvas.height = Math.round(stageH * dpr);
      glyphCanvas.width = Math.round(stageW * dpr);
      glyphCanvas.height = Math.round(stageH * dpr);
      if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    };
    syncSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(hostEl);
    } else {
      window.addEventListener("resize", syncSize);
    }

    let rafId = 0;
    let lastTs = performance.now();
    const renderLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const tSec = now * 0.001;
      const st = engineRef.current;

      if (st.morphProgress < 1) {
        st.morphProgress = Math.min(1, st.morphProgress + dt * 1.45);
      }
      const disperseAmount = stepIdleDisperseState(
        st.idleDisperse,
        dt,
        isDragging || st.morphProgress < 0.99,
      );
      if (!isDragging) {
        st.rotY += st.velY + dt * 0.32;
        st.rotX = Math.max(-1.05, Math.min(1.05, st.rotX + st.velX));
        st.rotX += (0.24 - st.rotX) * Math.min(1, dt * 1.4);
        st.velY *= 0.93;
        st.velX *= 0.92;
      }

      const activePal =
        HOLOGRAM_PALETTES[st.paletteId] || HOLOGRAM_PALETTES.arcade;

      if (gl && glProgram) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uLocs.uMorph, st.morphProgress);
        gl.uniform1f(uLocs.uDisperse, disperseAmount);
        gl.uniform1f(uLocs.uTime, tSec);
        gl.uniform1f(uLocs.uRotX, st.rotX);
        gl.uniform1f(uLocs.uRotY, st.rotY);
        gl.uniform1f(uLocs.uAspect, stageW / stageH);
        gl.uniform1f(uLocs.uPointScale, dpr * (stageH / 340) * 1.06);
        gl.uniform3fv(uLocs.uColorDeep, activePal.deep);
        gl.uniform3fv(uLocs.uColorMid, activePal.mid);
        gl.uniform3fv(uLocs.uColorBright, activePal.bright);
        gl.uniform3fv(uLocs.uColorAccent, activePal.accent);
        gl.drawArrays(gl.POINTS, 0, HOLOGRAM_PARTICLE_COUNT);
      } else if (fallback2D) {
        fallback2D.clearRect(0, 0, glCanvas.width, glCanvas.height);
        const fromData = getHologramShapeData(st.currentShape);
        const toData = getHologramShapeData(st.targetShape);
        const m = st.morphProgress * st.morphProgress * (3 - 2 * st.morphProgress);
        const cy = Math.cos(st.rotY);
        const sy = Math.sin(st.rotY);
        const cx = Math.cos(st.rotX);
        const sx = Math.sin(st.rotX);
        const halfW = glCanvas.width * 0.5;
        const halfH = glCanvas.height * 0.5;
        const scale = Math.min(glCanvas.width, glCanvas.height) * 0.8;
        for (let k = 0; k < HOLOGRAM_PARTICLE_COUNT; k += 5) {
          let x = fromData.positions[k * 3] * (1 - m) + toData.positions[k * 3] * m;
          let y = fromData.positions[k * 3 + 1] * (1 - m) + toData.positions[k * 3 + 1] * m;
          let z = fromData.positions[k * 3 + 2] * (1 - m) + toData.positions[k * 3 + 2] * m;
          if (disperseAmount > 0.001) {
            const seed = (k * 0.6180339887) % 1;
            const ang = seed * 62.83 + y * 2.1;
            const spread = (0.42 + 0.78 * ((k * 0.381966) % 1)) * disperseAmount;
            const vx = x + Math.cos(ang) * spread;
            const vz = z + Math.sin(ang) * spread;
            const swirlAng = disperseAmount * (1.1 + seed * 1.2) * (seed > 0.5 ? 1 : -1);
            const sc = Math.cos(swirlAng);
            const ss = Math.sin(swirlAng);
            x = vx * sc - vz * ss;
            z = vx * ss + vz * sc;
            y += Math.sin(seed * 19.3 + tSec * 1.6) * spread * 0.65;
          }
          const p1x = x * cy - z * sy;
          const p1z = x * sy + z * cy;
          const p2y = y * cx - p1z * sx;
          const p2z = y * sx + p1z * cx;
          const zDist = Math.max(0.95, 2.52 - p2z);
          const sx2 = halfW + (p1x / zDist) * scale;
          const sy2 = halfH - (p2y / zDist) * scale;
          const depth = Math.max(0.15, Math.min(1, (p2z + 1.1) / 2.2));
          const lum = fromData.luminance[k] * (1 - m) + toData.luminance[k] * m;
          fallback2D.fillStyle = `${activePal.glyphRgbaPrefix}${(depth * lum * 0.85).toFixed(2)})`;
          const sz = (1.1 + depth * 1.4) * dpr;
          fallback2D.fillRect(sx2, sy2, sz, sz);
        }
      }

      if (glyphCtx) {
        glyphCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        glyphCtx.clearRect(0, 0, stageW, stageH);
        glyphCtx.textAlign = "center";
        glyphCtx.textBaseline = "middle";
        for (let g = 0; g < floatingGlyphs.length; g += 1) {
          const item = floatingGlyphs[g];
          const py = (((item.y - tSec * item.speedY + 1) % 2) + 2) % 2 - 1;
          const px = item.x + Math.sin(tSec * 0.35 + item.phase) * 0.025;
          const sx = (px * 0.5 + 0.5) * stageW;
          const sy = (py * 0.5 + 0.5) * stageH;
          const distCenter = Math.hypot(
            (sx - stageW * 0.5) / (stageW * 0.34),
            (sy - stageH * 0.5) / (stageH * 0.44),
          );
          const mask = Math.min(1, Math.max(0.14, (distCenter - 0.55) * 1.1));
          const twinkle = 0.45 + 0.55 * Math.sin(tSec * 1.6 + item.phase);
          const alpha = (0.14 + item.z * 0.32) * mask * twinkle;
          glyphCtx.font = `700 ${item.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
          glyphCtx.fillStyle =
            g % 3 === 0
              ? `rgba(244, 240, 230, ${(alpha * 0.85).toFixed(3)})`
              : `${activePal.glyphRgbaPrefix}${alpha.toFixed(3)})`;
          glyphCtx.fillText(item.char, sx, sy);
        }
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(rafId);
      glCanvas.removeEventListener("pointerdown", onPointerDown);
      glCanvas.removeEventListener("pointermove", onPointerMove);
      glCanvas.removeEventListener("pointerup", onPointerUp);
      glCanvas.removeEventListener("pointercancel", onPointerUp);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", syncSize);
      }
      if (glCanvas.parentNode === hostEl) hostEl.removeChild(glCanvas);
      if (glyphCanvas.parentNode === hostEl) hostEl.removeChild(glyphCanvas);
    };
  }, []);

  return (
    <View
      testID="home-hologram-stage"
      accessibilityLabel={`3D hologram: ${shapeMeta.title}`}
      style={styles.frame}
    >
      {/* Recessed Dark Obsidian 3D Hologram Viewport */}
      <View
        style={[
          styles.viewport,
          compact && styles.viewportCompact,
          { backgroundColor: pal.bgFallbackHex },
          Platform.OS === "web"
            ? ({ backgroundImage: pal.bgGradientCss } as any)
            : null,
        ]}
      >
        {Platform.OS === "web" ? (
          <View ref={hostRef} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.nativeFallback}>
            <View
              style={[
                styles.nativeEmblemCircle,
                { borderColor: pal.dotHex },
              ]}
            >
              <StudioIcon name="devlearn_logo" size={64} />
            </View>
            <Text style={styles.nativeFallbackTitle}>{shapeMeta.title}</Text>
            <Text style={styles.nativeFallbackSub}>{shapeMeta.subtitle}</Text>
          </View>
        )}

        {/* Bottom Subtle Drag Hint */}
        {Platform.OS === "web" && (
          <View pointerEvents="none" style={styles.bottomHintHud}>
            <Text style={styles.bottomHintText}>
              DRAG TO ROTATE 360° · HOVER PORTALS TO MORPH
            </Text>
          </View>
        )}
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
    nativeEmblemCircle: {
      width: 104,
      height: 104,
      borderRadius: 52,
      borderWidth: 2.5,
      backgroundColor: "rgba(18, 22, 32, 0.85)",
      alignItems: "center",
      justifyContent: "center",
    },
    nativeFallbackTitle: {
      color: "#F4F0E6",
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
      textAlign: "center",
    },
    nativeFallbackSub: {
      color: "#B9B5AC",
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
    },
    bottomHintHud: {
      position: "absolute",
      bottom: 8,
      left: 10,
      right: 10,
      alignItems: "center",
    },
    bottomHintText: {
      color: "rgba(244, 240, 230, 0.55)",
      fontSize: 9,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
  });
