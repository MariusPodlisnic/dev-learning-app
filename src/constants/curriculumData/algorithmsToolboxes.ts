import { LessonToolboxEntry } from "./types";

export const ALGORITHMS_TOOLBOXES: LessonToolboxEntry[] = [
  // ============================================================================
  // CHAPTER I: HASHING & POINTER SPEEDUPS (Modules 01 - 04)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 1,
    tools: [
      {
        toolName: "Hash Map Complement Lookup (Two Sum Pattern)",
        badge: "HASH MAP O(1)",
        purpose:
          "Stores visited values in a dictionary so you can find the matching complement in O(1) instant time without nested loops.",
        syntaxPattern: "needed = target - num\nif needed in seen:\n    return [seen[needed], current_index]\nseen[num] = current_index",
        variations: [
          {
            label: "1. Calculating the needed partner number",
            code: "target = 50\nnum = 20\nneeded = target - num\nprint(needed)",
            output: "30",
            note: "Subtract current value from target to know what number would complete the sum.",
          },
          {
            label: "2. Checking dictionary membership with 'in'",
            code: 'seen = {10: 0, 20: 1}\nprint(20 in seen, 99 in seen)',
            output: "True False",
            note: "Checking 'key in dict' takes O(1) time because dictionaries use hash tables.",
          },
          {
            label: "3. Recording index for each visited item",
            code: "seen = {}\nnums = [20, 30]\nfor i, n in enumerate(nums):\n    seen[n] = i\nprint(seen)",
            output: "{20: 0, 30: 1}",
            note: "enumerate() gives you both the index i and the value n.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 2,
    tools: [
      {
        toolName: "Two Pointers — Inward Scan (left < right)",
        badge: "TWO POINTERS",
        purpose:
          "Scans inward from both ends of a sequence at the same time to check symmetry or find pairs in O(n) time and O(1) space.",
        syntaxPattern: "left = 0\nright = len(items) - 1\nwhile left < right:\n    # compare items[left] with items[right]\n    left += 1\n    right -= 1",
        variations: [
          {
            label: "1. Setting up pointer boundaries",
            code: 's = "radar"\nleft = 0\nright = len(s) - 1\nprint("left:", left, "right:", right)',
            output: "left: 0 right: 4",
            note: "left starts at 0, and right starts at the last valid index (len - 1).",
          },
          {
            label: "2. Stepping inward each iteration",
            code: "left = 0\nright = 4\nwhile left < right:\n    left += 1\n    right -= 1\nprint('met at:', left, right)",
            output: "met at: 2 2",
            note: "left increments (+1) and right decrements (-1) until they cross in the middle.",
          },
          {
            label: "3. Comparing characters at symmetric ends",
            code: 's = "radar"\nis_sym = (s[0] == s[-1])\nprint(is_sym)',
            output: "True",
            note: "If items[left] != items[right] at any point, the sequence is not symmetrical.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 3,
    tools: [
      {
        toolName: "Fast & Slow Pointers (Floyd's Cycle Detection)",
        badge: "POINTER CADENCE",
        purpose:
          "Moves two pointers at different speeds (1 step vs 2 steps) to find cycles or midpoints in linear sequences.",
        syntaxPattern: "slow = head\nfast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast:\n        return True  # Cycle detected!",
        variations: [
          {
            label: "1. Simulating two different speeds in an array",
            code: "nums = [1, 2, 3, 4, 5]\nslow = 0\nfast = 0\nwhile fast < len(nums) - 2:\n    slow += 1\n    fast += 2\nprint('slow:', nums[slow], 'fast:', nums[fast])",
            output: "slow: 3 fast: 5",
            note: "When fast reaches the end, slow is positioned exactly in the middle.",
          },
          {
            label: "2. Safe advance check for fast.next",
            code: "node_has_next = True\nif node_has_next:\n    print('Safe to jump 2 steps')",
            output: "Safe to jump 2 steps",
            note: "Always check 'fast and fast.next' before reading fast.next.next to avoid NoneType errors.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 4,
    tools: [
      {
        toolName: "Binary Search Range Halving (O(log n))",
        badge: "DIVIDE & CONQUER",
        purpose:
          "Searches a sorted array in O(log n) time by testing the midpoint and discarding half the remaining candidates on every step.",
        syntaxPattern: "left = 0\nright = len(arr) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] < target: left = mid + 1\n    else: right = mid - 1",
        variations: [
          {
            label: "1. Computing safe integer midpoint",
            code: "left = 0\nright = 10\nmid = (left + right) // 2\nprint(mid)",
            output: "5",
            note: "// ensures floor division so mid is always a whole number integer index.",
          },
          {
            label: "2. Shifting the search window to the right half",
            code: "target = 8\nmid_val = 5\n# target is bigger, look right:\nleft = 5 + 1\nprint('new left:', left)",
            output: "new left: 6",
            note: "Set left = mid + 1 because arr[mid] was already tested and was too small.",
          },
          {
            label: "3. Shifting the search window to the left half",
            code: "target = 3\nmid_val = 5\n# target is smaller, look left:\nright = 5 - 1\nprint('new right:', right)",
            output: "new right: 4",
            note: "Set right = mid - 1 because arr[mid] was already tested and was too big.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER II: STACKS, LINKED LISTS & TREES (Modules 05 - 08)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 5,
    tools: [
      {
        toolName: "Node Traversal & Pointer Swapping",
        badge: "LINKED LIST",
        purpose:
          "Navigates and rewires reference links between objects using temporary pointer variables.",
        syntaxPattern: "curr = head\nprev = None\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt",
        variations: [
          {
            label: "1. Three-way pointer rotation",
            code: "a, b = 1, 2\na, b = b, a\nprint('a:', a, 'b:', b)",
            output: "a: 2 b: 1",
            note: "Python tuple assignment safely swaps reference variables in 1 step.",
          },
          {
            label: "2. Walking a sequence until None / empty",
            code: "items = ['node_1', 'node_2', None]\nfor item in items:\n    if item is None: break\n    print(item)",
            output: "node_1\nnode_2",
            note: "LinkedList loops stop when current pointer hits None.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 6,
    tools: [
      {
        toolName: "dict.get(key, 0) + 1 — Frequency Tally",
        badge: "HASH MAP TALLY",
        purpose:
          "Counts how many times each item appears in a list in a single O(n) pass.",
        syntaxPattern: "counts = {}\nfor item in items:\n    counts[item] = counts.get(item, 0) + 1",
        variations: [
          {
            label: "1. Initial key insertion with fallback 0",
            code: 'counts = {}\ncounts["alex"] = counts.get("alex", 0) + 1\nprint(counts)',
            output: "{'alex': 1}",
            note: ".get('alex', 0) returns 0 on the first encounter so adding 1 yields 1.",
          },
          {
            label: "2. Incrementing an existing count",
            code: 'counts = {"alex": 1}\ncounts["alex"] = counts.get("alex", 0) + 1\nprint(counts)',
            output: "{'alex': 2}",
            note: "Subsequent encounters retrieve the current tally and increment it by 1.",
          },
          {
            label: "3. Finding the key with the highest count",
            code: 'tallies = {"sam": 4, "mia": 8}\nbest = max(tallies, key=tallies.get)\nprint(best)',
            output: "mia",
            note: "max(d, key=d.get) finds the key that has the largest value.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 7,
    tools: [
      {
        toolName: "Sliding Window Accumulator (+ right, - left)",
        badge: "SLIDING WINDOW",
        purpose:
          "Computes subarray sums of size k in O(1) time per step instead of re-summing from scratch.",
        syntaxPattern: "window_sum = sum(nums[:k])\nbest = window_sum\nfor i in range(k, len(nums)):\n    window_sum += nums[i] - nums[i - k]\n    best = max(best, window_sum)",
        variations: [
          {
            label: "1. Establishing the initial window sum",
            code: "traffic = [10, 40, 30, 50, 20]\nk = 3\ninit_sum = sum(traffic[:k])\nprint(init_sum)",
            output: "80",
            note: "traffic[:3] sums elements at index 0, 1, and 2 (10 + 40 + 30 = 80).",
          },
          {
            label: "2. Rolling the window 1 step forward",
            code: "window_sum = 80\nnew_item = 50   # entering on right\nold_item = 10   # leaving on left\nwindow_sum += new_item - old_item\nprint(window_sum)",
            output: "120",
            note: "Adding 50 and subtracting 10 shifts the window to [40, 30, 50] = 120 in O(1).",
          },
          {
            label: "3. Tracking maximum seen so far",
            code: "best = 80\nbest = max(best, 120)\nprint(best)",
            output: "120",
            note: "max() keeps the higher value between the current best and the new window.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 8,
    tools: [
      {
        toolName: "List as a Stack (LIFO: .append() & .pop())",
        badge: "STACK LIFO",
        purpose:
          "Enforces Last-In First-Out order to pair matching brackets, undo actions, or backtrack DFS paths.",
        syntaxPattern: "stack = []\nstack.append(item)  # Push to top\ntop = stack.pop()   # Pop from top\nis_empty = len(stack) == 0",
        variations: [
          {
            label: "1. Push an open bracket to stack",
            code: 'stack = []\nstack.append("(")\nprint(stack)',
            output: "['(']",
            note: ".append() adds onto the top (end) of the stack in O(1) time.",
          },
          {
            label: "2. Pop matching bracket from top",
            code: "stack = ['(']\npopped = stack.pop()\nprint('popped:', popped, 'empty:', len(stack) == 0)",
            output: "popped: ( empty: True",
            note: ".pop() removes and returns the most recently appended element.",
          },
          {
            label: "3. Safe guard before popping",
            code: "stack = []\nif not stack:\n    print('Stack underflow! Cannot pop.')",
            output: "Stack underflow! Cannot pop.",
            note: "Always verify stack is not empty ('if not stack:') before calling .pop().",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER III: FAST SEARCHES & RUNNING TOTALS (Modules 09 - 12)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 9,
    tools: [
      {
        toolName: "min() — Linear Scan Minimum Finder",
        badge: "BUILT-IN O(N)",
        purpose:
          "Scans an iterable in a single O(n) pass to find and return the smallest item.",
        syntaxPattern: "lowest = min(number_list)",
        variations: [
          {
            label: "1. Find lowest value in a list",
            code: "prices = [320, 195, 240, 160, 410]\nprint(min(prices))",
            output: "160",
            note: "min() examines each number once in O(n) time and returns the minimum.",
          },
          {
            label: "2. Find minimum between two scalar numbers",
            code: "a, b = 45, 12\nprint(min(a, b))",
            output: "12",
            note: "You can pass multiple arguments directly: min(x, y).",
          },
          {
            label: "3. Safe default when list might be empty",
            code: "items = []\nprint(min(items, default=0))",
            output: "0",
            note: "Providing default=0 prevents a ValueError on empty lists.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 10,
    tools: [
      {
        toolName: "// 2 — Midpoint Index Floor Division",
        badge: "INDEX MATH",
        purpose:
          "Divides sequence length by 2 and rounds down to return a valid integer index for the middle element.",
        syntaxPattern: "mid = len(items) // 2\nmiddle_val = items[mid]",
        variations: [
          {
            label: "1. Midpoint of odd-length list",
            code: "items = [10, 20, 30, 40, 50]\nmid = len(items) // 2\nprint('mid index:', mid, 'val:', items[mid])",
            output: "mid index: 2 val: 30",
            note: "5 // 2 is 2. Index 2 points to the exact center item (30).",
          },
          {
            label: "2. Midpoint of even-length list",
            code: "items = [10, 20, 30, 40]\nmid = len(items) // 2\nprint('mid index:', mid, 'val:', items[mid])",
            output: "mid index: 2 val: 30",
            note: "4 // 2 is 2. Selects the right-leaning center element of the even sequence.",
          },
          {
            label: "3. Midpoint between two pointer indices",
            code: "left, right = 4, 8\nmid = left + (right - left) // 2\nprint(mid)",
            output: "6",
            note: "Prevents numeric overflow when calculating middle between two offsets.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 11,
    tools: [
      {
        toolName: "[x for x in A if x in B] — List Intersection",
        badge: "FILTERED COMPREHENSION",
        purpose:
          "Filters a list to only retain items that also exist inside another collection.",
        syntaxPattern: "mutual = [item for item in list_a if item in list_b]",
        variations: [
          {
            label: "1. Intersecting two lists in one line",
            code: 'a = ["Sam", "Mia", "Leo"]\nb = ["Mia", "Zoe", "Sam"]\nmutual = [f for f in a if f in b]\nprint(mutual)',
            output: "['Sam', 'Mia']",
            note: "Evaluates 'f in b' for each item in a and keeps matches in order.",
          },
          {
            label: "2. Accelerating with a set for O(1) lookups",
            code: 'set_b = {"Mia", "Zoe", "Sam"}\nmutual = [f for f in ["Sam", "Mia"] if f in set_b]\nprint(mutual)',
            output: "['Sam', 'Mia']",
            note: "Checking 'f in set_b' takes O(1) instant lookup time instead of O(n) list scan.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 12,
    tools: [
      {
        toolName: "total += n & .append(total) — Running Total",
        badge: "PREFIX SUM ACCUMULATOR",
        purpose:
          "Maintains a cumulative running sum and saves the subtotal at each step into a results list.",
        syntaxPattern: "result = []\ntotal = 0\nfor n in numbers:\n    total += n\n    result.append(total)",
        variations: [
          {
            label: "1. Building running total step by step",
            code: "nums = [10, 20, 15, 5]\nres = []\ntot = 0\nfor n in nums:\n    tot += n\n    res.append(tot)\nprint(res)",
            output: "[10, 30, 45, 50]",
            note: "Each element in res represents the total of all numbers up to that index.",
          },
          {
            label: "2. Finding sum of range using prefix totals",
            code: "prefix = [10, 30, 45, 50]\n# sum between idx 1 and 3: prefix[3] - prefix[0]\nrange_sum = prefix[3] - prefix[0]\nprint(range_sum)",
            output: "40",
            note: "Allows answering any range sum query in O(1) time without re-looping.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER IV: SORTING & FILTERING PATTERNS (Modules 13 - 16)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 13,
    tools: [
      {
        toolName: "max() — Linear Scan Maximum Finder",
        badge: "BUILT-IN O(N)",
        purpose:
          "Finds and returns the greatest number or highest-ranking item in an iterable.",
        syntaxPattern: "highest = max(number_list)",
        variations: [
          {
            label: "1. Find highest value in list",
            code: "scores = [120, 450, 310, 290]\nprint(max(scores))",
            output: "450",
            note: "max() inspects each element once in O(n) time.",
          },
          {
            label: "2. Find max using a custom key function",
            code: "words = ['cat', 'elephant', 'dog']\nprint(max(words, key=len))",
            output: "elephant",
            note: "key=len finds the string with the greatest character length.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 14,
    tools: [
      {
        toolName: "sorted(..., reverse=True) — Descending Order Sort",
        badge: "TIMSORT O(N LOG N)",
        purpose:
          "Sorts items from highest to lowest (descending order) without mutating the original list.",
        syntaxPattern: "ranked = sorted(items, reverse=True)",
        variations: [
          {
            label: "1. Sort numbers high to low",
            code: "scores = [40, 95, 70, 85]\nprint(sorted(scores, reverse=True))",
            output: "[95, 85, 70, 40]",
            note: "reverse=True flips the default ascending order to descending order.",
          },
          {
            label: "2. Sort strings alphabetically descending",
            code: "letters = ['a', 'c', 'b']\nprint(sorted(letters, reverse=True))",
            output: "['c', 'b', 'a']",
            note: "Orders letters Z to A.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 15,
    tools: [
      {
        toolName: "n % 2 == 0 — Modulo Parity Check",
        badge: "MODULO OPERATOR",
        purpose:
          "Checks whether a number has zero remainder when divided by 2 to distinguish even from odd.",
        syntaxPattern: "is_even = (n % 2 == 0)\nevens = [n for n in nums if n % 2 == 0]",
        variations: [
          {
            label: "1. Test even vs odd parity",
            code: "print(10 % 2 == 0, 15 % 2 == 0)",
            output: "True False",
            note: "Even numbers leave remainder 0; odd numbers leave remainder 1.",
          },
          {
            label: "2. Filter a list for only even numbers",
            code: "nums = [10, 15, 22, 33, 40]\nevens = [n for n in nums if n % 2 == 0]\nprint(evens)",
            output: "[10, 22, 40]",
            note: "Keeps only items that satisfy the modulo condition.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 16,
    tools: [
      {
        toolName: "item in collection — Early Exit Membership Scan",
        badge: "MEMBERSHIP TEST",
        purpose:
          "Scans a collection for a target value and returns True immediately as soon as a match is found.",
        syntaxPattern: "is_present = target in collection",
        variations: [
          {
            label: "1. Check if name is in list",
            code: 'vip = ["Aria", "Kai", "Nova"]\nprint("Kai" in vip, "Leo" in vip)',
            output: "True False",
            note: "Returns a clean boolean True or False.",
          },
          {
            label: "2. Negative check with 'not in'",
            code: 'banned = ["bad_bot", "spammer"]\nprint("good_user" not in banned)',
            output: "True",
            note: "'not in' returns True when the item is completely absent.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER V: PRACTICAL INTERVIEW CLASSICS (Modules 17 - 20)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 17,
    tools: [
      {
        toolName: "seq[::-1] — Step Slice String & Array Inversion",
        badge: "EXTENDED SLICING",
        purpose:
          "Uses extended slice syntax with step -1 to reverse any sequence in a single concise operation.",
        syntaxPattern: "reversed_seq = seq[::-1]\nis_palindrome = (seq == seq[::-1])",
        variations: [
          {
            label: "1. Reverse text string",
            code: 'word = "radar"\nprint(word[::-1])',
            output: "radar",
            note: "Step -1 walks backward from the final element to index 0.",
          },
          {
            label: "2. Test palindrome equivalence",
            code: 'word = "level"\nprint(word == word[::-1])',
            output: "True",
            note: "If the reversed string matches the original, it is a palindrome.",
          },
          {
            label: "3. Reverse a list of numbers",
            code: "nums = [1, 2, 3]\nprint(nums[::-1])",
            output: "[3, 2, 1]",
            note: "Works identically on lists without modifying the source list.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 18,
    tools: [
      {
        toolName: "len(items) == len(set(items)) — Uniqueness Test",
        badge: "HASH SET DEDUPLICATION",
        purpose:
          "Compares total list length against unique set length to verify absence of duplicates in O(n) time.",
        syntaxPattern: "all_unique = len(items) == len(set(items))",
        variations: [
          {
            label: "1. Unique list test (returns True)",
            code: 'names = ["aria", "kai"]\nprint(len(names) == len(set(names)))',
            output: "True",
            note: "Because every name is distinct, set() drops nothing and lengths match.",
          },
          {
            label: "2. Duplicate list test (returns False)",
            code: 'names = ["aria", "aria"]\nprint(len(names) == len(set(names)))',
            output: "False",
            note: "set() collapses duplicate 'aria', shrinking set length from 2 to 1.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 19,
    tools: [
      {
        toolName: "abs(a - b) — Absolute Distance Magnitude",
        badge: "BUILT-IN MATH",
        purpose:
          "Removes any negative sign from subtraction to measure the non-negative scalar distance between two points.",
        syntaxPattern: "distance = abs(x1 - x2)",
        variations: [
          {
            label: "1. Always-positive distance",
            code: "a, b = 15, 25\nprint(abs(a - b), abs(b - a))",
            output: "10 10",
            note: "Order does not matter: abs(15 - 25) and abs(25 - 15) both produce 10.",
          },
          {
            label: "2. Manhattan distance calculation",
            code: "x1, y1 = 2, 5\nx2, y2 = 6, 8\nmanhattan = abs(x1 - x2) + abs(y1 - y2)\nprint(manhattan)",
            output: "7",
            note: "Standard grid distance formula: abs(dx) + abs(dy).",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 20,
    tools: [
      {
        toolName: "dict(zip(keys, values)) — Parallel List Zipper",
        badge: "ITERATOR COMBINER",
        purpose:
          "Pairs corresponding elements from two equal-length lists into key-value pairs and builds a dictionary in O(n) time.",
        syntaxPattern: "lookup = dict(zip(keys_list, values_list))",
        variations: [
          {
            label: "1. Pair names and scores into dictionary",
            code: 'names = ["Aria", "Kai"]\nscores = [100, 85]\nboard = dict(zip(names, scores))\nprint(board)',
            output: "{'Aria': 100, 'Kai': 85}",
            note: "zip() groups by index: (names[0], scores[0]), (names[1], scores[1]).",
          },
          {
            label: "2. Iterating through paired tuples",
            code: 'for k, v in zip(["a", "b"], [1, 2]):\n    print(f"{k}->{v}")',
            output: "a->1\nb->2",
            note: "Unpacks corresponding items simultaneously in a for loop.",
          },
        ],
      },
    ],
  },
];
