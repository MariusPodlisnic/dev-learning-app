import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  completeOnboarding,
  getOnboardingState,
  ONBOARDING_GOAL_OPTIONS,
  resetOnboardingForTesting,
  sanitizeDisplayName,
  shouldShowWelcomeCard,
  skipOnboarding,
  subscribeOnboarding,
  updateDisplayName,
} = loadTsModule("src/utils/userOnboarding.ts");

test("userOnboarding sanitizes display names and exposes 3 goal tracks", () => {
  assert.equal(ONBOARDING_GOAL_OPTIONS.length, 3);
  assert.deepEqual(
    ONBOARDING_GOAL_OPTIONS.map((g) => g.id),
    ["python_basics", "algorithms", "system_design"],
  );
  assert.equal(sanitizeDisplayName("   Ada   Lovelace   "), "Ada Lovelace");
  assert.equal(
    sanitizeDisplayName("A".repeat(40)).length,
    24,
    "Display name should cap cleanly at 24 characters",
  );
});

test("userOnboarding completes, skips, updates display name, and hides for returning users", () => {
  resetOnboardingForTesting();

  const initial = getOnboardingState();
  assert.equal(initial.completed, false);
  assert.equal(shouldShowWelcomeCard(initial, 0, 0), true);
  assert.equal(shouldShowWelcomeCard(initial, 1, 0), false);
  assert.equal(shouldShowWelcomeCard(initial, 0, 50), false);

  const events = [];
  const unsub = subscribeOnboarding((state) => events.push(state));

  const completed = completeOnboarding({
    displayName: "  Marius  ",
    goalTrack: "algorithms",
  });
  assert.equal(completed.completed, true);
  assert.equal(completed.displayName, "Marius");
  assert.equal(completed.goalTrack, "algorithms");
  assert.equal(shouldShowWelcomeCard(completed, 0, 0), false);
  assert.equal(events.length, 1);

  const renamed = updateDisplayName("ByteMaster");
  assert.equal(renamed.displayName, "ByteMaster");
  assert.equal(renamed.goalTrack, "algorithms");
  assert.equal(events.length, 2);

  resetOnboardingForTesting();
  const skipped = skipOnboarding();
  assert.equal(skipped.completed, true);
  assert.equal(shouldShowWelcomeCard(skipped, 0, 0), false);

  unsub();
  resetOnboardingForTesting();
});
