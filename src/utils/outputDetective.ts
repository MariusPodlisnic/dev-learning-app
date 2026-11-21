export type DetectiveTrack = "all" | "python_basics" | "algorithms" | "system_design";

export interface DetectiveCase {
  id: string;
  track: Exclude<DetectiveTrack, "all">;
  category: string;
  difficulty: "ROOKIE" | "SLEUTH" | "MASTER";
  title: string;
  code: string;
  question: string;
  highlightLine?: number;
  options: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  traceSteps: readonly string[];
  isPro: boolean;
}

export const DETECTIVE_CASES: readonly DetectiveCase[] = [
  // --- PYTHON BASICS (6 cases: 5 free, 1 Pro) ---
  {
    id: "det-py-01",
    track: "python_basics",
    category: "SLICING",
    difficulty: "ROOKIE",
    title: "The Reverse Step",
    code: `word = "DEVY"\npart = word[1:4]\nprint(part[::-1])`,
    question: "What does line 3 print?",
    highlightLine: 3,
    options: ["YVE", "YVED", "EVY", "VED"],
    correctIndex: 0,
    traceSteps: [
      'Line 2: word[1:4] slices indices 1, 2, 3 -> "EVY".',
      'Line 3: [::-1] reverses "EVY" -> "YVE".',
    ],
    isPro: false,
  },
  {
    id: "det-py-02",
    track: "python_basics",
    category: "MUTABILITY",
    difficulty: "SLEUTH",
    title: "The Shared Alias",
    code: `a = [1, 2]\nb = a\nb.append(3)\nprint(len(a), a[-1])`,
    question: "What is printed on line 4?",
    highlightLine: 4,
    options: ["2 2", "3 3", "3 2", "2 3"],
    correctIndex: 1,
    traceSteps: [
      "Line 2: b = a points both names to the exact same list in memory.",
      "Line 3: b.append(3) mutates that shared list to [1, 2, 3].",
      "Line 4: len(a) is 3 and a[-1] is 3 -> prints 3 3.",
    ],
    isPro: false,
  },
  {
    id: "det-py-03",
    track: "python_basics",
    category: "LOOPS",
    difficulty: "ROOKIE",
    title: "The Skipped Even",
    code: `total = 0\nfor n in range(1, 6):\n    if n % 2 == 0:\n        continue\n    total += n\nprint(total)`,
    question: "What is the final value of total?",
    highlightLine: 6,
    options: ["6", "9", "15", "12"],
    correctIndex: 1,
    traceSteps: [
      "range(1, 6) yields 1, 2, 3, 4, 5.",
      "Even numbers (2 and 4) hit continue and are skipped.",
      "Odd numbers sum up: 1 + 3 + 5 = 9.",
    ],
    isPro: false,
  },
  {
    id: "det-py-04",
    track: "python_basics",
    category: "DICTS",
    difficulty: "ROOKIE",
    title: "The Missing Key Fallback",
    code: `scores = {"cat": 10}\nscores["cat"] = scores.get("cat", 0) + 5\nscores["dog"] = scores.get("dog", 2) * 3\nprint(scores["cat"] + scores["dog"])`,
    question: "What does line 4 print?",
    highlightLine: 4,
    options: ["15", "21", "18", "KeyError"],
    correctIndex: 1,
    traceSteps: [
      'Line 2: "cat" exists (10), so 10 + 5 = 15.',
      'Line 3: "dog" is missing, so .get() returns default 2; 2 * 3 = 6.',
      "Line 4: 15 + 6 = 21.",
    ],
    isPro: false,
  },
  {
    id: "det-py-05",
    track: "python_basics",
    category: "FUNCTIONS",
    difficulty: "SLEUTH",
    title: "The Default Trap",
    code: `def add_tag(tag, box=[]):\n    box.append(tag)\n    return box\n\nadd_tag("py")\nprint(add_tag("ai"))`,
    question: "What does the second call print?",
    highlightLine: 6,
    options: [`['ai']`, `['py', 'ai']`, `['py']`, `None`],
    correctIndex: 1,
    traceSteps: [
      "Mutable default arguments (box=[]) are created ONCE when def runs.",
      'First call mutates that shared list to ["py"].',
      'Second call appends "ai" to the same list -> ["py", "ai"].',
    ],
    isPro: false,
  },
  {
    id: "det-py-06",
    track: "python_basics",
    category: "COMPREHENSIONS",
    difficulty: "SLEUTH",
    title: "The Filtered Squares",
    code: `nums = [2, 3, 4, 5]\nout = [x * x for x in nums if x > 2]\nprint(out[1])`,
    question: "What does out[1] print?",
    highlightLine: 3,
    options: ["9", "16", "25", "4"],
    correctIndex: 1,
    traceSteps: [
      "Numbers > 2 are [3, 4, 5].",
      "Squaring them produces out = [9, 16, 25].",
      "Index 1 (the second element) is 16.",
    ],
    isPro: false,
  },

  // --- ALGORITHMS (6 cases: 3 free, 3 Pro) ---
  {
    id: "det-alg-01",
    track: "algorithms",
    category: "TWO POINTERS",
    difficulty: "SLEUTH",
    title: "The Converging Pair",
    code: `arr = [2, 4, 7, 11]\nl, r = 0, len(arr) - 1\nwhile arr[l] + arr[r] != 11:\n    if arr[l] + arr[r] > 11: r -= 1\n    else: l += 1\nprint(l, r)`,
    question: "Which indices (l, r) are printed?",
    highlightLine: 6,
    options: ["0 3", "1 2", "0 2", "1 3"],
    correctIndex: 1,
    traceSteps: [
      "Start: l=0, r=3 -> 2 + 11 = 13 (> 11), so r moves to 2.",
      "Next: l=0, r=2 -> 2 + 7 = 9 (< 11), so l moves to 1.",
      "Next: l=1, r=2 -> 4 + 7 = 11! Loop stops and prints 1 2.",
    ],
    isPro: false,
  },
  {
    id: "det-alg-02",
    track: "algorithms",
    category: "STACK",
    difficulty: "ROOKIE",
    title: "LIFO Bracket Peek",
    code: `stack = []\nfor ch in "([)]":\n    if ch in "([": stack.append(ch)\n    else: stack.pop()\nprint(len(stack))`,
    question: "What does line 5 print?",
    highlightLine: 5,
    options: ["0", "1", "2", "IndexError"],
    correctIndex: 0,
    traceSteps: [
      'Push "(" -> ["("], push "[" -> ["(", "["].',
      'Seeing ")" pops "[" (blindly), seeing "]" pops "(".',
      "Stack ends empty (length 0) — which is why real validators check matching pairs!",
    ],
    isPro: false,
  },
  {
    id: "det-alg-03",
    track: "algorithms",
    category: "BINARY SEARCH",
    difficulty: "SLEUTH",
    title: "Midpoint Hop Count",
    code: `nums = [10, 20, 30, 40, 50]\nlo, hi, hops = 0, 4, 0\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    hops += 1\n    if nums[mid] == 40: break\n    if nums[mid] < 40: lo = mid + 1\n    else: hi = mid - 1\nprint(hops)`,
    question: "How many hops does Binary Search take?",
    highlightLine: 9,
    options: ["1", "2", "3", "4"],
    correctIndex: 1,
    traceSteps: [
      "Hop 1: lo=0, hi=4 -> mid=2 (nums[2]=30 < 40), so lo becomes 3.",
      "Hop 2: lo=3, hi=4 -> mid=3 (nums[3]=40 == 40), break!",
      "Total hops = 2.",
    ],
    isPro: false,
  },
  {
    id: "det-alg-04",
    track: "algorithms",
    category: "SLIDING WINDOW",
    difficulty: "MASTER",
    title: "Peak Window Sum",
    code: `vals = [3, 1, 5, 2, 4]\nwin = sum(vals[:2])\nbest = win\nfor i in range(2, len(vals)):\n    win += vals[i] - vals[i - 2]\n    best = max(best, win)\nprint(best)`,
    question: "What is the maximum 2-element window sum?",
    highlightLine: 7,
    options: ["6", "7", "8", "9"],
    correctIndex: 1,
    traceSteps: [
      "Initial window [3, 1] = 4.",
      "Slide to [1, 5] = 6, then [5, 2] = 7, then [2, 4] = 6.",
      "Highest window sum seen is 7.",
    ],
    isPro: true,
  },
  {
    id: "det-alg-05",
    track: "algorithms",
    category: "RECURSION",
    difficulty: "MASTER",
    title: "Countdown Unwind",
    code: `def climb(n):\n    if n <= 1: return 1\n    return n + climb(n - 2)\nprint(climb(5))`,
    question: "What does climb(5) return?",
    highlightLine: 4,
    options: ["6", "8", "9", "15"],
    correctIndex: 2,
    traceSteps: [
      "climb(5) = 5 + climb(3).",
      "climb(3) = 3 + climb(1), and climb(1) hits base case -> 1.",
      "Unwinding: 5 + 3 + 1 = 9.",
    ],
    isPro: true,
  },
  {
    id: "det-alg-06",
    track: "algorithms",
    category: "HASH MAP",
    difficulty: "SLEUTH",
    title: "Frequency Winner",
    code: `counts = {}\nfor c in "banana":\n    counts[c] = counts.get(c, 0) + 1\nprint(max(counts.values()), len(counts))`,
    question: "What does line 4 print?",
    highlightLine: 4,
    options: ["3 3", "2 3", "3 6", "2 6"],
    correctIndex: 0,
    traceSteps: [
      'Letter counts in "banana": b=1, a=3, n=2.',
      "max(counts.values()) is 3 (for 'a') and len(counts) is 3 unique letters.",
      "Prints 3 3.",
    ],
    isPro: true,
  },

  // --- SYSTEM DESIGN (6 cases: 3 free, 3 Pro) ---
  {
    id: "det-sys-01",
    track: "system_design",
    category: "RATE LIMITER",
    difficulty: "ROOKIE",
    title: "Token Bucket Burst",
    code: `tokens = 3\nallowed = 0\nfor req in range(5):\n    if tokens > 0:\n        tokens -= 1\n        allowed += 1\nprint(allowed, tokens)`,
    question: "What does line 7 print?",
    highlightLine: 7,
    options: ["5 0", "3 0", "3 2", "4 0"],
    correctIndex: 1,
    traceSteps: [
      "First 3 requests consume tokens: 3 -> 2 -> 1 -> 0 (allowed = 3).",
      "Requests 4 and 5 see tokens == 0 and are rejected (HTTP 429).",
      "Prints 3 0.",
    ],
    isPro: false,
  },
  {
    id: "det-sys-02",
    track: "system_design",
    category: "SHARDING",
    difficulty: "SLEUTH",
    title: "Modulo Shard Router",
    code: `shards = ["EU", "US", "AP"]\nuser_ids = [10, 11, 12]\nrouted = [shards[uid % 3] for uid in user_ids]\nprint(routed[0], routed[2])`,
    question: "Which two shards are printed?",
    highlightLine: 4,
    options: ["EU US", "US EU", "AP US", "US AP"],
    correctIndex: 1,
    traceSteps: [
      '10 % 3 = 1 -> shards[1] = "US".',
      '12 % 3 = 0 -> shards[0] = "EU".',
      "Line 4 prints US EU.",
    ],
    isPro: false,
  },
  {
    id: "det-sys-03",
    track: "system_design",
    category: "CACHING",
    difficulty: "ROOKIE",
    title: "Cache Hit Counter",
    code: `cache = {"home"}\nhits = 0\nfor page in ["home", "docs", "home", "docs"]:\n    if page in cache: hits += 1\n    else: cache.add(page)\nprint(hits)`,
    question: "How many cache hits occur?",
    highlightLine: 6,
    options: ["1", "2", "3", "4"],
    correctIndex: 2,
    traceSteps: [
      '"home" -> HIT (1). "docs" -> MISS (cached).',
      'Second "home" -> HIT (2). Second "docs" -> HIT (3).',
      "Total hits = 3.",
    ],
    isPro: false,
  },
  {
    id: "det-sys-04",
    track: "system_design",
    category: "CIRCUIT BREAKER",
    difficulty: "SLEUTH",
    title: "Fail-Fast Trip",
    code: `fails, state = 0, "CLOSED"\nfor ok in [False, False, True, False]:\n    if not ok: fails += 1\n    else: fails = 0\n    if fails >= 2: state = "OPEN"\nprint(state, fails)`,
    question: "What is printed after the loop?",
    highlightLine: 6,
    options: ["OPEN 1", "CLOSED 1", "OPEN 3", "CLOSED 0"],
    correctIndex: 0,
    traceSteps: [
      'Two False values set fails=2 -> state trips to "OPEN".',
      'True resets fails=0 (state stays "OPEN" until half-open probe).',
      "Final False sets fails=1 -> prints OPEN 1.",
    ],
    isPro: true,
  },
  {
    id: "det-sys-05",
    track: "system_design",
    category: "BACKOFF",
    difficulty: "MASTER",
    title: "Exponential Retry Cap",
    code: `delay = 1\nwaits = []\nfor _ in range(4):\n    waits.append(delay)\n    delay = min(delay * 2, 5)\nprint(sum(waits))`,
    question: "What is the total backoff wait time?",
    highlightLine: 6,
    options: ["15", "12", "11", "10"],
    correctIndex: 1,
    traceSteps: [
      "Appended delays: 1 -> 2 -> 4 -> min(8, 5) = 5.",
      "waits = [1, 2, 4, 5].",
      "Sum = 1 + 2 + 4 + 5 = 12.",
    ],
    isPro: true,
  },
  {
    id: "det-sys-06",
    track: "system_design",
    category: "LRU EVICTION",
    difficulty: "MASTER",
    title: "Oldest Key Dropped",
    code: `lru = ["A", "B"]\nfor key in ["A", "C"]:\n    if key in lru: lru.remove(key)\n    elif len(lru) == 2: lru.pop(0)\n    lru.append(key)\nprint(lru[0], lru[1])`,
    question: "Which keys remain in the 2-slot LRU cache?",
    highlightLine: 6,
    options: ["A C", "B C", "C A", "B A"],
    correctIndex: 0,
    traceSteps: [
      'Access "A": promoted to most-recent -> ["B", "A"].',
      'Insert "C": evicts least-recent "B" -> ["A", "C"].',
      "Prints A C.",
    ],
    isPro: true,
  },
] as const;

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = Math.abs(Math.floor(seed)) || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function buildDetectiveSession(options: {
  track?: DetectiveTrack;
  isPremium: boolean;
  count?: number;
  seed?: number;
}): {
  cases: DetectiveCase[];
  lockedCount: number;
} {
  const { track = "all", isPremium, count = 6, seed = Date.now() } = options;
  const inTrack =
    track === "all"
      ? DETECTIVE_CASES
      : DETECTIVE_CASES.filter((c) => c.track === track);

  const playable = isPremium ? inTrack : inTrack.filter((c) => !c.isPro);
  const lockedCount = inTrack.length - playable.length;
  const ordered = seededShuffle(playable, seed);
  return {
    cases: ordered.slice(0, Math.min(count, ordered.length)),
    lockedCount,
  };
}

export function computeDetectiveXp(params: {
  correctCount: number;
  totalCount: number;
  maxStreak: number;
}): number {
  const { correctCount, totalCount, maxStreak } = params;
  if (correctCount <= 0) return 0;
  const baseXp = correctCount * 10;
  const streakBonus = maxStreak >= 3 ? maxStreak * 3 : 0;
  const perfectBonus =
    totalCount > 0 && correctCount === totalCount ? 15 : 0;
  return baseXp + streakBonus + perfectBonus;
}
