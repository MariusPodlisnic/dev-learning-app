import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MonoFont, StudioColors } from "../constants/theme";

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  loading: boolean;
}

const PRO_FEATURES = [
  {
    icon: "⚡",
    title: "45+ Algorithm & Data Structure Challenges",
    desc: "Step-by-step memory visualizations and Big-O complexity checks",
  },
  {
    icon: "🛰️",
    title: "System Design & Scalability Sandboxes",
    desc: "Load balancers, caching layers, sharding & high-availability labs",
  },
  {
    icon: "🔓",
    title: "Unlimited Hints & Solution Walkthroughs",
    desc: "Never get stuck with progressive hints and line-by-line breakdowns",
  },
];

export default function PaywallModal({
  onClose,
  onUpgrade,
  loading,
}: PaywallModalProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topAccentBar} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>⭐ DEVLEARN PRO</Text>
      </View>

      <Text style={styles.title}>Unlock Full Engineering Mastery</Text>
      <Text style={styles.subtitle}>
        Accelerate your interview prep and production engineering skills with
        unrestricted access to all tracks.
      </Text>

      <View style={styles.featuresList}>
        {PRO_FEATURES.map((feat, idx) => (
          <View key={idx} style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <Text style={styles.featureIcon}>{feat.icon}</Text>
            </View>
            <View style={styles.featureTextGroup}>
              <Text style={styles.featureTitle}>{feat.title}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.priceBox}>
        <View>
          <Text style={styles.planLabel}>PRO MONTHLY PASS</Text>
          <Text style={styles.cancelAnytime}>Cancel anytime · Instant access</Text>
        </View>
        <View style={styles.priceRight}>
          <Text style={styles.price}>$9.99</Text>
          <Text style={styles.period}>/mo</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.upgradeBtn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        ]}
        onPress={onUpgrade}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={StudioColors.bg} />
        ) : (
          <Text style={styles.upgradeBtnText}>Unlock All Tracks Now ➔</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
        onPress={onClose}
      >
        <Text style={styles.closeBtnText}>Continue with Free Modules</Text>
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
    borderColor: StudioColors.amberBorder,
    width: 400,
    maxWidth: "92%",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: StudioColors.amber,
  },
  badge: {
    backgroundColor: StudioColors.amberSoft,
    borderWidth: 1,
    borderColor: StudioColors.amberBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 14,
  },
  badgeText: {
    color: StudioColors.amber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
  },
  featuresList: {
    alignSelf: "stretch",
    marginBottom: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: StudioColors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: StudioColors.border,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 15,
  },
  featureTextGroup: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  featureDesc: {
    color: StudioColors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  priceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: StudioColors.bg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: StudioColors.border,
    marginBottom: 18,
  },
  planLabel: {
    color: StudioColors.amber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cancelAnytime: {
    color: StudioColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  priceRight: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    color: StudioColors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  period: {
    color: StudioColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 2,
  },
  upgradeBtn: {
    backgroundColor: StudioColors.amber,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  upgradeBtnText: {
    color: StudioColors.bg,
    fontWeight: "900",
    fontSize: 14,
  },
  closeBtn: {
    marginTop: 14,
    padding: 6,
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
