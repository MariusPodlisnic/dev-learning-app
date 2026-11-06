import { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import Auth from "../components/Auth";
import HintAccordion from "../components/HintAccordion";
import PaywallModal from "../components/PaywallModal";
import RoadmapTree from "../components/RoadmapTree";
import SuccessModal from "../components/SuccessModal";
import VisualLessonPanel from "../components/VisualLessonPanel";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Complexities {
  time?: string;
  space?: string;
}

interface TestCaseResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface Lesson {
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

function renderInlineSegments(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <Text key={i} style={styles.inlineCode}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={i} style={styles.boldInline}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

function FormattedText({ text, style }: { text?: string; style?: any }) {
  if (!text) return null;
  const normalized = text.replace(/\\n/g, "\n");
  const blocks = normalized.split(/(```[\s\S]*?```)/g);

  return (
    <View style={{ gap: 12 }}>
      {blocks.map((block, bIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        if (trimmedBlock.startsWith("```") && trimmedBlock.endsWith("```")) {
          const rawCode = trimmedBlock
            .slice(3, -3)
            .replace(/^[a-zA-Z]+\n/, "")
            .trim();
          return (
            <View key={bIdx} style={styles.codeBlockContainer}>
              <View style={styles.codeBlockHeader}>
                <Text style={styles.codeBlockLang}>PYTHON</Text>
              </View>
              <Text style={styles.codeBlockText}>{rawCode}</Text>
            </View>
          );
        }

        const paragraphs = trimmedBlock.split("\n\n");
        return (
          <View key={bIdx} style={{ gap: 10 }}>
            {paragraphs.map((para, pIdx) => {
              const lines = para.split("\n");
              const isBulletList =
                lines.length > 1 &&
                lines.every(
                  (l) =>
                    l.trim().startsWith("- ") || l.trim().startsWith("• "),
                );

              if (isBulletList) {
                return (
                  <View key={pIdx} style={{ gap: 6 }}>
                    {lines.map((line, lIdx) => {
                      const cleanLine = line
                        .trim()
                        .replace(/^[-•]\s+/, "");
                      return (
                        <View key={lIdx} style={styles.bulletRow}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={[style, { flex: 1 }]}>
                            {renderInlineSegments(cleanLine)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              }

              return (
                <Text key={pIdx} style={style}>
                  {renderInlineSegments(para)}
                </Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [viewMode, setViewMode] = useState<"roadmap" | "studio">("roadmap");
  const [activeTrack, setActiveTrack] = useState<string>("python_basics");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "visual">("problem");
  const [bottomTab, setBottomTab] = useState<"console" | "tests">("console");

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

  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);

  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [upgrading, setUpgrading] = useState<boolean>(false);

  const pyodideRef = useRef<any>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    fetchLessons();
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
          setCompletedLessons({});
          setIsPremium(false);
          setXpPoints(0);
          setStreakCount(0);
        }
      },
    );

    if (Platform.OS === "web") loadPyodideEngine();
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function fetchLessons() {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_order", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error);
      } else {
        const all = data || [];
        setLessons(all);
        const firstBeginner = all.find((l) => l.track === "python_basics");
        if (firstBeginner) {
          setSelectedLesson(firstBeginner);
          setCode((firstBeginner.initial_code || "").replace(/\\n/g, "\n"));
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
        setXpPoints(data.xp_points || 0);
        setStreakCount(data.streak_count || 0);
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
      setCompletedLessons(progressMap);
    } catch (err) {
      console.error("Failed to load user progress:", err);
    }
  }

  async function loadPyodideEngine() {
    if (typeof window === "undefined") return;
    if ("loadPyodide" in window && pyodideRef.current) return;
    try {
      if (!document.getElementById("pyodide-script")) {
        const script = document.createElement("script");
        script.id = "pyodide-script";
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
        script.onload = async () => {
          if ((window as any).loadPyodide) {
            pyodideRef.current = await (window as any).loadPyodide();
            setPyodideReady(true);
          }
        };
        document.head.appendChild(script);
      }
    } catch (err) {
      console.error("Failed to load Pyodide engine:", err);
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
    const firstInTrack = lessons.find((l) => l.track === trackName);
    if (firstInTrack) {
      setSelectedLesson(firstInTrack);
      setCode((firstInTrack.initial_code || "").replace(/\\n/g, "\n"));
      setOutput("");
      setTestResults(null);
    }
  }

  function handleSelectLesson(lesson: { id: string }) {
    const fullLesson = lessons.find((item) => item.id === lesson.id);
    if (!fullLesson) return;

    if (!fullLesson.is_free && !isPremium) {
      setShowPaywallModal(true);
      return;
    }
    setActiveTrack(fullLesson.track);
    setSelectedLesson(fullLesson);
    setCode((fullLesson.initial_code || "").replace(/\\n/g, "\n"));
    setOutput("");
    setTestResults(null);
    setBottomTab("console");
    setViewMode("studio");
  }

  function insertSymbol(symbol: string) {
    setCode((prev) => {
      const start = Math.min(
        Math.max(0, selectionRef.current.start),
        prev.length,
      );
      const end = Math.min(Math.max(start, selectionRef.current.end), prev.length);
      const nextCode = prev.slice(0, start) + symbol + prev.slice(end);
      const cursorOffset =
        symbol === "print()" || symbol === '""' || symbol === 'f""' || symbol === "[]"
          ? symbol.length - 1
          : symbol.length;
      const nextPos = start + cursorOffset;
      selectionRef.current = { start: nextPos, end: nextPos };
      return nextCode;
    });
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
      if (Platform.OS === "web" && pyodideRef.current) {
        let stdoutBuffer = "";
        pyodideRef.current.setStdout({
          batched: (str: string) => {
            stdoutBuffer += str + "\n";
          },
        });
        const result = await pyodideRef.current.runPythonAsync(code);
        const rawOutput =
          stdoutBuffer.trim() ||
          (result !== undefined
            ? String(result).trim()
            : "Code ran with no output. Use print() to see values!");
        setOutput(rawOutput);
      }
    } catch (err: any) {
      setOutput(
        `💡 Python Tip — Check your syntax:\n${err.message || String(err)}`,
      );
    } finally {
      setIsExecuting(false);
    }
  }

  async function runPythonCode() {
    setIsExecuting(true);
    setOutput("Checking your assignment...");
    setTestResults(null);

    try {
      if (Platform.OS === "web" && pyodideRef.current) {
        let stdoutBuffer = "";
        pyodideRef.current.setStdout({
          batched: (str: string) => {
            stdoutBuffer += str + "\n";
          },
        });

        const executionCode = selectedLesson?.hidden_tests
          ? `${code}\n${selectedLesson.hidden_tests}`
          : code;
        const result = await pyodideRef.current.runPythonAsync(executionCode);
        const rawOutput = stdoutBuffer.trim();

        let parsedResult = null;
        try {
          parsedResult = JSON.parse(String(result));
        } catch (e) {}

        if (parsedResult && parsedResult.is_test_suite) {
          if (parsedResult.error) {
            setOutput(
              `🔴 Syntax or Runtime Issue:\n${parsedResult.error}\n\nConsole:\n${rawOutput}`,
            );
            setBottomTab("console");
          } else {
            const expectedStdout = selectedLesson?.expected_output
              ?.replace(/\\n/g, "\n")
              .trim();
            const resultsList: TestCaseResult[] = [...parsedResult.results];
            let allPassed = parsedResult.all_passed;

            if (expectedStdout && selectedLesson?.track === "python_basics") {
              const stdoutMatch = rawOutput === expectedStdout;
              resultsList.push({
                id: resultsList.length + 1,
                input: "Check printed console output",
                expected: expectedStdout,
                actual: rawOutput || "(Nothing printed)",
                passed: stdoutMatch,
              });
              if (!stdoutMatch) allPassed = false;
            }

            setTestResults(resultsList);
            setSelectedTestIndex(0);
            setBottomTab("tests");
            setOutput(rawOutput || "Code executed. See Assignment Checks tab.");

            if (allPassed) {
              setShowSuccessModal(true);
              if (selectedLesson && session) {
                const isAlreadyCompleted = completedLessons[selectedLesson.id];
                await supabase.from("user_progress").upsert({
                  user_id: session.user.id,
                  lesson_id: selectedLesson.id,
                  completed: true,
                  updated_at: new Date().toISOString(),
                });

                if (!isAlreadyCompleted) {
                  const newXp = xpPoints + 50;
                  const newStreak = streakCount === 0 ? 1 : streakCount;
                  setXpPoints(newXp);
                  setStreakCount(newStreak);
                  await supabase.from("profiles").upsert({
                    id: session.user.id,
                    email: session.user.email,
                    xp_points: newXp,
                    streak_count: newStreak,
                    last_completed_at: new Date().toISOString(),
                  });
                }
                setCompletedLessons((prev) => ({
                  ...prev,
                  [selectedLesson.id]: true,
                }));
              }
            }
          }
        } else {
          let finalLogs =
            rawOutput ||
            (result !== undefined ? String(result).trim() : "No output");
          if (selectedLesson?.expected_output) {
            const expected = selectedLesson.expected_output
              .replace(/\\n/g, "\n")
              .trim();
            if (rawOutput === expected) {
              finalLogs += "\n\n🎉 Assignment Passed! (+50 XP)";
              setShowSuccessModal(true);
              if (selectedLesson && session) {
                setCompletedLessons((prev) => ({
                  ...prev,
                  [selectedLesson.id]: true,
                }));
              }
            } else {
              finalLogs += `\n\n❌ Almost there! Expected output:\n${expected}`;
            }
          }
          setOutput(finalLogs);
          setBottomTab("console");
        }
      }
    } catch (err: any) {
      setOutput(`💡 Friendly Debugger:\n${err.message || String(err)}`);
      setBottomTab("console");
    } finally {
      setIsExecuting(false);
    }
  }

  const currentLessons = lessons.filter((l) => l.track === activeTrack);
  const completedCount = currentLessons.filter(
    (l) => completedLessons[l.id],
  ).length;
  const progressPercent = currentLessons.length
    ? Math.round((completedCount / currentLessons.length) * 100)
    : 0;
  const hasNextLesson =
    selectedLesson &&
    currentLessons.findIndex((l) => l.id === selectedLesson.id) <
      currentLessons.length - 1;

  const lineCount = Math.max((code || "").split("\n").length, 8);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>⚡ DevLearn</Text>

          {/* Primary Navigation Mode Switcher */}
          <View style={styles.modeSwitcher}>
            <Pressable
              style={[
                styles.modeBtn,
                viewMode === "roadmap" && styles.modeBtnActive,
              ]}
              onPress={() => setViewMode("roadmap")}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "roadmap" && styles.modeBtnTextActive,
                ]}
              >
                🗺️ Skill Tree
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeBtn,
                viewMode === "studio" && styles.modeBtnActive,
              ]}
              onPress={() => setViewMode("studio")}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "studio" && styles.modeBtnTextActive,
                ]}
              >
                💻 Code Studio
              </Text>
            </Pressable>
          </View>

          <View style={styles.statusPill}>
            <View
              style={[
                styles.pulseDot,
                pyodideReady
                  ? { backgroundColor: "#10B981" }
                  : { backgroundColor: "#F59E0B" },
              ]}
            />
            <Text style={styles.statusText}>
              {pyodideReady ? "Python 3.11 Ready" : "Loading Python..."}
            </Text>
          </View>
        </View>

        <View style={styles.gamificationHeader}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>🔥 {streakCount} Streak</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>⚡ {xpPoints} XP</Text>
          </View>
          {isPremium && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {!isPremium && (
            <Pressable
              style={styles.upgradeHeaderBtn}
              onPress={() => setShowPaywallModal(true)}
            >
              <Text style={styles.upgradeHeaderBtnText}>⭐ Pro Tracks</Text>
            </Pressable>
          )}
          {session ? (
            <View style={styles.userSection}>
              <Pressable
                style={styles.authBtn}
                onPress={() => supabase.auth.signOut()}
              >
                <Text style={styles.authBtnText}>Sign Out</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.authBtn, styles.loginBtn]}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.authBtnText}>Save Progress</Text>
            </Pressable>
          )}
        </View>
      </View>

      {viewMode === "roadmap" ? (
        <RoadmapTree
          lessons={lessons}
          completedLessons={completedLessons}
          isPremium={isPremium}
          activeTrack={activeTrack}
          onSelectTrack={handleSwitchTrack}
          onSelectLesson={handleSelectLesson}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.sidebar}>
            <Pressable
              style={styles.backToMapBtn}
              onPress={() => setViewMode("roadmap")}
            >
              <Text style={styles.backToMapText}>◀ Back to Skill Tree Map</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>TRACK SWITCHER</Text>
            <Pressable
              style={[
                styles.trackTab,
                activeTrack === "python_basics" && styles.activeTrackTab,
              ]}
              onPress={() => handleSwitchTrack("python_basics")}
            >
              <Text style={styles.trackTabText}>🐍 Foundation Core</Text>
            </Pressable>
            <Pressable
              style={[
                styles.trackTab,
                activeTrack === "algorithms" && styles.activeTrackTab,
              ]}
              onPress={() => handleSwitchTrack("algorithms")}
            >
              <Text style={styles.trackTabText}>⚡ Algorithmic Mastery</Text>
            </Pressable>
            <Pressable
              style={[
                styles.trackTab,
                activeTrack === "system_design" && styles.activeTrackTab,
              ]}
              onPress={() => handleSwitchTrack("system_design")}
            >
              <Text style={styles.trackTabText}>🛰️ System Architecture</Text>
            </Pressable>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  {completedCount} of {currentLessons.length} Completed
                </Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              MODULES
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loading ? (
                <ActivityIndicator color="#38BDF8" style={{ marginTop: 12 }} />
              ) : (
                currentLessons.map((lesson, idx) => {
                  const isCompleted = completedLessons[lesson.id];
                  const isLocked = !lesson.is_free && !isPremium;
                  const isActive = selectedLesson?.id === lesson.id;
                  return (
                    <Pressable
                      key={lesson.id}
                      style={[
                        styles.lessonCard,
                        isActive && styles.activeLessonCard,
                      ]}
                      onPress={() => handleSelectLesson(lesson)}
                    >
                      <View style={styles.lessonCardLeft}>
                        <View
                          style={[
                            styles.stepCircle,
                            isCompleted && styles.stepCircleCompleted,
                            isActive && styles.stepCircleActive,
                          ]}
                        >
                          <Text style={styles.stepCircleText}>
                            {isLocked ? "🔒" : isCompleted ? "✓" : idx + 1}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.lessonTitle,
                            isActive && styles.activeLessonTitle,
                          ]}
                        >
                          {lesson.title}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>

          <View style={styles.workspaceContainer}>
            {selectedLesson ? (
              <View style={styles.workspaceGrid}>
                <ScrollView
                  style={styles.explanationPanel}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.lessonBadgeRow}>
                    <Text style={styles.lessonStepPill}>
                      {selectedLesson.category ||
                        `MODULE ${selectedLesson.lesson_order}`}
                    </Text>
                    {selectedLesson.complexities?.time && (
                      <Text style={styles.complexityBadge}>
                        ⏱️ {selectedLesson.complexities.time}
                      </Text>
                    )}
                    {selectedLesson.complexities?.space && (
                      <Text style={styles.complexityBadge}>
                        💾 {selectedLesson.complexities.space}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.title}>{selectedLesson.title}</Text>
                  <Text style={styles.subtitleDesc}>
                    {selectedLesson.description}
                  </Text>

                  <View style={styles.tabBar}>
                    <Pressable
                      style={[
                        styles.tabItem,
                        activeTab === "problem" && styles.activeTabItem,
                      ]}
                      onPress={() => setActiveTab("problem")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "problem" && styles.activeTabText,
                        ]}
                      >
                        📘 Concept & Assignment
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.tabItem,
                        activeTab === "visual" && styles.activeTabItem,
                      ]}
                      onPress={() => setActiveTab("visual")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "visual" && styles.activeTabText,
                        ]}
                      >
                        👁️ Memory Simulator
                      </Text>
                    </Pressable>
                  </View>

                  {activeTab === "problem" ? (
                    <View style={styles.problemCard}>
                      <View style={styles.conceptBox}>
                        <Text style={styles.sectionHeaderLabel}>
                          📖 CONCEPT EXPLANATION
                        </Text>
                        <FormattedText
                          text={selectedLesson.content}
                          style={styles.problemText}
                        />
                      </View>

                      <View style={styles.assignmentBox}>
                        <View style={styles.assignmentHeaderRow}>
                          <Text style={styles.assignmentHeaderLabel}>
                            ✍️ YOUR CODING ASSIGNMENT
                          </Text>
                          <Text style={styles.xpRewardPill}>+50 XP</Text>
                        </View>

                        {selectedLesson.assignment && (
                          <FormattedText
                            text={selectedLesson.assignment}
                            style={styles.assignmentDescription}
                          />
                        )}

                        {selectedLesson.constraints &&
                          selectedLesson.constraints.length > 0 && (
                            <View style={styles.checklistContainer}>
                              {selectedLesson.constraints.map((c, i) => {
                                const isStepPassed = testResults?.[i]?.passed;
                                return (
                                  <View key={i} style={styles.missionRow}>
                                    <Text style={styles.missionBullet}>
                                      {isStepPassed ? "✅" : "⬜"}
                                    </Text>
                                    <FormattedText
                                      text={c}
                                      style={styles.missionText}
                                    />
                                  </View>
                                );
                              })}
                            </View>
                          )}
                      </View>

                      {selectedLesson.examples?.map((ex, i) => (
                        <View key={i} style={styles.exampleBlock}>
                          <Text style={styles.exampleTitle}>
                            Reference Example {i + 1}
                          </Text>
                          <View style={styles.exampleBox}>
                            <Text style={styles.exampleCode}>
                              <Text style={styles.bold}>Input: </Text>
                              {ex.input}
                            </Text>
                            <Text style={styles.exampleCode}>
                              <Text style={styles.bold}>Output: </Text>
                              {ex.output}
                            </Text>
                            {ex.explanation && (
                              <Text style={styles.exampleCode}>
                                <Text style={styles.bold}>Why: </Text>
                                {ex.explanation}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <VisualLessonPanel
                      type={selectedLesson.visual_type || "memory"}
                      data={selectedLesson.visual_data}
                    />
                  )}
                  <HintAccordion hints={selectedLesson.hints || []} />
                </ScrollView>

                <View style={styles.editorPanel}>
                  <View style={styles.ideFrame}>
                    <View style={styles.ideHeader}>
                      <View style={styles.windowControls}>
                        <View
                          style={[
                            styles.controlDot,
                            { backgroundColor: "#EF4444" },
                          ]}
                        />
                        <View
                          style={[
                            styles.controlDot,
                            { backgroundColor: "#F59E0B" },
                          ]}
                        />
                        <View
                          style={[
                            styles.controlDot,
                            { backgroundColor: "#10B981" },
                          ]}
                        />
                      </View>
                      <View style={styles.ideTitleGroup}>
                        <Text style={styles.ideTitleText}>assignment.py</Text>
                        <Text style={styles.ideMetaPill}>Python 3.11</Text>
                      </View>
                      <Pressable
                        style={styles.resetBtn}
                        onPress={() =>
                          setCode(
                            (selectedLesson.initial_code || "").replace(
                              /\\n/g,
                              "\n",
                            ),
                          )
                        }
                      >
                        <Text style={styles.resetBtnText}>↺ Reset Code</Text>
                      </Pressable>
                    </View>

                    <View style={styles.symbolBar}>
                      <Text style={styles.quickInsertLabel}>QUICK INSERT</Text>
                      {[
                        { label: "⇥ Tab", val: "    " },
                        { label: "print()", val: "print()" },
                        { label: '""', val: '""' },
                        { label: 'f""', val: 'f""' },
                        { label: "[]", val: "[]" },
                        { label: ":", val: ":" },
                        { label: "=", val: " = " },
                        { label: "return", val: "return " },
                      ].map((item) => (
                        <Pressable
                          key={item.label}
                          style={styles.symbolChip}
                          onPress={() => insertSymbol(item.val)}
                        >
                          <Text style={styles.symbolText}>{item.label}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.editorBody}>
                      <View style={styles.lineNumbers}>
                        {Array.from({ length: lineCount }).map((_, i) => (
                          <Text key={i} style={styles.lineNumberText}>
                            {i + 1}
                          </Text>
                        ))}
                      </View>
                      <TextInput
                        style={styles.codeEditor}
                        value={code}
                        onChangeText={setCode}
                        onSelectionChange={(e) => {
                          selectionRef.current = e.nativeEvent.selection;
                        }}
                        multiline
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                      />
                    </View>

                    <View style={styles.ideFooter}>
                      <Text style={styles.ideFooterText}>
                        UTF-8 · { (code || "").split("\n").length } lines ·{" "}
                        {(code || "").length} chars
                      </Text>
                      <Text style={styles.ideFooterText}>
                        {pyodideReady ? "● Engine Ready" : "○ Loading Engine"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[
                        styles.secondaryRunBtn,
                        isExecuting && styles.disabledButton,
                      ]}
                      onPress={runPlaygroundOnly}
                      disabled={isExecuting}
                    >
                      <Text style={styles.secondaryRunBtnText}>▶ Test Run</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.runButton,
                        isExecuting && styles.disabledButton,
                      ]}
                      onPress={runPythonCode}
                      disabled={isExecuting}
                    >
                      <Text style={styles.runButtonText}>
                        {isExecuting
                          ? "Grading Assignment..."
                          : "✓ Submit Assignment (+50 XP)"}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.bottomPanel}>
                    <View style={styles.bottomTabBar}>
                      <View style={styles.bottomTabsLeft}>
                        <Pressable
                          style={[
                            styles.bottomTab,
                            bottomTab === "console" && styles.activeBottomTab,
                          ]}
                          onPress={() => setBottomTab("console")}
                        >
                          <Text
                            style={[
                              styles.bottomTabText,
                              bottomTab === "console" &&
                                styles.activeBottomTabText,
                            ]}
                          >
                            ⌨️ Console Output
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.bottomTab,
                            bottomTab === "tests" && styles.activeBottomTab,
                          ]}
                          onPress={() => setBottomTab("tests")}
                        >
                          <Text
                            style={[
                              styles.bottomTabText,
                              bottomTab === "tests" &&
                                styles.activeBottomTabText,
                            ]}
                          >
                            ☑️ Assignment Checks{" "}
                            {testResults
                              ? `(${testResults.filter((t) => t.passed).length}/${testResults.length})`
                              : ""}
                          </Text>
                        </Pressable>
                      </View>

                      {bottomTab === "console" && output ? (
                        <Pressable
                          style={styles.clearConsoleBtn}
                          onPress={() => setOutput("")}
                        >
                          <Text style={styles.clearConsoleText}>Clear</Text>
                        </Pressable>
                      ) : null}
                    </View>

                    <ScrollView style={styles.bottomContent}>
                      {bottomTab === "console" ? (
                        output ? (
                          <Text style={styles.terminalText}>{output}</Text>
                        ) : (
                          <View style={styles.emptyConsoleBox}>
                            <Text style={styles.emptyConsoleTitle}>
                              Ready to Execute
                            </Text>
                            <Text style={styles.emptyConsoleHint}>
                              Click &quot;▶ Test Run&quot; to inspect print() output, or
                              &quot;✓ Submit Assignment&quot; to run automated grading
                              checks.
                            </Text>
                          </View>
                        )
                      ) : testResults ? (
                        <View>
                          <View
                            style={[
                              styles.testSummaryBanner,
                              testResults.every((t) => t.passed)
                                ? styles.testSummarySuccess
                                : styles.testSummaryWarn,
                            ]}
                          >
                            <Text
                              style={[
                                styles.testSummaryText,
                                testResults.every((t) => t.passed)
                                  ? { color: "#34D399" }
                                  : { color: "#FBBF24" },
                              ]}
                            >
                              {testResults.every((t) => t.passed)
                                ? `🎉 All ${testResults.length} Assignment Checks Passed!`
                                : `⚡ ${testResults.filter((t) => t.passed).length} of ${testResults.length} Checks Passed — Select a task below to inspect`}
                            </Text>
                          </View>

                          <View style={styles.testCasePills}>
                            {testResults.map((tr, idx) => (
                              <Pressable
                                key={idx}
                                style={[
                                  styles.testPill,
                                  selectedTestIndex === idx &&
                                    styles.activeTestPill,
                                ]}
                                onPress={() => setSelectedTestIndex(idx)}
                              >
                                <Text style={{ fontSize: 11 }}>
                                  {tr.passed ? "✅" : "❌"}
                                </Text>
                                <Text
                                  style={[
                                    styles.testPillText,
                                    selectedTestIndex === idx &&
                                      styles.activeTestPillText,
                                  ]}
                                >
                                  Task {tr.id}
                                </Text>
                              </Pressable>
                            ))}
                          </View>

                          {testResults[selectedTestIndex] && (
                            <View style={styles.testDetails}>
                              <Text style={styles.testHeader}>
                                Requirement Checked
                              </Text>
                              <View style={styles.testDataBox}>
                                <Text style={styles.testDataText}>
                                  {testResults[selectedTestIndex].input}
                                </Text>
                              </View>

                              <View style={styles.comparisonRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.testHeader}>
                                    Expected Output
                                  </Text>
                                  <View style={styles.testDataBox}>
                                    <Text style={styles.testDataText}>
                                      {testResults[selectedTestIndex].expected}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                  <Text style={styles.testHeader}>
                                    Your Result
                                  </Text>
                                  <View
                                    style={[
                                      styles.testDataBox,
                                      testResults[selectedTestIndex].passed
                                        ? styles.testDataSuccess
                                        : styles.testDataFail,
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.testDataText,
                                        testResults[selectedTestIndex].passed
                                          ? { color: "#10B981" }
                                          : { color: "#EF4444" },
                                      ]}
                                    >
                                      {testResults[selectedTestIndex].actual}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.emptyConsoleBox}>
                          <Text style={styles.emptyConsoleTitle}>
                            No Assignment Checks Run Yet
                          </Text>
                          <Text style={styles.emptyConsoleHint}>
                            Click &quot;✓ Submit Assignment (+50 XP)&quot; above to
                            validate your code against each requirement.
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
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
            lessonTitle={selectedLesson?.title || ""}
            hasNextLesson={Boolean(hasNextLesson)}
            onNextLesson={handleNextLesson}
            onClose={() => setShowSuccessModal(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", position: "relative" },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F23",
    backgroundColor: "#09090B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 101,
  },
  headerTitle: {
    color: "#FAFAFA",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#121215",
    padding: 3,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  modeBtn: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  modeBtnActive: { backgroundColor: "#27272A" },
  modeBtnText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  modeBtnTextActive: { color: "#FAFAFA" },
  statusPill: {
    backgroundColor: "#121215",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  gamificationHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statPill: {
    backgroundColor: "#121215",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  statText: { color: "#F59E0B", fontSize: 12, fontWeight: "700" },
  proBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  upgradeHeaderBtn: {
    backgroundColor: "#F59E0B15",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B50",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  upgradeHeaderBtnText: { color: "#F59E0B", fontSize: 12, fontWeight: "700" },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  authBtn: {
    backgroundColor: "#18181B",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  loginBtn: { backgroundColor: "#FAFAFA", borderColor: "#FAFAFA" },
  authBtnText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  content: { flex: 1, flexDirection: "row", zIndex: 1 },
  sidebar: {
    width: 255,
    borderRightWidth: 1,
    borderRightColor: "#1F1F23",
    backgroundColor: "#0C0C0E",
    padding: 16,
  },
  backToMapBtn: {
    backgroundColor: "#121215",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 18,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  backToMapText: { color: "#E4E4E7", fontSize: 12, fontWeight: "700" },
  sectionTitle: {
    color: "#52525B",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 1.4,
  },
  trackTab: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTrackTab: { backgroundColor: "#18181B", borderColor: "#27272A" },
  trackTabText: { color: "#E4E4E7", fontSize: 12, fontWeight: "700" },
  progressCard: {
    backgroundColor: "#121215",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272A",
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  progressPercent: { color: "#F59E0B", fontSize: 11, fontWeight: "800" },
  progressBarTrack: {
    height: 5,
    backgroundColor: "#18181B",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#F59E0B" },
  lessonCard: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeLessonCard: { backgroundColor: "#18181B", borderColor: "#27272A" },
  lessonCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: { backgroundColor: "#F59E0B", borderColor: "#F59E0B" },
  stepCircleCompleted: { backgroundColor: "#10B981", borderColor: "#10B981" },
  stepCircleText: { color: "#FAFAFA", fontSize: 10, fontWeight: "800" },
  lessonTitle: { color: "#71717A", fontSize: 12, fontWeight: "600", flex: 1 },
  activeLessonTitle: { color: "#FAFAFA", fontWeight: "700" },
  workspaceContainer: { flex: 1, padding: 22, backgroundColor: "#09090B" },
  workspaceGrid: { flex: 1, flexDirection: "row", gap: 22 },
  explanationPanel: { flex: 1, paddingRight: 8 },
  editorPanel: { flex: 1.15 },
  lessonBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  lessonStepPill: {
    backgroundColor: "#F59E0B18",
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  complexityBadge: {
    backgroundColor: "#121215",
    color: "#A1A1AA",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  title: {
    color: "#FAFAFA",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitleDesc: {
    color: "#A1A1AA",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#121215",
    borderRadius: 9,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTabItem: { backgroundColor: "#27272A" },
  tabText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  activeTabText: { color: "#FAFAFA" },
  problemCard: { paddingBottom: 20 },
  sectionHeaderLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  conceptBox: {
    backgroundColor: "#121215",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 16,
  },
  problemText: { color: "#D4D4D8", fontSize: 14, lineHeight: 24 },
  boldInline: { color: "#FAFAFA", fontWeight: "800" },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    color: "#F59E0B",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
  },
  codeBlockContainer: {
    backgroundColor: "#09090B",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272A",
    overflow: "hidden",
  },
  codeBlockHeader: {
    backgroundColor: "#18181B",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  codeBlockLang: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  codeBlockText: {
    color: "#E4E4E7",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
  },
  inlineCode: {
    backgroundColor: "#18181B",
    color: "#F59E0B",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  assignmentBox: {
    backgroundColor: "#121215",
    borderWidth: 1,
    borderColor: "#6366F150",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  assignmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  assignmentHeaderLabel: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  xpRewardPill: {
    backgroundColor: "#10B98120",
    color: "#34D399",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assignmentDescription: {
    color: "#FAFAFA",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  checklistContainer: {
    backgroundColor: "#09090B",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1F1F23",
    gap: 8,
  },
  missionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  missionBullet: { fontSize: 13 },
  missionText: { color: "#E4E4E7", fontSize: 13, fontWeight: "500" },
  exampleBlock: { marginBottom: 16 },
  exampleTitle: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exampleBox: {
    backgroundColor: "#121215",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  exampleCode: {
    color: "#D4D4D8",
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: { color: "#F59E0B", fontWeight: "700" },
  ideFrame: {
    backgroundColor: "#121215",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272A",
    overflow: "hidden",
  },
  ideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#18181B",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  windowControls: { flexDirection: "row", gap: 6 },
  controlDot: { width: 10, height: 10, borderRadius: 5 },
  ideTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ideTitleText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  ideMetaPill: {
    backgroundColor: "#27272A",
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#27272A",
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  resetBtnText: { color: "#E4E4E7", fontSize: 11, fontWeight: "700" },
  symbolBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#0C0C0E",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    flexWrap: "wrap",
  },
  quickInsertLabel: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginRight: 4,
  },
  symbolChip: {
    backgroundColor: "#18181B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  symbolText: {
    color: "#F59E0B",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  editorBody: { flexDirection: "row", minHeight: 230 },
  lineNumbers: {
    backgroundColor: "#0C0C0E",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#1F1F23",
    alignItems: "flex-end",
  },
  lineNumberText: {
    color: "#52525B",
    fontSize: 13,
    lineHeight: 21,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  codeEditor: {
    flex: 1,
    color: "#FAFAFA",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    lineHeight: 21,
    padding: 16,
    textAlignVertical: "top",
    ...Platform.select({
      web: {
        outlineStyle: "none" as any,
      },
    }),
  },
  ideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#0C0C0E",
    borderTopWidth: 1,
    borderTopColor: "#1F1F23",
  },
  ideFooterText: {
    color: "#52525B",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryRunBtn: {
    backgroundColor: "#18181B",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  secondaryRunBtnText: { color: "#E4E4E7", fontWeight: "700", fontSize: 13 },
  runButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  disabledButton: { opacity: 0.6 },
  runButtonText: { color: "#09090B", fontWeight: "900", fontSize: 13 },
  bottomPanel: {
    marginTop: 12,
    backgroundColor: "#121215",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272A",
    flex: 1,
    overflow: "hidden",
  },
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    paddingRight: 12,
  },
  bottomTabsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeBottomTab: { borderBottomWidth: 2, borderBottomColor: "#F59E0B" },
  bottomTabText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  activeBottomTabText: { color: "#FAFAFA" },
  clearConsoleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  clearConsoleText: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "700",
  },
  bottomContent: { padding: 14, flex: 1 },
  emptyConsoleBox: {
    paddingVertical: 12,
    gap: 4,
  },
  emptyConsoleTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyConsoleHint: {
    color: "#71717A",
    fontSize: 12,
    lineHeight: 18,
  },
  testSummaryBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  testSummarySuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  testSummaryWarn: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  testSummaryText: {
    fontSize: 12,
    fontWeight: "800",
  },
  terminalText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#34D399",
    fontSize: 13,
    lineHeight: 20,
  },
  testCasePills: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  testPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#18181B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTestPill: { backgroundColor: "#27272A", borderColor: "#F59E0B" },
  testPillText: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  activeTestPillText: { color: "#FAFAFA" },
  testDetails: { gap: 6 },
  comparisonRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  testHeader: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  testDataBox: {
    backgroundColor: "#18181B",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  testDataSuccess: { backgroundColor: "#10B98112", borderColor: "#10B98150" },
  testDataFail: { backgroundColor: "#EF444412", borderColor: "#EF444450" },
  testDataText: { color: "#FAFAFA", fontFamily: "monospace", fontSize: 12 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(9, 9, 11, 0.88)",
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
  closeModalText: { color: "#A1A1AA", fontSize: 13 },
});
