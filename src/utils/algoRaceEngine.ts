export type AlgoRaceMatchupId =
  | "quicksort_vs_bubble"
  | "binary_vs_linear"
  | "hashmap_vs_bruteforce";

export type CustomArrayPresetKind = "random" | "reversed" | "nearly_sorted";

export interface RaceFrame {
  arr: number[];
  /** Indices currently being compared or inspected */
  activeIndices: number[];
  /** Pivot index (QuickSort) or matched target indices */
  highlightIndices: number[];
  /** Indices confirmed sorted or solved */
  doneIndices: number[];
  opsCount: number;
  statusText: string;
  finished: boolean;
}

export interface RaceMatchupSpec {
  id: AlgoRaceMatchupId;
  title: string;
  subtitle: string;
  leftName: string;
  leftBigO: string;
  leftAccent: string;
  rightName: string;
  rightBigO: string;
  rightAccent: string;
  needsTarget: boolean;
  defaultArray: number[];
  defaultTarget: number;
}

export const ALGO_RACE_MATCHUPS: readonly RaceMatchupSpec[] = [
  {
    id: "quicksort_vs_bubble",
    title: "QuickSort vs. Bubble Sort",
    subtitle:
      "Divide-and-conquer pivot partitioning vs. neighbor-by-neighbor swapping on the exact same bars.",
    leftName: "QuickSort",
    leftBigO: "O(n log n)",
    leftAccent: "#6EE7B7",
    rightName: "Bubble Sort",
    rightBigO: "O(n²)",
    rightAccent: "#FB7185",
    needsTarget: false,
    defaultArray: [48, 19, 72, 11, 64, 29, 85, 7, 53, 36],
    defaultTarget: 48,
  },
  {
    id: "binary_vs_linear",
    title: "Binary Search vs. Linear Scan",
    subtitle:
      "Halving a sorted array each check vs. walking index-by-index from left to right.",
    leftName: "Binary Search",
    leftBigO: "O(log n)",
    leftAccent: "#FFDE59",
    rightName: "Linear Scan",
    rightBigO: "O(n)",
    rightAccent: "#FB923C",
    needsTarget: true,
    defaultArray: [4, 9, 15, 22, 28, 35, 44, 52, 61, 70, 83, 94],
    defaultTarget: 83,
  },
  {
    id: "hashmap_vs_bruteforce",
    title: "Hash Map vs. Brute-Force Two Sum",
    subtitle:
      "Single-pass O(1) dictionary memory lookup vs. nested i, j loops testing every pair.",
    leftName: "Hash Map Lookup",
    leftBigO: "O(n)",
    leftAccent: "#C084FC",
    rightName: "Nested Loops",
    rightBigO: "O(n²)",
    rightAccent: "#F472B6",
    needsTarget: true,
    defaultArray: [14, 27, 8, 33, 19, 41, 6, 25],
    defaultTarget: 31,
  },
] as const;

/**
 * Parses a user-entered comma/space-separated number list into a safe bounded array.
 */
export function parseCustomNumberArray(
  raw: string,
  options: { minLen?: number; maxLen?: number; sortAscending?: boolean } = {},
): { values: number[]; error: string | null } {
  const { minLen = 4, maxLen = 14, sortAscending = false } = options;
  const tokens = raw
    .replace(/[\[\]]/g, " ")
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length < minLen) {
    return {
      values: [],
      error: `Enter at least ${minLen} numbers separated by commas.`,
    };
  }

  const parsed: number[] = [];
  for (const tok of tokens.slice(0, maxLen)) {
    const n = Number(tok);
    if (!Number.isFinite(n)) {
      return { values: [], error: `"${tok}" is not a valid number.` };
    }
    parsed.push(Math.max(-99, Math.min(999, Math.round(n))));
  }

  if (sortAscending) {
    parsed.sort((a, b) => a - b);
  }
  return { values: parsed, error: null };
}

