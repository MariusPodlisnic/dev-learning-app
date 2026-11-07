export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CommonPitfall {
  title: string;
  wrongCode: string;
  rightCode: string;
  explanation: string;
}

export interface LessonEnrichment {
  realWorldUse: string;
  analogyTitle: string;
  analogyText: string;
  cheatSheet: string;
  quiz: LessonQuiz;
  commonPitfall?: CommonPitfall;
  guidedCode?: string;
  solutionCode?: string;
}

export interface EnrichedLessonData extends LessonEnrichment {
  matchTrack: "python_basics" | "algorithms" | "system_design";
  matchOrder?: number;
  matchKeywords: string[];
}

export const LESSON_ENRICHMENTS: EnrichedLessonData[] = [
  // ============================================================================
  // TRACK 1: PYTHON BASICS
  // ============================================================================
  {
    matchTrack: "python_basics",
    matchOrder: 1,
    matchKeywords: ["variable", "type", "data"],
    realWorldUse:
      "Used in every app: storing a player's score, a user's display name, or whether dark mode is turned on.",
    analogyTitle: "Think of Variables Like Labeled Kitchen Jars",
    analogyText:
      'Imagine putting a sticky note that says `score` on a jar and dropping the number `100` inside. Whenever you ask Python for `score`, it looks inside that jar and hands you back `100`.\n\n• **Strings (`"hello"`)** are text wrapped in quotes.\n• **Integers (`42`)** are whole numbers without quotes.\n• **Booleans (`True` / `False`)** are simple ON/OFF switches.',
    cheatSheet: `# 1. Create variables with '='
username = "Alex"     # String (text)
level = 5             # Integer (whole number)
is_active = True      # Boolean (True or False)

# 2. Combine them in an f-string
print(f"{username} is on level {level}")`,
    quiz: {
      question:
        'Which of these creates a number variable you can do math with (not text)?',
      options: ['points = "50"', "points = 50", "50 = points"],
      correctIndex: 1,
      explanation:
        'Without quotes, `50` is stored as a real number (integer). Wrapping it in quotes (`"50"`) turns it into plain text!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 2,
    matchKeywords: ["list", "loop", "for", "array"],
    realWorldUse:
      "Used by Spotify to loop through songs in your playlist, and by Amazon to add up every item in your shopping cart.",
    analogyTitle: "Lists Are Playlists, Loops Are Auto-Play",
    analogyText:
      "Instead of creating 100 separate variables (`song1`, `song2`, `song3`...), a **List** keeps them in a single ordered line inside square brackets `[ ]`.\n\nA **`for` loop** is like hitting Auto-Play: Python picks up the first item, runs your indented code on it, then automatically moves to the next item until the list is finished.",
    cheatSheet: `# 1. A list holds multiple items in [ ]
prices = [10, 20, 30]

# 2. A 'for' loop visits each item one by one
total = 0
for price in prices:
    total = total + price

print(total)  # Prints 60`,
    quiz: {
      question:
        "If `fruits = [\"apple\", \"banana\", \"cherry\"]`, how many times will `for f in fruits:` run?",
      options: ["1 time", "3 times (once per item)", "Forever"],
      correctIndex: 1,
      explanation:
        "A `for` loop runs once for every item inside the list — since there are 3 fruits, it runs 3 times!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 3,
    matchKeywords: ["if", "else", "condition", "logic"],
    realWorldUse:
      "Used by Netflix to check if your subscription is active before playing a movie, or by games to check if `health <= 0`.",
    analogyTitle: "If/Else Is a Fork in the Road",
    analogyText:
      "Programs need to make decisions! An **`if` statement** asks a Yes/No question:\n\n• If the answer is **True**, Python takes the first path.\n• **`elif` (else if)** checks a backup question.\n• **`else`** is the catch-all path when nothing above matched.",
    cheatSheet: `score = 85

if score >= 90:
    print("Rank: S")
elif score >= 75:
    print("Rank: A")   # <-- This runs!
else:
    print("Keep practicing!")`,
    quiz: {
      question:
        "What symbol does Python use to check if two values are equal inside an `if` statement?",
      options: [
        "Single equals: `if x = 10:`",
        "Double equals: `if x == 10:`",
        "Triple colon: `if x ::: 10`",
      ],
      correctIndex: 1,
      explanation:
        "Single `=` assigns a value to a variable, while double `==` compares two values to see if they match!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 4,
    matchKeywords: ["function", "def", "return"],
    realWorldUse:
      "Used everywhere to package reusable actions — like `calculate_tax(price)` or `send_notification(user)`.",
    analogyTitle: "Functions Are Coffee Machines",
    analogyText:
      "A **Function** is a mini-machine you build once and reuse whenever you want:\n\n1. **`def`** names your machine and lists the ingredients (**parameters**) it takes in.\n2. **`return`** hands back the finished product so the rest of your program can use it.",
    cheatSheet: `# 1. Define the function with 'def'
def double_number(n):
    return n * 2

# 2. Call (use) the function
result = double_number(21)
print(result)  # Prints 42`,
    quiz: {
      question:
        "What happens if a function calculates an answer but forgets to use `return`?",
      options: [
        "It returns `None` (nothing comes back)",
        "Python automatically guesses what to return",
        "The computer restarts",
      ],
      correctIndex: 0,
      explanation:
        "Without `return`, the function finishes its work silently and hands back `None`. Always `return` the result you want to keep!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 5,
    matchKeywords: ["dict", "key", "map", "hash"],
    realWorldUse:
      "Used to represent JSON data from APIs — like a user profile with `username`, `email`, and `role`.",
    analogyTitle: "Dictionaries Are Real-Life Contact Cards",
    analogyText:
      "In a regular list, you have to find items by their position (`0`, `1`, `2`). Change the order and everything breaks!\n\nA **Dictionary (`{ }`)** lets you label every value with a unique **Key** (like `\"username\": \"coder\"`). You can look up, add, or update any label instantly!",
    cheatSheet: `# 1. Create a dictionary with { key: value }
user = {
    "username": "coder",
    "xp": 250
}

# 2. Add or update a key
user["role"] = "admin"

# 3. Read a value safely
print(user["username"])        # "coder"
print(user.get("role"))        # "admin"`,
    quiz: {
      question:
        'How do you add a new key `"role"` with value `"admin"` to an existing `user` dictionary?',
      options: [
        'user["role"] = "admin"',
        'user.append("role", "admin")',
        'user("role") == "admin"',
      ],
      correctIndex: 0,
      explanation:
        'Square brackets `user["role"] = "admin"` creates the `"role"` key if it doesn\'t exist, or updates it if it does!',
    },
    guidedCode: `user = {
    "username": "coder",
    # Add the "role": "admin" key-value pair on the next line:
    "role": "admin"
}

print(f"User {user['username']} has role {user.get('role')}")`,
  },
  {
    matchTrack: "python_basics",
    matchOrder: 6,
    matchKeywords: ["string", "format", "clean", "strip", "lower"],
    realWorldUse:
      "Used in login forms and search bars so typing '  Alex@Email.com ' still matches 'alex@email.com'.",
    analogyTitle: "Strings Have Built-In Cleaning Tools",
    analogyText:
      "Users type messy input all the time — accidental spaces at the end, random CAPS, or typos. Python strings come with built-in methods you chain with a dot (`.`):\n\n• **`.strip()`** trims extra spaces off both ends.\n• **`.lower()`** converts every letter to lowercase.\n• **`.replace(old, new)`** swaps out characters.",
    cheatSheet: `raw_name = "  Alex_Coder  "

# Chain .strip() and .lower() together:
clean_name = raw_name.strip().lower()

print(clean_name)  # "alex_coder"`,
    quiz: {
      question: 'What does `"  HELLO ".strip().lower()` produce?',
      options: ['"hello"', '"  hello "', '"HELLO"'],
      correctIndex: 0,
      explanation:
        "`.strip()` removes the leading and trailing spaces, and `.lower()` turns `HELLO` into `hello`!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 7,
    matchKeywords: ["filter", "comprehension", "high", "score"],
    realWorldUse:
      "Used in e-commerce ('Show items under $50'), Spotify ('Songs rated 80+'), and notification feeds.",
    analogyTitle: "Filtering Is a VIP Bouncer for Your List",
    analogyText:
      "Imagine going through a list of numbers and keeping **only** the ones that pass a rule (like `score >= 80`).\n\nYou can create a new empty list `passed = []`, loop through every item, and use `if score >= 80:` with `passed.append(score)` to collect the winners!",
    cheatSheet: `scores = [65, 92, 88, 40]
top_scores = []

for s in scores:
    if s >= 80:
        top_scores.append(s)

print(top_scores)  # [92, 88]`,
    quiz: {
      question: "Which list method adds a new item to the end of a list?",
      options: [
        "my_list.append(item)",
        "my_list.push_back(item)",
        "my_list.insert_end(item)",
      ],
      correctIndex: 0,
      explanation:
        "`append()` adds a single item right onto the end of a Python list!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 8,
    matchKeywords: ["try", "except", "error", "safe", "exception"],
    realWorldUse:
      "Used in payment apps, file uploads, and network calls so one bad input shows a friendly message instead of crashing the app.",
    analogyTitle: "Try / Except Is a Safety Net for Your Code",
    analogyText:
      "Normally, dividing a number by `0` crashes your entire Python program immediately.\n\nWith **`try:`** and **`except:`**, you tell Python:\n• **`try:`** Attempt this risky calculation.\n• **`except ZeroDivisionError:`** If it fails, catch the fall gracefully and return a safe fallback value (like `0`) instead of crashing!",
    cheatSheet: `def safe_divide(total, people):
    try:
        return total / people
    except ZeroDivisionError:
        return 0`,
    quiz: {
      question:
        "When does the code inside the `except:` block run?",
      options: [
        "Only when an error happens inside the `try:` block",
        "Every single time the function is called",
        "Before the `try:` block starts",
      ],
      correctIndex: 0,
      explanation:
        "If `try:` succeeds without errors, Python skips `except:` completely. `except:` only triggers when an error occurs!",
    },
  },

  // ============================================================================
  // TRACK 2: ALGORITHMS
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 1,
    matchKeywords: ["two sum", "hash", "pair", "target", "lookup", "search"],
    realWorldUse:
      "Used in financial reconciliation, game matchmaking (pairing two players whose skill ratings sum to a target), and database joins.",
    analogyTitle: "Memory Notebook vs. Asking Everyone Twice",
    analogyText:
      "Imagine looking for two people in a room whose ages add up to `50`.\n\n• **Slow way ($O(n^2)$):** Ask Person 1 to check with every single person, then Person 2 with every single person.\n• **Smart way ($O(n)$):** Walk down the line once with a notebook (a dictionary!). If someone is `30`, check your notebook to see if you already met a `20` (`50 - 30`). If not, write down `30` and keep walking!",
    cheatSheet: `seen = {}  # value -> index

for i, num in enumerate(nums):
    needed = target - num
    if needed in seen:
        return [seen[needed], i]
    seen[num] = i`,
    quiz: {
      question:
        "Why do we store seen numbers in a dictionary `{}` instead of using a second nested `for` loop?",
      options: [
        "Dictionary lookup is instant O(1), avoiding slow O(n²) double loops",
        "Python doesn't allow two for-loops in the same file",
        "Dictionaries use zero memory",
      ],
      correctIndex: 0,
      explanation:
        "Checking `if needed in seen:` in a dictionary takes O(1) constant time, so the whole algorithm finishes in one pass!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 2,
    matchKeywords: ["pointer", "palindrome", "reverse", "window", "binary"],
    realWorldUse:
      "Used in text editors, DNA sequence matching, and sorted database index lookups.",
    analogyTitle: "Two Pointers: Meeting in the Middle",
    analogyText:
      "Place one finger on the **first item** (`left = 0`) and your other finger on the **last item** (`right = len(arr) - 1`).\n\nEach step, compare what your two fingers are pointing at, then move them one step closer toward the center (`left += 1`, `right -= 1`) until they meet!",
    cheatSheet: `left = 0
right = len(items) - 1

while left < right:
    # Compare items[left] and items[right]
    left += 1
    right -= 1`,
    quiz: {
      question: "When should a two-pointer `while` loop stop moving inward?",
      options: [
        "When `left < right` is no longer true (the pointers meet or cross)",
        "After exactly 2 iterations",
        "When `left == 0`",
      ],
      correctIndex: 0,
      explanation:
        "Once `left >= right`, you've already inspected every pair from the outside in!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 6,
    matchKeywords: ["frequency", "count", "most", "active", "tally"],
    realWorldUse:
      "Used by Twitter/X to find trending hashtags, Spotify Wrapped to count your top artist, and spam detectors.",
    analogyTitle: "Frequency Map: Tally Marks on a Scoreboard",
    analogyText:
      "How do you count how many times each word appears in a list in a single pass?\n\nUse a dictionary as a scoreboard! For every item `x` you see, look up its current count with `counts.get(x, 0)` (which gives `0` the first time) and add `1`: `counts[x] = counts.get(x, 0) + 1`.",
    cheatSheet: `counts = {}
for item in items:
    counts[item] = counts.get(item, 0) + 1

# Example: {"alex": 3, "sam": 1}`,
    quiz: {
      question:
        'What does `counts.get("alex", 0)` return if `"alex"` is NOT in the dictionary yet?',
      options: ["0 (the default value)", "It crashes with KeyError", "None"],
      correctIndex: 0,
      explanation:
        "The second argument to `.get(key, default)` is returned whenever the key isn't in the dictionary yet!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 7,
    matchKeywords: ["sliding", "window", "subarray", "consecutive", "spike"],
    realWorldUse:
      "Used in network monitoring (5-minute traffic averages), stock chart moving averages, and video streaming buffers.",
    analogyTitle: "Sliding a Picture Frame Across a Wall",
    analogyText:
      "Imagine finding the highest sum of any `k` consecutive numbers in a list.\n\nInstead of re-adding all `k` numbers from scratch at every position, slide your window one step right: **add the new number entering on the right**, and **subtract the old number leaving on the left**!",
    cheatSheet: `# Sum of first window of size k:
window_sum = sum(nums[:k])
best = window_sum

for i in range(k, len(nums)):
    window_sum += nums[i] - nums[i - k]
    best = max(best, window_sum)`,
    quiz: {
      question:
        "When a window of size `k` slides 1 step to the right, how many numbers enter and leave the window?",
      options: [
        "1 new number enters on the right, 1 old number leaves on the left",
        "All k numbers are recalculated from zero",
        "The window doubles in size",
      ],
      correctIndex: 0,
      explanation:
        "Updating the sum with `+ entering - leaving` takes O(1) constant time per step!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 8,
    matchKeywords: ["stack", "bracket", "valid", "parentheses", "lifo"],
    realWorldUse:
      "Used in code editors (syntax highlighting & linting), browser Back buttons, and Undo/Redo history.",
    analogyTitle: "A Stack Is a Stack of Cafeteria Plates",
    analogyText:
      "A **Stack** follows **Last-In, First-Out (LIFO)**: the last plate you put on top is the first one you take off.\n\n• When you see an opening bracket `(`, **push** it onto the stack (`stack.append(ch)`).\n• When you see a closing bracket `)`, **pop** the top of the stack (`stack.pop()`) and check that they match!",
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
      question: "What does LIFO (Last-In, First-Out) mean in a Stack?",
      options: [
        "The most recently added item is the first one removed",
        "Items are removed in alphabetical order",
        "The oldest item at index 0 is removed first",
      ],
      correctIndex: 0,
      explanation:
        "`stack.append()` pushes to the top (end), and `stack.pop()` removes that exact most recent item!",
    },
  },

  // ============================================================================
  // TRACK 3: SYSTEM DESIGN
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 1,
    matchKeywords: ["cache", "caching", "redis", "lru", "memory", "load"],
    realWorldUse:
      "Used by Instagram, YouTube, and TikTok to serve viral posts in <5 milliseconds from RAM instead of querying slow disk databases millions of times.",
    analogyTitle: "Caching Is Keeping Snacks on Your Desk",
    analogyText:
      "Fetching data from a main database is like driving to the grocery store (slow, expensive). A **Cache** is a small snack drawer right on your desk (ultra-fast RAM).\n\n1. **Cache Hit:** The data is already in your drawer — return it immediately!\n2. **Cache Miss:** Fetch it from the store once, save a copy in your drawer, and return it.",
    cheatSheet: `def get_data(key, cache, db):
    # 1. Check fast cache first (Cache Hit)
    if key in cache:
        return cache[key]
    
    # 2. Fallback to database & save in cache (Cache Miss)
    val = db.get(key)
    cache[key] = val
    return val`,
    quiz: {
      question: "What is a 'Cache Hit'?",
      options: [
        "When the requested data is found immediately in fast cache memory",
        "When the cache server crashes from too much traffic",
        "When the database deletes old rows",
      ],
      correctIndex: 0,
      explanation:
        "A Cache Hit means the data was already in fast memory, saving an expensive trip to the database!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 4,
    matchKeywords: ["round-robin", "round robin", "load balancer", "route"],
    realWorldUse:
      "Used by NGINX, Cloudflare, and AWS Application Load Balancers to distribute millions of requests across server fleets.",
    analogyTitle: "Dealing Cards Around a Table",
    analogyText:
      "How does a **Round-Robin Load Balancer** share requests fairly across 3 servers?\n\nJust like dealing cards in a circle: Request 0 goes to Server 0, Request 1 to Server 1, Request 2 to Server 2, and Request 3 wraps right back around to Server 0 using the **modulo operator (`%`)**: `index = request_num % len(servers)`!",
    cheatSheet: `def pick_server(servers, request_index):
    # Modulo (%) wraps around automatically!
    slot = request_index % len(servers)
    return servers[slot]`,
    quiz: {
      question:
        "If you have 3 servers and `request_index` is `3`, what is `3 % 3`?",
      options: [
        "0 (it wraps back to the first server at index 0)",
        "3 (index out of bounds)",
        "1",
      ],
      correctIndex: 0,
      explanation:
        "`3 divided by 3` has a remainder of `0`, so `3 % 3 == 0` — wrapping cleanly back to the first server!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 5,
    matchKeywords: ["shard", "sharding", "partition", "database"],
    realWorldUse:
      "Used by Discord, Instagram, and Uber when a single database table grows too large (billions of rows) to fit on one machine.",
    analogyTitle: "Splitting an Encyclopedia Into Volumes A–Z",
    analogyText:
      "When one database gets too full, **Database Sharding** splits the data across multiple smaller databases (**shards**).\n\nTo know which shard holds `user_id = 42`, we compute `shard_id = user_id % num_shards`. That way, we always know the exact database to query without searching all of them!",
    cheatSheet: `def get_shard_name(user_id, num_shards):
    shard_index = user_id % num_shards
    return f"shard_{shard_index}"`,
    quiz: {
      question:
        "Why must the sharding formula (`user_id % num_shards`) always give the exact same answer for the same `user_id`?",
      options: [
        "So we can find that user's data later on the exact same shard",
        "To use more CPU power",
        "So every shard stores a duplicate copy of every user",
      ],
      correctIndex: 0,
      explanation:
        "Deterministic routing ensures writes and reads for User #42 always go to the exact same database shard!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 6,
    matchKeywords: ["circuit", "breaker", "health", "failover", "outage"],
    realWorldUse:
      "Used by Netflix Hystrix and Stripe to stop a slow or failing microservice from freezing the entire app.",
    analogyTitle: "A Home Electrical Circuit Breaker for APIs",
    analogyText:
      "If a third-party service crashes, continuing to send it 10,000 requests per second will freeze your own servers waiting for timeouts.\n\nA **Circuit Breaker** counts recent failures:\n• If `failures >= threshold`, the circuit trips **`\"OPEN\"`** (blocking calls immediately and returning a fast fallback).\n• Otherwise, it stays **`\"CLOSED\"`** (normal traffic flows).",
    cheatSheet: `def check_circuit_state(failures, threshold):
    if failures >= threshold:
        return "OPEN"
    return "CLOSED"`,
    quiz: {
      question:
        "In System Design, what does an `OPEN` circuit breaker mean?",
      options: [
        "The circuit has tripped due to errors — requests are blocked immediately to protect the system",
        "All requests are allowed through with zero limits",
        "The server was deleted",
      ],
      correctIndex: 0,
      explanation:
        "Just like an electrical circuit breaker in your house, when it trips `OPEN`, current stops flowing until the fault recovers!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 7,
    matchKeywords: ["quorum", "consensus", "leader", "majority", "vote"],
    realWorldUse:
      "Used in Raft, Kubernetes (etcd), and distributed databases to agree on data even if some servers go offline.",
    analogyTitle: "Majority Vote: More Than Half the Room",
    analogyText:
      "In a distributed cluster of 5 servers, what if 2 servers lose power? Can the remaining 3 servers safely save data?\n\nYes — if they reach a **Quorum (strict majority)**: `yes_votes > total_nodes / 2`. With 5 nodes, at least 3 `True` votes are needed!",
    cheatSheet: `def has_quorum(votes):
    yes_count = sum(1 for v in votes if v is True)
    return yes_count > len(votes) / 2`,
    quiz: {
      question:
        "In a cluster of 5 servers, how many `True` votes are required to reach a strict majority (quorum)?",
      options: ["At least 3 out of 5", "1 out of 5", "All 5 out of 5"],
      correctIndex: 0,
      explanation:
        "Half of 5 is 2.5, so the smallest whole number strictly greater than 2.5 is 3 servers!",
    },
  },
  // ============================================================================
  // NEW EXPANSION ENRICHMENTS (MODULES 09 - 12 ACROSS ALL 3 TRACKS)
  // ============================================================================
  {
    matchTrack: "python_basics",
    matchOrder: 9,
    matchKeywords: ["comprehension", "playlist", "transform"],
    realWorldUse:
      "Used in data pipelines, FastAPI backends, and ML scripts to filter and transform lists in one readable line.",
    analogyTitle: "An Assembly Line Inside Square Brackets",
    analogyText:
      "A **List Comprehension** packs a `for` loop and an optional `if` filter into a single `[ ... ]` expression:\n\n• `[expression for item in list if condition]`\n• It reads like plain English: *\"Give me `n * 2` for every `n` in `nums` if `n > 0`.\"*",
    cheatSheet: `nums = [1, 2, 3, 4, 5]

# Keep only even numbers and square them:
squared_evens = [n * n for n in nums if n % 2 == 0]
print(squared_evens)  # [4, 16]`,
    commonPitfall: {
      title: "Putting the 'if' filter in the wrong spot",
      wrongCode: "[if x >= 180: x for x in tracks]",
      rightCode: "[x for x in tracks if x >= 180]",
      explanation:
        "In a filter comprehension, the `if condition` always goes at the very end, right after `for item in list`!",
    },
    guidedCode: `def filter_long_tracks(durations):
    # STEP 1: Use a list comprehension to keep durations >= 180
    # Pattern: [d for d in durations if ...]
    return [d for d in durations if d >= 180]

print(filter_long_tracks([120, 210, 180, 95, 240]))`,
    quiz: {
      question: "What does `[x * 10 for x in [1, 2, 3] if x > 1]` evaluate to?",
      options: ["[20, 30]", "[10, 20, 30]", "[2, 3]"],
      correctIndex: 0,
      explanation:
        "Only `2` and `3` pass `x > 1`, and each one is multiplied by `10` to produce `[20, 30]`!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 10,
    matchKeywords: ["set", "unique", "duplicate", "vip"],
    realWorldUse:
      "Used in event ticket scanners, email deduplication, and fast permission checks.",
    analogyTitle: "A VIP Club Wristband List (No Duplicates Allowed)",
    analogyText:
      "A Python **`set`** is a collection that automatically throws away duplicates. Even if `" +
      "`\"alex\"`" +
      " appears 5 times in a list, converting it with `set(items)` keeps only one copy!",
    cheatSheet: `badges = ["gold", "silver", "gold", "bronze"]

# Remove duplicates & sort alphabetically:
unique_sorted = sorted(set(badges))
print(unique_sorted)  # ['bronze', 'gold', 'silver']`,
    commonPitfall: {
      title: "Creating an empty set with {} instead of set()",
      wrongCode: "seen = {}  # This creates an empty dict, not a set!",
      rightCode: "seen = set()  # Creates an empty set",
      explanation:
        "Empty curly braces `{}` always create a dictionary in Python. Use `set()` for an empty set!",
    },
    guidedCode: `def unique_Sorted_tickets(tickets):
    # STEP 1: Convert tickets to a set to remove duplicates, then wrap in sorted()
    return sorted(set(tickets))

print(unique_Sorted_tickets(["VIP-2", "VIP-1", "VIP-2", "VIP-3"]))`,
    quiz: {
      question: "What is `len(set([10, 20, 10, 30, 20]))`?",
      options: ["3 (only unique values 10, 20, 30 are kept)", "5", "0"],
      correctIndex: 0,
      explanation:
        "`set()` removes the duplicate `10` and `20`, leaving `{10, 20, 30}` with length 3!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 11,
    matchKeywords: ["class", "object", "oop", "hero", "init"],
    realWorldUse:
      "Used in game engines, UI frameworks, and database models (ORMs) to bundle data and behavior together.",
    analogyTitle: "A Class Is a Cookie Cutter; Objects Are the Cookies",
    analogyText:
      "A **`class`** is a blueprint. When you call `Hero(\"Aria\", 100)`, Python runs `__init__(self, ...)` to stamp out a brand-new object with its own `self.name` and `self.hp`!",
    cheatSheet: `class Hero:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def heal(self, amount):
        self.hp += amount
        return self.hp`,
    commonPitfall: {
      title: "Forgetting 'self.' when storing attributes in __init__",
      wrongCode: "def __init__(self, name):\n    name = name  # Lost as soon as __init__ finishes!",
      rightCode: "def __init__(self, name):\n    self.name = name  # Saved on the object!",
      explanation:
        "Attaching `self.` saves the variable onto the object instance so other methods can use it later.",
    },
    guidedCode: `class ArcadeFighter:
    def __init__(self, name, energy):
        self.name = name
        self.energy = energy

    def boost(self, bonus):
        # Add bonus to self.energy and return the new energy:
        self.energy += bonus
        return self.energy

p1 = ArcadeFighter("Nova", 50)
print(p1.boost(25))`,
    quiz: {
      question: "What is the role of `self` inside a Python class method?",
      options: [
        "It refers to the specific object instance the method was called on",
        "It makes all variables global across the whole file",
        "It is optional and never needed in Python",
      ],
      correctIndex: 0,
      explanation:
        "`self` lets an object read and update its own attributes (`self.energy`) without mixing them up with other objects!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 12,
    matchKeywords: ["nested", "json", "api", "weather", "extract"],
    realWorldUse:
      "Every REST API (OpenAI, Stripe, GitHub, Weather) returns nested dictionaries containing lists of dictionaries.",
    analogyTitle: "Opening Nested Boxes One Label at a Time",
    analogyText:
      "When data is nested like `response[\"data\"][\"forecast\"][0][\"temp\"]`, read it left-to-right: each `[\"key\"]` opens a dictionary drawer, and each `[0]` picks a numbered slot in a list!",
    cheatSheet: `payload = {
    "station": "TOKYO-01",
    "readings": [{"temp": 22}, {"temp": 26}]
}

# Average the 'temp' values inside payload["readings"]:
temps = [r["temp"] for r in payload["readings"]]
print(max(temps))  # 26`,
    commonPitfall: {
      title: "Using a string key on a list instead of looping or indexing",
      wrongCode: 'payload["readings"]["temp"]  # TypeError: list indices must be integers!',
      rightCode: '[r["temp"] for r in payload["readings"]]',
      explanation:
        '`payload["readings"]` is a list `[...]`, so you must loop over its items or index `[0]` before accessing `["temp"]`!',
    },
    guidedCode: `def highest_temperature(report):
    # report["hourly"] is a list of dicts like {"hour": 1, "temp": 19}
    temps = [entry["temp"] for entry in report["hourly"]]
    return max(temps)

sample = {"city": "Seoul", "hourly": [{"temp": 18}, {"temp": 24}, {"temp": 21}]}
print(highest_temperature(sample))`,
    quiz: {
      question: 'Given `data = {"users": [{"name": "Kai"}]}`, how do you access `"Kai"`?',
      options: [
        'data["users"][0]["name"]',
        'data["users"]["name"]',
        'data[0]["users"]["name"]',
      ],
      correctIndex: 0,
      explanation:
        '`data["users"]` gets the list, `[0]` grabs the first dictionary in that list, and `["name"]` reads `"Kai"`!',
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 9,
    matchKeywords: ["binary search", "sorted", "midpoint", "halve"],
    realWorldUse:
      "Used by `git bisect` to find a buggy commit in 10 steps across 1,000 commits, and in database B-Tree indexes.",
    analogyTitle: "Guessing a Number Between 1 and 100 by Always Picking the Middle",
    analogyText:
      "If a list is **sorted**, never scan from index 0! Check the **middle index** (`mid = (left + right) // 2`).\n\n• If `nums[mid] < target`, the answer MUST be in the right half (`left = mid + 1`).\n• If `nums[mid] > target`, the answer MUST be in the left half (`right = mid - 1`).",
    cheatSheet: `left, right = 0, len(nums) - 1
while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        return mid
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1`,
    commonPitfall: {
      title: "Using '/' (float division) instead of '//' (integer division) for mid",
      wrongCode: "mid = (left + right) / 2   # Produces 2.5 -> TypeError!",
      rightCode: "mid = (left + right) // 2  # Produces integer index 2",
      explanation:
        "List indices must be whole integers! Always use floor division `//` when calculating `mid`.",
    },
    guidedCode: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    quiz: {
      question: "What precondition MUST be true before you can run Binary Search on a list?",
      options: [
        "The list must be sorted in order",
        "The list must contain only prime numbers",
        "The list must have fewer than 10 items",
      ],
      correctIndex: 0,
      explanation:
        "Binary search relies on sorted order so comparing `nums[mid]` tells you which half to discard!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 10,
    matchKeywords: ["interval", "merge", "overlap", "calendar"],
    realWorldUse:
      "Used by Google Calendar and Apple Calendar to combine overlapping busy blocks into clean free/busy timelines.",
    analogyTitle: "Combining Overlapping Sticky Notes on a Timeline",
    analogyText:
      "First, **sort intervals by start time** (`intervals.sort(key=lambda x: x[0])`).\n\nThen compare each `[start, end]` with the last merged interval `merged[-1]`:\n• If `start <= merged[-1][1]`, they overlap! Extend the end: `merged[-1][1] = max(merged[-1][1], end)`.\n• Otherwise, append `[start, end]` as a new block.",
    cheatSheet: `intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]

for start, end in intervals[1:]:
    if start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])`,
    commonPitfall: {
      title: "Replacing the end time without max() when one interval is inside another",
      wrongCode: "merged[-1][1] = end  # Breaks on [1, 10] and [2, 5]!",
      rightCode: "merged[-1][1] = max(merged[-1][1], end)",
      explanation:
        "If `[1, 10]` is followed by `[2, 5]`, the merged block still ends at `10`, not `5`!",
    },
    guidedCode: `def merge_intervals(intervals):
    if not intervals:
        return []
    intervals = sorted(intervals, key=lambda x: x[0])
    merged = [list(intervals[0])]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    quiz: {
      question: "What does `[1, 4]` and `[2, 6]` merge into?",
      options: ["[1, 6]", "[1, 2, 4, 6]", "[2, 4]"],
      correctIndex: 0,
      explanation:
        "Since `2 <= 4`, the two blocks overlap and combine into a single continuous window `[1, 6]`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 11,
    matchKeywords: ["bfs", "breadth", "queue", "shortest", "graph"],
    realWorldUse:
      "Used in LinkedIn ('2nd-degree connection'), GPS shortest-hop routing, and web crawlers.",
    analogyTitle: "Ripples Spreading Outward in a Pond",
    analogyText:
      "**Breadth-First Search (BFS)** explores a graph wave by wave using a **FIFO Queue** (`pop(0)`):\n\n• Wave 1 checks all direct neighbors (distance 1).\n• Wave 2 checks their neighbors (distance 2).\n• A `visited` set ensures you never walk in infinite circles!",
    cheatSheet: `queue = [(start, 0)]
visited = {start}

while queue:
    node, dist = queue.pop(0)
    if node == target:
        return dist
    for nxt in graph.get(node, []):
        if nxt not in visited:
            visited.add(nxt)
            queue.append((nxt, dist + 1))`,
    commonPitfall: {
      title: "Forgetting to track visited nodes in graphs with cycles",
      wrongCode: "for nxt in graph[node]:\n    queue.append((nxt, dist + 1))  # Infinite loop!",
      rightCode: "if nxt not in visited:\n    visited.add(nxt)\n    queue.append((nxt, dist + 1))",
      explanation:
        "If Alice knows Bob and Bob knows Alice, BFS will bounce between them forever unless you check `visited`!",
    },
    guidedCode: `def shortest_hops(graph, start, target):
    queue = [(start, 0)]
    visited = {start}
    while queue:
        node, hops = queue.pop(0)
        if node == target:
            return hops
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, hops + 1))
    return -1`,
    quiz: {
      question: "Why does BFS guarantee finding the shortest number of hops in an unweighted graph?",
      options: [
        "Because a queue explores all nodes at distance d before any node at distance d + 1",
        "Because it sorts node names alphabetically",
        "Because it jumps randomly until it gets lucky",
      ],
      correctIndex: 0,
      explanation:
        "By exploring level-by-level in First-In, First-Out order, the first time BFS reaches `target` is guaranteed to be the shortest path!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 12,
    matchKeywords: ["dynamic", "dp", "stairs", "memo", "fibonacci"],
    realWorldUse:
      "Used in spellcheckers (edit distance), diff algorithms (`git diff`), and route optimization.",
    analogyTitle: "Building the Next Floor From the Two Floors Below It",
    analogyText:
      "To reach step `n` when you can climb `1` or `2` steps at a time, your last move came from either step `n - 1` or step `n - 2`.\n\nSo `ways(n) = ways(n - 1) + ways(n - 2)`! By remembering the last two answers (`prev2, prev1`), you solve it in $O(n)$ time!",
    cheatSheet: `def climb_stairs(n):
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`,
    commonPitfall: {
      title: "Using naive recursion without caching (O(2^n) time limit exceeded)",
      wrongCode: "return climb(n - 1) + climb(n - 2)  # Recomputes subproblems millions of times!",
      rightCode: "prev2, prev1 = prev1, prev2 + prev1  # O(n) single loop!",
      explanation:
        "Storing previous results avoids recalculating the same subproblems over and over.",
    },
    guidedCode: `def climb_ways(n):
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`,
    quiz: {
      question: "If there are 2 ways to reach step 2 and 3 ways to reach step 3, how many ways are there to reach step 4?",
      options: ["5 ways (2 + 3)", "6 ways", "4 ways"],
      correctIndex: 0,
      explanation:
        "Every path to step 4 comes from either step 2 (plus a 2-step jump) or step 3 (plus a 1-step jump): `2 + 3 = 5`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 9,
    matchKeywords: ["backoff", "exponential", "retry", "timeout"],
    realWorldUse:
      "Used in AWS SDKs, Stripe webhooks, and mobile apps so recovering servers aren't hammered by instant retry storms.",
    analogyTitle: "Waiting Longer Between Knocks When Someone Is Busy",
    analogyText:
      "If a server fails, retrying every 1 millisecond from 100,000 phones causes a **Retry Storm**.\n\n**Exponential Backoff** doubles the wait time after each failure (`base_delay * (2 ** attempt)`), capped at a safe `max_delay`!",
    cheatSheet: `def get_backoff_delay(attempt, base_delay, max_delay):
    raw_delay = base_delay * (2 ** attempt)
    return min(raw_delay, max_delay)`,
    commonPitfall: {
      title: "Using '^' (bitwise XOR) instead of '**' (exponentiation) in Python",
      wrongCode: "delay = base * (2 ^ attempt)   # '^' is XOR in Python!",
      rightCode: "delay = base * (2 ** attempt)  # '**' is power/exponent!",
      explanation:
        "In Python, `2 ** 3` is `8` ($2^3$), whereas `2 ^ 3` performs bitwise XOR (`1`)!",
    },
    guidedCode: `def compute_backoff_ms(attempt, base_ms, max_ms):
    # Compute base_ms * (2 ** attempt), capped at max_ms using min()
    delay = base_ms * (2 ** attempt)
    return min(delay, max_ms)`,
    quiz: {
      question: "With `base_ms = 100` and `attempt = 3`, what is `100 * (2 ** 3)`?",
      options: ["800 ms", "600 ms", "300 ms"],
      correctIndex: 0,
      explanation:
        "`2 ** 3` is `8`, so `100 * 8 = 800 ms`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 10,
    matchKeywords: ["queue", "dead", "dlq", "worker", "job"],
    realWorldUse:
      "Used in RabbitMQ, AWS SQS, and Kafka to isolate poison-pill messages that fail repeatedly into a Dead-Letter Queue (DLQ).",
    analogyTitle: "Moving Undeliverable Packages to Customer Service",
    analogyText:
      "If a background worker crashes on a corrupted job, leaving it at the front of the main queue blocks every job behind it!\n\nA **Dead-Letter Queue (DLQ)** checks each job's `attempts`: if `attempts >= max_retries`, route it to `\"DLQ\"` for engineers to inspect; otherwise route it to `\"RETRY_QUEUE\"`.",
    cheatSheet: `def route_failed_job(attempts, max_retries):
    if attempts >= max_retries:
        return "DLQ"
    return "RETRY_QUEUE"`,
    commonPitfall: {
      title: "Using '>' instead of '>=' on the max retry threshold",
      wrongCode: "if attempts > max_retries: return 'DLQ'",
      rightCode: "if attempts >= max_retries: return 'DLQ'",
      explanation:
        "Once a job has reached `max_retries` failed attempts, it has exhausted its budget and belongs in the DLQ.",
    },
    guidedCode: `def classify_jobs(jobs, max_retries):
    # Return a dict {"retry": [...], "dlq": [...]} of job IDs
    result = {"retry": [], "dlq": []}
    for job in jobs:
        if job["attempts"] >= max_retries:
            result["dlq"].append(job["id"])
        else:
            result["retry"].append(job["id"])
    return result`,
    quiz: {
      question: "Why do production message queues use a Dead-Letter Queue (DLQ)?",
      options: [
        "So a permanently broken job doesn't block healthy jobs in an infinite retry loop",
        "To delete all database backups automatically",
        "To make network cables shorter",
      ],
      correctIndex: 0,
      explanation:
        "Quarantining poison messages in a DLQ keeps the main worker pipeline flowing smoothly while preserving the failed payload for debugging!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 11,
    matchKeywords: ["replica", "read", "write", "primary", "routing"],
    realWorldUse:
      "Used by PostgreSQL, MySQL, and Supabase to scale read-heavy apps (90% reads, 10% writes) across Read Replicas.",
    analogyTitle: "One Author Writing the Master Book, Many Photocopies for Readers",
    analogyText:
      "In a **Primary / Read-Replica** database cluster:\n\n• Every **`WRITE`** (`INSERT`, `UPDATE`, `DELETE`) MUST go to the **`\"primary\"`** node.\n• **`READ`** (`SELECT`) queries can be distributed across **`replicas`** (or fall back to `\"primary\"` if no replicas exist)!",
    cheatSheet: `def route_query(op_type, replicas, query_idx):
    if op_type == "WRITE" or not replicas:
        return "primary"
    return replicas[query_idx % len(replicas)]`,
    commonPitfall: {
      title: "Sending WRITE queries to a read-only replica",
      wrongCode: "return replicas[0]  # Crashes on INSERT/UPDATE!",
      rightCode: 'if op_type == "WRITE":\n    return "primary"',
      explanation:
        "Read replicas are read-only followers. All mutations must be committed to the Primary node first!",
    },
    guidedCode: `def route_db_query(op_type, replicas, query_id):
    if op_type == "WRITE" or len(replicas) == 0:
        return "primary"
    return replicas[query_id % len(replicas)]`,
    quiz: {
      question: "Where must all `WRITE` (`INSERT` / `UPDATE`) queries be routed in a Primary-Replica cluster?",
      options: [
        "Always to the Primary node",
        "To a random Read Replica",
        "To the browser's CSS file",
      ],
      correctIndex: 0,
      explanation:
        "The Primary database is the single source of truth for writes, which then replicate asynchronously to Read Replicas!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 12,
    matchKeywords: ["consistent", "ring", "hash ring", "clockwise"],
    realWorldUse:
      "Used in Amazon DynamoDB, Apache Cassandra, and Discord to add or remove servers without invalidating the entire cache.",
    analogyTitle: "Walking Clockwise Around a Clock Face",
    analogyText:
      "With modulo sharding (`key % N`), adding 1 server changes `N` and reshuffles ~90% of keys!\n\n**Consistent Hashing** places servers at sorted positions on a circle (e.g., `[20, 50, 80]`). A key at position `35` walks **clockwise** to the first server with `pos >= key_pos` (`50`). If `key_pos` is past the last server (`90`), it wraps around to the first server (`20`)!",
    cheatSheet: `def find_ring_node(ring_positions, key_pos):
    for node_pos in sorted(ring_positions):
        if node_pos >= key_pos:
            return node_pos
    return sorted(ring_positions)[0]  # Wrap around 0°`,
    commonPitfall: {
      title: "Forgetting to wrap around to the first node when key_pos > max(ring)",
      wrongCode: "return None  # Fails when key_pos is 90 and ring is [20, 50, 80]!",
      rightCode: "return sorted_ring[0]  # Wraps around the circle to 20!",
      explanation:
        "A hash ring is a closed circle: any key past the highest server position wraps right back around to the smallest server position!",
    },
    guidedCode: `def locate_ring_server(ring_nodes, key_hash):
    ordered = sorted(ring_nodes)
    for node in ordered:
        if node >= key_hash:
            return node
    return ordered[0]`,
    quiz: {
      question: "On a sorted hash ring `[10, 40, 80]`, which node handles a key at position `95`?",
      options: [
        "Node 10 (wraps clockwise past 100/0 to the first node)",
        "Node 80",
        "No node can handle it",
      ],
      correctIndex: 0,
      explanation:
        "Since `95` is greater than `80`, walking clockwise around the ring wraps past `0` and lands on the first node at `10`!",
    },
  },
];

function attachDefaultPitfallAndGuided(
  item: LessonEnrichment,
  track: "python_basics" | "algorithms" | "system_design",
  initialCode?: string,
): LessonEnrichment {
  const defaultPitfall: CommonPitfall =
    track === "algorithms"
      ? {
          title: "Returning inside the loop on the first iteration by mistake",
          wrongCode: "for x in nums:\n    return x  # Stops after checking only 1 item!",
          rightCode: "for x in nums:\n    if matches(x): return x\nreturn default",
          explanation:
            "Make sure your final fallback `return` is unindented outside the `for` loop so every item gets checked!",
        }
      : track === "system_design"
        ? {
            title: "Not handling edge cases like 0 requests or empty server lists",
            wrongCode: "slot = req_id % len(servers)  # Crashes if servers is empty!",
            rightCode: "if not servers:\n    return fallback\nslot = req_id % len(servers)",
            explanation:
              "Production systems always check guard conditions (`if not servers:`) before dividing or indexing.",
          }
        : {
            title: "Confusing '=' (assignment) with '==' (comparison) or forgetting ':'",
            wrongCode: "if score = 100   # SyntaxError: missing ':' and single '='",
            rightCode: "if score == 100: # Uses '==' and ends with ':'",
            explanation:
              "Use `=` to store a value in a variable, `==` to compare two values, and always end `if`/`for`/`def` lines with a colon `:`!",
          };

  const cleanStarter = (initialCode || "").replace(/\\n/g, "\n").trim();
  const defaultGuided =
    item.guidedCode ||
    (cleanStarter
      ? `${cleanStarter}\n\n# GUIDED PATTERN REFERENCE:\n${item.cheatSheet
          .split("\n")
          .map((l) => (l.startsWith("#") ? l : `#   ${l}`))
          .join("\n")}`
      : item.cheatSheet);

  return {
    ...item,
    commonPitfall: item.commonPitfall || defaultPitfall,
    guidedCode: defaultGuided,
  };
}

// Fallback enrichment for any lesson that doesn't match a specific rule above
export function getLessonEnrichment(lesson: {
  title?: string;
  track?: string;
  lesson_order?: number;
  initial_code?: string;
}): LessonEnrichment {
  const titleLower = (lesson.title || "").toLowerCase();
  const track = (lesson.track || "python_basics") as
    | "python_basics"
    | "algorithms"
    | "system_design";

  // 1. Try matching by track + order first when order >= 9 (our new expansion lessons)
  if ((lesson.lesson_order || 0) >= 9) {
    const byExpansionOrder = LESSON_ENRICHMENTS.find(
      (item) =>
        item.matchTrack === track && item.matchOrder === lesson.lesson_order,
    );
    if (byExpansionOrder) {
      return attachDefaultPitfallAndGuided(
        byExpansionOrder,
        track,
        lesson.initial_code,
      );
    }
  }

  // 2. Try matching by track + keyword
  const byKeyword = LESSON_ENRICHMENTS.find(
    (item) =>
      item.matchTrack === track &&
      item.matchKeywords.some((kw) => titleLower.includes(kw)),
  );
  if (byKeyword) {
    return attachDefaultPitfallAndGuided(byKeyword, track, lesson.initial_code);
  }

  // 3. Try matching by track + order
  const byOrder = LESSON_ENRICHMENTS.find(
    (item) => item.matchTrack === track && item.matchOrder === lesson.lesson_order,
  );
  if (byOrder) {
    return attachDefaultPitfallAndGuided(byOrder, track, lesson.initial_code);
  }

  // 4. Friendly track-aware default enrichment
  if (track === "algorithms") {
    return attachDefaultPitfallAndGuided(
      {
        realWorldUse:
          "Used in high-speed search engines, routing systems, and real-time analytics pipelines.",
        analogyTitle: "Work Smarter, Not Harder",
        analogyText:
          "Great algorithms are about organizing data so you never repeat unnecessary work. Instead of checking every possibility blindly, use the structure of the input (like sorting, pointers, or hash maps) to jump straight to the answer.",
        cheatSheet: `# Common Algorithm Pattern:
def solve(items):
    result = []
    for index, value in enumerate(items):
        # Process each item in O(n) single pass
        result.append(value)
    return result`,
        quiz: {
          question:
            "Which time complexity grows slower (stays faster) as the input list gets huge?",
          options: [
            "O(n) — single pass through the list",
            "O(n²) — nested loop checking every pair",
            "O(2ⁿ) — exponential growth",
          ],
          correctIndex: 0,
          explanation:
            "O(n) scales linearly: for 1,000 items it does ~1,000 steps, whereas O(n²) does 1,000,000 steps!",
        },
      },
      track,
      lesson.initial_code,
    );
  }

  if (track === "system_design") {
    return attachDefaultPitfallAndGuided(
      {
        realWorldUse:
          "Used by cloud platforms like AWS, Cloudflare, and Stripe to keep services fast and reliable under millions of requests per second.",
        analogyTitle: "Scaling From 1 Counter to a Supermarket",
        analogyText:
          "System Architecture is how we prevent a single computer from getting overwhelmed:\n\n• **Load Balancers** split traffic evenly across servers.\n• **Caches** remember frequent answers.\n• **Rate Limiters** stop bots from hogging the line.",
        cheatSheet: `# Distributed Systems State Pattern:
def handle_request(request_id, state):
    # 1. Validate limits / check fast state
    # 2. Route or process request
    # 3. Return deterministic response
    return True`,
        quiz: {
          question:
            "What is the main goal of adding a Load Balancer in front of multiple servers?",
          options: [
            "To distribute incoming traffic evenly so no single server is overloaded",
            "To make Python syntax run without indentation",
            "To store user passwords in plain text",
          ],
          correctIndex: 0,
          explanation:
            "A Load Balancer spreads requests across healthy servers so your app stays fast and online even during traffic spikes!",
        },
      },
      track,
      lesson.initial_code,
    );
  }

  return attachDefaultPitfallAndGuided(
    {
      realWorldUse:
        "Core Python building block used in web backends, AI scripts, automation, and data science.",
      analogyTitle: "Step-by-Step Recipe Instructions",
      analogyText:
        "Python reads your code from top to bottom, just like following a recipe. Break the problem into 3 tiny steps:\n\n1. **Setup:** Create or read your variables.\n2. **Action:** Update, loop, or check conditions.\n3. **Output:** `print()` or `return` the final result.",
      cheatSheet: `# Standard Python Recipe:
# 1. Define or update variables
# 2. Check logic or transform data
# 3. print() or return the final value`,
      quiz: {
        question:
          "How does Python know which lines belong inside a block (like `if`, `for`, or `def`)?",
        options: [
          "By indentation (4 spaces at the start of the line)",
          "By wrapping everything in curly braces { }",
          "By writing END at the bottom",
        ],
        correctIndex: 0,
        explanation:
          "Python uses clean 4-space indentation to group lines inside functions, loops, and if-statements!",
      },
    },
    track,
    lesson.initial_code,
  );
}


// ============================================================================
// 12 NEW INTERACTIVE EXPANSION LESSONS (MODULES 09 - 12 PER TRACK)
// ============================================================================
export const EXPANSION_LESSONS = [
  // --------------------------------------------------------------------------
  // PYTHON BASICS (MODULES 09 - 12)
  // --------------------------------------------------------------------------
  {
    id: "exp-py-09",
    title: "List Comprehensions: Playlist Filter",
    track: "python_basics",
    category: "PYTHONIC SYNTAX",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 9,
    is_free: true,
    description:
      "Transform and filter a list of song durations in a single expressive Python line.",
    content:
      "A **List Comprehension** lets you build a new list from an existing list in a single, super-readable line instead of writing a 4-line `for` loop with `.append()`.\n\n```python\n# Pattern: [expression for item in iterable if condition]\ndurations = [120, 210, 180, 95]\nlong_songs = [d for d in durations if d >= 180]\n# Result: [210, 180]\n```",
    assignment:
      "Complete `filter_long_tracks(durations)` so it returns a new list containing only the song durations that are **180 seconds or longer** (`>= 180`), keeping their original order.",
    constraints: [
      "Return a list of integers where each duration is >= 180",
      "Use a list comprehension `[d for d in durations if d >= 180]`",
      "Print the result of calling `filter_long_tracks([120, 210, 180, 95, 240])`",
    ],
    examples: [
      {
        input: "durations = [120, 210, 180, 95, 240]",
        output: "[210, 180, 240]",
        explanation: "Only 210, 180, and 240 are at least 180 seconds long.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def filter_long_tracks(durations):
    # Return a list of durations that are >= 180 using a list comprehension
    return []

print(filter_long_tracks([120, 210, 180, 95, 240]))`,
    expected_output: "[210, 180, 240]",
    hidden_tests: `import json
results = []
try:
    r1 = filter_long_tracks([120, 210, 180, 95, 240])
    results.append({"id": 1, "input": "[120, 210, 180, 95, 240]", "expected": "[210, 180, 240]", "actual": str(r1), "passed": r1 == [210, 180, 240]})
    r2 = filter_long_tracks([60, 100, 179])
    results.append({"id": 2, "input": "[60, 100, 179]", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    r3 = filter_long_tracks([180, 300])
    results.append({"id": 3, "input": "[180, 300]", "expected": "[180, 300]", "actual": str(r3), "passed": r3 == [180, 300]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "d = 120", value: "SKIP (<180)", address: "idx 0" },
      { label: "d = 210", value: "KEEP (210)", address: "idx 1" },
      { label: "d = 180", value: "KEEP (180)", address: "idx 2" },
      { label: "d = 95", value: "SKIP (<180)", address: "idx 3" },
      { label: "d = 240", value: "KEEP (240)", address: "idx 4" },
    ],
    hints: [
      "Inside `filter_long_tracks(durations)`, write: `return [d for d in durations if d >= 180]`.",
      "Make sure you keep the `print(filter_long_tracks([120, 210, 180, 95, 240]))` line at the bottom!",
    ],
  },
  {
    id: "exp-py-10",
    title: "Sets & Deduplication: VIP Scanner",
    track: "python_basics",
    category: "DATA STRUCTURES",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 10,
    is_free: true,
    description:
      "Use Python's `set()` to instantly strip duplicate ticket codes and sort the unique list.",
    content:
      "When scanning tickets at a live event, the same QR code might get scanned twice by accident. A Python **`set`** automatically removes every duplicate in $O(n)$ time!\n\n```python\nraw_codes = [\"VIP-2\", \"VIP-1\", \"VIP-2\"]\nunique_codes = sorted(set(raw_codes))\n# Result: ['VIP-1', 'VIP-2']\n```",
    assignment:
      "Complete `unique_sorted_tickets(tickets)` so it removes any duplicate ticket strings using `set()` and returns them in ascending alphabetical order using `sorted()`.",
    constraints: [
      "Remove all duplicate strings from `tickets`",
      "Return the unique ticket codes as a sorted list",
      "Print the result for `[\"VIP-2\", \"VIP-1\", \"VIP-2\", \"VIP-3\", \"VIP-1\"]`",
    ],
    examples: [
      {
        input: 'tickets = ["VIP-2", "VIP-1", "VIP-2", "VIP-3", "VIP-1"]',
        output: "['VIP-1', 'VIP-2', 'VIP-3']",
        explanation: "Duplicates are removed and the remaining 3 codes are sorted.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def unique_sorted_tickets(tickets):
    # Convert tickets to a set and return it as a sorted list
    return []

print(unique_sorted_tickets(["VIP-2", "VIP-1", "VIP-2", "VIP-3", "VIP-1"]))`,
    expected_output: "['VIP-1', 'VIP-2', 'VIP-3']",
    hidden_tests: `import json
results = []
try:
    r1 = unique_sorted_tickets(["VIP-2", "VIP-1", "VIP-2", "VIP-3", "VIP-1"])
    results.append({"id": 1, "input": "['VIP-2', 'VIP-1', 'VIP-2', 'VIP-3', 'VIP-1']", "expected": "['VIP-1', 'VIP-2', 'VIP-3']", "actual": str(r1), "passed": r1 == ["VIP-1", "VIP-2", "VIP-3"]})
    r2 = unique_sorted_tickets(["A", "A", "A"])
    results.append({"id": 2, "input": "['A', 'A', 'A']", "expected": "['A']", "actual": str(r2), "passed": r2 == ["A"]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "VIP-1", value: "UNIQUE ✓", address: "hash 0x01" },
      { label: "VIP-2", value: "UNIQUE ✓", address: "hash 0x02" },
      { label: "VIP-3", value: "UNIQUE ✓", address: "hash 0x03" },
    ],
    hints: [
      "`set(tickets)` removes all duplicates immediately.",
      "Wrap it in `sorted(set(tickets))` to get a sorted Python list back!",
    ],
  },
  {
    id: "exp-py-11",
    title: "Classes & Objects: Arcade Fighter",
    track: "python_basics",
    category: "OBJECT-ORIENTED PYTHON",
    difficulty: "Medium",
    tree_row: 9,
    lesson_order: 11,
    is_free: true,
    description:
      "Build a reusable `ArcadeFighter` class with `__init__` attributes and an energy boost method.",
    content:
      "**Classes** let you bundle data (**attributes** like `self.name` and `self.energy`) together with actions (**methods** like `boost()`) inside one clean blueprint.\n\n```python\nclass ArcadeFighter:\n    def __init__(self, name, energy):\n        self.name = name\n        self.energy = energy\n\n    def boost(self, bonus):\n        self.energy += bonus\n        return self.energy\n```",
    assignment:
      "Complete the `boost(self, bonus)` method inside `ArcadeFighter` so it adds `bonus` to `self.energy` and returns the updated `self.energy`.",
    constraints: [
      "Store `self.name` and `self.energy` in `__init__`",
      "In `boost(self, bonus)`, add `bonus` to `self.energy` and return `self.energy`",
      "Print the result of `p1.boost(25)` where `p1 = ArcadeFighter(\"Nova\", 50)`",
    ],
    examples: [
      {
        input: 'p1 = ArcadeFighter("Nova", 50); p1.boost(25)',
        output: "75",
        explanation: "50 initial energy + 25 bonus = 75.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `class ArcadeFighter:
    def __init__(self, name, energy):
        self.name = name
        self.energy = energy

    def boost(self, bonus):
        # Add bonus to self.energy and return the updated energy
        return self.energy

p1 = ArcadeFighter("Nova", 50)
print(p1.boost(25))`,
    expected_output: "75",
    hidden_tests: `import json
results = []
try:
    f1 = ArcadeFighter("Nova", 50)
    res1 = f1.boost(25)
    results.append({"id": 1, "input": "ArcadeFighter('Nova', 50).boost(25)", "expected": "75", "actual": str(res1), "passed": res1 == 75 and f1.energy == 75})
    res2 = f1.boost(10)
    results.append({"id": 2, "input": "Second boost(10) on same object", "expected": "85", "actual": str(res2), "passed": res2 == 85 and f1.energy == 85})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "p1.name", value: '"Nova"', type: "str", address: "0x7F10" },
      { label: "p1.energy (init)", value: "50", type: "int", address: "0x7F14" },
      { label: "p1.energy (boost)", value: "75", type: "int", address: "0x7F18" },
    ],
    hints: [
      "Inside `boost(self, bonus):`, update the attribute with `self.energy = self.energy + bonus` (or `self.energy += bonus`).",
      "Then `return self.energy`.",
    ],
  },
  {
    id: "exp-py-12",
    title: "Nested JSON Data: Weather Telemetry",
    track: "python_basics",
    category: "API DATA PARSING",
    difficulty: "Medium",
    tree_row: 10,
    lesson_order: 12,
    is_free: true,
    description:
      "Extract and aggregate readings from a nested dictionary-and-list API response.",
    content:
      "Real-world APIs (like weather stations, Stripe, or OpenAI) send back **nested JSON**: a dictionary containing a list of dictionaries.\n\n```python\nreport = {\n    \"city\": \"Seoul\",\n    \"hourly\": [{\"temp\": 18}, {\"temp\": 24}, {\"temp\": 21}]\n}\ntemps = [item[\"temp\"] for item in report[\"hourly\"]]\nmax_temp = max(temps)  # 24\n```",
    assignment:
      "Complete `highest_temperature(report)` so it inspects every dictionary inside `report[\"hourly\"]` and returns the highest `\"temp\"` value using `max()`.",
    constraints: [
      "Read the list of hourly readings from `report[\"hourly\"]`",
      "Extract each reading's `\"temp\"` and return the maximum temperature",
      "Print the result for the sample Seoul report (`24`)",
    ],
    examples: [
      {
        input: '{"city": "Seoul", "hourly": [{"temp": 18}, {"temp": 24}, {"temp": 21}]}',
        output: "24",
        explanation: "The temperatures are 18, 24, and 21; the maximum is 24.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def highest_temperature(report):
    # Extract all "temp" values from report["hourly"] and return the max
    return 0

sample = {"city": "Seoul", "hourly": [{"temp": 18}, {"temp": 24}, {"temp": 21}]}
print(highest_temperature(sample))`,
    expected_output: "24",
    hidden_tests: `import json
results = []
try:
    s1 = {"city": "Seoul", "hourly": [{"temp": 18}, {"temp": 24}, {"temp": 21}]}
    r1 = highest_temperature(s1)
    results.append({"id": 1, "input": "Seoul hourly [18, 24, 21]", "expected": "24", "actual": str(r1), "passed": r1 == 24})
    s2 = {"city": "Oslo", "hourly": [{"temp": -4}, {"temp": 2}, {"temp": -1}]}
    r2 = highest_temperature(s2)
    results.append({"id": 2, "input": "Oslo hourly [-4, 2, -1]", "expected": "2", "actual": str(r2), "passed": r2 == 2})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: 'report["city"]', value: '"Seoul"', type: "str", address: "0x8A00" },
      { label: 'hourly[0]["temp"]', value: "18", type: "int", address: "0x8A10" },
      { label: 'hourly[1]["temp"]', value: "24 (MAX)", type: "int", address: "0x8A20" },
      { label: 'hourly[2]["temp"]', value: "21", type: "int", address: "0x8A30" },
    ],
    hints: [
      "You can collect all temperatures with `temps = [entry[\"temp\"] for entry in report[\"hourly\"]]`.",
      "Then return `max(temps)`!",
    ],
  },

  // --------------------------------------------------------------------------
  // ALGORITHMIC MASTERY (MODULES 09 - 12 — PRO TRACK)
  // --------------------------------------------------------------------------
  {
    id: "exp-alg-09",
    title: "Binary Search: Halving the Search Space",
    track: "algorithms",
    category: "DIVIDE & CONQUER",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Locate a target value in a sorted array in O(log n) time by halving the search interval each step.",
    content:
      "Scanning a sorted list of 1,000,000 items one by one takes up to 1,000,000 checks. **Binary Search** checks the middle element (`mid = (left + right) // 2`) and eliminates half the remaining elements on every single step — finding any item in at most **20 checks**!\n\n```python\nleft, right = 0, len(nums) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target:\n        return mid\n    elif nums[mid] < target:\n        left = mid + 1\n    else:\n        right = mid - 1\nreturn -1\n```",
    assignment:
      "Implement `binary_search(nums, target)` to return the index of `target` in the sorted list `nums`, or `-1` if it is not present.",
    constraints: [
      "Maintain `left` and `right` bounds and compute `mid = (left + right) // 2`",
      "Return `mid` when `nums[mid] == target`",
      "Return `-1` if the loop finishes without finding `target`",
    ],
    examples: [
      {
        input: "nums = [2, 5, 8, 12, 16, 23, 38], target = 16",
        output: "4",
        explanation: "16 is located at index 4.",
      },
    ],
    complexities: { time: "O(log n)", space: "O(1)" },
    initial_code: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    # Narrow the [left, right] range by comparing nums[mid] with target
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38], 16))`,
    expected_output: "4",
    hidden_tests: `import json
results = []
try:
    r1 = binary_search([2, 5, 8, 12, 16, 23, 38], 16)
    results.append({"id": 1, "input": "nums=[2,5,8,12,16,23,38], target=16", "expected": "4", "actual": str(r1), "passed": r1 == 4})
    r2 = binary_search([2, 5, 8, 12, 16, 23, 38], 5)
    results.append({"id": 2, "input": "nums=[2,5,8,12,16,23,38], target=5", "expected": "1", "actual": str(r2), "passed": r2 == 1})
    r3 = binary_search([2, 5, 8, 12, 16, 23, 38], 99)
    results.append({"id": 3, "input": "nums=[2,5,8,12,16,23,38], target=99", "expected": "-1", "actual": str(r3), "passed": r3 == -1})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "STEP 1: mid=3", value: "nums[3]=12 < 16", address: "left -> 4" },
      { label: "STEP 2: mid=5", value: "nums[5]=23 > 16", address: "right -> 4" },
      { label: "STEP 3: mid=4", value: "nums[4]=16 ✓", address: "FOUND idx 4" },
    ],
    hints: [
      "Loop `while left <= right:` and calculate `mid = (left + right) // 2`.",
      "If `nums[mid] < target`, move `left = mid + 1`; if `nums[mid] > target`, move `right = mid - 1`.",
    ],
  },
  {
    id: "exp-alg-10",
    title: "Merge Overlapping Intervals",
    track: "algorithms",
    category: "SORTING & INTERVALS",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Sort and coalesce overlapping calendar intervals into a clean non-overlapping timeline.",
    content:
      "When two calendar blocks overlap — like `[1, 4]` and `[2, 6]` — we can merge them into `[1, 6]`.\n\n1. Sort the intervals by start time: `intervals.sort(key=lambda x: x[0])`.\n2. Start with `merged = [list(intervals[0])]`.\n3. For each `[start, end]` in the rest, if `start <= merged[-1][1]`, update `merged[-1][1] = max(merged[-1][1], end)`. Otherwise, append `[start, end]`.",
    assignment:
      "Implement `merge_intervals(intervals)` to merge all overlapping `[start, end]` pairs and return the consolidated list.",
    constraints: [
      "Sort intervals by their start time first",
      "Merge adjacent intervals whenever `start <= merged[-1][1]`",
      "Use `max(merged[-1][1], end)` when extending an interval's end time",
    ],
    examples: [
      {
        input: "intervals = [[1, 3], [2, 6], [8, 10], [9, 12]]",
        output: "[[1, 6], [8, 12]]",
        explanation: "[1,3] & [2,6] merge into [1,6]; [8,10] & [9,12] merge into [8,12].",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def merge_intervals(intervals):
    if not intervals:
        return []
    intervals = sorted(intervals, key=lambda x: x[0])
    merged = [list(intervals[0])]
    # Loop through intervals[1:] and merge overlapping ranges
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [9, 12]]))`,
    expected_output: "[[1, 6], [8, 12]]",
    hidden_tests: `import json
results = []
try:
    r1 = merge_intervals([[1, 3], [2, 6], [8, 10], [9, 12]])
    results.append({"id": 1, "input": "[[1,3],[2,6],[8,10],[9,12]]", "expected": "[[1, 6], [8, 12]]", "actual": str(r1), "passed": r1 == [[1, 6], [8, 12]]})
    r2 = merge_intervals([[1, 10], [2, 5], [3, 7]])
    results.append({"id": 2, "input": "[[1,10],[2,5],[3,7]]", "expected": "[[1, 10]]", "actual": str(r2), "passed": r2 == [[1, 10]]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "[1, 3] + [2, 6]", value: "OVERLAP -> [1, 6]", address: "2 <= 3" },
      { label: "[8, 10] vs [1, 6]", value: "NEW -> [8, 10]", address: "8 > 6" },
      { label: "[8, 10] + [9, 12]", value: "OVERLAP -> [8, 12]", address: "9 <= 10" },
    ],
    hints: [
      "Loop with `for start, end in intervals[1:]:`.",
      "If `start <= merged[-1][1]:`, update `merged[-1][1] = max(merged[-1][1], end)`; else `merged.append([start, end])`.",
    ],
  },
  {
    id: "exp-alg-11",
    title: "Breadth-First Search: Shortest Hops",
    track: "algorithms",
    category: "GRAPH ALGORITHMS",
    difficulty: "Hard",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      "Find the minimum number of network hops between two nodes using a BFS queue and visited set.",
    content:
      "**Breadth-First Search (BFS)** explores a graph in concentric waves using a **Queue**.\n\n```python\nqueue = [(start, 0)]\nvisited = {start}\nwhile queue:\n    node, hops = queue.pop(0)\n    if node == target:\n        return hops\n    for neighbor in graph.get(node, []):\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append((neighbor, hops + 1))\nreturn -1\n```",
    assignment:
      "Implement `shortest_hops(graph, start, target)` to return the minimum number of edges between `start` and `target`, or `-1` if unreachable.",
    constraints: [
      "Use a queue initialized with `[(start, 0)]` and a `visited = {start}` set",
      "Pop the front item with `queue.pop(0)` and return `hops` when `node == target`",
      "Return `-1` if the queue empties without reaching `target`",
    ],
    examples: [
      {
        input: 'graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"]}, start="A", target="E"',
        output: "3",
        explanation: "A -> B -> D -> E takes 3 hops.",
      },
    ],
    complexities: { time: "O(V + E)", space: "O(V)" },
    initial_code: `def shortest_hops(graph, start, target):
    queue = [(start, 0)]
    visited = {start}
    # Explore neighbors level by level using BFS
    return -1

net = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"], "E": []}
print(shortest_hops(net, "A", "E"))`,
    expected_output: "3",
    hidden_tests: `import json
results = []
try:
    net = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"], "E": []}
    r1 = shortest_hops(net, "A", "E")
    results.append({"id": 1, "input": "A -> E in diamond graph", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = shortest_hops(net, "A", "A")
    results.append({"id": 2, "input": "A -> A (0 hops)", "expected": "0", "actual": str(r2), "passed": r2 == 0})
    r3 = shortest_hops(net, "E", "A")
    results.append({"id": 3, "input": "E -> A (unreachable)", "expected": "-1", "actual": str(r3), "passed": r3 == -1})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "WAVE 0", value: "Node A (0 hops)", address: "queue=[A]" },
      { label: "WAVE 1", value: "Nodes B, C (1 hop)", address: "queue=[B,C]" },
      { label: "WAVE 2", value: "Node D (2 hops)", address: "queue=[D]" },
      { label: "WAVE 3", value: "Node E (3 hops ✓)", address: "TARGET FOUND" },
    ],
    hints: [
      "While `queue` is non-empty, unpack `node, hops = queue.pop(0)`.",
      "If `node == target: return hops`. Otherwise loop `for nxt in graph.get(node, []):` and enqueue unvisited neighbors with `hops + 1`.",
    ],
  },
  {
    id: "exp-alg-12",
    title: "Dynamic Programming: Staircase Combos",
    track: "algorithms",
    category: "DYNAMIC PROGRAMMING",
    difficulty: "Hard",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      "Count distinct ways to climb n stairs (taking 1 or 2 steps at a time) in O(n) time using DP state transition.",
    content:
      "To reach step `n`, your final step was either a **1-step hop from `n - 1`** or a **2-step jump from `n - 2`**.\n\nTherefore, `ways(n) = ways(n - 1) + ways(n - 2)`! Instead of slow $O(2^n)$ recursion, keep track of the last two values (`prev2, prev1 = 1, 2`) and roll forward in a single $O(n)$ loop.",
    assignment:
      "Implement `climb_ways(n)` to return the total number of distinct ways to reach the top of `n` stairs.",
    constraints: [
      "Return `n` directly when `n <= 2`",
      "Roll `prev2, prev1 = prev1, prev2 + prev1` from `3` up to `n`",
      "Return the result for `n = 6` (`13` ways)",
    ],
    examples: [
      {
        input: "n = 6",
        output: "13",
        explanation: "Steps 1..6 have 1, 2, 3, 5, 8, 13 distinct combinations.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def climb_ways(n):
    if n <= 2:
        return n
    # Track prev2 = 1 and prev1 = 2, then iterate from 3 to n
    return 0

print(climb_ways(6))`,
    expected_output: "13",
    hidden_tests: `import json
results = []
try:
    r1 = climb_ways(6)
    results.append({"id": 1, "input": "n = 6", "expected": "13", "actual": str(r1), "passed": r1 == 13})
    r2 = climb_ways(2)
    results.append({"id": 2, "input": "n = 2", "expected": "2", "actual": str(r2), "passed": r2 == 2})
    r3 = climb_ways(10)
    results.append({"id": 3, "input": "n = 10", "expected": "89", "actual": str(r3), "passed": r3 == 89})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "dp[1], dp[2]", value: "1, 2 ways", address: "base cases" },
      { label: "dp[3] = 1+2", value: "3 ways", address: "step 3" },
      { label: "dp[4] = 2+3", value: "5 ways", address: "step 4" },
      { label: "dp[5] = 3+5", value: "8 ways", address: "step 5" },
      { label: "dp[6] = 5+8", value: "13 ways ✓", address: "step 6" },
    ],
    hints: [
      "Initialize `prev2, prev1 = 1, 2`.",
      "Loop `for _ in range(3, n + 1): prev2, prev1 = prev1, prev2 + prev1` and return `prev1`.",
    ],
  },

  // --------------------------------------------------------------------------
  // SYSTEM ARCHITECTURE (MODULES 09 - 12 — PRO TRACK)
  // --------------------------------------------------------------------------
  {
    id: "exp-sys-09",
    title: "Exponential Backoff: Retry Storm Shield",
    track: "system_design",
    category: "RESILIENCE PATTERNS",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Calculate exponential retry delays capped at a maximum ceiling to prevent cascading retry storms.",
    content:
      "When a microservice has a brief hiccup, clients must not retry immediately in a tight loop. **Exponential Backoff** doubles the wait duration after each failed attempt (`base_ms * (2 ** attempt)`), capped at `max_ms`:\n\n```python\ndef compute_backoff_ms(attempt, base_ms, max_ms):\n    delay = base_ms * (2 ** attempt)\n    return min(delay, max_ms)\n```",
    assignment:
      "Implement `compute_backoff_ms(attempt, base_ms, max_ms)` so it returns `base_ms * (2 ** attempt)` capped at `max_ms`.",
    constraints: [
      "Compute exponential growth using `base_ms * (2 ** attempt)`",
      "Cap the returned value so it never exceeds `max_ms`",
      "Print the list of delays for attempts 0, 1, 2, 3, 4 with `base_ms=100, max_ms=1000`",
    ],
    examples: [
      {
        input: "attempts 0..4 with base_ms=100, max_ms=1000",
        output: "[100, 200, 400, 800, 1000]",
        explanation: "Attempt 4 is 1600ms, which gets capped at max_ms = 1000ms.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def compute_backoff_ms(attempt, base_ms, max_ms):
    # Return base_ms * (2 ** attempt), capped at max_ms
    return 0

print([compute_backoff_ms(a, 100, 1000) for a in range(5)])`,
    expected_output: "[100, 200, 400, 800, 1000]",
    hidden_tests: `import json
results = []
try:
    r1 = [compute_backoff_ms(a, 100, 1000) for a in range(5)]
    results.append({"id": 1, "input": "attempts 0..4 (base=100, max=1000)", "expected": "[100, 200, 400, 800, 1000]", "actual": str(r1), "passed": r1 == [100, 200, 400, 800, 1000]})
    r2 = compute_backoff_ms(0, 250, 5000)
    results.append({"id": 2, "input": "attempt=0, base=250, max=5000", "expected": "250", "actual": str(r2), "passed": r2 == 250})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "Attempt 0", value: "100 ms", address: "100 * 2^0" },
      { label: "Attempt 1", value: "200 ms", address: "100 * 2^1" },
      { label: "Attempt 2", value: "400 ms", address: "100 * 2^2" },
      { label: "Attempt 3", value: "800 ms", address: "100 * 2^3" },
      { label: "Attempt 4", value: "1000 ms (CAP)", address: "min(1600, 1000)" },
    ],
    hints: [
      "Use Python's exponent operator `**`: `raw = base_ms * (2 ** attempt)`.",
      "Use `min(raw, max_ms)` so the wait time never exceeds `max_ms`.",
    ],
  },
  {
    id: "exp-sys-10",
    title: "Message Queues & Dead-Letter Routing",
    track: "system_design",
    category: "ASYNC PIPELINES",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Separate retryable background jobs from poison-pill jobs that exceed max_retries into a Dead-Letter Queue (DLQ).",
    content:
      "In async worker queues (like AWS SQS or RabbitMQ), a corrupted job that crashes every time must not block healthy jobs forever.\n\n• If `job[\"attempts\"] >= max_retries`, route its ID to `result[\"dlq\"]`.\n• Otherwise, route its ID to `result[\"retry\"]`.",
    assignment:
      "Implement `classify_jobs(jobs, max_retries)` to partition job IDs into `{\"retry\": [...], \"dlq\": [...]}`.",
    constraints: [
      "Jobs with `attempts >= max_retries` go into `result[\"dlq\"]`",
      "Jobs with `attempts < max_retries` go into `result[\"retry\"]`",
      "Preserve the order of job IDs in each list",
    ],
    examples: [
      {
        input: 'jobs = [{"id": "J1", "attempts": 1}, {"id": "J2", "attempts": 3}], max_retries = 3',
        output: "{'retry': ['J1'], 'dlq': ['J2']}",
        explanation: "J2 reached 3 attempts so it moves to the Dead-Letter Queue.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def classify_jobs(jobs, max_retries):
    result = {"retry": [], "dlq": []}
    # Route each job["id"] to "dlq" if job["attempts"] >= max_retries else "retry"
    return result

batch = [{"id": "J1", "attempts": 1}, {"id": "J2", "attempts": 3}, {"id": "J3", "attempts": 4}]
print(classify_jobs(batch, 3))`,
    expected_output: "{'retry': ['J1'], 'dlq': ['J2', 'J3']}",
    hidden_tests: `import json
results = []
try:
    b1 = [{"id": "J1", "attempts": 1}, {"id": "J2", "attempts": 3}, {"id": "J3", "attempts": 4}]
    r1 = classify_jobs(b1, 3)
    results.append({"id": 1, "input": "J1(1), J2(3), J3(4) with max_retries=3", "expected": "{'retry': ['J1'], 'dlq': ['J2', 'J3']}", "actual": str(r1), "passed": r1 == {"retry": ["J1"], "dlq": ["J2", "J3"]}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "Job J1 (1 try)", value: "-> RETRY_QUEUE", address: "1 < 3" },
      { label: "Job J2 (3 tries)", value: "-> DLQ (QUARANTINE)", address: "3 >= 3" },
      { label: "Job J3 (4 tries)", value: "-> DLQ (QUARANTINE)", address: "4 >= 3" },
    ],
    hints: [
      "Loop `for job in jobs:` and check `if job[\"attempts\"] >= max_retries:`.",
      "Append `job[\"id\"]` to `result[\"dlq\"]` or `result[\"retry\"]` accordingly.",
    ],
  },
  {
    id: "exp-sys-11",
    title: "Read Replicas & Query Router",
    track: "system_design",
    category: "DATABASE SCALING",
    difficulty: "Medium",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      "Route WRITE mutations to the primary database and distribute READ queries across read replicas.",
    content:
      "Most web applications execute **90% reads** and **10% writes**. To scale horizontally:\n\n• Every **`\"WRITE\"`** query MUST go to `\"primary\"`.\n• Every **`\"READ\"`** query is load-balanced across `replicas` using `replicas[query_id % len(replicas)]` (or `\"primary\"` if `replicas` is empty).",
    assignment:
      "Implement `route_db_query(op_type, replicas, query_id)` to return the target database node name.",
    constraints: [
      "Return `\"primary\"` whenever `op_type == \"WRITE\"` or `replicas` is empty",
      "For `\"READ\"` queries, return `replicas[query_id % len(replicas)]`",
    ],
    examples: [
      {
        input: 'op_type="READ", replicas=["rep-1", "rep-2"], query_id=3',
        output: "rep-2",
        explanation: "3 % 2 == 1, which selects replicas[1] ('rep-2').",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def route_db_query(op_type, replicas, query_id):
    # Route WRITEs to "primary", and READs across replicas using modulo
    return "primary"

reps = ["rep-1", "rep-2"]
print(route_db_query("WRITE", reps, 0), route_db_query("READ", reps, 3))`,
    expected_output: "primary rep-2",
    hidden_tests: `import json
results = []
try:
    reps = ["rep-1", "rep-2"]
    r1 = route_db_query("WRITE", reps, 0)
    results.append({"id": 1, "input": "WRITE with replicas=['rep-1','rep-2']", "expected": "primary", "actual": str(r1), "passed": r1 == "primary"})
    r2 = route_db_query("READ", reps, 3)
    results.append({"id": 2, "input": "READ query_id=3 with 2 replicas", "expected": "rep-2", "actual": str(r2), "passed": r2 == "rep-2"})
    r3 = route_db_query("READ", [], 5)
    results.append({"id": 3, "input": "READ with empty replicas=[]", "expected": "primary", "actual": str(r3), "passed": r3 == "primary"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "WRITE #0", value: "-> primary (MASTER)", address: "mutation" },
      { label: "READ #2", value: "-> rep-1 (2 % 2 = 0)", address: "replica 0" },
      { label: "READ #3", value: "-> rep-2 (3 % 2 = 1)", address: "replica 1" },
    ],
    hints: [
      "First check `if op_type == \"WRITE\" or not replicas: return \"primary\"`.",
      "Otherwise return `replicas[query_id % len(replicas)]`.",
    ],
  },
  {
    id: "exp-sys-12",
    title: "Consistent Hashing Ring",
    track: "system_design",
    category: "DISTRIBUTED STORAGE",
    difficulty: "Hard",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      "Route a hashed key clockwise on a 0..360° hash ring with wrap-around to the first node.",
    content:
      "**Consistent Hashing** places servers at points on a circle (e.g., `[20, 50, 80]`). To find which server owns a key at `key_hash`:\n\n1. Sort the ring positions (`ordered = sorted(ring_nodes)`).\n2. Return the first node where `node >= key_hash`.\n3. If `key_hash` is greater than all nodes, wrap around the circle and return `ordered[0]`!",
    assignment:
      "Implement `locate_ring_server(ring_nodes, key_hash)` to return the clockwise server position responsible for `key_hash`.",
    constraints: [
      "Sort `ring_nodes` in ascending order",
      "Return the first node position `>= key_hash`",
      "If no node is `>= key_hash`, wrap around and return the smallest node position",
    ],
    examples: [
      {
        input: "ring_nodes = [20, 50, 80], key_hash = 35 -> 50; key_hash = 90 -> 20",
        output: "50 20",
        explanation: "35 lands on 50; 90 wraps past 80 back to 20.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def locate_ring_server(ring_nodes, key_hash):
    ordered = sorted(ring_nodes)
    # Find the first node >= key_hash, or wrap around to ordered[0]
    return 0

ring = [20, 50, 80]
print(locate_ring_server(ring, 35), locate_ring_server(ring, 90))`,
    expected_output: "50 20",
    hidden_tests: `import json
results = []
try:
    ring = [20, 50, 80]
    r1 = locate_ring_server(ring, 35)
    results.append({"id": 1, "input": "ring=[20,50,80], key_hash=35", "expected": "50", "actual": str(r1), "passed": r1 == 50})
    r2 = locate_ring_server(ring, 90)
    results.append({"id": 2, "input": "ring=[20,50,80], key_hash=90 (wrap)", "expected": "20", "actual": str(r2), "passed": r2 == 20})
    r3 = locate_ring_server(ring, 50)
    results.append({"id": 3, "input": "ring=[20,50,80], key_hash=50 (exact)", "expected": "50", "actual": str(r3), "passed": r3 == 50})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "Key @ 15°", value: "-> Node 20°", address: "clockwise" },
      { label: "Key @ 35°", value: "-> Node 50°", address: "clockwise" },
      { label: "Key @ 90°", value: "-> Node 20° (WRAP)", address: "past 80° -> 0°" },
    ],
    hints: [
      "Loop `for node in ordered:` and `if node >= key_hash: return node`.",
      "After the loop finishes, `return ordered[0]` to handle wrap-around!",
    ],
  },
];

export function mergeCurriculumLessons<
  T extends { id: string; track: string; lesson_order: number; title: string },
>(dbLessons: T[]): T[] {
  const merged = [...dbLessons];
  for (const exp of EXPANSION_LESSONS) {
    const alreadyExists = merged.some(
      (item) =>
        item.id === exp.id ||
        (item.track === exp.track &&
          (item.lesson_order === exp.lesson_order ||
            item.title.toLowerCase() === exp.title.toLowerCase())),
    );
    if (!alreadyExists) {
      merged.push(exp as unknown as T);
    }
  }
  return merged.sort((a, b) => a.lesson_order - b.lesson_order);
}
