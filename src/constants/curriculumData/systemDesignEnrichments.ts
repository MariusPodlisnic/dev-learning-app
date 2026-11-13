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
    matchKeywords: ["backoff", "jitter", "exponential", "retry", "thundering herd"],
    realWorldUse:
      "Used by AWS SDKs, gRPC clients, and Stripe webhooks to space out retries exponentially with jitter so recovering servers aren't crushed by synchronized spikes.",
    analogyTitle: "Exponential Backoff + Capped Jitter Shield",
    analogyText:
      "Each failed retry doubles the wait (`base_ms * (2 ** attempt)`), mixes in `jitter_ms` so millions of clients don't wake up at the exact same millisecond, and clamps with `min(..., max_ms)` so wait times stay bounded.",
    cheatSheet: `def compute_backoff(attempt, base_ms, max_ms, jitter_ms):
    delay = base_ms * (2 ** attempt) + jitter_ms
    return max(0, min(delay, max_ms))`,
    commonPitfall: {
      title: "Skipping the 2 ** attempt exponent or forgetting the max_ms ceiling",
      wrongCode:
        "return base_ms * attempt + jitter_ms  # Linear, and attempt=0 yields 0!",
      rightCode:
        "delay = base_ms * (2 ** attempt) + jitter_ms\nreturn max(0, min(delay, max_ms))",
      explanation:
        "Exponential backoff uses `2 ** attempt` (so attempt `0` starts at `1 * base_ms`), then caps with `min(delay, max_ms)`.",
    },
    guidedCode: `def compute_backoff(attempt, base_ms, max_ms, jitter_ms):
    # 👉 Step 1: Compute base_ms * (2 ** attempt) + jitter_ms
    delay = base_ms * (2 ** attempt) + jitter_ms
    # 👉 Step 2: Clamp safely between 0 and max_ms
    return max(0, min(delay, max_ms))

print(compute_backoff(2, 100, 1000, 50), compute_backoff(4, 100, 1000, 50))`,
    solutionCode: `def compute_backoff(attempt, base_ms, max_ms, jitter_ms):
    delay = base_ms * (2 ** attempt) + jitter_ms
    return max(0, min(delay, max_ms))

print(compute_backoff(2, 100, 1000, 50), compute_backoff(4, 100, 1000, 50))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Adding jitter breaks synchronized retry waves ('thundering herd') across thousands of clients at the tiny cost of slight per-client wait variance.",
      followUp:
        "Compare 'Full Jitter' (`random(0, cap)`) vs 'Decorrelated Jitter' used in AWS architecture guidelines.",
    },
    quiz: {
      question:
        "Why do production SDKs add random jitter on top of exponential backoff?",
      options: [
        "To spread out client retries so a recovering service isn't hit by a synchronized thundering herd",
        "To guarantee every retry takes the exact same number of milliseconds",
        "To disable the `max_ms` ceiling during outages",
      ],
      correctIndex: 0,
      explanation:
        "Without jitter, thousands of clients disconnected at `t=0` retry together at 1s, 2s, 4s, causing repeated coordinated overload!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 10,
    matchKeywords: ["dlq", "dead-letter", "triage", "queue", "poison pill"],
    realWorldUse:
      "Used by Amazon SQS, Kafka workers, and Celery to isolate crashing 'poison-pill' messages into a Dead-Letter Queue (DLQ) without starving healthy jobs.",
    analogyTitle: "Quarantining Poison Pills in Two Queue Buckets",
    analogyText:
      "Loop through queued job records in order: any job whose `attempts >= max_attempts` moves into `dlq` for manual debugging, while recoverable jobs stay in `retry`.",
    cheatSheet: `retry, dlq = [], []
for job in jobs:
    if job["attempts"] >= max_attempts:
        dlq.append(job["id"])
    else:
        retry.append(job["id"])
return {"retry": retry, "dlq": dlq}`,
    commonPitfall: {
      title: "Using strict '>' instead of '>=' or dropping job order",
      wrongCode:
        "if job['attempts'] > max_attempts:  # Allows an extra attempt beyond max!",
      rightCode:
        "if job['attempts'] >= max_attempts:\n    dlq.append(job['id'])",
      explanation:
        "Once `attempts` hits `max_attempts` (`>=`), the job has exhausted its retry budget and must be quarantined immediately.",
    },
    guidedCode: `def triage_jobs(jobs, max_attempts):
    retry = []
    dlq = []
    # 👉 Route each job['id'] to dlq if attempts >= max_attempts, else retry:
    for job in jobs:
        if job["attempts"] >= max_attempts:
            dlq.append(job["id"])
        else:
            retry.append(job["id"])
    return {"retry": retry, "dlq": dlq}

sample = [{"id": "j1", "attempts": 1}, {"id": "j2", "attempts": 3}]
print(triage_jobs(sample, 3))`,
    solutionCode: `def triage_jobs(jobs, max_attempts):
    retry = []
    dlq = []
    for job in jobs:
        if job["attempts"] >= max_attempts:
            dlq.append(job["id"])
        else:
            retry.append(job["id"])
    return {"retry": retry, "dlq": dlq}

