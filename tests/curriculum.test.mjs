import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { resolvePythonBinary } from "../scripts/contentAuditCore.mjs";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  LESSON_ENRICHMENTS,
  mergeCurriculumLessons,
  minimizeStarterCode,
} = loadTsModule("src/constants/curriculum.ts");

const { PYTHON_BASICS_PRACTICE_DRILLS } = loadTsModule(
  "src/constants/curriculumData/pythonBasicsPracticeDrills.ts",
);
const { ALGORITHMS_PRACTICE_DRILLS } = loadTsModule(
  "src/constants/curriculumData/algorithmsPracticeDrills.ts",
);
const { SYSTEM_DESIGN_PRACTICE_DRILLS } = loadTsModule(
  "src/constants/curriculumData/systemDesignPracticeDrills.ts",
);

const { getCurriculumLessonSortKey } = loadTsModule(
  "src/constants/certificates.ts",
);

function runPythonBatchedChecks(items) {
  const pyRunner = `
import io, json, sys, traceback
from contextlib import redirect_stdout

payload = json.loads(sys.stdin.read())
out = []
for entry in payload:
    code = entry["code"]
    buf = io.StringIO()
    ns = {}
    parsed = None
    err = None
    try:
        with redirect_stdout(buf):
            exec(compile(code, entry["id"], "exec"), ns, ns)
            if "__run_tests__" in ns and callable(ns["__run_tests__"]):
                ret = ns["__run_tests__"]()
                if isinstance(ret, str):
                    try:
                        parsed = json.loads(ret)
                    except Exception:
                        pass
        if parsed is None:
            lines = [ln.strip() for ln in buf.getvalue().splitlines() if ln.strip()]
            if lines and '"is_test_suite"' in lines[-1]:
                parsed = json.loads(lines[-1])
    except Exception as e:
        err = f"{type(e).__name__}: {e}"
    out.append({"id": entry["id"], "parsed": parsed, "err": err, "stdout": buf.getvalue()})
print(json.dumps(out))
`;
  const proc = spawnSync(resolvePythonBinary(), ["-c", pyRunner], {
    input: JSON.stringify(items),
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  assert.equal(
    proc.status,
    0,
    `Python test runner crashed: ${proc.stderr || proc.error}`,
  );
  return JSON.parse(proc.stdout);
}

test("minimizeStarterCode reduces boilerplate to pure class/def signatures + pass", () => {
  assert.equal(
    minimizeStarterCode(
      `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]: # TODO\n        seen = {}\n        return []`,
    ),
    `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass`,
  );

  assert.equal(
    minimizeStarterCode(
      `class Solution:\n  def isValid(self, s):\n    stack = []\n    return True`,
    ),
    `class Solution:\n    def isValid(self, s):\n        pass`,
  );

  assert.equal(
    minimizeStarterCode(
      `def multi(\n    a,\n    b=1,\n):\n    return a + b\n\nprint(multi(1))`,
    ),
    `def multi( a, b=1, ):\n    pass`,
  );

  assert.equal(
    minimizeStarterCode(
      `def first(x):\n    return x\n\ndef second(y):\n    # hint\n    return y * 2`,
    ),
    `def first(x):\n    pass\n\ndef second(y):\n    pass`,
  );
});

test("mergeCurriculumLessons deduplicates, patches, upgrades, attaches drills, and sorts", () => {
  const dbRows = [
    {
      id: "ff06e344-6648-49a3-80a6-22b34f2faee3",
      track: "python_basics",
      lesson_order: 1,
      title: "Orphaned Duplicate",
      is_free: true,
      initial_code: "print('bad')",
    },
    {
      id: "db-alg-1",
      track: "algorithms",
      lesson_order: 1,
      title: "Two Sum",
      is_free: true,
      initial_code: "class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        return []",
    },
    {
      id: "db-alg-1-dup",
      track: "algorithms",
      lesson_order: 1,
      title: "Two Sum Duplicate",
      is_free: true,
      initial_code: "def noop(): pass",
    },
    {
      id: "db-alg-2",
      track: "algorithms",
      lesson_order: 2,
      title: "Valid Anagram",
      is_free: false,
      initial_code: "def is_anagram(s, t):\n    # todo\n    return False\n\nprint(is_anagram('a','a'))",
    },
    {
      id: "db-custom-99",
      track: "algorithms",
      lesson_order: 99,
      title: "Custom Unmatched Module",
      is_free: false,
      initial_code: "def custom_fn(x):\n    # todo\n    return x * 2\n\nprint(custom_fn(2))",
    },
    {
      id: "db-py-1",
      track: "python_basics",
      lesson_order: 1,
      title: "Old DB Py 1",
      is_free: true,
      initial_code: "x = 1\nprint(x)",
    },
  ];

  const merged = mergeCurriculumLessons(dbRows);
  assert.equal(
    merged.some((l) => l.id === "ff06e344-6648-49a3-80a6-22b34f2faee3"),
    false,
    "Orphaned duplicate should be excluded",
  );
  assert.equal(
    merged.some((l) => l.id === "db-alg-1-dup"),
    false,
    "Duplicate track:order should be excluded",
  );

  const alg1 = merged.find((l) => l.id === "db-alg-1");
  assert.ok(alg1);
  assert.equal(
    alg1.initial_code,
    "class Solution:\n    def twoSum(self, nums, target):\n        pass",
  );
  assert.ok(alg1.practiceChallenges?.length > 0);

  const alg2 = merged.find((l) => l.id === "db-alg-2");
  assert.ok(alg2);
  assert.equal(
    alg2.initial_code,
    "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass",
  );

  const custom99 = merged.find((l) => l.id === "db-custom-99");
  assert.ok(custom99);
  assert.equal(custom99.initial_code, "def custom_fn(x):\n    pass");

  const py1 = merged.find((l) => l.id === "db-py-1");
  assert.ok(py1);
  assert.equal(py1.slug, "python_basics:1");
  assert.equal(py1.initial_code, "def create_hero_profile(name, bonus_hp):\n    pass");
  assert.ok(py1.practiceChallenges?.length > 0);

  const pyRecap1 = merged.find((l) => l.id === "py-recap-ch1");
  assert.ok(pyRecap1);
  assert.equal(pyRecap1.practiceChallenges, undefined);

  const pyOnly = merged.filter((l) => l.track === "python_basics");
  for (let i = 1; i < pyOnly.length; i++) {
    assert.ok(
      getCurriculumLessonSortKey("python_basics", pyOnly[i - 1]) <=
        getCurriculumLessonSortKey("python_basics", pyOnly[i]),
    );
  }
});

test("all local lessons, drills, and recaps have unique IDs, minimal starter stubs, and valid Python hidden_tests", () => {
  const merged = mergeCurriculumLessons([]);
  const seenIds = new Set();
  const pythonPayloads = [];

  for (const lesson of merged) {
    assert.ok(lesson.id, "Lesson must have id");
    assert.equal(seenIds.has(lesson.id), false, `Duplicate lesson id: ${lesson.id}`);
    seenIds.add(lesson.id);

    assert.ok(lesson.title?.trim(), `${lesson.id} missing title`);
    assert.ok(lesson.assignment?.trim(), `${lesson.id} missing assignment`);
    assert.ok(lesson.hidden_tests?.trim(), `${lesson.id} missing hidden_tests`);
    assert.ok(lesson.initial_code?.trim(), `${lesson.id} missing initial_code`);

    for (const line of lesson.initial_code.split("\n")) {
      const t = line.trim();
      assert.ok(
        t === "" || t.startsWith("def ") || t.startsWith("class ") || t === "pass",
        `${lesson.id} initial_code has extra line: ${line}`,
      );
    }

    pythonPayloads.push({
      id: lesson.id,
      code: `${lesson.initial_code}\n${lesson.hidden_tests}`,
    });

    for (const drill of lesson.practiceChallenges || []) {
      assert.ok(drill.id, `${lesson.id} drill missing id`);
      assert.equal(seenIds.has(drill.id), false, `Duplicate drill id: ${drill.id}`);
      seenIds.add(drill.id);
      assert.ok(drill.hidden_tests?.trim(), `${drill.id} missing hidden_tests`);
      assert.ok(drill.initial_code?.trim(), `${drill.id} missing initial_code`);
      assert.ok(
        Array.isArray(drill.examples) && drill.examples.length > 0,
        `${drill.id} missing examples`,
      );
      for (const ex of drill.examples) {
        assert.ok(String(ex.input ?? "").trim(), `${drill.id} example missing input`);
        assert.ok(String(ex.output ?? "").trim(), `${drill.id} example missing output`);
      }

      for (const line of drill.initial_code.split("\n")) {
        const t = line.trim();
        assert.ok(
          t === "" || t.startsWith("def ") || t.startsWith("class ") || t === "pass",
          `${drill.id} initial_code has extra line: ${line}`,
        );
      }

      pythonPayloads.push({
        id: drill.id,
        code: `${drill.initial_code}\n${drill.hidden_tests}`,
      });
    }
  }

  const allDrillGroups = [
    ...Object.values(PYTHON_BASICS_PRACTICE_DRILLS),
    ...Object.values(ALGORITHMS_PRACTICE_DRILLS),
    ...Object.values(SYSTEM_DESIGN_PRACTICE_DRILLS),
  ];
  for (const group of allDrillGroups) {
    for (const drill of group) {
      if (seenIds.has(drill.id)) continue;
      seenIds.add(drill.id);
      assert.ok(drill.hidden_tests?.trim(), `${drill.id} missing hidden_tests`);
      assert.ok(drill.initial_code?.trim(), `${drill.id} missing initial_code`);
      assert.ok(
        Array.isArray(drill.examples) && drill.examples.length > 0,
        `${drill.id} missing examples`,
      );
      for (const ex of drill.examples) {
        assert.ok(String(ex.input ?? "").trim(), `${drill.id} example missing input`);
        assert.ok(String(ex.output ?? "").trim(), `${drill.id} example missing output`);
      }
      for (const line of drill.initial_code.split("\n")) {
        const t = line.trim();
        assert.ok(
          t === "" || t.startsWith("def ") || t.startsWith("class ") || t === "pass",
          `${drill.id} initial_code has extra line: ${line}`,
        );
      }
      pythonPayloads.push({
        id: drill.id,
        code: `${drill.initial_code}\n${drill.hidden_tests}`,
      });
    }
  }

  assert.equal(
    pythonPayloads.length,
    249,
    `Expected all 249 local stages (100 lessons/recaps + 149 drills), got ${pythonPayloads.length}`,
  );

  const outcomes = runPythonBatchedChecks(pythonPayloads);
  const failures = [];
  for (const item of outcomes) {
    if (item.err) {
      failures.push(`${item.id}: Python error ${item.err}`);
    } else if (!item.parsed || item.parsed.is_test_suite !== true) {
      failures.push(`${item.id}: missing is_test_suite JSON`);
    } else if (item.parsed.error !== undefined) {
      failures.push(`${item.id}: runtime test error ${item.parsed.error}`);
    } else if (!Array.isArray(item.parsed.results) || item.parsed.results.length === 0) {
      failures.push(`${item.id}: empty results`);
    } else if (item.parsed.all_passed !== false) {
      failures.push(`${item.id}: unexpectedly passed all tests on empty pass stub`);
    }
  }
  assert.deepEqual(failures, [], `Curriculum Python failures:\n${failures.join("\n")}`);
});

test("enrichment solutionCode passes its matching lesson hidden_tests", () => {
  const merged = mergeCurriculumLessons([]);
  const payloads = [];

  for (const enrich of LESSON_ENRICHMENTS) {
    if (!enrich.solutionCode) continue;
    const lesson = merged.find(
      (l) =>
        l.track === enrich.matchTrack &&
        l.lesson_order === enrich.matchOrder,
    );
    if (!lesson) continue;
    payloads.push({
      id: `${lesson.id}:solution`,
      code: `${enrich.solutionCode}\n${lesson.hidden_tests}`,
    });
  }

  assert.ok(payloads.length > 0, "Expected at least 1 local lesson with solutionCode");
  const outcomes = runPythonBatchedChecks(payloads);
  for (const item of outcomes) {
    assert.equal(item.err, null, `${item.id} solution errored: ${item.err}`);
    assert.equal(
      item.parsed?.all_passed,
      true,
      `${item.id} failed hidden_tests: ${JSON.stringify(item.parsed)}`,
    );
  }
});

test("every chapter ramps monotonically in difficulty and has zero Learn/CheatSheet spoilers", () => {
  const { getLessonEnrichment } = loadTsModule("src/constants/curriculum.ts");
  const { buildOrganizedLearnView } = loadTsModule("src/utils/lessonContent.ts");
  const { TRACK_CHAPTERS, isLessonInChapter } = loadTsModule(
    "src/constants/certificates.ts",
  );
  const merged = mergeCurriculumLessons([]);
  const diffRank = { Easy: 1, Medium: 2, Hard: 3 };

  // Beginner Python Ch. I teaches Variables -> Functions -> Conditionals -> Lists & Loops
  const pyCore = merged.filter(
    (l) => l.track === "python_basics" && !l.is_recap && l.lesson_order <= 4,
  );
  assert.deepEqual(
    pyCore.map((l) => l.id),
    ["exp-py-01", "exp-py-04", "exp-py-03", "exp-py-02"],
  );

  // Within every chapter across all 3 tracks, non-recap lessons never drop in difficulty
  for (const [trackKey, chapters] of Object.entries(TRACK_CHAPTERS)) {
    const trackLessons = merged.filter((l) => l.track === trackKey);
    for (const ch of chapters) {
      const chCore = trackLessons.filter(
        (l) => !l.is_recap && isLessonInChapter(l, ch),
      );
      for (let i = 1; i < chCore.length; i++) {
        assert.ok(
          diffRank[chCore[i - 1].difficulty] <= diffRank[chCore[i].difficulty],
          `${trackKey} Ch.${ch.roman} regressed difficulty from ${chCore[i - 1].id} (${chCore[i - 1].difficulty}) to ${chCore[i].id} (${chCore[i].difficulty})`,
        );
      }
    }
  }

  // Zero target-function spoilers in Learn example or Cheat Sheet across all 100 modules
  for (const lesson of merged) {
    const enrich = getLessonEnrichment(lesson);
    const view = buildOrganizedLearnView(lesson.content, enrich);
    const fnMatch = (lesson.initial_code || "").match(/def\s+([A-Za-z0-9_]+)/);
    const fnName = fnMatch ? fnMatch[1] : "";
    if (fnName && fnName !== "__init__") {
      assert.equal(
        view.singleExampleCode.includes(`def ${fnName}`),
        false,
        `${lesson.id} Learn example spoils target function ${fnName}`,
      );
      assert.equal(
        view.cheatSheetCode.includes(`def ${fnName}`),
        false,
        `${lesson.id} Cheat Sheet spoils target function ${fnName}`,
      );
    }
  }
});
