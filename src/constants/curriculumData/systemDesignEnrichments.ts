import { EnrichedLessonData } from "./types";

export const SYSTEM_DESIGN_ENRICHMENTS: EnrichedLessonData[] = [
  {
    matchTrack: "system_design",
    matchOrder: 1,
    matchKeywords: ["rate limiter", "token bucket", "ddos", "allow_request"],
    realWorldUse:
      "Used by Stripe, GitHub, and Cloudflare to stop traffic bursts and DDoS spikes before they overload backend databases.",
    analogyTitle: "An API Bouncer Counting Wristbands",
    analogyText:
      "Your `TokenBucket` starts with `capacity` tokens. Each incoming request checks `if self.tokens > 0:` — if true, subtract 1 token and allow (`True`); if empty, reject (`False`)!",
    cheatSheet: `class TokenBucket:
    def __init__(self, capacity: int):
        self.tokens = capacity

    def allow_request(self) -> bool:
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False`,
    commonPitfall: {
      title: "Checking self.tokens >= 0 or forgetting to decrement self.tokens",
      wrongCode: "if self.tokens >= 0:\n    return True  # Never runs out or blocks!",
      rightCode: "if self.tokens > 0:\n    self.tokens -= 1\n    return True\nreturn False",
      explanation:
        "You must check strictly `self.tokens > 0` AND decrement `self.tokens -= 1` before returning `True` so the bucket actually drains.",
    },
    guidedCode: `class TokenBucket:
    def __init__(self, capacity: int):
        self.tokens = capacity

    def allow_request(self) -> bool:
        # 👉 If self.tokens > 0, decrement self.tokens and return True, else False:
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False`,
    solutionCode: `class TokenBucket:
    def __init__(self, capacity: int):
        self.tokens = capacity

    def allow_request(self) -> bool:
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False`,
    proInsights: {
      timeComplexity: "O(1) per request",
      spaceComplexity: "O(1) per client",
      tradeoff:
        "Token Bucket handles short bursts smoothly up to `capacity` while protecting downstream services; pair it with timestamp-based refill (see Chapter VI) in distributed Redis clusters.",
      followUp:
        "In multi-server deployments, why must the check-and-decrement run inside a Redis Lua script instead of two separate GET/SET commands?",
    },
    quiz: {
      question: "If a `TokenBucket` starts with `capacity = 2`, what does the 3rd consecutive `allow_request()` call return?",
      options: [
        "`False` (429 Throttled because tokens reached 0)",
        "`True` (it resets automatically)",
        "`-1`",
      ],
      correctIndex: 0,
      explanation:
        "Requests 1 and 2 spend tokens `2 -> 1 -> 0`, so the 3rd request sees `self.tokens == 0` and returns `False`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 2,
    matchKeywords: ["cache", "caching", "redis", "lru", "hit", "miss"],
    realWorldUse:
      "Used by Instagram and TikTok to serve popular posts and user profiles instantly from fast in-memory RAM instead of disk.",
    analogyTitle: "Keeping Hot Snacks on Your Desk",
    analogyText:
      "Check if `key in self.store` first (**Cache Hit** in microseconds). On a **Cache Miss**, return `-1` so the caller knows to query the database!",
    cheatSheet: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.store = {}

    def get(self, key: str):
        return self.store.get(key, -1)`,
    commonPitfall: {
      title: "Indexing self.store[key] directly on a missing key",
      wrongCode: "return self.store[key]  # Raises KeyError on cache miss!",
      rightCode: "return self.store.get(key, -1)",
      explanation:
        "A cache miss is normal behavior, not a crash; `.get(key, -1)` cleanly returns `-1` when `key` is absent.",
    },
    guidedCode: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.store = {"user:1": "Alice", "user:2": "Bob"}

    def get(self, key: str):
        # 👉 Return self.store[key] if key exists, otherwise -1:
        return self.store.get(key, -1)`,
    solutionCode: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.store = {"user:1": "Alice", "user:2": "Bob"}

    def get(self, key: str):
        return self.store.get(key, -1)`,
    proInsights: {
      timeComplexity: "O(1) lookup",
      spaceComplexity: "O(capacity)",
      tradeoff:
        "Hash-map lookups serve cache hits in O(1); full production LRU eviction pairs the dictionary with a Doubly Linked List (or `collections.OrderedDict`) to evict the oldest key in O(1) too.",
      followUp:
        "What is a Cache Stampede ('thundering herd'), and how do request coalescing or jittered TTLs prevent it?",
    },
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
    matchOrder: 3,
    matchKeywords: ["consistent hashing", "shard", "ring", "loadbalancer"],
    realWorldUse:
      "Used by Cassandra, DynamoDB, and distributed API routers to map request IDs deterministically across backend partitions.",
    analogyTitle: "Clock-Bucket Routing with Modulo (%)",
    analogyText:
      "Computing `request_id % num_shards` always produces a shard index from `0` to `num_shards - 1`, routing the same ID to the same shard every time.",
    cheatSheet: `class LoadBalancer:
    def get_shard(self, request_id: int, num_shards: int) -> int:
        return request_id % num_shards`,
    commonPitfall: {
      title: "Using integer division // instead of modulo %",
      wrongCode: "return request_id // num_shards  # Out of shard bounds!",
      rightCode: "return request_id % num_shards   # Always 0..num_shards-1!",
      explanation:
        "`10 // 3` is `3` (which overflows 3 shards indexed `0, 1, 2`), whereas `10 % 3` wraps safely to `1`.",
    },
    guidedCode: `class LoadBalancer:
    def get_shard(self, request_id: int, num_shards: int) -> int:
        # 👉 Map request_id to shard 0..num_shards-1 using %:
        return request_id % num_shards`,
    solutionCode: `class LoadBalancer:
    def get_shard(self, request_id: int, num_shards: int) -> int:
        return request_id % num_shards`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Simple modulo hashing is stateless and O(1) when cluster size is fixed; when shards scale up or down dynamically, switch to a Consistent Hash Ring (Chapter VI) so only ~1/N keys move.",
      followUp:
        "Why do production consistent hash rings place multiple 'virtual nodes' per physical server?",
    },
    quiz: {
      question: "With `num_shards = 3`, what shard index does `get_shard(12, 3)` return?",
      options: ["0 (because 12 % 3 == 0)", "4", "3"],
      correctIndex: 0,
      explanation: "12 divides evenly by 3 with remainder `0`, routing to Shard-0!",
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
    guidedCode: `def route_request(servers, request_index):
    # 👉 Compute slot = request_index % len(servers) and return servers[slot]:
    slot = request_index % len(servers)
    return servers[slot]

fleet = ["srv-alpha", "srv-beta", "srv-gamma"]
print(route_request(fleet, 4))`,
    solutionCode: `def route_request(servers, request_index):
    slot = request_index % len(servers)
    return servers[slot]

fleet = ["srv-alpha", "srv-beta", "srv-gamma"]
print(route_request(fleet, 4))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Round-robin balances uniform requests cleanly in O(1) time; when requests vary wildly in cost (e.g., slow report exports vs fast pings), 'Least Connections' avoids overloading one node.",
      followUp:
        "How would you implement Weighted Round-Robin when `srv-alpha` has 2x the CPU cores of `srv-beta`?",
    },
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
    guidedCode: `def get_user_shard(user_id, num_shards):
    # 👉 Calculate shard_id = user_id % num_shards and format f"shard_{shard_id}":
    shard_id = user_id % num_shards
    return f"shard_{shard_id}"

print(get_user_shard(42, 4))`,
    solutionCode: `def get_user_shard(user_id, num_shards):
    shard_id = user_id % num_shards
    return f"shard_{shard_id}"

print(get_user_shard(42, 4))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Hash-based shard keys spread write load evenly across DB instances, unlike range-sharding by timestamp which creates a hot write shard on 'today'.",
      followUp:
        "What happens if one celebrity `user_id` generates 50% of all traffic on a single shard ('hot partition')?",
    },
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
    matchKeywords: ["circuit", "breaker", "health", "outage"],
    realWorldUse:
      "Used by Netflix and Stripe to stop calling a down service while it recovers.",
    analogyTitle: "A Home Electrical Circuit Breaker",
    analogyText:
      'If `failures >= threshold`, return `"OPEN"` to block traffic safely; otherwise return `"CLOSED"`.',
    cheatSheet: `if failures >= threshold:
    return "OPEN"
return "CLOSED"`,
    guidedCode: `def get_circuit_status(failures, threshold):
    # 👉 Return "OPEN" if failures >= threshold, else "CLOSED":
    if failures >= threshold:
        return "OPEN"
    return "CLOSED"

print(get_circuit_status(5, 5))
print(get_circuit_status(2, 5))`,
    solutionCode: `def get_circuit_status(failures, threshold):
    if failures >= threshold:
        return "OPEN"
    return "CLOSED"

print(get_circuit_status(5, 5))
print(get_circuit_status(2, 5))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Failing fast with `OPEN` prevents caller thread-pool exhaustion and cascading timeouts across upstream microservices.",
      followUp:
        "How does the `HALF_OPEN` state let a tripped circuit breaker probe whether a recovering service is healthy again?",
    },
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
    guidedCode: `def has_quorum(votes):
    yes_votes = 0
    for v in votes:
        if v is True:
            yes_votes += 1
    # 👉 Return True if yes_votes is strictly greater than len(votes) / 2:
    return yes_votes > len(votes) / 2

print(has_quorum([True, True, False, True, False]))`,
    solutionCode: `def has_quorum(votes):
    yes_votes = 0
    for v in votes:
        if v is True:
            yes_votes += 1
    return yes_votes > len(votes) / 2

print(has_quorum([True, True, False, True, False]))`,
    proInsights: {
      timeComplexity: "O(n) cluster nodes",
      spaceComplexity: "O(1)",
      tradeoff:
        "Strict majority (`W > N / 2`) guarantees any two quorums overlap by at least one node, preventing split-brain conflicting leaders.",
      followUp:
        "Why do distributed consensus clusters (Raft, etcd, ZooKeeper) almost always deploy odd cluster sizes like 3 or 5 instead of 4?",
    },
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
    solutionCode: `def get_retry_wait(delay_ms, max_ms):
    return min(delay_ms, max_ms)

print(get_retry_wait(400, 1000), get_retry_wait(1600, 1000))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Capping exponential backoff prevents users from waiting hours on transient outages while still giving overloaded servers breathing room.",
      followUp:
        "Why do AWS and Google add random 'jitter' on top of capped exponential backoff?",
    },
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
    solutionCode: `def check_job_status(attempts):
    if attempts >= 3:
        return "ALERT_TEAM"
    return "RETRY"

print(check_job_status(1), check_job_status(3))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Moving poison-pill jobs to a Dead-Letter Queue (DLQ) after max retries keeps worker queues unblocked for healthy jobs.",
      followUp:
        "How do you safely replay DLQ messages once you fix the bug in the consumer code?",
    },
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
    solutionCode: `def choose_server(primary_online):
    if primary_online:
        return "primary"
    return "backup"

