import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  countEffectivePythonLines,
  estimatePythonRefactorComplexity,
  evaluateRefactorSubmission,
  REFACTOR_GOLF_HOLES,
  readRefactorGolfRecords,
  saveRefactorGolfRecord,
} = loadTsModule("src/utils/refactorGolf.ts");

function runPythonHarness(code, harness) {
  const fullScript = `${code}\n${harness}\n`;
  const stdout = execFileSync("python3", ["-c", fullScript], {
    encoding: "utf8",
    timeout: 5000,
  });
  const lines = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("TEST_RESULT|"));
  assert.ok(lines.length >= 3, `Expected >= 3 TEST_RESULT lines, got:\n${stdout}`);
  for (const line of lines) {
    assert.ok(
      line.endsWith("|True"),
      `Expected passing Python test line, got: ${line}`,
    );
  }
}

test("all 6 Refactor Golf holes pass Python 3 verification on both starter and optimal solutions", () => {
  assert.equal(REFACTOR_GOLF_HOLES.length, 6);
  const ids = new Set(REFACTOR_GOLF_HOLES.map((h) => h.id));
  assert.equal(ids.size, 6);

  for (const hole of REFACTOR_GOLF_HOLES) {
    runPythonHarness(hole.starterCode, hole.verificationHarness);
    runPythonHarness(hole.optimalCode, hole.verificationHarness);

    const starterEval = evaluateRefactorSubmission(hole.starterCode, hole);
    assert.equal(
      starterEval.estimatedComplexity,
      "O(n²)",
      `Expected slow starter for ${hole.id} to be O(n²), got ${starterEval.estimatedComplexity}`,
    );
    assert.equal(
      starterEval.medal,
      "par",
      `Expected slow starter for ${hole.id} to grade as par, got ${starterEval.medal}`,
    );

    const optimalEval = evaluateRefactorSubmission(hole.optimalCode, hole);
    assert.equal(
      optimalEval.meetsComplexityTarget,
      true,
      `Expected optimal solution for ${hole.id} to beat complexity target`,
    );
    assert.equal(
      optimalEval.meetsLinePar,
      true,
      `Expected optimal solution for ${hole.id} (${optimalEval.effectiveLines} lines) <= par ${hole.parLines}`,
    );
    assert.equal(optimalEval.medal, "eagle");
  }
});

test("refactorGolf line counter, complexity estimator, and record persistence work accurately", () => {
  assert.equal(
    countEffectivePythonLines("# comment\n\ndef f(x):\n    return x + 1\n"),
    2,
  );
  assert.equal(
    estimatePythonRefactorComplexity("def f(x):\n    return x * 2"),
    "O(1)",
  );

  saveRefactorGolfRecord("two_sum_golf", "par", 9, "O(n²)");
  saveRefactorGolfRecord("two_sum_golf", "eagle", 6, "O(n)");
  saveRefactorGolfRecord("two_sum_golf", "birdie", 8, "O(n)");

  const rec = readRefactorGolfRecords().two_sum_golf;
  assert.equal(rec.bestMedal, "eagle");
  assert.equal(rec.bestLines, 6);
  assert.equal(rec.bestComplexity, "O(n)");
});
