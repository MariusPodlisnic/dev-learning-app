import { supabase } from "../../lib/supabase";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export type LeagueTierId = "spark" | "neon" | "arcade" | "grandmaster";

export interface LeagueTierMeta {
  id: LeagueTierId;
  name: string;
  badge: string;
  minWeeklyXp: number;
  maxWeeklyXp: number | null;
  accent: string;
  tagline: string;
}

export interface LeagueEntry {
  id: string;
  displayName: string;
  avatarLevel: number;
  weeklyXp: number;
  streakCount: number;
  isGhost: boolean;
  isCurrentUser: boolean;
  rank?: number;
}

export interface WeeklyLeagueLocalState {
  weekKey: string;
  baselineXp: number | null;
  weeklyXp: number;
  optedIn: boolean;
}

export const STORAGE_WEEKLY_LEAGUE_KEY = "devlearn_weekly_league_v1";

export const LEAGUE_TIERS: readonly LeagueTierMeta[] = [
  {
    id: "spark",
    name: "Spark League",
    badge: "⚡ SPARK",
    minWeeklyXp: 0,
    maxWeeklyXp: 249,
    accent: "#B8FF3B",
    tagline: "Warm up your coding rhythm & crack Top 3",
  },
  {
    id: "neon",
    name: "Neon League",
    badge: "🌟 NEON",
    minWeeklyXp: 250,
    maxWeeklyXp: 599,
    accent: "#38BDF8",
    tagline: "Consistent daily builders lighting up the studio",
  },
  {
    id: "arcade",
    name: "Arcade League",
    badge: "🕹️ ARCADE",
    minWeeklyXp: 600,
    maxWeeklyXp: 1199,
    accent: "#FF90E8",
    tagline: "High-combo sprinters & bug-hunting pros",
  },
  {
    id: "grandmaster",
    name: "Grandmaster",
    badge: "👑 GRANDMASTER",
    minWeeklyXp: 1200,
    maxWeeklyXp: null,
    accent: "#FFDE59",
    tagline: "Elite weekly architects of Devy Studio",
  },
] as const;

const GHOST_ROSTER: readonly {
  handle: string;
  level: number;
  streak: number;
  pct: number;
}[] = [
  { handle: "MochiDev", level: 4, streak: 9, pct: 0.96 },
  { handle: "PixelByte", level: 5, streak: 7, pct: 0.84 },
  { handle: "NekoLoops", level: 3, streak: 6, pct: 0.72 },
  { handle: "LofiLint", level: 6, streak: 11, pct: 0.61 },
  { handle: "AsyncCat", level: 3, streak: 5, pct: 0.5 },
  { handle: "HashSlinger", level: 4, streak: 4, pct: 0.39 },
  { handle: "PyCrafter", level: 2, streak: 3, pct: 0.28 },
  { handle: "KubeKitten", level: 5, streak: 8, pct: 0.19 },
  { handle: "TeaDebugger", level: 2, streak: 2, pct: 0.1 },
];

