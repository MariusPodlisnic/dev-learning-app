import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMistakeReviewDeck,
  buildSeededDeck,
  calculateBugHuntReward,
  clearMistakeId,
  getBugHuntTimeLimit,
  getDailyDateKey,
  pickDailyBugIncident,
  recordMistakeId,
} from "../src/utils/arenaReplayability.ts";

test("pickDailyBugIncident is deterministic for a date and respects pro access", () => {
  const sampleIncidents = [
    { id: "py1", track: "python_basics", timeLimitSec: 60, baseXp: 50 },
    { id: "py2", track: "python_basics", timeLimitSec: 60, baseXp: 50 },
    { id: "algo1", track: "algorithms", timeLimitSec: 75, baseXp: 75 },
    { id: "sys1", track: "system_design", timeLimitSec: 90, baseXp: 90 },
  ];

  const freePickA = pickDailyBugIncident(sampleIncidents, "2026-11-15", false);
  const freePickB = pickDailyBugIncident(sampleIncidents, "2026-11-15", false);
  assert.ok(freePickA);
  assert.equal(freePickA.id, freePickB?.id);
  assert.equal(freePickA.track, "python_basics");

  const dateKey = getDailyDateKey(new Date(2026, 10, 15));
  assert.equal(dateKey, "2026-11-15");
});

test("buildSeededDeck produces repeatable card/option order per seed", () => {
  const cards = [
    { id: "c1", deck: "python_basics", options: ["a", "b", "c", "d"], correctIndex: 2 },
    { id: "c2", deck: "python_basics", options: ["w", "x", "y", "z"], correctIndex: 0 },
    { id: "c3", deck: "python_basics", options: ["1", "2", "3", "4"], correctIndex: 3 },
  ];

  const runA = buildSeededDeck(cards, "2026-11-15:python_basics");
  const runB = buildSeededDeck(cards, "2026-11-15:python_basics");
  assert.deepEqual(runA, runB);

  for (const card of runA) {
    const orig = cards.find((c) => c.id === card.id);
    assert.ok(orig);
    assert.equal(
      card.options[card.correctIndex],
      orig.options[orig.correctIndex],
    );
  }
});

test("hard-mode Bug Hunt shortens countdown and boosts XP reward", () => {
  assert.equal(getBugHuntTimeLimit(60, false), 60);
  assert.equal(getBugHuntTimeLimit(60, true), 33);
  assert.equal(getBugHuntTimeLimit(30, true), 25);

  const normalReward = calculateBugHuntReward({
    baseXp: 60,
    timeLimitSec: 60,
    secondsLeft: 40,
    hardMode: false,
    isDailyChallenge: false,
    dailyAlreadyCompleted: false,
  });
  assert.equal(normalReward.totalXp, 85);

  const hardDailyReward = calculateBugHuntReward({
    baseXp: 60,
    timeLimitSec: 33,
    secondsLeft: 20,
    hardMode: true,
    isDailyChallenge: true,
    dailyAlreadyCompleted: false,
  });
  // 1.5x base (90) + hard speed bonus (40) + daily bonus (40) = 170
  assert.equal(hardDailyReward.totalXp, 170);
});

test("mistake queue records, orders, builds review decks, and clears mastered IDs", () => {
  let queue = recordMistakeId([], "card_1");
  queue = recordMistakeId(queue, "card_2");
  queue = recordMistakeId(queue, "card_1");
  assert.deepEqual(queue, ["card_1", "card_2"]);

  const cards = [
    { id: "card_1", deck: "python_basics", options: ["a", "b"], correctIndex: 0 },
    { id: "card_2", deck: "python_basics", options: ["c", "d"], correctIndex: 1 },
    { id: "card_3", deck: "python_basics", options: ["e", "f"], correctIndex: 0 },
  ];
  const reviewDeck = buildMistakeReviewDeck(cards, queue);
  assert.deepEqual(reviewDeck.map((c) => c.id), ["card_1", "card_2"]);

  queue = clearMistakeId(queue, "card_1");
  assert.deepEqual(queue, ["card_2"]);
});
