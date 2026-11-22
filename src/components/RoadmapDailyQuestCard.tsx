import React, { useEffect, useState } from "react";
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
  DAILY_QUEST_BONUS_XP,
  DAILY_QUEST_STEPS,
  type DailyQuestState,
  type DailyQuestStepId,
  getDailyQuestProgress,
  getDailyQuestState,
  hydrateDailyQuestState,
  subscribeDailyQuest,
} from "../utils/dailyQuests";
import { playKeyClick } from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface RoadmapDailyQuestCardProps {
  onStartLessonStep?: () => void;
  onStartArenaStep?: (mode: "bughunt" | "blitz") => void;
  onClaimBonus?: () => void;
  /** Optional override for deterministic UI testing */
  initialQuestState?: DailyQuestState;
}

export default function RoadmapDailyQuestCard({
  onStartLessonStep,
  onStartArenaStep,
  onClaimBonus,
  initialQuestState,
}: RoadmapDailyQuestCardProps) {
  const styles = useThemedStyles(createStyles);
  const [quest, setQuest] = useState<DailyQuestState>(
    () => initialQuestState ?? getDailyQuestState(),
  );
  const [expandedWhenClaimed, setExpandedWhenClaimed] = useState<boolean>(false);

  useEffect(() => {
    if (initialQuestState) return;
    void hydrateDailyQuestState();
    return subscribeDailyQuest(setQuest);
  }, [initialQuestState]);

  const { completedCount, totalCount, allDone, canClaim } =
    getDailyQuestProgress(quest);
  const pct = Math.round((completedCount / totalCount) * 100);

  function handleStepPress(stepId: DailyQuestStepId) {
    playKeyClick();
    if (stepId === "lesson") {
      onStartLessonStep?.();
    } else {
      onStartArenaStep?.(stepId);
    }
  }

  const isCompactClaimed = quest.claimed && !expandedWhenClaimed;

  return (
    <View
      style={[
        styles.card,
        quest.claimed && styles.cardClaimed,
        isCompactClaimed && styles.cardCompactClaimed,
      ]}
    >
      <View
        style={[
          styles.topAccent,
          canClaim && { backgroundColor: StudioColors.lime },
          quest.claimed && { backgroundColor: StudioColors.mint },
        ]}
      />

      <View
        style={[
          styles.headerRow,
          isCompactClaimed && styles.headerRowCompact,
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.questBadge,
              allDone && styles.questBadgeDone,
            ]}
          >
            <StudioIcon name="daily_quest" size={16} />
            <Text style={styles.questBadgeText}>
              {quest.claimed
                ? "✓ DAILY QUEST CLEARED"
                : `TODAY'S 5-MIN QUEST · ${completedCount}/${totalCount}`}
            </Text>
          </View>
          {!isCompactClaimed && (
            <View style={styles.miniMeterTrack}>
              <View
                style={[
                  styles.miniMeterFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: allDone
                      ? StudioColors.lime
                      : StudioColors.yellow,
                  },
                ]}
              />
            </View>
          )}
        </View>

        <View style={styles.headerRightGroup}>
          {canClaim ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Claim ${DAILY_QUEST_BONUS_XP} bonus XP`}
              style={({ pressed }) => [
                styles.claimBtn,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={() => {
                onClaimBonus?.();
              }}
            >
              <StudioIcon name="gift" size={14} />
              <Text style={styles.claimBtnText}>
                CLAIM +{DAILY_QUEST_BONUS_XP} XP
              </Text>
            </Pressable>
          ) : (
            <View
              style={[
                styles.rewardPill,
                quest.claimed && styles.rewardPillClaimed,
              ]}
            >
              <Text
                style={[
                  styles.rewardPillText,
                  quest.claimed && styles.rewardPillTextClaimed,
                ]}
              >
                {quest.claimed
                  ? `+${DAILY_QUEST_BONUS_XP} XP CLAIMED ✓`
                  : `REWARD: +${DAILY_QUEST_BONUS_XP} XP`}
              </Text>
            </View>
          )}

          {quest.claimed && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                expandedWhenClaimed
                  ? "Collapse completed daily quest steps"
                  : "Expand completed daily quest steps"
              }
              style={styles.collapseToggleBtn}
              onPress={() => {
                playKeyClick();
                setExpandedWhenClaimed((prev) => !prev);
              }}
            >
              <Text style={styles.collapseToggleText}>
                {expandedWhenClaimed ? "HIDE ▴" : "STEPS ▾"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {!isCompactClaimed && (
      <View style={styles.stepsRow}>
        {DAILY_QUEST_STEPS.map((step) => {
          const isDone = Boolean(quest.steps[step.id]);
          return (
            <Pressable
              key={step.id}
              accessibilityRole="button"
              accessibilityLabel={`${step.title} (${isDone ? "completed" : "start"})`}
              style={({ pressed }) => [
                styles.stepTile,
                isDone && styles.stepTileDone,
                pressed && !isDone && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleStepPress(step.id)}
            >
              <View
                style={[
                  styles.stepCheckBox,
                  isDone && styles.stepCheckBoxDone,
                ]}
              >
                <Text
                  style={[
                    styles.stepCheckText,
                    isDone && styles.stepCheckTextDone,
                  ]}
                >
                  {isDone ? "✓" : step.orderLabel}
                </Text>
              </View>
              <StudioIcon name={step.icon} size={16} />
              <View style={styles.stepCopy}>
                <Text
                  style={[styles.stepTitle, isDone && styles.stepTitleDone]}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepActionTag,
                  isDone && styles.stepActionTagDone,
                ]}
              >
                {isDone ? "DONE" : step.actionLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
      )}
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    card: {
      width: "100%",
      backgroundColor: StudioColors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
      marginBottom: 12,
      ...HardShadow,
    },
    cardClaimed: {
      borderColor: StudioColors.cardDoneBorder,
    },
    cardCompactClaimed: {
      marginBottom: 10,
    },
    topAccent: {
      height: 4,
      width: "100%",
      backgroundColor: StudioColors.yellow,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
    },
    headerRowCompact: {
      paddingVertical: 8,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    headerRightGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    collapseToggleBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    collapseToggleText: {
      color: StudioColors.textSecondary,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    questBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    questBadgeDone: {
      backgroundColor: StudioColors.lime,
    },
    questBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    miniMeterTrack: {
      width: 68,
      height: 7,
      borderRadius: 4,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    miniMeterFill: {
      height: "100%",
    },
    rewardPill: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    rewardPillClaimed: {
      backgroundColor: StudioColors.cardDoneBg,
      borderColor: StudioColors.cardDoneBorder,
    },
    rewardPillText: {
      color: StudioColors.textSecondary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    rewardPillTextClaimed: {
      color: StudioColors.mint,
    },
    claimBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 4.5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    claimBtnText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    stepsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    stepTile: {
      flex: 1,
      minWidth: 195,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 7,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    stepTileDone: {
      backgroundColor: StudioColors.cardDoneBg,
      borderColor: StudioColors.cardDoneBorder,
    },
    stepCheckBox: {
      width: 22,
      height: 22,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    stepCheckBoxDone: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    stepCheckText: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stepCheckTextDone: {
      color: StudioColors.ink,
    },
    stepCopy: {
      flex: 1,
    },
    stepTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "800",
    },
    stepTitleDone: {
      color: StudioColors.textSecondary,
    },
    stepActionTag: {
      color: StudioColors.violet,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    stepActionTagDone: {
      color: StudioColors.mint,
    },
  });
