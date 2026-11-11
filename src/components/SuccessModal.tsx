import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { buildChallengeUrl, shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick, playVictoryFanfare } from "../utils/soundEffects";
import PixelConfetti from "./PixelConfetti";
import { getDeveloperRank } from "./ProfileStatsModal";

interface SuccessModalProps {
  xpEarned: number;
  totalXp?: number;
  streakCount?: number;
  lessonId?: string;
  lessonTitle: string;
  keyTakeaway?: string;
  nextLessonTitle?: string;
  hasNextLesson: boolean;
  isGuest?: boolean;
  totalSolvedCount?: number;
  onSaveProgress?: () => void;
  onNextLesson: () => void;
  onClose: () => void;
}

export default function SuccessModal({
  xpEarned,
  totalXp = 50,
  streakCount = 0,
  lessonId,
  lessonTitle,
  keyTakeaway,
  nextLessonTitle,
  hasNextLesson,
  isGuest = false,
  totalSolvedCount = 0,
  onSaveProgress,
  onNextLesson,
  onClose,
}: SuccessModalProps) {
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "shared">("idle");
  const currentRank = getDeveloperRank(totalXp);
  const previousRank = getDeveloperRank(Math.max(0, totalXp - xpEarned));
  const didLevelUp = currentRank.level > previousRank.level;

  useEffect(() => {
    playVictoryFanfare();
  }, []);

  async function handleShare() {
    playKeyClick();
    const challengeUrl = buildChallengeUrl(
      lessonId ? { lessonId } : undefined,
    );
    const streakSegment = streakCount > 0 ? ` · 🔥 ${streakCount}d streak` : "";
    const message = didLevelUp
      ? `🎉 Promoted to Level ${currentRank.level}: ${currentRank.title} in DevLearn!\n✅ Just solved "${lessonTitle}" (+${xpEarned} XP${streakSegment})\nTry this lab 👉 ${challengeUrl}`
      : `✅ Solved "${lessonTitle}" in DevLearn (+${xpEarned} XP${streakSegment})!\n🏅 Rank: L${currentRank.level} ${currentRank.title}\nBeat my solution 👉 ${challengeUrl}`;

    const outcome = await shareOrCopyText({
      title: `DevLearn — ${lessonTitle}`,
      message,
    });
    if (outcome !== "failed") {
      setShareFeedback(outcome);
      setTimeout(() => setShareFeedback("idle"), 2500);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.topGlowBar} />
      <PixelConfetti />

      <View style={styles.topHeaderRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>✓</Text>
        </View>
        <View style={styles.headerTextGroup}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              ALL ASSERTIONS PASSED · +{xpEarned} XP
            </Text>
          </View>
          <Text style={styles.title}>Module Mastered!</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Verified all checks for{" "}
            <Text style={styles.highlight}>{lessonTitle}</Text>
          </Text>
        </View>
      </View>

      {/* Key Engineering Takeaway */}
      {keyTakeaway ? (
        <View style={styles.takeawayCard}>
          <View style={styles.takeawayBadgeRow}>
            <View style={styles.takeawaySticker}>
              <Text style={styles.takeawayStickerText}>
                💡 KEY ENGINEERING TAKEAWAY
              </Text>
            </View>
          </View>
          <Text style={styles.takeawayText} numberOfLines={3}>
            {keyTakeaway}
          </Text>
        </View>
      ) : null}

      {/* Creative & Funny Developer Rank Progression Card */}
      <View
        style={[
          styles.rankCard,
          didLevelUp && {
            backgroundColor: "#FEF9C3",
            borderColor: StudioColors.ink,
          },
        ]}
      >
        <View style={styles.rankTopRow}>
          <View style={styles.rankBadgeGroup}>
            <View
              style={[
                styles.rankLevelPill,
                { backgroundColor: currentRank.accent },
              ]}
            >
              <Text style={styles.rankLevelPillText}>
                LEVEL {currentRank.level}
              </Text>
            </View>
            {didLevelUp ? (
              <View style={styles.rankUpCelebrationPill}>
                <Text style={styles.rankUpCelebrationText}>
                  🎉 PROMOTED!
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.rankXpFraction}>
            {currentRank.xpIntoLevel} / {currentRank.xpForNext} XP
          </Text>
        </View>

        <Text style={styles.rankTitleText}>{currentRank.title}</Text>
        <Text style={styles.rankTaglineText}>"{currentRank.tagline}"</Text>

        <View style={styles.rankBarTrack}>
          <View
            style={[
              styles.rankBarFill,
              {
                width: `${Math.max(currentRank.progressPercent, 8)}%`,
                backgroundColor: StudioColors.mint,
              },
            ]}
          />
        </View>

        <Text style={styles.nextRankFooterText}>
          ⚡ {currentRank.xpRemaining} XP until{" "}
          <Text style={styles.nextRankBold}>
            L{currentRank.level + 1}: {currentRank.nextTitle}
          </Text>
        </Text>
      </View>

      {isGuest && totalSolvedCount >= 2 && onSaveProgress ? (
        <View style={styles.guestSaveBanner}>
          <View style={styles.guestSaveCopy}>
            <Text style={styles.guestSaveTitle}>
              ☁️ SAVE YOUR {totalXp} XP PROGRESS
            </Text>
            <Text style={styles.guestSaveSub}>
              You've solved {totalSolvedCount} modules—lock your streak into a
              free cloud account.
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.guestSaveBtn,
              pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onSaveProgress();
            }}
          >
            <Text style={styles.guestSaveBtnText}>SAVE FREE →</Text>
          </Pressable>
        </View>
      ) : null}

      {hasNextLesson ? (
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onNextLesson();
          }}
        >
          <Text style={styles.nextBtnLabel}>UP NEXT MISSION</Text>
          <Text style={styles.nextBtnText} numberOfLines={1}>
            {nextLessonTitle
              ? `${nextLessonTitle} →`
              : "CONTINUE TO NEXT MODULE →"}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={onClose}
        >
          <Text style={styles.nextBtnText}>RETURN TO SKILL MAP →</Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.shareBtn,
          shareFeedback !== "idle" && styles.shareBtnDone,
          pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
        ]}
        onPress={handleShare}
      >
        <Text style={styles.shareBtnText}>
          {shareFeedback === "copied"
            ? "✓ ACHIEVEMENT COPIED TO CLIPBOARD!"
            : shareFeedback === "shared"
              ? "✓ ACHIEVEMENT SHARED!"
              : didLevelUp
                ? "📤 SHARE LEVEL-UP CARD ↗"
                : "📤 CHALLENGE A FRIEND / SHARE ↗"}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
        onPress={onClose}
      >
        <Text style={styles.closeBtnText}>Stay & Inspect Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    padding: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    width: 440,
    maxWidth: "93%",
    alignItems: "stretch",
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
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
    ...HardShadowSm,
  },
  emoji: {
    fontSize: 24,
    color: StudioColors.ink,
    fontWeight: "900",
  },
  headerTextGroup: {
    flex: 1,
    alignItems: "flex-start",
    gap: 3,
  },
  statusPill: {
    backgroundColor: StudioColors.mint,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusPillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  highlight: {
    color: StudioColors.textPrimary,
    fontWeight: "800",
  },
  takeawayCard: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderLeftWidth: 4,
    borderLeftColor: StudioColors.ink,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    gap: 6,
  },
  takeawayBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  takeawaySticker: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  takeawayStickerText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  takeawayText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  rankCard: {
    backgroundColor: StudioColors.bg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 14,
    marginBottom: 18,
    gap: 5,
    ...HardShadowSm,
  },
  rankTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  rankBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rankLevelPill: {
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankLevelPillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  rankUpCelebrationPill: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankUpCelebrationText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  rankXpFraction: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  rankTitleText: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  rankTaglineText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    fontStyle: "italic",
    marginBottom: 4,
  },
  rankBarTrack: {
    height: 10,
    backgroundColor: StudioColors.surface,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  rankBarFill: {
    height: "100%",
    borderRightWidth: 1.5,
    borderRightColor: StudioColors.ink,
  },
  nextRankFooterText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  nextRankBold: {
    color: StudioColors.textPrimary,
    fontWeight: "900",
  },
  guestSaveBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    ...HardShadowSm,
  },
  guestSaveCopy: {
    flex: 1,
    gap: 2,
  },
  guestSaveTitle: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  guestSaveSub: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  guestSaveBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  guestSaveBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  nextBtn: {
    backgroundColor: StudioColors.lime,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    gap: 2,
    ...HardShadowHero,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  nextBtnLabel: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
    opacity: 0.75,
  },
  nextBtnText: {
    color: StudioColors.ink,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: MonoFont,
  },
  shareBtn: {
    marginTop: 10,
    backgroundColor: StudioColors.yellow,
    width: "100%",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  shareBtnDone: {
    backgroundColor: StudioColors.mint,
  },
  shareBtnText: {
    color: StudioColors.ink,
    fontWeight: "900",
    fontSize: 11.5,
    letterSpacing: 0.6,
    fontFamily: MonoFont,
  },
  closeBtn: {
    marginTop: 12,
    padding: 6,
    alignSelf: "center",
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
