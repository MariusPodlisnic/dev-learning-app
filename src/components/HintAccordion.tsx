import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface HintAccordionProps {
  hints: string[];
}

export default function HintAccordion({ hints }: HintAccordionProps) {
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  if (!hints || hints.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 NEED A HINT?</Text>
        <Text style={styles.countText}>
          {unlockedCount} of {hints.length} Unlocked
        </Text>
      </View>

      <View style={styles.hintList}>
        {hints.slice(0, unlockedCount).map((hint, index) => (
          <View key={index} style={styles.hintCard}>
            <Text style={styles.hintNumber}>Hint {index + 1}:</Text>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        ))}
      </View>

      {unlockedCount < hints.length && (
        <Pressable
          style={styles.unlockBtn}
          onPress={() => setUnlockedCount((prev) => prev + 1)}
        >
          <Text style={styles.unlockBtnText}>
            🔓 Reveal {unlockedCount === 0 ? "First Hint" : "Next Hint"}
          </Text>
        </Pressable>
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
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  countText: {
    color: "#64748B",
    fontSize: 11,
  },
  hintList: {
    gap: 8,
    marginBottom: 8,
  },
  hintCard: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  hintNumber: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  hintText: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 18,
  },
  unlockBtn: {
    backgroundColor: "#334155",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 4,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  unlockBtnText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
  },
});
