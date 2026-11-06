import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MonoFont, StudioColors } from "../constants/theme";

interface HintAccordionProps {
  hints: string[];
}

export default function HintAccordion({ hints }: HintAccordionProps) {
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  useEffect(() => {
    setUnlockedCount(0);
  }, [hints]);

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
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>💡</Text>
          </View>
          <View>
            <Text style={styles.title}>PROGRESSIVE HINTS</Text>
            <Text style={styles.subtitle}>
              Need a nudge? Reveal step-by-step clues without spoiling the full
              answer.
            </Text>
          </View>
        </View>

        <View style={styles.progressGroup}>
          <View style={styles.dotsRow}>
            {hints.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.hintDot,
                  i < unlockedCount && styles.hintDotUnlocked,
                ]}
              />
            ))}
          </View>
          <Text style={styles.countText}>
            {unlockedCount}/{hints.length}
          </Text>
        </View>
      </View>

      {unlockedCount > 0 && (
        <View style={styles.hintList}>
          {hints.slice(0, unlockedCount).map((hint, index) => (
            <View key={index} style={styles.hintCard}>
              <View style={styles.hintCardHeader}>
                <Text style={styles.hintNumber}>HINT 0{index + 1}</Text>
                <Text style={styles.hintUnlockedTag}>REVEALED</Text>
              </View>
              {renderFormattedHint(hint)}
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        {unlockedCount < hints.length ? (
          <Pressable
            style={styles.unlockBtn}
            onPress={() => setUnlockedCount((prev) => prev + 1)}
          >
            <Text style={styles.unlockBtnText}>
              🔓 Reveal {unlockedCount === 0 ? "First Hint" : `Hint #${unlockedCount + 1}`}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.resetHintsBtn}
            onPress={() => setUnlockedCount(0)}
          >
            <Text style={styles.resetHintsText}>Hide Hints</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: StudioColors.border,
    padding: 16,
    marginTop: 4,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: StudioColors.amberSoft,
    borderWidth: 1,
    borderColor: StudioColors.amberBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
  },
  title: {
    color: StudioColors.amber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  progressGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: StudioColors.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: StudioColors.border,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 4,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: StudioColors.borderStrong,
  },
  hintDotUnlocked: {
    backgroundColor: StudioColors.amber,
  },
  countText: {
    color: StudioColors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  hintList: {
    gap: 10,
    marginTop: 14,
  },
  hintCard: {
    backgroundColor: StudioColors.bg,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: StudioColors.border,
    borderLeftWidth: 3,
    borderLeftColor: StudioColors.amber,
  },
  hintCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  hintNumber: {
    color: StudioColors.amber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  hintUnlockedTag: {
    color: StudioColors.textDim,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  hintText: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  inlineCode: {
    backgroundColor: StudioColors.surfaceElevated,
    color: StudioColors.amber,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  actionsRow: {
    marginTop: 14,
  },
  unlockBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1,
    borderColor: StudioColors.amberBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  unlockBtnText: {
    color: StudioColors.amber,
    fontSize: 12,
    fontWeight: "800",
  },
  resetHintsBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1,
    borderColor: StudioColors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  resetHintsText: {
    color: StudioColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
});
