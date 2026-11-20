import {
  EXPANSION_LESSONS,
  LESSON_ENRICHMENTS,
} from "../constants/curriculum";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export type FlashcardTrackFilter =
  | "all"
  | "python_basics"
  | "algorithms"
  | "system_design";

export type FlashcardCategory = "CONCEPT CHECK" | "PITFALL ALERT";

export interface FlashcardItem {
  id: string;
  track: "python_basics" | "algorithms" | "system_design";
  lessonOrder: number;
  topic: string;
  category: FlashcardCategory;
  prompt: string;
  frontCode?: string;
  answerHeadline: string;
  explanation: string;
  backCode?: string;
  isPro: boolean;
}

export interface FlashcardProgressState {
  masteredIds: Record<string, boolean>;
  reviewIds: Record<string, boolean>;
  totalReviewed: number;
  bestStreak: number;
}

export const STORAGE_FLASHCARDS_KEY = "devlearn_flashcards_v1";
export const FLASHCARD_SPRINT_SIZE = 8;
const FREE_PRO_TRACK_PREVIEW_COUNT = 4;

const DEFAULT_PROGRESS: FlashcardProgressState = {
  masteredIds: {},
  reviewIds: {},
  totalReviewed: 0,
  bestStreak: 0,
};

function trimCodeLines(raw: string | undefined, maxLines = 4): string | undefined {
  if (!raw) return undefined;
  const lines = raw
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l, idx, arr) => l.trim().length > 0 || (idx > 0 && idx < arr.length - 1));
  if (lines.length === 0) return undefined;
  return lines.slice(0, maxLines).join("\n");
}

function buildLessonTitleLookup(): Map<string, string> {
  const map = new Map<string, string>();
  for (const lesson of EXPANSION_LESSONS) {
    const isRecap = "is_recap" in lesson && Boolean(lesson.is_recap);
    if (!isRecap && typeof lesson.lesson_order === "number") {
      map.set(`${lesson.track}:${lesson.lesson_order}`, lesson.title);
    }
  }
  return map;
}

let cachedCatalog: readonly FlashcardItem[] | null = null;

/**
 * Generates the full deterministic catalog of rapid-recall flashcards from
 * Devy's curated curriculum enrichments (Concept Checks + Pitfall Alerts).
 */
