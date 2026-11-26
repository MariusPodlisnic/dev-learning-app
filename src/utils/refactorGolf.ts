import { readLocalJson, writeLocalJson } from "./storage";

export const STORAGE_REFACTOR_GOLF_KEY = "devlearn_refactor_golf_v1";

export type RefactorHoleId =
  | "two_sum_golf"
  | "dedupe_preserve_golf"
  | "char_freq_golf"
  | "anagram_bucket_golf"
  | "range_sum_golf"
  | "missing_num_golf";

export type ComplexityTier = "O(1)" | "O(n)" | "O(n log n)" | "O(n²)";

export type RefactorMedal = "eagle" | "birdie" | "par";

export interface RefactorHole {
  id: RefactorHoleId;
  holeNumber: number;
  title: string;
  shortTitle: string;
  badge: string;
  accent: string;
  isPro: boolean;
  xpReward: number;
  starterComplexity: ComplexityTier;
  targetComplexity: ComplexityTier;
  parLines: number;
  summary: string;
  bottleneckNote: string;
  hint: string;
  starterCode: string;
  optimalCode: string;
  verificationHarness: string;
}

export interface RefactorHoleRecord {
  bestMedal: RefactorMedal;
  bestLines: number;
  bestComplexity: ComplexityTier;
}

export type RefactorGolfRecordsMap = Partial<
  Record<RefactorHoleId, RefactorHoleRecord>
>;

export interface RefactorStaticEvaluation {
  effectiveLines: number;
  estimatedComplexity: ComplexityTier;
  meetsComplexityTarget: boolean;
  meetsLinePar: boolean;
  medal: RefactorMedal;
  headline: string;
  coachingTip: string;
}

const COMPLEXITY_RANK: Record<ComplexityTier, number> = {
  "O(1)": 0,
  "O(n)": 1,
  "O(n log n)": 2,
  "O(n²)": 3,
};

const MEDAL_RANK: Record<RefactorMedal, number> = {
  par: 1,
  birdie: 2,
  eagle: 3,
};

