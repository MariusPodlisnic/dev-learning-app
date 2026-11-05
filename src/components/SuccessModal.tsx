import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

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
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Challenge Solved!</Text>
      <Text style={styles.subtitle}>
        You mastered <Text style={styles.highlight}>{lessonTitle}</Text>
      </Text>

      <View style={styles.rewardBox}>
        <Text style={styles.rewardLabel}>REWARD</Text>
        <Text style={styles.rewardText}>+{xpEarned} XP</Text>
      </View>

      {hasNextLesson ? (
        <Pressable style={styles.nextBtn} onPress={onNextLesson}>
          <Text style={styles.nextBtnText}>Next Lesson ➔</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.nextBtn} onPress={onClose}>
          <Text style={styles.nextBtnText}>Complete Track</Text>
        </Pressable>
      )}

      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Review Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    width: 340,
    alignItems: "center",
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  highlight: {
    color: "#38BDF8",
    fontWeight: "700",
  },
  rewardBox: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#10B981",
    alignItems: "center",
    marginBottom: 20,
  },
  rewardLabel: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  rewardText: {
    color: "#34D399",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  nextBtn: {
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  closeBtn: {
    marginTop: 12,
    padding: 6,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  closeBtnText: {
    color: "#64748B",
    fontSize: 13,
  },
});
