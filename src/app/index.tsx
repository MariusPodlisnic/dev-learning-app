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
  const [activeTrack, setActiveTrack] = useState<string>("algorithms");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"problem" | "visual">("problem");
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
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

    if (Platform.OS === "web") {
      loadPyodideEngine();
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchLessons() {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_order", { ascending: true });

      if (error) console.error("Error fetching lessons:", error);
      else {
        const all = data || [];
        setLessons(all);
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
          // @ts-ignore
          if (window.loadPyodide) {
            // @ts-ignore
            pyodideRef.current = await window.loadPyodide();
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

  function handleSelectLesson(lesson: Lesson) {
    if (!lesson.is_free && !isPremium) {
      setShowPaywallModal(true);
      return;
    }
    setSelectedLesson(lesson);
    setCode(lesson.initial_code);
    setOutput("");
  }

  function resetCodeSnippet() {
    if (selectedLesson) {
      setCode(selectedLesson.initial_code);
      setOutput("");
    }
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
      const nextLesson = currentTrackLessons[currentIndex + 1];
      handleSelectLesson(nextLesson);
    }
  }

  async function runPythonCode() {
    setIsExecuting(true);
    setOutput("Compiling sequence against test suite...");

    try {
      if (Platform.OS === "web" && pyodideRef.current) {
        let stdoutBuffer = "";
        pyodideRef.current.setStdout({
          batched: (str: string) => {
            stdoutBuffer += str + "\n";
          },
        });

        // 1. Inject hidden tests directly into the user's code evaluation
        const executionCode = selectedLesson?.hidden_tests
          ? `${code}\n${selectedLesson.hidden_tests}`
          : code;

        const result = await pyodideRef.current.runPythonAsync(executionCode);
        const rawOutput =
          stdoutBuffer.trim() ||
          (result !== undefined ? String(result).trim() : "");

        let finalLogs =
          rawOutput || "[Process completed successfully. No output generated.]";

        // 2. Validate against expected output target
        if (selectedLesson?.expected_output) {
          const expected = selectedLesson.expected_output.trim();

          if (rawOutput.includes(expected)) {
            finalLogs = `🟢 ACCEPTED: All Hidden Test Cases Passed (+50 XP)\n\nProgram Output:\n${rawOutput}`;
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
          } else {
            // Error handling formatting
            finalLogs = `🔴 REJECTED: Assertion Failed\n\nExecution Log:\n${rawOutput}`;
          }
        }

        setOutput(finalLogs);
      } else {
        setOutput("Environment mismatch: Requires Web execution context.");
      }
    } catch (err: any) {
      setOutput(`🔴 Runtime Exception:\n${err.message || String(err)}`);
    } finally {
      setIsExecuting(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
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
  const hasNextLesson =
    currentLessonIndex !== -1 && currentLessonIndex < currentLessons.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>⚡ DevLearn Studio</Text>
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
              {pyodideReady ? "System Online" : "Booting WASM Core..."}
            </Text>
          </View>
        </View>

        <View style={styles.gamificationHeader}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>🔥 {streakCount} Days</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>⚡ {xpPoints} XP</Text>
          </View>
          {isPremium && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO ACCESS</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {!isPremium && (
            <Pressable
              style={styles.upgradeHeaderBtn}
              onPress={() => setShowPaywallModal(true)}
            >
              <Text style={styles.upgradeHeaderBtnText}>⭐ Upgrade Access</Text>
            </Pressable>
          )}
          {session ? (
            <View style={styles.userSection}>
              <Text style={styles.userEmail}>{session.user.email}</Text>
              <Pressable style={styles.authBtn} onPress={handleSignOut}>
                <Text style={styles.authBtnText}>Disconnect</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.authBtn, styles.loginBtn]}
              onPress={() => setShowAuthModal(true)}
            >{ }
              <Text style={styles.authBtnText}>Initialize User</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sectionTitle}>TRAINING PROTOCOLS</Text>
          <Pressable
            style={[
              styles.trackTab,
              activeTrack === "python_basics" && styles.activeTrackTab,
            ]}
            onPress={() => setActiveTrack("python_basics")}
          >
            <Text style={styles.trackTabText}>🐍 Foundation Core</Text>
          </Pressable>
          <Pressable
            style={[
              styles.trackTab,
              activeTrack === "algorithms" && styles.activeTrackTab,
            ]}
            onPress={() => {
              if (!isPremium && false)
                setShowPaywallModal(true); // Removing paywall lock for demo
              else setActiveTrack("algorithms");
            }}
          >
            <Text style={styles.trackTabText}>
              {isPremium ? "⚡ Algorithmic Mastery" : "⚡ Algorithmic Mastery"}
            </Text>
          </Pressable>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Module Completion</Text>
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
            ACTIVE SYLLABUS
          </Text>
          {loading ? (
            <ActivityIndicator color="#38BDF8" style={{ marginTop: 12 }} />
          ) : (
            currentLessons.map((lesson) => {
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
                    <Text style={styles.statusIcon}>
                      {isLocked
                        ? "🔒"
                        : isCompleted
                          ? "✅"
                          : isActive
                            ? "⚡"
                            : "⚪"}
                    </Text>
                    <Text
                      style={[
                        styles.lessonTitle,
                        isActive && styles.activeLessonTitle,
                      ]}
                    >
                      {lesson.title}
                    </Text>
                  </View>
                  {!lesson.is_free && (
                    <View style={styles.proBadgeSmall}>
                      <Text style={styles.proBadgeSmallText}>💎 PRO</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Workspace Layout */}
        <View style={styles.workspaceContainer}>
          {selectedLesson ? (
            <View style={styles.workspaceGrid}>
              {/* Left Column: Problem Description */}
              <ScrollView
                style={styles.explanationPanel}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.title}>{selectedLesson.title}</Text>

                {/* Space & Time Badges */}
                {selectedLesson.complexities && (
                  <View style={styles.complexityBar}>
                    {selectedLesson.complexities.time && (
                      <Text style={styles.complexityBadge}>
                        ⏱️ Time: {selectedLesson.complexities.time}
                      </Text>
                    )}
                    {selectedLesson.complexities.space && (
                      <Text style={styles.complexityBadge}>
                        💾 Space: {selectedLesson.complexities.space}
                      </Text>
                    )}
                  </View>
                )}

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
                      📋 Problem Description
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
                      👁️ Architecture Map
                    </Text>
                  </Pressable>
                </View>

                {activeTab === "problem" ? (
                  <View style={styles.problemCard}>
                    <Text style={styles.problemText}>
                      {selectedLesson.content}
                    </Text>

                    {/* Render LeetCode Style Examples */}
                    {selectedLesson.examples &&
                      selectedLesson.examples.map((ex, i) => (
                        <View key={i} style={styles.exampleBlock}>
                          <Text style={styles.exampleTitle}>
                            Example {i + 1}:
                          </Text>
                          <View style={styles.exampleBox}>
                            <Text style={styles.exampleCode}>
                              <Text style={styles.bold}>Input:</Text> {ex.input}
                            </Text>
                            <Text style={styles.exampleCode}>
                              <Text style={styles.bold}>Output:</Text>{" "}
                              {ex.output}
                            </Text>
                            {ex.explanation && (
                              <Text style={styles.exampleCode}>
                                <Text style={styles.bold}>Explanation:</Text>{" "}
                                {ex.explanation}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}

                    {/* Render Constraints */}
                    {selectedLesson.constraints &&
                      selectedLesson.constraints.length > 0 && (
                        <View style={styles.constraintsBlock}>
                          <Text style={styles.exampleTitle}>Constraints:</Text>
                          <View style={styles.constraintList}>
                            {selectedLesson.constraints.map((c, i) => (
                              <Text key={i} style={styles.constraintItem}>
                                • {c}
                              </Text>
                            ))}
                          </View>
                        </View>
                      )}
                  </View>
                ) : (
                  <VisualLessonPanel
                    type={selectedLesson.visual_type || "memory"}
                    data={selectedLesson.visual_data}
                  />
                )}

                <HintAccordion hints={selectedLesson.hints || []} />
              </ScrollView>

              {/* Right Column: Code Editor & Execution Terminal */}
              <View style={styles.editorPanel}>
                {/* IDE Window Frame */}
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
                    <Text style={styles.ideTitleText}>solution.py — Main</Text>
                    <Pressable
                      style={styles.resetBtn}
                      onPress={resetCodeSnippet}
                    >
                      <Text style={styles.resetBtnText}>↺ Reset</Text>
                    </Pressable>
                  </View>

                  <View style={styles.symbolBar}>
                    {[":", "()", '""', "[]", "def", "return", "self"].map(
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
                      ? "Executing Cloud Instance..."
                      : "▶ Run Code against Test Suite"}
                  </Text>
                </Pressable>

                {/* Terminal Window Frame */}
                <View style={[styles.ideFrame, { marginTop: 20 }]}>
                  <View style={styles.ideHeader}>
                    <Text style={styles.ideTitleText}>
                      /bin/bash — Test Output Logs
                    </Text>
                  </View>
                  <View style={styles.terminal}>
                    <Text style={styles.terminalText}>
                      {output ||
                        "// Standard output and stack traces will appear here."}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🛰️</Text>
              <Text style={styles.emptyStateTitle}>SYSTEM STANDBY</Text>
              <Text style={styles.emptyStateSub}>
                Select a training module from the active syllabus to initialize
                the interface.
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
            lessonTitle={selectedLesson?.title || "Lesson"}
            hasNextLesson={hasNextLesson}
            onNextLesson={handleNextLesson}
            onClose={() => setShowSuccessModal(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A11",
    position: "relative",
  },
  header: {
    padding: 16,
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
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  gamificationHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statPill: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 10,
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
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  upgradeHeaderBtn: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D97706",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  upgradeHeaderBtnText: { color: "#F59E0B", fontSize: 12, fontWeight: "700" },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  userEmail: { color: "#94A3B8", fontSize: 12 },
  authBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  loginBtn: { backgroundColor: "#3B82F6" },
  authBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  content: { flex: 1, flexDirection: "row", zIndex: 1 },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: "#1A2133",
    backgroundColor: "#0A0E17",
    padding: 16,
  },
  sectionTitle: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  trackTab: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#131C2D",
    marginBottom: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  activeTrackTab: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  trackTabText: { color: "#F8FAFC", fontSize: 13, fontWeight: "700" },
  progressCard: {
    backgroundColor: "#131C2D",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  progressPercent: { color: "#38BDF8", fontSize: 11, fontWeight: "800" },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#38BDF8",
  },
  lessonCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  activeLessonCard: { backgroundColor: "#131C2D", borderColor: "#223049" },
  lessonCardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusIcon: { fontSize: 12 },
  lessonTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  activeLessonTitle: { color: "#38BDF8", fontWeight: "800" },
  proBadgeSmall: {
    backgroundColor: "#8B5CF620",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#8B5CF650",
  },
  proBadgeSmallText: { color: "#A78BFA", fontSize: 8, fontWeight: "800" },
  workspaceContainer: { flex: 1, padding: 24, backgroundColor: "#070A11" },
  workspaceGrid: { flex: 1, flexDirection: "row", gap: 24 },
  explanationPanel: { flex: 1, paddingRight: 12 },
  editorPanel: { flex: 1 },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  complexityBar: { flexDirection: "row", gap: 12, marginBottom: 20 },
  complexityBadge: {
    backgroundColor: "#131C2D",
    color: "#94A3B8",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
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
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  activeTabItem: { backgroundColor: "#1E293B" },
  tabText: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  activeTabText: { color: "#38BDF8" },

  /* Problem Formatting */
  problemCard: {
    backgroundColor: "transparent",
    paddingBottom: 20,
  },
  problemText: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 26,
    marginBottom: 24,
  },
  exampleBlock: { marginBottom: 20 },
  exampleTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: "#131C2D",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#38BDF8",
  },
  exampleCode: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "monospace",
    marginBottom: 6,
    lineHeight: 22,
  },
  bold: { color: "#F8FAFC", fontWeight: "800" },
  constraintsBlock: { marginTop: 10, marginBottom: 20 },
  constraintList: { backgroundColor: "#131C2D", padding: 16, borderRadius: 8 },
  constraintItem: {
    color: "#94A3B8",
    fontSize: 13,
    fontFamily: "monospace",
    marginBottom: 4,
  },

  /* IDE Frame Styles */
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
    paddingVertical: 12,
    backgroundColor: "#131C2D",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  windowControls: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    left: 16,
  },
  controlDot: { width: 10, height: 10, borderRadius: 5 },
  ideTitleText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  resetBtnText: { color: "#94A3B8", fontSize: 10, fontWeight: "700" },
  symbolBar: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0B0F19",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  symbolChip: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#223049",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  symbolText: {
    color: "#38BDF8",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  codeEditor: {
    color: "#E2E8F0",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    padding: 16,
    minHeight: 280,
    textAlignVertical: "top",
    outlineStyle: "none" as any,
  },
  terminal: {
    padding: 16,
    minHeight: 140,
    backgroundColor: "#05070A",
  },
  terminalText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#A3E635",
    fontSize: 13,
    lineHeight: 20,
  },

  runButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  disabledButton: { backgroundColor: "#1E3A8A", shadowOpacity: 0 },
  runButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateIcon: { fontSize: 48, marginBottom: 16 },
  emptyStateTitle: {
    color: "#475569",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
  },
  emptyStateSub: {
    color: "#334155",
    fontSize: 13,
    marginTop: 8,
    maxWidth: 300,
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
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  closeModalText: { color: "#94A3B8", fontSize: 13 },
});
