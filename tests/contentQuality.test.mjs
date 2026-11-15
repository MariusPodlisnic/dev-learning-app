import assert from "node:assert/strict";
import test from "node:test";
import {
  auditBlitzCards,
  auditBugHuntIncidents,
  auditVisualizerEngines,
  resolvePythonBinary,
} from "../scripts/contentAuditCore.mjs";

test("all Bug Hunt incidents have unique IDs, valid metadata, and fail unpatched harnesses in Python", () => {
  const result = auditBugHuntIncidents();
  assert.ok(result.counts.bugIncidents >= 25);
  assert.deepEqual(result.errors, [], `Bug Hunt errors:\n${result.errors.join("\n")}`);
});

test("all Speed Blitz cards have valid decks, blanks, and 4 unique options", () => {
  const result = auditBlitzCards();
  assert.ok(result.counts.blitzCards >= 48);
  assert.deepEqual(result.errors, [], `Blitz card errors:\n${result.errors.join("\n")}`);
});

test("all Visualizer trace engines generate multi-step state traces cleanly", () => {
  const result = auditVisualizerEngines();
  assert.ok(result.counts.visualizerEngines >= 8);
  assert.deepEqual(result.errors, [], `Visualizer errors:\n${result.errors.join("\n")}`);
});

test("resolvePythonBinary locates an executable python3 runtime", () => {
  const bin = resolvePythonBinary();
  assert.ok(typeof bin === "string" && bin.length > 0);
});