sample = [{"id": "j1", "attempts": 1}, {"id": "j2", "attempts": 3}]
print(triage_jobs(sample, 3))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Routing failed jobs to a DLQ keeps worker throughput healthy for valid tasks while preserving failing payloads for post-fix replay.",
      followUp:
        "Before replaying DLQ messages back to the main queue, how should you prevent idempotent side effects (like double-charging a card)?",
    },
    quiz: {
      question:
        "What is the primary operational reason for moving a job to a Dead-Letter Queue (DLQ)?",
      options: [
        "To isolate unprocessable 'poison-pill' messages so they don't loop forever and starve healthy workers",
        "To permanently delete user accounts after 3 login failures",
        "To compress database backups faster",
      ],
      correctIndex: 0,
      explanation:
        "Quarantining repeatedly failing jobs protects worker capacity while letting engineers inspect and replay them later.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 11,
    matchKeywords: ["failover", "least load", "healthy", "load balancer"],
    realWorldUse:
      "Used by Envoy, NGINX, and AWS Application Load Balancers to filter out failed health-check targets and send traffic to the least-loaded live node.",
    analogyTitle: "Health Filter + Least-Load Routing",
    analogyText:
      "First drop every node with `healthy == False` (`us-1` might report `load: 10` simply because nobody can reach it!). Then pick `min(healthy_nodes, key=lambda s: s['load'])['name']`, or `'UNAVAILABLE'` if all nodes failed.",
    cheatSheet: `live = [s for s in servers if s["healthy"]]
if not live:
    return "UNAVAILABLE"
return min(live, key=lambda s: s["load"])["name"]`,
    commonPitfall: {
      title: "Picking lowest load BEFORE filtering out unhealthy servers",
      wrongCode:
        "return min(servers, key=lambda s: s['load'])['name']  # Routes to dead node with load=0!",
      rightCode:
        "live = [s for s in servers if s['healthy']]\nreturn min(live, key=lambda s: s['load'])['name'] if live else 'UNAVAILABLE'",
      explanation:
        "Crashed servers often report near-zero load precisely because they stopped serving traffic—always filter `healthy` first!",
    },
    guidedCode: `def pick_healthy_server(servers):
    # 👉 Step 1: Keep only nodes passing health checks
    healthy = [s for s in servers if s.get("healthy")]
    # 👉 Step 2: Fail cleanly if the entire fleet is down
    if not healthy:
        return "UNAVAILABLE"
    # 👉 Step 3: Route to the healthy node with the smallest active load
    best = min(healthy, key=lambda s: s["load"])
    return best["name"]

fleet = [
    {"name": "us-1", "healthy": False, "load": 10},
    {"name": "us-2", "healthy": True, "load": 45},
    {"name": "eu-1", "healthy": True, "load": 20},
]
print(pick_healthy_server(fleet))`,
    solutionCode: `def pick_healthy_server(servers):
    healthy = [s for s in servers if s.get("healthy")]
    if not healthy:
        return "UNAVAILABLE"
    return min(healthy, key=lambda s: s["load"])["name"]

fleet = [
    {"name": "us-1", "healthy": False, "load": 10},
    {"name": "us-2", "healthy": True, "load": 45},
    {"name": "eu-1", "healthy": True, "load": 20},
]
print(pick_healthy_server(fleet))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) (or O(1) with single-pass loop)",
      tradeoff:
        "Least-load routing beats Round Robin when requests vary wildly in duration, though in massive clusters ('Power of Two Choices') sampling 2 random nodes avoids scanning thousands of backends.",
      followUp:
        "Why can global least-load routing cause a sudden 'herd stampede' onto a freshly restarted empty server unless slow-start warmup is used?",
    },
    quiz: {
      question:
        "Why must load balancers filter `healthy == True` BEFORE picking the node with lowest load?",
      options: [
        "Offline servers report 0 active requests and would otherwise attract 100% of traffic",
        "Python's `min()` throws an error on booleans inside dictionaries",
        "Unhealthy servers always have load > 100",
      ],
      correctIndex: 0,
      explanation:
        "A crashed backend stops accepting connections, making its reported load look artificially tiny ('fail-fast blackhole')!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 12,
    matchKeywords: ["cdn", "latency", "edge", "region", "failover"],
    realWorldUse:
      "Used by Cloudflare, Fastly, and CloudFront to route viewers to a healthy regional PoP first, failing over to the lowest-latency healthy PoP globally (or `'origin'`) during outages.",
    analogyTitle: "Regional Affinity + Global Latency Fallback",
    analogyText:
      "Filter `edges` down to `healthy` nodes (`if not healthy: return 'origin'`). Prefer the lowest-latency healthy edge inside `region` if one exists; otherwise fail over to the lowest-latency healthy edge anywhere!",
    cheatSheet: `healthy = [e for e in edges if e["healthy"]]
if not healthy:
    return "origin"
local = [e for e in healthy if e["region"] == region]
pool = local if local else healthy
return min(pool, key=lambda e: e["latency_ms"])["id"]`,
    commonPitfall: {
      title: "Crashing on missing regions or returning offline regional edges",
      wrongCode:
        "return [e for e in edges if e['region'] == region][0]['id']  # Ignores health & crashes!",
      rightCode:
        "healthy = [e for e in edges if e['healthy']]\nlocal = [e for e in healthy if e['region'] == region]\npool = local if local else healthy\nreturn min(pool, key=lambda e: e['latency_ms'])['id'] if pool else 'origin'",
      explanation:
        "Never route users to a downed regional PoP—fall back cleanly to the closest healthy PoP or `'origin'`.",
    },
    guidedCode: `def pick_cdn_server(edges, region):
    # 👉 Step 1: Filter to healthy edges (return "origin" if none)
    healthy = [e for e in edges if e.get("healthy")]
    if not healthy:
        return "origin"
    # 👉 Step 2: Prefer lowest-latency edge matching region, else lowest-latency overall
    regional = [e for e in healthy if e.get("region") == region]
    candidates = regional if regional else healthy
    return min(candidates, key=lambda e: e["latency_ms"])["id"]

pops = [
    {"id": "eu-1", "region": "eu", "latency_ms": 15, "healthy": False},
    {"id": "us-1", "region": "us", "latency_ms": 85, "healthy": True},
    {"id": "uk-1", "region": "uk", "latency_ms": 35, "healthy": True},
]
print(pick_cdn_server(pops, "eu"))`,
    solutionCode: `def pick_cdn_server(edges, region):
    healthy = [e for e in edges if e.get("healthy")]
    if not healthy:
        return "origin"
    regional = [e for e in healthy if e.get("region") == region]
    candidates = regional if regional else healthy
    return min(candidates, key=lambda e: e["latency_ms"])["id"]

pops = [
    {"id": "eu-1", "region": "eu", "latency_ms": 15, "healthy": False},
    {"id": "us-1", "region": "us", "latency_ms": 85, "healthy": True},
    {"id": "uk-1", "region": "uk", "latency_ms": 35, "healthy": True},
]
print(pick_cdn_server(pops, "eu"))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Preferring regional edges preserves data locality and cache warmth inside the user's continent while still providing automatic cross-region resilience.",
      followUp:
        "If `region` is completely down, routing 100% of `eu` traffic to `uk-1` can overload `uk-1`; how would weighted multi-edge spillover prevent cascading regional failures?",
    },
    quiz: {
      question:
        "In `pick_cdn_server`, when `eu-1` (`eu`) is unhealthy while `uk-1` (35ms) and `us-1` (85ms) are healthy, which PoP gets chosen?",
      options: ['"uk-1"', '"eu-1"', '"origin"'],
      correctIndex: 0,
      explanation:
        "With no healthy `eu` PoP available, the router selects the lowest-latency healthy fallback globally (`uk-1` at 35ms).",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 13,
    matchKeywords: ["alarm", "flapping", "consecutive", "ram", "streak"],
    realWorldUse:
      "Used by Datadog, Prometheus Alertmanager (`for: 2m`), and AWS CloudWatch (`datapoints to alarm`) to ignore brief 1-sample spikes and prevent pager fatigue.",
    analogyTitle: "Anti-Flapping Consecutive Breach Counter",
    analogyText:
      "A single spike shouldn't wake engineers at 3 AM! Maintain `streak = 0`: increment `streak += 1` whenever `s >= threshold` (triggering `'WARN'` the moment `streak >= consecutive_needed`), and reset `streak = 0` on any healthy reading.",
    cheatSheet: `streak = 0
for s in samples:
    if s >= threshold:
        streak += 1
        if streak >= consecutive_needed:
            return "WARN"
    else:
        streak = 0
return "OK"`,
    commonPitfall: {
      title: "Counting total high samples instead of resetting streak on healthy dips",
      wrongCode:
        "count = sum(1 for s in samples if s >= threshold)  # Counts non-consecutive spikes!",
      rightCode:
        "if s >= threshold:\n    streak += 1\nelse:\n    streak = 0",
      explanation:
        "`[95, 70, 88, 92]` has 2 high samples overall, but NOT 2 consecutive breaches—resetting `streak = 0` prevents false alarms!",
    },
    guidedCode: `def evaluate_ram_alarm(samples, threshold, consecutive_needed):
    streak = 0
    for s in samples:
        # 👉 Step 1: Increment consecutive breach streak if s >= threshold
        if s >= threshold:
            streak += 1
            # 👉 Step 2: Trigger WARN once consecutive_needed is met
            if streak >= consecutive_needed:
                return "WARN"
        else:
            # 👉 Step 3: Reset streak immediately on a healthy sample
            streak = 0
    return "OK"

print(evaluate_ram_alarm([95, 70, 88, 92], 90, 2), evaluate_ram_alarm([95, 70, 92, 94], 90, 2))`,
    solutionCode: `def evaluate_ram_alarm(samples, threshold, consecutive_needed):
    streak = 0
    for s in samples:
        if s >= threshold:
            streak += 1
            if streak >= consecutive_needed:
                return "WARN"
        else:
            streak = 0
    return "OK"

print(evaluate_ram_alarm([95, 70, 88, 92], 90, 2), evaluate_ram_alarm([95, 70, 92, 94], 90, 2))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Requiring `k` consecutive violations filters out transient GC pauses in O(1) memory while adding at most `k - 1` polling intervals of detection latency.",
      followUp:
        "How does 'M of N evaluation' (e.g. warn if 3 out of the last 5 minutes breached) balance strict streaks vs noisy networks?",
    },
    quiz: {
      question:
        "With `threshold = 90` and `consecutive_needed = 2`, what does `evaluate_ram_alarm([95, 70, 88, 92], 90, 2)` return?",
      options: ['"OK"', '"WARN"', '"95"'],
      correctIndex: 0,
      explanation:
        "The `70` and `88` reset the breach streak between `95` and `92`, so no 2 consecutive samples breached 90!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 14,
    matchKeywords: ["feature flag", "rollout", "percentage", "kill switch", "modulo"],
    realWorldUse:
      "Used by LaunchDarkly, Statsig, and Instagram to roll out risky features to 10% -> 25% -> 100% of users consistently across reloads without flipping randomly.",
    analogyTitle: "Kill-Switch Guard + Deterministic Modulo Bucket",
    analogyText:
      "First check `cfg = flags.get(feature)`: if missing or `not cfg.get('enabled')`, immediately return `False` (the emergency kill switch!). Otherwise bucket the user deterministically with `user_id % 100 < cfg.get('rollout_pct', 0)`.",
    cheatSheet: `cfg = flags.get(feature)
if not cfg or not cfg.get("enabled"):
    return False
return (user_id % 100) < cfg.get("rollout_pct", 0)`,
    commonPitfall: {
      title: "Using <= rollout_pct (gives 26% instead of 25%) or ignoring kill-switch",
      wrongCode:
        "return user_id % 100 <= cfg['rollout_pct']  # Buckets 0..25 = 26 out of 100!",
      rightCode:
        "if not cfg or not cfg.get('enabled'): return False\nreturn (user_id % 100) < cfg.get('rollout_pct', 0)",
      explanation:
        "Buckets run `0..99`, so `< 25` selects buckets `0..24` (exact 25%) and `rollout_pct = 0` cleanly selects nobody!",
    },
    guidedCode: `def is_feature_enabled(flags, feature, user_id):
    # 👉 Step 1: Check feature existence & enabled kill-switch
    cfg = flags.get(feature)
    if not cfg or not cfg.get("enabled"):
        return False
    # 👉 Step 2: Bucket user deterministically in 0..99 and compare < rollout_pct
    return (user_id % 100) < cfg.get("rollout_pct", 0)

cfg = {"ai_search": {"enabled": True, "rollout_pct": 25}, "old_ui": {"enabled": False, "rollout_pct": 100}}
print(is_feature_enabled(cfg, "ai_search", 110), is_feature_enabled(cfg, "ai_search", 140))`,
    solutionCode: `def is_feature_enabled(flags, feature, user_id):
    cfg = flags.get(feature)
    if not cfg or not cfg.get("enabled"):
        return False
    return (user_id % 100) < cfg.get("rollout_pct", 0)

cfg = {"ai_search": {"enabled": True, "rollout_pct": 25}, "old_ui": {"enabled": False, "rollout_pct": 100}}
print(is_feature_enabled(cfg, "ai_search", 110), is_feature_enabled(cfg, "ai_search", 140))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Deterministic hashing (`% 100`) ensures the same user gets a sticky experience across API servers without storing per-user flags in a database.",
      followUp:
        "Why do real feature flag SDKs hash `(feature_name + ':' + str(user_id))` before `% 100` instead of bare `user_id % 100`? So independent experiments don't always hit the exact same 10% of users!",
    },
    quiz: {
      question:
        "With `rollout_pct = 25` and `enabled = True`, should `user_id = 125` (bucket `25`) get the feature?",
      options: [
        "No (`False`) — buckets `0..24` already cover 25%, so `25 < 25` is `False`",
        "Yes (`True`) — `25 <= 25`",
        "Only on Mondays",
      ],
      correctIndex: 0,
      explanation:
        "Because 0-indexed buckets `0..24` are already 25 buckets, strict `< rollout_pct` guarantees `0%` turns off all users and `25%` matches exactly 25 out of 100.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 15,
    matchKeywords: ["payload", "upload", "mime", "validation", "gateway"],
    realWorldUse:
      "Used by Discord, Stripe, and S3 upload gateways to reject empty payloads, oversized files, and banned executables (`.exe`) before touching backend storage.",
    analogyTitle: "Multi-Rule Border Check at the API Gateway",
    analogyText:
      "Check constraints in priority order: first reject empty payloads (`size_mb <= 0` -> `'EMPTY_FILE'`), then oversized uploads (`size_mb > max_mb` -> `'TOO_LARGE'`), then unsupported MIME types (`content_type not in allowed_types` -> `'BAD_TYPE'`).",
    cheatSheet: `def validate_upload(size_mb, max_mb, content_type, allowed_types):
    if size_mb <= 0:
        return {"ok": False, "reason": "EMPTY_FILE"}
    if size_mb > max_mb:
        return {"ok": False, "reason": "TOO_LARGE"}
    if content_type not in allowed_types:
        return {"ok": False, "reason": "BAD_TYPE"}
    return {"ok": True, "reason": "OK"}`,
    commonPitfall: {
      title: "Only checking size_mb <= max_mb and letting 0-byte or malicious .exe files pass",
      wrongCode:
        "return size_mb <= max_mb  # Accepts 0 MB files & application/x-msdownload!",
      rightCode:
        "if size_mb <= 0: return {'ok': False, 'reason': 'EMPTY_FILE'}\n# then TOO_LARGE and BAD_TYPE checks",
      explanation:
        "Gateways validate size bounds AND MIME allowlists explicitly, returning structured failure reasons so clients know what to fix.",
    },
    guidedCode: `def validate_upload(size_mb, max_mb, content_type, allowed_types):
    # 👉 Step 1: Reject empty/zero-byte payloads
    if size_mb <= 0:
        return {"ok": False, "reason": "EMPTY_FILE"}
    # 👉 Step 2: Reject payloads exceeding max_mb
    if size_mb > max_mb:
        return {"ok": False, "reason": "TOO_LARGE"}
    # 👉 Step 3: Enforce MIME allowlist before returning OK
    if content_type not in allowed_types:
        return {"ok": False, "reason": "BAD_TYPE"}
    return {"ok": True, "reason": "OK"}

print(validate_upload(10, 25, "image/png", ["image/png", "image/jpeg"]))`,
    solutionCode: `def validate_upload(size_mb, max_mb, content_type, allowed_types):
    if size_mb <= 0:
        return {"ok": False, "reason": "EMPTY_FILE"}
    if size_mb > max_mb:
        return {"ok": False, "reason": "TOO_LARGE"}
    if content_type not in allowed_types:
        return {"ok": False, "reason": "BAD_TYPE"}
    return {"ok": True, "reason": "OK"}

print(validate_upload(10, 25, "image/png", ["image/png", "image/jpeg"]))`,
    proInsights: {
      timeComplexity: "O(1) with small allowlist (or set)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Failing fast at the gateway saves bandwidth and worker RAM, though `Content-Type` headers alone can be spoofed—verify file magic bytes asynchronously.",
      followUp:
        "How do pre-signed S3 upload policies enforce `content-length-range` directly at object storage without routing bytes through your API?",
    },
    quiz: {
      question:
        'Why should `size_mb <= 0` be rejected with `"EMPTY_FILE"` instead of just checking `size_mb <= max_mb`?',
      options: [
        "0-byte uploads are valid under `<= max_mb` (`0 <= 25`), which causes empty broken files in storage",
        "Negative sizes automatically convert to MB in Python",
        "`<=` throws a `TypeError` when comparing zero",
      ],
      correctIndex: 0,
      explanation:
        "Both bounds matter (`0 < size_mb <= max_mb`) so broken empty files and oversized uploads are caught cleanly!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 16,
    matchKeywords: ["autoscaler", "ceiling division", "workers", "clamp", "queue"],
    realWorldUse:
      "Used by Kubernetes HPA (Horizontal Pod Autoscaler) and AWS ECS target tracking to compute exact replica counts from backlog depth.",
    analogyTitle: "Ceiling Division + Min/Max Safety Guardrails",
    analogyText:
      "12 queued jobs divided by 5 jobs per worker needs **3** workers (not `12 // 5 = 2`)! Use integer ceiling division `(queue_len + target_per_worker - 1) // target_per_worker`, then clamp between a floor of `1` standby worker and `max_workers`.",
    cheatSheet: `if queue_len <= 0:
    return 1
needed = (queue_len + target_per_worker - 1) // target_per_worker
return max(1, min(needed, max_workers))`,
    commonPitfall: {
      title: "Using floor division (drops remainder) or returning 0 workers when empty",
      wrongCode:
        "return queue_len // target_per_worker  # 12 // 5 -> 2 workers (backlog stalls)!",
      rightCode:
        "needed = (queue_len + target_per_worker - 1) // target_per_worker\nreturn max(1, min(needed, max_workers))",
      explanation:
        "Floor division leaves jobs stranded without enough capacity, and `max(1, ...)` keeps at least 1 warm standby worker running.",
    },
    guidedCode: `def scale_workers(queue_len, target_per_worker, max_workers):
    # 👉 Step 1: Always keep at least 1 standby worker
    if queue_len <= 0:
        return 1
    # 👉 Step 2: Ceiling division to cover any remainder jobs
    needed = (queue_len + target_per_worker - 1) // target_per_worker
    # 👉 Step 3: Clamp between 1 and max_workers ceiling
    return max(1, min(needed, max_workers))

print(scale_workers(12, 5, 10), scale_workers(0, 5, 10), scale_workers(100, 5, 8))`,
    solutionCode: `def scale_workers(queue_len, target_per_worker, max_workers):
    if queue_len <= 0:
        return 1
    needed = (queue_len + target_per_worker - 1) // target_per_worker
    return max(1, min(needed, max_workers))

print(scale_workers(12, 5, 10), scale_workers(0, 5, 10), scale_workers(100, 5, 8))`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Integer ceiling division avoids floating-point precision drift of `math.ceil()`, while `max_workers` protects downstream databases from connection-pool exhaustion.",
      followUp:
        "Why do production autoscalers scale UP aggressively on backlog spikes but enforce a 3-5 minute stabilization window before scaling DOWN?",
    },
    quiz: {
      question:
        "With `queue_len = 12`, `target_per_worker = 5`, and `max_workers = 10`, what does `(12 + 5 - 1) // 5` compute?",
      options: ["3 workers", "2 workers", "12 workers"],
      correctIndex: 0,
      explanation:
        "`(12 + 4) // 5 = 16 // 5 = 3`, rounding up cleanly without `math.ceil()`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 17,
    matchKeywords: ["api key", "auth", "expiry", "rbac", "scopes"],
    realWorldUse:
      "Used by Stripe, GitHub Personal Access Tokens, and OpenAI gateways to enforce key existence, revocation (`active`), TTL expiration, and RBAC permission scopes in one check.",
    analogyTitle: "Four-Lock Zero-Trust Gateway Check",
    analogyText:
      "A valid key ID isn't enough! Look up `rec = key_store.get(api_key)` and verify all 4 gates: exists (`rec`), not revoked (`rec['active']`), not expired (`now_ts < rec['expires_at']`), and has permission (`required_scope in rec['scopes']`).",
    cheatSheet: `rec = key_store.get(api_key)
if not rec:
    return False
return bool(
    rec.get("active")
    and now_ts < rec.get("expires_at", 0)
    and required_scope in rec.get("scopes", [])
)`,
    commonPitfall: {
      title: "Checking `now_ts <= expires_at` or ignoring revoked keys",
      wrongCode:
        "return api_key in key_store  # Allows expired and revoked keys!",
      rightCode:
        "return bool(rec and rec['active'] and now_ts < rec['expires_at'] and required_scope in rec['scopes'])",
      explanation:
        "Tokens expire the exact second `now_ts == expires_at` (`<`), and compromised tokens with `active=False` must fail immediately.",
    },
    guidedCode: `def authorize_request(key_store, api_key, required_scope, now_ts):
    # 👉 Step 1: Reject unknown keys safely via .get()
    rec = key_store.get(api_key)
    if not rec:
        return False
    # 👉 Step 2: Check active status, strict TTL expiry, and RBAC scope
    return bool(
        rec.get("active")
        and now_ts < rec.get("expires_at", 0)
        and required_scope in rec.get("scopes", [])
    )

keys = {
    "k1": {"active": True, "expires_at": 100, "scopes": ["read", "write"]},
    "k2": {"active": False, "expires_at": 200, "scopes": ["read"]},
}
print(authorize_request(keys, "k1", "write", 50), authorize_request(keys, "k1", "write", 100))`,
    solutionCode: `def authorize_request(key_store, api_key, required_scope, now_ts):
    rec = key_store.get(api_key)
    if not rec:
        return False
    return bool(
        rec.get("active")
        and now_ts < rec.get("expires_at", 0)
        and required_scope in rec.get("scopes", [])
    )

keys = {
    "k1": {"active": True, "expires_at": 100, "scopes": ["read", "write"]},
    "k2": {"active": False, "expires_at": 200, "scopes": ["read"]},
}
print(authorize_request(keys, "k1", "write", 50), authorize_request(keys, "k1", "write", 100))`,
    proInsights: {
      timeComplexity: "O(1) lookup + O(s) scopes",
      spaceComplexity: "O(1)",
      tradeoff:
        "Short-lived scoped keys limit blast radius if leaked; stateless JWTs skip DB lookups but cannot be immediately revoked without a Redis denylist.",
      followUp:
        "Why should production key stores hash API secrets with SHA-256 or HMAC rather than indexing plaintext tokens?",
    },
    quiz: {
      question:
        "If `expires_at = 100` and `now_ts = 100`, what should `authorize_request` return under strict TTL `now_ts < expires_at`?",
      options: ["False (expired at t=100)", "True", "None"],
      correctIndex: 0,
      explanation:
        "Strict inequality `now_ts < expires_at` ensures a key with expiry timestamp `100` stops working as soon as the clock hits `100`.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 18,
    matchKeywords: ["pagination", "slice", "has_next", "total_pages", "offset"],
    realWorldUse:
      "Used in REST and GraphQL API responses (`GitHub`, `Stripe`, `Shopify`) so frontends know both the current page slice and whether a 'Next Page' button should render.",
    analogyTitle: "Complete Pagination Envelope (`items`, `has_next`, `total_pages`)",
    analogyText:
      "Compute `total_pages = (len(items) + page_size - 1) // page_size` (0 if empty). Slice `items[start : start + page_size]` where `start = (page - 1) * page_size`, and set `has_next = page < total_pages`!",
    cheatSheet: `if not items or page_size <= 0:
    return {"items": [], "has_next": False, "total_pages": 0}
total_pages = (len(items) + page_size - 1) // page_size
start = (page - 1) * page_size
return {
    "items": items[start : start + page_size],
    "has_next": page < total_pages,
    "total_pages": total_pages,
}`,
    commonPitfall: {
      title: "Setting has_next = True on the final exact-fit page or miscomputing total_pages",
      wrongCode:
        "total_pages = len(items) // page_size  # Drops partial last page on 5 items / size 2!",
      rightCode:
        "total_pages = (len(items) + page_size - 1) // page_size\nhas_next = page < total_pages",
      explanation:
        "5 items with `page_size=2` takes `3` total pages (`[a,b]`, `[c,d]`, `[e]`), and `has_next` is `False` whenever `page >= total_pages`.",
    },
    guidedCode: `def paginate_items(items, page, page_size):
    # 👉 Step 1: Handle empty list safely with 0 total_pages
    if not items or page_size <= 0:
        return {"items": [], "has_next": False, "total_pages": 0}
    # 👉 Step 2: Compute ceiling total_pages and page slice bounds
    total_pages = (len(items) + page_size - 1) // page_size
    start = (page - 1) * page_size
    # 👉 Step 3: Return envelope with has_next metadata
    return {
        "items": items[start : start + page_size],
        "has_next": page < total_pages,
        "total_pages": total_pages,
    }

print(paginate_items(["a", "b", "c", "d", "e"], 2, 2))`,
    solutionCode: `def paginate_items(items, page, page_size):
    if not items or page_size <= 0:
        return {"items": [], "has_next": False, "total_pages": 0}
    total_pages = (len(items) + page_size - 1) // page_size
    start = (page - 1) * page_size
    return {
        "items": items[start : start + page_size],
        "has_next": page < total_pages,
        "total_pages": total_pages,
    }

print(paginate_items(["a", "b", "c", "d", "e"], 2, 2))`,
    proInsights: {
      timeComplexity: "O(page_size) slice",
      spaceComplexity: "O(page_size)",
      tradeoff:
        "Offset pagination lets users jump straight to page 7, but on live DB tables inserts between requests shift rows—making cursor (`keyset`) pagination better for activity feeds.",
      followUp:
        "In SQL/API pagination, how can fetching `limit + 1` rows tell you `has_next` without running an expensive `SELECT COUNT(*)`?",
    },
    quiz: {
      question:
        "Given 4 items with `page = 2` and `page_size = 2`, what is `has_next`?",
      options: ["False (page 2 of 2 is the last page)", "True", "None"],
      correctIndex: 0,
      explanation:
        "`total_pages` is `2`, so on `page = 2`, `2 < 2` is `False` — there is no Page 3!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 19,
    matchKeywords: ["cache-aside", "read-through", "redis", "cache warming"],
    realWorldUse:
      "The #1 Redis caching architecture in production backends (Instagram, Airbnb, Slack): hit RAM first, populate Redis on DB read, and avoid caching missing rows unnecessarily.",
    analogyTitle: "Cache-Aside Read-Through Pattern",
    analogyText:
      "Format `key = f'user:{user_id}:profile'`. If `key in cache`, return `{'source': 'cache', ...}` instantly! Else query `db`: if found, warm `cache[key] = db[user_id]` before returning `'db'`; if missing in both, return `'miss'` without polluting `cache`.",
    cheatSheet: `key = f"user:{user_id}:profile"
if key in cache:
    return {"source": "cache", "data": cache[key]}
if user_id in db:
    cache[key] = db[user_id]
    return {"source": "db", "data": db[user_id]}
return {"source": "miss", "data": None}`,
    commonPitfall: {
      title: "Forgetting to warm cache[key] on a DB hit or caching None misses",
      wrongCode:
        "if user_id in db: return {'source': 'db', 'data': db[user_id]}  # Never warms cache!",
      rightCode:
        "if user_id in db:\n    cache[key] = db[user_id]\n    return {'source': 'db', 'data': db[user_id]}",
      explanation:
        "Without writing `cache[key] = db[user_id]`, the second call hits the slow DB all over again; and skipping nonexistent IDs keeps Redis clean.",
    },
    guidedCode: `def fetch_user_profile(cache, db, user_id):
    key = f"user:{user_id}:profile"
    # 👉 Step 1: Return cache hit immediately if key exists in cache
    if key in cache:
        return {"source": "cache", "data": cache[key]}
    # 👉 Step 2: Query DB, warm cache[key] on hit, and return result
    if user_id in db:
        cache[key] = db[user_id]
        return {"source": "db", "data": db[user_id]}
    # 👉 Step 3: Return miss without caching absent keys
    return {"source": "miss", "data": None}

c = {}
d = {42: "Aria"}
print(fetch_user_profile(c, d, 42), fetch_user_profile(c, d, 42))`,
    solutionCode: `def fetch_user_profile(cache, db, user_id):
    key = f"user:{user_id}:profile"
    if key in cache:
        return {"source": "cache", "data": cache[key]}
    if user_id in db:
        cache[key] = db[user_id]
        return {"source": "db", "data": db[user_id]}
    return {"source": "miss", "data": None}

c = {}
d = {42: "Aria"}
print(fetch_user_profile(c, d, 42), fetch_user_profile(c, d, 42))`,
    proInsights: {
      timeComplexity: "O(1) cache lookup",
      spaceComplexity: "O(1) per cached entry",
      tradeoff:
        "Cache-Aside keeps only actually requested rows hot in RAM; pair every cached key with a TTL and cache invalidation on writes so stale profiles don't linger forever.",
      followUp:
        "What is 'Cache Penetration' (attackers requesting thousands of missing IDs like `-1`) and when DO engineers short-TTL cache a null sentinel or Bloom filter?",
    },
    quiz: {
      question:
        "In Cache-Aside, what happens on the FIRST request for `user_id = 42` if `cache` starts empty and `db[42] = 'Aria'`?",
      options: [
        "It reads `'Aria'` from `db`, writes `cache['user:42:profile'] = 'Aria'`, and returns `source: 'db'`",
        "It returns `source: 'cache'` right away",
        "It deletes user 42 from `db`",
      ],
      correctIndex: 0,
      explanation:
        "Read #1 populates the cache (`source: 'db'`) so Read #2 and beyond become fast RAM hits (`source: 'cache'`)!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 20,
    matchKeywords: ["batch", "chunk", "slice", "step", "notifications"],
    realWorldUse:
      "Used by Firebase Cloud Messaging, SendGrid bulk mailers, and SQL `INSERT` chunkers to split huge user lists into safe fixed-size payload batches.",
    analogyTitle: "Stepped Slicing with `range(0, len(user_ids), batch_size)`",
    analogyText:
      "First guard `batch_size <= 0` (otherwise `range(..., 0)` throws `ValueError`!). Then step `i` by `batch_size` and slice `user_ids[i : i + batch_size]`—Python automatically clamps the final slice so partial trailing batches stay intact!",
    cheatSheet: `if batch_size <= 0:
    return []
return [user_ids[i : i + batch_size] for i in range(0, len(user_ids), batch_size)]`,
    commonPitfall: {
      title: "Crashing on batch_size <= 0 or dropping the partial final batch",
      wrongCode:
        "return [user_ids[i:i+batch_size] for i in range(0, len(user_ids), batch_size)]  # Crashes when batch_size == 0!",
      rightCode:
        "if batch_size <= 0:\n    return []\nreturn [user_ids[i : i + batch_size] for i in range(0, len(user_ids), batch_size)]",
      explanation:
        "Stepping `range()` by `0` raises `ValueError`; guarding `batch_size <= 0` first keeps the chunker crash-proof while preserving trailing batches.",
    },
    guidedCode: `def build_batches(user_ids, batch_size):
    # 👉 Step 1: Guard against zero or negative batch sizes
    if batch_size <= 0:
        return []
    # 👉 Step 2: Slice user_ids in fixed steps of batch_size
    return [user_ids[i : i + batch_size] for i in range(0, len(user_ids), batch_size)]

print(build_batches([1, 2, 3, 4, 5], 2))`,
    solutionCode: `def build_batches(user_ids, batch_size):
    if batch_size <= 0:
        return []
    return [user_ids[i : i + batch_size] for i in range(0, len(user_ids), batch_size)]

print(build_batches([1, 2, 3, 4, 5], 2))`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Stepped slicing preserves every trailing item without losing partial batches; if streaming millions of IDs, `yield` slices via a generator (or `itertools.batched` in Python 3.12+) to hold only 1 batch in memory at a time.",
      followUp:
        "Why should downstream batch receivers make each batch request idempotent (using a `batch_id`) in case a partial network timeout retries an entire 100-item chunk?",
    },
    quiz: {
      question:
        "What does `[1, 2, 3, 4, 5][4 : 4 + 2]` evaluate to in Python when `4 + 2` goes past the end of the list?",
      options: [
        "`[5]` — Python slice endpoints clamp safely without `IndexError`",
        "`IndexError: list index out of range`",
        "`[5, None]`",
      ],
      correctIndex: 0,
      explanation:
        "Python slices automatically stop at `len(list)`, making stepped slicing `[i : i + batch_size]` naturally handle trailing partial batches!",
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
