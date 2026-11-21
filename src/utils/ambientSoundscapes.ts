import { readLocalJson, writeLocalJson } from "./storage";

export type AmbientChannelId = "rain" | "cafe" | "fireplace" | "crt";

export interface AmbientChannelMeta {
  id: AmbientChannelId;
  label: string;
  shortLabel: string;
  icon: string;
  subtitle: string;
  accentColor: string;
  defaultVolume: number;
}

export type AmbientPresetId =
  | "rainy_night"
  | "coffee_shop"
  | "cabin_code"
  | "silent";

export interface AmbientPreset {
  id: AmbientPresetId;
  label: string;
  volumes: Record<AmbientChannelId, number>;
}

export interface AmbientMixerState {
  isPlaying: boolean;
  volumes: Record<AmbientChannelId, number>;
  activeCount: number;
  activeChannelIds: AmbientChannelId[];
}

export const STORAGE_AMBIENT_MIX_KEY = "devlearn_ambient_mix_v1";

export const AMBIENT_VOLUME_STEPS = [20, 40, 60, 80, 100] as const;

export const AMBIENT_CHANNELS: readonly AmbientChannelMeta[] = [
  {
    id: "rain",
    label: "Soft Rain",
    shortLabel: "RAIN",
    icon: "🌧️",
    subtitle: "Window raindrops",
    accentColor: "#38BDF8",
    defaultVolume: 60,
  },
  {
    id: "cafe",
    label: "Cafe Murmur",
    shortLabel: "CAFE",
    icon: "☕",
    subtitle: "Warm coffee shop",
    accentColor: "#F59E0B",
    defaultVolume: 60,
  },
  {
    id: "fireplace",
    label: "Fireplace",
    shortLabel: "FIRE",
    icon: "🔥",
    subtitle: "Cozy hearth crackle",
    accentColor: "#FB923C",
    defaultVolume: 60,
  },
  {
    id: "crt",
    label: "CRT Hum",
    shortLabel: "CRT",
    icon: "📺",
    subtitle: "Vintage studio air",
    accentColor: "#C084FC",
    defaultVolume: 40,
  },
] as const;

export const AMBIENT_PRESETS: readonly AmbientPreset[] = [
  {
    id: "rainy_night",
    label: "🌧️ Rainy Night",
    volumes: { rain: 80, cafe: 0, fireplace: 40, crt: 20 },
  },
  {
    id: "coffee_shop",
    label: "☕ Coffee Shop",
    volumes: { rain: 40, cafe: 60, fireplace: 0, crt: 0 },
  },
  {
    id: "cabin_code",
    label: "🔥 Cabin Code",
    volumes: { rain: 20, cafe: 0, fireplace: 80, crt: 20 },
  },
  {
    id: "silent",
    label: "🔇 Clear",
    volumes: { rain: 0, cafe: 0, fireplace: 0, crt: 0 },
  },
] as const;

function createEmptyVolumes(): Record<AmbientChannelId, number> {
  return { rain: 0, cafe: 0, fireplace: 0, crt: 0 };
}

function clampVolume(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function sanitizeVolumes(
  raw: Partial<Record<AmbientChannelId, unknown>> | null | undefined,
): Record<AmbientChannelId, number> {
  const base = createEmptyVolumes();
  if (!raw || typeof raw !== "object") return base;
  for (const ch of AMBIENT_CHANNELS) {
    base[ch.id] = clampVolume(raw[ch.id]);
  }
  return base;
}

let isPlaying = false;
let volumes: Record<AmbientChannelId, number> = sanitizeVolumes(
  readLocalJson<Partial<Record<AmbientChannelId, number>>>(
    STORAGE_AMBIENT_MIX_KEY,
    createEmptyVolumes(),
  ),
);

const listeners = new Set<(state: AmbientMixerState) => void>();

// Web Audio runtime nodes (browser only)
interface ChannelNodes {
  stop: () => void;
  setVolume: (vol: number) => void;
}

let webCtx: any = null;
let masterGain: any = null;
const activeNodes = new Map<AmbientChannelId, ChannelNodes>();

function computeActiveChannelIds(): AmbientChannelId[] {
  return AMBIENT_CHANNELS.filter((ch) => volumes[ch.id] > 0).map((ch) => ch.id);
}

function getState(): AmbientMixerState {
  const activeChannelIds = computeActiveChannelIds();
  return {
    isPlaying,
    volumes: { ...volumes },
    activeCount: activeChannelIds.length,
    activeChannelIds,
  };
}

function notifyListeners(): void {
  const snapshot = getState();
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Ignore subscriber errors
    }
  });
}

