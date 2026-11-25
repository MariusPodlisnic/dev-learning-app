import React, { useEffect, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from "react-native";
import { StudioIcon, Text } from "./StudioIcon";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { exportShareCardPng } from "../utils/shareCardImage";
import { buildChallengeUrl, shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick, playVictoryFanfare } from "../utils/soundEffects";
import { getOnboardingState } from "../utils/userOnboarding";
import PixelConfetti from "./PixelConfetti";
import { getDeveloperRank } from "./ProfileStatsModal";

interface SuccessModalProps {
  xpEarned: number;
  totalXp?: number;
  streakCount?: number;
  lessonId?: string;
  lessonTitle: string;
  keyTakeaway?: string;
  patternBadge?: string;
  complexities?: { time?: string; space?: string };
  nextLessonTitle?: string;
  hasNextLesson: boolean;
  challengeStepLabel?: string;
  nextActionLabel?: string;
  starRating?: 0 | 1 | 2 | 3;
  isGuest?: boolean;
  totalSolvedCount?: number;
  onSaveProgress?: () => void;
  trackCertificateLabel?: string;
  onViewCertificate?: () => void;
  codexBlueprintTitle?: string;
  codexConstellation?: string;
  onOpenCodex?: () => void;
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
  patternBadge,
  complexities,
  nextLessonTitle,
  hasNextLesson,
  challengeStepLabel,
  nextActionLabel,
  starRating,
  isGuest = false,
  totalSolvedCount = 0,
  onSaveProgress,
  trackCertificateLabel,
  onViewCertificate,
  codexBlueprintTitle,
  codexConstellation,
  onOpenCodex,
  onNextLesson,
  onClose,
}: SuccessModalProps) {
  const { paletteId } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "shared">("idle");
  const [pngFeedback, setPngFeedback] = useState<"idle" | "saving" | "downloaded" | "shared">("idle");
  const currentRank = getDeveloperRank(totalXp);
  const previousRank = getDeveloperRank(Math.max(0, totalXp - xpEarned));
  const didLevelUp = currentRank.level > previousRank.level;
  const startPct = didLevelUp ? 6 : Math.max(previousRank.progressPercent, 6);
  const targetPct = Math.max(currentRank.progressPercent, 8);
  const [rankBarAnim] = useState(() => new Animated.Value(startPct));

  useEffect(() => {
    playVictoryFanfare();
    Animated.timing(rankBarAnim, {
      toValue: targetPct,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [rankBarAnim, targetPct]);

  const animatedRankWidth = rankBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  function buildWinShareData() {
    const challengeUrl = buildChallengeUrl(
      lessonId ? { lessonId, ref: "lesson_win" } : { ref: "lesson_win" },
    );
    const streakSegment = streakCount > 0 ? ` · 🔥 ${streakCount}d streak` : "";
    const message = didLevelUp
      ? `🎉 Promoted to LVL ${currentRank.level}: ${currentRank.title} in Devy!\n✅ Just solved "${lessonTitle}" (+${xpEarned} XP${streakSegment})\nTry this lab 👉 ${challengeUrl}`
      : `✅ Solved "${lessonTitle}" in Devy (+${xpEarned} XP${streakSegment})!\n🏅 Rank: LVL ${currentRank.level} · ${currentRank.title}\nBeat my solution 👉 ${challengeUrl}`;
    return { challengeUrl, message };
  }

  async function handleShare() {
    playKeyClick();
    const { message } = buildWinShareData();

    const outcome = await shareOrCopyText({
      title: `Devy — ${lessonTitle}`,
      message,
      channel: "lesson_win",
    });
    if (outcome !== "failed") {
      setShareFeedback(outcome);
      setTimeout(() => setShareFeedback("idle"), 2500);
    }
  }

  async function handleSavePngCard() {
    playKeyClick();
    setPngFeedback("saving");
    const { challengeUrl, message } = buildWinShareData();
    const { displayName } = getOnboardingState();
    const starsValue =
      typeof starRating === "number" && starRating > 0
        ? `${"★".repeat(starRating)}${"☆".repeat(3 - starRating)} ${starRating}/3`
        : `+${xpEarned} XP`;

    const outcome = await exportShareCardPng({
      payload: {
        variant: "lesson_win",
        eyebrow: didLevelUp
          ? `PROMOTED TO LVL ${currentRank.level}`
          : `${challengeStepLabel || "MISSION CLEARED"} · +${xpEarned} XP`,
        headline: lessonTitle || "Module Mastered",
        subtitle: keyTakeaway || currentRank.tagline,
        displayName,
        rankLevel: currentRank.level,
        rankTitle: currentRank.title,
        xpPoints: totalXp,
        streakCount,
        metric3Label: typeof starRating === "number" && starRating > 0 ? "MASTERY" : "XP EARNED",
        metric3Value: starsValue,
        paletteId,
        footerUrl: challengeUrl,
      },
      fallbackTitle: `Devy — ${lessonTitle}`,
      fallbackMessage: message,
      channel: "lesson_win",
    });
    if (outcome === "downloaded" || outcome === "shared") {
      setPngFeedback(outcome);
      setTimeout(() => setPngFeedback("idle"), 2600);
    } else if (outcome === "copied") {
      setPngFeedback("idle");
      setShareFeedback("copied");
      setTimeout(() => setShareFeedback("idle"), 2500);
    } else {
      setPngFeedback("idle");
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
          <View style={styles.statusPillsRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {challengeStepLabel || "ALL ASSERTIONS PASSED"} · +{xpEarned} XP
              </Text>
            </View>
            {typeof starRating === "number" && starRating > 0 && (
              <View
                style={[
                  styles.starRatingPill,
                  starRating === 3 && styles.starRatingPillGold,
                ]}
              >
                <Text
                  style={[
                    styles.starRatingPillText,
                    starRating === 3 && styles.starRatingPillTextGold,
                  ]}
                >
                  {[1, 2, 3]
                    .map((s) => (s <= starRating ? "★" : "☆"))
                    .join("")}{" "}
                  {starRating === 3
                    ? "3-STAR MASTERY!"
                    : `${starRating}/3 STARS`}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>
            {challengeStepLabel ? "Challenge Cleared!" : "Module Mastered!"}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Verified all checks for{" "}
            <Text style={styles.highlight}>{lessonTitle}</Text>
          </Text>
        </View>
      </View>

      {/* Key Engineering Takeaway + Mental Model Pattern Pills */}
      {keyTakeaway ? (
        <View style={styles.takeawayCard}>
          <View style={styles.takeawayBadgeRow}>
            <View style={styles.takeawaySticker}>
              <Text style={styles.takeawayStickerText}>
                💡 KEY ENGINEERING TAKEAWAY
              </Text>
            </View>
            {patternBadge ? (
              <View style={styles.patternPill}>
                <Text style={styles.patternPillText}>
                  {patternBadge.toUpperCase()}
                </Text>
              </View>
            ) : null}
            {complexities?.time ? (
              <View style={styles.complexityPill}>
                <Text style={styles.complexityPillText}>
                  TIME {complexities.time}
                </Text>
              </View>
            ) : null}
            {complexities?.space ? (
              <View style={styles.complexityPill}>
                <Text style={styles.complexityPillText}>
                  SPACE {complexities.space}
                </Text>
              </View>
            ) : null}
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
                LVL {currentRank.level}{currentRank.isMaxLevel ? " · MAX" : ""}
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
            {currentRank.isMaxLevel
              ? "MAX LEVEL"
              : `${currentRank.xpIntoLevel.toLocaleString()} / ${currentRank.xpForNext.toLocaleString()} XP`}
          </Text>
        </View>

        <View style={styles.rankIdentityRow}>
          <View style={[styles.rankAvatarBox, { backgroundColor: currentRank.accent }]}>
            <StudioIcon name={currentRank.avatarIcon} size={38} />
          </View>
          <View style={styles.rankIdentityCopy}>
            <Text style={styles.rankTitleText}>{currentRank.title}</Text>
            <Text style={styles.rankTaglineText}>
              &ldquo;{currentRank.tagline}&rdquo;
            </Text>
          </View>
        </View>

        <View style={styles.rankBarTrack}>
          <Animated.View
            style={[
              styles.rankBarFill,
              {
                width: animatedRankWidth,
                backgroundColor: StudioColors.mint,
              },
            ]}
          />
        </View>

        <Text style={styles.nextRankFooterText}>
          {currentRank.isMaxLevel ? (
            <>★ MAX LEVEL 10 REACHED ({totalXp.toLocaleString()} TOTAL XP)</>
          ) : (
            <>
              ⚡ {currentRank.xpRemaining.toLocaleString()} XP until{" "}
              <Text style={styles.nextRankBold}>
                LVL {currentRank.level + 1}: {currentRank.nextTitle}
              </Text>
            </>
          )}
        </Text>
      </View>

      {codexBlueprintTitle ? (
        <View style={styles.codexUnlockStrip}>
          <View style={styles.codexUnlockLeft}>
            <Text style={styles.codexUnlockMicro}>
              ✦ {codexConstellation ? `${codexConstellation} · ` : ""}CODEX BLUEPRINT ILLUMINATED
            </Text>
            <Text style={styles.codexUnlockTitle} numberOfLines={1}>
              {codexBlueprintTitle}
            </Text>
          </View>
          {onOpenCodex ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open illuminated blueprint in Field Guide"
              style={({ pressed }) => [
                styles.codexUnlockBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                onClose();
                onOpenCodex();
              }}
            >
              <Text style={styles.codexUnlockBtnText}>📖 OPEN CODEX →</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {isGuest && totalSolvedCount >= 2 && onSaveProgress ? (
        <View style={styles.guestSaveBanner}>
          <View style={styles.guestSaveCopy}>
            <Text style={styles.guestSaveTitle}>
              ☁️ SAVE YOUR {totalXp} XP PROGRESS
            </Text>
            <Text style={styles.guestSaveSub}>
              You&apos;ve solved {totalSolvedCount} modules—lock your streak into a
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
          <Text style={styles.nextBtnLabel}>
            {nextActionLabel || "UP NEXT MISSION"}
          </Text>
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

      <View style={styles.shareActionsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save visual PNG win card"
          disabled={pngFeedback === "saving"}
          style={({ pressed }) => [
            styles.pngShareBtn,
            (pngFeedback === "downloaded" || pngFeedback === "shared") &&
              styles.shareBtnDone,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={handleSavePngCard}
        >
          <Text style={styles.shareBtnText}>
            {pngFeedback === "saving"
              ? "RENDERING PNG..."
              : pngFeedback === "downloaded"
                ? "✓ PNG SAVED!"
                : pngFeedback === "shared"
                  ? "✓ PNG SHARED!"
                  : "🖼️ SAVE PNG CARD"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy or share achievement text"
          style={({ pressed }) => [
            styles.shareBtn,
            shareFeedback !== "idle" && styles.shareBtnDone,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={handleShare}
        >
          <Text style={styles.shareBtnText}>
            {shareFeedback === "copied"
              ? "✓ COPIED!"
              : shareFeedback === "shared"
                ? "✓ SHARED!"
                : didLevelUp
                  ? "📤 SHARE RANK ↗"
                  : "📤 SHARE TEXT ↗"}
          </Text>
        </Pressable>
      </View>

      {trackCertificateLabel && onViewCertificate ? (
        <Pressable
          style={({ pressed }) => [
            styles.certLaunchBtn,
            pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onViewCertificate();
          }}
        >
          <Text style={styles.certLaunchBtnText}>
            🎓 CLAIM {trackCertificateLabel.toUpperCase()} CERTIFICATE ↗
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
        onPress={onClose}
      >
        <Text style={styles.closeBtnText}>Stay & Inspect Code</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
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
  statusPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
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
  starRatingPill: {
    backgroundColor: "rgba(251, 191, 36, 0.16)",
    borderWidth: 1.5,
    borderColor: StudioColors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  starRatingPillGold: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  starRatingPillText: {
    color: StudioColors.yellow,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    fontFamily: MonoFont,
  },
  starRatingPillTextGold: {
    color: StudioColors.ink,
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
    flexWrap: "wrap",
    gap: 6,
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
  patternPill: {
    backgroundColor: StudioColors.mint,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  patternPillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  complexityPill: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1,
    borderColor: StudioColors.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  complexityPillText: {
    color: StudioColors.textPrimary,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
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
  rankIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  rankAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  rankIdentityCopy: {
    flex: 1,
    minWidth: 0,
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
  shareActionsRow: {
    marginTop: 10,
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  pngShareBtn: {
    flex: 1,
    backgroundColor: "#A5F3FC",
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
    }),
  },
  shareBtn: {
    flex: 1,
    backgroundColor: StudioColors.yellow,
    paddingVertical: 11,
    paddingHorizontal: 10,
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
  certLaunchBtn: {
    marginTop: 8,
    backgroundColor: StudioColors.violet,
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
  certLaunchBtnText: {
    color: StudioColors.ink,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: MonoFont,
  },
  codexUnlockStrip: {
    marginTop: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.mint,
    backgroundColor: StudioColors.bg,
  },
  codexUnlockLeft: {
    flex: 1,
    minWidth: 170,
    gap: 2,
  },
  codexUnlockMicro: {
    color: StudioColors.mint,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  codexUnlockTitle: {
    color: StudioColors.textPrimary,
    fontSize: 12.5,
    fontWeight: "800",
  },
  codexUnlockBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    backgroundColor: StudioColors.yellow,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  codexUnlockBtnText: {
    color: StudioColors.ink,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
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