export function generatePresetArray(
  kind: CustomArrayPresetKind,
  length = 10,
  seed = Date.now(),
): number[] {
  const safeLen = Math.max(5, Math.min(14, length));
  if (kind === "reversed") {
    return Array.from({ length: safeLen }, (_, idx) => (safeLen - idx) * 8 + 4);
  }
  if (kind === "nearly_sorted") {
    const arr = Array.from({ length: safeLen }, (_, idx) => (idx + 1) * 8 + 2);
    if (arr.length >= 6) {
      const tmp = arr[2];
      arr[2] = arr[3];
      arr[3] = tmp;
      const last = arr.length - 2;
      const tmp2 = arr[last];
      arr[last] = arr[last - 1];
      arr[last - 1] = tmp2;
    }
    return arr;
  }
  // Deterministic-capable pseudo-random array
  let s = (Math.floor(seed) || 1337) >>> 0;
  const nextRand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from(
    { length: safeLen },
    () => 6 + Math.floor(nextRand() * 88),
  );
}

function buildQuickSortRaceFrames(input: readonly number[]): RaceFrame[] {
  const arr = [...input];
  const done = new Set<number>();
  const frames: RaceFrame[] = [
    {
      arr: [...arr],
      activeIndices: [],
      highlightIndices: [],
      doneIndices: [],
      opsCount: 0,
      statusText: `Ready to partition ${arr.length} items`,
      finished: false,
    },
  ];
  let ops = 0;

  function qs(lo: number, hi: number) {
    if (lo > hi) return;
    if (lo === hi) {
      done.add(lo);
      return;
    }
    const pivot = arr[hi];
    let store = lo;
    for (let j = lo; j < hi; j += 1) {
      ops += 1;
      const swapped = arr[j] <= pivot;
      if (swapped) {
        const tmp = arr[store];
        arr[store] = arr[j];
        arr[j] = tmp;
      }
      frames.push({
        arr: [...arr],
        activeIndices: swapped ? [store, j] : [j],
        highlightIndices: [hi],
        doneIndices: Array.from(done),
        opsCount: ops,
        statusText: `Compare ${arr[swapped ? store : j]} vs pivot ${pivot}`,
        finished: false,
      });
      if (swapped) store += 1;
    }
    const tmp = arr[store];
    arr[store] = arr[hi];
    arr[hi] = tmp;
    ops += 1;
    done.add(store);
    frames.push({
      arr: [...arr],
      activeIndices: [store],
      highlightIndices: [store],
      doneIndices: Array.from(done),
      opsCount: ops,
      statusText: `Pivot ${pivot} locked at [${store}]`,
      finished: false,
    });
    qs(lo, store - 1);
    qs(store + 1, hi);
  }

  qs(0, arr.length - 1);
  const allIdx = arr.map((_, i) => i);
  frames.push({
    arr: [...arr],
    activeIndices: [],
    highlightIndices: [],
    doneIndices: allIdx,
    opsCount: ops,
    statusText: `Sorted in ${ops} ops ✓`,
    finished: true,
  });
  return frames;
}

function buildBubbleSortRaceFrames(input: readonly number[]): RaceFrame[] {
  const arr = [...input];
  const n = arr.length;
  const done: number[] = [];
  const frames: RaceFrame[] = [
    {
      arr: [...arr],
      activeIndices: [],
      highlightIndices: [],
      doneIndices: [],
      opsCount: 0,
      statusText: `Ready to scan ${n} neighbor pairs`,
      finished: false,
    },
  ];
  let ops = 0;

  for (let i = 0; i < n - 1; i += 1) {
    let swappedAny = false;
    for (let j = 0; j < n - 1 - i; j += 1) {
      ops += 1;
      const doSwap = arr[j] > arr[j + 1];
      if (doSwap) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swappedAny = true;
      }
      frames.push({
        arr: [...arr],
        activeIndices: [j, j + 1],
        highlightIndices: doSwap ? [j + 1] : [],
        doneIndices: [...done],
        opsCount: ops,
        statusText: doSwap
          ? `Swap ${arr[j + 1]} ⇄ ${arr[j]}`
          : `Keep [${j}, ${j + 1}]`,
        finished: false,
      });
    }
    done.push(n - 1 - i);
    if (!swappedAny) break;
  }

  const allIdx = arr.map((_, i) => i);
  frames.push({
    arr: [...arr],
    activeIndices: [],
    highlightIndices: [],
    doneIndices: allIdx,
    opsCount: ops,
    statusText: `Sorted in ${ops} ops ✓`,
    finished: true,
  });
  return frames;
}

