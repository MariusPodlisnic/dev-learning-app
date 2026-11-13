import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { Lesson, TestCaseResult } from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";

interface TraceItem {
  label: string;
  value: string;
  type?: string;
  address?: string;
}

interface VisualLessonPanelProps {
  type: string;
  data: any;
  lesson?: Lesson;
  testResults?: TestCaseResult[] | null;
}

function getTraceMeta(type: string) {
  if (type === "memory") {
    return {
      badge: "VARIABLE MAP",
      title: "HOW VALUES ARE STORED",
      guide:
        "Each row shows a variable or expression on the left and the value it holds on the right. Tap any row or use Step Next ▶.",
      leftHeader: "NAME / INPUT",
      rightHeader: "STORED VALUE",
    };
  }
  if (type === "hashmap") {
    return {
      badge: "KEY → VALUE TRACE",
      title: "LOOKUP & MAPPING TRACE",
      guide:
        "Follow each step in order to see how items are checked, grouped, or stored for instant O(1) lookup.",
      leftHeader: "KEY / INPUT",
      rightHeader: "UPDATE / RESULT",
    };
  }
  return {
    badge: "STEP-BY-STEP TRACE",
    title: "EXECUTION WALKTHROUGH",
    guide:
      "Follow how the logic progresses from Step 1 to the final answer. Past steps show ✓ so you can track what already ran.",
    leftHeader: "STEP INPUT",
    rightHeader: "WHAT HAPPENS",
  };
}

function isHexAddress(addr?: string): boolean {
  return Boolean(addr && /^0x[0-9a-f]+$/i.test(addr.trim()));
}

function buildBeginnerTakeaway(
  type: string,
  item: TraceItem,
  stepNum: number,
): string {
  if (type === "memory") {
    if (isHexAddress(item.address)) {
      return `Python stores ${item.value}${item.type ? ` (${item.type})` : ""} at memory slot ${item.address} and binds "${item.label}" to it.`;
    }
    return `Here "${item.label}" evaluates to ${item.value}${item.type ? ` (${item.type})` : ""}.`;
  }
  if (type === "hashmap") {
    return `Checking "${item.label}" updates the state: ${item.value}.`;
  }
  return `At step ${stepNum} (${item.label}), the program computes: ${item.value}.`;
}

