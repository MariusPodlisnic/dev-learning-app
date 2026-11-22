import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  getArcadeRecordsState,
  getBlitzRankFromHits,
  mergeArcadeRecords,
  recordBlitzRun,
  recordDetectiveRound,
  recordFlashcardsRound,
  replaceArcadeRecordsFromCloud,
  resetArcadeRecordsForTesting,
  subscribeArcadeRecords,
} = loadTsModule("src/utils/arcadeRecords.ts");

test("arcadeRecords tracks Blitz, Flashcards, and Detective personal bests and ranks", () => {
  resetArcadeRecordsForTesting();
  const events = [];
  const unsub = subscribeArcadeRecords((next) => events.push(next));

  recordBlitzRun(9, 140);
  recordBlitzRun(6, 80); // lower score should not regress personal best
  recordBlitzRun(13, 210);
  recordFlashcardsRound(7);
  recordFlashcardsRound(5);
  recordDetectiveRound(4);
  recordDetectiveRound(6);

  const state = getArcadeRecordsState();
  assert.equal(state.blitzBestHits, 13);
  assert.equal(state.blitzBestXp, 210);
  assert.equal(getBlitzRankFromHits(state.blitzBestHits), "S-RANK");
  assert.equal(getBlitzRankFromHits(8), "A-RANK");
  assert.equal(getBlitzRankFromHits(5), "B-RANK");
  assert.equal(state.flashcardsMasteredTotal, 12);
  assert.equal(state.flashcardsRoundsCleared, 2);
  assert.equal(state.detectiveBestScore, 6);
  assert.equal(state.detectiveCasesSolvedTotal, 10);
  assert.equal(events.length, 7);

  // Monotonic cloud merge takes max of every personal best
  const merged = mergeArcadeRecords(state, {
    blitzBestHits: 15,
    blitzBestXp: 190,
    flashcardsMasteredTotal: 20,
    flashcardsRoundsCleared: 1,
    detectiveBestScore: 5,
    detectiveCasesSolvedTotal: 14,
  });
  assert.equal(merged.blitzBestHits, 15);
  assert.equal(merged.blitzBestXp, 210);
  assert.equal(merged.flashcardsMasteredTotal, 20);
  assert.equal(merged.flashcardsRoundsCleared, 2);
  assert.equal(merged.detectiveBestScore, 6);
  assert.equal(merged.detectiveCasesSolvedTotal, 14);

  replaceArcadeRecordsFromCloud({ blitzBestHits: 18, blitzBestXp: 300 });
  assert.equal(getArcadeRecordsState().blitzBestHits, 18);
  assert.equal(getArcadeRecordsState().blitzBestXp, 300);

  unsub();
  resetArcadeRecordsForTesting();
});
