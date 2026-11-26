import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  buildGhostDuelUrl,
  computeGhostPaceSnapshot,
  evaluateGhostDuelVerdict,
  type GhostDuelChallenge,
} from "../utils/ghostDuel";
import { shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { getOnboardingState } from "../utils/userOnboarding";
import { Text } from "./StudioIcon";

interface GhostDuelPaceBarProps {
  challenge: GhostDuelChallenge;
  playerScore: number;
  progressRatio: number;
  elapsedSec?: number;
  onDismiss?: () => void;
}

export function GhostDuelPaceBar({
  challenge,
  playerScore,
  progressRatio,
  elapsedSec = 0,
  onDismiss,
}: GhostDuelPaceBarProps) {
  const styles = useThemedStyles(createStyles);
  const snap = computeGhostPaceSnapshot({
    challenge,
    playerScore,
    progressRatio,
    elapsedSec,
  });

  const statusColor =
    snap.status === "ahead"
      ? StudioColors.lime
      : snap.status === "tied"
        ? StudioColors.yellow
        : StudioColors.pink;

  return (
    <View testID="ghost-duel-pace-bar" style={styles.paceCard}>
      <View style={styles.paceTopRow}>
        <View style={styles.paceLeftGroup}>
          <View style={styles.duelBadge}>
            <Text style={styles.duelBadgeText}>👻 GHOST DUEL</Text>
          </View>
          <Text style={styles.challengerText} numberOfLines={1}>
            VS @{challenge.challenger.toUpperCase()}
          </Text>
        </View>

        <View style={styles.paceRightGroup}>
          <View style={[styles.statusPill, { borderColor: statusColor }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {snap.statusLabel}
            </Text>
          </View>
          {onDismiss ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Exit Ghost Duel"
              style={styles.dismissBtn}
              onPress={() => {
                playKeyClick();
                onDismiss();
              }}
            >
              <Text style={styles.dismissBtnText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Dual Racing Bars */}
      <View style={styles.barsStack}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>YOU</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(4, Math.round(snap.playerRatio * 100))}%`,
                  backgroundColor: StudioColors.lime,
                },
              ]}
            />
          </View>
          <Text style={[styles.barValue, { color: StudioColors.lime }]}>
            {challenge.mode === "bughunt"
              ? `${snap.playerScore}s`
              : `${snap.playerScore}`}
          </Text>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: StudioColors.pink }]}>
            GHOST
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(4, Math.round(snap.ghostRatio * 100))}%`,
                  backgroundColor: StudioColors.pink,
                },
              ]}
            />
          </View>
          <Text style={[styles.barValue, { color: StudioColors.pink }]}>
            {challenge.mode === "bughunt"
              ? `${challenge.targetTimeSec}s`
              : `${snap.ghostExpectedScore}/${challenge.targetScore}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface GhostDuelVerdictCardProps {
  challenge: GhostDuelChallenge;
  playerScore: number;
  playerTimeSec: number;
  onDismiss?: () => void;
}

export function GhostDuelVerdictCard({
  challenge,
  playerScore,
  playerTimeSec,
  onDismiss,
}: GhostDuelVerdictCardProps) {
  const styles = useThemedStyles(createStyles);
  const [rematchFeedback, setRematchFeedback] = useState<
    "idle" | "copied" | "shared"
  >("idle");

  const verdict = evaluateGhostDuelVerdict({
    challenge,
    playerScore,
    playerTimeSec,
  });

  const accentColor =
    verdict.outcome === "victory"
      ? StudioColors.lime
      : verdict.outcome === "draw"
        ? StudioColors.yellow
        : StudioColors.pink;

  async function handleSendRematch() {
    playSuccessChime();
    const myHandle = getOnboardingState().displayName || "Devy Challenger";
    const rematch: GhostDuelChallenge = {
      v: 1,
      mode: challenge.mode,
      challenger: myHandle,
      seed: challenge.seed,
      targetScore: playerScore,
      targetTimeSec: Math.max(1, Math.round(playerTimeSec)),
      track: challenge.track,
    };
    const duelUrl = buildGhostDuelUrl(rematch);
    const modeLabel =
      challenge.mode === "blitz"
        ? "60s Speed Blitz"
        : challenge.mode === "detective"
          ? "Output Detective"
          : "Bug Hunt";
    const message = [
      `⚔️ Devy Ghost Duel Rematch — ${modeLabel}`,
      `${verdict.headline} (My Run: ${verdict.playerDisplay} vs @${challenge.challenger}: ${verdict.ghostDisplay})`,
      `Race my exact Ghost on the same seed 👉 ${duelUrl}`,
    ].join("\n");

    const outcome = await shareOrCopyText({
      title: `Devy Ghost Duel Rematch — ${modeLabel}`,
      message,
      channel: `ghost_duel_rematch_${challenge.mode}`,
    });
    if (outcome !== "failed") {
      setRematchFeedback(outcome);
      setTimeout(() => setRematchFeedback("idle"), 2600);
    }
  }

  return (
    <View
      testID="ghost-duel-verdict-card"
      style={[styles.verdictCard, { borderColor: accentColor }]}
    >
      <View style={styles.verdictHeader}>
        <Text style={[styles.verdictHeadline, { color: accentColor }]}>
          {verdict.headline}
        </Text>
        <View style={styles.seedPill}>
          <Text style={styles.seedPillText}>SAME SEED DUEL</Text>
        </View>
      </View>

      <Text style={styles.verdictMargin}>{verdict.marginLabel}</Text>

      <View style={styles.vsRow}>
        <View style={styles.vsBox}>
          <Text style={styles.vsKicker}>YOU</Text>
          <Text style={[styles.vsScore, { color: StudioColors.lime }]}>
            {verdict.playerDisplay}
          </Text>
        </View>
        <Text style={styles.vsDivider}>VS</Text>
        <View style={styles.vsBox}>
          <Text style={styles.vsKicker}>
            👻 @{challenge.challenger.toUpperCase()}
          </Text>
          <Text style={[styles.vsScore, { color: StudioColors.pink }]}>
            {verdict.ghostDisplay}
          </Text>
        </View>
      </View>

      <View style={styles.verdictActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy Ghost Duel rematch link"
          style={({ pressed }) => [
            styles.rematchBtn,
            rematchFeedback !== "idle" && styles.rematchBtnDone,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={handleSendRematch}
        >
          <Text style={styles.rematchBtnText}>
            {rematchFeedback === "copied"
              ? "✓ REMATCH LINK COPIED!"
              : rematchFeedback === "shared"
                ? "✓ REMATCH SHARED!"
                : "⚔️ SEND REMATCH LINK ↗"}
          </Text>
        </Pressable>

        {onDismiss ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear active Ghost Duel"
            style={({ pressed }) => [
              styles.clearDuelBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onDismiss();
            }}
          >
            <Text style={styles.clearDuelBtnText}>END DUEL</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    paceCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.pink,
      padding: 12,
      gap: 8,
      marginBottom: 12,
      ...HardShadowSm,
    },
    paceTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    paceLeftGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 1,
    },
    duelBadge: {
      backgroundColor: StudioColors.pink,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    duelBadgeText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    challengerText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    paceRightGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusPillText: {
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    dismissBtn: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    dismissBtnText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
    },
    barsStack: {
      gap: 5,
    },
    barRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    barLabel: {
      width: 44,
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    barTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.bg,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 3,
    },
    barValue: {
      minWidth: 46,
      textAlign: "right",
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verdictCard: {
      backgroundColor: colors.bg,
      borderRadius: 12,
      borderWidth: 2,
      padding: 14,
      gap: 10,
      marginBottom: 14,
      ...HardShadow,
    },
    verdictHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    verdictHeadline: {
      fontSize: 15,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    seedPill: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    seedPillText: {
      color: colors.textSecondary,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verdictMargin: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
    },
    vsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    vsBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 10,
      alignItems: "center",
      gap: 3,
    },
    vsKicker: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    vsScore: {
      fontSize: 16,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    vsDivider: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verdictActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    rematchBtn: {
      flex: 1,
      minWidth: 180,
      backgroundColor: StudioColors.pink,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    rematchBtnDone: {
      backgroundColor: StudioColors.mint,
    },
    rematchBtnText: {
      color: StudioColors.ink,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    clearDuelBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    clearDuelBtnText: {
      color: colors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
  });
