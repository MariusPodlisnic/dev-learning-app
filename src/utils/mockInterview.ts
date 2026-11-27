import type { TestCaseResult } from "../types/lesson";
import { readLocalJson, writeLocalJson } from "./storage";

export const STORAGE_MOCK_INTERVIEW_KEY = "devlearn_mock_interview_v1";
export const INTERVIEW_DURATION_SEC = 25 * 60; // 25:00 standard loop

export type InterviewLoopId =
  | "intern_backend_loop"
  | "swe_product_loop"
  | "senior_fintech_loop"
  | "staff_distributed_loop";

export type InterviewComplexity = "O(1)" | "O(n)" | "O(n log n)" | "O(n²)";

export type HiringVerdict =
  | "strong_hire"
  | "hire"
  | "lean_hire"
  | "no_hire";

export interface InterviewRoundSpec {
  id: string;
  roundNumber: 1 | 2;
  categoryBadge: "ROUND 1 · ALGORITHMS" | "ROUND 2 · SYSTEMS";
  title: string;
  targetComplexity: InterviewComplexity;
  prompt: string;
  constraints: readonly string[];
  exampleInput: string;
  exampleOutput: string;
  exampleNote: string;
  starterCode: string;
  interviewerNudge: string;
  referenceSolution: string;
  verificationHarness: string;
}

export interface InterviewLoopSpec {
  id: InterviewLoopId;
  levelBadge: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  accent: string;
  isPro: boolean;
  durationSec: number;
  baseXp: number;
  rounds: readonly [InterviewRoundSpec, InterviewRoundSpec];
}

export interface InterviewLoopRecord {
  bestScore: number;
  bestVerdict: HiringVerdict;
  fastestSecondsUsed: number;
  attempts: number;
}

export type MockInterviewRecordsMap = Partial<
  Record<InterviewLoopId, InterviewLoopRecord>
>;

export interface RoundSubmissionSnapshot {
  code: string;
  results: TestCaseResult[];
  allPassed: boolean;
  usedNudge: boolean;
}

export interface RoundRubricReport {
  roundId: string;
  title: string;
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  estimatedComplexity: InterviewComplexity;
  targetComplexity: InterviewComplexity;
  meetsComplexity: boolean;
  usedNudge: boolean;
  debriefNote: string;
}

export interface InterviewScorecard {
  totalScore: number; // 0..100
  correctnessScore: number; // 0..45
  complexityScore: number; // 0..25
  autonomyScore: number; // 0..15
  pacingScore: number; // 0..15
  verdict: HiringVerdict;
  verdictLabel: string;
  verdictSummary: string;
  secondsUsed: number;
  bothRoundsPassed: boolean;
  roundReports: readonly [RoundRubricReport, RoundRubricReport];
}

const COMPLEXITY_RANK: Record<InterviewComplexity, number> = {
  "O(1)": 0,
  "O(n)": 1,
  "O(n log n)": 2,
  "O(n²)": 3,
};

const VERDICT_RANK: Record<HiringVerdict, number> = {
  no_hire: 0,
  lean_hire: 1,
  hire: 2,
  strong_hire: 3,
};

