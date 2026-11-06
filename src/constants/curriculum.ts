export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonEnrichment {
  realWorldUse: string;
  analogyTitle: string;
  analogyText: string;
  cheatSheet: string;
  quiz: LessonQuiz;
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
];

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

  // 1. Try matching by track + keyword
  const byKeyword = LESSON_ENRICHMENTS.find(
    (item) =>
      item.matchTrack === track &&
      item.matchKeywords.some((kw) => titleLower.includes(kw)),
  );
  if (byKeyword) return byKeyword;

  // 2. Try matching by track + order
  const byOrder = LESSON_ENRICHMENTS.find(
    (item) => item.matchTrack === track && item.matchOrder === lesson.lesson_order,
  );
  if (byOrder) return byOrder;

  // 3. Friendly track-aware default enrichment
  if (track === "algorithms") {
    return {
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
    };
  }

  if (track === "system_design") {
    return {
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
    };
  }

  return {
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
      question: "How does Python know which lines belong inside a block (like `if`, `for`, or `def`)?",
      options: [
        "By indentation (4 spaces at the start of the line)",
        "By wrapping everything in curly braces { }",
        "By writing END at the bottom",
      ],
      correctIndex: 0,
      explanation:
        "Python uses clean 4-space indentation to group lines inside functions, loops, and if-statements!",
    },
  };
}
