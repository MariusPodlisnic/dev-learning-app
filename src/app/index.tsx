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
  useWindowDimensions,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import Auth from "../components/Auth";
import BugHuntArena from "../components/BugHuntArena";
import HintAccordion from "../components/HintAccordion";
import PaywallModal from "../components/PaywallModal";
import ProfileStatsModal, {
  getDeveloperRank,
} from "../components/ProfileStatsModal";
import RoadmapTree from "../components/RoadmapTree";
import SuccessModal from "../components/SuccessModal";
import VisualLessonPanel from "../components/VisualLessonPanel";
import { getLessonEnrichment } from "../constants/curriculum";
import { TrackThemes } from "../constants/theme";

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

const PYTHON_KEYWORDS = new Set([
  "def",
  "return",
  "if",
  "elif",
  "else",
  "for",
  "while",
  "in",
  "not",
  "and",
  "or",
  "True",
  "False",
  "None",
  "import",
  "from",
  "class",
  "pass",
  "break",
  "continue",
  "lambda",
  "with",
  "as",
  "try",
  "except",
  "finally",
  "yield",
  "async",
  "await",
]);

const PYTHON_BUILTINS = new Set([
  "print",
  "len",
  "range",
  "enumerate",
  "int",
  "str",
  "list",
  "dict",
  "set",
  "tuple",
  "max",
  "min",
  "sum",
  "sorted",
  "abs",
  "round",
  "zip",
  "map",
  "filter",
  "append",
  "get",
  "items",
  "keys",
  "values",
  "pop",
  "add",
]);

const PYTHON_TOKEN_REGEX =
  /(#[^\n]*|f?"[^"\n]*"|f?'[^'\n]*'|\b(?:def|return|if|elif|else|for|while|in|not|and|or|True|False|None|import|from|class|pass|break|continue|lambda|with|as|try|except|finally|yield|async|await)\b|\b(?:print|len|range|enumerate|int|str|list|dict|set|tuple|max|min|sum|sorted|abs|round|zip|map|filter|append|get|items|keys|values|pop|add)\b|\b\d+(?:\.\d+)?\b|[=+\-*/%<>!:]+|[()[\]{},.])/g;

function renderHighlightedPython(source: string) {
  if (!source) return null;
  const tokens = source.split(PYTHON_TOKEN_REGEX);
  return tokens.map((tok, i) => {
    if (!tok) return null;
    if (tok.startsWith("#")) {
      return (
        <Text key={i} style={styles.synComment}>
          {tok}
        </Text>
      );
    }
    if (
      tok.startsWith('"') ||
      tok.startsWith("'") ||
      tok.startsWith('f"') ||
      tok.startsWith("f'")
    ) {
      return (
        <Text key={i} style={styles.synString}>
          {tok}
        </Text>
      );
    }
    if (PYTHON_KEYWORDS.has(tok)) {
      return (
        <Text key={i} style={styles.synKeyword}>
          {tok}
        </Text>
      );
    }
    if (PYTHON_BUILTINS.has(tok)) {
      return (
        <Text key={i} style={styles.synBuiltin}>
          {tok}
        </Text>
      );
    }
    if (/^\d/.test(tok)) {
      return (
        <Text key={i} style={styles.synNumber}>
          {tok}
        </Text>
      );
    }
    if (/^[=+\-*/%<>!:()[\]{},.]+$/.test(tok)) {
      return (
        <Text key={i} style={styles.synPunct}>
          {tok}
        </Text>
      );
    }
    return <Text key={i}>{tok}</Text>;
  });
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

const STORAGE_DRAFTS_KEY = "devlearn_code_drafts_v1";
const STORAGE_STATE_KEY = "devlearn_state_v1";

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (_e) {
    return fallback;
  }
}

function writeLocalJson(key: string, value: unknown) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_e) {}
}

