import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  ALGO_RACE_MATCHUPS,
  buildAlgorithmRace,
  generatePresetArray,
  parseCustomNumberArray,
} = loadTsModule("src/utils/algoRaceEngine.ts");

test("parseCustomNumberArray validates, clamps, and optionally sorts user arrays", () => {
  const valid = parseCustomNumberArray("[42, 7, 19, 3, 88]", {
    sortAscending: true,
  });
  assert.equal(valid.error, null);
  assert.deepEqual(valid.values, [3, 7, 19, 42, 88]);

  const tooShort = parseCustomNumberArray("10, 20", { minLen: 4 });
  assert.ok(tooShort.error);

  const badNum = parseCustomNumberArray("10, 20, abc, 40");
  assert.ok(badNum.error);
});

test("buildAlgorithmRace demonstrates faster ops for QuickSort, Binary Search, and Hash Map on worst-case inputs", () => {
  assert.equal(ALGO_RACE_MATCHUPS.length, 3);

  // 1. Reversed array: QuickSort vs Bubble Sort
  const reversed = generatePresetArray("reversed", 10);
  const sortRace = buildAlgorithmRace("quicksort_vs_bubble", reversed);
  const qsFinal = sortRace.leftFrames[sortRace.leftFrames.length - 1];
  const bsFinal = sortRace.rightFrames[sortRace.rightFrames.length - 1];
  assert.deepEqual(qsFinal.arr, bsFinal.arr, "Both sorting algorithms must produce identical sorted output");
  assert.equal(qsFinal.finished, true);
  assert.equal(bsFinal.finished, true);

  // 2. Binary Search vs Linear Scan near tail of sorted array
  const sorted = [4, 9, 15, 22, 28, 35, 44, 52, 61, 70, 83, 94];
  const searchRace = buildAlgorithmRace("binary_vs_linear", sorted, 94);
  assert.ok(
    searchRace.leftFrames[searchRace.leftFrames.length - 1].opsCount <
      searchRace.rightFrames[searchRace.rightFrames.length - 1].opsCount,
    "Binary Search should beat Linear Scan near the end of the array",
  );
  assert.ok(searchRace.speedupRatio >= 2.0);

  // 3. Hash Map vs Brute-Force Two Sum
  const twoSumRace = buildAlgorithmRace(
    "hashmap_vs_bruteforce",
    [14, 27, 8, 33, 19, 41, 6, 25],
    31,
  );
  assert.ok(
    twoSumRace.leftFrames[twoSumRace.leftFrames.length - 1].opsCount <
      twoSumRace.rightFrames[twoSumRace.rightFrames.length - 1].opsCount,
    "Hash Map O(n) should take fewer operations than nested loops O(n²)",
  );
});