function persistVolumes(): void {
  writeLocalJson(STORAGE_AMBIENT_MIX_KEY, volumes);
}

function ensureWebAudioContext(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!webCtx) {
      webCtx = new AudioCtx();
      masterGain = webCtx.createGain();
      masterGain.gain.setValueAtTime(0.9, webCtx.currentTime);
      masterGain.connect(webCtx.destination);
    }
    if (webCtx.state === "suspended") {
      webCtx.resume().catch(() => {});
    }
    return webCtx;
  } catch {
    return null;
  }
}

function createPinkNoiseBuffer(ctx: any, seconds: number = 4): any {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    b3 = 0.1848 * white;
    data[i] = (b0 + b1 + b2 + b3) * 0.11;
  }
  return buffer;
}

function createBrownNoiseBuffer(ctx: any, seconds: number = 4): any {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 2.4;
  }
  return buffer;
}

function startWebChannel(
  ctx: any,
  id: AmbientChannelId,
  initialVol: number,
): ChannelNodes | null {
  if (!masterGain) return null;
  try {
    const channelGain = ctx.createGain();
    const scaleByChannel: Record<AmbientChannelId, number> = {
      rain: 0.22,
      cafe: 0.2,
      fireplace: 0.28,
      crt: 0.065,
    };
    const scale = scaleByChannel[id];
    const targetGain = (initialVol / 100) * scale;
    channelGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    channelGain.gain.linearRampToValueAtTime(
      Math.max(0.0001, targetGain),
      ctx.currentTime + 0.35,
    );
    channelGain.connect(masterGain);

    const cleanups: (() => void)[] = [];

    if (id === "rain") {
      // Soft Rain on Window: pink noise through warm bandpass + gentle droplet ticks
      const src = ctx.createBufferSource();
      src.buffer = createPinkNoiseBuffer(ctx, 4);
      src.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(920, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.45, ctx.currentTime);

      const shelf = ctx.createBiquadFilter();
      shelf.type = "lowpass";
      shelf.frequency.setValueAtTime(2400, ctx.currentTime);

      src.connect(bandpass);
      bandpass.connect(shelf);
      shelf.connect(channelGain);
      src.start();

      const dropTimer = setInterval(() => {
        if (!isPlaying || volumes.rain <= 0) return;
        try {
          const osc = ctx.createOscillator();
          const dropGain = ctx.createGain();
          const now = ctx.currentTime;
          const freq = 950 + Math.random() * 900;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.045);
          dropGain.gain.setValueAtTime(0.0001, now);
          dropGain.gain.linearRampToValueAtTime(0.025, now + 0.005);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
          osc.connect(dropGain);
          dropGain.connect(channelGain);
          osc.start(now);
          osc.stop(now + 0.06);
        } catch {}
      }, 420);

      cleanups.push(() => {
        clearInterval(dropTimer);
        try {
          src.stop();
          src.disconnect();
          bandpass.disconnect();
          shelf.disconnect();
        } catch {}
      });
    } else if (id === "cafe") {
      // Cozy Cafe Murmur: warm low-mid room tone + slow conversational LFO swell + soft cup clink
      const src = ctx.createBufferSource();
      src.buffer = createBrownNoiseBuffer(ctx, 4);
      src.loop = true;

      const lowMid = ctx.createBiquadFilter();
      lowMid.type = "bandpass";
      lowMid.frequency.setValueAtTime(340, ctx.currentTime);
      lowMid.Q.setValueAtTime(0.85, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
      lfoGain.gain.setValueAtTime(95, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(lowMid.frequency);

      src.connect(lowMid);
      lowMid.connect(channelGain);
      src.start();
      lfo.start();

      const clinkTimer = setInterval(() => {
        if (!isPlaying || volumes.cafe <= 0 || Math.random() > 0.35) return;
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const cg = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(2150 + Math.random() * 450, now);
          cg.gain.setValueAtTime(0.0001, now);
          cg.gain.linearRampToValueAtTime(0.015, now + 0.006);
          cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
          osc.connect(cg);
          cg.connect(channelGain);
          osc.start(now);
          osc.stop(now + 0.16);
        } catch {}
      }, 2400);

      cleanups.push(() => {
        clearInterval(clinkTimer);
        try {
          src.stop();
          lfo.stop();
          src.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
          lowMid.disconnect();
        } catch {}
      });
    } else if (id === "fireplace") {
      // Warm Fireplace Crackle: deep hearth rumble + organic wood crackle pops
      const src = ctx.createBufferSource();
      src.buffer = createBrownNoiseBuffer(ctx, 4);
      src.loop = true;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.setValueAtTime(175, ctx.currentTime);

      src.connect(rumbleFilter);
      rumbleFilter.connect(channelGain);
      src.start();

      const crackleBuf = createPinkNoiseBuffer(ctx, 0.06);
      const crackleTimer = setInterval(() => {
        if (!isPlaying || volumes.fireplace <= 0 || Math.random() > 0.55) return;
        try {
          const now = ctx.currentTime;
          const pop = ctx.createBufferSource();
          pop.buffer = crackleBuf;
          const hp = ctx.createBiquadFilter();
          hp.type = "bandpass";
          hp.frequency.setValueAtTime(1400 + Math.random() * 2200, now);
          hp.Q.setValueAtTime(2.0, now);
          const pg = ctx.createGain();
          const peak = 0.04 + Math.random() * 0.06;
          pg.gain.setValueAtTime(0.0001, now);
          pg.gain.linearRampToValueAtTime(peak, now + 0.003);
          pg.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
          pop.connect(hp);
          hp.connect(pg);
          pg.connect(channelGain);
          pop.start(now);
          pop.stop(now + 0.045);
        } catch {}
      }, 280);

      cleanups.push(() => {
        clearInterval(crackleTimer);
        try {
          src.stop();
          src.disconnect();
          rumbleFilter.disconnect();
        } catch {}
      });
    } else {
      // Retro CRT Hum: warm 60Hz + gentle 120Hz overtone + whisper tape air
      const osc60 = ctx.createOscillator();
      const osc120 = ctx.createOscillator();
      const humFilter = ctx.createBiquadFilter();
      const gain120 = ctx.createGain();

      osc60.type = "sine";
      osc60.frequency.setValueAtTime(60, ctx.currentTime);
      osc120.type = "triangle";
      osc120.frequency.setValueAtTime(120, ctx.currentTime);
      gain120.gain.setValueAtTime(0.32, ctx.currentTime);

      humFilter.type = "lowpass";
      humFilter.frequency.setValueAtTime(280, ctx.currentTime);

      const airSrc = ctx.createBufferSource();
      airSrc.buffer = createPinkNoiseBuffer(ctx, 3);
      airSrc.loop = true;
      const airBp = ctx.createBiquadFilter();
      airBp.type = "bandpass";
      airBp.frequency.setValueAtTime(3200, ctx.currentTime);
      airBp.Q.setValueAtTime(1.2, ctx.currentTime);
      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.18, ctx.currentTime);

      osc60.connect(humFilter);
      osc120.connect(gain120);
      gain120.connect(humFilter);
      humFilter.connect(channelGain);

      airSrc.connect(airBp);
      airBp.connect(airGain);
      airGain.connect(channelGain);

      osc60.start();
      osc120.start();
      airSrc.start();

      cleanups.push(() => {
        try {
          osc60.stop();
          osc120.stop();
          airSrc.stop();
          osc60.disconnect();
          osc120.disconnect();
          airSrc.disconnect();
          gain120.disconnect();
          humFilter.disconnect();
          airBp.disconnect();
          airGain.disconnect();
        } catch {}
      });
    }

    return {
      setVolume(vol: number) {
        try {
          const nextGain = Math.max(0.0001, (vol / 100) * scale);
          channelGain.gain.cancelScheduledValues(ctx.currentTime);
          channelGain.gain.setValueAtTime(
            Math.max(0.0001, channelGain.gain.value || 0.0001),
            ctx.currentTime,
          );
          channelGain.gain.linearRampToValueAtTime(
            nextGain,
            ctx.currentTime + 0.14,
          );
        } catch {}
      },
      stop() {
        cleanups.forEach((fn) => fn());
        try {
          channelGain.disconnect();
        } catch {}
      },
    };
  } catch {
    return null;
  }
}

