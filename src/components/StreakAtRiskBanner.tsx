import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  StreakStatus,
  getStreakStatus,
} from "../constants/streaks";
import {
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { playKeyClick } from "../utils/soundEffects";

interface StreakAtRiskBannerProps {
  streakCount: number;
  lastActiveDate: string | null;
  onSaveStreak: () => void;
}

export default function StreakAtRiskBanner({
  streakCount,
  lastActiveDate,
  onSaveStreak,
}: StreakAtRiskBannerProps) {
  const status: StreakStatus = getStreakStatus({
    streakCount,
    lastActiveDate,
  });

  if (status.isAtRisk && streakCount > 0) {
    return (
      <View style={styles.atRiskCard}>
        <View style={styles.urgentStripe} />
        <View style={styles.bodyCol}>
          <View style={styles.topRow}>
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>
                ⚠️ ~{status.hoursRemainingToday}H LEFT TODAY
              </Text>
            </View>
            <Text style={styles.flameHeadline}>
              🔥 {streakCount}-DAY STREAK AT RISK!
            </Text>
          </View>

          <Text style={styles.subtext}>
            Complete today&apos;s 60s warm-up (+25 XP) or solve any lesson before midnight to keep your flame burning.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onSaveStreak();
          }}
        >
          <Text style={styles.saveBtnText}>SAVE STREAK →</Text>
        </Pressable>
      </View>
    );
  }

  if (status.isActiveToday && streakCount >= 2) {
    return (
      <View style={styles.safeCard}>
        <View style={styles.safeStripe} />
        <View style={styles.safeBody}>
          <Text style={styles.safeTitle}>
            🔥 {streakCount}-DAY STREAK PROTECTED TODAY!
          </Text>
          <Text style={styles.safeSub}>
            {status.nextMilestone
              ? `Next milestone at ${status.nextMilestone.days} days (+${status.nextMilestone.bonusXp} XP bonus). Keep the pace!`
              : "Unbroken arcade streak. You are in the top tier of developers!"}
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  atRiskCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    ...HardShadowSm,
  },
  urgentStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
    backgroundColor: StudioColors.coral,
  },
  bodyCol: {
    flex: 1,
    minWidth: 240,
    paddingLeft: 6,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  urgentBadge: {
    backgroundColor: StudioColors.coral,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  urgentBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  flameHeadline: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 13,
    fontWeight: "900",
  },
  subtext: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  saveBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  safeCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    overflow: "hidden",
    ...HardShadowSm,
  },
  safeStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
    backgroundColor: StudioColors.lime,
  },
  safeBody: {
    flex: 1,
    paddingLeft: 4,
    gap: 2,
  },
  safeTitle: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  safeSub: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },
});
