export const CHAPTER_RECAP_LESSONS = [
  // =========================================================================
  // TRACK 1: PYTHON BASICS — 6 CUMULATIVE CHAPTER RECAP CAPSTONES (FREE)
  // =========================================================================
  {
    id: "py-recap-ch1",
    title: "Chapter I Recap: Guild Party XP & Rank Auditor",
    track: "python_basics",
    category: "🏆 CHAPTER I RECAP",
    difficulty: "Medium",
    tree_row: 1001,
    lesson_order: 101,
    is_free: true,
    is_recap: true,
    recap_chapter: 1,
    recap_topics: ["Variables & Types","Functions & Return","if / elif / else","Lists & Loops"],
    description:
      "Conclusive Chapter I capstone: loop through party member scores, sum total XP, count Gold-tier members with conditionals, and return a structured summary.",
    content:
      "Welcome to the **Chapter I Boss Challenge**!\n\nCombine everything from Modules 01–04 (`Variables`, `Functions & Return`, `Conditionals`, and `Lists & Loops`) into one clean function:\n1. Start two counters (`total_xp = 0` and `gold_count = 0`) before looping.\n2. Loop over every score in `scores`, adding it to `total_xp` and checking `if score >= 100:`.\n3. After the loop, pick `\"Elite\"` vs `\"Squad\"` with an `if / else` check and return your 3-value tuple!\n\n```python\n# Sibling pattern: summarize daily quest gems\ndef summarize_gems(drops):\n    total = 0\n    rare = 0\n    for gem in drops:\n        total += gem\n        if gem >= 50:\n            rare += 1\n    tier = \"Master\" if rare >= 3 else \"Starter\"\n    return (total, rare, tier)\n```",
    assignment:
      'Complete `audit_guild_party(scores)` where `scores` is a list of member XP numbers. Sum all scores into `total_xp`, count how many scores are `>= 100` (`gold_count`), set `squad_rank` to `"Elite"` if `gold_count >= 2` (or `"Squad"` otherwise), and return `(total_xp, gold_count, squad_rank)`.',
    constraints: [
      "Loop through each number `score` in `scores` and add it to `total_xp`",
      "Increment `gold_count += 1` whenever `score >= 100`",
      'Set `squad_rank = "Elite"` if `gold_count >= 2` else `"Squad"`, then return `(total_xp, gold_count, squad_rank)`',
    ],
    examples: [
      {
        input: "scores = [110, 55, 115]",
        output: "(280, 2, 'Elite')",
        explanation:
          "110 + 55 + 115 = 280 total XP; 2 members scored >= 100 (110 and 115), so squad_rank is 'Elite'.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def audit_guild_party(scores):
    pass`,
    expected_output: "(280, 2, 'Elite')",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = audit_guild_party([110, 55, 115])
    results.append({"id": 1, "input": "[110, 55, 115]", "expected": "(280, 2, 'Elite')", "actual": str(r1), "passed": r1 == (280, 2, "Elite")})
    r2 = audit_guild_party([100, 35])
    results.append({"id": 2, "input": "[100, 35]", "expected": "(135, 1, 'Squad')", "actual": str(r2), "passed": r2 == (135, 1, "Squad")})
    r3 = audit_guild_party([])
    results.append({"id": 3, "input": "[]", "expected": "(0, 0, 'Squad')", "actual": str(r3), "passed": r3 == (0, 0, "Squad")})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "scores", value: "[110, 55, 115] -> total 280", type: "list", address: "0xC1" },
      { label: "gold_count", value: "2 (>= 100)", type: "int", address: "0xC2" },
      { label: "return", value: "(280, 2, 'Elite')", type: "tuple", address: "0xC3" },
    ],
    hints: [
      "Start with `total_xp = 0` and `gold_count = 0` before your `for score in scores:` loop.",
      "Inside the loop, add `total_xp += score` and check `if score >= 100: gold_count += 1`.",
      'After the loop, set `squad_rank = "Elite"` if `gold_count >= 2` else `"Squad"` and return `(total_xp, gold_count, squad_rank)`.',
    ],
  },
  {
    id: "py-recap-ch2",
    title: "Chapter II Recap: Crash-Proof Tournament Roster",
    track: "python_basics",
    category: "🏆 CHAPTER II RECAP",
    difficulty: "Medium",
    tree_row: 1002,
    lesson_order: 102,
    is_free: true,
    is_recap: true,
    recap_chapter: 2,
    recap_topics: [
      "Dictionaries",
      ".strip().lower()",
      "List Filtering",
      "try / except",
    ],
    description:
      "Conclusive Chapter II capstone: sanitize messy player handles, safely parse corrupted score strings with try/except, filter qualifiers, and build a registry dictionary.",
    content:
      "Welcome to the **Chapter II Boss Challenge**!\n\nReal tournament signups arrive dirty: extra spaces, mixed casing, and occasional `'N/A'` corrupted score strings. Combine **all skills from Chapters I & II**:\n• Normalize handle text with `.strip().lower()`.\n• Convert `raw_score` with `int(raw_score)` inside `try / except ValueError:` so invalid numbers are skipped safely.\n• Filter to keep only players with `score >= min_score`.\n• Store qualified `{clean_handle: score}` entries in a dictionary and return it.",
    assignment:
      "Complete `build_qualified_roster(entries, min_score)` where `entries` is a list of `(raw_handle, raw_score)` pairs. Return a dictionary mapping each cleaned handle to its integer score if `score >= min_score`.",
    constraints: [
      "Clean every handle using `.strip().lower()`",
      "Wrap `int(raw_score)` in `try / except (ValueError, TypeError):` to skip bad scores without crashing",
      "Include only players whose parsed integer score is `>= min_score`",
    ],
    examples: [
      {
        input: 'entries = [("  Aria ", "120"), ("bob", "ERR"), (" KAI", "75")], min_score = 80',
        output: "{'aria': 120}",
        explanation: "'bob' fails int() safely and is skipped; 'kai' (75) is below 80.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def build_qualified_roster(entries, min_score):
    pass`,
    expected_output: "{'aria': 120}",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = build_qualified_roster([("  Aria ", "120"), ("bob", "ERR"), (" KAI", "75")], 80)
    results.append({"id": 1, "input": "mixed dirty + bad score", "expected": "{'aria': 120}", "actual": str(r1), "passed": r1 == {"aria": 120}})
    r2 = build_qualified_roster([("  NEO ", "100"), ("sam", None), ("Zed", "99")], 100)
    results.append({"id": 2, "input": "None + exact boundary", "expected": "{'neo': 100}", "actual": str(r2), "passed": r2 == {"neo": 100}})
    r3 = build_qualified_roster([], 50)
    results.append({"id": 3, "input": "empty roster", "expected": "{}", "actual": str(r3), "passed": r3 == {}})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: '"  Aria ".strip().lower()', value: '"aria"', type: "str", address: "0xD1" },
      { label: 'int("ERR")', value: "ValueError -> skipped", type: "except", address: "0xD2" },
      { label: "roster", value: "{'aria': 120}", type: "dict", address: "0xD3" },
    ],
    hints: [
      "Initialize `roster = {}` and loop `for handle, raw_score in entries:`.",
      "Inside `try:`, compute `score = int(raw_score)`; in `except (ValueError, TypeError): continue`.",
      "If `score >= min_score`, set `roster[handle.strip().lower()] = score`.",
    ],
  },
  {
    id: "py-recap-ch3",
    title: "Chapter III Recap: Top-3 Trending Slug Digest",
    track: "python_basics",
    category: "🏆 CHAPTER III RECAP",
    difficulty: "Medium",
    tree_row: 1003,
    lesson_order: 103,
    is_free: true,
    is_recap: true,
    recap_chapter: 3,
    recap_topics: [
      "Frequency Counting",
      "Deduplication",
      "Slicing [:3]",
      '".join()" Slugs',
    ],
    description:
      "Conclusive Chapter III capstone: normalize raw tags, deduplicate and sort them A–Z with sorted(set(...)), slice the first 3 with [:3], and join into a digest.",
    content:
      "Welcome to the **Chapter III Boss Challenge**!\n\nCombine **String Cleaning (`.strip().lower()`), Set Deduplication (`sorted(set(...))`), Slicing (`[:3]`), and Joining (`.join()`)**:\n1. Clean each raw string and ignore empty entries (`\"\"`).\n2. Deduplicate and sort A–Z with `sorted(set(...))`.\n3. Slice the top items and join them with your separator!\n\n```python\n# Sibling pattern: format top 2 unique cleaned badges\ndef top_two_badges(raw_badges):\n    valid = []\n    for item in raw_badges:\n        clean = item.strip().lower()\n        if clean != \"\":\n            valid.append(clean)\n    top_two = sorted(set(valid))[:2]\n    return \", \".join(top_two)\n```",
    assignment:
      'Complete `build_trending_digest(tags)`: normalize non-empty tags with `.strip().lower()`, deduplicate and sort A–Z with `sorted(set(...))`, slice the first 3 (`[:3]`), and return `" | ".join(top_three)`.',
    constraints: [
      "Normalize each tag with `.strip().lower()` and skip empty strings",
      "Deduplicate and sort alphabetically with `sorted(set(cleaned))`",
      'Take the first 3 tags with `[:3]` and return `" | ".join(...)`',
    ],
    examples: [
      {
        input: 'tags = [" Python", "ai", "python", "loops", "AI", "lists"]',
        output: "ai | lists | loops",
        explanation:
          "Unique cleaned tags sorted A-Z are ['ai', 'lists', 'loops', 'python']; the first 3 joined with ' | ' give 'ai | lists | loops'.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def build_trending_digest(tags):
    pass`,
    expected_output: "ai | lists | loops",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = build_trending_digest([" Python", "ai", "python", "loops", "AI", "lists"])
    results.append({"id": 1, "input": "dedup + A-Z top 3", "expected": "ai | lists | loops", "actual": str(r1), "passed": r1 == "ai | lists | loops"})
    r2 = build_trending_digest(["api", "API", "   ", "db"])
    results.append({"id": 2, "input": "fewer than 3 unique + blanks", "expected": "api | db", "actual": str(r2), "passed": r2 == "api | db"})
    r3 = build_trending_digest(["   ", ""])
    results.append({"id": 3, "input": "only blank tags", "expected": "", "actual": str(r3), "passed": r3 == ""})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "sorted(set(...))", value: "['ai', 'lists', 'loops', 'python']", type: "list", address: "0xE1" },
      { label: "top[:3]", value: "['ai', 'lists', 'loops']", type: "list", address: "0xE2" },
      { label: '" | ".join()', value: '"ai | lists | loops"', type: "str", address: "0xE3" },
    ],
    hints: [
      "Collect cleaned non-empty tags in `cleaned = []` using `t = tag.strip().lower()`.",
      "Get unique sorted tags with `unique_tags = sorted(set(cleaned))`.",
      'Return `" | ".join(unique_tags[:3])`.',
    ],
  },
  {
    id: "py-recap-ch4",
    title: "Chapter IV Recap: Stream Moderation & Tip Auditor",
    track: "python_basics",
    category: "🏆 CHAPTER IV RECAP",
    difficulty: "Medium",
    tree_row: 1004,
    lesson_order: 104,
    is_free: true,
    is_recap: true,
    recap_chapter: 4,
    recap_topics: [
      ".replace()",
      "sum()",
      ".startswith()",
      ".get(key, default)",
    ],
    description:
      "Conclusive Chapter IV capstone: filter safe HTTPS tip events, mask blocked words with .replace(), look up tier multipliers via .get(), and sum total payouts.",
    content:
      "Welcome to the **Chapter IV Boss Challenge**!\n\nEvery event dict has `{\"url\": ..., \"text\": ..., \"tier\": ...}`:\n1. Only count events whose `\"url\"` starts with `\"https://\"` (`.startswith()`).\n2. Clean `\"text\"` by replacing `\"spoiler\"` with `\"[REDACTED]\"` (`.replace()`).\n3. Look up payout amount in `tier_rates.get(tier, 5)` using `.get()` safe default.\n4. Use `sum()` over all approved payouts and return `(total_payout, cleaned_messages)`.",
    assignment:
      'Complete `process_stream_events(events, tier_rates)` to keep only events starting with `"https://"`, redact `"spoiler"` -> `"[REDACTED]"`, look up payouts via `tier_rates.get(tier, 5)`, and return `(sum_of_payouts, cleaned_texts)`.',
    constraints: [
      'Reject any event whose `"url"` does not `.startswith("https://")`',
      'Replace `"spoiler"` with `"[REDACTED]"` in each approved message text',
      "Look up each approved event's payout via `tier_rates.get(event.get(\"tier\"), 5)` and compute total with `sum()`",
    ],
    examples: [
      {
        input: 'events=[{"url":"https://ok","text":"no spoiler","tier":"vip"},{"url":"http://bad","text":"hi","tier":"vip"}], rates={"vip":20}',
        output: "(20, ['no [REDACTED]'])",
        explanation: "http:// event is dropped; https:// event is redacted and pays 20.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def process_stream_events(events, tier_rates):
    pass`,
    expected_output: "(20, ['no [REDACTED]'])",
    hidden_tests: `import json
def __run_tests__():
    results = []
    ev1 = [
        {"url": "https://ok", "text": "no spoiler", "tier": "vip"},
        {"url": "http://bad", "text": "ignore me", "tier": "vip"},
    ]
    r1 = process_stream_events(ev1, {"vip": 20})
    results.append({"id": 1, "input": "https + spoiler + http reject", "expected": "(20, ['no [REDACTED]'])", "actual": str(r1), "passed": r1 == (20, ["no [REDACTED]"])})
    ev2 = [
        {"url": "https://a.dev", "text": "spoiler alert!", "tier": "vip"},
        {"url": "https://b.dev", "text": "gg!", "tier": "guest"},
    ]
    r2 = process_stream_events(ev2, {"vip": 25})
    results.append({"id": 2, "input": "fallback .get(guest, 5)", "expected": "(30, ['[REDACTED] alert!', 'gg!'])", "actual": str(r2), "passed": r2 == (30, ["[REDACTED] alert!", "gg!"])})
    r3 = process_stream_events([], {"vip": 25})
    results.append({"id": 3, "input": "empty stream events", "expected": "(0, [])", "actual": str(r3), "passed": r3 == (0, [])})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: '.startswith("https://")', value: "True / False gate", type: "bool", address: "0xF1" },
      { label: '.replace("spoiler", ...)', value: '"no [REDACTED]"', type: "str", address: "0xF2" },
      { label: "sum(payouts)", value: "30 (25 + default 5)", type: "int", address: "0xF3" },
    ],
    hints: [
      "Collect approved payouts in `payouts = []` and cleaned texts in `texts = []`.",
      'Check `if event.get("url", "").startswith("https://"):`.',
      'Use `sum(payouts)` when returning `(sum(payouts), texts)`.',
    ],
  },
  {
    id: "py-recap-ch5",
    title: "Chapter V Recap: Review Analyzer & Star Card",
    track: "python_basics",
    category: "🏆 CHAPTER V RECAP",
    difficulty: "Medium",
    tree_row: 1005,
    lesson_order: 105,
    is_free: true,
    is_recap: true,
    recap_chapter: 5,
    recap_topics: [
      "F-Strings",
      ".split() Words",
      "`in` Membership",
      "round(val, 1)",
    ],
    description:
      "Conclusive Chapter V capstone: tokenize a review with .split(), count flagged words with `in`, average and round ratings to 1 decimal place, and format a badge with f-strings.",
    content:
      "Welcome to the **Chapter V Boss Challenge**!\n\nTie together all **Chapter V Everyday Essentials** (`.split()`, `in`, `round()`, and `f\"...\"`) with earlier loop & list math:\n• Split `comment.lower()` into words via `.split()` and check if any word is `in banned_words`.\n• Compute the average of `scores` (`sum(scores) / len(scores)`) rounded to 1 decimal with `round(avg, 1)`.\n• Return `f\"FLAGGED | avg {avg}/5 ({word_count} words)\"` if any banned word matched, else `f\"APPROVED | avg {avg}/5 ({word_count} words)\"`.",
    assignment:
      "Complete `format_review_badge(comment, scores, banned_words)` combining `.split()`, `in`, `round(..., 1)`, and an f-string summary card.",
    constraints: [
      "Split `comment.lower().split()` into lowercase word tokens and record `word_count = len(words)`",
      "Check membership with `w in banned_words` to set `status = 'FLAGGED'` or `'APPROVED'`",
      "Compute `avg = round(sum(scores) / len(scores), 1)` (use `0.0` if `scores` is empty)",
      'Return `f"{status} | avg {avg}/5 ({word_count} words)"`',
    ],
    examples: [
      {
        input: 'comment = "Fast app great UI", scores = [5, 4, 5], banned_words = ["spam"]',
        output: "APPROVED | avg 4.7/5 (4 words)",
        explanation: "4 words, none in banned_words, round(14/3, 1) == 4.7.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def format_review_badge(comment, scores, banned_words):
    pass`,
    expected_output: "APPROVED | avg 4.7/5 (4 words)",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = format_review_badge("Fast app great UI", [5, 4, 5], ["spam"])
    results.append({"id": 1, "input": "clean review", "expected": "APPROVED | avg 4.7/5 (4 words)", "actual": str(r1), "passed": r1 == "APPROVED | avg 4.7/5 (4 words)"})
    r2 = format_review_badge("Total SPAM link", [1, 2], ["spam", "scam"])
    results.append({"id": 2, "input": "case-insensitive flagged word", "expected": "FLAGGED | avg 1.5/5 (3 words)", "actual": str(r2), "passed": r2 == "FLAGGED | avg 1.5/5 (3 words)"})
    r3 = format_review_badge("Nice", [5], ["spam"])
    results.append({"id": 3, "input": "single word clean review", "expected": "APPROVED | avg 5.0/5 (1 words)", "actual": str(r3), "passed": r3 == "APPROVED | avg 5.0/5 (1 words)"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "words", value: "['fast', 'app', 'great', 'ui']", type: "list", address: "0xA1" },
      { label: "round(14/3, 1)", value: "4.7", type: "float", address: "0xA2" },
      { label: "badge", value: '"APPROVED | avg 4.7/5 (4 words)"', type: "str", address: "0xA3" },
    ],
    hints: [
      "Compute `words = comment.lower().split()` and `is_flagged = any(w in banned_words for w in words)`.",
      "Compute `avg = round(sum(scores) / len(scores), 1) if scores else 0.0`.",
      'Format with `f"{status} | avg {avg}/5 ({len(words)} words)"`.',
    ],
  },
  {
    id: "py-recap-ch6",
    title: "Final Python Capstone: Devy Boss Server",
    track: "python_basics",
    category: "🏆 TRACK CAPSTONE",
    difficulty: "Hard",
    tree_row: 1006,
    lesson_order: 106,
    is_free: true,
    is_recap: true,
    recap_chapter: 6,
    recap_topics: [
      "RPG Crit Math",
      "Security Validation",
      "Tip Rounding",
      "Mood Bot Lookup",
    ],
    description:
      "The Python Basics graduation capstone uniting Chapter VI mini-app skills—crit math, password length check, and mood bot lookup—inside one clean 3-command router.",
    content:
      'Welcome to the **Python Foundations Grand Finale**!\n\nBuild `run_arcade_command(command, mood_map)` where every valid `command` is a 2-word string `"<ACTION> <VALUE>"`:\n1. Split with `parts = command.strip().split()`. If `len(parts) != 2`, return `"ERR"`.\n2. Read `cmd = parts[0].upper()` and `val = parts[1]`.\n3. If `cmd == "CRIT"`: return `int(val) * 2`.\n4. Elif `cmd == "PASS"`: return `"STRONG"` if `len(val) >= 8` else `"WEAK"`.\n5. Elif `cmd == "BOT"`: return `f"Bot: {mood_map.get(val.lower(), \'🤖 Ready!\')}"`.\n6. Else: return `"ERR"`.',
    assignment:
      "Implement `run_arcade_command(command, mood_map)` to split the 2-word command with `.strip().split()` and dispatch `'CRIT'`, `'PASS'`, and `'BOT'` (or return `'ERR'` for unknown commands).",
    constraints: [
      "Split `parts = command.strip().split()` and return `'ERR'` if `len(parts) != 2`",
      "For `'CRIT'`, return `int(parts[1]) * 2`; for `'PASS'`, return `'STRONG'` if `len(parts[1]) >= 8` else `'WEAK'`",
      "For `'BOT'`, return `f\"Bot: {mood_map.get(parts[1].lower(), '🤖 Ready!')}\"`; otherwise return `'ERR'`",
    ],
    examples: [
      {
        input: 'command = "CRIT 35", mood_map = {"happy": "🎉 Yay!"}',
        output: "70",
        explanation: "CRIT doubles the integer 35 -> 70.",
      },
      {
        input: 'command = "BOT HAPPY", mood_map = {"happy": "🎉 Yay!"}',
        output: "Bot: 🎉 Yay!",
        explanation: "Normalizes HAPPY -> happy and formats f-string Bot reply.",
      },
    ],
    complexities: { time: "O(k)", space: "O(k)" },
    initial_code: `def run_arcade_command(command, mood_map):
    pass`,
    expected_output: "70",
    hidden_tests: `import json
def __run_tests__():
    results = []
    moods = {"happy": "🎉 Yay!", "focus": "🎧 Deep Work"}
    r1 = run_arcade_command("CRIT 35", moods)
    results.append({"id": 1, "input": "CRIT 35", "expected": "70", "actual": str(r1), "passed": r1 == 70})
    r2 = run_arcade_command("PASS devlearn9", moods)
    results.append({"id": 2, "input": "PASS devlearn9", "expected": "STRONG", "actual": str(r2), "passed": r2 == "STRONG"})
    r3 = run_arcade_command("PASS tiny", moods)
    results.append({"id": 3, "input": "PASS tiny", "expected": "WEAK", "actual": str(r3), "passed": r3 == "WEAK"})
    r4 = run_arcade_command("BOT HAPPY", moods)
    results.append({"id": 4, "input": "BOT HAPPY", "expected": "Bot: 🎉 Yay!", "actual": str(r4), "passed": r4 == "Bot: 🎉 Yay!"})
    r5 = run_arcade_command("UNKNOWN 1", moods)
    results.append({"id": 5, "input": "UNKNOWN command", "expected": "ERR", "actual": str(r5), "passed": r5 == "ERR"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "CRIT 35", value: "35 * 2 -> 70", type: "int", address: "0xB1" },
      { label: "PASS devlearn9", value: "len>=8 -> 'STRONG'", type: "str", address: "0xB2" },
      { label: "BOT HAPPY", value: '"Bot: 🎉 Yay!"', type: "str", address: "0xB4" },
    ],
    hints: [
      "Start with `parts = command.strip().split()`, returning `'ERR'` if `len(parts) != 2`.",
      "Read `cmd = parts[0].upper()` and `val = parts[1]`.",
      "Use `if cmd == 'CRIT':`, `elif cmd == 'PASS':`, `elif cmd == 'BOT':`, and `else: return 'ERR'`.",
    ],
  },
  {
    id: "py-recap-ch7",
    title: "Chapter VII Recap: Telemetry Pipeline & Wallet Engine",
    track: "python_basics",
    category: "🏆 CHAPTER VII RECAP",
    difficulty: "Medium",
    tree_row: 1007,
    lesson_order: 107,
    is_free: true,
    is_recap: true,
    recap_chapter: 7,
    recap_topics: [
      "Comprehensions",
      "OOP State",
      "Regex Parsing",
      "Decorators",
    ],
    description:
      "Conclusive Chapter VII capstone combining regex log extraction, comprehension filtering, and stateful credit tracking.",
    content:
      "Put **Chapter VII** modern Python skills together in `process_log_credits(log_lines, initial_credits, cost_per_error)`:\n1. Use `re.findall(r'ERR-\\d+', line)` on each log line to extract error codes.\n2. Filter `{code: count}` via comprehensions/dicts for all codes seen across lines.\n3. Deduct `total_errors * cost_per_error` from `initial_credits` (never below `0`).\nReturn `(error_counts_dict, remaining_credits)`.",
    assignment:
      "Implement `process_log_credits(log_lines, initial_credits, cost_per_error)` returning `(counts, remaining_credits)` where `counts` maps each matched `ERR-###` token to its count and `remaining_credits = max(0, initial_credits - total_errors * cost_per_error)`.",
    constraints: [
      "Extract all `ERR-\\d+` matches per line using `re.findall`",
      "Count frequency per error code into `counts`",
      "Clamp `remaining_credits` cleanly at `>= 0`",
    ],
    examples: [
      {
        input: 'log_lines = ["ERR-500 db ERR-404", "200 ok", "ERR-500 retry"], initial_credits = 100, cost_per_error = 15',
        output: "({'ERR-500': 2, 'ERR-404': 1}, 55)",
        explanation: "3 total errors * 15 = 45 cost -> 100 - 45 = 55 credits left.",
      },
    ],
    complexities: { time: "O(n)", space: "O(k)" },
    initial_code: `def process_log_credits(log_lines, initial_credits, cost_per_error):
    pass`,
    expected_output: "({'ERR-500': 2, 'ERR-404': 1}, 55)",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = process_log_credits(["ERR-500 db ERR-404", "200 ok", "ERR-500 retry"], 100, 15)
    results.append({"id": 1, "input": "3 errors @ 15", "expected": "({'ERR-500': 2, 'ERR-404': 1}, 55)", "actual": str(r1), "passed": r1 == ({"ERR-500": 2, "ERR-404": 1}, 55)})
    r2 = process_log_credits(["ERR-999 panic", "ERR-999 panic"], 10, 50)
    results.append({"id": 2, "input": "clamp credits at 0", "expected": "({'ERR-999': 2}, 0)", "actual": str(r2), "passed": r2 == ({"ERR-999": 2}, 0)})
    r3 = process_log_credits([], 40, 10)
    results.append({"id": 3, "input": "empty logs", "expected": "({}, 40)", "actual": str(r3), "passed": r3 == ({}, 40)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "hashmap",
    visual_data: [
      { label: "re.findall", value: "['ERR-500', 'ERR-404', 'ERR-500']", type: "list", address: "0xL1" },
      { label: "credits", value: "100 - 45 -> 55", type: "int", address: "0xL2" },
    ],
    hints: [
      "`import re` and loop through each line gathering `re.findall(r'ERR-\\d+', line)`.",
      "Clamp credits with `max(0, initial_credits - total_errors * cost_per_error)`.",
    ],
  },

  // =========================================================================
  // TRACK 2: ALGORITHMS — 6 CUMULATIVE CHAPTER RECAP CAPSTONES (PRO)
  // =========================================================================
  {
    id: "alg-recap-ch1",
    title: "Chapter I Algo Recap: Target Window Pair Finder",
    track: "algorithms",
    category: "🏆 CHAPTER I RECAP",
    difficulty: "Medium",
    tree_row: 1001,
    lesson_order: 101,
    is_free: false,
    is_recap: true,
    recap_chapter: 1,
    recap_topics: ["Hash Map", "Two Pointers", "Sliding Window", "Binary Search"],
    description:
      "Conclusive Chapter I Algo capstone: combine sliding window peak calculation with hash-map two-sum verification over recent telemetry.",
    content:
      "Combine **Hash Maps** and **Fixed Sliding Windows** in O(n) time:\nGiven an integer array `nums`, window size `k`, and `target`:\n1. Find the maximum sum of any contiguous subarray of length `k` (`max_window`).\n2. Check in O(n) with a `seen` set whether ANY two distinct elements in `nums` sum to `target` (`has_pair`).\n3. Return `(max_window, has_pair)`.",
    assignment:
      "Implement `analyze_signal_window(nums, k, target)` returning `(max_window, has_pair)` in O(n) time.",
    constraints: [
      "Compute the max contiguous window of size `k` using an O(n) sliding window",
      "Check pair existence in O(n) using a hash `set()` (`target - num in seen`)",
      "Return `(max_window, has_pair)`",
    ],
    examples: [
      {
        input: "nums = [2, 1, 5, 1, 3, 2], k = 3, target = 8",
        output: "(9, True)",
        explanation: "Max window [5, 1, 3] sums to 9; pair 5 + 3 == 8 exists.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def analyze_signal_window(nums, k, target):
    pass`,
    expected_output: "(9, True)",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = analyze_signal_window([2, 1, 5, 1, 3, 2], 3, 8)
    results.append({"id": 1, "input": "[2,1,5,1,3,2], k=3, target=8", "expected": "(9, True)", "actual": str(r1), "passed": r1 == (9, True)})
    r2 = analyze_signal_window([4, 2, 1], 2, 10)
    results.append({"id": 2, "input": "[4,2,1], k=2, target=10", "expected": "(6, False)", "actual": str(r2), "passed": r2 == (6, False)})
    r3 = analyze_signal_window([3, 3], 2, 6)
    results.append({"id": 3, "input": "duplicate element pair [3,3] target=6", "expected": "(6, True)", "actual": str(r3), "passed": r3 == (6, True)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "sliding_window",
    visual_data: [
      { label: "window [5,1,3]", value: "max_sum = 9", type: "window", address: "0x01" },
      { label: "seen set", value: "3 + 5 = 8 -> True", type: "set", address: "0x02" },
    ],
    hints: [
      "Compute `win = sum(nums[:k]); best = win` then slide from index `k` to `len(nums) - 1`.",
      "Track `seen = set()` while scanning `nums` and check `if (target - x) in seen: has_pair = True`.",
    ],
  },
  {
    id: "alg-recap-ch2",
    title: "Chapter II Algo Recap: Nested Scope Validator & Max Depth",
    track: "algorithms",
    category: "🏆 CHAPTER II RECAP",
    difficulty: "Medium",
    tree_row: 1002,
    lesson_order: 102,
    is_free: false,
    is_recap: true,
    recap_chapter: 2,
    recap_topics: ["LIFO Stack", "Bracket Matching", "Depth Tracking", "Linear Pass"],
    description:
      "Conclusive Chapter II Algo capstone: validate nested bracket scopes using a LIFO stack while computing the maximum nesting depth.",
    content:
      "Combine **LIFO Stack Matching** and **Nesting Depth Tracking**:\nWalk `expr` character by character, ignoring non-bracket characters:\n• Push opening brackets `(`, `[`, `{` onto a stack and track `max_depth`.\n• Match every closing bracket against the top of the stack.\n• Return `(True, max_depth)` if completely balanced, else `(False, -1)`.",
    assignment:
      "Complete `validate_and_measure_depth(expr)` returning `(is_valid, max_depth)` in O(n) time.",
    constraints: [
      "Handle `(`, `)`, `[`, `]`, `{`, `}` and safely ignore other characters",
      "Track the peak stack height as `max_depth` while scanning",
      "Return `(False, -1)` immediately on mismatch or leftover opening brackets",
    ],
    examples: [
      {
        input: 'expr = "({[x]})()"',
        output: "(True, 3)",
        explanation: "Max depth reached inside {[x]} is 3 and all scopes close cleanly.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def validate_and_measure_depth(expr):
    pass`,
    expected_output: "(True, 3)",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = validate_and_measure_depth("({[x]})()")
    results.append({"id": 1, "input": "({[x]})()", "expected": "(True, 3)", "actual": str(r1), "passed": r1 == (True, 3)})
    r2 = validate_and_measure_depth("([)]")
    results.append({"id": 2, "input": "([)]", "expected": "(False, -1)", "actual": str(r2), "passed": r2 == (False, -1)})
    r3 = validate_and_measure_depth("(((")
    results.append({"id": 3, "input": "unclosed", "expected": "(False, -1)", "actual": str(r3), "passed": r3 == (False, -1)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "stack",
    visual_data: [
      { label: "push '(' '{' '['", value: "depth = 3", type: "stack", address: "0xS1" },
      { label: "pop matches", value: "stack empty -> True", type: "stack", address: "0xS2" },
    ],
    hints: [
      "Keep `pairs = {')': '(', ']': '[', '}': '{'}` and `opens = {'(', '[', '{'}`.",
      "Update `max_depth = max(max_depth, len(stack))` after each push.",
    ],
  },
  {
    id: "alg-recap-ch3",
    title: "Chapter III Algo Recap: Range Query & Valid Candidate Engine",
    track: "algorithms",
    category: "🏆 CHAPTER III RECAP",
    difficulty: "Medium",
    tree_row: 1003,
    lesson_order: 103,
    is_free: false,
    is_recap: true,
    recap_chapter: 3,
    recap_topics: ["Filtered Min Scan", "Lower-Bound Search", "Set Intersection", "Prefix Sums"],
    description:
      "Conclusive Chapter III Algo capstone: intersect candidate IDs with an allowlist in O(n), count how many valid scores meet a threshold via binary search, and sum top slices with prefix sums.",
    content:
      "Unite **Chapter III** algorithms into a single query helper `summarize_candidates(sorted_scores, threshold, team_a, team_b)`:\n1. Use **Lower-Bound Binary Search (`O(log n)`)** to count how many elements in `sorted_scores` are `>= threshold`.\n2. Compute the **O(n + m) sorted set intersection** `shared = sorted(set(team_a) & set(team_b))`.\n3. Compute the **Prefix Sum** of all scores passing `>= threshold` using a precomputed prefix array.\nReturn `(passing_count, passing_sum, shared)`.",
    assignment:
      "Implement `summarize_candidates(sorted_scores, threshold, team_a, team_b)` returning `(passing_count, passing_sum, shared)`.",
    constraints: [
      "Find the first index where `sorted_scores[i] >= threshold` with Binary Search in O(log n)",
      "Compute `passing_sum` via prefix sum array `pref[n] - pref[idx]`",
      "Return sorted unique `shared` IDs present in both `team_a` and `team_b`",
    ],
    examples: [
      {
        input: "sorted_scores=[10, 25, 40, 55], threshold=25, team_a=[3, 1, 2], team_b=[2, 4, 3]",
        output: "(3, 120, [2, 3])",
        explanation: "Scores >= 25 are [25, 40, 55] (count 3, sum 120); shared=[2, 3].",
      },
    ],
    complexities: { time: "O(n + m)", space: "O(n)" },
    initial_code: `def summarize_candidates(sorted_scores, threshold, team_a, team_b):
    pass`,
    expected_output: "(3, 120, [2, 3])",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = summarize_candidates([10, 25, 40, 55], 25, [3, 1, 2], [2, 4, 3])
    results.append({"id": 1, "input": "standard query", "expected": "(3, 120, [2, 3])", "actual": str(r1), "passed": r1 == (3, 120, [2, 3])})
    r2 = summarize_candidates([5, 10], 50, [1], [2])
    results.append({"id": 2, "input": "none passing, empty overlap", "expected": "(0, 0, [])", "actual": str(r2), "passed": r2 == (0, 0, [])})
    r3 = summarize_candidates([10, 20, 30], 10, [5, 5], [5])
    results.append({"id": 3, "input": "all passing + deduplicated overlap", "expected": "(3, 60, [5])", "actual": str(r3), "passed": r3 == (3, 60, [5])})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "binary_search",
    visual_data: [
      { label: "lower_bound(25)", value: "index = 1", type: "search", address: "0xP1" },
      { label: "pref[4] - pref[1]", value: "120", type: "prefix", address: "0xP2" },
    ],
    hints: [
      "Binary search `lo, hi = 0, len(sorted_scores)` while `lo < hi`.",
      "Build `pref = [0]` accumulating each score so range sum is `pref[-1] - pref[lo]`.",
    ],
  },
  {
    id: "alg-recap-ch4",
    title: "Chapter IV Algo Recap: Partitioned Telemetry & Runner-Up",
    track: "algorithms",
    category: "🏆 CHAPTER IV RECAP",
    difficulty: "Medium",
    tree_row: 1004,
    lesson_order: 104,
    is_free: false,
    is_recap: true,
    recap_chapter: 4,
    recap_topics: ["Runner-Up Scan", "Multi-Key Sort", "Parity Partition", "O(1) Set Check"],
    description:
      "Conclusive Chapter IV Algo capstone: filter VIP events in O(1) via sets, partition scores cleanly, and find the distinct runner-up score in O(n).",
    content:
      "Combine **Chapter IV** techniques (`O(1)` set badge filtering, single-pass runner-up scan, and parity/group partitioning):\nGiven `records` = list of `(id, score)` and `vip_ids` list:\n1. Keep only records whose `id` is in `set(vip_ids)`.\n2. Sort kept records by `(-score, id)`.\n3. Return `(ordered_ids, runner_up_score)` where `runner_up_score` is the 2nd highest distinct score among kept VIPs (or `None` if fewer than 2 distinct scores).",
    assignment:
      "Complete `rank_vip_telemetry(records, vip_ids)` returning `(ordered_ids, runner_up_score)`.",
    constraints: [
      "Convert `vip_ids` to a `set()` for O(1) membership filtering",
      "Sort qualifying records by `(-score, id)`",
      "Find the 2nd highest distinct `score` (returning `None` if fewer than 2 distinct values exist)",
    ],
    examples: [
      {
        input: "records=[(2, 90), (1, 90), (3, 75), (4, 99)], vip_ids=[1, 2, 3]",
        output: "([1, 2, 3], 75)",
        explanation: "ID 4 is not VIP. Sorted VIPs: (1,90), (2,90), (3,75). Distinct scores: 90, 75 -> runner-up 75.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def rank_vip_telemetry(records, vip_ids):
    pass`,
    expected_output: "([1, 2, 3], 75)",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = rank_vip_telemetry([(2, 90), (1, 90), (3, 75), (4, 99)], [1, 2, 3])
    results.append({"id": 1, "input": "ties + non-vip filtered", "expected": "([1, 2, 3], 75)", "actual": str(r1), "passed": r1 == ([1, 2, 3], 75)})
    r2 = rank_vip_telemetry([(1, 50), (2, 50)], [1, 2])
    results.append({"id": 2, "input": "only 1 distinct score", "expected": "([1, 2], None)", "actual": str(r2), "passed": r2 == ([1, 2], None)})
    r3 = rank_vip_telemetry([(1, 80)], [99])
    results.append({"id": 3, "input": "zero matching VIPs", "expected": "([], None)", "actual": str(r3), "passed": r3 == ([], None)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "O(1) vip_set", value: "{1, 2, 3}", type: "set", address: "0xR1" },
      { label: "sorted", value: "[(1,90), (2,90), (3,75)]", type: "list", address: "0xR2" },
    ],
    hints: [
      "Filter `[r for r in records if r[0] in vip_set]` and sort with `key=lambda x: (-x[1], x[0])`.",
      "Collect `distinct = sorted({s for _, s in filtered}, reverse=True)` and pick `distinct[1]` if `len(distinct) >= 2` else `None`.",
    ],
  },
  {
    id: "alg-recap-ch5",
    title: "Chapter V Algo Recap: Conflict Index & Palindrome Audit",
    track: "algorithms",
    category: "🏆 CHAPTER V RECAP",
    difficulty: "Medium",
    tree_row: 1005,
    lesson_order: 105,
    is_free: false,
    is_recap: true,
    recap_chapter: 5,
    recap_topics: [
      "Clean Palindrome",
      "First Duplicate",
      "Closest Pair",
      "Inverted Index",
    ],
    description:
      "Conclusive Chapter V Algo capstone: normalize text for two-pointer palindrome checks, detect duplicate events early, and build a sorted inverted tag index.",
    content:
      "Combine **Chapter V** algorithms into one audit function `audit_palindromic_tags(items)`:\nGiven `items` = list of `(tag, raw_phrase)`:\n1. Build an inverted index mapping `clean_palindrome_phrase -> sorted(unique_tags)` ONLY for entries whose `raw_phrase` (alphanumeric lowercase only) is a **valid palindrome**.\n2. Return the FIRST duplicate `tag` encountered in input order (or `None` if all tags are unique), paired with that inverted index: `(first_dup_tag, index)`.",
    assignment:
      "Complete `audit_palindromic_tags(items)` returning `(first_dup_tag, index)`.",
    constraints: [
      "Strip non-alphanumeric chars and lowercase `raw_phrase` before two-pointer palindrome check",
      "Track seen `tag`s in order to capture `first_dup_tag` (or `None`)",
      "Map each valid clean palindrome string to a sorted deduplicated list of its tags",
    ],
    examples: [
      {
        input: 'items = [("api", "Race car!"), ("db", "hello"), ("api", "A man, a plan, a canal: Panama")]',
        output: "('api', {'amanaplanacanalpanama': ['api'], 'racecar': ['api']})",
        explanation: "'hello' is skipped; 'api' repeats first; both palindromes map to ['api'].",
      },
    ],
    complexities: { time: "O(n * k)", space: "O(n * k)" },
    initial_code: `def audit_palindromic_tags(items):
    pass`,
    expected_output: "('api', {'racecar': ['api'], 'amanaplanacanalpanama': ['api']})",
    hidden_tests: `import json
def __run_tests__():
    results = []
    s1 = [("api", "Race car!"), ("db", "hello"), ("api", "A man, a plan, a canal: Panama")]
    exp1 = ("api", {"racecar": ["api"], "amanaplanacanalpanama": ["api"]})
    r1 = audit_palindromic_tags(s1)
    results.append({"id": 1, "input": "duplicate + palindromes", "expected": str(exp1), "actual": str(r1), "passed": r1 == exp1})
    s2 = [("b", "Noon"), ("a", "noon"), ("c", "nope")]
    exp2 = (None, {"noon": ["a", "b"]})
    r2 = audit_palindromic_tags(s2)
    results.append({"id": 2, "input": "no dup + sorted index list", "expected": str(exp2), "actual": str(r2), "passed": r2 == exp2})
    r3 = audit_palindromic_tags([])
    results.append({"id": 3, "input": "empty items", "expected": "(None, {})", "actual": str(r3), "passed": r3 == (None, {})})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "two_pointers",
    visual_data: [
      { label: "clean", value: '"racecar" == reverse', type: "str", address: "0xT1" },
      { label: "first_dup", value: "'api'", type: "str", address: "0xT2" },
    ],
    hints: [
      "Normalize with `clean = ''.join(ch.lower() for ch in phrase if ch.isalnum())` and check `clean and clean == clean[::-1]` (or two pointers).",
      "Sort each list in `index` at the end via `sorted(set(tags))`.",
    ],
  },
  {
    id: "alg-recap-ch6",
    title: "Final Algo Capstone: Stream Profit, Intervals & Top-K Engine",
    track: "algorithms",
    category: "🏆 TRACK CAPSTONE",
    difficulty: "Hard",
    tree_row: 1006,
    lesson_order: 106,
    is_free: false,
    is_recap: true,
    recap_chapter: 6,
    recap_topics: ["Max Profit Scan", "Merge Intervals", "Top-K Frequent", "Greedy O(n log n)"],
    description:
      "The Algorithms graduation capstone uniting greedy profit scanning, interval merging, and Top-K frequency ranking on one dataset.",
    content:
      "Conquer the **Algorithms Track Finale** by combining three classic interview pillars:\n1. **Merge Intervals:** Given `windows` (list of `[start, end]`), merge overlapping intervals.\n2. **Greedy Profit:** Given `prices` list, compute maximum single buy-then-sell profit (`0` if never profitable).\n3. **Top-K Frequent:** Given `events` list and `k`, return the top `k` most frequent events (breaking ties alphabetically).\nReturn `{\"intervals\": merged, \"max_profit\": profit, \"top_k\": top}`.",
    assignment:
      "Implement `run_algo_suite(windows, prices, events, k)` returning `{intervals, max_profit, top_k}`.",
    constraints: [
      "Merge all overlapping `[start, end]` pairs cleanly after sorting by `start`",
      "Track running `min_price` in one O(n) pass for `max_profit`",
      "Rank `events` by `(-freq, event)` and return top `k`",
    ],
    examples: [
      {
        input: 'windows=[[1,3],[2,6],[8,10]], prices=[7,1,5,3,6,4], events=["a","b","a","c","b","a"], k=2',
        output: "{'intervals': [[1, 6], [8, 10]], 'max_profit': 5, 'top_k': ['a', 'b']}",
        explanation: "Intervals merge [1,6],[8,10]; profit 6-1=5; top 2 frequent are 'a'(3),'b'(2).",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def run_algo_suite(windows, prices, events, k):
    pass`,
    expected_output: "{'intervals': [[1, 6], [8, 10]], 'max_profit': 5, 'top_k': ['a', 'b']}",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = run_algo_suite([[1,3],[2,6],[8,10]], [7,1,5,3,6,4], ["a","b","a","c","b","a"], 2)
    exp1 = {"intervals": [[1, 6], [8, 10]], "max_profit": 5, "top_k": ["a", "b"]}
    results.append({"id": 1, "input": "full suite", "expected": str(exp1), "actual": str(r1), "passed": r1 == exp1})
    r2 = run_algo_suite([[1,4],[4,5]], [9,5,2], ["z","a"], 1)
    exp2 = {"intervals": [[1, 5]], "max_profit": 0, "top_k": ["a"]}
    results.append({"id": 2, "input": "touching intervals + falling prices + tie", "expected": str(exp2), "actual": str(r2), "passed": r2 == exp2})
    r3 = run_algo_suite([], [], [], 2)
    exp3 = {"intervals": [], "max_profit": 0, "top_k": []}
    results.append({"id": 3, "input": "empty inputs", "expected": str(exp3), "actual": str(r3), "passed": r3 == exp3})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "intervals", value: "[[1,6], [8,10]]", type: "list", address: "0xM1" },
      { label: "max_profit", value: "5 (buy 1, sell 6)", type: "int", address: "0xM2" },
      { label: "top_k", value: "['a', 'b']", type: "list", address: "0xM3" },
    ],
    hints: [
      "Sort a copy of `windows` by `w[0]` and merge whenever `start <= merged[-1][1]`.",
      "For `prices`, track `low = float('inf')` and `profit = 0`.",
    ],
  },
  {
    id: "alg-recap-ch7",
    title: "Chapter VII Algo Recap: Tree, Graph & DP Mission Planner",
    track: "algorithms",
    category: "🏆 CHAPTER VII RECAP",
    difficulty: "Hard",
    tree_row: 1007,
    lesson_order: 107,
    is_free: false,
    is_recap: true,
    recap_chapter: 7,
    recap_topics: [
      "Trees & DFS",
      "Graph BFS",
      "Min-Heap",
      "Dynamic Programming",
    ],
    description:
      "Conclusive Chapter VII Algo capstone uniting shortest-hop graph BFS with bottom-up DP step planning.",
    content:
      "Combine **Graph BFS** and **Dynamic Programming** inside `plan_mission_cost(graph, start, target, step_costs)`:\n1. Use BFS to find `min_hops` from `start` to `target` in `graph` (`-1` if unreachable -> immediately return `-1`).\n2. Given `min_hops` edges, use DP `min_coin_change(step_costs, min_hops)` (minimum tokens from `step_costs` summing to `min_hops`, or `-1` if impossible)!\nReturn that optimal count.",
    assignment:
      "Complete `plan_mission_cost(graph, start, target, step_costs)`: compute shortest BFS hop count `d` from `start` to `target`, then return minimum coins from `step_costs` totaling `d` (or `-1` if unreachable or unpayable).",
    constraints: [
      "Return `0` if `start == target` and `start in graph`",
      "Return `-1` if `target` is unreachable via BFS or `min_hops` cannot be paid cleanly",
    ],
    examples: [
      {
        input: 'graph={"A":["B","C"],"B":["D"],"C":["D"],"D":[]}, start="A", target="D", step_costs=[1, 2]',
        output: "1",
        explanation: "Shortest distance A->D is 2 hops; paying 2 takes 1 coin of size 2.",
      },
    ],
    complexities: { time: "O(V + E + V * len(step_costs))", space: "O(V)" },
    initial_code: `def plan_mission_cost(graph, start, target, step_costs):
    pass`,
    expected_output: "1",
    hidden_tests: `import json
def __run_tests__():
    results = []
    g = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"], "E": []}
    r1 = plan_mission_cost(g, "A", "E", [1, 2, 3])
    results.append({"id": 1, "input": "A->E (3 hops) with step 3", "expected": "1", "actual": str(r1), "passed": r1 == 1})
    r2 = plan_mission_cost(g, "A", "D", [2])
    results.append({"id": 2, "input": "A->D (2 hops) with [2]", "expected": "1", "actual": str(r2), "passed": r2 == 1})
    r3 = plan_mission_cost(g, "E", "A", [1, 2])
    results.append({"id": 3, "input": "unreachable target", "expected": "-1", "actual": str(r3), "passed": r3 == -1})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "dp_table",
    visual_data: [
      { label: "BFS(A -> E)", value: "min_hops = 3", address: "graph" },
      { label: "DP(amount=3)", value: "min_coins([1,2,3], 3) = 1 ✓", address: "optimal" },
    ],
    hints: [
      "First run BFS with `collections.deque` to compute `hops` (`-1` if not found).",
      "Then compute `dp = [hops + 1] * (hops + 1); dp[0] = 0` for `step_costs`.",
    ],
  },

  // =========================================================================
  // TRACK 3: SYSTEM DESIGN — 6 CUMULATIVE CHAPTER RECAP CAPSTONES (PRO)
  // =========================================================================
  {
    id: "sys-recap-ch1",
    title: "Chapter I Systems Recap: Sharded Gateway & Rate Guard",
    track: "system_design",
    category: "🏆 CHAPTER I RECAP",
    difficulty: "Medium",
    tree_row: 1001,
    lesson_order: 101,
    is_free: false,
    is_recap: true,
    recap_chapter: 1,
    recap_topics: ["Load Balancing", "Sharding", "Rate Limiting", "LRU Cache"],
    description:
      "Conclusive Chapter I Systems capstone: build a mini edge gateway combining rate-limit quota checks, cache hit lookup, and shard routing.",
    content:
      "Connect **Chapter I Architecture Layers** into a unified request pipeline `route_edge_request(user_id, num_shards, used_reqs, limit, cache)`:\n1. **Rate Limiter:** If `used_reqs >= limit`, reject immediately with `(429, None, None)`.\n2. **Cache Layer:** If `user_id in cache`, return `(200, 'CACHE', cache[user_id])`.\n3. **Shard Router:** Otherwise compute `shard = user_id % num_shards` and return `(200, 'ORIGIN', f'shard-{shard}')`.",
    assignment:
      "Implement `route_edge_request(user_id, num_shards, used_reqs, limit, cache)` combining rate limiting, cache lookup, and modulo shard routing.",
    constraints: [
      "Enforce rate limit first: return `(429, None, None)` when `used_reqs >= limit`",
      "Check `cache` next and return `(200, 'CACHE', cache[user_id])` on hit",
      "Route misses using `shard = user_id % num_shards` -> `(200, 'ORIGIN', f'shard-{shard}')`",
    ],
    examples: [
      {
        input: "user_id=14, num_shards=4, used_reqs=2, limit=5, cache={}",
        output: "(200, 'ORIGIN', 'shard-2')",
        explanation: "2 < 5 allows request; cache miss routes 14 % 4 = shard-2.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def route_edge_request(user_id, num_shards, used_reqs, limit, cache):
    pass`,
    expected_output: "(200, 'ORIGIN', 'shard-2')",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = route_edge_request(14, 4, 2, 5, {})
    results.append({"id": 1, "input": "cache miss -> shard-2", "expected": "(200, 'ORIGIN', 'shard-2')", "actual": str(r1), "passed": r1 == (200, "ORIGIN", "shard-2")})
    r2 = route_edge_request(14, 4, 5, 5, {14: "profile"})
    results.append({"id": 2, "input": "rate limited", "expected": "(429, None, None)", "actual": str(r2), "passed": r2 == (429, None, None)})
    r3 = route_edge_request(14, 4, 1, 5, {14: "cached-data"})
    results.append({"id": 3, "input": "cache hit", "expected": "(200, 'CACHE', 'cached-data')", "actual": str(r3), "passed": r3 == (200, "CACHE", "cached-data")})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "Rate Limit", value: "2 < 5 PASS", type: "guard", address: "0xG1" },
      { label: "14 % 4", value: "shard-2", type: "shard", address: "0xG2" },
    ],
    hints: [
      "Check `if used_reqs >= limit: return (429, None, None)` first.",
      "Then check `if user_id in cache: return (200, 'CACHE', cache[user_id])`.",
    ],
  },
  {
    id: "sys-recap-ch2",
    title: "Chapter II Systems Recap: Quorum & Circuit Breaker Coordinator",
    track: "system_design",
    category: "🏆 CHAPTER II RECAP",
    difficulty: "Medium",
    tree_row: 1002,
    lesson_order: 102,
    is_free: false,
    is_recap: true,
    recap_chapter: 2,
    recap_topics: ["Circuit Breaker", "Quorum Consensus", "Pub/Sub Filter", "Fault Tolerance"],
    description:
      "Conclusive Chapter II Systems capstone: guard writes behind a circuit-breaker threshold and confirm strict majority quorum across replicas.",
    content:
      "Combine **Circuit Breakers** and **Quorum Consensus**:\nGiven `recent_failures`, `failure_threshold`, and `replica_acks` (list of booleans from nodes):\n1. If `recent_failures >= failure_threshold`, the circuit is **OPEN** — return `(False, 'CIRCUIT_OPEN')`.\n2. Compute majority quorum threshold `needed = (len(replica_acks) // 2) + 1`.\n3. Count `True` votes; if `acks >= needed` (and replicas > 0), return `(True, 'COMMITTED')`, else `(False, 'QUORUM_FAILED')`.",
    assignment:
      "Complete `commit_with_breaker(recent_failures, failure_threshold, replica_acks)` returning `(success, status)`.",
    constraints: [
      "Trip breaker (`(False, 'CIRCUIT_OPEN')`) whenever `recent_failures >= failure_threshold`",
      "Require strict majority `sum(1 for x in replica_acks if x) >= (len(replica_acks) // 2) + 1`",
      "Return `(True, 'COMMITTED')` or `(False, 'QUORUM_FAILED')`",
    ],
    examples: [
      {
        input: "recent_failures=1, failure_threshold=3, replica_acks=[True, False, True]",
        output: "(True, 'COMMITTED')",
        explanation: "Breaker closed (1 < 3); 2 of 3 replicas acked (>= 2 needed).",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def commit_with_breaker(recent_failures, failure_threshold, replica_acks):
    pass`,
    expected_output: "(True, 'COMMITTED')",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = commit_with_breaker(1, 3, [True, False, True])
    results.append({"id": 1, "input": "breaker closed + 2/3 quorum", "expected": "(True, 'COMMITTED')", "actual": str(r1), "passed": r1 == (True, "COMMITTED")})
    r2 = commit_with_breaker(3, 3, [True, True, True])
    results.append({"id": 2, "input": "breaker OPEN", "expected": "(False, 'CIRCUIT_OPEN')", "actual": str(r2), "passed": r2 == (False, "CIRCUIT_OPEN")})
    r3 = commit_with_breaker(0, 3, [True, False, False])
    results.append({"id": 3, "input": "1/3 quorum failed", "expected": "(False, 'QUORUM_FAILED')", "actual": str(r3), "passed": r3 == (False, "QUORUM_FAILED")})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "Breaker", value: "1 < 3 (CLOSED)", type: "state", address: "0xQ1" },
      { label: "Quorum", value: "2 / 3 >= 2 (COMMITTED)", type: "quorum", address: "0xQ2" },
    ],
    hints: [
      "Guard `if recent_failures >= failure_threshold: return (False, 'CIRCUIT_OPEN')` first.",
      "Check `if not replica_acks: return (False, 'QUORUM_FAILED')` before computing `(len // 2) + 1`.",
    ],
  },
  {
    id: "sys-recap-ch3",
    title: "Chapter III Systems Recap: Resilient Retry, DLQ & Edge Router",
    track: "system_design",
    category: "🏆 CHAPTER III RECAP",
    difficulty: "Medium",
    tree_row: 1003,
    lesson_order: 103,
    is_free: false,
    is_recap: true,
    recap_chapter: 3,
    recap_topics: ["Backoff + Jitter", "DLQ Triage", "Priority Failover", "Regional CDN"],
    description:
      "Conclusive Chapter III Systems capstone: pick the lowest-latency healthy edge node or compute exponential backoff + route exhausted jobs to DLQ.",
    content:
      "Combine **Resilience & Traffic Routing** in `dispatch_resilient_job(edges, attempt, max_attempts, base_ms, max_ms)`:\nGiven `edges` = list of `{\"name\": ..., \"healthy\": bool, \"latency\": int}`:\n1. If any edge has `healthy == True`, pick the one with lowest `latency` and return `(\"SENT\", best_edge[\"name\"])`.\n2. If no edge is healthy and `attempt >= max_attempts`, send to dead-letter queue: `(\"DLQ\", 0)`.\n3. Otherwise compute capped backoff `min(max_ms, base_ms * (2 ** attempt))` and return `(\"RETRY\", wait_ms)`.",
    assignment:
      "Complete `dispatch_resilient_job(edges, attempt, max_attempts, base_ms, max_ms)` combining healthy lowest-latency routing, DLQ cutoff, and exponential backoff.",
    constraints: [
      "Filter `edges` to `e[\"healthy\"]` and pick minimum `latency` when available",
      'Route to `("DLQ", 0)` once `attempt >= max_attempts` with no healthy edges',
      'Return `("RETRY", min(max_ms, base_ms * (2 ** attempt)))` otherwise',
    ],
    examples: [
      {
        input: 'edges=[{"name":"eu","healthy":False,"latency":10},{"name":"us","healthy":True,"latency":45}], attempt=0, max_attempts=3, base_ms=100, max_ms=500',
        output: "('SENT', 'us')",
        explanation: "'eu' is unhealthy so traffic routes to healthy 'us'.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def dispatch_resilient_job(edges, attempt, max_attempts, base_ms, max_ms):
    pass`,
    expected_output: "('SENT', 'us')",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = dispatch_resilient_job([{"name": "eu", "healthy": False, "latency": 10}, {"name": "us", "healthy": True, "latency": 45}], 0, 3, 100, 500)
    results.append({"id": 1, "input": "healthy failover edge", "expected": "('SENT', 'us')", "actual": str(r1), "passed": r1 == ("SENT", "us")})
    r2 = dispatch_resilient_job([{"name": "eu", "healthy": False, "latency": 10}], 2, 3, 100, 500)
    results.append({"id": 2, "input": "all down -> RETRY backoff", "expected": "('RETRY', 400)", "actual": str(r2), "passed": r2 == ("RETRY", 400)})
    r3 = dispatch_resilient_job([{"name": "eu", "healthy": False, "latency": 10}], 3, 3, 100, 500)
    results.append({"id": 3, "input": "exhausted -> DLQ", "expected": "('DLQ', 0)", "actual": str(r3), "passed": r3 == ("DLQ", 0)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "healthy filter", value: "['us'] (45ms)", type: "route", address: "0xJ1" },
      { label: "fallback", value: "RETRY(400ms) -> DLQ(0)", type: "dlq", address: "0xJ2" },
    ],
    hints: [
      "Compute `healthy = [e for e in edges if e.get('healthy')]` and pick `min(healthy, key=lambda e: e['latency'])`.",
      "Only enter RETRY/DLQ logic when `not healthy`.",
    ],
  },
  {
    id: "sys-recap-ch4",
    title: "Chapter IV Systems Recap: Canary Rollout & Flap-Guarded Scaler",
    track: "system_design",
    category: "🏆 CHAPTER IV RECAP",
    difficulty: "Medium",
    tree_row: 1004,
    lesson_order: 104,
    is_free: false,
    is_recap: true,
    recap_chapter: 4,
    recap_topics: ["Flap Guard", "Canary Flags", "Payload Gatekeeper", "Autoscaler"],
    description:
      "Conclusive Chapter IV Systems capstone: combine consecutive alarm-flap detection, canary rollout bucketing, and worker scaling math.",
    content:
      "Tie **Observability, Rollouts & Scaling** together in `evaluate_service_controller(cpu_samples, cpu_limit, user_bucket, rollout_pct, kill_switch, queue_depth, capacity_per_worker)`:\n1. `alert_firing`: `True` if at least `3` consecutive trailing samples in `cpu_samples` are `>= cpu_limit`, else `False`.\n2. `canary_on`: `False` if `kill_switch` is `True`, else `user_bucket < rollout_pct`.\n3. `workers_needed`: ceiling `max(1, (queue_depth + capacity_per_worker - 1) // capacity_per_worker)` (or `0` if `queue_depth <= 0`).\nReturn `(alert_firing, canary_on, workers_needed)`.",
    assignment:
      "Implement `evaluate_service_controller(...)` returning `(alert_firing, canary_on, workers_needed)`.",
    constraints: [
      "Require 3 consecutive samples `>= cpu_limit` at the end of `cpu_samples` to fire alarm",
      "Check `not kill_switch and user_bucket < rollout_pct` (strict `<`) for `canary_on`",
      "Compute ceiling worker count `(queue_depth + cap - 1) // cap` when `queue_depth > 0` else `0`",
    ],
    examples: [
      {
        input: "cpu=[50, 90, 92, 95], limit=85, bucket=15, rollout=25, kill=False, queue=11, cap=5",
        output: "(True, True, 3)",
        explanation: "3 trailing CPU spikes >= 85; bucket 15 < 25; ceil(11/5) = 3 workers.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def evaluate_service_controller(cpu_samples, cpu_limit, user_bucket, rollout_pct, kill_switch, queue_depth, capacity_per_worker):
    pass`,
    expected_output: "(True, True, 3)",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = evaluate_service_controller([50, 90, 92, 95], 85, 15, 25, False, 11, 5)
    results.append({"id": 1, "input": "alarm + canary + 3 workers", "expected": "(True, True, 3)", "actual": str(r1), "passed": r1 == (True, True, 3)})
    r2 = evaluate_service_controller([90, 90, 40, 90], 85, 10, 50, True, 0, 5)
    results.append({"id": 2, "input": "flapped + kill-switch + empty queue", "expected": "(False, False, 0)", "actual": str(r2), "passed": r2 == (False, False, 0)})
    r3 = evaluate_service_controller([95, 95], 85, 25, 25, False, 10, 5)
    results.append({"id": 3, "input": "<3 samples + rollout exclusive boundary", "expected": "(False, False, 2)", "actual": str(r3), "passed": r3 == (False, False, 2)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "trailing 3 CPU", value: "[90, 92, 95] >= 85 -> True", type: "alarm", address: "0xK1" },
      { label: "ceil(11/5)", value: "3 workers", type: "scale", address: "0xK2" },
    ],
    hints: [
      "`alert_firing = len(cpu_samples) >= 3 and all(s >= cpu_limit for s in cpu_samples[-3:])`.",
      "`workers = (queue_depth + capacity_per_worker - 1) // capacity_per_worker if queue_depth > 0 else 0`.",
    ],
  },
  {
    id: "sys-recap-ch5",
    title: "Chapter V Systems Recap: Auth-Guarded Cache-Aside & Cursor Page",
    track: "system_design",
    category: "🏆 CHAPTER V RECAP",
    difficulty: "Medium",
    tree_row: 1005,
    lesson_order: 105,
    is_free: false,
    is_recap: true,
    recap_chapter: 5,
    recap_topics: ["Token Expiry", "Cursor Pagination", "Cache-Aside", "Batch Chunking"],
    description:
      "Conclusive Chapter V Systems capstone: validate non-expired tokens, serve cache-aside reads while warming the cache on DB hits, and return paginated slices.",
    content:
      "Combine **Chapter V API Patterns** into `serve_paginated_feed(token_expires_at, now_ts, cache_key, cache, db_records, cursor, page_size)`:\n1. **Auth Check:** If `now_ts >= token_expires_at`, return `{\"status\": 401, \"items\": [], \"has_more\": False}`.\n2. **Cache-Aside Read:** Look up `cache_key` in `cache`; on a miss, read `db_records`, write `cache[cache_key] = db_records` (when `db_records` is non-None).\n3. **Cursor Slice:** Return slice `[cursor : cursor + page_size]` and `has_more = (cursor + page_size) < len(records)`.",
    assignment:
      "Complete `serve_paginated_feed(...)` returning `{\"status\": 200|401, \"items\": [...], \"has_more\": bool}` while warming `cache` on miss.",
    constraints: [
      "Reject expired tokens when `now_ts >= token_expires_at` with `status: 401`",
      "Check `cache` first; on miss, populate `cache[cache_key] = db_records`",
      "Return exact page slice `records[cursor : cursor + page_size]` and accurate `has_more`",
    ],
    examples: [
      {
        input: 'expires=200, now=150, key="feed", cache={}, db=["p1","p2","p3"], cursor=0, size=2',
        output: "{'status': 200, 'items': ['p1', 'p2'], 'has_more': True}",
        explanation: "Valid token, warms cache['feed'], returns first 2 items with has_more=True.",
      },
    ],
    complexities: { time: "O(k)", space: "O(k)" },
    initial_code: `def serve_paginated_feed(token_expires_at, now_ts, cache_key, cache, db_records, cursor, page_size):
    pass`,
    expected_output: "{'status': 200, 'items': ['p1', 'p2'], 'has_more': True}",
    hidden_tests: `import json
def __run_tests__():
    results = []
    cache = {}
    r1 = serve_paginated_feed(200, 150, "feed", cache, ["p1", "p2", "p3"], 0, 2)
    ok1 = (r1 == {"status": 200, "items": ["p1", "p2"], "has_more": True}) and ("feed" in cache)
    results.append({"id": 1, "input": "valid + cache warm + page 1", "expected": "200 & cache warmed", "actual": f"{r1} cache_has={('feed' in cache)}", "passed": ok1})
    r2 = serve_paginated_feed(200, 200, "feed", cache, ["p1", "p2", "p3"], 0, 2)
    results.append({"id": 2, "input": "exact boundary expired (200 >= 200)", "expected": "status 401", "actual": str(r2), "passed": r2 == {"status": 401, "items": [], "has_more": False}})
    r3 = serve_paginated_feed(300, 150, "feed", cache, ["ignore"], 2, 2)
    results.append({"id": 3, "input": "cache hit last page", "expected": "items=['p3'], has_more=False", "actual": str(r3), "passed": r3 == {"status": 200, "items": ["p3"], "has_more": False}})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "Auth", value: "150 < 200 -> Valid", type: "auth", address: "0xV1" },
      { label: "Cache-Aside", value: "miss -> warmed cache['feed']", type: "cache", address: "0xV2" },
    ],
    hints: [
      "Check `if now_ts >= token_expires_at: return {'status': 401, 'items': [], 'has_more': False}`.",
      "Fetch `records = cache.get(cache_key)`; if `records is None`: set `records = db_records` and `cache[cache_key] = records`.",
    ],
  },
  {
    id: "sys-recap-ch6",
    title: "Final Systems Capstone: Multi-Tenant Cloud Kernel",
    track: "system_design",
    category: "🏆 TRACK CAPSTONE",
    difficulty: "Hard",
    tree_row: 1006,
    lesson_order: 106,
    is_free: false,
    is_recap: true,
    recap_chapter: 6,
    recap_topics: ["Sliding Window Log", "Token Bucket", "Hash Ring", "TTL Cache"],
    description:
      "The System Design graduation capstone combining sliding-window request pruning, token bucket refill/consume, TTL cache expiry, and consistent hash ring node selection.",
    content:
      "Conquer the **System Design Finale** with `process_kernel_request(now_ts, window_log, window_sec, max_reqs, ttl_cache, key, ring_nodes, key_hash)`:\n1. **Sliding Window Log:** Keep only timestamps `t > now_ts - window_sec`. If `len(active_log) >= max_reqs`, reject `(False, 'RATE_LIMIT', active_log)`.\n2. **TTL Cache:** Read `ttl_cache.get(key)` `(value, expires_at)`. If missing or `now_ts >= expires_at`, pick the first sorted ring node `(pos, node_name)` with `pos >= key_hash` (wrapping to `ring_sorted[0][1]`) and return `(True, f'MISS:{node}', active_log + [now_ts])`.\n3. Otherwise return `(True, value, active_log + [now_ts])`!",
    assignment:
      "Complete `process_kernel_request(now_ts, window_log, window_sec, max_reqs, ttl_cache, key, ring_nodes, key_hash)` combining window pruning, TTL validation, and consistent hash ring wrap-around.",
    constraints: [
      "Prune stale timestamps with `t > now_ts - window_sec` before checking `>= max_reqs`",
      "Check TTL entry `(val, exp)`: expired when `now_ts >= exp`",
      "Walk sorted `(pos, node_name)` ring entries picking first `pos >= key_hash`, wrapping to `ring_sorted[0][1]`",
    ],
    examples: [
      {
        input: 'now=100, log=[50, 95], win=10, max=3, ttl={"cfg": ("dark", 150)}, key="cfg", ring=[(10,"n1"),(50,"n2")], hash=30',
        output: "(True, 'dark', [95, 100])",
        explanation: "50 pruned (<=90); 1 active < 3; TTL valid (100 < 150) -> returns 'dark'.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def process_kernel_request(now_ts, window_log, window_sec, max_reqs, ttl_cache, key, ring_nodes, key_hash):
    pass`,
    expected_output: "(True, 'dark', [95, 100])",
    hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = process_kernel_request(100, [50, 95], 10, 3, {"cfg": ("dark", 150)}, "cfg", [(10, "n1"), (50, "n2")], 30)
    results.append({"id": 1, "input": "window prune + TTL hit", "expected": "(True, 'dark', [95, 100])", "actual": str(r1), "passed": r1 == (True, "dark", [95, 100])})
    r2 = process_kernel_request(100, [95, 98], 10, 2, {"cfg": ("dark", 150)}, "cfg", [(10, "n1"), (50, "n2")], 30)
    results.append({"id": 2, "input": "sliding window rate limited", "expected": "(False, 'RATE_LIMIT', [95, 98])", "actual": str(r2), "passed": r2 == (False, "RATE_LIMIT", [95, 98])})
    r3 = process_kernel_request(150, [], 10, 3, {"cfg": ("dark", 150)}, "cfg", [(10, "n1"), (50, "n2")], 75)
    results.append({"id": 3, "input": "TTL expired + ring wrap-around", "expected": "(True, 'MISS:n1', [150])", "actual": str(r3), "passed": r3 == (True, "MISS:n1", [150])})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "window_log", value: "pruned <= 90 -> [95, 100]", type: "window", address: "0xN1" },
      { label: "hash ring wrap", value: "75 > 50 -> wraps to n1", type: "ring", address: "0xN2" },
    ],
    hints: [
      "Prune log: `active = [t for t in window_log if t > now_ts - window_sec]`. If `len(active) >= max_reqs`, return `(False, 'RATE_LIMIT', active)`.",
      "On TTL miss/expiry, sort `ring_sorted = sorted(ring_nodes)`, pick first `name` where `pos >= key_hash` else `ring_sorted[0][1]`, and return `(True, f'MISS:{node}', active + [now_ts])`.",
    ],
  },
  {
    id: "sys-recap-ch7",
    title: "Chapter VII Systems Recap: Secure Payment Webhook Gateway",
    track: "system_design",
    category: "🏆 CHAPTER VII RECAP",
    difficulty: "Hard",
    tree_row: 1007,
    lesson_order: 107,
    is_free: false,
    is_recap: true,
    recap_chapter: 7,
    recap_topics: [
      "HMAC-SHA256 Auth",
      "Replay Window",
      "Idempotency Ledger",
      "Base62 Receipt ID",
    ],
    description:
      "Conclusive Chapter VII capstone: build a Stripe/Polar-grade payment webhook gateway enforcing replay windows, constant-time HMAC-SHA256 verification, and idempotent ledger recording.",
    content:
      'Welcome to the **Chapter VII Backend & Security Capstone**!\n\nProduction payment gateways combine **Replay Protection**, **Constant-Time HMAC-SHA256**, and **Idempotent Deduplication** in one atomic pipeline:\n1. Reject stale or future timestamps when `abs(now_ts - timestamp) > 300` -> `("REJECTED", "STALE")`.\n2. Compute `hmac.new(secret.encode(), f"{timestamp}.{payload}".encode(), hashlib.sha256).hexdigest()` and verify with `hmac.compare_digest(...)`; if invalid -> `("REJECTED", "BAD_SIG")`.\n3. If `idem_key in ledger`: return `("DUPLICATE", ledger[idem_key])` without double-recording; otherwise store `receipt = f"rcpt_{len(ledger) + 1}"` in `ledger[idem_key]` and return `("PROCESSED", receipt)`!\n\n```python\n# Sibling pattern: signed audit-event receiver\nimport hashlib, hmac\n\ndef check_signed_ping(body, ts, sig, key, now_sec):\n    if abs(now_sec - ts) > 60:\n        return False\n    digest = hmac.new(key.encode(), f"{ts}.{body}".encode(), hashlib.sha256).hexdigest()\n    return hmac.compare_digest(digest, sig)\n```',
    assignment:
      'Complete `handle_payment_webhook(payload, timestamp, sig_hex, secret, idem_key, ledger, now_ts)` enforcing a `300`s replay window, `hmac.compare_digest` over `f"{timestamp}.{payload}"`, and idempotent receipt storage in `ledger`.',
    constraints: [
      'Return `("REJECTED", "STALE")` if `abs(now_ts - timestamp) > 300`',
      'Verify HMAC-SHA256 hex digest of `f"{timestamp}.{payload}"` with `hmac.compare_digest`; return `("REJECTED", "BAD_SIG")` on mismatch',
      'Return `("DUPLICATE", ledger[idem_key])` if `idem_key` already exists, else store `f"rcpt_{len(ledger) + 1}"` and return `("PROCESSED", receipt)`',
    ],
    examples: [
      {
        input: 'valid HMAC at now_ts=1000, timestamp=995, idem_key="evt_1"',
        output: "('PROCESSED', 'rcpt_1') -> retry returns ('DUPLICATE', 'rcpt_1')",
        explanation:
          "First delivery passes replay + HMAC checks and creates 'rcpt_1'; retrying the same idem_key returns the cached receipt without double-charging.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def handle_payment_webhook(payload, timestamp, sig_hex, secret, idem_key, ledger, now_ts):
    pass`,
    expected_output: "('PROCESSED', 'rcpt_1')",
    hidden_tests: `import hashlib, hmac, json
def __run_tests__():
    results = []
    secret = "devy_live_sec"
    body = '{"plan":"lifetime"}'
    good_sig = hmac.new(secret.encode(), f"995.{body}".encode(), hashlib.sha256).hexdigest()
    ledger = {}
    r1 = handle_payment_webhook(body, 995, good_sig, secret, "evt_1", ledger, 1000)
    results.append({"id": 1, "input": "fresh valid webhook", "expected": "('PROCESSED', 'rcpt_1')", "actual": str(r1), "passed": r1 == ("PROCESSED", "rcpt_1") and ledger.get("evt_1") == "rcpt_1"})
    r2 = handle_payment_webhook(body, 995, good_sig, secret, "evt_1", ledger, 1002)
    results.append({"id": 2, "input": "duplicate idem_key retry", "expected": "('DUPLICATE', 'rcpt_1')", "actual": str(r2), "passed": r2 == ("DUPLICATE", "rcpt_1") and len(ledger) == 1})
    r3 = handle_payment_webhook(body, 995, "deadbeef", secret, "evt_2", ledger, 1000)
    results.append({"id": 3, "input": "tampered signature", "expected": "('REJECTED', 'BAD_SIG')", "actual": str(r3), "passed": r3 == ("REJECTED", "BAD_SIG")})
    stale_sig = hmac.new(secret.encode(), f"400.{body}".encode(), hashlib.sha256).hexdigest()
    r4 = handle_payment_webhook(body, 400, stale_sig, secret, "evt_3", ledger, 1000)
    results.append({"id": 4, "input": "replayed stale timestamp", "expected": "('REJECTED', 'STALE')", "actual": str(r4), "passed": r4 == ("REJECTED", "STALE")})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
    visual_type: "memory",
    visual_data: [
      { label: "|1000 - 995| <= 300", value: "5s drift -> FRESH ✓", type: "guard", address: "step 1" },
      { label: "HMAC-SHA256", value: "compare_digest -> VALID ✓", type: "crypto", address: "step 2" },
      { label: "ledger['evt_1']", value: "'rcpt_1' (idempotent)", type: "dict", address: "step 3" },
    ],
    hints: [
      "Import `hashlib` and `hmac` inside your function (or at the top of the file).",
      'Check `if abs(now_ts - timestamp) > 300: return ("REJECTED", "STALE")` first.',
      'Compute `expected = hmac.new(secret.encode(), f"{timestamp}.{payload}".encode(), hashlib.sha256).hexdigest()` and check `if not hmac.compare_digest(expected, sig_hex): return ("REJECTED", "BAD_SIG")`.',
    ],
  },
];
