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
  {
    id: "exp-alg-17",
    title: "String Reversal: Palindrome Checker",
    track: "algorithms",
    category: "STRING ALGORITHMS",
    difficulty: "Easy",
    tree_row: 14,
    lesson_order: 17,
    is_free: false,
    description:
      "Check if a word reads the same forwards and backwards using Python's reverse slice word[::-1].",
    content:
      'A **Palindrome** is a word like `"level"` or `"radar"` that spells the exact same thing backwards.\n\nIn Python, **`word[::-1]`** reverses a string in 1 step! So we just check **`word == word[::-1]`**:\n\n```python\nword = "level"\nprint(word == word[::-1])  # True\n```',
    assignment:
      "Complete `is_palindrome(word)` so it returns `True` if `word` equals its reversed self (`word[::-1]`), and `False` otherwise.",
    constraints: [
      "Use `word == word[::-1]`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: 'is_palindrome("level") and is_palindrome("code")',
        output: "True False",
        explanation:
          '"level" reversed is "level" (True); "code" reversed is "edoc" (False).',
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def is_palindrome(word):
    # 👉 Write 1 line: return word == word[::-1]
    return False

print(is_palindrome("level"), is_palindrome("code"))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = is_palindrome("level")
    results.append({"id": 1, "input": "'level'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_palindrome("code")
    results.append({"id": 2, "input": "'code'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    r3 = is_palindrome("racecar")
    results.append({"id": 3, "input": "'racecar'", "expected": "True", "actual": str(r3), "passed": r3 is True})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: 'word: "level"', value: 'reversed: "level"', address: "MATCH ✓" },
      { label: 'word: "code"', value: 'reversed: "edoc"', address: "False" },
    ],
    hints: ["Replace `return False` with `return word == word[::-1]`."],
  },
  {
    id: "exp-alg-18",
    title: "Duplicate Detector: Unique Username Check",
    track: "algorithms",
    category: "HASH SET O(N)",
    difficulty: "Easy",
    tree_row: 14,
    lesson_order: 18,
    is_free: false,
    description:
      "Check if all usernames in a list are unique by comparing len(names) == len(set(names)).",
    content:
      'How do you check in 1 line whether a list has **no duplicates**?\n\nSince `set(names)` removes duplicates, if **`len(names) == len(set(names))`**, then every single item was already unique!\n\n```python\nnames = ["aria", "kai", "nova"]\nprint(len(names) == len(set(names)))  # True (all unique)\n```',
    assignment:
      "Complete `all_unique(names)` so it returns `True` if `len(names) == len(set(names))`, or `False` if there are duplicates.",
    constraints: [
      "Compare `len(names) == len(set(names))`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: 'all_unique(["aria", "kai"]) and all_unique(["aria", "aria"])',
        output: "True False",
        explanation:
          '["aria", "kai"] has 2 unique items (True); ["aria", "aria"] shrinks to 1 in a set (False).',
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def all_unique(names):
    # 👉 Write 1 line: return len(names) == len(set(names))
    return False

print(all_unique(["aria", "kai"]), all_unique(["aria", "aria"]))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = all_unique(["aria", "kai"])
    results.append({"id": 1, "input": "['aria', 'kai']", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = all_unique(["aria", "aria"])
    results.append({"id": 2, "input": "['aria', 'aria']", "expected": "False", "actual": str(r2), "passed": r2 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      {
        label: '["aria", "kai"]',
        value: "len 2 == set len 2 -> True ✓",
        address: "unique",
      },
      {
        label: '["aria", "aria"]',
        value: "len 2 != set len 1 -> False",
        address: "duplicate!",
      },
    ],
    hints: [
      "Replace `return False` with `return len(names) == len(set(names))`.",
    ],
  },
  {
    id: "exp-alg-19",
    title: "Absolute Difference: Temperature Swing",
    track: "algorithms",
    category: "MATH & DISTANCE",
    difficulty: "Easy",
    tree_row: 15,
    lesson_order: 19,
    is_free: false,
    description:
      "Find the positive distance between two numbers using Python's built-in abs(a - b).",
    content:
      "What is the distance between `15°C` and `25°C`? It's `10`—never `-10`!\n\nIn algorithms, **`abs(a - b)`** (absolute value) removes any minus sign so you always get a positive distance:\n\n```python\nprint(abs(15 - 25))  # 10\nprint(abs(25 - 15))  # 10\n```",
    assignment:
      "Complete `temp_swing(a, b)` so it returns the positive difference between `a` and `b` using `abs(a - b)`.",
    constraints: [
      "Use `abs(a - b)`",
      "Return the positive difference",
    ],
    examples: [
      {
        input: "a = 15, b = 25",
        output: "10",
        explanation: "15 - 25 is -10, and abs(-10) is 10.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def temp_swing(a, b):
    # 👉 Write 1 line: return abs(a - b)
    return 0

print(temp_swing(15, 25))`,
    expected_output: "10",
    hidden_tests: `import json
results = []
try:
    r1 = temp_swing(15, 25)
    results.append({"id": 1, "input": "a=15, b=25", "expected": "10", "actual": str(r1), "passed": r1 == 10})
    r2 = temp_swing(30, 12)
    results.append({"id": 2, "input": "a=30, b=12", "expected": "18", "actual": str(r2), "passed": r2 == 18})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "a - b", value: "-10", type: "int", address: "0x10" },
      { label: "abs(a - b)", value: "10 ✓", type: "int", address: "0x14" },
    ],
    hints: ["Replace `return 0` with `return abs(a - b)`."],
  },
  {
    id: "exp-alg-20",
    title: "Pairing Lists: Scoreboard Zipper",
    track: "algorithms",
    category: "HASH MAP BUILDER",
    difficulty: "Easy",
    tree_row: 16,
    lesson_order: 20,
    is_free: false,
    description:
      "Pair a list of player names with a list of scores into a dictionary using dict(zip(names, scores)).",
    content:
      'Have two matching lists—one of `names` and one of `scores`? **`zip(names, scores)`** pairs them up like a zipper, and **`dict(...)`** turns those pairs into a dictionary in 1 line!\n\n```python\nnames = ["Aria", "Kai"]\nscores = [100, 85]\nboard = dict(zip(names, scores))\n# {\'Aria\': 100, \'Kai\': 85}\n```',
    assignment:
      "Complete `build_scoreboard(names, scores)` so it returns a dictionary pairing each name to its score using `dict(zip(names, scores))`.",
    constraints: [
      "Use `dict(zip(names, scores))`",
      "Return the resulting dictionary",
    ],
    examples: [
      {
        input: 'names = ["Aria", "Kai"], scores = [100, 85]',
        output: "{'Aria': 100, 'Kai': 85}",
        explanation: "Pairs index 0 ('Aria': 100) and index 1 ('Kai': 85).",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def build_scoreboard(names, scores):
    # 👉 Write 1 line: return dict(zip(names, scores))
    return {}

print(build_scoreboard(["Aria", "Kai"], [100, 85]))`,
    expected_output: "{'Aria': 100, 'Kai': 85}",
    hidden_tests: `import json
results = []
try:
    r1 = build_scoreboard(["Aria", "Kai"], [100, 85])
    results.append({"id": 1, "input": "['Aria', 'Kai'] & [100, 85]", "expected": "{'Aria': 100, 'Kai': 85}", "actual": str(r1), "passed": r1 == {"Aria": 100, "Kai": 85}})
    r2 = build_scoreboard(["Mia"], [50])
    results.append({"id": 2, "input": "['Mia'] & [50]", "expected": "{'Mia': 50}", "actual": str(r2), "passed": r2 == {"Mia": 50}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"Aria" + 100', value: "'Aria': 100", address: "pair 0" },
      { label: '"Kai" + 85', value: "'Kai': 85", address: "pair 1" },
    ],
    hints: ["Replace `return {}` with `return dict(zip(names, scores))`."],
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
