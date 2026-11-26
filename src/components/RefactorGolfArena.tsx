import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import type { TestCaseResult } from "../types/lesson";
import { computePythonAutoEdit } from "../utils/editorHelpers";
import {
  evaluateRefactorSubmission,
  getMedalBadgeLabel,
  getRefactorHole,
  readRefactorGolfRecords,
  REFACTOR_GOLF_HOLES,
  type RefactorGolfRecordsMap,
  type RefactorHoleId,
  type RefactorStaticEvaluation,
  saveRefactorGolfRecord,
} from "../utils/refactorGolf";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";
import {
  classifyTypingKey,
  playMechanicalKeystroke,
} from "../utils/typingSounds";
import { StudioIcon, Text } from "./StudioIcon";

interface RefactorGolfArenaProps {
  pyodideReady: boolean;
  isPremium: boolean;
  onRequirePro: () => void;
  onVerifyRefactor: (
    userCode: string,
    harness: string,
  ) => Promise<{
    allPassed: boolean;
    results: TestCaseResult[];
    stdout: string;
    errorMessage?: string;
  }>;
  onAwardGolfXp: (xpEarned: number) => void;
}

export default function RefactorGolfArena({
  pyodideReady,
  isPremium,
  onRequirePro,
  onVerifyRefactor,
  onAwardGolfXp,
}: RefactorGolfArenaProps) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth > 0 && windowWidth < 800;

  const [activeId, setActiveId] = useState<RefactorHoleId>("two_sum_golf");
  const [records, setRecords] = useState<RefactorGolfRecordsMap>(() =>
    readRefactorGolfRecords(),
  );
  const [codeByHole, setCodeByHole] = useState<Record<RefactorHoleId, string>>(
    () => ({
      two_sum_golf: getRefactorHole("two_sum_golf").starterCode,
      dedupe_preserve_golf: getRefactorHole("dedupe_preserve_golf").starterCode,
      char_freq_golf: getRefactorHole("char_freq_golf").starterCode,
      anagram_bucket_golf: getRefactorHole("anagram_bucket_golf").starterCode,
      range_sum_golf: getRefactorHole("range_sum_golf").starterCode,
      missing_num_golf: getRefactorHole("missing_num_golf").starterCode,
    }),
  );
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradeOutcome, setGradeOutcome] = useState<{
    allPassed: boolean;
    results: TestCaseResult[];
    evaluation: RefactorStaticEvaluation;
    errorMessage?: string;
    xpEarned: number;
  } | null>(null);

  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const hole = getRefactorHole(activeId);
  const activeCode = codeByHole[activeId];
  const liveEval = useMemo(
    () => evaluateRefactorSubmission(activeCode, hole),
    [activeCode, hole],
  );
  const eaglesCount = useMemo(
    () =>
      Object.values(records).filter((r) => r && r.bestMedal === "eagle").length,
    [records],
  );
  const clearedCount = useMemo(
    () => Object.keys(records).length,
    [records],
  );

  function handleSelectHole(nextId: RefactorHoleId) {
    const target = getRefactorHole(nextId);
    if (target.isPro && !isPremium) {
      playKeyClick();
      onRequirePro();
      return;
    }
    playKeyClick();
    setActiveId(nextId);
    setShowHint(false);
    setGradeOutcome(null);
  }

  function handleCodeChange(nextText: string) {
    setCodeByHole((prev) => ({ ...prev, [activeId]: nextText }));
  }

  async function handleGradeSubmission() {
    if (isGrading) return;
    playKeyClick();
    setIsGrading(true);
    try {
      const verdict = await onVerifyRefactor(
        activeCode,
        hole.verificationHarness,
      );
      const evaluation = evaluateRefactorSubmission(activeCode, hole);
      let xpEarned = 0;

      if (verdict.allPassed) {
        const hadPrior = Boolean(records[activeId]);
        const hadEagle = records[activeId]?.bestMedal === "eagle";
        const updated = saveRefactorGolfRecord(
          activeId,
          evaluation.medal,
          evaluation.effectiveLines,
          evaluation.estimatedComplexity,
        );
        setRecords(updated);

        if (!hadPrior) {
          xpEarned =
            evaluation.medal === "eagle"
              ? hole.xpReward + 20
              : evaluation.medal === "birdie"
                ? hole.xpReward
                : Math.round(hole.xpReward * 0.6);
        } else if (!hadEagle && evaluation.medal === "eagle") {
          xpEarned = 25;
        }

        if (xpEarned > 0) {
          onAwardGolfXp(xpEarned);
        }
        if (evaluation.medal === "eagle") {
          playVictoryFanfare();
        } else {
          playSuccessChime();
        }
      } else {
        playErrorBuzz();
      }

      setGradeOutcome({
        allPassed: verdict.allPassed,
        results: verdict.results,
        evaluation,
        errorMessage: verdict.errorMessage,
        xpEarned,
      });
    } finally {
      setIsGrading(false);
    }
  }

  return (
    <ScrollView
      style={styles.pageScroll}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Course Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerTop}>
          <View style={styles.bannerTitleGroup}>
            <View style={styles.bannerIconBox}>
              <StudioIcon name="bolt" size={22} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerKicker}>
                CART-07 · CODE REFACTOR &amp; BIG-O GOLF
              </Text>
              <Text style={styles.bannerTitle}>
                Beat Time Complexity &amp; Line Par
              </Text>
            </View>
          </View>
          <View style={styles.bannerStatsRow}>
            <View style={styles.bannerStatPill}>
              <Text style={styles.bannerStatText}>
                ⛳ {clearedCount}/{REFACTOR_GOLF_HOLES.length} CLEARED
              </Text>
            </View>
            <View
              style={[
                styles.bannerStatPill,
                eaglesCount > 0 && { borderColor: StudioColors.yellow },
              ]}
            >
              <Text
                style={[
                  styles.bannerStatText,
                  eaglesCount > 0 && { color: StudioColors.yellow },
                ]}
              >
                🏆 {eaglesCount} EAGLES
              </Text>
            </View>
          </View>
        </View>

        {/* Course Hole Selector Bar */}
        <View style={styles.holesRow}>
          {REFACTOR_GOLF_HOLES.map((item) => {
            const isCurrent = item.id === activeId;
            const rec = records[item.id];
            const isLocked = item.isPro && !isPremium;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Select refactor hole ${item.title}`}
                style={({ pressed }) => [
                  styles.holePill,
                  isCurrent && [
                    styles.holePillActive,
                    { backgroundColor: item.accent },
                  ],
                  isLocked && styles.holePillLocked,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => handleSelectHole(item.id)}
              >
                <Text
                  style={[
                    styles.holePillText,
                    isCurrent && styles.holePillTextActive,
                  ]}
                >
                  {isLocked ? "🔒 " : `0${item.holeNumber} · `}
                  {item.shortTitle}
                  {rec
                    ? rec.bestMedal === "eagle"
                      ? " 🏆"
                      : rec.bestMedal === "birdie"
                        ? " ⭐"
                        : " ✓"
                    : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Main 2-Pane Golf Workbench */}
      <View style={[styles.grid, isNarrow && styles.gridColumn]}>
        {/* Left Pane: Scorecard, Live Complexity & Line Par Telemetry */}
        <View style={[styles.pane, styles.scorecardPane]}>
          <View style={styles.holeHeaderRow}>
            <View
              style={[styles.holeBadge, { backgroundColor: hole.accent }]}
            >
              <Text style={styles.holeBadgeText}>{hole.badge}</Text>
            </View>
            <Text style={styles.holeXpText}>+{hole.xpReward} XP</Text>
          </View>

          <Text style={styles.holeTitle}>
            Hole 0{hole.holeNumber}: {hole.title}
          </Text>
          <Text style={styles.holeSummary}>{hole.summary}</Text>

          {/* Bottleneck Note */}
          <View style={styles.bottleneckBox}>
            <Text style={styles.bottleneckLabel}>⚠ CURRENT BOTTLENECK</Text>
            <Text style={styles.bottleneckText}>{hole.bottleneckNote}</Text>
          </View>

          {/* Live Big-O & Line-Count Par Radar */}
          <View style={styles.radarGrid}>
            <View style={styles.radarCell}>
              <Text style={styles.radarKicker}>STARTER</Text>
              <Text style={[styles.radarValue, { color: StudioColors.coral }]}>
                {hole.starterComplexity}
              </Text>
            </View>
            <View
              style={[
                styles.radarCell,
                liveEval.meetsComplexityTarget && styles.radarCellPass,
              ]}
            >
              <Text style={styles.radarKicker}>YOUR CODE</Text>
              <Text
                style={[
                  styles.radarValue,
                  {
                    color: liveEval.meetsComplexityTarget
                      ? StudioColors.lime
                      : StudioColors.yellow,
                  },
                ]}
              >
                {liveEval.estimatedComplexity}
              </Text>
            </View>
            <View style={styles.radarCell}>
              <Text style={styles.radarKicker}>TARGET</Text>
              <Text style={[styles.radarValue, { color: StudioColors.mint }]}>
                {hole.targetComplexity}
              </Text>
            </View>
            <View
              style={[
                styles.radarCell,
                liveEval.meetsLinePar && styles.radarCellPass,
              ]}
            >
              <Text style={styles.radarKicker}>LINE PAR</Text>
              <Text
                style={[
                  styles.radarValue,
                  {
                    color: liveEval.meetsLinePar
                      ? StudioColors.lime
                      : StudioColors.yellow,
                  },
                ]}
              >
                {liveEval.effectiveLines}/{hole.parLines}
              </Text>
            </View>
          </View>

          {/* Helper Actions Row */}
          <View style={styles.helperRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle refactor optimization hint"
              style={({ pressed }) => [
                styles.helperBtn,
                showHint && styles.helperBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                setShowHint((prev) => !prev);
              }}
            >
              <Text
                style={[
                  styles.helperBtnText,
                  showHint && styles.helperBtnTextActive,
                ]}
              >
                {showHint ? "HIDE HINT" : "💡 OPTIMIZATION HINT"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Load optimal reference refactor"
              style={({ pressed }) => [
                styles.helperBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                handleCodeChange(hole.optimalCode);
              }}
            >
              <Text style={styles.helperBtnText}>✦ LOAD OPTIMAL</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset hole to slow starter code"
              style={({ pressed }) => [
                styles.helperBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                handleCodeChange(hole.starterCode);
                setGradeOutcome(null);
              }}
            >
              <Text style={styles.helperBtnText}>↺ RESET</Text>
            </Pressable>
          </View>

          {showHint ? (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{hole.hint}</Text>
            </View>
          ) : null}

          {/* Grading Verdict & Test Results */}
          {gradeOutcome ? (
            <View
              testID="refactor-grade-verdict"
              style={[
                styles.verdictCard,
                gradeOutcome.allPassed
                  ? styles.verdictCardPass
                  : styles.verdictCardFail,
              ]}
            >
              <View style={styles.verdictHeader}>
                <Text style={styles.verdictHeadline}>
                  {gradeOutcome.allPassed
                    ? gradeOutcome.evaluation.headline
                    : "✕ TESTS FAILED — FIX OUTPUT FIRST"}
                </Text>
                {gradeOutcome.allPassed ? (
                  <View style={styles.medalBadge}>
                    <Text style={styles.medalBadgeText}>
                      {getMedalBadgeLabel(gradeOutcome.evaluation.medal)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.verdictSub}>
                {gradeOutcome.errorMessage
                  ? gradeOutcome.errorMessage
                  : gradeOutcome.evaluation.coachingTip}
                {gradeOutcome.xpEarned > 0
                  ? ` (+${gradeOutcome.xpEarned} XP!)`
                  : ""}
              </Text>
              {gradeOutcome.results.length > 0 ? (
                <View style={styles.testRowsList}>
                  {gradeOutcome.results.map((r) => (
                    <View key={r.id} style={styles.testRow}>
                      <Text
                        style={[
                          styles.testRowIcon,
                          {
                            color: r.passed
                              ? StudioColors.lime
                              : StudioColors.coral,
                          },
                        ]}
                      >
                        {r.passed ? "✓" : "✕"}
                      </Text>
                      <Text style={styles.testRowText} numberOfLines={1}>
                        {r.input} → {r.actual}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Right Pane: Live Python 3.11 Golf Editor */}
        <View style={[styles.pane, styles.editorPane]}>
          <View style={styles.ideChrome}>
            <View style={styles.ideDots}>
              <View style={[styles.dot, { backgroundColor: "#FB7185" }]} />
              <View style={[styles.dot, { backgroundColor: "#FFDE59" }]} />
              <View style={[styles.dot, { backgroundColor: "#6EE7B7" }]} />
            </View>
            <Text style={styles.ideFilename}>
              hole_0{hole.holeNumber}_{hole.id}.py
            </Text>
            <View style={styles.ideBadge}>
              <Text style={styles.ideBadgeText}>
                {pyodideReady ? "PY 3.11 READY" : "LOADING PY..."}
              </Text>
            </View>
          </View>

          <TextInput
            accessibilityLabel="Refactor Golf Python code editor"
            style={styles.codeInput}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={activeCode}
            onChangeText={handleCodeChange}
            onSelectionChange={(e) => {
              selectionRef.current = e.nativeEvent.selection;
            }}
            onKeyPress={(e: any) => {
              const nativeEvt = e?.nativeEvent;
              const key = nativeEvt?.key || "";
              const metaOrCtrl = Boolean(
                nativeEvt?.metaKey || nativeEvt?.ctrlKey,
              );
              if (metaOrCtrl && key === "Enter") {
                e.preventDefault?.();
                void handleGradeSubmission();
                return;
              }
              if (!metaOrCtrl && !nativeEvt?.altKey) {
                const kind = classifyTypingKey(key);
                if (kind) playMechanicalKeystroke(kind);
              }
              if (Platform.OS === "web") {
                const autoEdit = computePythonAutoEdit({
                  code: activeCode,
                  selectionStart: selectionRef.current.start,
                  selectionEnd: selectionRef.current.end,
                  key,
                  shiftKey: Boolean(nativeEvt?.shiftKey),
                  metaOrCtrlKey: metaOrCtrl,
                  altKey: Boolean(nativeEvt?.altKey),
                });
                if (autoEdit) {
                  e.preventDefault?.();
                  selectionRef.current = {
                    start: autoEdit.selectionStart,
                    end: autoEdit.selectionEnd,
                  };
                  if (autoEdit.code !== activeCode) {
                    handleCodeChange(autoEdit.code);
                  }
                }
              }
            }}
          />

          <View style={styles.editorFooter}>
            <Text style={styles.editorFooterMeta}>
              LIVE PAR: {liveEval.effectiveLines}/{hole.parLines} LINES ·{" "}
              {liveEval.estimatedComplexity}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Grade and benchmark Python refactor"
              disabled={isGrading}
              style={({ pressed }) => [
                styles.gradeBtn,
                isGrading && { opacity: 0.65 },
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={handleGradeSubmission}
            >
              <Text style={styles.gradeBtnText}>
                {isGrading ? "GRADING..." : "▶ GRADE & BENCHMARK"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    pageScroll: {
      flex: 1,
    },
    pageContent: {
      padding: 16,
      gap: 14,
      maxWidth: 1220,
      width: "100%",
      alignSelf: "center",
      paddingBottom: 42,
    },
    bannerCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
      ...HardShadow,
    },
    bannerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },
    bannerTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
      minWidth: 220,
    },
    bannerIconBox: {
      width: 42,
      height: 42,
      borderRadius: 10,
      backgroundColor: "#FB923C",
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    bannerTextCol: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    bannerKicker: {
      color: "#FB923C",
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    bannerTitle: {
      color: colors.textPrimary,
      fontSize: 19,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    bannerStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    bannerStatPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    bannerStatText: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    holesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },
    holePill: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    holePillActive: {
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    holePillLocked: {
      opacity: 0.72,
    },
    holePillText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    holePillTextActive: {
      color: StudioColors.ink,
    },
    grid: {
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start",
    },
    gridColumn: {
      flexDirection: "column",
    },
    pane: {
      flex: 1,
      minWidth: 0,
      width: "100%",
    },
    scorecardPane: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
      ...HardShadow,
    },
    holeHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    holeBadge: {
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    holeBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    holeXpText: {
      color: StudioColors.lime,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    holeTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    holeSummary: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "600",
    },
    bottleneckBox: {
      backgroundColor: colors.bg,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: StudioColors.coral,
      padding: 10,
      gap: 4,
    },
    bottleneckLabel: {
      color: StudioColors.coral,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    bottleneckText: {
      color: colors.textSecondary,
      fontSize: 11.5,
      lineHeight: 17,
      fontWeight: "600",
    },
    radarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    radarCell: {
      flexGrow: 1,
      flexBasis: 100,
      backgroundColor: colors.bg,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 3,
    },
    radarCellPass: {
      borderColor: StudioColors.lime,
    },
    radarKicker: {
      color: colors.textMuted,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    radarValue: {
      fontSize: 14,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    helperRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },
    helperBtn: {
      backgroundColor: colors.bg,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    helperBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    helperBtnText: {
      color: colors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    helperBtnTextActive: {
      color: StudioColors.ink,
    },
    hintBox: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: StudioColors.yellow,
      padding: 10,
    },
    hintText: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
    },
    verdictCard: {
      borderRadius: 10,
      borderWidth: 2,
      padding: 12,
      gap: 8,
    },
    verdictCardPass: {
      backgroundColor: "rgba(110, 231, 183, 0.10)",
      borderColor: StudioColors.lime,
    },
    verdictCardFail: {
      backgroundColor: "rgba(251, 113, 133, 0.10)",
      borderColor: StudioColors.coral,
    },
    verdictHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    verdictHeadline: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    medalBadge: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    medalBadgeText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verdictSub: {
      color: colors.textSecondary,
      fontSize: 11.5,
      lineHeight: 17,
      fontWeight: "600",
    },
    testRowsList: {
      gap: 4,
    },
    testRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    testRowIcon: {
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    testRowText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontFamily: MonoFont,
      flex: 1,
    },
    editorPane: {
      backgroundColor: colors.codeBg,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      overflow: "hidden",
      ...HardShadow,
    },
    ideChrome: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.codeSurface,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.codeBorder,
      gap: 8,
    },
    ideDots: {
      flexDirection: "row",
      gap: 6,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    ideFilename: {
      color: colors.codeText,
      fontSize: 11,
      fontWeight: "800",
      fontFamily: MonoFont,
      flex: 1,
    },
    ideBadge: {
      backgroundColor: "#242A3D",
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    ideBadgeText: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeInput: {
      minHeight: 280,
      padding: 14,
      color: colors.codeText,
      fontFamily: MonoFont,
      fontSize: 13.5,
      lineHeight: 21,
      textAlignVertical: "top",
      ...Platform.select({ web: { outlineStyle: "none" as any } }),
    },
    editorFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      padding: 12,
      backgroundColor: colors.codeSurface,
      borderTopWidth: 1.5,
      borderBottomColor: colors.codeBorder,
      borderTopColor: colors.codeBorder,
    },
    editorFooterMeta: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    gradeBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 16,
      paddingVertical: 10,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    gradeBtnText: {
      color: StudioColors.ink,
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
  });
