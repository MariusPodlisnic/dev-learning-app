import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { Lesson, TestCaseResult } from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";
import { renderHighlightedPython } from "./FormattedText";

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

function translatePythonError(rawOutput: string): BeginnerErrorHint | null {
  if (!rawOutput) return null;

  const lineMatch = rawOutput.match(/line\s+(\d+)/i);
  const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : null;

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
  onRunPlaygroundOnly: () => void;
  onRunPythonCode: () => void;
  bottomTab: "console" | "tests";
  onChangeBottomTab: (tab: "console" | "tests") => void;
  output: string;
  onClearOutput: () => void;
  testResults: TestCaseResult[] | null;
  selectedTestIndex: number;
  onSelectTestIndex: (idx: number) => void;
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
  onRunPlaygroundOnly,
  onRunPythonCode,
  bottomTab,
  onChangeBottomTab,
  output,
  onClearOutput,
  testResults,
  selectedTestIndex,
  onSelectTestIndex,
}: StudioCodeEditorProps) {
  const styles = getStyles();
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [consoleExpanded, setConsoleExpanded] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [hoveredTestIdx, setHoveredTestIdx] = useState<number | null>(null);
  const inputRef = useRef<any>(null);
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

  const totalLines = (code || "").split("\n").length;
  const lineCount = Math.max(totalLines, 8);
  const safeCursor = Math.min(Math.max(0, cursorPos), (code || "").length);
  const linesBeforeCursor = (code || "").slice(0, safeCursor).split("\n");
  const activeLine = linesBeforeCursor.length;
  const activeCol = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
  const allChecksPassed = Boolean(
    testResults && testResults.length > 0 && testResults.every((t) => t.passed),
  );

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
                onPress={() => insertSymbol(item.val)}
              >
                <Text style={styles.symbolText}>{item.label}</Text>
              </Pressable>
            );
          })}
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
            {Array.from({ length: lineCount }).map((_, i) => {
              const isCurrent = i + 1 === activeLine;
              return (
                <Text
                  key={i}
                  style={[
                    styles.lineNumberText,
                    isCurrent && styles.lineNumberTextActive,
                  ]}
                >
                  {i + 1}
                </Text>
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

                // Tab key -> insert 4 spaces instead of blurring
                if (nativeEv.key === "Tab") {
                  e.preventDefault?.();
                  insertSymbol("    ");
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

                // Enter key -> preserve indent and auto-indent +4 spaces after ':'
                if (
                  nativeEv.key === "Enter" &&
                  !nativeEv.shiftKey &&
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
                  const beforeCursor = code.slice(0, start);
                  const lastNewlineIdx = beforeCursor.lastIndexOf("\n");
                  const currentLine = beforeCursor.slice(lastNewlineIdx + 1);
                  const leadingSpaces =
                    currentLine.match(/^[ ]*/)?.[0] || "";
                  const endsWithColon = currentLine.trimEnd().endsWith(":");

                  if (leadingSpaces.length > 0 || endsWithColon) {
                    e.preventDefault?.();
                    const nextIndent =
                      leadingSpaces + (endsWithColon ? "    " : "");
                    const insertion = "\n" + nextIndent;
                    const nextCode =
                      code.slice(0, start) + insertion + code.slice(end);
                    const nextPos = start + insertion.length;
                    onChangeCode(nextCode);
                    setCursorAt(nextPos);
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
            LN {activeLine} · COL {activeCol} · {totalLines} LINES
          </Text>
          <View style={styles.ideStatusWrap}>
            {pyodideReady && (
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
                  : pyodideReady && { color: StudioColors.lime },
              ]}
            >
              {isExecuting
                ? "RUNNING..."
                : pyodideReady
                  ? "READY · ⌘↵"
                  : "INITIALIZING"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <HoverLiftButton
          disabled={isExecuting}
          onPress={onRunPlaygroundOnly}
          style={(hovered) => [
            styles.secondaryRunBtn,
            hovered && styles.secondaryRunBtnHovered,
            isExecuting && styles.disabledButton,
          ]}
        >
          <Text style={styles.secondaryRunBtnText}>▶ TEST RUN</Text>
          <View style={styles.shortcutBadgeDark}>
            <Text style={styles.shortcutBadgeDarkText}>⌘↵</Text>
          </View>
        </HoverLiftButton>

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
          {!isExecuting && (
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
                {testResults
                  ? `[${testResults.filter((t) => t.passed).length}/${testResults.length}${allChecksPassed ? " ✓" : ""}]`
                  : ""}
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomRightActions}>
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

        <ScrollView style={styles.bottomContent}>
          {bottomTab === "console" ? (
            output ? (
              <View style={styles.consoleOutputWrap}>
                {(() => {
                  const beginnerHint = translatePythonError(output);
                  if (!beginnerHint) return null;
                  return (
                    <View style={styles.byteCatErrorCard}>
                      <View style={styles.byteCatErrorHeader}>
                        <View style={styles.byteCatErrorBadge}>
                          <Text style={styles.byteCatErrorBadgeText}>
                            🐾 BYTE-CAT DEBUG HELPER · {beginnerHint.badge}
                          </Text>
                        </View>
                        {beginnerHint.lineNumber !== null && (
                          <Pressable
                            style={styles.byteCatLinePill}
                            onPress={() =>
                              jumpToLine(beginnerHint.lineNumber!)
                            }
                          >
                            <Text style={styles.byteCatLinePillText}>
                              JUMP TO LINE {beginnerHint.lineNumber} →
                            </Text>
                          </Pressable>
                        )}
                      </View>
                      <Text style={styles.byteCatErrorWhat}>
                        {beginnerHint.whatHappened}
                      </Text>
                      <View style={styles.byteCatFixRow}>
                        <Text style={styles.byteCatFixLabel}>💡 HOW TO FIX:</Text>
                        <Text style={styles.byteCatFixText}>
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
          ) : testResults ? (
            <View>
              <View
                style={[
                  styles.testSummaryBanner,
                  allChecksPassed
                    ? styles.testSummarySuccess
                    : styles.testSummaryWarn,
                ]}
              >
                <Text
                  style={[
                    styles.testSummaryText,
                    allChecksPassed
                      ? { color: StudioColors.lime }
                      : { color: StudioColors.yellow },
                  ]}
                >
                  {allChecksPassed
                    ? `✓ ALL ${testResults.length} MISSION CHECKS PASSED!`
                    : `→ ${testResults.filter((t) => t.passed).length} OF ${testResults.length} CHECKS PASSED — INSPECT BELOW`}
                </Text>
              </View>

              <View style={styles.testCasePills}>
                {testResults.map((tr, idx) => (
                  <Pressable
                    key={idx}
                    onHoverIn={() => setHoveredTestIdx(idx)}
                    onHoverOut={() =>
                      setHoveredTestIdx((prev) => (prev === idx ? null : prev))
                    }
                    style={[
                      styles.testPill,
                      selectedTestIndex === idx && styles.activeTestPill,
                      hoveredTestIdx === idx &&
                        selectedTestIndex !== idx &&
                        styles.testPillHovered,
                    ]}
                    onPress={() => onSelectTestIndex(idx)}
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
                        selectedTestIndex === idx && styles.activeTestPillText,
                      ]}
                    >
                      CHECK 0{tr.id}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {testResults[selectedTestIndex] && (
                <View style={styles.testDetails}>
                  <Text style={styles.testHeader}>REQUIREMENT CHECKED</Text>
                  <View style={styles.testDataBox}>
                    <Text style={styles.testDataText}>
                      {testResults[selectedTestIndex].input}
                    </Text>
                  </View>

                  <View style={styles.comparisonRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.testHeader}>EXPECTED OUTPUT</Text>
                      <View style={styles.testDataBox}>
                        <Text style={styles.testDataText}>
                          {testResults[selectedTestIndex].expected}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.testHeader,
                          testResults[selectedTestIndex].passed
                            ? { color: StudioColors.lime }
                            : { color: StudioColors.coral },
                        ]}
                      >
                        {testResults[selectedTestIndex].passed
                          ? "YOUR OUTPUT · MATCH ✓"
                          : "YOUR OUTPUT · MISMATCH"}
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
                Click &quot;SUBMIT CODE (+50 XP)&quot; above to validate your
                code against every mission check.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    editorPanel: { flex: 1.25, overflow: "hidden" },
    ideFrame: {
      flex: 1.6,
      minHeight: 250,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
      ...HardShadow,
    },
    ideFrameSolved: {
      borderColor: StudioColors.mint,
    },
    ideHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 8,
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
      borderWidth: 1,
      borderColor: "transparent",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    resetBtnConfirm: {
      backgroundColor: StudioColors.coral,
      borderColor: StudioColors.ink,
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
      paddingHorizontal: 12,
      paddingVertical: 6,
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
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#3A3A35",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    symbolChipHover: {
      backgroundColor: "#33332E",
      borderColor: StudioColors.yellow,
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
    lineNumberTextActive: {
      color: StudioColors.lime,
      fontWeight: "900",
    },
    editorCodeWrapper: {
      flex: 1,
      position: "relative",
    },
    activeLineBand: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 21,
      backgroundColor: "rgba(184, 255, 59, 0.055)",
      borderLeftWidth: 2,
      borderLeftColor: "rgba(184, 255, 59, 0.6)",
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
    ideStatusWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    readyPulseDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: StudioColors.lime,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
    },
    secondaryRunBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    secondaryRunBtnHovered: {
      backgroundColor: StudioColors.surfaceElevated,
      borderColor: StudioColors.yellow,
      ...HardShadow,
    },
    secondaryRunBtnText: {
      color: StudioColors.textPrimary,
      fontWeight: "900",
      fontSize: 11,
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    shortcutBadgeDark: {
      backgroundColor: StudioColors.bg,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: StudioColors.border,
    },
    shortcutBadgeDarkText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    runButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      backgroundColor: StudioColors.lime,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 2.5,
      borderColor: StudioColors.ink,
      ...HardShadowHero,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    runButtonHovered: {
      backgroundColor: "#C8FF64",
    },
    disabledButton: { opacity: 0.6 },
    runButtonText: {
      color: StudioColors.ink,
      fontWeight: "900",
      fontSize: 13,
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    shortcutBadgeLight: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
    },
    shortcutBadgeLightText: {
      color: StudioColors.lime,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    bottomPanel: {
      marginTop: 8,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      flex: 1.05,
      minHeight: 165,
      overflow: "hidden",
      ...HardShadow,
    },
    execSweepTrack: {
      height: 2.5,
      width: "100%",
      backgroundColor: "rgba(184, 255, 59, 0.14)",
      overflow: "hidden",
    },
    execSweepBar: {
      width: 160,
      height: "100%",
      backgroundColor: StudioColors.lime,
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
    bottomRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
    targetPreviewPill: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      backgroundColor: StudioColors.codeSurface,
      borderWidth: 1,
      borderColor: StudioColors.codeBorder,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 5,
      maxWidth: "100%",
    },
    targetPreviewLabel: {
      color: StudioColors.yellow,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    targetPreviewValue: {
      color: StudioColors.codeText,
      fontSize: 11,
      fontFamily: MonoFont,
      fontWeight: "700",
      flexShrink: 1,
    },
    terminalCard: {
      backgroundColor: "rgba(184, 255, 59, 0.04)",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(184, 255, 59, 0.25)",
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 6,
    },
    terminalCardError: {
      backgroundColor: "rgba(255, 107, 107, 0.06)",
      borderColor: "rgba(255, 107, 107, 0.4)",
    },
    terminalCardRunning: {
      backgroundColor: "rgba(255, 222, 89, 0.05)",
      borderColor: "rgba(255, 222, 89, 0.35)",
    },
    terminalCardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    terminalStatusPill: {
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    terminalStatusOk: {
      color: StudioColors.lime,
    },
    terminalStatusError: {
      color: StudioColors.coral,
    },
    terminalStatusRunning: {
      color: StudioColors.yellow,
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
    terminalTextError: {
      color: "#FCA5A5",
    },
    terminalTextRunning: {
      color: StudioColors.yellow,
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
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    testPillHovered: {
      backgroundColor: "#262623",
      borderColor: StudioColors.yellow,
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
    consoleOutputWrap: {
      gap: 10,
    },
    byteCatErrorCard: {
      backgroundColor: "#1E2231",
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.yellow,
      padding: 11,
      gap: 6,
    },
    byteCatErrorHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    byteCatErrorBadge: {
      backgroundColor: StudioColors.yellow,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
    },
    byteCatErrorBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    byteCatLinePill: {
      backgroundColor: StudioColors.coral,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    byteCatLinePillText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    byteCatErrorWhat: {
      color: "#F8FAFC",
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 17,
    },
    byteCatFixRow: {
      backgroundColor: "rgba(163, 230, 53, 0.12)",
      borderRadius: 7,
      borderWidth: 1,
      borderColor: "rgba(163, 230, 53, 0.4)",
      paddingHorizontal: 9,
      paddingVertical: 6,
      gap: 2,
    },
    byteCatFixLabel: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    byteCatFixText: {
      color: "#E2E8F0",
      fontSize: 11.5,
      fontWeight: "600",
      lineHeight: 16,
    },
  });
