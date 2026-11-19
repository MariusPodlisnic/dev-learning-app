import {
  isNativeMobilePlatform,
  startNativeLofi,
  stopNativeLofi,
} from "./nativeFeedback";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export type LofiChannelId = "chillhop" | "rain" | "synth";

export interface LofiChannelMeta {
  id: LofiChannelId;
  label: string;
  shortLabel: string;
  chipLabel: string;
  subtitle: string;
  bpm: number;
  accentColor: string;
}

export interface LofiRadioState {
  isPlaying: boolean;
  channel: LofiChannelId;
}

export const STORAGE_LOFI_CHANNEL_KEY = "devlearn_lofi_channel_v1";

export const LOFI_CHANNELS: readonly LofiChannelMeta[] = [
  {
    id: "chillhop",
    label: "BYTE-OS CHILLHOP",
    shortLabel: "CHILLHOP",
    chipLabel: "🎹 CHILLHOP",
    subtitle: "72 BPM · WARM RHODES",
    bpm: 72,
    accentColor: "#6EE7B7",
  },
  {
    id: "rain",
    label: "COZY RAIN · FLOW",
    shortLabel: "RAIN FLOW",
    chipLabel: "🌧 RAIN",
    subtitle: "SOFT RAIN · PIANO",
    bpm: 64,
    accentColor: "#38BDF8",
  },
  {
    id: "synth",
    label: "MIDNIGHT SYNTH",
    shortLabel: "MIDNIGHT",
    chipLabel: "🌙 SYNTH",
    subtitle: "68 BPM · ANALOG PAD",
    bpm: 68,
    accentColor: "#C084FC",
  },
] as const;

const CHILLHOP_CHORDS: readonly (readonly number[])[] = [
  [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9
  [164.81, 196.0, 246.94, 293.66, 392.0], // Em7
  [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
  [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9
];

const SYNTH_CHORDS: readonly (readonly number[])[] = [
  [220.0, 261.63, 329.63, 392.0, 493.88], // Am9
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [130.81, 196.0, 246.94, 329.63], // Cmaj7
  [196.0, 246.94, 293.66, 329.63], // G6
];

const RAIN_DROPLET_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

function isValidChannel(value: unknown): value is LofiChannelId {
  return value === "chillhop" || value === "rain" || value === "synth";
}

let isPlaying = false;
let currentChannel: LofiChannelId = (() => {
  const saved = readLocalJson<string>(STORAGE_LOFI_CHANNEL_KEY, "chillhop");
  return isValidChannel(saved) ? saved : "chillhop";
})();

const listeners = new Set<(state: LofiRadioState) => void>();

// Web Audio runtime nodes (browser only)
let webCtx: any = null;
let masterGain: any = null;
let noiseSource: any = null;
let noiseFilter: any = null;
let noiseGain: any = null;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let stepIndex = 0;

function getState(): LofiRadioState {
  return {
    isPlaying,
    channel: currentChannel,
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

export function getLofiChannelMeta(
  id: LofiChannelId = currentChannel,
): LofiChannelMeta {
  return LOFI_CHANNELS.find((c) => c.id === id) || LOFI_CHANNELS[0];
}

export function isLofiPlaying(): boolean {
  return isPlaying;
}

export function getLofiChannel(): LofiChannelId {
  return currentChannel;
}

export function getLofiRadioState(): LofiRadioState {
  return getState();
}

export async function hydrateLofiChannelPreference(): Promise<LofiChannelId> {
  const saved = await readLocalJsonAsync<string>(
    STORAGE_LOFI_CHANNEL_KEY,
    currentChannel,
  );
  if (isValidChannel(saved) && saved !== currentChannel) {
    currentChannel = saved;
    notifyListeners();
  }
  return currentChannel;
}

export function subscribeLofiRadio(
  listener: (state: LofiRadioState) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function ensureWebAudioGraph(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!webCtx) {
      webCtx = new AudioCtx();
      masterGain = webCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, webCtx.currentTime);
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

function createNoiseBuffer(ctx: any, seconds: number = 3): any {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Warm pink-ish noise (filtered white noise) for cozy vinyl / rain bed
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + white * 0.029;
    b1 = 0.985 * b1 + white * 0.032;
    b2 = 0.95 * b2 + white * 0.048;
    data[i] = (b0 + b1 + b2 + white * 0.015) * 0.45;
  }
  return buffer;
}

function startAmbientNoiseBed(ctx: any, channel: LofiChannelId): void {
  stopAmbientNoiseBed();
  try {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, 3);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = channel === "rain" ? "bandpass" : "lowpass";
    filter.frequency.setValueAtTime(
      channel === "rain" ? 780 : 620,
      ctx.currentTime,
    );
    filter.Q.setValueAtTime(channel === "rain" ? 0.55 : 0.7, ctx.currentTime);

    const gain = ctx.createGain();
    const targetLevel =
      channel === "rain" ? 0.055 : channel === "chillhop" ? 0.014 : 0.009;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(targetLevel, ctx.currentTime + 0.6);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();

    noiseSource = src;
    noiseFilter = filter;
    noiseGain = gain;
  } catch {
    // Ignore noise bed errors on restricted audio contexts
  }
}

function stopAmbientNoiseBed(): void {
  try {
    if (noiseSource) {
      noiseSource.stop();
      noiseSource.disconnect();
    }
  } catch {}
  try {
    noiseFilter?.disconnect();
    noiseGain?.disconnect();
  } catch {}
  noiseSource = null;
  noiseFilter = null;
  noiseGain = null;
}

function triggerWarmChord(
  ctx: any,
  freqs: readonly number[],
  durationSec: number,
  options: {
    strumSec?: number;
    cutoffHz?: number;
    peakGain?: number;
    attackSec?: number;
  } = {},
): void {
  if (!masterGain) return;
  const {
    strumSec = 0.038,
    cutoffHz = 920,
    peakGain = 0.036,
    attackSec = 0.07,
  } = options;
  const now = ctx.currentTime;

  freqs.forEach((freq, idx) => {
    try {
      const start = now + idx * strumSec;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, start);
      if (idx > 0) {
        // Subtle lo-fi analog warmth detune
        osc.detune?.setValueAtTime(idx % 2 === 0 ? 3.5 : -3.5, start);
      }

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoffHz, start);
      filter.Q.setValueAtTime(0.65, start);

      const noteGain = idx === 0 ? peakGain * 1.25 : peakGain * 0.78;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(noteGain, start + attackSec);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(start);
      osc.stop(start + durationSec + 0.04);
    } catch {}
  });
}

function triggerSoftKick(ctx: any, delaySec: number = 0): void {
  if (!masterGain) return;
  try {
    const start = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(92, start);
    osc.frequency.exponentialRampToValueAtTime(42, start + 0.14);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + 0.24);
  } catch {}
}

function triggerSoftBrush(ctx: any, delaySec: number = 0): void {
  if (!masterGain) return;
  try {
    const start = ctx.currentTime + delaySec;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, 0.15);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1950, start);
    filter.Q.setValueAtTime(1.1, start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.022, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(start);
    src.stop(start + 0.13);
  } catch {}
}

