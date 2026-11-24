import { isLessonInChapter, TRACK_CHAPTERS } from "../constants/certificates";
import { StudioColors } from "../constants/theme";
import type { Lesson } from "../types/lesson";
import { readLocalJson, writeLocalJson } from "./storage";

export type CodexTrackId = "python_basics" | "algorithms" | "system_design";
export type CodexFilterTab = "all" | CodexTrackId | "pinned";

export const STORAGE_CODEX_PINS_KEY = "devlearn_codex_pins_v1";

export interface CodexEntry {
  id: string;
  track: CodexTrackId;
  chapterId: number;
  chapterRoman: string;
  constellationName: string;
  title: string;
  badge: string;
  complexityLabel: string;
  accent: string;
  summary: string;
  codeSnippet: string;
  keyInvariant: string;
  pitfallWarning: string;
  keywords: readonly string[];
  alwaysUnlocked?: boolean;
}

export const CONSTELLATION_CODEX_ENTRIES: readonly CodexEntry[] = [
  // ── PYTHON FOUNDATIONS (8 ENTRIES: 2 STARTER + CH I..VII) ──
  {
    id: "py-starter-fstrings",
    track: "python_basics",
    chapterId: 1,
    chapterRoman: "I",
    constellationName: "POLARIS",
    title: "Variables, Types & F-Strings",
    badge: "STARTER GRIMOIRE",
    complexityLabel: "O(1) Format",
    accent: StudioColors.yellow,
    summary:
      "Bind clean snake_case names to values and interpolate expressions directly inside f\"...\" templates without manual str() concatenation.",
    codeSnippet: `player_name = "Nova"
xp_earned = 125
multiplier = 1.5

# Evaluate expressions directly inside { }:
total_xp = round(xp_earned * multiplier)
banner = f"{player_name} earned +{total_xp} XP!"
print(banner)`,
    keyInvariant:
      "Prefix the opening quote with f so Python evaluates every {expression} at runtime.",
    pitfallWarning:
      "Forgetting the leading 'f' prints literal curly braces like \"{player_name}\" instead of the variable's value.",
    keywords: ["f-string", "variables", "print", "format", "string", "round", "starter"],
    alwaysUnlocked: true,
  },
  {
    id: "py-ch1-loops-lists",
    track: "python_basics",
    chapterId: 1,
    chapterRoman: "I",
    constellationName: "SERPENS",
    title: "Guard Clauses, Loops & Lists",
    badge: "CH. I · FOUNDATIONS",
    complexityLabel: "O(n) Scan",
    accent: StudioColors.yellow,
    summary:
      "Exit early on edge cases with if/elif/else, then iterate directly over items (or index + item via enumerate) to accumulate clean results.",
    codeSnippet: `def filter_passing_scores(scores):
    if not scores:
        return []

    passed = []
    for idx, score in enumerate(scores):
        if score >= 70:
            passed.append(f"#{idx + 1}: {score}")
    return passed`,
    keyInvariant:
      "Python lists are 0-indexed; 'if not items:' safely catches empty lists in O(1) time.",
    pitfallWarning:
      "Never mutate (pop/remove) the exact list you are currently looping over with 'for x in items:' — build a new list instead.",
    keywords: ["for", "loop", "if", "elif", "else", "enumerate", "list", "append"],
    alwaysUnlocked: true,
  },
  {
    id: "py-ch2-dicts-slicing",
    track: "python_basics",
    chapterId: 2,
    chapterRoman: "II",
    constellationName: "CLAVIS",
    title: "Functions, Slicing & Safe Dicts",
    badge: "CH. II · KEY-VALUE",
    complexityLabel: "O(1) Lookup",
    accent: StudioColors.mint,
    summary:
      "Count frequencies or store key-value state with dict.get(key, default), and slice sequences cleanly with seq[start:stop:step].",
    codeSnippet: `def count_tags(tags):
    counts = {}
    for raw in tags:
        clean = raw.strip().lower()
        counts[clean] = counts.get(clean, 0) + 1
    return counts

# Slicing idioms:
# items[:3]   -> first 3 elements
# items[-2:]  -> last 2 elements
# text[::-1]  -> reversed copy`,
    keyInvariant:
      "dict.get(k, 0) returns 0 when k is absent instead of crashing with a KeyError.",
    pitfallWarning:
      "In seq[start:stop], the 'stop' index is exclusive — nums[1:4] returns indices 1, 2, and 3.",
    keywords: ["dict", "dictionary", "get", "slice", "slicing", "reverse", "def", "strip"],
  },
  {
    id: "py-ch3-sets-classes",
    track: "python_basics",
    chapterId: 3,
    chapterRoman: "III",
    constellationName: "SCUTUM",
    title: "Sets, Try/Except & Classes",
    badge: "CH. III · SAFE OOP",
    complexityLabel: "O(1) Set Hit",
    accent: StudioColors.lime,
    summary:
      "Deduplicate and check membership instantly with set(), guard risky operations with specific try/except blocks, and bundle state in classes.",
    codeSnippet: `class RateCounter:
    def __init__(self, limit):
        self.limit = limit
        self.seen_ids = set()

    def allow(self, req_id):
        if req_id in self.seen_ids:
            return False
        self.seen_ids.add(req_id)
        return len(self.seen_ids) <= self.limit`,
    keyInvariant:
      "'x in my_set' runs in O(1) average time regardless of whether the set holds 10 or 100,000 items.",
    pitfallWarning:
      "Write set() for an empty set — writing {} creates an empty dict, not a set!",
    keywords: ["set", "add", "class", "init", "self", "try", "except", "oop"],
  },
  {
    id: "py-ch4-oneliners",
    track: "python_basics",
    chapterId: 4,
    chapterRoman: "IV",
    constellationName: "SAGITTA",
    title: "Pythonic Built-Ins & String Checks",
    badge: "CH. IV · POWER TOOLS",
    complexityLabel: "O(n) Built-In",
    accent: "#38BDF8",
    summary:
      "Leverage C-speed built-ins like sum(), min(), max(), any(), all(), and expressive string helpers (.startswith, .replace, .join).",
    codeSnippet: `def summarize_urls(urls):
    secure_count = sum(1 for u in urls if u.startswith("https://"))
    slugs = [u.replace("https://", "").strip("/") for u in urls]
    return f"{secure_count}/{len(urls)} secure: " + ", ".join(slugs)`,
    keyInvariant:
      "\"sep\".join(strings) builds a combined string in a single O(n) pass rather than repeated += copies.",
    pitfallWarning:
      ".join() requires every element in the iterable to be a str — convert numbers with str(x) first.",
    keywords: ["sum", "startswith", "endswith", "replace", "join", "any", "all"],
  },
  {
    id: "py-ch5-text-splitting",
    track: "python_basics",
    chapterId: 5,
    chapterRoman: "V",
    constellationName: "PYXIS",
    title: "Tokenizing, Sorting & Tuple Unpacking",
    badge: "CH. V · ESSENTIALS",
    complexityLabel: "O(n log n) Sort",
    accent: StudioColors.pink,
    summary:
      "Split whitespace cleanly with .split(), unpack key-value pairs directly in loops, and rank records with sorted(..., key=...).",
    codeSnippet: `def top_scorer(scoreboard):
    # scoreboard = [("Ada", 92), ("Linus", 98), ("Grace", 95)]
    ranked = sorted(scoreboard, key=lambda pair: (-pair[1], pair[0]))
    winner_name, winner_pts = ranked[0]
    return f"{winner_name} ({winner_pts} pts)"`,
    keyInvariant:
      "Returning a tuple key like (-score, name) sorts descending by score first, breaking ties alphabetically!",
    pitfallWarning:
      "list.sort() mutates the list in-place and returns None; use sorted(items) when you need the sorted list returned.",
    keywords: ["split", "sorted", "lambda", "unpack", "tuple", "in", "key"],
  },
  {
    id: "py-ch6-mini-apps",
    track: "python_basics",
    chapterId: 6,
    chapterRoman: "VI",
    constellationName: "PHAROS",
    title: "State Machines & Clamped Math",
    badge: "CH. VI · MINI-APPS",
    complexityLabel: "O(1) Clamp",
    accent: StudioColors.coral,
    summary:
      "Clamp boundaries with max(lo, min(hi, val)) and structure multi-rule validators as composable pure helper functions.",
    codeSnippet: `def apply_damage(hp, raw_dmg, armor):
    effective = max(1, raw_dmg - armor)
    next_hp = max(0, min(100, hp - effective))
    status = "KO" if next_hp == 0 else "ACTIVE"
    return {"hp": next_hp, "status": status}`,
    keyInvariant:
      "max(low, min(high, value)) guarantees a numeric result stays inside [low, high] without nested if/else branches.",
    pitfallWarning:
      "Use // for integer floor division in Python 3; single / always produces a float (e.g. 5 / 2 == 2.5).",
    keywords: ["clamp", "min", "max", "floor", "division", "project", "state"],
  },
  {
    id: "py-ch7-modern-python",
    track: "python_basics",
    chapterId: 7,
    chapterRoman: "VII",
    constellationName: "CORONA",
    title: "Comprehensions & Wrapper Decorators",
    badge: "CH. VII · MODERN PY",
    complexityLabel: "Declarative",
    accent: StudioColors.violet,
    summary:
      "Transform and filter data concisely with list/dict comprehensions, and wrap cross-cutting behavior cleanly with higher-order decorators.",
    codeSnippet: `from functools import wraps

def trace_calls(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        result = fn(*args, **kwargs)
        return result
    return wrapper

# Dict comprehension: invert {user: role} -> {role: user}
inverted = {role: user for user, role in [("ada", "admin")]}`,
    keyInvariant:
      "@wraps(fn) preserves the wrapped function's __name__ and docstring for debugging and test runners.",
    pitfallWarning:
      "Keep comprehensions to a single Transformation + Filter; if you need 3 nested loops, a regular for-loop is far clearer.",
    keywords: ["comprehension", "decorator", "wraps", "args", "kwargs", "regex"],
  },

  // ── ALGORITHMIC MASTERY (7 ENTRIES: CH I..VII) ──
  {
    id: "algo-ch1-sliding-two-ptr",
    track: "algorithms",
    chapterId: 1,
    chapterRoman: "I",
    constellationName: "SERPENS",
    title: "Hash Complement & Sliding Window",
    badge: "ALGO CH. I · O(n)",
    complexityLabel: "O(n) Time · O(k) Space",
    accent: StudioColors.mint,
    summary:
      "Eliminate O(n²) nested loops either by storing seen complements in a hash map or by expanding/shrinking a [left..right] window.",
    codeSnippet: `def longest_subarray_under_limit(nums, limit):
    left = 0
    window_sum = 0
    best = 0
    for right, val in enumerate(nums):
        window_sum += val
        while window_sum > limit:
            window_sum -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
    keyInvariant:
      "Even with a while-loop inside a for-loop, 'left' only moves forward at most n times — total work stays O(n)!",
    pitfallWarning:
      "Shrinking Sliding Window Sums requires non-negative numbers; if negatives exist, use Prefix Sums + Hash Map instead.",
    keywords: ["sliding window", "two pointers", "two sum", "hash map", "subarray"],
  },
  {
    id: "algo-ch2-stack-recursion",
    track: "algorithms",
    chapterId: 2,
    chapterRoman: "II",
    constellationName: "CLAVIS",
    title: "Monotonic / LIFO Stack & List Reversal",
    badge: "ALGO CH. II · LIFO",
    complexityLabel: "O(n) Time",
    accent: StudioColors.yellow,
    summary:
      "Use a list as a LIFO stack (.append / .pop) to validate nested delimiters or track next-greater elements in a single pass.",
    codeSnippet: `def is_balanced(brackets):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in brackets:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return len(stack) == 0`,
    keyInvariant:
      "A valid nested sequence must BOTH match every closing token AND leave the stack completely empty at the end.",
    pitfallWarning:
      "Always check 'if not stack:' before calling stack.pop() so a leading ')' doesn't raise IndexError.",
    keywords: ["stack", "lifo", "parentheses", "brackets", "linked list", "recursion"],
  },
  {
    id: "algo-ch3-binary-prefix",
    track: "algorithms",
    chapterId: 3,
    chapterRoman: "III",
    constellationName: "SCUTUM",
    title: "Lower-Bound Binary Search & Prefix Sums",
    badge: "ALGO CH. III · O(log n)",
    complexityLabel: "O(log n) Chop",
    accent: "#38BDF8",
    summary:
      "Halve sorted search spaces or monotonic answer ranges with lo <= hi, and precompute prefix sums for O(1) range queries.",
    codeSnippet: `def lower_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo  # First index i where nums[i] >= target`,
    keyInvariant:
      "When searching for the first True boundary, set hi = mid (keep mid in play) and lo = mid + 1 (discard false left half).",
    pitfallWarning:
      "Binary search silently returns wrong answers on unsorted arrays — verify monotonic order before applying it!",
    keywords: ["binary search", "lower bound", "prefix sum", "mid", "monotonic"],
  },
  {
    id: "algo-ch4-custom-sort-partition",
    track: "algorithms",
    chapterId: 4,
    chapterRoman: "IV",
    constellationName: "SAGITTA",
    title: "Two-Pointer Partition & Multi-Key Sort",
    badge: "ALGO CH. IV · PARTITION",
    complexityLabel: "O(n) In-Place",
    accent: StudioColors.lime,
    summary:
      "Maintain a write-cursor slow pointer to compact or partition elements in-place while preserving relative order.",
    codeSnippet: `def move_zeros_in_place(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums`,
    keyInvariant:
      "Every index strictly before 'write' holds a finalized non-zero item in its original relative order.",
    pitfallWarning:
      "Swapping nums[write] and nums[read] handles write == read safely without erasing non-zero values.",
    keywords: ["partition", "in-place", "write pointer", "runner up", "sort"],
  },
  {
    id: "algo-ch5-inverted-index",
    track: "algorithms",
    chapterId: 5,
    chapterRoman: "V",
    constellationName: "PYXIS",
    title: "Two-Pointer Palindrome & Inverted Index",
    badge: "ALGO CH. V · INDEXING",
    complexityLabel: "O(n) Scan",
    accent: StudioColors.pink,
    summary:
      "Converge left/right pointers inward skipping noise characters, or group records into dict.setdefault(key, []) buckets.",
    codeSnippet: `def build_inverted_index(docs):
    # docs = {"doc1": ["cache", "redis"], "doc2": ["redis", "ttl"]}
    index = {}
    for doc_id, words in docs.items():
        for word in set(words):
            index.setdefault(word, []).append(doc_id)
    return index`,
    keyInvariant:
      "Wrapping words in set(words) per document prevents duplicate doc_ids when a word appears twice in one file.",
    pitfallWarning:
      "Don't use dict.fromkeys(keys, []) — every key will share the exact same mutable list reference!",
    keywords: ["palindrome", "inverted index", "setdefault", "defaultdict", "duplicate"],
  },
  {
    id: "algo-ch6-intervals-topk",
    track: "algorithms",
    chapterId: 6,
    chapterRoman: "VI",
    constellationName: "PHAROS",
    title: "Merge Intervals & Canonical Anagram Keys",
    badge: "ALGO CH. VI · CAPSTONES",
    complexityLabel: "O(n log n)",
    accent: StudioColors.coral,
    summary:
      "Sort intervals by start time so overlapping ranges become adjacent, and group anagrams using tuple(sorted(word)) keys.",
    codeSnippet: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda iv: iv[0])
    merged = [ordered[0][:]]
    for start, end in ordered[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    keyInvariant:
      "Once sorted by start, if interval[i].start <= merged[-1].end, they overlap; extend end with max() in case one wraps the other.",
    pitfallWarning:
      "Use max(merged[-1][1], end) rather than blindly assigning end — [1, 10] followed by [2, 5] must stay [1, 10]!",
    keywords: ["intervals", "merge", "anagram", "greedy", "top k", "capstone"],
  },
  {
    id: "algo-ch7-bfs-heap-dp",
    track: "algorithms",
    chapterId: 7,
    chapterRoman: "VII",
    constellationName: "CORONA",
    title: "Shortest-Path BFS, Min-Heap & 1D DP",
    badge: "ALGO CH. VII · GRAPHS & DP",
    complexityLabel: "O(V + E) / O(n log k)",
    accent: StudioColors.violet,
    summary:
      "Use collections.deque for unweighted shortest paths, heapq for streaming Top-K, and bottom-up DP tables for optimal subproblems.",
    codeSnippet: `from collections import deque
import heapq

def k_largest(nums, k):
    # Maintain a min-heap of size k -> root heap[0] is the k-th largest
    heap = nums[:k]
    heapq.heapify(heap)
    for val in nums[k:]:
        if val > heap[0]:
            heapq.heapreplace(heap, val)
    return sorted(heap, reverse=True)`,
    keyInvariant:
      "Mark graph nodes 'visited' the moment you ENQUEUE them into deque — not when popping — to prevent duplicate queue explosion.",
    pitfallWarning:
      "Python's heapq is a MIN-heap; negate numbers (-val) when you need max-heap pop behavior.",
    keywords: ["bfs", "deque", "queue", "heapq", "min heap", "dp", "dynamic programming", "graph"],
  },

  // ── SYSTEM ARCHITECTURE (6 ENTRIES: CH I..VI) ──
  {
    id: "sys-ch1-lru-ratelimit",
    track: "system_design",
    chapterId: 1,
    chapterRoman: "I",
    constellationName: "SERPENS",
    title: "LRU Cache Eviction & Sharding Keys",
    badge: "SYS CH. I · CACHING",
    complexityLabel: "O(1) Get/Put",
    accent: StudioColors.mint,
    summary:
      "Combine hash lookup with recency ordering via OrderedDict to evict cold keys in O(1) and route shards deterministically.",
    codeSnippet: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.store = OrderedDict()

    def get(self, key):
        if key not in self.store:
            return None
        self.store.move_to_end(key)
        return self.store[key]

    def put(self, key, val):
        self.store[key] = val
        self.store.move_to_end(key)
        if len(self.store) > self.cap:
            self.store.popitem(last=False)`,
    keyInvariant:
      "Both get() and put() promote the touched key to the MRU tail; popitem(last=False) evicts the oldest LRU head in O(1).",
    pitfallWarning:
      "Sharding by hash(user_id) % N reshuffles nearly all keys if N changes — use Consistent Hashing for elastic clusters.",
    keywords: ["lru", "cache", "ordereddict", "eviction", "sharding", "load balancer"],
  },
  {
    id: "sys-ch2-circuit-quorum",
    track: "system_design",
    chapterId: 2,
    chapterRoman: "II",
    constellationName: "CLAVIS",
    title: "Circuit Breaker & R + W > N Quorum",
    badge: "SYS CH. II · CONSENSUS",
    complexityLabel: "Fault Isolation",
    accent: StudioColors.yellow,
    summary:
      "Trip CLOSED -> OPEN after consecutive downstream failures to stop cascading outages, and enforce R + W > N for strong quorum overlap.",
    codeSnippet: `def has_strong_quorum(replicas_n, write_acks, read_acks):
    # At least one replica in read_acks must hold the latest write:
    return (
        write_acks > 0
        and read_acks > 0
        and (write_acks + read_acks) > replicas_n
    )`,
    keyInvariant:
      "With N=3 replicas, W=2 and R=2 satisfies 2 + 2 > 3 while tolerating 1 node crash without downtime.",
    pitfallWarning:
      "An OPEN circuit breaker must transition to HALF-OPEN after a cooldown probe — otherwise recovery never happens automatically.",
    keywords: ["circuit breaker", "quorum", "consensus", "pubsub", "consistent hashing"],
  },
  {
    id: "sys-ch3-backoff-dlq",
    track: "system_design",
    chapterId: 3,
    chapterRoman: "III",
    constellationName: "SCUTUM",
    title: "Exponential Backoff + Jitter & DLQ",
    badge: "SYS CH. III · RESILIENCE",
    complexityLabel: "Anti-Stampede",
    accent: "#38BDF8",
    summary:
      "Cap exponential retry delays and add deterministic/random jitter to prevent synchronized thundering herds, routing poison messages to a DLQ.",
    codeSnippet: `def compute_backoff_ms(attempt, base_ms=100, cap_ms=5000, jitter_ratio=0.5):
    # Exponential growth capped at cap_ms:
    raw = min(cap_ms, base_ms * (2 ** attempt))
    # Full/equal jitter spreads retry storms across time:
    return round(raw * (0.5 + 0.5 * jitter_ratio))`,
    keyInvariant:
      "Idempotency keys are mandatory whenever retries are enabled so network timeouts never double-charge a user.",
    pitfallWarning:
      "Exponential backoff WITHOUT jitter still hammers a recovering database in synchronized waves!",
    keywords: ["backoff", "jitter", "retry", "dlq", "dead letter queue", "failover", "cdn"],
  },
  {
    id: "sys-ch4-rollouts-autoscaling",
    track: "system_design",
    chapterId: 4,
    chapterRoman: "IV",
    constellationName: "SAGITTA",
    title: "Sticky Feature Rollouts & Flap Guards",
    badge: "SYS CH. IV · ROLLOUTS",
    complexityLabel: "O(1) Deterministic",
    accent: StudioColors.lime,
    summary:
      "Bucket users deterministically into 0..99 rollout cohorts using stable hashing so a user never flickers between flag states.",
    codeSnippet: `import hashlib

def is_feature_enabled(user_id, flag_name, rollout_pct):
    if rollout_pct <= 0:
        return False
    if rollout_pct >= 100:
        return True
    digest = hashlib.sha256(f"{flag_name}:{user_id}".encode()).hexdigest()
    bucket = int(digest[:8], 16) % 100
    return bucket < rollout_pct`,
    keyInvariant:
      "Salting the hash with flag_name ensures the same 5% of users aren't picked as guinea pigs for every single experiment!",
    pitfallWarning:
      "Never use Python's built-in hash() across processes — PYTHONHASHSEED randomizes it on every server restart.",
    keywords: ["feature flag", "rollout", "canary", "sha256", "autoscale", "alarm"],
  },
  {
    id: "sys-ch5-cursor-cache-aside",
    track: "system_design",
    chapterId: 5,
    chapterRoman: "V",
    constellationName: "PYXIS",
    title: "Cursor Pagination & Cache-Aside Reads",
    badge: "SYS CH. V · DATA FLOW",
    complexityLabel: "O(limit) Seek",
    accent: StudioColors.pink,
    summary:
      "Paginate large feeds with seek cursors (WHERE id < cursor) instead of slow OFFSET scans, and populate cache lazily on misses.",
    codeSnippet: `def cache_aside_get(key, cache, db_fetch_fn, ttl_sec=300):
    cached = cache.get(key)
    if cached is not None:
        return cached, "HIT"

    fresh = db_fetch_fn(key)
    if fresh is not None:
        cache[key] = fresh
    return fresh, "MISS"`,
    keyInvariant:
      "On writes, INVALIDATE (delete) the cache key rather than racing two concurrent DB-to-cache updates out of order.",
    pitfallWarning:
      "OFFSET 100000 forces the database to scan and discard 100,000 rows; keyset cursor pagination seeks directly via index.",
    keywords: ["cursor", "pagination", "cache aside", "ttl", "batch", "auth"],
  },
  {
    id: "sys-ch6-token-bucket",
    track: "system_design",
    chapterId: 6,
    chapterRoman: "VI",
    constellationName: "PHAROS",
    title: "Token Bucket & Sliding Window Limiter",
    badge: "SYS CH. VI · CAPSTONES",
    complexityLabel: "O(1) State",
    accent: StudioColors.coral,
    summary:
      "Refill tokens lazily based on elapsed timestamps (now - last_refill) * rate, capping burst capacity cleanly without background timers.",
    codeSnippet: `class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        self.cap = float(capacity)
        self.rate = float(refill_per_sec)
        self.tokens = float(capacity)
        self.last_ts = 0.0

    def allow(self, now_sec, cost=1.0):
        elapsed = max(0.0, now_sec - self.last_ts)
        self.tokens = min(self.cap, self.tokens + elapsed * self.rate)
        self.last_ts = now_sec
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False`,
    keyInvariant:
      "Lazy timestamp math updates tokens only when a request arrives — zero background cron threads needed per user!",
    pitfallWarning:
      "Clamp elapsed = max(0.0, now - last_ts) so minor NTP clock skew never subtracts tokens.",
    keywords: ["token bucket", "rate limit", "burst", "sliding window", "hash ring"],
  },
] as const;

export interface ResolvedCodexEntry {
  entry: CodexEntry;
  unlocked: boolean;
  pinned: boolean;
  solvedInChapter: number;
  totalInChapter: number;
  chapterTitle: string;
}

/**
 * Resolves unlock status, chapter progress, and pin state for all 21 Codex entries.
 * An entry unlocks automatically when `entry.alwaysUnlocked` is true, `unlockAllOverride` is set,
 * or the user has completed at least 1 lesson inside that track's matching chapter.
 */
export function resolveCodexEntries(
  lessons: readonly Lesson[],
  completedLessons: Record<string, boolean>,
  pinnedIds: readonly string[] = [],
  unlockAllOverride = false,
): ResolvedCodexEntry[] {
  const pinnedSet = new Set(pinnedIds);

  return CONSTELLATION_CODEX_ENTRIES.map((entry) => {
    const chapters = TRACK_CHAPTERS[entry.track] || [];
    const chapterMeta = chapters.find((ch) => ch.id === entry.chapterId);
    const chapterLessons = chapterMeta
      ? lessons.filter(
          (l) => l.track === entry.track && isLessonInChapter(l, chapterMeta),
        )
      : [];
    const solvedInChapter = chapterLessons.filter(
      (l) => completedLessons[l.id],
    ).length;

    const unlocked = Boolean(
      unlockAllOverride || entry.alwaysUnlocked || solvedInChapter > 0,
    );

    return {
      entry,
      unlocked,
      pinned: pinnedSet.has(entry.id),
      solvedInChapter,
      totalInChapter: chapterLessons.length,
      chapterTitle: chapterMeta?.title || entry.badge,
    };
  });
}

/**
 * Finds the first unsolved lesson in the entry's chapter so a learner clicking a
 * locked Codex card can jump directly to the lesson that illuminates it.
 */
export function findUnlockLessonForEntry(
  entry: CodexEntry,
  lessons: readonly Lesson[],
  completedLessons: Record<string, boolean>,
): Lesson | null {
  const chapters = TRACK_CHAPTERS[entry.track] || [];
  const chapterMeta = chapters.find((ch) => ch.id === entry.chapterId);
  const candidates = lessons
    .filter(
      (l) =>
        l.track === entry.track &&
        !l.is_recap &&
        (chapterMeta ? isLessonInChapter(l, chapterMeta) : true),
    )
    .sort((a, b) => a.lesson_order - b.lesson_order);

  return candidates.find((l) => !completedLessons[l.id]) || candidates[0] || null;
}

/**
 * Filters resolved Codex entries by track/pin tab and multi-token search query.
 */
export function filterCodexEntries(
  resolved: readonly ResolvedCodexEntry[],
  tab: CodexFilterTab,
  query: string,
): ResolvedCodexEntry[] {
  const byTab = resolved.filter((item) => {
    if (tab === "pinned") return item.pinned;
    if (tab === "all") return true;
    return item.entry.track === tab;
  });

  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    // Show pinned unlocked items first when viewing "all", preserving natural chapter order within groups
    if (tab === "all") {
      return [...byTab].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return 0;
      });
    }
    return byTab;
  }

  return byTab.filter(({ entry, chapterTitle }) => {
    const haystack = [
      entry.title,
      entry.badge,
      entry.constellationName,
      entry.complexityLabel,
      entry.summary,
      entry.codeSnippet,
      entry.keyInvariant,
      chapterTitle,
      ...entry.keywords,
    ]
      .join(" ")
      .toLowerCase();

    return tokens.every((tok) => haystack.includes(tok));
  });
}

export function readPinnedCodexIds(): string[] {
  const raw = readLocalJson<unknown>(STORAGE_CODEX_PINS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string");
}

export function togglePinnedCodexId(
  currentPins: readonly string[],
  entryId: string,
): string[] {
  const exists = currentPins.includes(entryId);
  const next = exists
    ? currentPins.filter((id) => id !== entryId)
    : [...currentPins, entryId];
  writeLocalJson(STORAGE_CODEX_PINS_KEY, next);
  return next;
}
