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
import VisualLessonPanel from "../components/VisualLessonPanel";

interface Lesson {
  id: string;
  title: string;
  track: string;
  description: string;
  content: string;
  initial_code: string;
  expected_output: string;
  is_free: boolean;
  visual_type?: string;
  visual_data?: any;
  hints?: string[];
}

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTrack, setActiveTrack] = useState<string>("python_basics");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"concept" | "visual">("concept");
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, boolean>
  >({});

  // Gamification & Profile State
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);

  // Auth & Premium State
  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
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
        const freeLesson = all.find((l) => l.track === "python_basics");
        if (freeLesson) {
          setSelectedLesson(freeLesson);
          setCode(freeLesson.initial_code);
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

  async function runPythonCode() {
    setIsExecuting(true);
    setOutput("Executing code...");

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
          (result !== undefined ? String(result).trim() : "");

        let finalLogs =
          rawOutput || "Code executed successfully with no output.";

        if (selectedLesson?.expected_output) {
          const expected = selectedLesson.expected_output.trim();
          if (rawOutput === expected) {
            finalLogs += "\n\n🎉 Test Passed! Solution verified (+50 XP).";
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
            finalLogs += `\n\n❌ Test Failed.\nExpected Output:\n${expected}`;
          }
        }

        setOutput(finalLogs);
      } else {
        setOutput(
          'Native execution requires Web view preview. Run on Web (press "w") to test client-side WASM.',
        );
      }
    } catch (err: any) {
      setOutput(`Error:\n${err.message || String(err)}`);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>⚡ DevLearn Studio</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {pyodideReady
                ? "🟢 Pyodide WASM Active"
                : "⏳ Initializing WASM Engine..."}
            </Text>
          </View>
        </View>

        {/* Gamification Stats Header */}
        <View style={styles.gamificationHeader}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>🔥 {streakCount} Day Streak</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>⚡ {xpPoints} XP</Text>
          </View>
          {isPremium && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO MEMBER</Text>
            </View>
          )}
        </View>

        {/* User Auth Control */}
        <View style={styles.headerRight}>
          {!isPremium && (
            <Pressable
              style={styles.upgradeHeaderBtn}
              onPress={() => setShowPaywallModal(true)}
            >
              <Text style={styles.upgradeHeaderBtnText}>⭐ Upgrade to Pro</Text>
            </Pressable>
          )}
          {session ? (
            <View style={styles.userSection}>
              <Text style={styles.userEmail}>{session.user.email}</Text>
              <Pressable style={styles.authBtn} onPress={handleSignOut}>
                <Text style={styles.authBtnText}>Sign Out</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.authBtn, styles.loginBtn]}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.authBtnText}>Sign In / Register</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sectionTitle}>LEARNING TRACKS</Text>
          <Pressable
            style={[
              styles.trackTab,
              activeTrack === "python_basics" && styles.activeTrackTab,
            ]}
            onPress={() => setActiveTrack("python_basics")}
          >
            <Text style={styles.trackTabText}>🐍 Python Basics (Free)</Text>
          </Pressable>
          <Pressable
            style={[
              styles.trackTab,
              activeTrack === "algorithms" && styles.activeTrackTab,
            ]}
            onPress={() => {
              if (!isPremium) setShowPaywallModal(true);
              else setActiveTrack("algorithms");
            }}
          >
            <Text style={styles.trackTabText}>
              {isPremium ? "⚡ Algorithms & Data" : "🔒 Algorithms & Data"}
            </Text>
          </Pressable>

          {/* Progress Overview Bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Track Completion</Text>
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
            CURRICULUM
          </Text>
          {loading ? (
            <ActivityIndicator color="#38BDF8" style={{ marginTop: 12 }} />
          ) : (
            currentLessons.map((lesson) => {
              const isCompleted = completedLessons[lesson.id];
              const isLocked = !lesson.is_free && !isPremium;
              return (
                <Pressable
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    selectedLesson?.id === lesson.id && styles.activeLessonCard,
                  ]}
                  onPress={() => handleSelectLesson(lesson)}
                >
                  <View style={styles.lessonCardLeft}>
                    <Text style={styles.statusIcon}>
                      {isLocked ? "🔒" : isCompleted ? "✅" : "⚪"}
                    </Text>
                    <Text
                      style={[
                        styles.lessonTitle,
                        selectedLesson?.id === lesson.id &&
                          styles.activeLessonTitle,
                      ]}
                    >
                      {lesson.title}
                    </Text>
                  </View>
                  <Text style={styles.badge}>
                    {lesson.is_free ? "FREE" : "PRO"}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Workspace Layout */}
        <View style={styles.workspaceContainer}>
          {selectedLesson ? (
            <View style={styles.workspaceGrid}>
              {/* Left Column: Lesson Explanations & Visualizations */}
              <ScrollView style={styles.explanationPanel}>
                <Text style={styles.title}>{selectedLesson.title}</Text>
                <Text style={styles.description}>
                  {selectedLesson.description}
                </Text>

                {/* Content Tabs */}
                <View style={styles.tabBar}>
                  <Pressable
                    style={[
                      styles.tabItem,
                      activeTab === "concept" && styles.activeTabItem,
                    ]}
                    onPress={() => setActiveTab("concept")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "concept" && styles.activeTabText,
                      ]}
                    >
                      📘 Concept Guide
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
                      👁️ Visual Diagram
                    </Text>
                  </Pressable>
                </View>

                {activeTab === "concept" ? (
                  <View style={styles.conceptCard}>
                    <Text style={styles.conceptText}>
                      {selectedLesson.content}
                    </Text>
                  </View>
                ) : (
                  <VisualLessonPanel
                    type={selectedLesson.visual_type || "memory"}
                    data={selectedLesson.visual_data}
                  />
                )}

                {/* Hints Accordion Component */}
                <HintAccordion hints={selectedLesson.hints || []} />
              </ScrollView>

              {/* Right Column: Code Editor & Execution Terminal */}
              <View style={styles.editorPanel}>
                <View style={styles.editorHeader}>
                  <Text style={styles.subHeader}>
                    Interactive Python Code Studio
                  </Text>
                  <Text style={styles.editorHint}>
                    Standard Library Enabled
                  </Text>
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
                      ? "Executing in WASM..."
                      : "▶ Run & Verify Solution"}
                  </Text>
                </Pressable>

                <Text style={[styles.subHeader, { marginTop: 16 }]}>
                  Console Output & Validation:
                </Text>
                <View style={styles.terminal}>
                  <Text style={styles.terminalText}>
                    {output ||
                      '# Click "Run & Verify Solution" to evaluate code output'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.infoText}>Select a lesson to start coding</Text>
          )}
        </View>
      </View>

      {/* Auth Modal Overlay */}
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

      {/* Paywall Pro Upgrade Modal Overlay */}
      {showPaywallModal && (
        <View style={styles.modalOverlay}>
          <PaywallModal
            onClose={() => setShowPaywallModal(false)}
            onUpgrade={handleUpgradeToPro}
            loading={upgrading}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    position: "relative",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
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
  headerTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "700" },
  statusPill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#94A3B8", fontSize: 12 },
  gamificationHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statPill: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statText: { color: "#F8FAFC", fontSize: 12, fontWeight: "700" },
  proBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: { color: "#000000", fontSize: 11, fontWeight: "800" },
  upgradeHeaderBtn: {
    backgroundColor: "#D97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  upgradeHeaderBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  userEmail: { color: "#CBD5E1", fontSize: 13 },
  authBtn: {
    backgroundColor: "#334155",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  loginBtn: { backgroundColor: "#2563EB" },
  authBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  content: { flex: 1, flexDirection: "row", zIndex: 1 },
  sidebar: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: "#1E293B",
    padding: 16,
  },
  sectionTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 1,
  },
  trackTab: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#1E293B",
    marginBottom: 6,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  activeTrackTab: { backgroundColor: "#2563EB" },
  trackTabText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
  progressCard: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressTitle: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  progressPercent: { color: "#38BDF8", fontSize: 11, fontWeight: "700" },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  lessonCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1E293B",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  activeLessonCard: { backgroundColor: "#2563EB" },
  lessonCardLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusIcon: { fontSize: 12 },
  lessonTitle: { color: "#CBD5E1", fontSize: 14, fontWeight: "500" },
  activeLessonTitle: { color: "#FFFFFF", fontWeight: "700" },
  badge: { color: "#10B981", fontSize: 10, fontWeight: "700" },
  workspaceContainer: { flex: 1, padding: 20 },
  workspaceGrid: { flex: 1, flexDirection: "row", gap: 20 },
  explanationPanel: { flex: 1, paddingRight: 8 },
  editorPanel: { flex: 1 },
  title: { color: "#F8FAFC", fontSize: 24, fontWeight: "700", marginBottom: 6 },
  description: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  activeTabItem: { backgroundColor: "#2563EB" },
  tabText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  activeTabText: { color: "#FFFFFF" },
  conceptCard: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  conceptText: { color: "#CBD5E1", fontSize: 14, lineHeight: 22 },
  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  editorHint: { color: "#64748B", fontSize: 11 },
  subHeader: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
  },
  codeEditor: {
    backgroundColor: "#020617",
    color: "#38BDF8",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    minHeight: 200,
    textAlignVertical: "top",
  },
  runButton: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  disabledButton: { backgroundColor: "#065F46" },
  runButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  terminal: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
    minHeight: 120,
    marginTop: 8,
  },
  terminalText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#4ADE80",
    fontSize: 13,
  },
  infoText: { color: "#64748B" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: { alignItems: "center" },
  closeModalBtn: {
    marginTop: 12,
    padding: 8,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  closeModalText: { color: "#94A3B8", fontSize: 13 },
});
