import { getChapterForTrackLesson } from "../constants/certificates";
import type { Lesson, TestCaseResult } from "../types/lesson";
import {
  type CodexEntry,
  CONSTELLATION_CODEX_ENTRIES,
} from "./constellationCodex";
import { computeAssertionDiff } from "./editorHelpers";

export interface CharacterDiffSpotlight {
  exactMatch: boolean;
  reason: string;
  lineNumber: number;
  colNumber: number;
  commonPrefix: string;
  expectedMid: string;
  actualMid: string;
  commonSuffix: string;
  hasInvisibleDiff: boolean;
  expectedSpotToken: string;
  actualSpotToken: string;
  similarityPct: number;
}

export interface TestCascadePlan {
  stepMs: number;
  victoryHoldMs: number;
  totalDurationMs: number;
  firstFailedIndex: number;
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

/**
 * Replaces spaces, tabs, and newlines with crisp visible symbols so invisible
 * whitespace bugs jump out immediately in the diff spotlight.
 */
export function visualizeWhitespace(text: string): string {
  return text
    .replace(/ /g, "·")
    .replace(/\t/g, "⇥")
    .replace(/\r?\n/g, "↵");
}

function truncateMiddleToken(raw: string, maxChars = 28): string {
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, maxChars - 1)}…`;
}

/**
 * Isolates the exact differing character span (`commonPrefix` + `mid` + `commonSuffix`),
 * computes line/column coordinates, exposes invisible whitespace, and scores similarity.
 */
export function computeCharacterDiffSpotlight(
  expectedRaw: string,
  actualRaw: string,
): CharacterDiffSpotlight {
  const expected = String(expectedRaw ?? "");
  const actual = String(actualRaw ?? "");
  const baseDiff = computeAssertionDiff(expected, actual);

  if (expected === actual) {
    return {
      exactMatch: true,
      reason: "exact match",
      lineNumber: 1,
      colNumber: 1,
      commonPrefix: expected,
      expectedMid: "",
      actualMid: "",
      commonSuffix: "",
      hasInvisibleDiff: false,
      expectedSpotToken: expected,
      actualSpotToken: actual,
      similarityPct: 100,
    };
  }

  let prefixLen = 0;
  const minLen = Math.min(expected.length, actual.length);
  while (prefixLen < minLen && expected[prefixLen] === actual[prefixLen]) {
    prefixLen += 1;
  }

  let suffixLen = 0;
  const maxRemaining = minLen - prefixLen;
  while (
    suffixLen < maxRemaining &&
    expected[expected.length - 1 - suffixLen] ===
      actual[actual.length - 1 - suffixLen]
  ) {
    suffixLen += 1;
  }

  // Avoid splitting partial identifier suffixes like "True" vs "False" into "Tru"+"e" vs "Fals"+"e"
  while (
    suffixLen > 0 &&
    /[A-Za-z]/.test(expected[expected.length - suffixLen]) &&
    (expected.length - suffixLen - 1 >= prefixLen &&
      /[A-Za-z]/.test(expected[expected.length - suffixLen - 1]))
  ) {
    suffixLen -= 1;
  }

  const commonPrefix = expected.slice(0, prefixLen);
  const commonSuffix =
    suffixLen > 0 ? expected.slice(expected.length - suffixLen) : "";
  const expectedMid = expected.slice(prefixLen, expected.length - suffixLen);
  const actualMid = actual.slice(prefixLen, actual.length - suffixLen);

  const beforeMismatch = expected.slice(0, prefixLen);
  const linesBefore = beforeMismatch.split("\n");
  const lineNumber = linesBefore.length;
  const colNumber = linesBefore[linesBefore.length - 1].length + 1;

  const hasInvisibleDiff = Boolean(
    expected.trim() === actual.trim() ||
      (expectedMid.length > 0 && expectedMid.trim() === "") ||
      (actualMid.length > 0 && actualMid.trim() === ""),
  );

  const expectedFormatted = expectedMid
    ? truncateMiddleToken(
        hasInvisibleDiff ? visualizeWhitespace(expectedMid) : expectedMid.replace(/\r?\n/g, "↵"),
      )
    : "∅ (end)";
  const actualFormatted = actualMid
    ? truncateMiddleToken(
        hasInvisibleDiff ? visualizeWhitespace(actualMid) : actualMid.replace(/\r?\n/g, "↵"),
      )
    : actual.trim() === ""
      ? "∅ (empty)"
      : "∅ (missing)";

  const maxTotal = Math.max(expected.length, actual.length, 1);
  const matchedChars = prefixLen + suffixLen;
  const rawPct = Math.round((matchedChars / maxTotal) * 100);
  const similarityPct = Math.min(99, Math.max(0, rawPct));

  return {
    exactMatch: false,
    reason: baseDiff.reason,
    lineNumber,
    colNumber,
    commonPrefix,
    expectedMid,
    actualMid,
    commonSuffix,
    hasInvisibleDiff,
    expectedSpotToken: expectedFormatted,
    actualSpotToken: actualFormatted,
    similarityPct,
  };
}

/**
 * Computes sequential test-pill cascade timings and locates the first failing assertion
 * so failed submissions automatically focus the broken test instead of index 0.
 */
export function computeTestCascadePlan(
  results: readonly Pick<TestCaseResult, "passed">[] | null | undefined,
): TestCascadePlan {
  if (!results || results.length === 0) {
    return {
      stepMs: 135,
      victoryHoldMs: 0,
      totalDurationMs: 0,
      firstFailedIndex: -1,
      passedCount: 0,
      totalCount: 0,
      allPassed: false,
    };
  }

  const stepMs = 135;
  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === results.length;
  const firstFailedIndex = results.findIndex((r) => !r.passed);
  const victoryHoldMs = allPassed ? 240 : 0;
  const totalDurationMs = Math.min(
    680,
    Math.max(0, (results.length - 1) * stepMs) + victoryHoldMs,
  );

  return {
    stepMs,
    victoryHoldMs,
    totalDurationMs,
    firstFailedIndex,
    passedCount,
    totalCount: results.length,
    allPassed,
  };
}

/**
 * Finds the Constellation Field Guide blueprint associated with a lesson's track & chapter.
 */
export function findCodexCardForLesson(
  lesson:
    | Pick<Lesson, "track" | "lesson_order" | "is_recap" | "recap_chapter">
    | null
    | undefined,
): CodexEntry | null {
  if (!lesson) return null;
  const chapter = getChapterForTrackLesson(lesson.track, lesson);
  const matches = CONSTELLATION_CODEX_ENTRIES.filter(
    (entry) => entry.track === lesson.track && entry.chapterId === chapter.id,
  );
  // Prefer the non-starter chapter grimoire card if multiple exist (e.g. Python Ch. I)
  return (
    matches.find((entry) => !entry.alwaysUnlocked) ||
    matches[matches.length - 1] ||
    null
  );
}
