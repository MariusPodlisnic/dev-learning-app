import { supabase } from "../../lib/supabase";
import { Lesson } from "../types/lesson";

export interface CloudProgressState {
  completedLessons: Record<string, boolean>;
  completedChallenges: Record<string, boolean>;
  peekedSolutions: Record<string, boolean>;
  solvedIncidents: Record<string, boolean>;
  claimedChapters: Record<string, boolean>;
  claimedStreakMilestones: Record<number, boolean>;
  streakShields: number;
  dailyCompletedDate: string | null;
  lastActiveDate: string | null;
  xpPoints: number;
  streakCount: number;
  activeTrack: string;
  lastLessonId?: string;
  themeMode?: "light" | "dark";
  codeDrafts: Record<string, string>;
  draftsVersion?: number;
  updatedAt: string;
}

export type CurriculumProgressItemType =
  | "lesson"
  | "stage"
  | "bug_incident"
  | "chapter";

export interface CurriculumProgressDeltaItem {
  itemKey: string;
  itemType: CurriculumProgressItemType;
  lessonId?: string;
  completed?: boolean;
  peekedSolution?: boolean;
  stars?: number;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value?: string | null): boolean {
  return Boolean(value && UUID_REGEX.test(value));
}

/**
 * Runtime schema capability cache so older Supabase schemas work gracefully
 * before running the SQL migration (and newer ones sync everything automatically).
 */
const schemaCapabilities = {
  hasProgressStateColumn: true,
  hasCurriculumProgressTable: true,
};

function isMissingColumnError(err: any, columnName: string): boolean {
  if (!err) return false;
  const code = String(err.code || "");
  const msg = String(err.message || err.details || "").toLowerCase();
  return (
    code === "42703" ||
    code === "PGRST204" ||
    (msg.includes(columnName.toLowerCase()) &&
      (msg.includes("does not exist") || msg.includes("could not find")))
  );
}

function isMissingTableError(err: any, tableName: string): boolean {
  if (!err) return false;
  const code = String(err.code || "");
  const msg = String(err.message || err.details || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (msg.includes(tableName.toLowerCase()) &&
      (msg.includes("does not exist") ||
        msg.includes("could not find") ||
        msg.includes("schema cache")))
  );
}

function deriveLegacyExpSlug(lesson: {
  track: string;
  lesson_order: number;
}): string {
  const prefix =
    lesson.track === "python_basics"
      ? "py"
      : lesson.track === "algorithms"
        ? "alg"
        : "sys";
  return `exp-${prefix}-${String(lesson.lesson_order).padStart(2, "0")}`;
}

/**
 * Remaps any locally stored `exp-*` or `track:order` keys onto the active
 * lesson IDs returned by `mergeCurriculumLessons` (for example, if a previously
 * local expansion lesson is later inserted into Supabase `public.lessons` with a UUID).
 */
export function remapProgressKeysForLessons(
  lessons: Lesson[],
  state: CloudProgressState,
): CloudProgressState {
  if (!lessons.length) return state;

  const aliasToLessonId = new Map<string, string>();
  for (const l of lessons) {
    const legacySlug = deriveLegacyExpSlug(l);
    if (l.slug && l.slug !== l.id) {
      aliasToLessonId.set(l.slug, l.id);
    }
    if (legacySlug !== l.id) {
      aliasToLessonId.set(legacySlug, l.id);
    }
    const trackOrderKey = `${l.track}:${l.lesson_order}`;
    if (trackOrderKey !== l.id) {
      aliasToLessonId.set(trackOrderKey, l.id);
    }
  }

  if (aliasToLessonId.size === 0) return state;

  let changed = false;
  const nextCompletedLessons = { ...state.completedLessons };
  const nextPeekedSolutions = { ...state.peekedSolutions };
  const nextCompletedChallenges = { ...state.completedChallenges };
  const nextDrafts = { ...state.codeDrafts };

  for (const [alias, targetId] of aliasToLessonId.entries()) {
    if (nextCompletedLessons[alias] && !nextCompletedLessons[targetId]) {
      nextCompletedLessons[targetId] = true;
      changed = true;
    }
    if (nextPeekedSolutions[alias] && !nextPeekedSolutions[targetId]) {
      nextPeekedSolutions[targetId] = true;
      changed = true;
    }
    const stageSuffixes = ["::core", "#0", "::stage_1", "::stage_2", "::stage_3"];
    for (const suffix of stageSuffixes) {
      const oldKey = `${alias}${suffix}`;
      const newKey = `${targetId}${suffix}`;
      if (nextCompletedChallenges[oldKey] && !nextCompletedChallenges[newKey]) {
        nextCompletedChallenges[newKey] = true;
        changed = true;
      }
    }
    if (
      nextDrafts[alias] !== undefined &&
      nextDrafts[targetId] === undefined
    ) {
      nextDrafts[targetId] = nextDrafts[alias];
      changed = true;
    }
  }

  const nextLastLessonId =
    state.lastLessonId && aliasToLessonId.has(state.lastLessonId)
      ? aliasToLessonId.get(state.lastLessonId)
      : state.lastLessonId;
  if (nextLastLessonId !== state.lastLessonId) changed = true;

  if (!changed) return state;

  return {
    ...state,
    completedLessons: nextCompletedLessons,
    completedChallenges: nextCompletedChallenges,
    peekedSolutions: nextPeekedSolutions,
    codeDrafts: nextDrafts,
    lastLessonId: nextLastLessonId,
  };
}

