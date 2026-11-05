import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface MemoryItem {
  label: string;
  value: string;
  type: string;
  address: string;
}

interface ArrayItem {
  index: number;
  value: string;
  active?: boolean;
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

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  function handleNextStep() {
    setActiveIndex((prev) => (prev + 1) % data.length);
  }

  function handlePrevStep() {
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pulseIcon}>🟢</Text>
          <Text style={styles.title}>INTERACTIVE MEMORY SIMULATOR</Text>
        </View>
        <Text style={styles.subtitle}>Click items below to inspect</Text>
      </View>

      {type === "memory" && (
        <View style={styles.diagramContainer}>
          {data.map((item: MemoryItem, idx: number) => {
            const isSelected = selectedMemoryIndex === idx;
            return (
              <Pressable
                key={idx}
                style={[styles.memoryRow, isSelected && styles.memoryRowActive]}
                onPress={() => setSelectedMemoryIndex(idx)}
              >
                <View
                  style={[styles.stackBox, isSelected && styles.stackBoxActive]}
                >
                  <Text style={styles.stackLabel}>VARIABLE</Text>
                  <Text style={styles.varName}>{item.label}</Text>
                </View>

                <View style={styles.dataBus}>
                  <View
                    style={[styles.busLine, isSelected && styles.busLineActive]}
                  />
                  <Text
                    style={[styles.busIcon, isSelected && styles.busIconActive]}
                  >
                    ▶
                  </Text>
                </View>

                <View
                  style={[styles.heapBox, isSelected && styles.heapBoxActive]}
                >
                  <View style={styles.heapHeader}>
                    <Text style={styles.heapAddress}>{item.address}</Text>
                    <Text style={styles.heapType}>{item.type}</Text>
                  </View>
                  <Text style={styles.heapValue}>{item.value}</Text>
                </View>
              </Pressable>
            );
          })}

          {data[selectedMemoryIndex] && (
            <View style={styles.explainerCard}>
              <Text style={styles.explainerTitle}>
                🔍 What happens in RAM for `{data[selectedMemoryIndex].label}`?
              </Text>
              <Text style={styles.explainerText}>
                Python allocates memory at address{" "}
                <Text style={styles.highlight}>
                  {data[selectedMemoryIndex].address}
                </Text>{" "}
                to store the{" "}
                <Text style={styles.highlight}>
                  {data[selectedMemoryIndex].type}
                </Text>{" "}
                value{" "}
                <Text style={styles.highlight}>
                  {data[selectedMemoryIndex].value}
                </Text>
                , and links the label{" "}
                <Text style={styles.highlight}>
                  {data[selectedMemoryIndex].label}
                </Text>{" "}
                directly to it.
              </Text>
            </View>
          )}
        </View>
      )}

      {(type === "array" || type === "hashmap") && (
        <View style={styles.diagramContainer}>
          <View style={styles.controlsBar}>
            <Text style={styles.arrayLabel}>
              {type === "hashmap"
                ? "KEY-VALUE HASH TABLE"
                : `LOOP STEPPER (INDEX ${activeIndex})`}
            </Text>
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
              const isCurrent = idx === activeIndex;
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
                    <Text style={styles.cellIndex}>
                      {type === "hashmap" ? item.label : `INDEX [${idx}]`}
                    </Text>
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
                      <Text style={styles.pointerTagText}>▲ ACTIVE</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.explainerCard}>
            <Text style={styles.explainerTitle}>
              {type === "hashmap"
                ? `🔑 Key Lookup: ${data[activeIndex]?.label}`
                : `🔄 Loop Iteration #${activeIndex + 1}`}
            </Text>
            <Text style={styles.explainerText}>
              {type === "hashmap"
                ? `Looking up key ${data[activeIndex]?.label} jumps straight to address ${data[activeIndex]?.address} in O(1) constant time and returns ${data[activeIndex]?.value}.`
                : `At index [${activeIndex}], the loop variable holds ${data[activeIndex]?.value}. Clicking "Step Next ▶" advances the pointer to the next slot in memory.`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#05070A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A2133",
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulseIcon: {
    fontSize: 10,
  },
  title: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 11,
  },
  diagramContainer: {
    gap: 14,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  memoryRowActive: {
    backgroundColor: "#0F172A",
    borderColor: "#1E293B",
  },
  stackBox: {
    backgroundColor: "#131C2D",
    borderWidth: 1,
    borderColor: "#223049",
    borderRadius: 8,
    padding: 12,
    width: 115,
    alignItems: "center",
  },
  stackBoxActive: {
    borderColor: "#38BDF8",
  },
  stackLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  varName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  dataBus: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  busLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#223049",
  },
  busLineActive: {
    backgroundColor: "#38BDF8",
  },
  busIcon: {
    color: "#475569",
    fontSize: 12,
    marginLeft: -4,
  },
  busIconActive: {
    color: "#38BDF8",
  },
  heapBox: {
    backgroundColor: "#064E3B15",
    borderWidth: 1,
    borderColor: "#05966950",
    borderRadius: 8,
    padding: 12,
    width: 150,
  },
  heapBoxActive: {
    borderColor: "#10B981",
    backgroundColor: "#064E3B35",
  },
  heapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  heapAddress: {
    color: "#34D399",
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  heapType: {
    color: "#34D399",
    fontSize: 9,
    fontWeight: "800",
    backgroundColor: "#064E3B",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  heapValue: {
    color: "#A3E635",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  arrayLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  stepperBtns: {
    flexDirection: "row",
    gap: 8,
  },
  stepBtn: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#223049",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  stepBtnPrimary: {
    backgroundColor: "#2563EB",
    borderColor: "#3B82F6",
  },
  stepBtnText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  stepBtnTextPrimary: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  arrayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 8,
  },
  arrayCell: {
    backgroundColor: "#131C2D",
    borderWidth: 1,
    borderColor: "#223049",
    borderRadius: 8,
    padding: 14,
    minWidth: 105,
    position: "relative",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  activeArrayCell: {
    borderColor: "#38BDF8",
    backgroundColor: "#0284C725",
  },
  cellHeader: {
    marginBottom: 6,
  },
  cellIndex: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cellValue: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  activeCellValue: {
    color: "#38BDF8",
  },
  pointerTag: {
    position: "absolute",
    bottom: -9,
    alignSelf: "center",
    backgroundColor: "#38BDF8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointerTagText: {
    color: "#0F172A",
    fontSize: 8,
    fontWeight: "900",
  },
  explainerCard: {
    backgroundColor: "#0F172A",
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
    marginTop: 6,
  },
  explainerTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  explainerText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
  highlight: {
    color: "#38BDF8",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
