import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Text } from "./StudioIcon";
import {
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { Lesson, TestCaseResult } from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";
import {
  formatPomodoroClock,
  getPomodoroPresetMeta,
  getPomodoroState,
  type PomodoroState,
  subscribePomodoro,
  togglePomodoro,
} from "../utils/pomodoroTimer";
import {
  classifyTypingKey,
  cycleTypingSoundProfile,
  getTypingSoundProfile,
  getTypingSoundProfileMeta,
  hydrateTypingSoundProfile,
  playMechanicalKeystroke,
  subscribeTypingSound,
  type TypingSoundProfile,
} from "../utils/typingSounds";
import { getPythonRuntimeStatus } from "../utils/pyodideRunner";
import { computeCharacterDiffSpotlight } from "../utils/studioMicroMoments";
import {
  computeSmartEnter,
  diagnoseFailedTest,
  EditorSelectionResult,
  extractErrorLineNumber,
  indentSelection,
  toggleLineComment,
} from "../utils/editorHelpers";
import { findUnfilledScaffoldLines } from "../utils/scaffolding";
import { renderHighlightedPython } from "./FormattedText";
import { getStudioCodeEditorStyles } from "./studioCodeEditorStyles";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

const AUTO_PAIR_MAP: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
};

const CLOSING_CHARS = new Set([")", "]", "}", '"', "'"]);

interface BeginnerErrorHint {
  badge: string;
  lineNumber: number | null;
  whatHappened: string;
  howToFix: string;
}

function translatePythonError(
  rawOutput: string,
  maxLines?: number,
): BeginnerErrorHint | null {
  if (!rawOutput) return null;

  const lineNumber = extractErrorLineNumber(rawOutput, maxLines);

  if (rawOutput.includes("IndentationError")) {
    return {
      badge: "INDENTATION FIX",
      lineNumber,
      whatHappened:
        "Python expects code inside a block (after a colon ':') to be indented by 4 spaces.",
      howToFix:
        "Add 4 spaces (or tap '⇥ Tab') at the start of the line right below your 'def', 'if', 'else', or 'for' line.",
    };
  }

  if (rawOutput.includes("SyntaxError")) {
    return {
      badge: "SYNTAX TYPO",
      lineNumber,
      whatHappened:
        "Python spotted a punctuation typo and couldn't read this line.",
      howToFix:
        "Check for a missing colon ':' at the end of 'def/if/else/for', unclosed quotes \" \", or using single '=' instead of '==' inside an 'if' check.",
    };
  }

  if (rawOutput.includes("NameError")) {
    const nameMatch = rawOutput.match(/name\s+'([^']+)'\s+is not defined/i);
    const unknownName = nameMatch ? nameMatch[1] : "that name";
    if (unknownName === "___") {
      return {
        badge: "FILL IN ___ BLANKS",
        lineNumber,
        whatHappened:
          "You left a Guided Scaffolding `___` blank placeholder in your Python code.",
        howToFix:
          "Replace `___` on that line with your real Python variable, condition, or return expression.",
      };
    }
    return {
      badge: `UNKNOWN NAME '${unknownName}'`,
      lineNumber,
      whatHappened: `Python doesn't recognize '${unknownName}' as a variable or function.`,
      howToFix:
        unknownName === "true" || unknownName === "false"
          ? "In Python, booleans must start with a capital letter: write True or False."
          : `Check the spelling of '${unknownName}', or wrap it in quotes ("${unknownName}") if you meant it as text!`,
    };
  }

  if (rawOutput.includes("TypeError")) {
    return {
      badge: "DATA TYPE MISMATCH",
      lineNumber,
      whatHappened:
        "You combined two incompatible data types (like adding text to a number) or passed the wrong number of arguments.",
      howToFix:
        "Make sure numbers aren't wrapped in quotes when doing math, and check that functions like len() or round() receive the right inputs.",
    };
  }

  if (rawOutput.includes("KeyError")) {
    return {
      badge: "MISSING DICTIONARY KEY",
      lineNumber,
      whatHappened:
        "Your code looked up a key in a dictionary Using [ ], but that key wasn't found.",
      howToFix:
        "Use dict.get(key, default) so Python returns a safe fallback value when a key is missing!",
    };
  }

  if (rawOutput.includes("IndexError")) {
    return {
      badge: "INDEX OUT OF RANGE",
      lineNumber,
      whatHappened:
        "Your code tried to read an index position past the end of the list.",
      howToFix:
        "Remember that Python lists start counting at index 0 (a 3-item list only has indices 0, 1, and 2).",
    };
  }

  if (rawOutput.includes("AttributeError")) {
    return {
      badge: "METHOD NAME CHECK",
      lineNumber,
      whatHappened:
        "That dot-method doesn't exist on this type of value.",
      howToFix:
        "Double-check the spelling (e.g., .startswith() has an 's' in the middle, and .join() is called on the separator string like \"-\".join(words)).",
    };
  }

  if (rawOutput.includes("ZeroDivisionError")) {
    return {
      badge: "DIVISION BY ZERO",
      lineNumber,
      whatHappened: "Your code divided a number by 0, which isn't allowed in math!",
      howToFix:
        "Wrap the division inside a 'try: ... except ZeroDivisionError:' block or check if the denominator is 0 first.",
    };
  }

  if (rawOutput.includes("✕ Output mismatch")) {
    return {
      badge: "ALMOST THERE · OUTPUT CHECK",
      lineNumber: null,
      whatHappened:
        "Your code ran without errors, but the printed result didn't match the expected output yet.",
      howToFix:
        "Compare your output below with the Expected Output—check exact spelling, capitalization, and make sure your function returns the result!",
    };
  }

  return null;
}