export default function VisualLessonPanel({
  type,
  data,
  lesson,
  testResults,
}: VisualLessonPanelProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fastSpeed, setFastSpeed] = useState<boolean>(false);

  const hasTraceData = Array.isArray(data) && data.length > 0;
  const safeData: TraceItem[] = hasTraceData ? data : [];
  const itemCount = safeData.length;
  const safeStepIndex = itemCount > 0 ? Math.min(stepIndex, itemCount - 1) : 0;
  const currentItem = safeData[safeStepIndex];
  const meta = getTraceMeta(type);

  useEffect(() => {
    if (!isPlaying || itemCount <= 1) return;
    const intervalMs = fastSpeed ? 900 : 1700;
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % itemCount);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, fastSpeed, itemCount]);

  function handleSelectStep(idx: number) {
    playKeyClick();
    setIsPlaying(false);
    setStepIndex(idx);
  }

  function handleNextStep() {
    if (!hasTraceData) return;
    playKeyClick();
    setIsPlaying(false);
    setStepIndex((prev) => (prev + 1) % safeData.length);
  }

  function handlePrevStep() {
    if (!hasTraceData) return;
    playKeyClick();
    setIsPlaying(false);
    setStepIndex((prev) => (prev - 1 + safeData.length) % safeData.length);
  }

  const runtimeTraceCard =
    testResults && testResults.length > 0 ? (
      <View style={styles.runtimeCard}>
        <View style={styles.runtimeHeader}>
          <Text style={styles.runtimeTitle}>🧪 LIVE RUNTIME TEST TRACE</Text>
          <Text style={styles.runtimeSummary}>
            {testResults.filter((t) => t.passed).length}/{testResults.length}{" "}
            PASSED
          </Text>
        </View>
        {testResults.slice(0, 4).map((t) => (
          <View key={t.id} style={styles.runtimeRow}>
            <Text
              style={[
                styles.runtimeStatus,
                {
                  backgroundColor: t.passed
                    ? StudioColors.mint
                    : StudioColors.coral,
                },
              ]}
            >
              {t.passed ? "PASS" : "FAIL"}
            </Text>
            <View style={styles.runtimeInfo}>
              <Text style={styles.runtimeInput} numberOfLines={1}>
                {t.input}
              </Text>
              <Text style={styles.runtimeOutput} numberOfLines={1}>
                actual: {t.actual} · expected: {t.expected}
              </Text>
            </View>
          </View>
        ))}
      </View>
    ) : null;

  if (!hasTraceData) {
    return (
      <View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>[TRACE // 00]</Text>
          <Text style={styles.emptyTitle}>Step-by-Step Trace Inspector</Text>
          <Text style={styles.emptyDesc}>
            Run your code in the editor to inspect actual outputs vs expected
            results for every test case.
          </Text>
        </View>
        {runtimeTraceCard}
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.liveDot,
                isPlaying && { backgroundColor: StudioColors.amber },
              ]}
            />
            <View style={styles.headerTitleGroup}>
              <Text style={styles.title}>{meta.title}</Text>
              {lesson?.title ? (
                <Text style={styles.lessonContext} numberOfLines={1}>
                  {lesson.title}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{meta.badge}</Text>
          </View>
        </View>

        {/* Beginner Friendly Guide Banner */}
        <View style={styles.beginnerBanner}>
          <Text style={styles.beginnerBannerLabel}>HOW TO READ THIS TRACE</Text>
          <Text style={styles.beginnerBannerText}>{meta.guide}</Text>
        </View>

        {/* Step Controls & Numbered Timeline */}
        <View style={styles.controlsBar}>
          <View style={styles.controlsLeft}>
            <Text style={styles.stepCounterLabel}>
              STEP {safeStepIndex + 1} OF {safeData.length}
            </Text>
            <View style={styles.stepPillsRow}>
              {safeData.map((_, i) => {
                const isCurrent = i === safeStepIndex;
                const isPast = i < safeStepIndex;
                return (
                  <Pressable
                    key={i}
                    style={[
                      styles.stepNumPill,
                      isPast && styles.stepNumPillPast,
                      isCurrent && styles.stepNumPillActive,
                    ]}
                    onPress={() => handleSelectStep(i)}
                  >
                    <Text
                      style={[
                        styles.stepNumPillText,
                        (isCurrent || isPast) && styles.stepNumPillTextOnBright,
                      ]}
                    >
                      {i + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.stepperBtns}>
            {safeData.length > 1 && (
              <>
                <Pressable
                  style={[styles.speedBtn, fastSpeed && styles.speedBtnActive]}
                  onPress={() => setFastSpeed((prev) => !prev)}
                >
                  <Text
                    style={[
                      styles.speedBtnText,
                      fastSpeed && styles.speedBtnTextActive,
                    ]}
                  >
                    {fastSpeed ? "2x" : "1x"}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.stepBtn,
                    isPlaying && styles.autoPlayBtnActive,
                  ]}
                  onPress={() => setIsPlaying((prev) => !prev)}
                >
                  <Text
                    style={[
                      styles.stepBtnText,
                      isPlaying && styles.autoPlayBtnTextActive,
                    ]}
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable style={styles.stepBtn} onPress={handlePrevStep}>
              <Text style={styles.stepBtnText}>◀ Prev</Text>
            </Pressable>
            <Pressable
              style={[styles.stepBtn, styles.stepBtnPrimary]}
              onPress={handleNextStep}
            >
              <Text style={styles.stepBtnTextPrimary}>Step Next ▶</Text>
            </Pressable>
          </View>
        </View>

        {/* Visual Representation */}
        {type === "memory" ? (
          <View style={styles.diagramContainer}>
            <View style={styles.columnLabelsRow}>
              <Text style={styles.columnHeaderLabel}>{meta.leftHeader}</Text>
              <Text style={styles.columnHeaderLabel}>STORES →</Text>
              <Text style={styles.columnHeaderLabel}>{meta.rightHeader}</Text>
            </View>

            {safeData.map((item, idx) => {
              const isSelected = safeStepIndex === idx;
              return (
                <Pressable
                  key={idx}
                  style={[styles.memoryRow, isSelected && styles.memoryRowActive]}
                  onPress={() => handleSelectStep(idx)}
                >
                  <View
                    style={[
                      styles.stackBox,
                      isSelected && styles.stackBoxActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stackLabel,
                        isSelected && styles.onBrightMutedText,
                      ]}
                    >
                      STEP {idx + 1}
                    </Text>
                    <Text
                      style={[
                        styles.varName,
                        isSelected && styles.onBrightInkText,
                      ]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <View style={styles.dataBus}>
                    <View style={styles.busDot} />
                    <View
                      style={[styles.busLine, isSelected && styles.busLineActive]}
                    />
                    <Text style={styles.busIcon}>▸</Text>
                  </View>

                  <View
                    style={[styles.heapBox, isSelected && styles.heapBoxActive]}
                  >
                    {(item.address || item.type) && (
                      <View style={styles.heapHeader}>
                        <Text
                          style={[
                            styles.heapAddress,
                            isSelected && styles.onBrightMutedText,
                          ]}
                        >
                          {item.address || ""}
                        </Text>
                        {item.type ? (
                          <View style={styles.heapTypePill}>
                            <Text style={styles.heapType}>{item.type}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                    <Text
                      style={[
                        styles.heapValue,
                        isSelected && styles.onBrightInkText,
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.stepsStack}>
            {safeData.map((item, idx) => {
              const isCurrent = idx === safeStepIndex;
              const isPast = idx < safeStepIndex;
              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.traceStepCard,
                    isPast && styles.traceStepCardPast,
                    isCurrent && styles.traceStepCardActive,
                  ]}
                  onPress={() => handleSelectStep(idx)}
                >
                  <View style={styles.traceStepTop}>
                    <View style={styles.traceStepBadgeGroup}>
                      <View
                        style={[
                          styles.traceStepNumBadge,
                          isPast && styles.traceStepNumPast,
                          isCurrent && styles.traceStepNumCurrent,
                        ]}
                      >
                        <Text
                          style={[
                            styles.traceStepNumText,
                            (isCurrent || isPast) && styles.onBrightInkText,
                          ]}
                        >
                          {isPast ? "✓" : `${idx + 1}`}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.traceStepLabel,
                          isCurrent && styles.onBrightInkText,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>

                    <View style={styles.traceStepRightMeta}>
                      {item.address ? (
                        <View
                          style={[
                            styles.metaContextPill,
                            isCurrent && styles.metaContextPillOnBright,
                          ]}
                        >
                          <Text
                            style={[
                              styles.metaContextText,
                              isCurrent && styles.onBrightInkText,
                            ]}
                          >
                            {item.address}
                          </Text>
                        </View>
                      ) : null}
                      {isCurrent && (
                        <View style={styles.currentTag}>
                          <Text style={styles.currentTagText}>ACTIVE</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.traceStepValue,
                      isCurrent && styles.onBrightInkText,
                    ]}
                  >
                    → {item.value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Clear Beginner Breakdown Card for Active Step */}
        {currentItem && (
          <View style={styles.explainerCard}>
            <View style={styles.explainerHeaderRow}>
              <Text style={styles.explainerBadge}>
                STEP {safeStepIndex + 1} EXPLAINED
              </Text>
              <View style={styles.explainerMetaRow}>
                {currentItem.type ? (
                  <Text style={styles.explainerMetaPill}>
                    type: {currentItem.type}
                  </Text>
                ) : null}
                {currentItem.address ? (
                  <Text style={styles.explainerMetaPill}>
                    {isHexAddress(currentItem.address) ? "slot" : "state"}:{" "}
                    {currentItem.address}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.explainerGrid}>
              <View style={styles.explainerCell}>
                <Text style={styles.explainerCellLabel}>{meta.leftHeader}</Text>
                <Text style={styles.explainerCellVal}>{currentItem.label}</Text>
              </View>
              <View style={styles.explainerCell}>
                <Text style={styles.explainerCellLabel}>
                  {meta.rightHeader}
                </Text>
                <Text style={styles.explainerCellVal}>{currentItem.value}</Text>
              </View>
            </View>

            <Text style={styles.explainerText}>
              {buildBeginnerTakeaway(type, currentItem, safeStepIndex + 1)}
            </Text>
          </View>
        )}
      </View>

      {runtimeTraceCard}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    ...HardShadow,
  },
  emptyContainer: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    ...HardShadowSm,
  },
  emptyIcon: {
    backgroundColor: StudioColors.yellow,
    color: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
  },
  emptyTitle: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyDesc: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 380,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.border,
    paddingBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 180,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  lessonContext: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  modeBadge: {
    backgroundColor: StudioColors.violet,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeBadgeText: {
    color: StudioColors.ink,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.7,
    fontFamily: MonoFont,
  },
  beginnerBanner: {
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.borderSubtle,
    borderLeftWidth: 4,
    borderLeftColor: StudioColors.mint,
    paddingHorizontal: 11,
    paddingVertical: 9,
    gap: 3,
  },
  beginnerBannerLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  beginnerBannerText: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    backgroundColor: StudioColors.bg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
  },
  controlsLeft: {
    gap: 6,
  },
  stepCounterLabel: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    fontFamily: MonoFont,
  },
  stepPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  stepNumPill: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  stepNumPillPast: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  stepNumPillActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  stepNumPillText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  stepNumPillTextOnBright: {
    color: StudioColors.ink,
  },
  stepperBtns: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  speedBtn: {
    backgroundColor: StudioColors.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  speedBtnActive: {
    borderColor: StudioColors.ink,
    backgroundColor: StudioColors.yellow,
  },
  speedBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  speedBtnTextActive: {
    color: StudioColors.ink,
  },
  stepBtn: {
    backgroundColor: StudioColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  autoPlayBtnActive: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  autoPlayBtnTextActive: {
    color: StudioColors.ink,
    fontWeight: "900",
  },
  stepBtnPrimary: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  stepBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  stepBtnTextPrimary: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  columnLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  columnHeaderLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
    fontFamily: MonoFont,
  },
  diagramContainer: {
    gap: 10,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.bg,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  memoryRowActive: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.yellow,
    ...HardShadowSm,
  },
  stackBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    width: 122,
  },
  stackBoxActive: {
    borderColor: StudioColors.ink,
    backgroundColor: StudioColors.yellow,
  },
  stackLabel: {
    color: StudioColors.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
    marginBottom: 3,
  },
  varName: {
    color: StudioColors.textPrimary,
    fontSize: 12.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  dataBus: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 6,
  },
  busDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: StudioColors.border,
  },
  busLine: {
    flex: 1,
    height: 2,
    backgroundColor: StudioColors.border,
  },
  busLineActive: {
    height: 3,
    backgroundColor: StudioColors.yellow,
  },
  busIcon: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: -3,
  },
  heapBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flex: 1.25,
    minWidth: 135,
  },
  heapBoxActive: {
    borderColor: StudioColors.ink,
    backgroundColor: StudioColors.mint,
  },
  heapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  heapAddress: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  heapTypePill: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  heapType: {
    color: StudioColors.lime,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  heapValue: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  onBrightInkText: {
    color: StudioColors.ink,
  },
  onBrightMutedText: {
    color: StudioColors.ink,
    opacity: 0.7,
  },
  stepsStack: {
    gap: 8,
  },
  traceStepCard: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 9,
    padding: 11,
    gap: 5,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  traceStepCardPast: {
    borderColor: StudioColors.mint,
  },
  traceStepCardActive: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  traceStepTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  traceStepBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  traceStepNumBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  traceStepNumPast: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  traceStepNumCurrent: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
  },
  traceStepNumText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  traceStepLabel: {
    color: StudioColors.textPrimary,
    fontSize: 12.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    flexShrink: 1,
  },
  traceStepRightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaContextPill: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaContextPillOnBright: {
    backgroundColor: "rgba(17, 17, 17, 0.1)",
    borderColor: StudioColors.ink,
  },
  metaContextText: {
    color: StudioColors.textSecondary,
    fontSize: 9.5,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  currentTag: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentTagText: {
    color: StudioColors.lime,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  traceStepValue: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    fontFamily: MonoFont,
    paddingLeft: 30,
  },
  explainerCard: {
    backgroundColor: StudioColors.bg,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    gap: 8,
  },
  explainerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  explainerBadge: {
    backgroundColor: StudioColors.yellow,
    color: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  explainerMetaRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  explainerMetaPill: {
    color: StudioColors.textSecondary,
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 9.5,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  explainerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  explainerCell: {
    flex: 1,
    minWidth: 140,
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.borderSubtle,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 2,
  },
  explainerCellLabel: {
    color: StudioColors.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  explainerCellVal: {
    color: StudioColors.textPrimary,
    fontSize: 12.5,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  explainerText: {
    color: StudioColors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 19,
  },
  runtimeCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    ...HardShadow,
  },
  runtimeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  runtimeTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: StudioColors.textMuted,
    fontFamily: MonoFont,
  },
  runtimeSummary: {
    fontSize: 11,
    fontWeight: "900",
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
  },
  runtimeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: StudioColors.border,
  },
  runtimeStatus: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    overflow: "hidden",
    minWidth: 44,
    textAlign: "center",
  },
  runtimeInfo: {
    flex: 1,
  },
  runtimeInput: {
    fontSize: 11,
    fontWeight: "700",
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
  },
  runtimeOutput: {
    fontSize: 11,
    color: StudioColors.textSecondary,
    fontFamily: MonoFont,
    marginTop: 2,
  },
});
