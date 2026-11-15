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
    solutionCode: `def create_hero_profile(name, bonus_hp):
    total_hp = 100 + bonus_hp
    is_online = True
    return (name, total_hp, is_online)`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Packing values in a fixed `(str, int, bool)` tuple keeps lightweight immutable player snapshots concise and fast.",
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
    solutionCode: `def sum_doubled_xp(quests):
    total = 0
    for xp in quests:
        total += xp * 2
    return total`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Accumulating directly in one `for` loop uses O(1) memory instead of building an extra doubled list first.",
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
    solutionCode: `def get_rank_tier(score):
    if score >= 1000:
        return "GOLD"
    elif score >= 500:
        return "SILVER"
    return "BRONZE"`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Ordering threshold checks from highest (`>= 1000`) to lowest (`>= 500`) avoids overlapping tier matches.",
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
    solutionCode: `def calc_final_score(base_pts, streak_bonus, multiplier):
    return (base_pts + streak_bonus) * multiplier`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Grouping `(base_pts + streak_bonus)` in parentheses guarantees addition happens before `* multiplier`.",
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
    solutionCode: `def promote_user(user, bonus_xp):
    user["role"] = "admin"
    user["xp"] = user.get("xp", 0) + bonus_xp
    return user`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Reading `user.get('xp', 0)` avoids KeyError if a brand-new user dict starts without an `'xp'` key.",
    },
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
    solutionCode: `def normalize_handle(raw_handle):
    return raw_handle.strip().lower()`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Chaining `.strip().lower()` normalizes whitespace and letter case in one clean expression.",
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
    solutionCode: `def filter_passing_scores(scores, min_score):
    passed = []
    for score in scores:
        if score >= min_score:
            passed.append(score)
    return passed`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      tradeoff:
        "Building a new filtered list preserves input order without mutating the caller's original `scores` list.",
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
    solutionCode: `def safe_win_rate(wins, matches):
    try:
        return wins / matches
    except ZeroDivisionError:
        return 0.0`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Returning `0.0` ensures consistent float return types across both normal and zero-match callers.",
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
    solutionCode: `def count_reactions(reactions, target):
    return reactions.count(target)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Built-in `list.count(target)` performs a C-level linear equality scan without needing a manual counter variable.",
    },
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
    solutionCode: `def clean_guest_list(guests):
    return sorted(set(guests))`,
    proInsights: {
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Converting to a `set` deduplicates in O(n) average time before `sorted()` returns a deterministic list.",
    },
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
    solutionCode: `def make_url_slug(words):
    return "-".join(words)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "`'-'.join(words)` allocates the final string once in linear time instead of repeatedly copying strings with `+`.",
    },
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
    solutionCode: `def get_top_three(players):
    return players[:3]`,
    proInsights: {
      timeComplexity: "O(k)",
      spaceComplexity: "O(k)",
      tradeoff:
        "List slicing `players[:3]` never raises `IndexError`—even if `players` has fewer than 3 elements.",
    },
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
    solutionCode: `def hide_spoilers(message):
    return message.replace("spoiler", "[HIDDEN]")`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Because Python strings are immutable, `.replace()` safely constructs and returns a redacted copy.",
    },
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
    solutionCode: `def get_cart_total(prices):
    return sum(prices)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Built-in `sum(prices)` handles empty lists gracefully (`sum([]) == 0`) with C-speed addition.",
    },
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
    solutionCode: `def is_secure_link(url):
    return url.startswith("https://")`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "`.startswith('https://')` inspects only the first 8 characters without copying or slicing the entire URL string.",
    },
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
    solutionCode: `def get_user_theme(settings):
    return settings.get("theme", "light")`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "`settings.get('theme', 'light')` performs one hash lookup and provides a safe default without mutating `settings`.",
    },
    quiz: {
      question: 'What does `{}.get("theme", "light")` return on an empty dictionary?',
      options: ['"light"', "KeyError crash", "None"],
      correctIndex: 0,
      explanation:
        'Because `"theme"` is not in `{}`, `.get()` returns the fallback value `"light"`!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 17,
    matchKeywords: ["f-string", "badge", "formatter", "level"],
    realWorldUse:
      'Used in notifications, receipts, and player profiles to plug live variables into text (like `"Welcome back, Aria!"`).',
    analogyTitle: "Fill-in-the-Blank Templates with f-strings",
    analogyText:
      'An **f-string** starts with the letter **`f`** right before the opening quote. Anything inside curly braces **`{name}`** automatically gets replaced with that variable\'s value!',
    cheatSheet: `name = "Aria"
