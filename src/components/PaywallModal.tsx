import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  MonoFont,
  StudioColors,
} from "../constants/theme";

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  loading: boolean;
}

const PRO_FEATURES = [
  {
    icon: "01",
    title: "Algorithm & Data Structure Curriculum",
    desc: "Step-by-step memory visualizations and Big-O complexity verification",
  },
  {
    icon: "02",
    title: "System Design & Scalability Sandboxes",
    desc: "Load balancers, caching layers, consistent hashing & high-availability labs",
  },
  {
    icon: "03",
    title: "Progressive Hints & Solution Walkthroughs",
    desc: "Unblock yourself with contextual hints and line-by-line engineering breakdowns",
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
        <Text style={styles.badgeText}>EDITION // DEVLEARN PRO</Text>
      </View>

      <Text style={styles.title}>Full Engineering Edition</Text>
      <Text style={styles.subtitle}>
        Accelerate your interview preparation and production engineering skills
        with unrestricted access to every volume.
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
          <Text style={styles.planLabel}>PRO MONTHLY EDITION</Text>
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
          pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
        ]}
        onPress={onUpgrade}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={StudioColors.bg} />
        ) : (
          <Text style={styles.upgradeBtnText}>UNLOCK ALL TRACKS NOW →</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
        onPress={onClose}
      >
        <Text style={styles.closeBtnText}>Continue with Free Chapters</Text>
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
    width: 430,
    maxWidth: "92%",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    ...HardShadow,
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: StudioColors.yellow,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.border,
  },
  badge: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 12,
  },
  badgeText: {
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
    marginBottom: 8,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  featuresList: {
    alignSelf: "stretch",
    marginBottom: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: StudioColors.bg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIcon: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  featureTextGroup: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  featureDesc: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
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
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.border,
    marginBottom: 18,
  },
  planLabel: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  cancelAnytime: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
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
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 2,
  },
  upgradeBtn: {
    backgroundColor: StudioColors.lime,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    ...HardShadowHero,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  upgradeBtnText: {
    color: StudioColors.ink,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  closeBtn: {
    marginTop: 14,
    padding: 6,
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
