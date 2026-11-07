export const SYSTEM_DESIGN_EXPANSION_LESSONS = [
  {
    id: "exp-sys-09",
    title: "Retry Cap: Maximum Wait Time Shield",
    track: "system_design",
    category: "RESILIENCE PATTERNS",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Use min(delay_ms, max_ms) so a reconnecting app never waits longer than the maximum cap.",
    content:
      "When an app loses connection, it waits between retries (`delay_ms`). To keep the app responsive, we cap the wait time at `max_ms` using **`min(delay_ms, max_ms)`**:\n\n```python\ndef get_retry_wait(delay_ms, max_ms):\n    return min(delay_ms, max_ms)\n```",
    assignment:
      "Complete `get_retry_wait(delay_ms, max_ms)` so it returns whichever value is smaller using `min(delay_ms, max_ms)`.",
    constraints: [
      "Use `min(delay_ms, max_ms)` to cap the retry wait time",
      "Return the result",
    ],
    examples: [
      {
        input: "get_retry_wait(400, 1000) and get_retry_wait(1600, 1000)",
        output: "400 1000",
        explanation: "400 stays 400; 1600 is capped at 1000.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def get_retry_wait(delay_ms, max_ms):
    # 👉 Write 1 line: return min(delay_ms, max_ms)
    return 0

print(get_retry_wait(400, 1000), get_retry_wait(1600, 1000))`,
    expected_output: "400 1000",
    hidden_tests: `import json
results = []
try:
    r1 = get_retry_wait(400, 1000)
    results.append({"id": 1, "input": "delay=400, max=1000", "expected": "400", "actual": str(r1), "passed": r1 == 400})
    r2 = get_retry_wait(1600, 1000)
    results.append({"id": 2, "input": "delay=1600, max=1000 (capped)", "expected": "1000", "actual": str(r2), "passed": r2 == 1000})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      {
        label: "delay = 400ms",
        value: "400ms (under cap)",
        address: "min(400, 1000)",
      },
      {
        label: "delay = 800ms",
        value: "800ms (under cap)",
        address: "min(800, 1000)",
      },
      {
        label: "delay = 1600ms",
        value: "CAPPED AT 1000ms ✓",
        address: "min(1600, 1000)",
      },
    ],
    hints: ["Replace `return 0` with `return min(delay_ms, max_ms)`."],
  },
  {
    id: "exp-sys-10",
    title: "Stuck Job Alert: 3-Strike Rule",
    track: "system_design",
    category: "WORKER QUEUES",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Alert the engineering team when a background job fails 3 or more times (attempts >= 3).",
    content:
      'In background queues, if a job fails **3 or more times** (`attempts >= 3`), we stop retrying and return **`"ALERT_TEAM"`**. Otherwise we return **`"RETRY"`**:\n\n```python\ndef check_job_status(attempts):\n    if attempts >= 3:\n        return "ALERT_TEAM"\n    return "RETRY"\n```',
    assignment:
      'Complete the `if attempts >= 3:` block so it returns `"ALERT_TEAM"`.',
    constraints: [
      'Return `"ALERT_TEAM"` when `attempts >= 3`',
      'Return `"RETRY"` when `attempts < 3`',
    ],
    examples: [
      {
        input: "check_job_status(1) and check_job_status(3)",
        output: "RETRY ALERT_TEAM",
        explanation: "1 attempt retries; 3 attempts alerts the team.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def check_job_status(attempts):
    if attempts >= 3:
        # 👉 Write 1 line: return "ALERT_TEAM"
        pass
    return "RETRY"

print(check_job_status(1), check_job_status(3))`,
    expected_output: "RETRY ALERT_TEAM",
    hidden_tests: `import json
results = []
try:
    r1 = check_job_status(1)
    results.append({"id": 1, "input": "attempts = 1", "expected": "RETRY", "actual": str(r1), "passed": r1 == "RETRY"})
    r2 = check_job_status(3)
    results.append({"id": 2, "input": "attempts = 3", "expected": "ALERT_TEAM", "actual": str(r2), "passed": r2 == "ALERT_TEAM"})
    r3 = check_job_status(5)
    results.append({"id": 3, "input": "attempts = 5", "expected": "ALERT_TEAM", "actual": str(r3), "passed": r3 == "ALERT_TEAM"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "Attempt 1", value: "-> RETRY", address: "1 < 3" },
      { label: "Attempt 2", value: "-> RETRY", address: "2 < 3" },
      { label: "Attempt 3", value: "-> ALERT_TEAM 🚨", address: "3 >= 3" },
    ],
    hints: [
      'Replace `pass` inside the `if attempts >= 3:` block with `return "ALERT_TEAM"`.',
    ],
  },
  {
    id: "exp-sys-11",
    title: "Server Failover: Automatic Backup Switch",
    track: "system_design",
    category: "HIGH AVAILABILITY",
    difficulty: "Easy",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      'Route traffic to "primary" when online, and automatically switch to "backup" when offline.',
    content:
      'How do apps like Netflix stay online even if a server loses power? **Automatic Failover**!\n\n• If `primary_online` is `True`, return **`"primary"`**.\n• Otherwise, return **`"backup"`**!',
    assignment:
      'Complete `choose_server(primary_online)` so it returns `"primary"` when `primary_online` is True, and `"backup"` when False.',
    constraints: [
      'Return `"primary"` when `primary_online` is `True`',
      'Return `"backup"` when `primary_online` is `False`',
    ],
    examples: [
      {
        input: "choose_server(True) and choose_server(False)",
        output: "primary backup",
        explanation:
          "Uses primary when healthy; switches to backup when offline.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def choose_server(primary_online):
    if primary_online:
        return "primary"
    # 👉 Write 1 line: return "backup"
    return ""

print(choose_server(True), choose_server(False))`,
    expected_output: "primary backup",
    hidden_tests: `import json
results = []
try:
    r1 = choose_server(True)
    results.append({"id": 1, "input": "primary_online = True", "expected": "primary", "actual": str(r1), "passed": r1 == "primary"})
    r2 = choose_server(False)
    results.append({"id": 2, "input": "primary_online = False", "expected": "backup", "actual": str(r2), "passed": r2 == "backup"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      {
        label: "primary_online=True",
        value: "-> primary ✓",
        address: "healthy",
      },
      {
        label: "primary_online=False",
        value: "-> backup (FAILOVER) ⚡",
        address: "standby",
      },
    ],
    hints: [
      'Replace `return ""` at the bottom of `choose_server` with `return "backup"`.',
    ],
  },
  {
    id: "exp-sys-12",
    title: "CDN Router: Closest Video Server",
    track: "system_design",
    category: "GLOBAL CDN",
    difficulty: "Easy",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      'Look up the closest regional server in a CDN dictionary, or fall back to "global-edge".',
    content:
      'A **CDN (Content Delivery Network)** stores videos on servers around the world (`{"eu": "eu-west", "asia": "tokyo-edge"}`).\n\nUsing **`cdn_map.get(region, "global-edge")`** returns the matching regional server, or safely falls back to `"global-edge"` if the region isn\'t in the dictionary!',
    assignment:
      'Complete `pick_cdn_server(cdn_map, region)` using `cdn_map.get(region, "global-edge")`.',
    constraints: [
      'Return `cdn_map.get(region, "global-edge")`',
      "Keep the `print(...)` line at the bottom",
    ],
    examples: [
      {
        input: 'region="eu" -> "eu-west"; region="sa" -> "global-edge"',
        output: "eu-west global-edge",
        explanation:
          '"eu" is found in cdn_map; "sa" uses the fallback "global-edge".',
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def pick_cdn_server(cdn_map, region):
    # 👉 Write 1 line: return cdn_map.get(region, "global-edge")
    return ""

servers = {"eu": "eu-west", "asia": "tokyo-edge"}
print(pick_cdn_server(servers, "eu"), pick_cdn_server(servers, "sa"))`,
    expected_output: "eu-west global-edge",
    hidden_tests: `import json
results = []
try:
    s = {"eu": "eu-west", "asia": "tokyo-edge"}
    r1 = pick_cdn_server(s, "eu")
    results.append({"id": 1, "input": "region = 'eu'", "expected": "eu-west", "actual": str(r1), "passed": r1 == "eu-west"})
    r2 = pick_cdn_server(s, "sa")
    results.append({"id": 2, "input": "region = 'sa' (fallback)", "expected": "global-edge", "actual": str(r2), "passed": r2 == "global-edge"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      {
        label: 'region = "eu"',
        value: '-> "eu-west" ✓',
        address: "direct hit",
      },
      {
        label: 'region = "asia"',
        value: '-> "tokyo-edge" ✓',
        address: "direct hit",
      },
      {
        label: 'region = "sa"',
        value: '-> "global-edge" (FALLBACK)',
        address: "default",
      },
    ],
    hints: [
      'Replace `return ""` with `return cdn_map.get(region, "global-edge")`.',
    ],
  },
  {
    id: "exp-sys-13",
    title: "Health Check: RAM Usage Alarm",
    track: "system_design",
    category: "OBSERVABILITY",
    difficulty: "Easy",
    tree_row: 11,
    lesson_order: 13,
    is_free: false,
    description:
      'Trigger a "WARN" alert when server memory usage reaches 90% or higher.',
    content:
      'Cloud monitoring tools check server RAM usage every few seconds:\n\n• If `usage >= 90`, return **`"WARN"`** so engineers can scale up.\n• Otherwise, return **`"OK"`**!\n\n```python\ndef check_ram_alarm(usage):\n    if usage >= 90:\n        return "WARN"\n    return "OK"\n```',
    assignment:
      'Complete the `if usage >= 90:` block so `check_ram_alarm(usage)` returns `"WARN"` when usage is 90 or above.',
    constraints: [
      'Return `"WARN"` when `usage >= 90`',
      'Return `"OK"` when `usage < 90`',
    ],
    examples: [
      {
        input: "check_ram_alarm(65) and check_ram_alarm(92)",
        output: "OK WARN",
        explanation: "65% is OK; 92% triggers WARN.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def check_ram_alarm(usage):
    if usage >= 90:
        # 👉 Write 1 line: return "WARN"
        pass
    return "OK"

print(check_ram_alarm(65), check_ram_alarm(92))`,
    expected_output: "OK WARN",
    hidden_tests: `import json
results = []
try:
    r1 = check_ram_alarm(65)
    results.append({"id": 1, "input": "usage = 65%", "expected": "OK", "actual": str(r1), "passed": r1 == "OK"})
    r2 = check_ram_alarm(90)
    results.append({"id": 2, "input": "usage = 90%", "expected": "WARN", "actual": str(r2), "passed": r2 == "WARN"})
    r3 = check_ram_alarm(96)
    results.append({"id": 3, "input": "usage = 96%", "expected": "WARN", "actual": str(r3), "passed": r3 == "WARN"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "RAM: 65%", value: "-> OK ✓", address: "< 90%" },
      { label: "RAM: 90%", value: "-> WARN ⚠️", address: ">= 90%" },
      { label: "RAM: 96%", value: "-> WARN ⚠️", address: ">= 90%" },
    ],
    hints: [
      'Replace `pass` inside `if usage >= 90:` with `return "WARN"`.',
    ],
  },
  {
    id: "exp-sys-14",
    title: "Feature Flags: Remote Toggle Switch",
    track: "system_design",
    category: "RELEASE ENGINEERING",
    difficulty: "Easy",
    tree_row: 11,
    lesson_order: 14,
    is_free: false,
    description:
      "Check if a feature flag is enabled in a dictionary, safely defaulting to False when missing.",
    content:
      "Modern apps use **Feature Flags** (`{\"dark_mode\": True}`) to turn features ON or OFF remotely without redeploying code.\n\nUse **`flags.get(feature, False)`** so any unknown feature safely defaults to `False` (OFF)!\n\n```python\ndef is_feature_enabled(flags, feature):\n    return flags.get(feature, False)\n```",
    assignment:
      "Complete `is_feature_enabled(flags, feature)` so it returns `flags.get(feature, False)`.",
    constraints: [
      "Use `flags.get(feature, False)`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: 'is_feature_enabled({"dark_mode": True}, "dark_mode") and is_feature_enabled({}, "beta")',
        output: "True False",
        explanation:
          '"dark_mode" is True; missing flag "beta" safely defaults to False.',
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def is_feature_enabled(flags, feature):
    # 👉 Write 1 line: return flags.get(feature, False)
    return False

print(is_feature_enabled({"dark_mode": True}, "dark_mode"), is_feature_enabled({}, "beta"))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = is_feature_enabled({"dark_mode": True}, "dark_mode")
    results.append({"id": 1, "input": "flag 'dark_mode' = True", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_feature_enabled({}, "beta")
    results.append({"id": 2, "input": "missing flag 'beta'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"dark_mode"', value: "-> True (ENABLED)", address: "in flags" },
      {
        label: '"beta" (missing)',
        value: "-> False (SAFE DEFAULT)",
        address: "fallback",
      },
    ],
    hints: [
      "Inside `is_feature_enabled`, write `return flags.get(feature, False)`.",
    ],
  },
  {
    id: "exp-sys-15",
    title: "Payload Guard: Max Upload Size Check",
    track: "system_design",
    category: "API GATEWAY",
    difficulty: "Easy",
    tree_row: 12,
    lesson_order: 15,
    is_free: false,
    description:
      "Protect your server by checking that an uploaded file's size_mb is less than or equal to max_mb.",
    content:
      "To stop giant file uploads from crashing a server, an **API Gateway** checks that `size_mb <= max_mb` before accepting the upload:\n\n```python\ndef can_upload_file(size_mb, max_mb):\n    return size_mb <= max_mb\n```",
    assignment:
      "Complete `can_upload_file(size_mb, max_mb)` so it returns `True` when `size_mb <= max_mb`, and `False` otherwise.",
    constraints: [
      "Use `size_mb <= max_mb`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: "can_upload_file(10, 25) and can_upload_file(40, 25)",
        output: "True False",
        explanation: "10 MB is under the 25 MB limit (True); 40 MB is rejected (False).",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def can_upload_file(size_mb, max_mb):
    # 👉 Write 1 line: return size_mb <= max_mb
    return False

print(can_upload_file(10, 25), can_upload_file(40, 25))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = can_upload_file(10, 25)
    results.append({"id": 1, "input": "10 MB (limit 25 MB)", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = can_upload_file(25, 25)
    results.append({"id": 2, "input": "25 MB (exact limit 25 MB)", "expected": "True", "actual": str(r2), "passed": r2 is True})
    r3 = can_upload_file(40, 25)
    results.append({"id": 3, "input": "40 MB (over limit)", "expected": "False", "actual": str(r3), "passed": r3 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "10 MB <= 25 MB", value: "ALLOWED ✓", address: "True" },
      { label: "25 MB <= 25 MB", value: "ALLOWED ✓", address: "True" },
      { label: "40 MB <= 25 MB", value: "REJECTED ✕", address: "False" },
    ],
    hints: ["Replace `return False` with `return size_mb <= max_mb`."],
  },
  {
    id: "exp-sys-16",
    title: "Autoscaler: Busy Queue Detector",
    track: "system_design",
    category: "AUTO SCALING",
    difficulty: "Easy",
    tree_row: 13,
    lesson_order: 16,
    is_free: false,
    description:
      "Check if more than 5 jobs are waiting in a queue using len(queue) > 5 to trigger an extra worker.",
    content:
      "How does an **Autoscaler** know when to launch an extra server? It checks how many tasks are waiting in the queue using **`len(queue) > 5`**:\n\n```python\ndef needs_extra_worker(queue):\n    return len(queue) > 5\n```",
    assignment:
      "Complete `needs_extra_worker(queue)` so it returns `True` when `len(queue) > 5`, or `False` otherwise.",
    constraints: [
      "Use `len(queue) > 5`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: "2 jobs in queue -> False; 6 jobs in queue -> True",
        output: "False True",
        explanation:
          "2 jobs does not need an extra worker; 6 jobs (> 5) triggers scaling.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def needs_extra_worker(queue):
    # 👉 Write 1 line: return len(queue) > 5
    return False

print(needs_extra_worker(["j1", "j2"]), needs_extra_worker(["j1", "j2", "j3", "j4", "j5", "j6"]))`,
    expected_output: "False True",
    hidden_tests: `import json
results = []
try:
    r1 = needs_extra_worker(["j1", "j2"])
    results.append({"id": 1, "input": "2 jobs in queue", "expected": "False", "actual": str(r1), "passed": r1 is False})
    r2 = needs_extra_worker(["j1", "j2", "j3", "j4", "j5", "j6"])
    results.append({"id": 2, "input": "6 jobs in queue (> 5)", "expected": "True", "actual": str(r2), "passed": r2 is True})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "len(queue) == 2", value: "2 > 5 -> False (Normal)", address: "1 worker" },
      { label: "len(queue) == 6", value: "6 > 5 -> True (SCALE UP ⚡)", address: "+1 worker" },
    ],
    hints: ["Replace `return False` with `return len(queue) > 5`."],
  },
];