level = 5

# Put 'f' before the quote and {variable} inside:
badge = f"Player {name} - Level {level}"
print(badge)  # "Player Aria - Level 5"`,
    commonPitfall: {
      title: "Forgetting the letter 'f' before the opening quote",
      wrongCode: 'return "Player {name} - Level {level}"  # Prints literal {name}!',
      rightCode: 'return f"Player {name} - Level {level}" # Plugs in values!',
      explanation:
        "Without the `f` right before the first quote, Python treats `{name}` as plain text instead of a variable.",
    },
    guidedCode: `def make_badge(name, level):
    # 👉 Return the formatted f-string:
    return f"Player {name} - Level {level}"

print(make_badge("Aria", 5))`,
    solutionCode: `def make_badge(name, level):
    return f"Player {name} - Level {level}"`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "F-strings interpolate variables directly and run faster than string concatenation with `+` and `str()`.",
    },
    quiz: {
      question: 'If `coins = 10`, what does `f"Coins: {coins}"` produce?',
      options: ['"Coins: 10"', '"Coins: {coins}"', "SyntaxError"],
      correctIndex: 0,
      explanation:
        "The `f` before the quote tells Python to replace `{coins}` with its value `10`!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 18,
    matchKeywords: ["split", "sentence", "word", "counter"],
    realWorldUse:
      "Used in Google Docs, Notion, and social post editors to count how many words you have typed.",
    analogyTitle: "Chopping a Sentence into Words with .split()",
    analogyText:
      'Calling **`sentence.split()`** chops a string wherever there is a space and hands back a list of words. Wrapping that in **`len(...)`** tells you how many words there are!',
    cheatSheet: `sentence = "Python is super fun"

# 1. Chop into a list of words:
words = sentence.split()  # ['Python', 'is', 'super', 'fun']

# 2. Count the words:
print(len(words))         # 4`,
    commonPitfall: {
      title: "Calling len(sentence) instead of len(sentence.split())",
      wrongCode: "return len(sentence)          # Counts letters & spaces (19)!",
      rightCode: "return len(sentence.split())  # Counts words (4)!",
      explanation:
        "`len(sentence)` counts every single character, whereas `len(sentence.split())` counts the words.",
    },
    guidedCode: `def count_words(sentence):
    # 👉 Split the sentence into words and return the count:
    return len(sentence.split())

print(count_words("Python is super fun"))`,
    solutionCode: `def count_words(sentence):
    return len(sentence.split())`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tradeoff:
        "Using `.split()` with no argument handles repeated spaces cleanly and returns `[]` (`0` words) on blank strings.",
    },
    quiz: {
      question: 'What does `"one two three".split()` return?',
      options: [
        '["one", "two", "three"]',
        "3",
        '"one-two-three"',
      ],
      correctIndex: 0,
      explanation:
        "`.split()` breaks the string at spaces and returns a list of words!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 19,
    matchKeywords: ["membership", "backpack", "in", "inventory"],
    realWorldUse:
      "Used in games to check if a player has a key in their inventory, or in apps to check if an email is on the allowlist.",
    analogyTitle: "Instant List Check with the 'in' Keyword",
    analogyText:
      'Instead of writing a loop to check every slot in a list, Python lets you ask **`item in backpack`** — it immediately returns `True` if found, or `False` if not!',
    cheatSheet: `backpack = ["torch", "map", "potion"]

print("map" in backpack)  # True
print("key" in backpack)  # False`,
    commonPitfall: {
      title: "Writing backpack in item (backwards order)",
      wrongCode: "return backpack in item  # Backwards!",
      rightCode: "return item in backpack  # Checks if item is inside backpack!",
      explanation:
        "Always put the single `item` you are looking for on the left, and the `backpack` list on the right: `item in backpack`.",
    },
    guidedCode: `def has_item(backpack, item):
    # 👉 Check if item is inside backpack using 'in':
    return item in backpack

bag = ["torch", "map", "potion"]
print(has_item(bag, "map"), has_item(bag, "key"))`,
    solutionCode: `def has_item(backpack, item):
    return item in backpack`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "List `in` checks take O(n) time; if you query a large inventory thousands of times, convert it to a `set` for O(1) lookup.",
    },
    quiz: {
      question: 'What does `"cat" in ["dog", "cat", "bird"]` return?',
      options: ["True", "False", "1"],
      correctIndex: 0,
      explanation:
        '`"cat"` is inside the list, so `"cat" in [...]` returns `True`!',
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 20,
    matchKeywords: ["round", "rating", "decimal", "star"],
    realWorldUse:
      "Used in App Store ratings, Uber driver scores, and checkout totals to display clean decimals like `4.7` instead of `4.6666667`.",
    analogyTitle: "Polishing Long Decimals with round()",
    analogyText:
      "Python's built-in **`round(number, digits)`** takes a decimal number and rounds it to `digits` decimal places!",
    cheatSheet: `rating = 4.66667

# Round to 1 decimal place:
clean = round(rating, 1)
print(clean)  # 4.7`,
    commonPitfall: {
      title: "Calling round(rating) without the second number (1)",
      wrongCode: "return round(rating)     # Rounds to whole integer 5!",
      rightCode: "return round(rating, 1)  # Rounds to 1 decimal place (4.7)!",
      explanation:
        "Pass `1` as the second argument (`round(rating, 1)`) so Python keeps 1 digit after the decimal point.",
    },
    guidedCode: `def format_rating(rating):
    # 👉 Round rating to 1 decimal place using round(rating, 1):
    return round(rating, 1)

print(format_rating(4.66667))`,
    solutionCode: `def format_rating(rating):
    return round(rating, 1)`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "`round(rating, 1)` keeps numeric float output for sorting/math, whereas `f\"{rating:.1f}\"` would convert to a formatted string.",
    },
    quiz: {
      question: "What does `round(3.86, 1)` return?",
      options: ["3.9", "3", "3.8"],
      correctIndex: 0,
      explanation:
        "`3.86` rounded to 1 decimal place rounds up to `3.9`!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 21,
    matchKeywords: ["rpg", "combat", "critical", "damage", "hit", "game", "max"],
    realWorldUse:
      "Used in combat calculation engines in games like Pokémon, Final Fantasy, and Elden Ring to compute damage, critical multipliers, and armor reduction.",
    analogyTitle: "Game Combat Math: Crit Multiplier + Armor Reduction",
    analogyText:
      "When an attack lands, a critical hit doubles the raw power. Armor then reduces the damage, and **`max(dmg - defense, 1)`** guarantees the player always deals at least 1 damage point!",
    cheatSheet: `attack = 50
is_crit = True
defense = 20

# 1. Double attack on crit:
dmg = (attack * 2) if is_crit else attack

# 2. Subtract defense, minimum 1 damage:
final_dmg = max(dmg - defense, 1)
print(final_dmg)  # 80`,
    commonPitfall: {
      title: "Allowing negative damage when defense is higher than attack",
      wrongCode: "return (attack * 2 if is_crit else attack) - defense  # Returns -5 if defense > attack!",
      rightCode: "return max(dmg - defense, 1)  # Always at least 1 damage!",
      explanation:
        "Without `max(..., 1)`, high defense could result in negative damage, which would accidentally heal the enemy!",
    },
    guidedCode: `def calc_damage(attack, is_crit, defense):
    # 👉 Double attack on crit, subtract defense, clamp to at least 1:
    dmg = attack * 2 if is_crit else attack
    return max(dmg - defense, 1)

print(calc_damage(50, True, 20))`,
    solutionCode: `def calc_damage(attack, is_crit, defense):
    dmg = attack * 2 if is_crit else attack
    return max(dmg - defense, 1)`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Clamping with `max(..., 1)` eliminates branchy `if result < 1: result = 1` logic.",
    },
    quiz: {
      question: "Why do games use `max(dmg - defense, 1)`?",
      options: [
        "To prevent damage from dropping below 1",
        "To double the player's attack power",
        "To reset the player's health",
      ],
      correctIndex: 0,
      explanation:
        "`max(..., 1)` ensures attacks always deal at least 1 damage instead of negative numbers!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 22,
    matchKeywords: ["password", "strength", "security", "checker", "validator", "auth"],
    realWorldUse:
      "Used on every registration page (Google, Discord, Netflix) to give live feedback on whether a user's chosen password is safe.",
    analogyTitle: "Multi-Condition Security Gate",
    analogyText:
      "A secure password needs both size and variety! We check length with **`len(password) >= 8`** and numbers with **`any(ch.isdigit() for ch in password)`**. If both pass, it's strong!",
    cheatSheet: `password = "Python99"

# 1. Check length and digits:
has_digit = any(ch.isdigit() for ch in password)
is_long = len(password) >= 8

# 2. Decide status:
status = "STRONG" if is_long and has_digit else "WEAK"
print(status)  # "STRONG"`,
    commonPitfall: {
      title: "Calling ch.isdigit without parentheses ch.isdigit()",
      wrongCode: "any(ch.isdigit for ch in password)    # Checks method existence, not call!",
      rightCode: "any(ch.isdigit() for ch in password)  # Actually calls the method!",
      explanation:
        "Make sure to include parentheses `ch.isdigit()` so Python executes the check on each character.",
    },
    guidedCode: `def check_password(password):
    # 👉 Check length >= 8 and at least one digit:
    has_digit = any(ch.isdigit() for ch in password)
    if len(password) >= 8 and has_digit:
        return "STRONG"
    return "WEAK"

print(check_password("Python99"))`,
    solutionCode: `def check_password(password):
    has_digit = any(ch.isdigit() for ch in password)
    if len(password) >= 8 and has_digit:
        return "STRONG"
    return "WEAK"`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      tradeoff:
        "`any(...)` with a generator expression short-circuits on the very first digit instead of scanning the entire string needlessly.",
    },
    quiz: {
      question: "What does `any(ch.isdigit() for ch in 'cat5')` return?",
      options: ["True", "False", "5"],
      correctIndex: 0,
      explanation:
        "Because `'5'` is a digit, `any()` finds a match and immediately returns `True`!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 23,
    matchKeywords: ["bill", "tip", "splitter", "restaurant", "math", "percent", "split"],
    realWorldUse:
      "Used in bill splitting apps like Splitwise, Uber Eats group orders, and mobile banking payment requests.",
    analogyTitle: "Fair Split: Tip Formula + 2-Decimal Precision",
    analogyText:
      "To tip 20%, multiply the bill by `(1 + 20 / 100)` (which is `1.20`). Then divide by how many friends are eating, and polish with **`round(share, 2)`** for clean change!",
    cheatSheet: `total = 100.0
tip_percent = 20
people = 4

# Total bill with tip divided by people:
share = (total * (1 + tip_percent / 100)) / people

# Round to 2 decimal places:
clean_share = round(share, 2)
print(clean_share)  # 30.0`,
    commonPitfall: {
      title: "Doing total * (tip_percent / 100) and forgetting to add the base bill",
      wrongCode: "share = (total * (tip / 100)) / people        # Only splits the TIP, not the food!",
      rightCode: "share = (total * (1 + tip / 100)) / people    # Splits food + tip!",
      explanation:
        "Multiplying by `(1 + tip / 100)` includes the original bill plus the extra tip amount.",
    },
    guidedCode: `def split_bill(total, tip_percent, people):
    # 👉 Calculate each person's share with tip rounded to 2 decimals:
    share = (total * (1 + tip_percent / 100)) / people
    return round(share, 2)

print(split_bill(100.0, 20, 4))`,
    solutionCode: `def split_bill(total, tip_percent, people):
    share = (total * (1 + tip_percent / 100)) / people
    return round(share, 2)`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Rounding only at the final `share` step minimizes intermediate floating-point rounding drift.",
    },
    quiz: {
      question: "What is the total of a $50 bill with a 10% tip?",
      options: ["$55.0", "$5.0", "$60.0"],
      correctIndex: 0,
      explanation: "50 * (1 + 10 / 100) = 50 * 1.10 = $55.0!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 24,
    matchKeywords: ["bot", "chatbot", "mood", "emoji", "dictionary", "lower", "fstring"],
    realWorldUse:
      "Used in Slack bots, customer service automated replies, and virtual game NPC dialogue trees.",
    analogyTitle: "The 3-Step Chatbot Pipeline",
    analogyText:
      "A smart chat bot: 1) converts the user's text to lowercase with **`.lower()`**, 2) finds a match safely with **`dict.get(key, fallback)`**, and 3) outputs a friendly greeting with an **`f\"Bot: {reply}\"`** string!",
    cheatSheet: `mood_map = {"happy": "🎉 Yay!", "tired": "☕ Grab coffee!"}
user_msg = "TIRED"

# 1. Lowercase + safe lookup with fallback:
reply = mood_map.get(user_msg.lower(), "🤖 I hear you!")

# 2. Format with f-string:
bot_msg = f"Bot: {reply}"
print(bot_msg)  # "Bot: ☕ Grab coffee!"`,
    commonPitfall: {
      title: "Using square brackets mood_map[key] instead of .get()",
      wrongCode: 'reply = mood_map[message.lower()]  # Crashes with KeyError on unknown mood!',
      rightCode: 'reply = mood_map.get(message.lower(), "🤖 I hear you!")  # Safe fallback!',
      explanation:
        "`.get()` prevents crashes when a user types an unexpected mood message.",
    },
    guidedCode: `def bot_reply(message, mood_map):
    # 👉 Safe dictionary lookup + f-string response:
    reply = mood_map.get(message.lower(), "🤖 I hear you!")
    return f"Bot: {reply}"

moods = {"happy": "🎉 Yay!", "tired": "☕ Grab coffee!"}
print(bot_reply("HAPPY", moods))`,
    solutionCode: `def bot_reply(message, mood_map):
    reply = mood_map.get(message.lower(), "🤖 I hear you!")
    return f"Bot: {reply}"`,
    proInsights: {
      timeComplexity: "O(m)",
      spaceComplexity: "O(m)",
      tradeoff:
        "Normalizing `message.lower()` paired with `.get(key, fallback)` prevents KeyError crashes and handles arbitrary user casing.",
    },
    quiz: {
      question: "Why is `mood_map.get(key, default)` preferred over `mood_map[key]` for chatbots?",
      options: [
        "It provides a fallback instead of crashing with a KeyError",
        "It makes the text uppercase",
        "It deletes old messages",
      ],
      correctIndex: 0,
      explanation:
        "`.get()` safely returns your fallback string when the message isn't in the dictionary!",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 25,
    matchKeywords: ["comprehension", "passing_score_map", "filter"],
    realWorldUse:
      "Used constantly in FastAPI/Django data serializers and ETL pipelines to reshape and filter records cleanly.",
    analogyTitle: "Filter & Transform in One Assembly Line",
    analogyText:
      "A dictionary comprehension reads `{key_expr: val_expr for item in items if condition}` — filter first (`if score >= min_score`), then emit the cleaned pair.",
    cheatSheet: `records = [(" Aria ", 92), ("Kai", 64)]
passed = {n.strip(): s for n, s in records if s >= 70}
print(passed)  # {'Aria': 92}`,
    commonPitfall: {
      title: "Putting the filter clause in the wrong place or missing .strip()",
      wrongCode:
        "{n: s for n, s in records if s > 70}  # Misses whitespace and exact 70 boundary!",
      rightCode:
        "{n.strip(): s for n, s in records if s >= min_score}",
      explanation:
        "Use `>=` to include exact threshold matches and `.strip()` so keys don't carry trailing spaces.",
    },
    solutionCode: `def passing_score_map(records, min_score):
    return {name.strip(): score for name, score in records if score >= min_score}`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      tradeoff:
        "Single-pass dict comprehension avoids intermediate filtered lists while keeping lookup O(1).",
    },
    quiz: {
      question:
        "What does `{k.strip(): v for k, v in rows if v >= 70}` skip?",
      options: [
        "Entries where `v < 70`",
        "Entries where `k` has no spaces",
        "All entries with even `v`",
      ],
      correctIndex: 0,
      explanation:
        "The trailing `if v >= 70` filters out every tuple whose score is strictly below `70`.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 26,
    matchKeywords: ["oop", "wallet", "WalletAccount", "class"],
    realWorldUse:
      "Used to model accounts, shopping carts, game entities, and service clients that enforce state invariants.",
    analogyTitle: "State + Guarded Controls Inside One Capsule",
    analogyText:
      "Each `WalletAccount` instance holds its own `self.balance`. Instead of letting callers overwrite `w.balance` directly into negative numbers, `withdraw()` enforces `0 < amount <= self.balance` first.",
    cheatSheet: `class WalletAccount:
    def __init__(self, balance=0):
        self.balance = balance`,
    commonPitfall: {
      title: "Subtracting amount BEFORE verifying balance >= amount",
      wrongCode:
        "self.balance -= amount\nif self.balance < 0: return False  # Left balance negative!",
      rightCode:
        "if 0 < amount <= self.balance:\n    self.balance -= amount\n    return True",
      explanation:
        "Check invariants before mutating `self.balance` so rejected withdrawals never corrupt account state.",
    },
    solutionCode: `class WalletAccount:
    def __init__(self, balance=0):
        self.balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
            return True
        return False`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Encapsulating guard checks inside methods prevents invalid negative balances across all callers.",
    },
    quiz: {
      question:
        "Why check `0 < amount <= self.balance` before updating `self.balance`?",
      options: [
        "To block overdrafts or negative withdrawals without mutating state",
        "To reset balance to zero after each transaction",
        "Because `__init__` can only accept integers",
      ],
      correctIndex: 0,
      explanation:
        "Validating before mutation keeps account balance unchanged whenever a withdrawal should be rejected.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 27,
    matchKeywords: ["regex", "re.findall", "extract_error_codes"],
    realWorldUse:
      "Used in observability log scrapers, URL routers, and CLI parsers to pull structured IDs from noisy text.",
    analogyTitle: "Pattern Magnet (`re.findall`)",
    analogyText:
      "Write a pattern once (`r\"ERR-\\d+\"`) — `ERR-` matches literally, `\\d+` matches 1+ digits — and `re.findall()` sweeps left-to-right collecting every match in a list.",
    cheatSheet: `import re
hits = re.findall(r"ERR-\\d+", "[WARN] ERR-404 ERR-503")
print(hits)  # ['ERR-404', 'ERR-503']`,
    commonPitfall: {
      title: "Forgetting raw string `r\"...\"` or using `*` instead of `+` for digits",
      wrongCode:
        're.findall("ERR-\\\\d*", text)  # Matches "ERR-" with zero digits!',
      rightCode:
        're.findall(r"ERR-\\d+", text)   # Requires at least 1 digit',
      explanation:
        "`\\d+` demands 1 or more digits, whereas `\\d*` matches empty digits too.",
    },
    solutionCode: `import re

def extract_error_codes(log_text):
    return re.findall(r"ERR-\\d+", log_text)`,
    proInsights: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      tradeoff:
        "Python caches recently compiled regex patterns internally, keeping repeated `re.findall` calls concise and fast.",
    },
    quiz: {
      question: "In the regex `r\"ERR-\\d+\"`, what does `\\d+` match?",
      options: [
        "One or more consecutive numeric digits (0–9)",
        "Zero or more letters",
        "Exactly one space character",
      ],
      correctIndex: 0,
      explanation:
        "`\\d` matches any digit `0–9`, and `+` requires at least one digit.",
    },
  },
  {
    matchTrack: "python_basics",
    matchOrder: 28,
    matchKeywords: ["decorator", "count_calls", "wrapper"],
    realWorldUse:
      "Used in `@lru_cache`, Flask/FastAPI route decorators, retry wrappers, and profiling counters.",
    analogyTitle: "Gift Wrap Around Any Function",
    analogyText:
      "A decorator accepts a function `fn`, puts a counter sleeve around it (`wrapper(*args, **kwargs)`), increments `wrapper.calls`, and returns the inner result untouched.",
    cheatSheet: `def count_calls(fn):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper`,
    commonPitfall: {
      title: "Calling `fn(...)` instead of returning the `wrapper` function object",
      wrongCode:
        "return wrapper()  # Executes immediately instead of returning a callable!",
      rightCode:
        "return wrapper    # Returns the decorated function itself",
      explanation:
        "Decorators return the inner function object *without* parentheses so callers can invoke it later.",
    },
    solutionCode: `def count_calls(fn):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper`,
    proInsights: {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      tradeoff:
        "Attaching `.calls` on `wrapper` avoids extra mutable container boilerplate while forwarding arbitrary `*args, **kwargs`.",
    },
    quiz: {
      question: "Why does `wrapper` accept `(*args, **kwargs)`?",
      options: [
        "So the decorator works on functions with any mix of positional and keyword parameters",
        "To restrict calls to integers only",
        "To disable return values",
      ],
      correctIndex: 0,
      explanation:
        "`*args, **kwargs` transparently forwards whatever arguments the caller passes into the wrapped `fn`.",
    },
  },
];
