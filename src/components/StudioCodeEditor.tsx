import React, { useRef, useState } from "react";
import {
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
import { renderHighlightedPython } from "./FormattedText";

interface StudioCodeEditorProps {
  selectedLesson: Lesson;
  code: string;
  onChangeCode: (nextCode: string, lessonObj?: Lesson | null) => void;
  hasSavedDraft: boolean;
  guidedCode?: string;
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

export default function StudioCodeEditor({
  selectedLesson,
  code,
  onChangeCode,
  hasSavedDraft,
  guidedCode,
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
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const lineCount = Math.max((code || "").split("\n").length, 8);

  function insertSymbol(symbol: string) {
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
    selectionRef.current = { start: nextPos, end: nextPos };
    onChangeCode(nextCode);
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

  return (
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
                <Text style={styles.savedDraftPillText}>SAVED DRAFT</Text>
              </View>
            )}
          </View>
          <View style={styles.ideHeaderActions}>
            {guidedCode && (
              <Pressable
                style={styles.ideGuidedBtn}
                onPress={() => {
                  onChangeCode(guidedCode, selectedLesson);
                }}
              >
                <Text style={styles.ideGuidedBtnText}>🧩 GUIDED TEMPLATE</Text>
              </Pressable>
            )}
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
                onChangeCode(
                  (selectedLesson.initial_code || "").replace(/\\n/g, "\n"),
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
              style={[styles.codeEditor, { minHeight: lineCount * 21 + 32 }]}
              value={code}
              onChangeText={(nextText) => onChangeCode(nextText)}
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
                    onRunPythonCode();
                  } else {
                    onRunPlaygroundOnly();
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
            {pyodideReady ? "● READY · ⌘↵ RUN" : "○ INITIALIZING"}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryRunBtn,
            isExecuting && styles.disabledButton,
            pressed && {
              transform: [{ translateX: 1 }, { translateY: 1 }],
            },
          ]}
          onPress={onRunPlaygroundOnly}
          disabled={isExecuting}
        >
          <Text style={styles.secondaryRunBtnText}>▶ TEST RUN</Text>
          <View style={styles.shortcutBadgeDark}>
            <Text style={styles.shortcutBadgeDarkText}>⌘↵</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.runButton,
            isExecuting && styles.disabledButton,
            pressed && {
              transform: [{ translateX: 2 }, { translateY: 2 }],
            },
          ]}
          onPress={onRunPythonCode}
          disabled={isExecuting}
        >
          <Text style={styles.runButtonText}>
            {isExecuting ? "CHECKING CODE..." : "SUBMIT CODE (+50 XP)"}
          </Text>
          {!isExecuting && (
            <View style={styles.shortcutBadgeLight}>
              <Text style={styles.shortcutBadgeLightText}>→ ⇧⌘↵</Text>
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
            <Pressable style={styles.clearConsoleBtn} onPress={onClearOutput}>
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
                      selectedTestIndex === idx && styles.activeTestPill,
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
                      <Text style={styles.testHeader}>YOUR OUTPUT</Text>
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
    editorPanel: { flex: 1.15, overflow: "hidden" },
    ideFrame: {
      flex: 1.45,
      minHeight: 240,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
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
    ideGuidedBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: StudioColors.violet,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    ideGuidedBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
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
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
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
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      backgroundColor: StudioColors.lime,
      paddingVertical: 13,
      paddingHorizontal: 18,
      borderRadius: 10,
      borderWidth: 2.5,
      borderColor: StudioColors.ink,
      ...HardShadowHero,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
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
      marginTop: 12,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
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
  });
