export interface BugIncident {
  id: string;
  codeId: string;
  title: string;
  track: "python_basics" | "algorithms" | "system_design";
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimitSec: number;
  baseXp: number;
  symptom: string;
  rootCauseHint: string;
  buggyCode: string;
  testHarness: string;
  expectedSummary: string;
}

export const BUG_INCIDENTS: BugIncident[] = [
  // ============================================================================
  // PYTHON CORE (FREE)
  // ============================================================================
  {
    id: "bug-101",
    codeId: "MISSION 01",
    title: "Skipped First Item in Cart",
    track: "python_basics",
    difficulty: "Easy",
    timeLimitSec: 60,
    baseXp: 75,
    symptom:
      "The loop starts at index 1 instead of 0, skipping the first price in the list.",
    rootCauseHint:
      "Change range(1, len(prices)) to range(len(prices)) so index 0 is included.",
    buggyCode: `def calculate_cart_total(prices):
    total = 0
    # Fix the loop so index 0 is included:
    for i in range(1, len(prices)):
        total += prices[i]
    return total

print(calculate_cart_total([25, 15, 10]))`,
    testHarness: `
import json
results = []
cases = [
    ([25, 15, 10], 50),
    ([99], 99),
    ([10, 20, 30, 40], 100),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = calculate_cart_total(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"calculate_cart_total({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "calculate_cart_total([25, 15, 10]) → 50",
  },
  {
    id: "bug-102",
    codeId: "MISSION 02",
    title: "Missing Dictionary Key Crash",
    track: "python_basics",
    difficulty: "Easy",
    timeLimitSec: 60,
    baseXp: 75,
    symptom:
      'Crashes with KeyError when "role" is missing. It should default to "guest".',
    rootCauseHint:
      'Replace user["role"] with user.get("role", "guest").',
    buggyCode: `def get_user_badge(user):
    # Default to "guest" when "role" is missing:
    role = user["role"]
    return f"{user['username']} ({role})"

print(get_user_badge({"username": "alex"}))`,
    testHarness: `
import json
results = []
cases = [
    ({"username": "alex"}, "alex (guest)"),
    ({"username": "sam", "role": "admin"}, "sam (admin)"),
    ({"username": "mia", "role": "editor"}, "mia (editor)"),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    try:
        actual = get_user_badge(inp)
    except Exception as e:
        actual = f"KeyError: {e}"
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"get_user_badge({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'get_user_badge({"username": "alex"}) → "alex (guest)"',
  },

  // ============================================================================
  // ALGORITHMS PRO TRACK (MISSIONS 03 - 10)
  // ============================================================================
  {
    id: "bug-201",
    codeId: "MISSION 03",
    title: "Case-Sensitive Palindrome",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 75,
    baseXp: 100,
    symptom:
      'Returns False for "Racecar" because uppercase "R" and lowercase "r" don\'t match.',
    rootCauseHint:
      "Add text = text.lower() at the top of the function before comparing.",
    buggyCode: `def is_palindrome(text):
    # Make the check ignore uppercase/lowercase:
    left = 0
    right = len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("Racecar"))`,
    testHarness: `
import json
results = []
cases = [
    ("Racecar", True),
    ("Level", True),
    ("python", False),
    ("Kayak", True),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = is_palindrome(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f'is_palindrome("{inp}")',
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'is_palindrome("Racecar") → True',
  },
  {
    id: "bug-202",
    codeId: "MISSION 04",
    title: "Negative Numbers Max Bug",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 75,
    baseXp: 100,
    symptom:
      "Returns 0 instead of -5 when all numbers in the list are negative.",
    rootCauseHint:
      "Start with best = nums[0] instead of best = 0.",
    buggyCode: `def find_max_reading(nums):
    # Fix so negative lists like [-12, -5, -20] return -5:
    best = 0
    for n in nums:
        if n > best:
            best = n
    return best

print(find_max_reading([-12, -5, -20]))`,
    testHarness: `
import json
results = []
cases = [
    ([-12, -5, -20], -5),
    ([14, 42, 8], 42),
    ([-100, -50, -75], -50),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = find_max_reading(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"find_max_reading({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "find_max_reading([-12, -5, -20]) → -5",
  },
  {
    id: "bug-203",
    codeId: "MISSION 05",
    title: "Sliding Window Shrink Order",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 75,
    baseXp: 110,
    symptom:
      "Shrinking the window increments `left += 1` BEFORE subtracting `nums[left]`, corrupting the window sum.",
    rootCauseHint:
      "Subtract `window_sum -= nums[left]` first, THEN increment `left += 1`.",
    buggyCode: `def max_window_len(nums, limit):
    left = 0
    window_sum = 0
    best = 0
    for right, val in enumerate(nums):
        window_sum += val
        while window_sum > limit:
            # Subtract the outgoing element BEFORE advancing left:
            left += 1
            window_sum -= nums[left]
        best = max(best, right - left + 1)
    return best

print(max_window_len([2, 1, 1, 3, 1], 4))`,
    testHarness: `
import json
results = []
cases = [
    (([2, 1, 1, 3, 1], 4), 3),
    (([1, 1, 1, 5], 3), 3),
    (([5, 1, 2], 4), 2),
]
all_passed = True
for idx, ((nums, limit), exp) in enumerate(cases):
    try:
        actual = max_window_len(nums, limit)
    except Exception as e:
        actual = f"Error: {e}"
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"max_window_len({nums}, {limit})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "max_window_len([2, 1, 1, 3, 1], 4) → 3",
  },
  {
    id: "bug-204",
    codeId: "MISSION 06",
    title: "Mutable Default Argument Leak",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 75,
    baseXp: 110,
    symptom:
      "When called twice without a bucket argument, tags from the first request leak into the second list!",
    rootCauseHint:
      "Use `bucket=None` in the signature and set `if bucket is None: bucket = []` inside the function.",
    buggyCode: `def append_tag(tag, bucket=[]):
    # Prevent separate default calls from sharing the same list:
    bucket.append(tag)
    return bucket

first = append_tag("fast")
second = append_tag("clean")
print(first, second)`,
    testHarness: `
import json
results = []
r1 = append_tag("alpha")
r2 = append_tag("beta")
r3 = append_tag("gamma", ["existing"])
cases = [
    ("1st default call ['alpha']", r1, ["alpha"]),
    ("2nd default call ['beta'] (must not leak 'alpha')", r2, ["beta"]),
    ("explicit list call", r3, ["existing", "gamma"]),
]
all_passed = True
for idx, (label, actual, exp) in enumerate(cases):
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": label,
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'append_tag("beta") → ["beta"] (isolated list)',
  },
  {
    id: "bug-205",
    codeId: "MISSION 07",
    title: "Binary Search Infinite Loop",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 80,
    baseXp: 115,
    symptom:
      "Lower-bound search freezes when `lo` and `hi` shrink next to each other because `lo = mid` fails to advance.",
    rootCauseHint:
      "Advance `lo = mid + 1` when `nums[mid] < target` so the search range always shrinks.",
    buggyCode: `def lower_bound(nums, target):
    lo, hi = 0, len(nums)
    steps = 0
    while lo < hi:
        steps += 1
        if steps > 100:
            return -1  # Guarded timeout
        mid = (lo + hi) // 2
        if nums[mid] < target:
            # Advance past mid so [lo, hi) strictly shrinks:
            lo = mid
        else:
            hi = mid
    return lo

print(lower_bound([10, 20, 30, 40], 35))`,
    testHarness: `
import json
results = []
cases = [
    (([10, 20, 30, 40], 35), 3),
    (([1, 3, 3, 5], 3), 1),
    (([5, 10], 99), 2),
    (([5, 10], 1), 0),
]
all_passed = True
for idx, ((nums, target), exp) in enumerate(cases):
    actual = lower_bound(nums, target)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"lower_bound({nums}, {target})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "lower_bound([10, 20, 30, 40], 35) → 3",
  },
  {
    id: "bug-206",
    codeId: "MISSION 08",
    title: "Prefix Sum Off-by-One Slice",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 80,
    baseXp: 115,
    symptom:
      "Inclusive range sums omit the `right` element because `prefix[right]` stops one index early.",
    rootCauseHint:
      "Change `prefix[right] - prefix[left]` to `prefix[right + 1] - prefix[left]`.",
    buggyCode: `def sum_inclusive_range(nums, left, right):
    prefix = [0]
    for n in nums:
        prefix.append(prefix[-1] + n)
    # Include nums[right] in the cumulative difference:
    return prefix[right] - prefix[left]

print(sum_inclusive_range([10, 20, 15, 5], 1, 3))`,
    testHarness: `
import json
results = []
cases = [
    (([10, 20, 15, 5], 1, 3), 40),
    (([10, 20, 15, 5], 0, 2), 45),
    (([7], 0, 0), 7),
]
all_passed = True
for idx, ((nums, left, right), exp) in enumerate(cases):
    actual = sum_inclusive_range(nums, left, right)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"sum_inclusive_range({nums}, {left}, {right})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "sum_inclusive_range([10, 20, 15, 5], 1, 3) → 40",
  },
  {
    id: "bug-207",
    codeId: "MISSION 09",
    title: "Two-Sum Self-Reuse Exploit",
    track: "algorithms",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 130,
    symptom:
      "Storing `seen[n] = i` BEFORE checking `need in seen` lets `[3, 2, 4]` with target `6` return `[0, 0]` instead of `[1, 2]`!",
    rootCauseHint:
      "Check `if need in seen:` FIRST, and only insert `seen[n] = i` after the check.",
    buggyCode: `def two_sum_indices(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        need = target - n
        # Move seen[n] = i AFTER checking need in seen so index i isn't reused:
        seen[n] = i
        if need in seen:
            return [seen[need], i]
    return []

print(two_sum_indices([3, 2, 4], 6))`,
    testHarness: `
import json
results = []
cases = [
    (([3, 2, 4], 6), [1, 2]),
    (([3, 3], 6), [0, 1]),
    (([2, 7, 11, 15], 9), [0, 1]),
]
all_passed = True
for idx, ((nums, target), exp) in enumerate(cases):
    actual = two_sum_indices(nums, target)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"two_sum_indices({nums}, {target})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "two_sum_indices([3, 2, 4], 6) → [1, 2]",
  },
  {
    id: "bug-208",
    codeId: "MISSION 10",
    title: "Adjacent Interval Merge Gap",
    track: "algorithms",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 130,
    symptom:
      "Touching calendar blocks like `[1, 4]` and `[4, 5]` stay split because `<` ignores exact endpoint equality.",
    rootCauseHint:
      "Change `cur[0] < merged[-1][1]` to `cur[0] <= merged[-1][1]`.",
    buggyCode: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted([list(x) for x in intervals], key=lambda x: x[0])
    merged = [ordered[0]]
    for cur in ordered[1:]:
        # Merge touching intervals too (<= instead of <):
        if cur[0] < merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], cur[1])
        else:
            merged.append(cur)
    return merged

print(merge_intervals([[1, 4], [4, 5], [7, 9]]))`,
    testHarness: `
import json
results = []
cases = [
    ([[1, 4], [4, 5], [7, 9]], [[1, 5], [7, 9]]),
    ([[1, 3], [2, 6], [8, 10]], [[1, 6], [8, 10]]),
    ([[5, 7], [1, 5]], [[1, 7]]),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = merge_intervals(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"merge_intervals({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "merge_intervals([[1, 4], [4, 5], [7, 9]]) → [[1, 5], [7, 9]]",
  },

  // ============================================================================
  // SYSTEM DESIGN PRO TRACK (MISSIONS 11 - 18)
  // ============================================================================
  {
    id: "bug-301",
    codeId: "MISSION 11",
    title: "Rate-Limiter Boundary Leak",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 120,
    symptom:
      "Allows 1 extra request through when current_count equals max_requests.",
    rootCauseHint:
      "Use < instead of <= so requests are blocked once current_count reaches max_requests.",
    buggyCode: `def allow_request(current_count, max_requests):
    # Block the request when current_count reaches max_requests:
    if current_count <= max_requests:
        return True
    return False

print(allow_request(100, 100))`,
    testHarness: `
import json
results = []
cases = [
    ((100, 100), False),
    ((99, 100), True),
    ((0, 5), True),
    ((5, 5), False),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = allow_request(inp[0], inp[1])
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"allow_request({inp[0]}, {inp[1]})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "allow_request(100, 100) → False",
  },
  {
    id: "bug-302",
    codeId: "MISSION 12",
    title: "FIFO Cache Evicts Wrong Item",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 120,
    symptom:
      "When the cache is full, it removes the newest item at the end instead of the oldest item at index 0.",
    rootCauseHint:
      "Use cache.pop(0) to remove the oldest item from the front of the list.",
    buggyCode: `def push_to_cache(cache, new_item, capacity):
    if len(cache) >= capacity:
        # Remove the oldest item (index 0), not the newest:
        cache.pop(-1)
    cache.append(new_item)
    return cache

print(push_to_cache(["a", "b", "c"], "d", 3))`,
    testHarness: `
import json
results = []
cases = [
    ((["a", "b", "c"], "d", 3), ["b", "c", "d"]),
    ((["k1", "k2"], "k3", 2), ["k2", "k3"]),
    ((["only_one"], "second", 3), ["only_one", "second"]),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = push_to_cache(list(inp[0]), inp[1], inp[2])
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"push_to_cache({inp[0]}, '{inp[1]}', {inp[2]})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'push_to_cache(["a", "b", "c"], "d", 3) → ["b", "c", "d"]',
  },
  {
    id: "bug-303",
    codeId: "MISSION 13",
    title: "Circuit Breaker Never Recovers",
    track: "system_design",
    difficulty: "Medium",
    timeLimitSec: 80,
    baseXp: 115,
    symptom:
      "Historical failures are never cleared on `" +
      '"OK"' +
      "`, causing a recovered downstream service to flip OPEN on a single blip.",
    rootCauseHint:
      'Reset `failures = 0` inside the `else:` branch when an `"OK"` response arrives.',
    buggyCode: `def circuit_breaker_state(events, threshold):
    failures = 0
    for ev in events:
        if ev == "FAIL":
            failures += 1
            if failures >= threshold:
                return "OPEN"
        else:
            # Reset consecutive failure counter when an "OK" arrives:
            pass
    return "CLOSED"

print(circuit_breaker_state(["FAIL", "OK", "FAIL"], 2))`,
    testHarness: `
import json
results = []
cases = [
    ((["FAIL", "OK", "FAIL"], 2), "CLOSED"),
    ((["FAIL", "FAIL", "OK"], 2), "OPEN"),
    ((["OK", "FAIL", "OK", "FAIL", "FAIL"], 2), "OPEN"),
]
all_passed = True
for idx, ((events, thresh), exp) in enumerate(cases):
    actual = circuit_breaker_state(events, thresh)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"circuit_breaker_state({events}, {thresh})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'circuit_breaker_state(["FAIL", "OK", "FAIL"], 2) → "CLOSED"',
  },
  {
    id: "bug-304",
    codeId: "MISSION 14",
    title: "Inverted Idempotency Guard",
    track: "system_design",
    difficulty: "Medium",
    timeLimitSec: 80,
    baseXp: 115,
    symptom:
      "Adds `ev` into `seen` BEFORE checking `if ev in seen:`, rejecting every brand-new Stripe webhook as a duplicate!",
    rootCauseHint:
      "Check `if ev in seen: continue` first, then `seen.add(ev)` and `accepted.append(ev)`.",
    buggyCode: `def process_webhooks(event_ids):
    seen = set()
    accepted = []
    for ev in event_ids:
        # Check seen BEFORE adding ev so first deliveries are accepted:
        seen.add(ev)
        if ev in seen:
            continue
        accepted.append(ev)
    return accepted

print(process_webhooks(["evt_1", "evt_2", "evt_1"]))`,
    testHarness: `
import json
results = []
cases = [
    (["evt_1", "evt_2", "evt_1"], ["evt_1", "evt_2"]),
    (["a", "a", "b", "c", "b"], ["a", "b", "c"]),
    ([], []),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = process_webhooks(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"process_webhooks({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'process_webhooks(["evt_1", "evt_2", "evt_1"]) → ["evt_1", "evt_2"]',
  },
  {
    id: "bug-305",
    codeId: "MISSION 15",
    title: "Uncapped Exponential Retry Delay",
    track: "system_design",
    difficulty: "Medium",
    timeLimitSec: 80,
    baseXp: 120,
    symptom:
      "Uses `max(raw_delay, max_ms)` instead of `min(raw_delay, max_ms)`, forcing early retries to wait the full maximum timeout!",
    rootCauseHint:
      "Replace `max(raw_delay, max_ms)` with `min(raw_delay, max_ms)`.",
    buggyCode: `def capped_backoff_ms(attempt, base_ms, max_ms):
    raw_delay = base_ms * (2 ** attempt)
    # Clamp UPWARD spikes down to max_ms using min(), not max():
    return max(raw_delay, max_ms)

print(capped_backoff_ms(1, 100, 1000), capped_backoff_ms(5, 100, 1000))`,
    testHarness: `
import json
results = []
cases = [
    ((1, 100, 1000), 200),
    ((5, 100, 1000), 1000),
    ((0, 150, 1000), 150),
]
all_passed = True
for idx, ((att, base, mx), exp) in enumerate(cases):
    actual = capped_backoff_ms(att, base, mx)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"capped_backoff_ms({att}, {base}, {mx})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "capped_backoff_ms(1, 100, 1000) → 200 (capped at 1000)",
  },
  {
    id: "bug-306",
    codeId: "MISSION 16",
    title: "Token Bucket Refill Overflow",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 130,
    symptom:
      "Idle buckets accumulate millions of unspent tokens (`tokens += elapsed * refill_rate`) past `capacity`, defeating burst protection.",
    rootCauseHint:
      "Clamp refilled tokens with `tokens = min(capacity, tokens + elapsed * refill_rate)`.",
    buggyCode: `def consume_token(tokens, elapsed, refill_rate, capacity):
    # Cap refilled tokens at capacity so idle bursts can't overflow:
    tokens = tokens + elapsed * refill_rate
    if tokens >= 1:
        return {"allowed": True, "remaining": tokens - 1}
    return {"allowed": False, "remaining": tokens}

print(consume_token(3, 100, 2, 5))`,
    testHarness: `
import json
results = []
cases = [
    ((3, 100, 2, 5), {"allowed": True, "remaining": 4}),
    ((0, 2, 1, 5), {"allowed": True, "remaining": 1}),
    ((0, 0, 2, 5), {"allowed": False, "remaining": 0}),
]
all_passed = True
for idx, ((tok, el, rate, cap), exp) in enumerate(cases):
    actual = consume_token(tok, el, rate, cap)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"consume_token({tok}, {el}, {rate}, {cap})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "consume_token(3, 100, 2, 5) → {'allowed': True, 'remaining': 4}",
  },
  {
    id: "bug-307",
    codeId: "MISSION 17",
    title: "Load Balancer Routes Dead Nodes",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 130,
    symptom:
      "Round-robin modulo divides across ALL servers before removing dead nodes (`healthy=False`), sending 1/3 of traffic to offline hosts.",
    rootCauseHint:
      'Filter `live = [s["name"] for s in servers if s["healthy"]]` first, return `"NONE"` if empty, then modulo `len(live)`.',
    buggyCode: `def route_round_robin(servers, req_idx):
    # Filter to healthy servers BEFORE wrapping req_idx with modulo:
    if not servers:
        return "NONE"
    return servers[req_idx % len(servers)]["name"]

pool = [
    {"name": "app-1", "healthy": False},
    {"name": "app-2", "healthy": True},
    {"name": "app-3", "healthy": True},
]
print(route_round_robin(pool, 0))`,
    testHarness: `
import json
results = []
pool = [
    {"name": "app-1", "healthy": False},
    {"name": "app-2", "healthy": True},
    {"name": "app-3", "healthy": True},
]
down = [{"name": "app-1", "healthy": False}]
cases = [
    ((pool, 0), "app-2"),
    ((pool, 1), "app-3"),
    ((down, 0), "NONE"),
]
all_passed = True
for idx, ((svs, req_i), exp) in enumerate(cases):
    actual = route_round_robin(svs, req_i)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"route_round_robin(pool, {req_i})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'route_round_robin(pool, 0) → "app-2"',
  },
  {
    id: "bug-308",
    codeId: "MISSION 18",
    title: "Sliding Window Expiry Off-by-One",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 95,
    baseXp: 135,
    symptom:
      "Keeps expired timestamps at the exact boundary (`t >= now - window_sec`), falsely blocking valid traffic right as the window expires.",
    rootCauseHint:
      "Use strict `t > now - window_sec` so timestamps exactly `window_sec` old are pruned.",
    buggyCode: `def sliding_window_allow(timestamps, now, window_sec, limit):
    cutoff = now - window_sec
    # Only keep strictly active timestamps (t > cutoff):
    active = [t for t in timestamps if t >= cutoff]
    if len(active) < limit:
        return True
    return False

print(sliding_window_allow([10, 40], 70, 60, 2))`,
    testHarness: `
import json
results = []
cases = [
    (([10, 40], 70, 60, 2), True),
    (([20, 40], 70, 60, 2), False),
    (([65], 70, 60, 2), True),
]
all_passed = True
for idx, ((stamps, now, win, lim), exp) in enumerate(cases):
    actual = sliding_window_allow(stamps, now, win, lim)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"sliding_window_allow({stamps}, now={now}, w={win}, lim={lim})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "sliding_window_allow([10, 40], 70, 60, 2) → True",
  },
];
