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
  // CHAPTER III: BINARY SEARCH, SETS & PREFIX SUMS (Modules 09 - 12)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 9,
    tools: [
      {
        toolName: "Filtered Sentinel Scan (`best = None`) — Guarded Minimum",
        badge: "LINEAR SCAN O(N)",
        purpose:
          "Finds the lowest valid positive value in O(1) extra memory while ignoring `None` and `<= 0` sentinel entries.",
        syntaxPattern:
          "best = None\nfor x in items:\n    if x is not None and x > 0 and (best is None or x < best):\n        best = x",
        variations: [
          {
            label: "1. Skipping None and zero/negative glitches",
            code: "prices = [320, 0, 195, None, 160]\nbest = None\nfor p in prices:\n    if p is not None and p > 0 and (best is None or p < best):\n        best = p\nprint(best if best is not None else -1)",
            output: "160",
            note: "Safely avoids TypeError on None and ignores invalid <= 0 entries.",
          },
          {
            label: "2. All-invalid fallback to -1",
            code: "prices = [0, None, -20]\nvalid = [p for p in prices if p is not None and p > 0]\nprint(min(valid) if valid else -1)",
            output: "-1",
            note: "Guarding empty valid results avoids ValueError from bare min([]).",
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
        toolName: "Lower-Bound Binary Search (`lo < hi`) — Insertion Index",
        badge: "BINARY SEARCH O(LOG N)",
        purpose:
          "Locates the leftmost sorted index where `target` belongs (handling duplicates and end-of-array appends cleanly).",
        syntaxPattern:
          "lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] < target: lo = mid + 1\n    else: hi = mid",
        variations: [
          {
            label: "1. Lower-bound search with duplicates",
            code: "nums, target = [1, 3, 3, 5], 3\nlo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] < target: lo = mid + 1\n    else: hi = mid\nprint(lo)",
            output: "1",
            note: "Setting hi = mid on >= target guarantees landing on the leftmost 3.",
          },
          {
            label: "2. Standard library bisect_left equivalent",
            code: "import bisect\nprint(bisect.bisect_left([10, 25, 42, 70, 99], 50))",
            output: "3",
            note: "Python's C-backed bisect_left implements this exact loop.",
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
        toolName: "sorted(set(a) & set(b)) — Deduplicated Set Intersection",
        badge: "HASH SET O(N + M)",
        purpose:
          "Computes unique overlapping items across two collections in linear average time and sorts the result canonically.",
        syntaxPattern: "mutual = sorted(set(list_a) & set(list_b))",
        variations: [
          {
            label: "1. Deduplicated sorted mutual elements",
            code: 'a = ["Sam", "Mia", "Leo", "Sam"]\nb = ["Mia", "Zoe", "Sam"]\nprint(sorted(set(a) & set(b)))',
            output: "['Mia', 'Sam']",
            note: "Eliminates duplicate 'Sam' and avoids slow O(n * m) nested list scans.",
          },
          {
            label: "2. Preserving list_a order when needed",
            code: 'b_set = {"Mia", "Zoe", "Sam"}\nseen = set()\nout = [x for x in ["Sam", "Mia", "Sam"] if x in b_set and not (x in seen or seen.add(x))]\nprint(out)',
            output: "['Sam', 'Mia']",
            note: "Hash the second list into a set and track seen items to keep arrival order.",
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
        toolName: "Prefix Sum Ruler (`prefix[r + 1] - prefix[l]`) — O(1) Queries",
        badge: "PREFIX SUM O(N + Q)",
        purpose:
          "Precomputes cumulative sums with a leading zero sentinel so any inclusive range `[left, right]` resolves in O(1).",
        syntaxPattern:
          "prefix = [0]\nfor n in nums:\n    prefix.append(prefix[-1] + n)\nslice_sum = prefix[right + 1] - prefix[left]",
        variations: [
          {
            label: "1. Answering multiple inclusive range sums",
            code: "nums = [10, 20, 15, 5]\nprefix = [0]\nfor n in nums:\n    prefix.append(prefix[-1] + n)\nprint([prefix[r + 1] - prefix[l] for l, r in [[0, 2], [1, 3]]])",
            output: "[45, 40]",
            note: "Leading 0 makes left=0 work without an extra if-branch.",
          },
          {
            label: "2. Handling negative values seamlessly",
            code: "nums = [3, -2, 7, 1]\np = [0]\nfor n in nums: p.append(p[-1] + n)\nprint(p[3] - p[1])",
            output: "5",
            note: "Prefix differences work identically even with negative array values.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER IV: PODIUM TRACKING, TIE-BREAKERS & PARTITIONING (Modules 13 - 16)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 13,
    tools: [
      {
        toolName: "Two-Variable Podium Tracker (`first, second`) — Single Pass",
        badge: "STREAMING O(N)",
        purpose:
          "Tracks the top-2 distinct values in one pass and O(1) memory without sorting the array.",
        syntaxPattern:
          "first = second = None\nfor x in scores:\n    if first is None or x > first:\n        first, second = x, first\n    elif x < first and (second is None or x > second):\n        second = x",
        variations: [
          {
            label: "1. Distinct top 2 with duplicate champion",
            code: "scores = [120, 450, 450, 310]\nfirst = second = None\nfor s in scores:\n    if first is None or s > first:\n        first, second = s, first\n    elif s < first and (second is None or s > second):\n        second = s\nprint([first, second])",
            output: "[450, 310]",
            note: "s < first skips the second 450 so silver correctly stays 310.",
          },
          {
            label: "2. Safe on negative scores & single distinct value",
            code: "scores = [-10, -3, -20]\nfirst = second = None\nfor s in scores:\n    if first is None or s > first: first, second = s, first\n    elif s < first and (second is None or s > second): second = s\nprint([first, second])",
            output: "[-3, -10]",
            note: "Initializing with None instead of 0 handles all-negative inputs.",
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
        toolName: "Tuple Key `lambda p: (-p['score'], p['time'], p['name'])`",
        badge: "MULTI-KEY TIMSORT",
        purpose:
          "Ranks objects across mixed descending (`-score`) and ascending (`time`, `name`) tie-breaker criteria in one sort pass.",
        syntaxPattern:
          "ranked = sorted(items, key=lambda p: (-p['score'], p['time'], p['name']))",
        variations: [
          {
            label: "1. Score descending, fastest time ascending, A-Z tie-break",
            code: 'players = [{"name":"Kai","score":95,"time":40},{"name":"Aria","score":95,"time":30}]\nprint([p["name"] for p in sorted(players, key=lambda p: (-p["score"], p["time"], p["name"]))])',
            output: "['Aria', 'Kai']",
            note: "Negating only -score preserves ascending order for time and name.",
          },
          {
            label: "2. Projecting names after sorting dicts",
            code: 'data = [{"n":"Zoe","s":10},{"n":"Amy","s":10}]\nprint([d["n"] for d in sorted(data, key=lambda d: (-d["s"], d["n"]))])',
            output: "['Amy', 'Zoe']",
            note: "Python compares tuple elements strictly left to right.",
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
        toolName: "Two-Pointer In-Place Swap (`l, r`) — O(1) Parity Partition",
        badge: "TWO POINTERS O(1) SPACE",
        purpose:
          "Partitions evens before odds directly inside the input list using converging `left`/`right` indices.",
        syntaxPattern:
          "l, r = 0, len(nums) - 1\nwhile l < r:\n    while l < r and nums[l] % 2 == 0: l += 1\n    while l < r and nums[r] % 2 == 1: r -= 1\n    if l < r: nums[l], nums[r] = nums[r], nums[l]; l += 1; r -= 1",
        variations: [
          {
            label: "1. Converging in-place swap",
            code: "nums = [3, 1, 2, 4]\nl, r = 0, len(nums) - 1\nwhile l < r:\n    while l < r and nums[l] % 2 == 0: l += 1\n    while l < r and nums[r] % 2 == 1: r -= 1\n    if l < r: nums[l], nums[r] = nums[r], nums[l]; l += 1; r -= 1\nprint(nums)",
            output: "[4, 2, 1, 3]",
            note: "All evens precede all odds in O(n) time and O(1) extra space.",
          },
          {
            label: "2. Guarding inner while bounds with l < r",
            code: "evens = [2, 4, 6]\nl, r = 0, len(evens) - 1\nwhile l < r and evens[l] % 2 == 0:\n    l += 1\nprint(l, r)",
            output: "2 2",
            note: "Checking l < r prevents walking off the end of an all-even array.",
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
        toolName: "Allowlist Set + Seen Guard — Ordered O(n+m) Filter",
        badge: "HASH SET GATEKEEPER",
        purpose:
          "Checks large arrival streams against an allowlist in O(1) per lookup while preserving order and deduplicating repeats.",
        syntaxPattern:
          "vip_set, seen, out = set(vip_list), set(), []\nfor x in arrivals:\n    if x in vip_set and x not in seen:\n        seen.add(x); out.append(x)",
        variations: [
          {
            label: "1. Preserve first-arrival order & dedup repeats",
            code: 'vips = set(["Aria", "Kai", "Nova"])\nseen, out = set(), []\nfor g in ["Leo", "Kai", "Aria", "Kai"]:\n    if g in vips and g not in seen:\n        seen.add(g); out.append(g)\nprint(out)',
            output: "['Kai', 'Aria']",
            note: "Second 'Kai' is dropped while first-seen order ['Kai', 'Aria'] stays intact.",
          },
          {
            label: "2. Why set intersection alone loses order",
            code: 'print(len(set(["Kai", "Aria"]) & set(["Aria", "Kai"])))',
            output: "2",
            note: "Python sets have non-deterministic iteration order; iterate arrivals linearly instead.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER V: TWO-POINTER STRINGS, SETS & INVERTED INDICES (Modules 17 - 20)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 17,
    tools: [
      {
        toolName: "Inward Two Pointers + `.isalnum()` — O(1) Palindrome Check",
        badge: "TWO POINTERS O(1) SPACE",
        purpose:
          "Validates messy phrases case-insensitively while skipping punctuation and spaces without allocating a cleaned copy string.",
        syntaxPattern:
          "while l < r:\n    while l < r and not text[l].isalnum(): l += 1\n    while l < r and not text[r].isalnum(): r -= 1\n    if text[l].lower() != text[r].lower(): return False",
        variations: [
          {
            label: "1. Checking alphanumeric characters and case folding",
            code: 'for ch in ["A", ",", "9"]:\n    print(ch, ch.isalnum(), ch.lower())',
            output: "A True a\n, False ,\n9 True 9",
            note: ".isalnum() keeps letters & digits while ignoring spaces and punctuation.",
          },
          {
            label: "2. Punctuation-only phrase edge case",
            code: 's = ".,!"\nl, r = 0, len(s) - 1\nwhile l < r and not s[l].isalnum(): l += 1\nprint(l >= r)',
            output: "True",
            note: "When zero alphanumeric characters remain, pointers meet cleanly and return True.",
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
        toolName: "`seen = set()` Early Exit — First Repeated Item",
        badge: "STREAMING SET O(N)",
        purpose:
          "Scans left to right and halts on the very first collision instead of hashing the entire list into `len(set(items))`.",
        syntaxPattern:
          "seen = set()\nfor x in items:\n    if x in seen: return x\n    seen.add(x)\nreturn None",
        variations: [
          {
            label: "1. Return earliest completed duplicate",
            code: 'seen = set()\nfor n in ["aria", "kai", "mia", "kai", "aria"]:\n    if n in seen:\n        print(n); break\n    seen.add(n)',
            output: "kai",
            note: "'kai' finishes its 2nd occurrence at index 3 before 'aria' repeats at index 4.",
          },
          {
            label: "2. Clean None return when all items unique",
            code: 'def f(xs):\n    s = set()\n    for x in xs:\n        if x in s: return x\n        s.add(x)\n    return None\nprint(f(["aria", "kai"]))',
            output: "None",
            note: "Reaching the end without collisions returns None.",
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
        toolName: "`sorted(nums)` Adjacent Pair Gap Scan — Closest Pair",
        badge: "SORT + SCAN O(N LOG N)",
        purpose:
          "Sorts a non-mutating copy once so the minimum absolute difference is guaranteed to appear between adjacent elements.",
        syntaxPattern:
          "ordered = sorted(nums)\nbest = min(ordered[i + 1] - ordered[i] for i in range(len(ordered) - 1))",
        variations: [
          {
            label: "1. Minimum gap across positive and negative numbers",
            code: "ordered = sorted([-10, -3, 2, 11])\nprint(min(ordered[i + 1] - ordered[i] for i in range(len(ordered) - 1)))",
            output: "5",
            note: "Gap between -3 and 2 is 2 - (-3) = 5.",
          },
          {
            label: "2. Preserving caller's original list",
            code: "raw = [42, 15, 25, 9]\nordered = sorted(raw)\nprint(raw[0], ordered[0])",
            output: "42 9",
            note: "sorted() avoids side effects on caller data unlike .sort().",
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
        toolName: "`zip()` + `dict.setdefault(k, [])` — Inverted Index",
        badge: "GROUPING HASH MAP O(N)",
        purpose:
          "Groups parallel columns into `{key: [values...]}` buckets without overwriting repeated keys.",
        syntaxPattern:
          "index = {}\nfor name, role in zip(names, roles):\n    index.setdefault(role, []).append(name)",
        variations: [
          {
            label: "1. Grouping multiple users under shared roles",
            code: 'index = {}\nfor n, r in zip(["Aria", "Kai", "Mia"], ["admin", "dev", "admin"]):\n    index.setdefault(r, []).append(n)\nprint(index)',
            output: "{'admin': ['Aria', 'Mia'], 'dev': ['Kai']}",
            note: "Preserves insertion order inside every role bucket.",
          },
          {
            label: "2. Why dict(zip(...)) loses earlier entries",
            code: 'print(dict(zip(["admin", "dev", "admin"], ["Aria", "Kai", "Mia"])))',
            output: "{'admin': 'Mia', 'dev': 'Kai'}",
            note: "A flat dictionary overwrites 'Aria' when the second 'admin' arrives.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 21,
    tools: [
      {
        toolName: "Running Minimum Track — Single-Pass Floor",
        badge: "GREEDY ONE-PASS",
        purpose:
          "Tracks the lowest historical price seen so far so every future step checks profit in O(1) per day.",
        syntaxPattern: "min_price = min(min_price, p); best = max(best, p - min_price)",
        variations: [
          {
            label: "1. Updating min floor and best spread",
            code: "best = 0\nlow = float('inf')\nfor p in [7, 1, 5, 3]:\n    low = min(low, p)\n    best = max(best, p - low)\nprint(best)",
            output: "4",
            note: "Buy at 1 and sell at 5 without ever looking backward.",
          },
          {
            label: "2. Strictly falling prices guard",
            code: "print(max(0, 2 - 9))",
            output: "0",
            note: "Initialize best to 0 so unprofitable markets never return negative numbers.",
          },
        ],
      },
      {
        toolName: "float('inf') — Positive Infinity Sentinel",
        badge: "NUMERIC GUARD",
        purpose:
          "Provides an initial upper bound guaranteed to lose any first min() comparison.",
        syntaxPattern: "min_price = float('inf')",
        variations: [
          {
            label: "1. Safe initial floor",
            code: "low = float('inf')\nprint(5 < low)",
            output: "True",
            note: "First element always replaces infinity cleanly without empty-list crashes.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 22,
    tools: [
      {
        toolName: '"".join(sorted(word)) — Canonical Anagram Key',
        badge: "HASH SIGNATURE",
        purpose:
          "Normalizes any word into an immutable, hashable signature shared by all of its anagrams.",
        syntaxPattern: 'sig = "".join(sorted(word))',
        variations: [
          {
            label: "1. Checking shared signature",
            code: "print(''.join(sorted('tea')) == ''.join(sorted('ate')))",
            output: "True",
            note: "Both anagrams produce `'aet'`.",
          },
        ],
      },
      {
        toolName: "dict.setdefault() — Auto-Bucket Append",
        badge: "DICT PATTERN",
        purpose:
          "Initializes an empty bucket list on first sight and appends in a single expression.",
        syntaxPattern: "groups.setdefault(sig, []).append(word)",
        variations: [
          {
            label: "1. Grouping into buckets",
            code: "g = {}\nfor w in ['eat', 'tea', 'tan']:\n    g.setdefault(''.join(sorted(w)), []).append(w)\nprint(list(g.values()))",
            output: "[['eat', 'tea'], ['tan']]",
            note: "Preserves original insertion order across Python 3.7+ dicts.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 23,
    tools: [
      {
        toolName: "sorted(intervals, key=lambda x: x[0]) — Timeline Sort",
        badge: "INTERVAL ORDERING",
        purpose:
          "Orders [start, end] pairs chronologically so any overlapping spans become adjacent.",
        syntaxPattern: "ordered = sorted(intervals, key=lambda x: x[0])",
        variations: [
          {
            label: "1. Sorting intervals safely",
            code: "print(sorted([[8, 10], [1, 3], [2, 6]], key=lambda x: x[0]))",
            output: "[[1, 3], [2, 6], [8, 10]]",
            note: "Using `sorted(...)` keeps the caller's original list unmodified.",
          },
        ],
      },
      {
        toolName: "max(merged[-1][1], end) — Overlap Merge",
        badge: "BOUNDARY GUARD",
        purpose:
          "Extends the previous merged interval only when the new interval reaches further right.",
        syntaxPattern: "merged[-1][1] = max(merged[-1][1], end)",
        variations: [
          {
            label: "1. Touching boundary [1,4] & [4,5]",
            code: "a = [1, 4]\nb = [4, 5]\nprint(b[0] <= a[1])",
            output: "True",
            note: "Using `<=` merges touching endpoints cleanly into `[1, 5]`.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "algorithms",
    matchOrder: 24,
    tools: [
      {
        toolName: "counts.get(n, 0) + 1 — Frequency Tally",
        badge: "HASH COUNTER",
        purpose:
          "Accumulates exact occurrence counts for each unique item in O(n) time.",
        syntaxPattern: "counts[n] = counts.get(n, 0) + 1",
        variations: [
          {
            label: "1. Counting occurrences",
            code: "c = {}\nfor n in [4, 4, 2]:\n    c[n] = c.get(n, 0) + 1\nprint(c)",
            output: "{4: 2, 2: 1}",
            note: "`.get(n, 0)` avoids `KeyError` on the first sighting.",
          },
        ],
      },
      {
        toolName: "sorted(..., key=lambda x: (-counts[x], x))[:k]",
        badge: "TOP-K RANKING",
        purpose:
          "Ranks unique keys by descending frequency with deterministic tie-breaking, then slices top K.",
        syntaxPattern: "sorted(counts.keys(), key=lambda x: (-counts[x], x))[:k]",
        variations: [
          {
            label: "1. Slicing top 2 winners",
            code: "c = {1: 3, 2: 2, 3: 1}\nprint(sorted(c.keys(), key=lambda x: (-c[x], x))[:2])",
            output: "[1, 2]",
            note: "Negating `-c[x]` sorts highest counts to the front.",
          },
        ],
      },
    ],
  },
];
