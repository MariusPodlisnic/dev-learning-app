export const PYTHON_BASICS_EXPANSION_LESSONS = [
  {
    id: "exp-py-01",
    title: "Variables & Data Types: Player Profile Setup",
    track: "python_basics",
    category: "VARIABLES & TYPES",
    difficulty: "Easy",
    tree_row: 1,
    lesson_order: 1,
    is_free: true,
    description:
      "Store text strings, integer numbers, and boolean switches in variables and return a formatted summary.",
    content:
      'In Python, a **variable** is a named label that stores a value in memory using `=`:\n\n• **Strings (`"Aria"`)**: Text wrapped in quotes.\n• **Integers (`100`)**: Whole numbers written without quotes so you can do math.\n• **Booleans (`True` / `False`)**: Capitalized ON/OFF switches.\n\n```python\nhero = "Aria"       # str\nhp = 100            # int\nis_ready = True     # bool\nprint(hero, hp, is_ready)\n```',
    assignment:
      "Complete `create_hero_profile(name, bonus_hp)`: calculate `total_hp = 100 + bonus_hp`, set `is_online = True`, and return the tuple `(name, total_hp, is_online)`.",
    constraints: [
      "Compute `total_hp = 100 + bonus_hp` using integer math (no quotes around 100)",
      "Create a boolean `is_online = True`",
      "Return `(name, total_hp, is_online)`",
    ],
    examples: [
      {
        input: 'name = "Aria", bonus_hp = 50',
        output: "('Aria', 150, True)",
        explanation: "100 base HP + 50 bonus HP = 150, paired with name and True.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def create_hero_profile(name, bonus_hp):
    pass`,
    expected_output: "('Aria', 150, True)",
    hidden_tests: `import json
results = []
try:
    r1 = create_hero_profile("Aria", 50)
    results.append({"id": 1, "input": "'Aria', 50", "expected": "('Aria', 150, True)", "actual": str(r1), "passed": r1 == ("Aria", 150, True)})
    r2 = create_hero_profile("Kai", 25)
    results.append({"id": 2, "input": "'Kai', 25", "expected": "('Kai', 125, True)", "actual": str(r2), "passed": r2 == ("Kai", 125, True)})
    r3 = create_hero_profile("Zed", 0)
    results.append({"id": 3, "input": "'Zed', 0", "expected": "('Zed', 100, True)", "actual": str(r3), "passed": r3 == ("Zed", 100, True)})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "name", value: '"Aria"', type: "str", address: "0x01" },
      { label: "total_hp", value: "150", type: "int", address: "0x02" },
      { label: "is_online", value: "True", type: "bool", address: "0x03" },
    ],
    hints: [
      "Inside the function, write `total_hp = 100 + bonus_hp`.",
      "Return `(name, total_hp, True)`.",
    ],
  },
  {
    id: "exp-py-02",
    title: "Lists & Loops: XP Batch Calculator",
    track: "python_basics",
    category: "LISTS & LOOPS",
    difficulty: "Easy",
    tree_row: 2,
    lesson_order: 2,
    is_free: true,
    description:
      "Store ordered collections of data in a list and iterate over every item using a for loop.",
    content:
      "A **List (`[10, 20, 30]`)** stores an ordered sequence of items. A **`for` loop** visits each item one by one from left to right so you can accumulate totals or transform values:\n\n```python\nquests = [10, 20, 30]\ntotal_xp = 0\nfor xp in quests:\n    total_xp += xp\nprint(total_xp)  # 60\n```",
    assignment:
      "Complete `sum_doubled_xp(quests)`: loop through every number `xp` in `quests`, double it (`xp * 2`), add it to a running `total`, and return `total`.",
    constraints: [
      "Start with `total = 0` before the loop",
      "Use `for xp in quests:` to visit each quest reward",
      "Add `xp * 2` to `total` on each step and return `total` outside the loop",
    ],
    examples: [
      {
        input: "quests = [10, 20, 5]",
        output: "70",
        explanation: "(10*2) + (20*2) + (5*2) = 20 + 40 + 10 = 70.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def sum_doubled_xp(quests):
    pass`,
    expected_output: "70",
    hidden_tests: `import json
results = []
try:
    r1 = sum_doubled_xp([10, 20, 5])
    results.append({"id": 1, "input": "[10, 20, 5]", "expected": "70", "actual": str(r1), "passed": r1 == 70})
    r2 = sum_doubled_xp([5, 15])
    results.append({"id": 2, "input": "[5, 15]", "expected": "40", "actual": str(r2), "passed": r2 == 40})
    r3 = sum_doubled_xp([])
    results.append({"id": 3, "input": "[]", "expected": "0", "actual": str(r3), "passed": r3 == 0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "idx 0: 10", value: "+20 -> total = 20", address: "step 1" },
      { label: "idx 1: 20", value: "+40 -> total = 60", address: "step 2" },
      { label: "idx 2: 5", value: "+10 -> total = 70 ✓", address: "step 3" },
    ],
    hints: [
      "Write `for xp in quests:` and indent the next line by 4 spaces.",
      "Inside the loop, write `total += xp * 2`, then `return total` unindented at the bottom.",
    ],
  },
  {
    id: "exp-py-03",
    title: "Conditionals: Ranked Tier Evaluator",
    track: "python_basics",
    category: "IF / ELIF / ELSE",
    difficulty: "Easy",
    tree_row: 3,
    lesson_order: 3,
    is_free: true,
    description:
      "Branch your code's decisions cleanly using if, elif, and else comparison blocks.",
    content:
      'Use **`if`**, **`elif`** (else-if), and **`else`** to test conditions in order from top to bottom. Python runs the **first** branch that evaluates to `True` and skips the rest:\n\n```python\nif score >= 1000:\n    rank = "GOLD"\nelif score >= 500:\n    rank = "SILVER"\nelse:\n    rank = "BRONZE"\n```',
    assignment:
      'Complete `get_rank_tier(score)`: return `"GOLD"` if `score >= 1000`, `"SILVER"` if `score >= 500`, or `"BRONZE"` otherwise.',
    constraints: [
      'Check `if score >= 1000:` first and return `"GOLD"`',
      'Use `elif score >= 500:` to return `"SILVER"`',
      'Return `"BRONZE"` in the `else:` fallback',
    ],
    examples: [
      {
        input: "score = 750",
        output: "SILVER",
        explanation: "750 is less than 1000 but >= 500, so it lands in SILVER.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def get_rank_tier(score):
    pass`,
    expected_output: "SILVER",
    hidden_tests: `import json
results = []
try:
    r1 = get_rank_tier(750)
    results.append({"id": 1, "input": "750", "expected": "SILVER", "actual": str(r1), "passed": r1 == "SILVER"})
    r2 = get_rank_tier(1200)
    results.append({"id": 2, "input": "1200", "expected": "GOLD", "actual": str(r2), "passed": r2 == "GOLD"})
    r3 = get_rank_tier(200)
    results.append({"id": 3, "input": "200", "expected": "BRONZE", "actual": str(r3), "passed": r3 == "BRONZE"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "score >= 1000", value: "750 >= 1000 -> False", type: "bool", address: "if" },
      { label: "score >= 500", value: "750 >= 500 -> True ✓", type: "bool", address: "elif" },
      { label: "return", value: '"SILVER"', type: "str", address: "out" },
    ],
    hints: [
      'Check the highest threshold (`score >= 1000`) first before `elif score >= 500:`.',
      'Remember the colon `:` at the end of `if`, `elif`, and `else`.',
    ],
  },
  {
    id: "exp-py-04",
    title: "Functions & Return: Combo Score Multiplier",
    track: "python_basics",
    category: "FUNCTIONS",
    difficulty: "Easy",
    tree_row: 4,
    lesson_order: 4,
    is_free: true,
    description:
      "Write reusable functions with parameters and hand back calculated values using return.",
    content:
      "A **function** packages reusable logic with **`def`**, accepts inputs inside parentheses `( )`, and sends back its result with **`return`**:\n\n```python\ndef calc_combo(base_pts, multiplier):\n    return base_pts * multiplier\n\nprint(calc_combo(150, 3))  # 450\n```\n\nNote: `print()` only displays text on screen (`returns None`), whereas **`return`** actually hands the value back to the caller!",
    assignment:
      "Complete `calc_final_score(base_pts, streak_bonus, multiplier)` so it adds `base_pts + streak_bonus`, multiplies the sum by `multiplier`, and returns the result.",
    constraints: [
      "Group `(base_pts + streak_bonus)` in parentheses before multiplying by `multiplier`",
      "Use `return` (not `print`) inside the function body",
    ],
    examples: [
      {
        input: "base_pts = 100, streak_bonus = 25, multiplier = 2",
        output: "250",
        explanation: "(100 + 25) * 2 = 125 * 2 = 250.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def calc_final_score(base_pts, streak_bonus, multiplier):
    pass`,
    expected_output: "250",
    hidden_tests: `import json
results = []
try:
    r1 = calc_final_score(100, 25, 2)
    results.append({"id": 1, "input": "100, 25, 2", "expected": "250", "actual": str(r1), "passed": r1 == 250})
    r2 = calc_final_score(50, 10, 3)
    results.append({"id": 2, "input": "50, 10, 3", "expected": "180", "actual": str(r2), "passed": r2 == 180})
    r3 = calc_final_score(20, 0, 0)
    results.append({"id": 3, "input": "20, 0, 0", "expected": "0", "actual": str(r3), "passed": r3 == 0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "base + bonus", value: "100 + 25 = 125", type: "int", address: "0x10" },
      { label: "* multiplier", value: "125 * 2 = 250", type: "int", address: "0x14" },
    ],
    hints: [
      "Use parentheses `(base_pts + streak_bonus) * multiplier` so addition happens before multiplication.",
      "Return the calculated number with `return (base_pts + streak_bonus) * multiplier`.",
    ],
  },
  {
    id: "exp-py-05",
    title: "Dictionaries: User Role & XP Registry",
    track: "python_basics",
    category: "DICTIONARIES",
    difficulty: "Easy",
    tree_row: 5,
    lesson_order: 5,
    is_free: true,
    description:
      "Read and update key-value pairs in a Python dictionary in O(1) instant lookup time.",
    content:
      'A **Dictionary (`{ }`)** stores labeled **`"key": value`** pairs. You can read or update any key in **O(1)** time using square brackets:\n\n```python\nuser = {"username": "coder", "xp": 100}\nuser["role"] = "admin"\nuser["xp"] = user["xp"] + 50\n```',
    assignment:
      'Complete `promote_user(user, bonus_xp)`: set `user["role"] = "admin"`, add `bonus_xp` to `user["xp"]`, and return the updated `user` dictionary.',
    constraints: [
      'Assign `user["role"] = "admin"`',
      'Update `user["xp"] = user["xp"] + bonus_xp`',
      "Return the `user` dictionary",
    ],
    examples: [
      {
        input: 'user = {"username": "nova", "xp": 100}, bonus_xp = 50',
        output: "{'username': 'nova', 'xp': 150, 'role': 'admin'}",
        explanation: 'Adds "role": "admin" and increases "xp" from 100 to 150.',
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def promote_user(user, bonus_xp):
    pass`,
    expected_output: "{'username': 'nova', 'xp': 150, 'role': 'admin'}",
    hidden_tests: `import json
results = []
try:
    r1 = promote_user({"username": "nova", "xp": 100}, 50)
    results.append({"id": 1, "input": "{'username': 'nova', 'xp': 100}, 50", "expected": "{'username': 'nova', 'xp': 150, 'role': 'admin'}", "actual": str(r1), "passed": r1 == {"username": "nova", "xp": 150, "role": "admin"}})
    r2 = promote_user({"username": "leo", "xp": 0}, 25)
    results.append({"id": 2, "input": "{'username': 'leo', 'xp': 0}, 25", "expected": "{'username': 'leo', 'xp': 25, 'role': 'admin'}", "actual": str(r2), "passed": r2 == {"username": "leo", "xp": 25, "role": "admin"}})
    r3 = promote_user({"username": "mia", "xp": 200, "role": "member"}, 0)
    results.append({"id": 3, "input": "{'username': 'mia', 'xp': 200, 'role': 'member'}, 0", "expected": "{'username': 'mia', 'xp': 200, 'role': 'admin'}", "actual": str(r3), "passed": r3 == {"username": "mia", "xp": 200, "role": "admin"}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"username"', value: '"nova"', address: "0x01" },
      { label: '"xp"', value: "100 -> 150 ✓", address: "0x02" },
      { label: '"role"', value: '"admin" ★', address: "0x03" },
    ],
    hints: [
      'Use quotes around dictionary keys: `user["role"] = "admin"`.',
      'Update XP with `user["xp"] += bonus_xp` before returning `user`.',
    ],
  },
  {
    id: "exp-py-06",
    title: "String Cleaning: Handle Normalizer",
    track: "python_basics",
    category: "STRING METHODS",
    difficulty: "Easy",
    tree_row: 6,
    lesson_order: 6,
    is_free: true,
    description:
      "Clean messy user input by chaining .strip() and .lower() on strings.",
    content:
      'Users often type extra spaces or random capital letters into sign-up forms. Chain **`.strip()`** (removes outer whitespace) and **`.lower()`** (converts to lowercase) to normalize text:\n\n```python\nraw = "   Alex_Dev  "\nclean = raw.strip().lower()\nprint(clean)  # "alex_dev"\n```',
    assignment:
      "Complete `normalize_handle(raw_handle)` so it strips leading/trailing spaces, converts the handle to lowercase, and returns it.",
    constraints: [
      "Call `.strip()` to remove outer spaces",
      "Call `.lower()` to convert all letters to lowercase",
      "Return the cleaned string",
    ],
    examples: [
      {
        input: 'raw_handle = "  Py_Ninja99  "',
        output: "py_ninja99",
        explanation: "Outer spaces are stripped and uppercase letters become lowercase.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def normalize_handle(raw_handle):
    pass`,
    expected_output: "py_ninja99",
    hidden_tests: `import json
results = []
try:
    r1 = normalize_handle("  Py_Ninja99  ")
    results.append({"id": 1, "input": "'  Py_Ninja99  '", "expected": "py_ninja99", "actual": str(r1), "passed": r1 == "py_ninja99"})
    r2 = normalize_handle(" BYTE_CAT ")
    results.append({"id": 2, "input": "' BYTE_CAT '", "expected": "byte_cat", "actual": str(r2), "passed": r2 == "byte_cat"})
    r3 = normalize_handle("   ")
    results.append({"id": 3, "input": "'   ' (spaces only)", "expected": "", "actual": str(r3), "passed": r3 == ""})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "raw_handle", value: '"  Py_Ninja99  "', type: "str", address: "0x10" },
      { label: ".strip()", value: '"Py_Ninja99"', type: "str", address: "0x14" },
      { label: ".lower()", value: '"py_ninja99" ✓', type: "str", address: "0x18" },
    ],
    hints: [
      "Remember to include empty parentheses `()` on both `.strip()` and `.lower()`.",
      "Chain them together: `return raw_handle.strip().lower()`.",
    ],
  },
  {
    id: "exp-py-07",
    title: "Filtering Lists: High-Score Qualifier",
    track: "python_basics",
    category: "LIST FILTERING",
    difficulty: "Easy",
    tree_row: 7,
    lesson_order: 7,
    is_free: true,
    description:
      "Filter a list of numbers by keeping only items that pass an if condition.",
    content:
      "To filter a list, create an empty result list `passed = []` (or use a list comprehension), loop through every item, and **`.append(item)`** only when your `if` condition is true:\n\n```python\npassed = []\nfor s in scores:\n    if s >= 80:\n        passed.append(s)\n```",
    assignment:
      "Complete `filter_passing_scores(scores, min_score)` so it returns a new list containing only the numbers in `scores` that are `>= min_score` (in their original order).",
    constraints: [
      "Keep only scores where `s >= min_score`",
      "Return the filtered list of passing scores",
    ],
    examples: [
      {
        input: "scores = [65, 92, 80, 45, 99], min_score = 80",
        output: "[92, 80, 99]",
        explanation: "92, 80, and 99 are all >= 80.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def filter_passing_scores(scores, min_score):
    pass`,
    expected_output: "[92, 80, 99]",
    hidden_tests: `import json
results = []
try:
    r1 = filter_passing_scores([65, 92, 80, 45, 99], 80)
    results.append({"id": 1, "input": "[65, 92, 80, 45, 99], 80", "expected": "[92, 80, 99]", "actual": str(r1), "passed": r1 == [92, 80, 99]})
    r2 = filter_passing_scores([10, 50, 30], 40)
    results.append({"id": 2, "input": "[10, 50, 30], 40", "expected": "[50]", "actual": str(r2), "passed": r2 == [50]})
    r3 = filter_passing_scores([], 80)
    results.append({"id": 3, "input": "[], 80 (empty list)", "expected": "[]", "actual": str(r3), "passed": r3 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "65 < 80", value: "skip", address: "idx 0" },
      { label: "92 >= 80", value: "append(92) ✓", address: "idx 1" },
      { label: "80 >= 80", value: "append(80) ✓", address: "idx 2" },
      { label: "99 >= 80", value: "append(99) ✓", address: "idx 4" },
    ],
    hints: [
      "Inside `for s in scores:`, check `if s >= min_score:`.",
      "Indent `passed.append(s)` inside the `if` block, or use `[s for s in scores if s >= min_score]`.",
    ],
  },
  {
    id: "exp-py-08",
    title: "Error Handling: Crash-Proof Win Rate",
    track: "python_basics",
    category: "TRY / EXCEPT",
    difficulty: "Easy",
    tree_row: 7,
    lesson_order: 8,
    is_free: true,
    description:
      "Prevent ZeroDivisionError crashes using a try / except safety block.",
    content:
      "Dividing by `0` raises a **`ZeroDivisionError`** and crashes your program. Wrap risky math inside **`try:`** and return a safe fallback inside **`except ZeroDivisionError:`**:\n\n```python\ntry:\n    return wins / matches\nexcept ZeroDivisionError:\n    return 0.0\n```",
    assignment:
      "Complete `safe_win_rate(wins, matches)`: inside a `try:` block return `wins / matches`, and if `matches` is `0` catch `ZeroDivisionError` and return `0.0`.",
    constraints: [
      "Use a `try:` block to return `wins / matches`",
      "Catch `ZeroDivisionError` in the `except` block and return `0.0`",
    ],
    examples: [
      {
        input: "safe_win_rate(6, 10) and safe_win_rate(0, 0)",
        output: "0.6 0.0",
        explanation: "6 / 10 is 0.6; dividing by 0 is safely caught and returns 0.0.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def safe_win_rate(wins, matches):
    pass`,
    expected_output: "0.6 0.0",
    hidden_tests: `import json
results = []
try:
    r1 = safe_win_rate(6, 10)
    results.append({"id": 1, "input": "wins=6, matches=10", "expected": "0.6", "actual": str(r1), "passed": r1 == 0.6})
    r2 = safe_win_rate(0, 0)
    results.append({"id": 2, "input": "wins=0, matches=0", "expected": "0.0", "actual": str(r2), "passed": r2 == 0.0})
    r3 = safe_win_rate(5, 0)
    results.append({"id": 3, "input": "wins=5, matches=0", "expected": "0.0", "actual": str(r3), "passed": r3 == 0.0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "6 / 10", value: "0.6 ✓", type: "float", address: "try" },
      { label: "0 / 0", value: "caught -> 0.0 🛡️", type: "float", address: "except" },
    ],
    hints: [
      "Put `return wins / matches` inside the `try:` block.",
      "Put `return 0.0` inside the `except ZeroDivisionError:` block.",
    ],
  },
  {
    id: "exp-py-09",
    title: "Counting Items: Emoji Reaction Counter",
    track: "python_basics",
    category: "LIST TOOLS",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 9,
    is_free: true,
    description:
      "Use Python's built-in .count() method to count how many times a reaction appears in a list.",
    content:
      'Want to know how many times an item appears inside a list? You don\'t even need a loop! Every Python list has a built-in **`.count(item)`** tool:\n\n```python\nreactions = ["🔥", "❤️", "🔥", "👍", "🔥"]\nfire_count = reactions.count("🔥")\nprint(fire_count)  # Prints 3\n```',
    assignment:
      "Complete `count_reactions(reactions, target)` so it returns how many times `target` appears inside the `reactions` list.",
    constraints: [
      "Use `.count(target)` on the `reactions` list",
      "Return the matching count from the function",
      "Keep the `print(...)` line at the bottom so it prints `3`",
    ],
    examples: [
      {
        input: 'reactions = ["🔥", "❤️", "🔥", "👍", "🔥"], target = "🔥"',
        output: "3",
        explanation: '"🔥" appears 3 times in the list.',
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def count_reactions(reactions, target):
    pass`,
    expected_output: "3",
    hidden_tests: `import json
results = []
try:
    r1 = count_reactions(["🔥", "❤️", "🔥", "👍", "🔥"], "🔥")
    results.append({"id": 1, "input": "Count '🔥' in 5 reactions", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = count_reactions(["👍", "👍"], "❤️")
    results.append({"id": 2, "input": "Count '❤️' when not present", "expected": "0", "actual": str(r2), "passed": r2 == 0})
    r3 = count_reactions([], "🔥")
    results.append({"id": 3, "input": "[] (empty list)", "expected": "0", "actual": str(r3), "passed": r3 == 0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: 'idx 0: "🔥"', value: "MATCH #1 ✓", address: "count = 1" },
      { label: 'idx 1: "❤️"', value: "skip", address: "count = 1" },
      { label: 'idx 2: "🔥"', value: "MATCH #2 ✓", address: "count = 2" },
      { label: 'idx 3: "👍"', value: "skip", address: "count = 2" },
      { label: 'idx 4: "🔥"', value: "MATCH #3 ✓", address: "count = 3" },
    ],
    hints: [
      "Replace `return 0` with `return reactions.count(target)`.",
      "Click '🧩 LOAD GUIDED STEPS' if you want the exact line filled in!",
    ],
  },
  {
    id: "exp-py-10",
    title: "Removing Duplicates: Clean Guest List",
    track: "python_basics",
    category: "SETS & SORTING",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 10,
    is_free: true,
    description:
      "Remove duplicate names from a party guest list in one line using set() and sorted().",
    content:
      'Sometimes a guest accidentally signs up twice. In Python:\n\n1. **`set(guests)`** automatically removes all duplicates.\n2. **`sorted(...)`** puts the remaining names in A–Z alphabetical order!\n\n```python\nguests = ["Sam", "Alex", "Sam"]\nclean = sorted(set(guests))\n# Result: [\'Alex\', \'Sam\']\n```',
    assignment:
      "Complete `clean_guest_list(guests)` so it removes duplicate names and returns them as a sorted list.",
    constraints: [
      "Use `set(guests)` to remove duplicate names",
      "Wrap it in `sorted(set(guests))` so the list is in alphabetical order",
    ],
    examples: [
      {
        input: 'guests = ["Sam", "Alex", "Sam", "Zoe", "Alex"]',
        output: "['Alex', 'Sam', 'Zoe']",
        explanation: "Duplicate 'Sam' and 'Alex' are removed and sorted A-Z.",
      },
    ],
    complexities: { time: "O(n log n)", space: "O(n)" },
    initial_code: `def clean_guest_list(guests):
    pass`,
    expected_output: "['Alex', 'Sam', 'Zoe']",
    hidden_tests: `import json
results = []
try:
    r1 = clean_guest_list(["Sam", "Alex", "Sam", "Zoe", "Alex"])
    results.append({"id": 1, "input": "['Sam', 'Alex', 'Sam', 'Zoe', 'Alex']", "expected": "['Alex', 'Sam', 'Zoe']", "actual": str(r1), "passed": r1 == ["Alex", "Sam", "Zoe"]})
    r2 = clean_guest_list(["Mia", "Mia"])
    results.append({"id": 2, "input": "['Mia', 'Mia']", "expected": "['Mia']", "actual": str(r2), "passed": r2 == ["Mia"]})
    r3 = clean_guest_list([])
    results.append({"id": 3, "input": "[] (empty list)", "expected": "[]", "actual": str(r3), "passed": r3 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"Alex"', value: "KEPT ONCE ✓", address: "slot 1" },
      { label: '"Sam"', value: "KEPT ONCE ✓", address: "slot 2" },
      { label: '"Zoe"', value: "KEPT ONCE ✓", address: "slot 3" },
    ],
    hints: [
      "Inside `clean_guest_list(guests)`, replace `return []` with `return sorted(set(guests))`.",
    ],
  },
  {
    id: "exp-py-11",
    title: "Joining Words: URL Tag Builder",
    track: "python_basics",
    category: "STRING TOOLS",
    difficulty: "Easy",
    tree_row: 9,
    lesson_order: 11,
    is_free: true,
    description:
      'Glue a list of words together with hyphens using "-".join(words).',
    content:
      'How do websites turn a list of words like `["pixel", "arcade", "game"]` into a clean URL link like `"pixel-arcade-game"`?\n\nUse Python\'s **`.join()`** tool on the separator string `"-"`: \n\n```python\nwords = ["pixel", "arcade", "game"]\nslug = "-".join(words)\nprint(slug)  # "pixel-arcade-game"\n```',
    assignment:
      'Complete `make_url_slug(words)` so it joins all the words in `words` together with a hyphen `"-"` between them.',
    constraints: [
      'Use `"-".join(words)` to glue the list of strings together',
      "Return the combined string",
    ],
    examples: [
      {
        input: 'words = ["pixel", "arcade", "game"]',
        output: "pixel-arcade-game",
        explanation: 'Each word is joined with "-" in between.',
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def make_url_slug(words):
    pass`,
    expected_output: "pixel-arcade-game",
    hidden_tests: `import json
results = []
try:
    r1 = make_url_slug(["pixel", "arcade", "game"])
    results.append({"id": 1, "input": "['pixel', 'arcade', 'game']", "expected": "pixel-arcade-game", "actual": str(r1), "passed": r1 == "pixel-arcade-game"})
    r2 = make_url_slug(["hello", "world"])
    results.append({"id": 2, "input": "['hello', 'world']", "expected": "hello-world", "actual": str(r2), "passed": r2 == "hello-world"})
    r3 = make_url_slug(["single"])
    results.append({"id": 3, "input": "['single']", "expected": "single", "actual": str(r3), "passed": r3 == "single"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "words[0]", value: '"pixel"', type: "str", address: "0x10" },
      { label: "separator", value: '"-"', type: "str", address: "0x14" },
      {
        label: "result",
        value: '"pixel-arcade-game"',
        type: "str",
        address: "0x18",
      },
    ],
    hints: ['Replace `return ""` with `return "-".join(words)`.'],
  },
  {
    id: "exp-py-12",
    title: "List Slicing: Top 3 Leaderboard Podium",
    track: "python_basics",
    category: "LIST SLICING",
    difficulty: "Easy",
    tree_row: 10,
    lesson_order: 12,
    is_free: true,
    description:
      "Grab the first 3 winners from a leaderboard list using Python slice syntax players[:3].",
    content:
      'When you have a ranked list of players and only want to show the **Top 3** on the podium, use **List Slicing (`[:3]`)**:\n\n```python\nplayers = ["Aria", "Kai", "Nova", "Leo", "Max"]\ntop_three = players[:3]\nprint(top_three)  # [\'Aria\', \'Kai\', \'Nova\']\n```',
    assignment:
      "Complete `get_top_three(players)` so it returns a slice containing only the first 3 players in the list.",
    constraints: [
      "Use `players[:3]` to slice the first 3 items",
      "Return the sliced list",
    ],
    examples: [
      {
        input: 'players = ["Aria", "Kai", "Nova", "Leo", "Max"]',
        output: "['Aria', 'Kai', 'Nova']",
        explanation:
          "players[:3] takes index 0, 1, and 2 (the first 3 players).",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def get_top_three(players):
    pass`,
    expected_output: "['Aria', 'Kai', 'Nova']",
    hidden_tests: `import json
results = []
try:
    r1 = get_top_three(["Aria", "Kai", "Nova", "Leo", "Max"])
    results.append({"id": 1, "input": "5 players -> first 3", "expected": "['Aria', 'Kai', 'Nova']", "actual": str(r1), "passed": r1 == ["Aria", "Kai", "Nova"]})
    r2 = get_top_three(["Gold", "Silver", "Bronze", "4th"])
    results.append({"id": 2, "input": "4 players -> first 3", "expected": "['Gold', 'Silver', 'Bronze']", "actual": str(r2), "passed": r2 == ["Gold", "Silver", "Bronze"]})
    r3 = get_top_three(["Solo"])
    results.append({"id": 3, "input": "fewer than 3 players", "expected": "['Solo']", "actual": str(r3), "passed": r3 == ["Solo"]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "idx 0: Aria", value: "INCLUDED (1st) 🥇", address: "[:3]" },
      { label: "idx 1: Kai", value: "INCLUDED (2nd) 🥈", address: "[:3]" },
      { label: "idx 2: Nova", value: "INCLUDED (3rd) 🥉", address: "[:3]" },
      { label: "idx 3: Leo", value: "stopped at 3", address: "outside" },
    ],
    hints: ["Replace `return []` with `return players[:3]`."],
  },
  {
    id: "exp-py-13",
    title: "Replacing Text: Chat Spoiler Filter",
    track: "python_basics",
    category: "STRING TOOLS",
    difficulty: "Easy",
    tree_row: 11,
    lesson_order: 13,
    is_free: true,
    description:
      'Use .replace("spoiler", "[HIDDEN]") to swap out words in a chat message in one line.',
    content:
      'Want to swap out a word inside a message? Every Python string has a built-in **`.replace(old, new)`** method:\n\n```python\nmsg = "Alert: spoiler ahead!"\nclean = msg.replace("spoiler", "[HIDDEN]")\nprint(clean)  # "Alert: [HIDDEN] ahead!"\n```',
    assignment:
      'Complete `hide_spoilers(message)` so it replaces every `"spoiler"` with `"[HIDDEN]"` and returns the updated string.',
    constraints: [
      'Use `message.replace("spoiler", "[HIDDEN]")`',
      "Return the updated string",
    ],
    examples: [
      {
        input: 'message = "Alert: spoiler ahead!"',
        output: "Alert: [HIDDEN] ahead!",
        explanation: '"spoiler" is swapped with "[HIDDEN]".',
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def hide_spoilers(message):
    pass`,
    expected_output: "Alert: [HIDDEN] ahead!",
    hidden_tests: `import json
results = []
try:
    r1 = hide_spoilers("Alert: spoiler ahead!")
    results.append({"id": 1, "input": "'Alert: spoiler ahead!'", "expected": "Alert: [HIDDEN] ahead!", "actual": str(r1), "passed": r1 == "Alert: [HIDDEN] ahead!"})
    r2 = hide_spoilers("No spoiler here")
    results.append({"id": 2, "input": "'No spoiler here'", "expected": "No [HIDDEN] here", "actual": str(r2), "passed": r2 == "No [HIDDEN] here"})
    r3 = hide_spoilers("All clean!")
    results.append({"id": 3, "input": "'All clean!' (no match)", "expected": "All clean!", "actual": str(r3), "passed": r3 == "All clean!"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "find", value: '"spoiler"', type: "str", address: "0x10" },
      { label: "replace", value: '"[HIDDEN]"', type: "str", address: "0x14" },
      {
        label: "output",
        value: '"Alert: [HIDDEN] ahead!"',
        type: "str",
        address: "0x18",
      },
    ],
    hints: [
      'Replace `return message` with `return message.replace("spoiler", "[HIDDEN]")`.',
    ],
  },
  {
    id: "exp-py-14",
    title: "Summing Numbers: Shopping Cart Total",
    track: "python_basics",
    category: "MATH & LISTS",
    difficulty: "Easy",
    tree_row: 11,
    lesson_order: 14,
    is_free: true,
    description:
      "Add up all item prices in a shopping cart in one line using Python's built-in sum() function.",
    content:
      "Instead of writing a loop to add numbers one by one, Python gives you **`sum(prices)`** — it adds every number in a list and returns the total immediately!\n\n```python\nprices = [15, 25, 10]\ntotal = sum(prices)\nprint(total)  # 50\n```",
    assignment:
      "Complete `get_cart_total(prices)` so it returns the sum of all numbers in `prices` using `sum(prices)`.",
    constraints: [
      "Use `sum(prices)` to add all numbers in the list",
      "Return the total",
    ],
    examples: [
      {
        input: "prices = [15, 25, 10]",
        output: "50",
        explanation: "15 + 25 + 10 = 50.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def get_cart_total(prices):
    pass`,
    expected_output: "50",
    hidden_tests: `import json
results = []
try:
    r1 = get_cart_total([15, 25, 10])
    results.append({"id": 1, "input": "[15, 25, 10]", "expected": "50", "actual": str(r1), "passed": r1 == 50})
    r2 = get_cart_total([5, 5, 5, 5])
    results.append({"id": 2, "input": "[5, 5, 5, 5]", "expected": "20", "actual": str(r2), "passed": r2 == 20})
    r3 = get_cart_total([])
    results.append({"id": 3, "input": "[] (empty cart)", "expected": "0", "actual": str(r3), "passed": r3 == 0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "item 1: $15", value: "running = 15", address: "0x01" },
      { label: "item 2: $25", value: "running = 40", address: "0x02" },
      { label: "item 3: $10", value: "sum = 50 ✓", address: "0x03" },
    ],
    hints: ["Replace `return 0` with `return sum(prices)`."],
  },
  {
    id: "exp-py-15",
    title: "Checking Prefixes: HTTPS Link Checker",
    track: "python_basics",
    category: "STRING TOOLS",
    difficulty: "Easy",
    tree_row: 12,
    lesson_order: 15,
    is_free: true,
    description:
      'Check if a website URL starts with "https://" using Python\'s .startswith() method.',
    content:
      'How does your browser know whether to show the security lock icon? It checks if the web address starts with **`"https://"`** using **`.startswith()`**:\n\n```python\nurl = "https://arcade.dev"\nprint(url.startswith("https://"))  # True\n```',
    assignment:
      'Complete `is_secure_link(url)` so it returns `True` if `url` starts with `"https://"`, or `False` otherwise.',
    constraints: [
      'Use `url.startswith("https://")`',
      "Return the boolean result",
    ],
    examples: [
      {
        input: 'url = "https://arcade.dev" and url = "http://old.site"',
        output: "True False",
        explanation:
          '"https://arcade.dev" starts with "https://", while "http://old.site" does not.',
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def is_secure_link(url):
    pass`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = is_secure_link("https://arcade.dev")
    results.append({"id": 1, "input": "'https://arcade.dev'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_secure_link("http://old.site")
    results.append({"id": 2, "input": "'http://old.site'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    r3 = is_secure_link("http://site.dev?next=https://ok")
    results.append({"id": 3, "input": "embedded https:// not at start", "expected": "False", "actual": str(r3), "passed": r3 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      {
        label: '"https://arcade.dev"',
        value: "startswith('https://') -> True 🔒",
        type: "bool",
        address: "0x10",
      },
      {
        label: '"http://old.site"',
        value: "startswith('https://') -> False",
        type: "bool",
        address: "0x14",
      },
    ],
    hints: [
      'Replace `return False` with `return url.startswith("https://")`.',
    ],
  },
  {
    id: "exp-py-16",
    title: "Dictionary Defaults: Safe Theme Lookup",
    track: "python_basics",
    category: "DICTIONARIES",
    difficulty: "Easy",
    tree_row: 13,
    lesson_order: 16,
    is_free: true,
    description:
      'Safely read the "theme" key from a settings dictionary or default to "light" using .get().',
    content:
      'If a new user hasn\'t picked a color theme yet, `settings["theme"]` would crash with a `KeyError`.\n\nInstead, **`settings.get("theme", "light")`** returns their saved theme, or safely falls back to `"light"` if `"theme"` isn\'t in the dictionary!\n\n```python\nmode = settings.get("theme", "light")\n```',
    assignment:
      'Complete `get_user_theme(settings)` so it returns `settings.get("theme", "light")`.',
    constraints: [
      'Use `settings.get("theme", "light")`',
      "Return the theme string",
    ],
    examples: [
      {
        input: 'get_user_theme({"theme": "dark"}) and get_user_theme({})',
        output: "dark light",
        explanation:
          'Returns "dark" when present, and falls back to "light" when missing.',
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def get_user_theme(settings):
    pass`,
    expected_output: "dark light",
    hidden_tests: `import json
results = []
try:
    r1 = get_user_theme({"theme": "dark"})
    results.append({"id": 1, "input": "{'theme': 'dark'}", "expected": "dark", "actual": str(r1), "passed": r1 == "dark"})
    r2 = get_user_theme({})
    results.append({"id": 2, "input": "{} (empty settings)", "expected": "light", "actual": str(r2), "passed": r2 == "light"})
    r3 = get_user_theme({"sound": True})
    results.append({"id": 3, "input": "{'sound': True} (theme omitted)", "expected": "light", "actual": str(r3), "passed": r3 == "light"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      {
        label: '{"theme": "dark"}',
        value: '-> "dark" ✓',
        address: "key found",
      },
      {
        label: "{} (missing key)",
        value: '-> "light" (SAFE DEFAULT)',
        address: "fallback",
      },
    ],
    hints: [
      'Replace `return ""` with `return settings.get("theme", "light")`.',
    ],
  },
  {
    id: "exp-py-17",
    title: "F-Strings: Player Badge Formatter",
    track: "python_basics",
    category: "STRING FORMATTING",
    difficulty: "Easy",
    tree_row: 14,
    lesson_order: 17,
    is_free: true,
    description:
      'Plug variables directly into a text string using an f-string: f"Player {name} - Level {level}".',
    content:
      'Instead of gluing strings and numbers together with `+`, modern Python uses **f-strings**! Put the letter **`f`** right before the opening quote, and place any variable inside curly braces **`{ }`**:\n\n```python\nname = "Aria"\nlevel = 5\nbadge = f"Player {name} - Level {level}"\nprint(badge)  # "Player Aria - Level 5"\n```',
    assignment:
      'Complete `make_badge(name, level)` so it returns `f"Player {name} - Level {level}"`.',
    constraints: [
      'Use an f-string: `f"Player {name} - Level {level}"`',
      "Return the formatted string",
    ],
    examples: [
      {
        input: 'name = "Aria", level = 5',
        output: "Player Aria - Level 5",
        explanation:
          "{name} becomes Aria and {level} becomes 5 inside the f-string.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def make_badge(name, level):
    pass`,
    expected_output: "Player Aria - Level 5",
    hidden_tests: `import json
results = []
try:
    r1 = make_badge("Aria", 5)
    results.append({"id": 1, "input": "name='Aria', level=5", "expected": "Player Aria - Level 5", "actual": str(r1), "passed": r1 == "Player Aria - Level 5"})
    r2 = make_badge("Kai", 12)
    results.append({"id": 2, "input": "name='Kai', level=12", "expected": "Player Kai - Level 12", "actual": str(r2), "passed": r2 == "Player Kai - Level 12"})
    r3 = make_badge("Zed", 0)
    results.append({"id": 3, "input": "name='Zed', level=0", "expected": "Player Zed - Level 0", "actual": str(r3), "passed": r3 == "Player Zed - Level 0"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "{name}", value: '"Aria"', type: "str", address: "0x10" },
      { label: "{level}", value: "5", type: "int", address: "0x14" },
      {
        label: "f-string",
        value: '"Player Aria - Level 5"',
        type: "str",
        address: "0x18",
      },
    ],
    hints: [
      'Replace `return ""` with `return f"Player {name} - Level {level}"`.',
    ],
  },
  {
    id: "exp-py-18",
    title: "Splitting Text: Sentence Word Counter",
    track: "python_basics",
    category: "STRING TOOLS",
    difficulty: "Easy",
    tree_row: 14,
    lesson_order: 18,
    is_free: true,
    description:
      "Break a sentence into a list of words with .split() and count them with len().",
    content:
      'How do writing apps count how many words you typed?\n\n1. **`sentence.split()`** chops a sentence at every space and returns a list of words.\n2. **`len(...)`** counts how many words are in that list!\n\n```python\ntext = "Python is super fun"\nwords = text.split()   # [\'Python\', \'is\', \'super\', \'fun\']\nprint(len(words))      # 4\n```',
    assignment:
      "Complete `count_words(sentence)` so it splits `sentence` into words and returns how many words there are (`len(sentence.split())`).",
    constraints: [
      "Use `sentence.split()` to break the sentence into words",
      "Wrap it in `len(sentence.split())` and return the count",
    ],
    examples: [
      {
        input: 'sentence = "Python is super fun"',
        output: "4",
        explanation:
          '.split() produces 4 words: ["Python", "is", "super", "fun"].',
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def count_words(sentence):
    pass`,
    expected_output: "4",
    hidden_tests: `import json
results = []
try:
    r1 = count_words("Python is super fun")
    results.append({"id": 1, "input": "'Python is super fun'", "expected": "4", "actual": str(r1), "passed": r1 == 4})
    r2 = count_words("Hello world")
    results.append({"id": 2, "input": "'Hello world'", "expected": "2", "actual": str(r2), "passed": r2 == 2})
    r3 = count_words("   spaced   out  words ")
    results.append({"id": 3, "input": "'   spaced   out  words '", "expected": "3", "actual": str(r3), "passed": r3 == 3})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: 'word 0: "Python"', value: "count = 1", address: "split[0]" },
      { label: 'word 1: "is"', value: "count = 2", address: "split[1]" },
      { label: 'word 2: "super"', value: "count = 3", address: "split[2]" },
      { label: 'word 3: "fun"', value: "len = 4 ✓", address: "split[3]" },
    ],
    hints: ["Replace `return 0` with `return len(sentence.split())`."],
  },
  {
    id: "exp-py-19",
    title: "List Membership: Backpack Item Check",
    track: "python_basics",
    category: "BOOLEAN LOGIC",
    difficulty: "Easy",
    tree_row: 15,
    lesson_order: 19,
    is_free: true,
    description:
      "Check if an item is inside a player's backpack list in one line using Python's 'in' keyword.",
    content:
      'Want to check if a player has a `"map"` inside their `backpack` list? Just ask Python in plain English using **`in`**:\n\n```python\nbackpack = ["torch", "map", "potion"]\nprint("map" in backpack)  # True\nprint("key" in backpack)  # False\n```',
    assignment:
      "Complete `has_item(backpack, item)` so it returns `True` if `item` is inside `backpack`, or `False` otherwise.",
    constraints: [
      "Use `item in backpack`",
      "Return the boolean result",
    ],
    examples: [
      {
        input: 'backpack = ["torch", "map", "potion"], item = "map"',
        output: "True False",
        explanation: '"map" is in the list (True); "key" is not (False).',
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def has_item(backpack, item):
    pass`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    bag = ["torch", "map", "potion"]
    r1 = has_item(bag, "map")
    results.append({"id": 1, "input": "item = 'map'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = has_item(bag, "key")
    results.append({"id": 2, "input": "item = 'key'", "expected": "False", "actual": str(r2), "passed": r2 is False})
    r3 = has_item([], "map")
    results.append({"id": 3, "input": "empty backpack []", "expected": "False", "actual": str(r3), "passed": r3 is False})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: '"torch"', value: "skip", address: "idx 0" },
      { label: '"map"', value: "FOUND -> True 🎒", address: "idx 1" },
      { label: '"potion"', value: "in backpack", address: "idx 2" },
    ],
    hints: ["Replace `return False` with `return item in backpack`."],
  },
  {
    id: "exp-py-20",
    title: "Rounding Numbers: Clean Star Rating",
    track: "python_basics",
    category: "MATH & NUMBERS",
    difficulty: "Easy",
    tree_row: 16,
    lesson_order: 20,
    is_free: true,
    description:
      "Round a messy decimal average like 4.66667 to 1 clean decimal place (4.7) using round(rating, 1).",
    content:
      "When you average app reviews, you often get long decimals like `4.6666667`. Python's built-in **`round(number, digits)`** rounds it to the exact number of decimal places you want:\n\n```python\nrating = 4.66667\nclean = round(rating, 1)\nprint(clean)  # 4.7\n```",
    assignment:
      "Complete `format_rating(rating)` so it rounds `rating` to `1` decimal place using `round(rating, 1)`.",
    constraints: [
      "Use `round(rating, 1)` to round to 1 decimal place",
      "Return the rounded number",
    ],
    examples: [
      {
        input: "rating = 4.66667",
        output: "4.7",
        explanation: "4.66667 rounded to 1 decimal place is 4.7.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def format_rating(rating):
    pass`,
    expected_output: "4.7",
    hidden_tests: `import json
results = []
try:
    r1 = format_rating(4.66667)
    results.append({"id": 1, "input": "4.66667", "expected": "4.7", "actual": str(r1), "passed": r1 == 4.7})
    r2 = format_rating(3.14159)
    results.append({"id": 2, "input": "3.14159", "expected": "3.1", "actual": str(r2), "passed": r2 == 3.1})
    r3 = format_rating(5.0)
    results.append({"id": 3, "input": "5.0", "expected": "5.0", "actual": str(r3), "passed": r3 == 5.0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "raw float", value: "4.66667", type: "float", address: "0x10" },
      { label: "digits", value: "1", type: "int", address: "0x14" },
      {
        label: "round(rating, 1)",
        value: "4.7 ⭐",
        type: "float",
        address: "0x18",
      },
    ],
    hints: ["Replace `return 0.0` with `return round(rating, 1)`."],
  },
  {
    id: "exp-py-21",
    title: "Mini-App: RPG Critical Hit Calculator",
    track: "python_basics",
    category: "MINI-APP",
    difficulty: "Easy",
    tree_row: 17,
    lesson_order: 21,
    is_free: true,
    description:
      "Build a battle damage calculator that doubles attack on critical hits and subtracts defense (minimum 1 damage).",
    content:
      "In action games and RPGs, attacking an enemy calculates damage based on weapon attack power, defense, and whether you landed a **Critical Hit**!\n\nHere's how game developers write it in 2 lines:\n1. If `is_crit` is `True`, attack power doubles (`attack * 2`), otherwise it stays `attack`.\n2. Subtract target `defense`.\n3. Make sure damage is at least 1 using **`max(dmg - defense, 1)`** so an attack never heals or deals negative damage!\n\n```python\nattack = 50\nis_crit = True\ndefense = 20\n\ndmg = (attack * 2) if is_crit else attack\nfinal_dmg = max(dmg - defense, 1)\nprint(final_dmg)  # 80\n```",
    assignment:
      "Complete `calc_damage(attack, is_crit, defense)`: double `attack` if `is_crit` is True (otherwise use normal `attack`), subtract `defense`, and return `max(dmg - defense, 1)`.",
    constraints: [
      "Double attack when `is_crit` is True (`attack * 2`), otherwise use `attack`",
      "Subtract `defense`",
      "Use `max(dmg - defense, 1)` so damage is at least 1",
    ],
    examples: [
      {
        input: "attack = 50, is_crit = True, defense = 20",
        output: "80",
        explanation: "50 * 2 = 100 base damage; 100 - 20 defense = 80 final damage.",
      },
      {
        input: "attack = 10, is_crit = False, defense = 15",
        output: "1",
        explanation: "10 - 15 = -5, but max(-5, 1) ensures at least 1 damage is dealt.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def calc_damage(attack, is_crit, defense):
    pass`,
    expected_output: "80",
    hidden_tests: `import json
results = []
try:
    r1 = calc_damage(50, True, 20)
    results.append({"id": 1, "input": "50, True, 20", "expected": "80", "actual": str(r1), "passed": r1 == 80})
    r2 = calc_damage(10, False, 15)
    results.append({"id": 2, "input": "10, False, 15", "expected": "1", "actual": str(r2), "passed": r2 == 1})
    r3 = calc_damage(30, False, 10)
    results.append({"id": 3, "input": "30, False, 10", "expected": "20", "actual": str(r3), "passed": r3 == 20})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "base attack", value: "50 ⚔️", type: "int", address: "0x10" },
      { label: "is_crit", value: "True (x2)", type: "bool", address: "0x14" },
      { label: "defense", value: "20 🛡️", type: "int", address: "0x18" },
      { label: "max(100 - 20, 1)", value: "80 💥", type: "int", address: "0x1C" },
    ],
    hints: [
      "Calculate base damage: `dmg = attack * 2 if is_crit else attack`",
      "Return `max(dmg - defense, 1)` so hits deal at least 1 damage.",
    ],
  },
  {
    id: "exp-py-22",
    title: "Mini-App: Password Strength Checker",
    track: "python_basics",
    category: "MINI-APP",
    difficulty: "Easy",
    tree_row: 17,
    lesson_order: 22,
    is_free: true,
    description:
      "Validate sign-up passwords by checking for a minimum 8-character length and at least one digit.",
    content:
      "Every login system checks passwords to protect accounts. A clean validator checks two basic rules:\n\n1. **Length**: Is the password at least 8 characters? (`len(password) >= 8`)\n2. **Numbers**: Does it contain at least 1 number? (`any(ch.isdigit() for ch in password)`)\n\nIf both pass, return `\"STRONG\"`. Otherwise, return `\"WEAK\"`!\n\n```python\npassword = \"Python99\"\nhas_num = any(ch.isdigit() for ch in password)\n\nif len(password) >= 8 and has_num:\n    print(\"STRONG\")\nelse:\n    print(\"WEAK\")\n```",
    assignment:
      "Complete `check_password(password)` so it returns `'STRONG'` if `len(password) >= 8` and contains at least one digit (`any(ch.isdigit() for ch in password)`), otherwise return `'WEAK'`.",
    constraints: [
      "Check that `len(password) >= 8`",
      "Check for at least one number using `any(ch.isdigit() for ch in password)`",
      "Return `'STRONG'` if both conditions are met, else `'WEAK'`",
    ],
    examples: [
      {
        input: 'password = "Python99"',
        output: "STRONG",
        explanation: "Length is 8 and contains digits 9, so it is STRONG.",
      },
      {
        input: 'password = "secret"',
        output: "WEAK",
        explanation: "Length is only 6 and contains no digits.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def check_password(password):
    pass`,
    expected_output: "STRONG",
    hidden_tests: `import json
results = []
try:
    r1 = check_password("Python99")
    results.append({"id": 1, "input": "'Python99'", "expected": "STRONG", "actual": str(r1), "passed": r1 == "STRONG"})
    r2 = check_password("secret")
    results.append({"id": 2, "input": "'secret'", "expected": "WEAK", "actual": str(r2), "passed": r2 == "WEAK"})
    r3 = check_password("short1")
    results.append({"id": 3, "input": "'short1'", "expected": "WEAK", "actual": str(r3), "passed": r3 == "WEAK"})
    r4 = check_password("longpasswordwithnodigits")
    results.append({"id": 4, "input": "'longpasswordwithnodigits'", "expected": "WEAK", "actual": str(r4), "passed": r4 == "WEAK"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "len >= 8", value: "len('Python99') == 8 -> OK ✅", address: "rule 1" },
      { label: "has digit", value: "any(ch.isdigit()) -> '9' ✅", address: "rule 2" },
      { label: "status", value: '"STRONG" 🔒', address: "result" },
    ],
    hints: [
      "Use `has_digit = any(ch.isdigit() for ch in password)`.",
      "Check `if len(password) >= 8 and has_digit: return 'STRONG'` else return `'WEAK'`.",
    ],
  },
  {
    id: "exp-py-23",
    title: "Mini-App: Restaurant Bill & Tip Splitter",
    track: "python_basics",
    category: "MINI-APP",
    difficulty: "Easy",
    tree_row: 18,
    lesson_order: 23,
    is_free: true,
    description:
      "Calculate each person's exact share of a dinner bill including tip percentage, rounded to 2 decimal places.",
    content:
      "When dining out with friends, splitting the bill evenly is super common!\n\nHere is how to calculate it in 2 simple steps:\n1. Compute each person's share with tip: `(total * (1 + tip_percent / 100)) / people`.\n2. Round to 2 decimal places using **`round(share, 2)`** so it represents clean dollars and cents!\n\n```python\ntotal = 100.0\ntip_percent = 20\npeople = 4\n\nshare = (total * (1 + tip_percent / 100)) / people\nprint(round(share, 2))  # 30.0\n```",
    assignment:
      "Complete `split_bill(total, tip_percent, people)` to calculate each person's share including `tip_percent` and return it rounded to 2 decimal places using `round(share, 2)`.",
    constraints: [
      "Calculate total with tip: `total * (1 + tip_percent / 100)`",
      "Divide by `people`",
      "Round to 2 decimal places with `round(..., 2)`",
    ],
    examples: [
      {
        input: "total = 100.0, tip_percent = 20, people = 4",
        output: "30.0",
        explanation: "$100 + 20% tip = $120 total. $120 / 4 people = $30.0 each.",
      },
      {
        input: "total = 75.50, tip_percent = 15, people = 3",
        output: "28.94",
        explanation: "$75.50 * 1.15 / 3 = 28.9416... rounded to 28.94.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def split_bill(total, tip_percent, people):
    pass`,
    expected_output: "30.0",
    hidden_tests: `import json
results = []
try:
    r1 = split_bill(100.0, 20, 4)
    results.append({"id": 1, "input": "100.0, 20, 4", "expected": "30.0", "actual": str(r1), "passed": r1 == 30.0})
    r2 = split_bill(75.50, 15, 3)
    results.append({"id": 2, "input": "75.50, 15, 3", "expected": "28.94", "actual": str(r2), "passed": r2 == 28.94})
    r3 = split_bill(50.0, 0, 2)
    results.append({"id": 3, "input": "50.0, 0, 2", "expected": "25.0", "actual": str(r3), "passed": r3 == 25.0})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "bill + 20% tip", value: "$120.00 🧾", type: "float", address: "0x10" },
      { label: "friends", value: "4 👥", type: "int", address: "0x14" },
      { label: "each pays", value: "$30.00 💳", type: "float", address: "0x18" },
    ],
    hints: [
      "Calculate the share: `share = (total * (1 + tip_percent / 100)) / people`.",
      "Return `round(share, 2)` to format it to 2 decimal places.",
    ],
  },
  {
    id: "exp-py-24",
    title: "Mini-App: Emoji Mood Chat Bot",
    track: "python_basics",
    category: "MINI-APP",
    difficulty: "Easy",
    tree_row: 18,
    lesson_order: 24,
    is_free: true,
    description:
      "Build a chat bot response engine using dictionary lookup (.get()), case normalization (.lower()), and f-string formatting.",
    content:
      "Chat bots and AI responders start by reading user messages and matching them to appropriate responses!\n\nThis mini-bot combines 3 essential Python skills:\n1. **`.lower()`**: Normalizes input so `\"HAPPY\"`, `\"Happy\"`, and `\"happy\"` all match!\n2. **`dict.get(key, fallback)`**: Looks up a message safely without crashing on unknown text.\n3. **`f\"Bot: {reply}\"`**: Returns the final answer in chatbot format!\n\n```python\nmoods = {\"happy\": \"🎉 Yay!\", \"tired\": \"☕ Grab coffee!\"}\nmsg = \"HAPPY\"\n\nreply = moods.get(msg.lower(), \"🤖 I hear you!\")\nprint(f\"Bot: {reply}\")  # Bot: 🎉 Yay!\n```",
    assignment:
      "Complete `bot_reply(message, mood_map)`: normalize `message` with `.lower()`, look up the response in `mood_map` with fallback `'🤖 I hear you!'`, and return `f'Bot: {reply}'`.",
    constraints: [
      "Use `message.lower()` to normalize input text",
      "Use `mood_map.get(message.lower(), '🤖 I hear you!')`",
      "Return formatted f-string: `f'Bot: {reply}'`",
    ],
    examples: [
      {
        input: 'message = "HAPPY", mood_map = {"happy": "🎉 Yay!"}',
        output: "Bot: 🎉 Yay!",
        explanation: '"HAPPY".lower() matches "happy", returning "Bot: 🎉 Yay!".',
      },
      {
        input: 'message = "curious", mood_map = {"happy": "🎉 Yay!"}',
        output: "Bot: 🤖 I hear you!",
        explanation: '"curious" is not in mood_map, so fallback "🤖 I hear you!" is used.',
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def bot_reply(message, mood_map):
    pass`,
    expected_output: "Bot: 🎉 Yay!",
    hidden_tests: `import json
results = []
try:
    moods = {"happy": "🎉 Yay!", "tired": "☕ Grab coffee!"}
    r1 = bot_reply("HAPPY", moods)
    results.append({"id": 1, "input": "'HAPPY'", "expected": "Bot: 🎉 Yay!", "actual": str(r1), "passed": r1 == "Bot: 🎉 Yay!"})
    r2 = bot_reply("tired", moods)
    results.append({"id": 2, "input": "'tired'", "expected": "Bot: ☕ Grab coffee!", "actual": str(r2), "passed": r2 == "Bot: ☕ Grab coffee!"})
    r3 = bot_reply("unknown_mood", moods)
    results.append({"id": 3, "input": "'unknown_mood'", "expected": "Bot: 🤖 I hear you!", "actual": str(r3), "passed": r3 == "Bot: 🤖 I hear you!"})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "input.lower()", value: '"happy"', type: "str", address: "0x10" },
      { label: "mood_map.get()", value: '"🎉 Yay!"', type: "str", address: "0x14" },
      { label: "bot response", value: '"Bot: 🎉 Yay!" 🤖', type: "str", address: "0x18" },
    ],
    hints: [
      "Use `reply = mood_map.get(message.lower(), '🤖 I hear you!')`.",
      "Return `f'Bot: {reply}'` to format the message.",
    ],
  },
  {
    id: "exp-py-25",
    title: "Comprehensions: Filter & Map Records",
    track: "python_basics",
    category: "MODERN PYTHON",
    difficulty: "Medium",
    tree_row: 19,
    lesson_order: 25,
    is_free: true,
    description:
      "Transform and filter collections in one expressive comprehension using a dict comprehension.",
    content:
      "A **dict comprehension** builds a new dictionary from filtered items cleanly in a single line:\n\n```python\npassed = {name.strip(): score for name, score in records if score >= 70}\n```\n\nIt replaces boilerplate `result = {}` + `for` + `if` blocks with concise, Pythonic code.",
    assignment:
      "Complete `passing_score_map(records, min_score)`: given `(name, score)` tuples, return a dictionary mapping `name.strip()` to `score` ONLY for rows where `score >= min_score`.",
    constraints: [
      "Strip surrounding spaces from each `name` using `.strip()`",
      "Include entries only when `score >= min_score`",
      "Return a `dict` mapping cleaned names to integer scores",
    ],
    examples: [
      {
        input: 'records = [(" Aria ", 92), ("Kai", 64)], min_score = 70',
        output: "{'Aria': 92}",
        explanation: "Kai (64) is filtered out; ' Aria ' trims to 'Aria'.",
      },
    ],
    complexities: { time: "O(n)", space: "O(k)" },
    initial_code: `def passing_score_map(records, min_score):
    pass`,
    expected_output: "{'Aria': 92}",
    hidden_tests: `import json
results = []
try:
    r1 = passing_score_map([(" Aria ", 92), ("Kai", 64), ("Leo", 70)], 70)
    results.append({"id": 1, "input": "min_score=70 boundary", "expected": "{'Aria': 92, 'Leo': 70}", "actual": str(r1), "passed": r1 == {"Aria": 92, "Leo": 70}})
    r2 = passing_score_map([("Bob", 40)], 80)
    results.append({"id": 2, "input": "none passing", "expected": "{}", "actual": str(r2), "passed": r2 == {}})
    r3 = passing_score_map([], 50)
    results.append({"id": 3, "input": "empty records", "expected": "{}", "actual": str(r3), "passed": r3 == {}})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: "(' Aria ', 92)", value: "92 >= 70 -> store 'Aria': 92", type: "dict", address: "0x25" },
      { label: "('Kai', 64)", value: "64 < 70 -> skipped", type: "skip", address: "0x26" },
    ],
    hints: [
      "Write `return {name.strip(): score for name, score in records if score >= min_score}`.",
    ],
  },
  {
    id: "exp-py-26",
    title: "OOP State: WalletAccount Class",
    track: "python_basics",
    category: "OBJECT ORIENTED",
    difficulty: "Medium",
    tree_row: 20,
    lesson_order: 26,
    is_free: true,
    description:
      "Model real entities cleanly with classes, `__init__` state, and validation methods.",
    content:
      "In **Object-Oriented Programming (OOP)**, a `class` bundles state (`self.balance`) together with safe methods that modify it:\n\n```python\nclass Counter:\n    def __init__(self, start=0):\n        self.value = start\n    def inc(self, step):\n        self.value += step\n```",
    assignment:
      "Implement `class WalletAccount` with `__init__(self, balance=0)` storing `self.balance`, `deposit(self, amount)` returning `self.balance` after adding positive amounts, and `withdraw(self, amount)` returning `True` (and deducting) if `0 < amount <= self.balance`, else `False`.",
    constraints: [
      "Store `self.balance = balance` in `__init__`",
      "`deposit(amount)` adds `amount` if `amount > 0` and returns `self.balance`",
      "`withdraw(amount)` guards against overdraft (`amount > self.balance`) and returns `False` without changing `self.balance`",
    ],
    examples: [
      {
        input: "w = WalletAccount(100); w.deposit(50); w.withdraw(120); w.withdraw(50)",
        output: "150, True, False (balance=30)",
        explanation: "Overdraft of 50 when balance is 30 returns False cleanly.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `class WalletAccount:
    def __init__(self, balance=0):
        pass

    def deposit(self, amount):
        pass

    def withdraw(self, amount):
        pass`,
    expected_output: "True",
    hidden_tests: `import json
results = []
try:
    w = WalletAccount(100)
    d1 = w.deposit(50)
    bal1 = getattr(w, "balance", None)
    results.append({"id": 1, "input": "deposit(50) from 100", "expected": "150", "actual": str(d1), "passed": d1 == 150 and bal1 == 150})
    w1 = w.withdraw(120)
    bal2 = getattr(w, "balance", None)
    results.append({"id": 2, "input": "withdraw(120) succeeds", "expected": "True (bal=30)", "actual": f"{w1} (bal={bal2})", "passed": w1 is True and bal2 == 30})
    w2 = w.withdraw(50)
    bal3 = getattr(w, "balance", None)
    results.append({"id": 3, "input": "withdraw(50) overdraft blocked", "expected": "False (bal=30)", "actual": f"{w2} (bal={bal3})", "passed": w2 is False and bal3 == 30})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "self.balance", value: "100 -> 150 -> 30", type: "int", address: "0xW1" },
      { label: "withdraw(50)", value: "50 > 30 -> False", type: "bool", address: "0xW2" },
    ],
    hints: [
      "Inside `deposit`: `if amount > 0: self.balance += amount` then `return self.balance`.",
      "Inside `withdraw`: `if 0 < amount <= self.balance: self.balance -= amount; return True` else `return False`.",
    ],
  },
  {
    id: "exp-py-27",
    title: "Regex & Parsing: Log Error Extractor",
    track: "python_basics",
    category: "REGEX & PARSING",
    difficulty: "Medium",
    tree_row: 21,
    lesson_order: 27,
    is_free: true,
    description:
      "Extract structured error codes from raw server logs using Python's built-in `re` module.",
    content:
      "Python's `re` module extracts matching tokens cleanly with **`re.findall(pattern, text)`**:\n\n```python\nimport re\ncodes = re.findall(r\"ERR-\\d+\", \"timeout ERR-404 and ERR-500\")\n# ['ERR-404', 'ERR-500']\n```",
    assignment:
      'Complete `extract_error_codes(log_text)`: import `re` and return a list of all tokens matching `ERR-` followed by one or more digits (e.g. `ERR-404`, `ERR-503`) in order of appearance.',
    constraints: [
      "Use `re.findall(r\"ERR-\\d+\", log_text)`",
      "Return `[]` when no valid error code appears",
    ],
    examples: [
      {
        input: 'log_text = "[WARN] ERR-404 retry ERR-503 ERR-bad"',
        output: "['ERR-404', 'ERR-503']",
        explanation: "'ERR-bad' has no digits after 'ERR-', so only digits match.",
      },
    ],
    complexities: { time: "O(n)", space: "O(k)" },
    initial_code: `def extract_error_codes(log_text):
    pass`,
    expected_output: "['ERR-404', 'ERR-503']",
    hidden_tests: `import json
results = []
try:
    r1 = extract_error_codes("[WARN] ERR-404 retry ERR-503 ERR-bad")
    results.append({"id": 1, "input": "mixed valid and invalid", "expected": "['ERR-404', 'ERR-503']", "actual": str(r1), "passed": r1 == ["ERR-404", "ERR-503"]})
    r2 = extract_error_codes("200 OK healthy")
    results.append({"id": 2, "input": "no errors", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    r3 = extract_error_codes("ERR-1 -> ERR-9999")
    results.append({"id": 3, "input": "variable digit lengths", "expected": "['ERR-1', 'ERR-9999']", "actual": str(r3), "passed": r3 == ["ERR-1", "ERR-9999"]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "match 1", value: "'ERR-404'", type: "str", address: "re[0]" },
      { label: "match 2", value: "'ERR-503'", type: "str", address: "re[1]" },
    ],
    hints: [
      "Put `import re` at the top (or inside the function) and return `re.findall(r\"ERR-\\d+\", log_text)`.",
    ],
  },
  {
    id: "exp-py-28",
    title: "Decorators & Mini Test Runner",
    track: "python_basics",
    category: "DECORATORS & TESTING",
    difficulty: "Medium",
    tree_row: 22,
    lesson_order: 28,
    is_free: true,
    description:
      "Wrap functions with decorators to count invocations cleanly like logging and test harnesses.",
    content:
      "A Python **decorator** wraps a function `fn` and returns an inner `wrapper(*args, **kwargs)` function that runs extra logic before/after calling `fn`:\n\n```python\ndef with_calls(fn):\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        return fn(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n```",
    assignment:
      "Complete `count_calls(fn)`: return a wrapper function storing `.calls = 0` that increments `wrapper.calls += 1` every time it is called and returns `fn(*args, **kwargs)`.",
    constraints: [
      "Initialize `wrapper.calls = 0` before returning `wrapper`",
      "Support arbitrary positional & keyword arguments via `*args, **kwargs`",
      "Increment `wrapper.calls += 1` on every invocation and forward `fn`'s return value",
    ],
    examples: [
      {
        input: "wrapped = count_calls(lambda x: x + 1); wrapped(4); wrapped(9); wrapped.calls",
        output: "2",
        explanation: "Each call increments wrapper.calls and returns x + 1 (5, then 10).",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def count_calls(fn):
    pass`,
    expected_output: "2",
    hidden_tests: `import json
results = []
try:
    wrapped = count_calls(lambda x, mult=1: (x + 1) * mult)
    is_wrap = callable(wrapped)
    v0 = getattr(wrapped, "calls", None) if is_wrap else None
    v1 = wrapped(4) if is_wrap else None
    v2 = wrapped(9, mult=2) if is_wrap else None
    v_calls = getattr(wrapped, "calls", None) if is_wrap else None
    results.append({"id": 1, "input": "initial .calls == 0", "expected": "0", "actual": str(v0), "passed": is_wrap and v0 == 0})
    results.append({"id": 2, "input": "forwards return values", "expected": "(5, 20)", "actual": str((v1, v2)), "passed": is_wrap and (v1, v2) == (5, 20)})
    results.append({"id": 3, "input": "calls incremented to 2", "expected": "2", "actual": str(v_calls), "passed": is_wrap and v_calls == 2})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "memory",
    visual_data: [
      { label: "init", value: "wrapper.calls = 0", type: "int", address: "0xD0" },
      { label: "call #1", value: "calls=1 -> fn(4)=5", type: "fn", address: "0xD1" },
      { label: "call #2", value: "calls=2 -> fn(9, mult=2)=20", type: "fn", address: "0xD2" },
    ],
    hints: [
      "Define `def wrapper(*args, **kwargs):` inside `count_calls(fn)`.",
      "Set `wrapper.calls = 0` on `wrapper`, increment `wrapper.calls += 1` inside it, and `return wrapper`.",
    ],
  },
];
