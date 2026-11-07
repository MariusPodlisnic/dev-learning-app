export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CommonPitfall {
  title: string;
  wrongCode: string;
  rightCode: string;
  explanation: string;
}

export interface LessonEnrichment {
  realWorldUse: string;
  analogyTitle: string;
  analogyText: string;
  cheatSheet: string;
  quiz: LessonQuiz;
  commonPitfall?: CommonPitfall;
  guidedCode?: string;
  solutionCode?: string;
}

export interface EnrichedLessonData extends LessonEnrichment {
  matchTrack: "python_basics" | "algorithms" | "system_design";
  matchOrder?: number;
  matchKeywords: string[];
}

export const LESSON_ENRICHMENTS: EnrichedLessonData[] = [
  // ============================================================================
  // TRACK 1: PYTHON BASICS (MODULES 01 - 14)
  // ============================================================================
  {
    matchTrack: "python_basics",
    matchOrder: 1,
    matchKeywords: ["variable", "type", "data"],
    realWorldUse:
      "Used in every app: storing a player's score, a user's display name, or whether dark mode is turned on.",
    analogyTitle: "Think of Variables Like Labeled Sticky Notes",
    analogyText:
      'Imagine putting a sticky note that says `score` on a box and dropping the number `100` inside. Whenever you ask Python for `score`, it hands you back `100`.\n\n• **Strings (`"hello"`)** are words wrapped in quotes.\n• **Numbers (`42`)** are written without quotes.\n• **Booleans (`True` / `False`)** are simple ON/OFF switches.',
    cheatSheet: `# 1. Create variables with '='
username = "Alex"     # Text (String)
level = 5             # Number (Integer)
is_active = True      # Switch (Boolean)

# 2. Show them with print()
print(username)`,
    commonPitfall: {
      title: "Wrapping numbers in quotes when you want to do math",
      wrongCode: 'points = "50"  # This is text, not a number!',
      rightCode: "points = 50    # Real number you can add to!",
      explanation:
        "Numbers never need quotes around them. Only words/text use quotes!",
    },
    quiz: {
      question:
        "Which of these creates a number variable you can do math with?",
      options: ['points = "50"', "points = 50", "50 = points"],
      correctIndex: 1,
      explanation:
        'Without quotes, `50` is stored as a real number. Wrapping it in quotes (`"50"`) turns it into plain text!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 2,
    matchKeywords: ["list", "loop", "for", "array"],
    realWorldUse:
      "Used by Spotify to play each song in your playlist, and by shopping apps to add up item prices.",
    analogyTitle: "Lists Are Playlists, Loops Are Auto-Play",
    analogyText:
      "A **List** keeps multiple items in order inside square brackets `[10, 20, 30]`.\n\nA **`for` loop** is like hitting Auto-Play: Python picks up the first item, runs your indented code on it, and repeats for every item in the list.",
    cheatSheet: `prices = [10, 20, 30]
total = 0

for price in prices:
    total = total + price

print(total)  # Prints 60`,
    commonPitfall: {
      title: "Forgetting to indent the line inside the for loop",
      wrongCode: "for p in prices:\ntotal = total + p  # IndentationError!",
      rightCode: "for p in prices:\n    total = total + p  # Indented 4 spaces!",
      explanation:
        "Any line that should repeat inside the loop must be indented by 4 spaces (or 1 Tab).",
    },
    quiz: {
      question:
        'If `fruits = ["apple", "banana", "cherry"]`, how many times will `for f in fruits:` run?',
      options: ["1 time", "3 times (once per item)", "Forever"],
      correctIndex: 1,
      explanation:
        "A `for` loop runs once for every item inside the list — 3 items means 3 runs!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 3,
    matchKeywords: ["if", "else", "condition", "logic"],
    realWorldUse:
      "Used in games to check if `score >= 100` to unlock a trophy, or in apps to check if a password is correct.",
    analogyTitle: "If / Else Is a Fork in the Road",
    analogyText:
      "An **`if` statement** asks a simple Yes/No question:\n\n• If the answer is **Yes (`True`)**, Python runs the `if` block.\n• Otherwise, Python takes the **`else:`** path!",
    cheatSheet: `score = 85

if score >= 80:
    print("You passed!")
else:
    print("Try again!")`,
    commonPitfall: {
      title: "Using single '=' instead of double '==' when comparing",
      wrongCode: "if level = 10:   # SyntaxError!",
      rightCode: "if level == 10:  # Double '==' checks equality!",
      explanation:
        "Single `=` saves a value into a variable. Double `==` asks if two values are equal!",
    },
    quiz: {
      question:
        "What symbol does Python use to check if two values are equal inside an `if` statement?",
      options: [
        "Single equals: `if x = 10:`",
        "Double equals: `if x == 10:`",
        "Triple colon: `if x ::: 10`",
      ],
      correctIndex: 1,
      explanation:
        "Single `=` assigns a value, while double `==` compares two values!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 4,
    matchKeywords: ["function", "def", "return"],
    realWorldUse:
      "Used to save a recipe of code once — like `double_points(score)` — so you can reuse it anywhere.",
    analogyTitle: "Functions Are Little Vending Machines",
    analogyText:
      "1. **`def`** names your machine and what input goes in the parentheses `( )`.\n2. **`return`** hands back the finished answer!",
    cheatSheet: `def double_number(n):
    return n * 2

answer = double_number(21)
print(answer)  # Prints 42`,
    commonPitfall: {
      title: "Using print() inside a function when the test expects return",
      wrongCode: "def add_five(n):\n    print(n + 5)   # Returns None!",
      rightCode: "def add_five(n):\n    return n + 5  # Hands back the number!",
      explanation:
        "`return` sends the value back to the caller so the rest of the program can use it.",
    },
    quiz: {
      question:
        "Which keyword sends the final result back out of a function?",
      options: ["return", "give_back", "stop"],
      correctIndex: 0,
      explanation:
        "`return` hands the calculated value back to wherever the function was called!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 5,
    matchKeywords: ["dict", "key", "map", "hash"],
    realWorldUse:
      "Used to store user profiles with labeled fields like `\"username\"`, `\"email\"`, and `\"role\"`.",
    analogyTitle: "Dictionaries Are Labeled ID Cards",
    analogyText:
      'A **Dictionary (`{ }`)** stores pairs of **`"label": value`**. You can look up or add any label using square brackets: `user["role"] = "admin"`!',
    cheatSheet: `user = {
    "username": "coder",
    "role": "admin"
}

print(user["username"])  # "coder"
print(user["role"])      # "admin"`,
    commonPitfall: {
      title: "Forgetting quotes around dictionary key names",
      wrongCode: "user[role] = 'admin'    # NameError: role is not defined",
      rightCode: "user['role'] = 'admin'  # Key is a string in quotes!",
      explanation:
        'Text keys in a dictionary always need quotes around them, like `"role"`.',
    },
    guidedCode: `user = {
    "username": "coder",
    "role": "admin"
}

print(f"User {user['username']} has role {user.get('role')}")`,
    quiz: {
      question:
        'How do you set the `"role"` key to `"admin"` on a `user` dictionary?',
      options: [
        'user["role"] = "admin"',
        'user.append("role", "admin")',
        'user("role") == "admin"',
      ],
      correctIndex: 0,
      explanation:
        '`user["role"] = "admin"` adds or updates the `"role"` key on the dictionary!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 6,
    matchKeywords: ["string", "format", "clean", "strip", "lower"],
    realWorldUse:
      "Used in login forms so typing `'  Alex '` with accidental spaces and caps still matches `'alex'`.",
    analogyTitle: "Built-In Polishers for Messy Text",
    analogyText:
      "Python text strings come with handy cleaning tools you attach with a dot (`.`):\n\n• **`.strip()`** trims extra spaces off both ends.\n• **`.lower()`** turns `\"HELLO\"` into lowercase `\"hello\"`.",
    cheatSheet: `raw_name = "  Alex_Coder  "
clean_name = raw_name.strip().lower()
print(clean_name)  # "alex_coder"`,
    commonPitfall: {
      title: "Forgetting the empty parentheses () when calling .strip() or .lower()",
      wrongCode: "clean = raw.strip.lower",
      rightCode: "clean = raw.strip().lower()",
      explanation:
        "String methods are actions, so they always need `()` at the end to run!",
    },
    quiz: {
      question: 'What does `"  HI ".strip().lower()` produce?',
      options: ['"hi"', '"  hi "', '"HI"'],
      correctIndex: 0,
      explanation:
        "`.strip()` removes the outer spaces and `.lower()` makes the letters lowercase!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 7,
    matchKeywords: ["filter", "comprehension", "high", "score"],
    realWorldUse:
      "Used in online stores ('Show items under $20') and games ('Show scores of 80 or higher').",
    analogyTitle: "A VIP Bouncer for Your List",
    analogyText:
      "To keep only the numbers that pass a rule (like `score >= 80`), loop through the list and `.append(score)` to a new list whenever the `if` check passes!",
    cheatSheet: `scores = [65, 92, 88, 40]
passed = []

for s in scores:
    if s >= 80:
        passed.append(s)

print(passed)  # [92, 88]`,
    commonPitfall: {
      title: "Appending every item outside the if-statement",
      wrongCode: "for s in scores:\n    if s >= 80:\n        pass\n    passed.append(s)",
      rightCode: "for s in scores:\n    if s >= 80:\n        passed.append(s)",
      explanation:
        "Make sure `passed.append(s)` is indented inside the `if s >= 80:` block!",
    },
    quiz: {
      question: "Which method adds a new item to the end of a Python list?",
      options: [
        "my_list.append(item)",
        "my_list.push(item)",
        "my_list.add_end(item)",
      ],
      correctIndex: 0,
      explanation: "`append()` adds an item onto the end of a list!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 8,
    matchKeywords: ["try", "except", "error", "safe", "exception"],
    realWorldUse:
      "Used in calculator and payment apps so dividing by 0 returns a safe fallback instead of crashing.",
    analogyTitle: "Try / Except Is a Safety Net",
    analogyText:
      "Dividing by `0` normally crashes Python. Putting risky code inside **`try:`** and a backup value inside **`except ZeroDivisionError:`** catches the error safely!",
    cheatSheet: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return 0`,
    commonPitfall: {
      title: "Forgetting the colon ':' after try or except",
      wrongCode: "try\n    return a / b",
      rightCode: "try:\n    return a / b",
      explanation:
        "Both `try:` and `except ZeroDivisionError:` must end with a colon `:`.",
    },
    quiz: {
      question: "When does the code inside `except:` run?",
      options: [
        "Only when an error happens inside the `try:` block",
        "Every single time",
        "Before the `try:` block",
      ],
      correctIndex: 0,
      explanation:
        "If `try:` succeeds without error, Python skips `except:` completely!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 9,
    matchKeywords: ["count", "emoji", "reaction", "match"],
    realWorldUse:
      "Used in Discord, Slack, and Instagram to count how many times a specific emoji reaction was tapped.",
    analogyTitle: "One-Line Counter with .count()",
    analogyText:
      "Want to know how many times `\"🔥\"` appears in a list? Python lists have a built-in **`.count(item)`** tool that counts matches for you in 1 line!",
    cheatSheet: `votes = ["yes", "no", "yes", "yes"]

# Count how many times "yes" appears:
yes_total = votes.count("yes")
print(yes_total)  # 3`,
    commonPitfall: {
      title: "Using len(list) instead of list.count(target)",
      wrongCode: "return len(reactions)  # Counts ALL items, not just target!",
      rightCode: "return reactions.count(target)  # Counts only matching items!",
      explanation:
        "`len()` counts every item in the list, while `.count(target)` counts only items equal to `target`.",
    },
    guidedCode: `def count_reactions(reactions, target):
    # 👉 Use .count(target) on reactions and return it:
    return reactions.count(target)

print(count_reactions(["🔥", "❤️", "🔥", "👍", "🔥"], "🔥"))`,
    quiz: {
      question: 'What does `["a", "b", "a"].count("a")` return?',
      options: ["2", "3", "1"],
      correctIndex: 0,
      explanation: '`"a"` appears twice in the list, so `.count("a")` returns `2`!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 10,
    matchKeywords: ["set", "unique", "duplicate", "guest", "vip"],
    realWorldUse:
      "Used in guest lists and mailing lists so the same person doesn't get invited 3 times by mistake.",
    analogyTitle: "Removing Duplicates with set()",
    analogyText:
      "Wrapping a list in **`set(items)`** automatically erases any duplicate copies. Wrapping that in **`sorted(...)`** gives you back a neat alphabetical list!",
    cheatSheet: `names = ["Mia", "Alex", "Mia"]
unique_names = sorted(set(names))
print(unique_names)  # ['Alex', 'Mia']`,
    commonPitfall: {
      title: "Forgetting sorted() when a sorted list is expected",
      wrongCode: "return set(guests)  # Returns an unordered {set}",
      rightCode: "return sorted(set(guests))  # Returns a sorted [list]!",
      explanation:
        "`sorted(set(guests))` removes duplicates AND returns a clean ordered list.",
    },
    guidedCode: `def clean_guest_list(guests):
    # 👉 Remove duplicates with set() and sort with sorted():
    return sorted(set(guests))

print(clean_guest_list(["Sam", "Alex", "Sam", "Zoe", "Alex"]))`,
    quiz: {
      question: "What does `set([5, 5, 5])` do to the duplicate `5`s?",
      options: [
        "Keeps only one `5` and removes the duplicates",
        "Adds them up to 15",
        "Deletes all numbers",
      ],
      correctIndex: 0,
      explanation: "Sets only keep unique values, so duplicates are removed automatically!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 11,
    matchKeywords: ["join", "words", "tag", "hyphen", "sentence"],
    realWorldUse:
      "Used by blogs and stores to turn title words `[\"retro\", \"arcade\", \"hat\"]` into URL slugs `\"retro-arcade-hat\"`.",
    analogyTitle: "Gluing Words Together with .join()",
    analogyText:
      "If you have a list of words, **`\"-\".join(words)`** glues them together into a single string with `\"-\"` placed between each word!",
    cheatSheet: `words = ["python", "is", "fun"]

# Glue words together with "-" between them:
slug = "-".join(words)
print(slug)  # "python-is-fun"`,
    commonPitfall: {
      title: "Calling words.join('-') instead of '-'.join(words)",
      wrongCode: 'words.join("-")  # AttributeError: list has no .join!',
      rightCode: '"-".join(words)  # Call .join() on the separator string!',
      explanation:
        "In Python, you put the glue string first (`\"-\"`), then call `.join(words)`.",
    },
    guidedCode: `def make_url_slug(words):
    # 👉 Glue the words together with "-" using "-".join(words):
    return "-".join(words)

print(make_url_slug(["pixel", "arcade", "game"]))`,
    quiz: {
      question: 'What does `" ".join(["Hello", "World"])` return?',
      options: ['"Hello World"', '"Hello-World"', '["Hello World"]'],
      correctIndex: 0,
      explanation:
        'It joins `"Hello"` and `"World"` with a single space `" "` between them!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 12,
    matchKeywords: ["slice", "slicing", "top", "podium", "first"],
    realWorldUse:
      "Used in gaming leaderboards to grab the Top 3 winners from a list of 100 players.",
    analogyTitle: "Slicing the First N Items with [:3]",
    analogyText:
      "To grab just the first 3 items of a list, write **`players[:3]`**. It means *\"start at the beginning and stop after 3 items\"*!",
    cheatSheet: `runners = ["Gold", "Silver", "Bronze", "4th", "5th"]

# Grab the first 3 items:
podium = runners[:3]
print(podium)  # ['Gold', 'Silver', 'Bronze']`,
    commonPitfall: {
      title: "Using players[3] (1 item) instead of players[:3] (first 3 items)",
      wrongCode: "return players[3]   # Only grabs the 4th player!",
      rightCode: "return players[:3]  # Grabs a list of the first 3 players!",
      explanation:
        "The colon `:` inside `[:3]` tells Python to take a slice of the first 3 items.",
    },
    guidedCode: `def get_top_three(players):
    # 👉 Return the first 3 items using slice syntax players[:3]
    return players[:3]

print(get_top_three(["Aria", "Kai", "Nova", "Leo", "Max"]))`,
    quiz: {
      question: "How do you get the first 2 items from a list named `items`?",
      options: ["items[:2]", "items[2]", "items.first(2)"],
      correctIndex: 0,
      explanation: "`items[:2]` slices from the start of the list up to 2 items!",
    },
  },

  // ============================================================================
  // TRACK 2: ALGORITHMS (MODULES 01 - 12 — BEGINNER FRIENDLY!)
  // ============================================================================
  {
    matchTrack: "algorithms",
    matchOrder: 1,
    matchKeywords: ["two sum", "hash", "pair", "target", "lookup", "search"],
    realWorldUse:
      "Used in gift-card checkout (finding two items that add up to $50) and game matchmaking.",
    analogyTitle: "Memory Notebook vs. Asking Everyone Twice",
    analogyText:
      "As you look at each number `num`, calculate what partner number you need (`needed = target - num`). Check if `needed` is already in your `seen` dictionary!",
    cheatSheet: `seen = {}
for i, num in enumerate(nums):
    needed = target - num
    if needed in seen:
        return [seen[needed], i]
    seen[num] = i`,
    quiz: {
      question:
        "Why do we store seen numbers in a dictionary `{}`?",
      options: [
        "Looking up a key in a dictionary is instant O(1)",
        "Python doesn't allow two loops",
        "Dictionaries sort numbers automatically",
      ],
      correctIndex: 0,
      explanation:
        "Dictionary lookup (`if needed in seen:`) is instant!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 2,
    matchKeywords: ["pointer", "palindrome", "reverse", "window", "binary"],
    realWorldUse:
      "Used in text tools and DNA sequence checks to see if a word reads the same backward and forward.",
    analogyTitle: "Checking From Both Ends Toward the Middle",
    analogyText:
      "Put `left = 0` at the start and `right = len(items) - 1` at the end. Compare them, then move `left += 1` and `right -= 1` inward!",
    cheatSheet: `left = 0
right = len(items) - 1
while left < right:
    left += 1
    right -= 1`,
    quiz: {
      question: "When should a two-pointer loop stop?",
      options: [
        "When `left < right` is no longer true (they meet in the middle)",
        "After 1 step",
        "Never",
      ],
      correctIndex: 0,
      explanation: "Once `left >= right`, all pairs have been checked!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 6,
    matchKeywords: ["frequency", "count", "most", "active", "tally"],
    realWorldUse:
      "Used by Spotify Wrapped to tally your most-played artist.",
    analogyTitle: "Tally Marks in a Dictionary",
    analogyText:
      "For each item, add `1` to its count in a dictionary: `counts[item] = counts.get(item, 0) + 1`.",
    cheatSheet: `counts = {}
for item in items:
    counts[item] = counts.get(item, 0) + 1`,
    quiz: {
      question: 'What does `counts.get("alex", 0)` return the first time `"alex"` is seen?',
      options: ["0", "Error", "100"],
      correctIndex: 0,
      explanation: "It returns the default value `0` when the key isn't in the dictionary yet!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 7,
    matchKeywords: ["sliding", "window", "subarray", "consecutive", "spike"],
    realWorldUse:
      "Used in fitness apps to find your best 3-day streak of steps.",
    analogyTitle: "Sliding a Window Across a List",
    analogyText:
      "As your window moves 1 step right, add the new number entering on the right and subtract the old number leaving on the left!",
    cheatSheet: `window_sum = sum(nums[:k])
best = window_sum
for i in range(k, len(nums)):
    window_sum += nums[i] - nums[i - k]
    best = max(best, window_sum)`,
    quiz: {
      question: "How do we update a sliding window sum when moving 1 step right?",
      options: [
        "Add the new right number and subtract the old left number",
        "Delete the list",
        "Multiply by 0",
      ],
      correctIndex: 0,
      explanation: "Adding the entering value and subtracting the leaving value updates the sum in 1 step!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 8,
    matchKeywords: ["stack", "bracket", "valid", "parentheses", "lifo"],
    realWorldUse:
      "Used by code editors to check that every opening `(` has a matching closing `)`.",
    analogyTitle: "A Stack of Plates",
    analogyText:
      "Push `(` onto `stack` with `.append()`, and pop it off with `.pop()` when you see `)`!",
    cheatSheet: `stack = []
for ch in text:
    if ch == "(":
        stack.append(ch)
    elif ch == ")":
        if not stack:
            return False
        stack.pop()
return len(stack) == 0`,
    quiz: {
      question: "Which list method removes the top (last) item from a stack?",
      options: ["stack.pop()", "stack.append()", "stack.clear()"],
      correctIndex: 0,
      explanation: "`stack.pop()` removes and returns the most recently added item!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 9,
    matchKeywords: ["minimum", "cheapest", "lowest", "flight", "min"],
    realWorldUse:
      "Used by Skyscanner, Google Flights, and Uber to instantly highlight the cheapest option.",
    analogyTitle: "Remembering the Lowest Price Tag Seen So Far",
    analogyText:
      "How do you find the smallest number in a list? Python's built-in **`min(prices)`** scans the list in $O(n)$ time and hands you the lowest number immediately!",
    cheatSheet: `prices = [250, 180, 310, 145, 290]

# Find the lowest number in one line:
cheapest = min(prices)
print(cheapest)  # 145`,
    commonPitfall: {
      title: "Using max() instead of min() when looking for the lowest value",
      wrongCode: "return max(prices)  # Returns the most expensive!",
      rightCode: "return min(prices)  # Returns the cheapest!",
      explanation:
        "`min()` finds the minimum (smallest) value; `max()` finds the maximum (largest) value.",
    },
    guidedCode: `def find_cheapest_flight(prices):
    # 👉 Return the smallest price in the list using min(prices):
    return min(prices)

print(find_cheapest_flight([320, 195, 240, 160, 410]))`,
    quiz: {
      question: "What does `min([40, 12, 85, 29])` return?",
      options: ["12", "85", "40"],
      correctIndex: 0,
      explanation: "`12` is the smallest number in the list!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 10,
    matchKeywords: ["middle", "midpoint", "center", "binary"],
    realWorldUse:
      "The core step of Binary Search: jumping straight to the middle element of a sorted list.",
    analogyTitle: "Opening a Book Right to the Middle Page",
    analogyText:
      "To find the middle index of any list, divide its length by 2 using **integer division (`//`)**: `mid = len(items) // 2`, then grab `items[mid]`!",
    cheatSheet: `items = [10, 20, 30, 40, 50]

# 1. Find the middle index with // 2
mid = len(items) // 2   # 5 // 2 = 2

# 2. Read the value at that index
print(items[mid])       # 30`,
    commonPitfall: {
      title: "Using single '/' (decimal division) instead of '//' (whole number division)",
      wrongCode: "mid = len(items) / 2   # Gives 2.5 -> TypeError!",
      rightCode: "mid = len(items) // 2  # Gives whole integer 2!",
      explanation:
        "List positions must be whole numbers (`0, 1, 2...`), so always use double slash `//`!",
    },
    guidedCode: `def get_middle_item(items):
    mid = len(items) // 2
    # 👉 Return the element at index 'mid':
    return items[mid]

print(get_middle_item([10, 25, 42, 70, 99]))`,
    quiz: {
      question: "Why do we use `// 2` instead of `/ 2` when computing a list index?",
      options: [
        "Because list indices must be whole integers, not decimals like 2.5",
        "Because `/` is a comment in Python",
        "Because `//` multiplies by 2",
      ],
      correctIndex: 0,
      explanation:
        "`//` is floor division, which always gives a clean whole integer you can use inside `items[mid]`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 11,
    matchKeywords: ["mutual", "common", "intersection", "friends"],
    realWorldUse:
      "Used by Instagram, LinkedIn, and Discord to show 'Mutual Friends' between two profiles.",
    analogyTitle: "Finding Names That Appear on Both Lists",
    analogyText:
      "To find items that exist in **both** `list_a` and `list_b`, loop through `list_a` and keep any item where **`item in list_b`** is True!",
    cheatSheet: `alice_friends = ["Sam", "Mia", "Leo"]
bob_friends = ["Mia", "Zoe", "Sam"]

# Keep friends from alice_friends who are also in bob_friends:
mutual = [f for f in alice_friends if f in bob_friends]
print(mutual)  # ['Sam', 'Mia']`,
    commonPitfall: {
      title: "Combining both lists with '+' instead of checking 'if f in list_b'",
      wrongCode: "return alice_friends + bob_friends  # Combines everyone!",
      rightCode: "return [f for f in alice_friends if f in bob_friends]",
      explanation:
        "`if f in bob_friends` checks that the friend appears in BOTH lists!",
    },
    guidedCode: `def find_mutual_friends(friends_a, friends_b):
    # 👉 Keep each friend 'f' in friends_a if 'f in friends_b':
    return [f for f in friends_a if f in friends_b]

print(find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"]))`,
    quiz: {
      question: 'What does `"Mia" in ["Mia", "Zoe"]` evaluate to?',
      options: ["True", "False", '"Mia"'],
      correctIndex: 0,
      explanation:
        "The `in` keyword checks if an item exists inside a collection and returns `True` or `False`!",
    },
  },
  {
    matchTrack: "algorithms",
    matchOrder: 12,
    matchKeywords: ["running", "prefix", "cumulative", "steps", "total"],
    realWorldUse:
      "Used in banking apps to show your running balance after each transaction, and in fitness step trackers.",
    analogyTitle: "A Snowball Rolling Downhill (Running Total)",
    analogyText:
      "Keep a variable `total = 0`. As you loop through each number `n`, add it to `total` (`total += n`) and save the new `total` into your `history` list!",
    cheatSheet: `daily = [10, 20, 5]
running = []
total = 0

for n in daily:
    total += n
    running.append(total)

print(running)  # [10, 30, 35]`,
    commonPitfall: {
      title: "Resetting total = 0 inside the loop on every step",
      wrongCode: "for n in daily:\n    total = 0\n    total += n",
      rightCode: "total = 0\nfor n in daily:\n    total += n",
      explanation:
        "Create `total = 0` ONCE before the loop starts so it keeps accumulating!",
    },
    guidedCode: `def running_totals(numbers):
    result = []
    total = 0
    for n in numbers:
        total += n
        # 👉 Append the updated 'total' to 'result':
        result.append(total)
    return result

print(running_totals([10, 20, 15, 5]))`,
    quiz: {
      question: "What are the running totals of `[5, 10, 2]`?",
      options: ["[5, 15, 17]", "[5, 10, 2]", "[17]"],
      correctIndex: 0,
      explanation:
        "First step is `5`, second is `5 + 10 = 15`, and third is `15 + 2 = 17` -> `[5, 15, 17]`!",
    },
  },

  // ============================================================================
  // TRACK 3: SYSTEM DESIGN (MODULES 01 - 12 — BEGINNER FRIENDLY!)
  // ============================================================================
  {
    matchTrack: "system_design",
    matchOrder: 1,
    matchKeywords: ["cache", "caching", "redis", "lru", "memory", "load"],
    realWorldUse:
      "Used by Instagram and TikTok to serve popular posts instantly from fast memory.",
    analogyTitle: "Keeping Favorite Snacks on Your Desk",
    analogyText:
      "Check if `key in cache` first (fast **Cache Hit**). If not, fetch from `db` and save it in `cache`!",
    cheatSheet: `if key in cache:
    return cache[key]
val = db.get(key)
cache[key] = val
return val`,
    quiz: {
      question: "What is a 'Cache Hit'?",
      options: [
        "When the data is found immediately in fast cache memory",
        "When the server crashes",
        "When the internet disconnects",
      ],
      correctIndex: 0,
      explanation: "A Cache Hit saves a slow trip to the main database!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 4,
    matchKeywords: ["round-robin", "round robin", "load balancer", "route"],
    realWorldUse:
      "Used by Cloudflare and AWS to share traffic evenly across servers.",
    analogyTitle: "Dealing Cards in a Circle",
    analogyText:
      "Use the remainder operator `%` (`request_index % len(servers)`) to cycle smoothly through your servers!",
    cheatSheet: `def pick_server(servers, request_index):
    return servers[request_index % len(servers)]`,
    quiz: {
      question: "With 3 servers, what is `3 % 3`?",
      options: ["0 (wraps back to the first server)", "3", "9"],
      correctIndex: 0,
      explanation: "`3 % 3` is `0`, wrapping back to index 0!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 5,
    matchKeywords: ["shard", "sharding", "partition", "database"],
    realWorldUse:
      "Used by Discord to split billions of messages across numbered database shards.",
    analogyTitle: "Splitting a Huge Library Into Numbered Rooms",
    analogyText:
      "Compute `shard_id = user_id % num_shards` so every user always goes to the same database shard!",
    cheatSheet: `def get_shard(user_id, num_shards):
    return f"shard_{user_id % num_shards}"`,
    quiz: {
      question: "If `num_shards = 4`, which shard holds `user_id = 5`?",
      options: ["shard_1 (because 5 % 4 == 1)", "shard_9", "shard_0"],
      correctIndex: 0,
      explanation: "5 divided by 4 leaves a remainder of 1!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 6,
    matchKeywords: ["circuit", "breaker", "health", "failover", "outage"],
    realWorldUse:
      "Used by Netflix and Stripe to stop calling a down service while it recovers.",
    analogyTitle: "A Home Electrical Circuit Breaker",
    analogyText:
      "If `failures >= threshold`, return `\"OPEN\"` to block traffic safely; otherwise return `\"CLOSED\"`.",
    cheatSheet: `if failures >= threshold:
    return "OPEN"
return "CLOSED"`,
    quiz: {
      question: "What does an `OPEN` circuit breaker do?",
      options: [
        "Stops sending requests to a failing service so it can recover",
        "Deletes the database",
        "Doubles the error rate",
      ],
      correctIndex: 0,
      explanation: "Tripping `OPEN` protects the system from cascading timeouts!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 7,
    matchKeywords: ["quorum", "consensus", "leader", "majority", "vote"],
    realWorldUse:
      "Used in cloud clusters so servers agree on data by majority vote.",
    analogyTitle: "More Than Half the Room Agrees",
    analogyText:
      "Count how many votes are `True`, and check if `yes_votes > len(votes) / 2`!",
    cheatSheet: `yes_votes = votes.count(True)
return yes_votes > len(votes) / 2`,
    quiz: {
      question: "Out of 5 servers, how many `True` votes make a majority?",
      options: ["At least 3", "1", "0"],
      correctIndex: 0,
      explanation: "3 is more than half of 5 (2.5)!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 9,
    matchKeywords: ["backoff", "retry", "wait", "cap"],
    realWorldUse:
      "Used by mobile apps when reconnecting to Wi-Fi so they don't spam the server.",
    analogyTitle: "Capping the Maximum Wait Time with min()",
    analogyText:
      "When an app retries a failed request, it doubles the wait time (`delay`), but uses **`min(delay, max_wait)`** so the user never waits longer than `max_wait`!",
    cheatSheet: `def cap_retry_wait(delay, max_wait):
    # Never wait longer than max_wait:
    return min(delay, max_wait)

print(cap_retry_wait(1600, 1000))  # 1000`,
    commonPitfall: {
      title: "Using max() instead of min() when capping a limit",
      wrongCode: "return max(delay, max_wait)  # Forces wait to AT LEAST max_wait!",
      rightCode: "return min(delay, max_wait)  # Caps wait AT MOST max_wait!",
      explanation:
        "To cap a number at a ceiling, `min(value, ceiling)` picks the smaller of the two!",
    },
    guidedCode: `def get_retry_wait(delay_ms, max_ms):
    # 👉 Return whichever is smaller: delay_ms or max_ms using min()
    return min(delay_ms, max_ms)

print(get_retry_wait(400, 1000), get_retry_wait(1600, 1000))`,
    quiz: {
      question: "What does `min(1600, 1000)` return?",
      options: ["1000 (caps the value at 1000)", "1600", "2600"],
      correctIndex: 0,
      explanation: "`min()` returns the smaller number, keeping the delay capped at `1000`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 10,
    matchKeywords: ["dead", "dlq", "stuck", "alert", "job"],
    realWorldUse:
      "Used in background uploaders (like YouTube video processing) to stop retrying a corrupted file after 3 tries.",
    analogyTitle: "Three Strikes and Move to Support",
    analogyText:
      "If a job's `attempts >= 3`, stop retrying and return **`\"ALERT_TEAM\"`**. Otherwise, return **`\"RETRY\"`**!",
    cheatSheet: `def check_job_status(attempts):
    if attempts >= 3:
        return "ALERT_TEAM"
    return "RETRY"`,
    commonPitfall: {
      title: "Checking attempts > 3 instead of attempts >= 3",
      wrongCode: "if attempts > 3:  # Misses when attempts is 3!",
      rightCode: "if attempts >= 3: # Triggers as soon as attempts hits 3!",
      explanation:
        "`>= 3` means '3 or more', catching the 3rd failed attempt right away.",
    },
    guidedCode: `def check_job_status(attempts):
    if attempts >= 3:
        # 👉 Return "ALERT_TEAM" when attempts is 3 or more:
        return "ALERT_TEAM"
    return "RETRY"

print(check_job_status(1), check_job_status(3))`,
    quiz: {
      question: "If `attempts = 3`, what does `if attempts >= 3:` evaluate to?",
      options: ["True", "False", "Error"],
      correctIndex: 0,
      explanation: "Since 3 is equal to 3, `3 >= 3` is `True`!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 11,
    matchKeywords: ["failover", "backup", "primary", "switch"],
    realWorldUse:
      "Used by hospitals, banks, and cloud servers to switch to a backup server the instant the main server goes offline.",
    analogyTitle: "Backup Generator When the Power Goes Out",
    analogyText:
      "If `primary_online` is `True`, route traffic to **`\"primary\"`**. Otherwise, automatically switch to **`\"backup\"`**!",
    cheatSheet: `def choose_server(primary_online):
    if primary_online:
        return "primary"
    return "backup"`,
    commonPitfall: {
      title: "Returning True/False instead of the server name string",
      wrongCode: "return primary_online",
      rightCode: 'if primary_online:\n    return "primary"\nreturn "backup"',
      explanation:
        'The router needs the name of the server (`"primary"` or `"backup"`) as a string.',
    },
    guidedCode: `def choose_server(primary_online):
    if primary_online:
        return "primary"
    # 👉 Otherwise return "backup":
    return "backup"

print(choose_server(True), choose_server(False))`,
    quiz: {
      question: "What is 'Automatic Failover' in System Design?",
      options: [
        "Automatically switching to a healthy backup server when the primary server goes down",
        "Turning off all computers at night",
        "Deleting user accounts",
      ],
      correctIndex: 0,
      explanation:
        "Failover keeps an app online 24/7 by seamlessly switching to a standby server!",
    },
  },
  {
    matchTrack: "system_design",
    matchOrder: 12,
    matchKeywords: ["cdn", "region", "closest", "video", "edge"],
    realWorldUse:
      "Used by Netflix and YouTube CDNs (Content Delivery Networks) to stream video from a server near your country.",
    analogyTitle: "Ordering From the Closest Local Warehouse",
    analogyText:
      "Given a dictionary of regional servers `cdn_map`, use **`cdn_map.get(region, \"global-edge\")`** to return the user's local server, or `\"global-edge\"` if their region isn't in the dictionary!",
    cheatSheet: `cdn_map = {"eu": "paris-01", "us": "virginia-01"}

# Look up region, or fall back to "global-edge":
server = cdn_map.get(region, "global-edge")`,
    commonPitfall: {
      title: "Using cdn_map[region] which crashes if the region is missing",
      wrongCode: "return cdn_map[region]  # KeyError on unknown region!",
      rightCode: 'return cdn_map.get(region, "global-edge")',
      explanation:
        "`.get(key, fallback)` safely returns the fallback string instead of crashing when a key isn't found!",
    },
    guidedCode: `def pick_cdn_server(cdn_map, region):
    # 👉 Use cdn_map.get(region, "global-edge") to return the server safely:
    return cdn_map.get(region, "global-edge")

servers = {"eu": "eu-west", "asia": "tokyo-edge"}
print(pick_cdn_server(servers, "eu"), pick_cdn_server(servers, "sa"))`,
    quiz: {
      question: 'What does `{"eu": "paris"}.get("mars", "global")` return?',
      options: ['"global" (the safe fallback value)', "KeyError crash", '"paris"'],
      correctIndex: 0,
      explanation:
        'Since `"mars"` is not in the dictionary, `.get()` returns the fallback value `"global"`!',
    },
  },
];

function attachDefaultPitfallAndGuided(
  item: LessonEnrichment,
  track: "python_basics" | "algorithms" | "system_design",
  initialCode?: string,
): LessonEnrichment {
  const defaultPitfall: CommonPitfall =
    track === "algorithms"
      ? {
          title: "Returning inside the loop on the first step by mistake",
          wrongCode: "for x in nums:\n    return x  # Stops after checking only 1 item!",
          rightCode: "for x in nums:\n    if matches(x): return x\nreturn default",
          explanation:
            "Make sure your fallback `return` is unindented outside the `for` loop so every item gets checked!",
        }
      : track === "system_design"
        ? {
            title: "Forgetting fallback values when a server or key is missing",
            wrongCode: "return servers[key]  # Crashes with KeyError if missing!",
            rightCode: 'return servers.get(key, "fallback")',
            explanation:
              "Reliable cloud code always provides a safe fallback value.",
          }
        : {
            title: "Confusing '=' (save value) with '==' (compare values)",
            wrongCode: "if score = 100   # SyntaxError!",
            rightCode: "if score == 100: # Uses '==' and ends with ':'",
            explanation:
              "Use `=` to store a value in a variable, `==` to compare two values, and end `if`/`for`/`def` lines with `:`!",
          };

  const cleanStarter = (initialCode || "").replace(/\\n/g, "\n").trim();
  const defaultGuided =
    item.guidedCode ||
    (cleanStarter
      ? `${cleanStarter}\n\n# 💡 HELPFUL EXAMPLE:\n${item.cheatSheet
          .split("\n")
          .map((l) => (l.startsWith("#") ? l : `#   ${l}`))
          .join("\n")}`
      : item.cheatSheet);

  return {
    ...item,
    commonPitfall: item.commonPitfall || defaultPitfall,
    guidedCode: defaultGuided,
  };
}

export function getLessonEnrichment(lesson: {
  title?: string;
  track?: string;
  lesson_order?: number;
  initial_code?: string;
}): LessonEnrichment {
  const titleLower = (lesson.title || "").toLowerCase();
  const track = (lesson.track || "python_basics") as
    | "python_basics"
    | "algorithms"
    | "system_design";

  if ((lesson.lesson_order || 0) >= 9) {
    const byExpansionOrder = LESSON_ENRICHMENTS.find(
      (item) =>
        item.matchTrack === track && item.matchOrder === lesson.lesson_order,
    );
    if (byExpansionOrder) {
      return attachDefaultPitfallAndGuided(
        byExpansionOrder,
        track,
        lesson.initial_code,
      );
    }
  }

  const byKeyword = LESSON_ENRICHMENTS.find(
    (item) =>
      item.matchTrack === track &&
      item.matchKeywords.some((kw) => titleLower.includes(kw)),
  );
  if (byKeyword) {
    return attachDefaultPitfallAndGuided(byKeyword, track, lesson.initial_code);
  }

  const byOrder = LESSON_ENRICHMENTS.find(
    (item) => item.matchTrack === track && item.matchOrder === lesson.lesson_order,
  );
  if (byOrder) {
    return attachDefaultPitfallAndGuided(byOrder, track, lesson.initial_code);
  }

  return attachDefaultPitfallAndGuided(
    {
      realWorldUse:
        "Core Python building block used in web apps, games, automation, and AI.",
      analogyTitle: "Step-by-Step Recipe Instructions",
      analogyText:
        "Python reads your code from top to bottom, just like following a simple recipe:\n\n1. **Read** the input values.\n2. **Update or check** them in 1–2 lines.\n3. **`return` or `print()`** the answer.",
      cheatSheet: `# Simple Python Function Pattern:
def solve(value):
    return value`,
      quiz: {
        question:
          "How does Python know which lines belong inside a block (like `if`, `for`, or `def`)?",
        options: [
          "By indentation (4 spaces at the start of the line)",
          "By wrapping everything in curly braces { }",
          "By writing END at the bottom",
        ],
        correctIndex: 0,
        explanation:
          "Python uses clean 4-space indentation to group lines inside functions, loops, and if-statements!",
      },
    },
    track,
    lesson.initial_code,
  );
}

// ============================================================================
// 12 BEGINNER-FRIENDLY INTERACTIVE LESSONS (MODULES 09 - 12 PER TRACK)
// Every lesson requires only 1 simple line of Python code!
// ============================================================================
export const EXPANSION_LESSONS = [
  // --------------------------------------------------------------------------
  // PYTHON BASICS (MODULES 09 - 12 — FREE & SUPER BEGINNER-FRIENDLY)
  // --------------------------------------------------------------------------
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
      "Want to know how many times an item appears inside a list? You don't even need a loop! Every Python list has a built-in **`.count(item)`** tool:\n\n```python\nreactions = [\"🔥\", \"❤️\", \"🔥\", \"👍\", \"🔥\"]\nfire_count = reactions.count(\"🔥\")\nprint(fire_count)  # Prints 3\n```",
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
      "Sometimes a guest accidentally signs up twice. In Python:\n\n1. **`set(guests)`** automatically removes all duplicates.\n2. **`sorted(...)`** puts the remaining names in A–Z alphabetical order!\n\n```python\nguests = [\"Sam\", \"Alex\", \"Sam\"]\nclean = sorted(set(guests))\n# Result: ['Alex', 'Sam']\n```",
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
      "How do websites turn a list of words like `[\"pixel\", \"arcade\", \"game\"]` into a clean URL link like `\"pixel-arcade-game\"`?\n\nUse Python's **`.join()`** tool on the separator string `\"-\"`:\n\n```python\nwords = [\"pixel\", \"arcade\", \"game\"]\nslug = \"-\".join(words)\nprint(slug)  # \"pixel-arcade-game\"\n```",
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
      { label: "result", value: '"pixel-arcade-game"', type: "str", address: "0x18" },
    ],
    hints: [
      'Replace `return ""` with `return "-".join(words)`.',
    ],
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
      "When you have a ranked list of players and only want to show the **Top 3** on the podium, use **List Slicing (`[:3]`)**:\n\n```python\nplayers = [\"Aria\", \"Kai\", \"Nova\", \"Leo\", \"Max\"]\ntop_three = players[:3]\nprint(top_three)  # ['Aria', 'Kai', 'Nova']\n```",
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
        explanation: "players[:3] takes index 0, 1, and 2 (the first 3 players).",
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
    hints: [
      "Replace `return []` with `return players[:3]`.",
    ],
  },

  // --------------------------------------------------------------------------
  // ALGORITHMIC MASTERY (MODULES 09 - 12 — BEGINNER-FRIENDLY PRO TRACK)
  // --------------------------------------------------------------------------
  {
    id: "exp-alg-09",
    title: "Minimum Search: Cheapest Flight Finder",
    track: "algorithms",
    category: "LINEAR SCAN O(N)",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 9,
    is_free: false,
    description:
      "Find the lowest ticket price in a list of flight deals in a single O(n) pass using min().",
    content:
      "When comparing flight prices like `[320, 195, 240, 160, 410]`, how does a travel app find the cheapest deal?\n\nIt performs a single pass through the numbers to find the **minimum value** (`min(prices)`):\n\n```python\nprices = [320, 195, 240, 160, 410]\nlowest = min(prices)\nprint(lowest)  # 160\n```",
    assignment:
      "Complete `find_cheapest_flight(prices)` so it returns the smallest number in `prices`.",
    constraints: [
      "Return the smallest number in `prices` using `min(prices)`",
      "Keep the `print(...)` line so it outputs `160`",
    ],
    examples: [
      {
        input: "prices = [320, 195, 240, 160, 410]",
        output: "160",
        explanation: "160 is the lowest price in the list.",
      },
    ],
    complexities: { time: "O(n)", space: "O(1)" },
    initial_code: `def find_cheapest_flight(prices):
    # 👉 Write 1 line: return min(prices)
    return 0

print(find_cheapest_flight([320, 195, 240, 160, 410]))`,
    expected_output: "160",
    hidden_tests: `import json
results = []
try:
    r1 = find_cheapest_flight([320, 195, 240, 160, 410])
    results.append({"id": 1, "input": "[320, 195, 240, 160, 410]", "expected": "160", "actual": str(r1), "passed": r1 == 160})
    r2 = find_cheapest_flight([99, 120, 85])
    results.append({"id": 2, "input": "[99, 120, 85]", "expected": "85", "actual": str(r2), "passed": r2 == 85})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "$320", value: "best = 320", address: "step 1" },
      { label: "$195", value: "new best = 195", address: "step 2" },
      { label: "$240", value: "keep 195", address: "step 3" },
      { label: "$160", value: "MIN FOUND = 160 ✓", address: "step 4" },
    ],
    hints: [
      "Replace `return 0` with `return min(prices)`.",
    ],
  },
  {
    id: "exp-alg-10",
    title: "Binary Search Step 1: Finding the Middle",
    track: "algorithms",
    category: "DIVIDE & CONQUER",
    difficulty: "Easy",
    tree_row: 8,
    lesson_order: 10,
    is_free: false,
    description:
      "Jump straight to the middle element of a sorted list in O(1) time using integer division (// 2).",
    content:
      "The secret behind **Binary Search** is jumping straight to the **middle index** of a sorted list instead of starting at index 0.\n\nWe calculate `mid = len(items) // 2` (using `//` so we get a whole number index) and return `items[mid]`:\n\n```python\nitems = [10, 25, 42, 70, 99]\nmid = len(items) // 2   # 5 // 2 = 2\nprint(items[mid])       # 42\n```",
    assignment:
      "We already calculated `mid = len(items) // 2` for you. Complete the function so it returns the element at index `mid` (`items[mid]`).",
    constraints: [
      "Use `items[mid]` to read the middle value",
      "Return `items[mid]`",
    ],
    examples: [
      {
        input: "items = [10, 25, 42, 70, 99]",
        output: "42",
        explanation: "Length is 5, 5 // 2 is index 2, and items[2] is 42.",
      },
    ],
    complexities: { time: "O(1)", space: "O(1)" },
    initial_code: `def get_middle_item(items):
    mid = len(items) // 2
    # 👉 Write 1 line: return items[mid]
    return 0

print(get_middle_item([10, 25, 42, 70, 99]))`,
    expected_output: "42",
    hidden_tests: `import json
results = []
try:
    r1 = get_middle_item([10, 25, 42, 70, 99])
    results.append({"id": 1, "input": "[10, 25, 42, 70, 99]", "expected": "42", "actual": str(r1), "passed": r1 == 42})
    r2 = get_middle_item([5, 15, 25])
    results.append({"id": 2, "input": "[5, 15, 25]", "expected": "15", "actual": str(r2), "passed": r2 == 15})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "idx 0: 10", value: "left half", address: "0" },
      { label: "idx 1: 25", value: "left half", address: "1" },
      { label: "idx 2: 42", value: "MIDDLE (5 // 2 = 2) 🎯", address: "mid = 2" },
      { label: "idx 3: 70", value: "right half", address: "3" },
      { label: "idx 4: 99", value: "right half", address: "4" },
    ],
    hints: [
      "Replace `return 0` with `return items[mid]`.",
    ],
  },
  {
    id: "exp-alg-11",
    title: "List Intersection: Mutual Friends Finder",
    track: "algorithms",
    category: "SEARCH & FILTER",
    difficulty: "Easy",
    tree_row: 9,
    lesson_order: 11,
    is_free: false,
    description:
      "Find mutual friends who appear in both Alice's friend list and Bob's friend list.",
    content:
      "How do social apps show **Mutual Friends** between two people? We check each friend `f` in `friends_a` and keep them if **`f in friends_b`** is True!\n\n```python\nmutual = [f for f in friends_a if f in friends_b]\n```",
    assignment:
      "Complete `find_mutual_friends(friends_a, friends_b)` so it returns a list of names that appear in both lists.",
    constraints: [
      "Keep each friend `f` from `friends_a` if `f in friends_b`",
      "Return the list of mutual friends",
    ],
    examples: [
      {
        input: 'friends_a = ["Sam", "Mia", "Leo"], friends_b = ["Mia", "Zoe", "Sam"]',
        output: "['Sam', 'Mia']",
        explanation: "Sam and Mia are on both friend lists.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def find_mutual_friends(friends_a, friends_b):
    # 👉 Write 1 line: return [f for f in friends_a if f in friends_b]
    return []

print(find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"]))`,
    expected_output: "['Sam', 'Mia']",
    hidden_tests: `import json
results = []
try:
    r1 = find_mutual_friends(["Sam", "Mia", "Leo"], ["Mia", "Zoe", "Sam"])
    results.append({"id": 1, "input": "['Sam','Mia','Leo'] & ['Mia','Zoe','Sam']", "expected": "['Sam', 'Mia']", "actual": str(r1), "passed": r1 == ["Sam", "Mia"]})
    r2 = find_mutual_friends(["Kai"], ["Leo"])
    results.append({"id": 2, "input": "No mutual friends", "expected": "[]", "actual": str(r2), "passed": r2 == []})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "hashmap",
    visual_data: [
      { label: '"Sam"', value: "IN BOTH -> KEEP ✓", address: "match" },
      { label: '"Mia"', value: "IN BOTH -> KEEP ✓", address: "match" },
      { label: '"Leo"', value: "not in friends_b", address: "skip" },
    ],
    hints: [
      "Replace `return []` with `return [f for f in friends_a if f in friends_b]`.",
    ],
  },
  {
    id: "exp-alg-12",
    title: "Running Total: Daily Step Tracker",
    track: "algorithms",
    category: "PREFIX SUMS",
    difficulty: "Easy",
    tree_row: 10,
    lesson_order: 12,
    is_free: false,
    description:
      "Build a running total list that records the cumulative sum after each number.",
    content:
      "A **Running Total (Prefix Sum)** keeps adding each day's points to `total` and saves the progress after each step:\n\n```python\nresult = []\ntotal = 0\nfor n in numbers:\n    total += n\n    result.append(total)\n```",
    assignment:
      "We already wrote the loop and `total += n` for you! Add the 1 missing line inside the loop (`result.append(total)`) so each running total is saved.",
    constraints: [
      "Append `total` to `result` inside the loop using `result.append(total)`",
      "Return `result` at the end",
    ],
    examples: [
      {
        input: "numbers = [10, 20, 15, 5]",
        output: "[10, 30, 45, 50]",
        explanation: "10 -> 10+20=30 -> 30+15=45 -> 45+5=50.",
      },
    ],
    complexities: { time: "O(n)", space: "O(n)" },
    initial_code: `def running_totals(numbers):
    result = []
    total = 0
    for n in numbers:
        total += n
        # 👉 Write 1 line: append 'total' to 'result'
        
    return result

print(running_totals([10, 20, 15, 5]))`,
    expected_output: "[10, 30, 45, 50]",
    hidden_tests: `import json
results = []
try:
    r1 = running_totals([10, 20, 15, 5])
    results.append({"id": 1, "input": "[10, 20, 15, 5]", "expected": "[10, 30, 45, 50]", "actual": str(r1), "passed": r1 == [10, 30, 45, 50]})
    r2 = running_totals([5, 5, 5])
    results.append({"id": 2, "input": "[5, 5, 5]", "expected": "[5, 10, 15]", "actual": str(r2), "passed": r2 == [5, 10, 15]})
    print(json.dumps({"is_test_suite": True, "all_passed": all(x["passed"] for x in results), "results": results}))
except Exception as e:
    print(json.dumps({"is_test_suite": True, "error": str(e)}))`,
    visual_type: "array",
    visual_data: [
      { label: "+10", value: "total = 10", address: "[10]" },
      { label: "+20", value: "total = 30", address: "[10, 30]" },
      { label: "+15", value: "total = 45", address: "[10, 30, 45]" },
      { label: "+5", value: "total = 50 ✓", address: "[10, 30, 45, 50]" },
    ],
    hints: [
      "Right under `total += n`, write `result.append(total)` (indented by 8 spaces to match `total += n`).",
    ],
  },

  // --------------------------------------------------------------------------
  // SYSTEM ARCHITECTURE (MODULES 09 - 12 — BEGINNER-FRIENDLY PRO TRACK)
  // --------------------------------------------------------------------------
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
      { label: "delay = 400ms", value: "400ms (under cap)", address: "min(400, 1000)" },
      { label: "delay = 800ms", value: "800ms (under cap)", address: "min(800, 1000)" },
      { label: "delay = 1600ms", value: "CAPPED AT 1000ms ✓", address: "min(1600, 1000)" },
    ],
    hints: [
      "Replace `return 0` with `return min(delay_ms, max_ms)`.",
    ],
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
      'Alert the engineering team when a background job fails 3 or more times (attempts >= 3).',
    content:
      "In background queues, if a job fails **3 or more times** (`attempts >= 3`), we stop retrying and return **`\"ALERT_TEAM\"`**. Otherwise we return **`\"RETRY\"`**:\n\n```python\ndef check_job_status(attempts):\n    if attempts >= 3:\n        return \"ALERT_TEAM\"\n    return \"RETRY\"\n```",
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
      "How do apps like Netflix stay online even if a server loses power? **Automatic Failover**!\n\n• If `primary_online` is `True`, return **`\"primary\"`**.\n• Otherwise, return **`\"backup\"`**!",
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
        explanation: "Uses primary when healthy; switches to backup when offline.",
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
      { label: "primary_online=True", value: "-> primary ✓", address: "healthy" },
      { label: "primary_online=False", value: "-> backup (FAILOVER) ⚡", address: "standby" },
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
      "A **CDN (Content Delivery Network)** stores videos on servers around the world (`{\"eu\": \"eu-west\", \"asia\": \"tokyo-edge\"}`).\n\nUsing **`cdn_map.get(region, \"global-edge\")`** returns the matching regional server, or safely falls back to `\"global-edge\"` if the region isn't in the dictionary!",
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
        explanation: '"eu" is found in cdn_map; "sa" uses the fallback "global-edge".',
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
      { label: 'region = "eu"', value: '-> "eu-west" ✓', address: "direct hit" },
      { label: 'region = "asia"', value: '-> "tokyo-edge" ✓', address: "direct hit" },
      { label: 'region = "sa"', value: '-> "global-edge" (FALLBACK)', address: "default" },
    ],
    hints: [
      'Replace `return ""` with `return cdn_map.get(region, "global-edge")`.',
    ],
  },
];

export function mergeCurriculumLessons<
  T extends { id: string; track: string; lesson_order: number; title: string },
>(dbLessons: T[]): T[] {
  const merged = [...dbLessons];
  for (const exp of EXPANSION_LESSONS) {
    const alreadyExists = merged.some(
      (item) =>
        item.id === exp.id ||
        (item.track === exp.track &&
          (item.lesson_order === exp.lesson_order ||
            item.title.toLowerCase() === exp.title.toLowerCase())),
    );
    if (!alreadyExists) {
      merged.push(exp as unknown as T);
    }
  }
  return merged.sort((a, b) => a.lesson_order - b.lesson_order);
}
