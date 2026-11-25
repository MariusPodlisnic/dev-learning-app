import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  computeCharacterDiffSpotlight,
  computeTestCascadePlan,
  findCodexCardForLesson,
  visualizeWhitespace,
} = loadTsModule("src/utils/studioMicroMoments.ts");

test("computeCharacterDiffSpotlight isolates middle character spans while preserving shared prefix and suffix", () => {
  const midDiff = computeCharacterDiffSpotlight("[10, 20, 99, 40]", "[10, 20, 30, 40]");
  assert.equal(midDiff.exactMatch, false);
  assert.equal(midDiff.commonPrefix, "[10, 20, ");
  assert.equal(midDiff.expectedMid, "99");
  assert.equal(midDiff.actualMid, "30");
  assert.equal(midDiff.commonSuffix, ", 40]");
  assert.equal(midDiff.lineNumber, 1);
  assert.equal(midDiff.colNumber, 10);
  assert.ok(midDiff.similarityPct >= 80 && midDiff.similarityPct <= 95);
});

test("computeCharacterDiffSpotlight exposes invisible trailing spaces and multiline offsets", () => {
  assert.equal(visualizeWhitespace("hi \t\n"), "hi·⇥↵");

  const wsDiff = computeCharacterDiffSpotlight("Score: 50", "Score: 50  ");
  assert.equal(wsDiff.hasInvisibleDiff, true);
  assert.equal(wsDiff.expectedSpotToken, "∅ (end)");
  assert.equal(wsDiff.actualSpotToken, "··");

  const multiLine = computeCharacterDiffSpotlight("line1\nok: True", "line1\nok: False");
  assert.equal(multiLine.lineNumber, 2);
  assert.equal(multiLine.colNumber, 5);
  assert.equal(multiLine.expectedMid, "True");
  assert.equal(multiLine.actualMid, "False");
});

test("computeTestCascadePlan locates first failing check and computes bounded victory cascade duration", () => {
  const partialFail = computeTestCascadePlan([
    { passed: true },
    { passed: true },
    { passed: false },
  ]);
  assert.equal(partialFail.firstFailedIndex, 2);
  assert.equal(partialFail.allPassed, false);
  assert.equal(partialFail.passedCount, 2);

  const fullPass = computeTestCascadePlan([
    { passed: true },
    { passed: true },
    { passed: true },
  ]);
  assert.equal(fullPass.firstFailedIndex, -1);
  assert.equal(fullPass.allPassed, true);
  assert.ok(fullPass.totalDurationMs >= 400 && fullPass.totalDurationMs <= 680);
});

test("findCodexCardForLesson resolves chapter Constellation Codex entry across tracks", () => {
  const pyCard = findCodexCardForLesson({
    track: "python_basics",
    lesson_order: 6,
  });
  assert.equal(pyCard?.id, "py-ch2-dicts-slicing");

  const algoCard = findCodexCardForLesson({
    track: "algorithms",
    lesson_order: 10,
  });
  assert.equal(algoCard?.id, "algo-ch3-binary-prefix");
});
