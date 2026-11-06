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
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";

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
        `[SYNTAX // TRACE] Check your Python syntax:\n${err.message || String(err)}`,
      );
    } finally {
      setIsExecuting(false);
    }
  }

  async function runPythonCode() {
    setIsExecuting(true);
    setOutput("Running verification suite...");
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
              `[RUNTIME // ERROR]\n${parsedResult.error}\n\nConsole:\n${rawOutput}`,
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
            setOutput(rawOutput || "Code executed. See Assertions tab.");

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
              finalLogs += "\n\n✓ Verification Passed (+50 XP)";
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
              finalLogs += `\n\n✕ Output mismatch. Expected output:\n${expected}`;
            }
          }
          setOutput(finalLogs);
          setBottomTab("console");
        }
      }
    } catch (err: any) {
      setOutput(`[RUNTIME // TRACE]\n${err.message || String(err)}`);
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
          <Text style={styles.backToMapText}>← BACK TO SKILL MAP</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>SWITCH TRACK</Text>
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
                    { backgroundColor: meta.stickerBg },
                  ],
                ]}
                onPress={() => handleSwitchTrack(tKey)}
              >
                <Text
                  style={[
                    styles.trackTabText,
                    isSelected && { color: "#111111", fontWeight: "900" },
                  ]}
                >
                  [{meta.icon}] {meta.label}
                </Text>
              </Pressable>
            );
          },
        )}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {completedCount} of {currentLessons.length} Solved
            </Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(progressPercent, 4)}%`,
                  backgroundColor: StudioColors.lime,
                },
              ]}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>MODULES</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator
              color={StudioColors.textPrimary}
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
                      { backgroundColor: currentTrackTheme.stickerBg },
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
                          backgroundColor: "#111111",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepCircleText,
                          isActive && { color: "#FFFFFF" },
                        ]}
                      >
                        {isLocked
                          ? "L"
                          : isCompleted
                            ? "✓"
                            : String(idx + 1).padStart(2, "0")}
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
              <Text style={styles.brandIconText}>DEVLEARN</Text>
            </View>
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
                SKILL MAP
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
                CODE STUDIO
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
                BUG HUNT
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
                {pyodideReady ? "PY 3.11 READY" : "LOADING PY..."}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.gamificationHeader}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>
                LVL 0{devRank.level}
                {!isCompactHeader ? ` · ${devRank.title.toUpperCase()}` : ""}
              </Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statText}>STREAK {streakCount}D</Text>
            </View>
            <View style={styles.xpStickerPill}>
              <Text style={styles.xpStickerText}>{xpPoints} XP</Text>
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
                {isCompactHeader ? "PRO ★" : "UNLOCK PRO ★"}
              </Text>
            </Pressable>
          )}
          {session ? (
            <View style={styles.userSection}>
              <Pressable
                style={styles.authBtn}
                onPress={() => supabase.auth.signOut()}
              >
                <Text style={styles.authBtnText}>SIGN OUT</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.authBtn, styles.loginBtn]}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.loginBtnText}>
                {isCompactHeader ? "SIGN IN" : "SAVE PROGRESS"}
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
                      ☰ MODULES ({currentLessonIndex + 1}/{currentLessons.length})
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
                  <ScrollView
                    style={styles.explanationPanel}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.lessonBadgeRow}>
                      <Text
                        style={[
                          styles.lessonStepPill,
                          {
                            backgroundColor: currentTrackTheme.stickerBg,
                          },
                        ]}
                      >
                        {selectedLesson.category ||
                          `MODULE ${String(selectedLesson.lesson_order).padStart(2, "0")}`}
                      </Text>
                      {completedLessons[selectedLesson.id] && (
                        <Text style={styles.completedLessonPill}>
                          SOLVED ✓
                        </Text>
                      )}
                      {selectedLesson.complexities?.time && (
                        <Text style={styles.complexityBadge}>
                          TIME: {selectedLesson.complexities.time}
                        </Text>
                      )}
                      {selectedLesson.complexities?.space && (
                        <Text style={styles.complexityBadge}>
                          SPACE: {selectedLesson.complexities.space}
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
                        CONCEPT & MISSION
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
                        MEMORY SIMULATOR
                      </Text>
                    </Pressable>
                  </View>

                  {activeTab === "problem" ? (
                    <View style={styles.problemCard}>
                      {/* 3-Style Explanation Card */}
                      <View style={styles.conceptBox}>
                        <View style={styles.conceptTopRow}>
                          <View style={styles.sectionStickerBadge}>
                            <Text style={styles.sectionHeaderLabel}>
                              LEARN THE CONCEPT
                            </Text>
                          </View>
                          <View style={styles.explainStyleSwitcher}>
                            {[
                              { id: "analogy", label: "SIMPLE ANALOGY" },
                              { id: "guide", label: "FULL GUIDE" },
                              { id: "cheatsheet", label: "CHEAT SHEET" },
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
                                WHY THIS MATTERS IN REAL APPS
                              </Text>
                              <Text style={styles.realWorldText}>
                                {lessonEnrichment.realWorldUse}
                              </Text>
                            </View>

                            <Text style={styles.analogyHeading}>
                              {lessonEnrichment.analogyTitle}
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
                              mission on the right:
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
                            <View style={styles.quizSticker}>
                              <Text style={styles.quizBadgeText}>
                                QUICK WARM-UP CHECK
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.quizXpPill,
                                solvedQuizzes[selectedLesson.id] &&
                                  styles.quizXpPillDone,
                              ]}
                            >
                              <Text style={styles.quizXpPillText}>
                                {solvedQuizzes[selectedLesson.id]
                                  ? "✓ +10 XP EARNED"
                                  : "+10 XP"}
                              </Text>
                            </View>
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
                                      (showSuccess || showWrong) && {
                                        color: "#111111",
                                        fontWeight: "800",
                                      },
                                    ]}
                                  >
                                    {showSuccess
                                      ? "[✓] "
                                      : showWrong
                                        ? "[✕] "
                                        : `[${String.fromCharCode(65 + idx)}] `}
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
                                  ? `✓ Spot on! ${lessonEnrichment.quiz.explanation}`
                                  : "→ Not quite — tap another option to test your intuition!"}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      <View style={styles.assignmentBox}>
                        <View style={styles.assignmentHeaderRow}>
                          <View style={styles.missionSticker}>
                            <Text style={styles.assignmentHeaderLabel}>
                              YOUR CODING MISSION
                            </Text>
                          </View>
                          <View style={styles.xpRewardPill}>
                            <Text style={styles.xpRewardPillText}>+50 XP</Text>
                          </View>
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
                                    <View
                                      style={[
                                        styles.missionBulletBox,
                                        isStepPassed && {
                                          backgroundColor: StudioColors.lime,
                                        },
                                      ]}
                                    >
                                      <Text style={styles.missionBullet}>
                                        {isStepPassed ? "✓" : i + 1}
                                      </Text>
                                    </View>
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
                            EXAMPLE 0{i + 1}
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
                            { backgroundColor: StudioColors.coral },
                          ]}
                        />
                        <View
                          style={[
                            styles.controlDot,
                            { backgroundColor: StudioColors.yellow },
                          ]}
                        />
                        <View
                          style={[
                            styles.controlDot,
                            { backgroundColor: StudioColors.lime },
                          ]}
                        />
                      </View>
                      <View style={styles.ideTitleGroup}>
                        <Text style={styles.ideTitleText}>solution.py</Text>
                        <Text style={styles.ideMetaPill}>PY 3.11</Text>
                        {hasSavedDraft && (
                          <View style={styles.savedDraftPill}>
                            <Text style={styles.savedDraftPillText}>
                              SAVED DRAFT
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
                              copiedCode && { color: StudioColors.lime },
                            ]}
                          >
                            {copiedCode ? "✓ COPIED" : "COPY"}
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
                          <Text style={styles.resetBtnText}>RESET</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.symbolBar}>
                      <Text style={styles.quickInsertLabel}>INSERT</Text>
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
                        UTF-8 · {(code || "").split("\n").length} LINES ·{" "}
                        {(code || "").length} CHARS
                      </Text>
                      <Text
                        style={[
                          styles.ideFooterText,
                          pyodideReady && { color: StudioColors.lime },
                        ]}
                      >
                        {pyodideReady
                          ? "● READY · ⌘↵ RUN"
                          : "○ INITIALIZING"}
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
                      <Text style={styles.secondaryRunBtnText}>▶ TEST RUN</Text>
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
                          ? "CHECKING CODE..."
                          : "SUBMIT CODE (+50 XP) →"}
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
                            CONSOLE OUTPUT
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
                            MISSION CHECKS{" "}
                            {testResults
                              ? `[${testResults.filter((t) => t.passed).length}/${testResults.length}]`
                              : ""}
                          </Text>
                        </Pressable>
                      </View>

                      {bottomTab === "console" && output ? (
                        <Pressable
                          style={styles.clearConsoleBtn}
                          onPress={() => setOutput("")}
                        >
                          <Text style={styles.clearConsoleText}>CLEAR</Text>
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
                              &gt;&gt;&gt; READY TO RUN
                            </Text>
                            <Text style={styles.emptyConsoleHint}>
                              Click &quot;▶ TEST RUN&quot; to see your print() output, or
                              &quot;SUBMIT CODE (+50 XP)&quot; to grade your solution.
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
                                  ? { color: StudioColors.lime }
                                  : { color: StudioColors.yellow },
                              ]}
                            >
                              {testResults.every((t) => t.passed)
                                ? `✓ ALL ${testResults.length} MISSION CHECKS PASSED!`
                                : `→ ${testResults.filter((t) => t.passed).length} OF ${testResults.length} CHECKS PASSED — INSPECT BELOW`}
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
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontFamily: MonoFont,
                                    fontWeight: "900",
                                    color: tr.passed
                                      ? StudioColors.lime
                                      : StudioColors.coral,
                                  }}
                                >
                                  {tr.passed ? "✓" : "✕"}
                                </Text>
                                <Text
                                  style={[
                                    styles.testPillText,
                                    selectedTestIndex === idx &&
                                      styles.activeTestPillText,
                                  ]}
                                >
                                  CHECK 0{tr.id}
                                </Text>
                              </Pressable>
                            ))}
                          </View>

                          {testResults[selectedTestIndex] && (
                            <View style={styles.testDetails}>
                              <Text style={styles.testHeader}>
                                REQUIREMENT CHECKED
                              </Text>
                              <View style={styles.testDataBox}>
                                <Text style={styles.testDataText}>
                                  {testResults[selectedTestIndex].input}
                                </Text>
                              </View>

                              <View style={styles.comparisonRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.testHeader}>
                                    EXPECTED OUTPUT
                                  </Text>
                                  <View style={styles.testDataBox}>
                                    <Text style={styles.testDataText}>
                                      {testResults[selectedTestIndex].expected}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                  <Text style={styles.testHeader}>
                                    YOUR OUTPUT
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
                                          ? { color: StudioColors.lime }
                                          : { color: StudioColors.coral },
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
                            NO MISSION CHECKS RUN YET
                          </Text>
                          <Text style={styles.emptyConsoleHint}>
                            Click &quot;SUBMIT CODE (+50 XP)&quot; above to
                            validate your code against every mission check.
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
  container: {
    flex: 1,
    backgroundColor: StudioColors.bg,
    position: "relative",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    backgroundColor: "#FFFFFF",
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
    gap: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  brandIconBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: "#111111",
    borderWidth: 1.5,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    ...HardShadowSm,
  },
  brandIconText: {
    color: StudioColors.lime,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  modeSwitcher: {
    flexDirection: "row",
    gap: 6,
  },
  modeBtn: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  modeBtnActive: {
    backgroundColor: StudioColors.lime,
    borderColor: "#111111",
  },
  modeBtnBugHuntActive: {
    backgroundColor: StudioColors.coral,
    borderColor: "#111111",
  },
  modeBtnText: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  modeBtnTextActive: { color: "#111111" },
  modeBtnBugHuntTextActive: {
    color: "#111111",
    fontWeight: "900",
  },
  statusPill: {
    backgroundColor: "#F4F0E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  gamificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  rankPill: {
    backgroundColor: StudioColors.violet,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
  },
  rankPillText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  statPill: {
    backgroundColor: StudioColors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
  },
  statText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  xpStickerPill: {
    backgroundColor: StudioColors.pink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
  },
  xpStickerText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: "#111111",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  proBadgeText: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  upgradeHeaderBtn: {
    backgroundColor: StudioColors.yellow,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  upgradeHeaderBtnText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  authBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  loginBtn: {
    backgroundColor: "#111111",
    borderColor: "#111111",
    ...HardShadowSm,
  },
  authBtnText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  loginBtnText: {
    color: StudioColors.lime,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  content: { flex: 1, flexDirection: "row", zIndex: 1, position: "relative" },
  sidebar: {
    width: 268,
    borderRightWidth: 2,
    borderRightColor: "#111111",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    borderRightWidth: 2,
    borderRightColor: "#111111",
    padding: 16,
    zIndex: 252,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.55)",
    zIndex: 251,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
  },
  drawerTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
  },
  drawerCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F4F0E6",
    borderWidth: 1.5,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerCloseText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
  },
  backToMapBtn: {
    backgroundColor: "#F4F0E6",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    marginBottom: 18,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  backToMapText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  sectionTitle: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 1.2,
    fontFamily: MonoFont,
  },
  trackTab: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#F4F0E6",
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTrackTab: {
    borderColor: "#111111",
    ...HardShadowSm,
  },
  trackTabText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "700",
  },
  progressCard: {
    backgroundColor: "#F4F0E6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#111111",
    marginTop: 10,
    ...HardShadowSm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "800",
  },
  progressPercent: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#111111",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: StudioColors.lime,
    borderRightWidth: 1.5,
    borderRightColor: "#111111",
  },
  lessonCard: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeLessonCard: {
    borderColor: "#111111",
    ...HardShadowSm,
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
    borderRadius: 5,
    backgroundColor: "#F4F0E6",
    borderWidth: 1.5,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleCompleted: {
    backgroundColor: StudioColors.mint,
  },
  stepCircleText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lessonTitle: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  activeLessonTitle: { color: "#111111", fontWeight: "900" },
  sidebarProPill: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1,
    borderColor: "#111111",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  sidebarProText: {
    color: "#111111",
    fontSize: 8,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
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
    borderBottomColor: "#111111",
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  sidebarToggleText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  mobilePaneSwitcher: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
  },
  mobilePaneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  mobilePaneBtnActive: {
    backgroundColor: StudioColors.lime,
  },
  mobilePaneText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  mobilePaneTextActive: {
    color: "#111111",
  },
  lessonNavBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lessonNavBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  disabledNavBtn: {
    opacity: 0.4,
  },
  lessonNavBtnText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lessonNavCounter: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
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
    backgroundColor: StudioColors.yellow,
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#111111",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  completedLessonPill: {
    backgroundColor: StudioColors.mint,
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#111111",
    letterSpacing: 0.6,
  },
  complexityBadge: {
    backgroundColor: "#FFFFFF",
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#111111",
  },
  title: {
    color: "#111111",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  subtitleDesc: {
    color: StudioColors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 14,
    lineHeight: 21,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#111111",
    ...HardShadowSm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 5,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTabItem: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: "#111111",
  },
  tabText: {
    color: StudioColors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  activeTabText: { color: "#111111" },
  problemCard: { paddingBottom: 20 },
  sectionStickerBadge: {
    backgroundColor: "#111111",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sectionHeaderLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  conceptBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111111",
    marginBottom: 16,
    ...HardShadow,
  },
  conceptTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#111111",
  },
  explainStyleSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F4F0E6",
    padding: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    gap: 3,
  },
  explainStyleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  explainStyleBtnActive: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: "#111111",
  },
  explainStyleBtnText: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  explainStyleBtnTextActive: {
    color: "#111111",
  },
  analogyContainer: {
    gap: 12,
  },
  realWorldBanner: {
    backgroundColor: "#F4F0E6",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#111111",
    borderLeftWidth: 5,
    borderLeftColor: "#111111",
    padding: 13,
    gap: 4,
  },
  realWorldLabel: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  realWorldText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  analogyHeading: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  cheatSheetContainer: {
    gap: 8,
  },
  cheatSheetIntro: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  quizCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111111",
    padding: 18,
    marginBottom: 16,
    gap: 10,
    ...HardShadow,
  },
  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quizSticker: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
  },
  quizBadgeText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  quizXpPill: {
    backgroundColor: "#F4F0E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#111111",
  },
  quizXpPillDone: {
    backgroundColor: StudioColors.mint,
  },
  quizXpPillText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  quizQuestion: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  quizOptionsList: {
    gap: 8,
  },
  quizOptionBtn: {
    backgroundColor: "#F4F0E6",
    borderWidth: 1.5,
    borderColor: "#111111",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  quizOptionCorrect: {
    borderColor: "#111111",
    backgroundColor: StudioColors.lime,
  },
  quizOptionWrong: {
    borderColor: "#111111",
    backgroundColor: "#FECDD3",
  },
  quizOptionText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
  },
  quizFeedbackBox: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
  },
  quizFeedbackSuccess: {
    backgroundColor: "#D1FAE5",
  },
  quizFeedbackRetry: {
    backgroundColor: "#FEF3C7",
  },
  quizFeedbackText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  problemText: {
    color: "#22201D",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
  },
  boldInline: { color: "#111111", fontWeight: "900" },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    color: "#111111",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "900",
  },
  codeBlockContainer: {
    backgroundColor: StudioColors.codeBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111111",
    overflow: "hidden",
  },
  codeBlockHeader: {
    backgroundColor: StudioColors.codeSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: StudioColors.codeBorder,
  },
  codeBlockLang: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  codeBlockText: {
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
  },
  inlineCode: {
    backgroundColor: "#EAE3D2",
    color: "#111111",
    fontFamily: MonoFont,
    fontSize: 12.5,
    fontWeight: "800",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  assignmentBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#111111",
    padding: 18,
    borderRadius: 10,
    marginBottom: 16,
    ...HardShadow,
  },
  assignmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  missionSticker: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
  },
  assignmentHeaderLabel: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  xpRewardPill: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpRewardPillText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  assignmentDescription: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 12,
  },
  checklistContainer: {
    backgroundColor: "#F4F0E6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#111111",
    gap: 10,
  },
  missionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  missionBulletBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  missionBullet: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  missionText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "600",
  },
  exampleBlock: { marginBottom: 16 },
  exampleTitle: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exampleBox: {
    backgroundColor: StudioColors.codeBg,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111111",
    ...HardShadowSm,
  },
  exampleCode: {
    color: StudioColors.codeText,
    fontSize: 13,
    fontFamily: MonoFont,
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: { color: StudioColors.lime, fontWeight: "800" },
  ideFrame: {
    flex: 1.45,
    minHeight: 240,
    backgroundColor: StudioColors.codeBg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111111",
    overflow: "hidden",
    ...HardShadow,
  },
  ideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: StudioColors.codeSurface,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.codeBorder,
  },
  windowControls: { flexDirection: "row", gap: 6 },
  controlDot: { width: 10, height: 10, borderRadius: 5 },
  ideTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ideTitleText: {
    color: StudioColors.codeText,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  ideMetaPill: {
    backgroundColor: "#2E2E2A",
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedDraftPill: {
    backgroundColor: "rgba(184, 255, 59, 0.14)",
    borderWidth: 1,
    borderColor: StudioColors.lime,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedDraftPillText: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  ideHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyCodeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: StudioColors.codeBg,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: StudioColors.codeBorder,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  copyCodeBtnSuccess: {
    borderColor: StudioColors.lime,
  },
  copyCodeBtnText: {
    color: StudioColors.codeText,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#2E2E2A",
    borderRadius: 5,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  resetBtnText: {
    color: StudioColors.codeText,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  symbolBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#191917",
    borderBottomWidth: 1,
    borderBottomColor: StudioColors.codeBorder,
    flexWrap: "wrap",
  },
  quickInsertLabel: {
    color: StudioColors.codeMuted,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
    marginRight: 4,
  },
  symbolChip: {
    backgroundColor: "#262623",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3A3A35",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  symbolText: {
    color: StudioColors.yellow,
    fontSize: 12,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  editorScroll: {
    flex: 1,
    backgroundColor: StudioColors.codeBg,
  },
  editorBody: {
    flexDirection: "row",
    minHeight: 220,
  },
  lineNumbers: {
    backgroundColor: StudioColors.codeBg,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: StudioColors.codeBorder,
    alignItems: "flex-end",
    ...Platform.select({ web: { userSelect: "none" as any } }),
  },
  lineNumberText: {
    color: StudioColors.codeMuted,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: MonoFont,
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
    color: StudioColors.codeText,
    fontFamily: MonoFont,
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
    color: "#7A776E",
    fontStyle: "italic",
  },
  synString: {
    color: StudioColors.lime,
  },
  synKeyword: {
    color: StudioColors.pink,
    fontWeight: "700",
  },
  synBuiltin: {
    color: "#38BDF8",
  },
  synNumber: {
    color: StudioColors.yellow,
  },
  synPunct: {
    color: "#C7C2B6",
  },
  codeEditor: {
    flex: 1,
    color: Platform.OS === "web" ? "transparent" : StudioColors.codeText,
    backgroundColor: "transparent",
    fontFamily: MonoFont,
    fontSize: 14,
    lineHeight: 21,
    padding: 16,
    textAlignVertical: "top",
    ...Platform.select({
      web: {
        caretColor: StudioColors.lime as any,
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
    backgroundColor: StudioColors.codeSurface,
    borderTopWidth: 1,
    borderTopColor: StudioColors.codeBorder,
  },
  ideFooterText: {
    color: StudioColors.codeMuted,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  secondaryRunBtnText: {
    color: "#111111",
    fontWeight: "900",
    fontSize: 11,
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  shortcutBadgeDark: {
    backgroundColor: "#F4F0E6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#111111",
  },
  shortcutBadgeDarkText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  runButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: StudioColors.lime,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  disabledButton: { opacity: 0.6 },
  runButtonText: {
    color: "#111111",
    fontWeight: "900",
    fontSize: 12,
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  shortcutBadgeLight: {
    backgroundColor: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shortcutBadgeLightText: {
    color: StudioColors.lime,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  bottomPanel: {
    marginTop: 12,
    backgroundColor: StudioColors.codeBg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111111",
    flex: 1,
    overflow: "hidden",
    ...HardShadow,
  },
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: StudioColors.codeSurface,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.codeBorder,
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
  activeBottomTab: {
    borderBottomWidth: 3,
    borderBottomColor: StudioColors.lime,
  },
  bottomTabText: {
    color: StudioColors.codeMuted,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  activeBottomTabText: { color: StudioColors.codeText },
  clearConsoleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#2E2E2A",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  clearConsoleText: {
    color: StudioColors.codeText,
    fontSize: 9,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  bottomContent: { padding: 14, flex: 1 },
  emptyConsoleBox: {
    paddingVertical: 12,
    gap: 4,
  },
  emptyConsoleTitle: {
    color: StudioColors.lime,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  emptyConsoleHint: {
    color: StudioColors.codeMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  testSummaryBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  testSummarySuccess: {
    backgroundColor: "rgba(184, 255, 59, 0.12)",
    borderColor: StudioColors.lime,
  },
  testSummaryWarn: {
    backgroundColor: "rgba(255, 222, 89, 0.14)",
    borderColor: StudioColors.yellow,
  },
  testSummaryText: {
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  terminalText: {
    fontFamily: MonoFont,
    color: StudioColors.lime,
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
    backgroundColor: StudioColors.codeSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: StudioColors.codeBorder,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  activeTestPill: {
    backgroundColor: "#2E2E2A",
    borderColor: StudioColors.lime,
  },
  testPillText: {
    color: StudioColors.codeMuted,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  activeTestPillText: { color: StudioColors.codeText },
  testDetails: { gap: 6 },
  comparisonRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  testHeader: {
    color: StudioColors.codeMuted,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  testDataBox: {
    backgroundColor: StudioColors.codeSurface,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: StudioColors.codeBorder,
  },
  testDataSuccess: {
    backgroundColor: "rgba(184, 255, 59, 0.12)",
    borderColor: StudioColors.lime,
  },
  testDataFail: {
    backgroundColor: "rgba(255, 107, 107, 0.14)",
    borderColor: StudioColors.coral,
  },
  testDataText: {
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 12,
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
