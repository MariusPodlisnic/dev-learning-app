import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LessonEnrichment } from "../constants/curriculum";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import {
  ExplainStyle,
  isProTrackPreviewLesson,
  Lesson,
  TestCaseResult,
} from "../types/lesson";
import FormattedText from "./FormattedText";
import HintAccordion from "./HintAccordion";
import ProSolutionCard from "./ProSolutionCard";
import VisualLessonPanel from "./VisualLessonPanel";

interface LessonProblemPanelProps {
  selectedLesson: Lesson;
  activeTrack: string;
  completedLessons: Record<string, boolean>;
  activeTab: "problem" | "visual";
  onChangeActiveTab: (tab: "problem" | "visual") => void;
  explainStyle: ExplainStyle;
  onChangeExplainStyle: (style: ExplainStyle) => void;
  lessonEnrichment: LessonEnrichment | null;
  solvedQuizzes: Record<string, boolean>;
  quizSelection: number | null;
  onSelectQuizOption: (optionIdx: number) => void;
  onLoadGuidedSteps: (guidedCode: string) => void;
  testResults: TestCaseResult[] | null;
  isPremium: boolean;
  onOpenPaywall: () => void;
}

export default function LessonProblemPanel({
  selectedLesson,
  activeTrack,
  completedLessons,
  activeTab,
  onChangeActiveTab,
  explainStyle,
  onChangeExplainStyle,
  lessonEnrichment,
  solvedQuizzes,
  quizSelection,
  onSelectQuizOption,
  onLoadGuidedSteps,
  testResults,
  isPremium,
  onOpenPaywall,
}: LessonProblemPanelProps) {
  const styles = getStyles();
  const currentTrackTheme =
    TrackThemes[activeTrack] || TrackThemes.python_basics;

  return (
    <ScrollView
      style={styles.explanationPanel}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.lessonBadgeRow}>
        <Text
          style={[
            styles.lessonStepPill,
            {
              backgroundColor: currentTrackTheme.stickerBg,
            },
          ]}
        >
          {selectedLesson.category ||
            `MODULE ${String(selectedLesson.lesson_order).padStart(2, "0")}`}
        </Text>
        {completedLessons[selectedLesson.id] && (
          <Text style={styles.completedLessonPill}>SOLVED ✓</Text>
        )}
        {isProTrackPreviewLesson(selectedLesson) && !isPremium && (
          <Text style={styles.freePreviewLessonPill}>★ FREE PRO PREVIEW</Text>
        )}
        {selectedLesson.complexities?.time && (
          <Text style={styles.complexityBadge}>
            TIME: {selectedLesson.complexities.time}
          </Text>
        )}
        {selectedLesson.complexities?.space && (
          <Text style={styles.complexityBadge}>
            SPACE: {selectedLesson.complexities.space}
          </Text>
        )}
      </View>

      <Text style={styles.title}>{selectedLesson.title}</Text>
      <Text style={styles.subtitleDesc}>{selectedLesson.description}</Text>

      <View style={styles.tabBar}>
        <Pressable
          style={[
            styles.tabItem,
            activeTab === "problem" && styles.activeTabItem,
          ]}
          onPress={() => onChangeActiveTab("problem")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "problem" && styles.activeTabText,
            ]}
          >
            CONCEPT & MISSION
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabItem,
            activeTab === "visual" && styles.activeTabItem,
          ]}
          onPress={() => onChangeActiveTab("visual")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "visual" && styles.activeTabText,
            ]}
          >
            MEMORY SIMULATOR
          </Text>
        </Pressable>
      </View>

      {activeTab === "problem" ? (
        <View style={styles.problemCard}>
          {/* 3-Style Explanation Card */}
          <View style={styles.conceptBox}>
            <View style={styles.conceptTopRow}>
              <View style={styles.sectionStickerBadge}>
                <Text style={styles.sectionHeaderLabel}>LEARN THE CONCEPT</Text>
              </View>
              <View style={styles.explainStyleSwitcher}>
                {(
                  [
                    { id: "analogy", label: "SIMPLE ANALOGY" },
                    { id: "guide", label: "FULL GUIDE" },
                    { id: "cheatsheet", label: "CHEAT SHEET" },
                  ] as const
                ).map((mode) => {
                  const isActiveStyle = explainStyle === mode.id;
                  return (
                    <Pressable
                      key={mode.id}
                      style={[
                        styles.explainStyleBtn,
                        isActiveStyle && styles.explainStyleBtnActive,
                      ]}
                      onPress={() => onChangeExplainStyle(mode.id)}
                    >
                      <Text
                        style={[
                          styles.explainStyleBtnText,
                          isActiveStyle && styles.explainStyleBtnTextActive,
                        ]}
                      >
                        {mode.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {explainStyle === "analogy" && lessonEnrichment ? (
              <View style={styles.analogyContainer}>
                <View style={styles.realWorldBanner}>
                  <Text style={styles.realWorldLabel}>
                    WHY THIS MATTERS IN REAL APPS
                  </Text>
                  <Text style={styles.realWorldText}>
                    {lessonEnrichment.realWorldUse}
                  </Text>
                </View>

                <Text style={styles.analogyHeading}>
                  {lessonEnrichment.analogyTitle}
                </Text>
                <FormattedText
                  text={lessonEnrichment.analogyText}
                  style={styles.problemText}
                />
              </View>
            ) : explainStyle === "cheatsheet" && lessonEnrichment ? (
              <View style={styles.cheatSheetContainer}>
                <Text style={styles.cheatSheetIntro}>
                  Copy or reference this pattern while solving the mission on
                  the right:
                </Text>
                <View style={styles.codeBlockContainer}>
                  <View style={styles.codeBlockHeader}>
                    <Text style={styles.codeBlockLang}>
                      PYTHON SYNTAX PATTERN
                    </Text>
                  </View>
                  <Text style={styles.codeBlockText}>
                    {lessonEnrichment.cheatSheet}
                  </Text>
                </View>
              </View>
            ) : (
              <FormattedText
                text={selectedLesson.content}
                style={styles.problemText}
              />
            )}
          </View>

          {/* Interactive 1-Question Warm-Up Quiz */}
          {lessonEnrichment && (
            <View style={styles.quizCard}>
              <View style={styles.quizHeaderRow}>
                <View style={styles.quizSticker}>
                  <Text style={styles.quizBadgeText}>QUICK WARM-UP CHECK</Text>
                </View>
                <View
                  style={[
                    styles.quizXpPill,
                    solvedQuizzes[selectedLesson.id] && styles.quizXpPillDone,
                  ]}
                >
                  <Text style={styles.quizXpPillText}>
                    {solvedQuizzes[selectedLesson.id]
                      ? "✓ +10 XP EARNED"
                      : "+10 XP"}
                  </Text>
                </View>
              </View>
              <Text style={styles.quizQuestion}>
                {lessonEnrichment.quiz.question}
              </Text>

              <View style={styles.quizOptionsList}>
                {lessonEnrichment.quiz.options.map((opt, idx) => {
                  const isPicked = quizSelection === idx;
                  const isCorrect = idx === lessonEnrichment.quiz.correctIndex;
                  const showSuccess = isPicked && isCorrect;
                  const showWrong = isPicked && !isCorrect;

                  return (
                    <Pressable
                      key={idx}
                      style={[
                        styles.quizOptionBtn,
                        showSuccess && styles.quizOptionCorrect,
                        showWrong && styles.quizOptionWrong,
                      ]}
                      onPress={() => onSelectQuizOption(idx)}
                    >
                      <Text
                        style={[
                          styles.quizOptionText,
                          (showSuccess || showWrong) && {
                            color: "#111111",
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {showSuccess
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

              {quizSelection !== null && (
                <View
                  style={[
                    styles.quizFeedbackBox,
                    quizSelection === lessonEnrichment.quiz.correctIndex
                      ? styles.quizFeedbackSuccess
                      : styles.quizFeedbackRetry,
                  ]}
                >
                  <Text style={styles.quizFeedbackText}>
                    {quizSelection === lessonEnrichment.quiz.correctIndex
                      ? `✓ Spot on! ${lessonEnrichment.quiz.explanation}`
                      : "→ Not quite — tap another option to test your intuition!"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Common Pitfall Warning Card */}
          {lessonEnrichment?.commonPitfall && (
            <View style={styles.pitfallCard}>
              <View style={styles.pitfallHeaderRow}>
                <View style={styles.pitfallSticker}>
                  <Text style={styles.pitfallStickerText}>
                    ⚠️ COMMON PITFALL TO AVOID
                  </Text>
                </View>
              </View>
              <Text style={styles.pitfallTitle}>
                {lessonEnrichment.commonPitfall.title}
              </Text>
              <View style={styles.pitfallCompareRow}>
                <View style={styles.pitfallWrongBox}>
                  <Text style={styles.pitfallWrongLabel}>✕ COMMON MISTAKE</Text>
                  <Text style={styles.pitfallCodeText}>
                    {lessonEnrichment.commonPitfall.wrongCode}
                  </Text>
                </View>
                <View style={styles.pitfallRightBox}>
                  <Text style={styles.pitfallRightLabel}>
                    ✓ CORRECT PATTERN
                  </Text>
                  <Text style={styles.pitfallCodeText}>
                    {lessonEnrichment.commonPitfall.rightCode}
                  </Text>
                </View>
              </View>
              <Text style={styles.pitfallExplanation}>
                {lessonEnrichment.commonPitfall.explanation}
              </Text>
            </View>
          )}

          <View style={styles.assignmentBox}>
            <View style={styles.assignmentHeaderRow}>
              <View style={styles.missionSticker}>
                <Text style={styles.assignmentHeaderLabel}>
                  YOUR CODING MISSION
                </Text>
              </View>
              <View style={styles.missionRightActions}>
                {lessonEnrichment?.guidedCode && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.guidedTemplateBtn,
                      pressed && {
                        transform: [{ translateX: 1 }, { translateY: 1 }],
                      },
                    ]}
                    onPress={() => {
                      if (lessonEnrichment.guidedCode) {
                        onLoadGuidedSteps(lessonEnrichment.guidedCode);
                      }
                    }}
                  >
                    <Text style={styles.guidedTemplateBtnText}>
                      🧩 LOAD GUIDED STEPS
                    </Text>
                  </Pressable>
                )}
                <View style={styles.xpRewardPill}>
                  <Text style={styles.xpRewardPillText}>+50 XP</Text>
                </View>
              </View>
            </View>

            {selectedLesson.assignment && (
              <FormattedText
                text={selectedLesson.assignment}
                style={styles.assignmentDescription}
              />
            )}

            {selectedLesson.constraints &&
              selectedLesson.constraints.length > 0 && (
                <View style={styles.checklistContainer}>
                  {selectedLesson.constraints.map((c, i) => {
                    const isStepPassed = testResults?.[i]?.passed;
                    return (
                      <View key={i} style={styles.missionRow}>
                        <View
                          style={[
                            styles.missionBulletBox,
                            isStepPassed && {
                              backgroundColor: StudioColors.lime,
                            },
                          ]}
                        >
                          <Text style={styles.missionBullet}>
                            {isStepPassed ? "✓" : i + 1}
                          </Text>
                        </View>
                        <FormattedText text={c} style={styles.missionText} />
                      </View>
                    );
                  })}
                </View>
              )}
          </View>

          {selectedLesson.examples?.map((ex, i) => (
            <View key={i} style={styles.exampleBlock}>
              <Text style={styles.exampleTitle}>EXAMPLE 0{i + 1}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleCode}>
                  <Text style={styles.bold}>Input: </Text>
                  {ex.input}
                </Text>
                <Text style={styles.exampleCode}>
                  <Text style={styles.bold}>Output: </Text>
                  {ex.output}
                </Text>
                {ex.explanation && (
                  <Text style={styles.exampleCode}>
                    <Text style={styles.bold}>Why: </Text>
                    {ex.explanation}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* Pro Official Solution & Line-by-Line Walkthrough */}
          <ProSolutionCard
            selectedLesson={selectedLesson}
            lessonEnrichment={lessonEnrichment}
            isPremium={isPremium}
            onLoadSolution={onLoadGuidedSteps}
            onOpenPaywall={onOpenPaywall}
          />
        </View>
      ) : (
        <VisualLessonPanel
          type={selectedLesson.visual_type || "memory"}
          data={selectedLesson.visual_data}
        />
      )}
      <HintAccordion hints={selectedLesson.hints || []} />
    </ScrollView>
  );
}

const getStyles = () =>
  StyleSheet.create({
    explanationPanel: { flex: 1, paddingRight: 8 },
    lessonBadgeRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
      alignItems: "center",
      flexWrap: "wrap",
    },
    lessonStepPill: {
      backgroundColor: StudioColors.yellow,
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    completedLessonPill: {
      backgroundColor: StudioColors.mint,
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      letterSpacing: 0.6,
    },
    freePreviewLessonPill: {
      backgroundColor: StudioColors.lime,
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      letterSpacing: 0.6,
    },
    complexityBadge: {
      backgroundColor: StudioColors.surface,
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -0.6,
      marginBottom: 4,
    },
    subtitleDesc: {
      color: StudioColors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 14,
      lineHeight: 21,
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: StudioColors.surface,
      borderRadius: 8,
      padding: 4,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: StudioColors.border,
      ...HardShadowSm,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 5,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    activeTabItem: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    tabText: {
      color: StudioColors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    activeTabText: { color: StudioColors.ink },
    problemCard: { paddingBottom: 20 },
    sectionStickerBadge: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 4,
    },
    sectionHeaderLabel: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    conceptBox: {
      backgroundColor: StudioColors.surface,
      padding: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      marginBottom: 16,
      ...HardShadow,
    },
    conceptTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
      paddingBottom: 12,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.border,
    },
    explainStyleSwitcher: {
      flexDirection: "row",
      backgroundColor: StudioColors.bg,
      padding: 3,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      gap: 3,
    },
    explainStyleBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 4,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    explainStyleBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    explainStyleBtnText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    explainStyleBtnTextActive: {
      color: StudioColors.ink,
    },
    analogyContainer: {
      gap: 12,
    },
    realWorldBanner: {
      backgroundColor: StudioColors.bg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderLeftWidth: 5,
      borderLeftColor: StudioColors.border,
      padding: 13,
      gap: 4,
    },
    realWorldLabel: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    realWorldText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 20,
    },
    analogyHeading: {
      color: StudioColors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 4,
    },
    cheatSheetContainer: {
      gap: 8,
    },
    cheatSheetIntro: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
    },
    codeBlockContainer: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    codeBlockHeader: {
      backgroundColor: StudioColors.codeSurface,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: StudioColors.codeBorder,
    },
    codeBlockLang: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    codeBlockText: {
      color: StudioColors.codeText,
      fontFamily: MonoFont,
      fontSize: 13,
      lineHeight: 20,
      padding: 12,
      ...Platform.select({
        web: {
          whiteSpace: "pre-wrap" as any,
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    quizCard: {
      backgroundColor: StudioColors.surface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 18,
      marginBottom: 16,
      gap: 10,
      ...HardShadow,
    },
    quizHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    quizSticker: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
    },
    quizBadgeText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    quizXpPill: {
      backgroundColor: StudioColors.bg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    quizXpPillDone: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    quizXpPillText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    quizQuestion: {
      color: StudioColors.textPrimary,
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 21,
    },
    quizOptionsList: {
      gap: 8,
    },
    quizOptionBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    quizOptionCorrect: {
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.lime,
    },
    quizOptionWrong: {
      borderColor: StudioColors.ink,
      backgroundColor: "#FECDD3",
    },
    quizOptionText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    quizFeedbackBox: {
      padding: 10,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    quizFeedbackSuccess: {
      backgroundColor: "#D1FAE5",
    },
    quizFeedbackRetry: {
      backgroundColor: "#FEF3C7",
    },
    quizFeedbackText: {
      color: StudioColors.ink,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },
    problemText: {
      color: StudioColors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 24,
      flexShrink: 1,
      ...Platform.select({
        web: {
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    pitfallCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 16,
      borderRadius: 10,
      marginBottom: 16,
      gap: 10,
      overflow: "hidden",
      ...HardShadowSm,
    },
    pitfallHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pitfallSticker: {
      backgroundColor: StudioColors.coral,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
    },
    pitfallStickerText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    pitfallTitle: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 20,
    },
    pitfallCompareRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    pitfallWrongBox: {
      flex: 1,
      minWidth: 180,
      backgroundColor: "#1C1417",
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.coral,
      padding: 10,
      gap: 4,
      overflow: "hidden",
    },
    pitfallRightBox: {
      flex: 1,
      minWidth: 180,
      backgroundColor: "#121C16",
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.lime,
      padding: 10,
      gap: 4,
      overflow: "hidden",
    },
    pitfallWrongLabel: {
      color: StudioColors.coral,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    pitfallRightLabel: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    pitfallCodeText: {
      color: "#F4F0E6",
      fontSize: 12,
      lineHeight: 18,
      fontFamily: MonoFont,
      ...Platform.select({
        web: {
          whiteSpace: "pre-wrap" as any,
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    pitfallExplanation: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 19,
    },
    assignmentBox: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 18,
      borderRadius: 10,
      marginBottom: 16,
      overflow: "hidden",
      ...HardShadow,
    },
    assignmentHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    missionRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    guidedTemplateBtn: {
      backgroundColor: StudioColors.violet,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    guidedTemplateBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    missionSticker: {
      backgroundColor: StudioColors.mint,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
    },
    assignmentHeaderLabel: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    xpRewardPill: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    xpRewardPillText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    assignmentDescription: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 22,
      marginBottom: 12,
      flexShrink: 1,
      ...Platform.select({
        web: {
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    checklistContainer: {
      backgroundColor: StudioColors.bg,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      gap: 10,
      overflow: "hidden",
      width: "100%",
    },
    missionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      width: "100%",
      minWidth: 0,
    },
    missionBulletBox: {
      width: 22,
      height: 22,
      marginTop: 1,
      flexShrink: 0,
      borderRadius: 4,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    missionBullet: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    missionText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
      flexShrink: 1,
      ...Platform.select({
        web: {
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    exampleBlock: { marginBottom: 16 },
    exampleTitle: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    exampleBox: {
      backgroundColor: StudioColors.codeBg,
      padding: 14,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
      ...HardShadowSm,
    },
    exampleCode: {
      color: StudioColors.codeText,
      fontSize: 13,
      fontFamily: MonoFont,
      marginBottom: 4,
      lineHeight: 20,
      ...Platform.select({
        web: {
          whiteSpace: "pre-wrap" as any,
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    bold: { color: StudioColors.lime, fontWeight: "800" },
  });
