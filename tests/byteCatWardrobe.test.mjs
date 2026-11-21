import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  BYTE_CAT_ACCESSORIES,
  BYTE_CAT_MOODS,
  getByteCatWardrobeState,
  getEquippedAccessoryList,
  isByteCatAccessoryUnlocked,
  resetByteCatWardrobeForTesting,
  setByteCatMood,
  subscribeByteCatWardrobe,
  toggleByteCatAccessory,
} = loadTsModule("src/utils/byteCatWardrobe.ts");

test("byteCatWardrobe exposes 6 accessories across 3 slots and 4 moods", () => {
  assert.equal(BYTE_CAT_ACCESSORIES.length, 6);
  assert.equal(BYTE_CAT_MOODS.length, 4);
  assert.deepEqual(
    BYTE_CAT_MOODS.map((m) => m.id),
    ["cozy", "focused", "sleepy", "hyped"],
  );
  const slots = new Set(BYTE_CAT_ACCESSORIES.map((a) => a.slot));
  assert.deepEqual([...slots].sort(), ["eyewear", "head", "neck"]);
});

test("byteCatWardrobe enforces XP, streak, and Pro unlocks and supports multi-slot dressing", () => {
  resetByteCatWardrobeForTesting();
  const events = [];
  const unsub = subscribeByteCatWardrobe((s) => events.push(s));

  const freshFree = { xpPoints: 0, streakCount: 0, isPremium: false };
  // Starter accessories are free at 0 XP
  assert.equal(isByteCatAccessoryUnlocked("headphones", freshFree), true);
  assert.equal(isByteCatAccessoryUnlocked("crt_glasses", freshFree), true);
  assert.equal(isByteCatAccessoryUnlocked("sakura_scarf", freshFree), false);
  assert.equal(isByteCatAccessoryUnlocked("wizard_hat", freshFree), false);

  // Streak or XP unlocks earnable gear; Pro unlocks everything early
  assert.equal(
    isByteCatAccessoryUnlocked("sakura_scarf", {
      xpPoints: 0,
      streakCount: 2,
      isPremium: false,
    }),
    true,
  );
  assert.equal(
    isByteCatAccessoryUnlocked("wizard_hat", {
      xpPoints: 200,
      streakCount: 0,
      isPremium: false,
    }),
    true,
  );
  assert.equal(
    isByteCatAccessoryUnlocked("star_visor", {
      xpPoints: 0,
      streakCount: 0,
      isPremium: true,
    }),
    true,
  );

  // Trying to equip locked gear fails cleanly without changing state
  const denied = toggleByteCatAccessory("wizard_hat", freshFree);
  assert.equal(denied.changed, false);
  assert.equal(getByteCatWardrobeState().equipped.head, "headphones");

  // Equipping CRT Glasses stacks alongside default Headphones
  const wearGlasses = toggleByteCatAccessory("crt_glasses", freshFree);
  assert.equal(wearGlasses.changed, true);
  assert.equal(wearGlasses.equippedNow, true);
  assert.equal(getByteCatWardrobeState().equipped.head, "headphones");
  assert.equal(getByteCatWardrobeState().equipped.eyewear, "crt_glasses");

  // Swapping head gear replaces headphones with wizard_hat when unlocked
  const wearWizard = toggleByteCatAccessory("wizard_hat", {
    xpPoints: 300,
    streakCount: 0,
    isPremium: false,
  });
  assert.equal(wearWizard.changed, true);
  assert.equal(wearWizard.equippedNow, true);
  assert.equal(getByteCatWardrobeState().equipped.head, "wizard_hat");

  // Toggling an equipped item removes it
  const removeGlasses = toggleByteCatAccessory("crt_glasses", freshFree);
  assert.equal(removeGlasses.changed, true);
  assert.equal(removeGlasses.equippedNow, false);
  assert.equal(getByteCatWardrobeState().equipped.eyewear, null);

  // Mood changes notify subscribers
  setByteCatMood("hyped");
  assert.equal(getByteCatWardrobeState().mood, "hyped");

  const equippedList = getEquippedAccessoryList();
  assert.deepEqual(
    equippedList.map((a) => a.id),
    ["wizard_hat"],
  );

  unsub();
  assert.ok(events.length >= 4);
  resetByteCatWardrobeForTesting();
});
