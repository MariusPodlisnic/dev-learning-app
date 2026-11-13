import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { playKeyClick, playVictoryFanfare } from "../utils/soundEffects";

export type AlgoId =
  | "binary_search"
  | "two_pointers"
  | "sliding_window"
  | "bubble_sort"
  | "hash_lookup"
  | "bfs_graph";

interface AlgoStep {
  title: string;
  explanation: string;
  rule: string;
  vars: { label: string; value: string; highlight?: boolean }[];
  arr?: number[];
  targetVal?: number;
  lo?: number;
  hi?: number;
  mid?: number | null;
  foundIdx?: number | null;
  left?: number;
  right?: number;
  matchedPair?: [number, number] | null;
  winStart?: number;
  winEnd?: number;
  bestStart?: number;
  bestEnd?: number;
  winSum?: number;
  bestSum?: number;
  droppedVal?: number | null;
  addedVal?: number | null;
  isNewBest?: boolean;
  comparePair?: [number, number] | null;
  swapped?: boolean;
  sortedFrom?: number;
  activeIdx?: number;
  needVal?: number;
  hashMap?: Record<string, number>;
  lookupHit?: { need: number; idx: number } | null;
  currentNode?: string | null;
  newlyQueued?: string[];
  queue?: string[];
  visited?: string[];
  targetNode?: string;
  foundTarget?: boolean;
}

interface AlgoMeta {
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

const BFS_GRAPH: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["E"],
  D: [],
  E: ["F"],
  F: [],
};

const BFS_NODE_COORDS: Record<string, { cx: number; cy: number }> = {
  A: { cx: 124, cy: 28 },
  B: { cx: 64, cy: 104 },
  C: { cx: 184, cy: 104 },
  D: { cx: 42, cy: 184 },
  E: { cx: 146, cy: 184 },
  F: { cx: 146, cy: 262 },
};

const BFS_EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "E"],
  ["E", "F"],
];

