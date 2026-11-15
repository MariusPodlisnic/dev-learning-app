import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const { getLessonEnrichment, mergeCurriculumLessons } = loadTsModule(
  "src/constants/curriculum.ts",
);
const { buildGuidedScaffoldPlan, findUnfilledScaffoldLines } = loadTsModule(
  "src/utils/scaffolding.ts",
);

test("buildGuidedScaffoldPlan produces fill-in-the-blank skeleton without leaking solution", () => {
  const lessons = mergeCurriculumLessons([]);
  const twoSumLesson = lessons.find((l) => l.track === "algorithms" && l.lesson_order === 1);
  assert.ok(twoSumLesson);
  const enrichment = getLessonEnrichment(twoSumLesson);
  assert.ok(enrichment?.solutionCode);

  const plan = buildGuidedScaffoldPlan(twoSumLesson, enrichment);
  assert.equal(plan.sourceKind, "structure");
  assert.ok(plan.scaffoldCode.includes("def twoSum(self, nums, target):"));
  assert.ok(plan.scaffoldCode.includes("___"));
  assert.notEqual(
    plan.scaffoldCode.trim(),
    enrichment.solutionCode.trim(),
    "scaffold should never return raw unmasked solutionCode",
  );
  assert.ok(plan.blankCount >= 2);
  assert.ok(plan.steps.length >= 1);
  assert.ok(plan.steps.every((s) => s.syntaxClue.length > 0));
});

test("buildGuidedScaffoldPlan supports practice drills cleanly without leaking core solutionCode", () => {
  const lessons = mergeCurriculumLessons([]);
  const lessonWithDrills = lessons.find(
    (l) => Array.isArray(l.practiceChallenges) && l.practiceChallenges.length > 0,
  );
  assert.ok(lessonWithDrills);
  const drill = lessonWithDrills.practiceChallenges[0];
  const enrichment = getLessonEnrichment(lessonWithDrills);

  const plan = buildGuidedScaffoldPlan(lessonWithDrills, enrichment, drill);
  assert.equal(plan.sourceKind, "constraints");
  assert.ok(plan.scaffoldCode.includes("# TODO 01:"));
  assert.ok(plan.scaffoldCode.includes("___"));
  assert.equal(
    findUnfilledScaffoldLines(plan.scaffoldCode).length >= 1,
    true,
  );
});

test("findUnfilledScaffoldLines detects bare ___ placeholders and ignores strings/comments", () => {
  const sample = [
    "def solve(x):",
    "    # Keep ___ inside comments safe",
    '    label = "___"',
    "    total = ___",
    "    return ___",
  ].join("\n");

  assert.deepEqual(findUnfilledScaffoldLines(sample), [4, 5]);
});
