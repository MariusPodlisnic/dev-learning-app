import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildCommandPaletteItems,
  filterCommandPaletteItems,
} = loadTsModule("src/utils/commandPalette.ts");

const SAMPLE_LESSONS = [
  {
    id: "py-01",
    title: "Variables & Data Types",
    track: "python_basics",
    category: "Core Foundations",
    description: "Store text, numbers, and booleans cleanly in Python.",
    content: "",
    initial_code: "",
    expected_output: "",
    is_free: true,
    lesson_order: 1,
  },
  {
    id: "alg-02",
    title: "Binary Search & Bounds",
    track: "algorithms",
    category: "Searching",
    description: "Halve sorted arrays in O(log n) steps.",
    content: "",
    initial_code: "",
    expected_output: "",
    is_free: false,
    lesson_order: 2,
  },
  {
    id: "sys-01",
    title: "Consistent Hashing & Shards",
    track: "system_design",
    category: "Scaling",
    description: "Route cache keys smoothly across nodes.",
    content: "",
    initial_code: "",
    expected_output: "",
    is_free: false,
    lesson_order: 1,
  },
];

test("commandPalette builds structured commands across navigation, arcade, studio controls, and lessons", () => {
  const items = buildCommandPaletteItems({
    lessons: SAMPLE_LESSONS,
    completedLessons: { "py-01": true },
    isPremium: false,
    themeMode: "dark",
    activePaletteId: "arcade",
    lofiPlaying: true,
    pomodoroRunning: false,
    pomodoroClockLabel: "25:00",
  });

  const groups = new Set(items.map((i) => i.group));
  assert.ok(groups.has("NAVIGATION"));
  assert.ok(groups.has("ARCADE"));
  assert.ok(groups.has("AUDIO & FOCUS"));
  assert.ok(groups.has("LESSONS"));

  const lofiItem = items.find((i) => i.id === "ctrl-lofi");
  assert.ok(lofiItem);
  assert.equal(lofiItem.badge, "ON");
  assert.ok(lofiItem.title.includes("Pause"));

  const doneLesson = items.find((i) => i.id === "lesson-py-01");
  assert.ok(doneLesson);
  assert.equal(doneLesson.badge, "PY ✓");

  const lockedLesson = items.find((i) => i.id === "lesson-alg-02");
  assert.ok(lockedLesson);
  assert.equal(lockedLesson.badge, "ALGO PRO");
  assert.equal(lockedLesson.icon, "lock");
});

test("filterCommandPaletteItems returns curated defaults on empty query and ranks multi-token matches accurately", () => {
  const items = buildCommandPaletteItems({
    lessons: SAMPLE_LESSONS,
    completedLessons: {},
    isPremium: true,
    themeMode: "light",
    activePaletteId: "sakura",
    lofiPlaying: false,
    pomodoroRunning: true,
    pomodoroClockLabel: "14:20",
  });

  const defaults = filterCommandPaletteItems(items, "");
  assert.ok(defaults.length >= 6);
  assert.ok(defaults.every((i) => i.featured));

  const binaryResults = filterCommandPaletteItems(items, "binary search");
  assert.equal(binaryResults[0]?.id, "lesson-alg-02");

  const playgroundResults = filterCommandPaletteItems(items, "playground");
  assert.equal(playgroundResults[0]?.id, "arc-playground");

  const rainResults = filterCommandPaletteItems(items, "rainy desk");
  assert.equal(rainResults[0]?.id, "ctrl-ambient-rain");

  const sakuraResults = filterCommandPaletteItems(items, "sakura");
  assert.equal(sakuraResults[0]?.id, "palette-sakura");
  assert.equal(sakuraResults[0]?.badge, "ACTIVE");

  const noMatch = filterCommandPaletteItems(items, "zzzz-nonexistent-xyz");
  assert.equal(noMatch.length, 0);
});
