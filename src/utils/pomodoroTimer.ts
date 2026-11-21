import { getTodayDateKey } from "../constants/streaks";
import { playSuccessChime, playVictoryFanfare } from "./soundEffects";
import { readLocalJson, writeLocalJson } from "./storage";

export type PomodoroPresetId = "focus" | "sprint" | "break";

export interface PomodoroPresetMeta {
  id: PomodoroPresetId;
  label: string;
  shortLabel: string;
  durationSec: number;
  rewardXp: number;
  accent: string;
  isBreak: boolean;
}

export interface PomodoroState {
  presetId: PomodoroPresetId;
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  completedToday: number;
  dateKey: string;
}

export interface PomodoroCompletionEvent {
  presetId: PomodoroPresetId;
  rewardXp: number;
  completedToday: number;
  nextPresetId: PomodoroPresetId;
}

export const STORAGE_POMODORO_KEY = "devlearn_pomodoro_v1";

export const POMODORO_PRESETS: readonly PomodoroPresetMeta[] = [
  {
    id: "focus",
    label: "25m Focus",
    shortLabel: "25m",
    durationSec: 25 * 60,
    rewardXp: 35,
    accent: "#6EE7B7",
    isBreak: false,
  },
  {
    id: "sprint",
    label: "15m Sprint",
    shortLabel: "15m",
    durationSec: 15 * 60,
    rewardXp: 20,
    accent: "#FFDE59",
    isBreak: false,
  },
  {
    id: "break",
    label: "5m Tea Break",
    shortLabel: "5m TEA",
    durationSec: 5 * 60,
    rewardXp: 0,
    accent: "#FF90E8",
    isBreak: true,
  },
] as const;

interface PersistedPomodoro {
  dateKey?: string;
  completedToday?: number;
  lastFocusPreset?: "focus" | "sprint";
}

function getPresetMetaInternal(id: PomodoroPresetId): PomodoroPresetMeta {
  return POMODORO_PRESETS.find((p) => p.id === id) || POMODORO_PRESETS[0];
}

function loadInitialPersisted(): {
  dateKey: string;
  completedToday: number;
  lastFocusPreset: "focus" | "sprint";
} {
  const today = getTodayDateKey();
  const saved = readLocalJson<PersistedPomodoro>(STORAGE_POMODORO_KEY, {});
  const lastFocusPreset: "focus" | "sprint" =
    saved.lastFocusPreset === "sprint" ? "sprint" : "focus";
  const completedToday =
    saved.dateKey === today &&
    typeof saved.completedToday === "number" &&
    saved.completedToday > 0
      ? Math.floor(saved.completedToday)
      : 0;
  return { dateKey: today, completedToday, lastFocusPreset };
}

const initialPersisted = loadInitialPersisted();

let presetId: PomodoroPresetId = initialPersisted.lastFocusPreset;
let lastFocusPreset: "focus" | "sprint" = initialPersisted.lastFocusPreset;
let isRunning = false;
let totalSeconds = getPresetMetaInternal(presetId).durationSec;
let remainingSeconds = totalSeconds;
let completedToday = initialPersisted.completedToday;
let dateKey = initialPersisted.dateKey;
let tickTimer: ReturnType<typeof setInterval> | null = null;

const stateListeners = new Set<(state: PomodoroState) => void>();
const completionListeners = new Set<(event: PomodoroCompletionEvent) => void>();

function refreshDayBucket(): void {
  const today = getTodayDateKey();
  if (dateKey !== today) {
    dateKey = today;
    completedToday = 0;
    persistSummary();
  }
}

function persistSummary(): void {
  writeLocalJson(STORAGE_POMODORO_KEY, {
    dateKey,
    completedToday,
    lastFocusPreset,
  });
}

function getState(): PomodoroState {
  refreshDayBucket();
  return {
    presetId,
    isRunning,
    remainingSeconds,
    totalSeconds,
    completedToday,
    dateKey,
  };
}