export function getFlashcardCatalog(): readonly FlashcardItem[] {
  if (cachedCatalog) return cachedCatalog;

  const titleByTrackOrder = buildLessonTitleLookup();
  const seenIds = new Set<string>();
  const trackCount: Record<"python_basics" | "algorithms" | "system_design", number> = {
    python_basics: 0,
    algorithms: 0,
    system_design: 0,
  };
  const items: FlashcardItem[] = [];

  for (let idx = 0; idx < LESSON_ENRICHMENTS.length; idx += 1) {
    const entry = LESSON_ENRICHMENTS[idx];
    const track = entry.matchTrack;
    const order = entry.matchOrder ?? idx + 1;
    const topic =
      titleByTrackOrder.get(`${track}:${order}`) ||
      entry.analogyTitle ||
      `Module ${order}`;

    const isProTrack = track !== "python_basics";

    // 1. Concept Check Card (from verified enrichment quiz)
    const correctOption = entry.quiz?.options?.[entry.quiz.correctIndex];
    if (entry.quiz?.question && correctOption) {
      const cardId = `fc-${track}-${order}-concept`;
      if (!seenIds.has(cardId)) {
        seenIds.add(cardId);
        trackCount[track] += 1;
        items.push({
          id: cardId,
          track,
          lessonOrder: order,
          topic,
          category: "CONCEPT CHECK",
          prompt: entry.quiz.question.trim(),
          answerHeadline: correctOption.trim(),
          explanation: entry.quiz.explanation.trim(),
          backCode: trimCodeLines(entry.cheatSheet, 4),
          isPro: isProTrack && trackCount[track] > FREE_PRO_TRACK_PREVIEW_COUNT,
        });
      }
    }

    // 2. Pitfall Alert Card (when lesson has a curated wrongCode -> rightCode trap)
    if (
      entry.commonPitfall?.wrongCode &&
      entry.commonPitfall?.rightCode &&
      entry.commonPitfall?.title
    ) {
      const pitfallId = `fc-${track}-${order}-pitfall`;
      if (!seenIds.has(pitfallId)) {
        seenIds.add(pitfallId);
        trackCount[track] += 1;
        items.push({
          id: pitfallId,
          track,
          lessonOrder: order,
          topic,
          category: "PITFALL ALERT",
          prompt: "Spot the bug or anti-pattern in this snippet:",
          frontCode: trimCodeLines(entry.commonPitfall.wrongCode, 4),
          answerHeadline: entry.commonPitfall.title.trim(),
          explanation: entry.commonPitfall.explanation.trim(),
          backCode: trimCodeLines(entry.commonPitfall.rightCode, 4),
          isPro: isProTrack && trackCount[track] > FREE_PRO_TRACK_PREVIEW_COUNT,
        });
      }
    }
  }

  cachedCatalog = items;
  return cachedCatalog;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const arr = [...items];
  let state = hashSeed(seed) || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function buildFlashcardSessionDeck(options: {
  track: FlashcardTrackFilter;
  isPremium: boolean;
  progress: FlashcardProgressState;
  reviewOnly?: boolean;
  size?: number;
  seed?: string;
}): FlashcardItem[] {
  const {
    track,
    isPremium,
    progress,
    reviewOnly = false,
    size = FLASHCARD_SPRINT_SIZE,
    seed = String(Date.now()),
  } = options;

  const catalog = getFlashcardCatalog();
  const trackMatched =
    track === "all"
      ? catalog
      : catalog.filter((item) => item.track === track);

  const accessible = isPremium
    ? trackMatched
    : trackMatched.filter((item) => !item.isPro);

  if (reviewOnly) {
    const dueReview = accessible.filter((item) => progress.reviewIds[item.id]);
    return seededShuffle(dueReview, `${seed}-review`).slice(0, size);
  }

  // Prioritize cards needing review first, then unseen cards, then mastered refreshers
  const needsReview = accessible.filter((item) => progress.reviewIds[item.id]);
  const unseen = accessible.filter(
    (item) => !progress.reviewIds[item.id] && !progress.masteredIds[item.id],
  );
  const mastered = accessible.filter(
    (item) => !progress.reviewIds[item.id] && progress.masteredIds[item.id],
  );

  const prioritized = [
    ...seededShuffle(needsReview, `${seed}-rev`),
    ...seededShuffle(unseen, `${seed}-new`),
    ...seededShuffle(mastered, `${seed}-done`),
  ];

  return prioritized.slice(0, size);
}

export function recordFlashcardRating(
  progress: FlashcardProgressState,
  cardId: string,
  rating: "got_it" | "review",
  currentStreak: number,
): FlashcardProgressState {
  const nextMastered = { ...progress.masteredIds };
  const nextReview = { ...progress.reviewIds };

  if (rating === "got_it") {
    nextMastered[cardId] = true;
    delete nextReview[cardId];
  } else {
    nextReview[cardId] = true;
  }

  return {
    masteredIds: nextMastered,
    reviewIds: nextReview,
    totalReviewed: progress.totalReviewed + 1,
    bestStreak: Math.max(progress.bestStreak, currentStreak),
  };
}

export function computeFlashcardRoundReward(params: {
  gotItCount: number;
  totalCards: number;
  bestRoundStreak: number;
}): number {
  const { gotItCount, totalCards, bestRoundStreak } = params;
  if (gotItCount <= 0) return 0;
  const baseXp = gotItCount * 5;
  const perfectBonus = totalCards >= 4 && gotItCount === totalCards ? 10 : 0;
  const streakBonus = bestRoundStreak >= 5 ? 5 : 0;
  return Math.min(55, baseXp + perfectBonus + streakBonus);
}

export function normalizeFlashcardProgress(
  raw: unknown,
): FlashcardProgressState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROGRESS };
  const obj = raw as Partial<FlashcardProgressState>;
  return {
    masteredIds:
      obj.masteredIds && typeof obj.masteredIds === "object"
        ? { ...obj.masteredIds }
        : {},
    reviewIds:
      obj.reviewIds && typeof obj.reviewIds === "object"
        ? { ...obj.reviewIds }
        : {},
    totalReviewed:
      typeof obj.totalReviewed === "number" && obj.totalReviewed >= 0
        ? obj.totalReviewed
        : 0,
    bestStreak:
      typeof obj.bestStreak === "number" && obj.bestStreak >= 0
        ? obj.bestStreak
        : 0,
  };
}

export function readFlashcardProgress(): FlashcardProgressState {
  return normalizeFlashcardProgress(
    readLocalJson<FlashcardProgressState>(
      STORAGE_FLASHCARDS_KEY,
      DEFAULT_PROGRESS,
    ),
  );
}

export async function hydrateFlashcardProgress(): Promise<FlashcardProgressState> {
  const saved = await readLocalJsonAsync<FlashcardProgressState>(
    STORAGE_FLASHCARDS_KEY,
    DEFAULT_PROGRESS,
  );
  return normalizeFlashcardProgress(saved);
}

export function saveFlashcardProgress(progress: FlashcardProgressState): void {
  writeLocalJson(STORAGE_FLASHCARDS_KEY, progress);
}
