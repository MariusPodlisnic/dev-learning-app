import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildCloudSyncFeedback,
  buildGuestMergeNotice,
  parseAuthCallbackParams,
} = loadTsModule("src/utils/authHelpers.ts");

test("parseAuthCallbackParams parses PKCE query codes, hash tokens, and error callbacks", () => {
  const pkce = parseAuthCallbackParams(
    "devlearningapp://auth/callback?code=pkce_123&type=recovery",
  );
  assert.equal(pkce.code, "pkce_123");
  assert.equal(pkce.type, "recovery");
  assert.equal(pkce.error, undefined);

  const implicit = parseAuthCallbackParams(
    "https://devlearn.local/#access_token=acc_tok&refresh_token=ref_tok",
  );
  assert.equal(implicit.accessToken, "acc_tok");
  assert.equal(implicit.refreshToken, "ref_tok");

  const errCallback = parseAuthCallbackParams(
    "devlearningapp://auth/callback?error=access_denied&error_description=User+cancelled+login",
  );
  assert.equal(errCallback.error, "User cancelled login");
});

test("buildGuestMergeNotice explains guest-to-account merge for Sign Up and Sign In", () => {
  const signUpNotice = buildGuestMergeNotice({
    guestXp: 250,
    guestSolvedCount: 4,
    mode: "signup",
  });
  assert.ok(signUpNotice.includes("250 XP"));
  assert.ok(signUpNotice.includes("4 solved modules"));

  const signInNotice = buildGuestMergeNotice({
    guestXp: 1200,
    guestSolvedCount: 1,
    mode: "signin",
  });
  assert.ok(signInNotice.includes("1,200 XP"));
  assert.ok(signInNotice.includes("1 solved module"));
  assert.ok(signInNotice.includes("higher progress is always kept"));

  assert.equal(
    buildGuestMergeNotice({ guestXp: 0, guestSolvedCount: 0, mode: "signin" }),
    null,
  );
  assert.equal(
    buildGuestMergeNotice({ guestXp: 200, guestSolvedCount: 2, mode: "forgot" }),
    null,
  );
});

test("buildCloudSyncFeedback distinguishes guest merge from returning sync", () => {
  const merged = buildCloudSyncFeedback({
    mergedXp: 900,
    mergedSolvedCount: 7,
    hadGuestProgress: true,
  });
  assert.ok(merged.includes("Guest progress merged & synced"));
  assert.ok(merged.includes("900 XP"));
  assert.ok(merged.includes("7 solved modules"));

  const synced = buildCloudSyncFeedback({
    mergedXp: 900,
    mergedSolvedCount: 7,
    hadGuestProgress: false,
  });
  assert.ok(synced.includes("Cloud profile synced"));
});
