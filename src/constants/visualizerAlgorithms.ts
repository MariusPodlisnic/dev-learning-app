import { StudioColors } from "./theme";
import {
  type AlgoId,
  type AlgoStep,
  type RecursionFrame,
  type SystemDesignNode,
  buildCacheFlowSteps,
  buildCoinChangeDpSteps,
  buildFactorialRecursionSteps,
  buildFibMemoSteps,
  buildKnapsackDpSteps,
  buildMinHeapInsertSteps,
  buildMinHeapPopSteps,
  buildRateLimitFailoverSteps,
} from "../utils/visualizerEngines";

export type { AlgoId, AlgoStep, RecursionFrame, SystemDesignNode };

export interface AlgoMeta {
  id: AlgoId;
  name: string;
  category: string;
  speedLabel: string;
  memoryLabel: string;
  accent: string;
  intro: string;
  presets: { label: string; build: () => AlgoStep[] }[];
}

function buildBinarySearchSteps(nums: number[], target: number): AlgoStep[] {
  const steps: AlgoStep[] = [
    {
      title: `Start: Search for ${target} in ${nums.length} Sorted Items`,
      explanation: `Start by marking the full list from left end (index 0) to right end (index ${nums.length - 1}). Every item is still a candidate.`,
      rule: "Mark full range: Left to Right",
      vars: [
        { label: "left", value: "0", highlight: true },
        { label: "right", value: String(nums.length - 1), highlight: true },
        { label: "target", value: String(target) },
        { label: "checks", value: "0" },
      ],
      arr: nums,
      targetVal: target,
      lo: 0,
      hi: nums.length - 1,
      mid: null,
      foundIdx: null,
    },
  ];

  let lo = 0;
  let hi = nums.length - 1;
  let checks = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    checks += 1;
    const val = nums[mid];

    if (val === target) {
      steps.push({
        title: `Check Middle [${mid}] = ${val} → Exact Match!`,
        explanation: `The middle item (${val}) matches ${target}! Found in just ${checks} check${checks === 1 ? "" : "s"} instead of checking one by one.`,
        rule: "Middle equals target → Found!",
        vars: [
          { label: "left", value: String(lo) },
          { label: "middle", value: String(mid), highlight: true },
          { label: "right", value: String(hi) },
          { label: "checks", value: String(checks), highlight: true },
        ],
        arr: nums,
        targetVal: target,
        lo,
        hi,
        mid,
        foundIdx: mid,
      });
      return steps;
    }

    if (val < target) {
      steps.push({
        title: `Middle [${mid}] is ${val} (< ${target}) → Drop Left Half`,
        explanation: `Since the list is sorted and ${val} is smaller than ${target}, everything to the left is too small. Move Left past the middle to ${mid + 1}.`,
        rule: "Too small → Ignore left half",
        vars: [
          { label: "left", value: `${lo} → ${mid + 1}`, highlight: true },
          { label: "middle", value: String(mid) },
          { label: "right", value: String(hi) },
          { label: "checks", value: String(checks) },
        ],
        arr: nums,
        targetVal: target,
        lo,
        hi,
        mid,
        foundIdx: null,
      });
      lo = mid + 1;
    } else {
      steps.push({
        title: `Middle [${mid}] is ${val} (> ${target}) → Drop Right Half`,
        explanation: `Since ${val} is bigger than ${target}, everything from index ${mid} to the right is too big. Move Right before the middle to ${mid - 1}.`,
        rule: "Too big → Ignore right half",
        vars: [
          { label: "left", value: String(lo) },
          { label: "middle", value: String(mid) },
          { label: "right", value: `${hi} → ${mid - 1}`, highlight: true },
          { label: "checks", value: String(checks) },
        ],
        arr: nums,
        targetVal: target,
        lo,
        hi,
        mid,
        foundIdx: null,
      });
      hi = mid - 1;
    }
  }

  steps.push({
    title: `Nothing Left to Search → ${target} Is Not Here`,
    explanation: `Left (${lo}) passed Right (${hi}), meaning no items remain. In only ${checks} checks, we proved ${target} is missing.`,
    rule: "Range empty → Not found",
    vars: [
      { label: "left", value: String(lo) },
      { label: "right", value: String(hi) },
      { label: "result", value: "Missing", highlight: true },
      { label: "checks", value: String(checks) },
    ],
    arr: nums,
    targetVal: target,
    lo,
    hi,
    mid: null,
    foundIdx: null,
  });
  return steps;
}

