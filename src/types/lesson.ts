export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Complexities {
  time?: string;
  space?: string;
}

export interface TestCaseResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  difficultyLabel:
    | "PRACTICE DRILL"
    | "APPLIED CHALLENGE"
    | "EDGE-CASE DRILL"
    | "BOSS GAUNTLET";
  assignment: string;
  constraints: string[];
  examples: Example[];
  initial_code: string;
  expected_output: string;
  hidden_tests: string;
  hints: string[];
  guidedCode?: string;
  xpReward?: number;
}

export interface Lesson {
  id: string;
  slug?: string;
  title: string;
  track: string;
  category?: string;
  difficulty?: string;
  tree_row?: number;
  description: string;
  content: string;
  assignment?: string;
  initial_code: string;
  expected_output: string;
  hidden_tests?: string;
  examples?: Example[];
  constraints?: string[];
  complexities?: Complexities;
  is_free: boolean;
  lesson_order: number;
  is_recap?: boolean;
  recap_chapter?: number;
  recap_topics?: string[];
  visual_type?: string;
  visual_data?: any;
  hints?: string[];
  practiceChallenges?: PracticeChallenge[];
}

export type ViewMode =
  | "roadmap"
  | "studio"
  | "bughunt"
  | "blitz"
  | "algolab"
  | "achievements";
export type ExplainStyle = "analogy" | "guide" | "cheatsheet";

export const STORAGE_DRAFTS_KEY = "devlearn_code_drafts_v2";
export const STORAGE_STATE_KEY = "devlearn_state_v1";
export const STORAGE_QUICKSTART_DISMISSED_KEY = "devlearn_quickstart_dismissed_v1";
export const STORAGE_CLOUD_NUDGE_DISMISSED_KEY = "devlearn_cloud_nudge_dismissed_v1";
export const STORAGE_ATTRIBUTION_KEY = "devlearn_attribution_v1";

export function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalJson(key: string, value: unknown) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Module 01 of Pro tracks (algorithms & system_design) is unlocked as a
 * "Free Pro Preview" so non-Pro users can experience the track first.
 */
export function isProTrackPreviewLesson(lesson: {
  track: string;
  lesson_order: number;
}): boolean {
  return lesson.track !== "python_basics" && lesson.lesson_order === 1;
}

/**
 * Determines whether a lesson is locked for the current user.
 * - Pro users can access every lesson.
 * - Module 01 of every Pro track is unlocked as a Free Preview.
 * - Modules 02+ of Pro tracks require Pro.
 * - In python_basics, lessons respect lesson.is_free.
 */
export function isLessonLockedForUser(
  lesson: { track: string; lesson_order: number; is_free: boolean },
  isPremium: boolean,
): boolean {
  if (isPremium) return false;
  if (isProTrackPreviewLesson(lesson)) return false;
  if (lesson.track !== "python_basics") return true;
  return !lesson.is_free;
}

/**
 * Checks whether a specific stage (0 = Core Lesson, 1..N = Practice Challenge)
 * of a lesson has been solved.
 */
export function isLessonStageCompleted(
  lesson: { id: string; practiceChallenges?: PracticeChallenge[] },
  stageIdx: number,
  completedLessons: Record<string, boolean> = {},
  completedChallenges: Record<string, boolean> = {},
): boolean {
  if (stageIdx <= 0) {
    return Boolean(
      completedChallenges[`${lesson.id}::core`] ||
        completedChallenges[`${lesson.id}#0`] ||
        completedLessons[lesson.id],
    );
  }
  const drill = lesson.practiceChallenges?.[stageIdx - 1];
  return Boolean(
    (drill && completedChallenges[drill.id]) ||
      completedChallenges[`${lesson.id}::stage_${stageIdx}`],
  );
}

/**
 * Returns { solvedStages, totalStages, allStagesSolved } for a lesson.
 */
export function getLessonStageProgress(
  lesson: { id: string; practiceChallenges?: PracticeChallenge[] },
  completedLessons: Record<string, boolean> = {},
  completedChallenges: Record<string, boolean> = {},
): { solvedStages: number; totalStages: number; allStagesSolved: boolean } {
  const drills = lesson.practiceChallenges || [];
  const totalStages = 1 + drills.length;
  let solvedStages = 0;
  for (let i = 0; i < totalStages; i += 1) {
    if (
      isLessonStageCompleted(lesson, i, completedLessons, completedChallenges)
    ) {
      solvedStages += 1;
    }
  }
  return {
    solvedStages,
    totalStages,
    allStagesSolved: solvedStages >= totalStages,
  };
}

/**
 * Computes the 3-Star Mastery Rating (0, 1, 2, or 3) for a lesson:
 * - ★☆☆ (1 Star): Core Lesson cleared
 * - ★★☆ (2 Stars): Practice Drills started (or all cleared with solution peeked)
 * - ★★★ (3 Stars): All Stages (Core + all Practice/Boss Drills) cleared without loading the solution
 */
export function getLessonStarRating(
  lesson: { id: string; practiceChallenges?: PracticeChallenge[] },
  completedLessons: Record<string, boolean> = {},
  completedChallenges: Record<string, boolean> = {},
  peekedSolutions: Record<string, boolean> = {},
): 0 | 1 | 2 | 3 {
  const { solvedStages, totalStages, allStagesSolved } = getLessonStageProgress(
    lesson,
    completedLessons,
    completedChallenges,
  );
  if (solvedStages === 0) return 0;
  const peeked = Boolean(peekedSolutions[lesson.id]);

  if (totalStages === 1) {
    return peeked ? 2 : 3;
  }

  if (allStagesSolved) {
    return peeked ? 2 : 3;
  }

  if (solvedStages >= 2) {
    return 2;
  }

  return 1;
}

