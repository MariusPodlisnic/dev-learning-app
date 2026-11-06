import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
} from "../constants/theme";

interface MemoryItem {
  label: string;
  value: string;
  type: string;
  address: string;
}

interface VisualLessonPanelProps {
  type: string;
  data: any;
}

export default function VisualLessonPanel({
  type,
  data,
}: VisualLessonPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fastSpeed, setFastSpeed] = useState<boolean>(false);

  useEffect(() => {
    setActiveIndex(0);
    setSelectedMemoryIndex(0);
    setIsPlaying(false);
  }, [data, type]);

  const itemCount = Array.isArray(data) ? data.length : 0;

  useEffect(() => {
    if (!isPlaying || itemCount <= 1) return;
    const intervalMs = fastSpeed ? 900 : 1600;
    const timer = setInterval(() => {
      if (type === "memory") {
        setSelectedMemoryIndex((prev) => (prev + 1) % itemCount);
      } else {
        setActiveIndex((prev) => (prev + 1) % itemCount);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, fastSpeed, itemCount, type]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>[MEM // 00]</Text>
        <Text style={styles.emptyTitle}>Interactive Memory Visualizer</Text>
        <Text style={styles.emptyDesc}>
          Run your code in the studio editor to inspect output and verify how
          variables and data structures behave at runtime.
        </Text>
      </View>
    );
  }

  const safeMemoryIndex =
    selectedMemoryIndex < data.length ? selectedMemoryIndex : 0;
  const safeActiveIndex = activeIndex < data.length ? activeIndex : 0;
  const currentStepIndex =
    type === "memory" ? safeMemoryIndex : safeActiveIndex;

  function handleSelectStep(idx: number) {
    setIsPlaying(false);
    if (type === "memory") {
      setSelectedMemoryIndex(idx);
    } else {
      setActiveIndex(idx);
    }
  }

  function handleNextStep() {
    setIsPlaying(false);
    if (type === "memory") {
      setSelectedMemoryIndex((prev) => (prev + 1) % data.length);
    } else {
      setActiveIndex((prev) => (prev + 1) % data.length);
    }
  }

  function handlePrevStep() {
    setIsPlaying(false);
    if (type === "memory") {
      setSelectedMemoryIndex((prev) => (prev - 1 + data.length) % data.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Visualizer Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.liveDot,
              isPlaying && { backgroundColor: StudioColors.amber },
            ]}
          />
          <Text style={styles.title}>MEMORY & EXECUTION INSPECTOR</Text>
          {isPlaying && (
            <View style={styles.playingPill}>
              <Text style={styles.playingPillText}>LIVE TRACE</Text>
            </View>
          )}
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>
            {type === "memory"
              ? "RAM STACK / HEAP"
              : type === "hashmap"
                ? "HASH TABLE O(1)"
                : "ARRAY POINTER"}
          </Text>
        </View>
      </View>

      {/* Unified Controls Bar across all visual modes */}
      <View style={styles.controlsBar}>
        <View style={styles.controlsLeft}>
          <Text style={styles.arrayLabel}>
            {type === "memory"
              ? `ACTIVE BINDING: ${data[safeMemoryIndex]?.label || ""}`
              : type === "hashmap"
                ? "KEY-VALUE BUCKETS"
                : `POINTER AT INDEX [${safeActiveIndex}]`}
          </Text>
          <View style={styles.stepDotsRow}>
            {data.map((_: any, i: number) => (
              <Pressable
                key={i}
                style={[
                  styles.stepDot,
                  i === currentStepIndex && styles.stepDotActive,
                ]}
                onPress={() => handleSelectStep(i)}
              />
            ))}
          </View>
        </View>

        <View style={styles.stepperBtns}>
          {data.length > 1 && (
            <>
              <Pressable
                style={[
                  styles.speedBtn,
                  fastSpeed && styles.speedBtnActive,
                ]}
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
                  {isPlaying ? "⏸ Pause" : "▶ Auto-Play"}
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

      {/* MEMORY MODE (Stack -> Heap) */}
      {type === "memory" && (
        <View style={styles.diagramContainer}>
          <View style={styles.columnLabelsRow}>
            <Text style={styles.columnHeaderLabel}>STACK FRAME (NAMES)</Text>
            <Text style={styles.columnHeaderLabel}>REFERENCE</Text>
            <Text style={styles.columnHeaderLabel}>HEAP OBJECTS (RAM)</Text>
          </View>

          {data.map((item: MemoryItem, idx: number) => {
            const isSelected = safeMemoryIndex === idx;
            return (
              <Pressable
                key={idx}
                style={[styles.memoryRow, isSelected && styles.memoryRowActive]}
                onPress={() => handleSelectStep(idx)}
              >
                <View
                  style={[styles.stackBox, isSelected && styles.stackBoxActive]}
                >
                  <Text style={styles.stackLabel}>IDENTIFIER</Text>
                  <Text style={styles.varName} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>

                <View style={styles.dataBus}>
                  <View
                    style={[styles.busDot, isSelected && styles.busDotActive]}
                  />
                  <View
                    style={[styles.busLine, isSelected && styles.busLineActive]}
                  />
                  <Text
                    style={[styles.busIcon, isSelected && styles.busIconActive]}
                  >
                    ▸
                  </Text>
                </View>

                <View
                  style={[styles.heapBox, isSelected && styles.heapBoxActive]}
                >
                  <View style={styles.heapHeader}>
                    <Text style={styles.heapAddress}>{item.address}</Text>
                    <View style={styles.heapTypePill}>
                      <Text style={styles.heapType}>{item.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.heapValue} numberOfLines={1}>
                    {item.value}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {data[safeMemoryIndex] && (
            <View style={styles.explainerCard}>
              <View style={styles.explainerHeaderRow}>
                <Text style={styles.explainerBadge}>INSPECTING SLOT</Text>
                <Text style={styles.explainerStepCount}>
                  Object {safeMemoryIndex + 1} of {data.length}
                </Text>
              </View>
              <Text style={styles.explainerTitle}>
                How Python stores `{data[safeMemoryIndex].label}` in RAM
              </Text>
              <Text style={styles.explainerText}>
                Python allocates a heap object at address{" "}
                <Text style={styles.highlightAddress}>
                  {data[safeMemoryIndex].address}
                </Text>{" "}
                holding the{" "}
                <Text style={styles.highlightType}>
                  {data[safeMemoryIndex].type}
                </Text>{" "}
                value{" "}
                <Text style={styles.highlightValue}>
                  {data[safeMemoryIndex].value}
                </Text>
                , and binds the stack identifier{" "}
                <Text style={styles.highlight}>
                  {data[safeMemoryIndex].label}
                </Text>{" "}
                to point to that address.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ARRAY OR HASHMAP STEPPER MODE */}
      {(type === "array" || type === "hashmap") && (
        <View style={styles.diagramContainer}>
          <View style={styles.arrayGrid}>
            {data.map((item: any, idx: number) => {
              const isCurrent = idx === safeActiveIndex;
              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.arrayCell,
                    isCurrent && styles.activeArrayCell,
                  ]}
                  onPress={() => handleSelectStep(idx)}
                >
                  <View style={styles.cellHeader}>
                    <Text
                      style={[
                        styles.cellIndex,
                        isCurrent && { color: StudioColors.amber },
                      ]}
                    >
                      {type === "hashmap" ? item.label : `IDX [${idx}]`}
                    </Text>
                    {item.address ? (
                      <Text style={styles.cellAddress}>{item.address}</Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.cellValue,
                      isCurrent && styles.activeCellValue,
                    ]}
                  >
                    {item.value}
                  </Text>
                  {isCurrent && (
                    <View style={styles.pointerTag}>
                      <Text style={styles.pointerTagText}>▲ POINTER</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.explainerCard}>
            <View style={styles.explainerHeaderRow}>
              <Text style={styles.explainerBadge}>
                {type === "hashmap" ? "HASH LOOKUP" : "ITERATION TRACE"}
              </Text>
              <Text style={styles.explainerStepCount}>
                Step {safeActiveIndex + 1} of {data.length}
              </Text>
            </View>
            <Text style={styles.explainerTitle}>
              {type === "hashmap"
                ? `Key Lookup: ${data[safeActiveIndex]?.label}`
                : `Loop Iteration #${safeActiveIndex + 1}`}
            </Text>
            <Text style={styles.explainerText}>
              {type === "hashmap"
                ? `Hashing key ${data[safeActiveIndex]?.label} jumps directly to memory slot ${data[safeActiveIndex]?.address || `bucket[${safeActiveIndex}]`} in O(1) constant time and retrieves ${data[safeActiveIndex]?.value}.`
                : `At index [${safeActiveIndex}], the active pointer reads ${data[safeActiveIndex]?.value}. Use "Step Next ▶" or tap any cell to trace the pointer across contiguous memory.`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 18,
    marginBottom: 20,
    ...HardShadow,
  },
  emptyContainer: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    ...HardShadowSm,
  },
  emptyIcon: {
    backgroundColor: StudioColors.yellow,
    color: StudioColors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
  },
  emptyTitle: {
    color: StudioColors.textPrimary,
    fontSize: 17,
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
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.border,
    paddingBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    letterSpacing: 1.1,
    fontFamily: MonoFont,
  },
  playingPill: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  playingPillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
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
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  columnLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  columnHeaderLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  diagramContainer: {
    gap: 12,
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
    borderColor: StudioColors.border,
    ...HardShadowSm,
  },
  stackBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 120,
  },
  stackBoxActive: {
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.yellow,
  },
  stackLabel: {
    color: StudioColors.textSecondary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
    marginBottom: 4,
  },
  varName: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  dataBus: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  busDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: StudioColors.border,
  },
  busDotActive: {
    backgroundColor: StudioColors.border,
  },
  busLine: {
    flex: 1,
    height: 2,
    backgroundColor: StudioColors.border,
  },
  busLineActive: {
    backgroundColor: StudioColors.border,
    height: 3,
  },
  busIcon: {
    color: StudioColors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: -3,
  },
  busIconActive: {
    color: StudioColors.textPrimary,
  },
  heapBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 155,
  },
  heapBoxActive: {
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.mint,
  },
  heapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  heapAddress: {
    color: StudioColors.textSecondary,
    fontSize: 9,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  heapTypePill: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  heapType: {
    color: StudioColors.textPrimary,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  heapValue: {
    color: StudioColors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
  arrayLabel: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  stepDotsRow: {
    flexDirection: "row",
    gap: 5,
  },
  stepDot: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  stepDotActive: {
    backgroundColor: StudioColors.lime,
    width: 24,
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
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.yellow,
  },
  speedBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  speedBtnTextActive: {
    color: StudioColors.textPrimary,
  },
  stepBtn: {
    backgroundColor: StudioColors.surface,
    paddingHorizontal: 11,
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
    ...HardShadow,
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
  arrayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  arrayCell: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 10,
    padding: 14,
    minWidth: 108,
    position: "relative",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  activeArrayCell: {
    borderWidth: 2,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.yellow,
    ...HardShadowSm,
  },
  cellHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  cellIndex: {
    color: StudioColors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  cellAddress: {
    color: StudioColors.textMuted,
    fontSize: 8,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  cellValue: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  activeCellValue: {
    color: StudioColors.ink,
  },
  pointerTag: {
    position: "absolute",
    bottom: -9,
    alignSelf: "center",
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointerTagText: {
    color: StudioColors.lime,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    fontFamily: MonoFont,
  },
  explainerCard: {
    backgroundColor: StudioColors.bg,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    marginTop: 6,
  },
  explainerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  explainerBadge: {
    backgroundColor: StudioColors.yellow,
    color: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
    fontFamily: MonoFont,
  },
  explainerStepCount: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  explainerTitle: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  explainerText: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  highlight: {
    color: StudioColors.textPrimary,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  highlightAddress: {
    color: StudioColors.sky,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  highlightType: {
    color: StudioColors.indigo,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  highlightValue: {
    color: StudioColors.emerald,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
});