function buildTwoPointersSteps(nums: number[], target: number): AlgoStep[] {
  const steps: AlgoStep[] = [
    {
      title: `Place Fingers at Both Ends (Goal = ${target})`,
      explanation: `Put Left finger on the smallest number (${nums[0]}) and Right finger on the largest number (${nums[nums.length - 1]}).`,
      rule: "Start at both ends of sorted list",
      vars: [
        { label: "left", value: `0 (${nums[0]})`, highlight: true },
        { label: "right", value: `${nums.length - 1} (${nums[nums.length - 1]})`, highlight: true },
        { label: "goal", value: String(target) },
      ],
      arr: nums,
      targetVal: target,
      left: 0,
      right: nums.length - 1,
      matchedPair: null,
    },
  ];

  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
      steps.push({
        title: `${nums[left]} + ${nums[right]} = ${target} → Pair Found!`,
        explanation: `Left (${nums[left]}) and Right (${nums[right]}) add up to ${target}! Found by walking inward without checking every combination.`,
        rule: "Sum matches goal → Found pair!",
        vars: [
          { label: "left", value: `${left} (${nums[left]})`, highlight: true },
          { label: "right", value: `${right} (${nums[right]})`, highlight: true },
          { label: "sum", value: String(sum), highlight: true },
          { label: "goal", value: String(target) },
        ],
        arr: nums,
        targetVal: target,
        left,
        right,
        matchedPair: [left, right],
      });
      return steps;
    }
    if (sum < target) {
      steps.push({
        title: `${nums[left]} + ${nums[right]} = ${sum} (< ${target}) → Move Left Inward`,
        explanation: `Total ${sum} is too small. Because numbers grow toward the right, moving Left one step right (${left} → ${left + 1}) makes the sum bigger.`,
        rule: "Too small → Step Left forward",
        vars: [
          { label: "left", value: `${left} → ${left + 1}`, highlight: true },
          { label: "right", value: `${right} (${nums[right]})` },
          { label: "sum", value: String(sum) },
          { label: "goal", value: String(target) },
        ],
        arr: nums,
        targetVal: target,
        left,
        right,
        matchedPair: null,
      });
      left += 1;
    } else {
      steps.push({
        title: `${nums[left]} + ${nums[right]} = ${sum} (> ${target}) → Move Right Inward`,
        explanation: `Total ${sum} is too big. Moving Right one step left (${right} → ${right - 1}) shrinks the sum closer to ${target}.`,
        rule: "Too big → Step Right backward",
        vars: [
          { label: "left", value: `${left} (${nums[left]})` },
          { label: "right", value: `${right} → ${right - 1}`, highlight: true },
          { label: "sum", value: String(sum) },
          { label: "goal", value: String(target) },
        ],
        arr: nums,
        targetVal: target,
        left,
        right,
        matchedPair: null,
      });
      right -= 1;
    }
  }
  return steps;
}

function buildSlidingWindowSteps(nums: number[], k: number): AlgoStep[] {
  const steps: AlgoStep[] = [];
  let winSum = 0;
  for (let i = 0; i < k; i++) winSum += nums[i];
  let bestSum = winSum;
  let bestStart = 0;
  let bestEnd = k - 1;

  steps.push({
    title: `Step 1: Build First Frame [0..${k - 1}] → Total = ${winSum}`,
    explanation: `Add the first ${k} items (${nums.slice(0, k).join(" + ")}) = ${winSum}. Save ${winSum} as our best total so far.`,
    rule: `Add first ${k} items to start`,
    vars: [
      { label: "frame", value: `[0..${k - 1}]` },
      { label: "current", value: String(winSum), highlight: true },
      { label: "best", value: String(bestSum), highlight: true },
    ],
    arr: nums,
    winStart: 0,
    winEnd: k - 1,
    bestStart,
    bestEnd,
    winSum,
    bestSum,
    droppedVal: null,
    addedVal: null,
    isNewBest: true,
  });

  for (let end = k; end < nums.length; end++) {
    const start = end - k + 1;
    const dropped = nums[start - 1];
    const added = nums[end];
    winSum = winSum - dropped + added;
    const isNewBest = winSum > bestSum;
    if (isNewBest) {
      bestSum = winSum;
      bestStart = start;
      bestEnd = end;
    }

    steps.push({
      title: `Slide to [${start}..${end}]: Drop ${dropped}, Add ${added} → ${winSum}`,
      explanation: `Reuse the previous total: subtract ${dropped} leaving on the left and add ${added} entering on the right = ${winSum}. ${isNewBest ? `New best = ${bestSum}!` : `Best stays ${bestSum}.`}`,
      rule: "Subtract old left, add new right",
      vars: [
        { label: "frame", value: `[${start}..${end}]` },
        { label: "change", value: `-${dropped} +${added}` },
        { label: "current", value: String(winSum), highlight: isNewBest },
        { label: "best", value: String(bestSum), highlight: true },
      ],
      arr: nums,
      winStart: start,
      winEnd: end,
      bestStart,
      bestEnd,
      winSum,
      bestSum,
      droppedVal: dropped,
      addedVal: added,
      isNewBest,
    });
  }

  steps.push({
    title: `Done! Best Frame [${bestStart}..${bestEnd}] = ${bestSum} ✓`,
    explanation: `We checked all ${nums.length - k + 1} frames in one smooth pass. Highest total of ${k} side-by-side numbers is ${bestSum}.`,
    rule: "One pass complete → Return best total",
    vars: [
      { label: "best_frame", value: `[${bestStart}..${bestEnd}]`, highlight: true },
      { label: "best_total", value: String(bestSum), highlight: true },
    ],
    arr: nums,
    winStart: bestStart,
    winEnd: bestEnd,
    bestStart,
    bestEnd,
    winSum: bestSum,
    bestSum,
    droppedVal: null,
    addedVal: null,
    isNewBest: true,
  });
  return steps;
}

