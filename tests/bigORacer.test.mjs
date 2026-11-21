import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  BIG_O_INPUT_SIZES,
  analyzeUserCodeComplexity,
  buildRaceComparison,
  estimateOperations,
  formatOpsCount,
  resolveLessonRaceProfile,
} = loadTsModule("src/utils/bigORacer.ts");

test("bigORacer computes exact operation counts, speedup multipliers, and readable labels", () => {
  assert.deepEqual([...BIG_O_INPUT_SIZES], [10, 100, 1000, 10000]);
  assert.equal(estimateOperations("O(1)", 1000), 1);
  assert.equal(estimateOperations("O(log n)", 1024), 10);
  assert.equal(estimateOperations("O(n)", 1000), 1000);
  assert.equal(estimateOperations("O(n²)", 1000), 1_000_000);

  assert.equal(formatOpsCount(42), "42 ops");
  assert.equal(formatOpsCount(1500), "1.5K ops");
  assert.equal(formatOpsCount(1_000_000), "1.0M ops");

  const twoSumProfile = resolveLessonRaceProfile({
    title: "Two Sum",
    category: "Hash Map",
    complexities: { time: "O(n)", space: "O(n)" },
  });
  assert.equal(twoSumProfile.optimalClass, "O(n)");
  assert.equal(twoSumProfile.naiveClass, "O(n²)");

  const race = buildRaceComparison(twoSumProfile, 1000);
  assert.equal(race.optimalOps, 1000);
  assert.equal(race.naiveOps, 1_000_000);
  assert.equal(race.speedupFactor, 1000);
  assert.equal(race.speedupLabel, "1.0K× FASTER");
  assert.ok(race.naiveDurationMs > race.optimalDurationMs);

  const bsearchProfile = resolveLessonRaceProfile({
    title: "Binary Search",
    category: "Searching",
    complexities: { time: "O(log n)" },
  });
  assert.equal(bsearchProfile.optimalClass, "O(log n)");
  assert.equal(bsearchProfile.naiveClass, "O(n)");
});

test("bigORacer statically analyzes nested loops, single loops, sorts, and binary search drafts", () => {
  const nested = analyzeUserCodeComplexity(`
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
`);
  assert.equal(nested.estimatedClass, "O(n²)");
  assert.equal(nested.isNestedLoop, true);

  const linear = analyzeUserCodeComplexity(`
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
`);
  assert.equal(linear.estimatedClass, "O(n)");
  assert.equal(linear.isNestedLoop, false);

  const logN = analyzeUserCodeComplexity(`
def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
`);
  assert.equal(logN.estimatedClass, "O(log n)");

  const nLogN = analyzeUserCodeComplexity(`
def solve(nums):
    nums.sort()
    return nums
`);
  assert.equal(nLogN.estimatedClass, "O(n log n)");
});