function triggerBellNote(
  ctx: any,
  freq: number,
  delaySec: number,
  durationSec: number = 1.4,
  peakGain: number = 0.022,
): void {
  if (!masterGain) return;
  try {
    const start = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + durationSec + 0.03);
  } catch {}
}

function playScheduledBar(ctx: any, channel: LofiChannelId, bar: number): void {
  const meta = getLofiChannelMeta(channel);
  const beatSec = 60 / meta.bpm;
  const barSec = beatSec * 4;

  if (channel === "chillhop") {
    const chord = CHILLHOP_CHORDS[bar % CHILLHOP_CHORDS.length];
    triggerWarmChord(ctx, chord, barSec * 0.96, {
      strumSec: 0.038,
      cutoffHz: 940,
      peakGain: 0.04,
      attackSec: 0.06,
    });
    // Relaxed chillhop boom-bap pulse
    triggerSoftKick(ctx, 0);
    triggerSoftBrush(ctx, beatSec);
    triggerSoftKick(ctx, beatSec * 2.5);
    triggerSoftBrush(ctx, beatSec * 3);
    // Occasional gentle top Rhodes bell on beat 3.5
    const topNote = chord[chord.length - 1] * 2;
    triggerBellNote(ctx, topNote, beatSec * 2.0, 1.35, 0.018);
  } else if (channel === "rain") {
    // Cozy Rain: spacious warm chord every 2nd bar + delicate piano droplets
    if (bar % 2 === 0) {
      const chord = CHILLHOP_CHORDS[(bar / 2) % CHILLHOP_CHORDS.length];
      triggerWarmChord(ctx, chord.slice(0, 4), barSec * 1.45, {
        strumSec: 0.075,
        cutoffHz: 780,
        peakGain: 0.025,
        attackSec: 0.14,
      });
    }
    const n1 = RAIN_DROPLET_NOTES[(bar * 3) % RAIN_DROPLET_NOTES.length];
    const n2 = RAIN_DROPLET_NOTES[(bar * 3 + 2) % RAIN_DROPLET_NOTES.length];
    triggerBellNote(ctx, n1, beatSec * 0.6, 1.6, 0.02);
    triggerBellNote(ctx, n2, beatSec * 2.4, 1.8, 0.016);
  } else {
    // Midnight Synth: dreamy analog pad + gentle arpeggio shimmer
    const chord = SYNTH_CHORDS[bar % SYNTH_CHORDS.length];
    triggerWarmChord(ctx, chord, barSec * 1.05, {
      strumSec: 0.055,
      cutoffHz: 760,
      peakGain: 0.034,
      attackSec: 0.24,
    });
    chord.forEach((freq, idx) => {
      triggerBellNote(
        ctx,
        freq * 2,
        beatSec * (0.5 + idx * 0.75),
        1.15,
        0.014,
      );
    });
  }
}

