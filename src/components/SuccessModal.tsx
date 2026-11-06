import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";

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
        <Text style={styles.emoji}>✓</Text>
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusPillText}>ALL ASSERTIONS PASSED</Text>
      </View>

      <Text style={styles.title}>Chapter Mastered</Text>
      <Text style={styles.subtitle}>
        You verified all requirements for{" "}
        <Text style={styles.highlight}>{lessonTitle}</Text>
      </Text>

      <View style={styles.rewardBox}>
        <View style={styles.rewardCol}>
          <Text style={styles.rewardLabel}>EXPERIENCE EARNED</Text>
          <Text style={styles.rewardText}>+{xpEarned} XP</Text>
        </View>
        <View style={styles.rewardDivider} />
        <View style={styles.rewardCol}>
          <Text style={styles.rewardLabel}>STATUS</Text>
          <Text style={styles.rewardStatusText}>VERIFIED</Text>
        </View>
      </View>

      {hasNextLesson ? (
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={onNextLesson}
        >
          <Text style={styles.nextBtnText}>CONTINUE TO NEXT CHAPTER →</Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={onClose}
        >
          <Text style={styles.nextBtnText}>RETURN TO CURRICULUM →</Text>
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
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    width: 390,
    maxWidth: "92%",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    ...HardShadow,
  },
  topGlowBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: StudioColors.lime,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.border,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
    ...HardShadowSm,
  },
  emoji: {
    color: StudioColors.ink,
    fontSize: 26,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  statusPill: {
    backgroundColor: StudioColors.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    marginBottom: 10,
  },
  statusPillText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    fontFamily: MonoFont,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  highlight: {
    color: StudioColors.textPrimary,
    fontWeight: "900",
  },
  rewardBox: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: StudioColors.bg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
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
    width: 2,
    height: 30,
    backgroundColor: StudioColors.border,
  },
  rewardLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    fontFamily: MonoFont,
  },
  rewardText: {
    color: StudioColors.textPrimary,
    fontSize: 19,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  rewardStatusText: {
    color: StudioColors.emerald,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  nextBtn: {
    backgroundColor: StudioColors.lime,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    ...HardShadowHero,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  nextBtnText: {
    color: StudioColors.ink,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.6,
    fontFamily: MonoFont,
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
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
});