function buildBubbleSortSteps(initial: number[]): AlgoStep[] {
  const arr = [...initial];
  const n = arr.length;
  const steps: AlgoStep[] = [
    {
      title: `Start: ${n} Unsorted Bars`,
      explanation: `Bubble Sort compares two neighbors at a time from left to right. Whenever the left bar is taller than the right bar, they swap places.`,
      rule: "Compare neighbors left to right",
      vars: [
        { label: "pass", value: "0" },
        { label: "sorted", value: `0/${n}` },
      ],
      arr: [...arr],
      comparePair: null,
      swapped: false,
      sortedFrom: n,
    },
  ];

  for (let i = 0; i < n - 1; i++) {
    let anySwap = false;
    for (let j = 0; j < n - 1 - i; j++) {
      const a = arr[j];
      const b = arr[j + 1];
      const shouldSwap = a > b;
      if (shouldSwap) {
        arr[j] = b;
        arr[j + 1] = a;
        anySwap = true;
      }
      steps.push({
        title: shouldSwap
          ? `Compare ${a} & ${b} → Swap! (${a} > ${b})`
          : `Compare ${a} & ${b} → Keep (${a} ≤ ${b})`,
        explanation: shouldSwap
          ? `${a} is bigger than ${b}, so swap them to push ${a} one step closer to the sorted right side.`
          : `${a} is already smaller or equal to ${b}, so keep both bars where they are.`,
        rule: shouldSwap ? "Left is taller → Swap neighbors" : "Order looks good → Keep as is",
        vars: [
          { label: "pass", value: String(i + 1) },
          { label: "pair", value: `[${j}] & [${j + 1}]`, highlight: true },
          { label: "action", value: shouldSwap ? "SWAP ⇄" : "OK ✓", highlight: shouldSwap },
        ],
        arr: [...arr],
        comparePair: [j, j + 1],
        swapped: shouldSwap,
        sortedFrom: n - i,
      });
    }
    if (!anySwap) break;
  }

  steps.push({
    title: "All Bars Sorted Smallest → Largest ✓",
    explanation: `Every neighbor pair is now in ascending order: [${arr.join(", ")}].`,
    rule: "No swaps needed → List sorted!",
    vars: [
      { label: "sorted", value: `${n}/${n}`, highlight: true },
      { label: "status", value: "DONE ✓", highlight: true },
    ],
    arr: [...arr],
    comparePair: null,
    swapped: false,
    sortedFrom: 0,
  });
  return steps;
}