function startWebLofiLoop(channel: LofiChannelId): void {
  stopWebLofiLoop(false);
  const ctx = ensureWebAudioGraph();
  if (!ctx || !masterGain) return;

  try {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(
      Math.max(0.0001, masterGain.gain.value || 0.0001),
      ctx.currentTime,
    );
    masterGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.45);
  } catch {}

  startAmbientNoiseBed(ctx, channel);
  stepIndex = 0;
  playScheduledBar(ctx, channel, stepIndex);
  stepIndex += 1;

  const meta = getLofiChannelMeta(channel);
  const barMs = Math.round((60 / meta.bpm) * 4 * 1000);
  schedulerTimer = setInterval(() => {
    if (!isPlaying || !webCtx) return;
    playScheduledBar(webCtx, currentChannel, stepIndex);
    stepIndex += 1;
  }, barMs);
}

function stopWebLofiLoop(fadeOut: boolean = true): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  stopAmbientNoiseBed();
  if (webCtx && masterGain && fadeOut) {
    try {
      masterGain.gain.cancelScheduledValues(webCtx.currentTime);
      masterGain.gain.setValueAtTime(
        Math.max(0.0001, masterGain.gain.value || 0.0001),
        webCtx.currentTime,
      );
      masterGain.gain.linearRampToValueAtTime(0.0001, webCtx.currentTime + 0.22);
    } catch {}
  }
}

export function startLofiRadio(): boolean {
  if (isPlaying) return true;
  isPlaying = true;
  if (isNativeMobilePlatform()) {
    startNativeLofi();
  } else {
    startWebLofiLoop(currentChannel);
  }
  notifyListeners();
  return true;
}

export function stopLofiRadio(): void {
  if (!isPlaying) return;
  isPlaying = false;
  if (isNativeMobilePlatform()) {
    stopNativeLofi();
  } else {
    stopWebLofiLoop(true);
  }
  notifyListeners();
}

export function toggleLofiRadio(): boolean {
  if (isPlaying) {
    stopLofiRadio();
    return false;
  }
  return startLofiRadio();
}

export function setLofiChannel(nextChannel: LofiChannelId): LofiChannelId {
  if (!isValidChannel(nextChannel)) return currentChannel;
  currentChannel = nextChannel;
  writeLocalJson(STORAGE_LOFI_CHANNEL_KEY, nextChannel);
  if (isPlaying && !isNativeMobilePlatform()) {
    startWebLofiLoop(nextChannel);
  }
  notifyListeners();
  return currentChannel;
}

export function cycleLofiChannel(): LofiChannelId {
  const idx = LOFI_CHANNELS.findIndex((c) => c.id === currentChannel);
  const next = LOFI_CHANNELS[(idx + 1) % LOFI_CHANNELS.length].id;
  return setLofiChannel(next);
}

export function selectAndPlayLofiChannel(nextChannel: LofiChannelId): boolean {
  if (!isValidChannel(nextChannel)) return isPlaying;
  if (currentChannel === nextChannel && isPlaying) {
    return true;
  }
  currentChannel = nextChannel;
  writeLocalJson(STORAGE_LOFI_CHANNEL_KEY, nextChannel);
  if (!isPlaying) {
    isPlaying = true;
    if (isNativeMobilePlatform()) {
      startNativeLofi();
    } else {
      startWebLofiLoop(nextChannel);
    }
  } else if (!isNativeMobilePlatform()) {
    startWebLofiLoop(nextChannel);
  }
  notifyListeners();
  return true;
}