print(choose_server(True), choose_server(False))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Active-passive failover minimizes data-sync conflicts compared to multi-master writes, at the cost of idle standby capacity.",
      followUp:
        "What is 'replication lag', and how can it cause a newly promoted backup DB to miss the last few milliseconds of writes?",
    },
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
    solutionCode: `def pick_cdn_server(cdn_map, region):
    return cdn_map.get(region, "global-edge")

servers = {"eu": "eu-west", "asia": "tokyo-edge"}
print(pick_cdn_server(servers, "eu"), pick_cdn_server(servers, "sa"))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Geo-routing with a safe global edge fallback avoids single-region lookup failures while cutting round-trip latency for covered regions.",
      followUp:
        "Why do CDNs use Anycast BGP routing alongside DNS geo-lookups to handle sudden regional PoP outages?",
    },
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
    solutionCode: `def check_ram_alarm(usage):
    if usage >= 90:
        return "WARN"
    return "OK"

print(check_ram_alarm(65), check_ram_alarm(92))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Threshold alerts are simple and predictable; pairing them with hysteresis (e.g. warn at >=90%, recover only below 80%) stops alert flapping.",
      followUp:
        "Why is tracking the *rate of change* (memory leak slope) often better than a static 90% threshold?",
    },
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
    solutionCode: `def is_feature_enabled(flags, feature):
    return flags.get(feature, False)

print(is_feature_enabled({"dark_mode": True}, "dark_mode"), is_feature_enabled({}, "beta"))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Decoupling feature rollouts from binary deployments lets teams kill-switch broken code in seconds without waiting for App Store review.",
      followUp:
        "How would you roll out a flag to 10% of users consistently using `hash(user_id) % 100 < 10`?",
    },
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
    solutionCode: `def can_upload_file(size_mb, max_mb):
    return size_mb <= max_mb