function mergeBoolMaps(
  a?: Record<string, boolean>,
  b?: Record<string, boolean>,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (a) {
    for (const [k, v] of Object.entries(a)) {
      if (v) out[k] = true;
    }
  }
  if (b) {
    for (const [k, v] of Object.entries(b)) {
      if (v) out[k] = true;
    }
  }
  return out;
}

function mergeMilestoneMaps(
  a?: Record<number, boolean>,
  b?: Record<number, boolean>,
): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  if (a) {
    for (const [k, v] of Object.entries(a)) {
      if (v) out[Number(k)] = true;
    }
  }
  if (b) {
    for (const [k, v] of Object.entries(b)) {
      if (v) out[Number(k)] = true;
    }
  }
  return out;
}

export function mergeCloudAndLocalState(
  cloudState: Partial<CloudProgressState> | null | undefined,
  localState: CloudProgressState,
  legacyCloudLessons: Record<string, boolean>,
  relationalRows: {
    item_key: string;
    item_type: string;
    lesson_id?: string | null;
    completed?: boolean | null;
    peeked_solution?: boolean | null;
  }[],
): {
  merged: CloudProgressState;
  needsCloudBackfill: boolean;
} {
  const relLessons: Record<string, boolean> = {};
  const relStages: Record<string, boolean> = {};
  const relIncidents: Record<string, boolean> = {};
  const relChapters: Record<string, boolean> = {};
  const relPeeked: Record<string, boolean> = {};

  for (const row of relationalRows) {
    if (row.item_type === "lesson") {
      if (row.completed) relLessons[row.item_key] = true;
      if (row.peeked_solution) relPeeked[row.item_key] = true;
    } else if (row.item_type === "stage") {
      if (row.completed) relStages[row.item_key] = true;
    } else if (row.item_type === "bug_incident") {
      if (row.completed) relIncidents[row.item_key] = true;
    } else if (row.item_type === "chapter") {
      if (row.completed) relChapters[row.item_key] = true;
    }
  }

  const c = cloudState || {};
  const cloudTime = c.updatedAt ? Date.parse(c.updatedAt) || 0 : 0;
  const localTime = localState.updatedAt
    ? Date.parse(localState.updatedAt) || 0
    : 0;
  const localIsNewer = localTime > cloudTime;

  const mergedCompletedLessons = mergeBoolMaps(
    mergeBoolMaps(legacyCloudLessons, relLessons),
    mergeBoolMaps(c.completedLessons, localState.completedLessons),
  );
  const mergedCompletedChallenges = mergeBoolMaps(
    relStages,
    mergeBoolMaps(c.completedChallenges, localState.completedChallenges),
  );
  const mergedSolvedIncidents = mergeBoolMaps(
    relIncidents,
    mergeBoolMaps(c.solvedIncidents, localState.solvedIncidents),
  );
  const mergedClaimedChapters = mergeBoolMaps(
    relChapters,
    mergeBoolMaps(c.claimedChapters, localState.claimedChapters),
  );
  const mergedPeekedSolutions = mergeBoolMaps(
    relPeeked,
    mergeBoolMaps(c.peekedSolutions, localState.peekedSolutions),
  );
  // If a learner re-solved a completed module cleanly (without peeking) on the newer snapshot, honor that clear
  for (const lessonId of Object.keys(mergedCompletedLessons)) {
    if (!mergedCompletedLessons[lessonId]) continue;
    if (
      localIsNewer &&
      localState.completedLessons[lessonId] &&
      !localState.peekedSolutions[lessonId]
    ) {
      delete mergedPeekedSolutions[lessonId];
    } else if (
      !localIsNewer &&
      cloudTime > 0 &&
      c.completedLessons?.[lessonId] &&
      !c.peekedSolutions?.[lessonId]
    ) {
      delete mergedPeekedSolutions[lessonId];
    }
  }
  const mergedMilestones = mergeMilestoneMaps(
    c.claimedStreakMilestones,
    localState.claimedStreakMilestones,
  );

  const cloudXp = typeof c.xpPoints === "number" ? c.xpPoints : 0;
  const mergedXp = Math.max(cloudXp, localState.xpPoints || 0);

  const cloudLastActive = c.lastActiveDate || null;
  const localLastActive = localState.lastActiveDate || null;
  let mergedLastActive = localLastActive || cloudLastActive;
  let mergedStreak = Math.max(
    typeof c.streakCount === "number" ? c.streakCount : 0,
    localState.streakCount || 0,
  );
  if (cloudLastActive && localLastActive) {
    if (cloudLastActive > localLastActive) {
      mergedLastActive = cloudLastActive;
      mergedStreak =
        typeof c.streakCount === "number" ? c.streakCount : mergedStreak;
    } else if (localLastActive > cloudLastActive) {
      mergedLastActive = localLastActive;
      mergedStreak = localState.streakCount || mergedStreak;
    }
  }

  const cloudDaily = c.dailyCompletedDate || null;
  const localDaily = localState.dailyCompletedDate || null;
  const mergedDaily =
    cloudDaily && localDaily
      ? cloudDaily >= localDaily
        ? cloudDaily
        : localDaily
      : cloudDaily || localDaily;

  const mergedShields = localIsNewer
    ? localState.streakShields
    : typeof c.streakShields === "number"
      ? c.streakShields
      : localState.streakShields;

  const cloudDraftsMigrated = (c.draftsVersion ?? 1) >= 2;
  const effectiveCloudDrafts = cloudDraftsMigrated ? c.codeDrafts || {} : {};
  const mergedDrafts = localIsNewer
    ? { ...effectiveCloudDrafts, ...localState.codeDrafts }
    : { ...localState.codeDrafts, ...effectiveCloudDrafts };

  const merged: CloudProgressState = {
    completedLessons: mergedCompletedLessons,
    completedChallenges: mergedCompletedChallenges,
    peekedSolutions: mergedPeekedSolutions,
    solvedIncidents: mergedSolvedIncidents,
    claimedChapters: mergedClaimedChapters,
    claimedStreakMilestones: mergedMilestones,
    streakShields: mergedShields,
    dailyCompletedDate: mergedDaily,
    lastActiveDate: mergedLastActive,
    xpPoints: mergedXp,
    streakCount: mergedStreak,
    activeTrack: (localIsNewer
      ? localState.activeTrack || c.activeTrack
      : c.activeTrack || localState.activeTrack) || "python_basics",
    lastLessonId: localIsNewer
      ? localState.lastLessonId || c.lastLessonId
      : c.lastLessonId || localState.lastLessonId,
    themeMode: localIsNewer
      ? localState.themeMode || c.themeMode
      : c.themeMode || localState.themeMode,
    codeDrafts: mergedDrafts,
    draftsVersion: 2,
    updatedAt: new Date().toISOString(),
  };

  // Determine whether local had data not yet stored on cloud
  const cloudLessonKeys = { ...legacyCloudLessons, ...relLessons, ...(c.completedLessons || {}) };
  const cloudStageKeys = { ...relStages, ...(c.completedChallenges || {}) };
  const cloudBugKeys = { ...relIncidents, ...(c.solvedIncidents || {}) };
  const cloudChapKeys = { ...relChapters, ...(c.claimedChapters || {}) };

  const hasNewLocalItems =
    Object.keys(localState.completedLessons).some((k) => localState.completedLessons[k] && !cloudLessonKeys[k]) ||
    Object.keys(localState.completedChallenges).some((k) => localState.completedChallenges[k] && !cloudStageKeys[k]) ||
    Object.keys(localState.solvedIncidents).some((k) => localState.solvedIncidents[k] && !cloudBugKeys[k]) ||
    Object.keys(localState.claimedChapters).some((k) => localState.claimedChapters[k] && !cloudChapKeys[k]) ||
    mergedXp > cloudXp ||
    mergedStreak > (typeof c.streakCount === "number" ? c.streakCount : 0) ||
    !cloudDraftsMigrated ||
    !c.updatedAt;

  return { merged, needsCloudBackfill: hasNewLocalItems };
}

