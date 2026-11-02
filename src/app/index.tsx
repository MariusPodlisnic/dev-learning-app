import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

interface Lesson {
  id: string;
  title: string;
  track: string;
  description: string;
  content: string;
  initial_code: string;
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

  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    fetchLessons();
    if (Platform.OS === "web") {
      loadPyodideEngine();
    }
  }, []);

  // 1. Fetch Lessons from Supabase
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

  // 2. Load Pyodide WebAssembly Engine dynamically on Web
  async function loadPyodideEngine() {
    if (window.hasOwnProperty("loadPyodide") && pyodideRef.current) return;

    try {
      if (!document.getElementById("pyodide-script")) {
        const script = document.createElement("script");
        script.id = "pyodide-script";
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
        script.onload = async () => {
          // @ts-ignore
          pyodideRef.current = await window.loadPyodide();
          setPyodideReady(true);
        };
        document.head.appendChild(script);
      }
    } catch (err) {
      console.error("Failed to load Pyodide engine:", err);
    }
  }

  // 3. Execute Python Code Client-Side
  async function runPythonCode() {
    setIsExecuting(true);
    setOutput("Executing code...");

    try {
      if (Platform.OS === "web" && pyodideRef.current) {
        let stdoutBuffer = "";
        // Capture Python print statements
        pyodideRef.current.setStdout({
          batched: (str: string) => {
            stdoutBuffer += str + "\n";
          },
        });

        const result = await pyodideRef.current.runPythonAsync(code);
        const finalLogs =
          stdoutBuffer ||
          (result !== undefined
            ? String(result)
            : "Code executed successfully with no output.");
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ DevLearn Studio</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {pyodideReady
              ? "🟢 WASM Engine Ready"
              : "⏳ Loading Python WASM..."}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Left Sidebar: Lessons Navigation */}
        <View style={styles.sidebar}>
          <Text style={styles.sectionTitle}>FREE TRACK: PYTHON BASICS</Text>
          {loading ? (
            <ActivityIndicator color="#38BDF8" />
          ) : (
            lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonCard,
                  selectedLesson?.id === lesson.id && styles.activeLessonCard,
                ]}
                onPress={() => handleSelectLesson(lesson)}
              >
                <Text
                  style={[
                    styles.lessonTitle,
                    selectedLesson?.id === lesson.id &&
                      styles.activeLessonTitle,
                  ]}
                >
                  {lesson.title}
                </Text>
                <Text style={styles.badge}>
                  {lesson.is_free ? "FREE" : "PRO"}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            PAID TRACKS (LOCKED)
          </Text>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>
              🔒 Algorithms & Data Structures
            </Text>
            <Text style={styles.lockedSub}>
              Unlock 45+ LeetCode style challenges
            </Text>
          </View>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>
              🔒 System Design & Architecture
            </Text>
            <Text style={styles.lockedSub}>Interactive node-based canvas</Text>
          </View>
        </View>

        {/* Right Workspace: Interactive Code Editor & Output */}
        <ScrollView style={styles.workspace}>
          {selectedLesson ? (
            <View>
              <Text style={styles.title}>{selectedLesson.title}</Text>
              <Text style={styles.description}>
                {selectedLesson.description}
              </Text>

              {/* Editable Python Code Editor */}
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

              {/* Run Code Action */}
              <TouchableOpacity
                style={[styles.runButton, isExecuting && styles.disabledButton]}
                onPress={runPythonCode}
                disabled={isExecuting}
              >
                <Text style={styles.runButtonText}>
                  {isExecuting ? "Running..." : "▶ Run Code"}
                </Text>
              </TouchableOpacity>

              {/* Console Output Terminal */}
              <Text style={[styles.subHeader, { marginTop: 20 }]}>
                Console Output:
              </Text>
              <View style={styles.terminal}>
                <Text style={styles.terminalText}>
                  {output || '# Click "Run Code" to inspect output'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.infoText}>Select a lesson to start coding</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "700" },
  statusPill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#94A3B8", fontSize: 12 },
  content: { flex: 1, flexDirection: "row" },
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
  },
  activeLessonCard: { backgroundColor: "#2563EB" },
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
  },
  disabledButton: { backgroundColor: "#065F46" },
  runButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  terminal: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
    minHeight: 100,
  },
  terminalText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#4ADE80",
    fontSize: 13,
  },
  infoText: { color: "#64748B" },
});
