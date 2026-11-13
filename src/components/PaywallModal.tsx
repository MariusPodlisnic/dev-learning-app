import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { playKeyClick } from "../utils/soundEffects";
import { getDeveloperRank } from "./ProfileStatsModal";

export type PaywallPlanId = "monthly" | "annual" | "lifetime";

export interface PaywallTriggerContext {
  source: "lesson" | "solution" | "arena" | "companion" | "header";
  lessonId?: string;
  lessonTitle?: string;
  track?: string;
}

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: (plan: PaywallPlanId) => void;
  loading: boolean;
  totalModules?: number;
  algoModulesCount?: number;
  sysDesignModulesCount?: number;
  xpPoints?: number;
  completedCount?: number;
  streakCount?: number;
  hasSession?: boolean;
  triggerContext?: PaywallTriggerContext;
  freePreviewLessonTitle?: string;
  onTryFreePreview?: () => void;
}

const PLANS: {
  id: PaywallPlanId;
  label: string;
  price: string;
  period: string;
  subline: string;
  badge?: string;
  ctaLabel: string;
}[] = [
  {
    id: "monthly",
    label: "MONTHLY",
    price: "$9.99",
    period: "/mo",
    subline: "Flexible · Cancel anytime",
    ctaLabel: "UNLOCK MONTHLY PRO ($9.99/MO)",
  },
  {
    id: "annual",
    label: "ANNUAL",
    price: "$4.99",
    period: "/mo",
    subline: "$59 billed yearly · 7-day free trial",
    badge: "SAVE 50%",
    ctaLabel: "START 7-DAY FREE TRIAL",
  },
  {
    id: "lifetime",
    label: "LIFETIME",
    price: "$119",
    period: "once",
    subline: "Pay once · All future tracks",
    badge: "FOUNDER PASS",
    ctaLabel: "UNLOCK LIFETIME PRO ($119)",
  },
];

