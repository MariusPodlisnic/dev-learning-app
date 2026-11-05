import { Platform, StyleSheet, Text, View } from "react-native";

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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pulseIcon}>🔴</Text>
          <Text style={styles.title}>LIVE HEAP INSPECTOR</Text>
        </View>
        <Text style={styles.hexCode}>
          ADDR: 0x
          {Math.floor(Math.random() * 1000000)
            .toString(16)
            .toUpperCase()}
        </Text>
      </View>

      {/* Memory Reference Diagram */}
      {type === "memory" && Array.isArray(data) && (
        <View style={styles.diagramContainer}>
          {data.map((item: MemoryItem, idx: number) => (
            <View key={idx} style={styles.memoryRow}>
              {/* Stack Variable */}
              <View style={styles.stackBox}>
                <Text style={styles.stackLabel}>STACK</Text>
                <Text style={styles.varName}>{item.label}</Text>
              </View>

              {/* Data Bus Arrow */}
              <View style={styles.dataBus}>
                <View style={styles.busLine} />
                <Text style={styles.busIcon}>▶</Text>
              </View>

              {/* Heap Object */}
              <View style={styles.heapBox}>
                <View style={styles.heapHeader}>
                  <Text style={styles.heapAddress}>{item.address}</Text>
                  <Text style={styles.heapType}>{item.type}</Text>
                </View>
                <Text style={styles.heapValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Array/List Contiguous Memory Diagram */}
      {(type === "array" || type === "hashmap") && Array.isArray(data) && (
        <View style={styles.diagramContainer}>
          <Text style={styles.arrayLabel}>CONTIGUOUS MEMORY ALLOCATION</Text>
          <View style={styles.arrayGrid}>
            {data.map((item: ArrayItem, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.arrayCell,
                  item.active && styles.activeArrayCell,
                ]}
              >
                <View style={styles.cellHeader}>
                  <Text style={styles.cellIndex}>
                    {type === "hashmap" ? "KEY" : `IDX ${item.index}`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cellValue,
                    item.active && styles.activeCellValue,
                  ]}
                >
                  {item.value}
                </Text>
                {item.active && (
                  <View style={styles.pointerTag}>
                    <Text style={styles.pointerTagText}>▲ PTR</Text>
                  </View>
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
    backgroundColor: "#05070A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#38BDF8",
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
    letterSpacing: 2,
  },
  hexCode: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  diagramContainer: {
    gap: 16,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackBox: {
    backgroundColor: "#131C2D",
    borderWidth: 1,
    borderColor: "#223049",
    borderRadius: 8,
    padding: 12,
    width: 110,
    alignItems: "center",
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
  busIcon: {
    color: "#38BDF8",
    fontSize: 12,
    marginLeft: -4,
  },
  heapBox: {
    backgroundColor: "#064E3B15",
    borderWidth: 1,
    borderColor: "#05966950",
    borderRadius: 8,
    padding: 12,
    width: 140,
  },
  heapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heapAddress: {
    color: "#34D399",
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  heapType: {
    color: "#059669",
    fontSize: 9,
    fontWeight: "800",
    backgroundColor: "#064E3B",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  heapValue: {
    color: "#A3E635",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  arrayLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  arrayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  arrayCell: {
    backgroundColor: "#131C2D",
    borderWidth: 1,
    borderColor: "#223049",
    borderRadius: 8,
    padding: 12,
    minWidth: 90,
    position: "relative",
  },
  activeArrayCell: {
    borderColor: "#38BDF8",
    backgroundColor: "#0284C720",
    shadowColor: "#38BDF8",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cellHeader: {
    marginBottom: 8,
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
    bottom: -10,
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
});
