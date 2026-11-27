import type { LessonEnrichment } from "../constants/curriculum";
import type { Lesson } from "../types/lesson";
import { buildOrganizedLearnView } from "./lessonContent";

export interface XrayTokenDoc {
  id: string;
  tokenLabel: string;
  category: string;
  whatItDoes: string;
  whatBreaksWithoutIt: string;
}

export interface TinkerScenario {
  label: string;
  inputDisplay: string;
  outputDisplay: string;
  traceNote: string;
  tone: "normal" | "edge" | "guard";
  executedLineIndices: number[]; // 0-based indices of codeLines that run
}

export interface ConceptTinkerSpec {
  codeLines: string[];
  scenarios: TinkerScenario[];
  xrayTokens: XrayTokenDoc[];
}

export interface ParsedParameterChip {
  name: string | null;
  value: string;
}

/**
 * Splits a scenario input string like `nums = [2, 7, 11], target = 9` into
 * top-level `{ name, value }` parameter chips (ignoring commas inside brackets/quotes).
 */
export function parseParameterAssignments(
  inputDisplay: string,
): ParsedParameterChip[] {
  const text = (inputDisplay || "").trim();
  if (!text) return [];

  const segments: string[] = [];
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let start = 0;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\" && i + 1 < text.length) {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "[" || ch === "(" || ch === "{") {
      depth += 1;
    } else if (ch === "]" || ch === ")" || ch === "}") {
      depth = Math.max(0, depth - 1);
    } else if (ch === "," && depth === 0) {
      const seg = text.slice(start, i).trim();
      if (seg) segments.push(seg);
      start = i + 1;
    }
  }
  const tail = text.slice(start).trim();
  if (tail) segments.push(tail);

  return segments.map((seg) => {
    const eqMatch = seg.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/);
    if (eqMatch) {
      return {
        name: eqMatch[1].trim(),
        value: eqMatch[2].trim(),
      };
    }
    return { name: null, value: seg };
  });
}

interface XrayCatalogRule extends XrayTokenDoc {
  test: (code: string) => boolean;
}