export default function PaywallModal({
  onClose,
  onUpgrade,
  loading,
  totalModules = 64,
  algoModulesCount = 20,
  sysDesignModulesCount = 20,
  xpPoints = 0,
  completedCount = 0,
  streakCount = 0,
  hasSession = false,
  triggerContext,
  freePreviewLessonTitle,
  onTryFreePreview,
}: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlanId>("annual");
  const activePlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];
  const devRank = getDeveloperRank(xpPoints);

  const proFeatures = [
    {
      icon: "01",
      title: `Algorithms & Data Structures (${algoModulesCount} Labs)`,
      desc: "Step-by-step memory visualizations, sliding windows & Big-O verification",
    },
    {
      icon: "02",
      title: `System Design Sandboxes (${sysDesignModulesCount} Labs)`,
      desc: "Load balancers, LRU caching, rate limiters & distributed sharding",
    },
    {
      icon: "03",
      title: `Verified Solutions & Walkthroughs (${totalModules} Modules)`,
      desc: "1-click official solutions, Pro Bug Hunt incidents & unlimited Speed Blitz",
    },
  ];

  const triggerPillText = (() => {
    if (!triggerContext?.lessonTitle) return null;
    if (triggerContext.source === "solution") {
      return `💡 UNLOCK SOLUTION: ${triggerContext.lessonTitle}`;
    }
    if (triggerContext.source === "arena") {
      return `⚔️ UNLOCK ARENA: ${triggerContext.lessonTitle}`;
    }
    if (triggerContext.source === "companion") {
      return `🐾 UNLOCK PRO PET: ${triggerContext.lessonTitle}`;
    }
    return `🔒 UNLOCK LAB: ${triggerContext.lessonTitle}`;
  })();

  const ctaPrefix = hasSession ? "" : "SIGN IN & ";

  return (
    <View style={styles.card}>
      <View style={styles.topAccentBar} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EDITION // DEVLEARN PRO</Text>
        </View>

        {triggerPillText && (
          <View style={styles.triggerPill}>
            <Text style={styles.triggerPillText} numberOfLines={1}>
              {triggerPillText}
            </Text>
          </View>
        )}

        <Text style={styles.title}>Full Engineering Edition</Text>
        <Text style={styles.subtitle}>
          Accelerate your interview prep and system architecture skills with
          unrestricted access to all {totalModules} interactive modules.
        </Text>

        {(xpPoints > 0 || completedCount > 0) && (
          <View style={styles.momentumBox}>
            <View style={styles.momentumTopRow}>
              <Text style={styles.momentumBadge}>
                ⚡ L{devRank.level}: {devRank.title.toUpperCase()}
              </Text>
              {streakCount > 0 && (
                <Text style={styles.streakPill}>🔥 {streakCount}D STREAK</Text>
              )}
            </View>
            <Text style={styles.momentumCopy}>
              You&apos;ve earned{" "}
              <Text style={styles.momentumBold}>{xpPoints} XP</Text> across{" "}
              <Text style={styles.momentumBold}>
                {completedCount}{" "}
                {completedCount === 1 ? "module" : "modules"}
              </Text>
              . Keep your streak rolling in Algorithms &amp; System Design!
            </Text>
          </View>
        )}

        <View style={styles.featuresList}>
          {proFeatures.map((feat, idx) => (
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

        <Text style={styles.choosePlanHeader}>SELECT YOUR PASS</Text>
        <View style={styles.planGrid}>
          {PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlan;
            return (
              <Pressable
                key={plan.id}
                style={({ pressed }) => [
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setSelectedPlan(plan.id);
                }}
              >
                {plan.badge && (
                  <View
                    style={[
                      styles.planTag,
                      plan.id === "annual"
                        ? { backgroundColor: StudioColors.lime }
                        : { backgroundColor: StudioColors.violet },
                    ]}
                  >
                    <Text style={styles.planTagText}>{plan.badge}</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.planCardLabel,
                    isSelected && styles.planCardLabelSelected,
                  ]}
                >
                  {plan.label}
                </Text>
                <View style={styles.planPriceRow}>
                  <Text
                    style={[
                      styles.planPrice,
                      isSelected && styles.planPriceSelected,
                    ]}
                  >
                    {plan.price}
                  </Text>
                  <Text
                    style={[
                      styles.planPeriod,
                      isSelected && styles.planPeriodSelected,
                    ]}
                  >
                    {plan.period}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.planSubline,
                    isSelected && styles.planSublineSelected,
                  ]}
                >
                  {plan.subline}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.upgradeBtn,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onUpgrade(selectedPlan);
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={StudioColors.ink} />
          ) : (
            <Text style={styles.upgradeBtnText}>
              {ctaPrefix}
              {activePlan.ctaLabel} →
            </Text>
          )}
        </Pressable>

        <Text style={styles.trustMicroCopy}>
          ✓ Instant access to all {totalModules} interactive labs · ✓ Zero
          risk, cancel anytime
        </Text>

        {onTryFreePreview && freePreviewLessonTitle && (
          <Pressable
            style={({ pressed }) => [
              styles.previewBtn,
              pressed && { opacity: 0.85, transform: [{ translateY: 1 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onTryFreePreview();
            }}
          >
            <Text style={styles.previewBtnText} numberOfLines={1}>
              ⚡ Try Free Preview First: {freePreviewLessonTitle} →
            </Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.closeBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={onClose}
        >
          <Text style={styles.closeBtnText}>Continue with Free Chapters</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    width: 470,
    maxWidth: "94%",
    maxHeight: "90%",
    overflow: "hidden",
    position: "relative",
    ...HardShadow,
  },
  topAccentBar: {
    height: 8,
    width: "100%",
    backgroundColor: StudioColors.yellow,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.border,
  },
  scrollArea: {
    width: "100%",
  },
  scrollContent: {
    padding: 22,
    paddingTop: 16,
    alignItems: "center",
  },
  badge: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    fontFamily: MonoFont,
  },
  triggerPill: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    marginBottom: 10,
    maxWidth: "100%",
  },
  triggerPillText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  momentumBox: {
    alignSelf: "stretch",
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 10,
    padding: 11,
    marginBottom: 14,
    gap: 4,
  },
  momentumTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  momentumBadge: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  streakPill: {
    backgroundColor: StudioColors.orange,
    color: StudioColors.ink,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    overflow: "hidden",
  },
  momentumCopy: {
    color: StudioColors.textSecondary,
    fontSize: 11.5,
    fontWeight: "600",
    lineHeight: 16,
  },
  momentumBold: {
    color: StudioColors.textPrimary,
    fontWeight: "900",
  },
  featuresList: {
    alignSelf: "stretch",
    marginBottom: 14,
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: StudioColors.bg,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIcon: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  featureTextGroup: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: StudioColors.textPrimary,
    fontSize: 12.5,
    fontWeight: "800",
  },
  featureDesc: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  choosePlanHeader: {
    alignSelf: "flex-start",
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
    marginBottom: 8,
  },
  planGrid: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 8,
    marginBottom: 14,
  },
  planCard: {
    flex: 1,
    backgroundColor: StudioColors.bg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.borderSubtle,
    padding: 10,
    paddingTop: 14,
    position: "relative",
    alignItems: "flex-start",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  planCardSelected: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  planTag: {
    position: "absolute",
    top: -9,
    right: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  planTagText: {
    color: StudioColors.ink,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  planCardLabel: {
    color: StudioColors.textMuted,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  planCardLabelSelected: {
    color: StudioColors.ink,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 3,
  },
  planPrice: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  planPriceSelected: {
    color: StudioColors.ink,
  },
  planPeriod: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 2,
  },
  planPeriodSelected: {
    color: StudioColors.ink,
  },
  planSubline: {
    color: StudioColors.textMuted,
    fontSize: 9.5,
    fontWeight: "700",
    lineHeight: 13,
  },
  planSublineSelected: {
    color: StudioColors.ink,
  },
  upgradeBtn: {
    backgroundColor: StudioColors.lime,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
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
    fontSize: 12.5,
    letterSpacing: 0.7,
    fontFamily: MonoFont,
    textAlign: "center",
  },
  trustMicroCopy: {
    color: StudioColors.textMuted,
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  previewBtn: {
    marginTop: 10,
    alignSelf: "stretch",
    backgroundColor: StudioColors.mint,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: "center",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  previewBtnText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  closeBtn: {
    marginTop: 10,
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
