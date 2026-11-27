import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const { getLessonEnrichment, mergeCurriculumLessons } = loadTsModule(
  "src/constants/curriculum.ts",
);
const { buildConceptTinkerSpec, parseParameterAssignments } = loadTsModule(
  "src/utils/conceptTinkerXray.ts",
);

test("parseParameterAssignments splits top-level parameter assignments without breaking arrays or strings", () => {
  assert.deepEqual(
    parseParameterAssignments('pet_name="Byte", bonus=150'),
    [
      { name: "pet_name", value: '"Byte"' },
      { name: "bonus", value: "150" },
    ],
  );
  assert.deepEqual(
    parseParameterAssignments("nums = [2, 7, 11, 15], target = 9"),
    [
      { name: "nums", value: "[2, 7, 11, 15]" },
      { name: "target", value: "9" },
    ],
  );
});

test("buildConceptTinkerSpec generates live scenarios, branch line traces, and X-Ray tokens for all 105 modules with zero spoilers", () => {
  const allLessons = mergeCurriculumLessons([]);
  assert.equal(allLessons.length, 105);

  for (const lesson of allLessons) {
    const enrichment = getLessonEnrichment(lesson);
    const spec = buildConceptTinkerSpec(lesson, enrichment);

    assert.ok(spec.codeLines.length >= 1, `${lesson.id}: missing codeLines`);
    assert.equal(
      spec.scenarios.length,
      3,
      `${lesson.id}: expected 3 live tinker scenarios`,
    );
    assert.ok(
      spec.xrayTokens.length >= 1 && spec.xrayTokens.length <= 5,
      `${lesson.id}: expected 1..5 X-Ray tokens`,
    );

    for (const sc of spec.scenarios) {
      assert.ok(sc.label.trim().length > 0);
      assert.ok(sc.inputDisplay.trim().length > 0);
      assert.ok(sc.outputDisplay.trim().length > 0);
      assert.ok(sc.traceNote.trim().length > 0);
      assert.ok(sc.executedLineIndices.length >= 1);
      for (const lineIdx of sc.executedLineIndices) {
        assert.ok(
          lineIdx >= 0 && lineIdx < spec.codeLines.length,
          `${lesson.id}: out-of-bounds executedLineIndex ${lineIdx}`,
        );
      }
    }

    const fnMatch = (lesson.initial_code || "").match(/def\s+([A-Za-z0-9_]+)/);
    const fnName = fnMatch ? fnMatch[1] : "";
    if (fnName && fnName !== "__init__") {
      assert.equal(
        spec.codeLines.join("\n").includes(`def ${fnName}`),
        false,
        `${lesson.id}: tinker box spoiled target function ${fnName}`,
      );
    }
  }

  // Conditionals lesson highlights distinct executed branch lines across scenarios
  const condLesson = allLessons.find((l) => l.id === "exp-py-03");
  assert.ok(condLesson);
  const condSpec = buildConceptTinkerSpec(
    condLesson,
    getLessonEnrichment(condLesson),
  );
  assert.notDeepEqual(
    condSpec.scenarios[0].executedLineIndices,
    condSpec.scenarios[1].executedLineIndices,
  );
  assert.notDeepEqual(
    condSpec.scenarios[1].executedLineIndices,
    condSpec.scenarios[2].executedLineIndices,
  );
});
