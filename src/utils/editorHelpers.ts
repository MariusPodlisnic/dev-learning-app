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

/**
 * Produces an actionable conceptual debugging hint for a failed test assertion.
 */
export function diagnoseFailedTest(
  test: { input?: string; expected: string; actual: string },
  code: string = "",
): FailedTestDiagnosis | null {
  const expected = (test.expected ?? "").trim();
  const actual = (test.actual ?? "").trim();
  const input = (test.input ?? "").trim();

  if (actual === "None") {
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
