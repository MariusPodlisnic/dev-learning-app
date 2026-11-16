import type { Session } from "@supabase/supabase-js";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { LessonEnrichment } from "../constants/curriculum";
import {
  getLessonStarRating,
  type Lesson,
  type TestCaseResult,
} from "../types/lesson";
import { trackFunnelMilestone } from "../utils/attribution";
import {
  executeLessonVerification,
  executePlaygroundPython,
  executePythonTrace,
} from "../utils/pyodideRunner";
import type { PythonTraceResult } from "../utils/pythonTrace";
import {
  getIsoDateKey,
  REVIEW_BONUS_XP,
  type ReviewScheduleEntry,
  type ReviewSignal,
  updateReviewScheduleOnSolve,
} from "../utils/spacedRepetition";
import {
  type CloudProgressState,
  type CurriculumProgressDeltaItem,
  pushCloudProgressState,
} from "../utils/supabaseSync";

export interface UseLessonExecutionOptions {
  code: string;
  selectedLesson: Lesson | null;
  activeChallengeIdx: number;
  lessonEnrichment: LessonEnrichment | null;
  isCompactStudio: boolean;
  pyodideRef: MutableRefObject<unknown>;
  setIsExecuting: Dispatch<SetStateAction<boolean>>;
  setIsTracing: Dispatch<SetStateAction<boolean>>;
  setOutput: Dispatch<SetStateAction<string>>;
  setTestResults: Dispatch<SetStateAction<TestCaseResult[] | null>>;
  setSelectedTestIndex: Dispatch<SetStateAction<number>>;
  setBottomTab: Dispatch<SetStateAction<"console" | "tests">>;
  setActiveTab: Dispatch<SetStateAction<"problem" | "mission" | "visual">>;
  setMobileStudioPane: Dispatch<SetStateAction<"learn" | "code">>;
  setLiveTraceResult: Dispatch<SetStateAction<PythonTraceResult | null>>;
  setShowSuccessModal: Dispatch<SetStateAction<boolean>>;
  usedSolutionInAttemptRef: MutableRefObject<boolean>;
  usedScaffoldInAttemptRef: MutableRefObject<boolean>;
  failedAttemptsByLessonRef: MutableRefObject<Record<string, number>>;
  completedLessons: Record<string, boolean>;
  setCompletedLessons: Dispatch<SetStateAction<Record<string, boolean>>>;
  completedChallenges: Record<string, boolean>;
  setCompletedChallenges: Dispatch<SetStateAction<Record<string, boolean>>>;
  peekedSolutions: Record<string, boolean>;
  setPeekedSolutions: Dispatch<SetStateAction<Record<string, boolean>>>;
  reviewSchedule: Record<string, ReviewScheduleEntry>;
  setReviewSchedule: Dispatch<
    SetStateAction<Record<string, ReviewScheduleEntry>>
  >;
  session: Session | null;
  codeDraftsRef: MutableRefObject<Record<string, string>>;
  latestGuestStateRef: MutableRefObject<CloudProgressState>;
  recordActiveDevSession: (bonusXp?: number) => {
    newXp: number;
    newStreak: number;
    newLastActiveDate: string;
  };
}

/**
 * Handles Python playground runs, Live Trace execution, and verification grading
 * including spaced-repetition review scheduling and cloud delta persistence.
 */
