import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  CONSTELLATION_CODEX_ENTRIES,
  resolveCodexEntries,
  findUnlockLessonForEntry,
  filterCodexEntries,
  togglePinnedCodexId,
  readPinnedCodexIds,
} = loadTsModule("src/utils/constellationCodex.ts");
const { mergeCurriculumLessons } = loadTsModule("src/constants/curriculum.ts");

test("CONSTELLATION_CODEX_ENTRIES defines 21 unique grimoire entries across all 3 tracks", () => {
  assert.equal(CONSTELLATION_CODEX_ENTRIES.length, 21);
  const ids = new Set(CONSTELLATION_CODEX_ENTRIES.map((e) => e.id));
  assert.equal(ids.size, 21);

  const byTrack = {
    python_basics: CONSTELLATION_CODEX_ENTRIES.filter((e) => e.track === "python_basics").length,
    algorithms: CONSTELLATION_CODEX_ENTRIES.filter((e) => e.track === "algorithms").length,
    system_design: CONSTELLATION_CODEX_ENTRIES.filter((e) => e.track === "system_design").length,
  };
  assert.deepEqual(byTrack, {
    python_basics: 8,
    algorithms: 7,
    system_design: 6,
  });

  for (const entry of CONSTELLATION_CODEX_ENTRIES) {
    assert.ok(entry.codeSnippet.trim().length > 20, `Missing codeSnippet on ${entry.id}`);
    assert.ok(entry.keyInvariant.trim().length > 10, `Missing keyInvariant on ${entry.id}`);
    assert.ok(entry.pitfallWarning.trim().length > 10, `Missing pitfallWarning on ${entry.id}`);
  }
});

test("resolveCodexEntries illuminates starter entries initially and unlocks chapter entries as lessons are solved", () => {
  const lessons = mergeCurriculumLessons([]);
  const initial = resolveCodexEntries(lessons, {}, []);
  const initialUnlocked = initial.filter((r) => r.unlocked).map((r) => r.entry.id);
  assert.deepEqual(initialUnlocked, ["py-starter-fstrings", "py-ch1-loops-lists"]);

  // Solve a Python Ch. II lesson (lesson_order 5..8) and an Algorithms Ch. III lesson (lesson_order 9..12)
  const pyCh2Lesson = lessons.find(
    (l) => l.track === "python_basics" && l.lesson_order === 6 && !l.is_recap,
  );
  const algoCh3Lesson = lessons.find(
    (l) => l.track === "algorithms" && l.lesson_order === 10 && !l.is_recap,
  );
  assert.ok(pyCh2Lesson && algoCh3Lesson);

  const afterProgress = resolveCodexEntries(
    lessons,
    { [pyCh2Lesson.id]: true, [algoCh3Lesson.id]: true },
    ["algo-ch3-binary-prefix"],
  );

  const pyCh2Card = afterProgress.find((r) => r.entry.id === "py-ch2-dicts-slicing");
  const algoCh3Card = afterProgress.find((r) => r.entry.id === "algo-ch3-binary-prefix");
  const sysCh6Card = afterProgress.find((r) => r.entry.id === "sys-ch6-token-bucket");

  assert.equal(pyCh2Card?.unlocked, true);
  assert.equal(algoCh3Card?.unlocked, true);
  assert.equal(algoCh3Card?.pinned, true);
  assert.equal(sysCh6Card?.unlocked, false);

  // Unlock target lesson lookup points to first unsolved lesson in System Design Ch. VI
  const sysTarget = findUnlockLessonForEntry(sysCh6Card.entry, lessons, {});
  assert.ok(sysTarget);
  assert.equal(sysTarget.track, "system_design");
  assert.ok(sysTarget.lesson_order >= 21 && sysTarget.lesson_order <= 24);
});

test("filterCodexEntries filters by track, pinned status, and multi-token search queries", () => {
  const lessons = mergeCurriculumLessons([]);
  const pins = togglePinnedCodexId([], "sys-ch6-token-bucket");
  assert.deepEqual(readPinnedCodexIds(), ["sys-ch6-token-bucket"]);

  const resolved = resolveCodexEntries(lessons, {}, pins, true);
  assert.equal(filterCodexEntries(resolved, "pinned", "").length, 1);
  assert.equal(filterCodexEntries(resolved, "system_design", "").length, 6);

  const searchHits = filterCodexEntries(resolved, "all", "sliding window");
  assert.ok(searchHits.some((r) => r.entry.id === "algo-ch1-sliding-two-ptr"));

  const cleared = togglePinnedCodexId(pins, "sys-ch6-token-bucket");
  assert.deepEqual(cleared, []);
});
