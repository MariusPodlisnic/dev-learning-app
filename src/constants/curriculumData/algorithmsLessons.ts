export const ALGORITHMS_EXPANSION_LESSONS = [
  {
    id: "exp-alg-09",
    title: "Minimum Search: Cheapest Flight Finder",
    track: "algorithms",
    category: "LINEAR SCAN O(N)",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Find the lowest ticket price in a list of flight deals in a single O(n) pass using min().",
    content:
      "When comparing flight prices like `[320, 195, 240, 160, 410]`, how does a travel app find the cheapest deal?\n\nIt performs a single pass through the numbers to find the **minimum value** (`min(prices)`):\n\n```python\nprices = [320, 195, 240, 160, 410]\nlowest = min(prices)\nprint(lowest)  # 160\n```",
    assignment:
      "Complete `find_cheapest_flight(prices)` so it returns the smallest number in `prices`.",
    constraints: [
      "Return the smallest number in `prices` using `min(prices)`",
      "Keep the `print(...)` line so it outputs `160`",
    ],
    examples: [
      {
        input: "prices = [320, 195, 240, 160, 410]",
        output: "160",
        explanation: "160 is the lowest price in the list.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def find_cheapest_flight(prices):
    # 👉 Write 1 line: return min(prices)
    return 0

print(find_cheapest_flight([320, 195, 240, 160, 410]))`,
    expected_output: "160",
    hidden_tests: `import json
results = []
try:
    r1 = find_cheapest_flight([320, 195, 240, 160, 410])
    results.append({"id": 1, "input": "[320, 195, 240, 160, 410]", "expected": "160", "actual": str(r1), "passed": r1 == 160})
    r2 = find_cheapest_flight([99, 120, 85])
    results.append({"id": 2, "input": "[99, 120, 85]", "expected": "85", "actual": str(r2), "passed": r2 == 85})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "$320", value: "best = 320", address: "step 1" },
      { label: "$195", value: "new best = 195", address: "step 2" },
      { label: "$240", value: "keep 195", address: "step 3" },
      { label: "$160", value: "MIN FOUND = 160 ✓", address: "step 4" },
    ],
    hints: ["Replace `return 0` with `return min(prices)`."],
  },
  {
    id: "exp-alg-10",
    title: "Binary Search Step 1: Finding the Middle",
    track: "algorithms",
    category: "DIVIDE & CONQUER",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Jump straight to the middle element of a sorted list in O(1) time using integer division (// 2).",
    content:
      "The secret behind **Binary Search** is jumping straight to the **middle index** of a sorted list instead of starting at index 0.\n\nWe calculate `mid = len(items) // 2` (using `//` so we get a whole number index) and return `items[mid]`:\n\n```python\nitems = [10, 25, 42, 70, 99]\nmid = len(items) // 2   # 5 // 2 = 2\nprint(items[mid])       # 42\n```",
    assignment:
      "We already calculated `mid = len(items) // 2` for you. Complete the function so it returns the element at index `mid` (`items[mid]`).",
    constraints: [
      "Use `items[mid]` to read the middle value",
      "Return `items[mid]`",
    ],
    examples: [
      {
        input: "items = [10, 25, 42, 70, 99]",
        output: "42",
        explanation: "Length is 5, 5 // 2 is index 2, and items[2] is 42.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def get_middle_item(items):
    mid = len(items) // 2
    # 👉 Write 1 line: return items[mid]
    return 0

print(get_middle_item([10, 25, 42, 70, 99]))`,
    expected_output: "42",
    hidden_tests: `import json
results = []
try:
    r1 = get_middle_item([10, 25, 42, 70, 99])
    results.append({"id": 1, "input": "[10, 25, 42, 70, 99]", "expected": "42", "actual": str(r1), "passed": r1 == 42})
    r2 = get_middle_item([5, 15, 25])
    results.append({"id": 2, "input": "[5, 15, 25]", "expected": "15", "actual": str(r2), "passed": r2 == 15})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "idx 0: 10", value: "left half", address: "0" },
      { label: "idx 1: 25", value: "left half", address: "1" },
      {
        label: "idx 2: 42",
        value: "MIDDLE (5 // 2 = 2) 🎯",
        address: "mid = 2",
      },
      { label: "idx 3: 70", value: "right half", address: "3" },
      { label: "idx 4: 99", value: "right half", address: "4" },
    ],
    hints: ["Replace `return 0` with `return items[mid]`."],
  },
  {
    id: "exp-alg-11",
    title: "List Intersection: Mutual Friends Finder",
    track: "algorithms",
    category: "SEARCH & FILTER",
    difficulty: "Easy",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      "Find mutual friends who appear in both Alice's friend list and Bob's friend list.",
    content:
      "How do social apps show **Mutual Friends** between two people? We check each friend `f` in `friends_a` and keep them if **`f in friends_b`** is True!\n\n```python\nmutual = [f for f in friends_a if f in friends_b]\n```",
    assignment:
      "Complete `find_mutual_friends(friends_a, friends_b)` so it returns a list of names that appear in both lists.",
    constraints: [
      "Keep each friend `f` from `friends_a` if `f in friends_b`",
      "Return the list of mutual friends",
    ],
    examples: [
      {
        input:
          'friends_a = ["Sam", "Mia", "Leo"], friends_b = ["Mia", "Zoe", "Sam"]',
        output: "['Sam', 'Mia']",
        explanation: "Sam and Mia are on both friend lists.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def find_mutual_friends(friends_a, friends_b):
    # 👉 Write 1 line: return [f for f in friends_a if f in friends_b]
    return []

print(find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"]))`,
    expected_output: "['Sam', 'Mia']",
    hidden_tests: `import json
results = []
try:
    r1 = find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"])
    results.append({"id": 1, "input": "['Sam','Mia','Leo'] & ['Mia','Zoe','Sam']", "expected": "['Sam', 'Mia']", "actual": str(r1), "passed": r1 == ["Sam", "Mia"]})
    r2 = find_mutual_friends(["Kai"], ["Leo"])
    results.append({"id": 2, "input": "No mutual friends", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"Sam"', value: "IN BOTH -> KEEP ✓", address: "match" },
      { label: '"Mia"', value: "IN BOTH -> KEEP ✓", address: "match" },
      { label: '"Leo"', value: "not in friends_b", address: "skip" },
    ],
    hints: [
      "Replace `return []` with `return [f for f in friends_a if f in friends_b]`.",
    ],
  },
  {
    id: "exp-alg-12",
    title: "Running Total: Daily Step Tracker",
    track: "algorithms",
    category: "PREFIX SUMS",
    difficulty: "Easy",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      "Build a running total list that records the cumulative sum after each number.",
    content:
      "A **Running Total (Prefix Sum)** keeps adding each day's points to `total` and saves the progress after each step:\n\n```python\nresult = []\ntotal = 0\nfor n in numbers:\n    total += n\n    result.append(total)\n```",
    assignment:
      "We already wrote the loop and `total += n` for you! Add the 1 missing line inside the loop (`result.append(total)`) so each running total is saved.",
    constraints: [
      "Append `total` to `result` inside the loop using `result.append(total)`",
      "Return `result` at the end",
    ],
    examples: [
      {
        input: "numbers = [10, 20, 15, 5]",
        output: "[10, 30, 45, 50]",
        explanation: "10 -> 10+20=30 -> 30+15=45 -> 45+5=50.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def running_totals(numbers):
    result = []
    total = 0
    for n in numbers:
        total += n
        # 👉 Write 1 line: append 'total' to 'result'
        
    return result

print(running_totals([10, 20, 15, 5]))`,
    expected_output: "[10, 30, 45, 50]",
    hidden_tests: `import json
results = []
try:
    r1 = running_totals([10, 20, 15, 5])
    results.append({"id": 1, "input": "[10, 20, 15, 5]", "expected": "[10, 30, 45, 50]", "actual": str(r1), "passed": r1 == [10, 30, 45, 50]})
    r2 = running_totals([5, 5, 5])
    results.append({"id": 2, "input": "[5, 5, 5]", "expected": "[5, 10, 15]", "actual": str(r2), "passed": r2 == [5, 10, 15]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "+10", value: "total = 10", address: "[10]" },
      { label: "+20", value: "total = 30", address: "[10, 30]" },
      { label: "+15", value: "total = 45", address: "[10, 30, 45]" },
      { label: "+5", value: "total = 50 ✓", address: "[10, 30, 45, 50]" },
    ],
    hints: [
      "Right under `total += n`, write `result.append(total)` (indented by 8 spaces to match `total += n`).",
    ],
  },
  {
    id: "exp-alg-13",
    title: "Maximum Search: Arcade High Score",
    track: "algorithms",
    category: "LINEAR SCAN O(N)",
    difficulty: "Easy",
    tree_row: 11,
    lesson_order: 13,
    is_free: false,
    description:
      "Find the highest score in a list of player scores in O(n) time using Python's max() function.",
    content:
      "To crown the arcade champion, we scan the score list once in $O(n)$ time and pick the **largest number** using **`max(scores)`**:\n\n```python\nscores = [120, 450, 310, 290]\nbest = max(scores)\nprint(best)  # 450\n```",
    assignment:
      "Complete `find_high_score(scores)` so it returns the largest number in `scores` using `max(scores)`.",
    constraints: [
      "Use `max(scores)` to find the largest score",
      "Return the result",
    ],
    examples: [
      {
        input: "scores = [120, 450, 310, 290]",
        output: "450",
        explanation: "450 is the highest score in the list.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def find_high_score(scores):
    # 👉 Write 1 line: return max(scores)
    return 0

print(find_high_score([120, 450, 310, 290]))`,
    expected_output: "450",
    hidden_tests: `import json
results = []
try:
    r1 = find_high_score([120, 450, 310, 290])
    results.append({"id": 1, "input": "[120, 450, 310, 290]", "expected": "450", "actual": str(r1), "passed": r1 == 450})
    r2 = find_high_score([10, 99, 45])
    results.append({"id": 2, "input": "[10, 99, 45]", "expected": "99", "actual": str(r2), "passed": r2 == 99})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "120", value: "best = 120", address: "step 1" },
      { label: "450", value: "NEW MAX = 450 🏆", address: "step 2" },
      { label: "310", value: "keep 450", address: "step 3" },
      { label: "290", value: "keep 450", address: "step 4" },
    ],
    hints: ["Replace `return 0` with `return max(scores)`."],
  },
  {
    id: "exp-alg-14",
    title: "Descending Sort: Leaderboard Ranker",
    track: "algorithms",
    category: "SORTING O(N LOG N)",
    difficulty: "Easy",
    tree_row: 11,
    lesson_order: 14,
    is_free: false,
    description:
      "Sort player scores from highest to lowest in one line using sorted(scores, reverse=True).",
    content:
      "By default, `sorted(scores)` orders numbers from smallest to largest. Passing **`reverse=True`** flips the order so the **highest scores come first**:\n\n```python\nscores = [40, 95, 70, 85]\nranked = sorted(scores, reverse=True)\nprint(ranked)  # [95, 85, 70, 40]\n```",
    assignment:
      "Complete `rank_leaderboard(scores)` so it returns `scores` sorted from highest to lowest using `sorted(scores, reverse=True)`.",
    constraints: [
      "Use `sorted(scores, reverse=True)`",
      "Return the sorted list",
    ],
    examples: [
      {
        input: "scores = [40, 95, 70, 85]",
        output: "[95, 85, 70, 40]",
        explanation: "Sorted in descending order from 95 down to 40.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def rank_leaderboard(scores):
    # 👉 Write 1 line: return sorted(scores, reverse=True)
    return []

print(rank_leaderboard([40, 95, 70, 85]))`,
    expected_output: "[95, 85, 70, 40]",
    hidden_tests: `import json
results = []
try:
    r1 = rank_leaderboard([40, 95, 70, 85])
    results.append({"id": 1, "input": "[40, 95, 70, 85]", "expected": "[95, 85, 70, 40]", "actual": str(r1), "passed": r1 == [95, 85, 70, 40]})
    r2 = rank_leaderboard([10, 30, 20])
    results.append({"id": 2, "input": "[10, 30, 20]", "expected": "[30, 20, 10]", "actual": str(r2), "passed": r2 == [30, 20, 10]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "1st: 95", value: "GOLD 🥇", address: "idx 0" },
      { label: "2nd: 85", value: "SILVER 🥈", address: "idx 1" },
      { label: "3rd: 70", value: "BRONZE 🥉", address: "idx 2" },
      { label: "4th: 40", value: "runner-up", address: "idx 3" },
    ],
    hints: [
      "Replace `return []` with `return sorted(scores, reverse=True)`.",
    ],
  },
  {
    id: "exp-alg-15",
    title: "Parity Filter: Even Team Splitter",
    track: "algorithms",
    category: "MODULO & FILTER",
    difficulty: "Easy",
    tree_row: 12,
    lesson_order: 15,
    is_free: false,
    description:
      "Filter a list of player IDs to keep only even numbers using n % 2 == 0.",
    content:
      "How do we check if a number `n` is **even**? Divide by 2 and check if the remainder is 0: **`n % 2 == 0`**.\n\nWe can keep all even numbers in 1 clean line:\n\n```python\nevens = [n for n in nums if n % 2 == 0]\n```",
    assignment:
      "Complete `get_even_ids(nums)` so it returns a list of only the even numbers in `nums`.",
    constraints: [
      "Use `n % 2 == 0` to check for even numbers",
      "Return `[n for n in nums if n % 2 == 0]`",
    ],
    examples: [
      {
        input: "nums = [10, 15, 22, 33, 40]",
        output: "[10, 22, 40]",
        explanation: "10, 22, and 40 are divisible by 2 with remainder 0.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def get_even_ids(nums):
    # 👉 Write 1 line: return [n for n in nums if n % 2 == 0]
    return []

print(get_even_ids([10, 15, 22, 33, 40]))`,
    expected_output: "[10, 22, 40]",
    hidden_tests: `import json
results = []
try:
    r1 = get_even_ids([10, 15, 22, 33, 40])
    results.append({"id": 1, "input": "[10, 15, 22, 33, 40]", "expected": "[10, 22, 40]", "actual": str(r1), "passed": r1 == [10, 22, 40]})
    r2 = get_even_ids([1, 3, 5, 8])
    results.append({"id": 2, "input": "[1, 3, 5, 8]", "expected": "[8]", "actual": str(r2), "passed": r2 == [8]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "10 % 2 == 0", value: "KEEP (Even) ✓", address: "10" },
      { label: "15 % 2 == 1", value: "skip (Odd)", address: "15" },
      { label: "22 % 2 == 0", value: "KEEP (Even) ✓", address: "22" },
      { label: "40 % 2 == 0", value: "KEEP (Even) ✓", address: "40" },
    ],
    hints: [
      "Replace `return []` with `return [n for n in nums if n % 2 == 0]`.",
    ],
  },
  {
    id: "exp-alg-16",
    title: "Early Exit Search: VIP Pass Scanner",
    track: "algorithms",
    category: "MEMBERSHIP SEARCH",
    difficulty: "Easy",
    tree_row: 13,
    lesson_order: 16,
    is_free: false,
    description:
      "Check if a player's name is inside the VIP list in one line using Python's 'in' operator.",
    content:
      "To check if `name` exists inside `vip_list`, Python's **`in`** operator scans the list and stops immediately as soon as it finds a match:\n\n```python\ndef has_vip_pass(vip_list, name):\n    return name in vip_list\n```",
    assignment:
      "Complete `has_vip_pass(vip_list, name)` so it returns `True` if `name` is in `vip_list`, and `False` otherwise.",
    constraints: [
      "Use `name in vip_list`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: 'has_vip_pass(["Aria", "Kai", "Nova"], "Kai") and has_vip_pass(["Aria", "Kai"], "Leo")',
        output: "True False",
        explanation: '"Kai" is in the list (True); "Leo" is not (False).',
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def has_vip_pass(vip_list, name):
    # 👉 Write 1 line: return name in vip_list
    return False

print(has_vip_pass(["Aria", "Kai", "Nova"], "Kai"), has_vip_pass(["Aria", "Kai"], "Leo"))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = has_vip_pass(["Aria", "Kai", "Nova"], "Kai")
    results.append({"id": 1, "input": "Check 'Kai' in ['Aria', 'Kai', 'Nova']", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = has_vip_pass(["Aria", "Kai"], "Leo")
    results.append({"id": 2, "input": "Check 'Leo' in ['Aria', 'Kai']", "expected": "False", "actual": str(r2), "passed": r2 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"Kai"', value: "FOUND -> True 🎟️", address: "early exit" },
      { label: '"Leo"', value: "NOT FOUND -> False", address: "end of list" },
    ],
    hints: ["Replace `return False` with `return name in vip_list`."],
  },
];
