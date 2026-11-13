import { EnrichedLessonData } from "./types";

export const ALGORITHMS_ENRICHMENTS: EnrichedLessonData[] = [
  {
    matchTrack: "algorithms",
    matchOrder: 1,
    matchKeywords: ["two sum", "hash", "pair", "target", "lookup", "search"],
    realWorldUse:
      "Used in gift-card checkout (finding two items that add up to $50) and game matchmaking.",
    analogyTitle: "Memory Notebook vs. Asking Everyone Twice",
    analogyText:
      "As you look at each number `num`, calculate what partner number you need (`needed = target - num`). Check if `needed` is already in your `seen` dictionary!",
    cheatSheet: `seen = {}
for i, num in enumerate(nums):
    needed = target - num
    if needed in seen:
        return [seen[needed], i]
    seen[num] = i`,
    commonPitfall: {
      title: "Using the same element twice or nested O(n^2) loops",
      wrongCode: "seen[num] = i\nif target - num in seen:  # Can match itself on [3, 3]!",
      rightCode: "needed = target - num\nif needed in seen:\n    return [seen[needed], i]\nseen[num] = i",
      explanation:
        "Always check `if needed in seen:` BEFORE inserting `seen[num] = i` so an element never pairs with itself when `num * 2 == target`.",
    },
    guidedCode: `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, num in enumerate(nums):
            # 👉 Compute needed = target - num and check if needed in seen:
            needed = target - num
            if needed in seen:
                return [seen[needed], i]
            seen[num] = i
        return []`,
    solutionCode: `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, num in enumerate(nums):
            needed = target - num
            if needed in seen:
                return [seen[needed], i]
            seen[num] = i
        return []`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Trading O(n) hash-map memory drops lookup from an O(n^2) nested pair scan down to a single linear pass.",
      followUp:
        "If `nums` were already sorted, two pointers could solve it in O(1) extra space instead of a hash map.",
    },
    quiz: {
      question: "Why do we store seen numbers in a dictionary `{}`?",
      options: [
        "Looking up a key in a dictionary is instant O(1)",
        "Python doesn't allow two loops",
        "Dictionaries sort numbers automatically",
      ],
      correctIndex: 0,
      explanation: "Dictionary lookup (`if needed in seen:`) is instant!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 2,
    matchKeywords: ["pointer", "palindrome", "reverse", "symmetry"],
    realWorldUse:
      "Used in text tools and DNA sequence checks to see if a word reads the same backward and forward.",
    analogyTitle: "Checking From Both Ends Toward the Middle",
    analogyText:
      "Put `left = 0` at the start and `right = len(items) - 1` at the end. Compare them, then move `left += 1` and `right -= 1` inward!",
    cheatSheet: `left = 0
right = len(items) - 1
while left < right:
    left += 1
    right -= 1`,
    guidedCode: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        cleaned = "".join(c.lower() for c in s if c.isalnum())
        left, right = 0, len(cleaned) - 1
        while left < right:
            # 👉 Return False if cleaned[left] != cleaned[right], then move inward:
            if cleaned[left] != cleaned[right]:
                return False
            left += 1
            right -= 1
        return True`,
    solutionCode: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        cleaned = "".join(c.lower() for c in s if c.isalnum())
        left, right = 0, len(cleaned) - 1
        while left < right:
            if cleaned[left] != cleaned[right]:
                return False
            left += 1
            right -= 1
        return True`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) / O(1) in-place",
      tradeoff:
        "Converging two pointers checks symmetry in a single pass; skipping non-alphanumeric chars inline avoids allocating `cleaned` if strict O(1) space is required.",
      followUp:
        "How would you handle Valid Palindrome II where at most one character deletion is allowed?",
    },
    quiz: {
      question: "When should a two-pointer loop stop?",
      options: [
        "When `left < right` is no longer true (they meet in the middle)",
        "After 1 step",
        "Never",
      ],
      correctIndex: 0,
      explanation: "Once `left >= right`, all pairs have been checked!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 3,
    matchKeywords: ["parentheses", "brackets", "lifo", "stack", "valid"],
    realWorldUse:
      "Compilers, JSON parsers, and IDE linters validate deeply nested syntax blocks in a single linear pass using a LIFO stack.",
    analogyTitle: "Matching Russian Nesting Dolls",
    analogyText:
      "Every closing bracket `)`, `}`, `]` must match the most recently opened bracket sitting on top of the stack.",
    cheatSheet: `stack = []
pairs = {")": "(", "}": "{", "]": "["}
for ch in s:
    if ch in pairs:
        if not stack or stack[-1] != pairs[ch]:
            return False
        stack.pop()
    else:
        stack.append(ch)
return len(stack) == 0`,
    commonPitfall: {
      title: "Popping from an empty stack or returning True with unclosed openers",
      wrongCode: "if ch in pairs:\n    if stack.pop() != pairs[ch]: return False",
      rightCode: "if ch in pairs:\n    if not stack or stack[-1] != pairs[ch]: return False\n    stack.pop()",
      explanation:
        "Calling `stack.pop()` when `stack` is empty raises `IndexError` on inputs starting with `]` or `)`. Also check `len(stack) == 0` at the end.",
    },
    guidedCode: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {")": "(", "}": "{", "]": "["}
        for ch in s:
            # 👉 Match closing brackets against pairs[ch], otherwise push onto stack:
            if ch in pairs:
                if not stack or stack[-1] != pairs[ch]:
                    return False
                stack.pop()
            else:
                stack.append(ch)
        return len(stack) == 0`,
    solutionCode: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {")": "(", "}": "{", "]": "["}
        for ch in s:
            if ch in pairs:
                if not stack or stack[-1] != pairs[ch]:
                    return False
                stack.pop()
            else:
                stack.append(ch)
        return len(stack) == 0`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "A dictionary lookup + stack validates arbitrary nesting in one pass, avoiding repeated string `.replace('()', '')` scans which degrade to O(n^2).",
      followUp:
        "What if the input only has one bracket type (`(` and `)`)? You can replace the stack array with a single integer counter for O(1) space.",
    },
    quiz: {
      question: "What happens if `stack` still contains `'('` after the loop finishes?",
      options: [
        "`len(stack) == 0` is `False` because an opening bracket was never closed",
        "The string is valid anyway",
        "Python pops it automatically",
      ],
      correctIndex: 0,
      explanation:
        "An unclosed bracket means the expression is invalid, so `len(stack) == 0` safely returns `False`.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 4,
    matchKeywords: ["binary search", "search", "sorted", "log n"],
    realWorldUse:
      "Databases (B-Trees), `git bisect`, and sorted time-series logs locate targets across millions of records in ~20 comparisons.",
    analogyTitle: "Guessing a Number by Halving",
    analogyText:
      "Check the middle page. If the target is bigger, discard the entire left half (`low = mid + 1`); if smaller, discard the right half (`high = mid - 1`).",
    cheatSheet: `low, high = 0, len(nums) - 1
while low <= high:
    mid = (low + high) // 2
    if nums[mid] == target:
        return mid
    elif nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
return -1`,
    commonPitfall: {
      title: "Using while low < high instead of low <= high or forgetting +/- 1",
      wrongCode: "while low < high:\n    low = mid  # Can infinite-loop on 2 elements!",
      rightCode: "while low <= high:\n    if nums[mid] < target: low = mid + 1\n    else: high = mid - 1",
      explanation:
        "Advancing past `mid` (`mid + 1` / `mid - 1`) guarantees the window strictly shrinks every iteration and checks 1-element ranges via `low <= high`.",
    },
    guidedCode: `class Solution:
    def search(self, nums: list, target: int) -> int:
        low, high = 0, len(nums) - 1
        while low <= high:
            # 👉 Compute mid, return if found, else shrink low or high:
            mid = (low + high) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        return -1`,
    solutionCode: `class Solution:
    def search(self, nums: list, target: int) -> int:
        low, high = 0, len(nums) - 1
        while low <= high:
            mid = (low + high) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        return -1`,
    proInsights: {
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Iterative binary search runs in constant O(1) stack space and eliminates half the remaining array on every comparison, versus O(n) linear scan.",
      followUp:
        "How would you modify `if nums[mid] == target` to find the *first* (leftmost) occurrence when duplicates exist?",
    },
    quiz: {
      question: "How many comparisons does binary search need at most for 1,000,000 sorted elements?",
      options: ["Around 20 steps (log2 of 1,000,000)", "500,000 steps", "1,000 steps"],
      correctIndex: 0,
      explanation: "`2^20 = 1,048,576`, so halving 20 times narrows down a million items!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 6,
    matchKeywords: ["frequency", "count", "most", "active", "tally"],
    realWorldUse: "Used by Spotify Wrapped to tally your most-played artist.",
    analogyTitle: "Tally Marks in a Dictionary",
    analogyText:
      "For each item, add `1` to its count in a dictionary: `counts[item] = counts.get(item, 0) + 1`.",
    cheatSheet: `counts = {}
for item in items:
    counts[item] = counts.get(item, 0) + 1`,
    guidedCode: `def count_messages(users):
    counts = {}
    for u in users:
        # 👉 Increment count using counts.get(u, 0) + 1:
        counts[u] = counts.get(u, 0) + 1
    return counts

print(count_messages(["alex", "sam", "alex", "mia", "alex"]))`,
    solutionCode: `def count_messages(users):
    counts = {}
    for u in users:
        counts[u] = counts.get(u, 0) + 1
    return counts

print(count_messages(["alex", "sam", "alex", "mia", "alex"]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k) unique keys",
      tradeoff:
        "A single hash-map tally avoids O(n^2) repeated `.count()` scans over the list.",
      followUp:
        "In production Python, `collections.Counter(users)` implements this same C-optimized tally.",
    },
    quiz: {
      question:
        'What does `counts.get("alex", 0)` return the first time `"alex"` is seen?',
      options: ["0", "Error", "100"],
      correctIndex: 0,
      explanation:
        "It returns the default value `0` when the key isn't in the dictionary yet!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 7,
    matchKeywords: ["sliding", "window", "subarray", "consecutive", "spike"],
    realWorldUse:
      "Used in fitness apps to find your best 3-day streak of steps.",
    analogyTitle: "Sliding a Window Across a List",
    analogyText:
      "As your window moves 1 step right, add the new number entering on the right and subtract the old number leaving on the left!",
    cheatSheet: `window_sum = sum(nums[:k])
best = window_sum
for i in range(k, len(nums)):
    window_sum += nums[i] - nums[i - k]
    best = max(best, window_sum)`,
    guidedCode: `def max_window_sum(visitors, k):
    window_sum = sum(visitors[:k])
    best = window_sum
    for i in range(k, len(visitors)):
        # 👉 Add entering visitors[i], subtract leaving visitors[i - k]:
        window_sum += visitors[i] - visitors[i - k]
        best = max(best, window_sum)
    return best

print(max_window_sum([10, 40, 30, 50, 20], 3))`,
    solutionCode: `def max_window_sum(visitors, k):
    window_sum = sum(visitors[:k])
    best = window_sum
    for i in range(k, len(visitors)):
        window_sum += visitors[i] - visitors[i - k]
        best = max(best, window_sum)
    return best

print(max_window_sum([10, 40, 30, 50, 20], 3))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Updating the running sum in O(1) per slide avoids recomputing `sum(visitors[i-k+1:i+1])` (`O(n * k)` total).",
      followUp:
        "What if `k` wasn't fixed and you needed the shortest subarray with sum >= target? Switch to a dynamic variable-width window.",
    },
    quiz: {
      question:
        "How do we update a sliding window sum when moving 1 step right?",
      options: [
        "Add the new right number and subtract the old left number",
        "Delete the list",
        "Multiply by 0",
      ],
      correctIndex: 0,
      explanation:
        "Adding the entering value and subtracting the leaving value updates the sum in 1 step!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 8,
    matchKeywords: ["stack", "bracket", "valid", "parentheses", "lifo"],
    realWorldUse:
      "Used by code editors to check that every opening `(` has a matching closing `)`.",
    analogyTitle: "A Stack of Plates",
    analogyText:
      "Push `(` onto `stack` with `.append()`, and pop it off with `.pop()` when you see `)`!",
    cheatSheet: `stack = []
for ch in text:
    if ch == "(":
        stack.append(ch)
    elif ch == ")":
        if not stack:
            return False
        stack.pop()
return len(stack) == 0`,
    guidedCode: `def is_balanced(code_str):
    stack = []
    for ch in code_str:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            # 👉 Return False if stack is empty, otherwise pop:
            if not stack:
                return False
            stack.pop()
    return len(stack) == 0

print(is_balanced("(())"))
print(is_balanced("(()"))`,
    solutionCode: `def is_balanced(code_str):
    stack = []
    for ch in code_str:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if not stack:
                return False
            stack.pop()
    return len(stack) == 0

print(is_balanced("(())"))
print(is_balanced("(()"))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "A stack cleanly extends to multiple bracket pairs (`()[]{}`); for a single pair `( )`, a depth integer gives O(1) space.",
      followUp:
        "How would you return the minimum number of parentheses to add so any invalid string becomes balanced?",
    },
    quiz: {
      question: "Which list method removes the top (last) item from a stack?",
      options: ["stack.pop()", "stack.append()", "stack.clear()"],
      correctIndex: 0,
      explanation:
        "`stack.pop()` removes and returns the most recently added item!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 9,
    matchKeywords: ["minimum", "cheapest", "lowest", "flight", "min"],
    realWorldUse:
      "Used by Skyscanner, Google Flights, and Uber to instantly highlight the cheapest option.",
    analogyTitle: "Remembering the Lowest Price Tag Seen So Far",
    analogyText:
      "How do you find the smallest number in a list? Python's built-in **`min(prices)`** scans the list in $O(n)$ time and hands you the lowest number immediately!",
    cheatSheet: `prices = [250, 180, 310, 145, 290]

# Find the lowest number in one line:
cheapest = min(prices)
print(cheapest)  # 145`,
    commonPitfall: {
      title: "Using max() instead of min() when looking for the lowest value",
      wrongCode: "return max(prices)  # Returns the most expensive!",
      rightCode: "return min(prices)  # Returns the cheapest!",
      explanation:
        "`min()` finds the minimum (smallest) value; `max()` finds the maximum (largest) value.",
    },
    guidedCode: `def find_cheapest_flight(prices):
    # 👉 Return the smallest price in the list using min(prices):
    return min(prices)

print(find_cheapest_flight([320, 195, 240, 160, 410]))`,
    solutionCode: `def find_cheapest_flight(prices):
    return min(prices)

print(find_cheapest_flight([320, 195, 240, 160, 410]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "A single linear scan beats sorting (`O(n log n)`) whenever you only need the minimum element.",
      followUp:
        "If `prices` could be empty, pass `min(prices, default=None)` to guard against `ValueError`.",
    },
    quiz: {
      question: "What does `min([40, 12, 85, 29])` return?",
      options: ["12", "85", "40"],
      correctIndex: 0,
      explanation: "`12` is the smallest number in the list!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 10,
    matchKeywords: ["middle", "midpoint", "center", "binary"],
    realWorldUse:
      "The core step of Binary Search: jumping straight to the middle element of a sorted list.",
    analogyTitle: "Opening a Book Right to the Middle Page",
    analogyText:
      "To find the middle index of any list, divide its length by 2 using **integer division (`//`)**: `mid = len(items) // 2`, then grab `items[mid]`!",
    cheatSheet: `items = [10, 20, 30, 40, 50]

# 1. Find the middle index with // 2
mid = len(items) // 2   # 5 // 2 = 2

# 2. Read the value at that index
print(items[mid])       # 30`,
    commonPitfall: {
      title:
        "Using single '/' (decimal division) instead of '//' (whole number division)",
      wrongCode: "mid = len(items) / 2   # Gives 2.5 -> TypeError!",
      rightCode: "mid = len(items) // 2  # Gives whole integer 2!",
      explanation:
        "List positions must be whole numbers (`0, 1, 2...`), so always use double slash `//`!",
    },
    guidedCode: `def get_middle_item(items):
    mid = len(items) // 2
    # 👉 Return the element at index 'mid':
    return items[mid]

print(get_middle_item([10, 25, 42, 70, 99]))`,
    solutionCode: `def get_middle_item(items):
    mid = len(items) // 2
    return items[mid]

print(get_middle_item([10, 25, 42, 70, 99]))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Python lists support random-access indexing in constant O(1) time, making binary midpoint probes instant.",
      followUp:
        "In overflow-prone languages (C++/Java), write `low + (high - low) // 2` instead of `(low + high) // 2`.",
    },
    quiz: {
      question:
        "Why do we use `// 2` instead of `/ 2` when computing a list index?",
      options: [
        "Because list indices must be whole integers, not decimals like 2.5",
        "Because `/` is a comment in Python",
        "Because `//` multiplies by 2",
      ],
      correctIndex: 0,
      explanation:
        "`//` is floor division, which always gives a clean whole integer you can use inside `items[mid]`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 11,
    matchKeywords: ["mutual", "common", "intersection", "friends"],
    realWorldUse:
      "Used by Instagram, LinkedIn, and Discord to show 'Mutual Friends' between two profiles.",
    analogyTitle: "Finding Names That Appear on Both Lists",
    analogyText:
      "To find items that exist in **both** `list_a` and `list_b`, loop through `list_a` and keep any item where **`item in list_b`** is True!",
    cheatSheet: `alice_friends = ["Sam", "Mia", "Leo"]
bob_friends = ["Mia", "Zoe", "Sam"]

# Keep friends from alice_friends who are also in bob_friends:
mutual = [f for f in alice_friends if f in bob_friends]
print(mutual)  # ['Sam', 'Mia']`,
    commonPitfall: {
      title: "Combining both lists with '+' instead of checking 'if f in list_b'",
      wrongCode: "return alice_friends + bob_friends  # Combines everyone!",
      rightCode: "return [f for f in alice_friends if f in bob_friends]",
      explanation:
        "`if f in bob_friends` checks that the friend appears in BOTH lists!",
    },
    guidedCode: `def find_mutual_friends(friends_a, friends_b):
    # 👉 Keep each friend 'f' in friends_a if 'f in friends_b':
    return [f for f in friends_a if f in friends_b]

print(find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"]))`,
    solutionCode: `def find_mutual_friends(friends_a, friends_b):
    b_lookup = set(friends_b)
    return [f for f in friends_a if f in b_lookup]

print(find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"]))`,
    proInsights: {
      timeComplexity: "O(n + m)",
      spaceComplexity: "O(m)",
      tradeoff:
        "Converting `friends_b` to a `set` turns membership checks from O(m) list scans into O(1) lookups, keeping order while scaling from O(n*m) to O(n + m).",
      followUp:
        "If `friends_a` might contain duplicates you only want once, track already-emitted matches in a second `seen` set.",
    },
    quiz: {
      question: 'What does `"Mia" in ["Mia", "Zoe"]` evaluate to?',
      options: ["True", "False", '"Mia"'],
      correctIndex: 0,
      explanation:
        "The `in` keyword checks if an item exists inside a collection and returns `True` or `False`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 12,
    matchKeywords: ["running", "prefix", "cumulative", "steps", "total"],
    realWorldUse:
      "Used in banking apps to show your running balance after each transaction, and in fitness step trackers.",
    analogyTitle: "A Snowball Rolling Downhill (Running Total)",
    analogyText:
      "Keep a variable `total = 0`. As you loop through each number `n`, add it to `total` (`total += n`) and save the new `total` into your `history` list!",
    cheatSheet: `daily = [10, 20, 5]
running = []
total = 0

for n in daily:
    total += n
    running.append(total)

print(running)  # [10, 30, 35]`,
    commonPitfall: {
      title: "Resetting total = 0 inside the loop on every step",
      wrongCode: "for n in daily:\n    total = 0\n    total += n",
      rightCode: "total = 0\nfor n in daily:\n    total += n",
      explanation:
        "Create `total = 0` ONCE before the loop starts so it keeps accumulating!",
    },
    guidedCode: `def running_totals(numbers):
    result = []
    total = 0
    for n in numbers:
        total += n
        # 👉 Append the updated 'total' to 'result':
        result.append(total)
    return result

print(running_totals([10, 20, 15, 5]))`,
    solutionCode: `def running_totals(numbers):
    result = []
    total = 0
    for n in numbers:
        total += n
        result.append(total)
    return result

print(running_totals([10, 20, 15, 5]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Precomputing a prefix-sum array lets any subsequent subarray range sum `sum(i..j)` run in O(1) via `prefix[j] - prefix[i - 1]`.",
      followUp:
        "How do prefix sums combine with a Hash Map to solve 'Subarray Sum Equals K' in O(n)?",
    },
    quiz: {
      question: "What are the running totals of `[5, 10, 2]`?",
      options: ["[5, 15, 17]", "[5, 10, 2]", "[17]"],
      correctIndex: 0,
      explanation:
        "First step is `5`, second is `5 + 10 = 15`, and third is `15 + 2 = 17` -> `[5, 15, 17]`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 13,
    matchKeywords: ["maximum", "highest", "champion", "max", "high score"],
    realWorldUse:
      "Used in arcade games and analytics dashboards to highlight the #1 highest score.",
    analogyTitle: "Finding the Peak with max()",
    analogyText:
      "Just like `min()` finds the lowest number, Python's built-in **`max(scores)`** scans the list in $O(n)$ time and returns the largest number in 1 line!",
    cheatSheet: `scores = [120, 450, 310, 290]

# Find the largest number in one line:
best = max(scores)
print(best)  # 450`,
    commonPitfall: {
      title: "Using min(scores) instead of max(scores)",
      wrongCode: "return min(scores)  # Returns the lowest score!",
      rightCode: "return max(scores)  # Returns the highest score!",
      explanation:
        "`max()` returns the maximum (largest) value in the list.",
    },
    guidedCode: `def find_high_score(scores):
    # 👉 Return the largest number in scores using max(scores):
    return max(scores)

print(find_high_score([120, 450, 310, 290]))`,
    solutionCode: `def find_high_score(scores):
    return max(scores)

print(find_high_score([120, 450, 310, 290]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Scanning once with `max()` is optimal compared to sorting the whole list first (`O(n log n)`).",
      followUp:
        "For streaming scores that arrive one at a time, maintain `best = max(best, score)` in O(1) memory.",
    },
    quiz: {
      question: "What does `max([15, 99, 42])` return?",
      options: ["99", "15", "42"],
      correctIndex: 0,
      explanation: "`99` is the largest number in `[15, 99, 42]`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 14,
    matchKeywords: ["reverse", "descending", "rank", "leaderboard", "sorted"],
    realWorldUse:
      "Used in game leaderboards and search results to rank the highest scores first.",
    analogyTitle: "Sorting Highest-to-Lowest with reverse=True",
    analogyText:
      "`sorted(scores)` normally sorts from smallest to largest. Adding **`reverse=True`** (`sorted(scores, reverse=True)`) flips the order from **largest to smallest**!",
    cheatSheet: `scores = [40, 95, 70]

# Sort from highest to lowest:
ranked = sorted(scores, reverse=True)
print(ranked)  # [95, 70, 40]`,
    commonPitfall: {
      title: "Using sorted(scores) without reverse=True",
      wrongCode: "return sorted(scores)               # Lowest first: [40, 70, 95]",
      rightCode: "return sorted(scores, reverse=True) # Highest first: [95, 70, 40]!",
      explanation:
        "`reverse=True` tells `sorted()` to put the biggest numbers at the front.",
    },
    guidedCode: `def rank_leaderboard(scores):
    # 👉 Sort scores from highest to lowest using sorted(scores, reverse=True):
    return sorted(scores, reverse=True)

print(rank_leaderboard([40, 95, 70, 85]))`,
    solutionCode: `def rank_leaderboard(scores):
    return sorted(scores, reverse=True)

print(rank_leaderboard([40, 95, 70, 85]))`,
    proInsights: {
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "`sorted(..., reverse=True)` preserves the original input list untouched; use `scores.sort(reverse=True)` only when in-place mutation is desired.",
      followUp:
        "If you only ever need the top 3 podium scores out of 1,000,000, `heapq.nlargest(3, scores)` runs in O(n log 3).",
    },
    quiz: {
      question: "What does `sorted([10, 30, 20], reverse=True)` return?",
      options: ["[30, 20, 10]", "[10, 20, 30]", "[10, 30, 20]"],
      correctIndex: 0,
      explanation:
        "`reverse=True` sorts the numbers in descending order from largest to smallest!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 15,
    matchKeywords: ["even", "modulo", "team", "parity", "divisible"],
    realWorldUse:
      "Used in multiplayer games to split player IDs into two balanced teams (even IDs vs. odd IDs).",
    analogyTitle: "Checking Even Numbers with % 2 == 0",
    analogyText:
      "When you divide an even number by `2`, the remainder is `0` (**`n % 2 == 0`**). We can keep only even numbers in 1 line: `[n for n in nums if n % 2 == 0]`!",
    cheatSheet: `nums = [1, 2, 3, 4, 5, 6]

# Keep only numbers where remainder of / 2 is 0:
evens = [n for n in nums if n % 2 == 0]
print(evens)  # [2, 4, 6]`,
    commonPitfall: {
      title: "Checking n % 2 == 1 (which keeps odd numbers instead of even)",
      wrongCode: "return [n for n in nums if n % 2 == 1]  # Odd numbers!",
      rightCode: "return [n for n in nums if n % 2 == 0]  # Even numbers!",
      explanation:
        "Even numbers divide cleanly by 2 with a remainder of `0` (`n % 2 == 0`).",
    },
    guidedCode: `def get_even_ids(nums):
    # 👉 Return a list of even numbers using [n for n in nums if n % 2 == 0]:
    return [n for n in nums if n % 2 == 0]

print(get_even_ids([10, 15, 22, 33, 40]))`,
    solutionCode: `def get_even_ids(nums):
    return [n for n in nums if n % 2 == 0]

print(get_even_ids([10, 15, 22, 33, 40]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k) matching items",
      tradeoff:
        "A single-pass list comprehension avoids quadratic pop/remove shifts when deleting odd elements from a list in place.",
      followUp:
        "For huge datasets where you iterate lazily once, swap `[...]` for a generator expression `(...)` to achieve O(1) memory.",
    },
    quiz: {
      question: "What does `8 % 2 == 0` evaluate to?",
      options: ["True (because 8 is an even number)", "False", "4"],
      correctIndex: 0,
      explanation: "8 divided by 2 has a remainder of 0, so `8 % 2 == 0` is `True`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 16,
    matchKeywords: ["membership", "vip", "exists", "contains", "early exit"],
    realWorldUse:
      "Used in ticket scanners at concerts to check if a guest's badge name is on the VIP list.",
    analogyTitle: "Instant Membership Check with the 'in' Keyword",
    analogyText:
      "Want to check if `name` is inside `vip_list`? Write **`return name in vip_list`** — Python scans until it finds a match and immediately returns `True` (or `False` if not found)!",
    cheatSheet: `vips = ["Aria", "Kai", "Nova"]

# Check if "Kai" is in the list:
print("Kai" in vips)  # True
print("Leo" in vips)  # False`,
    commonPitfall: {
      title: "Returning the list instead of checking 'name in vip_list'",
      wrongCode: "return vip_list",
      rightCode: "return name in vip_list",
      explanation:
        "`name in vip_list` returns a boolean (`True` or `False`).",
    },
    guidedCode: `def has_vip_pass(vip_list, name):
    # 👉 Return True if name is in vip_list using 'name in vip_list':
    return name in vip_list

print(has_vip_pass(["Aria", "Kai", "Nova"], "Kai"), has_vip_pass(["Aria", "Kai"], "Leo"))`,
    solutionCode: `def has_vip_pass(vip_list, name):
    return name in vip_list

print(has_vip_pass(["Aria", "Kai", "Nova"], "Kai"), has_vip_pass(["Aria", "Kai"], "Leo"))`,
    proInsights: {
      timeComplexity: "O(n) on list / O(1) on set",
      spaceComplexity: "O(1)",
      tradeoff:
        "On a small list, `name in vip_list` short-circuits on the first match. For repeated lookups across thousands of VIPs, convert `vip_list` to a `set` once.",
      followUp:
        "What happens if `vip_list` is sorted? Binary search drops single-query lookup from O(n) to O(log n) without extra memory.",
    },
    quiz: {
      question: 'What does `"Kai" in ["Aria", "Kai"]` return?',
      options: ["True", "False", "1"],
      correctIndex: 0,
      explanation: 'Since `"Kai"` is inside the list, `in` returns `True`!',
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 17,
    matchKeywords: ["palindrome", "reverse", "word"],
    realWorldUse:
      "Used in DNA sequence matching, text processing, and classic coding interviews to test string reversal.",
    analogyTitle: "Mirror-Image Words with [::-1]",
    analogyText:
      'In Python, **`word[::-1]`** reads a string from right to left (backwards). If `word == word[::-1]`, the word is a palindrome!',
    cheatSheet: `word = "level"
reversed_word = word[::-1]  # "level"

print(word == reversed_word)  # True`,
    commonPitfall: {
      title: "Writing word[:-1] (drops last letter) instead of word[::-1] (reverses)",
      wrongCode: "return word == word[:-1]   # Only one colon!",
      rightCode: "return word == word[::-1]  # Two colons [::-1] reverses!",
      explanation:
        "Make sure to include TWO colons inside `[::-1]` so Python steps backwards through the whole word.",
    },
    guidedCode: `def is_palindrome(word):
    # 👉 Compare word to its reversed slice word[::-1]:
    return word == word[::-1]

print(is_palindrome("level"), is_palindrome("code"))`,
    solutionCode: `def is_palindrome(word):
    return word == word[::-1]

print(is_palindrome("level"), is_palindrome("code"))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Slice reversal `word[::-1]` is fast in CPython and super readable; switch to two inward pointers (`left`, `right`) if an interviewer asks for strict O(1) extra memory.",
      followUp:
        "How would you handle case-insensitive palindromes with spaces or punctuation?",
    },
    quiz: {
      question: 'What does `"abc"[::-1]` produce in Python?',
      options: ['"cba"', '"ab"', '"abc"'],
      correctIndex: 0,
      explanation: "`[::-1]` reverses the string from end to start!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 18,
    matchKeywords: ["unique", "duplicate", "username"],
    realWorldUse:
      "Used in signup forms and database imports to quickly verify that no two users share the same username.",
    analogyTitle: "Comparing List Length vs. Set Length",
    analogyText:
      "A `set` automatically deletes duplicates. So if **`len(names) == len(set(names))`**, no duplicates were deleted—meaning every item was unique!",
    cheatSheet: `names = ["aria", "kai"]
is_unique = len(names) == len(set(names))
print(is_unique)  # True`,
    commonPitfall: {
      title: "Comparing names == set(names) directly instead of their lengths",
      wrongCode: "return names == set(names)  # Always False (list != set)!",
      rightCode: "return len(names) == len(set(names))  # Compares counts!",
      explanation:
        "A list and a set are different types, so compare their sizes using `len(names) == len(set(names))`.",
    },
    guidedCode: `def all_unique(names):
    # 👉 Compare len(names) to len(set(names)):
    return len(names) == len(set(names))

print(all_unique(["aria", "kai"]), all_unique(["aria", "aria"]))`,
    solutionCode: `def all_unique(names):
    return len(names) == len(set(names))

print(all_unique(["aria", "kai"]), all_unique(["aria", "aria"]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "`len(set(names))` is concise and O(n) via hashing; if inputs are huge and duplicates appear early, looping with a `seen = set()` lets you exit on the first duplicate.",
      followUp:
        "How would you solve 'Contains Duplicate' if extra hash-set memory was forbidden? Sort in O(n log n) and compare neighbors.",
    },
    quiz: {
      question: 'If `items = ["a", "a", "b"]`, what is `len(set(items))`?',
      options: ["2", "3", "1"],
      correctIndex: 0,
      explanation:
        '`set(items)` keeps only `{"a", "b"}`, so its length is `2`!',
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 19,
    matchKeywords: ["abs", "absolute", "temperature", "swing", "distance"],
    realWorldUse:
      "Used in weather apps, GPS distance calculators, and game physics where distance is always a positive number.",
    analogyTitle: "Always-Positive Distance with abs()",
    analogyText:
      "Whether you walk from mile 5 to mile 15 or from mile 15 to mile 5, you walked `10` miles. **`abs(a - b)`** turns negative numbers positive!",
    cheatSheet: `print(abs(15 - 25))  # 10
print(abs(25 - 15))  # 10`,
    commonPitfall: {
      title: "Subtracting a - b without wrapping it in abs()",
      wrongCode: "return a - b       # Returns -10 when b is bigger!",
      rightCode: "return abs(a - b)  # Always returns positive +10!",
      explanation:
        "`abs()` strips away any negative sign so the distance is always positive.",
    },
    guidedCode: `def temp_swing(a, b):
    # 👉 Return the positive difference using abs(a - b):
    return abs(a - b)

print(temp_swing(15, 25))`,
    solutionCode: `def temp_swing(a, b):
    return abs(a - b)

print(temp_swing(15, 25))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "`abs(a - b)` computes symmetric distance cleanly without branching (`if a > b else b - a`).",
      followUp:
        "In 2D grid/BFS problems, Manhattan distance generalizes this directly to `abs(x1 - x2) + abs(y1 - y2)`.",
    },
    quiz: {
      question: "What does `abs(-42)` return?",
      options: ["42", "-42", "0"],
      correctIndex: 0,
      explanation:
        "`abs()` returns the non-negative magnitude of a number (`42`)!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 20,
    matchKeywords: ["zip", "scoreboard", "pair"],
    realWorldUse:
      "Used to combine spreadsheet columns (like a column of student names and a column of grades) into a lookup dictionary.",
    analogyTitle: "Zipping Two Lists Together with dict(zip(...))",
    analogyText:
      "Just like zipping up a jacket, **`zip(names, scores)`** pairs item 0 with item 0, item 1 with item 1, and **`dict(...)`** turns them into a dictionary!",
    cheatSheet: `names = ["Aria", "Kai"]
scores = [100, 85]

board = dict(zip(names, scores))
print(board)  # {'Aria': 100, 'Kai': 85}`,
    commonPitfall: {
      title: "Returning zip(names, scores) without wrapping it in dict(...)",
      wrongCode: "return zip(names, scores)        # Returns a <zip object>!",
      rightCode: "return dict(zip(names, scores))  # Returns a clean dictionary!",
      explanation:
        "`zip()` creates a lazy iterator; wrapping it in `dict(...)` builds the actual dictionary.",
    },
    guidedCode: `def build_scoreboard(names, scores):
    # 👉 Pair names and scores into a dictionary with dict(zip(names, scores)):
    return dict(zip(names, scores))

print(build_scoreboard(["Aria", "Kai"], [100, 85]))`,
    solutionCode: `def build_scoreboard(names, scores):
    return dict(zip(names, scores))

print(build_scoreboard(["Aria", "Kai"], [100, 85]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "`dict(zip(...))` builds the lookup table in C speed without index loops (`range(len(names))`); note `zip()` stops at the shorter list if lengths differ.",
      followUp:
        "Use `zip(names, scores, strict=True)` in Python 3.10+ if mismatched list lengths should raise a `ValueError` instead of silently truncating.",
    },
    quiz: {
      question: 'What does `dict(zip(["a", "b"], [1, 2]))` return?',
      options: [
        "{'a': 1, 'b': 2}",
        "['a', 'b', 1, 2]",
        "{1: 'a', 2: 'b'}",
      ],
      correctIndex: 0,
      explanation:
        "The first list becomes the keys and the second list becomes the values!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 21,
    matchKeywords: ["buy & sell stock", "max_profit", "profit"],
    realWorldUse:
      "Algorithmic trading backtesters, crypto arbitrage scanners, and dynamic pricing engines track running historical lows to find maximum single-pass gains in O(n) time.",
    analogyTitle: "Single-Pass Time Machine",
    analogyText:
      "As you walk through prices day by day, you only need to remember the cheapest day you already walked past and check what selling today would earn.",
    cheatSheet: `min_price = float("inf")
best = 0
for p in prices:
    min_price = min(min_price, p)
    best = max(best, p - min_price)`,
    commonPitfall: {
      title: "Subtracting global min from global max",
      wrongCode: "return max(prices) - min(prices)  # Ignores day order!",
      rightCode: "min_p = min(min_p, p)\nbest = max(best, p - min_p)",
      explanation:
        "You cannot buy on Thursday and sell on Monday; tracking the running minimum enforces chronological order in O(n) time.",
    },
    guidedCode: `def max_profit(prices):
    min_price = float("inf")
    best = 0
    for price in prices:
        # 👉 Update min_price, then check if price - min_price beats best:
        min_price = min(min_price, price)
        best = max(best, price - min_price)
    return best

print(max_profit([7, 1, 5, 3, 6, 4]))`,
    solutionCode: `def max_profit(prices):
    min_price = float("inf")
    best = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > best:
            best = price - min_price
    return best

print(max_profit([7, 1, 5, 3, 6, 4]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Tracking only the running minimum price avoids an O(n^2) all-pairs check and requires zero auxiliary arrays.",
      followUp:
        "If unlimited buy/sell transactions were allowed (Buy & Sell Stock II), sum every positive daily gain `max(0, prices[i] - prices[i - 1])`.",
    },
    quiz: {
      question: "What is the time and space complexity of tracking `min_price` in a single loop?",
      options: [
        "O(n) time and O(1) space",
        "O(n^2) time and O(1) space",
        "O(n log n) time and O(n) space",
      ],
      correctIndex: 0,
      explanation:
        "A single pass visits each day once (`O(n)`) while storing only two scalar variables (`O(1)`).",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 22,
    matchKeywords: ["group anagrams", "anagram", "sorted"],
    realWorldUse:
      "Search engines, spell-checkers, and spam filters normalize tokens into canonical signatures so scrambled variants map to the exact same bucket in O(1) lookup time.",
    analogyTitle: "Canonical Mailboxes",
    analogyText:
      "Sorting the letters of 'eat', 'tea', and 'ate' produces the exact same stamp ('aet'), so all three letters drop into the same mailbox.",
    cheatSheet: `groups = {}
for w in words:
    sig = "".join(sorted(w))
    groups.setdefault(sig, []).append(w)`,
    commonPitfall: {
      title: "Using sorted(word) directly as a dict key",
      wrongCode: "groups[sorted(word)].append(word)  # TypeError: unhashable list!",
      rightCode: 'sig = "".join(sorted(word))\ngroups.setdefault(sig, []).append(word)',
      explanation:
        "`sorted(word)` returns a mutable Python list, which cannot be hashed as a dictionary key; joining into a string makes it hashable.",
    },
    guidedCode: `def group_anagrams(words):
    groups = {}
    for w in words:
        # 👉 Use ''.join(sorted(w)) as a hashable key:
        sig = "".join(sorted(w))
        groups.setdefault(sig, []).append(w)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))`,
    solutionCode: `def group_anagrams(words):
    groups = {}
    for word in words:
        signature = "".join(sorted(word))
        if signature not in groups:
            groups[signature] = []
        groups[signature].append(word)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))`,
    proInsights: {
      timeComplexity: "O(n * k log k)",
      spaceComplexity: "O(n * k)",
      tradeoff:
        "Sorting each k-letter word is simple and fast for short strings; for very long words over lowercase a–z, a 26-int frequency tuple key improves runtime to O(n * k).",
      followUp:
        "How would you adapt the signature key to handle Unicode or case-insensitive grouping?",
    },
    quiz: {
      question: "Why must we convert `sorted(word)` with `''.join(...)` before using it as a dict key?",
      options: [
        "`sorted()` returns a mutable list, which cannot be hashed as a dict key",
        "`sorted()` mutates the original string in place",
        "`''.join()` removes duplicate letters from the word",
      ],
      correctIndex: 0,
      explanation:
        "Dict keys must be immutable and hashable; strings (or tuples) work, whereas lists raise `TypeError: unhashable type: 'list'`.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 23,
    matchKeywords: ["merge", "intervals", "overlap"],
    realWorldUse:
      "Calendar free/busy schedulers, video timeline editors, and cloud billing windows collapse overlapping time ranges into clean, non-overlapping spans.",
    analogyTitle: "Dominos on a Timeline",
    analogyText:
      "Once intervals are sorted by start time, you only ever compare the next block against the very last merged block in your result list.",
    cheatSheet: `ordered = sorted(intervals, key=lambda x: x[0])
merged = [list(ordered[0])]
for start, end in ordered[1:]:
    if start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)`,
    commonPitfall: {
      title: "Overwriting end time without taking max()",
      wrongCode: "merged[-1][1] = end  # Shrinks [1, 10] when [2, 5] arrives!",
      rightCode: "merged[-1][1] = max(merged[-1][1], end)",
      explanation:
        "If a shorter interval like `[2, 5]` sits completely inside `[1, 10]`, you must keep the larger endpoint `10`.",
    },
    guidedCode: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda x: x[0])
    merged = [list(ordered[0])]
    for start, end in ordered[1:]:
        # 👉 Merge when start <= merged[-1][1], else append [start, end]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))`,
    solutionCode: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda span: span[0])
    merged = [[ordered[0][0], ordered[0][1]]]
    for start, end in ordered[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))`,
    proInsights: {
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Sorting upfront costs O(n log n) once, reducing overlap resolution to a single O(n) pass without mutating the caller's nested lists.",
      followUp:
        "If intervals are already sorted and you only insert one new interval (Insert Interval), you can skip sorting and run in O(n) total.",
    },
    quiz: {
      question: "Why do we sort intervals by `x[0]` before iterating?",
      options: [
        "Sorting guarantees any overlapping interval can only touch the most recent merged interval",
        "Sorting removes all overlapping intervals automatically",
        "Python lists cannot compare two-element sublists unless sorted first",
      ],
      correctIndex: 0,
      explanation:
        "After sorting by start time, any new interval has `start >= previous_start`, so only `merged[-1]` can possibly overlap with it.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 24,
    matchKeywords: ["top k", "frequent", "frequency"],
    realWorldUse:
      "Trending hashtags, real-time API error dashboards, and recommendation engines aggregate event counts and surface the top K heavy hitters.",
    analogyTitle: "Ballot Box + Leaderboard",
    analogyText:
      "First tally every vote into a hash map, then sort the distinct candidates by their vote total descending and slice the top K winners.",
    cheatSheet: `counts = {}
for n in nums:
    counts[n] = counts.get(n, 0) + 1
top_k = sorted(counts.keys(), key=lambda x: (-counts[x], x))[:k]`,
    commonPitfall: {
      title: "Sorting ascending and slicing the least frequent items",
      wrongCode: "return sorted(counts, key=counts.get)[:k]  # Lowest counts!",
      rightCode: "return sorted(counts.keys(), key=lambda x: (-counts[x], x))[:k]",
      explanation:
        "Python sorts ascending by default; negate `-counts[x]` so highest-frequency items land at the front of `[:k]`.",
    },
    guidedCode: `def top_k_frequent(nums, k):
    counts = {}
    for n in nums:
        counts[n] = counts.get(n, 0) + 1
    # 👉 Sort keys by highest frequency first, then slice [:k]:
    ranked = sorted(counts.keys(), key=lambda x: -counts[x])
    return ranked[:k]

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))`,
    solutionCode: `def top_k_frequent(nums, k):
    counts = {}
    for num in nums:
        counts[num] = counts.get(num, 0) + 1
    ranked = sorted(counts.keys(), key=lambda item: (-counts[item], item))
    return ranked[:k]

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))`,
    proInsights: {
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Sorting unique keys is deterministic and clean; a size-k min-heap drops ranking to O(n log k), and Bucket Sort achieves O(n) total.",
      followUp:
        "Can you implement Top K Frequent in strict O(n) time without sorting by indexing buckets by frequency?",
    },
    quiz: {
      question: "What does sorting by `key=lambda x: (-counts[x], x)` achieve?",
      options: [
        "Highest frequency first, breaking ties deterministically by smaller value",
        "Lowest frequency first, breaking ties by larger value",
        "Removes duplicate elements before counting them",
      ],
      correctIndex: 0,
      explanation:
        "Negating `counts[x]` orders larger counts first, while the second tuple element `x` keeps ties deterministic.",
    },
  },
];
