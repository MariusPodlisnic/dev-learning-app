import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const { executeLessonVerification, executePlaygroundPython } = loadTsModule(
  "src/utils/pyodideRunner.ts",
);

function createPython3MockPyodide() {
  let stdoutHandler = null;
  return {
    setStdout({ batched }) {
      stdoutHandler = batched;
    },
    async runPythonAsync(code) {
      const proc = spawnSync(
        "/usr/bin/python3",
        [
          "-c",
          `
import io, json, sys
from contextlib import redirect_stdout
src = sys.stdin.read()
buf = io.StringIO()
ns = {}
exec(compile(src, "<student>", "exec"), ns, ns)
ret = ns["__run_tests__"]() if "__run_tests__" in ns and callable(ns["__run_tests__"]) else None
print(json.dumps({"stdout": buf.getvalue(), "ret": ret}))
`,
        ],
        { input: code, encoding: "utf8" },
      );
      if (proc.status !== 0) {
        throw new Error(proc.stderr || "Python execution error");
      }
      const { stdout, ret } = JSON.parse(proc.stdout);
      if (stdout && stdoutHandler) {
        for (const line of stdout.split("\n")) {
          if (line) stdoutHandler(line);
        }
      }
      return ret;
    },
  };
}

test("executeLessonVerification passes python_basics without requiring extra print() when unit tests pass", async () => {
  const pyodide = createPython3MockPyodide();
  const lesson = {
    id: "exp-py-01",
    track: "python_basics",
    expected_output: "('Aria', 150, True)",
    hidden_tests: `import json
def __run_tests__():
    r1 = create_hero_profile("Aria", 50)
    return json.dumps({
        "is_test_suite": True,
        "all_passed": r1 == ("Aria", 150, True),
        "results": [{"id": 1, "input": "'Aria', 50", "expected": "('Aria', 150, True)", "actual": str(r1), "passed": r1 == ("Aria", 150, True)}]
    })
__run_tests__()`,
  };

  const passOutcome = await executeLessonVerification(
    pyodide,
    `def create_hero_profile(name, bonus_hp):\n    return (name, 100 + bonus_hp, True)`,
    lesson,
  );
  assert.equal(passOutcome.allPassed, true);
  assert.equal(passOutcome.testResults?.length, 1);
  assert.equal(passOutcome.targetTab, "tests");

  const failOutcome = await executeLessonVerification(
    pyodide,
    `def create_hero_profile(name, bonus_hp):\n    pass`,
    lesson,
  );
  assert.equal(failOutcome.allPassed, false);
});

test("executePlaygroundPython formats syntax errors cleanly", async () => {
  const pyodide = createPython3MockPyodide();
  const out = await executePlaygroundPython(pyodide, "def broken(:");
  assert.match(out, /SYNTAX \/\/ TRACE/);
});
