export interface EditorSelectionResult {
  code: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface SmartEnterResult {
  handled: boolean;
  code: string;
  cursorPos: number;
}

export interface AssertionDiff {
  reason: string;
  commonPrefix: string;
  expectedRest: string;
  actualRest: string;
}

export interface FailedTestDiagnosis {
  badge: string;
  tip: string;
}

export interface BeginnerErrorHint {
  badge: string;
  lineNumber: number | null;
  whatHappened: string;
  howToFix: string;
}

export interface MobileGoalSummary {
  signature: string;
  targetOutput: string;
  assignment: string;
}

function clampOffset(offset: number, length: number): number {
  return Math.min(Math.max(0, offset), length);
}

function getLineSpan(code: string, start: number, end: number) {
  const safeStart = clampOffset(start, code.length);
  const safeEnd = Math.max(safeStart, clampOffset(end, code.length));
  const blockStart = code.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;

  // Exclude a trailing newline if the selection stops right at a line start.
  const effectiveEnd =
    safeEnd > safeStart && code[safeEnd - 1] === "\n" ? safeEnd - 1 : safeEnd;
  const nextNewline = code.indexOf("\n", effectiveEnd);
  const blockEnd = nextNewline === -1 ? code.length : nextNewline;

  return { safeStart, safeEnd, blockStart, blockEnd };
}

/**
 * Extracts the most likely student-code line number from a Python traceback.
 * Prefers frames inside [1, maxLines] so hidden test harness frames don't shadow user lines.
 */
export function extractErrorLineNumber(
  rawOutput: string,
  maxLines?: number,
): number | null {
  if (!rawOutput) return null;

  const matches = [...rawOutput.matchAll(/line\s+(\d+)/gi)]
    .map((m) => parseInt(m[1], 10))
    .filter((n) => Number.isFinite(n) && n >= 1);

  if (matches.length === 0) return null;

  if (typeof maxLines === "number" && maxLines > 0) {
    // Tracebacks list outer frames first and innermost call site last; check matches in reverse
    // so an error inside a student's helper called by their main function picks the inner user line.
    const userLines = matches.filter((line) => line <= maxLines);
    if (userLines.length > 0) {
      return userLines[userLines.length - 1];
    }
  }

  return matches[0];
}

/**
 * Toggles `# ` comments on every line touched by the current selection.
 * Uncomments only when every non-empty touched line is already commented.
 */
export function toggleLineComment(
  code: string,
  selectionStart: number,
  selectionEnd: number,
): EditorSelectionResult {
  const { safeStart, safeEnd, blockStart, blockEnd } = getLineSpan(
    code,
    selectionStart,
    selectionEnd,
  );
  const lines = code.slice(blockStart, blockEnd).split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const shouldUncomment =
    nonEmptyLines.length > 0 &&
    nonEmptyLines.every((line) => /^\s*#/.test(line));

  const minIndent = nonEmptyLines.reduce((min, line) => {
    const indentLen = line.match(/^(\s*)/)?.[1].length ?? 0;
    return Math.min(min, indentLen);
  }, Infinity);
  const insertCol = Number.isFinite(minIndent) ? minIndent : 0;

  let firstLineDelta = 0;
  let totalDelta = 0;

  const updatedLines = lines.map((line, index) => {
    let nextLine = line;
    if (shouldUncomment) {
      const match = line.match(/^(\s*)# ?/);
      if (match) {
        const removed = match[0].length - match[1].length;
        nextLine = match[1] + line.slice(match[0].length);
        totalDelta -= removed;
        if (index === 0) firstLineDelta = -removed;
      }
    } else if (line.trim().length > 0 || lines.length === 1) {
      const col = Math.min(insertCol, line.length);
      nextLine = line.slice(0, col) + "# " + line.slice(col);
      totalDelta += 2;
      if (index === 0) firstLineDelta = 2;
    }
    return nextLine;
  });

  const nextCode =
    code.slice(0, blockStart) +
    updatedLines.join("\n") +
    code.slice(blockEnd);

  return {
    code: nextCode,
    selectionStart: Math.max(blockStart, safeStart + firstLineDelta),
    selectionEnd: Math.max(blockStart, safeEnd + totalDelta),
  };
}

/**
 * Indents or outdents lines covered by the selection by up to 4 spaces.
 */
export function indentSelection(
  code: string,
  selectionStart: number,
  selectionEnd: number,
  direction: "indent" | "outdent",
): EditorSelectionResult {
  const { safeStart, safeEnd, blockStart, blockEnd } = getLineSpan(
    code,
    selectionStart,
    selectionEnd,
  );
  const hasMultiLineSpan =
    safeEnd > safeStart && code.slice(blockStart, blockEnd).includes("\n");

  if (direction === "indent" && safeStart === safeEnd) {
    const nextCode =
      code.slice(0, safeStart) + "    " + code.slice(safeEnd);
    return {
      code: nextCode,
      selectionStart: safeStart + 4,
      selectionEnd: safeStart + 4,
    };
  }

  if (direction === "indent" && !hasMultiLineSpan) {
    const nextCode =
      code.slice(0, safeStart) + "    " + code.slice(safeEnd);
    return {
      code: nextCode,
      selectionStart: safeStart + 4,
      selectionEnd: safeStart + 4,
    };
  }

  const lines = code.slice(blockStart, blockEnd).split("\n");
  let firstLineDelta = 0;
  let totalDelta = 0;

  const updatedLines = lines.map((line, index) => {
    if (direction === "indent") {
      if (line.length === 0 && lines.length > 1) return line;
      totalDelta += 4;
      if (index === 0) firstLineDelta = 4;
      return "    " + line;
    }

    const match = line.match(/^( {1,4}|\t)/);
    if (!match) return line;
    const removed = match[1].length;
    totalDelta -= removed;
    if (index === 0) firstLineDelta = -removed;
    return line.slice(removed);
  });

  const nextCode =
    code.slice(0, blockStart) +
    updatedLines.join("\n") +
    code.slice(blockEnd);

  return {
    code: nextCode,
    selectionStart: Math.max(blockStart, safeStart + firstLineDelta),
    selectionEnd: Math.max(blockStart, safeEnd + totalDelta),
  };
}

function stripTrailingPythonComment(line: string): string {
  let quoteChar: "'" | '"' | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && quoteChar) {
      i++;
      continue;
    }
    if (!quoteChar && (ch === "'" || ch === '"')) {
      quoteChar = ch;
    } else if (quoteChar === ch) {
      quoteChar = null;
    } else if (!quoteChar && ch === "#") {
      return line.slice(0, i);
    }
  }
  return line;
}

/**
 * Computes auto-indentation for Enter, recognizing `:` even when followed by `# comments`.
 */
export function computeSmartEnter(
  code: string,
  selectionStart: number,
  selectionEnd: number,
): SmartEnterResult {
  const start = clampOffset(selectionStart, code.length);
  const end = Math.max(start, clampOffset(selectionEnd, code.length));
  const beforeCursor = code.slice(0, start);
  const lastNewlineIdx = beforeCursor.lastIndexOf("\n");
  const currentLine = beforeCursor.slice(lastNewlineIdx + 1);
  const leadingSpaces = currentLine.match(/^[ ]*/)?.[0] || "";
  const codeWithoutComment = stripTrailingPythonComment(currentLine);
  const endsWithColon = codeWithoutComment.trimEnd().endsWith(":");

  if (leadingSpaces.length === 0 && !endsWithColon) {
    return { handled: false, code, cursorPos: start };
  }

  const nextIndent = leadingSpaces + (endsWithColon ? "    " : "");
  const insertion = "\n" + nextIndent;
  return {
    handled: true,
    code: code.slice(0, start) + insertion + code.slice(end),
    cursorPos: start + insertion.length,
  };
}

const PYTHON_AUTO_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
};

