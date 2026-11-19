import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  LOFI_CHANNELS,
  cycleLofiChannel,
  getLofiChannel,
  getLofiChannelMeta,
  isLofiPlaying,
  selectAndPlayLofiChannel,
  setLofiChannel,
  stopLofiRadio,
  subscribeLofiRadio,
  toggleLofiRadio,
} = loadTsModule("src/utils/lofiRadio.ts");

test("lofiRadio toggles play/pause, cycles channels, and notifies subscribers", () => {
  stopLofiRadio();
  setLofiChannel("chillhop");
  assert.equal(isLofiPlaying(), false);
  assert.equal(getLofiChannel(), "chillhop");
  assert.equal(LOFI_CHANNELS.length, 3);

  const events = [];
  const unsubscribe = subscribeLofiRadio((state) => {
    events.push({ ...state });
  });

  try {
    assert.equal(toggleLofiRadio(), true);
    assert.equal(isLofiPlaying(), true);

    const ch2 = cycleLofiChannel();
    assert.equal(ch2, "rain");
    assert.equal(getLofiChannelMeta(ch2).label, "COZY RAIN · FLOW");

    const ch3 = cycleLofiChannel();
    assert.equal(ch3, "synth");
    assert.equal(getLofiChannelMeta(ch3).label, "MIDNIGHT SYNTH");

    const chWrap = cycleLofiChannel();
    assert.equal(chWrap, "chillhop");

    assert.equal(toggleLofiRadio(), false);
    assert.equal(isLofiPlaying(), false);

    // Selecting a station directly from paused starts playing that station
    assert.equal(selectAndPlayLofiChannel("rain"), true);
    assert.equal(isLofiPlaying(), true);
    assert.equal(getLofiChannel(), "rain");

    assert.equal(events.length, 6);
    assert.deepEqual(events[0], { isPlaying: true, channel: "chillhop" });
    assert.deepEqual(events[1], { isPlaying: true, channel: "rain" });
    assert.deepEqual(events[4], { isPlaying: false, channel: "chillhop" });
    assert.deepEqual(events[5], { isPlaying: true, channel: "rain" });
  } finally {
    unsubscribe();
    stopLofiRadio();
  }
});

test("native lo-fi loop WAV asset exists with valid RIFF/WAVE header", () => {
  const wavPath = path.resolve(process.cwd(), "assets/sfx/lofi-chillhop.wav");
  assert.ok(fs.existsSync(wavPath), `Missing ${wavPath}`);
  const bytes = new Uint8Array(fs.readFileSync(wavPath));
  assert.ok(bytes.length > 50_000, "WAV loop should have multi-second audio payload");

  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const format = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  assert.equal(magic, "RIFF");
  assert.equal(format, "WAVE");
});
