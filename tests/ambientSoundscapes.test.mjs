import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  AMBIENT_CHANNELS,
  AMBIENT_PRESETS,
  AMBIENT_VOLUME_STEPS,
  applyAmbientPreset,
  getAmbientMixerState,
  resetAmbientMixerForTesting,
  setAmbientChannelVolume,
  stopAmbientMixer,
  subscribeAmbientMixer,
  toggleAmbientChannel,
  toggleAmbientMixer,
} = loadTsModule("src/utils/ambientSoundscapes.ts");

const { setSoundEnabled } = loadTsModule("src/utils/soundEffects.ts");

test("ambientSoundscapes defines 4 cozy channels, 4 presets, and 5 fader steps", () => {
  assert.equal(AMBIENT_CHANNELS.length, 4);
  assert.deepEqual(
    AMBIENT_CHANNELS.map((c) => c.id),
    ["rain", "cafe", "fireplace", "crt"],
  );
  assert.equal(AMBIENT_PRESETS.length, 4);
  assert.deepEqual([...AMBIENT_VOLUME_STEPS], [20, 40, 60, 80, 100]);
});

test("ambientSoundscapes mixes channels, clamps volumes, applies presets, and notifies subscribers", () => {
  resetAmbientMixerForTesting();
  const events = [];
  const unsub = subscribeAmbientMixer((s) => events.push(s));

  const init = getAmbientMixerState();
  assert.equal(init.isPlaying, false);
  assert.equal(init.activeCount, 0);

  // Adjusting a channel > 0 auto-starts playback and clamps to 0..100
  const rainOn = setAmbientChannelVolume("rain", 145);
  assert.equal(rainOn.isPlaying, true);
  assert.equal(rainOn.volumes.rain, 100);
  assert.equal(rainOn.activeCount, 1);

  // Toggling a second channel layers it on top
  const fireOn = toggleAmbientChannel("fireplace");
  assert.equal(fireOn.isPlaying, true);
  assert.equal(fireOn.volumes.fireplace, 60);
  assert.equal(fireOn.activeCount, 2);

  // Applying a preset updates all 4 layers cleanly
  const cozyShop = applyAmbientPreset("coffee_shop");
  assert.equal(cozyShop.isPlaying, true);
  assert.equal(cozyShop.volumes.cafe, 60);
  assert.equal(cozyShop.volumes.rain, 40);
  assert.equal(cozyShop.volumes.fireplace, 0);
  assert.equal(cozyShop.activeCount, 2);

  // Toggling mixer pauses without erasing saved volumes, then resumes
  assert.equal(toggleAmbientMixer(), false);
  assert.equal(getAmbientMixerState().isPlaying, false);
  assert.equal(getAmbientMixerState().volumes.cafe, 60);

  assert.equal(toggleAmbientMixer(), true);
  assert.equal(getAmbientMixerState().isPlaying, true);

  // Master sound mute stops ambient playback cleanly
  setSoundEnabled(false);
  assert.equal(getAmbientMixerState().isPlaying, false);
  setSoundEnabled(true);

  // Silent preset clears everything and stops playback
  const cleared = applyAmbientPreset("silent");
  assert.equal(cleared.isPlaying, false);
  assert.equal(cleared.activeCount, 0);

  // Starting from an empty mix applies Rainy Night cozy default
  assert.equal(toggleAmbientMixer(), true);
  assert.equal(getAmbientMixerState().isPlaying, true);
  assert.equal(getAmbientMixerState().volumes.rain, 80);

  stopAmbientMixer();
  unsub();
  assert.ok(events.length >= 6);
  resetAmbientMixerForTesting();
});
