import assert from "node:assert/strict";
import test from "node:test";
import {
  computeAssertionDiff,
  computePythonAutoEdit,
  computeSmartEnter,
  diagnoseFailedTest,
  extractErrorLineNumber,
  indentSelection,
  suggestQuickTestExpression,
  toggleLineComment,
  translatePythonError,
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

test("diagnoseFailedTest surfaces conceptual debugging hints for common failure modes", () => {
  const noneDiag = diagnoseFailedTest(
    { input: "solve(5)", expected: "10", actual: "None" },
    "def solve(x):\n    print(x * 2)",
  );
  assert.equal(noneDiag?.badge, "RETURNED NONE");
  assert.ok(noneDiag?.tip.includes("return"));

  const emptyDiag = diagnoseFailedTest({
    input: "nums=[]",
    expected: "0",
    actual: "",
  });
  assert.equal(emptyDiag?.badge, "EMPTY / ZERO EDGE CASE");

  const offByOneDiag = diagnoseFailedTest({
    input: "count(3)",
    expected: "4",
    actual: "3",
  });
  assert.equal(offByOneDiag?.badge, "OFF BY ONE");

  const containerDiag = diagnoseFailedTest({
    input: "items()",
    expected: "[1, 2]",
    actual: "(1, 2)",
  });
  assert.equal(containerDiag?.badge, "CONTAINER TYPE");

  const boolDiag = diagnoseFailedTest({
    input: "check(10)",
    expected: "True",
    actual: "False",
  });
  assert.equal(boolDiag?.badge, "BOUNDARY LOGIC");

  const inPlaceDiag = diagnoseFailedTest(
    { input: "sort_items([3, 1, 2])", expected: "[1, 2, 3]", actual: "None" },
    "def sort_items(items):\n    return items.sort()",
  );
  assert.equal(inPlaceDiag?.badge, "IN-PLACE METHOD RETURNS NONE");

  const earlyLoopReturnDiag = diagnoseFailedTest(
    { input: "sum_all([4, 6, 10])", expected: "20", actual: "4" },
    "def sum_all(nums):\n    total = 0\n    for n in nums:\n        total += n\n        return total",
  );
  assert.equal(earlyLoopReturnDiag?.badge, "EARLY RETURN IN LOOP");

  const typeMismatchDiag = diagnoseFailedTest({
    input: "calc(15)",
    expected: "150",
    actual: "'150'",
  });
  assert.equal(typeMismatchDiag?.badge, "STRING VS NUMBER TYPE");

  const whitespaceDiag = diagnoseFailedTest({
    input: "greet('Ada')",
    expected: "'Hello Ada'",
    actual: "'Hello Ada '",
  });
  assert.equal(whitespaceDiag?.badge, "EXTRA WHITESPACE");

  const casingDiag = diagnoseFailedTest({
    input: "status(200)",
    expected: "HEALTHY",
    actual: "healthy",
  });
  assert.equal(casingDiag?.badge, "LETTER CASING MISMATCH");
});

test("computePythonAutoEdit handles auto-pairs, selection wrapping, pair backspace, Tab, Smart Enter, and Cmd+/", () => {
  const pairRes = computePythonAutoEdit({
    code: "print",
    selectionStart: 5,
    selectionEnd: 5,
    key: "(",
  });
  assert.equal(pairRes?.code, "print()");
  assert.equal(pairRes?.selectionStart, 6);

  const wrapRes = computePythonAutoEdit({
    code: "hello",
    selectionStart: 0,
    selectionEnd: 5,
    key: '"',
  });
  assert.equal(wrapRes?.code, '"hello"');
  assert.equal(wrapRes?.selectionStart, 1);
  assert.equal(wrapRes?.selectionEnd, 6);

  const skipRes = computePythonAutoEdit({
    code: "print()",
    selectionStart: 6,
    selectionEnd: 6,
    key: ")",
  });
  assert.equal(skipRes?.code, "print()");
  assert.equal(skipRes?.selectionStart, 7);

  const bsRes = computePythonAutoEdit({
    code: "print()",
    selectionStart: 6,
    selectionEnd: 6,
    key: "Backspace",
  });
  assert.equal(bsRes?.code, "print");
  assert.equal(bsRes?.selectionStart, 5);

  const apostropheRes = computePythonAutoEdit({
    code: "don",
    selectionStart: 3,
    selectionEnd: 3,
    key: "'",
  });
  assert.equal(apostropheRes, null);

  const tabRes = computePythonAutoEdit({
    code: "x = 1",
    selectionStart: 0,
    selectionEnd: 0,
    key: "Tab",
  });
  assert.equal(tabRes?.code, "    x = 1");

  const commentRes = computePythonAutoEdit({
    code: "x = 1",
    selectionStart: 0,
    selectionEnd: 5,
    key: "/",
    metaOrCtrlKey: true,
  });
  assert.equal(commentRes?.code, "# x = 1");
});

test("translatePythonError and diagnoseFailedTest coach SQLite errors and extra Python tracebacks cleanly", () => {
  const bindHint = translatePythonError(
    'File "<exec>", line 3, in find_account_tier\nsqlite3.ProgrammingError: Incorrect number of bindings supplied. The current statement uses 1, and there are 13 supplied.',
    8,
  );
  assert.equal(bindHint?.badge, "SQL PARAMETER TUPLE");
  assert.equal(bindHint?.lineNumber, 3);
  assert.ok(bindHint?.howToFix.includes("(email,)"));

  const aggHint = translatePythonError(
    'sqlite3.OperationalError: misuse of aggregate: SUM()',
  );
  assert.equal(aggHint?.badge, "SQL WHERE VS HAVING");

  const colHint = translatePythonError(
    'sqlite3.OperationalError: no such column: user_handle',
  );
  assert.equal(colHint?.badge, "SQL UNKNOWN COLUMN");
  assert.ok(colHint?.whatHappened.includes("user_handle"));

  const synHint = translatePythonError(
    'sqlite3.OperationalError: near "GROUP": syntax error',
  );
  assert.equal(synHint?.badge, "SQL SYNTAX CHECK");
  assert.ok(synHint?.whatHappened.includes("GROUP"));

  const unboundHint = translatePythonError(
    "UnboundLocalError: local variable 'total' referenced before assignment",
  );
  assert.equal(unboundHint?.badge, "INITIALIZE 'total' FIRST");

  const recHint = translatePythonError(
    "RecursionError: maximum recursion depth exceeded",
  );
  assert.equal(recHint?.badge, "INFINITE RECURSION");

  const sqlTupleDiag = diagnoseFailedTest({
    input: "min_xp=300",
    expected: "['nova', 'aria']",
    actual: "[('nova',), ('aria',)]",
  });
  assert.equal(sqlTupleDiag?.badge, "UNPACK SQL TUPLE ROWS");
});