const PYTHON_CLOSING_CHARS = new Set([")", "]", "}", '"', "'"]);

export interface PythonAutoEditInput {
  code: string;
  selectionStart: number;
  selectionEnd: number;
  key: string;
  shiftKey?: boolean;
  metaOrCtrlKey?: boolean;
  altKey?: boolean;
}

/**
 * Unified Python editor key-edit helper for Playground, Mini-Builds, and Bug Hunt:
 * handles Tab/Shift+Tab indent, Cmd/Ctrl+/ comments, Smart Enter auto-indent,
 * auto-closing brackets/quotes, closing-char skip-over, and pair backspace.
 */
export function computePythonAutoEdit(
  input: PythonAutoEditInput,
): EditorSelectionResult | null {
  const {
    code,
    selectionStart,
    selectionEnd,
    key,
    shiftKey = false,
    metaOrCtrlKey = false,
    altKey = false,
  } = input;

  if (altKey) return null;

  const start = clampOffset(selectionStart, code.length);
  const end = Math.max(start, clampOffset(selectionEnd, code.length));

  if (key === "/" && metaOrCtrlKey) {
    return toggleLineComment(code, start, end);
  }

  if (metaOrCtrlKey) return null;

  if (key === "Tab") {
    return indentSelection(code, start, end, shiftKey ? "outdent" : "indent");
  }

  if (key === "Enter" && !shiftKey) {
    const enterRes = computeSmartEnter(code, start, end);
    if (enterRes.handled) {
      return {
        code: enterRes.code,
        selectionStart: enterRes.cursorPos,
        selectionEnd: enterRes.cursorPos,
      };
    }
    return null;
  }

  // Closing-char skip-over when typing the matching closer right before it
  if (
    start === end &&
    PYTHON_CLOSING_CHARS.has(key) &&
    code[start] === key
  ) {
    return {
      code,
      selectionStart: start + 1,
      selectionEnd: start + 1,
    };
  }

  // Auto-closing pair insertion (or wrapping a selected span!)
  if (PYTHON_AUTO_PAIRS[key]) {
    const closer = PYTHON_AUTO_PAIRS[key];
    if (start < end) {
      const wrapped = key + code.slice(start, end) + closer;
      return {
        code: code.slice(0, start) + wrapped + code.slice(end),
        selectionStart: start + 1,
        selectionEnd: end + 1,
      };
    }
    // Avoid auto-pairing a quote immediately after an identifier/number (e.g. don't)
    const prevChar = start > 0 ? code[start - 1] : "";
    if ((key === "'" || key === '"') && /[A-Za-z0-9_]/.test(prevChar)) {
      return null;
    }
    return {
      code: code.slice(0, start) + key + closer + code.slice(end),
      selectionStart: start + 1,
      selectionEnd: start + 1,
    };
  }

  // Pair backspace: deleting `(` in `()` removes both
  if (
    key === "Backspace" &&
    start === end &&
    start > 0 &&
    PYTHON_AUTO_PAIRS[code[start - 1]] === code[start]
  ) {
    return {
      code: code.slice(0, start - 1) + code.slice(start + 1),
      selectionStart: start - 1,
      selectionEnd: start - 1,
    };
  }

  return null;
}

