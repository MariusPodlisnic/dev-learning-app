import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  DAILY_QUEST_BONUS_XP,
  claimDailyQuestReward,
  createEmptyDailyQuest,
  getDailyQuestProgress,
  markDailyQuestStep,
  normalizeDailyQuestState,
} = loadTsModule("src/utils/dailyQuests.ts");

test("dailyQuests tracks 3 daily steps, awards +75 XP once, and resets on a new day", () => {
  const day1 = "2026-11-19";
  const day2 = "2026-11-20";

  let state = createEmptyDailyQuest(day1);
  assert.deepEqual(getDailyQuestProgress(state), {
    completedCount: 0,
    totalCount: 3,
    allDone: false,
    canClaim: false,
  });

  // Claiming before 3/3 awards 0
  const earlyClaim = claimDailyQuestReward(state, day1);
  assert.equal(earlyClaim.awardedXp, 0);
  assert.equal(earlyClaim.nextState.claimed, false);

  state = markDailyQuestStep(state, "lesson", day1);
  state = markDailyQuestStep(state, "bughunt", day1);
  assert.equal(getDailyQuestProgress(state).completedCount, 2);
  assert.equal(getDailyQuestProgress(state).canClaim, false);

  // Marking same step again is idempotent
  const repeat = markDailyQuestStep(state, "lesson", day1);
  assert.equal(repeat, state);

  state = markDailyQuestStep(state, "blitz", day1);
  assert.deepEqual(getDailyQuestProgress(state), {
    completedCount: 3,
    totalCount: 3,
    allDone: true,
    canClaim: true,
  });

  // Claim once -> +75 XP
  const claimed = claimDailyQuestReward(state, day1);
  assert.equal(claimed.awardedXp, DAILY_QUEST_BONUS_XP);
  assert.equal(claimed.nextState.claimed, true);
  assert.equal(getDailyQuestProgress(claimed.nextState).canClaim, false);

  // Claiming a second time on the same day awards 0
  const secondClaim = claimDailyQuestReward(claimed.nextState, day1);
  assert.equal(secondClaim.awardedXp, 0);

  // Next calendar day automatically resets all 3 steps and claim state
  const nextDay = normalizeDailyQuestState(claimed.nextState, day2);
  assert.equal(nextDay.dateKey, day2);
  assert.equal(nextDay.claimed, false);
  assert.deepEqual(nextDay.steps, {
    lesson: false,
    bughunt: false,
    blitz: false,
  });
});
