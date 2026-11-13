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
  // CHAPTER III: RESILIENCE, FAILOVER & GLOBAL EDGE (Modules 09 - 12)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 9,
    tools: [
      {
        toolName: "base * (2 ** attempt) + jitter — Capped Exponential Backoff",
        badge: "RETRY RESILIENCE",
        purpose:
          "Doubles wait delays per retry attempt, mixes in jitter to stop thundering herds, and clamps at `max_ms`.",
        syntaxPattern:
          "delay = base_ms * (2 ** attempt) + jitter_ms\nwait_ms = max(0, min(delay, max_ms))",
        variations: [
          {
            label: "1. Attempt 2 backoff with 50ms jitter",
            code: "print(max(0, min(100 * (2 ** 2) + 50, 1000)))",
            output: "450",
            note: "100 * 4 + 50 = 450ms, well under the 1000ms ceiling.",
          },
          {
            label: "2. Attempt 4 clamped at max_ms",
            code: "print(max(0, min(100 * (2 ** 4) + 50, 1000)))",
            output: "1000",
            note: "1650ms is capped cleanly at 1000ms.",
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
        toolName: "retry / dlq Partition — Dead-Letter Queue (DLQ) Triage",
        badge: "MESSAGE QUEUES",
        purpose:
          "Quarantines poison-pill jobs that hit `attempts >= max_attempts` into `dlq` while preserving order in both lists.",
        syntaxPattern:
          "for job in jobs:\n    (dlq if job['attempts'] >= max_attempts else retry).append(job['id'])",
        variations: [
          {
            label: "1. Triage queue jobs in one O(n) pass",
            code: 'jobs = [{"id":"j1","attempts":1},{"id":"j2","attempts":3}]\nretry, dlq = [], []\nfor j in jobs:\n    (dlq if j["attempts"] >= 3 else retry).append(j["id"])\nprint({"retry": retry, "dlq": dlq})',
            output: "{'retry': ['j1'], 'dlq': ['j2']}",
            note: ">= max_attempts isolates failing tasks immediately on their final try.",
          },
          {
            label: "2. Empty queue base case",
            code: 'print({"retry": [], "dlq": []})',
            output: "{'retry': [], 'dlq': []}",
            note: "Always returns both bucket keys even when zero jobs arrive.",
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
        toolName: "min(healthy, key=lambda s: s['load']) — Least-Load Failover",
        badge: "HIGH AVAILABILITY",
        purpose:
          "Filters out failed health checks BEFORE picking the least-loaded active server (or `'UNAVAILABLE'`).",
        syntaxPattern:
          "live = [s for s in servers if s['healthy']]\nreturn min(live, key=lambda s: s['load'])['name'] if live else 'UNAVAILABLE'",
        variations: [
          {
            label: "1. Ignoring an offline server with low fake load",
            code: 'fleet = [{"name":"us-1","healthy":False,"load":10},{"name":"eu-1","healthy":True,"load":20}]\nlive = [s for s in fleet if s["healthy"]]\nprint(min(live, key=lambda s: s["load"])["name"])',
            output: "eu-1",
            note: "Offline us-1 is excluded even though its load (10) looks smaller.",
          },
          {
            label: "2. Graceful fleet-down sentinel",
            code: 'live = []\nprint(min(live)["name"] if live else "UNAVAILABLE")',
            output: "UNAVAILABLE",
            note: "Explicitly returns 'UNAVAILABLE' instead of raising ValueError on empty pool.",
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
        toolName: "Regional Edge Affinity + Global Latency Fallback",
        badge: "GLOBAL CDN",
        purpose:
          "Selects the fastest healthy PoP inside `region`, failing over to the lowest-latency healthy PoP globally or `'origin'`.",
        syntaxPattern:
          "healthy = [e for e in edges if e['healthy']]\nlocal = [e for e in healthy if e['region'] == region]\npool = local if local else healthy\nreturn min(pool, key=lambda e: e['latency_ms'])['id'] if pool else 'origin'",
        variations: [
          {
            label: "1. Regional edge down -> global lowest-latency edge",
            code: 'pops = [{"id":"eu-1","region":"eu","latency_ms":15,"healthy":False},{"id":"uk-1","region":"uk","latency_ms":35,"healthy":True},{"id":"us-1","region":"us","latency_ms":85,"healthy":True}]\nh = [e for e in pops if e["healthy"]]\nloc = [e for e in h if e["region"] == "eu"]\nprint(min(loc or h, key=lambda e: e["latency_ms"])["id"])',
            output: "uk-1",
            note: "Empty loc falls back cleanly via (loc or h) to uk-1 (35ms < 85ms).",
          },
          {
            label: "2. All PoPs offline -> origin fallback",
            code: 'pops = [{"id":"eu-1","healthy":False}]\nprint("origin" if not [e for e in pops if e["healthy"]] else "edge")',
            output: "origin",
            note: "Origin serves as last-resort fallback when every edge node fails.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER IV: OBSERVABILITY, ROLLOUTS & AUTOSCALING (Modules 13 - 16)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 13,
    tools: [
      {
        toolName: "Consecutive Streak Counter — Flap-Guarded Alarm",
        badge: "OBSERVABILITY",
        purpose:
          "Fires `'WARN'` only when `consecutive_needed` samples in a row breach `threshold`, resetting on any healthy dip.",
        syntaxPattern:
          "streak = 0\nfor s in samples:\n    streak = streak + 1 if s >= threshold else 0\n    if streak >= consecutive_needed: return 'WARN'",
        variations: [
          {
            label: "1. Single isolated spike resets cleanly",
            code: "streak = 0\nfor s in [95, 70, 88, 92]:\n    streak = streak + 1 if s >= 90 else 0\nprint('WARN' if streak >= 2 else 'OK')",
            output: "OK",
            note: "70 resets the counter so two separated spikes never page on-call.",
          },
          {
            label: "2. Back-to-back breach triggers WARN",
            code: "streak, status = 0, 'OK'\nfor s in [95, 70, 92, 94]:\n    streak = streak + 1 if s >= 90 else 0\n    if streak >= 2: status = 'WARN'; break\nprint(status)",
            output: "WARN",
            note: "Exits as soon as 2 consecutive samples stay >= 90.",
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
        toolName: "Kill-Switch + `user_id % 100 < rollout_pct` — Canary Flag",
        badge: "FEATURE FLAGS",
        purpose:
          "Combines an instant emergency `enabled` kill-switch with deterministic percentage bucketing for staged rollouts.",
        syntaxPattern:
          "cfg = flags.get(feature)\nreturn bool(cfg and cfg.get('enabled') and (user_id % 100) < cfg.get('rollout_pct', 0))",
        variations: [
          {
            label: "1. Bucket 10 inside 25% rollout vs bucket 40 outside",
            code: 'cfg = {"enabled": True, "rollout_pct": 25}\nprint(110 % 100 < cfg["rollout_pct"], 140 % 100 < cfg["rollout_pct"])',
            output: "True False",
            note: "Buckets 0..24 are enabled (< 25); buckets 25..99 stay on control.",
          },
          {
            label: "2. Emergency kill-switch overrides 100% rollout",
            code: 'cfg = {"enabled": False, "rollout_pct": 100}\nprint(bool(cfg["enabled"] and (42 % 100) < cfg["rollout_pct"]))',
            output: "False",
            note: "Toggling enabled=False disables the feature instantly for everyone.",
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
        toolName: "Ordered Size + MIME Allowlist Validator — Gateway Guard",
        badge: "API GATEWAY",
        purpose:
          "Validates empty uploads (`<= 0`), max payload size, and allowed MIME types before returning `{ok, reason}`.",
        syntaxPattern:
          "if size_mb <= 0: return {'ok': False, 'reason': 'EMPTY_FILE'}\nif size_mb > max_mb: return {'ok': False, 'reason': 'TOO_LARGE'}\nif content_type not in allowed_types: return {'ok': False, 'reason': 'BAD_TYPE'}",
        variations: [
          {
            label: "1. Structured gateway rejection reasons",
            code: 'def check(sz, mx, mime, ok):\n    if sz <= 0: return "EMPTY_FILE"\n    if sz > mx: return "TOO_LARGE"\n    if mime not in ok: return "BAD_TYPE"\n    return "OK"\nprint(check(0, 25, "image/png", ["image/png"]), check(30, 25, "image/png", ["image/png"]))',
            output: "EMPTY_FILE TOO_LARGE",
            note: "Returns actionable machine-readable status codes for clients.",
          },
          {
            label: "2. Rejecting disallowed executable uploads",
            code: 'print("application/x-msdownload" in ["image/png", "image/jpeg"])',
            output: "False",
            note: "Strict allowlist blocks arbitrary binaries even when small.",
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
        toolName: "Ceiling Division + `[1, max_workers]` Clamp — Autoscaler",
        badge: "AUTOSCALING",
        purpose:
          "Computes worker replica count via integer ceiling division and bounds between a 1-worker floor and `max_workers` ceiling.",
        syntaxPattern:
          "needed = (queue_len + target_per_worker - 1) // target_per_worker\nworkers = max(1, min(needed, max_workers))",
        variations: [
          {
            label: "1. Scaling up for remainder backlog (12 jobs @ 5/worker)",
            code: "print((12 + 5 - 1) // 5)",
            output: "3",
            note: "Rounds up so the last 2 jobs do not stall waiting on 2 full workers.",
          },
          {
            label: "2. Standby floor (1) and ceiling clamp (max_workers)",
            code: "print(max(1, min((0 + 4) // 5, 10)), max(1, min((100 + 4) // 5, 8)))",
            output: "1 8",
            note: "Keeps 1 warm worker idle at zero backlog and caps max pods at 8.",
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CHAPTER V: AUTH, PAGINATION, REDIS CACHE & BATCHING (Modules 17 - 20)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 17,
    tools: [
      {
        toolName: "4-Gate Token Check (Exists, Active, TTL, Scope) — API Auth",
        badge: "API SECURITY",
        purpose:
          "Authorizes requests only when the token exists, `active` is True, `now_ts < expires_at`, and `required_scope` is granted.",
        syntaxPattern:
          "rec = key_store.get(api_key)\nreturn bool(rec and rec.get('active') and now_ts < rec.get('expires_at', 0) and required_scope in rec.get('scopes', []))",
        variations: [
          {
            label: "1. Enforcing TTL boundary (now_ts < expires_at)",
            code: 'rec = {"active": True, "expires_at": 100, "scopes": ["write"]}\nprint(rec["active"] and 50 < rec["expires_at"], rec["active"] and 100 < rec["expires_at"])',
            output: "True False",
            note: "At exact timestamp t=100, the token is already expired.",
          },
          {
            label: "2. RBAC scope verification",
            code: 'scopes = ["read", "write"]\nprint("write" in scopes, "admin" in scopes)',
            output: "True False",
            note: "Prevents read/write keys from invoking admin endpoints.",
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
        toolName: "Pagination Envelope (`items`, `has_next`, `total_pages`)",
        badge: "DATABASE PAGINATION",
        purpose:
          "Computes ceiling `total_pages`, slices `(page - 1) * page_size`, and derives `has_next` consistently.",
        syntaxPattern:
          "total_pages = (len(items) + page_size - 1) // page_size\nstart = (page - 1) * page_size\nitems_slice = items[start : start + page_size]",
        variations: [
          {
            label: "1. Middle page with remaining items",
            code: 'items = ["a","b","c","d","e"]\ntp = (len(items) + 1) // 2\nprint({"items": items[2:4], "has_next": 2 < tp, "total_pages": tp})',
            output: "{'items': ['c', 'd'], 'has_next': True, 'total_pages': 3}",
            note: "Page 2 of 3 returns ['c', 'd'] with has_next=True.",
          },
          {
            label: "2. Exact last page check (has_next=False)",
            code: 'items = ["a","b","c","d"]\ntp = (len(items) + 1) // 2\nprint(2 < tp)',
            output: "False",
            note: "When page == total_pages, has_next must be False.",
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
        toolName: "Cache-Aside Read-Through (`f'user:{id}:profile'`)",
        badge: "REDIS PATTERNS",
        purpose:
          "Reads Redis first, falls back to DB on miss and warms `cache[key]`, while never caching absent `None` rows.",
        syntaxPattern:
          "key = f'user:{user_id}:profile'\nif key in cache: return {'source': 'cache', 'data': cache[key]}\nif user_id in db:\n    cache[key] = db[user_id]\n    return {'source': 'db', 'data': db[user_id]}",
        variations: [
          {
            label: "1. Cold DB read warms cache for read #2",
            code: 'c, d = {}, {42: "Aria"}\nk = "user:42:profile"\nif k not in c and 42 in d: c[k] = d[42]\nprint(c)',
            output: "{'user:42:profile': 'Aria'}",
            note: "Populates cache only when user_id exists in database.",
          },
          {
            label: "2. Avoiding cache pollution on misses",
            code: 'c, d = {}, {42: "Aria"}\nprint(99 in d, len(c))',
            output: "False 0",
            note: "Nonexistent user IDs return 'miss' without filling RAM.",
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
        toolName: "`[ids[i : i + sz] for i in range(0, len(ids), sz)]` — Chunker",
        badge: "BATCH WORKERS",
        purpose:
          "Splits arbitrary lists into fixed-size sublists (preserving partial trailing batches) while guarding `batch_size <= 0`.",
        syntaxPattern:
          "if batch_size <= 0: return []\nreturn [user_ids[i : i + batch_size] for i in range(0, len(user_ids), batch_size)]",
        variations: [
          {
            label: "1. Splitting into batches including trailing partial chunk",
            code: "ids = [1, 2, 3, 4, 5]\nprint([ids[i:i+2] for i in range(0, len(ids), 2)])",
            output: "[[1, 2], [3, 4], [5]]",
            note: "Python slice bounds clamp automatically at len(ids) for the final chunk.",
          },
          {
            label: "2. Invalid batch_size <= 0 guard",
            code: "def chunk(xs, b):\n    return [] if b <= 0 else [xs[i:i+b] for i in range(0, len(xs), b)]\nprint(chunk([1, 2], 0))",
            output: "[]",
            note: "Prevents ValueError from range(..., step=0).",
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
