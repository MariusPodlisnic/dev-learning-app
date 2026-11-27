import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  calculateInterviewXpReward,
  estimateInterviewComplexity,
  formatInterviewClock,
  gradeMockInterviewSession,
  MOCK_INTERVIEW_LOOPS,
  readMockInterviewRecords,
  saveMockInterviewRecord,
} = loadTsModule("src/utils/mockInterview.ts");

function runJsonSuiteInPython(code, harness) {
  const fullScript = `${code}\n${harness.trim()}\n`;
  const runner = `
import ast, sys
src = sys.stdin.read()
tree = ast.parse(src)
last_expr = tree.body.pop()
ns = {}
exec(compile(tree, "<suite>", "exec"), ns)
val = eval(compile(ast.Expression(last_expr.value), "<expr>", "eval"), ns)
print("__DEVY_JSON__" + val)
`;
  const stdout = execFileSync("python3", ["-c", runner], {
    input: fullScript,
    encoding: "utf8",
    timeout: 6000,
  });
  const markerLine = stdout
    .split("\n")
    .find((l) => l.startsWith("__DEVY_JSON__"));
  assert.ok(markerLine, `Missing __DEVY_JSON__ output in:\n${stdout}`);
  return JSON.parse(markerLine.slice("__DEVY_JSON__".length));
}

test("all 4 Mock Interview Loops (8 rounds) fail on starter stubs and pass all 5 cases on reference solutions", () => {
  assert.equal(MOCK_INTERVIEW_LOOPS.length, 4);
  assert.equal(MOCK_INTERVIEW_LOOPS[0].isPro, false);
  assert.equal(MOCK_INTERVIEW_LOOPS[1].isPro, true);
  assert.equal(MOCK_INTERVIEW_LOOPS[2].isPro, true);
  assert.equal(MOCK_INTERVIEW_LOOPS[3].isPro, true);

  for (const loop of MOCK_INTERVIEW_LOOPS) {
    assert.equal(loop.rounds.length, 2);
    for (const round of loop.rounds) {
      const stubRes = runJsonSuiteInPython(
        round.starterCode,
        round.verificationHarness,
      );
      assert.equal(
        stubRes.all_passed,
        false,
        `Starter stub for ${round.id} should fail suite`,
      );
      assert.equal(stubRes.results.length, 5);

      const refRes = runJsonSuiteInPython(
        round.referenceSolution,
        round.verificationHarness,
      );
      assert.equal(
        refRes.all_passed,
        true,
        `Reference solution for ${round.id} failed: ${JSON.stringify(refRes.results)}`,
      );
      assert.equal(refRes.results.length, 5);

      const est = estimateInterviewComplexity(round.referenceSolution);
      assert.equal(
        est,
        round.targetComplexity,
        `Expected ${round.id} reference complexity ${round.targetComplexity}, got ${est}`,
      );
    }
  }
});

test("gradeMockInterviewSession computes 100-pt Hiring Scorecard, nudges penalty, complexity penalty, and persists records", () => {
  assert.equal(formatInterviewClock(1500), "25:00");
  assert.equal(formatInterviewClock(65), "01:05");

  const loop = MOCK_INTERVIEW_LOOPS[1]; // SWE Product Loop
  const fivePassed = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    input: `case-${i}`,
    expected: "True",
    actual: "True",
    passed: true,
  }));

  // 1. Optimal Strong Hire (both rounds optimal, 0 nudges, >= 5m remaining)
  const strongCard = gradeMockInterviewSession(
    loop,
    [
      {
        code: loop.rounds[0].referenceSolution,
        results: fivePassed,
        allPassed: true,
        usedNudge: false,
      },
      {
        code: loop.rounds[1].referenceSolution,
        results: fivePassed,
        allPassed: true,
        usedNudge: false,
      },
    ],
    600,
  );
  assert.equal(strongCard.totalScore, 100);
  assert.equal(strongCard.verdict, "strong_hire");
  assert.equal(calculateInterviewXpReward(loop, strongCard), loop.baseXp);

  // 2. Quadratic O(n^2) + both nudges used drops score into Hire tier
  const quadraticCode = `def slow(arr):\n    for i in range(len(arr)):\n        for j in range(len(arr)):\n            pass`;
  const hireCard = gradeMockInterviewSession(
    loop,
    [
      {
        code: quadraticCode,
        results: fivePassed,
        allPassed: true,
        usedNudge: true,
      },
      {
        code: loop.rounds[1].referenceSolution,
        results: fivePassed,
        allPassed: true,
        usedNudge: true,
      },
    ],
    320,
  );
  assert.equal(hireCard.roundReports[0].estimatedComplexity, "O(n²)");
  assert.equal(hireCard.verdict, "hire");
  assert.ok(hireCard.totalScore >= 72 && hireCard.totalScore < 88);

  // 3. Persist records keeps highest score and best verdict
  saveMockInterviewRecord(loop.id, hireCard);
  saveMockInterviewRecord(loop.id, strongCard);
  const stored = readMockInterviewRecords()[loop.id];
  assert.equal(stored.bestVerdict, "strong_hire");
  assert.equal(stored.bestScore, 100);
  assert.equal(stored.attempts, 2);
});
