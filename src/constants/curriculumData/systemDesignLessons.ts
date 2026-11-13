export const SYSTEM_DESIGN_EXPANSION_LESSONS = [
  {
    id: "exp-sys-09",
    title: "Exponential Backoff + Jitter Shield",
    track: "system_design",
    category: "RESILIENCE PATTERNS",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Compute exponential retry wait time (base * 2^attempt) plus jitter while capping safely at max_ms.",
    content:
      "When a downstream microservice temporarily drops requests, retrying immediately causes a **thundering herd**.\n\n**Capped Exponential Backoff + Jitter** doubles the wait each attempt and adds randomized jitter, while strictly capping at `max_ms`:\n\n```python\ndelay = base_ms * (2 ** attempt) + jitter_ms\nreturn min(max_ms, delay)\n```",
    assignment:
      "Complete `compute_backoff(attempt, base_ms, max_ms, jitter_ms)` to compute `base_ms * (2 ** attempt) + jitter_ms` capped cleanly at `max_ms` (and never below `0`).",
    constraints: [
      "Treat `attempt = 0` as `base_ms * 1 + jitter_ms`",
      "Clamp the final delay to `[0, max_ms]`",
    ],
    examples: [
      {
        input: "attempt=2, base_ms=100, max_ms=1000, jitter_ms=50",
        output: "450",
        explanation: "100 * (2**2) + 50 = 450 <= 1000.",
      },
      {
        input: "attempt=4, base_ms=100, max_ms=1000, jitter_ms=50",
        output: "1000",
        explanation: "100 * 16 + 50 = 1650 -> capped at 1000.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def compute_backoff(attempt, base_ms, max_ms, jitter_ms):
    # 👉 Compute exponential backoff + jitter and clamp between 0 and max_ms:
    return 0

print(compute_backoff(2, 100, 1000, 50), compute_backoff(4, 100, 1000, 50))`,
    expected_output: "450 1000",
    hidden_tests: `import json
results = []
try:
    r1 = compute_backoff(2, 100, 1000, 50)
    results.append({"id": 1, "input": "attempt=2, base=100, max=1000, jit=50", "expected": "450", "actual": str(r1), "passed": r1 == 450})
    r2 = compute_backoff(4, 100, 1000, 50)
    results.append({"id": 2, "input": "attempt=4 (capped)", "expected": "1000", "actual": str(r2), "passed": r2 == 1000})
    r3 = compute_backoff(0, 200, 1000, 25)
    results.append({"id": 3, "input": "attempt=0", "expected": "225", "actual": str(r3), "passed": r3 == 225})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "attempt 0", value: "100 + 50 = 150ms", type: "int", address: "2^0" },
      { label: "attempt 2", value: "400 + 50 = 450ms", type: "int", address: "2^2" },
      { label: "attempt 4", value: "1650 -> CAPPED 1000ms ✓", type: "int", address: "min()" },
    ],
    hints: [
      "Compute `raw = base_ms * (2 ** attempt) + jitter_ms`.",
      "Clamp with `return max(0, min(max_ms, raw))`.",
    ],
  },
  {
    id: "exp-sys-10",
    title: "Dead-Letter Queue (DLQ) Batch Triager",
    track: "system_design",
    category: "MESSAGE QUEUES",
    difficulty: "Medium",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Route failed worker jobs into either a retry queue or a Dead-Letter Queue (DLQ) once max_attempts is reached.",
    content:
      "Background workers (SQS, Kafka, Celery) isolate poison-pill jobs that keep crashing so healthy messages aren't starved.\n\nGiven `jobs` like `[{\"id\": \"j1\", \"attempts\": 1}, {\"id\": \"j2\", \"attempts\": 3}]` and `max_attempts = 3`:\n- If `job[\"attempts\"] >= max_attempts`: append `job[\"id\"]` to `dlq`\n- Otherwise append `job[\"id\"]` to `retry`",
    assignment:
      'Complete `triage_jobs(jobs, max_attempts)` to return `{"retry": [...], "dlq": [...]}` containing job IDs in order.',
    constraints: [
      "Move jobs with `attempts >= max_attempts` to `\"dlq\"`",
      "Preserve original order of IDs in both buckets",
    ],
    examples: [
      {
        input: 'jobs = [{"id": "j1", "attempts": 1}, {"id": "j2", "attempts": 3}], max_attempts = 3',
        output: "{'retry': ['j1'], 'dlq': ['j2']}",
        explanation: "j2 hit 3 attempts so it moves to DLQ; j1 stays in retry.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def triage_jobs(jobs, max_attempts):
    retry = []
    dlq = []
    # 👉 Route each job['id'] to dlq if attempts >= max_attempts, else retry:
    return {"retry": retry, "dlq": dlq}

sample = [{"id": "j1", "attempts": 1}, {"id": "j2", "attempts": 3}]
print(triage_jobs(sample, 3))`,
    expected_output: "{'retry': ['j1'], 'dlq': ['j2']}",
    hidden_tests: `import json
results = []
try:
    r1 = triage_jobs([{"id": "j1", "attempts": 1}, {"id": "j2", "attempts": 3}], 3)
    results.append({"id": 1, "input": "j1(1), j2(3), max=3", "expected": "{'retry': ['j1'], 'dlq': ['j2']}", "actual": str(r1), "passed": r1 == {"retry": ["j1"], "dlq": ["j2"]}})
    r2 = triage_jobs([{"id": "a", "attempts": 5}, {"id": "b", "attempts": 0}], 2)
    results.append({"id": 2, "input": "a(5), b(0), max=2", "expected": "{'retry': ['b'], 'dlq': ['a']}", "actual": str(r2), "passed": r2 == {"retry": ["b"], "dlq": ["a"]}})
    r3 = triage_jobs([], 3)
    results.append({"id": 3, "input": "empty queue", "expected": "{'retry': [], 'dlq': []}", "actual": str(r3), "passed": r3 == {"retry": [], "dlq": []}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "j1 (1/3)", value: "-> RETRY QUEUE", address: "active" },
      { label: "j2 (3/3)", value: "-> DLQ QUARANTINE 🚨", address: "isolated" },
    ],
    hints: [
      "Loop `for job in jobs:`.",
      "If `job['attempts'] >= max_attempts`: `dlq.append(job['id'])`, else `retry.append(job['id'])`.",
    ],
  },
  {
    id: "exp-sys-11",
    title: "Least-Load Healthy Server Failover",
    track: "system_design",
    category: "HIGH AVAILABILITY",
    difficulty: "Medium",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      "Filter out unhealthy nodes and select the least-loaded healthy server (or 'UNAVAILABLE' if all nodes are down).",
    content:
      "Real load balancers combine **Health Checks** with **Least-Load Routing**.\n\nGiven a list of servers like `[{\"name\": \"us-1\", \"healthy\": False, \"load\": 10}, {\"name\": \"us-2\", \"healthy\": True, \"load\": 45}, {\"name\": \"eu-1\", \"healthy\": True, \"load\": 20}]`:\n1. Filter to `healthy == True` nodes.\n2. Return the `\"name\"` of the healthy node with the lowest `\"load\"`.\n3. If zero nodes are healthy, return `\"UNAVAILABLE\"`!",
    assignment:
      'Complete `pick_healthy_server(servers)` to return the `name` of the lowest-load healthy server, or `"UNAVAILABLE"` if none are healthy.',
    constraints: [
      "Never select a node where `healthy` is `False` even if its `load` is 0",
      'Return `"UNAVAILABLE"` when no healthy node exists',
    ],
    examples: [
      {
        input: '[{"name":"us-1","healthy":False,"load":10}, {"name":"us-2","healthy":True,"load":45}, {"name":"eu-1","healthy":True,"load":20}]',
        output: "eu-1",
        explanation: "us-1 is down; between us-2 (45) and eu-1 (20), eu-1 has lower load.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def pick_healthy_server(servers):
    # 👉 Filter healthy servers and pick the one with minimum load, else "UNAVAILABLE":
    return "UNAVAILABLE"

fleet = [
    {"name": "us-1", "healthy": False, "load": 10},
    {"name": "us-2", "healthy": True, "load": 45},
    {"name": "eu-1", "healthy": True, "load": 20},
]
print(pick_healthy_server(fleet))`,
    expected_output: "eu-1",
    hidden_tests: `import json
results = []
try:
    f1 = [{"name":"us-1","healthy":False,"load":10},{"name":"us-2","healthy":True,"load":45},{"name":"eu-1","healthy":True,"load":20}]
    r1 = pick_healthy_server(f1)
    results.append({"id": 1, "input": "us-1 down, us-2(45), eu-1(20)", "expected": "eu-1", "actual": str(r1), "passed": r1 == "eu-1"})
    f2 = [{"name":"a","healthy":False,"load":0},{"name":"b","healthy":False,"load":5}]
    r2 = pick_healthy_server(f2)
    results.append({"id": 2, "input": "all unhealthy", "expected": "UNAVAILABLE", "actual": str(r2), "passed": r2 == "UNAVAILABLE"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "us-1 (load 10)", value: "OFFLINE -> skipped", address: "healthy=False" },
      { label: "us-2 (load 45)", value: "healthy backup", address: "load=45" },
      { label: "eu-1 (load 20)", value: "SELECTED ✓", address: "min load" },
    ],
    hints: [
      "Filter first: `healthy = [s for s in servers if s.get('healthy')]`.",
      "If not `healthy`: return `'UNAVAILABLE'`, else `return min(healthy, key=lambda s: s['load'])['name']`.",
    ],
  },
  {
    id: "exp-sys-12",
    title: "Latency-Aware CDN Edge Selector",
    track: "system_design",
    category: "GLOBAL EDGE",
    difficulty: "Medium",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      "Route a user to their regional CDN edge if healthy, otherwise fail over to the lowest-latency healthy edge worldwide.",
    content:
      "CDNs prefer the PoP inside the user's `region` (`edge['region'] == region and edge['healthy']`).\n\nIf that local edge is missing or unhealthy, the router must fail over to the **lowest-latency healthy edge** globally (or `\"origin\"` if every edge is offline).",
    assignment:
      "Complete `pick_cdn_server(edges, region)` where each edge is `{\"id\": str, \"region\": str, \"latency_ms\": int, \"healthy\": bool}`, returning the chosen edge `id` (or `\"origin\"`).",
    constraints: [
      "Prefer a healthy edge matching `region` (lowest `latency_ms` if multiple)",
      'Fall back to the lowest-latency healthy edge in any region, or `"origin"` if all are down',
    ],
    examples: [
      {
        input: 'edges = [{"id":"eu-1","region":"eu","latency_ms":15,"healthy":False}, {"id":"us-1","region":"us","latency_ms":85,"healthy":True}, {"id":"uk-1","region":"uk","latency_ms":35,"healthy":True}], region = "eu"',
        output: "uk-1",
        explanation: "eu-1 is down, so fail over to uk-1 (35ms < 85ms).",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def pick_cdn_server(edges, region):
    # 👉 1. Filter to healthy edges (return "origin" if none)
    # 👉 2. Prefer lowest-latency edge matching region, else lowest-latency overall
    return "origin"

pops = [
    {"id": "eu-1", "region": "eu", "latency_ms": 15, "healthy": False},
    {"id": "us-1", "region": "us", "latency_ms": 85, "healthy": True},
    {"id": "uk-1", "region": "uk", "latency_ms": 35, "healthy": True},
]
print(pick_cdn_server(pops, "eu"))`,
    expected_output: "uk-1",
    hidden_tests: `import json
results = []
try:
    pops = [
        {"id": "eu-1", "region": "eu", "latency_ms": 15, "healthy": False},
        {"id": "us-1", "region": "us", "latency_ms": 85, "healthy": True},
        {"id": "uk-1", "region": "uk", "latency_ms": 35, "healthy": True},
    ]
    r1 = pick_cdn_server(pops, "eu")
    results.append({"id": 1, "input": "region='eu' (eu-1 down)", "expected": "uk-1", "actual": str(r1), "passed": r1 == "uk-1"})
    r2 = pick_cdn_server(pops, "us")
    results.append({"id": 2, "input": "region='us' (us-1 healthy)", "expected": "us-1", "actual": str(r2), "passed": r2 == "us-1"})
    r3 = pick_cdn_server([{"id": "x", "region": "eu", "latency_ms": 10, "healthy": False}], "eu")
    results.append({"id": 3, "input": "all edges offline", "expected": "origin", "actual": str(r3), "passed": r3 == "origin"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "eu-1 (15ms)", value: "UNHEALTHY -> skipped", address: "eu" },
      { label: "uk-1 (35ms)", value: "FALLBACK PICKED ✓", address: "35ms < 85ms" },
      { label: "us-1 (85ms)", value: "healthy backup", address: "us" },
    ],
    hints: [
      "Keep `healthy = [e for e in edges if e['healthy']]` and `local = [e for e in healthy if e['region'] == region]`.",
      "Pick `pool = local if local else healthy`, then return `min(pool, key=lambda e: e['latency_ms'])['id']`.",
    ],
  },
  {
    id: "exp-sys-13",
    title: "Flap-Guarded RAM Incident Detector",
    track: "system_design",
    category: "OBSERVABILITY",
    difficulty: "Medium",
    tree_row: 11,
    lesson_order: 13,
    is_free: false,
    description:
      "Trigger a 'WARN' alert only when consecutive RAM samples stay at or above threshold, ignoring brief 1-tick spikes.",
    content:
      "Paging an on-call engineer on a single 1-second garbage-collection spike creates **alert fatigue**.\n\nInstead, require **`consecutive_needed` consecutive samples** `>= threshold` before returning `\"WARN\"` — resetting the streak counter to `0` whenever a sample drops below `threshold`!",
    assignment:
      'Complete `evaluate_ram_alarm(samples, threshold, consecutive_needed)` to return `"WARN"` if at least `consecutive_needed` consecutive readings in `samples` are `>= threshold`, otherwise `"OK"`.',
    constraints: [
      "Reset the consecutive streak to `0` whenever a sample is `< threshold`",
      'Return `"WARN"` as soon as `streak >= consecutive_needed`',
    ],
    examples: [
      {
        input: "samples = [95, 70, 92, 94], threshold = 90, consecutive_needed = 2",
        output: "WARN",
        explanation: "First 95 is isolated (reset at 70), then [92, 94] hits 2 in a row.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def evaluate_ram_alarm(samples, threshold, consecutive_needed):
    streak = 0
    # 👉 Track consecutive samples >= threshold, resetting on drops:
    return "OK"

print(evaluate_ram_alarm([95, 70, 88, 92], 90, 2), evaluate_ram_alarm([95, 70, 92, 94], 90, 2))`,
    expected_output: "OK WARN",
    hidden_tests: `import json
results = []
try:
    r1 = evaluate_ram_alarm([95, 70, 88, 92], 90, 2)
    results.append({"id": 1, "input": "[95,70,88,92], thresh=90, k=2", "expected": "OK", "actual": str(r1), "passed": r1 == "OK"})
    r2 = evaluate_ram_alarm([95, 70, 92, 94], 90, 2)
    results.append({"id": 2, "input": "[95,70,92,94], thresh=90, k=2", "expected": "WARN", "actual": str(r2), "passed": r2 == "WARN"})
    r3 = evaluate_ram_alarm([90, 90, 90], 90, 3)
    results.append({"id": 3, "input": "[90,90,90], thresh=90, k=3", "expected": "WARN", "actual": str(r3), "passed": r3 == "WARN"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "95%", value: "streak = 1", address: "t=0" },
      { label: "70%", value: "streak reset -> 0", address: "t=1" },
      { label: "92% -> 94%", value: "streak = 2 -> WARN 🚨", address: "t=2..3" },
    ],
    hints: [
      "Inside `for s in samples:`, increment `streak += 1` if `s >= threshold` else reset `streak = 0`.",
      "If `streak >= consecutive_needed`: `return 'WARN'` immediately.",
    ],
  },
  {
    id: "exp-sys-14",
    title: "Deterministic Percentage Rollout Flag",
    track: "system_design",
    category: "FEATURE FLAGS",
    difficulty: "Medium",
    tree_row: 11,
    lesson_order: 14,
    is_free: false,
    description:
      "Evaluate staged percentage rollouts (e.g. 25% of users) deterministically using user_id % 100 and a kill-switch.",
    content:
      "Modern feature flag platforms (LaunchDarkly, Statsig) roll out risky features to **10% -> 25% -> 100%** of users consistently.\n\nEach entry in `flags` looks like `{\"enabled\": True, \"rollout_pct\": 25}`:\n1. If `feature not in flags` or `not flags[feature][\"enabled\"]`: return `False` (master kill-switch)\n2. Compute bucket `user_id % 100` (`0..99`) and return `bucket < flags[feature][\"rollout_pct\"]`!",
    assignment:
      "Complete `is_feature_enabled(flags, feature, user_id)` so disabled/missing flags return `False`, and enabled flags return `True` when `user_id % 100 < rollout_pct`.",
    constraints: [
      "Missing flags or `enabled == False` must always return `False`",
      "Use `user_id % 100 < rollout_pct` so the same user gets a deterministic bucket",
    ],
    examples: [
      {
        input: 'flags = {"ai_search": {"enabled": True, "rollout_pct": 25}}, user_id = 110 vs 140',
        output: "True / False",
        explanation: "110 % 100 = 10 (< 25 -> True); 140 % 100 = 40 (>= 25 -> False).",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def is_feature_enabled(flags, feature, user_id):
    # 👉 Check feature existence & enabled kill-switch, then user_id % 100 < rollout_pct:
    return False

cfg = {"ai_search": {"enabled": True, "rollout_pct": 25}, "old_ui": {"enabled": False, "rollout_pct": 100}}
print(is_feature_enabled(cfg, "ai_search", 110), is_feature_enabled(cfg, "ai_search", 140))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    cfg = {"ai_search": {"enabled": True, "rollout_pct": 25}, "old_ui": {"enabled": False, "rollout_pct": 100}}
    r1 = is_feature_enabled(cfg, "ai_search", 110)
    results.append({"id": 1, "input": "rollout=25, user=110 (bucket 10)", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_feature_enabled(cfg, "ai_search", 125)
    results.append({"id": 2, "input": "rollout=25, user=125 (bucket 25 boundary)", "expected": "False", "actual": str(r2), "passed": r2 is False})
    r3 = is_feature_enabled(cfg, "old_ui", 101)
    results.append({"id": 3, "input": "kill-switch enabled=False", "expected": "False", "actual": str(r3), "passed": r3 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "enabled flag", value: "True (kill-switch ON)", type: "bool", address: "check 1" },
      { label: "user 110 % 100", value: "bucket 10 < 25 -> ON ✓", type: "int", address: "check 2" },
      { label: "user 125 % 100", value: "bucket 25 >= 25 -> OFF", type: "int", address: "boundary" },
    ],
    hints: [
      "Fetch `cfg = flags.get(feature)` and return `False` if `not cfg or not cfg.get('enabled')`.",
      "Then return `(user_id % 100) < cfg.get('rollout_pct', 0)`.",
    ],
  },
  {
    id: "exp-sys-15",
    title: "API Gateway Payload & MIME Validator",
    track: "system_design",
    category: "API GATEWAY",
    difficulty: "Easy",
    tree_row: 12,
    lesson_order: 15,
    is_free: false,
    description:
      "Validate upload size bounds (0 < size <= max_mb) and allowed MIME types at the gateway before touching storage.",
    content:
      "An API Gateway rejects bad uploads early with descriptive reasons before allocating memory or S3 streams:\n\n1. If `size_mb <= 0`: return `{\"ok\": False, \"reason\": \"EMPTY_FILE\"}`\n2. If `size_mb > max_mb`: return `{\"ok\": False, \"reason\": \"TOO_LARGE\"}`\n3. If `content_type not in allowed_types`: return `{\"ok\": False, \"reason\": \"BAD_TYPE\"}`\n4. Otherwise return `{\"ok\": True, \"reason\": \"OK\"}`!",
    assignment:
      "Complete `validate_upload(size_mb, max_mb, content_type, allowed_types)` enforcing size bounds and MIME allowlists with structured status responses.",
    constraints: [
      "Check empty/non-positive size (`<= 0`) first, then `> max_mb`, then `content_type`",
      'Return `{"ok": bool, "reason": str}`',
    ],
    examples: [
      {
        input: 'validate_upload(10, 25, "image/png", ["image/png", "image/jpeg"])',
        output: "{'ok': True, 'reason': 'OK'}",
        explanation: "Size is within (0, 25] and content_type is allowed.",
      },
    ],
    complexities: { time: "O(k) allowed types", space: "O(1)" },
    initial_code: `def validate_upload(size_mb, max_mb, content_type, allowed_types):
    # 👉 Enforce size_mb <= 0 ("EMPTY_FILE"), > max_mb ("TOO_LARGE"), and MIME allowlist ("BAD_TYPE"):
    return {"ok": False, "reason": "UNIMPLEMENTED"}

print(validate_upload(10, 25, "image/png", ["image/png", "image/jpeg"]))`,
    expected_output: "{'ok': True, 'reason': 'OK'}",
    hidden_tests: `import json
results = []
try:
    types = ["image/png", "image/jpeg"]
    r1 = validate_upload(10, 25, "image/png", types)
    results.append({"id": 1, "input": "10MB image/png", "expected": "{'ok': True, 'reason': 'OK'}", "actual": str(r1), "passed": r1 == {"ok": True, "reason": "OK"}})
    r2 = validate_upload(0, 25, "image/png", types)
    results.append({"id": 2, "input": "0MB empty", "expected": "EMPTY_FILE", "actual": str(r2), "passed": r2 == {"ok": False, "reason": "EMPTY_FILE"}})
    r3 = validate_upload(30, 25, "image/png", types)
    results.append({"id": 3, "input": "30MB > 25MB", "expected": "TOO_LARGE", "actual": str(r3), "passed": r3 == {"ok": False, "reason": "TOO_LARGE"}})
    r4 = validate_upload(5, 25, "application/exe", types)
    results.append({"id": 4, "input": "disallowed .exe", "expected": "BAD_TYPE", "actual": str(r4), "passed": r4 == {"ok": False, "reason": "BAD_TYPE"}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "size > 0", value: "reject 0MB / negative", type: "guard", address: "rule 1" },
      { label: "size <= max_mb", value: "reject > 25MB", type: "guard", address: "rule 2" },
      { label: "MIME allowlist", value: "reject .exe -> 415", type: "guard", address: "rule 3" },
    ],
    hints: [
      "Return early on each failing check in order: `EMPTY_FILE`, `TOO_LARGE`, `BAD_TYPE`.",
      "If all 3 guards pass, return `{\"ok\": True, \"reason\": \"OK\"}`.",
    ],
  },
  {
    id: "exp-sys-16",
    title: "Queue-Depth Worker Autoscaler",
    track: "system_design",
    category: "AUTOSCALING",
    difficulty: "Medium",
    tree_row: 13,
    lesson_order: 16,
    is_free: false,
    description:
      "Compute exact desired worker count using ceiling division on queue backlog, clamped between 1 and max_workers.",
    content:
      "Production autoscalers calculate target worker replicas from queue depth using **ceiling division**:\n\n`needed = (queue_len + target_per_worker - 1) // target_per_worker`\n\nFor example, if `target_per_worker = 5` and `queue_len = 12`, you need `3` workers (`2` handle 10 jobs, `3rd` takes the remaining 2). Always clamp between `1` (minimum floor) and `max_workers`!",
    assignment:
      "Complete `scale_workers(queue_len, target_per_worker, max_workers)` returning the desired worker count in `[1, max_workers]`.",
    constraints: [
      "Use ceiling division so partial batches still get a worker",
      "Always keep at least `1` worker and never exceed `max_workers`",
    ],
    examples: [
      {
        input: "queue_len = 12, target_per_worker = 5, max_workers = 10",
        output: "3",
        explanation: "ceil(12 / 5) = 3 workers.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def scale_workers(queue_len, target_per_worker, max_workers):
    # 👉 Compute ceiling(queue_len / target_per_worker) clamped to [1, max_workers]:
    return 1

print(scale_workers(12, 5, 10), scale_workers(0, 5, 10), scale_workers(100, 5, 8))`,
    expected_output: "3 1 8",
    hidden_tests: `import json
results = []
try:
    r1 = scale_workers(12, 5, 10)
    results.append({"id": 1, "input": "queue=12, per=5, max=10", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = scale_workers(0, 5, 10)
    results.append({"id": 2, "input": "queue=0 (min floor 1)", "expected": "1", "actual": str(r2), "passed": r2 == 1})
    r3 = scale_workers(100, 5, 8)
    results.append({"id": 3, "input": "queue=100 (capped at max=8)", "expected": "8", "actual": str(r3), "passed": r3 == 8})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "queue_len = 12", value: "ceil(12 / 5) = 3 workers", type: "int", address: "normal" },
      { label: "queue_len = 0", value: "min floor -> 1 worker", type: "int", address: "min(1)" },
      { label: "queue_len = 100", value: "cap -> 8 workers ✓", type: "int", address: "max(8)" },
    ],
    hints: [
      "Compute `needed = (queue_len + target_per_worker - 1) // target_per_worker`.",
      "Clamp with `return max(1, min(max_workers, needed))`.",
    ],
  },
  {
    id: "exp-sys-17",
    title: "Scoped API Key & Expiry Authorizer",
    track: "system_design",
    category: "AUTH & SECURITY",
    difficulty: "Medium",
    tree_row: 14,
    lesson_order: 17,
    is_free: false,
    description:
      "Enforce API key existence, revocation status, TTL expiry, and RBAC permission scopes in one gateway check.",
    content:
      "Real API authentication checks 4 conditions on every token record (`{\"active\": bool, \"expires_at\": int, \"scopes\": [...]}`):\n\n1. Key exists in `key_store`\n2. `record[\"active\"]` is `True` (not revoked)\n3. `now_ts < record[\"expires_at\"]` (not expired)\n4. `required_scope in record[\"scopes\"]` (least-privilege RBAC)",
    assignment:
      "Complete `authorize_request(key_store, api_key, required_scope, now_ts)` returning `True` only when all 4 security checks pass.",
    constraints: [
      "Reject revoked (`active == False`) or expired (`now_ts >= expires_at`) keys",
      "Verify `required_scope` is present inside `record['scopes']`",
    ],
    examples: [
      {
        input: 'api_key="k1", required_scope="read", now_ts=50 (expires_at=100, active=True, scopes=["read"])',
        output: "True",
        explanation: "Active, unexpired, and authorized for 'read'.",
      },
    ],
    complexities: { time: "O(1) key lookup", space: "O(1)" },
    initial_code: `def authorize_request(key_store, api_key, required_scope, now_ts):
    # 👉 Verify key exists, is active, now_ts < expires_at, and required_scope is in scopes:
    return False

keys = {
    "k1": {"active": True, "expires_at": 100, "scopes": ["read", "write"]},
    "k2": {"active": False, "expires_at": 200, "scopes": ["read"]},
}
print(authorize_request(keys, "k1", "write", 50), authorize_request(keys, "k1", "write", 100))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    keys = {
        "k1": {"active": True, "expires_at": 100, "scopes": ["read", "write"]},
        "k2": {"active": False, "expires_at": 200, "scopes": ["read"]},
    }
    results.append({"id": 1, "input": "valid k1 read/write at t=50", "expected": "True", "actual": str(authorize_request(keys, "k1", "write", 50)), "passed": authorize_request(keys, "k1", "write", 50) is True})
    results.append({"id": 2, "input": "expired k1 at t=100", "expected": "False", "actual": str(authorize_request(keys, "k1", "write", 100)), "passed": authorize_request(keys, "k1", "write", 100) is False})
    results.append({"id": 3, "input": "revoked k2", "expected": "False", "actual": str(authorize_request(keys, "k2", "read", 50)), "passed": authorize_request(keys, "k2", "read", 50) is False})
    results.append({"id": 4, "input": "missing scope 'admin'", "expected": "False", "actual": str(authorize_request(keys, "k1", "admin", 50)), "passed": authorize_request(keys, "k1", "admin", 50) is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "active?", value: "True -> not revoked", address: "check 1" },
      { label: "now < expires_at", value: "50 < 100 -> fresh", address: "check 2" },
      { label: "scope check", value: "'write' in scopes -> 200 OK ✓", address: "RBAC" },
    ],
    hints: [
      "Look up `rec = key_store.get(api_key)` and return `False` if `not rec`.",
      "Return `bool(rec.get('active') and now_ts < rec.get('expires_at', 0) and required_scope in rec.get('scopes', []))`.",
    ],
  },
  {
    id: "exp-sys-18",
    title: "Pagination Metadata & Slice Engine",
    track: "system_design",
    category: "API PAGINATION",
    difficulty: "Medium",
    tree_row: 14,
    lesson_order: 18,
    is_free: false,
    description:
      "Slice an items list by (page, page_size) and compute accurate has_next and total_pages metadata.",
    content:
      "REST APIs never just return a raw array — they return the page slice plus navigation metadata:\n\n- `offset = max(0, page - 1) * page_size`\n- `page_items = items[offset : offset + page_size]`\n- `has_next = (offset + page_size) < len(items)`\n- `total_pages = (len(items) + page_size - 1) // page_size` if `items` is non-empty else `0`",
    assignment:
      'Complete `paginate_items(items, page, page_size)` returning `{"items": page_items, "has_next": bool, "total_pages": int}`.',
    constraints: [
      "Handle empty `items` cleanly (`items: [], has_next: False, total_pages: 0`)",
      "Compute `has_next` accurately on exact-multiple boundaries",
    ],
    examples: [
      {
        input: "items = ['a','b','c','d','e'], page = 2, page_size = 2",
        output: "{'items': ['c', 'd'], 'has_next': True, 'total_pages': 3}",
        explanation: "Page 2 skips 2 items -> ['c', 'd']; 'e' remains on page 3 so has_next=True.",
      },
    ],
    complexities: { time: "O(k) slice", space: "O(k)" },
    initial_code: `def paginate_items(items, page, page_size):
    # 👉 Slice items[offset : offset + page_size] and compute has_next + total_pages:
    return {"items": [], "has_next": False, "total_pages": 0}

print(paginate_items(["a", "b", "c", "d", "e"], 2, 2))`,
    expected_output: "{'items': ['c', 'd'], 'has_next': True, 'total_pages': 3}",
    hidden_tests: `import json
results = []
try:
    r1 = paginate_items(["a", "b", "c", "d", "e"], 2, 2)
    results.append({"id": 1, "input": "5 items, page=2, size=2", "expected": "['c','d'], next=True, pages=3", "actual": str(r1), "passed": r1 == {"items": ["c", "d"], "has_next": True, "total_pages": 3}})
    r2 = paginate_items(["a", "b", "c", "d"], 2, 2)
    results.append({"id": 2, "input": "4 items, page=2, size=2 (exact end)", "expected": "['c','d'], next=False, pages=2", "actual": str(r2), "passed": r2 == {"items": ["c", "d"], "has_next": False, "total_pages": 2}})
    r3 = paginate_items([], 1, 10)
    results.append({"id": 3, "input": "empty items", "expected": "0 pages", "actual": str(r3), "passed": r3 == {"items": [], "has_next": False, "total_pages": 0}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "page 1", value: "['a', 'b'] (offset 0)", address: "0..1" },
      { label: "page 2", value: "['c', 'd'] has_next=True ✓", address: "2..3" },
      { label: "page 3", value: "['e'] has_next=False", address: "4" },
    ],
    hints: [
      "Compute `offset = max(0, page - 1) * page_size` and `sliced = items[offset : offset + page_size]`.",
      "Compute `total_pages = (len(items) + page_size - 1) // page_size if items else 0`.",
    ],
  },
  {
    id: "exp-sys-19",
    title: "Cache-Aside Read-Through Simulator",
    track: "system_design",
    category: "REDIS PATTERNS",
    difficulty: "Medium",
    tree_row: 15,
    lesson_order: 19,
    is_free: false,
    description:
      "Implement the Cache-Aside pattern: check Redis key user:{id}:profile first, populate from DB on miss, and avoid caching None.",
    content:
      "In the **Cache-Aside** pattern:\n\n1. Build the deterministic key: `key = f\"user:{user_id}:profile\"`\n2. If `key in cache`: return `{\"source\": \"cache\", \"data\": cache[key]}`\n3. Otherwise look up `user_id` in `db`: if found, write `cache[key] = db[user_id]` (cache warming) and return `{\"source\": \"db\", \"data\": db[user_id]}`.\n4. If missing in both, return `{\"source\": \"miss\", \"data\": None}` without polluting cache!",
    assignment:
      'Complete `fetch_user_profile(cache, db, user_id)` using key `f"user:{user_id}:profile"` and populating `cache` on a DB hit.',
    constraints: [
      'Always use key format `f"user:{user_id}:profile"`',
      "Populate `cache[key]` only when `user_id` exists in `db`",
    ],
    examples: [
      {
        input: 'cache={}, db={42: "Aria"}, user_id=42 -> 1st call then 2nd call',
        output: "{'source': 'db', 'data': 'Aria'} then {'source': 'cache', 'data': 'Aria'}",
        explanation: "First read warms cache['user:42:profile']; second read hits cache directly.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def fetch_user_profile(cache, db, user_id):
    key = f"user:{user_id}:profile"
    # 👉 1. Return cache hit if key in cache
    # 👉 2. Else query db, warm cache[key] if found, or return miss:
    return {"source": "miss", "data": None}

c = {}
d = {42: "Aria"}
print(fetch_user_profile(c, d, 42), fetch_user_profile(c, d, 42))`,
    expected_output: "{'source': 'db', 'data': 'Aria'} {'source': 'cache', 'data': 'Aria'}",
    hidden_tests: `import json
results = []
try:
    c = {}
    d = {42: "Aria"}
    r1 = fetch_user_profile(c, d, 42)
    r2 = fetch_user_profile(c, d, 42)
    results.append({"id": 1, "input": "1st read (DB + cache warm)", "expected": "db -> Aria", "actual": str(r1), "passed": r1 == {"source": "db", "data": "Aria"} and c.get("user:42:profile") == "Aria"})
    results.append({"id": 2, "input": "2nd read (Cache Hit)", "expected": "cache -> Aria", "actual": str(r2), "passed": r2 == {"source": "cache", "data": "Aria"}})
    r3 = fetch_user_profile(c, d, 99)
    results.append({"id": 3, "input": "missing user 99", "expected": "miss -> None", "actual": str(r3), "passed": r3 == {"source": "miss", "data": None} and "user:99:profile" not in c})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "Read #1", value: "MISS -> DB ('Aria') -> save cache", address: "warmed" },
      { label: "Read #2", value: "cache['user:42:profile'] -> HIT ✓", address: "0.2ms" },
      { label: "user 99", value: "not in DB -> 'miss' (not cached)", address: "clean" },
    ],
    hints: [
      "If `key in cache`: `return {'source': 'cache', 'data': cache[key]}`.",
      "If `user_id in db`: `cache[key] = db[user_id]; return {'source': 'db', 'data': db[user_id]}`.",
    ],
  },
  {
    id: "exp-sys-20",
    title: "Chunked Notification Batch Splitter",
    track: "system_design",
    category: "BATCH PROCESSING",
    difficulty: "Easy",
    tree_row: 16,
    lesson_order: 20,
    is_free: false,
    description:
      "Split a list of user IDs into fixed-size worker batches including any smaller trailing partial batch.",
    content:
      "Email and push-notification services (like AWS SES or APNs) limit bulk requests to `batch_size` recipients per API call.\n\nUse `range(0, len(user_ids), batch_size)` to slice consecutive chunks `[user_ids[i : i + batch_size] ...]` without dropping the trailing partial chunk! Guard against `batch_size <= 0` by returning `[]`.",
    assignment:
      "Complete `build_batches(user_ids, batch_size)` to return a list of sublist batches of at most `batch_size` items each (or `[]` if `batch_size <= 0`).",
    constraints: [
      "Include any trailing partial batch at the end",
      "Return `[]` safely when `user_ids` is empty or `batch_size <= 0`",
    ],
    examples: [
      {
        input: "user_ids = [1, 2, 3, 4, 5], batch_size = 2",
        output: "[[1, 2], [3, 4], [5]]",
        explanation: "Two full batches of 2 plus one partial batch [5].",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def build_batches(user_ids, batch_size):
    # 👉 Guard batch_size <= 0, then slice chunks of batch_size:
    return []

print(build_batches([1, 2, 3, 4, 5], 2))`,
    expected_output: "[[1, 2], [3, 4], [5]]",
    hidden_tests: `import json
results = []
try:
    r1 = build_batches([1, 2, 3, 4, 5], 2)
    results.append({"id": 1, "input": "[1,2,3,4,5], batch=2", "expected": "[[1, 2], [3, 4], [5]]", "actual": str(r1), "passed": r1 == [[1, 2], [3, 4], [5]]})
    r2 = build_batches([10, 20], 5)
    results.append({"id": 2, "input": "[10,20], batch=5", "expected": "[[10, 20]]", "actual": str(r2), "passed": r2 == [[10, 20]]})
    r3 = build_batches([1, 2], 0)
    results.append({"id": 3, "input": "batch_size=0 guard", "expected": "[]", "actual": str(r3), "passed": r3 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "Batch #1", value: "[1, 2]", address: "0:2" },
      { label: "Batch #2", value: "[3, 4]", address: "2:4" },
      { label: "Batch #3", value: "[5] (trailing partial ✓)", address: "4:6" },
    ],
    hints: [
      "First check `if batch_size <= 0: return []`.",
      "Then `return [user_ids[i : i + batch_size] for i in range(0, len(user_ids), batch_size)]`.",
    ],
  },
  {
    id: "exp-sys-21",
    title: "Architecture Capstone: Sliding Window Log Limiter",
    track: "system_design",
    category: "API GATEWAY",
    difficulty: "Medium",
    tree_row: 17,
    lesson_order: 21,
    is_free: false,
    description:
      "Prune expired request timestamps outside the rolling window and allow traffic only if under the rate limit.",
    content:
      'Production API gateways (Stripe, Cloudflare) prevent abuse using a **Sliding Window Log** instead of fixed minute boundaries.\n\nGiven past request `timestamps`, current time `now`, window width `window_sec`, and `limit`:\n1. Keep only active timestamps within the window: `active = [t for t in timestamps if now - t < window_sec]`\n2. If `len(active) < limit`, allow the request (`{"allowed": True, "active_count": len(active) + 1}`).\n3. Otherwise reject it (`{"allowed": False, "active_count": len(active)}`).',
    assignment:
      'Complete `evaluate_sliding_window(timestamps, now, window_sec, limit)` so it prunes expired timestamps (`now - t >= window_sec`) and returns `{"allowed": True/False, "active_count": ...}`.',
    constraints: [
      "Only keep timestamps where `now - t < window_sec`",
      'Include the new request in `"active_count"` when `"allowed"` is `True`',
    ],
    examples: [
      {
        input: "timestamps = [10, 45, 55], now = 70, window_sec = 30, limit = 3",
        output: "{'allowed': True, 'active_count': 3}",
        explanation: "70 - 10 = 60 >= 30 (expired). Only [45, 55] remain (2 < 3), so new request is allowed (active_count=3).",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def evaluate_sliding_window(timestamps, now, window_sec, limit):
    # 👉 1. Filter timestamps within the active window (now - t < window_sec)
    # 👉 2. Return {"allowed": True/False, "active_count": ...}
    return {"allowed": False, "active_count": 0}

print(evaluate_sliding_window([10, 45, 55], 70, 30, 3))`,
    expected_output: "{'allowed': True, 'active_count': 3}",
    hidden_tests: `import json
results = []
try:
    r1 = evaluate_sliding_window([10, 45, 55], 70, 30, 3)
    results.append({"id": 1, "input": "[10,45,55], now=70, win=30, lim=3", "expected": "{'allowed': True, 'active_count': 3}", "actual": str(r1), "passed": r1 == {"allowed": True, "active_count": 3}})
    r2 = evaluate_sliding_window([50, 55, 60], 70, 30, 3)
    results.append({"id": 2, "input": "[50,55,60], now=70, win=30, lim=3 (full)", "expected": "{'allowed': False, 'active_count': 3}", "actual": str(r2), "passed": r2 == {"allowed": False, "active_count": 3}})
    r3 = evaluate_sliding_window([40], 70, 30, 1)
    results.append({"id": 3, "input": "[40] boundary 70-40==30 (expired)", "expected": "{'allowed': True, 'active_count': 1}", "actual": str(r3), "passed": r3 == {"allowed": True, "active_count": 1}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "t = 10s", value: "EXPIRED (70-10=60 >= 30)", address: "pruned" },
      { label: "t = 45s", value: "ACTIVE (25s ago)", address: "kept" },
      { label: "t = 55s", value: "ACTIVE (15s ago)", address: "kept" },
      { label: "now = 70s", value: "2 < 3 -> ALLOWED (3) ✓", address: "200 OK" },
    ],
    hints: [
      "Compute `active = [t for t in timestamps if now - t < window_sec]`.",
      "If `len(active) < limit`, return `{\"allowed\": True, \"active_count\": len(active) + 1}`.",
    ],
  },
  {
    id: "exp-sys-22",
    title: "Architecture Capstone: Token Bucket Refill Simulator",
    track: "system_design",
    category: "TRAFFIC SHAPING",
    difficulty: "Medium",
    tree_row: 17,
    lesson_order: 22,
    is_free: false,
    description:
      "Refill tokens proportionally to elapsed seconds without exceeding burst capacity, then spend 1 token if available.",
    content:
      "A **Token Bucket** lets users send short bursts while enforcing a steady long-term rate:\n\n1. Calculate elapsed seconds: `elapsed = max(0, now_ts - last_ts)`\n2. Refill and cap at `capacity`: `refilled = min(capacity, tokens + elapsed * refill_rate)`\n3. If `refilled >= 1`, deduct 1 token and return `{\"allowed\": True, \"tokens\": refilled - 1}`.\n4. Otherwise deny and return `{\"allowed\": False, \"tokens\": refilled}`.",
    assignment:
      'Complete `consume_token(tokens, last_ts, now_ts, refill_rate, capacity)` to refill tokens up to `capacity` and spend 1 token if `refilled >= 1`.',
    constraints: [
      "Never let refilled tokens exceed `capacity`",
      "Only deduct 1 token when `refilled >= 1`",
    ],
    examples: [
      {
        input: "tokens=1, last_ts=10, now_ts=13, refill_rate=2, capacity=5",
        output: "{'allowed': True, 'tokens': 4}",
        explanation: "3s elapsed * 2 = +6 tokens -> capped at capacity 5 -> minus 1 = 4.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def consume_token(tokens, last_ts, now_ts, refill_rate, capacity):
    # 👉 1. Refill tokens using elapsed time capped at capacity
    # 👉 2. If refilled >= 1, spend 1 and allow; else deny
    return {"allowed": False, "tokens": tokens}

print(consume_token(1, 10, 13, 2, 5))`,
    expected_output: "{'allowed': True, 'tokens': 4}",
    hidden_tests: `import json
results = []
try:
    r1 = consume_token(1, 10, 13, 2, 5)
    results.append({"id": 1, "input": "tokens=1, elapsed=3, rate=2, cap=5", "expected": "{'allowed': True, 'tokens': 4}", "actual": str(r1), "passed": r1 == {"allowed": True, "tokens": 4}})
    r2 = consume_token(0, 10, 10, 1, 5)
    results.append({"id": 2, "input": "empty bucket, elapsed=0", "expected": "{'allowed': False, 'tokens': 0}", "actual": str(r2), "passed": r2 == {"allowed": False, "tokens": 0}})
    r3 = consume_token(2, 10, 11, 1, 5)
    results.append({"id": 3, "input": "tokens=2, elapsed=1, rate=1, cap=5", "expected": "{'allowed': True, 'tokens': 2}", "actual": str(r3), "passed": r3 == {"allowed": True, "tokens": 2}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "start tokens", value: "1", type: "int", address: "t=10s" },
      { label: "elapsed * rate", value: "+6 (capped -> 5)", type: "int", address: "t=13s" },
      { label: "spend 1 token", value: "4 remaining ✓", type: "bool", address: "ALLOWED" },
    ],
    hints: [
      "Compute `refilled = min(capacity, tokens + max(0, now_ts - last_ts) * refill_rate)`.",
      "If `refilled >= 1`: return `{\"allowed\": True, \"tokens\": refilled - 1}`.",
    ],
  },
  {
    id: "exp-sys-23",
    title: "Architecture Capstone: Consistent Hash Ring Router",
    track: "system_design",
    category: "DISTRIBUTED ROUTING",
    difficulty: "Medium",
    tree_row: 18,
    lesson_order: 23,
    is_free: false,
    description:
      "Route a hashed request clockwise on a sorted consistent-hashing ring, wrapping around to node 0 when past the max node.",
    content:
      "In **Consistent Hashing** (used by DynamoDB, Cassandra, and Discord), servers sit at positions on a numeric ring.\n\nGiven unsorted `ring_nodes` like `[(90, 'db-c'), (20, 'db-a'), (55, 'db-b')]` and a `key_hash`:\n1. Sort nodes by their hash position: `ordered = sorted(ring_nodes, key=lambda item: item[0])`\n2. Walk clockwise and return the **first server** whose `node_hash >= key_hash`.\n3. If `key_hash` is greater than every node on the ring, wrap around and return `ordered[0][1]`!",
    assignment:
      "Complete `route_hash_ring(ring_nodes, key_hash)` so it sorts `ring_nodes` by position and returns the clockwise target server name (wrapping around to `ordered[0][1]`).",
    constraints: [
      "Sort `ring_nodes` by `node_hash` first",
      "Wrap around to the smallest-hash server when `key_hash` exceeds all node hashes",
    ],
    examples: [
      {
        input: "ring_nodes = [(90, 'db-c'), (20, 'db-a'), (55, 'db-b')], key_hash = 60",
        output: "db-c",
        explanation: "Sorted ring is 20 -> 55 -> 90. Moving clockwise from 60 hits 90 ('db-c').",
      },
      {
        input: "ring_nodes = [(90, 'db-c'), (20, 'db-a'), (55, 'db-b')], key_hash = 95",
        output: "db-a",
        explanation: "95 > 90, so it wraps around to the first node at 20 ('db-a').",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def route_hash_ring(ring_nodes, key_hash):
    ordered = sorted(ring_nodes, key=lambda item: item[0])
    # 👉 Return first server where node_hash >= key_hash, else wrap around to ordered[0][1]:
    return ""

print(route_hash_ring([(90, "db-c"), (20, "db-a"), (55, "db-b")], 60))`,
    expected_output: "db-c",
    hidden_tests: `import json
results = []
try:
    ring = [(90, "db-c"), (20, "db-a"), (55, "db-b")]
    r1 = route_hash_ring(ring, 60)
    results.append({"id": 1, "input": "key_hash=60", "expected": "db-c", "actual": str(r1), "passed": r1 == "db-c"})
    r2 = route_hash_ring(ring, 95)
    results.append({"id": 2, "input": "key_hash=95 (wrap-around)", "expected": "db-a", "actual": str(r2), "passed": r2 == "db-a"})
    r3 = route_hash_ring(ring, 20)
    results.append({"id": 3, "input": "key_hash=20 (exact match)", "expected": "db-a", "actual": str(r3), "passed": r3 == "db-a"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "20: db-a", value: "handles 91..100 & 0..20", address: "wrap node" },
      { label: "55: db-b", value: "handles 21..55", address: "slot 1" },
      { label: "90: db-c", value: "key 60 -> db-c 🎯", address: "slot 2" },
    ],
    hints: [
      "Loop `for node_hash, server in ordered:`: if `node_hash >= key_hash: return server`.",
      "After the loop ends, return `ordered[0][1]` to wrap around.",
    ],
  },
  {
    id: "exp-sys-24",
    title: "Architecture Capstone: TTL Cache Expiry Engine",
    track: "system_design",
    category: "CACHING ARCHITECTURE",
    difficulty: "Hard",
    tree_row: 18,
    lesson_order: 24,
    is_free: false,
    description:
      "Implement passive TTL cache reads that evict stale entries when now_ts >= expires_at and return live values otherwise.",
    content:
      'Caches attach a **Time-To-Live (`expires_at`)** to every key so stale database rows eventually refresh.\n\nEach entry in `cache` looks like `{"value": "Alice", "expires_at": 100}`:\n1. If `key not in cache`: return `"MISS"`\n2. If `now_ts >= cache[key]["expires_at"]`: delete the stale key (`del cache[key]`) and return `"EXPIRED"`\n3. Otherwise return `cache[key]["value"]`!',
    assignment:
      'Complete `read_ttl_cache(cache, key, now_ts)` so missing keys return `"MISS"`, expired keys are deleted from `cache` and return `"EXPIRED"`, and fresh keys return their stored `"value"`.',
    constraints: [
      'Delete expired keys from `cache` (`del cache[key]`) when `now_ts >= entry["expires_at"]`',
      'Return `"MISS"`, `"EXPIRED"`, or the cached `"value"`',
    ],
    examples: [
      {
        input: 'cache = {"u1": {"value": "Alice", "expires_at": 100}}, now_ts = 80 / 100',
        output: "Alice / EXPIRED",
        explanation: "At t=80 (<100) returns 'Alice'; at t=100 (>=100) deletes key and returns 'EXPIRED'.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def read_ttl_cache(cache, key, now_ts):
    # 👉 Handle missing key -> "MISS", expired -> del & "EXPIRED", valid -> value:
    return "MISS"

store = {"u1": {"value": "Alice", "expires_at": 100}}
print(read_ttl_cache(store, "u1", 80), read_ttl_cache(store, "u1", 100))`,
    expected_output: "Alice EXPIRED",
    hidden_tests: `import json
results = []
try:
    store = {"u1": {"value": "Alice", "expires_at": 100}, "u2": {"value": "Bob", "expires_at": 200}}
    r1 = read_ttl_cache(store, "u1", 80)
    results.append({"id": 1, "input": "u1 at t=80 (fresh)", "expected": "Alice", "actual": str(r1), "passed": r1 == "Alice"})
    r2 = read_ttl_cache(store, "u1", 100)
    results.append({"id": 2, "input": "u1 at t=100 (expired & evicted)", "expected": "EXPIRED (removed)", "actual": f"{r2} (in_cache={'u1' in store})", "passed": r2 == "EXPIRED" and "u1" not in store})
    r3 = read_ttl_cache(store, "missing", 100)
    results.append({"id": 3, "input": "unknown key", "expected": "MISS", "actual": str(r3), "passed": r3 == "MISS"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "t = 80s", value: "80 < 100 -> HIT ('Alice') ✓", address: "TTL active" },
      { label: "t = 100s", value: "100 >= 100 -> del & EXPIRED", address: "evicted" },
      { label: "key 'u9'", value: "not in cache -> MISS", address: "DB fallback" },
    ],
    hints: [
      'Check `if key not in cache: return "MISS"`.',
      'Then check `if now_ts >= cache[key]["expires_at"]: del cache[key]; return "EXPIRED"`.',
    ],
  },
];
