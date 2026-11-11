import { Session } from "@supabase/supabase-js";
import { useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import AppHeader from "../components/AppHeader";
import Auth from "../components/Auth";
import BugHuntArena from "../components/BugHuntArena";
import CertificateModal from "../components/CertificateModal";
import { renderHighlightedPython } from "../components/FormattedText";
import LessonProblemPanel from "../components/LessonProblemPanel";
import MinimalPcbBackground from "../components/MinimalPcbBackground";
import PaywallModal, {
  PaywallPlanId,
  PaywallTriggerContext,
} from "../components/PaywallModal";
import ProfileStatsModal, {
  getDeveloperRank,
} from "../components/ProfileStatsModal";
import RoadmapTree from "../components/RoadmapTree";
import StudioCodeEditor from "../components/StudioCodeEditor";
import StudioSidebar from "../components/StudioSidebar";
import SuccessModal from "../components/SuccessModal";
import SyntaxBlitzArena from "../components/SyntaxBlitzArena";
import {
  buildChapterCertificate,
  buildTrackCertificate,
  CertificateData,
  ChapterTierMeta,
  TRACK_CHAPTERS,
} from "../constants/certificates";
import {
  getLessonEnrichment,
  mergeCurriculumLessons,
} from "../constants/curriculum";
import {
  applyColorTheme,
  HardShadowSm,
  MonoFont,
  StudioColors,
  ThemeMode,
  TrackThemes,
} from "../constants/theme";
import {
  ExplainStyle,
  isLessonLockedForUser,
  isProTrackPreviewLesson,
  Lesson,
  readLocalJson,
  STORAGE_DRAFTS_KEY,
  STORAGE_STATE_KEY,
  TestCaseResult,
  ViewMode,
  writeLocalJson,
} from "../types/lesson";
import {
  executeBugPatchVerification,
  executeLessonVerification,
  executePlaygroundPython,
  loadPyodideScript,
} from "../utils/pyodideRunner";
import {
  playErrorBuzz,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";

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

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");
  const [activeTrack, setActiveTrack] = useState<string>("python_basics");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "mission" | "visual">(
    "problem",
  );
  const [explainStyle, setExplainStyle] = useState<ExplainStyle>("analogy");
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [solvedQuizzes, setSolvedQuizzes] = useState<Record<string, boolean>>(
    {},
  );
  const [bottomTab, setBottomTab] = useState<"console" | "tests">("console");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [mobileStudioPane, setMobileStudioPane] = useState<"learn" | "code">(
    "learn",
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { width: rawWindowWidth } = useWindowDimensions();
  const viewportWidth =
    isMounted && rawWindowWidth > 0 ? rawWindowWidth : 1280;
  const isCompactStudio = viewportWidth < 920;
  const isCompactHeader = viewportWidth < 720;

  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, boolean>
  >({});
  const [solvedIncidents, setSolvedIncidents] = useState<
    Record<string, boolean>
  >({});

  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [dailyCompletedDate, setDailyCompletedDate] = useState<string | null>(
    null,
  );
  const [claimedChapters, setClaimedChapters] = useState<
    Record<string, boolean>
  >({});

  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
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
  const codeDraftsRef = useRef<Record<string, string>>({});
  const hydratedRef = useRef<boolean>(false);
  const resumePaywallAfterAuthRef = useRef<boolean>(false);
  const handledDeepLinkRef = useRef<boolean>(false);
  const latestGuestStateRef = useRef<{
    xpPoints: number;
    streakCount: number;
    completedLessons: Record<string, boolean>;
  }>({
    xpPoints: 0,
    streakCount: 0,
    completedLessons: {},
  });

  useEffect(() => {
    if (!hydratedRef.current) return;
    latestGuestStateRef.current = {
      xpPoints,
      streakCount,
      completedLessons,
    };
  }, [xpPoints, streakCount, completedLessons]);
  const searchParams = useLocalSearchParams<{
    lesson?: string;
    mode?: string;
    track?: string;
  }>();

  function updateCodeWithDraft(nextCode: string, lessonObj?: Lesson | null) {
    setCode(nextCode);
    const targetLesson = lessonObj !== undefined ? lessonObj : selectedLesson;
    if (!targetLesson) return;
    const defaultCode = (targetLesson.initial_code || "").replace(/\\n/g, "\n");
    if (nextCode !== defaultCode) {
      codeDraftsRef.current[targetLesson.id] = nextCode;
      setHasSavedDraft(true);
    } else {
      delete codeDraftsRef.current[targetLesson.id];
      setHasSavedDraft(false);
    }
    writeLocalJson(STORAGE_DRAFTS_KEY, codeDraftsRef.current);
  }

  useEffect(() => {
    setIsMounted(true);
    const savedDrafts = readLocalJson<Record<string, string>>(
      STORAGE_DRAFTS_KEY,
      {},
    );
    codeDraftsRef.current = savedDrafts;

    const savedState = readLocalJson<{
      completedLessons?: Record<string, boolean>;
      solvedIncidents?: Record<string, boolean>;
      claimedChapters?: Record<string, boolean>;
      xpPoints?: number;
      streakCount?: number;
      dailyCompletedDate?: string | null;
      activeTrack?: string;
      lastLessonId?: string;
      themeMode?: ThemeMode;
    }>(STORAGE_STATE_KEY, {});

    if (savedState.completedLessons) {
      setCompletedLessons(savedState.completedLessons);
    }
    if (savedState.solvedIncidents) {
      setSolvedIncidents(savedState.solvedIncidents);
    }
    if (savedState.claimedChapters) {
      setClaimedChapters(savedState.claimedChapters);
    }
    if (typeof savedState.xpPoints === "number") {
      setXpPoints(savedState.xpPoints);
    }
    if (typeof savedState.streakCount === "number") {
      setStreakCount(savedState.streakCount);
    }
    if (savedState.dailyCompletedDate) {
      setDailyCompletedDate(savedState.dailyCompletedDate);
    }
    const initialTheme: ThemeMode =
      savedState.themeMode === "dark" ? "dark" : "light";
    setThemeMode(initialTheme);
    applyColorTheme(initialTheme);

    const safeInitialTrack =
      savedState.activeTrack && TrackThemes[savedState.activeTrack]
        ? savedState.activeTrack
        : "python_basics";
    setActiveTrack(safeInitialTrack);
    latestGuestStateRef.current = {
      xpPoints:
        typeof savedState.xpPoints === "number" ? savedState.xpPoints : 0,
      streakCount:
        typeof savedState.streakCount === "number" ? savedState.streakCount : 0,
      completedLessons: savedState.completedLessons || {},
    };
    hydratedRef.current = true;

    fetchLessons(
      safeInitialTrack,
      savedState.lastLessonId as string | undefined,
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncCloudAndGuestAccount(session.user.id, session.user.email);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          setShowAuthModal(false);
          if (resumePaywallAfterAuthRef.current) {
            resumePaywallAfterAuthRef.current = false;
            setShowPaywallModal(true);
          }
          syncCloudAndGuestAccount(session.user.id, session.user.email);
        } else {
          setIsPremium(false);
          setActiveTrack("python_basics");
        }
      },
    );

    if (Platform.OS === "web") {
      loadPyodideScript(pyodideRef, () => setPyodideReady(true));
    }
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    applyColorTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (handledDeepLinkRef.current) return;
    const { lesson, mode, track } = searchParams;
    if (!lesson && !mode && !track) return;

    if (mode === "bughunt") {
      handledDeepLinkRef.current = true;
      setViewMode("bughunt");
      return;
    }
    if (mode === "blitz") {
      handledDeepLinkRef.current = true;
      setViewMode("blitz");
      return;
    }
    if (lessons.length === 0) return;

    if (lesson) {
      handledDeepLinkRef.current = true;
      handleSelectLesson({ id: lesson });
      return;
    }
    if (track && TrackThemes[track]) {
      handledDeepLinkRef.current = true;
      handleSwitchTrack(track);
      setViewMode("roadmap");
    }
  }, [searchParams, lessons]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    writeLocalJson(STORAGE_STATE_KEY, {
      completedLessons,
      solvedIncidents,
      claimedChapters,
      xpPoints,
      streakCount,
      dailyCompletedDate,
      activeTrack,
      lastLessonId: selectedLesson?.id,
      themeMode,
    });
  }, [
    completedLessons,
    solvedIncidents,
    claimedChapters,
    xpPoints,
    streakCount,
    dailyCompletedDate,
    activeTrack,
    selectedLesson?.id,
    themeMode,
  ]);

  async function fetchLessons(
    preferredTrack?: string,
    preferredLessonId?: string,
  ) {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_order", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error);
        const fallbackAll = mergeCurriculumLessons<Lesson>([]);
        setLessons(fallbackAll);
      } else {
        const all = mergeCurriculumLessons<Lesson>((data as Lesson[]) || []);
        setLessons(all);
        const targetTrack =
          preferredTrack && TrackThemes[preferredTrack]
            ? preferredTrack
            : "python_basics";
        const candidateById = preferredLessonId
          ? all.find((l) => l.id === preferredLessonId)
          : undefined;
        const allowedCandidate =
          candidateById && !isLessonLockedForUser(candidateById, isPremium)
            ? candidateById
            : undefined;
        const initialLesson =
          allowedCandidate ||
          all.find(
            (l) =>
              l.track === targetTrack && !isLessonLockedForUser(l, isPremium),
          ) ||
          all.find((l) => l.track === "python_basics" && l.is_free) ||
          all.find((l) => l.track === "python_basics");
        if (initialLesson) {
          setSelectedLesson(initialLesson);
          const defaultCode = (initialLesson.initial_code || "").replace(
            /\\n/g,
            "\n",
          );
          const draft = codeDraftsRef.current[initialLesson.id];
          setCode(draft !== undefined ? draft : defaultCode);
          setHasSavedDraft(draft !== undefined && draft !== defaultCode);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function syncCloudAndGuestAccount(userId: string, userEmail?: string) {
    try {
      const guest = latestGuestStateRef.current;
      const [{ data: profileData }, { data: progressRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("is_premium, xp_points, streak_count")
          .eq("id", userId)
          .single(),
        supabase
          .from("user_progress")
          .select("lesson_id, completed")
          .eq("user_id", userId),
      ]);

      const cloudProgressMap: Record<string, boolean> = {};
      progressRows?.forEach((row) => {
        if (row.completed) cloudProgressMap[row.lesson_id] = true;
      });

      const cloudXp = profileData?.xp_points || 0;
      const cloudStreak = profileData?.streak_count || 0;
      const mergedXp = Math.max(cloudXp, guest.xpPoints);
      const mergedStreak = Math.max(cloudStreak, guest.streakCount);

      if (profileData) {
        setIsPremium(profileData.is_premium || false);
      }
      setXpPoints(mergedXp);
      setStreakCount(mergedStreak);
      setCompletedLessons((prev) => ({ ...prev, ...cloudProgressMap }));

      const shouldSyncProfileToCloud =
        guest.xpPoints > cloudXp ||
        guest.streakCount > cloudStreak ||
        (!profileData && (guest.xpPoints > 0 || guest.streakCount > 0));

      if (shouldSyncProfileToCloud) {
        await supabase.from("profiles").upsert({
          id: userId,
          email: userEmail,
          xp_points: mergedXp,
          streak_count: mergedStreak,
          last_completed_at: new Date().toISOString(),
        });
      }

      const missingLessonIds = Object.keys(guest.completedLessons).filter(
        (id) =>
          guest.completedLessons[id] &&
          !id.startsWith("exp-") &&
          !cloudProgressMap[id],
      );
      if (missingLessonIds.length > 0) {
        const timestamp = new Date().toISOString();
        await Promise.all(
          missingLessonIds.map((lessonId) =>
            supabase.from("user_progress").upsert({
              user_id: userId,
              lesson_id: lessonId,
              completed: true,
              updated_at: timestamp,
            }),
          ),
        );
      }
    } catch (err) {
      console.error("Failed to sync account state:", err);
    }
  }

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
  }

  function openPaywall(context: PaywallTriggerContext = { source: "header" }) {
    setPaywallContext(context);
    setShowPaywallModal(true);
  }

  function openLessonInStudio(fullLesson: Lesson) {
    setActiveTrack(fullLesson.track);
    setSelectedLesson(fullLesson);
    const defaultCode = (fullLesson.initial_code || "").replace(/\\n/g, "\n");
    const draft = codeDraftsRef.current[fullLesson.id];
    setCode(draft !== undefined ? draft : defaultCode);
    setHasSavedDraft(draft !== undefined && draft !== defaultCode);
    setOutput("");
    setTestResults(null);
    setQuizSelection(null);
    setActiveTab("problem");
    setBottomTab("console");
    setMobileDrawerOpen(false);
    setViewMode("studio");
  }

  async function handleUpgradeToPro(_plan: PaywallPlanId = "annual") {
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
    setActiveTrack(trackName);
    const firstInTrack = lessons.find(
      (l) => l.track === trackName && !isLessonLockedForUser(l, isPremium),
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
    }
  }

  function handleSelectLesson(lesson: { id: string }) {
    const fullLesson = lessons.find((item) => item.id === lesson.id);
    if (!fullLesson) return;

    if (isLessonLockedForUser(fullLesson, isPremium)) {
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

  function handleNextLesson() {
    setShowSuccessModal(false);
    if (!selectedLesson) return;
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

  async function runPlaygroundOnly() {
    setIsExecuting(true);
    setBottomTab("console");
    setOutput("Running code...");
    try {
      const consoleOut = await executePlaygroundPython(
        pyodideRef.current,
        code,
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

    try {
      const outcome = await executeLessonVerification(
        pyodideRef.current,
        code,
        selectedLesson,
      );

      setTestResults(outcome.testResults);
      if (outcome.testResults) {
        setSelectedTestIndex(0);
      }
      setBottomTab(outcome.targetTab);
      setOutput(outcome.consoleOutput);

      if (outcome.allPassed && selectedLesson) {
        setShowSuccessModal(true);
        const isAlreadyCompleted = completedLessons[selectedLesson.id];
        const newXp = isAlreadyCompleted ? xpPoints : xpPoints + 50;
        const newStreak = isAlreadyCompleted
          ? streakCount
          : streakCount === 0
            ? 1
            : streakCount;

        if (!isAlreadyCompleted) {
          setXpPoints(newXp);
          setStreakCount(newStreak);
        }
        setCompletedLessons((prev) => ({
          ...prev,
          [selectedLesson.id]: true,
        }));

        if (session) {
          if (!selectedLesson.id.startsWith("exp-")) {
            await supabase.from("user_progress").upsert({
              user_id: session.user.id,
              lesson_id: selectedLesson.id,
              completed: true,
              updated_at: new Date().toISOString(),
            });
          }

          if (!isAlreadyCompleted) {
            await supabase.from("profiles").upsert({
              id: session.user.id,
              email: session.user.email,
              xp_points: newXp,
              streak_count: newStreak,
              last_completed_at: new Date().toISOString(),
            });
          }
        }
      }
    } finally {
      setIsExecuting(false);
    }
  }

  async function handleAwardBugHuntXp(xpEarned: number, incidentId: string) {
    const alreadySolved = solvedIncidents[incidentId];
    setSolvedIncidents((prev) => ({ ...prev, [incidentId]: true }));
    if (alreadySolved) return;

    const newXp = xpPoints + xpEarned;
    const newStreak = streakCount === 0 ? 1 : streakCount;
    setXpPoints(newXp);
    setStreakCount(newStreak);

    if (session) {
      try {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email,
          xp_points: newXp,
          streak_count: newStreak,
          last_completed_at: new Date().toISOString(),
        });
      } catch (_e) {}
    }
  }

  async function handleAwardBlitzXp(xpEarned: number) {
    if (xpEarned <= 0) return;
    const newXp = xpPoints + xpEarned;
    const newStreak = streakCount === 0 ? 1 : streakCount;
    setXpPoints(newXp);
    setStreakCount(newStreak);

    if (session) {
      try {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email,
          xp_points: newXp,
          streak_count: newStreak,
          last_completed_at: new Date().toISOString(),
        });
      } catch (_e) {}
    }
  }

  async function handleClaimDailyWarmup(dateKey: string, bonusXp: number) {
    if (dailyCompletedDate === dateKey) return;
    const newXp = xpPoints + bonusXp;
    const newStreak = streakCount + 1;
    setDailyCompletedDate(dateKey);
    setXpPoints(newXp);
    setStreakCount(newStreak);

    if (session) {
      try {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email,
          xp_points: newXp,
          streak_count: newStreak,
          last_completed_at: new Date().toISOString(),
        });
      } catch (_e) {}
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
      (l) =>
        l.track === trackKey &&
        l.lesson_order >= chapter.minOrder &&
        l.lesson_order <= chapter.maxOrder,
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
    setClaimedChapters((prev) => ({ ...prev, [chapterKey]: true }));
    setXpPoints(newXp);
    setStreakCount(newStreak);

    const [trackKey, chIdRaw] = chapterKey.split("_ch_");
    const chapterMeta = (TRACK_CHAPTERS[trackKey] || []).find(
      (c) => String(c.id) === chIdRaw,
    );
    if (chapterMeta) {
      openChapterCertificate(trackKey, chapterMeta, newXp, newStreak);
    }

    if (session) {
      try {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email,
          xp_points: newXp,
          streak_count: newStreak,
          last_completed_at: new Date().toISOString(),
        });
      } catch (_e) {}
    }
  }

  // Ensure styles re-compute on theme change
  void themeMode;
  const styles = getStyles();
  const devRank = getDeveloperRank(xpPoints);
  const lessonEnrichment = selectedLesson
    ? getLessonEnrichment(selectedLesson)
    : null;

  function handleSelectQuizOption(optionIdx: number) {
    if (!selectedLesson || !lessonEnrichment) return;
    setQuizSelection(optionIdx);
    if (optionIdx === lessonEnrichment.quiz.correctIndex) {
      playSuccessChime();
      if (!solvedQuizzes[selectedLesson.id]) {
        setSolvedQuizzes((prev) => ({ ...prev, [selectedLesson.id]: true }));
        setXpPoints((prev) => prev + 10);
      }
    } else {
      playErrorBuzz();
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
      ? `${selectedLesson.title} | DevLearn Arcade`
      : viewMode === "bughunt"
        ? "Bug Hunt Arena | DevLearn Arcade"
        : viewMode === "blitz"
          ? "60s Syntax Blitz | DevLearn Arcade"
          : "DevLearn Arcade | Interactive Python, Algorithms & System Design";

  const seoDescription =
    viewMode === "studio" && selectedLesson
      ? `${selectedLesson.description} Practice interactively in the live DevLearn Arcade studio.`
      : viewMode === "bughunt"
        ? "Spot and fix broken Python and algorithm snippets in the DevLearn Arcade Bug Hunt Arena."
        : viewMode === "blitz"
          ? "Race the 60-second clock to predict outputs and spot syntax bugs in DevLearn Arcade."
          : "Master Python Foundations, Algorithmic Mastery, and System Architecture with interactive playgrounds, playable mini-apps, Bug Hunt, and 60s Syntax Blitz.";

  return (
    <SafeAreaView style={styles.container}>
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
      <MinimalPcbBackground />
      <AppHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isCompactHeader={isCompactHeader}
        pyodideReady={pyodideReady}
        themeMode={themeMode}
        onToggleTheme={() =>
          setThemeMode((prev) => (prev === "light" ? "dark" : "light"))
        }
        devRank={devRank}
        streakCount={streakCount}
        isPremium={isPremium}
        session={session}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenPaywall={() => openPaywall({ source: "header" })}
        onOpenAuth={() => openAuthModal()}
        onSignOut={() => supabase.auth.signOut()}
      />

      {viewMode === "roadmap" ? (
        <RoadmapTree
          lessons={lessons}
          completedLessons={completedLessons}
          isPremium={isPremium}
          activeTrack={activeTrack}
          onSelectTrack={handleSwitchTrack}
          onSelectLesson={handleSelectLesson}
          dailyCompletedDate={dailyCompletedDate}
          onClaimDailyWarmup={handleClaimDailyWarmup}
          claimedChapters={claimedChapters}
          onClaimChapterBonus={handleClaimChapterBonus}
          isAuthenticated={Boolean(session)}
          totalXp={xpPoints}
          streakCount={streakCount}
          totalSolvedCount={totalSolvedCount}
          onStartQuickMode={(mode) => setViewMode(mode)}
          onOpenAuth={openAuthModal}
          onOpenTrackCertificate={(trackKey) => openTrackCertificate(trackKey)}
          onOpenChapterCertificate={(trackKey, chapter) =>
            openChapterCertificate(trackKey, chapter)
          }
        />
      ) : viewMode === "bughunt" ? (
        <BugHuntArena
          pyodideReady={pyodideReady}
          isPremium={isPremium}
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
          isPremium={isPremium}
          onRequirePro={() =>
            openPaywall({
              source: "arena",
              lessonTitle: "All Speed Blitz Tracks",
            })
          }
          onAwardBlitzXp={handleAwardBlitzXp}
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
            isPremium={isPremium}
            onSwitchTrack={handleSwitchTrack}
            completedCount={completedCount}
            currentLessons={currentLessons}
            progressPercent={progressPercent}
            loading={loading}
            completedLessons={completedLessons}
            selectedLesson={selectedLesson}
            onSelectLesson={handleSelectLesson}
          />

          <View style={styles.workspaceContainer}>
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
                    activeTab={activeTab}
                    onChangeActiveTab={setActiveTab}
                    explainStyle={explainStyle}
                    onChangeExplainStyle={setExplainStyle}
                    lessonEnrichment={lessonEnrichment}
                    solvedQuizzes={solvedQuizzes}
                    quizSelection={quizSelection}
                    onSelectQuizOption={handleSelectQuizOption}
                    onLoadGuidedSteps={(guidedCode) => {
                      updateCodeWithDraft(guidedCode, selectedLesson);
                      if (isCompactStudio) {
                        setMobileStudioPane("code");
                      }
                    }}
                    testResults={testResults}
                    isPremium={isPremium}
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
                    selectedLesson={selectedLesson}
                    code={code}
                    onChangeCode={updateCodeWithDraft}
                    hasSavedDraft={hasSavedDraft}
                    guidedCode={lessonEnrichment?.guidedCode}
                    pyodideReady={pyodideReady}
                    isExecuting={isExecuting}
                    onRunPlaygroundOnly={runPlaygroundOnly}
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

      {showAuthModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Auth
              defaultMode={authDefaultMode}
              guestXp={xpPoints}
              guestSolvedCount={totalSolvedCount}
              promptReason={authPromptReason}
              onSuccess={() => {
                setShowAuthModal(false);
                if (resumePaywallAfterAuthRef.current) {
                  resumePaywallAfterAuthRef.current = false;
                  setShowPaywallModal(true);
                }
              }}
            />
            <Pressable
              style={styles.closeModalBtn}
              onPress={() => {
                resumePaywallAfterAuthRef.current = false;
                setShowAuthModal(false);
              }}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showPaywallModal && (
        <View style={styles.modalOverlay}>
          <PaywallModal
            onClose={() => setShowPaywallModal(false)}
            onUpgrade={handleUpgradeToPro}
            loading={upgrading}
            totalModules={lessons.length || 64}
            algoModulesCount={algoModulesCount || 20}
            sysDesignModulesCount={sysDesignModulesCount || 20}
            xpPoints={xpPoints}
            completedCount={totalSolvedCount}
            streakCount={streakCount}
            hasSession={Boolean(session)}
            triggerContext={paywallContext}
            freePreviewLessonTitle={paywallFreePreviewLesson?.title}
            onTryFreePreview={
              paywallFreePreviewLesson
                ? () => {
                    setShowPaywallModal(false);
                    openLessonInStudio(paywallFreePreviewLesson);
                  }
                : undefined
            }
          />
        </View>
      )}

      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <SuccessModal
            xpEarned={50}
            totalXp={xpPoints}
            streakCount={streakCount}
            lessonId={selectedLesson?.id}
            lessonTitle={selectedLesson?.title || ""}
            keyTakeaway={
              lessonEnrichment?.realWorldUse || selectedLesson?.description
            }
            nextLessonTitle={
              hasNextLesson
                ? currentLessons[currentLessonIndex + 1]?.title
                : undefined
            }
            hasNextLesson={Boolean(hasNextLesson)}
            isGuest={!session}
            totalSolvedCount={totalSolvedCount}
            onSaveProgress={() => {
              setShowSuccessModal(false);
              openAuthModal(
                "signup",
                `Save your ${xpPoints} XP and ${totalSolvedCount} solved modules before closing this browser.`,
              );
            }}
            trackCertificateLabel={
              currentLessons.length > 0 &&
              completedCount === currentLessons.length
                ? (TrackThemes[activeTrack] || TrackThemes.python_basics).label
                : undefined
            }
            onViewCertificate={
              currentLessons.length > 0 &&
              completedCount === currentLessons.length
                ? () => {
                    setShowSuccessModal(false);
                    openTrackCertificate(activeTrack);
                  }
                : undefined
            }
            onNextLesson={handleNextLesson}
            onClose={() => setShowSuccessModal(false)}
          />
        </View>
      )}

      {showProfileModal && (
        <View style={styles.modalOverlay}>
          <ProfileStatsModal
            xpPoints={xpPoints}
            streakCount={streakCount}
            isPremium={isPremium}
            userEmail={session?.user?.email}
            lessons={lessons}
            completedLessons={completedLessons}
            onSelectTrack={(trackKey) => {
              handleSwitchTrack(trackKey);
            }}
            onOpenCertificate={(cert) => setActiveCertificate(cert)}
            onOpenAuth={() => openAuthModal()}
            onClose={() => setShowProfileModal(false)}
          />
        </View>
      )}

      {activeCertificate && (
        <View style={styles.modalOverlay}>
          <CertificateModal
            certificate={activeCertificate}
            onClose={() => setActiveCertificate(null)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: StudioColors.bg,
      position: "relative",
    },
    content: { flex: 1, flexDirection: "row", zIndex: 1, position: "relative" },
    workspaceContainer: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: "transparent",
      overflow: "hidden",
    },
    studioTopBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
      flexWrap: "wrap",
      gap: 10,
    },
    studioTopBarLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    },
    sidebarToggleBtn: {
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    sidebarToggleText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    mobilePaneSwitcher: {
      flexDirection: "row",
      backgroundColor: StudioColors.surface,
      padding: 3,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    mobilePaneBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 4,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    mobilePaneBtnActive: {
      backgroundColor: StudioColors.yellow,
    },
    mobilePaneText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    mobilePaneTextActive: {
      color: StudioColors.ink,
    },
    lessonNavBtns: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    lessonNavBtn: {
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    disabledNavBtn: {
      opacity: 0.4,
    },
    lessonNavBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    lessonNavCounter: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    workspaceGrid: {
      flex: 1,
      flexDirection: "row",
      gap: 22,
      overflow: "hidden",
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(17, 17, 17, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    modalContent: { alignItems: "center" },
    closeModalBtn: {
      marginTop: 12,
      padding: 8,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    closeModalText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  });