export const REFACTOR_GOLF_HOLES: readonly RefactorHole[] = [
  {
    id: "two_sum_golf",
    holeNumber: 1,
    title: "Two-Sum Hash Lookup",
    shortTitle: "TWO-SUM",
    badge: "HASH MAP · O(n²) → O(n)",
    accent: "#B8FF3B",
    isPro: false,
    xpReward: 65,
    starterComplexity: "O(n²)",
    targetComplexity: "O(n)",
    parLines: 8,
    summary:
      "Refactor the slow nested-loop Two Sum finder into a single-pass hash map lookup that returns the matching index pair [i, j].",
    bottleneckNote:
      "Comparing every pair (i, j) scans n*(n-1)/2 pairs — quadratic time on large arrays.",
    hint: "Store each visited number's index in a dict `seen = {}`. For each `(i, num)`, check if `target - num` is already in `seen`!",
    starterCode: `def find_pair(nums, target):
    # Slow O(n^2) nested scan — refactor to O(n)!
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    optimalCode: `def find_pair(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return []`,
    verificationHarness: `
__test_cases__ = [
    ("find_pair([2, 7, 11, 15], 9)", lambda: find_pair([2, 7, 11, 15], 9), [0, 1]),
    ("find_pair([3, 2, 4], 6)", lambda: find_pair([3, 2, 4], 6), [1, 2]),
    ("find_pair([1, 5, 8, 12], 20)", lambda: find_pair([1, 5, 8, 12], 20), [2, 3]),
    ("find_pair([1, 2, 3], 99)", lambda: find_pair([1, 2, 3], 99), []),
    ("stress 1200 items", lambda: find_pair(list(range(1200)), 2397), [1198, 1199]),
]
for __label__, __fn__, __expected__ in __test_cases__:
    __actual__ = __fn__()
    print(f"TEST_RESULT|{__label__}|{__expected__}|{__actual__}|{__actual__ == __expected__}")
`,
  },
  {
    id: "dedupe_preserve_golf",
    holeNumber: 2,
    title: "Order-Preserving Dedupe",
    shortTitle: "DEDUPE",
    badge: "SET / DICT · O(n²) → O(n)",
    accent: "#6EE7B7",
    isPro: false,
    xpReward: 55,
    starterComplexity: "O(n²)",
    targetComplexity: "O(n)",
    parLines: 5,
    summary:
      "Remove duplicates from `items` while preserving first-seen order without linear membership checks inside a loop.",
    bottleneckNote:
      "`x not in unique` scans the growing list from start to finish on every iteration.",
    hint: "In Python 3.7+, `list(dict.fromkeys(items))` preserves insertion order in O(n) — or track visited items in a `set()`.",
    starterCode: `def dedupe_keep_order(items):
    # Slow O(n^2): checking 'not in result' scans a list every step!
    result = []
    for item in items:
        if item not in result:
            result.append(item)
    return result`,
    optimalCode: `def dedupe_keep_order(items):
    return list(dict.fromkeys(items))`,
    verificationHarness: `
__test_cases__ = [
    ("dedupe([3, 1, 3, 2, 1])", lambda: dedupe_keep_order([3, 1, 3, 2, 1]), [3, 1, 2]),
    ("dedupe(['py', 'js', 'py', 'go'])", lambda: dedupe_keep_order(["py", "js", "py", "go"]), ["py", "js", "go"]),
    ("dedupe([])", lambda: dedupe_keep_order([]), []),
    ("stress 1500 items", lambda: len(dedupe_keep_order(list(range(750)) * 2)), 750),
]
for __label__, __fn__, __expected__ in __test_cases__:
    __actual__ = __fn__()
    print(f"TEST_RESULT|{__label__}|{__expected__}|{__actual__}|{__actual__ == __expected__}")
`,
  },
  {
    id: "char_freq_golf",
    holeNumber: 3,
    title: "Top Character Counter",
    shortTitle: "TOP CHAR",
    badge: "FREQUENCY MAP · O(n²) → O(n)",
    accent: "#FFDE59",
    isPro: false,
    xpReward: 65,
    starterComplexity: "O(n²)",
    targetComplexity: "O(n)",
    parLines: 8,
    summary:
      "Return the most frequent character in a non-empty string (breaking ties by first appearance) in a single O(n) frequency pass.",
    bottleneckNote:
      "Calling `text.count(ch)` inside `for ch in text` re-scans the entire string for every character!",
    hint: "Accumulate counts in a single dict `counts[ch] = counts.get(ch, 0) + 1`, then pick `max(counts, key=counts.get)`.",
    starterCode: `def most_common_char(text):
    # Slow O(n^2): text.count(ch) rescans the whole string each loop!
    best_char = text[0]
    best_count = 0
    for ch in text:
        c = text.count(ch)
        if c > best_count:
            best_count = c
            best_char = ch
    return best_char`,
    optimalCode: `def most_common_char(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    return max(counts, key=counts.get)`,
    verificationHarness: `
__test_cases__ = [
    ("most_common_char('banana')", lambda: most_common_char("banana"), "a"),
    ("most_common_char('abracadabra')", lambda: most_common_char("abracadabra"), "a"),
    ("most_common_char('xyyz')", lambda: most_common_char("xyyz"), "y"),
    ("stress 2000 chars", lambda: most_common_char("abc" * 500 + "z" * 505), "z"),
]
for __label__, __fn__, __expected__ in __test_cases__:
    __actual__ = __fn__()
    print(f"TEST_RESULT|{__label__}|{__expected__}|{__actual__}|{__actual__ == __expected__}")
`,
  },
  {
    id: "anagram_bucket_golf",
    holeNumber: 4,
    title: "Fast Anagram Checker",
    shortTitle: "ANAGRAM",
    badge: "COUNT / SORT · O(n²) → O(n log n)",
    accent: "#FF90E8",
    isPro: true,
    xpReward: 75,
    starterComplexity: "O(n²)",
    targetComplexity: "O(n log n)",
    parLines: 6,
    summary:
      "Check whether two lowercase strings are exact anagrams without calling `list.remove()` inside a loop.",
    bottleneckNote:
      "`chars.remove(ch)` shifts remaining array elements on every character — O(n²) total work.",
    hint: "Compare character frequency dicts in O(n), or cleanly compare `sorted(a) == sorted(b)` in 2 lines!",
    starterCode: `def are_anagrams(a, b):
    # Slow O(n^2): list.remove shifts elements on every character!
    if len(a) != len(b):
        return False
    pool = list(b)
    for ch in a:
        if ch not in pool:
            return False
        pool.remove(ch)
    return True`,
    optimalCode: `def are_anagrams(a, b):
    return len(a) == len(b) and sorted(a) == sorted(b)`,
    verificationHarness: `
__test_cases__ = [
    ("are_anagrams('listen', 'silent')", lambda: are_anagrams("listen", "silent"), True),
    ("are_anagrams('python', 'typhon')", lambda: are_anagrams("python", "typhon"), True),
    ("are_anagrams('devy', 'code')", lambda: are_anagrams("devy", "code"), False),
    ("are_anagrams('aab', 'abb')", lambda: are_anagrams("aab", "abb"), False),
]
for __label__, __fn__, __expected__ in __test_cases__:
    __actual__ = __fn__()
    print(f"TEST_RESULT|{__label__}|{__expected__}|{__actual__}|{__actual__ == __expected__}")
`,
  },
  {
    id: "range_sum_golf",
    holeNumber: 5,
    title: "Prefix Sum Queries",
    shortTitle: "PREFIX SUM",
    badge: "PREFIX ARRAY · O(n·q) → O(n)",
    accent: "#38BDF8",
    isPro: true,
    xpReward: 85,
    starterComplexity: "O(n²)",
    targetComplexity: "O(n)",
    parLines: 8,
    summary:
      "Given `nums` and inclusive `(left, right)` range queries, answer every query in O(1) using a precomputed prefix sum array.",
    bottleneckNote:
      "Slicing `nums[l : r + 1]` and summing per query costs O(n) per query (O(n²) worst case).",
    hint: "Build `pref = [0]` with running totals; each inclusive range `(l, r)` equals `pref[r + 1] - pref[l]`!",
    starterCode: `def answer_range_sums(nums, queries):
    # Slow O(n*q): re-slices and sums nums for every query!
    out = []
    for l, r in queries:
        total = 0
        for idx in range(l, r + 1):
            total += nums[idx]
        out.append(total)
    return out`,
    optimalCode: `def answer_range_sums(nums, queries):
    pref = [0]
    for x in nums:
        pref.append(pref[-1] + x)
    return [pref[r + 1] - pref[l] for l, r in queries]`,
    verificationHarness: `
__test_cases__ = [
    ("sums([1,2,3,4], [(0,2),(1,3)])", lambda: answer_range_sums([1, 2, 3, 4], [(0, 2), (1, 3)]), [6, 9]),
    ("sums([5, -2, 7], [(0,0),(0,2),(1,2)])", lambda: answer_range_sums([5, -2, 7], [(0, 0), (0, 2), (1, 2)]), [5, 10, 5]),
    ("stress 600 queries", lambda: answer_range_sums(list(range(1, 501)), [(0, 499)] * 600)[0], 125250),
]
for __label__, __fn__, __expected__ in __test_cases__:
    __actual__ = __fn__()
    print(f"TEST_RESULT|{__label__}|{__expected__}|{__actual__}|{__actual__ == __expected__}")
`,
  },
  {
    id: "missing_num_golf",
    holeNumber: 6,
    title: "Missing Sequence ID",
    shortTitle: "MISSING ID",
    badge: "GAUSS MATH · O(n²) → O(n)",
    accent: "#FB923C",
    isPro: true,
    xpReward: 90,
    starterComplexity: "O(n²)",
    targetComplexity: "O(n)",
    parLines: 4,
    summary:
      "Find the single missing integer in `[0..n]` from `nums` using constant extra memory and linear time (Gauss sum formula!).",
    bottleneckNote:
      "`candidate not in nums` performs a linear scan over `nums` for every candidate in `range(n + 1)`.",
    hint: "The expected sum of `0..n` is `n * (n + 1) // 2`. Subtract `sum(nums)` to reveal the missing ID in 2 lines!",
    starterCode: `def find_missing_id(nums):
    # Slow O(n^2): 'not in nums' scans the list on every candidate!
    n = len(nums)
    for candidate in range(n + 1):
        if candidate not in nums:
            return candidate
    return -1`,
    optimalCode: `def find_missing_id(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)`,
    verificationHarness: `
__test_cases__ = [
    ("missing([3, 0, 1])", lambda: find_missing_id([3, 0, 1]), 2),
    ("missing([0, 1])", lambda: find_missing_id([0, 1]), 2),
    ("missing([9,6,4,2,3,5,7,0,1])", lambda: find_missing_id([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8),
    ("stress 1000 ids", lambda: find_missing_id([x for x in range(1001) if x != 617]), 617),
]
for __label__, __fn__, __expected__ in __test_cases__:
    __actual__ = __fn__()
    print(f"TEST_RESULT|{__label__}|{__expected__}|{__actual__}|{__actual__ == __expected__}")
`,
  },
] as const;

export function getRefactorHole(id: RefactorHoleId): RefactorHole {
  return REFACTOR_GOLF_HOLES.find((h) => h.id === id) || REFACTOR_GOLF_HOLES[0];
}

export function countEffectivePythonLines(code: string): number {
  return String(code || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#")).length;
}

/**
 * Statically estimates the dominant Big-O complexity tier of a Python refactor submission.
 * Detects nested loops, list-scans inside loops (.count / .remove / 'in list'), sorting, and linear passes.
 */
export function estimatePythonRefactorComplexity(code: string): ComplexityTier {
  const rawLines = String(code || "").split("\n");
  const codeLines = rawLines
    .map((line) => {
      const stripped = line.replace(/#.*$/, "");
      return {
        indent: stripped.length - stripped.trimStart().length,
        text: stripped.trim(),
      };
    })
    .filter((l) => l.text.length > 0);

  let hasLoop = false;
  let hasNestedLoop = false;
  let hasInnerLinearScan = false;
  let hasSort = false;
  const loopIndentStack: number[] = [];

  for (const line of codeLines) {
    while (
      loopIndentStack.length > 0 &&
      line.indent <= loopIndentStack[loopIndentStack.length - 1]
    ) {
      loopIndentStack.pop();
    }

    if (/\bsorted\s*\(|\.\s*sort\s*\(/.test(line.text)) {
      hasSort = true;
    }

    const isLoopLine = /^(for|while)\b/.test(line.text);
    if (isLoopLine) {
      if (loopIndentStack.length > 0) {
        hasNestedLoop = true;
      }
      hasLoop = true;
      loopIndentStack.push(line.indent);
      continue;
    }

    if (loopIndentStack.length > 0) {
      // Quadratic anti-patterns inside a loop: .count(), .remove(), sum(arr[...]), or list membership on known list vars
      if (
        /\.\s*count\s*\(|\.\s*remove\s*\(|\bsum\s*\([^)]*\[[^\]]*:[^\]]*\]/.test(
          line.text,
        )
      ) {
        hasInnerLinearScan = true;
      }
      // Checking membership on `result`, `nums`, or `pool` list instead of a dict/set
      if (/\b(?:not\s+)?in\s+(?:result|nums|pool|out|items)\b/.test(line.text)) {
        // Allow `for x in nums:` (already handled above); this catches `if x not in result:`
        if (!/^for\b/.test(line.text)) {
          hasInnerLinearScan = true;
        }
      }
    }
  }

  if (hasNestedLoop || hasInnerLinearScan) {
    return "O(n²)";
  }
  if (hasSort) {
    return "O(n log n)";
  }
  if (
    hasLoop ||
    /\b(sum|max|min|set|dict\.fromkeys|enumerate|list)\s*\(/.test(code) ||
    /\[[^\]]*\bfor\b[^\]]*\]/.test(code)
  ) {
    return "O(n)";
  }
  return "O(1)";
}

export function evaluateRefactorSubmission(
  code: string,
  hole: RefactorHole,
): RefactorStaticEvaluation {
  const effectiveLines = countEffectivePythonLines(code);
  const estimatedComplexity = estimatePythonRefactorComplexity(code);
  const meetsComplexityTarget =
    COMPLEXITY_RANK[estimatedComplexity] <=
    COMPLEXITY_RANK[hole.targetComplexity];
  const meetsLinePar = effectiveLines <= hole.parLines;

  if (meetsComplexityTarget && meetsLinePar) {
    return {
      effectiveLines,
      estimatedComplexity,
      meetsComplexityTarget,
      meetsLinePar,
      medal: "eagle",
      headline: `🏆 EAGLE! ${estimatedComplexity} in ${effectiveLines} lines (Par ${hole.parLines})`,
      coachingTip:
        "Optimal complexity AND crisp, idiomatic Python under line par!",
    };
  }
  if (meetsComplexityTarget) {
    return {
      effectiveLines,
      estimatedComplexity,
      meetsComplexityTarget,
      meetsLinePar,
      medal: "birdie",
      headline: `⭐ BIRDIE! Hit ${estimatedComplexity} target (${effectiveLines}/${hole.parLines} lines)`,
      coachingTip: `Great speedup! Trim ${effectiveLines - hole.parLines} line${effectiveLines - hole.parLines === 1 ? "" : "s"} to score a Gold Eagle.`,
    };
  }
  return {
    effectiveLines,
    estimatedComplexity,
    meetsComplexityTarget,
    meetsLinePar,
    medal: "par",
    headline: `✓ PAR (Tests Passed · Still ${estimatedComplexity})`,
    coachingTip: `Correct output, but still ${estimatedComplexity}. Aim for ${hole.targetComplexity} to unlock Birdie or Eagle!`,
  };
}

type RefactorGolfListener = (map: RefactorGolfRecordsMap) => void;
const listeners = new Set<RefactorGolfListener>();

export function readRefactorGolfRecords(): RefactorGolfRecordsMap {
  return readLocalJson<RefactorGolfRecordsMap>(STORAGE_REFACTOR_GOLF_KEY, {});
}

export function saveRefactorGolfRecord(
  holeId: RefactorHoleId,
  medal: RefactorMedal,
  lines: number,
  complexity: ComplexityTier,
): RefactorGolfRecordsMap {
  const current = readRefactorGolfRecords();
  const prev = current[holeId];
  const nextRecord: RefactorHoleRecord = prev
    ? {
        bestMedal:
          MEDAL_RANK[medal] > MEDAL_RANK[prev.bestMedal]
            ? medal
            : prev.bestMedal,
        bestLines: Math.min(prev.bestLines, lines),
        bestComplexity:
          COMPLEXITY_RANK[complexity] < COMPLEXITY_RANK[prev.bestComplexity]
            ? complexity
            : prev.bestComplexity,
      }
    : {
        bestMedal: medal,
        bestLines: lines,
        bestComplexity: complexity,
      };
  const updated: RefactorGolfRecordsMap = {
    ...current,
    [holeId]: nextRecord,
  };
  writeLocalJson(STORAGE_REFACTOR_GOLF_KEY, updated);
  listeners.forEach((fn) => fn(updated));
  return updated;
}

export function subscribeRefactorGolfRecords(
  listener: RefactorGolfListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMedalBadgeLabel(medal: RefactorMedal): string {
  if (medal === "eagle") return "🏆 EAGLE";
  if (medal === "birdie") return "⭐ BIRDIE";
  return "✓ PAR";
}
