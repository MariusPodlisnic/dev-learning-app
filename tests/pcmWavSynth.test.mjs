import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_SFX_SAMPLE_RATE,
  SFX_DEFINITIONS,
  buildSfxWav,
  encodePcm16Wav,
  synthesizeNotesToSamples,
} from "../src/utils/pcmWavSynth.ts";

function readAscii(bytes, start, length) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += String.fromCharCode(bytes[start + i]);
  }
  return out;
}

function readPcm16Samples(wavBytes) {
  const view = new DataView(
    wavBytes.buffer,
    wavBytes.byteOffset,
    wavBytes.byteLength
  );
  const dataSize = view.getUint32(40, true);
  const sampleCount = dataSize / 2;
  const out = new Int16Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    out[i] = view.getInt16(44 + i * 2, true);
  }
  return out;
}

test("encodePcm16Wav writes valid 44-byte RIFF/WAVE header", () => {
  const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
  const wav = encodePcm16Wav(samples, 22050);
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);

  assert.equal(readAscii(wav, 0, 4), "RIFF");
  assert.equal(view.getUint32(4, true), 36 + samples.length * 2);
  assert.equal(readAscii(wav, 8, 4), "WAVE");
  assert.equal(readAscii(wav, 12, 4), "fmt ");
  assert.equal(view.getUint32(16, true), 16);
  assert.equal(view.getUint16(20, true), 1);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 22050);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(readAscii(wav, 36, 4), "data");
  assert.equal(view.getUint32(40, true), samples.length * 2);
  assert.equal(wav.length, 44 + samples.length * 2);
});

test("synthesizeNotesToSamples prevents clipping even with high overlapping gains", () => {
  const samples = synthesizeNotesToSamples(
    [
      { startSec: 0, durationSec: 0.1, frequency: 440, gain: 0.9 },
      { startSec: 0, durationSec: 0.1, frequency: 880, gain: 0.9 },
    ],
    0.1,
    DEFAULT_SFX_SAMPLE_RATE
  );
  let maxAbs = 0;
  for (const s of samples) {
    maxAbs = Math.max(maxAbs, Math.abs(s));
  }
  assert.ok(maxAbs > 0.5);
  assert.ok(maxAbs <= 0.93);
});

test("all built-in SFX wav assets exist on disk and match synth output", () => {
  const sfxDir = path.resolve(process.cwd(), "assets/sfx");
  for (const id of Object.keys(SFX_DEFINITIONS)) {
    const expected = buildSfxWav(id);
    const filePath = path.join(sfxDir, `${id}.wav`);
    assert.ok(fs.existsSync(filePath), `Missing ${filePath}`);
    const diskBytes = new Uint8Array(fs.readFileSync(filePath));
    assert.equal(diskBytes.length, expected.length);
    assert.deepEqual(diskBytes, expected);

    const pcm = readPcm16Samples(diskBytes);
    assert.ok(pcm.length > 500, `${id} should have audible frame count`);
    let energy = 0;
    for (let i = 0; i < pcm.length; i++) {
      energy += pcm[i] * pcm[i];
    }
    const rms = Math.sqrt(energy / pcm.length);
    assert.ok(rms > 300, `${id} RMS (${rms.toFixed(1)}) should be clearly audible`);
  }
});