export function useLessonExecution({
  code,
  selectedLesson,
  activeChallengeIdx,
  lessonEnrichment,
  isCompactStudio,
  pyodideRef,
  setIsExecuting,
  setIsTracing,
  setOutput,
  setTestResults,
  setSelectedTestIndex,
  setBottomTab,
  setActiveTab,
  setMobileStudioPane,
  setLiveTraceResult,
  setShowSuccessModal,
  usedSolutionInAttemptRef,
  usedScaffoldInAttemptRef,
  failedAttemptsByLessonRef,
  completedLessons,
  setCompletedLessons,
  completedChallenges,
  setCompletedChallenges,
  peekedSolutions,
  setPeekedSolutions,
  reviewSchedule,
  setReviewSchedule,
  session,
  codeDraftsRef,
  latestGuestStateRef,
  recordActiveDevSession,
}: UseLessonExecutionOptions) {
  async function runPlaygroundOnly(customSnippet?: string) {
    setIsExecuting(true);
    setBottomTab("console");
    setOutput("Running code...");
    trackFunnelMilestone("first_code_run");
    try {
      const trimmedSnippet =
        typeof customSnippet === "string" ? customSnippet.trim() : "";
      const codeToExecute = trimmedSnippet ? `${code}\n${trimmedSnippet}` : code;
      const consoleOut = await executePlaygroundPython(
        pyodideRef.current,
        codeToExecute,
      );
      setOutput(consoleOut);
    } finally {
      setIsExecuting(false);
    }
  }

  async function runTraceExecution(customDriver?: string) {
    if (!selectedLesson) return;
    setIsTracing(true);
    setActiveTab("visual");
    if (isCompactStudio) {
      setMobileStudioPane("learn");
    }
    const activePractice =
      activeChallengeIdx > 0 && selectedLesson.practiceChallenges
        ? selectedLesson.practiceChallenges[activeChallengeIdx - 1]
        : undefined;
    const traceLesson: Lesson = activePractice
      ? {
          ...selectedLesson,
          expected_output: activePractice.expected_output,
          hidden_tests: activePractice.hidden_tests,
          examples: activePractice.examples,
        }
      : selectedLesson;

    try {
      const traceRes = await executePythonTrace(pyodideRef.current, code, {
        lesson: traceLesson,
        enrichment: activeChallengeIdx === 0 ? lessonEnrichment : null,
        driverCode: customDriver,
      });
      setLiveTraceResult(traceRes);
    } finally {
      setIsTracing(false);
    }
  }

  async function runPythonCode() {
    setIsExecuting(true);
    setOutput("Running verification suite...");
    setTestResults(null);
    trackFunnelMilestone("first_code_run");

    const activePractice =
      activeChallengeIdx > 0 && selectedLesson?.practiceChallenges
        ? selectedLesson.practiceChallenges[activeChallengeIdx - 1]
        : undefined;
    const verificationLesson: Lesson | null =
      selectedLesson && activePractice
        ? {
            ...selectedLesson,
            expected_output: activePractice.expected_output,
            hidden_tests: activePractice.hidden_tests,
          }
        : selectedLesson;

    try {
      const outcome = await executeLessonVerification(
        pyodideRef.current,
        code,
        verificationLesson,
      );

      setTestResults(outcome.testResults);
      if (outcome.testResults) {
        setSelectedTestIndex(0);
      }
      setBottomTab(outcome.targetTab);
      setOutput(outcome.consoleOutput);

      if (!outcome.allPassed && selectedLesson) {
        failedAttemptsByLessonRef.current[selectedLesson.id] =
          (failedAttemptsByLessonRef.current[selectedLesson.id] || 0) + 1;
      }

      if (outcome.allPassed && selectedLesson) {
        setShowSuccessModal(true);
        trackFunnelMilestone("first_lesson_solved");
        const stageKey =
          activeChallengeIdx === 0
            ? `${selectedLesson.id}::core`
            : activePractice?.id ||
              `${selectedLesson.id}::stage_${activeChallengeIdx}`;
        const isStageAlreadyCompleted = Boolean(
          completedChallenges[stageKey] ||
            (activeChallengeIdx === 0 && completedLessons[selectedLesson.id]),
        );
        const failedCount =
          failedAttemptsByLessonRef.current[selectedLesson.id] || 0;
        const reviewSignal: ReviewSignal = usedSolutionInAttemptRef.current
          ? "peeked"
          : usedScaffoldInAttemptRef.current
            ? "scaffolded"
            : failedCount >= 2
              ? "retries"
              : "clean";
        failedAttemptsByLessonRef.current[selectedLesson.id] = 0;

        const existingReviewEntry = reviewSchedule[selectedLesson.id];
        const todayKey = getIsoDateKey();
        const wasScheduledDue = Boolean(
          existingReviewEntry &&
            existingReviewEntry.nextReviewAt.slice(0, 10) <= todayKey,
        );
        const wasImplicitPeekDue = Boolean(
          !existingReviewEntry &&
            completedLessons[selectedLesson.id] &&
            peekedSolutions[selectedLesson.id],
        );
        const reviewBonusXp =
          isStageAlreadyCompleted &&
          (wasScheduledDue || wasImplicitPeekDue) &&
          reviewSignal === "clean"
            ? REVIEW_BONUS_XP
            : 0;

        const stageXp = activePractice?.xpReward || 50;
        const { newXp, newStreak, newLastActiveDate } = recordActiveDevSession(
          (isStageAlreadyCompleted ? 0 : stageXp) + reviewBonusXp,
        );

        const nextCompletedChallenges = {
          ...completedChallenges,
          [stageKey]: true,
        };
        setCompletedChallenges(nextCompletedChallenges);

        const practiceList = selectedLesson.practiceChallenges || [];
        const allStagesNowDone =
          practiceList.length === 0 ||
          (Boolean(
            nextCompletedChallenges[`${selectedLesson.id}::core`] ||
              completedLessons[selectedLesson.id],
          ) &&
            practiceList.every((ch, idx) =>
              Boolean(
                nextCompletedChallenges[ch.id] ||
                  nextCompletedChallenges[
                    `${selectedLesson.id}::stage_${idx + 1}`
                  ],
              ),
            ));

        const nextPeekedSolutions = { ...peekedSolutions };
        if (usedSolutionInAttemptRef.current) {
          nextPeekedSolutions[selectedLesson.id] = true;
          setPeekedSolutions(nextPeekedSolutions);
        } else if (allStagesNowDone && nextPeekedSolutions[selectedLesson.id]) {
          delete nextPeekedSolutions[selectedLesson.id];
          setPeekedSolutions(nextPeekedSolutions);
        }

        const nextCompletedLessons = allStagesNowDone
          ? { ...completedLessons, [selectedLesson.id]: true }
          : completedLessons;
        if (allStagesNowDone) {
          setCompletedLessons(nextCompletedLessons);
        }

        const shouldUpdateReviewSchedule =
          allStagesNowDone ||
          Boolean(existingReviewEntry) ||
          Boolean(nextCompletedLessons[selectedLesson.id]);
        let nextReviewSchedule = reviewSchedule;
        let updatedReviewEntry = existingReviewEntry || null;
        if (shouldUpdateReviewSchedule) {
          const updated = updateReviewScheduleOnSolve({
            currentSchedule: reviewSchedule,
            lessonId: selectedLesson.id,
            signal: reviewSignal,
          });
          nextReviewSchedule = updated.nextSchedule;
          updatedReviewEntry = updated.entry;
          setReviewSchedule(nextReviewSchedule);
        }

        const nextSnapshot: CloudProgressState = {
          ...latestGuestStateRef.current,
          completedLessons: nextCompletedLessons,
          completedChallenges: nextCompletedChallenges,
          peekedSolutions: nextPeekedSolutions,
          reviewSchedule: nextReviewSchedule,
          xpPoints: newXp,
          streakCount: newStreak,
          lastActiveDate: newLastActiveDate,
          codeDrafts: codeDraftsRef.current,
          updatedAt: new Date().toISOString(),
        };
        latestGuestStateRef.current = nextSnapshot;

        if (session) {
          const deltaItems: CurriculumProgressDeltaItem[] = [
            {
              itemKey: stageKey,
              itemType: "stage",
              lessonId: selectedLesson.id,
              completed: true,
            },
          ];
          const updatedLessonObj = {
            ...selectedLesson,
          };
          const lessonStars = getLessonStarRating(
            updatedLessonObj,
            nextCompletedLessons,
            nextCompletedChallenges,
            nextPeekedSolutions,
          );
          deltaItems.push({
            itemKey: selectedLesson.id,
            itemType: "lesson",
            lessonId: selectedLesson.id,
            completed:
              allStagesNowDone || Boolean(nextCompletedLessons[selectedLesson.id]),
            peekedSolution: Boolean(nextPeekedSolutions[selectedLesson.id]),
            stars: lessonStars,
            nextReviewAt: updatedReviewEntry?.nextReviewAt ?? null,
            reviewIntervalDays: updatedReviewEntry?.intervalDays ?? null,
            reviewReps: updatedReviewEntry?.reps ?? 0,
            weakSignalCount: updatedReviewEntry?.weakSignalCount ?? 0,
          });
          await pushCloudProgressState({
            userId: session.user.id,
            userEmail: session.user.email,
            state: nextSnapshot,
            deltaItems,
          });
        }
      }
    } finally {
      setIsExecuting(false);
    }
  }

  return {
    runPlaygroundOnly,
    runTraceExecution,
    runPythonCode,
  };
}
