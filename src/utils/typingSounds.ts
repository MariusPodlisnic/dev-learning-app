import { isSoundEnabled } from "./soundEffects";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export type TypingSoundProfile = "thock" | "typewriter" | "off";

export type TypingKeyKind = "char" | "space" | "enter" | "backspace";

export interface TypingSoundProfileMeta {
  id: TypingSoundProfile;
  label: string;
  shortLabel: string;
  chipLabel: string;
  subtitle: string;
}

export const STORAGE_TYPING_SOUND_KEY = "devlearn_typing_sound_v1";

export const TYPING_SOUND_PROFILES: readonly TypingSoundProfileMeta[] = [
  {
    id: "thock",
    label: "CREAMY THOCK",
    shortLabel: "THOCK",
    chipLabel: "🎹 THOCK",
    subtitle: "Warm lubed PBT keycaps",
  },
  {
    id: "typewriter",
    label: "RETRO CLICK",
    shortLabel: "CLICK",
    chipLabel: "⌨️ CLICK",
    subtitle: "Crisp tactile switch snap",
  },
  {
    id: "off",
    label: "SILENT",
    shortLabel: "SILENT",
    chipLabel: "🔇 OFF",
    subtitle: "Mute editor keystrokes",
  },
] as const;

const IGNORED_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Dead",
  "Unidentified",
]);

export function isValidTypingSoundProfile(
  value: unknown,
): value is TypingSoundProfile {
  return value === "thock" || value === "typewriter" || value === "off";
}

export function getTypingSoundProfileMeta(
  profile: TypingSoundProfile,
): TypingSoundProfileMeta {
  return (
    TYPING_SOUND_PROFILES.find((item) => item.id === profile) ||
    TYPING_SOUND_PROFILES[0]
  );
}

/**
 * Classifies a KeyboardEvent/TextInput key name into an acoustic key type,
 * or returns null for non-typing modifier/navigation keys.
 */
export function classifyTypingKey(key?: string | null): TypingKeyKind | null {
  if (!key || IGNORED_KEYS.has(key)) return null;
  if (key === "Enter") return "enter";
  if (key === " " || key === "Spacebar") return "space";
  if (key === "Backspace" || key === "Delete") return "backspace";
  if (key === "Tab" || key.length === 1) return "char";
  return null;
}

let activeProfile: TypingSoundProfile = (() => {
  const saved = readLocalJson<string>(STORAGE_TYPING_SOUND_KEY, "thock");
  return isValidTypingSoundProfile(saved) ? saved : "thock";
})();

type TypingSoundListener = (profile: TypingSoundProfile) => void;
const listeners = new Set<TypingSoundListener>();

let typingAudioCtx: any = null;
let cachedNoiseBuffer: any = null;
let lastStrokeMs = 0;

