import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  MINI_BUILD_PROJECTS,
  buildMiniBuildWidgetScript,
  markMiniBuildCompleted,
  parseMiniBuildWidgetOutput,
  readCompletedMiniBuilds,
  resetMiniBuildsForTesting,
} = loadTsModule("src/utils/miniBuilds.ts");

test("miniBuilds catalog has 3 tools whose solutions pass real Python3 widget drivers and verification harnesses", () => {
  assert.equal(MINI_BUILD_PROJECTS.length, 3);

  for (const project of MINI_BUILD_PROJECTS) {
    assert.ok(project.checklist.length >= 3);

    // 1. Run widget driver script in real python3 and parse JSON payload
    const widgetScript = buildMiniBuildWidgetScript(
      project.id,
      project.solutionCode,
      project.defaultInput,
    );
    const widgetStdout = execFileSync("python3", ["-c", widgetScript], {
      encoding: "utf8",
      timeout: 3000,
    });
    const parsed = parseMiniBuildWidgetOutput(widgetStdout);
    assert.ok(parsed, `Expected valid JSON widget payload for ${project.id}`);

    if (project.id === "password_meter") {
      assert.equal(parsed.score, 100);
      assert.equal(parsed.label, "STRONG");
      assert.deepEqual(parsed.tips, []);
    } else if (project.id === "url_shortener") {
      assert.equal(parsed.code.length, 6);
      assert.ok(parsed.short_url.startsWith("devy.sh/"));
      assert.ok(parsed.saved_chars > 10);
    } else if (project.id === "dice_rpg") {
      assert.equal(parsed.roll, 20);
      assert.equal(parsed.outcome, "CRIT");
      assert.equal(parsed.damage, 48);
    }

    // 2. Run full verification harness in real python3
    const verifyScript = `${project.solutionCode}\n${project.verificationHarness}\nfor label, fn, expected in __test_cases__:\n    got = fn()\n    assert got == expected, f"{label}: got {got!r}, expected {expected!r}"\nprint("ALL_OK")\n`;
    const verifyOut = execFileSync("python3", ["-c", verifyScript], {
      encoding: "utf8",
      timeout: 3000,
    }).trim();
    assert.equal(verifyOut, "ALL_OK", `Verification harness failed for ${project.id}`);
  }
});

test("miniBuilds persists shipped projects cleanly", () => {
  resetMiniBuildsForTesting();
  assert.deepEqual(readCompletedMiniBuilds(), {});

  const afterOne = markMiniBuildCompleted("password_meter");
  assert.equal(afterOne.password_meter, true);
  assert.equal(readCompletedMiniBuilds().password_meter, true);

  resetMiniBuildsForTesting();
  assert.deepEqual(readCompletedMiniBuilds(), {});
});
