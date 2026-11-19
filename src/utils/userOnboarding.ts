import type { StudioIconName } from "../components/StudioIcon";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export type OnboardingGoalTrack =
  | "python_basics"
  | "algorithms"
  | "system_design";

export interface OnboardingGoalOption {
  id: OnboardingGoalTrack;
  icon: StudioIconName;
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
}

export interface UserOnboardingState {
  completed: boolean;
  displayName: string;
  goalTrack: OnboardingGoalTrack;
}

export const STORAGE_ONBOARDING_KEY = "devlearn_onboarding_v1";

export const ONBOARDING_GOAL_OPTIONS: readonly OnboardingGoalOption[] = [
  {
    id: "python_basics",
    icon: "python",
    badge: "FREE · ZERO TO CODER",
    title: "Total Beginner",
    subtitle: "Learn Python from variables to real functions",
    accent: "#B8FF3B",
  },
  {
    id: "algorithms",
    icon: "algo",
    badge: "INTERVIEW PREP",
    title: "Algorithms & DSA",
    subtitle: "Master hash maps, trees, graphs & patterns",
    accent: "#FFDE59",
  },
  {
    id: "system_design",
    icon: "arch",
    badge: "BACKEND SCALE",
    title: "System Design",
    subtitle: "Design caches, rate limiters & cloud queues",
    accent: "#FF90E8",
  },
] as const;

const DEFAULT_STATE: UserOnboardingState = {
  completed: false,
  displayName: "",
  goalTrack: "python_basics",
};

export function isValidGoalTrack(value: unknown): value is OnboardingGoalTrack {
  return (
    value === "python_basics" ||
    value === "algorithms" ||
    value === "system_design"
  );
}

export function sanitizeDisplayName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 24);
}

export function normalizeOnboardingState(
  raw: unknown,
): UserOnboardingState {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_STATE };
  }
  const obj = raw as Partial<UserOnboardingState>;
  return {
    completed: Boolean(obj.completed),
    displayName:
      typeof obj.displayName === "string"
        ? sanitizeDisplayName(obj.displayName)
        : "",
    goalTrack: isValidGoalTrack(obj.goalTrack)
      ? obj.goalTrack
      : "python_basics",
  };
}

export function shouldShowWelcomeCard(
  state: UserOnboardingState,
  totalSolvedCount: number,
  totalXp: number,
): boolean {
  return !state.completed && totalSolvedCount === 0 && totalXp === 0;
}

let cachedState: UserOnboardingState = normalizeOnboardingState(
  readLocalJson<UserOnboardingState>(STORAGE_ONBOARDING_KEY, DEFAULT_STATE),
);

type OnboardingListener = (state: UserOnboardingState) => void;
const listeners = new Set<OnboardingListener>();

function emitState(): void {
  const snapshot: UserOnboardingState = { ...cachedState };
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getOnboardingState(): UserOnboardingState {
  return { ...cachedState };
}

export function subscribeOnboarding(
  listener: OnboardingListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function hydrateOnboardingState(): Promise<UserOnboardingState> {
  const saved = await readLocalJsonAsync<UserOnboardingState>(
    STORAGE_ONBOARDING_KEY,
    cachedState,
  );
  cachedState = normalizeOnboardingState(saved);
  emitState();
  return getOnboardingState();
}

export function completeOnboarding(input: {
  displayName: string;
  goalTrack: OnboardingGoalTrack;
}): UserOnboardingState {
  cachedState = {
    completed: true,
    displayName: sanitizeDisplayName(input.displayName),
    goalTrack: isValidGoalTrack(input.goalTrack)
      ? input.goalTrack
      : "python_basics",
  };
  writeLocalJson(STORAGE_ONBOARDING_KEY, cachedState);
  emitState();
  return getOnboardingState();
}

export function skipOnboarding(): UserOnboardingState {
  cachedState = {
    ...cachedState,
    completed: true,
  };
  writeLocalJson(STORAGE_ONBOARDING_KEY, cachedState);
  emitState();
  return getOnboardingState();
}

export function updateDisplayName(rawName: string): UserOnboardingState {
  cachedState = {
    ...cachedState,
    displayName: sanitizeDisplayName(rawName),
  };
  writeLocalJson(STORAGE_ONBOARDING_KEY, cachedState);
  emitState();
  return getOnboardingState();
}

export function resetOnboardingForTesting(): void {
  cachedState = { ...DEFAULT_STATE };
  writeLocalJson(STORAGE_ONBOARDING_KEY, cachedState);
  emitState();
}