export function buildFullRelationalItems(
  state: CloudProgressState,
): CurriculumProgressDeltaItem[] {
  const items: CurriculumProgressDeltaItem[] = [];

  for (const [lessonId, done] of Object.entries(state.completedLessons)) {
    if (!done) continue;
    items.push({
      itemKey: lessonId,
      itemType: "lesson",
      lessonId,
      completed: true,
      peekedSolution: Boolean(state.peekedSolutions[lessonId]),
    });
  }

  // Also preserve peeked flag for in-progress lessons not fully solved yet
  for (const [lessonId, peeked] of Object.entries(state.peekedSolutions)) {
    if (!peeked || state.completedLessons[lessonId]) continue;
    items.push({
      itemKey: lessonId,
      itemType: "lesson",
      lessonId,
      completed: false,
      peekedSolution: true,
    });
  }

  for (const [stageKey, done] of Object.entries(state.completedChallenges)) {
    if (!done) continue;
    items.push({
      itemKey: stageKey,
      itemType: "stage",
      completed: true,
    });
  }

  for (const [bugId, done] of Object.entries(state.solvedIncidents)) {
    if (!done) continue;
    items.push({
      itemKey: bugId,
      itemType: "bug_incident",
      completed: true,
    });
  }

  for (const [chapterKey, claimed] of Object.entries(state.claimedChapters)) {
    if (!claimed) continue;
    items.push({
      itemKey: chapterKey,
      itemType: "chapter",
      completed: true,
    });
  }

  return items;
}