interface StudioCodeEditorProps {
  selectedLesson: Lesson;
  code: string;
  onChangeCode: (nextCode: string, lessonObj?: Lesson | null) => void;
  hasSavedDraft: boolean;
  pyodideReady: boolean;
  isExecuting: boolean;
  tracedLineNumber?: number | null;
  isTracing?: boolean;
  onTraceCode?: () => void;
  onRunPlaygroundOnly: (customSnippet?: string) => void;
  onRunPythonCode: () => void;
  bottomTab: "console" | "tests";
  onChangeBottomTab: (tab: "console" | "tests") => void;
  output: string;
  onClearOutput: () => void;
  testResults: TestCaseResult[] | null;
  selectedTestIndex: number;
  onSelectTestIndex: (idx: number) => void;
  failedAttemptCount?: number;
  lessonHints?: string[];
  onOpenCodex?: () => void;
  testRunGeneration?: number;
}

const EMPTY_SUBSCRIBE = () => () => {};
const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location?.hostname || "";
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.")
  );
}

function HoverLiftButton({
  flex,
  disabled,
  onPress,
  style,
  children,
}: {
  flex?: number;
  disabled?: boolean;
  onPress: () => void;
  style: (hovered: boolean, pressed: boolean) => any;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [liftAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: pressed ? 1 : hovered && !disabled ? -2.5 : 0,
      friction: 6,
      tension: 190,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [hovered, pressed, disabled, liftAnim]);

  return (
    <Animated.View
      style={[
        flex ? { flex } : null,
        { transform: [{ translateY: liftAnim }] },
      ]}
    >
      <Pressable
        disabled={disabled}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        style={style(hovered, pressed)}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function StudioCodeEditor({
  selectedLesson,
  code,
  onChangeCode,
  hasSavedDraft,
  pyodideReady,
  isExecuting,
  tracedLineNumber = null,
  isTracing = false,
  onTraceCode,
  onRunPlaygroundOnly,
  onRunPythonCode,
  bottomTab,
  onChangeBottomTab,
  output,
  onClearOutput,
  testResults,
  selectedTestIndex,
  onSelectTestIndex,
  failedAttemptCount = 0,
  lessonHints = [],
  onOpenCodex,
  testRunGeneration = 0,
}: StudioCodeEditorProps) {
  const styles = useThemedStyles(getStudioCodeEditorStyles);
  const isMounted = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );
  const showDevTools = isMounted && (IS_DEV_MODE || isLocalDevHost());

  const [simState, setSimState] = useState<{
    genBase: number;
    runId: number;
    results: TestCaseResult[];
    selectedIdx: number;
  } | null>(null);
  const [cascadeState, setCascadeState] = useState<{
    genKey: string;
    revealed: number;
  }>({ genKey: "0:0", revealed: 999 });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [consoleExpanded, setConsoleExpanded] = useState<boolean>(false);
  const [clueOffset, setClueOffset] = useState<number>(0);
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [hoveredTestIdx, setHoveredTestIdx] = useState<number | null>(null);
  const [typingProfile, setTypingProfile] = useState<TypingSoundProfile>(() =>
    getTypingSoundProfile(),
  );
  const [pomodoro, setPomodoro] = useState<PomodoroState>(() =>
    getPomodoroState(),
  );
  const inputRef = useRef<any>(null);

  useEffect(() => {
    void hydrateTypingSoundProfile();
    const unsubTyping = subscribeTypingSound(setTypingProfile);
    const unsubPomo = subscribePomodoro(setPomodoro);
    return () => {
      unsubTyping();
      unsubPomo();
    };
  }, []);
  const activeTypingMeta = getTypingSoundProfileMeta(typingProfile);
  const activePomoMeta = getPomodoroPresetMeta(pomodoro.presetId);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const [readyPulse] = useState(() => new Animated.Value(0));
  const [execSweep] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(readyPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(readyPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [readyPulse]);

  useEffect(() => {
    if (!isExecuting) {
      execSweep.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(execSweep, {
        toValue: 1,
        duration: 950,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [isExecuting, execSweep]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const activeSim =
    simState && simState.genBase === testRunGeneration ? simState : null;
  const effectiveTestResults = activeSim ? activeSim.results : testResults;
  const effectiveSelectedTestIndex = activeSim
    ? activeSim.selectedIdx
    : selectedTestIndex;

  const currentGenKey = `${testRunGeneration}:${activeSim?.runId ?? 0}`;
  const totalChecks = effectiveTestResults?.length ?? 0;
  const effectiveRevealed =
    totalChecks === 0
      ? 0
      : cascadeState.genKey === currentGenKey
        ? Math.min(totalChecks, cascadeState.revealed)
        : 1;
  const isCascading = totalChecks > 1 && effectiveRevealed < totalChecks;

  useEffect(() => {
    if (totalChecks <= 1 || effectiveRevealed >= totalChecks) return;
    const timer = setInterval(() => {
      setCascadeState((prev) => {
        const base = prev.genKey === currentGenKey ? prev.revealed : 1;
        const nextRev = Math.min(totalChecks, base + 1);
        if (nextRev > base) {
          playKeyClick();
        }
        return { genKey: currentGenKey, revealed: nextRev };
      });
    }, 135);
    return () => clearInterval(timer);
  }, [currentGenKey, totalChecks, effectiveRevealed]);

  function handleSelectEffectiveTest(idx: number) {
    if (activeSim) {
      setSimState((prev) => (prev ? { ...prev, selectedIdx: idx } : null));
    } else {
      onSelectTestIndex(idx);
    }
  }

  function triggerDevSimulatePass() {
    playKeyClick();
    onChangeBottomTab("tests");
    setSimState((prev) => ({
      genBase: testRunGeneration,
      runId: (prev?.runId ?? 0) + 1,
      selectedIdx: 0,
      results: [
        { id: 1, input: "solve([2, 4, 6])", expected: "[4, 8, 12]", actual: "[4, 8, 12]", passed: true },
        { id: 2, input: "solve([])", expected: "[]", actual: "[]", passed: true },
        { id: 3, input: "solve([-1, 0, 5])", expected: "[-2, 0, 10]", actual: "[-2, 0, 10]", passed: true },
        { id: 4, input: "solve([100])", expected: "[200]", actual: "[200]", passed: true },
      ],
    }));
  }

  function triggerDevSimulateDiff() {
    playKeyClick();
    onChangeBottomTab("tests");
    setSimState((prev) => ({
      genBase: testRunGeneration,
      runId: (prev?.runId ?? 0) + 1,
      selectedIdx: 2,
      results: [
        { id: 1, input: "rank([10, 20])", expected: "[10, 20]", actual: "[10, 20]", passed: true },
        { id: 2, input: "rank([5])", expected: "[5]", actual: "[5]", passed: true },
        {
          id: 3,
          input: "rank([10, 20, 99, 40])",
          expected: "[10, 20, 99, 40]",
          actual: "[10, 20, 30, 40]",
          passed: false,
        },
      ],
    }));
  }

  const totalLines = (code || "").split("\n").length;
  const lineCount = Math.max(totalLines, 11);
  const unfilledScaffoldLines = findUnfilledScaffoldLines(code || "");
  const safeCursor = Math.min(Math.max(0, cursorPos), (code || "").length);
  const linesBeforeCursor = (code || "").slice(0, safeCursor).split("\n");
  const activeLine = linesBeforeCursor.length;
  const activeCol = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
  const allChecksPassed = Boolean(
    effectiveTestResults &&
      effectiveTestResults.length > 0 &&
      effectiveTestResults.every((t) => t.passed),
  );
  const hasOutputError =
    Boolean(output) &&
    !output.startsWith("Running code") &&
    !output.startsWith("Running verification") &&
    /(Error|Traceback|Exception|✕)/i.test(output);
  const errorLineNumber = hasOutputError
    ? extractErrorLineNumber(output, totalLines)
    : null;
  const activeClueHints =
    lessonHints.length > 0 ? lessonHints : selectedLesson.hints || [];
  const shouldShowStuckClue =
    failedAttemptCount >= 2 &&
    !allChecksPassed &&
    activeClueHints.length > 0;
  const activeClueIndex = shouldShowStuckClue
    ? (Math.max(0, failedAttemptCount - 2) + clueOffset) %
      activeClueHints.length
    : 0;
  const activeStuckClue = shouldShowStuckClue
    ? activeClueHints[activeClueIndex]
    : null;

  function applySelectionResult(result: EditorSelectionResult) {
    selectionRef.current = {
      start: result.selectionStart,
      end: result.selectionEnd,
    };
    setCursorPos(result.selectionStart);
    onChangeCode(result.code);
    if (Platform.OS === "web") {
      setTimeout(() => {
        try {
          const el = inputRef.current;
          if (el && typeof el.setSelectionRange === "function") {
            el.focus();
            el.setSelectionRange(result.selectionStart, result.selectionEnd);
          }
        } catch {}
      }, 0);
    }
  }

  function handleToggleComment() {
    playKeyClick();
    const { start, end } = selectionRef.current;
    applySelectionResult(toggleLineComment(code || "", start, end));
  }

  function handleIndent(direction: "indent" | "outdent") {
    playKeyClick();
    const { start, end } = selectionRef.current;
    applySelectionResult(indentSelection(code || "", start, end, direction));
  }

  function setCursorAt(pos: number) {
    selectionRef.current = { start: pos, end: pos };
    setCursorPos(pos);
    if (Platform.OS === "web") {
      setTimeout(() => {
        try {
          const el = inputRef.current;
          if (el && typeof el.setSelectionRange === "function") {
            el.focus();
            el.setSelectionRange(pos, pos);
          }
        } catch {}
      }, 0);
    }
  }

  function insertSymbol(symbol: string) {
    playKeyClick();
    const start = Math.min(
      Math.max(0, selectionRef.current.start),
      code.length,
    );
    const end = Math.min(Math.max(start, selectionRef.current.end), code.length);
    const nextCode = code.slice(0, start) + symbol + code.slice(end);
    const cursorOffset =
      symbol === "print()" ||
      symbol === '""' ||
      symbol === 'f""' ||
      symbol === "[]"
        ? symbol.length - 1
        : symbol.length;
    const nextPos = start + cursorOffset;
    onChangeCode(nextCode);
    setCursorAt(nextPos);
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
      playKeyClick();
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(false);
    }
  }

  async function handleCopyOutput() {
    if (!output) return;
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(output);
      }
      playKeyClick();
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 1800);
    } catch {
      setCopiedOutput(false);
    }
  }

  function jumpToLine(lineNum: number) {
    const lines = (code || "").split("\n");
    const clampedLine = Math.min(Math.max(1, lineNum), lines.length);
    let offset = 0;
    for (let i = 0; i < clampedLine - 1; i++) {
      offset += lines[i].length + 1;
    }
    playKeyClick();
    setCursorAt(offset);
  }

  function handleResetPress() {
    playKeyClick();
    if (!confirmReset) {
      setConfirmReset(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setConfirmReset(false);
      }, 2400);
      return;
    }
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setConfirmReset(false);
    const freshCode = (selectedLesson.initial_code || "").replace(/\\n/g, "\n");
    onChangeCode(freshCode, selectedLesson);
    setCursorAt(0);
  }

  const readyDotScale = readyPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.25],
  });
  const readyDotOpacity = readyPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  const sweepTranslateX = execSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 420],
  });

  return (
    <View style={styles.editorPanel}>
      <View
        style={[
          styles.ideFrame,
          allChecksPassed && styles.ideFrameSolved,
          consoleExpanded && { flex: 0.9, minHeight: 170 },
        ]}
      >
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
                <Text style={styles.savedDraftPillText}>DRAFT SAVED</Text>
              </View>
            )}
            {unfilledScaffoldLines.length > 0 && (
              <Pressable
                style={styles.scaffoldStatusPill}
                onPress={() => jumpToLine(unfilledScaffoldLines[0])}
              >
                <Text style={styles.scaffoldStatusPillText}>
                  🧩 {unfilledScaffoldLines.length}{" "}
                  {unfilledScaffoldLines.length === 1 ? "BLANK" : "BLANKS"} →
                </Text>
              </Pressable>
            )}
          </View>
          <View style={styles.ideHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                pomodoro.isRunning
                  ? `Pause ${activePomoMeta.label} timer`
                  : `Start ${activePomoMeta.label} timer`
              }
              style={[
                styles.copyCodeBtn,
                pomodoro.isRunning && [
                  styles.copyCodeBtnSuccess,
                  { borderColor: activePomoMeta.accent },
                ],
              ]}
              onPress={() => {
                playKeyClick();
                togglePomodoro();
              }}
            >
              <Text
                style={[
                  styles.copyCodeBtnText,
                  pomodoro.isRunning && { color: activePomoMeta.accent },
                ]}
              >
                {pomodoro.isRunning
                  ? `❚❚ ${formatPomodoroClock(pomodoro.remainingSeconds)}`
                  : `⏱️ ${formatPomodoroClock(pomodoro.remainingSeconds)}`}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Switch keyboard typing sound (currently ${activeTypingMeta.label})`}
              style={[
                styles.copyCodeBtn,
                typingProfile !== "off" && styles.copyCodeBtnSuccess,
              ]}
              onPress={() => {
                cycleTypingSoundProfile();
              }}
            >
              <Text
                style={[
                  styles.copyCodeBtnText,
                  typingProfile !== "off" && { color: StudioColors.lime },
                ]}
              >
                {activeTypingMeta.chipLabel}
              </Text>
            </Pressable>
            {onOpenCodex ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Constellation Field Guide Codex"
                style={styles.copyCodeBtn}
                onPress={() => {
                  playKeyClick();
                  onOpenCodex();
                }}
              >
                <Text style={styles.copyCodeBtnText}>✦ CODEX</Text>
              </Pressable>
            ) : null}
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
              style={[
                styles.resetBtn,
                confirmReset && styles.resetBtnConfirm,
              ]}
              onPress={handleResetPress}
            >
              <Text
                style={[
                  styles.resetBtnText,
                  confirmReset && { color: StudioColors.ink },
                ]}
              >
                {confirmReset ? "SURE?" : "RESET"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.symbolBar}>
          <Text style={styles.quickInsertLabel}>INSERT</Text>
          {[
            { label: "⇥ Tab", val: "    " },
            { label: "⇤ Outdent", action: "outdent" as const },
            { label: "# Comment", action: "comment" as const },
            { label: "print()", val: "print()" },
            { label: '""', val: '""' },
            { label: 'f""', val: 'f""' },
            { label: "[]", val: "[]" },
            { label: ":", val: ":" },
            { label: "=", val: " = " },
            { label: "return", val: "return " },
          ].map((item) => {
            const isChipHovered = hoveredChip === item.label;
            return (
              <Pressable
                key={item.label}
                onHoverIn={() => setHoveredChip(item.label)}
                onHoverOut={() =>
                  setHoveredChip((prev) => (prev === item.label ? null : prev))
                }
                style={({ pressed }) => [
                  styles.symbolChip,
                  isChipHovered && styles.symbolChipHover,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playMechanicalKeystroke("char");
                  if (item.action === "outdent") {
                    handleIndent("outdent");
                  } else if (item.action === "comment") {
                    handleToggleComment();
                  } else if (item.val !== undefined) {
                    insertSymbol(item.val);
                  }
                }}
              >
                <Text style={styles.symbolText}>{item.label}</Text>
              </Pressable>
            );
          })}
          {Platform.OS !== "web" && (
            <Pressable
              onPress={() => {
                playKeyClick();
                Keyboard.dismiss();
              }}
              style={styles.symbolChip}
            >
              <Text style={styles.symbolText}>⌨️ DONE</Text>
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.editorScroll,
            styles.editorBody,
            { minHeight: lineCount * 21 + 32 },
          ]}
        >
          <View style={styles.lineNumbers}>
            {Array.from({ length: lineCount }).map((_, i) => {
              const lineNum = i + 1;
              const isCurrent = lineNum === activeLine;
              const isErrorLine = errorLineNumber === lineNum;
              const isTraced = tracedLineNumber === lineNum;
              return (
                <Pressable
                  key={i}
                  onPress={() => jumpToLine(lineNum)}
                  style={styles.lineNumberRow}
                >
                  {isTraced && <Text style={styles.lineTraceArrow}>▶</Text>}
                  {isErrorLine && <Text style={styles.lineErrorDot}>!</Text>}
                  <Text
                    style={[
                      styles.lineNumberText,
                      isCurrent && styles.lineNumberTextActive,
                      isTraced && styles.lineNumberTextTraced,
                      isErrorLine && styles.lineNumberTextError,
                    ]}
                  >
                    {lineNum}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View
            style={[
              styles.editorCodeWrapper,
              { minHeight: lineCount * 21 + 32 },
            ]}
          >
            {/* Subtle Active-Line Highlight Band */}
            <View
              pointerEvents="none"
              style={[
                styles.activeLineBand,
                { top: 16 + (activeLine - 1) * 21 },
              ]}
            />
            {tracedLineNumber !== null &&
              tracedLineNumber >= 1 &&
              tracedLineNumber <= lineCount && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.traceLineBand,
                    { top: 16 + (tracedLineNumber - 1) * 21 },
                  ]}
                />
              )}
            {errorLineNumber !== null && errorLineNumber <= lineCount && (
              <View
                pointerEvents="none"
                style={[
                  styles.errorLineBand,
                  { top: 16 + (errorLineNumber - 1) * 21 },
                ]}
              />
            )}
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
              ref={inputRef}
              style={[styles.codeEditor, { minHeight: lineCount * 21 + 32 }]}
              value={code}
              onChangeText={(nextText) => onChangeCode(nextText)}
              onSelectionChange={(e) => {
                const sel = e.nativeEvent.selection;
                selectionRef.current = sel;
                setCursorPos(sel.start);
              }}
              onKeyPress={(e: any) => {
                const nativeEv = e?.nativeEvent;
                if (!nativeEv) return;

                if (
                  !nativeEv.metaKey &&
                  !nativeEv.ctrlKey &&
                  !nativeEv.altKey
                ) {
                  const keyKind = classifyTypingKey(nativeEv.key);
                  if (keyKind) {
                    playMechanicalKeystroke(keyKind);
                  }
                }

                if (
                  nativeEv.key === "Enter" &&
                  (nativeEv.metaKey || nativeEv.ctrlKey)
                ) {
                  e.preventDefault?.();
                  if (nativeEv.shiftKey) {
                    onRunPythonCode();
                  } else {
                    onRunPlaygroundOnly();
                  }
                  return;
                }

                if (
                  nativeEv.key === "/" &&
                  (nativeEv.metaKey || nativeEv.ctrlKey)
                ) {
                  e.preventDefault?.();
                  handleToggleComment();
                  return;
                }

                // Tab / Shift+Tab -> indent or outdent selected lines by 4 spaces
                if (nativeEv.key === "Tab") {
                  e.preventDefault?.();
                  handleIndent(nativeEv.shiftKey ? "outdent" : "indent");
                  return;
                }

                // Smart auto-closing pairs, closing-char skip, & pair backspace on Web
                if (
                  Platform.OS === "web" &&
                  !nativeEv.metaKey &&
                  !nativeEv.ctrlKey &&
                  !nativeEv.altKey
                ) {
                  const start = Math.min(
                    Math.max(0, selectionRef.current.start),
                    code.length,
                  );
                  const end = Math.min(
                    Math.max(start, selectionRef.current.end),
                    code.length,
                  );

                  if (
                    start === end &&
                    CLOSING_CHARS.has(nativeEv.key) &&
                    code[start] === nativeEv.key
                  ) {
                    e.preventDefault?.();
                    setCursorAt(start + 1);
                    return;
                  }

                  if (start === end && AUTO_PAIR_MAP[nativeEv.key]) {
                    e.preventDefault?.();
                    const pair = nativeEv.key + AUTO_PAIR_MAP[nativeEv.key];
                    const nextCode =
                      code.slice(0, start) + pair + code.slice(end);
                    onChangeCode(nextCode);
                    setCursorAt(start + 1);
                    return;
                  }

                  if (
                    nativeEv.key === "Backspace" &&
                    start === end &&
                    start > 0 &&
                    AUTO_PAIR_MAP[code[start - 1]] === code[start]
                  ) {
                    e.preventDefault?.();
                    const nextCode =
                      code.slice(0, start - 1) + code.slice(start + 1);
                    onChangeCode(nextCode);
                    setCursorAt(start - 1);
                    return;
                  }
                }

                // Enter key -> preserve indent and auto-indent +4 spaces after ':' (even with trailing comments)
                if (
                  nativeEv.key === "Enter" &&
                  !nativeEv.shiftKey &&
                  !nativeEv.altKey
                ) {
                  const smartEnter = computeSmartEnter(
                    code,
                    selectionRef.current.start,
                    selectionRef.current.end,
                  );
                  if (smartEnter.handled) {
                    e.preventDefault?.();
                    onChangeCode(smartEnter.code);
                    setCursorAt(smartEnter.cursorPos);
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
        </View>

        <View style={styles.ideFooter}>
          <Text style={styles.ideFooterText}>
            LN {activeLine} · COL {activeCol} · {totalLines} LINES
          </Text>
          <View style={styles.ideStatusWrap}>
            {getPythonRuntimeStatus(pyodideReady).available && (
              <Animated.View
                style={[
                  styles.readyPulseDot,
                  {
                    opacity: readyDotOpacity,
                    transform: [{ scale: readyDotScale }],
                  },
                ]}
              />
            )}
            <Text
              style={[
                styles.ideFooterText,
                isExecuting
                  ? { color: StudioColors.yellow }
                  : getPythonRuntimeStatus(pyodideReady).available && {
                      color: StudioColors.lime,
                    },
              ]}
            >
              {isExecuting
                ? "RUNNING..."
                : getPythonRuntimeStatus(pyodideReady).editorLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <HoverLiftButton
          disabled={isExecuting}
          onPress={() => onRunPlaygroundOnly()}
          style={(hovered) => [
            styles.secondaryRunBtn,
            hovered && styles.secondaryRunBtnHovered,
            isExecuting && styles.disabledButton,
          ]}
        >
          <Text style={styles.secondaryRunBtnText}>▶ TEST RUN</Text>
          {Platform.OS === "web" && (
            <View style={styles.shortcutBadgeDark}>
              <Text style={styles.shortcutBadgeDarkText}>⌘↵</Text>
            </View>
          )}
        </HoverLiftButton>

        {onTraceCode && (
          <HoverLiftButton
            disabled={isExecuting || isTracing}
            onPress={onTraceCode}
            style={(hovered) => [
              styles.traceRunBtn,
              hovered && styles.traceRunBtnHovered,
              (isExecuting || isTracing) && styles.disabledButton,
            ]}
          >
            <Text style={styles.traceRunBtnText}>
              {isTracing ? "TRACING..." : "🔬 TRACE"}
            </Text>
          </HoverLiftButton>
        )}

        <HoverLiftButton
          flex={1}
          disabled={isExecuting}
          onPress={onRunPythonCode}
          style={(hovered) => [
            styles.runButton,
            hovered && styles.runButtonHovered,
            isExecuting && styles.disabledButton,
          ]}
        >
          <Text style={styles.runButtonText}>
            {isExecuting ? "CHECKING CODE..." : "SUBMIT CODE (+50 XP)"}
          </Text>
          {!isExecuting && Platform.OS === "web" && (
            <View style={styles.shortcutBadgeLight}>
              <Text style={styles.shortcutBadgeLightText}>→ ⇧⌘↵</Text>
            </View>
          )}
        </HoverLiftButton>
      </View>

      <View
        style={[
          styles.bottomPanel,
          consoleExpanded && { flex: 1.9, minHeight: 240 },
        ]}
      >
        {isExecuting && (
          <View style={styles.execSweepTrack}>
            <Animated.View
              style={[
                styles.execSweepBar,
                { transform: [{ translateX: sweepTranslateX }] },
              ]}
            />
          </View>
        )}
        <View style={styles.bottomTabBar}>
          <View style={styles.bottomTabsLeft}>
            <Pressable
              style={[
                styles.bottomTab,
                bottomTab === "console" && styles.activeBottomTab,
              ]}
              onPress={() => onChangeBottomTab("console")}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  bottomTab === "console" && styles.activeBottomTabText,
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
              onPress={() => onChangeBottomTab("tests")}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  bottomTab === "tests" && styles.activeBottomTabText,
                  allChecksPassed && { color: StudioColors.lime },
                ]}
              >
                MISSION CHECKS{" "}
                {effectiveTestResults
                  ? isCascading
                    ? `[${effectiveRevealed}/${effectiveTestResults.length} ⚡]`
                    : `[${effectiveTestResults.filter((t) => t.passed).length}/${effectiveTestResults.length}${allChecksPassed ? " ✓" : ""}]`
                  : ""}
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomRightActions}>
            {showDevTools ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dev simulate passing test cascade"
                  style={styles.clearConsoleBtn}
                  onPress={triggerDevSimulatePass}
                >
                  <Text style={[styles.clearConsoleText, { color: StudioColors.lime }]}>
                    ⚙ CASCADE
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dev simulate character diff spotlight"
                  style={styles.clearConsoleBtn}
                  onPress={triggerDevSimulateDiff}
                >
                  <Text style={[styles.clearConsoleText, { color: StudioColors.coral }]}>
                    ⚙ DIFF
                  </Text>
                </Pressable>
              </>
            ) : null}
            {bottomTab === "console" && output ? (
              <>
                <Pressable
                  style={styles.clearConsoleBtn}
                  onPress={handleCopyOutput}
                >
                  <Text
                    style={[
                      styles.clearConsoleText,
                      copiedOutput && { color: StudioColors.lime },
                    ]}
                  >
                    {copiedOutput ? "✓ COPIED" : "COPY"}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.clearConsoleBtn}
                  onPress={onClearOutput}
                >
                  <Text style={styles.clearConsoleText}>CLEAR</Text>
                </Pressable>
              </>
            ) : null}
            <Pressable
              style={styles.clearConsoleBtn}
              onPress={() => {
                playKeyClick();
                setConsoleExpanded((prev) => !prev);
              }}
            >
              <Text style={styles.clearConsoleText}>
                {consoleExpanded ? "▼ EDITOR SIZE" : "▲ EXPAND CONSOLE"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomContent}>
          {bottomTab === "console" ? (
            output ? (
              <View style={styles.consoleOutputWrap}>
                {(() => {
                  const beginnerHint = translatePythonError(output, totalLines);
                  if (!beginnerHint) return null;
                  return (
                    <View style={styles.debugErrorCard}>
                      <View style={styles.debugErrorHeader}>
                        <View style={styles.debugErrorBadge}>
                          <Text style={styles.debugErrorBadgeText}>
                            💡 STUDIO DEBUG HELPER · {beginnerHint.badge}
                          </Text>
                        </View>
                        {beginnerHint.lineNumber !== null && (
                          <Pressable
                            style={styles.debugLinePill}
                            onPress={() =>
                              jumpToLine(beginnerHint.lineNumber!)
                            }
                          >
                            <Text style={styles.debugLinePillText}>
                              JUMP TO LINE {beginnerHint.lineNumber} →
                            </Text>
                          </Pressable>
                        )}
                      </View>
                      <Text style={styles.debugErrorWhat}>
                        {beginnerHint.whatHappened}
                      </Text>
                      <View style={styles.debugFixRow}>
                        <Text style={styles.debugFixLabel}>💡 HOW TO FIX:</Text>
                        <Text style={styles.debugFixText}>
                          {beginnerHint.howToFix}
                        </Text>
                      </View>
                    </View>
                  );
                })()}
                {(() => {
                  const isRunningMsg =
                    output.startsWith("Running code") ||
                    output.startsWith("Running verification");
                  const isErrorMsg =
                    !isRunningMsg &&
                    /(Error|Traceback|Exception|✕)/i.test(output);
                  return (
                    <View
                      style={[
                        styles.terminalCard,
                        isErrorMsg && styles.terminalCardError,
                        isRunningMsg && styles.terminalCardRunning,
                      ]}
                    >
                      <View style={styles.terminalCardHeader}>
                        <Text
                          style={[
                            styles.terminalStatusPill,
                            isErrorMsg
                              ? styles.terminalStatusError
                              : isRunningMsg
                                ? styles.terminalStatusRunning
                                : styles.terminalStatusOk,
                          ]}
                        >
                          {isErrorMsg
                            ? "✕ ERROR"
                            : isRunningMsg
                              ? "◉ RUNNING"
                              : "› STDOUT"}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.terminalText,
                          isErrorMsg && styles.terminalTextError,
                          isRunningMsg && styles.terminalTextRunning,
                        ]}
                      >
                        {output}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            ) : (
              <View style={styles.emptyConsoleBox}>
                <Text style={styles.emptyConsoleTitle}>
                  &gt;&gt;&gt; READY TO RUN
                </Text>
                <Text style={styles.emptyConsoleHint}>
                  Click &quot;▶ TEST RUN&quot; to preview your print() output, or
                  &quot;SUBMIT CODE (+50 XP)&quot; to grade your solution.
                </Text>
                {selectedLesson.expected_output ? (
                  <View style={styles.targetPreviewPill}>
                    <Text style={styles.targetPreviewLabel}>TARGET</Text>
                    <Text
                      style={styles.targetPreviewValue}
                      numberOfLines={1}
                    >
                      {selectedLesson.expected_output.split("\n")[0]}
                    </Text>
                  </View>
                ) : null}
              </View>
            )
          ) : effectiveTestResults ? (
            <View>
              <View
                style={[
                  styles.testSummaryBanner,
                  allChecksPassed && !isCascading
                    ? styles.testSummarySuccess
                    : styles.testSummaryWarn,
                ]}
              >
                <Text
                  style={[
                    styles.testSummaryText,
                    allChecksPassed && !isCascading
                      ? { color: StudioColors.lime }
                      : { color: StudioColors.yellow },
                  ]}
                >
                  {isCascading
                    ? `⚡ RUNNING MISSION CHECKS (${effectiveRevealed} / ${effectiveTestResults.length})...`
                    : allChecksPassed
                      ? `✓ ALL ${effectiveTestResults.length} MISSION CHECKS PASSED! · VICTORY CASCADE`
                      : `→ ${effectiveTestResults.filter((t) => t.passed).length} OF ${effectiveTestResults.length} CHECKS PASSED — INSPECT BELOW`}
                </Text>
                <View style={styles.cascadeRailTrack}>
                  <View
                    style={[
                      styles.cascadeRailFill,
                      {
                        width: `${Math.round((effectiveRevealed / Math.max(1, effectiveTestResults.length)) * 100)}%`,
                        backgroundColor:
                          allChecksPassed && !isCascading
                            ? StudioColors.lime
                            : isCascading
                              ? StudioColors.yellow
                              : StudioColors.coral,
                      },
                    ]}
                  />
                </View>
              </View>

              {activeStuckClue ? (
                <View style={styles.stuckClueStrip}>
                  <View style={styles.stuckClueLeft}>
                    <Text style={styles.stuckClueBadge}>
                      STUDIO HINT · TRY #{failedAttemptCount}
                    </Text>
                    <Text style={styles.stuckClueText}>{activeStuckClue}</Text>
                  </View>
                  {activeClueHints.length > 1 && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Next studio hint"
                      style={styles.stuckClueNextBtn}
                      onPress={() => {
                        playKeyClick();
                        setClueOffset((prev) => prev + 1);
                      }}
                    >
                      <Text style={styles.stuckClueNextText}>
                        CLUE {activeClueIndex + 1}/{activeClueHints.length} →
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : null}

              <View style={styles.testCasePills}>
                {effectiveTestResults.map((tr, idx) => {
                  const revealed = idx < effectiveRevealed;
                  const isSelected = effectiveSelectedTestIndex === idx;
                  return (
                    <Pressable
                      key={idx}
                      onHoverIn={() => setHoveredTestIdx(idx)}
                      onHoverOut={() =>
                        setHoveredTestIdx((prev) => (prev === idx ? null : prev))
                      }
                      style={[
                        styles.testPill,
                        !revealed && styles.testPillPending,
                        revealed &&
                          (tr.passed
                            ? styles.testPillPassed
                            : styles.testPillFailed),
                        isSelected && styles.activeTestPill,
                        hoveredTestIdx === idx &&
                          !isSelected &&
                          styles.testPillHovered,
                      ]}
                      onPress={() => handleSelectEffectiveTest(idx)}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: MonoFont,
                          fontWeight: "900",
                          color: !revealed
                            ? StudioColors.codeMuted
                            : tr.passed
                              ? StudioColors.lime
                              : StudioColors.coral,
                        }}
                      >
                        {!revealed ? "⋯" : tr.passed ? "✓" : "✕"}
                      </Text>
                      <Text
                        style={[
                          styles.testPillText,
                          isSelected && styles.activeTestPillText,
                        ]}
                      >
                        CHECK 0{tr.id}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {effectiveTestResults[effectiveSelectedTestIndex] && (() => {
                const activeTest =
                  effectiveTestResults[effectiveSelectedTestIndex];
                const spotlight = !activeTest.passed
                  ? computeCharacterDiffSpotlight(
                      activeTest.expected,
                      activeTest.actual,
                    )
                  : null;
                const diagnosis = !activeTest.passed
                  ? diagnoseFailedTest(activeTest, code)
                  : null;
                return (
                  <View style={styles.testDetails}>
                    <Text style={styles.testHeader}>REQUIREMENT CHECKED</Text>
                    <View style={styles.testDataBox}>
                      <Text style={styles.testDataText}>
                        {activeTest.input}
                      </Text>
                    </View>

                    {spotlight && (
                      <>
                        <View style={styles.diffDiagnosisBanner}>
                          <View style={styles.diffReasonBadge}>
                            <Text style={styles.diffReasonBadgeText}>
                              FIRST DIFFERENCE
                            </Text>
                          </View>
                          <Text style={styles.diffReasonDetail}>
                            {spotlight.reason}
                          </Text>
                          <View style={styles.diffCoordsPill}>
                            <Text style={styles.diffCoordsText}>
                              LN {spotlight.lineNumber} · COL{" "}
                              {spotlight.colNumber}
                            </Text>
                          </View>
                          {spotlight.similarityPct > 0 ? (
                            <View style={styles.diffSimilarityPill}>
                              <Text style={styles.diffSimilarityText}>
                                {spotlight.similarityPct}% CLOSE
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.diffSpotlightCard}>
                          <Text style={styles.diffSpotlightMicro}>
                            DIFF SPOTLIGHT:
                          </Text>
                          <View style={styles.diffSpotlightGroup}>
                            <Text style={styles.diffSpotlightMicro}>WANT</Text>
                            <Text style={styles.diffSpotlightTokenExp}>
                              {spotlight.expectedSpotToken}
                            </Text>
                            <Text style={styles.diffSpotlightArrow}>≠</Text>
                            <Text style={styles.diffSpotlightMicro}>GOT</Text>
                            <Text style={styles.diffSpotlightTokenAct}>
                              {spotlight.actualSpotToken}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}

                    {diagnosis && (
                      <View style={styles.conceptDiagnosisBanner}>
                        <View style={styles.conceptDiagnosisBadge}>
                          <Text style={styles.conceptDiagnosisBadgeText}>
                            {diagnosis.badge}
                          </Text>
                        </View>
                        <Text style={styles.conceptDiagnosisText}>
                          {diagnosis.tip}
                        </Text>
                      </View>
                    )}

                    <View style={styles.comparisonRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.testHeader}>EXPECTED OUTPUT</Text>
                        <View style={styles.testDataBox}>
                          {spotlight ? (
                            <Text style={styles.testDataText}>
                              <Text style={styles.diffMatchPrefix}>
                                {spotlight.commonPrefix}
                              </Text>
                              <Text style={styles.diffExpectedMismatch}>
                                {spotlight.hasInvisibleDiff
                                  ? spotlight.expectedSpotToken
                                  : spotlight.expectedMid || "∅"}
                              </Text>
                              <Text style={styles.diffMatchPrefix}>
                                {spotlight.commonSuffix}
                              </Text>
                            </Text>
                          ) : (
                            <Text style={styles.testDataText}>
                              {activeTest.expected}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.testHeader,
                            activeTest.passed
                              ? { color: StudioColors.lime }
                              : { color: StudioColors.coral },
                          ]}
                        >
                          {activeTest.passed
                            ? "YOUR OUTPUT · MATCH ✓"
                            : "YOUR OUTPUT · MISMATCH"}
                        </Text>
                        <View
                          style={[
                            styles.testDataBox,
                            activeTest.passed
                              ? styles.testDataSuccess
                              : styles.testDataFail,
                          ]}
                        >
                          {spotlight ? (
                            <Text style={styles.testDataText}>
                              <Text style={styles.diffMatchPrefix}>
                                {spotlight.commonPrefix}
                              </Text>
                              <Text style={styles.diffActualMismatch}>
                                {spotlight.hasInvisibleDiff
                                  ? spotlight.actualSpotToken
                                  : spotlight.actualMid || "∅"}
                              </Text>
                              <Text style={styles.diffMatchPrefix}>
                                {spotlight.commonSuffix}
                              </Text>
                            </Text>
                          ) : (
                            <Text
                              style={[
                                styles.testDataText,
                                activeTest.passed
                                  ? { color: StudioColors.lime }
                                  : { color: StudioColors.coral },
                              ]}
                            >
                              {activeTest.actual}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>
          ) : (
            <View style={styles.emptyConsoleBox}>
              <Text style={styles.emptyConsoleTitle}>
                NO MISSION CHECKS RUN YET
              </Text>
              <Text style={styles.emptyConsoleHint}>
                Click &quot;SUBMIT CODE (+50 XP)&quot; above to validate your
                code against every mission check.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