function notifyState(): void {
  const snap = getState();
  stateListeners.forEach((listener) => {
    try {
      listener(snap);
    } catch {
      // Ignore subscriber errors
    }
  });
}

function notifyCompletion(event: PomodoroCompletionEvent): void {
  completionListeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // Ignore subscriber errors
    }
  });
}

function stopInterval(): void {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function handleBlockComplete(): void {
  stopInterval();
  isRunning = false;
  refreshDayBucket();

  const finishedMeta = getPresetMetaInternal(presetId);
  const rewardXp = finishedMeta.rewardXp;
  if (!finishedMeta.isBreak) {
    completedToday += 1;
    persistSummary();
    playVictoryFanfare();
  } else {
    playSuccessChime();
  }

  const nextPresetId: PomodoroPresetId = finishedMeta.isBreak
    ? lastFocusPreset
    : "break";
  const nextMeta = getPresetMetaInternal(nextPresetId);

  const event: PomodoroCompletionEvent = {
    presetId,
    rewardXp,
    completedToday,
    nextPresetId,
  };

  presetId = nextPresetId;
  totalSeconds = nextMeta.durationSec;
  remainingSeconds = nextMeta.durationSec;

  notifyCompletion(event);
  notifyState();
}

function ensureInterval(): void {
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    if (!isRunning) {
      stopInterval();
      return;
    }
    if (remainingSeconds <= 1) {
      remainingSeconds = 0;
      handleBlockComplete();
      return;
    }
    remainingSeconds -= 1;
    notifyState();
  }, 1000);
}

export function formatPomodoroClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function getPomodoroPresetMeta(
  id: PomodoroPresetId = presetId,
): PomodoroPresetMeta {
  return getPresetMetaInternal(id);
}

export function getPomodoroState(): PomodoroState {
  return getState();
}

export function subscribePomodoro(
  listener: (state: PomodoroState) => void,
): () => void {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

export function subscribePomodoroComplete(
  listener: (event: PomodoroCompletionEvent) => void,
): () => void {
  completionListeners.add(listener);
  return () => {
    completionListeners.delete(listener);
  };
}

export function startPomodoro(): PomodoroState {
  refreshDayBucket();
  if (remainingSeconds <= 0) {
    remainingSeconds = totalSeconds;
  }
  isRunning = true;
  ensureInterval();
  notifyState();
  return getState();
}

export function pausePomodoro(): PomodoroState {
  isRunning = false;
  stopInterval();
  notifyState();
  return getState();
}

export function togglePomodoro(): PomodoroState {
  return isRunning ? pausePomodoro() : startPomodoro();
}

export function resetPomodoro(): PomodoroState {
  isRunning = false;
  stopInterval();
  const meta = getPresetMetaInternal(presetId);
  totalSeconds = meta.durationSec;
  remainingSeconds = meta.durationSec;
  notifyState();
  return getState();
}

export function selectPomodoroPreset(
  nextPreset: PomodoroPresetId,
): PomodoroState {
  const meta = getPresetMetaInternal(nextPreset);
  isRunning = false;
  stopInterval();
  presetId = meta.id;
  if (!meta.isBreak) {
    lastFocusPreset = meta.id === "sprint" ? "sprint" : "focus";
    persistSummary();
  }
  totalSeconds = meta.durationSec;
  remainingSeconds = meta.durationSec;
  notifyState();
  return getState();
}

export function completeCurrentPomodoroForTesting(): PomodoroState {
  handleBlockComplete();
  return getState();
}

export function resetPomodoroForTesting(): void {
  stopInterval();
  isRunning = false;
  presetId = "focus";
  lastFocusPreset = "focus";
  totalSeconds = getPresetMetaInternal("focus").durationSec;
  remainingSeconds = totalSeconds;
  dateKey = getTodayDateKey();
  completedToday = 0;
  persistSummary();
  notifyState();
}
