import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  loading: boolean;
}

export default function PaywallModal({
  onClose,
  onUpgrade,
  loading,
}: PaywallModalProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.badge}>DEVLEARN PRO</Text>
      <Text style={styles.title}>Unlock Advanced Engineering Tracks</Text>
      <Text style={styles.subtitle}>
        Get unlimited access to LeetCode-style algorithm problems and system
        architecture scenario sandboxes.
      </Text>

      <View style={styles.featuresList}>
        <Text style={styles.featureItem}>
          ⚡ 45+ Interactive Algorithm Challenges
        </Text>
        <Text style={styles.featureItem}>
          📐 System Design & Scalability Sandbox
        </Text>
        <Text style={styles.featureItem}>📱 Mobile App Code Flashcards</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>$9.99</Text>
        <Text style={styles.period}>/ month</Text>
      </View>

      <Pressable
        style={styles.upgradeBtn}
        onPress={onUpgrade}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.upgradeBtnText}>Start Pro Membership</Text>
        )}
      </Pressable>

      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Maybe Later</Text>
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
    width: 360,
    alignItems: "center",
  },
  badge: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  featuresList: {
    alignSelf: "stretch",
    marginBottom: 20,
    gap: 8,
  },
  featureItem: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  price: {
    color: "#F8FAFC",
    fontSize: 32,
    fontWeight: "800",
  },
  period: {
    color: "#94A3B8",
    fontSize: 14,
    marginLeft: 4,
  },
  upgradeBtn: {
    backgroundColor: "#2563EB",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  upgradeBtnText: {
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
