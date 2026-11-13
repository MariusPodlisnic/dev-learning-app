import React, { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LessonEnrichment } from "../constants/curriculum";
import { getLessonToolbox } from "../constants/curriculumData/lessonToolboxes";
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
import { playKeyClick } from "../utils/soundEffects";
import FormattedText from "./FormattedText";
import HintAccordion from "./HintAccordion";
import LessonToolboxCard from "./LessonToolboxCard";
import ProSolutionCard from "./ProSolutionCard";
import VisualLessonPanel from "./VisualLessonPanel";

interface LessonProblemPanelProps {
  selectedLesson: Lesson;
  activeTrack: string;
  completedLessons: Record<string, boolean>;
  activeTab: "problem" | "mission" | "visual";
  onChangeActiveTab: (tab: "problem" | "mission" | "visual") => void;
  explainStyle: ExplainStyle;
  onChangeExplainStyle: (style: ExplainStyle) => void;
  lessonEnrichment: LessonEnrichment | null;
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
  onLoadGuidedSteps,
  testResults,
  isPremium,
  onOpenPaywall,
}: LessonProblemPanelProps) {
  const styles = getStyles();
  const scrollRef = useRef<any>(null);
  const currentTrackTheme =
    TrackThemes[activeTrack] || TrackThemes.python_basics;
  const lessonTools = getLessonToolbox(selectedLesson);
  const actionSteps =
    selectedLesson.constraints && selectedLesson.constraints.length > 0
      ? selectedLesson.constraints
      : [
          selectedLesson.assignment || selectedLesson.description,
          selectedLesson.expected_output
            ? `Match expected output: ${selectedLesson.expected_output}`
            : "Test your logic in the editor and run all checks",
        ];

  function scrollToTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 0);
  }

  function handleSwitchTab(tab: "problem" | "mission" | "visual") {
    playKeyClick();
    onChangeActiveTab(tab);
    scrollToTop();
  }

  useEffect(() => {
    scrollToTop();
  }, [activeTab, selectedLesson.id]);

  return (
    <ScrollView
      ref={scrollRef}
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

      {/* Always-Visible Active Mission HUD Strip */}
      <Pressable
        style={({ pressed }) => [
          styles.missionHudStrip,
          activeTab === "mission" && styles.missionHudStripActive,
          pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
        ]}
        onPress={() =>
          handleSwitchTab(activeTab === "mission" ? "problem" : "mission")
        }
      >
        <View style={styles.missionHudLeft}>
          <View style={styles.missionHudTopBadges}>
            <View style={styles.missionHudTagPill}>
              <Text style={styles.missionHudTagText}>
                🎯 YOUR CODING MISSION
              </Text>
            </View>
            <View style={styles.missionHudXpPill}>
              <Text style={styles.missionHudXpText}>
                {selectedLesson.constraints?.length
                  ? `${selectedLesson.constraints.length} STEPS · +50 XP`
                  : "+50 XP"}
              </Text>
            </View>
          </View>
          <Text style={styles.missionHudGoalText} numberOfLines={2}>
            {(selectedLesson.assignment || selectedLesson.description).replace(
              /`/g,
              "",
            )}
          </Text>
        </View>

        <View style={styles.missionHudCtaBtn}>
          <Text style={styles.missionHudCtaText}>
            {activeTab === "mission"
              ? "← READ TOOLS"
              : "OPEN MISSION →"}
          </Text>
        </View>
      </Pressable>

      {/* 3-Mode Focused Tab Switcher */}
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
            01. LEARN & TOOLS
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
            03. MEMORY SIM
          </Text>
        </Pressable>
      </View>

      {activeTab === "problem" ? (
        <View style={styles.problemCard}>
          {/* Organized Action Plan: Suggests exactly what to do in this mission */}
          <View style={styles.actionPlanCard}>
            <View style={styles.actionPlanHeader}>
              <View style={styles.actionPlanSticker}>
                <Text style={styles.actionPlanStickerText}>
                  🧭 WHAT TO DO IN THIS MISSION
                </Text>
              </View>
              <Text style={styles.actionPlanCount}>
                {actionSteps.length} STEP{actionSteps.length === 1 ? "" : "S"}
              </Text>
            </View>

            <FormattedText
              text={selectedLesson.assignment || selectedLesson.description}
              style={styles.actionPlanGoal}
            />

            <View style={styles.actionStepsList}>
              {actionSteps.map((stepText, idx) => {
                const isDone = Boolean(testResults?.[idx]?.passed);
                return (
                  <View key={idx} style={styles.actionStepRow}>
                    <View
                      style={[
                        styles.actionStepNum,
                        isDone && styles.actionStepNumDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionStepNumText,
                          isDone && { color: StudioColors.ink },
                        ]}
                      >
                        {isDone ? "✓" : `0${idx + 1}`}
                      </Text>
                    </View>
                    <FormattedText
                      text={stepText}
                      style={styles.actionStepText}
                    />
                  </View>
                );
              })}
            </View>

            {selectedLesson.expected_output ? (
              <View style={styles.actionTargetChip}>
                <Text style={styles.actionTargetLabel}>TARGET OUTPUT:</Text>
                <Text style={styles.actionTargetText} numberOfLines={1}>
                  {selectedLesson.expected_output}
                </Text>
              </View>
            ) : null}

            {(lessonTools.length > 0 || lessonEnrichment?.guidedCode) && (
              <View style={styles.actionFooterRow}>
                {lessonTools.length > 0 && (
                  <Pressable
                    style={styles.actionToolChip}
                    onPress={() => {
                      playKeyClick();
                      onChangeExplainStyle("guide");
                    }}
                  >
                    <Text style={styles.actionToolChipText} numberOfLines={1}>
                      🧰 Tools:{" "}
                      {lessonTools
                        .map((t) => t.toolName.split("—")[0].trim())
                        .join(" · ")}{" "}
                      →
                    </Text>
                  </Pressable>
                )}

                {lessonEnrichment?.guidedCode && (
                  <Pressable
                    style={styles.actionStarterBtn}
                    onPress={() => {
                      if (lessonEnrichment.guidedCode) {
                        playKeyClick();
                        onLoadGuidedSteps(lessonEnrichment.guidedCode);
                      }
                    }}
                  >
                    <Text style={styles.actionStarterBtnText}>
                      🧩 Fill Guided Starter
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

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
              <View>
                <FormattedText
                  text={selectedLesson.content}
                  style={styles.problemText}
                />
                {/* Tools Needed & Variations live exclusively inside Full Guide */}
                <LessonToolboxCard
                  key={selectedLesson.id}
                  selectedLesson={selectedLesson}
                />
              </View>
            )}
          </View>

          {/* Common Pitfall Warning Card (Full Guide & Cheat Sheet only to keep Analogy uncluttered) */}
          {explainStyle !== "analogy" && lessonEnrichment?.commonPitfall && (
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

          {/* High-Contrast Jump to Mission CTA at Bottom of Learn Tab */}
          <Pressable
            style={({ pressed }) => [
              styles.jumpToMissionBannerBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={() => handleSwitchTab("mission")}
          >
            <View>
              <Text style={styles.jumpToMissionSubLabel}>
                READY TO CODE THIS MISSION?
              </Text>
              <Text style={styles.jumpToMissionMainText}>
                🎯 OPEN MISSION BRIEF & EXAMPLES →
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
                        playKeyClick();
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

            <View style={styles.missionObjectiveCallout}>
              <Text style={styles.missionObjectiveMicro}>
                PRIMARY OBJECTIVE
              </Text>
              <FormattedText
                text={selectedLesson.assignment || selectedLesson.description}
                style={styles.assignmentDescription}
              />
            </View>

            {selectedLesson.constraints &&
              selectedLesson.constraints.length > 0 && (
                <View style={styles.checklistContainer}>
                  <Text style={styles.checklistSectionTitle}>
                    STEP-BY-STEP ACTION PLAN
                  </Text>
                  {selectedLesson.constraints.map((c, i) => {
                    const isStepPassed = testResults?.[i]?.passed;
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
                          <Text style={styles.missionBullet}>
                            {isStepPassed ? "✓" : `0${i + 1}`}
                          </Text>
                        </View>
                        <FormattedText text={c} style={styles.missionText} />
                      </View>
                    );
                  })}
                </View>
              )}

            {selectedLesson.expected_output ? (
              <View style={styles.targetOutputTerminal}>
                <View style={styles.targetOutputHeader}>
                  <Text style={styles.targetOutputHeaderLabel}>
                    EXPECTED CONSOLE OUTPUT TARGET
                  </Text>
                  <Text style={styles.targetOutputMatchTag}>
                    MUST MATCH EXACTLY
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
    activeMissionTabItem: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    missionHudStrip: {
      backgroundColor: StudioColors.surface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderLeftWidth: 7,
      borderLeftColor: StudioColors.lime,
      padding: 12,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    missionHudStripActive: {
      borderLeftColor: StudioColors.yellow,
      backgroundColor: StudioColors.bg,
    },
    missionHudLeft: {
      flex: 1,
      minWidth: 200,
      gap: 4,
    },
    missionHudTopBadges: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    missionHudTagPill: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    missionHudTagText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    missionHudXpPill: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    missionHudXpText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    missionHudGoalText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 18,
    },
    missionHudCtaBtn: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 6,
    },
    missionHudCtaText: {
      color: StudioColors.lime,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    jumpToMissionBannerBtn: {
      backgroundColor: StudioColors.lime,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    jumpToMissionSubLabel: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
      opacity: 0.8,
    },
    jumpToMissionMainText: {
      color: StudioColors.ink,
      fontSize: 14,
      fontWeight: "900",
      fontFamily: MonoFont,
      marginTop: 2,
    },
    missionCommandTopBar: {
      height: 6,
      backgroundColor: StudioColors.lime,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      marginBottom: 12,
    },
    missionObjectiveCallout: {
      backgroundColor: StudioColors.bg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderLeftWidth: 4,
      borderLeftColor: StudioColors.ink,
      padding: 12,
      marginBottom: 14,
      gap: 4,
    },
    missionObjectiveMicro: {
      color: StudioColors.textSecondary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    checklistSectionTitle: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    missionRowPassed: {
      backgroundColor: "#ECFDF5",
      padding: 6,
      borderRadius: 6,
    },
    targetOutputTerminal: {
      marginTop: 14,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      overflow: "hidden",
    },
    targetOutputHeader: {
      backgroundColor: StudioColors.codeSurface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: StudioColors.codeBorder,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    targetOutputHeaderLabel: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    targetOutputMatchTag: {
      color: StudioColors.yellow,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    targetOutputCode: {
      color: StudioColors.codeText,
      fontSize: 13,
      fontWeight: "800",
      fontFamily: MonoFont,
      padding: 12,
      lineHeight: 20,
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
    actionPlanCard: {
      backgroundColor: StudioColors.surface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 16,
      marginBottom: 14,
      gap: 10,
      ...HardShadow,
    },
    actionPlanHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    actionPlanSticker: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
    },
    actionPlanStickerText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    actionPlanCount: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    actionPlanGoal: {
      color: StudioColors.textPrimary,
      fontSize: 13.5,
      fontWeight: "700",
      lineHeight: 20,
    },
    actionStepsList: {
      gap: 6,
    },
    actionStepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    actionStepNum: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 4,
      minWidth: 24,
      alignItems: "center",
      paddingVertical: 1,
      marginTop: 1,
    },
    actionStepNumDone: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    actionStepNumText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    actionStepText: {
      flex: 1,
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    actionTargetChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    actionTargetLabel: {
      color: StudioColors.yellow,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    actionTargetText: {
      flex: 1,
      color: StudioColors.codeText,
      fontSize: 12,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    actionFooterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 2,
    },
    actionToolChip: {
      flex: 1,
      minWidth: 150,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    actionToolChipText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    actionStarterBtn: {
      backgroundColor: StudioColors.violet,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 11,
      paddingVertical: 7,
      justifyContent: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    actionStarterBtnText: {
      color: StudioColors.ink,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
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
