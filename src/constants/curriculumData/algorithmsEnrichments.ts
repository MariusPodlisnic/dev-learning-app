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
    matchKeywords: ["cheapest", "flight", "filtered", "minimum", "sentinel"],
    realWorldUse:
      "Used by Skyscanner, Google Flights, and Uber pricing pipelines to filter out canceled (`None`) or corrupted (`<= 0`) fare quotes before surfacing the best deal.",
    analogyTitle: "Filtered Linear Scan with a Sentinel Floor",
    analogyText:
      "Blindly calling `min(prices)` crashes on `None` or picks corrupted `$0` glitches. Walk the array once with `best = None`, skip invalid fares (`p is None or p <= 0`), and keep the smallest valid fare—returning `-1` if nothing valid remains.",
    cheatSheet: `def find_cheapest_flight(prices):
    best = None
    for p in prices:
        if p is not None and p > 0:
            if best is None or p < best:
                best = p
    return best if best is not None else -1`,
    commonPitfall: {
      title: "Calling min(prices) directly without filtering None or <= 0",
      wrongCode: "return min(prices)  # TypeError on None or returns 0!",
      rightCode:
        "valid = [p for p in prices if p is not None and p > 0]\nreturn min(valid) if valid else -1",
      explanation:
        "Real production feeds contain missing (`None`) and zero/negative sentinel quotes; guard every element and handle the all-invalid `-1` fallback.",
    },
    guidedCode: `def find_cheapest_flight(prices):
    best = None
    for p in prices:
        # 👉 Step 1: Ignore missing (None) or non-positive (<= 0) prices
        if p is not None and p > 0:
            # 👉 Step 2: Update best if this is the first valid price or cheaper
            if best is None or p < best:
                best = p
    # 👉 Step 3: Return best if found, otherwise -1
    return best if best is not None else -1

print(find_cheapest_flight([320, 0, 195, None, 160, 410]))`,
    solutionCode: `def find_cheapest_flight(prices):
    best = None
    for p in prices:
        if p is not None and p > 0:
            if best is None or p < best:
                best = p
    return best if best is not None else -1

print(find_cheapest_flight([320, 0, 195, None, 160, 410]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "A single streaming loop with `best = None` uses O(1) memory, beating a list comprehension `[p for p in ...]` which allocates an extra O(n) list.",
      followUp:
        "How would you return both the cheapest valid fare AND its original index in one pass?",
    },
    quiz: {
      question:
        "Why is `best = None` safer than initializing `best = 999999` or `prices[0]`?",
      options: [
        "Prices can exceed arbitrary caps, `prices` might be empty, or `prices[0]` might be invalid",
        "`None` automatically sorts itself before integers",
        "Python forbids setting variables to `0` inside functions",
      ],
      correctIndex: 0,
      explanation:
        "`best = None` works for any positive scale, empty lists, and lists starting with `None` or `<= 0` values!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 10,
    matchKeywords: ["binary search", "lower bound", "insert", "bisect"],
    realWorldUse:
      "Powering log-timestamp lookups, sorted database B-Tree inserts, and autocomplete prefix boundaries in O(log n) time.",
    analogyTitle: "Lower-Bound Binary Search (`bisect_left`)",
    analogyText:
      "Start with `lo = 0` and `hi = len(nums)` (past the last slot so appending at the end works!). Each step checks `mid = (lo + hi) // 2`: if `nums[mid] < target`, move `lo = mid + 1`; otherwise shrink `hi = mid` so duplicates always resolve to the leftmost slot.",
    cheatSheet: `lo, hi = 0, len(nums)
while lo < hi:
    mid = (lo + hi) // 2
    if nums[mid] < target:
        lo = mid + 1
    else:
        hi = mid
return lo`,
    commonPitfall: {
      title: "Setting hi = len(nums) - 1 or returning early on equality",
      wrongCode:
        "if nums[mid] == target:\n    return mid  # Fails leftmost duplicate rule!",
      rightCode:
        "if nums[mid] < target:\n    lo = mid + 1\nelse:\n    hi = mid",
      explanation:
        "Setting `hi = len(nums)` allows inserting past the end, and shrinking `hi = mid` on `>= target` guarantees the first (leftmost) valid index.",
    },
    guidedCode: `def find_insert_pos(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        # 👉 Step 1: Probe midpoint without decimal indices
        mid = (lo + hi) // 2
        # 👉 Step 2: Discard left half when strictly smaller than target
        if nums[mid] < target:
            lo = mid + 1
        else:
            # 👉 Step 3: Keep mid as candidate to guarantee leftmost slot
            hi = mid
    return lo

print(find_insert_pos([10, 25, 42, 70, 99], 50))`,
    solutionCode: `def find_insert_pos(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

print(find_insert_pos([10, 25, 42, 70, 99], 50))`,
    proInsights: {
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Half-open intervals `[lo, hi)` eliminate messy `+1/-1` boundary bugs and naturally return `len(nums)` when `target` exceeds every element.",
      followUp:
        "Python's standard library implements this exact algorithm in C as `bisect.bisect_left(nums, target)` — how does `bisect_right` differ?",
    },
    quiz: {
      question:
        "In lower-bound binary search on `[1, 3, 3, 5]` with `target = 3`, why do we set `hi = mid` when `nums[mid] == 3`?",
      options: [
        "To keep searching left so we land on the first `3` at index `1`",
        "Because `3` should be deleted from the array",
        "To avoid integer overflow in Python",
      ],
      correctIndex: 0,
      explanation:
        "Shrinking `hi = mid` keeps `mid` in play as a valid answer while probing earlier indices for an earlier duplicate.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 11,
    matchKeywords: ["mutual", "set intersection", "sorted", "friends", "dedup"],
    realWorldUse:
      "Used by Instagram, LinkedIn, and Discord to compute mutual connections across millions of profiles without quadratic slowdowns.",
    analogyTitle: "Hash-Set Intersection `&` + Canonical Sort",
    analogyText:
      "Scanning `list_a` and checking `in list_b` takes O(n * m) time and leaks duplicates. Converting both to sets (`set(a) & set(b)`) runs in O(n + m) linear time and dedupes automatically before `sorted(...)` locks in deterministic output.",
    cheatSheet: `def find_mutual_friends(friends_a, friends_b):
    return sorted(set(friends_a) & set(friends_b))`,
    commonPitfall: {
      title: "Filtering list_a against list_b without deduplicating or hashing",
      wrongCode:
        "return [f for f in friends_a if f in friends_b]  # O(n*m) & keeps duplicates!",
      rightCode:
        "return sorted(set(friends_a) & set(friends_b))  # O(n + m) & deduped!",
      explanation:
        "List membership (`in list`) is O(m) per check and duplicates in `friends_a` would appear twice unless you convert to `set`.",
    },
    guidedCode: `def find_mutual_friends(friends_a, friends_b):
    # 👉 Step 1: Convert both lists to sets and intersect with '&'
    mutual = set(friends_a) & set(friends_b)
    # 👉 Step 2: Return deterministically sorted list
    return sorted(mutual)

print(find_mutual_friends(["Sam", "Mia", "Leo", "Sam"], ["Mia", "Zoe", "Sam"]))`,
    solutionCode: `def find_mutual_friends(friends_a, friends_b):
    return sorted(set(friends_a) & set(friends_b))

print(find_mutual_friends(["Sam", "Mia", "Leo", "Sam"], ["Mia", "Zoe", "Sam"]))`,
    proInsights: {
      timeComplexity: "O(n + m + k log k)",
      spaceComplexity: "O(n + m)",
      tradeoff:
        "Set intersection reduces overlap cost from O(n * m) to O(n + m); sorting only the `k` mutual results (`k log k`) is much cheaper than sorting full friend lists first.",
      followUp:
        "If `friends_a` has 10M entries and `friends_b` has 200 entries, only hash the smaller list into a `set` to minimize RAM usage.",
    },
    quiz: {
      question:
        "Why does `sorted(set(a) & set(b))` outperform `[x for x in a if x in b]` on large friend lists?",
      options: [
        "Set lookups are O(1) average instead of O(m) linear scans, and duplicates are removed automatically",
        "Sets store items in alphabetical order natively without sorting",
        "`&` runs across GPU cores in Python",
      ],
      correctIndex: 0,
      explanation:
        "Hash tables drop overlap detection from O(n * m) to O(n + m) while eliminating duplicates automatically.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 12,
    matchKeywords: ["prefix sum", "range", "queries", "o(1)", "subarray"],
    realWorldUse:
      "Used in financial ledger analytics, time-series dashboards, and image integral-sum filters to answer thousands of range totals in O(1) each.",
    analogyTitle: "Precomputing a Cumulative Ruler (`prefix`)",
    analogyText:
      "Store `prefix = [0]` where `prefix[i]` is the sum of the first `i` items. Then any inclusive slice `[left, right]` equals `prefix[right + 1] - prefix[left]` in constant O(1) time—zero re-looping per query!",
    cheatSheet: `prefix = [0]
for n in numbers:
    prefix.append(prefix[-1] + n)

return [prefix[r + 1] - prefix[l] for l, r in queries]`,
    commonPitfall: {
      title: "Slicing sum(numbers[l:r+1]) inside the query loop (O(n * q))",
      wrongCode:
        "return [sum(numbers[l:r + 1]) for l, r in queries]  # Slow O(n * q)!",
      rightCode:
        "prefix = [0]\nfor n in numbers:\n    prefix.append(prefix[-1] + n)\nreturn [prefix[r + 1] - prefix[l] for l, r in queries]",
      explanation:
        "Calling `sum(numbers[l:r+1])` re-scans the slice for every query; leading `0` in `prefix` cleanly handles `left == 0` without special cases.",
    },
    guidedCode: `def range_sums(numbers, queries):
    # 👉 Step 1: Build prefix sums with a leading 0 sentinel
    prefix = [0]
    for n in numbers:
        prefix.append(prefix[-1] + n)
    # 👉 Step 2: Answer each inclusive [left, right] query in O(1)
    return [prefix[right + 1] - prefix[left] for left, right in queries]

print(range_sums([10, 20, 15, 5], [[0, 2], [1, 3]]))`,
    solutionCode: `def range_sums(numbers, queries):
    prefix = [0]
    for n in numbers:
        prefix.append(prefix[-1] + n)
    return [prefix[right + 1] - prefix[left] for left, right in queries]

print(range_sums([10, 20, 15, 5], [[0, 2], [1, 3]]))`,
    proInsights: {
      timeComplexity: "O(n + q)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Investing O(n) upfront memory turns `q` queries from O(n * q) into O(n + q)—essential whenever arrays are mostly static and reads are frequent.",
      followUp:
        "If array elements are updated dynamically between queries, a Fenwick Tree (Binary Indexed Tree) supports both updates and range queries in O(log n).",
    },
    quiz: {
      question:
        "Why do we start `prefix = [0]` before appending cumulative sums?",
      options: [
        "So `prefix[right + 1] - prefix[0]` works when `left == 0` without needing an `if left == 0` branch",
        "Because Python arrays are 1-indexed by default",
        "To make negative numbers positive",
      ],
      correctIndex: 0,
      explanation:
        "The leading `0` represents the empty prefix before index `0`, unifying `left == 0` and `left > 0` under one formula.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 13,
    matchKeywords: ["runner up", "top two", "second largest", "single pass", "distinct"],
    realWorldUse:
      "Used in auction second-price bidding (Vickrey auctions), tournament brackets, and telemetry peak trackers without sorting.",
    analogyTitle: "Tracking Distinct Gold & Silver Podiums in One Pass",
    analogyText:
      "Hold `first = None` and `second = None`. When a new champion beats `first`, demote the old `first` down to `second`! Otherwise, if it is strictly less than `first` and beats `second`, promote it to `second`—handling duplicates and negative scores cleanly.",
    cheatSheet: `first, second = None, None
for s in scores:
    if first is None or s > first:
        first, second = s, first
    elif s < first and (second is None or s > second):
        second = s
return [first, second]`,
    commonPitfall: {
      title: "Initializing first = 0 or letting duplicate top scores overwrite second",
      wrongCode:
        "first = second = 0  # Breaks when all scores are negative [-10, -3]!",
      rightCode:
        "first = second = None\n# Check `elif s < first and (second is None or s > second):`",
      explanation:
        "Using `None` handles all-negative datasets, and `s < first` skips duplicate top scores like `[450, 450, 310]` so `second` stays `310`.",
    },
    guidedCode: `def find_top_two_scores(scores):
    first, second = None, None
    for s in scores:
        # 👉 Step 1: New distinct highest score shifts old champion to silver
        if first is None or s > first:
            first, second = s, first
        # 👉 Step 2: Distinct runner-up check (ignore ties with first)
        elif s < first and (second is None or s > second):
            second = s
    return [first, second]

print(find_top_two_scores([120, 450, 450, 310, 290]))`,
    solutionCode: `def find_top_two_scores(scores):
    first, second = None, None
    for s in scores:
        if first is None or s > first:
            first, second = s, first
        elif s < first and (second is None or s > second):
            second = s
    return [first, second]

print(find_top_two_scores([120, 450, 450, 310, 290]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Tracking 2 variables beats `sorted(set(scores), reverse=True)[:2]` (`O(n log n)` time, `O(n)` memory) by running in a single linear pass with zero extra allocation.",
      followUp:
        "For general Top-K distinct items (`k > 2`) on massive streams, switch to a size-k min-heap (`heapq`).",
    },
    quiz: {
      question:
        "What does `find_top_two_scores([50, 50, 50])` return when no distinct second value exists?",
      options: ["[50, None]", "[50, 50]", "[None, None]"],
      correctIndex: 0,
      explanation:
        "All items tie with `first = 50`, so `second` stays `None` because `s < first` is never triggered.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 14,
    matchKeywords: ["tie-breaker", "multi-key", "leaderboard", "lambda", "tuple key"],
    realWorldUse:
      "Used in esports rankings, e-commerce search ranking (relevance, price, rating), and SQL multi-column `ORDER BY` clauses.",
    analogyTitle: "Composite Sort Keys: `(-score, time, name)`",
    analogyText:
      "Python compares tuples left to right! Negating numeric score (`-p['score']`) flips higher scores to sort first, while keeping `p['time']` and `p['name']` positive sorts tie-breakers ascending (fastest time, A-Z).",
    cheatSheet: `ranked = sorted(
    players,
    key=lambda p: (-p["score"], p["time"], p["name"])
)
return [p["name"] for p in ranked]`,
    commonPitfall: {
      title: "Using reverse=True globally instead of negating only score",
      wrongCode:
        "sorted(players, key=lambda p: (p['score'], p['time']), reverse=True)  # Slowest time wins ties!",
      rightCode:
        "sorted(players, key=lambda p: (-p['score'], p['time'], p['name']))",
      explanation:
        "`reverse=True` flips every element in the tuple, which accidentally gives higher (slower) completion times priority on ties.",
    },
    guidedCode: `def rank_leaderboard(players):
    # 👉 Step 1: Sort by (-score, time, name) for mixed descending/ascending ties
    ranked = sorted(players, key=lambda p: (-p["score"], p["time"], p["name"]))
    # 👉 Step 2: Project ordered player names
    return [p["name"] for p in ranked]

sample = [
    {"name": "Kai", "score": 95, "time": 40},
    {"name": "Aria", "score": 95, "time": 30},
    {"name": "Leo", "score": 70, "time": 20},
]
print(rank_leaderboard(sample))`,
    solutionCode: `def rank_leaderboard(players):
    ranked = sorted(players, key=lambda p: (-p["score"], p["time"], p["name"]))
    return [p["name"] for p in ranked]

sample = [
    {"name": "Kai", "score": 95, "time": 40},
    {"name": "Aria", "score": 95, "time": 30},
    {"name": "Leo", "score": 70, "time": 20},
]
print(rank_leaderboard(sample))`,
    proInsights: {
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Python's Timsort caches the `key` tuple once per item (Decorate-Sort-Undecorate), avoiding repeated multi-pass sorts while staying guaranteed stable.",
      followUp:
        "How would you sort descending on a string field (where `-string` isn't valid) while sorting another field ascending?",
    },
    quiz: {
      question:
        "Why do we negate `-p['score']` instead of passing `reverse=True` when tie-breaking by fastest `time`?",
      options: [
        "`reverse=True` would also put slower (larger) times and Z-to-A names first",
        "`reverse=True` only works on integers, not dictionaries",
        "`lambda` cannot return tuples when `reverse=True` is passed",
      ],
      correctIndex: 0,
      explanation:
        "Negating `-p['score']` reverses only the score dimension while leaving `time` and `name` ascending!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 15,
    matchKeywords: ["parity", "two pointer", "partition", "in-place", "swap"],
    realWorldUse:
      "Used in memory allocators, quicksort partitioning (Lomuto/Hoare), and packet schedulers to segregate traffic classes in O(1) extra memory.",
    analogyTitle: "Converging Two-Pointer Swap (`left` & `right`)",
    analogyText:
      "Place `left` at index `0` and `right` at `len(nums) - 1`. Advance `left` past valid evens, pull `right` past valid odds, and swap whenever `left` holds an odd while `right` holds an even!",
    cheatSheet: `l, r = 0, len(nums) - 1
while l < r:
    while l < r and nums[l] % 2 == 0:
        l += 1
    while l < r and nums[r] % 2 == 1:
        r -= 1
    if l < r:
        nums[l], nums[r] = nums[r], nums[l]
        l += 1
        r -= 1`,
    commonPitfall: {
      title: "Allocating new lists instead of swapping in-place, or forgetting l < r inside inner loops",
      wrongCode:
        "while nums[l] % 2 == 0:\n    l += 1  # IndexError if all items are even!",
      rightCode:
        "while l < r and nums[l] % 2 == 0:\n    l += 1",
      explanation:
        "Always check `l < r` inside the inner pointer-advancement loops so pointers never cross or index past the array.",
    },
    guidedCode: `def partition_by_parity(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        # 👉 Step 1: Skip numbers already even on the left
        while l < r and nums[l] % 2 == 0:
            l += 1
        # 👉 Step 2: Skip numbers already odd on the right
        while l < r and nums[r] % 2 == 1:
            r -= 1
        # 👉 Step 3: Swap out-of-place pair in-place
        if l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1
            r -= 1
    return nums

res = partition_by_parity([3, 1, 2, 4])
print(all(x % 2 == 0 for x in res[:2]) and all(x % 2 == 1 for x in res[2:]))`,
    solutionCode: `def partition_by_parity(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        while l < r and nums[l] % 2 == 0:
            l += 1
        while l < r and nums[r] % 2 == 1:
            r -= 1
        if l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1
            r -= 1
    return nums

res = partition_by_parity([3, 1, 2, 4])
print(all(x % 2 == 0 for x in res[:2]) and all(x % 2 == 1 for x in res[2:]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Each pointer moves at most `n` total steps inward, giving O(n) runtime and strict O(1) extra space (at the cost of not preserving original relative order).",
      followUp:
        "How would you partition into 3 buckets (negatives, zeros, positives — Dutch National Flag) using 3 pointers in one pass?",
    },
    quiz: {
      question:
        "Why must the inner `while` loops include `l < r` before testing `nums[l] % 2 == 0`?",
      options: [
        "To prevent `l` or `r` from walking past each other or raising `IndexError` on all-even/all-odd arrays",
        "Because Python loops require two conditions",
        "To keep the array sorted in ascending order",
      ],
      correctIndex: 0,
      explanation:
        "Without `l < r`, an all-even array increments `l` right past `len(nums) - 1` and crashes with `IndexError`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 16,
    matchKeywords: ["vip", "gatekeeper", "dedup", "set lookup", "batch"],
    realWorldUse:
      "Used at API auth gateways, concert check-in scanners, and SIEM allowlist filters to verify large arrival streams while keeping order and ignoring duplicate scans.",
    analogyTitle: "O(1) Set Allowlist + Seen-Set Deduplicator",
    analogyText:
      "Convert `vip_list` into `vip_set = set(vip_list)` once so every check is O(1), then keep a second `seen = set()` as you scan `arrivals` so repeat badge taps are ignored without breaking arrival order!",
    cheatSheet: `vip_set = set(vip_list)
seen = set()
accepted = []
for guest in arrivals:
    if guest in vip_set and guest not in seen:
        seen.add(guest)
        accepted.append(guest)
return accepted`,
    commonPitfall: {
      title: "Using set(vip_list) & set(arrivals) directly (destroys arrival order)",
      wrongCode:
        "return list(set(vip_list) & set(arrivals))  # Loses arrival order!",
      rightCode:
        "vip_set, seen, out = set(vip_list), set(), []\nfor g in arrivals:\n    if g in vip_set and g not in seen:\n        seen.add(g); out.append(g)",
      explanation:
        "Intersecting sets scrambles order because Python sets are unordered; iterating `arrivals` with a `seen` guard preserves exact order in O(n + m).",
    },
    guidedCode: `def filter_valid_badges(vip_list, arrivals):
    # 👉 Step 1: Hash vip_list for O(1) membership lookups
    vip_set = set(vip_list)
    seen = set()
    admitted = []
    # 👉 Step 2: Scan arrivals in order, admitting each valid VIP once
    for name in arrivals:
        if name in vip_set and name not in seen:
            seen.add(name)
            admitted.append(name)
    return admitted

print(filter_valid_badges(["Aria", "Kai", "Nova"], ["Leo", "Kai", "Aria", "Kai"]))`,
    solutionCode: `def filter_valid_badges(vip_list, arrivals):
    vip_set = set(vip_list)
    seen = set()
    admitted = []
    for name in arrivals:
        if name in vip_set and name not in seen:
            seen.add(name)
            admitted.append(name)
    return admitted

print(filter_valid_badges(["Aria", "Kai", "Nova"], ["Leo", "Kai", "Aria", "Kai"]))`,
    proInsights: {
      timeComplexity: "O(n + m)",
      spaceComplexity: "O(n + m)",
      tradeoff:
        "Pre-hashing `vip_list` once drops total runtime from O(n * m) down to O(n + m), while `seen` guarantees order-preserving deduplication.",
      followUp:
        "If arrivals must stream forever without holding all past visitors in `seen`, what time-window or Bloom filter strategy replaces unbounded memory?",
    },
    quiz: {
      question:
        "Why don't we simply return `list(set(vip_list) & set(arrivals))` here?",
      options: [
        "Sets are unordered, so `&` loses the first-seen arrival order of guests",
        "Python raises a `TypeError` when intersecting two string sets",
        "Sets cannot store more than 100 strings",
      ],
      correctIndex: 0,
      explanation:
        "Scanning `arrivals` linearly while checking `vip_set` and `seen` preserves deterministic arrival order in O(n + m) time.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 17,
    matchKeywords: ["palindrome", "two pointer", "isalnum", "sanitizer", "o(1)"],
    realWorldUse:
      "Classic interview question testing O(1)-space character normalization, used in fuzzy identifier matching and DNA strand symmetry checks.",
    analogyTitle: "Skipping Punctuation Inward with Two Pointers",
    analogyText:
      "Building a cleaned copy takes O(n) memory. Instead, walk `left` from `0` and `right` from `len(text) - 1`: skip characters where `not text[i].isalnum()`, then compare `.lower()` characters and fail fast on mismatch!",
    cheatSheet: `l, r = 0, len(text) - 1
while l < r:
    while l < r and not text[l].isalnum():
        l += 1
    while l < r and not text[r].isalnum():
        r -= 1
    if text[l].lower() != text[r].lower():
        return False
    l += 1
    r -= 1
return True`,
    commonPitfall: {
      title: "Testing raw text == text[::-1] without skipping spaces/punctuation or case",
      wrongCode:
        'return text == text[::-1]  # Fails on "A man, a plan, a canal: Panama"!',
      rightCode:
        "while l < r:\n    # skip non-alnum, compare .lower()",
      explanation:
        "Real phrases include mixed case, spaces, and punctuation (`.,!:`); skip non-`isalnum()` characters and compare `.lower()` in O(1) extra space.",
    },
    guidedCode: `def is_palindrome(text):
    l, r = 0, len(text) - 1
    while l < r:
        # 👉 Step 1: Advance left pointer past spaces & punctuation
        while l < r and not text[l].isalnum():
            l += 1
        # 👉 Step 2: Pull right pointer past spaces & punctuation
        while l < r and not text[r].isalnum():
            r -= 1
        # 👉 Step 3: Compare normalized characters and return False on mismatch
        if text[l].lower() != text[r].lower():
            return False
        l += 1
        r -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"), is_palindrome("race a car"))`,
    solutionCode: `def is_palindrome(text):
    l, r = 0, len(text) - 1
    while l < r:
        while l < r and not text[l].isalnum():
            l += 1
        while l < r and not text[r].isalnum():
            r -= 1
        if text[l].lower() != text[r].lower():
            return False
        l += 1
        r -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"), is_palindrome("race a car"))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Two inward pointers match `cleaned == cleaned[::-1]` in O(n) speed while cutting extra allocation from O(n) down to O(1).",
      followUp:
        "Valid Palindrome II: how would you check if a string can become a palindrome by deleting AT MOST one character?",
    },
    quiz: {
      question: "What does `\".,!\".isalnum()` evaluate to in Python?",
      options: ["False", "True", "None"],
      correctIndex: 0,
      explanation:
        "`.isalnum()` returns `True` only for letters and digits (`A-Z`, `a-z`, `0-9`), so punctuation and spaces are skipped!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 18,
    matchKeywords: ["duplicate", "early exit", "seen", "first repeat"],
    realWorldUse:
      "Used in event ingestion pipelines (idempotency keys), fraud detectors, and log parsers to pinpoint the exact first duplicate record without scanning the entire backlog.",
    analogyTitle: "Memory Gate with Immediate Early Exit",
    analogyText:
      "Walk through `names` one by one with `seen = set()`. The moment `n in seen`, return `n` immediately—you don't even have to look at the rest of the list! If the loop finishes cleanly, return `None`.",
    cheatSheet: `seen = set()
for name in names:
    if name in seen:
        return name
    seen.add(name)
return None`,
    commonPitfall: {
      title: "Using len(set(names)) != len(names) which throws away WHICH duplicate happened first",
      wrongCode:
        "return len(names) != len(set(names))  # Only returns True/False!",
      rightCode:
        "seen = set()\nfor n in names:\n    if n in seen:\n        return n\n    seen.add(n)",
      explanation:
        "`set(names)` forgets which item repeated first; streaming through `seen` returns the exact first repeated value at the earliest index.",
    },
    guidedCode: `def first_duplicate(names):
    seen = set()
    for n in names:
        # 👉 Step 1: Return immediately if this name was already seen
        if n in seen:
            return n
        # 👉 Step 2: Otherwise record it in O(1)
        seen.add(n)
    return None

print(first_duplicate(["aria", "kai", "mia", "kai", "aria"]), first_duplicate(["aria", "kai"]))`,
    solutionCode: `def first_duplicate(names):
    seen = set()
    for n in names:
        if n in seen:
            return n
        seen.add(n)
    return None

print(first_duplicate(["aria", "kai", "mia", "kai", "aria"]), first_duplicate(["aria", "kai"]))`,
    proInsights: {
      timeComplexity: "O(n) worst-case, O(k) early exit",
      spaceComplexity: "O(n)",
      tradeoff:
        "Short-circuiting on the first collision makes best-case runtime O(1) even on million-item streams whenever duplicates occur near the front.",
      followUp:
        "Why does `['aria', 'kai', 'mia', 'kai', 'aria']` return `'kai'` instead of `'aria'`? Because `'kai'` completes its second appearance at index 3 before `'aria'` repeats at index 4!",
    },
    quiz: {
      question:
        'For `["a", "b", "c", "b", "a"]`, what does `first_duplicate` return?',
      options: ['"b"', '"a"', "None"],
      correctIndex: 0,
      explanation:
        '`"b"` is seen twice by index 3, before `"a"` repeats at index 4!',
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 19,
    matchKeywords: ["closest pair", "minimum difference", "sort", "adjacent"],
    realWorldUse:
      "Used in financial tick anomaly detection, timestamp collision checks, and 1D nearest-neighbor search to beat brute-force O(n^2) pair comparisons.",
    analogyTitle: "Sort Once, Compare Neighbors Only",
    analogyText:
      "Instead of checking all $n^2$ pairs `(i, j)`, sort a copy (`ordered = sorted(nums)`). The two closest numbers in any sorted array MUST sit right next to each other—reducing the work from $O(n^2)$ down to $O(n \\log n)$!",
    cheatSheet: `ordered = sorted(nums)
best = ordered[1] - ordered[0]
for i in range(1, len(ordered) - 1):
    diff = ordered[i + 1] - ordered[i]
    if diff < best:
        best = diff
return best`,
    commonPitfall: {
      title: "Checking all pairs with nested loops O(n^2) or mutating caller's nums in place",
      wrongCode:
        "nums.sort()  # Mutates the caller's original list unexpectedly!",
      rightCode:
        "ordered = sorted(nums)  # Non-mutating copy + single adjacent scan",
      explanation:
        "Using `sorted(nums)` leaves the caller's list intact, and sorting guarantees the closest pair is adjacent in `ordered`.",
    },
    guidedCode: `def min_abs_diff(nums):
    # 👉 Step 1: Sort a copy so closest pairs sit next to each other
    ordered = sorted(nums)
    best = ordered[1] - ordered[0]
    # 👉 Step 2: Scan adjacent neighbors for the smallest gap
    for i in range(1, len(ordered) - 1):
        diff = ordered[i + 1] - ordered[i]
        if diff < best:
            best = diff
    return best

print(min_abs_diff([42, 15, 25, 9]))`,
    solutionCode: `def min_abs_diff(nums):
    ordered = sorted(nums)
    best = ordered[1] - ordered[0]
    for i in range(1, len(ordered) - 1):
        diff = ordered[i + 1] - ordered[i]
        if diff < best:
            best = diff
    return best

print(min_abs_diff([42, 15, 25, 9]))`,
    proInsights: {
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Sorting collapses $n(n-1)/2$ quadratic pair checks into `n - 1` adjacent subtractions; once sorted, `ordered[i+1] - ordered[i]` is already non-negative without `abs()`.",
      followUp:
        "How would you extend this to return ALL pairs `[a, b]` that tie for the minimum absolute difference?",
    },
    quiz: {
      question:
        "After sorting `[42, 15, 25, 9]` into `[9, 15, 25, 42]`, why don't we need to check `42 - 9`?",
      options: [
        "Non-adjacent gaps in a sorted list are always at least as large as the adjacent gaps between them",
        "`42 - 9` would be negative",
        "Python automatically skips pairs further than 1 apart",
      ],
      correctIndex: 0,
      explanation:
        "In sorted order `a <= b <= c`, `c - a` is always greater than or equal to both `b - a` and `c - b`, so the closest pair must be adjacent!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 20,
    matchKeywords: ["inverted index", "group by", "setdefault", "zip", "bucket"],
    realWorldUse:
      "The backbone of search engines (word -> document IDs), RBAC permission resolvers (role -> users), and `GROUP BY` database aggregations.",
    analogyTitle: "Flipping Pairs into Lists with `zip` + `setdefault`",
    analogyText:
      "Using `dict(zip(roles, names))` overwrites previous users whenever a role repeats! Instead, loop `for name, role in zip(names, roles):` and grow a bucket per role via `index.setdefault(role, []).append(name)`.",
    cheatSheet: `index = {}
for name, role in zip(names, roles):
    index.setdefault(role, []).append(name)
return index`,
    commonPitfall: {
      title: "Overwriting keys with index[role] = name or dict(zip(roles, names))",
      wrongCode:
        "return dict(zip(roles, names))  # Overwrites 'Aria' with 'Mia'!",
      rightCode:
        "index = {}\nfor name, role in zip(names, roles):\n    index.setdefault(role, []).append(name)",
      explanation:
        "Multiple users can share the same role (`'admin'`), so each role key must map to a `list` of names instead of a single overwriting string.",
    },
    guidedCode: `def build_role_index(names, roles):
    index = {}
    # 👉 Step 1: Pair each name with its role using zip()
    for name, role in zip(names, roles):
        # 👉 Step 2: Initialize an empty list on first sight and append name
        index.setdefault(role, []).append(name)
    return index

print(build_role_index(["Aria", "Kai", "Mia"], ["admin", "dev", "admin"]))`,
    solutionCode: `def build_role_index(names, roles):
    index = {}
    for name, role in zip(names, roles):
        index.setdefault(role, []).append(name)
    return index

print(build_role_index(["Aria", "Kai", "Mia"], ["admin", "dev", "admin"]))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "`dict.setdefault(key, []).append(val)` works in pure built-in Python without imports and preserves insertion order, whereas `collections.defaultdict(list)` avoids creating unused empty lists on lookups if you convert back to `dict`.",
      followUp:
        "Use `zip(names, roles, strict=True)` in Python 3.10+ when mismatched lengths should raise a `ValueError` instead of silently truncating.",
    },
    quiz: {
      question:
        'What does `index.setdefault("admin", []).append("Mia")` do if `"admin"` already holds `["Aria"]`?',
      options: [
        'Returns the existing list and appends `"Mia"` -> `["Aria", "Mia"]`',
        'Overwrites `"Aria"` with an empty list `[]` first',
        "Raises a `KeyError` because `'admin'` already exists",
      ],
      correctIndex: 0,
      explanation:
        "`setdefault` only inserts `[]` when the key is missing; if it already exists, it returns the existing list so `.append()` adds to it!",
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
