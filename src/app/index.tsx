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

interface Lesson {
  id: string;
  title: string;
  track: string;
  description: string;
  content: string;
  initial_code: string;
  expected_output: string;
  is_free: boolean;
}

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, boolean>
  >({});

  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    fetchLessons();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProgress(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          setShowAuthModal(false);
          fetchUserProgress(session.user.id);
        } else {
          setCompletedLessons({});
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
        setLessons(data || []);
        if (data && data.length > 0) {
          setSelectedLesson(data[0]);
          setCode(data[0].initial_code);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user progress:", error);
        return;
      }

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

  async function markLessonCompleted(lessonId: string) {
    if (!session) return;
    try {
      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: session.user.id,
          lesson_id: lessonId,
          completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );

      if (error) {
        console.error("Failed to save progress:", error);
      } else {
        setCompletedLessons((prev) => ({ ...prev, [lessonId]: true }));
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
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

        // Automated Verification
        if (selectedLesson?.expected_output) {
          const expected = selectedLesson.expected_output.trim();
          if (rawOutput === expected) {
            finalLogs += "\n\n🎉 Test Passed! Solution verified.";
            if (selectedLesson && session) {
              await markLessonCompleted(selectedLesson.id);
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

  function handleSelectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setCode(lesson.initial_code);
    setOutput("");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>⚡ DevLearn Studio</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {pyodideReady ? "🟢 WASM Engine Ready" : "⏳ Loading WASM..."}
            </Text>
          </View>
        </View>

        {/* User Auth Control */}
        <View style={styles.headerRight}>
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
          <Text style={styles.sectionTitle}>FREE TRACK: PYTHON BASICS</Text>
          {loading ? (
            <ActivityIndicator color="#38BDF8" />
          ) : (
            lessons.map((lesson) => {
              const isCompleted = completedLessons[lesson.id];
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
                      {isCompleted ? "✅" : "⚪"}
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

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            PAID TRACKS (LOCKED)
          </Text>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>
              🔒 Algorithms & Data Structures
            </Text>
            <Text style={styles.lockedSub}>Unlock 45+ LeetCode challenges</Text>
          </View>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>
              🔒 System Design & Architecture
            </Text>
            <Text style={styles.lockedSub}>Interactive node-based canvas</Text>
          </View>
        </View>

        {/* Right Workspace */}
        <ScrollView style={styles.workspace}>
          {selectedLesson ? (
            <View>
              <Text style={styles.title}>{selectedLesson.title}</Text>
              <Text style={styles.description}>
                {selectedLesson.description}
              </Text>

              <Text style={styles.subHeader}>
                Interactive Python Workspace:
              </Text>
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
                style={[styles.runButton, isExecuting && styles.disabledButton]}
                onPress={runPythonCode}
                disabled={isExecuting}
              >
                <Text style={styles.runButtonText}>
                  {isExecuting ? "Running..." : "▶ Run & Submit Solution"}
                </Text>
              </Pressable>

              <Text style={[styles.subHeader, { marginTop: 20 }]}>
                Console Output & Validation:
              </Text>
              <View style={styles.terminal}>
                <Text style={styles.terminalText}>
                  {output || '# Click "Run & Submit Solution" to execute code'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.infoText}>Select a lesson to start coding</Text>
          )}
        </ScrollView>
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
    position: "relative",
    zIndex: 100,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: { flexDirection: "row", alignItems: "center", zIndex: 101 },
  headerTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "700" },
  statusPill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#94A3B8", fontSize: 12 },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  userEmail: { color: "#CBD5E1", fontSize: 13 },
  authBtn: {
    backgroundColor: "#334155",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
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
  lessonCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1E293B",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  activeLessonCard: { backgroundColor: "#2563EB" },
  lessonCardLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusIcon: { fontSize: 12 },
  lessonTitle: { color: "#CBD5E1", fontSize: 14, fontWeight: "500" },
  activeLessonTitle: { color: "#FFFFFF", fontWeight: "700" },
  badge: { color: "#10B981", fontSize: 10, fontWeight: "700" },
  lockedCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    opacity: 0.6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  lockedTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  lockedSub: { color: "#475569", fontSize: 11, marginTop: 2 },
  workspace: { flex: 1, padding: 24 },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "700", marginBottom: 6 },
  description: {
    color: "#94A3B8",
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  subHeader: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
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
    minHeight: 140,
    textAlignVertical: "top",
  },
  runButton: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
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
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  closeModalText: { color: "#94A3B8", fontSize: 13 },
});
