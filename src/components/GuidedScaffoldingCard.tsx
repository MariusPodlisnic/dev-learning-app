import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { StudioIcon, Text } from "./StudioIcon";
import { LessonEnrichment } from "../constants/curriculum";
import {
  HardShadowSm,
  MonoFont,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { Lesson, PracticeChallenge } from "../types/lesson";
import {
  buildGuidedScaffoldPlan,
  findUnfilledScaffoldLines,
} from "../utils/scaffolding";
import { playKeyClick } from "../utils/soundEffects";
import FormattedText from "./FormattedText";

interface GuidedScaffoldingCardProps {
  selectedLesson: Lesson;
  lessonEnrichment: LessonEnrichment | null;
  activePracticeDrill?: PracticeChallenge;
  userCode?: string;
  onLoadScaffold: (scaffoldCode: string) => void;
}

export default function GuidedScaffoldingCard({
  selectedLesson,
  lessonEnrichment,
  activePracticeDrill,
  userCode = "",
  onLoadScaffold,
}: GuidedScaffoldingCardProps) {
  const styles = useThemedStyles(createStyles);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [cluesByStage, setCluesByStage] = useState<
    Record<string, Record<number, boolean>>
  >({});
  const [confirmStage, setConfirmStage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stageKey = activePracticeDrill
    ? `${selectedLesson.id}::${activePracticeDrill.id}`
    : `${selectedLesson.id}::core`;

  const stepsExpanded = expandedStage === stageKey;
  const revealedClues = cluesByStage[stageKey] || {};
  const confirmReplace = confirmStage === stageKey;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const plan = useMemo(
    () =>
      buildGuidedScaffoldPlan(
        selectedLesson,
        lessonEnrichment,
        activePracticeDrill,
      ),
    [selectedLesson, lessonEnrichment, activePracticeDrill],
  );

  const starterNormalized = (
    activePracticeDrill?.initial_code ||
    selectedLesson.initial_code ||
    ""
  )
    .replace(/\\n/g, "\n")
    .trim();
  const currentNormalized = (userCode || "").replace(/\\n/g, "\n").trim();
  const hasCustomEdits =
    Boolean(currentNormalized) &&
    currentNormalized !== starterNormalized &&
    currentNormalized !== plan.scaffoldCode.trim();
  const activeBlankCount = findUnfilledScaffoldLines(userCode).length;

  function handleLoadPress() {
    playKeyClick();
    if (hasCustomEdits && !confirmReplace) {
      setConfirmStage(stageKey);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setConfirmStage((prev) => (prev === stageKey ? null : prev));
      }, 2600);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirmStage(null);
    onLoadScaffold(plan.scaffoldCode);
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <StudioIcon name="puzzle" size={13} />
          <Text style={styles.badgeText}>GUIDED SCAFFOLDING MODE</Text>
        </View>
        <View style={styles.freeTag}>
          <Text style={styles.freeTagText}>FREE · 0★ PENALTY</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Stuck on a blank editor? Use step clues or load a fill-in-the-blank{" "}
        <Text style={styles.inlineCode}>___</Text> skeleton without spoiling
        your solution stars.
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.toggleBtn,
            stepsExpanded && styles.toggleBtnActive,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            setExpandedStage((prev) => (prev === stageKey ? null : stageKey));
          }}
        >
          <Text
            style={[
              styles.toggleBtnText,
              stepsExpanded && styles.inkText,
            ]}
          >
            {stepsExpanded ? "▲ HIDE STEP CLUES" : `▼ STEP CLUES (${plan.steps.length})`}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.loadBtn,
            confirmReplace && styles.loadBtnConfirm,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={handleLoadPress}
        >
          <Text style={styles.loadBtnText}>
            {confirmReplace
              ? "REPLACE DRAFT?"
              : activeBlankCount > 0
                ? `✓ RELOAD SKELETON (${plan.blankCount} BLANKS)`
                : `⬇ LOAD SKELETON (${plan.blankCount} BLANKS)`}
          </Text>
        </Pressable>
      </View>

      {stepsExpanded && (
        <View style={styles.stepsList}>
          {plan.steps.map((step) => {
            const clueOpen = Boolean(revealedClues[step.stepNumber]);
            return (
              <View key={step.stepNumber} style={styles.stepBox}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>
                      0{step.stepNumber}
                    </Text>
                  </View>
                  <View style={styles.stepInstructionWrap}>
                    <FormattedText
                      text={step.instruction}
                      style={styles.stepInstructionText}
                    />
                  </View>
                  <Pressable
                    style={[
                      styles.clueToggleBtn,
                      clueOpen && styles.clueToggleBtnOpen,
                    ]}
                    onPress={() => {
                      playKeyClick();
                      setCluesByStage((prev) => {
                        const stageClues = prev[stageKey] || {};
                        return {
                          ...prev,
                          [stageKey]: {
                            ...stageClues,
                            [step.stepNumber]: !stageClues[step.stepNumber],
                          },
                        };
                      });
                    }}
                  >
                    <Text style={styles.clueToggleText}>
                      {clueOpen ? "HIDE CLUE" : "SYNTAX CLUE"}
                    </Text>
                  </Pressable>
                </View>

                {clueOpen && (
                  <View style={styles.clueBox}>
                    <FormattedText
                      text={step.syntaxClue}
                      style={styles.clueText}
                    />
                  </View>
                )}
              </View>
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
      marginBottom: 16,
      backgroundColor: StudioColors.surface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderLeftWidth: 4,
      borderLeftColor: StudioColors.mint,
      padding: 14,
      gap: 9,
      ...HardShadowSm,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.mint,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    freeTag: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1,
      borderColor: StudioColors.border,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    freeTagText: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    subtitle: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "600",
    },
    inlineCode: {
      fontFamily: MonoFont,
      fontWeight: "900",
      color: StudioColors.textPrimary,
    },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    toggleBtn: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    toggleBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    toggleBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    inkText: {
      color: StudioColors.ink,
    },
    loadBtn: {
      flex: 1,
      minWidth: 170,
      backgroundColor: StudioColors.mint,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 11,
      paddingVertical: 7,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    loadBtnConfirm: {
      backgroundColor: StudioColors.coral,
    },
    loadBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    stepsList: {
      gap: 7,
      marginTop: 2,
    },
    stepBox: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      padding: 9,
      gap: 7,
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    stepNumBadge: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: StudioColors.border,
    },
    stepNumText: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stepInstructionWrap: {
      flex: 1,
    },
    stepInstructionText: {
      color: StudioColors.textPrimary,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "600",
    },
    clueToggleBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 4,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    clueToggleBtnOpen: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    clueToggleText: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    clueBox: {
      backgroundColor: "rgba(184, 255, 59, 0.14)",
      borderWidth: 1,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    clueText: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      lineHeight: 17.5,
      fontWeight: "600",
    },
  });
