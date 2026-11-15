import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  MOBILE_NAV_ITEMS,
  getKeyboardAvoidingBehavior,
  isCompactHeaderWidth,
  isCompactStudioWidth,
  shouldShowBottomThumbNav,
} = loadTsModule("src/utils/mobileLayout.ts");

test("responsive viewport helpers detect compact phone headers and studio panes", () => {
  assert.equal(isCompactHeaderWidth(390), true);
  assert.equal(isCompactHeaderWidth(719), true);
  assert.equal(isCompactHeaderWidth(720), false);
  assert.equal(isCompactHeaderWidth(1280), false);

  assert.equal(isCompactStudioWidth(390), true);
  assert.equal(isCompactStudioWidth(919), true);
  assert.equal(isCompactStudioWidth(920), false);
});

test("bottom thumb navigation hides automatically when keyboard opens on phones", () => {
  assert.equal(
    shouldShowBottomThumbNav({ isCompactHeader: true, isKeyboardVisible: false }),
    true,
  );
  assert.equal(
    shouldShowBottomThumbNav({ isCompactHeader: true, isKeyboardVisible: true }),
    false,
  );
  assert.equal(
    shouldShowBottomThumbNav({ isCompactHeader: false, isKeyboardVisible: false }),
    false,
  );
});

test("keyboard avoiding behavior maps iOS padding, Android height, and web undefined", () => {
  assert.equal(getKeyboardAvoidingBehavior("ios"), "padding");
  assert.equal(getKeyboardAvoidingBehavior("android"), "height");
  assert.equal(getKeyboardAvoidingBehavior("web"), undefined);
});

test("MOBILE_NAV_ITEMS covers all primary mobile destinations without duplicates", () => {
  assert.equal(MOBILE_NAV_ITEMS.length, 6);
  const keys = MOBILE_NAV_ITEMS.map((item) => item.key);
  assert.equal(new Set(keys).size, keys.length);
});