function buildHashLookupSteps(nums: number[], target: number): AlgoStep[] {
  const steps: AlgoStep[] = [
    {
      title: `Start with Empty Notebook`,
      explanation: `Instead of testing every pair, we walk once left-to-right and jot down each number with its position so we can look up partners instantly.`,
      rule: "Open empty notebook (number → position)",
      vars: [
        { label: "goal", value: String(target), highlight: true },
        { label: "saved", value: "0" },
      ],
      arr: nums,
      targetVal: target,
      activeIdx: -1,
      hashMap: {},
      lookupHit: null,
    },
  ];
  const seen: Record<string, number> = {};

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const need = target - num;

    if (Object.prototype.hasOwnProperty.call(seen, String(need))) {
      const hitIdx = seen[String(need)];
      steps.push({
        title: `Position [${i}] (${num}): Need ${need} → Found at [${hitIdx}]!`,
        explanation: `To add up to ${target} with ${num}, we need ${need}. Checking our notebook finds ${need} right away at position ${hitIdx}! Answer: [${hitIdx}, ${i}].`,
        rule: "Partner is in notebook → Match!",
        vars: [
          { label: "pos", value: String(i) },
          { label: "num", value: String(num) },
          { label: "need", value: String(need), highlight: true },
          { label: "answer", value: `[${hitIdx}, ${i}] ✓`, highlight: true },
        ],
        arr: nums,
        targetVal: target,
        activeIdx: i,
        needVal: need,
        hashMap: { ...seen },
        lookupHit: { need, idx: hitIdx },
      });
      return steps;
    }

    seen[String(num)] = i;
    steps.push({
      title: `Position [${i}] (${num}): Need ${need} (Not Saved Yet → Jot Down ${num})`,
      explanation: `We checked the notebook for ${need} (${target} - ${num}). Not there yet! Save "${num} is at position ${i}" for later numbers.`,
      rule: "Partner missing → Save current number",
      vars: [
        { label: "pos", value: String(i) },
        { label: "num", value: String(num) },
        { label: "need", value: String(need) },
        { label: "saved", value: `${num} → pos ${i}`, highlight: true },
      ],
      arr: nums,
      targetVal: target,
      activeIdx: i,
      needVal: need,
      hashMap: { ...seen },
      lookupHit: null,
    });
  }
  return steps;
}

export const BFS_GRAPH: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["E"],
  D: [],
  E: ["F"],
  F: [],
};

export const BFS_NODE_COORDS: Record<string, { cx: number; cy: number }> = {
  A: { cx: 124, cy: 28 },
  B: { cx: 64, cy: 104 },
  C: { cx: 184, cy: 104 },
  D: { cx: 42, cy: 184 },
  E: { cx: 146, cy: 184 },
  F: { cx: 146, cy: 262 },
};

export const BFS_EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "E"],
  ["E", "F"],
];

export const BFS_HOP_GUIDES: { label: string; cy: number }[] = [
  { label: "0 HOPS", cy: 28 },
  { label: "1 HOP", cy: 104 },
  { label: "2 HOPS", cy: 184 },
  { label: "3 HOPS", cy: 262 },
];

function buildBfsSteps(target: string): AlgoStep[] {
  const steps: AlgoStep[] = [
    {
      title: `Start at Circle "A" — Goal: Reach "${target}"`,
      explanation: `Put start circle "A" first in the waiting line. Shortest Path (BFS) always checks closer circles (1 hop away) before farther ones (2+ hops away).`,
      rule: 'Put start "A" in waiting line',
      vars: [
        { label: "checking", value: "Ready", highlight: false },
        { label: "waiting_line", value: "[A]", highlight: true },
        { label: "goal", value: target },
      ],
      currentNode: null,
      newlyQueued: ["A"],
      queue: ["A"],
      visited: ["A"],
      targetNode: target,
      foundTarget: false,
    },
  ];

  const queue: string[] = ["A"];
  const visited: string[] = ["A"];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === target) {
      steps.push({
        title: `Reached Goal "${target}"! Shortest Path Found ✓`,
        explanation: `"${target}" just stepped out from the front of the waiting line! Because we checked all closer circles first, this is guaranteed the fewest hops.`,
        rule: `Goal "${target}" reached in fewest hops!`,
        vars: [
          { label: "checking", value: node, highlight: true },
          { label: "waiting_line", value: queue.length ? `[${queue.join(", ")}]` : "empty" },
          { label: "result", value: "SHORTEST ✓", highlight: true },
        ],
        currentNode: node,
        newlyQueued: [],
        queue: [...queue],
        visited: [...visited],
        targetNode: target,
        foundTarget: true,
      });
      return steps;
    }

    const neighbors = BFS_GRAPH[node] || [];
    const newlyAdded: string[] = [];
    for (const nb of neighbors) {
      if (!visited.includes(nb)) {
        visited.push(nb);
        queue.push(nb);
        newlyAdded.push(nb);
      }
    }

    steps.push({
      title: newlyAdded.length
        ? `Check "${node}" → Add Neighbors [${newlyAdded.join(", ")}] to Line`
        : `Check "${node}" → No New Neighbors`,
      explanation: newlyAdded.length
        ? `Take "${node}" from the front of the line. Follow its connecting lines (${neighbors.join(", ")}) and add unseen ${newlyAdded.join(" & ")} to the back of the line.`
        : `Take "${node}" from the front of the line. Every connected circle is already checked or there are none left, so move to the next one in line.`,
      rule: newlyAdded.length
        ? `Check "${node}" → Add ${newlyAdded.join(", ")} to back of line`
        : `Check "${node}" → Nothing new, continue`,
      vars: [
        { label: "checking", value: node, highlight: true },
        { label: "added", value: newlyAdded.join(", ") || "none" },
        { label: "waiting_line", value: queue.length ? `[${queue.join(", ")}]` : "empty", highlight: true },
      ],
      currentNode: node,
      newlyQueued: newlyAdded,
      queue: [...queue],
      visited: [...visited],
      targetNode: target,
      foundTarget: false,
    });
  }
  return steps;
}

