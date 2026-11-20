import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  classifyTypingKey,
  cycleTypingSoundProfile,
  getTypingSoundProfile,
  getTypingSoundProfileMeta,
  setTypingSoundProfile,
  subscribeTypingSound,
  TYPING_SOUND_PROFILES,
} = loadTsModule("src/utils/typingSounds.ts");

test("typingSounds classifies typing vs modifier keys accurately", () => {
  assert.equal(classifyTypingKey("a"), "char");
  assert.equal(classifyTypingKey("Tab"), "char");
  assert.equal(classifyTypingKey(" "), "space");
  assert.equal(classifyTypingKey("Enter"), "enter");
  assert.equal(classifyTypingKey("Backspace"), "backspace");
  assert.equal(classifyTypingKey("Shift"), null);
  assert.equal(classifyTypingKey("Meta"), null);
  assert.equal(classifyTypingKey("ArrowLeft"), null);
  assert.equal(classifyTypingKey(""), null);
});

test("typingSounds cycles through 3 profiles and notifies subscribers", () => {
  assert.equal(TYPING_SOUND_PROFILES.length, 3);
  setTypingSoundProfile("thock");
  assert.equal(getTypingSoundProfile(), "thock");
  assert.equal(getTypingSoundProfileMeta("thock").shortLabel, "THOCK");

  const observed = [];
  const unsub = subscribeTypingSound((prof) => observed.push(prof));

  assert.equal(cycleTypingSoundProfile(), "typewriter");
  assert.equal(cycleTypingSoundProfile(), "off");
  assert.equal(cycleTypingSoundProfile(), "thock");
  assert.deepEqual(observed, ["typewriter", "off", "thock"]);

  unsub();
  setTypingSoundProfile("thock");
});
