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

export interface Lesson {
  id: string;
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
  visual_type?: string;
  visual_data?: any;
  hints?: string[];
}

export type ViewMode = "roadmap" | "studio" | "bughunt" | "blitz";
export type ExplainStyle = "analogy" | "guide" | "cheatsheet";

export const STORAGE_DRAFTS_KEY = "devlearn_code_drafts_v1";
export const STORAGE_STATE_KEY = "devlearn_state_v1";

export function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (_e) {
    return fallback;
  }
}

export function writeLocalJson(key: string, value: unknown) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_e) {}
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

