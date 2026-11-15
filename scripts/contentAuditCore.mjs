import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { loadTsModule } from "../tests/helpers/loadTs.mjs";

const VALID_TRACKS = new Set(["python_basics", "algorithms", "system_design"]);
const VALID_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

export function resolvePythonBinary() {
  if (process.env.PYTHON_BIN) {
    return process.env.PYTHON_BIN;
  }
  const onPath = spawnSync("python3", ["--version"], { encoding: "utf8" });
  if (onPath.status === 0) {
    return "python3";
  }
  if (fs.existsSync("/usr/bin/python3")) {
    return "/usr/bin/python3";
  }
  throw new Error(
    "No python3 executable found. Set PYTHON_BIN or ensure python3 is on PATH.",
  );
}

/**
 * Executes a batch of Python test scripts (supporting __run_tests__(),
 * printed is_test_suite JSON, or Pyodide-style trailing json.dumps expressions).
 */
export function runPythonAuditBatch(items) {
  const pyRunner = `
import ast, io, json, sys
from contextlib import redirect_stdout

payload = json.loads(sys.stdin.read())
out = []
for entry in payload:
    code = entry["code"]
    harness = entry.get("harness")
    buf = io.StringIO()
    ns = {}
    parsed = None
    err = None
    harness_syntax_ok = True
    if harness is not None:
        try:
            compile(harness, f"{entry['id']}:harness", "exec")
        except Exception as e:
            harness_syntax_ok = False
            err = f"HarnessSyntaxError: {type(e).__name__}: {e}"
    if harness_syntax_ok:
        try:
            tree = ast.parse(code, filename=entry["id"], mode="exec")
            with redirect_stdout(buf):
                if tree.body and isinstance(tree.body[-1], ast.Expr):
                    prefix = ast.Module(body=tree.body[:-1], type_ignores=[])
                    exec(compile(prefix, entry["id"], "exec"), ns, ns)
                    expr = ast.Expression(body=tree.body[-1].value)
                    ret = eval(compile(expr, entry["id"], "eval"), ns, ns)
                else:
                    exec(compile(tree, entry["id"], "exec"), ns, ns)
                    ret = None
                if "__run_tests__" in ns and callable(ns["__run_tests__"]):
                    ret = ns["__run_tests__"]()
                if isinstance(ret, str) and '"is_test_suite"' in ret:
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
    out.append({
        "id": entry["id"],
        "parsed": parsed,
        "err": err,
        "harnessSyntaxOk": harness_syntax_ok,
        "stdout": buf.getvalue(),
    })
print(json.dumps(out))
`;
  const pythonBin = resolvePythonBinary();
  const proc = spawnSync(pythonBin, ["-c", pyRunner], {
    input: JSON.stringify(items),
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (proc.status !== 0) {
    throw new Error(
      `Python audit runner failed (${pythonBin}): ${proc.stderr || proc.error}`,
    );
  }
  return JSON.parse(proc.stdout);
}

function validateMinimalStarterStub(id, initialCode, errors) {
  if (!initialCode?.trim()) {
    errors.push(`${id}: missing initial_code`);
    return;
  }
  for (const line of initialCode.split("\n")) {
    const t = line.trim();
    if (
      t !== "" &&
      !t.startsWith("def ") &&
      !t.startsWith("class ") &&
      t !== "pass"
    ) {
      errors.push(`${id}: initial_code has extra non-stub line: ${line}`);
    }
  }
}

export function auditCurriculumAndSolutions() {
  const { LESSON_ENRICHMENTS, mergeCurriculumLessons } = loadTsModule(
    "src/constants/curriculum.ts",
  );
  const { PYTHON_BASICS_PRACTICE_DRILLS } = loadTsModule(
    "src/constants/curriculumData/pythonBasicsPracticeDrills.ts",
  );
  const { ALGORITHMS_PRACTICE_DRILLS } = loadTsModule(
    "src/constants/curriculumData/algorithmsPracticeDrills.ts",
  );
  const { SYSTEM_DESIGN_PRACTICE_DRILLS } = loadTsModule(
    "src/constants/curriculumData/systemDesignPracticeDrills.ts",
  );

  const errors = [];
  const merged = mergeCurriculumLessons([]);
  const seenIds = new Set();
  const starterPayloads = [];

  for (const lesson of merged) {
    if (!lesson.id) {
      errors.push("Curriculum lesson missing id");
      continue;
    }
    if (seenIds.has(lesson.id)) {
      errors.push(`Duplicate lesson id: ${lesson.id}`);
    }
    seenIds.add(lesson.id);

    if (!lesson.title?.trim()) errors.push(`${lesson.id}: missing title`);
    if (!lesson.assignment?.trim()) errors.push(`${lesson.id}: missing assignment`);
    if (!lesson.hidden_tests?.trim()) errors.push(`${lesson.id}: missing hidden_tests`);

    validateMinimalStarterStub(lesson.id, lesson.initial_code, errors);
    if (lesson.initial_code?.trim() && lesson.hidden_tests?.trim()) {
      starterPayloads.push({
        id: lesson.id,
        code: `${lesson.initial_code}\n${lesson.hidden_tests}`,
        harness: lesson.hidden_tests,
      });
    }

    for (const drill of lesson.practiceChallenges || []) {
      if (!drill.id) {
        errors.push(`${lesson.id}: drill missing id`);
        continue;
      }
      if (seenIds.has(drill.id)) {
        errors.push(`Duplicate drill id: ${drill.id}`);
      }
      seenIds.add(drill.id);
      if (!drill.hidden_tests?.trim()) {
        errors.push(`${drill.id}: missing hidden_tests`);
      }
      validateMinimalStarterStub(drill.id, drill.initial_code, errors);
      if (drill.initial_code?.trim() && drill.hidden_tests?.trim()) {
        starterPayloads.push({
          id: drill.id,
          code: `${drill.initial_code}\n${drill.hidden_tests}`,
          harness: drill.hidden_tests,
        });
      }
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
      if (!drill.hidden_tests?.trim()) {
        errors.push(`${drill.id}: missing hidden_tests`);
      }
      validateMinimalStarterStub(drill.id, drill.initial_code, errors);
      if (drill.initial_code?.trim() && drill.hidden_tests?.trim()) {
        starterPayloads.push({
          id: drill.id,
          code: `${drill.initial_code}\n${drill.hidden_tests}`,
          harness: drill.hidden_tests,
        });
      }
    }
  }

  const starterOutcomes = runPythonAuditBatch(starterPayloads);
  for (const item of starterOutcomes) {
    if (item.err) {
      errors.push(`${item.id}: Python error ${item.err}`);
    } else if (!item.parsed || item.parsed.is_test_suite !== true) {
      errors.push(`${item.id}: missing is_test_suite JSON`);
    } else if (item.parsed.error !== undefined) {
      errors.push(`${item.id}: runtime test error ${item.parsed.error}`);
    } else if (!Array.isArray(item.parsed.results) || item.parsed.results.length === 0) {
      errors.push(`${item.id}: empty results`);
    } else if (item.parsed.all_passed !== false) {
      errors.push(`${item.id}: starter pass stub unexpectedly passed hidden_tests`);
    }
  }

  const solutionPayloads = [];
  let quizChecksCount = 0;

  for (let idx = 0; idx < LESSON_ENRICHMENTS.length; idx++) {
    const enrich = LESSON_ENRICHMENTS[idx];
    const enrichLabel = `${enrich.matchTrack}:${enrich.matchOrder ?? idx}`;

    if (enrich.quiz) {
      quizChecksCount += 1;
      const { question, options, correctIndex, explanation } = enrich.quiz;
      if (!question?.trim()) {
        errors.push(`Quiz ${enrichLabel}: missing question`);
      }
      if (!Array.isArray(options) || options.length < 2) {
        errors.push(`Quiz ${enrichLabel}: expected >= 2 options`);
      } else {
        if (
          !Number.isInteger(correctIndex) ||
          correctIndex < 0 ||
          correctIndex >= options.length
        ) {
          errors.push(`Quiz ${enrichLabel}: invalid correctIndex ${correctIndex}`);
        }
        const normalized = options.map((opt) => String(opt).trim());
        if (normalized.some((opt) => !opt)) {
          errors.push(`Quiz ${enrichLabel}: contains empty option`);
        }
        if (new Set(normalized).size !== options.length) {
          errors.push(`Quiz ${enrichLabel}: duplicate option strings`);
        }
      }
      if (!explanation?.trim()) {
        errors.push(`Quiz ${enrichLabel}: missing explanation`);
      }
    }

    if (enrich.solutionCode) {
      const lesson = merged.find(
        (l) =>
          l.track === enrich.matchTrack &&
          l.lesson_order === enrich.matchOrder,
      );
      if (lesson) {
        solutionPayloads.push({
          id: `${lesson.id}:solution`,
          code: `${enrich.solutionCode}\n${lesson.hidden_tests}`,
          harness: lesson.hidden_tests,
        });
      }
    }
  }

  const solutionOutcomes = runPythonAuditBatch(solutionPayloads);
  for (const item of solutionOutcomes) {
    if (item.err) {
      errors.push(`${item.id}: solution errored (${item.err})`);
    } else if (item.parsed?.all_passed !== true) {
      errors.push(
        `${item.id}: solution failed hidden_tests (${JSON.stringify(item.parsed)})`,
      );
    }
  }

  return {
    errors,
    counts: {
      lessonsAndDrills: starterPayloads.length,
      solutions: solutionPayloads.length,
      quizzes: quizChecksCount,
    },
  };
}

export function auditBugHuntIncidents() {
  const { BUG_INCIDENTS } = loadTsModule(
    "src/constants/curriculumData/bugHuntIncidents.ts",
  );
  const errors = [];
  const seenIds = new Set();
  const seenCodeIds = new Set();
  const payloads = [];

  for (const inc of BUG_INCIDENTS) {
    if (!inc.id?.trim()) errors.push("Bug incident missing id");
    if (seenIds.has(inc.id)) errors.push(`Duplicate bug incident id: ${inc.id}`);
    seenIds.add(inc.id);

    if (!inc.codeId?.trim()) errors.push(`${inc.id}: missing codeId`);
    if (seenCodeIds.has(inc.codeId)) {
      errors.push(`Duplicate bug codeId: ${inc.codeId}`);
    }
    seenCodeIds.add(inc.codeId);

    if (!VALID_TRACKS.has(inc.track)) {
      errors.push(`${inc.id}: invalid track ${inc.track}`);
    }
    if (!VALID_DIFFICULTIES.has(inc.difficulty)) {
      errors.push(`${inc.id}: invalid difficulty ${inc.difficulty}`);
    }
    if (!Number.isFinite(inc.timeLimitSec) || inc.timeLimitSec <= 0) {
      errors.push(`${inc.id}: invalid timeLimitSec ${inc.timeLimitSec}`);
    }
    if (!Number.isFinite(inc.baseXp) || inc.baseXp <= 0) {
      errors.push(`${inc.id}: invalid baseXp ${inc.baseXp}`);
    }
    if (!inc.title?.trim()) errors.push(`${inc.id}: missing title`);
    if (!inc.symptom?.trim()) errors.push(`${inc.id}: missing symptom`);
    if (!inc.rootCauseHint?.trim()) errors.push(`${inc.id}: missing rootCauseHint`);
    if (!inc.expectedSummary?.trim()) errors.push(`${inc.id}: missing expectedSummary`);
    if (!inc.buggyCode?.trim()) errors.push(`${inc.id}: missing buggyCode`);
    if (!inc.testHarness?.trim()) {
      errors.push(`${inc.id}: missing testHarness`);
    } else if (!inc.testHarness.includes("is_test_suite")) {
      errors.push(`${inc.id}: testHarness missing is_test_suite marker`);
    }

    if (inc.buggyCode?.trim() && inc.testHarness?.trim()) {
      payloads.push({
        id: inc.id,
        code: `${inc.buggyCode}\n${inc.testHarness}`,
        harness: inc.testHarness,
      });
    }
  }

  const outcomes = runPythonAuditBatch(payloads);
  for (const item of outcomes) {
    if (!item.harnessSyntaxOk) {
      errors.push(`${item.id}: invalid testHarness syntax (${item.err})`);
      continue;
    }
    // Crash-reproducing incidents raise a runtime exception before harness finishes,
    // which BugHuntArena catches as a failed test. Only passing all tests on buggyCode
    // or emitting invalid suite output when no runtime exception occurred is invalid.
    if (!item.err) {
      if (!item.parsed || item.parsed.is_test_suite !== true) {
        errors.push(`${item.id}: missing is_test_suite JSON from buggyCode + harness`);
      } else if (item.parsed.all_passed === true) {
        errors.push(`${item.id}: buggyCode already passes all testHarness cases!`);
      } else if (!Array.isArray(item.parsed.results) || item.parsed.results.length === 0) {
        errors.push(`${item.id}: testHarness emitted zero test results`);
      }
    }
  }

  return {
    errors,
    counts: { bugIncidents: BUG_INCIDENTS.length },
  };
}

export function auditBlitzCards() {
  const { BLITZ_CARDS } = loadTsModule(
    "src/constants/curriculumData/syntaxBlitzCards.ts",
  );
  const errors = [];
  const seenIds = new Set();

  for (const card of BLITZ_CARDS) {
    if (!card.id?.trim()) errors.push("Blitz card missing id");
    if (seenIds.has(card.id)) errors.push(`Duplicate blitz card id: ${card.id}`);
    seenIds.add(card.id);

    if (!VALID_TRACKS.has(card.deck)) {
      errors.push(`${card.id}: invalid deck ${card.deck}`);
    }
    if (!card.tag?.trim()) errors.push(`${card.id}: missing tag`);
    if (!card.prompt?.trim()) errors.push(`${card.id}: missing prompt`);
    if (!card.explanation?.trim()) errors.push(`${card.id}: missing explanation`);
    if (!card.codeTemplate?.includes("[ ___ ]")) {
      errors.push(`${card.id}: codeTemplate missing [ ___ ] blank marker`);
    }

    if (!Array.isArray(card.options) || card.options.length !== 4) {
      errors.push(`${card.id}: expected exactly 4 options`);
    } else {
      if (
        !Number.isInteger(card.correctIndex) ||
        card.correctIndex < 0 ||
        card.correctIndex > 3
      ) {
        errors.push(`${card.id}: invalid correctIndex ${card.correctIndex}`);
      }
      const trimmed = card.options.map((o) => String(o).trim());
      if (trimmed.some((o) => !o)) {
        errors.push(`${card.id}: contains blank option`);
      }
      if (new Set(trimmed).size !== 4) {
        errors.push(`${card.id}: contains duplicate option choices`);
      }
    }
  }

  return {
    errors,
    counts: { blitzCards: BLITZ_CARDS.length },
  };
}

export function auditVisualizerEngines() {
  const engines = loadTsModule("src/utils/visualizerEngines.ts");
  const errors = [];
  const checks = [
    ["factorial(4)", () => engines.buildFactorialRecursionSteps(4)],
    ["fib_memo", () => engines.buildFibMemoSteps()],
    ["min_heap_insert", () => engines.buildMinHeapInsertSteps([18, 7, 24, 3, 12])],
    ["min_heap_pop", () => engines.buildMinHeapPopSteps([3, 7, 12, 18, 24])],
    ["knapsack_dp", () => engines.buildKnapsackDpSteps()],
    ["coin_change_dp", () => engines.buildCoinChangeDpSteps([1, 3, 4], 6)],
    ["cache_flow", () => engines.buildCacheFlowSteps()],
    ["rate_limit_failover", () => engines.buildRateLimitFailoverSteps()],
  ];

  for (const [label, run] of checks) {
    try {
      const steps = run();
      if (!Array.isArray(steps) || steps.length < 2) {
        errors.push(`Visualizer ${label}: expected >= 2 trace steps`);
      }
    } catch (err) {
      errors.push(`Visualizer ${label}: threw ${err?.message || err}`);
    }
  }

  return {
    errors,
    counts: { visualizerEngines: checks.length },
  };
}

export function runFullContentAudit() {
  const curriculum = auditCurriculumAndSolutions();
  const bugs = auditBugHuntIncidents();
  const blitz = auditBlitzCards();
  const visualizers = auditVisualizerEngines();

  const errors = [
    ...curriculum.errors,
    ...bugs.errors,
    ...blitz.errors,
    ...visualizers.errors,
  ];

  return {
    ok: errors.length === 0,
    summary: {
      ...curriculum.counts,
      ...bugs.counts,
      ...blitz.counts,
      ...visualizers.counts,
      errorCount: errors.length,
    },
    errors,
  };
}