export const ALGORITHMS: AlgoMeta[] = [
  {
    id: "binary_search",
    name: "Binary Search",
    category: "SMART GUESSING",
    speedLabel: "Very Fast",
    memoryLabel: "Tiny",
    accent: StudioColors.yellow,
    intro:
      "Like finding a word in a dictionary: check the middle item, then throw away the entire half where your target cannot be.",
    presets: [
      { label: "Find 48", build: () => buildBinarySearchSteps([3, 9, 14, 21, 35, 48, 62, 77, 90], 48) },
      { label: "Find 14", build: () => buildBinarySearchSteps([3, 9, 14, 21, 35, 48, 62, 77, 90], 14) },
      { label: "Missing 50", build: () => buildBinarySearchSteps([3, 9, 14, 21, 35, 48, 62, 77, 90], 50) },
    ],
  },
  {
    id: "two_pointers",
    name: "Two Pointers",
    category: "MEET IN THE MIDDLE",
    speedLabel: "1 Pass",
    memoryLabel: "Tiny",
    accent: StudioColors.mint,
    intro:
      "Place one finger at the start and one at the end of a sorted list, then walk them inward depending on whether the sum is too small or too big.",
    presets: [
      { label: "Target 10", build: () => buildTwoPointersSteps([1, 3, 4, 6, 8, 11, 14], 10) },
      { label: "Target 15", build: () => buildTwoPointersSteps([2, 4, 5, 7, 10, 12], 15) },
    ],
  },
  {
    id: "sliding_window",
    name: "Sliding Window",
    category: "MOVING FRAME",
    speedLabel: "1 Pass",
    memoryLabel: "Tiny",
    accent: StudioColors.lime,
    intro:
      "Slide a fixed frame of k items across a list—each move simply subtracts the outgoing item and adds the new item instead of re-adding everything.",
    presets: [
      { label: "[2,1,5,1,3,2,6] k=3", build: () => buildSlidingWindowSteps([2, 1, 5, 1, 3, 2, 6], 3) },
      { label: "[4,2,1,7,8,1,2] k=3", build: () => buildSlidingWindowSteps([4, 2, 1, 7, 8, 1, 2], 3) },
    ],
  },
  {
    id: "bubble_sort",
    name: "Bubble Sort",
    category: "PAIR SWAPPING",
    speedLabel: "Simple Steps",
    memoryLabel: "Tiny",
    accent: StudioColors.coral,
    intro:
      "Walk through neighboring pairs and swap any pair that is out of order—step by step, bigger bars float to the right side.",
    presets: [
      { label: "Mixed [32,14,48,9,25]", build: () => buildBubbleSortSteps([32, 14, 48, 9, 25]) },
      { label: "Reversed [45,34,24,15,6]", build: () => buildBubbleSortSteps([45, 34, 24, 15, 6]) },
    ],
  },
  {
    id: "hash_lookup",
    name: "Quick Lookup (Two Sum)",
    category: "MEMORY NOTEBOOK",
    speedLabel: "Instant Match",
    memoryLabel: "Small Notebook",
    accent: StudioColors.violet,
    intro:
      "Save every number you see into a quick notebook so when its missing partner arrives later, you match them right away.",
    presets: [
      { label: "[4,8,2,11,7] → 9", build: () => buildHashLookupSteps([4, 8, 2, 11, 7], 9) },
      { label: "[3,5,1,9,4] → 10", build: () => buildHashLookupSteps([3, 5, 1, 9, 4], 10) },
    ],
  },
  {
    id: "bfs_graph",
    name: "Shortest Path (BFS)",
    category: "RIPPLE SEARCH",
    speedLabel: "Fewest Hops",
    memoryLabel: "Waiting Line",
    accent: StudioColors.pink,
    intro:
      "Explore a connected map ripple-by-ripple—check every 1-hop neighbor before moving to 2-hop neighbors using a simple waiting line.",
    presets: [
      { label: 'Reach "F" (3 Hops)', build: () => buildBfsSteps("F") },
      { label: 'Reach "E" (2 Hops)', build: () => buildBfsSteps("E") },
    ],
  },
  {
    id: "recursion_stack",
    name: "Recursion & Call Stack",
    category: "STACK & MEMO",
    speedLabel: "Depth O(n)",
    memoryLabel: "Call Frames",
    accent: StudioColors.orange,
    intro:
      "Every recursive call pauses its parent on a stack of frames until a base case returns—then frames unwind and multiply back up.",
    presets: [
      { label: "Factorial(4)", build: () => buildFactorialRecursionSteps(4) },
      { label: "Fib(4) + Memo", build: () => buildFibMemoSteps() },
    ],
  },
  {
    id: "min_heap",
    name: "Min-Heap Priority Queue",
    category: "HEAPIFY / TOP-K",
    speedLabel: "O(log n) Push/Pop",
    memoryLabel: "Compact Tree",
    accent: StudioColors.lime,
    intro:
      "Keep the smallest value pinned at index 0 by storing a complete binary tree inside a flat array and bubbling elements up or down.",
    presets: [
      { label: "Insert [14,9,22,5,11]", build: () => buildMinHeapInsertSteps([14, 9, 22, 5, 11]) },
      { label: "Pop Min Twice", build: () => buildMinHeapPopSteps([5, 9, 22, 14, 11]) },
    ],
  },
  {
    id: "dp_table",
    name: "Dynamic Programming Grid",
    category: "DP TABLE / SUBPROBLEMS",
    speedLabel: "Avoid Rework",
    memoryLabel: "Tabulation Grid",
    accent: StudioColors.yellow,
    intro:
      "Solve small subproblems once and cache them in a grid so bigger choices combine proven answers instead of guessing blindly.",
    presets: [
      { label: "0/1 Knapsack (Cap 5)", build: () => buildKnapsackDpSteps() },
      { label: "Coin Change [1,3,4]→6", build: () => buildCoinChangeDpSteps([1, 3, 4], 6) },
    ],
  },
  {
    id: "system_design",
    name: "System Design Flow",
    category: "DISTRIBUTED ARCHITECTURE",
    speedLabel: "3ms Cache Hit",
    memoryLabel: "Edge + Replica",
    accent: StudioColors.mint,
    intro:
      "Trace live traffic across Load Balancers, Redis Caches, Token-Bucket Rate Limiters, and Database Read Replicas under load.",
    presets: [
      { label: "Read-Through Cache", build: () => buildCacheFlowSteps() },
      { label: "Rate Limit & Failover", build: () => buildRateLimitFailoverSteps() },
    ],
  },
];

