export interface ToolVariation {
  label: string;
  code: string;
  output: string;
  note: string;
}

export interface LessonToolSpec {
  toolName: string;
  badge: string;
  purpose: string;
  syntaxPattern: string;
  variations: ToolVariation[];
}

export interface LessonToolboxEntry {
  matchTrack: string;
  matchOrder: number;
  tools: LessonToolSpec[];
}

export const LESSON_TOOLBOXES: LessonToolboxEntry[] = [
  // ============================================================================
  // PYTHON BASICS (MODULES 01 - 16)
  // ============================================================================
  {
    matchTrack: "python_basics",
    matchOrder: 1,
    tools: [
      {
        toolName: "print() — Screen Output Function",
        badge: "CORE FUNCTION",
        purpose:
          "Displays text, variable values, or calculation results in the console output panel.",
        syntaxPattern: "print(item_1, item_2, ...)",
        variations: [
          {
            label: "1. Print plain text (String)",
            code: 'print("System Online")',
            output: "System Online",
            note: 'Wrap words in quotes (" " or \' \') so Python prints those exact characters.',
          },
          {
            label: "2. Print a variable's value",
            code: "score = 250\nprint(score)",
            output: "250",
            note: "Do NOT put quotes around variable names — Python looks up what is stored inside.",
          },
          {
            label: "3. Print multiple items with commas",
            code: 'level = 3\nprint("Level:", level, "Cleared!")',
            output: "Level: 3 Cleared!",
            note: "Separate items with commas (,) and print() automatically puts a space between them.",
          },
          {
            label: "4. Print with an f-string (Formatted Text)",
            code: 'user = "Ada"\nprint(f"Welcome, {user}!")',
            output: "Welcome, Ada!",
            note: "Put f before the opening quote and {variable} inside to plug values right into text.",
          },
        ],
      },
      {
        toolName: "= — Variable Assignment & Data Types",
        badge: "CORE SYNTAX",
        purpose:
          "Creates a named label in memory and stores a value (text, number, or True/False) inside it.",
        syntaxPattern: "variable_name = value",
        variations: [
          {
            label: "1. Store text (String)",
            code: 'hero_name = "Nova"',
            output: 'hero_name -> "Nova" (str)',
            note: "Anything wrapped in quotes is stored as a text string.",
          },
          {
            label: "2. Store whole or decimal numbers (int / float)",
            code: "coins = 100\nspeed = 4.5",
            output: "coins -> 100, speed -> 4.5",
            note: "Numbers are written WITHOUT quotes so you can do math (+, -, *, /) with them.",
          },
          {
            label: "3. Store an ON/OFF switch (Boolean)",
            code: "is_ready = True\ngame_over = False",
            output: "is_ready -> True (bool)",
            note: "True and False must start with a capital T and capital F (no quotes).",
          },
          {
            label: "4. Update an existing variable",
            code: "coins = 100\ncoins = coins + 50",
            output: "coins -> 150",
            note: "Python calculates the right side first (100 + 50), then saves 150 back into coins.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 2,
    tools: [
      {
        toolName: "for ... in — Loop Over a Collection",
        badge: "LOOP CONTROL",
        purpose:
          "Visits each item in a list one by one and runs your indented code block on every item.",
        syntaxPattern: "for item_variable in my_list:\n    # indented action",
        variations: [
          {
            label: "1. Print every item in a list",
            code: 'for fruit in ["apple", "pear"]:\n    print(fruit)',
            output: "apple\npear",
            note: "fruit automatically becomes 'apple' on run 1, and 'pear' on run 2.",
          },
          {
            label: "2. Add numbers into a running total",
            code: "total = 0\nfor price in [10, 25, 5]:\n    total = total + price\nprint(total)",
            output: "40",
            note: "Start total = 0 BEFORE the loop, add inside the loop, and print(total) AFTER the loop.",
          },
          {
            label: "3. Shorthand += accumulator",
            code: "total = 0\nfor n in [2, 4, 6]:\n    total += n",
            output: "total -> 12",
            note: "total += n is a clean shortcut for writing total = total + n.",
          },
          {
            label: "4. Loop N times with range()",
            code: "for i in range(3):\n    print(i)",
            output: "0\n1\n2",
            note: "range(3) generates 3 numbers starting from 0 (0, 1, 2).",
          },
        ],
      },
      {
        toolName: "[ ] — Python Lists",
        badge: "DATA STRUCTURE",
        purpose:
          "Stores multiple items in a fixed order inside square brackets.",
        syntaxPattern: "my_list = [item_0, item_1, item_2]",
        variations: [
          {
            label: "1. Create a list of numbers or strings",
            code: "scores = [10, 20, 30]",
            output: "[10, 20, 30]",
            note: "Separate each item with a comma inside square brackets [ ].",
          },
          {
            label: "2. Read an item by index position",
            code: 'items = ["sword", "shield"]\nprint(items[0])',
            output: "sword",
            note: "Index [0] is the first item; index [-1] is the last item.",
          },
          {
            label: "3. Count how many items are in a list",
            code: "print(len([10, 20, 30]))",
            output: "3",
            note: "len(my_list) returns the total number of items.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 3,
    tools: [
      {
        toolName: "if / elif / else — Decision Branching",
        badge: "CONTROL FLOW",
        purpose:
          "Runs different blocks of code depending on whether a condition is True or False.",
        syntaxPattern: "if condition:\n    ...\nelse:\n    ...",
        variations: [
          {
            label: "1. Basic if / else fork",
            code: 'if score >= 80:\n    print("Pass")\nelse:\n    print("Retry")',
            output: "Pass (when score is 80+)",
            note: "Both if and else headers must end with a colon (:) and indent the next line.",
          },
          {
            label: "2. Multi-way check with elif",
            code: 'if xp >= 100:\n    rank = "Gold"\nelif xp >= 50:\n    rank = "Silver"\nelse:\n    rank = "Bronze"',
            output: "Picks the FIRST matching branch",
            note: "elif ('else if') lets you test additional conditions in order.",
          },
          {
            label: "3. Comparison operators",
            code: "x == 10  # equal to\nx != 10  # not equal to\nx >= 10  # greater or equal",
            output: "True or False",
            note: "Always use double equals (==) to compare values; single (=) is only for creating variables.",
          },
          {
            label: "4. Combine conditions with and / or",
            code: "if age >= 18 and has_ticket:\n    print('Enter')",
            output: "Enter (only if BOTH are True)",
            note: "`and` requires both sides to be True; `or` requires at least one side to be True.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 4,
    tools: [
      {
        toolName: "def & return — Reusable Functions",
        badge: "FUNCTIONS",
        purpose:
          "Packages code into a named command that takes inputs (parameters) and hands back a result.",
        syntaxPattern: "def function_name(param):\n    return result",
        variations: [
          {
            label: "1. Function with 1 input and return",
            code: "def double(n):\n    return n * 2\n\nprint(double(15))",
            output: "30",
            note: "`return` sends the calculated value back to wherever the function was called.",
          },
          {
            label: "2. Function with 2 inputs",
            code: "def add_bonus(base, bonus):\n    return base + bonus\n\nprint(add_bonus(100, 25))",
            output: "125",
            note: "Separate multiple input parameters with commas inside the parentheses.",
          },
          {
            label: "3. Function with a default parameter",
            code: 'def greet(name="Player"):\n    return f"Hi {name}"\n\nprint(greet())',
            output: "Hi Player",
            note: "If no argument is passed, Python uses the default value after '='.",
          },
          {
            label: "4. return vs. print() inside a function",
            code: "ans = double(10)  # ans is 20 because double() used return",
            output: "20",
            note: "If a function only uses print() without return, calling it gives back None!",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 5,
    tools: [
      {
        toolName: "{ key: value } — Python Dictionaries",
        badge: "KEY-VALUE MAP",
        purpose:
          "Stores labeled data pairs so you can look up or update any field by its key name in O(1) time.",
        syntaxPattern: 'my_dict = {"key": value}',
        variations: [
          {
            label: "1. Create a dictionary with key: value pairs",
            code: 'user = {"username": "coder", "level": 4}',
            output: "{'username': 'coder', 'level': 4}",
            note: "Each key and value is separated by a colon (:), and pairs are separated by commas.",
          },
          {
            label: "2. Read a value by key",
            code: 'print(user["username"])',
            output: "coder",
            note: 'Use square brackets with the key name in quotes: user["username"].',
          },
          {
            label: "3. Add or update a key-value pair",
            code: 'user["role"] = "admin"',
            output: "Adds 'role': 'admin' to user",
            note: "Assigning to user['role'] creates the key if new, or overwrites it if it already exists.",
          },
          {
            label: "4. Safe lookup with .get(key, default)",
            code: 'print(user.get("badge", "none"))',
            output: "none",
            note: ".get() returns the fallback value instead of crashing if the key is missing.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 6,
    tools: [
      {
        toolName: ".strip() / .lower() / .upper() — String Methods",
        badge: "STRING TOOLS",
        purpose:
          "Cleans and normalizes messy user text by trimming extra whitespace and changing letter case.",
        syntaxPattern: "clean_text = raw_text.strip().lower()",
        variations: [
          {
            label: "1. Trim outer spaces with .strip()",
            code: 'print("   hello   ".strip())',
            output: "hello",
            note: "Removes spaces, tabs, and newlines from both the left and right ends.",
          },
          {
            label: "2. Convert to lowercase with .lower()",
            code: 'print("AlEx_99".lower())',
            output: "alex_99",
            note: "Great for comparing usernames or emails regardless of capitalization.",
          },
          {
            label: "3. Convert to UPPERCASE with .upper()",
            code: 'print("vip".upper())',
            output: "VIP",
            note: "Turns every letter into uppercase.",
          },
          {
            label: "4. Chain multiple methods in one line",
            code: 'print("  Admin_User  ".strip().lower())',
            output: "admin_user",
            note: "You can chain .strip().lower() back-to-back from left to right!",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 7,
    tools: [
      {
        toolName: ".append() & Filtering Loops",
        badge: "LIST FILTERING",
        purpose:
          "Builds a new list containing only the items that pass an if-condition check.",
        syntaxPattern: "for item in items:\n    if condition:\n        result.append(item)",
        variations: [
          {
            label: "1. Add a single item to a list with .append()",
            code: "bag = [10, 20]\nbag.append(30)\nprint(bag)",
            output: "[10, 20, 30]",
            note: ".append(x) attaches x to the very end of the list in place.",
          },
          {
            label: "2. Filter items with for + if + .append()",
            code: "high = []\nfor s in [50, 90, 85]:\n    if s >= 80:\n        high.append(s)",
            output: "high -> [90, 85]",
            note: "Only items that pass `if s >= 80:` get appended into `high`.",
          },
          {
            label: "3. One-line List Comprehension shortcut",
            code: "high = [s for s in [50, 90, 85] if s >= 80]",
            output: "[90, 85]",
            note: "Python's compact 1-line way to filter a list.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 8,
    tools: [
      {
        toolName: "try / except — Crash-Proof Error Handling",
        badge: "ERROR SAFETY",
        purpose:
          "Attempts risky code inside `try:` and gracefully recovers inside `except:` if an error occurs.",
        syntaxPattern: "try:\n    risky_action()\nexcept ErrorType:\n    fallback_action()",
        variations: [
          {
            label: "1. Catch division by zero",
            code: "try:\n    ans = 10 / 0\nexcept ZeroDivisionError:\n    ans = 0",
            output: "ans -> 0 (no crash!)",
            note: "If b is 0, Python jumps straight to the except block instead of crashing.",
          },
          {
            label: "2. Catch invalid number conversion",
            code: 'try:\n    num = int("abc")\nexcept ValueError:\n    num = -1',
            output: "num -> -1",
            note: "ValueError happens when int() receives text that isn't a valid number.",
          },
          {
            label: "3. Catch any general exception",
            code: "try:\n    return data[index]\nexcept Exception:\n    return None",
            output: "Returns None if index is out of range",
            note: "`except Exception:` catches any standard runtime error.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 9,
    tools: [
      {
        toolName: ".count() — Frequency Counter",
        badge: "SEQUENCE METHOD",
        purpose:
          "Counts how many times a target value appears inside a list or a string.",
        syntaxPattern: "collection.count(target_value)",
        variations: [
          {
            label: "1. Count matching items in a list",
            code: 'votes = ["🔥", "👍", "🔥"]\nprint(votes.count("🔥"))',
            output: "2",
            note: "Scans the list and returns the exact number of matches.",
          },
          {
            label: "2. Count when item is not present",
            code: 'print(["a", "b"].count("z"))',
            output: "0",
            note: "Safely returns 0 (never crashes) when the target item isn't found.",
          },
          {
            label: "3. Count characters/substrings in a string",
            code: 'print("banana".count("a"))',
            output: "3",
            note: ".count() also works on text strings to count letters or words!",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 10,
    tools: [
      {
        toolName: "set() & sorted() — Deduplicate and Order",
        badge: "BUILT-IN FUNCTIONS",
        purpose:
          "Removes duplicate values with `set()` and orders items from smallest to largest with `sorted()`.",
        syntaxPattern: "sorted(set(items))",
        variations: [
          {
            label: "1. Remove duplicates with set()",
            code: "unique = set([3, 1, 3, 2])",
            output: "{1, 2, 3}",
            note: "A set automatically drops any duplicate values.",
          },
          {
            label: "2. Sort ascending (A-Z or 0-9) with sorted()",
            code: 'print(sorted(["Zoe", "Alex", "Mia"]))',
            output: "['Alex', 'Mia', 'Zoe']",
            note: "sorted() always returns a brand-new ordered list.",
          },
          {
            label: "3. Sort descending (High to Low)",
            code: "print(sorted([10, 50, 30], reverse=True))",
            output: "[50, 30, 10]",
            note: "Add reverse=True to sort from highest to lowest.",
          },
          {
            label: "4. Combine sorted(set(...))",
            code: 'print(sorted(set(["Sam", "Alex", "Sam"])))',
            output: "['Alex', 'Sam']",
            note: "Deduplicates first, then returns a clean sorted list!",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 11,
    tools: [
      {
        toolName: ".join() — List-to-String Builder",
        badge: "STRING METHOD",
        purpose:
          "Glues a list of strings together into a single string using a separator in between.",
        syntaxPattern: '"separator".join(list_of_strings)',
        variations: [
          {
            label: "1. Join words with a hyphen (-)",
            code: 'print("-".join(["pixel", "arcade", "pro"]))',
            output: "pixel-arcade-pro",
            note: "Places '-' between every word in the list.",
          },
          {
            label: "2. Join words into a normal sentence with a space",
            code: 'print(" ".join(["Hello", "there!"]))',
            output: "Hello there!",
            note: 'Calling " ".join(words) puts a single space between words.',
          },
          {
            label: "3. Join characters with no separator",
            code: 'print("".join(["P", "Y", "3"]))',
            output: "PY3",
            note: 'An empty string "" glues characters directly together.',
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 12,
    tools: [
      {
        toolName: "list[start:stop:step] — List & String Slicing",
        badge: "SLICE SYNTAX",
        purpose:
          "Extracts a sub-section of a list or string without modifying the original.",
        syntaxPattern: "items[start : stop]",
        variations: [
          {
            label: "1. Grab the first N items: items[:N]",
            code: 'players = ["A", "B", "C", "D"]\nprint(players[:3])',
            output: "['A', 'B', 'C']",
            note: "Leaving start blank ([:3]) starts at index 0 and takes 3 items.",
          },
          {
            label: "2. Grab from index N to the end: items[N:]",
            code: "print(players[2:])",
            output: "['C', 'D']",
            note: "Leaving stop blank ([2:]) slices from index 2 through the end.",
          },
          {
            label: "3. Grab the last N items: items[-N:]",
            code: "print(players[-2:])",
            output: "['C', 'D']",
            note: "Negative indices count backward from the end of the list.",
          },
          {
            label: "4. Reverse a list or string: items[::-1]",
            code: "print(players[::-1])",
            output: "['D', 'C', 'B', 'A']",
            note: "A step of -1 walks backward through the entire sequence.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 13,
    tools: [
      {
        toolName: ".replace(old, new) — Find and Swap Text",
        badge: "STRING METHOD",
        purpose:
          "Finds occurrences of a substring and swaps them with replacement text.",
        syntaxPattern: "text.replace(old_substring, new_substring)",
        variations: [
          {
            label: "1. Replace every match in a string",
            code: 'print("spoiler alert".replace("spoiler", "[HIDDEN]"))',
            output: "[HIDDEN] alert",
            note: "First argument is what to find; second argument is what to put in its place.",
          },
          {
            label: "2. Remove a substring by replacing with ''",
            code: 'print("$49.99".replace("$", ""))',
            output: "49.99",
            note: 'Replacing with an empty string "" deletes the character.',
          },
          {
            label: "3. Limit how many matches get replaced",
            code: 'print("ha ha ha".replace("ha", "ho", 1))',
            output: "ho ha ha",
            note: "An optional 3rd argument limits how many occurrences are replaced.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 14,
    tools: [
      {
        toolName: "sum() / min() / max() — Math Aggregators",
        badge: "BUILT-IN MATH",
        purpose:
          "Calculates the total, smallest, or largest number in a list in a single call.",
        syntaxPattern: "sum(number_list)",
        variations: [
          {
            label: "1. Add all numbers in a list with sum()",
            code: "print(sum([15, 25, 10]))",
            output: "50",
            note: "Adds every number in the list together (returns 0 for an empty list).",
          },
          {
            label: "2. Add with a starting offset: sum(list, start)",
            code: "print(sum([15, 25], 100))",
            output: "140",
            note: "The optional second argument sets the starting number before adding.",
          },
          {
            label: "3. Find smallest or largest with min() and max()",
            code: "nums = [15, 25, 10]\nprint(min(nums), max(nums))",
            output: "10 25",
            note: "min() returns the lowest number; max() returns the highest.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 15,
    tools: [
      {
        toolName: ".startswith() & .endswith() — Prefix/Suffix Checks",
        badge: "BOOLEAN CHECK",
        purpose:
          "Checks whether a string begins or ends with a specific sequence of characters.",
        syntaxPattern: "text.startswith(prefix)",
        variations: [
          {
            label: "1. Check if a URL starts with 'https://'",
            code: 'print("https://arcade.dev".startswith("https://"))',
            output: "True",
            note: "Returns a boolean (True or False) immediately.",
          },
          {
            label: "2. Check if a file ends with '.py'",
            code: 'print("main.py".endswith(".py"))',
            output: "True",
            note: ".endswith() checks the end of a string (great for file extensions).",
          },
          {
            label: "3. Check multiple prefixes at once with a tuple",
            code: 'url = "http://site.com"\nprint(url.startswith(("http://", "https://")))',
            output: "True",
            note: "Passing a tuple of strings returns True if ANY of them match!",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 16,
    tools: [
      {
        toolName: "dict.get(key, default) — Safe Key Lookup",
        badge: "DICTIONARY METHOD",
        purpose:
          "Reads a key from a dictionary and returns a safe default value if the key does not exist.",
        syntaxPattern: "my_dict.get(key, fallback_value)",
        variations: [
          {
            label: "1. Key exists -> returns saved value",
            code: 'cfg = {"theme": "dark"}\nprint(cfg.get("theme", "light"))',
            output: "dark",
            note: "Because 'theme' is present, .get() returns 'dark'.",
          },
          {
            label: "2. Key is missing -> returns fallback value",
            code: 'cfg = {}\nprint(cfg.get("theme", "light"))',
            output: "light",
            note: "Because 'theme' is missing, .get() safely returns 'light' instead of KeyError.",
          },
          {
            label: "3. Default fallback when 2nd argument is omitted",
            code: 'print({}.get("theme"))',
            output: "None",
            note: "If you don't pass a 2nd argument, .get() returns None when the key is missing.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 17,
    tools: [
      {
        toolName: 'f"..." — Formatted String Literals (f-strings)',
        badge: "STRING FORMATTING",
        purpose:
          "Embeds variables and expressions directly inside a string using curly braces { }.",
        syntaxPattern: 'f"Text {variable_1} more text {variable_2}"',
        variations: [
          {
            label: "1. Plug variables directly into text",
            code: 'name = "Aria"\nlevel = 5\nprint(f"Player {name} - Level {level}")',
            output: "Player Aria - Level 5",
            note: "Put f before the opening quote; Python automatically converts numbers like 5 into text.",
          },
          {
            label: "2. Do math or call methods inside { }",
            code: 'score = 40\nprint(f"Double score: {score * 2}")',
            output: "Double score: 80",
            note: "You can put any valid Python expression inside the curly braces { }.",
          },
          {
            label: "3. Format decimals inside an f-string",
            code: 'price = 9.5\nprint(f"Total: ${price:.2f}")',
            output: "Total: $9.50",
            note: "Adding :.2f inside the braces formats a number to 2 decimal places.",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 18,
    tools: [
      {
        toolName: ".split() — String-to-List Splitter",
        badge: "STRING METHOD",
        purpose:
          "Breaks a string into a list of smaller strings (words or tokens).",
        syntaxPattern: "text.split(optional_separator)",
        variations: [
          {
            label: "1. Split a sentence on whitespace (default)",
            code: 'words = "Python is super fun".split()\nprint(words)',
            output: "['Python', 'is', 'super', 'fun']",
            note: "With empty parentheses (), .split() cuts at any space and ignores extra spaces.",
          },
          {
            label: "2. Count words by combining len() and .split()",
            code: 'print(len("Python is super fun".split()))',
            output: "4",
            note: ".split() creates a list of 4 words, and len() returns 4.",
          },
          {
            label: "3. Split on a specific character (like a comma)",
            code: 'print("red,green,blue".split(","))',
            output: "['red', 'green', 'blue']",
            note: 'Pass "," to split CSV values or "-" to split hyphenated tags.',
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 19,
    tools: [
      {
        toolName: "in / not in — Membership Operators",
        badge: "BOOLEAN OPERATOR",
        purpose:
          "Checks whether an item exists inside a list, string, set, or dictionary.",
        syntaxPattern: "target_item in collection",
        variations: [
          {
            label: "1. Check if an item is inside a list",
            code: 'bag = ["torch", "map", "potion"]\nprint("map" in bag)',
            output: "True",
            note: "Returns True immediately as soon as it finds a matching item.",
          },
          {
            label: "2. Check if an item is NOT in a list",
            code: 'print("key" not in ["torch", "map"])',
            output: "True",
            note: "`not in` returns True when the item is absent from the collection.",
          },
          {
            label: "3. Check if a word is inside a larger string",
            code: 'print("err" in "error_log.txt")',
            output: "True",
            note: "`in` also works on strings to check if a substring appears anywhere inside!",
          },
        ],
      },
    ],
  },
  {
    matchTrack: "python_basics",
    matchOrder: 20,
    tools: [
      {
        toolName: "round(number, ndigits) — Decimal Rounding",
        badge: "BUILT-IN MATH",
        purpose:
          "Rounds a floating-point number to a chosen number of decimal places or to the nearest integer.",
        syntaxPattern: "round(number, decimal_places)",
        variations: [
          {
            label: "1. Round to 1 decimal place",
            code: "print(round(4.66667, 1))",
            output: "4.7",
            note: "The second argument (1) tells Python to keep 1 digit after the decimal point.",
          },
          {
            label: "2. Round currency to 2 decimal places",
            code: "print(round(19.995, 2))",
            output: "20.0",
            note: "Pass 2 as the second argument when rounding prices or percentages.",
          },
          {
            label: "3. Round to the nearest whole integer",
            code: "print(round(4.66667))",
            output: "5",
            note: "Omitting the second argument rounds to the closest whole int.",
          },
        ],
      },
    ],
  },
];

export function getLessonToolbox(lesson: {
  track: string;
  lesson_order: number;
  title: string;
}): LessonToolSpec[] {
  const exact = LESSON_TOOLBOXES.find(
    (entry) =>
      entry.matchTrack === lesson.track &&
      entry.matchOrder === lesson.lesson_order,
  );
  if (exact) return exact.tools;

  // Smart fallback for Algorithms & System Design tracks based on track & lesson
  if (lesson.track === "algorithms") {
    return [
      {
        toolName: "Algorithmic Lookup & Sequence Tools",
        badge: "ALGO TOOLKIT",
        purpose:
          "Core Python operations used to achieve O(1), O(log n), and O(n) time complexity.",
        syntaxPattern: "seen = {} | set(nums) | sorted(nums) | a // b",
        variations: [
          {
            label: "1. O(1) Hash Map / Set Membership (`in`)",
            code: "seen = {10, 20}\nprint(10 in seen)",
            output: "True",
            note: "Checking `x in set_or_dict` takes O(1) instant time instead of scanning a list.",
          },
          {
            label: "2. Integer Floor Division (`//`)",
            code: "mid = (left + right) // 2",
            output: "Whole integer index",
            note: "// divides and rounds down to a whole integer so it can be used as a list index.",
          },
          {
            label: "3. Sequence Comparison & Sorting (`sorted` / `[::-1]`)",
            code: "sorted(a) == sorted(b)\nclean == clean[::-1]",
            output: "True or False",
            note: "Use sorted() to compare character counts, or [::-1] to reverse a sequence.",
          },
          {
            label: "4. Fast Aggregation (`sum` / `len` / `set`)",
            code: "len(nums) != len(set(nums))",
            output: "True if duplicates exist",
            note: "Combining len(), set(), and sum() solves array problems in 1 line.",
          },
        ],
      },
    ];
  }

  return [
    {
      toolName: "Distributed Systems & Routing Operators",
      badge: "SYSTEMS TOOLKIT",
      purpose:
        "Core Python operators used for load balancing, sharding, quorum math, and backoff timers.",
      syntaxPattern: "i % n | (n // 2) + 1 | 2 ** attempt | key in cache",
      variations: [
        {
          label: "1. Modulo Wrap-Around (`%`) for Routing & Sharding",
          code: "target = request_idx % len(servers)",
          output: "0 .. len(servers) - 1",
          note: "The `%` operator returns the division remainder, cycling indices evenly across nodes.",
        },
        {
          label: "2. Strict Majority Quorum (`// 2 + 1`)",
          code: "quorum = (total_nodes // 2) + 1",
          output: "3 (for 5 nodes)",
          note: "Half the cluster (floored) plus 1 gives the minimum votes required for consensus.",
        },
        {
          label: "3. Exponential Backoff Power Operator (`**`)",
          code: "wait_sec = 2 ** retry_attempt",
          output: "1, 2, 4, 8, 16...",
          note: "`**` raises 2 to the power of retry_attempt, doubling the wait after each failure.",
        },
        {
          label: "4. O(1) Deduplication & TTL Comparison",
          code: "is_dup = req_id in seen_ids\nis_fresh = (now - saved_at) < ttl",
          output: "True or False",
          note: "Used in idempotency filters and cache expiration checks.",
        },
      ],
    },
  ];
}
