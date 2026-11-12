import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import {
  executePlaygroundPython,
  loadPyodideScript,
} from "../utils/pyodideRunner";
import { trackFunnelMilestone } from "../utils/attribution";
import { playKeyClick } from "../utils/soundEffects";
import { renderHighlightedPython } from "./FormattedText";

interface SandboxPreset {
  id: string;
  label: string;
  tag: string;
  accent: string;
  promptHint: string;
  code: string;
  sampleOutput: string;
  ctaLabel: string;
  href: { pathname: "/"; params: Record<string, string> };
}

const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: "crit",
    label: "⚔️ RPG Crit",
    tag: "CH VI MINI-APP",
    accent: StudioColors.yellow,
    promptHint: "Try changing base_dmg or toggling is_crit=False, then hit Run!",
    code: `def calc_damage(base_dmg, is_crit=True):
    multiplier = 2.5 if is_crit else 1.0
    total = int(base_dmg * multiplier)
    badge = "CRITICAL HIT!" if is_crit else "Normal strike"
    return f"{badge} -> {total} DMG"

print(calc_damage(42, is_crit=True))
print(calc_damage(42, is_crit=False))`,
    sampleOutput: "CRITICAL HIT! -> 105 DMG\nNormal strike -> 42 DMG",
    ctaLabel: "BUILD THIS MINI-APP →",
    href: { pathname: "/", params: { lesson: "exp-py-21" } },
  },
  {
    id: "emoji",
    label: "🔥 Emoji Counter",
    tag: "LIST TOOLS",
    accent: StudioColors.mint,
    promptHint: "Add more reactions to the list and watch the hype score update.",
    code: `reactions = ["🔥", "❤️", "🔥", "👍", "🔥"]
fire_count = reactions.count("🔥")
hype_pct = fire_count * 100 // len(reactions)

print(f"Total reactions: {len(reactions)}")
print(f"Fire score: {hype_pct}%")`,
    sampleOutput: "Total reactions: 5\nFire score: 60%",
    ctaLabel: "SOLVE FOR +50 XP →",
    href: { pathname: "/", params: { lesson: "exp-py-09" } },
  },
  {
    id: "bughunt",
    label: "🪲 Fix the Bug",
    tag: "BUG HUNT PREVIEW",
    accent: StudioColors.coral,
    promptHint: "Spot the math bug? Change `pct` to `pct / 100` and run again!",
    code: `def apply_discount(price, pct):
    # Bug: 25% is treated as 2500%!
    return price - price * pct

print("Current output:", apply_discount(80, 25))
print("Target output : 60.0")`,
    sampleOutput: "Current output: -1920\nTarget output : 60.0",
    ctaLabel: "PLAY BUG HUNT →",
    href: { pathname: "/", params: { mode: "bughunt" } },
  },
  {
    id: "twosum",
    label: "⚡ Two Sum O(n)",
    tag: "ALGORITHMS",
    accent: StudioColors.violet,
    promptHint: "Edit target or nums to test hash-map lookup in linear time.",
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
    return []

print("Matching indices:", two_sum([2, 7, 11, 15], 9))`,
    sampleOutput: "Matching indices: [0, 1]",
    ctaLabel: "EXPLORE ALGORITHMS →",
    href: { pathname: "/", params: { track: "algorithms" } },
  },
];

interface ExplorePythonSandboxProps {
  isCompact: boolean;
}

export default function ExplorePythonSandbox({
  isCompact,
}: ExplorePythonSandboxProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SANDBOX_PRESETS[0].id,
  );
  const activePreset =
    SANDBOX_PRESETS.find((p) => p.id === selectedPresetId) ||
    SANDBOX_PRESETS[0];

  const [code, setCode] = useState<string>(activePreset.code);
  const [output, setOutput] = useState<string>(activePreset.sampleOutput);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runCount, setRunCount] = useState<number>(0);

  const pyodideRef = useRef<any>(null);
  const mountedRef = useRef<boolean>(true);
  const editedByUserRef = useRef<boolean>(false);
  const inputRef = useRef<any>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    mountedRef.current = true;
    if (Platform.OS === "web") {
      loadPyodideScript(
        pyodideRef,
        () => {
          if (!mountedRef.current) return;
          setPyodideReady(true);
          setLoadFailed(false);
        },
        () => {
          if (!mountedRef.current) return;
          setLoadFailed(true);
        },
      );
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function selectPreset(preset: SandboxPreset) {
    playKeyClick();
    editedByUserRef.current = false;
    setSelectedPresetId(preset.id);
    setCode(preset.code);
    setOutput(preset.sampleOutput);
  }

  function setCursorAt(pos: number) {
    selectionRef.current = { start: pos, end: pos };
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

  function insertTextAtCursor(insertion: string) {
    playKeyClick();
    editedByUserRef.current = true;
    const start = Math.min(
      Math.max(0, selectionRef.current.start),
      code.length,
    );
    const end = Math.min(
      Math.max(start, selectionRef.current.end),
      code.length,
    );
    const nextCode = code.slice(0, start) + insertion + code.slice(end);
    setCode(nextCode);
    setCursorAt(start + insertion.length);
  }

  async function handleRunCode() {
    playKeyClick();
    if (Platform.OS !== "web") {
      setOutput(
        `${activePreset.sampleOutput}\n\n[INFO] Live WASM Python runs in web browsers. Launch the full Studio to run on this device!`,
      );
      trackFunnelMilestone("explore_sandbox_run");
      setRunCount((c) => c + 1);
      return;
    }

    if (!pyodideReady || !pyodideRef.current) {
      setOutput(
        loadFailed
          ? "Could not load Pyodide runtime in this browser session. Refresh or launch the full Studio."
          : "Python 3.11 WebAssembly engine is warming up — try again in a second!",
      );
      return;
    }

    setIsRunning(true);
    try {
      const result = await executePlaygroundPython(pyodideRef.current, code);
      trackFunnelMilestone("explore_sandbox_run");
      if (mountedRef.current) {
        setOutput(result);
        setRunCount((c) => c + 1);
      }
    } finally {
      if (mountedRef.current) {
        setIsRunning(false);
      }
    }
  }

  const lineCount = Math.max((code || "").split("\n").length, 8);
  const editorMinHeight = lineCount * 20 + 28;
  const isErrorOutput =
    output.includes("[SYNTAX // TRACE]") ||
    output.includes("Error:") ||
    output.includes("Could not load");

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>
              LIVE IN-BROWSER PYTHON // ZERO SIGN-UP
            </Text>
          </View>
          <Text style={styles.title}>Try Python Right Here</Text>
          <Text style={styles.subtitle}>{activePreset.promptHint}</Text>
        </View>

        <View style={styles.engineStatusPill}>
          <View
            style={[
              styles.engineDot,
              pyodideReady
                ? { backgroundColor: StudioColors.lime }
                : loadFailed
                  ? { backgroundColor: StudioColors.coral }
                  : { backgroundColor: StudioColors.yellow },
            ]}
          />
          <Text style={styles.engineStatusText}>
            {Platform.OS !== "web"
              ? "PREVIEW MODE"
              : pyodideReady
                ? "PY 3.11 WASM READY"
                : loadFailed
                  ? "RUNTIME OFFLINE"
                  : "LOADING PYTHON..."}
          </Text>
        </View>
      </View>

      {/* Preset Selector Tabs */}
      <View style={styles.presetRow}>
        {SANDBOX_PRESETS.map((preset) => {
          const isSelected = preset.id === activePreset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => selectPreset(preset)}
              style={[
                styles.presetChip,
                isSelected && {
                  backgroundColor: preset.accent,
                  borderColor: StudioColors.ink,
                },
              ]}
            >
              <Text
                style={[
                  styles.presetChipText,
                  isSelected && { color: StudioColors.ink },
                ]}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Editor + Output Workspace */}
      <View style={[styles.workspace, isCompact && styles.workspaceCompact]}>
        {/* Left: Mini IDE */}
        <View style={styles.idePane}>
          <View style={styles.ideTopBar}>
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
              <Text style={styles.fileName}>try_python.py</Text>
            </View>

            <View style={styles.ideTopActions}>
              <View
                style={[
                  styles.presetTagPill,
                  { backgroundColor: activePreset.accent },
                ]}
              >
                <Text style={styles.presetTagText}>{activePreset.tag}</Text>
              </View>
              <Pressable
                style={styles.resetBtn}
                onPress={() => {
                  editedByUserRef.current = false;
                  setCode(activePreset.code);
                  setOutput(activePreset.sampleOutput);
                }}
              >
                <Text style={styles.resetBtnText}>RESET</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={[
              styles.editorBody,
              { minHeight: editorMinHeight },
            ]}
          >
            <View style={styles.lineNumbers}>
              {Array.from({ length: lineCount }).map((_, idx) => (
                <Text key={idx} style={styles.lineNumberText}>
                  {idx + 1}
                </Text>
              ))}
            </View>

            <View
              style={[styles.codeWrap, { minHeight: editorMinHeight }]}
            >
              {Platform.OS === "web" && (
                <View
                  pointerEvents="none"
                  style={[styles.highlightLayer, { minHeight: editorMinHeight }]}
                >
                  <Text style={styles.highlightText}>
                    {renderHighlightedPython(code)}
                    {code.endsWith("\n") ? " " : ""}
                  </Text>
                </View>
              )}
              <TextInput
                ref={inputRef}
                style={[styles.codeInput, { minHeight: editorMinHeight }]}
                value={code}
                onChangeText={(nextText) => {
                  editedByUserRef.current = true;
                  setCode(nextText);
                }}
                onSelectionChange={(e) => {
                  selectionRef.current = e.nativeEvent.selection;
                }}
                onKeyPress={(e: any) => {
                  const nativeEv = e?.nativeEvent;
                  if (!nativeEv) return;

                  if (
                    nativeEv.key === "Enter" &&
                    (nativeEv.metaKey || nativeEv.ctrlKey)
                  ) {
                    e.preventDefault?.();
                    void handleRunCode();
                    return;
                  }

                  if (nativeEv.key === "Tab") {
                    e.preventDefault?.();
                    insertTextAtCursor("    ");
                  }
                }}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                accessibilityLabel="Interactive Python mini sandbox editor"
              />
            </View>
          </ScrollView>

          <View style={styles.ideActionBar}>
            <Pressable
              style={[
                styles.runBtn,
                isRunning && styles.runBtnDisabled,
              ]}
              onPress={() => void handleRunCode()}
              disabled={isRunning}
            >
              <Text style={styles.runBtnText}>
                {isRunning
                  ? "RUNNING..."
                  : Platform.OS === "web"
                    ? "▶ RUN PYTHON"
                    : "▶ PREVIEW OUTPUT"}
              </Text>
            </Pressable>

            <Text style={styles.shortcutHint}>
              {Platform.OS === "web" ? "⌘/Ctrl + Enter to run" : "Tab = 4 spaces"}
            </Text>
          </View>
        </View>

        {/* Right: Output Console + Deep-Link CTA */}
        <View style={styles.consolePane}>
          <View style={styles.consoleHeader}>
            <Text style={styles.consoleTitle}>STDOUT // CONSOLE</Text>
            <View style={styles.consoleMetaPill}>
              <Text style={styles.consoleMetaText}>
                {runCount > 0 ? `LIVE RUN #${runCount}` : "SAMPLE OUTPUT"}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.consoleBody}>
            <Text
              style={[
                styles.consoleText,
                isErrorOutput && { color: StudioColors.coral },
              ]}
            >
              {output}
            </Text>
          </ScrollView>

          <View style={styles.conversionFooter}>
            <Text style={styles.conversionCopy}>
              {runCount > 0
                ? "✓ Executed live! Earn +50 XP & unlock certificates in the full Studio."
                : "Want guided hints, unit tests & XP streaks for this challenge?"}
            </Text>
            <Link href={activePreset.href} asChild>
              <Pressable style={styles.launchPresetBtn}>
                <Text style={styles.launchPresetBtnText}>
                  {activePreset.ctaLabel}
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    ...HardShadow,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    minWidth: 240,
    gap: 4,
  },
  liveBadge: {
    alignSelf: "flex-start",
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  liveBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  engineStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  engineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  engineStatusText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  presetChipText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  workspace: {
    flexDirection: "row",
    gap: 14,
    alignItems: "stretch",
  },
  workspaceCompact: {
    flexDirection: "column",
  },
  idePane: {
    flex: 1.35,
    backgroundColor: StudioColors.codeBg,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    overflow: "hidden",
    ...HardShadowSm,
  },
  ideTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: StudioColors.codeSurface,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.codeBorder,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  fileName: {
    marginLeft: 4,
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "800",
  },
  ideTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  presetTagPill: {
    borderWidth: 1,
    borderColor: StudioColors.ink,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  presetTagText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 9,
    fontWeight: "900",
  },
  resetBtn: {
    backgroundColor: "#2E2E2A",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  resetBtnText: {
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "800",
  },
  editorScroll: {
    maxHeight: 250,
    backgroundColor: StudioColors.codeBg,
  },
  editorBody: {
    flexDirection: "row",
  },
  lineNumbers: {
    paddingVertical: 14,
    paddingHorizontal: 9,
    backgroundColor: StudioColors.codeBg,
    borderRightWidth: 1,
    borderRightColor: StudioColors.codeBorder,
    alignItems: "flex-end",
    ...Platform.select({ web: { userSelect: "none" as any } }),
  },
  lineNumberText: {
    color: StudioColors.codeMuted,
    fontFamily: MonoFont,
    fontSize: 12,
    lineHeight: 20,
  },
  codeWrap: {
    flex: 1,
    position: "relative",
  },
  highlightLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
  },
  highlightText: {
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 13,
    lineHeight: 20,
    ...Platform.select({
      web: {
        whiteSpace: "pre-wrap" as any,
        wordBreak: "break-word" as any,
      },
    }),
  },
  codeInput: {
    flex: 1,
    color: Platform.OS === "web" ? "transparent" : StudioColors.codeText,
    backgroundColor: "transparent",
    fontFamily: MonoFont,
    fontSize: 13,
    lineHeight: 20,
    padding: 14,
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
  ideActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: StudioColors.codeSurface,
    borderTopWidth: 1.5,
    borderTopColor: StudioColors.codeBorder,
  },
  runBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  runBtnDisabled: {
    opacity: 0.7,
  },
  runBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  shortcutHint: {
    color: StudioColors.codeMuted,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "700",
  },
  consolePane: {
    flex: 1,
    backgroundColor: StudioColors.codeSurface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "space-between",
    ...HardShadowSm,
  },
  consoleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: StudioColors.codeBg,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.codeBorder,
  },
  consoleTitle: {
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  consoleMetaPill: {
    backgroundColor: "#262623",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#3A3A35",
  },
  consoleMetaText: {
    color: StudioColors.mint,
    fontFamily: MonoFont,
    fontSize: 9,
    fontWeight: "900",
  },
  consoleBody: {
    padding: 14,
    minHeight: 120,
    maxHeight: 190,
  },
  consoleText: {
    color: StudioColors.lime,
    fontFamily: MonoFont,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  conversionFooter: {
    padding: 12,
    backgroundColor: StudioColors.surfaceElevated,
    borderTopWidth: 2,
    borderTopColor: StudioColors.ink,
    gap: 8,
  },
  conversionCopy: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  launchPresetBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  launchPresetBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
});
