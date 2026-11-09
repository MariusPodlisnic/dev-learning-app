import { EnrichedLessonData } from "./types";

export const SYSTEM_DESIGN_ENRICHMENTS: EnrichedLessonData[] = [
  {
    matchTrack: "system_design",
    matchOrder: 1,
    matchKeywords: ["cache", "caching", "redis", "lru", "memory", "load"],
    realWorldUse:
      "Used by Instagram and TikTok to serve popular posts instantly from fast memory.",
    analogyTitle: "Keeping Favorite Snacks on Your Desk",
    analogyText:
      "Check if `key in cache` first (fast **Cache Hit**). If not, fetch from `db` and save it in `cache`!",
    cheatSheet: `if key in cache:
    return cache[key]
val = db.get(key)
cache[key] = val
return val`,
    quiz: {
      question: "What is a 'Cache Hit'?",
      options: [
        "When the data is found immediately in fast cache memory",
        "When the server crashes",
        "When the internet disconnects",
      ],
      correctIndex: 0,
      explanation: "A Cache Hit saves a slow trip to the main database!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 4,
    matchKeywords: ["round-robin", "round robin", "load balancer", "route"],
    realWorldUse:
      "Used by Cloudflare and AWS to share traffic evenly across servers.",
    analogyTitle: "Dealing Cards in a Circle",
    analogyText:
      "Use the remainder operator `%` (`request_index % len(servers)`) to cycle smoothly through your servers!",
    cheatSheet: `def pick_server(servers, request_index):
    return servers[request_index % len(servers)]`,
    quiz: {
      question: "With 3 servers, what is `3 % 3`?",
      options: ["0 (wraps back to the first server)", "3", "9"],
      correctIndex: 0,
      explanation: "`3 % 3` is `0`, wrapping back to index 0!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 5,
    matchKeywords: ["shard", "sharding", "partition", "database"],
    realWorldUse:
      "Used by Discord to split billions of messages across numbered database shards.",
    analogyTitle: "Splitting a Huge Library Into Numbered Rooms",
    analogyText:
      "Compute `shard_id = user_id % num_shards` so every user always goes to the same database shard!",
    cheatSheet: `def get_shard(user_id, num_shards):
    return f"shard_{user_id % num_shards}"`,
    quiz: {
      question: "If `num_shards = 4`, which shard holds `user_id = 5`?",
      options: ["shard_1 (because 5 % 4 == 1)", "shard_9", "shard_0"],
      correctIndex: 0,
      explanation: "5 divided by 4 leaves a remainder of 1!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 6,
    matchKeywords: ["circuit", "breaker", "health", "failover", "outage"],
    realWorldUse:
      "Used by Netflix and Stripe to stop calling a down service while it recovers.",
    analogyTitle: "A Home Electrical Circuit Breaker",
    analogyText:
      'If `failures >= threshold`, return `"OPEN"` to block traffic safely; otherwise return `"CLOSED"`.',
    cheatSheet: `if failures >= threshold:
    return "OPEN"
return "CLOSED"`,
    quiz: {
      question: "What does an `OPEN` circuit breaker do?",
      options: [
        "Stops sending requests to a failing service so it can recover",
        "Deletes the database",
        "Doubles the error rate",
      ],
      correctIndex: 0,
      explanation:
        "Tripping `OPEN` protects the system from cascading timeouts!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 7,
    matchKeywords: ["quorum", "consensus", "leader", "majority", "vote"],
    realWorldUse:
      "Used in cloud clusters so servers agree on data by majority vote.",
    analogyTitle: "More Than Half the Room Agrees",
    analogyText:
      "Count how many votes are `True`, and check if `yes_votes > len(votes) / 2`!",
    cheatSheet: `yes_votes = votes.count(True)
return yes_votes > len(votes) / 2`,
    quiz: {
      question: "Out of 5 servers, how many `True` votes make a majority?",
      options: ["At least 3", "1", "0"],
      correctIndex: 0,
      explanation: "3 is more than half of 5 (2.5)!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 9,
    matchKeywords: ["backoff", "retry", "wait", "cap"],
    realWorldUse:
      "Used by mobile apps when reconnecting to Wi-Fi so they don't spam the server.",
    analogyTitle: "Capping the Maximum Wait Time with min()",
    analogyText:
      "When an app retries a failed request, it doubles the wait time (`delay`), but uses **`min(delay, max_wait)`** so the user never waits longer than `max_wait`!",
    cheatSheet: `def cap_retry_wait(delay, max_wait):
    # Never wait longer than max_wait:
    return min(delay, max_wait)

print(cap_retry_wait(1600, 1000))  # 1000`,
    commonPitfall: {
      title: "Using max() instead of min() when capping a limit",
      wrongCode:
        "return max(delay, max_wait)  # Forces wait to AT LEAST max_wait!",
      rightCode:
        "return min(delay, max_wait)  # Caps wait AT MOST max_wait!",
      explanation:
        "To cap a number at a ceiling, `min(value, ceiling)` picks the smaller of the two!",
    },
    guidedCode: `def get_retry_wait(delay_ms, max_ms):
    # 👉 Return whichever is smaller: delay_ms or max_ms using min()
    return min(delay_ms, max_ms)

print(get_retry_wait(400, 1000), get_retry_wait(1600, 1000))`,
    quiz: {
      question: "What does `min(1600, 1000)` return?",
      options: ["1000 (caps the value at 1000)", "1600", "2600"],
      correctIndex: 0,
      explanation:
        "`min()` returns the smaller number, keeping the delay capped at `1000`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 10,
    matchKeywords: ["dead", "dlq", "stuck", "alert", "job"],
    realWorldUse:
      "Used in background uploaders (like YouTube video processing) to stop retrying a corrupted file after 3 tries.",
    analogyTitle: "Three Strikes and Move to Support",
    analogyText:
      'If a job\'s `attempts >= 3`, stop retrying and return **`"ALERT_TEAM"`**. Otherwise, return **`"RETRY"`**!',
    cheatSheet: `def check_job_status(attempts):
    if attempts >= 3:
        return "ALERT_TEAM"
    return "RETRY"`,
    commonPitfall: {
      title: "Checking attempts > 3 instead of attempts >= 3",
      wrongCode: "if attempts > 3:  # Misses when attempts is 3!",
      rightCode: "if attempts >= 3: # Triggers as soon as attempts hits 3!",
      explanation:
        "`>= 3` means '3 or more', catching the 3rd failed attempt right away.",
    },
    guidedCode: `def check_job_status(attempts):
    if attempts >= 3:
        # 👉 Return "ALERT_TEAM" when attempts is 3 or more:
        return "ALERT_TEAM"
    return "RETRY"

print(check_job_status(1), check_job_status(3))`,
    quiz: {
      question: "If `attempts = 3`, what does `if attempts >= 3:` evaluate to?",
      options: ["True", "False", "Error"],
      correctIndex: 0,
      explanation: "Since 3 is equal to 3, `3 >= 3` is `True`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 11,
    matchKeywords: ["failover", "backup", "primary", "switch"],
    realWorldUse:
      "Used by hospitals, banks, and cloud servers to switch to a backup server the instant the main server goes offline.",
    analogyTitle: "Backup Generator When the Power Goes Out",
    analogyText:
      'If `primary_online` is `True`, route traffic to **`"primary"`**. Otherwise, automatically switch to **`"backup"`**!',
    cheatSheet: `def choose_server(primary_online):
    if primary_online:
        return "primary"
    return "backup"`,
    commonPitfall: {
      title: "Returning True/False instead of the server name string",
      wrongCode: "return primary_online",
      rightCode: 'if primary_online:\n    return "primary"\nreturn "backup"',
      explanation:
        'The router needs the name of the server (`"primary"` or `"backup"`) as a string.',
    },
    guidedCode: `def choose_server(primary_online):
    if primary_online:
        return "primary"
    # 👉 Otherwise return "backup":
    return "backup"

print(choose_server(True), choose_server(False))`,
    quiz: {
      question: "What is 'Automatic Failover' in System Design?",
      options: [
        "Automatically switching to a healthy backup server when the primary server goes down",
        "Turning off all computers at night",
        "Deleting user accounts",
      ],
      correctIndex: 0,
      explanation:
        "Failover keeps an app online 24/7 by seamlessly switching to a standby server!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 12,
    matchKeywords: ["cdn", "region", "closest", "video", "edge"],
    realWorldUse:
      "Used by Netflix and YouTube CDNs (Content Delivery Networks) to stream video from a server near your country.",
    analogyTitle: "Ordering From the Closest Local Warehouse",
    analogyText:
      'Given a dictionary of regional servers `cdn_map`, use **`cdn_map.get(region, "global-edge")`** to return the user\'s local server, or `"global-edge"` if their region isn\'t in the dictionary!',
    cheatSheet: `cdn_map = {"eu": "paris-01", "us": "virginia-01"}

# Look up region, or fall back to "global-edge":
server = cdn_map.get(region, "global-edge")`,
    commonPitfall: {
      title: "Using cdn_map[region] which crashes if the region is missing",
      wrongCode: "return cdn_map[region]  # KeyError on unknown region!",
      rightCode: 'return cdn_map.get(region, "global-edge")',
      explanation:
        "`.get(key, fallback)` safely returns the fallback string instead of crashing when a key isn't found!",
    },
    guidedCode: `def pick_cdn_server(cdn_map, region):
    # 👉 Use cdn_map.get(region, "global-edge") to return the server safely:
    return cdn_map.get(region, "global-edge")

servers = {"eu": "eu-west", "asia": "tokyo-edge"}
print(pick_cdn_server(servers, "eu"), pick_cdn_server(servers, "sa"))`,
    quiz: {
      question: 'What does `{"eu": "paris"}.get("mars", "global")` return?',
      options: [
        '"global" (the safe fallback value)',
        "KeyError crash",
        '"paris"',
      ],
      correctIndex: 0,
      explanation:
        'Since `"mars"` is not in the dictionary, `.get()` returns the fallback value `"global"`!',
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 13,
    matchKeywords: ["alarm", "memory usage", "warn", "monitor", "ram"],
    realWorldUse:
      "Used by Datadog and AWS CloudWatch to alert engineers before a server runs out of RAM.",
    analogyTitle: "Low-Battery Warning at 90% RAM Usage",
    analogyText:
      'Just like your phone warns you when battery is low, cloud monitors check `if usage >= 90:` and return **`"WARN"`** (or **`"OK"`** when usage is under 90%).',
    cheatSheet: `def check_ram_alarm(usage):
    if usage >= 90:
        return "WARN"
    return "OK"`,
    commonPitfall: {
      title: "Returning 'OK' inside the >= 90 block instead of 'WARN'",
      wrongCode: 'if usage >= 90:\n    return "OK"',
      rightCode: 'if usage >= 90:\n    return "WARN"',
      explanation:
        'When RAM usage reaches `90` or higher, the monitor should return `"WARN"`.',
    },
    guidedCode: `def check_ram_alarm(usage):
    if usage >= 90:
        # 👉 Return "WARN" when usage is 90 or higher:
        return "WARN"
    return "OK"

print(check_ram_alarm(65), check_ram_alarm(92))`,
    quiz: {
      question: 'What should `check_ram_alarm(95)` return if the threshold is `>= 90`?',
      options: ['"WARN"', '"OK"', "95"],
      correctIndex: 0,
      explanation: 'Since `95 >= 90` is True, it returns `"WARN"`!',
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 14,
    matchKeywords: ["feature", "flag", "rollout", "toggle", "beta"],
    realWorldUse:
      "Used by Instagram, Spotify, and GitHub to turn new features ON or OFF without shipping a new app update.",
    analogyTitle: "Remote Light Switches (Feature Flags)",
    analogyText:
      "A **Feature Flag** dictionary (`{\"dark_mode\": True}`) lets engineers toggle features remotely. Use **`flags.get(feature, False)`** so any unknown feature safely defaults to `False` (OFF)!",
    cheatSheet: `flags = {"dark_mode": True, "ai_chat": False}

# Check if a feature is enabled, defaulting to False:
enabled = flags.get(feature_name, False)`,
    commonPitfall: {
      title: "Defaulting to True for unknown features instead of False",
      wrongCode: "return flags.get(feature, True)   # Turns ON untested features!",
      rightCode: "return flags.get(feature, False)  # Safely defaults to OFF!",
      explanation:
        "In production systems, unconfigured feature flags should always default to `False` (OFF).",
    },
    guidedCode: `def is_feature_enabled(flags, feature):
    # 👉 Return flags.get(feature, False):
    return flags.get(feature, False)

print(is_feature_enabled({"dark_mode": True}, "dark_mode"), is_feature_enabled({}, "beta"))`,
    quiz: {
      question: "Why do Feature Flag lookups default to `False` when a flag name is missing?",
      options: [
        "So unfinished or unknown features stay safely turned OFF by default",
        "Because Python dictionaries cannot store True",
        "To delete the dictionary",
      ],
      correctIndex: 0,
      explanation:
        "Defaulting to `False` prevents unfinished features from accidentally turning on!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 15,
    matchKeywords: ["payload", "upload", "size", "limit", "gateway"],
    realWorldUse:
      "Used by Discord and Gmail to check that an uploaded file is under the maximum size limit (e.g., `<= 25` MB).",
    analogyTitle: "Carry-On Luggage Size Check at the Airport",
    analogyText:
      "Before a server accepts a file upload, it checks **`size_mb <= max_mb`**. If the file is within the limit, it returns `True`; otherwise `False`!",
    cheatSheet: `def can_upload_file(size_mb, max_mb):
    # Allow upload only if size_mb is at or under max_mb:
    return size_mb <= max_mb`,
    commonPitfall: {
      title: "Using >= instead of <= (which only allows huge files!)",
      wrongCode: "return size_mb >= max_mb",
      rightCode: "return size_mb <= max_mb",
      explanation:
        "`size_mb <= max_mb` checks that the file size is less than or equal to the allowed limit.",
    },
    guidedCode: `def can_upload_file(size_mb, max_mb):
    # 👉 Return True if size_mb <= max_mb:
    return size_mb <= max_mb

print(can_upload_file(10, 25), can_upload_file(40, 25))`,
    quiz: {
      question: "If `max_mb = 25`, what does `can_upload_file(25, 25)` return with `size_mb <= max_mb`?",
      options: ["True (25 MB is within the 25 MB limit)", "False", "Error"],
      correctIndex: 0,
      explanation: "`25 <= 25` is `True`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 16,
    matchKeywords: ["queue", "autoscaling", "worker", "busy", "backlog"],
    realWorldUse:
      "Used by AWS Auto Scaling to spin up an extra worker server whenever more than 5 jobs are waiting in line.",
    analogyTitle: "Opening a Second Checkout Lane at the Grocery Store",
    analogyText:
      "When the line of waiting customers (`len(queue)`) grows past `5`, the store opens a new checkout lane! In Python, that's simply **`return len(queue) > 5`**.",
    cheatSheet: `def needs_extra_worker(queue):
    # Spin up a new worker if more than 5 jobs are waiting:
    return len(queue) > 5`,
    commonPitfall: {
      title: "Comparing the list itself (queue > 5) instead of its length (len(queue) > 5)",
      wrongCode: "return queue > 5       # TypeError: list vs int!",
      rightCode: "return len(queue) > 5  # Compares number of items > 5!",
      explanation:
        "Use `len(queue)` to count how many jobs are in the list before comparing with `> 5`.",
    },
    guidedCode: `def needs_extra_worker(queue):
    # 👉 Return True if len(queue) > 5:
    return len(queue) > 5

print(needs_extra_worker(["j1", "j2"]), needs_extra_worker(["j1", "j2", "j3", "j4", "j5", "j6"]))`,
    quiz: {
      question: "How do you check if a `queue` list has more than 5 items waiting?",
      options: ["len(queue) > 5", "queue > 5", "queue.count() > 5"],
      correctIndex: 0,
      explanation: "`len(queue)` returns the number of items in `queue`, and `> 5` checks if it exceeds 5!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 17,
    matchKeywords: ["api key", "auth", "header", "valid_keys"],
    realWorldUse:
      "Used by Stripe, OpenAI, and GitHub APIs to verify that a request includes an active API key before running.",
    analogyTitle: "Checking the VIP Wristband at the Door",
    analogyText:
      "An API Gateway keeps a list of active `valid_keys`. When a request arrives with `api_key`, **`api_key in valid_keys`** checks if that wristband is on the list!",
    cheatSheet: `def is_valid_api_key(valid_keys, api_key):
    return api_key in valid_keys`,
    commonPitfall: {
      title: "Comparing api_key == valid_keys instead of using 'in'",
      wrongCode: "return api_key == valid_keys  # Compares string to entire list!",
      rightCode: "return api_key in valid_keys  # Checks membership inside list!",
      explanation:
        "Use `in` to check whether a single key string exists inside the `valid_keys` collection.",
    },
    guidedCode: `def is_valid_api_key(valid_keys, api_key):
    # 👉 Check if api_key is inside valid_keys:
    return api_key in valid_keys

keys = ["k_live_1", "k_live_2"]
print(is_valid_api_key(keys, "k_live_1"), is_valid_api_key(keys, "k_bad"))`,
    quiz: {
      question: "Which expression checks if `token` is inside `allowed_tokens`?",
      options: [
        "token in allowed_tokens",
        "token == allowed_tokens",
        "allowed_tokens.has(token)",
      ],
      correctIndex: 0,
      explanation:
        "`token in allowed_tokens` returns `True` if `token` is a member of `allowed_tokens`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 18,
    matchKeywords: ["pagination", "offset", "page", "skip"],
    realWorldUse:
      "Used in Google Search, Amazon product listings, and SQL `OFFSET` queries to load one page of results at a time.",
    analogyTitle: "Skipping Previous Pages with (page - 1) * page_size",
    analogyText:
      "On **Page 1**, you skip `0` items (`(1 - 1) * 10 = 0`). On **Page 3**, you skip the first `2` full pages (`(3 - 1) * 10 = 20`)!",
    cheatSheet: `def get_page_offset(page, page_size):
    return (page - 1) * page_size`,
    commonPitfall: {
      title: "Forgetting parentheses around (page - 1)",
      wrongCode: "return page - 1 * page_size    # Multiplies 1 * page_size first!",
      rightCode: "return (page - 1) * page_size  # Subtracts 1 first, then multiplies!",
      explanation:
        "Wrap `(page - 1)` in parentheses so Python subtracts 1 before multiplying by `page_size`.",
    },
    guidedCode: `def get_page_offset(page, page_size):
    # 👉 Calculate how many items to skip: (page - 1) * page_size
    return (page - 1) * page_size

print(get_page_offset(1, 10), get_page_offset(3, 10))`,
    quiz: {
      question: "If `page_size = 20`, how many items should be skipped on `page = 1`?",
      options: ["0", "20", "1"],
      correctIndex: 0,
      explanation:
        "Page 1 starts at the very first item, so `(1 - 1) * 20 = 0` items are skipped!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 19,
    matchKeywords: ["cache key", "profile", "redis"],
    realWorldUse:
      'Used in Redis and Memcached to name cache entries consistently across microservices (e.g. `"user:42:profile"`).',
    analogyTitle: "Standardized Labeled Folders in Redis",
    analogyText:
      'Naming cache keys with colons like **`f"user:{user_id}:profile"`** makes every user\'s cached profile easy to find and never collide with other keys!',
    cheatSheet: `def make_cache_key(user_id):
    return f"user:{user_id}:profile"`,
    commonPitfall: {
      title: "Forgetting the 'f' prefix on the cache key string",
      wrongCode: 'return "user:{user_id}:profile"',
      rightCode: 'return f"user:{user_id}:profile"',
      explanation:
        "Include `f` before the quote so `{user_id}` is replaced with the actual ID number.",
    },
    guidedCode: `def make_cache_key(user_id):
    # 👉 Return the Redis key f"user:{user_id}:profile":
    return f"user:{user_id}:profile"

print(make_cache_key(42))`,
    quiz: {
      question: 'If `user_id = 7`, what does `f"user:{user_id}:profile"` return?',
      options: [
        '"user:7:profile"',
        '"user:{user_id}:profile"',
        '"user:profile:7"',
      ],
      correctIndex: 0,
      explanation: "`{user_id}` is replaced with `7` inside the f-string!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 20,
    matchKeywords: ["batch", "chunk", "notification"],
    realWorldUse:
      "Used in email and push-notification workers that send messages in fixed batches of 100 at a time.",
    analogyTitle: "Filling Full Boxes with Integer Division (//)",
    analogyText:
      "If you have `250` apples and each box holds `100`, how many **full boxes** can you pack? **`250 // 100`** drops the decimal and gives `2`!",
    cheatSheet: `def count_full_batches(total_users, batch_size):
    return total_users // batch_size`,
    commonPitfall: {
      title: "Using single slash '/' (2.5) instead of double slash '//' (2)",
      wrongCode: "return total_users / batch_size   # Returns float 2.5!",
      rightCode: "return total_users // batch_size  # Returns whole int 2!",
      explanation:
        "Double slash `//` performs integer division, returning a clean whole number of full batches.",
    },
    guidedCode: `def count_full_batches(total_users, batch_size):
    # 👉 Return full batches using integer division //:
    return total_users // batch_size

print(count_full_batches(250, 100))`,
    quiz: {
      question: "What does `350 // 100` evaluate to in Python?",
      options: ["3", "3.5", "50"],
      correctIndex: 0,
      explanation:
        "`//` divides and rounds down to the nearest whole integer (`3`)!",
    },
  },
];
