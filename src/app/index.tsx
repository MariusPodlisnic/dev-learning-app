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
  description: string;
  content: string;
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

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
          setCode(firstBeginner.initial_code);
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
      const { error } = await supabase
        .from("profiles")
        .upsert({
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
      setCode(firstInTrack.initial_code);
      setOutput("");
      setTestResults(null);
    }
  }

  function handleSelectLesson(lesson: Lesson) {
    if (!lesson.is_free && !isPremium) {
      setShowPaywallModal(true);
      return;
    }
    setSelectedLesson(lesson);
    setCode(lesson.initial_code);
    setOutput("");
    setTestResults(null);
    setBottomTab("console");
  }

  function insertSymbol(symbol: string) {
    setCode((prev) => prev + symbol);
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
    setOutput("Checking your solution...");
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
            setTestResults(parsedResult.results);
            setSelectedTestIndex(0);
            setBottomTab("tests");
            setOutput(
              rawOutput ||
                "Code executed. See Test Cases tab for verification.",
            );

            if (parsedResult.all_passed) {
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
            const expected = selectedLesson.expected_output.trim();
            if (rawOutput === expected) {
              finalLogs += "\n\n🎉 Challenge Passed! (+50 XP)";
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

      <View style={styles.content}>
        <View style={styles.sidebar}>
          <Text style={styles.sectionTitle}>LEARNING PATHS</Text>
          <Pressable
            style={[
              styles.trackTab,
              activeTrack === "python_basics" && styles.activeTrackTab,
            ]}
            onPress={() => handleSwitchTrack("python_basics")}
          >
            <Text style={styles.trackTabText}>🐍 Foundation Core</Text>
            <Text style={styles.trackSubText}>
              Step-by-step interactive basics
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.trackTab,
              activeTrack === "algorithms" && styles.activeTrackTab,
            ]}
            onPress={() => handleSwitchTrack("algorithms")}
          >
            <Text style={styles.trackTabText}>⚡ Algorithmic Mastery</Text>
            <Text style={styles.trackSubText}>Interview data structures</Text>
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

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>LESSONS</Text>
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
                    MODULE {selectedLesson.lesson_order}
                  </Text>
                  {selectedLesson.complexities?.time && (
                    <Text style={styles.complexityBadge}>
                      🎯 {selectedLesson.complexities.time}
                    </Text>
                  )}
                  {selectedLesson.complexities?.space && (
                    <Text style={styles.complexityBadge}>
                      🏆 {selectedLesson.complexities.space}
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
                      📘 Interactive Guide
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
                      <Text style={styles.problemText}>
                        {selectedLesson.content}
                      </Text>
                    </View>

                    {selectedLesson.constraints &&
                      selectedLesson.constraints.length > 0 && (
                        <View style={styles.missionBlock}>
                          <Text style={styles.missionHeader}>
                            🎯 YOUR MISSION CHECKLIST
                          </Text>
                          {selectedLesson.constraints.map((c, i) => (
                            <View key={i} style={styles.missionRow}>
                              <Text style={styles.missionBullet}>▫️</Text>
                              <Text style={styles.missionText}>{c}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {selectedLesson.examples?.map((ex, i) => (
                      <View key={i} style={styles.exampleBlock}>
                        <Text style={styles.exampleTitle}>
                          Code Example {i + 1}:
                        </Text>
                        <View style={styles.exampleBox}>
                          <Text style={styles.exampleCode}>
                            <Text style={styles.bold}>Code: </Text>
                            {ex.input}
                          </Text>
                          <Text style={styles.exampleCode}>
                            <Text style={styles.bold}>Result: </Text>
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
                    <Text style={styles.ideTitleText}>
                      main.py — Interactive Editor
                    </Text>
                    <Pressable
                      style={styles.resetBtn}
                      onPress={() => setCode(selectedLesson.initial_code)}
                    >
                      <Text style={styles.resetBtnText}>
                        ↺ Reset Starter Code
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.symbolBar}>
                    <Text style={styles.quickInsertLabel}>Quick Insert:</Text>
                    {["print()", '""', 'f""', "[]", ":", "=", "for "].map(
                      (sym) => (
                        <Pressable
                          key={sym}
                          style={styles.symbolChip}
                          onPress={() => insertSymbol(sym)}
                        >
                          <Text style={styles.symbolText}>{sym}</Text>
                        </Pressable>
                      ),
                    )}
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
                      multiline
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                    />
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
                    <Text style={styles.secondaryRunBtnText}>▶ Run Output</Text>
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
                        ? "Checking..."
                        : "✓ Verify & Submit (+50 XP)"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.bottomPanel}>
                  <View style={styles.bottomTabBar}>
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
                          bottomTab === "console" && styles.activeBottomTabText,
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
                          bottomTab === "tests" && styles.activeBottomTabText,
                        ]}
                      >
                        ☑️ Mission Verification{" "}
                        {testResults
                          ? `(${testResults.filter((t) => t.passed).length}/${testResults.length})`
                          : ""}
                      </Text>
                    </Pressable>
                  </View>

                  <ScrollView style={styles.bottomContent}>
                    {bottomTab === "console" ? (
                      <Text style={styles.terminalText}>
                        {output ||
                          '// Click "▶ Run Output" to test your code or "✓ Verify & Submit" to complete the mission.'}
                      </Text>
                    ) : testResults ? (
                      <View>
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
                                Check {tr.id}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        <View style={styles.testDetails}>
                          <Text style={styles.testHeader}>What We Checked</Text>
                          <View style={styles.testDataBox}>
                            <Text style={styles.testDataText}>
                              {testResults[selectedTestIndex].input}
                            </Text>
                          </View>

                          <View style={styles.comparisonRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.testHeader}>
                                Expected Value
                              </Text>
                              <View style={styles.testDataBox}>
                                <Text style={styles.testDataText}>
                                  {testResults[selectedTestIndex].expected}
                                </Text>
                              </View>
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text style={styles.testHeader}>
                                Your Code Produced
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
                      </View>
                    ) : (
                      <Text style={styles.terminalText}>
                        // Click "✓ Verify & Submit" to check each requirement
                        of this lesson.
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🐍</Text>
              <Text style={styles.emptyStateTitle}>CHOOSE A LESSON</Text>
              <Text style={styles.emptyStateSub}>
                Select any lesson on the left sidebar to begin your interactive
                coding session.
              </Text>
            </View>
          )}
        </View>
      </View>

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
  container: { flex: 1, backgroundColor: "#070A11", position: "relative" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1A2133",
    backgroundColor: "#0A0E17",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 101,
  },
  headerTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  statusPill: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  gamificationHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statPill: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#223049",
  },
  statText: { color: "#38BDF8", fontSize: 12, fontWeight: "700" },
  proBadge: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  upgradeHeaderBtn: {
    backgroundColor: "#D9770620",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F59E0B",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  upgradeHeaderBtnText: { color: "#F59E0B", fontSize: 12, fontWeight: "700" },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  authBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  loginBtn: { backgroundColor: "#2563EB" },
  authBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  content: { flex: 1, flexDirection: "row", zIndex: 1 },
  sidebar: {
    width: 270,
    borderRightWidth: 1,
    borderRightColor: "#1A2133",
    backgroundColor: "#0A0E17",
    padding: 16,
  },
  sectionTitle: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  trackTab: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#131C2D",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTrackTab: { backgroundColor: "#1E293B", borderColor: "#38BDF8" },
  trackTabText: { color: "#F8FAFC", fontSize: 13, fontWeight: "700" },
  trackSubText: { color: "#64748B", fontSize: 11, marginTop: 2 },
  progressCard: {
    backgroundColor: "#131C2D",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  progressPercent: { color: "#38BDF8", fontSize: 11, fontWeight: "800" },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#10B981" },
  lessonCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeLessonCard: {
    backgroundColor: "#131C2D",
    borderWidth: 1,
    borderColor: "#223049",
  },
  lessonCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: { backgroundColor: "#2563EB" },
  stepCircleCompleted: { backgroundColor: "#059669" },
  stepCircleText: { color: "#F8FAFC", fontSize: 11, fontWeight: "800" },
  lessonTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "600", flex: 1 },
  activeLessonTitle: { color: "#F8FAFC", fontWeight: "800" },
  workspaceContainer: { flex: 1, padding: 20, backgroundColor: "#070A11" },
  workspaceGrid: { flex: 1, flexDirection: "row", gap: 20 },
  explanationPanel: { flex: 1, paddingRight: 8 },
  editorPanel: { flex: 1.15 },
  lessonBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  lessonStepPill: {
    backgroundColor: "#2563EB30",
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    letterSpacing: 1,
  },
  complexityBadge: {
    backgroundColor: "#131C2D",
    color: "#94A3B8",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitleDesc: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#131C2D",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTabItem: { backgroundColor: "#1E293B" },
  tabText: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  activeTabText: { color: "#38BDF8" },
  problemCard: { paddingBottom: 20 },
  conceptBox: {
    backgroundColor: "#0F1524",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
  },
  problemText: { color: "#E2E8F0", fontSize: 14, lineHeight: 24 },
  missionBlock: {
    backgroundColor: "#064E3B20",
    borderWidth: 1,
    borderColor: "#05966960",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  missionHeader: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  missionBullet: { fontSize: 12 },
  missionText: { color: "#E2E8F0", fontSize: 13, fontWeight: "500" },
  exampleBlock: { marginBottom: 16 },
  exampleTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  exampleBox: {
    backgroundColor: "#131C2D",
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
  },
  exampleCode: {
    color: "#CBD5E1",
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: { color: "#38BDF8", fontWeight: "700" },
  ideFrame: {
    backgroundColor: "#0F1524",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    overflow: "hidden",
  },
  ideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#131C2D",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  windowControls: { flexDirection: "row", gap: 6 },
  controlDot: { width: 10, height: 10, borderRadius: 5 },
  ideTitleText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  resetBtnText: { color: "#94A3B8", fontSize: 10, fontWeight: "700" },
  symbolBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#0B0F19",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    flexWrap: "wrap",
  },
  quickInsertLabel: { color: "#64748B", fontSize: 11, marginRight: 4 },
  symbolChip: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#223049",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  symbolText: {
    color: "#38BDF8",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  editorBody: { flexDirection: "row", minHeight: 230 },
  lineNumbers: {
    backgroundColor: "#0A0E17",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#1E293B",
    alignItems: "flex-end",
  },
  lineNumberText: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 21,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  codeEditor: {
    flex: 1,
    color: "#E2E8F0",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    lineHeight: 21,
    padding: 16,
    textAlignVertical: "top",
    outlineStyle: "none" as any,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryRunBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  secondaryRunBtnText: { color: "#E2E8F0", fontWeight: "700", fontSize: 13 },
  runButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  disabledButton: { opacity: 0.6 },
  runButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  bottomPanel: {
    marginTop: 12,
    backgroundColor: "#0F1524",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    flex: 1,
    overflow: "hidden",
  },
  bottomTabBar: {
    flexDirection: "row",
    backgroundColor: "#131C2D",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  bottomTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeBottomTab: { borderBottomWidth: 2, borderBottomColor: "#38BDF8" },
  bottomTabText: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  activeBottomTabText: { color: "#38BDF8" },
  bottomContent: { padding: 14, flex: 1 },
  terminalText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#A3E635",
    fontSize: 13,
    lineHeight: 20,
  },
  testCasePills: { flexDirection: "row", gap: 8, marginBottom: 12 },
  testPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#131C2D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTestPill: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  testPillText: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  activeTestPillText: { color: "#F8FAFC" },
  testDetails: { gap: 6 },
  comparisonRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  testHeader: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  testDataBox: { backgroundColor: "#131C2D", padding: 10, borderRadius: 8 },
  testDataSuccess: {
    backgroundColor: "#10B98115",
    borderWidth: 1,
    borderColor: "#10B98140",
  },
  testDataFail: {
    backgroundColor: "#EF444415",
    borderWidth: 1,
    borderColor: "#EF444440",
  },
  testDataText: { color: "#E2E8F0", fontFamily: "monospace", fontSize: 12 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateIcon: { fontSize: 48, marginBottom: 12 },
  emptyStateTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyStateSub: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
    maxWidth: 320,
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
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
  closeModalText: { color: "#94A3B8", fontSize: 13 },
});
