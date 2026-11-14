import { PracticeChallenge } from "../../types/lesson";

/**
 * Maps each `python_basics` lesson_order (1..24) to its additional progressive
 * Practice Challenges (1 extra for 2-stage Easy concepts, 2 extra for 3-stage
 * Medium concepts, 3 extra for 4-stage Harder/Project concepts = 72 total challenges!).
 *
 * Per curriculum design: Practice Challenges omit deep conceptual lectures and focus
 * strictly on a crisp Mission Brief, Input/Output examples, and Clues if needed.
 */
export const PYTHON_BASICS_PRACTICE_DRILLS: Record<
  number,
  PracticeChallenge[]
> = {
  // =========================================================================
  // LESSON 01: Variables & Data Types (Easy -> 2 Total Stages: Core + 1 Drill)
  // =========================================================================
  1: [
    {
      id: "py-01-d2",
      title: "Practice 2/2: Arcade Coin Wallet Swap",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `update_wallet(player_tag, starting_coins, spent_coins)`: subtract `spent_coins` from `starting_coins` to get `remaining`, check if `has_coins = remaining > 0`, and return `(player_tag, remaining, has_coins)`.",
      constraints: [
        "Compute `remaining = starting_coins - spent_coins`",
        "Compute `has_coins = remaining > 0` (boolean True/False)",
        "Return the tuple `(player_tag, remaining, has_coins)`",
      ],
      examples: [
        {
          input: 'player_tag = "Nova", starting_coins = 50, spent_coins = 20',
          output: "('Nova', 30, True)",
        },
      ],
      initial_code: `def update_wallet(player_tag, starting_coins, spent_coins):
    # Subtract spent_coins from starting_coins and return (player_tag, remaining, remaining > 0)
    pass

print(update_wallet("Nova", 50, 20))`,
      expected_output: "('Nova', 30, True)",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = update_wallet("Nova", 50, 20)
    results.append({"id": 1, "input": "'Nova', 50, 20", "expected": "('Nova', 30, True)", "actual": str(r1), "passed": r1 == ("Nova", 30, True)})
    r2 = update_wallet("Kai", 15, 15)
    results.append({"id": 2, "input": "'Kai', 15, 15", "expected": "('Kai', 0, False)", "actual": str(r2), "passed": r2 == ("Kai", 0, False)})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Calculate `remaining = starting_coins - spent_coins`.",
        "Return `(player_tag, remaining, remaining > 0)`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 02: Lists & Loops (Harder Core -> 4 Total Stages: Core + 3 Drills)
  // =========================================================================
  2: [
    {
      id: "py-02-d2",
      title: "Practice 2/4: Count Even Energy Cells",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `count_even_cells(cells)`: loop through each integer `c` in `cells`, check if it is even (`c % 2 == 0`), and return how many even numbers were found.",
      constraints: [
        "Start a counter `count = 0` before the `for` loop",
        "Increment `count += 1` whenever `c % 2 == 0`",
        "Return `count` after the loop finishes",
      ],
      examples: [
        {
          input: "cells = [4, 7, 10, 3, 8]",
          output: "3",
        },
      ],
      initial_code: `def count_even_cells(cells):
    count = 0
    # Loop over cells and increment count when c % 2 == 0
    return count

print(count_even_cells([4, 7, 10, 3, 8]))`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = count_even_cells([4, 7, 10, 3, 8])
    results.append({"id": 1, "input": "[4, 7, 10, 3, 8]", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = count_even_cells([1, 3, 5])
    results.append({"id": 2, "input": "[1, 3, 5]", "expected": "0", "actual": str(r2), "passed": r2 == 0})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `for c in cells:` and inside it check `if c % 2 == 0:`.",
        "Indent `count += 1` inside the `if` block.",
      ],
    },
    {
      id: "py-02-d3",
      title: "Practice 3/4: Build Boosted Speed List",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `boost_speeds(speeds, bonus)`: create an empty list `boosted = []`, loop through `s` in `speeds`, append `s + bonus` to `boosted`, and return `boosted`.",
      constraints: [
        "Loop over every speed `s` in `speeds`",
        "Use `boosted.append(s + bonus)` on each iteration",
        "Return the new `boosted` list",
      ],
      examples: [
        {
          input: "speeds = [100, 120, 90], bonus = 15",
          output: "[115, 135, 105]",
        },
      ],
      initial_code: `def boost_speeds(speeds, bonus):
    boosted = []
    # Append s + bonus for each s in speeds
    return boosted

print(boost_speeds([100, 120, 90], 15))`,
      expected_output: "[115, 135, 105]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = boost_speeds([100, 120, 90], 15)
    results.append({"id": 1, "input": "[100, 120, 90], 15", "expected": "[115, 135, 105]", "actual": str(r1), "passed": r1 == [115, 135, 105]})
    r2 = boost_speeds([10, 20], 5)
    results.append({"id": 2, "input": "[10, 20], 5", "expected": "[15, 25]", "actual": str(r2), "passed": r2 == [15, 25]})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `for s in speeds:` and inside the loop call `boosted.append(s + bonus)`.",
      ],
    },
    {
      id: "py-02-d4",
      title: "Practice 4/4: Boss Damage Peak Finder",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `sum_heavy_hits(hits)`: loop through `hits` and sum ONLY the hits that are strictly greater than `50` (`h > 50`). Return the total.",
      constraints: [
        "Ignore any hit `<= 50`",
        "Add hits where `h > 50` into `total` and return `total`",
      ],
      examples: [
        {
          input: "hits = [25, 60, 40, 80, 50]",
          output: "140",
        },
      ],
      initial_code: `def sum_heavy_hits(hits):
    # Sum only the numbers in hits that are strictly > 50
    pass

print(sum_heavy_hits([25, 60, 40, 80, 50]))`,
      expected_output: "140",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = sum_heavy_hits([25, 60, 40, 80, 50])
    results.append({"id": 1, "input": "[25, 60, 40, 80, 50]", "expected": "140", "actual": str(r1), "passed": r1 == 140})
    r2 = sum_heavy_hits([10, 20, 50])
    results.append({"id": 2, "input": "[10, 20, 50]", "expected": "0", "actual": str(r2), "passed": r2 == 0})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Initialize `total = 0`, loop `for h in hits:`, and check `if h > 50: total += h`.",
        "Return `total` at the end of the function.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 03: Conditionals if / elif / else (Medium -> 3 Total Stages)
  // =========================================================================
  3: [
    {
      id: "py-03-d2",
      title: "Practice 2/3: Server Latency Alert",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `check_latency(ms)`: return `"CRITICAL"` if `ms > 500`, `"WARNING"` if `ms > 200`, or `"HEALTHY"` otherwise.',
      constraints: [
        'Return `"CRITICAL"` when `ms > 500`',
        'Return `"WARNING"` when `ms > 200` (and `<= 500`)',
        'Return `"HEALTHY"` for `200` or below',
      ],
      examples: [
        {
          input: "ms = 320",
          output: "WARNING",
        },
      ],
      initial_code: `def check_latency(ms):
    # Return "CRITICAL" (> 500), "WARNING" (> 200), or "HEALTHY"
    pass

print(check_latency(320))`,
      expected_output: "WARNING",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = check_latency(320)
    results.append({"id": 1, "input": "320", "expected": "WARNING", "actual": str(r1), "passed": r1 == "WARNING"})
    r2 = check_latency(600)
    results.append({"id": 2, "input": "600", "expected": "CRITICAL", "actual": str(r2), "passed": r2 == "CRITICAL"})
    r3 = check_latency(120)
    results.append({"id": 3, "input": "120", "expected": "HEALTHY", "actual": str(r3), "passed": r3 == "HEALTHY"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Test `if ms > 500:` first, then `elif ms > 200:`, then `else:`.",
      ],
    },
    {
      id: "py-03-d3",
      title: "Practice 3/3: Boss Raid Entry Gate",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `can_enter_raid(level, has_key)`: return `"ENTER"` if `level >= 10` AND `has_key` is `True`. If `level < 10`, return `"LOW_LEVEL"`. Otherwise return `"MISSING_KEY"`.',
      constraints: [
        'If `level < 10`, return `"LOW_LEVEL"`',
        'Elif `not has_key`, return `"MISSING_KEY"`',
        'Else return `"ENTER"`',
      ],
      examples: [
        {
          input: "level = 12, has_key = False",
          output: "MISSING_KEY",
        },
      ],
      initial_code: `def can_enter_raid(level, has_key):
    # Check level and has_key conditions
    pass

print(can_enter_raid(12, False))`,
      expected_output: "MISSING_KEY",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = can_enter_raid(12, False)
    results.append({"id": 1, "input": "12, False", "expected": "MISSING_KEY", "actual": str(r1), "passed": r1 == "MISSING_KEY"})
    r2 = can_enter_raid(15, True)
    results.append({"id": 2, "input": "15, True", "expected": "ENTER", "actual": str(r2), "passed": r2 == "ENTER"})
    r3 = can_enter_raid(5, True)
    results.append({"id": 3, "input": "5, True", "expected": "LOW_LEVEL", "actual": str(r3), "passed": r3 == "LOW_LEVEL"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Check `if level < 10: return "LOW_LEVEL"`, then `elif not has_key: return "MISSING_KEY"`, else `return "ENTER"`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 04: Functions & Return (Harder Core -> 4 Total Stages)
  // =========================================================================
  4: [
    {
      id: "py-04-d2",
      title: "Practice 2/4:Mana Potion Restorer",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `restore_mana(current_mana, potion_amount)`: add `current_mana + potion_amount`, but cap the maximum possible result at `100` using `min(..., 100)`. Return the result.",
      constraints: [
        "Add `current_mana + potion_amount`",
        "Cap at `100` using `min(current_mana + potion_amount, 100)`",
        "Return the capped integer",
      ],
      examples: [
        {
          input: "current_mana = 85, potion_amount = 30",
          output: "100",
        },
      ],
      initial_code: `def restore_mana(current_mana, potion_amount):
    # Add potion_amount to current_mana, capped at 100 max
    pass

print(restore_mana(85, 30))`,
      expected_output: "100",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = restore_mana(85, 30)
    results.append({"id": 1, "input": "85, 30", "expected": "100", "actual": str(r1), "passed": r1 == 100})
    r2 = restore_mana(40, 25)
    results.append({"id": 2, "input": "40, 25", "expected": "65", "actual": str(r2), "passed": r2 == 65})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `return min(current_mana + potion_amount, 100)`.",
      ],
    },
    {
      id: "py-04-d3",
      title: "Practice 3/4: Subscription Discount Price",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `apply_discount(price, discount_pct)`: subtract `price * (discount_pct / 100)` from `price` and return the final discounted price.",
      constraints: [
        "Calculate discount amount: `price * (discount_pct / 100)`",
        "Return `price - discount_amount`",
      ],
      examples: [
        {
          input: "price = 200, discount_pct = 15",
          output: "170.0",
        },
      ],
      initial_code: `def apply_discount(price, discount_pct):
    # Return price after subtracting discount_pct percent
    pass

print(apply_discount(200, 15))`,
      expected_output: "170.0",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = apply_discount(200, 15)
    results.append({"id": 1, "input": "200, 15", "expected": "170.0", "actual": str(r1), "passed": r1 == 170.0})
    r2 = apply_discount(50, 20)
    results.append({"id": 2, "input": "50, 20", "expected": "40.0", "actual": str(r2), "passed": r2 == 40.0})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return price - (price * discount_pct / 100)`.",
      ],
    },
    {
      id: "py-04-d4",
      title: "Practice 4/4: Two-Function XP Pipeline",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Write body logic for `base_xp(kills)` (returns `kills * 50`) AND `total_match_xp(kills, won_match)` (calls `base_xp(kills)` and adds `100` if `won_match` is `True`, else adds `0`).",
      constraints: [
        "`base_xp(kills)` returns `kills * 50`",
        "`total_match_xp(kills, won_match)` calls `base_xp(kills)` and adds `100` when `won_match` is True",
      ],
      examples: [
        {
          input: "kills = 4, won_match = True",
          output: "300",
        },
      ],
      initial_code: `def base_xp(kills):
    # Return kills * 50
    pass

def total_match_xp(kills, won_match):
    # Call base_xp(kills) and add 100 if won_match is True
    pass

print(total_match_xp(4, True))`,
      expected_output: "300",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = total_match_xp(4, True)
    results.append({"id": 1, "input": "4, True", "expected": "300", "actual": str(r1), "passed": r1 == 300})
    r2 = total_match_xp(3, False)
    results.append({"id": 2, "input": "3, False", "expected": "150", "actual": str(r2), "passed": r2 == 150})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "In `base_xp`, write `return kills * 50`.",
        "In `total_match_xp`, write `return base_xp(kills) + (100 if won_match else 0)`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 05: Dictionaries (Medium -> 3 Total Stages)
  // =========================================================================
  5: [
    {
      id: "py-05-d2",
      title: "Practice 2/3: Inventory Potion Restock",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `restock_potions(inventory, added)`: add `added` to `inventory["potions"]`, set `inventory["full"] = inventory["potions"] >= 10`, and return `inventory`.',
      constraints: [
        'Increase `inventory["potions"]` by `added`',
        'Set `inventory["full"]` to `True` if `inventory["potions"] >= 10` else `False`',
        "Return `inventory`",
      ],
      examples: [
        {
          input: 'inventory = {"potions": 7}, added = 5',
          output: "{'potions': 12, 'full': True}",
        },
      ],
      initial_code: `def restock_potions(inventory, added):
    # Update "potions" and set "full" boolean key
    return inventory

print(restock_potions({"potions": 7}, 5))`,
      expected_output: "{'potions': 12, 'full': True}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = restock_potions({"potions": 7}, 5)
    results.append({"id": 1, "input": "{'potions': 7}, 5", "expected": "{'potions': 12, 'full': True}", "actual": str(r1), "passed": r1 == {"potions": 12, "full": True}})
    r2 = restock_potions({"potions": 2}, 3)
    results.append({"id": 2, "input": "{'potions': 2}, 3", "expected": "{'potions': 5, 'full': False}", "actual": str(r2), "passed": r2 == {"potions": 5, "full": False}})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `inventory["potions"] += added`, then `inventory["full"] = inventory["potions"] >= 10`.',
      ],
    },
    {
      id: "py-05-d3",
      title: "Practice 3/3: Build Server Status Dict",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `make_server_card(host, port, active)`: build and return a new dictionary with keys `"endpoint"` (formatted as `f"{host}:{port}"`) and `"online"` (set to `active`).',
      constraints: [
        'Set `"endpoint"` to `f"{host}:{port}"`',
        'Set `"online"` to `active`',
        "Return the dictionary",
      ],
      examples: [
        {
          input: 'host = "api.dev", port = 8080, active = True',
          output: "{'endpoint': 'api.dev:8080', 'online': True}",
        },
      ],
      initial_code: `def make_server_card(host, port, active):
    # Build and return {"endpoint": f"{host}:{port}", "online": active}
    pass

print(make_server_card("api.dev", 8080, True))`,
      expected_output: "{'endpoint': 'api.dev:8080', 'online': True}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = make_server_card("api.dev", 8080, True)
    results.append({"id": 1, "input": "'api.dev', 8080, True", "expected": "{'endpoint': 'api.dev:8080', 'online': True}", "actual": str(r1), "passed": r1 == {"endpoint": "api.dev:8080", "online": True}})
    r2 = make_server_card("db.local", 5432, False)
    results.append({"id": 2, "input": "'db.local', 5432, False", "expected": "{'endpoint': 'db.local:5432', 'online': False}", "actual": str(r2), "passed": r2 == {"endpoint": "db.local:5432", "online": False}})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Return `{"endpoint": f"{host}:{port}", "online": active}`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 06: String Cleaning .strip() & .lower() (Medium -> 3 Total Stages)
  // =========================================================================
  6: [
    {
      id: "py-06-d2",
      title: "Practice 2/3: Coupon Code Standardizer",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `clean_coupon(raw_code)`: remove leading/trailing whitespace with `.strip()` and convert all letters to UPPERCASE using `.upper()`. Return the cleaned coupon.",
      constraints: [
        "Use `.strip()` to remove outer spaces",
        "Use `.upper()` to convert the code to uppercase",
        "Return the resulting string",
      ],
      examples: [
        {
          input: 'raw_code = "   save20now  "',
          output: "SAVE20NOW",
        },
      ],
      initial_code: `def clean_coupon(raw_code):
    # Strip spaces and convert raw_code to UPPERCASE
    pass

print(clean_coupon("   save20now  "))`,
      expected_output: "SAVE20NOW",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = clean_coupon("   save20now  ")
    results.append({"id": 1, "input": "'   save20now  '", "expected": "SAVE20NOW", "actual": str(r1), "passed": r1 == "SAVE20NOW"})
    r2 = clean_coupon(" pro_pass ")
    results.append({"id": 2, "input": "' pro_pass '", "expected": "PRO_PASS", "actual": str(r2), "passed": r2 == "PRO_PASS"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Chain `.strip().upper()` on `raw_code` and return it.",
      ],
    },
    {
      id: "py-06-d3",
      title: "Practice 3/3: Case-Insensitive Email Match",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `emails_match(input_email, saved_email)`: strip spaces and lowercase BOTH strings, then return `True` if they are equal (`==`), or `False` otherwise.",
      constraints: [
        "Normalize `input_email` with `.strip().lower()`",
        "Normalize `saved_email` with `.strip().lower()`",
        "Return whether the two cleaned strings are equal",
      ],
      examples: [
        {
          input: 'input_email = "  Aria@Dev.io ", saved_email = "aria@dev.io"',
          output: "True",
        },
      ],
      initial_code: `def emails_match(input_email, saved_email):
    # Return True if both emails match after .strip().lower()
    pass

print(emails_match("  Aria@Dev.io ", "aria@dev.io"))`,
      expected_output: "True",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = emails_match("  Aria@Dev.io ", "aria@dev.io")
    results.append({"id": 1, "input": "'  Aria@Dev.io ', 'aria@dev.io'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = emails_match("kai@dev.io", "nova@dev.io")
    results.append({"id": 2, "input": "'kai@dev.io', 'nova@dev.io'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Compare `input_email.strip().lower() == saved_email.strip().lower()`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 07: Filtering Lists (Harder Core -> 4 Total Stages)
  // =========================================================================
  7: [
    {
      id: "py-07-d2",
      title: "Practice 2/4: Filter VIP User Tags",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `keep_vip_tags(tags)`: return a new list containing only the strings in `tags` whose length is at least 5 characters (`len(t) >= 5`).',
      constraints: [
        "Check `len(t) >= 5` for each tag `t` in `tags`",
        "Return the filtered list in original order",
      ],
      examples: [
        {
          input: 'tags = ["pro", "architect", "dev", "coder"]',
          output: "['architect', 'coder']",
        },
      ],
      initial_code: `def keep_vip_tags(tags):
    # Return only tags with len(t) >= 5
    pass

print(keep_vip_tags(["pro", "architect", "dev", "coder"]))`,
      expected_output: "['architect', 'coder']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = keep_vip_tags(["pro", "architect", "dev", "coder"])
    results.append({"id": 1, "input": "['pro', 'architect', 'dev', 'coder']", "expected": "['architect', 'coder']", "actual": str(r1), "passed": r1 == ["architect", "coder"]})
    r2 = keep_vip_tags(["hi", "yo"])
    results.append({"id": 2, "input": "['hi', 'yo']", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Loop `for t in tags:` and append `t` when `len(t) >= 5` (or use `[t for t in tags if len(t) >= 5]`).",
      ],
    },
    {
      id: "py-07-d3",
      title: "Practice 3/4: Budget Price Range Filter",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `in_budget(prices, min_p, max_p)`: return a list of prices `p` that are between `min_p` and `max_p` inclusive (`min_p <= p <= max_p`).",
      constraints: [
        "Keep only prices where `p >= min_p and p <= max_p`",
        "Return the filtered list",
      ],
      examples: [
        {
          input: "prices = [5, 15, 25, 40, 12], min_p = 10, max_p = 30",
          output: "[15, 25, 12]",
        },
      ],
      initial_code: `def in_budget(prices, min_p, max_p):
    # Return prices where min_p <= p <= max_p
    pass

print(in_budget([5, 15, 25, 40, 12], 10, 30))`,
      expected_output: "[15, 25, 12]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = in_budget([5, 15, 25, 40, 12], 10, 30)
    results.append({"id": 1, "input": "[5, 15, 25, 40, 12], 10, 30", "expected": "[15, 25, 12]", "actual": str(r1), "passed": r1 == [15, 25, 12]})
    r2 = in_budget([10, 20], 15, 25)
    results.append({"id": 2, "input": "[10, 20], 15, 25", "expected": "[20]", "actual": str(r2), "passed": r2 == [20]})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `if min_p <= p <= max_p:` inside your loop or list comprehension.",
      ],
    },
    {
      id: "py-07-d4",
      title: "Practice 4/4: Filter & Double Positive Signals",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `amplify_positive(signals)`: keep only strictly positive numbers (`n > 0`) AND multiply each kept number by `10`. Return the new list.",
      constraints: [
        "Ignore `0` and negative numbers (`<= 0`)",
        "Append `n * 10` for each positive number `n > 0`",
      ],
      examples: [
        {
          input: "signals = [-3, 2, 0, 5, -1]",
          output: "[20, 50]",
        },
      ],
      initial_code: `def amplify_positive(signals):
    # Keep only n > 0 and multiply each kept number by 10
    pass

print(amplify_positive([-3, 2, 0, 5, -1]))`,
      expected_output: "[20, 50]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = amplify_positive([-3, 2, 0, 5, -1])
    results.append({"id": 1, "input": "[-3, 2, 0, 5, -1]", "expected": "[20, 50]", "actual": str(r1), "passed": r1 == [20, 50]})
    r2 = amplify_positive([-5, 0])
    results.append({"id": 2, "input": "[-5, 0]", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return [n * 10 for n in signals if n > 0]` or use a `for` loop with `if n > 0: res.append(n * 10)`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 08: Error Handling try / except (Harder Core -> 4 Total Stages)
  // =========================================================================
  8: [
    {
      id: "py-08-d2",
      title: "Practice 2/4: Safe Integer Parser",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `parse_port(raw_text)`: inside a `try:` block convert `raw_text` to an integer with `int(raw_text)` and return it. If `ValueError` occurs, return `8080`.",
      constraints: [
        "Use `try: return int(raw_text)`",
        "Catch `except ValueError:` and return `8080`",
      ],
      examples: [
        {
          input: 'parse_port("3000") and parse_port("invalid")',
          output: "3000 8080",
        },
      ],
      initial_code: `def parse_port(raw_text):
    # Convert raw_text with int(), or return 8080 on ValueError
    pass

print(parse_port("3000"), parse_port("invalid"))`,
      expected_output: "3000 8080",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = parse_port("3000")
    results.append({"id": 1, "input": "'3000'", "expected": "3000", "actual": str(r1), "passed": r1 == 3000})
    r2 = parse_port("invalid")
    results.append({"id": 2, "input": "'invalid'", "expected": "8080", "actual": str(r2), "passed": r2 == 8080})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Put `return int(raw_text)` inside `try:` and `return 8080` inside `except ValueError:`.",
      ],
    },
    {
      id: "py-08-d3",
      title: "Practice 3/4: Safe List Index Reader",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `safe_pick(items, idx)`: return `items[idx]` inside a `try:` block. If `idx` is out of bounds (`IndexError`), return `"EMPTY"`.',
      constraints: [
        "Return `items[idx]` inside `try:`",
        'Catch `except IndexError:` and return `"EMPTY"`',
      ],
      examples: [
        {
          input: 'items = ["sword", "shield"], idx = 5',
          output: "EMPTY",
        },
      ],
      initial_code: `def safe_pick(items, idx):
    # Return items[idx] or "EMPTY" if IndexError happens
    pass

print(safe_pick(["sword", "shield"], 5))`,
      expected_output: "EMPTY",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = safe_pick(["sword", "shield"], 5)
    results.append({"id": 1, "input": "['sword', 'shield'], 5", "expected": "EMPTY", "actual": str(r1), "passed": r1 == "EMPTY"})
    r2 = safe_pick(["sword", "shield"], 1)
    results.append({"id": 2, "input": "['sword', 'shield'], 1", "expected": "shield", "actual": str(r2), "passed": r2 == "shield"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Use `try: return items[idx]` and `except IndexError: return "EMPTY"`.',
      ],
    },
    {
      id: "py-08-d4",
      title: "Practice 4/4: Crash-Proof Average Calculator",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `safe_average(numbers)`: return `sum(numbers) / len(numbers)` inside a `try:` block, and catch `ZeroDivisionError` (when `numbers` is empty) to return `0.0`.",
      constraints: [
        "Compute `sum(numbers) / len(numbers)` inside `try:`",
        "Return `0.0` inside `except ZeroDivisionError:`",
      ],
      examples: [
        {
          input: "safe_average([10, 20, 30]) and safe_average([])",
          output: "20.0 0.0",
        },
      ],
      initial_code: `def safe_average(numbers):
    # Return sum(numbers) / len(numbers), or 0.0 if numbers is empty
    pass

print(safe_average([10, 20, 30]), safe_average([]))`,
      expected_output: "20.0 0.0",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = safe_average([10, 20, 30])
    results.append({"id": 1, "input": "[10, 20, 30]", "expected": "20.0", "actual": str(r1), "passed": r1 == 20.0})
    r2 = safe_average([])
    results.append({"id": 2, "input": "[]", "expected": "0.0", "actual": str(r2), "passed": r2 == 0.0})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Wrap `return sum(numbers) / len(numbers)` in `try:` and `return 0.0` in `except ZeroDivisionError:`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 09: Counting Items .count() (Easy -> 2 Total Stages)
  // =========================================================================
  9: [
    {
      id: "py-09-d2",
      title: "Practice 2/2: Win Streak Majority Check",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `has_more_wins(results)`: use `.count("W")` and `.count("L")` on `results` and return `True` if `"W"` appears strictly more times than `"L"`, otherwise `False`.',
      constraints: [
        'Compare `results.count("W") > results.count("L")`',
        "Return the boolean result",
      ],
      examples: [
        {
          input: 'results = ["W", "L", "W", "W", "L"]',
          output: "True",
        },
      ],
      initial_code: `def has_more_wins(results):
    # Return True if "W" count is greater than "L" count
    pass

print(has_more_wins(["W", "L", "W", "W", "L"]))`,
      expected_output: "True",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = has_more_wins(["W", "L", "W", "W", "L"])
    results.append({"id": 1, "input": "['W', 'L', 'W', 'W', 'L']", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = has_more_wins(["L", "L", "W"])
    results.append({"id": 2, "input": "['L', 'L', 'W']", "expected": "False", "actual": str(r2), "passed": r2 is False})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return results.count("W") > results.count("L")`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 10: Removing Duplicates set() & sorted() (Medium -> 3 Total Stages)
  // =========================================================================
  10: [
    {
      id: "py-10-d2",
      title: "Practice 2/3: Count Unique Visitors",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `count_unique_ips(ips)`: convert `ips` to a `set(ips)` to remove duplicates and return how many unique IPs exist using `len(...)`.",
      constraints: [
        "Use `set(ips)` to deduplicate",
        "Return `len(set(ips))`",
      ],
      examples: [
        {
          input: 'ips = ["10.0.1", "10.0.2", "10.0.1", "10.0.3"]',
          output: "3",
        },
      ],
      initial_code: `def count_unique_ips(ips):
    # Return the count of unique IPs in the list
    pass

print(count_unique_ips(["10.0.1", "10.0.2", "10.0.1", "10.0.3"]))`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = count_unique_ips(["10.0.1", "10.0.2", "10.0.1", "10.0.3"])
    results.append({"id": 1, "input": "4 IPs (3 unique)", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = count_unique_ips(["1.1.1", "1.1.1"])
    results.append({"id": 2, "input": "2 identical IPs", "expected": "1", "actual": str(r2), "passed": r2 == 1})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Wrap `set(ips)` inside `len(...)`: `return len(set(ips))`.",
      ],
    },
    {
      id: "py-10-d3",
      title: "Practice 3/3: Merge & Deduplicate Two Teams",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `merge_rosters(team_a, team_b)`: combine `team_a + team_b`, remove duplicates with `set(...)`, and return them sorted A–Z with `sorted(...)`.",
      constraints: [
        "Concatenate `team_a + team_b`",
        "Return `sorted(set(team_a + team_b))`",
      ],
      examples: [
        {
          input: 'team_a = ["Zoe", "Kai"], team_b = ["Kai", "Aria"]',
          output: "['Aria', 'Kai', 'Zoe']",
        },
      ],
      initial_code: `def merge_rosters(team_a, team_b):
    # Combine both lists, remove duplicates, and return sorted A-Z
    pass

print(merge_rosters(["Zoe", "Kai"], ["Kai", "Aria"]))`,
      expected_output: "['Aria', 'Kai', 'Zoe']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = merge_rosters(["Zoe", "Kai"], ["Kai", "Aria"])
    results.append({"id": 1, "input": "['Zoe', 'Kai'], ['Kai', 'Aria']", "expected": "['Aria', 'Kai', 'Zoe']", "actual": str(r1), "passed": r1 == ["Aria", "Kai", "Zoe"]})
    r2 = merge_rosters(["Max"], ["Leo", "Max"])
    results.append({"id": 2, "input": "['Max'], ['Leo', 'Max']", "expected": "['Leo', 'Max']", "actual": str(r2), "passed": r2 == ["Leo", "Max"]})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `return sorted(set(team_a + team_b))`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 11: Joining Words .join() (Easy -> 2 Total Stages)
  // =========================================================================
  11: [
    {
      id: "py-11-d2",
      title: "Practice 2/2: Unix File Path Builder",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `build_file_path(folders)`: join all folder names in `folders` using `"/"` as the separator and prepend a leading `"/"` (e.g. `"/" + "/".join(folders)`).',
      constraints: [
        'Join `folders` with `"/"`',
        'Ensure the returned path starts with `"/"`',
      ],
      examples: [
        {
          input: 'folders = ["users", "aria", "projects"]',
          output: "/users/aria/projects",
        },
      ],
      initial_code: `def build_file_path(folders):
    # Return "/users/aria/projects" from ["users", "aria", "projects"]
    pass

print(build_file_path(["users", "aria", "projects"]))`,
      expected_output: "/users/aria/projects",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = build_file_path(["users", "aria", "projects"])
    results.append({"id": 1, "input": "['users', 'aria', 'projects']", "expected": "/users/aria/projects", "actual": str(r1), "passed": r1 == "/users/aria/projects"})
    r2 = build_file_path(["var", "log"])
    results.append({"id": 2, "input": "['var', 'log']", "expected": "/var/log", "actual": str(r2), "passed": r2 == "/var/log"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return "/" + "/".join(folders)`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 12: List Slicing (Medium -> 3 Total Stages)
  // =========================================================================
  12: [
    {
      id: "py-12-d2",
      title: "Practice 2/3: Recent 2 Log Entries",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `get_last_two(logs)`: use negative slice syntax `logs[-2:]` to return only the last 2 items from `logs`.",
      constraints: [
        "Use `logs[-2:]` to grab the final 2 items",
        "Return the sliced list",
      ],
      examples: [
        {
          input: 'logs = ["boot", "auth", "sync", "ready"]',
          output: "['sync', 'ready']",
        },
      ],
      initial_code: `def get_last_two(logs):
    # Return the last 2 items of logs using negative slicing
    pass

print(get_last_two(["boot", "auth", "sync", "ready"]))`,
      expected_output: "['sync', 'ready']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = get_last_two(["boot", "auth", "sync", "ready"])
    results.append({"id": 1, "input": "4 logs -> last 2", "expected": "['sync', 'ready']", "actual": str(r1), "passed": r1 == ["sync", "ready"]})
    r2 = get_last_two([10, 20, 30])
    results.append({"id": 2, "input": "[10, 20, 30] -> last 2", "expected": "[20, 30]", "actual": str(r2), "passed": r2 == [20, 30]})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Negative indices count from the end of the list: `return logs[-2:]`.",
      ],
    },
    {
      id: "py-12-d3",
      title: "Practice 3/3: Trim Outliers (Drop First & Last)",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `trim_extremes(scores)`: sort `scores` first with `sorted(scores)`, then slice off the first (lowest) and last (highest) items using `[1:-1]` and return the middle slice.",
      constraints: [
        "Sort the list with `sorted(scores)`",
        "Slice `[1:-1]` to drop index `0` and the last index `-1`",
      ],
      examples: [
        {
          input: "scores = [100, 50, 70, 60, 10]",
          output: "[50, 60, 70]",
        },
      ],
      initial_code: `def trim_extremes(scores):
    # Sort scores and slice off the lowest (first) and highest (last) values
    pass

print(trim_extremes([100, 50, 70, 60, 10]))`,
      expected_output: "[50, 60, 70]",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = trim_extremes([100, 50, 70, 60, 10])
    results.append({"id": 1, "input": "[100, 50, 70, 60, 10]", "expected": "[50, 60, 70]", "actual": str(r1), "passed": r1 == [50, 60, 70]})
    r2 = trim_extremes([1, 5, 9, 10])
    results.append({"id": 2, "input": "[1, 5, 9, 10]", "expected": "[5, 9]", "actual": str(r2), "passed": r2 == [5, 9]})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return sorted(scores)[1:-1]`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 13: Replacing Text .replace() (Easy -> 2 Total Stages)
  // =========================================================================
  13: [
    {
      id: "py-13-d2",
      title: "Practice 2/2: Snake_Case Identifier Converter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `to_snake_case(title)`: convert `title` to lowercase with `.lower()` and replace all spaces `" "` with underscores `"_"`.',
      constraints: [
        "Convert to lowercase with `.lower()`",
        'Replace `" "` with `"_"` using `.replace(" ", "_")`',
      ],
      examples: [
        {
          input: 'title = "High Score Table"',
          output: "high_score_table",
        },
      ],
      initial_code: `def to_snake_case(title):
    # Lowercase title and replace spaces with underscores
    pass

print(to_snake_case("High Score Table"))`,
      expected_output: "high_score_table",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = to_snake_case("High Score Table")
    results.append({"id": 1, "input": "'High Score Table'", "expected": "high_score_table", "actual": str(r1), "passed": r1 == "high_score_table"})
    r2 = to_snake_case("Player One")
    results.append({"id": 2, "input": "'Player One'", "expected": "player_one", "actual": str(r2), "passed": r2 == "player_one"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Chain `return title.lower().replace(" ", "_")`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 14: Summing Numbers sum() (Easy -> 2 Total Stages)
  // =========================================================================
  14: [
    {
      id: "py-14-d2",
      title: "Practice 2/2: Net Balance After Fee",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `net_payout(earnings, platform_fee)`: add all numbers in `earnings` with `sum(earnings)`, subtract `platform_fee`, and return the result.",
      constraints: [
        "Use `sum(earnings)`",
        "Subtract `platform_fee` and return the net total",
      ],
      examples: [
        {
          input: "earnings = [40, 60, 25], platform_fee = 15",
          output: "110",
        },
      ],
      initial_code: `def net_payout(earnings, platform_fee):
    # Return sum of earnings minus platform_fee
    pass

print(net_payout([40, 60, 25], 15))`,
      expected_output: "110",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = net_payout([40, 60, 25], 15)
    results.append({"id": 1, "input": "[40, 60, 25], 15", "expected": "110", "actual": str(r1), "passed": r1 == 110})
    r2 = net_payout([100, 50], 10)
    results.append({"id": 2, "input": "[100, 50], 10", "expected": "140", "actual": str(r2), "passed": r2 == 140})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return sum(earnings) - platform_fee`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 15: Checking Prefixes .startswith() (Easy -> 2 Total Stages)
  // =========================================================================
  15: [
    {
      id: "py-15-d2",
      title: "Practice 2/2: Python Script File Validator",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `is_test_script(filename)`: return `True` if `filename` starts with `"test_"` AND ends with `".py"` (using `.endswith(".py")`), otherwise `False`.',
      constraints: [
        'Check `filename.startswith("test_")`',
        'Check `filename.endswith(".py")`',
        "Combine both with `and`",
      ],
      examples: [
        {
          input: 'filename = "test_auth.py"',
          output: "True",
        },
      ],
      initial_code: `def is_test_script(filename):
    # Return True if filename starts with "test_" and ends with ".py"
    pass

print(is_test_script("test_auth.py"))`,
      expected_output: "True",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = is_test_script("test_auth.py")
    results.append({"id": 1, "input": "'test_auth.py'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_test_script("test_auth.txt")
    results.append({"id": 2, "input": "'test_auth.txt'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    r3 = is_test_script("main.py")
    results.append({"id": 3, "input": "'main.py'", "expected": "False", "actual": str(r3), "passed": r3 is False})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return filename.startswith("test_") and filename.endswith(".py")`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 16: Dictionary Defaults .get() (Medium -> 3 Total Stages)
  // =========================================================================
  16: [
    {
      id: "py-16-d2",
      title: "Practice 2/3: Safe Player Lives Lookup",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `get_remaining_lives(save_data)`: use `.get("lives", 3)` on `save_data` to return the saved lives count or default to `3`.',
      constraints: [
        'Use `save_data.get("lives", 3)`',
        "Return the integer result",
      ],
      examples: [
        {
          input: 'get_remaining_lives({"lives": 5}) and get_remaining_lives({})',
          output: "5 3",
        },
      ],
      initial_code: `def get_remaining_lives(save_data):
    # Return "lives" from save_data or default to 3
    pass

print(get_remaining_lives({"lives": 5}), get_remaining_lives({}))`,
      expected_output: "5 3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = get_remaining_lives({"lives": 5})
    results.append({"id": 1, "input": "{'lives': 5}", "expected": "5", "actual": str(r1), "passed": r1 == 5})
    r2 = get_remaining_lives({})
    results.append({"id": 2, "input": "{}", "expected": "3", "actual": str(r2), "passed": r2 == 3})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return save_data.get("lives", 3)`.',
      ],
    },
    {
      id: "py-16-d3",
      title: "Practice 3/3: Increment Word Frequency Counter",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `record_vote(counts, candidate)`: update `counts[candidate]` by reading its current count with `counts.get(candidate, 0)` and adding `1`. Return `counts`.",
      constraints: [
        "Use `counts.get(candidate, 0) + 1`",
        "Store the updated number in `counts[candidate]` and return `counts`",
      ],
      examples: [
        {
          input: 'counts = {"Aria": 2}, candidate = "Aria"',
          output: "{'Aria': 3}",
        },
      ],
      initial_code: `def record_vote(counts, candidate):
    # Increment counts[candidate] safely using .get(candidate, 0) + 1
    return counts

print(record_vote({"Aria": 2}, "Aria"))`,
      expected_output: "{'Aria': 3}",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = record_vote({"Aria": 2}, "Aria")
    results.append({"id": 1, "input": "{'Aria': 2}, 'Aria'", "expected": "{'Aria': 3}", "actual": str(r1), "passed": r1 == {"Aria": 3}})
    r2 = record_vote({"Aria": 2}, "Kai")
    results.append({"id": 2, "input": "{'Aria': 2}, 'Kai'", "expected": "{'Aria': 2, 'Kai': 1}", "actual": str(r2), "passed": r2 == {"Aria": 2, "Kai": 1}})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `counts[candidate] = counts.get(candidate, 0) + 1` and return `counts`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 17: F-Strings (Medium -> 3 Total Stages)
  // =========================================================================
  17: [
    {
      id: "py-17-d2",
      title: "Practice 2/3: API Latency Log Line",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `format_ping(service, ms)`: return the f-string `f"[{service}] responded in {ms}ms"`.',
      constraints: [
        'Use an f-string matching `f"[{service}] responded in {ms}ms"`',
      ],
      examples: [
        {
          input: 'service = "AUTH", ms = 12',
          output: "[AUTH] responded in 12ms",
        },
      ],
      initial_code: `def format_ping(service, ms):
    # Return "[{service}] responded in {ms}ms"
    pass

print(format_ping("AUTH", 12))`,
      expected_output: "[AUTH] responded in 12ms",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = format_ping("AUTH", 12)
    results.append({"id": 1, "input": "'AUTH', 12", "expected": "[AUTH] responded in 12ms", "actual": str(r1), "passed": r1 == "[AUTH] responded in 12ms"})
    r2 = format_ping("DB", 4)
    results.append({"id": 2, "input": "'DB', 4", "expected": "[DB] responded in 4ms", "actual": str(r2), "passed": r2 == "[DB] responded in 4ms"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return f"[{service}] responded in {ms}ms"`.',
      ],
    },
    {
      id: "py-17-d3",
      title: "Practice 3/3: Computed XP Progress Banner",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `xp_banner(current_xp, target_xp)`: compute `missing = target_xp - current_xp` and return `f"{current_xp}/{target_xp} XP ({missing} to next level)"`.',
      constraints: [
        "Calculate `missing = target_xp - current_xp`",
        'Format `f"{current_xp}/{target_xp} XP ({missing} to next level)"`',
      ],
      examples: [
        {
          input: "current_xp = 350, target_xp = 500",
          output: "350/500 XP (150 to next level)",
        },
      ],
      initial_code: `def xp_banner(current_xp, target_xp):
    # Return "{current_xp}/{target_xp} XP ({missing} to next level)"
    pass

print(xp_banner(350, 500))`,
      expected_output: "350/500 XP (150 to next level)",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = xp_banner(350, 500)
    results.append({"id": 1, "input": "350, 500", "expected": "350/500 XP (150 to next level)", "actual": str(r1), "passed": r1 == "350/500 XP (150 to next level)"})
    r2 = xp_banner(90, 100)
    results.append({"id": 2, "input": "90, 100", "expected": "90/100 XP (10 to next level)", "actual": str(r2), "passed": r2 == "90/100 XP (10 to next level)"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return f"{current_xp}/{target_xp} XP ({target_xp - current_xp} to next level)"`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 18: Splitting Text .split() (Medium -> 3 Total Stages)
  // =========================================================================
  18: [
    {
      id: "py-18-d2",
      title: "Practice 2/3: Extract First Command Keyword",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `get_command(line)`: split `line` into words with `.split()` and return the very first word (`words[0]`).",
      constraints: [
        "Split `line` using `.split()`",
        "Return index `0` of the resulting list",
      ],
      examples: [
        {
          input: 'line = "DEPLOY production us-east-1"',
          output: "DEPLOY",
        },
      ],
      initial_code: `def get_command(line):
    # Split line and return the first word
    pass

print(get_command("DEPLOY production us-east-1"))`,
      expected_output: "DEPLOY",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = get_command("DEPLOY production us-east-1")
    results.append({"id": 1, "input": "'DEPLOY production us-east-1'", "expected": "DEPLOY", "actual": str(r1), "passed": r1 == "DEPLOY"})
    r2 = get_command("PING 127.0.0.1")
    results.append({"id": 2, "input": "'PING 127.0.0.1'", "expected": "PING", "actual": str(r2), "passed": r2 == "PING"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return line.split()[0]`.",
      ],
    },
    {
      id: "py-18-d3",
      title: "Practice 3/3: Parse Comma-Separated Tags",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `parse_csv_tags(csv_line)`: split `csv_line` on commas using `csv_line.split(",")` and return the resulting list of tags.',
      constraints: [
        'Pass `","` into `.split(",")`',
        "Return the list of substrings",
      ],
      examples: [
        {
          input: 'csv_line = "python,algorithms,backend"',
          output: "['python', 'algorithms', 'backend']",
        },
      ],
      initial_code: `def parse_csv_tags(csv_line):
    # Split csv_line by comma "," and return the list
    pass

print(parse_csv_tags("python,algorithms,backend"))`,
      expected_output: "['python', 'algorithms', 'backend']",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = parse_csv_tags("python,algorithms,backend")
    results.append({"id": 1, "input": "'python,algorithms,backend'", "expected": "['python', 'algorithms', 'backend']", "actual": str(r1), "passed": r1 == ["python", "algorithms", "backend"]})
    r2 = parse_csv_tags("a,b")
    results.append({"id": 2, "input": "'a,b'", "expected": "['a', 'b']", "actual": str(r2), "passed": r2 == ["a", "b"]})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return csv_line.split(",")`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 19: Membership in (Easy -> 2 Total Stages)
  // =========================================================================
  19: [
    {
      id: "py-19-d2",
      title: "Practice 2/2: Blocked Username Guard",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `is_username_allowed(username, banned_list)`: return `True` if `username` is NOT inside `banned_list` (`username not in banned_list`), or `False` if it is banned.",
      constraints: [
        "Use `username not in banned_list`",
        "Return the boolean result",
      ],
      examples: [
        {
          input: 'username = "aria", banned_list = ["root", "admin"]',
          output: "True",
        },
      ],
      initial_code: `def is_username_allowed(username, banned_list):
    # Return True if username is NOT in banned_list
    pass

print(is_username_allowed("aria", ["root", "admin"]))`,
      expected_output: "True",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = is_username_allowed("aria", ["root", "admin"])
    results.append({"id": 1, "input": "'aria', ['root', 'admin']", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_username_allowed("root", ["root", "admin"])
    results.append({"id": 2, "input": "'root', ['root', 'admin']", "expected": "False", "actual": str(r2), "passed": r2 is False})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return username not in banned_list`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 20: Rounding Numbers round() (Easy -> 2 Total Stages)
  // =========================================================================
  20: [
    {
      id: "py-20-d2",
      title: "Practice 2/2: Win Percentage Formatter",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `win_percentage(wins, total)`: compute `(wins / total) * 100` and return it rounded to `2` decimal places using `round(..., 2)`.",
      constraints: [
        "Calculate `(wins / total) * 100`",
        "Round to `2` decimal places with `round(..., 2)`",
      ],
      examples: [
        {
          input: "wins = 2, total = 3",
          output: "66.67",
        },
      ],
      initial_code: `def win_percentage(wins, total):
    # Calculate (wins / total) * 100 rounded to 2 decimal places
    pass

print(win_percentage(2, 3))`,
      expected_output: "66.67",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = win_percentage(2, 3)
    results.append({"id": 1, "input": "2, 3", "expected": "66.67", "actual": str(r1), "passed": r1 == 66.67})
    r2 = win_percentage(1, 8)
    results.append({"id": 2, "input": "1, 8", "expected": "12.5", "actual": str(r2), "passed": r2 == 12.5})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return round((wins / total) * 100, 2)`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 21: Mini-App RPG Critical Hit Calculator (Harder Project -> 4 Stages)
  // =========================================================================
  21: [
    {
      id: "py-21-d2",
      title: "Practice 2/4: Elemental Weakness Multiplier",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `elemental_damage(base_dmg, attack_elem, target_weakness)`: if `attack_elem == target_weakness`, multiply `base_dmg` by `3`, otherwise leave `base_dmg` unchanged. Return the integer damage.',
      constraints: [
        "Compare `attack_elem == target_weakness`",
        "Return `base_dmg * 3` when matched, else `base_dmg`",
      ],
      examples: [
        {
          input: 'base_dmg = 40, attack_elem = "fire", target_weakness = "fire"',
          output: "120",
        },
      ],
      initial_code: `def elemental_damage(base_dmg, attack_elem, target_weakness):
    # Triple base_dmg if attack_elem matches target_weakness
    pass

print(elemental_damage(40, "fire", "fire"))`,
      expected_output: "120",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = elemental_damage(40, "fire", "fire")
    results.append({"id": 1, "input": "40, 'fire', 'fire'", "expected": "120", "actual": str(r1), "passed": r1 == 120})
    r2 = elemental_damage(40, "ice", "fire")
    results.append({"id": 2, "input": "40, 'ice', 'fire'", "expected": "40", "actual": str(r2), "passed": r2 == 40})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `return base_dmg * 3 if attack_elem == target_weakness else base_dmg`.",
      ],
    },
    {
      id: "py-21-d3",
      title: "Practice 3/4: Multi-Hit Combo Flurry",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `flurry_total(swings, defense)`: for each `atk` in `swings`, each hit deals `max(atk - defense, 1)` damage. Sum the damage of all swings and return the total.",
      constraints: [
        "Each swing deals `max(atk - defense, 1)`",
        "Sum across all swings in `swings` and return the total",
      ],
      examples: [
        {
          input: "swings = [30, 10, 45], defense = 15",
          output: "46",
          explanation: "(30-15=15) + max(10-15, 1)=1 + (45-15=30) = 46.",
        },
      ],
      initial_code: `def flurry_total(swings, defense):
    # Sum max(atk - defense, 1) for every atk in swings
    pass

print(flurry_total([30, 10, 45], 15))`,
      expected_output: "46",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = flurry_total([30, 10, 45], 15)
    results.append({"id": 1, "input": "[30, 10, 45], 15", "expected": "46", "actual": str(r1), "passed": r1 == 46})
    r2 = flurry_total([5, 5], 20)
    results.append({"id": 2, "input": "[5, 5], 20", "expected": "2", "actual": str(r2), "passed": r2 == 2})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return sum(max(atk - defense, 1) for atk in swings)`.",
      ],
    },
    {
      id: "py-21-d4",
      title: "Practice 4/4: Boss Knock-Out Predictor",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        'Complete `battle_outcome(boss_hp, attack, is_crit, defense)`: compute damage `max((attack * 2 if is_crit else attack) - defense, 1)`, subtract it from `boss_hp`, and return `"DEFEATED"` if remaining HP `<= 0` else `f"HP: {remaining}"`.',
      constraints: [
        "Compute `dmg = max((attack * 2 if is_crit else attack) - defense, 1)`",
        "Compute `remaining = boss_hp - dmg`",
        'Return `"DEFEATED"` if `remaining <= 0` else `f"HP: {remaining}"`',
      ],
      examples: [
        {
          input: "boss_hp = 70, attack = 50, is_crit = True, defense = 20",
          output: "DEFEATED",
        },
      ],
      initial_code: `def battle_outcome(boss_hp, attack, is_crit, defense):
    # Calculate damage, subtract from boss_hp, and return "DEFEATED" or "HP: {remaining}"
    pass

print(battle_outcome(70, 50, True, 20))`,
      expected_output: "DEFEATED",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = battle_outcome(70, 50, True, 20)
    results.append({"id": 1, "input": "70, 50, True, 20", "expected": "DEFEATED", "actual": str(r1), "passed": r1 == "DEFEATED"})
    r2 = battle_outcome(100, 30, False, 10)
    results.append({"id": 2, "input": "100, 30, False, 10", "expected": "HP: 80", "actual": str(r2), "passed": r2 == "HP: 80"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Calculate `dmg = max((attack * 2 if is_crit else attack) - defense, 1)` and `rem = boss_hp - dmg`.",
        'Return `"DEFEATED" if rem <= 0 else f"HP: {rem}"`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 22: Mini-App Password Strength Checker (Harder Project -> 4 Stages)
  // =========================================================================
  22: [
    {
      id: "py-22-d2",
      title: "Practice 2/4: Count Digits in Passcode",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        "Complete `count_digits(password)`: count and return how many characters `ch` in `password` are digits (`ch.isdigit()`).",
      constraints: [
        "Loop through each character `ch` in `password`",
        "Count characters where `ch.isdigit()` is `True`",
      ],
      examples: [
        {
          input: 'password = "Dev2026Pro9"',
          output: "5",
        },
      ],
      initial_code: `def count_digits(password):
    # Return how many characters in password are digits
    pass

print(count_digits("Dev2026Pro9"))`,
      expected_output: "5",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = count_digits("Dev2026Pro9")
    results.append({"id": 1, "input": "'Dev2026Pro9'", "expected": "5", "actual": str(r1), "passed": r1 == 5})
    r2 = count_digits("nodigits")
    results.append({"id": 2, "input": "'nodigits'", "expected": "0", "actual": str(r2), "passed": r2 == 0})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use `return sum(1 for ch in password if ch.isdigit())` or a `for` loop with a counter.",
      ],
    },
    {
      id: "py-22-d3",
      title: "Practice 3/4: Block Forbidden Passwords",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `is_leaked_password(password, leaked_list)`: normalize `password` with `.strip().lower()` and return `True` if it appears in `leaked_list`, else `False`.',
      constraints: [
        "Normalize `password` using `.strip().lower()`",
        "Check if the normalized password is `in leaked_list`",
      ],
      examples: [
        {
          input: 'password = "  Password123 ", leaked_list = ["password123", "qwerty"]',
          output: "True",
        },
      ],
      initial_code: `def is_leaked_password(password, leaked_list):
    # Return True if cleaned password is in leaked_list
    pass

print(is_leaked_password("  Password123 ", ["password123", "qwerty"]))`,
      expected_output: "True",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = is_leaked_password("  Password123 ", ["password123", "qwerty"])
    results.append({"id": 1, "input": "'  Password123 '", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_leaked_password("SafeKey99!", ["password123", "qwerty"])
    results.append({"id": 2, "input": "'SafeKey99!'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return password.strip().lower() in leaked_list`.",
      ],
    },
    {
      id: "py-22-d4",
      title: "Practice 4/4: 3-Rule Security Score (0 to 3)",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        "Complete `security_score(password)`: start `score = 0`. Add `+1` if `len(password) >= 8`, `+1` if `any(ch.isdigit() for ch in password)`, and `+1` if `any(ch.isupper() for ch in password)`. Return `score`.",
      constraints: [
        "`+1` point if `len(password) >= 8`",
        "`+1` point if it contains at least one digit (`ch.isdigit()`)",
        "`+1` point if it contains at least one uppercase letter (`ch.isupper()`)",
      ],
      examples: [
        {
          input: 'password = "Arcade99"',
          output: "3",
        },
      ],
      initial_code: `def security_score(password):
    # Calculate and return security score from 0 to 3
    pass

print(security_score("Arcade99"))`,
      expected_output: "3",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = security_score("Arcade99")
    results.append({"id": 1, "input": "'Arcade99'", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = security_score("arcade99")
    results.append({"id": 2, "input": "'arcade99'", "expected": "2", "actual": str(r2), "passed": r2 == 2})
    r3 = security_score("abc")
    results.append({"id": 3, "input": "'abc'", "expected": "0", "actual": str(r3), "passed": r3 == 0})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Use three `if` statements (not `elif`!) so each passing rule adds `1` to `score`.",
      ],
    },
  ],

  // =========================================================================
  // LESSON 23: Mini-App Restaurant Bill & Tip Splitter (Harder Project -> 4 Stages)
  // =========================================================================
  23: [
    {
      id: "py-23-d2",
      title: "Practice 2/4: Service Tier Tip Rate",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `tip_rate_for_service(rating)`: return `20` if `rating == "great"`, `15` if `rating == "good"`, or `10` otherwise.',
      constraints: [
        'Return `20` for `"great"`, `15` for `"good"`, and `10` for anything else',
      ],
      examples: [
        {
          input: 'rating = "great"',
          output: "20",
        },
      ],
      initial_code: `def tip_rate_for_service(rating):
    # Return 20 for "great", 15 for "good", else 10
    pass

print(tip_rate_for_service("great"))`,
      expected_output: "20",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = tip_rate_for_service("great")
    results.append({"id": 1, "input": "'great'", "expected": "20", "actual": str(r1), "passed": r1 == 20})
    r2 = tip_rate_for_service("good")
    results.append({"id": 2, "input": "'good'", "expected": "15", "actual": str(r2), "passed": r2 == 15})
    r3 = tip_rate_for_service("okay")
    results.append({"id": 3, "input": "'okay'", "expected": "10", "actual": str(r3), "passed": r3 == 10})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Use `if rating == "great": return 20`, `elif rating == "good": return 15`, `else: return 10`.',
      ],
    },
    {
      id: "py-23-d3",
      title: "Practice 3/4: Subtotal from Ordered Items",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        "Complete `receipt_with_tax(item_prices, tax_pct)`: sum `item_prices` using `sum(item_prices)`, add `tax_pct` percent (`subtotal * (1 + tax_pct / 100)`), and return it rounded to `2` decimal places.",
      constraints: [
        "Compute `subtotal = sum(item_prices)`",
        "Return `round(subtotal * (1 + tax_pct / 100), 2)`",
      ],
      examples: [
        {
          input: "item_prices = [12.0, 18.0, 20.0], tax_pct = 8",
          output: "54.0",
        },
      ],
      initial_code: `def receipt_with_tax(item_prices, tax_pct):
    # Sum item_prices, add tax_pct %, and round to 2 decimal places
    pass

print(receipt_with_tax([12.0, 18.0, 20.0], 8))`,
      expected_output: "54.0",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = receipt_with_tax([12.0, 18.0, 20.0], 8)
    results.append({"id": 1, "input": "[12.0, 18.0, 20.0], 8", "expected": "54.0", "actual": str(r1), "passed": r1 == 54.0})
    r2 = receipt_with_tax([10.0, 15.0], 10)
    results.append({"id": 2, "input": "[10.0, 15.0], 10", "expected": "27.5", "actual": str(r2), "passed": r2 == 27.5})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Write `return round(sum(item_prices) * (1 + tax_pct / 100), 2)`.",
      ],
    },
    {
      id: "py-23-d4",
      title: "Practice 4/4: Formatted Split Receipt Line",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        'Complete `format_split_receipt(total, tip_percent, people)`: compute `each = round((total * (1 + tip_percent / 100)) / people, 2)` and return `f"{people} guests pay ${each} each"`.',
      constraints: [
        "Compute `each = round((total * (1 + tip_percent / 100)) / people, 2)`",
        'Return `f"{people} guests pay ${each} each"`',
      ],
      examples: [
        {
          input: "total = 100.0, tip_percent = 20, people = 4",
          output: "4 guests pay $30.0 each",
        },
      ],
      initial_code: `def format_split_receipt(total, tip_percent, people):
    # Calculate rounded share and return "{people} guests pay $\{each} each"
    pass

print(format_split_receipt(100.0, 20, 4))`,
      expected_output: "4 guests pay $30.0 each",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = format_split_receipt(100.0, 20, 4)
    results.append({"id": 1, "input": "100.0, 20, 4", "expected": "4 guests pay $30.0 each", "actual": str(r1), "passed": r1 == "4 guests pay $30.0 each"})
    r2 = format_split_receipt(60.0, 10, 3)
    results.append({"id": 2, "input": "60.0, 10, 3", "expected": "3 guests pay $22.0 each", "actual": str(r2), "passed": r2 == "3 guests pay $22.0 each"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Compute `each = round((total * (1 + tip_percent / 100)) / people, 2)`.",
        'Return `f"{people} guests pay ${each} each"`.',
      ],
    },
  ],

  // =========================================================================
  // LESSON 24: Mini-App Emoji Mood Chat Bot (Harder Project -> 4 Stages)
  // =========================================================================
  24: [
    {
      id: "py-24-d2",
      title: "Practice 2/4: Clean & Trim User Chat Input",
      difficultyLabel: "PRACTICE DRILL",
      assignment:
        'Complete `sanitize_chat(raw_msg)`: strip spaces with `.strip()`, convert to lowercase with `.lower()`, and replace `"!"` with `""` using `.replace("!", "")`.',
      constraints: [
        "Chain `.strip().lower().replace('!', '')`",
        "Return the cleaned keyword string",
      ],
      examples: [
        {
          input: 'raw_msg = "  HAPPY!! "',
          output: "happy",
        },
      ],
      initial_code: `def sanitize_chat(raw_msg):
    # Strip spaces, lowercase, and remove all "!" characters
    pass

print(sanitize_chat("  HAPPY!! "))`,
      expected_output: "happy",
      hidden_tests: `import json
def __run_tests__():
    results = []
    r1 = sanitize_chat("  HAPPY!! ")
    results.append({"id": 1, "input": "'  HAPPY!! '", "expected": "happy", "actual": str(r1), "passed": r1 == "happy"})
    r2 = sanitize_chat(" Tired! ")
    results.append({"id": 2, "input": "' Tired! '", "expected": "tired", "actual": str(r2), "passed": r2 == "tired"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Write `return raw_msg.strip().lower().replace("!", "")`.',
      ],
    },
    {
      id: "py-24-d3",
      title: "Practice 3/4: Multi-Word Sentence Mood Detector",
      difficultyLabel: "APPLIED CHALLENGE",
      assignment:
        'Complete `detect_mood_in_sentence(sentence, mood_map)`: loop through each `word` in `sentence.lower().split()`. If `word in mood_map`, immediately return `mood_map[word]`. If no word matches after the loop, return `"🤖 Tell me more!"`.',
      constraints: [
        "Loop over `for word in sentence.lower().split():`",
        "If `word in mood_map:`, return `mood_map[word]`",
        'Return `"🤖 Tell me more!"` outside the loop if no keyword matched',
      ],
      examples: [
        {
          input: 'sentence = "I feel super happy today", mood_map = {"happy": "🎉 Awesome!"}',
          output: "🎉 Awesome!",
        },
      ],
      initial_code: `def detect_mood_in_sentence(sentence, mood_map):
    # Check each word in sentence.lower().split() against mood_map
    pass

print(detect_mood_in_sentence("I feel super happy today", {"happy": "🎉 Awesome!"}))`,
      expected_output: "🎉 Awesome!",
      hidden_tests: `import json
def __run_tests__():
    results = []
    moods = {"happy": "🎉 Awesome!", "coding": "🐍 Keep shipping!"}
    r1 = detect_mood_in_sentence("I feel super happy today", moods)
    results.append({"id": 1, "input": "'I feel super happy today'", "expected": "🎉 Awesome!", "actual": str(r1), "passed": r1 == "🎉 Awesome!"})
    r2 = detect_mood_in_sentence("Just walking outside", moods)
    results.append({"id": 2, "input": "'Just walking outside'", "expected": "🤖 Tell me more!", "actual": str(r2), "passed": r2 == "🤖 Tell me more!"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        "Loop `for word in sentence.lower().split():` and check `if word in mood_map: return mood_map[word]`.",
        'At the end of the function outside the loop, `return "🤖 Tell me more!"`.',
      ],
    },
    {
      id: "py-24-d4",
      title: "Practice 4/4: Command + Mood Hybrid Bot Engine",
      difficultyLabel: "BOSS GAUNTLET",
      assignment:
        'Complete `smart_bot(text, mood_map)`: clean `clean = text.strip().lower()`. If `clean.startswith("/")`, return `f"CMD: {clean[1:].upper()}"`. Otherwise look up `reply = mood_map.get(clean, "🤖 I hear you!")` and return `f"Bot: {reply}"`.',
      constraints: [
        'If `clean.startswith("/")`, return `f"CMD: {clean[1:].upper()}"`',
        'Otherwise return `f"Bot: {mood_map.get(clean, \'🤖 I hear you!\')}"`',
      ],
      examples: [
        {
          input: 'text = "/help" and text = "happy"',
          output: "CMD: HELP | Bot: 🎉 Yay!",
        },
      ],
      initial_code: `def smart_bot(text, mood_map):
    # Handle "/command" inputs or fallback to mood_map lookup
    pass

moods = {"happy": "🎉 Yay!"}
print(f"{smart_bot('/help', moods)} | {smart_bot('happy', moods)}")`,
      expected_output: "CMD: HELP | Bot: 🎉 Yay!",
      hidden_tests: `import json
def __run_tests__():
    results = []
    moods = {"happy": "🎉 Yay!"}
    r1 = smart_bot("/help", moods)
    results.append({"id": 1, "input": "'/help'", "expected": "CMD: HELP", "actual": str(r1), "passed": r1 == "CMD: HELP"})
    r2 = smart_bot("  HAPPY ", moods)
    results.append({"id": 2, "input": "'  HAPPY '", "expected": "Bot: 🎉 Yay!", "actual": str(r2), "passed": r2 == "Bot: 🎉 Yay!"})
    r3 = smart_bot("other", moods)
    results.append({"id": 3, "input": "'other'", "expected": "Bot: 🤖 I hear you!", "actual": str(r3), "passed": r3 == "Bot: 🤖 I hear you!"})
    return json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results})
__run_tests__()`,
      hints: [
        'Set `clean = text.strip().lower()`. Check `if clean.startswith("/"): return f"CMD: {clean[1:].upper()}"`.',
        'Otherwise `return f"Bot: {mood_map.get(clean, \'🤖 I hear you!\')}"`.',
      ],
    },
  ],
};
