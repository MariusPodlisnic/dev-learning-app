import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  countUnlockedLoftWorkshopItems,
  DEFAULT_LOFT_CUSTOMIZATION,
  getCompanionMeta,
  getKeycapSetMeta,
  getLoftCustomizationState,
  getMugStyleMeta,
  getWindowWorldMeta,
  isLoftWorkshopItemUnlocked,
  LOFT_COMPANIONS,
  LOFT_KEYCAP_SETS,
  LOFT_MUG_STYLES,
  LOFT_WINDOW_WORLDS,
  sanitizeLoftCustomization,
  subscribeLoftCustomization,
  updateLoftCustomization,
} = loadTsModule("src/utils/loftCustomization.ts");

test("loftCustomization defines all 4 workshop slots, sanitizes invalid values, and notifies subscribers", () => {
  assert.equal(LOFT_COMPANIONS.length, 5);
  assert.equal(LOFT_WINDOW_WORLDS.length, 4);
  assert.equal(LOFT_KEYCAP_SETS.length, 4);
  assert.equal(LOFT_MUG_STYLES.length, 4);

  const sanitized = sanitizeLoftCustomization({
    companion: "invalid_pet",
    windowWorld: "alpine_cabin",
    keycaps: "matcha_cream",
    mugStyle: 42,
  });
  assert.equal(sanitized.companion, DEFAULT_LOFT_CUSTOMIZATION.companion);
  assert.equal(sanitized.windowWorld, "alpine_cabin");
  assert.equal(sanitized.keycaps, "matcha_cream");
  assert.equal(sanitized.mugStyle, DEFAULT_LOFT_CUSTOMIZATION.mugStyle);

  let latest = null;
  const unsub = subscribeLoftCustomization((next) => {
    latest = next;
  });
  const updated = updateLoftCustomization({
    companion: "shiba_pup",
    windowWorld: "sakura_kyoto",
  });
  unsub();

  assert.equal(updated.companion, "shiba_pup");
  assert.equal(updated.windowWorld, "sakura_kyoto");
  assert.equal(latest.companion, "shiba_pup");
  assert.equal(getLoftCustomizationState().companion, "shiba_pup");
  assert.equal(getCompanionMeta("robo_duck").shortName, "DUCK");
  assert.equal(getWindowWorldMeta("starry_observatory").toastLabel, "STARRY OBSERVATORY");
  assert.equal(getKeycapSetMeta("cyber_sakura").label, "Cyber Sakura");
  assert.equal(getMugStyleMeta("starlight_thermos").label, "Astral Tumbler");

  // Restore defaults cleanly for downstream tests
  updateLoftCustomization(DEFAULT_LOFT_CUSTOMIZATION);
});

test("loftCustomization XP unlock checks scale from 4 starters to all 17 items", () => {
  assert.equal(isLoftWorkshopItemUnlocked(0, 0), true);
  assert.equal(isLoftWorkshopItemUnlocked(600, 500), false);
  assert.equal(isLoftWorkshopItemUnlocked(600, 600), true);
  assert.equal(isLoftWorkshopItemUnlocked(2000, 0, true), true);

  const starterCount = countUnlockedLoftWorkshopItems(0);
  assert.equal(starterCount.unlocked, 4);
  assert.equal(starterCount.total, 17);

  const midCount = countUnlockedLoftWorkshopItems(600);
  assert.ok(midCount.unlocked > starterCount.unlocked && midCount.unlocked < 17);

  const fullCount = countUnlockedLoftWorkshopItems(2500);
  assert.equal(fullCount.unlocked, 17);
});
