export interface DailySeedIncidentCandidate {
  id: string;
  track: string;
  timeLimitSec: number;
  baseXp: number;
}

export interface BlitzCardLike {
  id: string;
  deck: string;
  options: string[];
  correctIndex: number;
}

export function getDailyDateKey(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function hashSeedString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks a deterministic Daily Bug Hunt incident from accessible incidents so
 * free learners always receive an unlocked daily mission.
 */
export function pickDailyBugIncident<T extends DailySeedIncidentCandidate>(
  incidents: T[],
  dateKey: string,
  isPremium: boolean,
): T | null {
  const pool = isPremium
    ? incidents
    : incidents.filter((inc) => inc.track === "python_basics");
  if (pool.length === 0) return null;

  const idx = hashSeedString(`bughunt:${dateKey}`) % pool.length;
  return pool[idx];
}

/**
 * Produces a deterministic card and option permutation for Daily Seed blitz mode.
 */
export function buildSeededDeck<T extends BlitzCardLike>(
  cards: T[],
  seedStr: string,
): T[] {
  const rand = createMulberry32(hashSeedString(seedStr));
  const cloned = cards.map((card) => {
    const correctVal = card.options[card.correctIndex];
    const opts = [...card.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return {
      ...card,
      options: opts,
      correctIndex: opts.indexOf(correctVal),
    };
  });

  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export function getBugHuntTimeLimit(
  baseTimeLimitSec: number,
  hardMode: boolean,
): number {
  if (!hardMode) return baseTimeLimitSec;
  return Math.max(25, Math.round(baseTimeLimitSec * 0.55));
}

export function calculateBugHuntReward(params: {
  baseXp: number;
  timeLimitSec: number;
  secondsLeft: number;
  hardMode: boolean;
  isDailyChallenge: boolean;
  dailyAlreadyCompleted: boolean;
}): { totalXp: number; speedBonus: number; dailyBonus: number } {
  const {
    baseXp,
    timeLimitSec,
    secondsLeft,
    hardMode,
    isDailyChallenge,
    dailyAlreadyCompleted,
  } = params;

  const scaledBase = hardMode ? Math.round(baseXp * 1.5) : baseXp;
  const speedBonus =
    secondsLeft >= Math.floor(timeLimitSec * 0.5) ? (hardMode ? 40 : 25) : 0;
  const dailyBonus =
    isDailyChallenge && !dailyAlreadyCompleted && secondsLeft > 0 ? 40 : 0;

  const totalXp =
    secondsLeft > 0
      ? scaledBase + speedBonus + dailyBonus
      : Math.round(scaledBase * 0.5);

  return { totalXp, speedBonus, dailyBonus };
}

export function recordMistakeId(
  existingIds: string[],
  itemId: string,
  limit: number = 40,
): string[] {
  const filtered = existingIds.filter((id) => id !== itemId);
  return [itemId, ...filtered].slice(0, limit);
}

export function clearMistakeId(existingIds: string[], itemId: string): string[] {
  return existingIds.filter((id) => id !== itemId);
}

export function buildMistakeReviewDeck<T extends BlitzCardLike>(
  allCards: T[],
  mistakeIds: string[],
): T[] {
  const byId = new Map(allCards.map((c) => [c.id, c]));
  return mistakeIds
    .map((id) => byId.get(id))
    .filter((card): card is T => Boolean(card));
}