print(can_upload_file(10, 25), can_upload_file(40, 25))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Checking `Content-Length` at the API gateway rejects oversized payloads before buffering multi-gigabyte streams into application RAM.",
      followUp:
        "How do pre-signed S3 upload URLs bypass your API server entirely for large video/image uploads?",
    },
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
    solutionCode: `def needs_extra_worker(queue):
    return len(queue) > 5

print(needs_extra_worker(["j1", "j2"]), needs_extra_worker(["j1", "j2", "j3", "j4", "j5", "j6"]))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Autoscaling on queue depth reacts directly to backlog pressure; add a cooldown window so cold-starting workers don't overshoot and thrash.",
      followUp:
        "When is 'oldest message age in queue' a better autoscaling metric than raw queue length?",
    },
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
    solutionCode: `def is_valid_api_key(valid_keys, api_key):
    return api_key in valid_keys

keys = ["k_live_1", "k_live_2"]
print(is_valid_api_key(keys, "k_live_1"), is_valid_api_key(keys, "k_bad"))`,
    proInsights: {
      timeComplexity: "O(1) with set / O(n) with list",
      spaceComplexity: "O(1)",
      tradeoff:
        "Storing active keys in a `set` or Redis hash table keeps gateway auth checks O(1); in production, store SHA-256 hashes of keys rather than plaintext.",
      followUp:
        "Why should API key verification use constant-time comparison (`hmac.compare_digest`) when validating HMAC signatures?",
    },
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
    solutionCode: `def get_page_offset(page, page_size):
    return (page - 1) * page_size

