const STORAGE_SOUND_KEY = "devlearn_sound_enabled_v1";

let soundEnabled = true;
let audioCtx: any = null;
let lastClickTimestamp = 0;
let calmStepIndex = 0;

/**
 * Soothing C-Major9 / G-Pentatonic root frequencies (Hz)
 * Cycles gently on consecutive clicks so interactions feel musical, calm, and never robotic.
 */
const CALM_PENTATONIC_ROOTS = [
  392.0, // G4 (Warm, grounded)
  440.0, // A4 (Gentle lift)
  493.88, // B4 (Open, hopeful)
  523.25, // C5 (Clear, comforting resolution)
  440.0, // A4 (Soft return)
];

if (typeof window !== "undefined" && window.localStorage) {
  try {
    const raw = window.localStorage.getItem(STORAGE_SOUND_KEY);
    if (raw !== null) {
      soundEnabled = JSON.parse(raw) !== false;
    }
  } catch {}
}

function getAudioContext(): any | null {
  if (!soundEnabled || typeof window === "undefined") return null;
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(next: boolean): void {
  soundEnabled = next;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_SOUND_KEY, JSON.stringify(next));
    } catch {}
  }
  if (next) {
    playKeyClick();
  }
}

/**
 * Warm low-pass filtered voice generator (Kalimba / Rhodes / Lo-Fi Marimba texture).
 * Eliminates harsh digital overtones for a cozy, calm acoustic feel.
 */
function playWarmVoice(options: {
  freq: number;
  endFreq?: number;
  durationSec: number;
  type?: "sine" | "triangle";
  delaySec?: number;
  peakGain?: number;
  attackSec?: number;
  filterCutoffHz?: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const {
      freq,
      endFreq,
      durationSec,
      type = "sine",
      delaySec = 0,
      peakGain = 0.04,
      attackSec = 0.008,
      filterCutoffHz = 1350,
    } = options;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq && endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(
        endFreq,
        now + Math.min(durationSec * 0.45, 0.035),
      );
    }

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterCutoffHz, now);
    filter.Q.setValueAtTime(0.7, now);

    // Smooth pillowy envelope: zero pop on attack, natural acoustic decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + attackSec);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.015);
  } catch {}
}

/**
 * Comfy, motivational, and calm UI click sound.
 * Combines a soft wooden marimba/kalimba cushion with a gentle ascending
 * major-3rd / perfect-5th harmonic bloom that subtly rewards every click.
 */
export function playKeyClick() {
  const nowMs = Date.now();
  if (nowMs - lastClickTimestamp < 42) {
    return;
  }
  lastClickTimestamp = nowMs;

  const rootFreq =
    CALM_PENTATONIC_ROOTS[calmStepIndex % CALM_PENTATONIC_ROOTS.length];
  calmStepIndex = (calmStepIndex + 1) % CALM_PENTATONIC_ROOTS.length;

  // 1. Warm tactile cushion (soft rounded low-mid body with gentle upward glide)
  playWarmVoice({
    freq: rootFreq * 0.96,
    endFreq: rootFreq,
    durationSec: 0.095,
    type: "sine",
    delaySec: 0,
    peakGain: 0.042,
    attackSec: 0.007,
    filterCutoffHz: 1100,
  });

  // 2. Motivational harmonic bloom (airy major-third/fifth shimmer 18ms later)
  playWarmVoice({
    freq: rootFreq * 1.25, // Warm major 3rd interval
    endFreq: rootFreq * 1.255,
    durationSec: 0.145,
    type: "triangle",
    delaySec: 0.018,
    peakGain: 0.024,
    attackSec: 0.012,
    filterCutoffHz: 1450,
  });
}

/**
 * Cheerful, warm 3-note uplifting kalimba chime for quiz/blitz hits
 */
export function playSuccessChime() {
  playWarmVoice({
    freq: 523.25, // C5
    durationSec: 0.14,
    type: "sine",
    delaySec: 0,
    peakGain: 0.05,
    attackSec: 0.008,
    filterCutoffHz: 1600,
  });
  playWarmVoice({
    freq: 659.25, // E5
    durationSec: 0.16,
    type: "sine",
    delaySec: 0.055,
    peakGain: 0.052,
    attackSec: 0.008,
    filterCutoffHz: 1700,
  });
  playWarmVoice({
    freq: 783.99, // G5
    durationSec: 0.24,
    type: "triangle",
    delaySec: 0.11,
    peakGain: 0.048,
    attackSec: 0.01,
    filterCutoffHz: 1850,
  });
}

/**
 * Warm C-Major9 acoustic harp/marimba victory fanfare when a module is mastered
 */
export function playVictoryFanfare() {
  playWarmVoice({
    freq: 523.25, // C5
    durationSec: 0.16,
    type: "sine",
    delaySec: 0,
    peakGain: 0.055,
    filterCutoffHz: 1700,
  });
  playWarmVoice({
    freq: 659.25, // E5
    durationSec: 0.16,
    type: "sine",
    delaySec: 0.075,
    peakGain: 0.055,
    filterCutoffHz: 1800,
  });
  playWarmVoice({
    freq: 783.99, // G5
    durationSec: 0.18,
    type: "sine",
    delaySec: 0.15,
    peakGain: 0.058,
    filterCutoffHz: 1900,
  });
  playWarmVoice({
    freq: 987.77, // B5 (Dreamy Major 7th)
    durationSec: 0.22,
    type: "triangle",
    delaySec: 0.225,
    peakGain: 0.05,
    filterCutoffHz: 2000,
  });
  playWarmVoice({
    freq: 1046.5, // C6
    durationSec: 0.36,
    type: "sine",
    delaySec: 0.3,
    peakGain: 0.062,
    filterCutoffHz: 2100,
  });
}

/**
 * Calm, non-judgmental soft wooden double-tap when an assertion or quiz option misses
 */
export function playErrorBuzz() {
  playWarmVoice({
    freq: 293.66, // D4
    durationSec: 0.1,
    type: "sine",
    delaySec: 0,
    peakGain: 0.045,
    filterCutoffHz: 800,
  });
  playWarmVoice({
    freq: 246.94, // B3
    durationSec: 0.16,
    type: "sine",
    delaySec: 0.075,
    peakGain: 0.042,
    filterCutoffHz: 750,
  });
}

/**
 * Cozy analog channel switch chime
 */
export function playCrtChannelSwitch() {
  playWarmVoice({
    freq: 440, // A4
    endFreq: 493.88,
    durationSec: 0.085,
    type: "sine",
    delaySec: 0,
    peakGain: 0.038,
    filterCutoffHz: 1250,
  });
  playWarmVoice({
    freq: 659.25, // E5
    durationSec: 0.13,
    type: "triangle",
    delaySec: 0.032,
    peakGain: 0.03,
    filterCutoffHz: 1500,
  });
}
