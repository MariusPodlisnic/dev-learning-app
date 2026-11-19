import { getTodayDateKey } from "../constants/streaks";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export const DAILY_QUEST_BONUS_XP = 75;
export const STORAGE_DAILY_QUEST_KEY = "devlearn_daily_quest_v1";

export type DailyQuestStepId = "lesson" | "bughunt" | "blitz";

export interface DailyQuestStepMeta {
  id: DailyQuestStepId;
  orderLabel: string;
  title: string;
  actionLabel: string;
  icon: "nav_studio" | "nav_bughunt" | "nav_blitz";
}

export interface DailyQuestState {
  dateKey: string;
  steps: Record<DailyQuestStepId, boolean>;
  claimed: boolean;
}

export const DAILY_QUEST_STEPS: readonly DailyQuestStepMeta[] = [
  {
    id: "lesson",
    orderLabel: "01",
    title: "Clear 1 Lesson or Drill",
    actionLabel: "CODE →",
    icon: "nav_studio",
  },
  {
    id: "bughunt",
    orderLabel: "02",
    title: "Squash 1 Bug",
    actionLabel: "HUNT →",
    icon: "nav_bughunt",
  },
  {
    id: "blitz",
    orderLabel: "03",
    title: "Play 60s Blitz",
    actionLabel: "BLITZ →",
    icon: "nav_blitz",
  },
] as const;

export function createEmptyDailyQuest(
  dateKey: string = getTodayDateKey(),
): DailyQuestState {
  return {
    dateKey,
    steps: {
      lesson: false,
      bughunt: false,
      blitz: false,
    },
    claimed: false,
  };
}

export function normalizeDailyQuestState(
  raw: unknown,
  todayKey: string = getTodayDateKey(),
): DailyQuestState {
  if (!raw || typeof raw !== "object") {
    return createEmptyDailyQuest(todayKey);
  }
  const obj = raw as Partial<DailyQuestState>;
  if (obj.dateKey !== todayKey) {
    return createEmptyDailyQuest(todayKey);
  }
  const steps = obj.steps && typeof obj.steps === "object" ? obj.steps : ({} as any);
  return {
    dateKey: todayKey,
    steps: {
      lesson: Boolean(steps.lesson),
      bughunt: Boolean(steps.bughunt),
      blitz: Boolean(steps.blitz),
    },
    claimed: Boolean(obj.claimed),
  };
}

export function markDailyQuestStep(
  state: DailyQuestState,
  stepId: DailyQuestStepId,
  todayKey: string = getTodayDateKey(),
): DailyQuestState {
  if (state.dateKey === todayKey && state.steps[stepId]) {
    return state;
  }
  const normalized = normalizeDailyQuestState(state, todayKey);
  if (normalized.steps[stepId]) {
    return normalized;
  }
  return {
    ...normalized,
    steps: {
      ...normalized.steps,
      [stepId]: true,
    },
  };
}

export function getDailyQuestProgress(state: DailyQuestState): {
  completedCount: number;
  totalCount: number;
  allDone: boolean;
  canClaim: boolean;
} {
  const totalCount = DAILY_QUEST_STEPS.length;
  const completedCount = DAILY_QUEST_STEPS.filter(
    (step) => Boolean(state.steps[step.id]),
  ).length;
  const allDone = completedCount === totalCount;
  return {
    completedCount,
    totalCount,
    allDone,
    canClaim: allDone && !state.claimed,
  };
}

export function claimDailyQuestReward(
  state: DailyQuestState,
  todayKey: string = getTodayDateKey(),
): { nextState: DailyQuestState; awardedXp: number } {
  const normalized = normalizeDailyQuestState(state, todayKey);
  const { canClaim } = getDailyQuestProgress(normalized);
  if (!canClaim) {
    return { nextState: normalized, awardedXp: 0 };
  }
  return {
    nextState: {
      ...normalized,
      claimed: true,
    },
    awardedXp: DAILY_QUEST_BONUS_XP,
  };
}

// Singleton runtime store so Roadmap, Studio, Bug Hunt, and Blitz stay synced
let currentQuestState: DailyQuestState = normalizeDailyQuestState(
  readLocalJson<DailyQuestState | null>(STORAGE_DAILY_QUEST_KEY, null),
);
const questListeners = new Set<(state: DailyQuestState) => void>();

function notifyQuestListeners(): void {
  const snapshot = currentQuestState;
  questListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getDailyQuestState(): DailyQuestState {
  const todayKey = getTodayDateKey();
  if (currentQuestState.dateKey !== todayKey) {
    currentQuestState = createEmptyDailyQuest(todayKey);
    writeLocalJson(STORAGE_DAILY_QUEST_KEY, currentQuestState);
  }
  return currentQuestState;
}

export async function hydrateDailyQuestState(): Promise<DailyQuestState> {
  const todayKey = getTodayDateKey();
  const saved = await readLocalJsonAsync<DailyQuestState | null>(
    STORAGE_DAILY_QUEST_KEY,
    null,
  );
  const normalized = normalizeDailyQuestState(saved, todayKey);
  currentQuestState = normalized;
  notifyQuestListeners();
  return currentQuestState;
}

export function subscribeDailyQuest(
  listener: (state: DailyQuestState) => void,
): () => void {
  questListeners.add(listener);
  return () => {
    questListeners.delete(listener);
  };
}

export function recordDailyQuestStep(stepId: DailyQuestStepId): DailyQuestState {
  const todayKey = getTodayDateKey();
  const next = markDailyQuestStep(getDailyQuestState(), stepId, todayKey);
  if (next !== currentQuestState) {
    currentQuestState = next;
    writeLocalJson(STORAGE_DAILY_QUEST_KEY, currentQuestState);
    notifyQuestListeners();
  }
  return currentQuestState;
}

export function claimDailyQuestBonus(): number {
  const todayKey = getTodayDateKey();
  const { nextState, awardedXp } = claimDailyQuestReward(
    getDailyQuestState(),
    todayKey,
  );
  if (awardedXp > 0) {
    currentQuestState = nextState;
    writeLocalJson(STORAGE_DAILY_QUEST_KEY, currentQuestState);
    notifyQuestListeners();
  }
  return awardedXp;
}
