import { useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import AchievementsHall from "../components/AchievementsHall";
import AlgorithmVisualizerLab from "../components/AlgorithmVisualizerLab";
import AppHeader from "../components/AppHeader";
import BugHuntArena from "../components/BugHuntArena";
import { renderHighlightedPython } from "../components/FormattedText";
import LessonProblemPanel from "../components/LessonProblemPanel";
import MinimalPcbBackground from "../components/MinimalPcbBackground";
import MobileThumbNav from "../components/MobileThumbNav";
import {
  getKeyboardAvoidingBehavior,
  isCompactHeaderWidth,
  isCompactStudioWidth,
  shouldShowBottomThumbNav,
} from "../utils/mobileLayout";
import {
  PaywallPlanId,
  PaywallTriggerContext,
} from "../components/PaywallModal";
import {
  getDeveloperRank,
} from "../components/ProfileStatsModal";
import RoadmapTree from "../components/RoadmapTree";
import StudioCodeEditor from "../components/StudioCodeEditor";
import StudioFocusBackground from "../components/StudioFocusBackground";
import StudioModals from "../components/StudioModals";
import StudioSidebar from "../components/StudioSidebar";
import { getStudioScreenStyles } from "../components/studioScreenStyles";
import SyntaxBlitzArena from "../components/SyntaxBlitzArena";
import {
  computeStreakUpdate,
  StreakMilestone,
} from "../constants/streaks";
import {
  buildChapterCertificate,
  buildTrackCertificate,
  CertificateData,
  ChapterTierMeta,
  isLessonInChapter,
  TRACK_CHAPTERS,
} from "../constants/certificates";
import { getLessonEnrichment } from "../constants/curriculum";
import {
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { useStudioSync } from "../hooks/useStudioSync";
import {
  ExplainStyle,
  getLessonStarRating,
  isLessonLockedForUser,
  isProTrackPreviewLesson,
  Lesson,
  STORAGE_DRAFTS_KEY,
  TestCaseResult,
  ViewMode,
  writeLocalJson,
} from "../types/lesson";
import {
  captureLandingAttribution,
  trackFunnelMilestone,
} from "../utils/attribution";
import {
  executeBugPatchVerification,
  executeLessonVerification,
  executePlaygroundPython,
} from "../utils/pyodideRunner";
import { playVictoryFanfare } from "../utils/soundEffects";
import {
  CloudProgressState,
  CurriculumProgressDeltaItem,
  pushCloudProgressState,
} from "../utils/supabaseSync";

export function generateMetadata(): Metadata {
  return {
    title: "DevLearn Arcade | Interactive Python, Algorithms & System Design",
    description:
      "Master Python Foundations, Algorithmic Mastery, and System Architecture with interactive playgrounds, playable mini-apps, Bug Hunt, and 60s Syntax Blitz.",
    openGraph: {
      title: "DevLearn Arcade | Interactive Coding Arcade",
      description:
        "Learn Python, Algorithms & System Design through live playgrounds, playable mini-apps, and 60-second coding sprints.",
      type: "website",
      images: ["/og-preview.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "DevLearn Arcade | Interactive Coding Arcade",
      description:
        "Learn Python, Algorithms & System Design through live playgrounds, playable mini-apps, and 60-second coding sprints.",
      images: ["/og-preview.jpg"],
    },
  };
}

const EMPTY_SUBSCRIBE = () => () => {};
const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "mission" | "visual">(
    "mission",
  );
  const [explainStyle, setExplainStyle] = useState<ExplainStyle>("guide");
  const [bottomTab, setBottomTab] = useState<"console" | "tests">("console");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [mobileStudioPane, setMobileStudioPane] = useState<"learn" | "code">(
    "learn",
  );
  const isMounted = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );
  const { width: rawWindowWidth } = useWindowDimensions();
  const viewportWidth =
    isMounted && rawWindowWidth > 0 ? rawWindowWidth : 1280;
  const isCompactStudio = isCompactStudioWidth(viewportWidth);
  const isCompactHeader = isCompactHeaderWidth(viewportWidth);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const showMobileThumbNav = shouldShowBottomThumbNav({
    isCompactHeader,
    isKeyboardVisible,
  });
  const keyboardBehavior = getKeyboardAvoidingBehavior(Platform.OS);

  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const usedSolutionInAttemptRef = useRef<boolean>(false);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [activeStreakMilestone, setActiveStreakMilestone] =
    useState<StreakMilestone | null>(null);

  const { themeMode, setThemeMode, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<"signup" | "signin">(
    "signin",
  );
  const [authPromptReason, setAuthPromptReason] = useState<string | undefined>(
    undefined,
  );
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallContext, setPaywallContext] = useState<PaywallTriggerContext>({
    source: "header",
  });
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [activeCertificate, setActiveCertificate] =
    useState<CertificateData | null>(null);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);

  const pyodideRef = useRef<any>(null);
  const studioActionsRef = useRef({
    handleSelectLesson: (_lesson: { id: string }) => {},
    handleSwitchTrack: (_trackName: string) => {},
  });

  const resumePaywallAfterAuthRef = useRef<boolean>(false);
  const handledDeepLinkRef = useRef<boolean>(false);

  const {
    lessons,
    activeTrack,
    setActiveTrack,
    loading,
    completedLessons,
    setCompletedLessons,
    completedChallenges,
    setCompletedChallenges,
    peekedSolutions,
    setPeekedSolutions,
    solvedIncidents,
    setSolvedIncidents,
    xpPoints,
    setXpPoints,
    streakCount,
    setStreakCount,
    lastActiveDate,
    setLastActiveDate,
    claimedStreakMilestones,
    setClaimedStreakMilestones,
    streakShields,
    setStreakShields,
    claimedChapters,
    setClaimedChapters,
    session,
    setIsPremium,
    setDevProOverride,
    effectiveIsPremium,
    codeDraftsRef,
    cloudSyncCompletedRef,
    latestGuestStateRef,
    scheduleBackgroundCloudSync,
  } = useStudioSync({
    themeMode,
    setThemeMode,
    selectedLessonId: selectedLesson?.id,
    onInitialLessonResolved: (initialLesson, initialCode, draftExists) => {
      setSelectedLesson(initialLesson);
      setCode(initialCode);
      setHasSavedDraft(draftExists);
    },
    onAuthSignedIn: () => {
      setShowAuthModal(false);
      if (resumePaywallAfterAuthRef.current) {
        resumePaywallAfterAuthRef.current = false;
        setShowPaywallModal(true);
      }
    },
    pyodideRef,
    onPyodideReady: () => setPyodideReady(true),
  });
  const searchParams = useLocalSearchParams<{
    lesson?: string;
    mode?: string;
    track?: string;
    paywall?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    ref?: string;
  }>();

  function getStageDraftKey(lessonObj: Lesson, stageIdx: number): string {
    if (stageIdx <= 0) return lessonObj.id;
    const drill = lessonObj.practiceChallenges?.[stageIdx - 1];
    return drill?.id || `${lessonObj.id}::stage_${stageIdx}`;
  }

  function getStageDefaultCode(lessonObj: Lesson, stageIdx: number): string {
    if (stageIdx <= 0) {
      return (lessonObj.initial_code || "").replace(/\\n/g, "\n");
    }
    const drill = lessonObj.practiceChallenges?.[stageIdx - 1];
    return (drill?.initial_code || "").replace(/\\n/g, "\n");
  }

  function updateCodeWithDraft(
    nextCode: string,
    lessonObj?: Lesson | null,
    stageIdxOverride?: number,
  ) {
    setCode(nextCode);
    const targetLesson = lessonObj !== undefined ? lessonObj : selectedLesson;
    if (!targetLesson) return;
    const targetStageIdx =
      stageIdxOverride !== undefined ? stageIdxOverride : activeChallengeIdx;
    const draftKey = getStageDraftKey(targetLesson, targetStageIdx);
    const defaultCode = getStageDefaultCode(targetLesson, targetStageIdx);
    if (nextCode !== defaultCode) {
      codeDraftsRef.current[draftKey] = nextCode;
      setHasSavedDraft(true);
    } else {
      delete codeDraftsRef.current[draftKey];
      setHasSavedDraft(false);
      usedSolutionInAttemptRef.current = false;
    }
    writeLocalJson(STORAGE_DRAFTS_KEY, codeDraftsRef.current);
    latestGuestStateRef.current = {
      ...latestGuestStateRef.current,
      codeDrafts: codeDraftsRef.current,
      updatedAt: new Date().toISOString(),
    };
    if (session?.user?.id && cloudSyncCompletedRef.current) {
      scheduleBackgroundCloudSync(latestGuestStateRef.current);
    }
  }

  const {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    ref: refCode,
  } = searchParams;

  useEffect(() => {
    captureLandingAttribution({
      path: "/",
      searchParams: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        ref: refCode,
      },
      milestone: "landed_studio",
    });
  }, [utm_source, utm_medium, utm_campaign, utm_content, utm_term, refCode]);

  useEffect(() => {
    if (handledDeepLinkRef.current) return;
    const { lesson, mode, track, paywall } = searchParams;
    if (!lesson && !mode && !track && !paywall) return;

    if (paywall === "1") {
      handledDeepLinkRef.current = true;
      queueMicrotask(() => {
        setPaywallContext({ source: "header" });
        setShowPaywallModal(true);
      });
      return;
    }
    if (mode === "bughunt" || mode === "blitz" || mode === "algolab" || mode === "achievements") {
      handledDeepLinkRef.current = true;
      const targetMode = mode;
      queueMicrotask(() => setViewMode(targetMode));
      return;
    }
    if (lessons.length === 0) return;

    if (lesson) {
      handledDeepLinkRef.current = true;
      queueMicrotask(() => studioActionsRef.current.handleSelectLesson({ id: lesson }));
      return;
    }
    if (track && TrackThemes[track]) {
      handledDeepLinkRef.current = true;
      queueMicrotask(() => {
        studioActionsRef.current.handleSwitchTrack(track);
        setViewMode("roadmap");
      });
    }
  }, [searchParams, lessons]);

  function openAuthModal(
    defaultMode?: "signup" | "signin",
    reason?: string,
  ) {
    const solvedTotal = Object.values(
      latestGuestStateRef.current.completedLessons,
    ).filter(Boolean).length;
    const resolvedMode =
      defaultMode ??
      (latestGuestStateRef.current.xpPoints > 0 || solvedTotal > 0
        ? "signup"
        : "signin");
    setAuthDefaultMode(resolvedMode);
    setAuthPromptReason(reason);
    setShowAuthModal(true);
    trackFunnelMilestone("auth_prompt_opened", { source: reason });
  }

  function openPaywall(context: PaywallTriggerContext = { source: "header" }) {
    setPaywallContext(context);
    setShowPaywallModal(true);
    trackFunnelMilestone("paywall_viewed", { source: context.source });
  }

  function handleSelectChallengeStage(
    stageIdx: number,
    lessonObj?: Lesson | null,
  ) {
    const targetLesson = lessonObj || selectedLesson;
    if (!targetLesson) return;
    usedSolutionInAttemptRef.current = false;
    setActiveChallengeIdx(stageIdx);
    const draftKey = getStageDraftKey(targetLesson, stageIdx);
    const defaultCode = getStageDefaultCode(targetLesson, stageIdx);
    const draft = codeDraftsRef.current[draftKey];
    setCode(draft !== undefined ? draft : defaultCode);
    setHasSavedDraft(draft !== undefined && draft !== defaultCode);
    setOutput("");
    setTestResults(null);
    setActiveTab("mission");
    setBottomTab("console");
  }

  function openLessonInStudio(fullLesson: Lesson) {
    usedSolutionInAttemptRef.current = false;
    setActiveTrack(fullLesson.track);
    setSelectedLesson(fullLesson);
    setActiveChallengeIdx(0);
    const defaultCode = (fullLesson.initial_code || "").replace(/\\n/g, "\n");
    const draft = codeDraftsRef.current[fullLesson.id];
    setCode(draft !== undefined ? draft : defaultCode);
    setHasSavedDraft(draft !== undefined && draft !== defaultCode);
    setOutput("");
    setTestResults(null);
    setActiveTab("mission");
    setBottomTab("console");
    setMobileDrawerOpen(false);
    setViewMode("studio");
  }

  async function handleUpgradeToPro(plan: PaywallPlanId = "annual") {
    if (!session) {
      resumePaywallAfterAuthRef.current = true;
      setShowPaywallModal(false);
      openAuthModal(
        "signup",
        "Create your free developer account first, then unlock Pro Arcade.",
      );
      return;
    }
    setUpgrading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        email: session.user.email,
        is_premium: true,
      });
      if (error) throw error;
      setIsPremium(true);
      setShowPaywallModal(false);
      trackFunnelMilestone("pro_upgraded", { plan });
      playVictoryFanfare();
      if (paywallContext.lessonId) {
        const unlockedLesson = lessons.find(
          (item) => item.id === paywallContext.lessonId,
        );
        if (unlockedLesson) {
          openLessonInStudio(unlockedLesson);
        }
      }
    } catch (err: any) {
      console.error("Upgrade error:", err.message);
    } finally {
      setUpgrading(false);
    }
  }

  function handleSwitchTrack(trackName: string) {
    usedSolutionInAttemptRef.current = false;
    setActiveChallengeIdx(0);
    setActiveTrack(trackName);
    const firstInTrack = lessons.find(
      (l) =>
        l.track === trackName && !isLessonLockedForUser(l, effectiveIsPremium),
    );
    if (firstInTrack) {
      setSelectedLesson(firstInTrack);
      const defaultCode = (firstInTrack.initial_code || "").replace(
        /\\n/g,
        "\n",
      );
      const draft = codeDraftsRef.current[firstInTrack.id];
      setCode(draft !== undefined ? draft : defaultCode);
      setHasSavedDraft(draft !== undefined && draft !== defaultCode);
      setOutput("");
      setTestResults(null);
      setActiveTab("mission");
    }
  }

  function handleSelectLesson(lesson: { id: string }) {
    const fullLesson = lessons.find((item) => item.id === lesson.id);
    if (!fullLesson) return;

    if (isLessonLockedForUser(fullLesson, effectiveIsPremium)) {
      openPaywall({
        source: "lesson",
        lessonId: fullLesson.id,
        lessonTitle: fullLesson.title,
        track: fullLesson.track,
      });
      return;
    }
    openLessonInStudio(fullLesson);
  }

  useEffect(() => {
    studioActionsRef.current = {
      handleSelectLesson,
      handleSwitchTrack,
    };
  });

  function handleNextLesson() {
    setShowSuccessModal(false);
    if (!selectedLesson) return;
    const practiceDrills = selectedLesson.practiceChallenges || [];
    if (activeChallengeIdx < practiceDrills.length) {
      handleSelectChallengeStage(activeChallengeIdx + 1, selectedLesson);
      return;
    }
    const currentTrackLessons = lessons.filter((l) => l.track === activeTrack);
    const currentIndex = currentTrackLessons.findIndex(
      (l) => l.id === selectedLesson.id,
    );
    if (currentIndex !== -1 && currentIndex < currentTrackLessons.length - 1) {
      handleSelectLesson(currentTrackLessons[currentIndex + 1]);
    } else {
      setViewMode("roadmap");
    }
  }

  function recordActiveDevSession(bonusXp = 0): {
    newXp: number;
    newStreak: number;
    newLastActiveDate: string;
  } {
    const streakUpdate = computeStreakUpdate({
      currentStreak: streakCount,
      lastActiveDate,
      claimedMilestones: claimedStreakMilestones,
      streakShields,
    });

    const milestoneXp = streakUpdate.unlockedMilestone
      ? streakUpdate.unlockedMilestone.bonusXp
      : 0;
    const newXp = xpPoints + bonusXp + milestoneXp;
    const newStreak = streakUpdate.newStreak;
    const newLastActiveDate = streakUpdate.newLastActiveDate;

    setStreakCount(newStreak);
    setLastActiveDate(newLastActiveDate);
    setStreakShields(streakUpdate.remainingShields);
    if (bonusXp > 0 || milestoneXp > 0) {
      setXpPoints(newXp);
    }

    if (streakUpdate.unlockedMilestone) {
      const milestoneDays = streakUpdate.unlockedMilestone.days;
      setClaimedStreakMilestones((prev) => ({
        ...prev,
        [milestoneDays]: true,
      }));
      setActiveStreakMilestone(streakUpdate.unlockedMilestone);
      trackFunnelMilestone("share_triggered", {
        channel: `streak_milestone_${milestoneDays}`,
      });
    }

    return { newXp, newStreak, newLastActiveDate };
  }

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
        const stageXp = activePractice?.xpReward || 50;
        const { newXp, newStreak, newLastActiveDate } = recordActiveDevSession(
          isStageAlreadyCompleted ? 0 : stageXp,
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

        const nextSnapshot: CloudProgressState = {
          ...latestGuestStateRef.current,
          completedLessons: nextCompletedLessons,
          completedChallenges: nextCompletedChallenges,
          peekedSolutions: nextPeekedSolutions,
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
            completed: allStagesNowDone,
            peekedSolution: Boolean(nextPeekedSolutions[selectedLesson.id]),
            stars: lessonStars,
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

  async function handleAwardBugHuntXp(xpEarned: number, incidentId: string) {
    const alreadySolved = solvedIncidents[incidentId];
    const nextSolvedIncidents = { ...solvedIncidents, [incidentId]: true };
    setSolvedIncidents(nextSolvedIncidents);
    if (alreadySolved) return;

    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(xpEarned);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      solvedIncidents: nextSolvedIncidents,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
        deltaItems: [
          {
            itemKey: incidentId,
            itemType: "bug_incident",
            completed: true,
          },
        ],
      });
    }
  }

  async function handleAwardBlitzXp(xpEarned: number) {
    if (xpEarned <= 0) return;
    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(xpEarned);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
      });
    }
  }

  function openTrackCertificate(
    trackKey: string,
    overrideXp: number = xpPoints,
    overrideStreak: number = streakCount,
  ) {
    const trackLessons = lessons.filter((l) => l.track === trackKey);
    const doneCount = trackLessons.filter((l) => completedLessons[l.id]).length;
    const rank = getDeveloperRank(overrideXp);
    setActiveCertificate(
      buildTrackCertificate({
        trackKey,
        completedCount: doneCount || trackLessons.length,
        xpPoints: overrideXp,
        streakCount: overrideStreak,
        rankLabel: `L${rank.level} ${rank.title}`,
        userEmail: session?.user?.email,
      }),
    );
  }

  function openChapterCertificate(
    trackKey: string,
    chapter: ChapterTierMeta,
    overrideXp: number = xpPoints,
    overrideStreak: number = streakCount,
  ) {
    const chLessons = lessons.filter(
      (l) => l.track === trackKey && isLessonInChapter(l, chapter),
    );
    const rank = getDeveloperRank(overrideXp);
    setActiveCertificate(
      buildChapterCertificate({
        trackKey,
        chapter,
        completedCount: chLessons.length || 4,
        xpPoints: overrideXp,
        streakCount: overrideStreak,
        rankLabel: `L${rank.level} ${rank.title}`,
        userEmail: session?.user?.email,
      }),
    );
  }

  async function handleClaimChapterBonus(chapterKey: string, bonusXp: number) {
    if (claimedChapters[chapterKey]) return;
    playVictoryFanfare();
    const newXp = xpPoints + bonusXp;
    const newStreak = streakCount === 0 ? 1 : streakCount;
    const nextClaimedChapters = { ...claimedChapters, [chapterKey]: true };
    setClaimedChapters(nextClaimedChapters);
    setXpPoints(newXp);
    setStreakCount(newStreak);

    const [trackKey, chIdRaw] = chapterKey.split("_ch_");
    const chapterMeta = (TRACK_CHAPTERS[trackKey] || []).find(
      (c) => String(c.id) === chIdRaw,
    );
    if (chapterMeta) {
      openChapterCertificate(trackKey, chapterMeta, newXp, newStreak);
    }

    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      claimedChapters: nextClaimedChapters,
      xpPoints: newXp,
      streakCount: newStreak,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
        deltaItems: [
          {
            itemKey: chapterKey,
            itemType: "chapter",
            completed: true,
          },
        ],
      });
    }
  }

  const styles = useThemedStyles(getStudioScreenStyles);
  const devRank = getDeveloperRank(xpPoints);
  const lessonEnrichment = selectedLesson
    ? getLessonEnrichment(selectedLesson)
    : null;

  const currentLessons = lessons.filter((l) => l.track === activeTrack);
  const completedCount = currentLessons.filter(
    (l) => completedLessons[l.id],
  ).length;
  const totalSolvedCount = Object.values(completedLessons).filter(Boolean).length;
  const algoModulesCount = lessons.filter((l) => l.track === "algorithms").length;
  const sysDesignModulesCount = lessons.filter(
    (l) => l.track === "system_design",
  ).length;
  const paywallFreePreviewLesson =
    paywallContext.track && paywallContext.track !== "python_basics"
      ? lessons.find(
          (l) =>
            l.track === paywallContext.track &&
            isProTrackPreviewLesson(l) &&
            !completedLessons[l.id],
        )
      : undefined;
  const progressPercent = currentLessons.length
    ? Math.round((completedCount / currentLessons.length) * 100)
    : 0;
  const currentLessonIndex = selectedLesson
    ? currentLessons.findIndex((l) => l.id === selectedLesson.id)
    : -1;
  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson =
    currentLessonIndex !== -1 &&
    currentLessonIndex < currentLessons.length - 1;

  function handlePrevLesson() {
    if (hasPrevLesson) {
      handleSelectLesson(currentLessons[currentLessonIndex - 1]);
    }
  }

  const seoTitle =
    viewMode === "studio" && selectedLesson
      ? `${selectedLesson.title} | DevLearn Arcade`
      : viewMode === "bughunt"
        ? "Bug Hunt Arena | DevLearn Arcade"
        : viewMode === "blitz"
          ? "60s Syntax Blitz | DevLearn Arcade"
          : viewMode === "algolab"
            ? "Pro Algorithm Visual Lab | DevLearn Arcade"
            : "DevLearn Arcade | Interactive Python, Algorithms & System Design";

  const seoDescription =
    viewMode === "studio" && selectedLesson
      ? `${selectedLesson.description} Practice interactively in the live DevLearn Arcade studio.`
      : viewMode === "bughunt"
        ? "Spot and fix broken Python and algorithm snippets in the DevLearn Arcade Bug Hunt Arena."
        : viewMode === "blitz"
          ? "Race the 60-second clock to predict outputs and spot syntax bugs in DevLearn Arcade."
          : viewMode === "algolab"
            ? "Observe Binary Search, Two Pointers, Sliding Window, Sorting, Hash Maps, and BFS step-by-step in the Pro Algorithm Visual Lab."
            : "Master Python Foundations, Algorithmic Mastery, and System Architecture with interactive playgrounds, playable mini-apps, Bug Hunt, and 60s Syntax Blitz.";

  const activeBackdropAccent =
    viewMode === "bughunt"
      ? StudioColors.coral
      : viewMode === "blitz"
        ? StudioColors.lime
        : viewMode === "algolab"
          ? StudioColors.violet
          : TrackThemes[activeTrack]?.stickerBg || StudioColors.yellow;

  const backdropVariant =
    viewMode === "studio"
      ? "studio"
      : viewMode === "roadmap"
        ? "roadmap"
        : "arena";

  return (
    <SafeAreaView
      edges={
        showMobileThumbNav
          ? ["top", "left", "right"]
          : ["top", "bottom", "left", "right"]
      }
      style={styles.container}
    >
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content="/og-preview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Head>
      {viewMode === "studio" ? (
        <StudioFocusBackground
          accentColor={activeBackdropAccent}
          themeMode={themeMode}
        />
      ) : (
        <MinimalPcbBackground
          accentColor={activeBackdropAccent}
          themeMode={themeMode}
          variant={backdropVariant}
        />
      )}
      <AppHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isCompactHeader={isCompactHeader}
        pyodideReady={pyodideReady}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        devRank={devRank}
        streakCount={streakCount}
        isPremium={effectiveIsPremium}
        session={session}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenPaywall={() => openPaywall({ source: "header" })}
        onOpenAuth={() => openAuthModal()}
        onSignOut={() => supabase.auth.signOut()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >

      {viewMode === "roadmap" ? (
        <RoadmapTree
          lessons={lessons}
          completedLessons={completedLessons}
          completedChallenges={completedChallenges}
          peekedSolutions={peekedSolutions}
          isPremium={effectiveIsPremium}
          activeTrack={activeTrack}
          onSelectTrack={handleSwitchTrack}
          onSelectLesson={handleSelectLesson}
          claimedChapters={claimedChapters}
          onClaimChapterBonus={handleClaimChapterBonus}
          isAuthenticated={Boolean(session)}
          totalXp={xpPoints}
          streakCount={streakCount}
          lastActiveDate={lastActiveDate}
          totalSolvedCount={totalSolvedCount}
          onStartQuickMode={(mode) => setViewMode(mode)}
          onSaveStreak={() => {
            const upNext = currentLessons.find(
              (l) =>
                !completedLessons[l.id] &&
                !isLessonLockedForUser(l, effectiveIsPremium),
            );
            if (upNext) {
              openLessonInStudio(upNext);
            }
          }}
          onOpenAuth={openAuthModal}
          onOpenPaywall={() =>
            openPaywall({
              source: "companion",
              lessonTitle: "Byte-Cat Treats & Level Perks",
            })
          }
          onOpenTrackCertificate={(trackKey) => openTrackCertificate(trackKey)}
          onOpenChapterCertificate={(trackKey, chapter) =>
            openChapterCertificate(trackKey, chapter)
          }
        />
      ) : viewMode === "bughunt" ? (
        <BugHuntArena
          pyodideReady={pyodideReady}
          isPremium={effectiveIsPremium}
          onRequirePro={() =>
            openPaywall({
              source: "arena",
              lessonTitle: "Pro Production Incidents",
            })
          }
          onExecutePatch={(userCode, testHarness) =>
            executeBugPatchVerification(
              pyodideRef.current,
              userCode,
              testHarness,
            )
          }
          onAwardBugHuntXp={handleAwardBugHuntXp}
          solvedIncidents={solvedIncidents}
          renderHighlightedPython={renderHighlightedPython}
        />
      ) : viewMode === "blitz" ? (
        <SyntaxBlitzArena
          isPremium={effectiveIsPremium}
          onRequirePro={() =>
            openPaywall({
              source: "arena",
              lessonTitle: "All Speed Blitz Tracks",
            })
          }
          onAwardBlitzXp={handleAwardBlitzXp}
        />
      ) : viewMode === "algolab" ? (
        <AlgorithmVisualizerLab
          isPremium={effectiveIsPremium}
          onRequirePro={() =>
            openPaywall({
              source: "arena",
              lessonTitle: "Pro Algorithm Visual Lab",
            })
          }
          onBackToMap={() => setViewMode("roadmap")}
        />
      ) : viewMode === "achievements" ? (
        <AchievementsHall
          xpPoints={xpPoints}
          streakCount={streakCount}
          lessons={lessons}
          completedLessons={completedLessons}
          completedChallenges={completedChallenges}
          peekedSolutions={peekedSolutions}
          solvedIncidents={solvedIncidents}
          onNavigateMode={(mode) => setViewMode(mode)}
        />
      ) : (
        <View style={styles.content}>
          <StudioSidebar
            isCompactStudio={isCompactStudio}
            sidebarCollapsed={sidebarCollapsed}
            mobileDrawerOpen={mobileDrawerOpen}
            onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            onBackToMap={() => setViewMode("roadmap")}
            activeTrack={activeTrack}
            isPremium={effectiveIsPremium}
            onSwitchTrack={handleSwitchTrack}
            completedCount={completedCount}
            currentLessons={currentLessons}
            progressPercent={progressPercent}
            loading={loading}
            completedLessons={completedLessons}
            selectedLesson={selectedLesson}
            onSelectLesson={handleSelectLesson}
          />

          <View
            style={[
              styles.workspaceContainer,
              isCompactHeader && styles.workspaceContainerCompact,
            ]}
          >
            {/* Studio Subheader Bar */}
            <View style={styles.studioTopBar}>
              <View style={styles.studioTopBarLeft}>
                {isCompactStudio ? (
                  <Pressable
                    style={styles.sidebarToggleBtn}
                    onPress={() => setMobileDrawerOpen(true)}
                  >
                    <Text style={styles.sidebarToggleText}>
                      ☰ MODULES ({currentLessonIndex + 1}/
                      {currentLessons.length})
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.sidebarToggleBtn}
                    onPress={() => setSidebarCollapsed((prev) => !prev)}
                  >
                    <Text style={styles.sidebarToggleText}>
                      {sidebarCollapsed ? "☰ SHOW MODULES" : "✕ HIDE SIDEBAR"}
                    </Text>
                  </Pressable>
                )}

                {isCompactStudio && (
                  <View style={styles.mobilePaneSwitcher}>
                    <Pressable
                      style={[
                        styles.mobilePaneBtn,
                        mobileStudioPane === "learn" &&
                          styles.mobilePaneBtnActive,
                      ]}
                      onPress={() => setMobileStudioPane("learn")}
                    >
                      <Text
                        style={[
                          styles.mobilePaneText,
                          mobileStudioPane === "learn" &&
                            styles.mobilePaneTextActive,
                        ]}
                      >
                        LESSON
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.mobilePaneBtn,
                        mobileStudioPane === "code" &&
                          styles.mobilePaneBtnActive,
                      ]}
                      onPress={() => setMobileStudioPane("code")}
                    >
                      <Text
                        style={[
                          styles.mobilePaneText,
                          mobileStudioPane === "code" &&
                            styles.mobilePaneTextActive,
                        ]}
                      >
                        CODE EDITOR
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={styles.lessonNavBtns}>
                <Pressable
                  style={[
                    styles.lessonNavBtn,
                    !hasPrevLesson && styles.disabledNavBtn,
                  ]}
                  onPress={handlePrevLesson}
                  disabled={!hasPrevLesson}
                >
                  <Text style={styles.lessonNavBtnText}>← PREV</Text>
                </Pressable>
                <Text style={styles.lessonNavCounter}>
                  {String(currentLessonIndex + 1).padStart(2, "0")} /{" "}
                  {String(currentLessons.length || 1).padStart(2, "0")}
                </Text>
                <Pressable
                  style={[
                    styles.lessonNavBtn,
                    !hasNextLesson && styles.disabledNavBtn,
                  ]}
                  onPress={handleNextLesson}
                  disabled={!hasNextLesson}
                >
                  <Text style={styles.lessonNavBtnText}>NEXT →</Text>
                </Pressable>
              </View>
            </View>

            {selectedLesson ? (
              <View style={styles.workspaceGrid}>
                {(!isCompactStudio || mobileStudioPane === "learn") && (
                  <LessonProblemPanel
                    selectedLesson={selectedLesson}
                    activeTrack={activeTrack}
                    completedLessons={completedLessons}
                    completedChallenges={completedChallenges}
                    peekedSolutions={peekedSolutions}
                    activeChallengeIdx={activeChallengeIdx}
                    onSelectChallengeIdx={(idx) =>
                      handleSelectChallengeStage(idx, selectedLesson)
                    }
                    activeTab={activeTab}
                    onChangeActiveTab={setActiveTab}
                    explainStyle={explainStyle}
                    onChangeExplainStyle={setExplainStyle}
                    lessonEnrichment={lessonEnrichment}
                    onLoadGuidedSteps={(guidedCode) => {
                      usedSolutionInAttemptRef.current = true;
                      const nextPeeked = {
                        ...peekedSolutions,
                        [selectedLesson.id]: true,
                      };
                      setPeekedSolutions(nextPeeked);
                      latestGuestStateRef.current = {
                        ...latestGuestStateRef.current,
                        peekedSolutions: nextPeeked,
                      };
                      updateCodeWithDraft(
                        guidedCode,
                        selectedLesson,
                        activeChallengeIdx,
                      );
                      if (isCompactStudio) {
                        setMobileStudioPane("code");
                      }
                    }}
                    testResults={testResults}
                    isPremium={effectiveIsPremium}
                    onOpenPaywall={() =>
                      openPaywall({
                        source: "solution",
                        lessonTitle: selectedLesson.title,
                        track: selectedLesson.track,
                      })
                    }
                  />
                )}

                {(!isCompactStudio || mobileStudioPane === "code") && (
                  <StudioCodeEditor
                    selectedLesson={
                      activeChallengeIdx > 0 &&
                      selectedLesson.practiceChallenges?.[
                        activeChallengeIdx - 1
                      ]
                        ? {
                            ...selectedLesson,
                            initial_code:
                              selectedLesson.practiceChallenges[
                                activeChallengeIdx - 1
                              ].initial_code,
                          }
                        : selectedLesson
                    }
                    code={code}
                    onChangeCode={(nextCode) =>
                      updateCodeWithDraft(
                        nextCode,
                        selectedLesson,
                        activeChallengeIdx,
                      )
                    }
                    hasSavedDraft={hasSavedDraft}
                    pyodideReady={pyodideReady}
                    isExecuting={isExecuting}
                    onRunPlaygroundOnly={(snippet) => runPlaygroundOnly(snippet)}
                    onRunPythonCode={runPythonCode}
                    bottomTab={bottomTab}
                    onChangeBottomTab={setBottomTab}
                    output={output}
                    onClearOutput={() => setOutput("")}
                    testResults={testResults}
                    selectedTestIndex={selectedTestIndex}
                    onSelectTestIndex={setSelectedTestIndex}
                  />
                )}
              </View>
            ) : null}
          </View>
        </View>
      )}
      </KeyboardAvoidingView>

      {showMobileThumbNav && (
        <MobileThumbNav
          viewMode={viewMode}
          isPremium={effectiveIsPremium}
          onChangeViewMode={setViewMode}
        />
      )}

      <StudioModals
        styles={styles}
        keyboardBehavior={keyboardBehavior}
        showAuthModal={showAuthModal}
        authDefaultMode={authDefaultMode}
        authPromptReason={authPromptReason}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          if (resumePaywallAfterAuthRef.current) {
            resumePaywallAfterAuthRef.current = false;
            setShowPaywallModal(true);
          }
        }}
        onCloseAuth={() => {
          resumePaywallAfterAuthRef.current = false;
          setShowAuthModal(false);
        }}
        showPaywallModal={showPaywallModal}
        onClosePaywall={() => setShowPaywallModal(false)}
        onUpgradeToPro={handleUpgradeToPro}
        upgrading={upgrading}
        lessons={lessons}
        algoModulesCount={algoModulesCount}
        sysDesignModulesCount={sysDesignModulesCount}
        xpPoints={xpPoints}
        totalSolvedCount={totalSolvedCount}
        streakCount={streakCount}
        hasSession={Boolean(session)}
        paywallContext={paywallContext}
        paywallFreePreviewLesson={paywallFreePreviewLesson}
        onTryFreePreviewLesson={openLessonInStudio}
        showSuccessModal={showSuccessModal}
        selectedLesson={selectedLesson}
        activeChallengeIdx={activeChallengeIdx}
        lessonEnrichment={lessonEnrichment}
        hasNextLesson={hasNextLesson}
        currentLessons={currentLessons}
        currentLessonIndex={currentLessonIndex}
        completedLessons={completedLessons}
        completedChallenges={completedChallenges}
        peekedSolutions={peekedSolutions}
        activeTrack={activeTrack}
        completedCount={completedCount}
        onOpenAuthPrompt={openAuthModal}
        onOpenTrackCertificate={openTrackCertificate}
        onNextLesson={handleNextLesson}
        onCloseSuccess={() => setShowSuccessModal(false)}
        showProfileModal={showProfileModal}
        effectiveIsPremium={effectiveIsPremium}
        userEmail={session?.user?.email}
        onSelectTrack={handleSwitchTrack}
        onOpenCertificate={setActiveCertificate}
        onOpenAchievementsTab={() => {
          setShowProfileModal(false);
          setViewMode("achievements");
        }}
        onToggleDevPro={
          IS_DEV_MODE
            ? () => setDevProOverride((prev) => !(prev ?? true))
            : undefined
        }
        onCloseProfile={() => setShowProfileModal(false)}
        activeCertificate={activeCertificate}
        onCloseCertificate={() => setActiveCertificate(null)}
        activeStreakMilestone={activeStreakMilestone}
        devRank={devRank}
        onCloseStreakMilestone={() => setActiveStreakMilestone(null)}
      />
    </SafeAreaView>
  );
}
