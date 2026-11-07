const STORAGE_SOUND_KEY = "devlearn_sound_enabled_v1";

let soundEnabled = true;
let audioCtx: any = null;

if (typeof window !== "undefined" && window.localStorage) {
  try {
    const raw = window.localStorage.getItem(STORAGE_SOUND_KEY);
    if (raw !== null) {
      soundEnabled = JSON.parse(raw) !== false;
    }
  } catch (_e) {}
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
  } catch (_e) {
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
    } catch (_e) {}
  }
  if (next) {
    playKeyClick();
  }
}

function playTone(
  freq: number,
  durationSec: number,
  type: "sine" | "triangle" | "square" = "triangle",
  delaySec = 0,
  peakGain = 0.06,
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.01);
  } catch (_e) {}
}

/**
 * Subtle tactile mechanical keycap click (18ms)
 */
export function playKeyClick() {
  playTone(520, 0.022, "triangle", 0, 0.04);
}

/**
 * Cheerful 2-note 8-bit coin chime for quiz/blitz hits
 */
export function playSuccessChime() {
  playTone(587.33, 0.075, "triangle", 0, 0.07); // D5
  playTone(880, 0.14, "triangle", 0.065, 0.08); // A5
}

/**
 * 4-note Neo-Brutalist arcade victory fanfare when a module is mastered
 */
export function playVictoryFanfare() {
  playTone(523.25, 0.09, "triangle", 0, 0.08); // C5
  playTone(659.25, 0.09, "triangle", 0.08, 0.08); // E5
  playTone(783.99, 0.09, "triangle", 0.16, 0.08); // G5
  playTone(1046.5, 0.24, "triangle", 0.24, 0.09); // C6
}

/**
 * Gentle low 2-note thud when an assertion or quiz option misses
 */
export function playErrorBuzz() {
  playTone(220, 0.08, "sine", 0, 0.06);
  playTone(165, 0.14, "sine", 0.07, 0.06);
}

/**
 * Retro CRT channel switch blip
 */
export function playCrtChannelSwitch() {
  playTone(340, 0.03, "square", 0, 0.035);
  playTone(680, 0.045, "triangle", 0.028, 0.045);
}
