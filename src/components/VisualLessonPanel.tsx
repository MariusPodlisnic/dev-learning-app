import { StyleSheet, Text, View } from "react-native";

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
  if (!data) return null;

  return (
    <View style={styles.container}>
      <View style={styles.badgeHeader}>
        <Text style={styles.badgeTitle}>💡 LIVE CONCEPT VISUALIZER</Text>
        <Text style={styles.badgeSubtitle}>
          {type === "memory"
            ? "RAM Object Allocations"
            : "Contiguous Array Slots & Iteration"}
        </Text>
      </View>

      {/* Memory Reference Diagram */}
      {type === "memory" && Array.isArray(data) && (
        <View style={styles.memoryContainer}>
          {data.map((item: MemoryItem, idx: number) => (
            <View key={idx} style={styles.memoryRow}>
              {/* Variable Reference Name */}
              <View style={styles.pointerBox}>
                <Text style={styles.pointerName}>{item.label}</Text>
                <Text style={styles.pointerType}>ref ({item.type})</Text>
              </View>

              {/* Arrow Connector */}
              <Text style={styles.arrowText}>──►</Text>

              {/* Memory Heap Object */}
              <View style={styles.heapObject}>
                <Text style={styles.addressText}>{item.address}</Text>
                <Text style={styles.heapValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Array Pointer Diagram */}
      {type === "array" && Array.isArray(data) && (
        <View style={styles.arrayContainer}>
          <Text style={styles.arrayTitle}>List Structure in Memory:</Text>
          <View style={styles.arrayGrid}>
            {data.map((item: ArrayItem, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.arrayCell,
                  item.active && styles.activeArrayCell,
                ]}
              >
                <Text style={styles.indexLabel}>Index [{item.index}]</Text>
                <Text style={styles.cellValue}>{item.value}</Text>
                {item.active && (
                  <Text style={styles.pointerMarker}>▲ Current Iteration</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 16,
    marginBottom: 20,
  },
  badgeHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    paddingBottom: 8,
  },
  badgeTitle: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  badgeSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  memoryContainer: {
    gap: 12,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pointerBox: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 100,
  },
  pointerName: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 14,
  },
  pointerType: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },
  arrowText: {
    color: "#38BDF8",
    fontWeight: "800",
    fontSize: 16,
  },
  heapObject: {
    backgroundColor: "#020617",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
    flex: 1,
  },
  addressText: {
    color: "#059669",
    fontSize: 10,
    fontFamily: "monospace",
  },
  heapValue: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    fontFamily: "monospace",
  },
  arrayContainer: {
    gap: 8,
  },
  arrayTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  arrayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  arrayCell: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 100,
    alignItems: "center",
  },
  activeArrayCell: {
    borderColor: "#38BDF8",
    backgroundColor: "#0284C720",
  },
  indexLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },
  cellValue: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "600",
    marginVertical: 4,
    fontFamily: "monospace",
  },
  pointerMarker: {
    color: "#38BDF8",
    fontSize: 9,
    fontWeight: "800",
  },
});