print(get_page_offset(1, 10), get_page_offset(3, 10))`,
    proInsights: {
      timeComplexity: "O(1) math (O(offset) DB scan)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Offset pagination allows jumping to any page number, but deep SQL offsets (`OFFSET 100000`) scan and discard 100k rows; switch to cursor/keyset pagination (`WHERE id > last_seen_id`) for infinite feeds.",
      followUp:
        "What duplicate-row bug happens in offset pagination when a new post is inserted while a user scrolls from Page 1 to Page 2?",
    },
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
    solutionCode: `def make_cache_key(user_id):
    return f"user:{user_id}:profile"

print(make_cache_key(42))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Colon-namespaced keys (`entity:id:field`) prevent cross-service key collisions and make Redis wildcard inspection (`SCAN user:42:*`) effortless.",
      followUp:
        "How does adding a schema version (`v2:user:42:profile`) let you deploy breaking cache changes without flushing the whole Redis cluster?",
    },
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
    solutionCode: `def count_full_batches(total_users, batch_size):
    return total_users // batch_size

print(count_full_batches(250, 100))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Batching API calls reduces network round-trips and DB transactions by 100x; use ceiling division `(total_users + batch_size - 1) // batch_size` when counting partial trailing batches too.",
      followUp:
        "If one item in a 100-item batch fails validation, should the worker fail the whole batch or isolate the bad record?",
    },
    quiz: {
      question: "What does `350 // 100` evaluate to in Python?",
      options: ["3", "3.5", "50"],
      correctIndex: 0,
      explanation:
        "`//` divides and rounds down to the nearest whole integer (`3`)!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 21,
    matchKeywords: ["sliding window", "limiter", "window_sec"],
    realWorldUse:
      "API gateways like Kong, Cloudflare, and Redis rate limiters use sliding window logs to block boundary bursts without punishing legitimate steady traffic.",
    analogyTitle: "Moving Spotlight on a Timeline",
    analogyText:
      "Instead of resetting a counter every sharp minute on the clock, a sliding window always shines backwards `window_sec` seconds from `now` and counts only live stamps inside the beam.",
    cheatSheet: `cutoff = now - window_sec
active = [t for t in timestamps if t > cutoff]
if len(active) < limit:
    active.append(now)`,
    commonPitfall: {
      title: "Using >= instead of > for the window cutoff",
      wrongCode: "active = [t for t in timestamps if t >= cutoff]",
      rightCode: "active = [t for t in timestamps if t > now - window_sec]",
      explanation:
        "A timestamp at exactly `now - window_sec` is already `window_sec` seconds old; keeping it over-counts boundary requests.",
    },
    guidedCode: `def evaluate_sliding_window(timestamps, now, window_sec, limit):
    cutoff = now - window_sec
    # 👉 Keep strictly recent timestamps (t > cutoff), then allow if len(active) < limit:
    active = [t for t in timestamps if t > cutoff]
    if len(active) < limit:
        active.append(now)
        return {"allowed": True, "active_count": len(active)}
    return {"allowed": False, "active_count": len(active)}

print(evaluate_sliding_window([10, 45, 55], 70, 30, 3))`,
    solutionCode: `def evaluate_sliding_window(timestamps, now, window_sec, limit):
    cutoff = now - window_sec
    active = [ts for ts in timestamps if ts > cutoff]
    if len(active) < limit:
        active.append(now)
        return {"allowed": True, "active_count": len(active)}
    return {"allowed": False, "active_count": len(active)}

print(evaluate_sliding_window([10, 45, 55], 70, 30, 3))`,
    proInsights: {
      timeComplexity: "O(k) per check",
      spaceComplexity: "O(limit) timestamps",
      tradeoff:
        "Sliding Window Log gives exact burst precision without boundary spikes, at the cost of storing up to `limit` timestamps per user (use Redis Sorted Sets `ZREMRANGEBYSCORE` + `ZCARD`).",
      followUp:
        "When a user has a 100,000 req/min limit, why do systems switch to Sliding Window Counter (two integer buckets + weighted overlap) instead of storing every timestamp?",
    },
    quiz: {
      question: "Why does a sliding window log beat a fixed-minute counter at `:59` and `:01`?",
      options: [
        "It prevents double-bursting across two adjacent clock boundaries",
        "It always requires zero memory regardless of traffic",
        "It drops every second request automatically",
      ],
      correctIndex: 0,
      explanation:
        "A fixed counter allows `limit` requests at `00:59` and another `limit` at `01:01` (`2x` burst in 2 seconds), whereas a sliding window tracks the exact trailing span.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 22,
    matchKeywords: ["token bucket", "refill", "capacity"],
    realWorldUse:
      "AWS API Gateway, Stripe, and Envoy proxies run Token Bucket limiters to store burst credits during quiet periods while capping steady-state throughput.",
    analogyTitle: "Leaky-Proof Rain Barrel",
    analogyText:
      "Tokens drip into a bucket at a steady `refill_rate` up to a `capacity` lid. Each request drinks 1 token — if the barrel is empty, the request waits or gets `429`.",
    cheatSheet: `elapsed = max(0, now_ts - last_ts)
available = min(capacity, tokens + elapsed * refill_rate)
if available >= 1:
    return {"allowed": True, "tokens": available - 1}`,
    commonPitfall: {
      title: "Refilling tokens past bucket capacity",
      wrongCode: "tokens = tokens + (now_ts - last_ts) * refill_rate",
      rightCode: "available = min(capacity, tokens + elapsed * refill_rate)",
      explanation:
        "Without clamping via `min(capacity, ...)`, idle buckets accumulate unbounded tokens and allow massive bursts.",
    },
    guidedCode: `def consume_token(tokens, last_ts, now_ts, refill_rate, capacity):
    elapsed = max(0, now_ts - last_ts)
    # 👉 Lazy-refill up to capacity, then spend 1 token if >= 1:
    available = min(capacity, tokens + elapsed * refill_rate)
    if available >= 1:
        return {"allowed": True, "tokens": available - 1}
    return {"allowed": False, "tokens": available}

print(consume_token(1, 10, 13, 2, 5))`,
    solutionCode: `def consume_token(tokens, last_ts, now_ts, refill_rate, capacity):
    elapsed = max(0, now_ts - last_ts)
    available = min(capacity, tokens + elapsed * refill_rate)
    if available >= 1:
        return {"allowed": True, "tokens": available - 1}
    return {"allowed": False, "tokens": available}

print(consume_token(1, 10, 13, 2, 5))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1) per key (2 floats)",
      tradeoff:
        "Lazy refill stores only `(tokens, last_ts)` per API key and computes accrued tokens on arrival — zero background cron timers needed.",
      followUp:
        "How does Leaky Bucket differ from Token Bucket when a downstream payment processor needs strictly smoothed constant output?",
    },
    quiz: {
      question: "Why do production services compute token refills lazily on each request instead of running a timer every second per user?",
      options: [
        "Lazy math needs zero background timers and scales cleanly to millions of API keys",
        "Background timers cannot use integer multiplication",
        "Lazy math always bypasses the bucket capacity limit",
      ],
      correctIndex: 0,
      explanation:
        "Computing `(now - last_ts) * refill_rate` on demand avoids spawning millions of timers and stores only two numbers per key.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 23,
    matchKeywords: ["consistent hash", "hash ring", "router"],
    realWorldUse:
      "Distributed caches and databases like Cassandra, DynamoDB, and Memcached clients use consistent hash rings so adding or removing a node only moves ~1/N keys.",
    analogyTitle: "Clock-Face Parking Spots",
    analogyText:
      "Servers sit at numbered angles around a circular clock face. A key lands at its hash angle and drives clockwise until it hits the first server — wrapping past 12 back to 1 if needed.",
    cheatSheet: `ordered = sorted(ring_nodes, key=lambda n: n[0])
for pos, node_id in ordered:
    if pos >= key_hash:
        return node_id
return ordered[0][1]`,
    commonPitfall: {
      title: "Falling back to hash % len(nodes) modulo routing",
      wrongCode: "return ordered[key_hash % len(ordered)][1]",
      rightCode: "for pos, node in ordered:\n    if pos >= key_hash: return node\nreturn ordered[0][1]",
      explanation:
        "Plain modulo routing reshuffles nearly every key when a node joins or leaves; walking clockwise around the ring moves only ~1/N keys.",
    },
    guidedCode: `def route_hash_ring(ring_nodes, key_hash):
    ordered = sorted(ring_nodes, key=lambda node: node[0])
    # 👉 Walk clockwise to find first pos >= key_hash, else wrap to ordered[0][1]:
    for pos, node_id in ordered:
        if pos >= key_hash:
            return node_id
    return ordered[0][1]

print(route_hash_ring([(90, "db-c"), (20, "db-a"), (55, "db-b")], 60))`,
    solutionCode: `def route_hash_ring(ring_nodes, key_hash):
    if not ring_nodes:
        return None
    ordered = sorted(ring_nodes, key=lambda node: node[0])
    for pos, node_id in ordered:
        if pos >= key_hash:
            return node_id
    return ordered[0][1]

print(route_hash_ring([(90, "db-c"), (20, "db-a"), (55, "db-b")], 60))`,
    proInsights: {
      timeComplexity: "O(N log N) sort / O(log N) binary search",
      spaceComplexity: "O(N) ring nodes",
      tradeoff:
        "Consistent hashing isolates node additions/removals to ~1/N key migrations, whereas modulo routing (`hash % N`) invalidates nearly 100% of cached keys on resize.",
      followUp:
        "In production, pre-sorting the ring once and using `bisect_left` drops every key lookup from O(N) to O(log N).",
    },
    quiz: {
      question: "What happens on a consistent hash ring when `key_hash` is greater than every node position on the ring?",
      options: [
        "It wraps clockwise back to the smallest-positioned node (`ordered[0]`)",
        "It raises an out-of-bounds routing error",
        "It routes to the last node in insertion order",
      ],
      correctIndex: 0,
      explanation:
        "The ring is circular, so walking clockwise past the highest position wraps seamlessly to the lowest node position.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 24,
    matchKeywords: ["ttl", "expiry", "cache"],
    realWorldUse:
      "Redis, CDNs, and session stores pair passive read-time eviction with active cleanup so expired credentials and stale cache entries are never served to clients.",
    analogyTitle: "Milk Carton Expiration Check",
    analogyText:
      "Even if nobody has thrown the carton out of the fridge yet, checking the stamped `expires_at` date before pouring ensures you never serve spoiled data — and lets you toss it immediately.",
    cheatSheet: `if key not in cache:
    return "MISS"
if now_ts >= cache[key]["expires_at"]:
    del cache[key]
    return "EXPIRED"
return cache[key]["value"]`,
    commonPitfall: {
      title: "Using strict > instead of >= for expiry checks",
      wrongCode: 'if now_ts > entry["expires_at"]:  # Serves stale data at t == expires_at!',
      rightCode: 'if now_ts >= entry["expires_at"]:\n    del cache[key]\n    return "EXPIRED"',
      explanation:
        "When `now_ts` reaches `expires_at`, the TTL has elapsed; serving cached data at `t == expires_at` violates strict expiry contracts.",
    },
    guidedCode: `def read_ttl_cache(cache, key, now_ts):
    if key not in cache:
        return "MISS"
    entry = cache[key]
    # 👉 If now_ts >= entry['expires_at'], delete cache[key] and return 'EXPIRED':
    if now_ts >= entry["expires_at"]:
        del cache[key]
        return "EXPIRED"
    return entry["value"]

store = {"u1": {"value": "Alice", "expires_at": 100}}
print(read_ttl_cache(store, "u1", 80), read_ttl_cache(store, "u1", 100))`,
    solutionCode: `def read_ttl_cache(cache, key, now_ts):
    if key not in cache:
        return "MISS"
    entry = cache[key]
    if now_ts >= entry["expires_at"]:
        del cache[key]
        return "EXPIRED"
    return entry["value"]

store = {"u1": {"value": "Alice", "expires_at": 100}}
print(read_ttl_cache(store, "u1", 80), read_ttl_cache(store, "u1", 100))`,
    proInsights: {
      timeComplexity: "O(1) read & lazy delete",
      spaceComplexity: "O(keys)",
      tradeoff:
        "Lazy expiration guarantees zero stale reads at O(1) cost, while Redis pairs it with periodic random sampling so write-once-never-read keys still get reclaimed.",
      followUp:
        "What happens when RAM fills up with keys whose TTL hasn't expired yet? Combine TTL with LRU/LFU maxmemory eviction policies.",
    },
    quiz: {
      question: "Why does `read_ttl_cache` delete `cache[key]` upon detecting expiration (`now_ts >= expires_at`)?",
      options: [
        "Lazy eviction frees memory immediately without needing a full-table background scan on every tick",
        "Deleting converts the dictionary into a faster tuple",
        "Python raises a KeyError if expired dicts stay in memory",
      ],
      correctIndex: 0,
      explanation:
        "Passive/lazy eviction on read guarantees stale values are never returned while reclaiming memory opportunistically.",
    },
  },
];
