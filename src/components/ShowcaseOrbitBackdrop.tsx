import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  createIdleDisperseState,
  getHologramShapeData,
  HOLOGRAM_PARTICLE_COUNT,
  stepIdleDisperseState,
  type HologramShapeData,
  type HologramShapeId,
  type IdleDisperseState,
} from "../utils/hologramShapes";

interface ShowcaseOrbitBackdropProps {
  activeShape: HologramShapeId;
  isWarping: boolean;
}

const LOFI_ORBIT_PALETTE = {
  deep: [0.28, 0.16, 0.54] as [number, number, number],
  mid: [0.96, 0.54, 0.84] as [number, number, number],
  bright: [1.0, 0.94, 0.98] as [number, number, number],
  accent: [1.0, 0.87, 0.35] as [number, number, number],
  bgGradientCss:
    "radial-gradient(ellipse 82% 58% at 50% 76%, rgba(255, 144, 232, 0.24) 0%, transparent 56%), radial-gradient(ellipse 72% 56% at 50% 34%, rgba(99, 102, 241, 0.34) 0%, rgba(20, 12, 44, 0.92) 58%, #090616 100%)",
};

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
  uniform float uWarp;
  uniform float uTime;
  uniform float uRotX;
  uniform float uRotY;
  uniform float uAspect;
  uniform float uPointScale;
  uniform vec2 uOffset;

  varying float vLum;
  varying float vAcc;
  varying float vDepth;
  varying float vPulse;
  varying float vCenterDim;

  void main() {
    float t = uMorph * uMorph * (3.0 - 2.0 * uMorph);
    vec3 pos = mix(aPosA, aPosB, t);

    float swirl = sin(t * 3.1415926) * 0.45;
    float ca = cos(swirl * (aSeed * 2.0 - 1.0));
    float sa = sin(swirl * (aSeed * 2.0 - 1.0));
    pos.xz = mat2(ca, -sa, sa, ca) * pos.xz;
    pos.y += 0.012 * sin(uTime * 1.4 + aSeed * 6.283);

    float spreadAmt = max(uDisperse, uWarp);
    if (spreadAmt > 0.001) {
      float radialDist = length(pos);
      float theta = aSeed * 62.831853 + pos.y * 2.1;
      float phi = acos(clamp(fract(aSeed * 19.371) * 2.0 - 1.0, -0.999, 0.999));
      vec3 randDir = vec3(sin(phi) * cos(theta), cos(phi) * 0.8, sin(phi) * sin(theta));
      vec3 outwardDir = radialDist > 0.002 ? (pos / radialDist) : randDir;
      vec3 driftDir = normalize(mix(outwardDir, randDir, 0.55));
      float r = (0.45 + 0.95 * fract(aSeed * 7.13)) * spreadAmt + uWarp * 2.4;
      float va = spreadAmt * (1.2 + aSeed * 1.3) * (aSeed > 0.5 ? 1.0 : -1.0);
      pos += driftDir * r;
      pos.xz = mat2(cos(va), -sin(va), sin(va), cos(va)) * pos.xz;
      pos.z += uWarp * (2.1 * aSeed);
    }

    float cy = cos(uRotY), sy = sin(uRotY);
    float cx = cos(uRotX), sx = sin(uRotX);
    vec3 p1 = vec3(pos.x * cy - pos.z * sy, pos.y, pos.x * sy + pos.z * cy);
    vec3 p2 = vec3(p1.x, p1.y * cx - p1.z * sx, p1.y * sx + p1.z * cx);

    float camZ = 2.62;
    float zDist = max(0.85, camZ - p2.z);
    float fov = 2.04 * min(1.0, uAspect);
    vec2 proj = vec2((p2.x * fov) / (zDist * uAspect), (p2.y * fov) / zDist) + uOffset;
    gl_Position = vec4(proj, (p2.z / 3.0) * -0.5, 1.0);

    float depthNorm = clamp((p2.z + 1.15) / 2.3, 0.0, 1.0);
    float wave = 0.5 + 0.5 * sin(pos.x * 3.5 + pos.y * 3.0 - uTime * 2.2 + aSeed * 1.6);
    float twinkle = 0.5 + 0.5 * sin(uTime * 7.2 + aSeed * 41.0);
    vPulse = clamp(pow(wave, 5.0) + spreadAmt * (0.38 + 0.42 * twinkle), 0.0, 1.15);
    vLum = mix(aLumA, aLumB, t);
    vAcc = mix(aAccA, aAccB, t);
    vDepth = depthNorm;

    float centerDist = length(vec2(proj.x * 1.1, proj.y * 1.45));
    vCenterDim = mix(0.88, 1.0, smoothstep(0.16, 0.65, centerDist));

    gl_PointSize = mix(1.4, 3.25, depthNorm) * (0.74 + vLum * 0.46 + vPulse * 0.34) * uPointScale;
  }