/**
 * Diagnoses where and why an actual test output differs from expected output.
 */
export function computeAssertionDiff(
  expected: string,
  actual: string,
): AssertionDiff {
  if (expected === actual) {
    return {
      reason: "exact match",
      commonPrefix: expected,
      expectedRest: "",
      actualRest: "",
    };
  }

  let prefixLen = 0;
  const maxLen = Math.min(expected.length, actual.length);
  while (prefixLen < maxLen && expected[prefixLen] === actual[prefixLen]) {
    prefixLen++;
  }

  let reason = `differs at char ${prefixLen + 1}`;
  if (expected.trim() === actual.trim()) {
    reason = "leading/trailing whitespace mismatch";
  } else if (expected.toLowerCase() === actual.toLowerCase()) {
    reason = "case sensitivity mismatch";
  } else if (expected.includes("\n") || actual.includes("\n")) {
    const lineNum = expected.slice(0, prefixLen).split("\n").length;
    reason = `line ${lineNum} mismatch`;
  } else if (
    expected.replace(/['"]/g, "") === actual.replace(/['"]/g, "")
  ) {
    reason = "quote style difference";
  } else if (actual.trim().startsWith("Error:") || actual.includes("Traceback")) {
    reason = "runtime exception";
  } else if (actual.trim() === "" || actual.trim() === "(no output)") {
    reason = "missing output or return";
  }

  return {
    reason,
    commonPrefix: expected.slice(0, prefixLen),
    expectedRest: expected.slice(prefixLen),
    actualRest: actual.slice(prefixLen),
  };
}

/**
 * Suggests a starter scratchpad expression based on the first top-level function in `code`.
 */
export function suggestQuickTestExpression(code: string): string {
  const fnMatch = code.match(/^[ \t]*def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/m);
  if (!fnMatch) {
    return 'print("hello")';
  }

  const fnName = fnMatch[1];
  const rawParams = fnMatch[2]
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && p !== "self" && p !== "cls");

  const sampleArgs = rawParams.map((param) => {
    const clean = param.split("=")[0].split(":")[0].trim().toLowerCase();
    if (clean.includes("num") || clean.includes("list") || clean.includes("arr") || clean === "a" || clean === "b") {
      return "[1, 2, 3]";
    }
    if (clean === "s" || clean.includes("str") || clean.includes("word") || clean.includes("text") || clean.includes("name")) {
      return '"abc"';
    }
    if (clean === "n" || clean === "k" || clean.includes("target") || clean.includes("idx") || clean.includes("count")) {
      return "3";
    }
    return "0";
  });

  return `print(${fnName}(${sampleArgs.join(", ")}))`;
}

function stripOuterQuotes(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"')))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function hasUnconditionalLoopReturn(code: string): boolean {
  const lines = code.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (!/^(for|while)\b.*:\s*(#.*)?$/.test(trimmed)) continue;

    const loopIndent = raw.match(/^\s*/)?.[0].length ?? 0;
    let bodyIndent: number | null = null;

    for (let j = i + 1; j < lines.length; j++) {
      const nextRaw = lines[j];
      const nextTrimmed = nextRaw.trim();
      if (!nextTrimmed || nextTrimmed.startsWith("#")) continue;

      const nextIndent = nextRaw.match(/^\s*/)?.[0].length ?? 0;
      if (nextIndent <= loopIndent) break;
      if (bodyIndent === null) {
        bodyIndent = nextIndent;
      }
      if (nextIndent === bodyIndent && /^return(\b|$)/.test(nextTrimmed)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Produces an actionable conceptual debugging hint for a failed test assertion.
 */
export function diagnoseFailedTest(
  test: { input?: string; expected: string; actual: string },
  code: string = "",
): FailedTestDiagnosis | null {
  const rawExpected = String(test.expected ?? "");
  const rawActual = String(test.actual ?? "");
  const expected = rawExpected.trim();
  const actual = rawActual.trim();
  const input = (test.input ?? "").trim();
  const expUnquoted = stripOuterQuotes(expected);
  const actUnquoted = stripOuterQuotes(actual);

  if (
    actual.includes("'___' is not defined") ||
    (/\b___\b/.test(code) &&
      (actual === "None" || actual.includes("NameError") || actual.includes("Error:")))
  ) {
    return {
      badge: "FILL IN ___ BLANKS",
      tip: "Your editor still has an unfilled `___` scaffold placeholder — replace `___` with your Python expression before grading.",
    };
  }

  if (actual === "None") {
    if (
      /\breturn\s+[^\n#]*\.(sort|append|extend|reverse|insert|remove|clear)\s*\(/.test(
        code,
      )
    ) {
      return {
        badge: "IN-PLACE METHOD RETURNS NONE",
        tip: "List methods like `.sort()`, `.append()`, and `.reverse()` modify the list in-place and return `None`. Call the method on its own line, then `return` the list on the next line.",
      };
    }
    const usesPrint = /\bprint\s*\(/.test(code);
    return {
      badge: "RETURNED NONE",
      tip: usesPrint
        ? "Your function printed or fell off the end without returning a value. Replace print(...) with return ..."
        : "Your function returned None — make sure every branch finishes with a `return` statement instead of `pass`.",
    };
  }

  if (actual.startsWith("Error:") || actual.includes("Traceback")) {
    return {
      badge: "RUNTIME EXCEPTION",
      tip: "Your function raised a Python error on this test input. Check the CONSOLE tab or guard edge inputs before indexing.",
    };
  }

  if (
    (rawExpected !== rawActual && expected !== "" && expected === actual) ||
    (expUnquoted !== actUnquoted &&
      expUnquoted.trim() !== "" &&
      expUnquoted.trim() === actUnquoted.trim())
  ) {
    return {
      badge: "EXTRA WHITESPACE",
      tip: "Your returned string has extra leading or trailing spaces — use `.strip()` or check the spaces inside your quotes.",
    };
  }

  if (
    (rawExpected === rawActual && expected !== "") ||
    (expected !== actual && expUnquoted !== "" && expUnquoted === actUnquoted)
  ) {
    return {
      badge: "STRING VS NUMBER TYPE",
      tip: "The value text matches, but the Python type differs (e.g., string `'150'` in quotes vs number `150`). Remove quotes or convert with `int(...)` / `str(...)`.",
    };
  }

  if (expected !== actual && hasUnconditionalLoopReturn(code)) {
    return {
      badge: "EARLY RETURN IN LOOP",
      tip: "Your `return` statement is indented directly inside the loop, so the function stops on the very first item! Unindent your final `return` so it runs after the loop finishes.",
    };
  }

  if (
    expected !== actual &&
    (input.includes("[]") ||
      input.includes('""') ||
      input.includes("''") ||
      input.includes("{}") ||
      /\b0\b/.test(input))
  ) {
    return {
      badge: "EMPTY / ZERO EDGE CASE",
      tip: "This failure is on an empty or zero boundary input — add an early `if not ...:` or `== 0` check before accessing elements.",
    };
  }

  if (
    (expected === "True" || expected === "False") &&
    (actual === "True" || actual === "False")
  ) {
    return {
      badge: "BOUNDARY LOGIC",
      tip: "Boolean result flipped — double-check comparison operators (`<` vs `<=`, `>` vs `>=`) and `and`/`or` conditions.",
    };
  }

  if (
    expUnquoted.trim() !== "" &&
    expUnquoted.trim() !== actUnquoted.trim() &&
    expUnquoted.trim().toLowerCase() === actUnquoted.trim().toLowerCase()
  ) {
    return {
      badge: "LETTER CASING MISMATCH",
      tip: "The text matches, but uppercase/lowercase casing differs — check exact capitalization, `.lower()`, or `.upper()`.",
    };
  }

  const expNum = Number(expected);
  const actNum = Number(actual);
  if (
    expected !== "" &&
    actual !== "" &&
    !Number.isNaN(expNum) &&
    !Number.isNaN(actNum) &&
    Math.abs(expNum - actNum) === 1
  ) {
    return {
      badge: "OFF BY ONE",
      tip: "Result is off by 1 — verify loop bounds (`range(n)` vs `range(n + 1)`), 0-based indexing, or `<` vs `<=`.",
    };
  }

  if (
    expected.startsWith("[") &&
    !expected.startsWith("[(") &&
    actual.startsWith("[(") &&
    actual.includes(",)")
  ) {
    return {
      badge: "UNPACK SQL TUPLE ROWS",
      tip: "SQLite `.fetchall()` returns 1-column rows as tuples like `[('nova',)]` — unpack them with `[row[0] for row in rows]`.",
    };
  }

  if (
    (expected.startsWith("[") && actual.startsWith("(")) ||
    (expected.startsWith("(") && actual.startsWith("["))
  ) {
    return {
      badge: "CONTAINER TYPE",
      tip: expected.startsWith("[")
        ? "Expected a Python `list [...]` rather than a `tuple (...)` — wrap or convert with `[...]` or `list(...)`."
        : "Expected a Python `tuple (...)` rather than a `list [...]` — return comma-separated values or `tuple(...)`.",
    };
  }

  return null;
}

/**
 * Translates raw Python & SQLite tracebacks into plain-English coaching hints
 * paired with the best student-code line number for 1-tap "Jump to Line".
 */
export function translatePythonError(
  rawOutput: string,
  maxLines?: number,
): BeginnerErrorHint | null {
  if (!rawOutput) return null;

  const lineNumber = extractErrorLineNumber(rawOutput, maxLines);

  // SQLite-specific coaching (prioritized before generic Python errors)
  if (
    /Incorrect number of bindings supplied|parameters are of unsupported type/i.test(
      rawOutput,
    )
  ) {
    return {
      badge: "SQL PARAMETER TUPLE",
      lineNumber,
      whatHappened:
        "SQLite received a different number of bound parameters than `?` placeholders in your query.",
      howToFix:
        "For a 1-value query, add a trailing comma so Python builds a 1-item tuple: `con.execute(sql, (email,))` — NOT `(email)`!",
    };
  }

  if (/misuse of aggregate/i.test(rawOutput)) {
    return {
      badge: "SQL WHERE VS HAVING",
      lineNumber,
      whatHappened:
        "An aggregate function like `SUM()`, `COUNT()`, or `AVG()` was used inside `WHERE`.",
      howToFix:
        "Use `WHERE` for raw row filters before `GROUP BY`, and move `SUM(...)` / `AVG(...)` conditions into `HAVING` after `GROUP BY`!",
    };
  }

  const schemaMatch = rawOutput.match(/no such (table|column):\s*([^\n\r]+)/i);
  if (schemaMatch) {
    const kind = schemaMatch[1].toLowerCase();
    const missingName = schemaMatch[2].trim();
    return {
      badge: `SQL UNKNOWN ${kind.toUpperCase()}`,
      lineNumber,
      whatHappened: `SQLite couldn't find ${kind} '${missingName}' in the database schema.`,
      howToFix:
        "Check the exact table and column spelling in the Mission Brief (and make sure table aliases like `u.` or `p.` match your `FROM`/`JOIN` clause).",
    };
  }

  const sqlSyntaxMatch = rawOutput.match(/near\s+"([^"]+)":\s*syntax error/i);
  if (sqlSyntaxMatch) {
    return {
      badge: "SQL SYNTAX CHECK",
      lineNumber,
      whatHappened: `SQLite hit a SQL syntax error right near "${sqlSyntaxMatch[1]}".`,
      howToFix:
        "Check clause order (`SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT`), commas between columns, and matching quotes.",
    };
  }

  if (/IntegrityError/i.test(rawOutput)) {
    return {
      badge: "SQL CONSTRAINT CHECK",
      lineNumber,
      whatHappened:
        "A database constraint (PRIMARY KEY, UNIQUE, or NOT NULL) rejected this write.",
      howToFix:
        "Check whether a row with that primary key already exists or a required column value is missing.",
    };
  }

  if (rawOutput.includes("IndentationError")) {
    return {
      badge: "INDENTATION FIX",
      lineNumber,
      whatHappened:
        "Python expects code inside a block (after a colon ':') to be indented by 4 spaces.",
      howToFix:
        "Add 4 spaces (or tap '⇥ Tab') at the start of the line right below your 'def', 'if', 'else', or 'for' line.",
    };
  }

  if (rawOutput.includes("SyntaxError")) {
    return {
      badge: "SYNTAX TYPO",
      lineNumber,
      whatHappened:
        "Python spotted a punctuation typo and couldn't read this line.",
      howToFix:
        "Check for a missing colon ':' at the end of 'def/if/else/for', unclosed quotes \" \", or using single '=' instead of '==' inside an 'if' check.",
    };
  }

  if (rawOutput.includes("UnboundLocalError")) {
    const varMatch = rawOutput.match(/local variable '([^']+)'/i);
    const varName = varMatch ? varMatch[1] : "a variable";
    return {
      badge: `INITIALIZE '${varName}' FIRST`,
      lineNumber,
      whatHappened: `Your code read or updated '${varName}' before giving it a starting value inside the function.`,
      howToFix: `Initialize \`${varName} = 0\` (or \`[]\` / \`{}\`) before your loop or \`if\` branch.`,
    };
  }

  if (rawOutput.includes("NameError")) {
    const nameMatch = rawOutput.match(/name\s+'([^']+)'\s+is not defined/i);
    const unknownName = nameMatch ? nameMatch[1] : "that name";
    if (unknownName === "___") {
      return {
        badge: "FILL IN ___ BLANKS",
        lineNumber,
        whatHappened:
          "You left a Guided Scaffolding `___` blank placeholder in your Python code.",
        howToFix:
          "Replace `___` on that line with your real Python variable, condition, or return expression.",
      };
    }
    return {
      badge: `UNKNOWN NAME '${unknownName}'`,
      lineNumber,
      whatHappened: `Python doesn't recognize '${unknownName}' as a variable or function.`,
      howToFix:
        unknownName === "true" || unknownName === "false"
          ? "In Python, booleans must start with a capital letter: write True or False."
          : `Check the spelling of '${unknownName}', or wrap it in quotes ("${unknownName}") if you meant it as text!`,
    };
  }

  if (rawOutput.includes("TypeError")) {
    return {
      badge: "DATA TYPE MISMATCH",
      lineNumber,
      whatHappened:
        "You combined two incompatible data types (like adding text to a number) or passed the wrong number of arguments.",
      howToFix:
        "Make sure numbers aren't wrapped in quotes when doing math, and check that functions like len() or round() receive the right inputs.",
    };
  }

  if (rawOutput.includes("ValueError")) {
    return {
      badge: "VALUE CONVERSION CHECK",
      lineNumber,
      whatHappened:
        "A function received the right type, but an invalid value (like `int('N/A')` or unpacking the wrong number of items).",
      howToFix:
        "Guard unsafe conversions with `try / except ValueError:`, or check how many items are returned before unpacking.",
    };
  }

  if (rawOutput.includes("KeyError")) {
    return {
      badge: "MISSING DICTIONARY KEY",
      lineNumber,
      whatHappened:
        "Your code looked up a key in a dictionary using [ ], but that key wasn't found.",
      howToFix:
        "Use dict.get(key, default) so Python returns a safe fallback value when a key is missing!",
    };
  }

  if (rawOutput.includes("IndexError")) {
    return {
      badge: "INDEX OUT OF RANGE",
      lineNumber,
      whatHappened:
        "Your code tried to read an index position past the end of the list.",
      howToFix:
        "Remember that Python lists start counting at index 0 (a 3-item list only has indices 0, 1, and 2).",
    };
  }

  if (rawOutput.includes("AttributeError")) {
    return {
      badge: "METHOD NAME CHECK",
      lineNumber,
      whatHappened:
        "That dot-method doesn't exist on this type of value.",
      howToFix:
        "Double-check the spelling (e.g., .startswith() has an 's' in the middle, and .join() is called on the separator string like \"-\".join(words)).",
    };
  }

  if (rawOutput.includes("ZeroDivisionError")) {
    return {
      badge: "DIVISION BY ZERO",
      lineNumber,
      whatHappened:
        "Your code divided a number by 0, which isn't allowed in math!",
      howToFix:
        "Wrap the division inside a 'try: ... except ZeroDivisionError:' block or check if the denominator is 0 first.",
    };
  }

  if (rawOutput.includes("RecursionError")) {
    return {
      badge: "INFINITE RECURSION",
      lineNumber,
      whatHappened:
        "Your recursive function kept calling itself without reaching a stopping base case.",
      howToFix:
        "Add a base-case `if ...: return ...` at the top and ensure every recursive call shrinks the problem toward it.",
    };
  }

  if (rawOutput.includes("✕ Output mismatch")) {
    return {
      badge: "ALMOST THERE · OUTPUT CHECK",
      lineNumber: null,
      whatHappened:
        "Your code ran without errors, but the printed result didn't match the expected output yet.",
      howToFix:
        "Compare your output below with the Expected Output—check exact spelling, capitalization, and make sure your function returns the result!",
    };
  }

  return null;
}

/**
 * Extracts a compact 1-line mobile coding goal summary (function signature,
 * target output preview, and concise assignment text) for the mobile Code pane.
 */
export function buildMobileGoalSummary(
  lesson: {
    title?: string;
    description?: string;
    assignment?: string;
    initial_code?: string;
    expected_output?: string;
    examples?: { input: string; output: string }[];
    practiceChallenges?: {
      title?: string;
      assignment?: string;
      initial_code?: string;
      expected_output?: string;
      examples?: { input: string; output: string }[];
    }[];
  } | null,
  activeChallengeIdx: number = 0,
): MobileGoalSummary | null {
  if (!lesson) return null;
  const activeStage =
    activeChallengeIdx > 0 && lesson.practiceChallenges?.[activeChallengeIdx - 1]
      ? lesson.practiceChallenges[activeChallengeIdx - 1]
      : lesson;

  const rawCode = (activeStage.initial_code || "").replace(/\\n/g, "\n");
  const defMatch = rawCode.match(/def\s+([a-zA-Z_]\w*\s*\([^)]*\))/);
  const rawSig = defMatch
    ? defMatch[1].replace(/\bself\s*,\s*/, "").replace(/\s+/g, " ").trim()
    : activeStage.title || lesson.title || "Solve challenge";

  const rawTarget = (
    activeStage.examples?.[0]?.output ||
    activeStage.expected_output ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
  const targetOutput =
    rawTarget.length > 36 ? `${rawTarget.slice(0, 35)}…` : rawTarget;

  const assignment = (
    activeStage.assignment ||
    lesson.assignment ||
    lesson.description ||
    ""
  )
    .replace(/`/g, "")
    .trim();

  return {
    signature: rawSig,
    targetOutput,
    assignment,
  };
}
