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
    matchKeywords: ["pointer", "palindrome", "reverse", "window", "binary"],
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
    matchOrder: 6,
    matchKeywords: ["frequency", "count", "most", "active", "tally"],
    realWorldUse: "Used by Spotify Wrapped to tally your most-played artist.",
    analogyTitle: "Tally Marks in a Dictionary",
    analogyText:
      "For each item, add `1` to its count in a dictionary: `counts[item] = counts.get(item, 0) + 1`.",
    cheatSheet: `counts = {}
for item in items:
    counts[item] = counts.get(item, 0) + 1`,
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
];
