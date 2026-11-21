import type { StudioPaletteId } from "../constants/theme";
import { readLocalJson, writeLocalJson } from "./storage";

export const STORAGE_ACTIVITY_HEATMAP_KEY = "devlearn_activity_heatmap_v1";
export const DEFAULT_HEATMAP_WEEKS = 12;
const MAX_STORED_DAYS = 140;

export type ActivityHeatmapMap = Record<string, number>;
export type HeatmapIntensityLevel = 0 | 1 | 2 | 3 | 4;

export interface PixelGardenCell {
  dateKey: string;
  count: number;
  level: HeatmapIntensityLevel;
  isToday: boolean;
  isFuture: boolean;
  dayOfWeek: number; // 0 = Mon .. 6 = Sun
  shortDateLabel: string;
}

export interface PixelGardenWeekColumn {
  weekIndex: number;
  monthLabel: string;
  cells: PixelGardenCell[];
}

export interface PixelGardenSummary {
  weeks: PixelGardenWeekColumn[];
  totalActions: number;
  activeDays: number;
  bestDayCount: number;
  currentGardenStreak: number;
  bloomStageLabel: string;
  todayCount: number;
}

const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const DAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

type HeatmapListener = (map: ActivityHeatmapMap) => void;
const listeners = new Set<HeatmapListener>();

export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseLocalDateKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const dt = new Date(year, month, day, 12, 0, 0, 0);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month ||
    dt.getDate() !== day
  ) {
    return null;
  }
  return dt;
}

function addDaysLocal(base: Date, deltaDays: number): Date {
  const next = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + deltaDays,
    12,
    0,
    0,
    0,
  );
  return next;
}

function getMondayBasedDayIndex(date: Date): number {
  // JS getDay(): 0 = Sun, 1 = Mon .. 6 = Sat -> convert to 0 = Mon .. 6 = Sun
  return (date.getDay() + 6) % 7;
}

export function getHeatmapLevel(count: number): HeatmapIntensityLevel {
  if (!Number.isFinite(count) || count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function getHeatmapLevelLabel(level: HeatmapIntensityLevel): string {
  switch (level) {
    case 0:
      return "RESTING SOIL";
    case 1:
      return "TINY SPROUT";
    case 2:
      return "COZY BLOOM";
    case 3:
      return "LUSH GARDEN";
    case 4:
      return "GOLDEN HARVEST";
  }
}

export function sanitizeActivityMap(raw: unknown): ActivityHeatmapMap {
  if (!raw || typeof raw !== "object") return {};
  const out: ActivityHeatmapMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!parseLocalDateKey(k)) continue;
    const count = Math.max(0, Math.min(999, Math.floor(Number(v) || 0)));
    if (count > 0) {
      out[k] = count;
    }
  }
  return out;
}

function pruneOldEntries(
  map: ActivityHeatmapMap,
  now: Date = new Date(),
): ActivityHeatmapMap {
  const cutoffKey = toLocalDateKey(addDaysLocal(now, -MAX_STORED_DAYS));
  const next: ActivityHeatmapMap = {};
  for (const [k, v] of Object.entries(map)) {
    if (k >= cutoffKey && v > 0) {
      next[k] = v;
    }
  }
  return next;
}

function emit(map: ActivityHeatmapMap) {
  listeners.forEach((fn) => fn(map));
}

export function getActivityHeatmapMap(): ActivityHeatmapMap {
  const raw = readLocalJson<Record<string, number>>(
    STORAGE_ACTIVITY_HEATMAP_KEY,
    {},
  );
  return sanitizeActivityMap(raw);
}

export function subscribeActivityHeatmap(
  listener: HeatmapListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function recordCodingActivity(
  amount = 1,
  now: Date = new Date(),
): ActivityHeatmapMap {
  const delta = Math.max(1, Math.min(25, Math.floor(amount) || 1));
  const key = toLocalDateKey(now);
  const current = getActivityHeatmapMap();
  const updated = pruneOldEntries(
    {
      ...current,
      [key]: Math.min(999, (current[key] || 0) + delta),
    },
    now,
  );
  writeLocalJson(STORAGE_ACTIVITY_HEATMAP_KEY, updated);
  emit(updated);
  return updated;
}

export function clearActivityHeatmapForTests(): void {
  writeLocalJson(STORAGE_ACTIVITY_HEATMAP_KEY, {});
  emit({});
}

/**
 * For returning learners who already built a streak before 4J shipped,
 * reflects their active streak tail cleanly in the garden without overwriting
 * any real recorded daily counts.
 */
export function mergeStreakBaselineIntoHeatmap(
  map: ActivityHeatmapMap,
  streakCount: number,
  lastActiveDate?: string | null,
  now: Date = new Date(),
): ActivityHeatmapMap {
  const merged: ActivityHeatmapMap = { ...map };
  const safeStreak = Math.max(0, Math.min(84, Math.floor(streakCount || 0)));
  if (safeStreak === 0) return merged;

  const anchor =
    (lastActiveDate && parseLocalDateKey(lastActiveDate)) ||
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);

  for (let i = 0; i < safeStreak; i += 1) {
    const key = toLocalDateKey(addDaysLocal(anchor, -i));
    if (!merged[key]) {
      merged[key] = 1;
    }
  }
  return merged;
}

