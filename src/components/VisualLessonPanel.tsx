import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MonoFont, StudioColors } from "../constants/theme";

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

  useEffect(() => {
    setActiveIndex(0);
    setSelectedMemoryIndex(0);
  }, [data, type]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🧠</Text>
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

  function handleNextStep() {
    setActiveIndex((prev) => (prev + 1) % data.length);
  }

  function handlePrevStep() {
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  }

  return (
    <View style={styles.container}>
      {/* Top Visualizer Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.title}>MEMORY & EXECUTION INSPECTOR</Text>
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
                onPress={() => setSelectedMemoryIndex(idx)}
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
          <View style={styles.controlsBar}>
            <View style={styles.controlsLeft}>
              <Text style={styles.arrayLabel}>
                {type === "hashmap"
                  ? "KEY-VALUE BUCKETS"
                  : `POINTER AT INDEX [${safeActiveIndex}]`}
              </Text>
              <View style={styles.stepDotsRow}>
                {data.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.stepDot,
                      i === safeActiveIndex && styles.stepDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.stepperBtns}>
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
                  onPress={() => setActiveIndex(idx)}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: StudioColors.border,
    padding: 18,
    marginBottom: 20,
  },
  emptyContainer: {
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: StudioColors.border,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  emptyTitle: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyDesc: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 380,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: StudioColors.emerald,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  modeBadge: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1,
    borderColor: StudioColors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeBadgeText: {
    color: StudioColors.amber,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  columnLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  columnHeaderLabel: {
    color: StudioColors.textDim,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  diagramContainer: {
    gap: 12,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: StudioColors.bg,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  memoryRowActive: {
    backgroundColor: StudioColors.surfaceElevated,
    borderColor: StudioColors.amberBorder,
  },
  stackBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 120,
  },
  stackBoxActive: {
    borderColor: StudioColors.amber,
    backgroundColor: StudioColors.amberSoft,
  },
  stackLabel: {
    color: StudioColors.textMuted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  varName: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  dataBus: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  busDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: StudioColors.borderStrong,
  },
  busDotActive: {
    backgroundColor: StudioColors.amber,
  },
  busLine: {
    flex: 1,
    height: 2,
    backgroundColor: StudioColors.borderStrong,
  },
  busLineActive: {
    backgroundColor: StudioColors.amber,
  },
  busIcon: {
    color: StudioColors.textDim,
    fontSize: 14,
    marginLeft: -3,
  },
  busIconActive: {
    color: StudioColors.amber,
  },
  heapBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 155,
  },
  heapBoxActive: {
    borderColor: StudioColors.emerald,
    backgroundColor: StudioColors.emeraldSoft,
  },
  heapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  heapAddress: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontFamily: MonoFont,
    fontWeight: "700",
  },
  heapTypePill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1,
    borderColor: StudioColors.emeraldBorder,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  heapType: {
    color: StudioColors.emeraldLight,
    fontSize: 9,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  heapValue: {
    color: StudioColors.emeraldLight,
    fontSize: 14,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 10,
  },
  controlsLeft: {
    gap: 6,
  },
  arrayLabel: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  stepDotsRow: {
    flexDirection: "row",
    gap: 5,
  },
  stepDot: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: StudioColors.borderStrong,
  },
  stepDotActive: {
    backgroundColor: StudioColors.amber,
    width: 22,
  },
  stepperBtns: {
    flexDirection: "row",
    gap: 8,
  },
  stepBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: StudioColors.borderStrong,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  stepBtnPrimary: {
    backgroundColor: StudioColors.amber,
    borderColor: StudioColors.amber,
  },
  stepBtnText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  stepBtnTextPrimary: {
    color: StudioColors.bg,
    fontSize: 11,
    fontWeight: "900",
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
    borderColor: StudioColors.amber,
    backgroundColor: StudioColors.amberSoft,
  },
  cellHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  cellIndex: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  cellAddress: {
    color: StudioColors.textDim,
    fontSize: 8,
    fontFamily: MonoFont,
  },
  cellValue: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  activeCellValue: {
    color: StudioColors.amber,
  },
  pointerTag: {
    position: "absolute",
    bottom: -9,
    alignSelf: "center",
    backgroundColor: StudioColors.amber,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointerTagText: {
    color: StudioColors.bg,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  explainerCard: {
    backgroundColor: StudioColors.bg,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderLeftWidth: 3,
    borderLeftColor: StudioColors.amber,
    marginTop: 6,
  },
  explainerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  explainerBadge: {
    color: StudioColors.amber,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  explainerStepCount: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontFamily: MonoFont,
    fontWeight: "700",
  },
  explainerTitle: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  explainerText: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  highlight: {
    color: StudioColors.textPrimary,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  highlightAddress: {
    color: StudioColors.sky,
    fontWeight: "700",
    fontFamily: MonoFont,
  },
  highlightType: {
    color: StudioColors.indigoLight,
    fontWeight: "700",
    fontFamily: MonoFont,
  },
  highlightValue: {
    color: StudioColors.emeraldLight,
    fontWeight: "700",
    fontFamily: MonoFont,
  },
});
