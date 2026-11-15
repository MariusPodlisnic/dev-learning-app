export const DEFAULT_SFX_SAMPLE_RATE = 22050;

export type SynthWaveform = "sine" | "triangle" | "square" | "sawtooth";

export type SfxEffectId = "click" | "success" | "fanfare" | "error" | "channel";

export interface SynthNote {
  startSec: number;
  durationSec: number;
  frequency: number;
  endFrequency?: number;
  waveform?: SynthWaveform;
  gain?: number;
  attackSec?: number;
  decayCurve?: "exp" | "linear";
}

function sampleWave(phase: number, waveform: SynthWaveform): number {
  const frac = phase - Math.floor(phase);
  switch (waveform) {
    case "triangle":
      return 1 - 4 * Math.abs(frac - 0.5);
    case "square":
      return frac < 0.5 ? 1 : -1;
    case "sawtooth":
      return 2 * frac - 1;
    case "sine":
    default:
      return Math.sin(2 * Math.PI * frac);
  }
}

/**
 * Mixes scheduled tonal notes into mono float samples normalized to [-1, 1].
 */
export function synthesizeNotesToSamples(
  notes: readonly SynthNote[],
  totalDurationSec?: number,
  sampleRate: number = DEFAULT_SFX_SAMPLE_RATE
): Float32Array {
  const computedEndSec = notes.reduce(
    (maxEnd, note) => Math.max(maxEnd, note.startSec + note.durationSec),
    0
  );
  const durationSec = Math.max(totalDurationSec ?? computedEndSec, 0.02);
  const totalFrames = Math.max(1, Math.ceil(durationSec * sampleRate));
  const buffer = new Float32Array(totalFrames);

  for (const note of notes) {
    const startFrame = Math.max(0, Math.floor(note.startSec * sampleRate));
    const endFrame = Math.min(
      totalFrames,
      Math.ceil((note.startSec + note.durationSec) * sampleRate)
    );
    const frameCount = Math.max(1, endFrame - startFrame);
    const waveform = note.waveform ?? "sine";
    const gain = note.gain ?? 0.25;
    const attackSec = Math.min(note.attackSec ?? 0.004, note.durationSec * 0.45);
    const attackFrames = Math.max(1, Math.floor(attackSec * sampleRate));
    const startFreq = note.frequency;
    const endFreq = note.endFrequency ?? startFreq;

    let phase = 0;
    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      const freq = startFreq + (endFreq - startFreq) * progress;
      phase += freq / sampleRate;

      const attackEnv = i < attackFrames ? i / attackFrames : 1;
      const decayProgress =
        i <= attackFrames
          ? 0
          : (i - attackFrames) / Math.max(1, frameCount - attackFrames);
      const decayEnv =
        note.decayCurve === "linear"
          ? Math.max(0, 1 - decayProgress)
          : Math.exp(-4.2 * decayProgress);

      buffer[startFrame + i] +=
        sampleWave(phase, waveform) * gain * attackEnv * decayEnv;
    }
  }

  let peak = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > peak) peak = abs;
  }
  if (peak > 0.92) {
    const scale = 0.92 / peak;
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] *= scale;
    }
  }

  return buffer;
}

/**
 * Encodes mono [-1, 1] samples into a standard 16-bit PCM RIFF/WAVE binary buffer.
 */
export function encodePcm16Wav(
  samples: Float32Array,
  sampleRate: number = DEFAULT_SFX_SAMPLE_RATE
): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = samples.length * numChannels * bytesPerSample;
  const totalSize = 44 + dataSize;

  const bytes = new Uint8Array(totalSize);
  const view = new DataView(bytes.buffer);

  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      bytes[offset + i] = text.charCodeAt(i);
    }
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // AudioFormat = PCM (1)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 =
      clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767);
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return bytes;
}

export const SFX_DEFINITIONS: Record<
  SfxEffectId,
  { notes: readonly SynthNote[]; durationSec: number }
> = {
  click: {
    durationSec: 0.14,
    notes: [
      {
        startSec: 0,
        durationSec: 0.09,
        frequency: 420,
        endFrequency: 440,
        waveform: "sine",
        gain: 0.22,
        attackSec: 0.006,
      },
      {
        startSec: 0.015,
        durationSec: 0.11,
        frequency: 550,
        endFrequency: 554,
        waveform: "triangle",
        gain: 0.12,
        attackSec: 0.01,
      },
    ],
  },
  success: {
    durationSec: 0.36,
    notes: [
      {
        startSec: 0,
        durationSec: 0.14,
        frequency: 523.25,
        waveform: "sine",
        gain: 0.24,
        attackSec: 0.008,
      },
      {
        startSec: 0.055,
        durationSec: 0.16,
        frequency: 659.25,
        waveform: "sine",
        gain: 0.25,
        attackSec: 0.008,
      },
      {
        startSec: 0.11,
        durationSec: 0.24,
        frequency: 783.99,
        waveform: "triangle",
        gain: 0.24,
        attackSec: 0.01,
      },
    ],
  },
  fanfare: {
    durationSec: 0.72,
    notes: [
      {
        startSec: 0,
        durationSec: 0.16,
        frequency: 523.25,
        waveform: "sine",
        gain: 0.22,
        attackSec: 0.008,
      },
      {
        startSec: 0.075,
        durationSec: 0.18,
        frequency: 659.25,
        waveform: "sine",
        gain: 0.23,
        attackSec: 0.008,
      },
      {
        startSec: 0.15,
        durationSec: 0.22,
        frequency: 783.99,
        waveform: "triangle",
        gain: 0.24,
        attackSec: 0.009,
      },
      {
        startSec: 0.225,
        durationSec: 0.36,
        frequency: 1046.5,
        waveform: "sine",
        gain: 0.26,
        attackSec: 0.01,
      },
      {
        startSec: 0.24,
        durationSec: 0.42,
        frequency: 1174.66,
        waveform: "sine",
        gain: 0.14,
        attackSec: 0.012,
      },
    ],
  },
  error: {
    durationSec: 0.25,
    notes: [
      {
        startSec: 0,
        durationSec: 0.1,
        frequency: 293.66,
        waveform: "sine",
        gain: 0.26,
        attackSec: 0.006,
      },
      {
        startSec: 0.075,
        durationSec: 0.16,
        frequency: 246.94,
        waveform: "sine",
        gain: 0.24,
        attackSec: 0.008,
      },
    ],
  },
  channel: {
    durationSec: 0.17,
    notes: [
      {
        startSec: 0,
        durationSec: 0.085,
        frequency: 440,
        endFrequency: 493.88,
        waveform: "sine",
        gain: 0.2,
        attackSec: 0.006,
      },
      {
        startSec: 0.032,
        durationSec: 0.13,
        frequency: 659.25,
        waveform: "triangle",
        gain: 0.18,
        attackSec: 0.008,
      },
    ],
  },
};

/**
 * Generates a complete 16-bit PCM WAV buffer for one of the built-in SFX ids.
 */
export function buildSfxWav(
  id: SfxEffectId,
  sampleRate: number = DEFAULT_SFX_SAMPLE_RATE
): Uint8Array {
  const def = SFX_DEFINITIONS[id];
  const samples = synthesizeNotesToSamples(
    def.notes,
    def.durationSec,
    sampleRate
  );
  return encodePcm16Wav(samples, sampleRate);
}
