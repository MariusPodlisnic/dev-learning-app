export const PYTHON_BASICS_EXPANSION_LESSONS = [
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
      "Use `reactions.count(target)` to count matching items",
      "Return the count from the function",
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
    # 👉 Write 1 line: return reactions.count(target)
    return 0

print(count_reactions(["🔥", "❤️", "🔥", "👍", "🔥"], "🔥"))`,
    expected_output: "3",
    hidden_tests: `import json
results = []
try:
    r1 = count_reactions(["🔥", "❤️", "🔥", "👍", "🔥"], "🔥")
    results.append({"id": 1, "input": "Count '🔥' in 5 reactions", "expected": "3", "actual": str(r1), "passed": r1 == 3})
    r2 = count_reactions(["👍", "👍"], "❤️")
    results.append({"id": 2, "input": "Count '❤️' when not present", "expected": "0", "actual": str(r2), "passed": r2 == 0})
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
    # 👉 Write 1 line: return sorted(set(guests))
    return []

print(clean_guest_list(["Sam", "Alex", "Sam", "Zoe", "Alex"]))`,
    expected_output: "['Alex', 'Sam', 'Zoe']",
    hidden_tests: `import json
results = []
try:
    r1 = clean_guest_list(["Sam", "Alex", "Sam", "Zoe", "Alex"])
    results.append({"id": 1, "input": "['Sam', 'Alex', 'Sam', 'Zoe', 'Alex']", "expected": "['Alex', 'Sam', 'Zoe']", "actual": str(r1), "passed": r1 == ["Alex", "Sam", "Zoe"]})
    r2 = clean_guest_list(["Mia", "Mia"])
    results.append({"id": 2, "input": "['Mia', 'Mia']", "expected": "['Mia']", "actual": str(r2), "passed": r2 == ["Mia"]})
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
    # 👉 Write 1 line: return "-".join(words)
    return ""

print(make_url_slug(["pixel", "arcade", "game"]))`,
    expected_output: "pixel-arcade-game",
    hidden_tests: `import json
results = []
try:
    r1 = make_url_slug(["pixel", "arcade", "game"])
    results.append({"id": 1, "input": "['pixel', 'arcade', 'game']", "expected": "pixel-arcade-game", "actual": str(r1), "passed": r1 == "pixel-arcade-game"})
    r2 = make_url_slug(["hello", "world"])
    results.append({"id": 2, "input": "['hello', 'world']", "expected": "hello-world", "actual": str(r2), "passed": r2 == "hello-world"})
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
    # 👉 Write 1 line: return players[:3]
    return []

print(get_top_three(["Aria", "Kai", "Nova", "Leo", "Max"]))`,
    expected_output: "['Aria', 'Kai', 'Nova']",
    hidden_tests: `import json
results = []
try:
    r1 = get_top_three(["Aria", "Kai", "Nova", "Leo", "Max"])
    results.append({"id": 1, "input": "5 players -> first 3", "expected": "['Aria', 'Kai', 'Nova']", "actual": str(r1), "passed": r1 == ["Aria", "Kai", "Nova"]})
    r2 = get_top_three(["Gold", "Silver", "Bronze", "4th"])
    results.append({"id": 2, "input": "4 players -> first 3", "expected": "['Gold', 'Silver', 'Bronze']", "actual": str(r2), "passed": r2 == ["Gold", "Silver", "Bronze"]})
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
    # 👉 Write 1 line: return message.replace("spoiler", "[HIDDEN]")
    return message

print(hide_spoilers("Alert: spoiler ahead!"))`,
    expected_output: "Alert: [HIDDEN] ahead!",
    hidden_tests: `import json
results = []
try:
    r1 = hide_spoilers("Alert: spoiler ahead!")
    results.append({"id": 1, "input": "'Alert: spoiler ahead!'", "expected": "Alert: [HIDDEN] ahead!", "actual": str(r1), "passed": r1 == "Alert: [HIDDEN] ahead!"})
    r2 = hide_spoilers("No spoiler here")
    results.append({"id": 2, "input": "'No spoiler here'", "expected": "No [HIDDEN] here", "actual": str(r2), "passed": r2 == "No [HIDDEN] here"})
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
    # 👉 Write 1 line: return sum(prices)
    return 0

print(get_cart_total([15, 25, 10]))`,
    expected_output: "50",
    hidden_tests: `import json
results = []
try:
    r1 = get_cart_total([15, 25, 10])
    results.append({"id": 1, "input": "[15, 25, 10]", "expected": "50", "actual": str(r1), "passed": r1 == 50})
    r2 = get_cart_total([5, 5, 5, 5])
    results.append({"id": 2, "input": "[5, 5, 5, 5]", "expected": "20", "actual": str(r2), "passed": r2 == 20})
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
    # 👉 Write 1 line: return url.startswith("https://")
    return False

print(is_secure_link("https://arcade.dev"), is_secure_link("http://old.site"))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    r1 = is_secure_link("https://arcade.dev")
    results.append({"id": 1, "input": "'https://arcade.dev'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = is_secure_link("http://old.site")
    results.append({"id": 2, "input": "'http://old.site'", "expected": "False", "actual": str(r2), "passed": r2 is False})
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
    # 👉 Write 1 line: return settings.get("theme", "light")
    return ""

print(get_user_theme({"theme": "dark"}), get_user_theme({}))`,
    expected_output: "dark light",
    hidden_tests: `import json
results = []
try:
    r1 = get_user_theme({"theme": "dark"})
    results.append({"id": 1, "input": "{'theme': 'dark'}", "expected": "dark", "actual": str(r1), "passed": r1 == "dark"})
    r2 = get_user_theme({})
    results.append({"id": 2, "input": "{} (empty settings)", "expected": "light", "actual": str(r2), "passed": r2 == "light"})
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
    # 👉 Write 1 line: return f"Player {name} - Level {level}"
    return ""

print(make_badge("Aria", 5))`,
    expected_output: "Player Aria - Level 5",
    hidden_tests: `import json
results = []
try:
    r1 = make_badge("Aria", 5)
    results.append({"id": 1, "input": "name='Aria', level=5", "expected": "Player Aria - Level 5", "actual": str(r1), "passed": r1 == "Player Aria - Level 5"})
    r2 = make_badge("Kai", 12)
    results.append({"id": 2, "input": "name='Kai', level=12", "expected": "Player Kai - Level 12", "actual": str(r2), "passed": r2 == "Player Kai - Level 12"})
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
    # 👉 Write 1 line: return len(sentence.split())
    return 0

print(count_words("Python is super fun"))`,
    expected_output: "4",
    hidden_tests: `import json
results = []
try:
    r1 = count_words("Python is super fun")
    results.append({"id": 1, "input": "'Python is super fun'", "expected": "4", "actual": str(r1), "passed": r1 == 4})
    r2 = count_words("Hello world")
    results.append({"id": 2, "input": "'Hello world'", "expected": "2", "actual": str(r2), "passed": r2 == 2})
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
    # 👉 Write 1 line: return item in backpack
    return False

bag = ["torch", "map", "potion"]
print(has_item(bag, "map"), has_item(bag, "key"))`,
    expected_output: "True False",
    hidden_tests: `import json
results = []
try:
    bag = ["torch", "map", "potion"]
    r1 = has_item(bag, "map")
    results.append({"id": 1, "input": "item = 'map'", "expected": "True", "actual": str(r1), "passed": r1 is True})
    r2 = has_item(bag, "key")
    results.append({"id": 2, "input": "item = 'key'", "expected": "False", "actual": str(r2), "passed": r2 is False})
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
    # 👉 Write 1 line: return round(rating, 1)
    return 0.0

print(format_rating(4.66667))`,
    expected_output: "4.7",
    hidden_tests: `import json
results = []
try:
    r1 = format_rating(4.66667)
    results.append({"id": 1, "input": "4.66667", "expected": "4.7", "actual": str(r1), "passed": r1 == 4.7})
    r2 = format_rating(3.14159)
    results.append({"id": 2, "input": "3.14159", "expected": "3.1", "actual": str(r2), "passed": r2 == 3.1})
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
];
