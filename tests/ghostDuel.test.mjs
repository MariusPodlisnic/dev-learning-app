import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  computeGhostPaceSnapshot,
  decodeGhostDuelToken,
  encodeGhostDuelToken,
  evaluateGhostDuelVerdict,
  seedStringToInt,
} = loadTsModule("src/utils/ghostDuel.ts");

test("ghostDuel encodes and decodes URL-safe tokens across all 3 modes and rejects malformed input", () => {
  const modes = ["blitz", "detective", "bughunt"];
  for (const mode of modes) {
    const token = encodeGhostDuelToken({
      v: 1,
      mode,
      challenger: "Nova_Dev!!",
      seed: `seed-${mode}-42`,
      targetScore: 11,
      targetTimeSec: 45,
      track: "python_basics",
    });
    assert.ok(!/[+/=]/.test(token), "Ghost Duel token must be strictly URL-safe base64url");

    const decoded = decodeGhostDuelToken(token);
    assert.ok(decoded);
    assert.equal(decoded.mode, mode);
    assert.equal(decoded.challenger, "Nova_Dev");
    assert.equal(decoded.seed, `seed-${mode}-42`);
    assert.equal(decoded.targetScore, 11);
    assert.equal(decoded.targetTimeSec, 45);
    assert.equal(decoded.track, "python_basics");
  }

  assert.equal(decodeGhostDuelToken(""), null);
  assert.equal(decodeGhostDuelToken("not-valid-base64!!!"), null);
  assert.equal(decodeGhostDuelToken(null), null);

  assert.equal(seedStringToInt("det-42"), seedStringToInt("det-42"));
  assert.notEqual(seedStringToInt("det-42"), seedStringToInt("det-43"));
});

test("ghostDuel computes live pace deltas and head-to-head verdicts cleanly", () => {
  const blitzDuel = {
    v: 1,
    mode: "blitz",
    challenger: "Marius",
    seed: "2026-11-26:python_basics",
    targetScore: 10,
    targetTimeSec: 60,
  };

  const ahead = computeGhostPaceSnapshot({
    challenge: blitzDuel,
    playerScore: 7,
    progressRatio: 0.5,
  });
  assert.equal(ahead.ghostExpectedScore, 5);
  assert.equal(ahead.status, "ahead");
  assert.ok(ahead.statusLabel.includes("+2 AHEAD"));

  const behind = computeGhostPaceSnapshot({
    challenge: blitzDuel,
    playerScore: 3,
    progressRatio: 0.5,
  });
  assert.equal(behind.status, "behind");
  assert.ok(behind.statusLabel.includes("2 BEHIND"));

  assert.equal(
    evaluateGhostDuelVerdict({
      challenge: blitzDuel,
      playerScore: 12,
      playerTimeSec: 60,
    }).outcome,
    "victory",
  );
  assert.equal(
    evaluateGhostDuelVerdict({
      challenge: blitzDuel,
      playerScore: 10,
      playerTimeSec: 60,
    }).outcome,
    "draw",
  );
  assert.equal(
    evaluateGhostDuelVerdict({
      challenge: blitzDuel,
      playerScore: 8,
      playerTimeSec: 60,
    }).outcome,
    "defeat",
  );

  // Bug Hunt compares solve speed (lower elapsed seconds wins!)
  const bugDuel = {
    v: 1,
    mode: "bughunt",
    challenger: "Ada",
    seed: "bug-py-01",
    targetScore: 35,
    targetTimeSec: 25,
  };
  assert.equal(
    evaluateGhostDuelVerdict({
      challenge: bugDuel,
      playerScore: 42,
      playerTimeSec: 18,
    }).outcome,
    "victory",
  );
  assert.equal(
    evaluateGhostDuelVerdict({
      challenge: bugDuel,
      playerScore: 20,
      playerTimeSec: 38,
    }).outcome,
    "defeat",
  );
});
