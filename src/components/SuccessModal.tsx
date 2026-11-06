import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MonoFont, StudioColors } from "../constants/theme";

interface SuccessModalProps {
  xpEarned: number;
  lessonTitle: string;
  hasNextLesson: boolean;
  onNextLesson: () => void;
  onClose: () => void;
}

export default function SuccessModal({
  xpEarned,
  lessonTitle,
  hasNextLesson,
  onNextLesson,
  onClose,
}: SuccessModalProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topGlowBar} />

      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>🎉</Text>
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusPillText}>✓ ALL CHECKS PASSED</Text>
      </View>

      <Text style={styles.title}>Challenge Solved!</Text>
      <Text style={styles.subtitle}>
        You mastered <Text style={styles.highlight}>{lessonTitle}</Text>
      </Text>

      <View style={styles.rewardBox}>
        <View style={styles.rewardCol}>
          <Text style={styles.rewardLabel}>EXPERIENCE EARNED</Text>
          <Text style={styles.rewardText}>+{xpEarned} XP</Text>
        </View>
        <View style={styles.rewardDivider} />
        <View style={styles.rewardCol}>
          <Text style={styles.rewardLabel}>STATUS</Text>
          <Text style={styles.rewardStatusText}>Mastered</Text>
        </View>
      </View>

      {hasNextLesson ? (
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          onPress={onNextLesson}
        >
          <Text style={styles.nextBtnText}>Continue to Next Module ➔</Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          onPress={onClose}
        >
          <Text style={styles.nextBtnText}>Return to Skill Tree ➔</Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
        onPress={onClose}
      >
        <Text style={styles.closeBtnText}>Stay & Review Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: StudioColors.emeraldBorder,
    width: 360,
    maxWidth: "92%",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  topGlowBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: StudioColors.emerald,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: StudioColors.emeraldSoft,
    borderWidth: 1,
    borderColor: StudioColors.emeraldBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emoji: {
    fontSize: 32,
  },
  statusPill: {
    backgroundColor: StudioColors.emeraldSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: StudioColors.emeraldBorder,
    marginBottom: 10,
  },
  statusPillText: {
    color: StudioColors.emeraldLight,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
  },
  highlight: {
    color: StudioColors.textPrimary,
    fontWeight: "700",
  },
  rewardBox: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: StudioColors.surfaceElevated,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: StudioColors.border,
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 22,
  },
  rewardCol: {
    alignItems: "center",
    gap: 4,
  },
  rewardDivider: {
    width: 1,
    height: 30,
    backgroundColor: StudioColors.border,
  },
  rewardLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  rewardText: {
    color: StudioColors.amber,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  rewardStatusText: {
    color: StudioColors.emeraldLight,
    fontSize: 15,
    fontWeight: "800",
  },
  nextBtn: {
    backgroundColor: StudioColors.emerald,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  nextBtnText: {
    color: StudioColors.bg,
    fontWeight: "900",
    fontSize: 14,
  },
  closeBtn: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  closeBtnText: {
    color: StudioColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});
