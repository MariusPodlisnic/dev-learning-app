export type BlitzDeckKey =
  | "python_basics"
  | "algorithms"
  | "system_design"
  | "all";

export interface BlitzCardItem {
  id: string;
  deck: "python_basics" | "algorithms" | "system_design";
  tag: string;
  prompt: string;
  codeTemplate: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const BLITZ_CARDS: BlitzCardItem[] = [
  // ============================================================================
  // PYTHON CORE DECK (12 CARDS — FREE)
  // ============================================================================
  {
    id: "py-1",
    deck: "python_basics",
    tag: "VARIABLES",
    prompt: "Store the number 250 inside a variable named xp:",
    codeTemplate: "xp [ ___ ] 250\nprint(xp)",
    options: ["=", "==", "->", ":"],
    correctIndex: 0,
    explanation:
      "A single equals sign (=) assigns a value to a variable; == compares two values.",
  },
  {
    id: "py-2",
    deck: "python_basics",
    tag: "CONDITIONALS",
    prompt: "Check if score is at least 100 before unlocking the level:",
    codeTemplate: "if score >= 100[ ___ ]\n    print('Unlocked!')",
    options: [":", ";", "{", "then"],
    correctIndex: 0,
    explanation:
      "Every if, elif, else, for, while, and def header in Python must end with a colon (:).",
  },
  {
    id: "py-3",
    deck: "python_basics",
    tag: "LISTS",
    prompt: "Grab the VERY FIRST item ('sword') from the inventory list:",
    codeTemplate: "items = ['sword', 'shield', 'potion']\nprint(items[ ___ ])",
    options: ["[0]", "[1]", "[-1]", "(0)"],
    correctIndex: 0,
    explanation:
      "Python lists are zero-indexed, so index [0] always points to the first element.",
  },
  {
    id: "py-4",
    deck: "python_basics",
    tag: "LISTS",
    prompt: "Add 'gem' to the end of the loot list:",
    codeTemplate: "loot = ['coin', 'key']\nloot.[ ___ ]('gem')",
    options: ["append", "push", "add", "insert_end"],
    correctIndex: 0,
    explanation:
      "list.append(item) attaches a new item to the very end of a Python list.",
  },
  {
    id: "py-5",
    deck: "python_basics",
    tag: "FUNCTIONS",
    prompt: "Send the calculated total back to whoever called the function:",
    codeTemplate: "def double_xp(points):\n    [ ___ ] points * 2",
    options: ["return", "print", "give", "send"],
    correctIndex: 0,
    explanation:
      "return hands the result back to the caller so it can be saved or used in expressions.",
  },
  {
    id: "py-6",
    deck: "python_basics",
    tag: "STRINGS",
    prompt: "Remove accidental spaces from both ends of a username:",
    codeTemplate: "raw = '  ada_lovelace  '\nclean = raw.[ ___ ]()",
    options: ["strip", "trim", "clean", "pop"],
    correctIndex: 0,
    explanation:
      "str.strip() removes leading and trailing whitespace from a string.",
  },
  {
    id: "py-7",
    deck: "python_basics",
    tag: "DICTIONARIES",
    prompt: "Safely look up 'mana' with a fallback of 0 if missing:",
    codeTemplate: "stats = {'hp': 100}\nmana = stats.[ ___ ]('mana', 0)",
    options: ["get", "find", "fetch", "lookup"],
    correctIndex: 0,
    explanation:
      "dict.get(key, default) returns the default value instead of crashing with KeyError.",
  },
  {
    id: "py-8",
    deck: "python_basics",
    tag: "SLICING",
    prompt: "Reverse a list in one clean slice:",
    codeTemplate: "nums = [1, 2, 3, 4]\nrev = nums[ ___ ]",
    options: ["[::-1]", "[::-2]", "[1:-1]", "[:0]"],
    correctIndex: 0,
    explanation:
      "A step of -1 in [::-1] walks through the list backward from end to start.",
  },
  {
    id: "py-9",
    deck: "python_basics",
    tag: "SETS",
    prompt: "Remove all duplicate IDs from a list in one call:",
    codeTemplate: "ids = [4, 4, 9, 9, 1]\nunique_count = len([ ___ ](ids))",
    options: ["set", "dict", "tuple", "list"],
    correctIndex: 0,
    explanation:
      "Converting a list to a set(...) automatically drops every duplicate value.",
  },
  {
    id: "py-10",
    deck: "python_basics",
    tag: "SORTING",
    prompt: "Return a new list sorted from HIGHEST to LOWEST:",
    codeTemplate: "scores = [40, 95, 70]\ntop = sorted(scores, [ ___ ]=True)",
    options: ["reverse", "desc", "flip", "invert"],
    correctIndex: 0,
    explanation:
      "Passing reverse=True to sorted() orders items from largest to smallest.",
  },
  {
    id: "py-11",
    deck: "python_basics",
    tag: "LAMBDAS",
    prompt: "Create an inline 1-line anonymous function that triples x:",
    codeTemplate: "triple = [ ___ ] x: x * 3\nprint(triple(7))",
    options: ["lambda", "def", "func", "arrow"],
    correctIndex: 0,
    explanation:
      "lambda creates a quick one-line function without needing a full def block.",
  },
  {
    id: "py-12",
    deck: "python_basics",
    tag: "ZIPPING",
    prompt: "Pair a list of keys and a list of values into a dictionary:",
    codeTemplate: "roster = dict([ ___ ](names, scores))",
    options: ["zip", "pair", "merge", "join"],
    correctIndex: 0,
    explanation:
      "zip(a, b) pairs items at matching positions so dict() can turn them into key-value pairs.",
  },

  // ============================================================================
  // ALGORITHMS & BIG-O DECK (18 CARDS — PRO)
  // ============================================================================
  {
    id: "algo-1",
    deck: "algorithms",
    tag: "HASH MAP O(1)",
    prompt: "Calculate the complement needed to reach target in Two Sum:",
    codeTemplate: "need = [ ___ ] - num\nif need in seen:",
    options: ["target", "seen", "num * 2", "len(nums)"],
    correctIndex: 0,
    explanation:
      "If num + need == target, then the partner number we are looking for is target - num.",
  },
  {
    id: "algo-2",
    deck: "algorithms",
    tag: "TWO POINTERS",
    prompt: "Check if a cleaned string reads the same forward and backward:",
    codeTemplate: "is_palindrome = (clean == clean[ ___ ])",
    options: ["[::-1]", "[0:1]", "[1:]", "[-1]"],
    correctIndex: 0,
    explanation:
      "Comparing clean to its reversed slice clean[::-1] checks for a palindrome in one line.",
  },
  {
    id: "algo-3",
    deck: "algorithms",
    tag: "BINARY SEARCH",
    prompt: "Find the middle index between left and right using integer division:",
    codeTemplate: "mid = (left + right) [ ___ ] 2",
    options: ["//", "/", "%", "**"],
    correctIndex: 0,
    explanation:
      "Floor division (//) returns a whole integer index so Python can use it inside nums[mid].",
  },
  {
    id: "algo-4",
    deck: "algorithms",
    tag: "STACKS (LIFO)",
    prompt: "Remove and return the top item from a stack list:",
    codeTemplate: "top_bracket = stack.[ ___ ]()",
    options: ["pop", "shift", "remove_first", "peek"],
    correctIndex: 0,
    explanation:
      "list.pop() removes and returns the last (topmost) element in O(1) time.",
  },
  {
    id: "algo-5",
    deck: "algorithms",
    tag: "ANAGRAM CHECK",
    prompt: "Verify if two words contain the exact same letters and counts:",
    codeTemplate: "is_anagram = [ ___ ](word_a) == sorted(word_b)",
    options: ["sorted", "set", "len", "reversed"],
    correctIndex: 0,
    explanation:
      "Sorting both strings puts identical letters in alphabetical order so they can be compared with ==.",
  },
  {
    id: "algo-6",
    deck: "algorithms",
    tag: "DUPLICATE CHECK",
    prompt: "Detect if any number appears more than once in nums:",
    codeTemplate: "has_dup = len(nums) != len([ ___ ](nums))",
    options: ["set", "list", "tuple", "sorted"],
    correctIndex: 0,
    explanation:
      "Since set(nums) removes duplicates, a smaller set length means at least one duplicate existed.",
  },
  {
    id: "algo-7",
    deck: "algorithms",
    tag: "MISSING NUMBER",
    prompt: "Find the missing number in 0..n by subtracting actual sum from expected sum:",
    codeTemplate: "missing = sum(range(len(nums) + 1)) - [ ___ ](nums)",
    options: ["sum", "max", "len", "min"],
    correctIndex: 0,
    explanation:
      "Subtracting sum(nums) from the full 0..n sum leaves only the missing number.",
  },
  {
    id: "algo-8",
    deck: "algorithms",
    tag: "MAJORITY ELEMENT",
    prompt: "Grab the majority element (> 50% frequency) after sorting nums:",
    codeTemplate: "majority = sorted(nums)[len(nums) [ ___ ] 2]",
    options: ["//", "%", "*", "-"],
    correctIndex: 0,
    explanation:
      "An element appearing more than n/2 times is guaranteed to occupy the center index len(nums) // 2.",
  },
  {
    id: "algo-9",
    deck: "algorithms",
    tag: "LOWER-BOUND SEARCH",
    prompt: "Shrink hi to mid so lower-bound search lands on the leftmost duplicate:",
    codeTemplate: "if nums[mid] < target:\n    lo = mid + 1\nelse:\n    [ ___ ]",
    options: ["hi = mid", "hi = mid + 1", "lo = mid", "return -1"],
    correctIndex: 0,
    explanation:
      "Setting hi = mid keeps mid in [lo, hi) as a valid candidate while searching left for earlier matches.",
  },
  {
    id: "algo-10",
    deck: "algorithms",
    tag: "PREFIX SUM O(1)",
    prompt: "Compute inclusive subarray sum [left, right] from a 0-prefixed prefix array:",
    codeTemplate: "slice_sum = prefix[right [ ___ ]] - prefix[left]",
    options: ["+ 1", "- 1", "// 2", "% len"],
    correctIndex: 0,
    explanation:
      "With a leading 0 at prefix[0], prefix[right + 1] holds the sum through index right.",
  },
  {
    id: "algo-11",
    deck: "algorithms",
    tag: "SET INTERSECTION",
    prompt: "Find sorted elements present in BOTH sets in O(n + m) time:",
    codeTemplate: "mutual = sorted(set(a) [ ___ ] set(b))",
    options: ["&", "+", "|", "^"],
    correctIndex: 0,
    explanation:
      "The & operator intersects two sets; | computes union and ^ computes symmetric difference.",
  },
  {
    id: "algo-12",
    deck: "algorithms",
    tag: "MONOTONIC STACK",
    prompt: "Compare today's temperature to the previous unresolved day on top of stack:",
    codeTemplate: "while stack and temps[i] > temps[stack[ ___ ]]:\n    prev = stack.pop()",
    options: ["[-1]", "[0]", "[1]", "[:-1]"],
    correctIndex: 0,
    explanation:
      "stack[-1] peeks at the topmost index in O(1) before popping it.",
  },
  {
    id: "algo-13",
    deck: "algorithms",
    tag: "MULTI-KEY SORT",
    prompt: "Sort players by highest score first, breaking ties by lowest time:",
    codeTemplate: "sorted(players, key=lambda p: ([ ___ ], p['time']))",
    options: ["-p['score']", "p['score']", "reverse=True", "+p['time']"],
    correctIndex: 0,
    explanation:
      "Negating -p['score'] reverses score order while letting p['time'] break ties ascending.",
  },
  {
    id: "algo-14",
    deck: "algorithms",
    tag: "INVERTED INDEX",
    prompt: "Create a list bucket on first sight and append name cleanly in 1 line:",
    codeTemplate: "index.[ ___ ](role, []).append(name)",
    options: ["setdefault", "get", "update", "pop"],
    correctIndex: 0,
    explanation:
      "dict.setdefault(role, []) inserts [] only if role is missing and returns the bucket list.",
  },
  {
    id: "algo-15",
    deck: "algorithms",
    tag: "SLIDING WINDOW",
    prompt: "Record the newly entered right-edge character inside the active window set:",
    codeTemplate: "window.[ ___ ](s[right])",
    options: ["add", "append", "push", "insert"],
    correctIndex: 0,
    explanation:
      "Python sets use .add(item) to insert elements in O(1) average time.",
  },
  {
    id: "algo-16",
    deck: "algorithms",
    tag: "IN-PLACE PARITY",
    prompt: "Swap out-of-place elements at pointers l and r in O(1) space:",
    codeTemplate: "nums[l], nums[r] = [ ___ ]",
    options: [
      "nums[r], nums[l]",
      "nums[l], nums[r]",
      "r, l",
      "nums[l + 1], nums[r - 1]",
    ],
    correctIndex: 0,
    explanation:
      "Python tuple unpacking swaps two array positions in one clean line without a temp variable.",
  },
  {
    id: "algo-17",
    deck: "algorithms",
    tag: "MIN-HEAP O(LOG N)",
    prompt: "Pop the smallest priority task from min_heap using heapq:",
    codeTemplate: "next_task = heapq.[ ___ ](min_heap)",
    options: ["heappop", "popmin", "shift", "extract"],
    correctIndex: 0,
    explanation:
      "heapq.heappop(heap) pops and returns the minimum element while maintaining heap order in O(log n).",
  },
  {
    id: "algo-18",
    deck: "algorithms",
    tag: "BFS QUEUE (DEQUE)",
    prompt: "Pop the oldest node from the front of a BFS queue in O(1) time:",
    codeTemplate: "node = queue.[ ___ ]()",
    options: ["popleft", "pop(0)", "shift", "dequeue"],
    correctIndex: 0,
    explanation:
      "collections.deque.popleft() removes from the left end in O(1) instead of O(n) list.pop(0).",
  },

  // ============================================================================
  // SYSTEM DESIGN DECK (18 CARDS — PRO)
  // ============================================================================
  {
    id: "sys-1",
    deck: "system_design",
    tag: "LOAD BALANCER",
    prompt: "Wrap request index i around len(servers) for Round-Robin routing:",
    codeTemplate: "server = servers[i [ ___ ] len(servers)]",
    options: ["%", "//", "/", "**"],
    correctIndex: 0,
    explanation:
      "The modulo operator (%) wraps any counter neatly between 0 and len(servers) - 1.",
  },
  {
    id: "sys-2",
    deck: "system_design",
    tag: "DATABASE SHARDING",
    prompt: "Route user_id to one of num_shards database partitions:",
    codeTemplate: "shard_id = user_id [ ___ ] num_shards",
    options: ["%", "//", "+", "&"],
    correctIndex: 0,
    explanation:
      "user_id % num_shards deterministically maps every user to the same shard between 0 and num_shards - 1.",
  },
  {
    id: "sys-3",
    deck: "system_design",
    tag: "QUORUM CONSENSUS",
    prompt: "Calculate the strict majority of nodes needed for a valid quorum:",
    codeTemplate: "required_votes = (total_nodes // 2) [ ___ ] 1",
    options: ["+", "-", "*", "%"],
    correctIndex: 0,
    explanation:
      "Strict majority is half the cluster (floored) plus 1—for example, 3 out of 5 nodes.",
  },
  {
    id: "sys-4",
    deck: "system_design",
    tag: "EXPONENTIAL BACKOFF",
    prompt: "Double the retry wait time on each attempt (1, 2, 4, 8...):",
    codeTemplate: "wait_seconds = 2 [ ___ ] retry_attempt",
    options: ["**", "*", "//", "^"],
    correctIndex: 0,
    explanation:
      "In Python, ** is the exponent operator (2 ** 3 == 8), whereas ^ is bitwise XOR.",
  },
  {
    id: "sys-5",
    deck: "system_design",
    tag: "IDEMPOTENCY",
    prompt: "Skip charging a customer if request_id was already processed:",
    codeTemplate: "if request_id [ ___ ] processed_ids:\n    return 'DUPLICATE'",
    options: ["in", "==", "is", "has"],
    correctIndex: 0,
    explanation:
      "Checking `request_id in processed_ids` on a set takes O(1) time and prevents double charges.",
  },
  {
    id: "sys-6",
    deck: "system_design",
    tag: "CACHE TTL",
    prompt: "Check if a cached item is still fresh before its TTL expires:",
    codeTemplate: "is_valid = (now - saved_at) [ ___ ] ttl_seconds",
    options: ["<", ">", "==", "%"],
    correctIndex: 0,
    explanation:
      "If elapsed time (now - saved_at) is less than (<) ttl_seconds, the cache entry is still fresh.",
  },
  {
    id: "sys-7",
    deck: "system_design",
    tag: "TOKEN BUCKET",
    prompt: "Cap replenished rate-limiter tokens so they never exceed capacity:",
    codeTemplate: "tokens = [ ___ ](capacity, tokens + elapsed * rate)",
    options: ["min", "max", "abs", "sum"],
    correctIndex: 0,
    explanation:
      "min(capacity, ...) enforces the burst ceiling so idle buckets cannot accumulate infinite tokens.",
  },
  {
    id: "sys-8",
    deck: "system_design",
    tag: "CEILING WORKERS",
    prompt: "Round UP queued jobs into worker pods without floating-point math:",
    codeTemplate: "workers = (queue_len + per_worker - 1) [ ___ ] per_worker",
    options: ["//", "/", "%", "*"],
    correctIndex: 0,
    explanation:
      "(a + b - 1) // b performs exact integer ceiling division so remainder jobs get a worker.",
  },
  {
    id: "sys-9",
    deck: "system_design",
    tag: "DLQ QUARANTINE",
    prompt: "Route a poison-pill job to DLQ as soon as attempts hits max_attempts:",
    codeTemplate: "if job['attempts'] [ ___ ] max_attempts:\n    dlq.append(job['id'])",
    options: [">=", ">", "<=", "!="],
    correctIndex: 0,
    explanation:
      ">= max_attempts quarantines the job immediately once its final retry budget is used up.",
  },
  {
    id: "sys-10",
    deck: "system_design",
    tag: "CACHE-ASIDE",
    prompt: "Build the canonical namespaced Redis key for user profile caching:",
    codeTemplate: "key = [ ___ ]\nreturn cache.get(key)",
    options: [
      'f"user:{user_id}:profile"',
      '"user:{user_id}:profile"',
      '"user" + user_id',
      "user_id.key()",
    ],
    correctIndex: 0,
    explanation:
      "Colon-namespaced f-strings prevent key collisions across services and make SCAN inspection easy.",
  },
  {
    id: "sys-11",
    deck: "system_design",
    tag: "FLAP-GUARD ALARM",
    prompt: "Reset consecutive breach streak when a healthy telemetry sample arrives:",
    codeTemplate: "if sample >= threshold:\n    streak += 1\nelse:\n    [ ___ ]",
    options: ["streak = 0", "streak -= 1", "return 'WARN'", "pass"],
    correctIndex: 0,
    explanation:
      "Resetting streak = 0 stops isolated spikes separated by healthy readings from paging on-call.",
  },
  {
    id: "sys-12",
    deck: "system_design",
    tag: "CANARY ROLLOUT",
    prompt: "Deterministically assign a user to buckets 0..99 for staged feature rollouts:",
    codeTemplate: "in_canary = (user_id [ ___ ] 100) < rollout_pct",
    options: ["%", "//", "/", "&"],
    correctIndex: 0,
    explanation:
      "user_id % 100 maps every user ID deterministically to one of 100 percentage buckets.",
  },
  {
    id: "sys-13",
    deck: "system_design",
    tag: "API KEY TTL",
    prompt: "Reject an API key the instant now_ts reaches its expiration timestamp:",
    codeTemplate: "is_fresh = now_ts [ ___ ] record['expires_at']",
    options: ["<", "<=", ">", "!="],
    correctIndex: 0,
    explanation:
      "Strict now_ts < expires_at ensures the key stops working at exact timestamp expires_at.",
  },
  {
    id: "sys-14",
    deck: "system_design",
    tag: "PAGINATION OFFSET",
    prompt: "Compute the 1-indexed SQL/slice starting index for a given page:",
    codeTemplate: "start = ([ ___ ]) * page_size",
    options: ["page - 1", "page", "page + 1", "total // page"],
    correctIndex: 0,
    explanation:
      "Page 1 skips 0 items ((1 - 1) * page_size = 0); Page 2 skips page_size items.",
  },
  {
    id: "sys-15",
    deck: "system_design",
    tag: "CIRCUIT BREAKER",
    prompt: "Open the circuit breaker once consecutive failures reach threshold:",
    codeTemplate: "if failures [ ___ ] threshold:\n    return 'OPEN'",
    options: [">=", "<", "==", "!="],
    correctIndex: 0,
    explanation:
      "Using >= trips the breaker cleanly once consecutive errors reach threshold.",
  },
  {
    id: "sys-16",
    deck: "system_design",
    tag: "LEAST-LOAD ROUTER",
    prompt: "Select the healthy server dict with the lowest active connection load:",
    codeTemplate: "best = min(healthy, [ ___ ])['name']",
    options: [
      "key=lambda s: s['load']",
      "reverse=True",
      "sorted=True",
      "filter=load",
    ],
    correctIndex: 0,
    explanation:
      "min(healthy, key=lambda s: s['load']) compares servers by their load field in O(n) time.",
  },
  {
    id: "sys-17",
    deck: "system_design",
    tag: "SLIDING WINDOW LOG",
    prompt: "Keep only request timestamps strictly inside the trailing window:",
    codeTemplate: "active = [t for t in stamps if t [ ___ ] now - window_sec]",
    options: [">", "<", "<=", "=="],
    correctIndex: 0,
    explanation:
      "Only timestamps strictly newer than (now - window_sec) count toward the active window.",
  },
  {
    id: "sys-18",
    deck: "system_design",
    tag: "HMAC SECURITY",
    prompt: "Compare cryptographic webhook signatures in constant time to prevent timing attacks:",
    codeTemplate: "valid = hmac.[ ___ ](expected_sig, header_sig)",
    options: ["compare_digest", "equals", "verify_fast", "hash_match"],
    correctIndex: 0,
    explanation:
      "hmac.compare_digest takes constant time regardless of where strings mismatch, blocking timing side-channels.",
  },
];
