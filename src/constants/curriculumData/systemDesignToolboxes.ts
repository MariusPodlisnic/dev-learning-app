import { LessonToolboxEntry } from "./types";

export const SYSTEM_DESIGN_TOOLBOXES: LessonToolboxEntry[] = [
  // ============================================================================
  // CHAPTER I: TRAFFIC & CACHING LAYERS (Modules 01 - 04)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 1,
    tools: [
      {
        toolName: "Cache-Aside Key-Value Lookup (Redis Pattern)",
        badge: "IN-MEMORY CACHE",
        purpose:
          "Checks fast in-memory cache before querying a slow database to achieve sub-millisecond response times.",
        syntaxPattern: "if key in cache:\n    return cache[key]  # Cache Hit\nval = db.get(key)      # Cache Miss\ncache[key] = val\nreturn val",
        variations: [
          {
            label: "1. Cache Hit (immediate return)",
            code: 'cache = {"post_1": "Hello World"}\nif "post_1" in cache:\n    print("HIT:", cache["post_1"])',
            output: "HIT: Hello World",
            note: "Key is already in memory, avoiding a slow disk or network database query.",
          },
          {
            label: "2. Cache Miss & Store Pattern",
            code: 'cache = {}\nkey = "user_42"\nif key not in cache:\n    # fetch from db:\n    cache[key] = "Alice"\nprint("Cached:", cache[key])',
            output: "Cached: Alice",
            note: "On miss, data is read from primary store and populated into cache for future requests.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 2,
    tools: [
      {
        toolName: "Token Bucket & Rate Limit Counter",
        badge: "RATE LIMITING",
        purpose:
          "Limits incoming API requests to a fixed quota per user to prevent abuse and denial-of-service.",
        syntaxPattern: "if tokens >= cost:\n    tokens -= cost\n    return True  # 200 OK\nreturn False     # 429 Too Many Requests",
        variations: [
          {
            label: "1. Deducting token from available bucket",
            code: "tokens = 10\nif tokens >= 1:\n    tokens -= 1\n    print('Allowed. Remaining tokens:', tokens)",
            output: "Allowed. Remaining tokens: 9",
            note: "Each allowed request consumes 1 token from the user's quota.",
          },
          {
            label: "2. Rejecting when bucket is exhausted (HTTP 429)",
            code: "tokens = 0\nstatus = 'ALLOWED' if tokens >= 1 else 'HTTP 429 RATELIMITED'\nprint(status)",
            output: "HTTP 429 RATELIMITED",
            note: "Returns HTTP status 429 when client exceeds allowable rate limit.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 3,
    tools: [
      {
        toolName: "LRU Eviction & Ordered Cache Sizing",
        badge: "CACHE EVICTION",
        purpose:
          "Evicts the least recently used entry when memory reaches maximum capacity to keep cache size bounded.",
        syntaxPattern: "if len(cache) >= max_size:\n    oldest_key = list(cache.keys())[0]\n    del cache[oldest_key]\ncache[new_key] = new_value",
        variations: [
          {
            label: "1. Checking capacity before inserting",
            code: "cache = {'a': 1, 'b': 2}\nmax_size = 2\nis_full = len(cache) >= max_size\nprint('Is cache full?', is_full)",
            output: "Is cache full? True",
            note: "When cache length reaches max_size, an eviction policy must discard 1 item.",
          },
          {
            label: "2. Evicting the oldest key",
            code: "cache = {'old': 1, 'active': 2}\ndel cache['old']\nprint('Remaining:', list(cache.keys()))",
            output: "Remaining: ['active']",
            note: "del cache[key] frees memory immediately in O(1) time.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 4,
    tools: [
      {
        toolName: "request_index % len(servers) — Round-Robin Router",
        badge: "LOAD BALANCING",
        purpose:
          "Distributes incoming requests evenly across a server fleet by cycling indices with modulo (%).",
        syntaxPattern: "slot = request_index % len(servers)\nassigned_server = servers[slot]",
        variations: [
          {
            label: "1. Selecting server by cyclic index",
            code: 'fleet = ["srv-alpha", "srv-beta", "srv-gamma"]\nreq_idx = 4\nslot = req_idx % len(fleet)\nprint(fleet[slot])',
            output: "srv-beta",
            note: "4 % 3 is 1, so request #4 routes to fleet[1] ('srv-beta').",
          },
          {
            label: "2. Verifying wrap-around distribution",
            code: "slots = [i % 3 for i in range(6)]\nprint(slots)",
            output: "[0, 1, 2, 0, 1, 2]",
            note: "Modulo ensures indices cycle infinitely: 0, 1, 2, 0, 1, 2...",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER II: MESSAGING & DISTRIBUTED CONSENSUS (Modules 05 - 08)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 5,
    tools: [
      {
        toolName: "user_id % num_shards — Horizontal Partitioning",
        badge: "DATABASE SHARDING",
        purpose:
          "Maps entity IDs to dedicated partition shards in O(1) time so databases scale horizontally.",
        syntaxPattern: "shard_id = user_id % num_shards\nshard_name = f\"shard_{shard_id}\"",
        variations: [
          {
            label: "1. Computing partition shard ID",
            code: 'user_id = 42\nnum_shards = 4\nshard_id = user_id % num_shards\nprint(f"shard_{shard_id}")',
            output: "shard_2",
            note: "42 % 4 is 2. User 42 consistently resolves to shard_2.",
          },
          {
            label: "2. Sharding across 8 nodes",
            code: "user_id = 105\nprint('Shard:', user_id % 8)",
            output: "Shard: 1",
            note: "Even with millions of users, every lookup resolves in O(1) time.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 6,
    tools: [
      {
        toolName: "failures >= threshold — Circuit Breaker State",
        badge: "FAULT TOLERANCE",
        purpose:
          "Trips an unhealthy dependency to 'OPEN' state to stop cascading timeouts across services.",
        syntaxPattern: "if failures >= threshold:\n    return \"OPEN\"   # Fail fast!\nreturn \"CLOSED\"     # Normal traffic",
        variations: [
          {
            label: "1. Tripping circuit when threshold met",
            code: 'failures = 5\nthreshold = 5\nstate = "OPEN" if failures >= threshold else "CLOSED"\nprint(state)',
            output: "OPEN",
            note: "5 >= 5 evaluates to True, immediately preventing outgoing network requests.",
          },
          {
            label: "2. Permitting traffic under healthy conditions",
            code: 'failures = 2\nthreshold = 5\nstate = "OPEN" if failures >= threshold else "CLOSED"\nprint(state)',
            output: "CLOSED",
            note: "When failures are below threshold, traffic flows normally.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 7,
    tools: [
      {
        toolName: "votes.count(True) > len(votes) / 2 — Quorum Validator",
        badge: "DISTRIBUTED CONSENSUS",
        purpose:
          "Checks whether a strict majority (> 50%) of cluster nodes acknowledge a replication write.",
        syntaxPattern: "yes_votes = votes.count(True)\nhas_quorum = yes_votes > len(votes) / 2",
        variations: [
          {
            label: "1. Checking 3 of 5 votes (majority)",
            code: "votes = [True, True, False, True, False]\nyes_votes = votes.count(True)\nis_majority = yes_votes > len(votes) / 2\nprint(is_majority)",
            output: "True",
            note: "3 is greater than 5 / 2 (2.5), satisfying strict majority quorum.",
          },
          {
            label: "2. Tie or minority rejection (2 of 4 votes)",
            code: "votes = [True, True, False, False]\nyes_votes = votes.count(True)\nprint(yes_votes > len(votes) / 2)",
            output: "False",
            note: "A tie (2 of 4) is not strictly greater than half, so quorum is not achieved.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 8,
    tools: [
      {
        toolName: "seen_ids & Deduplication Key (Idempotency)",
        badge: "MESSAGE QUEUES",
        purpose:
          "Ensures duplicate event deliveries produce identical results without charging or mutating state twice.",
        syntaxPattern: "if message_id in processed_ids:\n    return \"ALREADY_PROCESSED\"\nprocessed_ids.add(message_id)\nprocess(message)",
        variations: [
          {
            label: "1. Idempotency key verification",
            code: 'seen = {"tx_99"}\ncurr_tx = "tx_99"\nif curr_tx in seen:\n    print("Duplicate delivery skipped.")',
            output: "Duplicate delivery skipped.",
            note: "Prevents a payment from being executed twice on network retry.",
          },
          {
            label: "2. Adding newly processed key to set",
            code: 'seen = set()\nseen.add("tx_100")\nprint("tx_100" in seen)',
            output: "True",
            note: "Sets provide O(1) membership checks for high-throughput message ingestion.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER III: RESILIENCE & GLOBAL ROUTING (Modules 09 - 12)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 9,
    tools: [
      {
        toolName: "min(delay_ms, max_ms) — Exponential Backoff Cap",
        badge: "RETRY RESILIENCE",
        purpose:
          "Limits exponential reconnect wait times so an app never sleeps indefinitely when servers are down.",
        syntaxPattern: "wait_ms = min(calculated_delay, max_delay_cap)",
        variations: [
          {
            label: "1. Capping a high delay at max threshold",
            code: "delay = 1600\nmax_cap = 1000\nactual_wait = min(delay, max_cap)\nprint(actual_wait)",
            output: "1000",
            note: "min(1600, 1000) caps the wait at 1000ms instead of 1600ms.",
          },
          {
            label: "2. Allowing lower delays below cap",
            code: "delay = 400\nmax_cap = 1000\nprint(min(delay, max_cap))",
            output: "400",
            note: "When delay is below cap, the smaller calculated delay is respected.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 10,
    tools: [
      {
        toolName: "attempts >= 3 — Dead Letter Queue (DLQ) Rule",
        badge: "WORKER QUEUES",
        purpose:
          "Routes repeatedly failing jobs to a Dead Letter Queue or on-call engineer after 3 strikes.",
        syntaxPattern: "if attempts >= 3:\n    return \"ALERT_TEAM\"\nreturn \"RETRY\"",
        variations: [
          {
            label: "1. Trigger alert on 3rd failure",
            code: 'attempts = 3\nstatus = "ALERT_TEAM" if attempts >= 3 else "RETRY"\nprint(status)',
            output: "ALERT_TEAM",
            note: ">= 3 catches the 3rd attempt immediately to prevent infinite retry loops.",
          },
          {
            label: "2. Authorizing a standard retry on 1st attempt",
            code: 'attempts = 1\nstatus = "ALERT_TEAM" if attempts >= 3 else "RETRY"\nprint(status)',
            output: "RETRY",
            note: "Allows intermittent network hiccups to recover automatically.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 11,
    tools: [
      {
        toolName: "if primary_online — Automatic Failover Switch",
        badge: "HIGH AVAILABILITY",
        purpose:
          "Routes requests to primary nodes when healthy and automatically redirects to standby nodes on outage.",
        syntaxPattern: "if primary_online:\n    return \"primary\"\nreturn \"backup\"",
        variations: [
          {
            label: "1. Primary healthy -> routes to primary",
            code: 'primary_online = True\nserver = "primary" if primary_online else "backup"\nprint(server)',
            output: "primary",
            note: "Sends live traffic to primary cluster while status is healthy.",
          },
          {
            label: "2. Primary down -> routes to standby backup",
            code: 'primary_online = False\nserver = "primary" if primary_online else "backup"\nprint(server)',
            output: "backup",
            note: "Seamlessly diverts all traffic to hot standby without human intervention.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 12,
    tools: [
      {
        toolName: "cdn_map.get(region, 'global-edge') — Edge Routing",
        badge: "GLOBAL CDN",
        purpose:
          "Routes user traffic to the geographically nearest Point of Presence (PoP) with safe fallback.",
        syntaxPattern: "edge_server = cdn_map.get(user_region, \"global-edge\")",
        variations: [
          {
            label: "1. Regional cache hit",
            code: 'cdn = {"eu": "eu-west", "asia": "tokyo-edge"}\nprint(cdn.get("eu", "global-edge"))',
            output: "eu-west",
            note: "Matched region returns localized low-latency caching server.",
          },
          {
            label: "2. Unmapped region fallback",
            code: 'cdn = {"eu": "eu-west"}\nprint(cdn.get("sa", "global-edge"))',
            output: "global-edge",
            note: "Falls back safely to global edge PoP if region is missing.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER IV: ALARMS, FLAGS & AUTOSCALING (Modules 13 - 16)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 13,
    tools: [
      {
        toolName: "usage >= 90 — Telemetry & Threshold Alarm",
        badge: "OBSERVABILITY",
        purpose:
          "Checks CPU, memory, or disk utilization metrics and fires warnings before catastrophic OOM crashes.",
        syntaxPattern: "if usage >= 90:\n    return \"WARN\"\nreturn \"OK\"",
        variations: [
          {
            label: "1. High RAM usage warning (>= 90%)",
            code: 'usage = 92\nstatus = "WARN" if usage >= 90 else "OK"\nprint(status)',
            output: "WARN",
            note: "Alarms fire so auto-scaler or engineer can allocate additional RAM.",
          },
          {
            label: "2. Normal operational threshold",
            code: 'usage = 65\nstatus = "WARN" if usage >= 90 else "OK"\nprint(status)',
            output: "OK",
            note: "Usage below 90% is healthy and requires no intervention.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 14,
    tools: [
      {
        toolName: "flags.get(feature, False) — Feature Flag Toggle",
        badge: "RELEASE ENGINEERING",
        purpose:
          "Checks whether experimental or beta features are enabled in a config dictionary with False as default.",
        syntaxPattern: "is_enabled = flags.get(feature_name, False)",
        variations: [
          {
            label: "1. Explicitly enabled feature flag",
            code: 'flags = {"dark_mode": True}\nprint(flags.get("dark_mode", False))',
            output: "True",
            note: "Config dictionary contains feature with value True.",
          },
          {
            label: "2. Missing feature flag safe fallback",
            code: 'flags = {}\nprint(flags.get("beta_ai", False))',
            output: "False",
            note: "Missing flags default to False so unreleased features remain safely disabled.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 15,
    tools: [
      {
        toolName: "size_mb <= max_mb — Payload Boundary Guard",
        badge: "API GATEWAY",
        purpose:
          "Enforces maximum HTTP request size limits to protect servers from memory exhaustion.",
        syntaxPattern: "can_accept = (size_mb <= max_mb)",
        variations: [
          {
            label: "1. Valid upload within limit",
            code: "size_mb, max_mb = 10, 25\nprint(size_mb <= max_mb)",
            output: "True",
            note: "10 MB is within 25 MB limit and is allowed.",
          },
          {
            label: "2. Oversized payload rejection",
            code: "size_mb, max_mb = 40, 25\nprint(size_mb <= max_mb)",
            output: "False",
            note: "Returns False to immediately return HTTP 413 Payload Too Large.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 16,
    tools: [
      {
        toolName: "len(queue) > threshold — Auto-Scaling Trigger",
        badge: "AUTOSCALING",
        purpose:
          "Monitors pending queue backlog length to automatically trigger provisioning of additional worker pods.",
        syntaxPattern: "needs_scale_up = len(queue) > 5",
        variations: [
          {
            label: "1. Overloaded queue triggers scaling",
            code: 'jobs = ["j1", "j2", "j3", "j4", "j5", "j6"]\nprint(len(jobs) > 5)',
            output: "True",
            note: "6 jobs exceeds threshold of 5, signaling autoscaler to add an extra worker node.",
          },
          {
            label: "2. Light queue requires no extra worker",
            code: 'jobs = ["j1", "j2"]\nprint(len(jobs) > 5)',
            output: "False",
            note: "Existing workers can process current backlog without autoscaling.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER V: API KEYS, PAGINATION & BATCHES (Modules 17 - 20)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 17,
    tools: [
      {
        toolName: "api_key in valid_keys — Token Authorization Guard",
        badge: "API SECURITY",
        purpose:
          "Validates incoming bearer tokens or API keys against an active allowlist before granting access.",
        syntaxPattern: "is_authorized = api_key in valid_keys",
        variations: [
          {
            label: "1. Validated active API key",
            code: 'active_keys = ["key_live_1", "key_live_2"]\nprint("key_live_1" in active_keys)',
            output: "True",
            note: "Incoming key is recognized in the authorized active set.",
          },
          {
            label: "2. Unauthorized request rejection",
            code: 'active_keys = ["key_live_1"]\nprint("key_expired" in active_keys)',
            output: "False",
            note: "Returns False to reject request immediately with HTTP 401 Unauthorized.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 18,
    tools: [
      {
        toolName: "(page - 1) * page_size — SQL Offset Formula",
        badge: "DATABASE PAGINATION",
        purpose:
          "Calculates how many records to skip in SQL queries (LIMIT / OFFSET) for 1-based page indexing.",
        syntaxPattern: "offset = (page - 1) * page_size",
        variations: [
          {
            label: "1. Page 1 offset (skips 0 items)",
            code: "page = 1\npage_size = 10\noffset = (page - 1) * page_size\nprint(offset)",
            output: "0",
            note: "Page 1 skips 0 rows: returns items 0 to 9.",
          },
          {
            label: "2. Page 3 offset (skips 20 items)",
            code: "page = 3\npage_size = 10\noffset = (page - 1) * page_size\nprint(offset)",
            output: "20",
            note: "Page 3 skips the first 2 full pages of 10 items (skips 20): returns items 20 to 29.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 19,
    tools: [
      {
        toolName: "f'user:{id}:profile' — Cache Key Namespacing",
        badge: "REDIS NAMESPACING",
        purpose:
          "Constructs deterministic, colon-separated key names for Redis or Memcached to prevent key collision.",
        syntaxPattern: "cache_key = f\"user:{user_id}:profile\"",
        variations: [
          {
            label: "1. Standard user cache key formatting",
            code: 'uid = 42\nkey = f"user:{uid}:profile"\nprint(key)',
            output: "user:42:profile",
            note: "Colons (:) organize hierarchical folders in Redis graphical inspectors.",
          },
          {
            label: "2. Multi-parameter cache key",
            code: 'org_id, item_id = 9, 101\nprint(f"org:{org_id}:item:{item_id}")',
            output: "org:9:item:101",
            note: "Uniquely distinguishes items across multi-tenant cloud partitions.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 20,
    tools: [
      {
        toolName: "total // batch_size — Batch Sizing Math",
        badge: "BATCH WORKERS",
        purpose:
          "Computes the number of full batches required to process large datasets using integer floor division (//).",
        syntaxPattern: "full_batches = total_items // batch_size",
        variations: [
          {
            label: "1. Full batch count calculation",
            code: "total_users = 250\nbatch_size = 100\nfull_batches = total_users // batch_size\nprint(full_batches)",
            output: "2",
            note: "250 // 100 is 2. Represents 2 full batches of 100 (plus 50 remaining in final batch).",
          },
          {
            label: "2. Exact multiple batch calculation",
            code: "total_items = 500\nprint(total_items // 100)",
            output: "5",
            note: "500 divides into exactly 5 batches of 100 with 0 remainder.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 21,
    tools: [
      {
        toolName: "[t for t in timestamps if t > now - window_sec] — Window Pruner",
        badge: "SLIDING WINDOW",
        purpose:
          "Drops expired request timestamps strictly outside the trailing window before evaluating capacity.",
        syntaxPattern: "active = [t for t in timestamps if t > now - window_sec]",
        variations: [
          {
            label: "1. Pruning stale stamps at t=70 (30s window)",
            code: "cutoff = 70 - 30\nprint([t for t in [10, 40, 45, 55] if t > cutoff])",
            output: "[45, 55]",
            note: "Timestamp 40 (`now - window_sec`) is pruned strictly.",
          },
        ],
      },
      {
        toolName: "len(active) < limit — Admission Gate",
        badge: "RATE LIMIT",
        purpose:
          "Admits and appends the incoming timestamp only while active traffic remains strictly under limit.",
        syntaxPattern: "if len(active) < limit: active.append(now)",
        variations: [
          {
            label: "1. Admitting 3rd request under limit=3",
            code: "active = [45, 55]\nprint(len(active) < 3)",
            output: "True",
            note: "Admitting appends `now` so `active_count` becomes `3`.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 22,
    tools: [
      {
        toolName: "min(capacity, tokens + elapsed * refill_rate) — Lazy Refill",
        badge: "TOKEN BUCKET",
        purpose:
          "Calculates accrued burst tokens on demand using elapsed time, clamped cleanly at bucket capacity.",
        syntaxPattern: "available = min(capacity, tokens + max(0, now_ts - last_ts) * refill_rate)",
        variations: [
          {
            label: "1. Refilling 3s at 2 tokens/sec (cap 5)",
            code: "print(min(5, 1 + (13 - 10) * 2))",
            output: "5",
            note: "1 + 6 caps cleanly at `capacity = 5` before spending 1 token.",
          },
        ],
      },
      {
        toolName: "available >= 1 — Atomic Token Spend",
        badge: "ADMISSION GUARD",
        purpose:
          "Consumes 1 token only when balance covers the request, leaving empty buckets unchanged.",
        syntaxPattern: "if available >= 1: return available - 1",
        variations: [
          {
            label: "1. Rejecting empty bucket",
            code: "avail = 0\nprint(avail >= 1)",
            output: "False",
            note: "Rejected requests leave the token balance untouched.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 23,
    tools: [
      {
        toolName: "sorted(ring_nodes, key=lambda n: n[0]) — Clockwise Ring Sort",
        badge: "SHARD ROUTING",
        purpose:
          "Sorts (ring_pos, node_id) entries clockwise around the hash ring for deterministic routing.",
        syntaxPattern: "ordered = sorted(ring_nodes, key=lambda n: n[0])",
        variations: [
          {
            label: "1. Ordering unsorted shards",
            code: 'print(sorted([(90, "db-c"), (20, "db-a"), (55, "db-b")]))',
            output: "[(20, 'db-a'), (55, 'db-b'), (90, 'db-c')]",
            note: "Sorted ring positions allow deterministic clockwise scans.",
          },
        ],
      },
      {
        toolName: "ordered[0][1] — Circular Wrap Fallback",
        badge: "RING WRAP",
        purpose:
          "Wraps keys whose hash exceeds every node position back around to the first clockwise node.",
        syntaxPattern: "return ordered[0][1]",
        variations: [
          {
            label: "1. Key hash 95 wrapping past 90",
            code: 'ordered = [(20, "db-a"), (55, "db-b"), (90, "db-c")]\nprint(ordered[0][1])',
            output: "db-a",
            note: "Positions form a circle, so >90 lands on 20.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "system_design",
    matchOrder: 24,
    tools: [
      {
        toolName: "now_ts >= entry['expires_at'] — Inclusive TTL Boundary",
        badge: "EXPIRY CHECK",
        purpose:
          "Treats reads arriving exactly at or past expires_at as expired so stale values are never returned.",
        syntaxPattern: "if now_ts >= entry['expires_at']:",
        variations: [
          {
            label: "1. Checking exact TTL cutoff",
            code: "print(100 >= 100)",
            output: "True",
            note: "At `now_ts == expires_at`, the key is no longer valid.",
          },
        ],
      },
      {
        toolName: "del cache[key] — Lazy Cache Eviction",
        badge: "CACHE CLEANUP",
        purpose:
          "Purges expired entries on read so memory is reclaimed immediately without blocking scans.",
        syntaxPattern: "del cache[key]; return 'EXPIRED'",
        variations: [
          {
            label: "1. Removing stale key from dict",
            code: 'c = {"u1": 1}\ndel c["u1"]\nprint("u1" in c)',
            output: "False",
            note: "Subsequent reads immediately return `'MISS'`.",
          },
        ],
      },
    ],
  },
];
