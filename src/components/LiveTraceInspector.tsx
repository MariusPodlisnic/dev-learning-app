import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { StudioIcon, Text } from "./StudioIcon";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import type { PythonTraceResult } from "../utils/pythonTrace";
import { playKeyClick } from "../utils/soundEffects";

interface LiveTraceInspectorProps {
  traceResult: PythonTraceResult | null;
  isTracing: boolean;
  userCode: string;
  onRunTrace: (customDriver?: string) => void;
  onActiveLineChange?: (lineNum: number | null) => void;
}

const EVENT_BADGE_MAP: Record<
  string,
  { label: string; bg: string; fg: string }
> = {
  call: { label: "CALL", bg: "#A78BFA", fg: "#121212" },
  line: { label: "EXEC LINE", bg: "#FFDE59", fg: "#121212" },
  return: { label: "RETURN", bg: "#B8FF3B", fg: "#121212" },
  exception: { label: "EXCEPTION", bg: "#FF6B6B", fg: "#121212" },
};

export default function LiveTraceInspector({
  traceResult,
  isTracing,
  userCode,
  onRunTrace,
  onActiveLineChange,
}: LiveTraceInspectorProps) {
  const styles = useThemedStyles(createStyles);
  const [traceViewState, setTraceViewState] = useState<{
    traceRef: PythonTraceResult | null;
    stepIdx: number;
    isPlaying: boolean;
  }>({
    traceRef: traceResult,
    stepIdx: 0,
    isPlaying: false,
  });
  const [fastSpeed, setFastSpeed] = useState<boolean>(false);
  const [driverDraftState, setDriverDraftState] = useState<{
    traceRef: PythonTraceResult | null;
    value: string | null;
  }>({
    traceRef: traceResult,
    value: null,
  });

  const frames = traceResult?.frames || [];
  const rawStepIdx =
    traceViewState.traceRef === traceResult ? traceViewState.stepIdx : 0;
  const isPlaying =
    traceViewState.traceRef === traceResult ? traceViewState.isPlaying : false;
  const customDriver =
    driverDraftState.traceRef === traceResult && driverDraftState.value !== null
      ? driverDraftState.value
      : traceResult?.driverUsed || "";
  const safeStepIdx =
    frames.length > 0 ? Math.min(rawStepIdx, frames.length - 1) : 0;
  const activeFrame = frames[safeStepIdx];

  function updateStep(
    updater: (prevStep: number) => number,
    nextPlaying: boolean = false,
  ) {
    setTraceViewState((prev) => {
      const baseStep = prev.traceRef === traceResult ? prev.stepIdx : 0;
      return {
        traceRef: traceResult,
        stepIdx: updater(baseStep),
        isPlaying: nextPlaying,
      };
    });
  }

  useEffect(() => {
    if (activeFrame) {
      onActiveLineChange?.(activeFrame.line);
    } else {
      onActiveLineChange?.(null);
    }
  }, [activeFrame, onActiveLineChange]);

  useEffect(() => {
    return () => {
      onActiveLineChange?.(null);
    };
  }, [onActiveLineChange]);

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const timer = setInterval(() => {
      setTraceViewState((prev) => {
        const baseStep = prev.traceRef === traceResult ? prev.stepIdx : 0;
        if (baseStep + 1 >= frames.length) {
          return {
            traceRef: traceResult,
            stepIdx: baseStep,
            isPlaying: false,
          };
        }
        return {
          traceRef: traceResult,
          stepIdx: baseStep + 1,
          isPlaying: true,
        };
      });
    }, fastSpeed ? 550 : 1150);
    return () => clearInterval(timer);
  }, [isPlaying, fastSpeed, frames.length, traceResult]);

  if (!traceResult && !isTracing) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyBadgeRow}>
          <StudioIcon name="terminal" size={14} />
          <Text style={styles.emptyBadgeText}>SYS.SETTRACE LIVE DEBUGGER</Text>
        </View>
        <Text style={styles.emptyTitle}>Trace Your Actual Python Code</Text>
        <Text style={styles.emptyDesc}>
          Run Python with live line-by-line instrumentation to watch variables
          change, trace function calls & returns, and inspect console output at
          every step.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.runTraceHeroBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onRunTrace();
          }}
        >
          <Text style={styles.runTraceHeroBtnText}>
            ▶ TRACE MY CODE LINE-BY-LINE
          </Text>
        </Pressable>
      </View>
    );
  }

  const sourceLines = (userCode || "").split("\n");
  const localEntries = activeFrame ? Object.entries(activeFrame.locals) : [];
  const changedSet = new Set(activeFrame?.changedVars || []);
  const eventStyle = activeFrame
    ? EVENT_BADGE_MAP[activeFrame.event] || EVENT_BADGE_MAP.line
    : EVENT_BADGE_MAP.line;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>LIVE EXECUTION TRACE</Text>
        </View>
        <Pressable
          disabled={isTracing}
          style={[styles.retraceBtn, isTracing && styles.disabledBtn]}
          onPress={() => {
            playKeyClick();
            onRunTrace(customDriver.trim() || undefined);
          }}
        >
          <Text style={styles.retraceBtnText}>
            {isTracing ? "TRACING..." : "↻ RE-TRACE"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.driverRow}>
        <Text style={styles.driverLabel}>DRIVER</Text>
        <TextInput
          style={styles.driverInput}
          value={customDriver}
          onChangeText={(val) =>
            setDriverDraftState({ traceRef: traceResult, value: val })
          }
          placeholder="Optional call e.g. print(solve(...))"
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          onSubmitEditing={() => {
            playKeyClick();
            onRunTrace(customDriver.trim() || undefined);
          }}
        />
        <Pressable
          disabled={isTracing}
          style={[styles.driverRunBtn, isTracing && styles.disabledBtn]}
          onPress={() => {
            playKeyClick();
            onRunTrace(customDriver.trim() || undefined);
          }}
        >
          <Text style={styles.driverRunBtnText}>RUN</Text>
        </Pressable>
      </View>

      {traceResult?.error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBadge}>TRACE STOPPED ON ERROR</Text>
          <Text style={styles.errorText}>{traceResult.error}</Text>
        </View>
      ) : null}

      {activeFrame ? (
        <>
          <View style={styles.controlsCard}>
            <View style={styles.controlsTopRow}>
              <Text style={styles.stepLabel}>
                STEP {safeStepIdx + 1} / {frames.length} · LINE {activeFrame.line}
              </Text>
              <View
                style={[
                  styles.eventBadge,
                  { backgroundColor: eventStyle.bg },
                ]}
              >
                <Text
                  style={[styles.eventBadgeText, { color: eventStyle.fg }]}
                >
                  {eventStyle.label}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScroll}
            >
              {frames.map((frame, i) => {
                const isCurrent = i === safeStepIdx;
                const isPast = i < safeStepIdx;
                const hasMut = frame.changedVars.length > 0;
                return (
                  <Pressable
                    key={i}
                    style={[
                      styles.stepPill,
                      isPast && styles.stepPillPast,
                      isCurrent && styles.stepPillActive,
                    ]}
                    onPress={() => {
                      playKeyClick();
                      updateStep(() => i, false);
                    }}
                  >
                    <Text
                      style={[
                        styles.stepPillText,
                        (isCurrent || isPast) && styles.inkText,
                      ]}
                    >
                      {i + 1}
                      {hasMut ? "•" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.btnsRow}>
              <Pressable
                style={[styles.ctrlBtn, fastSpeed && styles.ctrlBtnMint]}
                onPress={() => setFastSpeed((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.ctrlBtnText,
                    fastSpeed && styles.inkText,
                  ]}
                >
                  {fastSpeed ? "2x" : "1x"}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.ctrlBtn, isPlaying && styles.ctrlBtnMint]}
                onPress={() => {
                  if (!isPlaying && safeStepIdx >= frames.length - 1) {
                    updateStep(() => 0, true);
                  } else {
                    updateStep((prev) => prev, !isPlaying);
                  }
                }}
              >
                <Text
                  style={[
                    styles.ctrlBtnText,
                    isPlaying && styles.inkText,
                  ]}
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.ctrlBtn}
                onPress={() => {
                  playKeyClick();
                  updateStep(() => 0, false);
                }}
              >
                <Text style={styles.ctrlBtnText}>↺</Text>
              </Pressable>
              <Pressable
                style={styles.ctrlBtn}
                onPress={() => {
                  playKeyClick();
                  updateStep((prev) => Math.max(0, prev - 1), false);
                }}
              >
                <Text style={styles.ctrlBtnText}>◀ Prev</Text>
              </Pressable>
              <Pressable
                style={[styles.ctrlBtn, styles.ctrlBtnPrimary]}
                onPress={() => {
                  playKeyClick();
                  updateStep(
                    (prev) => Math.min(frames.length - 1, prev + 1),
                    false,
                  );
                }}
              >
                <Text style={[styles.ctrlBtnText, styles.inkText]}>
                  Next ▶
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Call Stack Breadcrumb */}
          <View style={styles.stackBar}>
            <Text style={styles.stackLabel}>CALL STACK</Text>
            <View style={styles.stackPills}>
              {activeFrame.callStack.map((fn, idx) => (
                <View key={`${fn}-${idx}`} style={styles.stackPill}>
                  <Text style={styles.stackPillText}>
                    {idx > 0 ? `→ ${fn}()` : fn}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Code Highlight Card */}
          <View style={styles.codeCard}>
            {sourceLines.map((lineText, idx) => {
              const lineNo = idx + 1;
              const isActive = lineNo === activeFrame.line;
              return (
                <View
                  key={lineNo}
                  style={[
                    styles.codeRow,
                    isActive && styles.codeRowActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.codeGutter,
                      isActive && styles.codeGutterActive,
                    ]}
                  >
                    {isActive ? "▶" : String(lineNo)}
                  </Text>
                  <Text
                    style={[
                      styles.codeLineText,
                      isActive && styles.codeLineTextActive,
                    ]}
                  >
                    {lineText || " "}
                  </Text>
                </View>
              );
            })}
          </View>

          {activeFrame.returnValue !== null ? (
            <View style={styles.returnBanner}>
              <Text style={styles.returnBannerText}>
                ↳ RETURNED VALUE: {activeFrame.returnValue}
              </Text>
            </View>
          ) : null}

          {activeFrame.exception ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBadge}>RAISED</Text>
              <Text style={styles.errorText}>{activeFrame.exception}</Text>
            </View>
          ) : null}

          {/* Variables Inspector */}
          <View style={styles.varsCard}>
            <Text style={styles.sectionMicro}>
              VARIABLES AT STEP {safeStepIdx + 1}
              {activeFrame.changedVars.length > 0
                ? ` · ${activeFrame.changedVars.length} UPDATED`
                : ""}
            </Text>
            {localEntries.length === 0 ? (
              <Text style={styles.emptyVarsText}>
                No local variables bound yet at this step.
              </Text>
            ) : (
              localEntries.map(([name, meta]) => {
                const changed = changedSet.has(name) || Boolean(meta.changed);
                return (
                  <View
                    key={name}
                    style={[
                      styles.varRow,
                      changed && styles.varRowChanged,
                    ]}
                  >
                    <View style={styles.varLeft}>
                      <Text
                        style={[
                          styles.varName,
                          changed && styles.inkText,
                        ]}
                      >
                        {name}
                      </Text>
                      {changed && (
                        <View style={styles.changedPill}>
                          <Text style={styles.changedPillText}>UPDATED</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.varRight}>
                      <Text
                        style={[
                          styles.varType,
                          changed && styles.inkMutedText,
                        ]}
                      >
                        {meta.type}
                      </Text>
                      <Text
                        style={[
                          styles.varValue,
                          changed && styles.inkText,
                        ]}
                      >
                        {meta.value}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Incremental Stdout Snapshot */}
          {(activeFrame.stdout || traceResult?.finalStdout) ? (
            <View style={styles.stdoutCard}>
              <Text style={styles.stdoutLabel}>CONSOLE AT STEP {safeStepIdx + 1}</Text>
              <Text style={styles.stdoutText}>
                {activeFrame.stdout.trim() || "(nothing printed yet at this line)"}
              </Text>
            </View>
          ) : null}

          {traceResult?.truncated ? (
            <Text style={styles.truncatedNote}>
              Trace capped at {traceResult.totalSteps} steps to prevent runaway
              loops.
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: StudioColors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 14,
      marginBottom: 16,
      gap: 10,
      ...HardShadow,
    },
    emptyCard: {
      backgroundColor: StudioColors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 18,
      marginBottom: 16,
      gap: 10,
      alignItems: "flex-start",
      ...HardShadow,
    },
    emptyBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.codeBg,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    emptyBadgeText: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    emptyTitle: {
      color: StudioColors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
    },
    emptyDesc: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
    },
    runTraceHeroBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    runTraceHeroBtnText: {
      color: StudioColors.ink,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    liveDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    headerTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    retraceBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    retraceBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    disabledBtn: {
      opacity: 0.55,
    },
    driverRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    driverLabel: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    driverInput: {
      flex: 1,
      color: "#F8FAFC",
      fontSize: 11.5,
      fontFamily: MonoFont,
      paddingVertical: 2,
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    driverRunBtn: {
      backgroundColor: StudioColors.mint,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    driverRunBtnText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    errorBanner: {
      backgroundColor: "#2C1014",
      borderWidth: 1.5,
      borderColor: StudioColors.coral,
      borderRadius: 8,
      padding: 10,
      gap: 4,
    },
    errorBadge: {
      color: StudioColors.coral,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    errorText: {
      color: "#FEE2E2",
      fontSize: 12,
      fontFamily: MonoFont,
      fontWeight: "700",
    },
    controlsCard: {
      backgroundColor: StudioColors.bg,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 10,
      gap: 8,
    },
    controlsTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    stepLabel: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    eventBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: StudioColors.ink,
    },
    eventBadgeText: {
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    pillsScroll: {
      flexDirection: "row",
      gap: 5,
      paddingVertical: 2,
    },
    stepPill: {
      minWidth: 26,
      height: 24,
      paddingHorizontal: 6,
      borderRadius: 5,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    stepPillPast: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    stepPillActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    stepPillText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    btnsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    ctrlBtn: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 6,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    ctrlBtnMint: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    ctrlBtnPrimary: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    ctrlBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    inkText: {
      color: StudioColors.ink,
    },
    inkMutedText: {
      color: "#334155",
    },
    stackBar: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    stackLabel: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    stackPills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    stackPill: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1,
      borderColor: StudioColors.border,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    stackPillText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontFamily: MonoFont,
      fontWeight: "700",
    },
    codeCard: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      paddingVertical: 8,
      paddingHorizontal: 6,
      gap: 2,
    },
    codeRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 8,
    },
    codeRowActive: {
      backgroundColor: "rgba(184, 255, 59, 0.22)",
      borderLeftWidth: 3,
      borderLeftColor: StudioColors.lime,
    },
    codeGutter: {
      width: 20,
      color: StudioColors.codeMuted,
      fontSize: 10.5,
      fontFamily: MonoFont,
      fontWeight: "700",
      textAlign: "right",
    },
    codeGutterActive: {
      color: StudioColors.lime,
      fontWeight: "900",
    },
    codeLineText: {
      flex: 1,
      color: "#E2E8F0",
      fontSize: 11.5,
      fontFamily: MonoFont,
    },
    codeLineTextActive: {
      color: "#FFFFFF",
      fontWeight: "800",
    },
    returnBanner: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    returnBannerText: {
      color: StudioColors.ink,
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    varsCard: {
      backgroundColor: StudioColors.bg,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 10,
      gap: 6,
    },
    sectionMicro: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    emptyVarsText: {
      color: StudioColors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    varRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    varRowChanged: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    varLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    varName: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    changedPill: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    changedPillText: {
      color: StudioColors.ink,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    varRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    varType: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontFamily: MonoFont,
      fontWeight: "700",
    },
    varValue: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontFamily: MonoFont,
      fontWeight: "800",
    },
    stdoutCard: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 10,
      gap: 4,
    },
    stdoutLabel: {
      color: StudioColors.mint,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    stdoutText: {
      color: "#F8FAFC",
      fontSize: 11.5,
      fontFamily: MonoFont,
    },
    truncatedNote: {
      color: StudioColors.textMuted,
      fontSize: 11,
      fontStyle: "italic",
    },
  });
