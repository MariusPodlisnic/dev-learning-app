import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  DETECTIVE_CASES,
  buildDetectiveSession,
  computeDetectiveXp,
} = loadTsModule("src/utils/outputDetective.ts");

test("outputDetective catalog has 18 unique cases across 3 tracks and every snippet matches real Python3 output", () => {
  assert.equal(DETECTIVE_CASES.length, 18);

  const ids = new Set();
  const tracks = { python_basics: 0, algorithms: 0, system_design: 0 };

  for (const item of DETECTIVE_CASES) {
    assert.ok(!ids.has(item.id), `Duplicate case id: ${item.id}`);
    ids.add(item.id);
    tracks[item.track] += 1;

    assert.equal(item.options.length, 4, `Case ${item.id} must have 4 options`);
    assert.equal(
      new Set(item.options).size,
      4,
      `Case ${item.id} must have 4 unique options`,
    );
    assert.ok(item.traceSteps.length >= 2, `Case ${item.id} must have >= 2 trace steps`);

    // Execute every snippet in real python3 to guarantee 100% factual accuracy!
    const actualStdout = execFileSync("python3", ["-c", item.code], {
      encoding: "utf8",
      timeout: 3000,
    }).trim();
    const expected = item.options[item.correctIndex];
    assert.equal(
      actualStdout,
      expected,
      `Case ${item.id} (${item.title}): python3 printed "${actualStdout}" but expected option "${expected}"`,
    );
  }

  assert.equal(tracks.python_basics, 6);
  assert.equal(tracks.algorithms, 6);
  assert.equal(tracks.system_design, 6);
});

test("outputDetective builds deterministic sessions with Pro gating and computes XP rewards accurately", () => {
  const freeSession = buildDetectiveSession({
    track: "all",
    isPremium: false,
    count: 6,
    seed: 42,
  });
  assert.equal(freeSession.cases.length, 6);
  assert.ok(freeSession.lockedCount > 0);
  assert.ok(freeSession.cases.every((c) => !c.isPro));

  const proSession = buildDetectiveSession({
    track: "all",
    isPremium: true,
    count: 6,
    seed: 42,
  });
  assert.equal(proSession.cases.length, 6);
  assert.equal(proSession.lockedCount, 0);

  // Deterministic ordering for same seed
  const repeatSession = buildDetectiveSession({
    track: "all",
    isPremium: false,
    count: 6,
    seed: 42,
  });
  assert.deepEqual(
    freeSession.cases.map((c) => c.id),
    repeatSession.cases.map((c) => c.id),
  );

  // XP calculations
  assert.equal(computeDetectiveXp({ correctCount: 0, totalCount: 6, maxStreak: 0 }), 0);
  assert.equal(computeDetectiveXp({ correctCount: 4, totalCount: 6, maxStreak: 3 }), 49);
  assert.equal(computeDetectiveXp({ correctCount: 6, totalCount: 6, maxStreak: 6 }), 93);
});
