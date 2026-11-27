import React, { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { StudioIcon, Text } from "./StudioIcon";
import { LessonEnrichment } from "../constants/curriculum";
import {
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  ExplainStyle,
  getLessonStageProgress,
  getLessonStarRating,
  isLessonStageCompleted,
  isProTrackPreviewLesson,
  Lesson,
  TestCaseResult,
} from "../types/lesson";
import { buildOrganizedLearnView } from "../utils/lessonContent";
import type { PythonTraceResult } from "../utils/pythonTrace";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
} from "../utils/soundEffects";
import FormattedText, { renderHighlightedPython } from "./FormattedText";
import GuidedScaffoldingCard from "./GuidedScaffoldingCard";
import HintAccordion from "./HintAccordion";
import { getLessonProblemStyles } from "./lessonProblemStyles";
import ProSolutionCard from "./ProSolutionCard";
import VisualLessonPanel from "./VisualLessonPanel";

interface LessonProblemPanelProps {
  selectedLesson: Lesson;
  activeTrack: string;
  completedLessons: Record<string, boolean>;
  completedChallenges?: Record<string, boolean>;
  peekedSolutions?: Record<string, boolean>;
  activeChallengeIdx?: number;
  onSelectChallengeIdx?: (idx: number) => void;
  activeTab: "problem" | "mission" | "visual";
  onChangeActiveTab: (tab: "problem" | "mission" | "visual") => void;
  explainStyle: ExplainStyle;
  onChangeExplainStyle: (style: ExplainStyle) => void;
  lessonEnrichment: LessonEnrichment | null;
  onLoadGuidedSteps: (guidedCode: string) => void;
  userCode?: string;
  onApplyScaffold?: (scaffoldCode: string) => void;
  liveTraceResult?: PythonTraceResult | null;
  isTracing?: boolean;
  onRunLiveTrace?: (customDriver?: string) => void;
  onTracedLineChange?: (lineNum: number | null) => void;
  testResults: TestCaseResult[] | null;
  isPremium: boolean;
  onOpenPaywall: () => void;
  onRequestScrollTop?: () => void;
}