export async function pushCloudProgressState(params: {
  userId: string;
  userEmail?: string;
  state: CloudProgressState;
  deltaItems?: CurriculumProgressDeltaItem[];
  syncAllRelational?: boolean;
}): Promise<boolean> {
  const { userId, userEmail, state, deltaItems, syncAllRelational } = params;
  const nowIso = new Date().toISOString();

  try {
    // 1. Upsert profiles (+ progress_state JSONB snapshot if column exists)
    const baseProfile: Record<string, any> = {
      id: userId,
      email: userEmail,
      xp_points: state.xpPoints,
      streak_count: state.streakCount,
      last_completed_at: nowIso,
    };

    if (schemaCapabilities.hasProgressStateColumn) {
      const { error } = await supabase.from("profiles").upsert({
        ...baseProfile,
        progress_state: {
          ...state,
          updatedAt: nowIso,
        },
      });
      if (error) {
        if (isMissingColumnError(error, "progress_state")) {
          schemaCapabilities.hasProgressStateColumn = false;
          await supabase.from("profiles").upsert(baseProfile);
        } else {
          console.warn("Profile cloud sync warning:", error.message);
        }
      }
    } else {
      await supabase.from("profiles").upsert(baseProfile);
    }

    // 2. Upsert flexible relational rows (`user_curriculum_progress`) for all IDs (UUID, exp-*, stage, bug, chapter)
    const itemsToUpsert = syncAllRelational
      ? buildFullRelationalItems(state)
      : deltaItems || [];

    if (
      schemaCapabilities.hasCurriculumProgressTable &&
      itemsToUpsert.length > 0
    ) {
      const rows = itemsToUpsert.map((item) => ({
        user_id: userId,
        item_key: item.itemKey,
        item_type: item.itemType,
        lesson_id: item.lessonId || null,
        completed: item.completed ?? true,
        peeked_solution: item.peekedSolution ?? false,
        stars: item.stars ?? null,
        updated_at: nowIso,
      }));
      const { error } = await supabase
        .from("user_curriculum_progress")
        .upsert(rows, { onConflict: "user_id,item_key" });

      if (error && isMissingTableError(error, "user_curriculum_progress")) {
        schemaCapabilities.hasCurriculumProgressTable = false;
      }
    }

    // 3. Keep legacy `user_progress` in sync for valid UUID lessons
    const lessonItems = itemsToUpsert.filter(
      (i) => i.itemType === "lesson" && i.completed && isUuid(i.itemKey),
    );
    if (lessonItems.length > 0) {
      await supabase.from("user_progress").upsert(
        lessonItems.map((item) => ({
          user_id: userId,
          lesson_id: item.itemKey,
          completed: true,
          updated_at: nowIso,
        })),
        { onConflict: "user_id,lesson_id" },
      );
    }

    return true;
  } catch (err) {
    console.warn("Cloud progress push failed:", err);
    return false;
  }
}

