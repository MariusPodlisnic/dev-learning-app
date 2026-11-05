import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface HintAccordionProps {
  hints: string[];
}

export default function HintAccordion({ hints }: HintAccordionProps) {
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  if (!hints || hints.length === 0) return null;

  function renderFormattedHint(hint: string) {
    const cleaned = hint.replace(/\\n/g, "\n");
    const parts = cleaned.split(/(`[^`]+`)/g);
    return (
      <Text style={styles.hintText}>
        {parts.map((part, i) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <Text key={i} style={styles.inlineCode}>
              {part.slice(1, -1)}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          ),
        )}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 STUCK ON THE ASSIGNMENT?</Text>
        <Text style={styles.countText}>
          {unlockedCount} of {hints.length} Hints Revealed
        </Text>
      </View>

      <View style={styles.hintList}>
        {hints.slice(0, unlockedCount).map((hint, index) => (
          <View key={index} style={styles.hintCard}>
            <Text style={styles.hintNumber}>Hint {index + 1}</Text>
            {renderFormattedHint(hint)}
          </View>
        ))}
      </View>

      {unlockedCount < hints.length && (
        <Pressable
          style={styles.unlockBtn}
          onPress={() => setUnlockedCount((prev) => prev + 1)}
        >
          <Text style={styles.unlockBtnText}>
            🔓 Show {unlockedCount === 0 ? "First Hint" : "Next Hint"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F1524",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
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
    backgroundColor: "#131C2D",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  hintNumber: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  hintText: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
  },
  inlineCode: {
    backgroundColor: "#1E293B",
    color: "#38BDF8",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  unlockBtn: {
    backgroundColor: "#1E293B",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  unlockBtnText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
});