export function supportsCustomArrayInput(algoId: AlgoId): boolean {
  return (
    algoId === "binary_search" ||
    algoId === "two_pointers" ||
    algoId === "sliding_window" ||
    algoId === "bubble_sort" ||
    algoId === "hash_lookup" ||
    algoId === "min_heap"
  );
}

export function buildCustomAlgoSteps(
  algoId: AlgoId,
  rawNums: number[],
  targetOrK: number,
): AlgoStep[] | null {
  if (rawNums.length < 4) return null;
  if (algoId === "binary_search") {
    const sorted = [...rawNums].sort((a, b) => a - b);
    return buildBinarySearchSteps(sorted, targetOrK);
  }
  if (algoId === "two_pointers") {
    const sorted = [...rawNums].sort((a, b) => a - b);
    return buildTwoPointersSteps(sorted, targetOrK);
  }
  if (algoId === "sliding_window") {
    const k = Math.max(2, Math.min(rawNums.length - 1, Math.round(targetOrK) || 3));
    return buildSlidingWindowSteps(rawNums, k);
  }
  if (algoId === "bubble_sort") {
    return buildBubbleSortSteps(rawNums.slice(0, 8));
  }
  if (algoId === "hash_lookup") {
    return buildHashLookupSteps(rawNums.slice(0, 9), targetOrK);
  }
  if (algoId === "min_heap") {
    return buildMinHeapInsertSteps(rawNums.slice(0, 7));
  }
  return null;
}