/** Returns an ISO 8601 UTC week key such as `"2026-W47"` (resets Mondays 00:00 UTC). */
export function getIsoWeekKey(date: Date = new Date()): string {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Returns whole days remaining until Monday 00:00 UTC reset (1..7). */
export function getDaysUntilWeekReset(date: Date = new Date()): number {
  const utcDay = date.getUTCDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const daysLeft = utcDay === 0 ? 1 : 8 - utcDay;
  return Math.max(1, Math.min(7, daysLeft));
}

export function getLeagueTierForWeeklyXp(weeklyXp: number): {
  current: LeagueTierMeta;
  next: LeagueTierMeta | null;
  progressPercent: number;
  xpToNextTier: number;
} {
  const safeXp = Math.max(0, Math.floor(weeklyXp));
  let idx = 0;
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i -= 1) {
    if (safeXp >= LEAGUE_TIERS[i].minWeeklyXp) {
      idx = i;
      break;
    }
  }
  const current = LEAGUE_TIERS[idx];
  const next = idx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[idx + 1] : null;
  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      xpToNextTier: 0,
    };
  }
  const span = Math.max(1, next.minWeeklyXp - current.minWeeklyXp);
  const into = Math.max(0, safeXp - current.minWeeklyXp);
  return {
    current,
    next,
    progressPercent: Math.min(100, Math.round((into / span) * 100)),
    xpToNextTier: Math.max(0, next.minWeeklyXp - safeXp),
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Generates deterministic weekly Cozy Ghost Rivals scaled to the active tier
 * so solo, guest, or early-community players always have motivating rivals.
 */
export function buildGhostRivals(
  weekKey: string,
  tierId: LeagueTierId,
): LeagueEntry[] {
  const tier =
    LEAGUE_TIERS.find((t) => t.id === tierId) || LEAGUE_TIERS[0];
  const floor = tier.minWeeklyXp;
  const ceiling =
    tier.maxWeeklyXp !== null ? tier.maxWeeklyXp + 30 : tier.minWeeklyXp + 750;
  const span = Math.max(120, ceiling - floor);

  return GHOST_ROSTER.map((bot, idx) => {
    const jitterSeed = hashString(`${weekKey}-${tierId}-${bot.handle}`);
    const jitter = ((jitterSeed % 11) - 5) * 5; // -25..+25 XP variance per week
    const rawXp = Math.round((floor + span * bot.pct + jitter) / 5) * 5;
    const weeklyXp = Math.max(floor + 15, rawXp);
    const levelOffset =
      tierId === "grandmaster"
        ? 4
        : tierId === "arcade"
          ? 2
          : tierId === "neon"
            ? 1
            : 0;
    return {
      id: `ghost-${idx + 1}-${bot.handle.toLowerCase()}`,
      displayName: bot.handle,
      avatarLevel: Math.min(10, Math.max(1, bot.level + levelOffset)),
      weeklyXp,
      streakCount: bot.streak + (jitterSeed % 4),
      isGhost: true,
      isCurrentUser: false,
    };
  });
}

export function buildLeagueStandings(params: {
  weekKey: string;
  currentUser: {
    id: string;
    displayName: string;
    avatarLevel: number;
    weeklyXp: number;
    streakCount: number;
  };
  liveEntries?: Omit<LeagueEntry, "isGhost" | "isCurrentUser" | "rank">[];
  maxRows?: number;
}): {
  tier: LeagueTierMeta;
  nextTier: LeagueTierMeta | null;
  progressPercent: number;
  xpToNextTier: number;
  standings: LeagueEntry[];
  myRank: number;
  rivalAhead: LeagueEntry | null;
  xpToPassRival: number;
  livePlayerCount: number;
} {
  const { weekKey, currentUser, liveEntries = [], maxRows = 10 } = params;
  const tierInfo = getLeagueTierForWeeklyXp(currentUser.weeklyXp);

  const byId = new Map<string, LeagueEntry>();

  // 1. Add real live players from Supabase first
  for (const row of liveEntries) {
    if (!row.id || row.id === currentUser.id) continue;
    byId.set(row.id, {
      id: row.id,
      displayName: row.displayName || "Devy Coder",
      avatarLevel: Math.min(10, Math.max(1, row.avatarLevel || 1)),
      weeklyXp: Math.max(0, Math.floor(row.weeklyXp || 0)),
      streakCount: Math.max(0, Math.floor(row.streakCount || 0)),
      isGhost: false,
      isCurrentUser: false,
    });
  }

  // 2. Always include the current user
  byId.set(currentUser.id, {
    id: currentUser.id,
    displayName: currentUser.displayName?.trim() || "You",
    avatarLevel: Math.min(10, Math.max(1, currentUser.avatarLevel || 1)),
    weeklyXp: Math.max(0, Math.floor(currentUser.weeklyXp || 0)),
    streakCount: Math.max(0, Math.floor(currentUser.streakCount || 0)),
    isGhost: false,
    isCurrentUser: true,
  });

  const livePlayerCount = Array.from(byId.values()).filter(
    (entry) => !entry.isGhost,
  ).length;

  // 3. Pad with deterministic Ghost Rivals up to maxRows so the board feels lively
  if (byId.size < maxRows) {
    const ghosts = buildGhostRivals(weekKey, tierInfo.current.id);
    for (const ghost of ghosts) {
      if (byId.size >= maxRows) break;
      byId.set(ghost.id, ghost);
    }
  }

  const sorted = Array.from(byId.values()).sort((a, b) => {
    if (b.weeklyXp !== a.weeklyXp) return b.weeklyXp - a.weeklyXp;
    if (b.streakCount !== a.streakCount) return b.streakCount - a.streakCount;
    if (a.isCurrentUser !== b.isCurrentUser) return a.isCurrentUser ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });

  // Ensure current user always appears in the visible slice
  let visible = sorted.slice(0, maxRows);
  const myGlobalIdx = sorted.findIndex((item) => item.isCurrentUser);
  if (myGlobalIdx >= maxRows) {
    visible = [...sorted.slice(0, maxRows - 1), sorted[myGlobalIdx]];
  }

  const standings: LeagueEntry[] = visible.map((entry, idx) => ({
    ...entry,
    rank:
      entry.isCurrentUser && myGlobalIdx >= maxRows
        ? myGlobalIdx + 1
        : idx + 1,
  }));

  const myRank = myGlobalIdx >= 0 ? myGlobalIdx + 1 : standings.length;
  const rivalAhead =
    myGlobalIdx > 0 ? { ...sorted[myGlobalIdx - 1], rank: myGlobalIdx } : null;
  const xpToPassRival = rivalAhead
    ? Math.max(1, rivalAhead.weeklyXp - currentUser.weeklyXp + 1)
    : 0;

  return {
    tier: tierInfo.current,
    nextTier: tierInfo.next,
    progressPercent: tierInfo.progressPercent,
    xpToNextTier: tierInfo.xpToNextTier,
    standings,
    myRank,
    rivalAhead,
    xpToPassRival,
    livePlayerCount,
  };
}

// ---------- Local Weekly XP & Opt-In Store ----------

function normalizeLocalState(
  raw: unknown,
  currentWeekKey: string,
): WeeklyLeagueLocalState {
  if (!raw || typeof raw !== "object") {
    return {
      weekKey: currentWeekKey,
      baselineXp: null,
      weeklyXp: 0,
      optedIn: false,
    };
  }
  const obj = raw as Partial<WeeklyLeagueLocalState>;
  const optedIn = Boolean(obj.optedIn);
  if (obj.weekKey !== currentWeekKey) {
    return {
      weekKey: currentWeekKey,
      baselineXp: null,
      weeklyXp: 0,
      optedIn,
    };
  }
  return {
    weekKey: currentWeekKey,
    baselineXp: typeof obj.baselineXp === "number" ? obj.baselineXp : null,
    weeklyXp:
      typeof obj.weeklyXp === "number" && obj.weeklyXp >= 0
        ? Math.floor(obj.weeklyXp)
        : 0,
    optedIn,
  };
}

let cachedLocal: WeeklyLeagueLocalState = normalizeLocalState(
  readLocalJson<WeeklyLeagueLocalState | null>(STORAGE_WEEKLY_LEAGUE_KEY, null),
  getIsoWeekKey(),
);

type WeeklyLeagueListener = (state: WeeklyLeagueLocalState) => void;
const listeners = new Set<WeeklyLeagueListener>();

function emitLocal(): void {
  const snap = { ...cachedLocal };
  listeners.forEach((listener) => {
    try {
      listener(snap);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getWeeklyLeagueLocalState(
  date: Date = new Date(),
): WeeklyLeagueLocalState {
  const weekKey = getIsoWeekKey(date);
  if (cachedLocal.weekKey !== weekKey) {
    cachedLocal = normalizeLocalState(cachedLocal, weekKey);
  }
  return { ...cachedLocal };
}

export function subscribeWeeklyLeague(
  listener: WeeklyLeagueListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function hydrateWeeklyLeagueLocalState(): Promise<WeeklyLeagueLocalState> {
  const weekKey = getIsoWeekKey();
  const saved = await readLocalJsonAsync<WeeklyLeagueLocalState | null>(
    STORAGE_WEEKLY_LEAGUE_KEY,
    cachedLocal,
  );
  cachedLocal = normalizeLocalState(saved, weekKey);
  emitLocal();
  return getWeeklyLeagueLocalState();
}

/**
 * Updates this week's earned XP cleanly from the user's running `totalXp`.
 * Resets automatically at the start of every new Monday ISO week.
 */
export function recordWeeklyXpSnapshot(
  totalXp: number,
  date: Date = new Date(),
): WeeklyLeagueLocalState {
  const weekKey = getIsoWeekKey(date);
  const safeTotal = Math.max(0, Math.floor(totalXp));
  const current =
    cachedLocal.weekKey === weekKey
      ? cachedLocal
      : normalizeLocalState(cachedLocal, weekKey);

  if (current.baselineXp === null) {
    // First snapshot of the week: seed baseline so brand-new gains count immediately
    // (if user starts fresh at 0 XP, baseline=0; if returning mid-week with existing XP, baseline=safeTotal)
    const next: WeeklyLeagueLocalState = {
      ...current,
      baselineXp: safeTotal,
      weeklyXp: current.weeklyXp,
    };
    cachedLocal = next;
    writeLocalJson(STORAGE_WEEKLY_LEAGUE_KEY, next);
    emitLocal();
    return { ...next };
  }

  const computedDelta = Math.max(0, safeTotal - current.baselineXp);
  const nextWeeklyXp = Math.max(current.weeklyXp, computedDelta);
  const nextBaseline =
    safeTotal < current.baselineXp ? safeTotal : current.baselineXp;

  if (
    nextWeeklyXp === current.weeklyXp &&
    nextBaseline === current.baselineXp
  ) {
    return { ...current };
  }

  const next: WeeklyLeagueLocalState = {
    ...current,
    baselineXp: nextBaseline,
    weeklyXp: nextWeeklyXp,
  };
  cachedLocal = next;
  writeLocalJson(STORAGE_WEEKLY_LEAGUE_KEY, next);
  emitLocal();
  return { ...next };
}

export function setWeeklyLeagueOptIn(optedIn: boolean): WeeklyLeagueLocalState {
  const current = getWeeklyLeagueLocalState();
  cachedLocal = {
    ...current,
    optedIn,
  };
  writeLocalJson(STORAGE_WEEKLY_LEAGUE_KEY, cachedLocal);
  emitLocal();
  return { ...cachedLocal };
}

export function resetWeeklyLeagueForTesting(
  weekKey: string = getIsoWeekKey(),
): void {
  cachedLocal = {
    weekKey,
    baselineXp: null,
    weeklyXp: 0,
    optedIn: false,
  };
  writeLocalJson(STORAGE_WEEKLY_LEAGUE_KEY, cachedLocal);
  emitLocal();
}

// ---------- Supabase Live Board Helpers (graceful fallback if SQL not yet run) ----------

let hasWeeklyLeagueTable = true;

function isMissingLeagueTableError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || "");
  const msg = String(err.message || err.details || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (msg.includes("weekly_league_entries") &&
      (msg.includes("does not exist") ||
        msg.includes("could not find") ||
        msg.includes("schema cache")))
  );
}

export async function fetchWeeklyLeagueEntries(weekKey: string): Promise<{
  entries: Omit<LeagueEntry, "isGhost" | "isCurrentUser" | "rank">[];
  liveAvailable: boolean;
}> {
  if (!hasWeeklyLeagueTable) {
    return { entries: [], liveAvailable: false };
  }
  try {
    const { data, error } = await supabase
      .from("weekly_league_entries")
      .select("user_id, display_name, avatar_level, weekly_xp, streak_count")
      .eq("week_key", weekKey)
      .order("weekly_xp", { ascending: false })
      .limit(25);

    if (error) {
      if (isMissingLeagueTableError(error)) {
        hasWeeklyLeagueTable = false;
      }
      return { entries: [], liveAvailable: false };
    }

    const entries = (data || []).map((row: any) => ({
      id: String(row.user_id),
      displayName: String(row.display_name || "Devy Coder"),
      avatarLevel: Number(row.avatar_level) || 1,
      weeklyXp: Number(row.weekly_xp) || 0,
      streakCount: Number(row.streak_count) || 0,
    }));
    return { entries, liveAvailable: true };
  } catch {
    return { entries: [], liveAvailable: false };
  }
}

export async function syncMyWeeklyLeagueEntry(params: {
  userId: string;
  displayName: string;
  avatarLevel: number;
  weeklyXp: number;
  streakCount: number;
  weekKey?: string;
}): Promise<boolean> {
  if (!hasWeeklyLeagueTable || !params.userId) return false;
  const weekKey = params.weekKey || getIsoWeekKey();
  try {
    const { error } = await supabase.from("weekly_league_entries").upsert(
      {
        week_key: weekKey,
        user_id: params.userId,
        display_name: params.displayName.trim() || "Devy Coder",
        avatar_level: Math.min(10, Math.max(1, params.avatarLevel || 1)),
        weekly_xp: Math.max(0, Math.floor(params.weeklyXp || 0)),
        streak_count: Math.max(0, Math.floor(params.streakCount || 0)),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "week_key,user_id" },
    );

    if (error) {
      if (isMissingLeagueTableError(error)) {
        hasWeeklyLeagueTable = false;
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function leaveWeeklyLeague(
  userId: string,
  weekKey: string = getIsoWeekKey(),
): Promise<boolean> {
  if (!hasWeeklyLeagueTable || !userId) return false;
  try {
    const { error } = await supabase
      .from("weekly_league_entries")
      .delete()
      .eq("week_key", weekKey)
      .eq("user_id", userId);
    if (error) {
      if (isMissingLeagueTableError(error)) {
        hasWeeklyLeagueTable = false;
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
