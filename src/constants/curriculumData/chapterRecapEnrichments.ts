import { EnrichedLessonData } from "./types";

export const CHAPTER_RECAP_ENRICHMENTS: EnrichedLessonData[] = [
  // =========================================================================
  // PYTHON BASICS RECAPS (101 - 106)
  // =========================================================================
  {
    matchTrack: "python_basics",
    matchOrder: 101,
    matchKeywords: ["chapter i recap", "guild party", "audit_guild_party"],
    realWorldUse:
      "Used in multiplayer game leaderboards and HR/payroll batch jobs that classify and total user records in one pass.",
    analogyTitle: "Roster Sheet + Score Counter in One Loop",
    analogyText:
      "Each number in `scores` is one party member's XP. Walk the list once, add `score` to `total_xp`, bump `gold_count` whenever `score >= 100`, then pick `'Elite'` vs `'Squad'` at the end.",
    cheatSheet: `total_xp = 0
gold_count = 0
for score in scores:
    total_xp += score
    if score >= 100:
        gold_count += 1`,
    commonPitfall: {
      title: "Checking tier or returning inside the for loop",
      wrongCode:
        "for score in scores:\n    return (total_xp, gold_count, 'Squad')  # Stops after 1 player!",
      rightCode:
        "for score in scores:\n    ...\nreturn (total_xp, gold_count, squad_rank)",
      explanation:
        "Finish summing all party members before computing `squad_rank` and returning the tuple.",
    },
    solutionCode: `def audit_guild_party(scores):
    total_xp = 0
    gold_count = 0
    for score in scores:
        total_xp += score
        if score >= 100:
            gold_count += 1
    squad_rank = "Elite" if gold_count >= 2 else "Squad"
    return (total_xp, gold_count, squad_rank)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Tuple unpacking in a single loop tracks totals and tier counts in O(1) extra memory without building intermediate lists.",
    },
    quiz: {
      question:
        "Where should `return (total_xp, gold_count, squad_rank)` live in `audit_guild_party`?",
      options: [
        "Outside the `for` loop after every party member is processed",
        "Inside the `if score >= 100:` block",
        "Before the `for` loop starts",
      ],
      correctIndex: 0,
      explanation:
        "Returning inside the loop stops on the first player; unindenting `return` computes the full party summary first.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 102,
    matchKeywords: ["chapter ii recap", "tournament roster", "build_qualified_roster"],
    realWorldUse:
      "Used when ingesting CSV exports or user forms containing extra spaces, mixed casing, and corrupt numbers.",
    analogyTitle: "Sanitize -> Try Parse -> Filter",
    analogyText:
      "Clean each handle with `.strip().lower()`, try converting the raw score with `int(raw_score)` inside `try / except (ValueError, TypeError):`, and only store valid entries meeting `min_score`.",
    cheatSheet: `roster = {}
for raw_handle, raw_score in entries:
    clean_handle = raw_handle.strip().lower()
    try:
        score = int(raw_score)
    except (ValueError, TypeError):
        continue`,
    commonPitfall: {
      title: "Forgetting TypeError when raw_score is None",
      wrongCode:
        "try:\n    score = int(raw_score)\nexcept ValueError:  # Crashes with TypeError on None!",
      rightCode:
        "try:\n    score = int(raw_score)\nexcept (ValueError, TypeError):\n    continue",
      explanation:
        "`int('ERR')` raises `ValueError`, whereas `int(None)` raises `TypeError` — catch both cleanly.",
    },
    solutionCode: `def build_qualified_roster(entries, min_score):
    roster = {}
    for raw_handle, raw_score in entries:
        clean_handle = raw_handle.strip().lower()
        try:
            score = int(raw_score)
        except (ValueError, TypeError):
            continue
        if score >= min_score:
            roster[clean_handle] = score
    return roster`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      tradeoff:
        "Catching `(ValueError, TypeError)` guards bad strings and `None` cleanly in one pass without letting one broken row crash ingestion.",
    },
    quiz: {
      question:
        "Which exception does `int(None)` raise in Python if a tournament row has a missing score?",
      options: ["TypeError", "KeyError", "IndexError"],
      correctIndex: 0,
      explanation:
        "`int('abc')` raises `ValueError`, while `int(None)` raises `TypeError` — catching both keeps your loop crash-proof.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 103,
    matchKeywords: ["chapter iii recap", "trending slug", "build_trending_digest"],
    realWorldUse:
      "Powers social media trending hashtags, search autocomplete rankings, and top-3 leaderboard cards.",
    analogyTitle: "Clean -> Deduplicate & Sort -> Slice Top 3 -> Join",
    analogyText:
      "Clean each non-empty tag with `.strip().lower()`, deduplicate and sort alphabetically with `sorted(set(cleaned))`, slice `[:3]`, and join with `' | '`.",
    cheatSheet: `valid = [raw.strip().lower() for raw in items if raw.strip() != ""]
top_items = sorted(set(valid))[:2]
summary = ", ".join(top_items)`,
    commonPitfall: {
      title: "Forgetting to skip empty whitespace-only tags after .strip()",
      wrongCode:
        "cleaned.append(raw.strip().lower())  # Includes '' from '   '!",
      rightCode:
        "tag = raw.strip().lower()\nif tag != '':\n    cleaned.append(tag)",
      explanation:
        "Stripping `'   '` leaves an empty string `''`, so check `if tag != '':` before appending.",
    },
    solutionCode: `def build_trending_digest(tags):
    cleaned = []
    for raw in tags:
        clean = raw.strip().lower()
        if clean != "":
            cleaned.append(clean)
    unique_tags = sorted(set(cleaned))
    return " | ".join(unique_tags[:3])`,
    proInsights: {
      timeComplexity: "O(n + u log u)",
      spaceComplexity: "O(u)",
      tradeoff:
        "Deduplicating with `set(...)` before calling `sorted(...)` only sorts the unique tags `u`.",
    },
    quiz: {
      question:
        "What does `sorted(set(cleaned))[:3]` return?",
      options: [
        "The first 3 unique tags in A–Z alphabetical order",
        "The last 3 duplicate tags",
        "A dictionary of tag counts",
      ],
      correctIndex: 0,
      explanation:
        "`set(cleaned)` removes duplicates, `sorted(...)` orders them A–Z, and `[:3]` slices the first 3.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 104,
    matchKeywords: ["chapter iv recap", "stream moderation", "process_stream_events"],
    realWorldUse:
      "Mirrors webhook validators and chat moderation workers that drop insecure links, censor keywords, and aggregate payouts.",
    analogyTitle: "Security Gate + Redactor + Safe Ledger",
    analogyText:
      "Check `.startswith('https://')` first so `http://` events are skipped completely, censor `'spoiler'`, and accumulate payouts with `tier_rates.get(tier, 5)`.",
    cheatSheet: `payouts = []
cleaned = []
for ev in events:
    if ev["url"].startswith("https://"):
        cleaned.append(ev["text"].replace("spoiler", "[REDACTED]"))
        payouts.append(tier_rates.get(ev["tier"], 5))`,
    commonPitfall: {
      title: "Using substring match instead of .startswith('https://')",
      wrongCode:
        'if "https://" in ev["url"]:  # Matches unsafe redirects like http://x?next=https://...',
      rightCode: 'if ev["url"].startswith("https://"):',
      explanation:
        "Always check the scheme prefix with `.startswith('https://')` so embedded URLs cannot bypass validation.",
    },
    solutionCode: `def process_stream_events(events, tier_rates):
    payouts = []
    cleaned = []
    for ev in events:
        if not ev["url"].startswith("https://"):
            continue
        cleaned.append(ev["text"].replace("spoiler", "[REDACTED]"))
        payouts.append(tier_rates.get(ev["tier"], 5))
    return (sum(payouts), cleaned)`,
    proInsights: {
      timeComplexity: "O(n * m)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Filtering early with `if not ...: continue` prevents rejected events from leaking into either payouts or cleaned text.",
    },
    quiz: {
      question:
        "Why use `tier_rates.get(tier, 5)` instead of `tier_rates[tier]`?",
      options: [
        "It returns 5 safely instead of crashing with KeyError on unknown tiers",
        "It adds 5 to every tier rate in the dictionary",
        "It deletes unrecognized keys automatically",
      ],
      correctIndex: 0,
      explanation:
        "`dict.get(key, default)` guarantees a safe fallback payout without mutating `tier_rates`.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 105,
    matchKeywords: ["chapter v recap", "review analyzer", "format_review_badge"],
    realWorldUse:
      "Powers app-store review moderation pipelines that flag banned language and compute clean average ratings.",
    analogyTitle: "Word Scanner + Star Card Formatter",
    analogyText:
      "Lowercase and split `comment`, test `any(w in banned_words for w in words)`, round `sum(scores) / len(scores)` to 1 decimal, and format with an f-string.",
    cheatSheet: `words = comment.lower().split()
flagged = any(w in banned_words for w in words)
avg = round(sum(scores) / len(scores), 1)
status = "FLAGGED" if flagged else "APPROVED"`,
    commonPitfall: {
      title: "Forgetting to lowercase the comment before comparing against banned_words",
      wrongCode:
        "words = comment.split()  # Misses 'SPAM' if banned_words has 'spam'!",
      rightCode: "words = comment.lower().split()",
      explanation:
        "Normalizing `comment.lower()` before `.split()` catches `'SPAM'`, `'Spam'`, and `'spam'` consistently.",
    },
    solutionCode: `def format_review_badge(comment, scores, banned_words):
    words = comment.lower().split()
    flagged = False
    for word in words:
        if word in banned_words:
            flagged = True
    avg = round(sum(scores) / len(scores), 1) if scores else 0.0
    status = "FLAGGED" if flagged else "APPROVED"
    return f"{status} | avg {avg}/5 ({len(words)} words)"`,
    proInsights: {
      timeComplexity: "O(w + s + b)",
      spaceComplexity: "O(w + b)",
      tradeoff:
        "Converting `banned_words` to a lowercase `set` gives O(1) per-word moderation checks regardless of blocklist size.",
    },
    quiz: {
      question:
        "What does `round(sum([5, 4, 5]) / 3, 1)` evaluate to in Python?",
      options: ["4.7", "4.6", "5.0"],
      correctIndex: 0,
      explanation:
        "`14 / 3` is `4.6666...`, which rounds to `4.7` at `1` decimal place.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 106,
    matchKeywords: ["arcade boss server", "run_arcade_command", "foundations grand finale"],
    realWorldUse:
      "Mirrors CLI command routers and chat slash-command bots that dispatch subcommands safely with fallback errors.",
    analogyTitle: "Command Dispatcher Switchboard",
    analogyText:
      "Split the 2-word command into `parts = command.strip().split()`, inspect `cmd = parts[0].upper()` and `val = parts[1]`, and route `'CRIT'`, `'PASS'`, or `'BOT'` (returning `'ERR'` otherwise).",
    cheatSheet: `parts = command.strip().split()
if len(parts) != 2:
    return "ERR"
cmd = parts[0].upper()
val = parts[1]`,
    commonPitfall: {
      title: "Indexing parts[1] before checking len(parts) == 2",
      wrongCode:
        "parts = command.strip().split()\nval = parts[1]  # Crashes if command has 0 or 1 words!",
      rightCode:
        "parts = command.strip().split()\nif len(parts) != 2:\n    return 'ERR'",
      explanation:
        "Checking `len(parts) != 2` first ensures `parts[0]` and `parts[1]` both exist safely.",
    },
    solutionCode: `def run_arcade_command(command, mood_map):
    parts = command.strip().split()
    if len(parts) != 2:
        return "ERR"
    cmd = parts[0].upper()
    val = parts[1]
    if cmd == "CRIT":
        return int(val) * 2
    elif cmd == "PASS":
        return "STRONG" if len(val) >= 8 else "WEAK"
    elif cmd == "BOT":
        return f"Bot: {mood_map.get(val.lower(), '🤖 Ready!')}"
    return "ERR"`,
    proInsights: {
      timeComplexity: "O(len(command))",
      spaceComplexity: "O(len(command))",
      tradeoff:
        "Validating arity (`len(parts)`) and catching parsing/division exceptions keeps the dispatcher resilient to bad client input.",
    },
    quiz: {
      question:
        "Why does `run_arcade_command` call `.strip().split()` instead of `.split(' ')`?",
      options: [
        "`.split()` cleanly ignores extra leading/trailing or repeated whitespace",
        "`.split()` removes uppercase letters",
        "`.split()` converts numeric tokens into integers automatically",
      ],
      correctIndex: 0,
      explanation:
        "`.split()` collapses arbitrary whitespace and never produces empty `''` tokens between spaces.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 107,
    matchKeywords: ["telemetry pipeline", "process_log_credits"],
    realWorldUse:
      "Models billing/quota accounting pipelines that parse log telemetry via regex and decrement customer error budgets safely.",
    analogyTitle: "Regex Scanner + Metered Credit Bucket",
    analogyText:
      "Sweep every log line for `ERR-\\d+`, tally counts into a dict (`counts[code] = counts.get(code, 0) + 1`), then subtract `total * cost_per_error` clamped at zero.",
    cheatSheet: `import re
for line in log_lines:
    for code in re.findall(r"ERR-\\d+", line):
        counts[code] = counts.get(code, 0) + 1`,
    commonPitfall: {
      title: "Allowing remaining_credits to go negative on high error counts",
      wrongCode: "return (counts, initial_credits - total * cost_per_error)",
      rightCode: "return (counts, max(0, initial_credits - total * cost_per_error))",
      explanation:
        "Clamping with `max(0, ...)` ensures error spikes never yield negative account credits.",
    },
    solutionCode: `import re

def process_log_credits(log_lines, initial_credits, cost_per_error):
    counts = {}
    total = 0
    for line in log_lines:
        for code in re.findall(r"ERR-\\d+", line):
            counts[code] = counts.get(code, 0) + 1
            total += 1
    remaining = max(0, initial_credits - total * cost_per_error)
    return (counts, remaining)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      tradeoff:
        "Single-pass regex matching aggregates per-code frequencies and credit charges cleanly without intermediate token lists.",
    },
    quiz: {
      question:
        "Why wrap final credits in `max(0, initial_credits - total * cost_per_error)`?",
      options: [
        "To floor remaining credits at zero instead of going negative",
        "To double remaining credits when zero errors exist",
        "To sort dictionary keys descending",
      ],
      correctIndex: 0,
      explanation:
        "`max(0, ...)` prevents credit balances from dropping below `0` during error bursts.",
    },
  },

  // =========================================================================
  // ALGORITHMS RECAPS (101 - 106)
  // =========================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 101,
    matchKeywords: ["target window pair finder", "analyze_signal_window"],
    realWorldUse:
      "Combines rolling sensor peak detection with real-time pair matching in financial and telemetry streams.",
    analogyTitle: "Rolling Window Sum + Instant Complement Set",
    analogyText:
      "Slide a length-`k` sum in O(1) per step (add right, drop left) AND track seen elements in a `set` to detect `target - num in seen` in one O(n) pass.",
    cheatSheet: `window_sum = sum(nums[:k])
best = window_sum
for i in range(k, len(nums)):
    window_sum += nums[i] - nums[i - k]
    best = max(best, window_sum)`,
    commonPitfall: {
      title: "Checking `target - num in seen` after inserting `num`",
      wrongCode:
        "seen.add(num)\nif target - num in seen: has_pair = True  # Pairs an element with itself!",
      rightCode:
        "if target - num in seen:\n    has_pair = True\nseen.add(num)",
      explanation:
        "Check `seen` BEFORE calling `seen.add(num)` so `target = 2 * num` only returns `True` if two separate indices hold `num`.",
    },
    solutionCode: `def analyze_signal_window(nums, k, target):
    if k <= 0 or k > len(nums):
        max_window = 0
    else:
        window_sum = sum(nums[:k])
        max_window = window_sum
        for i in range(k, len(nums)):
            window_sum += nums[i] - nums[i - k]
            if window_sum > max_window:
                max_window = window_sum

    seen = set()
    has_pair = False
    for num in nums:
        if (target - num) in seen:
            has_pair = True
            break
        seen.add(num)
    return (max_window, has_pair)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Maintains O(1) incremental window updates alongside an O(n) hash set rather than resumming windows or nested pair loops.",
    },
    quiz: {
      question:
        "How does the sliding window avoid O(n * k) work when moving one step right?",
      options: [
        "Adds `nums[i]` and subtracts `nums[i - k]` from the running sum",
        "Sorts the subarray inside each window",
        "Recomputes `sum(nums[i - k + 1 : i + 1])` every step",
      ],
      correctIndex: 0,
      explanation:
        "Adding the entering item and subtracting the leaving item keeps every window step O(1).",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 102,
    matchKeywords: ["nested scope validator", "validate_and_measure_depth"],
    realWorldUse:
      "Used by IDE syntax checkers, JSON/AST parsers, and linter complexity rules to measure nesting depth.",
    analogyTitle: "Plate Stack Height Tracker",
    analogyText:
      "Ignore regular letters. Push opening brackets `(`, `[`, `{` onto a stack and track `max_depth = max(max_depth, len(stack))`; on any closer, ensure the stack top matches.",
    cheatSheet: `pairs = {")": "(", "]": "[", "}": "{"}
stack = []
max_depth = 0`,
    commonPitfall: {
      title: "Returning (True, max_depth) when unclosed brackets remain on the stack",
      wrongCode: "return (True, max_depth)  # Fails on '((('!",
      rightCode:
        "return (True, max_depth) if not stack else (False, -1)",
      explanation:
        "An expression is valid only if `stack` is completely empty at the end.",
    },
    solutionCode: `def validate_and_measure_depth(expr):
    pairs = {")": "(", "]": "[", "}": "{"}
    openers = {"(", "[", "{"}
    stack = []
    max_depth = 0
    for ch in expr:
        if ch in openers:
            stack.append(ch)
            if len(stack) > max_depth:
                max_depth = len(stack)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return (False, -1)
            stack.pop()
    return (True, max_depth) if not stack else (False, -1)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "A single stack verifies LIFO pairing while `len(stack)` directly measures nesting depth in O(1) extra tracking.",
    },
    quiz: {
      question:
        "What does `len(stack)` tell you right after pushing an opening bracket?",
      options: [
        "The current nesting depth",
        "The total number of closing brackets seen so far",
        "Whether non-bracket characters existed",
      ],
      correctIndex: 0,
      explanation:
        "Each open bracket adds one active scope level on top of the stack, so `max(max_depth, len(stack))` tracks peak depth.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 103,
    matchKeywords: ["range query", "summarize_candidates"],
    realWorldUse:
      "Classic search-engine and analytics query pattern: binary search cutoff + prefix aggregate + set overlap.",
    analogyTitle: "Binary Cutoff + Prefix Total + Shared Team",
    analogyText:
      "Binary search the first index `idx` where `sorted_scores[idx] >= threshold`, slice suffix using prefix sums (`prefix[-1] - prefix[idx]`), and compute `sorted(set(team_a) & set(team_b))`.",
    cheatSheet: `lo, hi = 0, len(sorted_scores)
while lo < hi:
    mid = (lo + hi) // 2
    if sorted_scores[mid] < threshold: lo = mid + 1
    else: hi = mid`,
    commonPitfall: {
      title: "Setting `hi = len(sorted_scores) - 1` when no score passes threshold",
      wrongCode:
        "hi = len(sorted_scores) - 1  # Returns last index instead of len(sorted_scores)!",
      rightCode:
        "lo, hi = 0, len(sorted_scores)  # Exclusive right bound handles 'none passing' cleanly",
      explanation:
        "Keeping `hi = len(sorted_scores)` returns `len(sorted_scores)` when all values are `< threshold`, making `len - idx == 0` automatically.",
    },
    solutionCode: `def summarize_candidates(sorted_scores, threshold, team_a, team_b):
    lo, hi = 0, len(sorted_scores)
    while lo < hi:
        mid = (lo + hi) // 2
        if sorted_scores[mid] < threshold:
            lo = mid + 1
        else:
            hi = mid

    prefix = [0] * (len(sorted_scores) + 1)
    for i, val in enumerate(sorted_scores):
        prefix[i + 1] = prefix[i] + val

    passing_count = len(sorted_scores) - lo
    passing_sum = prefix[-1] - prefix[lo]
    shared = sorted(set(team_a) & set(team_b))
    return (passing_count, passing_sum, shared)`,
    proInsights: {
      timeComplexity: "O(log n + n + a + b + s log s)",
      spaceComplexity: "O(n + a + b)",
      tradeoff:
        "With precomputed `prefix` sums, range queries take O(log n) binary search + O(1) subtraction.",
    },
    quiz: {
      question:
        "Using a 1-indexed `prefix` array where `prefix[0] = 0`, what is the sum from index `lo` to the end?",
      options: [
        "`prefix[-1] - prefix[lo]`",
        "`prefix[-1] - prefix[lo + 1]`",
        "`prefix[lo] - prefix[0]`",
      ],
      correctIndex: 0,
      explanation:
        "`prefix[lo]` equals the sum of indices `0..lo-1`, so subtracting it from `prefix[-1]` leaves `lo..n-1`.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 104,
    matchKeywords: ["partitioned telemetry", "rank_vip_telemetry"],
    realWorldUse:
      "Used in VIP tournament leaderboards and monitoring systems to rank allowlisted entities and find runner-up thresholds.",
    analogyTitle: "Allowlist Filter + Multi-Key Sort + Top-2 Distinct",
    analogyText:
      "Convert `vip_ids` to a `set` for O(1) filtering, sort by `(-score, id)`, and track `first` / `second` distinct scores in one pass (or scan sorted scores for the first value `< first`).",
    cheatSheet: `vip_set = set(vip_ids)
kept = [(uid, sc) for uid, sc in records if uid in vip_set]
kept.sort(key=lambda r: (-r[1], r[0]))`,
    commonPitfall: {
      title: "Taking kept[1][1] as runner-up when top two players tied",
      wrongCode:
        "runner_up = kept[1][1]  # Fails when [(1, 50), (2, 50)] only has 1 distinct score!",
      rightCode:
        "Pick the first score strictly different from top score, else None.",
      explanation:
        "Distinct runner-up means the second highest *unique* score, not simply the second array element.",
    },
    solutionCode: `def rank_vip_telemetry(records, vip_ids):
    vip_set = set(vip_ids)
    kept = [(uid, score) for uid, score in records if uid in vip_set]
    kept.sort(key=lambda item: (-item[1], item[0]))
    ordered_ids = [uid for uid, _ in kept]

    runner_up = None
    if kept:
        top_score = kept[0][1]
        for _, score in kept:
            if score < top_score:
                runner_up = score
                break
    return (ordered_ids, runner_up)`,
    proInsights: {
      timeComplexity: "O(v + n + k log k)",
      spaceComplexity: "O(v + k)",
      tradeoff:
        "Filtering with a `set` before sorting minimizes the number of records sorted while finding the distinct runner-up in O(k).",
    },
    quiz: {
      question:
        "If sorted kept VIP scores are `[90, 90, 75]`, what is the distinct runner-up score?",
      options: ["75", "90", "None"],
      correctIndex: 0,
      explanation:
        "`90` is the highest score; `75` is the first distinct score strictly lower than `90`.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 105,
    matchKeywords: ["conflict index", "palindrome audit", "audit_palindromic_tags"],
    realWorldUse:
      "Deduplicates ingested tag identifiers while indexing valid symmetrical strings for inverted search.",
    analogyTitle: "Duplicate Tag Detector + Inverted Palindrome Index",
    analogyText:
      "Scan `(tag, raw_phrase)` once: flag the first `tag` already in `seen_tags`, strip `raw_phrase` to lowercase alphanumeric characters, and if it equals its reverse, add `tag` into the inverted index.",
    cheatSheet: `clean = "".join(c.lower() for c in raw_phrase if c.isalnum())
if clean == clean[::-1]:
    index.setdefault(clean, set()).add(tag)`,
    commonPitfall: {
      title: "Skipping non-palindromes BEFORE checking duplicate tags",
      wrongCode:
        "if clean != clean[::-1]: continue\nif tag in seen: ...  # Misses duplicate tag on non-palindrome entries!",
      rightCode:
        "Check `tag in seen_tags` for EVERY tuple in input order before palindrome filtering.",
      explanation:
        "Duplicate tag detection inspects all entries in input order, whereas the inverted index stores only valid palindromes.",
    },
    solutionCode: `def audit_palindromic_tags(items):
    seen_tags = set()
    first_dup = None
    index_sets = {}
    for tag, raw_phrase in items:
        if tag in seen_tags and first_dup is None:
            first_dup = tag
        seen_tags.add(tag)

        clean = "".join(ch.lower() for ch in raw_phrase if ch.isalnum())
        if clean == clean[::-1]:
            if clean not in index_sets:
                index_sets[clean] = set()
            index_sets[clean].add(tag)

    index = {k: sorted(v) for k, v in index_sets.items()}
    return (first_dup, index)`,
    proInsights: {
      timeComplexity: "O(n * m)",
      spaceComplexity: "O(n * m)",
      tradeoff:
        "Grouping into sets during the scan ensures uniqueness before emitting sorted lists at the end.",
    },
    quiz: {
      question:
        "Why normalize phrases with `c.lower()` and `c.isalnum()` before checking symmetry?",
      options: [
        "So spaces, punctuation, and capitalization don't break palindromes like 'Race car!'",
        "To reverse the list order in-place",
        "Because Python strings are immutable",
      ],
      correctIndex: 0,
      explanation:
        "Cleaning non-alphanumeric characters and casing reduces `'Race car!'` to `'racecar'`.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 106,
    matchKeywords: ["algo suite", "stream profit", "run_algo_suite"],
    realWorldUse:
      "Benchmarks three foundational interview patterns used in calendar scheduling, stock trading, and real-time analytics.",
    analogyTitle: "Three Classics in One Engine",
    analogyText:
      "1) Sort intervals and merge touching/overlapping `[s, e]`. 2) Track running `min_price` for greedy max profit. 3) Count events and sort by `(-count, name)[:k]`.",
    cheatSheet: `windows.sort(key=lambda w: w[0])
# Merge when start <= merged[-1][1]`,
    commonPitfall: {
      title: "Treating touching intervals `[1, 4]` and `[4, 5]` as non-overlapping",
      wrongCode:
        "if start < merged[-1][1]:  # Leaves [1, 4] and [4, 5] separate!",
      rightCode:
        "if start <= merged[-1][1]:\n    merged[-1][1] = max(merged[-1][1], end)",
      explanation:
        "Using `<=` merges intervals that share a boundary point (`4`).",
    },
    solutionCode: `def run_algo_suite(windows, prices, events, k):
    merged = []
    for start, end in sorted(windows, key=lambda w: (w[0], w[1])):
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            if end > merged[-1][1]:
                merged[-1][1] = end

    min_price = float("inf")
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price

    counts = {}
    for ev in events:
        counts[ev] = counts.get(ev, 0) + 1
    top_k = sorted(counts.keys(), key=lambda key: (-counts[key], key))[:k]

    return {
        "intervals": merged,
        "max_profit": max_profit,
        "top_k": top_k,
    }`,
    proInsights: {
      timeComplexity: "O(w log w + p + e log e)",
      spaceComplexity: "O(w + e)",
      tradeoff:
        "Sorts only unique event keys for Top-K while merging intervals and scanning profit in clean single passes.",
    },
    quiz: {
      question:
        "In the greedy stock profit pass, what happens if prices only go down `[9, 5, 2]`?",
      options: [
        "`min_price` updates every step and `max_profit` stays `0`",
        "`max_profit` becomes `-3`",
        "It raises an IndexError",
      ],
      correctIndex: 0,
      explanation:
        "Because selling before buying isn't allowed, initialized `max_profit = 0` safely floors losses at zero.",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 107,
    matchKeywords: ["mission planner", "plan_mission_cost"],
    realWorldUse:
      "Combines unweighted shortest pathing with discrete knapsack/coin cost minimization in game pathing and route pricing.",
    analogyTitle: "BFS Distance -> DP Token Optimizer",
    analogyText:
      "Step 1 uses BFS to measure the exact minimum `hops` from `start` to `target`. Step 2 solves Minimum Coin Change for target sum `hops` using `step_costs`.",
    cheatSheet: `hops = shortest_bfs(graph, start, target)
if hops == -1: return -1`,
    commonPitfall: {
      title: "Running DP table creation when hops == -1",
      wrongCode: "dp = [hops + 1] * (hops + 1)  # Empty list when hops == -1 -> IndexError!",
      rightCode: "if hops == -1: return -1  # Check reachability before allocating DP",
      explanation:
        "Return `-1` immediately on unreachable targets before building the DP array.",
    },
    solutionCode: `from collections import deque

def plan_mission_cost(graph, start, target, step_costs):
    if start not in graph:
        return -1
    hops = -1
    if start == target:
        hops = 0
    else:
        q = deque([(start, 0)])
        visited = {start}
        while q:
            node, d = q.popleft()
            if node == target:
                hops = d
                break
            for nbr in graph.get(node, []):
                if nbr not in visited:
                    visited.add(nbr)
                    q.append((nbr, d + 1))
    if hops == -1:
        return -1
    dp = [hops + 1] * (hops + 1)
    dp[0] = 0
    for a in range(1, hops + 1):
        for c in step_costs:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[hops] if dp[hops] <= hops else -1`,
    proInsights: {
      timeComplexity: "O(V + E + V * C)",
      spaceComplexity: "O(V)",
      tradeoff:
        "Separates unweighted graph exploration from 1D DP minimization cleanly.",
    },
    quiz: {
      question:
        "Why compute `hops` with BFS before running the DP coin-change step?",
      options: [
        "Because minimum coin count depends directly on the shortest hop distance `hops`",
        "Because DP only runs on string keys",
        "Because BFS removes cycles from `step_costs`",
      ],
      correctIndex: 0,
      explanation:
        "The shortest unweighted path gives the exact target amount `hops` needed by the DP stage.",
    },
  },

  // =========================================================================
  // SYSTEM DESIGN RECAPS (101 - 106)
  // =========================================================================
  {
    matchTrack: "system_design",
    matchOrder: 101,
    matchKeywords: ["sharded gateway", "route_edge_request"],
    realWorldUse:
      "Matches API gateway request ordering: edge throttle first -> Redis cache lookup -> database shard routing.",
    analogyTitle: "Bouncer -> VIP Desk -> Partition Hall",
    analogyText:
      "Always check the rate limiter BEFORE doing cache/DB work (`used_reqs >= limit` -> 429). Next hit cache (`200, 'CACHE'`), and only on a miss route via `user_id % num_shards`.",
    cheatSheet: `if used_reqs >= limit:
    return (429, None, None)
if user_id in cache:
    return (200, "CACHE", cache[user_id])
return (200, "ORIGIN", f"shard-{user_id % num_shards}")`,
    commonPitfall: {
      title: "Checking cache hit before enforcing rate limit",
      wrongCode:
        "if user_id in cache: return (200, ...)  # Lets throttled floods read cache forever!",
      rightCode:
        "if used_reqs >= limit: return (429, None, None)",
      explanation:
        "Rate limiting protects all downstream layers, so throttle checks run at the very front of the pipeline.",
    },
    solutionCode: `def route_edge_request(user_id, num_shards, used_reqs, limit, cache):
    if used_reqs >= limit:
        return (429, None, None)
    if user_id in cache:
        return (200, "CACHE", cache[user_id])
    shard = user_id % num_shards
    return (200, "ORIGIN", f"shard-{shard}")`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Ordering Rate Limit -> Cache -> Origin short-circuits excess traffic early and reserves shard capacity for genuine cache misses.",
    },
    quiz: {
      question:
        "Which stage should execute first inside an edge API gateway?",
      options: [
        "Rate limit check (HTTP 429 guard)",
        "Origin shard computation",
        "Database write",
      ],
      correctIndex: 0,
      explanation:
        "Rejecting over-quota callers before cache/origin lookups keeps downstream services safe during traffic spikes.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 102,
    matchKeywords: ["quorum & circuit breaker", "commit_with_breaker"],
    realWorldUse:
      "Prevents cascading storage outages in distributed consensus engines (like Raft/Dynamo writes) when failure rates spike.",
    analogyTitle: "Fuse Box + Majority Vote",
    analogyText:
      "First inspect the fuse (`recent_failures >= failure_threshold` -> `(False, 'CIRCUIT_OPEN')`). Only if healthy, count `True` replica ACKs and require `len(replica_acks) // 2 + 1`.",
    cheatSheet: `if recent_failures >= failure_threshold:
    return (False, "CIRCUIT_OPEN")
needed = (len(replica_acks) // 2) + 1`,
    commonPitfall: {
      title: "Requiring >= half instead of strict majority quorum",
      wrongCode:
        "needed = len(replica_acks) // 2  # Split-brain risk on 2 out of 4 nodes!",
      rightCode: "needed = (len(replica_acks) // 2) + 1",
      explanation:
        "A strict majority `(N // 2) + 1` ensures any two write/read quorums overlap by at least one replica.",
    },
    solutionCode: `def commit_with_breaker(recent_failures, failure_threshold, replica_acks):
    if recent_failures >= failure_threshold:
        return (False, "CIRCUIT_OPEN")
    if not replica_acks:
        return (False, "QUORUM_FAILED")
    needed = (len(replica_acks) // 2) + 1
    acks = sum(1 for ack in replica_acks if ack)
    if acks >= needed:
        return (True, "COMMITTED")
    return (False, "QUORUM_FAILED")`,
    proInsights: {
      timeComplexity: "O(r)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Fast-failing on `CIRCUIT_OPEN` avoids waiting on slow replica RPC timeouts during regional degradation.",
    },
    quiz: {
      question: "For 5 replicas, what is the minimum majority quorum count?",
      options: ["3", "2", "5"],
      correctIndex: 0,
      explanation: "`(5 // 2) + 1 = 3` guarantees strict majority agreement.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 103,
    matchKeywords: ["resilient retry", "dlq", "dispatch_resilient_job"],
    realWorldUse:
      "Standard job-worker architecture combining multi-region health failover, capped exponential backoff, and dead-letter queues.",
    analogyTitle: "Failover First -> Backoff Retry -> Dead-Letter Safe",
    analogyText:
      "Pick the lowest-latency healthy edge first. If every edge is down, send to `'DLQ'` when `attempt >= max_attempts`, otherwise wait `min(max_ms, base_ms * (2 ** attempt))`.",
    cheatSheet: `healthy = [e for e in edges if e["healthy"]]
if healthy:
    best = min(healthy, key=lambda e: e["latency"])
    return ("SENT", best["name"])`,
    commonPitfall: {
      title: "Allowing unbounded exponential backoff past max_ms",
      wrongCode:
        "wait_ms = base_ms * (2 ** attempt)  # Can explode to hours without capping!",
      rightCode: "wait_ms = min(max_ms, base_ms * (2 ** attempt))",
      explanation:
        "Capping with `min(max_ms, ...)` keeps retry schedules bounded and predictable.",
    },
    solutionCode: `def dispatch_resilient_job(edges, attempt, max_attempts, base_ms, max_ms):
    healthy = [edge for edge in edges if edge.get("healthy")]
    if healthy:
        best = min(healthy, key=lambda edge: edge["latency"])
        return ("SENT", best["name"])
    if attempt >= max_attempts:
        return ("DLQ", 0)
    wait_ms = min(max_ms, base_ms * (2 ** attempt))
    return ("RETRY", wait_ms)`,
    proInsights: {
      timeComplexity: "O(e)",
      spaceComplexity: "O(e)",
      tradeoff:
        "Routing to healthy backups beats waiting on retries, while capping backoff + DLQ escalation prevents poison pills from wedging workers.",
    },
    quiz: {
      question:
        "Why route unrecoverable jobs to a Dead-Letter Queue (`DLQ`) after `max_attempts`?",
      options: [
        "To isolate poison jobs for inspection instead of blocking healthy queue traffic forever",
        "To lower network latency for healthy edges",
        "To double `base_ms` every minute indefinitely",
      ],
      correctIndex: 0,
      explanation:
        "Quarantining repeatedly failing jobs in a DLQ preserves queue throughput for healthy jobs.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 104,
    matchKeywords: ["canary rollout", "flap-guarded", "evaluate_service_controller"],
    realWorldUse:
      "Mirrors Kubernetes/Prometheus production controllers combining sustained-breach alerts, kill-switched canary flags, and queue autoscaling.",
    analogyTitle: "3-Breach Alert + Feature Switch + Ceiling Workers",
    analogyText:
      "Alert fires only if the LAST `3` samples all exceed `cpu_limit`. Canary stays off if `kill_switch` is True, otherwise `user_bucket < rollout_pct`. Workers use integer ceiling division `(depth + cap - 1) // cap`.",
    cheatSheet: `alert_firing = len(cpu_samples) >= 3 and all(s >= cpu_limit for s in cpu_samples[-3:])
canary_on = (not kill_switch) and (user_bucket < rollout_pct)`,
    commonPitfall: {
      title: "Checking ANY 3 samples instead of the trailing 3 consecutive samples",
      wrongCode:
        "sum(1 for s in cpu_samples if s >= cpu_limit) >= 3  # Fires even after CPU recovered!",
      rightCode:
        "len(cpu_samples) >= 3 and all(s >= cpu_limit for s in cpu_samples[-3:])",
      explanation:
        "Checking `cpu_samples[-3:]` guards against single-spike flapping while clearing immediately once metrics recover.",
    },
    solutionCode: `def evaluate_service_controller(
    cpu_samples,
    cpu_limit,
    user_bucket,
    rollout_pct,
    kill_switch,
    queue_depth,
    capacity_per_worker,
):
    alert_firing = len(cpu_samples) >= 3 and all(
        sample >= cpu_limit for sample in cpu_samples[-3:]
    )
    canary_on = (not kill_switch) and (user_bucket < rollout_pct)
    if queue_depth <= 0:
        workers_needed = 0
    else:
        workers_needed = (queue_depth + capacity_per_worker - 1) // capacity_per_worker
    return (alert_firing, canary_on, workers_needed)`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Inspecting only the last 3 trailing telemetry samples prevents alert fatigue during transient CPU spikes without extra memory.",
    },
    quiz: {
      question:
        "Why does the autoscaler return `0` when `queue_depth <= 0` instead of `max(1, ...)`?",
      options: [
        "Idle queues shouldn't keep workers provisioned unnecessarily when scale-to-zero is allowed",
        "Integer division throws ZeroDivisionError when `queue_depth` is `0`",
        "Canary rollouts require zero workers",
      ],
      correctIndex: 0,
      explanation:
        "Handling `queue_depth <= 0` explicitly scales idle worker pools down cleanly to `0`.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 105,
    matchKeywords: ["auth-guarded cache-aside", "serve_paginated_feed"],
    realWorldUse:
      "Core REST/GraphQL backend endpoint flow combining JWT expiration checks, Redis cache-aside hydration, and pagination.",
    analogyTitle: "Gatekeeper -> Cache Read/Fill -> Window Slice",
    analogyText:
      "Reject expired tokens (`now_ts >= token_expires_at` -> 401), read `cache.get(cache_key)` or populate it from `db_records`, then slice `[cursor : cursor + page_size]`.",
    cheatSheet: `if now_ts >= token_expires_at:
    return {"status": 401, "items": [], "has_more": False}
records = cache[cache_key] if cache_key in cache else db_records`,
    commonPitfall: {
      title: "Using `>` instead of `>=` on exact token expiry timestamp",
      wrongCode:
        "if now_ts > token_expires_at:  # Still lets expired token pass at exact boundary!",
      rightCode: "if now_ts >= token_expires_at:",
      explanation:
        "Tokens expire *at* `token_expires_at` (`now_ts >= token_expires_at`).",
    },
    solutionCode: `def serve_paginated_feed(
    token_expires_at,
    now_ts,
    cache_key,
    cache,
    db_records,
    cursor,
    page_size,
):
    if now_ts >= token_expires_at:
        return {"status": 401, "items": [], "has_more": False}

    if cache_key in cache:
        records = cache[cache_key]
    else:
        records = db_records if db_records is not None else []
        if db_records is not None:
            cache[cache_key] = db_records

    page = records[cursor : cursor + page_size]
    has_more = (cursor + page_size) < len(records)
    return {"status": 200, "items": page, "has_more": has_more}`,
    proInsights: {
      timeComplexity: "O(page_size)",
      spaceComplexity: "O(page_size)",
      tradeoff:
        "Warming the cache only after auth succeeds avoids exposing or caching unauthorized queries.",
    },
    quiz: {
      question:
        "If `records` has 3 items, `cursor = 0`, and `page_size = 3`, what should `has_more` be?",
      options: ["False", "True", "None"],
      correctIndex: 0,
      explanation:
        "`0 + 3 < 3` is `False` because the last item was already included on this page.",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 106,
    matchKeywords: ["multi-tenant cloud kernel", "process_kernel_request"],
    realWorldUse:
      "Unites three pillars of distributed infrastructure in one kernel path: sliding-window throttling, TTL caching, and consistent hash rings.",
    analogyTitle: "Throttle Window -> TTL Cache -> Clockwise Ring Fallback",
    analogyText:
      "First prune `window_log` to `t > now_ts - window_sec`; if `len(active_log) >= max_reqs`, return `(False, 'RATE_LIMIT', active_log)`. Next check `ttl_cache.get(key)` and ensure `now_ts < expires_at`. On miss/expired, walk sorted `ring_nodes` clockwise (wrap to node 0) and return `'MISS:<node>'`.",
    cheatSheet: `active_log = [t for t in window_log if t > now_ts - window_sec]
if len(active_log) >= max_reqs:
    return (False, "RATE_LIMIT", active_log)`,
    commonPitfall: {
      title: "Forgetting to sort ring_nodes or wrap around to node 0",
      wrongCode:
        "for pos, node in ring_nodes:\n    if pos >= key_hash: return node  # Fails when key_hash > max node!",
      rightCode:
        "ring_sorted = sorted(ring_nodes)\n# Wrap around to ring_sorted[0][1] when no pos >= key_hash",
      explanation:
        "Consistent hash rings are circular: keys hashed past the largest node ID always wrap clockwise to the first ring node.",
    },
    solutionCode: `def process_kernel_request(
    now_ts,
    window_log,
    window_sec,
    max_reqs,
    ttl_cache,
    key,
    ring_nodes,
    key_hash,
):
    active_log = [t for t in window_log if t > now_ts - window_sec]
    if len(active_log) >= max_reqs:
        return (False, "RATE_LIMIT", active_log)

    next_log = active_log + [now_ts]
    entry = ttl_cache.get(key)
    if entry is not None:
        val, expires_at = entry
        if now_ts < expires_at:
            return (True, val, next_log)

    ring_sorted = sorted(ring_nodes, key=lambda item: item[0])
    chosen = ring_sorted[0][1]
    for pos, node_name in ring_sorted:
        if pos >= key_hash:
            chosen = node_name
            break
    return (True, f"MISS:{chosen}", next_log)`,
    proInsights: {
      timeComplexity: "O(w + n log n)",
      spaceComplexity: "O(w + n)",
      tradeoff:
        "Sorting ring nodes ensures deterministic clockwise routing, while pruning stale timestamps keeps sliding-window memory bounded.",
    },
    quiz: {
      question:
        "When a key's hash (`75`) is greater than every node position on the ring (`[10, 50]`), which node handles the miss?",
      options: [
        "The smallest-position node (`10` -> `n1`) via ring wrap-around",
        "None — it raises a routing error",
        "Every node simultaneously",
      ],
      correctIndex: 0,
      explanation:
        "Because a hash ring wraps 360° back to 0, hashes past the highest node land on the lowest-positioned node.",
    },
  },
];
