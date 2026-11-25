import { router, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import ArcadeHub, { ArcadeSubNavBar } from "../components/ArcadeHub";
import AppHeader from "../components/AppHeader";
import { type AuthModalMode } from "../components/Auth";
import { renderHighlightedPython } from "../components/FormattedText";
import HomeMenuScreen from "../components/HomeMenuScreen";
import LessonProblemPanel from "../components/LessonProblemPanel";
import AstralDriftBackground from "../components/AstralDriftBackground";
import MobileThumbNav from "../components/MobileThumbNav";
import {
  PaywallPlanId,
  PaywallTriggerContext,
} from "../components/PaywallModal";
import { getDeveloperRank } from "../components/ProfileStatsModal";
import RoadmapTree from "../components/RoadmapTree";
import ShowcaseLandingScreen from "../components/ShowcaseLandingScreen";
import StudioCodeEditor from "../components/StudioCodeEditor";
import StudioErrorBoundary from "../components/StudioErrorBoundary";
import StudioFocusBackground from "../components/StudioFocusBackground";
import StudioModals from "../components/StudioModals";
import StudioSidebar from "../components/StudioSidebar";
import { getStudioScreenStyles } from "../components/studioScreenStyles";
import {
  buildChapterCertificate,
  buildTrackCertificate,
  CertificateData,
  ChapterTierMeta,
  isLessonInChapter,
} from "../constants/certificates";
import { getLessonEnrichment } from "../constants/curriculum";
import { StreakMilestone } from "../constants/streaks";
import {
  isStudioPaletteUnlocked,
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { useArenaRewards } from "../hooks/useArenaRewards";
import { useLessonExecution } from "../hooks/useLessonExecution";
import { useStudioSync } from "../hooks/useStudioSync";
import {
  ExplainStyle,
  isArcadeGameMode,
  isLessonLockedForUser,
  isProTrackPreviewLesson,
  Lesson,
  STORAGE_DRAFTS_KEY,
  TestCaseResult,
  ViewMode,
  writeLocalJson,
} from "../types/lesson";
import { applyAmbientPreset } from "../utils/ambientSoundscapes";
import {
  captureLandingAttribution,
  trackFunnelMilestone,
} from "../utils/attribution";
import { buildCloudSyncFeedback } from "../utils/authHelpers";
import { type CommandAction } from "../utils/commandPalette";
import { toggleLofiRadio } from "../utils/lofiRadio";
import {
  getKeyboardAvoidingBehavior,
  isCompactHeaderWidth,
  isCompactStudioWidth,
  shouldShowBottomThumbNav,
} from "../utils/mobileLayout";
import {
  executeBugPatchVerification,
  executePlaygroundPython,
} from "../utils/pyodideRunner";
import type { PythonTraceResult } from "../utils/pythonTrace";
import { playVictoryFanfare } from "../utils/soundEffects";
import {
  subscribePomodoroComplete,
  togglePomodoro,
} from "../utils/pomodoroTimer";
import { recordWeeklyXpSnapshot } from "../utils/weeklyLeague";

const AchievementsHall = React.lazy(
  () => import("../components/AchievementsHall"),
);
const AlgorithmVisualizerLab = React.lazy(
  () => import("../components/AlgorithmVisualizerLab"),
);
const BugHuntArena = React.lazy(() => import("../components/BugHuntArena"));
const FlashcardsArena = React.lazy(
  () => import("../components/FlashcardsArena"),
);
const OutputDetectiveArena = React.lazy(
  () => import("../components/OutputDetectiveArena"),
);
const MiniBuildsArena = React.lazy(
  () => import("../components/MiniBuildsArena"),
);
const PythonScratchpad = React.lazy(
  () => import("../components/PythonScratchpad"),
);
const SyntaxBlitzArena = React.lazy(
  () => import("../components/SyntaxBlitzArena"),
);
const WeeklyLeaguePanel = React.lazy(
  () => import("../components/WeeklyLeaguePanel"),
);

function ArenaLoadingFallback({
  label,
}: {
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 10,
      }}
    >
      <ActivityIndicator size="small" color={colors.lime} />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: "800",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Devy | Interactive Python, Algorithms & System Design",
    description:
      "Master Python Foundations, Algorithmic Mastery, and System Architecture with interactive playgrounds, playable mini-apps, Bug Hunt, and 60s Syntax Blitz.",
    openGraph: {
      title: "Devy | Interactive Coding Arcade",
      description:
        "Learn Python, Algorithms & System Design through live playgrounds, playable mini-apps, and 60-second coding sprints.",
      type: "website",
      images: ["/og-preview.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Devy | Interactive Coding Arcade",
      description:
        "Learn Python, Algorithms & System Design through live playgrounds, playable mini-apps, and 60-second coding sprints.",
      images: ["/og-preview.jpg"],
    },
  };
}

const EMPTY_SUBSCRIBE = () => () => {};
const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location?.hostname || "";
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.")
  );
}

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "mission" | "visual">(
    "problem",
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
  const [testRunGeneration, setTestRunGeneration] = useState<number>(0);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const usedSolutionInAttemptRef = useRef<boolean>(false);
  const usedScaffoldInAttemptRef = useRef<boolean>(false);
  const failedAttemptsByLessonRef = useRef<Record<string, number>>({});
  const [failedAttemptsByLesson, setFailedAttemptsByLesson] = useState<
    Record<string, number>
  >({});
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [activeStreakMilestone, setActiveStreakMilestone] =
    useState<StreakMilestone | null>(null);

  const { themeMode, setThemeMode, toggleTheme, setPaletteId } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authDefaultMode, setAuthDefaultMode] =
    useState<AuthModalMode>("signin");
  const [authPromptReason, setAuthPromptReason] = useState<string | undefined>(
    undefined,
  );
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const syncNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (syncNoticeTimerRef.current) {
        clearTimeout(syncNoticeTimerRef.current);
      }
    };
  }, []);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallContext, setPaywallContext] = useState<PaywallTriggerContext>({
    source: "header",
  });
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showCodexModal, setShowCodexModal] = useState<boolean>(false);
  const [activeCertificate, setActiveCertificate] =
    useState<CertificateData | null>(null);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);
  const [liveTraceResult, setLiveTraceResult] =
    useState<PythonTraceResult | null>(null);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [tracedLineNumber, setTracedLineNumber] = useState<number | null>(null);
  const [recentCompletedLessonId, setRecentCompletedLessonId] = useState<
    string | null
  >(null);
  const [recentLoftVictoryId, setRecentLoftVictoryId] = useState<string | null>(
    null,
  );
  const prevStudioCompletedRef = useRef<Record<string, boolean>>({});

  const pyodideRef = useRef<any>(null);
  const studioScrollRef =
    useRef<React.ComponentRef<typeof ScrollView> | null>(null);
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
    reviewSchedule,
    setReviewSchedule,
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
    onPasswordRecovery: () => {
      setShowShowcase(false);
      setAuthDefaultMode("update_password");
      setAuthPromptReason(undefined);
      setShowAuthModal(true);
    },
    onCloudSyncComplete: (summary) => {
      const msg = buildCloudSyncFeedback(summary);
      setSyncNotice(msg);
      if (syncNoticeTimerRef.current) {
        clearTimeout(syncNoticeTimerRef.current);
      }
      syncNoticeTimerRef.current = setTimeout(() => {
        setSyncNotice(null);
      }, 4500);
    },
    pyodideRef,
    onPyodideReady: () => setPyodideReady(true),
  });
  const searchParams = useLocalSearchParams<{
    home?: string;
    code?: string;
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

  const hasShowcaseBypass = Boolean(
    searchParams.home === "1" ||
      searchParams.lesson ||
      searchParams.mode ||
      searchParams.track ||
      searchParams.paywall ||
      searchParams.code,
  );
  const [showShowcase, setShowShowcase] = useState<boolean>(!hasShowcaseBypass);

  useEffect(() => {
    const hash =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.hash || ""
        : "";
    const hasAuthHash =
      hash.includes("access_token=") ||
      hash.includes("type=recovery") ||
      hash.includes("error=");
    if (hasShowcaseBypass || hasAuthHash) {
      queueMicrotask(() => setShowShowcase(false));
    }
  }, [hasShowcaseBypass]);

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
    if (
      mode === "arcade" ||
      mode === "bughunt" ||
      mode === "blitz" ||
      mode === "flashcards" ||
      mode === "detective" ||
      mode === "minibuilds" ||
      mode === "algolab" ||
      mode === "achievements" ||
      mode === "league"
    ) {
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
    usedScaffoldInAttemptRef.current = false;
    setActiveChallengeIdx(stageIdx);
    const draftKey = getStageDraftKey(targetLesson, stageIdx);
    const defaultCode = getStageDefaultCode(targetLesson, stageIdx);
    const draft = codeDraftsRef.current[draftKey];
    setCode(draft !== undefined ? draft : defaultCode);
    setHasSavedDraft(draft !== undefined && draft !== defaultCode);
    setOutput("");
    setTestResults(null);
    setLiveTraceResult(null);
    setTracedLineNumber(null);
    setActiveTab(
      stageIdx === 0 && !completedLessons[targetLesson.id]
        ? "problem"
        : "mission",
    );
    setBottomTab("console");
  }

  function openLessonInStudio(fullLesson: Lesson) {
    usedSolutionInAttemptRef.current = false;
    usedScaffoldInAttemptRef.current = false;
    setActiveTrack(fullLesson.track);
    setSelectedLesson(fullLesson);
    setActiveChallengeIdx(0);
    const defaultCode = (fullLesson.initial_code || "").replace(/\\n/g, "\n");
    const draft = codeDraftsRef.current[fullLesson.id];
    setCode(draft !== undefined ? draft : defaultCode);
    setHasSavedDraft(draft !== undefined && draft !== defaultCode);
    setOutput("");
    setTestResults(null);
    setLiveTraceResult(null);
    setTracedLineNumber(null);
    setActiveTab(completedLessons[fullLesson.id] ? "mission" : "problem");
    setBottomTab("console");
    setMobileDrawerOpen(false);
    setViewMode("studio");
    setTimeout(() => {
      studioScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 0);
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
    usedScaffoldInAttemptRef.current = false;
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
      setLiveTraceResult(null);
      setTracedLineNumber(null);
      setActiveTab(completedLessons[firstInTrack.id] ? "mission" : "problem");
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

  const lessonEnrichment = selectedLesson
    ? getLessonEnrichment(selectedLesson)
    : null;

  const {
    recordActiveDevSession,
    handleAwardBugHuntXp,
    handleAwardBlitzXp,
    handleAwardFlashcardXp,
    handleAwardFocusXp,
    handleClaimChapterBonus,
    handleClaimDailyQuestBonus,
  } = useArenaRewards({
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
    setActiveStreakMilestone,
    solvedIncidents,
    setSolvedIncidents,
    claimedChapters,
    setClaimedChapters,
    session,
    latestGuestStateRef,
    onOpenChapterCertificate: openChapterCertificate,
  });

  const { runPlaygroundOnly, runTraceExecution, runPythonCode } =
    useLessonExecution({
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
      onFailedAttemptsChange: (lessonId, count) => {
        setFailedAttemptsByLesson((prev) => ({ ...prev, [lessonId]: count }));
      },
      onTestRunCompleted: () => {
        setTestRunGeneration((prev) => prev + 1);
      },
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
    });

  const styles = useThemedStyles(getStudioScreenStyles);
  const devRank = getDeveloperRank(xpPoints);

  // Capture newly solved Code Studio lessons so returning to Skill Map or Home Loft plays a celebration
  useEffect(() => {
    if (viewMode === "studio") {
      const newlySolved = Object.keys(completedLessons).find(
        (id) => completedLessons[id] && !prevStudioCompletedRef.current[id],
      );
      if (newlySolved) {
        setRecentCompletedLessonId(newlySolved);
        setRecentLoftVictoryId(newlySolved);
      }
    }
    prevStudioCompletedRef.current = completedLessons;
  }, [completedLessons, viewMode]);

  const handleDevSetLessonsCompletion = useCallback(
    (updates: Record<string, boolean>) => {
      setCompletedLessons((prev) => {
        const next: Record<string, boolean> = { ...prev };
        for (const [id, done] of Object.entries(updates)) {
          if (done) {
            next[id] = true;
          } else {
            delete next[id];
          }
        }
        latestGuestStateRef.current.completedLessons = next;
        return next;
      });
    },
    [setCompletedLessons, latestGuestStateRef],
  );

  const focusAwardRef = useRef(handleAwardFocusXp);
  useEffect(() => {
    focusAwardRef.current = handleAwardFocusXp;
  });

  useEffect(() => {
    return subscribePomodoroComplete((event) => {
      if (event.rewardXp > 0) {
        void focusAwardRef.current(event.rewardXp);
        setSyncNotice(
          `Focus block complete! +${event.rewardXp} XP · 5m tea break queued`,
        );
      } else {
        setSyncNotice("Tea break finished! Ready for your next cozy coding block");
      }
      if (syncNoticeTimerRef.current) {
        clearTimeout(syncNoticeTimerRef.current);
      }
      syncNoticeTimerRef.current = setTimeout(() => {
        setSyncNotice(null);
      }, 5000);
    });
  }, []);

  useEffect(() => {
    recordWeeklyXpSnapshot(xpPoints);
  }, [xpPoints]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowCodexModal(false);
        setShowCommandPalette((prev) => !prev);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setShowCommandPalette(false);
        setShowCodexModal((prev) => !prev);
        return;
      }
      if (event.key === "Escape") {
        setShowCommandPalette((prev) => (prev ? false : prev));
        setShowCodexModal((prev) => (prev ? false : prev));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleExecuteCommandAction(action: CommandAction) {
    switch (action.type) {
      case "view_mode":
        setViewMode(action.mode);
        return;
      case "route":
        router.push(action.href);
        return;
      case "lesson": {
        const target = lessons.find((l) => l.id === action.lessonId);
        if (target) {
          handleSelectLesson(target);
        }
        return;
      }
      case "toggle_theme":
        toggleTheme();
        return;
      case "set_palette": {
        if (
          isStudioPaletteUnlocked(
            action.paletteId,
            devRank.level,
            effectiveIsPremium,
          )
        ) {
          setPaletteId(action.paletteId);
        } else {
          openPaywall({
            source: "header",
            lessonTitle: "All 4 Cozy Studio Theme Palettes",
          });
        }
        return;
      }
      case "toggle_lofi":
        toggleLofiRadio();
        return;
      case "ambient_preset":
        applyAmbientPreset(action.presetId);
        return;
      case "toggle_pomodoro":
        togglePomodoro();
        return;
      case "open_settings":
        setShowSettingsModal(true);
        return;
      case "open_profile":
        setShowProfileModal(true);
        return;
      case "open_codex":
        setShowCodexModal(true);
        return;
    }
  }

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
      ? `${selectedLesson.title} | Devy`
      : viewMode === "arcade"
        ? "Cozy Coding Arcade | Devy"
        : viewMode === "bughunt"
          ? "Bug Hunt Arena | Devy"
          : viewMode === "blitz"
            ? "60s Syntax Blitz | Devy"
            : viewMode === "flashcards"
              ? "Flashcards Concept Deck | Devy"
              : viewMode === "detective"
                ? "Output Detective | Devy"
                : viewMode === "minibuilds"
                  ? "Cozy Mini-Builds | Devy"
                  : viewMode === "algolab"
                ? "Pro Algorithm Visual Lab | Devy"
                : viewMode === "league"
                  ? "Weekly League Leaderboard | Devy"
                  : "Devy | Interactive Python, Algorithms & System Design";

  const seoDescription =
    viewMode === "studio" && selectedLesson
      ? `${selectedLesson.description} Practice interactively in the live Devy studio.`
      : viewMode === "arcade"
        ? "Play bite-sized Python & algorithm mini-games including Bug Hunt, 60s Speed Blitz, and Flashcards Deck in the Devy Cozy Arcade."
        : viewMode === "bughunt"
          ? "Spot and fix broken Python and algorithm snippets in the Devy Bug Hunt Arena."
          : viewMode === "blitz"
            ? "Race the 60-second clock to predict outputs and spot syntax bugs in Devy."
            : viewMode === "algolab"
              ? "Observe Binary Search, Two Pointers, Sliding Window, Sorting, Hash Maps, and BFS step-by-step in the Pro Algorithm Visual Lab."
              : viewMode === "league"
                ? "Track your weekly XP rank against cozy ghost rivals and climb the Devy Weekly League ladder."
                : "Master Python Foundations, Algorithmic Mastery, and System Architecture with interactive playgrounds, playable mini-apps, Bug Hunt, and 60s Syntax Blitz.";

  const activeBackdropAccent =
    viewMode === "arcade"
      ? StudioColors.pink
      : viewMode === "bughunt"
        ? StudioColors.coral
        : viewMode === "blitz" || viewMode === "league"
          ? StudioColors.lime
          : viewMode === "flashcards"
            ? StudioColors.mint
            : viewMode === "detective"
              ? "#38BDF8"
              : viewMode === "minibuilds" || viewMode === "algolab"
                ? StudioColors.violet
              : TrackThemes[activeTrack]?.stickerBg || StudioColors.yellow;

  if (showShowcase) {
    return (
      <>
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
        <ShowcaseLandingScreen
          onEnterHome={() => {
            setViewMode("home");
            setShowShowcase(false);
          }}
        />
      </>
    );
  }

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
        <AstralDriftBackground
          themeMode={themeMode}
          section={viewMode}
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
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenCodex={() => setShowCodexModal(true)}
        onOpenPaywall={() => openPaywall({ source: "header" })}
        onOpenAuth={() => openAuthModal()}
        onSignOut={() => supabase.auth.signOut()}
      />

      {syncNotice ? (
        <Pressable
          onPress={() => setSyncNotice(null)}
          style={{
            alignSelf: "center",
            backgroundColor: StudioColors.emeraldSoft,
            borderColor: StudioColors.ink,
            borderWidth: 1.5,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 5,
            marginTop: 6,
          }}
        >
          <Text
            style={{
              color: "#065F46",
              fontSize: 11,
              fontWeight: "900",
              letterSpacing: 0.3,
            }}
          >
            ✓ {syncNotice}
          </Text>
        </Pressable>
      ) : null}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >

      {viewMode === "home" ? (
        <HomeMenuScreen
          lessons={lessons}
          completedLessons={completedLessons}
          peekedSolutions={peekedSolutions}
          reviewSchedule={reviewSchedule}
          solvedIncidents={solvedIncidents}
          isPremium={effectiveIsPremium}
          activeTrack={activeTrack}
          totalXp={xpPoints}
          streakCount={streakCount}
          lastActiveDate={lastActiveDate}
          totalSolvedCount={totalSolvedCount}
          resumeLesson={hasSavedDraft && selectedLesson ? selectedLesson : null}
          onSelectTrack={handleSwitchTrack}
          onSelectLesson={handleSelectLesson}
          onNavigateMode={(mode) => setViewMode(mode)}
          onClaimDailyQuestBonus={handleClaimDailyQuestBonus}
          recentVictoryLessonId={recentLoftVictoryId}
          onConsumeVictory={() => setRecentLoftVictoryId(null)}
          enableDevTools={IS_DEV_MODE || (isMounted && isLocalDevHost())}
        />
      ) : viewMode === "roadmap" ? (
        <RoadmapTree
          lessons={lessons}
          completedLessons={completedLessons}
          completedChallenges={completedChallenges}
          peekedSolutions={peekedSolutions}
          reviewSchedule={reviewSchedule}
          isPremium={effectiveIsPremium}
          activeTrack={activeTrack}
          onSelectTrack={handleSwitchTrack}
          onSelectLesson={handleSelectLesson}
          claimedChapters={claimedChapters}
          onClaimChapterBonus={handleClaimChapterBonus}
          onClaimDailyQuestBonus={handleClaimDailyQuestBonus}
          isAuthenticated={Boolean(session)}
          totalXp={xpPoints}
          streakCount={streakCount}
          lastActiveDate={lastActiveDate}
          totalSolvedCount={totalSolvedCount}
          resumeLesson={hasSavedDraft && selectedLesson ? selectedLesson : null}
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
          onOpenTrackCertificate={(trackKey) => openTrackCertificate(trackKey)}
          onOpenChapterCertificate={(trackKey, chapter) =>
            openChapterCertificate(trackKey, chapter)
          }
          recentlyCompletedLessonId={recentCompletedLessonId}
          onConsumeRecentCompletion={() => setRecentCompletedLessonId(null)}
          onDevSetLessonsCompletion={
            IS_DEV_MODE || (isMounted && isLocalDevHost())
              ? handleDevSetLessonsCompletion
              : undefined
          }
        />
      ) : viewMode === "arcade" ||
        viewMode === "bughunt" ||
        viewMode === "blitz" ||
        viewMode === "flashcards" ||
        viewMode === "detective" ||
        viewMode === "minibuilds" ||
        viewMode === "playground" ||
        viewMode === "algolab" ||
        viewMode === "achievements" ||
        viewMode === "league" ? (
        <View style={{ flex: 1 }}>
          {isArcadeGameMode(viewMode) && (
            <ArcadeSubNavBar
              activeMode={viewMode}
              onSelectMode={(next) => setViewMode(next)}
            />
          )}
          <StudioErrorBoundary
            onReset={() => setViewMode("roadmap")}
            fallbackTitle="Arena interrupted"
          >
            <Suspense
              fallback={
                <ArenaLoadingFallback
                  label={
                    viewMode === "arcade"
                      ? "Loading Cozy Arcade..."
                      : viewMode === "bughunt"
                        ? "Loading Bug Hunt Arena..."
                        : viewMode === "blitz"
                          ? "Loading Speed Blitz..."
                          : viewMode === "flashcards"
                            ? "Shuffling Flashcards Deck..."
                            : viewMode === "detective"
                              ? "Opening Detective Casebook..."
                              : viewMode === "minibuilds"
                                ? "Booting Mini-Builds Workbench..."
                                : viewMode === "playground"
                                  ? "Opening playground.py..."
                                  : viewMode === "algolab"
                                    ? "Loading Algorithm Lab..."
                                    : viewMode === "league"
                                      ? "Loading Weekly League..."
                                      : "Loading Trophy Hall..."
                  }
                />
              }
            >
              {viewMode === "arcade" ? (
                <ArcadeHub
                  xpPoints={xpPoints}
                  streakCount={streakCount}
                  solvedIncidents={solvedIncidents}
                  isPremium={effectiveIsPremium}
                  onLaunchGame={(game) => setViewMode(game)}
                  onBackToMap={() => setViewMode("roadmap")}
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
            ) : viewMode === "flashcards" ? (
              <FlashcardsArena
                isPremium={effectiveIsPremium}
                onRequirePro={() =>
                  openPaywall({
                    source: "arena",
                    lessonTitle: "All Pro Flashcard Concept Decks",
                  })
                }
                onAwardFlashcardXp={(earned) => handleAwardFlashcardXp(earned)}
                onBackToMap={() => setViewMode("roadmap")}
              />
            ) : viewMode === "detective" ? (
              <OutputDetectiveArena
                isPremium={effectiveIsPremium}
                onRequirePro={() =>
                  openPaywall({
                    source: "arena",
                    lessonTitle: "All Pro Output Detective Cases",
                  })
                }
                onAwardDetectiveXp={(earned) => handleAwardFlashcardXp(earned)}
                onBackToArcade={() => setViewMode("arcade")}
              />
            ) : viewMode === "minibuilds" ? (
              <MiniBuildsArena
                pyodideReady={pyodideReady}
                isPremium={effectiveIsPremium}
                onRequirePro={() =>
                  openPaywall({
                    source: "arena",
                    lessonTitle: "Pro Cozy Mini-Builds Sandbox",
                  })
                }
                onRunPython={(script) =>
                  executePlaygroundPython(pyodideRef.current, script)
                }
                onVerifyBuild={(userCode, harness) =>
                  executeBugPatchVerification(
                    pyodideRef.current,
                    userCode,
                    harness,
                  )
                }
                onAwardBuildXp={(earned) => handleAwardFlashcardXp(earned)}
              />
            ) : viewMode === "playground" ? (
              <PythonScratchpad
                pyodideReady={pyodideReady}
                onRunPython={(script) =>
                  executePlaygroundPython(pyodideRef.current, script)
                }
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
            ) : viewMode === "league" ? (
              <WeeklyLeaguePanel
                xpPoints={xpPoints}
                streakCount={streakCount}
                sessionUserId={session?.user?.id}
                userEmail={session?.user?.email}
                onOpenAuth={() =>
                  openAuthModal(
                    "signup",
                    "Sign in to opt into the live Weekly League leaderboard.",
                  )
                }
                onNavigateMode={(mode) => setViewMode(mode)}
              />
            ) : (
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
            )}
          </Suspense>
        </StudioErrorBoundary>
        </View>
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
              <ScrollView
                ref={studioScrollRef}
                style={styles.workspaceScroll}
                contentContainerStyle={styles.workspaceGrid}
                keyboardShouldPersistTaps="handled"
              >
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
                    userCode={code}
                    onApplyScaffold={(scaffoldCode) => {
                      usedScaffoldInAttemptRef.current = true;
                      updateCodeWithDraft(
                        scaffoldCode,
                        selectedLesson,
                        activeChallengeIdx,
                      );
                      if (isCompactStudio) {
                        setMobileStudioPane("code");
                      }
                    }}
                    liveTraceResult={liveTraceResult}
                    isTracing={isTracing}
                    onRunLiveTrace={(customDriver) =>
                      void runTraceExecution(customDriver)
                    }
                    onTracedLineChange={setTracedLineNumber}
                    testResults={testResults}
                    isPremium={effectiveIsPremium}
                    onOpenPaywall={() =>
                      openPaywall({
                        source: "solution",
                        lessonTitle: selectedLesson.title,
                        track: selectedLesson.track,
                      })
                    }
                    onRequestScrollTop={() =>
                      studioScrollRef.current?.scrollTo({ y: 0, animated: false })
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
                    tracedLineNumber={
                      activeTab === "visual" ? tracedLineNumber : null
                    }
                    isTracing={isTracing}
                    onTraceCode={() => void runTraceExecution()}
                    onRunPlaygroundOnly={(snippet) => runPlaygroundOnly(snippet)}
                    onRunPythonCode={runPythonCode}
                    bottomTab={bottomTab}
                    onChangeBottomTab={setBottomTab}
                    output={output}
                    onClearOutput={() => setOutput("")}
                    testResults={testResults}
                    selectedTestIndex={selectedTestIndex}
                    onSelectTestIndex={setSelectedTestIndex}
                    failedAttemptCount={
                      failedAttemptsByLesson[selectedLesson.id] || 0
                    }
                    lessonHints={
                      activeChallengeIdx > 0 &&
                      selectedLesson.practiceChallenges?.[
                        activeChallengeIdx - 1
                      ]?.hints
                        ? selectedLesson.practiceChallenges[
                            activeChallengeIdx - 1
                          ].hints
                        : selectedLesson.hints
                    }
                    onOpenCodex={() => setShowCodexModal(true)}
                    testRunGeneration={testRunGeneration}
                    isStickyDesktop={!isCompactStudio}
                  />
                )}
              </ScrollView>
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
        lastActiveDate={lastActiveDate}
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
        showSettingsModal={showSettingsModal}
        pyodideReady={pyodideReady}
        onOpenSettingsPaywall={() =>
          openPaywall({
            source: "header",
            lessonTitle: "All 4 Cozy Studio Theme Palettes",
          })
        }
        onCloseSettings={() => setShowSettingsModal(false)}
        showCommandPalette={showCommandPalette}
        onExecuteCommand={handleExecuteCommandAction}
        onCloseCommandPalette={() => setShowCommandPalette(false)}
        showCodexModal={showCodexModal}
        isStudioActive={viewMode === "studio" && Boolean(selectedLesson)}
        onInsertCodexSnippet={(snippet) => {
          if (!selectedLesson) return;
          const base = (code || "").trimEnd();
          const combined = base ? `${base}\n\n${snippet}\n` : `${snippet}\n`;
          updateCodeWithDraft(combined, selectedLesson, activeChallengeIdx);
        }}
        onJumpToLessonFromCodex={(lesson) => {
          if (lessons.some((l) => l.id === lesson.id)) {
            handleSelectLesson(lesson);
          } else if (!isLessonLockedForUser(lesson, effectiveIsPremium)) {
            openLessonInStudio(lesson);
          } else {
            openPaywall({
              source: "lesson",
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              track: lesson.track,
            });
          }
        }}
        onOpenCodexModal={() => setShowCodexModal(true)}
        onCloseCodexModal={() => setShowCodexModal(false)}
        activeCertificate={activeCertificate}
        onCloseCertificate={() => setActiveCertificate(null)}
        activeStreakMilestone={activeStreakMilestone}
        devRank={devRank}
        onCloseStreakMilestone={() => setActiveStreakMilestone(null)}
      />
    </SafeAreaView>
  );
}