export function buildPixelGardenGrid(
  map: ActivityHeatmapMap,
  weeks: number = DEFAULT_HEATMAP_WEEKS,
  now: Date = new Date(),
): PixelGardenSummary {
  const safeWeeks = Math.max(4, Math.min(24, Math.floor(weeks) || 12));
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0,
    0,
  );
  const todayKey = toLocalDateKey(today);
  const todayDow = getMondayBasedDayIndex(today);
  const currentWeekMonday = addDaysLocal(today, -todayDow);
  const startMonday = addDaysLocal(currentWeekMonday, -(safeWeeks - 1) * 7);

  const columns: PixelGardenWeekColumn[] = [];
  let totalActions = 0;
  let activeDays = 0;
  let bestDayCount = 0;
  let lastMonthIndex = -1;

  for (let w = 0; w < safeWeeks; w += 1) {
    const weekStart = addDaysLocal(startMonday, w * 7);
    const monthIdx = weekStart.getMonth();
    const monthLabel =
      w === 0 || monthIdx !== lastMonthIndex ? MONTH_SHORT[monthIdx] : "";
    lastMonthIndex = monthIdx;

    const cells: PixelGardenCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const cellDate = addDaysLocal(weekStart, d);
      const dateKey = toLocalDateKey(cellDate);
      const isFuture = dateKey > todayKey;
      const isToday = dateKey === todayKey;
      const count = isFuture ? 0 : Math.max(0, map[dateKey] || 0);
      const level = getHeatmapLevel(count);

      if (!isFuture && count > 0) {
        totalActions += count;
        activeDays += 1;
        if (count > bestDayCount) bestDayCount = count;
      }

      const shortDateLabel = `${DAY_SHORT[d]}, ${MONTH_SHORT[cellDate.getMonth()]} ${cellDate.getDate()}`;
      cells.push({
        dateKey,
        count,
        level,
        isToday,
        isFuture,
        dayOfWeek: d,
        shortDateLabel,
      });
    }

    columns.push({
      weekIndex: w,
      monthLabel,
      cells,
    });
  }

  // Compute consecutive active days ending today (or yesterday if not yet coded today)
  let currentGardenStreak = 0;
  const startOffset = (map[todayKey] || 0) > 0 ? 0 : 1;
  for (let i = startOffset; i < safeWeeks * 7; i += 1) {
    const key = toLocalDateKey(addDaysLocal(today, -i));
    if ((map[key] || 0) > 0) {
      currentGardenStreak += 1;
    } else {
      break;
    }
  }

  const bloomStageLabel =
    activeDays >= 40
      ? "COZY FOREST"
      : activeDays >= 18
        ? "FULL BLOOM"
        : activeDays >= 6
          ? "SPROUTING"
          : activeDays >= 1
            ? "FIRST SEEDS"
            : "FRESH SOIL";

  return {
    weeks: columns,
    totalActions,
    activeDays,
    bestDayCount,
    currentGardenStreak,
    bloomStageLabel,
    todayCount: map[todayKey] || 0,
  };
}

export function getGardenTilePalette(
  isDark: boolean,
  paletteId: StudioPaletteId = "arcade",
): readonly [string, string, string, string, string] {
  if (paletteId === "sakura") {
    return isDark
      ? ["#261B2E", "#5C2D4F", "#A6447D", "#F472B6", "#FFDE59"]
      : ["#F2E6EE", "#F9C5DF", "#F48FC4", "#E05297", "#FFCE3B"];
  }
  if (paletteId === "amber") {
    return isDark
      ? ["#261E16", "#5E3F1E", "#A66A24", "#F59E0B", "#FEF08A"]
      : ["#F2E9DC", "#FDE68A", "#FBBF24", "#D97706", "#10B981"];
  }
  if (paletteId === "matcha") {
    return isDark
      ? ["#1D261F", "#2D4D36", "#467D52", "#74B87E", "#FFDE59"]
      : ["#E8EFE6", "#C3DFC2", "#86BC86", "#4D8B55", "#F5B82E"];
  }
  // Default Cozy Arcade palette
  return isDark
    ? ["#231B30", "#2A5949", "#3B9473", "#6EE7B7", "#FFDE59"]
    : ["#EAE5F2", "#BEEFD8", "#6EE7B7", "#22B573", "#FFB703"];
}