function syncWebAudioNodes(): void {
  if (!isPlaying) {
    activeNodes.forEach((node) => node.stop());
    activeNodes.clear();
    return;
  }

  const ctx = ensureWebAudioContext();
  if (!ctx) return;

  for (const ch of AMBIENT_CHANNELS) {
    const vol = volumes[ch.id];
    const existing = activeNodes.get(ch.id);
    if (vol <= 0) {
      if (existing) {
        existing.stop();
        activeNodes.delete(ch.id);
      }
    } else if (existing) {
      existing.setVolume(vol);
    } else {
      const created = startWebChannel(ctx, ch.id, vol);
      if (created) {
        activeNodes.set(ch.id, created);
      }
    }
  }
}

export function getAmbientChannelMeta(
  id: AmbientChannelId,
): AmbientChannelMeta {
  return AMBIENT_CHANNELS.find((c) => c.id === id) || AMBIENT_CHANNELS[0];
}

export function getAmbientMixerState(): AmbientMixerState {
  return getState();
}

export function subscribeAmbientMixer(
  listener: (state: AmbientMixerState) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setAmbientChannelVolume(
  id: AmbientChannelId,
  rawVolume: number,
): AmbientMixerState {
  const nextVol = clampVolume(rawVolume);
  volumes = {
    ...volumes,
    [id]: nextVol,
  };
  persistVolumes();

  const hasAnyActive = computeActiveChannelIds().length > 0;
  if (nextVol > 0) {
    isPlaying = true;
  } else if (!hasAnyActive) {
    isPlaying = false;
  }

  syncWebAudioNodes();
  notifyListeners();
  return getState();
}

export function toggleAmbientChannel(id: AmbientChannelId): AmbientMixerState {
  const meta = getAmbientChannelMeta(id);
  const current = volumes[id];
  return setAmbientChannelVolume(id, current > 0 ? 0 : meta.defaultVolume);
}

export function applyAmbientPreset(presetId: AmbientPresetId): AmbientMixerState {
  const preset = AMBIENT_PRESETS.find((p) => p.id === presetId);
  if (!preset) return getState();

  volumes = { ...preset.volumes };
  persistVolumes();
  isPlaying = computeActiveChannelIds().length > 0;
  syncWebAudioNodes();
  notifyListeners();
  return getState();
}

export function startAmbientMixer(): boolean {
  const hasAnyActive = computeActiveChannelIds().length > 0;
  if (!hasAnyActive) {
    // Default to Rainy Night cozy blend if starting from an empty mix
    applyAmbientPreset("rainy_night");
    return true;
  }
  isPlaying = true;
  syncWebAudioNodes();
  notifyListeners();
  return true;
}

export function stopAmbientMixer(): void {
  if (!isPlaying) return;
  isPlaying = false;
  syncWebAudioNodes();
  notifyListeners();
}

export function toggleAmbientMixer(): boolean {
  if (isPlaying) {
    stopAmbientMixer();
    return false;
  }
  return startAmbientMixer();
}

export function resetAmbientMixerForTesting(): void {
  isPlaying = false;
  volumes = createEmptyVolumes();
  syncWebAudioNodes();
  persistVolumes();
  notifyListeners();
}