export const MOCK_INTERVIEW_LOOPS: readonly InterviewLoopSpec[] = [
  {
    id: "intern_backend_loop",
    levelBadge: "L3 · INTERN / JUNIOR",
    title: "Junior Backend Loop: Stacks & Dedupe",
    shortTitle: "JUNIOR LOOP",
    subtitle:
      "Validate nested syntax brackets in O(n), then filter duplicate webhook retries while preserving arrival order.",
    accent: "#6EE7B7",
    isPro: false,
    durationSec: INTERVIEW_DURATION_SEC,
    baseXp: 110,
    rounds: [
      {
        id: "intern-r1-brackets",
        roundNumber: 1,
        categoryBadge: "ROUND 1 · ALGORITHMS",
        title: "Balanced Delimiter Validator",
        targetComplexity: "O(n)",
        prompt:
          "Implement `is_valid_brackets(s)` that returns `True` if every `()`, `[]`, and `{}` bracket in `s` closes in the exact LIFO order, ignoring any non-bracket characters.",
        constraints: [
          "Return True on an empty string or string with no brackets.",
          "Ignore letters/digits (e.g. 'fn(a[0])' -> True).",
          "Target Time: O(n) single pass with a list stack.",
        ],
        exampleInput: 's = "fn(items[0]) + {ok}"',
        exampleOutput: "True",
        exampleNote:
          "Each closing bracket matches the most recent unclosed opener.",
        starterCode: `def is_valid_brackets(s: str) -> bool:
    pass`,
        interviewerNudge:
          "Map closing brackets `')': '(', ']': '[', '}': '{'}`. Push openers onto `stack = []`, and whenever you see a closer, verify `stack` is non-empty and `stack.pop()` matches!",
        referenceSolution: `def is_valid_brackets(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    openers = set(pairs.values())
    stack = []
    for ch in s:
        if ch in openers:
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0`,
        verificationHarness: `
import json
__cases__ = [
    ("is_valid_brackets('fn(items[0]) + {ok}')", lambda: is_valid_brackets("fn(items[0]) + {ok}"), True),
    ("is_valid_brackets('([)]')", lambda: is_valid_brackets("([)]"), False),
    ("is_valid_brackets('(((')", lambda: is_valid_brackets("((("), False),
    ("is_valid_brackets(']')", lambda: is_valid_brackets("]"), False),
    ("is_valid_brackets('')", lambda: is_valid_brackets(""), True),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = (__act__ == __exp__) and (type(__act__) is bool)
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
      {
        id: "intern-r2-dedupe",
        roundNumber: 2,
        categoryBadge: "ROUND 2 · SYSTEMS",
        title: "Idempotent Event Stream Filter",
        targetComplexity: "O(n)",
        prompt:
          "Payment webhooks can deliver duplicate `id`s during network retries. Implement `dedupe_webhook_events(events)` where each item is a dict `{'id': str, 'amount': int}`. Return a list of unique event IDs in first-seen order, skipping events with `amount <= 0`.",
        constraints: [
          "Skip any event whose amount <= 0 before recording its ID.",
          "Preserve exact first-seen order of valid unique event IDs.",
          "Target Time: O(n) using a set (avoid `id in result_list`).",
        ],
        exampleInput:
          'events = [{"id": "e1", "amount": 50}, {"id": "e1", "amount": 50}, {"id": "e2", "amount": 0}, {"id": "e3", "amount": 20}]',
        exampleOutput: '["e1", "e3"]',
        exampleNote:
          "'e1' is kept once, 'e2' has non-positive amount so it is ignored, and 'e3' is kept.",
        starterCode: `def dedupe_webhook_events(events: list) -> list:
    pass`,
        interviewerNudge:
          "Keep `seen = set()` and `accepted = []`. Ignore `ev['amount'] <= 0`; otherwise if `ev['id'] not in seen`, add to both `seen` and `accepted`.",
        referenceSolution: `def dedupe_webhook_events(events: list) -> list:
    seen = set()
    accepted = []
    for ev in events:
        if ev.get("amount", 0) <= 0:
            continue
        ev_id = ev["id"]
        if ev_id not in seen:
            seen.add(ev_id)
            accepted.append(ev_id)
    return accepted`,
        verificationHarness: `
import json
__cases__ = [
    ("standard retry stream", lambda: dedupe_webhook_events([{"id": "e1", "amount": 50}, {"id": "e1", "amount": 50}, {"id": "e2", "amount": 0}, {"id": "e3", "amount": 20}]), ["e1", "e3"]),
    ("negative refund ignored first, positive later kept", lambda: dedupe_webhook_events([{"id": "x1", "amount": -10}, {"id": "x1", "amount": 25}]), ["x1"]),
    ("empty batch", lambda: dedupe_webhook_events([]), []),
    ("all duplicates", lambda: dedupe_webhook_events([{"id": "a", "amount": 10}] * 6), ["a"]),
    ("1,000 events linear check", lambda: len(dedupe_webhook_events([{"id": f"k{i % 250}", "amount": 5} for i in range(1000)])), 250),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
    ],
  },
  {
    id: "swe_product_loop",
    levelBadge: "L4 · SOFTWARE ENGINEER",
    title: "Product SWE Loop: Sliding Windows & Rate Limiting",
    shortTitle: "SWE LOOP",
    subtitle:
      "Find longest unique user session streaks in O(n), then enforce a sliding-window API rate limiter.",
    accent: "#38BDF8",
    isPro: true,
    durationSec: INTERVIEW_DURATION_SEC,
    baseXp: 135,
    rounds: [
      {
        id: "swe-r1-window",
        roundNumber: 1,
        categoryBadge: "ROUND 1 · ALGORITHMS",
        title: "Longest Unique Action Streak",
        targetComplexity: "O(n)",
        prompt:
          "Given a list of user action names `actions`, implement `longest_unique_streak(actions)` returning the maximum length of a contiguous subarray with zero duplicate actions.",
        constraints: [
          "Return 0 if `actions` is empty.",
          "Target Time: O(n) two-pointer sliding window (avoid O(n²) rescanning).",
        ],
        exampleInput: 'actions = ["open", "run", "hint", "run", "test", "ship"]',
        exampleOutput: "4",
        exampleNote:
          'The contiguous window ["hint", "run", "test", "ship"] has 4 unique actions.',
        starterCode: `def longest_unique_streak(actions: list) -> int:
    pass`,
        interviewerNudge:
          "Track `last_idx = {}` and `left = 0`. When `act` was seen at `last_idx[act] >= left`, jump `left = last_idx[act] + 1`, then update `best = max(best, right - left + 1)`.",
        referenceSolution: `def longest_unique_streak(actions: list) -> int:
    last_idx = {}
    left = 0
    best = 0
    for right, act in enumerate(actions):
        if act in last_idx and last_idx[act] >= left:
            left = last_idx[act] + 1
        last_idx[act] = right
        if right - left + 1 > best:
            best = right - left + 1
    return best`,
        verificationHarness: `
import json
__cases__ = [
    ("mixed session actions", lambda: longest_unique_streak(["open", "run", "hint", "run", "test", "ship"]), 4),
    ("all identical", lambda: longest_unique_streak(["click", "click", "click"]), 1),
    ("empty list", lambda: longest_unique_streak([]), 0),
    ("jump left pointer past stale duplicate", lambda: longest_unique_streak(["a", "b", "b", "a"]), 2),
    ("all unique", lambda: longest_unique_streak(["a", "b", "c", "d", "e"]), 5),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
      {
        id: "swe-r2-ratelimit",
        roundNumber: 2,
        categoryBadge: "ROUND 2 · SYSTEMS",
        title: "Sliding-Window API Rate Limiter",
        targetComplexity: "O(n)",
        prompt:
          "Given chronologically sorted request `timestamps` (in seconds), `limit` max requests, and `window_sec`, implement `allow_requests(timestamps, limit, window_sec)` returning a list of booleans (`True` if allowed, `False` if throttled). A request at `t` counts accepted requests in `(t - window_sec, t]` (strictly older than `t - window_sec` expire).",
        constraints: [
          "Rejected (`False`) requests do NOT consume quota in the window.",
          "If a previous accepted request was at `t - window_sec`, it has expired (`now - old >= window_sec`).",
          "Target Time: O(n) using `collections.deque`.",
        ],
        exampleInput: "timestamps = [1, 2, 3, 11], limit = 2, window_sec = 10",
        exampleOutput: "[True, True, False, True]",
        exampleNote:
          "t=1 and t=2 pass (quota full); t=3 is blocked; at t=11, t=1 has expired (11 - 1 >= 10), so t=11 passes.",
        starterCode: `from collections import deque

def allow_requests(timestamps: list, limit: int, window_sec: int) -> list:
    pass`,
        interviewerNudge:
          "Maintain `q = deque()` of accepted timestamps. For each `t`, `while q and t - q[0] >= window_sec: q.popleft()`. If `len(q) < limit`, append `t` to `q` and record `True`; else record `False`.",
        referenceSolution: `from collections import deque

def allow_requests(timestamps: list, limit: int, window_sec: int) -> list:
    q = deque()
    verdicts = []
    for t in timestamps:
        while q and t - q[0] >= window_sec:
            q.popleft()
        if len(q) < limit:
            q.append(t)
            verdicts.append(True)
        else:
            verdicts.append(False)
    return verdicts`,
        verificationHarness: `
import json
__cases__ = [
    ("boundary expiry at t=11", lambda: allow_requests([1, 2, 3, 11], 2, 10), [True, True, False, True]),
    ("blocked requests do not consume quota", lambda: allow_requests([0, 1, 2, 5, 6], 2, 5), [True, True, False, True, True]),
    ("zero limit blocks all", lambda: allow_requests([1, 5, 10], 0, 10), [False, False, False]),
    ("empty stream", lambda: allow_requests([], 3, 60), []),
    ("burst at identical timestamp", lambda: allow_requests([4, 4, 4], 2, 10), [True, True, False]),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
    ],
  },
  {
    id: "senior_fintech_loop",
    levelBadge: "L5 · SENIOR BACKEND",
    title: "Senior Fintech Loop: Prefix Ledgers & HMAC Security",
    shortTitle: "FINTECH LOOP",
    subtitle:
      "Count exact-sum payout slices with negatives in O(n), then verify HMAC-SHA256 webhooks with replay protection.",
    accent: "#FF90E8",
    isPro: true,
    durationSec: INTERVIEW_DURATION_SEC,
    baseXp: 150,
    rounds: [
      {
        id: "fintech-r1-prefix",
        roundNumber: 1,
        categoryBadge: "ROUND 1 · ALGORITHMS",
        title: "Exact Target Ledger Slices",
        targetComplexity: "O(n)",
        prompt:
          "Ledger entries `amounts` can contain positive charges, `0`, and negative refunds. Implement `count_exact_windows(amounts, target)` returning the total number of contiguous subarrays that sum to `target`.",
        constraints: [
          "Sliding window fails here because negative numbers can shrink/grow sums.",
          "Target Time: O(n) using running prefix sums + frequency hash map `{0: 1}`.",
        ],
        exampleInput: "amounts = [10, -5, 5, 10], target = 10",
        exampleOutput: "4",
        exampleNote:
          "Matching contiguous slices: [10] (idx 0), [10, -5, 5], [-5, 5, 10], and [10] (idx 3).",
        starterCode: `def count_exact_windows(amounts: list, target: int) -> int:
    pass`,
        interviewerNudge:
          "Initialize `prefix_counts = {0: 1}`, `running = 0`, `total = 0`. For each `x`, add `x` to `running`, add `prefix_counts.get(running - target, 0)` to `total`, then increment `prefix_counts[running]`!",
        referenceSolution: `def count_exact_windows(amounts: list, target: int) -> int:
    prefix_counts = {0: 1}
    running = 0
    total = 0
    for x in amounts:
        running += x
        total += prefix_counts.get(running - target, 0)
        prefix_counts[running] = prefix_counts.get(running, 0) + 1
    return total`,
        verificationHarness: `
import json
__cases__ = [
    ("charges with refund", lambda: count_exact_windows([10, -5, 5, 10], 10), 4),
    ("zeros create multiple windows", lambda: count_exact_windows([0, 0, 0], 0), 6),
    ("negative target", lambda: count_exact_windows([2, -4, 2, -2], -2), 4),
    ("no matching slice", lambda: count_exact_windows([5, 5, 5], 3), 0),
    ("empty ledger", lambda: count_exact_windows([], 0), 0),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
      {
        id: "fintech-r2-hmac",
        roundNumber: 2,
        categoryBadge: "ROUND 2 · SYSTEMS",
        title: "Constant-Time Webhook Verifier",
        targetComplexity: "O(n)",
        prompt:
          "Implement `verify_signed_webhook(raw_body, ts, sig_hex, secret, now_ts)` for a payment webhook endpoint:\n1. If `abs(now_ts - ts) > 300`, return `'EXPIRED'`.\n2. Compute HMAC-SHA256 hex digest of `f'{ts}.{raw_body}'` using `secret`.\n3. Compare with `hmac.compare_digest` — return `'VALID'` if equal, else `'INVALID_SIG'`.",
        constraints: [
          "Check timestamp drift (> 300s) first.",
          "Sign the exact message `f'{ts}.{raw_body}'.encode('utf-8')`.",
          "Use `hmac.compare_digest` for constant-time signature verification.",
        ],
        exampleInput:
          'raw_body=\'{"ok":1}\', ts=1000, sig_hex=<hmac>, secret="whsec_test", now_ts=1120',
        exampleOutput: '"VALID"',
        exampleNote:
          "Drift is 120s (<= 300s) and HMAC-SHA256 digest matches in constant time.",
        starterCode: `import hashlib
import hmac

def verify_signed_webhook(
    raw_body: str, ts: int, sig_hex: str, secret: str, now_ts: int
) -> str:
    pass`,
        interviewerNudge:
          "First check `if abs(now_ts - ts) > 300: return 'EXPIRED'`. Then compute `expected = hmac.new(secret.encode(), f'{ts}.{raw_body}'.encode(), hashlib.sha256).hexdigest()` and use `hmac.compare_digest(expected, sig_hex)`.",
        referenceSolution: `import hashlib
import hmac

def verify_signed_webhook(
    raw_body: str, ts: int, sig_hex: str, secret: str, now_ts: int
) -> str:
    if abs(now_ts - ts) > 300:
        return "EXPIRED"
    msg = f"{ts}.{raw_body}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    if hmac.compare_digest(expected, sig_hex):
        return "VALID"
    return "INVALID_SIG"`,
        verificationHarness: `
import hashlib, hmac, json
def __mk_sig__(body, ts, sec):
    return hmac.new(sec.encode(), f"{ts}.{body}".encode(), hashlib.sha256).hexdigest()

__s1__ = __mk_sig__('{"amt":3900}', 2000, "sec_live")
__cases__ = [
    ("valid fresh signature", lambda: verify_signed_webhook('{"amt":3900}', 2000, __s1__, "sec_live", 2150), "VALID"),
    ("exact 300s boundary allowed", lambda: verify_signed_webhook('{"amt":3900}', 2000, __s1__, "sec_live", 2300), "VALID"),
    ("replay at 301s rejected", lambda: verify_signed_webhook('{"amt":3900}', 2000, __s1__, "sec_live", 2301), "EXPIRED"),
    ("future clock skew > 300s rejected", lambda: verify_signed_webhook('{"amt":3900}', 2000, __s1__, "sec_live", 1600), "EXPIRED"),
    ("tampered body rejected", lambda: verify_signed_webhook('{"amt":0}', 2000, __s1__, "sec_live", 2050), "INVALID_SIG"),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
    ],
  },
  {
    id: "staff_distributed_loop",
    levelBadge: "L6 · STAFF ARCHITECTURE",
    title: "Staff Distributed Loop: Interval Sweep & Saga Rollbacks",
    shortTitle: "STAFF LOOP",
    subtitle:
      "Merge overlapping cluster maintenance windows in O(n log n), then coordinate LIFO compensating Saga rollbacks.",
    accent: "#FFDE59",
    isPro: true,
    durationSec: INTERVIEW_DURATION_SEC,
    baseXp: 160,
    rounds: [
      {
        id: "staff-r1-intervals",
        roundNumber: 1,
        categoryBadge: "ROUND 1 · ALGORITHMS",
        title: "Merge Cluster Maintenance Windows",
        targetComplexity: "O(n log n)",
        prompt:
          "Given unsorted `[start, end]` maintenance intervals, implement `merge_windows(intervals)` that merges all overlapping or touching (`prev_end >= next_start`) windows and returns sorted `[start, end]` lists.",
        constraints: [
          "Return `[]` if `intervals` is empty.",
          "Touching endpoints like `[1, 4]` and `[4, 6]` merge into `[1, 6]`.",
          "Target Time: O(n log n) sort by start time + single linear sweep.",
        ],
        exampleInput: "intervals = [[8, 10], [1, 4], [3, 6]]",
        exampleOutput: "[[1, 6], [8, 10]]",
        exampleNote:
          "Sorted -> [1,4], [3,6], [8,10]; [1,4] and [3,6] overlap into [1,6].",
        starterCode: `def merge_windows(intervals: list) -> list:
    pass`,
        interviewerNudge:
          "Sort `ordered = sorted(intervals, key=lambda x: x[0])`. Seed `merged = [[ordered[0][0], ordered[0][1]]]`, then for each `s, e` update `merged[-1][1] = max(merged[-1][1], e)` if `s <= merged[-1][1]` else append `[s, e]`.",
        referenceSolution: `def merge_windows(intervals: list) -> list:
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda pair: pair[0])
    merged = [[ordered[0][0], ordered[0][1]]]
    for start, end in ordered[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
        verificationHarness: `
import json
__cases__ = [
    ("unsorted overlapping windows", lambda: merge_windows([[8, 10], [1, 4], [3, 6]]), [[1, 6], [8, 10]]),
    ("touching endpoints merge", lambda: merge_windows([[1, 4], [4, 7]]), [[1, 7]]),
    ("nested interval inside wider interval", lambda: merge_windows([[1, 10], [3, 5], [6, 8]]), [[1, 10]]),
    ("empty list", lambda: merge_windows([]), []),
    ("single window", lambda: merge_windows([[5, 9]]), [[5, 9]]),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
      {
        id: "staff-r2-saga",
        roundNumber: 2,
        categoryBadge: "ROUND 2 · SYSTEMS",
        title: "Saga Compensating Rollback Coordinator",
        targetComplexity: "O(n)",
        prompt:
          "In microservice checkouts (`steps = ['reserve_stock', 'charge_card', 'issue_ticket']`), if `fail_at` matches one of the steps, that step fails and every ALREADY-completed step must run `'undo_' + step` in reverse LIFO order. Implement `execute_checkout_saga(steps, fail_at)` returning `{'status': 'COMMITTED' | 'ROLLED_BACK', 'log': [...]}`.",
        constraints: [
          "Each succeeding step appends `'do_' + step` to `log`.",
          "When `step == fail_at`, append `'fail_' + step`, then append `'undo_' + done_step` in reverse order, and return `status: 'ROLLED_BACK'`.",
          "If `fail_at` is `None` or never encountered, return `status: 'COMMITTED'`.",
        ],
        exampleInput:
          'steps = ["reserve", "charge", "ship"], fail_at = "ship"',
        exampleOutput:
          '{"status": "ROLLED_BACK", "log": ["do_reserve", "do_charge", "fail_ship", "undo_charge", "undo_reserve"]}',
        exampleNote:
          "'ship' failed, so completed steps unwind in reverse LIFO order: undo_charge then undo_reserve.",
        starterCode: `def execute_checkout_saga(steps: list, fail_at) -> dict:
    pass`,
        interviewerNudge:
          "Track `completed = []` and `log = []`. When `step == fail_at`, append `f'fail_{step}'`, iterate `for prev in reversed(completed): log.append(f'undo_{prev}')`, and return `{'status': 'ROLLED_BACK', 'log': log}`.",
        referenceSolution: `def execute_checkout_saga(steps: list, fail_at) -> dict:
    completed = []
    log = []
    for step in steps:
        if step == fail_at:
            log.append(f"fail_{step}")
            for prev in reversed(completed):
                log.append(f"undo_{prev}")
            return {"status": "ROLLED_BACK", "log": log}
        log.append(f"do_{step}")
        completed.append(step)
    return {"status": "COMMITTED", "log": log}`,
        verificationHarness: `
import json
__cases__ = [
    ("rollback on 3rd step", lambda: execute_checkout_saga(["reserve", "charge", "ship"], "ship"), {"status": "ROLLED_BACK", "log": ["do_reserve", "do_charge", "fail_ship", "undo_charge", "undo_reserve"]}),
    ("fail on 1st step needs zero undos", lambda: execute_checkout_saga(["reserve", "charge"], "reserve"), {"status": "ROLLED_BACK", "log": ["fail_reserve"]}),
    ("clean commit when fail_at is None", lambda: execute_checkout_saga(["reserve", "charge"], None), {"status": "COMMITTED", "log": ["do_reserve", "do_charge"]}),
    ("unknown fail_at commits cleanly", lambda: execute_checkout_saga(["reserve"], "other"), {"status": "COMMITTED", "log": ["do_reserve"]}),
    ("empty workflow commits", lambda: execute_checkout_saga([], None), {"status": "COMMITTED", "log": []}),
]
__results__ = []
__all_ok__ = True
for __i__, (__lbl__, __fn__, __exp__) in enumerate(__cases__):
    try:
        __act__ = __fn__()
        __ok__ = __act__ == __exp__
    except Exception as __e__:
        __act__ = f"{type(__e__).__name__}: {__e__}"
        __ok__ = False
    if not __ok__:
        __all_ok__ = False
    __results__.append({"id": __i__ + 1, "input": __lbl__, "expected": repr(__exp__), "actual": repr(__act__), "passed": __ok__})
json.dumps({"is_test_suite": True, "all_passed": __all_ok__, "results": __results__})
`,
      },
    ],
  },
] as const;

export function getInterviewLoop(loopId: InterviewLoopId): InterviewLoopSpec {
  return (
    MOCK_INTERVIEW_LOOPS.find((l) => l.id === loopId) || MOCK_INTERVIEW_LOOPS[0]
  );
}

/**
 * Estimates time complexity of candidate Python code while recognizing
 * amortized O(n) sliding-window / deque-eviction inner `while` loops
 * and early-exit reverse rollback loops.
 */
export function estimateInterviewComplexity(code: string): InterviewComplexity {
  const lines = code
    .split("\n")
    .map((raw) => {
      const trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith("#")) return null;
      const indent = raw.length - raw.trimStart().length;
      return { indent, text: trimmed };
    })
    .filter((item): item is { indent: number; text: string } => item !== null);

  let hasLoop = false;
  let hasQuadraticLoop = false;
  let hasInnerListScan = false;
  let hasSort = false;

  const loopStack: { indent: number; kind: "for" | "while" }[] = [];

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    while (
      loopStack.length > 0 &&
      line.indent <= loopStack[loopStack.length - 1].indent
    ) {
      loopStack.pop();
    }

    if (/\bsorted\s*\(|\.\s*sort\s*\(/.test(line.text)) {
      hasSort = true;
    }

    const forMatch = /^for\b/.test(line.text);
    const whileMatch = /^while\b/.test(line.text);

    if (forMatch || whileMatch) {
      hasLoop = true;
      if (loopStack.length > 0) {
        // Check if this is an amortized O(n) inner while (popleft / left += 1)
        // or a single-exit rollback `for ... in reversed(...)` followed by `return`
        const bodySlice = lines
          .slice(idx + 1, idx + 6)
          .filter((b) => b.indent > line.indent)
          .map((b) => b.text)
          .join(" ");
        const postSlice = lines
          .slice(idx + 1, idx + 6)
          .filter((b) => b.indent === line.indent)
          .map((b) => b.text)
          .join(" ");

        const isAmortizedPointerOrQueue =
          whileMatch &&
          /\bpopleft\s*\(|\bleft\s*\+=\s*1|\bstart\s*\+=\s*1/.test(bodySlice);
        const isTerminalRollback =
          forMatch &&
          /\breversed\s*\(/.test(line.text) &&
          /\breturn\b/.test(postSlice);

        if (!isAmortizedPointerOrQueue && !isTerminalRollback) {
          hasQuadraticLoop = true;
        }
      }
      loopStack.push({ indent: line.indent, kind: forMatch ? "for" : "while" });
      continue;
    }

    if (loopStack.length > 0) {
      if (
        /\.\s*count\s*\(|\.\s*remove\s*\(|\bsum\s*\([^)]*\[[^\]]*:[^\]]*\]/.test(
          line.text,
        )
      ) {
        hasInnerListScan = true;
      }
      if (
        /\b(?:not\s+)?in\s+(?:accepted|result|results|out|unique)\b/.test(
          line.text,
        ) &&
        !/^for\b/.test(line.text)
      ) {
        hasInnerListScan = true;
      }
    }
  }

  if (hasQuadraticLoop || hasInnerListScan) {
    return "O(n²)";
  }
  if (hasSort) {
    return "O(n log n)";
  }
  if (
    hasLoop ||
    /\bhmac\.new\s*\(|\bhashlib\.|\b(sum|max|min|set|dict\.fromkeys|enumerate)\s*\(/.test(
      code,
    ) ||
    /\[[^\]]*\bfor\b[^\]]*\]/.test(code)
  ) {
    return "O(n)";
  }
  return "O(1)";
}

export function formatInterviewClock(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function getVerdictBadgeLabel(verdict: HiringVerdict): string {
  if (verdict === "strong_hire") return "🌟 STRONG HIRE";
  if (verdict === "hire") return "✅ HIRE (OFFER)";
  if (verdict === "lean_hire") return "🟡 LEAN HIRE";
  return "🔧 NO OFFER YET";
}

export function gradeMockInterviewSession(
  loop: InterviewLoopSpec,
  submissions: readonly [RoundSubmissionSnapshot, RoundSubmissionSnapshot],
  secondsRemaining: number,
): InterviewScorecard {
  const secondsUsed = Math.max(
    1,
    Math.min(loop.durationSec, loop.durationSec - Math.max(0, secondsRemaining)),
  );

  const roundReports = loop.rounds.map((spec, idx) => {
    const sub = submissions[idx];
    const totalCount = Math.max(1, sub.results.length || 5);
    const passedCount = sub.results.filter((r) => r.passed).length;
    const estimatedComplexity = estimateInterviewComplexity(sub.code);
    const meetsComplexity =
      sub.allPassed &&
      COMPLEXITY_RANK[estimatedComplexity] <=
        COMPLEXITY_RANK[spec.targetComplexity];

    let debriefNote: string;
    if (!sub.allPassed) {
      debriefNote =
        passedCount === 0
          ? `0/${totalCount} test cases passing — focus on getting a clean baseline passing before optimizing.`
          : `Passed ${passedCount}/${totalCount} cases — review boundary & empty-input edge cases.`;
    } else if (!meetsComplexity) {
      debriefNote = `All ${totalCount}/${totalCount} tests passed, but static trace detected ${estimatedComplexity} vs ${spec.targetComplexity} target.`;
    } else if (sub.usedNudge) {
      debriefNote = `Clean ${estimatedComplexity} solution (${totalCount}/${totalCount} cases) solved after 1 interviewer nudge.`;
    } else {
      debriefNote = `Strong signal: all ${totalCount}/${totalCount} cases passed in optimal ${estimatedComplexity} without hints.`;
    }

    return {
      roundId: spec.id,
      title: spec.title,
      passedCount,
      totalCount,
      allPassed: sub.allPassed,
      estimatedComplexity,
      targetComplexity: spec.targetComplexity,
      meetsComplexity,
      usedNudge: sub.usedNudge,
      debriefNote,
    } satisfies RoundRubricReport;
  }) as unknown as readonly [RoundRubricReport, RoundRubricReport];

  // 1. Correctness & Edge Cases (0..45)
  const r1Ratio = roundReports[0].passedCount / roundReports[0].totalCount;
  const r2Ratio = roundReports[1].passedCount / roundReports[1].totalCount;
  const correctnessScore = Math.round(((r1Ratio + r2Ratio) / 2) * 45);

  // 2. Big-O Target Alignment (0..25)
  const r1CompPts = roundReports[0].meetsComplexity
    ? 13
    : roundReports[0].allPassed
      ? 5
      : 0;
  const r2CompPts = roundReports[1].meetsComplexity
    ? 12
    : roundReports[1].allPassed
      ? 5
      : 0;
  const complexityScore = r1CompPts + r2CompPts;

  // 3. Autonomy & Signal Clarity (0..15)
  const anyPassed = roundReports[0].passedCount + roundReports[1].passedCount > 0;
  const nudgesUsed =
    (roundReports[0].usedNudge ? 1 : 0) + (roundReports[1].usedNudge ? 1 : 0);
  const autonomyScore = anyPassed ? Math.max(1, 15 - nudgesUsed * 7) : 0;

  // 4. Pacing & Time Management (0..15)
  const bothRoundsPassed = roundReports[0].allPassed && roundReports[1].allPassed;
  let pacingScore = 0;
  if (bothRoundsPassed) {
    if (secondsRemaining >= 5 * 60) {
      pacingScore = 15;
    } else if (secondsRemaining >= 60) {
      pacingScore = 12;
    } else {
      pacingScore = 9;
    }
  } else if (roundReports[0].allPassed || roundReports[1].allPassed) {
    pacingScore = secondsRemaining > 0 ? 7 : 5;
  } else if (anyPassed) {
    pacingScore = 3;
  }

  const totalScore = Math.min(
    100,
    correctnessScore + complexityScore + autonomyScore + pacingScore,
  );

  let verdict: HiringVerdict;
  let verdictSummary: string;
  if (bothRoundsPassed && totalScore >= 88) {
    verdict = "strong_hire";
    verdictSummary =
      "Committee unanimous: both rounds cleared with optimal complexity, clean edge-case coverage, and crisp pacing.";
  } else if (bothRoundsPassed && totalScore >= 72) {
    verdict = "hire";
    verdictSummary =
      "Offer extended! Both rounds passed functional & boundary checks. Tighten complexity or hint autonomy for Strong Hire.";
  } else if (totalScore >= 50) {
    verdict = "lean_hire";
    verdictSummary =
      "Solid partial signal on one round, but the second round needs edge-case or complexity polish before a full offer.";
  } else {
    verdict = "no_hire";
    verdictSummary =
      "Keep practicing! Review the round debrief notes below and re-run the loop once both solutions handle edge cases.";
  }

  return {
    totalScore,
    correctnessScore,
    complexityScore,
    autonomyScore,
    pacingScore,
    verdict,
    verdictLabel: getVerdictBadgeLabel(verdict),
    verdictSummary,
    secondsUsed,
    bothRoundsPassed,
    roundReports,
  };
}

export function calculateInterviewXpReward(
  loop: InterviewLoopSpec,
  scorecard: InterviewScorecard,
  previousRecord?: InterviewLoopRecord,
): number {
  const rawXp =
    scorecard.verdict === "strong_hire"
      ? loop.baseXp
      : scorecard.verdict === "hire"
        ? Math.round(loop.baseXp * 0.8)
        : scorecard.verdict === "lean_hire"
          ? Math.round(loop.baseXp * 0.45)
          : scorecard.totalScore >= 15
            ? 20
            : 0;

  if (!previousRecord) {
    return rawXp;
  }
  if (
    VERDICT_RANK[scorecard.verdict] > VERDICT_RANK[previousRecord.bestVerdict]
  ) {
    return Math.max(25, Math.round(rawXp * 0.5));
  }
  return scorecard.bothRoundsPassed ? 15 : 0;
}

type MockInterviewListener = (records: MockInterviewRecordsMap) => void;
const listeners = new Set<MockInterviewListener>();

export function readMockInterviewRecords(): MockInterviewRecordsMap {
  return readLocalJson<MockInterviewRecordsMap>(STORAGE_MOCK_INTERVIEW_KEY, {});
}

export function saveMockInterviewRecord(
  loopId: InterviewLoopId,
  scorecard: InterviewScorecard,
): MockInterviewRecordsMap {
  const current = readMockInterviewRecords();
  const prev = current[loopId];
  const next: InterviewLoopRecord = prev
    ? {
        bestScore: Math.max(prev.bestScore, scorecard.totalScore),
        bestVerdict:
          VERDICT_RANK[scorecard.verdict] > VERDICT_RANK[prev.bestVerdict]
            ? scorecard.verdict
            : prev.bestVerdict,
        fastestSecondsUsed: scorecard.bothRoundsPassed
          ? Math.min(prev.fastestSecondsUsed, scorecard.secondsUsed)
          : prev.fastestSecondsUsed,
        attempts: prev.attempts + 1,
      }
    : {
        bestScore: scorecard.totalScore,
        bestVerdict: scorecard.verdict,
        fastestSecondsUsed: scorecard.bothRoundsPassed
          ? scorecard.secondsUsed
          : loopSecondsFallback(scorecard.secondsUsed),
        attempts: 1,
      };

  const updated: MockInterviewRecordsMap = {
    ...current,
    [loopId]: next,
  };
  writeLocalJson(STORAGE_MOCK_INTERVIEW_KEY, updated);
  listeners.forEach((fn) => fn(updated));
  return updated;
}

function loopSecondsFallback(secondsUsed: number): number {
  return Math.max(1, secondsUsed);
}

export function subscribeMockInterviewRecords(
  listener: MockInterviewListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
