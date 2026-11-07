import { Session } from "@supabase/supabase-js";
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
import { renderHighlightedPython } from "../components/FormattedText";
import LessonProblemPanel from "../components/LessonProblemPanel";
import PaywallModal from "../components/PaywallModal";
import ProfileStatsModal, {
  getDeveloperRank,
} from "../components/ProfileStatsModal";
import RoadmapTree from "../components/RoadmapTree";
import StudioCodeEditor from "../components/StudioCodeEditor";
import StudioSidebar from "../components/StudioSidebar";
import SuccessModal from "../components/SuccessModal";
import SyntaxBlitzArena from "../components/SyntaxBlitzArena";
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

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");
  const [activeTrack, setActiveTrack] = useState<string>("python_basics");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "visual">("problem");
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

  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);

  const pyodideRef = useRef<any>(null);
  const codeDraftsRef = useRef<Record<string, string>>({});
  const hydratedRef = useRef<boolean>(false);

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
    hydratedRef.current = true;

    fetchLessons(
      safeInitialTrack,
      savedState.lastLessonId as string | undefined,
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProgress(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          setShowAuthModal(false);
          fetchUserProgress(session.user.id);
          fetchUserProfile(session.user.id);
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
    if (!hydratedRef.current) return;
    writeLocalJson(STORAGE_STATE_KEY, {
      completedLessons,
      solvedIncidents,
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

  async function fetchUserProfile(userId: string) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, xp_points, streak_count")
        .eq("id", userId)
        .single();
      if (data) {
        setIsPremium(data.is_premium || false);
        setXpPoints((prev) => Math.max(prev, data.xp_points || 0));
        setStreakCount((prev) => Math.max(prev, data.streak_count || 0));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }

  async function fetchUserProgress(userId: string) {
    try {
      const { data } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId);
      const progressMap: Record<string, boolean> = {};
      data?.forEach((row) => {
        if (row.completed) progressMap[row.lesson_id] = true;
      });
      setCompletedLessons((prev) => ({ ...prev, ...progressMap }));
    } catch (err) {
      console.error("Failed to load user progress:", err);
    }
  }

  async function handleUpgradeToPro() {
    if (!session) {
      setShowPaywallModal(false);
      setShowAuthModal(true);
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
      setShowPaywallModal(true);
      return;
    }
    setActiveTrack(fullLesson.track);
    setSelectedLesson(fullLesson);
    const defaultCode = (fullLesson.initial_code || "").replace(/\\n/g, "\n");
    const draft = codeDraftsRef.current[fullLesson.id];
    setCode(draft !== undefined ? draft : defaultCode);
    setHasSavedDraft(draft !== undefined && draft !== defaultCode);
    setOutput("");
    setTestResults(null);
    setQuizSelection(null);
    setBottomTab("console");
    setMobileDrawerOpen(false);
    setViewMode("studio");
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
    if (
      optionIdx === lessonEnrichment.quiz.correctIndex &&
      !solvedQuizzes[selectedLesson.id]
    ) {
      setSolvedQuizzes((prev) => ({ ...prev, [selectedLesson.id]: true }));
      setXpPoints((prev) => prev + 10);
    }
  }

  const currentLessons = lessons.filter((l) => l.track === activeTrack);
  const completedCount = currentLessons.filter(
    (l) => completedLessons[l.id],
  ).length;
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

  return (
    <SafeAreaView style={styles.container}>
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
        onOpenPaywall={() => setShowPaywallModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
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
        />
      ) : viewMode === "bughunt" ? (
        <BugHuntArena
          pyodideReady={pyodideReady}
          isPremium={isPremium}
          onRequirePro={() => setShowPaywallModal(true)}
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
          onRequirePro={() => setShowPaywallModal(true)}
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
                    onOpenPaywall={() => setShowPaywallModal(true)}
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
            <Auth onSuccess={() => setShowAuthModal(false)} />
            <Pressable
              style={styles.closeModalBtn}
              onPress={() => setShowAuthModal(false)}
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
          />
        </View>
      )}

      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <SuccessModal
            xpEarned={50}
            totalXp={xpPoints}
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
            onOpenAuth={() => setShowAuthModal(true)}
            onClose={() => setShowProfileModal(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: StudioColors.bg },
    content: { flex: 1, flexDirection: "row", zIndex: 1, position: "relative" },
    workspaceContainer: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 14,
      paddingBottom: 18,
      backgroundColor: StudioColors.bg,
      overflow: "hidden",
    },
    studioTopBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      paddingBottom: 10,
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
