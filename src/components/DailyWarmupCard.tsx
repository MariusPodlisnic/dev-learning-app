import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { getTodayDateKey } from "../constants/streaks";
import { getLessonEnrichment } from "../constants/curriculum";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { isLessonLockedForUser } from "../types/lesson";
import {
  playErrorBuzz,
  playSuccessChime,
} from "../utils/soundEffects";
import { Lesson } from "./RoadmapTree";

export { getTodayDateKey };

interface DailyWarmupCardProps {
  lessons: Lesson[];
  isPremium: boolean;
  dailyCompletedDate: string | null;
  streakCount?: number;
  onClaimDailyWarmup: (dateKey: string, bonusXp: number) => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export default function DailyWarmupCard({
  lessons,
  isPremium,
  dailyCompletedDate,
  streakCount = 0,
  onClaimDailyWarmup,
  onSelectLesson,
}: DailyWarmupCardProps) {
  const todayKey = getTodayDateKey();
  const isClaimedToday = dailyCompletedDate === todayKey;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Deterministically select today's accessible warmup lesson & quiz
  const dailyData = useMemo(() => {
    const unlockedLessons = lessons.filter(
      (l) => !isLessonLockedForUser(l, isPremium),
    );
    const pool = unlockedLessons.length > 0 ? unlockedLessons : lessons;
    if (pool.length === 0) return null;

    let hash = 0;
    for (let i = 0; i < todayKey.length; i++) {
      hash = (hash * 31 + todayKey.charCodeAt(i)) >>> 0;
    }
    const chosenLesson = pool[hash % pool.length];
    const enrichment = getLessonEnrichment(chosenLesson);
    return {
      lesson: chosenLesson,
      enrichment,
    };
  }, [lessons, isPremium, todayKey]);

  if (!dailyData) return null;

  const { lesson, enrichment } = dailyData;
  const quiz = enrichment.quiz;

  function handlePickOption(idx: number) {
    setSelectedOption(idx);
    if (idx === quiz.correctIndex) {
      playSuccessChime();
      if (!isClaimedToday) {
        onClaimDailyWarmup(todayKey, 25);
      }
    } else {
      playErrorBuzz();
    }
  }

  return (
    <View
      style={[
        styles.card,
        isClaimedToday && {
          borderColor: StudioColors.ink,
          backgroundColor: StudioColors.surface,
        },
      ]}
    >
      <View
        style={[
          styles.leftStripe,
          {
            backgroundColor: isClaimedToday
              ? StudioColors.mint
              : StudioColors.yellow,
          },
        ]}
      />

      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.warmupSticker,
                isClaimedToday && { backgroundColor: StudioColors.mint },
              ]}
            >
              <Text style={styles.warmupStickerText}>
                {isClaimedToday
                  ? "✓ DAILY WARM-UP COMPLETED"
                  : "⚡ DAILY 60-SECOND WARM-UP"}
              </Text>
            </View>
            <View
              style={[
                styles.xpBonusPill,
                isClaimedToday && { backgroundColor: StudioColors.mint },
              ]}
            >
              <Text style={styles.xpBonusText}>
                {isClaimedToday ? "✓ +25 XP CLAIMED" : "+25 BONUS XP"}
              </Text>
            </View>
            {!isClaimedToday && streakCount > 0 && (
              <View style={styles.streakAlertPill}>
                <Text style={styles.streakAlertText}>
                  🔥 {streakCount}D STREAK AT STAKE
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.questionPreviewTitle} numberOfLines={2}>
            {quiz.question}
          </Text>
          <Text style={styles.topicSubtext} numberOfLines={1}>
            Today&apos;s Featured Topic: {lesson.title}
          </Text>
        </View>

        <View style={styles.topActions}>
          <Pressable
            style={({ pressed }) => [
              styles.toggleBtn,
              expanded && styles.toggleBtnActive,
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={() => setExpanded((prev) => !prev)}
          >
            <Text style={styles.toggleBtnText}>
              {expanded
                ? "HIDE QUIZ ▲"
                : isClaimedToday
                  ? "REVIEW ANSWER ▼"
                  : "SOLVE IN 30s ▼"}
            </Text>
          </Pressable>
        </View>
      </View>

      {expanded && (
        <View style={styles.quizExpandedBody}>
          <View style={styles.optionsGrid}>
            {quiz.options.map((opt, idx) => {
              const isPicked =
                selectedOption === idx ||
                (isClaimedToday && idx === quiz.correctIndex);
              const isRight = idx === quiz.correctIndex;
              const showRight = isPicked && isRight;
              const showWrong = selectedOption === idx && !isRight;

              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.optionBtn,
                    showRight && styles.optionBtnRight,
                    showWrong && styles.optionBtnWrong,
                  ]}
                  onPress={() => handlePickOption(idx)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (showRight || showWrong) && {
                        color: "#111111",
                        fontWeight: "900",
                      },
                    ]}
                  >
                    {showRight
                      ? "[✓] "
                      : showWrong
                        ? "[✕] "
                        : `[${String.fromCharCode(65 + idx)}] `}
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {(selectedOption !== null || isClaimedToday) && (
            <View
              style={[
                styles.feedbackBanner,
                selectedOption === quiz.correctIndex || isClaimedToday
                  ? styles.feedbackSuccess
                  : styles.feedbackRetry,
              ]}
            >
              <Text style={styles.feedbackText}>
                {selectedOption === quiz.correctIndex || isClaimedToday
                  ? `🔥 +25 XP Claimed! ${quiz.explanation}`
                  : "→ Almost! Try another option to claim today's +25 Bonus XP."}
              </Text>
              <Pressable
                style={styles.openLessonLinkBtn}
                onPress={() => onSelectLesson(lesson)}
              >
                <Text style={styles.openLessonLinkText}>
                  PRACTICE IN STUDIO →
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingVertical: 14,
    paddingHorizontal: 18,
    paddingLeft: 22,
    marginTop: 14,
    position: "relative",
    overflow: "hidden",
    ...HardShadow,
  },
  leftStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 7,
    borderRightWidth: 1.5,
    borderRightColor: StudioColors.ink,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  topLeft: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 2,
  },
  warmupSticker: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warmupStickerText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  xpBonusPill: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpBonusText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  streakAlertPill: {
    backgroundColor: StudioColors.coral,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  streakAlertText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  questionPreviewTitle: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  topicSubtext: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  toggleBtnActive: {
    backgroundColor: StudioColors.bg,
  },
  toggleBtnText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  quizExpandedBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: StudioColors.borderSubtle,
    gap: 10,
  },
  optionsGrid: {
    gap: 8,
  },
  optionBtn: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  optionBtnRight: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
  },
  optionBtnWrong: {
    backgroundColor: "#FECDD3",
    borderColor: StudioColors.ink,
  },
  optionText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  feedbackSuccess: {
    backgroundColor: "#D1FAE5",
  },
  feedbackRetry: {
    backgroundColor: "#FEF3C7",
  },
  feedbackText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    minWidth: 200,
    lineHeight: 18,
  },
  openLessonLinkBtn: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  openLessonLinkText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
});