function buildBinarySearchRaceFrames(
  rawInput: readonly number[],
  target: number,
): RaceFrame[] {
  const arr = [...rawInput].sort((a, b) => a - b);
  const frames: RaceFrame[] = [
    {
      arr,
      activeIndices: [],
      highlightIndices: [],
      doneIndices: [],
      opsCount: 0,
      statusText: `Target = ${target} across [0..${arr.length - 1}]`,
      finished: false,
    },
  ];
  let lo = 0;
  let hi = arr.length - 1;
  let ops = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    ops += 1;
    if (arr[mid] === target) {
      frames.push({
        arr,
        activeIndices: [mid],
        highlightIndices: [mid],
        doneIndices: [mid],
        opsCount: ops,
        statusText: `Found ${target} at [${mid}] in ${ops} checks ✓`,
        finished: true,
      });
      return frames;
    }
    frames.push({
      arr,
      activeIndices: [mid],
      highlightIndices: [lo, hi],
      doneIndices: [],
      opsCount: ops,
      statusText:
        arr[mid] < target
          ? `Mid ${arr[mid]} < ${target} → drop left half`
          : `Mid ${arr[mid]} > ${target} → drop right half`,
      finished: false,
    });
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  frames.push({
    arr,
    activeIndices: [],
    highlightIndices: [],
    doneIndices: [],
    opsCount: ops,
    statusText: `${target} absent — proved in ${ops} checks ✓`,
    finished: true,
  });
  return frames;
}

function buildLinearScanRaceFrames(
  rawInput: readonly number[],
  target: number,
): RaceFrame[] {
  const arr = [...rawInput].sort((a, b) => a - b);
  const frames: RaceFrame[] = [
    {
      arr,
      activeIndices: [],
      highlightIndices: [],
      doneIndices: [],
      opsCount: 0,
      statusText: `Scanning index 0 → ${arr.length - 1} for ${target}`,
      finished: false,
    },
  ];
  let ops = 0;
  for (let i = 0; i < arr.length; i += 1) {
    ops += 1;
    if (arr[i] === target) {
      frames.push({
        arr,
        activeIndices: [i],
        highlightIndices: [i],
        doneIndices: [i],
        opsCount: ops,
        statusText: `Found ${target} at [${i}] after ${ops} checks ✓`,
        finished: true,
      });
      return frames;
    }
    frames.push({
      arr,
      activeIndices: [i],
      highlightIndices: [],
      doneIndices: [],
      opsCount: ops,
      statusText: `Check [${i}] = ${arr[i]} ≠ ${target}`,
      finished: false,
    });
  }

  frames.push({
    arr,
    activeIndices: [],
    highlightIndices: [],
    doneIndices: [],
    opsCount: ops,
    statusText: `${target} absent after ${ops} checks ✓`,
    finished: true,
  });
  return frames;
}

