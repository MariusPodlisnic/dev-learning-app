import { BUG_INCIDENTS } from "../constants/curriculumData/bugHuntIncidents";
import { BLITZ_CARDS } from "../constants/curriculumData/syntaxBlitzCards";
import { StudioColors } from "../constants/theme";
import { getDailyDateKey } from "./arenaReplayability";
import { DETECTIVE_CASES } from "./outputDetective";
import { readLocalJson, writeLocalJson } from "./storage";

export const DAILY_GAUNTLET_STORAGE_KEY = "devlearn_daily_gauntlet_v1";
export const DAILY_GAUNTLET_SECONDS = 180;

export type GauntletStageKind = "blitz" | "bug_spotter" | "detective";
export type GauntletRank = "S+" | "S" | "A" | "B" | "C";

export interface GauntletStage {
  id: string;
  stageNumber: number;
  kind: GauntletStageKind;
  kicker: string;
  accent: string;
  title: string;
  prompt: string;
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GauntletRankSummary {
  rank: GauntletRank;
  totalScore: number;
  timeBonus: number;
  xpReward: number;
  headline: string;
}

export interface DailyGauntletRecord {
  dateKey: string;
  runsToday: number;
  bestScore: number;
  bestRank: GauntletRank | null;
  bestCorrect: number;
  xpClaimedToday: number;
}

function hashSeed(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 1;
}

function createSeededRng(seedStr: string): () => number {
  let s = hashSeed(seedStr);
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithAnswer(
  options: readonly string[],
  correctIndex: number,
  rng: () => number,
): { options: string[]; correctIndex: number } {
  const tagged = options.map((opt, idx) => ({
    opt,
    isCorrect: idx === correctIndex,
  }));
  for (let i = tagged.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = tagged[i];
    tagged[i] = tagged[j];
    tagged[j] = tmp;
  }
  return {
    options: tagged.map((t) => t.opt),
    correctIndex: Math.max(
      0,
      tagged.findIndex((t) => t.isCorrect),
    ),
  };
}

function pickDistinct<T>(
  pool: readonly T[],
  count: number,
  rng: () => number,
): T[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/**
 * Builds a deterministic 5-stage Daily Arcade Gauntlet for a given YYYY-MM-DD dateKey:
 *   Stages 1–3: Speed Blitz rapid syntax/trap cards
 *   Stage 4   : Bug Spotter incident root-cause diagnosis
 *   Stage 5   : Output Detective boss trace finale
 */
export function buildDailyGauntletRun(
  dateKey: string = getDailyDateKey(),
  isPremium = false,
): GauntletStage[] {
  const rng = createSeededRng(`gauntlet_v1_${dateKey}_${isPremium ? "pro" : "free"}`);

  const blitzPool = isPremium
    ? BLITZ_CARDS
    : BLITZ_CARDS.filter((c) => c.deck === "python_basics");
  const pickedBlitz = pickDistinct(blitzPool, 3, rng);

  const stages: GauntletStage[] = pickedBlitz.map((card, idx) => {
    const shuffled = shuffleWithAnswer(card.options, card.correctIndex, rng);
    return {
      id: `g_blitz_${card.id}`,
      stageNumber: idx + 1,
      kind: "blitz",
      kicker: `STAGE ${idx + 1}/5 · SPEED BLITZ (${card.tag})`,
      accent: StudioColors.lime,
      title: `Syntax Sprint #${idx + 1}`,
      prompt: card.prompt,
      code: card.codeTemplate,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: card.explanation,
    };
  });

  // Stage 4: Bug Spotter Diagnosis
  const bugPool = isPremium
    ? BUG_INCIDENTS
    : BUG_INCIDENTS.filter((b) => b.track === "python_basics");
  const [targetBug] = pickDistinct(bugPool, 1, rng);
  if (targetBug) {
    const distractorHints = pickDistinct(
      BUG_INCIDENTS.filter(
        (b) => b.id !== targetBug.id && b.rootCauseHint !== targetBug.rootCauseHint,
      ),
      3,
      rng,
    ).map((b) => b.rootCauseHint);
    const rawOpts = [targetBug.rootCauseHint, ...distractorHints].slice(0, 4);
    const shuffledBug = shuffleWithAnswer(rawOpts, 0, rng);
    stages.push({
      id: `g_bug_${targetBug.id}`,
      stageNumber: 4,
      kind: "bug_spotter",
      kicker: `STAGE 4/5 · BUG SPOTTER (${targetBug.difficulty.toUpperCase()})`,
      accent: StudioColors.coral,
      title: targetBug.title,
      prompt: `Symptom: ${targetBug.symptom} Which patch fixes the bug?`,
      code: targetBug.buggyCode,
      options: shuffledBug.options,
      correctIndex: shuffledBug.correctIndex,
      explanation: targetBug.rootCauseHint,
    });
  }

  // Stage 5: Output Detective Finale
  const detPool = DETECTIVE_CASES.filter((c) => !c.isPro || isPremium);
  const [targetDet] = pickDistinct(detPool, 1, rng);
  if (targetDet) {
    const shuffledDet = shuffleWithAnswer(
      targetDet.options,
      targetDet.correctIndex,
      rng,
    );
    stages.push({
      id: `g_det_${targetDet.id}`,
      stageNumber: 5,
      kind: "detective",
      kicker: `STAGE 5/5 · OUTPUT DETECTIVE (${targetDet.category})`,
      accent: "#38BDF8",
      title: targetDet.title,
      prompt: targetDet.question,
      code: targetDet.code,
      options: shuffledDet.options,
      correctIndex: shuffledDet.correctIndex,
      explanation: targetDet.traceSteps.join(" "),
    });
  }

  return stages;
}

export function computeGauntletStagePoints(
  correct: boolean,
  comboAfterPick: number,
): number {
  if (!correct) return 0;
  const multiplier = 1 + Math.max(0, comboAfterPick - 1) * 0.25;
  return Math.round(200 * multiplier);
}

export function evaluateDailyGauntletRank(
  stagePoints: number,
  correctCount: number,
  totalStages: number,
  timeLeftSec: number,
): GauntletRankSummary {
  const safeTime = Math.max(0, Math.min(DAILY_GAUNTLET_SECONDS, Math.floor(timeLeftSec)));
  const timeBonus = correctCount >= 3 ? safeTime * 3 : 0;
  const totalScore = stagePoints + timeBonus;

  if (correctCount >= totalStages && safeTime >= 90) {
    return {
      rank: "S+",
      totalScore,
      timeBonus,
      xpReward: 110,
      headline: "FLAWLESS SPEEDRUN · GRANDMASTER S+!",
    };
  }
  if (correctCount >= totalStages) {
    return {
      rank: "S",
      totalScore,
      timeBonus,
      xpReward: 95,
      headline: "PERFECT 5/5 CLEAR · S-RANK!",
    };
  }
  if (correctCount === totalStages - 1) {
    return {
      rank: "A",
      totalScore,
      timeBonus,
      xpReward: 75,
      headline: "SHARP GAUNTLET RUN · A-RANK!",
    };
  }
  if (correctCount >= Math.ceil(totalStages * 0.6)) {
    return {
      rank: "B",
      totalScore,
      timeBonus,
      xpReward: 55,
      headline: "SOLID DAILY COMBO · B-RANK!",
    };
  }
  return {
    rank: "C",
    totalScore,
    timeBonus,
    xpReward: 30,
    headline: "GAUNTLET COMPLETE · REPLAY FOR S+!",
  };
}

const RANK_WEIGHT: Record<GauntletRank, number> = {
  C: 1,
  B: 2,
  A: 3,
  S: 4,
  "S+": 5,
};

export function getDailyGauntletRecord(
  todayKey: string = getDailyDateKey(),
): DailyGauntletRecord {
  const raw = readLocalJson<Partial<DailyGauntletRecord> | null>(
    DAILY_GAUNTLET_STORAGE_KEY,
    null,
  );
  if (!raw || raw.dateKey !== todayKey) {
    return {
      dateKey: todayKey,
      runsToday: 0,
      bestScore: 0,
      bestRank: null,
      bestCorrect: 0,
      xpClaimedToday: 0,
    };
  }
  return {
    dateKey: todayKey,
    runsToday: Math.max(0, Math.floor(Number(raw.runsToday) || 0)),
    bestScore: Math.max(0, Math.floor(Number(raw.bestScore) || 0)),
    bestRank:
      raw.bestRank && raw.bestRank in RANK_WEIGHT ? raw.bestRank : null,
    bestCorrect: Math.max(0, Math.floor(Number(raw.bestCorrect) || 0)),
    xpClaimedToday: Math.max(0, Math.floor(Number(raw.xpClaimedToday) || 0)),
  };
}

export function recordDailyGauntletFinish(
  todayKey: string,
  summary: GauntletRankSummary,
  correctCount: number,
): { record: DailyGauntletRecord; newlyAwardedXp: number } {
  const prev = getDailyGauntletRecord(todayKey);
  const newlyAwardedXp = Math.max(0, summary.xpReward - prev.xpClaimedToday);
  const nextRank =
    !prev.bestRank || RANK_WEIGHT[summary.rank] >= RANK_WEIGHT[prev.bestRank]
      ? summary.rank
      : prev.bestRank;

  const updated: DailyGauntletRecord = {
    dateKey: todayKey,
    runsToday: prev.runsToday + 1,
    bestScore: Math.max(prev.bestScore, summary.totalScore),
    bestRank: nextRank,
    bestCorrect: Math.max(prev.bestCorrect, correctCount),
    xpClaimedToday: Math.max(prev.xpClaimedToday, summary.xpReward),
  };
  writeLocalJson(DAILY_GAUNTLET_STORAGE_KEY, updated);
  return { record: updated, newlyAwardedXp };
}

export function resetDailyGauntletForTesting(): void {
  writeLocalJson(DAILY_GAUNTLET_STORAGE_KEY, null);
}
