import { readLocalJson, writeLocalJson } from "./storage";

export const STORAGE_ARCADE_RECORDS_KEY = "devlearn_arcade_records_v1";
const LEGACY_BLITZ_HIGHSCORE_KEY = "devlearn_blitz_highscore_v1";

export interface ArcadeRecordsState {
  blitzBestHits: number;
  blitzBestXp: number;
  flashcardsMasteredTotal: number;
  flashcardsRoundsCleared: number;
  detectiveBestScore: number;
  detectiveCasesSolvedTotal: number;
}

const DEFAULT_RECORDS: ArcadeRecordsState = {
  blitzBestHits: 0,
  blitzBestXp: 0,
  flashcardsMasteredTotal: 0,
  flashcardsRoundsCleared: 0,
  detectiveBestScore: 0,
  detectiveCasesSolvedTotal: 0,
};

type ArcadeRecordsListener = (state: ArcadeRecordsState) => void;
const listeners = new Set<ArcadeRecordsListener>();

function clampNonNegInt(value: unknown, max = 100000): number {
  const n = Math.floor(Number(value) || 0);
  return Math.max(0, Math.min(max, n));
}

export function sanitizeArcadeRecords(raw: unknown): ArcadeRecordsState {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_RECORDS };
  }
  const obj = raw as Record<string, unknown>;
  return {
    blitzBestHits: clampNonNegInt(obj.blitzBestHits, 500),
    blitzBestXp: clampNonNegInt(obj.blitzBestXp, 100000),
    flashcardsMasteredTotal: clampNonNegInt(obj.flashcardsMasteredTotal, 100000),
    flashcardsRoundsCleared: clampNonNegInt(obj.flashcardsRoundsCleared, 10000),
    detectiveBestScore: clampNonNegInt(obj.detectiveBestScore, 6),
    detectiveCasesSolvedTotal: clampNonNegInt(obj.detectiveCasesSolvedTotal, 10000),
  };
}

function emit(state: ArcadeRecordsState) {
  listeners.forEach((fn) => fn(state));
}

export function getArcadeRecordsState(): ArcadeRecordsState {
  const stored = sanitizeArcadeRecords(
    readLocalJson<Partial<ArcadeRecordsState>>(
      STORAGE_ARCADE_RECORDS_KEY,
      DEFAULT_RECORDS,
    ),
  );
  const legacyBlitzXp = clampNonNegInt(
    readLocalJson<number>(LEGACY_BLITZ_HIGHSCORE_KEY, 0),
    100000,
  );
  if (legacyBlitzXp > stored.blitzBestXp) {
    return { ...stored, blitzBestXp: legacyBlitzXp };
  }
  return stored;
}

export function subscribeArcadeRecords(
  listener: ArcadeRecordsListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mergeArcadeRecords(
  a?: Partial<ArcadeRecordsState> | null,
  b?: Partial<ArcadeRecordsState> | null,
): ArcadeRecordsState {
  const sa = sanitizeArcadeRecords(a);
  const sb = sanitizeArcadeRecords(b);
  return {
    blitzBestHits: Math.max(sa.blitzBestHits, sb.blitzBestHits),
    blitzBestXp: Math.max(sa.blitzBestXp, sb.blitzBestXp),
    flashcardsMasteredTotal: Math.max(
      sa.flashcardsMasteredTotal,
      sb.flashcardsMasteredTotal,
    ),
    flashcardsRoundsCleared: Math.max(
      sa.flashcardsRoundsCleared,
      sb.flashcardsRoundsCleared,
    ),
    detectiveBestScore: Math.max(sa.detectiveBestScore, sb.detectiveBestScore),
    detectiveCasesSolvedTotal: Math.max(
      sa.detectiveCasesSolvedTotal,
      sb.detectiveCasesSolvedTotal,
    ),
  };
}

export function replaceArcadeRecordsFromCloud(
  incoming?: Partial<ArcadeRecordsState> | null,
): ArcadeRecordsState {
  const merged = mergeArcadeRecords(getArcadeRecordsState(), incoming);
  writeLocalJson(STORAGE_ARCADE_RECORDS_KEY, merged);
  emit(merged);
  return merged;
}

export function recordBlitzRun(hits: number, xpEarned = 0): ArcadeRecordsState {
  const safeHits = clampNonNegInt(hits, 500);
  const safeXp = clampNonNegInt(xpEarned, 100000);
  const current = getArcadeRecordsState();
  const next: ArcadeRecordsState = {
    ...current,
    blitzBestHits: Math.max(current.blitzBestHits, safeHits),
    blitzBestXp: Math.max(current.blitzBestXp, safeXp),
  };
  writeLocalJson(STORAGE_ARCADE_RECORDS_KEY, next);
  emit(next);
  return next;
}

export function recordFlashcardsRound(
  masteredInRound: number,
): ArcadeRecordsState {
  const safeMastered = clampNonNegInt(masteredInRound, 100);
  const current = getArcadeRecordsState();
  const next: ArcadeRecordsState = {
    ...current,
    flashcardsMasteredTotal: current.flashcardsMasteredTotal + safeMastered,
    flashcardsRoundsCleared: current.flashcardsRoundsCleared + 1,
  };
  writeLocalJson(STORAGE_ARCADE_RECORDS_KEY, next);
  emit(next);
  return next;
}

export function recordDetectiveRound(
  correctInRound: number,
): ArcadeRecordsState {
  const safeCorrect = clampNonNegInt(correctInRound, 6);
  const current = getArcadeRecordsState();
  const next: ArcadeRecordsState = {
    ...current,
    detectiveBestScore: Math.max(current.detectiveBestScore, safeCorrect),
    detectiveCasesSolvedTotal: current.detectiveCasesSolvedTotal + safeCorrect,
  };
  writeLocalJson(STORAGE_ARCADE_RECORDS_KEY, next);
  emit(next);
  return next;
}

export function getBlitzRankFromHits(hits: number): string {
  if (hits >= 12) return "S-RANK";
  if (hits >= 8) return "A-RANK";
  if (hits >= 5) return "B-RANK";
  return "C-RANK";
}

export function resetArcadeRecordsForTesting(): void {
  writeLocalJson(STORAGE_ARCADE_RECORDS_KEY, { ...DEFAULT_RECORDS });
  writeLocalJson(LEGACY_BLITZ_HIGHSCORE_KEY, 0);
  emit({ ...DEFAULT_RECORDS });
}