function emitProfile(): void {
  listeners.forEach((listener) => {
    try {
      listener(activeProfile);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getTypingSoundProfile(): TypingSoundProfile {
  return activeProfile;
}

export function subscribeTypingSound(
  listener: TypingSoundListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function hydrateTypingSoundProfile(): Promise<TypingSoundProfile> {
  const saved = await readLocalJsonAsync<string>(
    STORAGE_TYPING_SOUND_KEY,
    activeProfile,
  );
  if (isValidTypingSoundProfile(saved)) {
    activeProfile = saved;
    emitProfile();
  }
  return activeProfile;
}

export function setTypingSoundProfile(
  next: TypingSoundProfile,
  options?: { playPreview?: boolean },
): TypingSoundProfile {
  if (!isValidTypingSoundProfile(next)) return activeProfile;
  activeProfile = next;
  writeLocalJson(STORAGE_TYPING_SOUND_KEY, next);
  emitProfile();
  if (options?.playPreview && next !== "off") {
    playTypingPreviewBurst(next);
  }
  return activeProfile;
}

export function cycleTypingSoundProfile(): TypingSoundProfile {
  const order: TypingSoundProfile[] = ["thock", "typewriter", "off"];
  const idx = order.indexOf(activeProfile);
  const next = order[(idx + 1) % order.length];
  return setTypingSoundProfile(next, { playPreview: next !== "off" });
}

function getTypingAudioContext(): any | null {
  if (!isSoundEnabled() || typeof window === "undefined") return null;
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!typingAudioCtx) {
      typingAudioCtx = new AudioCtx();
    }
    if (typingAudioCtx.state === "suspended") {
      typingAudioCtx.resume().catch(() => {});
    }
    return typingAudioCtx;
  } catch {
    return null;
  }
}

function getShortNoiseBuffer(ctx: any): any | null {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  try {
    const len = Math.max(128, Math.floor(ctx.sampleRate * 0.04));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      const env = Math.pow(1 - i / len, 2.2);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    cachedNoiseBuffer = buf;
    return cachedNoiseBuffer;
  } catch {
    return null;
  }
}

function synthesizeKeystroke(
  ctx: any,
  profile: Exclude<TypingSoundProfile, "off">,
  keyKind: TypingKeyKind,
  delaySec = 0,
): void {
  try {
    const now = ctx.currentTime + delaySec;
    // Natural +/- 7% pitch micro-variation so rapid typing feels organic
    const jitter = 0.93 + Math.random() * 0.14;

    if (profile === "thock") {
      // Layer 1: Warm damped PBT keycap housing thock (low-mid pitch drop)
      const baseFreq =
        keyKind === "space"
          ? 118
          : keyKind === "enter"
            ? 136
            : keyKind === "backspace"
              ? 198
              : 174;
      const bodyOsc = ctx.createOscillator();
      const bodyFilter = ctx.createBiquadFilter();
      const bodyGain = ctx.createGain();

      bodyOsc.type = "triangle";
      bodyOsc.frequency.setValueAtTime(baseFreq * 1.42 * jitter, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.62 * jitter,
        now + (keyKind === "space" ? 0.055 : 0.04),
      );

      bodyFilter.type = "lowpass";
      bodyFilter.frequency.setValueAtTime(
        keyKind === "space" ? 560 : 780,
        now,
      );
      bodyFilter.Q.setValueAtTime(1.2, now);

      const peak = keyKind === "space" || keyKind === "enter" ? 0.13 : 0.095;
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.linearRampToValueAtTime(peak, now + 0.003);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.068);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.075);

      // Layer 2: Soft tactile switch stem tap (short bandpassed noise)
      const noiseBuf = getShortNoiseBuffer(ctx);
      if (noiseBuf) {
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(
          keyKind === "space" ? 920 : 1280 * jitter,
          now,
        );
        bp.Q.setValueAtTime(1.6, now);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.0001, now);
        nGain.gain.linearRampToValueAtTime(0.045, now + 0.002);
        nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

        noise.connect(bp);
        bp.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.026);
      }
      return;
    }

    // Profile 2: Crisp Retro Click (mechanical click-jacket snap)
    const clickFreq =
      keyKind === "space"
        ? 1650
        : keyKind === "enter"
          ? 2100
          : keyKind === "backspace"
            ? 2400
            : 2750;
    const noiseBuf = getShortNoiseBuffer(ctx);
    if (noiseBuf) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(clickFreq * jitter, now);
      bp.Q.setValueAtTime(2.8, now);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.0001, now);
      nGain.gain.linearRampToValueAtTime(0.085, now + 0.0015);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.022);
    }

    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = "sine";
    snapOsc.frequency.setValueAtTime(
      (keyKind === "space" ? 280 : 410) * jitter,
      now,
    );
    snapOsc.frequency.exponentialRampToValueAtTime(110, now + 0.024);

    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.05, now + 0.002);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.032);

    // Subtle soft typewriter return ping on Enter
    if (keyKind === "enter") {
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = "sine";
      bellOsc.frequency.setValueAtTime(1568, now + 0.015);
      bellGain.gain.setValueAtTime(0.0001, now + 0.015);
      bellGain.gain.linearRampToValueAtTime(0.016, now + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start(now + 0.015);
      bellOsc.stop(now + 0.15);
    }
  } catch {
    // Ignore audio context errors
  }
}

/**
 * Plays a cozy mechanical keystroke sound when enabled, throttled to prevent
 * clipping during fast key repeats or pastes.
 */
export function playMechanicalKeystroke(
  keyKind: TypingKeyKind = "char",
  overrideProfile?: TypingSoundProfile,
): void {
  const profile = overrideProfile ?? activeProfile;
  if (profile === "off") return;

  const nowMs = Date.now();
  if (nowMs - lastStrokeMs < 24) return;
  lastStrokeMs = nowMs;

  const ctx = getTypingAudioContext();
  if (!ctx) return;
  synthesizeKeystroke(ctx, profile, keyKind, 0);
}

/** Plays a short 3-key tactile preview when choosing a typing profile in Settings. */
export function playTypingPreviewBurst(
  profile: Exclude<TypingSoundProfile, "off">,
): void {
  const ctx = getTypingAudioContext();
  if (!ctx) return;
  synthesizeKeystroke(ctx, profile, "char", 0);
  synthesizeKeystroke(ctx, profile, "char", 0.085);
  synthesizeKeystroke(ctx, profile, "space", 0.175);
}
