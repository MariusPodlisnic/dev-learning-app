import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildFlashcardSessionDeck,
  computeFlashcardRoundReward,
  getFlashcardCatalog,
  recordFlashcardRating,
} = loadTsModule("src/utils/flashcardDeck.ts");

test("flashcard catalog builds rich unique Concept Check & Pitfall cards across all 3 tracks", () => {
  const catalog = getFlashcardCatalog();
  assert.ok(catalog.length >= 60, `Expected at least 60 flashcards, got ${catalog.length}`);

  const ids = new Set(catalog.map((c) => c.id));
  assert.equal(ids.size, catalog.length, "All flashcard IDs must be unique");

  for (const track of ["python_basics", "algorithms", "system_design"]) {
    const trackCards = catalog.filter((c) => c.track === track);
    assert.ok(trackCards.length >= 10, `Expected >= 10 flashcards for ${track}`);
  }

  assert.ok(catalog.some((c) => c.category === "CONCEPT CHECK"));
  assert.ok(catalog.some((c) => c.category === "PITFALL ALERT" && Boolean(c.frontCode)));
});

test("flashcard session deck respects Pro gating, prioritizes missed reviews, and computes XP rewards", () => {
  const emptyProgress = {
    masteredIds: {},
    reviewIds: {},
    totalReviewed: 0,
    bestStreak: 0,
  };

  // Free user gets 4 preview cards for Algorithms, Pro gets full 8-card sprint
  const freeAlgo = buildFlashcardSessionDeck({
    track: "algorithms",
    isPremium: false,
    progress: emptyProgress,
    size: 8,
    seed: "test-1",
  });
  assert.equal(freeAlgo.length, 4);
  assert.ok(freeAlgo.every((c) => !c.isPro));

  const proAlgo = buildFlashcardSessionDeck({
    track: "algorithms",
    isPremium: true,
    progress: emptyProgress,
    size: 8,
    seed: "test-1",
  });
  assert.equal(proAlgo.length, 8);

  // Marking a card as 'review' places it in reviewOnly mode; 'got_it' clears it
  const sampleId = freeAlgo[0].id;
  const afterMiss = recordFlashcardRating(emptyProgress, sampleId, "review", 0);
  assert.equal(afterMiss.reviewIds[sampleId], true);
  assert.equal(afterMiss.totalReviewed, 1);

  const reviewDeck = buildFlashcardSessionDeck({
    track: "algorithms",
    isPremium: false,
    progress: afterMiss,
    reviewOnly: true,
    size: 8,
    seed: "test-2",
  });
  assert.equal(reviewDeck.length, 1);
  assert.equal(reviewDeck[0].id, sampleId);

  const afterMaster = recordFlashcardRating(afterMiss, sampleId, "got_it", 3);
  assert.equal(afterMaster.masteredIds[sampleId], true);
  assert.equal(afterMaster.reviewIds[sampleId], undefined);
  assert.equal(afterMaster.bestStreak, 3);

  // XP calculation rewards clears + perfect + streak bonuses cleanly
  assert.equal(
    computeFlashcardRoundReward({ gotItCount: 0, totalCards: 8, bestRoundStreak: 0 }),
    0,
  );
  assert.equal(
    computeFlashcardRoundReward({ gotItCount: 8, totalCards: 8, bestRoundStreak: 8 }),
    55,
  );
  assert.equal(
    computeFlashcardRoundReward({ gotItCount: 4, totalCards: 8, bestRoundStreak: 2 }),
    20,
  );
});
