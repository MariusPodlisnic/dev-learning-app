import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCacheFlowSteps,
  buildCoinChangeDpSteps,
  buildFactorialRecursionSteps,
  buildFibMemoSteps,
  buildKnapsackDpSteps,
  buildMinHeapInsertSteps,
  buildMinHeapPopSteps,
  buildRateLimitFailoverSteps,
} from "../src/utils/visualizerEngines.ts";

test("recursion engines trace call stack unwind and fib memoization", () => {
  const factSteps = buildFactorialRecursionSteps(4);
  assert.ok(factSteps.length >= 6);
  const finalFrame = factSteps[factSteps.length - 1].stackFrames?.[0];
  assert.equal(finalFrame?.returnValue, "24");

  const fibSteps = buildFibMemoSteps();
  assert.equal(fibSteps[fibSteps.length - 1].stackFrames?.[0].returnValue, "3");
  assert.ok((fibSteps[fibSteps.length - 1].memoEntries?.length || 0) >= 4);
});

test("min_heap insert and pop maintain min-heap parent <= child invariant", () => {
  const insertSteps = buildMinHeapInsertSteps([14, 9, 22, 5, 11]);
  const insertedHeap = insertSteps[insertSteps.length - 1].heap || [];
  assert.equal(insertedHeap[0], 5);
  for (let i = 1; i < insertedHeap.length; i++) {
    const p = Math.floor((i - 1) / 2);
    assert.ok(insertedHeap[p] <= insertedHeap[i]);
  }

  const popSteps = buildMinHeapPopSteps([5, 9, 22, 14, 11]);
  const finalPop = popSteps[popSteps.length - 1];
  assert.deepEqual(finalPop.poppedValues, [5, 9]);
  const popHeap = finalPop.heap || [];
  for (let i = 1; i < popHeap.length; i++) {
    const p = Math.floor((i - 1) / 2);
    assert.ok(popHeap[p] <= popHeap[i]);
  }
});

test("dp_table engines compute optimal Knapsack (16) and Coin Change (2)", () => {
  const knapsackFinal = buildKnapsackDpSteps().at(-1);
  assert.equal(knapsackFinal?.dpGrid?.[3]?.[5], 16);

  const coinFinal = buildCoinChangeDpSteps([1, 3, 4], 6).at(-1);
  assert.equal(coinFinal?.dpGrid?.[0]?.[6], 2);
});

test("system_design engines trace cache miss->hit latency drop and rate-limit failover", () => {
  const cacheSteps = buildCacheFlowSteps();
  assert.equal(cacheSteps[1].sysLatencyMs, 42);
  assert.equal(cacheSteps[cacheSteps.length - 1].sysLatencyMs, 3);

  const failoverSteps = buildRateLimitFailoverSteps();
  assert.equal(failoverSteps[0].sysOutcomeTone, "throttled");
  assert.equal(failoverSteps[failoverSteps.length - 1].sysOutcomeTone, "replicated");
});
