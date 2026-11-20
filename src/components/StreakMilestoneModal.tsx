import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./StudioIcon";
import {
  StreakMilestone,
  buildStreakShareText,
} from "../constants/streaks";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { exportShareCardPng } from "../utils/shareCardImage";
import { buildChallengeUrl, shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick, playVictoryFanfare } from "../utils/soundEffects";
import { getOnboardingState } from "../utils/userOnboarding";
import PixelConfetti from "./PixelConfetti";

interface StreakMilestoneModalProps {
  milestone: StreakMilestone;
  streakCount: number;
  xpPoints: number;
  rankTitle: string;
  onClose: () => void;
}

export default function StreakMilestoneModal({
  milestone,
  streakCount,
  xpPoints,
  rankTitle,
  onClose,
}: StreakMilestoneModalProps) {
  const { paletteId } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">(
    "idle",
  );
  const [pngStatus, setPngStatus] = useState<
    "idle" | "saving" | "downloaded" | "shared"
  >("idle");

  React.useEffect(() => {
    playVictoryFanfare();
  }, []);

  async function handleShareStreak() {
    playKeyClick();
    const outcome = await shareOrCopyText({
      title: `Devy — ${milestone.badge}: ${milestone.title}`,
      message: buildStreakShareText({
        streakCount,
        milestone,
        xpPoints,
        rankTitle,
      }),
      channel: "streak_milestone",
    });
    if (outcome !== "failed") {
      setShareStatus(outcome);
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  }

  async function handleSaveStreakPng() {
    playKeyClick();
    setPngStatus("saving");
    const { displayName } = getOnboardingState();
    const levelMatch = rankTitle.match(/\d+/);
    const parsedLevel = levelMatch ? Number(levelMatch[0]) : 1;
    const cleanRankTitle = rankTitle.replace(/^L\d+\s*/i, "").trim() || rankTitle;

    const outcome = await exportShareCardPng({
      payload: {
        variant: "streak_milestone",
        eyebrow: `${milestone.badge} · +${milestone.bonusXp} BONUS XP`,
        headline: `${streakCount}-DAY STREAK!`,
        subtitle: `"${milestone.tagline}"`,
        displayName,
        rankLevel: parsedLevel,
        rankTitle: cleanRankTitle,
        xpPoints,
        streakCount,
        metric3Label: "MILESTONE",
        metric3Value: `+${milestone.bonusXp} XP`,
        paletteId,
        accentColor: milestone.accent,
        footerUrl: buildChallengeUrl({ ref: "streak_milestone" }),
      },
      fallbackTitle: `Devy — ${milestone.badge}: ${milestone.title}`,
      fallbackMessage: buildStreakShareText({
        streakCount,
        milestone,
        xpPoints,
        rankTitle,
      }),
      channel: "streak_milestone",
    });
    if (outcome === "downloaded" || outcome === "shared") {
      setPngStatus(outcome);
      setTimeout(() => setPngStatus("idle"), 2600);
    } else if (outcome === "copied") {
      setPngStatus("idle");
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    } else {
      setPngStatus("idle");
    }
  }

  return (
    <View style={styles.card}>
      <View
        style={[styles.topAccentBar, { backgroundColor: milestone.accent }]}
      />
      <PixelConfetti />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View
            style={[styles.kickerPill, { backgroundColor: milestone.accent }]}
          >
            <Text style={styles.kickerText}>
              🔥 STREAK MILESTONE ACHIEVED
            </Text>
          </View>
          <View style={styles.xpBonusPill}>
            <Text style={styles.xpBonusText}>
              +{milestone.bonusXp} BONUS XP
            </Text>
          </View>
        </View>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Big Visual Centerpiece */}
      <View style={styles.centerSection}>
        <View
          style={[styles.iconBox, { backgroundColor: milestone.accent }]}
        >
          <Text style={styles.iconEmoji}>{milestone.icon}</Text>
        </View>

        <Text style={styles.daysTitle}>
          {streakCount}-DAY STREAK!
        </Text>
        <Text style={styles.milestoneTitle}>
          {milestone.badge} · {milestone.title}
        </Text>

        <View style={styles.taglineBox}>
          <Text style={styles.taglineText}>
            &ldquo;{milestone.tagline}&rdquo;
          </Text>
        </View>
      </View>

      {/* Stats Chips Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: StudioColors.yellow }]}>
          <Text style={styles.statValue}>🔥 {streakCount}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: StudioColors.pink }]}>
          <Text style={styles.statValue}>⚡ {xpPoints}</Text>
          <Text style={styles.statLabel}>TOTAL XP</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: StudioColors.mint }]}>
          <Text style={styles.statValue} numberOfLines={1}>
            🏅 {rankTitle}
          </Text>
          <Text style={styles.statLabel}>DEV RANK</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsCol}>
        <View style={styles.shareActionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save visual PNG streak card"
            disabled={pngStatus === "saving"}
            style={({ pressed }) => [
              styles.pngShareBtn,
              (pngStatus === "downloaded" || pngStatus === "shared") &&
                styles.shareBtnDone,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleSaveStreakPng}
          >
            <Text style={styles.shareBtnText}>
              {pngStatus === "saving"
                ? "RENDERING PNG..."
                : pngStatus === "downloaded"
                  ? "✓ PNG SAVED!"
                  : pngStatus === "shared"
                    ? "✓ PNG SHARED!"
                    : "🖼️ SAVE PNG CARD"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy or share streak text"
            style={({ pressed }) => [
              styles.shareBtn,
              shareStatus !== "idle" && styles.shareBtnDone,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleShareStreak}
          >
            <Text style={styles.shareBtnText}>
              {shareStatus === "copied"
                ? "✓ COPIED!"
                : shareStatus === "shared"
                  ? "✓ SHARED!"
                  : "📤 SHARE TEXT ↗"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={onClose}
        >
          <Text style={styles.continueBtnText}>KEEP THE FIRE BURNING →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: StudioColors.surface,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 16,
    padding: 22,
    gap: 16,
    position: "relative",
    overflow: "hidden",
    ...HardShadowHero,
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.ink,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  kickerPill: {
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    ...HardShadowSm,
  },
  kickerText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  xpBonusPill: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpBonusText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  closeBtnText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 13,
    fontWeight: "900",
  },
  centerSection: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    ...HardShadow,
  },
  iconEmoji: {
    fontSize: 34,
  },
  daysTitle: {
    color: StudioColors.textPrimary,
    fontFamily: SerifFont,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  milestoneTitle: {
    color: StudioColors.textSecondary,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  taglineBox: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
  },
  taglineText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flex: 1,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    ...HardShadowSm,
  },
  statValue: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 13,
    fontWeight: "900",
  },
  statLabel: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 9,
    fontWeight: "800",
    opacity: 0.85,
  },
  actionsCol: {
    gap: 8,
    marginTop: 4,
  },
  shareActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  pngShareBtn: {
    flex: 1,
    backgroundColor: "#A5F3FC",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  shareBtn: {
    flex: 1,
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  shareBtnDone: {
    backgroundColor: StudioColors.mint,
  },
  shareBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  continueBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  continueBtnText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
});
