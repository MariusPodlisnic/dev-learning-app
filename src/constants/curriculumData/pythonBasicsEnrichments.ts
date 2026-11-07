import { EnrichedLessonData } from "./types";

export const PYTHON_BASICS_ENRICHMENTS: EnrichedLessonData[] = [
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
      'Used to store user profiles with labeled fields like `"username"`, `"email"`, and `"role"`.',
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
      'Python text strings come with handy cleaning tools you attach with a dot (`.`):\n\n• **`.strip()`** trims extra spaces off both ends.\n• **`.lower()`** turns `"HELLO"` into lowercase `"hello"`.',
    cheatSheet: `raw_name = "  Alex_Coder  "
clean_name = raw_name.strip().lower()
print(clean_name)  # "alex_coder"`,
    commonPitfall: {
      title:
        "Forgetting the empty parentheses () when calling .strip() or .lower()",
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
      wrongCode:
        "for s in scores:\n    if s >= 80:\n        pass\n    passed.append(s)",
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
      'Want to know how many times `"🔥"` appears in a list? Python lists have a built-in **`.count(item)`** tool that counts matches for you in 1 line!',
    cheatSheet: `votes = ["yes", "no", "yes", "yes"]

# Count how many times "yes" appears:
yes_total = votes.count("yes")
print(yes_total)  # 3`,
    commonPitfall: {
      title: "Using len(list) instead of list.count(target)",
      wrongCode: "return len(reactions)  # Counts ALL items, not just target!",
      rightCode:
        "return reactions.count(target)  # Counts only matching items!",
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
      explanation:
        '`"a"` appears twice in the list, so `.count("a")` returns `2`!',
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
      explanation:
        "Sets only keep unique values, so duplicates are removed automatically!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 11,
    matchKeywords: ["join", "words", "tag", "hyphen", "sentence"],
    realWorldUse:
      'Used by blogs and stores to turn title words `["retro", "arcade", "hat"]` into URL slugs `"retro-arcade-hat"`.',
    analogyTitle: "Gluing Words Together with .join()",
    analogyText:
      'If you have a list of words, **`"-".join(words)`** glues them together into a single string with `"-"` placed between each word!',
    cheatSheet: `words = ["python", "is", "fun"]

# Glue words together with "-" between them:
slug = "-".join(words)
print(slug)  # "python-is-fun"`,
    commonPitfall: {
      title: "Calling words.join('-') instead of '-'.join(words)",
      wrongCode: 'words.join("-")  # AttributeError: list has no .join!',
      rightCode: '"-".join(words)  # Call .join() on the separator string!',
      explanation:
        'In Python, you put the glue string first (`"-"`), then call `.join(words)`.',
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
      'To grab just the first 3 items of a list, write **`players[:3]`**. It means *"start at the beginning and stop after 3 items"*!',
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
  {
    matchTrack: "python_basics",
    matchOrder: 13,
    matchKeywords: ["replace", "censor", "spoiler", "swap", "chat"],
    realWorldUse:
      "Used in game chats and forums to automatically hide spoilers or replace words before showing a message.",
    analogyTitle: "Find-and-Replace in One Line with .replace()",
    analogyText:
      'Every Python string has a built-in **`.replace(old, new)`** tool. It finds every copy of `old` and swaps it with `new` in 1 line!',
    cheatSheet: `msg = "Watch out for the spoiler!"

# Swap "spoiler" with "[HIDDEN]":
clean = msg.replace("spoiler", "[HIDDEN]")
print(clean)  # "Watch out for the [HIDDEN]!"`,
    commonPitfall: {
      title: "Swapping the order of old and new inside .replace(old, new)",
      wrongCode: 'return message.replace("[HIDDEN]", "spoiler")',
      rightCode: 'return message.replace("spoiler", "[HIDDEN]")',
      explanation:
        'The word you want to FIND goes first (`"spoiler"`), and the replacement text goes second (`"[HIDDEN]"`).',
    },
    guidedCode: `def hide_spoilers(message):
    # 👉 Replace "spoiler" with "[HIDDEN]" using .replace():
    return message.replace("spoiler", "[HIDDEN]")

print(hide_spoilers("Alert: spoiler ahead!"))`,
    quiz: {
      question: 'What does `"cat dog".replace("cat", "fox")` return?',
      options: ['"fox dog"', '"cat dog"', '"cat fox"'],
      correctIndex: 0,
      explanation: '`.replace("cat", "fox")` swaps `"cat"` with `"fox"`!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 14,
    matchKeywords: ["sum", "cart", "total", "checkout", "add"],
    realWorldUse:
      "Used in Amazon, Uber Eats, and Steam shopping carts to add up all item prices instantly.",
    analogyTitle: "Instant Calculator with sum()",
    analogyText:
      "Instead of writing a `for` loop to add numbers one by one, Python gives you **`sum(prices)`** — it adds every number in the list in 1 line!",
    cheatSheet: `prices = [15, 25, 10]

# Add all numbers in the list at once:
total = sum(prices)
print(total)  # 50`,
    commonPitfall: {
      title: "Using len(prices) instead of sum(prices)",
      wrongCode: "return len(prices)  # Counts how many items (3), not their sum!",
      rightCode: "return sum(prices)  # Adds the numbers together (50)!",
      explanation:
        "`len()` counts how many items are in the list, while `sum()` adds their numeric values together.",
    },
    guidedCode: `def get_cart_total(prices):
    # 👉 Add up all numbers in prices using sum(prices):
    return sum(prices)

print(get_cart_total([15, 25, 10]))`,
    quiz: {
      question: "What does `sum([10, 20, 5])` return?",
      options: ["35", "3", "10"],
      correctIndex: 0,
      explanation: "`10 + 20 + 5 = 35`!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 15,
    matchKeywords: ["startswith", "https", "prefix", "link", "url"],
    realWorldUse:
      'Used by web browsers to show the lock icon when a website URL starts with `"https://"`.',
    analogyTitle: "Checking the Start of a Word with .startswith()",
    analogyText:
      'Want to check how a string begins? Call **`url.startswith("https://")`** — Python immediately returns `True` or `False`!',
    cheatSheet: `link = "https://devlearn.app"

# Check if link begins with "https://":
is_safe = link.startswith("https://")
print(is_safe)  # True`,
    commonPitfall: {
      title: "Writing startwith() without the 's' in the middle",
      wrongCode: 'return url.startwith("https://")   # AttributeError!',
      rightCode: 'return url.startswith("https://")  # Notice the "s": startswith!',
      explanation:
        'The method is spelled `.startswith(...)` with an `s` after `start`.',
    },
    guidedCode: `def is_secure_link(url):
    # 👉 Check if url starts with "https://" using .startswith():
    return url.startswith("https://")

print(is_secure_link("https://arcade.dev"), is_secure_link("http://old.site"))`,
    quiz: {
      question: 'What does `"python_basics".startswith("py")` return?',
      options: ["True", "False", '"py"'],
      correctIndex: 0,
      explanation: '`"python_basics"` begins with `"py"`, so it returns `True`!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 16,
    matchKeywords: ["default", "settings", "theme", "get", "fallback"],
    realWorldUse:
      'Used in app preferences so if a new user hasn\'t chosen a theme yet, the app safely defaults to `"light"`.',
    analogyTitle: "Safe Dictionary Lookup with .get(key, default)",
    analogyText:
      'Looking up `settings["theme"]` crashes if `"theme"` isn\'t in the dictionary yet. Using **`settings.get("theme", "light")`** returns the saved theme, or `"light"` if missing!',
    cheatSheet: `prefs = {"volume": 80}

# Safely read "theme", or default to "light":
mode = prefs.get("theme", "light")
print(mode)  # "light"`,
    commonPitfall: {
      title: "Using square brackets settings['theme'] on a missing key",
      wrongCode: 'return settings["theme"]  # KeyError if "theme" is missing!',
      rightCode: 'return settings.get("theme", "light")  # Safe fallback!',
      explanation:
        '`.get("theme", "light")` never crashes — it hands back `"light"` whenever `"theme"` is not found.',
    },
    guidedCode: `def get_user_theme(settings):
    # 👉 Return settings.get("theme", "light"):
    return settings.get("theme", "light")

print(get_user_theme({"theme": "dark"}), get_user_theme({}))`,
    quiz: {
      question: 'What does `{}.get("theme", "light")` return on an empty dictionary?',
      options: ['"light"', "KeyError crash", "None"],
      correctIndex: 0,
      explanation:
        'Because `"theme"` is not in `{}`, `.get()` returns the fallback value `"light"`!',
    },
  },
];
