import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const { parseMiniBuildWidgetOutput } = loadTsModule("src/utils/miniBuilds.ts");
const {
  buildBlueprintWidgetScript,
  isBlueprintFullyShipped,
  markBlueprintStageCompleted,
  readBlueprintProgress,
  TOOL_BLUEPRINT_PROJECTS,
} = loadTsModule("src/utils/toolBlueprints.ts");

test("all 3 multi-step Build-a-Tool Blueprints pass real Python 3 widget drivers and harnesses across all 9 stages", () => {
  assert.equal(TOOL_BLUEPRINT_PROJECTS.length, 3);

  for (const bp of TOOL_BLUEPRINT_PROJECTS) {
    assert.equal(bp.stages.length, 3);

    for (const stage of bp.stages) {
      // 1. Live widget driver produces valid JSON payload in real Python 3
      const widgetScript = buildBlueprintWidgetScript(
        bp,
        stage.stageNumber,
        stage.solutionCode,
        bp.defaultInput,
      );
      const widgetOut = execFileSync("python3", ["-c", widgetScript], {
        encoding: "utf8",
        timeout: 4000,
      });
      const parsed = parseMiniBuildWidgetOutput(widgetOut);
      assert.ok(
        parsed && typeof parsed === "object",
        `Expected valid JSON widget payload for ${bp.id} stage ${stage.stageNumber}`,
      );

      // 2. Stage verification harness passes 100% in real Python 3
      const verifyScript = `${stage.solutionCode}\n${stage.verificationHarness}\nfor label, fn, expected in __test_cases__:\n    got = fn()\n    assert got == expected, f"{label}: got {got!r}, expected {expected!r}"\nprint("STAGE_OK")\n`;
      const verifyOut = execFileSync("python3", ["-c", verifyScript], {
        encoding: "utf8",
        timeout: 4000,
      }).trim();
      assert.equal(
        verifyOut,
        "STAGE_OK",
        `Expected verification pass for ${bp.id} stage ${stage.stageNumber}`,
      );
    }
  }
});

test("toolBlueprints tracks progressive stage completion and detects full 3/3 ship status", () => {
  markBlueprintStageCompleted("autocomplete_trie", 1);
  assert.equal(
    isBlueprintFullyShipped("autocomplete_trie", readBlueprintProgress()),
    false,
  );
  markBlueprintStageCompleted("autocomplete_trie", 2);
  markBlueprintStageCompleted("autocomplete_trie", 3);
  const progress = readBlueprintProgress();
  assert.deepEqual(progress.autocomplete_trie, [1, 2, 3]);
  assert.equal(isBlueprintFullyShipped("autocomplete_trie", progress), true);
});
