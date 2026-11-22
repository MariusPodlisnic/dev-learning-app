import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { computePythonAutoEdit } from "../utils/editorHelpers";
import {
  deleteScratchpadSnippet,
  readSavedSnippets,
  readScratchpadDraft,
  type SavedScratchpadSnippet,
  saveScratchpadSnippet,
  SCRATCHPAD_TEMPLATES,
  type ScratchpadTemplateId,
  writeScratchpadDraft,
} from "../utils/scratchpadSnippets";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
} from "../utils/soundEffects";
import {
  classifyTypingKey,
  cycleTypingSoundProfile,
  getTypingSoundProfile,
  getTypingSoundProfileMeta,
  playMechanicalKeystroke,
  subscribeTypingSound,
  type TypingSoundProfile,
} from "../utils/typingSounds";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

interface PythonScratchpadProps {
  pyodideReady: boolean;
  onRunPython: (script: string) => Promise<string>;
}

function getTemplateIcon(id: ScratchpadTemplateId): StudioIconName {
  if (id === "ascii_art") return "paw";
  if (id === "dice_sim") return "dice";
  if (id === "algo_bench") return "bolt";
  if (id === "json_api") return "arch";
  return "coffee";
}

export default function PythonScratchpad({
  pyodideReady,
  onRunPython,
}: PythonScratchpadProps) {
  const styles = useThemedStyles(createStyles);

  const [code, setCode] = useState<string>(() => readScratchpadDraft());
  const [activeTemplateId, setActiveTemplateId] =
    useState<ScratchpadTemplateId | null>("welcome");
  const [output, setOutput] = useState<string>("");
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [snippets, setSnippets] = useState<SavedScratchpadSnippet[]>(() =>
    readSavedSnippets(),
  );
  const [snippetTitle, setSnippetTitle] = useState<string>("");
  const [saveNotice, setSaveNotice] = useState<boolean>(false);
  const [typingProfile, setTypingProfile] = useState<TypingSoundProfile>(() =>
    getTypingSoundProfile(),
  );
  const editorRef = useRef<any>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    return subscribeTypingSound(setTypingProfile);
  }, []);

  const activeTypingMeta = getTypingSoundProfileMeta(typingProfile);

  function handleCodeChange(next: string) {
    setCode(next);
    writeScratchpadDraft(next);
  }

  function handleApplyTemplate(id: ScratchpadTemplateId) {
    const tpl = SCRATCHPAD_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    playKeyClick();
    setActiveTemplateId(id);
    handleCodeChange(tpl.code);
    setOutput("");
    setLastRunMs(null);
  }

  async function handleRunCode() {
    if (isRunning) return;
    playKeyClick();
    setIsRunning(true);
    const start = Date.now();
    try {
      const res = await onRunPython(code);
      setLastRunMs(Math.max(1, Date.now() - start));
      setOutput(res);
      if (res.includes("[SYNTAX // TRACE]")) {
        playErrorBuzz();
      } else {
        playSuccessChime();
      }
    } catch (err: any) {
      setOutput(err?.message || "Execution error");
      playErrorBuzz();
    } finally {
      setIsRunning(false);
    }
  }

  function handleSaveSnippet() {
    if (!code.trim()) return;
    playSuccessChime();
    const fallbackTitle =
      snippetTitle.trim() || `Snippet #${snippets.length + 1}`;
    const updated = saveScratchpadSnippet({ title: fallbackTitle, code });
    setSnippets(updated);
    setSnippetTitle("");
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 1800);
  }

  function handleLoadSnippet(snip: SavedScratchpadSnippet) {
    playKeyClick();
    setActiveTemplateId(null);
    handleCodeChange(snip.code);
    setSnippetTitle(snip.title);
    setOutput("");
  }

  function handleDeleteSnippet(id: string) {
    playKeyClick();
    setSnippets(deleteScratchpadSnippet(id));
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Cozy Starter Template Strip */}
        <View style={styles.templateCard}>
          <View style={styles.templateHeaderRow}>
            <View style={styles.templateTitleGroup}>
              <StudioIcon name="terminal" size={16} />
              <Text style={styles.templateHeading}>
                PLAYGROUND.PY · FREE PYTHON 3.11 SCRATCHPAD
              </Text>
            </View>
            <Text style={styles.templateHint}>
              AUTO-SAVED LOCALLY · {pyodideReady ? "PY 3.11 READY" : "WARMING UP"}
            </Text>
          </View>

          <View style={styles.templatesRow}>
            {SCRATCHPAD_TEMPLATES.map((tpl) => {
              const selected = activeTemplateId === tpl.id;
              return (
                <Pressable
                  key={tpl.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Load ${tpl.title} template`}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.templateChip,
                    selected && styles.templateChipActive,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => handleApplyTemplate(tpl.id)}
                >
                  <StudioIcon name={getTemplateIcon(tpl.id)} size={13} />
                  <Text
                    style={[
                      styles.templateChipText,
                      selected && styles.templateChipTextActive,
                    ]}
                  >
                    {tpl.shortLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Split Grid: Free Editor + Output & Saved Snippets */}
        <View style={styles.splitGrid}>
          {/* Left: Interactive Code Editor */}
          <View style={styles.editorCard}>
            <View style={styles.ideHeader}>
              <View style={styles.ideLeft}>
                <View style={styles.dotsRow}>
                  <View
                    style={[styles.dot, { backgroundColor: StudioColors.coral }]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: StudioColors.yellow }]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: StudioColors.lime }]}
                  />
                </View>
                <Text style={styles.filenameText}>playground.py</Text>
              </View>

              <View style={styles.ideActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Switch typing sound (${activeTypingMeta.label})`}
                  style={styles.microBtn}
                  onPress={() => cycleTypingSoundProfile()}
                >
                  <Text style={styles.microBtnText}>
                    {activeTypingMeta.chipLabel}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear playground code"
                  style={styles.microBtn}
                  onPress={() => {
                    playKeyClick();
                    setActiveTemplateId(null);
                    handleCodeChange("");
                  }}
                >
                  <Text style={styles.microBtnText}>CLEAR</Text>
                </Pressable>
              </View>
            </View>

            <TextInput
              ref={editorRef}
              accessibilityLabel="Python playground scratchpad editor"
              value={code}
              onChangeText={handleCodeChange}
              onSelectionChange={(e) => {
                selectionRef.current = e.nativeEvent.selection;
              }}
              onKeyPress={(e: any) => {
                const nativeEvt = e?.nativeEvent;
                const key = nativeEvt?.key || "";
                const metaOrCtrl = Boolean(nativeEvt?.metaKey || nativeEvt?.ctrlKey);
                if (metaOrCtrl && key === "Enter") {
                  e.preventDefault?.();
                  void handleRunCode();
                  return;
                }
                if (!metaOrCtrl && !nativeEvt?.altKey) {
                  const kind = classifyTypingKey(key);
                  if (kind) playMechanicalKeystroke(kind);
                }
                if (Platform.OS === "web") {
                  const autoEdit = computePythonAutoEdit({
                    code,
                    selectionStart: selectionRef.current.start,
                    selectionEnd: selectionRef.current.end,
                    key,
                    shiftKey: Boolean(nativeEvt?.shiftKey),
                    metaOrCtrlKey: metaOrCtrl,
                    altKey: Boolean(nativeEvt?.altKey),
                  });
                  if (autoEdit) {
                    e.preventDefault?.();
                    selectionRef.current = {
                      start: autoEdit.selectionStart,
                      end: autoEdit.selectionEnd,
                    };
                    if (autoEdit.code !== code) {
                      handleCodeChange(autoEdit.code);
                    }
                    setTimeout(() => {
                      try {
                        editorRef.current?.setSelectionRange?.(
                          autoEdit.selectionStart,
                          autoEdit.selectionEnd,
                        );
                      } catch {}
                    }, 0);
                  }
                }
              }}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              placeholder="# Type any Python 3.11 code here..."
              placeholderTextColor="#64748B"
              style={styles.codeInput}
            />

            <View style={styles.runBar}>
              <Text style={styles.runBarHint}>
                {code.split("\n").length} lines · ⌘/Ctrl+Enter to run
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Run Python playground code"
                disabled={isRunning}
                style={({ pressed }) => [
                  styles.runBtn,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => void handleRunCode()}
              >
                <Text style={styles.runBtnText}>
                  {isRunning ? "RUNNING..." : "▶ RUN PLAYGROUND"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Right: Live Console + Saved Snippets */}
          <View style={styles.rightColumn}>
            {/* Output Console */}
            <View style={styles.consoleCard}>
              <View style={styles.consoleHeader}>
                <Text style={styles.consoleTitle}>LIVE CONSOLE OUTPUT</Text>
                <View style={styles.consoleHeaderRight}>
                  {lastRunMs !== null && (
                    <Text style={styles.runtimePill}>{lastRunMs} ms</Text>
                  )}
                  {output ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Clear console output"
                      style={styles.microBtn}
                      onPress={() => {
                        playKeyClick();
                        setOutput("");
                        setLastRunMs(null);
                      }}
                    >
                      <Text style={styles.microBtnText}>CLEAR</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <View style={styles.consoleBody}>
                <Text style={styles.consoleText}>
                  {output ||
                    "Press ▶ RUN PLAYGROUND to execute playground.py live in Python 3.11."}
                </Text>
              </View>
            </View>

            {/* Saved Snippets Shelf */}
            <View style={styles.snippetsCard}>
              <View style={styles.snippetsHeader}>
                <StudioIcon name="floppy" size={15} />
                <Text style={styles.snippetsHeading}>
                  SAVED SNIPPETS ({snippets.length})
                </Text>
              </View>

              <View style={styles.saveRow}>
                <TextInput
                  accessibilityLabel="Snippet name input"
                  value={snippetTitle}
                  onChangeText={setSnippetTitle}
                  placeholder="Name this snippet (e.g. Dice Roller)..."
                  placeholderTextColor="#7C8599"
                  maxLength={32}
                  style={styles.snippetInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save current playground snippet"
                  style={({ pressed }) => [
                    styles.saveSnippetBtn,
                    saveNotice && styles.saveSnippetBtnDone,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={handleSaveSnippet}
                >
                  <Text style={styles.saveSnippetBtnText}>
                    {saveNotice ? "✓ SAVED" : "SAVE"}
                  </Text>
                </Pressable>
              </View>

              {snippets.length === 0 ? (
                <Text style={styles.emptySnippetsText}>
                  No saved snippets yet — save your favorite experiments here
                  for 1-click recall.
                </Text>
              ) : (
                <View style={styles.snippetsList}>
                  {snippets.map((snip) => (
                    <View key={snip.id} style={styles.snippetRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Load saved snippet ${snip.title}`}
                        style={styles.snippetLoadTarget}
                        onPress={() => handleLoadSnippet(snip)}
                      >
                        <Text style={styles.snippetRowTitle} numberOfLines={1}>
                          {snip.title}
                        </Text>
                        <Text style={styles.snippetRowMeta}>
                          {snip.code.split("\n").length} lines · LOAD →
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Delete saved snippet ${snip.title}`}
                        style={styles.snippetDeleteBtn}
                        onPress={() => handleDeleteSnippet(snip.id)}
                      >
                        <Text style={styles.snippetDeleteText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 14,
      paddingBottom: 36,
    },
    container: {
      gap: 12,
      width: "100%",
    },
    templateCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 13,
      padding: 12,
      gap: 9,
      ...HardShadowSm,
    },
    templateHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    templateTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    templateHeading: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    templateHint: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    templatesRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 7,
    },
    templateChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 30,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    templateChipActive: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    templateChipText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    templateChipTextActive: {
      color: StudioColors.ink,
    },
    splitGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "flex-start",
    },
    editorCard: {
      flex: 1.4,
      minWidth: 300,
      backgroundColor: "#14161F",
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    ideHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "#1E2230",
      borderBottomWidth: 1.5,
      borderBottomColor: "#2E344A",
      gap: 8,
    },
    ideLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 5,
    },
    dot: {
      width: 9,
      height: 9,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: "#111111",
    },
    filenameText: {
      color: "#F8FAFC",
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    ideActions: {
      flexDirection: "row",
      gap: 6,
    },
    microBtn: {
      backgroundColor: "#2B3144",
      borderWidth: 1.5,
      borderColor: "#475569",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    microBtnText: {
      color: "#F8FAFC",
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeInput: {
      minHeight: 280,
      padding: 14,
      color: "#F8FAFC",
      fontSize: 13,
      lineHeight: 20,
      fontFamily: MonoFont,
      textAlignVertical: "top",
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    runBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "#1E2230",
      borderTopWidth: 1.5,
      borderTopColor: "#2E344A",
    },
    runBarHint: {
      color: "#94A3B8",
      fontSize: 10,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    runBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 16,
      paddingVertical: 8,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    runBtnText: {
      color: StudioColors.ink,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    rightColumn: {
      flex: 1,
      minWidth: 280,
      gap: 12,
    },
    consoleCard: {
      backgroundColor: "#14161F",
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    consoleHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "#1E2230",
      borderBottomWidth: 1.5,
      borderBottomColor: "#2E344A",
    },
    consoleTitle: {
      color: "#6EE7B7",
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    consoleHeaderRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    runtimePill: {
      color: "#FFDE59",
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    consoleBody: {
      padding: 13,
      minHeight: 130,
    },
    consoleText: {
      color: "#E2E8F0",
      fontSize: 12,
      lineHeight: 18,
      fontFamily: MonoFont,
    },
    snippetsCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 14,
      padding: 13,
      gap: 10,
      ...HardShadowSm,
    },
    snippetsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    snippetsHeading: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    saveRow: {
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
    },
    snippetInput: {
      flex: 1,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "700",
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    saveSnippetBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    saveSnippetBtnDone: {
      backgroundColor: StudioColors.mint,
    },
    saveSnippetBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    emptySnippetsText: {
      color: StudioColors.textMuted,
      fontSize: 11.5,
      fontWeight: "600",
      lineHeight: 17,
    },
    snippetsList: {
      gap: 6,
    },
    snippetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    snippetLoadTarget: {
      flex: 1,
      gap: 1,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    snippetRowTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "900",
    },
    snippetRowMeta: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    snippetDeleteBtn: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    snippetDeleteText: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
    },
  });
