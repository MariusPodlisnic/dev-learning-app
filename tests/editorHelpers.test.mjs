import assert from "node:assert/strict";
import test from "node:test";
import {
  computeAssertionDiff,
  computeSmartEnter,
  extractErrorLineNumber,
  indentSelection,
  suggestQuickTestExpression,
  toggleLineComment,
} from "../src/utils/editorHelpers.ts";

test("extractErrorLineNumber prefers student-code lines over hidden test lines", () => {
  const traceback = [
    'Traceback (most recent call last):',
    '  File "<exec>", line 42, in <module>',
    '  File "<exec>", line 4, in solve',
    'ZeroDivisionError: division by zero',
  ].join("\n");

  assert.equal(extractErrorLineNumber(traceback, 10), 4);
  assert.equal(extractErrorLineNumber("SyntaxError: invalid syntax (line 18)"), 18);
  assert.equal(extractErrorLineNumber("No line info here"), null);
});

test("toggleLineComment toggles single and multi-line selections cleanly", () => {
  const source = "def add(a, b):\n    return a + b";
  const commented = toggleLineComment(source, 0, source.length);
  assert.equal(commented.code, "# def add(a, b):\n#     return a + b");

  const uncommented = toggleLineComment(
    commented.code,
    commented.selectionStart,
    commented.selectionEnd,
  );
  assert.equal(uncommented.code, source);
});

test("indentSelection supports multi-line indent and outdent up to 4 spaces", () => {
  const source = "x = 1\ny = 2";
  const indented = indentSelection(source, 0, source.length, "indent");
  assert.equal(indented.code, "    x = 1\n    y = 2");

  const outdented = indentSelection(
    indented.code,
    indented.selectionStart,
    indented.selectionEnd,
    "outdent",
  );
  assert.equal(outdented.code, source);

  const singleIndent = indentSelection("hello", 2, 2, "indent");
  assert.equal(singleIndent.code, "he    llo");
  assert.equal(singleIndent.selectionStart, 6);
});

test("computeSmartEnter indents +4 spaces after ':' even with trailing inline comment", () => {
  const line = "    if x > 0:  # positive check";
  const result = computeSmartEnter(line, line.length, line.length);
  assert.equal(result.handled, true);
  assert.equal(result.code, line + "\n        ");

  const stringHash = 'msg = "a#b"';
  const nonColon = computeSmartEnter(stringHash, stringHash.length, stringHash.length);
  assert.equal(nonColon.handled, false);
});

test("computeAssertionDiff identifies whitespace, case, and char mismatch position", () => {
  const wsDiff = computeAssertionDiff("hello", "hello ");
  assert.equal(wsDiff.reason, "leading/trailing whitespace mismatch");

  const caseDiff = computeAssertionDiff("True", "true");
  assert.equal(caseDiff.reason, "case sensitivity mismatch");

  const valueDiff = computeAssertionDiff("[1, 2, 3]", "[1, 9, 3]");
  assert.equal(valueDiff.commonPrefix, "[1, ");
  assert.equal(valueDiff.expectedRest, "2, 3]");
  assert.equal(valueDiff.actualRest, "9, 3]");
  assert.equal(valueDiff.reason, "differs at char 5");
});

test("suggestQuickTestExpression builds a starter call from first function signature", () => {
  assert.equal(
    suggestQuickTestExpression("def two_sum(nums, target):\n    pass"),
    "print(two_sum([1, 2, 3], 3))",
  );
  assert.equal(suggestQuickTestExpression("x = 5"), 'print("hello")');
});