const BFS_HOP_GUIDES: { label: string; cy: number }[] = [
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

const ALGORITHMS: AlgoMeta[] = [
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
];

function PointerBadge({
  label,
  bg,
  textColor,
}: {
  label: string;
  bg: string;
  textColor: string;
}) {
  return (
    <View style={[styles.pointerPill, { backgroundColor: bg }]}>
      <Text style={[styles.pointerPillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function AnimatedTile({
  active = false,
  dimmed = false,
  style,
  children,
}: {
  active?: boolean;
  dimmed?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(active ? 1.07 : dimmed ? 0.94 : 1));
  const [liftAnim] = useState(() => new Animated.Value(active ? -4 : 0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1.07 : dimmed ? 0.94 : 1,
        friction: 6,
        tension: 140,
        useNativeDriver: false,
      }),
      Animated.spring(liftAnim, {
        toValue: active ? -4 : 0,
        friction: 6,
        tension: 140,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active, dimmed, scaleAnim, liftAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function AnimatedBarItem({
  heightPx,
  active,
  swapped,
  style,
  children,
}: {
  heightPx: number;
  active: boolean;
  swapped: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const [heightAnim] = useState(() => new Animated.Value(heightPx));
  const [liftAnim] = useState(() => new Animated.Value(active ? -6 : 0));
  const [scaleAnim] = useState(() => new Animated.Value(swapped ? 1.07 : active ? 1.03 : 1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: heightPx,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(liftAnim, {
        toValue: active ? -6 : 0,
        friction: 6,
        tension: 130,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: swapped ? 1.07 : active ? 1.03 : 1,
        friction: 5,
        tension: 140,
        useNativeDriver: false,
      }),
    ]).start();
  }, [heightPx, active, swapped, heightAnim, liftAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          height: heightAnim,
          transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function AnimatedGraphCircle({
  active,
  queued,
  found,
  style,
  children,
}: {
  active: boolean;
  queued: boolean;
  found: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const targetScale = found ? 1.14 : active ? 1.1 : queued ? 1.04 : 1;
  const [scaleAnim] = useState(() => new Animated.Value(targetScale));

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: targetScale,
      friction: 5,
      tension: 145,
      useNativeDriver: false,
    }).start();
  }, [targetScale, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface AlgorithmVisualizerLabProps {
  isPremium: boolean;
  onRequirePro: () => void;
  onBackToMap: () => void;
}

export default function AlgorithmVisualizerLab({
  isPremium,
  onRequirePro,
  onBackToMap,
}: AlgorithmVisualizerLabProps) {
  const [selectedAlgoIdx, setSelectedAlgoIdx] = useState<number>(0);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Default to a calm, readable 2.8s pace so learners have time to read between iterations
  const [speedMs, setSpeedMs] = useState<number>(2800);

  const activeAlgo = ALGORITHMS[selectedAlgoIdx] || ALGORITHMS[0];
  const activePreset =
    activeAlgo.presets[selectedPresetIdx] || activeAlgo.presets[0];

  const steps = useMemo(() => activePreset.build(), [activePreset]);
  const safeStepIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const step = steps[safeStepIdx];
  const isLastStep = safeStepIdx >= steps.length - 1;

  const [popAnim] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [beatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    popAnim.setValue(0.965);
    Animated.spring(popAnim, {
      toValue: 1,
      friction: 6,
      tension: 110,
      useNativeDriver: false,
    }).start();

    const pct = steps.length > 1 ? safeStepIdx / (steps.length - 1) : 1;
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [safeStepIdx, steps.length, selectedAlgoIdx, selectedPresetIdx, popAnim, progressAnim]);

  useEffect(() => {
    if (!isPlaying) {
      pulseAnim.setValue(1);
      beatAnim.setValue(0);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    );
    pulseLoop.start();

    beatAnim.setValue(0);
    const beatTiming = Animated.timing(beatAnim, {
      toValue: 1,
      duration: speedMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    beatTiming.start();

    return () => {
      pulseLoop.stop();
      beatTiming.stop();
    };
  }, [isPlaying, safeStepIdx, speedMs, pulseAnim, beatAnim]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          playVictoryFanfare();
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [isPlaying, speedMs, steps.length]);

  function selectAlgo(idx: number) {
    playKeyClick();
    setIsPlaying(false);
    setSelectedAlgoIdx(idx);
    setSelectedPresetIdx(0);
    setStepIdx(0);
  }

  function selectPreset(idx: number) {
    playKeyClick();
    setIsPlaying(false);
    setSelectedPresetIdx(idx);
    setStepIdx(0);
  }

  function handleNext() {
    playKeyClick();
    setIsPlaying(false);
    if (safeStepIdx >= steps.length - 1) {
      setStepIdx(0);
    } else {
      setStepIdx(safeStepIdx + 1);
    }
  }

  function handlePrev() {
    playKeyClick();
    setIsPlaying(false);
    setStepIdx(Math.max(0, safeStepIdx - 1));
  }

  function handleTogglePlay() {
    playKeyClick();
    if (!isPlaying && isLastStep) {
      setStepIdx(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }

  if (!isPremium) {
    return (
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
      >
        <View style={styles.lockHeroCard}>
          <View style={styles.lockTopRow}>
            <View style={styles.proSticker}>
              <Text style={styles.proStickerText}>★ PRO ONLY LAB</Text>
            </View>
            <Pressable style={styles.backBtn} onPress={onBackToMap}>
              <Text style={styles.backBtnText}>← SKILL MAP</Text>
            </Pressable>
          </View>

          <Text style={styles.lockTitle}>
            Interactive Algorithm Visualizer Lab
          </Text>
          <Text style={styles.lockDesc}>
            Watch the most-used interview algorithms execute visually with calm
            step pauses, animated pointers, sorting bars, hash buckets, and
            beginner-friendly explanations.
          </Text>

          <View style={styles.lockGrid}>
            {ALGORITHMS.map((algo) => (
              <View key={algo.id} style={styles.lockPreviewCard}>
                <View
                  style={[styles.lockCatPill, { backgroundColor: algo.accent }]}
                >
                  <Text style={styles.lockCatText}>{algo.category}</Text>
                </View>
                <Text style={styles.lockAlgoName}>{algo.name}</Text>
                <Text style={styles.lockAlgoMeta}>
                  ⚡ {algo.speedLabel} · 💾 {algo.memoryLabel}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.unlockCtaBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onRequirePro();
            }}
          >
            <Text style={styles.unlockCtaText}>★ UNLOCK PRO ALGO LAB →</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const beatWidth = beatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScrollView
      style={styles.pageScroll}
      contentContainerStyle={styles.pageContent}
    >
      {/* Top Hero Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadgeGroup}>
            <View style={styles.proSticker}>
              <Text style={styles.proStickerText}>★ PRO VISUAL LAB</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{activeAlgo.category}</Text>
            </View>
          </View>
          <Pressable style={styles.backBtn} onPress={onBackToMap}>
            <Text style={styles.backBtnText}>← SKILL MAP</Text>
          </Pressable>
        </View>

        <Text style={styles.heroTitle}>{activeAlgo.name}</Text>

        {/* Compact Brief Introduction Strip */}
        <View
          style={[
            styles.introBanner,
            { borderLeftColor: activeAlgo.accent },
          ]}
        >
          <Text style={styles.introTag}>💡 QUICK INTRO</Text>
          <Text style={styles.introText}>{activeAlgo.intro}</Text>
        </View>

        {/* Algorithm Selector Pills */}
        <View style={styles.algoTabsWrap}>
          {ALGORITHMS.map((algo, idx) => {
            const isSelected = idx === selectedAlgoIdx;
            return (
              <Pressable
                key={algo.id}
                style={[
                  styles.algoTab,
                  isSelected && {
                    backgroundColor: algo.accent,
                    borderColor: StudioColors.ink,
                    ...HardShadowSm,
                  },
                ]}
                onPress={() => selectAlgo(idx)}
              >
                <Text
                  style={[
                    styles.algoTabText,
                    isSelected && styles.algoTabTextActive,
                  ]}
                >
                  {algo.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Main Stage Card */}
      <View style={styles.stageCard}>
        <View style={styles.stageHeader}>
          <View style={styles.presetRow}>
            <Text style={styles.microLabel}>INPUT:</Text>
            {activeAlgo.presets.map((p, idx) => {
              const isActive = idx === selectedPresetIdx;
              return (
                <Pressable
                  key={p.label}
                  style={[styles.presetPill, isActive && styles.presetPillActive]}
                  onPress={() => selectPreset(idx)}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      isActive && styles.presetPillTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.bigOGroup}>
            <View style={styles.bigOPill}>
              <Text style={styles.bigOText}>⚡ {activeAlgo.speedLabel}</Text>
            </View>
            <View style={styles.bigOPill}>
              <Text style={styles.bigOText}>💾 {activeAlgo.memoryLabel}</Text>
            </View>
          </View>
        </View>

        {/* Animated Progress Rail + Inter-Iteration Pause Timer */}
        <View style={styles.progressTrackWrap}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: activeAlgo.accent },
              ]}
            />
          </View>
          <View style={styles.progressMetaRow}>
            <Text style={styles.stepLabelText}>
              STEP {safeStepIdx + 1} / {steps.length}
            </Text>
            {isPlaying ? (
              <View style={styles.liveBadge}>
                <Animated.View
                  style={[styles.liveDot, { opacity: pulseAnim }]}
                />
                <Text style={styles.liveText}>
                  READING PAUSE · {(speedMs / 1000).toFixed(1)}s
                </Text>
              </View>
            ) : (
              <Text style={styles.paceHintText}>
                Pace: {(speedMs / 1000).toFixed(1)}s / step
              </Text>
            )}
          </View>
          {isPlaying && (
            <View style={styles.beatTrack}>
              <Animated.View
                style={[styles.beatFill, { width: beatWidth }]}
              />
            </View>
          )}
        </View>

        {/* Visual Canvas Area */}
        <Animated.View
          style={[styles.canvasBox, { transform: [{ scale: popAnim }] }]}
        >
          {/* 1. BINARY SEARCH CANVAS — SORTED STEPPING STONES + MIDDLE CHOP */}
          {activeAlgo.id === "binary_search" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.legendGoalRow}>
                <View style={styles.bfsLegendRow}>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                    <Text style={styles.legendText}>Checking Mid</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.violet }]} />
                    <Text style={styles.legendText}>Search Zone</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.surface }]} />
                    <Text style={styles.legendText}>Crossed Out</Text>
                  </View>
                </View>
                {step.targetVal !== undefined && (
                  <View style={styles.goalGoalBadge}>
                    <Text style={styles.goalGoalText}>🎯 FIND {step.targetVal}</Text>
                  </View>
                )}
              </View>

              <View style={styles.arrayRowWrap}>
                {(() => {
                  const maxVal = Math.max(...step.arr, 1);
                  return step.arr.map((val, idx) => {
                    const inRange =
                      step.lo !== undefined &&
                      step.hi !== undefined &&
                      idx >= step.lo &&
                      idx <= step.hi;
                    const isMid = step.mid === idx;
                    const isFound = step.foundIdx === idx;
                    const isLo = idx === step.lo;
                    const isHi = idx === step.hi;
                    const isHighlighted = isMid || isFound;
                    const sortedBarPct = Math.max(16, Math.round((val / maxVal) * 100));

                    let pointerEl: React.ReactNode = <View style={styles.pointerSpacer} />;
                    if (isFound) {
                      pointerEl = (
                        <PointerBadge
                          label="✓ FOUND"
                          bg={StudioColors.ink}
                          textColor={StudioColors.lime}
                        />
                      );
                    } else if (isMid) {
                      const midLabel =
                        isLo && isHi
                          ? "▸ MID ◂"
                          : isLo
                            ? "START · ▲ MID"
                            : isHi
                              ? "▲ MID · END"
                              : "▲ MID";
                      pointerEl = (
                        <PointerBadge
                          label={midLabel}
                          bg={StudioColors.ink}
                          textColor={StudioColors.yellow}
                        />
                      );
                    } else if (isLo && isHi) {
                      pointerEl = (
                        <PointerBadge
                          label="▸ ONLY 1 ◂"
                          bg={StudioColors.lime}
                          textColor={StudioColors.ink}
                        />
                      );
                    } else if (isLo) {
                      pointerEl = (
                        <PointerBadge
                          label="START ▸"
                          bg={StudioColors.violet}
                          textColor={StudioColors.ink}
                        />
                      );
                    } else if (isHi) {
                      pointerEl = (
                        <PointerBadge
                          label="◂ END"
                          bg={StudioColors.pink}
                          textColor={StudioColors.ink}
                        />
                      );
                    }

                    return (
                      <AnimatedTile
                        key={idx}
                        active={isHighlighted}
                        dimmed={!inRange && !isFound}
                        style={[
                          styles.arrayCell,
                          !inRange && !isFound && styles.arrayCellDim,
                          isLo && !isHighlighted && styles.arrayCellLoBorder,
                          isHi && !isHighlighted && styles.arrayCellHiBorder,
                          isMid && styles.arrayCellYellow,
                          isFound && styles.arrayCellMint,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cellIndex,
                            isHighlighted && styles.inkMutedText,
                          ]}
                        >
                          [{idx}]
                        </Text>
                        <Text
                          style={[
                            styles.cellVal,
                            isHighlighted && styles.inkText,
                          ]}
                        >
                          {val}
                        </Text>
                        <View style={styles.sortedMeterTrack}>
                          <View
                            style={[
                              styles.sortedMeterFill,
                              {
                                width: `${sortedBarPct}%`,
                                backgroundColor: isHighlighted
                                  ? StudioColors.ink
                                  : StudioColors.violet,
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.pointerSlot}>{pointerEl}</View>
                      </AnimatedTile>
                    );
                  });
                })()}
              </View>

              <View
                style={[
                  styles.visualDecisionStrip,
                  step.foundIdx !== null && step.foundIdx !== undefined && styles.decisionStripLime,
                ]}
              >
                <Text
                  style={[
                    styles.decisionStripText,
                    step.foundIdx !== null && step.foundIdx !== undefined && styles.inkText,
                  ]}
                >
                  {step.foundIdx !== null && step.foundIdx !== undefined
                    ? `🎉 Middle (${step.arr[step.foundIdx]}) equals ${step.targetVal} → Found!`
                    : step.mid !== null &&
                        step.mid !== undefined &&
                        step.targetVal !== undefined
                      ? step.arr[step.mid] < step.targetVal
                        ? `Mid ${step.arr[step.mid]} < ${step.targetVal} (too small) → Chop LEFT half ✕`
                        : `Mid ${step.arr[step.mid]} > ${step.targetVal} (too big) → Chop RIGHT half ✕`
                      : step.lo !== undefined && step.hi !== undefined && step.lo > step.hi
                        ? `Search zone is empty → ${step.targetVal} is not in this list`
                        : `Sorted ascending list ready — jumping straight to the middle next`}
                </Text>
              </View>
            </View>
          )}

          {/* 2. TWO POINTERS CANVAS — INWARD WALKERS + LIVE ADDITION SCALE */}
          {activeAlgo.id === "two_pointers" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.legendGoalRow}>
                <View style={styles.bfsLegendRow}>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                    <Text style={styles.legendText}>Left Finger</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                    <Text style={styles.legendText}>Right Finger</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.surface }]} />
                    <Text style={styles.legendText}>Ruled Out</Text>
                  </View>
                </View>
                {step.targetVal !== undefined && (
                  <View style={styles.goalGoalBadge}>
                    <Text style={styles.goalGoalText}>🎯 SUM = {step.targetVal}</Text>
                  </View>
                )}
              </View>

              <View style={styles.arrayRowWrap}>
                {step.arr.map((val, idx) => {
                  const isL = idx === step.left;
                  const isR = idx === step.right;
                  const inSpan =
                    step.left !== undefined &&
                    step.right !== undefined &&
                    idx >= step.left &&
                    idx <= step.right;
                  const isMatched =
                    step.matchedPair &&
                    (idx === step.matchedPair[0] || idx === step.matchedPair[1]);
                  const isHighlighted = isL || isR || Boolean(isMatched);

                  let pointerEl: React.ReactNode = <View style={styles.pointerSpacer} />;
                  if (isMatched) {
                    pointerEl = (
                      <PointerBadge
                        label="✓ PAIR"
                        bg={StudioColors.ink}
                        textColor={StudioColors.lime}
                      />
                    );
                  } else if (isL) {
                    pointerEl = (
                      <PointerBadge
                        label="LEFT ▸"
                        bg={StudioColors.ink}
                        textColor={StudioColors.yellow}
                      />
                    );
                  } else if (isR) {
                    pointerEl = (
                      <PointerBadge
                        label="◂ RIGHT"
                        bg={StudioColors.ink}
                        textColor={StudioColors.mint}
                      />
                    );
                  }

                  return (
                    <AnimatedTile
                      key={idx}
                      active={isHighlighted}
                      dimmed={!inSpan && !isMatched}
                      style={[
                        styles.arrayCell,
                        !inSpan && !isMatched && styles.arrayCellDim,
                        isL && styles.arrayCellYellow,
                        isR && styles.arrayCellMint,
                        isMatched && styles.arrayCellLime,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellIndex,
                          isHighlighted && styles.inkMutedText,
                        ]}
                      >
                        [{idx}]
                      </Text>
                      <Text
                        style={[
                          styles.cellVal,
                          isHighlighted && styles.inkText,
                        ]}
                      >
                        {val}
                      </Text>
                      <View style={styles.pointerSlot}>{pointerEl}</View>
                    </AnimatedTile>
                  );
                })}
              </View>

              {step.left !== undefined &&
                step.right !== undefined &&
                step.targetVal !== undefined && (() => {
                  const lVal = step.arr[step.left];
                  const rVal = step.arr[step.right];
                  const sum = lVal + rVal;
                  const hit = sum === step.targetVal;
                  const tooSmall = sum < step.targetVal;
                  return (
                    <View
                      style={[
                        styles.visualDecisionStrip,
                        hit && styles.decisionStripLime,
                      ]}
                    >
                      <Text
                        style={[
                          styles.equationHeadline,
                          hit && styles.inkText,
                        ]}
                      >
                        {lVal} + {rVal} = {sum}  ·  Goal: {step.targetVal}
                      </Text>
                      <Text
                        style={[
                          styles.decisionStripText,
                          hit && styles.inkText,
                        ]}
                      >
                        {hit
                          ? "🎉 Exact Match! Both fingers found the pair!"
                          : tooSmall
                            ? `Too Small (${sum} < ${step.targetVal}) → Step LEFT finger right ▸`
                            : `Too Big (${sum} > ${step.targetVal}) → Step RIGHT finger left ◂`}
                      </Text>
                    </View>
                  );
                })()}
            </View>
          )}

          {/* 3. SLIDING WINDOW CANVAS — SPOTLIGHT FRAME + SCOREBOARD */}
          {activeAlgo.id === "sliding_window" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.bfsLegendRow}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                  <Text style={styles.legendText}>Inside Frame</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.coral }]} />
                  <Text style={styles.legendText}>Slid Out (-)</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.lime }]} />
                  <Text style={styles.legendText}>Best Record 🏆</Text>
                </View>
              </View>

              <View style={styles.arrayRowWrap}>
                {step.arr.map((val, idx) => {
                  const inWin =
                    step.winStart !== undefined &&
                    step.winEnd !== undefined &&
                    idx >= step.winStart &&
                    idx <= step.winEnd;
                  const justDropped =
                    step.droppedVal !== null &&
                    step.droppedVal !== undefined &&
                    step.winStart !== undefined &&
                    idx === step.winStart - 1;
                  const justAdded =
                    step.addedVal !== null &&
                    step.addedVal !== undefined &&
                    idx === step.winEnd;

                  let pointerEl: React.ReactNode = <View style={styles.pointerSpacer} />;
                  if (justDropped) {
                    pointerEl = (
                      <PointerBadge
                        label={`-${val} OUT`}
                        bg={StudioColors.coral}
                        textColor={StudioColors.ink}
                      />
                    );
                  } else if (justAdded) {
                    pointerEl = (
                      <PointerBadge
                        label={`+${val} IN`}
                        bg={StudioColors.lime}
                        textColor={StudioColors.ink}
                      />
                    );
                  } else if (idx === step.winStart) {
                    pointerEl = (
                      <PointerBadge
                        label="[ START"
                        bg={StudioColors.ink}
                        textColor={StudioColors.lime}
                      />
                    );
                  } else if (idx === step.winEnd) {
                    pointerEl = (
                      <PointerBadge
                        label="END ]"
                        bg={StudioColors.ink}
                        textColor={StudioColors.lime}
                      />
                    );
                  } else if (inWin) {
                    pointerEl = (
                      <PointerBadge
                        label="FRAME"
                        bg={StudioColors.ink}
                        textColor={StudioColors.yellow}
                      />
                    );
                  }

                  return (
                    <AnimatedTile
                      key={idx}
                      active={inWin}
                      dimmed={!inWin && !justDropped}
                      style={[
                        styles.arrayCell,
                        inWin
                          ? step.isNewBest
                            ? styles.arrayCellLime
                            : styles.arrayCellYellow
                          : justDropped
                            ? styles.arrayCellDropped
                            : styles.arrayCellDim,
                      ]}
                    >
                      <Text
                        style={[styles.cellIndex, inWin && styles.inkMutedText]}
                      >
                        [{idx}]
                      </Text>
                      <Text style={[styles.cellVal, inWin && styles.inkText]}>
                        {val}
                      </Text>
                      <View style={styles.pointerSlot}>{pointerEl}</View>
                    </AnimatedTile>
                  );
                })}
              </View>

              {step.winSum !== undefined && step.bestSum !== undefined && (
                <View style={styles.scoreboardRow}>
                  <View style={styles.scoreCard}>
                    <Text style={styles.scoreCardLabel}>CURRENT FRAME</Text>
                    <Text style={styles.scoreCardVal}>{step.winSum}</Text>
                    {step.droppedVal !== null &&
                    step.droppedVal !== undefined &&
                    step.addedVal !== null &&
                    step.addedVal !== undefined ? (
                      <Text style={styles.scoreCardHint}>
                        Drop {step.droppedVal} · Add {step.addedVal}
                      </Text>
                    ) : (
                      <Text style={styles.scoreCardHint}>Initial total</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.scoreCard,
                      step.isNewBest && styles.scoreCardBestHighlight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreCardLabel,
                        step.isNewBest && styles.inkMutedText,
                      ]}
                    >
                      🏆 BEST RECORD
                    </Text>
                    <Text
                      style={[
                        styles.scoreCardVal,
                        step.isNewBest && styles.inkText,
                      ]}
                    >
                      {step.bestSum}
                    </Text>
                    <Text
                      style={[
                        styles.scoreCardHint,
                        step.isNewBest && styles.inkMutedText,
                      ]}
                    >
                      {step.isNewBest ? "New best hit!" : "Record stays"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 4. BUBBLE SORT BAR CHART CANVAS — ANIMATED BARS + PAIR DECISION */}
          {activeAlgo.id === "bubble_sort" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.bfsLegendRow}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                  <Text style={styles.legendText}>Checking Pair</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.coral }]} />
                  <Text style={styles.legendText}>Swapped ⇄</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                  <Text style={styles.legendText}>Locked In ✓</Text>
                </View>
              </View>

              <View style={styles.barChartWrap}>
                {(() => {
                  const maxVal = Math.max(...step.arr, 1);
                  return step.arr.map((val, idx) => {
                    const isComparing = Boolean(
                      step.comparePair &&
                        (step.comparePair[0] === idx || step.comparePair[1] === idx),
                    );
                    const isSorted =
                      step.sortedFrom !== undefined && idx >= step.sortedFrom;
                    const heightPx = Math.max(28, Math.round((val / maxVal) * 126));

                    return (
                      <View key={idx} style={styles.barCol}>
                        <Text style={styles.barValLabel}>{val}</Text>
                        <AnimatedBarItem
                          heightPx={heightPx}
                          active={isComparing}
                          swapped={isComparing && Boolean(step.swapped)}
                          style={[
                            styles.barRect,
                            isSorted && styles.barSorted,
                            isComparing &&
                              (step.swapped ? styles.barSwapped : styles.barCompare),
                          ]}
                        >
                          <Text
                            style={[
                              styles.barTagText,
                              (isSorted || isComparing) && styles.inkText,
                            ]}
                          >
                            {isComparing
                              ? step.swapped
                                ? "⇄"
                                : "?"
                              : isSorted
                                ? "✓"
                                : ""}
                          </Text>
                        </AnimatedBarItem>
                        <Text style={styles.barIdxLabel}>[{idx}]</Text>
                      </View>
                    );
                  });
                })()}
              </View>

              <View
                style={[
                  styles.visualDecisionStrip,
                  step.sortedFrom === 0 && styles.decisionStripLime,
                ]}
              >
                <Text
                  style={[
                    styles.decisionStripText,
                    step.sortedFrom === 0 && styles.inkText,
                  ]}
                >
                  {step.sortedFrom === 0
                    ? "🎉 Every bar is sorted smallest → largest!"
                    : step.comparePair
                      ? step.swapped
                        ? `Swapped [${step.comparePair[0]}] & [${step.comparePair[1]}] ⇄ — taller bar moved right!`
                        : `Kept [${step.comparePair[0]}] & [${step.comparePair[1]}] ✓ — already in good order`
                      : "Comparing two neighbors at a time from left to right"}
                </Text>
              </View>
            </View>
          )}

          {/* 5. QUICK LOOKUP (TWO SUM) CANVAS — SCANNER + EQUATION + NOTEBOOK */}
          {activeAlgo.id === "hash_lookup" && step.arr && (
            <View style={styles.hashStage}>
              <View style={styles.legendGoalRow}>
                <View style={styles.bfsLegendRow}>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                    <Text style={styles.legendText}>Checking Now</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                    <Text style={styles.legendText}>Partner Match</Text>
                  </View>
                </View>
                {step.targetVal !== undefined && (
                  <View style={styles.goalGoalBadge}>
                    <Text style={styles.goalGoalText}>🎯 SUM = {step.targetVal}</Text>
                  </View>
                )}
              </View>

              <View style={styles.arrayRowWrap}>
                {step.arr.map((val, idx) => {
                  const isCur = step.activeIdx === idx;
                  const isHitPartner = Boolean(
                    step.lookupHit && step.lookupHit.idx === idx,
                  );
                  const alreadyScanned =
                    step.activeIdx !== undefined && idx < step.activeIdx && !isHitPartner;
                  const isHighlighted = isCur || isHitPartner;

                  return (
                    <AnimatedTile
                      key={idx}
                      active={isHighlighted}
                      dimmed={alreadyScanned}
                      style={[
                        styles.arrayCell,
                        alreadyScanned && styles.arrayCellScanned,
                        isCur && styles.arrayCellYellow,
                        isHitPartner && styles.arrayCellMint,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellIndex,
                          isHighlighted && styles.inkMutedText,
                        ]}
                      >
                        [{idx}]
                      </Text>
                      <Text
                        style={[
                          styles.cellVal,
                          isHighlighted && styles.inkText,
                        ]}
                      >
                        {val}
                      </Text>
                      <View style={styles.pointerSlot}>
                        {isCur ? (
                          <PointerBadge
                            label="🔍 NOW"
                            bg={StudioColors.ink}
                            textColor={StudioColors.yellow}
                          />
                        ) : isHitPartner ? (
                          <PointerBadge
                            label="✓ MATCH"
                            bg={StudioColors.ink}
                            textColor={StudioColors.mint}
                          />
                        ) : alreadyScanned ? (
                          <PointerBadge
                            label="SAVED"
                            bg={StudioColors.surface}
                            textColor={StudioColors.textMuted}
                          />
                        ) : (
                          <View style={styles.pointerSpacer} />
                        )}
                      </View>
                    </AnimatedTile>
                  );
                })}
              </View>

              {step.activeIdx !== undefined &&
                step.activeIdx >= 0 &&
                step.targetVal !== undefined &&
                step.needVal !== undefined && (
                  <View
                    style={[
                      styles.visualDecisionStrip,
                      Boolean(step.lookupHit) && styles.decisionStripLime,
                    ]}
                  >
                    <Text
                      style={[
                        styles.equationHeadline,
                        Boolean(step.lookupHit) && styles.inkText,
                      ]}
                    >
                      Goal {step.targetVal} − Current {step.arr[step.activeIdx]} = Need {step.needVal}
                    </Text>
                    <Text
                      style={[
                        styles.decisionStripText,
                        Boolean(step.lookupHit) && styles.inkText,
                      ]}
                    >
                      {step.lookupHit
                        ? `⚡ Instant Hit! ${step.lookupHit.need} was waiting in Notebook at [${step.lookupHit.idx}]!`
                        : `Not in Notebook yet → Save "${step.arr[step.activeIdx]} → [${step.activeIdx}]" and move right`}
                    </Text>
                  </View>
                )}

              <View style={styles.hashBucketsBox}>
                <Text style={styles.microLabel}>NOTEBOOK (NUMBER → POSITION)</Text>
                <View style={styles.hashChipsRow}>
                  {step.hashMap && Object.keys(step.hashMap).length > 0 ? (
                    Object.entries(step.hashMap).map(([k, v]) => {
                      const isHit = Boolean(
                        step.lookupHit && String(step.lookupHit.need) === k,
                      );
                      return (
                        <AnimatedTile
                          key={k}
                          active={isHit}
                          style={[
                            styles.hashChip,
                            isHit && styles.hashChipHit,
                          ]}
                        >
                          <Text
                            style={[
                              styles.hashChipText,
                              isHit && styles.inkText,
                            ]}
                          >
                            {k} → pos [{v}]
                          </Text>
                        </AnimatedTile>
                      );
                    })
                  ) : (
                    <Text style={styles.emptyHashText}>
                      {"Notebook is empty — we'll jot down numbers as we walk"}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* 6. BEGINNER-FRIENDLY BFS CIRCULAR NODE GRAPH & WAITING LINE */}
          {activeAlgo.id === "bfs_graph" && (
            <View style={styles.bfsStage}>
              <View style={styles.bfsLegendRow}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.lime }]} />
                  <Text style={styles.legendText}>Checking Now</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                  <Text style={styles.legendText}>Waiting in Line</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                  <Text style={styles.legendText}>Already Checked</Text>
                </View>
              </View>

              <View style={styles.graphCard}>
                <View style={styles.graphCanvas}>
                  {/* Subtle horizontal hop-distance guide rows */}
                  {BFS_HOP_GUIDES.map((guide, rowIdx) => {
                    const activeRow =
                      (rowIdx === 0 && step.currentNode === "A") ||
                      (rowIdx === 1 && (step.currentNode === "B" || step.currentNode === "C")) ||
                      (rowIdx === 2 && (step.currentNode === "D" || step.currentNode === "E")) ||
                      (rowIdx === 3 && step.currentNode === "F");
                    return (
                      <View
                        key={guide.label}
                        style={[styles.hopGuideRow, { top: guide.cy - 10 }]}
                      >
                        <View
                          style={[
                            styles.hopGuideLine,
                            activeRow && styles.hopGuideLineActive,
                          ]}
                        />
                        <View
                          style={[
                            styles.hopBadge,
                            activeRow && styles.hopBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.hopBadgeText,
                              activeRow && styles.hopBadgeTextActive,
                            ]}
                          >
                            {guide.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* Connecting edge lines between circular nodes */}
                  {BFS_EDGES.map(([from, to]) => {
                    const p1 = BFS_NODE_COORDS[from];
                    const p2 = BFS_NODE_COORDS[to];
                    const dx = p2.cx - p1.cx;
                    const dy = p2.cy - p1.cy;
                    const length = Math.hypot(dx, dy);
                    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
                    const midX = (p1.cx + p2.cx) / 2;
                    const midY = (p1.cy + p2.cy) / 2;

                    const isExploringEdge =
                      step.currentNode === from &&
                      (Boolean(step.newlyQueued?.includes(to)) ||
                        Boolean(step.visited?.includes(to)));
                    const isDiscoveredEdge =
                      Boolean(step.visited?.includes(from)) &&
                      Boolean(step.visited?.includes(to));
                    const thickness = isExploringEdge ? 3.5 : isDiscoveredEdge ? 2.5 : 2;

                    return (
                      <View
                        key={`${from}-${to}`}
                        style={[
                          styles.graphEdge,
                          {
                            left: midX - length / 2,
                            top: midY - thickness / 2,
                            width: length,
                            height: thickness,
                            backgroundColor: isExploringEdge
                              ? StudioColors.lime
                              : isDiscoveredEdge
                                ? StudioColors.mint
                                : StudioColors.border,
                            opacity: isExploringEdge ? 1 : isDiscoveredEdge ? 0.9 : 0.72,
                            transform: [{ rotate: `${angleDeg}deg` }],
                          },
                        ]}
                      />
                    );
                  })}

                  {/* Circular nodes */}
                  {Object.entries(BFS_NODE_COORDS).map(([node, pos]) => {
                    const isCur = step.currentNode === node;
                    const isQueued = Boolean(step.queue?.includes(node));
                    const isVisited = Boolean(step.visited?.includes(node));
                    const isGoal = step.targetNode === node;
                    const isFound = Boolean(step.foundTarget && isCur);
                    const isBright = isCur || isQueued || isVisited || isFound;

                    const statusLabel = isFound
                      ? "FOUND!"
                      : isCur
                        ? "CHECKING"
                        : isQueued
                          ? "WAITING"
                          : isVisited
                            ? "DONE ✓"
                            : isGoal
                              ? "GOAL"
                              : "UNSEEN";

                    const statusColor = isFound
                      ? StudioColors.pink
                      : isCur
                        ? StudioColors.lime
                        : isQueued
                          ? StudioColors.yellow
                          : isVisited
                            ? StudioColors.mint
                            : isGoal
                              ? StudioColors.pink
                              : StudioColors.textMuted;

                    return (
                      <View
                        key={node}
                        style={[
                          styles.graphNodeSlot,
                          {
                            left: pos.cx - 34,
                            top: pos.cy - 24,
                            zIndex: isFound || isCur ? 5 : 3,
                          },
                        ]}
                      >
                        <AnimatedGraphCircle
                          active={isCur}
                          queued={isQueued}
                          found={isFound}
                          style={[
                            styles.graphCircle,
                            isVisited && styles.bfsNodeVisited,
                            isQueued && styles.bfsNodeQueued,
                            isCur && styles.bfsNodeCurrent,
                            isFound && styles.bfsNodeFound,
                          ]}
                        >
                          <Text
                            style={[
                              styles.bfsNodeText,
                              isBright && styles.inkText,
                            ]}
                          >
                            {node}
                          </Text>
                          {isGoal && (
                            <View style={styles.goalPinBadge}>
                              <Text style={styles.goalPinText}>🎯</Text>
                            </View>
                          )}
                        </AnimatedGraphCircle>
                        <View
                          style={[
                            styles.graphStatusPill,
                            (isBright || isGoal) && styles.graphStatusPillActive,
                            isFound && styles.graphStatusPillFound,
                          ]}
                        >
                          <Text
                            style={[
                              styles.graphStatusText,
                              {
                                color: isFound ? StudioColors.ink : statusColor,
                              },
                            ]}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Visual Waiting Line (Queue) Strip */}
              <View style={styles.queueStripBox}>
                <Text style={styles.microLabel}>
                  WAITING LINE (FIRST IN, FIRST OUT)
                </Text>
                <View style={styles.queueRow}>
                  {step.queue && step.queue.length > 0 ? (
                    step.queue.map((qNode, qIdx) => (
                      <View key={`${qNode}-${qIdx}`} style={styles.queuePill}>
                        <Text style={styles.queuePillOrder}>
                          {qIdx === 0 ? "NEXT →" : `#${qIdx + 1}`}
                        </Text>
                        <Text style={styles.queuePillNode}>{qNode}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyHashText}>
                      Line is empty — search complete!
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Short Step-by-Step Explanation Card + Live Variables */}
        <Animated.View
          style={[styles.explainBox, { transform: [{ scale: popAnim }] }]}
        >
          <View style={styles.explainHeaderRow}>
            <View
              style={[styles.rulePill, { backgroundColor: activeAlgo.accent }]}
            >
              <Text style={styles.rulePillText}>{step.rule}</Text>
            </View>
          </View>
          <Text style={styles.explainTitle}>{step.title}</Text>
          <Text style={styles.explainBody}>{step.explanation}</Text>

          <View style={styles.varsRow}>
            {step.vars.map((v) => (
              <View
                key={v.label}
                style={[
                  styles.varChip,
                  v.highlight && {
                    backgroundColor: activeAlgo.accent,
                    borderColor: StudioColors.ink,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.varChipLabel,
                    v.highlight && styles.inkMutedText,
                  ]}
                >
                  {v.label}
                </Text>
                <Text
                  style={[styles.varChipVal, v.highlight && styles.inkText]}
                >
                  {v.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Playback Controls + Pace Selector */}
        <View style={styles.controlsRow}>
          <View style={styles.primaryControls}>
            <Pressable style={styles.ctrlBtn} onPress={handlePrev}>
              <Text style={styles.ctrlBtnText}>◀ Back</Text>
            </Pressable>
            <Pressable
              style={[styles.ctrlBtn, styles.ctrlBtnLime]}
              onPress={handleNext}
            >
              <Text style={styles.ctrlBtnInkText}>
                {isLastStep ? "↺ Restart" : "Step Next ▶"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.ctrlBtn, isPlaying && styles.ctrlBtnYellow]}
              onPress={handleTogglePlay}
            >
              <Text
                style={[
                  styles.ctrlBtnText,
                  isPlaying && styles.ctrlBtnInkText,
                ]}
              >
                {isPlaying ? "⏸ Pause" : isLastStep ? "▶ Replay" : "▶ Auto-Play"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.speedRow}>
            {[
              { label: "0.5x Slow", ms: 4200 },
              { label: "1x Calm", ms: 2800 },
              { label: "1.5x", ms: 1800 },
              { label: "2x Fast", ms: 1100 },
            ].map((sp) => {
              const active = speedMs === sp.ms;
              return (
                <Pressable
                  key={sp.label}
                  style={[styles.speedPill, active && styles.speedPillActive]}
                  onPress={() => {
                    playKeyClick();
                    setSpeedMs(sp.ms);
                  }}
                >
                  <Text
                    style={[
                      styles.speedPillText,
                      active && styles.ctrlBtnInkText,
                    ]}
                  >
                    {sp.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Numbered Step Scrubber */}
        <View style={styles.stepScrubberRow}>
          {steps.map((_, idx) => {
            const isCur = idx === safeStepIdx;
            const isPast = idx < safeStepIdx;
            return (
              <Pressable
                key={idx}
                style={[
                  styles.scrubPill,
                  isPast && styles.scrubPillPast,
                  isCur && styles.scrubPillCurrent,
                ]}
                onPress={() => {
                  playKeyClick();
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
              >
                <Text
                  style={[
                    styles.scrubPillText,
                    (isCur || isPast) && styles.inkText,
                  ]}
                >
                  {idx + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageScroll: {
    flex: 1,
    backgroundColor: StudioColors.bg,
  },
  pageContent: {
    padding: 20,
    maxWidth: 1020,
    width: "100%",
    alignSelf: "center",
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 18,
    gap: 10,
    ...HardShadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  heroBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  proSticker: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  proStickerText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  categoryBadge: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  backBtn: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  backBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  heroTitle: {
    color: StudioColors.textPrimary,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  introBanner: {
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.borderSubtle,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 3,
  },
  introTag: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  introText: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  algoTabsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  algoTab: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  algoTabText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  algoTabTextActive: {
    color: StudioColors.ink,
    fontWeight: "900",
  },
  stageCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 18,
    gap: 14,
    ...HardShadowHero,
  },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  microLabel: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  presetPill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  presetPillActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  presetPillText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  presetPillTextActive: {
    color: StudioColors.ink,
    fontWeight: "900",
  },
  bigOGroup: {
    flexDirection: "row",
    gap: 6,
  },
  bigOPill: {
    backgroundColor: StudioColors.codeBg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bigOText: {
    color: StudioColors.lime,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  progressTrackWrap: {
    gap: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepLabelText: {
    color: StudioColors.textPrimary,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  paceHintText: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: StudioColors.lime,
  },
  liveText: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  beatTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: StudioColors.bg,
    overflow: "hidden",
  },
  beatFill: {
    height: "100%",
    backgroundColor: StudioColors.mint,
  },
  canvasBox: {
    backgroundColor: StudioColors.bg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 16,
    minHeight: 155,
    justifyContent: "center",
  },
  arrayRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  arrayCell: {
    minWidth: 62,
    paddingVertical: 10,
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.surface,
    alignItems: "center",
    gap: 3,
  },
  arrayCellDim: {
    opacity: 0.32,
  },
  arrayCellYellow: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  arrayCellMint: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  arrayCellLime: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  arrayCellLoBorder: {
    borderColor: StudioColors.violet,
  },
  arrayCellHiBorder: {
    borderColor: StudioColors.pink,
  },
  arrayCellDropped: {
    borderColor: StudioColors.coral,
    borderStyle: "dashed",
    opacity: 0.72,
  },
  arrayCellScanned: {
    borderColor: StudioColors.borderSubtle,
    opacity: 0.65,
  },
  stageWrap: {
    gap: 12,
  },
  legendGoalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  goalGoalBadge: {
    backgroundColor: StudioColors.ink,
    borderWidth: 1.5,
    borderColor: StudioColors.pink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  goalGoalText: {
    color: StudioColors.pink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  sortedMeterTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: StudioColors.bg,
    overflow: "hidden",
    marginTop: 2,
  },
  sortedMeterFill: {
    height: "100%",
    borderRadius: 2,
  },
  visualDecisionStrip: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    gap: 3,
  },
  decisionStripLime: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
  },
  equationHeadline: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
    textAlign: "center",
  },
  decisionStripText: {
    color: StudioColors.textSecondary,
    fontSize: 11.5,
    fontWeight: "800",
    textAlign: "center",
  },
  scoreboardRow: {
    flexDirection: "row",
    gap: 10,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 2,
  },
  scoreCardBestHighlight: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  scoreCardLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  scoreCardVal: {
    color: StudioColors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  scoreCardHint: {
    color: StudioColors.textSecondary,
    fontSize: 10.5,
    fontWeight: "700",
  },
  cellIndex: {
    color: StudioColors.textMuted,
    fontSize: 9.5,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  cellVal: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  pointerSlot: {
    minHeight: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  pointerSpacer: {
    height: 18,
  },
  pointerPill: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pointerPillText: {
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  inkText: {
    color: StudioColors.ink,
  },
  inkMutedText: {
    color: StudioColors.ink,
    opacity: 0.72,
  },
  barChartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 14,
    minHeight: 175,
    paddingTop: 12,
  },
  barCol: {
    alignItems: "center",
    gap: 5,
    minWidth: 48,
  },
  barValLabel: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  barRect: {
    width: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  barCompare: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  barSwapped: {
    backgroundColor: StudioColors.coral,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  barSorted: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  barTagText: {
    color: StudioColors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  barIdxLabel: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  hashStage: {
    gap: 14,
  },
  hashBucketsBox: {
    backgroundColor: StudioColors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    padding: 12,
    gap: 8,
  },
  hashChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hashChip: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hashChipHit: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  hashChipText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  emptyHashText: {
    color: StudioColors.textMuted,
    fontSize: 12,
    fontFamily: MonoFont,
    fontWeight: "700",
  },
  bfsStage: {
    gap: 12,
  },
  bfsLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  legendText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  graphCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  graphCanvas: {
    width: 288,
    height: 304,
    position: "relative",
  },
  hopGuideRow: {
    position: "absolute",
    left: 6,
    right: 2,
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 0,
  },
  hopGuideLine: {
    flex: 1,
    height: 1,
    backgroundColor: StudioColors.border,
    opacity: 0.25,
    marginRight: 6,
  },
  hopGuideLineActive: {
    backgroundColor: StudioColors.lime,
    opacity: 0.45,
  },
  hopBadge: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  hopBadgeActive: {
    borderColor: StudioColors.lime,
  },
  hopBadgeText: {
    color: StudioColors.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  hopBadgeTextActive: {
    color: StudioColors.lime,
  },
  graphEdge: {
    position: "absolute",
    borderRadius: 2,
    zIndex: 1,
  },
  graphNodeSlot: {
    position: "absolute",
    width: 68,
    alignItems: "center",
  },
  graphCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.bg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bfsNodeVisited: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  bfsNodeQueued: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  bfsNodeCurrent: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
    borderWidth: 3,
    ...HardShadowSm,
  },
  bfsNodeFound: {
    backgroundColor: StudioColors.pink,
    borderColor: StudioColors.ink,
    borderWidth: 3,
    ...HardShadowSm,
  },
  bfsNodeText: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  goalPinBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: StudioColors.ink,
    borderWidth: 1.5,
    borderColor: StudioColors.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  goalPinText: {
    fontSize: 10,
  },
  graphStatusPill: {
    marginTop: -7,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    zIndex: 4,
  },
  graphStatusPillActive: {
    backgroundColor: StudioColors.ink,
    borderColor: StudioColors.border,
  },
  graphStatusPillFound: {
    backgroundColor: StudioColors.pink,
    borderColor: StudioColors.ink,
  },
  graphStatusText: {
    fontSize: 8,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.3,
  },
  queueStripBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  queueRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  queuePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  queuePillOrder: {
    color: StudioColors.ink,
    opacity: 0.72,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  queuePillNode: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  explainBox: {
    backgroundColor: StudioColors.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    padding: 14,
    gap: 8,
  },
  explainHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  rulePill: {
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rulePillText: {
    color: StudioColors.ink,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  explainTitle: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  explainBody: {
    color: StudioColors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 20,
  },
  varsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  varChip: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 1,
  },
  varChipLabel: {
    color: StudioColors.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    textTransform: "uppercase",
  },
  varChipVal: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ctrlBtn: {
    backgroundColor: StudioColors.bg,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  ctrlBtnLime: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
  },
  ctrlBtnYellow: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  ctrlBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  ctrlBtnInkText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  speedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  speedPill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  speedPillActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  speedPillText: {
    color: StudioColors.textPrimary,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  stepScrubberRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  scrubPill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.bg,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  scrubPillPast: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  scrubPillCurrent: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  scrubPillText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lockHeroCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 22,
    gap: 14,
    ...HardShadowHero,
  },
  lockTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lockTitle: {
    color: StudioColors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  lockDesc: {
    color: StudioColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  lockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  lockPreviewCard: {
    flex: 1,
    minWidth: 185,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 9,
    padding: 12,
    gap: 6,
  },
  lockCatPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: StudioColors.ink,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lockCatText: {
    color: StudioColors.ink,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lockAlgoName: {
    color: StudioColors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  lockAlgoMeta: {
    color: StudioColors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  unlockCtaBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  unlockCtaText: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
});
