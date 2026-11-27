import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const { mergeCurriculumLessons } = loadTsModule("src/constants/curriculum.ts");
const { getSystemDesignLabForLesson } = loadTsModule(
  "src/utils/systemDesignLabs.ts",
);

test("every system_design core module resolves to an interactive lab whose recommendedPreset hits SLA HEALTHY", () => {
  const lessons = mergeCurriculumLessons([]);
  const sysCoreLessons = lessons.filter(
    (l) => l.track === "system_design" && l.lesson_order <= 28,
  );
  assert.equal(sysCoreLessons.length, 28);

  const archetypesSeen = new Set();
  for (const lesson of sysCoreLessons) {
    const spec = getSystemDesignLabForLesson(lesson);
    archetypesSeen.add(spec.archetype);
    assert.ok(spec.params.length >= 3, `${lesson.id} should expose >= 3 params`);

    const defaultValues = Object.fromEntries(
      spec.params.map((p) => [p.key, p.defaultValue]),
    );
    const defaultSim = spec.simulate(defaultValues);
    assert.ok(defaultSim.metrics.length >= 2);
    assert.ok(defaultSim.slaChecks.length >= 2);

    const optimalSim = spec.simulate(spec.recommendedPreset);
    assert.equal(
      optimalSim.allSlaPassed,
      true,
      `${lesson.id} (${spec.archetype}) recommendedPreset should pass all SLA checks`,
    );
    assert.equal(
      optimalSim.health,
      "HEALTHY",
      `${lesson.id} (${spec.archetype}) recommendedPreset should be HEALTHY`,
    );
  }

  assert.equal(archetypesSeen.size, 6);
});
