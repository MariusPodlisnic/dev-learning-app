import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { playKeyClick } from "../utils/soundEffects";
import {
  DueReviewItem,
  REVIEW_BONUS_XP,
  ReviewRetentionSummary,
} from "../utils/spacedRepetition";
import { Text } from "./StudioIcon";

interface ReviewableLesson {
  id: string;
  title: string;
  track: string;
  lesson_order: number;
  category?: string;
}

interface RoadmapReviewCardProps<T extends ReviewableLesson> {
  dueItems: DueReviewItem<T>[];
  summary: ReviewRetentionSummary;
  onStartReview: (lesson: T) => void;
  onFilterDue?: () => void;
}

function getReasonTag(reason: DueReviewItem["entry"]["reason"]): {
  label: string;
  bg: string;
} {
  if (reason === "peeked") {
    return { label: "PEEKED SOLUTION", bg: StudioColors.coral };
  }
  if (reason === "retries") {
    return { label: "RETRY HEAVY", bg: StudioColors.yellow };
  }
  if (reason === "scaffolded") {
    return { label: "USED SCAFFOLD", bg: StudioColors.sky };
  }
  return { label: "INTERVAL DUE", bg: StudioColors.violet };
}

export default function RoadmapReviewCard<T extends ReviewableLesson>({
  dueItems,
  summary,
  onStartReview,
  onFilterDue,
}: RoadmapReviewCardProps<T>) {
  const styles = useThemedStyles(createStyles);

  if (dueItems.length === 0 && summary.scheduledCount === 0) {
    return null;
  }

  const leadItem = dueItems[0];

  return (
    <View style={styles.card}>
      <View style={styles.topAccent} />
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.dueBadge,
              dueItems.length === 0 && styles.caughtUpBadge,
            ]}
          >
            <Text style={styles.dueBadgeText}>
              {dueItems.length > 0
                ? `🔁 SPACED REVIEW · ${dueItems.length} DUE NOW`
                : "✓ SPACED REVIEW · CAUGHT UP"}
            </Text>
          </View>
          <Text style={styles.statsLine}>
            {summary.masteredCount} long-term (14d+) · {summary.scheduledCount}{" "}
            tracked
            {dueItems.length === 0 && summary.nextUpcomingDays !== null
              ? ` · Next in ${summary.nextUpcomingDays}d`
              : ""}
          </Text>
        </View>

        {dueItems.length > 0 && onFilterDue ? (
          <Pressable
            style={styles.filterQueueBtn}
            onPress={() => {
              playKeyClick();
              onFilterDue();
            }}
          >
            <Text style={styles.filterQueueText}>FILTER DUE ({dueItems.length})</Text>
          </Pressable>
        ) : null}
      </View>

      {leadItem ? (
        <View style={styles.leadBox}>
          <View style={styles.leadInfo}>
            <View style={styles.leadMetaRow}>
              <View
                style={[
                  styles.reasonTag,
                  { backgroundColor: getReasonTag(leadItem.entry.reason).bg },
                ]}
              >
                <Text style={styles.reasonTagText}>
                  {getReasonTag(leadItem.entry.reason).label}
                </Text>
              </View>
              <Text style={styles.intervalText}>
                INTERVAL: {leadItem.entry.intervalDays}D · REP #
                {leadItem.entry.reps}
              </Text>
            </View>
            <Text style={styles.leadTitle} numberOfLines={2}>
              {leadItem.lesson.title}
            </Text>
            <Text style={styles.leadDesc}>
              Re-solve cleanly without hints to advance to the next memory
              interval and earn +{REVIEW_BONUS_XP} XP.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startBtn,
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onStartReview(leadItem.lesson);
            }}
          >
            <Text style={styles.startBtnText}>
              REVIEW (+{REVIEW_BONUS_XP} XP) →
            </Text>
          </Pressable>
        </View>
      ) : null}

      {dueItems.length > 1 ? (
        <View style={styles.queueChipsRow}>
          {dueItems.slice(1, 4).map((item) => (
            <Pressable
              key={item.lesson.id}
              style={styles.queueChip}
              onPress={() => {
                playKeyClick();
                onStartReview(item.lesson);
              }}
            >
              <Text style={styles.queueChipText} numberOfLines={1}>
                #{String(item.lesson.lesson_order).padStart(2, "0")}{" "}
                {item.lesson.title}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: StudioThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
      marginBottom: 14,
      ...HardShadow,
    },
    topAccent: {
      height: 5,
      backgroundColor: StudioColors.violet,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.border,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerLeft: {
      gap: 4,
    },
    dueBadge: {
      alignSelf: "flex-start",
      backgroundColor: StudioColors.yellow,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    caughtUpBadge: {
      backgroundColor: StudioColors.mint,
    },
    dueBadgeText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10,
      letterSpacing: 0.5,
    },
    statsLine: {
      color: colors.textSecondary,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "700",
    },
    filterQueueBtn: {
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
    },
    filterQueueText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10,
    },
    leadBox: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginHorizontal: 14,
      marginBottom: 12,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: colors.bg,
    },
    leadInfo: {
      flex: 1,
      minWidth: 210,
      gap: 4,
    },
    leadMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    reasonTag: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: StudioColors.border,
    },
    reasonTagText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 9,
      letterSpacing: 0.4,
    },
    intervalText: {
      color: colors.textMuted,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "800",
    },
    leadTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "900",
    },
    leadDesc: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    startBtn: {
      backgroundColor: StudioColors.lime,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.border,
      ...HardShadowSm,
    },
    startBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 11,
      letterSpacing: 0.4,
    },
    emptyCaughtUpText: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      paddingHorizontal: 14,
      paddingBottom: 14,
    },
    queueChipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    queueChip: {
      maxWidth: 230,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: StudioColors.border,
    },
    queueChipText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "800",
    },
  });
}