export async function pullAndMergeCloudState(params: {
  userId: string;
  userEmail?: string;
  localState: CloudProgressState;
  lessons: Lesson[];
}): Promise<{
  isPremium: boolean;
  mergedState: CloudProgressState;
}> {
  const { userId, userEmail, localState, lessons } = params;

  // 1. Fetch profile (trying progress_state first, falling back smoothly if not migrated yet)
  let profileData: any = null;
  if (schemaCapabilities.hasProgressStateColumn) {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium, xp_points, streak_count, progress_state")
      .eq("id", userId)
      .single();
    if (error && isMissingColumnError(error, "progress_state")) {
      schemaCapabilities.hasProgressStateColumn = false;
      const fallback = await supabase
        .from("profiles")
        .select("is_premium, xp_points, streak_count")
        .eq("id", userId)
        .single();
      profileData = fallback.data;
    } else {
      profileData = data;
    }
  } else {
    const fallback = await supabase
      .from("profiles")
      .select("is_premium, xp_points, streak_count")
      .eq("id", userId)
      .single();
    profileData = fallback.data;
  }

  // 2. Fetch legacy user_progress + new user_curriculum_progress in parallel
  const [legacyRes, relRes] = await Promise.all([
    supabase
      .from("user_progress")
      .select("lesson_id, completed")
      .eq("user_id", userId),
    schemaCapabilities.hasCurriculumProgressTable
      ? supabase
          .from("user_curriculum_progress")
          .select("item_key, item_type, lesson_id, completed, peeked_solution")
          .eq("user_id", userId)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (
    relRes.error &&
    isMissingTableError(relRes.error, "user_curriculum_progress")
  ) {
    schemaCapabilities.hasCurriculumProgressTable = false;
  }

  const legacyCloudLessons: Record<string, boolean> = {};
  legacyRes.data?.forEach((row: any) => {
    if (row.completed && row.lesson_id) {
      legacyCloudLessons[row.lesson_id] = true;
    }
  });

  const relationalRows = Array.isArray(relRes.data) ? relRes.data : [];

  const cloudSnapshot: Partial<CloudProgressState> = {
    ...(profileData?.progress_state || {}),
    xpPoints: Math.max(
      typeof profileData?.xp_points === "number" ? profileData.xp_points : 0,
      typeof profileData?.progress_state?.xpPoints === "number"
        ? profileData.progress_state.xpPoints
        : 0,
    ),
    streakCount: Math.max(
      typeof profileData?.streak_count === "number"
        ? profileData.streak_count
        : 0,
      typeof profileData?.progress_state?.streakCount === "number"
        ? profileData.progress_state.streakCount
        : 0,
    ),
  };

  const { merged, needsCloudBackfill } = mergeCloudAndLocalState(
    cloudSnapshot,
    localState,
    legacyCloudLessons,
    relationalRows,
  );

  const remapped = remapProgressKeysForLessons(lessons, merged);

  if (needsCloudBackfill || remapped !== merged) {
    void pushCloudProgressState({
      userId,
      userEmail,
      state: remapped,
      syncAllRelational: true,
    });
  }

  return {
    isPremium: Boolean(profileData?.is_premium),
    mergedState: remapped,
  };
}