`;

const FS_SOURCE = `
  precision mediump float;
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uBright;
  uniform vec3 uAccent;

  varying float vLum;
  varying float vAcc;
  varying float vDepth;
  varying float vPulse;
  varying float vCenterDim;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.08, r);
    float lit = clamp(vLum * (0.38 + 0.72 * vDepth) + vPulse * 0.32, 0.0, 1.0);

    vec3 primaryCol = mix(uDeep, uMid, smoothstep(0.08, 0.65, lit));
    primaryCol = mix(primaryCol, uBright, smoothstep(0.66, 1.0, lit));

    vec3 accentCol = mix(uAccent * 0.58, uAccent, smoothstep(0.15, 0.85, lit));
    accentCol = mix(accentCol, vec3(1.0, 0.98, 0.92), smoothstep(0.84, 1.0, lit));

    vec3 finalCol = mix(primaryCol, accentCol, clamp(vAcc, 0.0, 1.0));
    float alpha = core * (0.20 + 0.72 * vDepth) * (0.40 + 0.56 * lit) * vCenterDim;
    gl_FragColor = vec4(finalCol * alpha, alpha);
  }
`;

function makeDeterministicRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface FloatingShard {
  x: number;
  y: number;
  depth: number;
  size: number;
  rot: number;
  rotSpeed: number;
  kind: number;
  phase: number;
}

interface StarDot {
  x: number;
  y: number;
  r: number;
  phase: number;
  glyph: string | null;
}

function drawRoundedRectPath(
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

export default function ShowcaseOrbitBackdrop({
  activeShape,
  isWarping,
}: ShowcaseOrbitBackdropProps) {
  const hostRef = useRef<any>(null);

  const engineRef = useRef<{
    currentShape: HologramShapeId;
    targetShape: HologramShapeId;
    morph: number;
    rotY: number;
    rotX: number;
    mouseX: number;
    mouseY: number;
    smoothMouseX: number;
    smoothMouseY: number;
    idleDisperse: IdleDisperseState;
    warping: boolean;
    warpAmt: number;
    uploadPair?: (fromData: HologramShapeData, toData: HologramShapeData) => void;
  }>({
    currentShape: activeShape,
    targetShape: activeShape,
    morph: 1,
    rotY: -0.34,
    rotX: 0.2,
    mouseX: 0,
    mouseY: 0,
    smoothMouseX: 0,
    smoothMouseY: 0,
    idleDisperse: createIdleDisperseState(),
    warping: isWarping,
    warpAmt: 0,
  });

  useEffect(() => {
    engineRef.current.warping = isWarping;
  }, [isWarping]);

  useEffect(() => {
    const st = engineRef.current;
    if (activeShape === st.targetShape) return;
    st.currentShape = st.targetShape;
    st.targetShape = activeShape;
    st.morph = 0;
    st.idleDisperse.idleElapsedSec = 0;
    if (st.uploadPair) {
      st.uploadPair(
        getHologramShapeData(st.currentShape),
        getHologramShapeData(st.targetShape),
      );
    }
  }, [activeShape]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const hostEl = hostRef.current as HTMLElement | null;
    if (!hostEl) return;

    const glCanvas = document.createElement("canvas");
    const artCanvas = document.createElement("canvas");
    const canvasStyle =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    glCanvas.setAttribute("style", canvasStyle);
    artCanvas.setAttribute("style", canvasStyle);
    hostEl.appendChild(artCanvas);
    hostEl.appendChild(glCanvas);

    const artCtx = artCanvas.getContext("2d");
    const gl = glCanvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    let prog: WebGLProgram | null = null;
    const bufs: Record<string, WebGLBuffer | null> = {};
    const locs: Record<string, WebGLUniformLocation | null> = {};

    const bindAttr = (name: string, arr: Float32Array, size: number) => {
      if (!gl || !prog || !bufs[name]) return;
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, bufs[name]);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    const uploadPair = (
      fromData: HologramShapeData,
      toData: HologramShapeData,
    ) => {
      bindAttr("aPosA", fromData.positions, 3);
      bindAttr("aPosB", toData.positions, 3);
      bindAttr("aLumA", fromData.luminance, 1);
      bindAttr("aLumB", toData.luminance, 1);
      bindAttr("aAccA", fromData.accentMix, 1);
      bindAttr("aAccB", toData.accentMix, 1);
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
      prog = gl.createProgram();
      if (prog && vs && fs) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        for (const key of [
          "aPosA",
          "aPosB",
          "aLumA",
          "aLumB",
          "aAccA",
          "aAccB",
          "aSeed",
        ]) {
          bufs[key] = gl.createBuffer();
        }

        const seedArr = new Float32Array(HOLOGRAM_PARTICLE_COUNT);
        const seedRng = makeDeterministicRng(777);
        for (let i = 0; i < HOLOGRAM_PARTICLE_COUNT; i += 1) {
          seedArr[i] = seedRng();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.aSeed);
        gl.bufferData(gl.ARRAY_BUFFER, seedArr, gl.STATIC_DRAW);
        const seedLoc = gl.getAttribLocation(prog, "aSeed");
        if (seedLoc >= 0) {
          gl.enableVertexAttribArray(seedLoc);
          gl.vertexAttribPointer(seedLoc, 1, gl.FLOAT, false, 0, 0);
        }

        for (const uniformName of [
          "uMorph",
          "uDisperse",
          "uWarp",
          "uTime",
          "uRotX",
          "uRotY",
          "uAspect",
          "uPointScale",
          "uOffset",
          "uDeep",
          "uMid",
          "uBright",
          "uAccent",
        ]) {
          locs[uniformName] = gl.getUniformLocation(prog, uniformName);
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);

        const initialData = getHologramShapeData(engineRef.current.targetShape);
        uploadPair(initialData, initialData);
      }
    }

    engineRef.current.uploadPair = uploadPair;

    // Deterministic cel-shaded Lo-Fi Arcade Orbit artifacts + subtle code glyphs
    const artRng = makeDeterministicRng(9001);
    const shards: FloatingShard[] = Array.from({ length: 18 }, (_, idx) => ({
      x: artRng() * 1.08 - 0.04,
      y: artRng() * 1.04 - 0.02,
      depth: 0.35 + artRng() * 0.9,
      size: 16 + artRng() * 32,
      rot: artRng() * Math.PI * 2,
      rotSpeed: (artRng() - 0.5) * 0.42,
      kind: idx % 5,
      phase: artRng() * Math.PI * 2,
    }));
    const glyphTokens = ["0", "1", "λ", "{}", "def", "=>"];
    const stars: StarDot[] = Array.from({ length: 105 }, () => ({
      x: artRng(),
      y: artRng(),
      r: 0.7 + artRng() * 1.6,
      phase: artRng() * Math.PI * 2,
      glyph:
        artRng() < 0.22
          ? glyphTokens[Math.floor(artRng() * glyphTokens.length)]
          : null,
    }));

    let vw = window.innerWidth || 1280;
    let vh = window.innerHeight || 800;
    let dpr = 1;

    const syncSize = () => {
      const rect = hostEl.getBoundingClientRect();
      vw = Math.max(320, rect.width || window.innerWidth || 1280);
      vh = Math.max(320, rect.height || window.innerHeight || 800);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      glCanvas.width = Math.round(vw * dpr);
      glCanvas.height = Math.round(vh * dpr);
      artCanvas.width = Math.round(vw * dpr);
      artCanvas.height = Math.round(vh * dpr);
      if (artCtx) artCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    };
    syncSize();

    const onPointerMove = (e: PointerEvent) => {
      engineRef.current.mouseX = (e.clientX / Math.max(1, vw)) * 2 - 1;
      engineRef.current.mouseY = (e.clientY / Math.max(1, vh)) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", syncSize);

    let rafId = 0;
    let lastTs = performance.now();

    const renderLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const tSec = now * 0.001;
      const st = engineRef.current;

      st.smoothMouseX += (st.mouseX - st.smoothMouseX) * Math.min(1, dt * 4.5);
      st.smoothMouseY += (st.mouseY - st.smoothMouseY) * Math.min(1, dt * 4.5);

      if (st.morph < 1) {
        st.morph = Math.min(1, st.morph + dt * 1.45);
      }
      st.rotY += dt * (st.warping ? 2.6 : 0.25);
      const targetRotX = 0.2 + st.smoothMouseY * 0.14;
      st.rotX += (targetRotX - st.rotX) * Math.min(1, dt * 4);

      const disperseAmt = stepIdleDisperseState(
        st.idleDisperse,
        dt,
        st.morph < 0.99 || st.warping,
      );
      st.warpAmt += ((st.warping ? 1 : 0) - st.warpAmt) * Math.min(1, dt * 6);

      if (artCtx) {
        artCtx.clearRect(0, 0, vw, vh);
        const mx = st.smoothMouseX;
        const my = st.smoothMouseY;

        // 1. Stars + subtle floating code glyphs
        for (let i = 0; i < stars.length; i += 1) {
          const s = stars[i];
          const px = (((s.x * vw - mx * 16 * s.r) % vw) + vw) % vw;
          const py =
            (((s.y * vh - my * 11 * s.r - tSec * 3.8 * s.r) % vh) + vh) % vh;
          const tw = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(tSec * 1.8 + s.phase));
          if (s.glyph) {
            artCtx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
            artCtx.fillStyle = `rgba(255, 222, 89, ${(tw * 0.3).toFixed(2)})`;
            artCtx.fillText(s.glyph, px, py);
          } else {
            artCtx.fillStyle = `rgba(255, 255, 255, ${(tw * 0.4).toFixed(2)})`;
            artCtx.beginPath();
            artCtx.arc(px, py, s.r, 0, Math.PI * 2);
            artCtx.fill();
          }
        }

        // 2. Curved twilight horizon ridge
        artCtx.save();
        const horizonY = vh * 0.96 - my * 16;
        const hGrad = artCtx.createLinearGradient(0, vh * 0.72, 0, vh);
        hGrad.addColorStop(0, "rgba(255, 144, 232, 0.32)");
        hGrad.addColorStop(0.32, "rgba(67, 34, 118, 0.74)");
        hGrad.addColorStop(1, "rgba(11, 7, 24, 0.96)");
        artCtx.fillStyle = hGrad;
        artCtx.strokeStyle = "rgba(255, 222, 89, 0.52)";
        artCtx.lineWidth = 2.2;
        artCtx.beginPath();
        artCtx.moveTo(-40, vh + 40);
        artCtx.quadraticCurveTo(
          vw * 0.28 - mx * 28,
          horizonY - vh * 0.23,
          vw * 0.65 - mx * 18,
          horizonY + vh * 0.04,
        );
        artCtx.quadraticCurveTo(
          vw * 0.86,
          horizonY - vh * 0.14,
          vw + 40,
          horizonY + 10,
        );
        artCtx.lineTo(vw + 40, vh + 40);
        artCtx.closePath();
        artCtx.fill();
        artCtx.stroke();
        artCtx.restore();

        // 3. Cel-shaded neo-brutalist floating artifacts around the outer perimeter
        for (let i = 0; i < shards.length; i += 1) {
          const sh = shards[i];
          const distCenter = Math.hypot((sh.x - 0.5) * 1.38, sh.y - 0.45);
          if (distCenter < 0.37) continue;

          const x = sh.x * vw - mx * 40 * sh.depth;
          const y =
            sh.y * vh -
            my * 28 * sh.depth +
            Math.sin(tSec * 1.1 + sh.phase) * 8 * sh.depth;
          const rot = sh.rot + tSec * sh.rotSpeed;
          const sz = sh.size * (0.68 + sh.depth * 0.42);

          artCtx.save();
          artCtx.translate(x, y);
          artCtx.rotate(rot);
          artCtx.lineWidth = 2.2;
          artCtx.strokeStyle = "#090714";

          if (sh.kind === 0) {
            // Golden cel-shaded polyhedron
            artCtx.fillStyle = "#FFDE59";
            artCtx.beginPath();
            for (let k = 0; k < 6; k += 1) {
              const a = (k / 6) * Math.PI * 2;
              const px = Math.cos(a) * sz * 0.58;
              const py = Math.sin(a) * sz * 0.58;
              if (k === 0) artCtx.moveTo(px, py);
              else artCtx.lineTo(px, py);
            }
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();
            artCtx.strokeStyle = "rgba(9, 7, 20, 0.42)";
            artCtx.beginPath();
            artCtx.moveTo(0, 0);
            artCtx.lineTo(sz * 0.58, 0);
            artCtx.moveTo(0, 0);
            artCtx.lineTo(-sz * 0.29, sz * 0.5);
            artCtx.moveTo(0, 0);
            artCtx.lineTo(-sz * 0.29, -sz * 0.5);
            artCtx.stroke();
          } else if (sh.kind === 1) {
            // Sakura mechanical keycap
            const bw = sz * 0.84;
            const bh = sz * 0.74;
            artCtx.fillStyle = "#FF90E8";
            drawRoundedRectPath(artCtx, -bw / 2, -bh / 2, bw, bh, 6);
            artCtx.fill();
            artCtx.stroke();
            artCtx.fillStyle = "rgba(255, 255, 255, 0.34)";
            drawRoundedRectPath(
              artCtx,
              -bw * 0.34,
              -bh * 0.36,
              bw * 0.68,
              bh * 0.56,
              4,
            );
            artCtx.fill();
          } else if (sh.kind === 2) {
            // Sky cyan crystal shard
            artCtx.fillStyle = "#38BDF8";
            artCtx.beginPath();
            artCtx.moveTo(-sz * 0.54, -sz * 0.14);
            artCtx.lineTo(sz * 0.54, -sz * 0.22);
            artCtx.lineTo(sz * 0.6, sz * 0.14);
            artCtx.lineTo(-sz * 0.48, sz * 0.22);
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();
          } else if (sh.kind === 3) {
            // Deep obsidian cosmic rock
            artCtx.fillStyle = "#18122E";
            artCtx.beginPath();
            for (let k = 0; k < 7; k += 1) {
              const a = (k / 7) * Math.PI * 2;
              const rr = sz * (0.45 + ((k * 37) % 10) * 0.03);
              const px = Math.cos(a) * rr;
              const py = Math.sin(a) * rr;
              if (k === 0) artCtx.moveTo(px, py);
              else artCtx.lineTo(px, py);
            }
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();
          } else {
            // Neon lime floppy / micro-chip block
            artCtx.fillStyle = "#B8FF3B";
            drawRoundedRectPath(
              artCtx,
              -sz * 0.42,
              -sz * 0.42,
              sz * 0.84,
              sz * 0.84,
              5,
            );
            artCtx.fill();
            artCtx.stroke();
            artCtx.fillStyle = "#0B0818";
            artCtx.fillRect(-sz * 0.2, -sz * 0.42, sz * 0.4, sz * 0.25);
          }

          artCtx.restore();
        }
      }

      if (gl && prog) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(locs.uMorph, st.morph);
        gl.uniform1f(locs.uDisperse, disperseAmt);
        gl.uniform1f(locs.uWarp, st.warpAmt);
        gl.uniform1f(locs.uTime, tSec);
        gl.uniform1f(locs.uRotX, st.rotX);
        gl.uniform1f(locs.uRotY, st.rotY + st.smoothMouseX * 0.34);
        gl.uniform1f(locs.uAspect, vw / Math.max(1, vh));
        gl.uniform1f(locs.uPointScale, dpr * (vh / 460));
        gl.uniform2f(
          locs.uOffset,
          -st.smoothMouseX * 0.05,
          0.03 + st.smoothMouseY * 0.035,
        );
        gl.uniform3fv(locs.uDeep, LOFI_ORBIT_PALETTE.deep);
        gl.uniform3fv(locs.uMid, LOFI_ORBIT_PALETTE.mid);
        gl.uniform3fv(locs.uBright, LOFI_ORBIT_PALETTE.bright);
        gl.uniform3fv(locs.uAccent, LOFI_ORBIT_PALETTE.accent);
        gl.drawArrays(gl.POINTS, 0, HOLOGRAM_PARTICLE_COUNT);
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", syncSize);
      if (glCanvas.parentNode === hostEl) hostEl.removeChild(glCanvas);
      if (artCanvas.parentNode === hostEl) hostEl.removeChild(artCanvas);
    };
  }, []);

  return (
    <View
      pointerEvents="none"
      testID="showcase-orbit-backdrop"
      style={[
        styles.backdrop,
        Platform.OS === "web"
          ? ({
              position: "fixed",
              backgroundImage: LOFI_ORBIT_PALETTE.bgGradientCss,
            } as any)
          : null,
      ]}
    >
      {Platform.OS === "web" ? (
        <View ref={hostRef} style={StyleSheet.absoluteFill} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#0D0820",
    zIndex: 0,
  },
});