function buildHashMapTwoSumFrames(
  arr: readonly number[],
  target: number,
): RaceFrame[] {
  const copy = [...arr];
  const seen = new Map<number, number>();
  const frames: RaceFrame[] = [
    {
      arr: copy,
      activeIndices: [],
      highlightIndices: [],
      doneIndices: [],
      opsCount: 0,
      statusText: `Goal sum = ${target} (empty dict)`,
      finished: false,
    },
  ];
  let ops = 0;

  for (let i = 0; i < copy.length; i += 1) {
    ops += 1;
    const need = target - copy[i];
    if (seen.has(need)) {
      const hit = seen.get(need)!;
      frames.push({
        arr: copy,
        activeIndices: [hit, i],
        highlightIndices: [hit, i],
        doneIndices: [hit, i],
        opsCount: ops,
        statusText: `O(1) hit! ${copy[hit]} + ${copy[i]} = ${target} in ${ops} ops ✓`,
        finished: true,
      });
      return frames;
    }
    seen.set(copy[i], i);
    frames.push({
      arr: copy,
      activeIndices: [i],
      highlightIndices: [],
      doneIndices: [],
      opsCount: ops,
      statusText: `Store ${copy[i]} → idx ${i} (need ${need})`,
      finished: false,
    });
  }

  frames.push({
    arr: copy,
    activeIndices: [],
    highlightIndices: [],
    doneIndices: [],
    opsCount: ops,
    statusText: `No pair sums to ${target} (${ops} ops) ✓`,
    finished: true,
  });
  return frames;
}

function buildBruteForceTwoSumFrames(
  arr: readonly number[],
  target: number,
): RaceFrame[] {
  const copy = [...arr];
  const frames: RaceFrame[] = [
    {
      arr: copy,
      activeIndices: [],
      highlightIndices: [],
      doneIndices: [],
      opsCount: 0,
      statusText: `Testing nested (i, j) pairs for ${target}`,
      finished: false,
    },
  ];
  let ops = 0;

  for (let i = 0; i < copy.length; i += 1) {
    for (let j = i + 1; j < copy.length; j += 1) {
      ops += 1;
      const sum = copy[i] + copy[j];
      if (sum === target) {
        frames.push({
          arr: copy,
          activeIndices: [i, j],
          highlightIndices: [i, j],
          doneIndices: [i, j],
          opsCount: ops,
          statusText: `Found ${copy[i]} + ${copy[j]} = ${target} after ${ops} pairs ✓`,
          finished: true,
        });
        return frames;
      }
      frames.push({
        arr: copy,
        activeIndices: [i, j],
        highlightIndices: [],
        doneIndices: [],
        opsCount: ops,
        statusText: `Pair (${copy[i]}, ${copy[j]}) = ${sum} ≠ ${target}`,
        finished: false,
      });
    }
  }

  frames.push({
    arr: copy,
    activeIndices: [],
    highlightIndices: [],
    doneIndices: [],
    opsCount: ops,
    statusText: `No pair found after ${ops} pairs ✓`,
    finished: true,
  });
  return frames;
}

export function buildAlgorithmRace(
  matchupId: AlgoRaceMatchupId,
  inputArray: readonly number[],
  target = 48,
): {
  leftFrames: RaceFrame[];
  rightFrames: RaceFrame[];
  maxTicks: number;
  speedupRatio: number;
} {
  let leftFrames: RaceFrame[];
  let rightFrames: RaceFrame[];

  if (matchupId === "binary_vs_linear") {
    leftFrames = buildBinarySearchRaceFrames(inputArray, target);
    rightFrames = buildLinearScanRaceFrames(inputArray, target);
  } else if (matchupId === "hashmap_vs_bruteforce") {
    leftFrames = buildHashMapTwoSumFrames(inputArray, target);
    rightFrames = buildBruteForceTwoSumFrames(inputArray, target);
  } else {
    leftFrames = buildQuickSortRaceFrames(inputArray);
    rightFrames = buildBubbleSortRaceFrames(inputArray);
  }

  const leftOps = Math.max(1, leftFrames[leftFrames.length - 1]?.opsCount || 1);
  const rightOps = Math.max(1, rightFrames[rightFrames.length - 1]?.opsCount || 1);
  const speedupRatio = +(rightOps / leftOps).toFixed(1);
  const maxTicks = Math.max(leftFrames.length, rightFrames.length);

  return { leftFrames, rightFrames, maxTicks, speedupRatio };
}