export default function LessonProblemPanel({
  selectedLesson,
  activeTrack,
  completedLessons,
  completedChallenges = {},
  peekedSolutions = {},
  activeChallengeIdx = 0,
  onSelectChallengeIdx,
  activeTab,
  onChangeActiveTab,
  explainStyle,
  onChangeExplainStyle,
  lessonEnrichment,
  onLoadGuidedSteps,
  userCode = "",
  onApplyScaffold,
  liveTraceResult = null,
  isTracing = false,
  onRunLiveTrace,
  onTracedLineChange,
  testResults,
  isPremium,
  onOpenPaywall,
  onRequestScrollTop,
}: LessonProblemPanelProps) {
  const styles = useThemedStyles(getLessonProblemStyles);
  const onScrollTopRef = useRef(onRequestScrollTop);
  useEffect(() => {
    onScrollTopRef.current = onRequestScrollTop;
  });
  const [quizAnswerByLesson, setQuizAnswerByLesson] = useState<
    Record<string, number>
  >({});
  const [showMasteryInfo, setShowMasteryInfo] = useState<boolean>(false);
  const selectedQuizOpt = quizAnswerByLesson[selectedLesson.id] ?? null;
  const currentTrackTheme =
    TrackThemes[activeTrack] || TrackThemes.python_basics;
  const learnView = buildOrganizedLearnView(
    selectedLesson.content,
    lessonEnrichment,
  );

  function scrollToTop() {
    onScrollTopRef.current?.();
  }

  function handleSwitchTab(tab: "problem" | "mission" | "visual") {
    playKeyClick();
    onChangeActiveTab(tab);
    scrollToTop();
  }

  useEffect(() => {
    onScrollTopRef.current?.();
  }, [activeTab, selectedLesson.id, activeChallengeIdx]);

  const practiceDrills = selectedLesson.practiceChallenges || [];
  const {
    solvedStages: solvedStagesCount,
    totalStages: totalChallengeStages,
  } = getLessonStageProgress(
    selectedLesson,
    completedLessons,
    completedChallenges,
  );
  const hasMultipleChallenges = totalChallengeStages > 1;
  const activePracticeDrill =
    activeChallengeIdx > 0 ? practiceDrills[activeChallengeIdx - 1] : null;
  const allTestsPassed = Boolean(
    testResults && testResults.length > 0 && testResults.every((r) => r.passed),
  );
  const activeInitialCode =
    (activePracticeDrill
      ? activePracticeDrill.initial_code
      : selectedLesson.initial_code) || "";
  const usesClassSolutionWrapper = /\bclass\s+Solution\b/.test(
    activeInitialCode || userCode,
  );
  const starRating = getLessonStarRating(
    selectedLesson,
    completedLessons,
    completedChallenges,
    peekedSolutions,
  );
  const hasPeekedSolution = Boolean(peekedSolutions[selectedLesson.id]);

  return (
    <View style={styles.explanationPanel}>
      <View style={styles.lessonBadgeRow}>
        <Text
          style={[
            styles.lessonStepPill,
            {
              backgroundColor: selectedLesson.is_recap
                ? StudioColors.yellow
                : currentTrackTheme.stickerBg,
            },
          ]}
        >
          {selectedLesson.category ||
            `MODULE ${String(selectedLesson.lesson_order).padStart(2, "0")}`}
        </Text>
        {selectedLesson.is_recap && (
          <Text style={styles.recapBadgePill}>
            🏆 CHAPTER {selectedLesson.recap_chapter || ""} CAPSTONE
          </Text>
        )}
        {completedLessons[selectedLesson.id] && (
          <Text style={styles.completedLessonPill}>SOLVED ✓</Text>
        )}
        {isProTrackPreviewLesson(selectedLesson) && !isPremium && (
          <Text style={styles.freePreviewLessonPill}>★ FREE PRO PREVIEW</Text>
        )}
        {activeTrack !== "python_basics" && selectedLesson.complexities?.time && (
          <Text style={styles.complexityBadge}>
            TIME: {selectedLesson.complexities.time}
          </Text>
        )}
        {activeTrack !== "python_basics" && selectedLesson.complexities?.space && (
          <Text style={styles.complexityBadge}>
            SPACE: {selectedLesson.complexities.space}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Module mastery ${starRating} of 3 stars`}
          onPress={() => {
            playKeyClick();
            setShowMasteryInfo((prev) => !prev);
          }}
          style={({ pressed }) => [
            styles.masteryStarsPill,
            styles.masteryHeaderRightPill,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.masteryStarsPillGlyph}>
            {[1, 2, 3].map((s) => (s <= starRating ? "★" : "☆")).join("")}
          </Text>
          <Text style={styles.masteryStarsPillText}>{starRating}/3</Text>
        </Pressable>
      </View>

      {showMasteryInfo && (
        <View style={styles.masteryCriteriaRow}>
          <View
            style={[
              styles.masteryCriterionChip,
              starRating >= 1 && styles.masteryCriterionChipEarned,
            ]}
          >
            <Text
              style={[
                styles.masteryCriterionText,
                starRating >= 1 && styles.masteryCriterionTextEarned,
              ]}
            >
              {starRating >= 1 ? "★" : "☆"} Core Cleared
            </Text>
          </View>
          <View
            style={[
              styles.masteryCriterionChip,
              starRating >= 2 && styles.masteryCriterionChipEarned,
            ]}
          >
            <Text
              style={[
                styles.masteryCriterionText,
                starRating >= 2 && styles.masteryCriterionTextEarned,
              ]}
            >
              {starRating >= 2 ? "★" : "☆"}{" "}
              {hasMultipleChallenges ? "Drills Applied" : "All Tests Passed"}
            </Text>
          </View>
          <View
            style={[
              styles.masteryCriterionChip,
              starRating >= 3 && styles.masteryCriterionChipEarned,
              hasPeekedSolution &&
                starRating < 3 &&
                styles.masteryCriterionChipWarn,
            ]}
          >
            <Text
              style={[
                styles.masteryCriterionText,
                starRating >= 3 && styles.masteryCriterionTextEarned,
              ]}
            >
              {starRating >= 3 ? "★" : "☆"}{" "}
              {hasPeekedSolution && starRating < 3
                ? "Re-solve w/o Solution"
                : "No Solution Peek"}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.title}>
        {activePracticeDrill ? activePracticeDrill.title : selectedLesson.title}
      </Text>
      <Text style={styles.subtitleDesc}>
        {activePracticeDrill
          ? `Concept Practice for "${selectedLesson.title}" — Mission Brief & Clues only.`
          : selectedLesson.description}
      </Text>

      {selectedLesson.is_recap &&
        !activePracticeDrill &&
        selectedLesson.recap_topics &&
        selectedLesson.recap_topics.length > 0 && (
          <View style={styles.recapTopicsCard}>
            <Text style={styles.recapTopicsEyebrow}>
              🏆 CUMULATIVE CHAPTER RECAP · COMBINES:
            </Text>
            <View style={styles.recapTopicsRow}>
              {selectedLesson.recap_topics.map((topic, tIdx) => (
                <View key={tIdx} style={styles.recapTopicChip}>
                  <Text style={styles.recapTopicChipText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Slim Single-Row Stage Strip (rendered only when lesson has practice drills) */}
      {hasMultipleChallenges && (
        <View style={styles.stageStripBar}>
          <View style={styles.practiceStagePillsRow}>
            {(() => {
              const isStage0Selected = activeChallengeIdx === 0;
              const isStage0Solved = isLessonStageCompleted(
                selectedLesson,
                0,
                completedLessons,
                completedChallenges,
              );
              return (
                <Pressable
                  onPress={() => {
                    playKeyClick();
                    onSelectChallengeIdx?.(0);
                  }}
                  style={[
                    styles.practiceStagePill,
                    isStage0Selected && styles.practiceStagePillActive,
                    isStage0Solved &&
                      !isStage0Selected &&
                      styles.practiceStagePillSolved,
                  ]}
                >
                  <StudioIcon name="practice_1" size={16} />
                  <Text
                    style={[
                      styles.practiceStagePillLabel,
                      isStage0Selected && styles.practiceStagePillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {isStage0Solved ? "✓ 01 Core" : "01 Core"}
                  </Text>
                </Pressable>
              );
            })()}

            {practiceDrills.map((drill, dIdx) => {
              const stageIdx = dIdx + 1;
              const isSelected = activeChallengeIdx === stageIdx;
              const isSolved = isLessonStageCompleted(
                selectedLesson,
                stageIdx,
                completedLessons,
                completedChallenges,
              );
              const stageNumber = String(stageIdx + 1).padStart(2, "0");
              const stageIconName =
                stageIdx === 1
                  ? "practice_2"
                  : stageIdx === 2
                    ? "practice_3"
                    : "practice_4";
              const shortTag =
                stageIdx === 1
                  ? "Drill I"
                  : stageIdx === 2
                    ? "Drill II"
                    : "Boss";
              return (
                <Pressable
                  key={drill.id}
                  onPress={() => {
                    playKeyClick();
                    onSelectChallengeIdx?.(stageIdx);
                  }}
                  style={[
                    styles.practiceStagePill,
                    isSelected && styles.practiceStagePillActive,
                    isSolved && !isSelected && styles.practiceStagePillSolved,
                  ]}
                >
                  <StudioIcon name={stageIconName} size={16} />
                  <Text
                    style={[
                      styles.practiceStagePillLabel,
                      isSelected && styles.practiceStagePillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {isSolved
                      ? `✓ ${stageNumber} ${shortTag}`
                      : `${stageNumber} ${shortTag}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.stageProgressMicro}>
            {solvedStagesCount}/{totalChallengeStages}
          </Text>
        </View>
      )}

      {/* When on Practice Challenge 2..N: Focused Mission Brief + Clues Only (No Deep Explanation) */}
      {activePracticeDrill ? (
        <View style={styles.problemCard}>
          <View style={styles.assignmentBox}>
            <View style={styles.missionCommandTopBar} />
            <View style={styles.assignmentHeaderRow}>
              <View style={styles.missionSticker}>
                <StudioIcon
                  name={
                    activeChallengeIdx === 1
                      ? "practice_2"
                      : activeChallengeIdx === 2
                        ? "practice_3"
                        : "practice_4"
                  }
                  size={17}
                />
                <Text style={styles.assignmentHeaderLabel}>
                  {activePracticeDrill.difficultyLabel} · STAGE{" "}
                  {activeChallengeIdx + 1}/{totalChallengeStages}
                </Text>
              </View>
              <View style={styles.xpRewardPill}>
                <Text style={styles.xpRewardPillText}>+25 XP</Text>
              </View>
            </View>

            <View style={styles.missionObjectiveCallout}>
              <Text style={styles.missionObjectiveMicro}>
                PRACTICE MISSION BRIEF (NO LECTURE — PURE CODING)
              </Text>
              <FormattedText
                text={activePracticeDrill.assignment}
                style={styles.assignmentDescription}
              />
            </View>

            {usesClassSolutionWrapper && /\bpass\b/.test(userCode) && (
              <View style={styles.beginnerTipCard}>
                <Text style={styles.beginnerTipHeader}>
                  💡 USING CLASS SOLUTION &amp; SELF
                </Text>
                <FormattedText
                  text="1. **`class Solution:`** and **`self`** are just the test-runner wrapper—leave them as-is."
                  style={styles.beginnerTipLine}
                />
                <FormattedText
                  text="2. **Delete `pass`** and write your normal Python logic indented inside `def ...(self, ...):`."
                  style={styles.beginnerTipLine}
                />
              </View>
            )}

            {activePracticeDrill.constraints.length > 0 && (
              <View style={styles.checklistContainer}>
                <Text style={styles.checklistSectionTitle}>
                  MISSION REQUIREMENTS
                </Text>
                {activePracticeDrill.constraints.map((c, i) => {
                  const isStepPassed = allTestsPassed;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.missionRow,
                        isStepPassed && styles.missionRowPassed,
                      ]}
                    >
                      <View
                        style={[
                          styles.missionBulletBox,
                          isStepPassed && {
                            backgroundColor: StudioColors.lime,
                            borderColor: StudioColors.ink,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.missionBullet,
                            isStepPassed && { color: StudioColors.ink },
                          ]}
                        >
                          {isStepPassed ? "✓" : `0${i + 1}`}
                        </Text>
                      </View>
                      <FormattedText text={c} style={styles.missionText} />
                    </View>
                  );
                })}
              </View>
            )}

            {(!activePracticeDrill.examples ||
              activePracticeDrill.examples.length === 0) &&
            activePracticeDrill.expected_output ? (
              <View style={styles.targetOutputTerminal}>
                <View style={styles.targetOutputHeader}>
                  <Text style={styles.targetOutputHeaderLabel}>
                    EXPECTED RETURN VALUE (EXAMPLE 01)
                  </Text>
                  <Text style={styles.targetOutputMatchTag}>
                    RETURNED BY YOUR FUNCTION
                  </Text>
                </View>
                <Text style={styles.targetOutputCode}>
                  {activePracticeDrill.expected_output}
                </Text>
              </View>
            ) : null}
          </View>

          {(activePracticeDrill.examples &&
          activePracticeDrill.examples.length > 0
            ? activePracticeDrill.examples
            : activePracticeDrill.expected_output
              ? [
                  {
                    input: "Refer to starter function arguments in prompt",
                    output: activePracticeDrill.expected_output,
                  },
                ]
              : []
          ).map((ex, i) => (
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

          <GuidedScaffoldingCard
            selectedLesson={selectedLesson}
            lessonEnrichment={lessonEnrichment}
            activePracticeDrill={activePracticeDrill}
            userCode={userCode}
            onLoadScaffold={(scaffold) => onApplyScaffold?.(scaffold)}
          />

          {/* Quick Refresher Button back to Stage 1 Concept Guide if needed */}
          <Pressable
            onPress={() => {
              playKeyClick();
              onSelectChallengeIdx?.(0);
              onChangeActiveTab("problem");
            }}
            style={styles.quickConceptPeekBtn}
          >
            <Text style={styles.quickConceptPeekText}>
              📖 Forgot the syntax? Peek back at Stage 01 Concept &amp; Cheat
              Sheet →
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* 3-Mode Focused Tab Switcher (Stage 1 Core Lesson only — Learn First!) */}
          <View style={styles.tabBar}>
            <Pressable
              style={[
                styles.tabItem,
                activeTab === "problem" && styles.activeTabItem,
              ]}
              onPress={() => handleSwitchTab("problem")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "problem" && styles.activeTabText,
                ]}
              >
                01. 📖 LEARN &amp; TOOLS
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabItem,
                activeTab === "mission" && styles.activeMissionTabItem,
              ]}
              onPress={() => handleSwitchTab("mission")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "mission" && styles.activeTabText,
                ]}
              >
                02. 🎯 MISSION BRIEF
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabItem,
                activeTab === "visual" && styles.activeTabItem,
              ]}
              onPress={() => handleSwitchTab("visual")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "visual" && styles.activeTabText,
                ]}
              >
                03. 💾 MEMORY SIM
              </Text>
            </Pressable>
          </View>

      {activeTab === "problem" ? (
        <View style={styles.problemCard}>
          {/* 3-Style Explanation Card */}
          <View style={styles.conceptBox}>
            <View style={styles.conceptTopRow}>
              <Text style={styles.conceptLensMicro}>EXPLANATION LENS</Text>
              <View style={styles.explainStyleSwitcher}>
                {(
                  [
                    { id: "guide", label: "📖 FULL GUIDE" },
                    { id: "analogy", label: "💡 SIMPLE ANALOGY" },
                    { id: "cheatsheet", label: "⚡ CHEAT SHEET" },
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
                    🚀 WHY THIS MATTERS IN REAL APPS
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
                  Quick syntax pattern to reference while writing your solution:
                </Text>
                <View style={styles.codeBlockContainer}>
                  <View style={styles.codeBlockHeader}>
                    <Text style={styles.codeBlockLang}>
                      🐍 PYTHON SYNTAX PATTERN
                    </Text>
                  </View>
                  <Text style={styles.codeBlockText}>
                    {renderHighlightedPython(learnView.cheatSheetCode)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.analogyContainer}>
                <FormattedText
                  text={learnView.explanationText}
                  style={styles.problemText}
                />

                {!!learnView.singleExampleCode && (
                  <View style={styles.learnExampleSection}>
                    <View style={styles.learnExampleMetaRow}>
                      <View style={styles.learnExampleBadge}>
                        <StudioIcon name="terminal" size={14} />
                        <Text style={styles.learnExampleBadgeText}>
                          SIMPLE EXAMPLE
                        </Text>
                      </View>
                      <Text style={styles.learnExampleSub}>
                        Matches this lesson&apos;s concept
                      </Text>
                    </View>
                    <View style={styles.codeBlockContainer}>
                      <View style={styles.codeBlockHeader}>
                        <Text style={styles.codeBlockLang}>
                          🐍 CONCEPT IN ACTION
                        </Text>
                      </View>
                      <Text style={styles.codeBlockText}>
                        {renderHighlightedPython(learnView.singleExampleCode)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Common Pitfall Warning Card (Full Guide only — keeps Analogy and Cheat Sheet clean) */}
          {explainStyle === "guide" && lessonEnrichment?.commonPitfall && (
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

          {/* Inline Concept Check Quiz (Full Guide only) */}
          {explainStyle === "guide" && lessonEnrichment?.quiz && (
            <View style={styles.conceptCheckCard}>
              <View style={styles.conceptCheckHeader}>
                <View style={styles.conceptCheckBadge}>
                  <Text style={styles.conceptCheckBadgeText}>
                    ⚡ CONCEPT CHECK · QUICK RECALL
                  </Text>
                </View>
                <Text style={styles.conceptCheckStatus}>
                  {selectedQuizOpt === lessonEnrichment.quiz.correctIndex
                    ? "✓ VERIFIED"
                    : selectedQuizOpt !== null
                      ? "TRY AGAIN"
                      : "CHECK UNDERSTANDING"}
                </Text>
              </View>

              <Text style={styles.conceptCheckQuestion}>
                {lessonEnrichment.quiz.question}
              </Text>

              <View style={styles.conceptCheckOptions}>
                {lessonEnrichment.quiz.options.map((opt, oIdx) => {
                  const isChosen = selectedQuizOpt === oIdx;
                  const isCorrect =
                    oIdx === lessonEnrichment.quiz.correctIndex;
                  const showCorrect = isChosen && isCorrect;
                  const showWrong = isChosen && !isCorrect;
                  return (
                    <Pressable
                      key={oIdx}
                      style={[
                        styles.conceptCheckOptionBtn,
                        showCorrect && styles.conceptCheckOptionCorrect,
                        showWrong && styles.conceptCheckOptionWrong,
                      ]}
                      onPress={() => {
                        setQuizAnswerByLesson((prev) => ({
                          ...prev,
                          [selectedLesson.id]: oIdx,
                        }));
                        if (isCorrect) {
                          playSuccessChime();
                        } else {
                          playErrorBuzz();
                        }
                      }}
                    >
                      <Text style={styles.conceptCheckLetter}>
                        {String.fromCharCode(65 + oIdx)}.
                      </Text>
                      <Text style={styles.conceptCheckOptionText}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedQuizOpt !== null && (
                <View
                  style={[
                    styles.conceptCheckFeedback,
                    selectedQuizOpt === lessonEnrichment.quiz.correctIndex
                      ? styles.conceptCheckFeedbackCorrect
                      : styles.conceptCheckFeedbackWrong,
                  ]}
                >
                  <Text style={styles.conceptCheckFeedbackTitle}>
                    {selectedQuizOpt === lessonEnrichment.quiz.correctIndex
                      ? "✓ SPOT ON!"
                      : "✕ NOT QUITE — CHECK WHY:"}
                  </Text>
                  <Text style={styles.conceptCheckFeedbackText}>
                    {lessonEnrichment.quiz.explanation}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* High-Contrast Return to Mission CTA at Bottom of Learn Tab */}
          <Pressable
            style={({ pressed }) => [
              styles.jumpToMissionBannerBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={() => handleSwitchTab("mission")}
          >
            <View>
              <Text style={styles.jumpToMissionSubLabel}>
                READY TO WRITE YOUR SOLUTION?
              </Text>
              <Text style={styles.jumpToMissionMainText}>
                START CODING → OPEN MISSION BRIEF &amp; EXAMPLES
              </Text>
            </View>
            <View style={styles.xpRewardPill}>
              <Text style={styles.xpRewardPillText}>+50 XP</Text>
            </View>
          </Pressable>
        </View>
      ) : activeTab === "mission" ? (
        <View style={styles.problemCard}>
          <View style={styles.assignmentBox}>
            <View style={styles.missionCommandTopBar} />
            <View style={styles.assignmentHeaderRow}>
              <View style={styles.missionSticker}>
                <Text style={styles.assignmentHeaderLabel}>
                  🎯 MISSION COMMAND DECK
                </Text>
              </View>
              <View style={styles.xpRewardPill}>
                <Text style={styles.xpRewardPillText}>+50 XP</Text>
              </View>
            </View>

            <View style={styles.missionObjectiveCallout}>
              <Text style={styles.missionObjectiveMicro}>
                PRIMARY OBJECTIVE
              </Text>
              <FormattedText
                text={selectedLesson.assignment || selectedLesson.description}
                style={styles.assignmentDescription}
              />
            </View>

            {activeTrack === "python_basics" &&
              (selectedLesson.lesson_order ?? 99) <= 4 &&
              /\bpass\b/.test(userCode) && (
                <View style={styles.beginnerTipCard}>
                  <Text style={styles.beginnerTipHeader}>
                    💡 NEW TO PYTHON? 3 QUICK RULES FOR THE EDITOR
                  </Text>
                  <FormattedText
                    text="1. **Delete `pass`** inside `def ...:` and keep your code **indented by 4 spaces**."
                    style={styles.beginnerTipLine}
                  />
                  <FormattedText
                    text="2. Input names inside `( ... )` are **already created for you**—use them directly."
                    style={styles.beginnerTipLine}
                  />
                  <FormattedText
                    text="3. Use **`return`** (not `print`) to send back your answer, or tap **LOAD SKELETON** below for fill-in-the-blank (`___`) training wheels!"
                    style={styles.beginnerTipLine}
                  />
                </View>
              )}

            {usesClassSolutionWrapper && /\bpass\b/.test(userCode) && (
              <View style={styles.beginnerTipCard}>
                <Text style={styles.beginnerTipHeader}>
                  💡 USING CLASS SOLUTION &amp; SELF
                </Text>
                <FormattedText
                  text="1. **`class Solution:`** and **`self`** are just the test-runner wrapper—leave them as-is."
                  style={styles.beginnerTipLine}
                />
                <FormattedText
                  text="2. **Delete `pass`** and write your normal Python logic indented inside `def ...(self, ...):`."
                  style={styles.beginnerTipLine}
                />
              </View>
            )}

            {selectedLesson.constraints &&
              selectedLesson.constraints.length > 0 && (
                <View style={styles.checklistContainer}>
                  <Text style={styles.checklistSectionTitle}>
                    STEP-BY-STEP ACTION PLAN
                  </Text>
                  {selectedLesson.constraints.map((c, i) => {
                    const isStepPassed = allTestsPassed;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.missionRow,
                          isStepPassed && styles.missionRowPassed,
                        ]}
                      >
                        <View
                          style={[
                            styles.missionBulletBox,
                            isStepPassed && {
                              backgroundColor: StudioColors.lime,
                              borderColor: StudioColors.ink,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.missionBullet,
                              isStepPassed && { color: StudioColors.ink },
                            ]}
                          >
                            {isStepPassed ? "✓" : `0${i + 1}`}
                          </Text>
                        </View>
                        <FormattedText text={c} style={styles.missionText} />
                      </View>
                    );
                  })}
                </View>
              )}

            {(!selectedLesson.examples ||
              selectedLesson.examples.length === 0) &&
            selectedLesson.expected_output ? (
              <View style={styles.targetOutputTerminal}>
                <View style={styles.targetOutputHeader}>
                  <Text style={styles.targetOutputHeaderLabel}>
                    EXPECTED RETURN VALUE (EXAMPLE 01)
                  </Text>
                  <Text style={styles.targetOutputMatchTag}>
                    RETURNED BY YOUR FUNCTION
                  </Text>
                </View>
                <Text style={styles.targetOutputCode}>
                  {selectedLesson.expected_output}
                </Text>
              </View>
            ) : null}
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

          <GuidedScaffoldingCard
            selectedLesson={selectedLesson}
            lessonEnrichment={lessonEnrichment}
            userCode={userCode}
            onLoadScaffold={(scaffold) => onApplyScaffold?.(scaffold)}
          />

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
          key={selectedLesson.id}
          type={selectedLesson.visual_type || "memory"}
          data={selectedLesson.visual_data}
          lesson={selectedLesson}
          testResults={testResults}
          userCode={userCode}
          liveTraceResult={liveTraceResult}
          isTracing={isTracing}
          onRunLiveTrace={onRunLiveTrace}
          onTracedLineChange={onTracedLineChange}
        />
      )}
        </>
      )}
      {(Boolean(activePracticeDrill) || activeTab === "mission") && (
        <HintAccordion
          hints={
            activePracticeDrill
              ? activePracticeDrill.hints
              : selectedLesson.hints || []
          }
        />
      )}
    </View>
  );
}