const XRAY_CATALOG: readonly XrayCatalogRule[] = [
  {
    id: "def",
    tokenLabel: "def ...():",
    category: "FUNCTION",
    whatItDoes:
      "Defines a reusable function, naming the input parameters inside `( )` and starting an indented block with `:`.",
    whatBreaksWithoutIt:
      "Missing the trailing colon `:` or forgetting to indent the body raises a SyntaxError / IndentationError.",
    test: (c) => /\bdef\s+[A-Za-z_]/.test(c),
  },
  {
    id: "class_self",
    tokenLabel: "class / self",
    category: "OOP STATE",
    whatItDoes:
      "`class` defines an object blueprint, and `self` points to that specific instance's stored attributes (`self.balance`).",
    whatBreaksWithoutIt:
      "Writing `balance` instead of `self.balance` creates a temporary local variable that disappears when the method ends!",
    test: (c) => /\bclass\s+[A-Za-z_]/.test(c) || /\bself\./.test(c),
  },
  {
    id: "return",
    tokenLabel: "return",
    category: "OUTPUT",
    whatItDoes:
      "Immediately stops the function and hands the computed value back to the caller / test runner.",
    whatBreaksWithoutIt:
      "Without `return` (or if you use `print()` instead), Python silently returns `None` and every test fails!",
    test: (c) => /\breturn\b/.test(c),
  },
  {
    id: "if_elif_else",
    tokenLabel: "if / elif / else",
    category: "BRANCHING",
    whatItDoes:
      "Evaluates conditions top-to-bottom, enters the FIRST `True` branch, and skips all remaining branches.",
    whatBreaksWithoutIt:
      "Checking a smaller threshold (`>= 18`) before a larger one (`>= 30`) makes the higher branch unreachable!",
    test: (c) => /\bif\b/.test(c) && (/\belif\b/.test(c) || /\belse\s*:/.test(c)),
  },
  {
    id: "if_guard",
    tokenLabel: "if ...:",
    category: "GUARD CHECK",
    whatItDoes:
      "Runs its indented block only when the condition evaluates to `True`.",
    whatBreaksWithoutIt:
      "Using single `=` (assignment) instead of `==` (comparison) inside `if` crashes with a SyntaxError.",
    test: (c) => /\bif\b/.test(c) && !/\belif\b/.test(c) && !/\belse\s*:/.test(c),
  },
  {
    id: "try_except",
    tokenLabel: "try / except",
    category: "CRASH SHIELD",
    whatItDoes:
      "Attempts risky operations inside `try:` and catches specific errors (like `ZeroDivisionError` or `ValueError`) cleanly.",
    whatBreaksWithoutIt:
      "One bad input (`0` or `'ERR'`) crashes the entire program instead of returning a safe fallback.",
    test: (c) => /\btry\s*:/.test(c) && /\bexcept\b/.test(c),
  },
  {
    id: "enumerate",
    tokenLabel: "enumerate()",
    category: "INDEX + ITEM",
    whatItDoes:
      "Yields `(index, value)` pairs on every step so you get both the position `0, 1, 2...` and the item cleanly.",
    whatBreaksWithoutIt:
      "Calling `.index(val)` inside a loop turns an O(n) scan into slow O(n²) and breaks on duplicate numbers!",
    test: (c) => /\benumerate\s*\(/.test(c),
  },
  {
    id: "for_loop",
    tokenLabel: "for ... in",
    category: "ITERATION",
    whatItDoes:
      "Visits every item in a list, string, or range from left to right and runs the indented body each turn.",
    whatBreaksWithoutIt:
      "Putting `return` indented *inside* the loop by accident exits on item #1 before checking the rest!",
    test: (c) => /\bfor\s+.+\s+in\s+/.test(c),
  },
  {
    id: "while_loop",
    tokenLabel: "while ...:",
    category: "POINTER LOOP",
    whatItDoes:
      "Keeps repeating as long as its condition stays `True` — ideal for converging `left < right` or `low <= high` pointers.",
    whatBreaksWithoutIt:
      "Forgetting to update `left += 1` / `right -= 1` traps your code in an infinite loop!",
    test: (c) => /\bwhile\s+/.test(c),
  },
  {
    id: "plus_equals",
    tokenLabel: "+= / -=",
    category: "ACCUMULATOR",
    whatItDoes:
      "Updates a variable in place (`total += x` is shorthand for `total = total + x`).",
    whatBreaksWithoutIt:
      "Writing `total = x` overwrites the running sum instead of adding to it!",
    test: (c) => /[+-]=/.test(c),
  },
  {
    id: "modulo",
    tokenLabel: "% (modulo)",
    category: "WRAP / SHARD",
    whatItDoes:
      "Returns the division remainder (`10 % 3 == 1`), wrapping any non-negative integer cleanly into `0 .. N-1`.",
    whatBreaksWithoutIt:
      "Indexing `servers[request_id]` directly crashes with `IndexError` as soon as `request_id >= len(servers)`!",
    test: (c) => /%/.test(c),
  },
  {
    id: "floor_div",
    tokenLabel: "// (int div)",
    category: "MIDPOINT",
    whatItDoes:
      "Divides and rounds down to a whole integer (`(0 + 5) // 2 == 2`) so you can use it as a list index.",
    whatBreaksWithoutIt:
      "Regular `/` produces a float like `2.5`, crashing `arr[mid]` with `TypeError: list indices must be integers`!",
    test: (c) => /\/\//.test(c),
  },
  {
    id: "dict_get",
    tokenLabel: ".get(key, default)",
    category: "SAFE O(1) READ",
    whatItDoes:
      "Looks up `key` in a dictionary in O(1) time, returning `default` safely whenever `key` is missing.",
    whatBreaksWithoutIt:
      "Reading `cache[key]` directly raises a fatal `KeyError` on the very first cache miss!",
    test: (c) => /\.get\s*\(/.test(c),
  },
  {
    id: "in_lookup",
    tokenLabel: "x in collection",
    category: "MEMBERSHIP",
    whatItDoes:
      "Checks whether `x` exists inside a `dict`/`set` in instant **O(1)** time (or scans a `list`/`str` in O(n)).",
    whatBreaksWithoutIt:
      "Using a `list` instead of a `set` or `dict` for repeated `in` checks slows large inputs down 1,000x.",
    test: (c) => /\bif\s+[^\n:]+\bin\b/.test(c),
  },
  {
    id: "set_ops",
    tokenLabel: "set() / &",
    category: "DEDUP & OVERLAP",
    whatItDoes:
      "`set(items)` removes duplicates in O(n), and `set_a & set_b` finds common elements in hash speed.",
    whatBreaksWithoutIt:
      "Sets are unordered — wrap with `sorted(...)` when tests expect deterministic A–Z or ascending output.",
    test: (c) => /\bset\s*\(/.test(c),
  },
  {
    id: "slice",
    tokenLabel: "seq[a:b]",
    category: "SLICING",
    whatItDoes:
      "Extracts a sub-list or sub-string from `a` up to (but NOT including) `b` without crashing if `b > len(seq)`.",
    whatBreaksWithoutIt:
      "Remember the stop index is exclusive: `items[:3]` grabs indices `0, 1, 2` (3 items total).",
    test: (c) => /\[[^\]]*:[^\]]*\]/.test(c),
  },
  {
    id: "strip_lower",
    tokenLabel: ".strip().lower()",
    category: "TEXT CLEANUP",
    whatItDoes:
      "Trims leading/trailing spaces and normalizes letters to lowercase (`'  Aria ' -> 'aria'`).",
    whatBreaksWithoutIt:
      "`'Aria'` and `' aria '` get treated as two completely different users!",
    test: (c) => /\.strip\s*\(/.test(c) || /\.lower\s*\(/.test(c),
  },
  {
    id: "join_split",
    tokenLabel: ".join() / .split()",
    category: "STRING <-> LIST",
    whatItDoes:
      "`.split()` breaks text into a word list; `' | '.join(words)` glues a string list together with a separator.",
    whatBreaksWithoutIt:
      "`.join()` crashes with `TypeError` if any item in the list is an `int` instead of a `str`!",
    test: (c) => /\.(?:join|split)\s*\(/.test(c),
  },
  {
    id: "fstring",
    tokenLabel: 'f"...{var}..."',
    category: "F-STRING",
    whatItDoes:
      "Embeds live Python variables or math expressions inside `{ }` directly within a string.",
    whatBreaksWithoutIt:
      'Forgetting the leading `f` before quotes prints literal `"{var}"` text instead of its value!',
    test: (c) => /\bf["']/.test(c),
  },
  {
    id: "stack_push_pop",
    tokenLabel: ".append() / .pop()",
    category: "LIFO STACK",
    whatItDoes:
      "`.append(x)` pushes onto the end in O(1); `.pop()` removes & returns the most recent item in O(1).",
    whatBreaksWithoutIt:
      "Calling `.pop()` on an empty list `[]` crashes with `IndexError: pop from empty list` — always check `if not stack:` first!",
    test: (c) => /\.(?:append|pop)\s*\(/.test(c),
  },
  {
    id: "args_kwargs",
    tokenLabel: "*args, **kwargs",
    category: "DECORATORS",
    whatItDoes:
      "Forwards any number of positional and keyword arguments transparently into the wrapped function.",
    whatBreaksWithoutIt:
      "Hardcoding `wrapper(x)` breaks as soon as the decorated function takes 0 or 2+ arguments!",
    test: (c) => /\*args/.test(c),
  },
  {
    id: "assignment",
    tokenLabel: "= (assign)",
    category: "MEMORY LABEL",
    whatItDoes:
      "Evaluates the expression on the right side first, then binds that result to the variable name on the left.",
    whatBreaksWithoutIt:
      "Wrapping numbers in quotes (`'100'`) turns them into text strings that can't do math!",
    test: (c) => /(?:^|\s)[A-Za-z_][A-Za-z0-9_]*\s*=\s*[^=]/.test(c),
  },
];

function cleanExampleLines(rawCode: string): string[] {
  return (rawCode || "")
    .split("\n")
    .map((ln) => ln.replace(/\r$/, ""))
    .filter(
      (ln) =>
        ln.trim().length > 0 &&
        !ln.trim().startsWith("# Sibling"),
    );
}

function extractXrayTokens(code: string): XrayTokenDoc[] {
  const matched: XrayTokenDoc[] = [];
  for (const rule of XRAY_CATALOG) {
    if (rule.test(code)) {
      matched.push({
        id: rule.id,
        tokenLabel: rule.tokenLabel,
        category: rule.category,
        whatItDoes: rule.whatItDoes,
        whatBreaksWithoutIt: rule.whatBreaksWithoutIt,
      });
    }
    if (matched.length >= 5) break;
  }
  if (matched.length === 0) {
    matched.push({
      id: "python_expr",
      tokenLabel: "Python Expression",
      category: "CORE SYNTAX",
      whatItDoes:
        "Evaluates inputs step by step from inner parentheses outward to produce a deterministic return value.",
      whatBreaksWithoutIt:
        "Check types and indentation carefully so every input branch returns the expected type.",
    });
  }
  return matched;
}

const CURATED_TINKER_SPECS: Record<
  string,
  { codeLines: string[]; scenarios: TinkerScenario[] }
> = {
  "exp-py-01": {
    codeLines: [
      "def build_pet_card(pet_name, bonus_energy):",
      "    energy = 50 + bonus_energy",
      "    is_awake = True",
      "    return (pet_name, energy, is_awake)",
    ],
    scenarios: [
      {
        label: "⚡ Normal",
        inputDisplay: 'pet_name="Mochi", bonus_energy=25',
        outputDisplay: "('Mochi', 75, True)",
        traceNote: "50 + 25 = 75 -> returns 3-item tuple",
        tone: "normal",
        executedLineIndices: [0, 1, 2, 3],
      },
      {
        label: "🔍 Zero Bonus",
        inputDisplay: 'pet_name="Pixel", bonus_energy=0',
        outputDisplay: "('Pixel', 50, True)",
        traceNote: "50 + 0 keeps base energy 50 intact",
        tone: "edge",
        executedLineIndices: [0, 1, 2, 3],
      },
      {
        label: "🚀 Big Boost",
        inputDisplay: 'pet_name="Byte", bonus_energy=150',
        outputDisplay: "('Byte', 200, True)",
        traceNote: "Integer math scales cleanly without string concat bugs",
        tone: "guard",
        executedLineIndices: [0, 1, 2, 3],
      },
    ],
  },

  "exp-py-04": {
    codeLines: [
      "def calc_combo(base_pts, bonus, mult):",
      "    subtotal = base_pts + bonus",
      "    return subtotal * mult",
    ],
    scenarios: [
      {
        label: "⚡ 2x Combo",
        inputDisplay: "base_pts=100, bonus=25, mult=2",
        outputDisplay: "250",
        traceNote: "(100 + 25) = 125, then 125 * 2 = 250",
        tone: "normal",
        executedLineIndices: [0, 1, 2],
      },
      {
        label: "🔍 No Streak",
        inputDisplay: "base_pts=80, bonus=0, mult=3",
        outputDisplay: "240",
        traceNote: "(80 + 0) * 3 = 240",
        tone: "edge",
        executedLineIndices: [0, 1, 2],
      },
      {
        label: "🛡️ 0x Multiplier",
        inputDisplay: "base_pts=150, bonus=50, mult=0",
        outputDisplay: "0",
        traceNote: "200 * 0 = 0 returned cleanly (not None!)",
        tone: "guard",
        executedLineIndices: [0, 1, 2],
      },
    ],
  },

  "exp-py-03": {
    codeLines: [
      "def weather_badge(temp_c):",
      "    if temp_c >= 30:",
      '        return "HOT"',
      "    elif temp_c >= 18:",
      '        return "COZY"',
      "    else:",
      '        return "CHILLY"',
    ],
    scenarios: [
      {
        label: "🔥 Top Branch",
        inputDisplay: "temp_c = 34",
        outputDisplay: "'HOT'",
        traceNote: "34 >= 30 is True -> returns 'HOT', skips elif & else!",
        tone: "normal",
        executedLineIndices: [0, 1, 2],
      },
      {
        label: "☕ Middle elif",
        inputDisplay: "temp_c = 22",
        outputDisplay: "'COZY'",
        traceNote: "22 >= 30 is False -> checks elif 22 >= 18 (True!)",
        tone: "edge",
        executedLineIndices: [0, 1, 3, 4],
      },
      {
        label: "❄️ else Fallback",
        inputDisplay: "temp_c = 8",
        outputDisplay: "'CHILLY'",
        traceNote: "Both if & elif are False -> lands in else!",
        tone: "guard",
        executedLineIndices: [0, 1, 3, 5, 6],
      },
    ],
  },

  "exp-py-02": {
    codeLines: [
      "def sum_xp(quests):",
      "    total = 0",
      "    for xp in quests:",
      "        total += xp",
      "    return total",
    ],
    scenarios: [
      {
        label: "⚡ 3 Quests",
        inputDisplay: "quests = [10, 20, 5]",
        outputDisplay: "35",
        traceNote: "Loop runs 3x: total 0 -> 10 -> 30 -> 35",
        tone: "normal",
        executedLineIndices: [0, 1, 2, 3, 4],
      },
      {
        label: "🔍 Single Item",
        inputDisplay: "quests = [50]",
        outputDisplay: "50",
        traceNote: "Loop runs 1x: total 0 -> 50 -> returns 50",
        tone: "edge",
        executedLineIndices: [0, 1, 2, 3, 4],
      },
      {
        label: "🛡️ Empty List []",
        inputDisplay: "quests = []",
        outputDisplay: "0",
        traceNote: "Loop body is skipped completely -> returns initial 0!",
        tone: "guard",
        executedLineIndices: [0, 1, 2, 4],
      },
    ],
  },

  "exp-py-08": {
    codeLines: [
      "def avg_coins(total_coins, chests):",
      "    try:",
      "        return total_coins / chests",
      "    except ZeroDivisionError:",
      "        return 0.0",
    ],
    scenarios: [
      {
        label: "⚡ Safe Divide",
        inputDisplay: "total_coins=100, chests=4",
        outputDisplay: "25.0",
        traceNote: "No error raised -> except block is skipped!",
        tone: "normal",
        executedLineIndices: [0, 1, 2],
      },
      {
        label: "🛡️ Zero Chests!",
        inputDisplay: "total_coins=100, chests=0",
        outputDisplay: "0.0",
        traceNote: "100 / 0 triggers ZeroDivisionError -> caught safely!",
        tone: "guard",
        executedLineIndices: [0, 1, 2, 3, 4],
      },
      {
        label: "🔍 0 Divided by 5",
        inputDisplay: "total_coins=0, chests=5",
        outputDisplay: "0.0",
        traceNote: "0 / 5 is valid math (0.0) without triggering except",
        tone: "edge",
        executedLineIndices: [0, 1, 2],
      },
    ],
  },

  "exp-alg-01": {
    codeLines: [
      "seen_at = {}",
      "for idx, weight in enumerate(weights):",
      "    missing = limit - weight",
      "    if missing in seen_at:",
      "        return [seen_at[missing], idx]",
      "    seen_at[weight] = idx",
    ],
    scenarios: [
      {
        label: "⚡ Early Match",
        inputDisplay: "weights=[3, 9, 5], limit=12",
        outputDisplay: "[0, 1]",
        traceNote: "idx=0 stores {3:0}; idx=1 needs 3 -> HIT at idx 0!",
        tone: "normal",
        executedLineIndices: [0, 1, 2, 3, 4, 5],
      },
      {
        label: "🔍 Duplicate Pair",
        inputDisplay: "weights=[6, 6], limit=12",
        outputDisplay: "[0, 1]",
        traceNote: "Checking BEFORE inserting prevents pairing idx 0 with itself!",
        tone: "edge",
        executedLineIndices: [0, 1, 2, 3, 4, 5],
      },
      {
        label: "🎯 Late Hit",
        inputDisplay: "weights=[1, 4, 8, 7], limit=11",
        outputDisplay: "[1, 3]",
        traceNote: "seen_at grows {1:0, 4:1, 8:2} -> 7 hits 4 in O(1)!",
        tone: "guard",
        executedLineIndices: [0, 1, 2, 3, 4, 5],
      },
    ],
  },

  "exp-sys-01": {
    codeLines: [
      "def spend_credit(credits):",
      "    if credits > 0:",
      "        return (True, credits - 1)",
      "    return (False, 0)",
    ],
    scenarios: [
      {
        label: "⚡ Bucket Has 3",
        inputDisplay: "credits = 3",
        outputDisplay: "(True, 2)",
        traceNote: "3 > 0 -> admitted! Spends 1 credit, 2 left",
        tone: "normal",
        executedLineIndices: [0, 1, 2],
      },
      {
        label: "🔍 Last Credit",
        inputDisplay: "credits = 1",
        outputDisplay: "(True, 0)",
        traceNote: "1 > 0 -> admitted! Bucket drains cleanly to 0",
        tone: "edge",
        executedLineIndices: [0, 1, 2],
      },
      {
        label: "🛡️ Drained (429)",
        inputDisplay: "credits = 0",
        outputDisplay: "(False, 0)",
        traceNote: "0 > 0 is False -> skips if-block, throttles request!",
        tone: "guard",
        executedLineIndices: [0, 1, 3],
      },
    ],
  },
};

function computeSyntheticScenarios(
  lesson: Lesson,
  codeLines: string[],
): TinkerScenario[] {
  const allIndices = codeLines.map((_, idx) => idx);
  const elseIdx = codeLines.findIndex((ln) => /^\s*(?:elif|else|except)\b/.test(ln));
  const firstReturnIdx = codeLines.findIndex((ln) => /\breturn\b/.test(ln));

  const happyIndices =
    elseIdx > 0 && firstReturnIdx >= 0 && firstReturnIdx < elseIdx
      ? allIndices.filter((i) => i <= firstReturnIdx)
      : allIndices;

  const fallbackIndices =
    elseIdx > 0 && firstReturnIdx >= 0 && firstReturnIdx < elseIdx
      ? allIndices.filter((i) => i !== firstReturnIdx)
      : allIndices;

  const ex0 = lesson.examples?.[0];
  const ex1 = lesson.examples?.[1];
  const vis0 = Array.isArray(lesson.visual_data) ? lesson.visual_data[0] : null;
  const vis1 =
    Array.isArray(lesson.visual_data) && lesson.visual_data.length > 1
      ? lesson.visual_data[lesson.visual_data.length - 1]
      : null;

  const scenarios: TinkerScenario[] = [
    {
      label: "⚡ Sample #1",
      inputDisplay: ex0?.input || vis0?.label || "standard input",
      outputDisplay:
        ex0?.output || lesson.expected_output || vis0?.value || "✓ Pass",
      traceNote:
        ex0?.explanation ||
        "Primary execution path transforms the input cleanly.",
      tone: "normal",
      executedLineIndices: happyIndices,
    },
    {
      label: ex1 ? "🔍 Sample #2" : "🔍 Step Trace",
      inputDisplay:
        ex1?.input ||
        vis1?.label ||
        (ex0?.input ? `${ex0.input} (variant)` : "alternate input"),
      outputDisplay:
        ex1?.output || vis1?.value || ex0?.output || lesson.expected_output || "✓",
      traceNote:
        ex1?.explanation ||
        (elseIdx > 0
          ? "Exercises the secondary branch / fallback guard."
          : "Runs in predictable time and space across varied inputs."),
      tone: "edge",
      executedLineIndices: fallbackIndices,
    },
    {
      label: "🛡️ Boundary Check",
      inputDisplay: "minimal / edge case",
      outputDisplay:
        elseIdx > 0 ? "Safe fallback ✓" : `Verified ${lesson.complexities?.time || "O(n)"}`,
      traceNote:
        lesson.constraints?.[0]?.replace(/`/g, "") ||
        "Guards empty or boundary values without raising runtime errors.",
      tone: "guard",
      executedLineIndices: fallbackIndices,
    },
  ];

  return scenarios;
}

/**
 * Builds the zero-bloat Interactive Tinker + X-Ray specification for any Devy lesson.
 */
export function buildConceptTinkerSpec(
  lesson: Lesson,
  enrichment?: LessonEnrichment | null,
): ConceptTinkerSpec {
  const curated =
    CURATED_TINKER_SPECS[lesson.id] ||
    (lesson.slug ? CURATED_TINKER_SPECS[lesson.slug] : undefined);

  if (curated) {
    return {
      codeLines: curated.codeLines,
      scenarios: curated.scenarios,
      xrayTokens: extractXrayTokens(curated.codeLines.join("\n")),
    };
  }

  const learnView = buildOrganizedLearnView(lesson.content, enrichment);
  const rawExample =
    learnView.singleExampleCode || learnView.cheatSheetCode || "pass";
  const codeLines = cleanExampleLines(rawExample);
  const safeLines = codeLines.length > 0 ? codeLines : ["pass"];

  return {
    codeLines: safeLines,
    scenarios: computeSyntheticScenarios(lesson, safeLines),
    xrayTokens: extractXrayTokens(safeLines.join("\n")),
  };
}
