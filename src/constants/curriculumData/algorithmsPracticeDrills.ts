import { PracticeChallenge } from "../../types/lesson";

/**
 * Progressive Practice Challenges for the Pro `algorithms` track (`lesson_order` 1..24).
 * Focuses strictly on Mission Brief, Input/Output examples, Constraints, and Clues.
 */
export const ALGORITHMS_PRACTICE_DRILLS: Record<number, PracticeChallenge[]> = {
  // 01: Hash Map / Two Sum
  1: [
    {
      id: "alg-01-d2",
      title: "Practice 2/3: O(n) Duplicate Detection",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `has_duplicate(nums)`: return `True` if any value appears at least twice in `nums`, or `False` if every element is distinct.",
      constraints: [
        "Run in O(n) average time using a hash set",
        "Return immediately upon finding a repeated element",
      ],
      examples: [
        { input: "nums = [1, 4, 9, 4]", output: "True" },
        { input: "nums = [3, 7, 11]", output: "False" },
      ],
      initial_code: `def has_duplicate(nums):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([1, 4, 9, 4], True), ([3, 7, 11], False), ([], False), ([5, 5], True)]
    for idx, (inp, exp) in enumerate(cases):
        actual = has_duplicate(inp)
        results.append({"id": idx + 1, "input": f"has_duplicate({inp})", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Track previously seen values inside a Python `set()`.",
        "If the current number is already in `seen`, return `True` right away.",
      ],
    },
    {
      id: "alg-01-d3",
      title: "Practice 3/3: Target Sum Pair Counter",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `count_target_pairs(nums, target)`: assuming all numbers in `nums` are distinct, return how many unordered pairs `(a, b)` add up to `target` in O(n) time.",
      constraints: [
        "Use a set for O(1) complement lookups",
        "Avoid counting `(a, b)` and `(b, a)` twice, and never pair a number with itself",
      ],
      examples: [{ input: "nums = [1, 5, 3, 7, 9, 2], target = 10", output: "2" }],
      initial_code: `def count_target_pairs(nums, target):
    pass`,
      expected_output: "2",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([1, 5, 3, 7, 9, 2], 10), 2), (([2, 4, 6], 10), 1), (([5], 10), 0), (([0, -2, 2, 4], 2), 2)]
    for idx, ((arr, t), exp) in enumerate(cases):
        actual = count_target_pairs(arr, t)
        results.append({"id": idx + 1, "input": f"nums={arr}, target={t}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Only add the current number to `seen` *after* checking `target - num in seen`.",
        "Each time `target - num` is already in `seen`, increment your pair counter by 1.",
      ],
    },
  ],

  // 02: Two Pointers
  2: [
    {
      id: "alg-02-d2",
      title: "Practice 2/3: Sorted Two-Sum Pointers",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `sorted_pair_sum(nums, target)`: given a **sorted** ascending list `nums`, use left/right pointers to return the two values `[nums[left], nums[right]]` that add up to `target`, or `[]` if none exist.",
      constraints: [
        "Use O(1) extra space (no dictionary/set)",
        "Move `left` right if the sum is too small; move `right` left if too large",
      ],
      examples: [{ input: "nums = [1, 3, 4, 8, 12], target = 11", output: "[3, 8]" }],
      initial_code: `def sorted_pair_sum(nums, target):
    pass`,
      expected_output: "[3, 8]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([1, 3, 4, 8, 12], 11), [3, 8]), (([2, 5, 9, 10], 19), [9, 10]), (([1, 2, 3], 99), [])]
    for idx, ((arr, t), exp) in enumerate(cases):
        actual = sorted_pair_sum(arr, t)
        results.append({"id": idx + 1, "input": f"nums={arr}, target={t}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Start `left = 0` and `right = len(nums) - 1`, looping `while left < right:`.",
        "Compare `nums[left] + nums[right]` against `target`.",
      ],
    },
    {
      id: "alg-02-d3",
      title: "Practice 3/3: In-Place Array Reversal",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `reverse_in_place(items)`: reverse the list `items` in-place by swapping opposite ends with two pointers, without using `.reverse()` or slicing `[::-1]`, and return `items`.",
      constraints: [
        "Mutate `items` in O(1) space",
        "Swap pairs until the two pointers meet in the middle",
      ],
      examples: [{ input: "items = ['a', 'b', 'c', 'd']", output: "['d', 'c', 'b', 'a']" }],
      initial_code: `def reverse_in_place(items):
    pass`,
      expected_output: "['d', 'c', 'b', 'a']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(["a", "b", "c", "d"], ["d", "c", "b", "a"]), ([1, 2, 3], [3, 2, 1]), ([9], [9]), ([], [])]
    for idx, (arr, exp) in enumerate(cases):
        actual = reverse_in_place(arr[:])
        results.append({"id": idx + 1, "input": f"reverse_in_place({arr})", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Python tuple unpacking lets you swap cleanly: `items[left], items[right] = items[right], items[left]`.",
        "Advance `left += 1` and `right -= 1` after each swap.",
      ],
    },
  ],

  // 03: Stack / Valid Brackets
  3: [
    {
      id: "alg-03-d2",
      title: "Practice 2/3: Multi-Type Bracket Validator",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `validate_brackets(expr)`: verify whether all round `()`, curly `{}`, and square `[]` brackets in `expr` close in valid LIFO order (ignoring non-bracket characters).",
      constraints: [
        "Support all three bracket pairs: `()`, `{}`, `[]`",
        "Return `False` on mismatched types or leftover unclosed openers",
      ],
      examples: [
        { input: 'expr = "([x + y] * {2})"', output: "True" },
        { input: 'expr = "([)]"', output: "False" },
      ],
      initial_code: `def validate_brackets(expr):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("([x + y] * {2})", True), ("([)]", False), ("{[]}()", True), ("(", False), ("]", False)]
    for idx, (inp, exp) in enumerate(cases):
        actual = validate_brackets(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Map each closer to its expected opener in a dict like `{')': '(', ']': '[', '}': '{'}`.",
        "Pop from the stack on each closer and verify it matches the mapped opener.",
      ],
    },
    {
      id: "alg-03-d3",
      title: "Practice 3/3: Backspace Editor Stack",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `apply_backspaces(typed)`: simulate a text editor where `'#'` deletes the previous typed character (if any). Return the final resulting string.",
      constraints: [
        "Push regular characters onto a list stack",
        "Pop on `'#'` only when the stack is non-empty",
      ],
      examples: [{ input: 'typed = "ab#c##de#f"', output: "df" }],
      initial_code: `def apply_backspaces(typed):
    pass`,
      expected_output: "df",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("ab#c##de#f", "df"), ("###abc", "abc"), ("a##b", "b"), ("", "")]
    for idx, (inp, exp) in enumerate(cases):
        actual = apply_backspaces(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Maintain `stack = []` and loop over each character `ch` in `typed`.",
        "Return `''.join(stack)` once all characters are processed.",
      ],
    },
  ],

  // 04: Binary Search
  4: [
    {
      id: "alg-04-d2",
      title: "Practice 2/3: Rotated Version Target Lookup",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `binary_find(nums, target)`: perform iterative binary search on sorted ascending `nums` and return the index of `target`, or `-1` if absent.",
      constraints: [
        "O(log n) time and O(1) space",
        "Do not call `.index()` or linear scan",
      ],
      examples: [{ input: "nums = [3, 8, 14, 21, 35], target = 21", output: "3" }],
      initial_code: `def binary_find(nums, target):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([3, 8, 14, 21, 35], 21), 3), (([3, 8, 14, 21, 35], 10), -1), (([7], 7), 0), (([], 7), -1)]
    for idx, ((arr, t), exp) in enumerate(cases):
        actual = binary_find(arr, t)
        results.append({"id": idx + 1, "input": f"nums={arr}, target={t}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `while low <= high:` with `mid = (low + high) // 2`.",
        "Shrink bounds by setting `low = mid + 1` or `high = mid - 1`.",
      ],
    },
    {
      id: "alg-04-d3",
      title: "Practice 3/3: First & Last Occurrence Finder",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `find_last_index(nums, target)`: when `nums` is sorted ascending and may contain duplicates, return the **rightmost** (last) index equal to `target`, or `-1` if not found.",
      constraints: [
        "O(log n) time",
        "Keep searching right (`low = mid + 1`) even after matching `target`",
      ],
      examples: [{ input: "nums = [2, 5, 5, 5, 9], target = 5", output: "3" }],
      initial_code: `def find_last_index(nums, target):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([2, 5, 5, 5, 9], 5), 3), (([1, 1, 1], 1), 2), (([2, 4, 6], 5), -1)]
    for idx, ((arr, t), exp) in enumerate(cases):
        actual = find_last_index(arr, t)
        results.append({"id": idx + 1, "input": f"nums={arr}, target={t}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Initialize `ans = -1`. Whenever `nums[mid] == target`, save `ans = mid` and set `low = mid + 1`.",
      ],
    },
  ],

  // 05: Linear / Subarray Optimization (if present in DB)
  5: [
    {
      id: "alg-05-d2",
      title: "Practice 2/2: Maximum Contiguous Subarray",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `max_subarray_sum(nums)`: find the largest possible sum of any non-empty contiguous subarray in O(n) time.",
      constraints: [
        "Handle arrays containing negative numbers",
        "Return 0 only if `nums` is empty",
      ],
      examples: [{ input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5]", output: "6" }],
      initial_code: `def max_subarray_sum(nums):
    pass`,
      expected_output: "6",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([-2, 1, -3, 4, -1, 2, 1, -5], 6), ([-5, -2, -9], -2), ([5, 4, -1, 7], 15), ([], 0)]
    for idx, (arr, exp) in enumerate(cases):
        actual = max_subarray_sum(arr)
        results.append({"id": idx + 1, "input": f"{arr}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "At each value `x`, either extend the current subarray (`curr + x`) or restart at `x`.",
      ],
    },
  ],

  // 06: Frequency Counter
  6: [
    {
      id: "alg-06-d2",
      title: "Practice 2/3: Top Active User Tie-Breaker",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `most_active_user(users)`: tally message counts in O(n) time and return the username with the highest count. Break ties alphabetically (smallest name).",
      constraints: [
        "Return `None` if `users` is empty",
        "Break count ties by choosing the alphabetically earlier username",
      ],
      examples: [{ input: 'users = ["sam", "alex", "sam", "alex"]', output: "alex" }],
      initial_code: `def most_active_user(users):
    pass`,
      expected_output: "alex",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(["sam", "alex", "sam", "alex"], "alex"), (["mia", "kai", "mia"], "mia"), ([], None)]
    for idx, (inp, exp) in enumerate(cases):
        actual = most_active_user(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Build a frequency dict first, then pick the key minimizing `(-count, name)`.",
      ],
    },
    {
      id: "alg-06-d3",
      title: "Practice 3/3: Frequency-Map Anagram Check",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `are_anagrams(word_a, word_b)`: return `True` if `word_a` and `word_b` contain the exact same characters with identical frequencies, in O(n) time without sorting.",
      constraints: [
        "Do not call `sorted()`",
        "Fast-fail if lengths differ",
      ],
      examples: [
        { input: 'word_a = "listen", word_b = "silent"', output: "True" },
        { input: 'word_a = "rat", word_b = "car"', output: "False" },
      ],
      initial_code: `def are_anagrams(word_a, word_b):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(("listen", "silent"), True), (("rat", "car"), False), (("aabb", "baba"), True), (("ab", "a"), False)]
    for idx, ((a, b), exp) in enumerate(cases):
        actual = are_anagrams(a, b)
        results.append({"id": idx + 1, "input": f"{a!r}, {b!r}", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Increment counts for characters in `word_a` and decrement for characters in `word_b` (or compare two frequency dicts).",
      ],
    },
  ],

  // 07: Sliding Window
  7: [
    {
      id: "alg-07-d2",
      title: "Practice 2/3: Quietest K-Day Traffic Window",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `min_window_sum(visitors, k)`: return the **smallest** total visitor sum across any `k` consecutive days using an O(n) sliding window.",
      constraints: [
        "Compute the initial `k` window once, then slide in O(1) per step",
        "Return `0` if `k <= 0` or `k > len(visitors)`",
      ],
      examples: [{ input: "visitors = [40, 10, 5, 25, 30], k = 2", output: "15" }],
      initial_code: `def min_window_sum(visitors, k):
    pass`,
      expected_output: "15",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([40, 10, 5, 25, 30], 2), 15), (([8, 2, 9, 1], 3), 12), (([5], 2), 0)]
    for idx, ((v, k), exp) in enumerate(cases):
        actual = min_window_sum(v, k)
        results.append({"id": idx + 1, "input": f"visitors={v}, k={k}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Slide by adding `visitors[i]` and subtracting `visitors[i - k]`, updating `best = min(best, window_sum)`.",
      ],
    },
    {
      id: "alg-07-d3",
      title: "Practice 3/3: Traffic Alert Windows Counter",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `count_spike_windows(visitors, k, threshold)`: return how many `k`-day consecutive windows have an average strictly greater than or equal to `threshold` (`sum >= k * threshold`).",
      constraints: [
        "Single O(n) pass with a fixed-size sliding window",
        "Count both the initial window and every subsequent slid window",
      ],
      examples: [{ input: "visitors = [10, 30, 50, 40, 15], k = 2, threshold = 35", output: "2" }],
      initial_code: `def count_spike_windows(visitors, k, threshold):
    pass`,
      expected_output: "2",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([10, 30, 50, 40, 15], 2, 35), 2), (([50, 50, 50], 2, 50), 2), (([10, 10], 3, 5), 0)]
    for idx, ((v, k, th), exp) in enumerate(cases):
        actual = count_spike_windows(v, k, th)
        results.append({"id": idx + 1, "input": f"v={v}, k={k}, th={th}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `window_sum >= k * threshold` right after computing the initial window, then again on every slide.",
      ],
    },
  ],

  // 08: Balanced Brackets Linter
  8: [
    {
      id: "alg-08-d2",
      title: "Practice 2/3: Max Nesting Depth Analyzer",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `max_paren_depth(code_str)`: assuming parentheses `(` and `)` are balanced, return the maximum nesting depth reached (e.g. `'(a+(b*c))'` -> `2`).",
      constraints: [
        "O(n) time and O(1) space",
        "Ignore all characters other than `'('` and `')'`",
      ],
      examples: [{ input: 'code_str = "((1 + 2) * (3))"', output: "2" }],
      initial_code: `def max_paren_depth(code_str):
    pass`,
      expected_output: "2",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("((1 + 2) * (3))", 2), ("(((())))", 4), ("abc", 0), ("()()", 1)]
    for idx, (inp, exp) in enumerate(cases):
        actual = max_paren_depth(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Increment `depth` on `'('`, update `best = max(best, depth)`, and decrement on `')'`.",
      ],
    },
    {
      id: "alg-08-d3",
      title: "Practice 3/3: Minimum Edits to Balance",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `min_parens_needed(s)`: return the minimum number of `'('` or `')'` insertions required to make string `s` valid.",
      constraints: [
        "Track unmatched closing parentheses separately from remaining open parentheses",
        "O(n) single pass",
      ],
      examples: [
        { input: 's = "()))(("', output: "4" },
        { input: 's = "(()"', output: "1" },
      ],
      initial_code: `def min_parens_needed(s):
    pass`,
      expected_output: "4 1",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("()))((", 4), ("(()", 1), ("()", 0), (")))", 3)]
    for idx, (inp, exp) in enumerate(cases):
        actual = min_parens_needed(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Increment `opened` on `'('`; on `')'`, decrement `opened` if `opened > 0`, else increment `insertions += 1`.",
        "Return `opened + insertions` at the end.",
      ],
    },
  ],

  // 09: Filtered Linear Scan
  9: [
    {
      id: "alg-09-d2",
      title: "Practice 2/2: Highest Valid Bid Selector",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `find_highest_bid(bids)`: return the highest positive integer bid from `bids` while safely ignoring `None` and values `<= 0` (return `-1` if no valid bid exists).",
      constraints: [
        "Single O(n) pass",
        "Guard against `None` before numeric comparisons",
      ],
      examples: [{ input: "bids = [None, -5, 120, 0, 480, 310]", output: "480" }],
      initial_code: `def find_highest_bid(bids):
    pass`,
      expected_output: "480",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([None, -5, 120, 0, 480, 310], 480), ([None, 0, -10], -1), ([75], 75)]
    for idx, (inp, exp) in enumerate(cases):
        actual = find_highest_bid(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `if bid is not None and bid > 0:` before updating `best`.",
      ],
    },
  ],

  // 10: Lower-Bound Binary Search
  10: [
    {
      id: "alg-10-d2",
      title: "Practice 2/3: First Element Greater Than Target",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `upper_bound_index(nums, target)`: using binary search on sorted `nums`, return the **first index** whose value is **strictly greater** than `target` (or `len(nums)` if none).",
      constraints: [
        "O(log n) time",
        "Handle duplicates of `target` by skipping past all equal values",
      ],
      examples: [{ input: "nums = [10, 20, 20, 20, 35], target = 20", output: "4" }],
      initial_code: `def upper_bound_index(nums, target):
    pass`,
      expected_output: "4",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([10, 20, 20, 20, 35], 20), 4), (([1, 2, 3], 5), 3), (([5, 8, 9], 1), 0)]
    for idx, ((arr, t), exp) in enumerate(cases):
        actual = upper_bound_index(arr, t)
        results.append({"id": idx + 1, "input": f"nums={arr}, target={t}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `while low <= high:`: when `nums[mid] <= target`, advance `low = mid + 1`; otherwise `high = mid - 1`.",
      ],
    },
    {
      id: "alg-10-d3",
      title: "Practice 3/3: Count Occurrences in O(log n)",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `count_in_sorted(nums, target)`: compute how many times `target` appears in sorted list `nums` in O(log n) time using lower and upper bounds.",
      constraints: [
        "Must run in O(log n) time via binary search bounds",
      ],
      examples: [{ input: "nums = [2, 4, 4, 4, 7, 9], target = 4", output: "3" }],
      initial_code: `def count_in_sorted(nums, target):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([2, 4, 4, 4, 7, 9], 4), 3), (([1, 2, 3], 5), 0), (([6, 6, 6, 6], 6), 4)]
    for idx, ((arr, t), exp) in enumerate(cases):
        actual = count_in_sorted(arr, t)
        results.append({"id": idx + 1, "input": f"nums={arr}, target={t}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Count equals `first_gt(target) - first_ge(target)`!",
      ],
    },
  ],

  // 11: Set Intersection
  11: [
    {
      id: "alg-11-d2",
      title: "Practice 2/2: Exclusive List Difference",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `find_unique_only_in_a(list_a, list_b)`: return a **sorted** list of unique values present in `list_a` that do **not** appear in `list_b`.",
      constraints: [
        "Remove duplicates and sort ascending",
        "Use O(n + m) set operations",
      ],
      examples: [{ input: 'list_a = ["Sam", "Mia", "Sam", "Kai"], list_b = ["Mia"]', output: "['Kai', 'Sam']" }],
      initial_code: `def find_unique_only_in_a(list_a, list_b):
    pass`,
      expected_output: "['Kai', 'Sam']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((["Sam", "Mia", "Sam", "Kai"], ["Mia"]), ["Kai", "Sam"]), (([1, 2, 2], [1, 2]), []), (([3, 1], []), [1, 3])]
    for idx, ((a, b), exp) in enumerate(cases):
        actual = find_unique_only_in_a(a, b)
        results.append({"id": idx + 1, "input": f"a={a}, b={b}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Set difference `set(list_a) - set(list_b)` removes elements present in `list_b`.",
      ],
    },
  ],

  // 12: Prefix Sums
  12: [
    {
      id: "alg-12-d2",
      title: "Practice 2/3: Equilibrium Pivot Index",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `find_pivot_index(nums)`: return the leftmost index `i` where the sum of elements strictly to its left equals the sum strictly to its right, or `-1` if none.",
      constraints: [
        "O(n) time and O(1) space using running `left_sum` and `total_sum`",
      ],
      examples: [{ input: "nums = [1, 7, 3, 6, 5, 6]", output: "3" }],
      initial_code: `def find_pivot_index(nums):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([1, 7, 3, 6, 5, 6], 3), ([1, 2, 3], -1), ([2, 1, -1], 0)]
    for idx, (inp, exp) in enumerate(cases):
        actual = find_pivot_index(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "At index `i`, right sum equals `total_sum - left_sum - nums[i]`.",
      ],
    },
    {
      id: "alg-12-d3",
      title: "Practice 3/3: Weighted Range Averages",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `range_averages(numbers, queries)`: given `[left, right]` inclusive queries, use a prefix sum array to return the integer floor average `sum // count` for each query.",
      constraints: [
        "Precompute prefix sums once in O(n)",
        "Answer each query in O(1)",
      ],
      examples: [{ input: "numbers = [10, 20, 30, 40], queries = [[0, 2], [1, 3]]", output: "[20, 30]" }],
      initial_code: `def range_averages(numbers, queries):
    pass`,
      expected_output: "[20, 30]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([10, 20, 30, 40], [[0, 2], [1, 3]]), [20, 30]), (([5, 9, 12], [[0, 1], [0, 2]]), [7, 8])]
    for idx, ((arr, q), exp) in enumerate(cases):
        actual = range_averages(arr, q)
        results.append({"id": idx + 1, "input": f"nums={arr}, q={q}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Subarray length is `(right - left + 1)` and sum is `prefix[right + 1] - prefix[left]`.",
      ],
    },
  ],

  // 13: Runner-Up / Top-K Distinct
  13: [
    {
      id: "alg-13-d2",
      title: "Practice 2/3: Second Lowest Distinct Price",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `second_lowest_price(prices)`: find the `[lowest, second_lowest_distinct]` prices in a single O(n) pass without sorting.",
      constraints: [
        "O(n) time and O(1) space; do not call `sorted()`",
        "Duplicate lowest prices must not overwrite `second`",
      ],
      examples: [{ input: "prices = [90, 25, 25, 45, 70]", output: "[25, 45]" }],
      initial_code: `def second_lowest_price(prices):
    pass`,
      expected_output: "[25, 45]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([90, 25, 25, 45, 70], [25, 45]), ([10, 10, 10], [10, None]), ([5, 12], [5, 12])]
    for idx, (inp, exp) in enumerate(cases):
        actual = second_lowest_price(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "When `p < first`, shift `second = first` before setting `first = p`. Only check `p > first and (second is None or p < second)` otherwise.",
      ],
    },
    {
      id: "alg-13-d3",
      title: "Practice 3/3: Top-3 Podium Distinct Scores",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `top_three_distinct(scores)`: return a list `[gold, silver, bronze]` of the top 3 distinct highest scores (using `None` for any unfilled podium spot).",
      constraints: [
        "Single O(n) pass with O(1) extra space",
        "Duplicate scores do not occupy multiple podium slots",
      ],
      examples: [{ input: "scores = [30, 50, 50, 40, 10]", output: "[50, 40, 30]" }],
      initial_code: `def top_three_distinct(scores):
    pass`,
      expected_output: "[50, 40, 30]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([30, 50, 50, 40, 10], [50, 40, 30]), ([10, 20], [20, 10, None]), ([9, 9], [9, None, None])]
    for idx, (inp, exp) in enumerate(cases):
        actual = top_three_distinct(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Skip any score already equal to `first`, `second`, or `third` before comparing.",
      ],
    },
  ],

  // 14: Multi-Key Sorting
  14: [
    {
      id: "alg-14-d2",
      title: "Practice 2/3: Priority Task Queue Sorter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `order_tasks(tasks)`: each item is `{'id': str, 'priority': int, 'duration': int}`. Return ordered task IDs by **highest priority**, then **shortest duration**, then **ID alphabetically**.",
      constraints: [
        "Use a multi-key tuple sort without mutating input list",
      ],
      examples: [
        {
          input: 'tasks = [{"id": "t2", "priority": 2, "duration": 30}, {"id": "t1", "priority": 2, "duration": 10}, {"id": "t3", "priority": 5, "duration": 50}]',
          output: "['t3', 't1', 't2']",
        },
      ],
      initial_code: `def order_tasks(tasks):
    pass`,
      expected_output: "['t3', 't1', 't2']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    s1 = [{"id": "t2", "priority": 2, "duration": 30}, {"id": "t1", "priority": 2, "duration": 10}, {"id": "t3", "priority": 5, "duration": 50}]
    s2 = [{"id": "b", "priority": 1, "duration": 5}, {"id": "a", "priority": 1, "duration": 5}]
    for idx, (inp, exp) in enumerate([(s1, ["t3", "t1", "t2"]), (s2, ["a", "b"])]):
        actual = order_tasks(inp)
        results.append({"id": idx + 1, "input": f"case {idx + 1}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Negate numeric fields you want in descending order inside `sorted(..., key=lambda t: ...)`.",
      ],
    },
    {
      id: "alg-14-d3",
      title: "Practice 3/3: Top-K Ranked Cutoffs",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `top_k_players(players, k)`: rank players by score descending, penalties ascending, and name ascending, and return only the top `k` player names.",
      constraints: [
        "Handle `k <= 0` safely (return `[]`) and `k > len(players)` cleanly",
      ],
      examples: [
        {
          input: 'players = [{"name": "Zed", "score": 80, "penalties": 1}, {"name": "Amy", "score": 80, "penalties": 1}, {"name": "Leo", "score": 90, "penalties": 3}], k = 2',
          output: "['Leo', 'Amy']",
        },
      ],
      initial_code: `def top_k_players(players, k):
    pass`,
      expected_output: "['Leo', 'Amy']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    p = [{"name": "Zed", "score": 80, "penalties": 1}, {"name": "Amy", "score": 80, "penalties": 1}, {"name": "Leo", "score": 90, "penalties": 3}]
    cases = [((p, 2), ["Leo", "Amy"]), ((p, 0), []), ((p, 10), ["Leo", "Amy", "Zed"])]
    for idx, ((arr, k), exp) in enumerate(cases):
        actual = top_k_players(arr, k)
        results.append({"id": idx + 1, "input": f"k={k}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Guard `if k <= 0: return []` before slicing `[:k]`.",
      ],
    },
  ],

  // 15: Two-Pointer In-Place Partition
  15: [
    {
      id: "alg-15-d2",
      title: "Practice 2/3: Move Zeros In-Place",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `move_zeros_end(nums)`: shift every `0` to the end of `nums` **in-place** while preserving the relative order of non-zero elements, and return `nums`.",
      constraints: [
        "O(n) time and O(1) extra space",
        "Preserve the relative order of all non-zero items",
      ],
      examples: [{ input: "nums = [0, 3, 0, 1, 12]", output: "[3, 1, 12, 0, 0]" }],
      initial_code: `def move_zeros_end(nums):
    pass`,
      expected_output: "[3, 1, 12, 0, 0]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([0, 3, 0, 1, 12], [3, 1, 12, 0, 0]), ([0, 0], [0, 0]), ([4, 5], [4, 5])]
    for idx, (inp, exp) in enumerate(cases):
        actual = move_zeros_end(inp[:])
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Keep a `write` pointer starting at `0`: whenever `nums[read] != 0`, swap `nums[write]` and `nums[read]`, then `write += 1`.",
      ],
    },
    {
      id: "alg-15-d3",
      title: "Practice 3/3: Three-Way Flag Partition",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `sort_zero_one_two(nums)`: sort an array containing only `0`, `1`, and `2` **in-place** in a single O(n) pass using three pointers (`low`, `mid`, `high`).",
      constraints: [
        "Do not call `.sort()` or `sorted()`",
        "O(n) single pass, O(1) extra space",
      ],
      examples: [{ input: "nums = [2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]" }],
      initial_code: `def sort_zero_one_two(nums):
    pass`,
      expected_output: "[0, 0, 1, 1, 2, 2]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([2, 0, 2, 1, 1, 0], [0, 0, 1, 1, 2, 2]), ([2, 1, 0], [0, 1, 2]), ([1, 1], [1, 1])]
    for idx, (inp, exp) in enumerate(cases):
        actual = sort_zero_one_two(inp[:])
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "When `nums[mid] == 0`, swap with `low` and advance both `low` and `mid`; when `nums[mid] == 2`, swap with `high` and decrement `high` *without* advancing `mid`!",
      ],
    },
  ],

  // 16: Batch Gatekeeper
  16: [
    {
      id: "alg-16-d2",
      title: "Practice 2/2: Banned Account Request Filter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `allow_non_banned(banned_ids, requests)`: return all request IDs **not** in `banned_ids` while keeping only the first request per non-banned user in arrival order.",
      constraints: [
        "Convert `banned_ids` to a set for O(1) lookups",
        "Preserve arrival order without duplicates",
      ],
      examples: [
        { input: 'banned_ids = ["bot1", "spam"], requests = ["u1", "bot1", "u2", "u1", "spam"]', output: "['u1', 'u2']" },
      ],
      initial_code: `def allow_non_banned(banned_ids, requests):
    pass`,
      expected_output: "['u1', 'u2']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((["bot1", "spam"], ["u1", "bot1", "u2", "u1", "spam"]), ["u1", "u2"]), ((["a"], ["a", "a"]), []), (([], ["x", "x", "y"]), ["x", "y"])]
    for idx, ((b, r), exp) in enumerate(cases):
        actual = allow_non_banned(b, r)
        results.append({"id": idx + 1, "input": f"banned={b}, req={r}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Maintain two sets: `banned = set(banned_ids)` and `seen = set()`.",
      ],
    },
  ],

  // 17: Palindrome Sanitizer
  17: [
    {
      id: "alg-17-d2",
      title: "Practice 2/3: Almost-Palindrome (1 Skip Allowed)",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `valid_palindrome_one_skip(s)`: given a lowercase string `s`, return `True` if it can become a palindrome after deleting **at most one** character.",
      constraints: [
        "O(n) time and O(1) space",
        "Check skipping either `left` OR `right` on the first mismatch",
      ],
      examples: [
        { input: 's = "abca"', output: "True" },
        { input: 's = "abc"', output: "False" },
      ],
      initial_code: `def valid_palindrome_one_skip(s):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("abca", True), ("abc", False), ("raceacar", True), ("aba", True)]
    for idx, (inp, exp) in enumerate(cases):
        actual = valid_palindrome_one_skip(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Write a small helper `is_pal(lo, hi)` and invoke `is_pal(left + 1, right) or is_pal(left, right - 1)` on the first mismatch.",
      ],
    },
    {
      id: "alg-17-d3",
      title: "Practice 3/3: Longest Palindromic Substring Length",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `longest_pal_length(s)`: use expand-around-center for every index (odd and even centers) to return the length of the longest palindromic substring in `s`.",
      constraints: [
        "O(n^2) time and O(1) extra space",
        "Check both odd `(i, i)` and even `(i, i + 1)` centers",
      ],
      examples: [{ input: 's = "babad"', output: "3" }],
      initial_code: `def longest_pal_length(s):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("babad", 3), ("cbbd", 2), ("racecar", 7), ("", 0)]
    for idx, (inp, exp) in enumerate(cases):
        actual = longest_pal_length(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Expand outward `while l >= 0 and r < len(s) and s[l] == s[r]:` and return `r - l - 1`.",
      ],
    },
  ],

  // 18: Early-Exit First Duplicate
  18: [
    {
      id: "alg-18-d2",
      title: "Practice 2/2: First Non-Repeating Character",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `first_unique_char(text)`: return the **index** of the first character in `text` that appears only once, or `-1` if every character repeats.",
      constraints: [
        "O(n) two-pass solution using a frequency dictionary",
      ],
      examples: [{ input: 'text = "leetcode"', output: "0" }, { input: 'text = "aabb"', output: "-1" }],
      initial_code: `def first_unique_char(text):
    pass`,
      expected_output: "0 -1",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("leetcode", 0), ("aabb", -1), ("loveleetcode", 2), ("", -1)]
    for idx, (inp, exp) in enumerate(cases):
        actual = first_unique_char(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Count character frequencies on pass 1, then iterate `enumerate(text)` on pass 2 checking `counts[ch] == 1`.",
      ],
    },
  ],

  // 19: Min Abs Diff
  19: [
    {
      id: "alg-19-d2",
      title: "Practice 2/3: All Closest Pairs Finder",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `closest_pairs(nums)`: return all `[a, b]` pairs (with `a < b`, sorted ascending) that achieve the global minimum absolute difference in `nums`.",
      constraints: [
        "Sort first, then compute the minimum adjacent gap",
        "Collect all adjacent pairs matching that minimum gap",
      ],
      examples: [{ input: "nums = [4, 2, 1, 3]", output: "[[1, 2], [2, 3], [3, 4]]" }],
      initial_code: `def closest_pairs(nums):
    pass`,
      expected_output: "[[1, 2], [2, 3], [3, 4]]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([4, 2, 1, 3], [[1, 2], [2, 3], [3, 4]]), ([3, 8, -10, 23, 19, -4, -14, 27], [[-14, -10], [19, 23], [23, 27]])]
    for idx, (inp, exp) in enumerate(cases):
        actual = closest_pairs(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "When you find a strictly smaller adjacent gap, reset `pairs = [[ordered[i-1], ordered[i]]]`.",
      ],
    },
    {
      id: "alg-19-d3",
      title: "Practice 3/3: Smallest Difference Across Two Lists",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `min_diff_two_arrays(arr_a, arr_b)`: find the smallest `abs(x - y)` between any element `x` in `arr_a` and `y` in `arr_b` using sort + two pointers in O(n log n + m log m).",
      constraints: [
        "Sort both lists and advance the pointer on the smaller element",
      ],
      examples: [{ input: "arr_a = [1, 3, 15, 11], arr_b = [23, 127, 235, 19, 8]", output: "3" }],
      initial_code: `def min_diff_two_arrays(arr_a, arr_b):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([1, 3, 15, 11], [23, 127, 235, 19, 8]), 3), (([10, 20], [5, 22]), 2), (([4, 9], [9, 15]), 0)]
    for idx, ((a, b), exp) in enumerate(cases):
        actual = min_diff_two_arrays(a, b)
        results.append({"id": idx + 1, "input": f"a={a}, b={b}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Advancing the pointer pointing to the smaller value can only reduce the gap (or pass the larger value).",
      ],
    },
  ],

  // 20: Inverted Role Index
  20: [
    {
      id: "alg-20-d2",
      title: "Practice 2/3: Search Tag Inverted Index",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `build_word_index(docs)`: given a list of document strings, build an inverted index `{word: [doc_indices...]}` mapping each lowercase word to sorted unique document indices containing it.",
      constraints: [
        "Split each doc on spaces after `.lower()`",
        "Do not duplicate the same doc index twice for a word",
      ],
      examples: [{ input: 'docs = ["Hello world", "hello python"]', output: "{'hello': [0, 1], 'world': [0], 'python': [1]}" }],
      initial_code: `def build_word_index(docs):
    pass`,
      expected_output: "{'hello': [0, 1], 'world': [0], 'python': [1]}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(["Hello world", "hello python"], {"hello": [0, 1], "world": [0], "python": [1]}), (["go go"], {"go": [0]})]
    for idx, (inp, exp) in enumerate(cases):
        actual = build_word_index(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Deduplicate words per document with `set(doc.lower().split())` while preserving document index order.",
      ],
    },
    {
      id: "alg-20-d3",
      title: "Practice 3/3: Largest Team Role Finder",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `largest_role_group(names, roles)`: group members by role and return `(largest_role, count)`. Break ties alphabetically by role name.",
      constraints: [
        "Return `(None, 0)` when lists are empty",
      ],
      examples: [{ input: 'names = ["A", "B", "C", "D"], roles = ["ops", "dev", "ops", "dev"]', output: "('dev', 2)" }],
      initial_code: `def largest_role_group(names, roles):
    pass`,
      expected_output: "('dev', 2)",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((["A", "B", "C", "D"], ["ops", "dev", "ops", "dev"]), ("dev", 2)), (([], []), (None, 0)), ((["X"], ["qa"]), ("qa", 1))]
    for idx, ((n, r), exp) in enumerate(cases):
        actual = largest_role_group(n, r)
        results.append({"id": idx + 1, "input": f"roles={r}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Sort candidate roles by `(-len(members), role)` to pick highest count, breaking ties alphabetically.",
      ],
    },
  ],

  // 21: Best Time to Buy and Sell Stock
  21: [
    {
      id: "alg-21-d2",
      title: "Practice 2/3: Unlimited Trades Total Profit",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `max_multi_profit(prices)`: when you can buy and sell as many times as you like (at most 1 share held at a time), return the total maximum profit.",
      constraints: [
        "Greedy O(n) single pass summing every positive day-over-day gain",
      ],
      examples: [{ input: "prices = [7, 1, 5, 3, 6, 4]", output: "7" }],
      initial_code: `def max_multi_profit(prices):
    pass`,
      expected_output: "7",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([7, 1, 5, 3, 6, 4], 7), ([1, 2, 3, 4, 5], 4), ([7, 6, 4, 3], 0)]
    for idx, (inp, exp) in enumerate(cases):
        actual = max_multi_profit(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Whenever `prices[i] > prices[i - 1]`, add `prices[i] - prices[i - 1]` to `total`.",
      ],
    },
    {
      id: "alg-21-d3",
      title: "Practice 3/3: Optimal Trade Day Pair",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `best_trade_days(prices)`: return `[buy_index, sell_index]` achieving the highest single-trade profit, or `[]` if no profitable trade is possible.",
      constraints: [
        "Must ensure `buy_index < sell_index` and `prices[sell_index] - prices[buy_index] > 0`",
      ],
      examples: [{ input: "prices = [7, 2, 5, 1, 6, 4]", output: "[3, 4]" }],
      initial_code: `def best_trade_days(prices):
    pass`,
      expected_output: "[3, 4]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([7, 2, 5, 1, 6, 4], [3, 4]), ([9, 5, 2], []), ([1, 8], [0, 1])]
    for idx, (inp, exp) in enumerate(cases):
        actual = best_trade_days(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Track `min_idx = 0` alongside `best_profit = 0` and `best_pair = []`.",
      ],
    },
  ],

  // 22: Group Anagrams
  22: [
    {
      id: "alg-22-d2",
      title: "Practice 2/3: Case-Insensitive Anagram Counter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `count_anagram_groups(words)`: count how many distinct anagram families exist in `words`, treating uppercase and lowercase letters identically.",
      constraints: [
        "Normalize each word with `.lower()` before generating its signature",
      ],
      examples: [{ input: 'words = ["Eat", "tea", "TAN", "ate", "Bat"]', output: "3" }],
      initial_code: `def count_anagram_groups(words):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(["Eat", "tea", "TAN", "ate", "Bat"], 3), (["a", "A"], 1), ([], 0)]
    for idx, (inp, exp) in enumerate(cases):
        actual = count_anagram_groups(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Collect normalized sorted-character signatures into a `set` and return `len(seen)`.",
      ],
    },
    {
      id: "alg-22-d3",
      title: "Practice 3/3: Largest Anagram Cluster",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `largest_anagram_group(words)`: return the **sorted list** of words belonging to the largest anagram group (or `[]` if `words` is empty).",
      constraints: [
        "Group by canonical character signature",
        "Return the winning bucket sorted alphabetically",
      ],
      examples: [{ input: 'words = ["act", "cat", "dog", "tac", "god"]', output: "['act', 'cat', 'tac']" }],
      initial_code: `def largest_anagram_group(words):
    pass`,
      expected_output: "['act', 'cat', 'tac']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(["act", "cat", "dog", "tac", "god"], ["act", "cat", "tac"]), ([], []), (["zen"], ["zen"])]
    for idx, (inp, exp) in enumerate(cases):
        actual = largest_anagram_group(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `max(groups.values(), key=len)` once all buckets are built.",
      ],
    },
  ],

  // 23: Merge Overlapping Intervals
  23: [
    {
      id: "alg-23-d2",
      title: "Practice 2/3: Meeting Conflict Detector",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `has_meeting_conflict(meetings)`: given `[start, end]` intervals, return `True` if any two meetings overlap (`next_start < prev_end`), or `False` if one engineer can attend all.",
      constraints: [
        "Back-to-back meetings like `[1, 5]` and `[5, 8]` do **not** overlap",
      ],
      examples: [
        { input: "meetings = [[0, 30], [5, 10], [15, 20]]", output: "True" },
        { input: "meetings = [[1, 5], [5, 8]]", output: "False" },
      ],
      initial_code: `def has_meeting_conflict(meetings):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([[0, 30], [5, 10], [15, 20]], True), ([[1, 5], [5, 8]], False), ([[7, 10], [2, 4]], False), ([], False)]
    for idx, (inp, exp) in enumerate(cases):
        actual = has_meeting_conflict(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Sort by start time first, then compare each `ordered[i][0] < ordered[i - 1][1]`.",
      ],
    },
    {
      id: "alg-23-d3",
      title: "Practice 3/3: Total Covered Interval Length",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `total_covered_time(intervals)`: merge overlapping intervals and return the total sum of `(end - start)` covered across the merged timeline.",
      constraints: [
        "Do not double-count overlapping segments",
      ],
      examples: [{ input: "intervals = [[1, 5], [3, 8], [10, 12]]", output: "9" }],
      initial_code: `def total_covered_time(intervals):
    pass`,
      expected_output: "9",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([[1, 5], [3, 8], [10, 12]], 9), ([[2, 6], [2, 6]], 4), ([], 0)]
    for idx, (inp, exp) in enumerate(cases):
        actual = total_covered_time(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "First merge overlapping intervals, then sum `end - start` for every interval in `merged`.",
      ],
    },
  ],

  // 24: Top-K Frequent
  24: [
    {
      id: "alg-24-d2",
      title: "Practice 2/3: Supermajority Elements (> n/3)",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `majority_elements(nums)`: return a sorted list of all elements appearing strictly more than `len(nums) // 3` times.",
      constraints: [
        "O(n log n) or O(n) frequency scan",
        "Check `count > len(nums) // 3`",
      ],
      examples: [{ input: "nums = [3, 2, 3, 1, 2, 2, 3]", output: "[2, 3]" }],
      initial_code: `def majority_elements(nums):
    pass`,
      expected_output: "[2, 3]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([3, 2, 3, 1, 2, 2, 3], [2, 3]), ([1, 2], [1, 2]), ([1, 2, 3, 4], [])]
    for idx, (inp, exp) in enumerate(cases):
        actual = majority_elements(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Count occurrences in a dict, filter `[k for k, v in counts.items() if v > len(nums) // 3]`, and return sorted.",
      ],
    },
    {
      id: "alg-24-d3",
      title: "Practice 3/3: Sort String by Character Frequency",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `frequency_sort_chars(text)`: return `text` rebuilt with characters ordered from highest frequency to lowest (break frequency ties alphabetically).",
      constraints: [
        "Group identical characters contiguously according to their frequency",
      ],
      examples: [{ input: 'text = "tree"', output: "eert" }],
      initial_code: `def frequency_sort_chars(text):
    pass`,
      expected_output: "eert",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [("tree", "eert"), ("cccaaa", "aaaccc"), ("ab", "ab"), ("", "")]
    for idx, (inp, exp) in enumerate(cases):
        actual = frequency_sort_chars(inp)
        results.append({"id": idx + 1, "input": repr(inp), "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Sort `(ch, count)` pairs by `(-count, ch)` and join `ch * count`.",
      ],
    },
  ],
};
