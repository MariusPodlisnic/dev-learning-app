export const ALGORITHMS_EXPANSION_LESSONS = [
  {
    id: "exp-alg-09",
    title: "Filtered Linear Scan: Cheapest Valid Flight",
    track: "algorithms",
    category: "LINEAR SCAN O(N)",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Scan flight quotes in one O(n) pass while filtering out sold-out or invalid entries (<= 0 or None).",
    content:
      "Real flight APIs often include `None` or `0` placeholders for sold-out flights alongside valid fares like `[320, 0, 195, None, 160]`.\n\nIf you call `min(prices)` blindly, Python either crashes on `None` (`TypeError`) or picks `0`! Instead, maintain a running minimum:\n\n```python\nbest = None\nfor p in prices:\n    if p is not None and p > 0:\n        if best is None or p < best:\n            best = p\nreturn best if best is not None else -1\n```",
    assignment:
      "Complete `find_cheapest_flight(prices)` to return the lowest valid price (`p is not None and p > 0`), or `-1` if no valid price exists.",
    constraints: [
      "Ignore `None` and prices `<= 0` without raising `TypeError`",
      "Return `-1` when `prices` is empty or contains no valid fares",
      "Run in O(n) single pass and O(1) extra space",
    ],
    examples: [
      {
        input: "prices = [320, 0, 195, None, 160, 410]",
        output: "160",
        explanation: "0 and None are skipped; 160 is the lowest valid fare.",
      },
      {
        input: "prices = [0, None, -50]",
        output: "-1",
        explanation: "No valid fare > 0 exists, so return -1.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def find_cheapest_flight(prices):
    best = None
    # 👉 Scan prices once, skipping None or <= 0, and return -1 if none valid:
    return -1

print(find_cheapest_flight([320, 0, 195, None, 160, 410]))`,
    expected_output: "160",
    hidden_tests: `import json
results = []
try:
    r1 = find_cheapest_flight([320, 0, 195, None, 160, 410])
    results.append({"id": 1, "input": "[320, 0, 195, None, 160, 410]", "expected": "160", "actual": str(r1), "passed": r1 == 160})
    r2 = find_cheapest_flight([0, None, -20])
    results.append({"id": 2, "input": "[0, None, -20]", "expected": "-1", "actual": str(r2), "passed": r2 == -1})
    r3 = find_cheapest_flight([])
    results.append({"id": 3, "input": "[]", "expected": "-1", "actual": str(r3), "passed": r3 == -1})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "$320", value: "valid -> best = 320", address: "step 1" },
      { label: "0 / None", value: "skip invalid fare", address: "step 2" },
      { label: "$195", value: "195 < 320 -> best = 195", address: "step 3" },
      { label: "$160", value: "MIN VALID = 160 ✓", address: "step 4" },
    ],
    hints: [
      "Check `if p is not None and p > 0:` inside `for p in prices:`.",
      "Update `best = p` whenever `best is None or p < best`.",
    ],
  },
  {
    id: "exp-alg-10",
    title: "Binary Search: Lower-Bound Insertion Index",
    track: "algorithms",
    category: "DIVIDE & CONQUER",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Implement O(log n) binary search to find a target's index, or the sorted index where it should be inserted.",
    content:
      "In real search engines and sorted indexes, binary search doesn't just return `-1` on a miss — **lower-bound search** returns the exact index where `target` belongs to keep the list sorted!\n\n```python\nlow, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nreturn low\n```",
    assignment:
      "Complete `find_insert_pos(nums, target)` to return the index of the first element `>= target` in sorted `nums` (which is `len(nums)` if `target` is larger than all elements).",
    constraints: [
      "Run in O(log n) time using `low` and `high` pointers",
      "Return the leftmost valid index even when duplicates exist",
    ],
    examples: [
      {
        input: "nums = [10, 25, 42, 70, 99], target = 50",
        output: "3",
        explanation: "50 belongs right before 70 at index 3.",
      },
      {
        input: "nums = [1, 3, 3, 5], target = 3",
        output: "1",
        explanation: "First occurrence of 3 is at index 1.",
      },
    ],
    complexities: { time: "O(log n)", space: "O(1)" },
    initial_code: `def find_insert_pos(nums, target):
    low, high = 0, len(nums) - 1
    # 👉 Halve the search space with while low <= high and return low:
    return 0

print(find_insert_pos([10, 25, 42, 70, 99], 50))`,
    expected_output: "3",
    hidden_tests: `import json
results = []
try:
    r1 = find_insert_pos([10, 25, 42, 70, 99], 50)
    results.append({"id": 1, "input": "[10,25,42,70,99], 50", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = find_insert_pos([1, 3, 3, 5], 3)
    results.append({"id": 2, "input": "[1,3,3,5], 3 (leftmost duplicate)", "expected": "1", "actual": str(r2), "passed": r2 == 1})
    r3 = find_insert_pos([10, 20], 99)
    results.append({"id": 3, "input": "[10,20], 99 (append end)", "expected": "2", "actual": str(r3), "passed": r3 == 2})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "low=0, high=4", value: "mid=2 (42 < 50 -> low=3)", address: "step 1" },
      { label: "low=3, high=4", value: "mid=3 (70 >= 50 -> high=2)", address: "step 2" },
      { label: "low > high", value: "INSERT AT INDEX 3 ✓", address: "O(log n)" },
    ],
    hints: [
      "Loop `while low <= high:` and compute `mid = (low + high) // 2`.",
      "If `nums[mid] < target`: `low = mid + 1`, else `high = mid - 1`. Finally `return low`.",
    ],
  },
  {
    id: "exp-alg-11",
    title: "Set Intersection: Sorted Mutual Friends",
    track: "algorithms",
    category: "HASH SET INTERSECTION",
    difficulty: "Easy",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      "Compute deduplicated, sorted mutual friends between two social graphs in O(n + m) set time.",
    content:
      "Checking `f in friends_b` on a plain list costs **O(n × m)** time and can produce duplicate names if either list has repeats.\n\nConvert to sets (`set(friends_a) & set(friends_b)`) so intersection runs in linear hash-set time, then sort alphabetically with `sorted(...)`!",
    assignment:
      "Complete `find_mutual_friends(friends_a, friends_b)` so it returns a sorted, duplicate-free list of names present in both inputs.",
    constraints: [
      "Eliminate duplicate names in the output",
      "Return the mutual names sorted alphabetically",
    ],
    examples: [
      {
        input: 'friends_a = ["Sam", "Mia", "Leo", "Sam"], friends_b = ["Mia", "Zoe", "Sam"]',
        output: "['Mia', 'Sam']",
        explanation: "Both lists contain Mia and Sam; sorted without duplicates.",
      },
    ],
    complexities: { time: "O(n + m + k log k)", space: "O(n + m)" },
    initial_code: `def find_mutual_friends(friends_a, friends_b):
    # 👉 Intersect sets of friends_a and friends_b and return them sorted:
    return []

print(find_mutual_friends(["Sam", "Mia", "Leo", "Sam"], ["Mia", "Zoe", "Sam"]))`,
    expected_output: "['Mia', 'Sam']",
    hidden_tests: `import json
results = []
try:
    r1 = find_mutual_friends(["Sam", "Mia", "Leo", "Sam"], ["Mia", "Zoe", "Sam"])
    results.append({"id": 1, "input": "duplicate Sam + unsorted", "expected": "['Mia', 'Sam']", "actual": str(r1), "passed": r1 == ["Mia", "Sam"]})
    r2 = find_mutual_friends(["Ava"], ["Zoe"])
    results.append({"id": 2, "input": "disjoint lists", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    r3 = find_mutual_friends(["Kai", "Aria"], ["Aria", "Kai"])
    results.append({"id": 3, "input": "all mutual", "expected": "['Aria', 'Kai']", "actual": str(r3), "passed": r3 == ["Aria", "Kai"]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "set(A)", value: "{'Leo', 'Mia', 'Sam'}", address: "O(n)" },
      { label: "set(B)", value: "{'Mia', 'Sam', 'Zoe'}", address: "O(m)" },
      { label: "sorted(A & B)", value: "['Mia', 'Sam'] ✓", address: "deduped" },
    ],
    hints: [
      "Use `&` between two sets: `set(friends_a) & set(friends_b)`.",
      "Wrap the result in `sorted(...)` to return an alphabetically ordered list.",
    ],
  },
  {
    id: "exp-alg-12",
    title: "Prefix Sum Engine: O(1) Range Queries",
    track: "algorithms",
    category: "PREFIX SUMS",
    difficulty: "Medium",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      "Precompute a cumulative prefix array so multiple (left, right) inclusive range sum queries each answer in O(1) time.",
    content:
      "Suppose an analytics dashboard asks for total daily revenue between days `[left, right]` across 10,000 queries.\n\nInstead of slicing `sum(numbers[l:r+1])` on every query, build `prefix` of length `n + 1` where `prefix[0] = 0` and `prefix[i + 1] = prefix[i] + numbers[i]`.\n\nThen any inclusive range `(left, right)` equals **`prefix[right + 1] - prefix[left]`** in O(1)!",
    assignment:
      "Complete `range_sums(numbers, queries)` where `queries` is a list of `[left, right]` inclusive index pairs, returning a list with the sum for each query.",
    constraints: [
      "Precompute `prefix` once in O(n) before processing `queries`",
      "Each query `[left, right]` is inclusive (`0 <= left <= right < len(numbers)`)",
    ],
    examples: [
      {
        input: "numbers = [10, 20, 15, 5], queries = [[0, 2], [1, 3]]",
        output: "[45, 40]",
        explanation: "indices 0..2 sum to 10+20+15=45; indices 1..3 sum to 20+15+5=40.",
      },
    ],
    complexities: { time: "O(n + q)", space: "O(n)" },
    initial_code: `def range_sums(numbers, queries):
    prefix = [0]
    # 👉 1. Build cumulative prefix sums
    # 👉 2. Answer each [left, right] in O(1) via prefix[right + 1] - prefix[left]
    return []

print(range_sums([10, 20, 15, 5], [[0, 2], [1, 3]]))`,
    expected_output: "[45, 40]",
    hidden_tests: `import json
results = []
try:
    r1 = range_sums([10, 20, 15, 5], [[0, 2], [1, 3]])
    results.append({"id": 1, "input": "[10,20,15,5], [[0,2],[1,3]]", "expected": "[45, 40]", "actual": str(r1), "passed": r1 == [45, 40]})
    r2 = range_sums([3, -2, 7, 1], [[0, 0], [0, 3], [1, 2]])
    results.append({"id": 2, "input": "[3,-2,7,1], 3 queries", "expected": "[3, 9, 5]", "actual": str(r2), "passed": r2 == [3, 9, 5]})
    r3 = range_sums([5], [[0, 0]])
    results.append({"id": 3, "input": "[5], [[0,0]]", "expected": "[5]", "actual": str(r3), "passed": r3 == [5]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "prefix[0..2]", value: "[0, 10, 30, 45, 50]", address: "build O(n)" },
      { label: "query [0, 2]", value: "prefix[3] - prefix[0] = 45", address: "O(1)" },
      { label: "query [1, 3]", value: "prefix[4] - prefix[1] = 40 ✓", address: "O(1)" },
    ],
    hints: [
      "Build prefix with `for n in numbers: prefix.append(prefix[-1] + n)`.",
      "Answer queries with `return [prefix[r + 1] - prefix[l] for l, r in queries]`.",
    ],
  },
  {
    id: "exp-alg-13",
    title: "Single-Pass Runner-Up: Top-2 Distinct Scores",
    track: "algorithms",
    category: "LINEAR SCAN O(N)",
    difficulty: "Medium",
    tree_row: 11,
    lesson_order: 13,
    is_free: false,
    description:
      "Track the first and second highest distinct scores in a single O(n) pass without sorting.",
    content:
      "Sorting to get the top 2 scores takes **O(n log n)** time and fails if duplicates tie for #1 (`[95, 95, 80]` -> runner-up should be `80`, not `95`!).\n\nMaintain `first = None` and `second = None` in one pass:\n- If `s > first`: demote `second = first`, promote `first = s`\n- Else if `s < first` and (`second is None` or `s > second`): `second = s`",
    assignment:
      "Complete `find_top_two_scores(scores)` to return `[first, second]` of the two largest distinct scores (or `[first, None]` if fewer than 2 distinct scores exist).",
    constraints: [
      "Handle duplicate top scores properly (e.g. `[100, 100, 80]` -> `[100, 80]`)",
      "Solve in a single O(n) loop with O(1) space",
    ],
    examples: [
      {
        input: "scores = [120, 450, 450, 310, 290]",
        output: "[450, 310]",
        explanation: "450 is highest; ignoring duplicate 450, 310 is the second highest.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def find_top_two_scores(scores):
    first = None
    second = None
    # 👉 Update first and second highest distinct values in one pass:
    return [first, second]

print(find_top_two_scores([120, 450, 450, 310, 290]))`,
    expected_output: "[450, 310]",
    hidden_tests: `import json
results = []
try:
    r1 = find_top_two_scores([120, 450, 450, 310, 290])
    results.append({"id": 1, "input": "[120,450,450,310,290]", "expected": "[450, 310]", "actual": str(r1), "passed": r1 == [450, 310]})
    r2 = find_top_two_scores([50, 50, 50])
    results.append({"id": 2, "input": "[50,50,50] (no 2nd distinct)", "expected": "[50, None]", "actual": str(r2), "passed": r2 == [50, None]})
    r3 = find_top_two_scores([-10, -3, -20])
    results.append({"id": 3, "input": "[-10,-3,-20] (all negative)", "expected": "[-3, -10]", "actual": str(r3), "passed": r3 == [-3, -10]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "first", value: "450 (GOLD 🥇)", type: "int", address: "max_1" },
      { label: "second", value: "310 (SILVER 🥈)", type: "int", address: "max_2" },
    ],
    hints: [
      "When `first is None or s > first`: set `second = first`, then `first = s`.",
      "Otherwise if `s != first and (second is None or s > second)`: set `second = s`.",
    ],
  },
  {
    id: "exp-alg-14",
    title: "Multi-Key Leaderboard Tie-Breaker",
    track: "algorithms",
    category: "CUSTOM SORTING",
    difficulty: "Medium",
    tree_row: 11,
    lesson_order: 14,
    is_free: false,
    description:
      "Rank players by highest score first, breaking ties by fastest completion time, then alphabetically by name.",
    content:
      "Real leaderboards rarely sort by a single number — tied scores are broken by speed and name!\n\nIn Python, pass a **tuple key** to `sorted()`:\n```python\nsorted(players, key=lambda p: (-p['score'], p['time'], p['name']))\n```\nNegating `-p['score']` sorts highest scores first while keeping smaller `time` and alphabetical `name` ascending!",
    assignment:
      "Complete `rank_leaderboard(players)` where each player is `{\"name\": str, \"score\": int, \"time\": int}`, returning a list of player names in ranked order.",
    constraints: [
      "Primary: higher `score` first",
      "Tie-breaker 1: lower `time` first; Tie-breaker 2: alphabetical `name`",
      "Return only the list of ranked player names",
    ],
    examples: [
      {
        input: '[{"name":"Kai","score":95,"time":40}, {"name":"Aria","score":95,"time":30}, {"name":"Leo","score":70,"time":20}]',
        output: "['Aria', 'Kai', 'Leo']",
        explanation: "Aria and Kai tie at 95, so Aria wins via lower time (30 < 40).",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def rank_leaderboard(players):
    # 👉 Sort by (-score, time, name) and return list of player names:
    return []

sample = [
    {"name": "Kai", "score": 95, "time": 40},
    {"name": "Aria", "score": 95, "time": 30},
    {"name": "Leo", "score": 70, "time": 20},
]
print(rank_leaderboard(sample))`,
    expected_output: "['Aria', 'Kai', 'Leo']",
    hidden_tests: `import json
results = []
try:
    s1 = [{"name":"Kai","score":95,"time":40},{"name":"Aria","score":95,"time":30},{"name":"Leo","score":70,"time":20}]
    r1 = rank_leaderboard(s1)
    results.append({"id": 1, "input": "score tie -> time tiebreaker", "expected": "['Aria', 'Kai', 'Leo']", "actual": str(r1), "passed": r1 == ["Aria", "Kai", "Leo"]})
    s2 = [{"name":"Zoe","score":80,"time":10},{"name":"Amy","score":80,"time":10}]
    r2 = rank_leaderboard(s2)
    results.append({"id": 2, "input": "full tie -> alphabetical", "expected": "['Amy', 'Zoe']", "actual": str(r2), "passed": r2 == ["Amy", "Zoe"]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "1st: Aria", value: "score=95, time=30s 🥇", address: "(-95, 30, 'Aria')" },
      { label: "2nd: Kai", value: "score=95, time=40s 🥈", address: "(-95, 40, 'Kai')" },
      { label: "3rd: Leo", value: "score=70, time=20s 🥉", address: "(-70, 20, 'Leo')" },
    ],
    hints: [
      "Use `ordered = sorted(players, key=lambda p: (-p['score'], p['time'], p['name']))`.",
      "Extract names with `return [p['name'] for p in ordered]`.",
    ],
  },
  {
    id: "exp-alg-15",
    title: "Two-Pointer In-Place Parity Partition",
    track: "algorithms",
    category: "TWO POINTERS",
    difficulty: "Medium",
    tree_row: 12,
    lesson_order: 15,
    is_free: false,
    description:
      "Partition player IDs in O(n) time and O(1) extra space so all even IDs appear before all odd IDs.",
    content:
      "Instead of allocating new filtered lists (`O(n)` memory), **two-pointer partitioning** rearranges an array in-place using `left = 0` and `right = len(nums) - 1`:\n\n- While `left < right`:\n  - Advance `left` past any even number (`nums[left] % 2 == 0`)\n  - Retreat `right` past any odd number (`nums[right] % 2 == 1`)\n  - Swap `nums[left], nums[right]` whenever an odd sits on the left and an even sits on the right!",
    assignment:
      "Complete `partition_by_parity(nums)` so it rearranges `nums` in-place (all even numbers first, all odd numbers second) and returns `nums`.",
    constraints: [
      "Modify `nums` in O(1) extra space (no new list allocation)",
      "All even integers must precede all odd integers",
    ],
    examples: [
      {
        input: "nums = [3, 1, 2, 4]",
        output: "[4, 2, 1, 3] (or any valid even-then-odd order)",
        explanation: "4 and 2 are even (front); 1 and 3 are odd (back).",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def partition_by_parity(nums):
    left, right = 0, len(nums) - 1
    # 👉 Swap misplaced odd/even elements inward while left < right:
    return nums

res = partition_by_parity([3, 1, 2, 4])
print(all(x % 2 == 0 for x in res[:2]) and all(x % 2 == 1 for x in res[2:]))`,
    expected_output: "True",
    hidden_tests: `import json
def is_valid_parity(arr):
    seen_odd = False
    for x in arr:
        if x % 2 == 1:
            seen_odd = True
        elif seen_odd:
            return False
    return True

results = []
try:
    r1 = partition_by_parity([3, 1, 2, 4])
    results.append({"id": 1, "input": "[3, 1, 2, 4]", "expected": "evens then odds, sorted match [1,2,3,4]", "actual": str(r1), "passed": is_valid_parity(r1) and sorted(r1) == [1, 2, 3, 4]})
    r2 = partition_by_parity([2, 4, 6])
    results.append({"id": 2, "input": "[2, 4, 6] (all even)", "expected": "[2, 4, 6]", "actual": str(r2), "passed": is_valid_parity(r2) and sorted(r2) == [2, 4, 6]})
    r3 = partition_by_parity([])
    results.append({"id": 3, "input": "[]", "expected": "[]", "actual": str(r3), "passed": r3 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "L=0 (3 odd)", value: "R=3 (4 even) -> SWAP", address: "step 1" },
      { label: "L=1 (1 odd)", value: "R=2 (2 even) -> SWAP", address: "step 2" },
      { label: "L >= R", value: "[4, 2, 1, 3] ✓", address: "O(1) space" },
    ],
    hints: [
      "Inside `while left < right:`, if `nums[left] % 2 > nums[right] % 2`: swap `nums[left], nums[right] = nums[right], nums[left]`.",
      "Advance `if nums[left] % 2 == 0: left += 1` and `if nums[right] % 2 == 1: right -= 1`.",
    ],
  },
  {
    id: "exp-alg-16",
    title: "O(1) Batch Gatekeeper: VIP Badge Filter",
    track: "algorithms",
    category: "HASH SET LOOKUP",
    difficulty: "Easy",
    tree_row: 13,
    lesson_order: 16,
    is_free: false,
    description:
      "Validate thousands of arriving badges against a VIP allowlist in O(n + m) time using a set while preserving arrival order.",
    content:
      "When 50,000 concert guests scan badges against a 10,000-name VIP list, checking `name in vip_list` on a `list` takes **O(n × m)** (~500 million comparisons!).\n\nConvert `vip_list` to a `set` **once** before the loop (`allowed = set(vip_list)`), then filter `arrivals` in O(1) per guest while keeping deduplicated arrival order!",
    assignment:
      "Complete `filter_valid_badges(vip_list, arrivals)` to return unique valid VIP names from `arrivals` in the exact order they first arrived.",
    constraints: [
      "Build `allowed = set(vip_list)` once for O(1) lookups",
      "Preserve first-arrival order and ignore duplicate scans",
    ],
    examples: [
      {
        input: 'vip_list = ["Aria", "Kai", "Nova"], arrivals = ["Leo", "Kai", "Aria", "Kai"]',
        output: "['Kai', 'Aria']",
        explanation: "Leo isn't VIP; Kai and Aria are admitted in arrival order without duplicating Kai.",
      },
    ],
    complexities: { time: "O(n + m)", space: "O(n + m)" },
    initial_code: `def filter_valid_badges(vip_list, arrivals):
    allowed = set(vip_list)
    seen = set()
    # 👉 Admit unique arriving VIPs in order:
    return []

print(filter_valid_badges(["Aria", "Kai", "Nova"], ["Leo", "Kai", "Aria", "Kai"]))`,
    expected_output: "['Kai', 'Aria']",
    hidden_tests: `import json
results = []
try:
    r1 = filter_valid_badges(["Aria", "Kai", "Nova"], ["Leo", "Kai", "Aria", "Kai"])
    results.append({"id": 1, "input": "arrivals with duplicate Kai", "expected": "['Kai', 'Aria']", "actual": str(r1), "passed": r1 == ["Kai", "Aria"]})
    r2 = filter_valid_badges(["Mia"], ["Zoe", "Bob"])
    results.append({"id": 2, "input": "no matching VIPs", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "Leo", value: "not in allowed -> REJECT", address: "O(1)" },
      { label: "Kai (#1)", value: "in allowed -> ADMIT ✓", address: "added to seen" },
      { label: "Kai (#2)", value: "already in seen -> SKIP", address: "deduped" },
    ],
    hints: [
      "Loop `for name in arrivals:` and check `if name in allowed and name not in seen:`.",
      "Append `name` to `admitted` and add `name` to `seen`.",
    ],
  },
  {
    id: "exp-alg-17",
    title: "Two-Pointer Palindrome Sanitizer",
    track: "algorithms",
    category: "STRING TWO POINTERS",
    difficulty: "Medium",
    tree_row: 14,
    lesson_order: 17,
    is_free: false,
    description:
      "Validate messy phrases as palindromes in O(n) time and O(1) space by skipping punctuation and ignoring case.",
    content:
      "Real palindrome interview problems include spaces, commas, and uppercase letters like `\"A man, a plan, a canal: Panama\"`.\n\nInstead of copying filtered strings, skip non-alphanumeric chars inline with two pointers (`left`, `right`) and `.isalnum()`:\n- Advance `left` while `left < right and not text[left].isalnum()`\n- Retreat `right` while `left < right and not text[right].isalnum()`\n- Compare `text[left].lower() != text[right].lower()`!",
    assignment:
      "Complete `is_palindrome(text)` so it ignores punctuation, spaces, and letter case using converging pointers.",
    constraints: [
      "Ignore non-alphanumeric characters (`.isalnum()`)",
      "Compare letters case-insensitively (`.lower()`)",
    ],
    examples: [
      {
        input: 'text = "A man, a plan, a canal: Panama"',
        output: "True",
        explanation: "Cleaned letters form 'amanaplanacanalpanama', a palindrome.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def is_palindrome(text):
    left, right = 0, len(text) - 1
    # 👉 Skip non-alphanumeric characters and compare text[left].lower() vs text[right].lower():
    return True

print(is_palindrome("A man, a plan, a canal: Panama"), is_palindrome("race a car"))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = is_palindrome("A man, a plan, a canal: Panama")
    results.append({"id": 1, "input": "Panama phrase", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_palindrome("race a car")
    results.append({"id": 2, "input": "race a car", "expected": "False", "actual": str(r2), "passed": r2 is False})
    r3 = is_palindrome(".,!")
    results.append({"id": 3, "input": ".,! (only punctuation)", "expected": "True", "actual": str(r3), "passed": r3 is True})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "L='A', R='a'", value: "'a' == 'a' -> step inward", address: "match" },
      { label: "L=' ', R='m'", value: "skip space -> L='m'", address: "isalnum()" },
      { label: "L >= R", value: "PALINDROME = True ✓", address: "O(1) space" },
    ],
    hints: [
      "Use inner `while left < right and not text[left].isalnum(): left += 1` (and mirror for `right`).",
      "If `text[left].lower() != text[right].lower(): return False`.",
    ],
  },
  {
    id: "exp-alg-18",
    title: "Early-Exit First Duplicate Detector",
    track: "algorithms",
    category: "HASH SET TRACKING",
    difficulty: "Easy",
    tree_row: 14,
    lesson_order: 18,
    is_free: false,
    description:
      "Stream usernames through a hash set and return the very first duplicate immediately on collision.",
    content:
      "Comparing `len(names) == len(set(names))` reads the entire dataset even if items #0 and #1 are identical.\n\nMaintaining a `seen = set()` as you iterate lets you **short-circuit and return the exact colliding username** the instant it appears a second time (or `None` if all usernames are unique)!",
    assignment:
      "Complete `first_duplicate(names)` so it returns the first username that repeats while scanning left to right, or `None` if every username is unique.",
    constraints: [
      "Return the duplicate with the smallest second-occurrence index",
      "Return `None` when no duplicates exist",
    ],
    examples: [
      {
        input: 'names = ["aria", "kai", "mia", "kai", "aria"]',
        output: "kai",
        explanation: "'kai' repeats at index 3 before 'aria' repeats at index 4.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def first_duplicate(names):
    seen = set()
    # 👉 Return the first name already in seen, or None at the end:
    return None

print(first_duplicate(["aria", "kai", "mia", "kai", "aria"]), first_duplicate(["aria", "kai"]))`,
    expected_output: "kai None",
    hidden_tests: `import json
results = []
try:
    r1 = first_duplicate(["aria", "kai", "mia", "kai", "aria"])
    results.append({"id": 1, "input": "['aria','kai','mia','kai','aria']", "expected": "kai", "actual": str(r1), "passed": r1 == "kai"})
    r2 = first_duplicate(["aria", "kai"])
    results.append({"id": 2, "input": "all unique", "expected": "None", "actual": str(r2), "passed": r2 is None})
    r3 = first_duplicate([])
    results.append({"id": 3, "input": "[]", "expected": "None", "actual": str(r3), "passed": r3 is None})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "idx 0..2", value: "seen = {'aria', 'kai', 'mia'}", address: "O(1) insert" },
      { label: "idx 3: 'kai'", value: "COLLISION -> return 'kai' ✓", address: "early exit" },
    ],
    hints: [
      "Loop `for name in names:`: if `name in seen: return name`, else `seen.add(name)`.",
      "Return `None` after the loop ends.",
    ],
  },
  {
    id: "exp-alg-19",
    title: "Closest Pair Minimum Absolute Difference",
    track: "algorithms",
    category: "SORT & ADJACENT SCAN",
    difficulty: "Medium",
    tree_row: 15,
    lesson_order: 19,
    is_free: false,
    description:
      "Sort values and scan adjacent pairs in O(n log n) time to find the smallest absolute gap between any two numbers.",
    content:
      "Finding the closest two timestamps or prices in an unsorted list would take **O(n²)** if you compared every pair.\n\nOnce you sort a copy of the list (`ordered = sorted(nums)`), the closest pair MUST sit right next to each other! Scan `ordered[i + 1] - ordered[i]` for `i in range(len(ordered) - 1)`.",
    assignment:
      "Complete `min_abs_diff(nums)` to return the smallest `abs(b - a)` between any two distinct positions in `nums` (or `0` if fewer than 2 numbers).",
    constraints: [
      "Do not mutate the caller's `nums` list",
      "Handle negative numbers and duplicate values (which give gap `0`)",
    ],
    examples: [
      {
        input: "nums = [42, 15, 25, 9]",
        output: "6",
        explanation: "Sorted: [9, 15, 25, 42]. Smallest gap is |15 - 9| = 6.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def min_abs_diff(nums):
    if len(nums) < 2:
        return 0
    ordered = sorted(nums)
    # 👉 Scan adjacent elements in ordered to track the smallest abs difference:
    return 0

print(min_abs_diff([42, 15, 25, 9]))`,
    expected_output: "6",
    hidden_tests: `import json
results = []
try:
    r1 = min_abs_diff([42, 15, 25, 9])
    results.append({"id": 1, "input": "[42, 15, 25, 9]", "expected": "6", "actual": str(r1), "passed": r1 == 6})
    r2 = min_abs_diff([-10, -3, 2, 11])
    results.append({"id": 2, "input": "[-10, -3, 2, 11]", "expected": "5", "actual": str(r2), "passed": r2 == 5})
    r3 = min_abs_diff([8, 2, 8])
    results.append({"id": 3, "input": "[8, 2, 8] (duplicate)", "expected": "0", "actual": str(r3), "passed": r3 == 0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "sorted", value: "[9, 15, 25, 42]", address: "O(n log n)" },
      { label: "|15 - 9|", value: "gap = 6 (MIN) ✓", address: "pair 0-1" },
      { label: "|25 - 15|", value: "gap = 10", address: "pair 1-2" },
    ],
    hints: [
      "Initialize `best = abs(ordered[1] - ordered[0])`.",
      "Loop `for i in range(1, len(ordered) - 1): best = min(best, abs(ordered[i + 1] - ordered[i]))`.",
    ],
  },
  {
    id: "exp-alg-20",
    title: "Inverted Index Builder: Grouping by Role",
    track: "algorithms",
    category: "ZIP & INVERTED INDEX",
    difficulty: "Medium",
    tree_row: 16,
    lesson_order: 20,
    is_free: false,
    description:
      "Pair parallel lists with zip() and invert them into role -> [members] buckets in one pass.",
    content:
      "Unlike `dict(zip(names, roles))` (which maps 1 name -> 1 role), real permission services need the **inverted index**: given a role like `\"admin\"`, list every user who holds it!\n\nCombine `zip(names, roles)` with `setdefault`:\n```python\nindex = {}\nfor name, role in zip(names, roles):\n    index.setdefault(role, []).append(name)\n```",
    assignment:
      "Complete `build_role_index(names, roles)` so it pairs each name and role with `zip()` and returns a dictionary mapping each role to a list of matching names in order.",
    constraints: [
      "Use `zip(names, roles)` to pair parallel lists cleanly",
      "Preserve original order of names inside each role's list",
    ],
    examples: [
      {
        input: 'names = ["Aria", "Kai", "Mia"], roles = ["admin", "dev", "admin"]',
        output: "{'admin': ['Aria', 'Mia'], 'dev': ['Kai']}",
        explanation: "Both Aria and Mia are grouped under 'admin'.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def build_role_index(names, roles):
    index = {}
    # 👉 Zip names and roles and append each name into index[role]:
    return index

print(build_role_index(["Aria", "Kai", "Mia"], ["admin", "dev", "admin"]))`,
    expected_output: "{'admin': ['Aria', 'Mia'], 'dev': ['Kai']}",
    hidden_tests: `import json
results = []
try:
    r1 = build_role_index(["Aria", "Kai", "Mia"], ["admin", "dev", "admin"])
    results.append({"id": 1, "input": "3 users across 2 roles", "expected": "{'admin': ['Aria', 'Mia'], 'dev': ['Kai']}", "actual": str(r1), "passed": r1 == {"admin": ["Aria", "Mia"], "dev": ["Kai"]}})
    r2 = build_role_index([], [])
    results.append({"id": 2, "input": "empty lists", "expected": "{}", "actual": str(r2), "passed": r2 == {}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "('Aria', 'admin')", value: "admin -> ['Aria']", address: "zip 0" },
      { label: "('Kai', 'dev')", value: "dev -> ['Kai']", address: "zip 1" },
      { label: "('Mia', 'admin')", value: "admin -> ['Aria', 'Mia'] ✓", address: "zip 2" },
    ],
    hints: [
      "Loop `for name, role in zip(names, roles):`.",
      "Call `index.setdefault(role, []).append(name)` inside the loop.",
    ],
  },
  {
    id: "exp-alg-21",
    title: "Interview Capstone: Best Time to Buy & Sell Stock",
    track: "algorithms",
    category: "GREEDY SCAN O(N)",
    difficulty: "Medium",
    tree_row: 17,
    lesson_order: 21,
    is_free: false,
    description:
      "Track the running minimum buy price and compute the maximum single-trade profit in one O(n) pass.",
    content:
      "A classic coding interview problem: given daily stock `prices`, pick **one day to buy** and a **later day to sell** for maximum profit (or `0` if prices only fall).\n\nInstead of checking every `(buy, sell)` pair in O(n²), track two variables as you scan left to right:\n- `min_price`: lowest price seen **so far**\n- `best_profit`: largest `price - min_price` seen **so far**\n\n```python\nmin_price = float('inf')\nbest_profit = 0\nfor price in prices:\n    min_price = min(min_price, price)\n    best_profit = max(best_profit, price - min_price)\n```",
    assignment:
      "Complete `max_profit(prices)` so it scans `prices` once, updating `min_price` and `best_profit`, and returns the maximum achievable profit.",
    constraints: [
      "Solve in a single O(n) loop without nested loops",
      "Return `0` if no profitable trade exists",
    ],
    examples: [
      {
        input: "prices = [7, 1, 5, 3, 6, 4]",
        output: "5",
        explanation: "Buy at 1 (day 2) and sell at 6 (day 5) -> 6 - 1 = 5.",
      },
      {
        input: "prices = [7, 6, 4, 3, 1]",
        output: "0",
        explanation: "Prices drop every day, so best profit is 0.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def max_profit(prices):
    min_price = float("inf")
    best_profit = 0
    # 👉 Loop through prices and update min_price and best_profit:
    return best_profit

print(max_profit([7, 1, 5, 3, 6, 4]))`,
    expected_output: "5",
    hidden_tests: `import json
results = []
try:
    r1 = max_profit([7, 1, 5, 3, 6, 4])
    results.append({"id": 1, "input": "[7, 1, 5, 3, 6, 4]", "expected": "5", "actual": str(r1), "passed": r1 == 5})
    r2 = max_profit([7, 6, 4, 3, 1])
    results.append({"id": 2, "input": "[7, 6, 4, 3, 1]", "expected": "0", "actual": str(r2), "passed": r2 == 0})
    r3 = max_profit([2, 4, 1, 7])
    results.append({"id": 3, "input": "[2, 4, 1, 7]", "expected": "6", "actual": str(r3), "passed": r3 == 6})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "Day 1: $7", value: "min=$7, profit=0", address: "idx 0" },
      { label: "Day 2: $1", value: "min=$1, profit=0", address: "idx 1" },
      { label: "Day 3: $5", value: "min=$1, profit=4", address: "idx 2" },
      { label: "Day 5: $6", value: "BEST PROFIT = 5 ✓", address: "idx 4" },
    ],
    hints: [
      "Inside `for price in prices:`, update `min_price = min(min_price, price)`.",
      "Then update `best_profit = max(best_profit, price - min_price)`.",
    ],
  },
  {
    id: "exp-alg-22",
    title: "Interview Capstone: Group Anagrams",
    track: "algorithms",
    category: "HASH MAP BUCKETING",
    difficulty: "Medium",
    tree_row: 17,
    lesson_order: 22,
    is_free: false,
    description:
      "Bucket anagram words together using their sorted character signature as a dictionary key.",
    content:
      'Words like `"eat"`, `"tea"`, and `"ate"` have the exact same letters! When you sort their characters with **`"".join(sorted(word))`**, every anagram produces the identical signature **`"aet"`**.\n\nUse a dictionary `groups = {}` to collect words sharing the same signature:\n\n```python\ngroups = {}\nfor word in words:\n    sig = "".join(sorted(word))\n    groups.setdefault(sig, []).append(word)\nreturn list(groups.values())\n```',
    assignment:
      "Complete `group_anagrams(words)` so it groups matching anagrams into sublists and returns `list(groups.values())`.",
    constraints: [
      'Compute a sorted signature key with `"".join(sorted(word))`',
      "Preserve word grouping inside `groups` and return `list(groups.values())`",
    ],
    examples: [
      {
        input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
        explanation: "'eat', 'tea', 'ate' all sort to 'aet'.",
      },
    ],
    complexities: { time: "O(n * k log k)", space: "O(n * k)" },
    initial_code: `def group_anagrams(words):
    groups = {}
    # 👉 Build signature key = "".join(sorted(word)) and append word to groups[key]:
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))`,
    expected_output: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
    hidden_tests: `import json
results = []
try:
    r1 = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    norm1 = sorted([sorted(g) for g in r1])
    exp1 = sorted([sorted(["eat", "tea", "ate"]), sorted(["tan", "nat"]), sorted(["bat"])])
    results.append({"id": 1, "input": "6 mixed words", "expected": str(exp1), "actual": str(norm1), "passed": norm1 == exp1})
    r2 = group_anagrams(["listen", "silent", "hello"])
    norm2 = sorted([sorted(g) for g in r2])
    exp2 = sorted([["hello"], ["listen", "silent"]])
    results.append({"id": 2, "input": "['listen', 'silent', 'hello']", "expected": str(exp2), "actual": str(norm2), "passed": norm2 == exp2})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: 'sig "aet"', value: "['eat', 'tea', 'ate']", address: "bucket 0" },
      { label: 'sig "ant"', value: "['tan', 'nat']", address: "bucket 1" },
      { label: 'sig "abt"', value: "['bat']", address: "bucket 2" },
    ],
    hints: [
      'Inside `for word in words:`, compute `key = "".join(sorted(word))`.',
      "Use `groups.setdefault(key, []).append(word)` or `if key not in groups: groups[key] = []`.",
    ],
  },
  {
    id: "exp-alg-23",
    title: "Interview Capstone: Merge Overlapping Intervals",
    track: "algorithms",
    category: "INTERVAL SWEEP O(N LOG N)",
    difficulty: "Medium",
    tree_row: 18,
    lesson_order: 23,
    is_free: false,
    description:
      "Sort calendar meetings by start time and merge any overlapping ranges into clean continuous blocks.",
    content:
      "Calendar apps merge overlapping meetings like `[1, 3]` and `[2, 6]` into `[1, 6]`.\n\n1. Sort the intervals by their start value: `sorted_iv = sorted(intervals, key=lambda x: x[0])`\n2. Start `merged = []` and loop `[start, end]`:\n   - If `merged` is empty or `start > merged[-1][1]`, there is no overlap -> `merged.append([start, end])`\n   - Otherwise, merge by stretching the end: `merged[-1][1] = max(merged[-1][1], end)`",
    assignment:
      "Complete `merge_intervals(intervals)` so it sorts by start time, merges overlapping `[start, end]` pairs, and returns the merged list.",
    constraints: [
      "Handle unsorted input intervals safely",
      "Treat touching intervals like `[1, 4]` and `[4, 5]` as overlapping (`[1, 5]`)",
    ],
    examples: [
      {
        input: "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]",
        output: "[[1, 6], [8, 10], [15, 18]]",
        explanation: "[1, 3] and [2, 6] overlap at 2..3, merging to [1, 6].",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda x: x[0])
    merged = []
    # 👉 Sweep ordered intervals and merge overlaps into merged:
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))`,
    expected_output: "[[1, 6], [8, 10], [15, 18]]",
    hidden_tests: `import json
results = []
try:
    r1 = merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])
    results.append({"id": 1, "input": "[[1,3],[2,6],[8,10],[15,18]]", "expected": "[[1, 6], [8, 10], [15, 18]]", "actual": str(r1), "passed": r1 == [[1, 6], [8, 10], [15, 18]]})
    r2 = merge_intervals([[4, 5], [1, 4]])
    results.append({"id": 2, "input": "[[4,5],[1,4]] (unsorted)", "expected": "[[1, 5]]", "actual": str(r2), "passed": r2 == [[1, 5]]})
    r3 = merge_intervals([])
    results.append({"id": 3, "input": "[]", "expected": "[]", "actual": str(r3), "passed": r3 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "[1, 3]", value: "seed merged = [[1,3]]", address: "step 1" },
      { label: "[2, 6]", value: "2 <= 3 -> merge [1,6]", address: "step 2" },
      { label: "[8, 10]", value: "8 > 6 -> append [8,10]", address: "step 3" },
      { label: "[15, 18]", value: "append [15,18] ✓", address: "step 4" },
    ],
    hints: [
      "Loop `for start, end in ordered:`.",
      "If `not merged or start > merged[-1][1]`: `merged.append([start, end])`, else `merged[-1][1] = max(merged[-1][1], end)`.",
    ],
  },
  {
    id: "exp-alg-24",
    title: "Interview Capstone: Top K Frequent Elements",
    track: "algorithms",
    category: "FREQUENCY RANKING",
    difficulty: "Hard",
    tree_row: 18,
    lesson_order: 24,
    is_free: false,
    description:
      "Count item occurrences in a hash map and extract the top K most frequent values.",
    content:
      "Trending hashtags and analytics dashboards constantly answer: **\"What are the top K most frequent items?\"**\n\nCombine two clean steps:\n1. Build a frequency map: `counts[n] = counts.get(n, 0) + 1`\n2. Sort the unique keys by frequency descending and slice `[:k]`:\n\n```python\nranked = sorted(counts.keys(), key=lambda x: counts[x], reverse=True)\nreturn ranked[:k]\n```",
    assignment:
      "Complete `top_k_frequent(nums, k)` so it counts each number's frequency and returns a list of the `k` most frequent numbers.",
    constraints: [
      "Count occurrences using a dictionary",
      "Return the top `k` most frequent elements",
    ],
    examples: [
      {
        input: "nums = [1, 1, 1, 2, 2, 3], k = 2",
        output: "[1, 2]",
        explanation: "1 appears 3 times, 2 appears 2 times, 3 appears 1 time.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def top_k_frequent(nums, k):
    counts = {}
    # 👉 1. Count occurrences of each num in nums
    # 👉 2. Sort counts.keys() by frequency descending and return [:k]
    return []

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))`,
    expected_output: "[1, 2]",
    hidden_tests: `import json
results = []
try:
    r1 = top_k_frequent([1, 1, 1, 2, 2, 3], 2)
    results.append({"id": 1, "input": "[1,1,1,2,2,3], k=2", "expected": "[1, 2]", "actual": str(r1), "passed": sorted(r1) == [1, 2] and len(r1) == 2})
    r2 = top_k_frequent([5, 5, 9, 9, 9, 1], 1)
    results.append({"id": 2, "input": "[5,5,9,9,9,1], k=1", "expected": "[9]", "actual": str(r2), "passed": r2 == [9]})
    r3 = top_k_frequent(["py", "go", "py", "rs", "py", "go"], 2)
    results.append({"id": 3, "input": "['py','go','py','rs','py','go'], k=2", "expected": "['py', 'go']", "actual": str(r3), "passed": r3 == ["py", "go"]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "num 1", value: "count = 3 (#1)", address: "top 1 ✓" },
      { label: "num 2", value: "count = 2 (#2)", address: "top 2 ✓" },
      { label: "num 3", value: "count = 1 (#3)", address: "filtered out" },
    ],
    hints: [
      "Count with `for n in nums: counts[n] = counts.get(n, 0) + 1`.",
      "Sort keys with `sorted(counts.keys(), key=lambda x: counts[x], reverse=True)[:k]`.",
    ],
  },
];