export default function HomeScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [viewMode, setViewMode] = useState<"roadmap" | "studio" | "bughunt">(
    "roadmap",
  );
  const [activeTrack, setActiveTrack] = useState<string>("python_basics");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "visual">("problem");
  const [explainStyle, setExplainStyle] = useState<
    "analogy" | "guide" | "cheatsheet"
  >("analogy");
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

  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);

  const pyodideRef = useRef<any>(null);
  const codeDraftsRef = useRef<Record<string, string>>({});
  const hydratedRef = useRef<boolean>(false);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

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
      activeTrack?: string;
      lastLessonId?: string;
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
    if (savedState.activeTrack) {
      setActiveTrack(savedState.activeTrack);
    }
    hydratedRef.current = true;

    fetchLessons(savedState.activeTrack, savedState.lastLessonId as string | undefined);
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
        }
      },
    );

    if (Platform.OS === "web") loadPyodideEngine();
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    writeLocalJson(STORAGE_STATE_KEY, {
      completedLessons,
      solvedIncidents,
      xpPoints,
      streakCount,
      activeTrack,
      lastLessonId: selectedLesson?.id,
    });
  }, [
    completedLessons,
    solvedIncidents,
    xpPoints,
    streakCount,
    activeTrack,
    selectedLesson?.id,
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
      } else {
        const all = data || [];
        setLessons(all);
        const targetTrack = preferredTrack || "python_basics";
        const initialLesson =
          (preferredLessonId && all.find((l) => l.id === preferredLessonId)) ||
          all.find((l) => l.track === targetTrack) ||
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

    if (!fullLesson.is_free && !isPremium) {
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

  function insertSymbol(symbol: string) {
    const start = Math.min(
      Math.max(0, selectionRef.current.start),
      code.length,
    );
    const end = Math.min(Math.max(start, selectionRef.current.end), code.length);
    const nextCode = code.slice(0, start) + symbol + code.slice(end);
    const cursorOffset =
      symbol === "print()" || symbol === '""' || symbol === 'f""' || symbol === "[]"
        ? symbol.length - 1
        : symbol.length;
    const nextPos = start + cursorOffset;
    selectionRef.current = { start: nextPos, end: nextPos };
    updateCodeWithDraft(nextCode);
  }

  async function handleCopyCode() {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch (_err) {
      setCopiedCode(false);
    }
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
              if (selectedLesson) {
                const isAlreadyCompleted = completedLessons[selectedLesson.id];
                const newXp = isAlreadyCompleted ? xpPoints : xpPoints + 50;
                const newStreak =
                  isAlreadyCompleted
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
                  await supabase.from("user_progress").upsert({
                    user_id: session.user.id,
                    lesson_id: selectedLesson.id,
                    completed: true,
                    updated_at: new Date().toISOString(),
                  });

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
              if (selectedLesson) {
                const isAlreadyCompleted = completedLessons[selectedLesson.id];
                if (!isAlreadyCompleted) {
                  setXpPoints((prev) => prev + 50);
                  setStreakCount((prev) => (prev === 0 ? 1 : prev));
                }
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

  async function handleExecuteBugPatch(
    userCode: string,
    testHarness: string,
  ): Promise<{
    allPassed: boolean;
    results: TestCaseResult[];
    stdout: string;
    error?: string;
  }> {
    try {
      if (Platform.OS === "web" && pyodideRef.current) {
        let stdoutBuffer = "";
        pyodideRef.current.setStdout({
          batched: (str: string) => {
            stdoutBuffer += str + "\n";
          },
        });
        const fullScript = `${userCode}\n${testHarness}`;
        const rawRes = await pyodideRef.current.runPythonAsync(fullScript);
        const parsed = JSON.parse(String(rawRes));
        return {
          allPassed: Boolean(parsed.all_passed),
          results: parsed.results || [],
          stdout: stdoutBuffer.trim(),
        };
      }
      return {
        allPassed: false,
        results: [],
        stdout: "",
        error: "Python engine is still initializing.",
      };
    } catch (err: any) {
      return {
        allPassed: false,
        results: [],
        stdout: "",
        error: err.message || String(err),
      };
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

  const currentTrackTheme =
    TrackThemes[activeTrack] || TrackThemes.python_basics;
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

  const lineCount = Math.max((code || "").split("\n").length, 8);

  function renderCurriculumList() {
    return (
      <>
        <Pressable
          style={styles.backToMapBtn}
          onPress={() => {
            setMobileDrawerOpen(false);
            setViewMode("roadmap");
          }}
        >
          <Text style={styles.backToMapText}>◀ Back to Skill Tree Map</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>TRACK SWITCHER</Text>
        {(["python_basics", "algorithms", "system_design"] as const).map(
          (tKey) => {
            const meta = TrackThemes[tKey];
            const isSelected = activeTrack === tKey;
            return (
              <Pressable
                key={tKey}
                style={[
                  styles.trackTab,
                  isSelected && [
                    styles.activeTrackTab,
                    { borderColor: meta.accentBorder },
                  ],
                ]}
                onPress={() => handleSwitchTrack(tKey)}
              >
                <Text
                  style={[
                    styles.trackTabText,
                    isSelected && { color: "#FAFAFA" },
                  ]}
                >
                  {meta.icon} {meta.label}
                </Text>
              </Pressable>
            );
          },
        )}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {completedCount} of {currentLessons.length} Completed
            </Text>
            <Text
              style={[
                styles.progressPercent,
                { color: currentTrackTheme.accent },
              ]}
            >
              {progressPercent}%
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: currentTrackTheme.accent,
                },
              ]}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>MODULES</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator
              color={currentTrackTheme.accent}
              style={{ marginTop: 12 }}
            />
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
                    isActive && [
                      styles.activeLessonCard,
                      { borderColor: currentTrackTheme.accentBorder },
                    ],
                  ]}
                  onPress={() => handleSelectLesson(lesson)}
                >
                  <View style={styles.lessonCardLeft}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isActive && {
                          backgroundColor: currentTrackTheme.accent,
                          borderColor: currentTrackTheme.accent,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepCircleText,
                          (isActive || isCompleted) && { color: "#09090B" },
                        ]}
                      >
                        {isLocked ? "🔒" : isCompleted ? "✓" : idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.lessonTitle,
                        isActive && styles.activeLessonTitle,
                      ]}
                      numberOfLines={2}
                    >
                      {lesson.title}
                    </Text>
                    {isLocked && (
                      <View style={styles.sidebarProPill}>
                        <Text style={styles.sidebarProText}>PRO</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isCompactHeader && styles.headerCompact]}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.brandGroup}
            onPress={() => setViewMode("roadmap")}
          >
            <View style={styles.brandIconBox}>
              <Text style={styles.brandIconText}>⚡</Text>
            </View>
            {!isCompactHeader && (
              <Text style={styles.headerTitle}>DevLearn</Text>
            )}
          </Pressable>

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
            <Pressable
              style={[
                styles.modeBtn,
                viewMode === "bughunt" && styles.modeBtnBugHuntActive,
              ]}
              onPress={() => setViewMode("bughunt")}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "bughunt" && styles.modeBtnBugHuntTextActive,
                ]}
              >
                🐛 Bug Hunt
              </Text>
            </Pressable>
          </View>

          {!isCompactHeader && (
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
          )}
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.gamificationHeader}
            onPress={() => setShowProfileModal(true)}
          >
            <View
              style={[
                styles.rankPill,
                { borderColor: `${devRank.accent}55` },
              ]}
            >
              <Text style={[styles.rankPillText, { color: devRank.accent }]}>
                {devRank.badge} Lvl {devRank.level}
                {!isCompactHeader ? ` · ${devRank.title}` : ""}
              </Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statText}>
                🔥 {streakCount}
                {!isCompactHeader ? " Streak" : ""}
              </Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statText}>⚡ {xpPoints} XP</Text>
            </View>
            {isPremium && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </Pressable>

          {!isPremium && (
            <Pressable
              style={styles.upgradeHeaderBtn}
              onPress={() => setShowPaywallModal(true)}
            >
              <Text style={styles.upgradeHeaderBtnText}>
                {isCompactHeader ? "⭐ Pro" : "⭐ Pro Tracks"}
              </Text>
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
              <Text style={styles.loginBtnText}>
                {isCompactHeader ? "Sign In" : "Save Progress"}
              </Text>
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
      ) : viewMode === "bughunt" ? (
        <BugHuntArena
          pyodideReady={pyodideReady}
          onExecutePatch={handleExecuteBugPatch}
          onAwardBugHuntXp={handleAwardBugHuntXp}
          solvedIncidents={solvedIncidents}
          renderHighlightedPython={renderHighlightedPython}
        />
      ) : (
        <View style={styles.content}>
          {!isCompactStudio && !sidebarCollapsed && (
            <View style={styles.sidebar}>{renderCurriculumList()}</View>
          )}

          {isCompactStudio && mobileDrawerOpen && (
            <View style={styles.drawerOverlay}>
              <View style={styles.mobileDrawer}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.drawerTitle}>Curriculum Modules</Text>
                  <Pressable
                    style={styles.drawerCloseBtn}
                    onPress={() => setMobileDrawerOpen(false)}
                  >
                    <Text style={styles.drawerCloseText}>✕</Text>
                  </Pressable>
                </View>
                {renderCurriculumList()}
              </View>
              <Pressable
                style={styles.drawerBackdrop}
                onPress={() => setMobileDrawerOpen(false)}
              />
            </View>
          )}

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
                      ☰ Modules ({currentLessonIndex + 1}/{currentLessons.length})
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.sidebarToggleBtn}
                    onPress={() => setSidebarCollapsed((prev) => !prev)}
                  >
                    <Text style={styles.sidebarToggleText}>
                      {sidebarCollapsed ? "☰ Show Curriculum" : "◧ Hide Sidebar"}
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
                        📖 Lesson
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
                        💻 Code & Run
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
                  <Text style={styles.lessonNavBtnText}>◀ Prev</Text>
                </Pressable>
                <Text style={styles.lessonNavCounter}>
                  {currentLessonIndex + 1} / {currentLessons.length || 1}
                </Text>
                <Pressable
                  style={[
                    styles.lessonNavBtn,
                    !hasNextLesson && styles.disabledNavBtn,
                  ]}
                  onPress={handleNextLesson}
                  disabled={!hasNextLesson}
                >
                  <Text style={styles.lessonNavBtnText}>Next ▶</Text>
                </Pressable>
              </View>
            </View>

            {selectedLesson ? (
              <View style={styles.workspaceGrid}>
                {(!isCompactStudio || mobileStudioPane === "learn") && (
                  <ScrollView
                    style={styles.explanationPanel}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.lessonBadgeRow}>
                      <Text
                        style={[
                          styles.lessonStepPill,
                          {
                            backgroundColor: currentTrackTheme.accentSoft,
                            color: currentTrackTheme.accent,
                          },
                        ]}
                      >
                        {selectedLesson.category ||
                          `MODULE ${selectedLesson.lesson_order}`}
                      </Text>
                      {completedLessons[selectedLesson.id] && (
                        <Text style={styles.completedLessonPill}>
                          ✓ SOLVED
                        </Text>
                      )}
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
                      {/* 3-Style Explanation Card */}
                      <View style={styles.conceptBox}>
                        <View style={styles.conceptTopRow}>
                          <Text style={styles.sectionHeaderLabel}>
                            📖 LEARN THE CONCEPT
                          </Text>
                          <View style={styles.explainStyleSwitcher}>
                            {[
                              { id: "analogy", label: "🌱 Simple" },
                              { id: "guide", label: "📘 Full Guide" },
                              { id: "cheatsheet", label: "⚡ Cheat Sheet" },
                            ].map((mode) => {
                              const isActiveStyle = explainStyle === mode.id;
                              return (
                                <Pressable
                                  key={mode.id}
                                  style={[
                                    styles.explainStyleBtn,
                                    isActiveStyle &&
                                      styles.explainStyleBtnActive,
                                  ]}
                                  onPress={() =>
                                    setExplainStyle(
                                      mode.id as
                                        | "analogy"
                                        | "guide"
                                        | "cheatsheet",
                                    )
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.explainStyleBtnText,
                                      isActiveStyle &&
                                        styles.explainStyleBtnTextActive,
                                    ]}
                                  >
                                    {mode.label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>

                        {explainStyle === "analogy" && lessonEnrichment ? (
                          <View style={styles.analogyContainer}>
                            <View style={styles.realWorldBanner}>
                              <Text style={styles.realWorldLabel}>
                                🌍 REAL-WORLD USE
                              </Text>
                              <Text style={styles.realWorldText}>
                                {lessonEnrichment.realWorldUse}
                              </Text>
                            </View>

                            <Text style={styles.analogyHeading}>
                              💡 {lessonEnrichment.analogyTitle}
                            </Text>
                            <FormattedText
                              text={lessonEnrichment.analogyText}
                              style={styles.problemText}
                            />
                          </View>
                        ) : explainStyle === "cheatsheet" &&
                          lessonEnrichment ? (
                          <View style={styles.cheatSheetContainer}>
                            <Text style={styles.cheatSheetIntro}>
                              Copy or reference this pattern while solving the
                              assignment on the right:
                            </Text>
                            <View style={styles.codeBlockContainer}>
                              <View style={styles.codeBlockHeader}>
                                <Text style={styles.codeBlockLang}>
                                  PYTHON SYNTAX PATTERN
                                </Text>
                              </View>
                              <Text style={styles.codeBlockText}>
                                {lessonEnrichment.cheatSheet}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <FormattedText
                            text={selectedLesson.content}
                            style={styles.problemText}
                          />
                        )}
                      </View>

                      {/* Interactive 1-Question Warm-Up Quiz */}
                      {lessonEnrichment && (
                        <View style={styles.quizCard}>
                          <View style={styles.quizHeaderRow}>
                            <Text style={styles.quizBadgeText}>
                              🎯 QUICK WARM-UP CHECK
                            </Text>
                            <Text
                              style={[
                                styles.quizXpPill,
                                solvedQuizzes[selectedLesson.id] &&
                                  styles.quizXpPillDone,
                              ]}
                            >
                              {solvedQuizzes[selectedLesson.id]
                                ? "✓ +10 XP Earned"
                                : "+10 XP"}
                            </Text>
                          </View>
                          <Text style={styles.quizQuestion}>
                            {lessonEnrichment.quiz.question}
                          </Text>

                          <View style={styles.quizOptionsList}>
                            {lessonEnrichment.quiz.options.map((opt, idx) => {
                              const isPicked = quizSelection === idx;
                              const isCorrect =
                                idx === lessonEnrichment.quiz.correctIndex;
                              const showSuccess = isPicked && isCorrect;
                              const showWrong = isPicked && !isCorrect;

                              return (
                                <Pressable
                                  key={idx}
                                  style={[
                                    styles.quizOptionBtn,
                                    showSuccess && styles.quizOptionCorrect,
                                    showWrong && styles.quizOptionWrong,
                                  ]}
                                  onPress={() => handleSelectQuizOption(idx)}
                                >
                                  <Text
                                    style={[
                                      styles.quizOptionText,
                                      showSuccess && {
                                        color: "#34D399",
                                        fontWeight: "800",
                                      },
                                      showWrong && {
                                        color: "#F87171",
                                        fontWeight: "700",
                                      },
                                    ]}
                                  >
                                    {showSuccess
                                      ? "✅ "
                                      : showWrong
                                        ? "❌ "
                                        : "○ "}
                                    {opt}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>

                          {quizSelection !== null && (
                            <View
                              style={[
                                styles.quizFeedbackBox,
                                quizSelection ===
                                  lessonEnrichment.quiz.correctIndex
                                  ? styles.quizFeedbackSuccess
                                  : styles.quizFeedbackRetry,
                              ]}
                            >
                              <Text style={styles.quizFeedbackText}>
                                {quizSelection ===
                                lessonEnrichment.quiz.correctIndex
                                  ? `🎉 Spot on! ${lessonEnrichment.quiz.explanation}`
                                  : "💡 Not quite — tap another option to test your intuition!"}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

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
                )}

                {(!isCompactStudio || mobileStudioPane === "code") && (
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
                        {hasSavedDraft && (
                          <View style={styles.savedDraftPill}>
                            <Text style={styles.savedDraftPillText}>
                              💾 Draft Saved
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.ideHeaderActions}>
                        <Pressable
                          style={[
                            styles.copyCodeBtn,
                            copiedCode && styles.copyCodeBtnSuccess,
                          ]}
                          onPress={handleCopyCode}
                        >
                          <Text
                            style={[
                              styles.copyCodeBtnText,
                              copiedCode && { color: "#34D399" },
                            ]}
                          >
                            {copiedCode ? "✓ Copied" : "📋 Copy"}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={styles.resetBtn}
                          onPress={() =>
                            updateCodeWithDraft(
                              (selectedLesson.initial_code || "").replace(
                                /\\n/g,
                                "\n",
                              ),
                              selectedLesson,
                            )
                          }
                        >
                          <Text style={styles.resetBtnText}>↺ Reset</Text>
                        </Pressable>
                      </View>
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

                    <ScrollView
                      style={styles.editorScroll}
                      contentContainerStyle={[
                        styles.editorBody,
                        { minHeight: lineCount * 21 + 32 },
                      ]}
                      showsVerticalScrollIndicator={true}
                    >
                      <View style={styles.lineNumbers}>
                        {Array.from({ length: lineCount }).map((_, i) => (
                          <Text key={i} style={styles.lineNumberText}>
                            {i + 1}
                          </Text>
                        ))}
                      </View>
                      <View
                        style={[
                          styles.editorCodeWrapper,
                          { minHeight: lineCount * 21 + 32 },
                        ]}
                      >
                        <View
                          pointerEvents="none"
                          style={[
                            styles.syntaxHighlightLayer,
                            { minHeight: lineCount * 21 + 32 },
                          ]}
                        >
                          <Text style={styles.syntaxHighlightText}>
                            {renderHighlightedPython(code)}
                            {code.endsWith("\n") ? " " : ""}
                          </Text>
                        </View>
                        <TextInput
                          style={[
                            styles.codeEditor,
                            { minHeight: lineCount * 21 + 32 },
                          ]}
                          value={code}
                          onChangeText={(nextText) =>
                            updateCodeWithDraft(nextText)
                          }
                          onSelectionChange={(e) => {
                            selectionRef.current = e.nativeEvent.selection;
                          }}
                          onKeyPress={(e: any) => {
                            const nativeEv = e?.nativeEvent;
                            if (
                              nativeEv &&
                              nativeEv.key === "Enter" &&
                              (nativeEv.metaKey || nativeEv.ctrlKey)
                            ) {
                              e.preventDefault?.();
                              if (nativeEv.shiftKey) {
                                runPythonCode();
                              } else {
                                runPlaygroundOnly();
                              }
                            }
                          }}
                          multiline
                          scrollEnabled={false}
                          autoCapitalize="none"
                          autoCorrect={false}
                          spellCheck={false}
                        />
                      </View>
                    </ScrollView>

                    <View style={styles.ideFooter}>
                      <Text style={styles.ideFooterText}>
                        UTF-8 · {(code || "").split("\n").length} lines ·{" "}
                        {(code || "").length} chars
                      </Text>
                      <Text style={styles.ideFooterText}>
                        {pyodideReady
                          ? "● Python 3.11 Ready · ⌘↵ Run"
                          : "○ Loading Engine"}
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
                      <View style={styles.shortcutBadgeDark}>
                        <Text style={styles.shortcutBadgeDarkText}>⌘↵</Text>
                      </View>
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
                      {!isExecuting && (
                        <View style={styles.shortcutBadgeLight}>
                          <Text style={styles.shortcutBadgeLightText}>⇧⌘↵</Text>
                        </View>
                      )}
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
            lessonTitle={selectedLesson?.title || ""}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", position: "relative" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F23",
    backgroundColor: "#09090B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    flexWrap: "wrap",
    gap: 10,
  },
  headerCompact: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 101,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  brandIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandIconText: {
    fontSize: 14,
  },
  headerTitle: {
    color: "#FAFAFA",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
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
  modeBtnBugHuntActive: {
    backgroundColor: "rgba(239, 68, 68, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
  },
  modeBtnText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  modeBtnTextActive: { color: "#FAFAFA" },
  modeBtnBugHuntTextActive: { color: "#F87171", fontWeight: "800" },
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
  gamificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  rankPill: {
    backgroundColor: "#121215",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  rankPillText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
  },
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
  authBtnText: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  loginBtnText: { color: "#09090B", fontSize: 12, fontWeight: "800" },
  content: { flex: 1, flexDirection: "row", zIndex: 1, position: "relative" },
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: "#1F1F23",
    backgroundColor: "#0C0C0E",
    padding: 16,
  },
  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 250,
    flexDirection: "row",
  },
  mobileDrawer: {
    width: 280,
    maxWidth: "84%",
    backgroundColor: "#0C0C0E",
    borderRightWidth: 1,
    borderRightColor: "#27272A",
    padding: 16,
    zIndex: 252,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 9, 11, 0.75)",
    zIndex: 251,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F23",
  },
  drawerTitle: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "800",
  },
  drawerCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerCloseText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "800",
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
  sidebarProPill: {
    backgroundColor: "rgba(99, 102, 241, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.38)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sidebarProText: {
    color: "#818CF8",
    fontSize: 8,
    fontWeight: "800",
  },
  workspaceContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "#09090B",
    overflow: "hidden",
  },
  studioTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1F",
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
    backgroundColor: "#121215",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  sidebarToggleText: {
    color: "#D4D4D8",
    fontSize: 11,
    fontWeight: "700",
  },
  mobilePaneSwitcher: {
    flexDirection: "row",
    backgroundColor: "#121215",
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  mobilePaneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  mobilePaneBtnActive: {
    backgroundColor: "#27272A",
  },
  mobilePaneText: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "700",
  },
  mobilePaneTextActive: {
    color: "#FAFAFA",
  },
  lessonNavBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lessonNavBtn: {
    backgroundColor: "#121215",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  disabledNavBtn: {
    opacity: 0.4,
  },
  lessonNavBtnText: {
    color: "#D4D4D8",
    fontSize: 11,
    fontWeight: "700",
  },
  lessonNavCounter: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  workspaceGrid: { flex: 1, flexDirection: "row", gap: 22, overflow: "hidden" },
  explanationPanel: { flex: 1, paddingRight: 8 },
  editorPanel: { flex: 1.15, overflow: "hidden" },
  lessonBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
    flexWrap: "wrap",
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
  completedLessonPill: {
    backgroundColor: "rgba(16, 185, 129, 0.14)",
    color: "#34D399",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    letterSpacing: 0.8,
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
  conceptTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  explainStyleSwitcher: {
    flexDirection: "row",
    backgroundColor: "#09090B",
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    gap: 2,
  },
  explainStyleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  explainStyleBtnActive: {
    backgroundColor: "#27272A",
  },
  explainStyleBtnText: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "700",
  },
  explainStyleBtnTextActive: {
    color: "#FAFAFA",
    fontWeight: "800",
  },
  analogyContainer: {
    gap: 10,
  },
  realWorldBanner: {
    backgroundColor: "#09090B",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#27272A",
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
    padding: 12,
    gap: 4,
  },
  realWorldLabel: {
    color: "#38BDF8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  realWorldText: {
    color: "#E4E4E7",
    fontSize: 13,
    lineHeight: 19,
  },
  analogyHeading: {
    color: "#FAFAFA",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  cheatSheetContainer: {
    gap: 8,
  },
  cheatSheetIntro: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 19,
  },
  quizCard: {
    backgroundColor: "#121215",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B40",
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quizBadgeText: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  quizXpPill: {
    backgroundColor: "#F59E0B20",
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quizXpPillDone: {
    backgroundColor: "#10B98120",
    color: "#34D399",
  },
  quizQuestion: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  quizOptionsList: {
    gap: 8,
  },
  quizOptionBtn: {
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  quizOptionCorrect: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  quizOptionWrong: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  quizOptionText: {
    color: "#D4D4D8",
    fontSize: 13,
    fontWeight: "600",
  },
  quizFeedbackBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  quizFeedbackSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  quizFeedbackRetry: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  quizFeedbackText: {
    color: "#E4E4E7",
    fontSize: 12,
    lineHeight: 18,
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
    flex: 1.45,
    minHeight: 240,
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
  savedDraftPill: {
    backgroundColor: "rgba(16, 185, 129, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedDraftPillText: {
    color: "#34D399",
    fontSize: 9,
    fontWeight: "800",
  },
  ideHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyCodeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#121215",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  copyCodeBtnSuccess: {
    borderColor: "rgba(16, 185, 129, 0.45)",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  copyCodeBtnText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
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
  editorScroll: {
    flex: 1,
    backgroundColor: "#121215",
  },
  editorBody: {
    flexDirection: "row",
    minHeight: 220,
  },
  lineNumbers: {
    backgroundColor: "#0C0C0E",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#1F1F23",
    alignItems: "flex-end",
    ...Platform.select({ web: { userSelect: "none" as any } }),
  },
  lineNumberText: {
    color: "#52525B",
    fontSize: 13,
    lineHeight: 21,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  editorCodeWrapper: {
    flex: 1,
    position: "relative",
  },
  syntaxHighlightLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  syntaxHighlightText: {
    color: "#FAFAFA",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    lineHeight: 21,
    ...Platform.select({
      web: {
        whiteSpace: "pre-wrap" as any,
        wordBreak: "break-word" as any,
      },
    }),
  },
  synComment: {
    color: "#64748B",
    fontStyle: "italic",
  },
  synString: {
    color: "#34D399",
  },
  synKeyword: {
    color: "#C084FC",
    fontWeight: "700",
  },
  synBuiltin: {
    color: "#38BDF8",
  },
  synNumber: {
    color: "#F59E0B",
  },
  synPunct: {
    color: "#94A3B8",
  },
  codeEditor: {
    flex: 1,
    color: Platform.OS === "web" ? "transparent" : "#FAFAFA",
    backgroundColor: "transparent",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    lineHeight: 21,
    padding: 16,
    textAlignVertical: "top",
    ...Platform.select({
      web: {
        caretColor: "#F59E0B" as any,
        outlineStyle: "none" as any,
        resize: "none" as any,
        overflow: "hidden" as any,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#18181B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#27272A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  secondaryRunBtnText: { color: "#E4E4E7", fontWeight: "700", fontSize: 13 },
  shortcutBadgeDark: {
    backgroundColor: "#27272A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shortcutBadgeDarkText: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  runButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    borderRadius: 9,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  disabledButton: { opacity: 0.6 },
  runButtonText: { color: "#09090B", fontWeight: "900", fontSize: 13 },
  shortcutBadgeLight: {
    backgroundColor: "rgba(9, 9, 11, 0.16)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shortcutBadgeLightText: {
    color: "#09090B",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
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
