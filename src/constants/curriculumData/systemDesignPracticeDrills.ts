import { PracticeChallenge } from "../../types/lesson";

/**
 * Progressive Practice Challenges for the Pro `system_design` track (`lesson_order` 1..24).
 * Focuses strictly on Mission Brief, Input/Output examples, Constraints, and Clues.
 */
export const SYSTEM_DESIGN_PRACTICE_DRILLS: Record<number, PracticeChallenge[]> = {
  // 01: Token Bucket Rate Limiter (Class)
  1: [
    {
      id: "sys-01-d2",
      title: "Practice 2/3: Batch Cost Token Bucket",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `consume_tokens(remaining, cost)`: a heavy AI endpoint costs `cost` tokens instead of 1. If `remaining >= cost`, return `(True, remaining - cost)`; otherwise do not deduct and return `(False, remaining)`.",
      constraints: [
        "Guard `cost <= 0` safely by returning `(False, remaining)`",
        "Never let `remaining` drop below `0`",
      ],
      examples: [
        { input: "remaining = 5, cost = 3", output: "(True, 2)" },
        { input: "remaining = 2, cost = 3", output: "(False, 2)" },
      ],
      initial_code: `def consume_tokens(remaining, cost):
    pass`,
      expected_output: "(True, 2) (False, 2)",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((5, 3), (True, 2)), ((2, 3), (False, 2)), ((4, 4), (True, 0)), ((5, 0), (False, 5))]
    for idx, ((rem, cost), exp) in enumerate(cases):
        actual = consume_tokens(rem, cost)
        results.append({"id": idx + 1, "input": f"remaining={rem}, cost={cost}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `cost > 0 and remaining >= cost` before subtracting.",
      ],
    },
    {
      id: "sys-01-d3",
      title: "Practice 3/3: Multi-Client API Quota Guard",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `admit_requests(requests, max_per_client)`: given a list of client IDs in arrival order, track each client's count in a dict and return `[True/False, ...]` admitting each request only while that client has fewer than `max_per_client` calls.",
      constraints: [
        "Track independent request counters per `client_id`",
        "Increment count only when admitted",
      ],
      examples: [{ input: 'requests = ["u1", "u1", "u2", "u1"], max_per_client = 2', output: "[True, True, True, False]" }],
      initial_code: `def admit_requests(requests, max_per_client):
    pass`,
      expected_output: "[True, True, True, False]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((["u1", "u1", "u2", "u1"], 2), [True, True, True, False]), ((["a"], 0), [False]), (([], 3), [])]
    for idx, ((reqs, m), exp) in enumerate(cases):
        actual = admit_requests(reqs, m)
        results.append({"id": idx + 1, "input": f"req={reqs}, max={m}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `counts.get(cid, 0) < max_per_client` before incrementing `counts[cid]`.",
      ],
    },
  ],

  // 02: Caching / LRU & Hit/Miss
  2: [
    {
      id: "sys-02-d2",
      title: "Practice 2/3: Bounded FIFO Cache Put & Lookup",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `simulate_bounded_cache(ops, capacity)`: process `('PUT', k, v)` and `('GET', k)` operations on a fixed-size FIFO cache (`order` list + `store` dict). Return the list of `GET` results (`-1` on miss). Updating an existing key replaces its value without consuming an extra slot.",
      constraints: [
        "Evict the oldest inserted key when inserting a new key at full `capacity`",
        "Return `-1` when a key is not in `store`",
      ],
      examples: [
        { input: 'ops = [("PUT", "a", 1), ("PUT", "b", 2), ("PUT", "c", 3), ("GET", "a"), ("GET", "b")], capacity = 2', output: "[-1, 2]" },
      ],
      initial_code: `def simulate_bounded_cache(ops, capacity):
    pass`,
      expected_output: "[-1, 2]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    c1 = ([("PUT", "a", 1), ("PUT", "b", 2), ("PUT", "c", 3), ("GET", "a"), ("GET", "b")], 2)
    c2 = ([("PUT", "x", 10), ("PUT", "x", 99), ("GET", "x")], 1)
    for idx, ((ops, cap), exp) in enumerate([(c1, [-1, 2]), (c2, [99])]):
        actual = simulate_bounded_cache(ops, cap)
        results.append({"id": idx + 1, "input": f"cap={cap}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Keep insertion order in `queue = []`; on overflow, `oldest = queue.pop(0)` and `del store[oldest]`.",
      ],
    },
    {
      id: "sys-02-d3",
      title: "Practice 3/3: Cache Hit-Ratio Analyzer",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `measure_cache_hit_rate(lookups, cache)`: given a list of requested keys and existing cached key set/dict, return `round(hits / len(lookups) * 100, 1)` (or `0.0` if `lookups` is empty).",
      constraints: [
        "Guard against division by zero on empty `lookups`",
      ],
      examples: [{ input: 'lookups = ["u1", "u2", "u1", "u3"], cache = {"u1": "ok"}', output: "50.0" }],
      initial_code: `def measure_cache_hit_rate(lookups, cache):
    pass`,
      expected_output: "50.0",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((["u1", "u2", "u1", "u3"], {"u1": "ok"}), 50.0), (([], {"u1": "ok"}), 0.0), ((["a", "b"], {"a": 1, "b": 2}), 100.0)]
    for idx, ((lk, c), exp) in enumerate(cases):
        actual = measure_cache_hit_rate(lk, c)
        results.append({"id": idx + 1, "input": f"lookups={lk}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Count `hits = sum(1 for k in lookups if k in cache)`.",
      ],
    },
  ],

  // 03: Deterministic Shard / Ring Routing
  3: [
    {
      id: "sys-03-d2",
      title: "Practice 2/2: Partition Load Distribution Counter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `count_shard_distribution(request_ids, num_shards)`: route each ID via `request_id % num_shards` and return a list of length `num_shards` showing how many requests landed on each partition.",
      constraints: [
        "Return `[]` if `num_shards <= 0`",
        "Initialize `[0] * num_shards` before tallying",
      ],
      examples: [{ input: "request_ids = [10, 11, 12, 14, 15], num_shards = 3", output: "[2, 1, 2]" }],
      initial_code: `def count_shard_distribution(request_ids, num_shards):
    pass`,
      expected_output: "[2, 1, 2]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([10, 11, 12, 14, 15], 3), [2, 1, 2]), (([1, 2], 0), []), (([4, 8], 2), [2, 0])]
    for idx, ((ids, n), exp) in enumerate(cases):
        actual = count_shard_distribution(ids, n)
        results.append({"id": idx + 1, "input": f"ids={ids}, n={n}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Increment `buckets[rid % num_shards] += 1` inside the loop.",
      ],
    },
  ],

  // 04: Round-Robin Load Balancer
  4: [
    {
      id: "sys-04-d2",
      title: "Practice 2/2: Healthy-Only Round-Robin Dispatcher",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `dispatch_healthy_rr(servers, total_requests)`: each server dict has `{'name': str, 'healthy': bool}`. Filter to healthy servers and assign `total_requests` round-robin (`i % len(healthy)`), returning the list of assigned server names (or `[]` if none healthy).",
      constraints: [
        "Skip any server where `healthy` is `False`",
        "Preserve original healthy server order",
      ],
      examples: [
        { input: 'servers = [{"name": "s1", "healthy": False}, {"name": "s2", "healthy": True}, {"name": "s3", "healthy": True}], total_requests = 3', output: "['s2', 's3', 's2']" },
      ],
      initial_code: `def dispatch_healthy_rr(servers, total_requests):
    pass`,
      expected_output: "['s2', 's3', 's2']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    fleet = [{"name": "s1", "healthy": False}, {"name": "s2", "healthy": True}, {"name": "s3", "healthy": True}]
    down = [{"name": "s1", "healthy": False}]
    cases = [((fleet, 3), ["s2", "s3", "s2"]), ((down, 2), []), ((fleet, 0), [])]
    for idx, ((sv, tot), exp) in enumerate(cases):
        actual = dispatch_healthy_rr(sv, tot)
        results.append({"id": idx + 1, "input": f"total={tot}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Build `healthy = [s['name'] for s in servers if s.get('healthy')]` first.",
      ],
    },
  ],

  // 05: Database Sharding Router
  5: [
    {
      id: "sys-05-d2",
      title: "Practice 2/3: Consistent String Key Shard Router",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `route_tenant_shard(tenant_key, num_shards)`: when keys are strings like `'acme'`, compute a deterministic non-negative integer digest `sum(ord(ch) for ch in tenant_key)` and return `f'shard_{digest % num_shards}'`.",
      constraints: [
        "Never use Python's salted `hash()` (it changes across process restarts!)",
        "Use `sum(ord(ch) for ch in tenant_key) % num_shards`",
      ],
      examples: [{ input: 'tenant_key = "ab", num_shards = 4', output: "shard_3" }],
      initial_code: `def route_tenant_shard(tenant_key, num_shards):
    pass`,
      expected_output: "shard_3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(("ab", 4), "shard_3"), (("abc", 3), "shard_0"), (("z", 5), "shard_2")]
    for idx, ((k, n), exp) in enumerate(cases):
        actual = route_tenant_shard(k, n)
        results.append({"id": idx + 1, "input": f"key={k!r}, n={n}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "`ord('a') + ord('b') = 97 + 98 = 195`, and `195 % 4 == 3`.",
      ],
    },
    {
      id: "sys-05-d3",
      title: "Practice 3/3: Rebalance Migration Counter",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `count_moved_keys(user_ids, old_shards, new_shards)`: count how many IDs change partition (`uid % old_shards != uid % new_shards`) when scaling from `old_shards` to `new_shards`.",
      constraints: [
        "Compare `uid % old_shards` against `uid % new_shards` for each ID",
      ],
      examples: [{ input: "user_ids = [0, 1, 2, 3, 4], old_shards = 2, new_shards = 3", output: "3" }],
      initial_code: `def count_moved_keys(user_ids, old_shards, new_shards):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([0, 1, 2, 3, 4], 2, 3), 3), (([0, 4, 8], 4, 4), 0), (([1, 2, 3], 3, 4), 3)]
    for idx, ((ids, o, n), exp) in enumerate(cases):
        actual = count_moved_keys(ids, o, n)
        results.append({"id": idx + 1, "input": f"old={o}, new={n}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Notice this explains why naive modulo sharding moves most keys when resizing clusters!",
      ],
    },
  ],

  // 06: Circuit Breaker
  6: [
    {
      id: "sys-06-d2",
      title: "Practice 2/3: Half-Open Probe Recovery State Machine",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `next_breaker_state(current_state, request_ok, failure_count, threshold)`: if `'OPEN'`, stay `'OPEN'`; if `'HALF_OPEN'`, return `'CLOSED'` when `request_ok` is `True` else `'OPEN'`; if `'CLOSED'`, trip to `'OPEN'` when `not request_ok and failure_count + 1 >= threshold`, else `'CLOSED'`.",
      constraints: [
        "Implement all three breaker states (`OPEN`, `HALF_OPEN`, `CLOSED`) cleanly",
      ],
      examples: [
        { input: 'current_state = "HALF_OPEN", request_ok = True, failure_count = 3, threshold = 3', output: "CLOSED" },
      ],
      initial_code: `def next_breaker_state(current_state, request_ok, failure_count, threshold):
    pass`,
      expected_output: "CLOSED OPEN",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        (("HALF_OPEN", True, 3, 3), "CLOSED"),
        (("HALF_OPEN", False, 3, 3), "OPEN"),
        (("CLOSED", False, 2, 3), "OPEN"),
        (("CLOSED", False, 1, 3), "CLOSED"),
        (("OPEN", True, 5, 3), "OPEN"),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = next_breaker_state(*args)
        results.append({"id": idx + 1, "input": f"{args}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `if current_state == 'OPEN':` first, then `elif current_state == 'HALF_OPEN':`.",
      ],
    },
    {
      id: "sys-06-d3",
      title: "Practice 3/3: Multi-Service Dependency Health Summary",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `evaluate_dependencies(services, threshold)`: `services` maps `{service_name: consecutive_failures}`. Return `'DEGRADED'` if any service has `failures >= threshold`, else `'HEALTHY'`.",
      constraints: [
        "Return `'HEALTHY'` if `services` is empty",
      ],
      examples: [{ input: 'services = {"auth": 0, "payments": 5}, threshold = 5', output: "DEGRADED" }],
      initial_code: `def evaluate_dependencies(services, threshold):
    pass`,
      expected_output: "DEGRADED",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(({"auth": 0, "payments": 5}, 5), "DEGRADED"), (({"auth": 1, "payments": 2}, 4), "HEALTHY"), (({}, 3), "HEALTHY")]
    for idx, ((sv, th), exp) in enumerate(cases):
        actual = evaluate_dependencies(sv, th)
        results.append({"id": idx + 1, "input": f"services={sv}, th={th}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `any(fails >= threshold for fails in services.values())`.",
      ],
    },
  ],

  // 07: Quorum Consensus
  7: [
    {
      id: "sys-07-d2",
      title: "Practice 2/3: Sloppy Quorum W + R > N Check",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `is_strict_consistency(n_nodes, write_quorum, read_quorum)`: in Dynamo-style replication (`N`, `W`, `R`), return `True` if `write_quorum > 0`, `read_quorum > 0`, `write_quorum <= n_nodes`, `read_quorum <= n_nodes`, and `write_quorum + read_quorum > n_nodes`.",
      constraints: [
        "Enforce valid bounds `1 <= W <= N` and `1 <= R <= N`",
        "Verify strict overlap `W + R > N`",
      ],
      examples: [
        { input: "n_nodes = 5, write_quorum = 3, read_quorum = 3", output: "True" },
        { input: "n_nodes = 5, write_quorum = 2, read_quorum = 2", output: "False" },
      ],
      initial_code: `def is_strict_consistency(n_nodes, write_quorum, read_quorum):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((5, 3, 3), True), ((5, 2, 2), False), ((3, 3, 1), True), ((3, 4, 1), False), ((3, 0, 4), False)]
    for idx, (args, exp) in enumerate(cases):
        actual = is_strict_consistency(*args)
        results.append({"id": idx + 1, "input": f"{args}", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Even `(N=3, W=3, R=1)` guarantees strict read-your-writes overlap because `3 + 1 > 3`!",
      ],
    },
    {
      id: "sys-07-d3",
      title: "Practice 3/3: Highest Epoch State Selector",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `resolve_latest_value(replica_responses)`: when quorum reads return `(epoch, value)` tuples from replicas, return the `value` associated with the highest `epoch` (or `None` if empty).",
      constraints: [
        "Do not assume `replica_responses` are sorted",
      ],
      examples: [{ input: 'replica_responses = [(2, "v2"), (5, "v5"), (3, "v3")]', output: "v5" }],
      initial_code: `def resolve_latest_value(replica_responses):
    pass`,
      expected_output: "v5",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [([(2, "v2"), (5, "v5"), (3, "v3")], "v5"), ([], None), ([(1, "init")], "init")]
    for idx, (inp, exp) in enumerate(cases):
        actual = resolve_latest_value(inp)
        results.append({"id": idx + 1, "input": f"{inp}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Pick `max(replica_responses, key=lambda r: r[0])[1]` when non-empty.",
      ],
    },
  ],

  // 08: Event Queue / Pub-Sub Fanout (if present in DB)
  8: [
    {
      id: "sys-08-d2",
      title: "Practice 2/2: Topic Pub/Sub Fanout Dispatcher",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `fanout_event(subscriptions, topic, event)`: `subscriptions` maps `{topic: [subscriber_ids...]}`. Return `{sub_id: event}` for every subscriber registered to `topic` (or `{}` if none).",
      constraints: [
        "Handle missing `topic` safely without KeyError",
      ],
      examples: [{ input: 'subscriptions = {"orders": ["billing", "email"]}, topic = "orders", event = "ord_9"', output: "{'billing': 'ord_9', 'email': 'ord_9'}" }],
      initial_code: `def fanout_event(subscriptions, topic, event):
    pass`,
      expected_output: "{'billing': 'ord_9', 'email': 'ord_9'}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    subs = {"orders": ["billing", "email"]}
    cases = [((subs, "orders", "ord_9"), {"billing": "ord_9", "email": "ord_9"}), ((subs, "unknown", "x"), {})]
    for idx, ((s, t, e), exp) in enumerate(cases):
        actual = fanout_event(s, t, e)
        results.append({"id": idx + 1, "input": f"topic={t!r}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Iterate over `subscriptions.get(topic, [])`.",
      ],
    },
  ],

  // 09: Exponential Backoff + Jitter
  9: [
    {
      id: "sys-09-d2",
      title: "Practice 2/2: Retry Schedule Sequence Generator",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `build_retry_schedule(max_retries, base_ms, max_ms)`: return the list of capped exponential delays (`base_ms * (2 ** i)` clamped at `max_ms`, no jitter) for attempts `0` through `max_retries - 1`.",
      constraints: [
        "Return `[]` when `max_retries <= 0`",
      ],
      examples: [{ input: "max_retries = 4, base_ms = 100, max_ms = 500", output: "[100, 200, 400, 500]" }],
      initial_code: `def build_retry_schedule(max_retries, base_ms, max_ms):
    pass`,
      expected_output: "[100, 200, 400, 500]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [((4, 100, 500), [100, 200, 400, 500]), ((0, 100, 500), []), ((3, 50, 1000), [50, 100, 200])]
    for idx, (args, exp) in enumerate(cases):
        actual = build_retry_schedule(*args)
        results.append({"id": idx + 1, "input": f"{args}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Loop `for i in range(max_retries):` and append `min(base_ms * (2 ** i), max_ms)`.",
      ],
    },
  ],

  // 10: DLQ Poison-Pill Triage
  10: [
    {
      id: "sys-10-d2",
      title: "Practice 2/2: Priority-Aware DLQ Replay Split",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `replay_or_purge(dlq_items, max_age_sec)`: inspect DLQ messages `[{'id': str, 'age_sec': int}, ...]`. Return `{'replay': [...ids], 'expired': [...ids]}` keeping messages with `age_sec <= max_age_sec` for replay and purging older ones.",
      constraints: [
        "Preserve original relative order in both output lists",
      ],
      examples: [{ input: 'dlq_items = [{"id": "m1", "age_sec": 30}, {"id": "m2", "age_sec": 90}], max_age_sec = 60', output: "{'replay': ['m1'], 'expired': ['m2']}" }],
      initial_code: `def replay_or_purge(dlq_items, max_age_sec):
    pass`,
      expected_output: "{'replay': ['m1'], 'expired': ['m2']}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    items = [{"id": "m1", "age_sec": 30}, {"id": "m2", "age_sec": 90}, {"id": "m3", "age_sec": 60}]
    cases = [((items, 60), {"replay": ["m1", "m3"], "expired": ["m2"]}), (([], 60), {"replay": [], "expired": []})]
    for idx, ((it, mx), exp) in enumerate(cases):
        actual = replay_or_purge(it, mx)
        results.append({"id": idx + 1, "input": f"max_age={mx}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Notice boundary equality `age_sec <= max_age_sec` stays in `replay`.",
      ],
    },
  ],

  // 11: Failover & Healthy Selection
  11: [
    {
      id: "sys-11-d2",
      title: "Practice 2/3: Capacity-Aware Server Admission",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `pick_available_node(servers, max_load)`: select the healthy server with the lowest `load` strictly under `max_load` (`healthy and load < max_load`). Return `'OVERLOADED'` if none qualify.",
      constraints: [
        "Ignore unhealthy servers or servers with `load >= max_load`",
      ],
      examples: [
        { input: 'servers = [{"name": "n1", "healthy": True, "load": 90}, {"name": "n2", "healthy": True, "load": 50}], max_load = 80', output: "n2" },
      ],
      initial_code: `def pick_available_node(servers, max_load):
    pass`,
      expected_output: "n2",
      hidden_tests: `import json
def __run_tests__():
    results = []
    s = [{"name": "n1", "healthy": True, "load": 90}, {"name": "n2", "healthy": True, "load": 50}, {"name": "n3", "healthy": False, "load": 10}]
    cases = [((s, 80), "n2"), ((s, 50), "OVERLOADED"), (([], 80), "OVERLOADED")]
    for idx, ((sv, ml), exp) in enumerate(cases):
        actual = pick_available_node(sv, ml)
        results.append({"id": idx + 1, "input": f"max_load={ml}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Filter `[s for s in servers if s.get('healthy') and s['load'] < max_load]` then pick `min(..., key=lambda s: s['load'])`.",
      ],
    },
    {
      id: "sys-11-d3",
      title: "Practice 3/3: Weighted Priority Tier Failover",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `pick_primary_or_standby(nodes)`: each node has `{'name': str, 'tier': int, 'healthy': bool}` (`tier=1` primary, `tier=2` standby). Return the lowest-`tier` healthy node's name (tie-break alphabetically by `name`), or `'DOWN'` if all are unhealthy.",
      constraints: [
        "Prefer `tier=1` over `tier=2` whenever a healthy tier-1 node exists",
      ],
      examples: [
        { input: 'nodes = [{"name": "standby-a", "tier": 2, "healthy": True}, {"name": "primary-b", "tier": 1, "healthy": True}]', output: "primary-b" },
      ],
      initial_code: `def pick_primary_or_standby(nodes):
    pass`,
      expected_output: "primary-b",
      hidden_tests: `import json
def __run_tests__():
    results = []
    n1 = [{"name": "standby-a", "tier": 2, "healthy": True}, {"name": "primary-b", "tier": 1, "healthy": False}, {"name": "standby-b", "tier": 2, "healthy": True}]
    n2 = [{"name": "p1", "tier": 1, "healthy": True}, {"name": "s1", "tier": 2, "healthy": True}]
    cases = [(n1, "standby-a"), (n2, "p1"), (([{"name": "p1", "tier": 1, "healthy": False}]), "DOWN")]
    for idx, (inp, exp) in enumerate(cases):
        actual = pick_primary_or_standby(inp)
        results.append({"id": idx + 1, "input": f"case {idx + 1}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Pass `key=lambda n: (n['tier'], n['name'])` to `min(...)` over healthy nodes.",
      ],
    },
  ],

  // 12: Latency-Aware CDN Router
  12: [
    {
      id: "sys-12-d2",
      title: "Practice 2/3: SLA Latency Ceiling Filter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `fastest_pop_within_sla(edges, max_latency_ms)`: return the ID of the lowest-latency healthy edge POP whose `latency_ms <= max_latency_ms`, or `'ORIGIN_FALLBACK'` if none satisfy the SLA.",
      constraints: [
        "Must check both `healthy` and `latency_ms <= max_latency_ms`",
      ],
      examples: [
        { input: 'edges = [{"id": "e1", "latency_ms": 120, "healthy": True}, {"id": "e2", "latency_ms": 35, "healthy": True}], max_latency_ms = 50', output: "e2" },
      ],
      initial_code: `def fastest_pop_within_sla(edges, max_latency_ms):
    pass`,
      expected_output: "e2",
      hidden_tests: `import json
def __run_tests__():
    results = []
    pops = [{"id": "e1", "latency_ms": 120, "healthy": True}, {"id": "e2", "latency_ms": 35, "healthy": True}, {"id": "e3", "latency_ms": 10, "healthy": False}]
    cases = [((pops, 50), "e2"), ((pops, 20), "ORIGIN_FALLBACK")]
    for idx, ((ed, ml), exp) in enumerate(cases):
        actual = fastest_pop_within_sla(ed, ml)
        results.append({"id": idx + 1, "input": f"sla={ml}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Filter candidates to `[e for e in edges if e['healthy'] and e['latency_ms'] <= max_latency_ms]`.",
      ],
    },
    {
      id: "sys-12-d3",
      title: "Practice 3/3: Multi-Region Ranked Fallback Chain",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `rank_cdn_candidates(edges, preferred_region)`: return a list of all healthy edge IDs ordered with `preferred_region` edges first (sorted by lowest latency), followed by remaining healthy edges (sorted by lowest latency).",
      constraints: [
        "Exclude unhealthy edges completely",
        "Tie-break equal latencies alphabetically by edge ID",
      ],
      examples: [
        { input: 'edges = [{"id": "us-1", "region": "us", "latency_ms": 20, "healthy": True}, {"id": "eu-1", "region": "eu", "latency_ms": 40, "healthy": True}], preferred_region = "eu"', output: "['eu-1', 'us-1']" },
      ],
      initial_code: `def rank_cdn_candidates(edges, preferred_region):
    pass`,
      expected_output: "['eu-1', 'us-1']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    pops = [
        {"id": "us-1", "region": "us", "latency_ms": 20, "healthy": True},
        {"id": "eu-2", "region": "eu", "latency_ms": 10, "healthy": False},
        {"id": "eu-1", "region": "eu", "latency_ms": 40, "healthy": True},
    ]
    cases = [((pops, "eu"), ["eu-1", "us-1"]), ((pops, "us"), ["us-1", "eu-1"])]
    for idx, ((ed, reg), exp) in enumerate(cases):
        actual = rank_cdn_candidates(ed, reg)
        results.append({"id": idx + 1, "input": f"region={reg!r}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Sort healthy edges by `(0 if e['region'] == preferred_region else 1, e['latency_ms'], e['id'])`.",
      ],
    },
  ],

  // 13: Flap-Guarded Alarm
  14: [
    {
      id: "sys-13-d2",
      title: "Practice 2/3: Peak Breach Streak Length",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `longest_breach_streak(samples, threshold)`: compute the longest run of consecutive samples `>= threshold` across the entire metric series.",
      constraints: [
        "O(n) scan and O(1) extra space",
        "Reset current streak to `0` whenever a sample drops below `threshold`",
      ],
      examples: [{ input: "samples = [91, 93, 60, 95, 96, 98], threshold = 90", output: "3" }],
      initial_code: `def longest_breach_streak(samples, threshold):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([91, 93, 60, 95, 96, 98], 90), 3), (([50, 60], 90), 0), (([90, 90], 90), 2)]
    for idx, ((s, th), exp) in enumerate(cases):
        actual = longest_breach_streak(s, th)
        results.append({"id": idx + 1, "input": f"samples={s}, th={th}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Update `best = max(best, streak)` each time `streak` increments.",
      ],
    },
    {
      id: "sys-13-d3",
      title: "Practice 3/3: Hysteresis Alarm With Auto-Recovery",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `evaluate_hysteresis_alarm(samples, high_th, low_th)`: start in `'OK'`. Switch to `'ALARM'` whenever a sample `>= high_th`, and recover back to `'OK'` only when a sample drops `<= low_th`. Return the final state after processing all samples.",
      constraints: [
        "Samples strictly between `low_th` and `high_th` preserve the current alarm state",
      ],
      examples: [{ input: "samples = [92, 85, 75, 65], high_th = 90, low_th = 70", output: "OK" }],
      initial_code: `def evaluate_hysteresis_alarm(samples, high_th, low_th):
    pass`,
      expected_output: "OK ALARM",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([92, 85, 75, 65], 90, 70), "OK"), (([92, 85, 75], 90, 70), "ALARM"), (([60, 80], 90, 70), "OK")]
    for idx, ((s, hi, lo), exp) in enumerate(cases):
        actual = evaluate_hysteresis_alarm(s, hi, lo)
        results.append({"id": idx + 1, "input": f"samples={s}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Deadband hysteresis prevents flapping alarms when metrics hover near `90%`!",
      ],
    },
  ],

  // 14: Feature Flag Rollout
  15: [
    {
      id: "sys-14-d2",
      title: "Practice 2/3: Beta Allowlist Override Flag",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `resolve_flag_with_allowlist(flags, feature, user_id)`: if feature is missing or `enabled` is `False`, always return `False` (kill-switch wins!). Otherwise return `True` if `user_id` is in `cfg.get('allowlist', [])` OR `user_id % 100 < cfg['rollout_pct']`.",
      constraints: [
        "Kill-switch `enabled == False` overrides even allowlisted users",
      ],
      examples: [
        { input: 'flags = {"beta": {"enabled": True, "rollout_pct": 10, "allowlist": [999]}}, feature = "beta", user_id = 999', output: "True" },
      ],
      initial_code: `def resolve_flag_with_allowlist(flags, feature, user_id):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    fl = {"beta": {"enabled": True, "rollout_pct": 10, "allowlist": [999]}, "off": {"enabled": False, "rollout_pct": 100, "allowlist": [999]}}
    cases = [((fl, "beta", 999), True), ((fl, "beta", 105), True), ((fl, "beta", 125), False), ((fl, "off", 999), False)]
    for idx, (args, exp) in enumerate(cases):
        actual = resolve_flag_with_allowlist(*args)
        results.append({"id": idx + 1, "input": f"feature={args[1]!r}, uid={args[2]}", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `if not cfg or not cfg.get('enabled'): return False` first.",
      ],
    },
    {
      id: "sys-14-d3",
      title: "Practice 3/3: Multi-Flag Evaluation Context",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `evaluate_all_flags(flags, user_id)`: return a dictionary `{feature_name: bool}` evaluating every feature in `flags` for `user_id` (`enabled and (user_id % 100 < rollout_pct)`).",
      constraints: [
        "Include every key present in `flags`",
      ],
      examples: [
        { input: 'flags = {"a": {"enabled": True, "rollout_pct": 50}, "b": {"enabled": False, "rollout_pct": 100}}, user_id = 120', output: "{'a': True, 'b': False}" },
      ],
      initial_code: `def evaluate_all_flags(flags, user_id):
    pass`,
      expected_output: "{'a': True, 'b': False}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    fl = {"a": {"enabled": True, "rollout_pct": 50}, "b": {"enabled": False, "rollout_pct": 100}}
    cases = [((fl, 120), {"a": True, "b": False}), ((fl, 175), {"a": False, "b": False})]
    for idx, ((f, u), exp) in enumerate(cases):
        actual = evaluate_all_flags(f, u)
        results.append({"id": idx + 1, "input": f"uid={u}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Use a dict comprehension or loop over `flags.items()`.",
      ],
    },
  ],

  // 15: Gateway Upload Guard
  13: [
    {
      id: "sys-15-d2",
      title: "Practice 2/3: Required JSON Payload Schema Checker",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `validate_payload(payload, required_fields)`: check that `payload` is a `dict` containing every key in `required_fields` with non-None, non-empty-string values (`val is not None and val != ''`). Return `(True, [])` or `(False, sorted_missing_fields)`.",
      constraints: [
        "Return `sorted` list of missing/blank field names",
      ],
      examples: [
        { input: 'payload = {"email": "a@b.com", "name": ""}, required_fields = ["email", "name", "role"]', output: "(False, ['name', 'role'])" },
      ],
      initial_code: `def validate_payload(payload, required_fields):
    pass`,
      expected_output: "(False, ['name', 'role'])",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        (({"email": "a@b.com", "name": ""}, ["email", "name", "role"]), (False, ["name", "role"])),
        (({"id": 1, "ok": False}, ["id", "ok"]), (True, [])),
    ]
    for idx, ((p, req), exp) in enumerate(cases):
        actual = validate_payload(p, req)
        results.append({"id": idx + 1, "input": f"req={req}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Be careful not to reject boolean `False` or integer `0` as missing — check `val is None or val == ''` specifically!",
      ],
    },
    {
      id: "sys-15-d3",
      title: "Practice 3/3: Path Traversal Extension Sanitizer",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `is_safe_upload_name(filename, allowed_exts)`: reject empty names, names containing `'..'` or `'/'` or `'\\\\'`, and verify lowercase extension after the final `'.'` is in `allowed_exts` (e.g. `['png', 'jpg']`).",
      constraints: [
        "Treat extensions case-insensitively (`'PHOTO.PNG'` matches `'png'`)",
        "Reject filenames without a `'.'`",
      ],
      examples: [{ input: 'filename = "avatar.PNG", allowed_exts = ["png", "jpg"]', output: "True" }],
      initial_code: `def is_safe_upload_name(filename, allowed_exts):
    pass`,
      expected_output: "True False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        (("avatar.PNG", ["png", "jpg"]), True),
        (("../evil.png", ["png"]), False),
        (("sub/dir.jpg", ["jpg"]), False),
        (("readme", ["txt"]), False),
    ]
    for idx, ((fn, exts), exp) in enumerate(cases):
        actual = is_safe_upload_name(fn, exts)
        results.append({"id": idx + 1, "input": f"fn={fn!r}", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Extract extension via `filename.rsplit('.', 1)[1].lower()` once `'.' in filename`.",
      ],
    },
  ],

  // 16: Worker Autoscaler
  16: [
    {
      id: "sys-16-d2",
      title: "Practice 2/3: Min/Max Clamped Autoscaler Step",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `scale_with_cooldown(current_workers, queue_len, target_per_worker, min_workers, max_workers, max_step)`: compute desired workers `ceil(queue_len / target_per_worker)` clamped to `[min_workers, max_workers]`, then limit the change from `current_workers` by at most `max_step` workers in one tick.",
      constraints: [
        "First clamp `desired` between `min_workers` and `max_workers`",
        "Then clamp change `(desired - current_workers)` to `[-max_step, +max_step]`",
      ],
      examples: [{ input: "current_workers = 2, queue_len = 50, target_per_worker = 5, min_workers = 1, max_workers = 10, max_step = 3", output: "5" }],
      initial_code: `def scale_with_cooldown(current_workers, queue_len, target_per_worker, min_workers, max_workers, max_step):
    pass`,
      expected_output: "5",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        ((2, 50, 5, 1, 10, 3), 5),
        ((8, 0, 5, 2, 10, 2), 6),
        ((3, 15, 5, 1, 10, 4), 3),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = scale_with_cooldown(*args)
        results.append({"id": idx + 1, "input": f"{args}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Step-clamping avoids oscillating violently when sudden traffic spikes hit.",
      ],
    },
    {
      id: "sys-16-d3",
      title: "Practice 3/3: Cluster Bin-Packing Job Count",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `workers_needed_for_cpu(job_cpus, worker_cap)`: using First-Fit Decreasing greedy bin packing, sort `job_cpus` descending and pack each job into the first worker with enough free capacity (or open a new worker). Return minimum worker count needed.",
      constraints: [
        "Return `0` if `job_cpus` is empty",
        "Assume every `cpu <= worker_cap`",
      ],
      examples: [{ input: "job_cpus = [4, 8, 2, 6, 4], worker_cap = 10", output: "3" }],
      initial_code: `def workers_needed_for_cpu(job_cpus, worker_cap):
    pass`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([4, 8, 2, 6, 4], 10), 3), (([5, 5, 5, 5], 10), 2), (([], 10), 0)]
    for idx, ((jobs, cap), exp) in enumerate(cases):
        actual = workers_needed_for_cpu(jobs, cap)
        results.append({"id": idx + 1, "input": f"jobs={jobs}, cap={cap}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Keep a `remaining = []` list of free CPU slots per worker.",
      ],
    },
  ],

  // 17: Scoped API Key Authorizer
  18: [
    {
      id: "sys-17-d2",
      title: "Practice 2/3: Audit Reason Code Auth Gate",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `inspect_auth(key_store, api_key, required_scope, now_ts)`: return a clear status code: `'UNKNOWN_KEY'`, `'REVOKED'`, `'EXPIRED'` (if `now_ts >= expires_at`), `'MISSING_SCOPE'`, or `'AUTHORIZED'` in that exact precedence order.",
      constraints: [
        "Follow exact check precedence: exists -> active -> expiry -> scope",
      ],
      examples: [
        { input: 'key_store = {"k1": {"active": True, "expires_at": 50, "scopes": ["read"]}}, api_key = "k1", required_scope = "read", now_ts = 50', output: "EXPIRED" },
      ],
      initial_code: `def inspect_auth(key_store, api_key, required_scope, now_ts):
    pass`,
      expected_output: "EXPIRED AUTHORIZED",
      hidden_tests: `import json
def __run_tests__():
    results = []
    st = {
        "k1": {"active": True, "expires_at": 50, "scopes": ["read"]},
        "k2": {"active": False, "expires_at": 20, "scopes": ["read"]},
    }
    cases = [
        (("missing", "read", 10), "UNKNOWN_KEY"),
        (("k2", "read", 10), "REVOKED"),
        (("k1", "read", 50), "EXPIRED"),
        (("k1", "admin", 20), "MISSING_SCOPE"),
        (("k1", "read", 20), "AUTHORIZED"),
    ]
    for idx, ((k, sc, ts), exp) in enumerate(cases):
        actual = inspect_auth(st, k, sc, ts)
        results.append({"id": idx + 1, "input": f"key={k!r}, ts={ts}", "expected": repr(exp), "actual": repr(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Explicitly checking `rec is None` -> `'UNKNOWN_KEY'` avoids leaking privileges.",
      ],
    },
    {
      id: "sys-17-d3",
      title: "Practice 3/3: Role Hierarchy Scope Resolver",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `has_effective_scope(role_map, user_roles, needed_scope)`: `role_map` maps `{role_name: [scopes...]}` (e.g. `{'admin': ['read', 'write', 'delete']}`). Return `True` if any role in `user_roles` grants `needed_scope`.",
      constraints: [
        "Safely ignore unknown roles in `user_roles`",
      ],
      examples: [{ input: 'role_map = {"viewer": ["read"], "editor": ["read", "write"]}, user_roles = ["viewer"], needed_scope = "write"', output: "False" }],
      initial_code: `def has_effective_scope(role_map, user_roles, needed_scope):
    pass`,
      expected_output: "False True",
      hidden_tests: `import json
def __run_tests__():
    results = []
    rm = {"viewer": ["read"], "editor": ["read", "write"]}
    cases = [((rm, ["viewer"], "write"), False), ((rm, ["viewer", "editor"], "write"), True), ((rm, ["ghost"], "read"), False)]
    for idx, (args, exp) in enumerate(cases):
        actual = has_effective_scope(*args)
        results.append({"id": idx + 1, "input": f"roles={args[1]}", "expected": str(exp), "actual": str(actual), "passed": actual is exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `role_map.get(role, [])` inside your loop over `user_roles`.",
      ],
    },
  ],

  // 18: Pagination Metadata Engine
  19: [
    {
      id: "sys-18-d2",
      title: "Practice 2/3: Keyset Cursor Paginator",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `cursor_paginate(sorted_ids, after_id, limit)`: return `{'items': slice, 'next_cursor': last_id_or_None}` containing up to `limit` IDs strictly greater than `after_id` (or from the start if `after_id is None`). Set `next_cursor` to `None` when no more items remain after this page.",
      constraints: [
        "Why cursor pagination? No skipped/duplicated rows when new items insert at top!",
        "Set `next_cursor = None` on the final page (check `len(remaining) > limit`)",
      ],
      examples: [{ input: "sorted_ids = [101, 102, 103, 104, 105], after_id = 102, limit = 2", output: "{'items': [103, 104], 'next_cursor': 104}" }],
      initial_code: `def cursor_paginate(sorted_ids, after_id, limit):
    pass`,
      expected_output: "{'items': [103, 104], 'next_cursor': 104}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    ids = [101, 102, 103, 104, 105]
    cases = [
        ((ids, 102, 2), {"items": [103, 104], "next_cursor": 104}),
        ((ids, 103, 2), {"items": [104, 105], "next_cursor": None}),
        ((ids, None, 2), {"items": [101, 102], "next_cursor": 102}),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = cursor_paginate(*args)
        results.append({"id": idx + 1, "input": f"after={args[1]}, lim={args[2]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Filter `[x for x in sorted_ids if after_id is None or x > after_id]`, slice `[:limit + 1]`, and use the extra `+ 1` item to know if `next_cursor` is needed!",
      ],
    },
    {
      id: "sys-18-d3",
      title: "Practice 3/3: Safe Clamped Page Bounds",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `safe_paginate(items, page, page_size)`: guard invalid `page < 1` (clamp to `1`), `page_size <= 0`, and out-of-range `page > total_pages` cleanly returning `{'items': [...], 'page': effective_page, 'total_pages': total_pages}`.",
      constraints: [
        "Return `{'items': [], 'page': 1, 'total_pages': 0}` when `items` is empty or `page_size <= 0`",
      ],
      examples: [{ input: 'items = ["a", "b", "c"], page = 0, page_size = 2', output: "{'items': ['a', 'b'], 'page': 1, 'total_pages': 2}" }],
      initial_code: `def safe_paginate(items, page, page_size):
    pass`,
      expected_output: "{'items': ['a', 'b'], 'page': 1, 'total_pages': 2}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        ((["a", "b", "c"], 0, 2), {"items": ["a", "b"], "page": 1, "total_pages": 2}),
        (([], 2, 5), {"items": [], "page": 1, "total_pages": 0}),
        ((["a", "b", "c"], 9, 2), {"items": [], "page": 9, "total_pages": 2}),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = safe_paginate(*args)
        results.append({"id": idx + 1, "input": f"page={args[1]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Compute `total_pages = (len(items) + page_size - 1) // page_size`.",
      ],
    },
  ],

  // 19: Cache-Aside Read-Through
  20: [
    {
      id: "sys-19-d2",
      title: "Practice 2/3: Write-Through Cache Invalidation",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `update_user_write_through(cache, db, user_id, new_name)`: update `db[user_id] = new_name` AND invalidate/delete stale `f'user:{user_id}:profile'` from `cache` if present (or update it consistently). Return `'INVALIDATED'` if cache entry existed, else `'DB_ONLY'`.",
      constraints: [
        "Always write to `db[user_id]`",
        "Remove any stale key `f'user:{user_id}:profile'` from `cache`",
      ],
      examples: [{ input: 'cache = {"user:42:profile": "Old"}, db = {42: "Old"}, user_id = 42, new_name = "New"', output: "INVALIDATED" }],
      initial_code: `def update_user_write_through(cache, db, user_id, new_name):
    pass`,
      expected_output: "INVALIDATED False",
      hidden_tests: `import json
def __run_tests__():
    results = []
    c1, d1 = {"user:42:profile": "Old"}, {42: "Old"}
    r1 = update_user_write_through(c1, d1, 42, "New")
    p1 = (r1 == "INVALIDATED" and d1[42] == "New" and "user:42:profile" not in c1)
    c2, d2 = {}, {7: "Sam"}
    r2 = update_user_write_through(c2, d2, 7, "Kai")
    p2 = (r2 == "DB_ONLY" and d2[7] == "Kai")
    results.append({"id": 1, "input": "evict existing cache key", "expected": "INVALIDATED & removed", "actual": f"{r1}, in_cache={'user:42:profile' in c1}", "passed": p1})
    results.append({"id": 2, "input": "uncached key", "expected": "DB_ONLY", "actual": r2, "passed": p2})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Check `key in cache` before calling `del cache[key]`.",
      ],
    },
    {
      id: "sys-19-d3",
      title: "Practice 3/3: Batch Multi-Get Cache Hydration",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `batch_fetch_profiles(cache, db, user_ids)`: look up each `uid` in `cache[f'user:{uid}:profile']`; collect misses and fetch them from `db`, warming `cache` for found entries. Return `{uid: name_or_None}` for all requested `user_ids`.",
      constraints: [
        "Never cache `None` misses",
        "Return a dictionary mapping every requested `uid`",
      ],
      examples: [{ input: 'cache = {"user:1:profile": "Ada"}, db = {1: "Ada", 2: "Bob"}, user_ids = [1, 2, 3]', output: "{1: 'Ada', 2: 'Bob', 3: None}" }],
      initial_code: `def batch_fetch_profiles(cache, db, user_ids):
    pass`,
      expected_output: "{1: 'Ada', 2: 'Bob', 3: None}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    c = {"user:1:profile": "Ada"}
    d = {1: "Ada", 2: "Bob"}
    res = batch_fetch_profiles(c, d, [1, 2, 3])
    p1 = (res == {1: "Ada", 2: "Bob", 3: None} and c.get("user:2:profile") == "Bob" and "user:3:profile" not in c)
    results.append({"id": 1, "input": "user_ids=[1, 2, 3]", "expected": "{1: 'Ada', 2: 'Bob', 3: None}", "actual": str(res), "passed": p1})
    return json.dumps({"is_test_suite": True, "all_passed": p1, "results": results})
__run_tests__()`,
      hints: [
        "Check `key in cache` first; if absent and `uid in db`, set `cache[key] = db[uid]`.",
      ],
    },
  ],

  // 20: Chunked Batch Splitter
  17: [
    {
      id: "sys-20-d2",
      title: "Practice 2/2: Payload-Byte-Bounded Batching",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `pack_byte_batches(events, max_bytes)`: each event is `(event_id, byte_size)`. Pack consecutive events into the current batch as long as total batch bytes stays `<= max_bytes`, preserving order and skipping any single event whose size exceeds `max_bytes`.",
      constraints: [
        "Never reorder events",
        "Skip single items with `size <= 0 or size > max_bytes`",
      ],
      examples: [{ input: 'events = [("e1", 40), ("e2", 50), ("e3", 30)], max_bytes = 90', output: "[['e1', 'e2'], ['e3']]" }],
      initial_code: `def pack_byte_batches(events, max_bytes):
    pass`,
      expected_output: "[['e1', 'e2'], ['e3']]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        (([("e1", 40), ("e2", 50), ("e3", 30)], 90), [["e1", "e2"], ["e3"]]),
        (([("big", 200), ("ok", 20)], 100), [["ok"]]),
        (([], 100), []),
    ]
    for idx, ((ev, mb), exp) in enumerate(cases):
        actual = pack_byte_batches(ev, mb)
        results.append({"id": idx + 1, "input": f"max_bytes={mb}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Flush `current_batch` into `batches` whenever `current_bytes + size > max_bytes`.",
      ],
    },
  ],

  // 21: Sliding Window Log Limiter
  21: [
    {
      id: "sys-21-d2",
      title: "Practice 2/3: Mutating In-Place Rate Limiter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `check_and_record(logs, client_id, now, window_sec, limit)`: mutate `logs[client_id]` to keep only active timestamps (`now - t < window_sec`). If `len(active) < limit`, append `now` and return `True`; otherwise do not append and return `False`.",
      constraints: [
        "Update `logs[client_id]` in place even when rejected",
        "Strict window boundary `now - t < window_sec`",
      ],
      examples: [{ input: 'logs = {"u1": [10, 45]}, client_id = "u1", now = 70, window_sec = 30, limit = 2', output: "True" }],
      initial_code: `def check_and_record(logs, client_id, now, window_sec, limit):
    pass`,
      expected_output: "True [45, 70]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    st = {"u1": [10, 45]}
    r1 = check_and_record(st, "u1", 70, 30, 2)
    r2 = check_and_record(st, "u1", 72, 30, 2)
    p = (r1 is True and st["u1"] == [45, 70] and r2 is False)
    results.append({"id": 1, "input": "2 sequential checks", "expected": "True then False, logs=[45, 70]", "actual": f"{r1}, {r2}, {st['u1']}", "passed": p})
    return json.dumps({"is_test_suite": True, "all_passed": p, "results": results})
__run_tests__()`,
      hints: [
        "Filter `active = [t for t in logs.get(client_id, []) if now - t < window_sec]`.",
      ],
    },
    {
      id: "sys-21-d3",
      title: "Practice 3/3: Remaining Quota & Reset Retry-After",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `rate_limit_headers(timestamps, now, window_sec, limit)`: prune expired timestamps (`now - t < window_sec`). If allowed (`len(active) < limit`), return `{'allowed': True, 'remaining': limit - (len(active) + 1), 'retry_after': 0}`; else return `{'allowed': False, 'remaining': 0, 'retry_after': window_sec - (now - min(active))}`.",
      constraints: [
        "Return HTTP-style `remaining` and `retry_after` fields accurately",
      ],
      examples: [{ input: "timestamps = [50, 60], now = 70, window_sec = 30, limit = 2", output: "{'allowed': False, 'remaining': 0, 'retry_after': 10}" }],
      initial_code: `def rate_limit_headers(timestamps, now, window_sec, limit):
    pass`,
      expected_output: "{'allowed': False, 'remaining': 0, 'retry_after': 10}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        (([50, 60], 70, 30, 2), {"allowed": False, "remaining": 0, "retry_after": 10}),
        (([10, 60], 70, 30, 3), {"allowed": True, "remaining": 1, "retry_after": 0}),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = rate_limit_headers(*args)
        results.append({"id": idx + 1, "input": f"now={args[1]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "The oldest active timestamp `min(active)` expires at `min(active) + window_sec`, which is `window_sec - (now - min(active))` seconds from `now`.",
      ],
    },
  ],

  // 22: Token Bucket Refill Simulator
  22: [
    {
      id: "sys-22-d2",
      title: "Practice 2/3: Weighted Cost Bucket Refill",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `consume_weighted(tokens, last_ts, now_ts, refill_rate, capacity, cost)`: refill `min(capacity, tokens + max(0, now_ts - last_ts) * refill_rate)`. If `refilled >= cost`, subtract `cost` and return `{'allowed': True, 'tokens': refilled - cost}`; else return `{'allowed': False, 'tokens': refilled}`.",
      constraints: [
        "Handle clock skew (`now_ts < last_ts`) safely with `max(0, ...)`",
        "Cap refilled tokens at `capacity` before spending",
      ],
      examples: [{ input: "tokens = 1, last_ts = 10, now_ts = 12, refill_rate = 2, capacity = 5, cost = 3", output: "{'allowed': True, 'tokens': 2}" }],
      initial_code: `def consume_weighted(tokens, last_ts, now_ts, refill_rate, capacity, cost):
    pass`,
      expected_output: "{'allowed': True, 'tokens': 2}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [
        ((1, 10, 12, 2, 5, 3), {"allowed": True, "tokens": 2}),
        ((1, 10, 10, 2, 5, 3), {"allowed": False, "tokens": 1}),
        ((0, 10, 8, 2, 5, 1), {"allowed": False, "tokens": 0}),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = consume_weighted(*args)
        results.append({"id": idx + 1, "input": f"cost={args[5]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Even when denied, return the updated `refilled` token count (not the stale pre-refill value).",
      ],
    },
    {
      id: "sys-22-d3",
      title: "Practice 3/3: Batch Event Stream Limiter",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `simulate_bucket_stream(timestamps, refill_rate, capacity)`: start with a full bucket (`tokens = capacity`, `last_ts = timestamps[0]`) and evaluate each timestamp in order (refill capped at `capacity`, spend 1 if `>= 1`). Return the list of `True/False` allow decisions.",
      constraints: [
        "Return `[]` if `timestamps` is empty",
        "Update `last_ts` after every arrival",
      ],
      examples: [{ input: "timestamps = [0, 0, 0, 2], refill_rate = 1, capacity = 2", output: "[True, True, False, True]" }],
      initial_code: `def simulate_bucket_stream(timestamps, refill_rate, capacity):
    pass`,
      expected_output: "[True, True, False, True]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    cases = [(([0, 0, 0, 2], 1, 2), [True, True, False, True]), (([], 1, 2), [])]
    for idx, (args, exp) in enumerate(cases):
        actual = simulate_bucket_stream(*args)
        results.append({"id": idx + 1, "input": f"ts={args[0]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Starting with `tokens = capacity` lets bursts pass up to `capacity` at `t=0`.",
      ],
    },
  ],

  // 23: Consistent Hash Ring Router
  23: [
    {
      id: "sys-23-d2",
      title: "Practice 2/3: Replication Factor N-Node Selector",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `pick_replica_nodes(ring_nodes, key_hash, replicas)`: starting from the primary server clockwise on `ring_nodes` (`(node_hash, server_name)`), walk clockwise wrapping around to pick up to `replicas` **distinct** server names (handling virtual nodes!).",
      constraints: [
        "Avoid selecting the same physical server name twice even if virtual nodes appear consecutively",
        "Cap output length at `min(replicas, distinct_server_count)`",
      ],
      examples: [
        { input: 'ring_nodes = [(10, "s1"), (30, "s1"), (60, "s2"), (85, "s3")], key_hash = 25, replicas = 2', output: "['s1', 's2']" },
      ],
      initial_code: `def pick_replica_nodes(ring_nodes, key_hash, replicas):
    pass`,
      expected_output: "['s1', 's2']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    ring = [(10, "s1"), (30, "s1"), (60, "s2"), (85, "s3")]
    cases = [
        ((ring, 25, 2), ["s1", "s2"]),
        ((ring, 90, 2), ["s1", "s2"]),
        ((ring, 50, 5), ["s2", "s3", "s1"]),
    ]
    for idx, (args, exp) in enumerate(cases):
        actual = pick_replica_nodes(*args)
        results.append({"id": idx + 1, "input": f"key={args[1]}, rep={args[2]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Sort `(node_hash, name)` by `node_hash`, find start index (`first >= key_hash`, else `0`), and iterate `(start + offset) % len(ordered)` collecting unseen server names.",
      ],
    },
    {
      id: "sys-23-d3",
      title: "Practice 3/3: Key Migration Percentage on Ring Add",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `count_ring_reassignments(old_ring, new_ring, key_hashes)`: route every `key_hash` on `old_ring` vs `new_ring` and return how many keys moved to a different server name.",
      constraints: [
        "Wrap around to the smallest node hash when `key_hash` exceeds all node hashes",
      ],
      examples: [
        { input: 'old_ring = [(20, "a"), (80, "b")], new_ring = [(20, "a"), (50, "c"), (80, "b")], key_hashes = [10, 35, 65, 95]', output: "1" },
      ],
      initial_code: `def count_ring_reassignments(old_ring, new_ring, key_hashes):
    pass`,
      expected_output: "1",
      hidden_tests: `import json
def __run_tests__():
    results = []
    old_r = [(20, "a"), (80, "b")]
    new_r = [(20, "a"), (50, "c"), (80, "b")]
    cases = [((old_r, new_r, [10, 35, 65, 95]), 1), ((old_r, old_r, [10, 35]), 0)]
    for idx, (args, exp) in enumerate(cases):
        actual = count_ring_reassignments(*args)
        results.append({"id": idx + 1, "input": f"keys={args[2]}", "expected": str(exp), "actual": str(actual), "passed": actual == exp})
    return json.dumps({"is_test_suite": True, "all_passed": all(r["passed"] for r in results), "results": results})
__run_tests__()`,
      hints: [
        "Write a helper `route(ring, kh)` and count `sum(1 for kh in key_hashes if route(old_ring, kh) != route(new_ring, kh))`.",
      ],
    },
  ],

  // 24: TTL Cache Expiry Engine
  24: [
    {
      id: "sys-24-d2",
      title: "Practice 2/3: Active Sweep Expired Keys Evictor",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `sweep_expired_keys(cache, now_ts)`: remove all entries in `cache` where `now_ts >= entry['expires_at']` and return the sorted list of purged keys.",
      constraints: [
        "Do not mutate dictionary keys while iterating over `cache` directly (snapshot keys first!)",
      ],
      examples: [
        { input: 'cache = {"k1": {"value": 1, "expires_at": 50}, "k2": {"value": 2, "expires_at": 90}}, now_ts = 50', output: "['k1']" },
      ],
      initial_code: `def sweep_expired_keys(cache, now_ts):
    pass`,
      expected_output: "['k1'] ['k2']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    st = {"k1": {"value": 1, "expires_at": 50}, "k2": {"value": 2, "expires_at": 90}}
    purged = sweep_expired_keys(st, 50)
    p = (purged == ["k1"] and list(st.keys()) == ["k2"])
    results.append({"id": 1, "input": "now_ts=50", "expected": "purged=['k1'], remaining=['k2']", "actual": f"{purged}, {list(st.keys())}", "passed": p})
    return json.dumps({"is_test_suite": True, "all_passed": p, "results": results})
__run_tests__()`,
      hints: [
        "Collect `expired = [k for k, v in cache.items() if now_ts >= v['expires_at']]` first, then `del cache[k]`.",
      ],
    },
    {
      id: "sys-24-d3",
      title: "Practice 3/3: Sliding TTL Touch-on-Read Cache",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `read_with_sliding_ttl(cache, key, now_ts, ttl_sec)`: if missing return `'MISS'`; if `now_ts >= entry['expires_at']`, delete and return `'EXPIRED'`; if still valid, extend `entry['expires_at'] = now_ts + ttl_sec` and return `entry['value']`.",
      constraints: [
        "Extend expiry only on valid cache hits",
      ],
      examples: [
        { input: 'cache = {"s1": {"value": "tok", "expires_at": 100}}, key = "s1", now_ts = 80, ttl_sec = 50', output: "tok" },
      ],
      initial_code: `def read_with_sliding_ttl(cache, key, now_ts, ttl_sec):
    pass`,
      expected_output: "tok 130",
      hidden_tests: `import json
def __run_tests__():
    results = []
    st = {"s1": {"value": "tok", "expires_at": 100}}
    v1 = read_with_sliding_ttl(st, "s1", 80, 50)
    exp1 = st["s1"]["expires_at"]
    v2 = read_with_sliding_ttl(st, "s1", 130, 50)
    v3 = read_with_sliding_ttl(st, "s1", 131, 50)
    p = (v1 == "tok" and exp1 == 130 and v2 == "EXPIRED" and v3 == "MISS")
    results.append({"id": 1, "input": "sliding hit -> expire -> miss", "expected": "tok (exp=130) -> EXPIRED -> MISS", "actual": f"{v1} ({exp1}) -> {v2} -> {v3}", "passed": p})
    return json.dumps({"is_test_suite": True, "all_passed": p, "results": results})
__run_tests__()`,
      hints: [
        "Sliding TTL keeps active user sessions alive while automatically expiring idle ones!",
      ],
    },
  ],
};
